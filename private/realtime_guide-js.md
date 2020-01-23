{% extends "./realtime_guide.tmpl" %}

{% block language %}JavaScript{% endblock %}

{% block phone_system %}{% endblock %}

{% block setup_init %}
或者通过 [Bower](http://bower.io/) 安装：
```
bower install leancloud-realtime -- save
```
安装之后，页面直接加载 bower_components/leancloud-realtime/src/AV.realtime.js 即可。

### 兼容性
实时通信 SDK 轻量、高效、无依赖，支持移动终端的浏览器，也可以使用在微信、PhoneGap、Cordova 的多种 WebView 中。同时 SDK 提供插件化、无痛兼容 IE8+ 老版本 IE 浏览器的方式，具体请参考下文 [兼容性](#兼容性-1) 详细说明部分，默认不兼容且性能最佳。
{% endblock %}

{% block demo %}* [聊天 Demo](http://leancloud.github.io/js-realtime-sdk/demo/demo2/)（推荐！[源码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo/demo2)）
* [实时对战游戏 Demo](http://cutpage.sinaapp.com/)（由我们的热心用户提供）{% endblock %}

{% block compatibility %}## 兼容性

### 兼容 IE8+ 

JavaScript 实时通信 SDK 设计的目标是全面支持移动端，灵活高效，所以考虑主要实现轻量、提升性能、减少流量等特性（所以都没有默认支持 Promise），但是因为国内目前浏览器市场中仍然有很大量的 IE8+ 浏览器，所以我们提供一种非常轻量的插件方式来兼容 IE8+。

当你通过 Bower 或者 Github 下载 SDK，会有一个 plugin 目录，其中就是兼容 IE8+ 所需要用到的插件。主要实现原理就是通过 Flash 的 Socket 实现 WebSocket 协议通信，然后 JavaScript 包装下 window.WebSocket，再通过 Flash 与 JavaScript 通信完成对 SDK 的兼容。我们的 Demo 中是兼容 IE8+ 的，也可以参考代码。

**具体兼容方式：**

1、在页面中加入以下代码，路径改为你自己的路径

```html
<!-- 引入插件，兼容低 IE8+ 等低版本浏览器，注意看下面的注释。如果不需要兼容，可以去掉这部分。 -->
<!--[if lt IE 10]>
<script type="text/javascript" src="../../plugin/web-socket-js/swfobject.js"></script>
<script type="text/javascript" src="../../plugin/web-socket-js/web_socket.js"></script>
<script type="text/javascript">
// 设置变量，配置插件中 WebSocketMain.swf 的引用路径
WEB_SOCKET_SWF_LOCATION = "../../plugin/web-socket-js/WebSocketMain.swf";
</script>
<![endif]-->
<!-- 引入插件部分结束 -->

<!-- 引入 LeanCloud 实时通信 SDK -->
<script src="../../src/AV.realtime.js"></script>
```

2、IE8+ 等老版本浏览器中 JavaScript 的问题，要小心

* 要注意不能有 console.log，否则在不开启调试器的情况下 IE8 脚本会停在那个位置却不报错
* IE8 中的 JSON.stringify 会把中文转为 unicode 编码
* IE8 中支持 CORS 跨域请求，不需要使用 jsonp 来 hack，而是用 XDomainRequest 发 request，不过注意这个 request 成功回来没有 response.status

### 其他兼容问题

如果要想在 Android WebView 中使用，请务必开启 WebSocket 支持。另外根据用户反馈，在部分 Android 机型的 WebView 中不支持 WebSocket 的安全链接，所以需要从 wss 协议转为 ws 协议，关闭 WebSocket 的 SSL，RealtimeObject 在初始化时提供 secure 选项可以关闭，详细使用方式请看 [AV.realtime](#AV_realtime) 方法。{% endblock %}

{% block oneOnOneChat_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 向 Jerry 发送消息：'耗子，起床！' 
```
{% endblock %}

{% block avoidCreatingDuplicateConversation %}
>提示：每次调用 `createConversation()` 方法，都会生成一个新的 Conversation 实例，即便使用相同 conversationMembers 和 name 也是如此。因此必要时可以先使用 `AVIMConversationQuery` 进行查询，避免重复创建。
{% endblock %}

{% block oneOnOneChat_received %}
```
- 自定义消息响应类 CustomMessageHandler
- 在 application  的 onCreate() 中注册 CustomMessageHandler
- 初始化 ClientId = Jerry 
- Jerry 登录到系统
- 接收到 Tom 的消息
```
{% endblock %}

{% block oneOnOneChat_received_steps %}
接收消息之前，需要先定义好自己的 `AVIMMessageHandler` 来响应新消息到达的通知，如上例中的 `CustomMessageHandler`。然后通过 `AVIMMessageManager.registerMessageHandler()` 函数来实现绑定。`AVIMMessageManager` 类中还有一个方法 `registerDefaultMessageHandler()` 则用来指定全局默认的消息处理 handler。

> 注意：`AVIMMessageManager.registerDefaultMessageHandler()` 一定要在 `AVIMClient.open()` 之前调用，否则可能导致服务器发回来的部分消息丢失。

然后通过 `AVIMMessageHandler.onMessage()` 函数来接收消息。
{% endblock %}

{% block groupChat_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 建立一个朋友列表 friends：[Jerry, Bob, Harry, William]
- 新建对话，把朋友们列为对话的参与人员
- 发送消息：'Hey，你们在哪儿？'
```
{% endblock %}

{% block groupChat_received %}
```
- 自定义消息响应类 CustomMessageHandler
- 在 application  的 onCreate() 中注册 CustomMessageHandler
- 初始化 ClientId = Bob
- Bob 登录到系统
- 设置接收消息的方法
- Bob 收到消息后又回复了一条：@Tom, 我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？
```
{% endblock %}

{% block imageMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 从系统媒体库获取第一张照片
- 创建图像消息
- 给图像加一个自定义属性：location = '旧金山'
- 图像 Title：'发自我的小米'
- 发送
```
{% endblock %}

{% block imageMessage_url_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称是「猫和老鼠」
- 创建图像消息：http://pic2.zhimg.com/6c10e6053c739ed0ce676a0aff15cf1c.gif
- 加入文本：萌妹子一枚
- 发送
```
{% endblock %}

{% block imageMessage_received_intro %}
{% endblock %}

{% block imageMessage_received %}
{% endblock %}

{% block audioMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 本地读取音频文件：'忐忑.mp3' ，创建音频消息
- 加入文本：'听听人类的神曲~'
- 发送
``` 
{% endblock %}

{% block audioMessage_url_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 从外部链接创建音频消息：http://ac-lhzo7z96.clouddn.com/1427444393952
- 创建音频消息
- 发送
```
{% endblock %}

{% block audioMessage_received_intro %}
{% endblock %}

{% block videoMessage_local_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 打开本地文件夹
- 读取视频文件：'BBC_奶酪.mp4'，创建视频消息
- 发送
```
{% endblock %}

{% block videoMessage_url_sent %}

```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 从外部链接创建视频消息：http://ac-lhzo7z96.clouddn.com/1427267336319
- 发送给 Jerry
```
{% endblock %}

{% block fileMessage_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 打开本地文件夹
- 读取本地文件 leancloud.doc，构造 AVFile
- 发送
```
{% endblock %}

{% block fileMessage_received_intro %}
{% endblock %}

{% block locationMessage_new %}
```
- 1.根据纬度和经度（latitude: 45.0 longitude:34.0）构建 
  AVIMLocationMessage()
- 2. AVGeoPoint 构建
  AVIMLocationMessage(
    AVGeoPoint(31.3853142377, 121.0553079844)
  )
```
{% endblock %}

{% block locationMessage_sent %}
```
- 初始化 ClientId = Tom
- Tom 登录到系统
- 创建与 Jerry 的对话，对话名称为「猫和老鼠」
- 以经度和纬度为参数构建一个地理位置消息 AVIMLocationMessage(138.12454, 52.56461)
- 加入文本：好利来新店！！
//开发者更可以通过具体的设备的 API 去获取设备的地理位置
- 发送
}
```
{% endblock %}

{% block locationMessage_received_intro %}
{% endblock %}

{% block typedMessage_received %}
### 接收富媒体消息

实时通信 SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `conversation.sendMessage()` 函数。在接收端，我们也专门增加了一类回调接口 AVIMTypedMessageHandler，其定义为：

```
public class AVIMTypedMessageHandler<T extends AVIMTypedMessage> extends MessageHandler<T> {

  @Override
  public void onMessage(T message, AVIMConversation conversation, AVIMClient client);

  @Override
  public void onMessageReceipt(T message, AVIMConversation conversation, AVIMClient client);
}
```

开发者可以编写自己的消息处理 handler，然后调用 `AVIMMessageManager.registerMessageHandler()` 函数来注册目标 handler。

接收端对于富媒体消息的通知处理的示例代码如下：

```
class MsgHandler extends AVIMTypedMessageHandler<AVIMTypedMessage> {

  @Override
  public void onMessage(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请按自己需求改写
    switch(message.getMessageType()) {
    case AVIMReservedMessageType.TextMessageType:
      AVIMTextMessage textMsg = (AVIMTextMessage)message;
      Logger.d("收到文本消息:" + textMsg.getText() + ", msgId:" + textMsg.getMessageId());
      break;

    case AVIMReservedMessageType.FileMessageType:
      AVIMFileMessage fileMsg = (AVIMFileMessage)message;
      Logger.id("收到文件消息。msgId=" + fileMsg.getMessageId() + ", url=" + fileMsg.getFileUrl() + ", size=" + fileMsg.getSize());
      break;

    case AVIMReservedMessageType.ImageMessageType:
      AVIMImageMessage imageMsg = (AVIMImageMessage)message;
      Logger.id("收到图片消息。msgId=" + imageMsg.getMessageId() + ", url=" + imageMsg.getFileUrl() + ", width=" + imageMsg.getWidth() + ", height=" + imageMsg.getHeight());
      break;

    case AVIMReservedMessageType.AudioMessageType:
      AVIMAudioMessage audioMsg = (AVIMAudioMessage)message;
      Logger.id("收到音频消息。msgId=" + audioMsg.getMessageId() + ", url=" + audioMsg.getFileUrl() + ", duration=" + audioMsg.getDuration());
      break;

    case AVIMReservedMessageType.VideoMessageType:
      AVIMVideoMessage videoMsg = (AVIMAudioMessage)message;
      Logger.id("收到视频消息。msgId=" + videoMsg.getMessageId() + ", url=" + videoMsg.getFileUrl() + ", duration=" + videoMsg.getDuration());
      break;

    case AVIMReservedMessageType.LocationMessageType:
      AVIMLocationMessage locMsg = (AVIMLocationMessage)message;
      Logger.id("收到位置消息。msgId=" + locMsg.getMessageId() + ", latitude=" + locMsg.getLocation().getLatitude() + ", longitude=" + locMsg.getLocation().getLongitude());
      break;
    }
  }

  @Override
  public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // 请加入你自己需要的逻辑...
  }
}

MsgHandler msgHandler = new MsgHandler();
AVIMMessageManager.registerMessageHandler(AVIMTypedMessage.class, msgHandler);
```

SDK 内部在接收消息时的处理逻辑是这样的：

* 当收到新消息时，实时通信 SDK 会先解析消息的类型，然后找到开发者为这一类型所注册的处理响应 handler，再逐一调用这些 handler 的 onMessage 函数。
* 如果没有找到专门处理这一类型消息的 handler，就会转交给 defaultHandler 处理。

这样一来，在开发者为 `TypedMessage`（及其子类） 指定了专门的 handler，也指定了全局的 defaultHandler 了的时候，如果发送端发送的是通用的 AVIMMessage 消息，那么接受端就是 `AVIMMessageManager.registerDefaultMessageHandler()` 中指定的 handler 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `AVIMMessageManager.registerMessageHandler()` 中指定的 handler 被调用。
{% endblock %}

{% block offlineMessage_android %}**未启用混合推送的情况下，Android 聊天服务是和后台的推送服务共享连接的，所以只要有网络就永远在线，不需要专门做推送。**消息达到后，你可以根据用户的设置来判断是否需要弹出通知。网络断开时，我们为每个对话保存 20 条离线消息。而在启用混合推送的情况下，Android 同样支持类似 iOS 的即时通讯离线推送。{% endblock %}

{% block attributes %} `AVIMMessage.Attributes` {% endblock %}

{% block attributes_property %}Attributes{% endblock %}

{% block customMessage_sent %}
```
- 构造一个 AVIMImageMessage
- 在 Attributes 中加入 location = "拉萨布达拉宫"
- 设置 Title = "这蓝天让我彻底醉了……";
- 发送
```
{% endblock %}

{% block customMessage_received %}
```
- 初始化 ClientId = friend
- 登录到系统
- 接收消息，如果是 Image，读取 Attributes[location]
- //读取的结果就是拉萨布达拉宫
{% endblock %}

{% block customMessage_create %}
继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 AVIMTypedMessage。这里需要注意两点：
  * 在 class 上增加一个 @AVIMMessageType(type=123) 的 Annotation，具体消息类型的值（这里是 `123`）由开发者自己决定（LeanCloud 内建的 [消息类型使用负数](#消息类详解)，所有正数都预留给开发者扩展使用）。
  * 在消息内部属性上要增加 @AVIMMessageField(name="") 的 Annotation，name 为可选字段在声明字段属性，同时自定义的字段要有对应的 getter/setter 方法。
* 调用 `AVIMMessageManager.registerAVIMMessageType()` 函数进行类型注册。
* 调用 `AVIMMessageManager.registerMessageHandler()` 函数进行消息处理 handler 注册。

AVIMTextMessage 的源码如下，可供参考：

```
@AVIMMessageType(type = -1)
public class AVIMTextMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "_lctext")
  String text;
  @AVIMMessageField(name = "_lcattrs")
  Map<String, Object> attrs;

  public String getText() {
    return this.text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Map<String, Object> getAttrs() {
    return this.attrs;
  }

  public void setAttrs(Map<String, Object> attr) {
    this.attrs = attr;
  }
}
```
{% endblock %}

{% block messagePolicy_sent_method %} `AVIMClient.OnMessageReceived` {% endblock %}

{% block messagePolicy_received_method %}{% endblock %}

{% block messagePolicy_received %}{% endblock %}

{% block conversation_specialnote %}
Conversation（对话）这个概念有些人更喜欢叫做 Room（房间），就是几个客户端节点在通信之前要放到同一个房间中，其实这两个是一个道理，只是名字不同，SDK 中为了让大家好理解，两个名字都可以使用。如果你觉得更喜欢 Room 这个概念，那就可以使用 room 方法创建 Room，如果喜欢 Conversation，那就使用 conv 方法创建 Conversation。
{% endblock %}

{% block conversation_init %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 创建朋友列表 friends = [Bob, Harry, William]
- 用 friends 创建新对话
```
{% endblock %}

{% block event_memberJoin %} `onMemberJoined` {% endblock %}

{% block event_memberLeft %} `onMemberLeft` {% endblock %}

{% block event_kicked %} `onKicked` {% endblock %}

{% block event_invited %} `onInvited` {% endblock %}

{% block conversation_join %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取  id 为 551260efe4b01608686c3e0f 的对话 //获取 Jerry 创建的对话的 Id，这里是直接从控制台复制了上一节准备工作中所创建的对话的 objectId
- Tom 主动加入到对话中
```
{% endblock %}

{% block conversation_membersChanged %}
```
- 初始化 ClientId = Bob
- Bob 登录
- 设置 MembersChanged 响应
- switch:case 如果事件类型为 MembersJoined
- 获取本次加入的 ClientIds //因为只是 Tom 一人加入，所以只有一个 Id
- //开发者可以继续添加自己的业务逻辑
- break;

```
{% endblock %}

{% block conversation_memebersJoined %}
```
- 初始化 ClientId = Bob
- Bob 登录
- 设置 MembersChanged 响应
- switch:case 如果事件类型为 MembersJoined
- 获取本次加入的 ClientIds //因为只是 Tom 一人加入，所以只有一个 Id
- //开发者可以继续添加自己的业务逻辑
- break; 
- ------------ 以上与上例相同 ---------------
- 获取对话对象 Id = 551260efe4b01608686c3e0f
- 进入对话
- 设置 OnMembersJoined 响应
- 获取本次加入的 ClientIds //还是只有 Tom 一人，所以这样就可以直接读取到 Tom 的 clientId

```
{% endblock %}

{% block conversation_invite %}
```
- 初始化 ClientId = Jerry
- Jerry 登录
- 假定对话 Id = 551260efe4b01608686c3e0f
- 进入对话
- Jerry 把 Mary 加入到对话 //AddMembers
```
{% endblock %}

{% block conversation_left %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 假定对话 Id = 551260efe4b01608686c3e0f //由 Jerry 创建的对话
- 进入对话
- Tom 主动从对话中退出
``` 
{% endblock %}

{% block conversation_kick %}
```
- 初始化 ClientId = William
- William 登录
- 对话 Id = 551260efe4b01608686c3e0f //由 Jerry 创建的对话
- 进入对话
- William 把 Harry 从对话中踢出去 //RemoveMembers
```
{% endblock %}

{% block conversation_countMember_method %} `conversation:countMembersWithCallback:` {% endblock %}

{% block conversation_countMember %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表，找到第一个对话
- 获取该对话成员数量
```
{% endblock %}

{% block conversation_name %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建对话，同时邀请 Black，对话名称为 '喵星人'
```
{% endblock %}

{% block conversation_changeName %}
```
- 初始化 ClientId = Black
- Black 登录
- 进入 Tom 创建的对话「喵星人」，id = 55117292e4b065f7ee9edd29
- 修改对话名称为「聪明的喵星人」
- 保存到云端
```
{% endblock %}

{% block conversation_mute %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 进入对话：id = 551260efe4b01608686c3e0f
- 将其设置为静音 Mute
```
{% endblock %}

{% block conversation_attributes_new %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建属性 attr 列表对象
- 加入 tag = "private"
- 创建与 Jerry 的对话，对话名称「猫和老鼠」，传入刚加的 attr.tag
```
{% endblock %}

{% block conversation_attributes_modify %}{% endblock %}

{% block conversation_getSingle %}

```
- 初始化 ClientId = Tom
- Tom 登录
- 异步从服务器拉取对话：id = 551260efe4b01608686c3e0f
```
{% endblock %}

{% block conversation_getList %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 进入对话：id = 551260efe4b01608686c3e0f
- 获取最近的 10 条消息 //limit 取值范围 1~1000 之内的整数，默认为 20
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}
```
- ...//前几步与上例相同
- Tom 登录
- 获取消息历史，不指定 limit //  不使用 limit 默认返回 20 条消息
- 获取这 20 条中最早那条消息的信息
- 再获取之前的消息，不指定 limit // 依然默认返回 20 条消息
```
{% endblock %}

{% block conversation_query_equalTo %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr 属性中 topic 是 movie 的查询
- 执行查询
```
{% endblock %}

{% block conversation_query_notEqualTo %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr 属性中 type 不等于 private 的查询
- 执行查询
{% endblock %}

{% block conversation_query_greaterThan %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.age > 18
- 执行查询
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询是指在 `AVIMConversationQuery` 的查询条件中使用正则表达式来匹配数据。
{% endblock %}

{% block conversation_query_regex %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr.tag 是中文的查询 // 正则为 [\u4e00-\u9fa5] 
- 执行查询
```
{% endblock %}

{% block conversation_query_contains %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 attr.keywords 包含「教育」的查询
- 执行查询
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建 clientIds 列表：[Bob, Jerry]
- 构建对话成员有 Bob 和 Jerry 的查询条件
- 执行查询
```
{% endblock %}

{% block conversation_query_combination %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含「教育」、attr.age < 18
- 执行查询
```
{% endblock %}

{% block conversation_query_count %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 构建查询条件：attr.keywords 包含「教育」、attr.age < 18
- 执行查询，获取符合条件的对话的数量
```
{% endblock %}

{% block chatroom_intro %}
和建立普通对话类似，建立一个聊天室只是在 `AVIMClient.createConversation(conversationMembers, name, attributes, isTransient, callback)` 中传入 `isTransient=true`。
{% endblock %}

{% block chatroom_new %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 创建暂态对话，名称 "HelloKitty PK 加菲猫"
```
{% endblock %}

{% block chatroom_count_method %} `AVIMConversation.getMemberCount()` {% endblock %}

{% block chatroom_count %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表中的第一个对话对象
- 获取人数
```
{% endblock %}

{% block chatroom_query_method %} `[AVIMConversationQuery whereKey:]` {% endblock %}

{% block chatroom_query_method2 %} `whereKey:` {% endblock %}

{% block chatroom_query_single %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 获取对话列表中 attr.topic = "奔跑吧，兄弟"、tr = true
- 执行查询
```
{% endblock %}

{% block chatroom_query_history %}
```
- 初始化 ClientId = Tom
- 获取对话对象 id = 2f08e882f2a11ef07902eeb510d4223b
- 获取从过去 24 小时的历史聊天纪录
```
{% endblock %}

{% block chatroom_query_list %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 查找自己加入的聊天室
```
{% endblock %}

{% block networkStatus %}
与网络相关的通知（网络断开、恢复等）会由 `AVIMClientEventHandler` 做出响应，接口函数有：

* `onConnectionPaused()` 指网络连接断开事件发生，此时聊天服务不可用。
* `onConnectionResume()` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。

通过 `AVIMClient.setClientEventHandler()` 可以设定全局的客户端事件响应（ClientEventHandler）。
{% endblock %}

{% block logout %}
```
- 初始化 ClientId = Tom
- Tom 登录
- Tom 登出
```
{% endblock %}

{% block conversation_security %}
### 安全域名

如果是纯前端使用 JavaScript SDK，请务必配置 **控制台** - **设置** - **基本信息** - **JavaScript 安全域名**，防止其他人盗用你的服务器资源。实时通信的安全域名设置会有三分钟的延迟，所以设置完毕后，请耐心等待一下。

详细请看「[数据和安全](data_security.html)」指南中的「Web 安全域名」部分。

### 权限和认证

为了满足开发者对权限和认证的需求，我们设计了 [签名的概念](realtime_v2.html#权限和认证)。

### 防御 XSS

Web 端实现任何可以将用户输入直接输出到界面上的应用都要注意防止产生 XSS（跨站脚本攻击），实时通信 SDK 支持在 SDK 层面开启这个防御，但是我们默认不开启，所以你可以在实例化 realtimeObject 的时候，开启这个选项。

>注意：我们没有对 clientId 做任何过滤，也不建议直接输出 clientId。如果需要将 clientId 输出到 Web 页面中，记得要对其进行 HTML 转义，防止 XSS。

```javascript
// 创建实时通信实例（支持单页多实例）
var appId = '{{appid}}';
realtimeObj = AV.realtime({
    appId: appId,
    clientId: clientId,
    // 是否开启 HTML 转义，SDK 层面开启防御 XSS
    encodeHTML: true,
    // 是否开启服务器端认证
    // auth: authFun
});
```
{% endblock %}

{% block communicate_with_otherSDK %}
## 与其他 SDK 通信

JavaScript 实时通信 SDK 可以与 iOS、Android 等 SDK 进行通信。当你不仅仅只是基于 Web 来实现一个实时通信程序，也想通过使用 LeanCloud 提供的其他类型（iOS、Android 等）的 SDK 实现多端互通，就需要在发送数据时使用媒体类型配置项，具体要到 roomObject.send 方法中详细了解。

Web 端本身无论处理什么类型的数据，浏览器都可以自动解析并渲染，比如图片，只需要一个 img 标签。但是其他终端就不行，比如 iOS，所以你需要告知其他终端你发送的是什么类型的消息，这样其他客户端接收到之后会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：text（文本）、image（图片）、audio（声音）、video（视频）、location（地理位置）、file（各种类型文件）等类型。
{% endblock %}

## 方法列表

### 全局命名空间

LeanCloud JavaScript 相关 SDK 都会使用「AV」作为命名空间。

### AV.realtime

使用:
```javascript
AV.realtime(options, callback)
```

描述：

* 这是创建实时通信对象的方法，会启动实时通信的连接。自动调用 open 方法，内部与服务器匹配，并建立 WebSocket 连接。内部会自动维持与服务器的链接稳定，控制心跳数据包的频率，超时检测等，如果发生中断可以通过监听对应的事件来给用户界面上的变化提示。

* 另外，此方法支持多实例，也就是说，你可以在一个页面中，创建多个 RealtimeObject 来实现聊天。

参数：

* options {Object} （必须） 配置实时通信服务所需的必要参数。其中包括：

    * appId {String} （必须）应用的 AppId，在「控制台」-「设置」-「基本信息」中可以查看；

    * clientId {String} （必须）当前客户端的唯一 id，用来标示当前客户端；

    * encodeHTML {Boolean} （可选）是否开启 HTML 转义，在 SDK 层面直接防御 XSS（跨站脚本攻击），该选项默认不开启；true 为开启，false 为关闭。

    * authFun {Function}（可选）可以传入权限认证的方法，每次当建立连接的时候就会去服务器请求认证，或者许可之后才能建立连接，详细阅读 [权限和认证](realtime_v2.html#权限和认证)，也可以参考 [demo](https://github.com/leancloud/js-realtime-sdk/tree/master/demo) 中的示例；

    * secure {Boolean}（可选）是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护，默认开启。true 为开启，false 为关闭。

返回：

* {Object} 返回 RealtimeObject（实时通信对象），其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appid,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId,
   // 是否开启 HTML 转义，SDK 层面开启防御 XSS
   encodeHTML: true,
   // auth 是权限校验的方法函数
   // auth: authFun,
   // 是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护
   secure: true
}, function() {
   console.log('与服务器连接成功！');
});

// 监听 open 事件会得到同样的效果
realtimeObject.on('open', function() {
   console.log('与服务器连接成功！');
});
```

### AV.realtime.version

用法：
```javascript
AV.realtime.version
```

描述：

* 获取当前 SDK 的版本信息

返回：

* {String} 返回当前版本

例子：

```javascript
// 返回版本号
console.log('当前版本是：' + AV.realtime.version);   
```

### RealtimeObject.open

用法：
```javascript
RealtimeObject.open(callback)
```

描述：

* 该方法一般情况下，你不需要调用，SDK 会自动启动与服务的连接。该方法可以启动实时通信的连接，与服务器匹配建立 websocket 连接；

参数：

* callback {Function}（可选）创建成功并且与服务器建立连接后触发的回调，此时也会派发一个私有的事件「open」到 RealtimeObject 内部，也可以通过监听当前的 RealtimeObject 实例的 open 事件来处理连接成功的业务逻辑；

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 真正使用时这里也无需调用，实例化 RealtimeObject 的时候 SDK 会自动调用 open 方法
realtimeObject.open(function() {
   // 与服务器连接成功
   console.log('open');
});

realtimeObject.on('open', function() {
   console.log('open,too.');
});
```

### RealtimeObject.close

用法：
```javascript
RealtimeObject.close()
```

描述：

* 关闭实时通信的连接，并且内部会关闭 websocket 连接。该方法没有回调，因为调用会立刻关闭 WebSocket。

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

realtimeObject.close();

realtimeObject.on('close', function() {
   console.log('与服务器已经断开！');
});
```

### RealtimeObject.on

用法：
```javascript
RealtimeObject.on(eventName, callback)
```

描述：

* 监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件每次派发就会被触发一次；

参数：

* eventName {String} （必须）监听的事件名称

* callback {Function} （必须）当事件被派发时会调用的回调

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当新建一个 Room 的时候就会触发
realtimeObject.on('create', function(data) {
   console.log(data);
});

// 有人加入 Room 的时候会被触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RealtimeObject.once

用法：
```javascript
RealtimeObject.once(eventName, callback)
```

描述：

* 监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件只会被触发一次；

参数：

* eventName {String} （必须）监听的事件名称

* callback {Function} （必须）当事件被派发时会调用的回调

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当服务建立之后会被触发
realtimeObject.once('open', function() {
   console.log('opened');
});

// 当服务关闭的时候会被触发
realtimeObject.once('close', function() {
   console.log('closed');
});
```

### RealtimeObject.emit

用法：
```javascript
RealtimeObject.emit(eventName, dataObject)
```

描述：

* 派发一个事件到 RealtimeObject 中，局部的事件中心

参数：

* eventName {String} （必须）派发的事件名称

* dataObject {Obejct}（可选）传递的参数，可以在监听的回调中通过第一个参数获取

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', function(data) {
   // 会输出 test
   console.log(data.aaa);
});

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.off

用法：
```javascript
RealtimeObject.off(eventName, callback)
```

描述：

* 从 RealtimeObject 中的私有的事件中心，删除一个事件对应的回调函数绑定

参数：

* eventName {String} （必须）一个绑定过的事件名称

* callback {Function}（必须）要在这个事件中移除的函数

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var eventFun = function(data) {
   // 会输出 test
   console.log(data.aaa);
};

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', eventFun);

// 事件方法从事件监听中删除
realtimeObject.off('LeanCloud123', eventFun);

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.conv

用法：
```javascript
RealtimeObject.conv(options, callback)
```

描述：

* 创建一个 Conversation（对话），实时通信的最小单元。conv 和 room 方法实现的是同样的方法，为了保持概念上的统一，详见「[特别说明](#特别说明)」；

参数：

* options {Object} （可选）传入配置信息
    
    * members {Array} （可选）创建 conversation 时可以直接加入成员的 clientId，如 ['LeanCloud1', 'LeanCloud2']

    * attr {Object} （可选）自定义的数据信息，如 title、image、xxx 等

    * name {String} （可选）Conversation 的名字

    * transient {Boolean} （可选）是否为暂态的 conversation，暂态的 conversation 可以支持大量用户（超过 500 人）同时在此聊天，但是不支持消息回执和历史记录。
    **普通聊天每个 conversation 最多只能支持 500 人，如果预计单个 conversation 会超过这个数字，那请开启这个选项。**

    * callback {Function} （可选）创建成功后的回调函数，此时也会在 RealtimeObject 内部派发一个 create 事件，可以通过 RealtimeObject.on() 方法来监听；

返回：

* {Object} 返回 convObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.conv({
    // 人员的 id
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 创建暂态的聊天室
    // transient: true,
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Conversation created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.conv

用法：
```javascript
RealtimeObject.conv(convId, callback)
```

描述：

* 匹配一个在服务器端已有的 Conversation（对话），并生成对应的 convObject，此时不派发任何事件；

参数：

* convId {String} （必须）传入已有 Conversation（对话） 的 id

* callback {Function} （可选）创建成功后的回调函数，此时不会派发任何事件；

返回：

* {Object} 返回 convObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var convId = 'sasfalklkjdlfs123';
var conv;

// 获取已有的 conversation
realtimeObject.conv(convId, function(obj) {
  // 判断服务器端是否存在这个 conversation
  if (obj) {
    // 获取到这个 conversation 的实例对象
    conv = obj;
    console.log('可以取到 id', conv.id);
    console.log('可以取到 name', conv.name);
    console.log('可以取到属性', conv.attr);
  } else {
    console.log('服务器端不存在这个 conversation。');      
  }
});
```

### RealtimeObject.room

用法：
```javascript
RealtimeObject.room(options, callback)
```

描述：

* 创建一个 Room（房间），实时通信的最小单元。room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 conv 完全相同。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});
// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    // 成员列表
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Room created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.room

用法：
```javascript
RealtimeObject.room(roomId, callback)
```

描述：

* 匹配一个在服务器端已有的 room，并生成对应的 RoomObject，此时不派发任何事件；room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 conv 完全相同。

参数：

* roomId {String} （必须）传入已有 Room 的 id

* callback {Function} （可选）创建成功后的回调函数，此时不会派发任何事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var roomId = 'sasfalklkjdlfs123';
var room;
realtimeObject.room(roomId, function(obj) {
  if (obj) {
    room = obj;
    console.log('room id:', room.id);
    console.log('room name:', room.name);
    console.log('room data:', room.attr);
  } else {
    console.log('服务器不存在这个 room。');
  }
});
```

### RealtimeObject.query

用法：
```javascript
RealtimeObject.query(callback)
```

描述：

* 获取当前用户所在的 Room 信息

参数：

* callback {Function} （必须）创建成功后的回调函数，参数中可以获取到 Room 的列表；

返回：

* {Object} 返回 realtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当实时通信建立成功之后
realtimeObject.on('open', function() {
   // 查询当前用户所在的组
   realtimeObject.query(function(data) {
      console.log(data);  // list
   });
});
```

### RealtimeObject.query

用法：
```javascript
RealtimeObject.query(options, callback)
```

描述：

* 查询实时通信表中的数据

参数：

* options {Object} （可选）一些配置参数

  * where {Object} （可选）默认为包含自己的查询 {m: clientId}

  * sort {String} （可选）默认为 -lm，最近对话反序

  * limit {Number} （可选）一次获取的条目数量，默认为 10

  * skip {Number} （可选）跳过多少个索引，比如 skip: 1000，就是从 1001 开始查询，默认为 0

  * compact {Boolean} （可选）是否要去掉内置大字段（成员列表，静音列表和当前用户静音的状态），默认 false

* callback {Function} （必须）创建成功后的回调函数，参数中可以获取到 Room 的列表

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当实时通信建立成功之后
realtimeObject.on('open', function() {
   // 各种条件查询
   realtimeObject.query({
       where: {m: 'abc123'},
       sort: '-lm',
       limit: 100,
       skip: 200,
       compact: false
   },function(data) {
      console.log(data);  // list
   });
});
```

### RealtimeObject.ping

用法：
```javascript
RealtimeObject.ping(clientIdList, callback)
```

描述：

* 查询对应的 clientId 是否处于服务在线状态

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的数组，如 ['LeanCloud1', 'LeanCloud2']。**注意：每次最多只能判断 20 个 clientId，超过 20 个只查询前 20 个，因为消息过长可能导致 WebSocket 包过长而被服务器断开连接。**

* callback {Function} （必须）回调函数，可以在参数中获得在线的 clientIdList，比如返回 ['LeanCloud2']，则说明 LeanCloud2 在线

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

realtimeObject.ping([
    'LeanCloud01',
    'LeanCloud02'
], function(data) {
    // 返回传入的 id 中，在线的用户 id
    console.log(data);
});
```

### RealtimeObject.ping

用法：
```javascript
RealtimeObject.ping(clientId, callback)
```

描述：

* 查询对应的 clientId 是否处于服务在线状态

参数：

* clientId {String} （必须）传入已有用户的 clientId，如 'LeanCloud1'

* callback {Function} （必须）回调函数，可以在参数中获得在线的 clientIdList，比如返回 ['LeanCloud1']，则说明 LeanCloud1 在线

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

realtimeObject.ping('LeanCloud01', function(data) {
    if (data.length) {
       console.log('用户在线');
    } else {
       console.log('用户不在线');
    }
});
```

### RoomObject.add

用法：
```javascript
RoomObject.add(clientId, callback)
```

描述：

* 向当前 RoomObject 中添加一个用户

参数：

* clientId {String} （必须）传入已有用户的 clientId

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.add('LeanCloud03', function() {
    console.log('Add success.');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.add

用法：
```javascript
RoomObject.add(clientIdList, callback)
```

描述：

* 向当前 RoomObject 中添加多个用户

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.add(['LeanCloud03', 'LeanCloud04'], function() {
    console.log('Add success.');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.remove

用法：
```javascript
RoomObject.remove(clientId, callback)
```

* 描述：从当前 RoomObject 中删除一个用户

参数：

* clientId {String} （必须）传入已有用户的 clientId

* callback {Function} （可选）删除成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.remove('LeanCloud02', function() {
    console.log('Remove success.');
});

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.remove

用法：
```javascript
RoomObject.remove(clientIdList, callback)
```

描述：

* 从当前 RoomObject 中删除多个用户

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.remove(['LeanCloud02', 'LeanCloud03'], function() {
    console.log('Remove success.');
});

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.join

用法：
```javascript
RoomObject.join(callback)
```

描述：

* 加入当前这个 Room

参数：

* callback {Function} （可选）加入成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断服务器是否存在这个 room
    if (object) {
        room = object;
        room.join(function() {
            console.log('join');
        });
    }
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.leave

用法：
```javascript
RoomObject.leave(callback)
```

描述：

* 从当前 RoomObject 中离开

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.leave();

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.list

用法：
```javascript
RoomObject.list(callback)
```

描述：

* 获取当前 RoomObject 中的成员列表

参数：

* callback {Function} （必须）获取成员列表的回调函数；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.list(function(data) {
  console.log(data); // room 中成员 list
});
``` 

### RoomObject.send

用法：
```javascript
RoomObject.send(dataObject, callback)
```

描述：

* 向当前这个 RoomObject 中发送消息

参数：

* dataObject {Object} （必须）发送的数据内容

* callback {Function} （可选）发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到。

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    testMsg: 'abcde'
}, function() {
    console.log('server ack.');
});

// 当前用户所在的组，有消息时触发
realtimeObject.on('message', function(data) {
   console.log(data);
});
```

### RoomObject.send

用法：
```javascript
RoomObject.send(dataObject, options, callback)
```

描述：

* 向当前这个 RoomObject 中发送消息

参数：

* dataObject {Object} （必须）发送的数据内容

* options {Object} （可选）发送消息时的配置项

    * receipt {Boolean} （可选）默认 false。是否需要接收是否收到的回执信息，true 为接收，可以在 RoomObject.receipt 方法中接收

    * transient {Boolean} (可选) 默认 false。是否发送的是「暂态消息」，暂态消息不会有回调，不会存在历史记录中，可以用来发送用户的输入状态（如：「正在输入。。。」的效果）

    * type {String} （可选） 无默认值。该参数在多端通信中会用到，当你打算与基于 LeanCloud iOS、Android 等客户端通信时，需要使用此选项来设置不同的媒体类型，这样其他客户端接收到之后会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：text（文本）、image（图片）、audio（声音）、video（视频）、location（地理位置）、file（各种类型文件），具体使用方式请参考下面的例子。 

* callback {Function} （可选）发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true,
    // 是否是暂态消息
    transient: false
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data); 
});

// 与 iOS、Android 等 SDK 通信

// 发送文本
room.send({
    text: '文本内容'
}, {
    type: 'text'
}, function(data) {
    // 发送成功之后的回调
});

// 发送图片
room.send({
    // 描述信息
    text: '图片测试',
    // 自定义的属性，可选填，非必须项
    attr: {
        aaa: 123
    },
    url: 'https://leancloud.cn/images/123.png',
    // 图片相关信息，所有选项可选填，非必须项
    metaData: {
        // 图片名字
        name:'logo',
        // 文件格式
        format:'png',
        // 高度，单位像素 px
        height: 123,
        // 宽度，单位像素 px
        width: 123,
        // 文件大小，单位比特 b
        size: 888
    }
}, {
   type: 'image'
}, function(data) {
    console.log('图片数据发送成功！');
});
```

### RoomObject.receive

用法：
```javascript
RoomObject.receive(callback)
```

描述：

* 接收到当前这个 RoomObject 中的消息

参数：

* callback {Function} （必须）收到当前 Room 中信息的处理函数

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.receive(function(data) {
   // 接收到的信息
   console.log(data); 
});
```

### RoomObject.receipt

用法：
```javascript
RoomObject.receipt(callback)
```

描述：

* 如果你通过 RoomObject.send 方法发送了需要有回执功能的信息，那么通过 RoomObject.receipt 可以接收当前这个房间中的所有这类回执信息；回执表示从实时通信服务本身，对方的客户端已经收到该信息

参数：

* callback {Function} （必须）收到的回执信息

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data);
});
```

### RoomObject.log

用法：
```javascript
RoomObject.log(callback)
```

描述：

* 获取当前 RoomObject 中的消息历史。这个是一个简单的方式，可以获取最近 20 条历史消息。

参数：

* callback {Function} （必须）回调函数，参数中可以取得历史消息数据

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断这个 room 在服务器端是否存在
    if (object) {
        // 当前用户所在的组，有消息时触发
        room.log(function(data) {
           console.log(data);
        });
    }
};
```

### RoomObject.log

用法：
```javascript
RoomObject.log(options, callback)
```

描述：

* 获取当前 RoomObject 中的消息历史。

参数：

* options {Object} （可选）查询历史条目的参数

  * t {String|Number} （可选）查询历史消息的时间戳，查询这个时间之前的消息

  * mid {String} （可选）message id 消息的 id，当接收到消息的时候会有这个 id，用来辅助查询，防止同一时间戳下有两条一样的消息

  * limit {Number} （可选）返回消息历史的条目数量，默认是查询最近 20 条历史消息 

* callback {Function} （必须）回调函数，参数中可以取得历史消息数据

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    
    // 判断这个 room 在服务器端是否存在
    if (object) {
     
      // 当前用户所在的组，有消息时触发
      room.log({
         // 时间戳，查询这个时间之前的消息
         t: 1429545834932
         // message id
         // mid: 'afsadsa_ds2w',
         // 返回条目数量
         limit: 20
      }, function(data) {
         console.log(data);
      });
    }
};
```

### RoomObject.count

用法：
```javascript
RoomObject.count(callback)
```

描述：

* 获取当前这个 Room（或者 Conversation）中的用户数量

参数：

* callback {Function} （必须）返回的数据中可以获取到用户数量

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.count(function(data) {
   // 当前用户数量
   console.log(data); 
});
```

## 全局事件

SDK 会默认派发一些事件，这些事件仅会在 RealtimeObject 内部被派发（注意：RoomObject 内部默认不会派发任何事件），你可以通过监听这些事件来完成你的操作。这些事件往往都是脱离 Room（或者 Conversation）的，你可以监听到其他 Room 中的相关信息。

以下是默认事件的说明：

### open

描述：

* 与服务器建立好连接之后就会被派发，包括当服务断开重新被连接上时也会被触发

### close

描述：

* 与服务器连接断开就会被派发，包括网络中断

### create

描述：

* 新建一个 Room 成功之后会被触发

### join

描述：

* 当一个 Room 新增了一个成员之后会被触发

### left

描述：

* 当一个 Room 中有成员离开之后会被触发

### message

描述：

* 当收到消息时会被触发，收到的消息是当前客户端（clientId）存在的 Room 中的信息，所有这些数据都可以在服务器端看到。

### reuse

* 发生连接错误，可能是网络原因，SDK 在自动尝试重连。可以监听这个状态，给用户「服务器已断开，正在重新连接。。。」之类的提示。

### receipt

* 收到消息回执的时候会被触发
