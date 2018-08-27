# 实时对战开发指南 &middot; JavaScript

## 前言

实时对战是一款基于 JavaScript 编写的游戏 SDK，它为有强联网需求的网络游戏提供了一整套的客户端 SDK 解决方案，因此开发团队不再需要自建服务端，从而节省大部分开发和运维成本。实时对战提供的主要功能如下：

- 获取房间列表
- 创建房间
- 加入房间
- 随机加入（符合条件的）房间
- 获取房间玩家
- 获取、设置、同步房间的属性
- 获取、设置、同步玩家的属性
- 发送和接收「自定义事件」
- 离开房间

## SDK 导入

请阅读 [安装](multiplayer-quick-start-js.html#安装)，获取 js 库文件。

## 初始化

首先实时对战 SDK 在内部实例化了一个 `Play` 类型的对象 `play`，我们只需要引入并使用即可。后文中的 `play` 都是指这个对象。

```javascript
import {
  // SDK 实例化的 play 对象
  play,
  // 连接节点区域
  Region,
  // Play SDK 事件常量
  Event,
  // 事件接收组
  ReceiverGroup,
  // 创建房间标志
  CreateRoomFlag,
} from '../play';
```

接着我们需要实例化一个对象作为初始化实时对战的参数。

```javascript
play.init({
	// 设置 APP ID
	appId: YOUR_APP_ID,
	// 设置 APP Key
	appKey: YOUR_APP_KEY,
	// 设置节点地区
	// EastChina：华东节点
	// NorthChina：华北节点
	// NorthAmerica：美国节点
	region: Region.EastChina
});
```

## 连接

### 设置 `userId`

我们需要设置一个 `userId` 作为客户端的唯一标识连接至服务器。

```javascript
play.userId = 'leancloud';
```

需要注意，这个 `userId` 有如下限制：
- 只允许英文、数字与下划线。
- 长度不能超过 32 字符
- 一个应用内全局唯一

### 建立连接

```javascript
play.connect();
```

如果需要通过版本号隔离玩家，可以通过以下接口连接。

```javascript
play.connect({ gameVersion: '0.0.1' });
```

`gameVersion` 表示客户端的版本号，如果允许多个版本的游戏共存，则可以根据这个版本号路由到不同的游戏服务器。

在连接成功后，会收到 `CONNECTED`（连接成功）事件；否则，将会收到 `CONNECT_FAILED`（连接失败）事件，回调参数 `error` 将包含失败原因。

```javascript
// 注册连接成功事件
play.on(Event.CONNECTED, () => {
	// TODO 可以做跳转场景等操作

});

// 注册连接失败事件
play.on(Event.CONNECT_FAILED, (error) => {
	// TODO 可以根据 error 提示用户失败原因

});
```

### 相关事件

| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| CONNECTED | 无 | 连接成功                                  |
| CONNECT_FAILED    | error  | 连接失败                                 |



## 大厅

我们鼓励您「不要」将玩家加入大厅，因为在大厅中，SDK 会拉取并同步一个很长的房间列表，由玩家选择一个房间进行游戏。这种方式不仅对玩家体验不友好，同时来会带来很大的带宽压力。

我们推荐您像现在的绝大部分手游一样，直接通过[房间匹配](#房间匹配) 方法，快速匹配开始游戏。

因此 SDK 默认情况下 autoJoinLobby 为 false，不需要加入大厅。

如果您有特殊的游戏场景需要获取房间列表，可以调用以下方法

```javascript
play.autoJoinLobby = true;
```

或手动加入

```javascript
play.joinLobby();
```

```javascript
// 注册成功加入大厅事件
play.on(Event.LOBBY_JOINED, () => {
	// TODO 可以做房间列表展示的逻辑

});
```

当玩家加入到大厅后，实时对战 SDK 会自动同步当前大厅的房间列表，开发者可以根据需求显示房间列表，或加入房间参与游戏。

开发者可以根据下面的接口获取房间列表。

```javascript
// 返回 LobbyRoom[]
play.lobbyRoomList;
```

更多关于 `LobbyRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/LobbyRoom.html)。

### 相关事件

| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| LOBBY_JOINED    | 无 | 加入大厅                         |
| LOBBY_LEFT   | 无  | 离开大厅 |
| LOBBY_ROOM_LIST_UPDATED | 无 | 大厅房间列表更新                                  |



## 房间匹配

房间，是指产生玩家「战斗交互」的单位。比如斗地主的牌桌、MMO 的副本、微信游戏的对战 等，广义上都属于房间的范畴。

玩家之间的战斗交互都是在房间内完成的。所以，玩家「如何进入房间」就成了房间匹配的关键。下面我们将从**创建房间**和**加入房间**两方面来分析一下常用的「房间匹配」功能。

### 创建房间

我们可以创建一个默认的房间。

```javascript
play.createRoom();
```

也可以创建一个包含参数的房间。

```javascript
// 房间的自定义属性
const props = {
	title: 'room title',
	level: 2,
};
const options = {
	// 房间不可见
	visible: false,
	// 房间空后保留的时间，单位：秒
	emptyRoomTtl: 300,
	// 允许的最大玩家数量
	maxPlayerCount: 2,
	// 玩家离线后，保留玩家数据的时间，单位：秒
	playerTtl: 300,
	customRoomProperties: props,
	// 用于做房间匹配的自定义属性键，即房间匹配条件为 level = 2
	customRoomPropertyKeysForLobby: ['level']
};
const expectedUserIds = ['world'];
play.createRoom({ 
	roomName,
	roomOptions: options, 
	expectedUserIds: expectedUserIds });
```

其中 `roomName`、`roomOptions` 和 `expectedUserIds` 这些参数都是可选参数。

#### roomName

房间名称必须保证唯一；如果不设置，则由服务端生成唯一房间 Id 并返回。

#### roomOptions

创建房间时的指定参数，包括：

- `opened`：房间是否开放。如果设置为 false，则不允许其他玩家加入。
- `visible`：房间是否可见。如果设置为 false，则不会出现在大厅的房间列表中，但是其他玩家可以通过指定「房间名称」加入房间。
- `emptyRoomTtl`：当房间中没有玩家时，房间保留的时间（单位：秒）。默认为 0，即 房间中没有玩家时，立即销毁房间数据。最大值为 300，即 5 分钟。
- `playerTtl`：当玩家掉线时，保留玩家在房间内的数据的时间（单位：秒）。默认为 0，即 玩家掉线后，立即销毁玩家数据。最大值为 300，即 5 分钟。
- `maxPlayerCount`：房间允许的最大玩家数量。
- `customRoomProperties`：房间的自定义属性。
- `customRoomPropertyKeysForLobby`：房间的自定义属性 `customRoomProperties` 中「键」的数组，包含在 `customRoomPropertyKeysForLobby` 中的属性将会出现在大厅的房间属性中（`play.lobbyRoomList`），而全部属性要在加入房间后的 `room.getCustomProperties()` 中查看。这些属性将会在匹配房间时用到。
- `flag`：创建房间标志位，包括是否固定 Master、只允许 Master 设置房间属性、只允许 Master 设置 Master。请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/global.html#CreateRoomFlag)。

#### expectedUserIds

指定的玩家 ID 数组。这个参数主要用于为某些能加入到房间中的特定玩家「占位」。

注意：这些「特定的玩家」并不会真地加入到房间里来，而只会在房间的「空位」上预留出位置，只允许「特定的玩家」加入。如果开发者要做「邀请加入」的功能，还需要通过其他途径，例如 IM、微信分享等将「房间名称」发送给好友，好友再通过 `joinRoom(roomName)` 接口加入房间。

更多关于 `createRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Play.html#createRoom)。

当玩家请求创建房间后，将有可能接收到 `ROOM_CREATED`（房间创建成功）或 `ROOM_CREATE_FAILED`（房间创建失败）事件。

```javascript
// 注册创建房间成功事件
play.on(Event.ROOM_CREATED, () => {
	// 房间创建成功

});

// 注册创建房间失败事件
play.on(Event.ROOM_CREATE_FAILED, (error) => {
	// TODO 可以根据 error 提示用户创建失败

});
```

注意：当房主创建好房间后会自动加入房间，所以也会收到 `ROOM_JOINED`（加入房间成功）事件。

### 加入房间

当房间创建好后，其他的玩家可以通过「加入房间」参与到游戏中。

#### 加入指定房间

通过指定「房间名称」加入房间。

```javascript
// 玩家在加入 'LiLeiRoom' 房间
play.joinRoom('LiLeiRoom');
```

在加入房间时，也可以为玩家占位。

```javascript
const expectedUserIds = ['LiLei', 'Jim'];
// 玩家在加入 'game' 房间，并为 hello 和 world 玩家占位
play.joinRoom('game', {
	expectedUserIds
});
```

注意：当房间空位小于「用户加入时的占位数量」时，会收到 `ROOM_JOIN_FAILED`（加入房间失败）事件。

更多关于 `joinRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Play.html#joinRoom)。

当玩家请求加入房间后，将有可能接收到 `ROOM_JOINED`（加入房间成功）或 `ROOM_JOIN_FAILED`（加入房间失败）事件。

```javascript
// 注册加入房间成功事件
play.on(Event.ROOM_JOINED, () => {
	// TODO 可以做跳转场景之类的操作

});

// 注册加入房间失败事件
play.on(Event.ROOM_JOIN_FAILED, () => {
	// TODO 可以提示用户加入失败，请重新加入

});
```

#### 随机加入房间

有时候，我们不需要加入指定某个房间，而是随机加入「符合某些条件的房间」（甚至可以是没有条件），比如快速开始、快速匹配等，这时我们可以通过调用 `joinRandomRoom` 方法随机加入房间。

```javascript
play.joinRandomRoom();
```

也可以为随机加入设置「条件」，例如随机加入到 level = 2 的房间。

```javascript
// 设置匹配属性
const matchProps = {
	level: 2,
};
play.joinRandomRoom({
	matchProperties: matchProps,
});
```

与 [加入指定房间](multiplayer-js.html#加入指定房间) 一样，我们也有可能接收到 `ROOM_JOINED`（加入房间成功）或 `ROOM_JOIN_FAILED`（加入房间失败）事件。

### 加入或创建指定房间

与 Master 先创建房间后其他人再加入的方式不同的是，有些游戏需要一些玩家加入到「同一个房间」，当房间不存在时，则创建房间，而不需要显示地指定 Master。这时我们可以通过 `joinOrCreateRoom()` 实现。

```javascript
// 例如，有 10 个玩家同时加入一个房间名称为 「room1」 的房间，如果不存在，则创建并加入
play.joinOrCreateRoom('room1');
```

更多关于 `joinOrCreateRoom`，请参考[ API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Play.html#joinOrCreateRoom)。

当调用这个接口后，只有**第一个**调用这个接口的玩家的请求会执行「创建房间」逻辑，而其他玩家的请求将会执行「加入房间」逻辑。所以，如果执行了创建房间逻辑，则会回调 `ROOM_CREATED`（创建房间成功）或 `ROOM_CREATE_FAILED`（创建房间失败）事件；如果执行了加入房间逻辑，则会回调 `ROOM_JOINED`（加入房间成功）或 `ROOM_JOIN_FAILED`（加入房间失败）事件。

### 新玩家加入事件

对于已经在房间的玩家，当有新玩家加入到房间时，会派发 `PLAYER_ROOM_JOINED`（新玩家加入）事件通知客户端，客户端可以通过新玩家的属性，做一些显示逻辑。

```javascript
// 注册新玩家加入事件
play.on(Event.PLAYER_ROOM_JOINED, (data) => {
	const { newPlayer } = data;
	// TODO 新玩家加入逻辑

});
```

可以通过 `play.room.playerList` 获取房间内的所有玩家。

### 离开房间

当玩家想要「主动」离开房间时，可以调用下面的接口。

```javascript
play.leaveRoom();
```

当玩家离开房间成功后，客户端会接收到 `ROOM_LEFT`（离开房间）事件。

```javascript
// 注册离开房间事件
play.on(Event.ROOM_LEFT, () => {
	// TODO 可以执行跳转场景等逻辑

});
```

而房间里的其他玩家将会接收到 `PLAYER_ROOM_LEFT`（有玩家离开房间）事件。

```javascript
// 注册有玩家离开房间事件
play.on(Event.PLAYER_ROOM_LEFT, (data) => {
	const { leftPlayer } = data;
	// TODO 可以执行玩家离开的销毁工作

});
```

### 相关事件

| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| ROOM_CREATED    | 无  | 创建房间                                 |
| ROOM_CREATE_FAILED   | error   | 创建房间失败                           |
| ROOM_JOINED    | 无 | 加入房间                         |
| ROOM_JOIN_FAILED   | error  | 加入房间失败 |
| PLAYER_ROOM_JOINED    | { newPlayer } | 新玩家加入房间                         |
| PLAYER_ROOM_LEFT   | { leftPlayer }  | 玩家离开房间 |
| MASTER_SWITCHED    | { player }  | Master 更换                                 |
| ROOM_LEFT   | 无   | 离开房间                           |



## 设置房间属性

### 设置房间是否开放

房主可以设置房间是否开放，当房间关闭时，不允许其他玩家加入。

```javascript
// 设置房间关闭
play.setRoomOpened(false);
```

### 设置房间是否可见

房主可以设置房间是否可见，当房间不可见时，这个房间将不会出现在玩家的大厅房间列表中，但是**其他玩家可以通过指定 roomName 加入**。

```javascript
// 设置房间不可见
play.setRoomVisible(false);
```

## MasterClient

为了不依赖于服务端而更快速地开发实时对战游戏，我们引入了 **MasterClient** 的概念，即承担「逻辑运算功能」的特殊客户端。

有以下几点需要注意：
1. 默认房间的创建者为 MasterClient。
2. 在游戏过程中，MasterClient 可以指定其他玩家作为新的 MasterClient。
3. 当 MasterClient 掉线后，服务器会指任一名新的玩家为 MasterClient。即使当原 MasterClient 恢复上线之后，也不会成为新的 MasterClient。

```javascript
// 通过玩家的 Id 指定 MasterClient
play.setMaster(newMasterId);
```

当 MasterClient 变化时，Play SDK 会派发 `MASTER_SWITCHED`（主机切换）事件通知客户端。

```javascript
// 注册主机切换事件
play.on(Event.MASTER_SWITCHED, (data) => {
	const { newMaster } = data;
	// TODO 可以做主机切换的展示

	// 可以根据判断当前客户端是否是 Master，来确定是否执行逻辑处理。
	if (play.player.isMaster()) {

	}
});
```

## 自定义属性及同步

为了满足开发者不同的游戏需求，实时对战 SDK 允许开发者设置「自定义属性」。自定义属性接口参数定义为 JavaScript 的 `Object` 类型，支持的数据类型包括：

- Boolean
- Number
- String
- Object
- Array

自定义属性同步的主要作用包括：

- 使每个客户端的数据保持一致。
- 自定义属性由服务端管理，当有玩家进入房间后，即可得到所有的自定义属性。

自定义属性又分为「房间自定义属性」和「玩家自定义属性」。

### 房间自定义属性

房间除了固有的属性外，还包括一个 `Object` 类型的自定义属性，比如战斗的回合数、所有棋牌等。

```javascript
// 设置想要修改的自定义属性
const props = {
	gold: 1000,
};
// 设置 gold 属性为 1000
play.room.setCustomProperties(props);
```

注意：这个接口并不是直接设置「客户端中自定义属性的内存值」，而是发送修改自定义属性的消息，由服务端最终确定是否修改。

当房间属性变化时，SDK 将派发 `ROOM_CUSTOM_PROPERTIES_CHANGED`（房间自定义属性）事件通知所有玩家客户端（包括自己）。

```javascript
// 注册房间属性变化事件
play.on(Event.ROOM_CUSTOM_PROPERTIES_CHANGED, (data) => {
	const props = play.room.getCustomProperties();
	const { gold } = props;
	// TODO 可以做属性变化的界面展示

});
```

注意：`changedProperties` 参数只表示增量修改的参数，不是「全部属性」。如需获得全部属性，请通过 `play.room.getCustomProperties()` 获得。

### 玩家自定义属性

玩家自定义属性与 [房间自定义属性](multiplayer-js.html#房间自定义属性) 基本一致。

```javascript
// 扑克牌对象
const poker = {
	// 花色
	flower: 1,
	// 数值
	num: 13,
};
const props = {
	nickname: 'Li Lei',
	gold: 1000,
	poker: poker,
};
// 请求设置玩家属性
play.player.setCustomProperties(props);
```

获取属性：

```javascript
// 注册玩家自定义属性变化事件
play.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, (data) => {
	// 结构事件参数
	const { player } = data;
	// 得到玩家所有自定义属性
	const props = player.getCustomProperties();
	const { title, gold } = props;
	// TODO 可以做属性变化的界面展示

});
```

### CAS

CAS 全称为 Compare And Swap，即「检测并更新」的意思，用于避免一些「并发问题」。

当调用 `setCustomProperties` 时，服务器会接收所有客户端提交的值，这无法满足某些场景下的需求。

比如，一个属性保存着这个房间的某件物品的持有者，即属性的 key 是物品，value 是持有者。
任何客户端都可以在任何时候设置这个属性，如果多个客户端同时调用，**服务端会将最后收到的调用作为最终的值**，这样通常是不符合逻辑的，一般来说，应该属于第一个获得的人。

`setCustomProperties` 有一个可选参数 `expectedValues` 可作为判断条件。服务器只会更新当前和 `expectedValues` 匹配的属性，使用过期的 `expectedValues` 的更新将会被忽略。

假设一个房间里有 10 名玩家，但是只有 1 把屠龙刀，屠龙刀只能被第一个「抢到」的人获得。

我们可以设置 `expectedValues` 中 `tulong` 值：

```javascript
const props = {
	tulong: X // X 分别表示当前的客户端
};
const expectedValues = {
	tulong: null // 屠龙刀当前拥有者
};
play.room.setCustomProperties(props, { expectedValues });
```

这样，在「第一个玩家」获得屠龙刀之后，`tulong` 对应的值为「第一个玩家」，后续的请求（`const expectedValues = {tulong: null}`）将会失败。

### 相关事件

| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| ROOM_CUSTOM_PROPERTIES_CHANGED    | { changedProps } | 房间自定义属性变化                         |
| PLAYER_CUSTOM_PROPERTIES_CHANGED   | { player, changedProps }  | 玩家自定义属性变化 |



## 自定义事件

在 [自定义属性](#自定义属性及同步) 中，我们介绍了如何根据游戏需求来自定义游戏的数据结构和数据类型。
但是，只有数据是不够的，开发者还需要自定义事件（协议）进行扩展。

### 发送自定义事件

我们可以通过「自定义事件」发送各种事件，比如游戏开始、抓牌、释放 X 技能、游戏结束等等。

```javascript
const options = {
	// 设置事件的接收组为 Master
	receiverGroup: ReceiverGroup.MasterClient,
	// 也可以指定接收者 actorId
	// options.targetActorIds: [1],
};
// 设置技能 Id
const eventData = {
	skillId: 123,
};
// 发送 eventId 为 skill 的事件
play.sendEvent('skill', eventData, options);
```

其中 `options` 是指事件发送参数，包括「接收组」和「接收者 ID 数组」。
- 接收组（ReceiverGroup）是接收事件的目标的枚举值，包括 Others（房间内除自己之外的所有人）、All（房间内的所有人）、MasterClient（主机）。
- 接收者 ID 数组是指接收事件的目标的具体值，即玩家的 `actorId` 数组。`actorId` 可以通过 `player.actorId` 获得。

注意：如果同时设置「接收组」和「接收者 ID 数组」，则「接收者 ID 数组」将会覆盖「接收组」。

### 接收自定义事件

我们通过注册 `CUSTOM_EVENT`（自定义事件），根据 `eventId`（事件 ID）来处理不同事件。

```javascript
// 注册自定义事件
play.on(Event.CUSTOM_EVENT, event => {
	// 解构事件参数
	const { eventId, eventData } = event;
	if (eventId === 'skill') {
		// 如果是 skill 事件，则 解构事件数据
		const { skillId, targetId } = eventData;
		// TODO 处理释放技能的表现

	}
});
```

`event` 参数

| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| eventId    | Number/String | 事件 Id，用于表示事件                         |
| eventData   | Object  | 事件参数 |
| senderId   | Number  | 事件发送者 Id（玩家的 actorId） |

## 断开连接

当游戏过程中，由于网络原因可能会断开连接，此时 SDK 会向客户端派发 `DISCONNECTED`（断开连接）事件，开发者可以根据需要注册并处理。

```javascript
// 注册断开连接事件
play.on(Event.DISCONNECTED, () => {
  // TODO 如果需要，可以选择重连

});
```

开发者也可以通过下面的接口断开连接。

```javascript
play.disconnect();
```

## 断线重连

有时候由于网路不稳定，可能导致玩家掉线，而我们希望能保留掉线玩家的数据，并在一段时间内等待掉线的玩家恢复上线。

针对这种情况，我们可以在创建房间时，通过 `playerTtl` 来设置「玩家掉线后的保留时间」，即 玩家掉线后，并不将玩家数据「立即销毁」，而是通过 `PLAYER_ACTIVITY_CHANGED` 事件通知客户端。
只要掉线玩家在 `playerTtl` 时间内重连并回到房间，则可以恢复游戏（玩家上线也是通过 `PLAYER_ACTIVITY_CHANGED` 事件通知）。
如果超过 `playerTtl` 时间，则会销毁玩家数据，并认为其离开房间。其他玩家会收到 `PLAYER_ROOM_LEFT` （玩家离开房间）事件。

```javascript
const options = {
	// 将 playerTtl 设置为 300 秒
	playerTtl: 300,
};
play.createRoom({
	roomOptions: options,
});
```

```javascript
// 注册玩家掉线 / 上线事件
play.on(Event.PLAYER_ACTIVITY_CHANGED, (data) => {
	const { player } = data;
	// 获得用户是否「活跃」状态
  	cc.log(player.isActive());
  	// TODO 根据玩家的在线状态可以做显示和逻辑处理
});
```

### 重新连接

不论是由于网络原因或者用户主动断开连接，都可以通过下面的接口重新连接至服务器。

```javascript
play.on(Event.DISCONNECTED, () => {
	// 重连
	play.reconnect();
});
```

注意：这个接口只是重新连接至服务器，如果之前在「房间内游戏」，并不会直接回到房间。如需重连并回到断线前的房间，请参考 [重连并回到房间](#重连并回到房间)。

### 回到房间

当玩家连接至大厅以后，可以通过此接口「再次回到某房间」。

```javascript
play.on(Event.DISCONNECTED, () => {
	// 重连
	play.reconnect();
});

play.on(Event.CONNECTED, () => {
	// TODO 根据是否有缓存的之前的房间名，回到房间。

	if (roomName) {
		play.rejoinRoom(roomName);
	}
});
```

如果房间存在并且玩家的 `ttl` 没到期，则其他玩家将会收到 `PLAYER_ACTIVITY_CHANGED` 事件。

```javascript
// 注册玩家在线状态变化事件
play.on(Event.PLAYER_ACTIVITY_CHANGED, (data) => {
	const { player } = data;
	// 获得用户是否「活跃」状态
  	cc.log(player.isActive());
	// TODO 根据玩家的在线状态可以做显示和逻辑处理

});
```

### 重连并回到房间

例如，在断线后，重连并回到房间。

```javascript
play.on(Event.DISCONNECTED, () => {
	// 重连并回到房间
	play.reconnectAndRejoin();
});

// 在加入房间后，更新数据和界面
play.on(Event.ROOM_JOINED, () => {
	// TODO 根据房间和玩家最新数据进行界面重构

});
```

这个接口相当于 `reconnect()` 和 `rejoin()` 的合并。通过这个接口，可以直接重新连接并回到「之前的房间」。



## 错误处理

在游戏过程中，可能会触发一些错误事件，开发者可以通过注册「错误事件」来处理。

```javascript
play.on(Event.Error, (err) => {
	const { code, detail } = err;
	// TODO 处理错误事件

});
```

更多接口及详情，请参考 [API 接口](https://leancloud.github.io/Play-SDK-JS/doc/)。
