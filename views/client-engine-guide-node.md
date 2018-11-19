# Client Engine 开发指南 · Node.js

## 初始项目
请先阅读 [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.html) 获得初始项目，了解如何本地运行及部署项目。您需要在[初始项目](https://github.com/leancloud/client-engine-nodejs-getting-started)的基础上开发您自己的游戏逻辑。

## 示例游戏逻辑
初始项目中写了一个非常简单的双人剪刀石头布游戏作为示例，主要逻辑为：Client Engine 负责向客户端分配可用的房间，客户端加入房间后，在房间内由 MasterClient 控制游戏内的逻辑：

1. 玩家客户端[连接](multiplayer-guide-js.html#连接)实时对战服务，向实时对战服务请求[随机匹配房间](multiplayer-guide-js.html#随机加入房间)。
2. 如果实时对战服务没有合适的房间，玩家客户端转而请求 Client Engine 提供的 `/reservation` 接口请求房间。
3. Client Engine 每次收到请求后会再次寻找可用的房间，如果没有可用的房间则创建一个新的 MasterClient ，MasterClient [连接](multiplayer-guide-js.html#连接)实时对战服务并[创建房间](multiplayer-guide-js.html#创建房间)，相关接口返回房间名称给客户端。
4. 客户端通过 Client Engine 返回的房间名称[加入房间](multiplayer-guide-js.html#加入房间)，MasterClient 和客户端在同一房间内通过[自定义属性](multiplayer-guide-js.html#自定义属性及同步)、[自定义事件](multiplayer-guide-js.html#自定义事件)等方式进行消息互动，完成对游戏逻辑的控制。
5. MasterClient 判定游戏结束，客户端离开房间，Client Engine 销毁游戏。

## 项目详解

### 项目结构

`./src` 中主要源文件及用途如下：

```
├── configs.ts        // 配置文件
├── index.ts          // 项目入口
└── rps-game.ts       // RPSGame 类实现文件，Game 的子类，在这个文件中撰写了具体猜拳游戏的逻辑
```

您可以从 `index.ts` 文件入手来了解整个项目，该文件是项目启动的入口，它通过 express 框架定义了名为 `/reservation` 的 Web API，供客户端新开一局游戏时调用。`/reservation` API 会调用 Client Engine SDK 中的 `GameManager` 的 `makeReservation()` 方法为指定的玩家分配一个可用的游戏房间并预留位置。

## Client Engine SDK
Client Engine 开发需要依赖专门的 Client Engine SDK，您可以通过[快速入门](client-engine-quick-start-node.md)安装依赖，下面我们重点看一下 SDK 提供的角色及相关生命周期：

### 角色
* **`Game` ：**负责游戏的具体逻辑，每个 Game 实例对应一个唯一的 Play Room 与 masterClient。具体的游戏必须继承自该类。
* **`GameManager` ：**负责创建并管理具体的 Game 对象。

### Game 生命周期
1. **创建：** `Game` 由 SDK 中的 `GameManager` 管理，`GameManager` 在有新的 `/reservation` 请求时会创建 `Game`。
2. **运行：** 创建后，`Game` 的控制权从 SDK 中 `GameManager` 移交给 `Game` 本身。从这个时刻开始，会有玩家陆续加入游戏房间。 
3. **销毁：** 所有玩家离开房间后，意味着游戏结束，`Game` 将控制权交回 `GameManager`，`GameManager` 做最后的清理工作，包括断开并销毁该房间的 masterClient、将 `Game` 从管理的游戏列表中删除等。

### Game 通用属性
在实现游戏逻辑的过程中，`Game` 类提供下面这些属性来简化常见需求的实现，您可以在继承 `Game` 的自己的类中方便的获得以下属性：

* `room` 属性：游戏对应的房间，这是一个 Play SDK 中的 Room 实例。
* `masterClient` 属性：游戏对应的 masterClient，这是一个 Play SDK 中的 Play 实例。
* `players` 属性：不包含 masterClient 的玩家列表。注意，如果您通过 Play SDK Room 实例的 `playerList` 属性获取的房间成员列表是包括 masterClient 的。

### Game 通用方法
Game 类在实时对战 SDK 的基础上封装了以下方法，使得 MasterClient 可以更便利的发送自定义事件：

* `broadcast()` 方法：向所有玩家广播自定义事件。示例代码请参考[广播自定义事件](#广播自定义事件)。
* `forwardToTheRests`() 方法：将一个用户发送的自定义事件转发给其他用户。示例代码请参考[转发自定义事件](#转发自定义事件)。

## 自定义游戏逻辑
您可以参考 `RPSGame` 来实现自己的游戏逻辑，具体实现方法请参考接下来的文档。

### 自定义 Game 类

您需要创建一个继承自 `Game` 的类来撰写自己的游戏逻辑，示例方法如下：

```js
import { Game } from "@leancloud/client-engine";
export default class SampleGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
  }
}
```

### 设置房间内玩家数量
这里的玩家数量指的是不包括 MasterClient 的玩家数量，根据实时对战服务的限制，最多不能超过 9 个人。

#### 默认玩家数量

`Game` 的 `defaultSeatCount` 静态属性可以指定默认的玩家数量。例如斗地主需要 3 个人才能玩，可以这样设置：

```js
export default class SampleGame extends Game {
  public static defaultSeatCount = 2; // 最大不能超过 9 
}
```

当房间内玩家数量达到 `defaultSeatCount` 时，[房间人满事件](#房间人满事件)会被触发。

#### 动态设置玩家数量

如果您的游戏需要的玩家数量在某个范围内，除了设置[默认玩家数量](#默认玩家数量)外，还需要使用 `minSeatCount` 静态属性限定最小玩家数量，`maxSeatCount` 静态属性设定最大玩家数量。例如三国杀要求至少 2 个人，最多 8 个人才能玩，默认 5 个人可以玩，可以这样设置：

```js
export default class SampleGame extends Game {
  public static minSeatCount = 2;
  public static maxSeatCount = 8; // 最大不能超过 9 
  public static defaultSeatCount = 5;
}
```

在[创建房间](#创建房间)的接口中，客户端可以指定 `seatCount` 参数来动态覆盖掉 `defaultSeatCount`，当房间内玩家数量达到 `seatCount` 时，[房间人满事件](#房间人满事件)会被触发。


### 创建房间
Client Engine 的 `/reservation` 接口提供了创建新房间的功能，当客户端没有可以加入的房间时，可以调用该接口获得一个可以加入的新房间。该接口在示例 Demo 中使用场景如下：

客户端首先向实时对战服务发起[加入房间](multiplayer-guide-js.html#加入房间)请求，当加入失败且错误码为 [4301](multiplayer-error-code.html#4301) 时，调用 Client Engine 中的 `/reservation` 接口，获得 Client Engine 返回的 roomName 并加入房间。客户端示例代码如下：

**客户端调用接口示例代码（非 Client Engine）：**

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
```

在这段客户端示例代码中，我们只传入了 `playerId`，除此之外 `/reservation` 接口中还接受 `createGameOptions` 作为 key 指定额外的参数：
* roomName（可选）：创建指定 roomName 的房间。例如您需要和好友一起玩时，可以用这个接口创建房间后，把 roomName 分享给好友。如果您不关心 roomName，可以不指定这个参数。
* roomOptions（可选）：通过这个参数，客户端在请求 Client Engine 创建房间时，可以设置 `customRoomProperties`，`customRoomPropertyKeysForLobby`，`visible`，对这三个参数的说明请参考[创建房间](multiplayer-guide-js.html#创建房间)。
* seatCount(可选)：创建房间时，指定本次游戏需要多少人，这个值需要在[动态设置玩家数量](#动态设置玩家数量)的 `minSeatCount` 和 `maxSeatCount` 之间。当房间人数达到指定的值时，[房间人满事件](#房间人满事件)会被自动触发。

例如当客户端希望 `/reservation` 创建一个带有匹配条件的新房间时，可以这样请求：

**客户端调用接口示例代码（非 Client Engine）：**

```js
const props = {
    level: 2,
};

const roomOptions = {
  customRoomPropertyKeysForLobby: ['level'],
  customRoomProperties: props,
};

const createGameOptions = {
  roomOptions
};

const { roomName } = await (await fetch(
  `${CLIENT_ENGINE_SERVER}/reservation`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      playerId: play.userId,
      createGameOptions
    })
})
```

**Client Engine 代码：**

您在 Client Engine 中无需撰写自己的 `/reservation` 接口，只需要在客户端使用即可。如果您对该接口的实现感兴趣，可以在 `index.ts` 中找到这个接口的代码。

### 房间内逻辑
客户端加入房间后，MasterClient 会收到[新玩家加入事件](multiplayer-guide-js.html#新玩家加入事件)，此时 MasterClient 和客户端就可以在同一房间内通信了。当房间人满时，初始项目提供的房间人满事件会被触发，MasterClient 广播游戏开始，客户端和 MasterClient 之间开始通信交互。当一局游戏完成后，客户端离开房间，游戏结束。

#### 加入房间事件
当客户端成功加入房间后，位于 Client Engine 的 MasterClient 会收到[新玩家加入事件](multiplayer-guide-js.html#新玩家加入事件)，如果您需要监听此事件，可以在自定义的 `Game` 中的 `constructor()` 方法中撰写监听的代码：

```js
import { Game } from "@leancloud/client-engine";
export default class SampleGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
    this.masterClient.on(Event.PLAYER_ROOM_JOINED, () => {
      console.log('有人来了');
    });
  }
}
```

#### 房间人满事件
当房间的人数满足[设置房间内玩家数量](#设置房间内玩家数量)的人满逻辑时，`watchRoomFull` 装饰器会让您收到 Game 抛出的 `AutomaticGameEvent.ROOM_FULL` 事件，您可以在这个事件中撰写相应的游戏逻辑，例如关闭房间，向客户端广播游戏开始：

```js

import { AutomaticGameEvent, Game, watchRoomFull } from "@leancloud/client-engine";

@watchRoomFull()
export default class SampleGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
    // 监听 ROOM_FULL 事件，收到此事件后调用 `start() 方法`
    this.once(AutomaticGameEvent.ROOM_FULL, this.start);
  }

  protected start = async () => {
    // 在这里撰写自己房间人满后的逻辑
    // 标记房间不再可加入
    this.masterClient.setRoomOpened(false);
    // 向客户端广播游戏开始事件
    this.broadcast("game-start");
  }
}
```

#### 广播自定义事件
在[房间人满事件](#房间人满事件)中，`Game` 向房间内所有成员广播了游戏开始：

```js
this.broadcast("game-start");
```

在广播事件时您还可以带有一些数据：

```js
const gameData = {someGameData};
//  'gameStart' 是自定义事件的名称
this.broadcast('game-start', gameData);
```

此时客户端的[接收自定义事件](multiplayer-guide-js.html#接收自定义事件)方法会被触发，如果发现是 `game-start` 事件，客户端在 UI 上展示对战开始。

#### 转发自定义事件
对战开始后，在示例 `RPSGame` 中，客户端 A 会将自己的操作（例如当前动作是剪刀）通过[自定义事件](multiplayer-guide-js.html#自定义事件)的方式发送给 MasterClient，MasterClient 在[收到这个操作事件](multiplayer-guide-js.html#接收自定义事件)后会告诉客户端 B 其他玩家已经操作了，但不告诉他玩家 A 具体是什么操作，此时可以使用 Game 提供的转发自定义事件方法 `forwardToTheRests()` 。您可以在这个方法中对事件内容做一些处理，隐藏掉 A 具体的动作，然后转发给房间内的其他玩家：

```js
this.forwardToTheRests(event, (eventData) => {
  // 准备要转发的数据
  const actUserId = event.senderId;
  const result = {actUserId};
  return result;
  // `someOneAct` 是自定义事件的名称
}, 'someOneAct')
```

MasterClient 发送该事件后，客户端 B 会[接收到该自定义事件](multiplayer-guide-js.html#接收自定义事件)，此时客户端 B 的页面上可以展现 UI 提示：`对手已选择`。

#### 客户端与服务端进行通信
除了上方初始项目提供的[广播自定义事件](#广播自定义事件)及[转发自定义事件](#转发自定义事件)外，您依然可以使用实时通信服务中的[自定义属性](multiplayer-guide-js.html#自定义属性及同步)、[自定义事件](multiplayer-guide-js.html#自定义事件)进行通信。


### 游戏结束
在示例 `RPSGame` 中，当客户端 B 也做出选择，通过[自定义事件](multiplayer-guide-js.html#自定义事件)将选择发送给 MasterClient 时，MasterClient 会判断输赢，并广播游戏结束事件。

当所有玩家都离开后，`Game` 的 `destroy()` 方法帮您自动销毁当前房间的 MasterClient。此时如果您没有其他的逻辑要做，则不需要关心这个方法，即游戏结束，如果您希望自己做一些清理工作，例如保存用户数据等，可以使用 `autoDestroy` 装饰器，这个装饰器会自动触发 `Game` 子类中的 `destroy()` 方法，您可以将相关逻辑写在这个方法中。

```js
import { autoDestroy, Game } from "@leancloud/client-engine";

@autoDestroy()
export default class SampleGame extends Game {
  protected destroy() {
    super.destroy();
    console.log('在这里可以做额外的清理工作');
  }
}

```
