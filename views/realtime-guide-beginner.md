{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

# 即时通讯开发指南 &middot; 基础入门


即时通讯是提供了实时通讯的功能，在不需要编写服务端的代码的情况下，仅使用客户端 SDK 即可实现在线聊天/多人群组/私聊/消息群发等实时通讯的功能，如下时序图简单的介绍了一下即时通讯的业务流程：

![rtm-message-seq](images/rtm-message-seq.svg)


首先，如果您还没有下载对应开发环境（语言）的 SDK，请查看如下内容，选择一门语言，查看下载和安装的文档：

- [JavaScript](sdk_setup-js.html)
- [iOS-Objective-C](sdk_setup-objc.html)
- [Android-Java](sdk_setup-android.html)
- [Unity3D-C#](sdk_setup-dotnet.html)

## 登录

登录的含义是：

> 在客户端设置一个全局唯一字符串类型的 ID（例如 Tom），然后调用 SDK 的方法打开与服务端的长连接

对应的 SDK 方法如下：

```js
var AV = require('leancloud-storage');
var { Realtime,TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId，获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
}).catch(console.error);
```

### 客户端事件与网络状态响应

{{ docs.note("注意：在网络中断的情况下，所有的消息收发和对话操作都会失败。开发者应该监听与网络状态相关的事件并更新 UI，以免影响用户的使用体验。") }}

当网络连接出现中断、恢复等状态变化时，SDK 会在 Realtime 实例上派发以下事件：

* `DISCONNECT`：与服务端连接断开，此时聊天服务不可用。
* `OFFLINE`：网络不可用。
* `ONLINE`：网络恢复。
* `SCHEDULE`：计划在一段时间后尝试重连，此时聊天服务仍不可用。
* `RETRY`：正在重连。
* `RECONNECT`：与服务端连接恢复，此时聊天服务可用。

```javascript
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

本姐内容介绍的是客户端如何与云端建立长连接，并且如何监听网络状态的变化，这样可以在客户端的 UI 上做一些优化。

## 聊天模式

即时通讯服务提供的功能就是让一个客户端与其他客户端进行在线的消息互发，对应不同的使用场景我们可能会有如下几种典型的通讯模式：

- 一对一的单聊
- 多对多的群组聊天
- 系统管理员的在线通知，也就是现在普遍被使用的服务号，公众号等


在 LeanCloud 即时通讯的内部，我们将上述场景统一称为「对话」，下面我们从最简单的一对一私聊开始完整地学习创建对话/互发消息/离开对话：


### 一对一单聊

首先我们沿用刚才[登录](#登录)章节里面的代码进行拓展：


```js
var { TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId，获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与Jerry之间的对话
  return tom.createConversation({
    members: ['Jerry'],
    name: 'Tom & Jerry',
  });
}).then(function(conversation) {
  // 发送消息
  return conversation.send(new TextMessage('耗子，起床！'));
}).then(function(message) {
  console.log('Tom & Jerry', '发送成功！');
}).catch(console.error);
```

上述代码的含义是：

> Tom 打开了与云端的长连接，并且创建了一个对话，并且在创建对话的时候邀请了 Jerry 一起加入到这个对话当中，在创建对话之后，Tom 还主动的发送了一条消息


而 Tom 此时并不在线，他不会收到任何的消息通知，因此我们就需要在另一个客户端添加如下代码，让 Jerry 能够感知到自己被邀请到了一个新的对话当中：

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

上述代码的含义是：

> Jerry 打开了与云端的长连接，然后开始监听事件，当他发现自己被邀请到一个新的对话之后就会触发 jerry.on(Event.INVITED) ，而如果他收到新的消息也会触发 jerry.on(Event.MESSAGE)


如果执行完了上述代码，请打开控制台找到存储服务，可以查看 _Conversation 表里面的多出了一条数据。


### 多人群聊

多人群聊与单聊十分接近，只是在现有的对话上继续加入新的成员就可以实现多人群聊了：

Tom 的代码做如下修改：

```js
var { TextMessage } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId，获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  // 成功登录
  // 创建与Jerry之间的对话
  return tom.createConversation({
    members: ['Jerry'],
    name: 'Tom & Jerry',
  });
}).then(function(conversation) {
  // 发送消息
  return conversation.send(new TextMessage('耗子，起床！'));
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

### 成员变更
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


Jerry 不想继续呆在这个对话里面了，他选择退出对话:

```js
conversation.quit().then(function(conversation) {
  console.log('退出成功', conversation.members);
  // 退出成功 ['William', 'Tom']
}).catch(console.error.bind(console));
```

执行了这段代码之后会触发如下流程：

![rtm-leave-conv-seq](images/rtm-leave-conv-seq.svg)

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

更多消息类型请点击[进阶功能#消息类型](realtime-guide-intermediate.html)

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


