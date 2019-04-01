# 实时对战服务总览

实时对战是专门针对多人在线对战游戏推出的后端服务。开发者不需要自己搭建后端系统，利用云服务就可以轻松实现游戏内玩家匹配、在线对战消息同步等功能。


## 核心功能
- **玩家匹配**：随机或按指定条件将玩家匹配到一起玩游戏。实时对战的匹配操作会将即将一起游戏的玩家匹配到同一个房间（Room）中。例如《第五人格》、《王者荣耀》、《吃鸡》等对战类手游，玩家只需点击「自由匹配」就可以迅速匹配到其他玩家，大家进入到同一个房间中准备开始游戏；玩家也可以自己新开房间邀请好友一起玩。
- **多人在线对战**：客户端与服务端使用 WebSocket 通道进行实时双向通信，确保游戏内所有消息能够快速同步。
- **游戏逻辑运算**：实时对战提供了 [MasterClient](multiplayer-guide-js.html#MasterClient) 作为客户端主机控制游戏逻辑。游戏内的所有逻辑都交给 MasterClient 来判断运转，如果 MasterClient 意外掉线，实时对战会自动将网络状态最好的客户端切换为 MasterClient，确保游戏顺畅进行；开发者也可以选择在服务端编写游戏逻辑（服务端游戏逻辑支持尚在开发中）。
- **多平台支持**：完美适配游戏引擎 Unity 及 Cocos Creator，支持多个平台。

## 特性
- 美国及国内节点同步支持，满足游戏向全球发行和推广的需求。
- 沿用了 LeanCloud 现有的可横向扩展的架构，支持动态扩容，从容应对海量并发。
- 在久经考验的底层架构上进行了深度优化与改进，可以稳定承接每秒亿级的消息下发量。

## 游戏核心流程
这里给出简单的示例代码使您更快地了解到整体流程，详细的开发指南请参考：

* [实时对战开发指南 · JavaScript](multiplayer-guide-js.html)
* [实时对战开发指南 · C#](multiplayer-guide-csharp.html)

### 连接服务器

```js
const client = new Client({
    // 设置 APP ID
    appId: YOUR_APP_ID,
    // 设置 APP Key
    appKey: YOUR_APP_KEY,
    // 设置用户 id
    userId: 'leancloud'
    // 设置游戏版本号，选填，默认 0.0.1，不同版本的玩家不会匹配到同一个房间
    gameVersion: '0.0.1'
});

client.connect().then(()=> {
  // 连接成功
}).catch(console.error);
```

```cs
Play.UserID = "Mario";
// 连接服务器时可以声明游戏版本，不同版本的玩家不会匹配到同一个房间
Play.Connect("0.0.1"); 
```


### 玩家匹配
#### 随机匹配
单人玩游戏时，最常见的场景是随机匹配其他玩家迅速开始。具体实现步骤如下：

1、调用 `JoinRandomRoom` 开始匹配。

```js
client.joinRandomRoom().then(() => {
  // 成功加入房间
}).catch(console.error);
```
```cs
Play.JoinRandomRoom();
```

2、在顺利情况下，会进入某个有空位的房间开始游戏。

```js
// JavaScript SDK 通过 joinRandomRoom 的 Promise 判断是否加入房间成功
```

```cs
[PlayEvent]
public override void OnJoinedRoom()
{
  Play.Log("OnJoinedRoom");
}
```


3、如果没有空房间，就会加入失败。此时在失败触发的回调中建立一个房间等待其他人加入，建立房间时：

* 不需要关心房间名称。
* 默认一个房间内最大人数是 10，可以通过设置 MaxPlayerCount 来限制最大人数。
* 设置 [玩家掉线后的保留时间](multiplayer-guide-csharp.html#玩家掉线之后被保留的时间)，在有效时间内如果该玩家加回房间，房间内依然保留该玩家的自定义属性。

```js
client.joinRandomRoom().then().catch((error) =>
  if (error.code === 4301) {
    const options = {
      // 设置最大人数，当房间满员时，服务端不会再匹配新的玩家进来。
      maxPlayerCount: 4,
      // 设置玩家掉线后的保留时间为 120 秒
      playerTtl: 120, 
    };
    // 创建房间
    client.createRoom({ 
      roomOptions: options
    }).then(()=> {
      // 创建房间成功
    });
  }
);

```

```cs
// 加入失败时，这个回调会被触发
[PlayEvent]
public override void OnJoinRoomFailed(int errorCode, string reason)
{
  var roomConfig = PlayRoom.RoomConfig.Default;
  // 设置最大人数，当房间满员时，服务端不会再匹配新的玩家进来。
  roomConfig.MaxPlayerCount = 4;
  // 设置玩家掉线后的保留时间为 120 秒
  roomConfig.PlayerTimeToKeep = 120;
  // 创建房间
  Play.CreateRoom(roomConfig);
}
```

#### 自定义房间匹配规则

有的时候我们希望将水平差不多的玩家匹配到一起。例如当前玩家 5 级，他只能和 0-10 级的玩家匹配，10 以上的玩家无法被匹配到。这个场景可以通过给房间设置属性来实现，具体实现逻辑如下：

1、确定匹配属性，例如 0-10 级是 level-1，10 以上是 level-2。

```js
var matchLevel = 0;
if (level < 10) {
  matchLevel = 1;
} else
  matchLevel = 2;
}
```

```cs
int matchLevel = 0;
if (level < 10) {
  matchLevel = 1;
} else
  matchLevel = 2;
}
```

2、根据匹配属性加入房间

```js
const matchProps = {
	level: matchLevel,
};

client.joinRandomRoom({matchProperties: matchProps}).then(() => {
  // 成功加入房间
}).catch(console.error);
```

```cs
Hashtable matchProp = new Hashtable();
matchProp.Add("matchLevel", matchLevel);
Play.JoinRandomRoom(matchProp);
```

3、如果随机加入房间失败，则创建具有匹配属性的房间等待其他同水平的人加入。

```js
const matchProps = {
	level: matchLevel,
};

client.joinRandomRoom({matchProperties: matchProps}).then().catch((error) => {
  if (error.code === 4301) {
    const options = {
      // 设置最大人数，当房间满员时，服务端不会再匹配新的玩家进来。
      maxPlayerCount: 4,
      // 设置玩家掉线后的保留时间为 120 秒
      playerTtl: 120,
      // 房间的自定义属性
      customRoomProperties: matchProps,
      // 从房间的自定义属性中选择匹配用的 key
      customRoomPropertyKeysForLobby: ['level'],
    }
    
    client.createRoom({
      roomOptions: options
    }).then().catch(console.error);
  }
});
```
```cs
[PlayEvent]
public void OnRandomJoinRoomFailed() {
  // 设置匹配属性
  PlayRoom.RoomConfig config = new PlayRoom.RoomConfig() {
    CustomRoomProperties = matchProp
    LobbyMatchKeys = new string[] { "matchLevel" }
  };

  // 设置最大人数，当房间满员时，服务端不会再匹配新的玩家进来。
  roomConfig.MaxPlayerCount = 4;
  // 设置玩家掉线后的保留时间为 120 秒
  roomConfig.PlayerTimeToKeep = 120; 
  Play.CreateRoom(config);
}
```

#### 和好友一起玩

假设 PlayerA 希望能和好基友 PlayerB 一起玩游戏，这时又分以下两种情况：

* 只是两个人一起玩，不允许陌生人加入
* 好友和陌生人一起玩

##### 不允许陌生人加入
1、PlayerA 创建房间，设置房间不可见，这样其他人就不会被随机匹配到 PlayerA 创建的房间中。

```js
const options = {
  // 房间不可见
  visible: false,
};
client.createRoom({ 
	roomOptions: options, 
}).then().catch(console.error);
```

```cs
PlayRoom.RoomConfig config = new PlayRoom.RoomConfig() {
  IsVisible = false,
};
Play.CreateRoom(config, roomName);
```

2、PlayerA 通过某种通信方式（例如 [LeanCloud 即时通讯](realtime_v2.html)）将房间名称告诉 PlayerB。


3、PlayerB 根据房间名称加入到房间中。

```js
client.joinRoom('LiLeiRoom').then().catch(console.error);
```

```cs
Play.JoinRoom(roomName);
```

##### 好友和陌生人一起玩
PlayerA 通过某种通信方式（例如 [LeanCloud 即时通讯](realtime_v2.html)）邀请 PlayerB，PlayerB 接受邀请。

1、PlayerA 和 PlayerB 一起组队进入某个房间

```js
client.joinRandomRoom({expectedUserIds: ["playerB"]}).then(() => {
  // 加入成功
}).catch(console.error);
```

```cs
Play.JoinRandomRoom(expectedUsers: new string[] {"playerB"});
```

2、如果有足够空位的房间，加入成功。

```js
// JavaScript SDK 通过 joinRandomRoom 的 Promise 判断是否加入房间成功
```

```cs
[PlayEvent]
public override void OnJoinedRoom()
{
  Play.Log("OnJoinedRoom");
}
```

3、如果没有合适的房间则创建并加入房间： 

```js
const expectedUserIds = ['playerB'];
client.joinRandomRoom({expectedUserIds}).then().catch((error) => {
   // 没有空房间或房间位置不够
   if (error.code === 4301 || error.code === 4302) {
    client.createRoom({  
      expectedUserIds: expectedUserIds
    }).then().catch(console.error);
   }
});
```

```cs
[PlayEvent]
public void OnRandomJoinRoomFailed() {
  Play.CreateRoom(expectedUsers: new string[] { "playerB" });
}
```

更多匹配接口请参考房间匹配文档：[JavaScript](multiplayer-guide-js.html#房间匹配)、[c#](multiplayer-guide-csharp.html#房间匹配)。


### 游戏中

#### 相关概念

* **MasterClient**：实时对战中使用 [MasterClient](multiplayer-guide-js.html#MasterClient) 在客户端担任运算主机，由 MasterClient 来控制游戏逻辑，例如判定游戏开始还是结束、下一轮由谁操作、扣除玩家多少金币等等。
* **自定义属性**：自定义属性又分为 [房间自定义属性](multiplayer-guide-js.html#房间自定义属性) 和 [玩家自定义属性](multiplayer-guide-js.html#玩家自定义属性)。我们建议将游戏数据加入到自定义属性中，例如房间的当前地图、下注总金币、每个人的手牌等数据，这样当 MasterClient 转移时新的 MasterClient 可以拿到当前游戏的最新数据继续进行运算。

#### 开始游戏

游戏开始前，我们建议为每个玩家有一个准备状态，当所有玩家准备完毕后，MasterClient 开始游戏。开始游戏前需要将房间设置为不可见，防止游戏期间有其他玩家被匹配进来。

Player A 通过设置自定义属性的方式设置准备状态：

```js
// 玩家设置准备状态
const props = {
	ready: true,
};
// 请求设置玩家属性
play.player.setCustomProperties(props).then(() => {
  // 设置属性成功
}).catch(console.error);
```

```cs
// 玩家设置准备状态
Hashtable prop = new Hashtable();
prop.Add("ready", true);
Play.Player.CustomProperties = prop;
```

所有玩家（包括 PlayerA）都会收到事件回调通知：

```js
play.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, (data) => {
  // MasterClient 才会执行这个运算
  if (play.player.isMaster) {
    // 在自己写的方法中检查已经准备的玩家数量，可以通过 play.room.playerList 获取玩家列表。
    const readyPlayerCount = getReadyPlayerCount();
    // 如果都准备好了就开始游戏
    if (readyPlayersCount > 1 && readyPlayersCount == play.room.playerList.length()) 
    {
      // 设置房间不可见，避免其他玩家被匹配进来
      play.setRoomVisible(false);
      // 开始游戏
      start();
    }
  }
});
```

```cs
[PlayEvent]
public override void OnPlayerCustomPropertiesChanged(Player player, Hashtable updatedProperties)
{
  // MasterClient 才会执行这个运算
  if (Play.Player.IsMasterClient)
  {
    // 在自己写的方法中检查已经准备的玩家数量，可以通过 play.room.playerList 获取玩家列表。
    var readyPlayerCount = getReadyPlayerCount();
    // 如果都准备好了就开始游戏
    if (readyPlayersCount > 1 && readyPlayersCount == Play.Players.Count()) 
    {
      // 设置房间不可见，避免其他玩家被匹配进来
      Play.Room.SetVisible(false);
      // 开始游戏
      start();
    } 
  }
}
```

#### 游戏中发送消息
游戏中的大部分消息都发给 [MasterClient](multiplayer-guide-js.html#MasterClient)，由 MasterClient 运算后再判定下一步操作。假设有这样一个场景：玩家 A 跟牌完成后，告诉 MasterClient 跟牌完成，MasterClient 收到消息后通知所有人当前需要下一个玩家 B 操作。

具体发消息流程如下：

1、Player A 发送自定义事件 `follow` ，通知 MasterClient 自己跟牌完成。

```js
// 设置事件的接收组为 Master
const options = {
	receiverGroup: ReceiverGroup.MasterClient,
};

// 设置要发送的信息
const eventData = {
	actorId: play.player.actorId,
};
play.sendEvent('follow', eventData, options);
```

```cs
Play.RPC("follow", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

2、 MasterClient 中的相关方法会被触发。MasterClient 计算出下一位操作的玩家是 PlayerB，然后调用 `next` 方法，通知所有玩家当前需要 PlayerB 操作。

```js
// Event.CUSTOM_EVENT 方法会被触发
play.on(Event.CUSTOM_EVENT, event => {
  const { eventId } = event;
  if (eventId === 'follow') {
    // follow 自定义事件
    // 判断下一步需要 PlayerB 操作
    int PlayerBId = getNextPlayerId();
    
    // 通知所有玩家下一步需要 PlayerB 操作。
    const options = {
      receiverGroup: ReceiverGroup.All,
    };
    const eventData = {
	  actorId: PlayerBId,
    };
    play.sendEvent('next', eventData, options);
  }
});

```
```cs
// 提前定义的名为 follow 方法，此时这个方法被自动触发。
[PlayRPC]
public void follow(int playerId) 
{
  // 判断下一步轮到 PlayerB 操作。
  int PlayerBId = getNextPlayerId();
  // 通知所有玩家下一步需要 PlayerB 操作。
  Play.RPC("next", PlayRPCTargets.All, PlayerBId);
}
```

3、所有玩家的相关方法被触发。

```js
// Event.CUSTOM_EVENT 方法会被触发
play.on(Event.CUSTOM_EVENT, event => {
  const { eventId, eventData } = event;
  if (eventId === 'follow') {
    ......
  } else if (eventId === 'next') {
    // next 事件逻辑
    console.log('Next Player:'  + eventData.actorId);
  }
});

```
```cs
// 提前定义的名为 rpcNext 方法，此时这个方法被自动触发。
[PlayRPC]
public void rpcNext(int playerId) 
{
  // 告诉所有玩家当前需要 playerId 操作。
  Debug.Log("Next Player: " + playerId);
}
```

更详细的用法及介绍，请参考 ：

* [JavaScript - 自定义事件](multiplayer-guide-js.html#自定义事件)
* [C# - 远程调用函数](multiplayer-guide-csharp.html#远程调用函数-RPC)。

#### 游戏中断线重连
如果 MasterClient 位于客户端，MasterClient 断线后，实时对战服务会重新挑选其他成员成为新的 MasterClient，原来的 MasterClient 重新返回房间后会成为一名普通成员。具体请参考 [断线重连](multiplayer-guide-js.html#断线重连)。


#### 退出房间

```js
play.leaveRoom().then(() => {
  // 成功退出房间
}).catch(console.error);
```
```cs
Play.LeaveRoom();
```

## 文档
### JavaScript
* [快速入门](multiplayer-quick-start-js.html)：快速接入实时对战并运行一个小 Demo
* [实时对战开发指南 · JavaScript](multiplayer-guide-js.html)：对实时对战所有功能及接口的详细介绍。

### `C#`
* [快速入门](multiplayer-quick-start-csharp.html)：快速接入实时对战并运行一个小 Demo
* [实时对战开发指南 · C#](multiplayer-guide-csharp.html)：对实时对战所有功能及接口的详细介绍。

### Demo
* [回合制 Demo](game-demos.html#回合制 Demo)
* [实时 Demo](game-demos.html#实时 Demo)

## 价格及试用

实时对战的核心计费单位为 CCU，即同时在线人数。

实时对战目前正在公测中，所有应用免费使用 100 CCU/天，如果您需要更高额度，请联系 support@leancloud.rocks。

公测于 2019 年 4 月 9 停止，届时开始商用收费，详情请参考[博客](https://blog.leancloud.cn/6646/)。
