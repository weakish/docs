{% from "views/_data.njk" import libVersion as version %}
{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as include %}

{{ include.setService('push') }}

# Android 消息推送开发指南

请先阅读 [消息推送概览](push_guide.html) 了解相关概念。

Android 消息推送有专门的 Demo，请见 [Android-Push-Demo](https://github.com/leancloud/android-push-demo) 项目。

## 消息推送流程简介

Android 的消息推送主要依赖客户端的 PushService 服务。PushService 是一个独立于应用程序的进程，在应用程序第一次启动时被顺带创建，其后则（尽量）一直存活于后台，它主要负责维持与 LeanCloud 推送服务器的 WebSocket 长链接。
所以，只要 PushService 存活，那么 LeanCloud 推送服务器上有任何需要下发到当前设备的消息，都会立刻推送下来；如果 PushService 被杀死，那推送通道中断，Android 设备就收不到任何推送消息（混合推送除外，后述会有说明）。PushService 第一次启动，建立起与 LeanCloud 推送服务器的 WebSocket 长链接之后，也会一次性收到多条服务端缓存的未成功下发的历史消息。


## 接入推送服务

要接入推送服务，需要依赖 avoscloud-sdk 和 avoscloud-push 两个 library。首先打开 `app` 目录下的 `build.gradle` 进行如下配置：

```
android {
    //为了解决部分第三方库重复打包了META-INF的问题
    packagingOptions{
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE.txt'
    }
    lintOptions {
        abortOnError false
    }
}

dependencies {
    compile ('com.android.support:support-v4:21.0.3')

    // LeanCloud 基础包
    compile ('cn.leancloud.android:avoscloud-sdk:{{ version.leancloud }}')

    // 推送与即时通讯需要的包
    compile ('cn.leancloud.android:avoscloud-push:{{ version.leancloud }}@aar'){transitive = true}
}
```

然后新建一个 Java Class ，名字叫做 **MyLeanCloudApp**,让它继承自 **Application** 类，实例代码如下:

```java
public class MyLeanCloudApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        // 初始化参数依次为 this, AppId, AppKey
        AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
    }
}
```

### 配置 AndroidManifest

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

#### 推送唤醒

如果希望支持应用间的推送唤醒机制，即在同一设备上有两个使用了 LeanCloud 推送的应用，应用 A 被杀掉后，当应用 B 被唤醒时可以同时唤醒应用 A 的推送，可以这样配置：

```xml
<service android:name="com.avos.avoscloud.PushService" android:exported="true"/>
```

#### 完整的 `AndroidManifest.xml`
完整的 `AndroidManifest.xml` 文件配置示意如下：

```xml
<!-- 基础模块（必须加入以下声明）START -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<!-- 基础模块 END -->

<application
  ...
  android:name=".MyLeanCloudApp" >

  <!-- 即时通讯模块、推送（均需要加入以下声明） START -->
  <!-- 即时通讯模块、推送都要使用 PushService -->
  <service android:name="com.avos.avoscloud.PushService"/>
  <receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
    <intent-filter>
      <action android:name="android.intent.action.BOOT_COMPLETED"/>
      <action android:name="android.intent.action.USER_PRESENT"/>
      <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
    </intent-filter>
  </receiver>
  <!-- 即时通讯模块、推送 END -->

  <!-- 反馈组件（需要加入以下声明）START -->
  <activity
     android:name="com.avos.avoscloud.feedback.ThreadActivity" >
  </activity>
  <!-- 反馈组件 END -->
</application>
```


### 保存 Installation

当应用在用户设备上安装好以后，如果要使用消息推送功能，LeanCloud SDK 会自动生成一个 Installation 对象。该对象本质上是应用在设备上生成的安装信息，也包含了推送所需要的所有数据，因此要使用它来进行消息推送。

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

### 启动推送服务

通过调用以下代码启动推送服务，同时设置默认打开的 Activity。

```java
// 设置默认打开的 Activity
PushService.setDefaultPushCallback(this, PushDemo.class);
```

### 订阅频道

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

### Android 8.0 推送适配

在调用 `AVOSCloud.initialize` 之后，需要调用 `PushService.setDefaultChannelId(context, channelid)` 设置通知展示的默认 `channel`，否则消息无法展示。Channel ID 的解释请阅读 Google 官方文档 [Creating a notification](https://developer.android.com/training/notify-user/channels.html)。


## 推送消息


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

## 深入阅读：如何响应推送消息

### 消息格式
具体的消息格式，可参考：[推送消息](push_guide.html#推送消息)。
对于 Android 设备，默认的消息内容参数支持下列属性：
```
{
  "alert":      "消息内容",
  "title":      "显示在通知栏的标题",
  "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换",
  "silent":     true/false              // 用于控制是否关闭推送通知栏提醒，默认为 false，即不关闭通知栏提醒
  "action":     "com.your_company.push" // 在使用自定义 receiver 时必须提供
}
```
上面 silent 属性，是透传消息与通知栏消息的标志。silent 为 true，表示消息不展示在通知栏；silent 为 false，表示消息会展示在通知栏。

前面讲过，在 PushService 里面接收到推送消息之后，在转发消息之前，会判断消息是否过期，以及是否收到了重复的消息，只有非过期、非重复的消息，才会会通过发送本地通知或者广播，将事件告知应用程序。

### 通知栏消息如何响应用户点击事件

PushService 在发出通知栏消息的时候，会根据开发者调用 `PushService.setDefaultPushCallback(context, clazz)` 或者 `PushService.subscribe(context, "channel", clazz)` 设置的回调类，设置通知栏的响应类。

在回调类的 onCreate 函数中开发者则可以通过如下代码获取推送消息的具体数据：
```
public class CallbackActivity extends Activity {
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.callback2);

        // 获取推送消息数据
        String message = this.getIntent().getStringExtra("com.avoscloud.Data");
        String channel = this.getIntent().getStringExtra("com.avoscloud.Channel");
        System.out.println("message=" + message + ", channel=" + channel);
    }
}
```

### 自定义 Receiver

如果你想推送消息，但不显示在 Android 系统的通知栏中，而是执行应用程序预定义的逻辑，你需要在你的 Android 项目中的 `AndroidManifest.xml` 中声明你自己的 Receiver：

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

其中 `com.avos.avoscloud.PushDemo.MyCustomReceiver` 是你的 Android 的 Receiver 类。而 `<action android:name="com.avos.UPDATE_STATUS" />` 需要与 push 的 data 中指定的 `action` 相对应。

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


## 混合推送

自 Android 8.0 之后，系统权限控制越来越严，第三方推送通道的生命周期受到较大限制，同时国内主流厂商也开始推出自己独立的推送服务。因此我们提供「混合推送」的方案来提升推送到达率，具体请参考 [混合推送开发指南](android_mixpush_guide.html)。
