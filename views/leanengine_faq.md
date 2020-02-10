# 云引擎常见问题和解答

## 云引擎都支持哪些语言

目前支持 Node.js、Python、Java、PHP 和 .Net 运行环境，未来可能还会引入其他语言。

## 云引擎支持托管纯静态网站吗

支持。命令行工具初始化项目选择语言环境时，依次选择 Others > Static Site 即可。

## 云引擎的开发域名多久生效

我们设置的 TTL 是 5 分钟，但各级 DNS 服务都有可能对其进行缓存，实际生效会有一定延迟，最长可能需要几个小时。

## 云引擎支持 HTTPS 吗

- 对于 `.{{engineDomain}}` 的开发域名我们默认支持 HTTPS，如需配置自动跳转，请看 [重定向到 HTTPS](leanengine_webhosting_guide-node.html#重定向到_HTTPS)。
- 自定义的域名需要在进行 [域名绑定](leanengine_webhosting_guide-node.html#备案和自定义域名) 时上传证书才可以支持 HTTPS。

## 为什么 Class Hook 没有被运行？

首先确认一下 Hook 被调用的时机是否与你的理解一致：

* `beforeSave`：对象保存或创建之前
* `afterSave`：对象保存或创建之后
* `beforeUpdate`：对象更新之前
* `afterUpdate`：对象更新之后
* `beforeDelete`：对象删除之前
* `afterDelete`：对象删除之后
* `onVerified`：用户通过邮箱或手机验证后
* `onLogin`：用户在进行登录操作时（`become(sessionToken)` 不是登录操作，因此不会调用 `onLogin`）

还需注意在本地进行云引擎调试时，运行的会是线上预备环境的 Hook，如果没有预备环境则不会运行。

然后检查 Hook 函数是否被执行过：

可以先在 Hook 函数的入口打印一行日志，然后进行操作，再到 [云引擎日志](/dashboard/cloud.html?appid={{appid}}#/log) 中检查该行日志是否被打印出来，如果没有看到日志原因可能包括：

* 代码没有被部署到正确的应用
* 代码没有被部署到生产环境（或没有部署成功）
* Hook 的类名不正确

如果日志已打出，则继续检查函数是否成功，检查控制台上是否有错误信息被打印出。如果是 before 类 Hook，需要保证 Hook 函数在 15 秒内结束，否则会被系统认为超时。

> after 类 Hook 超时时间为 3 秒，如果你的体验实例已经休眠，很可能因为启动时间过长无法收到 after 类 Hook，建议升级到云引擎的标准实例避免休眠。

相关文档：[云引擎指南：Hook 函数](leanengine_cloudfunction_guide-node.html#Hook_函数)

## 命令行工具在本地调试时提示 `Error: listen EADDRINUSE :::3000`，无法访问应用

`listen EADDRINUSE :::3000` 表示你的程序默认使用的 3000 端口被其他应用占用了，可以按照下面的方法找到并关闭占用 3000 端口的程序：

* [macOS 使用 `lsof` 和 `kill`](http://stackoverflow.com/questions/3855127/find-and-kill-process-locking-port-3000-on-mac)
* [Linux 使用 `fuser`](http://stackoverflow.com/questions/11583562/how-to-kill-a-process-running-on-particular-port-in-linux)
* [Windows 使用 `netstat` 和 `taskkill`](http://stackoverflow.com/questions/6204003/kill-a-process-by-looking-up-the-port-being-used-by-it-from-a-bat)

也可以修改命令行工具默认使用的 3000 端口：
```
lean -p 3002
```

## 命令行工具初始化项目时报错 `please login first`，可是之前明明已经通过 `lean login` 成功登录了？

如果通过 `lean login` 登录的账号名下没有 LeanCloud 应用，会碰到这一问题。
需要创建一个应用再重新运行一下 `lean login`，之后就可以正常使用了。

## Application not found 错误

访问云引擎服务时，服务端返回错误「Application not found」或在云引擎日志中出现同一错误。

- 调用错了环境。最常见的情况是，免费的体验实例是没有预备环境，开发者却主动设置去调用预备环境。
- `???.{{engineDomain}}` 开发域名填错了，比如微信回调地址。请确认与 `???` 的拼写完全一致。

## 云函数有哪些限制？

云函数是 LeanCloud 提供的一个 **相对受限** 的自定义服务器端逻辑的功能，和我们的 SDK 有比较 **深度的集成**。我们将云函数设计为一种类似 **RPC** 的机制，在云函数中你只能关注参数和结果，而不能自定义超时时间、HTTP Method、URL，不能读取和设置 Header。如果希望更加自由地使用这些 HTTP 的语义化功能，或者希望使用第三方的框架提供标准的 RESTful API，请使用云引擎的 [网站托管功能](leanengine_webhosting_guide-node.html)，自行来处理 HTTP 请求。

## 如何判断当前是预备环境还是生产环境？

请参考 [网站托管开发指南 · 预备环境和生产环境](leanengine_webhosting_guide-node.html#预备环境和生产环境) 。

## 怎么添加第三方模块

只需要像普通的 Node.js 项目那样，在项目根目录的 `package.json` 中添加依赖即可：

```
{
  "dependencies": {
    "async": "0.9.0",
    "moment": "2.9.0"
  }
}
```

`dependencies` 内的内容表明了该项目依赖的三方模块（比如示例中的 `async` 和 `moment`）。关于 `package.json` 的更多信息见 [网站托管开发指南 · package.json](leanengine_webhosting_guide-node.html#package_json)。

然后即可在代码中使用第三方包（`var async = require('async')`），如需在本地调试还需运行 `npm install` 来安装这些包。

**注意**：命令行工具部署时是不会上传 `node_modules` 目录，因为云引擎服务器会根据 `package.json` 的内容自动下载三方包。所以也建议将 `node_modules` 目录添加到 `.gitignore` 中，使其不加入版本控制。

## Maximum call stack size exceeded 如何解决？

> 将 JavaScript SDK 和 Node SDK 升级到 1.2.2 以上版本可以彻底解决该问题。  

如果你的应用时不时出现 `Maximum call stack size exceeded` 异常，可能是因为在 hook 中调用了 `AV.Object.extend`。有两种方法可以避免这种异常：

- 升级 leanengine 到 v1.2.2 或以上版本
- 在 hook 外定义 Class（即定义在 `AV.Cloud.define` 方法之外），确保不会对一个 Class 执行多次 `AV.Object.extend`

我们在 [JavaScript 指南 - 构建对象](./leanstorage_guide-js.html#构建对象) 章节中也进行了描述。

## 如何排查云引擎 Node.js 内存使用过高（内存泄漏）？

首先建议检查云引擎日志，检查每分钟请求数、响应时间、CPU、内存统计，查看是否存在其他异常情况，如果有的话，先解决其他的问题。如果是从某个时间点开始内存使用变高，建议检查这个时间点之前是否有部署新版本，然后检查新版本的代码改动或尝试回滚版本。

然后这里有一些常见的原因可供对照检查：

- 如果使用 cluster 多进程运行，内存使用会成倍增加（取决于运行几个 Worker）。
- 如果在代码中不断地向一个全局对象（或生命周期较长的对象）上添加新的对象或闭包的引用（例如某种缓存），那么在运行过程中内存使用会逐渐增加（即内存泄漏）。
- 如果响应时间增加（例如对请求的处理卡在慢查询、第三方网络请求），那么程序同时处理的请求数量会增加（即请求堆积），会占用很多内存。
- 也有可能是业务本身在增加，确实需要这么多内存。

如果还不能找到原因，可以尝试一些更高级的工具：

- [heapdump](https://github.com/bnoordhuis/node-heapdump) 或 [v8-profiler](https://github.com/node-inspector/v8-profiler)：可以导出一份内存快照，快照文件可以被下载到本地，通过 Chrome 打开，可以看到内存被哪些对象占用。如果能在本地复现的话，建议尽量在本地运行，如需线上运行则你需要自己编码实现发送信号、下载快照文件等功能。
- `--trace_gc`：可以在 GC 时在标准输出打印简要的日志，包括 GC 的类型、耗时，GC 前后的堆体积和对象数量（在 `package.json` 的 `scripts.start` 里改成 `node --trace_gc server.js` 来开启）。

其他参考资料（第三方）：

- [Node.js 调试 GC 以及内存暴涨的分析](https://blog.devopszen.com/node-js_gc)
- [Node.js Performance Tip: Managing Garbage Collection](https://strongloop.com/strongblog/node-js-performance-garbage-collection/)
- [Node.JS Profile 1.2 V8 GC详解](https://xenojoshua.com/2018/01/node-v8-gc/)

## 如何排查云引擎 Node.js CPU 使用过高（响应缓慢）？

首先建议检查云引擎日志，检查每分钟请求数、响应时间、CPU、内存统计，查看是否存在其他异常情况，如果有的话，先解决其他的问题。如果是从某个时间点开始 CPU 使用变高，建议检查这个时间点之前是否有部署新版本，然后检查新版本的代码改动或尝试回滚版本。

然后这里有一些常见的原因可供对照检查：

- 如果内存使用率较高、或频繁分配和释放大量对象，那么 GC 会占用一些 CPU 也会导致卡顿，可以用 `--trace_gc` 打开 GC 日志来确认 GC 的影响。
- 程序中有死循环或失去控制（数量不断增加）的 setTimeout 或 setInterval。
- 也有可能是业务本身在增加，确实需要这么多 CPU。

因为 Node.js 是基于单线程的事件循环模型，如果事件循环中新的任务一直得不到执行（即事件循环被「阻塞」），那么就会造成 CPU 不高，但响应缓慢或不响应的情况。导致事件循环被阻塞的场景情况包括：

- 密集的纯计算，例如执行时间非常长的同步循环、序列化（JSON 等）、复杂的数学（密码学）运算、复杂度非常高的正则表达式
- 同步的 IO 操作，例如 `fs.readFileSync`、`child_process.execSync` 或含有这些同步操作的第三方包（例如 `sync-request`）。
- 不断向事件循环中添加新的任务，例如 `process.nextTick` 或 `setImmediate`，导致事件队列中的任务一直执行不完。

其他会导致 Node.js 响应慢或不响应的情况：

- 使用了 Node.js 中底层采用线程数实现的 API，包括 `dns.lookup`（多数 HTTP 客户端间接使用了该函数）、所有文件系统 API，如果大量使用这些 API 或这些操作非常慢，则会产生额外的等待。

如果能不能找到原因，可以尝试一些更高级的工具：

- `node --prof`：可以统计程序中每一个函数的执行耗时和调用关系，导出一份日志文件，可以用 `node --prof-process` 来生成一份报告，包括占用 CPU 时间最多的函数（包括 JavaScript 和 C++ 部分）列表。`node --prof` 对性能本身的影响很大，长时间运行生成的日志也很大，建议尽量在本地运行，如需在线上运行则需要你自己编码实现生成报告、下载报告等功能。
- [v8-profiler](https://github.com/node-inspector/v8-profiler)：可以生成一份 CPU 日志，可以下载到本地后通过 Chrome 打开，可以看到每个函数的执行时间和调用关系。v8-profiler 对性能本身的影响很大，长时间运行生成的日志也很大，建议尽量在本地运行，如需在线上运行则需要你自己编码实现开始生成日志、下载报告等功能。

其他参考资料（第三方）：

- [不要阻塞你的事件循环](https://nodejs.org/zh-cn/docs/guides/dont-block-the-event-loop/)
- [Node.JS Profile 4.1 Profile实践](https://xenojoshua.com/2018/02/node-profile-practice/)
- [手把手测试你的JS代码性能](https://cnodejs.org/topic/58b562f97872ea0864fee1a7)
- [Speed Up JavaScript Execution](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/js-execution)


## 调用云引擎方法如何收费？

云引擎中如果有 LeanCloud 的存储等 API 调用，按 [API 收费策略](faq.html#API_调用次数的计算) 收费。另外如果使用的是云引擎 [标准实例](leanengine_plan.html#标准实例) 也会产生使用费，具体请参考 [云引擎运行方案](leanengine_plan.html#价格)。

## 「定义函数」和「Git 部署」可以混用吗？

「定于函数」的产生是为了方便大家初次体验云引擎，或者只是需要一些简单 hook 方法的应用使用。我们的实现方式就是把定义的函数拼接起来，生成一个云引擎项目然后部署。

所以可以认为「定义函数」和 「Git 部署」最终是一样的，都是一个完整的项目。

是一个单独功能，可以不用使用基础包，git 等工具快速的生成和编辑云引擎。

当然，你也可以使用基础包，自己写代码并部署项目。

这两条路是分开的，任何一个部署，就会导致另一种方式失效掉。

## 如何从「在线编辑」迁移到项目部署？

1. 按照 [命令行工具使用指南](leanengine_cli.html) 安装命令行工具，使用 `lean init` 初始化项目，模板选择 `node-js-getting-started`（我们的 Node.js 示例项目）。
2. 在 [应用控制台 > 云引擎 > 部署 > 在线编辑](https://leancloud.cn/cloud.html?appid={{appid}}#/deploy/online) 中点击 **预览**，将全部函数的代码拷贝到新建项目中的 `cloud.js`（替换掉原有内容）。
3. 检查 `cloud.js` 的代码，将 `AV.User.current()` 改为 `request.currentUser` 以便从 Node SDK 的 0.x 版本升级到 1.x，有关这个升级的更多信息见 [升级到云引擎 Node.js SDK 1.0](leanengine-node-sdk-upgrade-1.html)。
4. 运行 `lean up`，在 <http://localhost:3001> 的调试界面中测试云函数和 Hook，然后运行 `lean deploy` 部署代码到云引擎（使用标准实例的用户还需要执行 `lean publish`）。
5. 部署后请留意云引擎控制台上是否有错误产生。

## 为什么云函数中 include 的字段没有被完整地发给客户端？

> 将 JavaScript SDK 和 Node SDK 升级到 3.0 以上版本可以彻底解决该问题。  

云函数在响应时会调用到 `AV.Object#toJSON` 方法，将结果序列化为 JSON 对象返回给客户端。在早期版本中 `AV.Object#toJSON` 方法为了防止循环引用，当遇到属性是 Pointer 类型会返回 Pointer 元信息，不会将 include 的其他字段添加进去，我们在 [JavaScript SDK 3.0](https://github.com/leancloud/javascript-sdk/releases/tag/v3.0.0) 中对序列化相关的逻辑做了重新设计，**将 JavaScript SDK 和 Node SDK 升级到 3.0 以上版本便可以彻底解决该问题**。

如果暂时无法升级 SDK 版本，可以通过这样的方式绕过：

```javascript
AV.Cloud.define('querySomething', function(req, res) {
  var query = new AV.Query('Something');
  // user 是 Something 表的一个 Pointer 字段
  query.include('user');
  query.find().then(function(results) {
    // 手动进行一次序列化
    results.forEach(function(result){
      result.set('user', result.get('user') ?  result.get('user').toJSON() : null);
    });
    // 再返回查询结果给客户端
    res.success(results);
  }).catch(res.error);
});
```

## RPC 调用云函数时，为什么会返回预期之外的空对象？

使用 Node SDK 定义的云函数，如果返回一个不是 AVObject 的值，比如字符串、数字，RPC 调用得到的是空对象（`{}`）。
类似地，如果返回一个包含非 AVObject 成员的数组，RPC 调用的结果中该数组的相应成员也会被序列化为 `{}`。
这个问题将在 Node SDK 的下一个大版本（4.0）中修复。
目前绕过这一个问题的方法是将返回结果放在对象（`{}`）中返回。 

## Gitlab 部署常见问题

很多用户自己使用 [Gitlab](http://gitlab.org/) 搭建了自己的源码仓库，有时可能会遇到无法部署到 LeanCloud 的问题，即使设置了 Deploy Key，却仍然要求输入密码。

可能的原因和解决办法如下：

* 确保你 Gitlab 运行所在服务器的 /etc/shadow 文件里的 git（或者 gitlab）用户一行的 `!`修改为 `*`，原因参考 [Stackoverflow - SSH Key asks for password](http://stackoverflow.com/questions/15664561/ssh-key-asks-for-password)，并重启 SSH 服务：`sudo service ssh restart`。
* 在拷贝 Deploy Key 时，确保没有多余的换行符号。
* Gitlab 目前不支持有注释的 Deploy Key。早期 LeanCloud 用户生成的 Deploy Key 末尾可能带有注释（类似于 `App dxzag3zdjuxbbfufuy58x1mvjq93udpblx7qoq0g27z51cx3's cloud code deploy key`），需要删除掉这部分再保存到 Gitlab。

## `npm ERR! peer dep missing` 错误怎么办？

部署时出现类似错误：

```
npm ERR! peer dep missing: graphql@^0.10.0 || ^0.11.0, required by express-graphql@0.6.11
```

说明有一部分 peer dependency 没有安装成功，因为线上只会安装 dependencies 部分的依赖，所以请确保 dependencies 部分依赖所需要的所有依赖也都列在了 dependencies 部分（而不是 devDependencies）。

你可以在本地删除 node_modules，然后用 `npm install --production` 重新安装依赖来重现这个问题。

## 在线上无法读取到项目中的文件怎么办？

建议先检查文件大小写是否正确，线上的文件系统是区分大小写的，而 Windows 和 macOS 通常不区分大小写。

## 部署时长时间卡在「正在下载和安装依赖」怎么办？

这个步骤对应在云端调用各个语言的包管理器（`npm`、`pip`、`composer`、`maven`）安装依赖的过程，我们有一个 [依赖缓存](leanengine_webhosting_guide-node.html#依赖缓存) 机制来加速这个安装过程，但缓存可能会因为很多原因失效（比如修改了依赖列表），在缓存失效时会比平时慢很多，请耐心等待。如果你在 `leanengine.yaml` 中指定了系统依赖也会在这个步骤中安装，因此请不要添加未用到的依赖。

对于 Node.js 建议检查是否在 `package-lock.json` 或 `yarn.lock` 中指定了较慢的源（见 [网站托管开发指南 · Node.js](leanengine_webhosting_guide-node.html#package_json)）。

## 部署到多个实例时，部分实例失败需要重新部署吗？

同一环境（预备/生产）下有多个实例时，云引擎会同时在所有实例上部署项目。如因偶然因素部分实例部署不成功，会在几分钟后自动尝试再次部署，无需手动重新部署。

## 云引擎实例部署后控制台多次显示「部署中」是怎么回事？

控制台显示的「部署中」状态泛指所有运维操作，例如唤醒休眠实例、服务器偶发故障引起的重新部署，不只是用户主动进行的部署。

## 云引擎的健康检查是什么？

云引擎的管理系统会每隔几分钟检查所有实例的工作状态（通过 HTTP 检查，详见 [网站托管开发指南：健康监测](leanengine_webhosting_guide-node.html#健康监测)），如果实例无法正确响应的话，管理系统会触发一次重新部署，并在控制台上打印类似下面的日志：

> 健康检查失败：web1 检测到 Error connect ECONNREFUSED 10.19.30.220:51797

如果一周内发生一两次属正常现象（有可能是我们的服务器出现偶发的故障，因为会立刻重新部署，对服务影响很小），如果频繁发生可能是你的程序资源不足，或存在其他问题（运行一段时间后不再响应 HTTP 请求），需结合具体情况来分析。

## 如何使用云引擎批量更新数据？

可以参考我们的 [Demo: batch-update](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/routes/batch-update.js)。

## 如何下载云引擎的应用日志和访问日志

云引擎的应用日志（程序的标准输出和标准错误输出）可以在 [应用控制台 > 云引擎 > 应用日志](/dashboard/cloud.html?appid={{appid}}#/log) 查看；并且可以使用 [命令行工具](leanengine_cli.html#查看日志) 导出最长 7 天的日志。

云引擎的访问日志（Access Log）可在 [应用控制台 > 云引擎 > 访问日志](/dashboard/cloud.html?appid={{appid}}#/accesslog) 中导出，通过控制台下载经过打包的日志。

## 如何定制 Java 的堆内存大小？

见 [网站托管开发指南 · Java](leanengine_webhosting_guide-java.html#项目骨架)。

## 云引擎会重复提交请求吗？

云引擎的负载均衡对于幂等的请求（GET、PUT），在 HTTP 层面出错或超时的情况下是会重试的。
可以使用正确的谓词（例如 POST）避免此类重试。

## 如何在本地调试依赖 LeanCache 的应用？

见 [LeanCache 使用指南](leancache_guide.html#在本地调试依赖_LeanCache_的应用)。

## 云引擎是否可以使用本地磁盘存储文件？

见 [网站托管开发指南 · Node.js](leanengine_webhosting_guide-node.html#文件系统)。

## 云引擎如何上传文件？

见 [网站托管开发指南 · Node.js](leanengine_webhosting_guide-node.html#文件上传)。

## 云引擎中如何处理用户登录和 Cookie？

见 [网站托管开发指南 · Node.js](leanengine_webhosting_guide-node.html#用户状态管理)。

## 定时器 crontab 表达式

见 [云函数开发指南 · Node.js](leanengine_cloudfunction_guide-node.html#Cron_表达式)。