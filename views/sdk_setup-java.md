{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "Java" %}
{% set currentVersion = "5.0.12" %}

{% block language %}Java{% endblock %}

{% block init_with_app_keys %}
如果是一个普通 Java 项目，则在代码开头添加：

```java
AVOSCloud.initialize("{{appid}}", "{{appkey}}");
```

如果是一个 Android 项目，则向 `Application` 类的 `onCreate` 方法添加：

```java
import cn.leancloud.AVOSCloud;

public class MyLeanCloudApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // 提供 this、App Id 和 App Key 作为参数
        AVOSCloud.initialize(this, "{{appid}}", "{{appkey}}");
        AVOSCloud.setRegion(AVOSCloud.REGION.NorthAmerica);
    }
}
```

然后指定 SDK 需要的权限并在 `AndroidManifest.xml` 里面声明 `MyLeanCloudApp` 类：

```xml
<!-- 基本模块（必须）START -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<!-- 基本模块 END -->

<application
  …
  android:name=".MyLeanCloudApp" >

  <!-- 即时通讯和推送 START -->
  <!-- 即时通讯和推送都需要 PushService -->
  <service android:name="cn.leancloud.push.PushService"/>
  <receiver android:name="cn.leancloud.push.AVBroadcastReceiver">
    <intent-filter>
      <action android:name="android.intent.action.BOOT_COMPLETED"/>
      <action android:name="android.intent.action.USER_PRESENT"/>
      <action android:name="android.net.conn.CONNECTIVITY_CHANGE" />
    </intent-filter>
  </receiver>
  <!-- 即时通讯和推送 END -->

  <!-- 用户反馈 START -->
  <activity
     android:name="cn.leancloud.feedback.ThreadActivity" >
  </activity>
  <!-- 用户反馈 END -->
</application>
```
{% endblock %}

{% block save_a_hello_world %}
```java
AVObject testObject = new AVObject("TestObject");
testObject.put("words", "Hello World!");
testObject.saveInBackground().blockingSubscribe();
```
{% endblock %}

{% block libs_tool_automatic %}
可以用以下任意包管理工具来安装 SDK。

Maven：

```xml
<dependency>
    <groupId>cn.leancoud</groupId>
    <artifactId>storage-core</artifactId>
    <version>{{currentVersion}}</version>
</dependency>
```

Ivy：

```xml
<dependency org="cn.leancloud" name="storage-core" rev="{{currentVersion}}" />
```

SBT：

```sbt
libraryDependencies += "cn.leancloud" %% "storage-core" % "{{currentVersion}}"
```

Gradle：

```groovy
implementation 'cn.leancloud:storage-core:{{currentVersion}}'
```

如果是 Android 项目，则换成以下这些包：

```groovy
implementation 'cn.leancloud:storage-android:{{currentVersion}}'
implementation 'io.reactivex.rxjava2:rxandroid:2.1.0'
implementation 'com.alibaba:fastjson:1.1.70.android'
```
{% endblock %}
