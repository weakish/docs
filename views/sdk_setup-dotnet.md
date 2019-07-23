{% import "views/_helper.njk" as docs %}
[unity-storage]: https://releases.leanapp.cn/#/leancloud/unity-sdk/releases
[unity-im]: https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases

# C# SDK 安装指南

## 安装

### Unity

- 支持 Unity 5.3+。
<!-- 等升级 Unity 即时通讯的文档后再增加这句话 -->
<!-- - 支持 .NET 4.x。SDK 在 .NET 3.x 版本下仅做 Bug 维护，不再增加新版本，请大家尽快升级到 4.x 版本。 -->

支持使用 Unity 开发的 iOS、Android、Windows Phone 8、Windows Store、Windows Desktop，以及网页游戏。

#### 安装数据存储
请下载 [Unity Storage][unity-storage] 最新版本的 zip 包，解压之后导入到你的 Unity 项目中。

#### 安装即时通讯
请下载 [Unity Realtime][unity-im] 最新版本的 zip 包，解压之后导入到你的 Unity 项目中。

#### 依赖详解

安装包解压之后，每一个依赖的详细说明如下：

名称|模块描述|必选
--|---|---
`AssemblyLister.dll`|LeanCloud 依赖检测模块，它负责检查相关依赖是否正确加载|是
`LeanCloud.Core.dll`|核心库，里面包含了 AVObject 和 AVUser 等所有内置类型的定义和序列化相关操作的功能|是
`LeanCloud.Storage.dll`|存储库，里面包含本地缓存以及 HTTP 请求发送的实现|是
`LeanCloud.Realtime.dll`|即时通讯库，里面包含了即时通讯协议的实现以及相关接口|否

### .NET Framework & Xamarin

.NET Framework 支持以下运行时：

- Classic Desktop 4.5+
- Windows 10
- Windows Phone 不再支持
- UWP 4.5+
- .NET Core 2.0+

Xamarin 请确保你的项目至少满足如下版本需求：

- [Xamarin.Android 4.7+](https://developer.xamarin.com/releases/ios/xamarin.ios_6/xamarin.ios_6.3/)
- [Xamarin.iOS 6.3](https://developer.xamarin.com/releases/android/xamarin.android_4/xamarin.android_4.7/)

在 Visual Studio 执行安装 nuget 依赖：

```sh
# 安装存储，必选
PM> Install-Package LeanCloud.Storage
# 安装 LiveQuery，可选，如果需要实时数据同步功能则需要安装
PM> Install-Package LeanCloud.LiveQuery
# 安装即时通讯，可选，如果需要接入聊天则需要安装
PM> Install-Package LeanCloud.Realtime
```

## 初始化 SDK

### 导入 SDK
导入基础模块

```cs
// 导入存储模块
using LeanCloud;
// 如果需要，导入聊天模块
using LeanCloud.Realtime;
```

#### 数据存储初始化

在使用「数据存储」服务前，调用如下代码：

```cs
// 如果只使用存储可以使用如下初始化代码 
AVClient.Initialize("{{appid}}", "{{appkey}}");
```

#### 即时通讯初始化

在使用「即时通讯」服务前，调用如下代码：

```cs
var realtime = new AVRealtime("{{appid}}", "{{appkey}}");
```

### 开启调试日志

在应用开发阶段，你可以选择开启 SDK 的调试日志（debug log）来方便追踪问题。调试日志开启后，SDK 会把网络请求、错误消息等信息输出到 IDE 的日志窗口。

```cs
// 开启存储日志
AVClient.HttpLog(Debug.Log);

// 开启即时通讯日志
AVRealtime.WebSocketLog(Debug.Log);
```

{{ docs.alert("在应用发布之前，请关闭调试日志，以免暴露敏感数据。") }}





<!-- #### 私有部署

针对私有部署的服务器地址是根据部署之后的域名而对应生成的，因此在初始化 SDK 的时候需要单独配置服务器地址。

`AVClient.Configuration` 包含了如下属性：

属性名|含义|示例
--|--|--
ApiServer|数据存储服务的私有部署地址|https://abc-api.xyz.com
PushServer|推送服务的私有部署地址|https://abc-push.xyz.com
StatsServer|统计服务的私有部署地址|https://abc-stats.xyz.com
EngineServer|云引擎（云函数）私有部署地址|https://engine-stats.xyz.com

与即时通讯相关的私有部署配置 `AVRealtime.Configuration` 包含了如下属性：

属性名|含义|示例
--|--|--
RTMRouter|分配最终 WebSocket 地址的云端路由地址|https://abc-rtmrouter.xyz.com
RealtimeServer|最终的 WebSocket 地址|wss://abc-wss.xyz.com

注意：当设置了 `RealtimeServer` 之后，它拥有最高优先级，SDK 不会再去请求 `RTMRouter` 来申请动态（负载均衡）的 WebSocket 地址。

##### 私有部署示例

假设购买了数据存储和即时通讯的私有部署，在私有部署的相关配置手册上我们会给出最终生产环境的地址，例如：

- 数据存储地址 (Api Server)：https://abc-api.xyz.com
- 即时通讯地址云端路由地址为 (RTM Router)：https://abc-rtmrouter.xyz.com

在 SDK 初始化时需要进行如下设置：

数据存储服务：
```cs
AVClient.Initialize(new AVClient.Configuration
{
    ApplicationId = "{{appid}}",
    ApplicationKey = "{{appkey}}",
    ApiServer = new Uri("https://abc-api.xyz.com") // 告知 SDK 所有的数据存储服务请求都发往这个地址
});
```
即时通讯服务：

```cs
var realtime = new AVRealtime(new AVRealtime.Configuration
{
    ApplicationId = "{{appid}}",
    ApplicationKey = "{{appkey}}",
    RTMRouter = new Uri("https://abc-rtmrouter.xyz.com") // 告知 SDK 去这个地址请求动态的 WebSocket 地址
});
```

也存在一种可能性，私有部署中根据用户需求只部署了一台 WebSocket 服务器作为即时通讯服务器。假如配置手册上给出的内容如下：

- 数据存储地址(Api Server)：https://abc-api.xyz.com
- 即时通讯地址(RTM Router): wss://abc-wss.xyz.com

在配置即时通讯的时候需要做如下修改：

```cs
var realtime = new AVRealtime(new AVRealtime.Configuration
{
    ApplicationId = "{{appid}}",
    ApplicationKey = "{{appkey}}",
    RealtimeServer = new Uri("wss://abc-wss.xyz.com") // 告知 SDK 直接连这个地址的 WebSocket 服务，不用再去请求 RTMRouter 了
});
``` -->
