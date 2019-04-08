{% import "views/_im.njk" as im %}
# 第三方鉴权详解和基于云引擎的实现示例

## 权限和认证

使用签名可以保证聊天通道的安全，这一功能默认是关闭的，可以在 [控制台 > 消息 > 即时通讯 > 设置 > 即时通讯选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中进行开启：

- **登录启用签名认证**，用于控制所有的用户登录
- **对话操作启用签名认证**，用于控制新建或加入对话、邀请/踢出对话成员等操作
- **聊天记录查询启用签名认证**，用于控制聊天记录查询操作

开发者可根据实际需要进行选择。一般来说，**登录认证** 能够满足大部分安全需求，而且我们也强烈建议开发者开启登录认证。
对于使用 AVUser 的应用，可使用 REST API [获取 Client 登录签名](./realtime_rest_api_v2.html#获取登录签名) 进行登录认证。

![image](images/leanmessage_signature2.png)

1. 客户端进行登录或新建对话等操作，SDK 会调用 SignatureFactory 的实现，并携带用户信息和用户行为（登录、新建对话或群组操作）请求签名；
2. 应用自有的权限系统，或应用在 LeanCloud 云引擎上的签名程序收到请求，进行权限验证，如果通过则利用下文所述的 [签名算法](#用户登录的签名) 生成时间戳、随机字符串和签名返回给客户端；
3. 客户端获得签名后，编码到请求中，发给 LeanCloud 即时通讯服务器；
4. 即时通讯服务器对请求的内容和签名做一遍验证，确认这个操作是被应用服务器允许的，进而执行后续的实际操作。

签名采用 **Hmac-sha1** 算法，输出字节流的十六进制字符串（hex dump）。针对不同的请求，开发者需要拼装不同组合的字符串，加上 UTC timestamp 以及随机字符串作为签名的消息。

### 云引擎签名范例

我们提供了一个运行在 LeanCloud [云引擎](leanengine_overview.html) 上的 [签名范例程序](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/rtm-signature.js)
，它提供了基于云函数的签名实现，你可以在此基础上进行修改。

### 用户登录的签名

签名的消息格式如下，注意 `clientid` 与 `timestamp` 之间是<u>两个冒号</u>：

```
appid:clientid::timestamp:nonce
```

参数|说明<a name="signature-param-table"></a><!--2015-09-04 -->
---|---
appid|应用的 id
clientid|登录时使用的 clientId
timestamp|当前的 UTC 时间距离 unix epoch 的**毫秒数**
nonce|随机字符串


>注意：签名的 key **必须** 是应用的 master key，你可以 [控制台 > 设置 > 应用 Key](/dashboard/app.html?appid={{appid}}#/key) 里找到。**请保护好 master key，不要泄露给任何无关人员。**

开发者可以实现自己的 SignatureFactory，调用远程服务器的签名接口获得签名。如果你没有自己的服务器，可以直接在 LeanCloud 云引擎上通过 **网站托管** 来实现自己的签名接口。在移动应用中直接做签名的作法 **非常危险**，它可能导致你的 **master key** 泄漏。

### 开启对话签名

新建一个对话的时候，签名的消息格式为：

```
appid:clientid:sorted_member_ids:timestamp:nonce
```

* appid、clientid、timestamp 和 nonce 的含义 [同上](#signature-param-table)。
* sorted_member_ids 是以半角冒号（:）分隔、**升序排序** 的 user id，即邀请参与该对话的成员列表。

### 群组功能的签名

在群组功能中，我们对**加群**、**邀请**和**踢出群**这三个动作也允许加入签名，签名格式是：

```
appid:clientid:convid:sorted_member_ids:timestamp:nonce:action
```

* appid、clientid、sorted_member_ids、timestamp 和 nonce  的含义同上。对创建群的情况，这里 sorted_member_ids 是空字符串。
* convid - 此次行为关联的对话 id。
* action - 此次行为的动作，**invite** 表示加群和邀请，**kick** 表示踢出群。

### 查询聊天记录的签名

```
appid:client_id:convid:nonce:signature_ts
```
* client_id 查看者 id（签名参数）
* nonce  签名随机字符串（签名参数）
* signature_ts 签名时间戳（签名参数），单位是毫秒
* signature  签名（签名参数）

### 黑名单的签名

由于黑名单有两种情况，所以签名格式也有两种：

1. client 对 conversation
  ```
  appid:clientid:convid::timestamp:nonce:action
  ```
  - action - 此次行为的动作，client-block-conversations 表示添加黑名单，client-unblock-conversations 表示取消黑名单
  
2. conversation 对 client
  ```
  appid:clientid:convid:sorted_member_ids:timestamp:nonce:action
  ```
  - action - 此次行为的动作，conversation-block-clients 表示添加黑名单，conversation-unblock-clients 表示取消黑名单
  - sorted_member_ids 同上
  
{{ im.signature("### 测试签名") }}

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

