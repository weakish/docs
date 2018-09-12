{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as include %}
# 第三方平台账号登录组件（SNS）开发指南

AVOSCloudSNS 是一个非常轻量的模块, 可以用最少一行代码就可以实现社交平台用户登录.

## iOS SNS 组件

我们已经开源了 SNS 组件，把它放在了 Github 的 [leancloud-social-ios](https://github.com/leancloud/leancloud-social-ios) 项目上。该项目的 LeanCloudSocialDemo 目录下有写好的 Demo。

### 升级指南

从 3.1.3 开始，我们已不再维护 AVOSCloudSNS.framework，而改为维护开源的 **LeanCloudSocial.framework**。升级也特别容易，将 `pod 'AVOSCloudSNS'` 改为 `pod 'LeanCloudSocial'`，然后全局替换一下 `<AVOSCloudSNS/` 为 `<LeanCloudSocial/` 即可。接口都没有更改。LeanCloudSocial 需要的基础库的版本是 3.1，如果你的主项目还在使用 3.1 以下的版本，推荐更新到最新的 3.1 以上的版本。

### 导入 SDK

你可以通过 CocoaPods 引入 SDK，在 Podfile 中加入：

```ruby
pod 'LeanCloudSocial'  # 静态库方式引入，依赖 AVOSCloud 库
```

你也可以在开源项目上编译该组件加入到项目中，在根目录下执行 `./build-framework.sh` 即可。或者直接拖动源代码到项目中，源代码在 Classes 目录。

### SSO 授权

利用 SSO，可以使用户不用输入用户名密码等复杂操作，一键登录。目前 LeanCloudSocial 支持如下平台：

- 新浪微博
- 手机 QQ
- 微信

并且不需要使用各个平台官方的 SDK，保证你的应用体积的最小化。

#### 配置平台账号

在 [应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns) 配置相应平台的 **应用 ID** 和 **应用 Secret Key** 。点击保存，自动生成 **回调 URL** 和 **登录 URL**。

微博开放平台需要单独配置 **回调 URL**。 在微博开放平台的 **应用信息** > **高级信息** > **OAuth2.0 授权设置** 里的「授权回调页」中绑定生成的 **回调 URL**。

测试阶段，在微博开放平台的 **应用信息** > **测试信息** 添加微博账号，在腾讯开放平台的 **QQ 登录** > **应用调试者** 里添加 QQ 账号即可。在应用通过审核后，可以获取公开的第三方登录能力。

#### 配置 URL Schemes

添加下列 URL Schemes:

- 微博的 URL Schemes：`sinaweibosso.<AppKey>`（注意中间有个点儿）
- QQ 的 URL Schemes：`tencent<AppId>`
- 微信的 URL Schemes：`<AppId>`

将 `<AppKey>` 替换为微博开放平台应用的 AppKey，如 `sinaweibosso.5827301343`。
将 `<AppId>` 替换为腾讯/微信开放平台应用的 AppId。

![Url Shceme](images/sns_guide_url_scheme.png)

#### iOS 9 适配

因为 iOS 9 默认只允许 HTTPS 访问，同时加强了应用间通信的安全。需要配置一下第三方网站的访问策略以及把第三方应用的 URL Scheme 加入到白名单中，请右击以 Source Code 的方式打开项目的 `Info.plist`，在 `plist/dict` 节点下加入以下文本：

```
    <key>LSApplicationQueriesSchemes</key>
    <array>
        <!-- QQ、Qzone URL Scheme 白名单-->
        <string>mqqOpensdkSSoLogin</string>

        <!-- 新浪微博 URL Scheme 白名单-->
        <string>sinaweibohdsso</string>
        <string>sinaweibosso</string>
    </array>

    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSExceptionDomains</key>
        <dict>
        
            <key>idqqimg.com</key>
            <dict>
                <key>NSIncludesSubdomains</key>
                <true/>
                <key>NSThirdPartyExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
            <key>gtimg.cn</key>
            <dict>
                <key>NSIncludesSubdomains</key>
                <true/>
                <key>NSThirdPartyExceptionAllowsInsecureHTTPLoads</key>
                <true/>
            </dict>
            <!-- 腾讯授权-->

        </dict>
    </dict>
```

#### 调用接口

在 `application:didFinishLaunchingWithOptions:` 方法中配置账号：

```objc
// 注册 LeanCloud 
[AVOSCloud setApplicationId:@"<LeanCloud-AppId>" clientKey:@"<LeanCloud-AppKey>"];
// 绑定微博
[AVOSCloudSNS setupPlatform:AVOSCloudSNSSinaWeibo withAppKey:@"<Weibo-AppKey>" andAppSecret:@"<Weibo-AppSecret>" andRedirectURI:@"https://leancloud.cn/1.1/sns/callback/rye5y8v6egttht70"];
// 绑定 QQ
[AVOSCloudSNS setupPlatform:AVOSCloudSNSQQ withAppKey:@"<QQ-AppId>" andAppSecret:@"<QQ-AppKey>" andRedirectURI:nil];
// 绑定微信
[AVOSCloudSNS setupPlatform:AVOSCloudSNSWeiXin withAppKey:@"<WeiXin-AppId>" andAppSecret:@"<WeiXin-AppSecret>" andRedirectURI:nil];

```
注意：redirect_uri 是在 [应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns) 生成的**回调 URL**，QQ 和微信没有这个设置选项可以填 nil。新浪微博必填。

在 `AppDelegate` 里添加:

```objc
-(BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url{
    return [AVOSCloudSNS handleOpenURL:url];
}

// When Build with IOS 9 SDK
// For application on system below ios 9
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
    return [AVOSCloudSNS handleOpenURL:url];
}
// For application on system equals or larger ios 9
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<NSString *,id> *)options
{
    return [AVOSCloudSNS handleOpenURL:url];
}

```

打开新浪微博客户端进行登录（此时并没有绑定用户系统，绑定 LeanCloud 的用户系统参考文档中的 [绑定 AVUser](#绑定-AVUser) 小节）：

```objc
// 如果用 QQ 登录将 AVOSCloudSNSSinaWeibo 替换为 AVOSCloudSNSQQ。
  
[AVOSCloudSNS loginWithCallback:^(id object, NSError *error) {
   if (error) {
   } else {
        NSString *accessToken = object[@"access_token"];
        NSString *username = object[@"username"];
        NSString *avatar = object[@"avatar"];
        NSDictionary *rawUser = object[@"raw-user"]; // 性别等第三方平台返回的用户信息
        //...
   }
} toPlatform:AVOSCloudSNSSinaWeibo];

```
在相关应用已安装的情况下，调用 `+ (void)[AVOSCloudSNS loginWithCallback:toPlatform:]` 接口的效果是直接跳转到该应用进行 SSO 授权；如果该应用没有安装，QQ 和微博将跳转至网页登录。微信没有安装时，会返回错误，暂不支持微信网页登录。

我们提供了 `+ (BOOL)[AVOSCloudSNS isAppInstalledForType:]` 来让你检测相应的应用有没有安装，没有安装的话可以提示用户或者隐藏按钮。

### 绑定 AVUser 

先导入头文件:

```objc
# import <LeanCloudSocial/AVUser+SNS.h>
```

在登录 SNS 成功回调后，使用 `loginWithAuthData:platform:block`（platform
 为可选参数）就用当前的 SNS 用户来尝试登录获取 AVUser 信息，如果 AVUser 不存在，系统会自动创建新用户并返回，如果已经存在，则直接返回该用户。例如：

```objc
[AVUser loginWithAuthData:authData platform:AVOSCloudSNSPlatformWeiXin block:^(AVUser *user, NSError *error) {
    if (error) {
        // 登录失败，可能为网络问题或 authData 无效
    } else {
        // 登录成功
    }
}];
```

这里的 authData 可以有两种格式，区别在于是否包含 `platform` 这个键值对。

调用 `-[AVOSCloudSNS loginWithCallback:toPlatform:]` 会得到包含 `platform` 数据的 authData，如：

```
{
    "platform":     1, 
    "access_token": "2.00vs3XtCI5FevCff4981adb5jj1lXE", 
    "id":           "123456789", 
    "expires_at":   "2015-07-30 08:38:24 +0000"  // NSDate
}
```

这样在该方法之后，可以紧接着调用 `-[AVUser loginWithAuthData:block]`（此时不需要加 platform 参数，因为 authData 中已包含了 platform 数据）来登录 LeanCloud 账号。这样实现起来非常方便，局限是目前**仅支持微博、QQ、微信**登录。

使用其他平台的 SDK（如 Facebook SDK）获取到的 authData 如果不包含 platform 键值对，就要在调用 `-[AVUser loginWithAuthData:platform:block]` 时加上 platform 这个参数来登录 LeanCloud 账号。

从其他平台的 SDK 获取到的 authData 数据应符合如下规范：

```
{
    "uid":          "在第三方平台上的唯一用户id字符串",
    "access_token": "在第三方平台的 access token",
    ……其他可选属性
}
```

更多可参考 REST API 文档中的 [连接用户账户和第三方平台](rest_api.html#连接用户账户和第三方平台) 小节。

如果需要为 AVUser 增加 authData，可以用 `addAuthData:platform:block:` 方法，比如：

```objc
[user addAuthData:authData platform:AVOSCloudSNSPlatformWeiXin block:^(AVUser *user, NSError *error) {
    if (error) {
        // 登录失败，可能为网络问题或 authData 无效
    } else {
        // 登录成功
    }
}];
```

增加这些 authData 绑定之后，便可以用相应平台来登录账号。

如果需要为 AVUser 移除 authData，可以用 `deleteAuthDataForPlatform:block` 方法，比如：

```objc
[user deleteAuthDataForPlatform:AVOSCloudSNSPlatformWeiXin block:^(AVUser *user, NSError *error) {
    if (error) {
       // 解除失败，多数为网络问题
    } else {
       // 解除成功
    }
}];
```

**上述方法同样适用于 AVUser 的子类。**

{{ include.retrieveAuthData(node, "### 获取 authData") }}

### WebView 授权

WebView 授权登录需要用户输入账号和密码，体验较差，我们更推荐使用 [SSO 授权](#SSO-授权) 方式登录。目前 WebView 授权支持如下平台：

- 新浪微博
- 手机 QQ

在 [应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns) 配置相应平台的 **应用 ID** 和 **应用 Secret Key** 。点击保存，自动生成 **回调 URL** 和 **登录 URL**。

#### 自动显示登录页面

自动显示登录界面不需要自己定义控制器，传入控制台生成的登录的 URL 即可。

```objc
[AVOSCloudSNS loginWithURL:url callback:^(id object, NSError *error) {
        if (error) {
            // 登录失败，可能为网络问题或 url 无效
        } else {
            // 登录成功
        }
}];
```
#### 手动显示登录界面
如果需要实现自定义显示方式，例如自定义导航栏样式等可以使用方法 `loginManuallyWithCallback:`，例如：

```objc
__block UIViewController *vc=nil;
vc= [AVOSCloudSNS loginManuallyWithURL:[NSURL URLWithString:@"https://leancloud.cn/1.1/sns/goto/rye5y8v6egttht70"]  callback:^(id object, NSError *error) {
    if (vc) {
        //关闭 UIViewController
        //ARC 模式中要将 vc 置空
        vc=nil;
    }
}];
if (vc) {
    //显示UIViewController
    [self presentViewController:vc animated: YES completion:nil];
}

```

请注意代码提到的 **ARC 模式中要将 vc 置空** 是为了打破 retain 环，否则 vc 将不会被释放而浪费内存!

更多详细使用方法，请前往 [开源项目](https://github.com/leancloud/leancloud-social-ios) 结合 Demo 学习。

## Android SNS 组件

使用 LeanCloud Android SNS 模块，开发者仅用少量代码便可实现社交平台用户登录的功能。

### 导入 SDK 和代码初始化

先查看 Android 的 [安装指南](sdk_setup-android.html)，在完成代码初始化、Manifest 配置等必要的操作之后，再集成 `avoscloud-sns` 的第三方 SDK 包。

### 开发平台与控制台配置

在 [应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns) 中间配置相应平台的 **App ID** 或者 **App Key** 与 **App Secret**。在成功保存以后，页面上能够得到相应的 **回调 URL** 和 **登录 URL**。

你将在代码里用到 **登录 URL**，同时请将 **回调 URL** 填写到对应平台的后台配置里。微博开放平台在 **应用信息** > **高级信息** > **OAuth2.0 授权设置** 中的「授权回调页」。

测试阶段，在微博开放平台上的 **应用信息** > **测试信息** 中添加微博账号，在腾讯开放平台上的 **QQ 登录** > **应用调试者** 中添加 QQ 账号即可。只有当对应平台的应用通过审核之后，才可以获取到公开的第三方登录能力。

### WebView 授权方式（仅新浪微博可用）

首先，需要在 AndroidManifest.xml 中添加相应的 Activity：

```
        <activity
            android:name="com.avos.sns.SNSWebActivity" >
        </activity>
```

其次，将 SDK 下载包中的 avoscloud-sns/res/layout/**avoscloud_sns_web_activity.xml** 拷贝到你的项目中去。

最后，在你的 Activity 页面里新增 4 步相关的配置：

```java
public class AuthActivity extends Activity{
  // 1、定义一个 ThirdPartyType 变量
  private SNSType ThirdPartyType;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    ...
    
    // 2、微博授权按钮的点击事件
    findViewById(R.id.weibo_login_main).setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {

        try {
          ThirdPartyType = SNSType.AVOSCloudSNSSinaWeibo;
          // 第二个参数为 登录 URL
          SNS.setupPlatform(SNSType.AVOSCloudSNSSinaWeibo, "https://leancloud.cn/1.1/sns/goto/xxxxxxx");
          SNS.loginWithCallback(MainActivity.this, SNSType.AVOSCloudSNSSinaWeibo, new SNSCallback() {
            @Override
            public void done(SNSBase base, SNSException e) {
              if (e == null) {
                SNS.loginWithAuthData(base.userInfo(), new LogInCallback<AVUser>() {
                  @Override
                  public void done(final AVUser user, AVException e) {
                    if (e == null) {
                      // 4、关联成功，已在 _User 表新增一条用户数据
                    } else {
                      e.printStackTrace();
                    }
                  }
                });
              } else {
                e.printStackTrace();
              }
            }
          });
        } catch (AVException e) {
          e.printStackTrace();
        }

      }
    });
    
    ...
    
  }

   @Override
   protected void onActivityResult(int requestCode, int resultCode, Intent data) {
     super.onActivityResult(requestCode, resultCode, data);
     // 3、在页面 onActivityResult 回调里填写一下代码和 ThirdPartyType
     if (resultCode == RESULT_OK) {
     SNS.onActivityResult(requestCode, resultCode, data, ThirdPartyType);
     }
   }
}

```

这样就完成了新浪微博从授权到创建用户（登录）的一整套流程。

### SSO 授权方式
利用 SSO (Single Sign On)，用户可以使用单点登录功能，避免重新注册账户或反复输入用户名和密码的麻烦。

首先请确保你的 AndroidManifest.xml 有如下权限：

```xml
</application>
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

#### QQ SSO
当使用 QQ SSO 登录时，请注意确保 AndroidManifest.xml 文件还包含如下内容：

```xml
<activity android:name="com.tencent.tauth.AuthActivity"
          android:noHistory="true"
          android:launchMode="singleTask">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="填写 QQ App ID"/>
    </intent-filter>
</activity>
```

#### 微博 SSO
当使用微博 SSO 登录时，请注意确保你的 AndroidManifest.xml 文件中包含如下内容，否则在**没有**安装微博客户端的设备上会出现问题。

```xml
<activity
   android:theme="@android:style/Theme.NoTitleBar"
   android:name="com.sina.weibo.sdk.component.WeiboSdkBrowser"
   android:configChanges="keyboardHidden|orientation"
   android:exported="false"
   android:windowSoftInputMode="adjustResize" >
</activity>
```

并下载 [libs 目录](https://github.com/sinaweibosdk/weibo_android_sdk/tree/master/so) 所需要架构的 .so 文件，导入到自己的项目中。

最终实现代码如下，以腾讯平台为例：

``` java
public class MyActivity extends Activity {
  // 1、定义一个 ThirdPartyType 变量
  private SNSType ThirdPartyType;
  // 2、定义一个 callback，用来接收授权后的数据
  final SNSCallback myCallback = new SNSCallback() {
    @Override
    public void done(SNSBase object, SNSException e) {
      if (e == null) {
        SNS.loginWithAuthData(object.userInfo(), new LogInCallback<AVUser>() {
          @Override
          public void done(AVUser avUser, AVException e) {
            // 5、关联成功，已在 _User 表新增一条用户数据
          }
        });
      } else {
        e.printStackTrace();
      }
    }
  };

  @Override
  public void onCreate(Bundle savedInstanceState) {

    // 3、QQ 授权按钮的点击事件
    findViewById(R.id.weibo_login_qq).setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View view) {
        try {
          ThirdPartyType = SNSType.AVOSCloudSNSQQ;
          SNS.setupPlatform(MainActivity.this, SNSType.AVOSCloudSNSQQ, "QQ App ID", "QQ App Key", "你们官网网址");
          SNS.loginWithCallback(MainActivity.this, SNSType.AVOSCloudSNSQQ, myCallback);
        } catch (AVException e) {
          e.printStackTrace();
        }
      }
    });

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    // 4、在页面 activity 回调里填写 ThirdPartyType
    if (resultCode == RESULT_OK) {
      SNS.onActivityResult(requestCode, resultCode, data, ThirdPartyType);
    }
  }
}
```

如果要调用新浪微博的 SSO，只要：

1. 将上述代码中的 `SNSType.AVOSCloudSNSQQ` 更换为 `SNSType.AVOSCloudSNSSinaWeibo`
2. 更改 `SNS.setupPlatform(MainActivity.this, SNSType.AVOSCloudSNSQQ, "QQ App ID", "QQ App Key", "你们官网网址");` 为 `SNS.setupPlatform(MainActivity.this, SNSType.AVOSCloudSNSSinaWeibo, "微博 App Key", "微博 App Secret", "LeanCloud 控制台里的回调 URL");` 

### 绑定 LeanCloud User

你也可以将 SSO 登录后的账号信息与 LeanCloud 的 User 绑定。通过绑定，你可以在两种用户体系间建立联系，方便信息的共享和使用。

如果你还未安装 LeanCloud Android SDK，请参阅 [快速入门](/start.html)。

SSO 登录过程与上述代码都相同，你只需要在 callback 中进行关联即可，示例代码如下：

```java
final SNSCallback myCallback = new SNSCallback() {
     @Override
     public void done(SNSBase object, SNSException e) {
         if (e == null) {
            SNS.associateWithAuthData(AVUser.getCurrentUser(), object.userInfo(), null);          
         }
     }
 };
```

上述代码，可以将你的 SNS 账号与已经创建的 LeanCloud User 账号绑定。你也可以使用 `loginWithAuthData`，它将为你创建一个新的匿名用户：

```java
  SNS.loginWithAuthData(authData, new LogInCallback() {
    @Override
    public void done(AVUser avUser, AVException e) {
        if (e == null) {
            MyActivity.this.showText("create new user with auth data done");
        } else {
            MyActivity.this.showText("create new user with auth data error: " + e.getMessage());
        }
    }
});
```

**有用户表示想要从第三方授权中获取更多的信息包括用户名等信息，我们同样可以通过 `SNSBase.authorizedData()` 方法来获取授权返回的所有字段。**

如果你不想再使用 SNS 相关的功能，可以使用 `logout` 解除 SNS 账号和 LeanCloud User 账号的绑定。

```java
  SNS.logout(AVUser.getCurrentUser(), type, new SaveCallback() {
      @Override
      public void done(AVException e) {
      }
  });
```

更多详细使用方法，请查看 SDK API 文档。

#### 不引入 SNS 模块的第三方账号与 AVUser 绑定

在实际的使用过程中，有一部分用户在涉及到 SNS 相关功能，比如分享模块时，引用了其他第三方库，然而这些库中所引用的 SNS jar 很有可能与 LeanCloud 存在版本的冲突。这个时候，用户往往非常苦恼，无法解决这样的问题。考虑到这一部分用户的需求，我们在 AVUser 中间添加了几个类似的方法，以便用户能够更便捷地与 AVUser 进行绑定，从而快速整合 LeanCloud 的用户系统。

通过 `AVUser.loginWithAuthData` 来创建一个匿名的 AVUser 对象：

```java
    AVUser.AVThirdPartyUserAuth userAuth = new AVUser.AVThirdPartyUserAuth(accessToken, expiresAt, snsType,openId);//此处snsType 可以是"qq","weibo"等字符串
    AVUser.loginWithAuthData(clazz, userAuth, callback);
```

或者通过 `AVUser.associateWithAuthData` 或者 `AVUser.dissociateAuthData` 来为一个已经存在的 AVUser 对象来绑定一个第三方账号或者解除第三方账号绑定：

```java
    AVUser.AVThirdPartyUserAuth userAuth = new AVUser.AVThirdPartyUserAuth(accessToken, expiresAt, snsType,openId)
    AVUser.associateWithAuthData(AVUser.getCurrentUser(),userAuth,callback);

    AVUser.dissociateAuthData(AVUser.getCurrentUser(),AVThirdPartyUserAuth.SNS_TENCENT_WEIBO,callback);// 解除腾讯微薄的账号绑定
```

如果你使用了 ShareSDK 来实现分享和第三方登录的功能，能也可以完成和 AVUser 的绑定。以新浪微博为例：

```java
   Platfrom plat = new SinaWeibo(getActivity());
   if (plat.isValid()){
   //如果已经授权过了，直接拿出来用
        String userId = plat.getDb().getUserId();
        if (!Utils.isNullOrEmpty(userId)) {

        //绑定第三方的授权信息
          AVUser.AVThirdPartyUserAuth auth =
              new AVUser.AVThirdPartyUserAuth(plat.getDb().getToken(), String.valueOf(plat.getDb()
                  .getExpiresTime()), AVUser.AVThirdPartyUserAuth.SNS_SINA_WEIBO, plat.getDb()
                  .getUserId());
          AVUser.loginWithAuthData(auth, new LogInCallback<AVUser>() {

            @Override
            public void done(AVUser user, AVException e) {
              if (e == null) {
              //恭喜你，已经和我们的 AVUser 绑定成功
              } else {
                e.printStackTrace();
              }
            }
          });
          return;
        }
   }
      //如果尚未授权，则通过 ShareSDK 完成授权
      plat.setPlatformActionListener(new PlatformActionListener() {

        @Override
        public void onError(Platform arg0, int arg1, Throwable arg2) {

        }

        @Override
        public void onComplete(Platform plat, int arg1, HashMap<String, Object> arg2) {
        //授权已经完成
        //绑定第三方的授权信息
          AVUser.AVThirdPartyUserAuth auth =
              new AVUser.AVThirdPartyUserAuth(plat.getDb().getToken(), String.valueOf(plat.getDb()
                  .getExpiresTime()),AVUser.AVThirdPartyUserAuth.SNS_SINA_WEIBO , plat.getDb()
                  .getUserId());
          AVUser.loginWithAuthData(auth, new LogInCallback<AVUser>() {

            @Override
            public void done(AVUser user, AVException e) {
              if (e == null) {
              //恭喜你，已经和我们的 AVUser 绑定成功
              } else {
                e.printStackTrace();
              }
            }
          });
        }

        @Override
        public void onCancel(Platform arg0, int arg1) {

        }
      });
      plat.SSOSetting(true);
      plat.showUser(null);
```

{{ include.retrieveAuthData(node, "### 获取 authData") }}
