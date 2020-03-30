{% import "views/_data.njk" as data %}
{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

# 产品动态

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
