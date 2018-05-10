# Play 服务总览
Play 是专门针对多人在线对战游戏推出的后端服务。您不需要搭建自己的后端系统，就可以轻松实现游戏内玩家匹配、在线对战消息同步等功能。


## 核心功能
* **玩家匹配：** 随机或按指定条件将玩家匹配到一起玩游戏。Play 的匹配操作会将即将一起游戏的玩家匹配到同一个房间（Room）中。例如《第五人格》、《王者荣耀》、《吃鸡》等对战类手游，玩家只需点击「自由匹配」就可以迅速匹配到其他玩家，这些玩家进入到同一个房间中准备开始游戏；玩家也可以自己新开房间邀请好友一起玩。
* **多人在线对战：** 客户端与服务端使用实时 WebSocket 通道进行双向通信，确保游戏内所有消息能够快速同步。
* **游戏逻辑运算：** Play 提供了 [masterClient](play-unity.html#MasterClient) 作为客户端主机控制游戏逻辑。游戏内的所有逻辑都交给 masterClient 来判断运转，如果 masterClient 意外掉线，Play 会自动将网络状态最好客户端切换为 masterClient，确保游戏顺畅进行；您也可以选择在服务端编写游戏逻辑（服务端游戏逻辑支持尚在开发中）。
* **多平台支持：** 完美适配 Unity 引擎，支持多个平台。

## 特性
* 美国及国内节点同步支持，满足您向全球推广和发行游戏的需求。
* 沿用了 LeanCloud 现有的可横向扩展的架构，支持动态扩容，从容应对海量并发。
* 在久经考验的底层架构上进行了深度优化与改进，可以稳定承接每秒亿级的消息下发量。

## 游戏核心流程
这里给出简单的示例代码使您更快地了解到整体流程，详细的开发指南请参考 [Play SDK for Unity（C#）开发指南](play-unity.html)。


### 连接服务器

开始游戏的第一步是连接到服务器，成功连接后 SDK 会自动为开发者保持连接状态，并根据网络状态自动重连：

```
Play.UserID = "HJiang";
// 连接服务器时需要声明游戏版本，不同的游戏版本的玩家不会匹配到同一个房间
Play.Connect("0.0.1"); 
```

### 玩家匹配
#### 随机加入
```
// 实际意义上的随机加入，如果所有的房间都满员了，会出现随机加入失败的情况。
Play.JoinRandomRoom();
//如果随机加入失败，OnJoinRoomFailed 方法会被触发
```

```
// 随机加入失败时，可以创建房间等待其他人加入
Play.CreateRoom();
```

#### 和好友一起玩
只要好友都知道房间的名字，就可以同时加入某个房间。
```
var roomConfig = PlayRoom.PlayRoomConfig.Default;
// 如果房间不可见，不知道房间名字的人无法加入。如果房间设置为可见，则会有其他玩家匹配进来。这里设置为不允许朋友之外的人加入。
roomConfig.IsVisible = false;
Play.JoinOrCreateRoom(roomConfig, nameEveryFriendKnows);
```

更多匹配接口请参考文档[房间匹配](play-unity.html#加入房间)


### 游戏内发送消息
通过发消息的方式将游戏内的数据同步给房间内的所有用户，例如通知下一个用户操作：

```
// 定义名为 rpcNotify 的 RPC 方法。
[PlayRPC]
public void rpcNotify(int playerId) 
{
  Debug.Log("notify playerId: " + playerId);
}
// RPC 是客户端远程调用的函数，当其他客户端发送消息时指定 rpcNotify 方法时，rpcNotify 会被自动触发。
```

```
// 向 masterClient 发送游戏消息，masterClient 的 rpcNotify 方法会被自动触发。
// masterClient 为客户端主机，负责控制游戏逻辑的运算。
Play.RPC("rpcNotify", PlayRPCTargets.MasterClient, playerId);

```

更详细的用法及介绍，请参考 [masterClient](play-unity.html#MasterClient) 及 [远程调用函数 - RPC](play-unity.html#远程调用函数-RPC)

### 退出房间

```
Play.LeaveRoom();
```


## 内测申请

Play 正在内测中，如果您没有内测资格，请[申请内测](https://jinshuju.net/f/VxOfsR)。如果您已经拥有内测资格，请继续阅读文档并使用。


## 开始使用

* [快速入门](play-unity-demo.html)：使用 Play 快速实现一个炸金花小游戏
* [Play SDK for Unity(C#) 开发指南](play-unity.html)：对 Play 所有功能及接口的详细介绍。
