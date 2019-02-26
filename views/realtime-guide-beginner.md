{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 从简单的单聊、群聊、收发图文消息开始

## 本章导读

在很多产品里面，都存在实时沟通的需求，例如：
- 员工与客户之间的实时信息交流，如房地产行业经理人与客户的沟通，商业产品客服与客户的沟通，等等。
- 企业内部沟通协作，如内部的工作流系统、文档/知识库系统，如果能支持实时讨论可能就会让工作效率和效果都得到极大提升。
- 直播互动，不论是文体行业的大型电视节目互动、重大赛事直播，娱乐行业的游戏现场直播、网红直播，还是教育行业的在线课程直播、KOL 知识分享，在吸引超大规模用户参与的同时，做好内容审核管理，也总是存在很多的技术挑战。
- 应用内社交，社交产品要能长时间吸引住用户，除了实时性之外，还需要更多的创新玩法，对于标准化通讯服务会存在更多的功能扩展需求。

我们计划根据需求的共通性和技术实现的难易程度不同，分为多篇文档来逐层深入地讲解如何利用 LeanCloud 即时通讯服务实现上述场景需求，希望开发者最终顺利完成产品开发的同时，也对我们服务的体系结构有一个清楚的了解，以便于后期的产品维护和功能扩展。

在第一篇文档里，我们会从实现简单的单聊/群聊开始，演示创建和加入对话、发送和接收富媒体消息的流程，同时让大家了解历史消息云端保存与拉取的机制，希望可以满足在大部分成熟产品中集成一个简单的聊天页面的需求。

在阅读本章之前，如果您还不太了解 LeanCloud 即时通讯服务的总体架构，建议先阅读[即时通讯服务总览](realtime_v2.html)。

另外，如果您还没有下载对应开发环境（语言）的 SDK，请参考[SDK 安装指南](start.html)完成 SDK 安装与初始化。

## 一对一单聊

在开始讨论聊天之前，我们需要介绍一下在即时通讯服务中的 `IMClient` 对象：

> `IMClient` 对应实体的是一个用户，它代表着一个用户以客户端的身份登录到了即时通讯的系统。

具体可以参考[服务总览中的说明](realtime_v2.html#hash933999344)。

### 1. 创建 `IMClient`

假设我们产品中有一个叫「Tom」的用户，首先我们在 SDK 中创建出一个与之一一对应的 `IMClient`:

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


### 2. 登录 LeanCloud 即时通讯服务器

创建好了「Tom」这个用户对应的 `IMClient` 实例之后，我们接下来需要让该实例登录 LeanCloud 云端（建立连接），只有登录之后客户端才能开始正常的收发消息，也才能接收到 LeanCloud 云端下发的各种事件通知。

这里需要说明一点，JavaScript 和 C#(Unity3D) SDK 创建 `IMClient` 成功同时意味着连接已经建立，而 iOS 和 Android SDK 则需要调用开发者手动按照如下方法进行登录：

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

### 3. 创建对话 `Conversation`

用户登录之后，要开始与其他人聊天，需要先创建一个「对话」。

> 对话(`Conversation`)对话是消息的载体，所有消息的目标都是对话，而所有在对话中的成员都会接收到对话内产生的消息。

假设 Tom 已经完成了即时通讯服务登录，他要给 Jerry 发送消息，他需要创建一个 `Conversation` 来发送消息给 Jerry：

```js
// 创建与 Jerry 之间的对话
return tom.createConversation({
  // 指定对话的成员除了当前用户 Tom(SDK 会默认把当前用户当做对话成员)之外，还有 Jerry
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

`conversation.send` 接口实现的功能就是向对话中发送一条消息，同一对话中其他在线成员会立刻收到此消息。

从 Jerry 的角度来看，如果他希望在界面上展示出来这一条新消息，那么他那一端该怎么来处理呢？

### 5. 接收消息

在另一个设备上，我们使用 Jerry 当做 `clientId` 创建一个 `AVIMClient` 并登录即时通讯服务（与前两节 Tom 的处理流程一样）:

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

Jerry 是消息的被动接收方，他不需要再次主动创建与 Tom 的对话，可能也无法知道要提前加入 Tom 前面创建的对话，Jerry 端需要通过设置即时通讯客户端事件的回调函数，才能获取到 Tom 那边操作的通知。

即时通讯客户端事件回调能处理多种服务端通知，这里我们先关注这里会出现的两个事件：
- 用户被邀请进入某个对话的通知事件。Tom 在创建和 Jerry 的单聊对话的时候，Jerry 这边就能立刻收到一条通知，显示类似于「Tom 邀请你加入了一个对话」的信息。
- 用户收到新消息的通知。在 Tom 发出「Jerry，起床了！」这条消息之后，Jerry 这边也能立刻收到一条新消息到达的通知，能获悉消息的具体数据以及对话、发送者等上下文信息。

现在，我们看看具体应该如何响应服务端发过来的通知。Jerry 端首先处理对话加入的事件通知：

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

然后处理新消息到达的事件通知：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {

    // 当前用户收到了某一条消息，可以通过响应 Event.MESSAGE 这一事件来处理。
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

Jerry 端实现了上面两个事件通知函数之后，就可以顺利完成消息接收方的开发了。我们现在可以回顾一下 Tom 和 Jerry 发送第一条消息的过程中，两方完整的处理时序图：

```seq
Tom->Cloud: 1.Tom 将 Jerry 加入对话
Cloud-->Jerry: 2.下发通知：你被邀请加入对话
Jerry-->UI: 3.加载聊天的 UI 界面
Tom->Cloud: 4.发送消息
Cloud-->Jerry: 5.下发通知：接收到有新消息
Jerry-->UI: 6.显示收到的消息内容
```

在聊天过程中，接收方除了响应新消息到达通知之外，还需要响应多种对话成员变动通知，例如「新用户 XX 被 XX 邀请加入了对话」、「用户 XX 主动退出了对话」、「用户 XX 被管理员剔除出对话」，等等。LeanCloud 云端会实时下发这些事件通知给客户端，具体细节可以参考后续章节：[6. 成员变更的事件通知总结](#6.成员变更的事件通知总结)。


## 多人群聊

上面我们讨论了一对一单聊的实现流程，假设我们还需要实现一个「同学群」、「朋友群」、「同事群」的多人聊天。接下来我们就看看怎么完成这一功能的集成。
多人群聊与单聊的流程十分接近，主要差别在于对话内成员数量的多少。

多人群聊的对话可以通过如下两种方式实现：

1. **在创建对话的时候初始指定更多的成员**
2. **在一个现有对话上邀请加入更多的成员**

### 1. 创建多人群聊对话

在 Tom 和 Jerry 的对话中，假设后来 Tom 又希望把 Mary 也拉进来，他可以使用如下的办法：

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

而 Jerry 端增加「新成员加入」的事件通知处理函数，就可以及时获知 Mary 被 Tom 邀请加入当前对话了：

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

这一流程的时序图如下：

```seq
Tom->Cloud: 1.添加 Mary
Cloud->Tom: 2.下发通知：Mary 被你邀请加入了对话
Cloud-->Mary: 2.下发通知：你被 Tom 邀请加入对话
Cloud-->Jerry: 2.下发通知: Mary 被 Tom 邀请加入了对话
```

而 Mary 端如果要能加入到 Tom 和 Jerry 的对话中来，Ta 可以参照[一对一单聊](#一对一单聊) 中 Jerry 侧的做法监听 `INVITED` 事件，就可以自己被邀请到了一个对话当中。

而**重新创建一个对话，并在创建的时候指定至少为 2 的成员数量**的方式如下：

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

### 2. 群发消息

多人群聊中一个成员发送的消息，会实时同步到所有其他在线成员，其处理流程与单聊中 Jerry 接收消息的过程是一样的。

例如，Tom 向群聊对话发送了消息：

```js
conversation.send(new TextMessage('大家好，欢迎来到我们的群聊对话'));
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

而 Jerry 和 Mary 都会有 `Event.MESSAGE` 事件触发，利用它来接收群聊消息，并更新产品 UI。


### 3. 将他人踢出对话

假设后来 Mary 出言不逊，惹恼了群主 Tom，Tom 直接把 Mary 踢出对话群了。
踢人的方法也很简单，其函数如下:

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

Tom 端执行了这段代码之后会触发如下流程：

```seq
Tom->Cloud: 1. 对话中移除 Mary
Cloud-->Mary: 2. 下发通知：你被 Tom 从对话中剔除了
Cloud-->Jerry: 2. 下发通知：Mary 被 Tom 移除
Cloud-->Tom: 2. 下发通知：Mary 被移除了对话 
```

### 4. 用户主动加入对话

假设 Tom 告诉了 William，说他和 Jerry 有一个很好玩的聊天群，并且把群的 id（或名称）告知给了 William。William 也很想进入这个群看看他们究竟在聊什么，他也可以自己主动加入对话：


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

注意，如下代码运行的前提有几个前提：

1. William 需要参照前面章节里面的创建了一个 `IMClient` 的实例，并且确保已经与云端建立连接。
2. `590aa654fab00f41dda86f51` 是一个在 `_Conversation` 表里面真是存在的对话 Id，也就是 Tom 主动告诉 William 的对话 id。当然，实际场景中 Tom 也可以通过告知 William 其他对话属性，让 William 找到对话并加入其中。关于对话的条件查询，可以参看后续章节。

### 5. 用户主动退出对话

假如随着 Tom 邀请进来的人越来越多，Jerry 觉得跟这些人都说不到一块去，他不想继续呆在这个对话里面了，所以选择自己主动退出对话，这时候可以通过如下方式达到目的:

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

执行了这段代码 Jerry 就离开了这个聊天群，此后群里所有的事件 Jerry 都不会再知晓。各个成员接收到的事件通知流程如下：

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

### 6.成员变更的事件通知总结

前面的时序图和代码针对成员变更的操作做了逐步的分析和阐述，为了确保开发者能够准确的使用事件通知，如下表格做了一个统一的归类和划分:

假设 Tom 和 Jerry 已经在对话内了：

操作|Tom|Jerry|Mary|William
--|--|--|--
Tom 添加 Mary|`MEMBERS_JOINED`|`MEMBERS_JOINED`|`INVITED`|/
Tom 剔除 Mary|`MEMBERS_LEFT`|`MEMBERS_LEFT`|`KICKED`|/
William 加入|`MEMBERS_JOINED`|`MEMBERS_JOINED`|/|`MEMBERS_JOINED`
Jerry 主动退出|`MEMBERS_LEFT`|`MEMBERS_LEFT`|/|`MEMBERS_LEFT`


### 7. 更多「对话」类型

即时通讯服务提供的功能就是让一个客户端与其他客户端进行在线的消息互发，对应不同的使用场景除去刚才前两章节介绍的[一对一单聊](#一对一单聊)和[多人群聊](#多人群聊)之外，我们也支持其他形式的「对话」模型：

- 开放聊天室，例如直播中的弹幕聊天室，它与普通的「多人群聊」的主要差别是允许的成员人数以及消息到达的保证程度不一样。
- 服务号，例如在微信里面常见的公众号/服务号，系统全局的广播账号，游戏公会等形式的「群组」，与普通「多人群聊」的主要差别，在于「服务号」是以订阅的形式加入的，也没有成员限制，并且订阅用户和服务号的消息交互是一对一的，一个用户的上行消息不会群发给其他订阅用户。
- 临时对话，例如客服系统中用户和客服人员之间建立的临时通道，它与普通的「一对一单聊」的主要差别在于对话总是临时创建并且不会长期存在，在提升实现便利性的同时，还能降低服务使用成本（能有效减少存储空间方面的花费）。

关于上述的几种场景对应的实现，有兴趣的开发者可以参考下篇文档：[进阶功能#对话类型](realtime-guide-intermediate.html#对话类型)。

## 更多「对话」相关的操作

在一个商业产品里面，终端用户对于聊天「对话」的操作，除了上面所示的加入、退出、监听成员变更通知之外，我们可能还需要实现其他的功能，例如在用户的消息页面展示当前用户加入的、最活跃的几个对话。

### 获取对话列表

`AVIMConversation` 是支持按照各种条件来查询的，要获取当前用户参与的所有对话，我们可以根据成员列表中包含当前用户这一条件来进行查询，代码示例如下：

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

对于某些产品来讲，还需要让终端用户看到很多 TA 根本没有参与的「对话」，例如展示热门的聊天室，或者允许主动查询某些特征的聊天室，并加入其中。
AVIMConversation 的 Query 也是支持组合各种条件的，比如要查找名字里包含 NBA 的对话，示例代码如下:

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

与对话查询相关的更多细节，可参考下一篇文档：[进阶功能#对话的查询](realtime-guide-intermediate.html#对话的查询)

### 如何根据活跃度来展示对话列表

不管是当前用户参与的「对话」列表，还是全局热门的开放聊天室列表展示出来了，我们下一步要考虑的就是如何把最活跃的对话展示在前面，这里我们把「活跃」定义为最近有新消息发出来。我们希望有最新消息的对话可以展示在对话列表的最前面，甚至可以把最新的那条消息也附带显示出来，这时候该怎么实现呢？

我们专门为 `AVIMConversation` 增加了一个动态的属性`lastMessageAt`（对应 `_Conversation` 表里的 `lm` 字段），记录了对话中最后一条消息到达即时通讯云端的时间戳，这一数字是服务器端的时间（精确到秒），所以不用担心客户端时间对结果造成影响。另外，`AVIMConversation`还提供了一个方法可以直接获取最新的一条消息。这样在界面展现的时候，开发者就可以自己决定展示内容与顺序了。

## 文本之外的聊天消息

上面的示例都是发送文本消息，但是实际上可能图片、视频、位置等消息也是非常常见的消息格式，接下来我们就看看如何发送这些富媒体类型的消息。

LeanCloud 即时通讯服务默认支持文本、文件、图像、音频、视频、位置、二进制等不同格式的消息，除了二进制消息之外，普通消息的收发接口都是字符串，但是文本消息和文件、图像、音视频消息有一点区别:

<div class="callout callout-info">文本消息发送的就是本身的内容，而其他的多媒体消息，例如一张图片，实际上即时通讯 SDK 会首先调用 LeanCloud 存储服务的 AVFile 接口，将图像的二进制文件上传到存储服务云端，再把图像下载的 url 放入即时通讯消息结构体中，所以图像消息不过是包含了图像下载链接的固定格式文本消息。</div>

图像等二进制数据不随即时通讯消息直接下发的主要原因在于，LeanCloud 的文件存储服务默认都是开通了 CDN 加速选项的，通过文件下载对于终端用户来说可以有更快的展现速度，同时对于开发者来说也能获得更低的存储成本。

### 图像消息

#### 发送图像文件

即时通讯 SDK 支持直接通过二进制数据，或者本地图像文件的路径，来构造一个图像消息并发送到云端。其流程如下：

```seq
Tom-->source: 1. 获取图像实体内容
Tom-->存储服务: 2. SDK 后台上传文件（AVFile）到云端
存储服务-->Tom: 3. 返回图像的云端地址
Tom-->Cloud: 4. SDK 将图像消息发送给云端
Cloud->Jerry: 5. 收到图像消息，根据接口获取图像的云端地址，在对话框里面做 UI 展现
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
  message.setText('发自我的 Ins');
  message.setAttributes({ location: '旧金山' });
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
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
// 创建一条图片消息
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
// 假设在程序运行目录下有一张图片，Unity/Xamarin 可以参照这种做法通过路径获取图片
// 以下是发送图片消息的快捷用法
using (FileStream fileStream = new FileStream(Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "San_Francisco.png"), FileMode.Open, FileAccess.Read))
{
    await conversation.SendImageAsync("San_Francisco.png", fileStream);
}
// 或者如下比较常规的用法

var imageMessage = new AVIMImageMessage();
imageMessage.File = new AVFile("San_Francisco.png", fileStream);
imageMessage.TextContent = "发自我的 Windows";
await conversation.SendAsync(imageMessage);
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

图像消息的接收机制和之前是一样的，只需要修改一下接收消息的事件回调逻辑，根据消息类型来做不同的 UI 展现即可，例如：

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

```objc
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

    // 消息的 id
    NSString *messageId = imageMessage.messageId;
    // 图像文件的 URL
    NSString *imageUrl = imageMessage.file.url;
    // 发该消息的 ClientId
    NSString *fromClientId = message.clientId;
}
```

```java
AVIMMessageManager.registerMessageHandler(AVIMImageMessage.class,
    new AVIMTypedMessageHandler<AVIMImageMessage>() {
        @Override
        public void onMessage(AVIMImageMessage msg, AVIMConversation conv, AVIMClient client) {
            //只处理 Jerry 这个客户端的消息
            //并且来自 conversationId 为 55117292e4b065f7ee9edd29 的 conversation 的消息    
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
        Console.WriteLine(imageMessage.File.Url);
        // imageMessage.File 是一个 AVFile 对象，更多操作可以参考数据存储里面的文件
    }
}
```

### 发送音频消息/视频/文件

#### 发送流程

对于图像、音频、视频和文件这四种类型的消息，SDK 均采取如下的发送流程：

如果文件是从**客户端 API 读取的数据流 (Stream)**，步骤为：

1. 从本地构造 `AVFile`
2. 调用 `AVFile` 的上传方法将文件上传到云端，并获取文件元信息（MetaData）
3. 把 `AVFile` 的 objectId、URL、文件元信息都封装在消息体内
4. 调用接口发送消息

如果文件是**外部链接的 URL**，则：

1. 直接将 URL 封装在消息体内，不获取元信息，不包含 objectId
1. 调用接口发送消息

以发送音频消息为例，基本流程是：读取音频文件（或者录制音频）> 构建音频消息 > 消息发送。

```js
var AV = require('leancloud-storage');
var { AudioMessage } = require('leancloud-realtime-plugin-typed-messages');

var fileUploadControl = $('#photoFileUpload')[0];
var file = new AV.File('忐忑.mp3', fileUploadControl.files[0]);
file.save().then(function() {
  var message = new AudioMessage(file);
  message.setText('听听人类的神曲');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```objc
NSString *path = [[NSBundle mainBundle] pathForResource:@"忐忑" ofType:@"mp3"];
AVFile *file = [AVFile fileWithName:@"忐忑.mp3" contentsAtPath:path];
AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
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
// 假设在程序运行目录下有一张图片，Unity/Xamarin 可以参照这种做法通过路径获取音频文件
// 以下是发送音频消息的快捷用法
using (FileStream fileStream = new FileStream(Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "忐忑.mp3"), FileMode.Open, FileAccess.Read))
{
    await conversation.SendAudioAsync("忐忑.mp3", fileStream);
}

// 或者如下比较常规的用法
var audioMessage = new AVIMAudioMessage();
audioMessage.File = new AVFile("忐忑.mp3", fileStream);
audioMessage.TextContent = "听听人类的神曲";
await conversation.SendAsync(audioMessage);
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
```objc
AVFile *file = [AVFile fileWithURL:[self @"https://some.website.com/apple.acc"]];
AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"来自苹果发布会现场的录音" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file =new AVFile("apple.acc","来自苹果发布会现场的录音", null);
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
await conversation.SendAudioAsync("https://some.website.com/apple.acc", "apple.acc", "来自苹果发布会现场的录音");
```

### 发送地理位置消息

地理位置消息构建方式如下：

```js
var AV = require('leancloud-storage');
var { LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

var location = new AV.GeoPoint(31.3753285,120.9664658);
var message = new LocationMessage(location);
message.setText('蛋糕店的位置');
conversation.send(message).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
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
final AVIMLocationMessage locationMessage=new AVIMLocationMessage();
// 开发者更可以通过具体的设备的 API 去获取设备的地理位置，此处仅设置了 2 个经纬度常量仅做演示
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
await conv.SendLocationAsync(new AVGeoPoint(31.3753285, 120.9664658));
```

### 接收消息

从前面的例子可以看到，不管消息类型如何，接收消息的流程都是一样的，我们可以在接收消息的事件回调中对于不同类型的消息使用不同处理方式，示例代码如下：

```js
// 在初始化 Realtime 时，需加载 TypedMessagesPlugin
// var realtime = new Realtime({
//   appId: appId,
//   plugins: [TypedMessagesPlugin]
// });
var { Event, TextMessage } = require('leancloud-realtime');
var { FileMessage, ImageMessage, AudioMessage, VideoMessage, LocationMessage } = require('leancloud-realtime-plugin-typed-messages');
// 注册 message 事件的 handler
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  // 请按自己需求改写
  var file;
  switch (message.type) {
    case TextMessage.TYPE:
      console.log('收到文本消息， text: ' + message.getText() + ', msgId: ' + message.id);
      break;
    case FileMessage.TYPE:
      file = message.getFile(); // file 是 AV.File 实例
      console.log('收到文件消息，url: ' + file.url() + ', size: ' + file.metaData('size'));
      break;
    case ImageMessage.TYPE:
      file = message.getFile();
      console.log('收到图片消息，url: ' + file.url() + ', width: ' + file.metaData('width'));
      break;
    case AudioMessage.TYPE:
      file = message.getFile();
      console.log('收到音频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case VideoMessage.TYPE:
      file = message.getFile();
      console.log('收到视频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case LocationMessage.TYPE:
      var location = message.getLocation();
      console.log('收到位置消息，latitude: ' + location.latitude + ', longitude: ' + location.longitude);
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
```objc
// handle  built-in typed message
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // for example: received image message
    if (message.mediaType == kAVIMMessageMediaTypeImage) {
        AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;
        // handle image message.
    } else if(message.mediaType == kAVIMMessageMediaTypeAudio){
        // handle audio message
    } else if(message.mediaType == kAVIMMessageMediaTypeVideo){
        // handle video message
    } else if(message.mediaType == kAVIMMessageMediaTypeLocation){
        // handle location message
    } else if(message.mediaType == kAVIMMessageMediaTypeFile){
        // handle file message
    } else if(message.mediaType == kAVIMMessageMediaTypeText){
        // handle text message
    }
}

// handle customize typed message

// 1. register subclass
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [AVIMCustomMessage registerSubclass];
}
// 2. received message
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (message.mediaType == 1) {
        AVIMCustomMessage *imageMessage = (AVIMCustomMessage *)message;
        // handle image message.
    }
}
```
```java
// 1. register default handler
AVIMMessageManager.registerDefaultMessageHandler(new AVIMMessageHandler(){
    public void onMessage(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
      // receive new-coming message
    }

    public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
      // do something responding of message receipt event.
    }
});
// 2. register typed message handler
AVIMMessageManager.registerMessageHandler(AVIMTypedMessage.class, new AVIMTypedMessageHandler<AVIMTypedMessage>(){
    public void onMessage(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    switch (message.getMessageType()) {
        case AVIMMessageType.TEXT_MESSAGE_TYPE:
        // do something
        AVIMTextMessage textMessage = (AVIMTextMessage)message;
        break;
        case AVIMMessageType.IMAGE_MESSAGE_TYPE:
        // do something
        AVIMImageMessage imageMessage = (AVIMImageMessage)message;
        break;
        case AVIMMessageType.AUDIO_MESSAGE_TYPE:
        // do something
        AVIMAudioMessage audioMessage = (AVIMAudioMessage)message;
        break;
        case AVIMMessageType.VIDEO_MESSAGE_TYPE:
        // do something
        AVIMVideoMessage videoMessage = (AVIMVideoMessage)message;
        break;
        case AVIMMessageType.LOCATION_MESSAGE_TYPE:
        // do something
        AVIMLocationMessage locationMessage = (AVIMLocationMessage)message;
        break;
        case AVIMMessageType.FILE_MESSAGE_TYPE:
        // do something
        AVIMFileMessage fileMessage = (AVIMFileMessage)message;
        break;
        case AVIMMessageType.RECALLED_MESSAGE_TYPE:
        // do something
        AVIMRecalledMessage recalledMessage = (AVIMRecalledMessage)message;
        break;
        default:
        // UnsupportedMessageType
        break;
    }
    }

    public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation, AVIMClient client) {
    // do something responding of message receipt event.
    }
});

public class CustomMessage extends AVIMMessage {
  
    AVIMMessageManager.registerMessageHandler(CustomMessage.class, new MessageHandler<CustomMessage>(){
      public void onMessage(CustomMessage message, AVIMConversation conversation, AVIMClient client) {
        // receive new-coming message
      }

      public void onMessageReceipt(CustomMessage message, AVIMConversation conversation, AVIMClient client){
        // do something responding of message receipt event.
      }
    });
}
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

    }// 这里可以继续添加自定义类型的判断条件
}
```

### 内置消息类型与自定义消息

即时通讯服务内置了如下消息类型用来满足常见的需求：

- `TextMessage` 文本消息
- `ImageMessage` 图像消息
- `AudioMessage` 音频消息
- `VideoMessage` 视频消息
- `FileMessage` 普通文件消息(.txt/.doc/.md 等各种)
- `LocationMessage` 地理位置消息

如果内建的这些消息类型不够用，我们也支持开发者根据自己业务需要增加更多自定义的消息，推荐按照如下需求分级，来选择自定义的方式：

- 通过设置简单 key-value 的自定义属性实现一个消息类型
- 通过继承内置的消息类型添加一些属性
- 完全自由实现一个全新的消息类型


## 聊天历史记录

消息记录默认会在云端保存 **180** 天， 开发者可以通过额外付费来延长这一期限（有需要的用户请联系 support@leancloud.rocks），也可以通过 REST API 将聊天记录同步到自己的服务器上。

SDK 提供了多种方式来拉取历史记录，iOS 和 Android SDK 还提供了内置的消息缓存机制，以减少客户端对云端消息记录的查询次数，并且在设备离线情况下，也能展示出部分数据保障产品体验不会中断。

### 从新到旧获取对话的消息记录

在终端用户进入一个对话的时候，最常见的需求就是由新到旧、以翻页的方式拉取并展示历史消息，这可以通过如下代码实现：

```js
conversation.queryMessages({
  limit: 10, // limit 取值范围 1~1000，默认 20
}).then(function(messages) {
  // 最新的十条消息，按时间增序排列
}).catch(console.error.bind(console));
```
```objc
// 查询对话中最后 10 条消息， limit 取值范围 1~1000，默认 20
[conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
    NSLog(@"查询成功！");
}];
```
```java
//  limit 取值范围 1~1000，默认 20
conv.queryMessages(10, new AVIMMessagesQueryCallback() {
  @Override
  public void done(List<AVIMMessage> messages, AVIMException e) {
    if (e == null) {
      //成功获取最新10条消息记录
    }
  }
});
```
```cs
// limit 取值范围 1~1000，默认 20
var messages = await conversation.QueryMessageAsync(limit: 10);
```

如果想继续拉取更早的消息记录，`queryMessage` 接口也是支持翻页的。LeanCloud 即时通讯云端通过消息的 messageId 和发送时间戳来唯一定位一条消息，因此要从某条消息起拉取后续的 N 条记录，只需要指定起始消息的 `messageId` 和 `发送时间戳` 就可以了，示例代码如下：

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
// 迭代器内部会记录起始消息的数据，无需开发者显示指定
messageIterator.next().then(function(result) {
  // result: {
  //   value: [message11, ..., message20],
  //   done: false,
  // }
}).catch(console.error.bind(console));
```

```objc
// 查询对话中最后 10 条消息
[conversation queryMessagesWithLimit:10 callback:^(NSArray *messages, NSError *error) {
    NSLog(@"查询成功！");
    // 以第一页的最早的消息作为开始，继续向前拉取消息
    AVIMMessage *oldestMessage = [messages firstObject];
    [conversation queryMessagesBeforeId:oldestMessage.messageId timestamp:oldestMessage.sendTimestamp limit:10 callback:^(NSArray *messagesInPage, NSError *error) {
        NSLog(@"查询成功！");
    }];
}];
```

```java
//  limit 取值范围 1~1000，默认 20
conv.queryMessages(10, new AVIMMessagesQueryCallback() {
  @Override
  public void done(List<AVIMMessage> messages, AVIMException e) {
    if (e == null) {
      //成功获取最新10条消息记录
      //返回的消息一定是时间增序排列，也就是最早的消息一定是第一个
      AVIMMessage oldestMessage = messages.get(0);

      conv.queryMessages(oldestMessage.getMessageId(), oldestMessage.getTimestamp(),20,
          new AVIMMessageQueryCallback(){
            @Override
            public void done(List<AVIMMessage> messagesInPage,AVIMException e){
              if(e== null){
                //查询成功返回
                Log.d("Tom & Jerry","got "+messagesInPage.size()+" messages ");
              }
          }
      });
    }
  }
});
```

```cs
// limit 取值范围 1~1000，默认 20
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

```objc
[conversation queryMediaMessagesFromServerWithType:kAVIMMessageMediaTypeImage limit:10 fromMessageId:nil fromTimestamp:0 callback:^(NSArray *messages, NSError *error) {
    if (!error) {
        NSLog(@"查询成功！");
    }
}];
```

```java
int msgType = .AVIMMessageType.TEXT_MESSAGE_TYPE;
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
  // handle result
}.catch(function(error) {
  // handle error
});
```
```objc
[conversation queryMessagesInInterval:nil direction:AVIMMessageQueryDirectionFromOldToNew limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageInterval internal = new AVIMMessageInterval(null, null);
conversation.queryMessages(internal, AVIMMessageQueryDirectionFromOldToNew, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageFromOldToNewAsync();
```

为了实现翻页，请配合下一节[从某一时间戳往某一方向查询](#从某一时间戳往某一方向查询)

### 从某一时间戳往某一方向查询

LeanCloud 即时通讯服务云端支持以某一条消息的 Id 和 时间戳为准，往一个方向查：

- 从新到旧：以某一条消息为基准，查询它之**前**产生的消息
- 从旧到新：以某一条消息为基准，查询它之**后**产生的消息

这样我们就可以在不同方向上实现消息翻页了。

```js
var { MessageQueryDirection } = require('leancloud-realtime');
conversation.queryMessages({
  startTime: timestamp,
  startMessageId: messageId,
startClosed: false,
  direction: MessageQueryDirection.OLD_TO_NEW,
}).then(function(messages) {
  // handle result
}.catch(function(error) {
  // handle error
});
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:timestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:nil];
[conversation queryMessagesInInterval:interval direction:direction limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageInterval internal = new AVIMMessageInterval(start, null);
AVIMMessageQueryDirection direction;
conversation.queryMessages(internal, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageFromOldToNewAsync();
// get some messages after earliestMessages.Last()
var nextPageMessages = await conversation.QueryMessageAfterAsync(earliestMessages.Last());
```

### 获取指定区间内的消息

假设已知 2 条消息，这 2 条消息以较早的一条为起始点，而较晚的一条为终点，这个区间内产生的消息可以用如下方式查询：

注意：**每次查询也有 100 条限制，如果想要查询区间内所有产生的消息，替换区间起始点的参数即可。**

```js
conversation.queryMessages({
  startTime: timestamp,
  startMessageId: messageId,
  endTime: endTimestamp,
  endMessageId: endMessageId,
}).then(function(messages) {
  // handle result
}.catch(function(error) {
  // handle error
});
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:startTimestamp closed:false];
    AVIMMessageIntervalBound *end = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:endTimestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:end];
[conversation queryMessagesInInterval:interval direction:direction limit:100 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageIntervalBound end = AVIMMessageInterval.createBound(endMessageId, endTimestamp, false);
AVIMMessageInterval internal = new AVIMMessageInterval(start, end);
AVIMMessageQueryDirection direction;
conversation.queryMessages(internal, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessage = await conversation.QueryMessageFromOldToNewAsync(limit: 1);
var latestMessage = await conversation.QueryMessageAsync(limit: 1);
// mex count for messagesInInterval is 100
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

## 用户退出登录

如果产品层面设计了用户退出登录或者切换账号的接口，对于即时通讯服务来说，也是需要完全注销当前用户的登录状态的。在 SDK 中，开发者可以通过调用 `AVIMClient` 的 `close` 系列方法完成即时通讯服务的「退出」： 

```js
tom.close().then(function() {
  console.log('Tom 退出登录');
}).catch(console.error.bind(console));
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
        //登出成功
        }
    }
});
```
```cs
await tom.CloseAsync();
```

调用该接口之后，客户端就与即时通讯服务云端断开连接了，从云端查询前一 clientId 的状态，会显示「离线」状态。

## 客户端事件与网络状态响应

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
  console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
});
realtime.on(Event.RETRY, function(attempt) {
  console.log('正在进行第' + (attempt + 1) + '次重连');
});
realtime.on(Event.RECONNECT, function() {
  console.log('与服务端连接恢复');
});
```
{{ docs.langSpecEnd('js') }}

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

### 自动重连

如果开发者没有明确调用退出登录的接口，但是客户端网络存在抖动或者切换（对于移动网络来说，这是比较常见的情况），我们 iOS 和 Android SDK 默认内置了断线重连的功能，会在网络恢复的时候自动建立连接，此时 `IMClient` 的网络状态可以通过底层的网络状态响应接口得到回调。

{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "进阶功能", href: "realtime-guide-intermediate.html"}, 
  { title: "高阶技巧", href: "/realtime-guide-senior.html"}])
}}
