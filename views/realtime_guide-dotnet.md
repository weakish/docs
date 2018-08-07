{% extends "./realtime_guide.tmpl" %}

{% set platform_name = '.NET' %}
{% set segment_code = 'dotnet' %}
{% set sdk_name = platform_name + " SDK" %}

{% block supportedRuntime %}
目前我们的 .NET 即时通讯支持如下运行时：

* Windows Phone Silverlight （8.0 & 8.1）
* Windows Desktop .NET Framework 4.5+
* Xamarin Form 1.4+
* Xamarin iOS 8+
* Xamarin Android 5+

尚未发布但是已在计划内的如下：

* Windows Runtime （for Windows 10）

文档中涉及的语法以及接口均对所有运行时有效。
{% endblock %}

{% block setup_init %}
为了支持即时通讯， 即时通讯 SDK 依赖于几个开源的 WebSocket 的库，推荐开发者从 [Nuget](https://www.nuget.org/packages/LeanCloud/) 上下载我们的 SDK。

导入 SDK 之后，在应用入口函数中添加如下代码：

```c#
   //generated code by visual studio
   ...
   //"你的 AppId", "你的 AppKey"
   AVClient.Initialize("{{appid}}", "{{appkey}}"); 
   ...

```
例如，在 Windows 控制台的 Main 函数入口可以调用以上代码进行初始化。
{% endblock %}

{% block demo %}
* [.NET Demo](https://github.com/leancloud/windows-phone-sdk-demos)（推荐）
{% endblock %}

{% block oneOnOneChat_sent %}
```c#
public async void TomCreateConversationWithJerry()
{
    //Tom 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Tom");

    //Tom 登录到系统
    await client.ConnectAsync();

    //Tom 建立了与 Jerry 的对话
    AVIMConversation conversation = await client.CreateConversationAsync("Jerry");

    //Tom 发了一条消息给 Jerry
    await conversation.SendTextMessageAsync("耗子，起床！");
}
```
{% endblock %}

{% block oneOnOneChat_received %}
```c#
public async void JerryReceiveMessageFromTom()
{
    //Jerry 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Jerry");

    //Jerry 登录到系统
    await client.ConnectAsync();

    //Jerry 设置接收消息的方法，一旦有消息收到就会调用这个方法
    client.OnMessageReceieved += (s, e) =>
    {
        if (e.Message is AVIMTextMessage)
        {
            string words = ((AVIMTextMessage)e.Message).TextContent;
            //words 内容即为：耗子，起床！
        }
    };
}
```
{% endblock %}

{% block groupChat_sent %}
```c#
public async void TomCreateConversationWithFriends()
{
    //Tom 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Tom");

    //Tom 登录到系统
    await client.ConnectAsync();

    #region 第一步：建立一个朋友列表
    IList<string> friends = new List<string>();
    friends.Add("Jerry");
    friends.Add("Bob");
    friends.Add("Harry");
    friends.Add("William");
    #endregion

    #region 新建一个对话，把朋友们列为对话的参与人员
    AVIMConversation friendConversation = await client.CreateConversationAsync(friends);
    #endregion

    #region 第三步：发送一条消息
    await friendConversation.SendTextMessageAsync("你们在哪儿？");
    #endregion
}
```
{% endblock %}

{% block createConversationAsync %}
> 注：`AVIMClient.CreateConversationAsync()` 有多种重载方法供开发者调用，详细定义可在 Visual Studio 中进行查看。
{% endblock %}

{% block groupChat_received %}
```c#
AVIMConversation NotifiedConversation = null;
public async void BobReceiveMessageFromTom()
{
    //Bob 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Bob");

    //Bob 登录到系统
    await client.ConnectAsync();

    //Bob 设置接收消息的方法，一旦有消息收到就会调用这个方法
    client.OnMessageReceieved += (s, e) =>
    {
        if (e.Message is AVIMTextMessage)
        {
            //words 的内容就是：你们在哪儿呢？
            string words = ((AVIMTextMessage)e.Message).TextContent;

            //AVIMClient 在接收到消息的时候，会一并提供消息所在的 AVIMConversation
            NotifiedConversation = e.Conversation;

            if (NotifiedConversation != null)
            {
                //Bob 收到消息后又回复了一条消息
                NotifiedConversation.SendTextMessageAsync("@Tom, 我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？");
            }
        }
    };
}
```
{% endblock %}

{% block textMessage_sent_method %} `SendTextMessageAsync` {% endblock %}

{% block textMessage_received_intro %}
客户端登录后可以通过 `AVIMClient` 中的 `OnMessageReceived` 方法来接收消息，如果接收方正好加载了这个对话，那么接收方在 `AVIMConversation` 里面也会收到 `OnTextMessageReceived` 的事件响应。
{% endblock %}

{% block textMessage_received %}
```
//Jerry 用自己的名字作为 ClientId 建立了一个 AVIMClient
AVIMClient client = new AVIMClient("Jerry");

//Jerry 登录到系统
await client.ConnectAsync();

string conversationId = "55117292e4b065f7ee9edd29";

AVIMConversation conversation = client.GetConversationById(conversationId);

conversation.OnTextMessageReceived += (s,e)=>
{
    AVIMTextMessage receivedMessage = e;
    string words = receivedMessage.TextContent;
    // words 内容即为：耗子,起床!

    // Jerry 收到消息之后回复一下 Tom
    AVIMTextMessage messageToTom = new AVIMTextMessage("早起了，啥事儿？");
    // 发送 AVIMTextMessage 实例
    conversation.SendTextMessageAsync(messageToTom);
};
```
{% endblock %}

{% block imageMessage_local_sent %}
```c#
MediaLibrary library = new MediaLibrary();//系统媒体库
var photo = library.Pictures[0];//获取第一张照片，运行这段代码，确保手机以及虚拟机里面的媒体库至少有一张照片

AVIMImageMessage imgMessage = new AVIMImageMessage(photo.Name, photo.GetImage());//构造 AVIMImageMessage
imgMessage.Attributes = new Dictionary<string, object>() 
{ 
    {"location","旧金山"}
};
imgMessage.Title = "发自我的 WP";
await conversation.SendImageMessageAsync(imgMessage);
```
{% endblock %}

{% block imageMessage_url_sent %}

```c#
public async void SendImageMessageAsync_Test()
{
    AVIMClient client = new AVIMClient("Tom");
    
    await client.ConnectAsync();//Tom 登录

    AVIMConversation conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话

    AVIMImageMessage imgMessage = new AVIMImageMessage("http://pic2.zhimg.com/6c10e6053c739ed0ce676a0aff15cf1c.gif");//从外部链接创建图像消息
    await conversation.SendImageMessageAsync(imgMessage);//发送给 Jerry
}
``` 
{% endblock %}

{% block imageMessage_received_intro %}
类似于第一章节中单聊中的接收消息，客户端登录后可以通过 `AVIMClient` 中的 `OnMessageReceived` 方法来接收图像，如果接收方此时正好加载了这个对话，那么接收方在 `AVIMConversation` 里面也会收到 `OnImageMessageReceived` 的事件响应：
{% endblock %}

{% block imageMessage_received %}
```c#
public async void ReceiveImageMessageAsync_Test()
{
    AVIMClient client = new AVIMClient("Jerry");
    await client.ConnectAsync();
    AVIMConversation conversation = client.GetConversationById("55117292e4b065f7ee9edd29");
    await conversation.FetchAsync();
    conversation.OnImageMessageReceived += (s, e) =>
    {
        //图像的 url
        string url = e.Url;
        //图像的元数据
        IDictionary<string, object> metaData = e.FileMetaData;
        //图像的发送者 ClientId
        string  from= e.FromClientId;
        //图像发送者为图像设定的 Title
        string title = e.Title;

        //一些其他的属性都可以在这里获取
    };
}
```
{% endblock %}

{% block audioMessage_local_sent %}
```c#
private async void SendAudioMessageAsync()
{
    StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;
    var AudioFile = await local.OpenStreamForReadAsync(recordAudioFileName);
    AVIMAudioMessage audioMessage = new AVIMAudioMessage(recordAudioFileName, AudioFile);//创建音频消息

    await conversation.SendAudioMessageAsync(audioMessage);
    //这段代码运行之前，请确保 `conversation` 已经实例化
}
``` 
{% endblock %}

{% block audioMessage_url_sent %}
```c#
public async void SendAudioMessageAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    //Tom 登录
    await client.ConnectAsync();
    var conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话

    AVIMAudioMessage audioMessage = new AVIMAudioMessage("http://ac-lhzo7z96.clouddn.com/1427444393952");//从外部链接创建音频消息
    await conversation.SendAudioMessageAsync(audioMessage);//发送给 Jerry
}
```
{% endblock %}

{% block audioMessage_received_intro %}
与接收图像消息类似，由 `AVIMConversation` 的 `OnAudioMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block videoMessage_local_sent %}
```c#
private async void SendVideoMessageAsync()
{
    StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;

    var VideoFile = await local.OpenStreamForReadAsync(recordVideoFileName);

    AVIMVideoMessage videoMessage = new AVIMVideoMessage(recordVideoFileName, VideoFile);

    await conversation.SendVideoMessageAsync(videoMessage);
}
```
{% endblock %}

{% block videoMessage_url_sent %}

```c#
public async void SendVideoMessageAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录

    var conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话

    AVIMVideoMessage videoMessage = new AVIMVideoMessage("http://ac-lhzo7z96.clouddn.com/1427267336319");//从外部链接创建视频消息
    await conversation.SendVideoMessageAsync(videoMessage);//发送给 Jerry
}
```
{% endblock %}

{% block videoMessage_received_intro %}
与接收图像消息类似，由 `AVIMConversation` 的 `OnVideoMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。

{% endblock %}


{% block commonFileMessage_intro %}
#### 通用文件消息

开发者可以用它来发送带附件的消息或离线文件。对于此类消息，即时通讯 SDK 内部会先把文件上传到 LeanCloud 文件存储服务器（自带 CDN 功能），然后把文件元数据（url、文件大小等）放在消息包内发送到即时通讯云端。

Tom 要发送一份 .doc 文件给 Jerry，可以用下面这种方法：

##### 发送通用文件消息

```c#
public async void SendDocAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录

    var conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话
    StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;
    var docFile = await local.OpenStreamForReadAsync("leancloud.doc");//读取本地文件
    var avfile = new AVFile("leancloud.doc", docFile);//构造 AVFile
    AVIMFileMessage fileMessage = new AVIMFileMessage(avfile);//构造文件消息
    await conversation.SendFileMessageAsync(fileMessage);//发送
}
```

##### 接收通用文件消息

与接收图像消息类似，由 `AVIMConversation` 的 `OnFileMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。

{% endblock %}

{% block locationMessage_new %}
```c#
//1.根据纬度和经度构建
 AVIMLocationMessage locationMessage = new AVIMLocationMessage(Latitude, Longitude);
//2.根据 AVGeoPoint 构建
AVGeoPoint avGeoPoint = new AVGeoPoint(31.3853142377, 121.0553079844);
AVIMLocationMessage locationMessage = new AVIMLocationMessage(avGeoPoint);
```
{% endblock %}

{% block locationMessage_sent %}
```c#
public async void SendLocationAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录
    var conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话
    
    AVIMLocationMessage locationMessage = new AVIMLocationMessage(138.12454, 52.56461);//以经度和纬度为参数构建一个地理位置消息，当然开发者更可以通过具体的设备的 API 去获取设备的地理位置，详细的需要查询具体的设备的 API
    await conversation.SendLocationMessageAsync(locationMessage);
}
```
{% endblock %}

{% block locationMessage_received_intro %}
与接收图像消息类似， 由 `AVIMConversation` 的 `OnLocationMessageReceived` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block typedMessage_received %}
此处各个 SDK 平台需要详细介绍一下如何接收 TypedMessage 接收，包含文字和代码。描述风格以及代码示例请参照 iOS 版本。
{% endblock %}

{% block transientMessage_sent %}
```
private void txbMessage_TextChanged(object sender, TextChangedEventArgs e)//在消息输入的文本框 TextChanged 事件中
{
  //以下代码需要在整个窗体包含一个 AVIMClient 和 一个 AVIMConversation 实例，并且确保已经被初始化

  //以文本消息的方式发送暂态消息，其他成员在接受到此类消息时需要做特殊处理
  await conversaion.SendTextMessageAsync("Inputting", true, false);
  // 第一个参数 "Inputting" 表示自定义的一个字符串命令，此处开发者可以自行设置
  // 第二个参数 true 表示该条消息为暂态消息
  // 第三个参数 false 表示不要回执
}
```
{% endblock %}

{% block transientMessage_received %}
```
client.OnMessageReceieved += (s, e) => 
{
  if (e.Message is AVIMTextMessage)
  {
    //command 的内容就是：Inputting
    string command = ((AVIMTextMessage)e.Message).TextContent;

    // code 
    // 刷新 UI 控件，显示对方正在输入……
    // code
  }
};
```
{% endblock %}

{% block messagePolicy_sent %}{% endblock %}

{% block messagePolicy_sent_method %} `AVIMClient.OnMessageReceived` {% endblock %}

{% block message_sent_ack %}
```
//Tom 用自己的名字作为 ClientId 建立了一个 AVIMClient
AVIMClient client = new AVIMClient("Tom");

//Tom 登录到系统
await client.ConnectAsync();

//打开已存在的对话
AVIMConversation conversaion = client.GetConversationById("551260efe4b01608686c3e0f");
//设置送达回执
conversaion.OnMessageDeliverd += (s, e) =>
{
//在这里可以书写消息送达之后的业务逻辑代码
};
//发送消息
await conversaion.SendTextMessageAsync("夜访蛋糕店，约吗？");
```
{% endblock %}

{% block message_received_ack %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 打开已有对话 Id = 551260efe4b01608686c3e0f
- //收到 Tom 的消息："夜访蛋糕店，约吗？"
- 系统向 Tom 发送已读回执
- Jerry 回复 Tom："不约，最近牙疼……"
- 发送
```
{% endblock %}

{% block messagePolicy_received_intro %}
消息接收分为**两个层级**：

* 第一层在 `AVIMClient` 上，它是为了帮助开发者实现被动接收消息，尤其是在本地并没有加载任何对话的时候，类似于刚登录，本地并没有任何 `AVIMConversation` 的时候，如果某个对话产生新的消息，当前{% block messagePolicy_send_method %}{% endblock %}负责接收这类消息，但是它并没有针对消息的类型做区分。

* 第二层在 `AVIMConversation` 上，负责接收对话的全部信息，并且针对不同的消息类型有不同的事件类型做响应。

以上两个层级的消息接收策略可以用下表进行描述，假如正在接收的是 `AVIMTextMessage`：

AVIMClient 接收端 | 条件① |条件② |条件③ | 条件④ |条件⑤ 
:---|:---|:---|:---|:---|:---
`AVIMClient.OnMessageReceived` | × | √ | √ | √ | √
`AVIMConversation.OnMessageReceived` | × | × | √ | × | × 
`AVIMConversation.OnTypedMessageReceived`| × | × | × | √ | × 
`AVIMConversation.OnTextMessageReceived` | × | × | × | × | √ 
对应条件如下：

条件①：
```c#
AVIMClient.Status != Online
``` 
条件②：
```c#
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null
```
条件③：
```c#
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
```
条件④：
```c#
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived == null
```

条件⑤：
```c#
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived != null
```

在 `AVIMConversation` 内，接收消息的顺序为： 

`OnTextMessageReceived` > `OnTypedMessageReceived` > `OnMessageReceived`

这是为了方便开发者在接收消息的时候有一个分层操作的空间，这一特性也适用于其他富媒体消息。

{% endblock %}

{% block message_unread %}{% endblock %}

{% block message_Relation_intro %}
我们所支持的文本、图像、音频、视频、文件、地理位置等富媒体消息类型都有一个共同的基类：`AVIMTypedMessage`，它们之间的关系如下图所示：

![消息的类图](images/im-message-types.png)

层级|类名|说明|类型
:---:|---|---|---
一|`AVIMMessage`|所有消息的基类|抽象类
二|`AVIMTypedMessage`| 富媒体消息的基类|抽象类
三|`AVIMTextMessage`|文本消息|实例类
 |`AVIMLocationMessage`|地理位置消息|实例类
 |`AVIMFileMessageBase`| 所有包含了文件内容的消息的基类|抽象类
四|`AVIMImageMessage`|图像消息|实例类
 |`AVIMAudioMessage`|音频消息|实例类
 |`AVIMVideoMessage`|视频消息|实例类
 |`AVIMFileMessage`|通用文件消息类|实例类

即时通讯 SDK 在封装时对消息做了明确的分层，开发者需要根据自己的需求去使用。
{% endblock %}

{% block message_Properties_intro %}
消息类均包含以下公用属性：

属性|类型|描述
---|---|---
MessageBody|String|消息内容
FromClientId|String|指消息发送者的 clientId
ConversationId|String|消息所属对话 id
Id|String|消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 id
ServerTimestamp|long|消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。
MessageStatus|AVIMMessageStatus 枚举|消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusDelivered`（被接收）<br/>`AVIMMessageStatusFailed`（失败）
MessageIOType|AVIMMessageIOType 枚举|消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出）

我们为每一种富媒体消息定义了一个消息类型，即时通讯 SDK 自身使用的类型是负数（如下面列表所示），所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。

消息 | 类型
--- | ---
文本消息|-1
图像消息|-2
音频消息|-3
视频消息|-4
位置消息|-5
文件消息|-6

{% endblock %}

{% block attributes %}`AVIMMessage.Attributes`{% endblock %}

{% block attributes_property %}Attributes{% endblock %}

{% block customAttributesMessage_sent %}
```c#
AVIMImageMessage imgMessage = new AVIMImageMessage(photo.Name, photo.GetImage());//构造 AVIMImageMessage
imgMessage.Attributes = new Dictionary<string, object>() 
{ 
    {"location","拉萨布达拉宫"}
};
imgMessage.Title = "这蓝天……我彻底是醉了";
await conversation.SendImageMessageAsync(imgMessage);// 假设 conversationId= conversation 并且已经在之前被实例化
```
{% endblock %}

{% block customMessage_received_method %} `OnMessageReceived` {% endblock %}

{% block customAttributesMessage_received %}
```c#
AVIMClient client = new AVIMClient("friend");
await client.ConnectAsync();
AVIMConversation conversaion = client.GetConversationById("55117292e4b065f7ee9edd29");
await conversaion.FetchAsync();
conversaion.OnImageMessageReceived += (s, e) =>
{
//图像的 url
string url = e.Url;
//图像的元数据
IDictionary<string, object> metaData = e.FileMetaData;
//图像的发送者 ClientId
string from = e.FromClientId;
//图像发送者为图像设定的 Title
string title = e.Title;

//一些其他的属性都可以在这里获取
string location = e.Attributes["location"].ToString();// 读取的结果就是拉萨布达拉宫

};
```
{% endblock %}

{% block customMessage_create %}
.NET 在当前版本尚不支持自定义消息子类，正在研发中。
{% endblock %}


{% block conversation_specialnote %}{% endblock %}

{% block conversation_init %}

```c#
/// <summary>
/// 这段代码实现的功能就是 Jerry 创建了一个包含 Bob、Harry、William 的对话。
/// </summary>
/// <returns></returns>
public async void JerryCreateConversation()
{
    AVIMClient client = new AVIMClient("Jerry");
    await client.ConnectAsync();//Jerry 登录

    IList<string> friends = new List<string>();
    friends.Add("Bob");
    friends.Add("Harry");
    friends.Add("William");
    //添加好朋友

    await client.CreateConversationAsync(friends);//返回 ConversationId
}
```
{% endblock %}

{% block api_method_conversation_join %} `AVIMConversation.JoinAsync`{% endblock %}

{% block api_method_conversation_invite %} `AVIMConversation.AddMembersAsync`{% endblock %}

{% block api_method_conversation_quit %} `AVIMConversation.LeftAsync`{% endblock %}

{% block api_method_conversation_kick %} `AVIMConversation.RemoveMembersAsync`{% endblock %}

{% block conversation_members_change_notice_intro %}
在 Dotnet 中，在 AVIMConversaion 定义了如下的事件，

```
//当前 Client 被其他成员邀请加入到当前对话激发的事件。
Public event OnInvited	

//当前 Client 加入到当前对话中激发的事件，区别于 OnMembersLeft，此事件有且仅在当前 Client 加入到当前对话时才响应。
Public event OnJoined	

//当前 Client 被其他成员从当前对话中剔除时激发的事件。
Public event OnKicked	

//当前 Client 离开当前对话中激发的事件，区别于 OnMembersLeft，此事件有且仅在当前 Client 离开当前对话才响应。 
Public event OnLeft	

//有其他的 Members 加入到当前对话时激发的事件。
Public event	OnMembersJoined	

//有其他的 Members 离开到当前对话时激发的事件。 
Public event	OnMembersLeft	
```

接下来，我们将结合代码，针对各种成员变更的操作以及对应的事件响应进行详细讲解。

{% endblock %}

{% block conversation_join %}
```c#
public async void InitiativeJoinAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//获取 Jerry 创建的对话的 Id，这里是直接从控制台复制了上一节准备工作中 JerryCreateConversation 成功之后的 objectId
    AVIMConversation conversation = client.GetConversationById(conversationId);//Tom 获取到这个对话对象
    await conversation.JoinAsync();//Tom 主动加入到对话中
}
```
{% endblock %}

{% block conversation_membersChanged_callBack %}

该群的其他成员（比如 Bob）会收到该操作的事件回调:

* 如果 Bob 仅仅是登录了应用，并没有加载具体的对话到本地，他只会激发 `AVIMClient` 层级上的回调，代码如下:

```c#
public async void BobOnTomJoined_S1()
{
    AVIMClient client = new AVIMClient("Bob");
    await client.ConnectAsync();

    client.OnConversationMembersChanged += (s, e) =>
    {
        switch (e.AffectedType)
        {
            case AVIMConversationEventType.MembersJoined:
                {
                    IList<string> joinedMemberClientIds = e.AffectedMembers;//这里就是本次加入的 ClientIds
                    string clientId = joinedMemberClientIds.FirstOrDefault();//因为我们已知本次操作只有 Tom 一个人加入了对话，所以这样就可以直接读取到 Tom 的 clientId
                    //开发者可以在这里添加自己的业务逻辑
                }
                break;
        }
    };
}
```

* 如果 Bob 不但登录了，还在客户端加载了当前这个对话，那么他不但会激发 `AVIMClient` 层级上的回调，也会激发 `AVIMConversation` 层级上相关回调，代码如下：

```c#
public async void BobOnTomJoined_S2()
{
    AVIMClient client = new AVIMClient("Bob");
    await client.ConnectAsync();

    client.OnConversationMembersChanged += (s, e) =>
    {
        switch (e.AffectedType)
        {
            case AVIMConversationEventType.MembersJoined:
                {
                    IList<string> joinedMemberClientIds = e.AffectedMembers;//这里就是本次加入的 ClientIds
                    string clientId = joinedMemberClientIds.FirstOrDefault();//因为我们已知本次操作只有 Tom 一个人加入了对话，所以这样就可以直接读取到 Tom 的 clientId
                    //开发者可以在这里添加自己的业务逻辑
                }
                break;
        }
    };

    string conversationId = "551260efe4b01608686c3e0f";

    AVIMConversation conversation = client.GetConversationById(conversationId);//Bob 获取到这个对话的对象

    conversation.OnMembersJoined += (s, e) =>
    {
        IList<string> joinedMemberClientIds = e.AffectedMembers;//这里就是本次加入的 ClientIds
        string clientId = joinedMemberClientIds.FirstOrDefault();//因为我们已知本次操作只有 Tom 一个人加入了对话，所以这样就可以直接读取到 Tom 的 clientId
    };
}
```
{% endblock %}

{% block conversation_invite %}
```c#
public async void InviteMaryAsync()
{
    AVIMClient client = new AVIMClient("Jerry");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//Jerry 获取到这个对话的对象
    await conversation.AddMembersAsync("Mary");//Jerry 把 Mary 加入到对话
}
```
{% endblock %}

{% block conversation_invite_events %}
邀请成功以后，相关方收到通知的时序是这样的：

No.|操作者（管理员）|被邀请者|其他人
---|---|---|---
1|发出请求 addMembers| | 
2| |收到 onInvited 通知| 
3|收到 onMemberJoined 通知| | 收到 onMemberJoined 通知
{% endblock %}

{% block conversation_left %}
```c#
public async void InitiativeLeftAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//获取 Jerry 创建的对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//Tom 获取到这个对话的对象
    await conversation.LeftAsync();//Tom 主动从对话中退出
}
``` 
{% endblock %}

{% block conversation_kick %}
```c#
public async void WilliamKickHarryOutAsync()
{
    AVIMClient client = new AVIMClient("William");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//William 获取到这个对话的对象
    await conversation.RemoveMembersAsync("Harry");//William 把 Harry 从对话中剔除
}
```
{% endblock %}

{% block conversation_kick_events %}
以上的操作可归纳为：

1. 假如对话中已经有了 A 和 C

B 的操作|对 B 的影响|对 A、C 的影响
---|---|---
B 加入| `OnConversationMembersChanged && OnJoined`|`OnConversationMembersChanged && OnMembersJoined`
B 再离开|`OnConversationMembersChanged && OnLeft`|`OnConversationMembersChanged && OnMembersLeft`

2. 假如对话中已经有了 A 和 C

A 对 B 的操作 | 对 B 的影响|对 C 的影响
--- | ------------ | -------------|
A 添加 B | `OnConversationMembersChanged && OnInvited`|`OnConversationMembersChanged && OnMembersJoined`
A 再踢出 B|`OnConversationMembersChanged && OnKicked`|`OnConversationMembersChanged && OnMembersLeft`
{% endblock %}

{% block conversation_countMember_method %} `AVIMConversation.CountMembersAsync` {% endblock %}

{% block conversation_countMember %}
```c#
public async void CountMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversation conversation = (await client.GetQuery().FindAsync()).FirstOrDefault();//获取对话列表，找到第一个对话
    int membersCount = await conversation.CountMembersAsync();
}
```
{% endblock %}

{% block table_conversation_attributes_intro %}
AVIMConversation 属性名 | _Conversation 字段|含义
--- | ------------ | -------------
`ConversationId`| `objectId` |全局唯一的 Id
`Name` |  `name` |成员共享的统一的名字
`MemberIds`|`m` |成员列表
`Creator` | `c` |对话创建者
`LastMessageAt` | `lm` |对话最后一条消息发送的时间
`Attributes`| `attr`|自定义属性
`IsTransient`|`tr`|是否为聊天室（暂态对话）
{% endblock %}

{% block conversation_name %}
```c#
public async void CreateConversationAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    string anotherCat = "Black";
    await client.ConnectAsync();

    AVIMConversation conversation = await client.CreateConversationAsync(anotherCat, "喵星人");
}
```
{% endblock %}

{% block conversation_changeName %}
```c#
public async void UpdateConversationAsync()
{
    AVIMClient client = new AVIMClient("Black");
    await client.ConnectAsync();//Balck 登录

    AVIMConversation conversation = client.GetConversationById("55117292e4b065f7ee9edd29");//获取 Tom 创建的对话

    conversation.Name = "聪明的喵星人";//修改名称

    await conversation.SaveAsync();//保存到云端
}
```
{% endblock %}

{% block conversation_mute %}
```c#
public async void MuteConversationAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录

    string conversationId = "551260efe4b01608686c3e0f";//对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//Tom 获取到这个对话的对象
    await conversation.MuteAsync();//Tom 设置静音
}
```
{% endblock %}
{% block conversation_property_name %}`AVIMConversation.Creator`{% endblock %}

{% block conversation_unmute %}可使用 `UnmuteAsync()` 方法{% endblock %}

{% block conversation_attributes_new %}
```c#
public async void CreateConversationWithCustomAttributesAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();
    IDictionary<string, object> attr = new Dictionary<string, object>();
    attr.Add("type", "private");
    attr.Add("isSticky", true);
    AVIMConversation conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠", attr);//创建对话的时候传入即可。
}
```
{% endblock %}

{% block conversation_attributes_modify %}{% endblock %}

{% block conversation_remove %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 删除多个对话：id = [551260efe4b01608686c3e0f, 523431glfld803290dfsaf05]
```
{% endblock %}

{% block conversation_getSingle %}
```c#
 public async void QueryByIdAsync()
 {
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversation conversation = await client.GetQuery().GetAsync("551260efe4b01608686c3e0f");
 }
```
{% endblock %}


{% block conversation_query_limit %}
```c#
// 构建查询
AVIMConversationQuery conversationQuery = client.GetQuery().Limit(20);
// 查询 Tom 所在的最近 20 个活跃的对话
var conversationList = await conversationQuery.FindAsync();
```
{% endblock %}

{% block pattern_conservation_query_default_property %}
```
AVIMConversationQuery query = client.GetQuery();

// 查询对话名称为「LeanCloud 粉丝群」的对话
query.WhereEqualTo("attr.topic", "LeanCloud 粉丝群");

// 查询对话名称包含 「LeanCloud」 的对话
query.WhereContains("attr.topic", "LeanCloud");

// 查询过去24小时活跃的对话
query.WhereGreaterThan("lm", DateTime.Now.AddDays(-1));
```
{% endblock %}

{% block pattern_conservation_query_custom_property %}
```
// 查询话题为 DOTA2 对话
query.WhereEqualTo("attr.topic", "DOTA2");

// 查询等级大于 5 的对话
query.WhereGreaterThan("level".InsertAttrPrefix(), 5);
```
在 Dotnet SDK 中提供了 `InsertAttrPrefix` 的拓展方法，为自定义属性查询添加 `attr` 前缀：

```
// 查询话题为 DOTA2 对话
query.WhereEqualTo("topic".InsertAttrPrefix(), "DOTA2");
// 它与下面这行代码是一样的
query.WhereEqualTo("attr.topic", "DOTA2");
```
{% endblock %}

{% block conversation_getList %}
```c#
public async void CountMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversation conversation = (await client.GetQuery().FindAsync()).FirstOrDefault();//获取对话列表，找到第一个对话
    int membersCount = await conversation.CountMembersAsync();
}
```
{% endblock %}

{% block table_conservation_query_than %}
逻辑操作 | `AVIMConversationQuery` 对应的方法|
---|---
等于 | `WhereEqualTo`
不等于 |  `WhereNotEqualTo` 
大于 | `WhereGreaterThan`
大于等于 | `WhereGreaterThanOrEqualTo` 
小于 | `WhereLessThan`
小于等于 | `WhereLessThanOrEqualTo`
{% endblock %}

{% block conversation_query_equalTo %}
```c#
public async void WhereEqualTo_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereEqualTo("attr.topic", "movie");//构建 topic 是 movie 的查询
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_insertAttrPrefix %}
实际上为了方便开发者自动为了自定义属性的 key 值增加 `attr.` 的前缀，SDK 特地添加了一个针对 `string` 类型的[拓展方法](https://msdn.microsoft.com/zh-cn/library/bb383977.aspx)

```c#
/// <summary>
/// 为聊天的自定义属性查询自动添加 "attr." 的前缀
/// </summary>
/// <param name="key">属性 key 值，例如 type </param>
/// <returns>添加前缀的值，例如，attr.type </returns>
public static string InsertAttrPrefix(this string key)
{
    return key.Insert(0, "attr.");
}
```

导入 SDK 之后在 Visual Studio 里面使用 `string` 类型的时候可以智能感应提示该方法。

```c#
AVIMConversationQuery query = client.GetQuery().WhereEqualTo("topic".InsertAttrPrefix(), "movie");//这样就可以实现自动为 `topic` 添加 `attr.` 前缀的效果的效果。
```
{% endblock %}

{% block conversation_query_notEqualTo %}
```c#
public async void WhereNotEqualTo_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereNotEqualTo("attr.type", "private");//构建 type 不等于 movie 的查询
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_greaterThan %}
```c#
public async void WhereGreaterThan_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereGreaterThan("attr.age", 18);//构建 年龄大于 18 的查询
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询指的是在 `AVIMConversationQuery` 中以 `WhereMatches` 为前缀的方法。

Match 类方法的最大便捷之处在于可以使用正则表达式来匹配数据，这样使得客户端在构建基于正则表达式的查询时可以利用 .NET 里面诸多已经熟悉了的概念和接口。
{% endblock %}

{% block conversation_query_regex %}
```c#
public async void WhereMatchs_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereMatches("attr.language", "[\u4e00-\u9fa5]");//查询 language 是中文字符的对话
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_contains %}
```c#
public async void WhereContains_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育");//查询 keywords 包含教育
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```c#
public async void QueryMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");

    IList<string> clientIds = new List<string>();
    clientIds.Add("Bob");
    clientIds.Add("Jerry");

    AVIMConversationQuery query = client.GetQuery().WhereContainedIn<string>("m", clientIds);//查询对话成员 Bob 以及 Jerry 的对话
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_chaining %}
我们的 SDK 在查询风格上一直保持以链式方式来创建符合自己业务逻辑的组合条件。
{% endblock %}

{% block conversation_query_combination %}
```c#
public async void CombinationQuery_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育").WhereLessThan("attr.age", 18);//查询 keywords 包含教并且年龄小于18的对话
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block conversation_query_count %}
```c#
public async void QueryCount_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育").WhereLessThan("attr.age", 18);//查询 keywords 包含教并且年龄小于18的对话
    var count = await query.CountAsync();//执行查询，获取符合条件的对话的数量
}
```
{% endblock %}

{% block chatroom_new %}
```c#
public async void ChatRoom_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    var chatroom = client.CreateConversationAsync(null, "HelloKitty PK 加菲猫", null, true);
    //最后一个参数，transient 如果为 true 就说明是聊天室，逻辑上就是暂态对话
}
```
{% endblock %}

{% block chatroom_create %}
另外，为了方便开发者快速创建聊天室，SDK 提供了一个快捷方法创建聊天室：

```c#
var chatroom = client.CreateChatRoomAsync("HelloKitty PK 加菲猫");//可以理解为一个语法糖，与调用 `CreateConversationAsync` 没有本质的区别。
```
{% endblock %}

{% block chatroom_count_method %} `AVIMConversation.CountMembersAsync` {% endblock %}

{% block chatroom_count %}
```c#
public async void CountMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversation conversation = (await client.GetQuery().FindAsync()).FirstOrDefault();
    int membersCount = await conversation.CountMembersAsync();
}
```
{% endblock %}
{% block create_query_instance_method %}`AVIMClient.GetQuery()`{% endblock %}

{% block chatroom_query_method2 %}以 `Where` 开头的{% endblock %}

{% block chatroom_query_single %}
```c#
public async void QueryChatRoom_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversationQuery query = client.GetQuery().WhereContains("topic".InsertAttrPrefix(), "奔跑吧，兄弟").WhereEqualTo("tr", true);
    //比如我想查询主题包含《奔跑吧，兄弟》的聊天室
    var result = await query.FindAsync();//执行查询
}
```
{% endblock %}

{% block chatroom_query_extra %}从代码上可以看出，仅仅是多了一个额外的 `WhereEqualTo("tr", true)` 的链式查询即可。{% endblock %}


{% block conversation_query_history %}
```
- 初始化 ClientId = Tom
- 获取对话对象 id = 2f08e882f2a11ef07902eeb510d4223b
- 获取从过去 24 小时的历史聊天纪录
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}
```
//Tom 用自己的名字作为 ClientId 建立了一个 AVIMClient
AVIMClient client = new AVIMClient("Tom");

//Tom 登录到系统
await client.ConnectAsync();

//打开已存在的对话
AVIMConversation conversaion = client.GetConversationById("551260efe4b01608686c3e0f");

//查询最新的 10 条消息
await conversaion.QueryHistoryAsync(10);
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}
```
// 获取早于 messageId = grqEG2OqSL+i8FSX9j3l2g 而且时间戳早于 1436137606358 的 10 条消息
con.QueryHistoryAsync("grqEG2OqSL+i8FSX9j3l2g", 1436137606358, 10);
```
{% endblock %}

{% block conversation_messageHistory_pager %}
```
// 获取最新的 10 条消息
IEnumerable<AVIMMessage> pageContent = await con.QueryHistoryAsync(10);
// 以第 10 条为分界点
AVIMMessage pager = pageContent.Last();
// 查询第 10 条之前的 10条消息
IEnumerable<AVIMMessage> pageContent2 = await con.QueryHistoryAsync(pager.Id, pager.ServerTimestamp, 10);
```
{% endblock %}

{% block networkStatus %} 
在 `AVIMClient` 中有的 `Satus` 判断当前连接状态，如下表：

枚举名称 |整型值 | 解释
---|---|---
ClientStatus.None  |  0 |  未知，初始值
ClientStatus.Online | 1 |  在线
ClientStatus.Offline | 2 | 离线
{% endblock %}

{% block logout %}
```
client.DisconnectAsync();
```
{% endblock %}

{% block messageReceiveMethod_image %}OnImageMessageReceived{% endblock %}

{% block messageReceiveMethod_audio %}OnAudioMessageReceived{% endblock %}

{% block messageReceiveMethod_video %}OnVideoMessageReceived{% endblock %}

{% block messageReceiveMethod_file %}OnFileMessageReceived{% endblock %}

{% block conversation_security %}`AVIMClient` 有一个属性：

```c#
/// <summary>
/// 获取签名的接口
/// </summary>
public ISignatureFactoryV2 SignatureFactory { get; set; }
```
是预留给开发者实现签名需求的接口，开发者只需要在登录之前实现这个接口即可。

###  签名的云引擎实例
为了方便开发者理解签名，我们特地开源了签名的[云引擎实例](https://github.com/leancloud/realtime-messaging-signature-cloudcode)，只要按照要求正确配置，就可以在客户端通过调用云引擎的具体的函数实现签名。

演示实例的步骤：

* 首先您需要下载最新版本的[云引擎实例](https://github.com/leancloud/realtime-messaging-signature-cloudcode)到本地，然后部署到您的应用中，详细请参考[命令行工具使用指南](leanengine_cli.html#)

* 其次，在 Visual Studio 中，新建一个类叫做 `SampleSignatureFactory` ，把下面这段代码拷贝到其中：

```c#
/// <summary>
/// 签名示例类，推荐开发者用这段代码理解签名的整体概念，正式生产环境，请慎用
/// </summary>
public class SampleSignatureFactory : ISignatureFactoryV2
{
    /// <summary>
    /// 为更新对话成员的操作进行签名
    /// </summary>
    /// <param name="conversationId">对话的Id</param>
    /// <param name="clientId">当前的 clientId</param>
    /// <param name="targetIds">被操作所影响到的 clientIds</param>
    /// <param name="action">执行的操作，目前只有 add，remove</param>
    /// <returns></returns>
    public Task<AVIMSignatureV2> CreateConversationSignature(string conversationId, string clientId, IList<string> targetIds, string action)
    {
        var data = new Dictionary<string, object>();

        data.Add("client_id", clientId);//表示当前是谁在操作。
        data.Add("member_ids", targetIds);//memberIds不要包含当前的ClientId。
        data.Add("conversation_id", conversationId);//conversationId是签名必须的参数。
           
        data.Add("action", action);//conversationId是签名必须的参数。
            
            
        //调用云引擎进行签名。
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("actionOnCoversation", data).ContinueWith<AVIMSignatureV2>(t =>
        {
            return MakeSignature(t.Result); ;//拼装成一个 Signature 对象
        });
        //以上这段代码，开发者无需手动调用，只要开发者对一个 AVIMClient 设置了 SignatureFactory，SDK 会在执行对应的操作时主动调用这个方法进行签名。
    }
    /// <summary>
    /// 登录签名
    /// </summary>
    /// <param name="clientId">当前的 clientId</param>
    /// <returns></returns>
    public Task<AVIMSignatureV2> CreateConnectSignature(string clientId)
    {
        var data = new Dictionary<string, object>();

        data.Add("client_id", clientId);//表示当前是谁要求连接服务器。 

        //调用云引擎进行签名。
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("connect", data).ContinueWith<AVIMSignatureV2>(t =>
        {
            return MakeSignature(t.Result); ;//拼装成一个 Signature 对象
        });
    }

    /// <summary>
    /// 为创建对话签名
    /// </summary>
    /// <param name="clientId">当前的 clientId </param>
    /// <param name="targetIds">被影响的 clientIds </param>
    /// <returns></returns>
    public Task<AVIMSignatureV2> CreateStartConversationSignature(string clientId, IList<string> targetIds)
    {
        var data = new Dictionary<string, object>();

        data.Add("client_id", clientId);//表示当前是谁在操作。
        data.Add("member_ids", targetIds);//memberIds不要包含当前的ClientId。

        //调用云引擎进行签名。
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("startConversation", data).ContinueWith<AVIMSignatureV2>(t =>
        {
            return MakeSignature(t.Result); ;//拼装成一个 Signature 对象
        });
    }

    /// <summary>
    /// 获取签名信息并且把它返回给 SDK 去进行下一步的操作
    /// </summary>
    /// <param name="dataFromCloudcode"></param>
    /// <returns></returns>
    protected AVIMSignatureV2 MakeSignature(IDictionary<string, object> dataFromCloudcode)
    {
        AVIMSignatureV2 signature = new AVIMSignatureV2();
        signature.Nonce = dataFromCloudcode["nonce"].ToString();
        signature.SignatureContent = dataFromCloudcode["signature"].ToString();
        signature.Timestamp = (long)dataFromCloudcode["timestamp"];
        return signature;//拼装成一个 Signature 对象
    }

    /// <summary>
    /// 为获取聊天记录的操作签名
    /// </summary>
    /// <param name="clientId">当前的 clientId </param>
    /// <param name="conversationId">对话 Id</param>
    /// <returns></returns>
    public Task<AVIMSignatureV2> CreateQueryHistorySignature(string clientId, string conversationId)
    {
        var data = new Dictionary<string, object>();

        data.Add("client_id", clientId);//表示当前是谁在操作。
        data.Add("convid", conversationId);//memberIds不要包含当前的ClientId。

        //调用云引擎进行签名。
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("queryHistory", data).ContinueWith<AVIMSignatureV2>(t =>
        {
            return MakeSignature(t.Result); ;//拼装成一个 Signature 对象
        });
    }
}
```

*  然后在调用如下代码进行测试（确保您已经在控制台开启了聊天签名的服务，否则签名操作无效）：

```c#
AVIMClient client = new AVIMClient("Tom");
client.SignatureFactory = new SampleSignatureFactory();//这里是一个开发者自己实现的接口的具体的类
await client.ConnectAsync();//Tom 登录客户端
```
{% endblock %}

{% block avoidCreatingDuplicateConversation %}>提示：每次调用 `CreateConversationAsync()` 方法，都会生成一个新的 Conversation 实例，即便使用相同 conversationMembers 和 name 也是如此。因此必要时可以先使用 `AVIMConversationQuery` 进行查询，避免重复创建。{% endblock %}

{# 2016-02-01 待 .NET 实现 disable_im_cache 再将以下 block 删除 #}
{% block text_im_history_cache %}{% endblock %}

{% block text_single_endpoint_login %}{% endblock %}

{% block conversation_query_cache %}{% endblock %}

{% block goto_create_unique_conversation %}{% endblock %}
