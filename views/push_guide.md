{% set deviceprofile_format = "`deviceProfile` 的值必须以字母开头，由大小写字母、数字和下划线组成的字符串，或为空值。" %}
{% import "views/_parts.html" as include %}

{{ include.setService('push') }}

# 消息推送服务总览

消息推送，使得开发者可以即时地向其应用程序的用户推送通知或者消息，与用户保持互动，从而有效地提高留存率，提升用户体验。平台提供整合了 Android 推送、iOS 推送和 Windows Phone 推送的统一推送服务。

除了 iOS、Android SDK 做推送服务之外，你还可以通过 [REST API](#使用_REST_API_推送消息) 来发送推送请求。

## 基本概念

### Installation

{% if node=='qcloud' %}
Installation 表示一个允许推送的设备的唯一标示，对应 `数据管理` 平台中的 `_Installation` 表。它就是一个普通的对象，主要属性包括:
{% else %}
Installation 表示一个允许推送的设备的唯一标示，对应 [数据管理](/dashboard/data.html?appid={{appid}}) 平台中的 `_Installation` 表。它就是一个普通的对象，主要属性包括:
{% endif %}

名称|适用平台|描述
---|---|---
badge|iOS|呈现在应用图标右上角的红色圆形数字提示，例如待更新的应用数、未读信息数目等。
channels| |设备订阅的频道
deviceProfile||在应用有多个 iOS 推送证书或多个 Android 混合推送配置的场景下，deviceProfile 用于指定当前设备使用的证书名或配置名。其值需要与 [控制台 > 消息 > 设置](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 内配置的证书名或配置名对应，否则将无法完成推送。使用方法请参考 [iOS 测试和生产证书区分](#iOS_测试和生产证书区分) 和 [Android 混合推送多配置区分](#Android_混合推送多配置区分)。<br/><br/>{{deviceprofile_format}}
deviceToken|iOS|APNS 推送的唯一标识符
apnsTopic|iOS|基于 Token Authentication 的推送需要设置该字段。iOS SDK 会自动读取 iOS 应用的 bundle ID 作为 apnsTopic。但以下情况需要手工指定： 1. 使用低于 v4.2.0 的 iOS SDK 版本; 2. 不使用 iOS SDK （如 React Native）；3. 使用不同于 bundle ID 的 topic。
deviceType| |设备类型，目前支持 "ios"、"android"、"wp"。
ID|Windows Phone|仅对微软平台的设备（微软平板和手机）有效
installationId|Android|LeanCloud SDK 为每个 Android 设备产生的唯一标识符
subscriptionUri|Windows Phone|MPNS（微软推送服务）推送的通道
timeZone| |设备设定的时区

增删改查设备，请看后面的 SDK 说明和 [REST API](#使用_REST_API_推送消息) 一节。


### Notification

{% if node=='qcloud' %}
对应 **控制台 > 消息 > 推送记录** 里的一条记录，表示一条推送消息，它包括下列属性：
{% else %}
对应 [控制台 > 消息 > 推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 里的一条记录，表示一条推送消息，它包括下列属性：
{% endif %}


名称|适用平台|描述
---|---|---
data| |本次推送的消息内容，JSON 对象。
invalidTokens|iOS|本次推送遇到多少次由 APNS 返回的 [INVALID TOKEN](https://developer.apple.com/library/mac/technotes/tn2265/_index.html#//apple_ref/doc/uid/DTS40010376-CH1-TNTAG32) 错误。**如果这个数字过大，请留意证书是否正常。**
prod|iOS|使用什么环境证书。**dev** 表示开发证书，**prod** 表示生产环境证书。
status| |本次推送的状态，**in-queue** 表示仍然在队列，**done** 表示完成，**scheduled** 表示定时推送任务等待触发中。
devices| |本次推送目标设备数。这个数字不是实际送达数，而是处理本次推送请求时在 `_Installation` 表中符合查询条件且有效的总设备数。有效是指 `_Installation` 表的 valid 字段为 true 且 updatedAt 字段时间在最近三个月以内。目标设备数可能会包含大量的非活跃用户(如已卸载 App 的用户)，这部分用户可能无法收到推送。
successes| |本次推送成功设备数。推送成功对普通 Android 设备来说指目标设备收到了推送，对 iOS 设备或使用了混合推送的 Android 设备来说指消息成功推送给了 Apple APNS 或设备对应的混合推送平台。
where| |本次推送查询 `_Installation` 表的条件，符合这些查询条件的设备将接收本条推送消息。
errors| | 本次推送过程中的错误信息。

如何发送消息也请看下面的详细指南。

推送本质上是根据一个 query 条件来查询 `_Installation` 表里符合条件的设备，然后将消息推送给设备。因为 `_Installation` 是一个可以完全自定义属性的 Key-Value Object，因此可以实现各种复杂条件推送，例如频道订阅、地理位置信息推送、特定用户推送等。

对于 **devices** 和 **successes** 这两个属性，当 **devices** 值为 0 时，表示没有找到任何符合目标条件的设备，需要检查一下推送查询条件，这时没有设备能收到推送通知；当 **devices** 值不为 0 时，该值仅仅说明找到了这么多符合条件的设备，但并不保证这些设备都能收到推送通知，所以 **successes** 很可能是会小于 **devices** 的。特别是当查询出来的设备中含有大量的非活跃设备时，**successes** 可能会和 **devices** 有很大差距。

注意：我们只保留最近一周的推送记录，并会对过期的推送记录定时进行清理。推送记录清理和推送消息过期时间无关，也就是说即使推送记录被清理，没有过期的推送消息依然是有效的，目标用户依然是能够收到消息。推送过期时间设置请参考 [推送消息](#推送消息) 一节。

## iOS 消息推送

请阅读 [iOS 推送开发文档](./ios_push_guide.html)。

## Android 消息推送

请阅读 [Android 推送开发文档](./android_push_guide.html)。

## Android 混合推送

在部分 Android ROM 上，由于系统对后台进程控制较严，Android 推送的到达率会受到影响。为此我们专门设计了一套称为「混合推送」的高级推送机制，用以提高在这部分 Android ROM 上推送的到达率。

目前 Android 混合推送功能仅对商用版应用开放，如果希望使用该功能，请进入 [控制台 > 消息 > 推送 > 设置 > 混合推送](/dashboard/messaging.html?appid={{appid}}#/message/push/conf)，打开混合推送的开关。

请注意，**开启混合推送** 选项可以根据需要随时进行切换，这样做并不会产生不良影响。当该选项关闭后，下一次 Android 推送会与普通推送一样自动选择 LeanCloud 自有通道送达客户端，除了会再次遇到上面提到的自有通道在部分 ROM 上会受到限制的问题之外，不会有别的影响。而当该选项再次开启后，Android 推送又会去选择第三方推送渠道。

关于混合推送的接入方法和使用方式请阅读 [Android 混合推送使用文档](./android_push_guide.html#混合推送)。

## 云引擎和 JavaScript 创建推送

请阅读 [JavaScript SDK 指南 &middot; Push 通知](./leanstorage_guide-js.html#Push_通知)。

## 使用 REST API 推送消息

### Installation

当 App 安装到用户设备后，如果要使用消息推送功能，LeanCloud SDK 会自动生成一个 Installation 对象。Installation 对象包含了推送所需要的所有信息。你可以使用 REST API，通过 Installation 对象进行消息推送。

#### 保存 Installation

##### DeviceToken

iOS 设备通常使用 DeviceToken 来唯一标识一台设备。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "ios",
        "deviceToken": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
        "channels": [
          "public", "protected", "private"
        ]
      }' \
  https://{{host}}/1.1/installations
```

##### installationId

对于 Android 设备，LeanCloud SDK 会自动生成 uuid 作为 installationId 保存到云端。使用 REST API 来保存  installationId 的方法如下：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "android",
        "installationId": "12345678-4312-1234-1234-1234567890ab",
        "channels": [
          "public", "protected", "private"
        ]
      }' \
  https://{{host}}/1.1/installations
```

`installationId` 必须在应用内唯一。

##### 订阅和退订频道

通过设置 `channels` 属性来订阅某个推送频道，下面假设 `mrmBZvsErB` 是待操作 Installation 对象的 objectId：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels": [
          "customer"
        ]
      }' \
  https://{{host}}/1.1/installations/mrmBZvsErB
```

退订一个频道：

```
curl -X PUT \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels": {
           "__op":"Remove",
           "objects":["customer"]
        }
       }' \
  https://{{host}}/1.1/installations/mrmBZvsErB
```

`channels` 本质上是数组属性，因此可以使用标准 [REST API](./rest_api.html#数组) 操作。

#### 添加自定义属性

假设 `mrmBZvsErB` 是待操作 Installation 对象的 objectId，待添加的自定义属性是 **userObjectId**，值为 `<用户的 objectId>`：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "userObjectId": "<用户的 objectId>"
      }' \
  https://{{host}}/1.1/installations/mrmBZvsErB
```

### 推送消息

通过 `POST /1.1/push` 来推送消息给设备，`push` 接口支持下列属性：

名称| 约束 | 描述
---|--- | ---
data| **必填**| 推送的内容数据，JSON 对象，请参考 [消息内容](#消息内容_Data)。请注意，整个 JSON 字符串不能超过 4096 个字符。
channels| 可选 | 推送给哪些频道，将作为条件加入 where 对象。
where| 可选 | 检索 `_Installation` 表使用的查询条件，JSON 对象。
expiration_interval| 可选 | 消息过期的相对时间，从调用 API 的时间开始算起，单位是秒。
expiration_time| 可选 | 消息过期的绝对日期时间，需为 UTC 时间且符合 ISO8601 格式要求，例如："2019-04-01T06:19:29.000Z"
notification_id | 可选 | 自定义推送 id，最长 16 个字符且只能由英文字母和数字组成，不提供该参数时我们会为每个推送请求随机分配一个唯一的推送 id，用于区分不同推送。我们会根据推送 id 来统计推送的目标设备数和最终消息到达数，并展示在 [推送记录](#Notification) 当中。用户自定义推送 id 可以将多个不同的请求并入同一个推送 id 下从而整体统计出这一批推送请求的目标设备数和最终消息到达数。
prod| 可选 | **仅对 iOS 有效**。设置使用开发证书（**dev**）还是生产证书（**prod**）。当设备设置了 deviceProfile 时我们优先按照 deviceProfile 指定的证书推送。
push_time| 可选 | 设置定时推送的发送时间，需为 UTC 时间且符合 ISO8601 格式要求，例如："2019-04-01T06:19:29.000Z"。请注意发送时间与当前时间如果小于 1 分钟则推送会立即发出，不会遵循 push_time 参数要求。
req_id | 可选 | 自定义请求 id，最长 16 个字符且只能由英文字母和数字组成。5 分钟内带有相同 req_id 的不同推送请求我们认为是重复请求，只会发一次推送。用户可以在请求中带着唯一的 req_id 从而在接口出现超时等异常时将请求重发一次，以避免漏掉失败的推送请求。并且由于前后两次请求中 req_id 相同，我们会自动过滤重复的推送请求以保证每个目标终端用户最多只会收到一次推送消息。**重发过频或次数过多会影响正常的消息推送**，请注意控制。
topic | 可选 | installation 的 apnsTopic，iOS Token Authentication 鉴权需要该字段。iOS SDK 会自动读取 iOS app 的 bundle ID，但以下情况需要手工指定： 1. 使用低于 v4.2.0 的 iOS SDK; 2. 不使用 iOS SDK （如 React Native）；3. 推送目标设备使用的 topic 与 iOS Bundle ID 不同。
apns_team_id | 可选 | Apple 不支持在一次推送中向从属于不同 Team Id 的设备发推送。在使用 iOS Token Authentication 的鉴权方式后，如果应用配置了多个不同 Team Id 的 Private Key，请填写该参数，并通过 where 查询条件保证单次推送请求的目标设备均属于本参数指定的 Team Id，以保证推送正常进行。

此接口受频率限制，限制如下：

|  商用版   |      开发版    |
|----------|---------------|
| 每应用 600 次/分钟 | 每应用 60 次/分钟  |

超过频率限制后 1 分钟内 LeanCloud 会拒绝请求持续返回 429 错误码，一分钟后会重新处理请求。


#### master key 校验

当在 [控制台 > 消息 > 推送 > 设置 > 推送选项](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 中点选了 **禁止从客户端进行消息推送** 后，推送消息接口必须增加 **master key** 校验才能成功发送推送，从而避免了客户端可以不经限制的给应用内任意目标设备推送消息的可能。我们建议用户都将此限制启用。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{masterkey}},master"        \
  -H "Content-Type: application/json" \
  -d '{
        "where": {"channels" : ["public"]}
        "data": {"alert" : "Hello from LeanCloud"}
     }' \
  https://{{host}}/1.1/push
```

#### 过期时间

我们建议给 iOS 设备的推送都设置过期时间，这样才能保证在推送的当时，如果用户与 APNs 之间的连接恰好断开（如关闭了手机网络、设置了飞行模式等)，在连接恢复之后消息过期之前，用户仍然可以收到推送消息。可以参考 [Stackoverflow &middot; Push notification is not being delivered when iPhone comes back online](http://stackoverflow.com/questions/24026544/push-notification-is-not-being-delivered-when-iphone-comes-back-online)。

过期时间的用法请参考 [过期时间和定时推送](#过期时间和定时推送)。

#### 消息内容 Data

对于 iOS 设备，消息内容参数 data 内属性可以是：

```
{
  "alert":             "消息内容",
  "category":          "通知类型",
  "thread-id":         "通知分类名称",
  "badge":             数字类型，未读消息数目，应用图标边上的小红点数字，可以是数字，也可以是字符串 "Increment"（大小写敏感）,
  "sound":             "声音文件名，前提在应用里存在",
  "content-available": 数字类型，如果使用 Newsstand，设置为 1 来开始一次后台下载,
  "mutable-content":   数字类型，用于支持 UNNotificationServiceExtension 功能，设置为 1 时启用,
  "custom-key":        "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
  "collapse-id":       "对应 APNs request header 的 apns-collapse-id 参数，用于多条推送合并展示，具体请点击下面 Apple 官方关于 Request Header 的文档链接进行查阅",
  "apns-priority":     数字类型，只能是 10 或 5，对应 APNs request header 的 apns-priority 参数，用于控制是否以节电模式发推送，具体请点击下面 Apple 官方关于 Request Header 的文档链接进行查阅
}
```

并且 iOS 设备支持 `alert` 本地化消息推送，只需要将上面 `alert` 参数从 String 替换为一个由本地化消息推送属性组成的 JSON 即可：

```
{
  "alert": {
    "title":               "标题",
    "title-loc-key":       "",
    "sub-title":           "附标题",
    "sub-title-loc-key":   "",
    "body":                "消息内容",
    "action-loc-key":      "",
    "loc-key":             "",
    "loc-args":            [""],
    "launch-image":        ""
   }
}
```

data 和 alert 内属性的具体含义请参考 [Apple 官方关于 Payload Key 的文档](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html)，以及 [Apple 官方关于 Request Header 的文档](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingwithAPNs.html)。

另外，我们也支持按照上述 Apple 官方文档的方式构造推送参数，如：

```
{
  "aps": {
     "alert": {
       "title":               "标题",
       "title-loc-key":       "",
       "sub-title":           "附标题",
       "sub-title-loc-key":   "",
       "body":                "消息内容",
       "action-loc-key":      "",
       "loc-key":             "",
       "loc-args":            [""],
       "launch-image":        ""
     }
     "category":          "通知类型",
     "thread-id":         "通知分类名称",
     "badge":             数字类型，未读消息数目，应用图标边上的小红点数字，可以是数字，也可以是字符串 "Increment"（大小写敏感）,
     "sound":             "声音文件名，前提在应用里存在",
     "content-available": 数字类型，如果使用 Newsstand，设置为 1 来开始一次后台下载,
     "mutable-content":   数字类型，用于支持 UNNotificationServiceExtension 功能，设置为 1 时启用
   }
   "custom-key":          "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
   "collapse-id":         "对应 APNs request header 的 apns-collapse-id 参数，用于多条推送合并展示，具体请点击上面 Apple 官方关于 Request Header 的文档链接进行查阅",
   "apns-priority":       数字类型，只能是 10 或 5，对应 APNs request header 的 apns-priority 参数，用于控制是否以节电模式发推送，具体请点击上面 Apple 官方关于 Request Header 的文档链接进行查阅
}
```

如果是 Android 设备，默认的消息栏通知消息内容参数支持下列属性：

```
{
  "alert":      "消息内容",
  "title":      "显示在通知栏的标题",
  "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
  "silent":     true/false // 用于控制是否关闭推送通知栏提醒，默认为 false，即不关闭通知栏提醒
}
```

如果自定义 Receiver，需要设置 `action`：

```
{
  "alert":      "消息内容",
  "title":      "显示在通知栏的标题",
  "action":     "com.your_company.push",
  "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
  "silent":     true/false // 用于控制是否关闭推送通知栏提醒，默认为 false，即不关闭通知栏提醒
}
```

Windows Phone 设备类似，也支持 `title` 和 `alert`，同时支持 `wp-param` 用于定义打开通知的时候打开的是哪个 Page：

```
{
  "alert":      "消息内容",
  "title":      "显示在通知栏的标题",
  "wp-param":   "/chat.xaml?NavigatedFrom=Toast Notification"
}
```

但是如果想一次 push 调用**推送不同的数据给不同类型的设备**，消息内容参数同时支持设定设备特定消息，例如：

```
{
  "ios": {
    "alert":             "消息内容",
     "badge":             数字类型，未读消息数目，应用图标边上的小红点数字，可以是数字，也可以设置为 "Increment" 这个字符串（大小写敏感）,
     "sound":             "声音文件名，前提在应用里存在",
     "content-available": "如果你在使用 Newsstand, 设置为 1 来开始一次后台下载",
     "custom-key":        "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"
   },
   "android": {
     "alert":             "消息内容",
     "title":             "显示在通知栏的标题",
     "action":            "com.your_company.push",
     "custom-key":        "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
     "silent":            true/false // 用于控制是否关闭推送通知栏提醒，默认为 false，即不关闭通知栏提醒
   },
   "wp":{
     "alert":             "消息内容",
     "title":             "显示在通知栏的标题",
     "wp-param":          "/chat.xaml?NavigatedFrom=Toast Notification"
   }
}
```

#### iOS 测试和生产证书区分

我们现在支持上传两个环境的 iOS 推送证书：测试和生产环境，你可以通过设定 `prod` 属性来指定使用哪个环境证书。

```
{
  "prod": "dev",
  "data": {
    "alert": "test"
  }
}
```

如果是 `dev` 值就表示使用开发证书，`prod` 值表示使用生产证书。如果未设置 `prod` 属性，且使用的不是 [JavaScript 数据存储 SDK](https://leancloud.github.io/javascript-sdk/docs/AV.Push.html)，我们默认使用**生产证书**来发推送。如果未设置 `prod` 属性，且使用的是 [JavaScript 数据存储 SDK](https://leancloud.github.io/javascript-sdk/docs/AV.Push.html) ，则需要在发推送之前执行 [AV.setProduction](https://leancloud.github.io/javascript-sdk/docs/AV.html#.setProduction) 函数才会使用生产证书发推送，否则会以开发证书发推送。注意，当设备设置了 `deviceProfile` 时我们优先按照 `deviceProfile` 指定的证书推送。

#### Android 推送区分透传和通知栏消息

Android 推送（包括 Android 混合推送）支持透传和通知栏两种消息类型。透传消息是指消息到达设备后会先交给 LeanCloud Android SDK，再由 SDK 将消息通过 [自定义 Receiver](./android_push_guide.html#自定义_Receiver) 传递给开发者，收到消息后的行为由开发者定义的 Receiver 来决定，SDK 不会自动弹出通知栏提醒。而通知栏消息是指消息到达设备后会立即自动弹出通知栏提醒。

LeanCloud 推送服务通过推送请求中 `data` 参数内的 `silent` 字段区分透传和通知栏消息。如果 `silent` 是 `true` 则表示这个消息是透传消息，为 `false` 表示消息是通知栏消息。如果不传递 `silent` 则默认其值为 `false`。另外请注意，如果希望接收透传消息请不要忘记自行实现 [自定义 Receiver](./android_push_guide.html#自定义_Receiver)。

推送请求中的 `data` 参数请参考 [消息内容 Data](#消息内容_Data)。

#### Android 混合推送多配置区分

如果使用了混合推送功能，并且在 [控制台 > 消息 > 推送 > 设置 > 混合推送](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 增加了多个混合推送配置，那么在向 `_Installation` 表保存设备信息时就需要将当前设备所对应的混合推送配置名存入 `deviceProfile` 字段。系统会按照该字段指定的唯一配置名为每个目标设备进行混合推送。

如果 `deviceProfile` 字段为空，系统会默认使用名为 `_default` 的混合推送配置来进行推送，所以一定要保证在控制台的混合推送设置中，存在以 `_default` 命名的 Profile 并且已被正确配置，否则系统会**拒绝推送。**

{{deviceprofile_format}}

#### 推送查询条件

`_Installation` 表中的所有属性，无论是内置的还是自定义的，都可以作为查询条件通过 where 来指定，并且支持 [REST API](./rest_api.html#查询) 定义的各种复杂查询。

下面会举一些例子，更多例子请参考 [REST API](./rest_api.html#查询) 查询文档。

#### 推送给所有的设备
```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "alert": "LeanCloud 向您问好！"
        }
      }' \
  https://{{host}}/1.1/push
```

#### 发送给特定的用户

* 发送给 android 设备的用户

```sh
curl -X POST \
-H "X-LC-Id: {{appid}}"          \
-H "X-LC-Key: {{appkey}}"        \
-H "Content-Type: application/json" \
-d '{
      "where":{
        "deviceType": "android"
      },
      "data": {
        "alert": "LeanCloud 向您问好！"
      }
    }' \
https://{{host}}/1.1/push
```

* 发送给 public 频道的用户

```sh
curl -X POST \
-H "X-LC-Id: {{appid}}"          \
-H "X-LC-Key: {{appkey}}"        \
-H "Content-Type: application/json" \
-d '{
      "where":{
        "channels":
          {"$regex":"\\Qpublic\\E"}
      },
      "data": {
        "alert": "LeanCloud 向您问好！"
      }
    }' \
https://{{host}}/1.1/push
```

或者更简便的方式

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels":[ "public"],
        "data": {
          "alert": "LeanCloud 向您问好！"
        }
      }' \
  https://{{host}}/1.1/push

```

* 发送给某个 installation id 的用户

```sh
curl -X POST \
-H "X-LC-Id: {{appid}}"          \
-H "X-LC-Key: {{appkey}}"        \
-H "Content-Type: application/json" \
-d '{
      "where":{
          "installationId":"57234d4c-752f-4e78-81ad-a6d14048020d"
          },
      "data": {
        "alert": "LeanCloud 向您问好！"
      }
    }' \
https://{{host}}/1.1/push
```

* 推送给不活跃的用户

```sh
curl -X POST \
-H "X-LC-Id: {{appid}}"          \
-H "X-LC-Key: {{appkey}}"        \
-H "Content-Type: application/json" \
-d '{
      "where":{
          "updatedAt":{
              "$lt":{"__type":"Date","iso":"2015-06-29T11:33:53.323Z"}
            }
      },
      "data": {
          "alert": "LeanCloud 向您问好！"
      }
    }' \
https://{{host}}/1.1/push
```

* 根据查询条件做推送：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "inStock": true
        },
        "data": {
          "alert": "您关注的商品已经到货，请尽快购买。"
        }
      }' \
  https://{{host}}/1.1/push
```

用 `where` 查询的都是 `_Installations` 表中的属性。这里假设该表存储了 `inStock` 的布尔属性。

* 根据地理信息位置做推送：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "where": {
          "owner": {
            "$inQuery": {
              "location": {
                "$nearSphere": {
                  "__type": "GeoPoint",
                  "latitude": 30.0,
                  "longitude": -20.0
                },
                "$maxDistanceInMiles": 10.0
              }
            }
          }
        },
        "data": {
          "alert": "北京明日最高气温 40 摄氏度。"
        }
      }' \
  https://{{host}}/1.1/push
```

上面的例子假设 installation 有个 owner 属性指向 `_User` 表的记录，并且用户有个 `location` 属性是 GeoPoint 类型，我们就可以根据地理信息位置做推送。

#### 过期时间和定时推送

`expiration_time` 属性用于指定消息的过期时间，如果客户端收到消息的时间超过这个绝对时间，那么消息将不显示给用户。`expiration_time` 是一个 UTC 时间的字符串，格式为 `YYYY-MM-DDTHH:MM:SS.MMMZ`。

```
{
      "expiration_time": "2016-01-28T00:07:29.773Z",
      "data": {
        "alert": "过期时间为北京时间 1 月 28 日 8:07。"
      }
}
```

`expiration_interval` 也可以用于指定过期时间，不过这是一个相对时间，以**秒**为单位，从 API 调用时间点开始计算起：

```
{
      "expiration_interval": "86400",
      "data": {
        "alert": "收到 Push API 调用的 24 小时后过期。"
      }
}
```

`push_time` 是定时推送的时间，格式为 `YYYY-MM-DDTHH:MM:SS.MMMZ` 的 UTC 时间，也可以结合 `expiration_interval` 设定过期时间：

```
{
      "push_time":           "2016-01-28T00:07:29.773Z",
      "expiration_interval": "86400",
      "data": {
        "alert": "北京时间 1 月 28 日 8:07 发送这条推送，24 小时后过期"
      }
}
```

#### 推送消息属性

##### 消息过期

 过期时间，可以是绝对时间：
```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "expiration_time": "2015-10-07T00:51:13Z",
        "data": {
          "alert": "您的优惠券将于 10 月 7 日到期。"
        }
      }' \
  https://{{host}}/1.1/push
```

也可以是相对时间（从推送 API 调用开始算起，结合 push_time 做定期推送）:
```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "push_time": "2015-06-28T00:51:13.931Z",
        "expiration_interval": 518400,
        "data": {
          "alert": "您未使用的代金券将于 2015 年 7 月 4 日过期。"
        }
      }' \
  https://{{host}}/1.1/push
```

##### 定制消息属性：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels": [
          "employee"
        ],
        "data": {
          "alert": "本周五下午三点组织大家看电影《大圣归来》。",
          "badge": "Increment",
          "sound": "cheering.caf",
          "title": "员工福利"
        }
      }' \
  https://{{host}}/1.1/push
```


### 推送记录查询

`/push` 接口在推送后会返回代表该条推送消息的 `objectId`，你可以使用这个 ID 调用下列 API 查询推送记录：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/tables/Notifications/:objectId
```

其中 URL 里的 `:objectId` 替换成 `/push` 接口返回的 objectId 。

将返回推送记录对象，推送记录各字段含义参考 [Notification 说明](#Notification)。

### 推送状态查看和取消

{% if node=='qcloud' %}
在发推送的过程中，我们会随着推送任务的执行更新推送状态到 **控制台 > 消息 > 推送记录** 中，可以在这里查看推送的最新状态。对不同推送状态的说明请参看 [Notification 表详解](#Notification)。
{% else %}
在发推送的过程中，我们会随着推送任务的执行更新推送状态到 [控制台 > 消息 > 推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 中，可以在这里查看推送的最新状态。对不同推送状态的说明请参看 [Notification 表详解](#Notification)。
{% endif %}

在一条推送记录状态到达 **done** 即完成推送之前，其状态信息旁边会显示 “取消推送” 按钮，点击后就能将本次推送取消。并且取消了的推送会从推送记录中删除。

请注意取消推送的意思是取消还排在队列中未发出的推送，已经发出或已存入离线缓存的推送是无法取消的。同理，推送状态显示已经完成的推送也无法取消。请尽力在发推送前做好测试，确认好发送内容和目标设备查询条件。

### 定时推送任务查询和取消

可以使用 **master key** 查询当前正在等待推送的定时推送任务：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{masterkey}},master"        \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/scheduledPushMessages
 ```

查询出来的结果类似：

```json
{
  "results": [
    {
      "id": 1,
      "expire_time": 1373912050838,
      "push_msg": {
        "through?": null,
        "app-id": "OLnulS0MaC7EEyAJ0uA7uKEF-gzGzoHsz",
        "where": {
          "sort": {
            "createdAt": 1
          },
          "query": {
            "installationId": "just-for-test",
            "valid": true
          }
        },
        "prod": "prod",
        "api-version": "1.1",
        "msg": {
          "message": "test msg"
        },
        "id": "XRs9jmWnLd0GH2EH",
        "notificationId": "mhWjvHvJARB6Q6ni"
      },
      "createdAt": "2016-01-21T00:47:46.000Z"
    }
  ]
}
```

其中 `push_msg` 就是该推送消息的详情，`expire_time` 是消息设定推送时间的 unix 时间戳。

取消一个定时推送任务，要使用返回结果中最外层的 id。以上面的结果为例，即为 `results[0].id`，而不是 `results[0].push_msg.id`:

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{masterkey}},master"        \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/scheduledPushMessages/:id
```

## 限制

* 为避免给大量早已不再活跃的用户发消息，我们限制只能给 `_Installation` 表内 `updatedAt` 时间在最近三个月以内的设备推送消息。我们会在根据推送查询条件查出目标设备后自动将不符合条件的设备从目标设备中剔除，并且被剔除的设备不会计入 [控制台 > 消息 > 推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 内的目标设备数中。
* 为防止由于大量证书错误所产生的性能问题，我们对使用 **开发证书** 的推送做了设备数量的限制，即一次至多可以向 20,000 个设备进行推送。如果满足推送条件的设备超过了 20,000 个，系统会拒绝此次推送，在 [控制台 > 消息 > 推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 中的 **状态** 一栏显示「错误」，提示信息为「dev profile disabled for massive push」。因此，在使用开发证书推送时，请合理设置推送条件。
* Apple 对推送消息大小有限制，对 iOS 推送请尽量缩小要发送的数据大小，否则会被截断。详情请参看 [APNs 文档](https://developer.apple.com/library/content/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/PayloadKeyReference.html)。
* 如果使用了 Android 的混合推送，请注意华为推送对消息大小有限制。为保证推送消息能被正常发送，我们要求 data + channels 参数须小于 4096 字节，超过限制会导致推送无法正常发送，请尽量减小发送数据大小。
* 每个开发版应用处在待发队列中的定时推送数量最多 10 条，每个商用版应用处在待发队列中的定时推送数量最多 1000 条。


如果推送失败，在 [控制台 > 消息 > 推送记录 > 状态](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 一栏中会看到错误提示。

## Installation 自动过期和清理

每当用户打开应用，我们都会更新该设备的 `_Installation` 表中的 `updatedAt` 时间戳。如果用户长期没有更新 `_Installation` 表的 `updatedAt` 时间戳，也就意味着该用户长期没有打开过应用。当超过 360 天没有打开过应用时，我们会将这个用户在 `_Installation` 表中的记录删除。不过请不要担心，当用户再次打开应用的时候，仍然会自动创建一个新的 Installation 用于推送。

对于 iOS 设备，除了上述过期机制外还多拥有一套过期机制。当我们根据 Apple 推送服务的反馈获取到某设备的 deviceToken 已过期时，我们也会将这个设备在 `_Installation` 表中的信息删除，并标记这个已过期的 deviceToken 为无效，丢弃后续所有发送到该 deviceToken 的消息。

## 推送问题排查

推送因为环节较多，跟设备和网络都相关，并且调用都是异步化，因此问题比较难以查找，这里提供一些有用助于排查消息推送问题的技巧。

### 推送结果查询

所有经过 `/push` 接口发出的消息的都可以在控制台的消息菜单里的推送记录看到。每次调用 `/push` 都将产生一条新的 推送记录表示一次推送。该表的各属性含义请参考 [Notification 表详解](#Notification) 。

`/push` 接口会返回新建的推送记录的 `objectId`，你就可以在推送记录里根据 ID 查询消息推送的结果。

### iOS 推送排查建议

iOS 推送问题的一些排查建议：

* 请确保在项目 Info.plist 文件中使用了正确的 **Bundle Identifier**。
* 请确保在 **Project** > **Build Settings** 设置了正确的 **provisioning profile**。
* 尝试 clean 项目并重启 Xcode
* 尝试到 [Apple Developer](https://developer.apple.com/account/overview.action) 重新生成 **provisioning profile**，修改 Apple ID，再改回来，然后重新生成。你需要重新安装 provisioning profile，并在 **Project** > **Build Settings** 里重新设置。
* 打开 XCode Organizer，从电脑和 iOS 设备里删除所有过期和不用的 provisioning profile。
* 如果编译和运行都没有问题，但是你仍然收不到推送，请确保你的应用打开了接收推送权限，在 iOS 设备的 **设置** > **通知** > **你的应用** 里确认。
* 如果权限也没有问题，请确保使用了正确的 **provisioning profile**。 打包你的应用。如果你上传了开发证书并使用开发证书推送，那么必须使用 **Development Provisioning Profile** 构建你的应用。如果你上传了生产证书，并且使用生产证书推送，请确保你的应用使用 **Distribution Provisioning Profile** 签名打包。**Ad Hoc** 和 **App Store Distribution Provisioning Profile** 都可以接收使用生产证书发送的消息。
* 当在一个已经存在的 Apple ID 上启用推送，请记得重新生成 **provisioning profile**，并到 XCode Organizer 更新。
* 生产环境的推送证书必须在提交到 App Store 之前启用推送并生成，否则你需要重新提交 App Store。
* 请在提交 App Store 之前，使用 Ad Hoc Profile 测试生产环境推送，这种情况下的配置最接近于 App Store。
* 检查消息菜单里的推送记录中的 `devices` 和 `status`，确认推送状态和接收设备数目正常。
* 检查消息菜单里的推送记录中的 `invalidTokens` 字段，如果该数字异常大，可能证书选择错误，跟设备 build 的 provisioning profile 不匹配。

### Android 排查建议

Android 推送问题的一些建议和提示：

* 请确保设备正确调用了 `AVInstallation` 保存了设备信息到 _Installation 表。
* 可以在控制台的 **消息** > **推送** > **帮助** 根据 `installationId` 查询设备是否在线。
* 请确保 `com.avos.avoscloud.PushService` 添加到 AndroidManifest.xml 文件中。
* 如果使用自定义 Receiver，请确保在 AndroidManifest.xml 中声明你的 Receiver，并且保证 data 里的 action 一致。
