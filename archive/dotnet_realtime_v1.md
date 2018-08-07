# Windows Phone 8.0 即时通讯

## 简介

在阅读本开发指南之前，请先阅读下[《即时通讯开发指南》](./realtime.html)，了解即时通讯的基本概念和模型。


## 安装
为了支持即时通讯，我们依赖于一个开源的第三方的 WebSocket 的库，所以推荐开发者从[Nuget](https://www.nuget.org/packages/AVOSCloud.Phone/1.2.3.4-beta)上下载我们的 SDK。

为了更方便开发者阅读和理解 SDK 里面的各种抽象概念，我们先从一个应用场景来简单地剖析即时通讯组件在 Windows Phone 8.0 SDK 中如何使用。

## 单聊
### 场景设定
* 应用场景：参考微信单聊，微博私信
* 实现需求：用户A（UserA）想与用户B（UserB）进行单独聊天
* 实现步骤：

```
  Step1.UserA 创建 AVSession 与 LeanCloud 服务端建立长连接
  Step2.UserA 告诉 LeanCloud 服务端我要关注（Watch）UserB
  Step3.UserA 发送消息给 LeanCloud 服务端，因为在第二步的时候，已经关注了 UserB，LeanCloud 服务端就会把这条信息发送给 UserB
  Step4.UserB 想接收到别人发的消息，也需要创建 AVSession 与 LeanCloud 服务端建立长连接
  Step5.UserB 告诉 LeanCloud 服务端我也要关注（Watch）UserA
  Step6.UserB 就能收到第3步，由 UserA 发来的消息了。
```
### 场景实现
以上是一个最基本的聊天系统应该有的逻辑交互接收，在 LeanCloud 中，实现以上步骤需要如下代码：

```c#
AVSession session = new AVSession("UserA"); //Step1
session.Open("UserB"); //Step2
session.OnSessionOpen += (s_open, e_open) =>
{
session.SendMessage("Hello,B!", "UserB", true); //Step3
};
```
这是UserA需要做的事情，UserB 想要实现接收的话需要如下几步：

```c#
  AVSession session = new AVSession("UserB"); //Step4
  session.Open("UserA"); //Step5
  session.SetListener(new SampleAVSessionListener()
            {
                OnMessage = (s, msg) =>
                {
                    var content = msg.Message;
                    MessageBox.Show(content);
                }
            });
  ///最后这一步要做详细的解释。
  ///SampleAVSessionListener 是一个实现了接口 IAVSessionListener 简单的类，它实现了 IAVSessionListener 代理，
  ///这些代理的主要作用就是用来监听 SDK 所发出的具体的事件的响应。
```
附上 `SampleAVSessionListener` 的代码，开发者可以将如下代码拷贝到 Visual Studio 中：

```c#
public class SampleAVSessionListener : IAVSessionListener
{
        public SessionOpen OnSessionOpen { get; set; }//AVSession打开时执行的代理。
        
        public SessionPaused OnSessionPaused { get; set; }//AVSession 与服务端断开连接时执行的代理，一般都是因为 WP 手机锁屏或者应用被切换至后台了，所执行的代理。

        public SessionResumed OnSessionResumed { get; set; }//AVSession 重连成功之后执行的代理。

        public SessionClosed OnSessionClosed { get; set; }//关闭 AVSession 之后执行的代理。

        public Message OnMessage { get; set; }//接收到消息时执行的代理。

        public MessageSent OnMessageSent { get; set; }//消息发送成功之后执行的代理。

        public MessageFailure OnMessageFailure { get; set; }//消息发送失败执行的代理。

        public StatusOnline OnStatusOnline { get; set; }//当前用户的关注的人上线了所执行的代理（类似QQ好友上线了的敲门的声音）

        public StatusOffline OnStatusOffline { get; set; }//关注的人下线了。

        public PeersWatched OnPeersWatched { get; set; }//关注成功了所执行的代理（类似QQ好友通过验证之后，加为好友）

        public PeersUnwatched OnPeersUnwatched { get; set; }//取消关注之后所执行的代理。

        public Error OnError { get; set; }//发生错误时所执行的代理，例如抛出一些异常。
}
```
这样只要两边同时运行，UserB 就可以收到来自 UserA 发来的信息了。

以上代码和逻辑顺序能够很好的理解的话，关于 `IAVSessionListener` 这个接口的作用也一目了然，它所承担的职责就是帮助开发者用自己的代码与 SDK 进行交互，比如 `OnSessionOpen`：


每一次创建了一个 AVSession，只要连接创建成功，都会激发 OnSessionOpen 代理。

以此类推，根据开发者不同的需求需要对不同的代理做出相应的处理。也正因为如此，SDK 中只定义了接口，并没有定义一个强类型的类去给开发者使用，方便开发者将现有的一些功能与 `IAVSessionListener` 进行集成。

**注意：在任何时候创建了 `AVSession` 之后一定要主动并且显式的调用一下 `AVSession.SetListener` 方法，将代理设置成开发者自己定义的代理类，这一点是*必须*做的**。

### 开发建议
因为基于 WebSocket 是长连接通信，长连接占用系统资源较多，Windows Phone 上一旦锁屏就会造成连接中断，所以我们建议在 App.xaml 下定义个全局的 AVSession 进行全局的管理以及调用。

```
 public static AVSession session { get; set; }
```

## 基于事件的回调
基于事件的回调（EAP） 是 .NET 程序员熟悉的一种处理异步以及被动响应操作的常用方式，为此我们在聊天组件里面添加了一些被动响应的事件类型来响应消息的接收，群组人员变动等操作。

即时通讯是架构在长连接上的一种 Client——Server——Client 的模式，所以我们提供了一套 C# 程序员比较熟悉的基于事件的回调方式来处理即时通讯里面的相关操作，如果配合 Lambda 表达式，代码会显得优雅一点。

如发送消息可以有如下写法：

```c#
App.session.SendMessage("亲爱的，周末我们去哪里吃？", "Wife", false, (s, message) => 
            {
                //s 就是 接收到这个消息的 AVSession 实例。
                Console.WriteLine(message);
            });
```

以上方法实际上调用的是如下方法，只是用匿名方法作为回调的事件参数：


```c#
public void SendMessage(string msg, string toPeer, bool transient, 
            EventHandler<AVMessageReceivedEventArgs> onMessage);
```


如接收消息可以有如下写法：

```c#
AVSession session = new AVSession("UserB");//UserB 打开 Session
session.Open("UserA");//UserB 
session.OnMessage += (s, msg) =>
{
   var content = msg.Message;
   Dispatcher.BeginInvoke(() => 
   {
      MessageBox.Show(content.Message);
   });
};
```

与此类似的还有其他事件：

```
public event EventHandler<EventArgs> OnSessionOpen;
public event EventHandler<EventArgs> OnSessionPaused;
public event EventHandler<EventArgs> OnSessionResumed;
public event EventHandler<EventArgs> OnSessionClosed;
public event EventHandler<AVMessageSentEventArgs> OnMessageSent;
public event EventHandler<AVMessageReceivedEventArgs> OnMessage;
public event EventHandler<AVMessageSentFailedEventArgs> OnMessageFailed;

```

## 群组聊天
群组聊天区别于单聊，群组聊天的消息发往的是一个群组（AVGroup），所有在这个组里面的人都会接收到这个消息，并且在逻辑上群组有一些逻辑操作，比如加入群组，离开群组，拉人加入群组，移除某个组员，也就是说基于 LeanCloud Message 组件开发者即可以做类似QQ群的功能，也可以做类似微信的群聊的功能，这个全由开发者自己决定自己的群聊模式。

### 创建群组

```
string selfId = "Peter";
IList<string> peerIds = new List<string>() { "Mary" };
AVGroup group = new AVSession(selfId).GetGroup();
group.Join((sj, ej) =>
{
    Dispatcher.BeginInvoke(() =>
    {
        MessageBox.Show("you Joined!");//OnJoined 事件激发
    });
    group.AddMembers(peerIds, (sa, ea) =>
    {
        Dispatcher.BeginInvoke(() =>
        {
            if (ea.JoinedPeerIds[0] == "Mary")//OnMembersJoined 事件会响应两次，第一次为响应当前的 Peer （此时就是这个Peter） 加入，然后再响应 Mary 加入，因为对于一个 AVGroup，创建者在创建之后是自动加入该组。
            {
                MessageBox.Show("Mary joined!");
                group.SendMessage("Hello, Mary!", (ss, es) =>//当 Mary 加入之后就发送消息给她。
                {
                    Dispatcher.BeginInvoke(() =>
                    {
                        MessageBox.Show("Message sent!");//这是响应消息发送（OnMessageSent ）完毕之后的事件。
                    });
                }, null);
            }
        });

    });
});
```

创建成功的群组会被存放在 `AVOSRealtimeGroups` 这张表里，开发者可以登录到控制台进行查看。

### 加入群组

```
AVGroup avGroup = App.session.GetGroup("54753e1ee4b0b41b21e0e76e");//这个 54753e1ee4b0b41b21e0e76e 可以是查询出来的结果，这里只为做演示，具体的值应该是开发者创建成功的 AVGroup 的 objectId
avGroup.SendMessage("Hi,I'am Perter!",
    (ss, es) =>
    {
        Dispatcher.BeginInvoke(() =>
            {
                MessageBox.Show("sent！");//这是响应消息发送（OnMessageSent ）完毕之后的事件。
            });
    }, (sr,er)=>
    {
        Dispatcher.BeginInvoke(() =>
        {
            MessageBox.Show(er.Message.Message + " received！");//收到了消息就会触发 OnGroupMessageRecevied 事件。
        });
    });
```

### 发送消息
发送消息调用下面2个方法即可实现发消息：

```
public void SendMessage(AVMessage message, 
            EventHandler<AVGroupMessageSentEventArgs> onGroupMessageSent,
            EventHandler<AVGroupMessageReceivedEventArgs> onGroupMessageRecevied);

public void SendMessage(string msg,
            EventHandler<AVGroupMessageSentEventArgs> onGroupMessageSent,
             EventHandler<AVGroupMessageReceivedEventArgs> onGroupMessageRecevied);
```

### 接收消息
只要订阅了事件，就可以监听发送到该组的消息了。

```
public event EventHandler<AVGroupMessageReceivedEventArgs> OnMessage;
```

### 群成员管理
群组聊天目前的权限管理是开放给开发者自己去掌控和维护的，服务端只认证签名，假如开发者的应用开启了签名服务，如果没有开启签名认证，所有关于群成员的管理操作都被认为是有效的。

#### 加入成员

```
IList<string> peerIds = new List<string>() { "Mary","Alex" };
avGroup.AddMembers(peerIds, (sm, em) => 
{
    Dispatcher.BeginInvoke(() =>
    {
        MessageBox.Show(em.JoinedPeerIds[0]+" joined this group!");//有组员加入时的事件响应。
    });
});
```
#### 删除组员
也就是俗称的“踢人”，如下：

```
IList<string> peerIds = new List<string>() { "Neal" };
group.RemoveMembers(peerIds, (sr, er) => 
{
    Dispatcher.BeginInvoke(() =>
    {
        MessageBox.Show("Neal has been kicked by");
    });
});
```
相应的，如果 Neal 在某一个地方登录，他将会收到一个事件响应：

```
 public event EventHandler<EventArgs> OnLeft;
```
所以某一个 Peer 被别人剔除出组，产生的影响如下：
其他组员会收到 `OnMembersLeft` 的事件响应，而被剔除的 Peer 本身会收到 `OnLeft` 事件的响应。

### 退出群组
主动退出群组代码如下：

```
App.session = new AVSession("Neal");
AVGroup nealGroup = App.session.GetGroup("54753e1ee4b0b41b21e0e76e");
nealGroup.Quit((sq, eq) => 
{
    Dispatcher.BeginInvoke(() => 
    {
        MessageBox.Show("you have left from group:" + ((AVGroup)sq).GroupId);
    });
});
```
以上是简写，实际上真正实现回调的事件 `OnLeft`。


## 实现签名（可选）

签名作为安全认证的一部分，阅读下面的内容之前请确保您已经阅读过本文之前所介绍 [权限和认证](./realtime.html#权限和认证)。

假如开发者在控制台勾选了「聊天服务签名认证」：

那么在调用 `AVSession.Open` 的**之前**，必须显式的设置签名方法实现的类，如下代码：

```javascript
session.SignatureFactory = new SampleSignatureFactory();
```

其中 `SampleSignatureFactory` 是一个实现了 `ISignatureFactory` 接口的一个类，这个类的名字以及功能完全由开发者自己定义，本文给出的只是一个与云引擎相结合进行签名的简单的实例，所以想通过本文的实例代码一次性联调顺利的话，开发者必须把 [权限和认证](./realtime.html#权限和认证)中的 [云引擎](leanengine_guide-cloudcode.html)上的
[签名范例程序](https://github.com/leancloud/realtime-messaging-signature-cloudcode)部署到自己的应用当中。

下面给出 `SampleSignatureFactory` 的实例代码为：

```javascript
public class SampleSignatureFactory : ISignatureFactory
    {
        public Task<Signature> CreateSignature(string peerId, IList<string> watchIds)
        {
            var data = new Dictionary<string, object>();

            data.Add("self_id", peerId);//当前用户的 PeerId 作为self id 作为签名的参数。
            data.Add("watch_ids", watchIds);//关注的 Peer 作为签名的参数。

            //调用云引擎进行签名。
            return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign", data).ContinueWith<Signature>(t =>
            {
                var result = t.Result;
                Signature signature = new Signature();
                signature.Nonce = result["nonce"].ToString();
                signature.SignatureContent = result["signature"].ToString();
                signature.SignedPeerIds = ((List<object>)result["watch_ids"]).Select(s => (string)s).ToList();
                signature.Timestamp = (long)result["timestamp"];
                return signature;//拼装成一个 Signature 对象
            });

            //以上这段代码，开发者无需手动调用，只要开发者对一个 AVSession 设置了 SignatureFactory，SDK 会在Open Session 的时候主动调用这个方法进行签名。
        }

        public Task<Signature> CreateGroupSignature(string groupId, string peerId, IList<string> targetPeerIds, string action)
        {
            var data = new Dictionary<string, object>();
            data.Add("self_id", peerId);
            data.Add("group_id", groupId);
            data.Add("group_peer_ids", targetPeerIds);
            data.Add("action", action);

            return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign", data).ContinueWith<Signature>(t =>
            {
                var result = t.Result;
                Signature signature = new Signature();
                signature.Nonce = result["nonce"].ToString();
                signature.SignatureContent = result["signature"].ToString();
                signature.SignedPeerIds = ((List<object>)result["group_peer_ids"]).Select(s => (string)s).ToList();
                signature.Timestamp = (long)result["timestamp"];
                signature.GroupId = result["groupId"] == null ? "" : result["groupId"].ToString();
                signature.GroupAction = result["action"].ToString();
                return signature;
            });
        }
    }
```

***以上代码的实例与云引擎联合使用，这样就可以节省开发者自己的服务器资源，当然如果应用场景有特定的签名需求，那么完全可以通过修改云引擎来实现，又或者开发者有自己的服务器资源，只要在SampleSignatureFactory类中实现CreateSignature方法的时候去开发者自己的服务器上进行算法的签名运算也可以实现***

另外，关于签名的重要细节有以下几点：

* 服务端进行签名是为了避免一些恶意的操作
* 签名也有控制好友关系的作用。假如应用本身有好友系统，不是好友不能相互通信，比如 A 想 Watch B，但是 B 并不是 A 的好友（类似QQ，微信），此时在业务需求的情况下，只要服务端返回一个错误的签名，LeanCloud 就不会在服务端为 A 和 B 建立聊天的长连接，A 发送的信息就不会送到给 B，这样也是为了帮助开发者实现轻量的垃圾消息规避，当然我们本身的服务是没有这种好友系统的，因为这是应用本身的业务需求。
* 签名方法所存放的服务端最好要做好访问认证，比如我们云引擎在访问的时候必须在 Https 请求头包含 AppId 以及 AppKey，这样才能避免一旦服务器地址被暴露，恶意的被其他人利用去做签名，对应用本身的聊天系统产生脏数据以及恶意广告的散发。

签名是认证的一种方式，这种方式有助于开发者去自由掌控自己的系统又不会付出过多的代码做一些跟业务逻辑本身无关的事情，LeanCloud 一直致力于减少应用开发者在服务端的工作量，并且希望开发者能够对应用开发的整体流程有着自己独到的把控，这样的应用才是高质量的。

## 目前 Windows Phone 8 SDK 所支持的即时通讯的功能组件

目前尚在公测版，已经支持的功能组件是：

* 单聊
* 群组聊天
* 签名


尚未支持的是：


* 聊天记录的获取
