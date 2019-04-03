{% import "views/_helper.njk" as docs %}

{% macro gettingStarted() %}

## 开始之前

请确保您已熟练的掌握了即时通讯里面关于对话，消息，权限等必要的知识，如果您还不了解这些概念，请一定阅读我们的主文档：[《即时通讯服务总览》](./realtime_v2.html)，了解一下即时通讯的基本概念和模型以及我们的即时通讯 SDK 开发指南：

- [iOS - Objective-C](realtime_guide-objc.html)
- [Android - Java](realtime_guide-android.html)
- [JavaScript](realtime_guide-js.html)
- [Windows Classic Desktop - C#](realtime-guide-dotnet.html)
- [Unity - C#](realtime-unity.html)

{% endmacro %}

{% macro usingNamespces() %}
```cs
using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Linq.Expressions;

using LeanCloud;
using LeanCloud.Realtime;
using LeanCloud.Storage.Internal;
using LeanCloud.Core.Internal;
```
{% endmacro %}

{% macro receivedMessage() %}
接收消息在每个语言的 SDK 略有不同，但是大致的流程是一致的，详细的请阅读每个语言对应的 SDK 文档：

- [iOS Objectivc-C#接收消息](realtime_guide-objc.html#接收消息)
- [Android Java#接收消息](realtime_guide-android.html#接收消息)
- [JavaScript#接收消息](realtime_guide-js.html#接收消息)

{% endmacro %}

{% macro customMessage() %}

### 自定义消息类型

之前的代码和示例仅演示了文本消息类型的发送和接收，在游戏中文本消息固然是一种主要类型，但更为普遍的是表情消息，一般情况下实现表情消息的步骤如下：

1. 客户端将表情图片事先按照编号（类似于 #1、#2）存储在客户端的资源包里
2. 消息发送的时候，从本地资源包内加载表情列表，然后用户选择一个表情，点击发送
3. 发送的时候，并没有实际发送这个表情的物理文件，而是将编号发送给对方接收端
4. 接收端收到编号之后，在加载消息详情时，根据编号读取物理文件，显示出来

这是传统网游在实现表情消息的逻辑，实际上可以看出，表情消息在代码层面本质上依然是个文本消息，接下来我们就来自定义一个表情消息。

#### 类型编码
在介绍自定义消息之前，开发者可以在调试过程中打开日志打印的功能[打开调试日志](#打开调试日志)，每一次客户端和云端的相互发送 WebSocket 消息的内容会打印在控制台上

然后可以运行一下发送消息的代码，在控制台就能看到如下日志内容：

```json
websocket=>{"msg":"{\"_lctype\":-1,\"_lctext\":\"兄弟们，睡什么睡，起来嗨！\"}","cid":"58ddc56e92509726c3dc3322","r":true,"i":-65533,"cmd":"direct","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","peerId":"1001"}
websocket<={"uid":"_6jfc+4KT7KtkEgw8lJnAA","t":1490929028400,"i":-65533,"cmd":"ack","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","peerId":"1001"}
```

- `websocket=>` 后面的内容是：由客户端发往 LeanCloud 云端。
- `websocket<=` 则代表：由云端发往客户端的内容。

从上面的日志可以看出，一条文本消息的主要内容就是 msg 这个字段里面的内容：

```json
{"msg":{"_lctype":-1,"_lctext":"兄弟们，睡什么睡，起来嗨！"}}
```

一条文本消息由两个字段组成：类型和文本内容。在 LeanCloud 即时通讯私有协议里面，带有下划线 `_lc` 是受保护字段，SDK 都会主动识别这个字段的含义。

因此要实现一个表情消息，开发者可以自定义使用 `AVIMTypedMessageTypeIntAttribute` 标注一个 `AVIMTypedMessage` 的子类，SDK 在发送消息的时候会自动的在消息体内部把它的值转化为 `_lctype` 的值，比如设置成 2：

```cs
[AVIMMessageClassName("MyTypedMessage")]
[AVIMTypedMessageTypeIntAttribute(2)]// 加了这个标记之后，2 会被自动添加为 `_lctype` 的类型值
public class MyTypedMessage: AVIMTypedMessage {
    public MyTypedMessage()
    {

    }
}
```
控制台可以看见如下的日志：
```json
websocket=>{"msg":"{\"...\":\"...\",\"_letype\":2}","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1002"}
```


{{ docs.alert("注意：不建议开发者对 `_lctype` 使用负数值，而建议使用从 1 开始的正数。") }}

### 1. 消息子类化

#### 1.1 继承 AVIMTypedMessage
定义一个 `Emoji` 类:

```cs
/// <summary>
/// 自定义表情消息
/// </summary>
[AVIMMessageClassName("Emoji")]
[AVIMTypedMessageTypeIntAttribute(2)]// 加了这个标记之后，2 会被自动添加为 `_lctype` 的类型值
public class Emoji: AVIMTypedMessage
{
    [AVIMMessageFieldName("Ecode")]
    public string Ecode { get; set; }
}
```

然后在程序初始化的时候一定要注册这个子类：

```cs
avRealtime.RegisterMessageType<Emoji>();
```

发送的时候如下：

```cs
var emojiMessage = new Emoji()
{
    Ecode = "#e001",// 应用内置的表情编码
};
currentConveration.SendMessageAsync(emojiMessage);
```

接收方代码如下：

```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is Emoji)
    {
        var emojiMessage = (Emoji)e.Message;
        var ecode = emojiMessage.Ecode;
        Debug.Log(string.Format("received emoji with code is {0}", ecode));
        // 当接收方接收到了这条表情消息，可以在客户端做一些酷炫的 UI 展现
    }
}
```

注意：接收方也一定要注册子类。

可以打开日志查看：

```json
websocket=>{"msg":"{\"ECode\":\"#e001\",\"_letype\":2}","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1002"}
```

#### AVIMTypedMessage 详解

`AVIMTypedMessage` 的设计目的是为了提供默认的基于 JSON 消息体的基类，例如 `AVIMTextMessage` 类对应为文本消息，它的消息体是如下格式的 JSON 字符串：

```json
{\"_lctext\":\"text content\",\"_lctype\":-1}
```

而加了 `AVIMTypedMessageTypeIntAttribute` 标记之后会自动的被 SDK 识别为 `_lctype` 发送到对话中，例如上面的 `Emoji` 消息：

```json
{\"ECode\":\"#e001\",\"_letype\":2}
```

因此 `AVIMTypedMessage` 的子类都会对 msg 字段进行 JSON 序列化和反序列化。

#### 1.2 继承 AVIMMessage 

为了更加开放地允许开发者自定义自己的消息类，SDK 提供了一个接口，只要开发者实现自定义的消息类实现了这个接口，这个消息就可以在 SDK 中发送，并且在接收时返回的也是这个消息的实例。继续以上面的表情消息做例子，这次我们定义为一个 V2 版本的表情消息：

```cs
[AVIMMessageClassName("EmojiV2")]
public class EmojiV2 : AVIMMessage
{
    // 默认构造函数
    public EmojiV2()
    {

    }
    public EmojiV2(string ecode)
    {
        Content = ecode;
    }
}
```

十分重要的细节：**子类化的时候，子类必须有一个默认的构造函数，否则在注册的时候会跑出 ArgumentException 的错误**。

注册子类：

```cs
avRealtime.RegisterMessageType<EmojiV2>();
```

发送的代码如下：

```cs
var emojiV2Message = new EmojiV2("#e001");
conversation.SendMessageAsync(emojiV2Message);
```

在日志中可以看到它实际发送的内容：

```json
websocket=>{"msg":"#e001","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1001"}
```

### 2. Free-Schema 消息体（非子类化）
我们了解到诸多限制会让游戏开发者选择一种自由的格式去收发自定义的消息体，子类化只是满足了一部分需求，因此我们也设计了一种方式，让开发者可以自由定义消息格式而并不一定要继承自 `AVIMMessage`，比如在游戏当中需要发送一个二进制格式的消息，我们按照自定义消息类型声明、发送消息、以及接收消息三个步骤来实现这个需求。


#### 2.1 实现 IAVIMMessage 接口

参考如下定义，我们声明了一个二进制消息：

```cs
 /// <summary>
/// 二进制消息
/// </summary>
[AVIMMessageClassName("BinaryMessage")]
public class BinaryMessage : IAVIMMessage
{
    public BinaryMessage()
    {

    }
    /// <summary>
    /// 从 bytes[] 构建一条消息
    /// </summary>
    /// <param name="data"></param>
    public BinaryMessage(byte[] data)
    {
        BinaryData = data;
    }

    public byte[] BinaryData { get; set; }

    public string ConversationId
    {
        get; set;
    }

    public string FromClientId
    {
        get; set;
    }

    public string Id
    {
        get; set;
    }

    public long RcpTimestamp
    {
        get; set;
    }

    public long ServerTimestamp
    {
        get; set;
    }

	public	bool MentionAll 
    { 
        get; set; 
    }

    public IEnumerable<string> MentionList 
    { 
        get; set; 
    }


    public IAVIMMessage Deserialize(string msgStr)
    {
        var spiltStrs = msgStr.Split(':');
        this.BinaryData = System.Convert.FromBase64String(spiltStrs[1]);
        return this;
    }

    public string Serialize()
    {
        return "bin:" + System.Convert.ToBase64String(this.BinaryData);
    }

    public bool Validate(string msgStr)
    {
        var spiltStrs = msgStr.Split(':');
        return spiltStrs[0] == "bin";
    }
```

注册子类:

```cs
realtime.RegisterMessageType<BinaryMessage>();
```

##### 发送自定义消息
假设我们发送的二进制内容是一个字符串「I love Unity」，那么使用这个类型并且发送这个类型消息的代码为：

```cs
private Task SendBinaryMessageAsync()
{
    var text = "I love Unity";
    var textBytes = System.Text.Encoding.UTF8.GetBytes(text);
    var binaryMessage = new BinaryMessage(textBytes);
    convsersation.SendMessageAsync(binaryMessage);
}
```

打开日志监听可以看见 websocket 发送的内容如下：

```json
{"msg":"bin:SSBsb3ZlIFVuaXR5","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65531,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1001"}
```

##### 接收方获取自定义消息

接收方通过订阅 `AVIMClient.OnMessageReceived` 事件来监听消息的接收:

```cs
private void AVIMClient_OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is BinaryMessage)
    {
        var binaryMessage = e.Message as BinaryMessage;
        var binaryData = binaryMessage.BinaryData;
        // 下面的字符串内容就是 I love Unity
        var text = System.Text.Encoding.UTF8.GetString(binaryData);
    } 
}
```
{% endmacro %}


{% macro signature() %}
## 鉴权与签名
即时通讯系统中往往会存在一定的管理需求，例如游戏中 GM 会禁言某一些不良行为的玩家，或者说不允许某一个玩家加入到某个频道。LeanCloud 即时通讯采用签名鉴权的方式，请开发者务必详细了解 [安全与签名](realtime-guide-senior.html#安全与签名)。而在 SDK 中，开发者需要通过实现 `ISignatureFactory` 接口，并且在初始化的时候指定给 `AVRealtime`：

### 云引擎签名实例
为了配合如下代码的运行，首先开发者需要从 [node-js-getting-started](https://github.com/leancloud/node-js-getting-started) 创建一个新的云引擎项目，然后将 [即时通讯签名 Demo](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/rtm-signature.js) 复制到新项目的 `functions` 目录，然后部署到你的云引擎上。

```cs
public class LeanEngineSignatureFactory : ISignatureFactory
{
    public Task<AVIMSignature> CreateConnectSignature(string clientId)
    {
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        return AVCloud.CallFunctionAsync<IDictionary<string,object>>("sign2", data).OnSuccess(_ => 
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s,t,n);
            return signature;
        });
    }

    public Task<AVIMSignature> CreateConversationSignature(string conversationId, string clientId, IEnumerable<string> targetIds, ConversationSignatureAction action)
    {
        var actionList = new string[] { "invite", "kick" };
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        data.Add("conv_id", conversationId);
        data.Add("members", targetIds.ToList());
        data.Add("action", actionList[(int)action]);
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign2", data).OnSuccess(_ =>
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s, t, n);
            return signature;
        });
    }

    public Task<AVIMSignature> CreateQueryHistorySignature(string clientId, string conversationId)
    {
        return Task.FromResult<AVIMSignature>(null);
    }

    public Task<AVIMSignature> CreateStartConversationSignature(string clientId, IEnumerable<string> targetIds)
    {
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        data.Add("members", targetIds.ToList());
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign2", data).OnSuccess(_ =>
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s, t, n);
            return signature;
        });
    }
}
```

然后在初始化的时候指定给 `AVRealtime`：

```cs
var config = new AVRealtime.Configuration()
{
    ApplicationId = "{{appid}}",
    ApplicationKey = "{{appkey}}",
    SignatureFactory = new LeanEngineSignatureFactory()
};
var realtime = new AVRealtime(config);
```

按照以上步骤就能实现云引擎对聊天签名鉴权的操作。

开发者可以使用云引擎的云函数来实现自己的鉴权逻辑，比如谁可以加入对话、谁可以踢人加人，都由云函数返回的签名是否正确来判断——如果允许就返回一个符合算法的签名，LeanCloud 云端比对过签名就可以放行，而开发者的云函数返回了一个错误签名时，比如随便一个字符串「no!」，SDK 带着这个签名去 LeanCloud 云端请求，云端发现签名不匹配便会拒绝这次请求。

{% endmacro %}

{% macro exception() %}

## 异常处理
在所有 SDK 内部的异步方法中(返回值为`Task`类型的接口)，异常都不会直接抛出而是会在 `Task.Exception` 里面获取，参考如下处理方式。

假设场景是因为意外情况短断线，但是用户恰巧在断线的时候点击发送消息，那么 SDK 会抛出一个异常

```cs
conversation.SendMessageAsync(new AVIMTextMessage("兄弟们，睡什么睡，起来嗨！")).ContinueWith(s =>
{
    if (s.Exception != null)
    {
        // 通过获取异常集合来判断该项操作所可能导致了多种异常
        var inners = s.Exception.InnerExceptions;

        if (inners != null)
        {
            Debug.Log("inners");
            foreach (var e in inners)
            {
                // 这里一定会有一个异常消息为：未能连接到服务器，无法发送消息。
                Debug.Log(e.Message);
            }
        }
    }
});
```

更为直接的方式是直接判断 `Task.IsFaulted` 就可以知道 `Task` 是否在执行的时候存在错误:

```cs
conversation.SendMessageAsync(new AVIMTextMessage("兄弟们，睡什么睡，起来嗨！")).ContinueWith(s =>
{
    if (s.IsFaulted)
    {
        Debug.Log("发送失败");
    }
});
```

{% endmacro %}

{% macro willMessage() %}

### Will 消息类型
Will 消息解决的问题是：当一个用户希望自己突然掉线之后，对话的其他成员能够得到通知。

Will 消息的本质是一个用户自己定一个 Will 消息（可能包含了一些业务逻辑相关的内容），发给云端，云端会将其缓存在云端，并不会马上发送给对话的成员，而是当云端检测到当前用户掉线了，则会立即将这条 Will 消息发送给对话的其他成员，这样可以方便开发者构建自己的断线通知的逻辑。

发送 Will 消息的代码如下：

```cs
var textMessage = new AVIMTextMessage("我是一条 will 消息，当发送者意外下线的时候，我会被下发给对话里面的其他成员");
conversation.SendMessageAsync(textMessage, will: true).OnSuccess(tag =>
{

});
```

客户端发送完毕之后就完全不用再关心这个消息了，云端会自动的在发送方掉线之后，立即发送给对话的其他成员。
需要格外注意的 will 消息类型有如下限制：

- 同一时刻只对一个对话生效
- 当 client 主动 close 时，will 消息不会下发，系统会认为这是计划性下线。

Will 消息可以针对场景的不同可以有如下用法：

#### 协同办公聊天工具
可以使用 will 消息通知某位用户忽然下线了，可以在其他人的页面上将其头像变成灰色或者其他展现方式。


#### 直播聊天室
直播聊天室中，可以显示某一位用户忽然掉线了，此时展示比较有个性的掉线宣言，比如发送的 will 消息体内的数据为「如果你看到了这句话，就说明我掉线了，你别急，我马上回来」之类的。


{% endmacro %}

{% macro readReceipt() %}
### 已读回执
已读回执对应的需求场景是：作为消息的发送者，不但想知道对方接收消息的时间，还想知道对方阅读这条消息的时间，并在页面上显示对方是否已读。

因此 我们也提供了一个接口来实现这个需求：

```objc
```
```java
```
```js
```
{% endmacro %}

{% macro plateformCustomMessageLinks() %}

- [iOS - Objective-C 自定义消息](realtime_guide-objc.html#自定义消息)
- [Android - Java 自定义消息](realtime_guide-android.html#自定义消息)
- [JavaScript 自定义消息](realtime_guide-js.html#自定义消息属性)
- [Windows Classic Desktop - C# 自定义消息](realtime-guide-dotnet.html#自定义消息)
- [Unity - C# 自定义消息](realtime-unity.html#自定义消息)
{% endmacro %}


{% macro unityCustomizeWebsocket() %}
## 自定义 SDK

Unity 的聊天 SDK 将 WebSocket 客户端的基本行为封装成了一个接口：

```cs
/// <summary>
/// LeanCloud WebSocket 客户端接口
/// </summary>
public interface IWebSocketClient
{

    /// <summary>
    /// 客户端 WebSocket 长连接是否打开
    /// </summary>
    bool IsOpen { get; }

    /// <summary>
    /// WebSocket 长连接关闭时触发的事件回调
    /// </summary>
    event Action<int, string, string> OnClosed;

    /// <summary>
    /// WebSocket 客户端遇到了错误时触发的事件回调
    /// </summary>
    event Action<string> OnError;

    /// <summary>
    /// 暂时留作日后打开日志跟踪时，当前版本并未调用，无需实现
    /// </summary>
    event Action<string> OnLog;
    /// <summary>
    /// 云端发送数据包给客户端，WebSocket 接收到时触发的事件回调
    /// </summary>
    event Action<string> OnMessage;

    /// <summary>
    /// 客户端 WebSocket 长连接成功打开时，触发的事件回调
    /// </summary>
    event Action OnOpened;

    /// <summary>
    /// 主动关闭连接
    /// </summary>
    void Close();

    /// <summary>
    /// 打开连接
    /// </summary>
    /// <param name="url">wss 地址</param>
    /// <param name="protocol">子协议</param>
    void Open(string url, string protocol = null);
    /// <summary>
    /// 发送数据包的接口
    /// </summary>
    /// <param name="message"></param>
    void Send(string message);
}
```

在 Unity SDK 中默认提供的使用的是 [sta/websocket-sharp](https://github.com/sta/websocket-sharp) 作为 WebSocket 客户端，这里给出以 [sta/websocket-sharp](https://github.com/sta/websocket-sharp) 实现上述接口的代码如下：

```cs
using System;
using WebSocketSharp;

/// <summary>
/// LeanCluod Unity Realtime SDK 内置默认的 WebSocketClient
/// 开发者可以在初始化的时候指定自定义的 WebSocketClient
/// </summary>
public class DefaultWebSocketClient : IWebSocketClient
{
    WebSocket ws;
    public bool IsOpen
    {
        get
        {
            return ws.IsAlive;
        }
    }

    public event Action<int, string, string> OnClosed;
    public event Action<string> OnError;
    public event Action<string> OnLog;
    public event Action<string> OnMessage;
    public event Action OnOpened;

    public void Close()
    {
        ws.CloseAsync();
        ws.OnOpen -= OnOpen;
        ws.OnMessage -= OnWebSokectMessage;
        ws.OnClose -= OnClose;
    }

    public void Open(string url, string protocol = null)
    {
        ws = new WebSocket(url);
        ws.OnOpen += OnOpen;
        ws.OnMessage += OnWebSokectMessage;
        ws.OnClose += OnClose;
        ws.ConnectAsync();
    }

    private void OnClose(object sender, CloseEventArgs e)
    {
        AVRealtime.PrintLog("Unity websocket closed without parameters.");
        if (this.OnClosed != null)
            this.OnClosed(e.Code, e.Reason, "");
    }

    private void OnWebSokectMessage(object sender, MessageEventArgs e)
    {
        if (this.OnMessage != null)
            this.OnMessage(e.Data);
    }

    private void OnOpen(object sender, EventArgs e)
    {
        if (this.OnOpened != null)
            this.OnOpened();
    }

    public void Send(string message)
    {
        if (this.IsOpen)
        {
            ws.SendAsync(message, (b) =>
            {

            });
        }

    }
}
```

假设开发者自己实现了上述接口，可以在初始化时指定给 SDK，这样 SDK 就会调用指定的 IWebSocketClient 来访问聊天服务端：

```cs
public class ChatTest : MonoBehaviour
{
    AVRealtime realtime;

    void Start()
    {
        var config = new AVRealtime.Configuration()
        {
            ApplicationId = "{{appid}}",
            ApplicationKey = "{{appkey}}",
            WebSocketClient = new MyWebSocketClient()// 这里可以换成开发者自己的实现
        };
        realtime = new AVRealtime(config);
    }
}
```

由于 [sta/websocket-sharp](https://github.com/sta/websocket-sharp) 已疏于更新而且不再支持 iOS，因此我们在 Unity 插件商店里面找到了另外一款 [WebSocket for desktop, web and mobile](https://www.assetstore.unity3d.com/cn/#!/content/27658) 插件。经过严格的测试，它完全可以使用在 iOS 10 以上的设备上，因此我们给出基于这款插件实现 `IWebSocketClient` 的代码如下：

```cs
using UnityEngine;
using System.Collections;
using LeanCloud.Realtime.Internal;
using System;
using LeanCloud.Realtime;
using System.Threading.Tasks;
using System.Collections.Generic;
using LeanCloud.Storage.Internal;
using LeanCloud.Core.Internal;
using UnityEngine.Networking;
using LeanCloud;
using LeanCloud.Realtime.Public.Unity;

public class UnityWebSocketClient : MonoBehaviour, WebSocketUnityDelegate, IWebSocketClient
{
    private static bool isInitialized = false;
    /// <summary>
    /// Initializes the LeanCloud SDK and begins running network requests created by LeanCloud.
    /// </summary>
    public virtual void Awake()
    {
        StartCoroutine(Initialize());

        // Force the name to be `AVRealtimeInitializeBehavior` in runtime.
        gameObject.name = "AVRealtimeInitializeBehavior";
    }

    /// <summary>
    /// 从云端获取分配的 WebSocket 地址
    /// </summary>
    public IEnumerator Initialize()
    {
        var avRealtimeInitializeBehavior = GameObject.FindObjectOfType<AVRealtimeBehavior>();
        if (isInitialized)
        {
            yield break;
        }
        isInitialized = true;
        yield return avRealtimeInitializeBehavior.FetchRouter();

        var url = avRealtimeInitializeBehavior.Server;

        Debug.Log("url:" + url);

        webSocket = new WebSocketUnity(url, this);
        webSocket.Open();

        Debug.Log("webSocket inited.");
    }

    void Start()
    {

    }

    void Update()
    {

    }
    // Web Socket for Unity
    //    Desktop
    //    WebPlayer
    //    Android
    //    ios (+ ios simulator)
    //      WebGL
    private WebSocketUnity webSocket;

    #region WebSocketUnityDelegate implementation

    // These callbacks come from WebSocketUnityDelegate
    // You will need them to manage websocket events

    // This event happens when the websocket is opened
    public void OnWebSocketUnityOpen(string sender)
    {
        Debug.Log("WebSocket connected, " + sender);
        if (this.OnOpened != null)
            this.OnOpened();
    }

    // This event happens when the websocket is closed
    public void OnWebSocketUnityClose(string reason)
    {
        Debug.Log("WebSocket Close : " + reason);
        this.OnClosed(-1, reason, "");
    }

    // This event happens when the websocket received a message
    public void OnWebSocketUnityReceiveMessage(string message)
    {
        // Debug.Log("Received from server : " + message);

        this.OnMessage(message);
    }

    // This event happens when the websocket received data (on mobile : ios and android)
    // you need to decode it and call after the same callback than PC
    public void OnWebSocketUnityReceiveDataOnMobile(string base64EncodedData)
    {
        // it's a limitation when we communicate between plugin and C# scripts, we need to use string
        byte[] decodedData = webSocket.decodeBase64String(base64EncodedData);
        OnWebSocketUnityReceiveData(decodedData);
    }

    // This event happens when the websocket did receive data
    public void OnWebSocketUnityReceiveData(byte[] data)
    {
        var decodeStr = System.Convert.ToBase64String(data);
        OnWebSocketUnityReceiveMessage(decodeStr);
    }

    // This event happens when you get an error@
    public void OnWebSocketUnityError(string error)
    {
        Debug.Log("error:" + error);
        Debug.LogError("WebSocket Error : " + error);
    }

    #endregion

    #region LeanCloud

    public bool IsOpen
    {
        get
        {
            var rtn = webSocket != null;
            if (rtn)
                rtn = webSocket.IsOpened();

            Debug.Log("IsOpen:" + rtn);
            return rtn;
        }
    }

    public void Close()
    {
        webSocket.Close();
    }

    public void Open(string url, string protocol = null)
    {
        webSocket.Open();

    }

    public void Send(string message)
    {
        if (this.IsOpen)
            webSocket.Send(message);
    }

    public event Action<int, string, string> OnClosed;

    public event Action<string> OnMessage;

    public event Action<string> OnLog;

    public event Action<string> OnError;

    public event Action OnOpened;

    #endregion

}
```
在初始化的时候指定即可，因为这个库的设计关系，要求必须是一个 `MonoBehaviour`，因此我们也最好在上面的代码里面加入 `Start()` 函数，这样就省去了额外再新建一个初始化的类：

```cs
void Start () {
    var config = new AVRealtime.Configuration ()
    {
        ApplicationId ="{{appid}}",
        ApplicationKey ="{{appkey}}",
        WebSocketClient = this // 使用已经初始化的 WebSocketClient 实例作为 AVRealtime 初始化的配置参数
    };
    avRealtime = new AVRealtime (config);
}
```

结合前面的初始化步骤，当前项目的 `Main Camera` 最好设置成如下样子:

![init](https://dn-lhzo7z96.qbox.me/1497505972767)

WebSocket 库的选择建议：

- 如果你的项目只需要发布到 PC 端（macOS、Windows、Linux），则完全可以使用 SDK 自带的 [sta/websocket-sharp](https://github.com/sta/websocket-sharp)。
- 如果你的项目需要面向 iOS 以及 Android 等移动端的手游，请务必购买 [WebSocket for desktop, web and mobile](https://www.assetstore.unity3d.com/cn/#!/content/27658) 插件。该款插件的授权许可不支持无偿使用。

### 插件使用额外的步骤

#### iOS & XCode
1.根据实际情况的测试，[WebSocket for desktop, web and mobile](https://www.assetstore.unity3d.com/cn/#!/content/27658) 插件在实际编译的过程中会在 XCode 中产生如下错误：

```
Showing Recent Issues
ld: '.../WebSocketUnity/Plugins/iOS/libWebSocketUnity-ios.a(WebSocketUnityInterface.o)' does not contain bitcode. You must rebuild it with bitcode enabled (Xcode setting ENABLE_BITCODE), obtain an updated library from the vendor, or disable bitcode for this target. for architecture arm64
```

解决方法是下载经过重新编译的 [libWebSocketUnity-ios.a](https://dn-lhzo7z96.qbox.me/1493265485923) 和 [libWebSocketUnity-iossimulator.a](https://dn-lhzo7z96.qbox.me/1493265520683) 将对应目录下的 `~/Assets/WebSocketUnity/Plugins/iOS/libWebSocketUnity-ios.a` 和 `~/Assets/WebSocketUnity/Plugins/iOS/libWebSocketUnity-iossimulator.a` 分别替换，然后用 Unity 重新编译到 iOS,生成 XCode 项目之后就可以直接部署到 iOS 设备以及模拟器。

2.如果 XCode 编译时出现了
```
Showing Recent Issues
  "_SecTrustGetCertificateCount", referenced from:
  -[SRWebSocket stream:handleEvent:] in libWebSocketUnity-ios.a(SRWebSocket.o)
```
和

```
Showing Recent Issues
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```
以上两个错误，请在 XCode 的 `Build Phases` -> `Link Binary With Libraries` 关联 `libcucore.tbd` 以及 `Security.framework`，如下图：

![link-libs](https://dn-lhzo7z96.qbox.me/1493266411053)

#### Android 
经过测试在 Android ，该插件所打包的 jar 包内部的 websocket lib 不支持 wss 加密链接，因此我们经过与该插件作者的沟通，我们重新打包了一个支持 wss 加密链接的 jar 包，下载地址是：
[websocketunity.jar](https://dn-lhzo7z96.qbox.me/1494239779983)，下载之后替换目标目录 `~/Assets/WebSocketUnity/Plugins/Android/websocketunity.jar` 即可。

##### 重写 WebSocketUnityAndroid 类

如果使用 Android monitor 日志抓取工具，抓取到了如下错误：

```
JNI ERROR (app bug): accessed stale local reference 0x200001 (index 0 in a table of size 0)
```

则需要重写 WebSocketUnityAndroid 类，打开插件目录中对应的 ：`~/Assets/WebSocketUnity/Platforms/Android/WebSocketUnityAndroid.cs` 文件，将其所有的代码替换为如下内容：

```cs
using UnityEngine;
using System.Collections;
using System.Threading;
using System;

#if UNITY_ANDROID
public class WebSocketUnityAndroid : IWebSocketUnityPlatform
{

    private class Attacher : IDisposable
    {
        private int tid;

        public Attacher(object o)
        {
            tid = System.Threading.Thread.CurrentThread.ManagedThreadId;
            if (tid != 1)
            {
                AndroidJNI.AttachCurrentThread();
            }
        }

        public void Dispose()
        {
            if (tid != 1)
            {
                AndroidJNI.DetachCurrentThread();
            }
        }
    }
    private AndroidJavaObject mWebSocket;

    // Constructor
    // param : url of your server (for example : ws://echo.websocket.org)
    // param : gameObjectName name of the game object who will receive events
    public WebSocketUnityAndroid(string url, string gameObjectName)
    {
        object[] parameters = new object[2];
        parameters[0] = url;
        parameters[1] = gameObjectName;
        mWebSocket = new AndroidJavaObject("com.jonathanpavlou.WebSocketUnity", parameters);
    }

    #region Basic features

    // Open a connection with the specified url
    public void Open()
    {
        using (new Attacher(this))
        {
            mWebSocket.Call("connect");
        }

    }

    // Close the opened connection
    public void Close()
    {
        using (new Attacher(this))
        {
            mWebSocket.Call("close");
        }

    }

    // Check if the connection is opened
    public bool IsOpened()
    {
        using (new Attacher(this))
        {
            return mWebSocket.Call<bool>("isOpen");
        }

    }

    // Send a message through the connection
    // param : message is the sent message
    public void Send(string message)
    {
        using (new Attacher(this))
        {
            mWebSocket.Call("send", message);
        }

    }

    // Send a message through the connection
    // param : data is the sent byte array message
    public void Send(byte[] data)
    {
        using (new Attacher(this))
        {
            mWebSocket.Call("send", data);
        }

    }


    #endregion

}
#else
public class WebSocketUnityAndroid {}
#endif // UNITY_ANDROID

```

{% endmacro %}
