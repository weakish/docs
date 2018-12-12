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

## 使用文档

详细的使用方式请参考文档：

* [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.html) 介绍了从初始项目开始，如何本地开发调试，以及部署到云端。
* [Client Engine 开发指南 · Node.js](client-engine-guide-node.html) 对初始项目的逻辑、提供的通用属性方法等进行了详细的说明，最终您可以在初始项目的基础上完成自己的游戏。

## 试用

Client Engine 正在公测中，公测期间免费试用。

开启试用：打开 LeanCloud 应用[控制台](/app.html?appid={{appid}})，进入「Play」->「Client Engine」->「部署」页面，点击「试用 Client Engine」。

