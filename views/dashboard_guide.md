{% import "views/_data.njk" as data %}

# 管理控制台使用指南

在 LeanCloud 平台创建好应用之后，如何查看后台数据，如何查看各服务的使用情况，如何更改应用设置，如何修改账户信息，等等问题，都不可避免要跟我们的「控制台」打交道了。

## 创建应用
对于刚开始接触 LeanCloud 的用户来说，看到的控制台多会是如下图所示的样子：

![firstlook](images/dash_firstlook.png)

在这里显示的内容和操作项简单明了，基本上大家一看就能够操作，例如：

- 我们通过`箭头 1` 指示的按钮，可以创建新的应用。
- 已经创建好的应用，则显示在`箭头 2` 指向的区域，包括一些最基本的统计数据也一并展示在了应用卡片中，之后点击这里蓝色的应用名链接，则可以进入单个应用的数据管理和设置页面。
- `箭头 3` 指向的是与开发者账户相关的操作链接。

<div class="callout callout-danger">每个账号最多可以创建 50 个应用。</div>

## 管理应用数据
我们在前面页面，在单个应用卡片中点击应用名链接，则可以进入应用数据和配置管理页面，如下图所示：

![app overview](images/dash_appoverview.png)

- 左上角显示应用名，通过下拉箭头可以快速切换应用或创建新应用。
- 左栏按照服务类型，将应用数据做了一级分类，包括存储（结构化数据存储、文件存储、离线数据分析），云引擎（网站托管、云函数、定时任务、LeanCache），消息（即时通讯、推送、短信），游戏（ClientEngine、实时对战、排行榜），组件（用户反馈、应用内搜索、社交），应用设置（基本信息、Key、服务开关、安全域名、邮件模板、协作管理、风险检测、操作日志、数据导出与恢复）。
- 一级分类下还有二级菜单，详情见以下章节。

我们重点看看一级菜单下的内容。

### 存储

**控制台 > {应用} > 存储** 服务下，包含了四大菜单：

- 「数据」：展示了结构化数据（`AVObject` 及扩展子类）和非结构化数据（`AVFile`）的内容，支持在页面上直接进行增删改查，对于少量的数据维护操作，可以在这里直接进行。
- 「统计」：这里展示了应用使用数据存储服务的一些统计信息，包括一段时间内存储 API 总的请求量、每天的请求量、按操作类型／Class 分类统计的请求量，文件的存储空间和流量变化趋势等等，由于这些数据可以直接反应我们应用的流量和云端性能，能够指导我们进行数据模型和代码优化，同时也与每月账单息息相关，所以请开发者一定仔细查看这里展示的统计数据。
- 「离线数据分析」：标准的增删改查 API 无法一次处理大量数据，所以我们额外提供了这一功能，允许大家通过 SQL 来进行大规模、实时的数据分析和挖掘。
- 「设置」：用户账号、文件域名与协议、安全、高级功能等配置。

特别地，对于下列数据管理需求，我们都可以在控制台完成：

#### 创建新的 Class
进入 **存储 > 数据** 页面，点击加号，可以为应用增加新的 Class，如下图所示：

![storage - create class](images/dash_storage_data1.png)

{% if node != 'qcloud' and node != 'us' %}
在接下来的创建 Class 页面中，我们可以指定 Class 名字，也可以选择 Class 类型：普通表或 [日志表](https://blog.leancloud.cn/3838/)
{% endif %}。

<div class="callout callout-danger">每个应用最多可以创建 300 个 Class。</div>

#### 本地数据导入 LeanCloud

点击加号「创建 Class」右方的菜单按钮（三个小点），会弹出「数据导入」菜单，可供批量导入本地数据。详细的数据导入页面如下图所示：

![storage - import data](images/dash_storage_data3.png)

本地文件的格式要求：

- 必须是 JSON 或者 CSV 文件
- UTF-8 文件编码
- 单个文件大小不能超过 30 MB。超大文件要拆分为小于 30 MB 的多个文件进行导入，只要使用同一个「Class 名称」，数据就会导入到一个表中。
- 一次只能向一个 Class 导入数据。所以如果我们本地有多个 Class 的数据，需要按照 Class 类别分成多个文件依次导入。

<div class="callout callout-info">
<ul><li>数据文件的扩展名必须是 `.csv` 或者 `.json` 结尾，我们以此来判断导入数据的类型。</li><li>数据导入不会触发任何 [云引擎 hook 函数](leanengine_cloudfunction_guide-node.html#Hook_函数)。</li></div>

##### JSON 文件格式

JSON 格式要求是一个符合我们 REST 格式的 JSON 对象数组，或者是一个包含了键名为 results、值为对象数组的 JSON 对象。例如：

```json
{ "results": [
  {
    "likes": 2333,
    "title": "讲讲明朝的那些事儿",
    "author": {
      "__type": "Pointer",
      "className": "Author",
      "objectId": "mQtjuMF5xk"
    },
    "isDraft": false,
    "createdAt": "2015-11-25T17:15:33.347Z",
    "updatedAt": "2015-11-27T19:05:21.377Z",
    "publishedAt": {
      "__type": "Date",
      "iso": "2015-11-27T19:05:21.377Z"
    },
    "objectId": "fchpZwSuGG"
  }]
}
```

【日期】示例中，`publishedAt` 是一个日期型字段，其格式要求请参考 [REST API &middot; 数据类型](rest_api.html#datatype_date)。

【密码】导入用户密码需要使用一个特殊的字段 `bcryptPassword`，并且完全遵循 [Stackoverflow &middot; What column type/length should I use for storing a Bcrypt hashed password in a Database?](http://stackoverflow.com/a/5882472/1351961)  所描述的加密算法加密后，才可以作为合法的密码进行导入。

顺便提下，数据导入页还有一个「导入 relation」标签。 relation 已经启用，推荐使用中间表。下面的内容仅供还在使用 relation 的开发者参考。

导入 relation 时，需要填写要导入的 Class 名称、导入后的字段名称、关联的 Class 名称等信息，才能完整导入，例如：

```json
{ "results": [
{
  "owningId": "dMEbKFJiQo",
  "relatedId": "19rUj9I0cy"
},
{
  "owningId": "mQtjuMF5xk",
  "relatedId": "xPVrHL0W4n"
}]}
```
其中：

* `owningId`： 将要导入的 Class 表内已经存在的对象的 objectId。
* `relatedId`：将要关联的 Class 里的对象的 objectId。

例如，Post 有一个字段 comments 是 Relation 类型，对应的 Class 是 Comment，那么 owningId 就是已存在的 Post 的 objectId，而 relatedId 就是关联的 Comment 的 objectId。

##### CSV 格式文件

导入 Class 的 CSV 文件格式必须符合我们的扩展要求：

* 第一行必须是字段的类型描述，支持 `int`、`long`、`number`、`double`、`string`、`date`、`boolean`、`file`、`array`、`object`、`geopoint` 等。
* 第二行是字段的名称
* 第三行开始才是要导入的数据

```csv
string,int,string,double,date
name,age,address,account,createdAt
张三,33,北京,300.0,2014-05-07T19:45:50.701Z
李四,25,苏州,400.03,2014-05-08T15:45:20.701Z
王五,21,上海,1000.5,2012-04-22T09:21:35.701Z
```

导入的 `geopoint` 格式是一个用空格隔开纬度、经度的字符串：

```csv
geopoint,string,int,string,double,date
location,name,age,address,account,createdAt
20 20,张三,33,北京,300.0,2014-05-07T19:45:50.701Z
30 30,李四,25,苏州,400.03,2014-05-08T15:45:20.701Z
40 40,王五,21,上海,1000.5,2012-04-22T09:21:35.701Z
```

CSV 导入也支持 Pointer 类型，要求类型声明为 `pointer:类名`，其中类名就是该 Pointer 列所指定的 className，列的值只要提供 objectId 即可，例如：

```csv
string,pointer:Player
playerName,player
张三,mQtjuMF5xk
李四,xPVrHL0W4n
```

注意：relation 已弃用，推荐使用中间表。以下仅供尚在使用 relation 的开发者参考：

导入 Relation 数据，比 JSON 简单一些，第一列对应 JSON 的 `owningId`，也就是要导入的 Class 的存在对象的 objectId，第二列对应 `relatedId`，对应关联 Class 的 objectId。例如：

```csv
dMEbKFJiQo,19rUj9I0cy
mQtjuMF5xk,xPVrHL0W4n
```

#### 云端数据导出到本地
LeanCloud 不会把大家强制绑定到自己平台上，所以我们也提供渠道让大家随时把数据导出去，具体操作请看[后文介绍](./dashboard_guide.html#数据导出)

#### 设置／修改 Class 的 ACL 权限

进入 **存储 > 数据** 页面，再进入右侧的数据展示区域，点击上排操作菜单中的「其它」菜单项，可以看到「权限设置」，如下图所示：

![storage - acl](images/dash_storage_data2.png)

对于每一个 Class，我们允许对如下几种操作分别授予用户操作权限：

- 为 Class 增加新的属性（add fields）
- 增加新的记录（create）
- 删除记录（delete）
- 指定条件查找记录（find）
- 指定 id 获取单条记录（get）
- 修改记录（update）

可以授权访问的用户类型有如下三种：

- 所有用户（表示所有 AVUser 对象，包括匿名用户在内，都拥有访问权限）
- 登录用户（表示只有成功调用 login 的 AVUser 拥有访问权限）
- 指定用户（表示只有少数固定的 AVUser 拥有访问权限）

具体的权限设置可以参考[文档](./data_security.html#Class_级别的_ACL)。

#### 批量清理一个 Class 下的数据
进入 **存储 > 数据** 页面，再进入右侧的数据展示区域，点击上排操作菜单中的「其它」菜单项，可以看到两种批量清理数据的方式：
- 删除所有数据：这会删除这个 Class 下的所有记录，但是 Class 以及 Class 的索引依然保留。
- 删除 Class：除了所有数据（包含索引）之外，这会连 Class 元信息也一并删除。

#### 给某个 Class 数据建索引
数据查询是很普通的操作，与传统关系型数据库一样，索引的优劣对于我们查询性能的影响非常大。在上图显示的「其它」菜单项中，我们也可以进入「索引」维护界面：

![storage - index](images/dash_storage_data4.png)

注意：

- 这里只能创建唯一索引，对单列索引和组合索引则没有限制。
- LeanCloud 后端智能索引系统会分析你的请求逻辑，自动创建一些索引，来提升数据查询性能。同时，为了支持地理位置信息的查询，我们也会自动对 GeoPoint 属性列创建索引。如果不是你创建的索引请不要进行任何变更操作。
- 索引可以有效改善查询性能，但是对于数据插入和修改则是有负作用的，所以是否创建索引、如何创建索引，还需要全面考虑慎重选择。
- {{ data.limitationsOnCreatingClassIndex() }}

#### 应用之间共享部分数据
同一个帐户下的其他应用（称为「目标应用」）下的 Class（称为「目标 Class」）绑定到当前 Class，访问当前 Class 数据，将会访问到目标应用下的目标 Class 数据，这就是我们所谓的「Class 绑定」功能，用来解决应用之间数据共享的需求。最简单的应用就是 _User 表共享，不同应用之间打通帐户，可以相互注册和登录。

在之前显示的「其它」菜单项中，我们可以进入「Class 绑定」界面。当 Class 绑定设置好之后，当前 Class 绑定之前存储的数据不会丢失，而是被「隐藏」起来，在解除绑定后仍然可以访问到。

#### 读懂 API 统计结果
在使用 LeanCloud 数据存储的时候，我们应用每天的调用量如何，不同平台过来的请求量有多少，里面哪些请求比较耗时，主要是什么操作导致的，如何才能得到更好的性能提升用户体验，等等数据都离不开 API 统计结果。
进入 **存储 > 统计** 菜单，你可以看到：

- API 汇总，这里汇总了应用每天访问量的变化趋势，支持线性图、饼状图展示，并且也可以按照 iOS／Android／Javascript／云引擎等不同平台区别展示所有调用。
- 按照操作类型分类展示 API 调用量，这里可以看到 `Create 请求`、`Find 请求`、`Get 请求`、`Update 请求`、`Delete 请求` 等不同操作类型下每天的请求量变化趋势，方便我们对特殊的操作来做 profiling 和优化。
- 文件存储空间和流量方面的统计。
- 其它更多的统计项目。

{% if node != 'qcloud' and node != 'us' %}
#### 离线数据分析
数据存储 API 以及 [CQL 查询](./cql_guide.html)对于结果集大小有限制，并且也不支持特别复杂、耗时较长的计算操作，对此，我们特别提供了「[离线数据分析](./leaninsight_guide.html)」这一功能，来支持产品和运营层面需要的数据统计／挖掘需求。
进入 **存储 > 离线数据分析** 菜单，就可以对应用下的所有数据进行 SQL 查询了，如下图所示：

![storage - leaninsight](images/dash_storage_data5.png)

#### 离线分析结果导出或存入另一个 Class

离线分析的结果是可以导出到本地的，并且也支持把结果再次存入云端的某个 Class 中。从上图可以看到，离线查询结果出来之后，右边操作区域的「保存为 Class」和「导出」按钮就变成可用状态了，这时候你可以选择把展示到界面的结果下载到本地或者再次存入云端。
{% endif %}

### 云引擎

#### 云引擎中查看节点运行状态

进入 **实例** 菜单，右侧区域会展示所有云引擎实例的运行状态信息，在这里你可以增加新的实例，也可以停止正在运行的实例。
云引擎实例的日志，则可以在 **应用日志** 和 **访问日志** 这里看到。
云引擎实例运行状态的统计信息，则可以在 **统计** 看到，这里包含了云引擎运行过程中的调用次数、页面展现次数等核心指标的统计结果，你需要密切关注这里的指标，已决定是否需要对云引擎进行扩容。

#### 云引擎中自定义二级域名
云引擎默认为每个应用提供了一个二级域名 `<应用的域名>.{{engineDomain}}`，允许开发者将 web 应用部署到该域名之下运行，支持静态资源和动态请求服务。这个二级域名是可以修改的，你可以到 **设置 > Web 主机域名** 里面设置自定义的子域名。

同时，我们也支持绑定到你自己的独立域名，请进入 [控制台 > 账号设置 > 域名绑定](/settings.html#/setting/domainbind)，按照步骤提示操作即可。

#### 云引擎中创建定时器
云引擎中支持定时任务，你可以在 **定时任务** 这里进行设置，详细操作流程请参考：[定时任务](leanengine_cloudfunction_guide-node.html#定时任务)。



### 消息

**控制台 > {应用} > 消息** 服务下，包含了三大菜单：

- 「即时通讯」：这里展示了即时通讯服务下一些核心的统计数据，譬如实时在线总用户数、今日累计在线用户数、一段时间内聊天消息／连接峰值的变化趋势等等；同时应用内所有用户的聊天消息也可以一览展示和查询。而且，与聊天相关的一些配置，如 iOS 用户离线推送、消息回调等，都可以在这里进行设置。
- 「推送」：包含了所有历史推送记录的展示和查询，并且也支持在线进行消息推送／定时推送，也可以在这里设置推送相关的一些配置，例如是否允许客户端推送、iOS 推送证书等等。
- 「短信」：这里可以展示、查询所有短信发送记录，看到短信服务一些核心指标的统计数据，同时也支持短信签名和模版的申请。

特别地，对于下列管理需求，我们都可以在控制台完成：

#### 查询即时通讯中某个用户是否在线
在 [消息 > 即时通讯 > 用户](/dashboard/messaging.html?appid={{appid}}#/message/realtime/client) 菜单下，输入单个用户的 username，可以查询其在线状态。如果用户不存在，返回的在线状态永远是离线。

#### 设置离线推送配置项
在 **消息 > 即时通讯 > 设置** 菜单下，可以设置「[离线推送](./realtime-guide-intermediate.html#离线推送通知)」的内容和其他参数。勾选「使用测试环境推送」即表示使用测试环境推送，不在生产环境推送。什么都不填表示关闭离线推送。在勾选了「使用测试环境推送」后，必须填写推送内容。

#### 取消尚未开始的定时推送任务
定时进行消息推送对于产品运营人员来说是非常实用的一项功能，但有时候，我们也想取消掉还未执行的定时推送请求。
你可以在 **消息 > 推送 > 定时推送** 菜单下，查看所有定时推送任务和执行状态，你也可以在这里取消掉某个定时任务。

#### 设置多个推送证书
LeanCloud 的消息推送是可以支持多个 iOS 证书的，这一点对某些应用来说会非常有用。譬如我做了一个打车的 O2O 应用，我的产品分为司机端和乘客端两个 app，它们是以不同 app 上传到 App Store 的，但是内部我在 LeanCloud 平台是同一个应用，我需要在乘客发出用车需求之后，可以尽快将消息推送到附近的司机。
你可以在 **消息 > 推送 > 设置** 菜单下，上传多份证书，并给他们赋予不同的名字，这样以后推送消息的时候，就可以准确地对不同用户使用不同证书。

### 组件

**控制台 > {应用} > 组件** 服务主要包含了三大菜单：

- 「用户反馈」：展示了终端用户对产品的所有反馈，并可以直接在线回复用户，给产品经理和运营人员最大的支持。
- 「应用内搜索」：包含了应用内搜索的一些基本设置信息。
- 「社交」：对于使用了 LeanCloud 社交组件的开发者来说，这里可以直接设置／修改 QQ、微博和微信平台的配置信息。

### 设置
**控制台 > {应用} > 设置** 页面，我们可以进行如下操作：
- 「基本信息」：每一个应用的名称和描述信息。
- 「应用 Key」：显示应用的 App ID、App Key、Master Key 信息。
- 「安全中心」：可以给数据存储、短信、推送、即时通讯等服务进行单独开关设置，同时也可以为 web 应用在使用 js sdk 的时候设置安全域名。
- 「邮件模版」：在用户注册、重置密码的时候，LeanCloud 可以自动帮你发送邮箱验证邮件，在这里你可以设置自己的内容模版。
- 「协作管理」：应用开发和运营过程中，把其他人或团队加为协作者，这样该协作者可以根据所给予的权限，在自己的控制台中看到指定的应用及相关数据，更好地进行团队协作开发。
- 「数据导出」：这里可以按照日期或 Class 导出你的所有数据。

特别地，对于下列管理需求，我们都可以在控制台完成：

#### 把应用转让给别人
应用是可以在不同账号下转让的，在 **控制台 > {应用} > 设置 > 基本信息** 菜单下，右侧区域下方有一个「应用转让」的操作按钮，可以完成这一需求。

转让方需要填写受让方邮箱账号，该邮箱需要是同一节点上已注册用户绑定的邮箱。转让方进行操作后，受让方的邮箱会收到转让邮件，在 24 小时内点击其中的链接，跳转到受让页面，点击「确认」即可完成整个转让过程。如果受让方点击受让链接时，所属账号未登录，会跳转到登录界面。受让方登录后，重新点击受让链接进行操作即可。

#### 把应用发布到应用墙，让 LeanCloud 帮你推广
提交应用到 [LeanCloud 应用墙](https://leancloud.cn/customers.html)，让更多人发现你的产品。在 **控制台 > {应用} > 设置 > 基本信息** 菜单下，右侧区域有一组「应用墙发布设置」的表单，可以完成这一需求。

#### 重置遭泄漏的 appKey
在 **控制台 > {应用} > 设置 > 应用 Key** 菜单下，可以重置应用的 Master Key。

LeanCloud 平台上，对每一个应用，有如下三个 id／key 用于标识 app 身份信息：
* App Id：全局唯一的应用 ID，类似于我们个人的身份证号码。
* App Key：用来对该应用客户端请求进行身份验证的密码。
* Master Key：用于 app 超级权限认证的密码，禁止在客户端或不信任的环境下使用。

我们在使用过程中要注意保护好 app key 和 master key，特别是 master key，千万不能泄漏，因为它会绕过所有 ACL 和 Class 权限等授权校验机制。

#### 添加协作者
在为应用增加协作者的时候，我们可以添加个人协作者，也可以添加团队协作者，这两者之间区别如下：

- 个人协作者只对单个账户有效，也就是说一次只能添加一人。
- 团队协作者则是对一个团队进行授权，该团队下的所有人都会自动成为协作者，也就是说一次能添加一批人。

不止于此，如果结合协作者权限来看，个人／团队协作者之间的差异会更大。

在添加协作者的时候，LeanCloud 也支持限定协作者的可见范围（权限）。在添加协作者的时候，选择「自定义权限」，即可进行详细设置。

#### 数据导出

你可以导出所有的应用数据（包括加密后的用户密码），只要进入 [控制台 / 应用设置 / 数据导出](/app.html?appid={{appid}}#/export) 点击导出按钮即可开始导出任务。我们会在导出完成之后发送下载链接到你的注册邮箱。

导出还可以限定日期，我们将导出在限定时间内有过更新或者新增加的数据。

我们还提供了数据导出的 [RETS API](./rest_api.html#数据导出_API)。

##### 导出用户数据的加密算法

导出的 `_User` 表数据会包括加密后的密码 `password` 字段和用于加密的随机盐 `salt` 字段。 LeanCloud 不会以明文保存任何用户的密码，我们也不推荐开发者以明文方式保存应用内用户的密码，这将带来极大的安全隐患。如果你要在 LeanCloud 系统之外校验用户的密码，需要将用户的传输过来的明文密码，加上导出数据里对应用户的 `salt` 字段，使用下文描述的加密算法进行不可逆的加密运算，其结果如果与导出数据里的 `password` 字段值相同，即认为密码验证通过，否则验证失败。

我们通过一个 Ruby 脚本来描述这个用户密码加密算法：

1. 创建 SHA-512 加密算法 hasher
2. 使用 salt 和 password（原始密码） 调用 hasher.update
3. 获取加密后的值 `hv`
4. 重复 512 次调用 `hasher.update(hv)`，每次hv都更新为最新的 `hasher.digest` 加密值
5. 最终的 hv 值做 base64 编码，保存为 password

假设：

<table class="noheading">
  <tbody>
    <tr>
      <td nowrap>salt</td>
      <td><pre style="margin:0;"><code>h60d8x797d3oa0naxybxxv9bn7xpt2yiowz68mpiwou7gwr2</code></pre></td>
    </tr>
    <tr>
      <td nowrap>原始密码</td>
      <td><code>password</code></td>
    </tr>
    <tr>
      <td nowrap>加密后</td>
      <td><pre style="margin:0;"><code>tA7BLW+NK0UeARng0693gCaVnljkglCB9snqlpCSUKjx2RgYp8VZZOQt0S5iUtlDrkJXfT3gknS4rRqjYsd/Ug==</code></pre></td>
    </tr>
  </tbody>
</table>

实现代码：

```ruby
require 'digest/sha2'
require "base64"

hasher = Digest::SHA512.new
hasher.reset
hasher.update "h60d8x797d3oa0naxybxxv9bn7xpt2yiowz68mpiwou7gwr2"
hasher.update "password"

hv = hasher.digest

def hashme(hasher, hv)
  512.times do
    hasher.reset
    hv = hasher.digest hv
  end
  hv
end

result = Base64.encode64(hashme(hasher,hv))
puts result.gsub(/\n/,'')
```

非常感谢用户「残圆」贡献了一段 C# 语言示例代码：

```cs
/// 根据数据字符串和自定义 salt 值，获取对应加密后的字符串
/// </summary>
/// <param name="password">数据字符串</param>
/// <param name="salt">自定义 salt 值</param>
/// <returns></returns>
public static string SHA512Encrypt(string password, string salt)
{
    /*
    用户密码加密算法
    1、创建 SHA-512 加密算法 hasher
    2、使用 salt 和 password（原始密码） 调用 hasher.update
    3、获取加密后的值 hv
    4、重复 512 次调用 hasher.update(hv)，每次hv都更新为最新的 hasher.digest 加密值
    5、最终的 hv 值做 base64 编码，保存为 password
    */
    password = salt + password;
    byte[] bytes = System.Text.Encoding.UTF8.GetBytes(password);
    byte[] result;
    System.Security.Cryptography.SHA512 shaM = new System.Security.Cryptography.SHA512Managed();
    result = shaM.ComputeHash(bytes);
    int i = 0;
    while (i++ < 512)
    {
        result = shaM.ComputeHash(result);
    }
    shaM.Clear();
    return Convert.ToBase64String(result);
}
```
非常感谢用户「snnui」贡献了一段 JavaScript（NodeJS） 语言示例代码：
```js
function encrypt(password,salt) {
  var hash = crypto.createHash('sha512');
  hash.update(salt);
  hash.update(password);
  var value = hash.digest();

  for (var i = 0; i < 512; i++) {
      var hash = crypto.createHash('sha512');
      hash.update(value);
      value = hash.digest();
  }

  var result = value.toString('base64');
  return result;
}
```

#### 保留字段

注意，`createdAt` 和 `updatedAt` 属于保留字段，导出数据中直接编码为 UTC 时间戳字符串，和普通 Date 类型字段的编码方式不同。这一点与通过 REST API 查询这两个字段的返回结果是一致的。

```json
{
  "normalDate": {
    "__type": "Date",
    "iso": "2015-06-21T18:02:52.249Z"
  },
  "createdAt": "2015-06-21T18:02:52.249Z",
  "updatedAt": "2015-06-21T18:02:52.249Z"
```

## 开发者信息

在控制台，点击右上角的头像和用户名，下拉菜单中选择「账号设置」，可以查看、修改账号信息。

### 开发者信息
为了更好地服务开发者，建议您完善开发者信息，填写真实姓名、电话号码。比如：
* 在关键时刻（服务宕机等意外情况），我们可以及时与您取得联系，做好事故沟通和应对措施
* 「技术支持 Ticket」里会用到这些信息
* 发票相关的信息也来自这里

### 邮箱
* 登录时需要邮箱
* 数据导入，数据导出等一些服务会发送邮件通知
* 在「邮件选项」中，可以选择退订我们发送的产品相关邮件（财务和告警类邮件无法退订）。

{% if node != 'qcloud' and node != 'us' %}
### 实名认证
按照国家法律法规要求，所有使用了 LeanCloud 云引擎的网站托管功能的开发者必须进行实名认证。
{% endif %}

### 告警设置
这里可以设置账户的告警余额。当余额低于这一额度时系统会以短信和邮件的方式通知用户，以便用户及时充值，避免账户欠费而被停服的危险。

### 团队管理
为了方便多人协作，可以创建团队。在单个应用「设置 > 协作管理」菜单里，可以添加该团队作为当前项目的协作者，这样整个团队的成员都会拥有相关的权限。

## 账单和付款

在控制台，点击右上角的头像和用户名，下拉菜单中选择「财务」，可以查看账单，并完成充值、付款等操作。

### 财务概况

这里展示了当前账户下的重要财务信息：

- **账户余额**：显示了当前账户下的可用金额，已扣除前一日的账单金额和当日已产生的短信消费。当余额小于 0 时，当前账户下所有应用的服务会被暂停，直至欠费缴清。
- **余额充值**：支持支付宝和银行转账汇款，请参考 [如何付费](./faq.html#如何付费)。
- **余额告警**：点击跳转至前述「告警设置」页面。

### 账单
每个月会产生一份账单，包括当前账户下所有应用。会详细展示每个应用每个服务的费用明细。

### 发票
请参考 [如何申请发票](./faq.html#如何申请开具发票)。
