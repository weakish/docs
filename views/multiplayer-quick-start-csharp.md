{% extends "./multiplayer-quick-start.tmpl" %}

{% set platform = "C\#` `" %}


{% block installation %}
Play 客户端 SDK 是开源的，源码地址请访问 [Play-SDK-CSharp](https://github.com/leancloud/Play-SDK-CSharp)。也可以直接下载 [Release 版本](https://github.com/leancloud/Play-SDK-CSharp/releases)。

### Unity

将下载的 SDK.zip，解压后将 `Plugins` 目录拖拽至 Unity 工程。如果项目中已有 `Plugins` 目录，则合并至项目中的 `Plugins` 目录。

为方便调试，你可以通过注册回调获取日志。在 Unity 中，可以参考如下设置：

```cs
// 设置 SDK 日志委托
LeanCloud.Play.Logger.LogDelegate = (level, log) =>
{
    if (level == LogLevel.Debug) {
        Debug.LogFormat("[DEBUG] {0}", log);
    } else if (level == LogLevel.Warn) {
        Debug.LogFormat("[WARN] {0}", log);
    } else if (level == LogLevel.Error) {
        Debug.LogFormat("[ERROR] {0}", log);
    }
};
```
{% endblock %}



{% block import %}
导入需要的命名空间

```cs
using LeanCloud.Play;
```

通过 `private Play play = Play.Instance;` 获取客户端实例。

```cs
// App Id
var APP_ID = YOUR_APP_ID;
// App Key
var APP_KEY = YOUR_APP_KEY;
// App 节点地区
// Region.EastChina：华东节点
// Region.NorthChina：华北节点
// Region.NorthAmerica：美国节点
var APP_REGION = YOUR_APP_REGION;
// 初始化
play.Init(APP_ID, APP_KEY, APP_REGION);
```
{% endblock %}



{% block set_userid %}
## 设置玩家 ID

```cs
var random = new System.Random();
var randId = string.Format("{0}", random.Next(10000000));
play.UserId = randId;
```
{% endblock %}



{% block connection %}
```cs
play.Connect();
```
{% endblock %}



{% block connectio_event %}
```cs
play.On(LeanCloud.Play.Event.CONNECTED, (evtData) =>
{
    Debug.Log("connected");
    // 根据当前时间（时，分）生成房间名称
    var now = System.DateTime.Now;
    var roomName = string.Format("{0}_{1}", now.Hour, now.Minute);
    play.JoinOrCreateRoom(roomName);
});
```

`JoinOrCreateRoom` 通过相同的 roomName 保证两个客户端玩家可以进入到相同的房间。请参考 [开发指南](multiplayer-guide-csharp.html#加入或创建指定房间) 获取更多关于 `JoinOrCreateRoom` 的用法。
{% endblock %}



{% block join_room %}
```cs
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
{% endblock %}



{% block player_custom_props_event %}
```cs
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
{% endblock %}



{% block win %}
```cs
if (play.Player.IsMaster) {
    // ...
    var data = new Dictionary<string, object>();
    data.Add("winnerId", play.Room.Master.ActorId);
    var opts = new SendEventOptions();
    opts.ReceiverGroup = ReceiverGroup.All;
    play.SendEvent("win", data, opts);
}
```
{% endblock %}



{% block custom_event %}
```cs
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
{% endblock %}



{% block demo %}
我们通过 Unity 完成了这个 Demo，供大家运行参考。

[QuickStart 工程](https://github.com/leancloud/Play-CSharp-Quick-Start)。
{% endblock %}