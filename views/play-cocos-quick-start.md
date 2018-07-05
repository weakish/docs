# Play Cocos 入门教程

欢迎使用 LeanCloud Play。本教程将通过在 Cocos Creator 环境下模拟一个比较玩家点数大小的场景，来讲解 Play SDK 的核心使用方法。

Play 已开放公测，所有应用均可试用。最大免费使用 100 CCU，如果您需要更高额度，请联系 support@leancloud.rocks

// 修改
我们推荐通过以下方法来学习：

1. 下载 [QucikStart 工程](https://github.com/leancloud/Play-SDK-JS/tree/master/demo/QuickStart)，通过 Cocos Creator 打开 QucikStart 工程，浏览和运行 QucikStart 代码，观察日志输出。
2. 创建一个新的 Cocos Creator 工程，安装好 SDK 后，替换你申请的 App ID 和 App Key，根据 QucikStart 代码尝试修改并运行，观察变化。

## 安装

Play 客户端 SDK 是开源的，源码地址请访问：[Play-SDK-JS](https://github.com/leancloud/Play-SDK-JS)。
也可以直接下载 Release 版本，[下载地址](https://github.com/leancloud/Play-SDK-JS/releases)。
将下载的 Play.js 拖拽至 Cocos Creator 项目中即可。

## 初始化

导入需要类和变量

```javascript
import {
  play,
  PlayOptions,
  Region,
  Event,
  SendEventOptions,
} from '../play';
```
其中 play 是全局变量，表示唯一客户端。

```javascript
const opts = new PlayOptions();
// 设置 APP ID
opts.appId = '315XFAYyIGPbd98vHPCBnLre-9Nh9j0Va';
// 设置 APP Key
opts.appKey = 'Y04sM6TzhMSBmCMkwfI3FpHc';
// 设置节点区域
opts.region = Region.EAST_CN;
play.init(opts);
// 设置玩家 ID
play.userId = randId.toString();
```

## 连接至 Play 服务器

```javascript
play.connect();
```

## 创建或加入房间

```javascript
const roomName = 'cocos_creator_room';
play.joinOrCreateRoom(roomName);
```

## 通过 CustomPlayerProperties 同步玩家属性

```javascript
// 获取房间玩家列表
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
```

注册「玩家属性变更」事件

```javascript
play.on(Event.PLAYER_CUSTOM_PROPERTIES_CHANGED, data => {
  const { player } = data;
  const { point } = player.getCustomProperties();
  console.log(`${player.userId}: ${point}`);
  if (player.isLocal()) {
    this.scoreLabel.string = `score:${point}`;
  }
});
```

## 通过「自定义事件」通信

```javascript
var options = new SendEventOptions();
play.sendEvent('win', { winnerId: play.room.masterId }, options);
```

注册「自定义事件」

```javascript
play.on(Event.CUSTOM_EVENT, event => {
  // 解构事件参数
  const { eventId, eventData } = event;
  if (eventId === 'win') {
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


