# Play 入门教程

欢迎使用 LeanCloud Play。本教程将模拟一个比较玩家点数大小的场景来讲解 Play SDK 的核心使用方法。

Play 尚未正式发布，内测正在进行中。<a class="btn btn-sm btn-default" href="https://blog.leancloud.cn/6177/">申请内测</a>

我们推荐通过以下方法来学习：

1. 下载 [demo 工程](https://github.com/leancloud/Play-SDK-dotNET)，通过 Unity 打开 demo 工程，浏览和运行 demo 代码，观察日志输出。
1. 创建一个新的 Unity 工程，安装好 SDK 后，替换你申请的 App ID 和 App Key，根据 demo 代码尝试修改并运行，观察变化。

## 安装和初始化

Play 客户端 SDK 是开源的，源码地址请访问：[Play-SDK-dotNET](https://github.com/leancloud/Play-SDK-dotNET)， 下载请访问 [Play-SDK-dotNET@Release](https://github.com/leancloud/Play-SDK-dotNET/releases)。

下载之后导入到 Unity 的 `Assets/Plugins` 文件里，如下图：

![import-play-sdk](images/import-play-sdk.png)

然后将 `LeanCloud.Play.dll` 里面的 `PlayInitializeBehaviour` 挂载到 Main Camera（或者其他 Game Object）上，如下图：

![import-play-sdk](images/link-play-init-script.png)

## 连接至 Play 服务器

在连接 Play 服务器之前请先设置用户唯一 ID，这里使用随机数作为简单示例。

```cs
void Start ()
{
	// 随机生成一个用户 ID
	string userId = Random.Range(0, int.MaxValue).ToString();
	Debug.Log("userId: " + userId);
	// 设置用户 ID，请保证游戏内唯一
	Play.UserID = userId;
	Play.Connect("1.0.0");
}
``` 

## 创建或加入房间

在连接到 Play 服务器并认证成功后，Play SDK 会回调 `OnAuthenticated()` 接口，我们在此接口中「加入或创建某个房间」。

```cs
// 连接成功回调接口
[PlayEvent]
public override void OnAuthenticated ()
{
	// 根据房间名称「加入或创建房间」
	PlayRoom room = new PlayRoom(roomName);
	Play.JoinOrCreateRoom(room);
}
```

## 通过 CustomPlayerProperties 同步玩家属性

当有别的玩家加入到房间时，Play SDK 会回调 `OnNewPlayerJoinedRoom (Player player)` 接口，我们在此接口中生成随机点数，并进行点数比对。

```cs
// 其他玩家加入回调接口
[PlayEvent]
public override void OnNewPlayerJoinedRoom (Player player)
{
	Debug.Log("OnNewPlayerJoinedRoom");
	if (Play.Player.IsMasterClient) {
		// 如果当前玩家是房主，则由当前玩家执行分配点数，判断胜负逻辑
		int count = Play.Room.Players.Count();
		if (count == 2) {
			// 两个人即开始游戏
			foreach (Player p in Play.Players) {
				Hashtable prop = new Hashtable();
				if (p.IsMasterClient) {
					// 如果是房主，则设置 10 分
					prop.Add("POINT", 10);
				} else {
					// 否则设置 5 分
					prop.Add("POINT", 5);
				}
				// 通过设置玩家的 Properties，可以触发所有玩家的 OnPlayerCustomPropertiesChanged(Player player, Hashtable updatedProperties) 回调
				p.CustomProperties = prop;
			}
			// 使用房主作为胜利者，将其 UserId 作为 RPC 参数，通知所有玩家
			Play.RPC("RPCResult", PlayRPCTargets.All, Play.Room.MasterClientId);
		}
	}
}

// 玩家属性变化回调接口
[PlayEvent]
public override void OnPlayerCustomPropertiesChanged (Player player, Hashtable updatedProperties)
{
	if (updatedProperties.ContainsKey("POINT")) {
		Debug.LogFormat("{0}: {1}", player.UserID, updatedProperties["POINT"]);
	}
}
```

### 通过 RPC 通知玩家消息

在判断出胜利者之后，通过 RPC 机制通知玩家。

```cs
// 此行代码在 OnNewPlayerJoinedRoom (Player player) 中已被调用过
// 使用房主作为胜利者，将其 UserId 作为 RPC 参数，通知所有玩家
Play.RPC("RPCResult", PlayRPCTargets.All, Play.Room.MasterClientId);
```

当玩家接收到 RPC 消息后，根据参数做出胜负提示。

```cs
[PlayRPC]
public void RPCResult(string winnerId) {
	// 如果胜利者是自己，则输出胜利日志，否则输出失败日志
	if (winnerId == Play.Player.UserID) {
		Debug.Log("win");
	} else {
		Debug.Log("lose");
	}
}
```

输出日志参考，如图：

![输出日志](images/unity/quick-start-3.png)
