# 在云引擎中使用其他 Node 框架

云引擎的 Node.js 环境为流行的 Node 框架 [Express] 和 [Koa] 提供了集成支持，
通过命令行工具创建项目（`lean init`）时可以选取相应的模板项目。

[Express]: https://github.com/leancloud/node-js-getting-started
[Koa]: https://github.com/leancloud/koa-getting-started

你也可以在云引擎的 Node.js 环境中使用其他 Node 框架。

## 网站托管

如果你想要在云引擎上托管基于其他 Node 框架开发的网站项目，需要对代码和配置文件进行如下调整：

### 指定 Node 版本

出于兼容性考虑，云引擎默认使用的 Node.js 版本过于老旧（`0.12`）。
所以需要在 `package.json` 中指定较新的 Node 版本：

```json
"engines": {
  "node": "12.x"
},
```

### 修改监听地址、端口

云引擎需要 web 服务监听在 `0.0.0.0` 上，端口为云引擎开放给外网的端口（云引擎平台的环境变量 `LEANCLOUD_APP_PORT`）。
而大多数 Node 框架默认监听 `127.0.0.1:3000` 或 `0.0.0.0:3000` 上，因此需要修改。

例如，[Fastify] 框架默认监听 `127.0.0.1`：

[Fastify]: https://www.fastify.io/

```js
// server.js
fastify.listen(3000, (err, address) => { /* 略 */ })
```

需要修改为：

```js
fastify.listen(parseInt(process.env.LEANCLOUD_APP_PORT || '3000', 10), '0.0.0.0', (err, addr) => { /* 略 */ }) 
```

有的框架除了通过代码修改监听地址外，也支持在启动命令上添加额外参数指定监听地址。
例如，默认监听 `0.0.0.0:3000` 的 [Micro] 框架支持通过指定 `--listen` 参数修改监听地址：

```sh
"start": "micro --listen tcp://0.0.0.0:$LEANCLOUD_APP_PORT",
```

[Micro]: https://github.com/zeit/micro

指定 Node.js 版本、监听地址后，大部分 Node 框架都可以在云引擎上成功运行。
少数框架还需要进一步调整。

### 添加依赖项

云引擎不会安装 `devDependencies` 依赖。
因此，某些依赖项需要视情况在 `dependencies` 中额外添加，比如依赖（dependency）的 peer dependencies 需要添加到 `dependencies` 中。

### `scripts.start`

云引擎会根据 `package.json` 中 `scripts.start` 指定的命令启动应用（如未指定，则会使用 `node server.js` 作为启动命令）。
大部分 Node 框架都会提供默认的 `scripts.start`，无需额外配置。
需要注意的是，一些 Node 框架提供的默认 `scripts.start` 命令包含构建和运行两部分操作。
为了加快应用启动时间（避免健康检查失败，只使用一个云引擎实例时降低服务中断时间），需要进行配置。

例如，[Nest.js] 框架默认提供的 `scripts.start` 命令是 `nest start`，这个命令会先编译 TypeScript 为 JavaScript，构建项目，然后再运行服务。
可以修改为 `node dist/main`。

[Nest.js]: https://nestjs.com/

不过，这样修改的话，在每次部署项目（`lean deploy`）前都要记得先在本地构建项目（`nest build`），否则会部署过时的版本。
如果希望在云引擎上完成构建，可以通过 `scripts.prepare` 指定构建命令：

```json
"prepare": "nest build",
```

### 健康监测

云引擎在应用启动时，会每秒检查应用是否启动成功。
健康检查的 URL 为 `/` 和 `/__engine/1/ping`，两者之一返回 `HTTP 200` 就视为成功。
另外，如果项目不使用云函数，还要求 `/1.1/functions/_ops/metadatas` 返回 `HTTP 404`。
由于绝大部分项目都会实现 `/` 这个路由，并在未定义的路由上返回 404 错误，所以一般无需专门实现健康检查的逻辑。

不过，应用必须在 30 秒内通过健康检测，否则会被云引擎认为启动失败。
正常情况下，应用启动时间很少超过 30 秒。
超过 30 秒的常见原因是启动命令中混合了构建操作，这种情况需要修改启动命令，参见「scripts.start」一节。

## 云函数

如果要使用云函数，需要接入云引擎 Node.js SDK 的中间件。
云引擎 Node.js SDK 默认为 Express 和 Koa 提供了集成支持。
由于不少 Node.js 框架都是对 Express 和 Koa 的封装，许多 Node.js 框架兼容 Express 的中间件，
因此在这些框架上使用云函数很方便。

例如，在兼容 Express 中间件的 Fastify 框架中使用云函数：

```js
// 引入云引擎 SDK
const AV = require('leanengine');
// 云函数在 cloud.js 中定义
require('./cloud');

// 初始化云引擎 SDK
AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});
AV.Cloud.useMasterKey();

// 引入 fastify
const fastify = require('fastify')({
  logger: true
})

// 加载云引擎 SDK 提供的 Express 中间件
fastify.use(AV.express())
```

接入云引擎中间件后，云引擎 SDK 会自动处理 `/1.1/functions/_ops/metadatas` 的路由，声明项目支持云函数。

如果框架不兼容 Express 或 Koa 的中间件的话，需要自行实现云引擎中间件。
可以参考[云引擎 Node.js SDK 中的相关代码][code]。

[code]: https://github.com/leancloud/leanengine-node-sdk/blob/master/lib/frameworks.js

## 示例

- [micro-getting-started] -  在云引擎上部署 [Micro] 框架的模板项目，支持网站托管功能。
- [fastify-getting-started] - 在云引擎上部署 [Fastify] 框架的模板项目，支持网站托管和云函数功能。

[micro-getting-started]: https://github.com/weakish/micro-getting-started
[fastify-getting-started]: https://github.com/weakish/fastify-getting-started