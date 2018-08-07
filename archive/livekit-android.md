{% set git_link = "https://github.com/leancloud/LeanCloudLiveKit-Android.git" %}
{% set maven_uri = "http://mvn.leancloud.cn/nexus/content/repositories/public" %}
# LiveKit 使用指南 &middot; Android

> 如果需要了解 iOS 版本请点击: [LiveKit 使用指南 &middot; iOS](livekit-ios.html)

[LiveKit]({{git_link}}) 是由 LeanCloud 官方推出的基于 LeanCloud 即时通讯与七牛直播服务的 UI 套件，它包含直播、文字聊天、弹幕、送礼物等界面。

针对直播服务，LeanCloud 只按照 [聊天的费用标准](/pricing) 收费，而直播相关的内容，LeanCloud 并不参与收费，其产生的费用请在七牛账户中查询。

<div class="row" style="margin-bottom:1.5em;">
  <div class="col-sm-6">
    <p><strong>登录页面</strong></p>
    <img src="images/live_kit_android_login.jpg" class="img-responsive">
  </div>
  <div class="col-sm-6">
    <p><strong>直播间页面</strong></p>
    <img src="images/live_kit_android_liveroom.jpg" class="img-responsive">
  </div>
</div>
<div class="row" style="margin-bottom:1.5em;">
  <div class="col-sm-6">
    <p><strong>礼物列表</strong></p>
    <img src="images/live_kit_android_gift.jpg" class="img-responsive">
  </div>
  <div class="col-sm-6">
    <p><strong>发送弹幕</strong></p>
    <img src="images/live_kit_android_barrage.jpg" class="img-responsive">
  </div>
</div>

## 准备工作

1. 注册 [七牛开发者账号](http://developer.qiniu.com/) 并且详细阅读七牛直播云服务。 
1. 了解 [LeanCloud 聊天服务](realtime_v2.html) 的概念以及功能。

### 七牛设置

1. 按照 [七牛控制台设置](http://developer.qiniu.com/article/pili/user-guide.html#bucket-create) 进行设置。
1. 部署自己的服务器端，具体可以参考 [七牛服务端 SDK](https://developer.qiniu.com/pili/sdk/1220/server-sdk)。

## 获取项目

```bash
git clone {{git_link}}
```

## 运行 Demo

本项目包含两个模块：
- **leancloudlivekit**<br/>
  封装了 LeanCloud 直播聊天套件的 UI lib，其目的是让开发者更快速地接入直播与聊天等功能。
- **livekitapplication**<br/>
  为 Demo 项目，它是一个简单的示例项目，用来指导开发者如何使用 leancloudlivekit。

## 导入方式

开发者可以将 LiveKit 导入到自己的 Project 中使用。新建一个名为 **LiveDemo** 的 Project  用以导入 LiveKit。导入方式有三种：
- [通过 Gradle 导入](#Gradle_导入)
- [通过源代码导入](#源代码导入)
- 通过 Jar 包导入<span class="text-muted">（因为通过 Jar 包导入仍然要拷贝资源文件，所以这里不推荐此种方式。）</span>

### Gradle 导入

打开根目录下的 `build.gradle`，按如下配置修改 **allprojects**：

```
allprojects {
    repositories {
        jcenter()
        maven {
            url "{{maven_uri}}"
        }
    }
}
```

打开 `app/build.gradle`，在 **dependencies** 中添加依赖：

```
dependencies {
    compile ('cn.leancloud.android:livekit:1.0.0')
}
```

### 源代码导入

<div class="callout callout-info">如果是通过 Gradle 导入则不需要以下步骤。</div>

1. 浏览器访问 <{{git_link}}>；
1. 执行以下命令行，将项目 clone 到本地（如 `LiveKit` 文件夹中，或者直接下载 zip 包自行解压缩到此文件夹下）；
    ```bash
    git clone {{git_link}}
    ```
1. 将文件夹 `leancloudlivekit` 复制到 `LiveDemo` 根目录；
1. 修改 `LiveDemo/settings.gradle` 加入 `include ':leancloudlivekit'`；
1. 修改 `LiveDemo/app/build.gradle`，在 **dependencies** 中添加 `compile project(":leancloudlivekit")`。

最后只要 Sync Project，这样 LiveKit 就算是导入到项目中了。

## 自定义使用

### 自定义 Application

**一、实现自己的 Application**

LiveKit 在使用之前需要进行初始化。初始化逻辑应该放在 `Application.onCreate` 方法中实现。
在 LiveDemo 中新建一个 Class，名字叫做 **LCLKApplication**，让它继承自 Application 类，代码如下：

```java
public class LCLKApplication extends Application {

// appId、appKey 可以在「LeanCloud 应用控制台 > 设置 > 应用 Key」中获取
  private final String APP_ID  = "********";
  private final String APP_KEY = "********";

  @Override
  public void onCreate() {
    super.onCreate();
    
    // 关于 LCLKAppProvider 请参看下边的文档
    LCLiveKit.getInstance().setProfileProvider(LCLKAppProvider.getInstance());
    LCLiveKit.getInstance().init(getApplicationContext(), APP_ID, APP_KEY);
  }
}
```

**二、在 `AndroidMainfest.xml` 中配置 `LCLKApplication`**

```xml
<application
  ...
  android:name=".LCLKApplication" >
  ...
</application>
```

### 自定义用户体系

为了保证通用性和扩展性，让开发者可以更容易将直播与聊天功能嵌入到自己的应用中，该类的具体作用可以参考 [用户信息管理类](#用户信息管理类)，具体在 livekitapplication Demo 中的示例代码如下：

```
public class LCLKAppProvider implements LCLiveKitProvider {

  private static LCLKAppProvider customUserProvider;

  public synchronized static LCLKAppProvider getInstance() {
    if (null == customUserProvider) {
      customUserProvider = new LCLKAppProvider();
    }
    return customUserProvider;
  }

  private LCLKAppProvider() {
  }

  private static List<LCLKUser> partUsers = new ArrayList<LCLKUser>();

  // 此数据均为模拟数据，仅供参考
  static {
    partUsers.add(new LCLKUser("Tom", "Tom", "http://www.avatarsdb.com/avatars/tom_and_jerry2.jpg"));
    partUsers.add(new LCLKUser("Jerry", "Jerry", "http://www.avatarsdb.com/avatars/jerry.jpg"));
    partUsers.add(new LCLKUser("Harry", "Harry", "http://www.avatarsdb.com/avatars/young_harry.jpg"));
    partUsers.add(new LCLKUser("William", "William", "http://www.avatarsdb.com/avatars/william_shakespeare.jpg"));
    partUsers.add(new LCLKUser("Bob", "Bob", "http://www.avatarsdb.com/avatars/bath_bob.jpg"));
  }


  @Override
  public void fetchProfiles(List<String> userIdList, AVCallback<List<LCLKUser>> profilesCallBack) {
    List<LCLKUser> userList = new ArrayList<LCLKUser>();
    for (String userId : userIdList) {
      for (LCLKUser user : partUsers) {
        if (user.getUserId().equals(userId)) {
          userList.add(user);
          break;
        }
      }
    }
    profilesCallBack.internalDone(userList, null);
  }

  @Override
  public void fetchRecordStream(String liveId, AVCallback<String> streamCallback) {
    streamCallback.internalDone(null, null);
  }

  @Override
  public void fetchPlayStream(String liveId, AVCallback<String> streamCallback) {
    streamCallback.internalDone("rtmp://live.hkstv.hk.lxdns.com/live/hks", null);
  }
}
```

### 打开即时通讯

```
LCLiveKit.getInstance().open(clientId, new AVIMClientCallback() {
      @Override
      public void done(AVIMClient avimClient, AVIMException e) {
        if (null == e) {
        ...
        }
      }
    });
```

### 进入直播观看页面

具体内容可以参看 [直播观看页面](#直播观看页面)，需要传入参数 `LCLKConstants.LIVE_ID`，代码如下：

```
Intent intent = new Intent(this, LCLKPlayActivity.class);
intent.putExtra(LCLKConstants.LIVE_ID, liveId);
startActivity(intent);
```

### 进入直播录制页面

具体内容可以参看 [直播录制页面](#直播录制页面)，需要传入参数 `LCLKConstants.LIVE_ID`，代码如下：

```
Intent intent = new Intent(this, LCLKRecordActivity.class);
intent.putExtra(LCLKConstants.LIVE_ID, liveId);
startActivity(intent);
```


## 接口以及组件

### LiveId

为了方便用户使用，LiveKit 抽象出了 LiveId 的概念，即直播间 Id，开发者可以按照自己的需求定义此 Id 的格式，只要保证每个直播间的 Id 唯一即可。LiveKit 根据 `LCLiveKitProvider` 的 `fetchRecordStream`、`fetchPlayStream` 来获取直播流。

### 用户

`LCLKUser` 是 LiveKit 封装的参与聊天的用户，它提供如下属性：

| 属性          | 说明                                       |
| ----------- | ---------------------------------------- |
| `userId`    | 用户在单个应用内唯一的 ID，也是调用 `LCLiveKit.open` 时传入的 userId。 |
| `avatarUrl` | 用户头像的 URL                                |
| `name`      | 用户名                                      |


### 用户信息管理类

`LCLiveKitProvider` 主要包含三个函数：
- [`fetchProfiles`](#fetchProfiles)
- [`fetchRecordStream`](#fetchRecordStream)
- [`fetchPlayStream`](#fetchPlayStream)

#### `fetchProfiles`

用来展示用户相关的信息。为了保证通用性和扩展性，让开发者可以更容易将聊天界面嵌入自己的应用中，LiveKit 在设计上抽象出一个「用户体系」接口，LiveKit 内部使用到的头像、用户名等都封装到了 [`LCLKUser`](#用户) 中。LiveKit 会根据需要通过 `fetchProfiles` 来获取这些信息，所以需要开发者实现此函数来接入自己的用户体系。

#### `fetchRecordStream`

用来获得推流地址，以使 LiveKit 可以上传直播流。关于播放地址的获取可以参考 [七牛设置](#七牛设置)。

#### `fetchPlayStream`

用来获取直播地址，以使 LiveKit 观看直播。关于直播地址的获取可以参考 [七牛设置](#七牛设置)。示例代码可以参看 [自定义用户体系](#自定义用户体系)。

### 核心类 

`LCLiveKit` 是 LiveKit 的核心类，包含几个主要函数：

<dl>
<dt>`public void init(Context context, String appId, String appKey)`</dt>
<dd>此函数用于初始化 LiveKit 的相关设置，此函数要在 Application 的 `onCreate` 中调用，否则可能会引起异常。</dd>
<dt>`public void setProfileProvider(LCLiveKitProvider profileProvider)`</dt>
<dd>此函数用于设置用户体系与直播流地址。</dd>
<dt>`public void open(final String userId, final AVIMClientCallback callback)`</dt>
<dd>此函数用于开始即时通讯，open 成功后可以执行自己的逻辑，或者跳转到直播等页面。</dd>
</dl>

### 直播录制页面

`LCLKRecordActivity` 为直播录制的页面，主要包含两个 Fragment：

- `LCLKIMFragment` 负责其中的即时通讯部分，包含聊天、弹幕、礼物等。
- `LCLKRecordFragment` 负责直播的展示与推流等。

参数 `LCLKConstants.LIVE_ID`，可以参考 [LiveId](#LiveId)。`LCLKRecordActivity` 在录制时会通过 [`fetchRecordStream`](#fetchRecordStream) 来获取推流地址。

### 直播观看页面

`LCLKPlayActivity` 为直播的播放页面，同样包含两个 Fragment:

- `LCLKIMFragment` 负责其中的即时通讯部分，包含聊天、弹幕、礼物等。
- `LCLKPlayFragment` 负责直播的播放。

参数 `LCLKConstants.LIVE_ID`，可以参考 [LiveId](#LiveId)。`LCLKPlayActivity` 在播放时会通过 [`fetchPlayStream`](#fetchPlayStream) 来获取推流地址。
