{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as include %}
# Objective-C SDK 安装指南

## 自动安装

通过 [CocoaPods](http://www.cocoapods.org) 安装可以最大化地简化安装过程。

首先，在项目根目录下的 `Podfile` 文件中添加以下 pods：

```ruby
pod 'AVOSCloud'               # 数据存储、短信、云引擎调用等基础服务模块
pod 'AVOSCloudIM'             # 实时通信模块
```

{% call docs.noteWrap() %}
从 v3.4.0 开始，不再根据平台区分 pod 名称。同一个模块在所有平台上的 pod 名称相同。CocoaPods 会根据 Podfile 中的 platform 信息安装相应的源文件。带有平台后缀的旧的 pod，例如 AVOSCloud-watchOS、AVOSCloudIM-OSX 等不再更新。如果要更新到 v3.4.0 及以后的版本，请将 pod 的平台后缀去掉。
{% endcall %}

然后在项目根目录执行 `pod install` 命令，执行成功后，SDK 就集成到项目中了。


## 手动安装

### 下载源码

首先将 SDK 仓库 clone 到项目根目录：

```sh
git clone "https://github.com/leancloud/objc-sdk.git" leancloud-objc-sdk
```

然后 checkout 版本。SDK 的版本号是通过 tag 标记的，可以使用以下命令 checkout 最新版本：

```sh
cd leancloud-objc-sdk

git checkout $(git describe --tags $(git rev-list --tags --max-count=1))
```

### 集成 SDK

将 SDK 集成到到项目中有以下两种方式，**任选一种即可**：

- 将 SDK 的 `xcodeproj` 文件直接添加到项目中。
- 将 SDK 编译成 framework 再添加到项目中。


#### 集成 xcodeproj

将 `AVOS/AVOS.xcodeproj` 项目文件拖入项目，作为 subproject：

![img](images/quick_start/ios/subproject.png)

接着为该项目设置 Build Phases，添加 **Link Binary With Libraries**：

![img](images/quick_start/ios/link-binary.png)

上图选择了支持 iOS 平台的 AVOSCloud 与 AVOSCloudIM 两个 frameworks 用来举例。请根据实际需要来选择支持的平台以及要使用的模块。

#### 编译 framework

我们提供了一键编译脚本将 SDK 编译成 framework，在 SDK 所在的根目录执行：

```sh
ruby build-framework.rb
```

待命令执行完毕，在 `AVOS/AVOS.xcodeproj/build` 目录下找到编译好的 framework 文件。

{{ docs.alert("为了区分平台，frameworks 添加了平台后缀，例如 `AVOSCloud-iOS.framework`。请<u>先删掉平台后缀</u>再将其加入项目，否则会产生编译错误。") }}

### 添加系统依赖

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

最后在 **Other Linker Flags** 中添加 `-ObjC`。

这样就集成完毕了。


## 初始化 SDK

打开 AppDelegate 文件，导入基础模块：

```objc
#import <AVOSCloud/AVOSCloud.h>
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions:` 方法中：

```objc
{% if node != 'qcloud' %}// 使用美国站点需要增加以下代码：
// [AVOSCloud setServiceRegion:AVServiceRegionUS];{% endif %}

[AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
```

如果想跟踪统计应用的打开情况，后面还可以添加下列代码：

```objc
[AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
```

创建应用后，可以在 {% if node=='qcloud' %}**控制台 > 应用设置 > 应用 Key**{% else %}[控制台 > 应用设置 > 应用 Key](/app.html?appid={{appid}}#/key){% endif %} 中找到应用对应的 id 和 key。

确保项目源文件中包含了 SDK 库文件：

```objc
#import <AVOSCloud/AVOSCloud.h>
```

下面来试着向 LeanCloud 云端保存一条数据，将下面的代码拷贝到 `viewDidLoad` 方法或其他在应用运行时会被调用的方法中：

```
AVObject *testObject = [AVObject objectWithClassName:@"TestObject"];
[testObject setObject:@"bar" forKey:@"foo"];
[testObject save];
```

运行 App，一个类名为 `TestObject` 的新对象会被发送到 LeanCloud 并保存下来。当做完这一切，访问 {% if node=='qcloud' %}**控制台 > 存储 > 数据**{% else %}[控制台 > 存储 > 数据](/data.html?appid={{appid}}#/TestObject) 可以看到上面创建的 TestObject 的相关数据。
{% endif %}

{{ include.debuglog('objc') }}

## 查看服务器返回的错误

某个请求出错，SDK 会返回错误信息。可以使用 kLeanCloudRESTAPIResponseError 来获取服务器返回的错误信息。例如 User 表中已经存在一个叫 Tom 的用户，再次注册用户名为 Tom 会报错「用户已经存在」。

```
 AVUser *user = [AVUser user];
    user.username = @"Tom";
    user.password =  @"cat!@#123";
    [user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    	// 获取 RESTAPI 返回的错误信息详情
        if (error) {
          id responseError = error.userInfo[kLeanCloudRESTAPIResponseError];
        }
 }];
```

服务器返回的错误信息一般来说是 JSON 格式，如下：

```
responseError = {
        code = 202;
        error = "Username has already been taken.";
    }
```

## 社交组件

如果需要使用社交组件功能，可以使用我们的开源组件：[leancloud-social-ios](https://github.com/leancloud/leancloud-social-ios)。
