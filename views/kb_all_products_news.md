{% import "views/_data.njk" as data %}
{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

# 产品动态

## 2020-07

### 内建账户系统的第三方登录增加支付宝和 Apple 通道

7 月份我们在内建账户系统（AVUser）中增加了支付宝和 Apple 的第三方集成，开发者可以在「应用控制台 - 存储 - 用户 - 设置」中看到所有支持的第三方账户系统，欢迎感兴趣的开发者来试用，和给予我们更多反馈。

### 即时通讯服务统计结果中增加网络流量展示

对于即时通讯服务来说，在开放聊天室或者大型群组里面，消息下发的压力会随着用户规模的增长而急剧扩大，为了让开发者更直观地看到资源消耗，我们在应用控制台的统计页面，增加了「流量」统计结果的展示，希望可以给开发者带来一些参考价值，以便大家更合理地使用我们的服务。

## 2020-06

### Flutter 存储 SDK 增加社交组件

从 0.4.0 版本开始，Flutter 存储 SDK 增加了应用内社交组件，诸如粉丝、关注、状态、私信等常用功能都可以直接调用标准 API 来实现，更多示例可以参考[存储 Flutter SDK 开发指南](leanstorage_guide-flutter.html)。

### Objective-C 即时通讯 SDK 12.2.0 发布

之前有开发者反馈 Objective-C SDK 在 WebSocket 模块中偶尔会出现崩溃，调查之后我们发现该问题属于第三方 WebSocket 库的 bug，修复起来涉及改动点较多，评估后我们最终决定对该模块进行完全重写。经过三个月的开发和测试，6 月底这一工作终于完成。

最新版本不光解决了 WebSocket 模块的稳定性问题，在库体积、内存占用以及功耗上我们也做了很多优化，请大家尽快升级到最新版本。

## 2020-05

### 存储服务对第三方登录数据支持自动建唯一索引

开发者在使用内建的账户系统（AVUser）时，对于第三方登录使用的授权数据（authData），为了保证登录唯一性，长期以来需要手动来为目标平台创建唯一索引。从现在开始，我们后端系统上线了对第三方授权数据自动、按需建立唯一索引的功能，相信这样可以进一步降低操作复杂度，给开发者带来更大便利。大家可以在应用控制台确认该索引的有效性。

### JavaScript SDK 增加对支付宝、百度、头条小程序的支持

截止目前 JavaScript SDK 适用的平台列表如下图所示：

 ![JavaScript_SDK_platform](images/JavaScript_SDK_platform.jpeg)

感兴趣的开发者可以参考[JavaScript SDK 安装指南](sdk_setup-js.html)进行接入，我们会尽力协助大家将自己的产品拓展到更广泛的平台。

C# SDK 增加排行榜和 LiveQuery 功能支持
本月 C# SDK 升级到了 0.4.4 版本，增加了对排行榜和 LiveQuery 的支持，感兴趣的开发者可以参考这里的 [demo](https://github.com/leancloud/CSharp-SDK-Unity-Demo) 来为自己的产品增加更多有趣的功能。

最后，如果您碰到其他使用不便的地方，非常欢迎随时给我们建议或反馈，我们会对提出建议的小伙伴赠送一些小礼品以示感谢。

## 2020-04

### 存储服务 Flutter SDK 开发指南上线

前两月我们相继发布了存储服务和即时通讯服务的 Flutter SDK，四月份我们发布了完整的[存储 Flutter SDK 开发指南](leanstorage_guide-flutter.html)，希望给 Flutter 开发者带来更好的体验，欢迎大家来找茬。

### 云引擎控制台改版进展：焕然一新的部署和设置面板

在四月份，我们将云引擎控制台的改版又往前推进了一小步——云引擎的部署和设置面板已经全面更新，欢迎大家尝鲜，并给我们更多的使用反馈。

### 分厂商的混合推送 library 发布

安卓混合推送功能上线之初，我们提供了一个 all-in-one 的 library（cn.leancloud/mixpush-android），同时支持了华为、小米、Oppo、vivo 和魅族推送。后来陆续有开发者给我们反馈，因为产品层面只要求接入部分厂商通道，所以希望我们提供尽可能小的混合推送 library。

本月，我们额外提供了单一厂商的推送 library，以支持类似的需求。两组 library 的使用方法基本相同，开发者可以根据自己的需要选取合适的 library，具体可以参看 [文档](android_mixpush_guide.html)。

## 2020-03

### 存储和即时通讯 Flutter SDK 全新发布

二月我们发布了存储服务的 Flutter SDK，本月即时通讯服务的 Flutter SDK（beta 版）也正式与大家见面。为了更好利用 OS 层的能力，新 Flutter SDK 以插件（Plugin）的形式开发，底层依赖原生的 [Swift SDK](https://github.com/leancloud/swift-sdk) 和 [Java Unified SDK](https://github.com/leancloud/java-unified-sdk)，且大部分接口的名称与 Native SDK 保持了一致。

当前版本已经支持如下功能：

* 单聊、群聊、富媒体消息、自定义消息类型；
* 自定义会话属性、会话查询、聊天记录查询；
* 聊天室、临时会话、系统会话等不同对话类型；
* 消息的修改与撤回、消息回执、成员提醒、暂态消息、遗愿消息；
* 消息免打扰、未读消息数更新通知；
* 多端登录与单设备登录；
* 登录以及会话的安全签名，等等。
* 另外，我们也提供了简要的 [安装使用文档](https://github.com/leancloud/Realtime-SDK-Flutter#usage) 以及详细的 [API 文档](https://pub.dev/documentation/leancloud_official_plugin/latest/leancloud_plugin/leancloud_plugin-library.html) 供开发者参考。

### 安卓混合推送全面升级

三月份我们全面升级了混合推送的第三方依赖，以修复底层库的 bug，和支持厂商的新功能与接口。最新版本混合推送的底层依赖如下：

* 华为：'4.0.2.300'
* 小米：'3.7.5'
* Oppo：'2.0.2'
* Vivo：'2.9.0.0'

我们同时也更新了文档和 demo，欢迎大家尽快升级体验。

### 文档的新变化

[REST API 文档](https://docs.leancloud.app/index.html#REST-API)的国际化基本完成，除了常用的存储、云引擎、即时通讯功能之外，我们还加入了搜索和短信的文档内容，相信能给英文环境的开发者带来更便捷的体验。


## 2020-02

### 云引擎改版基本完成

在过去的这个春节里，我们对云引擎的控制台做了一个改版，希望可以给开发者带来更好的使用体验。新版本的主要变化有：

- 简化了对计算资源的管理，开发者可以按组设置所有实例的规格和数量，而不必对每个实例去修改和设置，这也会对水平扩容的操作变得更加友好。
- 调整了云引擎实例的规格列表，取消了用处不大的 256MB 内存规格，新增了部分用户需要的 4096MB 内存规格，还将所有标准版实例的 CPU 资源改为了「单核心」，可以让 Node.js 程序运行更简单。
- 我们还调整了国际版的价格，将新规格的价格下调了 20%。

这些改动都只对新近调整之后的实例有效，也就是说老的实例如果不手动调整的话，还是按照老的方式来运行和计费。详细信息可以参考博客说明：[云引擎资源管理页面更新以及价格调整](https://leancloudblog.com/2020-leanengine-new-resources-view/)。

 

### 存储服务 Flutter SDK 发布

春节前不少开发者向我们提出了支持 Flutter 的需求，经过讨论后我们将 Flutter SDK 的开发排上了日程，目前存储服务的 SDK 第一版已经完成，[代码](https://github.com/leancloud/Storage-SDK-Flutter)全部开源且已经发布到了官方仓库（版本 0.1.4 ），欢迎大家试用并给我们更多反馈（可参看 [API 文档](https://pub.dev/documentation/leancloud_storage/latest/leancloud_storage/leancloud_storage-library.html)）；即时通讯服务的 SDK 也基本就绪，在准备好文档和 Demo 之后就会公开发布，敬请期待。

## 2020-01

### Android SDK 支持不使用 appKey 的初始化方式，避免安全风险

对于开发者担心的 android app 在客户端暴露 appId 和 appKey 可能带来的潜在风险，我们在新版本 SDK 中进行了优化，增加了一种更「安全」的使用方式：允许应用程序只通过 appId 来完成 LeanCloud 服务初始化，从而避免了暴露应用核心配置信息的风险。

具体的使用方式请参考开发指南：[Android SDK 更安全的接入和初始化方式](sdk_setup_android_securely.html)，欢迎大家升级到新版本 SDK，并给我们更多建议和反馈。

### 最佳实践：即时通讯客户端在线状态查询的解决方案

在即时通讯产品中展示用户在线状态是一个常见需求，例如聊天好友是否在线、公司办公交流时同事是否在线、以及群成员是否在线等等，其应用场景十分广泛。

LeanCloud 即时通讯服务支持 [客户端上下线 Hook ](realtime-guide-systemconv.html)通知，开发者可以结合此 Hook 函数与云缓存机制，在云引擎中非常快速地完成客户端实时状态的记录与查询，详细方案可参考文档：[即时通讯中的在线状态查询](realtime-guide-onoff-status.html)。



### 国际短信价格调整

由于短信通道成本的变动，年前 12 月份我们调整了国际短信价格。您可以访问 [如下页面](sms-guide.html) 查看最新列表，这一调整无需开发者进行任何操作，发送国际短信时我们后端会自动应用新价格，请您留意近期的账单变化，如有疑惑可随时联系我们，感谢您的使用。
