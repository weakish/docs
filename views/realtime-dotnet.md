{% import "views/_im.md" as imPartial %}

# 即时通讯开发指南 · .NET

## 简介

在阅读本开发指南之前，请先阅读下[《即时通讯开发指南》](./realtime_v2.html)，了解即时通讯的基本概念和模型。

### 使用场景
LeanCloud 即时通讯服务的目标是在开发者没有任何服务端开发经验以及不需要自己拥有服务器的情况下实现如下应用场景：

- 类陌陌，类微信的社交聊天应用或者匿名聊天应用
- 类似于 Slack 的协同办公聊天工具
- 视频直播，比赛直播里面的文字聊天
- 在线聊天的客服系统 - 正在研发针对此类场景的新协议和 API ，敬请期待

## 安装与初始化

### 导入 SDK

- [iOS SDK 安装指南 - 即时通讯模块](sdk_setup-objc.html)
- [Android SDK 安装指南 - 即时通讯模块](sdk_setup-android.html)
- [JavaScript SDK 安装指南 - 即时通讯模块](sdk_setup-js.html)
- [C# SDK 安装指南 - 即时通讯模块](sdk_setup-dotnet.html#_NET_Framework)
- [Unity SDK 安装指南 - 即时通讯模块](sdk_setup-dotnet.html#Mono_for_Unity)

### 初始化即时通讯服务

```cs
// 初始化当前平台的 WebSocket 类库
Websockets.Net.WebsocketConnection.Link();
AVRealtime realtime = new AVRealtime(appId, appKey);
```

### 打开调试日志
```cs
AVRealtime.WebSocketLog(Console.WriteLine);
```

## 场景分类

LeanCloud 即时通讯服务有如下几个特点：

- 不侵入开发者的用户系统
- 自主研发的可拓展的聊天协议
- 开发者自主的权限控制流程
- 云端 Hook 配合客户端实现管理需求

因此本文根据具体的使用场景详细介绍针对该场景所应该使用的接口和最佳实践的代码逻辑。

### 社交场景
社交软件和应用一直是移动研发领域的热点和难点，大热如微信和陌陌，难点也在于聊天的流程多样性，因此我们针对社交场景下的一些常见需求进行演示。

#### 私聊

开始之前，一定要强调的是私聊中如何实现两个人成为好友，以及成为好友之后才可以开始聊天这一鉴权过程**并不是** LeanCloud 即时通讯提供的服务内容，它属于开发者自主掌控的鉴权逻辑，这一章节可以在[安全与鉴权](#安全与鉴权)中阅读解决方案。

首先我们假设系统中存在两个用户，Tom 和 Jerry，以下我们演示 Tom 分别登录到聊天服务器：

```cs
AVRealtime realtime;
AVIMClient client;
AVIMConversation conversation;
realtime = new AVRealtime(appId, appKey);
string clientId = "Tom";
Console.WriteLine(clientId + " connecting...");
client = await realtime.CreateClientAsync(clientId);
Console.WriteLine(clientId + " connected.");
```

##### 建立私聊对话
在 LeanCloud 即时通讯中把所有聊天的载体定义为一个「对话」，这个可以参照微信的私聊加入另外一个人之后就会变成一个新的 3 人的对话去理解，私聊和群聊的最大区别就是人数等于 2 的就是私聊，大于 2 的就是群聊。

```cs
conversation = await client.CreateConversationAsync("Jerry", name: "Tom 和 Jerry 的私聊对话");
```

##### 私聊发送消息
对话创建之后，在对话里面的成员就可以发送消息，这里请一定明确一个概念

> 消息的接收方是对话，而不是某一个具体的终端，对话里面的成员都会接收到该消息

因此在私聊的场景下，很容易给开发者造成一个**假象**「消息是发给某一个用户的」。

```cs
var textMessage = new AVIMTextMessage("人民的名义挺好看的");
await conversation.SendMessageAsync(textMessage);
```

##### 私聊接收消息

一般意义上的在线聊天应用，都依赖于客户端监听消息接收的事件，然后自移动互联网时代开始，在线的概念被弱化，因此我们需要详细介绍在线和不在线的不同的接收方式：

###### 1.接收方在线

当私聊的消息接收者登录到系统之后，一定要给他设置接收消息的监听：

```cs
client.OnMessageReceived += (sender, e) => 
{
    // 在这里编写接收到消息的业务逻辑
};
```

当消息抵达时，可以用如下代码将消息在前端展示：

```cs
client.OnMessageReceived += (sender, e) => 
{
    if(e.Message is AVIMTextMessage)
    {
        Console.WriteLine("received text message :" + ((AVIMTextMessage)e.Message).Content);
    }
};
```

###### 2.接收方不在线

不在线的情况有以下几种需求：

 A. 对方下次上线之后能够收到离线消息，并且希望发送方能知道对方什么时候收到了（经典的 QQ 电脑版的设计）

 B. 只要在线的人收到即可，不在线的没收到不影响业务逻辑（类似于聊天室直播足球比赛）

 C. 走移动端的推送服务，将离线消息作为推送消息推到接收者的手机上（微信等新时代的移动社交聊天应用）


以上三种情况对应着不同的实现逻辑，而在我们当前的社交聊天场景下对应的就是上述的 C 类，详细请阅读这部分文档：[离线推送通知](realtime_v2.html#离线推送通知)可以了解相关流程。

A 类需求，可以使用如下代码来实现，下一次登录的时候，获取到离线消息：


```cs
realtime.OnOfflineMessageReceived += (sender, e) => 
{
    Console.WriteLine("received offline message :" + e.Message.GetType());
};
// 一定要在登录之前设定离线消息的监听回调，因为离线消息默认是一上线就推送过来的，类似于 QQ 那样，因此开发者需要谨慎的处理瞬间接受到的批量消息，刷新到 UI 上做好控制
client = await realtime.CreateClientAsync(clientId);
```

B 类需求对应的是另一种对话类型-聊天室，详细请阅读后面的章节 [直播聊天室](#直播聊天室)


### 协同办公聊天工具

[Slack](https://slack.com/) 是目前最流行的协同办公聊天工具，Slack 里面频道(Channel)的概念就等同于 LeanCloud 定义的对话的概念

#### 群聊
群聊我们建议用户通过一个自定义的属性来标记一下这个对话是群聊即可，这个实现方式非常自由，开发者可掌控的空间更大，逻辑更灵活：

##### 创建群聊

```cs
AVRealtime realtime;
AVIMClient client;
AVIMConversation groupChat;
realtime = new AVRealtime(appId, appKey);
string clientId = "Tom";
Console.WriteLine(clientId + " connecting...");
client = await realtime.CreateClientAsync(clientId);
Console.WriteLine(clientId + " connected.");
// 用自定义的 type 字段来
groupChat = await client.CreateConversationAsync(members: new string[] { "Jerry", "Harry" }, options: new Dictionary<string, object>()
{
    {"type","group"}
});
```

##### 加人

```cs
await client.InviteAsync(groupChat, "Bob");
```

##### 踢人

```cs
await client.KickAsync(groupChat, "Harry");
```

##### 退出

```cs
await client.LeftAsync(groupChat);
```

注：加人和踢人会产生事件通知，参与者都会接收到不同的事件回调，这个请参照[事件监听-人员变更](#事件监听_人员变更)

发送消息和私聊没有任何区别可以参照私聊的代码。

### 直播聊天室
这类场景有一个区别于社交场景的需求：

> 直播聊天室的人员变动比较频繁，而且并不是很关注谁进来了，谁走了，而且不存在所谓的离线消息，离开了聊天室自然就不会收到消息，哪怕是推送也不应该发送

因此聊天室的功能比较简单，需要在创建对话的时候指定一个参数，云端就会知晓这是一个聊天室（暂态对话），其余操作与一个对话没有任何本质区别，均可以使用之前的实例代码来操作：

#### 创建聊天室
```cs
// isTransient 表示创建一个暂态对话，也就是通俗意义上的聊天室
var chatRoom = await client.CreateConversationAsync(members: new string[] { "Jerry", "Harry" }, isTransient: true);
```

聊天室的其他操作例如加人，踢人与普通对话无本质区别均可以调用。

## 事件监听-人员变更

假设对话中存在 A,B,C 三个成员，每一种操作对应的事件监听如下:


### A 邀请 D 加入对话

```cs
await clientA.InviteAsync(groupChat, "D");
```

A|B|C|D
---|---|---|---
OnMembersJoined|OnMembersJoined|OnMembersJoined|OnInvited

### A 将 B 踢出对话

```cs
await clientA.KickAsync(groupChat, "B");
```

A|B|C
---|---|---
OnMembersLeft|OnKicked|OnMembersLeft

### A 退出对话

```cs
await clientA.LeftAsync(groupChat);
```

A|B|C
---|---|---
N/A|OnMembersLeft|OnMembersLeft

## 消息

{{ imPartial.customMessage() }}

{{ imPartial.willMessage() }}

{{ imPartial.signature() }}

{{ imPartial.exception() }}





