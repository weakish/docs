# API 自定义域名绑定指南

现在华北节点支持自助绑定 API 自定义域名。你可以在控制台的「存储 -> 设置 -> 自定义 API 服务域名」中提供一个 **已备案** 的域名（如需开启 HTTPS 还需提供对应的证书）来自助绑定。

## 自定义域名的适用范围

自定义域名目前可用于访问以下服务：

- 结构化数据存储
- 短信
- 推送
- 云函数

自定义域名不适用以下服务：

- 即时通讯，Live Query 以及多人对战的 WebSocket 连接（绑定自定义域名后仍旧使用 LeanCloud 提供的域名，比如 `avoscloud.com`，`leancloud.cn`）

另外，以下服务使用独立的自定义域名：

- 云引擎网站托管
- 文件存储服务

换句话说，如果之前在这两个服务上绑定过自定义域名，现在想绑定 API 自定义域名，那么需要在 API 上绑定另一个域名（可以是不同的子域名）。

## 自定义域名的绑定步骤

以下部分假定绑定的自定义域名是 `xxx.example.com`。

### CNAME 设置

如上所述，你可以在控制台的「存储 -> 设置 -> 自定义 API 服务域名」中绑定一个 **已备案** 的域名：

![LeanCloud 设置 API 域名](images/api-own-domain.png)

填入要绑定的子域名（强烈建议使用子域名，例如 `xxx.example.com`，而不是直接绑定二级域名（SLD，second-level domain）`example.com`，以免影响 `example.com` 下其他子域名的解析），如果选择「启用 https」，那么还需要提交证书和私钥文件。然后点击「绑定」按钮即可。

域名绑定成功后，需要设置域名的 CNAME。控制台会提示 CNAME 的地址，按照控制台的提示到域名注册商或域名解析服务提供商处设置（如果自己架设域名解析服务器的话，请根据域名解析服务器文档配置）。

例如，控制台提示：

> 域名绑定成功后，请将域名 `CNAME` 到 `avoscloud.com`

那么对应的 DNS Zone 记录为：

```
xxx.example.com.	3600	IN	CNAME	avoscloud.com.
```

其中 3600 为 TTL，可根据自己的需要设置。
大多数域名注册商或域名解析服务提供商都提供图形化的设置界面，按照其说明配置即可。

### 更新代码

绑定自定义域名后，需要更新代码以使用自定义域名。

**注意：**
* 绑定自定义域名后，LeanCloud 提供的原域名（比如 `avoscloud.com`）仍然有效。换言之，绑定自定义域名后，不会导致使用原域名（比如 `avoscloud.com`）的应用或服务失效。
* SDK 中，只有较新版本的 SDK 才支持设定 API 服务器地址。

以下部分假定绑定的自定义域名是 `xxx.example.com`，且开启了 HTTPS。

#### REST API

参考 [REST API 使用详解](rest_api.html#base-url) 配置。

#### JavaScript SDK

##### 存储 SDK

请参考 [SDK 安装指南](sdk_setup-js.html#安装与引用 SDK) 配置。

旧版本的 SDK 请参考以下方法配置（建议使用最新版本的 SDK）：

<details>

<p><code>>= 3.5.5, < 3.11.1</code> 的版本可能会碰到仍然使用缓存默认配置的 bug，它可能会导致更新后的第一次请求失败</p>

<pre><code>
AV.init({
  // appId, appKey,
  serverURLs: 'https://xxx.example.com',
});
</code></pre>

<p><code>>= 3.0.0, < 3.5.5</code></p>

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
```
</code></pre>

</details>

3.0.0 之前的即时通讯 SDK 不支持自定义域名。


##### 即时通讯 SDK

请参考 [即时通讯开发指南](realtime-guide-beginner.html#创建 IMClient) 配置。

旧版本的 SDK 请参考以下方法配置（建议使用最新版本的 SDK）：

<details>

<p>4.0.0 至 4.3.1 之间的即时通讯 SDK 的 server 参数只能填写域名（不含协议），不支持未启用 HTTPS 的自定义域名：</p>

<pre><code>
new Realtime({
  // appId, appKey,
  server: 'xxx.example.com',
};
```
<code></pre>

</details>

4.0.0 之前的即时通讯 SDK 不支持自定义域名。

如果使用了 LiveQuery 功能，建议使用 3.14.0 以上版本的存储 SDK。
旧版本（3.5.0 至 3.13.2）的 SDK 还需要在初始化的时候额外配置 LiveQuery 模块的域名：

<details>

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

<p>3.5.0 至 3.13.2 之间的 SDK不支持未启用 HTTPS 的自定义域名。</p>

</details>

3.5.0 之前的存储 SDK 的 LiveQuery 不支持自定义域名。

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

4.6.0 及以上支持（强烈建议升级到**最新版**，至少升级到 **8.2.3**，详情见下）

```objc
// 配置 SDK 储存
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleAPI];
// 配置 SDK 推送
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModulePush];
// 配置 SDK 云引擎
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleEngine];
// 配置 SDK 即时通讯
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleRTM];
// 配置 SDK 统计
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleStatistics];
// 初始化应用
[AVOSCloud setApplicationId:APP_ID clientKey:APP_KEY];
```

**部分旧版本 SDK（< 8.2.3）存在 SSL Pinning，它可能导致配置后的自定义服务器地址无法使用，如果出现了「证书非法」的相关错误，请至少升级 SDK 到 8.2.3，建议升级至最新版**

#### Swift SDK

16.1.0 及以上支持

```swift
let configuration = LCApplication.Configuration(
    customizedServers: [
        .api("https://xxx.example.com"),
        .engine("https://xxx.example.com"),
        .push("https://xxx.example.com"),
        .rtm("https://xxx.example.com")
    ]
)
try LCApplication.default.set(
    id: "APP_ID",
    key: "APP_KEY",
    configuration: configuration
)
```

#### Android SDK

4.4.4 及以上版本支持（建议升级到最新版）

```java
// 配置 SDK 储存
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.API, "https://xxx.example.com");
// 配置 SDK 云引擎
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.ENGINE, "https://xxx.example.com");
// 配置 SDK 推送
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.PUSH, "https://xxx.example.com");
// 配置 SDK 即时通讯
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.RTM, "https://xxx.example.com");
// 初始化应用
AVOSCloud.initialize(this,APP_ID,APP_KEY);
```

#### Java Unified SDK

```java
import cn.leancloud.core.AVOSService;

// 配置 SDK 储存
AVOSCloud.setServer(AVOSService.API, "https://xxx.example.com");
// 配置 SDK 云引擎
AVOSCloud.setServer(AVOSService.ENGINE, "https://xxx.example.com");
// 配置 SDK 推送
AVOSCloud.setServer(AVOSService.PUSH, "https://xxx.example.com");
// 配置 SDK 即时通讯
AVOSCloud.setServer(AVOSService.RTM, "https://xxx.example.com");
// 初始化应用
AVOSCloud.initialize(this,APP_ID,APP_KEY);
```

#### .NET SDK

```cs
// 配置存储和云引擎
AVClient.Initialize(new AVClient.Configuration {
                ApplicationId = appId,
                ApplicationKey = appKey,
                ApiServer = new Uri("https://xxx.example.com"),
                EngineServer = new Uri("https://xxx.example.com")
            });
// 通过 RTM Router 配置即时通讯
var realtime = new AVRealtime(new AVRealtime.Configuration
           {
                ApplicationId = "app-id",
                ApplicationKey = "app-key",
                RTMRouter = new Uri("https://xxx.example.com")
           });
```

##### 多人在线对战

```cs
var client = new Client(appId, appKey, userId, playServer: "https://xxx.example.com");
```

#### PHP SDK

```php
use \LeanCloud\Client;
Client::initialize(appId, appKey, masterKey);
Client::setServerUrl("https://xxx.example.com")
```

另外，PHP 也可以设置环境变量 `LEANCLOUD_API_SERVER` 为 `https://xxx.example.com` （设置环境变量后无需在初始化语句中调用 `setServerUrl`。

#### Python SDK

设置环境变量 `LC_API_SERVER` 为 `https://xxx.example.com`

#### 云引擎

云引擎自身可以绑定云引擎自定义域名，云引擎内部访问 API 是通过内网，所以我们强烈建议不要改动。（如果将云引擎内部运行的代码改用 API 自定义域名，反而无法走内网，会变成公网访问，影响性能。）

当然，如果在云引擎托管网站，其中的客户端 JavaScript 访问 LeanCloud API，仍然需要按照上面 JavaScript SDK 中的方法切换域名。

## 接入备案

根据法律法规的规定，需要将域名备案接入 LeanCloud。

如果您的主域名已在 LeanCloud 备案，那么其子域名无需再次备案。例如，之前主域名已在 LeanCloud 备案的情况下，您的域名 `example.com` 已在 LeanCloud 备案，那么绑定 `example.com` 下的子域名为 API 自定义域名无需再次备案。

如果您的主域名未在 LeanCloud 备案，那么您需要接入绑定的  API 子域名。

接入备案需要 **使用应用所属账号的绑定邮箱** 给 support@leancloud.rocks 信箱发送 **邮件主题为「【API 域名备案接入】企业名称」** 的邮件，提交相关资料：

1. 网站备案号、ICP 备案密码
2. 主办单位性质
3. 需要接入备案的 API 子域名、电子邮箱、网站负责人手机号码、营业执照号码、法人代表身份证号码、网站负责人身份证号码
4. 100 KB 以下，清晰可见的彩色扫描件图片：主办单位证件（企业营业执照，民办非企业单位上传组织机构代码证书）、法人代表身份证正反面、网站负责人的身份证正反面、域名证书。
5. 快递收件信息，包括收件人、收件人手机号码、收件地址、邮编，用于接收备案幕布。

我们收到资料后会提交初审，初审通过后会给您寄送幕布，并告知您复审所需的电子资料。复审通过后资料将提交管局，待当地管局审核通过后（一般 15 个工作日左右），我们会通知您。

由于目前华北节点仅支持绑定已备案域名为 API 自定义域名，因此我们这里就不详细列出主办单位性质、幕布照片等的具体要求了，这些细节都和办理域名备案一样。办理备案接入和新办备案的区别主要是需要额外提供网站备案号、ICP 备案密码，办理期间不用关站。另外，办理接入备案也不会影响原接入服务商继续提供服务。