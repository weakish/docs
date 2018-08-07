# JavaScript 即时通讯 SDK v3 迁移指南

本文介绍了 JavaScript Realtime SDK version 2 API 在 version 3 中对应的用法。

## callback
v2 中所有带的 callback 参数在 v3 中均会返回 Promise，请在 Promise 的回调中处理异步 API 的成功、失败情况。下面不再赘述 callback 参数的变化。

## RealtimeObject
`RealtimeObject` 在 v3 中对应的是 `Realtime` 与 `IMClient`，它们是分开的两个概念，一个 `Realtime`  实例可以对应多个 `IMClient`，与具体 `IMClient` 无关的信息由 `Realtime` 管理。

v2 | v3 | v3 说明
---|---|---
`AV.realtime`|`Realtime`<br/>`Realtime#createIMClient`|`Realtime` 需要使用 new 关键字进行初始化
└ 参数 `appId`|`Realtime` 参数 `appId`|
└ 参数 `secure`|`Realtime` 参数 `ssl`|
└ 参数 `clientId`|`createIMClient` 参数 `id`|
└ 参数 `auth`|`createIMClient` 参数<br/>`signatureFactory` 以及<br/> `conversationSignatureFactory`|
└ 参数 `encodeHTML`|无|请使用前端模板引擎或包含视图层的前端框架。
`RealtimeObject#open`|无|不再需要关心。
`RealtimeObject#close`|`IMClient#close`|`IMClient#close` 是一个异步方法。
`RealtimeObject#on`<br/>`RealtimeObject#once`<br/>`RealtimeObject#emit`<br/>`RealtimeObject#off`|`Realtime` 与 `IMClient` 的同名方法|具体事件的变更详见 [事件](#事件)。
创建对话<br/>`RealtimeObject#conv` /<br/>`RealtimeObject#room`|`IMClient#createConversation`|
获取指定 ID 的对话<br/>`RealtimeObject#conv` /<br/>`RealtimeObject#room`|`IMClient#getConversation`|
`RealtimeObject#query`|`IMClient#getQuery`|`IMClient#getQuery` 同步返回一个 `ConversationQuery` 实例用于构造查询条件，再调用其 `find` 方法执行该查询。
`RealtimeObject#ping`|`IMClient#ping`|

## RoomObject
v2 | v3 | v3 说明
---|---|---
`RoomObject#add`|`Conversation#add`|
`RoomObject#remove`|`Conversation#remove`|
`RoomObject#join`|`Conversation#join`|
`RoomObject#leave`|`Conversation#quit`|
`RoomObject#list`|无|请直接访问 `Conversation` 的 `members` 属性，有成员变动时该属性会自动更新。
`RoomObject#send`|`Conversation#send`|需要 send 一个 `Message` 实例，而不是一个 JSON 对象。
└ 参数 `receipt`<br/>└ 参数 `transient`<br/>└ 参数 `type`|无|现在这些信息不再是「发送选项」而是 `Message` 的信息。你需要调用 `Message#setNeedReceipt`、 `Message#setTransient` 以及构造对应类型的 `Message`。
`RoomObject#receive` |订阅 `Conversation` 的 `message` 事件|
`RoomObject#receipt`|订阅 `Conversation` 的 `receipt` 事件|
`RoomObject#log`|`Conversation#queryMessages` 或<br/>`Conversation#createMessagesIterator`|
`RoomObject#count`|`Conversation#count`|
`RoomObject#update`|`Conversation#setName`<br/><br/>`Conversation#setAttribute` 或<br/>`Conversation#setAttributes`<br/><br/>`Conversation#save`|

## 事件
v2 中所有的事件都在 `RealtimeObject` 上派发，v3 中与对话相关的事件会同时在 `Conversation` 上派发。
断线重连机制已重新设计，请参考 [《JavaScript 即时通讯开发指南》- 网络状态响应](./realtime_guide-js.html#网络状态响应)。

v2 | v3 | v3 说明
---|---|---
`open`|无|原初始化成功时派发的 `open` 事件已被移除，请使用 `Realtime#createIMClient` 返回的 Promise 的成功回调代替。
`open`|`reconnect`|原断线重连成功时派发的 `open` 事件由 `reconnect` 事件代替。
`close`|无|原主动断开连接时派发的 `close` 事件已被移除，请使用 `IMClient.close` 返回的 Promise 的成功回调代替。
`close`|`disconnect`|原断线时派发的 `close` 事件由 `disconnect` 事件代替。
`reuse`|`schedule`<br/>`retry`|请参考 [《JavaScript 即时通讯开发指南》- 网络状态响应](./realtime_guide-js.html#网络状态响应)。
`create`|无|请使用 `IMClient#createConversation` 返回的 Promise 的成功回调代替。
`invited`<br/>`membersjoined`<br/>`kicked`<br/>`membersleft`<br/>`message`<br/>`receipt`|`invited`<br/><code class='text-nowrap'><u>member</u>joined</code><br/>`kicked`<br/><code class='text-nowrap'><u>member</u>left</code><br/>`message`<br/>`receipt`|这些事件会同时在 `Conversation` 上派发。**请额外注意 `members` 改为 `member`**，与其他 SDK 保持统一。
