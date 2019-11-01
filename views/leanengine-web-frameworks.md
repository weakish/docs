# 在云引擎中使用其他 Node 框架

云引擎的 Node.js 环境为流行的 Node 框架 [Express] 和 [Koa] 提供了集成支持，
可以在通过命令行工具创建项目（`lean init`）时选取。

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

例如，[fastify] 框架默认监听 `127.0.0.1`：

[fastify]: https://www.fastify.io/

```js
// server.js
fastify.listen(3000, (err, address) => { /* 略 */ })
```

需要修改为：

```js
server.listen(parseInt(process.env.LEANCLOUD_APP_PORT || '3000', 10), '0.0.0.0', (err, addr) => { /* 略 */ }) 
```

经过上述两项调整后，大部分 Node 框架都可以在云引擎上成功运行。
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
如果希望在云引擎上完成构建，可以通过 `scripts.prepublish` 指定构建命令：

```json
"prepublish": "nest build",
```

### 健康监测

云引擎在应用启动时，会每秒检查应用是否启动成功。
健康检查的 URL 为 `/` 和 `/__engine/1/ping`，两者之一返回 `HTTP 200` 就视为成功。
由于绝大部分项目都会实现 `/` 这个路由，所以一般无需专门实现健康检查的逻辑。

不过，应用必须在 30 秒内通过健康检测，否则会被云引擎认为启动失败。
正常情况下，应用启动时间很少超过 30 秒。
超过 30 秒的常见原因是启动命令中混合了构建操作，这种情况需要修改启动命令，参见「scripts.start」一节。
除此以外，也可以考虑调整云引擎实例规格，加大内存。
因为大多数情况下，内存越多，应用启动越快。

### 示例

[nest-getting-started] 是一个适用于云引擎的模板项目，使用 Nest.js（Fastify）框架。

[nest-getting-started]: https://github.com/weakish/nest-getting-started