# 实时对战入门教程 · Unity

欢迎使用 LeanCloud Play。本教程将通过模拟一个比较玩家分数大小的场景，来讲解 Play SDK 的核心使用方法。

## 安装

Play 客户端 SDK 是开源的，源码地址请访问 [Play-SDK-CSharp](https://github.com/leancloud/Play-SDK-CSharp)。也可以直接下载 [Release 版本](https://github.com/leancloud/Play-SDK-CSharp/releases)。

将下载的 SDK.zip，解压后将 Plugins 目录拖拽至 Unity 工程。如果项目中已有 Plugins 目录，则合并至项目中的 Plugins 目录。



## 初始化

导入需要的命名空间

```csharp
using LeanCloud.Play;
```

通过 `private Play play = Play.Instance;` 获取客户端实例。

```csharp
// App Id
var APP_ID = "315XFAYyIGPbd98vHPCBnLre-9Nh9j0Va";
// App Key
var APP_KEY = "Y04sM6TzhMSBmCMkwfI3FpHc";
// App 节点地区
var APP_REGION = Region.EastChina;
// 初始化
play.Init(APP_ID, APP_KEY, APP_REGION);
```



## 设置玩家 ID

```csharp
var random = new System.Random();
var randId = string.Format("{0}", random.Next(10000000));
play.UserId = randId;
```



## 连接至 Play 服务器

```csharp
play.Connect();
```

连接完成后，会通过 `CONNECTED`（连接成功）或 `CONNECT_FAILED`（连接失败）事件来通知客户端。



## 创建或加入房间

默认情况下 Play SDK 不需要加入「大厅」，即可创建 / 加入指定房间。

```csharp
play.On(LeanCloud.Play.Event.CONNECTED, (evtData) =>
{
    Debug.Log("connected");
    // 根据当前时间（时，分）生成房间名称
    var now = System.DateTime.Now;
    var roomName = string.Format("{0}_{1}", now.Hour, now.Minute);
    play.JoinOrCreateRoom(roomName);
});
```

`JoinOrCreateRoom` 通过相同的 roomName 保证两个客户端玩家可以进入到相同的房间。请参考 [开发指南](multiplayer-csharp.html#创建房间) 获取更多关于 `JoinOrCreateRoom` 的用法。



## 通过 CustomPlayerProperties 同步玩家属性

当有新玩家加入房间时，Master 为每个玩家分配一个分数，这个分数通过「玩家自定义属性」同步给玩家。
（这里没有做更复杂的算法，只是为 Master 分配了 10 分，其他玩家分配了 5 分）。

```csharp
// 注册新玩家加入房间事件
play.On(LeanCloud.Play.Event.PLAYER_ROOM_JOINED, (evtData) =>
{
    var newPlayer = evtData["newPlayer"] as Player;
    Debug.LogFormat("new player: {0}", newPlayer.UserId);
    if (play.Player.IsMaster) {
        // 获取房间内玩家列表
        var playerList = play.Room.PlayerList;
        for (int i = 0; i < playerList.Count; i++) {
            var player = playerList[i];
            var props = new Dictionary<string, object>();
            // 判断如果是房主，则设置 10 分，否则设置 5 分
            if (player.IsMaster) {
                props.Add("point", 10);
            } else {
                props.Add("point", 5);
            }
            player.SetCustomProperties(props);
        }
        // ...
    }
})
```

玩家得到分数后，显示自己的分数。

```csharp
// 注册「玩家属性变更」事件
play.On(LeanCloud.Play.Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, (evtData) => {
    var player = evtData["player"] as Player;
    // 判断如果玩家是自己，则做 UI 显示
    if (player.IsLocal) {
        // 得到玩家的分数
        long point = (long)player.CustomProperties["point"];
        Debug.LogFormat("{0} : {1}", player.UserId, point);
        this.scoreText.text = string.Format("Score: {0}", point);
    }
});
```



## 通过「自定义事件」通信

当分配完分数后，将获胜者（Master）的 ID 作为参数，通过自定义事件发送给所有玩家。

```csharp
if (play.Player.IsMaster) {
	// ...
	var data = new Dictionary<string, object>();
	data.Add("winnerId", play.Room.Master.ActorId);
	var opts = new SendEventOptions();
	opts.ReceiverGroup = ReceiverGroup.All;
	play.SendEvent("win", data, opts);
}
```

根据判断胜利者是不是自己，做不同的 UI 显示。

```csharp
// 注册自定义事件
play.On(LeanCloud.Play.Event.CUSTOM_EVENT, (evtData) =>
{
    // 得到事件参数
    var eventId = evtData["eventId"] as string;
    if (eventId == "win") {
        var eventData = evtData["eventData"] as Dictionary<string, object>;
        // 得到胜利者 Id
        int winnerId = (int)(long)eventData["winnerId"];
        // 如果胜利者是自己，则显示胜利 UI；否则显示失败 UI
        if (play.Player.ActorId == winnerId) {
            Debug.Log("win");
            this.resultText.text = "Win";
        } else {
            Debug.Log("lose");
            this.resultText.text = "Lose";
        }
        play.Disconnect();
    }
});
```



## Demo

我们通过 Unity 完成了这个 Demo，供大家运行参考。

[QuickStart 工程](https://github.com/leancloud/Play-CSharp-Quick-Start)。








