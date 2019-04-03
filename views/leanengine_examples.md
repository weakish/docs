# 云引擎项目示例

## 示例项目 / 项目骨架

我们为每种语言维护了一个示例项目，包含了推荐的骨架代码，建议大家从这几个项目开始新项目的开发：

- [node-js-getting-started](https://github.com/leancloud/node-js-getting-started/)
- [python-getting-started](https://github.com/leancloud/python-getting-started)
- [slim-getting-started](https://github.com/leancloud/slim-getting-started)（PHP）
- [java-war-getting-started](https://github.com/leancloud/java-war-getting-started)
- [dotNET-getting-started](https://github.com/leancloud/dotNET-getting-started)

## Node.js 云引擎 Demo 仓库

[leanengine-nodejs-demos](https://github.com/leancloud/leanengine-nodejs-demos) 是 LeanEngine Node.js 项目的常用功能和示例仓库。包括了推荐的最佳实践和常用的代码片段，每个文件中都有较为详细的注释，适合云引擎的开发者阅读、参考，也可以将代码片段复制到你的项目中使用。

在这个仓库的 README 中有详细的功能列表和介绍。

## OAuth 授权验证回调服务器

开发过微博应用或者是接入过 QQ 登录的应用都需要在后台设置一个回调服务器地址，用来接收回调信息，关于为什么需要回调服务器这个请阅读 [OAuth 2 官方文档](http://oauth.net/2/)。

许多用户在云引擎 LeanEngine 上托管了自己的网站，因为他们在制作登录页面的时候，需要实现微博登录这样的第三方登录的功能，因此如果在 LeanEngine 部署回调服务器可以节省成本，快速实现需求。

<a href="webhosting_oauth.html" class="btn btn-default">阅读</a>

## 微信自动问答机器人

微信开发是时下大热的开发趋势。很多团队在进行市场推广以及用户渗透的时候，要借助微信用户群做一些符合自己需求的定向开发。例如，航空公司可以通过微信公众号向乘客推送行程信息，银行可以及时发送消费和余额变动信息等。借助云引擎提供的代码托管功能，你可以设置让微信后台将用户所发送信息转发至云引擎，使用部署在上面的代码进行处理后，再调用微信接口进行回复。

下面是一个用于演示的例子。

1. 扫码关注这个微信公众号<br/>
  <img src="images/leanengine-weixin-qrcode.png" width="200">
2. 向这个公众号发送一条消息：**说个笑话**。
3. 你会收到机器人回复的消息。

<a href="webhosting_weixin.html" class="btn btn-default">阅读</a>
