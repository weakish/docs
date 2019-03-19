# Android 即时通讯服务

## 简介

在阅读本开发指南之前，请先阅读下[《即时通讯开发指南》](./realtime.html)，了解即时通讯的基本概念和模型。

##初始化

和其他的LeanCloud服务一样，即时通讯系统的初始化也是在Application的onCreate方法中进行的：

```java
public class MyApplication extends Application{

    public void onCreate(){
        AVOSCloud.initialize(this,"{{appId}}","{{appKey}}");
    }
}
```

并且在AndroidManifest.xml中间声明：

```xml
<manifest ...

 <application
        android:name=".MyApplication"
        ....>
</application>
</manifest>
```

##登录

以一个最简单的聊天系统的原型来分析实现 Android 的即时通讯，这样的一个聊天系统最主要的有两个模块：用户系统，对话的发送接收。
在每一个用户系统中间，用户一定有一个唯一表示的符号来标识他们与别人的区别，比如：userId、email、手机号码或者我们提供的 AVUser 的 objectId；同时这个符号也需要能够通过某种方式（登录）而正确获取。
由于考虑到很多开发者在接入即时通讯系统时，可能已经有现成的用户系统，所以我们在设计即时通讯模块的时候，并没有强制将用户系统的登录状态与即时通讯的登录状态绑定到一起，而是通过一种更为开放的方式去控制即时通讯的登录状态。当一个用户需要登录即时通讯模块的时候，我们需要:

```java
AVUser.logInInBackground("用户名","password",new LogInCallback<AVUser>(){
   @Override
   public void done(AVUser user, AVException e){
         //此处的selfId就是之前提到的用户的唯一标识符 Peer ID,
         //应该替换成你现有用户系统中的唯一标识符，这里以我们提供的的用户系统为例
         String selfId = user.getObjectId();
         Session session = SessionManager.getInstance(selfId);
         List<String> yourFriends = new List<String>();
         .... //add your friends' peerIds
         session.open(yourFriends);
   }
});
```

这样你就向服务器发起了一个即时通讯的登录请求。但是至今为止还不能发送消息，因为即时通讯的所有请求都是异步的，只有当你接收到异步请求对应的成功回调时，你才能进行下一步操作。
要接收异步请求对应的回调，你需要实现继承 AVMessageReceiver 的自定义 Receiver，并且注册到AndroidManifest.xml。

```java
public class ChatDemoMessageReceiver extends AVMessageReceiver{
  ...实现抽象方法,比如：
  @Override
  public void onSessionOpen(Context context, Session session) {
    System.out.println("用户成功登录上即时通讯服务器了");
  }
}
```

并且在AndroidManifest.xml中间声明:

```xml
<receiver android:name=".ChatDemoMessageReceiver" >
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="com.avoscloud.session.action" />
    </intent-filter>
</receiver>
```
至此，就完成了用户的登录环节。
不管你接下来的操作是单聊还是群聊，你都需要实现之前的所有步骤才能进行下一步的操作。

`AVMessageReceiver` 中还有很多其他回调方法来接收其他操作的异步通知，如发送消息、接收消息等，我们将在下面的章节中介绍，它是即时通讯的核心 API 之一。

##单聊

单聊的情景相对也是比较简单的，用户可以选择向任何人发送相应的消息。如果应用开启 [签名认证](./realtime.html#签名认证)，单聊前需要首先调用 watch。

###添加好友

正如上文提到了，开启了签名认证的即时通讯系统在发送消息前需要保证发送的对象是被 watch 过的。对于已有的好友列表，你可以如上文提到的方法，在登录即时通讯系统的时候放在参数中间；对于新的好友，你可以通过如下代码进行添加：

```java
Session session = SessionManager.getInstance(selfId);
session.watch(Arrays.asList("friend1","friend2"));
```

其中 friend1、friend2 是其他用户的 peer id，下面提到的 firend id 与此类似。

之后添加是否成功则可以通过Receiver中的回调的方式来获悉：


```java
public class ChatDemoMessageReceiver extends AVMessageReceiver{

  @Override
  public void onPeersWatched(Context context, Session session, List<String> peerIds) {
     //watch 成功
  }
}
```

在任何一个时候你也可以通过以下代码来判断是否已经 watch 过某个用户：

```java
Session session = SessionManager.getInstance(selfId);
boolean watched = session.isWatching("friend1");
```

###发送消息

在用户成功登录即时通讯系统以后，用户就可以进行消息的发送接收等。

```java
Session session = SessionManager.getInstance(selfId);
AVMessage msg = new AVMessage();
msg.setMessage("这是一个普通的消息");
//friendId是指目标用户的 peer id，也就是想接收这条消息的用户。
msg.setToPeerIds(Arrays.asList(friendId));
session.sendMessage(msg);
```

正如上文提到的，即时通讯中所有的操作都是异步操作，发送消息也是一样，针对于消息发送的结果，我们需要在之前提到的Receiver中实现对应的方法 `onMessageSent` 或者 `onMessageFailure`：

```java
public class ChatDemoMessageReceiver extends AVMessageReceiver{

  @Override
  public void onMessageSent(Context context, Session session, AVMessage msg) {
    //这个时间是来自服务器端的时间，这样即便是多台设备中间也不会出现时间的混乱
     System.out.println("消息发送成功了，发送成功时间是"+msg.getTimestamp());
  }

  @Override
  public void onMessageFailure(Context context, Session session, AVMessage msg) {
     System.out.println("消息发送失败了，可能需要在app端进行重试等");
     //重试逻辑......
  }
}
```

#### 在线（瞬时）消息

有些应用可能会有指定消息是否是只有用户在线才能接收，我们在系统中间也进行了支持。将消息设置为 `transient`，那么消息只会发送给在线用户，如果用户不在线，也不会作为离线消息存储，而是直接丢弃。

```java
Session session = SessionManager.getInstance(selfId);
AVMessage transientMsg = new AVMessage();
transientMsg.setMessage("这是一个 transient 消息，只有对方当时在线才能收到");
transientMsg.setTransient(true);
transientMsg.setToPeerIds(Arrays.asList(friendId));
session.sendMessage(transientMsg);

AVMessage msg = new AVMessage();
msg.setMessage("这是一个普通消息，对方在线立即收到，如果对方当时不在线，将作为离线消息存储。");
msg.setTransient(false);//如果不设置，默认是false
msg.setToPeerIds(Arrays.asList(friendId));
session.sendMessage(msg);
```

默认消息都是普通消息，而非在线消息。

#### 消息回执

由于离线消息的存在，消息的发送成功与真正对方收到消息，可能在时间上存在一定的先后消息。应用可能想明确知道消息是否送达目标用户，我们也通过消息回执的形式来支持这样的操作：

```java
Session session = Session.getInstance(selfId);
AVMessage msg = new AVMessage();
msg.setMessage("这是一个带有消息回执的消息");
//设置消息回执为 true
msg.setRequestReceipt(true);
msg.setToPeerIds(Arrays.asList(friendId));
```

针对消息回执，我们会产生额外的回调：

```java
public class ChatDemoMessageReceiver extends AVMessageReceiver{

  @Override
  public void onMessageDelivered(Context context, Session session, AVMessage msg) {
    //消息真正到达用户了
    System.out.println(msg.getMessage() + "delivered at " + msg.getReceiptTimestamp());
  }
}
```

**注:消息回执的功能仅仅能够在单聊中使用，消息接收者不能多于一人，并且要求消息不能是在线（瞬时）消息。**

#### 多媒体消息

即时通讯系统已经不在是多年以前的聊天室，用户往往会通过更多更丰富的多媒体内容来进行有效的交互，比如：图片，短视频，语音，地理位置等等。开发者可以通过将AVMessage中的message当做一个相对复杂的数据结构的形势来实现这样的消息内容。比如我们使用 JSON 数据作为消息内容传输

```java
//示范一个简单的带图片的消息{"type":"file","content":"https://leancloud.cn/images/static/partner-iw.png"}
HashMap<String, Object> params = new HashMap<String, Object>();
params.put("type", "file");
params.put("content", "https://leancloud.cn/images/static/partner-iw.png");
AVMessage msg = new AVMessage(JSON.toJSONString(params));
```

您也可以采用其他序列化方案，只要中间格式是文本即可。

### 接收消息

一个客户端在即时通讯系统中间不仅仅会扮演简单的发送者的概念，同时也会需要扮演接收者的角色。和之前的所有回调一样，消息的接收也是通过继承的Receiver来接收的：

```java
public class ChatDemoMessageReceiver extends AVMessageReceiver{

  @Override
  public void onMessage(Context context, Session session, AVMessage msg) {
    //处理接收到的消息，一条新消息到达
  }
}
```

##群聊

### 创建群组
当你想要创建一个群组的时候，你可以通过以下代码来创建一个新的群组：

```java
Session session = SessionManager.getInstance(selfId);
Group group = session.getGroup();
group.join();
```

正如上文所说的，所有的请求都是异步的，群组的创建和加入也需要通过Receiver的回调来获取成功的结果。但是群组需要一个额外的 Receiver——`AVGroupMessageReceiver`：

```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{
    @Override
    public void onJoined(Context context, Group group){
       //在这里来处理加入成功以后的回调
    }
}
```
同时你需要在 `AndroidManifest.xml` 中间注册这个Receiver:

```xml
<receiver android:name=".DemoGroupMessageReceiver" >
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="com.avoscloud.group.action" />
    </intent-filter>
</receiver>
```

### 加入群组
有时候用户并不需要自己创建一个单独的群组，而是想要加入一个现存的群组。

所有应用内的群组都被放在了 AVOSRealtimeGroups 表中。你可以通过 AVQuery 获取 AVOSRealtimeGroups 对象对应的 objectId 作为 groupId:

```java
//通过 AVQuery 查找到群组的 objectId 作为 groupId
Session session = SessionManager.getInstance(selfId);
Group group = session.getGroup(groupId);
group.join();
```
对于之前已经加入过的群组，只要没有显式调用过quit()，**并不需要在重新上线以后反复 join**。只要在`session.open` 以后，就能收到来自群组的消息。

AVQuery 查询参考 [Android 指南](./leanstorage_guide-android.html#查询)。

### 发送消息

群组的消息发送几乎与单聊的消息发送相同，只是发送的调用对象不再是 session 而是 group:

```java
Session session = SessionManager.getInstance(selfId);
Group group = session.getGroup(groupId);
AVMessage message = new AVMessage();
message.setMessage("这是一段群消息示范");
group.sendMessage(message);
```

和单聊的发送消息一样，发送是否成功需要在Receiver中间加入对应的回调：


```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{

 @Override
  public void onMessageSent(Context context, Group group, AVMessage message) {
    System.out.println(message.getMessage() + " sent");
  }

  @Override
  public void onMessageFailure(Context context, Group group, AVMessage message) {
    System.out.println(message.getMessage() + " failure");
  }
}
```

在群组中间支持在线消息，但是却不支持消息回执

### 接收消息

和单聊时一样，接收消息也是通过Receiver来获取的：

```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{

 @Override
  public void onMessage(Context context, Group group, AVMessage msg){
      //处理接收到的消息
  }
}
```

### 群成员管理

与单聊不同的是，群的概念是集成在 LeanCloud 中的，所以从用户的标识符到群组间的关系都被维护在LeanCloud中。相应的群组成员管理的功能也都可以在LeanCloud的即时通讯系统进行操作。

#### 查询群成员
不管用户是需要邀请更多用户进入群组还是想要剔除部分用户，都需要知道当前群组内已经有哪些用户了。开发者可以通过下面的代码来实现群组内成员列表的查询：

```java
    Session session = Session.getInstance(selfId);
    Group group = session.getGroup(groupId);
    group.getMembersInBackground(new GroupMemberQueryCallback(){
     @Override
     public abstract void done(List<String> groupMembers, AVException exception){
        //获得群组里的用户列表 groupMembers
     }
    })
```

#### 邀请成员

当你进入一个群组以后，你可以邀请一些你的好友进入这个群组，进行进一步的讨论：

```java
Session session = Session.getInstance(selfId);
Group group = session.getGroup(groupId);
group.inviteMember(Arrays.asList("friend1","friend2","friend3"....));
```

而邀请是否成功的回调，同样也在对应的Receiver中获取：

```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{

  @Override
  public void onInvited(Context context, Group group, List<String> invitedPeers) {
    LogUtil.avlog.d("you've invited " + invitedPeers + " to " + group.getGroupId());
  }

  @Override
  public void onReject(Context context, Group group, String op, List<String> targetIds){
    //假如之前的操作由于权限问题（后文会介绍）而无法成功，回调就在本方法中产生。
    //邀请失败时，对应的op值将是 "invite" 字符串
  }

}
```

#### 剔除成员

除了能够邀请成员以外，群组成员也可以剔除现在在群组内的用户：

```java
Session session = Session.getInstance(selfId);
Group group = session.getGroup(groupId);
group.kickMember(Arrays.asList("friend1","friend2","friend3"....));
```

与邀请对应的，剔除对应回调代码也在Receiver中，对应如下:

```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{

  @Override
  public void onKicked(Context context, Group group, List<String> kickededPeers) {
    LogUtil.avlog.d("you've kiced " + kickedPeers + " from " + group.getGroupId());
  }

  @Override
  public void onReject(Context context, Group group, String op, List<String> targetIds){
    //假如之前的操作由于权限问题（后文会介绍）而无法成功，回调就在本方法中产生。
    //邀请失败时，对应的 op 是 "kick"
  }

}
```

### 退出群组
退出群组的代码也相对比较简单:

```java
Session session = Session.getInstance(selfId);
Group group = session.getGroup(groupId);
group.quit();
```

如果你想要监听是否真正成功退组，你可以在Receiver中进行检测：

```java
public class DemoGroupMessageReceiver extends AVGroupMessageReceiver{

  @Override
  public void onQuit(Context context, Group group) {
    LogUtil.avlog.d("Quit from" + group.getGroupId());
  }
}
```

##　权限管理
在LeanCloud中间的权限管理与传统的 token 机制略有不同，我们通过签名服务来实现即时通讯过程中间部分操作的权限管理。
在阅读下面的代码前，你可能需要先了解一下有关权限管理的基本概念：[权限和认证](./realtime.html#权限和认证)。

在即时通讯系统中间，很多操作是需要有权限控制才能操作成功的,比如：单聊的添加好友，群组的邀请、剔除操作等，都需要做一定权限认证。
客户端传一些参数给自有用户系统或者云引擎（统称权限管理服务器），权限管理服务器端根据一定的逻辑判断操作是否合法，如果该操作是合法的，则返回一个正确的签名；如果是非法的，就返回一个错误的签名。之后在即时通讯的过程中就会将返回的签名带在通信的请求中，LeanCloud的即时通讯服务器会比对自己算出来的签名与客户端传递过来的签名是否一致来获知该操作是否合法。

完成一个简单的权限管理认证系统，你需要以下几个步骤（下面以LeanCloud的云引擎服务作为权限认证服务器为例）：

1. 部署云引擎[签名范例](https://github.com/leancloud/realtime-messaging-signature-cloudcode)代码到LeanCloud的云引擎服务器
2. 在LeanCloud中你的项目对应的网页控制台的`设置`->`应用选项`->`聊天推送`中打开`聊天服务签名认证`
3. 在 SDK 中间继承 SignatureFactory 抽象类

```java
public class KeepAliveSignatureFactory implements SignatureFactory {
 @Override
 public Signature createSignature(String peerId, List<String> watchIds) {
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("watch_ids",watchIds);

   try{
     Object result =  AVCloud.callFunction("sign",params);
     if(result instanceof Map){
       Map<String,Object> serverSignature = (Map<String,Object>) result;
       Signature signature = new Signature();
       signature.setSignature((String)serverSignature.get("signature"));
       signature.setTimestamp((Long)serverSignature.get("timestamp"));
       signature.setNonce((String)serverSignature.get("nonce"));
       signature.setSignedPeerIds((List<String>)serverSignature.get("watch_ids"));
       return signature;
     }
   }catch(Exception e){
   }
   return null;
 }

  @Override
  public Signature createGroupSignature(String groupId, String peerId, List<String> targetPeerIds,String action){
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("group_id",groupId);
   params.put("group_peer_ids",targetPeerIds);
   params.put("action",action);

   try{
     Object result = AVCloud.callFunction("group_sign",params);
     if(result instanceof Map){
        Map<String,Object> serverSignature = (Map<String,Object>) result;
        Signature signature = new Signature();
        signature.setSignature((String)serverSignature.get("signature"));
        signature.setTimestamp((Long)serverSignature.get("timestamp"));
        signature.setNonce((String)serverSignature.get("nonce"));
        signature.setSignedPeerIds((List<String>serverSignature.get("group_peer_ids")));
        return signature;
     }
   }catch(Exception e){}
   return null;
  }
}
```

最后， 在Session第一次打开时，设置SignatureFactory:

```java
Session session = SessionManager.getInstance(selfId);
session.setSignatureFactory(new KeepAliveSignatureFactory());
session.open();
```

##聊天记录查询

聊天记录的查询的基本方法跟 AVQuery 类似但是略有不同。
针对 Session 的聊天记录和聊天室 Group 的聊天记录查询略有不同，但是基本都是一样：

```java
//查询 Session 里的聊天记录
SessionManager sm = SessionManager.getInstance(selfId);
AVHistroyMessageQuery sessionHistoryQuery = sm.getHistroyMessageQuery();
sessionHistoryQuery.setLimit(1000);//设置查询结果大小
//查询 unix 时间戳 1413184345686 之后的消息，单位毫秒
sessionHistoryQuery.setTimestamp(1413184345686);
sessionHistoryQuery.findInBackground(new HistoryMessageCallback() {

  @Override
  public void done(List<AVHistoryMessage> messages, AVException error) {
         //messages 即是历史消息记录
  }
});

//查询群组里的聊天记录
Group group = sm.getGroup("140a534fd092809500e6d651e73400c7");
//获取AVHistoryMessageQuery对象来查询聊天室的聊天记录
AVHistroyMessageQuery groupHistoryQuery = group.getHistoryMessageQuery();
groupHistoryQuery.findInBackground(new HistoryMessageCallback(){
    @Override
    public void done(List<AVHistoryMessage> messages,AVException error){
      // messages 就是群组聊天记录
});
```

从实用角度，**我们推荐您对聊天记录做本地缓存，每次实时去查询聊天记录是更为低效的方式**
