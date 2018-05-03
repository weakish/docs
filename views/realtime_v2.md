{% import "views/_im.njk" as im %}
# 实时通信服务总览

实时通信服务是 LeanCloud 消息服务中的重要一环。你不但可以为应用加入实时聊天、私信等常用功能，还能实现游戏对战等实时互动功能。

目前，我们提供 Android、iOS、JavaScript、Windows Phone 四个主要平台的客户端 SDK，也提供了一些 Demo 帮助你快速入门：

* iOS 聊天应用：
  * [ChatKit，自带 UI 的聊天工具包](chatkit-ios.html)

* Android 聊天应用：
  * [ChatKit，自带 UI 的聊天工具包](chatkit-android.html)
  * [LeanChat Android 版](https://github.com/leancloud/leanchat-android)

* JavaScript 聊天应用
  * [LeanMessageDemo 网页版](https://github.com/leancloud/leanmessage-demo)
  * [Simple Chatroom](https://leancloud.github.io/js-realtime-sdk/demo/simple-chatroom/)（[源码](https://github.com/leancloud/js-realtime-sdk/tree/next/demo/simple-chatroom)）


关于这些项目的更多介绍、截图预览，可见 [LeanCloud Demos](https://github.com/leancloud/leancloud-demos) 。

目前新版本实时通信服务接口与旧版本并不兼容，不能互相通信。我们推荐所有新用户直接使用新版本。已有的旧版本用户可以继续参考 [v1 版本文档](realtime.html)，我们仍然会对已有版本提供支持，并可能在未来提供无缝的迁移方案。已经发布的旧版本用户不会在功能、资源等各个方面受到任何影响，请放心使用。

## 功能和特性

LeanCloud 实时通信服务定位于完美实现网络层的通讯能力，其设计目标聚焦在：

* **快捷**<br/>
  LeanCloud 云端要能支持上亿终端同时在线，并且消息传递延时需要严格控制在毫秒以内。
* **灵活**<br/>
  既要为完全依托 LeanCloud 平台的开发者考虑，也要为自有账户系统的用户设计：如果用户自己有完备的后台和账户系统，应该完全不用暴露内部数据就能使用我们的服务。而且，消息通知的手段要多样化，要让开发者有更多定制的能力。譬如聊天时对方不在线，应该能走「消息推送（Push Notification）」通道来及时提醒对方，并允许开发者对推送内容进行「私人定制」等等。
* **安全**<br/>
  除了简单的 appId 和 secretKey 之外，还应该赋予开发者更多的安全控制能力，来保证聊天通道的私密性。

LeanCloud 实时通信服务的特性主要有：

* **与账户系统解耦合**<br/>
  任何终端用户要加入聊天，只需要提供一个唯一标识自己的 clientId 即可，这样可以尽量避免自有账户系统的应用数据暴露，也可以促使通信服务专注做好底层的「信使」角色；
* **多账号登录**<br/>
  支持单个设备多个账号、单个账号多个设备同时登录，实时消息同步到所有设备。
* **完整的聊天功能**<br/>
  支持单聊、群聊、聊天室、订阅号等不同聊天形式，并且具备完善的群组管理功能。
* **支持富媒体、自定义类型消息**<br/>
  支持文本、图片、音频、视频和地理位置等多种格式的富媒体消息，并且开发者还可方便地自定义扩展。
* **离线消息推送**<br/>
  消息在对方离线时，会自动通过 [消息推送](#离线推送通知) 来及时送达对方，并且推送的消息文本可以由开发者自己控制。
* **敏感词过滤**<br/>
  实时消息中出现的敏感词，会自动被过滤掉；对于部分 VIP 客户，我们还允许[自定义仅属于自己应用的敏感词列表](#_messageReceived)。
* **聊天记录保存在云端**<br/>
  聊天记录自动保存在云端，允许开发者自由获取。
* **第三方操作鉴权机制**<br/>
  为了保证信道的安全，也给开发者最大的控制自由，我们提供了操作鉴权的机制：开发者使用自己的服务器来充当鉴权服务器，对消息流向进行「许可控制」。对于消息路由过程中的重要操作（譬如登录、开启对话、邀请加入群组、从群组踢出某人等），实时消息 SDK 在发送请求之前，会先到鉴权服务器获得操作签名，LeanCloud 云端会验证签名有效性并完全按照鉴权结果来对操作放行或拒绝。
* **系统账号、机器人 Hook 和公众号后台**<br/>
  支持系统中的小助手、机器人和公众号等场景，方便用户将实时通信系统和自己已有的系统无缝集成，支持二次开发机器人和消息后台。

我们提供几个层面用户接口：

* 原生的 Android、iOS、Windows Phone 和 Web (JavaScript) 语言的客户端 SDK
* 帮助开发者完成后台管理和云端相关功能的 REST API
* 部署在 LeanCloud 环境中的云引擎 Hook 便于开发者修改默认的系统行为
* 可以实时监控在线用户数、消息数的开发者控制台

## 核心概念

### ClientID、用户和登录

实时通信服务中的每一个终端称为一个 client。client 拥有一个在应用内唯一标识自己的 id。这个 id 由应用自己定义，必须是不多于 64 个字符的字符串。在大部分场合，client 都可以对应到应用中的某个「用户」，但是并不是只有真的用户才能做为 client，你完全可以把一个探测器当成一个 client，把它收集到的数据通过实时通信服务广播给更多「人」。

默认情况下，LeanCloud 通信服务允许一个 clientId 在多个不同的设备上登录，也允许一个设备上有多个 clientId 同时登录。如果使用场景中需要限制用户只在一处登录，可以在登录时明确设置当前设备的 tag，
当 LeanCloud 检测到同一个 tag 的设备出现冲突时，会自动踢出已存在设备上的登录状态。开发者可以根据自己的应用场景选择合适的使用方式。

使用 LeanCloud 实时通信 SDK 完成登录后，开发者就不必关心网络连接等状态，SDK 会自动为开发者保持连接状态，并根据网络状态自动重连。对于 Android 平台，我们使用常驻后台的服务保持在线状态；对于 iOS 和 Windows Phone
等平台，我们会在应用仍在前台时保持连接，当应用退到后台时，自动断开连接再激活平台原生的推送服务。

#### 在线状态

我们目前在 SDK 和 [REST API](realtime_rest_api_v2.html#查询在线成员) 上提供主动查询的机制帮助开发者查询目标用户的在线状态。

### 对话（Conversation）

用户登录之后，与其他人进行消息沟通，即为开启了一个对话（Conversation）。开始聊天之前，需要先创建或者加入一个对话，然后再邀请其他人进来，之后所有参与者在这个对话内进行交流。所有消息都是由某一个 client 发往一个「对话」。

{% if node=='qcloud' %}
系统每创建一个对话，就会在云端的 `_Conversation` 表中增加一条记录，可以进入 `控制台 > **存储** > **数据**` 来查看该数据。
{% else %}
系统每创建一个对话，就会在云端的 `_Conversation` 表中增加一条记录，可以进入 [控制台 > **存储** > **数据**](/data.html?appid={{appid}}#/) 来查看该数据。
{% endif %}

`_Conversation` 表中字段名与对话的各个属性的对应关系为：

表字段|属性名|类型|约束|说明
---|---|---|---|---
**attr**|attributes|Object|可选|自定义属性，供开发者扩展使用。
**objectId**|conversationId|String||对话 id（只读），由云端为该对话生成的一个全局唯一的 id。
**c**|creator|String||对话创建者的 clientId（只读）
**lm**|lastMessageAt|Date||对话中最后一条消息的发送或接收时间
**m**|members|Array||普通对话的所有参与者（仅针对普通对话，暂态对话和系统对话并不支持持久化的成员列表）
**mu**|mute|Array||将对话设为静音的参与者，这部分参与者不会收到推送。<br/>（仅针对 iOS 以及 Windows Phone 用户有效）
**name**|name|String|可选|对话的名字，可为群组命名。
**tr**|transient|Boolean|可选|是否为暂态对话
**sys**|system|Boolean|可选|是否是系统对话
**unique**|unique|Boolean|可选|内部字段，标记根据成员原子创建的对话。

除了在各平台的 SDK 里面可以调用 API 创建对话外，我们也提供 REST API 可以让大家预先建立对话：对话的信息存储在 _Conversation 表中。

这里要特别讨论一下**单聊**、**群聊**、**聊天室**、**公众号**等使用场景。

* **单聊**<br/>
  就是两个 client 之间的对话，公开与否（能否让其他人看到这个对话存在）由应用层自己控制。一般而言，它是私密的，并且加入新的成员之后，会切换到新的对话（当然，也可以依然不离开当前对话，这一点还是由应用层来决定）。
* **群聊**<br/>
  就是两个（含）以上 client 之间的对话，一般而言，可以添加和删除成员，并且会赋予群聊一个名字。随着成员的减少，群聊也可能只有两个甚至一个成员（成员的多少并不是区分群聊和单聊的关键）。群聊能否公开（譬如支持名字搜索），由应用自己决定。
* **聊天室**<br/>
  很多应用使用的聊天室、弹幕、网页直播等都可以抽象成「聊天室」，它与群聊类似，都是多人参与的群组，但是也有一些区别：其一在于聊天室人数可能远大于群聊人数；其二在于聊天室强调的是在线人数，所有参与者进入聊天界面就算加入，关闭界面就算退出，所以聊天室不需要离线消息和推送通知，在线成员数比具体成员列表更有意义。
* **公众号、机器人**<br/>
  对全部或者部分用户可见（由应用开发者决定）的账号，开发者可以利用这个账号给用户发广播通知，用户也可以通过这个账号反馈内容给开发者，开发者可以在后台看到消息，也可以利用 API 或 [Web Hook](#Web_Hook) 将自己的业务系统集成进来。

我们将以上场景抽象为「对话」这一概念，并分离出以下类型的对话：

#### 普通对话（Normal Conversation）

这是我们经常会用到的「对话」，单聊和群聊都通过它来实现。我们建议开发者将单聊/群聊、私密/公开等属性存入到 Conversation.attributes 之中，在应用层进行区别对待。

为了提高系统的灵活性，我们允许多个对话保持相同的成员，因此创建对话时系统总是默认创建新的对话。
如果开发者希望使用固定的对话，可以在创建对话时设置相应 SDK 上的 `unique` 选项，系统将查找对应成员相同且 `unique` 选项为 true 的对话，如果找到即返回已有的对话，如果没有则自动创建。
（注意，这种方式查找的对话仅对已经使用 `unique` 选项的对话有效，并且创建对话时不会触发 `_Conversation` 表在云引擎上的 `beforeSave` 等 hook）

REST API 在创建对话时同样支持 `unique` 参数。

对于应用中存在系统帐号的场景，我们建议您通过下文提到的[系统对话](#普通对话_Normal_Conversation_)来实现，以避免对单一帐号创建过多的对话影响您应用的性能。

#### 暂态对话（Transient Conversation）

专门用来处理「聊天室」这种需求。与普通对话一样，它支持创建、自身主动加入、自身主动退出对话等操作；消息记录会被保存并可供获取；但不同之处在于：

* **不限成员上限**，没有固定成员概念，加入即为成员，断线即为退出
* 不支持查询成员列表，你可以通过相关 API 查询在线人数。
* 不支持离线消息、离线推送通知等功能。
* 没有成员加入、离开的通知。
* 不支持邀请加入、踢出成员这两个操作。
* 一个用户一次登录只能加入一个暂态对话，加入新的暂态对话后会自动离开旧的暂态对话。
* 加入暂态对话后半小时内断网重连会自动加入原暂态对话，超过这个时间则需要重新加入。
* 在 `_Conversation` 表中，以 `tr` 为 `true` 来标记（`m`列在暂态对话中将被忽略）

注意暂态对话没有持久化的成员概念，因此对普通对话的 `m` 字段的操作对暂态对话无效。

#### 系统对话（System Conversation）

这是用于实现机器人、公众号、服务账号等场景的对话，也可以用作发送应用内通知的通道。这种对话具有以下特点：

* 加入即订阅，离开即退订，支持无限的订阅人数
* 开发者可以通过 REST API 以系统对话的渠道给所有用户、订阅用户或指定用户（不要求用户订阅）发消息
* 用户可以给系统对话发消息，消息和相关信息会存储在数据存储中的 `_SysMessage` 表，并不会被其他订阅用户收到
* 开发者可以配置 [Web Hook](#Web_Hook) 地址接收用户发给系统对话的消息，并利用 REST API 发消息回复
* 在 SDK 层面，系统对话的接口与普通对话完全一致
* 在 `_Conversation` 表中，以 `sys` 为 `true` 来标记（`m`列在系统对话中将被忽略）

#### 对话类型比较

功能点 | 普通对话 | 暂态对话 | 系统对话
--- | --- | --- | ---
**使用场景** | 单聊、群聊 | 聊天室、弹幕、网页实时评论 | 公众号、机器人、下发加好友通知、自定义消息
**成员管理** | 成员持久化保存，<br/>最高支持 500 个成员 | 没有持久化的成员数据，<br/>但支持成员没有上限 | 没有成员概念，<br/>开发者维护订阅关系，<br/>订阅人数没有上限
**收发消息** | 只有成员可以收发消息 | 所有用户都可以发消息，<br/>当前在线的成员可以收到消息 | 开发者通过 API 给特定用户发消息，<br/>用户发送的消息到达数据库和 [Web Hook](#Web_Hook)
**消息记录** | 支持 | 支持 | 支持

#### 创建对话

对话可以通过 SDK 和 REST API 创建。

在大部分使用场景中，普通对话通过 SDK 创建，用于最终用户之间自发的通信。
暂态对话和系统对话通常和应用中的特定实体绑定，可以通过 REST API 提前创建，通过应用中的业务逻辑
把对话 ID 下发给最终用户。

### 消息（Message）

实时通信服务的消息。我们的消息允许用户一次传输不超过 **5 KB** 的文本数据。在底层实时通信允许开发者传输任何基于文本的消息数据，系统对消息格式没有任何要求，
开发者可以在文本协议基础上定义自己的应用层协议。

消息分为「普通消息」和「暂态消息」。LeanCloud 云端对于普通消息会提供接收回执、自动持久化存储、离线推送等功能。
但是暂态消息，则不会被自动保存，也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来做控制协议。
譬如聊天过程中「某某正在输入中...」这样的状态信息，就适合通过暂态消息来发送，而用户输入的正式消息，则应该用普通消息来发送。

LeanCloud 对普通消息提供「至少一次」的到达保证，并且在官方 SDK 中支持对消息的去重，开发者无需关心。除了基于「推」模型的消息机制，我们还提供消息记录的机制允许
SDK 和 REST API 通过「拉」的方式获取任意时间点前的消息。

开发者可以通过 SDK 或 REST API 发送消息。
SDK 通常用于最终用户发送消息，而 REST API 是开发者从云端发送消息的接口。当从 REST API
发送消息时，开发者可以指定消息的发送者、对话 ID，对于系统对话还可以指定消息的接收者。

{{ im.messagesLifespan("") }}

#### 富媒体消息

为了方便开发者的使用，我们提供了几种封装好的基于 JSON 格式的富媒体消息类型（TypedMessage），譬如：

- 文本（TextMessage）
- 图片（ImageMessage）
- 音频（AudioMessage）
- 视频（VideoMessage）
- 位置（LocationMessage）

这些消息类型可最大程度地简化使用步骤，能更好地满足通用需求。开发者也可以基于我们的框架，方便地扩展出自己的消息类型。

这些消息类型的层次关系为：

```
                                    Message
                                       |
                                  TypedMessage
                                       |
     __________________________________|__________________________________
     |             |            |             |               |           |
TextMessage  ImageMessage  AudioMessage  VideoMessage  LocationMessage   。。。
```

关于这部分消息的格式请参考
[《实时通信 REST API - 富媒体消息格式说明》](realtime_rest_api.html#富媒体消息格式说明)了解。

#### 离线消息

{% if node=='qcloud' %}
开发者可以通过 `**控制台** > **消息** > **实时消息** > **帮助**]` 界面查询某个 Client ID 的在线状态和离线消息数。
{% else %}
开发者可以通过 [**控制台** > **消息** > **实时消息** > **帮助**](/messaging.html?appid={{appid}}#/message/realtime/tool) 界面查询某个 Client ID 的在线状态和离线消息数。
{% endif %}

当用户重新登录后，LeanCloud 提供两种方式进行下发离线消息：

1. **默认方式**：云端会对每个对话推送至多最近 20 条消息。这部分消息在用户上线后会以新消息的形式到达客户端，对于轻量级的应用这种方式可以满足开发者对离线消息的需求；
2. **未读数量方式**：云端会返回离线期间产生未读消息的对话列表及未读消息数，开发者可以根据这个通知拉取离线消息记录收取离线消息，这种方式下开发者对消息的数量可以完全的控制；

<div class="callout callout-danger">注意，请不要混合使用上面两种方式，比如在 iOS 平台使用默认方式获取离线消息而 Android 平台使用未读数量方式获取离线消息。这种情况可能导致离线消息无法正常获取。</div>

#### 离线推送通知

对离线的 iOS 和 Windows Phone 用户，每次有离线消息时，我们提供发送离线推送通知的功能。要想使用本功能，用户需要 **自定义推送的内容**，目前有三种方式，按优先级从高到低依次为：

1. 动态内容方式

  如果希望推送通知显示动态内容，比如消息的实际内容，或根据消息内容、对话信息等上下文信息来自定义内容，则需要通过 [云引擎 Hook `_receiversOffline`](#_receiversOffline) 来实现。该类型优先级最高。

2. 消息附件方式
  
  - 对于 SDK，通过各个 SDK 提供的 API 设置这条消息可能产生的推送内容，比如 JS 的是 [pushData 参数](https://leancloud.github.io/js-realtime-sdk/docs/Conversation.html#send)
  - 对于 REST，通过 [push_data 参数](./realtime_rest_api_v2.html#发消息)设定

3. 静态内容方式

  由于不同平台的不同限制，且用户的消息正文可能还包含上层协议，所以我们允许用户在控制台中为应用设置一个静态的 APNs JSON，推送一条内容固定的通知。
  {% if node=='qcloud' %}
  进入 `控制台 > 消息 > 实时消息 > 设置 > iOS 用户离线推送设置`，填入：
  {% else %}
  进入 [控制台 > 消息 > 实时消息 > 设置 > iOS 用户离线推送设置](/messaging.html?appid={{appid}}#/message/realtime/conf)，填入：
  {% endif %}
  ```
  {"alert":"您有新的消息", "badge":"Increment"}
  ```
  注意，`Increment` 大小写敏感，表示自动增加应用 badge 上的数字计数。清除 badge 的操作请参考 [iOS 推送指南 &middot; 清除 badge](ios_push_guide.html#清除_Badge)。
  
  ![image](images/realtime_ios_push.png)

  此外，您还可以设置声音等推送属性，具体的字段可以参考[推送 &middot; 消息内容 Data](./push_guide.html#消息内容_Data)。

##### 限制

通知的过期时间是 7 天，也就是说，如果一个设备 7 天内没有连接到 APNs 或 MPNs，系统将不会再给这个设备推送通知。

##### 原理

这部分平台的用户，在完成登录时，SDK 会自动关联当前的 Client ID 和设备。关联的方式是通过设备**订阅**名为 Client ID 的 Channel 实现的。开发者可以在数据存储的 `_Installation` 表中的 `channels` 字段查到这组关联关系。在实际离线推送时，系统根据用户 Client ID 找到对应的关联设备进行推送。由于实时通信触发的推送量比较大，内容单一， 所以云端不会保留这部分记录，在 **控制台 > 消息 > 推送记录** 中也无法找到这些记录。

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

#### 敏感词过滤

根据政策的要求，我们为多人的普通对话、暂态对话和系统对话进行敏感词过滤。海外节点暂未启用。

过滤的词库由 LeanCloud 提供，命中的敏感词将会被替换为 `***`。

如果开发者有较为复杂的过滤需求，我们推荐使用 [云引擎 hook _messageReceived](#_messageReceived) 来实现过滤，在 hook 中开发者对消息的内容有完全的控制力。

#### 广播消息

当开发者需要向所有用户发送广播消息时，可以利用广播消息的接口，而无需遍历所有的用户 ID 逐个发送。

广播消息具有以下特征：

* 广播消息必须与系统对话关联，广播消息和一般的系统对话消息会混合在系统对话的记录中
* 用户离线时发送的广播消息，上线后会作为离线消息收到
* 广播消息具有实效性，可以设置过期时间；过期的消息不会作为离线消息发送给用户，不过仍然可以在历史消息中获取到
* 新用户第一次登录后，会收到最近一条未过期的系统广播消息

除此以外广播消息与普通消息的处理完全一致。广播消息的发送可以参考[广播消息 REST API](./realtime_rest_api_v2.html#全局广播)

## 权限和认证

使用签名可以保证聊天通道的安全，这一功能默认是关闭的，可以在 [控制台 > 消息 > 实时消息 > 设置 > 实时消息选项](/dashboard/messaging.html?appid={{appid}}#/message/realtime/conf) 中进行开启：

- **登录启用签名认证**，用于控制所有的用户登录
- **对话操作启用签名认证**，用于控制新建或加入对话、邀请/踢出对话成员等操作
- **聊天记录查询启用签名认证**，用于控制聊天记录查询操作

开发者可根据实际需要进行选择。一般来说，**登录认证** 能够满足大部分安全需求，而且我们也强烈建议开发者开启登录认证。
对于使用 AVUser 的应用，可使用 REST API [获取 Client 登录签名](./realtime_rest_api_v2.html#获取登录签名) 进行登录认证。

![image](images/leanmessage_signature2.png)

1. 客户端进行登录或新建对话等操作，SDK 会调用 SignatureFactory 的实现，并携带用户信息和用户行为（登录、新建对话或群组操作）请求签名；
2. 应用自有的权限系统，或应用在 LeanCloud 云引擎上的签名程序收到请求，进行权限验证，如果通过则利用下文所述的 [签名算法](#用户登录的签名) 生成时间戳、随机字符串和签名返回给客户端；
3. 客户端获得签名后，编码到请求中，发给 LeanCloud 实时通信服务器；
4. 实时通信服务器对请求的内容和签名做一遍验证，确认这个操作是被应用服务器允许的，进而执行后续的实际操作。

签名采用 **Hmac-sha1** 算法，输出字节流的十六进制字符串（hex dump）。针对不同的请求，开发者需要拼装不同组合的字符串，加上 UTC timestamp 以及随机字符串作为签名的消息。

### 云引擎签名范例

我们提供了一个运行在 LeanCloud [云引擎](leanengine_overview.html) 上的 [签名范例程序](https://github.com/leancloud/realtime-messaging-signature-cloudcode)
，它提供了基于 Web Hosting 和云函数两种方式的签名实现，你可以根据实际情况选择自己的实现。

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


>注意：签名的 key **必须** 是应用的 master key，你可以 {% if node=='qcloud' %}控制台 > 设置 > 应用 Key{% else %}[控制台 > 设置 > 应用 Key](/app.html?appid={{appid}}#/key){% endif %} 里找到。**请保护好 master key，不要泄露给任何无关人员。**

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
* signature_ts 签名时间戳（签名参数），单位是秒
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

云引擎 Hook 允许你通过自定义的云引擎函数处理实时通信中的某些事件，修改默认的流程等等。目前开放的 hook 云函数包括：

* **_messageReceived**<br/>
  消息达到服务器，群组成员已解析完成之后，发送给收件人之前。
* **_receiversOffline**<br/>
  消息发送完成，存在离线的收件人。
* **_messageSent**<br/>
  消息发送完成。
* **_conversationStart**<br/>
  创建对话，在签名校验（如果开启）之后，实际创建之前。
* **_conversationStarted**<br/>
  创建对话完成。
* **_conversationAdd**<br/>
  向对话添加成员，在签名校验（如果开启）之后，实际加入之前，包括主动加入和被其他用户加入两种情况。
* **_conversationRemove**<br/>
  从对话中踢出成员，在签名校验（如果开启）之后，实际踢出之前，用户自己退出对话不会调用。
* **_conversationUpdate**<br/>
  修改对话属性、设置或取消对话消息提醒，在实际修改之前调用。

### 使用场景

示例应用 [LeanChat](https://github.com/leancloud/leanchat-android) 也用了云引擎 Hook 功能来自定义消息推送，通过解析上层消息协议获取消息类型和内容，以 `fromPeer` 得到发送者的名称，组装成 `pushMessage`，这样能使推送通知的用户体验更好。可参考 [leanchat-cloudcode 代码](https://github.com/leancloud/leanchat-cloudcode/blob/master/cloud.js)。

与 conversation 相关的 hook 可以在应用签名之外增加额外的权限判断，控制对话是否允许被建立、某些用户是否允许被加入对话等。你可以用这一 hook 实现黑名单功能。

### `_messageReceived`

这个 hook 发生在消息到达 LeanCloud 云端之后。如果是群组消息，我们会解析出所有消息收件人。

你可以通过返回参数控制消息是否需要被丢弃，删除个别收件人，还可以修改消息内容，例如过滤应用中的敏感词（[示例](leanengine_cloudfunction_guide-node.html#onIMMessageReceived)）。返回空对象（`response.success({})`）则会执行系统默认的流程。

<div class="callout callout-info">请注意，在这个 hook 的代码实现的任何分支上**请确保最终会调用 response.success 返回结果**，使得消息可以尽快投递给收件人。这个 hook 将**阻塞发送流程**，因此请尽量减少无谓的代码调用，提升效率。</div>

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [实时通信 REST API 指南 - 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者的 ID
convId   | 消息所属对话的 ID
toPeers | 解析出的对话相关的 Client ID
transient | 是否是 transient 消息
content | 消息体字符串
receipt | 是否要求回执
timestamp | 服务器收到消息的时间戳（毫秒）
sourceIP | 消息发送者的 IP

#### 返回

参数 |约束| 说明
---|---|---
drop |可选|如果返回真值消息将被丢弃
code | 可选 | 当 drop 为 true 时可以下发一个应用自定义的整型错误码
content |可选|修改后的 content，如果不提供则保留原消息。
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

    response.success({"pushMessage": pushMessage});
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
attr | 可选 | 修改后的待设置对话属性，如果不提供则保持原参数中的对话属性。
mute | 可选 | 修改后的关闭对话提醒设置，如果不提供则保持原参数中的关闭提醒设置。

mute 和 attr 参数互斥，不能同时返回。并且返回值必须与请求对应，请求中如果带着 attr，则返回值中只有 attr 参数有效，返回 mute 会被丢弃。同理，请求中如果带着 mute，返回值中如果有 attr 则 attr 会被丢弃。

### 部署环境

实时通信的云引擎 Hook 要求云引擎部署在云引擎的 **生产环境**，测试环境仅用于开发者手动调用测试。由于缓存的原因，首次部署的云引擎 Hook 需要至多三分钟来正式生效，后续修改会实时生效。

更多使用方法请参考 [云引擎 · 云函数](leanengine_cloudfunction_guide-node.html)。所有云引擎调用都有默认超时时间和容错机制，在出错情况下系统将按照默认的流程执行后续操作。

## Android 开发指南

参考 [Android 实时通信开发指南](realtime_guide-android.html)

## iOS 开发指南

参考 [iOS 实时通信开发指南](realtime_guide-objc.html)

##  JavaScript 开发指南

参考 [JavaScript 实时通信开发指南](realtime_guide-js.html)。另外，我们已经开源了 JavaScript  Realtime SDK， 见 [ LeanCloud JavaScript Realtime SDK - Github 资源库](https://github.com/leancloud/js-realtime-sdk) 。

## REST API

参考 [实时通信 REST API](realtime_rest_api_v2.html)。

## 对话与消息管理 SDK

Python 与 JavaScript 的数据存储 SDK，基于 REST API 封装了一组对话及消息管理的接口，方便在服务端或者云引擎中进行对话管理、发送消息。具体文档参考：[实时通讯服务端管理开发指南](im-servermgmt-guide-python.html)。


## 系统对话

系统对话可以用于实现机器人自动回复、公众号、服务账号等功能。在我们的 [官方聊天 Demo](http://leancloud.github.io/leanmessage-demo/) 中就有一个使用系统对话 hook 实现的机器人 MathBot，它能计算用户发送来的数学表达式并返回结果，[其服务端源码](https://github.com/leancloud/leanmessage-demo/tree/master/server) 可以从 GitHub 上获取。

### 系统对话的创建

系统对话也是对话的一种，创建后也是在 `_Conversation` 表中增加一条记录，只是该记录 `sys` 列的值为 true，从而与普通会话进行区别。具体创建方法请参考: [创建服务号](#创建服务号) 。

### 系统对话消息的发送

系统对话给用户发消息请参考： [REST API - 给部分订阅者发消息](realtime_rest_api_v2.html#给部分订阅者发消息)。
用户给系统对话发送消息跟用户给普通对话发消息方法一致。

您还可以利用系统对话发送广播消息给全部用户。相比遍历所有用户 ID 逐个发送，广播消息只需要调用一次 REST API。
关于广播消息的详细特征可以参考[消息 - 广播消息](#广播消息)。

### 获取系统对话消息记录

获取系统对话给用户发送的消息记录请参考： [查询服务号给特定订阅者发的消息](realtime_rest_api_v2.html#查询服务号给特定订阅者发的消息)

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

## 高级功能

### 对话权限

「对话权限」功能作为实时通信的一项补充，可以将对话内成员划分成不同角色，实现类似 QQ 群管理员的效果。使用这个功能需要在控制台 实时通信-设置 中开启「对话成员属性功能（成员角色管理功能）」。

目前系统内的角色与功能对应关系：

| 角色 | 功能列表 |
| ---------|--------- |
| Owner | 永久性禁言、踢人、加人、拉黑、更新他人权限 |
| Manager | 永久性禁言、踢人、加人、拉黑、更新他人权限 |
| Member | 加人 |

需要注意一点，目前不支持 Owner 的变更。

### 黑名单

「黑名单」功能可以实现类似微信 屏蔽 的效果，目前分为两大类

- 对话 --> 成员
- 成员 --> 对话

使用这个功能需要在控制台 实时通信-设置 中开启「黑名单功能」。

## 限制

* 对于客户端主动发起的操作会按照操作类型限制其频率。发消息操作限制为 **每分钟 60 次**，历史消息查询操作限制为 **每分钟 120 次**，其他类型操作包括加入对话、离开对话、登录服务、退出服务等均限制为 **每分钟 30 次**。当调用超过限制时，云端会拒绝响应这些超限的操作，这样如果操作本由 SDK 发起则表现为不会走回调。如果使用 REST API 发起各种操作，则不会受到上述频率的限制。
* 应用全局发送消息的速度默认为每分钟 3 万次，如果你的应用会超过此限制，请 [联系我们](/help.html)。
* 客户端发送的单条消息大小不得超过 5 KB。
* 单个普通对话的成员上限为 500 个，如果您通过数据存储 API 向 m 字段加入了超过 500 个 id，我们只会使用其中的前 500 个。
* 请不要使用相同的 id 在大量设备上同时登录，如果系统检测到某个 id 同时在超过 5 个不同的 IP 上登录，会认为此 id 是重复使用的 id，之后此 id 当日的每次登录会按照 `id + IP` 的组合作为计费的独立用户。
* 如果单个用户有超过 50 个的对话存在未接收的离线消息，那么当该用户登录时服务端只会**随机**下发 50 个对话的离线消息或未读消息数量。也就是说服务端不会再下发超出对话数量限制的那部分离线消息，也不会下发离线消息数量，离线消息不会丟失但需要从历史记录中拉取得到。
* 单个对话未接收的离线消息数最多 100 条，超过后，系统会以先入先出方式存储新的离线消息，同时移除当前对话存储的最早的一条离线消息。被移除的离线消息可以通过历史消息记录查询，但不会产生离线消息提醒，也不会计入对话的未读消息计数。
* 系统广播消息一个应用一天最多发 30 条

{{ im.conversationsLifespan("### 对话的有效期") }}

{{ im.messagesLifespan("### 消息的有效期") }} 

## 云端错误码说明

实时通信的错误码会以 SDK 异常或 WebSocket 关闭状态码的形式返回给客户端。当出现异常情况时，SDK 会输出状态码到日志里，以下是对部分状态码的简单说明：

{{ im.errorCodes('table') }}

## 常见问题 FAQ

### 要让单个群组消息进入「免打扰模式」，该如何做

对于普通对话的新消息，LeanCloud 实时通信服务有选项支持将消息以 Push Notification 的方式通知当前不在线的成员，但是有时候，这种推送会非常频繁对用户造成干扰。LeanCloud 提供选项，支持让单个用户关闭特定对话的离线消息推送。具体可以看相应平台的开发指南文档。


### 聊天好友关系如何实现

LeanCloud 实时通信服务是完全独立的实时通信业务抽象，专注在实时通信本身，所以实时通信的业务逻辑中，并不含有好友关系，以及对应的聊天用户数据信息（如头像、名称等）。实时通信与其他业务逻辑完全隔离，不耦合，唯一关联的就是 clientId。这样做的好处是显而易见的，比如你可以很容易让匿名用户直接通信，你也可以自定义一些好友逻辑，总之可以做成因为任意逻辑而匹配产生的聊天行为。

当然，如果你想维护一套好友关系，完全可以使用你自己的逻辑，只要存储着每个用户在实时通信中的 clientId 即可。我们推荐使用 LeanCloud 的存储，即 LeanStorage，这样可以结合 LeanCloud 中的 User 相关对象来简单地实现账户系统，以及与之相关的存储，详情可以阅读对应的 SDK 开发指南。

### 聊天记录的保存时间和条数

{{ im.messagesLifespan("") }}

### 聊天消息没有收到

当出现聊天消息没有收到的情况，你可以按照以下思路排查：

* 调用消息记录 API 查看消息是否到达了云端
* 如果只有一个消息接收者，可以检查消息记录中对应条目的 `ack-at` 字段判断消息是否到达了客户端
{% if node=='qcloud' %}
* 在 `控制台 > **消息** > **实时消息** > **帮助**` 页面的文本框里输入对应的 Client ID，查看是否在线，以及是否有离线消息。
{% else %}
* 在 [控制台 > **消息** > **实时消息** > **帮助**](/messaging.html?appid={{appid}}#/message/realtime/tool) 页面的文本框里输入对应的 Client ID，查看是否在线，以及是否有离线消息。
{% endif %}


### 为什么我的 iPhone 收不到离线消息推送
{% if node=='qcloud' %}
请先参考 [聊天消息没有收到](#聊天消息没有收到)。在 `控制台 > **消息** > **实时消息** > **设置** > **iOS 用户离线推送设置** > **推送内容**`
{% else %}
请先参考 [聊天消息没有收到](#聊天消息没有收到)。在 [控制台 > **消息** > **实时消息** > **设置** > **iOS 用户离线推送设置** > **推送内容**](/messaging.html?appid={{appid}}#/message/realtime/conf) {% endif %}
填写「您有新的未读消息」后，当对方不在线的时候，便会触发一个 APNs 的推送。首先，请确保控制台能向 iOS 推送消息，也即如下图所示的推送能顺利到达 iOS 系统，请参考 [iOS 推送开发文档](ios_push_guide.html)。

![image](images/realtime_faq_push.png)

之后，还要确保对方确实是离线，如果对方程序在前台并且网络良好，则不会触发推送。如果对方网络未连接，则下次联网的时候收到回调，也不触发推送。也可以利用控制台实时消息页的用户状态查询来确保对方处于离线状态，如下图。

![image](images/realtime_faq_console.png)

离线消息推送默认用的是生产环境编辑框里上传的证书。所以，调试时可能要上传开发证书，并在推送内容中设置 `_profile` 属性来选择开发证书推送，如 `{"alert": "你有一条未读消息", "_profile": "dev"}`

检查方法总结如下：

* 检查 `_Installation` 表中是否有设备订阅了对应的 Client ID
* 检查普通的 iOS 推送是否到达
* 检查证书设置
* 在控制台检查接收方是否在离线状态
