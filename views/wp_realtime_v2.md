# Windows Phone 即时通讯服务开发指南

## 简介

在阅读本开发指南之前，请先阅读下[《即时通讯开发指南》](./realtime_v2.html)，了解即时通讯的基本概念和模型。

目前我们的即时通讯服务仅支持 Windows Phone Silverlight 运行时，支持微软新一代的全平台统一运行时的 LeanCloud SDK for Windows Runtime 会尽快发布，本文档所提及的概念以及示例代码都兼容以上提及的 2 个运行时。

## 安装
为了支持即时通讯，LeanCloud SDK for Windows Phone Silverlight 依赖于一个开源的第三方的 WebSocket 的[库](https://www.nuget.org/packages/WebSocket4Net/)，所以推荐开发者从 [Nuget](https://www.nuget.org/packages/AVOSCloud.Phone/1.3.0-beta) 上下载我们的 SDK。

## 初始化
导入 SDK 之后，在 `App.xaml` 的构造函数中添加如下代码：

```c#
public App()
{
   //generated code by visual studio
   ...
   AVClient.Initialize("你的 AppId", "你的 AppKey");
   ...
}
```

## 单聊

###  发送消息
此场景类似于微信的私聊，微博的私信以及 QQ 单聊的场景，我们建立了一个统一的概念来描述聊天的各种场景：对话 — AVIMConversation，在[《即时通讯开发指南》](./realtime_v2.html)里面有详细的介绍。

Tom 想发送一条消息给 Jerry，下面的代码将帮助他实现这一功能：

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
    await conversation.SendTextMessageAsync("Hello,Jerry!");
}
```

### 接收消息

Jerry 如果想收到 Tom 的消息，他需要如下代码：

```c#
public async void JerryReceiveMessageFromTom()
{
    //Jerry 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Jerry");

    //Tom 登录到系统
    await client.ConnectAsync();

    //Jerry 设置接受消息的方法，一旦有消息收到就会调用这个方法
    client.OnMessageReceieved += (s, e) =>
    {
        if (e.Message is AVIMTextMessage)
        {
            string words = ((AVIMTextMessage)e.Message).TextContent;
            //words 内容即为：Hello,Jerry!
        }
    };
}
```
运行以上代码之后，在 LeanCloud 网站的控制台找到指定的应用，打开存储管理控制台，可以看到默认表 `_Conversation`中多了一条数据，该条数据的字段解释如下：

* name：String，对话唯一的名字。
* m：Array，对话中成员的列表。
* lm：Date，对话中最后一条消息发送的时间。
* c：String，对话的创建者的 ClientId
* mu：Array，对话中设置了静音的成员，仅针对 iOS 以及 Windows Phone 用户有效
* attr：Object，开发者设置的对话的自定义属性。

## 群聊
此场景类似于微信的多人聊天群组，以及 QQ 群 ，请注意这里的群聊指的是持久化存储的一个群组的概念，比如 QQ 群，除非群主解散该群，这个群应该是一直存在于 我的QQ群 列表中。关于临时群组聊天（聊天室）会在之后做单独解释。

### 发送消息
Tom 想建立一个群，把自己好朋友都拉进这个群，然后给他们发消息，他需要做的事情是：

* 第一步：建立一个朋友列表
* 第二步：新建一个对话，把朋友列为对话的参与人员
* 第三步：发送一条消息

以下代码将实现这个需求：

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
    await friendConversation.SendTextMessageAsync("Hey，你们在哪里？");
    #endregion
}
```

### 接收消息
群聊的接收消息与单聊的接收消息是一样的。

```c#
AVIMConversation NotifiedConversation = null;
public async void BobReceiveMessageFromTom()
{
    //Bob 用自己的名字作为 ClientId 建立了一个 AVIMClient
    AVIMClient client = new AVIMClient("Bob");

    //Bob 登录到系统
    await client.ConnectAsync();

    //Bob 设置接受消息的方法，一旦有消息收到就会调用这个方法
    client.OnMessageReceieved += (s, e) =>
    {
        if (e.Message is AVIMTextMessage)
        {
            //words 的内容就是：Hey，你们在哪里？
            string words = ((AVIMTextMessage)e.Message).TextContent;

            //AVIMClient 在接收到消息的时候，会一并提供消息所在的 AVIMConversation
            NotifiedConversation = e.Conversation;

            if (NotifiedConversation != null)
            {
                //Bob 收到消息后又回复了一条消息
                NotifiedConversation.SendTextMessageAsync("HI,Tom :我在 Jerry 家里，你跟 Harry 什么时候过来？还有 William 和你在一起么？");
            }
        }
    };
}
```

而以上 Tom 和 Bob 发送的消息，William 上线的时候都会收到。

**注： AVIMClient CreateConversationAsync 有多种重载方法供开发者调用，详细的开发者可以在 Visual Studio 中查看定义**。

## 消息
消息在最新版本的 SDK 中做了多层抽象以及封装，详细的我们先从如何发送接收富媒体消息开始。
### 富媒体消息
富媒体消息的支持是新版 SDK 的核心提升，我们目前 SDK 已经支持的富媒体消息类型有以下几种：

* 图像消息：`AVIMImageMessage`
* 音频消息：`AVIMAudioMessage`
* 视频消息：`AVIMVideoMessage`
*  文件消息：`AVIMFileMessage`
* 地理位置消息：`AVIMLocationMessage`


#### 图像消息
图像消息可以由系统提供的拍照 API，以及媒体库中获取，也可以是可访问的图像有效 Url，只要开发者调用一个构造方法，构造出一个 `AVIMImageMessage`，然后把 `AVIMImageMessage` 对象当做参数交由 `AVConversation` 发送出去即可。

##### 发送图像消息

场景 1：比如从微博拷贝了一个图像链接，然后可以通过 SDK 直接构建一个 `AVIMImageMessage`并且发送出去：
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

场景 2：系统也提供了 API 去获取媒体库里面的照片，开发者只需要调用系统的 API 获取图像文件的数据流，然后构造出一个 `AVIMImageMessage`，再调用 `AVIMConversation.SendImageMessageAsync`去发送图像：

```c#
MediaLibrary library = new MediaLibrary();//系统媒体库
var photo = library.Pictures[0];//获取第一张照片，运行这段代码，确保手机以及虚拟机里面的媒体库至少有一张照片

AVIMImageMessage imgMessage = new AVIMImageMessage(photo.Name, photo.GetImage());//构造 AVIMImageMessage
imgMessage.Attributes = new Dictionary<string, object>() 
{ 
    {"location","San Francisco"}
};
imgMessage.Title = "发自我的 WP";
await conversation.SendImageMessageAsync(imgMessage);
```

以上 2 种场景中对于 SDK 的区别就是如下：
* 场景 1 中，SDK 并没有实际上传到服务端，而是仅仅是把 URL 包装在消息体内发送出去，并且这种情况下接收方是无法从消息体中获取到元信息等数据的，不过开发者可以自行获取。
* 场景 2中，SDK 获取了完整的图像的数据流，所以 SDK 会先上传文件到服务端，然后将文件的元数据以及 URL 等一并包装，再发送出去。

##### 接收图像消息
类似于第一章节中单聊中的接收消息，在 `AVIMClient` 中的 `OnMessageReceived` 可以收到消息，但是假如接收方在客户端也正好加载了这个对话，那么接收方在 `AVIMConversation` 里面也会收到 `OnImageMessageReceived` 的事件响应：

```c#
public async void ReceiveImageMessageAsync_Test()
{
    AVIMClient client = new AVIMClient("Jerry");
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
        string  from= e.FromClientId;
        //图像发送者为图像设定的 Title
        string title = e.Title;

        //一些其他的属性都可以在这里获取
    };
}
```

#### 音频消息
音频消息的常见用法就是发送语音消息，语音消息的获取在 Windows Phone 中可以通过 [AudioVideoCaptureDevice](https://msdn.microsoft.com/en-us/library/windows.phone.media.capture.audiovideocapturedevice.aspx) 相关 API 获取或者其他的方式去获取，然后使用获取到的音频源文件的数据流创建一个 `AVIMAudioMessage` 对象，然后调 用`AVIMConversation.SendAudioMessageAsync` 发送：

##### 录制音频
```c#
#region sample code for send audio message by LeanCloud .NET SDK 
private string recordAudioFileName = "record_audio_temp.aac";
IRandomAccessStream randomAccessStream;
AudioVideoCaptureDevice micphone;
AVIMConversation conversation;
public async Task StartRecordingAsync()
{
    micphone = await AudioVideoCaptureDevice.OpenForAudioOnlyAsync();
    micphone.AudioEncodingFormat = CameraCaptureAudioFormat.Amr;
    try
    {
        await CreateFileStreamForAudioAsync(recordAudioFileName);
        await micphone.StartRecordingToStreamAsync(randomAccessStream);
    }
    catch (Exception ex)
    {
        throw ex;
    }
}

public async Task CreateFileStreamForAudioAsync(string fileName)
{
    try
    {
        StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;

        StorageFile file = file = await local.CreateFileAsync(fileName, CreationCollisionOption.ReplaceExisting);
        randomAccessStream = await file.OpenAsync(FileAccessMode.ReadWrite);
    }
    catch (Exception ex)
    {
        throw ex;
    }
}
public async void StopRecord()
{
    await micphone.StopRecordingAsync();
    randomAccessStream.CloneStream();
}
#endregion
```

##### 发送音频消息
使用上一小节的代码结合下面这段发送音频消息的代码，就是一个从`创建音频`，`构建音频消息`，`消息发送`完整的流程
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

与图像消息类似，音频消息也支持从 URL 构建，然后发送：

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

##### 接收音频消息
与接收图像消息一样，在 `AVIMConversation` 中有 `OnAudioMessageReceived` ，实例代码请参照图像消息接收。

#### 视频消息

##### 录制视频
录制视频在 Windows Phone 8 之后可以采用如下方式：

```c#
private string recordVideoFileName = "record_video_temp.mp4";
private AudioVideoCaptureDevice camera;
private IRandomAccessStream randomAccessStream;
AVIMConversation conversation;
public async Task StartRecordVideoAsync()
{
    try
    {
        IReadOnlyList<Windows.Foundation.Size> supportedResolutions = AudioVideoCaptureDevice.GetAvailableCaptureResolutions(CameraSensorLocation.Back);
        Windows.Foundation.Size resolution = supportedResolutions[0];
        camera = await AudioVideoCaptureDevice.OpenAsync(CameraSensorLocation.Back, resolution);

        StorageFolder applicationFolder = ApplicationData.Current.LocalFolder;
        StorageFile storageFile = await applicationFolder.CreateFileAsync(recordVideoFileName, CreationCollisionOption.ReplaceExisting);

        randomAccessStream = await storageFile.OpenAsync(FileAccessMode.ReadWrite);

        await camera.StartRecordingToStreamAsync(randomAccessStream);
    }
    catch (Exception ex)
    {
        MessageBox.Show(ex.ToString());
    }
}
public async void StopRecordVideoAsync(object sender, RoutedEventArgs e)
{
    await camera.StopRecordingAsync();
    randomAccessStream.Dispose();
}
```

##### 发送视频消息
配上上节的代码就可以用如下代码发送视频消息：
```c#
private async void SendVideoMessageAsync()
{
    StorageFolder local = Windows.Storage.ApplicationData.Current.LocalFolder;

    var VideoFile = await local.OpenStreamForReadAsync(recordVideoFileName);

    AVIMVideoMessage videoMessage = new AVIMVideoMessage(recordVideoFileName, VideoFile);

    await conversation.SendVideoMessageAsync(videoMessage);
}
```

同样我们也支持从一个视频的 URL 创建视频消息，然后发送出去：

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
**注：这里说的 URL指的是视频文件自身的 URL，而不是视频网站上播放页的 URL。**

##### 接收视频消息
与接收图像消息一样，在 `AVIMConversation` 中有 `OnVideoMessageReceived` ，实例代码请参照图像消息接收。

#### 通用文件消息
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
与接收图像消息一样，在 `AVIMConversation` 中有 `OnFileMessageReceived` ，实例代码请参照图像消息接收。

#### 地理位置消息
地理位置消息构建方式有 2 种：

```c#
//1.根据纬度和经度构建
 AVIMLocationMessage locationMessage = new AVIMLocationMessage(Latitude, Longitude);
//2.根据 AVGeoPoint 构建
AVGeoPoint avGeoPoint = new AVGeoPoint(31.3853142377, 121.0553079844);
AVIMLocationMessage locationMessage = new AVIMLocationMessage(avGeoPoint);
```
##### 发送地理位置消息

```c#
public async void SendLocatioAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录
    var conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠");//创建对话

    Geolocator geolocator = new Geolocator();
    geolocator.DesiredAccuracyInMeters = 50;

    try
    {
        Geoposition geoposition = await geolocator.GetGeopositionAsync(maximumAge: TimeSpan.FromMinutes(5), timeout: TimeSpan.FromSeconds(10));
        AVIMLocationMessage locationMessage = new AVIMLocationMessage(geoposition.Coordinate.Latitude, geoposition.Coordinate.Longitude);
        await conversation.SendLocationMessageAsync(locationMessage);
    }
    catch (Exception ex)
    {
        if ((uint)ex.HResult == 0x80004004)
        {

            var error = "location  is disabled in phone settings.";
        }
    }
}
```
##### 接收地理位置消息
与接收图像消息一样，在 `AVIMConversation` 中有 `OnLocationMessageReceived` ，实例代码请参照图像消息接收。

### 消息的发送策略
开发者在阅读完前面的富媒体消息并且运行过实例代码之后，在 Visaul Studio 中使用 F12 快捷键查看各个消息类型的定义，应该可以看见图像，音频，视频在类的继承关系上是继承自 `AVIMFileMessageBase`，所有继承自 `AVIMFileMessageBase` 的消息类型的发送策略如下：

* 如果文件是从客户端 API 读取的数据流 (Stream) 
``` 
第一步：从本地构造 AVFile
第二步：调用 AVFile 的上传的方法上传到服务器，并获取文件的元信息（MetaData）
第三步：把 AVFile 的 objectId 以及 URL ，以及文件的元信息封装在消息体内
第四步：发送消息
```
* 如果文件是外部链接的 URL
```
第一步：直接将 URL 封装在消息体内，不获取元信息，不包含 objectId
第二步：发送消息
``` 

以上逻辑对所有继承 `AVIMFileMessageBase` 的消息类型有效，目前 SDK 内置的继承自 `AVIMFileMessageBase` 包含以下几种：

```
AVIMImageMessage
AVIMAudioMessage
AVIMVideoMessage
AVIMFileMessage
```

### 消息的接收策略
消息接收有 **2** 个层级：

* 第一个是在 `AVIMClient` 上，它是为了帮助开发者实现被动接收消息，尤其是在本地并没有加载任何对话的时候，类似于刚登录，本地并没有任何 `AVIMConversation` 的时候，如果某个对话产生新的消息，当前 `AVIMClient.OnMessageReceived` 负责接收这类消息，但是它并没有针对消息的类型做区分。

* 第二个是在 `AVIMConversation` 上，负责接收对话的全部信息，并且针对不同的消息类型有不同的事件类型做响应。

以上 **2** 个层级的消息接收策略可以用下表进行描述，假如正在接收的是 `AVIMTextMessage`：

AVIMClient 接收端 | AVIMClient.OnMessageReceived |AVIMConversation.OnMessageReceived| AVIMConversation.OnTypedMessageReceived| AVIMConversation.OnTextMessageReceived 
----------- | ------------ | ------------- | ------------- 
条件① | × | × | × | × 
条件② | √ | × | × | × 
条件③ | √ | √ | × | × 
条件④ | √ | × | √ | × 
条件⑤ | √ | × | × | √ 

对应条件如下：

* 条件①：
```c#
AVIMClient.Status != Online
``` 
* 条件②：
```c#
AVIMClient.Status == Online && AVIMClient.OnMessageReceived != null
```
* 条件③：
```c#
AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
```
* 条件④：
```c#
AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived == null
```

* 条件⑤：
```c#
AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived != null
```

在 AVIMConversation 内，接受消息的顺序是按照 

```
OnTextMessageReceived > OnTypedMessageReceived > OnMessageReceived
```

这是为了方便开发者在接受消息的时候有一个分层操作的空间，这一特性也适用于其他富媒体消息。

### 消息类详解
![消息的类图](images/im-message-types.png)

* `AVIMMessage` 所有消息的基类，一级抽象类；
* `AVIMTypedMessage` 富媒体消息的基类，二级抽象类；
* `AVIMFileMessageBase` 所有包含了文件内容的消息的基类，三级抽象类
* `AVIMTextMessage` 文本你消息，三级实例类；
* `AVIMLocationMessage` 地理位置消息，三级实例类
* `AVIMImageMessage` 图像消息，四级实例类
* `AVIMAudioMessage` 音频消息，四级实例类
* `AVIMVideoMessage` 视频消息，四级实例类
* `AVIMFileMessage` 通用文件消息类，四级实例类

结合图例，即时通讯 SDK 在封装的时候，做了明确的分层，开发者需要根据自己的需求去使用。

### 消息的自定义属性
有些场景下需要开发者在发送消息的时候附带一下自己业务逻辑需求的自定义属性，比如消息发送的设备名称，或者图像消息的拍摄地点，或者视频消息的来源等等，如果业务需要，开发者都可以通过 `AVIMMessage.Attributes` 实现这一需求。

场景1：在发送照片给自己朋友的时候，想告诉朋友这张照片是在旧金山拍摄的，如下代码可以实现这个需求：

```c#
AVIMImageMessage imgMessage = new AVIMImageMessage(photo.Name, photo.GetImage());//构造 AVIMImageMessage
imgMessage.Attributes = new Dictionary<string, object>() 
{ 
    {"location","San Francisco"}
};
imgMessage.Title = "发自我的WP";
await conversation.SendImageMessageAsync(imgMessage);
```

而接收方在 `OnMessageReceived` 的时候是可以读取到这一属性的：

```c#
AVIMClient client = new AVIMClient("friend");
await client.ConnectAsync();
client.OnMessageReceieved += (s, e) =>
{
    if (e.Message is AVIMImageMessage)
    {
        AVIMImageMessage imgMessage = (AVIMImageMessage)e.Message;
        string url = imgMessage.Url;
        string location = imgMessage.Attributes["location"].ToString();//读取的结果就是 San Francisco
    }
};
```
所有消息都支持这一属性。

## 对话的管理
以上 三个章节基本演示了即时通讯 SDK 的核心概念——AVIMConversation ，LeanCloud 将单聊和群聊（包括聊天室）的消息发送和接收都依托于 `AVIMConversation`这个统一的概念进行操作。

所以，开发者需要强化理解的一个概念就是：**SDK 层面是不再区分单聊以及群聊。**

### 对话的成员管理
对话的管理包括`成员管理`，`属性管理`两个方面。

`成员管理`是对话中成员的一个实时生效的操作，一旦操作成功不可逆。

#### 准备工作
在进行下面几个章节之前，请复制如下代码到 IDE 并且执行，后面的文档中的示例代码是基于以下代码进行的，这是一项**必须的** 的工作： 

```c#
/// <summary>
/// 这段代码实现的功能就是 Jerry 创建了一个 包含 Bob，Harry，William 的对话。
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
#### 自身主动加入
Tom 想主动加入到  Jerry ， Bob，Harry，William 的上一节中 JerryCreateConversation 所创建的对话中，以下代码将帮助他实现这个功能：

```c#
public async void InitiativeJoinAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//获取 Jerry 创建的对话的 Id，这里是直接从控制台拷贝了上一节准备工作中 JerryCreateConversation 成功之后的 objectId
    AVIMConversation conversation = client.GetConversationById(conversationId);//Tom 获取到这个对话的对象
    await conversation.JoinAsync();//Tom 主动加入到对话中
}
```
该群的其他成员（比如 Bob）会根据自身客户端的状态不同会出现以下 2 种情况:

* 如果 Bob 仅仅是登录了应用，并没有加载具体的对话到本地，他只会收到 `AVIMClient.OnConversationMembersChanged` 的响应的相关操作，代码如下:

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

* 如果 Bob 不但登录了，还在客户端加载了当前这个对话，那么他不但会收到 `AVIMClient.OnConversationMembersChanged` 的响应的相关操作，也会收到 `AVIMConversation.OnMembersJoined` 的响应的相关操作，代码如下：

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
#### 添加其他成员

Jerry 想再把 Mary 加入到对话中，需要如下代码帮助他实现这个功能：

```c#
public async void InviteMarysync()
{
    AVIMClient client = new AVIMClient("Jerry");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//Jerry 获取到这个对话的对象
    await conversation.AddMembersAsync("Mary");//Jerry 把 Mary 加入到对话
}
```
该对话的其他成员（例如 Harry）也会受到该项操作的影响，收到事件被响应的通知，类似于第一小节`自身主动加入`中**Tom 加入对话之后，Bob 受到的影响 **

#### 自身退出对话
这里一定要区分**自身退出对话**的主动性，它与**自身被动被剔除**（下一小节）在逻辑上完全是不一样的。

Tom 主动从对话中退出，他需要如下代码实现需求：

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

#### 剔除其他成员

 Harry 被  William 从对话中删除。
**注：关于 William 如何获得权限在后面的`签名和安全`一章节会做详细阐述，此处不宜扩大话题范围）**

以下代码可以帮助 William 实现这一功能：

```c#
public async void WilliamKickHarryOutsync()
{
    AVIMClient client = new AVIMClient("William");
    await client.ConnectAsync();

    string conversationId = "551260efe4b01608686c3e0f";//对话的 Id
    AVIMConversation conversation = client.GetConversationById(conversationId);//William 获取到这个对话的对象
    await conversation.RemoveMembersAsync("Harry");//William 把 Harry 从对话中剔除
}
```

以上的描述可以用几张表格来解释：

1.假如对话中已经有了 A，C

B 的操作 |对 B 的影响|对 C 的影响
--- | ------------ | -------------
B 加入| `OnConversationMembersChanged && OnJoined`|`OnConversationMembersChanged && OnMembersJoined`
B 再离开|`OnConversationMembersChanged && OnLeft`|`OnConversationMembersChanged && OnMembersLeft`

2.假如对话中已经有了 A，C

A 对 B 的操作 | 对 B 的影响|对 C 的影响
--- | ------------ | -------------|
A 添加 B | `OnConversationMembersChanged && OnInvited`|`OnConversationMembersChanged && OnMembersJoined`
A 再剔除 B|`OnConversationMembersChanged && OnKicked`|`OnConversationMembersChanged && OnMembersLeft`

#### 查询成员数量
`AVIMConversation.CountMembersAsync` 这个方法是返回实时的数据：
```c#
public async void CountMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversation conversation = (await client.GetQuery().FindAsync()).FirstOrDefault();
    int membersCount = await conversation.CountMembersAsync();
}
```

### 对话的属性管理
对话（AVIMConversation）与控制台中 `_Conversation` 表是一一对应的，默认提供的属性对应的关系如下：

AVIMConversation 属性名 | _Conversation 字段|含义
--- | ------------ | -------------
`AVIMConversation.ConversationId`| `_Conversation.objectId` |全局唯一的 Id
`AVIMConversation.Name` |  `_Conversation.name` |成员共享的统一的名字
`AVIMConversation.MemberIds`|`_Conversation.m` |成员列表
`AVIMConversation.MuteMemberIds`|`_Conversation.mu` |静音成员列表
`AVIMConversation.Creator` | `_Conversation.c` |对话创建者
`AVIMConversation.LastMesaageAt` | `_Conversation.lm` |对话最后一条消息发送的时间
`AVIMConversation.Attributes`| `_Conversation.attr`|自定义属性
`AVIMConversation.IsTransient`|`_Conversation.tr`|是否为聊天室（暂态对话）

#### 名称

这个属性是全员共享的一个属性，他可以在创建时指定，也可以在日后的维护中被修改。

Tom 想建立一个名字叫「喵星人」 对话并且邀请了好友 Black 加入对话，需要写的代码如下：

```c#
public async void CreateConversationAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    string anotherCat = "Black";
    await client.ConnectAsync();

    AVIMConversation conversation = await client.CreateConversationAsync(anotherCat, "喵星人");
}
```

Black 发现对话名字不够酷，他想修改成「聪明的喵星人」 ，他需要如下代码：   

```c#
public async void UpdateConversationAsync()
{
    AVIMClient client = new AVIMClient("Black");
    await client.ConnectAsync();//Balck 登录

    AVIMConversation conversation = client.GetConversationById("55117292e4b065f7ee9edd29");//获取 Tom 创建的对话

    conversation.Name = "聪明的喵星人";//修改名称

    await conversation.SaveAsync();//保存到服务端
}
```

####  成员
`AVIMConversation .MemberIds` ：该属性表示当前对话中所包含的成员的 `clientId` ，
这个属性**强烈建议开发者切勿在控制台中随意修改**，所有关于成员的操作请参照上一章节中的 `成员管理` 来进行。

#### 静音成员
`AVIMConversation .MuteMemberIds` ：该属性表示当前对话中所进行了静音操作成员的 `clientId` ，
假如某一个用户不想再收到某对话的消息，又不想直接退出对话，可以使用静音操作。

比如 Tom 工作繁忙，对某个对话设置了静音：

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

**设置静音之后，针对 iOS 以及 Windows Phone 用户就不会收到推送消息**

此操作修改的是服务端 `_Conversation` 里面的 `mu` 属性。
与之对应的就是 `UnmuteAsync`操作，就是取消静音，示例代码参照静音操作。
**强烈建议开发者切勿在控制台中随意修改**。

#### 创建者

`AVIMConversation .Creator` 对话的创建者可以帮助实现类似于 QQ 群中区别管理员和群所有者，它的值是对话创建者的 `clientId`。

#### 自定义属性
此属性是为了帮助开发者给对话添加自定义属性。开发者可以随意存储自己的键值对，以帮助开发者实现自己的业务逻辑需求。

典型的场景是，我想对某个对话设置 tag 是 private，表示我要标记这个对话是私有的：

如下代码：

```c#
public async void CreateConversationWithCustomAttributesAsync()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();
    IDictionary<string, object> attr = new Dictionary<string, object>();
    attr.Add("tag", "private");
    AVIMConversation conversation = await client.CreateConversationAsync("Jerry", "猫和老鼠", attr);//创建对话的时候传入即可。
}
```

**注意：AVIMConversation.Attributes 在 SDK 级别是对所有成员可见的，如果要控制所谓的可见性，开发者需要自己维护这一属性的读取权限**

`AVIMConversation.Attributes` 在`对话查询`一节还有更多的用法。

## 对话的查询
### 基础查询
假如已知某一对话的 `Id`，可以利用查询该对话的详细信息
代码实例：

```c#
 public async void QueryByIdAsync()
 {
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversation conversation = await client.GetQuery().GetAsync("551260efe4b01608686c3e0f");
 }
```

**注意这个方法和  AVIMClient.GetConversationById 本质上是不一样的，AVIMClient.GetConversationById 可以理解为本地构造一个 AVIMConversation ，但是它除了 Id 别的属性都为空，而 GetAsync 是直接从服务端拉取数据，更为可靠，但是它是异步的。**

### 条件查询
条件查询包含分类有`比较查询`,`匹配查询`

#### 比较查询
比较查询在一般的理解上都包含以下几种：

逻辑操作 | AVIMConversationQuery 对应的方法|
--- | ------------ | -------------
等于 | `WhereEqualTo`
不等于 |  `WhereNotEqualTo` 
大于 | `WhereGreaterThan`
大于等于 | `WhereGreaterThanOrEqualTo` 
小于 | `WhereLessThan`
小于等于 | `WhereLessThanOrEqualTo`

比较查询最常用的是 `WhereEqualTo`：
```
public async void WhereEqualTo_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereEqualTo("attr.topic", "movie");//构建 topic 是 movie 的查询
    var result = await query.FindAsync();//执行查询
}
```

目前条件查询只针对  `AVIMConversatioon` 的 `Attributes` 属性进行的，也就是针对 `_Conversation`  表中的 `attr` 字段进行的 `AVQuery` 查询。

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

与 `WhereEqualTo` 相对的就是 `WhereNotEqualTo` ，以下代码将查询到类型不是私有的对话：
```c#
public async void WhereNotEqualTo_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereNotEqualTo("attr.type", "private");//构建 type 不等于 movie 的查询
    var result = await query.FindAsync();//执行查询
}
```

对于可以比较大小的整型，浮点等常用类型，可以参照以下示例代码进行拓展：

```c#
public async void WhereGreaterThan_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereGreaterThan("attr.age", 18);//构建 年龄大于 18 的查询
    var result = await query.FindAsync();//执行查询
}
```

#### 正则匹配查询
匹配查询指的是在 `AVIMConversationQuery` 中以 `WhereMatches` 为前缀的方法。

Match 类的方法最大的便捷之处就是使用了正则表达式匹配，这样使得，客户端在构建基于正则表达式的查询的时候可以利用 .NET 里面诸多已经熟悉了的概念和接口。

比如要查询所有 `tag` 是中文的对话可以如下进行：

```c#
public async void WhereMatchs_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereMatches("attr.tag", "[\u4e00-\u9fa5]");//查询 tag 是中文的对话
    var result = await query.FindAsync();//执行查询
}
```

#### 包含查询
包含查询指的是 方法名字包含 `Contains` 单词的方法，例如查询关键字包含「教育」的对话：
 
```c#
public async void WhereContains_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育");//查询 keywords 包含教育
    var result = await query.FindAsync();//执行查询
}
```

另外，包含查询在关于成员的查询中也可以有很大的作用。
以下代码将帮助 `Tom` 查找出 `Jerry` 以及 `Bob` 都存在的对话：

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

### 组合查询
组合查询的概念就是把诸多查询条件合并成一个查询，再交给 SDK 去服务端进行查询。

LeanCloud .NET SDK 的风格上一直保持以链式的方式提供给开发者去组合符合自己业务逻辑的查询，例如，要查询年龄小于18岁，并且关键字包含「教育」的对话：

```c#
public async void CombinationQuery_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育").WhereLessThan("age", 18);//查询 keywords 包含教并且年龄小于18的对话
    var result = await query.FindAsync();//执行查询
}
``` 

组合查询的性能开发者不必担心，只要合理地构造查询，性能完全不需要开发者去担心。

### 计数查询
任意的查询，不管是单查询还是组合查询，都支持计数查询:

```c#
public async void QueryCount_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端
    AVIMConversationQuery query = client.GetQuery().WhereContains("attr.keywords", "教育").WhereLessThan("attr.age", 18);//查询 keywords 包含教并且年龄小于18的对话
    var count = await query.CountAsync();//执行查询，获取符合条件的对话的数量
}
```

## 聊天室
聊天室在本质上就是一个对话，所以以上章节中提到了**所有的属性，方法，操作以及管理，都对聊天室适用**，它仅仅是在逻辑上是一种暂态的，临时的对话。

### 创建聊天室
比如某项比赛正在直播，解说员可以通过以下代码创建一个临时聊天是与球迷进行互动聊天：

```c#
public async void ChatRoom_SampleCode()
{
    AVIMClient client = new AVIMClient("Dendi");
    await client.ConnectAsync();//Tom 登录客户端
    var chatroom = client.CreateConversationAsync(null, "DK VS NewBee", null, true);
    //详细解释最后一个参数，transient 如果为 true 就说明是聊天室，逻辑上就是暂态对话
}
```

另外，为了方便开发者快速创建聊天室，SDK 提供了一个快捷方法创建聊天室：

```c#
var chatroom = client.CreateChatRoomAsync("皇马 VS 巴萨");//可以理解为一个语法糖，与调用CreateConversationAsync 没有本质区别
```
### 查询在线人数
`AVIMConversation.CountMembersAsync` 不但可以用来查询普通对话的成员总数，在聊天室中，它返回的就是实时在线的人数：

```c#
public async void CountMembers_SampleCode()
{
    AVIMClient client = new AVIMClient("Tom");
    await client.ConnectAsync();//Tom 登录客户端

    AVIMConversation conversation = (await client.GetQuery().FindAsync()).FirstOrDefault();
    int membersCount = await conversation.CountMembersAsync();
}
```
### 查询聊天室
开发者需要注意的是，`AVIMConversationQuery` 调用 `Where` 开头的方法都是查询全部对话的，也就是说，如果想单独查询聊天室的话，需要在额外再调用一次 `WhereEqulaTo` 方法：

比如我想查询主题包含《奔跑吧，兄弟》的聊天室，如下做即可：

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

从代码上可以看出，仅仅是多了一个额外的 `WhereEqualTo("tr", true)` 的链式查询即可。

## 聊天记录
聊天记录一直是客户端开发的一个重点难题，类似于的 QQ 和 微信的解决方案都是依托客户端做缓存，收到一条消息，就按照自己的业务逻辑存储在客户端的文件或者是各种客户端数据库中。

目前为了满足需求，我们特地开放了从服务端获取聊天记录的功能：

### 聊天记录获取

```c#
AVIMClient userA = new AVIMClient("UserA");
AVIMConversation con = userA.GetConversationById("2f08e882f2a11ef07902eeb510d4223b");
con.QueryHistory(DateTime.Now, 0, "UserA").Wait();
//查询 UserA 在 ConversationId 为 `2f08e882f2a11ef07902eeb510d4223b` 中的聊天记录。
```
与查询类似，它提供了  limit 和 skip 操作，可以帮助开发者实现翻页等功能。

## 签名与安全
在继续阅读本文档之前，请确保您已经对 [即时通讯服务开发指南—权限和认证](realtime_v2.html#权限和认证) 有了一定的了解。
### 实现签名工厂
`AVIMClient` 有一个属性：

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

* 首先您需要下载最新版本的[云引擎实例](https://github.com/leancloud/realtime-messaging-signature-cloudcode)到本地，然后部署到您的应用中，详细请参考[命令行工具使用指南](leanengine_cli.html)。

* 其次，在 Visaul Studio 中，新建一个类叫做 `SampleSignatureFactory` ，把下面这段代码拷贝到其中：

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
