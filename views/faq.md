{% import "views/_data.njk" as data %}
{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
# 常见问题一览

## 账户和平台常见问题

### LeanCloud 部署在哪个云平台上

LeanCloud 部署在国内多个云计算平台上，并采用在双线机房内同时使用虚拟机和实体机的混合部署策略，来保证应用的访问体验和可靠性。

{% if node!='qcloud' %}
### 获取客服支持有哪些途径

* 到免费的[用户社区](https://forum.leancloud.cn/) 进行提问。
* 购买 [技术支持](/bill.html#/bill/general)，进入 [工单系统](https://leanticket.cn/t/leancloud) 来提交问题。
* 发送邮件到 {{ include.supportEmail() }} 获取帮助。
* 紧急情况拨打客服电话：+86-13146446722。

### 计费是基于账号还是应用

计费都基于用户账号，详细信息请参考 [价格](/pricing) 页面。

### 如果没有缴费会怎么样

账户余额小于 0 时，账户服务将被停止，即云端会拒绝所有的请求，因此应用的统计数据也无法生成；应用数据被置于不可见模式，但仍会在 LeanCloud 云端保留 30 天。如需要恢复服务和访问应用数据，请登录控制台充值。

{{ docs.alert("欠费超过 30 天，应用内的数据（包括文件）会被删除且无法恢复。") }}

你可以在控制台设置 [告警余额](/dashboard/settings.html#/setting/alert)，当账户余额小于设置的值时，我们会发送短信、邮件通知。请开发者务必关注账户的余额情况，以免对业务造成影响。

### 欠费期间应用产生的数据和请求能否找回

不能。因为欠费时应用处于禁用阶段，所有的请求都会被云端丢弃，与统计相关的数据也不会生成，所以当应用服务恢复后也无法找回这一期间的数据。为避免统计数据出现断档，请在控制台中设置 [告警余额](/dashboard/settings.html#/setting/alert)，及时充值，保证服务的持续。

### 如何付费

* 支付宝充值

  进入 [控制台 > 财务 > 账务概况](/bill.html#/bill/general)，点击「充值」或「购买」按钮时将会出现「支付宝充值」窗口。 我们将每天自动从您的账户余额里扣除前一日的费用。每次扣费优先使用充值金额，其次是赠送金额。

* 对公账户汇款

  公司税号：**110108597742364**<br/>
  公司名称：**美味书签（北京）信息技术有限公司**<br/>
  开户银行：**中国银行股份有限公司北京大运村支行**<br/>
  银行账号：**344159259324**<br/>
  银行地址：**北京市海淀区知春路 6 号锦秋国际大厦一层**<br/>
  银行行号：**104100004013**

  <div class="callout callout-danger">请务必在汇款附言里中注明以下信息，以便我们账务确认汇款的来源和用途，及时入账。
  <ol>
  <li>如果充值到美国节点，需注明「美国节点」。</li>
  <li>您的 LeanCloud 用户名</li>
  <li>（或）注册邮箱</li>
  <li>（或）您的应用名称</li>
  </ol>
  </div>

### 如何申请开具发票

* 申请开发票前，请先按系统要求，完善所有必填的用户信息。

* 无论采取哪一种付款方式，只有当累计支付金额达到人民币 **1,000** 后系统才允许申请，单笔开票金额不低于人民币**壹仟元**。

* 如有特别需求，如按月度账单金额结算，或先开发票后付款，请联系我们的市场部专员 {{ include.generalEmail() }}，QQ 号：2607695496。

* 开具发票时段为每月 10 日至 30 日，发票以快递寄送。如需开具增值税专用发票，也请联系我们的市场部专员。

* 发票免费邮寄。


### 哪里获取平台的更新信息

通常情况下，我们新版本的更新周期为一到两周。获取更新信息可以通过：

* [官方博客](http://blog.leancloud.cn/)（每次更新的详细信息都会发布在那里）
* [官方微博](http://weibo.com/avoscloud)
* 官方微信公众号：LeanCloud
* 每月初，我们会将每月的更新摘要发送到您的注册邮箱。
* 在控制台页面的右上方有 [消息中心](/info-center.html#/index)，请注意查看新通知。
{% endif %}

### API 开放吗

我们的 API 完全开放。我们提供的 SDK 也都是基于开放 API 实现的。详情请阅读 [REST API 详解](/docs/rest_api.html)。

### 提供哪些平台的 SDK

目前官方提供的 SDK 种类包括：

* Objective-C
* Swift
* Android
* Java
* JavaScript
* Python
* PHP
* Windows Phone
* Unity

部分 SDK 已开源，详情请访问 [SDK 下载](/docs/sdk_down.html) 页面。

### iOS 和 Android 是否可以使用同一个 App

当然可以。使用我们的 SDK，可以为同一个应用开发多个平台的版本，共享后端数据。

### 支持 Unity 3D 吗

支持。请到 [SDK 下载](sdk_down.html) 页面下载 Unity SDK。

### 开发文档有提供搜索功能吗

 **官网文档** 首页右上角就有搜索框，也可以直接访问 [搜索](/search.html) 页面。

## API 相关

### API 调用次数有什么限制吗

我们每个月提供 100 万次的免费额度，超过的部分才收费。推送服务和统计服务免费使用，并不占用免费额度。

默认情况下，每个应用同一时刻最多可使用的工作线程数为 30，即同一时刻最多可以同时处理 30 个数据请求。**我们会根据应用运行状况以及运维需要调整改值**。如果需要提高这一上限，请写信至 {{ include.supportEmail() }} 进行申请。

### API 调用次数的计算

对于数据存储来说，每次 `create` 和 `update` 一个对象的数据算 1 次请求，如调用 1 次 `object.saveInBackground` 算 1 次 API 请求。在 API 调用失败的情况下，如果是由于 [应用流控超限（错误码 429）](error_code.html#_429) 而被云端拒绝，则**不会**算成 1 次请求；如果是其他原因，例如 [权限不够（错误码 430）](error_code.html#_403)，那么仍会算为 1 次请求。

**一次请求**<br/>
- `create`
- `save`
- `fetch`
- `find`
- `delete`
- `deleteAll`

调用一次 `fetch` 或 `find` 通过 `include` 返回了 100 个关联对象，算 1 次 API 请求。调用一次 `find` 或 `deleteAll` 来查找或删除 500 条记录，只算 1 次 API 请求。

**多次请求**<br/>
- `saveAll`
- `fetchAll`

调用一次 `saveAll` 或 `fetchAll` 来保存或获取 array 里面 100 个 对象，算 100 次 API 请求。

{% if node != 'qcloud' %}
对于 [应用内社交](status_system.html)，`create` 和 `update` 按照 Status 和 Follower/Followee 的对象数量来计费。
{% endif %}

对于 query 则是按照请求数来计费，与结果的大小无关。`query.count` 算 1 次 API 请求。collection fetch 也是按照请求次数来计费。

### 如何获取 API 的访问日志

进入 [控制台 > 存储 > 统计 > API 访问日志](/dashboard/storage.html?appid={{appid}}#/storage/stat/accesslog)，开启日志服务，稍后刷新页面，就可以看到从开启到当前时间产生的日志了。查看

### 可以在线测试 API 吗

请访问 [API 在线测试工具](/dashboard/apionline/index.html)。

### Unauthorized 错误

应用 API 授权失败，请检查是否初始化了 App Id 和 App Key。

* 如何进行初始化，请查看 [SDK 安装指南](start.html)。
* App Id 和 App Key 在应用的 **设置** 菜单里可以找到。

### 错误信息代码和详细解释在哪里

* [错误代码详解](./error_code.html)
* iOS SDK：[AVConstants](/api-docs/iOS/docs/AVConstants.html)
* Android SDK：[AVException](/api-docs/android/index.html)

REST API 返回的错误信息跟 SDK 保持一致。

### 其他语言调用 REST API 如何对参数进行编码

REST API 文档使用 curl 作为示范，其中 `--data-urlencode` 表示要对参数进行 URL encode 编码。如果是 GET 请求，直接将经过 URL encode 的参数通过 `&` 连接起来，放到 URL 的问号后。如 `https://{{host}}/1.1/login?username=xxxx&password=xxxxx`。

### 如何实现大小写不敏感的查询

目前不提供直接支持，可采用正则表达式查询的办法，具体参考 [StackOverflow - MongoDB: Is it possible to make a case-insensitive query](http://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query)。

使用各平台 SDK 的 AVQuery 对象提供的 `matchesRegex` 方法（Android SDK 用 `whereMatches` 方法）。

### 应用内用户的密码需要加密吗

不需要加密密码，我们的服务端已使用随机生成的 salt，自动对密码做了加密。 如果用户忘记了密码，可以调用 `requestResetPassword` 方法（具体查看 SDK 的 AVUser 用法），向用户注册的邮箱发送邮件，用户以此可自行重设密码。 在整个过程中，密码都不会有明文保存的问题，密码也不会在客户端保存，只是会保存 sessionToken 来标示用户的登录状态。

### 查询结果默认最多只能返回 1000 条数据，当我需要的数据量超过了 1000 该怎么办？
可以通过每次变更查询条件，来继续从上一次的断点获取新的结果，譬如：
* 第一次查询，createdAt 时间在 2015-12-01 00:00:00 之后的 1000 条数据（最后一条的 createdAt 值是 x）；
* 第二次查询，createdAt 在 x 之后的 1000 条数据（最后一条的 createdAt 是 y）；
* 第三次查询，createdAt 在 y 之后的 1000 条数据（最后一条是 z）；

以此类推。

{{ data.innerQueryLimitation(heading="### 使用 CQL 子查询时查不到记录或查到的记录不全") }}

### 当数据量越来越来大时，怎么加快查询速度？
与使用传统的数据库一样，查询优化主要靠索引实现。索引就像字典里的目录，能帮助你在海量的文字中更快速地查词。目前索引提供 3 种排序方案：正序、倒序和 2dsphere。

前面两种很好理解，就是按大小或者英文字母的顺序来排列。场景比如，你的某一张表记录着许多商品，其中一个字段是商品价格。以该字段建好索引后，可以加快在查询时，相对应的正序或者倒序数据的返回速度。第三种，是适用于地理位置经纬度的数据（控制台上的 GeoPoint 型字段）。移动场景中的常见需求都可能会用到地理位置，比如查找附近的其他用户。这时候就可以利用 2dsphere 来加快查询。

原则：数据量少时，不建索引。多的时候请记住，因为索引也占空间，以此来换取更少的查询时间。针对每张表的情况，写少读多就多建索引，写多读少就少建索引。

操作：进入 {% if node=='qcloud' %}**控制台 > 存储**{% else %}[控制台 > 存储](/data.html?appid={{appid}}#/_File){% endif %}，选定一张表之后，点击右侧的 **其他**下拉菜单，然后选择 **索引**，然后根据你的查询需要建立好索引。

提示：数据表的默认四个字段 `objectId`、`ACL`、`createdAt`、`updatedAt` 是自带索引的，但是在勾选时，可以作为联合索引来使用。

{{
  docs.note(
    data.limitationsOnCreatingClassIndex()
  )
}}

### LeanCloud 查询支持 `Sum`、`Group By`、`Distinct` 这种函数吗？
LeanCloud 数据存储的查询接口不支持这些函数，可以查询到客户端后，在客户端中自己写逻辑进行这些操作。

如果要进行数据分析，可以使用我们的「[离线数据分析](./leaninsight_guide.html)」功能。

### sessionToken 在什么情况下会失效？
如果在控制台的存储的设置中勾选了「密码修改后，强制客户端重新登录」，则用户修改密码后， sessionToken 会变更，需要重新登录。如果没有勾选这个选项，Token 就不会改变。当新建应用时，这个选项默认是被勾上的。

### 默认值的查询结果为什么不对

这是默认值的限制。MongoDB 本身是不支持默认值，我们提供的默认值只是应用层面的增强，对于老数据只是在查询后做了展现层的优化。有两种解决方案：

1. 对老的数据做一次更新，查询出 key 不存在（whereDoesNotExist）的记录，再更新回去。
2. 查询条件加上 or 查询，or key 不存在（whereDoesNotExist）。

### User 表中有 authData 数据，但是当前登录用户无法获取 authData 数据

{{ include.retrieveAuthData(node) }}

### 如何解决数据一致性或事务需求？

LeanCloud 目前并不提供完整的事务功能，但提供了一些保证数据一致性的特性，可以解决大部分的一致性需求：

- 在单个对象的一次 save 操作中，对多个字段的更新操作是原子地完成的。
- 使用 [increment](leanstorage_guide-js.html#更新计数器)（原子计数器）可以原子地更新数字字段。
- [唯一索引](dashboard_guide.html#给某个_Class_数据建索引) 可以保证在一个字段上有同样值的对象只有一个。
- [按条件更新对象](leanstorage_guide-js.html#按条件更新对象) 可以仅在满足某个查询条件时进行更新操作；在这个特性的基础上，你可以自己实现更加复杂的 [两阶段提交](http://www.howardliu.cn/translation-perform-two-phase-commits-in-mongodb/)。
- 在云引擎上还可以借助 [LeanCache](leancache_guide.html) 来实现自定义的 [排他锁](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/lean-cache/redlock.js)。

关于这个话题我们还录制了一期公开课视频：[在 LeanCloud 上解决数据一致性问题](https://www.bilibili.com/video/av12823801/)，其中有对上面这些特性的详细介绍，和解决常见场景的实例教程（包括实现两阶段提交）。

## 控制台相关

### 如何导入或者导出数据？

请参考《数据与安全》文档的 [导入数据](./dashboard_guide.html#本地数据导入_LeanCloud) 和 [导出数据](./dashboard_guide.html#云端数据导出到本地) 部分。


### 如何在 App 邮件内完全使用自己的品牌

请参考博文 [《自定义应用内用户重设密码和邮箱验证页面》](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

### 创建唯一索引失败

请确认想要创建索引的列没有已经存在的重复值。

### 如何上传文件

任何一个 Class 如果有 File 类型的列，就可以直接在 **数据** 管理平台中将文件上传到该列。如果没有，请自行创建列，类型指定为 File。

### 如何在应用之间共享数据

请参考我们的博客文章 [《2014 年 3 月第 4 周更新日志》](http://blog.leancloud.cn/blog/2014/03/31/2014nian-3yue-di-4zhou-avos-cloud-geng-xin/)。

## iOS/macOS SDK

### 安装 Cocopods 失败怎么解决

推荐使用淘宝提供的 Gem 源，访问 [https://ruby.taobao.org/](https://ruby.taobao.org/)。

```sh
$ gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
$ gem sources -l
*** CURRENT SOURCES ***

https://ruby.taobao.org
# 请确保只有 ruby.taobao.org
$ gem install cocoapods
```

由于淘宝已经停止基于 HTTP 协议的镜像服务，如果之前使用的是 [http://ruby.taobao.org/](http://ruby.taobao.org/)，这也可能导致安装 Cocopods 失败。

需要在配置中使用 HTTPS 协议代替：

```sh
$ gem sources --add https://ruby.taobao.org/ --remove http://ruby.taobao.org/
$ gem sources -l
*** CURRENT SOURCES ***

https://ruby.taobao.org
# 请确保只有 ruby.taobao.org
$ gem install cocoapods
```

### iOS 项目打包后的大小

创建一个全新的空白项目，使用 CocoaPod 安装了 AVOSCloud 和 AVOSCloudIM 模块，此时项目大小超过了 80 MB。打包之后体积会不会缩小？大概会有多大呢？

LeanCloud iOS SDK 二进制中包含了 i386、armv7、arm64 等 5 个 CPU slices。发布过程中，non-ARM 的符号和没有参与连接的符号会被 strip 掉。因此，最终应用体积不会增加超过 10 MB，请放心使用。

### 编译失败

#### Symbol(s) not found x86_64

请使用 32 位模拟器进行编译和调试.

#### Undefined symbols for architecture

一般是由于 Framework 的链接找不到造成的，建议用 CocoaPods 更新一下。没使用 CocoaPods 的项目可以删除对 Framework 的引用，然后再重新加进来。

LeanCloud 依赖的 Framework 包括：

* SystemConfiguration.framework
* MobileCoreServices.framework
* CoreTelephony.framework
* CoreLocation.framework

如果是 `for architecture arm64`，这是因为 Xcode 更新到 5.1 后，CocoaPods 没有及时更新对 64 位 CPU 的支持，解决方法参考 [《StackOverflow - Undefined symbols for architecture arm64》](http://stackoverflow.com/questions/19213782/undefined-symbols-for-architecture-arm64)

### 请求报错

请参考请求返回的错误码 [详细说明](error_code.html)。

### 地理位置查询错误

如果错误信息类似于 `can't find any special indices: 2d (needs index), 2dsphere (needs index), for 字段名`，就代表用于查询的字段没有建立 2D 索引，可以在 Class 管理的 **其他** 菜单里找到 **索引** 管理，点击进入，找到字段名称，选择并创建「2dsphere」索引类型。

![image](images/geopoint_faq.png)

### 如何先验证手机号码再注册

请参考 [存储开发指南 &middot; 手机号码登录](leanstorage_guide-objc.html#手机号码登录")。


## Android SDK

### 对 AVObject 对象使用 getDate("createdAt") 方法读取创建时间为什么会返回 null

请用 `AVObject` 的 `getCreatedAt` 方法；获取 `updatedAt` 用 `getUpdatedAt`。

### client.open() 操作为什么没有被调用？

请检查 AndroidManifest.xml 配置，确认 receiver 和 service 写在了 application 标签里，并且与 activity 平级。它们与 activity 同为四大组件之一，需要写在一起。

### Anroid 设备每次启动时，installationId 为什么总会改变？如何才能不改变？
可能有以下两种原因导致这种情况：
* SDK 版本过旧，installationId 的生成逻辑在版本更迭中有修改。请更新至最新版本。
* 代码混淆引起的，注意在 proguard 文件中添加 [LeanCloud SDK 的混淆排除](android_faq.html#代码混淆怎么做)。

### 如何先验证手机号码再注册

请参考 [存储开发指南 &middot; 手机号码登录](leanstorage_guide-android.html#手机号码登录")。

## JavaScript SDK

### 有没有同步 API

JavaScript SDK 由于平台的特殊性（运行在单线程运行的浏览器或者 Node.js 环境中），不提供同步 API，所有需要网络交互的 API 都需要以 callback 的形式调用。我们提供了 [Promise 模式](leanstorage_guide-js.html#Promise) 来减少 callback 嵌套过多的问题。

### 在 AV.init 中用了 Master Key，但发出去的 AJAX 请求返回 206
目前 JavaScript SDK 在浏览器（而不是 Node）中工作时，是不会发送 Master Key 的，因为我们不鼓励在浏览器中使用 Master Key，Master Key 代表着对数据的最高权限，只应当在后端程序中使用。

如果你的应用的确是内部应用（做好了相关的安全措施，外部访问不到），可以在 `AV.init`之后增加下面的代码来让 JavaScript SDK 发送 Master Key：
```
AV._config.useMasterKey = true;
```

### Web 端会暴露 App Key 和 App Id，怎么保证安全性？
首先请阅读「[安全总览](data_security.html)」来了解 LeanCloud 完整的安全体系。其中提到，可以使用「[安全域名](data_security.html#Web_应用安全设置) 」，在没有域名的情况下，可以使用「[ACL](acl-guide.html)」。
理论上所有客户端都是不可信任的，所以需要在服务端对安全性进行设计。如果需要高级安全，可以使用 ACL 方式来管理，如果需要更高级的自定义方式，可以使用 [LeanEngine（云引擎）](leanengine_overview.html)。

### 如何先验证手机号码再注册

请参考 [存储开发指南 &middot; 手机号码登录](leanstorage_guide-js.html#手机号码登录")。


## 消息推送

### 推送的到达率如何

关于到达率这个概念，业界并没没有统一的标准。我们测试过，在线用户消息的到达率基本达到 100%。我们的 SDK 做了心跳和重连等功能，尽量维持对推送服务器的长连接存活，提升消息到达用户手机的实时性和可靠性。

### 推送是基于 XMPP 还是其他协议

老版本推送基于 XMPP 协议，v2.4.1 版本开始，推送采用了 WebSocket 协议，方便支持多平台，包括将要推出的 Web 端消息推送功能。

### iOS 推送如何区分开发证书和生产证书

暂不提供在同一个 App 里同时上传开发证书和生产证书。推荐创建单独的测试 App，可以利用数据导出和导入来快速模拟生产环境。

### 有一些 iOS 设备收不到推送，到控制台查看推送记录，发现 invalidTokens的 数量大于0，是怎么回事？

invalidTokens 的数量由以下两部分组成：
* 选择的设备与选择的证书不匹配时，会增加 invalidTokens 的数量，例如使用开发证书给生产证书的设备推送。
* 目标设备移除或重装了对应的 App。

针对第一种情况，请检查 APNS 证书是否过期，并检查是否使用了正确的证书类型。

更多推送问题排查，请参考：
[推送问题排查](push_guide.html#推送问题排查)。


### Android 消息接收能不能自定义 Receiver 不弹出通知

可以。请参考 [消息推送开发指南](push_guide.html#消息内容_Data)。

如果要自定义 receiver，必须在消息的 data 里带上自定义的 action。LeanCloud 在接收到消息后，将广播 action 为您定义的值的 intent 事件，您的 receiver 里也必须带上 `intent-filter` 来捕获该 action 值的 intent 事件。

### Android 应用进程被杀掉后无法收到推送消息
iOS 能做到这点，是因为当应用进程关闭后，Apple 和设备的系统之间还会存在连接，这条连接跟应用无关，所以无论应用是否被杀掉，消息都能发送到 APNs 再通过这条连接发送到设备。 但对 Android 来说，如果是国内用户，因为众所周知的原因，Google 和设备之间的这条连接是无法使用的，所以应用只能自己去保持连接并在后台持续运行，一旦后台进程被杀掉，就无法收到推送消息了。

{% if node != 'qcloud' %}
LeanCloud 美国节点提供 [GCM 支持](android_push_guide.html#GCM_推送)，如果应用的服务对象主要是国外用户，可以通过 [GCM (Google Cloud Messaging)](https://developers.google.com/cloud-messaging/) 来克服上述问题。
{% endif %}

国内节点的应用依然很难避免这个问题，因为无法建立系统级别的长连接去收消息。不过 LeanCloud SDK 已经采取了各种办法保持应用在后台运行，能保证在大部分情况下都能收到消息。


## 统计

### 统计服务免费吗

统计服务完全免费，不占用每月的 API 免费额度。

### 统计服务支持哪些平台

目前支持

* iOS
* macOS
* Android

更多平台 SDK 正在开发中。

### 统计支持哪些发送策略

* 启动时发送（默认策略，推荐使用）
* 批量发送
* 按最小间隔发送

可以在 **分析** > **Android（或者 iOS）统计** > **统计设置** > **数据发送策略** 的菜单里实时修改这些策略。

## 文件

### 文件存储有 CDN 加速吗？

{{ data.cdn() }}

### 文件存储有大小限制吗？

没有。除了在浏览器里通过 JavaScript SDK 上传文件，或者通过我们网站直接上传文件，有 10 MB 的大小限制之外，其他 SDK 都没有限制。 JavaScript SDK 在 Node.js 环境中也没有大小限制。

### 存储图片可以做缩略图等处理吗？

可以。默认我们的 `AVFile` 类提供了缩略图获取方法，可以参见各个 SDK 的开发指南。如果要自己处理，可以通过获取 `AVFile` 的 `URL` 属性。
{% if node!='qcloud' %}
使用 [七牛图片处理 API](https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2) 执行处理，例如添加水印、裁剪等。
{% endif %}

{% if node != 'qcloud' and node != 'us' %}
## 短信
请参见 [短信收发常见问题一览](/docs/rest_sms_api.html#常见问题_FAQ)。
{% endif %}
