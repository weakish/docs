{% import "views/_helper.njk" as docs %}
{% import "views/_im.md" as imPartial %}

# 即时通讯开发指南 · Unity（C#）

## 准备工作

### 开发工具

<dl><dt>Unity 5.3.x 以上的版本</dt>
<dd>这个是因为在 Unity 5.3 之后，官方使用 UnityWebRequest 取代了原有的 WWW 类作为 HTTP 请求的客户端，因此 LeanCloud SDK 在即时通讯上是使用了 UnityWebRequest 来获取云端分配的 WebSocket 链接地址。</dd>
<dt>Visual Studio 2015 以上的版本</dt>
<dd>微软针对 Unity 有一个工具包可以让 Unity 和 Visual Studio 联调，详细请看[使用 Visual Studio Tools for Unity](https://msdn.microsoft.com/zh-cn/library/dn940020.aspx)，因此建议用户在 Windows 上开发 Unity 的体验会更好，当然在 Mac OS 以及其他操作系统上开发也没有任何问题。</dd>

### .NET 4.5+ 编程知识
Unity 支持 Mono 使用 .NET 语言来实现跨平台开发的解决方案，所以 LeanCloud 采用了 C# 来实现客户端的 SDK。如果你有 .NET 方面的编程经验，就很容易掌握 LeanCloud Unity SDK 接口的风格和用法。

LeanCloud Unity SDK 在很多重要的功能点上都采用了微软提供的[基于任务的异步模式 (TAP)](https://msdn.microsoft.com/zh-cn/library/hh873175.aspx)，所以如果你具备 .NET Framework 4.5 的开发经验，或对 .NET Framework 4.5 的 新 API 有所了解，将有助于快速上手。

### LeanCloud 即时通讯概览

在继续阅读本文档之前，请先阅读[《即时通讯概览》](realtime_v2.html)，了解一下即时通讯的基本概念和模型。

### WebSocket 协议
LeanCloud 即时通讯是基于 WebSocket 和私有通讯协议实现的一套聊天系统，因此开发者最好提前了解一下 WebSocket 协议的相关内容。推荐没有接触过的开发者可以阅读《[WebSocket 是什么原理？为什么可以实现持久连接？- Ovear 的回答](http://zhihu.com/question/20215561/answer/40316953)》。

## 安装 SDK

### 下载和导入

最新版本的 SDK 下载地址：<https://github.com/leancloud/realtime-SDK-dotNET/> 或选择 [SDK 镜像地址](https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases)，下载时请选择最新版本即可。例如 `LeanCloud-Unity-Realtime-SDK-20170330.3.zip`，代表这个版本是 2017 年 3 月 30 日当天的第 3 次自动化发布。

下载之后解压，把里面包含的所有的 Dll 文件（除去 `UnityEngine.dll`）都引入到 Unity 的 `Assets/LeanCloud` 文件夹（在 `Assets` 下面新建一个 `LeanCloud` 文件夹用来存放 LeanCloud SDK）下即可。

### 初始化
初始化**必须**在某个 GameObject 上挂载 `AVRealtimeBehavior`(在 LeanCloud.Realtime 命名空间下)，如下图：

![AVRealtimeBehavior](images/unity/avrealtimeinitializebehaviour.png)

### 打开调试日志
```cs
AVRealtime.WebSocketLog(UnityEngine.Debug.Log);
```

## 开发指南

按功能区分，大家可以参考如下文档：
- [第一章：从简单的单聊、群聊、收发图文消息开始](realtime-guide-beginner.html)
- [第二章：消息收发的更多方式，离线推送与消息同步，多设备登录](realtime-guide-intermediate.html)
- [第三章：安全与签名、黑名单和权限管理、玩转聊天室和临时对话](realtime-guide-senior.html)
- [第四章：详解消息 hook 与系统对话，打造自己的聊天机器人](realtime-guide-systemconv.html)

