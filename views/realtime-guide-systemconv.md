{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

# 即时通讯开发指南：消息 hook ，系统账号，以及智能客服和聊天机器人

## 本章导读

在前一章[第三方操作鉴权，成员权限管理、多端登录与消息同步](realtime-guide-senior.html)中，我们解释了一些第三方鉴权以及成员权限设置方面的问题，在这里我们会更进一步，给大家说明：

- 消息 Hook 的开放架构
- 如何利用系统对话来实现智能客服或者聊天机器人

## 云引擎 Hook

对于普通消息，如果发送时部分成员不在线，LeanCloud 提供了选项，支持将离线消息以推送形式发送到客户端。如果开发者希望修改推送的内容，可以使用「云引擎 Hook」。

云引擎 Hook 允许你通过自定义的云引擎函数处理即时通讯中的某些事件，修改默认的流程等等。目前开放的 hook 云函数包括：

* **_messageReceived**<br/>
  消息达到服务器，群组成员已解析完成之后，发送给收件人之前调用。
* **_receiversOffline**<br/>
  消息发送完成，存在离线的收件人，在发推送给收件人之前调用。
* **_messageSent**<br/>
  消息发送完成后调用。
* **_messageUpdate**<br/>
  收到消息修改请求，发送修改后的消息给收件人之前调用。
* **_conversationStart**<br/>
  创建对话，在签名校验（如果开启）之后，实际创建之前调用。
* **_conversationStarted**<br/>
  创建对话完成后调用。
* **_conversationAdd**<br/>
  向对话添加成员，在签名校验（如果开启）之后，实际加入之前调用，包括主动加入和被其他用户加入两种情况。
* **_conversationRemove**<br/>
  从对话中踢出成员，在签名校验（如果开启）之后，实际踢出之前调用，用户自己退出对话不会调用。
* **_conversationUpdate**<br/>
  修改对话属性、设置或取消对话消息提醒，在实际修改之前调用。

### 使用场景

示例应用 [LeanChat](https://github.com/leancloud/leanchat-android) 也用了云引擎 Hook 功能来自定义消息推送，通过解析上层消息协议获取消息类型和内容，以 `fromPeer` 得到发送者的名称，组装成 `pushMessage`，这样能使推送通知的用户体验更好。可参考 [leanchat-cloudcode 代码](https://github.com/leancloud/leanchat-cloudcode/blob/master/cloud.js)。

与 conversation 相关的 hook 可以在应用签名之外增加额外的权限判断，控制对话是否允许被建立、某些用户是否允许被加入对话等。你可以用这一 hook 实现黑名单功能。

### `_messageReceived`

这个 hook 发生在消息到达 LeanCloud 云端之后。如果是群组消息，我们会解析出所有消息收件人。

你可以通过返回参数控制消息是否需要被丢弃，删除个别收件人，还可以修改消息内容，例如过滤应用中的敏感词（[示例](leanengine_cloudfunction_guide-node.html#onIMMessageReceived)）。返回空对象（`response.success({})`）则会执行系统默认的流程。

<div class="callout callout-info">请注意，在这个 hook 的代码实现的任何分支上**请确保最终会调用 response.success 返回结果**，使得消息可以尽快投递给收件人。这个 hook 将**阻塞发送流程**，因此请尽量减少无谓的代码调用，提升效率。</div>

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [即时通讯 REST API 指南 - 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者的 ID
convId   | 消息所属对话的 ID
toPeers | 解析出的对话相关的 Client ID
transient | 是否是 transient 消息
bin | 原始消息内容是否为二进制消息
content | 消息体字符串。如果 bin 为 true，则该字段为原始消息内容做 Base64 转码后的结果。
receipt | 是否要求回执
timestamp | 服务器收到消息的时间戳（毫秒）
system | 是否属于系统对话消息
sourceIP | 消息发送者的 IP

#### 返回

参数 |约束| 说明
---|---|---
drop |可选|如果返回真值，消息将被丢弃。
code | 可选 | 当 drop 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 drop 为 true 时可以下发一个应用自定义的错误说明字符串。
bin | 可选 | 返回的 content 内是否为二进制消息，如果不提供则为请求中的 bin 值。
content |可选| 修改后的 content，如果不提供则保留原消息。如果 bin 为 true，则 content 需要是二进制消息内容做 Base64 转码后的结果。
toPeers |可选|数组，修改后的收件人，如果不提供则保留原收件人。

### `_receiversOffline`

这个 hook 发生在有收件人离线的情况下，你可以通过它来自定义离线推送行为，包括推送内容、被推送用户或略过推送。你也可以直接在 hook 中触发自定义的推送。发往暂态对话的消息不会触发此 hook。

#### 自定义离线消息推送通知的内容

```
AV.Cloud.define('_receiversOffline', function(request, response) {
    var params = request.params;

    var json = {
        // 自增未读消息的数目，不想自增就设为数字
        badge: "Increment",
        sound: "default",
        // 使用开发证书
        _profile: "dev",
        // content 为消息的实际内容
        alert: params.content
    };

    var pushMessage = JSON.stringify(json);

    return {"pushMessage": pushMessage};
})
```

有关可以在推送内容中加入的内置变量和其他可用设置，请参考 [离线推送通知](#离线推送通知)。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者 ID
convId   | 消息所属对话的 ID
offlinePeers | 数组，离线的收件人列表
content | 消息内容
timestamp | 服务器收到消息的时间戳（毫秒）
mentionAll | 布尔类型，表示本消息是否 @ 了所有成员
mentionOfflinePeers | 被本消息 @ 且离线的成员 ID。如果 mentionAll 为 true，则该参数为空，表示所有 offlinePeers 参数内的成员全部被 @

#### 返回

参数 |约束| 说明
---|---|---
skip|可选|如果为真将跳过推送（比如已经在云引擎里触发了推送或者其他通知）
offlinePeers|可选|数组，筛选过的推送收件人。
pushMessage|可选|推送内容，支持自定义 JSON 结构。
force|可选|如果为真将强制推送给 offlinePeers 里 mute 的用户，默认 false。

### `_messageSent`

在消息发送完成后执行，对消息发送性能没有影响，可以用来执行相对耗时的逻辑。

#### 参数

参数	| 说明
----- | ------
fromPeer	| 消息发送者的 ID
convId	| 消息所属对话的 ID
msgId | 消息 id
onlinePeers	| 当前在线发送的用户 id
offlinePeers | 当前离线的用户 id
transient	| 是否是 transient 消息
system | 是否是 system conversation
bin | 是否是二进制消息
content	| 消息体字符串
receipt	| 是否要求回执
timestamp	| 服务器收到消息的时间戳（毫秒）
sourceIP	| 消息发送者的 IP

#### 返回

这个 hook 不会对返回值进行检查。只需返回 `{}` 即可。

### `_messageUpdate`

这个 hook 发生在修改消息请求到达 LeanCloud 云端，LeanCloud 云端正式修改消息之前。

你可以通过返回参数控制修改消息请求是否需要被丢弃，删除个别收件人，或再次修改这个修改消息请求中的消息内容。

<div class="callout callout-info">请注意，在这个 hook 的代码实现的任何分支上**请确保最终会调用 response.success 返回结果**，使得修改消息可以尽快投递给收件人。这个 hook 将**阻塞发送流程**，因此请尽量减少无谓的代码调用，提升效率。</div>

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [即时通讯 REST API 指南 - 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者的 ID
convId   | 消息所属对话的 ID
toPeers | 解析出的对话相关的 Client ID
bin | 原始消息内容是否为二进制消息
content | 消息体字符串。如果 bin 为 true，则该字段为原始消息内容做 Base64 转码后的结果。
timestamp | 服务器收到消息的时间戳（毫秒）
msgId | 被修改的消息 ID
sourceIP | 消息发送者的 IP
recall | 是否撤回消息
system | 是否属于系统对话消息

#### 返回

参数 |约束| 说明
---|---|---
drop | 可选 | 如果返回真值，修改消息请求将被丢弃。
code | 可选 | 当 drop 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 drop 为 true 时可以下发一个应用自定义的错误说明字符串。
bin | 可选 | 返回的 content 内是否为二进制消息，如果不提供则为请求中的 bin 值。
content |可选| 修改后的 content，如果不提供则保留原消息。如果 bin 为 true，则 content 需要是二进制消息内容做 Base64 转码后的结果。
toPeers |可选| 数组，修改后的收件人，如果不提供则保留原收件人。

### `_conversationStart`

在创建对话时调用，发生在签名验证之后、创建对话之前。

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起的 clientId
members | 初始成员数组，包含初始成员
attr | 创建对话时的额外属性

#### 返回

参数 |约束| 说明
--- | ---|---
reject |可选|是否拒绝，默认为 **false**。
code | 可选 | 当 reject 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 reject 为 true 时可以下发一个应用自定义的错误说明字符串。

### `_conversationStarted`

对话创建后调用

#### 参数

参数 | 说明
--- | ---
convId | 新生成的对话 Id

#### 返回

这个 hook 不对返回值进行处理，只需返回 `{}` 即可。

### `_conversationAdd`

在将用户加入到对话时调用，发生在签名验证之后、加入对话之前。如果是自己加入，那么 **initBy** 和 **members** 的唯一元素是一样的。

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起的 clientId
members | 要加入的成员，数组
convId | 对话 id

#### 返回

参数 |约束| 说明
---|---|---
reject | 可选 | 是否拒绝，默认为 **false**。
code | 可选 | 当 reject 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 reject 为 true 时可以下发一个应用自定义的错误说明字符串。

### `_conversationRemove`

在创建对话时调用，发生在签名验证之后、从对话移除成员之前。移除自己时不会触发这个 hook。

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起
members | 要踢出的成员，数组。
convId | 对话 id

#### 返回

参数 |约束| 说明
---|---|---
reject | 可选 | 是否拒绝，默认为 **false**。
code | 可选 | 当 reject 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 reject 为 true 时可以下发一个应用自定义的错误说明字符串。

### `_conversationUpdate`

在修改对话属性、设置或取消对话消息提醒之前调用。

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起。
convId | 对话 id。
mute | 是否关闭当前对话提醒。
attr | 待设置的对话属性。

mute 和 attr 参数互斥，不会同时传递。

#### 返回

参数 |约束| 说明
---|---|---
reject | 可选 | 是否拒绝，默认为 **false**。
code | 可选 | 当 reject 为 true 时可以下发一个应用自定义的整型错误码。
detail | 可选 | 当 reject 为 true 时可以下发一个应用自定义的错误说明字符串。
attr | 可选 | 修改后的待设置对话属性，如果不提供则保持原参数中的对话属性。
mute | 可选 | 修改后的关闭对话提醒设置，如果不提供则保持原参数中的关闭提醒设置。

mute 和 attr 参数互斥，不能同时返回。并且返回值必须与请求对应，请求中如果带着 attr，则返回值中只有 attr 参数有效，返回 mute 会被丢弃。同理，请求中如果带着 mute，返回值中如果有 attr 则 attr 会被丢弃。

### 部署环境

即时通讯的云引擎 Hook 要求云引擎部署在云引擎的 **生产环境**，测试环境仅用于开发者手动调用测试。由于缓存的原因，首次部署的云引擎 Hook 需要至多三分钟来正式生效，后续修改会实时生效。

更多使用方法请参考 [云引擎 · 云函数](leanengine_cloudfunction_guide-node.html)。所有云引擎调用都有默认超时时间和容错机制，在出错情况下系统将按照默认的流程执行后续操作。


## 系统对话

系统对话可以用于实现机器人自动回复、公众号、服务账号等功能。在我们的 [官方聊天 Demo](http://leancloud.github.io/leanmessage-demo/) 中就有一个使用系统对话 hook 实现的机器人 MathBot，它能计算用户发送来的数学表达式并返回结果，[其服务端源码](https://github.com/leancloud/leanmessage-demo/tree/master/server) 可以从 GitHub 上获取。

### 系统对话的创建

系统对话也是对话的一种，创建后也是在 `_Conversation` 表中增加一条记录，只是该记录 `sys` 列的值为 true，从而与普通会话进行区别。具体创建方法请参考 [REST API 创建服务号](realtime_rest_api_v2.html#创建服务号)。

### 系统对话消息的发送

系统对话给用户发消息请参考： [REST API - 给任意用户单独发消息](realtime_rest_api_v2.html#给任意用户单独发消息)。
用户给系统对话发送消息跟用户给普通对话发消息方法一致。

您还可以利用系统对话发送广播消息给全部用户。相比遍历所有用户 ID 逐个发送，广播消息只需要调用一次 REST API。
关于广播消息的详细特征可以参考[消息 - 广播消息](#广播消息)。

### 获取系统对话消息记录

获取系统对话给用户发送的消息记录请参考： [查询服务号给某用户发的消息](realtime_rest_api_v2.html#查询服务号给某用户发的消息)

获取用户给系统对话发送的消息记录有以下两种方式实现：
- `_SysMessage` 表方式，在应用首次有用户发送消息给某系统对话时自动创建，创建后我们将所有由用户发送到系统对话的消息都存储在该表中。
- [Web Hook](#Web_Hook) 方式，这种方式需要开发者自行定义 [Web Hook](#Web_Hook)，用于实时接收用户发给系统对话的消息。

### 系统对话消息结构

#### `_SysMessage`

存储用户发给系统对话的消息，各字段含义如下：

字段 | 说明
--- | ---
ackAt | 消息送达的时间
bin | 是否为二进制类型消息
conv | 消息关联的系统对话 Pointer
data | 消息内容
from | 发消息用户的 Client ID
fromIp | 发消息用户的 IP
msgId | 消息的内部 ID
timestamp | 消息创建的时间

#### Web Hook
{% if node=='qcloud' %}
需要开发者自行在 `控制台> **消息** > **实时消息** > **设置** > **系统对话消息回调设置**`定义，来实时接收用户发给系统对话的消息，消息的数据结构与上文所述的 `_SysMessage` 一致。
{% else %}
需要开发者自行在 [控制台> **消息** > **实时消息** > **设置** > **系统对话消息回调设置**](/messaging.html?appid={{appid}}#/message/realtime/conf) 定义，来实时接收用户发给系统对话的消息，消息的数据结构与上文所述的 `_SysMessage` 一致。
{% endif %}

当有用户向系统对话发送消息时，我们会通过 HTTP POST 请求将 JSON 格式的数据发送到用户设置的 Web Hook 上。请注意，我们调用 Web Hook 时并不是一次调用只发送一条消息，而是会以批量的形式将消息发送过去。从下面的发送消息格式中能看到，JSON 的最外层是个 Array。

超时时间为 5 秒，当用户 hook 地址超时没有响应，我们会重试至多 3 次。

发送的消息格式为：

```json
[
  {
    "fromIp":      "121.238.214.92",
    "conv": {
      "__type":    "Pointer",
      "className": "_Conversation",
      "objectId":  "55b99ad700b0387b8a3d7bf0"
    },
    "msgId":       "nYH9iBSBS_uogCEgvZwE7Q",
    "from":        "A",
    "bin":         false,
    "data":        "你好，sys",
    "createdAt": {
      "__type":    "Date",
      "iso":       "2015-07-30T14:37:42.584Z"
    },
    "updatedAt":  {
      "__type":   "Date",
      "iso":      "2015-07-30T14:37:42.584Z"
    }
  }
]
```

## 如何实现自己的智能客服系统

