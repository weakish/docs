{% import "views/_im.njk" as im %}
{% import "views/_helper.njk" as docs %}
# 即时通讯 REST API 使用指南 v1

> 注意：部分新特性和 API，放在了 [即时通讯 REST API v2](./realtime_rest_api_v2.html) 中，有需要的开发者参考我们的新版文档。

## 请求格式
对于 POST 和 PUT 请求，请求的主体必须是 JSON 格式，而且 HTTP Header 的 Content-Type 需要设置为 `application/json`。

请求的鉴权是通过 HTTP Header 里面包含的键值对来进行的，参数如下表：

Key|Value|含义|来源
---|----|---|---
`X-LC-Id`|{{appid}}|当前应用的 App Id|可在控制台->设置页面查看
`X-LC-Key`| {{appkey}}|当前应用的 App Key |可在控制台->设置页面查看

## 对话数据操作

你可以通过 REST API 对对话（相应的聊天室、群组或单聊等）进行操作，例如提前创建聊天室，关联聊天室到其他数据实体。LeanCloud 即时通讯系统采用透明的设计，对话数据在 LeanCloud 系统中是普通的数据表，表名为 `_Conversation`，你可以直接调用 [数据存储相关的 API 进行数据操作](./rest_api.html#对象-1)。`_Conversation` 表 包含一些内置的关键字段定义了对话的属性、成员等，你可以在 [即时通讯概览 - 对话](./realtime_v2.html#对话（Conversation）) 了解。

### 创建一个对话

创建一个对话即在 `_Conversation` 表中创建一条记录。对于没有使用过即时通讯服务的新用户， `_Conversation` 表会在第一条记录创建后出现。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Private Room","m": ["BillGates", "SteveJobs"]}' \
  https://{{host}}/1.1/classes/_Conversation
```

上面的例子会创建一个最简单的对话，包括两个 client ID 为 BillGates 和 SteveJobs 的初始成员。对话创建成功会返回 objectId，即即时通讯中的对话 ID，客户端就可以通过这个 ID 发送消息了。

常见的聊天室的场景，需要通过 REST API 预先创建聊天室，并把对话 ID 与应用内的某个对象关联（如视频、比赛等）。创建聊天室只需要包含一个 **tr** 参数，设置为 true 即可。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "OpenConf","tr": true}' \
  https://{{host}}/1.1/classes/_Conversation
```

系统对话通常也需要通过 REST API 预先创建，创建时需要设置关键的 `sys` 属性：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"name": "系统通知", "avatarURL": "http://ww1.sinaimg.cn/large/006y8lVajw1faip71wtc7j30200203ya.jpg", "sys": true}' \
  https://{{host}}/1.1/classes/_Conversation
```

### 增删普通对话成员

你可以通过 REST API 操作对话数据的 **m** 字段来实现成员的增删。m  字段是一个数组字段，使用数组的操作符进行修改。

增加一个 client id 为 LarryPage 的用户到已有（以对话 id 5552c0c6e4b0846760927d5a 为例）对话：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"m": {"__op":"AddUnique","objects":["LarryPage"]}}' \
  https://{{host}}/1.1/classes/_Conversation/5552c0c6e4b0846760927d5a
```

将不再活跃的 SteveJobs 清除出对话（以对话 id 5552c0c6e4b0846760927d5a 为例）：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"m": {"__op":"Remove","objects":["SteveJobs"]}}' \
  https://{{host}}/1.1/classes/_Conversation/5552c0c6e4b0846760927d5a
```

对 `_Conversation` 表的查询等其他操作与普通表完全一致，可以参考 [REST API - 查询](./rest_api.html#查询) 的相应说明，这里不再赘述。

## 获取聊天记录

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/rtm/messages/history
```

该接口可以在 URL 中添加不同的参数，实现获取某对话的聊天记录、获取某用户发送的聊天记录、获取应用所有聊天记录和获取系统对话聊天记录等功能。例如：

```
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/rtm/messages/history?convid=219946ef32e40c515d33ae6975a5c593
```

### 签名

为了保证获取聊天记录的安全性，可以开启签名认证 [控制台 > 消息 > 即时通讯 > 设置 > 即时通讯选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中的 **聊天记录查询启用签名认证**。了解更详细的签名规则请参考 [聊天签名方法](realtime-guide-senior.html#安全与签名)。签名参数仅在开启对应的选项后有效，如果没有开启选项，就不需要传签名参数。

签名采用 Hmac-sha1 算法，输出字节流的十六进制字符串 (hex dump)，签名的 key 必须是应用的 master key，签名的消息格式如下：

```
appid:peerid:convid:nonce:signature_ts
```

### 获取某个对话的聊天记录

参数 | 约束 | 说明
--- | --- | ---
convid | **必填** | 对话 id
msgid | 可选 | 起始的消息 id，**使用时必须加上对应消息的时间戳 timestamp 参数，作为查询的起点**
timestamp | 可选 | 查询起始的时间戳。默认是当前时间，单位是毫秒
till_msgid | 可选 | 查询终止的消息 id。**使用时必须加上消息的时间戳 till_timestamp 参数，作为查询的终点**
till_timestamp | 可选 | 查询终止的时间戳，默认为 0，单位是毫秒
include_start | 可选 | 是否包含由 timestamp 与 msgid 确定的起始消息。布尔值，默认为 false
include_stop | 可选 | 是否包含由 till_timestamp 与 till_msgid 确定的终止消息。布尔值，默认为 false
reversed | 可选 | 以默认排序（默认按时间降序）相反的方向返回结果，这时 till_timestamp 默认为当前时间戳，timestamp 默认为 0。布尔值，默认为 false
limit | 可选 | 返回条数限制，可选，默认 100 条，最大 1000 条
peerid | 可选 | 查看者 id（签名参数）
nonce | 可选 | 签名随机字符串（签名参数）
signature_ts | 可选 | 签名时间戳（签名参数），单位是毫秒
signature | 可选 | 签名（签名参数）
max_ts | 可选 | {{ docs.alertInline("废弃") }}，使用 timestamp 表示查询起始时间戳

本接口时间参数较多，这里举一示例供大家参考。比如某对话内有三条消息，id 分别为 id1、id2、id3，发消息的时间分别是 t1、t2、t3（t1 < t2 < t3），下面列举出不同参数组合的查询结果（空白表示使用默认值）：

| timestamp| msgid| till_timestamp| till_msgid| include_start| include_stop| reversed| 结果 |
| ---------|---------|---------|---------|---------|---------|---------|--------- |
| t3| id3| t1| id1| | | | id2 |
| t3| id3| t1| id1| true| | | id3 id2 |
| t3| id3| t1| id1| | true| | id2 id1 |
| t1| id1| t3| id3| | | true| id2 |
| t1| id1| t3| id3| true| | true| id1 id2 |
| t1| id1| t3| id3| | true| true| id2 id3 |

返回数据格式，JSON 数组，默认按消息记录从新到旧排序，设置请求参数 `reversed` 后以相反的方向排序。
**注意**：系统广播不会出现在消息记录 API 的结果中。

```json
[
  {
    "timestamp": 1408008498571,
    "conv-id":   "219946ef32e40c515d33ae6975a5c593",
    "data":      "今天天气不错！",
    "from":      "u111872755_9d0461adf9c267ae263b3742c60fa",
    "msg-id":    "vdkGm4dtRNmhQ5gqUTFBiA",
    "is-conv":   true,
    "is-room":   false,
    "to":        "5541c02ce4b0f83f4d44414e",
    "bin":       false,
    "from-ip":   "202.117.15.217"
  },
  ...
]
```

以上返回字段的说明如下：

{{ im.conversationProperties() }}

### 获取某个用户发送的聊天记录

此接口仅支持 master key [鉴权认证](rest_api.html#更安全的鉴权方式)，建议仅在服务端使用。

参数 | 约束 | 说明
--- | --- | ---
from | **必填** | 发送人 id
timestamp | 可选 | 查询起始的时间戳，返回小于这个时间（不包含）的记录。默认是当前时间，单位是毫秒。
msgid | 可选 | 起始的消息 id，与 timestamp 一起作为查询的起点。
limit | 可选 | 返回条数限制，默认 100 条，最大 1000 条。

### 获取应用的所有聊天记录

此接口仅支持 master key [鉴权认证](rest_api.html#更安全的鉴权方式)，建议仅在服务端使用

参数 | 约束 | 说明
--- | --- | ---
timestamp | 可选 | 查询起始的时间戳，返回小于这个时间（不包含）的记录。默认是当前时间，单位是毫秒。
msgid | 可选 | 起始的消息 id，**使用时必须加上对应消息的时间戳 timestamp 参数，一起作为查询的起点**。
limit | 可选 | 返回条数限制，默认 100 条，最大 1000 条。

### 获取系统对话中某个特定用户与系统的消息记录

获取系统对话中某个特定用户与系统的消息记录，需要按照一定的规则构建 `convid` 参数，构建规则为：

```
md5([系统对话 id] + ":" + [用户 Client ID])
```

即将系统对话 ID 加半角冒号（`:`）与用户 ID 拼接后取 MD5 。

## 删除聊天记录

删除一条指定的聊天历史记录，必须采用 master key 授权，所以不建议在客户端使用此接口。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'convid=219946ef32e40c515d33ae6975a5c593' \
  --data-urlencode 'msgid=PESlY' \
  --data-urlencode 'timestamp=1408008498571' \
  --data-urlencode 'from=mercy' \
  https://{{host}}/1.1/rtm/messages/logs
```

参数 | 约束 | 说明
--- | --- | ---
convid | 必填 | 对话 id
msgid | 必填 | 消息 id
timestamp | 必填 | 消息时间戳（毫秒）
from | 必填 | 发消息用户 Client ID

## 强制修改聊天记录

修改一条聊天记录，要求使用 master key 授权。

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"msg-id":"4XC_IHK+Ry6CXzIPq_nc7Q","conv-id":"5667070f60b2298fdddb683700000000","ack-at":1449683354932,"is-conv":true,"from":"5666d78c60b204d588fd63aa","bin":false,"timestamp":1449661888571,"is-room":false,"from-ip":"223.104.9.13","to":"5667070f60b2298fdddb6837","data":"{\"_lctype\":-1,\"_lctext\":\"\u771f\u4e0d\u61c2\"}"}' \
  https://{{host}}/1.1/rtm/messages/logs
```

这里传入的数据格式与消息记录返回的格式完全一致，只需要按照实际的需求修改相应的字段即可。需注意修改内容时切勿修改 JSON 中的 `msg-id` 和 `timestamp` 字段，这两个字段用于标识消息，如果修改会造成消息更新失败。

{{ im.conversationProperties() }}

<div class="callout callout-info">本接口仅能修改**服务器端**的消息记录，并不能修改**客户端缓存**的消息记录。如果希望修改，请参考 <a href="#修改与撤回消息">修改与撤回消息接口</a> 的说明。</div>

## 修改与撤回消息

从 Objective-C SDK v6.0.0、Android SDK v4.4.0、JavaScript SDK v3.5.0 开始，我们支持了新的修改与撤回消息功能。修改或撤回消息后，即使已经收到并已缓存在客户端的消息也会被修改或撤回。对于老版本的 SDK，仅能修改或撤回服务器端的消息记录，并不能修改或撤回客户端已缓存的消息记录。

本接口需要 Master Key 授权。

[控制台 > 消息 > 即时通讯 > 设置 > 即时通讯选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中的「允许通过 SDK 编辑消息」和「允许通过 SDK 撤回消息」仅影响 SDK，对本接口无影响。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer":"some sender","conv_id":"5667070f60b2298fdddb6837","timestamp":1449661888571,"msg_id":"4XC_IHK+Ry6CXzIPq_nc7Q","message":"{\"_lctype\":-1,\"_lctext\":\"这是一个修改后的纯文本消息\"}", "recall":true}' \
  https://{{host}}/1.1/rtm/patch/message
```

参数 | 约束 | 说明
--- | --- | --- 
conv_id | 必填 | 对话 id  
msg_id | 必填 | 消息 id  
timestamp | 必填 | 消息时间戳（毫秒）
from_peer | 必填 | 发消息用户 Client ID
message | 必填 | 修改后的消息体 
recall | 可选 | 布尔类型，代表是否撤回消息
to_peers | 可选 | 当撤回的是系统对话单独发给用户的消息时，需要将撤回消息的目标用户的 Client ID 填写在这里。最多 20 个，以逗号分隔，多余的 ID 将被忽略

## 未收取消息数

获取即时通讯中某个 Client ID 的未收取的消息数：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/rtm/messages/unread/CLIENT_ID
```

返回：

```json
{"count": 4}
```

也可以提供特定对话的 Conversation ID，来获取某个 Client ID 下特定对话内的未收取消息数：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/rtm/messages/unread/CLIENT_ID/CONVERSATION_ID
```

返回：

```json
{"count": 3}
```

## 通过 REST API 发消息

我们目前提供 REST API 允许向一个已有对话发送消息。

**注意**，由于这个接口的管理性质，当你通过这个接口发送消息时，我们不会检查 **from_peer** 是否有权限给这个对话发送消息，而是统统放行，请谨慎使用这个接口。
如果你在应用中使用了我们内部定义的 [富媒体消息格式](./realtime_v2.html#消息（Message）)，在发送消息时 **message** 字段需要遵守一定的格式要求，下文 [富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明) 中将详细说明。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "...", "transient": false}' \
  https://{{host}}/1.1/rtm/messages
```

参数 | 约束 | 说明
---|---|---
from_peer | 必填 |消息的发件人 client Id
conv_id | 必填 |发送到对话 id
transient | 可选|是否为暂态消息（**由于向后兼容的考虑，默认为 true**，请注意设置这个值。）
message | 必填 | 消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
no_sync | 可选|默认情况下消息会被同步给在线的 from_peer 用户的客户端，设置为 true 禁用此功能。
push_data | 可选 | 以消息附件方式设置本条消息的离线推送通知内容。如果目标接收者使用的是 iOS 设备并且当前不在线，我们会按照该参数填写的内容来发离线推送。请参看 [离线推送通知](./realtime-guide-intermediate.html#离线推送通知)
priority | 可选 | 定义消息优先级，可选值为 high、normal、low，分别对应高、中、低三种优先级。该参数大小写不敏感，默认为高优先级 high。本参数仅对暂态消息或聊天室的消息有效，高优先级下在服务端与用户设备的连接拥塞时依然排队。

返回说明：

默认情况下发送消息 API 使用异步的方式，调用后返回消息 id 和接收消息的服务器时间戳，例如 `{"msg-id":"qNkRkFWOeSqP65S9fDyHJw", "timestamp":1495431811151}`。

## 系统消息

### 系统对话给用户发消息

利用 REST API 通过系统对话给用户发消息时，除了 conv_id 需要设置为对应系统对话的 id 以外，还需要设置 to_peers（数组）指定实际接收消息的 client id。

目前你可以在一次调用中传入至多 20 个 client id。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "to_peers":["2c","3d","4f"],"message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "...", "transient": false}' \
  https://{{host}}/1.1/rtm/messages
```

参数 | 约束 | 说明
---|---|---
from_peer | 必填 | 消息的发件人 client id
to_peers | 长度最长为 20 个 client id| 接受系统消息的 client id
conv_id | 必填 |发送到对话 id
transient | 可选|是否为暂态消息（**由于向后兼容的考虑，默认为 true**，请注意设置这个值。）
message | 必填 | 消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
no_sync | 可选|默认情况下消息会被同步给在线的 from_peer 用户的客户端，设置为 true 禁用此功能。
push_data | 可选 | 以消息附件方式设置本条消息的离线推送通知内容。如果目标接收者当前不在线，我们会按照该参数填写的内容来发离线推送。请参看 [离线推送通知](./realtime-guide-intermediate.html#离线推送通知)

### 系统对话发送广播消息

利用 REST API 可以发送广播消息给全部用户。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "..."}' \
  https://{{host}}/1.1/rtm/broadcast
```

参数 | 约束 | 类型 | 说明
---|---|---|---
from_peer | 必填 | 字符串 | 消息的发件人 id
conv_id | 必填 | 字符串 | 发送到对话 id，仅限于系统对话
message | 必填 | 字符串 |消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
valid_till | 可选 | 数字 | 过期时间，UTC 时间戳（毫秒），最长为 1 个月之后。默认值为 1 个月后。
push | 可选 | 字符串或 JSON 对象 | 附带的推送内容，如果设置，**所有** iOS 和 Windows Phone 用户会收到这条推送通知。
transient | 可选 | 布尔值 | 默认为 false。该字段用于表示广播消息是否为暂态消息，暂态消息只会被当前在线的用户收到，不在线的用户再次上线后也收不到该消息。

Push 的格式与[推送 REST API 消息内容](push_guide.html#消息内容_Data) 中 `data` 下面的部分一致。如果您需要指定开发证书推送，需要在 push 的 json 中设置 `"_profile": "dev"`，例如：

```
{
   "alert": "消息内容",
   "category": "通知分类名称",
   "badge": "Increment",
   "_profile": "dev"
}
```

频率限制：

此接口受频率限制，[点击查看详情](realtime_rest_api_v2.html#接口请求频率限制)。

### 删除系统对话广播消息

调用此 API 将删除已发布的广播消息。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'mid=message-id' \
  https://{{host}}/1.1/rtm/broadcast
```

参数 | 约束 | 说明
--- | --- | ---
mid | 必填 | 要删除的消息 id，字符串

返回：

空 JSON 对象 `{}`。

### 查询系统广播消息

调用此 API 可查询目前有效的广播消息。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/rtm/broadcast
```

参数 | 约束 | 说明
--- | --- | ---
conv_id | 必填 | 系统对话 id
limit | 可选 | 返回消息条数
skip | 可选 | 跳过消息条数，用于翻页

### 系统对话发送订阅消息

利用 REST API 发送消息给系统对话所有的订阅用户（即加入系统对话的用户）。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "..."}' \
  https://{{host}}/1.1/rtm/broadcast/subscriber
```

参数 | 约束 | 类型 | 说明
---|---|---|---
from_peer | 必填 | 字符串 | 消息的发件人 id
conv_id | 必填 | 字符串 | 发送到对话 id，仅限于系统对话
message | 必填 | 字符串 |消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
push | 可选 | 字符串或 JSON 对象 | 附带的推送内容，如果设置，**所有** iOS 和 Windows Phone 用户会收到这条推送通知。

### 订阅系统对话

为指定用户订阅指定的系统对话。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"conv_id": "...", "client_id": "..."}' \
  https://{{host}}/1.1/rtm/conversation/subscription
```

参数 | 约束 | 类型 | 说明
---|---|---|---
client_id | 必填 | 字符串 | 订阅者的 client id
conv_id | 必填 | 字符串 | 对话 id，仅限于系统对话

### 退订系统对话

为指定用户退订指定的系统对话。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'conv_id=...' \
  --data-urlencode 'client_id=...' \
  https://{{host}}/1.1/rtm/conversation/subscription
```

参数 | 约束 | 类型 | 说明
---|---|---|---
client_id | 必填 | 字符串 | 退订者的 client id
conv_id | 必填 | 字符串 | 对话 id，仅限于系统对话

### 查询系统对话订阅用户数量

查询订阅过指定的系统对话的用户数量。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'conv_id=...' \
  https://{{host}}/1.1/rtm/conversation/subscribers/count
```

参数 | 约束 | 类型 | 说明
---|---|---|---
conv_id | 必填 | 字符串 | 对话 id，仅限于系统对话

### 查询是否订阅过某个系统对话

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'conv_id=...' \
  --data-urlencode 'client_id=...' \
  https://{{host}}/1.1/rtm/conversation/subscribed
```

参数 | 约束 | 类型 | 说明
---|---|---|---
client_id | 必填 | 字符串 | 用户的 client id
conv_id | 必填 | 字符串 | 对话 id，仅限于系统对话

如果订阅过该系统对话返回`true`，否则返回`false`。

### 获取已订阅系统对话

因为目标用户订阅的系统对话可能会很多，一次请求无法全部获取，所以对于订阅了大量系统对话的用户，需要多次调用本接口来逐步获取到所有订阅的系统对话。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'client_id=...' \
  --data-urlencode 'conv_id=...' \
  --data-urlencode 'timestamp=...' \
  --data-urlencode 'limit=...' \
  --data-urlencode 'direction=...' \
  https://{{host}}/1.1/rtm/conversation/subscription
```

参数 | 约束 | 类型 | 说明
---|---|---|---
client_id | 必填 | 字符串 | 目标查询用户的 client id
conv_id | 可选 | 字符串 | 查询起始对话 id，不填则从订阅列表起始位置开始遍历。查询结果不会再包含本对话
timestamp | 可选 | 数字 | 查询起始对话被订阅时间。虽然是可选字段但当提供 conv_id 时本字段必填，值必须为订阅 conv_id 参数所指定系统对话的时间，单位是毫秒
limit | 可选 | 数字 | 返回条数限制，默认是 50 条
direction | 可选 | 字符串 | 查询结果按时间排序方式，old 表示降序，new 表示升序，默认是 new。使用 old 则先返回最近订阅的对话，使用 new 则先返回最早订阅的对话

返回目标用户订阅系统对话的列表：

```
[{"timestamp":1482994126561,"subscriber":"XXX","conv_id":"convId1"},
 {"timestamp":1491467945277,"subscriber":"XXX","conv_id":"convId2"}, ...]
```

其中 `timestamp` 表示用户订阅系统对话的时间，`subscriber` 是订阅用户的 client id。如果一次没有获取完，需要从结果列表中取最后一个系统对话的 id 和订阅该对话的时间，分别作为 conv_id 和 timestamp 参数再次调用本接口以获取下一批订阅的系统对话。

### 获取系统对话的所有订阅者

因为目标系统对话的订阅者可能会很多，一次请求无法全部获取，所以对于拥有大量订阅者的系统对话，需要多次调用本接口来逐步获取到所有的订阅者。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'conv_id=...' \
  --data-urlencode 'client_id=...' \
  --data-urlencode 'limit=...' \
  https://{{host}}/1.1/rtm/conversation/subscribers
```

参数 | 约束 | 类型 | 说明
---|---|---|---
conv_id | 必填 | 字符串 | 对话 id，仅限于系统对话
client_id | 可选 | 字符串 | 查询起始订阅者 client id，不填则从订阅者列表起始位置开始遍历。查询结果不会再包含当前指定的订阅者 client id。
limit | 可选 | 数字 | 返回条数限制，默认是 50 条

返回目标系统对话的订阅者列表：

```
[{"timestamp":1491467841116,"subscriber":"client id 1","conv_id":"55b871"},
 {"timestamp":1491467852768,"subscriber":"client id 2","conv_id":"55b871"}, ...]
```

其中 `timestamp` 表示用户订阅系统对话的时间，`subscriber` 是订阅用户的 client id。如果一次没有获取完，需要从结果列表中取最后一个订阅者的 client id，作为 client_id 参数再次调用本接口以获取下一批订阅者列表。

## 富媒体消息格式说明

富媒体消息的参数格式相对于普通文本来说，仅仅是将 message 参数换成了一个 JSON **字符串**。

<div class="callout callout-info">由于 LeanCloud 即时通讯中所有的消息都是文本，所以这里发送 JSON 结构时**需要首先序列化成字符串**。</div>

#### 文本消息

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_peer": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "...", "transient": false}' \
  https://{{host}}/1.1/rtm/messages
```

发送文本消息可以按照以上的格式进行，参数说明：

参数 |约束| 说明
--- |---|---
`_lctype` | |富媒体消息的类型<table><thead><tr><th>消息</th><th>类型</th></tr></thead><tbody><tr><td>文本消息</td><td>-1</td></tr><tr><td>图像消息</td><td>-2</td></tr><tr><td>音频消息</td><td>-3</td></tr><tr><td>视频消息</td><td>-4</td></tr><tr><td>位置消息</td><td>-5</td></tr><tr><td>文件消息</td><td>-6</td></tr></tbody></table>以上类型均使用负数，所有正数留给自定义扩展类型使用，0 作为「没有类型」被保留起来。
`_lctext` | |富媒体消息的文字说明
`_lcattrs` | |JSON 字符串，用来给开发者存储自定义属性。
`_lcfile` | |如果是包含了文件（图像、音频、视频、通用文件）的消息 ，<br/>`_lcfile` 就包含了它的文件实体的相关信息。
`url` | |文件在上传之后的物理地址
`objId` |可选 |文件对应的在 `_File` 表里面的 objectId
`metaData` | 可选|文件的元数据

**以上参数针对所有富媒体消息都有效**。

#### 图像消息

在新版本的聊天中，支持了内建的富媒体消息格式，以下针对整个消息体 JSON 格式化之后的参数说明，例如如下的图像消息：

```
  {
    "_lctype":    -2,                    //必要参数
    "_lctext":    "图像的文字说明",
    "_lcattrs": {
      "a":        "_lcattrs 是用来存储用户自定义的一些键值对",
      "b":        true,
      "c":        12
    },
    "_lcfile": {
      "url":      "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25", //必要参数
      "objId":    "54699d87e4b0a56c64f470a4//文件对应的AVFile.objectId",
      "metaData": {
        "name":   "IMG_20141223.jpeg",   //图像的名称
        "format": "png",                 //图像的格式
        "height": 768,                   //单位：像素
        "width":  1024,                  //单位：像素
        "size":   18                     //单位：b
      }
    }
  }
```

以上是完整版的格式，如果想简单的发送一个 URL 可以参照以下格式：

```
  {
    "_lctype": -2,
    "_lcfile": {
      "url":   "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25"
    }
  }
```

#### 音频消息

与图像类似，音频格式的完整格式如下：

```
  {
    "_lctype":      -3,
    "_lctext":      "这是一个音频消息",
    "_lcattrs": {
      "a":          "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile": {
      "url":        "http://ac-p2bpmgci.clouddn.com/246b8acc-2e12-4a9d-a255-8d17a3059d25",
      "objId":      "54699d87e4b0a56c64f470a4//文件对应的AVFile.objectId",
      "metaData": {
        "name":     "我的滑板鞋.wav",
        "format":   "wav",
        "duration": 26,    //单位：秒
        "size":     2738   //单位：b
      }
    }
  }
```

简略版：

```
  {
    "_lctype": -3,
    "_lcfile": {
      "url":   "http://www.somemusic.com/x.mp3"
    }
  }
```

#### 视频消息

完整版：

```
  {
    "_lctype":      -4,
    "_lctext":      "这是一个视频消息",
    "_lcattrs": {
      "a":          "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile": {
      "url":        "http://ac-p2bpmgci.clouddn.com/99de0f45-171c-4fdd-82b8-1877b29bdd12",
      "objId":      "54699d87e4b0a56c64f470a4", //文件对应的 AVFile.objectId
      "metaData": {
        "name":     "录制的视频.mov",
        "format":   "avi",
        "duration": 168,      //单位：秒
        "size":     18689     //单位：b
      }
    }
  }
```

简略版：

```
  {
    "_lctype": -4,
    "_lcfile": {
      "url":   "http://www.somevideo.com/Y.flv"
    }
  }
```

#### 通用文件消息

```
  {
    "_lctype": -6,
    "_lctext": "这是一个普通文件类型",
    "_lcattrs": {
      "a":     "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcfile": {
      "url":   "http://www.somefile.com/jianli.doc",
      "name":  "我的简历.doc",
      "size":  18689          //单位：b
    }
  }
```

简略版：

```
  {
    "_lctype": -6,
    "_lcfile": {
      "url":   "http://www.somefile.com/jianli.doc",
      "name":  "我的简历.doc"
    }
  }
```

#### 地理位置消息

```
  {
    "_lctype":     -5,
    "_lctext":     "这是一个地理位置消息",
    "_lcattrs": {
      "a":         "_lcattrs 是用来存储用户自定义的一些键值对"
    },
    "_lcloc": {
      "longitude": 23.2,
      "latitude":  45.2
    }
  }
```

简略版：

```
  {
    "_lctype":     -5,
    "_lcloc": {
      "longitude": 23.2,
      "latitude":  45.2
    }
  }
```

## 获取暂态对话（聊天室）的在线人数

你可以通过这个 API 获得暂态对话的在线人数。出于性能的考虑，这个 API 有一定的缓存时间，仅用作粗略计数。

参数 | 说明
--- | ---
`gid` | 暂态对话（聊天室）的 id

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/rtm/transient_group/onlines?gid=...
```

返回：

```json
{"result": 0}
```

这个 API 也可以用于获取早期版本开放群组的在线人数。

## 随机获取暂态对话（聊天室）部分在线成员的 client id

你可以通过这个 API 获得暂态对话的部分在线成员列表。出于性能的考虑，这个 API 有一定的缓存时间，并且最多只会返回 50 个成员 ID。

参数 | 说明
--- | ---
`gid` | 暂态对话（聊天室）的 id

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/rtm/transient_group/members?gid=...
```

返回：

```json
{"result": ["clientid1", "clientid2", "clientid3"]}
```

## 查询在线状态

在线状态查询 API 可以一次至多查询 20 个 Client ID 当前是否在线：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"peers": ["7u", "8b", "3h", ...]}' \
  https://{{host}}/1.1/rtm/online
```

参数 | 说明
--- | ---
peers | 要查询的 ID 列表

返回：

在线的 ID 列表

```json
{"results":["7u"]}
```

## 对话禁言

使用这个 API 可以让某个 Client ID 在某个对话中禁止发言一段时间。在禁言期间，来自该 ID 的消息会被服务器拒绝（返回错误代码 [4315](error_code.html#_4315)），不会发给对话中的其他用户，适用于「拉黑」或者「黑名单」的需求场景。这个功能对普通对话、暂态对话和系统对话均有效。

禁言的时限以<u>秒</u>为单位，**最长时间为 24 小时**。要提前解除禁言，请参考 [解除禁言](#解除禁言)。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "some-client-id", "conv_id": "some-conv-id", "ttl": 50}' \
  https://{{host}}/1.1/rtm/conversation/blacklist
```

参数 | 说明
--- | ---
client_id | 要禁言的 id，字符串
conv_id | 禁言的对话，字符串
ttl | 禁言的时间，秒数，最长 24 小时

返回：

空 JSON 对象。

```json
{}
```

## 解除禁言

使用这个 API 可以在禁言期限到期之前，解除被禁言的 Client ID，例如将某用户提前移出黑名单，允许其向对话中其他成员发送消息。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'conv_id=some-conv-id' \
  --data-urlencode 'client_id=some-client-id' \
  https://{{host}}/1.1/rtm/conversation/blacklist
```

参数 | 说明
--- | ---
client_id | 要解除禁言的 id，字符串
conv_id | 禁言的对话，字符串

返回：

空 JSON 对象。

```json
{}
```

## 强制下线

强制某个 Client ID 断线，与签名配合使用可以实现立刻拒绝某个 Client ID 的登录：更新应用服务器端
签名逻辑拒绝为某个 Client ID 下发签名，调用此 API 把已经登录的该 ID 的客户端强制下线。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"client_id": "some-client-id", "reason": "..."}' \
  https://{{host}}/1.1/rtm/client/kick
```

参数 | 说明
--- | ---
client_id | 需要强制下线的 id，字符串
reason | 下线的原因，字符串，不超过 20 个字符

返回：

空 JSON 对象。

```json
{}
```

## 获取 Client 登录签名

本接口可以让使用了 [AV.User](rest_api.html#用户-1) 的应用方便快捷地实现登录认证。登录认证默认关闭，可以进入 [控制台 > 消息 > 即时通讯 > 设置 > 即时通讯选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf)，选中 **登录启用签名认证**。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"session_token": "AV.User 的 sessionToken"' \
  https://{{host}}/1.1/rtm/sign
```
参数 | 说明
--- | ---
session_token | AV.User 的 sessionToken

返回：
```json
{"nonce": "", "timestamp": "", "client_id": "", "signature": ""}
```

返回的参数，可以参考「[用户登录签名](realtime-guide-senior.html#用户登录签名)」与「[客户端如何支持操作签名](realtime-guide-senior.html#客户端如何支持操作签名)」进行后续的登录。

为了方便用户进行细粒度控制，实现自定义功能（如黑名单），本接口提供了一个 hook `_rtmClientSign`，在验证 sessionToken 后去调用，传入的参数为 AV.User 构成的 JSON 对象：
```json
{
    "email": "",
    "sessionToken": "",
    "updatedAt": "",  // 格式：2017-07-11T07:58:10.149Z
    "phone": "",
    "objectId": "",
    "username": "",
    "createdAt": "",  // 格式：2017-07-11T07:58:10.149Z
    "emailVerified": true/false,
    "mobilePhoneVerified": true/false
}
```
可以返回两类结果：
```json
{"result": true} // 允许签名
{"result": false, "error": "error message"}  // 拒绝签名
```
