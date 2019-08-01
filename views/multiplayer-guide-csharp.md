{% extends "./multiplayer-guide.tmpl" %}

{% set platformName = "C\#` `" %}
{% set userId = "UserId" %}
{% set autoJoinLobby = "AutoJoinLobby" %}
{% set lobby_room_url = "https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1LobbyRoom.htm" %}
{% set joinRoom = "JoinRoom" %}
{% set joinRandomRoom = "JoinRandomRoom" %}
{% set joinOrCreateRoom = "JoinOrCreateRoom" %}
{% set setCustomProperties = "SetCustomProperties" %}
{% set playerTtl = "PlayerTtl" %}
{% set api_url = "https://leancloud.github.io/Play-SDK-CSharp/html/" %}
{% set gameVersion = "这个参数" %}
{% set rejoin = "Rejoin" %}}
{% set reconnect = "Reconnect" %}
{% set rejoinRoom = "RejoinRoom" %}
{% set DISCONNECTED_EVENT = "OnDisconnected" %}
{% set PLAYER_ACTIVITY_CHANGED_EVENT = "OnPlayerActivityChanged" %}
{% set PLAYER_ROOM_LEFT_EVENT = "OnPlayerRoomLeft" %}
{% set ROOM_CUSTOM_PROPERTIES_CHANGED_EVENT = "OnRoomCustomPropertiesChanged" %}
{% set MASTER_SWITCHED_EVENT = "OnMasterSwitched" %}
{% set PLAYER_ROOM_JOINED_EVENT = "OnPlayerRoomJoined" %}
{% set ROOM_KICKED_EVENT = "OnRoomKicked" %}
{% set PLAYER_ROOM_LEFT_EVENT = "OnPlayerRoomLeft" %}
{% set CUSTOM_EVENT_EVENT = "OnCustomEvent" %}



{% block import %}
请阅读 [安装](multiplayer-quick-start-csharp.html#安装)，获取 dll 库文件。
{% endblock %}



{% block initialization %}
导入需要的命名空间。
```cs
using LeanCloud.Play;
```
接着我们需要实例化一个在线对战 SDK 的客户端对象。
```cs
var client = new Client({{appid}}, {{appkey}}, userId, gameVersion: "0.0.1");
```
{% endblock %}



{% block connection %}
```cs
try {
    await client.Connect();
    // 连接成功
} catch (PlayException e) {
    // 连接失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block join_lobby %}
```cs
try {
    await client.JoinLobby();
    // 加入大厅成功
} catch (PlayException e) {
    // 加入大厅失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block room_list %}
```cs
client.OnLobbyRoomListUpdated += () => {
    var roomList = client.LobbyRoomList;
    // TODO 可以做房间列表展示的逻辑
};
```
{% endblock %}



{% block lobby_event %}
| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| OnLobbyRoomListUpdated | 无 | 大厅房间列表更新                                  |
{% endblock %}



{% block create_default_room %}
```cs
try {
    await client.CreateRoom();
    // 创建房间成功也意味着自己已经成功加入了该房间
} catch (PlayException e) {
    // 创建房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block create_custom_room %}
```cs
// 房间的自定义属性
var props = new PlayObject {
    { "title", "room title" },
    { "level", 2 }
};
var roomOptions = new RoomOptions {
    Visible = false,
    EmptyRoomTtl = 10000,
    PlayerTtl = 600,
    MaxPlayerCount = 2,
    CustomRoomProperties = props,
    CustoRoomPropertyKeysForLobby = new List<string> { "level" },
    Flag = CreateRoomFlag.MasterSetMaster | CreateRoomFlag.MasterUpdateRoomProperties,
};
var expectedUserIds = new List<string> { "cr3_2" };
try {
    await client.CreateRoom(roomName, roomOptions, expectedUserIds);
    // 创建房间成功也意味着自己已经成功加入了该房间
} catch (PlayException e) {
    // 创建房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block room_options %}
- `Opened`：房间是否开放。如果设置为 false，则不允许其他玩家加入。
- `Visible`：房间是否可见。如果设置为 false，则不会出现在大厅的房间列表中，但是其他玩家可以通过指定「房间名称」加入房间。
- `EmptyRoomTtl`：当房间中没有玩家时，房间保留的时间（单位：秒）。默认为 0，即 房间中没有玩家时，立即销毁房间数据。最大值为 300，即 5 分钟。
- `PlayerTtl`：当玩家掉线时，保留玩家在房间内的数据的时间（单位：秒）。默认为 0，即 玩家掉线后，立即销毁玩家数据。最大值为 300，即 5 分钟。
- `MaxPlayerCount`：房间允许的最大玩家数量。
- `CustomRoomProperties`：房间的自定义属性。
- `CustomRoomPropertyKeysForLobby`：房间的自定义属性 `CustomRoomProperties` 中「键」的数组，包含在 `CustomRoomPropertyKeysForLobby` 中的属性将会出现在大厅的房间属性中（`client.LobbyRoomList`），而全部属性要在加入房间后的 `room.CustomProperties` 中查看。这些属性将会在匹配房间时用到。
- `Flag`：创建房间标志位，详情请看下文中 [MasterClient 掉线不转移](#MasterClient 掉线不转移), [指定其他成员为 MasterClient](#指定其他成员为 MasterClient)，[只允许 MasterClient 修改房间属性](#只允许 MasterClient 修改房间属性)。
{% endblock %}



{% block create_room_api %}
更多关于 `CreateRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1Client.htm#a0478f278b300dd4ae4c4e1fe311d3c7c)。
{% endblock %}



{% block join_room %}
```cs
try {
    // 玩家在加入 'LiLeiRoom' 房间
    await client.JoinRoom("LiLeiRoom");
    // 加入房间成功
} catch (PlayException e) {
    // 加入房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block join_room_with_ids %}
```cs
var expectedUserIds = new List<string>() { "LiLei", "Jim" };
try {
    // 玩家在加入 "game" 房间，并为 LiLei 和 Jim 玩家占位
    await client.JoinRoom("game", expectedUserIds);
} catch (PlayException e) {
    // 加入房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}

```
{% endblock %}



{% block join_room_api %}
更多关于 `JoinRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1Client.htm#ab19049bfb2cf5e62c746f5e4a4ce79b2)。
{% endblock %}



{% block join_random_room %}
```cs
try {
    await client.JoinRandomRoom();
    // 加入房间成功
} catch (PlayException e) {
    // 加入房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block join_random_room_with_condition %}
```cs
// 设置匹配属性
var matchProps = new PlayObject {
    { "level", 2 }
};
try {
    await client.JoinRandomRoom(matchProps);
} catch (PlayException e) {
    // 加入房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block join_or_create_room %}
```cs
try {
    // 例如，有 4 个玩家同时加入一个房间名称为 「room1」 的房间，如果不存在，则创建并加入
    await client.JoinOrCreateRoom("room1");
} catch (PlayException e) {
    // 加入房间失败，也没有成功创建房间
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block join_or_create_room_api %}
更多关于 `JoinOrCreateRoom`，请参考 [API 文档](https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1Client.htm#ad4a489ac7663ee9eee812cba2659a187)。
{% endblock %}



{% block player_room_joined %}
```cs
// 注册新玩家加入事件
client.OnPlayerRoomJoined += newPlayer => {
    // TODO 新玩家加入逻辑
};
```
可以通过 `client.Room.PlayerList` 获取房间内的所有玩家。
{% endblock %}



{% block player_is_local %}
```cs
var players = client.Room.PlayerList;
var player = players[0];
var isLocal = player.isLocal;
```
{% endblock %}



{% block leave_room %}
```cs
try {
    await client.LeaveRoom();
    // 离开房间成功，可以执行跳转场景等逻辑
} catch (PlayException e) {
    // 离开房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block player_room_left_event %}
```cs
// 注册有玩家离开房间事件
client.OnPlayerRoomLeft += leftPlayer => {
    // TODO 可以执行玩家离开的销毁工作
}
```
{% endblock %}



{% block room_events %}
| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| OnPlayerRoomJoined    | newPlayer | 新玩家加入房间                         |
| OnPlayerRoomLeft   | leftPlayer | 玩家离开房间 |
{% endblock %}



{% block open_room %}
```cs
try {
    // 设置房间关闭
    await client.SetRoomOpened(false);
    Debug.Log(client.Room.Open);
} catch (PlayException e) {
    // 设置失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block visible_room %}
```cs
try {
    // 设置房间不可见
    await client.SetRoomVisible(false);
    Debug.Log(client.Room.Visible);
} catch (PlayException e) {
    // 设置失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block kick_player %}
```cs
try {
    // 可以传入踢人的 code 和 msg
    await client.KickPlayer(otherPlayer.ActorId, 1, "你已被踢出房间"); 
} catch (PlayException e) {
    // 踢人失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block kick_event %}
```cs
client.OnRoomKicked += (code, msg) => {
    // code 和 msg 就是 MasterClient 在踢人时传递的信息
};
```
{% endblock %}



{% block kick_left_event %}
```cs
client.OnPlayerRoomLeft += leftPlayer => {
    
};
```
{% endblock %}



{% block set_master %}
```cs
try {
    // 通过玩家的 Id 指定 MasterClient
    await client.SetMaster(newMasterId);
} catch (PlayException e) {
    // 设置 Master 失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block master_switched %}
```cs
// 注册主机切换事件
client.OnMasterSwitched += newMaster => {
    // TODO 可以做主机切换的展示

    // 可以根据判断当前客户端是否是 Master，来确定是否执行逻辑处理。
    if (client.Player.IsMaster) {

    }
}
```
{% endblock %}



{% block master_switched_event %}
| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| OnMasterSwitched    | newMaster | Master 更换                         |
{% endblock %}



{% block master_fixed %}
```cs
var options = new RoomOptions {
   Flag = CreateRoomFlag.FixedMaster
};
await client.CreateRoom(roomOptions: options);
```
{% endblock %}



{% block custom_props %}
为了满足开发者不同的游戏需求，多人对战 SDK 允许开发者设置「自定义属性」。
{% endblock %}



{% block set_custom_props %}
可以给房间设置一个 `PlayObject` 类型的自定义属性，比如战斗的回合数、所有棋牌等。
```cs
// 设置想要修改的自定义属性
var props = new PlayObject {
    { "gold", 1000 }
};
try {
    // 设置 gold 属性为 1000
    await client.Room.SetCustomProperties(props);
    var newProperties = client.Room.CustomProperties;
} catch (PlayException e) {
    // 设置属性错误
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block custom_props_event %}
```cs
// 注册房间属性变化事件
client.OnRoomCustomPropertiesChanged += changedProps => {
    var props = client.Room.CustomProperties;
    var gold = props.GetInt("gold");
};
```
注意：`changedProps` 参数只表示当前修改的参数，不是「全部属性」。如需获得全部属性，请通过 `client.Room.CustomProperties` 获得。
{% endblock %}


{% block master_update_room_properties %}
```cs
var options = new RoomOptions {
   Flag = MasterUpdateRoomProperties
};
await client.CreateRoom(roomOptions: options);
```
{% endblock %}



{% block set_player_custom_props %}
```cs
// 扑克牌对象
var poker = new PlayObject {
    { "flower", 1 },
    { "num", 13 }
};
var props = new PlayObject {
    { "nickname", "Li Lei" },
    { "gold", 1000 },
    { "poker", poker }
};
try {
    // 请求设置玩家属性
    await client.Player.SetCustomProperties(props);
} catch (PlayException e) {
    // 设置属性错误
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block player_custom_props_event %}
```cs
// 注册玩家自定义属性变化事件
client.OnPlayerCustomPropertiesChanged += (player, changedProps) => {
    // 得到玩家所有自定义属性
    var props = player.CustomProperties;
    var title = props.GetString("title");
    var gold = props.GetInt("gold");
};
```
{% endblock %}



{% block set_player_custom_props_with_cas %}
```cs
var props = new PlayObject {
    // X 表示当前的客户端
    { "tulong", X }
};
var expectedValues = new PlayObject {
    // 屠龙刀当前拥有者
    { "tulong", null }
};
await client.Room.SetCustomProperties(props, expectedValues);
```
这样，在「第一个玩家」获得屠龙刀之后，`tulong` 对应的值为「第一个玩家」，后续的请求 `expectedValues = { tulong: null }` 将会失败。
{% endblock %}



{% block set_player_custom_props_with_cas_event %}
| 事件   | 参数     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| OnRoomCustomPropertiesChanged    | changedProps | 房间自定义属性变化                         |
| OnPlayerCustomPropertiesChanged   | (player, changedProps)  | 玩家自定义属性变化 |
{% endblock %}



{% block send_event %}
```cs
var options = new SendEventOptions {
    // 设置事件的接收组为 Master
    ReceiverGroup = ReceiverGroup.MasterClient
    // 也可以指定接收者 actorId
    // targetActorIds = new List<int>() { 1 },
};
// 设置技能 Id
var eventData = new PlayObject {
    { "skillId", 123 }
};
// 设置 skill 事件 id
byte SKILL_EVENT_ID = 1;
try {
    // 发送自定义事件
    await client.SendEvent(SKILL_EVENT_ID, eventData, options);
} catch (PlayException e) {
    // 发送事件错误
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
其中 `options` 是指事件发送参数，包括「接收组」和「接收者 ID 数组」。
- 接收组（ReceiverGroup）是接收事件的目标的枚举值，包括 Others（房间内除自己之外的所有人）、All（房间内的所有人）、MasterClient（主机）。
- 接收者 ID 数组是指接收事件的目标的具体值，即玩家的 `ActorId` 数组。`ActorId` 可以通过 `player.ActorId` 获得。
{% endblock %}



{% block send_event_event %}
```cs
// 注册自定义事件
client.OnCustomEvent += (eventId, eventData, senderId) => {
    if (eventId == SKILL_EVENT_ID) {
        // 如果是 skill 事件
        var skillId = eventData.GetString("skillId");
        // TODO 处理释放技能的表现

    }
};
```
{% endblock %}



{% block send_event_args %}
| 参数   | 类型     | 描述                                       |
| ------------------------------------ | ------------------ | ---------------------------------------- |
| eventId    | byte | 事件 Id，用于表示事件                         |
| eventData   | PlayObject  | 事件参数 |
| senderId   | int  | 事件发送者 Id（玩家的 actorId） |
{% endblock %}



{% block disconnect %}
```cs
// 注册断开连接事件
client.OnDisconnected += () => {
    // TODO 如果需要，可以选择重连
};
```
{% endblock %}



{% block player_activity_changed %}
```cs
// 注册玩家掉线 / 上线事件
client.OnPlayerActivityChanged += player => {
    // 获得用户是否「活跃」状态
    Debug.Log(player.IsActive);
    // TODO 根据玩家的在线状态可以做显示和逻辑处理
};
```
{% endblock %}



{% block set_player_ttl %}
```cs
var options = new RoomOptions {
    // 将 PlayerTtl 设置为 300 秒
    PlayerTtl = 300
}
await client.CreateRoom(roomOptions: options);
```
{% endblock %}



{% block reconnect %}
```cs
client.OnDisconnected += async () => {
    // 重连
    await client.Reconnect();
};
```
{% endblock %}



{% block rejoin_room %}
```cs
try {
    // 重连
    await client.Reconnect();
    // 重连成功，回到之前的某房间
    if (roomName) {
        try {
            await client.RejoinRoom(roomName);
            // 回到房间成功，房间内其他玩家会收到 `OnPlayerActivityChanged` 事件。
        } catch (PlayException e) {
            // 返回房间失败
            Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
        }
    }
} catch (PlayException e) {
    // 重连失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block reconnect_and_rejoin %}
```cs
try {
    await client.ReconnectAndRejoin();
    // 回到房间成功，更新数据和界面
} catch (PlayException e) {
    // 重连或返回失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block close %}
```cs
client.Close();
```
{% endblock %}



{% block promise_error %}
在我们发起请求时，可以通过 try catch 具体的 exception 信息，例如创建房间时：
```cs
try {
    await client.createRoom();
    // 创建房间成功
} catch (PlayException e) {
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block error_event %}
```cs
client.OnError += (code, detail) => {
    // 联系 LeanCloud

};
```
{% endblock %}



{% block serialization %}
## 序列化

在新版 Play 中，我们提供了更丰富的同步数据的方式。主要包括容器类型（PlayObject/PlayArray）和自定义类型。

### PlayObject

`PlayObject` 是用来替换旧版本中的 `Dictionary<string, object>` 类型的。

`PlayObject` 实现了 `IDictionary<object, object>` 接口，在满足 `IDictionary` 接口的基础上，还提供了更方便的获取接口。

常用接口如下：

```csharp
// 基本类型
public bool GetBool(object key);
public int GetInt(object key);
public float GetFloat(object key);
...
// 容器类型
public PlayObject GetPlayObject(object key); // PlayObject 支持嵌套
public PlayArray GetPlayArray(object key);
public T Get<T>(object key);
```

[更多接口请参考](https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1PlayObject.htm)


### PlayArray

`PlayArray` 实现了 `IList` 接口，主要用于数组对象的同步，与 `PlayObject` 类似。

常用接口如下：

```csharp
// 基本类型
public bool GetBool(int index);
public int GetInt(int index);
public float GetFloat(int index);
...
// 容器类型
public PlayObject GetPlayObject(int index);
public PlayArray GetPlayArray(int index);
public T Get<T>(int index);
// 转换接口
public List<T> ToList<T>();
```

[更多接口请参考](https://leancloud.github.io/Play-SDK-CSharp/html/classLeanCloud_1_1Play_1_1PlayArray.htm)


### 自定义类型

`Play` 除了支持上述两种容器类型，还支持同步「自定义类型」的数据。

假设我们有一个 Hero 类型，包含 id, name, hp，定义如下：

```csharp
class Hero {
    int id;
    string name;
    int hp;
}
```

要同步 Hero 类型的数据，需要以下两步：

#### 实现序列化 / 反序列化方法

序列化方法实现由开发者自由实现，可以使用 protobuf, thrift 等。只要满足 `Play` 支持的序列化和反序列化接口即可。

```csharp
public delegate byte[] SerializeMethod(object obj);
public delegate object DeserializeMethod(byte[] bytes);
```

以下是通过 `Play` 提供的序列化 `PlayObject` 的方式的示例

```csharp
// 序列化方法
public static byte[] Serialize(object obj) {
    Hero hero = obj as Hero;
    var playObject = new PlayObject {
        { "id", hero.id },
        { "name", hero.name },
        { "hp", hero.hp },
    };
    return CodecUtils.SerializePlayObject(playObject);
}
// 反序列化方法
public static object Deserialize(byte[] bytes) {
    var playObject = CodecUtils.DeserializePlayObject(bytes);
    Hero hero = new Hero {
        id = playObject.GetInt("id"),
        name = playObject.GetString("name"),
        hp = playObject.GetInt("hp"),
    };
    return hero;
}
```

#### 注册自定义类型

当实现了序列化方法，记得在使用前要先进行自定义类型的注册。

```csharp
CodecUtils.RegisterType(typeof(Hero), typeCode, Hero.Serialize, Hero.Deserialize);
```

其中 `typeCode` 是表示自定义类型的数字编码，在反序列化时会根据这个编码确定自定义类型。
{% endblock %}