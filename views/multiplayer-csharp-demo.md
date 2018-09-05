# 实现小游戏「炸金花」

本文是基于实时对战 SDK Unity（C#）制作的简化版在线对战类游戏「炸金花」，目的在于让用户迅速了解如何使用实时对战。

## Demo

这个 Demo 是基于 Unity 引擎及 Play 实时对战 SDK 开发的，从中你可以了解：

* 连接游戏大厅
* 创建或加入房间
* 获取房间玩家变化（加入、离开）
* 通过「房间属性」控制及存储房间数据，例如：房间的总金币等。
* 通过「玩家属性」控制和存储房间内玩家的数据和状态，例如：玩家的金币数、玩家的闲置、准备、游戏状态。
* 通过 RPC 接口完成远程调用操作，例如：玩家选择跟牌、棋牌等操作。

[点击此处](https://github.com/leancloud/Play-SDK-dotNET) 查看该工程的全部代码。

开发环境及版本：

* Unity 5.6.3p4
* Visual Studio Community
* 实时对战 SDK Unity（C#)

## Demo 流程

* 玩家输入 UserID 后连接至实时对战云。
* 选择创建或加入房间。
* 普通玩家加入房间之后可以选择「准备状态」。
* 当房间总玩家数不少于 2 人，并且其他玩家处于「准备状态」时，房主可以开始游戏。
* 开始游戏后，房主给每个玩家发 3 张牌，然后从房主开始，选择操作。
* 玩家可以选择「跟牌」、「弃牌」、「比牌」操作，依次从房主开始到每个人执行选择。（每次跟牌需要花费 100 金币）
* 循环上步至其他玩家选择「弃牌」或「比牌」之后，得到最后的胜出者。

## 代码分析

### 连接

通过输入用户的 UserID 连接至实时对战服务器，此处的 UserID 由开发者提供，可以是用户名，昵称等，或任意字段的组合。UserID 最好是字母和数字的组合。

![连接](images/unity/playdemo-1.png)

**注意：请保证 UserID 唯一。**

```cs
Play.UserID = userId;
Play.Connect("0.0.1");
```

在连接成功后会回调至 `OnAuthenticated()` 接口，在 Demo 中会跳转至「房间场景」。

```cs
[PlayEvent]
public override void OnAuthenticated() 
{
    // 跳转至房间场景
    SceneManager.LoadScene("room");
}
```

注意：所有 SDK 回调的方法都要注意命名，并且需要添加 `[PlayEvent]` 属性。

### 创建 / 加入房间

用户可以通过 `Play.CreateRoom(room)` 创建房间。

![创建 / 加入房间](images/unity/playdemo-2.png)

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;
roomConfig.MaxPlayerCount = 4;
Play.CreateRoom(roomConfig, roomId);
```

房间创建完后，SDK 会依次回调 `OnCreatingRoom()` 和 `OnCreatedRoom()` 或 `OnCreateRoomFailed(int errorCode, string reason)`。如果房间创建成功，玩家会自动加入到房间，所以还会回调 `OnJoinedRoom()`。

通过 `Play.JoinRoom(roomId)` 加入房间。

```cs
Play.JoinRoom(roomId); // roomId 为房间 Id
```

调用加入房间后，SDK 会依次调用 `OnJoiningRoom()` 和 `OnJoinedRoom()` 或 `OnJoinRoomFailed(int errorCode, string reason)`。如果加入失败，会在参数中给出失败原因。

Demo 在加入房间成功后，会设置默认状态为 IDLE，并跳转至「战斗场景」。

```cs
[PlayEvent]
public override void OnJoinedRoom() 
{
    // 当玩家加入房间后，玩家默认设置为「空闲」状态
    Debug.Log("joined room");
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_IDLE);
    Play.Player.CustomProperties = prop;
    SceneManager.LoadScene("Fight");
}
```

### 开始游戏

#### 同步准备状态

Demo 中「房主」和「普通玩家」的操作是不一样的，默认当「所有玩家」都准备完成后，「房主」才可以开始游戏。

> 房主是指创建房间的玩家，普通玩家指除了房主之外加入房间的玩家。

这时，需要同步普通玩家的状态，这里需要用到 SDK 的「玩家属性」的功能。通过设置「玩家属性」，SDK 会将**变更的属性**自动同步给房间内的所有玩家（包括自己）。

![同步准备状态](images/unity/playdemo-3.png)

```cs
// 设置玩家的状态为「准备」
Hashtable prop = new Hashtable();
prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_READY);
Play.Player.CustomProperties = prop;
```

#### 接收属性同步

当玩家变更了属性之后，SDK 会通过 `OnPlayerCustomPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties)` 接口自动同步给房间内的所有玩家。

以「同步准备状态」为例，Demo 会在接收到玩家属性变更回调后，设置变更玩家的 UI 显示。如果是房主，则判断当前「已经准备的玩家数量」，如果所有玩家都已准备完成，则可以「开始游戏」，代码如下：

```cs
[PlayEvent]
public override void OnPlayerCustomPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties) 
{
    foreach (var key in updatedProperties.Keys) 
    {
        string keyStr = key as string;
        if (keyStr == Constants.PROP_STATUS)
        {
            // 玩家状态变化处理
            onPlayerStatusPropertiesChanged(player, updatedProperties);
        }
        else if (keyStr == Constants.PROP_POKER)
        {
            // 玩家牌变化处理
            onPlayerPokerPropertiesChanged(player, updatedProperties);
        }
        else if (keyStr == Constants.PROP_GOLD)
        {
            // 玩家金币变化处理
            onPlayerGoldPropertiesChanged(player, updatedProperties);
        }
    }
}

void onPlayerStatusPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties) 
{
    // 刷新玩家 UI
    int status = (int) updatedProperties[Constants.PROP_STATUS];
    ui.setPlayerStatus(player.UserID, status);
    if (Play.Player.IsMasterClient) 
    {
        // 计算「已经准备」玩家的数量
        int readyPlayersCount = Play.Players.Where(p =>
        {
            int s = (int)p.CustomProperties[Constants.PROP_STATUS];
            return s == Constants.PLAYER_STATUS_READY;
        }).Count();
        if (readyPlayersCount > 1 && readyPlayersCount == Play.Players.Count()) 
        {
            ui.enableStartButton();
        }
    }
}
```

#### 发牌

「房主」在所有玩家准备完成后，开始游戏。

![用户操作示例](images/unity/playdemo-4.png)

其中最重要的是给每个玩家随机发 3 张牌，这里我们需要将 3 张牌的数据存放至「玩家属性」中。而牌的类型是我们自定义的，为了兼容这种模式，需要将牌的对象数据序列化成 JSON 字符串后设置。当获得后，再反序列化为「牌的对象」。

注：我们这里用到了 JSON .NET 第三方库，这里也可以选用其他的序列化方式，只要符合 CustomProperties 的类型即可。

发牌代码：

```cs
// 初始化牌数据
this.pokerProvider.init();
// 发牌
foreach (LeanCloud.Player player in Play.Room.Players) 
{
    int status = (int)player.CustomProperties[Constants.PROP_STATUS];
    if (status == Constants.PLAYER_STATUS_READY)
    {
        // 设置每个玩家的游戏开始时的初始状态
        Hashtable prop = new Hashtable();
        Poker[] pokers = this.pokerProvider.draw();
        // 设置玩家的「游戏状态」
        prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_PLAY);
        // 设置玩家的初始金币
        prop.Add(Constants.PROP_GOLD, 10000);
        // 设置玩家的抓到的三张牌
        string pokersJson = JsonConvert.SerializeObject(pokers);
        Debug.Log("pokers json: " + pokersJson);
        prop.Add(Constants.PROP_POKER, pokersJson);
        player.CustomProperties = prop;
        // 添加到玩家列表中
        playerIdList.AddLast(player.ActorID);
    }
}
```

接收代码：

```cs
void onPlayerPokerPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties) 
{
    string pokersJson = player.CustomProperties[Constants.PROP_POKER] as string;
    // 反序列化三张牌对象
    Poker[] pokers = JsonConvert.DeserializeObject<Poker[]>(pokersJson);
    // 设置场景中的牌对象
    if (player.IsLocal) 
    {
        scene.draw(player, pokers);
    } 
    else 
    {
        scene.draw(player, pokers);
    }
}
```

### 玩家操作

玩家操作包括：

- 跟牌：继续下注
- 弃牌：放弃游戏
- 比牌：和其他玩家比较牌大小，确定胜出者。

#### 跟牌

从这里开始，我们将使用实时对战中的另一个同步方式：RPC。RPC 由一个开发者定义的字符串名称，接受对象枚举值，调用参数组成。

在 Demo 中，如果玩家选择「跟牌」，会执行三步逻辑：

* 扣除这个玩家的金币（Demo 中固定是 100 金币）
* 将扣除的金币加入到房间的「总的下注金币池」，这里用到了「房间属性」。同理「玩家属性」处理 `OnPlayerCustomPropertiesChanged`。
* 通知下一个玩家做出选择

玩家选择跟牌代码：

```cs
Play.RPC("rpcFollow", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

这里 RPC 的发送对象时 `PlayRPCTargets.MasterClient`，也就是「房主」。由房主做出逻辑运算后，继续游戏。`Play.Player.ActorID` 是当前选择跟牌的用户 ID。

接收跟牌 RPC 回调代码：

```cs
// 注意：RPC 回调方法需要添加 [PlayRPC] 属性
[PlayRPC]
public void rpcFollow(int playerId) 
{
    // 扣除玩家金币
    IEnumerable<LeanCloud.Player> players = Play.Room.Players;
    LeanCloud.Player player = players.FirstOrDefault(p => p.ActorID == playerId);
    int gold = (int)player.CustomProperties[Constants.PROP_GOLD];
    int followGold = 100;
    gold -= followGold;
    Hashtable goldProp = new Hashtable();
    goldProp.Add(Constants.PROP_GOLD, gold);
    player.CustomProperties = goldProp;

    // 增加房间金币
    int roomGold = (int)Play.Room.CustomProperties[Constants.PROP_ROOM_GOLD];
    roomGold += followGold;
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_ROOM_GOLD, roomGold);
    Play.Room.CustomProperties = prop;

    int nextPlayerId = getNextPlayerId(playerId);
    notifyPlayerChoose(nextPlayerId);
}

// 获取下一个应该操作的玩家
private int getNextPlayerId(int playerId) 
{
    LinkedListNode<int> nextPlayer = playerIdList.Find(playerId).Next;
    if (nextPlayer == null)
    {
        nextPlayer = playerIdList.First;
    }
    return nextPlayer.Value;
}

// 通知玩家操作
void notifyPlayerChoose(int playerId)
{
    IEnumerable<LeanCloud.Player> players = Play.Room.Players;
    LeanCloud.Player player = players.FirstOrDefault<LeanCloud.Player>((p) => p.ActorID == playerId);
    Play.RPC("rpcChoose", PlayRPCTargets.All, playerId);
}
```

#### 弃牌

弃牌使用的同步方式与跟牌类似。

* 设置弃牌玩家的状态，并从当前参与游戏的玩家列表中移除。
* 判断当前参与游戏的玩家数量：如果只有 1 个玩家时，则此玩家胜出；否则，通知下一个玩家做出选择操作。

玩家选择弃牌代码：

```cs
Play.RPC("rpcDiscard", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

参数同上面的「跟牌」。

接收弃牌 RPC 回调代码：

```cs
[PlayRPC]
public void rpcDiscard(int playerId) 
{
    IEnumerable<LeanCloud.Player> players = Play.Room.Players;
    // 设置棋牌玩家状态
    LeanCloud.Player player = players.FirstOrDefault(p => p.ActorID == playerId);
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_DISCARD);
    player.CustomProperties = prop;
    // 从当前玩家列表中移除
    playerIdList.Remove(player.ActorID);

    if (playerIdList.Count > 1) 
    {
        // 请下一个玩家做出选择
        int nextPlayerId = getNextPlayerId(playerId);
        notifyPlayerChoose(nextPlayerId);
    } 
    else 
    {
        // 剩者为王
        int winnerId = playerIdList.First.Value;
        Play.RPC("rpcResult", PlayRPCTargets.All, winnerId);
    }
}
```

#### 比牌

这里的「比牌」操作做了简化，直接在当前所有参与游戏的玩家列表中，计算手牌的总分，并按分数排序，「第一个玩家」即为胜出者，

并通知房间内所有的玩家：胜出者。所有玩家根据当前胜出者是否为「自己」，做出 UI 展示。

玩家选择比牌代码：

```cs
Play.RPC("rpcCompare", PlayRPCTargets.MasterClient);
```

接收比牌 RPC 回调代码：

```cs
[PlayRPC]
public void rpcCompare() 
{
    var playersByScoreOrder = Play.Players.Where(p =>
    {
        int status = (int)p.CustomProperties[Constants.PROP_STATUS];
        return status == Constants.PLAYER_STATUS_PLAY;
    }).OrderByDescending(p =>
    {
        // 查找
        Player player = scene.GetPlayer(p);
        return player.getScore();
    });
    LeanCloud.Player winPlayer = playersByScoreOrder.FirstOrDefault();
    Play.RPC("rpcResult", PlayRPCTargets.All, winPlayer.ActorID);
}
```

接收比赛结果 RPC 回调代码：

```cs
[PlayRPC]
public void rpcResult(int winnerId) 
{
    Debug.Log("winnerId: " + winnerId);
    if (winnerId == Play.Player.ActorID) 
    {
        ui.showWin();
    } 
    else 
    {
        ui.showLose();
    }
}
```

![比赛结果](images/unity/playdemo-5.png)

注：Demo 主要展现 Play SDK 功能，所以在原有玩法上做了简化。

