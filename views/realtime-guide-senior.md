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

### 遗愿消息

### 实时音视频

目前即时通讯服务还不支持，我们推荐如下几个产品结合即时通讯服务可以实现一个企业级的即时通信应用：

1. [声网](https://www.agora.io/cn/)
2. [ZEGO即构科技](https://www.zego.im)

相关的产品在市场上还有很多，都可以很方便地与 LeanCloud 即时通讯结合起来。


{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "基础入门", href: "realtime-guide-beginner.html" }, 
  { title: "进阶功能", href: "realtime-guide-intermediate.html"}])
}}