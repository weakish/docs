{% extends "./multiplayer-quick-start.tmpl" %}

{% set platform = "JavaScript" %}



{% block installation %}
实时对战客户端 SDK 是开源的，源码地址请访问 [Play-SDK-JS](https://github.com/leancloud/Play-SDK-JS)。也可以直接下载 [Release 版本](https://github.com/leancloud/Play-SDK-JS/releases)。

## 支持开发平台

微信开发者工具：微信小程序 / 微信小游戏

CocosCreator：Mac、Web、微信小游戏、Facebook Instant Game、iOS、Android。

LayaAir：微信小游戏


### Cocos Creator

下载 `play.js` 并拖拽至 Cocos Creator 项目中即可。**注意不要选择「插件方式」**。

如果你通过浏览器调试，可以选择开启 SDK 的调试日志（debug log）来方便追踪问题。调试日志开启后，SDK 会把网络请求、错误消息等信息输出到浏览器的 console 中。请打开浏览器的控制台，运行以下命令：

```shell
localStorage.debug = 'Play'
```

### LayaAir

下载 `play-laya.js` 至 Laya 工程的 bin/libs 目录下。

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

### 微信小程序

下载 `play-weapp.js` 并拖拽至微信小程序的工程目录下即可。

### Node.js 安装

安装与引用 SDK：

```sh
npm install @leancloud/play --save。
```

为方便调试，你可以在 Node.js 平台中打开调试日志。这就需要将环境变量 DEBUG 设置为 `Play`。你可以在启动某个命令之前设置环境变量。下面以本地启动云引擎调试的命令 `lean up` 为例：

```sh
# Unix
DEBUG='Play' lean up
# Windows cmd
set DEBUG=Play lean up
```
{% endblock %}



{% block import %}
在微信小程序、Cocos、Node.js 中，按以下方法导入需要的类和变量：

```javascript
import {
  play,
  Region,
  Event,
} from '../play';
```
其中 `play` 是 SDK 实例化并导出的 Play 的对象，并不是 Play 类。

在 Laya 中，由于引擎负责加载模块，需要这样导入：

```javascript
const { play: p,
  Region, Event, ReceiverGroup, setAdapters, LogLevel, setLogger } = play;
```

**注意：由于 Laya 加载时将 play 作为了模块名，所以对于全局 play 对象，需要 alias。这里使用 p 表示。
如果您使用的是 Laya，请将下方示例代码中的 play 替换为 p**

```javascript
const opts = {
  // 设置 APP ID
  appId: YOUR_APP_ID,
  // 设置 APP Key
  appKey: YOUR_APP_KEY,
  // 设置节点地区
  // Region.EastChina：华东节点
  // Region.NorthChina：华北节点
  // Region.NorthAmerica：美国节点
  region: YOUR_APP_REGION,
}
play.init(opts);
```
{% endblock %}



{% block set_userid %}
```javascript
// 这里使用随机数作为 userId
const randId = parseInt(Math.random() * 1000000, 10);
play.userId = randId.toString();
```
{% endblock %}



{% block connection %}
```javascript
play.connect();
```
{% endblock %}



{% block connectio_event %}
```javascript
// 注册连接成功事件
play.on(Event.CONNECTED, () => {
  console.log('on joined lobby');
  const roomName = 'cocos_creator_room';
  play.joinOrCreateRoom(roomName);
});
```

`joinOrCreateRoom` 通过相同的 roomName 保证两个客户端玩家可以进入到相同的房间。请参考 [开发指南](multiplayer-guide-js.html#加入或创建指定房间) 获取更多关于 `joinOrCreateRoom` 的用法。
{% endblock %}



{% block join_room %}
```javascript
// 注册新玩家加入房间事件
play.on(Event.PLAYER_ROOM_JOINED, (data) => {
  const { newPlayer } = data;
  console.log(`new player: ${newPlayer.userId}`);
  if (play.player.isMaster()) {
    // 获取房间内玩家列表
    const playerList = play.room.playerList;
    for (let i = 0; i < playerList.length; i++) {
      const player = playerList[i];
      // 判断如果是房主，则设置 10 分，否则设置 5 分
      if (player.isMaster()) {
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
play.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, data => {
  const { player } = data;
  // 解构得到玩家的分数
  const { point } = player.getCustomProperties();
  console.log(`${player.userId}: ${point}`);
  if (player.isLocal()) {
    // 判断如果玩家是自己，则做 UI 显示
    this.scoreLabel.string = `score:${point}`;
  }
});
```
{% endblock %}



{% block win %}
```javascript
if (play.player.isMaster()) {
  play.sendEvent('win', 
    { winnerId: play.room.masterId }, 
    { receiverGroup: ReceiverGroup.All });
}
```
{% endblock %}



{% block custom_event %}
```javascript
// 注册自定义事件
play.on(Event.CUSTOM_EVENT, event => {
  // 解构事件参数
  const { eventId, eventData } = event;
  if (eventId === 'win') {
    // 解构得到胜利者 Id
    const { winnerId } = eventData;
    console.log(`winnerId: ${winnerId}`);
    // 如果胜利者是自己，则显示胜利 UI；否则显示失败 UI
    if (play.player.actorId === winnerId) {
      this.resultLabel.string = 'win';
    } else {
      this.resultLabel.string = 'lose';
    }
    play.disconnect();
  }
});
```
{% endblock %}



{% block demo %}
我们通过 Cocos Creator 完成了这个 Demo，供大家运行参考。

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