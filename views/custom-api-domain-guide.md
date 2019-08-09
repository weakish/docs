# 域名绑定指南

根据法律法规和有关部门的要求，使用 LeanCloud 服务需要绑定自有域名。
绑定自有域名也有利于从域名层面做好应用隔离，确保业务稳定。

这篇指南假定你了解域名解析的基本知识，如果你不太熟悉这方面的内容，可以参考我们博客上的[这篇文章][basic]。

[basic]: https://leancloudblog.com/Domain-Name-Story-confirm/

## 自定义域名的种类

LeanCloud 服务涉及以下三种自定义域名：

| 域名种类 | 涉及服务 | 备案 | 在 LeanCloud 备案或接入备案 | SSL | 二级域名（SLD）| A 记录 | 绑定目标 | 可绑定多个域名 | 
| - | - | - | - | - | - | - | - | - | 
| 文件域名 | 文件服务 | 必须 | 可选 | 可选 | 不支持 | 不支持 | 应用 | 否 |
| 云引擎域名 | 云引擎 **网站托管** | 必须 | 必须 | 可选 | 支持 | 分组 | 是 |
| API 域名 | 存储、即时通讯、推送、**云函数** | 必须 | 必须 | 可选 | 不支持 | 不支持 | 应用 | 是 |

说明：

1. API 域名需要启用 SSL，由于目前自动申请 SSL  证书的功能尚未开发完成，目前控制台暂时可以选择不启用 SSL，待自动申请证书功能完成后，我们将移除不启用 SSL 选项。
2. 二级域名（SLD）的意思是直接绑定二级域名（裸域名），为了避免影响同一域名下的其他子域名的解析，文件域名和 API 域名不支持直接绑定二级域名。
3. 考虑到部分用户需要在云引擎网站托管服务上直接绑定二级域名（这样 URL 比较简短），云引擎网站托管服务支持直接绑定二级域名，直接绑定时使用 A 记录（其他情况下域名绑定均使用 CNAME）。由于 IP 可能发生变动，因此我们不建议在云引擎网站托管服务上直接绑定二级域名。
4. 绑定目标中的「分组」指应用下的云引擎实例分组的生产环境。

## CNAME 设置

绝大部分情况下，绑定域名均需要设置 CNAME，因此这里我们简单解释下如何设置 CNAME。

域名绑定成功后，需要设置域名的 CNAME。控制台会提示 CNAME 的地址，按照控制台的提示到域名注册商或域名解析服务提供商处设置（如果自己架设域名解析服务器的话，请根据域名解析服务器文档配置）。

例如，控制台提示：

> 域名绑定成功后，请将域名 `CNAME` 到 `leancloud.example`

那么对应的 DNS Zone 记录为：

```
xxx.example.com.	3600	IN	CNAME	`leancloud.example`
```

其中 3600 为 TTL，可根据自己的需要设置。
大多数域名注册商或域名解析服务提供商都提供图形化的设置界面，按照其说明配置即可。

### 文件域名

如果你的应用使用了 LeanCloud 文件服务，请前往 [控制台 > 存储 > 设置 > 自定义文件域名](/dashboard/storage.html?appid={{appid}}#/storage/conf) 绑定文件域名。

注意，即使您并未使用 LeanCloud 的结构化数据存储服务，但是使用了即时通讯的多媒体消息（图像、音频、视频等），那么就有可能使用了文件服务。
一个简单的判断方法是查看到控制台查看你的应用的 [存储 > 数据][_File] 页面，如果 `_File` 表中有数据，就表明你的应用使用了文件服务。

[_File]: /dashboard/data.html?appid={{appid}}#/_File

绑定文件域名时，可以选择是否启用 HTTPS：

- 不启用 HTTPS，则客户端只能通过 HTTP 访问。

- 启用 HTTPS 后，客户端同时可以通过 HTTPS 和 HTTP 访问文件。但是，受限于文件服务提供商，无论客户端使用 HTTP URL 还是 HTTPS URL 访问：

  - 启用 HTTPS 域名的自定义文件域名的流量均按照 HTTPS 流量计费。
  - 同理，应用控制台的文件流量统计也总是归入 HTTPS 流量。

更换文件域名后，之前保存在 `_File` 表中的文件 URL 不会自动更新。
类似地，即时通讯历史消息中的 URL 也不会自动更新。
所以，更换文件域名后，需要在客户端自行实现相应的替换逻辑。

之前使用 LeanCloud 公共文件域名的旧应用，在绑定文件域名后，现存的使用公共域名的 URL 仍然可以访问。

### 云引擎域名

使用云引擎网站托管服务的应用，即申请了[云引擎内置域名](leanengine_webhosting_guide-node.html#设置域名)的应用，需要前往[应用控制台 > 账号设置 > 域名绑定](/dashboard/settings.html#/setting/domainbind)绑定云引擎域名。

如前所述，仅使用云函数的应用，无需绑定云引擎域名。
但是，需要绑定 API 域名。

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