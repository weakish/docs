{% set imJSLink = "realtime_guide-js.html" %}
# 在 Cordova 项目中使用 LeanCloud

伴随着 Cordova 的发展，已经有不少用户在尝试着结合 LeanCloud 强大的后端以及 Cordova 强大的跨平台能力来开发客户端应用，本篇教程将详细讲解如何在 Cordova 中正确有效地使用 LeanCloud 的各项服务。

![Cordova-log](https://cordova.apache.org/static/img/cordova_bot.png)

在 Cordova 插件市场中，有很多插件通过 JavaScript 来调用各平台专用的本地组件以实现一些浏览器运行时无法实现的需求，例如苹果的支付功能 Apple Pay。我们按此原理开发出一套 LeanCloud 原生插件，助力于 Cordova 开发。

## 安装 LeanCloud SDK

Cordova 本质上是一个 Web 项目，它的开发语言目前还是主流的 JavaScript 以及一小部分特立独行的 TypeScript，因此在任何一个基于 Cordova 开发环境中都可以直接使用 LeanCloud JavaScript SDK：

- [LeanCloud JavaScript SDK 安装指南](sdk_setup-js.html)
- [LeanCloud JavaScript SDK 数据存储开发指南][storage]
- [LeanCloud JavaScript SDK 即时通讯开发指南][im]

我们的 [数据存储][storage] 以及 [即时通讯][im] 模块的安装包都已经包含了 TypeScript 的定义文件，因此支持使用 ionic2+ 进行开发，不会出现编译报错的问题。

## LeanCloud 推送插件
消息推送是 LeanCloud 提供的一项针对移动设备的云端服务。

### 安装和使用
前往插件的仓库地址 <https://github.com/leancloud/cordova-plugin-leancloud> 查看安装以及初始化的说明。


### 推送插件与即时通讯离线消息的关联
假如项目中还引入了 LeanCloud 即时通讯功能，一定会遇到客户端下线之后的离线消息与推送设备的对应的问题，类似于 QQ 的离线消息推送——某一个用户在一台安卓设备上登录了自己微信，而后又换到一台苹果手机上登录，服务端需要明确知道该用户最后一次登录的是哪台设备，这样才能准确地将消息推送到目标设备。因此使用 [JavaScript 即时通讯][im] 的开发者需要在登录到即时通讯服务器之后做一次关联操作即可，代码如下：


```js
var clientId = 'Tom';// 假设当前用户的 Client Id 是 Tom
// 将 client Id 作为当前设备推送订阅的频道，就可以实现离线消息针对 Client Id 所登录的设备做关联
window.LeanPush.subscribe(clientId, function(success){
    // 成功绑定
}，function(error){
    // 失败的话就打印一下 error 看看出错的原因
}); 
```

注意：上述代码需要确保 [LeanCloud_推送插件](#LeanCloud_推送插件) 已成功安装并进行了初始化。

同理，如果使用了 JavaScript 即时通讯的 [单点登录]({{ imJSLink }}#单点登录)，就需要在 [处理登录冲突]({{ imJSLink }}#处理登录冲突) 时对当前设备的 Installation 解绑：

```js
tom.on('conflict', function() {
  // 弹出提示，告知当前用户的 Client Id 在其他设备上登录了
    window.LeanPush.unsubscribe('Tom', function(success){
          // 成功解绑
    }，function(error){
          // 失败的话就打印一下 error 看看出错的原因
    }); 
});
```

注意，用户退出需要调用 [AVIMClient#close]({{ imJSLink }}#退出登录) 方法，与此同时也需要执行上述代码，来确认用户退出之后不会再收到离线的消息推送。

[storage]: leanstorage_guide-js.html
[im]: {{ imJSLink }}
