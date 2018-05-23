# Play 服务总览

Play 是专门针对多人在线对战游戏推出的后端服务。开发者不需要自己搭建后端系统，利用 Play 云服务就可以轻松实现游戏内玩家匹配、在线对战消息同步等功能。


## 核心功能
- **玩家匹配**：随机或按指定条件将玩家匹配到一起玩游戏。Play 的匹配操作会将即将一起游戏的玩家匹配到同一个房间（Room）中。例如《第五人格》、《王者荣耀》、《吃鸡》等对战类手游，玩家只需点击「自由匹配」就可以迅速匹配到其他玩家，大家进入到同一个房间中准备开始游戏；玩家也可以自己新开房间邀请好友一起玩。
- **多人在线对战**：客户端与服务端使用 WebSocket 通道进行实时双向通信，确保游戏内所有消息能够快速同步。
- **游戏逻辑运算**：Play 提供了 [MasterClient](play-unity.html#masterClient) 作为客户端主机控制游戏逻辑。游戏内的所有逻辑都交给 MasterClient 来判断运转，如果 MasterClient 意外掉线，Play 会自动将网络状态最好的客户端切换为 MasterClient，确保游戏顺畅进行；开发者也可以选择在服务端编写游戏逻辑（服务端游戏逻辑支持尚在开发中）。
- **多平台支持**：完美适配 Unity 引擎，支持多个平台。

## 特性
- 美国及国内节点同步支持，满足游戏向全球发行和推广的需求。
- 沿用了 LeanCloud 现有的可横向扩展的架构，支持动态扩容，从容应对海量并发。
- 在久经考验的底层架构上进行了深度优化与改进，可以稳定承接每秒亿级的消息下发量。

## 游戏核心流程
这里给出简单的示例代码使您更快地了解到整体流程，详细的开发指南请参考 [Play SDK for Unity（C#）开发指南](play-unity.html)。

### 连接服务器

开始游戏的第一步是连接到服务器，成功连接后 SDK 会自动为开发者保持连接状态，并根据网络状态自动重连：

```cs
Play.UserID = "Mario";
// 连接服务器时需要声明游戏版本
// 不同版本的玩家不会匹配到同一个房间
Play.Connect("0.0.1"); 
```

### 玩家匹配
#### 随机匹配
单人玩游戏时，最常见的场景是随机匹配其他玩家迅速开始。具体实现步骤如下：

1、调用 `JoinRandomRoom` 开始匹配。

```cs
Play.JoinRandomRoom();
```

2、在顺利情况下，会进入某个有空位的房间开始游戏。

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
* 设置 [玩家掉线后的保留时间](play-unity.html#玩家掉线之后被保留的时间)，在有效时间内如果该玩家加回房间，房间内依然保留该玩家的自定义属性。


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

```cs
int matchLevel = 0;
if (level < 10) {
  matchLevel = 1;
} else
  matchLevel = 2;
}
```

2、根据匹配属性加入房间

```cs
Hashtable matchProp = new Hashtable();
matchProp.Add("matchLevel", matchLevel);
Play.JoinRandomRoom(matchProp);
```

3、如果随机加入房间失败，则创建具有匹配属性的房间等待其他同水平的人加入。

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

```cs
PlayRoom.RoomConfig config = new PlayRoom.RoomConfig() {
  IsVisible = false,
};
Play.CreateRoom(config, roomName);
```

2、PlayerA 通过某种通信方式（例如 [LeanCloud 实时通信](realtime_v2.html)）将房间名称告诉 PlayerB。


3、PlayerB 根据房间名称加入到房间中。

```cs
Play.JoinRoom(roomName);
```

##### 好友和陌生人一起玩
PlayerA 通过某种通信方式（例如 [LeanCloud 实时通信](realtime_v2.html)）邀请 PlayerB，PlayerB 接受邀请。

1、PlayerA 和 PlayerB 一起组队进入某个房间

```cs
Play.JoinRandomRoom(expectedUsers: new string[] { "playerA", "playerB" });
```

2、如果有足够空位的房间，加入成功。

```cs
[PlayEvent]
public override void OnJoinedRoom()
{
  Play.Log("OnJoinedRoom");
}
```

3、如果没有合适的房间则创建并加入房间： 

```cs
[PlayEvent]
public void OnRandomJoinRoomFailed() {
  Play.JoinOrCreate(expectedUsers: new string[] { "playerA", "playerB" });
}
```

更多匹配接口请参考文档 [房间匹配](play-unity.html#房间匹配)。


### 游戏中

#### 相关概念

* **MasterClient**：Play 中使用 [MasterClient](play-unity.html#MasterClient) 在客户端担任运算主机，由 MasterClient 来控制游戏逻辑，例如判定游戏开始还是结束、下一轮由谁操作、扣除玩家多少金币等等。
* **自定义属性**：自定义属性又分为 [房间自定义属性](play-unity.html#房间自定义属性) 和 [玩家自定义属性](play-unity.html#玩家自定义属性)。我们建议将游戏数据加入到自定义属性中，例如房间的当前地图、下注总金币、每个人的手牌等数据，这样当 MasterClient 转移时新的 MasterClient 可以拿到当前游戏的最新数据继续进行运算。

#### 开始游戏

游戏开始前，我们建议为每个玩家有一个准备状态，当所有玩家准备完毕后，MasterClient 开始游戏。开始游戏前需要将房间设置为不可见，防止游戏期间有其他玩家被匹配进来。

Player A 通过设置自定义属性的方式设置准备状态：

```cs
// 玩家设置准备状态
Hashtable prop = new Hashtable();
prop.Add("ready", true);
Play.Player.CustomProperties = prop;
```

所有玩家（包括 PlayerA）都会收到事件回调通知：

```cs
[PlayEvent]
public override void OnPlayerCustomPropertiesChanged(Player player, Hashtable updatedProperties)
{
  // MasterClient 才会执行这个运算
  if (Play.Player.IsMasterClient)
  {
    // 检查是否所有玩家都准备好了，如果都准备好了就开始游戏
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
游戏中的大部分消息都发给 [MasterClient](play-unity.html#MasterClient)，由 MasterClient 运算后再判定下一步操作。假设有这样一个场景：玩家 A 跟牌完成后，告诉 MasterClient 跟牌完成，MasterClient 收到消息后通知所有人当前需要下一个玩家 B 操作。

客户端需要提前定义以下两个 RPC 方法，示例代码请见下方流程中的代码：
* 调用 `rpcFollow` 方法来接收跟牌完成的消息
* 调用 `rpcNext` 方法来接收需要某个玩家操作的消息

具体发消息流程如下：

1、Player A 使用 `Play.RPC` 接口指定调用 `rpcFollow` 方法，通知 MasterClient 自己跟牌完成。

```cs
Play.RPC("rpcFollow", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

2、 MasterClient 中的 `rpcFollow` 会触发。MasterClient 在 `rpcFollow` 中计算出下一位操作的玩家是 PlayerB，然后使用 `Play.RPC` 接口指定调用 `rpcNext` 方法，通知所有玩家当前需要 PlayerB 操作。

```cs
// 提前定义的名为 rpcFollow 方法，此时这个方法被自动触发。
[PlayRPC]
public void rpcFollow(int playerId) 
{
  // 判断下一步轮到 PlayerB 操作。
  int PlayerBId = getNextPlayerId();
  // 通知所有玩家下一步需要 PlayerB 操作。
  Play.RPC("rpcNext", PlayRPCTargets.All, PlayerBId);
}
```

3、所有玩家的 `rpcNext` 方法被触发。

```cs
// 提前定义的名为 rpcNext 方法，此时这个方法被自动触发。
[PlayRPC]
public void rpcNext(int playerId) 
{
  // 告诉所有玩家当前需要 playerId 操作。
  Debug.Log("Next Player: " + playerId);
}
```

更详细的用法及介绍，请参考 [远程调用函数 - RPC](play-unity.html#远程调用函数-RPC)。

#### 游戏中断线重连
MasterClient 断线后会重新挑选其他成员成为新的 MasterClient，原来的 MasterClient 重连后会成为一名普通成员。具体请参考 [断线重连](play-unity.html#断线重连)。


#### 退出房间

```cs
Play.LeaveRoom();
```

## 文档

- [快速入门](play-quick-start.html)：快速接入 Play 并运行一个小 Demo
- [Play SDK for Unity(C#) 开发指南](play-unity.html)：对 Play 所有功能及接口的详细介绍。
- [实现小游戏「炸金花」](play-unity-demo.html)
