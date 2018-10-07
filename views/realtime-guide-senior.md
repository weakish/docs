{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

# 即时通讯开发指南 &middot; 高阶技巧

## 阅前准备

建议先按照顺序阅读如下文档之后，再阅读本文效果最佳：

- [即时通信服务总览](realtime_v2.html)
- [即时通讯开发指南 &middot; 基础入门](realtime-guide-beginner.html)
- [即时通讯开发指南 &middot; 进阶功能](realtime-guide-intermediate.html)

## 消息

### 敏感词过滤

敏感词在[即时通信服务总览#敏感词过滤](realtime_v2.html#敏感词过滤)有介绍，这是默认选项，而一些特殊场景中，可能会有一些自定义敏感词的需求，因此在控制台->消息->设置页面可以开关这个功能，并且还可以提交自定义敏感词的词库。


### 遗愿消息

### 实时音视频

目前即时通讯服务还不支持，我们推荐如下几个产品结合即时通讯服务可以实现一个企业级的即时通信应用：

1. [声网](https://www.agora.io/cn/)
2. [ZEGO 即构科技](https://www.zego.im)

相关的产品在市场上还有很多，都可以很方便地与 LeanCloud 即时通讯结合起来。


## Hook 
即时通信服务通过云引擎服务可以实现 Hook 函数的功能：

> 开发者在服务端定义一些 Hook 函数，在对话创建/消息发送等函数被调用的时候，即时通信服务会调用这些 Hook 函数，让开发者更自由的控制业务逻辑。


举个例子，做一个游戏聊天系统的时候，要合理地屏蔽一些竞争对手游戏的关键字，以下是使用云引擎支持的各种服务端编程语言实现这个函数的代码：

```js
```
```python
```
```java
```
```php
```
```cs
```

而实际上启用上述代码之后，一条消息的时序图如下：

```seq
SDK->Cloud: 1.发送消息
Cloud-->Engine: 2.触发 _messageReceived hook 调用
Engine-->Cloud: 3.返回 hook 函数处理结果
Cloud-->SDK: 4.将 hook 函数处理结果发送给接收方
```


## 安全与权限

即时通讯采用基于签名的权限控制，关于签名的基本概念请阅读[即时通信服务总览-权限和认证](realtime_v2.html#权限和认证)。

### 对话的权限控制

#### 踢人/加人权限


### 黑名单




{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "基础入门", href: "realtime-guide-beginner.html" }, 
  { title: "进阶功能", href: "realtime-guide-intermediate.html"}])
}}