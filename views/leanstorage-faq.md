{% import "views/_data.njk" as data %}
{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

## 数据存储常见问题

### API 调用次数有什么限制吗

开发版提供每天三万次的免费额度。
推送服务免费使用，并不占用免费额度，推送消息接口的调用受频率限制，具体参考：[推送消息接口的限制](push_guide.html#推送消息接口) 文档。

默认情况下，商用版应用同一时刻最多可使用的工作线程数为 60，即同一时刻最多可以同时处理 60 个数据请求。**我们会根据应用运行状况以及运维需要调整改值**。如果需要提高这一上限，请 [提交工单](https://leanticket.cn/t/leancloud) 进行申请。

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

进入 [控制台 > 存储 > 统计 > API 访问日志](/dashboard/storage.html?appid={{appid}}#/storage/stat/accesslog)，开启日志服务，稍后刷新页面，就可以看到从开启到当前时间产生的日志了。

### 其他语言调用 REST API 如何对参数进行编码

REST API 文档使用 curl 作为示范，其中 `--data-urlencode` 表示要对参数进行 URL encode 编码。如果是 GET 请求，直接将经过 URL encode 的参数通过 `&` 连接起来，放到 URL 的问号后。如 `https://{{host}}/1.1/login?username=xxxx&password=xxxxx`。

### 如何实现大小写不敏感的查询

目前不提供直接支持，可采用正则表达式查询的办法，具体参考 [StackOverflow - MongoDB: Is it possible to make a case-insensitive query](http://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query)。

使用各平台 SDK 的 AVQuery 对象提供的 `matchesRegex` 方法（Android SDK 用 `whereMatches` 方法）。

### 应用内用户的密码需要加密吗

不需要加密密码，我们的服务端已使用随机生成的 salt，自动对密码做了加密。 如果用户忘记了密码，可以调用 `requestResetPassword` 方法（具体查看 SDK 的 AVUser 用法），向用户注册的邮箱发送邮件，用户以此可自行重设密码。 在整个过程中，密码都不会有明文保存的问题，密码也不会在客户端保存，只是会保存 sessionToken 来标示用户的登录状态。

### 查询最多能返回多少结果？

- 查询最多返回 1000 条数据。
- 返回的查询结果不止一个时，总大小不超过 6 MB；返回一个查询结果时，大小不超过 16 MB。

### 查询结果最多只能返回 1000 条数据，当我需要的数据量超过了 1000 该怎么办？
可以通过每次变更查询条件，来继续从上一次的断点获取新的结果，譬如：
* 第一次查询，createdAt 时间在 2015-12-01 00:00:00 之后的 1000 条数据（最后一条的 createdAt 值是 x）；
* 第二次查询，createdAt 在 x 之后的 1000 条数据（最后一条的 createdAt 是 y）；
* 第三次查询，createdAt 在 y 之后的 1000 条数据（最后一条是 z）；

以此类推。

{{ data.innerQueryLimitation(heading="### 使用 CQL 子查询时查不到记录或查到的记录不全") }}

### 可以通过指定 objectId 范围来实现分页吗？

当前 LeanCloud 系统自动生成 `objectId` 的算法是基于时间的，因此确实可以通过指定 `objectId` 范围来实现分页。
但是，从代码可读性及严谨性出发（比如导入数据时可以指定不同格式的 objectId），推荐通过指定 `createdAt` 范围来实现分页。

### 当数据量越来越来大时，怎么加快查询速度？
与使用传统的数据库一样，查询优化主要靠索引实现。索引就像字典里的目录，能帮助你在海量的文字中更快速地查词。目前索引提供 3 种排序方案：正序、倒序和 2dsphere。

前面两种很好理解，就是按大小或者英文字母的顺序来排列。场景比如，你的某一张表记录着许多商品，其中一个字段是商品价格。以该字段建好索引后，可以加快在查询时，相对应的正序或者倒序数据的返回速度。第三种，是适用于地理位置经纬度的数据（控制台上的 GeoPoint 型字段）。移动场景中的常见需求都可能会用到地理位置，比如查找附近的其他用户。这时候就可以利用 2dsphere 来加快查询。

原则：数据量少时，不建索引。多的时候请记住，因为索引也占空间，以此来换取更少的查询时间。针对每张表的情况，写少读多就多建索引，写多读少就少建索引。

操作：进入 {% if node=='qcloud' %}**控制台 > 存储**{% else %}[控制台 > 存储](/dashboard/data.html?appid={{appid}}#/_File){% endif %}，选定一张表之后，点击右侧的 **其他**下拉菜单，然后选择 **索引**，然后根据你的查询需要建立好索引。

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

这是默认值的限制。MongoDB 本身是不支持默认值，我们提供的默认值只是应用层面的增强，老数据如不存在相应的 key，设置默认值后并不会订正数据，只是在查询后做了展现层的优化。相应地，变更默认值后，这些 key 也会显示为新的默认值。有两种解决方案：

1. 对老的数据做一次更新，查询出 key 不存在（whereDoesNotExist）的记录，再更新回去。
2. 查询条件加上 or 查询，or key 不存在（whereDoesNotExist）。

### 如何解决数据一致性或事务需求？

LeanCloud 目前并不提供完整的事务功能，但提供了一些保证数据一致性的特性，可以解决大部分的一致性需求：

- 在单个对象的一次 save 操作中，对多个字段的更新操作是原子地完成的。
- 使用 [increment](leanstorage_guide-js.html#更新计数器)（原子计数器）可以原子地更新数字字段。
- [唯一索引](dashboard_guide.html#给某个_Class_数据建索引) 可以保证在一个字段上有同样值的对象只有一个。
- [有条件更新对象](leanstorage_guide-js.html#有条件更新对象) 可以仅在满足某个查询条件时进行更新操作；在这个特性的基础上，你可以自己实现更加复杂的 [两阶段提交](http://www.howardliu.cn/translation-perform-two-phase-commits-in-mongodb/)。
- 在云引擎上还可以借助 [LeanCache](leancache_guide.html) 来实现自定义的 [排他锁](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/redlock.js)。

关于这个话题我们还录制了一期公开课视频：[在 LeanCloud 上解决数据一致性问题](https://www.bilibili.com/video/av12823801/)，其中有对上面这些特性的详细介绍，和解决常见场景的实例教程（包括实现两阶段提交）。
### 文件存储有 CDN 加速吗？

{{ data.cdn() }}

### 文件存储有大小限制吗？

没有。除了在浏览器里通过 JavaScript SDK 上传文件，或者通过我们网站直接上传文件，有 10 MB 的大小限制之外，其他 SDK 都没有限制。 JavaScript SDK 在 Node.js 环境中也没有大小限制。

### 存储图片可以做缩略图等处理吗？

可以。默认我们的 `AVFile` 类提供了缩略图获取方法，可以参见各个 SDK 的开发指南。如果要自己处理，可以通过获取 `AVFile` 的 `URL` 属性。
{% if node!='qcloud' %}
使用 [七牛图片处理 API](https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2) 执行处理，例如添加水印、裁剪等。
{% endif %}

### iOS 项目打包后的大小

创建一个全新的空白项目，使用 CocoaPod 安装了 AVOSCloud 和 AVOSCloudIM 模块，此时项目大小超过了 80 MB。打包之后体积会不会缩小？大概会有多大呢？

LeanCloud iOS SDK 二进制中包含了 i386、armv7、arm64 等 5 个 CPU slices。发布过程中，non-ARM 的符号和没有参与连接的符号会被 strip 掉。因此，最终应用体积不会增加超过 10 MB，请放心使用。

### 地理位置查询错误

如果错误信息类似于 `can't find any special indices: 2d (needs index), 2dsphere (needs index), for 字段名`，就代表用于查询的字段没有建立 2D 索引，可以在 Class 管理的 **其他** 菜单里找到 **索引** 管理，点击进入，找到字段名称，选择并创建「2dsphere」索引类型。

![image](images/geopoint_faq.png)

### Java SDK 对 AVObject 对象使用 getDate("createdAt") 方法读取创建时间为什么会返回 null

请用 `AVObject` 的 `getCreatedAt` 方法；获取 `updatedAt` 用 `getUpdatedAt`。
这两个方法会返回 Date 类型。
如果希望返回字符串类型，可以使用 `getUpdatedAtString()` 和 `getCreatedAtString()`。

### Android 设备每次启动时，installationId 为什么总会改变？如何才能不改变？
可能有以下两种原因导致这种情况：
* SDK 版本过旧，installationId 的生成逻辑在版本更迭中有修改。请更新至最新版本。
* 代码混淆引起的，注意在 proguard 文件中添加 [LeanCloud SDK 的混淆排除](faq.html#代码混淆怎么做)。

### Android 代码混淆怎么做
为了保证 SDK 在代码混淆后能正常运作，需要保证部分类和第三方库不被混淆，参考下列配置：

```
# proguard.cfg

-keepattributes Signature
-dontwarn com.jcraft.jzlib.**
-keep class com.jcraft.jzlib.**  { *;}

-dontwarn sun.misc.**
-keep class sun.misc.** { *;}

-dontwarn com.alibaba.fastjson.**
-keep class com.alibaba.fastjson.** { *;}

-dontwarn org.ligboy.retrofit2.**
-keep class org.ligboy.retrofit2.** { *;}

-dontwarn io.reactivex.rxjava2.**
-keep class io.reactivex.rxjava2.** { *;}

-dontwarn sun.security.**
-keep class sun.security.** { *; }

-dontwarn com.google.**
-keep class com.google.** { *;}

-dontwarn com.avos.**
-keep class com.avos.** { *;}

-dontwarn cn.leancloud.**
-keep class cn.leancloud.** { *;}

-keep public class android.net.http.SslError
-keep public class android.webkit.WebViewClient

-dontwarn android.webkit.WebView
-dontwarn android.net.http.SslError
-dontwarn android.webkit.WebViewClient

-dontwarn android.support.**

-dontwarn org.apache.**
-keep class org.apache.** { *;}

-dontwarn org.jivesoftware.smack.**
-keep class org.jivesoftware.smack.** { *;}

-dontwarn com.loopj.**
-keep class com.loopj.** { *;}

-dontwarn com.squareup.okhttp.**
-keep class com.squareup.okhttp.** { *;}
-keep interface com.squareup.okhttp.** { *; }

-dontwarn okio.**

-dontwarn org.xbill.**
-keep class org.xbill.** { *;}

-keepattributes *Annotation*

```

### Java SDK 出现 already has one request sending 错误是什么原因

日志中出现了 `com.avos.avoscloud.AVException: already has one request sending` 的错误信息，这说明存在对同一个 `AVObject` 实例对象同时进行了 2 次异步的 `save` 操作。为防止数据错乱，LeanCloud SDK 对于这种同一数据的并发写入做了限制，所以抛出了这个异常。

需要检查代码，通过打印 log 和断点的方式来定位究竟是由哪一行 `save` 所引发的。

### JavaScript SDK 有没有同步 API

JavaScript SDK 由于平台的特殊性（运行在单线程运行的浏览器或者 Node.js 环境中），不提供同步 API，所有需要网络交互的 API 都需要以 callback 的形式调用。我们提供了 [Promise 模式](leanstorage_guide-js.html#Promise) 来减少 callback 嵌套过多的问题。

### JavaScript SDK 在 AV.init 中用了 Master Key，但发出去的 AJAX 请求返回 206
目前 JavaScript SDK 在浏览器（而不是 Node）中工作时，是不会发送 Master Key 的，因为我们不鼓励在浏览器中使用 Master Key，Master Key 代表着对数据的最高权限，只应当在后端程序中使用。

如果你的应用的确是内部应用（做好了相关的安全措施，外部访问不到），可以在 `AV.init`之后增加下面的代码来让 JavaScript SDK 发送 Master Key：
```
AV.Cloud.useMasterKey(true);
```

### JavaScript SDK 会暴露 App Key 和 App Id，怎么保证安全性？
首先请阅读「[安全总览](data_security.html)」来了解 LeanCloud 完整的安全体系。其中提到，可以使用「[安全域名](data_security.html#Web_应用安全设置) 」，在没有域名的情况下，可以使用「[ACL](acl-guide.html)」。
理论上所有客户端都是不可信任的，所以需要在服务端对安全性进行设计。如果需要高级安全，可以使用 ACL 方式来管理，如果需要更高级的自定义方式，可以使用 [LeanEngine（云引擎）](leanengine_overview.html)。