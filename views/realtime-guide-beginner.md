{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 一，从简单的单聊、群聊、收发图文消息开始

## 本章导读

在很多产品里面，都存在让用户实时沟通的需求，例如：

- 员工与客户之间的实时交流，如房地产行业经纪人与客户的沟通，商业产品客服与客户的沟通，等等。
- 企业内部沟通协作，如内部的工作流系统、文档/知识库系统，增加实时互动的方式可能就会让工作效率得到极大提升。
- 直播互动，不论是文体行业的大型电视节目中的观众互动、重大赛事直播，娱乐行业的游戏现场直播、网红直播，还是教育行业的在线课程直播、KOL 知识分享，在支持超大规模用户积极参与的同时，也需要做好内容审核管理。
- 应用内社交，游戏公会嗨聊，等等。社交产品要能长时间吸引住用户，除了实时性之外，还需要更多的创新玩法，对于标准化通讯服务会存在更多的功能扩展需求。

根据功能需求的层次性和技术实现的难易程度不同，我们分为多篇文档来一步步地讲解如何利用 LeanCloud 即时通讯服务实现不同业务场景需求：

- 本篇文档，我们会从实现简单的单聊/群聊开始，演示创建和加入「对话」、发送和接收富媒体「消息」的流程，同时让大家了解历史消息云端保存与拉取的机制，希望可以满足在成熟产品中快速集成一个简单的聊天页面的需求。
- [第二篇文档](realtime-guide-intermediate.html)，我们会介绍一些特殊消息的处理，例如 @ 成员提醒、撤回和修改、消息送达和被阅读的回执通知等，离线状态下的推送通知和消息同步机制，多设备登录的支持方案，以及如何扩展自定义消息类型，希望可以满足一个社交类产品的多方面需求。
- [第三篇文档](realtime-guide-senior.html)，我们会介绍一下系统的安全机制，包括第三方的操作签名，以及「对话」成员的权限管理和黑名单机制，同时也会介绍直播聊天室和临时对话的用法，希望可以帮助开发者提升产品的安全性和易用性，并满足特殊场景的需求。
- [第四篇文档](realtime-guide-systemconv.html)，我们会介绍即时通讯服务端 Hook 机制，系统对话的用法，以及给出一个基于这两个功能打造一个属于自己的聊天机器人的方案，希望可以满足业务层多种多样的扩展需求。

希望开发者最终顺利完成产品开发的同时，也对即时通讯服务的体系结构有一个清晰的了解，以便于产品的长期维护和定制化扩展。

> 阅读准备
>
> 在阅读本章之前，如果您还不太了解 LeanCloud 即时通讯服务的总体架构，建议先阅读 [即时通讯服务总览](realtime_v2.html)。另外，如果您还没有下载对应开发环境（语言）的 SDK，请参考 [SDK 安装指南](start.html) 完成 SDK 安装与初始化。

## 一对一单聊

在开始讨论聊天之前，我们需要介绍一下在即时通讯 SDK 中的 `IMClient` 对象：

> `IMClient` 对应实体的是一个用户，它代表着一个用户以客户端的身份登录到了即时通讯的系统。

具体可以参考 [服务总览中的说明](realtime_v2.html#clientId、用户和登录)。

### 创建 `IMClient`

假设我们产品中有一个叫「Tom」的用户，首先我们在 SDK 中创建出一个与之对应的 `IMClient` 实例：

```js
// Tom 用自己的名字作为 clientId 来登录即时通讯服务
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
```
```swift
do {
    let tom = try IMClient(ID: "Tom")
} catch {
    print(error)
}
```
```objc
@property (nonatomic, strong) AVIMClient *tom;
// clientId 为 Tom
tom = [[AVIMClient alloc] initWithClientId:@"Tom"]
```
```java
// clientId 为 Tom
AVIMClient tom = AVIMClient.getInstance("Tom");
```
```cs
var realtime = new AVRealtime('your-app-id','your-app-key');
var tom = await realtime.CreateClientAsync('Tom');
```

注意这里一个 `IMClient` 实例就代表一个终端用户，我们需要把它全局保存起来，因为后续该用户在即时通讯上的所有操作都需要直接或者间接使用这个实例。

### 登录即时通讯服务器

创建好了「Tom」这个用户对应的 `IMClient` 实例之后，我们接下来需要让该实例「登录」LeanCloud 即时通讯服务器。只有登录成功之后客户端才能开始与其他用户聊天，也才能接收到 LeanCloud 云端下发的各种事件通知。

这里需要说明一点，JavaScript 和 C#（Unity3D）SDK 在创建 `IMClient` 实例的同时会自动进行登录，而 iOS（包括 Objective-C 和 Swift）和 Android（包括通用的 Java）SDK 则需要调用开发者手动执行 `open` 方法进行登录：

```js
// Tom 用自己的名字作为 clientId 登录，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
```
```swift
do {
    let tom = try IMClient(ID: "Tom")
    tom.open { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
// Tom 创建了一个 client，用自己的名字作为 clientId
AVIMClient *tom = [[AVIMClient alloc] initWithClientId:@"Tom"];
// Tom 登录
[tom openWithCallback:^(BOOL succeeded, NSError *error) {
  if(succeeded) {
    // 成功打开连接
  }
}];
```
```java
// Tom 创建了一个 client，用自己的名字作为 clientId 登录
AVIMClient tom = AVIMClient.getInstance("Tom");
// Tom 登录
tom.open(new AVIMClientCallback() {
  @Override
  public void done(AVIMClient client, AVIMException e) {
    if (e == null) {
      // 成功打开连接
    }
  }
}
```
```cs
var realtime = new AVRealtime('your-app-id','your-app-key');
var tom = await realtime.CreateClientAsync('Tom');
```

### 使用 `_User` 登录

除了应用层指定 `clientId` 登录之外，我们也支持直接使用 `_User` 对象来创建 `IMClient` 并登录。这种方式能直接利用云端内置的用户鉴权系统而省掉 [登录签名](realtime-guide-senior.html#用户登录签名) 操作，更方便地将存储和即时通讯这两个模块结合起来使用。示例代码如下：

```js
var AV = require('leancloud-storage');
// 以 AVUser 的用户名和密码登录即时通讯服务
AV.User.logIn('username', 'password').then(function(user) {
  return realtime.createIMClient(user);
}).catch(console.error.bind(console));
```
```swift
_ = LCUser.logIn(username: "username", password: "password") { (result) in
    switch result {
    case .success(object: let user):
        do {
            let client = try IMClient(user: user)
            client.open(completion: { (result) in
                // 执行其他逻辑
            })
        } catch {
            print(error)
        }
    case .failure(error: let error):
        print(error)
    }
}
```
```objc
// 以 AVUser 的用户名和密码登录到 LeanCloud 云端
[AVUser logInWithUsernameInBackground:username password:password block:^(AVUser * _Nullable user, NSError * _Nullable error) {
    // 以 AVUser 实例创建了一个 client
    AVIMClient *client = [[AVIMClient alloc] initWithUser:user];
    // 打开 client，与云端进行连接
    [client openWithCallback:^(BOOL succeeded, NSError * _Nullable error) {
        // 执行其他逻辑
    }];
}];
```
```java
// 以 AVUser 的用户名和密码登录到 LeanCloud 存储服务
AVUser.logIn("Tom", "cat!@#123").subscribe(new Observer<AVUser>() {
    public void onSubscribe(Disposable disposable) {}
    public void onNext(AVUser user) {
        // 登录成功，与服务器连接
        AVIMClient client = AVIMClient.getInstance(user);
        client.open(new AVIMClientCallback() {
            @Override
            public void done(final AVIMClient avimClient, AVIMException e) {
                // 执行其他逻辑
            }
        });
    }
    public void onError(Throwable throwable) {
        // 登录失败（可能是密码错误）
    }
    public void onComplete() {}
});
```
```cs
// 暂不支持
```

### 创建对话 `Conversation`

用户登录之后，要开始与其他人聊天，需要先创建一个「对话」。

> [对话（`Conversation`）](realtime_v2.html#对话（Conversation）)是消息的载体，所有消息都是发送给对话，即时通讯服务端会把消息下发给所有在对话中的成员。

Tom 完成了登录之后，就可以选择用户聊天了。现在他要给 Jerry 发送消息，所以需要先创建一个只有他们两个成员的 `Conversation`：

```js
// 创建与 Jerry 之间的对话
tom.createConversation({ // tom 是一个 IMClient 实例
  // 指定对话的成员除了当前用户 Tom（SDK 会默认把当前用户当做对话成员）之外，还有 Jerry
  members: ['Jerry'],
  // 对话名称
  name: 'Tom & Jerry',
  unique: true
}).then(/* 略 */);
```
```swift
do {
    try tom.createConversation(clientIDs: ["Jerry"], name: "Tom & Jerry", isUnique: true, completion: { (result) in
        switch result {
        case .success(value: let conversation):
            print(conversation)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
// 创建与 Jerry 之间的对话
[tom createConversationWithName:@"Tom & Jerry" clientIds:@[@"Jerry"] attributes:nil options:AVIMConversationOptionUnique
                       callback:^(AVIMConversation *conversation, NSError *error) {

}];
```
```java
tom.createConversation(Arrays.asList("Jerry"), "Tom & Jerry", null, false, true,
    new AVIMConversationCreatedCallback() {
        @Override
        public void done(AVIMConversation conversation, AVIMException e) {
          if(e == null) {
            // 创建成功
          }
        }
});
```
```cs
var tom = await realtime.CreateClientAsync('Tom');
var conversation = await tom.CreateConversationAsync("Jerry", name:"Tom & Jerry", isUnique:true);
```

`createConversation` 这个接口会直接创建一个对话，并且该对话会被存储在 `_Conversation` 表内，可以打开 **控制台 > 存储 > 数据** 查看数据。不同 SDK 提供的创建对话接口如下：

```js
/**
 * 创建一个对话
 * @param {Object} options 除了下列字段外的其他字段将被视为对话的自定义属性
 * @param {String[]} options.members 对话的初始成员列表，必要参数，默认包含当前 client
 * @param {String} [options.name] 对话的名字，可选参数，如果不传默认值为 null
 * @param {Boolean} [options.transient=false] 是否为聊天室，可选参数
 * @param {Boolean} [options.unique=false] 是否唯一对话，当其为 true 时，如果当前已经有相同成员的对话存在则返回该对话，否则会创建新的对话
 * @param {Boolean} [options.tempConv=false] 是否为临时对话，可选参数
 * @param {Integer} [options.tempConvTTL=0] 可选参数，如果 tempConv 为 true，这里可以指定临时对话的生命周期。
 * @return {Promise.<Conversation>}
 */
async createConversation({
  members: m,
  name,
  transient,
  unique,
  tempConv,
  tempConvTTL,
  // 可添加更多属性
});
```
```swift
/// Create a Normal Conversation. Default is a Unique Conversation.
///
/// - Parameters:
///   - clientIDs: The set of client ID. it's the members of the conversation which will be created. the initialized members always contains current client's ID. if the created conversation is unique, and server has one unique conversation with the same members, that unique conversation will be returned.
///   - name: The name of the conversation.
///   - attributes: The attributes of the conversation.
///   - isUnique: True means create or get a unique conversation, default is true.
///   - completion: callback.
public func createConversation(clientIDs: Set<String>, name: String? = nil, attributes: [String : Any]? = nil, isUnique: Bool = true, completion: @escaping (LCGenericResult<IMConversation>) -> Void) throws

/// Create a Chat Room.
///
/// - Parameters:
///   - name: The name of the chat room.
///   - attributes: The attributes of the chat room.
///   - completion: callback.
public func createChatRoom(name: String? = nil, attributes: [String : Any]? = nil, completion: @escaping (LCGenericResult<IMChatRoom>) -> Void) throws

/// Create a Temporary Conversation. Temporary Conversation is unique in it's Life Cycle.
///
/// - Parameters:
///   - clientIDs: The set of client ID. it's the members of the conversation which will be created. the initialized members always contains this client's ID.
///   - timeToLive: The time interval for the life of the temporary conversation.
///   - completion: callback.
public func createTemporaryConversation(clientIDs: Set<String>, timeToLive: Int32, completion: @escaping (LCGenericResult<IMTemporaryConversation>) -> Void) throws
```
```objc
/*!
 创建一个新的用户对话。
 在单聊的场合，传入对方一个 clientId 即可；群聊的时候，支持同时传入多个 clientId 列表
 @param name - 会话名称。
 @param clientIds - 聊天参与者（发起人除外）的 clientId 列表。
 @param callback － 对话建立之后的回调
 */
- (void)createConversationWithName:(NSString * _Nullable)name
                         clientIds:(NSArray<NSString *> *)clientIds
                          callback:(void (^)(AVIMConversation * _Nullable conversation, NSError * _Nullable error))callback;
/*!
 创建一个新的用户对话。
 在单聊的场合，传入对方一个 clientId 即可；群聊的时候，支持同时传入多个 clientId 列表
 @param name - 会话名称。
 @param clientIds - 聊天参与者（发起人除外）的 clientId 列表。
 @param attributes - 会话的自定义属性。
 @param options － 可选参数，可以使用或 “|” 操作表示多个选项
 @param callback － 对话建立之后的回调
 */
- (void)createConversationWithName:(NSString * _Nullable)name
                         clientIds:(NSArray<NSString *> *)clientIds
                        attributes:(NSDictionary * _Nullable)attributes
                           options:(AVIMConversationOption)options
                          callback:(void (^)(AVIMConversation * _Nullable conversation, NSError * _Nullable error))callback;

```
```java
/**
 * 创建或查询一个已有 conversation
 *
 * @param members 对话的成员
 * @param name 对话的名字
 * @param attributes 对话的额外属性
 * @param isTransient 是否是聊天室
 * @param isUnique 如果已经存在符合条件的会话，是否返回已有回话
 *                 为 false 时，则一直为创建新的回话
 *                 为 true 时，则先查询，如果已有符合条件的回话，则返回已有的，否则，创建新的并返回
 *                 为 true 时，仅 members 为有效查询条件
 * @param callback 结果回调函数
 */
public void createConversation(final List<String> members, final String name,
    final Map<String, Object> attributes, final boolean isTransient, final boolean isUnique,
    final AVIMConversationCreatedCallback callback);
/**
 * 创建一个聊天对话
 *
 * @param members 对话参与者
 * @param attributes 对话的额外属性
 * @param isTransient 是否为聊天室
 * @param callback  结果回调函数
 */
public void createConversation(final List<String> members, final String name,
                               final Map<String, Object> attributes, final boolean isTransient,
                               final AVIMConversationCreatedCallback callback);
/**
 * 创建一个聊天对话
 *
 * @param conversationMembers 对话参与者
 * @param name       对话名称
 * @param attributes 对话属性
 * @param callback   结果回调函数
 * @since 3.0
 */
public void createConversation(final List<String> conversationMembers, String name,
    final Map<String, Object> attributes, final AVIMConversationCreatedCallback callback);
/**
 * 创建一个聊天对话
 * 
 * @param conversationMembers 对话参与者
 * @param attributes 对话属性
 * @param callback   结果回调函数
 * @since 3.0
 */
public void createConversation(final List<String> conversationMembers,
    final Map<String, Object> attributes, final AVIMConversationCreatedCallback callback);
```
```cs
/// <summary>
/// 创建与目标成员的对话
/// </summary>
/// <returns>返回对话实例</returns>
/// <param name="member">目标成员</param>
/// <param name="members">目标成员列表</param>
/// <param name="name">对话名称</param>
/// <param name="isSystem">是否是系统对话。注意：在客户端无法创建系统对话，所以这里设置为 true 会导致创建失败。</param>
/// <param name="isTransient">是否为聊天室</param>
/// <param name="isUnique">是否是唯一对话</param>
/// <param name="options">自定义属性</param>
public Task<AVIMConversation> CreateConversationAsync(string member = null,
    IEnumerable<string> members = null,
    string name = "",
    bool isSystem = false,
    bool isTransient = false,
    bool isUnique = true,
    IDictionary<string, object> options = null);
```

虽然不同语言/平台接口声明有所不同，但是支持的参数是基本一致的。在创建一个对话的时候，我们主要可以指定：

1. `members`：必要参数，包含对话的初始成员列表，请注意当前用户作为对话的创建者，是默认包含在成员里面的，所以 `members` 数组中可以不包含当前用户的 `clientId`。
2. `name`：对话名字，可选参数，上面代码指定为了「Tom & Jerry」。
3. `attributes`：对话的自定义属性，可选。上面示例代码没有指定额外属性，开发者如果指定了额外属性的话，以后其他成员可以通过 `AVIMConversation` 的接口获取到这些属性值。附加属性在 `_Conversation` 表中被保存在 `attr` 列中。
4. `unique`/`isUnique` 或者是 `AVIMConversationOptionUnique`：唯一对话标志位，可选。
   - 如果设置为唯一对话，云端会根据完整的成员列表先进行一次查询，如果已经有正好包含这些成员的对话存在，那么就返回已经存在的对话，否则才创建一个新的对话。
   - 如果指定 `unique` 标志为假，那么每次调用 `createConversation` 接口都会创建一个新的对话。
   - 未指定 `unique` 时，JavaScript、Java、Swift、C# SDK 默认值为真，Objective-C、Python SDK 默认值为假（出于兼容性考虑）。  
   - 从通用的聊天场景来看，不管是 Tom 发出「创建和 Jerry 单聊对话」的请求，还是 Jerry 发出「创建和 Tom 单聊对话」的请求，或者 Tom 以后再次发出创建和 Jerry 单聊对话的请求，都应该是同一个对话才是合理的，否则可能因为聊天记录的不同导致用户混乱。所以我们 ***建议开发者明确指定 `unique` 标志为 `true`***。
5. 对话类型的其他标志，可选参数，例如 `transient`/`isTransient` 表示「聊天室」，`tempConv`/`tempConvTTL` 和 `AVIMConversationOptionTemporary` 用来创建「临时对话」等等。什么都不指定就表示创建普通对话，对于这些标志位的含义我们先不管，以后会有说明。

创建对话之后，可以获取对话的内置属性，云端会为每一个对话生成一个全局唯一的 ID 属性：`Conversation.id`，它是其他用户查询对话时常用的匹配字段。

### 发送消息

对话已经创建成功了，接下来 Tom 可以在这个对话中发出第一条文本消息了：

```js
var { TextMessage } = require('leancloud-realtime');
conversation.send(new TextMessage('Jerry，起床了！')).then(function(message) {
  console.log('Tom & Jerry', '发送成功！');
}).catch(console.error);
```
```swift
do {
    let textMessage = IMTextMessage(text: "Jerry，起床了！")
    try conversation.send(message: textMessage) { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
AVIMTextMessage *message = [AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
  if (succeeded) {
    NSLog(@"发送成功！");
  }
}];
```
```java
AVIMTextMessage msg = new AVIMTextMessage();
msg.setText("Jerry，起床了！");
// 发送消息
conversation.sendMessage(msg, new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {
    if (e == null) {
      Log.d("Tom & Jerry", "发送成功！");
    }
  }
});
```
```cs
var textMessage = new AVIMTextMessage("Jerry，起床了！");
await conversation.SendMessageAsync(textMessage);
```

`Conversation#send` 接口实现的功能就是向对话中发送一条消息，同一对话中其他在线成员会立刻收到此消息。

现在 Tom 发出了消息，那么接收者 Jerry 他要在界面上展示出来这一条新消息，该怎么来处理呢？

### 接收消息

在另一个设备上，我们用 `Jerry` 作为 `clientId` 来创建一个 `AVIMClient` 并登录即时通讯服务（与前两节 Tom 的处理流程一样）：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
}).catch(console.error);
```
```swift
do {
    let jerry = try IMClient(ID: "Jerry")
    jerry.open { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
jerry = [[AVIMClient alloc] initWithClientId:@"Jerry"];
[jerry openWithCallback:^(BOOL succeeded, NSError *error) {

}];
```
```java
// Jerry 登录
AVIMClient jerry = AVIMClient.getInstance("Jerry");
jerry.open(new AVIMClientCallback(){
  @Override
  public void done(AVIMClient client,AVIMException e){
    if(e==null){
      // 登录成功后的逻辑
    }
  }
});
```
```cs
var realtime = new AVRealtime('your-app-id','your-app-key');
var jerry = await realtime.CreateClientAsync('Jerry');
```

Jerry 作为消息的被动接收方，他不需要主动创建与 Tom 的对话，可能也无法知道 Tom 创建好的对话信息，Jerry 端需要通过设置即时通讯客户端事件的回调函数，才能获取到 Tom 那边操作的通知。

即时通讯客户端事件回调能处理多种服务端通知，这里我们先关注这里会出现的两个事件：
- 用户被邀请进入某个对话的通知事件。Tom 在创建和 Jerry 的单聊对话的时候，Jerry 这边就能立刻收到一条通知，获知到类似于「Tom 邀请你加入了一个对话」的信息。
- 已加入对话中新消息到达的通知。在 Tom 发出「Jerry，起床了！」这条消息之后，Jerry 这边也能立刻收到一条新消息到达的通知，通知中带有消息具体数据以及对话、发送者等上下文信息。

现在，我们看看具体应该如何响应服务端发过来的通知。Jerry 端会分别处理「加入对话」的事件通知和「新消息到达」的事件通知：

```js
// JS SDK 通过在 IMClient 实例上监听事件回调来响应服务端通知

// 当前用户被添加至某个对话
jerry.on(Event.INVITED, function invitedEventHandler(payload, conversation) {
    console.log(payload.invitedBy, conversation.id);
});

// 当前用户收到了某一条消息，可以通过响应 Event.MESSAGE 这一事件来处理。
jerry.on(Event.MESSAGE, function(message, conversation) {
    console.log('收到新消息：' + message.text);
});
```
```swift
let delegator: Delegator = Delegator()
jerry.delegate = delegator

func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case .message(event: let messageEvent):
        switch messageEvent {
        case .received(message: let message):
            print(message)
        default:
            break
        }
    default:
        break
    }
}
```
```objc
// Objective-C SDK 通过实现 AVIMClientDelegate 代理来处理服务端通知
// 不了解 Objective-C 代理（delegate）概念的读者可以参考：
// https://developer.apple.com/library/archive/documentation/General/Conceptual/CocoaEncyclopedia/DelegatesandDataSources/DelegatesandDataSources.html
jerry.delegate = delegator;

/*!
 当前用户被邀请加入对话的通知。
 @param conversation － 所属对话
 @param clientId - 邀请者的 ID
 */
-(void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"当前 clientId（Jerry）被 %@ 邀请，加入了对话",clientId]);
}

/*!
 接收到新消息（使用内置消息格式）。
 @param conversation － 所属对话
 @param message - 具体的消息
 */
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // Jerry，起床了！
}
```
```java
// Java/Android SDK 通过定制自己的对话事件 Handler 处理服务端下发的对话事件通知
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  /**
   * 实现本方法来处理当前用户被邀请到某个聊天对话事件
   *
   * @param client
   * @param conversation 被邀请的聊天对话
   * @param operator 邀请你的人
   * @since 3.0
   */
  @Override
  public void onInvited(AVIMClient client, AVIMConversation conversation, String invitedBy) {
    // 当前 clientId（Jerry）被邀请到对话，执行此处逻辑
  }
}
// 设置全局的对话事件处理 handler
AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());

// Java/Android SDK 通过定制自己的消息事件 Handler 处理服务端下发的消息通知
public static class CustomMessageHandler extends AVIMMessageHandler{
  /**
   * 重载此方法来处理接收消息
   * 
   * @param message
   * @param conversation
   * @param client
   */
   @Override
   public void onMessage(AVIMMessage message,AVIMConversation conversation,AVIMClient client){
     if(message instanceof AVIMTextMessage){
       Log.d(((AVIMTextMessage)message).getText()); // Jerry，起床了
     }
   }
 }
// 设置全局的消息处理 handler
AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
```
```cs
// SDK 通过在 IMClient 实例上监听事件回调来响应服务端通知
var jerry = await realtime.CreateClientAsync("Jerry");
jerry.OnInvited += (sender, args) =>
{
  var invitedBy = args.InvitedBy;
  var conversationId = args.ConversationId;
};

private void Jerry_OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMTextMessage)
    {
        var textMessage = (AVIMTextMessage)e.Message;
        // textMessage.ConversationId 是该条消息所属于的对话 ID
        // textMessage.TextContent 是该文本消息的文本内容
        // textMessage.FromClientId 是消息发送者的 clientId
    }
}
jerry.OnMessageReceived += Jerry_OnMessageReceived;
```

Jerry 端实现了上面两个事件通知函数之后，就顺利收到 Tom 发送的消息了。之后 Jerry 也可以回复消息给 Tom，而 Tom 端实现类似的接收流程，那么他们俩就可以开始愉快的聊天了。

我们现在可以回顾一下 Tom 和 Jerry 发送第一条消息的过程中，两方完整的处理时序：

```seq
Tom->Cloud: 1. Tom 将 Jerry 加入对话
Cloud-->Jerry: 2. 下发通知：你被邀请加入对话
Jerry-->UI: 3. 加载聊天的 UI 界面
Tom->Cloud: 4. 发送消息
Cloud-->Jerry: 5. 下发通知：接收到有新消息
Jerry-->UI: 6. 显示收到的消息内容
```

在聊天过程中，接收方除了响应新消息到达通知之外，还需要响应多种对话成员变动通知，例如「新用户 XX 被 XX 邀请加入了对话」、「用户 XX 主动退出了对话」、「用户 XX 被管理员剔除出对话」，等等。LeanCloud 云端会实时下发这些事件通知给客户端，具体细节可以参考后续章节：[成员变更的事件通知总结](#成员变更的事件通知总结)。

## 多人群聊

上面我们讨论了一对一单聊的实现流程，假设我们还需要实现一个「朋友群」的多人聊天，接下来我们就看看怎么完成这一功能。

从即时通讯云端来看，多人群聊与单聊的流程十分接近，主要差别在于对话内成员数量的多少。群聊对话支持在创建对话的时候一次性指定全部成员，也允许在创建之后通过邀请的方式来增加新的成员。

### 创建多人群聊对话

在 Tom 和 Jerry 的对话中（假设对话 ID 为 `CONVERSATION_ID`，这只是一个示例，并不代表实际数据），后来 Tom 又希望把 Mary 也拉进来，他可以使用如下的办法：

```js
// 首先根据 ID 获取 Conversation 实例
tom.getConversation('CONVERSATION_ID').then(function(conversation) {
  // 邀请 Mary 加入对话
  return conversation.add(['Mary']);
}).then(function(conversation) {
  console.log('添加成功', conversation.members);
  // 此时对话成员为：['Mary', 'Tom', 'Jerry']
}).catch(console.error.bind(console));
```
```swift
do {
    let conversationQuery = client.conversationQuery
    try conversationQuery.getConversation(by: "CONVERSATION_ID") { (result) in
        switch result {
        case .success(value: let conversation):
            do {
                try conversation.add(members: ["Mary"], completion: { (result) in
                    switch result {
                    case .allSucceeded:
                        break
                    case .failure(error: let error):
                        print(error)
                    case let .slicing(success: succeededIDs, failure: failures):
                        if let succeededIDs = succeededIDs {
                            print(succeededIDs)
                        }
                        for (failedIDs, error) in failures {
                            print(failedIDs)
                            print(error)
                        }
                    }
                })
            } catch {
                print(error)
            }
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
// 首先根据 ID 获取 Conversation 实例
AVIMConversationQuery *query = [self.client conversationQuery];
[query getConversationById:@"CONVERSATION_ID" callback:^(AVIMConversation *conversation, NSError *error) {
    // 邀请 Mary 加入对话
    [conversation addMembersWithClientIds:@[@"Mary"] callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"邀请成功！");
        }
    }];
}];
```
```java
// 首先根据 ID 获取 Conversation 实例
final AVIMConversation conv = client.getConversation("CONVERSATION_ID");
// 邀请 Mary 加入对话
conv.addMembers(Arrays.asList("Mary"), new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      // 添加成功
    }
});
```
```cs
// 首先根据 ID 获取 Conversation 实例
var conversation = await tom.GetConversationAsync("CONVERSATION_ID");
// 邀请 Mary 加入对话
await tom.InviteAsync(conversation, "Mary");
```

而 Jerry 端增加「新成员加入」的事件通知处理函数，就可以及时获知 Mary 被 Tom 邀请加入当前对话了：

```js
// 有用户被添加至某个对话
jerry.on(Event.MEMBERS_JOINED, function membersjoinedEventHandler(payload, conversation) {
    console.log(payload.members, payload.invitedBy, conversation.id);
});
```
```swift
jerry.delegate = delegator

func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case let .joined(byClientID: byClientID, at: atDate):
        print(byClientID)
        print(atDate)
    case let .membersJoined(members: members, byClientID: byClientID, at: atDate):
        print(members)
        print(byClientID)
        print(atDate)
    default:
        break
    }
}
```
```objc
jerry.delegate = delegator;

#pragma mark - AVIMClientDelegate
/*!
 对话中有新成员加入时所有成员都会收到这一通知。
 @param conversation － 所属对话
 @param clientIds - 加入的新成员列表
 @param clientId - 邀请者的 ID
 */
- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 加入到对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  /**
   * 实现本方法以处理聊天对话中的参与者加入事件
   *
   * @param client
   * @param conversation
   * @param members 加入的参与者
   * @param invitedBy 加入事件的邀请人，有可能是加入的参与者本身
   * @since 3.0
   */
    @Override
    public void onMemberJoined(AVIMClient client, AVIMConversation conversation,
        List<String> members, String invitedBy) {
        // 手机屏幕上会显示一小段文字：Mary 加入到 551260efe4b01608686c3e0f；操作者为：Tom
        Toast.makeText(AVOSCloud.applicationContext,
          members + " 加入到 " + conversation.getConversationId() + "；操作者为："
              + invitedBy, Toast.LENGTH_SHORT).show();
    }
}
// 设置全局的对话事件处理 handler
AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());
```
```cs
private void OnMembersJoined(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人，e.ConversationId 是该项操作针对的对话 ID
    Debug.Log(string.Format("{0} 邀请了 {1} 加入了 {2} 对话", e.InvitedBy,e.JoinedMembers, e.ConversationId));
}
jerry.OnMembersJoined += OnMembersJoined;
```

{{ docs.langSpecStart('js') }}

其中 `payload` 参数包含如下内容：

1. `members`：字符串数组，被添加的用户 `clientId` 列表
2. `invitedBy`：字符串，邀请者 `clientId`

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('cs') }}

其中 `AVIMOnInvitedEventArgs` 参数包含如下内容：

1. `InvitedBy`：该操作的发起者
2. `JoinedMembers`：此次加入对话的包含的成员列表
3. `ConversationId`：被操作的对话

{{ docs.langSpecEnd('cs') }}

这一流程的时序图如下：

```seq
Tom->Cloud: 1. 添加 Mary
Cloud->Tom: 2. 下发通知：Mary 被你邀请加入了对话
Cloud-->Mary: 2. 下发通知：你被 Tom 邀请加入对话
Cloud-->Jerry: 2. 下发通知：Mary 被 Tom 邀请加入了对话
```

而 Mary 端如果要能加入到 Tom 和 Jerry 的对话中来，Ta 可以参照 [一对一单聊](#一对一单聊) 中 Jerry 侧的做法监听 `INVITED` 事件，就可以自己被邀请到了一个对话当中。

而 **重新创建一个对话，并在创建的时候指定全部成员** 的方式如下：

```js
tom.createConversation({
  // 创建的时候直接指定 Jerry 和 Mary 一起加入多人群聊，当然根据需求可以添加更多成员
  members: ['Jerry','Mary'],
  // 对话名称
  name: 'Tom & Jerry & friends',
  unique: true,
}).catch(console.error);
```
```swift
do {
    try tom.createConversation(clientIDs: ["Jerry", "Mary"], name: "Tom & Jerry & friends", isUnique: true, completion: { (result) in
        switch result {
        case .success(value: let conversation):
            print(conversation)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
// Tom 建立了与朋友们的会话
NSArray *friends = @[@"Jerry", @"Mary"];
[tom createConversationWithName:@"Tom & Jerry & friends" clientIds:friends
  options:AVIMConversationOptionUnique
  callback:^(AVIMConversation *conversation, NSError *error) {
    if (!error) {
        NSLog(@"创建成功！");
    }
}];
```
```java
tom.createConversation(Arrays.asList("Jerry","Mary"), "Tom & Jerry & friends", null,
   new AVIMConversationCreatedCallback() {
      @Override
      public void done(AVIMConversation conversation, AVIMException e) {
           if (e == null) {
              // 创建成功
           }
      }
   });
```
```cs
var conversation = await tom.CreateConversationAsync(new string[]{ "Jerry","Mary" }, name:"Tom & Jerry & friends", isUnique:true);
```

### 群发消息

多人群聊中一个成员发送的消息，会实时同步到所有其他在线成员，其处理流程与单聊中 Jerry 接收消息的过程是一样的。

例如，Tom 向好友群发送了一条欢迎消息：

```js
conversation.send(new TextMessage('大家好，欢迎来到我们的群聊对话'));
```
```swift
do {
    let textMessage = IMTextMessage(text: "大家好，欢迎来到我们的群聊对话！")
    try conversation.send(message: textMessage, completion: { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
[conversation sendMessage:[AVIMTextMessage messageWithText:@"大家好，欢迎来到我们的群聊对话！" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVIMTextMessage msg = new AVIMTextMessage();
msg.setText("大家好，欢迎来到我们的群聊对话！");
// 发送消息
conversation.sendMessage(msg, new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {
    if (e == null) {
      Log.d("群聊", "发送成功！");
    }
  }
});
```
```cs
var textMessage = new AVIMTextMessage("大家好，欢迎来到我们的群聊对话！");
await conversation.SendMessageAsync(textMessage);
```

而 Jerry 和 Mary 端都会有 `Event.MESSAGE` 事件触发，利用它来接收群聊消息，并更新产品 UI。

### 将他人踢出对话

三个好友的群其乐融融不久，后来 Mary 出言不逊，惹恼了群主 Tom，Tom 直接把 Mary 踢出了对话群。Tom 端想要踢人，该怎么实现呢？

```js
conversation.remove(['Mary']).then(function(conversation) {
  console.log('移除成功', conversation.members);
}).catch(console.error.bind(console));
```
```swift
do {
    try conversation.remove(members: ["Mary"], completion: { (result) in
        switch result {
        case .allSucceeded:
            break
        case .failure(error: let error):
            print(error)
        case let .slicing(success: succeededIDs, failure: failures):
            if let succeededIDs = succeededIDs {
                print(succeededIDs)
            }
            for (failedIDs, error) in failures {
                print(failedIDs)
                print(error)
            }
        }
    })
} catch {
    print(error)
}
```
```objc
[conversation removeMembersWithClientIds:@[@"Mary"] callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"踢人成功！");
    }
}];
```
```java
conv.kickMembers(Arrays.asList("Mary"),new AVIMConversationCallback(){
    @Override
    public void done(AVIMException e){
    }
});
```
```cs
await conversation.RemoveMembersAsync("Mary");
```

Tom 端执行了这段代码之后会触发如下流程：

```seq
Tom->Cloud: 1. 对话中移除 Mary
Cloud-->Mary: 2. 下发通知：你被 Tom 从对话中剔除了
Cloud-->Jerry: 2. 下发通知：Mary 被 Tom 移除
Cloud-->Tom: 2. 下发通知：Mary 被移除了对话 
```

这里出现了两个新的事件：当前用户被踢出对话 `KICKED`（Mary 收到的），成员 XX 被踢出对话 `MEMBERS_LEFT`（Jerry 和 Tom 收到的）。其处理方式与邀请人的流程类似：

```js
// 有成员被从某个对话中移除
jerry.on(Event.MEMBERS_LEFT, function membersjoinedEventHandler(payload, conversation) {
    console.log(payload.members, payload.kickedBy, conversation.id);
});
// 有用户被踢出某个对话
jerry.on(Event.KICKED, function membersjoinedEventHandler(payload, conversation) {
    console.log(payload.kickedBy, conversation.id);
});
```
```swift
jerry.delegate = delegator

func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case let .left(byClientID: byClientID, at: atDate):
        print(byClientID)
        print(atDate)
    case let .membersLeft(members: members, byClientID: byClientID, at: atDate):
        print(members)
        print(byClientID)
        print(atDate)
    default:
        break
    }
}
```
```objc
jerry.delegate = delegator;

#pragma mark - AVIMClientDelegate
/*!
 对话中有成员离开时所有剩余成员都会收到这一通知。
 @param conversation － 所属对话
 @param clientIds - 离开的成员列表
 @param clientId - 操作者的 ID
 */
- (void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray<NSString *> * _Nullable)clientIds byClientId:(NSString * _Nullable)clientId {
  ;
}
/*!
 当前用户被踢出对话的通知。
 @param conversation － 所属对话
 @param clientId - 操作者的 ID
 */
- (void)conversation:(AVIMConversation *)conversation kickedByClientId:(NSString * _Nullable)clientId {
  ;
}
```
```java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  /**
   * 实现本方法以处理聊天对话中的参与者离开事件
   *
   * @param client
   * @param conversation
   * @param members 离开的参与者
   * @param kickedBy 离开事件的发动者，有可能是离开的参与者本身
   * @since 3.0
   */
  @Override
  public abstract void onMemberLeft(AVIMClient client,
    AVIMConversation conversation, List<String> members, String kickedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
      members + " 离开对话 " + conversation.getConversationId() + "；操作者为："
          + kickedBy, Toast.LENGTH_SHORT).show();
  }
  /**
   * 实现本方法来处理当前用户被踢出某个聊天对话事件
   *
   * @param client
   * @param conversation
   * @param kickedBy 踢出你的人
   * @since 3.0
   */
  @Override
  public abstract void onKicked(AVIMClient client, AVIMConversation conversation,
    String kickedBy) {
    Toast.makeText(AVOSCloud.applicationContext,
      "你已离开对话 " + conversation.getConversationId() + "；操作者为："
          + kickedBy, Toast.LENGTH_SHORT).show();
  }
}
// 设置全局的对话事件处理 handler
AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());
```
```cs
private void OnMembersLeft(object sender, AVIMOnInvitedEventArgs e)
{
    Debug.Log(string.Format("{0} 把 {1} 移出了 {2} 对话", e.KickedBy, e.JoinedMembers, e.ConversationId));
}
private void OnKicked(object sender, AVIMOnInvitedEventArgs e)
{
    Debug.Log(string.Format("你被 {1} 移出了 {2} 对话", e.KickedBy, e.ConversationId));
}
jerry.OnMembersLeft += OnMembersLeft;
jerry.OnKicked += OnKicked;
```

### 用户主动加入对话

把 Mary 踢走之后，Tom 嫌人少不好玩，所以他找到了 William，说他和 Jerry 有一个很好玩的聊天群，并且把群的 ID（或名称）告知给了 William。William 也很想进入这个群看看他们究竟在聊什么，他自己主动加入了对话：

```js
william.getConversation('CONVERSATION_ID').then(function(conversation) {
  return conversation.join();
}).then(function(conversation) {
  console.log('加入成功', conversation.members);
  // 此时对话成员为：['William', 'Tom', 'Jerry']
}).catch(console.error.bind(console));
```
```swift
do {
    let conversationQuery = client.conversationQuery
    try conversationQuery.getConversation(by: "CONVERSATION_ID") { (result) in
        switch result {
        case .success(value: let conversation):
            do {
                try conversation.join(completion: { (result) in
                    switch result {
                    case .success:
                        break
                    case .failure(error: let error):
                        print(error)
                    }
                })
            } catch {
                print(error)
            }
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
AVIMConversationQuery *query = [william conversationQuery];
[query getConversationById:@"CONVERSATION_ID" callback:^(AVIMConversation *conversation, NSError *error) {
    [conversation joinWithCallback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"加入成功！");
        }
    }];
}];
```
```java
AVIMConversation conv = william.getConversation("CONVERSATION_ID");
conv.join(new AVIMConversationCallback(){
    @Override
    public void done(AVIMException e){
        if(e==null){
          // 加入成功
        }
    }
});
```
```cs
await william.JoinAsync("CONVERSATION_ID");
```

执行了这段代码之后会触发如下流程：

```seq
William->Cloud: 1. 加入对话
Cloud-->William: 2. 下发通知：你已加入对话
Cloud-->Tom: 2. 下发通知：William 加入对话
Cloud-->Jerry: 2. 下发通知：William 加入对话
```

其他人则通过订阅 `MEMBERS_JOINED` 来接收 William 加入对话的通知:

```js
jerry.on(Event.MEMBERS_JOINED, function membersJoinedEventHandler(payload, conversation) {
    console.log(payload.members, payload.invitedBy, conversation.id);
});
```
```swift
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case let .membersJoined(members: members, byClientID: byClientID, at: atDate):
        print(members)
        print(byClientID)
        print(atDate)
    default:
        break
    }
}
```
```objc
- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 加入到对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  @Override
  public void onMemberJoined(AVIMClient client, AVIMConversation conversation,
      List<String> members, String invitedBy) {
      // 手机屏幕上会显示一小段文字：William 加入到 551260efe4b01608686c3e0f；操作者为：William
      Toast.makeText(AVOSCloud.applicationContext,
        members + " 加入到 " + conversation.getConversationId() + "；操作者为："
            + invitedBy, Toast.LENGTH_SHORT).show();
  }
}
```
```cs
private void OnMembersJoined(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人，e.ConversationId 是该项操作针对的对话 ID
    Debug.Log(string.Format("{0} 加入了 {1} 对话，操作者是 {2}",e.JoinedMembers, e.ConversationId, e.InvitedBy));
}
jerry.OnMembersJoined += OnMembersJoined;
```

### 用户主动退出对话

随着 Tom 邀请进来的人越来越多，Jerry 觉得跟这些人都说不到一块去，他不想继续呆在这个对话里面了，所以选择自己主动退出对话，这时候可以调用 `Conversation#quit` 方法完成退群的操作：

```js
conversation.quit().then(function(conversation) {
  console.log('退出成功', conversation.members);
}).catch(console.error.bind(console));
```
```swift
do {
    try conversation.leave(completion: { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
[conversation quitWithCallback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"退出成功！");
    }
}];
```
```java
conversation.quit(new AVIMConversationCallback(){
    @Override
    public void done(AVIMException e){
      if(e==null){
        // 退出成功
      }
    }
});
```
```cs
await jerry.LeaveAsync(conversation);
```

执行了这段代码 Jerry 就离开了这个聊天群，此后群里所有的事件 Jerry 都不会再知晓。各个成员接收到的事件通知流程如下：

```seq
Jerry->Cloud: 1. 离开对话
Cloud-->Jerry: 2. 下发通知：你已离开对话
Cloud-->Mary: 2. 下发通知：Jerry 已离开对话
Cloud-->Tom: 2. 下发通知：Jerry 已离开对话
```

而其他人需要通过订阅 `MEMBERS_LEFT` 来接收 Jerry 离开对话的事件通知：

```js
mary.on(Event.MEMBERS_LEFT, function membersLeftEventHandler(payload, conversation) {
    console.log(payload.members, payload.kickedBy, conversation.id);
});
```
```swift
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case let .membersLeft(members: members, byClientID: byClientID, at: atDate):
        print(members)
        print(byClientID)
        print(atDate)
    default:
        break
    }
}
```
```objc
// Mary 登录之后，Jerry 退出了对话，在 Mary 所在的客户端就会激发以下回调
-(void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray *)clientIds byClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 离开了对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  @Override
  public void onMemberLeft(AVIMClient client, AVIMConversation conversation, List<String> members,
      String kickedBy) {
      // 有其他成员离开时，执行此处逻辑
  }
}
```
```cs
mary.OnMembersLeft += OnMembersLeft;
private void OnMembersLeft(object sender, AVIMOnMembersLeftEventArgs e)
{
    // e.KickedBy 是该项操作的发起人，e.ConversationId 是该项操作针对的对话 ID
    Debug.Log(string.Format("{0} 离开了 {1} 对话，操作者是 {2}",e.JoinedMembers, e.ConversationId, e.KickedBy));
}
```

### 成员变更的事件通知总结

前面的时序图和代码针对成员变更的操作做了逐步的分析和阐述，为了确保开发者能够准确的使用事件通知，如下表格做了一个统一的归类和划分：

假设 Tom 和 Jerry 已经在对话内了：

操作 | Tom | Jerry | Mary | William
--- | --- | --- | ---
Tom 添加 Mary | `MEMBERS_JOINED` | `MEMBERS_JOINED` | `INVITED` | /
Tom 剔除 Mary | `MEMBERS_LEFT` | `MEMBERS_LEFT` | `KICKED` | /
William 加入 | `MEMBERS_JOINED` | `MEMBERS_JOINED` | / | `MEMBERS_JOINED`
Jerry 主动退出 | `MEMBERS_LEFT` | `MEMBERS_LEFT` | / | `MEMBERS_LEFT`

## 文本之外的聊天消息

上面的示例都是发送文本消息，但是实际上可能图片、视频、位置等消息也是非常常见的消息格式，接下来我们就看看如何发送这些富媒体类型的消息。

LeanCloud 即时通讯服务默认支持文本、文件、图像、音频、视频、位置、二进制等不同格式的消息，除了二进制消息之外，普通消息的收发接口都是字符串，但是文本消息和文件、图像、音视频消息有一点区别：

- 文本消息发送的就是本身的内容
- 而其他的多媒体消息，例如一张图片，实际上即时通讯 SDK 会首先调用 LeanCloud 存储服务的 `AVFile` 接口，将图像的二进制文件上传到存储服务云端，再把图像下载的 URL 放入即时通讯消息结构体中，所以 **图像消息不过是包含了图像下载链接的固定格式文本消息**。

> 图像等二进制数据不随即时通讯消息直接下发的主要原因在于，LeanCloud 的文件存储服务默认都是开通了 CDN 加速选项的，通过文件下载对于终端用户来说可以有更快的展现速度，同时对于开发者来说也能获得更低的存储成本。

### 默认消息类型

即时通讯服务内置了多种结构化消息用来满足常见的需求：

- `TextMessage` 文本消息
- `ImageMessage` 图像消息
- `AudioMessage` 音频消息
- `VideoMessage` 视频消息
- `FileMessage` 普通文件消息（.txt/.doc/.md 等各种）
- `LocationMessage` 地理位置消息

所有消息均派生自 `AVIMMessage`，每种消息实例都具备如下属性：

{{ docs.langSpecStart('js') }}

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `from`        | `String` | 消息发送者的 `clientId`。 |
| `cid`         | `String` | 消息所属对话 ID。 |
| `id`          | `String` | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 ID。 |
| `timestamp`   | `Date`   | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `deliveredAt` | `Date`   | 消息送达时间。 |
| `status`      | `Symbol` | 消息状态，其值为枚举 [`MessageStatus`](https://leancloud.github.io/js-realtime-sdk/docs/module-leancloud-realtime.html#.MessageStatus) 的成员之一：<br/><br/>`MessageStatus.NONE`（未知）<br/>`MessageStatus.SENDING`（发送中）<br/>`MessageStatus.SENT`（发送成功）<br/>`MessageStatus.DELIVERED`（已送达）<br/>`MessageStatus.FAILED`（失败） |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `content`                  | `IMMessage.Content`    | 消息内容，支持 `String` 和 `Data` 两种格式。 |
| `fromClientID`             | `String`               | 消息发送者的 `clientId`。 |
| `currentClientID`          | `String`               | 消息接收者的 `clientId`。 |
| `conversationID`           | `String`               | 消息所属对话 ID。 |
| `ID`                       | `String`               | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 ID。 |
| `sentTimestamp`            | `int64_t`              | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `deliveredTimestamp`       | `int64_t`              | 消息被对方接收到的时间戳。 |
| `readTimestamp`            | `int64_t`              | 消息被对方阅读的时间戳。 |
| `patchedTimestamp`         | `int64_t`              | 消息被修改的时间戳。 |
| `isAllMembersMentioned`    | `Bool`                 | @ 所有会话成员。 |
| `mentionedMembers`         | `[String]`             | @ 会话成员。 |
| `isCurrentClientMentioned` | `Bool`                 | 当前 `Client` 是否被 @。 |
| `status`                   | `IMMessage.Status`     | 消息状态，有 6 种取值：<br/><br/>`none`（无状态）<br/>`sending`（发送中）<br/>`sent`（发送成功）<br/>`delivered`（已被接收）<br/>`read`（已被读）<br/>`failed`（发送失败） |
| `ioType`                   | `IMMessage.IOType`     | 消息传输方向，有两种取值：<br/><br/>`in`（当前用户接收到的）<br/>`out`（由当前用户发出的） |

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `content`            | `NSString`             | 消息内容。 |
| `clientId`           | `NSString`             | 消息发送者的 `clientId`。 |
| `conversationId`     | `NSString`             | 消息所属对话 ID。 |
| `messageId`          | `NSString`             | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 ID。 |
| `sendTimestamp`      | `int64_t`              | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `deliveredTimestamp` | `int64_t`              | 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `status`             | `AVIMMessageStatus` 枚举 | 消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusDelivered`（被接收）<br/>`AVIMMessageStatusFailed`（失败） |
| `ioType`             | `AVIMMessageIOType` 枚举 | 消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出） |

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `content`          | `String`               | 消息内容。 |
| `clientId`         | `String`               | 消息发送者的 `clientId`。 |
| `conversationId`   | `String`               | 消息所属对话 ID。 |
| `messageId`        | `String`               | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 ID。 |
| `timestamp`        | `long`                 | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `receiptTimestamp` | `long`                 | 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `status`           | `AVIMMessageStatus` 枚举 | 消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusReceipt`（被接收）<br/>`AVIMMessageStatusFailed`（失败） |
| `ioType`           | `AVIMMessageIOType` 枚举 | 消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出） |

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

| 属性 | 类型 | 描述 |
| --- | --- | --- |
| `content`          | `String`               | 消息内容。 |
| `clientId`         | `String`               | 消息发送者的 `clientId`。 |
| `conversationId`   | `String`               | 消息所属对话 ID。 |
| `messageId`        | `String`               | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 ID。 |
| `timestamp`        | `long`                 | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `receiptTimestamp` | `long`                 | 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| `status`           | `AVIMMessageStatus` 枚举 | 消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusReceipt`（被接收）<br/>`AVIMMessageStatusFailed`（失败） |
| `ioType`           | `AVIMMessageIOType` 枚举 | 消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出） |

{{ docs.langSpecEnd('cs') }}

我们为每一种富媒体消息定义了一个消息类型，即时通讯 SDK 自身使用的类型是负数（如下面列表所示），所有正数留给开发者自定义扩展类型使用，`0` 作为「没有类型」被保留起来。

消息 | 类型
--- | ---
文本消息 | `-1`
图像消息 | `-2`
音频消息 | `-3`
视频消息 | `-4`
位置消息 | `-5`
文件消息 | `-6`

### 图像消息

#### 发送图像文件

即时通讯 SDK 支持直接通过二进制数据，或者本地图像文件的路径，来构造一个图像消息并发送到云端。其流程如下：

```seq
Tom-->Local: 1. 获取图像实体内容
Tom-->Storage: 2. SDK 后台上传文件（AVFile）到云端
Storage-->Tom: 3. 返回图像的云端地址
Tom-->Cloud: 4. SDK 将图像消息发送给云端
Cloud->Jerry: 5. 收到图像消息，在对话框里面做 UI 展现
```

图解：
1. Local 可能是来自于 `localStorage`/`camera`，表示图像的来源可以是本地存储例如 iPhone 手机的媒体库或者直接调用相机 API 实时地拍照获取的照片。
2. `AVFile` 是 LeanCloud 提供的文件存储服务对象，详细可以参阅 [文件存储 AVFile](storage_overview.html#文件存储 AVFile)。

对应的代码并没有时序图那样复杂，因为调用 `send` 接口的时候，SDK 会自动上传图像，不需要开发者再去关心这一步：

```js
// 图像消息等富媒体消息依赖存储 SDK 和富媒体消息插件，
// 具体的引用和初始化步骤请参考《SDK 安装指南》

var fileUploadControl = $('#photoFileUpload')[0];
var file = new AV.File('avatar.jpg', fileUploadControl.files[0]);
file.save().then(function() {
  var message = new ImageMessage(file);
  message.setText('发自我的 Ins');
  message.setAttributes({ location: '旧金山' });
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```swift
do {
    if let imageFilePath = Bundle.main.url(forResource: "image", withExtension: "jpg")?.path {
        let imageMessage = IMImageMessage(filePath: imageFilePath, format: "jpg")
        try conversation.send(message: imageMessage, completion: { (result) in
            switch result {
            case .success:
                break
            case .failure(error: let error):
                print(error)
            }
        })
    }
} catch {
    print(error)
}
```
```objc
NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
NSString *documentsDirectory = [paths objectAtIndex:0];
NSString *imagePath = [documentsDirectory stringByAppendingPathComponent:@"LeanCloud.png"];
NSError *error;
AVFile *file = [AVFile fileWithLocalPath:imagePath error:&error];
AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"萌妹子一枚" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file = AVFile.withAbsoluteLocalPath("San_Francisco.png", Environment.getExternalStorageDirectory() + "/San_Francisco.png");
// 创建一条图像消息
AVIMImageMessage m = new AVIMImageMessage(file);
m.setText("发自我的小米手机");
conv.sendMessage(m, new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {
    if (e == null) {
      // 发送成功
    }
  }
});
```
```cs
var image = new AVFile("screenshot.png", "https://p.ssl.qhimg.com/dmfd/400_300_/t0120b2f23b554b8402.jpg");
// 需要先保存为 AVFile 对象
await image.SaveAsync();
var imageMessage = new AVIMImageMessage();
imageMessage.File = image;
imageMessage.TextContent = "发自我的 Windows";
await conversation.SendMessageAsync(imageMessage);
```

#### 发送图像链接

除了上述这种从本地直接发送图片文件的消息之外，在很多时候，用户可能从网络上或者别的应用中拷贝了一个图像的网络连接地址，当做一条图像消息发送到对话中，这种需求可以用如下代码来实现：

```js
var AV = require('leancloud-storage');
var { ImageMessage } = require('leancloud-realtime-plugin-typed-messages');
// 从网络链接直接构建一个图像消息
var file = new AV.File.withURL('萌妹子', 'http://pic2.zhimg.com/6c10e6053c739ed0ce676a0aff15cf1c.gif');
file.save().then(function() {
  var message = new ImageMessage(file);
  message.setText('萌妹子一枚');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```swift
do {
    if let url = URL(string: "http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif") {
        let imageMessage = IMImageMessage(url: url, format: "gif")
        try conversation.send(message: imageMessage, completion: { (result) in
            switch result {
            case .success:
                break
            case .failure(error: let error):
                print(error)
            }
        })
    }
} catch {
    print(error)
}
```
```objc
// Tom 发了一张图片给 Jerry
AVFile *file = [AVFile fileWithURL:[self @"http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif"]];
AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"萌妹子一枚" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file = new AVFile("萌妹子","http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", null);
AVIMImageMessage m = new AVIMImageMessage(file);
m.setText("萌妹子一枚");
// 创建一条图像消息
conv.sendMessage(m, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      if (e == null) {
        // 发送成功
      }
    }
});
```
```cs
var image = new AVFile("Satomi_Ishihara.gif", "http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif");
var imageMessage = new AVIMImageMessage();
imageMessage.File = image;
imageMessage.TextContent = "发自我的 Windows";
await conversation.SendMessageAsync(imageMessage);
```

#### 接收图像消息

图像消息的接收机制和之前是一样的，只需要修改一下接收消息的事件回调逻辑，根据消息类型来做不同的 UI 展现即可，例如：

```js
var { Event, TextMessage } = require('leancloud-realtime');
var { ImageMessage } = require('leancloud-realtime-plugin-typed-messages');

client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
   var file;
   switch (message.type) {
      case ImageMessage.TYPE:
        file = message.getFile();
        console.log('收到图像消息，URL：' + file.url());
        break;
   }
}
```
```swift
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case .message(event: let messageEvent):
        switch messageEvent {
        case .received(message: let message):
            switch message {
            case let imageMessage as IMImageMessage:
                print(imageMessage)
            default:
                break
            }
        default:
            break
        }
    default:
        break
    }
}
```
```objc
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

    // 消息的 ID
    NSString *messageId = imageMessage.messageId;
    // 图像文件的 URL
    NSString *imageUrl = imageMessage.file.url;
    // 发该消息的 clientId
    NSString *fromClientId = message.clientId;
}
```
```java
AVIMMessageManager.registerMessageHandler(AVIMImageMessage.class,
    new AVIMTypedMessageHandler<AVIMImageMessage>() {
        @Override
        public void onMessage(AVIMImageMessage msg, AVIMConversation conv, AVIMClient client) {
            // 只处理 Jerry 这个客户端的消息
            // 并且来自 conversationId 为 55117292e4b065f7ee9edd29 的 conversation 的消息
            if ("Jerry".equals(client.getClientId()) && "55117292e4b065f7ee9edd29".equals(conv.getConversationId())) {
                String fromClientId = msg.getFrom();
                String messageId = msg.getMessageId();
                String url = msg.getFileUrl();
                Map<String, Object> metaData = msg.getFileMetaData();
                if (metaData.containsKey("size")) {
                  int size = (Integer) metaData.get("size");
                }
                if (metaData.containsKey("width")) {
                  int width = (Integer) metaData.get("width");
                }
                if (metaData.containsKey("height")) {
                  int height = (Integer) metaData.get("height");
                }
                if (metaData.containsKey("format")) {
                  String format = (String) metaData.get("format");
                }
            }
        }
});
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
        AVFile file = imageMessage.File;
        Debug.Log(file.Url);
    }
}
```

### 发送音频消息/视频/文件

#### 发送流程

对于图像、音频、视频和文件这四种类型的消息，SDK 均采取如下的发送流程：

如果文件是从 **客户端 API 读取的数据流（Stream）**，步骤为：

1. 从本地构造 `AVFile`
2. 调用 `AVFile` 的上传方法将文件上传到云端，并获取文件元信息（`metaData`）
3. 把 `AVFile` 的 `objectId`、URL、文件元信息都封装在消息体内
4. 调用接口发送消息

如果文件是 **外部链接的 URL**，则：

1. 直接将 URL 封装在消息体内，不获取元信息（例如，音频消息的时长），不包含 `objectId`
2. 调用接口发送消息

以发送音频消息为例，基本流程是：读取音频文件（或者录制音频）> 构建音频消息 > 消息发送。

```js
var AV = require('leancloud-storage');
var { AudioMessage } = require('leancloud-realtime-plugin-typed-messages');

var fileUploadControl = $('#musicFileUpload')[0];
var file = new AV.File('忐忑.mp3', fileUploadControl.files[0]);
file.save().then(function() {
  var message = new AudioMessage(file);
  message.setText('听听人类的神曲');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```swift
do {
    if let filePath = Bundle.main.url(forResource: "audio", withExtension: "mp3")?.path {
        let audioMessage = IMAudioMessage(filePath: filePath, format: "mp3")
        audioMessage.text = "听听人类的神曲"
        try conversation.send(message: audioMessage, completion: { (result) in
            switch result {
            case .success:
                break
            case .failure(error: let error):
                print(error)
            }
        })
    }
} catch {
    print(error)
}
```
```objc
NSError *error = nil;
AVFile *file = [AVFile fileWithLocalPath:localPath error:&error];
if (!error) {
    AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲" file:file attributes:nil];
    [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"发送成功！");
        }
    }];
}
```
```java
AVFile file = AVFile.withAbsoluteLocalPath("忐忑.mp3",localFilePath);
AVIMAudioMessage m = new AVIMAudioMessage(file);
m.setText("听听人类的神曲");
// 创建一条音频消息
conv.sendMessage(m, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      if (e == null) {
        // 发送成功
      }
    }
});
```
```cs
var audio = new AVFile("tante.mp3", Path.Combine(Application.persistentDataPath, "tante.mp3"));
var audioMessage = new AVIMAudioMessage();
audioMessage.File = audio;
audioMessage.TextContent = "听听人类的神曲";
await conversation.SendMessageAsync(audioMessage);
```

与图像消息类似，音频消息也支持从 URL 构建：

```js
var AV = require('leancloud-storage');
var { AudioMessage } = require('leancloud-realtime-plugin-typed-messages');

var file = new AV.File.withURL('apple.acc', 'https://some.website.com/apple.acc');
file.save().then(function() {
  var message = new AudioMessage(file);
  message.setText('来自苹果发布会现场的录音');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```swift
do {
    if let url = URL(string: "https://some.website.com/apple.acc") {
        let audioMessage = IMAudioMessage(url: url, format: "acc")
        audioMessage.text = "来自苹果发布会现场的录音"
        try conversation.send(message: audioMessage, completion: { (result) in
            switch result {
            case .success:
                break
            case .failure(error: let error):
                print(error)
            }
        })
    }
} catch {
    print(error)
}
```
```objc
AVFile *file = [AVFile fileWithRemoteURL:[NSURL URLWithString:@"https://some.website.com/apple.acc"]];
AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"来自苹果发布会现场的录音" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file = new AVFile("apple.acc", "https://some.website.com/apple.acc", null);
AVIMAudioMessage m = new AVIMAudioMessage(file);
m.setText("来自苹果发布会现场的录音");
conv.sendMessage(m, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      if (e == null) {
        // 发送成功
      }
    }
});
```
```cs
var audio = new AVFile("apple.acc", "https://some.website.com/apple.acc");
var audioMessage = new AVIMAudioMessage();
audioMessage.File = audio;
audioMessage.TextContent = "来自苹果发布会现场的录音";
await conversation.SendMessageAsync(audioMessage);
```

### 发送地理位置消息

地理位置消息构建方式如下：

```js
var AV = require('leancloud-storage');
var { LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

var location = new AV.GeoPoint(31.3753285, 120.9664658);
var message = new LocationMessage(location);
message.setText('蛋糕店的位置');
conversation.send(message).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```swift
do {
    let locationMessage = IMLocationMessage(latitude: 31.3753285, longitude: 120.9664658)
    try conversation.send(message: locationMessage, completion: { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
AVIMLocationMessage *message = [AVIMLocationMessage messageWithText:@"蛋糕店的位置" latitude:31.3753285 longitude:120.9664658 attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
final AVIMLocationMessage locationMessage = new AVIMLocationMessage();
// 开发者可以通过设备的 API 获取设备的具体地理位置，此处设置了 2 个经纬度常量作为演示
locationMessage.setLocation(new AVGeoPoint(31.3753285,120.9664658));
locationMessage.setText("蛋糕店的位置");
conversation.sendMessage(locationMessage, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
        if (null != e) {
          e.printStackTrace();
        } else {
          // 发送成功
        }
    }
});
```
```cs
var locationMessage = new AVIMLocationMessage();
locationMessage.Location = new AVGeoPoint(31.3753285, 120.9664658);
await conversation.SendMessageAsync(locationMessage);
```

### 再谈接收消息

{{ docs.langSpecStart('js') }}

不管消息类型如何，JavaScript SDK 都是是通过 `IMClient` 上的 `Event.MESSAGE` 事件回调来通知新消息的，应用层只需要在一个地方，统一对不同类型的消息使用不同方式来处理即可。

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

Swift SDK 是通过实现 `IMClientDelegate` 代理来响应新消息到达通知的：

```swift
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case .message(event: let messageEvent):
        switch messageEvent {
        case .received(message: let message):
            print(message)
        default:
            break
        }
    default:
        break
    }
}
```

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

Objective-C SDK 是通过实现 `AVIMClientDelegate` 代理来响应新消息到达通知的，并且，分别使用了两个方法来分别处理普通的 `AVIMMessage` 消息和内建的多媒体消息 `AVIMTypedMessage`（包括应用层由此派生的自定义消息）：

```objc
/*!
 接收到新的普通消息。
 @param conversation － 所属对话
 @param message - 具体的消息
 */
- (void)conversation:(AVIMConversation *)conversation didReceiveCommonMessage:(AVIMMessage *)message;

/*!
 接收到新的富媒体消息。
 @param conversation － 所属对话
 @param message - 具体的消息
 */
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

Java/Android SDK 中定义了 `AVIMMessageHandler` 接口来通知应用层新消息到达事件发生，开发者通过调用 `AVIMMessageManager#registerDefaultMessageHandler` 方法来注册自己的消息处理函数。`AVIMMessageManager` 提供了两个不同的方法来注册默认的消息处理函数，或特定类型的消息处理函数：

```java
/**
 * 注册默认的消息 handler
 *
 * @param handler
 */
public static void registerDefaultMessageHandler(AVIMMessageHandler handler);
/**
 * 注册特定消息格式的处理单元
 *
 * @param clazz 特定的消息类
 * @param handler
 */
public static void registerMessageHandler(Class<? extends AVIMMessage> clazz, MessageHandler<?> handler);
/**
 * 取消特定消息格式的处理单元
 *
 * @param clazz
 * @param handler
 */
public static void unregisterMessageHandler(Class<? extends AVIMMessage> clazz, MessageHandler<?> handler);
```

消息处理函数需要在应用初始化时完成设置，理论上我们支持为每一种消息（包括应用层自定义的消息）分别注册不同的消息处理函数，并且也支持取消注册。

多次调用 `AVIMMessageManager` 的 `registerDefaultMessageHandler`，只有最后一次调用有效；而通过 `registerMessageHandler` 注册的 `AVIMMessageHandler`，则是可以同存的。

当客户端收到一条消息的时候，SDK 内部的处理流程为：

- 首先解析消息的类型，然后找到开发者为这一类型所注册的处理响应 handler chain，再逐一调用这些 handler 的 `onMessage` 函数。
- 如果没有找到专门处理这一类型消息的 handler，就会转交给 `defaultHandler` 处理。

这样一来，在开发者为 `AVIMTypedMessage`（及其子类）指定了专门的 handler，也指定了全局的 `defaultHandler` 了的时候，如果发送端发送的是通用的 `AVIMMessage` 消息，那么接收端就是 `AVIMMessageManager#registerDefaultMessageHandler()` 中指定的 handler 被调用；如果发送的是 `AVIMTypedMessage`（及其子类）的消息，那么接收端就是 `AVIMMessageManager#registerMessageHandler()` 中指定的 handler 被调用。

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

C# SDK 也是通过类似 `OnMessageReceived` 事件回调来通知新消息的，但是消息接收分为 **两个层级**：

* 第一层在 `AVIMClient` 上，它是为了帮助开发者实现被动接收消息，尤其是在本地并没有加载任何对话的时候，类似于刚登录，本地并没有任何 `AVIMConversation` 的时候，如果某个对话产生新的消息，当前 `AVIMClient.OnMessageReceived` 负责接收这类消息，但是它并没有针对消息的类型做区分。
* 第二层在 `AVIMConversation` 上，负责接收对话的全部信息，并且针对不同的消息类型有不同的事件类型做响应。

以上两个层级的消息接收策略可以用下表进行描述，假如正在接收的是 `AVIMTextMessage`：

`AVIMClient` 接收端 | 条件 1 | 条件 2 | 条件 3 | 条件 4 | 条件 5
--- | --- | --- | --- | --- | ---
`AVIMClient.OnMessageReceived` | × | √ | √ | √ | √
`AVIMConversation.OnMessageReceived` | × | × | √ | × | ×
`AVIMConversation.OnTypedMessageReceived` | × | × | × | √ | ×
`AVIMConversation.OnTextMessageReceived` | × | × | × | × | √

对应条件如下：

条件 1：

```cs
AVIMClient.Status != Online
``` 

条件 2：

```cs
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null
```

条件 3：

```cs
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
```

条件 4：

```cs
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived == null
```

条件 5：

```cs
   AVIMClient.Status == Online 
&& AVIMClient.OnMessageReceived != null 
&& AVIMConversation.OnMessageReceived != null
&& AVIMConversation.OnTypedMessageReceived != null
&& AVIMConversation.OnTextMessageReceived != null
```

在 `AVIMConversation` 内，接收消息的顺序为：

`OnTextMessageReceived` > `OnTypedMessageReceived` > `OnMessageReceived`

这是为了方便开发者在接收消息的时候有一个分层操作的空间，这一特性也适用于其他富媒体消息。

{{ docs.langSpecEnd('cs') }}

示例代码如下：

```js
// 在初始化 Realtime 时，需加载 TypedMessagesPlugin
var { Event, TextMessage } = require('leancloud-realtime');
var { FileMessage, ImageMessage, AudioMessage, VideoMessage, LocationMessage } = require('leancloud-realtime-plugin-typed-messages');
// 注册 MESSAGE 事件的 handler
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  // 请按自己需求改写
  var file;
  switch (message.type) {
    case TextMessage.TYPE:
      console.log('收到文本消息，内容：' + message.getText() + '，ID：' + message.id);
      break;
    case FileMessage.TYPE:
      file = message.getFile(); // file 是 AV.File 实例
      console.log('收到文件消息，URL：' + file.url() + '，大小：' + file.metaData('size'));
      break;
    case ImageMessage.TYPE:
      file = message.getFile();
      console.log('收到图像消息，URL：' + file.url() + '，宽度：' + file.metaData('width'));
      break;
    case AudioMessage.TYPE:
      file = message.getFile();
      console.log('收到音频消息，URL：' + file.url() + '，长度：' + file.metaData('duration'));
      break;
    case VideoMessage.TYPE:
      file = message.getFile();
      console.log('收到视频消息，URL：' + file.url() + '，长度：' + file.metaData('duration'));
      break;
    case LocationMessage.TYPE:
      var location = message.getLocation();
      console.log('收到位置消息，纬度：' + location.latitude + '，经度：' + location.longitude);
      break;
    default:
      console.warn('收到未知类型消息');
  }
});

// 同时，对应的 conversation 上也会派发 `MESSAGE` 事件：
conversation.on(Event.MESSAGE, function messageEventHandler(message) {
  // 这里补充业务逻辑
});
```
```swift
// 处理默认类型消息
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case .message(event: let messageEvent):
        switch messageEvent {
        case .received(message: let message):
            if let categorizedMessage = message as? IMCategorizedMessage {
                switch categorizedMessage {
                case let textMessage as IMTextMessage:
                    print(textMessage)
                case let imageMessage as IMImageMessage:
                    print(imageMessage)
                case let audioMessage as IMAudioMessage:
                    print(audioMessage)
                case let videoMessage as IMVideoMessage:
                    print(videoMessage)
                case let fileMessage as IMFileMessage:
                    print(fileMessage)
                case let locationMessage as IMLocationMessage:
                    print(locationMessage)
                case let recalledMessage as IMRecalledMessage:
                    print(recalledMessage)
                default:
                    break
                }
            } else {
                print(message)
            }
        default:
            break
        }
    default:
        break
    }
}

// 处理自定义类型消息
class CustomMessage: IMCategorizedMessage {
    
    class override var messageType: MessageType {
        return 1
    }    
}

func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    
    do {
        try CustomMessage.register()
    } catch {
        print(error)
        return false
    }
    
    return true
}

func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case .message(event: let messageEvent):
        switch messageEvent {
        case .received(message: let message):
            if let customMessage = message as? CustomMessage {
                print(customMessage)
            }
        default:
            break
        }
    default:
        break
    }
}
```
```objc
// 处理默认类型消息
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (message.mediaType == kAVIMMessageMediaTypeImage) {
        AVIMImageMessage *imageMessage = (AVIMImageMessage *)message; // 处理图像消息
    } else if(message.mediaType == kAVIMMessageMediaTypeAudio){
        // 处理音频消息
    } else if(message.mediaType == kAVIMMessageMediaTypeVideo){
        // 处理视频消息
    } else if(message.mediaType == kAVIMMessageMediaTypeLocation){
        // 处理位置消息
    } else if(message.mediaType == kAVIMMessageMediaTypeFile){
        // 处理文件消息
    } else if(message.mediaType == kAVIMMessageMediaTypeText){
        // 处理文本消息
    }
}

// 处理自定义类型消息

// 1. 注册子类
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AVIMCustomMessage registerSubclass];
}
// 2. 接收消息
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (message.mediaType == 1) {
        AVIMCustomMessage *imageMessage = (AVIMCustomMessage *)message;
        // 处理图像消息
    }
}
```
```java
// 1. 注册默认 handler
AVIMMessageManager.registerDefaultMessageHandler(new AVIMMessageHandler(){
    public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
        // 接收消息
    }

    public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
        // 执行收到消息后的逻辑
    }
});
// 2. 为每一种消息类型注册 handler
AVIMMessageManager.registerMessageHandler(AVIMTypedMessage.class, new AVIMTypedMessageHandler<AVIMTypedMessage>(){
    public void onMessage(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
        switch (message.getMessageType()) {
            case AVIMMessageType.TEXT_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMTextMessage textMessage = (AVIMTextMessage)message;
                break;
            case AVIMMessageType.IMAGE_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMImageMessage imageMessage = (AVIMImageMessage)message;
                break;
            case AVIMMessageType.AUDIO_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMAudioMessage audioMessage = (AVIMAudioMessage)message;
                break;
            case AVIMMessageType.VIDEO_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMVideoMessage videoMessage = (AVIMVideoMessage)message;
                break;
            case AVIMMessageType.LOCATION_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMLocationMessage locationMessage = (AVIMLocationMessage)message;
                break;
            case AVIMMessageType.FILE_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMFileMessage fileMessage = (AVIMFileMessage)message;
                break;
            case AVIMMessageType.RECALLED_MESSAGE_TYPE:
                // 执行其他逻辑
                AVIMRecalledMessage recalledMessage = (AVIMRecalledMessage)message;
                break;
            default:
                // UnsupportedMessageType
                break;
        }
    }

    public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
        // 执行收到消息后的逻辑
    }
});

// 处理自定义类型消息
public class CustomMessage extends AVIMMessage {
  
}

AVIMMessageManager.registerMessageHandler(CustomMessage.class, new MessageHandler<CustomMessage>(){
    public void onMessage(CustomMessage message, AVIMConversation conversation, AVIMClient client) {
        // 接收消息
    }

    public void onMessageReceipt(CustomMessage message, AVIMConversation conversation, AVIMClient client){
        // 执行收到消息后的逻辑
    }
});
```
```cs
// 这里使用的是简单的演示，推荐使用 switch/case 搭配模式匹配来判断类型
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {

    }
    else if (e.Message is AVIMAudioMessage audioMessage)
    {

    }
    else if (e.Message is AVIMVideoMessage videoMessage)
    {

    }
    else if (e.Message is AVIMFileMessage fileMessage)
    {

    }
    else if (e.Message is AVIMLocationMessage locationMessage)
    {

    }
    else if (e.Message is AVIMTypedMessage baseTypedMessage)
    {

    } // 这里可以继续添加自定义类型的判断条件
}
```

## 扩展对话：支持自定义属性

「对话（`Conversation`）」是即时通讯的核心逻辑对象，它有一些内置的常用的属性，与控制台中 `_Conversation` 表是一一对应的。默认提供的 **内置** 属性的对应关系如下：

{{ docs.langSpecStart('js') }}

| `Conversation` 属性名 | `_Conversation` 字段 | 含义 |
| --- | --- | --- |
| `id`                  | `objectId`         | 全局唯一的 ID                                      |
| `name`                | `name`             | 成员共享的统一的名字                               |
| `members`             | `m`                | 成员列表                                           |
| `creator`             | `c`                | 对话创建者                                         |
| `transient`           | `tr`               | 是否为聊天室                                       |
| `system`              | `sys`              | 是否为服务号（系统对话）                           |
| `mutedMembers`        | `mu`               | 静音该对话的成员                                   |
| `muted`               | N/A                | 当前用户是否静音该对话                             |
| `createdAt`           | `createdAt`        | 创建时间                                           |
| `updatedAt`           | `updatedAt`        | 最后更新时间                                       |
| `lastMessageAt`       | `lm`               | 最后一条消息发送时间，也可以理解为最后一次活跃时间 |
| `lastMessage`         | N/A                | 最后一条消息，可能会空                             |
| `unreadMessagesCount` | N/A                | 未读消息数                                         |
| `lastDeliveredAt`     | N/A                | （仅限单聊）最后一条已送达对方的消息时间           |
| `lastReadAt`          | N/A                | （仅限单聊）最后一条对方已读的消息时间             |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

| `IMConversation` 属性名 | `_Conversation` 字段 | 含义 |
| --- | --- | --- |
| `ID`                            | `objectId`         | 会话的全局唯一 `ID` |
| `uniqueID`                      | `uniqueId`         | `Unique Conversation` 全局唯一的 `ID` |
| `isUnique`                      | `unique`           | 是否是 `Unique Conversation` |
| `name`                          | `name`             | 会话的名称 |
| `members`                       | `m`                | 会话的成员列表 |
| `creator`                       | `c`                | 会话的创建者 |
| `attributes`                    | `attr`             | 会话的自定义属性 |
| `createdAt`                     | `createdAt`        | 会话的创建时间 |
| `updatedAt`                     | `updatedAt`        | 会话的最后更新时间 |
| `lastMessage`                   | N/A                | 最新一条消息，可能会空 |
| `isMuted`                       | N/A                | 当前用户是否静音该对话 |
| `unreadMessageCount`            | N/A                | 未读消息数 |
| `isUnreadMessageContainMention` | N/A                | 未读消息是否 @ 了当前的 `Client` |
| `client`                        | N/A                | 会话所属的 `Client` |
| `clientID`                      | N/A                | 会话所属的 `Client` 的 `ID` |
| `isOutdated`                    | N/A                | 会话的属性是否过期，可以根据该属性来决定是否更新会话的数据 |

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

| `AVIMConversation` 属性名 | `_Conversation` 字段 | 含义 |
| --- | --- | --- |
| `conversationId`        | `objectId`         | 全局唯一的 ID                                      |
| `name`                  | `name`             | 成员共享的统一的名字                               |
| `members`               | `m`                | 成员列表                                           |
| `creator`               | `c`                | 对话创建者                                         |
| `attributes`            | `attr`             | 自定义属性                                         |
| `transient`             | `tr`               | 是否为聊天室                                       |
| `createdAt`             | `createdAt`        | 创建时间                                           |
| `updatedAt`             | `updatedAt`        | 最后更新时间                                       |
| `system`                | `sys`              | 是否为系统对话                                     |
| `lastMessageAt`         | `lm`               | 最后一条消息发送时间，也可以理解为最后一次活跃时间 |
| `lastMessage`           | N/A                | 最后一条消息，可能会空                             |
| `muted`                 | N/A                | 当前用户是否静音该对话                             |
| `unreadMessagesCount`   | N/A                | 未读消息数                                         |
| `lastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间           |
| `lastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间             |

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

| `AVIMConversation` 属性名 | `_Conversation` 字段 | 含义 |
| --- | --- | --- |
| `conversationId`        | `objectId`         | 全局唯一的 ID                                    |
| `name`                  | `name`             | 成员共享的统一的名字                             |
| `members`               | `m`                | 成员列表                                         |
| `creator`               | `c`                | 对话创建者                                       |
| `attributes`            | `attr`             | 自定义属性                                       |
| `isTransient`           | `tr`               | 是否为聊天室                                     |
| `lastMessageAt`         | `lm`               | 该对话最后一条消息，也可以理解为最后一次活跃时间 |
| `lastMessage`           | N/A                | 最后一条消息，可能会空                           |
| `muted`                 | N/A                | 当前用户是否静音该对话                           |
| `unreadMessagesCount`   | N/A                | 未读消息数                                       |
| `lastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间         |
| `lastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间           |
| `createdAt`             | `createdAt`        | 创建时间                                         |
| `updatedAt`             | `updatedAt`        | 最后更新时间                                     |
| `system`                | `sys`              | 是否为系统对话                                   |

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

| `AVIMConversation` 属性名 | `_Conversation` 字段 | 含义 |
| --- | --- | --- |
| `Id`                    | `objectId`         | 全局唯一的 ID                                    |
| `Name`                  | `name`             | 成员共享的统一的名字                             |
| `MemberIds`             | `m`                | 成员列表                                         |
| `MuteMemberIds`         | `mu`               | 静音该对话的成员                                 |
| `Creator`               | `c`                | 对话创建者                                       |
| `IsTransient`           | `tr`               | 是否为聊天室                                     |
| `IsUnique`              | `unique`           | 是否为相同成员的唯一对话                         |
| `IsSystem`              | `sys`              | 是否为系统对话                                   |
| `LastMessageAt`         | `lm`               | 该对话最后一条消息，也可以理解为最后一次活跃时间 |
| `LastMessage`           | N/A                | 最后一条消息，可能会空                           |
| `LastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间         |
| `LastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间           |
| `CreatedAt`             | `createdAt`        | 创建时间                                         |
| `UpdatedAt`             | `updatedAt`        | 最后更新时间                                     |

{{ docs.langSpecEnd('cs') }}

其实，我们可以通过「自定义属性」来在「对话」中保存更多业务层数据。

### 创建自定义属性

在最开始介绍 [创建单聊对话](#创建对话 Conversation) 的时候，我们提到过 `IMClient#createConversation` 接口支持附加自定义属性，现在我们就来演示一下如何使用自定义属性。

假如在创建对话的时候，我们需要添加两个额外的属性值对 `{ "type": "private", "pinned": true }`，那么在调用 `IMClient#createConversation` 方法时可以把附加属性传进去：

```js
tom.createConversation({
  members: ['Jerry'],
  name: '猫和老鼠',
  unique: true,
  type: 'private',
  pinned: true,
}).then(function(conversation) {
  console.log('创建成功。ID：' + conversation.id);
}).catch(console.error.bind(console));
```
```swift
do {
    try tom.createConversation(clientIDs: ["Jerry"], name: "猫和老鼠", attributes: ["type": "private", "pinned": true], isUnique: true, completion: { (result) in
        switch result {
        case .success(value: let conversation):
            print(conversation)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
// Tom 创建名称为「猫和老鼠」的会话，并附加会话属性
NSDictionary *attributes = @{ 
    @"type": @"private",
    @"pinned": @(YES) 
};
[tom createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] attributes:attributes options:AVIMConversationOptionUnique callback:^(AVIMConversation *conversation, NSError *error) {
    if (succeeded) {
        NSLog(@"创建成功！");
    }
}];
```
```java
HashMap<String,Object> attr = new HashMap<String,Object>();
attr.put("type","private");
attr.put("pinned",true);
client.createConversation(Arrays.asList("Jerry"),"猫和老鼠", attr, false, true,
    new AVIMConversationCreatedCallback(){
        @Override
        public void done(AVIMConversation conv,AVIMException e){
          if(e==null){
            // 创建成功
          }
        }
    });
```
```cs
vars options = new Dictionary<string, object>();
options.Add("type", "private");
options.Add("pinned",true);
var conversation = await tom.CreateConversationAsync("Jerry", name:"Tom & Jerry", isUnique:true, options:options);
```

**自定义属性在 SDK 级别是对所有成员可见的。**我们也支持通过自定义属性来查询对话，请参见 [使用复杂条件来查询对话](#使用复杂条件来查询对话)。

### 修改和使用属性

在 `Conversation` 对象中，系统默认提供的属性，例如对话的名字（`name`），如果业务层没有限制的话，所有成员都是可以修改的，示例代码如下：

```js
conversation.name = '聪明的喵星人';
conversation.save();
```
```swift
do {
    try conversation.update(attribution: ["name": "聪明的喵星人"], completion: { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
conversation[@"name"] = @"聪明的喵星人";
[conversation updateWithCallback:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        NSLog(@"修改成功！");
    }
}];
```
```java
AVIMConversation conversation = client.getConversation("55117292e4b065f7ee9edd29");
conversation.setName("聪明的喵星人");
conversation.updateInfoInBackground(new AVIMConversationCallback(){
  @Override
  public void done(AVIMException e){        
    if(e==null){
      // 更新成功
    }
  }
});
```
```cs
conversation.Name = "聪明的喵星人";
await conversation.SaveAsync();
```

而 `Conversation` 对象中自定义的属性，即时通讯服务也是允许对话内其他成员来读取、使用和修改的，示例代码如下：

```js
// 获取自定义属性
var type = conversation.get('attr.type');
// 为 pinned 属性设置新的值
conversation.set('attr.pinned',false);
// 保存
conversation.save();
```
```swift
do {
    let type = conversation.attributes?["type"] as? String
    try conversation.update(attribution: ["attr.pinned": false]) { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
// 获取自定义属性
NSString *type = conversation.attributes[@"type"];
// 为 pinned 属性设置新的值
[conversation setObject:@(NO) forKey:@"attr.pinned"];
// 保存
[conversation updateWithCallback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"修改成功！");
    }
}];
```
```java
// 获取自定义属性
String type = conversation.get("attr.type");
// 为 pinned 属性设置新的值
conversation.set("attr.pinned",false);
// 保存
conversation.updateInfoInBackground(new AVIMConversationCallback(){
  @Override
  public void done(AVIMException e){        
    if(e==null){
      // 更新成功
    }
  }
});
```
```cs
// 获取自定义属性
var type = conversation["attr.type"];
// 为 pinned 属性设置新的值
conversation["attr.pinned"] = false;
// 保存
await conversation.SaveAsync();
```

> 对自定义属性名的说明
>
> 在 `IMClient#createConversation` 接口中指定的自定义属性，会被存入 `_Conversation` 表的 `attr` 字段，所以在之后对这些属性进行读取或修改的时候，属性名需要指定完整的路径，例如上面的 `attr.type`，这一点需要特别注意。

### 对话属性同步

对话的名字以及应用层附加的其他属性，一般都是需要全员共享的，一旦有人对这些数据进行了修改，那么就需要及时通知到全部成员。在前一个例子中，有一个用户对话名称改为了「聪明的喵星人」，那其他成员怎么能知道这件事情呢？

LeanCloud 即时通讯云端提供了实时同步的通知机制，会把单个用户对「对话」的修改同步下发到所有在线成员（对于非在线的成员，他们下次登录上线之后，自然会拉取到最新的完整的对话数据）。对话属性更新的通知事件声明如下：

```js
/**
 * 对话信息被更新
 * @event IMClient#CONVERSATION_INFO_UPDATED
 * @param {Object} payload
 * @param {Object} payload.attributes 被更新的属性
 * @param {String} payload.updatedBy 该操作的发起者 ID
 */
var { Event } = require('leancloud-realtime');
client.on(Event.CONVERSATION_INFO_UPDATED, function(payload) {
});
```
```swift
func client(_ client: IMClient, conversation: IMConversation, event: IMConversationEvent) {
    switch event {
    case let .dataUpdated(updatingData: updatingData, updatedData: updatedData, byClientID: byClientID, at: atDate):
        print(updatingData)
        print(updatedData)
        print(byClientID)
        print(atDate)
    default:
        break
    }
}
```
```objc
/**
 对话信息被更新
 
 @param conversation 被更新的对话
 @param date 更新时间
 @param clientId 该操作的发起者 ID
 @param data 更新内容
 */
- (void)conversation:(AVIMConversation *)conversation didUpdateAt:(NSDate * _Nullable)date byClientId:(NSString * _Nullable)clientId updatedData:(NSDictionary * _Nullable)data;
```
```java
// 在 AVIMConversationEventHandler 接口中有如下定义
/**
 * 对话自身属性变更通知
 *
 * @param client
 * @param conversation
 * @param attr      被更新的属性
 * @param operator  该操作的发起者 ID
 */
public void onInfoChanged(AVIMClient client, AVIMConversation conversation, JSONObject attr,
                          String operator)
```
```cs
// 暂不支持
```

> 使用提示：
>
> 应用层在该事件的响应函数中，可以获知当前什么属性被修改了，也可以直接从 SDK 的 `Conversation` 实例中获取最新的合并之后的属性值，然后依据需要来更新产品 UI。

### 获取群内成员列表

群内成员列表是作为对话的属性持久化保存在云端的，所以要获取一个 `Conversation` 对象的成员列表，我们可以在调用这个对象的更新方法之后，直接获取成员属性即可。

```js
// fetch 方法会执行一次刷新操作，以获取云端最新对话数据。
conversation.fetch().then(function(conversation) {
  console.log('members: ', conversation.members);
).catch(console.error.bind(console));
```
```swift
do {
    try conversation.refresh { (result) in
        switch result {
        case .success:
            if let members = conversation.members {
                print(members)
            }
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
// fetchWithCallback 方法会执行一次刷新操作，以获取云端最新对话数据。
[conversation fetchWithCallback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"", conversation.members);
    }
}];
```
```java
// fetchInfoInBackground 方法会执行一次刷新操作，以获取云端最新对话数据。
conversation.fetchInfoInBackground(new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {
    if (e == null) {
      conversation.getMembers();
    }
  }
});
```
```cs
// 暂不支持
```

> 使用提示：
>
> 成员列表是对 ***普通对话*** 而言的，对于像「聊天室」「系统对话」这样的特殊对话，并不存在「成员列表」属性。

## 使用复杂条件来查询对话

除了在事件通知接口中获得 `Conversation` 实例之外，开发者也可以根据不同的属性和条件来查询 `Conversation` 对象。例如有些产品允许终端用户根据名字或地理位置来匹配感兴趣聊天室，也有些业务场景允许查询成员列表中包含特定用户的所有对话，这些都可以通过对话查询的接口实现。

### 根据 ID 查询

ID 对应就是 `_Conversation` 表中的 `objectId` 的字段值，这是一种最简单也最高效的查询（因为云端会对 ID 建立索引）：

```js
tom.getConversation('551260efe4b01608686c3e0f').then(function(conversation) {
  console.log(conversation.id);
}).catch(console.error.bind(console));
```
```swift
do {
    let conversationQuery = tom.conversationQuery
    try conversationQuery.getConversation(by: "551260efe4b01608686c3e0f") { (result) in
        switch result {
        case .success(value: let conversation):
            print(conversation)
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
    if (succeeded) {
        NSLog(@"查询成功！");
    }
}];
```
```java
AVIMConversationsQuery query = tom.getConversationsQuery();
query.whereEqualTo("objectId","551260efe4b01608686c3e0f");
query.findInBackground(new AVIMConversationQueryCallback(){
    @Override
    public void done(List<AVIMConversation> convs,AVIMException e){
      if(e==null){
        if(convs!=null && !convs.isEmpty()){
          // convs.get(0) 就是想要的 conversation
        }
      }
    }
});
```
```cs
var query = tom.GetQuery();
var conversation = await query.GetAsync("551260efe4b01608686c3e0f");
```

### 基础的条件查询

即时通讯 SDK 提供了丰富的条件查询方式，可以满足各种复杂的业务需求。

我们首先从最简单的 `equalTo` 开始。例如查询所有自定义属性 `type`（字符串类型）为 `private` 的对话，需要如下代码：

```js
var query = client.getQuery();
query.equalTo('attr.type','private');
query.find().then(function(conversations) {
  // conversations 就是想要的结果
}).catch(console.error.bind(console));
```
```swift
do {
    let conversationQuery = tom.conversationQuery
    try conversationQuery.where("attr.type", .equalTo("private"))
    try conversationQuery.findConversations { (result) in
        switch result {
        case .success(value: let conversations):
            print(conversations)
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query whereKey:@"attr.type" equalTo:@"private"];
// 执行查询
[query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
    NSLog(@"找到 %ld 个对话！", [objects count]);
}];
```
```java
AVIMConversationsQuery query = tom.getConversationsQuery();
query.whereEqualTo("attr.type","private");
// 执行查询
query.findInBackground(new AVIMConversationQueryCallback(){
  @Override
  public void done(List<AVIMConversation> convs,AVIMException e){
    if(e == null){
      // convs 就是想要的结果
    }
  }
});
```
```cs
// 由于 WhereXXX 设置条件的接口每次都是返回一个新的 Query 实例，所以下面这样组合查询条件是无效的：
//   var query = tom.GetQuery();
//   query.WhereEqualTo("attr.type","private");
// 您可以这样写：
//   var query = tom.GetQuery();
//   query = query.WhereEqualTo("attr.type","private");
// 我们更建议采用这样的方式：
//   var query = tom.GetQuery().WhereEqualTo("attr.type","private");
var query = tom.GetQuery().WhereEqualTo("attr.type","private");
await query.FindAsync();
```

对 LeanCloud 数据存储服务熟悉的开发者可以更容易理解对话的查询构建，因为对话查询和数据存储服务的对象查询在接口上是十分接近的：

- 可以通过 `find` 获取当前结果页数据
- 支持通过 `count` 获取结果数
- 支持通过 `first` 获取第一个结果
- 支持通过 `skip` 和 `limit` 对结果进行分页

与 `equalTo` 类似，针对 `Number` 和 `Date` 类型的属性还可以使用大于、大于等于、小于、小于等于等，详见下表：

{{ docs.langSpecStart('js') }}

| 逻辑比较 | `ConversationQuery` 方法 |
| --- | --- |
| 等于     | `equalTo`              |
| 不等于   | `notEqualTo`           |
| 大于     | `greaterThan`          |
| 大于等于 | `greaterThanOrEqualTo` |
| 小于     | `lessThan`             |
| 小于等于 | `lessThanOrEqualTo`    |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

| 逻辑比较 | `IMConversationQuery` 的 `Constraint` |
| --- | --- |
| 等于     | `equalTo`                  |
| 不等于   | `notEqualTo`               |
| 大于     | `greaterThan`              |
| 大于等于 | `greaterThanOrEqualTo`     |
| 小于     | `lessThan`                 |
| 小于等于 | `lessThanOrEqualTo`        |

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

| 逻辑比较 | `AVIMConversationQuery` 方法 |
| --- | --- |
| 等于     | `equalTo`                  |
| 不等于   | `notEqualTo`               |
| 大于     | `greaterThan`              |
| 大于等于 | `greaterThanOrEqualTo`     |
| 小于     | `lessThan`                 |
| 小于等于 | `lessThanOrEqualTo`        |

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

| 逻辑比较 | `AVIMConversationQuery` 方法 |
| --- | --- |
| 等于     | `whereEqualTo`               |
| 不等于   | `whereNotEqualsTo`           |
| 大于     | `whereGreaterThan`           |
| 大于等于 | `whereGreaterThanOrEqualsTo` |
| 小于     | `whereLessThan`              |
| 小于等于 | `whereLessThanOrEqualsTo`    |

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

| 逻辑比较 | `AVIMConversationQuery` 方法 |
| --- | --- |
| 等于     | `WhereEqualTo`               |
| 不等于   | `WhereNotEqualsTo`           |
| 大于     | `WhereGreaterThan`           |
| 大于等于 | `WhereGreaterThanOrEqualsTo` |
| 小于     | `WhereLessThan`              |
| 小于等于 | `WhereLessThanOrEqualsTo`    |

{{ docs.langSpecEnd('cs') }}

> 使用注意：默认查询条件
> 
> 为了防止用户无意间拉取到所有的对话数据，在客户端不指定任何 `where` 条件的时候，`ConversationQuery` 会默认查询包含当前用户的对话。如果客户端添加了任一 `where` 条件，那么 `ConversationQuery` 会忽略默认条件而严格按照指定的条件来查询。如果客户端要查询包含某一个 `clientId` 的对话，那么使用下面的 [数组查询](#数组查询) 语法对 `m` 属性列和 `clientId` 值进行查询即可，不会和默认查询条件冲突。

### 正则匹配查询

`ConversationsQuery` 也支持在查询条件中使用正则表达式来匹配数据。比如要查询所有 `language` 是中文的对话：

```js
query.matches('language',/[\\u4e00-\\u9fa5]/); // language 是中文字符
```
```swift
try conversationQuery.where("language", .matchedRegularExpression("[\\u4e00-\\u9fa5]", option: nil))
```
```objc
[query whereKey:@"language" matchesRegex:@"[\\u4e00-\\u9fa5]"]; // language 是中文字符
```
```java
query.whereMatches("language","[\\u4e00-\\u9fa5]"); // language 是中文字符
```
```cs
query.WhereMatches("language","[\\u4e00-\\u9fa5]"); // language 是中文字符
```

### 字符串查询

***前缀查询*** 类似于 SQL 的 `LIKE 'keyword%'` 条件。例如查询名字以「教育」开头的对话：

```js
query.startsWith('name','教育');
```
```swift
try conversationQuery.where("name", .prefixedBy("教育"))
```
```objc
[query whereKey:@"name" hasPrefix:@"教育"];
```
```java
query.whereStartsWith("name","教育");
```
```cs
query.WhereStartsWith("name","教育");
```

***包含查询*** 类似于 SQL 的 `LIKE '%keyword%'` 条件。例如查询名字中包含「教育」的对话：

```js
query.contains('name','教育');
```
```swift
try conversationQuery.where("name", .matchedSubstring("教育"))
```
```objc
[query whereKey:@"name" containsString:@"教育"];
```
```java
query.whereContains("name","教育");
```
```cs
query.WhereContains("name","教育");
```

***不包含查询*** 则可以使用 [正则匹配查询](#正则匹配查询) 来实现。例如查询名字中不包含「教育」的对话：

```js
var regExp = new RegExp('^((?!教育).)*$', 'i');
query.matches('name', regExp);
```
```swift
try conversationQuery.where("name", .matchedRegularExpression("^((?!教育).)* $ ", option: nil))
```
```objc
[query whereKey:@"name" matchesRegex:@"^((?!教育).)* $ "];
```
```java
query.whereMatches("name","^((?!教育).)* $ ");
```
```cs
query.WhereMatches("name","^((?!教育).)* $ ");
```

### 数组查询

可以使用 `containsAll`、`containedIn`、`notContainedIn` 来对数组进行查询。例如查询成员中包含「Tom」的对话：

```js
query.containedIn('m', ['Tom']);
```
```swift
try conversationQuery.where("m", .containedIn(["Tom"]))
```
```objc
[query whereKey:@"m" containedIn:@[@"Tom"]];
```
```java
query.whereContainedIn("m", Arrays.asList("Tom"));
```
```cs
List<string> members = new List<string>();
members.Add("Tom");
query.WhereContainedIn("m", members);
```

### 空值查询

空值查询是指查询相关列是否为空值的方法，例如要查询 `lm` 列为空值的对话：

```js
query.doesNotExist('lm')
```
```swift
try conversationQuery.where("lm", .notExisted)
```
```objc
[query whereKeyDoesNotExist:@"lm"];
```
```java
query.whereDoesNotExist("lm");
```
```cs
query.WhereDoesNotExist("lm");
```

反过来，如果要查询 `lm` 列不为空的对话，则替换为如下条件即可：

```js
query.exists('lm')
```
```swift
try conversationQuery.where("lm", .existed)
```
```objc
[query whereKeyExists:@"lm"];
```
```java
query.whereExists("lm");
```
```cs
query.WhereExists("lm");
```

### 组合查询

查询年龄小于 18 岁，并且关键字包含「教育」的对话：

```js
// 查询 keywords 包含「教育」且 age 小于 18 的对话
query.contains('keywords', '教育').lessThan('age', 18);
```
```swift
try conversationQuery.where("keywords", .matchedSubstring("教育"))
try conversationQuery.where("age", .lessThan(18))
```
```objc
[query whereKey:@"keywords" containsString:@"教育"];
[query whereKey:@"age" lessThan:@(18)];
```
```java
query.whereContains("keywords", "教育");
query.whereLessThan("age", 18);
```
```cs
query.WhereContains("keywords", "教育").WhereLessThan("age", 18);
```

另外一种组合的方式是，两个查询采用 `or` 或者 `and` 的方式构建一个新的查询。

查询年龄小于 18 或者关键字包含「教育」的对话：

```js
// JavaScript SDK 暂不支持
```
```swift
do {
    let ageQuery = tom.conversationQuery
    try ageQuery.where("age", .greaterThan(18))
    
    let keywordsQuery = tom.conversationQuery
    try keywordsQuery.where("keywords", .matchedSubstring("教育"))
    
    let conversationQuery = try ageQuery.or(keywordsQuery)
} catch {
    print(error)
}
```
```objc
AVIMConversationQuery *ageQuery = [tom conversationQuery];
[ageQuery whereKey:@"age" greaterThan:@(18)];

AVIMConversationQuery *keywordsQuery = [tom conversationQuery];
[keywordsQuery whereKey:@"keywords" containsString:@"教育"];

AVIMConversationQuery *query = [AVIMConversationQuery orQueryWithSubqueries:[NSArray arrayWithObjects:ageQuery,keywordsQuery,nil]];
```
```java
AVIMConversationsQuery ageQuery = tom.getConversationsQuery();
ageQuery.whereLessThan('age', 18);

AVIMConversationsQuery keywordsQuery = tom.getConversationsQuery();
keywordsQuery.whereContains('keywords', '教育');

AVIMConversationsQuery query = AVIMConversationsQuery.or(Arrays.asList(priorityQuery, statusQuery));
```
```cs
var ageQuery = tom.GetQuery().WhereLessThan('age', 18);

var keywordsQuery = tom.GetQuery().WhereContains('keywords', '教育').

var query = AVIMConversationQuery.or(new AVIMConversationQuery[] { ageQuery, keywordsQuery});
```

### 结果排序

可以指定查询结果按照部分属性值的升序或降序来返回。例如：

```js
// 对查询结果按照 name 升序，然后按照创建时间降序排序
query.addAscending('name').addDescending('createdAt');
```
```swift
try conversationQuery.where("createdAt", .descending)
```
```objc
[query orderByDescending:@"createdAt"];
```
```java
AVIMClient tom = AVIMClient.getInstance("Tom");

tom.open(new AVIMClientCallback() {
  @Override
  public void done(AVIMClient client, AVIMException e) {
    if (e == null) {
      // 登录成功
      AVIMConversationsQuery query = client.getConversationsQuery();

      // 按对话的创建时间降序
      query.orderByDescending("createdAt");

      query.findInBackground(new AVIMConversationQueryCallback() {
        @Override
        public void done(List<AVIMConversation> convs, AVIMException e) {
          if (e == null) {
            if(convs != null && !convs.isEmpty()) {
              // 获取符合查询条件的 conversation 列表
            }
          }
        }
      });
    }
  }
});
```
```cs
// 暂不支持
```

### 不带成员信息的精简模式

普通对话最多可以容纳 500 个成员，在有些业务逻辑不需要对话的成员列表的情况下，可以使用「精简模式」进行查询，这样返回结果中不会包含成员列表（`members` 字段为空数组），有助于提升应用的性能同时减少流量消耗。

```js
query.compact(true);
```
```swift
conversationQuery.options = [.notContainMembers]
```
```objc
query.option = AVIMConversationQueryOptionCompact;
```
```java
public void queryConversationCompact() {
  AVIMClient tom = AVIMClient.getInstance("Tom");
  tom.open(new AVIMClientCallback() {
    @Override
    public void done(AVIMClient client, AVIMException e) {
      if (e == null) {
        // 登录成功
        AVIMConversationsQuery query = client.getConversationsQuery();
        query.setCompact(true);
        query.findInBackground(new AVIMConversationQueryCallback() {
          @Override
          public void done(List<AVIMConversation> convs, AVIMException e) {
            if (e == null) {
              // 获取符合查询条件的 Conversation 列表
            }
          }
        });
      }
    }
  });
}
```
```cs
// 暂不支持
```

### 让查询结果附带一条最新消息

对于一个聊天应用，一个典型的需求是在对话的列表界面显示最后一条消息，默认情况下，针对对话的查询结果是不带最后一条消息的，需要单独打开相关选项：

```js
// withLastMessagesRefreshed 方法可以指定让查询结果带上最后一条消息
query.withLastMessagesRefreshed(true);
```
```swift
conversationQuery.options = [.containLastMessage]
```
```objc
query.option = AVIMConversationQueryOptionWithMessage;
```
```java
public void queryConversationWithLastMessage() {
  AVIMClient tom = AVIMClient.getInstance("Tom");
  tom.open(new AVIMClientCallback() {
    @Override
    public void done(AVIMClient client, AVIMException e) {
      if (e == null) {
        // 登录成功
        AVIMConversationsQuery query = client.getConversationsQuery();
        /* 设置查询选项，指定返回对话的最后一条消息 */
        query.setWithLastMessagesRefreshed(true);
        query.findInBackground(new AVIMConversationQueryCallback() {
          @Override
          public void done(List<AVIMConversation> convs, AVIMException e) {
            if (e == null) {
              // 获取符合查询条件的 Conversation 列表
            }
          }
        });
      }
    }
  });
}
```
```cs
// 暂不支持
```

需要注意的是，这个选项真正的意义是「刷新对话的最后一条消息」，这意味着由于 SDK 缓存机制的存在，将这个选项设置为 `false` 查询得到的对话也还是有可能会存在最后一条消息的。

### 查询缓存

{{ docs.langSpecStart('js') }}

JavaScript SDK 会对按照对话 ID 对对话进行内存字典缓存，但不会进行持久化的缓存。

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

Swift SDK 提供了会话的缓存功能，包括内存缓存和持久化缓存。

会话的内存缓存：

```swift
client.getCachedConversation(ID: "CONVERSATION_ID") { (result) in
    switch result {
    case .success(value: let conversation):
        print(conversation)
    case .failure(error: let error):
        print(error)
    }
}

client.removeCachedConversation(IDs: ["CONVERSATION_ID"]) { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```

会话的持久化缓存。**注意，使用「查询持久存储会话」以及「删除持久存储会话」的功能前，需调用 `prepareLocalStorage` 方法且回调结果为成功；`prepareLocalStorage` 方法只需要调用一次（返回成功），一般在 `IMClient.init()` 和 `IMClient.open()` 之间调用**：

```swift
// Switch for Local Storage of IM Client
do {
    // Client init with Local Storage feature
    let clientWithLocalStorage = try IMClient(ID: "CLIENT_ID")
    
    // Client init without Local Storage feature
    var options = IMClient.Options.default
    options.remove(.usingLocalStorage)
    let clientWithoutLocalStorage = try IMClient(ID: "CLIENT_ID", options: options)
} catch {
    print(error)
}

// Preparation for Local Storage of IM Client
do {
    try client.prepareLocalStorage { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}

// Get and Load Stored Conversations to Memory
do {
    try client.getAndLoadStoredConversations(completion: { (result) in
        switch result {
        case .success(value: let conversations):
            print(conversations)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}

// Delete Stored Conversations and Messages belong to them
do {
    try client.deleteStoredConversationAndMessages(IDs: ["CONVERSATION_ID"], completion: { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```

注意：

1. 聊天室和临时会话没有本地缓存机制。
2. 会话有内存缓存和持久化（磁盘）缓存。消息只有持久化缓存，且只支持消息查询的结果（查询结果小于 3 时不缓存）。

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

通常，将查询结果缓存到磁盘上是一种行之有效的方法，这样就算设备离线，应用刚刚打开，网络请求尚未完成时，数据也能显示出来。或者为了节省用户流量，在应用打开的第一次查询走网络，之后的查询可优先走本地缓存。

值得注意的是，默认的策略是先走本地缓存的再走网络的，缓存时间是一小时。`AVIMConversationQuery` 中有如下方法：

```objc
// 设置缓存策略，默认是 kAVCachePolicyCacheElseNetwork
@property (nonatomic) AVCachePolicy cachePolicy;

// 设置缓存的过期时间，默认是 1 小时（1 * 60 * 60）
@property (nonatomic) NSTimeInterval cacheMaxAge;
```

有时你希望先走网络查询，发生网络错误的时候，再从本地查询，可以这样：

```objc
AVIMConversationQuery *query = [[AVIMClient defaultClient] conversationQuery];
query.cachePolicy = kAVCachePolicyNetworkElseCache;
[query findConversationsWithCallback:^(NSArray *objects, NSError *error) {

}];
```

各种查询缓存策略的行为可以参考 [存储指南 · AVQuery 缓存查询](leanstorage_guide-objc.html#缓存查询) 一节。

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

通常，将查询结果缓存到磁盘上是一种行之有效的方法，这样就算设备离线，应用刚刚打开，网络请求尚未完成时，数据也能显示出来。或者为了节省用户流量，在应用打开的第一次查询走网络，之后的查询可优先走本地缓存。

值得注意的是，默认的策略是先走本地缓存的再走网络的，缓存时间是一小时。`AVIMConversationsQuery` 中有如下方法：

```java
// 设置 AVIMConversationsQuery 的查询策略
public void setQueryPolicy(AVQuery.CachePolicy policy);
```

有时你希望先走网络查询，发生网络错误的时候，再从本地查询，可以这样：

```java
AVIMConversationsQuery query = client.getConversationsQuery();
query.setQueryPolicy(AVQuery.CachePolicy.NETWORK_ELSE_CACHE);
query.findInBackground(new AVIMConversationQueryCallback() {
  @Override
  public void done(List<AVIMConversation> conversations, AVIMException e) {

  }
});
```

{# 各种查询缓存策略的行为可以参考 [存储指南 · AVQuery 缓存查询](leanstorage_guide-java.html#缓存查询) 一节。 #}

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

.NET SDK 暂不支持缓存功能。

{{ docs.langSpecEnd('cs') }}

### 性能优化建议

`Conversation` 数据是存储在 LeanCloud 云端数据库中的，与存储服务中的对象查询类似，我们需要尽可能利用索引来提升查询效率，这里有一些优化查询的建议：

- `Conversation` 的 `objectId`、`updatedAt`、`createdAt` 等属性上是默认建了索引的，所以通过这些条件来查询会比较快。
- 虽然 `skip` 搭配 `limit` 的方式可以翻页，但是在结果集较大的时候不建议使用，因为数据库端计算翻页距离是一个非常低效的操作，取而代之的是尽量通过 `updatedAt` 或 `lastMessageAt` 等属性来限定返回结果集大小，并以此进行翻页。
- 使用 `m` 列的 `contains` 查询来查找包含某人的对话时，也尽量使用默认的 `limit` 大小 10，再配合 `updatedAt` 或者 `lastMessageAt` 来做条件约束，性能会提升较大。
- 整个应用对话如果数量太多，可以考虑在云引擎封装一个云函数，用定时任务启动之后，周期性地做一些清理，例如可以归档一些不活跃的对话，直接删除即可。

## 聊天记录查询

消息记录默认会在云端保存 **180** 天， 开发者可以通过额外付费来延长这一期限（有需要的用户请联系 support@leancloud.rocks），也可以通过 REST API 将聊天记录同步到自己的服务器上。

SDK 提供了多种方式来拉取历史记录，iOS 和 Android SDK 还提供了内置的消息缓存机制，以减少客户端对云端消息记录的查询次数，并且在设备离线情况下，也能展示出部分数据保障产品体验不会中断。

### 从新到旧获取对话的消息记录

在终端用户进入一个对话的时候，最常见的需求就是由新到旧、以翻页的方式拉取并展示历史消息，这可以通过如下代码实现：

```js
conversation.queryMessages({
  limit: 10, // limit 取值范围 1~100，默认 20
}).then(function(messages) {
  // 最新的十条消息，按时间增序排列
}).catch(console.error.bind(console));
```
```swift
do {
    try conversation.queryMessage(limit: 10) { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
```objc
// 查询对话中最后 10 条消息，limit 取值范围 1~100，值为 0 时获取 20 条消息记录（使用服务端默认值）
[conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
    NSLog(@"查询成功！");
}];
```
```java
// limit 取值范围 1~100，如调用 queryMessages 时不带 limit 参数，默认获取 20 条消息记录
int limit = 10;
conv.queryMessages(limit, new AVIMMessagesQueryCallback() {
  @Override
  public void done(List<AVIMMessage> messages, AVIMException e) {
    if (e == null) {
      // 成功获取最新 10 条消息记录
    }
  }
});
```
```cs
// limit 取值范围 1~100，默认 20
var messages = await conversation.QueryMessageAsync(limit: 10);
foreach (var message in messages)
{
  if (message is AVIMTextMessage)
  {
    var textMessage = (AVIMTextMessage)message;
  }
}
```

`queryMessage` 接口也是支持翻页的。LeanCloud 即时通讯云端通过消息的 `messageId` 和发送时间戳来唯一定位一条消息，因此要从某条消息起拉取后续的 N 条记录，只需要指定起始消息的 `messageId` 和发送时间戳作为锚定就可以了，示例代码如下：

```js
// JS SDK 通过迭代器隐藏了翻页的实现细节，开发者通过不断的调用 next 方法即可获得后续数据。
// 创建一个迭代器，每次获取 10 条历史消息
var messageIterator = conversation.createMessagesIterator({ limit: 10 });
// 第一次调用 next 方法，获得前 10 条消息，还有更多消息，done 为 false
messageIterator.next().then(function(result) {
  // result: {
  //   value: [message1, ..., message10],
  //   done: false,
  // }
}).catch(console.error.bind(console));
// 第二次调用 next 方法，获得第 11~20 条消息，还有更多消息，done 为 false
// 迭代器内部会记录起始消息的数据，无需开发者显示指定
messageIterator.next().then(function(result) {
  // result: {
  //   value: [message11, ..., message20],
  //   done: false,
  // }
}).catch(console.error.bind(console));
```
```swift
do {
    let start = IMConversation.MessageQueryEndpoint(
        messageID: "MESSAGE_ID",
        sentTimestamp: 31415926,
        isClosed: false
    )
    try conversation.queryMessage(start: start, limit: 10, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
// 查询对话中最后 10 条消息
[conversation queryMessagesWithLimit:10 callback:^(NSArray *messages, NSError *error) {
    NSLog(@"第一次查询成功！");
    // 以第一页的最早的消息作为开始，继续向前拉取消息
    AVIMMessage *oldestMessage = [messages firstObject];
    [conversation queryMessagesBeforeId:oldestMessage.messageId timestamp:oldestMessage.sendTimestamp limit:10 callback:^(NSArray *messagesInPage, NSError *error) {
        NSLog(@"第二次查询成功！");
    }];
}];
```
```java
// limit 取值范围 1~1000，默认 100
conv.queryMessages(10, new AVIMMessagesQueryCallback() {
  @Override
  public void done(List<AVIMMessage> messages, AVIMException e) {
    if (e == null) {
      // 成功获取最新 10 条消息记录
      // 返回的消息一定是时间增序排列，也就是最早的消息一定是第一个
      AVIMMessage oldestMessage = messages.get(0);

      conv.queryMessages(oldestMessage.getMessageId(), oldestMessage.getTimestamp(),20,
          new AVIMMessageQueryCallback(){
            @Override
            public void done(List<AVIMMessage> messagesInPage,AVIMException e){
              if(e== null){
                // 查询成功返回
                Log.d("Tom & Jerry", "got " + messagesInPage.size()+" messages ");
              }
          }
      });
    }
  }
});
```
```cs
// limit 取值范围 1~1000，默认 100
var messages = await conversation.QueryMessageAsync(limit: 10);
var oldestMessage = messages.ToList()[0];
var messagesInPage = await conversation.QueryMessageAsync(beforeMessageId: oldestMessage.Id, beforeTimeStamp: oldestMessage.ServerTimestamp); 
```

### 按照消息类型获取

除了按照时间先后顺序拉取历史消息之外，即时通讯服务云端也支持按照消息的类型来拉去历史消息，这一功能可能对某些产品来说非常有用，例如我们需要展现某一个聊天群组里面所有的图像。

`queryMessage` 接口还支持指定特殊的消息类型，其示例代码如下：

```js
conversation.queryMessages({ type: ImageMessage.TYPE }).then(messages => {
  console.log(messages);
}).catch(console.error);
```
```swift
do {
    try conversation.queryMessage(limit: 10, type: IMTextMessage.messageType, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
[conversation queryMediaMessagesFromServerWithType:kAVIMMessageMediaTypeImage limit:10 fromMessageId:nil fromTimestamp:0 callback:^(NSArray *messages, NSError *error) {
    if (!error) {
        NSLog(@"查询成功！");
    }
}];
```
```java
int msgType = .AVIMMessageType.IMAGE_MESSAGE_TYPE;
conversation.queryMessagesByType(msgType, limit, new AVIMMessagesQueryCallback() {
    @Override
    public void done(List<AVIMMessage> messages, AVIMException e){
    }
});
```
```cs
// 传入泛型参数，SDK 会自动读取类型的信息发送给服务端，用作筛选目标类型的消息
var imageMessages = await conversation.QueryMessageAsync<AVIMImageMessage>();
```

如要获取更多图像消息，可以效仿前一章节中的示例代码，继续翻页查询即可。

### 从旧到新反向获取历史消息

即时通讯云端支持的历史消息查询方式是非常多的，除了上面列举的两个最常见需求之外，还可以支持按照由旧到新的方向进行查询。如下代码演示从对话创建的时间点开始，从前往后查询消息记录：

```js
var { MessageQueryDirection } = require('leancloud-realtime');
conversation.queryMessages({
  direction: MessageQueryDirection.OLD_TO_NEW,
}).then(function(messages) {
  // 处理结果
}.catch(function(error) {
  // 处理异常
});
```
```swift
do {
    try conversation.queryMessage(direction: .oldToNew, limit: 10, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
[conversation queryMessagesInInterval:nil direction:AVIMMessageQueryDirectionFromOldToNew limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // 处理结果
    }
}];
```
```java
AVIMMessageInterval interval = new AVIMMessageInterval(null, null);
conversation.queryMessages(interval, AVIMMessageQueryDirectionFromOldToNew, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // 处理结果
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageAsync(direction: 0);
```

这种情况下要实现翻页，接口会稍微复杂一点，请继续阅读下一节。

### 从某一时间戳往某一方向查询

LeanCloud 即时通讯服务云端支持以某一条消息的 ID 和时间戳为准，往一个方向查：

- 从新到旧：以某一条消息为基准，查询它 **之前** 产生的消息
- 从旧到新：以某一条消息为基准，查询它 **之后** 产生的消息

这样我们就可以在不同方向上实现消息翻页了。

```js
var { MessageQueryDirection } = require('leancloud-realtime');
conversation.queryMessages({
  startTime: timestamp,
  startMessageId: messageId,
startClosed: false,
  direction: MessageQueryDirection.OLD_TO_NEW,
}).then(function(messages) {
  // 处理结果
}.catch(function(error) {
  // 处理异常
});
```
```swift
do {
    let start = IMConversation.MessageQueryEndpoint(
        messageID: "MESSAGE_ID",
        sentTimestamp: 31415926,
        isClosed: true
    )
    try conversation.queryMessage(start: start, direction: .oldToNew, limit: 10, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:timestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:nil];
[conversation queryMessagesInInterval:interval direction:direction limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // 处理结果
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageInterval interval = new AVIMMessageInterval(start, null);
AVIMMessageQueryDirection direction;
conversation.queryMessages(interval, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // 处理结果
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageAsync(direction: 0, limit: 1);
// 获取 earliestMessages.Last() 之后的消息
var nextPageMessages = await conversation.QueryMessageAfterAsync(earliestMessages.Last());
```

### 获取指定区间内的消息

除了顺序查找之外，我们也支持获取特定时间区间内的消息。假设已知 2 条消息，这 2 条消息以较早的一条为起始点，而较晚的一条为终点，这个区间内产生的消息可以用如下方式查询：

注意：**每次查询也有 100 条限制，如果想要查询区间内所有产生的消息，替换区间起始点的参数即可。**

```js
conversation.queryMessages({
  startTime: timestamp,
  startMessageId: messageId,
  endTime: endTimestamp,
  endMessageId: endMessageId,
}).then(function(messages) {
  // 处理结果
}.catch(function(error) {
  // 处理异常
});
```
```swift
do {
    let start = IMConversation.MessageQueryEndpoint(
        messageID: "MESSAGE_ID_1",
        sentTimestamp: 31415926,
        isClosed: true
    )
    let end = IMConversation.MessageQueryEndpoint(
        messageID: "MESSAGE_ID_2",
        sentTimestamp: 31415900,
        isClosed: true
    )
    try conversation.queryMessage(start: start, end: end, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:startTimestamp closed:false];
    AVIMMessageIntervalBound *end = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:endTimestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:end];
[conversation queryMessagesInInterval:interval direction:direction limit:100 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // 处理结果
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageIntervalBound end = AVIMMessageInterval.createBound(endMessageId, endTimestamp, false);
AVIMMessageInterval interval = new AVIMMessageInterval(start, end);
AVIMMessageQueryDirection direction;
conversation.queryMessages(interval, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // 处理结果
    }
});
```
```cs
var earliestMessage = await conversation.QueryMessageAsync(direction: 0, limit: 1);
var latestMessage = await conversation.QueryMessageAsync(limit: 1);
// messagesInInterval 最多可包含 100 条消息
var messagesInInterval = await conversation.QueryMessageInIntervalAsync(earliestMessage.FirstOrDefault(), latestMessage.FirstOrDefault());
```

### 客户端消息缓存

iOS 和 Android SDK 针对移动设备的特殊性，实现了客户端消息的缓存（JavaScript 和 C# 暂不支持）。开发者无需进行特殊设置，只要接收或者查询到的新消息，默认都会进入被缓存起来，该机制给开发者提供了如下便利：

1. 客户端可以在未联网的情况下进入对话列表之后，可以获取聊天记录，提升用户体验
2. 减少查询的次数和流量的消耗
3. 极大地提升了消息记录的查询速度和性能

客户端缓存是默认开启的，如果开发者有特殊的需求，SDK 也支持关闭缓存功能。例如有些产品在应用层进行了统一的消息缓存，无需 SDK 层再进行冗余存储，可以通过如下接口来关闭消息缓存：

```js
// 暂不支持
```
```swift
// Switch for Local Storage of IM Client
do {
    // Client init with Local Storage feature
    let clientWithLocalStorage = try IMClient(ID: "CLIENT_ID")
    
    // Client init without Local Storage feature
    var options = IMClient.Options.default
    options.remove(.usingLocalStorage)
    let clientWithoutLocalStorage = try IMClient(ID: "CLIENT_ID", options: options)
} catch {
    print(error)
}

// Message Query Policy
enum MessageQueryPolicy {
    case `default`
    case onlyNetwork
    case onlyCache
    case cacheThenNetwork
}
    
do {
    try conversation.queryMessage(policy: .default, completion: { (result) in
        switch result {
        case .success(value: let messages):
            print(messages)
        case .failure(error: let error):
            print(error)
        }
    })
} catch {
    print(error)
}
```
```objc
// 需要在调用 [avimClient openWithCallback:callback] 函数之前设置，关闭历史消息缓存开关。
avimClient.messageQueryCacheEnabled = false;
```
```java
// 需要在调用 AVIMClient.open(callback) 函数之前设置，关闭历史消息缓存开关。
AVIMClient.setMessageQueryCacheEnable(false);
```
```cs
// 暂不支持
```

## 用户退出与网络状态变化

### 用户退出即时通讯服务

如果产品层面设计了用户退出登录或者切换账号的接口，对于即时通讯服务来说，也是需要完全注销当前用户的登录状态的。在 SDK 中，开发者可以通过调用 `AVIMClient` 的 `close` 系列方法完成即时通讯服务的「退出」：

```js
tom.close().then(function() {
  console.log('Tom 退出登录');
}).catch(console.error.bind(console));
```
```swift
tom.close { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```
```objc
[tom closeWithCallback:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        NSLog(@"退出即时通讯服务");
    }
}];
```
```java
tom.close(new AVIMClientCallback(){
    @Override
    public void done(AVIMClient client,AVIMException e){
        if(e==null){
            // 登出成功
        }
    }
});
```
```cs
await tom.CloseAsync();
```

调用该接口之后，客户端就与即时通讯服务云端断开连接了，从云端查询前一 `clientId` 的状态，会显示「离线」状态。

### 客户端事件与网络状态响应

即时通讯服务与终端设备的网络连接状态休戚相关，如果网络中断，那么所有的消息收发和对话操作都会失败，这时候产品层面需要在 UI 上给予用户足够的提示，以免影响使用体验。

我们的 SDK 内部和即时通讯云端会维持一个「心跳」机制，能够及时感知到客户端的网络变化，同时将底层网络变化事件通知到应用层。具体来讲，当网络连接出现中断、恢复等状态变化时，SDK 会派发以下事件：

{{ docs.langSpecStart('js') }}

* `DISCONNECT`：与服务端连接断开，此时聊天服务不可用。
* `OFFLINE`：网络不可用。
* `ONLINE`：网络恢复。
* `SCHEDULE`：计划在一段时间后尝试重连，此时聊天服务仍不可用。
* `RETRY`：正在重连。
* `RECONNECT`：与服务端连接恢复，此时聊天服务可用。

```js
var { Event } = require('leancloud-realtime');

realtime.on(Event.DISCONNECT, function() {
  console.log('服务器连接已断开');
});
realtime.on(Event.OFFLINE, function() {
  console.log('离线（网络连接已断开）');
});
realtime.on(Event.ONLINE, function() {
  console.log('已恢复在线');
});
realtime.on(Event.SCHEDULE, function(attempt, delay) {
  console.log(delay + ' ms 后进行第 ' + (attempt + 1) + ' 次重连');
});
realtime.on(Event.RETRY, function(attempt) {
  console.log('正在进行第 ' + (attempt + 1) + ' 次重连');
});
realtime.on(Event.RECONNECT, function() {
  console.log('与服务端连接恢复');
});
```

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('swift') }}

```swift
func client(_ client: IMClient, event: IMClientEvent) {
    switch event {
    case .sessionDidOpen:
        break
    case .sessionDidPause(error: let error):
        print(error)
    case .sessionDidResume:
        break
    case .sessionDidClose(error: let error):
        print(error)
    }
}
```

{{ docs.langSpecEnd('swift') }}

{{ docs.langSpecStart('objc') }}

在 AVIMClientDelegate 上会有如下事件通知：

- `imClientPaused:(AVIMClient *)imClient` 指网络连接断开事件发生，此时聊天服务不可用。
- `imClientResuming:(AVIMClient *)imClient` 指网络断开后开始重连，此时聊天服务依然不可用。
- `imClientResumed:(AVIMClient *)imClient` 指网络连接恢复正常，此时聊天服务变得可用。

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

`AVIMClientEventHandler` 上会有如下事件通知：

- `onConnectionPaused()` 指网络连接断开事件发生，此时聊天服务不可用。
- `onConnectionResume()` 指网络连接恢复正常，此时聊天服务变得可用。
- `onClientOffline()` 指单点登录被踢下线的事件。

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

`AVRealtime` 上会有如下事件通知：

- `OnDisconnected` 指网络连接断开事件发生，此时聊天服务不可用。
- `OnReconnecting` 指网络正在尝试重连，此时聊天服务不可用。
- `OnReconnected` 指网络连接恢复正常，此时聊天服务变得可用。
- `OnReconnectFailed` 指重连失败，此时聊天服务不可用。

{{ docs.langSpecEnd('cs') }}

## 其他开发建议

### 如何根据活跃度来展示对话列表

不管是当前用户参与的「对话」列表，还是全局热门的开放聊天室列表展示出来了，我们下一步要考虑的就是如何把最活跃的对话展示在前面，这里我们把「活跃」定义为最近有新消息发出来。我们希望有最新消息的对话可以展示在对话列表的最前面，甚至可以把最新的那条消息也附带显示出来，这时候该怎么实现呢？

我们专门为 `AVIMConversation` 增加了一个动态的属性 `lastMessageAt`（对应 `_Conversation` 表里的 `lm` 字段），记录了对话中最后一条消息到达即时通讯云端的时间戳，这一数字是服务器端的时间（精确到秒），所以不用担心客户端时间对结果造成影响。另外，`AVIMConversation` 还提供了一个方法可以直接获取最新的一条消息。这样在界面展现的时候，开发者就可以自己决定展示内容与顺序了。

### 自动重连

如果开发者没有明确调用退出登录的接口，但是客户端网络存在抖动或者切换（对于移动网络来说，这是比较常见的情况），我们 iOS 和 Android SDK 默认内置了断线重连的功能，会在网络恢复的时候自动建立连接，此时 `IMClient` 的网络状态可以通过底层的网络状态响应接口得到回调。

### 更多「对话」类型

即时通讯服务提供的功能就是让一个客户端与其他客户端进行在线的消息互发，对应不同的使用场景，除了前两章节介绍的 [一对一单聊](#一对一单聊) 和 [多人群聊](#多人群聊) 之外，我们也支持其他形式的「对话」模型：

- 开放聊天室，例如直播中的弹幕聊天室，它与普通的「多人群聊」的主要差别是允许的成员人数以及消息到达的保证程度不一样。有兴趣的开发者可以参考文档：[第三篇：玩转直播聊天室](realtime-guide-senior.html#玩转直播聊天室)。
- 临时对话，例如客服系统中用户和客服人员之间建立的临时通道，它与普通的「一对一单聊」的主要差别在于对话总是临时创建并且不会长期存在，在提升实现便利性的同时，还能降低服务使用成本（能有效减少存储空间方面的花费）。有兴趣的开发者可以参考下篇文档：[第三篇：使用临时对话](realtime-guide-senior.html#使用临时对话)。
- 系统对话，例如在微信里面常见的公众号/服务号，系统全局的广播账号，与普通「多人群聊」的主要差别，在于「服务号」是以订阅的形式加入的，也没有成员限制，并且订阅用户和服务号的消息交互是一对一的，一个用户的上行消息不会群发给其他订阅用户。有兴趣的开发者可以参考下篇文档：[第四篇：「系统对话」的使用](realtime-guide-systemconv.html#「系统对话」的使用)。

## 进一步阅读

[二，消息收发的更多方式，离线推送与消息同步，多设备登录](realtime-guide-intermediate.html)

[三，安全与签名、黑名单和权限管理、玩转直播聊天室和临时对话](realtime-guide-senior.html)

[四，详解消息 hook 与系统对话，打造自己的聊天机器人](realtime-guide-systemconv.html)
