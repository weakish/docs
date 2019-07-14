{% from "views/_data.njk" import libVersion as version %}
{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as include %}

{{ include.setService('push') }}

# Android 混合推送开发指南

## 混合推送概述

自 Android 8.0 之后，系统权限控制越来越严，第三方推送通道的生命周期受到较大限制；同时，国内主流厂商也开始推出自己独立的推送服务，而厂商间千差万别的繁杂接口徒增了开发和代码维护的难度。为此，我们推出了混合推送的方案。我们逐一对接国内主流厂商，将它们不同的接口隐藏起来，让开发者通过统一的 API 完成推送任务。这不仅大幅降低了开发复杂度，还保障了主流 Android 系统上的推送到达率。

在混合推送方案里，消息下发时使用的通道不再是 LeanCloud 自己维持的 WebSocket 长连接，而是借用厂商和 OS 层的系统通道进行通信。一条推送消息下发的步骤如下：
1. 开发者调用 LeanCloud Push API 请求对全部或特定设备进行推送；
2. LeanCloud 服务端将请求转发给厂商的推送接口；
3. 厂商通过手机端的系统通道下发推送消息，同时手机端系统消息接收器将推送消息展示到通知栏；
4. 终端用户点击消息之后唤起目标应用或者页面。

整个流程与苹果的 APNs 推送类似，LeanCloud SDK 在客户端基本不会得到调用，消息的下发和展示都依赖厂商客户端的行为。所以如果部分厂商在某些推送中夹带了其他非开发者提交的消息，或者在服务启用的时候，有额外营销性质的弹窗，这都是厂商自己的行为，与 LeanCloud 完全无关，还请大家了解。另外，如果开发者碰到厂商 SDK 的问题，我们也无法深入调查，还请大家自行到厂商的论坛或技术支持渠道咨询解决。

开启了混合推送之后，Installation 表中每一个设备对应的记录，会增加一个 vendor 字段（如果没有这一字段，则说明客户端集成有问题），其值分别为：

vendor | 厂商
---|---
`HMS` | 华为 HMS 推送
`mi`  | 小米推送
`mz`  | 魅族推送

### 即时通讯的离线推送

在即时通讯服务中，在 iOS 和 Windows Phone 平台上如果用户下线，是可以启动离线消息推送机制的，对于 Android 用户来说，如果只是使用 LeanCloud 自身推送通道，那么是不存在离线推送的，因为聊天和推送共享同一条 WebSocket 长链接，在即时通讯服务中用户下线了的话，那么推送也必然是不可达的。但是如果启用了混合推送，因为推送消息走的是厂商通道，这一点和 iOS 基本一致，所以这时候 Android 用户就存在离线推送的通知路径了。
也就是说，如果开启了混合推送，那么即时通讯里面的离线推送和静音机制，对使用了混合推送的 Android 用户也是有效的。

下面我们逐一看看如何对接华为、小米、魅族等厂商的推送服务，文档的最后也提及了在海外市场如何对接 Firebase Cloud Messaging 的方法。

## 华为推送-HMS 版本

### 环境配置

1. **注册华为账号**：在 [华为开发者联盟](http://developer.huawei.com/cn/consumer/) 注册华为开发者账号（[详细流程](https://developer.huawei.com/consumer/cn/devservice/doc/20300)）。
2. **开发前准备**：接入华为 PUSH 之前，需要 [配置应用签名](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent#2%20配置应用签名)。
3. 登录 [华为开发者联盟](http://developer.huawei.com/cn/consumer/)，点击右上角「管理中心」，在管理中心 > 应用服务 > 开发服务 > 配置中 [开通推送服务](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent#3%20开通推送服务)。
4. **设置华为的 AppId 及 AppKey**：在华为开发者联盟 > 管理中心 > 开发服务 > Push 产品列表中选择目标产品。点进目标产品获取应用的服务信息 AppId 及 AppSecret，将此 AppId 及 AppSecret 通过  [LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 与 LeanCloud 应用关联。

### 接入 SDK

#### 获取 HMS SDK 和 HMS Agent SDK
华为 HMS 推送 SDK 分为两部分，一个是 HMS SDK，一个是 HMS Agent SDK，两个 SDK 都要正确接入，且两者需要主版本号一致才能正常使用（当前 LeanCloud 混合推送基于 v2.6.3.306 这一版本）。可参考：[华为官方文档：消息推送服务开发准备](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent)。

HMS SDK 可以直接通过 jar 包加入，解压 HMS SDK 目录如下表所示，需要将下面三个目录的文件拷贝到应用工程根目录，华为要求将 HMS 资源文件和证书文件打包到 apk 中。（[SDK 下载地址](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent#4%20%E4%B8%8B%E8%BD%BDSDK)）

目录 | 说明 | 使用方式
----|----|----
libs/ | 包含 HMS 所有功能的 jar 包。通用包不再按照业务功能分成多个 jar 包，包含帐号、支付、消息、推送、游戏服务。 |请直接将 libs 目录拷贝到应用工程根目录
res/ | HMS SDK 需要使用的资源目录，包含多国语言。应用如果不需要集成多种语言的，可以适当裁剪。但是必须保留默认语言和简体中文。 | 请直接将 res 目录拷贝到应用工程目录
assets/ | HMS SDK 请求华为服务器需要使用的证书文件 | 请直接将 assets 目录拷贝到应用工程根目录

HMS Agent SDK 需要下载解压之后把源码完全拷贝进入工程。HMS Agent SDK 包含帐号、支付、消息、推送、游戏等功能，如果只打算使用其中的推送功能，可以使用 HMS Agent SDK 压缩包中自带的 GetHMSAgent 脚本删除不需要的文件，具体步骤如下：

1. 执行 `GetHMSAgent_cn.bat` 生成 copysrc 的文件夹，copysrc 里面是根据您选择需要集成 HMS 服务，抽取后的 HMSAgent 代码（java 文件夹）和manifest文件（AndroidManifest.xml）。注意此步骤中会用到当前应用签名对应的 SHA256 指纹与应用的 App ID 与 App Secret 等信息。
2. 拷贝 copysrc/java 里面的代码到您现有的工程。请保持 HMSAgent 代码的包的路径和结构不变。AndroidManifest.xml仅供配置参考。

这样既可以减少应用大小，也可以避免要求不必要的权限。
详见 [华为开发者文档 > 集成 HMS SDK Agent](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent#5.1%20%E9%9B%86%E6%88%90SDK)。
注意，华为的文档里只提到了 `GetHMSAgent_cn.bat`，但实际上HMS Agent SDK 压缩包中还提供了 `GetHMSAgent_cn.sh`，如果您的开发环境是 macOS 或 Linux，可以用这个脚本。


> 注意：华为 HMS 推送不能与老的 HwPush 共存，如果切换到 HMS 推送，则需要将原来的 HwPush SDK 全部删除干净才行。

#### 修改应用 manifest 配置

首先导入 `avoscloud-mixpush` 包，修改 `build.gradle` 文件，在 `dependencies` 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar'){
        exclude group:'cn.leancloud.android', module:'hmsagent'
    }
}
```

然后配置相关 AndroidManifest，添加 Permission：

```xml
<!-- HMS-SDK引导升级HMS功能，访问OTA服务器需要网络权限 -->
<uses-permission android:name="android.permission.INTERNET"/>
<!-- HMS-SDK引导升级HMS功能，保存下载的升级包需要SD卡写权限 -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<!-- 检测网络状态 -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<!-- 检测wifi状态 -->
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<!-- HMS-SDK 为了获取用户手机的IMEI，用来唯一的标识用户。 -->
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>

<!-- 如果是安卓8.0，应用编译配置的targetSdkVersion>=26，请务必添加以下权限 -->
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>

<!-- HMS-SDK 接收PUSH TOKEN的广播以及PUSH消息需要定义该权限 ${PACKAGE_NAME} 要替换上您应用的包名 -->
<permission
    android:name="${PACKAGE_NAME}.permission.PROCESS_PUSH_MSG"
    android:protectionLevel="signatureOrSystem"/>
<!-- HMS-SDK 接收PUSH TOKEN的广播以及PUSH消息需要定义该权限 ${PACKAGE_NAME} 要替换上您应用的包名 -->
<uses-permission android:name="${PACKAGE_NAME}.permission.PROCESS_PUSH_MSG" />
```

再在 application 节点下添加 service 与 receiver。开发者要将其中的 `<包名>` 替换为自己的应用的 package：

```xml
<application
   android:name="xxx.xxx.xxx.YourApplication">
  <!-- 华为推送要求的设置（appId） -->
  <meta-data
    android:name="com.huawei.hms.client.appid"
    android:value="<please use your HMS appId>">
  </meta-data>
  <!-- 配置华为移动服务版本 -->
  <meta-data  
    android:name="com.huawei.hms.version"  
    android:value="2.6.3">
  </meta-data>

  <!-- 华为推送要求的 updateProvider，用于HMS SDK引导升级HMS APK，提供给系统安装器读取升级文件 -->
  <!-- <包名> 用实际的应用包名替换 -->
  <provider
      android:name="com.huawei.hms.update.provider.UpdateProvider"
      android:authorities="<包名>.hms.update.provider"
      android:exported="false"
      android:grantUriPermissions="true">
  </provider>

  <!-- 华为推送要求的 activity -->
  <!-- BridgeActivity定义了HMS SDK中一些跳转所需要的透明页面 -->
  <activity
      android:name="com.huawei.hms.activity.BridgeActivity"
      android:configChanges="orientation|locale|screenSize|layoutDirection|fontScale"
      android:excludeFromRecents="true"
      android:exported="false"
      android:hardwareAccelerated="true"
      android:theme="@android:style/Theme.Translucent">
      <meta-data
          android:name="hwc-theme"
          android:value="androidhwext:style/Theme.Emui.Translucent"/>
  </activity>

  <!-- AppUpdateActivity和PackageInstallActivity是 HMS SDK自升级接口所需要使用的页面 -->
  <activity
      android:name="com.huawei.updatesdk.service.otaupdate.AppUpdateActivity"
      android:configChanges="orientation|screenSize"
      android:exported="false"
      android:theme="@style/upsdkDlDialog" >
  
      <meta-data
          android:name="hwc-theme"
          android:value="androidhwext:style/Theme.Emui.Translucent.NoTitleBar" />
  </activity>
        
  <activity
      android:name="com.huawei.updatesdk.support.pm.PackageInstallerActivity"
      android:configChanges="orientation|keyboardHidden|screenSize"
      android:exported="false"
      android:theme="@style/upsdkDlDialog" >
      <meta-data
          android:name="hwc-theme"
          android:value="androidhwext:style/Theme.Emui.Translucent" />
  </activity>
        
  <!-- 解决华为移动服务升级问题的透明界面 -->
  <activity
    android:name="com.huawei.android.hms.agent.common.HMSAgentActivity"
    android:configChanges="orientation|locale|screenSize|layoutDirection|fontScale"
    android:excludeFromRecents="true"
    android:exported="false"
    android:hardwareAccelerated="true"
    android:theme="@android:style/Theme.Translucent" >
    <meta-data
        android:name="hwc-theme"
        android:value="androidhwext:style/Theme.Emui.Translucent" />
  </activity>

  <!-- HMS-SDK 下载服务 -->
  <service android:name="com.huawei.updatesdk.service.deamon.download.DownloadService"
      android:exported="false"/>

  <!-- LeanCloud 自定义 receiver -->
  <!-- ${PACKAGE_NAME} 要替换上您应用的包名 -->
  <receiver android:name="com.avos.avoscloud.AVHMSPushMessageReceiver"
  android:permission="${PACKAGE_NAME}.permission.PROCESS_PUSH_MSG">
      <intent-filter>
         <!-- 必须,用于接收token -->
         <action android:name="com.huawei.android.push.intent.REGISTRATION" />
         <!-- 必须, 用于接收透传消息 -->
         <action android:name="com.huawei.android.push.intent.RECEIVE" />
         <!-- 必须, 用于接收通知栏消息点击事件 此事件不需要开发者处理，只需注册就可以 -->
         <action android:name="com.huawei.intent.action.PUSH_DELAY_NOTIFY"/>
      </intent-filter>
  </receiver>

  <!-- 开发者自定义的打开推送消息的目的 activity，如果不指定则默认是打开应用。-->
  <activity android:name="<please use your own activity name>">
      <intent-filter>
          <action android:name="android.intent.action.VIEW" />
          <category android:name="android.intent.category.DEFAULT" />
          <data android:scheme="lcpushscheme" android:host="cn.leancloud.push" android:path="/notify_detail"/>
      </intent-filter>
  </activity>

</application>
```

如果开发者还使用了华为的其他服务（例如支付等），请参考华为[官方文档](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_devprepare_agent#4%20%E4%B8%8B%E8%BD%BDSDK)来调整 manifest 文件内容。

### 具体使用

1. 在 application 的 onCreate 方法中调用 `AVOSCloud.initialize` 完成初始化之后，增加 `AVMixPushManager.registerHMSPush(context, profile)` 完成 HMS 推送的初始化。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

2. 务必在应用启动的首个 activity 的 `onCreate` 方法中调用 `AVMixPushManager.connectHMS(activity)` ，确保 HMS SDK 和 HMS APK 的连接。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用华为推送：

  - EMUI 系统
  - 在华为后台正确配置应用签名
  - manifest 正确填写
  
> 检测华为推送是否集成成功，可以检查 Installation 表中该设备对应的记录是否增加一个 vendor 字段，vendor 字段值为 HMS 表示设备成功注册为华为 HMS 推送。 

### 提升透传消息到达率

当使用华为推送发透传消息时，如果目标设备上 App 进程被杀，会出现推送消息无法接收的情况。这个是华为 ROM 对透传消息广播的限制导致的，需要引导用户在华为 「权限设置」中对 App 开启自启动权限来避免。

### 使用特定 activity 响应推送消息

华为推送消息，在用户点击了通知栏信息之后，默认是打开应用，用户也可以指定特定的 activity 来响应推送启动事件，开发者需要在 manifest 文件的 application 中定义如下的 activity：
```
<!-- 开发者自定义的打开推送消息的目的 activity，如果不指定则默认是打开应用。-->
<activity android:name="<please use your own activity name>">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:scheme="lcpushscheme" android:host="cn.leancloud.push" android:path="/notify_detail"/>
    </intent-filter>
</activity>
```
这里 intent-filter 的内容不能修改，在目标 activity 的 `onCreate` 函数中可以从 intent extra data 中通过 `content` key 可以获得推送内容（JSON 格式，包含 push 消息中所有自定义属性）。

在 HMS 推送中，我们是通过自定义 intent 参数来指定响应 activity 的，对应到华为的参数的话，是 action 内 type 为 1， param 内 intent 参数为您传递的自定义参数转为 json 的字符串（具体可参考华为文档[服务端发送 push 消息](https://developer.huawei.com/consumer/cn/service/hms/catalog/huaweipush_agent.html?page=hmssdk_huaweipush_api_reference_agent_s2)）。

在 LeanCloud 后端发送这种推送的例子如下：
```
curl -X POST \
  -H "X-LC-Id: {your app id}"          \
  -H "X-LC-Key: {your app key}"        \
  -H "Content-Type: application/json" \
  -d '{
        "where": {"channels" : ["public"]}
        "data": {"alert" : "Hello from LeanCloud",
                 "action" : {"type": 1,
                             "param": {
                                 "intent":"#Intent;compo=com.rvr/.Activity;S.W=U;end"
                              }
                            }
                 }
     }' \
  https://api.leancloud.cn/1.1/push
```

### 参考 demo
我们提供了一个 [最新的华为推送 demo](https://github.com/leancloud/mixpush-demos/tree/master/huawei)，可供你在接入过程中参考。

## 小米推送

### 环境配置

1. **注册小米账号**：在 [小米开放平台][xiaomi] 上注册小米开发者账号并完成实名认证（[详细流程](http://dev.xiaomi.com/doc/?p=90)）。
2. **创建小米推送服务应用**（[详细流程](http://dev.xiaomi.com/doc/?p=1621)）。
3. **设置小米的 AppId 及 AppSecret**：在 [小米开放平台][xiaomi] > **管理控制台** > **消息推送** > **相关应用** 可以查到具体的小米推送服务应用的 AppId 及 AppSecret。将此 AppId 及 AppSecret 通过 [LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 与 LeanCloud 应用关联。

### 接入 SDK

首先导入 `avoscloud-mixpush` 包。修改 `build.gradle` 文件，在 **dependencies** 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar')
}
```

注：如果是通过 jar 包导入，则需要手动下载 jar 包 [小米 Push SDK](http://dev.xiaomi.com/mipush/downpage/)。

然后配置相关 AndroidManifest。添加 Permission：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.GET_TASKS" />
<uses-permission android:name="android.permission.VIBRATE"/>
<permission android:name="<包名>.permission.MIPUSH_RECEIVE" android:protectionLevel="signature" />
<uses-permission android:name="<包名>.permission.MIPUSH_RECEIVE" />
```

添加 service 与 receiver。开发者要将其中的 `<包名>` 替换为自己的应用对应的 package：

```xml
<service
  android:name="com.xiaomi.push.service.XMPushService"
  android:enabled="true"
  android:process=":pushservice"/>

<service
  android:name="com.xiaomi.push.service.XMJobService"
  android:enabled="true"
  android:exported="false"
  android:permission="android.permission.BIND_JOB_SERVICE"
  android:process=":pushservice" />

<service
  android:name="com.xiaomi.mipush.sdk.PushMessageHandler"
  android:enabled="true"
  android:exported="true"/>

<service
  android:name="com.xiaomi.mipush.sdk.MessageHandleService"
  android:enabled="true"/>

<receiver
  android:name="com.xiaomi.push.service.receivers.NetworkStatusReceiver"
  android:exported="true">
  <intent-filter>
      <action android:name="android.net.conn.CONNECTIVITY_CHANGE"/>
      <category android:name="android.intent.category.DEFAULT"/>
  </intent-filter>
</receiver>

<receiver
  android:name="com.xiaomi.push.service.receivers.PingReceiver"
  android:exported="false"
  android:process=":pushservice">
  <intent-filter>
      <action android:name="com.xiaomi.push.PING_TIMER"/>
  </intent-filter>
</receiver>

<receiver
  android:name="com.avos.avoscloud.AVMiPushMessageReceiver"
  android:exported="true">
  <intent-filter>
      <action android:name="com.xiaomi.mipush.RECEIVE_MESSAGE"/>
  </intent-filter>
  <intent-filter>
      <action android:name="com.xiaomi.mipush.MESSAGE_ARRIVED"/>
  </intent-filter>
  <intent-filter>
      <action android:name="com.xiaomi.mipush.ERROR"/>
  </intent-filter>
</receiver>
```

### 具体使用

在 `AVOSCloud.initialize` 时调用以下函数：

```java
AVMixPushManager.registerXiaomiPush(context, miAppId, miAppKey, profile)
```

- 参数 `miAppKey` 需要的是 AppKey，而在控制台的混合推送配置中 Profile 的第二个参数是 AppSecret，请注意区分，并分别正确填写。
- 参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用小米推送：

- MIUI 系统
- manifest 正确填写
- appId、appKey、appSecret 有效

### 小米推送通知栏消息的点击事件

当小米通知栏消息被点击后，如果已经设置了 [自定义 Receiver](android_push_guide.html#自定义_Receiver)，则 SDK 会发送一个 action 为 `com.avos.avoscloud.mi_notification_action` 的 broadcast。如有需要，开发者可以通过订阅此消息获取点击事件，否则 SDK 会默认打开 [启动推送服务](android_push_guide.html#启动推送服务) 对应设置的 Activity。

## 魅族推送

### 环境配置

1. **注册魅族账号**：在 [Flyme开放平台](https://open.flyme.cn) 上注册魅族开发者账号并完成开发者认证 ([详细流程](http://open-wiki.flyme.cn/index.php?title=%E6%96%B0%E6%89%8B%E6%8C%87%E5%8D%97))。
2. **创建魅族推送服务应用** ([详细流程](http://open-wiki.flyme.cn/index.php?title=%E9%AD%85%E6%97%8F%E6%8E%A8%E9%80%81%E5%B9%B3%E5%8F%B0%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C))。
3. **设置魅族的 AppId 及 AppSecret**：在 [魅族推送平台](http://push.meizu.com/) > **应用列表** > **打开应用** > **配置管理** 可以查到具体的魅族推送服务应用的 AppId 及 AppSecret。将此 AppId 及 AppSecret 通过 [LeanCloud 控制台][leancloud-console] > **消息** > **推送** > **设置** > **混合推送**，与 LeanCloud 应用关联。

### 接入 SDK

首先导入 `avoscloud-mixpush` 包。修改 `build.gradle` 文件，在 **dependencies** 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar')
    compile ('com.meizu.flyme.internet:push-internal:3.6.+@aar')
}
```

注：如果是通过 jar 包导入，则需要手动下载 jar 包 [魅族 Push SDK](https://github.com/MEIZUPUSH/PushDemo-Eclipse/releases)。

然后配置相关 AndroidManifest。添加 Permission：

```xml
  <!-- 兼容flyme5.0以下版本，魅族内部集成pushSDK必填，不然无法收到消息-->
  <uses-permission android:name="com.meizu.flyme.push.permission.RECEIVE"></uses-permission>
  <permission android:name="<包名>.push.permission.MESSAGE" android:protectionLevel="signature"/>
  <uses-permission android:name="<包名>.push.permission.MESSAGE"></uses-permission>
    
  <!--  兼容flyme3.0配置权限-->
  <uses-permission android:name="com.meizu.c2dm.permission.RECEIVE" />
  <permission android:name="<包名>.permission.C2D_MESSAGE"
                    android:protectionLevel="signature"></permission>
  <uses-permission android:name="<包名>.permission.C2D_MESSAGE"/>
```

添加 service 与 receiver。开发者要将其中的 `<包名>` 替换为自己的应用对应的 package：

```xml
<receiver android:name="com.avos.avoscloud.AVFlymePushMessageReceiver">
    <intent-filter>
        <!-- 接收push消息 -->
        <action android:name="com.meizu.flyme.push.intent.MESSAGE" />
        <!-- 接收register消息 -->
        <action android:name="com.meizu.flyme.push.intent.REGISTER.FEEDBACK" />
        <!-- 接收unregister消息-->
        <action android:name="com.meizu.flyme.push.intent.UNREGISTER.FEEDBACK"/>
        <!-- 兼容低版本Flyme3推送服务配置 -->
        <action android:name="com.meizu.c2dm.intent.REGISTRATION" />
        <action android:name="com.meizu.c2dm.intent.RECEIVE" />
        <category android:name="<包名>"></category>
    </intent-filter>
</receiver>
```

### 具体使用

在 `AVOSCloud.initialize` 时调用 `AVMixPushManager.registerFlymePush(context, flymeId, flymeKey, profile)` 即可。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

注意，LeanCloud 云端只有在以下三个条件都满足的情况下，才会使用魅族推送。

- Flyme 系统
- manifest 正确填写
- flymeId、flymeKey 有效

#### 魅族推送通知栏消息的点击事件

当魅族通知栏消息被点击后，如果已经设置了 [自定义 Receiver](android_push_guide.html#自定义_Receiver)，则 SDK 会发送一个 action 为 `com.avos.avoscloud.flyme_notification_action` 的 broadcast。如有需要，开发者可以通过订阅此消息获取点击事件，否则 SDK 会默认打开 [启动推送服务](android_push_guide.html#启动推送服务) 对应设置的 Activity。

## vivo 推送（beta）

我们新推出了支持 vivo 手机的混合推送，当前该功能还处于 beta 阶段，可能存有缺陷，所以我们没有发布正式版 SDK，而是采用了源码配 demo 的形式来公开这一功能。欢迎感兴趣的开发者试用，也期待大家给我们更多的反馈。

- vivo 混合推送 SDK 源代码：可参照 [这里](https://github.com/leancloud/android-sdk-all/tree/master/avoscloud-mixpush)。
- vivo 混合推送 demo：可参照 [这里](https://github.com/leancloud/mixpush-demos/tree/master/vivo)。在 demo 工程的 [app/libs](https://github.com/leancloud/mixpush-demos/tree/master/vivo/app/libs) 目录下，即可发现我们编译好的 `4.7.11-beta` 版本 SDK，大家可以拷贝到自己的工程中来直接使用。

### 环境配置
要使用 vivo 官方推送服务，需要在 [vivo 开发者平台](https://dev.vivo.com.cn/home)注册一个账号，并创建好应用。
这里假设大家已经完成上述操作，
创建好了应用，并获取了 `appId` 和 `appKey`（请保存好这两个值，下一步接入的时候会用到。）

### 接入 SDK
当前版本的 SDK 是基于 vivo 官方文档 [push SDK 接入文档](https://dev.vivo.com.cn/documentCenter/doc/158) 封装而来，使用的 vivo push SDK 基线版本是 `2.3.4`。我们会结合 demo（[源码](https://github.com/leancloud/mixpush-demos/tree/master/vivo/)）来解释整个接入流程。

首先将 demo 工程 app/libs 目录下的所有 jar 包拷贝到目标工程的 libs 目录下，然后修改 `build.gradle` 文件，在 `dependencies` 中添加依赖：

```
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'com.squareup.okhttp3:okhttp:3.8.1'
    implementation 'com.alibaba:fastjson:1.2.37'
    implementation 'org.java-websocket:Java-WebSocket:1.3.9'
    implementation 'com.google.protobuf:protobuf-java:3.4.0'

    implementation 'com.meizu.flyme.internet:push-internal:3.6.2@aar'
```

接下来配置 AndroidManifest，添加权限声明：

```xml
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.VIBRATE"/>
```

最后在 AndroidManifest 中添加 service 与 receiver（开发者要将其中的 `com.vivo.push.app_id` 和 `com.vivo.push.app_key` 替换为自己的应用的信息）：

```xml
        <service
            android:name="com.vivo.push.sdk.service.CommandClientService"
            android:exported="true" />
        <activity
            android:name="com.vivo.push.sdk.LinkProxyClientActivity"
            android:exported="false"
            android:screenOrientation="portrait"
            android:theme="@android:style/Theme.Translucent.NoTitleBar" />

        <!-- push应用定义消息receiver声明，大家要换成自己的实现类 -->
        <receiver android:name=".MyPushMessageReceiver">
            <intent-filter>
                <!-- 接收push消息 -->
                <action android:name="com.vivo.pushclient.action.RECEIVE" />
            </intent-filter>
        </receiver>

        <meta-data
            android:name="com.vivo.push.api_key"
            android:value="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        <meta-data
            android:name="com.vivo.push.app_id"
            android:value="xxxxx" />
```

接下来我们看看代码上要怎么做。

#### 初始化

与其他推送的初始化方法一样，我们在 `Application#onCreate` 方法中进行 vivo 推送的初始化：

```java
public class MyApp extends Application {
  // 请替换成您自己的 appId 和 appKey
  private static final String LC_APP_ID = "xxx";
  private static final String LC_APP_KEY = "xxx";

  @Override
  public void onCreate() {
    super.onCreate();

    //开启调试日志
    AVOSCloud.setDebugLogEnabled(true);

    // AVOSCloud SDK 初始化
    AVOSCloud.initialize(this,LC_APP_ID,LC_APP_KEY);

    // vivo 推送初始化
    AVMixPushManager.registerVIVOPush(this);
    AVMixPushManager.turnOnVIVOPush(new AVCallback<Boolean>() {
      @Override
      protected void internalDone0(Boolean aBoolean, AVException e) {
        if (null != e) {
          System.out.println("failed to turn on vivo push. cause:");
          e.printStackTrace();
        } else {
          System.out.println("succeed to turn on vivo push.");
        }
      }
    });
  }
}
```

开发者也可以在 `onCreate` 方法中调用 AVMixPushManager 的其他方法，以使用 vivo 推送的全部客户端功能：

```java
public class AVMixPushManager {
  // 判断当前设备是否支持 vivo 推送
  public static boolean isSupportVIVOPush(Context context);

  // 关闭 vivo 推送
  public static void turnOffVIVOPush(final AVCallback<Boolean> callback);

  public static void bindVIVOAlias(Context context, String alias, final AVCallback<Boolean> callback)；

  public static void unbindVIVOAlias(Context context, String alias, final AVCallback<Boolean> callback);

  public static String getVIVOAlias(Context context);

  public static void setVIVOTopic(Context context, String topic, final AVCallback<Boolean> callback);

  public static void delVIVOTopic(Context context, String topic, final AVCallback<Boolean> callback);

  public static List<String> getVIVOTopics(Context context);  
}
```

#### 响应通知栏消息的点击事件

与其他厂商的混合推送机制一样，vivo 混合推送也是通过系统通道来下发消息，开发者调用 push API 发送消息时，其流程为：

- 用户服务器向 LeanCloud 推送服务器发送推送请求；
- LeanCloud 推送服务器 向 vivo 服务器 转发请求；
- vivo 服务器 通过系统长链接下发推送通知到 手机端；
- 手机端操作系统将消息展示在通知栏；
- 用户点击通知栏消息。此时 vivo 系统会调用应用 AndroidManifest 里定义的响应 `com.vivo.pushclient.action.RECEIVE` action 的接收器（如前面 AndroidManifest 里定义的 `MyPushMessageReceiver` 类）。

应用需要从混合推送 SDK 中的 `AVVIVOPushMessageReceiver` 类派生出自己的实现类，在 `void onNotificationMessageClicked(Context var1, UPSNotificationMessage var2)` 方法中响应点击事件，以动态改变展示内容。
下面的例子展示了 `MyPushMessageReceiver` 类的简单示例：

```java
import android.content.Context;

import com.avos.avoscloud.AVVIVOPushMessageReceiver;
import com.vivo.push.model.UPSNotificationMessage;

import java.util.logging.Level;
import java.util.logging.Logger;

public class MyPushMessageReceiver extends AVVIVOPushMessageReceiver {
  private static final Logger logger = Logger.getLogger(MyPushMessageReceiver.class.getSimpleName());

  public void onNotificationMessageClicked(Context var1, UPSNotificationMessage var2) {
    logger.log(Level.FINER, "received MessageClick Event. " + var2.toString());
  }
}
```

这样就完成了 vivo 推送的完整流程。


## FCM 推送（仅美国节点可用）

{{ docs.alert("FCM 推送仅支持部署在 LeanCloud 美国节点上的应用使用。") }}

[FCM](https://firebase.google.com/docs/cloud-messaging)（Firebase Cloud Messaging）是 Google/Firebase 提供的一项将推送通知消息发送到手机的服务。接入时后台需要配置连接 FCM 服务器需要的推送 key 和证书，FCM 相关的 token 由 LeanCloud SDK 来申请。

### 环境要求

FCM 客户端需要在运行 Android 4.0 或更高版本且安装了 Google Play 商店应用的设备上运行，或者在运行 Android 4.0 且支持 Google API 的模拟器中运行。具体要求参见 [在 Android 上设置 Firebase 云消息传递客户端应用](https://firebase.google.com/docs/cloud-messaging/android/client)。

### 接入 SDK
#### 首先导入 avoscloud-fcm 包
修改 build.gradle 文件，在 dependencies 中添加依赖：

```xml
dependencies {
    compile ('cn.leancloud.android:avoscloud-fcm:{{ version.leancloud }}@aar')
}
```

#### 下载最新的配置文件并加入项目
从 Firebase 控制台下载最新的配置文件（google-services.json），加入 app 项目的根目录下。

#### 修改应用清单
将以下内容添加至您应用的 `AndroidManifest`文件中：
- LeanCloud PushService 服务。
```
<service android:name="com.avos.avoscloud.PushService"/>
```
- `AVFirebaseMessagingService` 的服务。如果您希望在后台进行除接收应用通知之外的消息处理，则必须添加此服务。要接收前台应用中的通知、接收数据有效负载以及发送上行消息等，您必须继承此服务。
```
<service
  android:name="com.avos.avoscloud.AVFirebaseMessagingService">
 <intent-filter>
  <action android:name="com.google.firebase.MESSAGING_EVENT"/>
 </intent-filter>
</service>
```
- `AVFirebaseInstanceIdService` 的服务，用于处理注册令牌的创建、轮替和更新。如果要发送至特定设备或者创建设备组，则必须添加此服务。
```
<service
  android:name="com.avos.avoscloud.AVFirebaseInstanceIDService">
 <intent-filter>
  <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
 </intent-filter>
</service>
```
- （可选）应用组件中用于设置默认通知图标和颜色的元数据元素。如果传入的消息未明确设置图标和颜色，Android 就会使用这些值。
```
<meta-data
  android:name="com.google.firebase.messaging.default_notification_icon"
  android:resource="@drawable/ic_launcher_background" />
<meta-data
  android:name="com.google.firebase.messaging.default_notification_color"
  android:resource="@color/colorAccent" />
```
- （可选）从 Android 8.0（API 级别 26）和更高版本开始，Android 系统支持并推荐使用[通知渠道](https://developer.android.com/guide/topics/ui/notifiers/notifications.html?hl=zh-cn#ManageChannels)。FCM 提供具有基本设置的默认通知渠道。如果您希望[创建](https://developer.android.com/guide/topics/ui/notifiers/notifications.html?hl=zh-cn#CreateChannel)和使用您自己的默认渠道，请将 `default_notification_channel_id` 设为您的通知渠道对象的 ID（如下所示）；如果传入的消息未明确设置通知渠道，FCM 就会使用此值。
```
<meta-data
  android:name="com.google.firebase.messaging.default_notification_channel_id"
  android:value="@string/default_notification_channel_id"/>
```
- 如果 FCM 对于 Android 应用的功能至关重要，请务必在应用的 `build.gradle` 中设置 `minSdkVersion 8` 或更高版本。这可确保 Android 应用无法安装在不能让其正常运行的环境中。

### 程序初始化

使用 FCM 推送，客户端程序无需做特别的初始化。如果注册成功，`_Installation` 表中应该出现 **vendor** 这个字段为 `fcm` 的新记录。

### 配置控制台（设置 FCM 的 ProjectId 及 私钥文件）

在 [Firebase 控制台](https://console.firebase.google.com/) > **项目设置** > **服务账号** > **Firebase Admin SDK** > **生成新的秘钥** 可以获得服务端发送推送请求的私钥文件。将此 文件 及 ProjectId 通过 [LeanCloud 控制台][leancloud-console] > **消息** > **推送** > **设置** > **混合推送**，与 LeanCloud 应用关联。


## 取消混合推送注册

对于已经注册了混合推送的用户，如果想取消混合推送的注册而改走 LeanCloud 自有的 WebSocket 的话，可以调用如下函数：

```java
AVMixPushManager.unRegisterMixPush();
```

此函数为异步函数，如果取消成功会有「Registration canceled successfully」的日志输出，万一取消注册失败的话会有类似「unRegisterMixPush error」的日志输出。

## 错误排查建议

- 只要注册时有条件不符合，SDK 会在日志中输出导致注册失败的原因，例如「register error, mainifest is incomplete」代表 manifest 未正确填写。如果注册成功，`_Installation` 表中的相关记录应该具有 **vendor** 这个字段并且不为空值。
- 查看魅族机型的设置，并打开「信任此应用」、「开机自启动」、「自启动管理」和「权限管理」等相关选项。
- 如果注册一直失败的话，请去论坛发帖，提供相关日志、具体机型以及系统版本号，我们会跟进协助来排查。

## 华为推送-老版本（deprecated）

{{ docs.alert("华为已经不再支持老版本的推送服务，请大家尽快切换到 HMS 推送。") }}

### 环境配置

1. **注册华为账号**：在 [华为开发者联盟](http://developer.huawei.com/cn/consumer/)注册华为开发者账号（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%B3%A8%E5%86%8C%E7%99%BB%E5%BD%95)）。
2. **创建华为应用**：实名认证通过后，需要创建华为移动应用并配置 Push 权益（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%8E%A5%E5%85%A5%E8%AF%B4%E6%98%8E#2.1_.E6.B3.A8.E5.86.8C)）。
3. **设置华为的 AppId 及 AppKey**：在 [华为开发者联盟控制中心](http://developer.huawei.com/cn/consumer/devunion/openPlatform/html/memberCenter.html#appManage#) > **应用管理** > **移动应用详情**  可以查到具体的华为推送服务应用的 AppId 及 AppSecret，将此 AppId 及 AppSecret 通过  [LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/dashboard/messaging.html?appid={{appid}}#/message/push/conf) 与 LeanCloud 应用关联。

### 接入 SDK

首先导入 `avoscloud-mixpush` 包，修改 `build.gradle` 文件，在 `dependencies` 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar')
}
```

注：如果是通过 jar 包导入，则需要手动下载 jar 包：[华为 Push SDK](http://developer.huawei.com/cn/consumer/wiki/index.php?title=PushSDK%E4%B8%8B%E8%BD%BD)。

然后配置相关 AndroidManifest，添加 Permission：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

再添加 service 与 receiver。开发者要将其中的 `<包名>` 替换为自己的应用的 package：

```xml
<!-- 必须，用于华为 Android 6.0 系统的动态权限页面-->
<activity android:name="com.huawei.android.pushselfshow.permission.RequestPermissionsActivity"/>

<receiver android:name="com.avos.avoscloud.AVHwPushMessageReceiver" >
  <intent-filter>
      <!-- 必须，用于接收 token -->
      <action android:name="com.huawei.android.push.intent.REGISTRATION" />
      <!-- 必须，用于接收消息 -->
      <action android:name="com.huawei.android.push.intent.RECEIVE" />
      <!-- 可选，用于点击通知栏或通知栏上的按钮后触发 onEvent 回调 -->
      <action android:name="com.huawei.android.push.intent.CLICK" />
      <!-- 可选，查看 push 通道是否连接，不查看则不需要 -->
      <action android:name="com.huawei.intent.action.PUSH_STATE" />
  </intent-filter>
</receiver>

<receiver
  android:name="com.huawei.android.pushagent.PushEventReceiver"
  android:process=":pushservice" >
  <intent-filter>
      <action android:name="com.huawei.android.push.intent.REFRESH_PUSH_CHANNEL" />
      <action android:name="com.huawei.intent.action.PUSH" />
      <action android:name="com.huawei.intent.action.PUSH_ON" />
      <action android:name="com.huawei.android.push.PLUGIN" />
  </intent-filter>
  <intent-filter>
      <action android:name="android.intent.action.PACKAGE_ADDED" />
      <action android:name="android.intent.action.PACKAGE_REMOVED" />
      <data android:scheme="<包名>" />
  </intent-filter>
</receiver>
<receiver
  android:name="com.huawei.android.pushagent.PushBootReceiver"
  android:process=":pushservice" >
  <intent-filter>
      <action android:name="com.huawei.android.push.intent.REGISTER" />
      <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
  </intent-filter>
  <meta-data
      android:name="CS_cloud_version"
      android:value="\u0032\u0037\u0030\u0035" />
</receiver>

<service
  android:name="com.huawei.android.pushagent.PushService"
  android:process=":pushservice" >
</service>
```

### 具体使用

在 `AVOSCloud.initialize` 时调用 `registerHuaweiPush(context, profile)` 即可。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用华为推送：

- EMUI 系统
- manifest 正确填写

### 提升透传消息到达率

当使用华为推送发透传消息时，如果目标设备上 App 进程被杀，会出现推送消息无法接收的情况。这个是华为 ROM 对透传消息广播的限制导致的，需要引导用户在华为 「权限设置」中对 App 开启自启动权限来避免。

## GCM 推送（deprecated）

{{ docs.alert("Google 已停止支持，请升级使用上面的 FCM 推送。") }}

GCM（Google Cloud Messaging）是 Google 提供的一项将推送通知消息发送到手机的服务。接入时后台不需要任何设置，GCM 相关的 token 由 LeanCloud SDK 来申请。

### 环境要求

GCM 需要系统为 Android 2.2 及以上并且安装有 Google Play 商店的设备，或者使用了 GppgleAPIs 且系统为 Android 2.2 及以上的模拟器。具体要求详见 [Google Developers &middot; Set up a GCM Client App on Android](https://developers.google.com/cloud-messaging/android/client)。

### 接入 SDK

首先导入 avoscloud-gcm 包。修改 build.gradle 文件，在 dependencies 中添加依赖：

```xml
dependencies {
    compile ('cn.leancloud.android:avoscloud-gcm:{{ version.leancloud }}@aar')
}
```

然后补充 `AndroidManifest`，添加 Permission，开发者要将其中的 `<包名>` 替换为自己的应用对应的 package：

```xml
<permission android:name="<包名>.permission.C2D_MESSAGE"
                    android:protectionLevel="signature" />
<uses-permission android:name="<包名>.permission.C2D_MESSAGE" />
```

添加 service 与 receiver：

```xml
<receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
  <intent-filter>
      <action android:name="android.intent.action.BOOT_COMPLETED"/>
      <action android:name="android.intent.action.USER_PRESENT"/>
      <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
  </intent-filter>
</receiver>
<service android:name="com.avos.avoscloud.PushService" />
<service android:name="com.avos.avoscloud.AVGCMService">
  <intent-filter>
      <action android:name="com.google.android.c2dm.intent.RECEIVE" />
  </intent-filter>
</service>
<receiver
  android:name="com.google.android.gms.gcm.GcmReceiver"
  android:exported="true"
  android:permission="com.google.android.c2dm.permission.SEND" >
  <intent-filter>
      <action android:name="com.google.android.c2dm.intent.RECEIVE" />
      <action android:name="com.google.android.c2dm.intent.REGISTRATION" />
      <category android:name="<包名>" />
  </intent-filter>
</receiver>
```

接下来设置 GCM 开关。在 `AVOSCloud.initialize` 初始化时设置开关 `AVOSCloud.setGcmOpen(true)`。

注意，LeanCloud 云端只有在以下三个条件都满足的情况下，才会默认走 GCM 通道。

- LeanCloud 美国节点
- 调用 `AVOSCloud.setGcmOpen(true)`
- manifest 正确填写

如果注册成功，`_Installation` 表中的相关记录应该具有 **vendor** 这个字段并且不为空值。


[xiaomi]: http://dev.xiaomi.com/index

