{% from "views/_data.njk" import libVersion as version %}
{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as include %}

{{ include.setService('push') }}

# Android 消息推送开发指南

请先阅读 [消息推送概览](push_guide.html) 了解相关概念。

Android 推送功能除了需要必须的 `avoscloud.jar` 以外，还需要额外的 `avospush.jar`。

Android 消息推送有专门的 Demo，请见 [Android-Push-Demo](https://github.com/leancloud/android-push-demo) 项目。

## 消息推送流程简介

<img src="images/push-workflow-android.svg" class="img-responsive" alt="">

## Installation

当应用在用户设备上安装好以后，如果要使用消息推送功能，LeanCloud SDK 会自动生成一个 Installation 对象。该对象本质上是应用在设备上生成的安装信息，也包含了推送所需要的所有数据，因此要使用它来进行消息推送。

### 保存 Installation

你可以通过以下代码保存你的 Installation id。如果你的系统之前还没有 Installation id，系统会为你自动生成一个。


```java
AVInstallation.getCurrentInstallation().saveInBackground();
```

**这段代码应该在应用启动的时候调用一次**，保证设备注册到 LeanCloud 云端。你可以监听调用回调，获取 installationId 做数据关联。

```java
AVInstallation.getCurrentInstallation().saveInBackground(new SaveCallback() {
    public void done(AVException e) {
        if (e == null) {
            // 保存成功
            String installationId = AVInstallation.getCurrentInstallation().getInstallationId();
            // 关联  installationId 到用户表等操作……
        } else {
            // 保存失败，输出错误信息
        }
    }
});
```

## 启动推送服务

通过调用以下代码启动推送服务，同时设置默认打开的 Activity。

```java
// 设置默认打开的 Activity
PushService.setDefaultPushCallback(this, PushDemo.class);
```
### Android 8.0 推送适配

在调用 `AVOSCloud.initialize` 之前，需要先调用 `PushService.setDefaultChannelId(context, channelid)` 设置通知展示的默认 `channel`，否则消息无法展示。Channel ID 的解释请阅读 Google 官方文档 [Creating a notification](https://developer.android.com/guide/topics/ui/notifiers/notifications.html#CreateNotification)。

## 订阅频道

你的应用可以订阅某个频道（channel）的消息，只要在保存 Installation 之前调用 `PushService.subscribe` 方法：

```java
// 订阅频道，当该频道消息到来的时候，打开对应的 Activity
// 参数依次为：当前的 context、频道名称、回调对象的类
PushService.subscribe(this, "public", PushDemo.class);
PushService.subscribe(this, "private", Callback1.class);
PushService.subscribe(this, "protected", Callback2.class);
```

注意：

- 频道名称：**每个 channel 名称只能包含 26 个英文字母和数字。**
- 回调对象：指用户点击通知栏的通知进入的 Activity 页面。

退订频道也很简单：

```java
PushService.unsubscribe(context, "protected");
//退订之后需要重新保存 Installation
AVInstallation.getCurrentInstallation().saveInBackground();
```


## 推送消息

### 配置

请确保你的 `AndroidManifest.xml` 的 `<application>` 中包含如下内容：

```xml
<service android:name="com.avos.avoscloud.PushService" />
```

同时设置了必要的权限：

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

为了让应用能在关闭的情况下也可以收到推送，你需要在 `<application>` 中加入：

```xml
<receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.USER_PRESENT" />
        <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
    </intent-filter>
</receiver>
```

### 推送唤醒

如果希望支持应用间的推送唤醒机制，即在同一设备上有两个使用了 LeanCloud 推送的应用，应用 A 被杀掉后，当应用 B 被唤醒时可以同时唤醒应用 A 的推送，可以这样配置：

```xml
<service android:name="com.avos.avoscloud.PushService" android:exported="true"/>
```

### 推送给所有的设备

```java
AVPush push = new AVPush();
JSONObject object = new JSONObject();
object.put("alert", "push message to android device directly");
push.setPushToAndroid(true);
push.setData(object);
push.sendInBackground(new SendCallback() {
    @Override
    public void done(AVException e) {
        if (e == null) {
            // push successfully.
        } else {
            // something wrong.
        }
    });
```

### 发送给特定的用户

发送给「public」频道的用户：

```java
AVQuery pushQuery = AVInstallation.getQuery();
pushQuery.whereEqualTo("channels", "public");
AVPush push = new AVPush();
push.setQuery(pushQuery);
push.setMessage("Push to channel.");
push.setPushToAndroid(true);
push.sendInBackground(new SendCallback() {
    @Override
    public void done(AVException e) {
        if (e == null) {

        }   else {

        }
    }
});
```

发送给某个 Installation id 的用户，通常来说，你会将 AVInstallation 关联到设备的登录用户 AVUser 上作为一个属性，然后就可以通过下列代码查询 InstallationId 的方式来发送消息给特定用户，实现类似私信的功能：

```java
AVQuery pushQuery = AVInstallation.getQuery();
// 假设 THE_INSTALLATION_ID 是保存在用户表里的 installationId，
// 可以在应用启动的时候获取并保存到用户表
pushQuery.whereEqualTo("installationId", THE_INSTALLATION_ID);
AVPush.sendMessageInBackground("message to installation",  pushQuery, new SendCallback() {
    @Override
    public void done(AVException e) {

    }
});
```

在 2.6.7 以后，我们加入了通过 CQL 来筛选推送目标的功能，主要代码如下：

```java
    AVPush push = new AVPush();
    JSONObject data =
        new JSONObject(
            "{\"action\": \"com.avos.UPDATE_STATUS\", \"name\": \"Vaughn\", \"newsItem\": \"Man bites dog\"  }");
    push.setData(data);
    String installationId = AVInstallation.getCurrentInstallation().getInstallationId();
    push.setCloudQuery("select * from _Installation where installationId ='" + installationId
        + "'");
    push.sendInBackground(new SendCallback() {

      @Override
      public void done(AVException e) {

      }
    });
```

<div class="callout callout-info">CQL 与 AVQuery 同时只能设置一个，并且 `setPushTarget` 类函数（`setPushToAndroid` / `setPushToIOS` / `setPushToWindowsPhone`）只能与 AVQuery 一起使用。在设置 CQL 时，只能在 CQL 语句中设定目标机器的类型。</div>

### 自定义 Receiver

如果你想推送消息，但不显示在 Android 系统的通知栏中，而是执行应用程序预定义的逻辑，你需要在你的 Android 项目中的 `AndroidManifest.xml` 中声明你的 Receiver：

```xml
<receiver android:name="com.avos.avoscloud.PushDemo.MyCustomReceiver" android:exported="false">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.USER_PRESENT" />
        <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
        <action android:name="com.avos.UPDATE_STATUS" />
    </intent-filter>
</receiver>
```

其中 `com.avos.avoscloud.PushDemo.MyCustomReceiver` 是你的 Android 的 Receiver 类。而 `<action android:name="com.avos.UPDATE_STATUS" />` 需要与 push 的 data 中指定的 action 相对应。

你的 Receiver 可以按照如下方式实现：

```java
public class MyCustomReceiver extends BroadcastReceiver {
    private static final String TAG = "MyCustomReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        LogUtil.log.d(TAG, "Get Broadcat");
        try {
            String action = intent.getAction();
            String channel = intent.getExtras().getString("com.avos.avoscloud.Channel");
            //获取消息内容
            JSONObject json = new JSONObject(intent.getExtras().getString("com.avos.avoscloud.Data"));

            Log.d(TAG, "got action " + action + " on channel " + channel + " with:");
            Iterator itr = json.keys();
            while (itr.hasNext()) {
                String key = (String) itr.next();
                Log.d(TAG, "..." + key + " => " + json.getString(key));
            }
        } catch (JSONException e) {
            Log.d(TAG, "JSONException: " + e.getMessage());
        }
    }
}
```

同时，要求发送推送的请求也做相应更改，例如：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}"          \
  -H "X-LC-Key: {{appkey}}"        \
  -H "Content-Type: application/json" \
  -d '{
        "channels":[ "public"],
        "data": {
          "action": "com.avos.UPDATE_STATUS",
          "name": "LeanCloud."
        }
      }' \
  https://{{host}}/1.1/push
```

<div class="callout callout-info">如果你使用自定义的 Receiver，发送的消息必须带 action，并且其值在自定义的 Receiver 配置的 `<intent-filter>` 列表里存在，比如这里的 `'com.avos.UPDATE_STATUS'`，请使用自己的 action，尽量不要跟其他应用混淆，推荐采用域名来定义。</div>

### 跟踪 Android 推送和应用的打开情况

你可以在订阅频道对应的 Activity 中添加跟踪应用打开情况的统计代码，你的 Activity 可以按照如下方式实现 `onStart` 方法：

```java
public class MyActivity extends Activity {
	@Override
	protected void onStart() {
		super.onStart();

		Intent intent = getIntent();
		AVAnalytics.trackAppOpened(intent);
	}
}
```

如果要区分应用是由「推送」打开的这种情况，则需要为从推送跳转到 MyActivity 时要使用的 **intent** 增加一个 `PUSH_INTENT_KEY` 参数：

```java
intent.putExtra(AVConstants.PUSH_INTENT_KEY, 1);
```

然后当 MyActiviy 里 `getIntent()` 拿到这个 **intent** 后，执行 `AVAnalytics.trackAppOpened(intent);` 时发现 `PUSH_INTENT_KEY` 存在且为 1，则认定其来自推送。该统计可以通过 {% if node=='qcloud' %}**控制台 > 分析 > 行为分析 > 应用使用**{% else %}[控制台 > 分析 > 行为分析 > 应用使用](/stat.html?appid={{appid}}#/stat/appuse){% endif %} 查看。

## 混合推送

### 小米推送（仅中国节点）

#### 环境配置

1. **注册小米账号**：在 [小米开放平台][xiaomi] 上注册小米开发者账号并完成实名认证（[详细流程](http://dev.xiaomi.com/doc/?p=90)）。
2. **创建小米推送服务应用**（[详细流程](http://dev.xiaomi.com/doc/?p=1621)）。
3. **设置小米的 AppId 及 AppSecret**：在 [小米开放平台][xiaomi] > **管理控制台** > **消息推送** > **相关应用** 可以查到具体的小米推送服务应用的 AppId 及 AppSecret。将此 AppId 及 AppSecret 通过 {% if node == 'qcloud' %}LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**{% else %}[LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/messaging.html?appid={{appid}}#/message/push/conf){% endif %} 与 LeanCloud 应用关联。

#### 接入 SDK

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

#### 具体使用

在 `AVOSCloud.initialize` 时调用以下函数：

```java
AVMixpushManager.registerXiaomiPush(context, miAppId, miAppKey, profile)
```

- 参数 `miAppKey` 需要的是 AppKey，而在控制台的混合推送配置中 Profile 的第二个参数是 AppSecret，请注意区分，并分别正确填写。
- 参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用小米推送：

- MIUI 系统
- manifest 正确填写
- appId、appKey、appSecret 有效

#### 小米推送通知栏消息的点击事件

当小米通知栏消息被点击后，如果已经设置了 [自定义 Receiver](#自定义_Receiver)，则 SDK 会发送一个 action 为 `com.avos.avoscloud.mi_notification_action` 的 broadcast。如有需要，开发者可以通过订阅此消息获取点击事件，否则 SDK 会默认打开 [启动推送服务](#启动推送服务) 对应设置的 Activity。

### 华为推送-老版本（仅中国节点）

#### 环境配置

1. **注册华为账号**：在 [华为开发者联盟](http://developer.huawei.com/cn/consumer/)注册华为开发者账号（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%B3%A8%E5%86%8C%E7%99%BB%E5%BD%95)）。
2. **创建华为应用**：实名认证通过后，需要创建华为移动应用并配置 Push 权益（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%8E%A5%E5%85%A5%E8%AF%B4%E6%98%8E#2.1_.E6.B3.A8.E5.86.8C)）。
3. **设置华为的 AppId 及 AppKey**：在 [华为开发者联盟控制中心](http://developer.huawei.com/cn/consumer/devunion/openPlatform/html/memberCenter.html#appManage#) > **应用管理** > **移动应用详情**  可以查到具体的华为推送服务应用的 AppId 及 AppSecret，将此 AppId 及 AppSecret 通过 {% if node == 'qcloud' %}LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**{% else %}[LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/messaging.html?appid={{appid}}#/message/push/conf){% endif %} 与 LeanCloud 应用关联。

#### 接入 SDK

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

#### 具体使用

在 `AVOSCloud.initialize` 时调用 `registerHuaweiPush(context, profile)` 即可。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用华为推送：

- EMUI 系统
- manifest 正确填写

#### 提升透传消息到达率

当使用华为推送发透传消息时，如果目标设备上 App 进程被杀，会出现推送消息无法接收的情况。这个是华为 ROM 对透传消息广播的限制导致的，需要引导用户在华为 「权限设置」中对 App 开启自启动权限来避免。

### 华为推送-HMS 版本（仅中国节点）

#### 环境配置

1. **注册华为账号**：在 [华为开发者联盟](http://developer.huawei.com/cn/consumer/) 注册华为开发者账号（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%B3%A8%E5%86%8C%E7%99%BB%E5%BD%95)）。
2. **创建华为应用**：实名认证通过后，需要创建华为移动应用并配置 Push 权益（[详细流程](http://developer.huawei.com/cn/consumer/wiki/index.php?title=%E6%8E%A5%E5%85%A5%E8%AF%B4%E6%98%8E#2.1_.E6.B3.A8.E5.86.8C)）。
3. **设置华为的 AppId 及 AppKey**：在 [华为开发者联盟控制中心](http://developer.huawei.com/cn/consumer/devunion/openPlatform/html/memberCenter.html#appManage#) > **应用管理** > **移动应用详情**  可以查到具体的华为推送服务应用的 AppId 及 AppSecret，将此 AppId 及 AppSecret 通过 {% if node == 'qcloud' %}LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**{% else %}[LeanCloud 控制台 > **消息** > **推送** > **设置** > **混合推送**](/messaging.html?appid={{appid}}#/message/push/conf){% endif %} 与 LeanCloud 应用关联。

#### 接入 SDK

##### 获取 HMS SDK 和 HMS Agent SDK
华为 HMS 推送 SDK 分为两部分，一个是 HMS SDK，一个是 HMS Agent SDK，两者需要主版本号一致才能正常使用（当前 LeanCloud 混合推送基于 v2.6.0 这一主版本），具体可以参见 [华为 SDK 获取](http://developer.huawei.com/consumer/cn/service/hms/catalog/HuaweiJointOperation.html?page=hmssdk_jointOper_sdkdownload)。

HMS SDK 可以直接通过 jar 包加入，HMS Agent SDK 则需要下载解压之后把源码完全拷贝进入工程（也可以将 https://github.com/leancloud/android-sdk-all/hmsagent 作为 module 直接加入工程）。

> 注意：华为 HMS 推送不能与老的 HwPush 共存，如果切换到 HMS 推送，则需要将原来的 HwPush SDK 全部删除干净才行。

##### 修改应用 manifest 配置

首先导入 `avoscloud-mixpush` 包，修改 `build.gradle` 文件，在 `dependencies` 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar')
}
```

注：如果是通过 jar 包导入，则需要手动下载 jar 包：[华为 Push SDK](http://developer.huawei.com/cn/consumer/wiki/index.php?title=PushSDK%E4%B8%8B%E8%BD%BD)。

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
    <!-- 为了获取用户手机的IMEI，用来唯一的标识用户。 -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE"/>

    <!-- 如果是安卓8.0，应用编译配置的targetSdkVersion>=26，请务必添加以下权限 -->
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>
```

再添加 service 与 receiver。开发者要将其中的 `<包名>` 替换为自己的应用的 package：

```xml
        <!-- 华为推送要求的设置（appId） -->
        <meta-data
            android:name="com.huawei.hms.client.appid"
            android:value="<please use your HMS appId>">
        </meta-data>

        <!-- 华为推送要求的 updateProvider -->
        <provider
            android:name="com.huawei.hms.update.provider.UpdateProvider"
            android:authorities="<包名>.hms.update.provider"
            android:exported="false"
            android:grantUriPermissions="true">
        </provider>

        <!-- 华为推送要求的 activity -->
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

        <!-- 接收通道发来的通知栏消息 -->
        <receiver android:name="com.huawei.hms.support.api.push.PushEventReceiver">
            <intent-filter>
                <action android:name="com.huawei.intent.action.PUSH"/>
            </intent-filter>
        </receiver>

        <!-- LeanCloud 自定义 receiver -->
        <receiver android:name="com.avos.avoscloud.AVHMSPushMessageReceiver">
            <intent-filter>

                <!-- 必须，用于接收TOKEN -->
                <action android:name="com.huawei.android.push.intent.REGISTRATION"/>
                <!-- 必须，用于接收消息 -->
                <action android:name="com.huawei.android.push.intent.RECEIVE"/>
                <!-- 可选，用于点击通知栏或通知栏上的按钮后触发onEvent回调 -->
                <action android:name="com.huawei.android.push.intent.CLICK"/>
                <!-- 可选，查看PUSH通道是否连接，不查看则不需要 -->
                <action android:name="com.huawei.intent.action.PUSH_STATE"/>
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

```

#### 具体使用

1. 在 `AVOSCloud.initialize` 时调用 `AVMixPushManager.registerHMSPush(context, profile)` 即可。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

LeanCloud 云端只有在**满足以下全部条件**的情况下才会使用华为推送：

  - EMUI 系统
  - manifest 正确填写

2. 在应用启动的第一个页面的 `onCreate` 中调用 `AVMixPushManager.connectHMS(activity)` 即可。

#### 提升透传消息到达率

当使用华为推送发透传消息时，如果目标设备上 App 进程被杀，会出现推送消息无法接收的情况。这个是华为 ROM 对透传消息广播的限制导致的，需要引导用户在华为 「权限设置」中对 App 开启自启动权限来避免。

#### 使用特定 activity 响应推送消息

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
这里 intent-filter 的内容不能修改，在目标 activity 的 `onCreate` 函数中可以从 bundle 中通过 `content` key 可以获得推送内容（JSON 格式）。

#### 参考 demo
我们提供了一个 [最新的华为推送 demo](https://github.com/leancloud/mixpush-demos/tree/master/huawei)，可供你在接入过程中参考。

### 魅族推送（仅中国节点）

#### 环境配置

1. **注册魅族账号**：在 [Flyme开放平台](https://open.flyme.cn) 上注册魅族开发者账号并完成开发者认证 ([详细流程](http://open-wiki.flyme.cn/index.php?title=%E6%96%B0%E6%89%8B%E6%8C%87%E5%8D%97))。
2. **创建魅族推送服务应用** ([详细流程](http://open-wiki.flyme.cn/index.php?title=%E9%AD%85%E6%97%8F%E6%8E%A8%E9%80%81%E5%B9%B3%E5%8F%B0%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C))。
3. **设置魅族的 AppId 及 AppSecret**：在 [魅族推送平台](http://push.meizu.com/) > **应用列表** > **打开应用** > **配置管理** 可以查到具体的魅族推送服务应用的 AppId 及 AppSecret。将此 AppId 及 AppSecret 通过 [LeanCloud 控制台][leancloud-console] > **消息** > **推送** > **设置** > **混合推送**，与 LeanCloud 应用关联。

#### 接入 SDK

首先导入 `avoscloud-mixpush` 包。修改 `build.gradle` 文件，在 **dependencies** 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:avoscloud-mixpush:{{ version.leancloud }}@aar')
    compile ('com.meizu.flyme.internet:push-internal:3.6.+@aar‘)
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

#### 具体使用

在 `AVOSCloud.initialize` 时调用 `AVMixpushManager.registerFlymePush(context, flymeId, flymeKey, profile)` 即可。参数 `profile` 的用法可以参考 [Android 混合推送多配置区分](push_guide.html#Android_混合推送多配置区分)。

注意，LeanCloud 云端只有在以下三个条件都满足的情况下，才会使用魅族推送。

- Flyme 系统
- manifest 正确填写
- flymeId、flymeKey 有效

#### 魅族推送通知栏消息的点击事件

当魅族通知栏消息被点击后，如果已经设置了 [自定义 Receiver](#自定义_Receiver)，则 SDK 会发送一个 action 为 `com.avos.avoscloud.flyme_notification_action` 的 broadcast。如有需要，开发者可以通过订阅此消息获取点击事件，否则 SDK 会默认打开 [启动推送服务](#启动推送服务) 对应设置的 Activity。


### 取消混合推送注册

对于已经注册了混合推送的用户，如果想取消混合推送的注册而改走 LeanCloud 自有的 WebSocket 的话，可以调用如下函数：

```java
AVMixpushManager.unRegisterMixPush();
```

此函数为异步函数，如果取消成功会有「Registration canceled successfully」的日志输出，万一取消注册失败的话会有类似「unRegisterMixPush error」的日志输出。

### 错误排查建议

- 只要注册时有条件不符合，SDK 会在日志中输出导致注册失败的原因，例如「register error, mainifest is incomplete」代表 manifest 未正确填写。如果注册成功，`_Installation` 表中的相关记录应该具有 **vendor** 这个字段并且不为空值。
- 查看魅族机型的设置，并打开「信任此应用」、「开机自启动」、「自启动管理」和「权限管理」等相关选项。
- 如果注册一直失败的话，请去论坛发帖，提供相关日志、具体机型以及系统版本号，我们会跟进协助来排查。

### GCM 推送（仅美国节点）

{{ docs.alert("GCM 推送仅支持部署在 LeanCloud 美国节点上的应用使用。") }}

GCM（Google Cloud Messaging）是 Google 提供的一项将推送通知消息发送到手机的服务。接入时后台不需要任何设置，GCM 相关的 token 由 LeanCloud SDK 来申请。

#### 环境要求

GCM 需要系统为 Android 2.2 及以上并且安装有 Google Play 商店的设备，或者使用了 GppgleAPIs 且系统为 Android 2.2 及以上的模拟器。具体要求详见 [Google Developers &middot; Set up a GCM Client App on Android](https://developers.google.com/cloud-messaging/android/client)。

#### 接入 SDK

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

