# 你的第一个 Client Engine 小游戏 · Node.js

该文档帮助您快速上手，通过 Client Engine 实现一个剪刀石头布的猜拳小游戏。完成本文档教程后，您会对 Client Engine 的基础使用流程有初步的理解。

## 准备初始项目

这个小游戏分为服务端和客户端两部分，其中服务端使用 Client Engine 来实现，客户端则是一个简单的 Web 页面。在这个教程中我们着重教您一步一步写 Client Engine 中的代码，客户端的代码请您查看示例项目。

### Client Engine 项目
请先阅读 [Client Engine 快速入门：运行及部署项目](client-engine-quick-start-node.html) 获得初始项目，了解如何本地运行及部署项目。

`./src` 中主要源文件及用途如下：

```
├── configs.ts        // 配置文件
├── index.ts          // 项目入口
└── rps-game.ts       // RPSGame 类实现文件，Game 的子类，在这个文件中撰写了具体猜拳游戏的逻辑
```

您可以从 `index.ts` 文件入手来了解整个项目，该文件是项目启动的入口，它通过 express 框架定义了名为 `/reservation` 的 Web API，供客户端新开一局游戏时创建新的房间。

`rps-game.ts` 里面有本教程的全部代码。您可以选择备份一份 `rps-game.ts`，清空该文件后根据本文档撰写自己的代码，同时也可以查看已经写好的代码以做对比。


### 客户端项目
[点击下载客户端项目](https://github.com/leancloud/client-engine-demo-webapp)。**您需要在 `./src` 中的 `config.ts` 文件中配置自己的应用信息**，按照 README 启动应用后观察界面的变化。游戏相关的逻辑位于 `./src/components` 下的文件中，在有需要的时候您可以打开这里的文件查看代码。


## 核心流程

在实时对战服务中，房间的创建者为 MasterClient，因此在这个小游戏中，每一个房间都是由 Client Engine 管理的 MasterClient 调用实时对战服务相关的接口来创建的。Client Engine 中会有多个 MasterClient，每一个 MasterClient 管理着自己房间内的游戏逻辑。

这个小游戏的核心逻辑为：Client Engine 中的 MasterClient 及客户端玩家 Client 加入到同一个房间，在通信过程中由 MasterClient 控制游戏内的逻辑。具体拆解步骤如下：

1. 玩家客户端连接[实时对战服务](multiplayer.html)，向实时对战服务请求[随机匹配房间](multiplayer-guide-js.html#随机加入房间)。
2. 如果实时对战服务没有合适的房间，玩家客户端转而向 Client Engine 提供的 `/reservation` 接口请求房间。
3. Client Engine 每次收到请求后会根据情况准备 MasterClient 并创建房间，返回 roomName 给客户端。客户端通过 Client Engine 返回的 roomName 加入房间。
4. MasterClient 和客户端在同一房间内，每次客户端出拳时会将消息发送给 MasterClient，MasterClient 将消息转发给其他客户端，并最终判定游戏结果。
5. MasterClient 判定游戏结束，客户端离开房间，Client Engine 销毁游戏。


## 代码开发

### 自定义 Game
我们的目标是让 MasterClient 和客户端 Client 进入同一个房间，第一步在 Client Engine 中我们先准备好房间实例。在 Client Engine SDK 中，每一个房间都对应一个 `Game` 实例对象，每一个 `Game` 对象都对应一个自己的 MasterClient。接下来我们创建一个继承 `Game` 的子类 `RPSGame` ，在 `RPSGame` 中撰写猜拳小游戏的房间内逻辑。

在 `rpg-game.ts` 文件中初始化自定义的 RPSGame：

```js
import { Game } from "@leancloud/client-engine";
import { Event, Play, Room } from "@leancloud/play";
export default class RPSGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
  }
}
```

### 管理 Game
Client Engine SDK 中，`GameManger` 负责 `Game` 的创建及销毁，具体的原理及结构介绍请参考 [Client Engine 开发指南](client-engine-guide-node.html)。在这篇文档中，我们通过简单的配置就可以使用 `GameMnager` 的管理功能。在 `index.ts` 文件 new `gameManager` 的方法中可以看到，第一个参数已经传入了 `RPSGame`，如果您的自定义 `Game` 使用的是其他的名字，可以将 `RPSGame` 换成您自定义的 `Game` 类。

```js
import PRSGame from "./rps-game";
const gameManager = new SampleGameManager(
  RPSGame,
  APP_ID,
  APP_KEY,
  {concurrency: 2,},
).on(RedisLoadBalancerConsumerEvent.LOAD_CHANGE, () => debug(`Load: ${gameManager.load}`));
```

在这里配置完成后，`GameManager` 会在合适的时机创建并管理房间 `Game` 实例和对应的 MasterClient。


### 设定房间内玩家数量
在这个猜拳小游戏中，我们设定只允许两个玩家玩，满两个玩家后就不允许新的玩家再进入房间，可以这样设置 `Game` 的静态属性 `defaultSeatCount`：

```js
export default class RPSGame extends Game {
  public static defaultSeatCount = 2;
}
```
在这里配置完成后，Client Engine 初始项目每次请求实时对战服务创建房间时，都会根据这里的值限定房间内的玩家数量。


### MasterClient 及客户端进入同一房间

在完成 Game 的基础配置之后，MasterClient 和客户端就可以准备加入同一个房间了。Client Engine 初始项目的 `/reservation` 接口使用 `GameManager` 提供了准备 MasterClient 及创建新房间的功能，当客户端没有可以加入的房间时，可以调用该接口获得一个可以加入的新房间。该接口在这个小游戏中的使用场景如下：

客户端首先向实时对战服务发起[随机加入房间](multiplayer-guide-js.html#随机加入房间)请求，当加入失败且错误码为 [4301](multiplayer-error-code.html#4301) 时，调用 Client Engine 中的 `/reservation` 接口，获得 Client Engine 返回的 roomName 并加入房间。客户端示例代码如下：

**客户端调用接口示例代码（非 Client Engine）：**

```js
// 匹配房间
play.joinRandomRoom();
```

```js
// 加入房间失败后请求 Client Engine 创建房间
play.on(Event.ROOM_JOIN_FAILED, (error) => {
  if (error.code === 4301) {
    // 这里通过 HTTP 调用在 Client Engine 中实现的 `/reservation` 接口
    const { roomName } = await (await fetch(
      `${CLIENT_ENGINE_SERVER}/reservation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          playerId: play.userId,
        })
      }
    )).json();
    // 加入房间
    return play.joinRoom(roomName);
  } else {
    console.log(error);
  }
});

// 加入房间成功
play.on(Event.ROOM_JOINED, () => {
    // 在这里可以展示加入房间成功的 UI
});
```

在上面的代码中，当客户端调用 `play.joinRoom(roomName)` 并最终触发加入房间成功事件后，意味着客户端 Client 及 MasterClient 进入了同一个房间内，此时等待其他玩家使用 `play.joinRandomRoom()` 加入这个还有空位的房间，当房间人数足够时，就可以开始游戏了。

客户端项目中已经帮您写好了调用 `/reservation` 的代码，您可以在 `/src/components/Lobby.vue` 中查看相关代码。

### 宣布游戏开始

在这个小游戏中，人满后我们就可以开始游戏了。我们可以在 Game 的人满事件中宣布游戏开始：

```js
import { AutomaticGameEvent, Game, watchRoomFull } from "@leancloud/client-engine";
import { Event, Play, Room } from "@leancloud/play";

@watchRoomFull()
export default class RPSGame extends Game {
  public static defaultSeatCount = 2;
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
    // 监听 ROOM_FULL 事件，收到此事件后调用 `start() 方法`
    this.once(AutomaticGameEvent.ROOM_FULL, this.start);
  }

  protected start = async () => {
    // 标记房间不再可加入
    this.masterClient.setRoomOpened(false);
    // 向客户端广播游戏开始事件
    this.broadcast("game-start");
  }
}
```

在这段代码中，`watchRoomFull` 装饰器在人满时会使 `Game` 抛出 `AutomaticGameEvent.ROOM_FULL` 事件，在这个事件中我们选择调用自定义的 `start` 方法。在 `start` 方法中我们将房间关闭，然后向所有客户端广播游戏开始。

到了这一步，您可以启动当前 Client Engine 项目，启动客户端并开启两个客户端 Web 页面，在界面上点击「开始匹配」，可以观察到第一个点击「开始匹配」的界面显示出了日志：`xxxx 加入了房间`。

### 猜拳逻辑

接下来我们开始开发具体的游戏中逻辑。具体步骤分为以下几步：

1. 玩家 A 选择手势，发送出拳事件给 MasterClient。
2. MasterClient 收到事件，转发事件给玩家 B。
3. 玩家 B 收到 MasterClient 转发来的事件，界面展示：对方已选择。
4. 玩家 B 选择手势，发送出拳事件给 MasterClient。
5. MasterClient 收到事件，转发事件给玩家 A。
6. 玩家 A 收到 MasterClient 转发来的事件，界面展示：对方已选择。
7. MasterClient 发现双方都已经出拳，判断结果，公布答案并宣布游戏结束。

这三者之间的交互可以用这张图来表示：

![image](images/rps-game-flow.png)

接下来我们对每一步进行拆解并撰写代码：


#### 玩家 A 选择手势，发送出拳事件给 MasterClient
这一部分代码是客户端的，**不需要您写在 Client Engine 中**，您可以在客户端项目中 `./src/components/Game.vue` 找到相关代码。

```js
choices = ["✊", "✌️", "✋"];

// 当用户选择时，我们把对应选项的 index 发送给服务端
play.sendEvent( "play", {index}, {receiverGroup: ReceiverGroup.MasterClient});
```

#### MasterClient 收到事件，转发事件给玩家 B

这部分代码写在 Client Engine 中，您可以根据下方的示例代码写在自己的 `RPSGame` 中。我们在 `start` 方法中注册自定义事件，并在收到 `play` 事件后，将玩家 A 的动作内容抹去，转发给玩家 B。

```js
protected start = async () => {
  ......
  // 接收自定义事件
  this.masterClient.on(Event.CUSTOM_EVENT, ({ eventId, eventData, senderId }) => {
    if (eventId === "play") {
      // 收到其他玩家的事件，转发事件
      this.forwardToTheRests({ eventId, eventData, senderId }, (eventData) => {
        return {}
      })
    }
  });
}
```

在这段代码中，Game 中的 MasterClient 实例对象注册了实时对战服务的自定义事件，当玩家 A 发送 `play` 事件给 MasterClient 时，这个事件会被触发。我们在这个事件中使用了 `Game` 的转发事件方法 `forwardToTheRests()`，这个方法第一个参数是原始的事件，第二个参数是原始事件的 eventData 数据处理，我们将原始的 eventData 数据，也就是玩家 A 发来的 `{index}`，修改为空数据 `{}`，这样当玩家 B 收到事件后无法获知玩家 A 的详细动作。

#### 玩家 B 收到 MasterClient 转发来的事件，界面展示：对方已选择

这部分代码是客户端的，**不需要您写在 Client Engine 中**，您可以在客户端项目中 `./src/components/Game.vue` 找到相关代码。

```js
play.on(Event.CUSTOM_EVENT, ({ eventId, eventData, senderId }) => {
  ......
  switch (eventId) {
    ......
    case "play":
      this.log(`对手已选择`);
      break;
    .....
  }
});
```

#### 玩家 B 选择手势，发送出拳事件给 MasterClient
这部分逻辑和上文「玩家 A 选择手势，发送出拳事件给 MasterClient」相同，使用的也是相同部分的代码，您可以在客户端项目中 `./src/components/Game.vue` 找到相关代码。

#### MasterClient 收到事件，转发事件给玩家 A
这部分逻辑和上文「MasterClient 收到事件，转发事件给玩家 B」相同，使用的也是相同部分的代码，不需要再额外在 Client Engine 中写代码。

#### 玩家 A 收到 MasterClient 转发来的事件，界面展示：对方已选择
这部分逻辑和上文「玩家 A 收到 MasterClient 转发来的事件，界面展示：对方已选择」相同，使用的也是相同部分的代码，您可以在客户端项目中 `./src/components/Game.vue` 找到相关代码。

到这一步时，您可以运行项目，打开两个界面猜拳，观察双方的动作同步到各自的界面中，但各自分别不知道对方选了什么。

#### MasterClient 发现双方都已经出拳，判断结果，公布答案并宣布游戏结束

每次 MasterClient 收到玩家选择事件时，我们要把玩家的选择存起来，并判断两位玩家是不是都已经做出选择了：

```js
protected start = async () => {
  ......
  // [this.player[0] 的选择, this.player[1] 的选择]。当两个玩家都没有选择时，假定双方的选择都为 -1
  const choices = [-1, -1];

  this.masterClient.on(Event.CUSTOM_EVENT, ({ eventId, eventData, senderId }) => {
    if (eventId === "play") {
      // 收到其他玩家的事件，转发事件
      ......
      // 存储当前玩家的选择
      if (this.players[0].actorId === senderId) {
        // 如果是 player[0] 就存储到 choices[0]中
        choices[0] = eventData.index;
      } else {
        // 如果是 player[1] 就存储到 choices[1]中
        choices[1] = eventData.index;
      }
    }
  });
}
```

在上面这段代码中，我们构造了一个 Array 类型的 choice 来存储玩家的选择，当收到出拳事件时会将用户的选择存储起来，接下来我们判断两个玩家是不是都做出选择了，如果做出选择了则广播游戏结果，并广播游戏结束：

```js
protected start = async () => {
  ......
  // [this.player[0] 的选择, this.player[1] 的选择]。当两个玩家都没有选择时，假定双方的选择都为 -1
  const choices = [-1, -1];

  this.masterClient.on(Event.CUSTOM_EVENT, ({ eventId, eventData, senderId }) => {
    if (eventId === "play") {
      // 收到其他玩家的事件，转发事件
      ......
      // 存储当前玩家的选择
      ......
      // 检查两个玩家是不是都已经做出选择了
      if (choices.every((choice) => choice > 0)) {
        // 两个玩家都已经做出选择，游戏结束,向客户端广播游戏结果
        const winner = this.getWinner(choices);
        this.broadcast("game-over", {
          choices,
          winnerId: winner ? winner.userId : null,
        });
      } 
    }
  });
}

```

在上面的代码中，使用了 `getWinner()` 方法来获取游戏结果，这个是我们自定义的判断胜负的方法，您可以直接复制粘贴下方的代码到自己的 `RPSGame` 文件中：

```js
// 客户端的出拳数组为：[✊, ✌️, ✋]，
// 出 ✊ (index 为 0 )时，赢 ✌️（index 为 1），因此 wins[0] = 1，以此类推
const wins = [1, 2, 0];

@watchRoomFull()
export default class RPSGame extends Game {
  ......

  /**
   * 根据玩家的选择计算赢家
   * @return 返回胜利的 Player，或者 null 表示平局
   */
  private getWinner([player1Choice, player2Choice]: number[]) {
    if (player1Choice === player2Choice) { return null; }
    if (wins[player1Choice] === player2Choice) { return this.players[0]; }
    return this.players[1];
  }
}
```

客户端在收到 MasterClient 广播结束事件后在界面上做相应的结果展示。到这里基础逻辑都已经开发完成，您可以运行项目，打开两个页面，愉快的开始自己和自己的对战了。

### 离开房间
当所有客户端离开房间后，`GameManager` 会帮助我们把空房间销毁，因此在我们这个小游戏的代码中不需要再额外写这部分的代码。

### RxJS
当您查看示例 Demo 时，会发现代码和本文档中的代码相比更精简一些，原因是示例 Demo 中使用了 RxJS。如果您感兴趣，可以自行研究 [RxJS](https://rxjs-dev.firebaseapp.com/) 及相关接口的 [API 文档](https://leancloud.github.io/client-engine-nodejs-sdk/classes/game.html#takefirst)。

## 开发指南
当您按照本文档的说明一步一步开发出猜拳小游戏后，对 Client Engine SDK 和初始项目一定有了初步的感受，接下来您可以参考 [Client Engine 开发指南](client-engine-guide-node.html)更深入的了解整体结构及用法。
