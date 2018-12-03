# Client Engine 开发指南 · Node.js

请先阅读 [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.html) 及[你的第一个 Client Engine 小游戏](client-engine-first-game-node.html)来初步了解如何使用初始项目来开发游戏。本文档将在初始项目的基础上深入讲解 Client Engine SDK。


Client Engine 初始项目依赖了专门的 Client Engine SDK， Client Engine SDK 在实时对战 Play SDK 的基础上进行了封装，帮助您更好的撰写服务端游戏逻辑。您可以通过[快速入门](client-engine-quick-start-node.html)安装依赖。

## 角色
SDK 提供以下角色：

* **`Game` ：**负责房间内游戏的具体逻辑。Client Engine 维护了许多游戏房间，每一个游戏房间都是一个 Game 实例，即每个 Game 实例对应一个唯一的 Play Room 与 MasterClient。游戏房间内的逻辑由 Game 中的代码来控制，因此**房间内的游戏逻辑必须继承自该类**。
* **`GameManager` ：**负责创建、管理及分配具体的 Game 对象。SDK 中的 `GameManager` 已经帮您写好了默认的 Game 管理逻辑，您不需要再自己写代码管理 Game。

### GameManager

#### GameManager 实例化

`GameManager` 会帮您自动创建、管理并销毁 Game，因此在项目启动时，您需要实例化 `GameManager`。相关示例代码如下：

首先需要自定义一个 Class 继承自 `GameManager`，例如示例代码中的 `SampleGameManager`， 这个 Class 要实现 `consume()` 方法，这个 `consume()` 方法中要定义 `GameManager` 创建 `Game` 的方法 `makeReservation()`：

```js
class SampleGameManager<T extends Game> extends GameManager<T> {
  public async consume(playerId: string, options: ICreateGameOptions) {
    return this.makeReservation(playerId, options);
  }
}
```

在新建 `SampleGameManager` 的时候，需要在第一个参数内传入[自定义的 Game ](#实现自己的 Game)，这里使用的是[示例 Demo ](client-engine-first-game-node.html)猜拳游戏中的 `RPSGame`。

```js
import PRSGame from "./rps-game";

const gameManager = new SampleGameManager(
  PRSGame,
  APP_ID,
  APP_KEY,
  {
    concurrency: 2,
    // 如果要使用其他节点，暂时需要手动指定，该参数会在今后移除。
    // 需要先 import { Region } from "@leancloud/play";
    // region: Region.NorthChina,
  },
).on(RedisLoadBalancerConsumerEvent.LOAD_CHANGE, () => debug(`Load: ${gameManager.load}`));
```

接着我们要创建一个[负载均衡](#负载均衡)对象，然后将上面的 `gameManager` 对象作为第一个参数传入进去：

```js
const redisLB = new RedisLoadBalancer(
  gameManager,
  // 负载均衡使用的 redis url，请不要更改，使用时复制粘贴即可
  process.env.REDIS_URL__CLIENT_ENGINE,
  {
    // 负载均衡资源池 Id，请不要更改，使用时复制粘贴即可
    poolId: `${APP_ID.slice(0, 5)}-${process.env.LEANCLOUD_APP_ENV || "development"}`,
  },
);

```

当每次有客户端创建房间的请求进来时，我们要通过负载均衡将请求转发给 `GameManager`。在下面的示例代码中，当负载均衡对象 `redisLB` 调用 `consume()` 方法时，最终执行的逻辑是 `gameManager` 中的 `consume()` 方法。在  `gameManager` 的 `consume()` 方法中我们使用了 `makeReservation()` 来创建房间。

```js
const roomName = await redisLB.consume(playerId, createGameOptions);
```
#### 创建房间
在 [GameManager 实例化](#GameManager 实例化)这一节中，我们使用了 `GameManager` 的 `makeReservation()` 来创建房间。

`makeReservation()` 接受以下参数：

* playerId：发起请求的客户端在实时对战服务中的 [userId](multiplayer-guide-js.html#设置 userId)。
* createGameOptions（可选）：创建指定条件的房间。
  * roomName（可选）：创建指定 roomName 的房间。例如您需要和好友一起玩时，可以用这个接口创建房间后，把 roomName 分享给好友。如果您不关心 roomName，可以不指定这个参数。
  * roomOptions（可选）：通过这个参数，客户端在请求 Client Engine 创建房间时，可以设置 `customRoomProperties`，`customRoomPropertyKeysForLobby`，`visible`，对这三个参数的说明请参考[创建房间](multiplayer-guide-js.html#创建房间)。
  * seatCount(可选)：创建房间时，指定本次游戏需要多少人，这个值需要在[设置房间内玩家数量](#设置房间内玩家数量)的 `minSeatCount` 和 `maxSeatCount` 之间，否则 Client Engine 会拒绝创建房间。如果不指定，则以 `defaultSeatCount` 为准。

例如创建一个带有匹配条件的新房间时，可以这样调用 `makeReservation()`：

```js
// 您可以从客户端发来的请求中获得 playerId 和 createGameOptions 
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

gameManager.makeReservation(playerId, createGameOptions);
```

在[你的第一个 Client Engine 小游戏](client-engine-first-game-node.html)中，`index.ts` 的 `/reservation` 撰写了和 GameManager 相关的代码，如果没有自定义需求您可以直接使用示例 Demo 中的 `/reservation` 接口并传入以上参数。

### Game

#### Game 生命周期
1. **创建：** `Game` 由 SDK 中的 `GameManager` 管理，`GameManager` 会在收到创建房间的请求时根据情况创建 `Game`。
2. **运行：** 创建后，`Game` 的控制权从 SDK 中 `GameManager` 移交给 `Game` 本身。从这个时刻开始，会有玩家陆续加入游戏房间。 
3. **销毁：** 所有玩家离开房间后，意味着游戏结束，`Game` 将控制权交回 `GameManager`，`GameManager` 做最后的清理工作，包括断开并销毁该房间的 masterClient、将 `Game` 从管理的游戏列表中删除等。

#### Game 通用属性
在实现游戏逻辑的过程中，`Game` 类提供下面这些属性来简化常见需求的实现，您可以在继承 `Game` 的自己的类中方便的获得以下属性：

* `room` 属性：游戏对应的房间，这是一个 Play SDK 中的 Room 实例。
* `masterClient` 属性：游戏对应的 masterClient，这是一个 Play SDK 中的 Play 实例。
* `players` 属性：不包含 masterClient 的玩家列表。注意，如果您通过 Play SDK Room 实例的 `playerList` 属性获取的房间成员列表是包括 masterClient 的。

#### Game 通用方法
Game 类在实时对战 SDK 的基础上封装了以下方法，使得 MasterClient 可以更便利的发送自定义事件：

* `broadcast()` 方法：向所有玩家广播自定义事件。示例代码请参考[广播自定义事件](#广播自定义事件)。
* `forwardToTheRests()` 方法：将一个玩家发送的自定义事件转发给其他玩家。示例代码请参考[转发自定义事件](#转发自定义事件)。

#### 实现自己的 Game
实现自己的房间内游戏逻辑时，您需要创建一个继承自 `Game` 的类来撰写自己的游戏逻辑，示例方法如下：

```js
import { Game } from "@leancloud/client-engine";
export default class SampleGame extends Game {
  constructor(room: Room, masterClient: Play) {
    super(room, masterClient);
  }
}
```

#### 设置房间内玩家数量
这里的玩家数量指的是不包括 MasterClient 的玩家数量，根据实时对战服务的限制，最多不能超过 9 个人。

在 `Game` 中需要指定 `defaultSeatCount` 静态属性作为默认的玩家数量，Client Engine 会根据这个值向实时对战服务请求创建房间。例如斗地主需要 3 个人才能玩，可以这样设置：

```js
export default class SampleGame extends Game {
  public static defaultSeatCount = 3; // 最大不能超过 9 
}
```

如果您的游戏需要的玩家数量在某个范围内，除了设置 `defaultSeatCount` 外，还需要使用 `minSeatCount` 静态属性限定最小玩家数量，`maxSeatCount` 静态属性设定最大玩家数量。例如三国杀要求至少 2 个人，最多 8 个人才能玩，默认 5 个人可以玩，可以这样设置：

```js
export default class SampleGame extends Game {
  public static minSeatCount = 2;
  public static maxSeatCount = 8; // 最大不能超过 9 
  public static defaultSeatCount = 5;
}
```

在[创建房间](#创建房间)的接口中，可以将客户端 request 请求中的 `seatCount` 参数来动态覆盖掉 `defaultSeatCount`。

当房间人数达到 `seatCount` 时，您可以选择配置触发[房间人满事件](#房间人满事件)，如果您的客户端没有指定 `seatCount`，人满事件时将以 `defaultSeatCount` 的值为准。

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

此时客户端的[接收自定义事件](multiplayer-guide-js.html#接收自定义事件)方法会被触发，如果发现是 `game-start` 事件，客户端可以在 UI 上展示对战开始。

#### 转发自定义事件
MasterClient 可以转发某个客户端发来的事件给其他客户端，在转发时还可以处理数据：

```js
this.forwardToTheRests(event, (eventData) => {
  // 准备要转发的数据
  const actUserId = event.senderId;
  const result = {actUserId};
  return result;
  // `someOneAct` 是自定义事件的名称
}, 'someOneAct')
```
在这个代码中，`event` 参数是某个客户端发来的原始事件，`eventData` 是原始事件的数据，您可以在转发事件给其他客户端时处理该数据，例如抹去或增加一些信息。MasterClient 发送该事件后，客户端的[接收自定义事件](multiplayer-guide-js.html#接收自定义事件)会被触发。

#### MasterClient 与客户端通信
除了上方初始项目提供的[广播自定义事件](#广播自定义事件)及[转发自定义事件](#转发自定义事件)外，您依然可以使用实时对战服务中的[自定义属性](multiplayer-guide-js.html#自定义属性及同步)、[自定义事件](multiplayer-guide-js.html#自定义事件)进行通信。

除此之外，`Game` 还提供了以下 [RxJS](http://reactivex.io/rxjs) 方法方便您对事件进行流处理，进而精简自己的代码及逻辑：

* `getStream()` 方法：获取玩家发送的自定义事件的流，这是一个 RxJS 中的 Observable 对象。接口说明请参考 [API 文档](https://leancloud.github.io/client-engine-nodejs-sdk/classes/game.html#getstream)。
* `takeFirst()` 方法：获取玩家发送的指定条件的从现在开始算的第一条自定义事件的流，返回一个 RxJS 中的 Observable 对象。接口说明请参考 [API 文档](https://leancloud.github.io/client-engine-nodejs-sdk/classes/game.html#takefirst)。

注意，以上两个方法需要您了解 [RxJS](http://reactivex.io/rxjs) 才能使用，如果您不了解 [RxJS](http://reactivex.io/rxjs)，依然可以使用实时对战服务中的[事件方法](multiplayer-guide-js.html#自定义事件)进行通信。

#### 游戏结束

当所有玩家都离开后，`GameManager` 会自动帮您销毁当前房间及相关的 MasterClient。此时如果您没有其他的逻辑要做，则不需要关心本节文档。如果您希望自己做一些清理工作，例如保存用户数据等，可以使用 `autoDestroy` 装饰器，这个装饰器会在所有玩家离开后自动触发 `Game` 子类中的 `destroy()` 方法，您可以将相关逻辑写在这个方法中。

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

### 负载均衡

Client Engine 会根据整体实例负载的高低自动对实例数量进行调整，新的请求会均匀的分配给当前所有的实例。由于每局游戏一般都会需要持续一段时间，在新的实例启动后会将有一段时间各个实例的负载不均匀，为了让各实例的负载尽快达到均衡状态，Client Engine 提供了一个基于 Redis 的应用层负载均衡方案。

这个特性是由 SDK 提供的 `RedisLoadBalancer` 类实现。在 [GameManager 实例化](#GameManager 实例化)及[创建房间](#创建房间)中我们可以看到， 实际处理客户端的请求时与 `GameManager` 之间使用了一个 `RedisLoadBalancer` 作为代理。这意味着客户端所有的创建房间请求会交给 `RedisLoadBalancer`，`RedisLoadBalancer` 会将请求转交给 Client Engine 中负载最低的实例所持有的 `GameManager` 去处理。

需要特别指出的是，`RedisLoadBalancer` 只负责请求的转发，不关心如何处理请求。在 [GameManager 实例化](#GameManager 实例化)中可以看到，我们先写了一个子类 `SampleGameManager` 继承自 `GameManager`，并实现了它的 `consume()` 方法，然后将实例化的 `SampleGameManager` 传递给负载均衡 `RedisLoadBalancer`，当 `redisLB` 调用 `consume()` 方法时，会通过 `RedisLoadBalancer` 执行 `SampleGameManager` 中的 `consume()` 逻辑。

### API 文档

您可以在 API 文档中找到更多 SDK 的类、方法及属性说明，[点击查看 Client Engine SDK API 文档](https://leancloud.github.io/client-engine-nodejs-sdk/)。
