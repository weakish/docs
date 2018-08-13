# JavaScript 即时通讯 WebRTC 插件使用指南

## 简介
JavaScript 即时通讯 WebRTC 插件能帮助你实现 Web 端点对点实时音视频通话功能。基于 LeanCloud 即时通讯服务与 WebRTC 标准，支持最多 4 人之间的实时音视频通话（目前仅支持 Web 端之间的通话）。

## 兼容性
WebRTC 插件基于 WebRTC 实现。WebRTC 是一组开放的 API，用于实现实时音视频通话并且已成为 W3C 标准草案。目前主流浏览器对 WebRTC 标准的支持情况如下：

浏览器|支持情况
----|:----:
Chrome/Opera|支持
Firefox|支持
Android|支持（5.0+）
Safari/iOS|开发中
Edge|开发中
IE|不支持

完整的兼容性表格参见：[http://iswebrtcreadyyet.com/]()。

## Demo

- [视频通话 App](https://leancloud.github.io/js-realtime-sdk/demo/webrtc/) （[源码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo/webrtc)）

## API 文档

[https://leancloud.github.io/js-realtime-sdk/plugins/webrtc/docs/](https://leancloud.github.io/js-realtime-sdk/plugins/webrtc/docs/)

## 安装和初始化

使用 npm 安装：webrtc-adapter、leancloud-realtime、leancloud-realtime-plugin-webrtc：

```bash
npm install webrtc-adapter leancloud-realtime leancloud-realtime-plugin-webrtc --save
```

在浏览器中按如下顺序加载：
```html
<script src="./node_modules/webrtc-adapter/out/adapter.js"></script>
<script src="./node_modules/leancloud-realtime/dist/realtime.browser.min.js"></script>
<script src="./node_modules/leancloud-realtime-plugin-webrtc/dist/webrtc.min.js"></script>
```

并在初始化即时通讯 SDK 时指定使用 WebRTC 插件：
```javascript
var Realtime = AV.Realtime;
// 如果作为 CommonJS 模块加载： var WebRTCPlugin = require('leancloud-realtime-plugin-webrtc').WebRTCPlugin;
var WebRTCPlugin = AV.WebRTCPlugin;

var realtime = new Realtime({
  appId: '{{appid}}',
  plugins: [WebRTCPlugin],
});
```

其中 webrtc-adapter 的作用是抹平不同浏览器对 WebRTC API 实现上的差异。详细的信息请参考 [https://github.com/webrtc/adapter]()。JavaScript 即时通讯 SDK 的详细说明请参考 [JavaScript 即时通讯开发指南](realtime_guide-js.html)。

## 登录
初始化后，可以通过 `Realtime#createWebRTCClient` 来创建一个视频通话客户端。一个页面上可以创建多个客户端实例，实现多个用户同时登录。

```javascript
realtime.createWebRTCClient('Tom').then(function(tom) {
  // tom is a WebRTCClient
});
```

WebRTC 客户端是通过「单点登录」模式连接即时通讯服务的，这意味着对于同一个 ID，同一时间仅会有一个客户端处于登录状态。后登录的客户端会将较早登录的客户端「踢下线」，被踢下线的客户端会派发 `conflict` 事件。

```javascriptjava
tom.on('conflict', function() {
  // 弹出提示，告知当前用户的 Client Id 在其他设备上登录了
});
```

### 签名
与 IM 客户端一样，WebRTC 客户端支持通过签名对登录进行鉴权。具体的签名方法请参考 [JavaScript 即时通讯开发指南 - 安全与签名](realtime_guide-js.html#安全与签名)

## 获取本地流媒体
在开始拨打电话之前，需要先得到摄像头的流媒体（[MediaStream](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStream)），可以通过 `navigator.mediaDevices.getUserMedia` 方法来获取：

```javascript
var mediaStreamConstraints = {
  audio: true,
  video: true,
};
navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(function(steam) {
  // stream is a MediaStream
});
```

其中，通过 `mediaStreamConstraints` 参数可以指定视频的分辨率，使用哪个摄像头等配置，详细的配置方法请参考：[MediaDevices.getUserMedia() | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Parameters)。

首次调用 `getUserMedia` 方法时浏览器会向用户询问是否授予应用摄像头的访问权限，所以我们建议在需要流媒体的时候才去调用这个 API。

获取到当前用户的流媒体后，我们可以通过 `video` 标签的 `srcObject` 属性将视频显示到页面上：

```javascript
navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(function(steam) {
  document.getElementById('local_video').srcObject = stream;
});
```

停止流媒体：
```javascript
stream.getTracks().forEach(function(track) {
  track.stop();
});
```

还可以分别禁用视频、音频轨道：
```javascript
stream.getVideoTracks()[0].enabled = false;
stream.getAudioTracks()[0].enabled = false;
```

## 通话
### 呼叫
Tom 登录之后，调用客户端的 `call` 方法来呼叫 Jerry。`call` 方法接收两个参数，第一个参数是对方的 id，第二个参数是本地流媒体，该方法返回一个 Promise：

```javascript
tom.call('Jerry', stream).then(function(outgoingCall) {
  // 呼叫成功
}).catch(error) {
  // 呼叫失败
});
```
如果呼叫成功，Promise 的成功回调中可以得到一个 `OutgoingCall` 类型的呼出通话对象，我们稍后会用到这个对象。如果呼叫失败，Promise 的失败回调会被执行，可能失败的原因包括：

- Jerry 不在线
- 「加入对话」签名失败（如果配置了，请检查创建客户端时配置的对话鉴权方法）
- 超时

这时如果 Jerry 在线，客户端 `jerry` 会派发 `call` 事件，事件回调中可以得到一个 `IncomingCall` 类型的呼入通话对象。

```javascript
jerry.on('call', function(incomingCall) {});
```

此时，Tom 拥有一个 `outgoingCall`，Jerry 拥有一个 `incomingCall`。每个 Call 都有一个 `state` 字段来标记当前的通话状态，此刻 `outgoingCall` 与 `incomingCall` 的状态均为 `calling`。

在通常的流程中，Jerry 会「接听」通话，在此之前，我们先看其他的两种情况。

### 取消
第一种情况，Tom 可以「取消」该次通话：

```javascript
// Tom
outgoingCall.cancel().then(function() {});
```

Jerry 会收到该通话被「取消」的通知：

```javascript
// Jerry
incomingCall.on('cancel', function() {});
```

此刻 `outgoingCall` 与 `incomingCall` 的状态均变为 `canceled`。

### 拒绝
另一种情况是 Jerry「拒绝」了该次通话：

```javascript
// Jerry
incomingCall.refuse().then(function() {});
```

Tom 会收到该通话被「拒绝」的通知：

```javascript
// Tom
outgoingCall.on('refuse', function() {});
```

此刻 `outgoingCall` 与 `incomingCall` 的状态均变为 `refused`。

### 接听
回到通常的流程中，Jerry 调用了 `accept` 方法「接听」了通话，「接听」通话需要提供 Jerry 的流媒体：

```javascript
// Jerry
incomingCall.accept(stream).then(fucntion() {});
```

Tom 会收到该通话被「接听」的通知：

```javascript
// Tom
outgoingCall.on('accept', function() {});
```

到目前为止，Tom 与 Jerry 都还只持有自己本地的流媒体，`outgoingCall` 与 `incomingCall` 的状态都还是 `calling`。接下来在 SDK 内部，Tom 与 Jerry 会进行一些数据的交换与协商，在协商成功后，双方会收到通话「接通」的通知，在这个事件的回调中可以拿到对方的流媒体：

```javascript
// Tom
outgoingCall.on('connect', function(stream) {
  // stream is the MediaStream of Jerry
});

// Jerry
incomingCall.on('connect', function(stream) {
  // stream is the MediaStream of Tom
});
```

此刻 `outgoingCall` 与 `incomingCall` 的状态均变为 `connected`。

### 挂断
在通话接通后，任何一方都可以主动「挂断」通话，以 Tom 为例：

```javascript
// Tom
outgoingCall.close().then(function() {});
```

Jerry 会收到该通话被「挂断」的通知：

```javascript
// Jerry
incomingCall.on('close', function() {});
```

此刻双方通话的状态均变为 `closed`。

需要注意的是，本地的流媒体不会被自动停止（即结束通话不会自动关闭摄像头），停止流媒体的方法请参考 [获取本地流媒体](#获取本地流媒体)。

## 多人通话

SDK 只提供一对一的「通话」抽象，多人通话是通过多人之间分别一对一通话实现的。由于 WebRTC 是点对点的通讯方式，不存在中心节点，所以 n 个人之间的通话每个客户端都需要与另外 n-1 个客户端建立连接，由于客户端性能与带宽的限制，我们推荐将多人对话的人数控制在 4 个以下。

具体来说，Tom 可以使用即时通讯 SDK 创建一个聊天室，并监听聊天室的 `memberjoined` 事件，当 Jerry 加入聊天室时，聊天室中所有成员自动「呼叫」Jerry，Jerry 自动「接通」呼入的所有通话，即可实现聊天室形式的多人通话。

<!-- LeanCloud 同时也提供了一对多的「直播」模型，请参考 LiveKit 文档。  -->

## 指定 TURN 服务器
WebRTC 的流媒体是直接在两个客户端之间直接传递的，这意味着不需要服务器支持，但也意味着平均有 15% 左右的连接因为防火墙等原因无法建立。针对这种情况，WebRTC 支持在无法建立点对点连接时通过提供 TURN 服务器进行流媒体的转发，如果你自建了 TURN 服务器或者接入了 TURN 服务商，可以在创建 WebRTC 客户端的时候通过 `clientOptions.RTCConfiguration` 参数指定 `iceServers` 为你的 TURN 服务器地址。

关于 TURN 服务器的详细说明，请参考：

- [https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT]()
- [https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration]()
- [https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer/urls]()
