{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 即时通讯开发指南 &middot; 基础入门

## 使用场景和解决的需求

针对如下应用场景，即时通讯都有对应的解决方案：

- 社交应用需要接入聊天功能
- 游戏需要接入聊天频道
- 直播应用要接入聊天室弹幕服务
- 系统广播消息在线通知，游戏 GM 在线全服广播

而上述只是一些比较经典和流行的场景，即时通讯不局限于上述用法和场景，我们提供了许多易用性较高的接口支持开发者可以拓展更多的场景和模式。

即时通讯要解决的核心需求就是:

> 让你的应用拥有私聊、群聊、聊天室、系统消息等通讯能力

即时通讯使得开发者可以在不编写服务端的代码的情况下，仅使用客户端 SDK 即可实现在线聊天/多人群组/私聊/消息群发等实时通讯的功能，如下时序图简单的介绍了一下即时通讯的业务流程：

```seq
ClientA->Cloud: send('大家好，我是 A');
Cloud-->ClientB: onMessage(ClientA,'大家好，我是 A');
Cloud-->ClientC: onMessage(ClientA,'大家好，我是 A');
```

首先，如果您还没有下载对应开发环境（语言）的 SDK，请查看如下内容，选择一门语言，查看下载和安装的文档：

{{ docs.relatedLinks("安装与初始化",[
   {title: "JavaScript", href: "sdk_setup-js.html"},
   {title: "iOS-Objective-C", href: "sdk_setup-objc.html"},
   {title: "Android-Java", href: "sdk_setup-android.html"},
   {title: "Unity3D-C#", href: "sdk_setup-dotnet.html"}
]) }}

## 阅前准备

建议先阅读[即时通信服务总览](realtime_v2.html)之后，再阅读本文效果最佳。

## 一对一单聊

我们从最基本的一对一私聊开始接入即时通讯模块，首先我们需要明确一个需求：

> 假设我们正在制作一个社交聊天的应用，第一步要实现一个用户向另一个用户发起聊天的功能

首先我们需要介绍一下在即时通讯服务中的 `IMClient` 对象：

> `IMClient` 对应实体的是一个用户，它代表着一个用户以客户端的身份登录到了即时通讯的系统。

### 1.创建 `IMClient`

在 iOS 和 Android SDK 中使用如下代码创建出一个 `IMClient`:

```js
var realtime = new Realtime({
  appId: 'your-app-id',
  appKey: 'your-app-key',
  plugins: [TypedMessagesPlugin], // 注册富媒体消息插件
});
// Tom 用自己的名字作为 clientId
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
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

示例代码中 `clientId` 被设置为 Tom, 这里我们需要明确一下 `clientId` 的约束：

1. 它必须为一个字符串
2. 在一个应用内全局唯一
3. 长度不能超过 64 个字符

注： JavaScript 和 C#(Unity3D) SDK 创建 `IMClient` 成功同时意味着连接也已经建立，而 iOS 和 Android SDK 则需要额外下一步[2.建立连接](#2.建立连接)

### 2.建立连接

建立连接的含义是：

> `IMClient` 建立一个于云端的长连接，然后就可以开始收发消息了，并且可以监听事件。

对应的 SDK 方法如下：

```js
// Tom 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
```
```objc
// Tom 创建了一个 client，用自己的名字作为 clientId
AVIMClient *tom = [[AVIMClient alloc] initWithClientId:@"Tom"];
// Tom 创建连接
[tom openWithCallback:^(BOOL succeeded, NSError *error) {
  if(succeeded) {
    // 成功打开连接
  }
}];
```
```java
// Tom 创建了一个 client，用自己的名字作为 clientId
AVIMClient tom = AVIMClient.getInstance("Tom");
// Tom 创建连接
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

注：JavaScript 和 C#(Unity3D) SDK 建立连接成功之后，会返回一个 `IMClient`。

推荐使用的方式：在用户登录之后用当前的用户名当做 `clientId` 来创建 `IMClient` 并建立连接。

我们推荐在连接创建成功之后订阅[客户端事件与网络状态响应](#客户端事件与网络状态响应)，针对网络的异常情况作出应有的 UI 展示，以确保应用的健壮性。

### 3.创建对话 `Conversation`

对话(`Conversation`) 是即时通讯抽象出来的概念，它是客户端之间互发消息的载体，可以理解为一个通道，所有在这个对话内的成员都可以在这个对话内收发消息:

> 对话(`Conversation`)对话是消息的载体，所有消息的目标都是对话，而所有在对话中的成员都会接收到对话内产生的消息。

Tom 已经建立了连接，因此他需要创建一个 `Conversation` 来发送消息给 Jerry：

```js
// 创建与 Jerry 之间的对话
return tom.createConversation({
  // 指定对话的成员除了当前用户 Tom(SDK 会默认把当前用户当做对话成员)之外，还有 Jerry
  members: ['Jerry'],
  // 对话名称
  name: 'Tom & Jerry',
});.catch(console.error);
```
```objc
// 创建与 Jerry 之间的对话
[tom createConversationWithName:@"Tom & Jerry" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {

}];
```
```java
tom.createConversation(Arrays.asList("Jerry"), "Tom & Jerry", null, 
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
var conversation = await tom.CreateConversationAsync("Jerry",name:"Tom & Jerry");
```

`createConversation` 这个接口会直接创建一个对话，并且该对话会被存储在 `_Conversation` 表内，可以打开控制台->存储查看数据。

`createConversation` 的参数详解:

{{ docs.langSpecStart('js') }}

1. `members` : 字符串数组，必要参数，对话的初始成员(clientId)列表，默认包含当前 clientId
2. `name`: 字符串，可选参数，对话的名字，如果不传默认值为 null
3. `unique`： bool 类型，可选参数，是否唯一对话，当其为 true 时，如果当前已经有相同成员的对话存在则返回该对话，否则会创建新的对话

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('objc') }}

1. name － 表示对话名字，可以指定任意有意义的名字，也可不填。
2. clientIds － 表示对话初始成员，可不填。如果填写了初始成员，则 LeanCloud 云端会直接给这些成员发出邀请，省掉再专门发一次邀请请求。
3. attributes － 表示额外属性，Dictionary，支持任意的 key/value，可不填。
4. options － 对话选项：
  - AVIMConversationOptionTransient：聊天室，具体可以参见创建聊天室；
  - AVIMConversationOptionNone：普通对话；
  - AVIMConversationOptionTemporary：临时对话；
  - AVIMConversationOptionUnique：根据成员（clientIds）创建原子对话。如果没有这个选项，服务端会为相同的 clientIds 创建新的对话。clientIds 即 _Conversation 表的 m 字段。
  - callback － 结果回调，在操作结束之后调用，通知开发者成功与否。

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

1. members - 对话的成员
2. name - 对话的名字
3. attributes - 对话的额外属性
4. isTransient - 是否是暂态会话
5. isUnique - 如果已经存在符合条件的会话，是否返回已有回话 为 false 时，则一直为创建新的回话 为 true 时，则先查询，如果已有符合条件的回话，则返回已有的，否则，创建新的并返回 为 true      时，仅 members 为有效查询条件
6. callback - 结果回调函数

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

1. `members` : 字符串数组，必要参数，对话的初始成员(clientId)列表，默认包含当前 clientId
2. `name`: 字符串，可选参数，对话的名字，如果不传默认值为 null
3. `isSystem`: bool 值，可选参数，是否是服务号
4. `isTransient`:bool 值，可选参数，是否为聊天室
5. `isUnique`： bool 类型，可选参数，是否唯一对话，当其为 true 时，如果当前已经有相同成员的对话存在则返回该对话，否则会创建新的对话
6. `options`：字典类型，可选参数，额外的自定义属性

{{ docs.langSpecEnd('cs') }}

创建对话之后，可以获取对话的内置属性，云端会为每一个对话生成一个全局唯一的 ID 属性： `Conversation.id`，它是查询对话和获取对话时常用的匹配字段。

### 4.发送消息

对话已经创建成功了，接下来 Tom 可以发出第一条文本消息了：

```js
var { TextMessage } = require('leancloud-realtime');
conversation.send(new TextMessage('Jerry，起床了！')).then(function(message) {
  console.log('Tom & Jerry', '发送成功！');
}).catch(console.error);
```
```objc
[conversation sendMessage:[AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
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
await conversation.SendAsync(textMessage);
```

`conversation.send` 接口实现的功能就是向对话中发送一条消息。

Jerry 只要在线他就会收到消息，至此 Jerry 还没有登场，那么他怎么接收消息呢？

### 5.接收消息

我们在另一个设备上启动应用，然后使用 Jerry 当做 `clientId` 创建 `AVIMClient` 和 建立连接（参照前两章节 Tom 的示例代码）:

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
}).catch(console.error);
```
```objc
jerry = [[AVIMClient alloc] initWithClientId:@"Jerry"];
[jerry openWithCallback:^(BOOL succeeded, NSError *error) {}];
```
```java
//Jerry登录
AVIMClient jerry = AVIMClient.getInstance("Jerry");
jerry.open(new AVIMClientCallback(){

  @Override
  public void done(AVIMClient client,AVIMException e){
      if(e==null){
        ...//登录成功后的逻辑
      }
  }
});
```
```cs
var realtime = new AVRealtime('your-app-id','your-app-key');
var jerry = await realtime.CreateClientAsync('Jerry');
```

紧接着让 Jerry 开始订阅对话加入的事件通知：

```js
// 当前用户被添加至某个对话
jerry.on(Event.INVITED, function invitedEventHandler(payload, conversation) {
    console.log(payload.invitedBy, conversation.id);
});
```
```objc
jerry.delegate = self;
-(void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"当前 ClientId(Jerry) 被 %@ 邀请，加入了对话",clientId]);
}
```
```java
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  @Override
  public void onInvited(AVIMClient client, AVIMConversation conversation, String invitedBy) {
    // 当前 ClientId(Jerry) 被邀请到对话，执行此处逻辑
  }
}
AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
```
```cs
var jerry =await realtime.CreateClientAsync("Jerry");
jerry.OnInvited += (sender, args) =>
{
  var invitedBy = args.InvitedBy;
  var conversationId = args.ConversationId;
};
```

为 Jerry 添加了加入对话的事件订阅之后，继续为 Jerry 订阅消息接收的事件：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {

    // 当前用户收到了某一条消息
    jerry.on(Event.MESSAGE, function(message, conversation) {
        console.log('Message received: ' + message.text);
    });
}).catch(console.error);
```
```objc
jerry.delegate = self;
#pragma mark - AVIMClientDelegate
// 接收消息的回调函数
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // Jerry，起床了！
}
```
```java
public static class CustomMessageHandler extends AVIMMessageHandler{
   //接收到消息后的处理逻辑 
   @Override
   public void onMessage(AVIMMessage message,AVIMConversation conversation,AVIMClient client){
     if(message instanceof AVIMTextMessage){
       Log.d(((AVIMTextMessage)message).getText());// Jerry，起床了
     }
   }
 }

AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
```
```cs
jerry.OnMessageReceived += Jerry_OnMessageReceived;
private void Jerry_OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMTextMessage)
    {
        var textMessage = (AVIMTextMessage)e.Message;
        // textMessage.ConversationId 是该条消息所属于的对话 Id
        // textMessage.TextContent 是该文本消息的文本内容
        // textMessage.FromClientId 是消息发送者的 client Id
    }
}
```

而当 Tom 创建了对话之后，Jerry 会这一端会立即触发 `INVITED`（更多关于 `INVITED` 的描述在[成员变更的事件通知总结](#成员变更的事件通知总结)），此时客户端可以做出一些 UI 展示，引导用户加载聊天的界面，紧接着 Tom 发送了消息，则会触发 Jerry `MESSAGE`，这个时候就可以直接在聊天界面的消息列表里面渲染这条消息了。

对应的时序图如下:


```seq
Tom->Cloud: 1.Tom 将 Jerry 加入对话
Cloud-->Jerry: 2.下发通知：你被邀请加入对话
Jerry-->UI: 3.加载聊天的 UI 界面
Tom->Cloud: 4.发送消息
Cloud-->Jerry: 5.下发通知：接收到有新消息
Jerry-->UI: 6.显示收到的消息内容
```

## 多人群聊

多人群聊与单聊十分接近，在一个现有对话上加入更多的成员即可转化为群聊：

### 1.创建多人群聊对话

多人群聊的对话可以通过如下两种方式实现：

1. **向现有对话中添加更多成员**
2. **重新创建一个对话，并在创建的时候指定至少 2 名成员**


首先我们实现第一种方式： **向现有对话中添加更多成员**，将其转化成一个群聊。

Tom 继续添加 Mary 到对话中：

```js
tom.getConversation(CONVERSATION_ID).then(function(conversation) {
  return conversation.add(['Mary']);
}).then(function(conversation) {
  console.log('添加成功', conversation.members);
  // 此时对话成员为: ['Mary', 'Tom', 'Jerry']
}).catch(console.error.bind(console));
```
```objc
AVIMConversationQuery *query = [self.client conversationQuery];
[query getConversationById:@"CONVERSATION_ID" callback:^(AVIMConversation *conversation, NSError *error) {
    // Jerry 邀请 Mary 到会话中
    [conversation addMembersWithClientIds:@[@"Mary"] callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"邀请成功！");
        }
    }];
}];
```
```java
AVIMClient jerry = AVIMClient.getInstance("Jerry");
final AVIMConversation conv = client.getConversation("CONVERSATION_ID");
conv.addMembers(Arrays.asList("Mary"), new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      // 添加成功
    }
});
```
```cs
var tom = await realtime.CreateClientAsync();
var conversation = await tom.GetConversationAsync("CONVERSATION_ID");
await tom.InviteAsync(conversation, "Mary");
```

而 Jerry 添加如下代码也能随时知道当前对话还有谁加进来了：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
    // 有用户被添加至某个对话
    jerry.on(Event.MEMBERS_JOINED, function membersjoinedEventHandler(payload, conversation) {
        console.log(payload.members, payload.invitedBy, conversation.id);
    });
  });
}).catch(console.error);
```
```objc
-(void)maryNoticedWhenJerryInviteMary{
    // Mary 创建一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Mary"];
    self.client.delegate = self;

    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // 登录成功
    }];
}
#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 加入到对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
public static class CustomMessageHandler extends AVIMMessageHandler {
    @Override
    public void onMemberJoined(AVIMClient client, AVIMConversation conversation,
        List<String> members, String invitedBy) {
        // 手机屏幕上会显示一小段文字：Mary 加入到 551260efe4b01608686c3e0f ；操作者为：Tom
        Toast.makeText(AVOSCloud.applicationContext,
          members + "加入到" + conversation.getConversationId() + "；操作者为： "
              + invitedBy, Toast.LENGTH_SHORT).show();
    }
}
AVIMMessageManager.registerDefaultMessageHandler(new CustomMessageHandler());
```
```cs
jerry.OnMembersJoined += OnMembersJoined;
private void OnMembersJoined(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人, e.ConversationId 是该项操作针对的对话 Id
    Debug.Log(string.Format("{0} 邀请了 {1} 加入了 {2} 对话", e.InvitedBy,e.JoinedMembers, e.ConversationId));
}
```

{{ docs.langSpecStart('js') }}

其中 payload 参数包含如下内容：

1. `members`: 字符串数组, 被添加的用户 clientId 列表
2. `invitedBy`	字符串, 邀请者 clientId

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('cs') }}

其中 `AVIMOnInvitedEventArgs` 参数包含如下内容：
1. `InvitedBy`: 改操作的发起者
2. `JoinedMembers`：此次加入对话的包含的成员列表
3. `ConversationId`：被操作的对话

{{ docs.langSpecEnd('cs') }}

如下时序图可以简单的概括上述流程：

```seq
Tom->Cloud: 1.添加 Mary
Cloud->Tom: 2.下发通知：Mary 被你邀请加入了对话
Cloud-->Mary: 2.下发通知：你被 Tom 邀请加入对话
Cloud-->Jerry: 2.下发通知: Mary 被 Tom 邀请加入了对话
```

而 Mary 如果在另一台设备上登录了，Ta 可以参照[一对一单聊](#一对一单聊)中 Jerry 的做法监听 `INVITED` 事件，就可以自己被邀请到了一个对话当中。

而**重新创建一个对话，并在创建的时候指定至少为 2 的成员数量**的方式如下：

```js
tom.createConversation({
  // 创建的时候直接指定 Jerry 和 Mary 一起加入多人群聊，当然根据需求可以添加更多成员
  members: ['Jerry','Mary'],
  // 对话名称
  name: 'Tom & Jerry & friends',
}).catch(console.error);
```
```objc
// Jerry 建立了与朋友们的会话
NSArray *friends = @[@"Jerry", @"Mary"];
[tom createConversationWithName:@"Tom & Jerry & friends" clientIds:friends callback:^(AVIMConversation *conversation, NSError *error) {
    if (!error) {
        NSLog(@"创建成功");
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
var conversation = await tom.CreateConversationAsync(new string[]{ "Jerry","Mary" },"Tom & Jerry & friends");
```

### 2.群发消息

群聊和单聊一样，对话中的成员都会接收到对话内产生的消息。

Tom 向群聊对话发送了消息：

```js
conversation.send(new TextMessage('大家好，欢迎来到我们的群聊对话'));
```
```objc
[conversation sendMessage:[AVIMTextMessage messageWithText:@"大家好，欢迎来到我们的群聊对话！" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVIMTextMessage msg = new AVIMTextMessage();
msg.setText("大家好，欢迎来到我们的群聊对话！");
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
await conversation.SendAsync("大家好，欢迎来到我们的群聊对话！");
```

而 Jerry 和 Mary 都会有 `Event.MESSAGE` 事件触发，利用它来接收群聊消息，这一点与一对一单聊没区别。


### 将他人踢出对话

刚才的代码演示的是添加新成员，而对应的删除成员的代码如下：

Tom 又把 Mary 踢出对话了:

```js
conversation.remove(['Mary']).then(function(conversation) {
  console.log('移除成功', conversation.members);
}).catch(console.error.bind(console));
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

执行了这段代码之后会触发如下流程：

```seq
Tom->Cloud: 1. 对话中移除 Mary
Cloud-->Mary: 2. 下发通知：你被 Tom 从对话中剔除了
Cloud-->Jerry: 2. 下发通知：Mary 被 Tom 移除
Cloud-->Tom: 2. 下发通知：Mary 被移除了对话 
```


### 加入对话

紧接着 William 通过 `Conversation.id` 他自己主动加入对话：

注意，如下代码运行的前提有几个前提：

1. William 需要参照前面章节里面的创建了一个 `IMClient` 的实例，并且确保已经与云端建立连接。
2. `590aa654fab00f41dda86f51` 是一个在 `_Conversation` 表里面真是存在的对话 Id。

```js
william.getConversation('590aa654fab00f41dda86f51').then(function(conversation) {
  return conversation.join();
}).then(function(conversation) {
  console.log('加入成功', conversation.members);
  // 加入成功 ['William', 'Tom', 'Jerry']
}).catch(console.error.bind(console));
```
```objc
AVIMConversationQuery *query = [william conversationQuery];
[query getConversationById:@"590aa654fab00f41dda86f51" callback:^(AVIMConversation *conversation, NSError *error) {
    [conversation joinWithCallback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"加入成功！");
        }
    }];
}];
```
```java
AVIMClient william = AVIMClient.getInstance("William");
AVIMConversation conv = client.getConversation("590aa654fab00f41dda86f51");
conv.join(new AVIMConversationCallback(){
    @Override
    public void done(AVIMException e){
        if(e==null){
        //加入成功
        }
    }
});
```
```cs
await william.JoinAsync("590aa654fab00f41dda86f51");
```

执行了这段代码之后会触发如下流程：

```seq
William->Cloud: 1.加入对话
Cloud-->William: 2. 下发通知: 你已加入对话
Cloud-->Tom: 2. 下发通知：William 加入对话
Cloud-->Jerry: 2. 下发通知：William 加入对话
```

其他人则通过订阅 `MEMBERS_JOINED` 来接收 William 加入对话的通知:

```js
jerry.on(Event.MEMBERS_JOINED, function membersJoinedEventHandler(payload, conversation) {
    console.log(payload.members, payload.invitedBy, conversation.id);
});
```
```objc
- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 加入到对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
@Override
public void onMemberJoined(AVIMClient client, AVIMConversation conversation,
    List<String> members, String invitedBy) {
    // 手机屏幕上会显示一小段文字：Tom 加入到 551260efe4b01608686c3e0f ；操作者为：Tom
    Toast.makeText(AVOSCloud.applicationContext,
      members + "加入到" + conversation.getConversationId() + "；操作者为： "
          + invitedBy, Toast.LENGTH_SHORT).show();
}

```
```cs
jerry.OnMembersJoined += OnMembersJoined;
private void OnMembersJoined(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人, e.ConversationId 是该项操作针对的对话 Id
    Debug.Log(string.Format("{0} 加入了 {1} 对话，操作者是 {2}",e.JoinedMembers, e.ConversationId, e.InvitedBy));
}
```
### 退出对话

Jerry 不想继续呆在这个对话里面了，他选择退出对话:

```js
conversation.quit().then(function(conversation) {
  console.log('退出成功', conversation.members);
  // 退出成功 ['William', 'Tom']
}).catch(console.error.bind(console));
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
      //退出成功
      }
    }
});
```
```cs
jerry.LeaveAsync(conversation);
// 或者传入 conversation id
jerry.LeaveAsync("590aa654fab00f41dda86f51");
```

执行了这段代码之后会触发如下流程：

```seq
Jerry->Cloud: 1. 离开对话
Cloud-->Jerry: 2. 下发通知：你已离开对话
Cloud-->Mary: 2. 下发通知：Jerry 已离开对话
Cloud-->Tom: 2. 下发通知：Jerry 已离开对话
```

而其他人需要通过订阅 `MEMBERS_LEFT` 来接收 Jerry 离开对话的事件通知:

```js
mary.on(Event.MEMBERS_LEFT, function membersLeftEventHandler(payload, conversation) {
    console.log(payload.members, payload.invitedBy, conversation.id);
});
```
```objc
// mary 登录之后，jerry 退出了对话，在 mary 所在的客户端就会激发以下回调
-(void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray *)clientIds byClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 离开了对话， 操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```
```java
@Override
public void onMemberLeft(AVIMClient client, AVIMConversation conversation, List<String> members,
    String kickedBy) {
    // 有其他成员离开时，执行此处逻辑
}
```
```cs
mary.OnMembersLeft += OnMembersLeft;
private void OnMembersLeft(object sender, AVIMOnMembersLeftEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人, e.ConversationId 是该项操作针对的对话 Id
    Debug.Log(string.Format("{0} 离开了 {1} 对话，操作者是 {2}",e.JoinedMembers, e.ConversationId, e.InvitedBy));
}
```

### 成员变更的事件通知总结

前面的时序图和代码针对成员变更的操作做了逐步的分析和阐述，为了确保开发者能够准确的使用事件通知，如下表格做了一个统一的归类和划分:

假设 Tom 和 Jerry 已经在对话内了：

操作|Tom|Jerry|Mary|William
--|--|--|--
Tom 添加 Mary|`MEMBERS_JOINED`|`MEMBERS_JOINED`|`INVITED`|/
Tom 剔除 Mary|`MEMBERS_LEFT`|`MEMBERS_LEFT`|`KICKED`|/
William 加入|`MEMBERS_JOINED`|`MEMBERS_JOINED`|/|`MEMBERS_JOINED`
Jerry 主动退出|`MEMBERS_LEFT`|`MEMBERS_LEFT`|/|`MEMBERS_LEFT`


### 其他聊天模式

即时通讯服务提供的功能就是让一个客户端与其他客户端进行在线的消息互发，对应不同的使用场景除去刚才前两章节介绍的[一对一单聊](#一对一单聊)和[多人群聊](#多人群聊)之外,即时通讯也支持但不限于如下中流行的通讯模式：

- 唯一聊天室
- 开放聊天室，例如直播中的弹幕聊天室。
- 服务号，例如公众号，游戏 GM 在线群发通知


关于上述的几种场景对应的实现，请参阅[进阶功能#对话类型](realtime-guide-intermediate.html#对话类型)。

## 对话

一个聊天应用在首页往往会展示当前用户加入的，最活跃的几个对话。

### 获取对话列表

```js
tom.getQuery().containsMembers(['Tom']).find().then(function(conversations) {
  // 默认按每个对话的最后更新日期（收到最后一条消息的时间）倒序排列
  conversations.map(function(conversation) {
    console.log(conversation.lastMessageAt.toString(), conversation.members);
  });
}).catch(console.error.bind(console));
```
```objc
// Tom 构建一个查询
AVIMConversationQuery *query = [tom conversationQuery];
// 执行查询
[query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
    NSLog(@"找到 %ld 个对话！", [conversations count]);
}];
```
```java
AVIMConversationsQuery query = client.getConversationsQuery();
query.findInBackground(new AVIMConversationQueryCallback(){
    @Override
    public void done(List<AVIMConversation> conversations,AVIMException e){
      if(e==null){
      //conversations 就是获取到的 conversation 列表
      //注意：按每个对话的最后更新日期（收到最后一条消息的时间）倒序排列
      }
    }
});      
```
```cs
var query = tom.GetQuery().WhereContainedIn("m","Tom");
await query.FindAsync();
```

上述代码默认返回最近活跃的 10 个对话，若要更改返回对话的数量，请设置 limit 值。

```js
query.limit(20);
```
```objc
query.limit = 20;
```
```java
query.limit(20);
```
```cs
query.Limit(20);
```

### 根据关键字查询

在某些场景下，我们需要根据对话的一些特性来做查找，比如我要查找名字里包含 NBA 的对话:

```js
query.contains('name', 'NBA');
```
```objc
[query whereKey:@"name" containsString:@"NBA"];
```
```java
query.whereContains("name", "NBA");
```
```cs
query.WhereContains("name", "NBA");
```

### 更多查询方式

关于上述的几种场景对应的实现，请参阅[进阶功能#对话的查询](realtime-guide-intermediate.html#对话的查询)

## 消息

消息的类型有很多种，使用最多的就是文本消息，其次是图像消息，还有一些短语音/短视频消息，文本消息和其他消息类型有本质的区别:

<div class="callout callout-info">文本消息发送的就是本身的内容，而其他多媒体消息，例如一张图片实际上发送的是一个指向图像的链接，而图像本身的物理文件内容会被 SDK 持久化存储在云端文件存储服务中</div>

### 图像消息

#### 发送图像文件

我们从发送一张图片消息的生命周期的时序图来了解整个过程：

```seq
Tom-->source: 1. 获取图像实体内容
Tom->Cloud: 2. 调用发送图像消息的接口
Cloud-->AVFile: 3. SDK 后台上传文件到 AVFile 表
AVFile-->Tom: 4. 返回图像的云端地址
Tom-->Cloud: 5. SDK 将图像消息发送给云端
Cloud->Jerry: 6. 收到图像消息，根据接口获取图像的云端地址，在对话框里面做 UI 展现
```

图解：
1. source 可能是来自于 localStorage/camera， 表示图像的来源可以是本地存储例如 iPhone 手机的媒体库或者直接调用相机 API 实时地拍照获取的照片。
2. AVFile 是 LeanCloud 提供的文件存储服务对象，详细可以参阅[文件存储 AVFile](storage_overview.html#文件存储 AVFile)

对应的代码并没有时序图那样复杂，因为调用 send 接口的时候，SDK 会自动上传图像，不需要开发者再去关心这一步:

```js
var AV = require('leancloud-storage');
var { ImageMessage } = require('leancloud-realtime-plugin-typed-messages');

var fileUploadControl = $('#photoFileUpload')[0];
var file = new AV.File('avatar.jpg', fileUploadControl.files[0]);
file.save().then(function() {
  var message = new ImageMessage(file);
  message.setText('发自我的小米');
  message.setAttributes({ location: '旧金山' });
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
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
AVFile file =new AVFile("萌妹子","http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", null);
AVIMImageMessage m = new AVIMImageMessage(file);
m.setText("萌妹子一枚");
// 创建一条图片消息
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
AVFile file =new AVFile("萌妹子","http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", null);
AVIMImageMessage m = new AVIMImageMessage(file);
m.setText("萌妹子一枚");
// 创建一条图片消息
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
await conversation.SendImageAsync("http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", "Satomi_Ishihara", "萌妹子一枚");
```

#### 接收图像消息

对话中的其他成员修改一下接收消息的事件订阅逻辑，根据消息类型来做不同的 UI 展现：

```js
var { Event, TextMessage } = require('leancloud-realtime');
var { ImageMessage } = require('leancloud-realtime-plugin-typed-messages');

client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
   var file;
   switch (message.type) {
      case ImageMessage.TYPE:
        file = message.getFile();
        console.log('收到图像消息，url: ' + file.url());
        break;
   }
}
```
```
```

### 多媒体消息

与图像消息一样，其他多媒体消息都拥有如下两种用法：

- 如果发送的是多媒体消息本身的物理文件，那么它的的内容会先试用 `AVFile` 存储在云端，然后发送云端链接到对话当中，而在接收方的客户端只要对链接做一些处理，根据消息的类型不同做不同的 UI 展现，例如语音消息可以做成一个小按钮，用户点击之后就播放语音，而视频消息则是一张视频截图，用户点击之后播放视频，诸如此类。
- 如果是一个网络连接地址，它的物理内容并不会被存放于 `AVFile` 表内，而是直接将其转化成一个消息，发送出去


### 其他类型消息

更多消息类型请点击[进阶功能#消息类型](realtime-guide-intermediate.html#消息类型)

## 消息记录

消息记录默认会在云端保存 **180** 天， SDK 提供了多种方式来获取到本地。

iOS 和 Android SDK 分别提供了内置的消息缓存机制，减少客户端对云端消息记录的查询次数，并且在离线情况下，也能查询到准确的消息记录。

### 获取对话的全部消息记录

如下代码可以获取一个对话最近的 10 条消息，注意，返回结果是按照时间**由新到旧**排序的：

```js
conversation.queryMessages({
  limit: 10, // limit 取值范围 1~1000，默认 20
}).then(function(messages) {
  // 最新的十条消息，按时间增序排列
}).catch(console.error.bind(console));
```

而如果想继续拉取更早的消息记录，可以使用如下代码：

```js
// 创建一个迭代器，每次获取 10 条历史消息
var messageIterator = conversation.createMessagesIterator({ limit: 10 });
// 第一次调用 next 方法，获得前 10 条消息，还有更多消息，done 为 false
messageIterator.next().then(function(result) {
  // result: {
  //   value: [message1, ..., message10],
  //   done: false,
  // }
}).catch(console.error.bind(console));
// 第二次调用 next 方法，获得第 11 ~ 20 条消息，还有更多消息，done 为 false
messageIterator.next().then(function(result) {
  // result: {
  //   value: [message11, ..., message20],
  //   done: false,
  // }
}).catch(console.error.bind(console));
```

持续调用 `messageIterator.next()` 可以获取更多的聊天记录。

### 进入对话之后显示最近的聊天记录

在客户端加载对话界面之后，第一个操作就是去加载最近的几条聊天记录（一般情况下都不会太多，比如我们设定为 10 条），那么如下的代码可以实现这个功能：

假设我们有一个叫做 messageList 的控件，需要为它绑定消息列表,

```js
conversation.queryMessages({
  limit: 10, // limit 取值范围 1~1000，默认 20
}).then(function(messages) {
  // 最新的十条消息，按时间增序排列
  messageList.data = messages;
  //sdk 已经为 messages 做好了排序，直接绑定即可
}).catch(console.error.bind(console));
```

### 按照消息类型获取

如下代码的功能是：获取所有的图像消息：

```js
conversation.queryMessages({ type: ImageMessage.TYPE }).then(messages => {
  console.log(messages);
}).catch(console.error);
```

如要获取更多图像消息，可以效仿前一章节中使用 `conversation.createMessagesIterator` 接口生成迭代器来查询更多图像消息。

### 更多的获取方式

更多消息类型请点击[进阶功能#消息记录](realtime-guide-intermediate.html#消息记录)

## 客户端事件与网络状态响应

{{ docs.note("注意：在网络中断的情况下，所有的消息收发和对话操作都会失败。开发者应该监听与网络状态相关的事件并更新 UI，以免影响用户的使用体验。") }}

当网络连接出现中断、恢复等状态变化时，SDK 会在 Realtime 实例上派发以下事件：

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
  console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
});
realtime.on(Event.RETRY, function(attempt) {
  console.log('正在进行第' + (attempt + 1) + '次重连');
});
realtime.on(Event.RECONNECT, function() {
  console.log('与服务端连接恢复');
});
```

{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "进阶功能", href: "realtime-guide-intermediate.html"}, 
  { title: "高阶技巧", href: "/realtime-guide-senior.html"}])
}}
<!-- { title: "基础入门", href: "realtime-guide-beginner.html" }, -->