# 即时通讯 REST API 使用指南 v2

## 请求格式

对于 POST 和 PUT 请求，请求的主体必须是 JSON 格式，而且 HTTP Header 的 Content-Type 需要设置为 `application/json`。

## 鉴权

请求的鉴权是通过 HTTP Header 里面包含的键值对来进行的，参数如下表：

Key|Value|含义|来源
---|----|---|---
`X-LC-Id`|{{appid}}|当前应用的 App Id|可在控制台->设置页面查看
`X-LC-Key`| {{appkey}}|当前应用的 App Key |可在控制台->设置页面查看

部分管理性质的接口需要使用 master key。

## 相关概念

`_Conversation` 表 包含一些内置的关键字段定义了对话的属性、成员等，单聊/群聊、聊天室、服务号均在此表中，可以在 [即时通讯概览 - 对话](./realtime_v2.html#对话（Conversation）) 中了解。

## 新特性

在 [1.1 版本的 API](realtime_rest_api.html) 中，所有类型的对话 API 混淆在一起，1.2 版本将「对话」这一概念按照类型进行了拆分，目前有三类：

- 单聊/群聊，相关 API 以 `rtm/conversations` 标示
- 聊天室，相关 API 以 `rtm/chatrooms` 标示，在 `_Conversation` 表内用字段 `tr` 为 true 标示。
- 服务号，相关 API 以 `rtm/service-conversations` 标示，在 `_Conversation` 表内用字段 `sys` 为 true 标示。

除此之外，与 client 相关的请求以 `rtm/clients` 标示。
最后，一些[全局性质的 API](#全局 API) 直接以 `rtm/{function}` 标示，如 `rtm/all-conversations` 查询所有类型的对话。

{% include "views/_rtm_rest_api_v2_normal.njk" %}
{% include "views/_rtm_rest_api_v2_chatroom.njk" %}
{% include "views/_rtm_rest_api_v2_system.njk" %}
{% include "views/_rtm_rest_api_v2_client.njk" %}

## 全局 API

### 查询用户数

本接口会返回应用当前在线用户总数，以及当天有登录记录的独立用户总数。本接口要求使用 master key。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.2/rtm/stats
```

返回

```
{"result":{"online_user_count":10212,"user_count_today":1002324}}
```

其中 `online_user_count` 表示当前应用在线用户总数，`user_count_today` 表示当天有登录记录的独立用户总数。

### 查询所有对话

本接口会返回所有的 单聊群聊/聊天室/服务号。在 `_Conversation` 表默认 ACL 权限下要求使用 master key。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.2/rtm/all-conversations
```

参数 | 约束 | 说明
---|---|---
skip | 可选 |
limit | 可选 | 与 skip 联合使用实现分页
where | 可选 | 参考 [数据存储 - 查询](rest_api.html#查询)。

返回
```
{"results"=>[{"name"=>"conversation", "createdAt"=>"2018-01-17T04:15:33.386Z", "updatedAt"=>"2018-01-17T04:15:33.386Z", "objectId"=>"5a5ecde6c3422b738c8779d7"}]}
```

### 全局广播

该接口可以给该应用所有 client 广播一条消息，每天最多 30 条。本接口要求使用 master key。


```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_client": "1a", "message": "{\"_lctype\":-1,\"_lctext\":\"这是一个纯文本消息\",\"_lcattrs\":{\"a\":\"_lcattrs 是用来存储用户自定义的一些键值对\"}}", "conv_id": "..."}' \
  https://{{host}}/1.2/rtm/broadcasts
```

参数 | 约束 | 类型 | 说明
---|---|---|---
from_client | 必填 | 字符串 | 消息的发件人 id
conv_id | 必填 | 字符串 | 发送到对话 id，仅限于服务号
message | 必填 | 字符串 |消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
valid_till | 可选 | 数字 | 过期时间，UTC 时间戳（毫秒），最长为 1 个月之后。默认值为 1 个月后。
push | 可选 | 字符串或 JSON 对象 | 附带的推送内容，如果设置，**所有** iOS 和 Android 用户会收到这条推送通知。
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

此接口受频率限制，[点击查看详情](#接口请求频率限制)。

### 修改广播消息

该接口要求使用 master key。

广播消息修改仅对当前还未收到该广播消息的设备生效，如果目标设备已经收到了该广播消息则无法修改。请慎重发送广播消息。

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_client": "", "message": "", "timestamp": 123}' \
  https://{{host}}/1.2/rtm/service-conversations/{conv_id}/messages/{message_id}
```

参数 | 约束 | 说明
---|---|---
from_client | 必填 | 消息的发件人 client ID
message | 必填 | 消息体
timestamp | 必填 | 消息的时间戳

返回：
```
{"result": {}}
```

频率限制：

此接口受频率限制，[点击查看详情](#接口请求频率限制)。

### 删除广播消息

调用此 API 将删除已发布的广播消息，仅对还未收到广播消息的设备生效，已收到广播消息的设备无法删除消息。本接口要求使用 master key。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.2/rtm/broadcasts/{message_id}
```

参数 | 约束 | 说明
--- | --- | ---
message_id | 必填 | 要删除的消息 id，字符串

返回：

空 JSON 对象 `{}`。

### 查询广播消息

调用此 API 可查询目前有效的广播消息。本接口要求使用 master key。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.2/rtm/broadcasts?conv_id={conv_id}
```

参数 | 约束 | 说明
--- | --- | ---
conv_id | 必填 | 服务号 id
limit | 可选 | 返回消息条数
skip | 可选 | 跳过消息条数，用于翻页

### 查询应用内所有历史消息

该接口要求使用 master key。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.2/rtm/messages
```

参数与返回值可以参考 [单聊/群聊的查询历史消息](realtime_rest_api_v2.html#查询历史消息) 接口。

## 接口请求频率限制

本文档中和消息操作有关的 REST API 有请求频率以及总量的限制（**即时通讯 SDK 的 API 不受此限制影响**），具体如下：

### 普通消息

1.1 版本：

* [发送消息](realtime_rest_api.html#通过 REST API 发消息)
* [修改与撤回消息](realtime_rest_api.html#修改与撤回消息)
* [系统对话给用户发消息](realtime_rest_api.html#系统对话给用户发消息)

1.2 版本：

* [单聊/群聊-发消息](#单聊/群聊-发消息)
* [单聊/群聊-修改消息](#单聊/群聊-修改消息)
* [单聊/群聊-撤回消息](#单聊/群聊-撤回消息)
* [聊天室-发消息](#聊天室-发消息)
* [聊天室-修改消息](#聊天室-修改消息)
* [聊天室-撤回消息](#聊天室-撤回消息)
* [服务号-给任意用户单独发消息](#给任意用户单独发消息)
* [服务号-修改给用户单独发送的消息](#修改给用户单独发送的消息)
* [服务号-撤回给用户单独发送的消息](#撤回给用户单独发送的消息)

#### 限制

|商用版（每应用） |开发版（每应用）|
|----------|---------------|
|最大 9000 次/分钟，默认 1800 次/分钟|120 次/分钟|

所有接口共享额度。超过额度限制后一分钟内 LeanCloud 会拒绝请求持续返回 429 错误码，一分钟后会重新处理请求。

商用版应用的上限可以在 [控制台 > 消息 > 即时通讯 > 设置 > 服务阈值 > 普通消息 API 调用频率上限][dashboard-rtm-limit] 修改。
按照每日调用频率峰值实行阶梯收费，如下表所示：

[dashboard-rtm-limit]: /dashboard/messaging.html?appid={{appid}}#/message/realtime/conf

| 每分钟调用频率 | 费用 |
| - | - |
| 0 ～ 1800 | 免费 |
| 1801 ~ 3600 | ¥20 元 / 天 |
| 3601 ~ 5400 | ¥30 元 / 天 |
| 5401 ~ 7200 | ¥40 元 / 天 |
| 7201 ~ 9000 | ¥50 元 / 天 |

国际版

| 每分钟调用频率 | 费用 |
| - | - |
| 0 ～ 1800 | 免费 |
| 1801 ~ 3600 | $6 USD / 天 |
| 3601 ~ 5400 | $9 USD / 天 |
| 5401 ~ 7200 | $12 USD / 天 |
| 7201 ~ 9000 | $15 USD / 天 |

每日调用频率峰值可以在 [控制台 > 消息 > 即时通讯 > 统计 > API 请求频率峰值][dashboard-rtm-stats] 中查看。

[dashboard-rtm-stats]: /dashboard/messaging.html?appid={{appid}}#/message/realtime/stat

### 订阅消息

1.1 版本：

* [系统对话发送订阅消息](realtime_rest_api.html#系统对话发送订阅消息)

1.2 版本：

* [给所有订阅者发消息](#给所有订阅者发消息)
* [修改给所有订阅者发送的消息](#修改给所有订阅者发送的消息)
* [撤回给所有订阅者发送的消息](#撤回给所有订阅者发送的消息)

#### 限制

|限制  |商用版   |      开发版    |
|----------|----------|---------------|
|频率限制 | 每应用 30 次/分钟 | 每应用 10 次/分钟  |
|总量限制 | 全天最多 1000 次 | 全天最多 100 次 |

所有接口共享额度。超过频率限制后 1 分钟内 LeanCloud 会拒绝请求持续返回 429 错误码，一分钟后会重新处理请求；超过总量限制后当天会拒绝之后的所有请求并返回 429 错误码。

### 广播消息

1.1 版本：

* [发送广播消息](realtime_rest_api.html#系统对话发送广播消息)

1.2 版本：

* [全局广播](#全局广播)
* [修改广播消息](#修改广播消息)

#### 限制

|限制   |商用版   |      开发版    |
|----------|----------|---------------|
|频率限制 | 每应用 10 次/分钟 | 每应用 1 次/分钟  |
|总量限制 | 全天最多 30 次 | 全天最多 10 次 |

所有接口共享以上额度。超过频率限制后 1 分钟内 LeanCloud 会拒绝请求持续返回 429 错误码，一分钟后会重新处理请求；超过总量限制后当天会拒绝之后的所有请求并返回 429 错误码。
