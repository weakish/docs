# Play 游戏开发指南 &middot; Unity

## 前言
Play 是一个基于 C# 编写的 Unity 的组件，它具备如下几项主要的功能（包括但不限于）：

- 建立于云端的双向通讯长连接
- 创建对战房间（PlayRoom）
- 获取房间列表
- 加入房间
- 随机加入房间
- 根据匹配条件加入房间
- 寻找好友所在的房间
- 设置房间属性
- 获取房间玩家（Player）列表
- 修改玩家的属性
- 发送和接收 RPC 消息
- 离开房间

Play 解决了如下几种游戏场景的服务端需求（包括但不限于）：

- MOBA 多人在线实时对战
- 卡牌棋牌桌游
- 战棋

因此，Play 提供的服务简而言之就是

> 针对有强联网需求的网络游戏，提供了一整套的客户端 SDK 解决方案，不再需要自建服务端，省去了大多数的开发和运维成本。

## 必备的基础知识

Play 是基于 C# 开发运行在 Unity 的 Mono .NET 下的 SDK，因此开发者需要掌握如下基础知识：

- C# 的编程基础知识，重点是：Attribute，Event 等概念。
- WebSocket 是什么？如何使用 WebSocket 实现服务端和客户端的互相通信？
- 帧同步和状态同步的两种网游类型分别是如何实现的？

## SDK 的下载和导入以及初始化

### 下载获取动态链接库

首先需要访问：[Play-SDK-dotNET](https://github.com/leancloud/Play-SDK-dotNET/releases) 来获取最新版本的 SDK。

下载之后导入到 Unity 的 Assets 文件里，如下图：

![import-play-sdk](images/import-play-sdk.png)

然后将 LeanCloud.Play.dll 里面的  PlayInitializeBehaviour 挂在到 Main Camera（或者其他 Game Object）上，如下图：


![import-play-sdk](images/link-play-init-script.png)


### 打开客户端日志

如下代码将打开客户端的日志，可以帮助调试和进行问题反馈：

```cs
// 日志都会使用 Unity.Debug 打印在控制台
Play.ToggleLog();
```

## 使用 UserID 建立与服务端的通信

Play 目前只需要客户端设置一个 UserID 就可以直接连接云端，这个 UserID 拥有如下限制：

- 不支持中文和特殊字符（例如，！@#￥%……&*（）等，可以是下划线 _)
- 长度不能超过 64 字符
- 一个应用内全局唯一

案例：使用 hjiang 作为 UserID 连接云端服务器，成功之后服务端会回调 `OnAuthenticated`：

```cs
using LeanCloud;

namespace PlayDocSample
{
    /// <summary>
    /// 注册回调的类型，必须继承自 PlayMonoBehaviour
    /// </summary>
    public class SampleConnect : PlayMonoBehaviour
    {

        /// <summary>
        /// 并且一定要定无参数的构造函数，而且一定要调用父类的构造函数
        /// </summary>
        public SampleConnect() : base()
        {

        }

        void start()
        {
            // 打开调试日志
            Play.ToggleLog(true);
            // 设置 UserID
            Play.UserID = "hjiang";
            // 声明游戏版本，不同游戏版本的玩家会被分配在不同的隔离区域中
            Play.Connect("0.0.1");
        }


        [PlayEvent]
        public override void OnAuthenticated()
        {
            Play.Log("OnAuthenticated");
        }
    }
}
```

### 重要的步骤

在上述的实例中可以看见，代码中声明了一个 `ConnectSample` 类，它继承自 `PlayMonoBehaviour` ，并且在一定会有一个无惨的构造函数，并且调用了父类的 `base()` 构造函数，最后要为所有的时间毁掉加上 `[PlayEvent]` 属性标记，这些都是**必须的**，之后的实例代码都会如此做，开发者的代码也需要遵守这一约定，少了一项，事件回调就不会生效。


## 创建房间（Room）

### 指定房间名

```cs
using LeanCloud;

namespace TestUnit.NetFx46.Docs
{

    public class SampleCreateRoom : PlayMonoBehaviour
    {
        /// <summary>
        /// 并且一定要定无参数的构造函数，而且一定要调用父类的构造函数
        /// </summary>
        public SampleCreateRoom() : base()
        {

        }

        void start()
        {
            // 打开调试日志
            Play.ToggleLog(true);
            // 设置 UserID
            Play.UserID = "hjiang";
            // 声明游戏版本，不同游戏版本的玩家会被分配在不同的隔离区域中
            Play.Connect("0.0.1");
        }


        [PlayEvent]
        public override void OnAuthenticated()
        {
            Play.Log("OnAuthenticated");
            // 设置房间全局唯一的名称为 「test-game-001」 
            Play.CreateRoom("test-game-001");
        }

        /// <summary>
        /// 如果成功创建，则会回调到 OnCreatedRoom
        /// </summary>
        [PlayEvent]
        public override void OnCreatedRoom()
        {
            // 打印房间名称
            Play.Log("OnCreatedRoom", Play.Room.Name);
        }


        /// <summary>
        /// 如果创建失败，则会回调 OnCreateRoomFailed
        /// </summary>
        /// <param name="errorCode"></param>
        /// <param name="reason"></param>
        [PlayEvent]
        public override void OnCreateRoomFailed(int errorCode, string reason)
        {
            Play.LogError(errorCode, reason);
        }
    }
}

```

注：因为创建房间的逻辑和顺序都一致，因此本小节之后介绍创建房间时，为了更好的阅读体验和强调重点，不再给出每一种回调的实例代码，请参照上述代码即可。


### 随机房间名

如果不传入任何参数创建房间，**客户端会随机生成一个名称**，这个不用开发者担心，算法是经过测试，名字重复的概率约等于 GUID 重复的概率，所以几乎不可能。

```cs
Play.CreateRoom();
```

### 指定玩家 ID 

这个功能的解决的需求是：只允许一些特定的 ID 玩家可以加入到房间


```cs
// 指定 bill 和 steve
Play.CreateRoom(new string[] { "bill", "steve" });

// 或者一起顺便设置一下 Room Name
Play.CreateRoom(new string[] { "bill", "steve" },"RichMen");
```

### 限制玩家人数

目前 Play 所有的房间最多允许 **10** 人同时在一个房间进行游戏对战，有一些游戏甚至需要设置房间最多只有更少的人，比如斗地主只允许 3 个人加入，一旦人满了，其他的人是不可以加入的，因此在创建房间的时候可以设置房间的 MaxPlayerCount：

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;

roomConfig.MaxPlayerCount = 4;

Play.CreateRoom(roomConfig);

// 也可以顺便设置一下 room name 
Play.CreateRoom(roomConfig,"max4-room");
```


### 设置房间的自定义属性

房间的自定义属性指的是一些 key-value 的键值对，在创建成功之后，云端也会保留一份拷贝(注意这里不是持久化存储，当该房间失效之后)

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;

roomConfig.CustomRoomProperties = new Hashtable()
{
    { "level", 1000 },
    { "rankPoints", 3011 }
};
roomConfig.LobbyMatchKeys = new string[] { "rankPoints" };

Play.CreateRoom(roomConfig);
```

此处需要配合 [#根据条件随机加入](根据条件随机加入)来理解 LobbyMatchKeys 的作用。


### 是否开放房间允许别人加入

创建一个房间，然后不希望其他人家加入（比如单人的闯关或者单人副本的网游）：

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;

roomConfig.IsOpen = false;

// 如果不设置 IsOpen，云端创建的房间默认都允许其他人加入的
Play.CreateRoom(roomConfig);
```

### 房间是否在列表中可见

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;

roomConfig.IsVisible = false;

// 如果不设置 IsVisible，云端创建的房间默认都是可见的
Play.CreateRoom(roomConfig);
```

### 房间的相关限制和规则

#### 房间的失效

下列情况会导致房间在云端被清除，也就是认为这个房间失效了：

1. 所有成员都离开了
2. 所有成员都掉线，并且都没有重连回来，超过 30 分钟，云端就会认为失效


## 获取房间列表

### 一次性拉取 20 个房间

20 是 SDK 默认设置的数量，可以通过修改 limit 参数来修改这一数值。

```cs
[PlayEvent]
public override void OnAuthenticated()
{
    Play.FetchRoomList();
    // 或者一次性查询 30 个 room
    // Play.FetchRoomList(30);
}

[PlayEvent]
public override void OnFetchedRoomList(IEnumerable<PlayRoom> rooms)
{
    Play.Log(rooms.Count());
}
```

如果还想继续查询更多，只要继续调用 `Play.FetchRoomList()` 即可，如果想从头重新开始查询，只要传入一个 reset 参数即可：

```cs
Play.FetchRoomList(reset:true);
``` 


注意：房间的变化频率较快，所以本地 SDK 并没有做缓存，调用加入之后，需要监听加入的回调来判断是否真正加入成功，详细请看下一章节[加入房间](#加入房间)。

## 加入房间

### 根据 Name 加入

```cs
public class SampleJoinRoom : PlayMonoBehaviour
{
    /// <summary>
    /// 并且一定要定无参数的构造函数，而且一定要调用父类的构造函数
    /// </summary>
    public SampleJoinRoom() : base()
    {

    }

    void start()
    {
        // 打开调试日志
        Play.ToggleLog(true);
        // 设置 UserID
        Play.UserID = "hjiang";
        // 声明游戏版本，不同游戏版本的玩家会被分配在不同的隔离区域中
        Play.Connect("0.0.1");
    }


    [PlayEvent]
    public override void OnAuthenticated()
    {
        Play.Log("OnAuthenticated");

        // 加入 RichMen 房间
        Play.JoinRoom("RichMen");

    }

    [PlayEvent]
    public override void OnJoinedRoom()
    {
        Play.Log("OnJoinedRoom");

        var name = Play.Room.Name;
    }

    [PlayEvent]
    public override void OnJoinRoomFailed(int errorCode, string reason)
    {

    }
}
```

加入成功则会回调 OnJoinedRoom，加入失败则会回调 OnJoinRoomFailed。


### 随机加入

```cs
Play.JoinRandomRoom();
```

### 根据条件随机加入

配合前面的[设置房间的自定义属性](#设置房间的自定义属性)的代码：

```cs
var randomLobbyMatchKeys = new Hashtable
{
    { "rankPoints", 3000 }
};

// 根据 key-value 匹配加入
Play.JoinRandomRoom(randomLobbyMatchKeys);
```


## MasterClient

结合前面两大章节，我们需要明确一点，在无服务端进行网游对战的时候，通常都会有一个主机的概念（参照魔兽争霸局域网游戏里面的创建房间的 Host），因此 Play 提供了一个 MasterClient 的概念，MasterClient 指的就是房间 Host 玩家，它可能由以下几种玩家承担：

1. 房间最初的创建者，在他加入之后，自动成为第一任 MasterClient
2. A 创建了房间，随后 B 和 C 加入，然后因为 A 的网络异常，TA 掉线了，这个时候服务端会从现有的 B 和 C 里面挑选一个座位新任的 MasterClient，并且会下发 `OnMasterClientSwitched` 的事件回调通知
3. 前面条件 2 在 A 回来之后，A 也不会重新成为 MasterClient

## 房间的自定义属性

房间的自定义属性是预留给开发者自定义业务逻辑的，当你设置了一个属性之后，SDK 会上传到云端，云端会将这些属性下发给在同一个房间的其他玩家。

### 初始化房间属性

[设置房间的自定义属性](#设置房间的自定义属性)小节里面的代码就是初始化房间属性的代码，这里要详细描述一下自定义属性支持的类型：

- bool
- string
- 数字类型(byte,int,float,double等基础类型都支持)
- 字典类型 Dictionary
- List 类型(List<int>,List<string>等)

未来会支持更多类型，包括 Hashtable 或者是自定义类型。

```cs
var roomConfig = PlayRoom.PlayRoomConfig.Default;
roomConfig.CustomRoomProperties = new Hashtable()
{
    { "vip", ture },
    { "note", "welcome" },
    { "bonus",500 }
};
Play.CreateRoom(roomConfig);
```

### 修改房间属性

自定义属性的修改是增量修改的，比如当前已经有了一些属性，然后你只要设置一些增量就可以，客户端会做自动的合并，云端也会做校验，下发的通知也是做增量下发的：

```cs
[PlayEvent]
public override void OnJoinedRoom()
{
    var toUpdate = new Hashtable()
    {
        { "level", 1200 }
    };
    Play.Room.SetCustomProperties(toUpdate);
}
```

### CAS(check and save) 修改模式
为了原子化操作属性，也是为了防止冲突，Play 也支持 CAS 的模式修改属性：

实例代码如下：

```cs
[PlayEvent]
public override void OnJoinedRoom()
{
    var toUpdate = new Hashtable()
    {
        { "level", 1200 }
    };

    var when = new Hashtable()
    {
        { "level", 1000 }
    };
    Play.Room.SetCustomProperties(toUpdate, when);
}
```

上述代码的含义是：如果当前 level 是 1000 那么就修改为 level 值为 1200，否则就不修改。



### 收到房间属性被修改的通知


```cs
[PlayEvent]
public override void OnRoomCustomPropertiesUpdated(Hashtable updatedProperties)
{
    Play.Log("OnRoomCustomPropertiesUpdated");
    // 修改的增量会被通知给所有在房间的玩家
    Play.Log(updatedProperties.ToLog());
}
```

## 玩家(Player)的自定义属性

玩家的自定义属性与房间的自定义属性无本质差别，对外暴露的接口都是一个 Hashtable，操作也几近类似，只是事件回调不一样。

### 初始化玩家属性

```cs
[PlayEvent]
public override void OnNewPlayerJoinedRoom(Player player)
{
    var initData = new Hashtable();
    initData.Add("ready", false);
    initData.Add("gold", 200);

    player.CustomProperties = initData;
}
```

在玩家加入房间之后，初始化 TA 的自定义属性。


### 收到玩家的属性被修改的通知

注意，这里有一个点，不论是 A 修改了自己的属性，还是 A 修改了其他人的属性，都会在这里进行事件回调的通知：

```cs
[PlayEvent]
public override void OnPlayerCustomPropertiesChanged(Player player, Hashtable updatedProperties)
{
    Play.Log("OnPlayerCustomPropertiesChanged");
    Play.Log(player.UserID, updatedProperties.ToLog());
}
```

### 修改玩家属性

```cs
var cards = new Hashtable();
cards.Add("cards", new string[] { "1", "2", "3" });
Play.Player.CustomProperties = cards;
```

上述操作也会触发 `OnPlayerCustomPropertiesChanged`


## 远程调用函数 - RPC 

RPC 是提供给开发者自定义消息的一种方式，开发者可以通过定义 RPC ，发送 RPC 消息来实现多端的通信。

### 定义 RPC 方法

```cs
[PlayRPC]
public void OnSomebodySayHello(string words)
{
    var length = words.Length;
}
```

### 发送 RPC 消息

```cs
Play.RPC("OnSomebodySayHello", PlayRPCTargets.All, "hello");
```

上述消息发送出去，所有在房间的玩家都会收到 `OnSomebodySayHello` 的回调通知。

#### 指定消息接收者

只发给 MasterClient:

```cs
 Play.RPC("OnSomebodySayHello", PlayRPCTargets.MasterClient, "hello");
```

发给其他人（自己不接收)：

```cs
Play.RPC("OnSomebodySayHello", PlayRPCTargets.Others, "hello");
```

该消息希望被缓存，当前在线的玩家实时接收，并且后来加入的玩家在加入房间之后，也能收到:

```cs
Play.RPC("OnSomebodySayHello", PlayRPCTargets.OthersBuffered, "hello");
```


### 退出房间

```cs
Play.LeaveRoom();
```


