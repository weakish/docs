# Client Engine 开发指南 · Node.js

## 初始项目
请先阅读 [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.md) 获得初始项目，了解其大致的逻辑、如何本地运行及部署项目。本文档在[初始项目](https://github.com/leancloud/client-engine-nodejs-getting-started)的基础上讲解如何开发您自己的游戏逻辑。

## 项目详解

### 项目结构
初始项目主要由下面的角色组成：

* **Game**：位于 `game.ts` 文件，负责游戏的具体逻辑。具体的游戏应该继承自该类，每个 Game 实例持有一个唯一的 Play Room 与对应的 masterClient。
  * **AutomaticGame**：位于 `automation.ts` 文件，继承自 `Game` ，提供了两种场景场景的便利调用：[房间人满]时开始某些逻辑、所有玩家离开后[销毁游戏]，这两个场景由 `Game` 类的装饰器工厂 `watchRoomFull` 与 `autoDestroy` 来实现，具体的实现方式请参考后面的文档[房间人满事件](#房间人满事件)及[游戏结束](#游戏结束)。
    * **RPSGame**：位于 `game.ts` 文件，是我们实现的猜拳游戏示例，继承自 `AutomaticGame`，您可以参考这个类来实现自己的房间内游戏逻辑。
* **GameManager**：负责 Game 的管理，为玩家分配 Game，以及已销毁游戏的回收。帮助 `index.ts` 对外提供`/reservation` API，负责帮新玩家创建一个空房间并返回房间名称给玩家。
* **index.ts**：是项目的入口。在这个模块里创建了一个 `RPSGame` 的 `GameManager` 实例，通过 express 为该实例提供 `/reservation` 在内的 HTTP API 供客户端调用。

您在撰写自己的游戏逻辑时，应当像 `RPSGame` 一样继承自 `Game` 类，**尽可能避免**对 `Game`、`AutomaticGame` 及 `GameManager`做任何改动，以避免出现任何无法解决的问题。

### Game 生命周期
1. **创建：** `Game` 由 `GameManager` 管理，当 `GameManager` 在有新的 `/reservation` 请求时会创建 `Game`。
2. **运行：** 创建后，`Game` 的控制权从 `GameManager` 移交给 `Game` 本身。从这个时刻开始，会有玩家陆续加入游戏房间。 
  * 如果 `Game` 应用了 `watchRoomFull` 装饰器，那么当游戏房间人满时，`Game` 会抛出 `AutomaticGameEvent.ROOM_FULL` 事件，标志了「房间人已满」。
3. **销毁：** 所有玩家离开房间后，意味着游戏结束，`Game` 将控制权交回 `GameManager`，`GameManager` 做最后的清理工作，包括断开并销毁该房间的 masterClient、将 `Game` 从管理的游戏列表中删除等。
  * 如果 `Game` 应用了 `autoDestroy` 装饰器，`Game` 会自动在所有玩家都离开房间后抛出 `GameEvent.END` 事件，如果您在此时有一些清理工作要做，可以写在该方法中，如果您没有任何工作要做，可以忽略不写此方法。

#### Game 通用属性
在实现游戏逻辑的过程中，Game 类提供下面这些属性来简化常见需求的实现，您可以在继承 `Game` 的自己的类中方便的获得以下属性：

* `room` 属性：游戏对应的房间，这是一个 Play SDK 中的 Room 实例。
* `masterClient` 属性：游戏对应的 masterClient，这是一个 Play SDK 中的 Play 实例。
* `players` 属性：不包含 masterClient 的玩家列表。注意，如果您通过 Play SDK Room 实例的 `playerList` 属性获取的房间成员列表是包括 masterClient 的。

#### Game 通用方法
Game 类在实时对战 SDK 的基础上封装了以下方法，使得 MasterClient 可以更便利的发送自定义事件：

* `broadcast()` 方法：向所有玩家广播自定义事件。示例代码请参考[广播自定义事件](#广播自定义事件)。
* `forwardToTheRests`() 方法：将一个用户发送的自定义事件转发给其他用户。示例代码请参考[转发自定义事件](#转发自定义事件)。

## 自定义游戏逻辑
下面从实际使用场景出发，以 `RPSGame` 为例，讲解如何使用初始项目实现自己的游戏逻辑。

### 连接服务器
Client Engine 托管了 N 个 MasterClient，每一个 MasterClient 都需要连接到实时对战服务，初始项目已经帮您处理了 MasterClient 的创建及连接，不需要您再自己写代码，如果您对实现方式感兴趣，可以自行阅读初始项目 `Game` 中的 `createNewGame()` 方法。

### 设置最大玩家数量
`Game` 提供了 playerLimit 静态属性配置每局游戏的最大玩家数量，默认为 2 个玩家对战，如果您需要改变最大玩家数量，例如像斗地主一样三个人才能开始游戏，可以在 `RPSGame` 中通过以下代码配置：

```js
export default class RPSGame extends AutomaticGame {
  // 最大不能超过 9
  public static playerLimit = 3;
}
```

需要注意的是，对于实时对战服务来说，一个房间限制为最多 10 个成员，并且MasterClient 也算做其中之一，而 `Game` 中的 playerLimit 是不包含 MasterClient 的成员数量，因此这里**最多只能设置为 9 个玩家**一起游戏。


### 玩家匹配
初始项目中的 `index.ts` 中的 `/reservation` 接口已经为您准备好了创建房间的逻辑，您可以这样使用此接口：

客户端首先向实时对战服务发起[匹配](multiplayer-guide-js.html#房间匹配)请求，当匹配时失败原因为 [4301](multiplayer-error-code.html#4301) 错误码时，调用 Client Engine 中的 `/reservation` 接口创建房间，该接口会返回 roomName 给客户端。客户端再通过 roomName [加入指定房间](multiplayer-guide-js.html#加入指定房间)。

**客户端**示例代码（非 Client Engine）：

```js
// 匹配房间
play.joinRandomRoom();
```

```js
// 匹配失败后请求 Client Engine 创建房间
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
          playerId: play.userId
        })
      }
    )).json();
    // 加入房间
    return play.joinRoom(roomName);
  } else {
    console.log(error);
  }
});
```

### 房间内游戏逻辑

#### 房间人满事件
如果您使用了 `watchRoomFull` 装饰器，当房间内的人数到达之前设置的[最大玩家数量](#设置最大玩家数量)的值时，会收到 Game 抛出的 `AutomaticGameEvent.ROOM_FULL` 事件，实现方式如下：

```js
import Game from "./game";
import {watchRoomFull, AutomaticGameEvent} from "./automation";

@watchRoomFull()
export default class NewGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
    // 监听 ROOM_FULL 事件，收到此事件后调用 `roomFull() 方法`
    this.once(AutomaticGameEvent.ROOM_FULL, () => this.roomFull());
  }

  protected async roomFull(): Promise<void> {
    // 在这里撰写自己房间人满后的逻辑
  }
}
```
您也可以像 `RPSGame` 一样继承自 `AutomaticGame` ，无需再写装饰器， `RPSGame` 中的 `onRoomFull()` 方法会被自动触发。

#### 监听人满之前的房间内事件
如果您需要在 `ROOM_FULL` 之前监听一些事件，例如[新玩家加入事件](multiplayer-guide-js.html#新玩家加入事件)，可以在自己 `Game` 类中的 `constructor()` 方法中可以写入相关代码：

```js
constructor(room: Room, masterClient: Play) {
  super(room, masterClient);
  this.masterClient.on(Event.PLAYER_ROOM_JOINED, () => {
    console.log('有人来了');
  });
}
```

#### 设置属性
MasterClient 设置[房间属性](multiplayer-guide-js.html#设置房间属性)、[自定义属性](multiplayer-guide-js.html#自定义属性及同步)的方式，请参考实时对战开发指南。

#### 自定义事件
MasterClient 发送[自定义事件](multiplayer-guide-js.html#自定义事件)，请参考实时对战开发指南。

#### 广播自定义事件
Game 类在自定义事件的基础上封装了广播事件 `broadcast()` 方法，这个方法可以把事件广播给房间内的所有人，在继承了 Game 的子类中可以这样使用：

```js
const gameData = {someGameData};
//  'gameStart' 是自定义事件的名称
this.broadcast('gameStart', gameData);
```
此时客户端的[接收自定义事件](multiplayer-guide-js.html#接收自定义事件)方法会被触发。

#### 转发自定义事件
MasterClient 接收客户端发给自己的[自定义事件](multiplayer-guide-js.html#接收自定义事件)时，可能需要对事件内容做一些处理，然后转发给房间内的其他玩家。您可以使用 Game 类提供的 `forwardToTheRests()` 来方便的实现：

```js
this.forwardToTheRests(event, (eventData) => { 
  const {score} = eventData;
  const result = {
    score,
    otherData
  };
  return result;
  // `result` 是自定义事件的名称
}, 'result')
```

### 游戏结束
`Game` 的 `destroy()` 方法帮您在所有玩家都离开房间后自动销毁当前房间的 MasterClient。如果您在所有玩家离开后，除了销毁 MasterClient 外没有其他的逻辑要做，则不需要关心这个方法，如果您还需要自定义一些逻辑，可以使用 `autoDestroy` 装饰器， `Game` 及其子类中的 `destroy()` 方法会被自动触发，您可以将相关逻辑写在 `destroy()` 中。

```js
import Game from "./game";
import {autoDestroy} from "./automation";

@autoDestroy()
export default class NewGame extends Game {
  protected destroy() {
    super.destroy();
    console.log('在这里可以做额外的清理工作');
  }
}

```
您也可以像 `RPSGame` 一样继承自 `AutomaticGame` ，无需再写装饰器， `RPSGame` 中的 `destroy()` 方法会被自动触发。