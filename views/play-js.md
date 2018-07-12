# Play 开发指南 &middot; Cocos Creator

## 前言

Play 是一个基于 JavaScript 编写的 Cocos Creator 的插件，它具备如下几项主要的功能（包括但不限于）：

- 与服务端建立长连接
- 获取房间列表
- 创建房间
- 加入房间
- 随机加入（符合条件的）房间
- 获取房间玩家
- 获取，设置，同步房间的属性
- 获取，设置，同步玩家的属性
- 发送和接收`自定义事件`
- 离开房间

> Play 为有强联网需求的网络游戏提供了一整套的客户端 SDK 解决方案，因此开发团队不再需要自建服务端，从而节省大部分开发和运维成本。



## SDK 导入

请阅读 [安装](play-js-quick-start.html#安装)，获取 js 库文件。



## 初始化

首先 Play SDK 在内部实例化了一个 `Play` 类型的对象 `play`，我们只需要引入并使用即可。（后文中的 `play` 都是指这个对象。）

```javascript
import {
  play,
  PlayOptions,
  Region,
} from '../play';
```

接着我们需要实例化一个 PlayOptions 类型的对象，作为初始化 Play 的参数。

```javascript
const opts = new PlayOptions();
// 设置 APP ID
opts.appId = YOUR_APP_ID;
// 设置 APP Key
opts.appKey = YOUR_APP_KEY;
// 设置节点地区
// EAST_CN：华东节点
// NORTH_CN：华北节点
// US：美国节点
opts.region = Region.EAST_CN;
play.init(opts);
```



## 连接

我们需要设置一个 `userId` 作为客户端的唯一标识连接至服务器。

```javascript
play.userId = 'leancloud';
```

注意：这个 `userId` 拥有如下限制：
- 不支持中文和特殊字符（包括 `，！@#￥%……&*（）` 等），但可以是下划线 `_`
- 长度不能超过 64 字符
- 一个应用内全局唯一

建立连接

```javascript
play.connect({ gameVersion = '0.0.1' });
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

在连接服务器成功之后，默认会自动加入到大厅中。

开发者可以根据需要注册 `JOINED_LOBBY`（成功加入大厅）事件。

```javascript
// 注册成功加入大厅事件
play.on(Event.JOINED_LOBBY, () => {
	// TODO 可以做跳转场景，房间列表展示的逻辑

});
```

当玩家加入到大厅后，Play SDK 会自动同步当前大厅的房间列表，开发者可以根据房间列表显示 / 加入房间参与游戏。

开发者可以根据下面的接口获取房间列表。

```javascript
// 返回 LobbyRoom[]
play.lobbyRoomList;
```



## 房间匹配

房间，是指产生玩家`战斗交互`的单位。比如 斗地主的牌桌，MMO 的副本，微信游戏的 PVP 等，广义上都属于房间的范畴。

玩家之间的战斗交互都是在房间内完成的。
所以，玩家`如何进入房间`就成了房间匹配的关键，下面我们将从`创建房间`，`加入房间`两方面来分析一下常用的`房间匹配`功能。

### 创建房间

例如，我们可以创建这样一个房间。

```javascript
const options = new RoomOptions();
// 房间不可见
options.visible = false;
// 房间空后保留的时间，单位：秒
options.emptyRoomTtl = 600;
// 允许的最大玩家数量
options.maxPlayerCount = 2;
// 玩家离线后，保留玩家数据的时间，单位：秒
options.playerTtl = 600;
// 房间的自定义属性
const props = {
	title: 'room title',
	level: 2,
};
options.customRoomProperties = props;
// 用于做房间匹配的自定义属性键
options.customRoomPropertiesKeysForLobby = ['level'];
const expectedUserIds = ['world'];
play.createRoom({ 
	roomName,
	roomOptions: options, 
	expectedUserIds: expectedUserIds });
```

创建房间时还可以指定 `roomName`，`roomOptions` 和 `expectedUserIds`，这些参数都是可选参数。

#### roomName

房间名称必须保证唯一，如果不设置，将有服务端返回唯一房间 Id。

#### roomOptions

创建房间时的指定参数，包括

- opened：房间是否打开。如果设置为 false，则不允许其他玩家加入。
- visible：房间是否可见。如果设置为 false，则不会出现在大厅的房间列表中，但是其他玩家可以通过指定`房间名称`加入房间。
- emptyRoomTtl：当房间中没有玩家时，房间保留的时间（单位：秒）。默认为 0，即 房间中没有玩家时，立即销毁房间数据。最大值为 1800，即 30 分钟。
- playerTtl：当玩家掉线时，保留玩家在房间内的数据的时间（单位：秒）。默认为 0，即 玩家掉线后，立即销毁玩家数据。最大值为 300，即 5 分钟。
- maxPlayerCount：房间允许的最大玩家数量。
- customRoomProperties：房间的自定义属性。
- customRoomPropertiesKeysForLobby：房间的自定义属性`键`数组，将用于房间匹配。这里的键数组应该属于 `customRoomProperties`。

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
	// TODO 可以提示用户创建失败

});
```

注意：当房主创建好房间后，会认为房主默认加入房间，所以也会回调 `JOINED_ROOM`（加入房间成功）事件。

### 加入房间

当房间创建好后，其他的玩家可以通过`加入房间`参与到游戏中。

#### 加入指定房间

通过指定`房间名称`加入房间，`expectedUserIds` 为可选参数，可用于玩家位置预留。

```javascript
const expectedUserIds = ['Tom', 'Jerry'];
// 玩家在加入 'game' 房间，并为 Tom 和 Jerry 占位
play.joinRoom('game', {
	expectedUserIds: expectedUserIds
});
```

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
// 我们可以创建一个名为 `level2Room 并且 要求加入等级为 2` 的房间。
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

其他玩家通过设置`等级为 2`匹配属性，可能会随机加入到这个房间。

```javascript
// 设置匹配属性
const matchProps = {
	level: 2,
};
play2.joinRandomRoom({
	matchProperties: matchProps,
});
```

与[加入指定房间](play-js.html#加入指定房间)一样，我们也有可能接收到 `JOINED_ROOM`（加入房间成功）和 `JOIN_ROOM_FAILED`（加入房间失败）的事件。

### 加入或创建指定房间

有时候，我们会有这样的需求，一些玩家同时加入到`某个房间`，而这个房间`可能并不存在`。
这时，我们可以通过下面的接口实现。

```javascript
// 例如，有 10 个玩家同时加入一个房间名称为 `room1` 的房间，如果不存在，则创建并加入
play.joinOrCreateRoom('room1', { roomOptions = null, expectedUserIds = null });
```

其中
- `roomOptions` 可选参数，与[创建房间的接口参数 roomOptions](play-js.html#roomOptions)一致。
- `expectedUserIds` 可选参数，与[创建房间的接口参数 expectedUserIds](play-js.html#expectedUserIds)一致。
更多关于 `joinOrCreateRoom`，请参考[ joinOrCreateRoom 文档](https://leancloud.github.io/Play-SDK-JS/doc/Play.html)。

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
play.leaveRoom();
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

```javascript
// 通过玩家的 Id 指定 Master Client
play.setMaster(newMasterId);
```

当 Master Client 变化时，Play SDK 会通过 `MASTER_SWITCHED`（主机切换事件）通知客户端。所以，在开发时，只需要注册 `MASTER_SWITCHED` 事件即可。

```javascript
// 注册主机切换事件
play.on(Event.MASTER_SWITCHED, (newMaster) => {
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
// 设置想要修改的自定义属性
const props = {
	gold: 1000,
};
// 设置用于 CAS 的属性
const expectedProps = {
	type: 0,
};
// 当房间的自定义属性 type = 0 时，设置 gold 属性为 1000
play.room.setCustomProperties(props，{
	expectedValues: expectedProps
});
```

注意：这个接口并不是直接设置`客户端中自定义属性的内存值`，而是发送修改自定义属性的消息，由服务端最终确定是否修改。

当房间属性变化时，Play SDK 将通过 `ROOM_CUSTOM_PROPERTIES_CHANGED`（房间自定义属性）事件通知客户端。

```javascript
// 注册房间属性变化事件
play.on(Event.ROOM_CUSTOM_PROPERTIES_CHANGED, (changedProperties) => {
	const props = play.room.getCustomProperties();
	const { gold } = props;
	// TODO 可以做属性变化的界面展示

});
```

请注意 `changedProperties` 参数只表示增量修改的参数，不是`全部属性`。如需获得全部属性，请通过 `play.room.getCustomProperties()` 获得。

### 玩家自定义属性

设置玩家自定义属性

玩家自定义属性与[房间自定义属性](play-js.html#房间自定义属性)基本一致。

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

假设这样一个场景，整个房间只有一把「屠龙刀」，这把屠龙刀只能被一个玩家获得。
当前房间里有 A，B，C，D 四个玩家，当屠龙刀出现时，四个玩家都有可能点击获得。
如果在极短的时间内，A，B，C，D 四个玩家同时点击获得，即 调用

```javascript
play.room.setCustomProperties({
	tulong: X // X 分别表示当前的客户端
});
```

虽然是「同时点击获得」，但是在服务端处理也是按顺序的，假设处理顺序为 A，B，C，D。那么，这把屠龙刀将归玩家 D 所有。

这显然是不合理的，因为可能玩家 D 的网速比较慢，所以消息最后才到达服务端。

此时，就需要 CAS 参数了。通过调用

```javascript
const props = {
	tulong: X // X 分别表示当前的客户端
};
const expectedValue = {
	tulong: null // 屠龙刀当前拥有者
};
play.room.setCustomProperties(props, { expectedValue });
```

我们还假设处理顺序为 A，B，C，D。那么，当 A 处理时，`tulong = null`，所以 CAS 成功。当 A 处理完成后，房间的属性 `tulong = A ` 了，则 B，C，D 玩家的 CAS 将会失败。

这样，最先处理的玩家「抢」到了这把屠龙刀，比较符合逻辑。



## 自定义事件

在`自定义属性`中，我们介绍了允许开发者根据游戏需求，自定义游戏的数据结构和数据类型。
但是，只有数据是不够的，开发者还需要自定义事件（协议）进行扩展。

### 发送自定义事件

我们可以通过`自定义事件`发送各种事件，比如 游戏开始，抓牌，释放 X 技能，游戏结束 等等。

```javascript
const options = new SendEventOptions();
// 设置事件的接收组为 Master
options.receiverGroup = ReceiverGroup.MasterClient;
// 设置技能 Id 和目标 Id
const eventData = {
	skillId: 123,
	targetId: 2,
};
// 发送 eventId 为 skill 的事件
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
		// 如果是 skill 事件，则 解构事件数据
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
play.disconnect();
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
	// 获得用户是否「活跃」状态
  	cc.log(player.isInActive());
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

注意：这个接口只是重新连接至服务器，如果之前在`房间内游戏`，并不会直接回到房间。如需重连并回到断线前的房间，请参考 [重连并回到房间](play-js.html#重连并回到房间)

### 回到房间

当玩家连接至大厅以后，可以通过此接口`再次回到某房间`。

```javascript
play.on(Event.DISCONNECTED, () => {
	// 重连
	play.reconnect();
});

play.on(Event.JOINED_LOBBY, () => {
	// TODO 根据是否有缓存的之前的房间名，回到房间。

	if (roomName) {
		play.rejoinRoom(roomName);
	}
});
```

如果房间存在并且玩家的 `ttl` 没到期，则其他玩家将会收到 `PLAYER_ACTIVITY_CHANGED` 事件。

```javascript
// 注册玩家在线状态变化事件
play.on(Event.PLAYER_ACTIVITY_CHANGED, (player) => {
	// 获得用户是否「活跃」状态
  	cc.log(player.isInActive());
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
play.on(Event.JOINED_ROOM, () => {
	// TODO 根据房间和玩家最新数据进行界面重构

});
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
