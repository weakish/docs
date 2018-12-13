{% extends "./multiplayer-guide.tmpl" %}

{% set platformName = "JavaScript" %}
{% set userId = "userId" %}
{% set autoJoinLobby = "autoJoinLobby" %}
{% set lobby_room_url = "https://leancloud.github.io/Play-SDK-JS/doc/LobbyRoom.html" %}
{% set joinRoom = "joinRoom" %}
{% set joinRandomRoom = "joinRandomRoom" %}
{% set joinOrCreateRoom = "joinOrCreateRoom" %}
{% set setCustomProperties = "setCustomProperties" %}
{% set playerTtl = "playerTtl" %}
{% set api_url = "https://leancloud.github.io/Play-SDK-JS/doc/" %}
{% set gameVersion = "gameVersion" %}


{% block import %}
请阅读 [安装](multiplayer-quick-start-js.html#安装)，获取 js 库文件。
{% endblock %}


{% block initialization %}
首先，需要引入 SDK 中常用的类型和常量。

```javascript
const {
  // SDK 
  Client,
  // 连接节点区域
  Region,
  // Play SDK 事件常量
  Event,
  // 事件接收组
  ReceiverGroup,
  // 创建房间标志
  CreateRoomFlag,
} = Play;
```

接着我们需要实例化一个实时对战 SDK 的客户端对象。

```javascript
const client = new Client({
	// 设置 APP ID
	appId: YOUR_APP_ID,
	// 设置 APP Key
	appKey: YOUR_APP_KEY,
	// 设置节点地区
	// EastChina：华东节点
	// NorthChina：华北节点
	// NorthAmerica：美国节点
	region: Region.EastChina
	// 设置用户 id
	userId: 'leancloud'
	// 设置游戏版本号（选填，默认 0.0.1）
	gameVersion: '0.0.1'
});
```
{% endblock %}

{% block connection %}
```javascript
client.connect();
```
{% endblock %}


{% block connection_event %}
```javascript
// 注册连接成功事件
client.on(Event.CONNECTED, () => {
	// TODO 可以做跳转场景等操作

});

// 注册连接失败事件
client.on(Event.CONNECT_FAILED, (error) => {
	// TODO 可以根据 error 提示用户失败原因

});
```
{% endblock %}



{% block join_lobby %}
```javascript
client.joinLobby();
```

```javascript
// 注册成功加入大厅事件
client.on(Event.LOBBY_JOINED, () => {
	// TODO 可以做房间列表展示的逻辑

});
```
{% endblock %}



{% block room_list %}
```javascript
// 返回 LobbyRoom[]
client.lobbyRoomList;
```
{% endblock %}



{% block create_default_room %}
```javascript
client.createRoom();
```
{% endblock %}



{% block create_custom_room %}
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
	customRoomPropertyKeysForLobby: ['level'],
	// 给 MasterClient 设置权限
	flag: CreateRoomFlag.MasterSetMaster | CreateRoomFlag.MasterUpdateRoomProperties
};
const expectedUserIds = ['world'];
client.createRoom({ 
	roomName,
	roomOptions: options, 
	expectedUserIds: expectedUserIds });
```
{% endblock %}



{% block room_options %}
- `opened`：房间是否开放。如果设置为 false，则不允许其他玩家加入。
- `visible`：房间是否可见。如果设置为 false，则不会出现在大厅的房间列表中，但是其他玩家可以通过指定「房间名称」加入房间。
- `emptyRoomTtl`：当房间中没有玩家时，房间保留的时间（单位：秒）。默认为 0，即 房间中没有玩家时，立即销毁房间数据。最大值为 300，即 5 分钟。
- `playerTtl`：当玩家掉线时，保留玩家在房间内的数据的时间（单位：秒）。默认为 0，即 玩家掉线后，立即销毁玩家数据。最大值为 300，即 5 分钟。
- `maxPlayerCount`：房间允许的最大玩家数量。
- `customRoomProperties`：房间的自定义属性。
- `customRoomPropertyKeysForLobby`：房间的自定义属性 `customRoomProperties` 中「键」的数组，包含在 `customRoomPropertyKeysForLobby` 中的属性将会出现在大厅的房间属性中（`client.lobbyRoomList`），而全部属性要在加入房间后的 `room.getCustomProperties()` 中查看。这些属性将会在匹配房间时用到。
- `flag`：创建房间标志位，详情请看下文中 [MasterClient 掉线不转移](#MasterClient 掉线不转移), [指定其他成员为 MasterClient](#指定其他成员为 MasterClient)，[只允许 MasterClient 修改房间属性](#只允许 MasterClient 修改房间属性)。
{% endblock %}



{% block create_room_api %}
更多关于 `createRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Client.html#createRoom)。
{% endblock %}



{% block create_room_event %}
```javascript
// 注册创建房间成功事件
client.on(Event.ROOM_CREATED, () => {
	// 房间创建成功

});

// 注册创建房间失败事件
client.on(Event.ROOM_CREATE_FAILED, (error) => {
	// TODO 可以根据 error 提示用户创建失败

});
```
{% endblock %}



{% block join_room %}
```javascript
// 玩家在加入 'LiLeiRoom' 房间
client.joinRoom('LiLeiRoom');
```
{% endblock %}



{% block join_room_with_ids %}
```javascript
const expectedUserIds = ['LiLei', 'Jim'];
// 玩家在加入 'game' 房间，并为 hello 和 world 玩家占位
client.joinRoom('game', {
	expectedUserIds
});
```
{% endblock %}



{% block join_room_api %}
更多关于 `joinRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Client.html#joinRoom)。
{% endblock %}



{% block join_room_event %}
```javascript
// 注册加入房间成功事件
client.on(Event.ROOM_JOINED, () => {
	// TODO 可以做跳转场景之类的操作

});

// 注册加入房间失败事件
client.on(Event.ROOM_JOIN_FAILED, () => {
	// TODO 可以提示用户加入失败，请重新加入

});
```
{% endblock %}



{% block join_random_room %}
```javascript
client.joinRandomRoom();
```
{% endblock %}



{% block join_random_room_with_condition %}
```javascript
// 设置匹配属性
const matchProps = {
	level: 2,
};
client.joinRandomRoom({
	matchProperties: matchProps,
});
```
{% endblock %}



{% block join_or_create_room %}
```javascript
// 例如，有 10 个玩家同时加入一个房间名称为 「room1」 的房间，如果不存在，则创建并加入
client.joinOrCreateRoom('room1');
```
{% endblock %}



{% block join_or_create_room_api %}
更多关于 `joinOrCreateRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-JS/doc/Client.html#joinOrCreateRoom)。
{% endblock %}



{% block player_room_joined %}
```javascript
// 注册新玩家加入事件
client.on(Event.PLAYER_ROOM_JOINED, (data) => {
	const { newPlayer } = data;
	// TODO 新玩家加入逻辑

});
```

可以通过 `client.room.playerList` 获取房间内的所有玩家。
{% endblock %}



{% block leave_room %}
```javascript
client.leaveRoom();
```
{% endblock %}



{% block leave_room_event %}
```javascript
// 注册离开房间事件
client.on(Event.ROOM_LEFT, () => {
	// TODO 可以执行跳转场景等逻辑

});
```
{% endblock %}



{% block player_room_left_event %}
```javascript
// 注册有玩家离开房间事件
client.on(Event.PLAYER_ROOM_LEFT, (data) => {
	const { leftPlayer } = data;
	// TODO 可以执行玩家离开的销毁工作

});
```
{% endblock %}



{% block open_room %}
```javascript
// 设置房间关闭
client.setRoomOpened(false);
```
{% endblock %}



{% block visible_room %}
```javascript
// 设置房间不可见
client.setRoomVisible(false);
```
{% endblock %}



{% block set_master %}
```javascript
// 通过玩家的 Id 指定 MasterClient
client.setMaster(newMasterId);
```
{% endblock %}

{% block master_switched_event %}
```javascript
// 注册主机切换事件
client.on(Event.MASTER_SWITCHED, (data) => {
	const { newMaster } = data;
	// TODO 可以做主机切换的展示

	// 可以根据判断当前客户端是否是 Master，来确定是否执行逻辑处理。
	if (client.player.isMaster()) {

	}
});
```
{% endblock %}


{% block master_fixed %}
```js
client.createRoom({
  roomOptions: {
    flag: CreateRoomFlag.FixedMaster
  },
});
```
{% endblock %}



{% block custom_props %}
为了满足开发者不同的游戏需求，实时对战 SDK 允许开发者设置「自定义属性」。自定义属性接口参数定义为 JavaScript 的 `Object` 类型，支持的数据类型包括：

- Boolean
- Number
- String
- Object
- Array
{% endblock %}



{% block set_custom_props %}
房间除了固有的属性外，还包括一个 `Object` 类型的自定义属性，比如战斗的回合数、所有棋牌等。

```javascript
// 设置想要修改的自定义属性
const props = {
	gold: 1000,
};
// 设置 gold 属性为 1000
client.room.setCustomProperties(props);
```
{% endblock %}



{% block custom_props_event %}
```javascript
// 注册房间属性变化事件
client.on(Event.ROOM_CUSTOM_PROPERTIES_CHANGED, (data) => {
	const props = client.room.getCustomProperties();
	const { gold } = props;
	// TODO 可以做属性变化的界面展示

});
```

注意：`changedProps` 参数只表示增量修改的参数，不是「全部属性」。如需获得全部属性，请通过 `client.room.getCustomProperties()` 获得。
{% endblock %}

{% block master_update_room_properties %}

```js
client.createRoom({
  roomOptions: {
    flag: CreateRoomFlag.MasterUpdateRoomProperties
  },
});
```

{% endblock %}



{% block set_player_custom_props %}
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
client.player.setCustomProperties(props);
```
{% endblock %}



{% block player_custom_props_event %}
```javascript
// 注册玩家自定义属性变化事件
client.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, (data) => {
	// 结构事件参数
	const { player } = data;
	// 得到玩家所有自定义属性
	const props = player.getCustomProperties();
	const { title, gold } = props;
	// TODO 可以做属性变化的界面展示

});
```
{% endblock %}



{% block set_player_custom_props_with_cas %}
```javascript
const props = {
	tulong: X // X 分别表示当前的客户端
};
const expectedValues = {
	tulong: null // 屠龙刀当前拥有者
};
client.room.setCustomProperties(props, { expectedValues });
```

这样，在「第一个玩家」获得屠龙刀之后，`tulong` 对应的值为「第一个玩家」，后续的请求（`const expectedValues = {tulong: null}`）将会失败。
{% endblock %}



{% block send_event %}
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
client.sendEvent('skill', eventData, options);
```

其中 `options` 是指事件发送参数，包括「接收组」和「接收者 ID 数组」。
- 接收组（ReceiverGroup）是接收事件的目标的枚举值，包括 Others（房间内除自己之外的所有人）、All（房间内的所有人）、MasterClient（主机）。
- 接收者 ID 数组是指接收事件的目标的具体值，即玩家的 `actorId` 数组。`actorId` 可以通过 `player.actorId` 获得。
{% endblock %}



{% block send_event_event %}
```javascript
// 注册自定义事件
client.on(Event.CUSTOM_EVENT, event => {
	// 解构事件参数
	const { eventId, eventData } = event;
	if (eventId === 'skill') {
		// 如果是 skill 事件，则 解构事件数据
		const { skillId, targetId } = eventData;
		// TODO 处理释放技能的表现

	}
});
```
{% endblock %}



{% block disconnect_event %}
```javascript
// 注册断开连接事件
client.on(Event.DISCONNECTED, () => {
  // TODO 如果需要，可以选择重连

});
```
{% endblock %}



{% block disconnect %}
```javascript
client.disconnect();
```
{% endblock %}



{% block player_activity %}
```javascript
const options = {
	// 将 playerTtl 设置为 300 秒
	playerTtl: 300,
};
client.createRoom({
	roomOptions: options,
});
```

```javascript
// 注册玩家掉线 / 上线事件
client.on(Event.PLAYER_ACTIVITY_CHANGED, (data) => {
	const { player } = data;
	// 获得用户是否「活跃」状态
  	cc.log(player.isActive());
  	// TODO 根据玩家的在线状态可以做显示和逻辑处理
});
```
{% endblock %}



{% block reconnect %}
```javascript
client.on(Event.DISCONNECTED, () => {
	// 重连
	client.reconnect();
});
```
{% endblock %}



{% block rejoin_room %}
```javascript
client.on(Event.DISCONNECTED, () => {
	// 重连
	client.reconnect();
});

client.on(Event.CONNECTED, () => {
	// TODO 根据是否有缓存的之前的房间名，回到房间。

	if (roomName) {
		client.rejoinRoom(roomName);
	}
});
```

如果房间存在并且玩家的 `ttl` 没到期，则其他玩家将会收到 `PLAYER_ACTIVITY_CHANGED` 事件。

```javascript
// 注册玩家在线状态变化事件
client.on(Event.PLAYER_ACTIVITY_CHANGED, (data) => {
	const { player } = data;
	// 获得用户是否「活跃」状态
  	cc.log(player.isActive());
	// TODO 根据玩家的在线状态可以做显示和逻辑处理

});
```
{% endblock %}



{% block reconnect_and_rejoin %}
```javascript
client.on(Event.DISCONNECTED, () => {
	// 重连并回到房间
	client.reconnectAndRejoin();
});

// 在加入房间后，更新数据和界面
client.on(Event.ROOM_JOINED, () => {
	// TODO 根据房间和玩家最新数据进行界面重构

});
```

这个接口相当于 `reconnect()` 和 `rejoinRoom()` 的合并。通过这个接口，可以直接重新连接并回到「之前的房间」。
{% endblock %}



{% block error_event %}
```javascript
client.on(Event.Error, (err) => {
	const { code, detail } = err;
	// TODO 处理错误事件

});
```
{% endblock %}
