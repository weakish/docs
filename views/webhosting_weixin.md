# 微信公众平台开发指南

随着微信逐渐开放的数据接口，开发者可以设置自定义的服务器地址，微信的服务端会把用户发送给公众号的消息转发到开发者自定义的服务器上，并且开发者可以调用接口进行回复，这就成就了基于微信进行二次开发的可能性。

把微信和云引擎 LeanEngine 的 [网站托管（Web Hosting）功能](leanengine_webhosting_guide-node.html) 结合起来，就可以做出一个几乎零成本的微信公众号自动问答的机器人了。

## 场景设定
本文的主要目的是指导开发者使用云引擎作为微信公众号的回调服务器，因此我们设定了如下场景：实现一个自动根据用户发送消息做简单回复的机器人 Bob，当用户发送信息「你好」，Bob 就会自动回复「您好，大家好才是真的好！」。


## 注册微信公众号
微信公众号向个人开放，也就是所谓的自媒体。

- 注册微信公众号：<https://mp.weixin.qq.com/cgi-bin/readtemplate?t=register/step1_tmpl&lang=zh_CN>
- 注册教程：[微信公众平台注册步骤示例图](https://kf.qq.com/faq/120911VrYVrA130620u2iA7n.html)（个人）


## 微信控制台设置

登录到微信后台，截图如下：
![weixin_web_management](images/weixin-mp-console-home.png)

### 微信的开发选项

左下角找到菜单入口：

![menu_config](images/weixin-developer-menu.png)

## 创建项目

在 [LeanCloud 控制台](https://leancloud.cn/applist.html#/apps) 中创建一个应用，暂且叫做「Wechat」。在本地创建一个文件夹，如 `/usr/leancloud/wechat/`，安装 [LeanCloud 命令行工具](leanengine_cli.html#安装命令行工具)，在该目录执行以下命令进行登录：

```bash
lean login
```

按照提示输入 LeanCloud 用户名和密码。如遇问题请参考《[命令行工具 CLI 使用指南 · 登录](leanengine_cli.html#登录)》。接下来运行：

```bash
lean init
```

根据提示选择对应的节点，应用选择 **Wechat**，应用模版选择 **node-js-getting-started**，待过程完成后，一个云引擎默认的模板项目就在 `/usr/leancloud/wechat/` 下创建好了。如遇问题请参考《[命令行工具 CLI 使用指南 · 初始化项目](leanengine_cli.html#初始化项目)》。

## 添加依赖包

打开 `/usr/leancloud/wechat/package.json`，在 `dependencies` 中追加以下依赖项：

```json
    "async": "^1.5.2",
    "request": "^2.69.0",
    "strformat": "0.0.7",
    "wechat": "^2.0.3",
    "wechat-api": "^1.24.0"
```

## wechatBot.js

参照 [Github 的 wechatBot.js](https://github.com/leancloud/LeanEngine-WechatBot/blob/master/routes/wechatBot.js) 代码，建议直接复制拷贝所有内容，全部覆盖本地的 `/usr/leancloud/wechat/routes/wechatBot.js` 的内容。如果没有该文件，就直接复制到对应的目录下，然后修改关键的配置项。此时需要打开微信公众号管理控制台，进行对应设置。

下图为本文所使用的公众号的设置页面：
![wexin_config](images/weixin-mp-console-config.png)

注意，在「服务器配置」中生成 **EncodingAESKey(消息加密解密密钥)** 之后，<u>先不要点击保存设置</u>，其中的 **URL(服务器地址)** 需要在这个云引擎项目 [部署之后](#部署项目) 才可以确定。

```js
// 引用 wechat 库，详细请查看 https://github.com/node-webot/wechat
var wechat = require('wechat');
var config = {
  token: '请把微信后台的 Token 填写在这里',
  appid: '请把微信的 AppID 填写在这里',
  encodingAESKey: '请把微信后台生成的 EncodingAESKey 填写在这里'
};
```

对应关系如下：

微信设置项 | 代码配置项
--- | ---
AppID(应用ID)|`config.appid`
Token(令牌) | `config.token`
EncodingAESKey(消息加密解密密钥)|`config.encodingAESKey`

还需要设置初始化参数 **AppID(应用ID)** 和 **AppSercet(应用密钥)**：

```js
var WechatAPI = require('wechat-api');
var api = new WechatAPI('请把微信的 AppID 填写在这里',
  '请把微信的 Secret Key 填写在这里');
```

## app.js

在根目录下的 `app.js` 需要配置以下这行代码：

```js
// 这一段必须拷贝到当前项目中，它是定义了一个路由集合
// 可以将一类的路由单独保存在一个文件中
app.use('/wechat', require('./routes/wechatBot'));
```

微信在保存「服务器配置」时会进行实时验证，所以在这之前你需要将自己的服务器配置好，让它可以提供正确的验证。**这就需要将应用部署到云引擎中**。

## 部署项目
进入 {% if node=='qcloud' %}**LeanCloud 控制台** > **云引擎** > **设置**，{% else %}进入 [**LeanCloud 控制台** > **云引擎** > **设置**](/dashboard/cloud.html?appid={{appid}}#/conf)，{% endif %}找到 **Web 主机域名**，填入自己想使用的名称，本文使用 `wechatTest`（即 `wechatTest.leanapp.cn`）：

<img src="images/console-webhosting-field.png" width="500" alt="domain_setting">

然后回到项目目录下，执行如下命令行：

```bash
lean deploy
```

如果使用的是云引擎生产环境的体验实例，`deploy` 将会将项目直接发布到 `wechatTest.leanapp.cn`。

如果使用的是云引擎生产环境的标准实例，`deploy` 会将其发布到 <code>**stg-**wechatTest.leanapp.cn</code>；要发布到 `wechatTest.leanapp.cn`，还需要执行：

```bash
lean publish
```

## 验证配置

回到微信公众号的控制台，将刚才在云引擎上设置的域名填写到 **URL(服务器地址)** 中（本例为 `http://wechatTest.leanapp.cn/wechat`），然后保存设置进行验证。

如果微信控制台提示「验证失败」，请仔细确认：

- 代码中的配置是否与控制台配置一致
- 代码是否正常运行<br/>
  对于本文中的 Node.js 代码，如果访问 `http://wechatTest.leanapp.cn/wechat` 显示出 404、503、504 等服务端错误，则代表代码有错误。可以在本地执行命令行 `lean up` 访问 `http://localhost:3000/wechat`，调试后重新部署。

## 测试公众号

1. 关注自己所注册的微信公众号
1. 打开该微信公众号并发送「你好」
1. 确认是否能接收到「您好，大家好才是真的好！」

