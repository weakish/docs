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
#### 随机加入房间

```cs
// 随机加入
Play.JoinRandomRoom();
```

如果所有的房间都满员了，会出现随机加入失败的情况，这样 `OnJoinRoomFailed` 方法会被触发，此时可以创建房间等待其他人加入：

```cs
// 创建房间，随机匹配创建房间时不需要传入房间名称
Play.CreateRoom();
```

#### 和好友一起玩
只要好友都知道房间的名字，就可以同时加入某个房间。如果房间不可见，不知道房间名字的人无法加入。如果房间设置为可见，则会有其他玩家匹配进来。
```cs
var roomConfig = PlayRoom.RoomConfig.Default;
// 房间设置不可见，即不允许朋友之外的人加入。
roomConfig.IsVisible = false;
Play.JoinOrCreateRoom(roomConfig, nameEveryFriendKnows);
```

更多匹配接口请参考文档 [房间匹配](play-unity.html#房间匹配)。

### 游戏内发送消息
Play 中使用 MasterClient 在客户端担任运算主机的概念。 游戏中的大部分消息都发给 MasterClient，由 MasterClient 运算后再判定下一步操作。
假设有下面的场景：
玩家 A 跟牌完成后，告诉 MasterClient 跟牌完成，MasterClient 收到消息后通知所有人当前需要下一个玩家 B 操作。

客户端需要提前定义以下两个 RPC 方法，示例代码请见下方流程中的代码：
* 接收跟牌完成的消息：rpcFollow。
* 接收需要某个玩家操作的消息：rpcNext。


具体发消息流程如下：
1. Player A 使用 `Play.RPC` 接口指定调用 `rpcFollow` 方法，通知 MasterClient 自己跟牌完成。
    ```cs
Play.RPC("rpcFollow", PlayRPCTargets.MasterClient, Play.Player.ActorID);
    ```
2. MasterClient 中的 `rpcFollow` 会触发。MasterClient 在 `rpcFollow` 中计算出下一位操作的用户是 PlayerB，然后使用`Play.RPC` 接口指定调用 `rpcNext` 方法，通知所有玩家当前需要 PlayerB 操作。
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
3. 所有玩家的 `rpcNext` 方法被触发。
    ```cs
// 提前定义的名为 rpcNext 方法，此时这个方法被自动触发。
[PlayRPC]
public void rpcNext(int playerId) 
{
  // 告诉所有用户当前需要 playerId 操作。
  Debug.Log("Next Player: " + playerId);
}
    ```

更详细的用法及介绍，请参考 [masterClient](play-unity.html#MasterClient) 及 [远程调用函数 - RPC](play-unity.html#远程调用函数-RPC)

### 退出房间

```cs
Play.LeaveRoom();
```

## 文档

- [快速入门](play-quick-start.html)：快速接入 Play 并运行一个小 Demo
- [Play SDK for Unity(C#) 开发指南](play-unity.html)：对 Play 所有功能及接口的详细介绍。
- [实现小游戏「炸金花」](play-unity-demo.html)
