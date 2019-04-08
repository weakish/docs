# 使用功能提示

## 存储

* 如果需要对 class 数据进行全文搜索，同时根据文本相关性排序，请使用 [应用内搜索功能](app_search_guide.html)。
* 添加列的时候可以设置必选、默认值、隐藏等属性。
* 列名旁边的下拉框，可以删除、重命名和编辑列属性。
* 在不同应用之间可以共享 class 数据，例如共享 _User 表实现单点登录，参考 [应用间数据共享文档](app_data_share.html)。
* 数据菜单左下角有 **数据导入** 菜单，可以导入符合我们 [预先定义格式](dashboard_guide.html#本地数据导入_LeanCloud) 的遗留系统的数据到 LeanCloud 平台。
* 查询的时候如果想将关联 Pointer 类型带入查询结果，请使用 AV.Query 的 `includeKey` 方法指定字段名称。
* 查询可以指定 skip 和 limit 做分页查询。
* 你可以使用类似 SQL 的语法来查询 LeanCloud 数据，参考 [CQL 详细指南](cql_guide.html)。
* 你可以在 [错误码详解](error_code.html) 文档里找到所有的错误代码和信息解释。
* 你可以使用 [API 在线测试工具](/dashboard/apionline/index.html) 在线测试我们提供的开放 [REST API](rest_api.html)。
* 我们的用户账户系统都自动做了密码加密存储，基于 SHA-512 加密算法，使用随机生成的 salt 加密。
{% if node != 'qcloud' and node != 'us' %}
* 我们提供短信服务，你可以使用短息服务发送手机验证码、手机登录验证码等。具体参考各 SDK 开发指南。
{% endif %}
* 我们提供了 iOS、Android、Windows Phone、JavaScript、Unity3D 等平台的 SDK，进入 [SDK 下载页面](sdk_down.html)。
{% if node != 'qcloud' %}
* 如果你想做一个形如微博的 Feed 系统，也许你可以尝试使用我们的 [事件流系统](status_system.html)。
* 我们提供简易的 [第三方登录组件](leanstorage_guide-js.html#第三方账户登录)。
{% endif %}
* [Android 应用代码混淆注意事项](android_faq.html#代码混淆怎么做)
* [基于 LeanCloud 的一对多、多对多关系数据建模](https://blog.leancloud.cn/1723/)
* [使用 LeanCloud JavaScript SDK 和 AngularJS 创建 一个 Todo Demo](https://blog.leancloud.cn/1541/)
* 我们的数据存储服务提供地理位置信息查询，参考 SDK 开发指南，或者博文教程[《GEO Point 的使用》](https://blog.leancloud.cn/537/)。
* 在应用设置菜单里，可以找到 **数据导出** 功能，你可以完整导出应用的数据。
* 你可以在某个 class 的其他菜单里找到权限设置、Class 绑定等高级功能。
* 在应用设置的 **邮件模板** 菜单，你可以编辑并保存发送给注册用户的邮箱验证邮件模板等。
* 适当使用 [查询缓存](leanstorage_guide-objc.html#缓存查询) 功能，可以提升查询性能，并提供离线浏览。
* 实现应用 DeepLink，参考 [应用内搜索和 DeepLink 开发指南](app_search_guide.html)。
* 想实现先验证手机号码再注册，可以用 `requestSMSCode`、`verifySMSCodeInBackground` 得到一个正确的手机号码再进行 `new AVUser()` 的注册。


## 文件

* 你可以在数据管理平台的 _File 表的 **url** 列点击上传按钮，直接上传文件。
* 文件 API 提供元数据存储和缩略图功能，请参考 SDK 开发指南。
{% if node!='qcloud' %}
更多缩略图选项可以使用 [七牛 API](https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2) 做 URL 转换得到。
{% endif %}
* 文件如果存储为其他对象的数组属性，那么需要在 query 或者 fetch 的时候 `includeKey` 该字段。
* [命令行工具](leanengine_cli.html) 提供文件批量上传命令 upload，可以用于上传现有资源文件到 LeanCloud 平台。
* 文件没有大小限制，文件在 SDK 下载成功后将自动缓存在本地。

## 即时通讯

* 即时通讯功能可以帮助你实现用户间聊天等实时应用。
* 你可以使用我们的 [JavaScript Chat SDK](sdk_down.html) 编写 Node.js 服务器端程序，实现自动回复、机器人等功能。
* 你可以通过 REST API 获得整个应用内所有的聊天记录。
* iOS 用户将应用切换至后台时，新的消息将触发推送提醒用户，你可以在 **应用设置的推送菜单** 里自定义这条推送，支持 JSON 格式。
* Android 即时通讯客户端和推送共享连接，所以 Android 用户是后台永久在线的。
* 我们的 SDK 会自动处理重连、网络环境变化等状况，你只需在编程时响应 Session Paused / Resumed 事件即可。
* 你可以利用我们的文件存储 API 上传音频、视频等多媒体文件到 CDN，然后发送 URL，并在 UI 上合理展现来丰富你的聊天应用。
* 即时通讯中，收到消息的时间戳是服务器端的 UTC 时间戳。
* 即时通讯中，`Session.close` 仅在用户注销登录时调用，否则会导致用户无法收到消息。
* 对在线 500 人以上的应用，我们提供数据异常报警服务，当你每小时的线用户数、消息数有较大变化时，你会收到我们的提醒邮件。

## 推送

* 我们提供 iOS、Android 和 Windows Phone 平台的消息推送服务，请参考各 SDK 开发指南和 [消息推送开发指南](push_guide.html)。
* 你可以为 AVInstallation 添加自定义的业务属性，也可以使用频道订阅功能，来实现各种复杂推送。
* iOS 推送必须在应用设置的 **推送设置** 里上传推送证书，证书生成参考 [iOS 推送证书设置指南](ios_push_cert.html)。
* 可以通过 AVAnalytics 的 `trackAppOpened` 方法跟踪推送消息的应用打开情况。
* 如果你的 app 处于运行状态，iOS 系统将不会在系统的通知中心显示推送消息，你可以使用 UILocalNotification 展示一个通知给用户。
* Android 可以通过 [自定义 Receiver](push_guide.html#消息内容_Data) 来自定义消息推送接收逻辑。
* AVPush 可以设置 AVQuery 条件，查询符合条件的 AVInstallation 设备推送消息。
* LeanCloud 支持定时推送，你可以通过云引擎定时任务做更复杂的定时推送。

## 安全

* 通过合理的设置 ACL，可以安全地保护你的数据，详情参考各 SDK 开发指南。
* 在数据管理平台，选择 class 后，进入其他菜单，可以设置 Class 权限，保护你的数据。
* 在应用设置的安全中心和各服务对应的设置菜单里，提供多种选项来保护你的应用。
* 请不要泄露你的账号或者应用信息给他人，[定期更新账户密码](https://leancloud.cn/settings.html#/setting/password) 是一个好习惯。
* 在应用设置的协作者菜单里，可以添加应用协作者，协作者将拥有该应用的绝大部分权限，因此请慎重添加。
{% if node!='qcloud' %}
* **请在 [开发者信息](/dashboard/settings.html#/setting/info) 填写更加详细的联系信息**，方便我们在紧急情况下联系你。
* 马上创建一个 [团队](/dashboard/settings.html#/setting/team)，协作开发应用。团队可以作为应用的协作者添加。
{% endif %}

## 云引擎

* 云引擎提供 [命令行工具](leanengine_cli.html)，方便部署、发布、调试云引擎项目。
* 云引擎支持一份代码部署多个应用，只要使用相同的 git 仓库即可。另外 [命令行工具](leanengine_cli.html#多应用管理) 提供强力支持。
* 云引擎菜单提供统计功能，查看你的云引擎项目调用状况。
* 云引擎提供 [定时任务](leanengine_cloudfunction_guide-node.html#定时任务)，特定的时刻，做特定的事情。
* 云引擎提供 [HTTP 客户端](leanengine_webhosting_guide-node.html#发送_HTTP_请求)，抓取第三方数据。
* 通过定义 [before 或者 after 函数](leanengine_cloudfunction_guide-node.html#beforeSave)，在 AVObject 存储前后加入校验等额外逻辑。
* 避免对象循环引用，将循环关系作为第三个对象存储。
* 想建立一个应用网站？我们提供 [网站托管](leanengine_webhosting_guide-node.html)。
* 想用好云引擎，请先熟悉 [JavaScript SDK 开发指南](leanstorage_guide-js.html)。
{% if node != 'qcloud' %}
* 云引擎 Web 主机托管，可以绑定备案过的独立域名，请在 [工单系统](https://leanticket.cn/t/leancloud) 提出技术申请。
* 云引擎 Web 主机托管，我们可以协助你完成域名的备案，请在 [应用控制台 > 账户设置 > 域名备案](/dashboard/settings.html#/setting/domainrecord) 操作。
{% endif %}

## 其他
{% if node !='qcloud' %}
* [邀请朋友](/dashboard/settings.html#/setting/invite) 注册 LeanCloud，获取赠送金额。
* 修改登录邮箱，请进入 [邮箱](/dashboard/settings.html#/setting/mail) 菜单。
* 为你的应用添加用户反馈，请使用我们的 [用户反馈组件](feedback.html)。
{% endif %}
* 查看 [SDK 安装文档](start.html)，开始应用开发之旅。
* 通过 [工单系统](https://leanticket.cn/t/leancloud) 提交技术支持申请，获取 LeanCloud 工程师的帮助。
* 在右上角用户名左侧的消息中心，可以看到 LeanCloud 最火热的新闻和教程。
* 在工具栏的资源菜单里，可以找到 LeanCloud 移动客户端下载链接，在移动设备上查看应用分析数据。
* 使用 [fir.im](http://fir.im/) 分发测试你的应用。
* 不知道怎么使用 LeanCloud？各种 [Demo](demo.html) 等你来拿。
* 所有 SDK 都提供 [API 文档](index.html)，开发指南没有覆盖的 API 介绍都可以在里面找到解释。
* 关注我们的 [博客](https://blog.leancloud.cn/) 和 [微博](http://weibo.com/avoscloud)，获取 LeanCloud 最新消息。
* 在应用设置的基本设置菜单里，可以更改应用名称，提交应用图标，申请发布到 [应用墙](https://leancloud.cn/customers.html)。
