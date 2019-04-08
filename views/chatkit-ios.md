{% import "views/_helper.njk" as docs %}
# ChatKit 使用指南 &middot; iOS

> 如果需要了解 Android 版本请点击: [ChatKit 使用指南 &middot; Android](chatkit-android.html)

[ChatKit](https://github.com/leancloud/ChatKit-OC) 是一个免费且开源的 UI 聊天组件，由 LeanCloud 官方推出，底层聊天服务基于 LeanCloud 的 IM 即时通讯服务 LeanMessage 而开发，支持 iOS 7+。它的最大特点是把聊天常用的一些功能配合 UI 一起提供给开发者，帮助开发者快速集成 IM 服务，轻松实现聊天功能。

ChatKit 开源且提供完全自由的授权协议，开发者可以对其进行任意修改、扩展和二次封装，但是 LeanCloud 并不对 ChatKit 的二次开发提供技术支持。

## 获取项目 

```
git clone --depth=1 https://github.com/leancloud/ChatKit-OC
```

## 集成效果

从大量的使用场景来看，「最近联系人列表」和「聊天界面」这两个页面是开发者最常使用的，同时也是比较难处理的。

最近联系人页面实现的难点在于：

- 要根据最近打开的聊天窗口排序联系人列表；
- 对每一个最近聊天人／组需要显示最新的一条消息及时间；
- 需要实时更新未读消息的计数；

而聊天页面的实现难点则在于：

- 消息种类繁多，要有比较好的用户体验，界面以及异步处理方面有大量的开发工作；
- 音视频消息的录制和发送，需要对系统以及 LeanCloud 即时通讯 API 比较熟悉；
- 推、拉展示本对话中的最新消息，需要对 LeanCloud 即时通讯接口比较熟悉；

我们在 ChatKit 中重点完成了这两个页面的开发，大家可以看看效果：
<div class="row">
  <div class="col-sm-4">
    <p>最近联系人</p>
    <img src="images/chatkit-ios/chatkit-screenshot-01.png" class="img-responsive img-bordered" />
  </div>
  <div class="col-sm-4">
    <p>语音消息，根据语音长度调整宽度</p>
    <img src="images/chatkit-ios/chatkit-screenshot-02.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>图片消息，尺寸自适应</p>
    <img src="images/chatkit-ios/chatkit-screenshot-03.png" class="img-responsive" />
  </div>
</div>
<div class="row" style="margin-top: 5rem;">
  <div class="col-sm-4">
    <p>地理位置消息</p>
    <img src="images/chatkit-ios/chatkit-screenshot-04.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>失败消息本地缓存，可重发</p>
    <img src="images/chatkit-ios/chatkit-screenshot-05.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>上传图片，进度条提示</p>
    <img src="images/chatkit-ios/chatkit-screenshot-06.png" class="img-responsive" />
  </div>
</div>
<div class="row" style="margin-top: 5rem;">
  <div class="col-sm-4">
    <p>图片消息支持多图联播，支持多种分享</p>
    <img src="images/chatkit-ios/chatkit-screenshot-07.jpg" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>文本消息支持图文混排</p>
    <img src="images/chatkit-ios/chatkit-screenshot-08.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>文本消息支持双击全屏展示</p>
    <img src="images/chatkit-ios/chatkit-screenshot-09.png" class="img-responsive img-bordered" />
  </div>
</div>

## 项目结构

```
├── ChatKit  ＃核心库文件夹
│   ├── LCChatKit.h  # 这是整个库的入口，也是中枢，相当于”组件化方案“中的 Mediator。
│   ├── LCChatKit.m
│   └── Class
│       ├── Model
│       ├── Module
│       │   ├── Base
│       │   ├── Conversation
│       │   │   ├── Controller
│       │   │   ├── Model
│       │   │   ├── Tool
│       │   │   └── View
│       │   └── ConversationList
│       │       ├── Controller
│       │       ├── Model
│       │       └── View
│       ├── Resources  # 资源文件，如图片、音频等
│       ├── Tool
│       │   ├── Service
│       │   └── Vendor
│       └── View
└── ChatKit-OC  # Demo演示
    ├── ChatKit-OC.xcodeproj
    └── Example
        └── LCChatKitExample.h  
        └── LCChatKitExample.m
            ├── Model
            ├── Module
            │   ├── ContactList
            │   │   ├── Controller
            │   │   ├── Tool
            │   │   └── View
            │   ├── Login
            │   │   ├── Controller
            │   │   ├── Model
            │   │   └── View
            │   ├── Main
            │   │   ├── Controller
            │   │   └── View
            │   └── Other
```

 从上面可以看出，`ChatKit-OC` 项目包分为两个部分：

* `ChatKit` 是库的核心库文件夹。
* `ChatKit-OC` 为 Demo 演示部分。

## 运行 Demo
 
获取项目以后，在终端打开 ChatKit-OC 文件夹并执行 pod update 更新 Pod 文件。更新成功就可以打开 ChatKit-OC.xcworkspace 运行 Demo。
 
## 使用方法

按照下面的流程，可以快速接入 ChatKit，体验即时通讯服务。

### CocoaPods 导入

在文件 `Podfile` 中加入以下内容：

```shell
pod 'ChatKit'
```

然后使用 CocoaPods 进行安装。如果尚未安装 CocoaPods，运行以下命令进行安装：

```shell
gem install cocoapods
```

安装成功后就可以安装依赖了。建议使用如下方式：

```shell
 # 禁止升级 CocoaPods 的 spec 仓库，否则会卡在 Analyzing dependencies，非常慢
 pod update --verbose --no-repo-update
```

如果提示找不到库，则可去掉 `--no-repo-update`。

如果不想使用 CocoaPods 进行集成，也可以选择使用 [源码集成](#手动集成)。

### 初始化

打开 `AppDelegate` 文件，添加下列导入语句到头部：

```objc
#import <ChatKit/LCChatKit.h>
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions` 函数内：

```objc
// 开启 LeanCloud 服务
[LCChatKit setAppId:@"{{appid}}" appKey:@"{{appkey}}"];
 
//添加输入框底部「拍摄/照片/位置」插件，用于发送图片与位置信息
[LCCKInputViewPluginTakePhoto registerSubclass];
[LCCKInputViewPluginPickImage registerSubclass];
[LCCKInputViewPluginLocation registerSubclass];
 
//新建 LoginViewController 用于设置用户系统与用户登录。
 LoginViewController *loginVc = [[LoginViewController alloc]init];
 self.window = [[UIWindow alloc]initWithFrame:[UIScreen mainScreen].bounds];
 self.window.rootViewController = [[UINavigationController alloc]initWithRootViewController:loginVc];
 [self.window makeKeyAndVisible];
```

AppId 和 appKey 可以在 [控制台 > 应用设置](/dashboard/app.html?appid={{appid}}#/key) 中找到。

以 Source Code 方式打开 info.plist 文件，粘贴配置下列权限:

```objc
<key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
<key>NSAppleMusicUsageDescription</key>
<string>App 需要您的同意,才能访问媒体资料库</string>
<key>NSCameraUsageDescription</key>
<string>App 需要您的同意,才能访问相机</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>App 需要您的同意,才能始终访问位置</string>
<key>NSLocationUsageDescription</key>
<string>App 需要您的同意,才能访问位置</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>App 需要您的同意,才能在使用期间访问位置</string>
<key>NSMicrophoneUsageDescription</key>
<string>App 需要您的同意,才能访问麦克风</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>App 需要您的同意,才能访问相册</string>

```

### 用户系统

用 ChatKit 进行聊天只需要给 ChatKit 传一个 ClientId。但是聊天双方只能看到一个 ClientId 体验不好，所以需要配置用户系统展示头像、昵称等。配置用户系统需要以下几步：

#### 1.创建 LCCKUser

配置用户系统之前需要新建一个表示 User 的 Model 并遵循 LCCKUserDelegate 协议，下面的示例代码中对应的是 LCCKUser。

LCCKUser.h 代码示例：

```objc
#import <ChatKit/LCChatKit.h>
 
@interface LCCKUser : NSObject <LCCKUserDelegate>
 
@end
```

LCCKUser.m 代码示例：

```objc
#import "LCCKUser.h"
@interface LCCKUser ()
@end
@implementation LCCKUser
@synthesize userId = _userId;
@synthesize name = _name;
@synthesize avatarURL = _avatarURL;
@synthesize clientId = _clientId;
 
- (instancetype)initWithUserId:(NSString *)userId name:(NSString *)name avatarURL:(NSURL *)avatarURL clientId:(NSString *)clientId {
    self = [super init];
    if (!self) {
        return nil;
    }
    _userId = userId;
    _name = name;
    _avatarURL = avatarURL;
    _clientId = clientId;
    return self;
}
+ (instancetype)userWithUserId:(NSString *)userId name:(NSString *)name avatarURL:(NSURL *)avatarURL clientId:(NSString *)clientId{
    LCCKUser *user = [[LCCKUser alloc] initWithUserId:userId name:name avatarURL:avatarURL clientId:clientId];
    return user;
}
- (instancetype)initWithUserId:(NSString *)userId name:(NSString *)name avatarURL:(NSURL *)avatarURL {
    return [self initWithUserId:userId name:name avatarURL:avatarURL clientId:userId];
}
+ (instancetype)userWithUserId:(NSString *)userId name:(NSString *)name avatarURL:(NSURL *)avatarURL {
    return [self userWithUserId:userId name:name avatarURL:avatarURL clientId:userId];
}
- (instancetype)initWithClientId:(NSString *)clientId {
    return [self initWithUserId:nil name:nil avatarURL:nil clientId:clientId];
}
+ (instancetype)userWithClientId:(NSString *)clientId {
    return [self userWithUserId:nil name:nil avatarURL:nil clientId:clientId];
}
- (id)copyWithZone:(NSZone *)zone {
    return [[LCCKUser alloc] initWithUserId:self.userId
                                       name:self.name
                                  avatarURL:self.avatarURL
                                   clientId:self.clientId
            ];
}
- (void)encodeWithCoder:(NSCoder *)aCoder {
    [aCoder encodeObject:self.userId forKey:@"userId"];
    [aCoder encodeObject:self.name forKey:@"name"];
    [aCoder encodeObject:self.avatarURL forKey:@"avatarURL"];
    [aCoder encodeObject:self.clientId forKey:@"clientId"];
}
- (id)initWithCoder:(NSCoder *)aDecoder {
    if(self = [super init]){
        _userId = [aDecoder decodeObjectForKey:@"userId"];
        _name = [aDecoder decodeObjectForKey:@"name"];
        _avatarURL = [aDecoder decodeObjectForKey:@"avatarURL"];
        _clientId = [aDecoder decodeObjectForKey:@"clientId"];
    }
    return self;
}
@end
```

#### 2.设置用户体系

实现 `[[LCChatKit sharedInstance] setFetchProfilesBlock:]` 设置用户体系，里面要实现如何根据 userId 获取到一个 User 对象的逻辑。以 LeanCloud 原生的用户系统 AVUser 举例，按照如下方式构建 LCCKUser 对象。示例中「设置用户体系」与「注册登录」代码放在了 LoginViewController 中，用户可放到自己项目中适合的位置。

```objc
// userIds 指的是 ClientId 的集合。示例代码中开启聊天服务使用 AVUser 的 ObjectId 作为 ClientId。
 [[LCChatKit sharedInstance] setFetchProfilesBlock:^(NSArray<NSString *> *userIds, LCCKFetchProfilesCompletionHandler completionHandler) {
    if (userIds.count == 0) {
        return;
    }
    NSMutableArray *users = [NSMutableArray arrayWithCapacity:userIds.count];
    for (NSString *clientId in userIds) {
        //查询 _User 表需开启 find 权限
        AVQuery *userQuery = [AVQuery queryWithClassName:@"_User"];
        AVObject *user = [userQuery getObjectWithId:clientId];
        if (user) {
            //"avatar" 是 _User 表的头像字段
            AVFile *file = [user objectForKey:@"avatar"];
            LCCKUser *user_ = [LCCKUser userWithUserId:user.objectId name:[user objectForKey:@"username"] avatarURL:[NSURL URLWithString:file.url] clientId:clientId];
            [users addObject:user_];
        }else{
            //注意：如果网络请求失败，请至少提供 ClientId！
            LCCKUser *user_ = [LCCKUser userWithClientId:clientId];
            [users addObject:user_];
        }
    }
    !completionHandler ?: completionHandler([users copy], nil);
}];

```
#### 3.注册或登录

用户注册

```objc
// AVUser 注册新用户
AVUser *user = [AVUser user];// 新建 AVUser 对象实例
user.username = @"张三";// 设置用户名
user.password =  @"123";// 设置密码
[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
     if (succeeded) {
        // 注册成功，给用户设置头像
       AVFile *file = [AVFile fileWithURL:@"http://ac-jmbpc7y4.clouddn.com/3524339715676bb7703b.jpg"];
       [user setObject:file forKey:@"avatar"];
       [user saveInBackground];
      }
}];
```
AVUser 注册后登录，调用 `[[LCChatKit sharedInstance] openWithClientId:]` 登录聊天服务，使用 User.objectId 作为 ClientId：

```objc
// AVUser 登录
[AVUser logInWithUsernameInBackground:@"张三" password:@"123" block:^(AVUser *user, NSError *error) {
    if (user!=nil) {
         //登录聊天服务
        [[LCChatKit sharedInstance] openWithClientId:user.objectId callback:^(BOOL succeeded, NSError *error) {
            if (succeeded) {
            //登录成功，跳转到会话列表页面，ChatListViewController 继承于 LCCKConversationListViewController，详情见下面的会话列表介绍。
            ChatListViewController *vc = [[ChatListViewController alloc]init];
            [self.navigationController pushViewController:vc animated:YES];
            }
        }];
    }
}];
```

### 会话列表

主流的社交聊天软件，例如微信和 QQ 都会把最近联系人界面作为登录后的首页，可见其重要性。因此我们在 ChatKit 也提供了对话列表 `LCCKConversationListViewController` 页面。

新建一个 ChatListViewController 继承于 LCCKConversationListViewController，即可开启会话列表页面。后文中会话列表默认为 ChatListViewController。

```objc
ChatListViewController *vc = [[ChatListViewController alloc]init];
[self.navigationController pushViewController:vc animated:YES];
```
ChatListViewController.h 需导入头文件 `#import <ChatKit/LCChatKit.h>`,示例代码：

```objc
//ChatListViewController.h 示例
#import <ChatKit/LCChatKit.h>

@interface ChatListViewController : LCCKConversationListViewController
 
@end
```

### 新建一个会话

新用户的会话列表是空的，按照下面的方法可以新建一个会话，发送一条消息。

```objective-c
//在 ChatListViewController.m 中
- (void)viewDidLoad {
  //创建新会话
    UIButton *addBtn = [UIButton buttonWithType:UIButtonTypeContactAdd];
    [addBtn addTarget:self action:@selector(createConversationBtnClick) forControlEvents:(UIControlEventTouchUpInside)];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:addBtn];
}
- (void)createConversationBtnClick{
// clientId 是聊天对象 AUser 对象的 objectId。例如下面这个是用户「李四」的 objectId：
    NSString *clientId = @"5a5b995cac502e006e2e1391";
    [[LCChatKit sharedInstance].client createConversationWithName:@"创建第一个会话"
      clientIds:@[clientId] options:AVIMConversationOptionUnique
      callback:^(AVIMConversation *conversation, NSError *error)
        {
           [conversation sendMessage:[AVIMTextMessage messageWithText:@"你好，小王" attributes:nil]
                              callback:^(BOOL succeeded, NSError *error) {
               if (succeeded) {
               //创建会话成功，跳转到聊天详情页
                LCCKConversationViewController *conversationViewController = [[LCCKConversationViewController alloc] initWithConversationId:conversation.conversationId];
                [self.navigationController pushViewController:conversationViewController animated:YES];
               }
         }];
    }];
}
```

如果创建会话成功后，不想要跳转到聊天详情页，而是做一些其他操作，这种情况下需要手动将新创建的会话插入会话列表：

```objc
[[LCChatKit sharedInstance] insertRecentConversation:conversation];
```

### 聊天详情界面

聊天详情对应 LCCKConversationViewController。

从会话列表跳转到聊天详情，需在会话列表 ChatListViewController 中遵守 LCCKConversationListViewControllerDelegate 协议。
然后在 viewDidLoad 方法中设置自己为代理：

```objc
self.delegate = self;
```

实现下面的代理方法：

```objc
//由会话列表进入聊天详情界面
- (void)conversation:(AVIMConversation *)conversation tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    //跳转到聊天详情
    LCCKConversationViewController *conversationVC = [[LCCKConversationViewController alloc] initWithConversationId:conversation.conversationId];
    [self.navigationController pushViewController:conversationVC animated:YES];
}
```

### 个人主页
在聊天详情界面，点击好友或自己的头像，需要进入个人详细信息界面。实现 `[[LCChatKit sharedInstance] setOpenProfileBlock:]` 可以跳转到个人主页。

```objc
//跳转到个人主页
[[LCChatKit sharedInstance] setOpenProfileBlock:^(NSString *userId, id<LCCKUserDelegate> user, __kindof UIViewController *parentController) {
 if (!userId) {
    //用户不存在
  }else{
    NSString *currentClientId = [LCChatKit sharedInstance].clientId;
    if ([userId isEqualToString:currentClientId]) {
        NSLog(@"打开自己的主页ClientId是 : %@\n,我自己的name是 : %@",userId,user.name);
    }else{
        NSLog(@"打开用户主页ClientId是 : %@\n,name是 : %@",userId,user.name);
     }
   }
}];
```

### 退出登录

调用 `-[[LCChatKit sharedInstance] closeWithCallback:]` 关闭 LeanCloud 的 IM 服务，结束聊天。

### 离线消息

离线消息推送请参考 [iOS 消息推送开发指南](https://leancloud.cn/docs/ios_push_guide.html)。

### 手动集成

如果你不想使用 CocoaPods 进行集成，也可以选择使用源码集成。步骤如下：

第一步：

将 [项目结构](#项目结构) 中提到的 ChatKit 这个「核心库文件夹」拖拽到项目中。

第二步：

添加 ChatKit 依赖的第三方库以及对应版本：

- [AVOSCloud](sdk_down.html) v3.3.5
- [AVOSCloudIM](sdk_down.html) v3.3.5
- [MJRefresh](https://github.com/CoderMJLee/MJRefresh) 3.1.9
- [Masonry](https://github.com/SnapKit/Masonry) v1.0.1 
- [SDWebImage](https://github.com/rs/SDWebImage) v3.8.0
- [FMDB](https://github.com/ccgus/fmdb) 2.6.2 
- [UITableView+FDTemplateLayoutCell](https://github.com/forkingdog/UITableView-FDTemplateLayoutCell) 1.5.beta


## 常见问题

**ChatKit 组件收费么？**<br/>
ChatKit 是完全开源并且免费给开发者使用，使用聊天所产生的费用以账单为准。

**接入 ChatKit 有什么好处？**<br/>
它可以减轻应用或者新功能研发初期的调研成本，直接引入使用即可。ChatKit 从底层到 UI 提供了一整套的聊天解决方案。

**聊天列表默认用英文显示距离上次聊天的时间，如果需要用中文显示时间如何设置？**<br/>
在本地化设置中添加简体中文的支持：

![Localization](images/chatkit-ios-localization.png)






