# JavaScript 推送开发指南

## 简介

发送 Push 服务是基于 HTTP 的一个 Post 请求，接收 Push 消息是通过 WebSocket 来监听数据。SDK 对数据进行过包装，并且会对连接产生的错误进行处理，包括网络断开重连等，所以稳定可靠。

你可以基于 Push SDK 做很多有趣的 Web 应用。比如，年会上面做个简单的弹幕应用，一些客户端发，弹幕墙接收。

当然，你可以做一个比较简单的消息通知功能。推送消息的方式也是很灵活的，可以在客户端通过对应 SDK 的接口发送，也可以在 [控制台 >（选择应用）> 消息 > 推送 > 在线发送](/dashboard/messaging.html?appid={{appid}}#/message/push/create) 中手动发送推送消息到各个客户端。

<div class="callout callout-info">如果前端使用的是 JavaScript SDK，请务必配置 <strong>Web 安全域名</strong>，来防止其他人盗用你的服务器资源。

配置方式：进入 [控制台 >（选择应用）> 设置 > 安全中心](/dashboard/app.html?appid={{appid}}#/security)，找到 **Web 安全域名**。</div>

详细内容请查看 [数据和安全 &middot; Web 安全域名](data_security.html#Web_应用安全设置)。

## 通过 bower 安装

[什么是 bower？](http://bower.io/)

```
bower install leancloud-push --save
```

安装之后，页面直接加载 `bower_components/leancloud-push.js/src/AV.push.js` 即可。

## Github 仓库地址

可以直接通过 Github 仓库使用，也可以通过 Github 给我们提出你的建议

Github 仓库地址：[https://github.com/leancloud/js-push-sdk](https://github.com/leancloud/js-push-sdk)

Release 地址：[https://github.com/leancloud/js-push-sdk/releases](https://github.com/leancloud/js-push-sdk/releases)

## Demo 及示例代码

如果你觉得一点点阅读文档较慢，可以直接看我们的 [Demo 代码](https://github.com/leancloud/js-push-sdk/tree/master/demo)，并且下载自己运行一下试试看。

注意：Demo 需要使用一个 Web 服务器打开（如 `http://localhost`），不能仅通过文件的方式打开（不要直接双击打开，URL 为 `File:///` 协议的方式），否则会被服务器拒绝。

```javascript
// 最简的示例代码，请换成自己的 appId 和 appKey
var appId = '{{appid}}';
var appKey = '{{appkey}}';
var push = AV.push({
    appId: appId,
    appKey: appKey
});

// 发送一条推送，如果不传 channels 则是给所有 channel 发送消息
push.send({
    // channels: ['aaa'],
    data: {alert: 'test123'}
}, function(result) {
    if (result) {
        console.log('推送成功发送');
    } else {
        console.log('error');
    }
});

// 如果想接收推送，需要调用 open 方法，开启和服务器的连接
push.open(function() {
    console.log('连接服务器成功，可以接收推送');
});

// 监听推送消息
push.on('message', function(data) {
    console.log('message');
    console.log(JSON.stringify(data));
});

// 监听网络异常，SDK 会在底层自动重新连接服务器
push.on('reuse', function() {
    console.log('网络中断正在重试。。。');
});

```

## 方法文档

### 全局命名空间

LeanCloud JavaScript 相关 SDK 都会使用「AV」作为命名空间。

### AV.push(options)

配置一个 Push 服务，生成一个 PushObject，提供后续调用的方法。

参数 options 的类型为 Object，必选，包含如下设置：

参数|类型|约束|描述
---|---|---|---
appId|String|必须|应用的 AppId，在 **控制台** > 选择应用 > **设置** > **应用 Key** 中查看
appKey|String|必须|应用的 AppKey

```javascript
var pushObject = AV.push({
    appId: '{{appid}}',
    appKey: '{{appkey}}'
}).open(function() {
    console.log('receiving message...');
}).on('message', function(data) {
    console.log(data);
}).send({
    data: {alert: 'test123'},
    channels:['aaa']
});
```
返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### AV.push.version

获取当前 SDK 的版本信息

```javascript
console.log(AV.push.version);   // 2.0.0
```

返回：{String} 返回当前版本

### pushObject.open(callback)

开启接收服务端推送消息。如果只是需要发送数据到服务器，则不需要使用该方法，只需要使用 send 方法；

参数|类型|约束|描述
---|---|---|---
callback|Function|可选|与服务器建立连接（WebSocket）之后，会触发的回调函数。

```javascript
pushObject.open(function() {
    console.log('open');
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.send(jsonObject)

向服务器发送要推送的消息

参数|类型|约束|描述
---|---|---|---
jsonObject|Object|必须|要发送的数据，JSON 格式，但是发送数据的字段名，不能是配置选项中的名字。
不能是 channels、where、expiration_time、expiration_interval、push_time。

```javascript
pushObject.send({
    test: 123
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.send(options)

向服务器发送要推送的消息

参数 options 类型为 Object，可包含如下设置：

参数|类型|约束|描述
---|---|---|---
data|Object|必须|要发送的数据，JSON 格式
channels|Array|可选|Push 的频道。默认不传，会发到所有频道
where|String|可选|一个查询 _Installation 表的查询条件 JSON 对象
expiration_time|Date|可选|消息过期的绝对日期时间
expiration_interval|Number|可选|秒，消息过期的相对时间
push_time|Date|可选|定期推送时间
prod|String|可选|如果想推送到 iOS 设备，可以通过该参数指定使用测试环境还是生产环境证书。dev 表示开发证书，prod 表示生产证书，默认生产证书。

```javascript
pushObject.send({
    data: {alert: 'test123'},
    channels: ['cctv1', 'cctv2'],
    prod: 'dev'
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.subscribe(channels, callback)

增加订阅的频道

参数|类型|约束|描述
---|---|---|---
channels|Array|必须|订阅的 channel 名字的数组，**每个 channel 名称只能包含 26 个英文字母和数字。**

```javascript
pushObject.subscribe(['testChannel'], function() {
    console.log('订阅成功！');
});

// 然后你就可以直接发送消息
pushObject.send({
    data: {alert: 'test123'},
    channels: ['testChannel']
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.unsubscribe(channels, callback)

退订已经订阅的频道

参数|类型|约束|描述
---|---|---|---
channels|Array|必须|订阅的 channel 名字的数组，**每个 channel 名称只能包含 26 个英文字母和数字。**

```javascript
pushObject.unsubscribe('testChannel', function() {
    console.log('取消订阅成功！');
});

// 然后你就可以直接发送消息
pushObject.send({
    data: {alert: 'test123'},
    channels: ['testChannel']
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.on(eventName, callback)

监听当前 pushObject 内的事件，基于私有事件中心

参数|类型|约束|描述
---|---|---|---
eventName|String|必须|监听的事件名称
callback|Function|必须|事件的回调函数，当事件被派发时触发。

```javascript
pushObject.on('message', function(data) {
    console.log(data);
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.once(eventName, callback)

监听当前 pushObject 内的事件，基于私有事件中心，回调只会被触发一次

参数|类型|约束|描述
---|---|---|---
eventName|String|必须|监听的事件名称
callback|Function|必须|事件的回调函数，当事件被派发时触发。

```javascript
pushObject.once('open', function(data) {
    console.log(data);
});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.emit(eventName, data)

派发一个事件到 pushObject 内的私有事件中心

参数|类型|约束|描述
---|---|---|---
eventName|String|必须|监听的事件名称
data|Object|可选|传递的参数，可以在监听的回调中通过第一个参数获取。

```javascript
pushObject.emit('customEvent', {test: 123});
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### pushObject.close()

停止获取服务端推送消息，并且断开与服务器的连接。

```javascript
pushObject.close();
```

返回：{Object} 返回 pushObject，可以做后续 Push 服务的方法，支持链式。

### 事件

SDK 会默认派发一些事件，这些事件仅会在 pushObject 内部被派发，你可以通过监听这些事件来完成你的操作。这些事件近在你需要接收服务端 Push 的消息时有用，如果只是推送数据给服务器，不需要使用。以下是默认事件的说明：

### open
与服务器建立好连接之后就会被派发，包括当服务断开重新被连接上时也会被触发。

### close
与服务器连接断开就会被派发，包括网络中断。

### message
收到服务器推送消息时会被派发，监听此事件来接收推送消息。

### reuse
网络不稳定或者其他非主动与服务器断开的情况，自动重连时会派发此事件，当服务重新连接会再次派发 open 事件。

### error
所有的错误处理，都会派发出一个 error 事件。
