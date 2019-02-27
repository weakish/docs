{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

# 安全与签名、黑名单和权限管理、实现单点登录与多端同步的方法

## 本章导读

在前一章[更多消息收发的需求，开放聊天室以及内容实时过滤](realtime-guide-intermediate.html)中，我们演示了与消息相关的更多特殊需求的实现方法，以及直播聊天室和实时消息过滤的功能，现在，我们会更进一步，从系统安全的角度，给大家详细说明：

- 如何通过第三方鉴权来控制客户端登录与操作
- 如何对成员权限进行限制，以保证聊天流程能被运营人员很好管理起来
- 如何支持用户在多个设备同时登录，并保证消息同步

## 安全与签名

LeanCloud 即时通讯服务有一大特色就是让应用账户系统和聊天服务解耦，终端用户只需要登录应用账户系统就可以直接使用即时通讯服务，同时从系统安全角度出发，我们还提供了第三方操作签名的机制来保证聊天通道的安全性。

该机制的工作架构是，在客户端和即时通讯云端之间，增加应用自己的鉴权服务器（也即即时通讯服务之外的「第三方」），在客户端开始一些有安全风险的操作命令（如登录聊天服务、建立对话、加入群组、邀请他人等）之前，先通过鉴权服务器获取签名，之后即时通讯云端会依据它和第三方鉴权服务之间的协议来验证该签名，只有附带有效签名的请求才会被执行，非法请求全部会被阻止下来。

使用操作签名可以保证聊天通道的安全，这一功能默认是关闭的，可以在 [控制台 > 消息 > 实时消息 > 设置 > 实时消息选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中进行开启：

- **登录启用签名认证**，用于控制所有的用户登录
- **对话操作启用签名认证**，用于控制新建或加入对话、邀请/踢出对话成员等操作
- **聊天记录查询启用签名认证**，用于控制聊天记录查询操作
- **黑名单操作启用签名认证**，用于控制修改对话的黑名单用户列表操作（关于黑名单，请参考下一节）

开发者可根据实际需要进行选择。一般来说，**登录认证** 能够满足大部分安全需求，而且我们也强烈建议开发者开启登录认证。

![image](images/leanmessage_signature2.png)

1. 客户端进行登录或新建对话等操作，SDK 会调用 SignatureFactory 的实现，并携带用户信息和用户行为（登录、新建对话或群组操作）请求签名；
2. 应用自有的权限系统，或应用在 LeanCloud 云引擎上的签名程序收到请求，进行权限验证，如果通过则利用下文所述的 [签名算法](#用户登录的签名) 生成时间戳、随机字符串和签名返回给客户端；
3. 客户端获得签名后，编码到请求中，发给 LeanCloud 即时通讯服务器；
4. 即时通讯服务器对请求的内容和签名做一遍验证，确认这个操作是被应用服务器允许的，进而执行后续的实际操作。

签名采用 **Hmac-sha1** 算法，输出字节流的十六进制字符串（hex dump）。针对不同的请求，开发者需要拼装不同组合的字符串，加上 UTC timestamp 以及随机字符串作为签名的消息。
对于使用 AVUser 的应用，可使用 REST API [获取 Client 登录签名](./realtime_rest_api_v2.html#获取登录签名) 进行登录认证。

### 签名格式说明

下面我们详细说明一下不同操作的签名格式。

#### 用户登录的签名

签名的消息格式如下，注意 `clientid` 与 `timestamp` 之间是<u>两个冒号</u>：

```
appid:clientid::timestamp:nonce
```

参数|说明<a name="signature-param-table"></a><!--2015-09-04 -->
---|---
appid|应用的 id
clientid|登录时使用的 clientId
timestamp|当前的 UTC 时间距离 unix epoch 的**毫秒数**
nonce|随机字符串

>注意：签名的 key **必须** 是应用的 master key，你可以 [控制台 > 设置 > 应用 Key](/app.html?appid={{appid}}#/key) 里找到。**请保护好 master key，不要泄露给任何无关人员。**

开发者可以实现自己的 SignatureFactory，调用远程服务器的签名接口获得签名。如果你没有自己的服务器，可以直接在 LeanCloud 云引擎上通过 **网站托管** 来实现自己的签名接口。在移动应用中直接做签名的作法 **非常危险**，它可能导致你的 **master key** 泄漏。

#### 开启对话签名

新建一个对话的时候，签名的消息格式为：

```
appid:clientid:sorted_member_ids:timestamp:nonce
```

* appid、clientid、timestamp 和 nonce 的含义 [同上](#signature-param-table)。
* sorted_member_ids 是以半角冒号（:）分隔、**升序排序** 的 user id，即邀请参与该对话的成员列表。

#### 群组功能的签名

在群组功能中，我们对**加群**、**邀请**和**踢出群**这三个动作也允许加入签名，签名格式是：

```
appid:clientid:convid:sorted_member_ids:timestamp:nonce:action
```

* appid、clientid、sorted_member_ids、timestamp 和 nonce  的含义同上。对创建群的情况，这里 sorted_member_ids 是空字符串。
* convid - 此次行为关联的对话 id。
* action - 此次行为的动作，**invite** 表示加群和邀请，**kick** 表示踢出群。

#### 查询聊天记录的签名

```
appid:client_id:convid:nonce:signature_ts
```
* client_id 查看者 id（签名参数）
* nonce  签名随机字符串（签名参数）
* signature_ts 签名时间戳（签名参数），单位是秒
* signature  签名（签名参数）

#### 黑名单的签名

由于黑名单有两种情况，所以签名格式也有两种：

1. client 对 conversation
  ```
  appid:clientid:convid::timestamp:nonce:action
  ```
  - action - 此次行为的动作，client-block-conversations 表示添加黑名单，client-unblock-conversations 表示取消黑名单
  
2. conversation 对 client
  ```
  appid:clientid:convid:sorted_member_ids:timestamp:nonce:action
  ```
  - action - 此次行为的动作，conversation-block-clients 表示添加黑名单，conversation-unblock-clients 表示取消黑名单
  - sorted_member_ids 同上

{{ im.signature("#### 测试签名") }}

### 云引擎签名范例

为了帮助开发者理解云端签名的算法，我们开源了一个用 Node.js + 云引擎实现签名的云端，供开发者学习和使用：[LeanCloud 即时通讯云引擎签名 Demo](https://github.com/leancloud/realtime-messaging-signature-cloudcode)。

### 客户端如何支持操作签名

上面的签名算法，都是对第三方鉴权服务器如何进行签名的协议说明，在开启了操作签名的前提下，客户端这边的使用流程需要进行相应的改变，增加请求签名的环节，才能让整套机制顺利运行起来。

LeanCloud 即时通讯 SDK 为每一个 AVIMClient 实例都预留了一个 Signature 工厂接口，这个接口默认不设置就表示不使用签名，启动签名的时候，只需要在客户端实现这一接口，调用远程服务器的签名接口获得签名，并把它绑定到 AVIMClient 实例上即可：

```js
// 基于 LeanCloud 云引擎进行登录签名的 signature 工厂方法
var signatureFactory = function(clientId) {
  return AV.Cloud.rpc('sign', { clientId: clientId }); // AV.Cloud.rpc returns a Promise
};
// 基于 LeanCloud 云引擎进行对话创建/加入、邀请成员、踢出成员等操作签名的 signature 工厂方法
var conversationSignatureFactory = function(conversationId, clientId, targetIds, action) {
  return AV.Cloud.rpc('sign-conversation', {
    conversationId: conversationId,
    clientId: clientId,
    targetIds: targetIds,
    action: action,
  });
};
// 基于 LeanCloud 云引擎进行对话黑名单操作签名的 signature 工厂方法
var blacklistSignatureFactory = function(conversationId, clientId, targetIds, action) {
  return AV.Cloud.rpc('sign-blacklist', {
    conversationId: conversationId,
    clientId: clientId,
    targetIds: targetIds,
    action: action,
  });
};

realtime.createIMClient('Tom', {
  signatureFactory: signatureFactory,
  conversationSignatureFactory: conversationSignatureFactory,
  blacklistSignatureFactory: blacklistSignatureFactory
}).then(function(tom) {
  console.log('Tom 登录');
}).catch(function(error) {
  // 如果 signatureFactory 抛出了异常，或者签名没有验证通过，会在这里被捕获
});
```
```objc
// AVIMSignatureDataSource 接口的主要方法
/*!
 对一个操作进行签名. 注意:本调用会在后台线程被执行
 @param clientId - 操作发起人的 id
 @param conversationId － 操作所属对话的 id
 @param action － @see AVIMSignatureAction
 @param clientIds － 操作目标的 id 列表
 @return 一个 AVIMSignature 签名对象.
 */
- (AVIMSignature *)signatureWithClientId:(NSString *)clientId
                          conversationId:(NSString * _Nullable)conversationId
                                  action:(AVIMSignatureAction)action
                       actionOnClientIds:(NSArray<NSString *> * _Nullable)clientIds;


// 客户端只需要实现 AVIMSignatureDataSource 协议接口，并绑定到 AVIMClient 实例即可。
AVIMClient *imClient = [[AVIMClient alloc] initWithClientId:@"Tom"];
imClient.delegate = self;
imClient.signatureDataSource = signatureDelegate;
```
```java
// 这是一个依赖云引擎完成签名的示例
public class KeepAliveSignatureFactory implements SignatureFactory {
 @Override
 public Signature createSignature(String peerId, List<String> watchIds) throws SignatureException {
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
       return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
 }

  @Override
  public Signature createConversationSignature(String convId, String peerId,
                                               List<String> targetPeerIds,String action) throws SignatureException{
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("client_id",peerId);
   params.put("conv_id",convId);
   params.put("members",targetPeerIds);
   params.put("action",action);

   try{
     Object result = AVCloud.callFunction("sign2",params);
     if(result instanceof Map){
        Map<String,Object> serverSignature = (Map<String,Object>) result;
        Signature signature = new Signature();
        signature.setSignature((String)serverSignature.get("signature"));
        signature.setTimestamp((Long)serverSignature.get("timestamp"));
        signature.setNonce((String)serverSignature.get("nonce"));
        return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
  }

  @Override
  public Signature createBlacklistSignature(String clientId, String conversationId, List<String> memberIds,
                                            String action) throws SignatureException {
    Map<String,Object> params = new HashMap<String,Object>();
    params.put("client_id",clientId);
    params.put("conv_id",conversationId);
    params.put("members",memberIds);
    params.put("action",action);

    try{
      Object result = AVCloud.callFunction("sign3",params);
      if(result instanceof Map){
         Map<String,Object> serverSignature = (Map<String,Object>) result;
         Signature signature = new Signature();
         signature.setSignature((String)serverSignature.get("signature"));
         signature.setTimestamp((Long)serverSignature.get("timestamp"));
         signature.setNonce((String)serverSignature.get("nonce"));
         return signature;
      }
    }catch(AVException e){
      throw (SignatureFactory.SignatureException) e;
    }
    return null;
  }
}

// 将签名工厂类的实例绑定到 AVIMClient 上
AVIMClient.setSignatureFactory(new KeepAliveSignatureFactory());
```
```cs
// 基于云引擎完成签名的 ISignatureFactory 接口实现
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

// 即时通讯服务初始化的时候，设置这一签名工厂的实例。
var config = new AVRealtime.Configuration()
{
    ApplicationId = "",
    ApplicationKey = "",
    SignatureFactory = new LeanEngineSignatureFactory()
};
var realtime = new AVRealtime(config);
```

{{ docs.alert("需要强调的是：开发者切勿在客户端直接使用 MasterKey 进行签名操作，因为 MaterKey 一旦泄露，会造成应用的数据处于高危状态，后果不容小视。因此，强烈建议开发者将签名的具体代码托管在安全性高稳定性好的云端服务器上（例如 LeanCloud 云引擎）。") }}

## 权限管理与黑名单

第三方鉴权是一种服务端对全局进行控制的机制，具体到单个对话的群组，例如开放聊天室，出于产品运营的需求，我们还需要对成员权限进行区分，以及允许管理员来限时/永久屏蔽部分用户。下面我们详细说明一下这样的需求该如何实现。

### 设置成员权限

「成员权限」是指将对话内成员划分成不同角色，实现类似 QQ 群管理员的效果。使用这个功能需要在控制台 即时通讯-设置 中开启「对话成员属性功能（成员角色管理功能）」。

目前系统内的角色与功能对应关系：

| 角色 | 功能列表 |
| ---------|--------- |
| Owner | 永久性禁言、踢人、加人、拉黑、更新他人权限 |
| Manager | 永久性禁言、踢人、加人、拉黑、更新他人权限 |
| Member | 加人 |

一个对话的 `Owner` 是不可变更的，我们 SDK 允许一个终端用户在 `Manager` 和 `Member` 之间切换角色，示例代码如下：

```js
```
```objc
```
```java
```
```cs
```

### 黑名单

「黑名单」功能可以实现类似微信「屏蔽」的效果，目前分为两大类

- 对话 --> 成员，是指为某个对话设置的黑名单，禁止名单中的用户加入该对话。
- 成员 --> 对话，是指某个用户自己设置的对话黑名单，表示禁止其他人把自己拉入这些对话，实现类似于「永久退群」的效果。

使用这个功能需要在控制台 即时通讯-设置 中开启「黑名单功能」。

SDK 操作黑名单的示例代码为：

```js
```
```objc
```
```java
```
```cs
```

## 多端消息同步与单点登录

一个用户可以使用相同的账号在不同的客户端上登录（例如网页版和手机客户端可以同时接收到消息和回复消息，实现多端消息同步），而有一些场景下，需要禁止一个用户同时在不同客户端登录（单点登录），而即时通讯服务也提供了这样的接口，来应对不同的需求：

下面我们来详细说明：如何使用 LeanCloud SDK 去实现单点登录

### 设置登录标记 Tag

假设开发者想实现 QQ 这样的功能，那么需要在登录到云端的时候，也就是打开与云端长连接的时候，标记一下这个链接是从什么类型的客户端登录到云端的：

```js
realtime.createIMClient('Tom', { tag: 'Mobile' }).then(function(tom) {
  console.log('Tom 登录');
});
```
```objc
AVIMClient *currentClient = [[AVIMClient alloc] initWithClientId:@"Tom" tag:@"Mobile"];
[currentClient openWithCallback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        // 与云端建立连接成功
    }
}];
```
```java
// 第二个参数：登录标记 Tag
AVIMClient currentClient = AVIMClient.getInstance(clientId,"Mobile");
currentClient.open(new AVIMClientCallback() {
  @Override
  public void done(AVIMClient avimClient, AVIMException e) {
    if(e == null){
      // 与云端建立连接成功
    }
  }
});
```
```cs
AVIMClient tom = await realtime.CreateClientAsync("Tom", tag: "Mobile", deviceId: "your-device-id");
```

上述代码可以理解为 LeanCloud 版 QQ 的登录，而另一个带有同样 Tag 的客户端打开连接，则较早前登录系统的客户端会被强制下线。

### 处理登录冲突

我们可以看到上述代码中，登录的 Tag 是 `Mobile`。当存在与其相同的 Tag 登录的客户端，较早前登录的设备会被云端强行下线，而且他会收到被云端下线的通知：

```js
var { Event } = require('leancloud-realtime');
tom.on(Event.CONFLICT, function() {
  // 弹出提示，告知当前用户的 Client Id 在其他设备上登陆了
});
```
```objc
-(void)client:(AVIMClient *)client didOfflineWithError:(NSError *)error{
    if ([error code]  == 4111) {
        //适当的弹出友好提示，告知当前用户的 Client Id 在其他设备上登陆了
    }
};
```
```java
public class MyApplication extends Application{
  public void onCreate(){
   ...
   AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
   // 自定义实现的 AVIMClientEventHandler 需要注册到 SDK 后，SDK 才会通过回调 onClientOffline 来通知开发者
   AVIMClient.setClientEventHandler(new AVImClientManager());
   ...
  }
}

public class AVImClientManager extends AVIMClientEventHandler {
  ...
  @Override
  public void onClientOffline(AVIMClient avimClient, int i) {
    if(i == 4111){
      // 适当地弹出友好提示，告知当前用户的 Client Id 在其他设备上登陆了
    }
  }
  ...
}
```
```cs
tom.OnSessionClosed += Tom_OnSessionClosed;
private void Tom_OnSessionClosed(object sender, AVIMSessionClosedEventArgs e)
{
}
```

如上述代码中，被动下线的时候，云端会告知原因，因此客户端在做展现的时候也可以做出类似于 QQ 一样友好的通知。

> 如果不设置 Tag，则默认允许用户可以多端登录，并且消息会实时同步。

{{ docs.relatedLinks("进一步阅读",[
  { title: "详解消息 Hook 与系统对话的使用", href: "/realtime-guide-systemconv.html"}])
}}
