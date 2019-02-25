{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 即时通讯开发指南：玩转开放聊天室，允许撤回和修改消息，敏感词过滤和离线通知

## 本章导读

在前一章[从简单的单聊、群聊、收发图文消息开始](realtime-guide-beginner.html)里面，我们说明了如何在产品中增加一个基本的单聊/群聊页面，并响应服务端实时事件通知。接下来，在本篇文档中我们会讲解如何实现一些更复杂的业务需求，例如：
- 如何处理消息的已读状态
- 如何发送带有成员提示的消息
- 如何支持消息的撤回和修改
- 如何解决成员离线状态下的消息通知
- 如何实现一个不限人数的直播聊天室
- 如何对大型聊天室中的消息进行实时内容过滤

## 对消息收发的更多需求

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
AVIMMessageOption option = new AVIMMessageOption();
option.setReceipt(true);
imConversation.sendMessage(message, option, new AVIMConversationCallback() {
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

AVIMMessageOption option = new AVIMMessageOption();
option.setReceipt(true);

imConversation.sendMessage(message, option, new AVIMConversationCallback() {
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

暂态消息不会被自动保存，以后在历史消息中无法找到它，也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来做控制协议。譬如聊天过程中「某某正在输入...」这样的状态信息就适合通过暂态消息来发送；或者当群聊的名称修改以后，也可以用暂态消息来通知该群的成员「群名称被某某修改为...」。

发送暂态消息与普通消息类似：

```js
const message = new TextMessage('Tom is typing...');
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
await conv.SendAsync(textMessage);
```

暂态消息的接收逻辑和普通消息一样，开发者可以按照消息类型进行判断和处理，这里不再赘述。

### 消息回执

有一些偏重工作写作或者私密沟通的产品，消息发送者在发送一条消息之后，还希望能看到消息被送达和阅读的实时状态，甚至还要提醒未读成员。这样苛刻的需求，使用 LeanCloud 即时通讯服务也是可以实现的。

在对方收到消息以及对方阅读了消息之后，云端可以向发送方分别发送一个回执通知。要使用消息回执功能，需要在发送消息时标记「需要回执」选项：

```js
var message = new TextMessage('very important message');
conversation.send(message, {
  receipt: true,
});
```
```java
AVIMMessageOption messageOption = new AVIMMessageOption();
messageOption.setReceipt(true);
```
```objc
[conversation sendMessage:message options:AVIMMessageSendOptionRequestReceipt callback:^(BOOL succeeded, NSError *error) {
  if (succeeded) {
    NSLog(@"发送成功！需要回执");
  }
}];
```
```cs
```

{{ docs.note("只有在发送时设置了「需要回执」的标记，云端才会发送回执，默认不发送回执。") }}

#### 送达回执

当对方收到消息之后，云端会向发送方发出一个回执通知，表明消息已经送达，但这并**不代表用户已读**。送达回执**仅支持单聊**。

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.LAST_DELIVERED_AT_UPDATE, function() {
  console.log(conversation.lastDeliveredAt);
  // 在 UI 中将早于 lastDeliveredAt 的消息都标记为「已送达」
});
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

```objc
// 监听消息是否已送达实现 `conversation:messageDelivered` 即可。
- (void)conversation:(AVIMConversation *)conversation messageDelivered:(AVIMMessage *)message{
    NSLog(@"%@", @"消息已送达。"); // 打印消息
}
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
    ```cs
    ```

2. Jerry 阅读 Tom 发的消息后，调用对话上的方法把「对话中最近的消息」标记为已读：
  
    ```js
    ```
    ```java
    conv.read();
    ```
    ```objc
    [conversation readInBackground];
    ```
    ```cs
    ```

3. Tom 将收到一个已读回执，对话的 `lastReadAt` 属性会更新。此时可以更新 UI，把时间戳小于 lastReadAt 的消息都标记为已读。
  
    ```js
    ```
    ```java
    onLastReadAtUpdated(AVIMClient client, AVIMConversation conversation) {
      /* Jerry 阅读了你的消息。可以通过调用 conversation.getLastReadAt() 来获得对方已经读取到的时间点
    }
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
    ```cs
    ```


## 离线状态下的消息同步

对于移动设备来说，在聊天的过程中总会有部分客户端临时下线。LeanCloud 提供了两种机制来应对这种场景：
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

## 群组、开放聊天室、系统对话、临时对话的选择

在前一章中，我们创建了普通的 Conversation 对象，并且仅仅依靠成员人数的多少来区分了单聊和群聊两种不同的使用场景。在 LeanCloud 即时通讯服务中，一个普通的群聊支持的成员人数是有上限的（不超过 500），而我们有时候业务上可能会突破这些限制，例如：

- 网络红人、赛事、电视直播中用户互动
- 游戏公会/帮派的群聊
- 系统账号或者公众号，需要跟超大量级的用户进行互动

这些场景里都需要一个实际的、一直可用的「对话」，作为把相关用户组织或者联系在一起的纽带。

还有一种情况，例如客服系统，一个用户连上来反馈一些问题，然后由系统自动分配一位在席客服与之沟通，随着问题的解决或者时间的推移，之前的「对话」就失去了存续的意义。

我们作为一个通用服务的提供者，根据这些使用场景和需求，设计了多种不同类型的对话，来满足您的需求。

### 根据场景选择对话类型

我们默认提供了以下四种对话类型：

- 普通对话 `Conversation`
- 聊天室 `ChatRoom`
- 服务号 & 系统账号 `ServiceConversation`
- 临时对话 `TemporaryConversation`

其差异和适用场景，可以参考[总览：对话](realtime_v2.html#对话（Conversation）)。

### 普通对话

普通对话 `Conversation` 有一个典型用例：

[即时通讯开发指南 &middot; 基础入门#一对一单聊](realtime-guide-beginner.html#一对一单聊)中介绍了如何建立一个一对一单聊，实际上这种单聊已经对应到了社交软件中的私聊，因为对话里面只有两个成员，如果在之后的操作中能确保**不会向当前对话继续添加新成员**，这个对话就可以用以应对社交聊天中的私聊场景。

此处需要注意如下事项：

- 假设 A 和 B 想要同时与 C 在一个对话进行聊天，此时最佳的使用方式是创建一个全新的对话，包含 A、B、C。
- 假设 A 重新登录之后，想要获取与 B 的私聊，可以通过创建对话的接口，传入一个 `isUnique` 为 true 即可，这个参数的含义是：如果 A 和 B 已经存在一个私聊，就会直接返回这个对话的 Id，而如果不存在，则会创建一个全新的对话返回，无需先查询再创建。

### 聊天室

聊天室和普通对话有如下区别：

1. 无人数限制（而普通对话最多允许 500 人加入）
2. 不支持查询成员列表，但可以通过相关 API 查询在线人数。
3. 不支持离线消息、离线推送通知、消息回执等功能。
4. 没有成员加入、成员离开的通知。
5. 一个用户一次登录只能加入一个聊天室，加入新的聊天室后会自动离开原来的聊天室。
6. 加入后半小时内断网重连会自动加入原聊天室，超过这个时间则需要重新加入

所以开发者可以根据上述特性比对实际需求来选择对话类型来构建自己的业务场景。

> 注意：虽然聊天室不限制成员数量，但从实际经验来看，如果人数过多，那么聊天室内消息被放大的效果会非常明显，对于终端用户而言即表现为过量消息不断刷屏，反而影响用户体验。我们建议每个聊天室的上限人数控制在 5000 人左右。开发者可以考虑从应用层面将大聊天室拆分成多个较小的聊天室。

下面我们看一下该怎么样来使用聊天室。

####  创建聊天室实例

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

#### 查找聊天室列表

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

#### 加入/离开/邀请他人加入聊天室

查询到聊天室之后，加入/离开/邀请他人加入聊天室与普通对话的对应接口没有区别，详细请参考[基础入门#多人群聊](realtime-guide-beginner.html#多人群聊)。最大的区别就是：

> 聊天室没有成员加入、成员离开的通知

#### 消息等级
为了保证消息的时效性，当聊天室消息过多导致客户端连接堵塞时，服务器端会选择性地丢弃部分低等级的消息。目前支持的消息等级有：

| 消息等级                 | 描述                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `MessagePriority.HIGH`   | 高等级，针对时效性要求较高的消息，比如直播聊天室中的礼物，打赏等。 |
| `MessagePriority.NORMAL` | 正常等级，比如普通非重复性的文本消息。                             |
| `MessagePriority.LOW`    | 低等级，针对时效性要求较低的消息，比如直播聊天室中的弹幕。         |

消息等级在发送接口的参数中设置。以下代码演示了如何发送一个高等级的消息：

<div class="callout callout-info">此功能仅针对<u>聊天室消息</u>有效。普通对话的消息不需要设置等级，即使设置了也会被系统忽略，因为普通对话的消息不会被丢弃。</div>

### 服务号（系统账号）

服务号（或系统账号）与普通对话的区别如下：

1. 服务号的创建必须由服务端发起，在客户端仅允许订阅一个服务号。
2. 在服务号里，既可以给所有订阅者发送全局消息，也可以单独某一个或者某几个用户发消息。

其他操作与普通对话无异，更多功能请查看[即时通讯 - 服务号开发指南](realtime-service-account.html)。


### 临时对话

临时对话最大的特点是**较短的有效期**，这个特点可以解决对话的持久化存储在服务端占用的存储资源越来越大、开发者需要支付的成本越来越高的问题，也可以应对一些临时聊天的场景。

#### 临时对话实例

买家询问商品的详情，可以发起一个临时对话：

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

其他操作与普通对话无异，更多功能请查看[即时通讯 - 临时对话开发指南](realtime-temporary-conversation.html)。

## 给对话添加自定义属性

对话(`Conversation`)是即时通讯的核心逻辑对象，它有一些内置的常用的属性，与控制台中 `_Conversation` 表是一一对应的。

默认提供的**内置**属性的对应关系如下：

{{ docs.langSpecStart('js') }}

| Conversation 属性名   | _Conversation 字段 | 含义                                               |
| --------------------- | ------------------ | -------------------------------------------------- |
| `id`                  | `objectId`         | 全局唯一的 Id                                      |
| `name`                | `name`             | 成员共享的统一的名字                               |
| `members`             | `m`                | 成员列表                                           |
| `creator`             | `c`                | 对话创建者                                         |
| `transient`           | `tr`               | 是否为聊天室（暂态对话）                           |
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

{{ docs.langSpecStart('objc') }}

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                               |
| ----------------------- | ------------------ | -------------------------------------------------- |
| `conversationId`        | `objectId`         | 全局唯一的 Id                                      |
| `name`                  | `name`             | 成员共享的统一的名字                               |
| `members`               | `m`                | 成员列表                                           |
| `creator`               | `c`                | 对话创建者                                         |
| `attributes`            | `attr`             | 自定义属性                                         |
| `transient`             | `tr`               | 是否为聊天室（暂态对话）                           |
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

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| `conversationId`        | `objectId`         | 全局唯一的 Id                                    |
| `name`                  | `name`             | 成员共享的统一的名字                             |
| `members`               | `m`                | 成员列表                                         |
| `creator`               | `c`                | 对话创建者                                       |
| `attributes`            | `attr`             | 自定义属性                                       |
| `isTransient`           | `tr`               | 是否为聊天室（暂态对话）                         |
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

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| `Id`                    | `objectId`         | 全局唯一的 Id                                    |
| `Name`                  | `name`             | 成员共享的统一的名字                             |
| `MemberIds`             | `m`                | 成员列表                                         |
| `MuteMemberIds`         | `mu`               | 静音该对话的成员                                 |
| `Creator`               | `c`                | 对话创建者                                       |
| `IsTransient`           | `tr`               | 是否为聊天室（暂态对话）                         |
| `IsUnique`              | `unique`           | 是否为相同成员的唯一对话（暂态对话）             |
| `IsSystem`              | `sys`              | 是否为系统对话                                   |
| `LastMessageAt`         | `lm`               | 该对话最后一条消息，也可以理解为最后一次活跃时间 |
| `LastMessage`           | N/A                | 最后一条消息，可能会空                           |
| `LastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间         |
| `LastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间           |
| `CreatedAt`             | `createdAt`        | 创建时间                                         |
| `UpdatedAt`             | `updatedAt`        | 最后更新时间                                     |

{{ docs.langSpecEnd('cs') }}


### 创建自定义属性

创建时可以指定一些自定义属性：

```js
tom.createConversation({
  members: ['Jerry'],
  name: '猫和老鼠',
  type: 'private',
  pinned: true,
}).then(function(conversation) {
  console.log('创建成功。id: ' + conversation.id);
}).catch(console.error.bind(console));
```
```objc
// Tom 创建名称为「猫和老鼠」的会话，并附加会话属性
NSDictionary *attributes = @{ 
    @"type": @"private",
    @"pinned": @(YES) 
};
[tom createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] attributes:attributes options:AVIMConversationOptionNone callback:^(AVIMConversation *conversation, NSError *error) {
    if (succeeded) {
        NSLog(@"创建成功！");
    }
}];
```
```java
HashMap<String,Object> attr = new HashMap<String,Object>();
attr.put("type","private");
attr.put("pinned",true);
client.createConversation(Arrays.asList("Jerry"),"猫和老鼠",attr,
    new AVIMConversationCreatedCallback(){
        @Override
        public void done(AVIMConversation conv,AVIMException e){
          if(e==null){
            //创建成功
          }
        }
    });
}
```
```cs
// 推荐使用 Builder 模式来构建对话
var conversationBuilder = tom.GetConversationBuilder().SetProperty("type", "private").SetProperty("pinned", true);
var conversation = await tom.CreateConversationAsync(conversationBuilder);
```

**自定义属性在 SDK 级别是对所有成员可见的**。我们也支持通过自定义属性来查询对话，请参见[对话的查询](#对话的查询)

### 修改和使用属性

以 `conversation.name` 为例，对话的 `conversation.name` 的属性是所有成员共享的，可以通过如下代码修改：

```js
conversation.name = '聪明的喵星人';
conversation.save();
```
```objc
AVIMConversationUpdateBuilder *updateBuilder = [conversation newUpdateBuilder];
updateBuilder.name = @"聪明的喵星人";
[conversation update:[updateBuilder dictionary] callback:^(BOOL succeeded, NSError *error) {
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
    //更新成功
    }
  }
});
```
```cs
conversation.Name = "聪明的喵星人";
await conversation.SaveAsync();
```

以 `conversation.type` 为例来演示自定义属性，读取、使用、修改的操作如下：

```js
// 获取自定义属性
var type = conversation.get('type');
conversation.set('pinned',false);
conversation.save();
```
```objc
// 获取自定义属性
NSString *type = [conversation objectForKey:@"type"];
// 设置 boolean 属性值
[conversation setObject:@(NO) forKey:@"pinned"];
[conversation updateWithCallback:];
```
```java
// 获取自定义属性
String type = conversation.get("type");
conversation.set("pinned",false);
conversation.updateInfoInBackground(new AVIMConversationCallback(){
  @Override
  public void done(AVIMException e){        
    if(e==null){
    //更新成功
    }
  }
});
```
```cs
// 获取自定义属性
var type = conversation["type"];
conversation["pinned"] = false;
await conversation.SaveAsync();
```


## 对话查询

### 根据 id 查询

`id` 对应就是 `_Conversation` 表中的 `objectId` 的字段值:

```js
tom.getConversation('551260efe4b01608686c3e0f').then(function(conversation) {
  console.log(conversation.id);
}).catch(console.error.bind(console));
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
        //convs.get(0) 就是想要的conversation
      }
      }
    }
});
```
```cs
var query = tom.GetQuery();
var conversation = await query.GetAsync("551260efe4b01608686c3e0f");
```

{{ docs.langSpecStart('java') }}
由于历史原因，AVIMConversationQuery 只能检索 _Conversation 表中 attr 列中的属性，而不能完整检索 _Conversation 表的其他自定义属性，所以在 v4.1.1 版本之后被废弃。v4.1.1 后请使用 AVIMConversation**s**Query 来完成相关查询。AVIMConversationsQuery 在查询属性时不会再自动添加 attr 前缀，如果开发者需要查询 _Conversation 表中 attr 列中具体属性，请自行添加 attr 前缀。
{{ docs.langSpecEnd('java') }}

### 基础的条件查询

> 对云存储熟悉的开发者可以更容易理解对话的查询构建，因为对话查询和云存储的对象查询在接口上是十分接近的。

SDK 提供了各种条件查询方式，可以满足各种对话查询的需求，首先从最简单的 `equalTo` 开始。

有如下需求：需要查询所有对话的一个自定义属性 `type`(字符串类型) 为 `private` 的对话需要如下代码：

```js
query.equalTo('type','private')
```
```objc
[query whereKey:@"type" equalTo:@"private"];
```
```java
query.whereEqualTo("type","private");
```
```cs
query.WhereEqualTo("type","private");
```

与 `equalTo` 类似，针对 number 和 date 类型的属性还可以使用大于、大于等于、小于、小于等于等，详见下表：

{{ docs.langSpecStart('js') }}

| 逻辑比较 | ConversationQuery 方法 |     |
| -------- | ---------------------- | --- |
| 等于     | `equalTo`              |     |
| 不等于   | `notEqualTo`           |     |
| 大于     | `greaterThan`          |     |
| 大于等于 | `greaterThanOrEqualTo` |     |
| 小于     | `lessThan`             |     |
| 小于等于 | `lessThanOrEqualTo`    |     |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('objc') }}
| 逻辑比较 | AVIMConversationQuery 方法 |     |
| -------- | -------------------------- | --- |
| 等于     | `equalTo`                  |     |
| 不等于   | `notEqualTo`               |     |
| 大于     | `greaterThan`              |     |
| 大于等于 | `greaterThanOrEqualTo`     |     |
| 小于     | `lessThan`                 |     |
| 小于等于 | `lessThanOrEqualTo`        |     |
{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}
| 逻辑比较 | AVIMConversationQuery 方法   |     |
| -------- | ---------------------------- | --- |
| 等于     | `whereEqualTo`               |     |
| 不等于   | `whereNotEqualsTo`           |     |
| 大于     | `whereGreaterThan`           |     |
| 大于等于 | `whereGreaterThanOrEqualsTo` |     |
| 小于     | `whereLessThan`              |     |
| 小于等于 | `whereLessThanOrEqualsTo`    |     |
{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}
| 逻辑比较 | AVIMConversationQuery 方法   |     |
| -------- | ---------------------------- | --- |
| 等于     | `WhereEqualTo`               |     |
| 不等于   | `WhereNotEqualsTo`           |     |
| 大于     | `WhereGreaterThan`           |     |
| 大于等于 | `WhereGreaterThanOrEqualsTo` |     |
| 小于     | `WhereLessThan`              |     |
| 小于等于 | `WhereLessThanOrEqualsTo`    |     |
{{ docs.langSpecEnd('cs') }}

### 正则匹配查询

匹配查询是指在 `ConversationsQuery` 的查询条件中使用正则表达式来匹配数据。

比如要查询所有 language 是中文的对话：

```js
query.matches('language',/[\\u4e00-\\u9fa5]/);
```
```objc
[query whereKey:@"language" matchesRegex:@"[\u4e00-\u9fa5]"];
```
```java
query.whereMatches("language","[\\u4e00-\\u9fa5]"); //language 是中文字符 
```
```cs
query.WhereMatches("language","[\\u4e00-\\u9fa5]"); //language 是中文字符 
```

### 包含查询

例如查询关键字包含「教育」的对话：

```js
query.contains('keywords','教育');
```
```objc
[query whereKey:@"keywords" containsString:@"教育"];
```
```java
query.whereContains("keywords","教育"); 
```
```cs
query.WhereContains("keywords","教育"); 
```

### 空值查询

空值查询是指查询相关列是否为空值的方法，例如要查询 lm 列为空值的对话：

```js
query.doesNotExist('lm')
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

如果要查询 lm 列不为空的对话，则替换为如下：

```js
query.exists('lm')
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
```objc
[query whereKey:@"keywords" containsString:@"教育"];
[query whereKey:@"age" lessThan:@(18)];
```
```java
query.whereContains("keywords", "教育");
query.whereLessThan("age", 18);
```
```cs
query.WhereContains("keywords", "教育");
query.WhereLessThan("age", 18);
```

另外一种组合的方式是，两个查询采用 Or 或者 And 的方式构建一个新的查询。

查询年龄小于 18 或者关键字包含「教育」的对话：

```js
JavaScript SDK 暂不支持
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
keywordsQuery.whereContains('keywords', '教育').
AVIMConversationsQuery query = AVIMConversationsQuery.or(Arrays.asList(priorityQuery, statusQuery));
```
```cs
var ageQuery = tom.GetQuery();
ageQuery.WhereLessThan('age', 18);

var keywordsQuery = tom.GetQuery();
keywordsQuery.WhereContains('keywords', '教育').

var query = AVIMConversationQuery.or(new AVIMConversationQuery[] { ageQuery, keywordsQuery});
```


### 对话的有效期

一个对话（包括普通、暂态、系统对话）如果 1 年内没有通过 SDK 或者 REST API 发送过新的消息，或者它在 _Conversation 表中的任意字段没有被更新过，即被视为不活跃对话，云端会自动将其删除。（查询对话的消息记录并不会更新 _Conversation 表，所以只查询不发送消息的对话仍会被视为不活跃对话。）


不活跃的对话被删除后，当客户端再次通过 SDK 或 REST API 对其发送消息时，会遇到 4401 INVALID_MESSAGING_TARGET 错误，表示该对话已经不存在了。同时，与该对话相关的消息历史也无法获取。

### 性能优化建议

#### 对话的查询和存储

在一些常见的需求中，进入对话列表界面的时候，客户端需要展现一个当前用户所参与的所有对话，一般情况下是按照活跃时间逆序排列在首页，因此给出一个查询优化的建议：

- 查询的时候可以尽量提供了一个 `updatedAt` 或者 `lastMessageAt` 的参数来限定返回结果，原因是 skip 搭配 limit 的查询性能相对较低。
- 使用 `m` 列的 `contains` 查询来查找包含某人的对话时，也尽量使用默认的 limit 大小 10，再配合 `updatedAt` 或者 `lastMessageAt` 来做条件约束，性能会提升较大
- 整个应用对话如果数量太多，可以考虑在云引擎封装一个云函数，用定时任务启动之后，周期性地做一些清理，例如可以归档一些不活跃的对话，直接删除即可。



{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "基础入门", href: "realtime-guide-beginner.html" }, 
  { title: "高阶技巧", href: "/realtime-guide-senior.html"}])
}}