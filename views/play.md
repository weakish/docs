# Play 服务总览
Play 是专门针对多人在线对战游戏推出的后端服务。其灵活的功能可以让你轻松实现游戏内房间匹配、在线对战消息同步等功能。

## 特性
* 美国及国内节点同步支持，满足您向全球推广和发行游戏的需求。
* 沿用了 LeanCloud 现有的可横向扩展的架构，支持动态扩容，从容应对海量并发。
* 在久经考验的底层架构上进行了深度优化与改进，可以稳定承接每秒亿级的消息下发量。


## 核心功能
这里给出简单的示例代码使您更快地了解到整体流程，详细的开发指南请参考 [Play SDK for Unity(C#) 开发指南]()。


### 连接服务器

开始游戏的第一步是连接到服务器，成功连接后 SDK 会自动为开发者保持连接状态，并根据网络状态自动重连：

```
Play.UserID = "HJiang";
Play.Connect("0.0.1");
```

### 房间匹配
为用户随机匹配一个房间加入游戏

```
// 随机加入一个游戏房间
Play.JoinRandomRoom();
```

### 游戏内发送消息

```
// 定义名为 rpcResult 的 RPC 方法
[PlayRPC]
public void rpcResult(int winnerId) 
{
  Debug.Log("winnerId: " + winnerId);
  ui.showWin();
}
```

```
// 向所有人发送游戏消息，收到消息的玩家的 rpcResult 方法会自动被触发
Play.RPC("rpcResult", PlayRPCTargets.All, winnerId);

```

## 限制
* 房间内发送消息速率最大不超过 500 msg/s
* 每条消息大小不超过 1KB

## 开始使用

* [快速入门]()：使用 Play 快速实现一个炸金花小游戏
* [Play SDK for Unity(C#) 开发指南]()：对 Play 所有功能及接口的详细介绍。
