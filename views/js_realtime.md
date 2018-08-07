# JavaScript 即时通讯开发指南（version 2）

## 版本状态

<div class="callout callout-info">本文档介绍 JavaScript Realtime SDK version 2 的安装与使用。v2 目前为维护状态，将仅得到安全更新，不会增加新的功能。</div>

目前 SDK 的最新版本是 version 3。与 v2 相比，v3 的主要改进有：
* 提供了面向对象的，与其他平台 SDK 统一的 API
* Promise 化的异步 API
* 新的事件模型
* 完善的异常机制
* 可扩展的消息类型系统
* 新增对以下特性的支持：
  * 单点登录
  * 「未读消息通知」模式
  * 对话查询条件构造器
* 增强了断线重连的可靠性
* 采用了二进制协议，减少了传输消息时的流量消耗

需要指出的是：
* v3 不兼容 v2 的 API
* v3 停止了对 IE10 及以下版本的支持。如果需要支持这些运行环境请使用 v2。

v3 的详细使用文档请参考[《JavaScript 即时通讯开发指南》](./realtime_guide-js.html)。

从 v2 升级到 v3，请参考 [《JavaScript 即时通讯 SDK v3 迁移指南》](./realtime_js-v3-migration-guide.html)。

## 简介

感谢你使用 JavaScript 即时通讯 SDK，LeanCloud 的即时通讯服务每天处理请求数超过百万级，安全可靠，是你的明智之选。

你可以通过使用我们提供的 SDK，一行后端代码都不用写，就可以做一个功能完备的即时通讯应用、也可以做一个实时对战类的游戏，总之一切与即时通讯相关的业务都可以使用 LeanCloud 提供的即时通讯服务。

你还可以通过即时通讯 SDK 配合「[云引擎](leanengine_overview.html)」简单的实现之前可能需要很多人才能完成的即时通讯相关需求的开发，并且如果你达到我们的收费额度，也会以极低的成本支付你的使用费用，成本远远小于同等规模自建即时通讯服务。

本 SDK 实现轻量、高效、无依赖，支持浏览器与 node 运行环境。其中浏览器支持涵盖了移动终端的浏览器及各种 WebView，包括微信、PhoneGap、Cordova 的 WebView，同时 SDK 通过插件方式提供兼容 IE8 与 IE9 的方案。具体请看下面「[兼容方案](#兼容方案)」部分的说明。

### Demo

- [简单聊天 Demo](http://leancloud.github.io/js-realtime-sdk/demo/demo2/)，[源码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo/demo2)
- [LeanMessage Demo](http://leancloud.github.io/leanmessage-demo)，[源码](https://github.com/leancloud/leanmessage-demo/tree/master/Web)
- 热心用户提供的 [实时对战游戏 Demo](http://cutpage.sinaapp.com/)

### 贡献

你可以通过 GitHub 报告 bug 或者提出建议。如果觉得这个文档写的不够好，也可以帮助我们完善。

SDK 仓库地址：[https://github.com/leancloud/js-realtime-sdk](https://github.com/leancloud/js-realtime-sdk)

本文档仓库地址：[https://github.com/leancloud/docs](https://github.com/leancloud/docs)

## 概念

在你开始使用之前，首先来了解一下即时通讯 SDK 的基本结构。即时通讯在 SDK 里面分为两个层次：

* 一层是底层即时通讯基础模块，负责与服务器匹配和授权，建立基础的连接和底层控制。这个层次只会派发一些基础的事件出来，你可以通过 SDK 监听这些事件。这个层面 SDK 会保证底层连接的稳定，包括断开重试，心跳连接等策略；

* 另一层是业务逻辑层，用户可以使用 SDK 建立不同的 Conversation（对话）。一个 Conversation 就是一个独立的通信单元，但 Conversation 间一般是无法通信的。当然你可以自己在业务逻辑层，通过派发自定义事件的方式来封装其他自定义的逻辑。当创建一个新 Conversation 之后，对应的服务器端就会自动生成这个 Conversation，除非你自行删除，否则该 Conversation 一直存在。但是用户如果没有连接，该房间不会占用服务器资源，只是存储的一个数据条目；

如果想了解即时通讯的整体概念，请阅读「[即时通讯开发指南](realtime_v2.html)」。另外，我们也提供「[即时通讯 REST API](realtime_rest_api.html)」。

### 特别说明

Conversation（对话）这个概念也可以理解为 Room（房间）。几个客户端节点在通信之前要放到同一个房间中，其实这两个是一个概念，只是名字不同，SDK 中两个方法都可以使用。如果你觉得更喜欢 Room 这个概念，那就可以使用 room 方法创建 Room，如果喜欢 Conversation，那就使用 conv 方法创建 Conversation。

也许说到这里你已经跃跃欲试了，好的，那你可以试用一下看看了。

注：如果还不是很了解 LeanCloud 的使用方式，建议先从 [SDK 安装文档](start.html) 开始尝试。

## 安装与配置

### 浏览器环境

#### 通过 [bower](http://bower.io/) 安装

在项目目录下运行安装命令：
```
bower install leancloud-realtime --save
```
安装之后，在页面中加载 bower_components/leancloud-realtime/dist/AV.realtime.js 后即可使用 `AV.realtime` 全局变量。

#### 通过 npm 安装，使用 [browserify](http://browserify.org/) 打包

leancloud-realtime 是标准的 node package，支持使用 browserify 进行浏览器代码的打包，node 环境中的安装方法参见「[node 环境](#node_环境)」。

#### 兼容方案

##### IE8 与 IE9

SDK 提供插件化的、无痛兼容 IE8 与 IE9 老版本 IE 浏览器的支持方式。

IE8 与 IE9 没有实现 WebSocket，SDK 通过 Flash 插件实现对 IE8 与 IE9 的支持。SDK 的 plugin/web-socket-js 目录是兼容 IE8 与 IE9 所需要用到的插件。主要实现原理就是通过 Flash 的 Socket 实现 WebSocket 协议通信，然后 JavaScript 包装下 window.WebSocket，再通过 Flash 与 JavaScript 通信完成对 SDK 的兼容。我们的 Demo 是兼容 IE8 与 IE9 的，可以参考其代码。

另外，如果在 IE8、IE9 下启用了 HTTPS 协议，那么在实例化 AV.realtime 的时候，`secure` 要设置为 true。因为 IE8、IE9 中，只支持 HTTP 协议发送 HTTP 的请求，HTTPS 发送 HTTPS 的请求，不支持混用，就是 HTTPS 的站点无法发送 HTTP 的请求，但是新版 IE 已经支持。

**具体使用方式：**

在页面加载执行 AV.realtime.js 的代码前加入以下代码，路径改为你自己的路径

```html
<!-- 引入插件，兼容低 IE8 与 IE9，注意看下面的注释。如果不需要兼容，可以去掉这部分。 -->
<!--[if lt IE 10]>
<script type="text/javascript" src="../../plugin/web-socket-js/swfobject.js"></script>
<script type="text/javascript" src="../../plugin/web-socket-js/web_socket.js"></script>
<script type="text/javascript">
// 设置变量，配置插件中 WebSocketMain.swf 的引用路径
WEB_SOCKET_SWF_LOCATION = "../../plugin/web-socket-js/WebSocketMain.swf";
</script>
<![endif]-->
<!-- 引入插件部分结束 -->

<!-- 引入 LeanCloud 即时通讯 SDK -->
<script src="../../dist/AV.realtime.js"></script>
```

IE8 的用户请参见 [FAQ - IE8 中使用时要注意的问题](#IE_8_中使用时要注意的问题)。

##### Android WebView

如果要想在 Android WebView 中使用，请务必开启 WebSocket 支持。另外根据用户反馈，在部分 Android 机型的 WebView 中不支持 WebSocket 的安全链接，所以需要从 wss 协议转为 ws 协议，关闭 WebSocket 的 SSL，RealtimeObject 在初始化时提供 secure 选项可以关闭，详细使用方式请看 [AV.realtime](#AV_realtime) 方法。

### node 环境

在项目目录下运行安装命令：
```
npm install leancloud-realtime --save
```

安装之后在项目中获得 `realtime` 方法的引用：

```
var realtime = require('leancloud-realtime');
```
SDK 在 node 环境下使用 [ws](https://www.npmjs.com/package/ws) 作为内置的 WebSocket 实现，你也可以在使用 `realtime` 方法之前通过 `config` 方法配置一个 Websocket 类，这里以 [websocket](https://www.npmjs.com/package/websocket) package 为例进行配置：
```
// 首先安装 websocket：
// npm install websocket --save
// 然后进行配置：
realtime.config({
  WebSocket: require('websocket').w3cwebsocket
});
```

## 示例代码

如果你觉得一点点阅读文档较慢，可以直接看我们的「[Demo 代码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo)」，并且下载自己运行一下试试看，Demo 代码可以通过开两个浏览器标签的方式来模拟两个用户的互相通信，代码中也有详细的注释方便你来了解使用方法。

```javascript
// 最简的示例代码，请换成自己的 appId，可以通过浏览器多个标签模拟多用户通信
var appId = '{{appid}}';
// clientId 就是即时通讯中的唯一用户 id
var clientId = 'LeanCloud01';
var realtimeObj;
var conversationObj;

// 创建即时通讯实例（支持单页多实例）
realtimeObj = AV.realtime({
    appId: appId,
    clientId: clientId,
    // 是否开启服务器端认证
    // auth: authFun,
    {% if node != 'qcloud' %}
    // 是否使用其他地区的节点
    // region: 'us'
    {% endif %}
});

// 当前 SDK 版本
console.log('当前 SDK 版本是 ' + AV.realtime.version);

// 即时通讯服务连接成功
realtimeObj.on('open', function() {
    console.log('即时通讯服务建立成功！');

    // 创建一个聊天室，conv 是 conversation 的缩写，也可以用 room 方法替换
    conversationObj = realtimeObj.conv({
        // 人员的 id
        members: [
            'LeanCloud02'
        ],
        // 默认名字
        name: 'LeanCloud-Room',
        // 默认的属性，可以放 Conversation 的一些初始值等
        attr: {
            test: 'testTitle'
        }
    }, function(data) {
        if (data) {
            console.log('Conversation 创建成功!', data);
        }
    });
});

// 当聊天断开时触发
realtimeObj.on('close', function() {
    console.log('即时通讯服务被断开！');
});

// 接收断线或者网络状况不佳的事件（断网可测试）
realtimeObj.on('reuse', function() {
    console.log('正在重新连接。。。');
});

// 当 Conversation 被创建时触发，当然你可以使用回调函数来处理，不一定要监听这个事件
realtimeObj.on('create', function(data) {

    // 向这个 Conversation 添加新的用户
    conversationObj.add([
        'LeanCloud03', 'LeanCloud04'
    ], function(data) {
        console.log('成功添加用户：', data);
    });

    // 从这个 Conversation 中删除用户
    conversationObj.remove('LeanCloud03', function(data) {
        console.log('成功删除用户：', data);
    });

    // 向这个 Conversation 中发送消息
    conversationObj.send({
        abc: 123
    }, function(data) {
        console.log('发送的消息服务端已收收到：', data);
    });

    setTimeout(function() {
        // 查看历史消息
        conversationObj.log(function(data) {
            console.log('查看当前 Conversation 最近的聊天记录：', data);
        });
    }, 2000);

    // 当前 Conversation 接收到消息
    conversationObj.receive(function(data) {
        console.log('当前 Conversation 收到消息：', data);
    });

    // 获取当前 Conversation 中的成员信息
    conversationObj.list(function(data) {
        console.log('列出当前 Conversation 的成员列表：', data);
    });

    // 取得当前 Conversation 中的人数
    conversationObj.count(function(num) {
        console.log('取得当前的用户数量：' + num);
    });
});

// 监听所有用户加入的情况
realtimeObj.on('membersjoined', function(data) {
    console.log('有用户加入某个当前用户在的 Conversation：', data);
});

// 监听所有用户离开的情况
realtimeObj.on('membersleft', function(data) {
    console.log('有用户离开某个当前用户在的 Conversation：', data);
});

// 监听所有 Conversation 中发送的消息
realtimeObj.on('message', function(data) {
    console.log('某个当前用户在的 Conversation 接收到消息：', data);
});

//当聊天出现错误时会触发
realtimeObj.on('error', function (error) {
    console.error(error);
});
```

如果 A 创建了一个包含 B 的 Conversation ，并向其发送消息。
那么，B 可以通过 on 方法监听 message 事件获取此消息（可以是离线消息），即使 B 尚未主动加入该 Conversation 。
message 事件是接收消息最底层的实现，所以即使你通过 `conversationObj.receive` 监听了该消息，依然会触发 message 事件。
message 事件回调函数传入参数中的 cid 字段，即是该 Conversation 的 id 。
通过此 id 即可创建同样的 Conversation ，然后对其回复。

## 安全

### Web 安全域名

如果是纯前端使用 JavaScript SDK，请务必配置 **Web 安全域名**，防止其他人盗用你的服务器资源。即时通讯的安全域名设置会有三分钟的延迟，所以设置完毕后，请耐心等待下。配置方式：进入对应的 App，然后选择 **设置** > **安全中心** > **Web 安全域名**。

详细请看[《数据和安全 - Web 安全域名》](data_security.html#Web_应用安全设置)。

### 权限和认证

为了满足开发者对权限和认证的需求，我们设计了签名的概念。

详细请看《[即时通讯开发指南 - 权限和认证](realtime_v2.html#权限和认证)》。

另外，在 [Demo1](https://github.com/leancloud/js-realtime-sdk/tree/master/demo) 中，我们也增加了一个实际的例子。

### 防御 XSS

Web 端实现任何可以将用户输入直接输出到界面上的应用，都要注意防止产生 XSS（跨站脚本攻击）。即时通讯 SDK 为了保证数据上的纯净性及功能的纯净，没有在 SDK 层面做 HTML 字符的转义。所以当你实现一个 Web 产品时，一定要对用户的输出做字符串 HTML 转义。当然现在的很多 Web 端框架已经自带防御 XSS 的功能，比如 jQuery、Angular、React 等。

注意：不仅要对内容，如果界面上会显示 clientId，也要做 HTML 过滤。

如果你没有使用任何框架来防御 XSS，可以使用如下代码，用来过滤某个字符串中的 HTML 字符。

```javascript

// HTML 转义方法，可以防止 XSS
tool.encodeHTML = function(string) {
  var encodeHTML = function(str) {
    if (typeof(str) === 'string') {
      return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else {
      // 数字
      return str;
    }
  };

  // Object 类型
  if (typeof(string) === 'object') {
    for (var key in string) {
      string[key] = tool.encodeHTML(string[key]);
    }
    return string;
  } else {
    // 非 Object 类型
    return encodeHTML(string);
  }
};
```

## 与 iOS、Android 等客户端通信

JavaScript 即时通讯 SDK 可以与其他客户端通信。当你不仅仅只是基于 Web 来实现一个即时通讯程序，也想通过使用 LeanCloud 提供的其他类型（iOS、Android、Windows Phone等）的 SDK 实现多端互通，就需要在发送数据时使用媒体类型配置项，具体要到 [roomObject.send](#RoomObject_send) 方法中详细了解。

Web 端本身无论处理什么类型的数据，浏览器都可以自动解析并渲染，比如图片，只需要一个 img 标签。但是其他终端就不行，比如 iOS，所以你需要告知其他终端你发送的是什么类型的消息，这样其他客户端接收到之后会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：

- text（文本）
- image（图片）
- audio（声音）
- video（视频）
- location（地理位置）
- file（各种类型文件）等类型。

### 示例

```
// 与 iOS、Android 等 SDK 通信

// 发送文本
roomObj.send({
    text: '文本内容'
}, {
    type: 'text'
}, function(data) {
    // 发送成功之后的回调
});

// 发送图片
roomObj.send({
    // 描述信息
    text: '图片测试',
    // 自定义的属性，可选填，非必须项
    attr: {
        aaa: 123
    },
    url: 'https://leancloud.cn/images/123.png',
    // 图片相关信息，所有选项可选填，非必须项
    metaData: {
        // 图片名字
        name:'logo',
        // 文件格式
        format:'png',
        // 高度，单位像素 px
        height: 123,
        // 宽度，单位像素 px
        width: 123,
        // 文件大小，单位比特 b
        size: 888
    }
}, {
   type: 'image'
}, function(data) {
    console.log('图片数据发送成功！');
});

```

### 自定义消息类型

发送的消息也支持自定义的消息类型，如果 iOS、Android 上通过 SDK 自定义 `_lctype` 字段实现的自定义类型，那么 Web 端也可以直接发送和接受同样格式的数据。

```
// 发送自定义类型数据
roomObj.send({
    _lctype: 123,
    attr: {
      test: 'abc'
    }
}, function(data) {
  // 发送成功之后的回调
});
```

## 暂态对话

标准的 Conversation（对话） 每个最多只能支持 500 个 client，假如想要创建一个有非常大量的用户的聊天室，可以使用方法来创建一个「暂态对话」（或者也叫聊天室）。但是这种方式创建的 Conversation 不支持消息回执等方法，具体请到「[即时通讯服务开发指南](realtime_v2.html)」中了解。

具体如何创建，请看下面实例化一个 Conversation 的方法 [RealtimeObject.conv](#RealtimeObject_conv)。

## 方法列表

### 全局命名空间

LeanCloud JavaScript 相关 SDK 都会使用「AV」作为命名空间。

### AV.realtime

这是创建即时通讯对象的方法，会启动即时通讯的连接。自动调用 open 方法，内部与服务器匹配，并建立 WebSocket 连接。内部会自动维持与服务器的链接稳定，控制心跳数据包的频率，超时检测等，如果发生中断可以通过监听对应的事件来给用户界面上的变化提示。

另外，此方法支持多实例，也就是说，你可以在一个页面中，创建多个 RealtimeObject 来实现聊天。

```javascript
AV.realtime(options, callback)
```


#### 输入

参数|类型|约束|默认|说明
---|---|---|---|---
**options**|Object|必须||配置即时通讯服务所需的必要参数。其中包括：
&nbsp;&nbsp;&nbsp;&nbsp; appId|String|必须||应用的 appId，在 **控制台** > **设置** > **基本信息** 中可以查看。
&nbsp;&nbsp;&nbsp;&nbsp; authFun|Function|||可以传入权限认证的方法，每次当建立连接的时候就会去服务器请求认证，<br/>或者许可之后才能建立连接，详细阅读 [即时通讯概览 &middot; 权限和认证](realtime_v2.html#权限和认证)，<br/>也可以参考 [Demo](https://github.com/leancloud/js-realtime-sdk/blob/master/demo/demo1/test.js#L248) 中的示例。
&nbsp;&nbsp;&nbsp;&nbsp; clientId|String|必须||当前客户端的唯一 id，用来标示当前客户端。
&nbsp;&nbsp;&nbsp;&nbsp; secure|Boolean||true|是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护。<br/>默认开启 true，false 为关闭。
&nbsp;&nbsp;&nbsp;&nbsp; region|String||cn|选择服务部署的节点，{% if node != 'qcloud' %}如果是美国节点，则设置为 `us`，如果是国内节点，则设置为 `cn`。{% else %}目前仅支持 `cn` 即中国节点。{% endif %}

<!-- &nbsp; 用来维护层级，请勿去掉。-->

#### 返回

```Object``` 返回 RealtimeObject（即时通讯对象），其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId,
   // auth 是权限校验的方法函数
   // auth: authFun,
   {% if node != 'qcloud' %}
   // 是否使用美国节点
   // region: 'us',
   {% else %}
   // 使用中国节点
   // region: 'cn',
   {% endif %}
   // 是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护
   secure: true
}, function() {
   console.log('与服务器连接成功！');
});

// 监听 open 事件会得到同样的效果
realtimeObject.on('open', function() {
   console.log('与服务器连接成功！');
});
// http://jsplay.leanapp.cn/rot/embed?js,console
```

### AV.realtime.version

获取当前 SDK 的版本信息。

```javascript
AV.realtime.version
```
#### 返回

```String``` 返回当前版本。

#### 示例

```javascript
// 返回版本号
console.log('当前版本是：' + AV.realtime.version);
```

### RealtimeObject.open

该方法一般情况下，你不需要调用，SDK 会自动启动与服务的连接。该方法可以启动即时通讯的连接，与服务器匹配建立 websocket 连接。

```javascript
RealtimeObject.open(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|可选|创建成功并且与服务器建立连接后触发的回调，此时也会派发一个私有的事件「open」到 RealtimeObject 内部，也可以通过监听当前的 RealtimeObject 实例的 open 事件来处理连接成功的业务逻辑。

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 真正使用时这里也无需调用，实例化 RealtimeObject 的时候 SDK 会自动调用 open 方法
realtimeObject.open(function() {
   // 与服务器连接成功
   console.log('open');
});

realtimeObject.on('open', function() {
   console.log('open,too.');
});
```

### RealtimeObject.close

关闭即时通讯的连接，并且内部会关闭 websocket 连接。该方法没有回调，因为调用会立刻关闭 WebSocket。

```javascript
RealtimeObject.close()
```

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

realtimeObject.close();

realtimeObject.on('close', function() {
   console.log('与服务器已经断开！');
});
```

### RealtimeObject.on

监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件每次派发就会被触发一次。

```javascript
RealtimeObject.on(eventName, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
eventName|String|必须|监听的事件名称
callback|Function|必须|当事件被派发时会调用的回调

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当新建一个 Room 的时候就会触发
realtimeObject.on('create', function(data) {
   console.log(data);
});

// 有人加入 Room 的时候会被触发
realtimeObject.on('membersjoined', function(data) {
   console.log(data);
});
```

### RealtimeObject.once

监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件只会被触发一次。

```javascript
RealtimeObject.once(eventName, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
eventName|String|必须|监听的事件名称
callback|Function|必须|当事件被派发时会调用的回调

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当服务建立之后会被触发
realtimeObject.once('open', function() {
   console.log('opened');
});

// 当服务关闭的时候会被触发
realtimeObject.once('close', function() {
   console.log('closed');
});
```

### RealtimeObject.emit

派发一个事件到 RealtimeObject 中，局部的事件中心。

```javascript
RealtimeObject.emit(eventName, dataObject)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
eventName|String|必须|派发的事件名称
dataObject|Obejct||传递的参数，可以在监听的回调中通过第一个参数获取

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', function(data) {
   // 会输出 test
   console.log(data.aaa);
});

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.off

从 RealtimeObject 中的私有的事件中心，删除一个事件对应的回调函数绑定

```javascript
RealtimeObject.off(eventName, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
eventName|String|必须|一个绑定过的事件名称
callback|Function|必须|要在这个事件中移除的函数

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var eventFun = function(data) {
   // 会输出 test
   console.log(data.aaa);
};

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', eventFun);

// 事件方法从事件监听中删除
realtimeObject.off('LeanCloud123', eventFun);

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.conv

创建一个 Conversation（对话），即时通讯的最小单元。conv 和 room 方法实现的是同样的方法，为了保持概念上的统一，详见「[特别说明](#特别说明)」。

```javascript
RealtimeObject.conv(options, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
**options**|Object|可选|传入配置信息
&nbsp;&nbsp;&nbsp;&nbsp; attr|Object|可选|自定义的数据信息，如 title、image、xxx 等。
&nbsp;&nbsp;&nbsp;&nbsp; members|Array|可选|创建 conversation 时可以直接加入成员的 clientId，<br/>如 `['LeanCloud1', 'LeanCloud2']`。
&nbsp;&nbsp;&nbsp;&nbsp; name|String|可选|Conversation 的名字
&nbsp;&nbsp;&nbsp;&nbsp; unique|Boolean|可选|是否原子创建对话，针对相同成员多次原子创建对话会返回同一个会话。请参考 [即时通讯服务概览](realtime_v2.html#普通对话_Normal_Conversation_) 中 `unique` 选项相关说明。
&nbsp;&nbsp;&nbsp;&nbsp; transient|Boolean|可选|是否为暂态的 conversation，暂态的 conversation 可以<br/>支持大量用户（超过 500 人）同时在此聊天，但是不支持消息回执。<br/>**普通聊天每个 conversation 最多只能支持 500 人，<br/>如果预计单个 conversation 会超过这个数字，那请开启这个选项。**<br/>具体可以查看文档「[即时通讯服务开发指南](realtime_v2.html)」。
**callback**|Function|可选|创建成功后的回调函数，此时也会在 RealtimeObject <br/>内部派发一个 create 事件，可以通过 `RealtimeObject.on()` 方法来监听。

#### 返回

```Object``` 返回 convObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.conv({
    // 人员的 id
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 创建暂态的聊天室
    // transient: true,
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Conversation created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.conv

匹配一个在服务器端已有的 Conversation（对话），并生成对应的 convObject，此时不派发任何事件。

```javascript
RealtimeObject.conv(convId, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
convId|String|必须|传入已有 Conversation（对话） 的 id
callback|Function|可选|创建成功后的回调函数，此时不会派发任何事件。

#### 返回

```Object``` 返回 convObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var convId = 'sasfalklkjdlfs123';
var conv;

// 获取已有的 conversation
realtimeObject.conv(convId, function(obj) {
  // 判断服务器端是否存在这个 conversation
  if (obj) {
    // 获取到这个 conversation 的实例对象
    conv = obj;
    console.log('可以取到 id', conv.id);
    console.log('可以取到 name', conv.name);
    console.log('可以取到属性', conv.attr);
  } else {
    console.log('服务器端不存在这个 conversation。');
  }
});
```

### RealtimeObject.room

创建一个 Room（房间），即时通讯的最小单元。room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 [conv](#RealtimeObject_conv) 完全相同。

```javascript
RealtimeObject.room(options, callback)
```

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});
// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    // 成员列表
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Room created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.room

匹配一个在服务器端已有的 room，并生成对应的 RoomObject，此时不派发任何事件；room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 conv 完全相同。

```javascript
RealtimeObject.room(roomId, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
roomId|String|必须|传入已有 Room 的 id
callback|Function|可选|创建成功后的回调函数，此时不会派发任何事件。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var roomId = 'sasfalklkjdlfs123';
var room;
realtimeObject.room(roomId, function(obj) {
  if (obj) {
    room = obj;
    console.log('room id:', room.id);
    console.log('room name:', room.name);
    console.log('room data:', room.attr);
  } else {
    console.log('服务器不存在这个 room。');
  }
});
```

### RealtimeObject.query

获取当前用户所在的 Room 信息。

```javascript
RealtimeObject.query(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|必须|创建成功后的回调函数，参数中可以获取到 Room 的列表。

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当即时通讯建立成功之后
realtimeObject.on('open', function() {
   // 查询当前用户所在的组
   realtimeObject.query(function(data) {
      console.log(data);  // list
   });
});
```

### RealtimeObject.query

查询即时通讯表中的数据。

```
RealtimeObject.query(options, callback)
```

#### 输入

参数|类型|约束|默认|说明
---|---|---|---|---
**options**|Object|||一些配置参数
&nbsp;&nbsp;&nbsp;&nbsp; compact|Boolean||false|去掉大字段（成员列表、静音列表、当前用户静音的状态），需要 2.4.0 以上版本。
&nbsp;&nbsp;&nbsp;&nbsp; withLastMessages|Boolean||false|同时返回对话的最后一条消息，需要 2.4.0 以上版本。
&nbsp;&nbsp;&nbsp;&nbsp; limit|Number||10|一次获取的条目数量
&nbsp;&nbsp;&nbsp;&nbsp; skip|Number||0|跳过多少个索引，比如 skip: 1000，就是从 1001 开始查询。
&nbsp;&nbsp;&nbsp;&nbsp; sort|String||-lm|默认为最近对话反序，排序字段
&nbsp;&nbsp;&nbsp;&nbsp; where|Object||{m: clientId}|默认为包含自己的查询 {m: clientId}，其他查询条件具体请看下面示例。
**callback**|Function|必须||创建成功后的回调函数，参数中可以获取到 Room 的列表。

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当即时通讯建立成功之后
realtimeObject.on('open', function() {
   // 各种条件查询
   realtimeObject.query({
       where   : {m: 'abc123'},
       sort    : '-lm',  // 或者多字段：'-createdAt,c'
       limit   : 100,
       skip    : 200,
       compact : false
   },function(data) {
      console.log(data);  // list
   });
});

// 查询同时含有用户 clientId 为 A 和 B 的用户
realtimeObject.query({
  where: {
    m: ['A', 'B']
  },
},function(data) {
  console.log(data);  // list
});

// 查询多个 Room 的信息，可在 roomIds 中传入 roomId 的 list
realtimeObject.query({
  where: {
    roomIds: ['adsfa12131231', '123123sdfaa']
  },
},function(data) {
  console.log(data);  // list
});

```

### RealtimeObject.ping

查询对应的 clientId 是否处于服务在线状态。

```javascript
RealtimeObject.ping(clientIdList, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientIdList|Array|必须|传入已有用户的 clientId 的数组，如 ['LeanCloud1', 'LeanCloud2']。<br/>**注意：每次最多只能判断 20 个 clientId，超过 20 个只查询前 20 个，<br/>因为消息过长可能导致 WebSocket 包过长而被服务器断开连接。**
callback|Function|必须|回调函数，可以在参数中获得在线的 clientIdList，<br/>比如返回 ['LeanCloud2']，则说明 LeanCloud2 在线。

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    attr: {
        title: 'testTitle'
    }
});

realtimeObject.ping([
    'LeanCloud01',
    'LeanCloud02'
], function(data) {
    // 返回传入的 id 中，在线的用户 id
    console.log(data);
});
```

### RealtimeObject.ping

查询对应的 clientId 是否处于服务在线状态。

```javascript
RealtimeObject.ping(clientId, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientId|String|必须|传入已有用户的 clientId，如 'LeanCloud1'。
callback|Function|必须|回调函数，可以在参数中获得在线的 clientIdList，<br/>比如返回 ['LeanCloud1']，则说明 LeanCloud1 在线。

#### 返回

```Object``` 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    attr: {
        title: 'testTitle'
    }
});

realtimeObject.ping('LeanCloud01', function(data) {
    if (data.length) {
       console.log('用户在线');
    } else {
       console.log('用户不在线');
    }
});
```

### RoomObject.add

向当前 RoomObject 中添加一个用户。

```javascript
RoomObject.add(clientId, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientId|String|必须|传入已有用户的 clientId。
callback|Function|可选|创建成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.add('LeanCloud03', function() {
    console.log('添加成功。');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('membersjoined', function(data) {
   console.log(data);
});
```

### RoomObject.add

向当前 RoomObject 中添加多个用户。

```javascript
RoomObject.add(clientIdList, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientIdList|Array|必须|传入已有用户的 clientId 的 list，每个元素是 client。
callback|Function|可选|创建成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.add(['LeanCloud03', 'LeanCloud04'], function() {
    console.log('添加成功。');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('membersjoined', function(data) {
   console.log(data);
});
```

### RoomObject.remove

从当前 RoomObject 中删除一个用户。

```javascript
RoomObject.remove(clientId, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientId|String|必须|传入已有用户的 clientId。
callback|Function|可选|删除成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.remove('LeanCloud02', function() {
    console.log('成功删除。');
});

// 当前 Room 有 client 退出时触发
realtimeObject.on('membersleft', function(data) {
   console.log(data);
});
```

### RoomObject.remove

从当前 RoomObject 中删除多个用户。

```javascript
RoomObject.remove(clientIdList, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientIdList|Array|必须|传入已有用户的 clientId 的 list，每个元素是 client。
callback|Function|可选|删除成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.remove(['LeanCloud02', 'LeanCloud03'], function() {
    console.log('成功删除。');
});

// 当前 Room 有 client 退出时触发
realtimeObject.on('membersleft', function(data) {
   console.log(data);
});
```

### RoomObject.join

加入当前这个 Room。

```javascript
RoomObject.join(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|可选|加入成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断服务器是否存在这个 room
    if (object) {
        room = object;
        room.join(function() {
            console.log('join');
        });
    }
});

realtimeObject.on('invited', function(data) {
   console.log(data);
});
```

### RoomObject.leave

从当前 RoomObject 中离开。

```javascript
RoomObject.leave(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
clientIdList|Array|必须|传入已有用户的 clientId 的 list，每个元素是 client。
callback|Function|可选|成功后的回调函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.leave();

realtimeObject.on('kicked', function(data) {
   console.log(data);
});
```

### RoomObject.list

获取当前 RoomObject 中的成员列表。

```javascript
RoomObject.list(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|必须|获取成员列表的回调函数

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.list(function(data) {
  console.log(data); // room 中成员 list
});
```

### RoomObject.send

向当前这个 RoomObject 中发送消息。

```javascript
RoomObject.send(dataObject, callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
dataObject|Object|必须|发送的数据内容
callback|Function|可选|发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.send({
    testMsg: 'abcde'
}, function() {
    console.log('server ack.');
});

// 当前用户所在的组，有消息时触发
realtimeObject.on('message', function(data) {
   console.log(data);
});
```

### RoomObject.send

向当前这个 RoomObject 中发送消息。

```javascript
RoomObject.send(dataObject, options, callback)
```

#### 输入

参数|类型|约束|默认|说明
---|---|---|---|---
**dataObject**|Object|必须||发送的数据内容
**options**|Object|可选||发送消息时的配置项
&nbsp;&nbsp;&nbsp;&nbsp; receipt|Boolean|可选|false|是否需要接收是否收到的回执信息，true 为接收，<br/>可以在 `RoomObject.receipt` 方法中接收。
&nbsp;&nbsp;&nbsp;&nbsp; transient|Boolean|可选|false|是否发送的是「暂态消息」，暂态消息不会有回调，不会存在历史记录中，<br/>可以用来发送用户的输入状态（如：「正在输入……」的效果）。
&nbsp;&nbsp;&nbsp;&nbsp; type|String|可选||无默认值。该参数在多端通信中会用到，当你打算与基于 LeanCloud iOS、Android <br/>等客户端通信时，需要使用此选项来设置不同的媒体类型，这样其他客户端接收到之后<br/>会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：<br/>text（文本）、image（图片）、audio（声音）、video（视频）、<br/>location（地理位置）、file（各种类型文件），具体使用方式请参考下面的例子。
**callback**|Function|可选||发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true,
    // 是否是暂态消息
    transient: false
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data);
});

// 与 iOS、Android 等 SDK 通信

// 发送文本
room.send({
    text: '文本内容'
}, {
    type: 'text'
}, function(data) {
    // 发送成功之后的回调
});

// 发送图片
room.send({
    // 描述信息
    text: '图片测试',
    // 自定义的属性，可选填，非必须项
    attr: {
        aaa: 123
    },
    url: 'https://leancloud.cn/images/123.png',
    // 图片相关信息，所有选项可选填，非必须项
    metaData: {
        // 图片名字
        name:'logo',
        // 文件格式
        format:'png',
        // 高度，单位像素 px
        height: 123,
        // 宽度，单位像素 px
        width: 123,
        // 文件大小，单位比特 b
        size: 888
    }
}, {
   type: 'image'
}, function(data) {
    console.log('图片数据发送成功！');
});
```

### RoomObject.receive

接收到当前这个 RoomObject 中的消息。

```javascript
RoomObject.receive(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|必须|收到当前 Room 中信息的处理函数。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.receive(function(data) {
   // 接收到的信息
   console.log(data);
});
```

### RoomObject.receipt

如果你通过 RoomObject.send 方法发送了需要有回执功能的信息，那么通过 RoomObject.receipt 可以接收当前这个房间中的所有这类回执信息；回执表示从即时通讯服务本身，对方的客户端已经收到该信息。

```javascript
RoomObject.receipt(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|必须|收到的回执信息

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data);
});
```

### RoomObject.log

获取当前 RoomObject 中的消息历史。这个是一个简单的方式，可以获取最近 20 条历史消息。

```javascript
RoomObject.log(callback)
```

#### 输入
参数|类型|约束|说明
---|---|---|---
callback|Function|必须|回调函数，参数中可以取得历史消息数据。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断这个 room 在服务器端是否存在
    if (object) {
        // 当前用户所在的组，有消息时触发
        room.log(function(data) {
           console.log(data);
        });
    }
};
```

### RoomObject.log

获取当前 RoomObject 中的消息历史。

```javascript
RoomObject.log(options, callback)
```

#### 输入

参数|类型|约束|默认|说明
---|---|---|---|---
**options**|Object|可选||查询历史条目的参数
&nbsp;&nbsp;&nbsp;&nbsp; limit|Number|可选|20|返回消息历史的条目数量，默认是查询最近 20 条历史消息。
&nbsp;&nbsp;&nbsp;&nbsp; mid|String|可选||message id 消息的 id，当接收到消息的时候会有这个 id，<br/>用来辅助查询，防止同一时间戳下有两条一样的消息。
&nbsp;&nbsp;&nbsp;&nbsp; t|String/Number|可选||查询历史消息的时间戳，查询这个时间之前的消息。
**callback**|Function|必须||回调函数，参数中可以取得历史消息数据。

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {

    // 判断这个 room 在服务器端是否存在
    if (object) {

      // 当前用户所在的组，有消息时触发
      room.log({
         // 时间戳，查询这个时间之前的消息
         t: 1429545834932,
         // message id
         // mid: 'afsadsa_ds2w',
         // 返回条目数量
         limit: 20
      }, function(data) {
         console.log(data);
      });
    }
};
```

### RoomObject.count

获取当前这个 Room（或者 Conversation）中的用户数量。

```javascript
RoomObject.count(callback)
```

#### 输入

参数|类型|约束|说明
---|---|---|---
callback|Function|必须|返回的数据中可以获取到用户数量

#### 返回

```Object``` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    attr: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.count(function(data) {
   // 当前用户数量
   console.log(data);
});
```

### RoomObject.update

更新 Room（或者 Conversation）的名字与自定义属性。

```javascript
RealtimeObject.update(data, callback);
```

#### 输入

参数|类型|约束|说明
---|---|---|---
data|object|必须|要修改的 key-value
callback|Function|可选|修改成功的回调函数

#### 返回

`Object` 返回 RoomObject，其中有后续调用的方法，支持链式调用。

#### 示例

```javascript
room.update({
  // 新的 room name
  name: 'New Name',
  // 新的自定义的数据
  attr: {}
}, function() {
  console.log('update succeeded.');
});
```

## 全局事件

SDK 会默认派发一些事件，这些事件仅会在 RealtimeObject 内部被派发（注意：RoomObject 内部默认不会派发任何事件），你可以通过监听这些事件来完成你的操作。这些事件往往都是脱离 Room（或者 Conversation）的，你可以监听到其他 Room 中的相关信息。

以下是默认事件的说明：

### open

与服务器建立好连接之后就会被派发，包括当服务断开重新被连接上时也会被触发。

### close

与服务器连接断开就会被派发，包括网络中断。

### create

新建一个 Room 成功之后会被触发。

### invited & membersjoined
当一个 Room 中有成员加入时，该成员收到 `invited` 事件，Room 中的其他成员收到 `membersjoined` 事件。

A 将 B 加入到会话中时，各方收到事件的时序是这样的：

|邀请者(A)|被邀请者(B)|其他人(C)
---|:---:|:---:|:---:
1|发出请求 add| |
2| |invited|
3|membersjoined|membersjoined|membersjoined

如果是 A 主动加入会话：

|加入者(A)|其他人(C)
---|:---:|:---:
1|发出请求 join|
2|invited|
3|membersjoined|membersjoined

### kicked & membersleft
当一个 Room 中有成员离开时，该成员收到 `kicked` 事件，Room 中的其他成员收到 `membersleft` 事件。

A 将 B 移出会话中时，各方收到事件的时序是这样的：

|A|B|C
---|:---:|:---:|:---:
1|发出请求 remove| |
2| |kicked|
3|membersleft||membersleft

如果是 A 主动退出会话：

|A|C
---|:---:|:---:
1|发出请求 left|
2|kicked|
3||membersleft


### join

不赞成使用，已被 `invited`、`membersjoined` 事件代替。该事件会在下个主版本中移除。
当一个 Room 新增了一个成员之后会被触发。

### left

不赞成使用，已被 `kicked`、`membersleft` 事件代替。该事件会在下个主版本中移除。
当一个 Room 中有成员离开之后会被触发。

### message

当收到消息时会被触发，收到的消息是当前客户端（clientId）存在的 Room 中的信息，所有这些数据都可以在服务器端看到。

### reuse

发生连接错误，可能是网络原因，SDK 在自动尝试重连。可以监听这个状态，给用户「服务器已断开，正在重新连接……」之类的提示。

### receipt

收到消息回执的时候会被触发。

## FAQ

### IE 8 中使用时要注意的问题

* 要注意不能有 console.log，否则在不开启调试器的情况下 IE8 脚本会停在那个位置却不报错
* IE8 中的 JSON.stringify 会把中文转为 unicode 编码
* IE8 中支持 CORS 跨域请求，不需要使用 jsonp 来 hack，而是用 XDomainRequest 发 request，不过注意这个 request 成功回来没有 response.status
