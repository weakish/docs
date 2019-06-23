现在华北节点支持绑定 API 自定义域名。你可以在控制台的「存储 -> 设置 -> 自定义 API 服务域名」中提供一个 **已备案** 的域名（如需开启 HTTPS 还需提供对应的证书）来自助绑定。

## 自定义域名的适用范围

自定义域名目前可用于访问以下 API 服务：

- 数据存储
- 短信
- 推送
- 云函数

自定义域名不适用以下 API 服务：

- 即时通讯的 web socket （绑定自定义域名后仍旧使用 `avoscloud.com`）

另外，以下服务使用独立的自定义域名：

- 云引擎网站托管
- 文件存储服务

换句话说，如果之前在这两个服务上绑定过自定义域名，现在想绑定 API 自定义域名，那么需要在 API 上绑定另一个域名（包括不同的子域名）。

## CNAME 设置

以下部分假定绑定的自定义域名是 `xxx.example.com`。

如上所述，你可以在控制台的「存储 -> 设置 -> 自定义 API 服务域名」中绑定一个 **已备案** 的域名：


填入要绑定的子域名（强烈建议使用子域名，例如 `xxx.example.com`，而不是直接绑定裸域名 `xxx.example.com`，以免影响 `xxx.example.com` 下其他子域名的解析），如果选择「启用 https」，那么还需要提交证书和私钥文件。然后点击「绑定」按钮即可。

域名绑定成功后，需要设置域名的 CNAME。控制台会提示 CNAME 的地址，按照控制台的提示到域名注册商或域名解析服务提供商处设置（如果自己架设域名解析服务器的话，请根据域名解析服务器文档配置）。

例如，控制台提示：

> 域名绑定成功后，请将域名 `CNAME` 到 `avoscloud.com`

那么对应的 DNS Zone 记录为：

```
xxx.example.com.	3600	IN	CNAME	avoscloud.com.
```

其中 3600 为 TTL，可根据自己的需要设置。
大多数域名注册商或域名解析服务提供商都提供图形化的设置界面，按照其说明配置即可。

## 更新应用代码

绑定自定义域名后，需要更新应用的代码以使用自定义域名。

注意，绑定自定义域名后，原 `avoscloud.com` 域名仍然有效。
换言之，绑定自定义域名后，既可以通过自定义域名访问 API 服务，也可以通过 `avoscloud.com` 域名访问 API 服务。
所以，如果您之前已经按照临时解决方案在代码中切换域名至 `avoscloud.com`，那么不必担心绑定自定义域名会影响访问 API 服务，可以平滑过渡。

以下部分假定绑定的自定义域名是 `xxx.example.com`，且开启了 HTTPS。

## REST API

客户端访问 REST API，需要在代码中将 `api.leancloud.cn` 或 `{{appid 前八位}}.api.lncld.net` 域名替换为 `xxx.example.com`。

客户端通过 REST API 访问云函数，需要将 `{{appid 前八位}}.engine.lncld.net` 替换为 `xxx.example.com`。

## SDK

客户端 SDK 需要进行如下修改：（注意，只有较新版本的 SDK 才支持设定 API 服务器地址）

### JavaScript SDK

存储 SDK（3.0.0 以上支持，建议升级到 3.11.1 以上，详情见下）

```js
AV.init({
  // appId, appKey,
  serverURLs: 'https://xxx.example.com',
  // 如果需要使用 LiveQuery，那么还需要加下面的配置
  // LiveQuery 只支持开启 HTTPS 的自定义域名 
  realtime: new AV._sharedConfig.liveQueryRealtime({
    appId,
    appKey,
    server: 'xxx.example.com',
  }),
});
```

`>= 3.5.5, < 3.11.1` 的应用可能会碰到仍然使用缓存默认配置的 bug，
更新后应用打开的第一次请求可能失败。

`>= 3.0.0, < 3.5.5` 的应用 **不能按上述方法设置**，需要使用如下的写法：

```js
AV.init({
  // appId, appKey,
  serverURLs: {
    push: 'https://xxx.example.com',
    stats: 'https://xxx.example.com',
    engine: 'https://xxx.example.com',
    api: 'https://xxx.example.com',
  },
  // LiveQuery 配置参考上文
});
```

即时通讯 SDK （4.0.0 以上支持，不支持未启用 HTTPS 的自定义域名）

```js
new Realtime({
  // appId, appKey,
  server: 'xxx.example.com',
};
```

#### 微信小程序白名单中增加：

```
存储：
request：https://xxx.example.com

即时通讯：
request：https://xxx.example.com/
Socket：
wss://cn-n1-cell1.avoscloud.com,
wss://cn-n1-cell2.avoscloud.com,
wss://cn-n1-cell5.avoscloud.com,
wss://cn-n1-cell7.avoscloud.com

多人在线对战：
Request：https://game-router-cn-n1.avoscloud.com/
Socket：
wss://cn-n1-wechat-mesos-cell-1.avoscloud.com
wss://cn-n1-wechat-mesos-cell-2.avoscloud.com
wss://cn-n1-wechat-mesos-cell-3.avoscloud.com
wss://cn-n1-wechat-mesos-cell-4.avoscloud.com
```

### iOS SDK

#### Objective-C SDK

```objc
// 配置 SDK 储存
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleAPI];
// 配置 SDK 推送
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModulePush];
// 配置 SDK 云引擎
[AVOSCloud setServerURLString:@"https://exmaple.com" forServiceModule:AVServiceModuleEngine];
// 配置 SDK 即时通讯
[AVOSCloud setServerURLString:@"https://xxx.example.com" forServiceModule:AVServiceModuleRTM];
// 初始化
[AVOSCloud setApplicationId:APP_ID clientKey:APP_KEY];
```

#### Swift SDK （16.1.0 以上）

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

### Android SDK

```java
// 配置 SDK 储存
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.API, "https://xxx.example.com");
// 配置 SDK 云引擎
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.ENGINE, "https://xxx.example.com");
// 配置 SDK 推送
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.PUSH, "https://xxx.example.com");
// 配置 SDK 即时通讯
AVOSCloud.setServer(AVOSCloud.SERVER_TYPE.RTM, "https://xxx.example.com");
// 初始化
AVOSCloud.initialize(this,APP_ID,APP_KEY);
```

### .NET SDK

```cs
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

### PHP SDK

```php
use \LeanCloud\Client;
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
Client::setServerUrl("https://xxx.example.com")
```

另外，PHP 也可以设置环境变量 `LEANCLOUD_API_SERVER` 为 `https://xxx.example.com` （设置环境变量后无需在初始化语句中调用 `setServerUrl`。

### Python SDK

设置环境变量 `LC_API_SERVER` 为 `https://xxx.example.com`


## 云引擎

云引擎自身可以绑定域名，云引擎内部访问 API 是通过内网，不受此次域名不可用事件影响，所以不用改动。