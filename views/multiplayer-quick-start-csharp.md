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
        Debug.LogWarningFormat("[WARN] {0}", log);
    } else if (level == LogLevel.Error) {
        Debug.LogErrorFormat("[ERROR] {0}", log);
    }
};
```
{% endblock %}



{% block import %}
导入需要的命名空间

```cs
using LeanCloud.Play;
```

```cs
var client = new Client({{appid}}, {{appkey}}, "leancloud");
```
{% endblock %}



{% block connection %}
```cs
try {
    await client.Connect();
} catch (PlayException e) {
    // 连接失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);
}
```
{% endblock %}



{% block connectio_event %}
```cs
try {
    await client.JoinOrCreateRoom(roomName);
} catch (PlayException e) {
    // 创建或加入房间失败
    Debug.LogErrorFormat("{0}, {1}", e.Code, e.Detail);    
}
```

`JoinOrCreateRoom` 通过相同的 roomName 保证两个客户端玩家可以进入到相同的房间。请参考 [开发指南](multiplayer-guide-csharp.html#加入或创建指定房间) 获取更多关于 `JoinOrCreateRoom` 的用法。
{% endblock %}



{% block join_room %}
```cs
// 注册新玩家加入房间事件
client.OnPlayerRoomJoined += (newPlayer) => {
    Debug.LogFormat("new player: {0}", newPlayer.UserId);
    if (client.Player.IsMaster) {
        // 获取房间内玩家列表
        var playerList = client.Room.PlayerList;
        for (int i = 0; i < playerList.Count; i++) {
            var player = playerList[i];
            var props = new PlayObject();
            // 判断如果是房主，则设置 10 分，否则设置 5 分
            if (player.IsMaster) {
                props.Add("point", 10);
            } else {
                props.Add("point", 5);
            }
            player.SetCustomProperties(props);
        }
        var data = new PlayObject {
            { "winnerId", client.Room.Master.ActorId }
        };
        var opts = new SendEventOptions {
            ReceiverGroup = ReceiverGroup.All
        };
        client.SendEvent(GAME_OVER_EVENT, data, opts);
    }
};
```
{% endblock %}



{% block player_custom_props_event %}
```cs
// 注册「玩家属性变更」事件
client.OnPlayerCustomPropertiesChanged += (player, changedProps) => {
    // 判断如果玩家是自己，则做 UI 显示
    if (player.IsLocal) {
        // 得到玩家的分数
        long point = player.CustomProperties.GetInt("point");
        Debug.LogFormat("{0} : {1}", player.UserId, point);
        scoreText.text = string.Format("Score: {0}", point);
    }
};
```
{% endblock %}



{% block win %}
```cs
if (client.Player.IsMaster) {
    // ...
    var data = new PlayObject {
        { "winnerId", client.Room.Master.ActorId }
    };
    var opts = new SendEventOptions {
        ReceiverGroup = ReceiverGroup.All
    };
    client.SendEvent(GAME_OVER_EVENT, data, opts);
}
```
{% endblock %}



{% block custom_event %}
```cs
// 注册自定义事件
client.OnCustomEvent += (eventId, eventData, senderId) => {
    if (eventId == GAME_OVER_EVENT) {
        // 得到胜利者 Id
        int winnerId = eventData.GetInt("winnerId");
        // 如果胜利者是自己，则显示胜利 UI；否则显示失败 UI
        if (client.Player.ActorId == winnerId) {
            Debug.Log("win");
            resultText.text = "Win";
        } else {
            Debug.Log("lose");
            resultText.text = "Lose";
        }
        client.Close();
    }
};
```
{% endblock %}



{% block demo %}
我们通过 Unity 完成了这个 Demo，供大家运行参考。

[QuickStart 工程](https://github.com/leancloud/Play-CSharp-Quick-Start)。
{% endblock %}