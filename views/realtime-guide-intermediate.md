{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 二，消息收发的更多方式，离线推送与消息同步，多设备登录

## 本章导读

在前一章 [从简单的单聊、群聊、收发图文消息开始](realtime-guide-beginner.html) 里面，我们说明了如何在产品中增加一个基本的单聊/群聊页面，并响应服务端实时事件通知。接下来，在本篇文档中我们会讲解如何实现一些更复杂的业务需求，例如：

- 支持消息被接收和被阅读的状态回执，实现「Ding」一下的效果
- 发送带有成员提醒的消息（@ 某人），在超多用户群聊的场合提升目标用户的响应积极性
- 支持消息的撤回和修改
- 解决成员离线状态下的推送通知与重新上线后的消息同步，确保不丢消息
- 支持多设备登录，或者强制用户单点登录
- 扩展新的消息类型

## 消息收发的更多方式

在一个偏重工作协作或社交沟通的产品里，除了简单的消息收发之外，我们还会碰到更多需求，例如：

- 在消息中能否直接提醒某人，类似于很多 IM 工具中提供的 @ 消息，这样接收方能更明确地知道哪些消息需要及时响应；
- 消息发出去之后才发现内容不对，这时候能否修改或者撤回？
- 除了普通的聊天内容之外，是否支持发送类似于「XX 正在输入」这样的状态消息？
- 消息是否被其他人接收、读取，这样的状态能否反馈给发送者？
- 客户端掉线一段时间之后，可能会错过一批消息，能否提醒并同步一下未读消息？

等等，所有这些需求都可以通过 LeanCloud 即时通讯服务解决的，下面我们来逐一看看具体的做法。

### @ 成员提醒消息

在一些多人聊天群里面，因为消息量较大，很容易就导致某一条重要的消息没有被目标用户看到就被刷下去了，所以在消息中「@成员」是一种提醒接收者注意的有效办法。在微信这样的聊天工具里面，甚至会在对话列表页对有提醒的消息进行特别展示，用来通知消息目标高优先级查看和处理。

一般提醒消息都使用「@ + 人名」来表示目标用户，但是这里「人名」是一个由应用层决定的属性，可能有的产品使用全名，有的使用昵称，并且这个名字和即时通讯服务里面标识一个用户使用的 `clientId` 可能根本不一样（毕竟一个是给人看的，一个是给机器读的）。使用「人名」来圈定用户，也存在一种例外，就是聊天群组里面的用户名是可以改变的，如果消息发送的时候「王五」还叫「王五」，等发送出来之后他恰好同步改成了「王大麻子」，这时候接收方的处理就比较麻烦了。还有第三个原因，就是「提醒全部成员」的表示方式，可能「@all」、「@group」、「@所有人」都会被选择，这是一个完全依赖应用层 UI 的选项。

所以「@ 成员」提醒消息并不能简单在文本消息中加入「@ + 人名」来解决。LeanCloud 的方案是给普通消息（`AVIMMessage`）增加两个额外的属性：

- `mentionList`，是一个字符串的数组，用来单独记录被提醒的 `clientId` 列表；
- `mentionAll`，是一个 `Bool` 型的标志位，用来表示是否要提醒全部成员。

带有提醒信息的消息，有可能既有提醒全部成员的标志，也还单独设置了 `mentionList`，这由应用层去控制。发送方在发送「@ 成员」提醒消息的时候，如何输入、选择成员名称，这是业务方 UI 层面需要解决的问题，即时通讯 SDK 不关心其实现逻辑，SDK 只要求开发者在发送一条「@ 成员」消息的时候，调用 `mentionList` 和 `mentionAll` 的 setter 方法，设置正确的成员列表即可。示例代码如下：

```js
const message = new TextMessage(`@Tom 早点回家`).setMentionList('Tom');
conversation.send(message).then(function(message) {
  console.log('发送成功！');
}).catch(console.error);
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"@Tom 早点回家" attributes:nil];
message.mentionList = @[@"Tom"];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention Tom has been sent. */
}];
```
```java
String content = "@Tom 早点回家";
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
var textMessage = new AVIMTextMessage("@Tom 早点回家")
{
    MentionList = new List<string>() { "Tom" }
};
await conversation.SendMessageAsync(textMessage);
```

或者也可以通过设置 `mentionAll` 属性值提醒所有人：

```js
const message = new TextMessage(`@all`).mentionAll();
conversation.send(message).then(function(message) {
  console.log('发送成功！');
}).catch(console.error);
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
await conv.SendMessageAsync(textMessage);
```

对于消息的接收方来说，可以通过调用 `mentionList` 和 `mentionAll` 的 getter 方法来获得提醒目标用户的信息，示例代码如下：

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

此外，并且为了方便应用层 UI 展现，我们特意为 `AVIMMessage` 增加了两个标识位，用来显示被提醒的状态：

- 一个是 `mentionedAll` 标识位，用来表示该消息是否提醒了当前对话的全体成员。只有 `mentionAll` 属性为 `true`，这个标识位才为 `true`，否则就为 `false`。
- 另一个是 `mentioned` 标识位，用来快速判断该消息是否提醒了当前登录用户。如果 `mentionList` 属性列表中包含有当前登录用户的 `clientId`，或者 `mentionAll` 属性为 `true`，那么 `mentioned` 方法都会返回 `true`，否则返回 `false`。

调用示例如下：

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentionedAll = receivedMessage.mentionedAll;
  var mentionedMe = receivedMessage.mentioned;
});
```
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前对话里的所有成员，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get this message mentioned all members of this conversion.
    BOOL mentionAll = message.mentionAll;
    BOOL mentionedMe = message.mentioned;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息是否 @ 了对话的所有成员
  boolean currentMsgMentionAllUsers = message.isMentionAll();
  boolean currentMsgMentionedMe = message.mentioned();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
         var mentionedAll = e.Message.MentionAll;
         // 判断当前用户是否被 @，dotNet SDK 还需要自己计算
         var mentioned = e.Message.MentionAll || e.Message.MentionList.Contains("Tom");
    }
}
```

### 消息的撤回和修改

> 需要在 **控制台** > **消息** > **设置** 中启用「聊天服务，对消息启用撤回功能」。

终端用户在消息发送之后，还可以对自己已经发送的消息进行修改（`Conversation#updateMessage` 方法）或撤回（`Conversation#recallMessage` 方法），目前即时通讯服务端并没有在时效性上进行限制，不过只允许用户修改或撤回自己发出去的消息，对别人的消息进行修改或撤回是被禁止的（错误码：）。

如果 Tom 要 ***撤回一条自己之前发送过的消息***，示例代码如下：

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

对于 Android 和 iOS SDK 来说，如果开启了消息缓存的选项的话（默认开启），SDK 内部需要保证数据的一致性，所以会先从缓存中删除这条消息记录，然后再通知应用层。对于开发者来说，收到这条通知之后刷新一下目标聊天页面，让消息列表更新即可（此时消息列表中的消息会直接变少，或者显示撤回提示）。

Tom 除了删除出错消息之外，还可以 ***直接修改原来的消息***。这时候不是直接在老的消息对象上修改，而是像发新消息一样创建一个消息实例，然后调用 `Conversation#updateMessage(oldMessage, newMessage)` 方法来向云端提交请求（C# SDK 接口例外），示例代码如下：

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
var newMessage = new AVIMTextMessage("修改后的消息内容");
await conversation.UpdateAsync(oldMessage, newMessage);
```

Tom 将消息修改成功之后，对话内的其他成员会立刻接收到 `MESSAGE_UPDATE` 事件：

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
tom.OnMessageUpdated += (sender, e) => {
  var message = (AVIMTextMessage) e.Message; // e.Messages  是一个集合，SDK 可能会合并多次消息修改统一分发
  Debug.Log(string.Format("内容 {0}, 消息 Id {1}", message.TextContent, message.Id));
};
```

对于 Android 和 iOS SDK 来说，如果开启了消息缓存的选项的话（默认开启），SDK 内部会先从缓存中修改这条消息记录，然后再通知应用层。所以对于开发者来说，收到这条通知之后刷新一下目标聊天页面，让消息列表更新即可（这时候消息列表会出现内容变化）。

### 暂态消息

有时候我们需要发送一些特殊的消息，譬如聊天过程中「某某正在输入…」这样的实时状态信息，或者当群聊的名称修改以后给该群成员发送「群名称被某某修改为 XX」这样的通知信息。这类消息与终端用户发送的消息不一样，发送者不要求把它保存到历史记录里，也不要求一定会被送达（如果成员不在线或者现在网络异常，那么没有下发下去也无所谓），这种需求可以使用「暂态消息」来实现。

「暂态消息」是一种特殊的消息，与普通消息相比有以下几点不同：

- 它不会被自动保存到云端，以后在历史消息中无法找到它
- 只发送给当时在线的成员，不支持延迟接收，离线用户更不会收到推送通知
- 对当时在线成员也不保证百分百送达，如果因为当时网络原因导致下发失败，服务端不会重试

我们可以用「暂态消息」发送一些实时的、频繁变化的状态信息，或者用来实现简单的控制协议。

暂态消息的数据和构造方式与普通消息是一样的，只是其发送方式与普通消息有一些区别。到目前为止，我们演示的 `AVIMConversation` 发送消息接口都是这样的：

```js
/**
 * 发送消息
 * @param  {Message} message 消息，Message 及其子类的实例
 * @return {Promise.<Message>} 发送的消息
 */
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

- 是否作为暂态消息发送（设置 `transient` 属性）；
- 服务端是否需要通知该消息的接收状态（设置 `receipt` 属性，消息回执，后续章节会进行说明）；
- 消息的优先级（设置 `priority` 属性，后续章节会说明）；
- 是否为「遗愿消息」（设置 `will` 属性，后续章节会说明）；
- 消息对应的离线推送内容（设置 `pushData` 属性，后续章节会说明），如果消息接收方不在线，会推送指定的内容。

如果我们需要让 Tom 在聊天页面的输入框获得焦点的时候，给群内成员同步一条「Tom is typing…」的状态信息，可以使用如下代码：

```js
const message = new TextMessage('Tom is typing…');
conversation.send(message, {transient: true});
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"Tom is typing…" attributes:nil];
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.transient = true;
[conversation sendMessage:message option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention all members has been sent. */
}];
```
```java
String content = "Tom is typing…";
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
var textMessage = new AVIMTextMessage("Tom is typing…")
{
    MentionAll = true
};
var option = new AVIMSendOptions(){Transient = true};
await conv.SendAsync(textMessage, option);
```

暂态消息的接收逻辑和普通消息一样，开发者可以按照消息类型进行判断和处理，这里不再赘述。上面使用了内建的文本消息只是一种示例，从展现端来说，我们如果使用特定的类型来表示「暂态消息」，是一种更好的方案。LeanCloud 即时通讯 SDK 并没有提供固定的「暂态消息」类型，可以由开发者根据自己的业务需要来实现专门的自定义，具体可以参考后述章节：[扩展自己的消息类型](#扩展自己的消息类型)。

### 消息回执

LeanCloud 即时通讯服务端在进行消息投递的时候，会按照消息上行的时间先后顺序下发（先收到的消息先下发，保证顺序性），且内部协议上会要求 SDK 对收到的每一条消息进行确认（ack）。如果 SDK 收到了消息，但是在发送 ack 的过程中出现网络丢包，即时通讯服务端还是会认为消息没有投递下去，之后会再次投递，直到收到 SDK 的应答确认为止。与之对应，SDK 内部也进行了消息去重处理，保证在上面这种异常条件下应用层也不会收到重复的消息。所以我们的消息系统从协议上是可以保证不丢任何一条消息的。

不过，有些业务场景会对消息投递的细节有更高的要求，例如消息的发送方要能知道什么时候接收方收到了这条消息，什么时候 ta 又点开阅读了这条消息。有一些偏重工作写作或者私密沟通的产品，消息发送者在发送一条消息之后，还希望能看到消息被送达和阅读的实时状态，甚至还要提醒未读成员。这样「苛刻」的需求，就依赖于我们的「消息回执」功能来实现。

与上一节「暂态消息」的发送类似，要使用消息回执功能，需要在发送消息时在 `AVIMMessageOption` 参数中标记「需要回执」选项：

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

> 注意：
>
> 只有在发送时设置了「需要回执」的标记，云端才会发送回执，默认不发送回执，且目前消息回执只支持单聊对话（成员不超过 2 人）。

那么发送方后续该如何响应回执的通知消息呢？

#### 送达回执

当接收方收到消息之后，云端会向发送方发出一个回执通知，表明消息已经送达。**请注意与「已读回执」区别开。**

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
public class CustomConversationEventHandler extends AVIMConversationEventHandler {
  /**
   * 实现本地方法来处理对方已经接收消息的通知
   */
  public void onLastDeliveredAtUpdated(AVIMClient client, AVIMConversation conversation) {
    ;
  }
}

// 设置全局的对话事件处理 handler
AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());
```
```cs
//Tom 用自己的名字作为 ClientId 建立了一个 AVIMClient
AVIMClient client = new AVIMClient("Tom");

//Tom 登录到系统
await client.ConnectAsync();

//设置送达回执
conversaion.OnMessageDeliverd += (s, e) =>
{
//在这里可以书写消息送达之后的业务逻辑代码
};
//发送消息
await conversaion.SendTextMessageAsync("夜访蛋糕店，约吗？");
```

请注意这里送达回执的内容，不是某一条具体的消息，而是当前对话内最后一次送达消息的时间戳（`lastDeliveredAt`）。最开始我们有过解释，服务端在下发消息的时候，是能够保证顺序的，所以在送达回执的通知里面，我们不需要对逐条消息进行确认，只给出当前确认送达的最新消息的时间戳，那么在这之前的所有消息就都是已经送达的状态。在 UI 层展示的时候，可以将早于 `lastDeliveredAt` 的消息都标记为「已送达」。

#### 已读回执

消息送达只是即时通讯服务端和客户端之间的投递行为完成了，可能终端用户并没有进入对话聊天页面，或者根本没有激活应用（Android 平台应用在后台也是可以收到消息的），所以「送达」并不等于终端用户真正「看到」了这条消息。

LeanCloud 即时通讯服务还支持「已读」消息的回执，不过这首先需要接收方显式完成消息「已读」的确认。

由于即时通讯服务端是顺序下发新消息的，客户端不需要对每一条消息单独进行「已读」确认。我们设想的场景如下图所示：

<img src="images/realtime_read_confirm.png" width="400" class="img-responsive" alt="在一个标题为「欢迎回来」的对话框中写着「好久不见！你有5002条未读消息。是否跳过这些消息？（选择“是”将清除所有未读消息标记）」。对话框的底部有两个按钮，分别为「是，跳过」和「否」。">

用户在进入一个对话的时候，一次性清除当前对话的所有未读消息即可。`Conversation` 的清除接口如下：

```js
/**
 * 将该会话标记为已读
 * @return {Promise.<this>} self
 */
async read();
```
```objc
/*!
 将对话标记为已读。
 该方法将本地对话中其他成员发出的最新消息标记为已读，该消息的发送者会收到已读通知。
 */
- (void)readInBackground;
```
```java
/**
 * 清除未读消息
 */
public void read();
```
```cs
// not support yet.
```

对方「阅读」了消息之后，云端会向发送方发出一个回执通知，表明消息已被阅读。

Tom 和 Jerry 聊天，Tom 想及时知道 Jerry 是否阅读了自己发去的消息，这时候双方的处理流程是这样的：

1. Tom 向 Jerry 发送一条消息，且标记为「需要回执」：
  
    ```js
    var message = new TextMessage('very important message');
    conversation.send(message, {
      receipt: true,
    });
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
    // not support yet.
    ```

2. Jerry 阅读 Tom 发的消息后，调用对话上的 `read` 方法把「对话中最近的消息」标记为已读：
  
    ```js
    conversation.read().then(function(conversation) {
      ;
    }).catch(console.error.bind(console));
    ```
    ```objc
    [conversation readInBackground];
    ```
    ```java
    conversation.read();
    ```
    ```cs
    // not support yet.
    ```

3. Tom 将收到一个已读回执，对话的 `lastReadAt` 属性会更新。此时可以更新 UI，把时间戳小于 `lastReadAt` 的消息都标记为已读。
  
    ```js
    var { Event } = require('leancloud-realtime');
    conversation.on(Event.LAST_READ_AT_UPDATE, function() {
      console.log(conversation.lastDeliveredAt);
      // 在 UI 中将早于 lastDeliveredAt 的消息都标记为「已送达」
    });
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
    public class CustomConversationEventHandler extends AVIMConversationEventHandler {
      /**
       * 实现本地方法来处理对方已经阅读消息的通知
       */
      public void onLastReadAtUpdated(AVIMClient client, AVIMConversation conversation) {
        /* Jerry 阅读了你的消息。可以通过调用 conversation.getLastReadAt() 来获得对方已经读取到的时间点 */
      }
    }

    // 设置全局的对话事件处理 handler
    AVIMMessageManager.setConversationEventHandler(new CustomConversationEventHandler());
    ```
    ```cs
    // not support yet.
    ```

> 注意：
>
> 要使用已读回执，应用需要在初始化的时候开启 [未读消息数更新通知](#未读消息数更新通知) 选项。

### 消息免打扰

假如某一用户不想再收到某对话的消息提醒，但又不想直接退出对话，可以使用静音操作，即开启「免打扰模式」。具体可以参考 [下一章：消息免打扰](realtime-guide-senior.html#消息免打扰)。

### Will（遗愿）消息

LeanCloud 即时通讯服务还支持一类比较特殊的消息：Will（遗愿）消息。「Will 消息」是在一个用户突然掉线之后，系统自动通知对话的其他成员关于该成员已掉线的消息，好似在掉线后要给对话中的其他成员一个妥善的交待，所以被戏称为「遗愿」消息，如下图中的「Tom 已断线，无法收到消息」：

<img src="images/lastwill-message.png" width="400" class="img-responsive" alt="Jerry 在一个名为「Tom & Jerry」的对话中收到内容为「Tom 已断线，无法收到消息」的 Will 消息。">

要发送 Will 消息，用户需要设定好消息内容发给云端，云端并不会将其马上发送给对话的成员，而是缓存下来，一旦检测到该用户掉线，云端立即将这条遗愿消息发送出去。开发者可以利用它来构建自己的断线通知的逻辑。

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

客户端发送完毕之后就完全不用再关心这条消息了，云端会自动在发送方异常掉线后通知其他成员，接收端则根据自己的需求来做 UI 的展现。

Will 消息有 **如下限制**：

- Will 消息是与当前用户绑定的，并且只对最后一次设置的「对话+消息」生效。如果用户在多个对话中设置了 Will 消息，那么只有最后一次设置有效；如果用户在同一个对话中设置了多条 Will 消息，也只有最后一次设置有效。
- Will 消息不会进入目标对话的消息历史记录。
- 当用户主动退出即时通讯服务时，系统会认为这是计划性下线，不会下发 Will 消息（如有）。

### 消息内容过滤

对于多人参与的聊天群组来说，内容的审核和实时过滤是产品运营上的基本要求。我们即时通讯服务默认提供了敏感词过滤的功能，具体可以参考 [下一章：消息内容的实时过滤](realtime-guide-senior.html#消息内容的实时过滤)。

### 本地发送失败的消息

有时你可能需要将发送失败的消息临时保存到客户端本地的缓存中，等到合适时机再进行处理。例如，将由于网络突然中断而发送失败的消息先保留下来，在消息列表中展示这种消息时，额外添加出错的提示符号和重发按钮，待网络恢复后再由用户选择是否重发。

即时通讯 Android 和 iOS SDK 默认提供了消息本地缓存的功能，消息缓存中保存的都是已经成功上行到云端的消息，并且能够保证和云端的数据同步。为了方便开发者，SDK 也支持将一时失败的消息加入到缓存中。

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
// 暂不支持
```

将消息从缓存中删除：

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
// 暂不支持
```

从缓存中取出来的消息，在 UI 展示的时候可以根据 `message.status` 的属性值来做不同的处理，`status` 属性为 `AVIMMessageStatusFailed` 时即表示是发送失败了的本地消息，这时可以在消息旁边显示一个重新发送的按钮。通过将失败消息加入到 SDK 缓存中，还有一个好处就是，消息从缓存中取出来再次发送，不会造成服务端消息重复，因为 SDK 有做专门的去重处理。

## 离线推送通知

对于移动设备来说，在聊天的过程中部分客户端难免会临时下线，如何保证离线用户也能及时收到消息，是我们需要考虑的重要问题。LeanCloud 即时通讯云端会在用户下线的时候，主动通过「Push Notification」这种外部方式来通知客户端新消息到达事件，以促使用户尽快打开应用查看新消息。

![iPhone 的屏幕顶端弹出了一条消息通知，包含应用名「LeanChat」以及通知内容「您有新的消息」。](images/realtime_ios_push.png)

LeanCloud 本就提供完善的 [消息推送服务](push_guide.html)，现在将推送与即时通讯服务无缝结合起来，LeanCloud 云端会将用户的即时通讯 `clientId` 与推送服务的设备数据 `_Installation` 自动进行关联。当用户 A 发出消息后，如果对话中部分成员当前不在线，而且这些成员使用的是 iOS、Windows Phone 设备，或者是成功开通 [混合推送功能](android_mixpush_guide.html) 的 Android 设备的话，LeanCloud 云端会自动将即时通讯消息转成特定的推送通知发送至客户端，同时我们也提供扩展机制，允许开发者对接第三方的消息推送服务。

要有效使用本功能，关键在于 **自定义推送的内容**。我们提供三种方式允许开发者来指定推送内容：

1. 静态配置提醒消息

  用户可以在控制台中为应用设置一个全局的静态 JSON 字符串，指定固定内容来发送通知。例如，我们进入 [控制台 > 消息 > 即时消息 > 设置 > 离线推送设置](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf)，填入：

  ```
  { "alert": "您有新的消息", "badge": "Increment" }
  ```

  那么在有新消息到达的时候，符合条件的离线用户会收到一条「您有新消息」的通知栏消息。

  注意，这里 `badge` 参数为 iOS 设备专用，且 `Increment` 大小写敏感，表示自动增加应用 badge 上的数字计数。清除 badge 的操作请参考 [iOS 推送指南 · 清除 badge](ios_push_guide.html#清除_Badge)。此外，对于 iOS 设备您还可以设置声音等推送属性，具体的字段可以参考 [推送 · 消息内容 Data](./push_guide.html#消息内容_Data)。

2. 客户端发送消息的时候额外指定推送信息

  第一种方法虽然发出去了通知，但是因为通知文本与实际消息内容完全无关，存在一些不足。有没有办法让推送消息的内容与即时通讯消息动态相关呢？
  
  还记得我们发送「暂态消息」时的 `AVIMMessageOption` 参数吗？即时通讯 SDK 允许客户端在发送消息的时候，指定附加的推送信息（在 `AVIMMessageOption` 中设置 `pushData` 属性），这样在需要离线推送的时候我们就会使用这里设置的内容来发出推送通知。示例代码如下：

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

  第二种方法虽然动态，但是需要在客户端发送消息的时候提前准备好推送内容，这对于开发阶段的要求比较高，并且在灵活性上有比较大的限制，所以看上去也不够完美。

  我们还提供了第三种方式，让开发者在推送动态内容的时候，也不失实现上的灵活性。这种方式需要使用 [即时通讯 Hook 机制](realtime-guide-systemconv.html#万能的 Hook 机制) 在服务端来统一指定离线推送消息内容，感兴趣的开发者可以参阅下述文档：

  - [详解消息 hook 与系统对话](realtime-guide-systemconv.html#_receiversOffline)
  - [即时通讯 Hook（云引擎 PHP 开发）](leanengine_cloudfunction_guide-php.html#_receiversOffline)
  - [即时通讯 Hook（云引擎 NodeJS 开发）](leanengine_cloudfunction_guide-node.html#_receiversOffline)
  - [即时通讯 Hook（云引擎 Python 开发）](leanengine_cloudfunction_guide-python.html#_receiversOffline)


三种方式之间的优先级如下：**服务端动态生成通知 > 客户端发送消息的时候额外指定推送信息 > 静态配置提醒消息**。

也就是说如果开发者同时采用了多种方式来指定消息推送，那么有服务端动态生成的通知的话，最后以它为准进行推送。其次是客户端发送消息的时候额外指定推送内容，最后是静态配置的提醒消息。

### 实现原理与限制

同时使用了 LeanCloud 推送服务和即时通讯服务的应用，客户端在成功登录即时通讯服务时，SDK 会自动关联当前的 `clientId` 和设备数据（推送服务中的 `Installation` 表）。关联的方式是通过让目标设备 **订阅** 名为 `clientId` 的 Channel 实现的。开发者可以在数据存储的 `_Installation` 表中的 `channels` 字段查到这组关联关系。在实际离线推送时，云端系统会根据用户 `clientId` 找到对应的关联设备进行推送。

由于即时通讯触发的推送量比较大，内容单一， 所以推送服务云端不会保留这部分记录，开发者在 **控制台 > 消息 > 推送记录** 中也无法找到这些记录。

LeanCloud 推送服务的通知过期时间是 7 天，也就是说，如果一个设备 7 天内没有连接到 APNs、MPNs 或设备对应的混合推送平台，系统将不会再给这个设备推送通知。

### 其他推送设置

推送默认使用 **生产证书**，开发者可以在 JSON 中增加一个 `_profile` 内部属性来选择实际推送的证书，如：

```json
{
  "alert":    "您有一条未读消息",
  "_profile": "dev"
}
```

Apple 不允许在一次推送请求中向多个从属于不同 Team ID 的设备发推送。在使用 iOS Token Authentication 的鉴权方式后，如果应用配置了多个不同 Team ID 的 Private Key，请确认目标用户设备使用的 APNs Team ID 并将其填写在 `_apns_team_id` 参数内，以保证推送正常进行，只有指定 Team ID 的设备能收到推送。如：

```json
{
  "alert":         "您有一条未读消息",
  "_apns_team_id": "my_fancy_team_id"
}
```

`_profile` 和 `_apns_team_id` 属性均不会实际推送。

目前，[控制台 > 消息 > 即时消息 > 设置 > 离线推送设置](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 这里的推送内容也支持一些内置变量，你可以将上下文信息直接设置到推送内容中：

* `${convId}` 推送相关的对话 ID
* `${timestamp}` 触发推送的时间戳（Unix 时间戳）
* `${fromClientId}` 消息发送者的 `clientId`

iOS 和 Android 分别提供了内置的离线消息推送通知服务，但是使用的前提是按照推送文档配置 iOS 的推送证书和 Android 开启推送的开关，详细请阅读如下文档：

1. [消息推送服务总览](push_guide.html)
2. [Android 消息推送开发指南](android_push_guide.html) / [iOS 消息推送开发指南](ios_push_guide.html)

## 离线消息同步

离线推送通知是一种提醒用户的非常有效手段，但是如果用户不上线，即时通讯的消息就总是无法下发，客户端如果长时间下线，会导致大量消息堆积在云端，此后如果用户再上线，我们该如何处理才能保证消息完全不丢失呢？

LeanCloud 提供两种方式进来同步离线消息：

- 一种是云端主动往客户端「推」的方式。云端会记录用户在每一个参与对话中接收消息的位置，在用户登录上线后，会以对话为单位来主动、多次推送离线消息（客户端按照新消息进行处理）。对每个对话，云端推送至多 20 条离线消息，更多消息则不会推送。
- 另一种是客户端主动从云端「拉」的方式。云端会记录下用户在每一个参与对话中接收的最后一条消息的位置，在用户重新登录上线后，实时计算出用户离线期间产生未读消息的对话列表及对应的未读消息数，以「未读消息数更新」的事件通知到客户端，然后客户端在需要的时候来主动拉取这些离线消息。

第一种方式实现简单，但是因为云端对一个对话只主动推送 20 条离线消息，更多未读消息对客户端来说是透明的，所以只能满足一些轻量级的应用需求，如果产品层要在一个对话内显示消息阅读的进度，或者用精确的未读消息数来提示用户，就无法做到了。因此我们现在都切换到了第二种客户端主动「拉」的方式。

由于历史原因，不同平台的 SDK 对两种方式的支持度是不一样的：
1. Android、iOS SDK 同时支持这两种方式，且默认是「推」的方式
2. JavaScript SDK 默认支持「拉」的方式
3. dotNet SDK 目前还不支持第二种方式。

> 注意，请不要混合使用上面两种方式，比如在 iOS 平台使用第一种方式获取离线消息，而 Android 平台使用第二种方式获取离线消息，可能导致所有离线消息无法正常获取。

### 未读消息数更新通知

「未读消息数更新通知」是客户端主动「拉」离线消息这一同步方案的主要变化点。在客户端重新登录上线后，即时通讯云端会实时计算下线时间段内当前用户参与过的对话中的新消息数量，

客户端只有设置了主动拉取的方式，云端才会在必要的时候下发这一通知。如前所述，对于 JavaScript SDK 来说，默认就是客户端主动拉取未读消息，所以不需要再做什么设置。对于 Android 和 iOS SDK 来说，则需要在 `AVOSCloud` 初始化语句后面加上如下语句，明确切换到「拉取」的离线消息同步方式：

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

客户端 SDK 会在 `AVIMConversation` 上维护一个 `unreadMessagesCount` 字段，来统计当前对话中存在有多少未读消息。

客户端用户登录之后，云端会以「未读消息数更新」事件的形式，将当前用户所在的多对 `<Conversation, UnreadMessageCount, LastMessage>` 数据通知到客户端，这就是客户端维护的 `<Conversation, UnreadMessageCount>` 初始值。之后 SDK 在收到新的在线消息的时候，会自动增加对应的 `unreadMessageCount` 计数。直到用户把某一个对话的未读消息清空，这时候云端和 SDK 的 `<Conversation, UnreadMessageCount>` 计数都会清零。

> 注意：开启未读消息数后，即使客户端在线收到了消息，未读消息数量也会增加，因此开发者需要在合适时机重置未读消息数。

客户端 SDK 在 `<Conversation, UnreadMessageCount>` 数字变化的时候，会通过 `IMClient` 派发 `未读消息数量更新（UNREAD_MESSAGES_COUNT_UPDATE）` 事件到应用层。开发者可以监听 `UNREAD_MESSAGES_COUNT_UPDATE` 事件，在对话列表界面上更新这些对话的未读消息数量，不过考虑到这个通知回调会非常频繁，并且未读消息数量变化的通知一般也都是伴随其他事件产生的，所以建议开发者 ***对于此通知不做特殊处理*** 即可。

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

对开发者来说，在 `UNREAD_MESSAGES_COUNT_UPDATE` 事件响应的时候，SDK 传给应用层的 `Conversation` 对象，其 `lastMessage` 应该是当前时点当前用户在当前对话里面接收到的最后一条消息，开发者如果要展示更多的未读消息，就需要通过 [消息拉取](realtime-guide-beginner.html#聊天记录查询) 的接口来主动获取了。

清除对话未读消息数的唯一方式是调用 `Conversation#read` 方法将对话标记为已读，一般来说开发者至少需要在下面两种情况下将对话标记为已读：

- 在对话列表点击某对话进入到对话页面时
- 用户正在某个对话页面聊天，并在这个对话中收到了消息时

## 多端登录与单设备登录

一个用户可以使用相同的账号在不同的客户端上登录（例如 QQ 网页版和手机客户端可以同时接收到消息和回复消息，实现多端消息同步），而有一些场景下，需要禁止一个用户同时在不同客户端登录，例如我们不能用同一个微信账号在两个手机上同时登录。LeanCloud 即时通讯服务提供了灵活的机制，来满足 ***多端登录*** 和 ***单设备登录*** 这两种完全相反的需求。

即时通讯 SDK 在生成 `IMClient` 实例的时候，允许开发者在 `clientId` 之外，增加一个额外的 `tag` 标记。云端在用户登录的时候，会检查 `<ClientId, Tag>` 组合的唯一性。如果当前用户已经在其他设备上使用同样的 `tag` 登录了，那么云端会强制让之前登录的设备下线。如果多个 `tag` 不发生冲突，那么云端会把他们当成独立的设备进行处理，应该下发给该用户的消息会分别下发给所有设备，不同设备上的未读消息计数则是合并在一起的（各端之间消息状态是同步的）；该用户在单个设备上发出来的上行消息，云端也会默认同步到其他设备。

以 QQ 那样的多端登录需求为例，我们可以设计三种 `tag`：`Mobile`、`Pad`、`Web`，分别对应三种类型的设备：手机、平板和电脑，那么用户分别在三种设备上登录就都是允许的，但是却不能同时在两台电脑上登录。

> 如果不设置 `tag`，则默认对用户的多端登录不作限制。如果所有客户端都只使用一个 `tag`，那么就可以实现「单设备登录」的效果了。

### 设置登录标记

按照上面的方案，以手机端登录为例，在创建 `IMClient` 实例的时候，我们增加 `tag: Mobile` 这样的标记：

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
AVIMClient currentClient = AVIMClient.getInstance(clientId, "Mobile");
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

之后如果同一个用户在另一个手机上再次登录，则较早前登录系统的客户端会被强制下线。

### 处理登录冲突

即时通讯云端在登录用户的 `<ClientId, Tag>` 相同的时候，总是踢掉较早登录的设备，这时候较早登录设备端会收到被云端下线（`CONFLICT`）的事件通知：

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
public class AVImClientManager extends AVIMClientEventHandler {
  /**
   * 实现本方法以处理当前登录被踢下线的情况
   *
   * 
   * @param client
   * @param code 状态码说明被踢下线的具体原因
   */
  @Override
  public void onClientOffline(AVIMClient avimClient, int i) {
    if(i == 4111){
      // 适当地弹出友好提示，告知当前用户的 Client Id 在其他设备上登陆了
    }
  }
}

// 自定义实现的 AVIMClientEventHandler 需要注册到 SDK 后，SDK 才会通过回调 onClientOffline 来通知开发者
AVIMClient.setClientEventHandler(new AVImClientManager());
```
```cs
tom.OnSessionClosed += Tom_OnSessionClosed;
private void Tom_OnSessionClosed(object sender, AVIMSessionClosedEventArgs e)
{
}
```

如上述代码中，被动下线的时候，云端会告知原因，因此客户端在做展现的时候也可以做出类似于 QQ 一样友好的通知。

## 扩展自己的消息类型

尽管即时通讯服务默认已经包含了丰富的消息类型，但是我们依然支持开发者根据业务需要扩展自己的消息类型，例如允许用户之间发送名片、红包等等。这里「名片」和「红包」就可以是应用层定义的自己的消息类型。

### 扩展机制说明

{{ docs.langSpecStart('js') }}

通过继承 TypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 申明新的消息类型，继承自 TypedMessage 或其子类，然后：
  * 对 class 使用 `messageType(123)` 装饰器，具体消息类型的值（这里是 `123`）由开发者自己决定（LeanCloud 内建的 [消息类型使用负数](realtime-guide-beginner.html#内建消息类型)，所有正数都预留给开发者扩展使用）。
  * 对 class 使用 `messageField(['fieldName'])` 装饰器来声明需要发送的字段。
* 调用 `Realtime#register()` 函数注册这个消息类型。

举个例子，实现一个在 [暂态消息](#暂态消息) 中提出的 `OperationMessage`：

```js
// TypedMessage, messageType, messageField 都是由 leancloud-realtime 这个包提供的
// 在浏览器中则是 var { TypedMessage, messageType, messageField } = AV;
var { TypedMessage, messageType, messageField } = require('leancloud-realtime');
var inherit = require('inherit');
// 定义 OperationMessage 类，用于发送和接收所有的用户操作消息
export const OperationMessage = inherit(TypedMessage);
// 指定 type 类型，可以根据实际换成其他正整数
messageType(1)(OperationMessage);
// 申明需要发送 op 字段
messageField('op')(OperationMessage);
// 注册消息类，否则收到消息时无法自动解析为 OperationMessage
realtime.register(OperationMessage);
```

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('objc') }}

继承于 `AVIMTypedMessage`，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现 `AVIMTypedMessageSubclassing` 协议；
* 子类将自身类型进行注册，一般可在子类的 `+load` 方法或者 UIApplication 的 `-application:didFinishLaunchingWithOptions:` 方法里面调用 `[YourClass registerSubclass]`。

```objc
// 定义

@interface CustomMessage : AVIMTypedMessage <AVIMTypedMessageSubclassing>

+ (AVIMMessageMediaType)classMediaType;

@end

@implementation CustomMessage

+ (AVIMMessageMediaType)classMediaType {
    return 123;
}

@end

// 1. register subclass
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [CustomMessage registerSubclass];
}
// 2. received message
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (message.mediaType == 123) {
        CustomMessage *imageMessage = (CustomMessage *)message;
        // handle image message.
    }
}
```

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

继承于 `AVIMTypedMessage`，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 `AVIMTypedMessage`。这里需要注意：
  * 在 class 上增加一个 `@AVIMMessageType(type=123)` 的 Annotation<br/>具体消息类型的值（这里是 `123`）由开发者自己决定。LeanCloud 内建的消息类型使用负数，所有正数都预留给开发者扩展使用。
  * 在消息内部声明字段属性时，要增加 `@AVIMMessageField(name="")` 的 Annotation<br/>`name` 为可选字段，同时自定义的字段要有对应的 getter/setter 方法。
  * **请不要遗漏空的构造方法和 Creator 的代码**（参考下面的示例代码），否则会造成类型转换失败。
* 调用 `AVIMMessageManager.registerAVIMMessageType()` 函数进行类型注册。
* 调用 `AVIMMessageManager.registerMessageHandler()` 函数进行消息处理 handler 注册。

`AVIMTextMessage` 的源码如下，可供参考：

```java
@AVIMMessageType(type = AVIMMessageType.TEXT_MESSAGE_TYPE)
public class AVIMTextMessage extends AVIMTypedMessage {
  // 空的构造方法，不可遗漏
  public AVIMTextMessage() {

  }

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
  // Creator 不可遗漏
  public static final Creator<AVIMTextMessage> CREATOR = new AVIMMessageCreator<AVIMTextMessage>(AVIMTextMessage.class);
}
```

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

首先定义一个自定义的子类继承自 `AVIMTypedMessage`：
```cs
// 定义自定义消息类名
[AVIMMessageClassName("InputtingMessage")]
// 标记消息类型，仅允许使用正整数，LeanCloud 保留负数内部使用
[AVIMTypedMessageTypeIntAttribute(2)]
public class InputtingMessage : AVIMTypedMessage
{
    public InputtingMessage() { }
    // 我们在发送消息时可以附带一个 Emoji 表情，这里用 Ecode 来表示表情编码
    [AVIMMessageFieldName("Ecode")]
    public string Ecode { get; set; }
}
```

然后在初始化的时候注册这个子类：

```cs
realtime.RegisterMessageType<InputtingMessage>();
```

到这里，自定义消息的工作就完成了。

现在我们发送一个自己定义的消息：

```cs
var inputtingMessage = new InputtingMessage();
// 这里的 TextContent 继承自 AVIMTypedMessage
inputtingMessage.TextContent = "对方正在输入…";
// 这里的 Ecode 是我们刚刚自己定义的
inputtingMessage.Ecode = "#e001";
        
// 执行此行代码前，用户已经登录并拿到了当前的 conversation 对象
await conversation.SendMessageAsync(inputtingMessage);
```

在同一个 `conversation` 中的其他用户，接收该条自定义消息的方法为：

```cs
async void Start() 
{   
    var jerry = await realtime.CreateClientAsync("jerry");
    // 接收消息事件
    jerry.OnMessageReceived += Jerry_OnMessageReceived;
}
void Jerry_OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is InputtingMessage)
    {
        var inputtingMessage = (InputtingMessage)e.Message;
        Debug.Log(string.Format("收到自定义消息 {0} {1}", inputtingMessage.TextContent, inputtingMessage.Ecode));
    }
}
```

在这个案例中，通过「对方正在输入…」这种场景，我们介绍了如何自定义消息，但要真正实现「对方正在输入…」这个完整的功能，我们还需要指定该条消息为「[暂态消息](#暂态消息)」。

{{ docs.langSpecEnd('cs') }}

自定义消息的接收，可以参看 [前一章：再谈接收消息](realtime-guide-beginner.html#再谈接收消息)。

### 什么时候需要自定义消息

即时通讯 SDK 默认提供了多种消息类型用来满足常见的需求：

- `TextMessage` 文本消息
- `ImageMessage` 图像消息
- `AudioMessage` 音频消息
- `VideoMessage` 视频消息
- `FileMessage` 普通文件消息(.txt/.doc/.md 等各种)
- `LocationMessage` 地理位置消息

这些消息类型还支持应用层设置若干 key-value 自定义属性来实现扩展。譬如有一条图像消息，除了文本之外，还需要附带地理位置信息，这时候开发者使用消息类中预留的 {{attributes}} 属性就可以保存额外信息了，并不需要去实现一个复杂的自定义消息。

因此，我们建议只有在默认的消息类型完全无法满足需求的时候，才去使用自定义的消息类型。

## 进一步阅读

[三，安全与签名、黑名单和权限管理、玩转直播聊天室和临时对话](realtime-guide-senior.html)

[四，详解消息 hook 与系统对话，打造自己的聊天机器人](realtime-guide-systemconv.html)
