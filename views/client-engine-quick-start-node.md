# Client Engine 快速入门 · Node.js

该文档帮助你快速了解如何创建一个 Client Engine 项目，本地开发调试以及如何部署到云端。

## 安装命令行工具
请查看命令行工具**[安装部分](leanengine_cli.html#安装)**的文档，安装命令行工具，并执行**[登录](leanengine_cli.html#登录)**命令登录。


## 创建项目
从 Github 迁出示例项目，请将该项目作为你的项目基础：

```js
git clone https://github.com/leancloud/client-engine-nodejs-getting-started
cd client-engine-nodejs-getting-started
```

添加应用 appId 等信息到该项目：

```
lean switch
```

在第一步选择 App 中，选择您的游戏对应的 LeanCloud 应用。在第二步选择云引擎分组时，必须选择 `_client-engine` 分组，LeanCloud 仅对该分组提供专门针对 Client Engine 的优化维护及各种支持，如图所示：

![image](images/client-engine-lean-switch.png)


## 本地运行

首先在当前项目的目录下安装必要的依赖，执行如下命令行：

```
npm install
```

启动应用时打开调试日志：

```
DEBUG=ClientEngine*,RPS*,Play  lean up
```

如果您不需要调试日志，可以直接使用以下命令启动：

```
lean up
```

## 访问站点
使用浏览器访问 `http://localhost:3000`，就能看到相关页面，由于这部分是服务端代码，所以我们可以根据页面指引下载[客户端示例代码](https://github.com/leancloud/client-engine-demo-webapp)。

运行以下命令启动客户端应用

```
npm install
npm run serve
```
使用浏览器打开两个页面访问 `http://localhost:8080/` ，就可以模拟两个玩家的剪刀石头布游戏了。


## 部署到云端

在根目录中运行：

```
lean deploy
```

在浏览器中登录 LeanCloud 控制台，进入 Play - Client Engine - 设置，在「Web 主机域名」中设置二级域名，通过 `http://${your_app_domain}.leanapp.cn` 访问生产环境。

例如填写 `myapp`，设置成功后通过 `http://myapp.leanapp.cn`访问，此时可以看到 Client Engine 服务端正在运行的文本。

## 开发指南
进一步了解如何开发 Client Engine 请参考[Client Engine 开发指南 · Node.js](client-engine-guide-node.html)。