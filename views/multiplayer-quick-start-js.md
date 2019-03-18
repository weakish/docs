{% extends "./multiplayer-quick-start.tmpl" %}

{% set platform = "JavaScript" %}



{% block installation %}
实时对战客户端 SDK 是开源的，您可以直接下载 [Release 版本](https://github.com/leancloud/Play-SDK-JS/releases)。源码请访问 [Play-SDK-JS](https://github.com/leancloud/Play-SDK-JS)。

## 支持开发平台

微信开发者工具：微信小程序 / 微信小游戏

CocosCreator：Mac、Web、微信小游戏、Facebook Instant Game、iOS、Android。

LayaAir：微信小游戏

Egret：Web


### Cocos Creator

[下载 `play.js`](https://github.com/leancloud/Play-SDK-JS/releases) 并拖拽至 Cocos Creator 工程中，选择「插件」模式导入。可参考 [Cocos Creator 插件脚本](https://docs.cocos.com/creator/manual/zh/scripting/plugin-scripts.html)。

在 Cocos Creator 中选中刚刚导入的 play.js 文件，在「属性检查器」选中以下所有选项：
* 导入为插件
* 允许 Web 平台加载
* 允许编辑器加载
* 允许 Native 平台加载

如图所示：

![image](images/cocos-creator-multiplayer-install.png)


### LayaAir

[下载 `play-laya.js`](https://github.com/leancloud/Play-SDK-JS/releases) 至 Laya 工程的 bin/libs 目录下。

在 bin/index.html 中项目「IDE 生成的 UI 文件」之前引入刚下载的 SDK 文件：

```diff
  <!--提供了制作 UI 的各种组件实现-->
    <script type="text/javascript" src="libs/laya.ui.js"></script>
  <!--用户自定义顺序文件添加到这里-->
  <!--jsfile--Custom-->
+   <script src="libs/play-laya.js"></script>
  <!--jsfile--Custom-->
  <!--IDE 生成的 UI 文件-->
  <script src="../src/ui/layaUI.max.all.js"></script>
```

### Egret

[下载 `play-egret.zip`](https://github.com/leancloud/Play-SDK-JS/releases) 并解压至 Egret 工程的 libs 目录下。

在 Egret 工程中的 egretProperties.json 文件中添加 SDK 配置：

```diff
{
  "engineVersion": "5.2.13",
  "compilerVersion": "5.2.13",
  "template": {},
  "target": {
    "current": "web"
  },
  "modules": [
    {
      "name": "egret"
    },
    ...
+    {
+      "name": "Play",
+      "path": "./libs/play"
+    }
  ]
}
```

在 Egret 工程下，执行 `Egret build -e` 命令，如果在 manifest.json 中生成了 SDK 引用，说明 SDK 安装成功。

```diff
{
  "initial": [
    "libs/modules/egret/egret.js",
    ...
+    "libs/play/Play.js"
  ],
  "game": [
    ...
  ]
}
```

可参考 [Egret 第三方库使用方法](http://developer.egret.com/cn/github/egret-docs/extension/threes/instructions/index.html)。

### 微信小程序

[下载 `play-weapp.js`](https://github.com/leancloud/Play-SDK-JS/releases) 并拖拽至微信小程序的工程目录下即可。

### Node.js 安装

安装与引用 SDK：

```sh
npm install @leancloud/play --save。
```


## 日志

日志可以方便我们追踪问题，SDK 支持在浏览器和 Node.js 环境下打开日志调试。调试日志开启后，SDK 会把网络请求、错误消息等信息输出到 console 中。

### 浏览器

浏览器环境下，请打开浏览器的控制台，运行以下命令：

```shell
localStorage.debug = 'Play'
```

### Node.js

Node.js 环境下，需要将环境变量 DEBUG 设置为 `Play`，你可以在启动某个命令之前设置环境变量。
下面以本地启动云引擎调试的命令 `lean up` 为例：

```sh
# Unix
DEBUG='Play' lean up
# Windows cmd
set DEBUG=Play lean up
```

{% endblock %}


{% block import %}
导入 SDK

```javascript
const { Client, Region, Event, ReceiverGroup, setAdapters, LogLevel, setLogger } = Play;
```

```javascript
const client = new Client({
    // 设置 APP ID
    appId: YOUR_APP_ID,
    // 设置 APP Key
    appKey: YOUR_APP_KEY,
    // 设置节点地区
    // EastChina：华东节点
    // NorthChina：华北节点
    // NorthAmerica：美国节点
    region: Region.EastChina
    // 设置用户 id
    userId: 'leancloud'
    // 设置游戏版本号（选填，默认 0.0.1）
    gameVersion: '0.0.1'
});
```
{% endblock %}


{% block connection %}
```javascript
client.connect().then(()=> {
  // 连接成功
}).catch((error) => {
  // 连接失败
    console.error(error.code, error.detail);
});
```
{% endblock %}



{% block connectio_event %}
```javascript
// 例如，有 4 个玩家同时加入一个房间名称为 「room1」 的房间，如果不存在，则创建并加入
client.joinOrCreateRoom('room1').then(() => {
    // 加入或创建房间成功
}).catch((error) => {
    // 加入房间失败，也没有成功创建房间
    console.error(errod.code, error.detail);
});
```

`joinOrCreateRoom` 通过相同的 roomName 保证两个客户端玩家可以进入到相同的房间。请参考 [开发指南](multiplayer-guide-js.html#加入或创建指定房间) 获取更多关于 `joinOrCreateRoom` 的用法。
{% endblock %}



{% block join_room %}
```javascript
// 注册新玩家加入房间事件
client.on(Event.PLAYER_ROOM_JOINED, (data) => {
  const { newPlayer } = data;
  console.log(`new player: ${newPlayer.userId}`);
  if (client.player.isMaster) {
    // 获取房间内玩家列表
    const playerList = client.room.playerList;
    for (let i = 0; i < playerList.length; i++) {
      const player = playerList[i];
      // 判断如果是房主，则设置 10 分，否则设置 5 分
      if (player.isMaster) {
        player.setCustomProperties({
          point: 10,
        });
      } else {
        player.setCustomProperties({
          point: 5,
        });
      }
    }
    // ...
  }
});
```
{% endblock %}



{% block player_custom_props_event %}
```javascript
// 注册「玩家属性变更」事件
client.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, data => {
  const { player } = data;
  // 解构得到玩家的分数
  const { point } = player.customProperties;
  console.log(`${player.userId}: ${point}`);
  if (player.isLocal) {
    // 判断如果玩家是自己，则做 UI 显示
    this.scoreLabel.string = `score:${point}`;
  }
});
```
{% endblock %}



{% block win %}
```javascript
if (client.player.isMaster) {
  client.sendEvent('win', { winnerId: client.room.masterId }, { receiverGroup: ReceiverGroup.All });
}
```
{% endblock %}



{% block custom_event %}
```javascript
// 注册自定义事件
client.on(Event.CUSTOM_EVENT, event => {
  // 解构事件参数
  const { eventId, eventData } = event;
  if (eventId === 'win') {
    // 解构得到胜利者 Id
    const { winnerId } = eventData;
    console.log(`winnerId: ${winnerId}`);
    // 如果胜利者是自己，则显示胜利 UI；否则显示失败 UI
    if (client.player.actorId === winnerId) {
      this.resultLabel.string = 'win';
    } else {
      this.resultLabel.string = 'lose';
    }
    client.close().then(() => {
      // 断开连接成功
    });
  }
});
```
{% endblock %}



{% block demo %}
我们在 Cocos Creator、LayaAir、Egret Wing 中都完成了这个 Demo，供大家运行和参考。

[QuickStart 工程](https://github.com/leancloud/Play-Quick-Start-JS)。


## 构建注意事项

你可以通过 Cocos Creator 构建出其支持的工程.

其中仅在构建 Android 工程时需要做一点额外的配置，需要在初始化 `play` 之前添加如下代码：

```js
onLoad() {
  const { setAdapters } = Play;
  if (cc.sys.platform === cc.sys.ANDROID) {
    const caPath = cc.url.raw('resources/cacert.pem');
    setAdapters({
      WebSocket: (url) => new WebSocket(url, null, caPath)
    });
  }
}
```

这样做的原因是 SDK 使用了基于 WebSocket 的 wss 进行安全通信，需要通过以上代码适配 Android 平台的 CA 证书机制。
{% endblock %}
