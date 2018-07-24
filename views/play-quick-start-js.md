# Play Cocos 入门教程

欢迎使用 LeanCloud Play。本教程将通过在 Cocos Creator 环境下模拟一个比较玩家分数大小的场景，来讲解 Play SDK 的核心使用方法。

我们推荐通过以下方法来学习：

1. 下载 [QuickStart 工程](https://github.com/leancloud/Play-Quick-Start-JS)，通过 Cocos Creator 打开 QuickStart 工程，浏览和运行 QuickStart 代码，观察日志输出。
2. 创建一个新的 Cocos Creator 工程，安装好 SDK 后，替换你申请的 App ID 和 App Key，根据 QuickStart 代码尝试修改并运行，观察变化。

## 安装

Play 客户端 SDK 是开源的，源码地址请访问：[Play-SDK-JS](https://github.com/leancloud/Play-SDK-JS)。
也可以直接下载 Release 版本，[下载地址](https://github.com/leancloud/Play-SDK-JS/releases)。
将下载的 Play.js 拖拽至 Cocos Creator 项目中即可。

## 初始化

导入需要的类和变量

```javascript
import {
  play,
  Region,
  Event,
} from '../play';
```
其中 `play` 是 SDK 实例化并导出的 Play 的对象，并不是 Play 类。

```javascript
const opts = {
  // 设置 APP ID
  appId: YOUR_APP_ID,
  // 设置 APP Key
  appKey: YOUR_APP_KEY,
  // 设置节点地区
  // EastChina：华东节点
  // NorthChina：华北节点
  // NorthAmerica：美国节点
  region: Region.EastChina,
}
play.init(opts);
```

## 设置玩家 ID

```javascript
// 这里使用随机数作为 userId
const randId = parseInt(Math.random() * 1000000, 10);
play.userId = randId.toString();
```

## 连接至 Play 服务器

```javascript
play.connect();
```

连接完成后，会通过 `CONNECTED`（连接成功） 或 `CONNECT_FAILED`（连接失败） 事件来通知客户端。

## 创建或加入房间

默认情况下，Play SDK 会在连接成功后自动加入大厅；玩家在大厅中，创建 / 加入指定房间。

```javascript
// 注册加入大厅成功事件
play.on(Event.LOBBY_JOINED, () => {
  console.log('on joined lobby');
  const roomName = 'cocos_creator_room';
  play.joinOrCreateRoom(roomName);
});
```

joinOrCreateRoom 通过相同的 roomName，保证两个客户端玩家可以进入到相同的房间。
更多`joinOrCreateRoom`，请参考 [开发指南](play-js.html#创建房间)。

## 通过 CustomPlayerProperties 同步玩家属性

当有新玩家加入房间时，Master 为每个玩家分配一个分数，这个分数通过「玩家自定义属性」同步给玩家。
（这里没有做更复杂的算法，只是为 Master 分配了 10 分，其他玩家分配了 5 分）。

```javascript
// 注册新玩家加入房间事件
play.on(Event.PLAYER_ROOM_JOINED, (newPlayer) => {
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

玩家得到分数后，显示自己的分数。

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

## 通过「自定义事件」通信

当分配完分数后，将获胜者（Master）的 ID 作为参数，通过自定义事件发送给所有玩家。

```javascript
if (play.player.isMaster()) {
  play.sendEvent('win', 
    { winnerId: play.room.masterId }, 
    { receiverGroup: ReceiverGroup.All });
}
```

根据判断胜利者是不是自己，做不同的 UI 显示。

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


