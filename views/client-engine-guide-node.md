# Client Engine 开发指南 · Node.js

## 初始项目
请先阅读[Client Engine 快速入门 · Node.js](client-engine-quick-start-node.md)获得初始项目，并了解如何本地运行及部署项目，本文档需要在初始项目的基础上进行开发。

## 实现您的游戏逻辑
初始项目中 `rps-game.ts` 中的 `RPSGame` 是我们实现的一个示例游戏类，你可以直接改动这个文件来实现自己的游戏逻辑，绝大部分游戏逻辑都应该写在这个文件中。

`RPSGame` 继承自 `AutomaticGame` 类， `AutomaticGame` 类继承自 `Game` 类。`Game` 负责具体的游戏逻辑，`AutomaticGame` 在这两种场景下会自动调用相关方法：房间人满及游戏销毁，因此 `RPSGame` 可以方便的使用 `Game` 及 `AutomaticGame` 的便利属性及方法。

每一个 `RPSGame` 实例都是一个房间内的游戏，下面从实际使用场景出发，以 `RPSGame` 为例说明如何使用初始项目。

### 连接服务器
初始项目已经帮您完成了这一步逻辑，不需要您在 Client Engine 中自己写代码，如果您对实现方式感兴趣，可以自行阅读初始项目中的代码。

### 设置最大玩家数量
`Game` 提供了 playerLimit 静态属性配置每局游戏的最大玩家数量，默认为 2 个玩家对战，如果您需要改变最大玩家数量，例如像斗地主一样三个人才能开始游戏，可以在 `RPSGame` 中通过以下代码配置：

```js
// 最大不能超过 9
public static playerLimit = 2;
```

需要注意的是，对于实时对战服务来说，MasterClient 也算做房间内的一个成员，这里 Client Engine 初始项目对成员进行了封装，`Game` 中的 playerLimit 为不包含 MasterClient 的成员数量，而实时对战服务一个房间限制为最多 10 个成员，因此这里**最多只能设置为 9 个玩家**一起游戏。


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
  }
});
```

### 房间内游戏逻辑

#### 获取实时对战中的实例对象

每个 Game 实例持有一个唯一的 Play Room 与对应的 MasterClient，同时提供了便利的属性，继承自 `Game` 类的 `RPSGame` 可以方便的使用这些属性：

* `masterClient` 属性：游戏对应的 MasterClient，这是一个 Play SDK 中的 Play 实例。
* `room` 属性：游戏对应的房间，这是一个 Play SDK 中的 Room 实例。
* `players` 属性：不包含 MasterClient 的玩家列表，列表中的每一个对象是 Play SDK 中的 Player 实例。注意，如果您通过 Play SDK Room 实例的 `playerList` 属性获取的房间成员列表是包括 masterClient 的。

#### 房间人满事件
当房间内的人数到达之前设置的[最大玩家数量](#设置最大玩家数量)的值时，RPSGame 中的 `onRoomFull()` 方法会被自动调用。如果您没有使用 `RPSGame`，可以将自己写的类继承 `AutomaticGame` ，自行实现的 `onRoomFull()` 方法也会被自动调用。

在 `onRoomFull()` 方法中，您可以撰写人满之后的相关事件及逻辑，例如接收自定义事件：

```js
protected async onRoomFull(): Promise<void> {
  this.masterClient.on(Event.CUSTOM_EVENT, event => {
    const eventId = event.eventId;
    if (eventId === 'someAction') {
        // Do something
    }
  });
}
```

#### 监听人满之前的房间内事件
如果您需要在 `onRoomFull()` 之前监听一些事件，例如[新玩家加入事件](multiplayer-guide-js.html#新玩家加入事件)，可以在 RPSGame 类中的 `constructor()` 方法中可以写入相关代码：

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
`AutomaticGame` 在所有玩家离开后，会自动调用 `Game` 的 `destroy()` 方法，这个方法会自动销毁当前房间的 MasterClient。如果您不需要在所有玩家离开房间后做一些操作，可以不写这个方法。如果您需要在所有玩家离开后自定义一些逻辑，可以在 `RPSGame` 中重写 `destroy()` 方法，这个方法会自动被调用：

```js
protected destroy() {
  super.destroy();
  console.log('在这里可以做额外的清理工作');
}
```

## 项目详解
[实现您的游戏逻辑](#实现您的游戏逻辑)中根据实际使用场景说明了如何使用 Client Engine 初始项目。如果您希望对初始项目的结构有进一步的了解，可以继续阅读这部分文档。

### 项目结构
Client Engine 的服务端主要由下面的角色组成：

* **Game**：位于 `game.ts` 文件，负责游戏的具体逻辑。具体的游戏应该继承自该类，每个 Game 实例持有一个唯一的 Play Room 与对应的 masterClient。
  * **AutomaticGame**：位于 `automation.ts` 文件，继承自 `Game` ，提供了 `onRoomFull()` 及 `destroy()` 的自动调用。建议您像 `RPSGame` 一样，直接继承该类完成自己的游戏逻辑。
    * `RPSGame`：位于 `game.ts` 文件，是我们实现的猜拳游戏示例，继承自 `AutomaticGame`，您可以直接修改这个文件完成您自己的游戏逻辑。
* **GameManager**：负责 Game 的管理，为玩家分配 Game，以及已销毁游戏的回收。帮助 `index.ts` 对外提供`/reservation` API，负责帮新玩家创建一个空房间并返回房间名称给玩家。
* **index.ts**：是项目的入口。在这个模块里创建了一个 `RPSGame` 的 `GameManager` 实例，通过 express 为该实例提供 `/reservation` 在内的 HTTP API 供客户端调用。

您在撰写自己的游戏逻辑时，应当在继承 `AutomaticGame` 的类中撰写自己的代码，**尽可能避免**对 `Game`、`AutomaticGame`及`GameManager`的文件做任何改动，以避免出现任何无法解决的问题。


### Game 生命周期
1. **创建：** `Game` 由 `GameManager` 管理的，当 `GameManager` 在有新的 `/reservation` 请求时会创建 `Game`。
2. **运行：** 创建后，`Game` 的控制权从 `GameManager` 移交给 `Game` 本身。从这个时刻开始，会有玩家陆续加入游戏房间。 
  * 如果 `Game` 应用了 `watchRoomFull` 装饰器，那么当游戏房间人满时，`Game` 会抛出 `AutomaticGameEvent.ROOM_FULL` 事件，标志了「房间人已满」。
  * 如果 `Game` 继承自 `AutomaticGame`，这时 `Game#onRoomFull()` 方法会被调用。在上面的文档中我们推荐您使用这种继承的方式，代码撰写会更简单。
3. **销毁：** 所有玩家离开房间后，意味着游戏结束，`Game` 将控制权交回 `GameManager`，`GameManager` 做最后的清理工作，包括断开并销毁该房间的 masterClient、将 `Game` 从管理的游戏列表中删除等。
  * 如果 `Game` 应用了 `autoDestroy` 装饰器或继承自 `AutomaticGame`，`Game` 会自动在所有玩家都离开房间后自动调用 `destroy()` 方法。在上面的文档中我们推荐您使用继承的方式来实现 `destroy()` 的自动调用，如果您在此时有一些清理工作要做，可以写在该方法中，如果您没有任何工作要做，可以忽略不写此方法。

### 自定义 Game
我们推荐您直接改动或参考 `RPSGame` 来实现自己的游戏逻辑，您也可以自行创建一个继承自 `AutomaticGame` 的类来撰写自己的游戏逻辑。

### Game API 文档
`Game` 提供了便利的属性及方法供您使用。除了本文档提到的内容外，您还可以查看详细的 [API 文档](https://client-engine-server.leanapp.cn/docs/classes/_game_.game.html)。

