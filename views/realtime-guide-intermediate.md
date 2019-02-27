{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 更多消息收发的需求，开放聊天室以及内容实时过滤

## 本章导读

在前一章[从简单的单聊、群聊、收发图文消息开始](realtime-guide-beginner.html)里面，我们说明了如何在产品中增加一个基本的单聊/群聊页面，并响应服务端实时事件通知。接下来，在本篇文档中我们会讲解如何实现一些更复杂的业务需求，例如：
- 如何处理消息的已读状态
- 如何发送带有成员提示的消息
- 如何支持消息的撤回和修改
- 如何解决成员离线状态下的消息通知
- 如何实现一个不限人数的直播聊天室
- 如何对大型聊天室中的消息进行实时内容过滤

## 消息收发的更多需求

在一个偏重工作协作或社交沟通的产品里，除了简单的消息收发之外，我们还会碰到更多需求，例如

- 在消息中能否直接提醒某人，类似于很多 IM 工具中提供的 @ 消息，这样接收方能更明确地知道哪些消息需要及时响应；
- 消息发出去之后才发现内容不对，这时候能否修改或者撤回？
- 除了普通的聊天内容之外，是否支持发送类似于「xxx 正在输入」这样的状态消息？
- 消息是否被其他人接收、读取，这样的状态能否反馈给发送者？
- 客户端掉线一段时间之后，可能会错过一批消息，能否提醒并同步一下未读消息？

等等，所有这些需求都是可以通过 LeanCloud 即时通讯服务解决的，下面我们来逐一看看具体的做法。


### @ 成员提醒消息

LeanCloud 即时通讯 SDK 在发送消息的时候，允许显式地指定这条消息是否会提醒一部分或者全部成员。我们可以在 AVIMMessage 实例上通过设置 `mentionList` 属性值来添加被提醒的成员列表，示例如下:

```js
const message = new TextMessage(`@Tom`).setMentionList('Tom');
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"@Tom" attributes:nil];
message.mentionList = @[@"Tom"];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention Tom has been sent. */
}];
```
```java
String content = "@Tom";
AVIMTextMessage  message = new AVIMTextMessage();
message.setText(content);
List<String> list = new ArrayList<>(); // 部分用户的 mention list，你可以向下面代码这样来填充
list.add("Tom");
message.setMentionList(list);
imConversation.sendMessage(message, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("@Tom")
{
    MentionList = new List<string>() { "Tom" }
};
await conversation.SendAsync(textMessage);
```

或者也可以通过设置 `mentionAll` 属性值提醒所有人：

```js
const message = new TextMessage(`@all`).mentionAll();
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"@all!" attributes:nil];
message.mentionAll = YES;
[conversation sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention all members has been sent. */
}];
```
```java
String content = "something as you will";
AVIMTextMessage  message = new AVIMTextMessage();
message.setText(content);

boolean mentionAll = true;// 指示是否 mention 了所有人
message.mentionAll(mentionAll);

imConversation.sendMessage(message, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("@all")
{
    MentionAll = true
};
await conv.SendAsync(textMessage);
```

消息的接收方，可以通过读取消息的提醒列表来获取哪些 client Id 被提醒了：

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentionList = receivedMessage.getMentionList();
});
```
```objc
// 示例代码演示 AVIMTypedMessage 接收时，获取该条消息提醒的 client id 列表，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get mention list of client id.
     NSArray *mentionList = message.mentionList;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息 @ 的 client id 列表
  List<String> currentMsgMentionUserList = message.getMentionList();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
        var mentionedList = e.Message.MentionList;
    }
}
```

此外，AVIMMessage 实例提供了两个标识位，用来显示被提醒的状体。
其中一个是 `mentionedAll` 标识位，用来表示该消息是否提醒了当前对话的全体成员:

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentionedAll = receivedMessage.mentionedAll;
});
```
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前对话里的所有成员，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get this message mentioned all members of this conversion.
    BOOL mentionAll = message.mentionAll;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息是否 @ 了对话的所有成员
  boolean currentMsgMentionAllUsers = message.isMentionAll();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
         var mentionedAll = e.Message.MentionAll;
    }
}
```

AVIMMessage 的另一个标识位 `mentioned` 则用来标识当前用户是否被提醒（该标识位是 SDK 内部动态生成的，SDK 通过读取消息是否提醒了全体成员和当前 client id 是否在被提醒的列表里这两个条件计算出来当前用户是否被提醒）：

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentioned = receivedMessage.mentioned;
});
```
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前 client id，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get if current client id mentioned by this message
    BOOL mentioned = message.mentioned;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息是否 @ 了当前 client id
  boolean currentMsgMentionedMe = message.mentioned();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
         // 判断当前用户是否被 @
         var mentioned = e.Message.MentionAll || e.Message.MentionList.Contains("Tom");
    }
}
```

### 消息的撤回和修改

> 需要在 控制台 > 消息 > 设置 中启用「聊天服务，对消息启用撤回功能」。

终端用户可以在消息发送之后，对自己发送的消息再进行修改或撤回。例如 Tom 要撤回一条已发送的消息：

```js
conversation.recall(oldMessage).then(function(recalledMessage) {
  // 修改成功
  // recalledMessage is an RecalledMessage
}).catch(function(error) {
  // 异常处理
});
```
```objc
AVIMMessage *oldMessage = <#MessageYouWantToRecall#>;

[conversation recallMessage:oldMessage callback:^(BOOL succeeded, NSError * _Nullable error, AVIMRecalledMessage * _Nullable recalledMessage) {
    if (succeeded) {
        NSLog(@"Message has been recalled.");
    }
}];
```
```java
conversation.recallMessage(message, new AVIMMessageRecalledCallback() {
    @Override
    public void done(AVIMRecalledMessage recalledMessage, AVException e) {
        if (null == e) {
            // 消息撤回成功，可以更新 UI
        }
    }
});
```
```cs
await conversation.RecallAsync(message);
```

Tom 成功调用 `recallMessage` 方法之后，对话内的其他成员会接收到 `MESSAGE_RECALL` 的事件：

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.MESSAGE_RECALL, function(recalledMessage) {
  // recalledMessage 为已撤回的消息
  // 在视图层可以通过消息的 id 找到原来的消息并用 recalledMessage 替换
});
```
```objc
/* 实现 delegate 方法，以处理消息修改和撤回的事件 */
- (void)conversation:(AVIMConversation *)conversation messageHasBeenUpdated:(AVIMMessage *)message {
    /* A message has been updated or recalled. */

    switch (message.mediaType) {
    case kAVIMMessageMediaTypeRecalled:
        NSLog(@"message 是一条撤回消息");
        break;
    default:
        NSLog(@"message 是一条更新消息");
        break;
    }
}
```
```java
void onMessageRecalled(AVIMClient client, AVIMConversation conversation, AVIMMessage message) {
  // message 即为被撤回的消息
}
```
```cs
tom.OnMessageRecalled += Tom_OnMessageRecalled;
private void Tom_OnMessageRecalled(object sender, AVIMMessagePatchEventArgs e)
{
    // e.Messages 为被修改的消息，它是一个集合，SDK 可能会合并多次的消息撤回统一分发
}
```

对于 Android 和 iOS SDK 来说，如果消息缓存的选项是打开的时候，SDK 内部会先从缓存中删除这条消息记录，然后再通知应用层。所以对于开发者来说，收到这条通知之后刷新一下目标聊天页面，让消息列表更新即可。

Tom 除了直接删除出错消息之外，还可以修改那条消息，例如：

```js
var newMessage = new TextMessage('new message');
conversation.update(oldMessage, newMessage).then(function() {
  // 修改成功
}).catch(function(error) {
  // 异常处理
});
```
```objc
AVIMMessage *oldMessage = <#MessageYouWantToUpdate#>;
AVIMMessage *newMessage = [AVIMTextMessage messageWithText:@"Just a new message" attributes:nil];

[conversation updateMessage:oldMessage
                    toNewMessage:newMessage
                        callback:^(BOOL succeeded, NSError * _Nullable error) {
                            if (succeeded) {
                                NSLog(@"Message has been updated.");
                            }
}];
```
```java
AVIMTextMessage textMessage = new AVIMTextMessage();
textMessage.setContent("修改后的消息");
imConversation.updateMessage(oldMessage, textMessage, new AVIMMessageUpdatedCallback() {
  @Override
  public void done(AVIMMessage avimMessage, AVException e) {
    if (null == e) {
      // 消息修改成功，avimMessage 即为被修改后的最新的消息
    }
  }
});
```
```cs
// 直接修改对应的内容
textMessage.TextContent = "修改之后的文本消息内容";
// 将修改后的消息传入 ModifyAsync
conversation.ModifyAsync(textMessage);
```

Tom 成功调用 `updateMessage` 方法之后，对话内的其他成员会对应的是接收方会接收到 `MESSAGE_UPDATE` 事件：

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.MESSAGE_UPDATE, function(newMessage) {
  // newMessage 为修改后的的消息
  // 在视图层可以通过消息的 id 找到原来的消息并用 newMessage 替换
});
```
```objc
/* 实现 delegate 方法，以处理消息修改和撤回的事件 */
- (void)conversation:(AVIMConversation *)conversation messageHasBeenUpdated:(AVIMMessage *)message {
    /* A message has been updated or recalled. */

    switch (message.mediaType) {
    case kAVIMMessageMediaTypeRecalled:
        NSLog(@"message 是一条撤回消息");
        break;
    default:
        NSLog(@"message 是一条更新消息");
        break;
    }
}
```
```java
void onMessageUpdated(AVIMClient client, AVIMConversation conversation, AVIMMessage message) {
  // message 即为被修改的消息
}
```
```cs
tom.OnMessageModified += Tom_OnMessageModified;
private void Tom_OnMessageModified(object sender, AVIMMessagePatchEventArgs e)
{
    // e.Messages  是一个集合，SDK 可能会合并多次消息修改统一分发
}
```

对于 Android 和 iOS SDK 来说，如果消息缓存的选项是打开的时候，SDK 内部会先从缓存中修改这条消息记录，然后再通知应用层。所以对于开发者来说，收到这条通知之后刷新一下目标聊天页面，让消息列表更新即可。

### 发送暂态消息

有时候我们需要发送一些特殊的消息，譬如聊天过程中「某某正在输入...」这样的状态信息，或者当群聊的名称修改以后给该群成员的「群名称被某某修改为...」通知信息，这类消息与终端用户发送的消息不一样，它不要求保存到历史消息里面去，不要求一定会被送达（如果成员不在线或者现在网络异常，那么没有下发下去也无所谓），这种需求可以使用「暂态消息」来实现。

「暂态消息」是一种特殊的消息，它会被自动保存到云端，以后在历史消息中无法找到它，也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来发送一些实时的、变化的状态信息，或者用来实现简单的控制协议。

暂态消息的发送与普通消息有一些区别。到目前为止，我们演示的 `AVIMConversation` 发送消息接口都是这样的：

```js
async send(message)
```
```objc
/*!
 往对话中发送消息。
 */
- (void)sendMessage:(AVIMMessage *)message
           callback:(void (^)(BOOL succeeded, NSError * _Nullable error))callback;
```
```java
/**
 * 发送一条消息
 */
public void sendMessage(AVIMMessage message, final AVIMConversationCallback callback)
```
```cs
public static Task<T> SendAsync<T>(this AVIMConversation conversation, T message)
            where T : IAVIMMessage
```

其实即时通讯 SDK 还允许在发送一条消息的时候，指定额外的参数 `AVIMMessageOption`，`AVIMConversation` 完整的消息发送接口如下：

```js
/**
 * 发送消息
 * @param  {Message} message 消息，Message 及其子类的实例
 * @param {Object} [options] since v3.3.0，发送选项
 * @param {Boolean} [options.transient] since v3.3.1，是否作为暂态消息发送
 * @param {Boolean} [options.receipt] 是否需要回执，仅在普通对话中有效
 * @param {Boolean} [options.will] since v3.4.0，是否指定该消息作为「掉线消息」发送，
 * 「掉线消息」会延迟到当前用户掉线后发送，常用来实现「下线通知」功能
 * @param {MessagePriority} [options.priority] 消息优先级，仅在暂态对话中有效，
 * see: {@link module:leancloud-realtime.MessagePriority MessagePriority}
 * @param {Object} [options.pushData] 消息对应的离线推送内容，如果消息接收方不在线，会推送指定的内容。其结构说明参见: {@link https://url.leanapp.cn/pushData 推送消息内容}
 * @return {Promise.<Message>} 发送的消息
 */
async send(message, options)
```
```objc
/*!
 往对话中发送消息。
 @param message － 消息对象
 @param option － 消息发送选项
 @param callback － 结果回调
 */
- (void)sendMessage:(AVIMMessage *)message
             option:(nullable AVIMMessageOption *)option
           callback:(void (^)(BOOL succeeded, NSError * _Nullable error))callback;
```
```java
/**
 * 发送消息
 * @param message
 * @param messageOption
 * @param callback
 */
public void sendMessage(final AVIMMessage message, final AVIMMessageOption messageOption, final AVIMConversationCallback callback)；
```
```cs
/// <summary>
/// 发送消息
/// </summary>
/// <param name="avMessage">消息体</param>
/// <param name="options">消息的发送选项，包含了一些特殊的标记<see cref="AVIMSendOptions"/></param>
/// <returns></returns>
public Task<IAVIMMessage> SendMessageAsync(IAVIMMessage avMessage, AVIMSendOptions options);
```

通过 `AVIMMessageOption` 参数我们可以指定：

- 是否作为暂态消息发送（`transient` 属性）
- 服务端是否需要通知该消息的接收状态（`receipt` 属性，消息回执，后续章节会进行说明）
- 消息的优先级（`priority` 属性，后续章节会说明）
- 是否为「遗愿消息」（`will` 属性，后续章节会说明）
- 消息对应的离线推送内容（`pushData` 属性，后续章节会说明），如果消息接收方不在线，会推送指定的内容。

例如我们需要让 Tom 在聊天页面的输入框获得焦点的时候，给群内成员同步一条「Tom is typing...」的状态信息，可以使用如下代码：

```js
const message = new TextMessage('Tom is typing...');
conversation.send(message, {transient: true});
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"Tom is typing..." attributes:nil];
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.transient = true;
[conversation sendMessage:message option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention all members has been sent. */
}];
```
```java
String content = "Tom is typing...";
AVIMTextMessage  message = new AVIMTextMessage();
message.setText(content);

AVIMMessageOption option = new AVIMMessageOption();
option.setTransient(true);

imConversation.sendMessage(message, option, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("Tom is typing...")
{
    MentionAll = true
};
var option = new AVIMSendOptions(){Transient = true};
await conv.SendAsync(textMessage, option);
```

暂态消息的接收逻辑和普通消息一样，开发者可以按照消息类型进行判断和处理，这里不再赘述。

### 消息回执

有一些偏重工作写作或者私密沟通的产品，消息发送者在发送一条消息之后，还希望能看到消息被送达和阅读的实时状态，甚至还要提醒未读成员。这样苛刻的需求，使用 LeanCloud 即时通讯服务也是可以实现的。

在对方收到消息以及对方阅读了消息之后，云端可以向发送方分别发送一个回执通知。要使用消息回执功能，需要在发送消息时标记「需要回执」选项：
{{ docs.note("只有在发送时设置了「需要回执」的标记，云端才会发送回执，默认不发送回执。") }}

```js
var message = new TextMessage('very important message');
conversation.send(message, {
  receipt: true,
});
```
```objc
[conversation sendMessage:message options:AVIMMessageSendOptionRequestReceipt callback:^(BOOL succeeded, NSError *error) {
  if (succeeded) {
    NSLog(@"发送成功！需要回执");
  }
}];
```
```java
AVIMMessageOption messageOption = new AVIMMessageOption();
messageOption.setReceipt(true);
imConversation.sendMessage(message, messageOption, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("very important message");
var option = new AVIMSendOptions(){Receipt = true};
await conv.SendAsync(textMessage, option);
```

那么发送方后续该如何响应回执的通知消息呢？

#### 送达回执

当对方收到消息之后，云端会向发送方发出一个回执通知，表明消息已经送达，但这并**不代表用户已读**。送达回执**仅支持单聊**。

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.LAST_DELIVERED_AT_UPDATE, function() {
  console.log(conversation.lastDeliveredAt);
  // 在 UI 中将早于 lastDeliveredAt 的消息都标记为「已送达」
});
```
```objc
// 监听消息是否已送达实现 `conversation:messageDelivered` 即可。
- (void)conversation:(AVIMConversation *)conversation messageDelivered:(AVIMMessage *)message{
    NSLog(@"%@", @"消息已送达。"); // 打印消息
}
```
```java
AVIMMessageHandler handler = new AVIMMessageHandler(){

    public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation, AVIMClient client) {
     //此处就是对方收到消息以后的回调
    Log.i("Tom & Jerry","msg received");
  }
}

//注册对应的handler
AVIMMessageManager.registerMessageHandler(AVIMMessage.class,handler);

//发送消息

AVIMClient jerry = AVIMClient.getInstance("Jerry");
AVIMConversation conv = jerry.getConversation("551260efe4b01608686c3e0f");
AVIMMessage msg = new AVIMMessage();
msg.setContent("Ping");
AVIMMessageOption messageOption = new AVIMMessageOption();
messageOption.setReceipt(true);
conv.sendMessage(msg, messageOption, new AVIMConversationCallback() {
      @Override
      public void done(AVIMException e) {
        if (e == null) {
          // 发送成功
        }
      }
    });
```
```cs
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

#### 已读回执

对方「阅读」了消息之后，云端会向发送方发出一个回执通知，表明消息已被阅读。和送达回执一样，已读回执目前也**仅支持单聊**。

> 注意：要使用已读回执，应用需要先开启[未读消息数更新通知](#未读消息数更新通知)选项。

例如 Tom 和 Jerry 聊天，Tom 想知道 Jerry 是否阅读了自己发去的消息：

1. Tom 向 Jerry 发送一条消息，且标记为「需要回执」：
  
    ```js
    ```
    ```objc
    AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
    option.receipt = YES; /* 将消息设置为需要回执。 */

    AVIMTextMessage *message = [AVIMTextMessage messageWithText:@"Hello, Jerry!" attributes:nil];

    [conversaiton sendMessage:message option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
        if (!error) {
            /* 发送成功 */
        }
    }];
    ```
    ```java
    AVIMClient tom = AVIMClient.getInstance("Tom");
    AVIMConversation conv = client.getConversation("551260efe4b01608686c3e0f");
    
    AVIMTextMessage textMessage = new AVIMTextMessage();
    textMessage.setText("Hello, Jerry!");

    AVIMMessageOption option = new AVIMMessageOption();
    option.setReceipt(true); /* 将消息设置为需要回执。 */

    conv.sendMessage(textMessage, option, new AVIMConversationCallback() {
      @Override
      public void done(AVIMException e) {
        if (e == null) {
          /* 发送成功 */
        }
      }
    });
    ```
    ```cs
    ```

2. Jerry 阅读 Tom 发的消息后，调用对话上的方法把「对话中最近的消息」标记为已读：
  
    ```js
    ```
    ```objc
    [conversation readInBackground];
    ```
    ```java
    conv.read();
    ```
    ```cs
    ```

3. Tom 将收到一个已读回执，对话的 `lastReadAt` 属性会更新。此时可以更新 UI，把时间戳小于 lastReadAt 的消息都标记为已读。
  
    ```js
    ```
    ```objc
    // Tom 可以在 client 的 delegate 方法中捕捉到 lastReadAt 的更新
    - (void)conversation:(AVIMConversation *)conversation didUpdateForKey:(NSString *)key {
        if ([key isEqualToString:@"lastReadAt"]) {
            NSDate *lastReadAt = conversation.lastReadAt;
            /* Jerry 阅读了你的消息。可以使用 lastReadAt 更新 UI，例如把时间戳小于 lastReadAt 的消息都标记为已读。 */
        }
    }
    ```
    ```java
    onLastReadAtUpdated(AVIMClient client, AVIMConversation conversation) {
      /* Jerry 阅读了你的消息。可以通过调用 conversation.getLastReadAt() 来获得对方已经读取到的时间点
    }
    ```
    ```cs
    ```

### Will（遗愿）消息

LeanCloud 即时通讯服务还支持一类比较特殊的消息：Will（遗愿）消息。「Will 消息」是在一个用户突然掉线之后，系统自动通知对话的其他成员关于该成员已掉线的消息。好似在掉线后要给对话中的其他成员一个妥善的交待，所以被戏称为「遗愿」消息，如下图中的「Tom 已掉线，无法收到消息」。

<img src="images/lastwill-message.png" width="400" class="responsive">

要发送 Will 消息，用户需要设定好消息内容（可能包含了一些业务逻辑相关的内容）发给云端，云端并不会将其马上发送给对话的成员，而是缓存下来，一旦检测到该用户掉线，云端立即将这条遗愿消息发送出去。开发者可以利用它来构建自己的断线通知的逻辑。

```js
var message = new TextMessage('我掉线了');
conversation.send(message, { will: true }).then(function() {
  // 发送成功，当前 client 掉线的时候，这条消息会被下发给对话里面的其他成员
}).catch(function(error) {
  // 异常处理
});
```
```objc
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.will = YES;

AVIMMessage *willMessage = [AVIMTextMessage messageWithText:@"I'm offline." attributes:nil];

[conversaiton sendMessage:willMessage option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        NSLog(@"Will message has been sent.");
    }
}];
```
```java
AVIMTextMessage message = new AVIMTextMessage();
message.setText("我是一条遗愿消息，当发送者意外下线的时候，我会被下发给对话里面的其他成员");

AVIMMessageOption option = new AVIMMessageOption();
option.setWill(true);
conversation.sendMessage(message, option, new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {
    if (e == null) {
      // 发送成功
    }
  }
});
```
```cs
var message = new AVIMTextMessage()
{
    TextContent = "我是一条遗愿消息，当发送者意外下线的时候，我会被下发给对话里面的其他成员"
};
var sendOptions = new AVIMSendOptions()
{
    Will = true
};
await conversation.SendAsync(message, sendOptions);
```

客户端发送完毕之后就完全不用再关心这条消息了，云端会自动在发送方掉线后通知其他成员。

Will 消息有**如下限制**：

- 同一时刻只对一个对话生效
- 当 client 主动 close 时，遗愿消息不会下发，系统会认为这是计划性下线。

接收到遗愿消息的客户端需要根据自己的消息内容来做 UI 的展现。

### 发送失败消息的处理

有时你可能需要将发送失败的消息临时保存到客户端本地的缓存中，等到合适时机再进行处理。例如，将由于网络突然中断而发送失败的消息先保留下来，待网络恢复后再由用户选择是否重发。
即时通讯 Android 和 iOS SDK 默认提供了消息本地缓存的功能，消息缓存中保存的都是已经成功上行到云端的消息，并且能够保证和云端的数据同步。为了方便开发者，SDK 也支持将一时失败的消息加入到缓存中，以后从缓存中取出来还能再次发送（且多次发送也不会造成服务端消息重复）。

将消息加入缓存的代码如下：

```js
// 不支持
```
```objc
[conversation addMessageToCache:message];
```
```java
conversation.addToLocalCache(message);
```
```cs
// 不支持
```

将消息从缓存中删除:

```js
// 不支持
```
```objc
[conversation removeMessageFromCache:message];
```
```java
conversation.removeFromLocalCache(message);
```
```cs
// 不支持
```

UI 上可以根据 message.status 的属性值来做不同的展现，例如当 status 属性变为 `AVIMMessageStatusFailed` 时表示消息发送失败，这时可以在消息旁边显示一个重新发送的按钮。

## 离线状态时的消息同步

对于移动设备来说，在聊天的过程中总会有部分客户端临时下线，如何保证离线用户也能收到消息，并且长时间离线也不会丢失消息，LeanCloud 提供了两种机制来应对这种挑战：

1. 一种是**离线推送通知**。这是即时通讯云端在客户端下线的时候，主动通过 Push Notification 这种外部方式来通知客户端新消息到达事件，以促使客户端尽快打开应用查看新消息。
  ![image](images/realtime_ios_push.png)
2. 另一种是**未读消息更新通知**。客户端如果长时间下线，会导致大量消息无法下发，这时候即时通讯云端会记录下该客户端在参与的每一个对话中拉取的最后一条消息的时间戳，当客户端重新联网并登录上来的时候，云端会实时计算下线时间段内其参与过的对话中的新消息数量，以「未读消息数更新」的事件通知到客户端，然后客户端可在需要的时候来拉取这些消息。

### 离线推送通知

离线消息推送通知是即时通讯服务默认提供的外部通知方式。不管是单聊还是群聊，当用户 A 发出消息后，如果目标对话的部分用户当前不在线，而且这些用户使用的是 iOS、Windows Phone 设备，或者有效开通了混合推送的 Android 设备的话，LeanCloud 云端可以提供离线推送的方式将消息提醒发送至客户端。

要想使用本功能，用户需要指定 **自定义推送的内容**，目前有三种方式可以做到：

1. 静态配置提醒消息
  由于不同平台的不同限制，且用户的消息正文可能还包含上层协议，所以我们允许用户在控制台中为应用设置一个静态的 JSON，推送一条内容固定的通知。

  进入 [控制台 > 消息 > 实时消息 > 设置 > 离线推送设置](/messaging.html?appid={{appid}}#/message/realtime/conf)，填入：
  ```
  {"alert":"您有新的消息", "badge":"Increment"}
  ```
  注意，`badge` 参数为 iOS 设备专用，且 `Increment` 大小写敏感，表示自动增加应用 badge 上的数字计数。清除 badge 的操作请参考 [iOS 推送指南 &middot; 清除 badge](ios_push_guide.html#清除_Badge)。
  
  此外，对于 iOS 设备您还可以设置声音等推送属性，具体的字段可以参考[推送 &middot; 消息内容 Data](./push_guide.html#消息内容_Data)。

2. 客户端发送消息的时候额外指定推送信息
  第一种方法虽然发出去了通知，但是因为通知文本与实际消息内容完全无关，所以可能也不太完美。即时通讯服务允许客户端在发送消息的时候，指定附加的推送信息，以便在部分接收者离线的时候转为动态内容将消息推送到用户设备上，其示例代码如下：

  ```js
  var { Realtime, TextMessage } = require('leancloud-realtime');
  var realtime = new Realtime({ appId: '', region: 'cn' });
  realtime.createIMClient('Tom').then(function (host) {
      return host.createConversation({
          members: ['Jerry'],
          name: 'Tom & Jerry',
          unique: true
      });
  }).then(function (conversation) {
      console.log(conversation.id);
      return conversation.send(new TextMessage('Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！'), {
          pushData: {
              "alert": "您有一条未读的消息",
              "category": "消息",
              "badge": 1,
              "sound": "声音文件名，前提在应用里存在",
              "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"
          }
      });
  }).then(function (message) {
      console.log(message);
  }).catch(console.error);
  ```
  ```objc
  AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
  option.pushData = @{@"alert" : @"您有一条未读消息", @"sound" : @"message.mp3", @"badge" : @1, @"custom-key" : @"由用户添加的自定义属性，custom-key 仅是举例，可随意替换"};
  [conversation sendMessage:[AVIMTextMessage messageWithText:@"Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！" attributes:nil] option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
      // 在这里处理发送失败或者成功之后的逻辑
  }];
  ```
  ```java
  AVIMTextMessage msg = new AVIMTextMessage();
  msg.setText("Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！");

  AVIMMessageOption messageOption = new AVIMMessageOption();
  messageOption.setPushData("自定义离线消息推送内容");
  conv.sendMessage(msg, messageOption, new AVIMConversationCallback() {
      @Override
      public void done(AVIMException e) {
          if (e == null) {
          // 发送成功
          }
      }
  });
  ```
  ```cs
  var message = new AVIMTextMessage()
  {
      TextContent = "Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！"
  };

  AVIMSendOptions sendOptions = new AVIMSendOptions()
  {
      PushData = new Dictionary<string, object>()
      {
          { "alert", "您有一条未读的消息"},
          { "category", "消息"},
          { "badge", 1},
          { "sound", "message.mp3//声音文件名，前提在应用里存在"},
          { "custom-key", "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"}
      }
  };
  ```

3. 服务端动态生成通知内容
  第二种方法虽然动态，但是需要在客户端发送消息的时候提前准备好推送内容，这对于开发阶段的要求比较高，并且在灵活性上有比较大的限制，所以我们还提供了一种方式，可以让开发者在推送动态内容的时候，也不失灵活性。
  这种方式需要在云引擎中使用 Hook 函数统一设置离线推送消息内容，感兴趣的开发者可以参阅下述文档：

  - [云引擎 Hook `_receiversOffline`](#_receiversOffline) 
  - [云引擎 PHP 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-php.html#_receiversOffline)
  - [云引擎 NodeJS 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-node.html#_receiversOffline)
  - [云引擎 Python 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-python.html#_receiversOffline)


三种方式之间的优先级如下：
**服务端动态生成通知 > 客户端发送消息的时候额外指定推送信息 > 静态配置提醒消息**
也就是说如果开发者同时采用了多种方式来指定消息推送，那么有服务端动态生成的通知的话，最后以它为准进行推送。其次是客户端发送消息的时候额外指定推送内容，最后是静态配置的提醒消息。

##### 限制

通知的过期时间是 7 天，也就是说，如果一个设备 7 天内没有连接到 APNs、MPNs 或设备对应的混合推送平台，系统将不会再给这个设备推送通知。

##### 实现原理

这部分平台的用户，在完成登录时，SDK 会自动关联当前的 Client ID 和设备。关联的方式是通过设备**订阅**名为 Client ID 的 Channel 实现的。开发者可以在数据存储的 `_Installation` 表中的 `channels` 字段查到这组关联关系。在实际离线推送时，系统根据用户 Client ID 找到对应的关联设备进行推送。由于即时通讯触发的推送量比较大，内容单一， 所以云端不会保留这部分记录，在 **控制台 > 消息 > 推送记录** 中也无法找到这些记录。

##### 其他设置

推送默认使用**生产证书**，你也可以在 JSON 中增加一个 `_profile` 内部属性来选择实际推送的证书，如：

```json
{
  "alert":    "您有一条未读消息",
  "_profile": "dev"
}
```

Apple 不支持在一次推送中向多个从属于不同 Team Id 的设备发推送。在使用 iOS Token Authentication 的鉴权方式后，如果应用配置了多个不同 Team Id 的 Private Key，请确认目标用户设备使用的 APNs Team ID 并将其填写在 `_apns_team_id` 参数内，以保证推送正常进行，只有指定 Team ID 的设备能收到推送。如：

```json
{
  "alert":    "您有一条未读消息",
  "_apns_team_id": "my_fancy_team_id"
}
```

`_profile` 和 `_apns_team_id` 属性均不会实际推送。

目前，设置界面的推送内容支持部分内置变量，你可以将上下文信息直接设置到推送内容中：

* `${convId}` 推送相关的对话 ID
* `${timestamp}` 触发推送的时间戳（Unix 时间戳）
* `${fromClientId}` 消息发送者的 Client ID

iOS 和 Android 分别提供了内置的离线消息推送通知服务，但是使用的前提是按照推送文档配置 iOS 的推送证书和 Android 开启推送的开关，详细请阅读如下文档：

1. [消息推送服务总览](push_guide.html)
2. [Android 消息推送开发指南](android_push_guide.html)/[iOS 消息推送开发指南](ios_push_guide.html)
3. [即时通讯概览 &middot; 离线推送通知](realtime_v2.html#离线推送通知)

### 未读消息数更新通知

对于 js SDK 来说，未读消息数量通知是默认的未读消息处理方式。对于 Android 和 iOS SDK 来说，则需要在 AVOSCloud 初始化语句后面加上：

```js
// 默认支持，无需额外设置
```
```objc
[AVIMClient setUnreadNotificationEnabled:YES];
```
```java
AVIMClient.setUnreadNotificationEnabled(true);
```
```cs
// 尚不支持
```

所有 SDK 都会在 `AVIMConversation` 上维护 `unreadMessagesCount` 字段，这个字段在变化时 `IMClient` 会派发 `未读消息数量更新（UNREAD_MESSAGES_COUNT_UPDATE）` 事件。这个字段会在下面这些情况下发生变化：

- 登录时，服务端通知对话的未读消息数
- 收到在线消息
- 用户将对话标记为已读

开发者应当监听 UNREAD_MESSAGES_COUNT_UPDATE 事件，在对话列表界面上更新这些对话的未读消息数量。

```js
var { Event } = require('leancloud-realtime');
client.on(Event.UNREAD_MESSAGES_COUNT_UPDATE, function(conversations) {
  for(let conv of conversations) {
    console.log(conv.id, conv.name, conv.unreadMessagesCount);
  }
});
```
```objc
// 使用代理方法 conversation:didUpdateForKey: 来观察对话的 unreadMessagesCount 属性
- (void)conversation:(AVIMConversation *)conversation didUpdateForKey:(NSString *)key {
    if ([key isEqualToString:@"unreadMessagesCount"]) {
        NSUInteger unreadMessagesCount = conversation.unreadMessagesCount;
        /* 有未读消息产生，请更新 UI，或者拉取对话。 */
    }
}
```
```java
// 实现 AVIMConversationEventHandler 的代理方法 onUnreadMessagesCountUpdated 来得到未读消息的数量变更的通知
onUnreadMessagesCountUpdated(AVIMClient client, AVIMConversation conversation) {
    // conversation.getUnreadMessagesCount() 即该 conversation 的未读消息数量
}
```
```cs
// 尚不支持
```

清除对话未读消息数的唯一方式是调用 Conversation#read 方法将对话标记为已读，一般来说开发者至少需要在下面两种情况下将对话标记为已读：

- 在对话列表点击某对话进入到对话页面时
- 用户正在某个对话页面聊天，并在这个对话中收到了消息时

示例代码如下：

```js
// 进入到对话页面时标记其为已读
conversation.read().then(function(conversation) {
  console.log('对话已标记为已读');
}).catch(console.error.bind(console));

// 当前聊天的对话收到了消息立即标记为已读
var { Event } = require('leancloud-realtime');
currentConversation.on(Event.MESSAGE, function() {
  currentConversation.read().catch(console.error.bind(console));
})
```
```objc
// todo
```
```java
// todo
```
```cs
// 尚不支持
```

> 注意：开启未读消息数后，即使客户端在线收到了消息，未读消息数量也会增加，因此开发者需要在合适时机重置未读消息数。

## 扩展消息类型

尽管即时通讯服务默认已经包含了丰富的消息类型，但是我们依然支持开发者根据业务需要扩展自己的消息类型，例如允许用户之间发送名片、红包等等。这里「名片」和「红包」就可以是应用层定义的自己的消息类型。

### 扩展机制说明

### 实现自己的「名片」消息

## 直播场景下的开放聊天室

在即时通讯服务总览中，我们比较了不同的[业务场景与对话类型](realtime_v2.html#对话（Conversation）)，现在就来看看如何使用「聊天室」完成一个直播弹幕的需求。

###  创建聊天室

`AVIMClient` 提供了专门的方法来创建聊天室：

```js
tom.createChatRoom({ name:'聊天室' }).catch(console.error);
```
```objc
[client createChatRoomWithName:@"聊天室" attributes:nil callback:^(AVIMChatRoom *chatRoom, NSError *error) {
    if (chatRoom && !error) {        
        AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这是一条消息" attributes:nil];
        [chatRoom sendMessage:textMessage callback:^(BOOL success, NSError *error) {
            if (success && !error) {

            }
        }];
    }
}];
```
```java
tom.createChatRoom(null, "聊天室", null,
    new AVIMConversationCreatedCallback() {
        @Override
        public void done(AVIMConversation conv, AVIMException e) {
            if (e == null) {
                // 创建成功
            }
        }
});
```
```cs
// 第一种是最直接间接的方式，传入 name 即可
tom.CreateChatRoomAsync("聊天室");
// 第二种是更为推荐的形式采用 Builder 模式
var chatRoomBuilder = tom.GetConversationBuilder().SetName("聊天室")
                              .SetTransient();
var chatRoom = await tom.CreateConversationAsync(chatRoomBuilder);
```

### 查找聊天室

构建聊天室的查询：

```js
var query = tom.getQuery().equalTo('tr',true);// 聊天室对象
}).catch(console.error);
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query whereKey:@"tr" equalTo:@(YES)]; 
```
```java
AVIMConversationsQuery query = tom.getChatRoomQuery();
query.findInBackground(new AVIMConversationQueryCallback() {
    @Override
    public void done(List<AVIMConversation> conversations, AVIMException e) {
        if (null != e) {
            // 获取成功
        } else {
          // 获取失败
        }
    }
});
```
```cs
var query = tom.GetChatRoomQuery();
```

### 加入/离开/邀请他人加入聊天室

查询到聊天室之后，加入/离开/邀请他人加入聊天室与普通对话的对应接口没有区别，详细请参考[基础入门#多人群聊](realtime-guide-beginner.html#多人群聊)。最大的区别就是：

> 聊天室没有成员加入、成员离开的通知

### 消息等级

<div class="callout callout-info">此功能仅针对<u>聊天室消息</u>有效。普通对话的消息不需要设置等级，即使设置了也会被系统忽略，因为普通对话的消息不会被丢弃。</div>

为了保证消息的时效性，当聊天室消息过多导致客户端连接堵塞时，服务器端会选择性地丢弃部分低等级的消息。目前支持的消息等级有：

| 消息等级                 | 描述                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `MessagePriority.HIGH`   | 高等级，针对时效性要求较高的消息，比如直播聊天室中的礼物，打赏等。 |
| `MessagePriority.NORMAL` | 正常等级，比如普通非重复性的文本消息。                             |
| `MessagePriority.LOW`    | 低等级，针对时效性要求较低的消息，比如直播聊天室中的弹幕。         |

消息等级在发送接口的参数中设置。以下代码演示了如何发送一个高等级的消息：

```js
```
```objc
```
```java
```
```cs
```


### 聊天室消息的内容过滤

对于开放聊天室来说，内容的审核和实时过滤是产品运营上一个基本的要求。我们即时通讯服务默认提供了敏感词过滤的功能，多人的普通对话、聊天室和系统对话里面的消息都会进行实时过滤。

过滤的词库由 LeanCloud 统一提供，命中的敏感词将会被替换为 `***`。同时我们也支持用户自定义敏感词过滤文件。
在 [控制台 > 消息 > 实时消息 > 设置](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中开启「消息敏感词实时过滤功能」，上传敏感词文件即可。

如果开发者有较为复杂的过滤需求，我们推荐使用 [云引擎 hook _messageReceived](realtime-guide-systemconv.html#_messageReceived) 来实现过滤，在 hook 中开发者对消息的内容有完全的控制力。

## 使用临时对话

临时对话是一个全新的概念，它解决的是一种特殊的聊天场景：

- 对话存续时间短
- 聊天参与的人数较少（最多为 10 个 Client Id）
- 聊天记录的存储不是强需求

这种对话场景，我们推荐使用临时对话，比较能够说明这种对话场景的现实需求就是：电商售前和售后的在线聊天的客服系统，可以对比京东或者淘宝的客服。

临时对话的使用可以减少对普通对话的查询压力（因为它并不会直接占用服务端 _Conversation 表的持久化存储的记录），天生的与传统的群聊，单聊做了隔离，这一点对于对话量大的应用来说是很有好处的。


临时对话与普通对话（群聊/单聊）的功能点区别如下表：

功能点|临时对话|普通对话
--|--|--
消息发送/消息接收|√|√
查询历史消息|√|√
接收离线消息|√|√
修改与撤回消息|√|√
查询在线成员|√|√
已读回执|√|√
订阅成员在线状态|√|√
对话成员数量查询|√|√
遗愿消息|√|√
加人/删人|✘|√
静音或者取消静音|✘|√
更新对话属性|✘|√

临时对话最大的特点是**较短的有效期**，这个特点可以解决对话的持久化存储在服务端占用的存储资源越来越大、开发者需要支付的成本越来越高的问题，也可以应对一些临时聊天的场景。

### 临时对话实例

`AVIMConversation` 有专门的 `createTemporaryConversation` 方法用于创建临时对话：

```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createTemporaryConversation({
    members: ['Jerry', 'William'],
  });
}).then(function(conversation) {
  return conversation.send(new AV.TextMessage('这里是临时对话'));
}).catch(console.error);
```

```objc
[tom createTemporaryConversationWithClientIds:@[@"Jerry", @"William"]
                                                timeToLive:3600
                                                callback:
            ^(AVIMTemporaryConversation *tempConv, NSError *error) {

                AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这里是临时对话，一小时之后，这个对话就会消失"
                                                                    attributes:nil];
                [tempConv sendMessage:textMessage callback:^(BOOL success, NSError *error) {

                    if (success) {
                        // send message success.
                    }
                }];
            }];
```

```java
tom.createTemporaryConversation(Arrays.asList(members), 3600, new AVIMConversationCreatedCallback(){
    @Override
    public void done(AVIMConversation conversation, AVIMException e) {
        if (null == e) {
        AVIMTextMessage msg = new AVIMTextMessage();
        msg.setText("这里是临时对话，一小时之后，这个对话就会消失");
        conversation.sendMessage(msg, new AVIMConversationCallback(){
            @Override
            public void done(AVIMException e) {
            }
        });
        }
    }
});
```

```cs
var temporaryConversation = await tom.CreateTemporaryConversationAsync();
```

与其他对话类型不同的是，临时对话有一个**重要**的属性：TTL，它标记着这个对话的有效期，系统默认是 1 天，但是在创建对话的时候是可以指定这个时间的，最高不超过 30 天，如果您的需求是一定要超过 30 天，请使用普通对话，传入 TTL 创建临时对话的代码如下：

```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createTemporaryConversation({
    members: ['Jerry', 'William'],
    ttl: 3600,
  });
}).then(function(conversation) {
  return conversation.send(new AV.TextMessage('这里是临时对话，一小时之后，这个对话就会消失'));
}).catch(console.error);
```
```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL success, NSError *error) {
    
    if (success) {
        
        [client createTemporaryConversationWithClientIds:@[@"Jerry", @"William"]
                                                timeToLive:3600
                                                callback:
            ^(AVIMTemporaryConversation *tempConv, NSError *error) {
                
                AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这里是临时对话，一小时之后，这个对话就会消失"
                                                                    attributes:nil];
                
                [tempConv sendMessage:textMessage callback:^(BOOL success, NSError *error) {
                    
                    if (success) {
                        // send message success.
                    }
                }];
            }];
    }
}];
```
```java
AVIMClient client = AVIMClient.getInstance("Tom");
client.open(new AVIMClientCallback() {
    @Override
    public void done(AVIMClient avimClient, AVIMException e) {
    if (null == e) {
        String[] members = {"Jerry", "William"};
        avimClient.createTemporaryConversation(Arrays.asList(members), 3600, new AVIMConversationCreatedCallback(){
        @Override
        public void done(AVIMConversation conversation, AVIMException e) {
            if (null == e) {
            AVIMTextMessage msg = new AVIMTextMessage();
            msg.setText("这里是临时对话，一小时之后，这个对话就会消失");
            conversation.sendMessage(msg, new AVIMConversationCallback(){
                @Override
                public void done(AVIMException e) {
                }
            });
            }
        }
        });
    }
    }
});
```
```cs
var temporaryConversation = await tom.CreateTemporaryConversationAsync();
```

临时对话的其他操作与普通对话无异。


{{ docs.relatedLinks("进一步阅读",[
  { title: "安全与签名，黑名单和权限管理", href: "/realtime-guide-senior.html"}])
  { title: "详解消息 Hook 与系统对话的使用", href: "/realtime-guide-systemconv.html"}])
}}