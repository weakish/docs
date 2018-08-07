#### 自动安装

通过 [CocoaPods](http://www.cocoapods.org) 安装可以最大化地简化安装过程。

首先，在项目根目录下的 Podfile 文件中添加以下 pods：

```ruby
pod 'AVOSCloud'               # 数据存储、短信、云引擎调用等基础服务模块
pod 'AVOSCloudIM'             # 即时通讯模块
pod 'AVOSCloudCrashReporting' # 错误报告模块
```

<div class="callout callout-info">注意：从版本 v3.4.0 开始，不再根据平台区分 pod 名称。同一个模块在所有平台上的 pod 名称是一样的。CocoaPods 会根据 Podfile 中的 platform 信息安装相应的源文件。旧的 pod（带有平台后缀的 pod，例如 AVOSCloud-watchOS、AVOSCloudIM-OSX 等）不再更新。如果要更新到 v3.4.0 及以后的版本，请将 pod 的平台后缀去掉。</div>

然后在项目根目录执行 `pod install` 命令，执行成功后，SDK 就集成到项目中了。


#### 手动安装

##### 下载源码

首先，SDK 仓库 clone 到您的项目根目录：

```sh
git clone "https://github.com/leancloud/objc-sdk.git" leancloud-objc-sdk
```

然后 checkout 版本。SDK 的版本号是通过 tag 标记的，可以使用以下命令 checkout 最新版：

```sh
cd leancloud-objc-sdk

git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
```

如果您希望使用 CrashReporting 模块，还需要进一步 clone submodule：

```sh
git submodule update --init
```

##### 集成 SDK

接下来，需要把 SDK 集成到您的项目中。集成的方式有两个选择：

1. 将 SDK 的 xcodeproj 直接添加到您的项目中；
2. 先将 SDK 编译成 framework，再将编译好的 framework 添加到您的项目中。

**注意：两个方法任选一种即可。**

###### 集成 xcodeproj

将 `AVOS/AVOS.xcodeproj` 项目文件拖进您的项目，作为 subproject。就像下面这样：

![img](images/quick_start/ios/subproject.png)

接着，为您的应用设置 Build Phases。添加 Link Binary With Libraries：

![img](images/quick_start/ios/link-binary.png)

注意，作为示例，上图选择了两个支持 iOS 平台的 frameworks（AVOSCloud 与 AVOSCloudIM 模块）。实际情况下，您应该根据应用支持的平台以及需要用到的服务来进行选择。

###### 编译 framework

如果您不希望集成 xcodeproj，也可以先把 SDK 编译成 framework。我们提供了一键编译脚本来完成这个工作。

在 SDK 的根目录执行以下命令进行一键编译：

```sh
ruby build-frameworks.rb
```

待命令执行完毕，就可以在 AVOS/AVOS.xcodeproj/build 目录下找到编译好的 frameworks。

注意，为了区分平台，frameworks 添加了平台后缀，例如 AVOSCloud-iOS.framework。您需要先将平台后缀删掉后，再添加到的项目中，否则会产生编译错误。

##### 添加系统依赖

然后添加 SDK 依赖的系统 framework 和 library：

  * libz
  * libc++
  * libicucore
  * libsqlite3
  * SystemConfiguration.framework
  * MobileCoreServices.framework
  * CoreTelephony.framework
  * CoreLocation.framework

就像下面这样：

![img](images/quick_start/ios/system-dependency.png)

最后，在 Other Linker Flags 中添加 `-ObjC`。

这样就集成完毕了。


#### 初始化 SDK

打开 AppDelegate 文件，导入基础模块：

```objc
#import <AVOSCloud/AVOSCloud.h>
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions:` 方法中：

```objc
// 如果使用美国站点，请加上下面这行代码：
// [AVOSCloud setServiceRegion:AVServiceRegionUS];

[AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
```

如果想跟踪统计应用的打开情况，后面还可以添加下列代码：

```objc
[AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
```

{% if node=='qcloud' %}
创建应用后，可以在 `控制台 > 应用设置` 里面找到应用对应的 id 和 key。
{% else %}
创建应用后，可以在 [控制台 > 应用设置](/app.html?appid={{appid}}#/key) 里面找到应用对应的 id 和 key。
{% endif %}

保证在你的源文件里包含了 SDK 库文件：

```objc
#import <AVOSCloud/AVOSCloud.h>
```

将下面的代码拷贝到你的 app 里，比如在 `viewDidLoad` 方法（或者其他在运行 app 时会调用到的方法）：

```
AVObject *testObject = [AVObject objectWithClassName:@"TestObject"];
[testObject setObject:@"bar" forKey:@"foo"];
[testObject save];
```

{% if node=='qcloud' %}
运行 app，一个类名为 `TestObject` 的新对象会被发送到 LeanCloud 并保存下来。当做完这一切，访问 `控制台 > 数据管理` 可以看到上面创建的 TestObject 的相关数据。
{% else %}
运行 app，一个类名为 `TestObject` 的新对象会被发送到 LeanCloud 并保存下来。当做完这一切，访问 [控制台 > 数据管理](/data.html?appid={{appid}}#/TestObject) 可以看到上面创建的 TestObject 的相关数据。
{% endif %}


#### 社交组件

最后，如果希望使用社交组件功能，可以使用我们的开源组件：[leancloud-social-ios](https://github.com/leancloud/leancloud-social-ios)。
