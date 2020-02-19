{% import "views/_data.njk" as data %}
{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

## 消息推送常见问题
### 为什么成功设备数小于目标设备数？

「目标设备数」是指符合本次推送查询条件的有效设备数量，「成功设备数」是指这次推送成功到达的设备数量。没有到达设备一般有以下几种情况：

- Android 设备中的应用被杀掉，在网络中处于离线状态。对于这种情况，稍等一段时间待设备上线后，成功设备数就会逐渐增加。同时推荐集成 [混合推送](android_push_guide.html#混合推送) 来提升推送到达率。
- Android 用户删掉或重装应用生成了新的设备数据，之前的无效数据被包含到了「目标设备数」中。
- iOS 用户删掉或重装了应用，之前的无效数据被包含到了「目标设备数」中，这些数量就是 invalidTokens 数量。

### 为什么只能给三个月内活跃过的设备发消息？能否发全量设备？

我们只允许开发者给 `_Installation` 表中 **updatedAt** 值为**最近三个月以内**的设备推送消息。原因如下：

- 三个月没有活跃过的设备，用户打开推送的概率已经非常小了，我们将这些不活跃的设备视为无效设备。
- 成本原因。全量推送需要处理的无效设备数量会成倍增长，因而会消耗大量云端资源，其中一个能被用户感知到的影响就是推送时间，目标设备数成倍增长也意味着单次全量推送的时间也成倍增长。

基于以上考虑，我们默认只能向三个月以内活跃过的设备发消息。如果您确实需要给全量设备发消息，可以联系 {{ include.supportEmail() }} 使用我们的企业版服务，我们将为您的应用创建独立集群来提供推送服务。

### 为什么推送记录的目标设备数为 0？

在 [控制台的推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 中，「目标设备数」是指符合本次推送查询条件的有效设备数量。该值为 0 时请检查<u>推送查询条件及目标设备是否有效</u>。另外请参考 [目标设备数的限制](#限制)。

### 为什么推送记录的内容为空？

在 [控制台的推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list) 中，当针对不同目标设备类型设置了不同消息内容时，「内容」一栏会显示为空，需要点击消息的「ID」打开推送详情来查看具体的内容。

### 推送的到达率如何

关于到达率这个概念，业界并没有统一的标准。我们测试过，在线用户消息的到达率基本达到 100%。我们的 SDK 做了心跳和重连等功能，尽量维持对推送服务器的长连接存活，提升消息到达用户手机的实时性和可靠性。

### 使用 iOS 的 Token Authentication 证书推送是否区分测试环境和生产环境？
使用 Token Authentication 也是区分生产和测试环境的，是使用 prod 参数用来区分。同一个 key 可以给测试环境发消息，也能给正式环境发消息。

但是同一个设备的 deviceToken 只能成功发送一个环境。要么是正式环境，要么是测试环境。现象是给一个 deviceToken 推送，如果 dev 成功了，prod 就会报 invalid Tokens，不会在两个环境同时发送成功。

### 有一些 iOS 设备收不到推送，到控制台查看推送记录，发现 invalidTokens 的数量大于 0，是怎么回事？

invalidTokens 的数量由以下两部分组成：
* 选择的设备与选择的证书不匹配时，会增加 invalidTokens 的数量，例如使用开发证书给生产证书的设备推送。
* 目标设备移除或重装了对应的 App。

针对第一种情况，请检查 APNS 证书是否过期，并检查是否使用了正确的证书类型。

### Android 消息接收能不能自定义 Receiver 不弹出通知

可以。请参考 [消息推送开发指南](push_guide.html#消息内容_Data)。

如果要自定义 receiver，必须在消息的 data 里带上自定义的 action。LeanCloud 在接收到消息后，将广播 action 为您定义的值的 intent 事件，您的 receiver 里也必须带上 `intent-filter` 来捕获该 action 值的 intent 事件。

### Android 应用进程被杀掉后无法收到推送消息
iOS 能做到这点，是因为当应用进程关闭后，Apple 和设备的系统之间还会存在连接，这条连接跟应用无关，所以无论应用是否被杀掉，消息都能发送到 APNs 再通过这条连接发送到设备。但对 Android 来说，如果是国内用户，因为众所周知的原因，Google 和设备之间的这条连接是无法使用的，所以应用只能自己去保持连接并在后台持续运行，一旦后台进程被杀掉，就无法收到推送消息了。虽然 LeanCloud SDK 已经采取了各种办法保持应用在后台运行，但随着 Android 系统版本的升级，权限控制越来越严，第三方推送通道的生命周期受到较大限制。因此 LeanCloud SDK 推出了混合推送的方案，对接国内主流厂商，保障了主流 Android 系统上的推送到达率。详见 [Android 混合推送开发指南](android_mixpush_guide.html)。

### 推送记录会保留多久？

推送记录会保留 7 天，7 天之前的推送记录无法查询。

### 同一个账号在两个设备登录过，两个设备都会收到推送信息吗？

推送的时候是根据推送查询条件，在 _installation 表中查找符合条件的目标设备来推送。只要查询条件能包含这两个设备，则两个设备都能收到推送。

如果是登录即时通讯系统，如果没有开启单点登录，用户在登录两个设备后，如果用户不在线会尝试给这两个设备都发离线消息推送。

### Android 非混合推送，控制台推送记录中显示推送成功，但 Android 设备实际没有收到推送，是什么原因？

对于 Android 非混合推送设备，当返回的记录成功数为 1 时，表示一定收到了 SDK 确认收到该消息的回应。即此条推送消息一定是到达了设备。
建议检查推送是否使用了自定义 Receiver 功能（消息中是否有 action 字段），消息到达后 SDK 会直接将消息转交给自定义 Receiver，由自定义 Receiver 完成推送提醒。这种情况需要检查自定义 Receiver 实现逻辑排查消息到达后为什么没有弹出提醒。

### 旧版本 Objective-C SDK 在 iOS 13 环境下，无法接收推送的解决办法。

在 iOS 13 环境下，由于苹果更改了基础框架的 API，导致旧版本的 Objc SDK（<= 11.6.6）无法上传有效的 device token。

解决办法是升级 SDK 版本到 v11.6.7 及以上，保存 deviceToken 的方法参见  [保存 Token](ios_push_guide.html#保存_Token)。

旧版本的 Objective-C SDK（<= 11.6.6）的解决办法是按如下方式上传 device token：

```
NSUInteger dataLength = deviceToken.length;
if (dataLength > 0) {
    const unsigned char *dataBuffer = deviceToken.bytes;
    NSMutableString *hexString = [NSMutableString stringWithCapacity:(dataLength * 2)];
    for (int i = 0; i < dataLength; ++i) {
        [hexString appendFormat:@"%02.2hhx", dataBuffer[i]];
    }
    [installation setDeviceToken:[hexString copy]];
    [installation saveInBackground];
}
```
或者使用 Swift SDK 替换 Objective-C SDK。


### iOS 推送如何选择推送证书？
推送消息接口有一个参数：**prod**。
**这个参数仅对 iOS 推送有效。**

* 当使用 Token Authentication 鉴权方式发 iOS 推送时，该参数用于设置将推送发至 APNs 的开发环境（dev）还是生产环境（prod）。
* 当使用证书鉴权方式发 iOS 推送时，该参数用于设置使用开发证书（dev）还是生产证书（prod）。在使用证书鉴权方式下，当设备在 Installation 记录中设置了 deviceProfile 时我们优先按照 deviceProfile 指定的证书推送。

## 推送问题排查

推送因为环节较多，跟设备和网络都相关，并且调用都是异步化，因此问题比较难以查找，这里提供一些有用助于排查消息推送问题的技巧。

### 推送结果查询

所有经过 `/push` 接口发出的消息的都可以在控制台的消息菜单里的推送记录看到。每次调用 `/push` 都将产生一条新的 推送记录表示一次推送。该表的各属性含义请参考 [Notification 表详解](#Notification) 。

`/push` 接口会返回新建的推送记录的 `objectId`，你就可以在推送记录里根据 ID 查询消息推送的结果。

### iOS 推送排查建议

iOS 推送问题的一些排查建议：

* 请确保在项目 Info.plist 文件中使用了正确的 **Bundle Identifier**。
* 请确保在 **Project** > **Build Settings** 设置了正确的 **provisioning profile**。
* 尝试 clean 项目并重启 Xcode
* 尝试到 [Apple Developer](https://developer.apple.com/account/overview.action) 重新生成 **provisioning profile**，修改 Apple ID，再改回来，然后重新生成。你需要重新安装 provisioning profile，并在 **Project** > **Build Settings** 里重新设置。
* 打开 XCode Organizer，从电脑和 iOS 设备里删除所有过期和不用的 provisioning profile。
* 如果编译和运行都没有问题，但是你仍然收不到推送，请确保你的应用打开了接收推送权限，在 iOS 设备的 **设置** > **通知** > **你的应用** 里确认。
* 如果权限也没有问题，请确保使用了正确的 **provisioning profile**。 打包你的应用。如果你上传了开发证书并使用开发证书推送，那么必须使用 **Development Provisioning Profile** 构建你的应用。如果你上传了生产证书，并且使用生产证书推送，请确保你的应用使用 **Distribution Provisioning Profile** 签名打包。**Ad Hoc** 和 **App Store Distribution Provisioning Profile** 都可以接收使用生产证书发送的消息。
* 当在一个已经存在的 Apple ID 上启用推送，请记得重新生成 **provisioning profile**，并到 XCode Organizer 更新。
* 生产环境的推送证书必须在提交到 App Store 之前启用推送并生成，否则你需要重新提交 App Store。
* 请在提交 App Store 之前，使用 Ad Hoc Profile 测试生产环境推送，这种情况下的配置最接近于 App Store。
* 检查消息菜单里的推送记录中的 `devices` 和 `status`，确认推送状态和接收设备数目正常。
* 检查消息菜单里的推送记录中的 `invalidTokens` 字段，如果该数字异常大，可能证书选择错误，跟设备 build 的 provisioning profile 不匹配。

### Android 排查建议

Android 推送问题的一些建议和提示：

* 请确保设备正确调用了 `AVInstallation` 保存了设备信息到 _Installation 表。
* 可以在控制台的 **消息** > **推送** > **帮助** 根据 `installationId` 查询设备是否在线。
* 请确保 `com.avos.avoscloud.PushService` 添加到 AndroidManifest.xml 文件中。
* 如果使用自定义 Receiver，请确保在 AndroidManifest.xml 中声明你的 Receiver，并且保证 data 里的 action 一致。
