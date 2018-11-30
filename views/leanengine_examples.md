# 云引擎项目示例

## 示例项目 / 项目骨架

我们为每种语言维护了一个示例项目，包含了推荐的骨架代码，建议大家从这几个项目开始新项目的开发：

- [node-js-getting-started](https://github.com/leancloud/node-js-getting-started/)
- [python-getting-started](https://github.com/leancloud/python-getting-started)
- [slim-getting-started](https://github.com/leancloud/slim-getting-started)（PHP）
- [java-war-getting-started](https://github.com/leancloud/java-war-getting-started)
- [dotNET-getting-started](https://github.com/leancloud/dotNET-getting-started)

## Node.js 小 Demo 合集

[leanengine-nodejs-demos](https://github.com/leancloud/leanengine-nodejs-demos) 中包含了大量小的功能点：

- 一个完整的 Todo List 项目，基于云存储实现数据的增、删、改、查，并使用 ACL 来保护数据。
- 一个用户系统，基于云存储实现用户的注册、登录、登出。
- 批量更新或删除对象。
- 从客户端或运行环境获取元信息。
- 图片处理（imagemagick）、WebSocket。
- 更多……

该项目包括了推荐的最佳实践和常用的代码片段，每个文件中都有较为详细的注释，适合云引擎的开发者来阅读和参考，所涉及的代码片段也可以直接复制到项目中使用。

## LeanCache 常见场景示例

<div class="callout callout-danger">抢红包、游戏排名、秒杀购物等场景，强烈建议使用 LeanCache。</div>

LeanCache 的示例位于 [leanengine-nodejs-demos](https://github.com/leancloud/leanengine-nodejs-demos/tree/master/lean-cache) 的 `lean-cache` 文件夹中，包括

* **关联数据缓存**：缓存一些数据量少、查询频繁、不常修改、关联结构复杂的关联数据。
* **图形验证码**：利用图形验证码保护短信发送接口。
* **排行榜缓存**：维护一个用户游戏分数的排行榜，并在次日将榜单归档到云存储中。
* **热点只读数据缓存**：将几乎只读的配置（例如购物网站的商品分类信息）通过 Class Hook 缓存在 Redis。
* **节点选举和锁**：多个任务共同竞争一个资源（锁），确保同一时间只有一个任务能够在执行（持有这个锁）。

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

## 即时通讯云引擎签名 Demo

LeanCloud 即时通讯服务采用 [签名方式](realtime_v2.html#权限和认证) 与用户系统对接。当客户端进行与权限、认证相关的操作时，客户端需要首先向用户系统发起请求获得一个签名，再把签名发送到 LeanCloud 即时通讯服务，从而帮助 LeanCloud 确认请求是否有效，其机制与 OAuth 1.0 类似。本 Demo 仅仅演示签名，并不包含实际业务逻辑，在实际应用中你需要根据业务做相应的检查。

<a href="https://github.com/leancloud/realtime-messaging-signature-cloudcode" class="btn btn-default">阅读</a>
