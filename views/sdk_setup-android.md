{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "Android" %}
{% set maven_uri = "http://mvn.leancloud.cn/nexus/content/repositories/public" %}
{% import "views/_helper.njk" as docs %}
{% from "views/_data.njk" import libVersion as version %}
{% from "views/_data.njk" import androidSDKCompileInstructionLink as compileInstructionLink %}
{% block libs_tool_automatic %}

#### Gradle

Gradle 是 Google 官方推荐的构建 Android 程序的工具，使用 Android Studio 进行开发的时候，它会自动在新建的项目中包含一个自带的命令行工具 **gradlew**。我们推荐开发者使用这个自带的命令行工具，这是因为 Gradle 存在版本兼容的问题，很多开发者即使正确配置了 Gradle 脚本，但由于使用了最新版本或不兼容的 Gradle 版本而仍然无法成功加载依赖包。

##### Android Studio

使用 Android Studio 创建一个新的项目的时候，它的目录结构如下：

```
.
├── app                 // 应用源代码
    ├── ...
    ├── build.gradle    // 应用 Gradle 构建脚本
    ├── ...
├── build.gradle        // 项目 Gradle 构建脚本
├── YOUR-APP-NAME.iml   // YOUR-APP-NAME 为你的应用名称
├── gradle
└── settings.gradle
```

首先打开根目录下的 `build.gradle` 进行如下标准配置：

<pre><code>
buildscript {
    repositories {
        jcenter()
        //这里是 LeanCloud 的包仓库
        maven {
            url "{{maven_uri}}"
        }

    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.0.0'
    }
}

allprojects {
    repositories {
        jcenter()
        //这里是 LeanCloud 的包仓库
        maven {
            url "{{maven_uri}}"
        }
    }
}
</code></pre>

然后打开 `app` 目录下的 `build.gradle` 进行如下配置：

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

    // LeanCloud 统计包
    compile ('cn.leancloud.android:avoscloud-statistics:{{ version.leancloud }}')

    // LeanCloud 用户反馈包
    compile ('cn.leancloud.android:avoscloud-feedback:{{ version.leancloud }}@aar')

    // avoscloud-sns：LeanCloud 第三方登录包
    compile ('cn.leancloud.android:avoscloud-sns:{{ version.leancloud }}@aar')
    compile ('cn.leancloud.android:qq-sdk:1.6.1-leancloud')
    // 新浪微博 SDK
    compile('com.sina.weibo.sdk:core:4.1.4:openDefaultRelease@aar')

    // LeanCloud 应用内搜索包
    compile ('cn.leancloud.android:avoscloud-search:{{ version.leancloud }}@aar')
}
```

我们已经提供了官方的 [maven 仓库](http://mvn.leancloud.cn/nexus/)，推荐大家使用。

#### Eclipse

Eclipse 用户首先 [下载 SDK](sdk_down.html)，然后按照 [手动安装步骤](#手动安装) 将 SDK 导入到项目里。
{% endblock %}

{% block import_sdk %}
对照以下包文件及其对应的功能模块，开发者可以自行 {{ compileInstructionLink("编译源代码") }} 来得到所需的包文件。

```
├── avoscloud-feedback-{{ version.leancloud }}.zip     // LeanCloud 用户反馈模块
├── avoscloud-push-{{ version.leancloud }}.jar         // LeanCloud 推送模块和即时通讯模块
├── avoscloud-sdk-{{ version.leancloud }}.jar          // LeanCloud 基本存储模块
├── avoscloud-search-{{ version.leancloud }}.zip       // LeanCloud 应用内搜索模块
├── avoscloud-sns-{{ version.leancloud }}.zip          // LeanCloud SNS 模块
├── avoscloud-statistics-{{ version.leancloud }}.jar   // LeanCloud 统计模块
├── fastjson-{{ version.fastjson }}.jar                         // LeanCloud 基本存储模块
├── Java-WebSocket-1.3.2-leancloud.jar          // LeanCloud 推送模块和即时通讯模块
├── protobuf-java-3.4.0.jar                     // LeanCloud 推送模块和即时通讯模块
├── okhttp-{{ version.okhttp }}.jar                            // LeanCloud 基本存储模块
├── okio-{{ version.okio }}.jar                             // LeanCloud 基本存储模块
├── qq.sdk.1.6.1.jar                            // LeanCloud SNS 模块
└── weibo.sdk.android.sso.3.0.1-leancloud.jar   // LeanCloud SNS 模块
```

##### LeanCloud 基本存储模块

* `avoscloud-{{ version.leancloud }}.jar`
* `okhttp-{{ version.okhttp }}.jar`
* `okio-{{ version.okio }}.jar`
* `fastjson-{{ version.fastjson }}.jar`

##### LeanCloud 推送模块和即时通讯模块

* LeanCloud 基础存储模块
* `avospush-{{ version.leancloud }}.jar`
* `Java-WebSocket-1.3.2-leancloud.jar`
* `protobuf-java-3.4.0.jar`

##### LeanCloud 统计模块

* LeanCloud 基础存储模块
* `avosstatistics-{{ version.leancloud }}.jar`

##### LeanCloud SNS 模块

* LeanCloud 基础存储模块
* `weibo.sdk.android.sso.jar`
* `qq.sdk.1.6.1.jar`

我们提供的下载包里包含了必须的依赖库，自己下载官方库也可以，不过请确保版本一致。

**注意：如果需要使用美国站点，并且 SDK 版本是 3.3 及以上，则不需要引入 SSL 证书。其他低版本的用户，需要下载 [SSL 证书](https://download.leancloud.cn/sdk/android/current/avoscloud_us_ssl.bks)，将其拷贝到项目的 `res/raw/` 之下。**

#### Android Studio

首先本地已经下载好了项目需要的 SDK 包，然后按照以下步骤导入：

1. 打开 **File** > **Project Structure** > **Modules** 对话框，点击 **Dependencies**；
2. 点击下方的 **+**（加号），选择要导入的 SDK 包（xxxx.jar），记得 **Scope** 选为 **Compile**；
3. 重复第 2 步，直到所有需要的包均已正确导入。

Eclipse 的导入与一般的 jar 导入无本质区别，因此不再赘述。

{% endblock %}

{% block init_with_app_keys %}

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
将上述代码中的 App ID 以及 App Key 替换成从控制台复制粘贴的对应的数据即可。

然后打开 `AndroidManifest.xml` 文件来配置 SDK 所需要的手机的访问权限以及声明刚才我们创建的 `MyLeanCloudApp` 类：

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

{% endblock %}

{% block sdk_switching_node %}
```java
public class MyLeanCloudApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        // 启用北美节点, 需要在 initialize 之前调用
        AVOSCloud.useAVCloudUS();

        // 初始化参数依次为 this, AppId, AppKey
        AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
    }
}
```
{% endblock %}

{% block save_a_hello_world %}
在 `MainActivity.java` 中的 `onCreate` 方法添加如下代码：

```java
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ...
        // 测试 SDK 是否正常工作的代码
        AVObject testObject = new AVObject("TestObject");
        testObject.put("words","Hello World!");
        testObject.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if(e == null){
                    Log.d("saved","success!");
                }
            }
        });

        ...

    }
```

然后，点击 `Run` 运行调试，真机和虚拟机均可。
{% endblock %}

{% block permission_access_network_config %}{% endblock %}

{% block platform_specific_faq %}{% endblock %}

{% block android_mutildex_issue %}
### 运行中遇到 `NoClassDefFoundError` 异常
一般来说遇到这个问题只有两种可能：
第一种是 Android SDK 的间接依赖并没有能全部下载导致的，可以通过在 gradle 配置中显式指定 `transitive=true` 来解决这个问题:


```

dependencies {
    compile 'com.android.support:multidex:'
    compile 'com.android.support:support-v4:21.0.3'
    compile 'cn.leancloud.android:avoscloud-sdk:v3.+'
    compile('cn.leancloud.android:avoscloud-push:v3.+@aar') { transitive = true }
}


```

第二种情况则是由在 v3.13.+ 以后 Android SDK 引入了 Google ProtoBuf 来提高即时通讯模块的传输效率，随之而来的是类和方法数量的激增,超过了 Android 上存在着方法总数不能超过 65k 的上限而导致的。这个时候我们可以采用 Google 提出的[解决方案](http://developer.android.com/intl/zh-cn/tools/building/multidex.html#about)来解决这个问题。

{% endblock%}
