# Play 开发指南 &middot; Cocos Creator

## 前言

Play 是一个基于 JavaScript 编写的 Cocos Creator 的插件，它具备如下几项主要的功能（包括但不限于）：

- 使用 UserID 建立与服务端的通信
- 获取房间列表
- 创建房间
- 加入房间
- 随机加入房间
- 根据匹配条件加入房间
- 设置房间属性
- 获取房间玩家（Player）列表
- 修改玩家的属性
- 发送和接收`自定义事件`
- 离开房间

> Play 为有强联网需求的网络游戏提供了一整套的客户端 SDK 解决方案，因此开发团队不再需要自建服务端，从而节省大部分开发和运维成本。



## SDK 导入和初始化

请阅读 [安装和初始化](play-cocos-quick-start.html#安装)，获取 js 库文件。



## 设置 userId

Play 目前只需要客户端设置一个 `UserID` 就可以直接连接云端，这个 `UserID` 拥有如下限制：

- 不支持中文和特殊字符（包括 `，！@#￥%……&*（）` 等），但可以是下划线 `_`
- 长度不能超过 64 字符
- 一个应用内全局唯一

```javascript
play.userId = 'leancloud';
```



## 连接

```javascript
/**
* 建立连接
* @param {Object} opts （可选）连接选项
* @param {string} opts.gameVersion （可选）游戏版本号，不同的游戏版本号将路由到不同的服务端，默认值为 0.0.1
*/
connect({ gameVersion = '0.0.1' } = {})
```

- `gameVersion` 表示客户端的版本号，如果允许多个版本的游戏共存，则可以根据这个版本号路由到不同的游戏服务器，相当于给玩家按版本做隔离。如果没有类似需求，请忽略这个参数。

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



## 大厅

在连接服务器成功之后，如果没有在 `PlayOptions` 中设置 `autoJoinLobby`（请参考：[PlayOptions](https://leancloud.github.io/Play-SDK-JS/doc/PlayOptions.html)），默认会自动加入到大厅中。

开发者可以根据需要注册 `JOINED_LOBBY`（加入大厅成功）事件。

```javascript
// 注册加入大厅事件
play.on(Event.JOINED_LOBBY, () => {
	// TODO 可以做跳转场景，房间列表展示的逻辑

});
```

当玩家加入到大厅后，Play SDK 会自动同步当前大厅的房间列表，开发者可以根据房间列表显示 / 加入房间参与游戏。

如果设置了 `autoJoinLobby = false`，则需要自行加入大厅和离开大厅。

```javascript
/**
* 加入大厅，只有在 autoJoinLobby = false 时才需要调用
*/
joinLobby()
```

如果开发者需要手动离开大厅，可以调用下面的接口。

```javascript
/**
* 离开大厅
*/
leaveLobby()
```

当手动离开大厅后，可以通过注册 `LEFT_LOBBY`（离开大厅）事件，编写逻辑。

```javascript
// 注册离开大厅事件
play.on(Event.LEFT_LOBBY, () => {

});
```



## 房间匹配

房间，是指产生玩家`战斗交互`的单位。比如 斗地主的牌桌，MMO 的副本，微信游戏的 PVP 等，广义上都属于房间的范畴。

玩家之间的战斗交互都是在房间内完成的。
所以，玩家`如何进入房间`就成了房间匹配的关键，下面我们将从`创建房间`，`加入房间`两方面来分析一下常用的`房间匹配`功能。

### 创建房间

```javascript
/**
* 创建房间
* @param {string} roomName 房间名称，在整个游戏中保证唯一
* @param {Object} opts （可选）创建房间选项
* @param {RoomOptions} opts.roomOptions （可选）创建房间选项，默认值为 null
* @param {Array.<string>} opts.expectedUserIds （可选）邀请好友 ID 数组，默认值为 null
*/
createRoom(roomName, { roomOptions = null, expectedUserIds = null } = {})
```

创建房间时需要指定`唯一的房间名称`（其他玩家可以通过房间名称加入到房间）。除此之外，还可以指定 `roomOptions` 和 `expectedUserIds`。

#### roomOptions

创建房间时的指定参数，包括

- opened：房间是否打开。如果设置为 false，则不允许其他玩家加入。
- visible：房间是否可见。如果设置为 false，则不会出现在大厅的房间列表中，但是其他玩家可以通过指定`房间名称`加入房间。
- emptyRoomTtl：当房间中没有玩家时，房间保留的时间。默认为 0，即 房间中没有玩家时，立即销毁房间数据。
- playerTtl：当玩家掉线时，保留玩家房间数据的时间。默认为 0，即 玩家掉线后，立即销毁玩家数据。
- maxPlayerCount：房间允许的最大玩家数量。
- customRoomProperties：房间的自定义属性。
- customRoomPropertiesKeysForLobby：房间的自定义属性`键值`数组，将用于房间匹配。这里的键值数组应该属于 `customRoomProperties`。

#### expectedUserIds

指定的玩家 ID 数组，这个参数主要用于：为某些能加入到房间中的特定玩家`占位`。

注意：这些`特定的玩家`并不会真的加入到房间里来，而只会在房间的`空位`上预留出位置，只允许`特定的玩家`加入。
如果开发者要做`邀请加入`的功能，还需要通过其他途径（例如 IM，微信分享等）将`房间名称`发送给好友，好友再通过 `joinRoom(roomName)` 接口加入房间。

当玩家请求创建房间后，将有可能接收到 `CREATED_ROOM`（房间创建成功）和 `CREATE_ROOM_FAILED`（房间创建失败）的事件。

```javascript
// 注册创建房间成功事件
play.on(Event.CREATED_ROOM, () => {
	// 房间创建成功

});

// 注册创建房间失败事件
play.on(Event.CREATE_ROOM_FAILED, () => {
	// TODO 可以跳转至房间场景

});
```

注意：当房主创建好房间后，还会立即回调 `JOINED_ROOM`（加入房间成功）事件。

### 加入房间

当房间创建好后，其他的玩家可以通过`加入房间`参与到游戏中。

#### 加入指定房间

通过指定`房间名称`加入房间，`expectedUserIds` 为可选参数，可用于玩家位置预留。

```javascript
/**
* 加入房间
* @param {string} roomName 房间名称
* @param {*} expectedUserIds （可选）邀请好友 ID 数组，默认值为 null
*/
joinRoom(roomName, { expectedUserIds = null } = {})
```

- `roomName` 是指唯一的房间名称。
- `expectedUserIds` 是指特定的玩家 ID 数组

当玩家请求加入房间后，将有可能接收到 `JOINED_ROOM`（加入房间成功）和 `JOIN_ROOM_FAILED`（加入房间失败）的事件。

```javascript
// 注册加入房间成功事件
play.on(Event.JOINED_ROOM, () => {
	// TODO 可以做跳转场景之类的操作

});

// 注册加入房间失败事件
play.on(Event.JOIN_ROOM_FAILED, () => {
	// TODO 可以提示用户加入失败，请重新加入

});
```

#### 随机加入房间

有时候，我们不需要加入指定某个房间，而是随机加入`符合某些条件的房间`（甚至可以是没有条件），比如 快速开始，快速匹配 等。
这时我们可以通过调用下面的接口随机加入房间。

```javascript
/**
* 随机加入房间
* @param {Object} opts （可选）随机加入房间选项
* @param {Object} opts.matchProperties （可选）匹配属性，默认值为 null
* @param {Array.<string>} opts.expectedUserIds （可选）邀请好友 ID 数组，默认值为 null
*/
joinRandomRoom({ matchProperties = null, expectedUserIds = null } = {})
```

- `matchProperties` 是 JavaScript 的 `Object` 类型，表示匹配属性（可以是多个）。
- `expectedUserIds` 是指指定的玩家 ID 数组，同[加入房间](play-cocos.html#加入指定房间)。

比如，我们可以创建一个`要求等级为 2 的房间`。

```javascript
const options = new RoomOptions();
const props = {
	level: 2,
};
options.customRoomProperties = props;
options.customRoomPropertiesKeysForLobby = ['level'];
play.createRoom('level2Room', {
	roomOptions: options
});
```

其他玩家通过设置`等级为 2 的房间`匹配属性，可能会随机加入到这个房间。

```javascript
// 设置匹配属性
const matchProps = {
	level: 2,
};
play2.joinRandomRoom({
	matchProperties: matchProps,
});
```

与[加入指定房间](play-cocos.html#加入指定房间)一样，我们也有可能接收到 `JOINED_ROOM`（加入房间成功）和 `JOIN_ROOM_FAILED`（加入房间失败）的事件。

### 加入或创建指定房间

有时候，我们会有这样的需求，一些玩家同时加入到`某个房间`，而这个房间`可能并不存在`。
这时，我们可以通过下面的接口实现。

```javascript
/**
* 随机加入或创建房间
* @param {string} roomName 房间名称
* @param {Object} opts （可选）创建房间选项
* @param {RoomOptions} opts.roomOptions （可选）创建房间选项，默认值为 null
* @param {Array.<string>} opts.expectedUserIds （可选）邀请好友 ID 数组，默认值为 null
*/
joinOrCreateRoom(roomName, { roomOptions = null, expectedUserIds = null } = {})
```

- `roomOptions` 与[创建房间的接口参数 roomOptions](play-cocos.html#roomOptions)一致。
- `expectedUserIds` 与[创建房间的接口参数 expectedUserIds](play-cocos.html#expectedUserIds)一致。

当调用这个接口后，只有`第一个玩家`的请求会执行`创建房间`逻辑，而其他玩家的请求将会执行`加入房间`逻辑。
所以，如果执行了创建房间逻辑，则会回调 `CREATED_ROOM`（创建房间成功）和 `CREATE_ROOM_FAILED`（创建房间失败）的事件；如果执行了加入房间逻辑，则会回调 `JOINED_ROOM`（加入房间成功）和 `JOIN_ROOM_FAILED`（加入房间失败）的事件。

### 新玩家加入事件

对于已经在房间的玩家，当有新玩家加入到房间时，会通过 `NEW_PLAYER_JOINED_ROOM`（新玩家加入）事件回调客户端，客户端可以通过新玩家的属性，做一些显示逻辑。

```javascript
// 注册新玩家加入事件
play.on(Event.NEW_PLAYER_JOINED_ROOM, (newPlayer) => {
	// TODO 新玩家加入逻辑

});
```

### 离开房间

当玩家想要`主动`离开房间时，可以调用下面的接口。

```javascript
/**
* 离开房间
*/
leaveRoom() 
```

当玩家离开房间成功后，客户端会接收到 `LEFT_ROOM`（离开房间）事件。

```javascript
// 注册离开房间事件
play.on(Event.LEFT_ROOM, () => {
	// TODO 可以执行跳转场景等逻辑

});
```

而房间里的其他玩家将会接收到 `PLAYER_LEFT_ROOM`（有玩家离开房间）事件。

```javascript
// 注册有玩家离开房间事件
play.on(Event.PLAYER_LEFT_ROOM, () => {
	// TODO 可以执行玩家离开的销毁工作

});
```


## Master Client

为了不依赖于服务端，更快速的开发实时对战游戏，我们引入了 `Master Client` 的概念，即 主机，通常在实时策略类游戏中很常见。
Master Client 其实就是`承担运算逻辑的客户端`。

有以下几点需要注意：
1. 默认房间的创建者为 Master Client。
2. 在游戏过程中，Master Client 可以指定其他玩家作为新的 Master Client。
3. 当 Master Client 掉线后，服务器会指任新的玩家为 Master Client。但是当原 Master Client 恢复上线之后，也不会成为新的 Master Client。

当 Master Client 变化时，Play SDK 会通过 `MASTER_SWITCHED`（主机切换事件）通知客户端。所以，在开发时，只需要注册 `MASTER_SWITCHED` 事件即可。

```javascript
// 注册主机切换事件
play1.on(Event.MASTER_SWITCHED, (newMaster) => {
	// TODO 可以做主机切换的展示

});
```


## 自定义属性及同步

为了满足开发者不同的游戏需求，Play SDK 允许开发者设置`自定义属性`。
`自定义属性`接口参数定义为 JavaScript 的 `Object` 类型，支持的数据类型也与标准的 JavaScript 的 `Object` 类型基本一致，如：

- boolean
- number
- string
- Object
- Array

自定义属性同步的主要作用包括：

- 使每个客户端的数据保持一致。
- 自定义属性由服务端管理，当有玩家进入房间后，即可得到所有的自定义属性。

自定义属性又分为`房间自定义属性`和`玩家自定义属性`。

### 房间自定义属性

房间除了固有的属性外，还包括一个 `Object` 类型的自定义属性，比如 战斗的回合数，所有棋牌等。

设置房间自定义属性

```javascript
/**
* 设置房间的自定义属性
* @param {Object} properties 自定义属性
* @param {Object} opts 设置选项
* @param {Object} opts.expectedValues 期望属性，用于 CAS 检测
*/
setCustomProperties(properties, { expectedValues = null } = {})
```

- `properties` 自定义属性（增量或变化量）
- `expectedValues` 期望属性，用于 CAS 判断，参考：[CAS](play-cocos.html#CAS)

```javascript
const props = {
	title: 'room title',
	gold: 1000,
};
play.room.setCustomProperties(props);
```

注意：这个接口并不是直接设置`内存中的自定义属性`，而是发送修改自定义属性的消息，经过服务端的判断之后，再通知到`房间内的所有客户端`。

即 当房间属性变化时，Play SDK 将通过 `ROOM_CUSTOM_PROPERTIES_CHANGED`（房间自定义属性）事件通知客户端。

```javascript
// 注册房间属性变化事件
play.on(Event.ROOM_CUSTOM_PROPERTIES_CHANGED, (changedProperties) => {
	const props = play.room.getCustomProperties();
	const { title, gold } = props;
	// TODO 可以做属性变化的界面展示

});
```

请注意 `changedProperties` 参数只表示增量修改的参数，不是`全部属性`。如需获得全部属性，请通过 `play.room.getCustomProperties()` 获得。

### 玩家自定义属性

设置玩家自定义属性

```javascript
/**
* 设置玩家的自定义属性
* @param {Object} properties 自定义属性
* @param {Object} opts 设置选项
* @param {Object} opts.expectedValues 期望属性，用于 CAS 检测
*/
setCustomProperties(properties, { expectedValues = null } = {})
```

- `properties` 自定义属性（增量或变化量）
- `expectedValues` 期望属性，用于 `CAS` 判断，参考：[CAS](play-cocos.html#CAS)

玩家自定义属性与`房间自定义属性`基本一致。

示例

```javascript
// 模拟扑克牌对象
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
play.player.setCustomProperties(props);
```

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

CAS 全称 `Check And Swap`，`检测并替换`的意思。

想象一种情景，当房间内有一个物品 A，物品 A 只能被一个玩家获得。假设当玩家 X 和玩家 Y 同时去获取时，如果没有 CAS，玩家 X 和 玩家 Y 获取物品 A 的请求会同时发往服务端，但服务端处理是有`先后顺序`的，则 物品 A 将会被`请求最后处理的玩家`获得。
这显然是不合理的。

所以我们引入了 CAS 的概念，玩家 X 和 Y 在发送获取物品 A 的请求时，可以将`当前客户端中物品 A 当前的拥有者`作为 expectedValues 参数传给服务器，服务器根据判断`物品 A 的拥有者`参数是否过期，来确定是否覆盖新值。

在此例中，假设玩家 X 获得物品 A 的消息先到达服务器，玩家 Y 获得物品 A 的消息后到达服务器，玩家 X 传递的 expectedValues 中物品 A 的持有者为 null，则通过检测，将物品 A 的拥有者设置为玩家 X；此后又处理玩家 Y 获得物品 A 的消息，玩家 Y 传递的 expectedValues 中物品 A 的持有者为 null，但是此时服务器认为物品 A 的拥有者已经是玩家 X 了，所以检测失败。
由于物品 A 是房间属性，所以当玩家 X 获得物品 A 处理完成后，服务端会将`物品 A 的拥有者为玩家 X`数据同步给房间内所有的玩家，当玩家 Y 接收同步后，判断物品 A 已经属于玩家 X 了，则不再发送`玩家 Y 获取物品 A`的请求。



## 自定义事件

在`自定义属性`中，我们介绍了允许开发者根据游戏需求，自定义游戏的数据结构和数据类型。
但是，只有数据是不够的，开发者还需要自定义事件（协议）进行扩展。

### 发送自定义事件

```javascript
/**
* 发送自定义消息
* @param {number|string} eventId 事件 ID
* @param {Object} eventData 事件参数
* @param {SendEventOptions} options 发送事件选项
*/
sendEvent(eventId, eventData, options) 
```

- `eventId` 事件 Id，用于事件分发处理（可以是数字或者字符串类型）
- `eventData` 事件参数
- `options` 事件发送选项，通常包括`接收者`

我们可以通过`自定义事件`发送各种事件，比如 游戏开始，抓牌，释放 X 技能，游戏结束 等等。

```javascript
const options = new SendEventOptions();
options.receiverGroup = ReceiverGroup.MasterClient;
const eventData = {
	skillId: 123,
	targetId: 2,
};
play.sendEvent('skill', eventData, options);
```

其中 `SendEventOptions` 是指事件发送参数，包括 `接收组` 和 `接收者 ID 数组`。
- 接收组（ReceiverGroup）是接收事件的目标的枚举值，包括 Others（房间内除自己之外的所有人），All（房间内的所有人），MasterClient（主机）
- 接收者 ID 数组是指接收事件的目标的具体值，即 玩家的 actorId 数组。

注意：如果同时设置`接收组`和`接收者 ID 数组`，则`接收者 ID 数组`将会覆盖`接收组`。

### 接收自定义事件

我们通过注册 `CUSTOM_EVENT`（自定义事件），根据 `eventId`（事件 ID），来处理不同事件。

```javascript
// 注册自定义事件
play.on(Event.CUSTOM_EVENT, event => {
	// 解构事件参数
	const { eventId, eventData } = event;
	if (eventId === 'skill') {
		const { skillId, targetId } = eventData;
		// TODO 处理释放技能的表现

	}
});
```



## 断开连接

当游戏过程中，由于网络原因可能会断开连接，此时 Play SDK 会向客户端发送 `DISCONNECTED`（断开连接） 事件，开发者可以根据需要注册并处理。

```javascript
// 注册断开连接事件
play.on(Event.DISCONNECTED, () => {
  // TODO 如果需要，可以选择重连

});
```

开发者也可以通过下面的接口断开连接。

```javascript
/**
* 断开连接
*/
disconnect()
```



## 断线重连

有时候，由于网路不稳定，可能导致玩家掉线，而我们希望能保留掉线玩家的数据，并在一段时间内等待掉线的玩家恢复上线。

针对这种情况，我们可以在创建房间时，通过 `RoomOptions.playerTtl` 来设置`玩家掉线后的保留时间`，即 玩家掉线后，并不将玩家数据`立即销毁`，而是通过 `PLAYER_ACTIVITY_CHANGED` 事件通知客户端。
只要掉线玩家在 `playerTtl` 时间内重连并回到房间，则可以恢复游戏（玩家上线也是通过 `PLAYER_ACTIVITY_CHANGED` 事件通知）。
如果超过 `playerTtl` 时间，则会销毁玩家数据，并认为其离开房间。其他玩家会收到 `PLAYER_LEFT_ROOM` （玩家离开房间）事件。

```javascript
const options = new RoomOptions();
// 将 playerTtl 设置为 600 秒
options.playerTtl = 600;
play.createRoom(roomName, {
	roomOptions: options,
});
```

```javascript
// 注册玩家掉线 / 上线事件
play.on(Event.PLAYER_ACTIVITY_CHANGED, (player) => {
  	// TODO 根据玩家的在线状态可以做显示和逻辑处理

});
```

### 重新连接

不论是由于网络原因或者用户主动断开连接，都可以通过下面的接口重新连接至服务器。

```javascript
/**
* 重新连接
*/
reconnect() 
```

注意：这个接口只是重新连接至服务器，如果之前在`房间内游戏`，并不会直接回到房间。如需重连并回到断线前的房间，请参考 [重连并回到房间](play-cocos.html#重连并回到房间)

### 回到房间

当玩家连接至大厅以后，可以通过此接口`再次回到某房间`。

```javascript
/**
* 重新加入房间
* @param {string} roomName 房间名称
*/
rejoinRoom(roomName)
```

如果房间存在并且玩家的 `ttl` 没到期，则其他玩家将会收到 `PLAYER_ACTIVITY_CHANGED` 事件。

```javascript
// 注册玩家在线状态变化事件
play.on(Event.PLAYER_ACTIVITY_CHANGED, (player) => {
	// TODO 根据玩家的在线状态可以做显示和逻辑处理

});
```

### 重连并回到房间

```javascript
/**
* 重新连接并回到房间
*/
reconnectAndRejoin()
```

这个接口相当于 `reconnect()` 和 `rejoin()` 的合并。通过这个接口，可以直接重新连接并回到`之前的房间`。



## 常用属性和接口

### 当前加入的房间

```javascript
play.room
```

### 当前的玩家

```javascript
play.player
```

### 当前玩家的 UserId

```javascript
play.userId
```

### 房间的玩家列表

```javascript
room.playerList
```

### 根据 actorId 获取玩家对象

```javascript
room.getPlayer(actorId)
```

### 获取房间自定义属性

```javascript
room.getCustomProperties()
```

### 判断此玩家是不是主机

```javascript
player.isMaster()
```

### 判断此玩家是不是当前玩家

```javascript
player.isLocal()
```

### 获取玩家自定义属性

```javascript
player.getCustomProperties()
```

更多接口及详情，请参考：[API 接口](https://leancloud.github.io/Play-SDK-JS/doc/)
