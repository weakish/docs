# Client Engine 总览

**在阅读本文档之前，请先阅读[实时对战服务总览](multiplayer.html)及 [MasterClient](multiplayer-guide-js.html#MasterClient) ，了解实时对战开发的基础结构。**

Client Engine 是 LeanCloud Play 提供的实时对战游戏 Client 托管方案。实时对战服务提供了 MasterClient 机制来控制游戏逻辑：MasterClient 是一个特殊的 Client，它接收和处理游戏内的所有事件与消息，进行实时处理之后将结果下发给其他游戏客户端，用以控制游戏向下执行。开发者可以基于实时对战 SDK 开发出一套完整的 MasterClient 逻辑，继而将这样的「客户端」托管到 Client Engine，省去程序部署、运维的负担。如图所示：

![image](images/client-engine-structure.png)

除了 MasterClient 的托管外，开发者还可以在 Client Engine 中

* 托管普通的虚拟玩家，增加游戏的趣味性和活跃度。
* 自定义 REST API 来完成其他逻辑的开发。

将游戏逻辑托管在 Client Engine 有以下优势：

* 网络延迟更低。游戏运行过程中涉及到「游戏玩家」-「实时对战云端」- MasterClient 三方非常频繁的消息交互， Client Engine 与实时对战云端处于同一物理网络，可以大幅减少公网的传输延迟。
* 运维支持更成熟。Client Engine 提供了完善的日志收集、状态监控、负载均衡以及自动容错恢复机制，可以提供更高的稳定性保障。
* 自由伸缩更有弹性。Client Engine 提供了庞大的资源池，可以快速响应单个游戏产品临时的、突发的扩容需求，无需手动调整实例，自动完成扩容。

## 文档及 Demo

详细的使用方式请参考文档：

* [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.html) 介绍了从初始项目开始，如何本地开发调试，以及部署到云端。
* [你的第一个 Client Engine 小游戏 · Node.js](client-engine-first-game-node.html) 该文档帮助您快速上手，通过 Client Engine 实现一个剪刀石头布的猜拳小游戏。完成本文档教程后，您会对 Client Engine 的基础使用流程有初步的理解。
* [Client Engine 开发指南 · Node.js](client-engine-guide-node.html) 在初始项目的基础上深入讲解 Client Engine SDK。


示例 Demo：

* [回合制 Demo](game-demos.html#回合制 Demo)。

## 价格及试用

Client Engine 正在公测中，公测期间免费使用，开发版最大可使用 100% CPU，商用版最大可使用 200% CPU，如果您需要更高额度，请联系 support@leancloud.rocks。

开启试用：打开 LeanCloud 应用[控制台](/dashboard/app.html?appid={{appid}})，进入「Play」->「Client Engine」->「部署」页面，点击「试用 Client Engine」。

未来收费方案如下：

按照 CCU 或 CPU 用量来计费，这里的 CCU 指的是托管在 Client Engine 中的同时在线的 Client 数量。

* 开发版：免费 20CCU / 天（自然天，0:00 ~ 24:00），不支持自动扩容及负载均衡。
* 商用版：计费时根据每天的峰值 CCU 和峰值 CPU 用量分别统计，只会选择其中较大的一个费用进行扣除，具体费用为：
  * 每 100 CCU 国内节点 ¥4，美国节点 $1。
  * 每 50% CPU 国内节点 ¥4，美国节点 $1。

举例：例如您的应用当天在 Client Engine 中最高使用了 80 CCU，消耗 CPU 80%，按 CCU 计费为 4 元钱，按 CPU 收费为 8 元钱，实际收费为 8 元钱。

> 在正式收费之时，以上价格和标准可能会发生调整和变动，届时均以公布价格为准。