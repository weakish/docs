{% import "views/_helper.njk" as docs %}

# 多人对战 Server 快速入门 &middot; Java

该文档帮助你快速了解如何创建一个多人对战 Server 项目。如何本地启动并调试项目，如何将项目部署项目到云端。

## 本地项目

### 安装命令行工具
请查看命令行工具**[安装部分](leanengine_cli.html#安装)**的文档，安装命令行工具，并执行**[登录](leanengine_cli.html#登录)**命令登录。

### 下载初始项目

在本地调试中，我们需要获取两部分代码。一部分是核心 Server 代码，这部分代码可以帮助我们在本地启动一个 Server 服务，另一部分是 Plugin 的初始项目，在这个初始项目中可以撰写我们自己的逻辑。

在[这个下载页面](https://github.com/leancloud/multiplayer-server-plugin-getting-started/releases)中，我们需要下载两个项目：game-standalone 和 Source Code。

解压 game-standalone 和 Source Code ，把两个工程的文件放到同一个目录 `project` 下面：

```
./project/game-standalone       // 本地服务器的核心代码。
./project/multiplayer-server-plugin-getting-started-x.x     // 撰写自己逻辑的代码，最终要将其打好的包给到 game-standalone，x.x 为版本号。
```

### 安装依赖

#### 安装 game-standalone 依赖：

Mac：

```
// 安装 python3
brew install python3
// 安装 Java 8 或以上版本
brew cask install java
```

Linux：Linux 下请自行安装 Python3、 Java 8 或以上版本。

Windows：暂时不支持在 Windows 下启动服务器。

#### 安装 Plugin 的依赖：

```
cd multiplayer-server-plugin-getting-started
mvn install
```

### 本地启动服务端

#### 本地启动

Server 和 Plugin 的代码都准备好之后，我们可以本地启动并调试了。

```
cd project/game-standalone
./launch.sh
```

服务启动后，命令行窗口会自动展示 Multiplayer Server 进程的标准输出，不关心其输出时可以 CTRL + C 退出，Multiplayer Server 会在后台继续运行。

执行 `./launch.sh` 启动后，进入 `multiplayer-server-plugin-getting-started-x.x/integration-test-scripts` 测试服务是否顺利启动成功。

```
cd multiplayer-server-plugin-getting-started-x.x/integration-test-scripts
./run-tests.sh
```

测试通过后说明服务顺利启动。


如果要关闭服务，执行以下命令：

```
./shutdown.sh
```

**由于我们接下来还要调试，此时先不关闭服务。**

#### 连接本地服务器

Server 启动后，本地的 Server 地址为 `http://localhost:8081`，游戏客户端可以访问这个地址来测试。

在游戏引擎中，使用以下代码指定连接本地服务器：

```js
const client = new Client({
  appId: {{appid}},
  appKey: {{appkey}},
  userId: 'leancloud'
  // 指定连接本地的 Server 地址
  playServer: 'http://localhost:8081',
  // 关闭 ssl
  ssl: false
});

client.connect().then(()=> {
  // 连接成功
}).catch((error) => {
  // 连接失败
  console.error(error);
});
```

```cs
var client = new Client({{appid}}, {{appkey}}, userId, playServer: "http://localhost:8081", ssl: false);
await client.Connect();
```

### 自定义服务端逻辑

#### 撰写 Plugin 代码

现在我们将自己简单的逻辑写到 Plugin 中。`multiplayer-server-plugin-getting-started` 这个项目提供了一些示例代码。

* `cn.leancloud.play.plugin.MyFancyPluginFactory` ，在这个文件中需要实现一个 `create` 方法，在这个方法中可以设置多个 Plugin，客户端可以在请求时指定使用某一个 Plugin。
* `cn.leancloud.play.plugin.MasterIsWatchingYouPlugin` 这个 Plugin 文件中写了一段示例的代码，这段示例代码的作用是拦截用户发来的事件请求，如果发现它没有将消息发送给 MasterClient，则强制让消息发给 MasterClient 一份，并通知房间内所有人有人偷偷发了一条不想让 MasterClient 看到的消息。

下面我们撰写自己的代码：

在 `MyFancyPluginFactory` 中我们只简单的使用一个 Plugin，所以注释掉示例代码，重新写一个简单的 `create` 方法，即不管什么情况下都使用 `MasterIsWatchingYouPlugin`：

```java
@Override
public Plugin create(BoundRoom boundRoom, String s, Map<String, Object> map) {
  return new MasterIsWatchingYouPlugin(boundRoom);
}
```

然后在 `MasterIsWatchingYouPlugin` 中新增一个 `onCreateRoom` hook 函数，这个函数会在 Client 试图创建房间时被触发。我们先仅仅只打印一行日志出来。

```java
import cn.leancloud.play.plugin.context.CreateRoomContext;
import cn.leancloud.play.utils.Log;

public class MasterIsWatchingYouPlugin extends AbstractPlugin {
  ......

  @Override
  public void onCreateRoom(CreateRoomContext ctx) {
    Log.info("onCreateRoom 被触发");
    ctx.continueProcess();
  }
}
```

#### 将 Plugin 代码打包到本地服务端中
在 `multiplayer-server-plugin-getting-started-x.x` 目录下执行如下命令：

```
mvn clean package
```

完成后拷贝刚生成的 `multiplayer-server-plugin-getting-started-x.x/target/multiplayer-server-plugin-getting-started-x.x-jar-with-dependencies.jar` 这个 jar 包到 `leangame` 本地服务器启动目录的 `extensions` 文件夹内：

```
# 回到 project 目录
cd ../
cp multiplayer-server-plugin-getting-started-x.x/target/multiplayer-server-plugin-getting-started-x.x-jar-with-dependencies.jar game-standalone/extensions
```

此时本地服务器已经在启动当中，我们略微等待十几秒到 1 分钟后，代码就会被加载。


#### 触发 Plugin 代码

在游戏引擎中创建房间：

```js
client.connect().then(()=> {
  // 连接成功
  return client.createRoom('room001');
}).then(() => {
  // 创建房间成功
}).catch((error) => {
  // 连接失败
  console.error(error);
});
```

```cs
await client.Connect();
await client.CreateRoom("room001");
```

创建房间成功后，我们再去查看服务端产生的日志，

```
cd game-standalone/logs
cat plugin.log
```

在日志文件中我们可以看到自己之前在 plugin 代码中打印出的日志：

```
onCreateRoom 被触发
```

### 日志

在 `game-standalone/logs/` 中可以找到如下日志：

文件 | 说明
---- | ---
plugin.log | game-server hook 输出的日志
gc-XXX.current | GC 日志
server.log | game-server 运行日志
stdout.log | 进程的标准输出
event.log | 事件日志，如用户登录登出等

## 部署到云端

### 开启独立 Server
部署到云端前，必须先开启多人对战的独立 Server。进入「应用控制台」-「游戏」-「多人在线对战」-「设置」，开启独立 Server 后就可以把代码部署到云端了。

### 用命令行工具部署
我们仅需要把 plugin 的代码部署到云端，首先在根目录中登录 LeanCloud：

```
cd multiplayer-server-plugin-getting-started/
lean login
```

登录后，选择关联**华东节点**下的应用。

```
lean switch
```

在第一步选择 App 中，选择您的游戏对应的 LeanCloud 应用。**在第二步选择云引擎分组时，必须选择 _multiplayer-server 分组**，LeanCloud 仅对该分组提供专门针对 Multiplayer Server 的优化维护及各种支持，如图所示：

![image](images/multiplayer-server-lean-switch.png)

然后将代码部署到云端

```
lean deploy
```

部署到云端后，我们可以在游戏引擎中停止指定连接本地服务器，改为连接线上服务器

```js
const client = new Client({
  appId: {{appid}},
  appKey: {{appkey}},
  userId: userId
  // 指定连接本地的 Server 地址
  // playServer: 'http://localhost:8081',  // 连接线上服务器时，去掉本行代码
  // 关闭 ssl
  // ssl: false  // 连接线上服务器时，去掉本行代码
});
```

```cs
var client = new Client({{appid}}, {{appkey}}, userId);
await client.Connect();
```

### 日志
部署到云端后，控制台只会显示自行打印的日志，也就是在本地 plugin.log 文件中的日志。


## 开发指南
如何撰写 Plugin 中的代码，请参考 [多人对战 Server 开发指南 &middot; Java](multiplayer-server-guide-java.html)。
