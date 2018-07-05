# Play Cocos 入门教程

欢迎使用 LeanCloud Play。本教程将通过在 Cocos Creator 环境下模拟一个比较玩家分数大小的场景，来讲解 Play SDK 的核心使用方法。

我们推荐通过以下方法来学习：

1. 下载 [QuickStart 工程](https://github.com/leancloud/Play-SDK-JS/tree/master/demo/QuickStart)，通过 Cocos Creator 打开 QuickStart 工程，浏览和运行 QuickStart 代码，观察日志输出。
2. 创建一个新的 Cocos Creator 工程，安装好 SDK 后，替换你申请的 App ID 和 App Key，根据 QuickStart 代码尝试修改并运行，观察变化。

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
opts.appId = YOUR_APP_ID;
// 设置 APP Key
opts.appKey = YOUR_APP_KEY;
// 设置节点地区
// EAST_CN：华东节点
// NORTH_CN：华北节点
// US：美国节点
opts.region = Region.EAST_CN;
play.init(opts);
```

## 设置玩家 ID

```javascript
play.userId = randId.toString();
```

## 连接至 Play 服务器

```javascript
play.connect();
```

连接成功或失败，会通过 `CONNECTED` 或 `CONNECT_FAILED` 事件来通知客户端。如有需求，可以通过注册这些事件。
这个 demo 通过注册 `JOINED_LOBBY` （加入到大厅）事件来执行后续逻辑。

## 创建或加入房间

```javascript
play.on(Event.JOINED_LOBBY, () => {
  console.log('on joined lobby');
  const roomName = 'cocos_creator_room';
  play.joinOrCreateRoom(roomName);
});
```

joinOrCreateRoom 通过相同的 roomName，保证两个客户端玩家可以进入到相同的房间。

## 通过 CustomPlayerProperties 同步玩家属性

```javascript
play.on(Event.NEW_PLAYER_JOINED_ROOM, (newPlayer) => {
  console.log(`new player: ${newPlayer.userId}`);
  if (play.player.isMaster()) {
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
    const options = new SendEventOptions();
    play.sendEvent('win', { winnerId: play.room.masterId }, options);
  }
});
```

注册 `NEW_PLAYER_JOINED_ROOM` 事件，即 当有新玩家加入房间时，Master 为每个玩家分配一个分数。（这里没有做更复杂的算法，只是为 Master 分配了 10 分，其他玩家分配了 5 分）。

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

这样，玩家就可以得到 Master「为每个玩家分配的分数」了。

## 通过「自定义事件」通信

```javascript
var options = new SendEventOptions();
play.sendEvent('win', { winnerId: play.room.masterId }, options);
```

当分配完分数后，将获胜者（Master）的 ID 作为参数，通过自定义事件发送给所有玩家。

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


