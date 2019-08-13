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
| API 域名 | 存储、即时通讯、短信、推送、**云函数** | 必须 | 必须 | 可选 | 不支持 | 不支持 | 应用 | 是 |

说明：

0. 每个域名只能绑定到一个应用的一种服务，可以使用同一主域名下不同的子域名。
1. API 域名需要启用 SSL，由于目前自动申请 SSL  证书的功能尚未开发完成，目前控制台暂时可以选择不启用 SSL，待自动申请证书功能完成后，我们将移除不启用 SSL 选项。
2. 为了避免影响同一域名下的其他子域名的解析，文件域名和 API 域名不支持直接绑定裸域名（例如 `example.com`）。
3. 考虑到部分用户希望云引擎网站托管的 URL 尽量简短，云引擎网站托管服务支持直接绑定裸域名，直接绑定时使用 A 记录（其他情况下域名绑定均使用 CNAME）。由于 IP 可能发生变动，因此我们不建议在云引擎网站托管服务上直接绑定裸域名。
4. 绑定目标中的「分组」指应用下的云引擎实例分组的生产环境。
5. 可绑定多个域名指在一个应用（文件域名、API 域名）或分组（云引擎域名）上可以绑定多个域名。

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

更换文件域名后，之前保存在 `_File` 表中的文件 URL 不会自动更新。
类似地，即时通讯历史消息中的 URL 也不会自动更新。
所以，更换文件域名后，需要在客户端自行实现相应的替换逻辑。

之前使用 LeanCloud 公共文件域名的旧应用，在绑定文件域名后，现存的使用共享域名的 URL 仍然可以访问。

国际版暂不支持绑定自有域名。

## 云引擎域名

使用云引擎网站托管服务的应用，即申请了[云引擎内置域名](leanengine_webhosting_guide-node.html#设置域名)的应用，需要前往[应用控制台 > 账号设置 > 域名绑定](/dashboard/settings.html#/setting/domainbind)绑定云引擎域名。

如前所述，仅使用云函数的应用，无需绑定云引擎域名，不过需要绑定 API 域名。

云引擎测试环境实例目前还无法在开发者控制台自助绑定域名，我们会尽快解决。

国际版同样支持绑定云引擎域名（无需备案）。

## API 域名

如果你使用了以下服务：

- 结构化数据存储
- 云函数
- 即时通讯

那么你需要前往[应用控制台 > 存储 > 设置 >  自定义 API 服务域名](/dashboard/storage.html?appid={{appid}}#/storage/conf) 绑定 API 域名。 

只使用推送和短信功能的应用目前不强制要求绑定域名，但我们仍然建议用户绑定自己的 API 域名，以免受到共享域名可用性的影响。

已绑定自有域名的应用，旧版本客户端仍可继续访问原来由 LeanCloud 提供的域名，但我们不对共享域名的可用性做保证。

目前，绑定 API 域名后，即时通讯，Live Query 以及多人对战的 WebSocket 连接暂时仍会使用共享域名。我们后续会支持这类 WebSocket 连接使用自有域名。

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

云引擎内部访问 API 是通过内网，**请勿在云引擎网站托管的 Java 项目中 setServer**，否则请求会走公网，影响性能。

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

云引擎内部访问 API 是通过内网，**请勿在云引擎网站托管的 PHP 项目中 setServerUrl**，否则请求会走公网，影响性能。

#### Python SDK

设置环境变量 `LC_API_SERVER` 为 `https://xxx.example.com`。

云引擎内部访问 API 是通过内网，**云引擎网站托管的 Python 项目无需配置**，否则请求会走公网，影响性能。

## 备案

根据法律法规的规定，在 LeanCloud 备案的域名，适用于文件、云引擎、API 域名绑定。在别处备案的域名，适用于文件域名绑定，云引擎、API 还需要接入备案。

主域名已在 LeanCloud 备案的情况下，子域名不需要额外备案或接入备案；主域名在别处备案的，如需在云引擎、API 使用子域名，还需在 LeanCloud 接入备案子域名。

云引擎域名备案之前要求云引擎已经部署，并且网站内容和备案申请的内容一致。

商用版应用的域名如果没有 ICP 备案，或者需要接入备案，请进入 [应用控制台 > 账号设置 > 域名备案](/dashboard/settings.html#/setting/domainrecord)，按照步骤填写资料。

没有商用版应用的用户如果需要协助备案或接入备案，需要支付 600 元服务费。请[在此提交备案相关资料][temp]，同时发送邮件至 support@leancloud.rocks 和我们联系。有商用版应用的用户此项服务免费。

[temp]: https://jinshuju.net/f/17C29c