# Client Engine 总览

**在阅读本文档之前，请先阅读[实时对战服务总览](multiplayer.html)及 [MasterClient](multiplayer.html#相关概念) ，了解实时对战开发的基础结构。**

Client Engine 是 Play 实时对战服务（Multiplayer Cloud）的服务端模块，提供在服务端控制游戏逻辑的功能。在 Client Engine 中，我们将控制游戏逻辑的 MasterClient 托管在服务端，如图所示：

![image](images/client-engine-structure.png)

在这个结构中，服务端负责创建房间，创建房间后由 MasterClient 控制游戏内的逻辑。在我们提供的[初始项目](https://github.com/leancloud/client-engine-nodejs-getting-started)中，具体的流程为：

1. 客户端通过 Websocket 连接到实时对战服务，向实时对战服务请求匹配房间。
2. 如果实时对战服务没有合适的房间，客户端转而向 Client Engine 发起 HTTP 请求新建房间。
3. Client Engine 每次收到请求后都会创建一个 MasterClient ，MasterClient 连接实时对战服务并创建房间，返回房间名称给客户端。
4. 客户端通过 Client Engine 返回的房间名称加入房间，MasterClient 和客户端在同一房间内通过实时对战服务进行消息互动，完成对游戏逻辑的控制。

Client Engine 十分灵活，您也可以根据自己的需求增加更加定制化的功能，例如：增加机器人 Client 在房间内陪玩家一起玩游戏等。

## 使用文档

详细的使用方式请参考文档：

* [Client Engine 快速入门 · Node.js](client-engine-quick-start-node.html)
* [Client Engine 开发指南 · Node.js](client-engine-guide-node.html)