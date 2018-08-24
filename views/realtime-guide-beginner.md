{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

# 即时通讯开发指南 &middot; 基础入门

## 即时通讯要解决的需求

- 社交应用需要接入聊天功能
- 游戏需要接入聊天频道
- 直播应用要接入聊天室弹幕服务
- 系统广播消息在线通知

即时通讯使得开发者可以在不编写服务端的代码的情况下，仅使用客户端 SDK 即可实现在线聊天/多人群组/私聊/消息群发等实时通讯的功能，如下时序图简单的介绍了一下即时通讯的业务流程：

![rtm-message-seq](images/rtm-message-seq.svg)


首先，如果您还没有下载对应开发环境（语言）的 SDK，请查看如下内容，选择一门语言，查看下载和安装的文档：

- [JavaScript](sdk_setup-js.html)
- [iOS-Objective-C](sdk_setup-objc.html)
- [Android-Java](sdk_setup-android.html)
- [Unity3D-C#](sdk_setup-dotnet.html)


## 一对一单聊
我们从最基本的一对一私聊开始接入即时通讯模块，首先我们需要明确一个需求：

> 假设我们正在制作一个社交聊天的应用，第一步要实现一个用户向另一个用户发起聊天的功能

### 1.建立连接

建立连接的含义是：

> 在客户端设置一个全局唯一字符串类型的 ID（例如 Tom），然后调用 SDK 的方法建立与服务端的长连接

对应的 SDK 方法如下：

```js
var AV = require('leancloud-storage');
var { Realtime,TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
```

推荐使用的方式：在用户登录之后用当前的用户名当做 `clientId` 建立连接。

### 2.创建对话

对话是即时通讯抽象出来的概念，它是客户端之间互发消息的载体，可以理解为一个通道，所有在这个对话内的成员都可以在这个对话内收发消息。

Tom 已经建立了连接，因此他需要一个对话来发送消息给 Jerry：

```js
var { TextMessage } = require('leancloud-realtime');
// om 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与Jerry之间的对话
  return tom.createConversation({
    // 指定对话的成员除了当前用户 Tom(SDK 会默认把当前用户当做对话成员)之外，还有 Jerry
    members: ['Jerry'],
    // 对话名称
    name: 'Tom & Jerry',
  });
}).catch(console.error);
```

对比[建立连接](#建立连接)的代码有如下关键改动:

```js
return tom.createConversation({
  // 指定对话的成员除了当前用户 Tom(SDK 会默认把当前用户当做对话成员)之外，还有 Jerry
  members: ['Jerry'],
  // 对话名称
  name: 'Tom & Jerry',
});
```

`createConversation` 这个接口会直接创建一个对话，并且该对话会被存储在 _Conversation 表内，可以打开控制台->存储查看数据。


### 3.发送消息

对话已经创建成功了，接下来 Tom 可以发出第一条消息了：

```js
var { TextMessage } = require('leancloud-realtime');
// om 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与Jerry之间的对话
  return tom.createConversation({
    // 指定对话的成员除了当前用户 Tom(SDK 会默认把当前用户当做对话成员)之外，还有 Jerry
    members: ['Jerry'],
    // 对话名称
    name: 'Tom & Jerry',
  });
}).then(function(conversation) {
  // 发送一条最简单的文本消息
  return conversation.send(new TextMessage('Jerry，起床了！'));
}).then(function(message) {
  console.log('Tom & Jerry', '发送成功！');
}).catch(console.error);
```

再次比对前一章节代码，修改的关键片段如下:

```js
  // 发送一条最简单的文本消息
  return conversation.send(new TextMessage('Jerry，起床了！'));
```

`conversation.send` 接口实现的功能就是向对话中发送一条消息，而 Jerry 只要在线他就会收到消息，至此 Jerry 还没有登场，那么他怎么接收消息呢？

### 4.接收消息

我们在另一个设备上启动应用，然后使用 Jerry 当做 `clientId` 建立连接:

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
}).catch(console.error);
```

紧接着让 Jerry 开始订阅事件通知：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
    // 当前用户被添加至某个对话
    jerry.on(Event.INVITED, function invitedEventHandler(payload, conversation) {
        console.log(payload.invitedBy, conversation.id);
    });
    // 当前用户收到了某一条消息
    jerry.on(Event.MESSAGE, function(message, conversation) {
        console.log('Message received: ' + message.text);
    });
}).catch(console.error);
```

这里 Jerry 订阅了两种事件通知:

```js
jerry.on(Event.INVITED, function invitedEventHandler(payload, conversation) {
      console.log(payload.invitedBy, conversation.id);
});
```

`Event.INVITED` 在当前用户被邀请加入一个对话的时候触发。

而接收消息对应的是:

```js
// 当前用户收到了某一条消息
jerry.on(Event.MESSAGE, function(message, conversation) {
    console.log('Message received: ' + message.text);
});
```

而当 Tom 创建了对话之后，Jerry 会这一端会立即触发 `Event.INVITED`，此时客户端可以做出一些 UI 展示，引导用户加载聊天的界面，紧接着 Tom 发送了消息，则会触发 Jerry `Event.MESSAGE`，这个时候就可以直接在聊天界面的消息列表里面渲染这条消息了。


## 多人群聊

多人群聊与单聊十分接近，只是在现有的对话上继续加入新的成员就可以实现多人群聊了：

### 1.创建多人群聊对话

多人群聊的对话可以通过如下两种方式实现：

1. **向一对一单聊对话中添加更多成员，将其转化成一个群聊**
2. **重新创建一个对话，并在创建的时候指定至少为 2 的成员数量**


首先我们实现第一种方式： **向一对一单聊对话中添加更多成员，将其转化成一个群聊**，将其转化成一个群聊。

Tom 的代码做如下修改：

```js
var { TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId，获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与Jerry之间的对话
  return tom.createConversation({
    members: ['Jerry','Mary'],
    name: 'Tom & Jerry',
  });
}).then(function(conversation) {
  // 发送消息
  return conversation.send(new TextMessage('Jerry，起床了！'));
}).then(function(message) {
  console.log('Tom & Jerry', '发送成功！');
  return conversation.add(['Mary']);
})then(function(conversation) {
  console.log('Mary 添加成功', conversation.members);
  // 添加成功 ['Bob', 'Harry', 'William', 'Tom', 'Mary']
}).catch(console.error.bind(console));
```

而 Jerry 的代码需要做如下修改他就也能随时知道当前对话还有谁加进来了：

```js
var { Event } = require('leancloud-realtime');
// Jerry 登录
realtime.createIMClient('Jerry').then(function(jerry) {
    // 当前用户被添加至某个对话
    jerry.on(Event.INVITED, function invitedEventHandler(payload, conversation) {
        console.log(payload.invitedBy, conversation.id);
    });

    // 当前用户收到了某一条消息
    jerry.on(Event.MESSAGE, function(message, conversation) {
        console.log('Message received: ' + message.text);

    // 有用户被添加至某个对话
    jerry.on(Event.MEMBERS_JOINED, function membersjoinedEventHandler(payload, conversation) {
        console.log(payload.members, payload.invitedBy, conversation.id);
    });
  });
}).catch(console.error);
```

如下时序图可以简单的概括上述流程：

![rtm-member-add-seq](images/rtm-member-add-seq.svg)

而 Mary 如果在另一台设备上登录了，Ta 可以参照[一对一单聊](#一对一单聊)中 Jerry 的做法监听 `Event.INVITED` 事件，就可以自己被邀请到了一个对话当中。

而**重新创建一个对话，并在创建的时候指定至少为 2 的成员数量**的方式如下：

```js
var { TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与 Jerry,Mary 的多人群聊
  return tom.createConversation({
    // 创建的时候直接指定 Jerry 和 Mary 一起加入多人群聊，当然根据需求可以添加更多成员
    members: ['Jerry','Mary'],
    // 对话名称
    name: 'Group channel',
  });
}).catch(console.error);
```

### 2.群发消息

之前也介绍过，我们再次重申一下对话的含义：

> 群聊和单聊一样，对话就是才是聊天通讯的核心，所有消息的目标都是对话，而所有在对话中的成员都会接收到对话内产生的消息。

Tom 向群聊对话发送了消息：


```js
conversation.send(new TextMessage('大家好，欢迎来到我们的群聊对话'));
```

而 Jerry 和 Mary 都会触发 `Event.MESSAGE` 事件，来接收群聊消息。


### 3.成员变更

刚才的代码演示的是添加新成员，而对应的删除成员的代码如下：

Tom 又把 Mary 踢出对话了:

```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.getConversation(CONVERSATION_ID);
}).then(function(conversation) {
  return conversation.remove(['Mary']);
}).then(function(conversation) {
  console.log('移除成功', conversation.members);
}).catch(console.error.bind(console));
```

执行了这段代码之后会触发如下流程：

![rtm-member-remove-seq](images/rtm-member-remove-seq.svg)

紧接着 William 通过 conversation id 他自己主动加入对话：

```js
realtime.createIMClient('William').then(function(william) {
  return william.getConversation(CONVERSATION_ID);
}).then(function(conversation) {
  return conversation.join();
}).then(function(conversation) {
  console.log('加入成功', conversation.members);
  // 加入成功 ['William', 'Tom', 'Jerry']
}).catch(console.error.bind(console));
```

执行了这段代码之后会触发如下流程：

![rtm-join-conv-seq](images/rtm-join-conv-seq.svg)

其他人则通过订阅 `MEMBERS_JOINED` 来接收 William 加入对话的通知:

```js
  jerry.on(Event.MEMBERS_JOINED, function membersjoinedEventHandler(payload, conversation) {
      console.log(payload.members, payload.invitedBy, conversation.id);
  });
```

Jerry 不想继续呆在这个对话里面了，他选择退出对话:

```js
conversation.quit().then(function(conversation) {
  console.log('退出成功', conversation.members);
  // 退出成功 ['William', 'Tom']
}).catch(console.error.bind(console));
```

执行了这段代码之后会触发如下流程：

![rtm-leave-conv-seq](images/rtm-leave-conv-seq.svg)

而其他人需要通过订阅 `MEMBERS_LEFT` 来接收 Jerry 离开对话的事件通知:

```js
  mary.on(Event.MEMBERS_LEFT, function membersLeftEventHandler(payload, conversation) {
      console.log(payload.members, payload.invitedBy, conversation.id);
  });
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

即时通讯服务提供的功能就是让一个客户端与其他客户端进行在线的消息互发，对应不同的使用场景除去刚才前两章节介绍的[一对一单聊](#一对一单聊)和[多人群聊](#多人群聊)之外,即时通讯也支持如下中流星的通讯模式：

- 服务号，公众号等
- 直播中的弹幕聊天室
- 游戏 GM 在线群发通知

关于上述的几种场景对应的实现，请参阅[进阶功能#通讯模式](realtime-guide-intermediate.html#通讯模式)

## 消息

消息的类型有很多种，使用最多的就是文本消息，其次是图像消息，还有一些短语音/短视频消息，文本消息和其他消息类型有本质的区别:

<div class="callout callout-info">文本消息发送的就是本身的内容，而其他多媒体消息，例如一张图片实际上发送的是一个指向图像的链接</div>

### 图像消息

文本消息前面的示例代码已经有了，不做过多解释，我们从发送一张图片消息的生命周期的时序图来了解整个过程：

![rtm-image-message-send-seq](images/rtm-image-message-send-seq.svg)

图解：
1. localStorage/camera 表示图像的来源可以是本地存储例如 iPhone 手机的媒体库或者直接调用相机 API 实时地拍照获取的照片。
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

更多消息类型请点击[进阶功能#消息类型](realtime-guide-intermediate.html#消息类型)

## 消息记录

消息记录默认会在云端保存 **30** 天， SDK 提供了多种方式来获取到本地。

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

而如果想继续拉取更早的消息记录，需要用到如下代码：

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
// 第二次调用 next 方法，获得第 21 条消息，没有更多消息，done 为 true
messageIterator.next().then(function(result) {
  // No more messages
  // result: { value: [message21], done: true }
}).catch(console.error.bind(console));
```

### 按照消息类型拉取

如下代码的功能是：获取所有的图像消息：

```js
conversation.queryMessages({ type: ImageMessage.TYPE }).then(messages => {
  console.log(messages);
}).catch(console.error);
```

如要获取更多图像消息，可以效仿前一章节中使用 `conversation.createMessagesIterator` 接口生成迭代器来查询更多图像消息。

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