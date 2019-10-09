# 域名绑定指南

根据法律法规和有关部门的要求，使用 LeanCloud 服务需要绑定自有域名。
绑定自有域名也有利于从域名层面做好应用隔离，确保业务稳定。

这篇指南假定你了解域名解析的基本知识，如果你不太熟悉这方面的内容，可以参考我们博客上的[这篇文章][basic]。

[basic]: https://leancloudblog.com/Domain-Name-Story-confirm/

## 自定义域名的种类

LeanCloud 服务涉及以下三种自定义域名：

| 域名种类 | 涉及服务 | 备案 | 在 LeanCloud 备案或接入备案 | SSL | 裸域名 | A 记录 | 绑定目标 | 可绑定多个域名 | 
| - | - | - | - | - | - | - | - | - | 
| 文件域名 | 文件服务 | 必须 | 可选 | 可选 | 不支持 | 不支持 | 应用 | 否 |
| 云引擎域名 | 云引擎 **网站托管** | 必须 | 必须 | 可选 | 支持 | 支持 | 分组 | 是 |
| API 域名 | 存储、即时通讯、短信、推送、**云函数** | 必须 | 必须 | 必须 | 不支持 | 不支持 | 应用 | 是 |

说明：

0. 每个域名只能绑定到一个应用的一种服务，可以使用同一主域名下不同的子域名。
1. API 域名需要启用 SSL，绑定时会自动申请 SSL 证书，当然你也可以自行上传证书。
2. 为了避免影响同一域名下的其他子域名的解析，文件域名和 API 域名不支持直接绑定裸域名（例如 `example.com`）。
3. 考虑到部分用户希望云引擎网站托管的 URL 尽量简短，云引擎网站托管服务支持直接绑定裸域名，直接绑定时使用 A 记录（其他情况下域名绑定均使用 CNAME）。由于 IP 可能发生变动，因此我们不建议在云引擎网站托管服务上直接绑定裸域名。
4. 绑定目标中的「分组」指应用下的云引擎实例分组的生产环境。
5. 可绑定多个域名指在一个应用（文件域名、API 域名）或分组（云引擎域名）上可以绑定多个域名。

## 文件域名

如果你的应用使用了 LeanCloud 文件服务，请前往 [控制台 > 存储 > 设置 > 自定义文件域名](/dashboard/storage.html?appid={{appid}}#/storage/conf) 绑定文件域名。

注意，即使您并未使用 LeanCloud 的结构化数据存储服务，但是使用了即时通讯的多媒体消息（图像、音频、视频等），那么就有可能使用了文件服务。
一个简单的判断方法是查看到控制台查看你的应用的 [存储 > 数据][_File] 页面，如果 `_File` 表中有数据，就表明你的应用使用了文件服务。

[_File]: /dashboard/data.html?appid={{appid}}#/_File

绑定文件域名时，可以选择是否启用 HTTPS：

- 不启用 HTTPS，则客户端只能通过 HTTP 访问。

- 启用 HTTPS 后，客户端同时可以通过 HTTPS 和 HTTP 访问文件。但是，受限于文件服务提供商，无论客户端使用 HTTP URL 还是 HTTPS URL 访问：

  - 启用 HTTPS 域名的自定义文件域名的流量均按照 HTTPS 流量计费。
  - 同理，应用控制台的文件流量统计也总是归入 HTTPS 流量。

更换文件域名后，之前保存在 `_File` 表中的文件 URL 会自动更新。
即时通讯历史消息中的 URL 不会自动更新。类似地，如果开发者把文件 URL 单独保存在别的地方，更换文件域名后，需要在客户端自行实现相应的替换逻辑。

之前使用 LeanCloud 公共文件域名的旧应用，在绑定文件域名后，现存的使用共享域名的 URL 仍然可以访问。

国际版暂不支持绑定自有域名。

## 云引擎域名

使用云引擎网站托管服务的应用，即申请了[云引擎内置域名](leanengine_webhosting_guide-node.html#设置域名)的应用，需要前往[应用控制台 > 账号设置 > 域名绑定](/dashboard/settings.html#/setting/domainbind)绑定云引擎域名。

如前所述，仅使用云函数（包括 hook 函数）的应用，无需绑定云引擎域名，不过需要绑定 API 域名。

华北节点支持以下功能：

- `stg-` 开头的自定义域名（例如 `stg-web.example.com`）会被自动地绑定到预备环境。
- 控制台绑定域名时，可以自动申请 SSL 证书。相应地，`/.well-known/acme-challenge/` 路径用于验证，开发者无法使用该路径。

国际版同样支持绑定云引擎域名（无需备案）。

## API 域名

如果你使用了以下服务：

- 结构化数据存储
- 云函数（包括 hook 函数）
- 即时通讯
- 多人在线对战、排行榜

那么你需要前往[应用控制台 > 设置 > 域名绑定](/dashboard/app.html?appid={{appid}}#/domains) 绑定 API 域名。

只使用推送和短信功能的应用目前不强制要求绑定域名，但我们仍然建议用户绑定自己的 API 域名，以免受到共享域名可用性的影响。

已绑定自有域名的应用，旧版本客户端仍可继续访问原来由 LeanCloud 提供的域名，但我们不对共享域名的可用性做保证。

目前，绑定 API 域名后，即时通讯，Live Query 以及多人对战的 WebSocket 连接暂时仍会使用共享域名。我们后续会支持这类 WebSocket 连接使用自有域名。另外，用户反馈组件暂时也仍然使用共享域名。

国际版暂不支持绑定自有 API 域名。

### 更新代码

绑定自有 API 域名后，需要更新代码以使用自定义域名。（国际版暂不支持绑定自有域名，无需额外设置，直接使用 App Id、App Key 初始化即可。）

以下部分假定绑定的自定义域名是 `xxx.example.com`，且开启了 HTTPS。

#### REST API

参考 [REST API 使用详解](rest_api.html#base-url) 配置。

#### JavaScript SDK

##### 存储 SDK

请参考 [SDK 安装指南](sdk_setup-js.html#安装与引用 SDK) 配置。

旧版本的 SDK 请参考以下方法配置（建议使用最新版本的 SDK）：

<details>

<p><code>&gt;=3.5.5, &lt;3.11.1</code> 的版本可能会碰到仍然使用缓存默认配置的 bug，它可能会导致更新后的第一次请求失败</p>

<pre><code>
AV.init({
  // appId, appKey,
  serverURLs: 'https://xxx.example.com',
});
</code></pre>

<p><code>&gt;= 3.0.0, &lt;3.5.5</code></p>

<pre><code>
AV.init({
  // appId, appKey,
  serverURLs: {
    push: 'https://xxx.example.com',
    stats: 'https://xxx.example.com',
    engine: 'https://xxx.example.com',
    api: 'https://xxx.example.com',
  },
});
</code></pre>

<p><code>&lt;3.0.0</code> 的即时通讯 SDK 不支持自定义域名。</p>
</details>



##### 即时通讯 SDK

请参考 [即时通讯开发指南](realtime-guide-beginner.html#创建 IMClient) 配置。

旧版本的 SDK 请参考以下方法配置（建议使用最新版本的 SDK）：

<details>

<p><code>&gt;=4.0.0, &lt;=4.3.1</code> 的即时通讯 SDK 的 server 参数只能填写域名（不含协议），不支持未启用 HTTPS 的自定义域名：</p>

<pre><code>
new Realtime({
  // appId, appKey,
  server: 'xxx.example.com',
};
<code></pre>


<p><code>&lt;4.0.0</code> 的即时通讯 SDK 不支持自定义域名。</p>

<p>如果使用了 LiveQuery 功能，建议使用<code>&gt;=3.14.0</code> 的存储 SDK。
旧版本（<code>&gt;=3.5.0, &lt;=3.13.2</code>）的 SDK 还需要在初始化的时候额外配置 LiveQuery 模块的域名：</p> 

<pre><code>
AV.init({
  // appId, appKey,
  // serverURLs,
  realtime: new AV._sharedConfig.liveQueryRealtime({
    appId,
    appKey,
    server: 'xxx.example.com',
  }),
});
<code></pre>

<p><code>&gt;=3.5.0, &lt;3.13.2</code> 的 SDK 不支持未启用 HTTPS 的自定义域名。</p>

<p><code>&lt;3.5.0</code> 存储 SDK 的 LiveQuery 不支持自定义域名。</p>

</details>

##### 多人在线对战

请参考 [入门指南](multiplayer-quick-start-js.html#初始化) 或 [开发指南](multiplayer-guide-js.html#初始化) 进行配置。

##### 微信小程序白名单中增加：

```
存储：
request：https://xxx.example.com

即时通讯：
request：https://xxx.example.com/
WebSocket：
wss://cn-n1-cell1.avoscloud.com
wss://cn-n1-cell2.avoscloud.com
wss://cn-n1-cell5.avoscloud.com
wss://cn-n1-cell7.avoscloud.com
wss://cn-n1-cell1.leancloud.cn
wss://cn-n1-cell2.leancloud.cn
wss://cn-n1-cell5.leancloud.cn
wss://cn-n1-cell7.leancloud.cn

多人在线对战：
request：https://xxx.example.com/
WebSocket：
wss://cn-n1-wechat-mesos-cell-1.avoscloud.com
wss://cn-n1-wechat-mesos-cell-2.avoscloud.com
wss://cn-n1-wechat-mesos-cell-3.avoscloud.com
wss://cn-n1-wechat-mesos-cell-4.avoscloud.com
wss://cn-n1-wechat-mesos-cell-1.leancloud.cn
wss://cn-n1-wechat-mesos-cell-2.leancloud.cn
wss://cn-n1-wechat-mesos-cell-3.leancloud.cn
wss://cn-n1-wechat-mesos-cell-4.leancloud.cn
```

#### Objective-C SDK

请参考 [SDK 安装指南](sdk_setup-objc.html#初始化) 配置。

**部分旧版本 SDK（< 8.2.3）存在 SSL Pinning，它可能导致配置后的自定义服务器地址无法使用，如果出现了「证书非法」的相关错误，请至少升级 SDK 到 8.2.3，建议升级至最新版。**

`<4.6.0` 的版本不支持自定义域名。

#### Swift SDK

`>= 17.0.0` 的版本请参考 [SDK 安装指南](sdk_setup-swift.html#初始化) 配置。

`>= 16.1.0, < 17.0.0` 的版本请参考以下方法配置：

<details>
<pre><code>
let configuration = LCApplication.Configuration(
    customizedServers: [
        .api("https://xxx.example.com"),
        .engine("https://xxx.example.com"),
        .push("https://xxx.example.com"),
        .rtm("https://xxx.example.com")
    ]
)
do {
    try LCApplication.default.set(
        id: "{{appid}}",
        key: "{{appkey}}",
        configuration: configuration
    )
} catch {
    fatalError("\(error)")
}
</code></pre>

</details>

`<16.1.0` 的版本不支持自定义域名。

#### Java Unified SDK

Java Unified SDK 请参考 [SDK 安装指南](sdk_setup-java.html#初始化) 配置。 

老的 Android SDK 请参考以下方法配置：

<details>
<pre><code>
// 配置 SDK 储存
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.API, "https://xxx.example.com");
// 配置 SDK 云引擎
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.ENGINE, "https://xxx.example.com");
// 配置 SDK 推送
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.PUSH, "https://xxx.example.com");
// 配置 SDK 即时通讯
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.RTM, "https://xxx.example.com");
// 初始化应用
AVOSCloud.initialize(this, "{{appid}}", "{{appkey}}");
</code></pre>

<p><code>&lt;4.4.4</code> 的版本不支持自定义域名。</p>

</details>

#### .NET SDK

请参考 [SDK 安装指南](sdk_setup-dotnet.html#初始化) 配置。 

#### PHP SDK

请参考 [SDK 安装指南](sdk_setup-php.html#初始化) 配置。 

`<0.7.0` 版本不支持自定义域名。

#### Python SDK

设置环境变量 `LC_API_SERVER` 为 `https://xxx.example.com`。

云引擎内部访问 API 是通过内网，**云引擎网站托管的 Python 项目无需配置**，否则请求会走公网，影响性能。

## CNAME 设置

绝大部分情况下，绑定域名均需要设置 CNAME，因此这里我们简单解释下如何设置 CNAME。

绑定域名过程中，需要设置域名的 CNAME。控制台会提示 CNAME 的地址，按照控制台的提示到域名注册商或域名解析服务提供商处设置（如果自己架设域名解析服务器的话，请根据域名解析服务器文档配置）。

例如，按控制台提示输入待绑定域名 `xxx.example.com` 后，控制台会首先检查备案，检查通过后， 会显示「等待配置 CNAME」及 CNAME 值。
假设控制台显示「CNAME: yyy.zzz.com」：

![控制台域名绑定界面](images/dashboard-domain-setup.png)

那么对应的 DNS Zone 记录为：

```
xxx.example.com.	3600	IN	CNAME	yyy.zzz.com.
```

其中 3600 为 TTL，可根据自己的需要设置。
大多数域名注册商或域名解析服务提供商都提供图形化的设置界面，按照其说明配置即可。

![以 DnsPod 添加 CNAME 记录为例](images/dnspod-add-cname-record.png)

设置完成后，需要等待一段时间，CNAME 记录生效后，LeanCloud 控制台会显示「已绑定」。

如果长时间卡在「等待配置 CNAME 阶段」，那么请点击「等待配置 CNAME 阶段」后的问号图标，依其提示运行相应的 dig 命令检查 CNAME 记录是否生效。
如 dig 命令查不到相应的 CNAME 记录，请返回域名商控制台检查配置是否正确，如仍有疑问，请联系域名商客服。
如 dig 命令能查到预期的 CNAME 记录，但控制台仍显示「等待配置 CNAME 阶段」，请通过工单或 <support@leancloud.rocks> 联系我们。

## 备案

根据工信部规定，在 LeanCloud 绑定的文件域名、云引擎域名、API 域名，需要在 LeanCloud 新增备案或者接入备案。

### 新增备案

如果你的主域名没有备案（没有 ICP 备案号），那么主域名本身及其子域名均无法在控制台绑定。
需要先在 LeanCloud 或其他云服务商办理备案。管局审核通过后，方可在 LeanCloud 控制台绑定。

如果你的主域名没有备案，我们建议你通过 LeanCloud 新增备案。
主域名在 LeanCloud 备案后，使用子域名在 LeanCloud 绑定文件域名、云引擎域名、API 域名不需要额外备案或接入备案。

商用版应用请进入 [应用控制台 > 账号设置 > 域名备案](/dashboard/settings.html#/setting/domainrecord)，按照步骤填写资料，并根据控制台提示进行新增备案。

没有商用版应用的用户，如果不打算升级应用为商用版，可以通过以下方式新增备案：

1. 如果你同时也是 LeanCloud 底层 IaaS 服务商（华北节点为 UCloud）的用户，那么也可以自行在底层 IaaS 服务商新增备案。备案通过后，等价于在 LeanCloud 新增备案。
2. 如果只需要绑定文件域名，可以在其他云服务商处新增备案，然后直接在 LeanCloud 控制台绑定文件域名，因为绑定文件域名不需要接入备案。

注意，你也可以选择在其他云服务商处新增备案。
但对于大部分用户而言，因为需要绑定 API 域名或云引擎域名，在其他云服务商处新增备案之后，仍然需要在 LeanCloud 处接入备案。
这意味着需要重复提交许多类似的资料，经过两次审核周期，由管局先后审核两次，徒然增加时间和精力。
因此，对于主域名没有备案的用户，我们一般推荐在 LeanCloud 新增备案。

### 接入备案

工信部规定，网站接入多个云服务商时，需要在各云服务商处接入备案：

- 接入备案只是在备案信息中新增一个服务商，不会影响之前服务商，可以同时使用。
- 和新增备案不同，接入备案可以在服务上线后进行，不要求关站或停止解析，不影响当前网站访问。
- 一般而言，网站使用的所有云服务商皆需备案或接入备案（在使用的第一家云服务商处新增备案，在其他云服务商接入备案）。

因此，如果你的主域名之前通过 LeanCloud 新增备案，那么不需要再操心接入备案事项。
如果你的主域名是通过其他云服务商新增备案，那么你在 LeanCloud 控制台绑定 API 域名或云引擎域名后，需要在 LeanCloud 接入备案。
由于 CDN 服务一般不需要接入备案，因此，如果该子域名仅用于 LeanCloud 文件域名，那么无需在 LeanCloud 接入备案。

商用版应用如需接入备案，请先在 LeanCloud 控制台完成相应域名的绑定，
然后进入 [应用控制台 > 账号设置 > 域名备案](/dashboard/settings.html#/setting/domainrecord)，按照步骤填写资料，并根据控制台提示进行接入备案。
办理接入备案期间域名、服务可以正常使用。

没有商用版应用的用户，云引擎、API 域名可以先绑定已备案的域名，进行测试开发。在产品正式上线时，升级应用为商用版，通过控制台接入备案。
或者，如果你同时也是 LeanCloud 底层 IaaS 服务商（华北节点为 UCloud）的用户，那么也可以自行在底层 IaaS 服务商接入备案。

华东节点底层 IaaS 服务商（腾讯云）暂不支持通过 LeanCloud 以用户主体身份提交备案资料。
因此，希望在华东节点所在机房做备案接入或直接办理新备案的用户，可以自行创建腾讯云账号并通过腾讯云完成备案。如需授权码，商用版应用用户可提交工单获取。

## 推荐阅读

如需了解域名解析和备案的基本知识，可以参考以下三篇文章：

1. [域名背后那些事](https://nextfe.com/domain-introduction/)
2. [域名之殇](https://nextfe.com/domain-problems/)
3. [备案那些事儿](https://nextfe.com/icp-introduction/)

另外，我们也收集了近期反馈较多的问题，以问答的形式展现出来，供大家参考：

[域名绑定 Q&A](https://leancloudblog.com/domain-question-answers/)