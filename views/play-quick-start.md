# Play 入门教程

Hi, 亲爱的开发者，欢迎使用 LeanCloud Play。本教程将模拟一个比较大小的场景，向你讲解 Play SDK 的核心使用方法。

## 你将学到什么

* 如何在 Unity 中安装 SDK，并初始化
* 连接至 Play 服务器
* 如何创建 / 加入房间
* 如何通过 CustomPlayerProperties 同步玩家属性
* 如何通过 RPC 通知玩家消息

## 如何学习

1. 下载 [demo 工程](https://github.com/leancloud/Play-SDK-dotNET)，通过 Unity 打开 demo 工程，浏览 demo 代码，并运行观察日志输出。
2. 创建一个新的 Unity 工程，安装好 SDK 后，替换你申请的 App ID 和 App Key，根据 demo 代码尝试修改并运行，观察变化，来全面深入地理解 Play。

## 主要步骤

### 安装和初始化

下载 SDK，将 dll 拖拽至 Unity 工程的 Plugins 目录，如图：

![安装 dll](images/unity/quick-start-1.png)

（注意：安装的 dll 和 Unity 编译环境的 .Net 版本要保持一致）

在第一个场景中新建一个 GameObject，并添加 PlayInitializeBehaviour.cs 脚本，输入你申请的 App ID 和 App Key，如图：

![初始化 Play](images/unity/quick-start-2.png)

### 连接至 Play 服务器

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

### 如何创建 / 加入房间

在连接到 Play 服务器并认证成功后，Play SDK 会回调 OnAuthenticated() 接口，我们在此接口中「加入或创建某个房间」。

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

### 如何通过 CustomPlayerProperties 同步玩家属性

当有别的玩家加入到房间时，Play SDK 会回调 OnNewPlayerJoinedRoom (Player player) 接口，我们在此接口中生成随机点数，并进行点数比对。

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
			List<int> points = new List<int>();
			// 按 actorID 排序玩家
			List<Player> players = Play.Players.OrderBy(p => p.ActorID).ToList();
			int maxPoint = -1;
			for (int i = 0; i < 2; i++) {
				Player p = players[i];
				// 生成一个随机点数
				int point = Random.Range(0, 10);
				points.Add(point);
				// 通过 CustomPlayerProperty 设置用户随机点数
				Hashtable prop = new Hashtable();
				prop.Add("POINT", point);
				// 通过设置玩家的 Properties，可以触发所有玩家的 OnPlayerCustomPropertiesChanged(Player player, Hashtable updatedProperties) 回调
				p.CustomProperties = prop;
				Debug.LogFormat("{0}: {1}", p.UserID, point);
				maxPoint = Mathf.Max(maxPoint, point);
			}

			// 计算比赛结果，使用 RPC 通知玩家
			// 得到当前最大点数索引
			int maxPointIndex = points.FindIndex(p => p == maxPoint);
			// 根据索引得到最大点数的玩家
			Player winner = players[maxPointIndex];
			Debug.Log("winner ID: " + winner.UserID);
			// 使用胜利者的 UserId 作为 RPC 参数，通知所有玩家
			Play.RPC("RPCResult", PlayRPCTargets.All, winner.UserID);
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

### 如何通过 RPC 通知玩家消息

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
