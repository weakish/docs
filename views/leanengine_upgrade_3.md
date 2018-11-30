# LeanEngine 2.0 升级指南

<div class="callout callout-danger">该文档适用于早期（2015 年之前）的遗留项目升级到最新版本，新的项目可直接使用新版的 [实例项目](https://github.com/leancloud/node-js-getting-started) 来开始开发。</div>

假设当前有一个基本的 2.0 版本的应用，目录结构如下：

```
$PROJECT_DIR
├── README.md
├── cloud
│   ├── app.js
│   ├── main.js
│   └── views
│       └── hello.ejs
├── config
│   └── global.json
└── public
    └── index.html
```
项目根目录我们以 `$PROJECT_DIR` 代替。

## 创建 package.json 文件

**提示**：如果项目已经有该文件可以跳过该部分。

一个标准的 Node.js 应用通常有 `$PROJECT_DIR/package.json` 文件，该文件记录了项目的元信息，比如应用名称、版本、依赖的三方包等。因为新版项目没有沙箱环境，所以依赖的所有三方包都需要明确声明。下面是一个示例：

```
{
  "name": "leanengine-test-project",
  "version": "1.0.0",
  "description": "A sample Node.js app using Express 4",
  "dependencies": {
    "body-parser": "1.12.3",
    "cookie-parser": "^1.3.5",
    "ejs": "2.3.1",
    "express": "4.12.3",
    "leanengine": "^3.3.2"
  },
  "engines": {
    "node": "8.x"
  }
}
```

可以通过这个文件看到各个依赖的版本，例如 Node.js 8.x、leanengine 3.3.2 等。

`package.json` 创建完成后在 `$PROJECT_DIR` 目录执行下列命令：

```
npm install
```

这样会根据 `package.json` 中声明的依赖自动从网络下载依赖包，并保存在 `$PROJECT_DIR/node_modules` 目录。

**提示**：该过程可能会比较慢，因为下载源在国外。

关于 `package.json` 更多的信息，可以参考 [npm 官网 package.json 介绍](https://docs.npmjs.com/files/package.json)。

## 增加 leanengine 依赖

新版项目会依赖 [leanengine](https://github.com/leancloud/leanengine-node-sdk)，而不是 [avoscloud](https://github.com/leancloud/javascript-sdk)，可以认为前者是后者的增强，增加了云函数等支持。

如果是按照 [创建 package.json 文件](#创建_package_json_文件) 章节描述的操作，`package.json` 文件应该已经有 `leanengine` 的依赖了。如果没有请在 `$PROJECT_DIR` 目录下执行：

```
npm install leanengine --save
```

该命令的含义是「安装 leanengine 依赖」，最后的 `--save` 参数会将依赖信息添加到 `package.json` 文件中。

## 创建 server.js

新版的项目会以 `$PROJECT_DIR/server.js` 作为整个项目的启动文件，下面是一份简单的示例代码：

```
  1 var AV = require('leanengine');
  2
  3 var APP_ID = process.env.LEANCLOUD_APP_ID;
  4 var APP_KEY = process.env.LEANCLOUD_APP_KEY;
  5 var MASTER_KEY = process.env.LEANCLOUD_APP_MASTER_KEY;
  6
  7 AV.init({
  8   appId:     APP_ID,
  9   appKey:    APP_KEY,
 10   masterKey: MASTER_KEY
 11 });
 12 // 如果不希望使用 masterKey 权限，可以将下面一行删除
 13 AV.Cloud.useMasterKey();
 14
 15
 16 var app = require('./app');
 17
 18 // 端口一定要从环境变量 `LC_APP_PORT` 中获取。
 19 // LeanEngine 运行时会分配端口并赋值到该变量。
 20 var PORT = parseInt(process.env.LC_APP_PORT || 3000);
 21 app.listen(PORT, function () {
 22   console.log('Node app is running, port:', PORT);
 23 });
```

该文件做了几件事：

### 初始化 `AV` 对象

第 1 ~ 13 行，引入 `leanengine` 依赖，并使用环境变量里面的 appId 和 appKey 等信息初始化 `AV` 对象。

* **提示**：2.0 项目直接由沙箱环境提供 `AV` 对象，而新版项目需要手动初始化。前者虽然方便，但略微违反直觉（因为普通的 Node.js 项目全局空间是不会有 `AV` 对象的）。手动初始化还可以做更明确的控制，比如「是否使用 MasterKey 初始化 `AV` 对象，使得 LeanEngine 项目拥有完全权限，不受 ACL 限制等」。
* 如果想了解具体有哪些环境变量，可以参考 [云引擎指南 - 环境变量](./leanengine_webhosting_guide-node.html#环境变量)。

### 提供 Web 服务

第 16 ~ 23 行，引入 `app` 模块（具体见 [app 模块](#app_模块) 一节），然后使用环境变量提供的端口启动应用。

* **提示**：2.0 项目引入自定义模块时都需要添加 `cloud/` 的前缀（比如 `cloud/app.js`）。Node.js 项目没有这样的引用方式，属于沙箱环境的限制。新版项目则使用更加通用的方式，以 `./` 或 `../` 开头来引用自定义模块，如用 `./app` 来引用 `$PROJECT_DIR/app.js` 文件。

## app 模块

app 模块保存在 `$PROJECT_DIR/app.js` 文件，是应用主要文件之一，其中配置了 Express 的插件、主要路由等信息，文件内容有些类似 2.0 项目的 `$PROJECT_DIR/cloud/app.js` 文件（WebHosting 版本才有该文件），我们就从一个 2.0 项目的文件改起。

首先将 2.0 项目中 `$PROJECT_DIR/cloud/app.js` 文件复制到 `$PROJECT_DIR/app.js` 目录下。

假设现在 `$PROJECT_DIR/app.js` 文件内容如下：

```
  1 var express = require('express');
  2 var app = express();
  3
  4 // App 全局配置
  5 app.set('views','cloud/views');   // 设置模板目录
  6 app.set('view engine', 'ejs');    // 设置 template 引擎
  7 app.use(express.bodyParser());    // 读取请求 body 的中间件
  8
  9 // 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
 10 app.get('/hello', function(req, res) {
 11   res.render('hello', { message: 'Congrats, you just set up your app!' });
 12 });
 13
 14 // 最后，必须有这行代码来使 express 响应 HTTP 请求
 15 app.listen();
```

### 模板目录修改

因为新版项目不受沙箱限制，不需要强制将模板目录保存在 `$PROJECT_DIR/cloud/views` 目录下，取而代之使用更加通用的习惯，保存在 `$PROJECT_DIR/views`，所以改成：

```
> 1 var path = require('path');
  2 var express = require('express');
  3 var app = express();
  4
  5 // App 全局配置
> 6 app.set('views', path.join(__dirname, 'views')); // 设置模板目录
  7 app.set('view engine', 'ejs');    // 设置 template 引擎
```
* 注意 `>` 标志指向变动的行，为了拼接「跨平台」的目录样式，我们使用了 `path.join` 方法，并因此引入了 `path` 模块。

改完配置，记得将 `$PROJECT_DIR/cloud/views` 目录移动到 `$PROJECT_DIR/views`。

### 定义静态文件目录

因为 2.0 沙箱会默认将 `$PROJECT_DIR/public` 设置为静态资源目录。而新版项目需要手动设置，所以代码会变成下面这样：

```
  6 app.set('views', path.join(__dirname, 'views')); // 设置模板目录
  7 app.set('view engine', 'ejs');    // 设置 template 引擎
> 8 app.use(express.static('public'));
  9 app.use(express.bodyParser());    // 读取请求 body 的中间件
```

### Express 中间件

2.0 沙箱环境会默认加载一些 Express 中间件。而新版项目需要手动设置，所以代码可能会变成下面这样：

```
  2 var express = require('express');
> 3 var cookieParser = require('cookie-parser');
> 4 var bodyParser = require('body-parser');
  5 var cloud = require('./cloud');
  6 var app = express();
  7
  8 // App 全局配置
  9 app.set('views', path.join(__dirname, 'views')); // 设置模板目录
 10 app.set('view engine', 'ejs');    // 设置 template 引擎
 11 app.use(express.static('public'));
>12 app.use(bodyParser.json());
>13 app.use(bodyParser.urlencoded({ extended: false }));
>14 app.use(cookieParser());
 15
```

因为 Express 4.x 的中间件都分离为单独项目，所以我们添加了 `cookie-parser` 和 `body-parser` 中间件。如果需要，你可以添加自己需要的中间件。

**提示**：记得所有用到的三方包都需要添加到 `package.json` 文件中，否则部署到服务器时会出现依赖包找不到的情况。

### 异常处理器

2.0 沙箱环境默认提供很多异常处理，方便应用使用。新版项目需要手动设置，所以需要在 `$PROJECT_DIR/app.js` 中添加如下代码：

```js
app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.render('error', {
    message: err.message,
    error: error
  });
});
```

这些异常处理器可以根据自己的需要修改。

### 返回一个 Express 对象

2.0 项目会在 `$PROJECT_DIR/cloud/app.js` 末尾调用 `app.listen()` 方法来提供 web 服务。新版项目使用了更为习惯的用法：导出 Express 的实例，由上层模块调用其 `listen` 方法启动端口监听，来提供 web 服务。

回忆下我们在 [server.js](#创建_server_js) 部分引用了 `app` 并调用了 `app.listen` 方法，所以 `$PROJECT_DIR/app.js` 可能会是这个样子（第 53 行）：

```
>53 module.exports = app;
```

##云函数

2.0 项目启动文件是 `$PROJECT_DIR/cloud/main.js`，一般情况会在该文件会使用 `AV.Cloud.define` 或者 `AV.Cloud.beforeSave` 等方法定义很多 [云函数](leanengine_cloudfunction_guide-node.html)。

新版项目将这样的文件命名为 `$PROJECT_DIR/cloud.js`，所以你需要将 `$PROJECT_DIR/cloud/main.js` 移动并更名为 `$PROJECT_DIR/cloud.js`。

**注意**：新版项目中**不能**存在 `$PROJECT_DIR/cloud/main.js` 文件，否则会被当做 2.0 的项目加载并运行。

如果是最基本的 2.0 项目的代码，那它的内容可能是这样：

```
  1 require("cloud/app.js");
  2 // Use AV.Cloud.define to define as many cloud functions as you want.
  3 // For example:
  4 AV.Cloud.define("hello", function(request, response) {
  5   response.success("Hello world!");
  6 });
```

可以看到 2.0 项目其实是先加载这个文件，然后在引入 `app.js`，而新版项目正好相反，是由 `app.js` 引入 `cloud.js` 文件，所以更改以后应该是类似这样：

```
  1 var AV = require('leanengine');
  2
  3 // Use AV.Cloud.define to define as many cloud functions as you want.
  4 // For example:
  5 AV.Cloud.define('hello', function(request, response) {
  6   response.success('Hello world!');
  7 });
  8
  9 module.exports = AV.Cloud;
```

* 第 1 行不需要再次引入 `app.js`，取而代之是引入 `leanengine` 模块，然后就可以使用 `AV.Cloud.define` 方法来定义云函数了。

然后我们需要将 SDK 提供的 `AV.express()` 作为中间件来挂载到 express 上（在 `$PROJECT_DIR/app.js` 中）：

```
  5 var bodyParser = require('body-parser');
> 6 require('./cloud');
  7 var app = express();
  8
  9 // App 全局配置
 10 app.set('views', path.join(__dirname, 'views')); // 设置模板目录
 11 app.set('view engine', 'ejs');    // 设置 template 引擎
>12 app.use(AV.express());
 13 app.use(express.static('public'));
```

我们在第 6 行引入 `cloud` 模块；然后在第 12 行将云函数的中间件挂载到 express 上，请尽量将 `AV.express()` 挂载到靠前的位置，因为该中间件会提供一个健康监测的 URL，LeanEngine 监控服务会根据该 URL 的响应判断应用是否启动成功。放在后面很容易被其他的 router 替代，导致响应不是预期的而被健康监测认为启动失败。关于健康监测的详细信息请参考 [云引擎指南 - Node.js 环境](./leanengine_webhosting_guide-node.html#健康监测)。

## 移除 global.json

`$PROJECT_DIR/config/global.json` 文件在新版已经废弃，可以移除。如果你自己有其他的配置信息，可以创建相关的配置文件保存在 `$PROJECT_DIR/config` 目录中。

## 默认时区

服务端 2.0 项目环境默认使用 UTC 时区，这给很多开发者带来了困惑。新版项目环境将默认时区改为东八区，在 [时区问题](leanengine_webhosting_guide-node.html#时区问题) 部分详细讨论这个问题。

## cookie-session 中间件

如果你的 2.0 项目使用了 `avos-express-cookie-session` 中间件，则你的 `$PROJECT_DIR/cloud/app.js` 中可能有类似这样的代码：

```js
var avosExpressCookieSession = require('avos-express-cookie-session');

app.use(express.cookieParser('test'));
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: false }));
```
新版项目该中间件用法稍有不同，代码需要修改为类似这样：

```js
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

即不需要在引入 `avos-express-cookie-session` 中间件，不需要使用 `cookieParser`，直接使用 `AV.Cloud.CookieSession` 的方式来配置，具体信息参见 [云引擎指南 - 处理用户登录和登出](./leanengine_webhosting_guide-node.html#处理用户登录和登出)

## 本地运行

到此为止，我们已经配置了一个基本的新版云引擎项目，应该可以通过命令行工具进行本地调试（确保本机已经安装 Node.js 运行环境），执行下列命令：

```
lean up
```

因为 `$PROJECT_DIR/app.js` 中定义了一个 `/hello` 的路由，所以 `http://localhost:3000/hello` 应该可以正常响应：

```
Congrats, you just set up your app!
```

如果使用其他的 url，比如 `http://localhost:3000/foobar` 会得到一个 404 响应，内容是

```
error:Not Found
```

说明我们的异常处理器起作用了。

还可以打开云函数调试页面 `http://localhost:3001` 来测试 `$PROJECT_DIR/cloud.js` 里面定义的 `hello`云函数。

## 部署

可以使用命令行工具部署到测试环境：

```
lean deploy
```

或者部署到生产环境：

```
lean publish
```

## 其他

可以在这里找到升级完成的项目代码：<https://github.com/leancloud/leanengine-upgrade-3.0>
