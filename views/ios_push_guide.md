# iOS 消息推送开发指南

本文介绍了如何在 iOS 设备中使用 LeanCloud 的推送功能。请先阅读我们的博客文章《[细说 iOS 消息推送](https://blog.leancloud.cn/1163/)》，再通过 [消息推送概览](push_guide.html) 了解和巩固相关概念。

## iOS 流程简介

首先注册 APNs 申请 deviceToken：

<img src="images/apns-registration.svg" class="img-responsive" alt="">

开发者调用 LeanCloud SDK 提供的接口发送推送消息：

<img src="images/push-workflow-ios.svg" class="img-responsive" alt="">

## 配置 iOS 推送证书

配置 iOS 证书是关键的步骤，请参考 [iOS 推送证书设置指南](ios_push_cert.html)。

## 多证书场景

对于一些应用，他们在发布和上架时分为不同的版本（司机版、乘客版），但数据和消息是互通的，这种场景下我们允许应用上传多个自定义证书并对不同的设备设置 `deviceProfile`，从而可以用合适的证书给不同版本的应用推送。

当你上传自定义证书时会被要求输入「证书类型」，即 deviceProfile 的名字。当 installation 上保存了 deviceProfile 时，我们将忽略原先的开发和生产证书设置，而直接按照 deviceProfile 推送。

## 保存 Installation

在保存 installation 前，要先从 APNs 注册推送所需的 device token，具体步骤：

```objc
#import <UserNotifications/UserNotifications.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [self registerForRemoteNotification];
    . . .
}

/**
 * 初始化UNUserNotificationCenter
 */
- (void)registerForRemoteNotification {
    // iOS10 兼容
    if ([[UIDevice currentDevice].systemVersion floatValue] >= 10.0) {
        // 使用 UNUserNotificationCenter 来管理通知
        UNUserNotificationCenter *uncenter = [UNUserNotificationCenter currentNotificationCenter];
        // 监听回调事件
        [uncenter setDelegate:self];
        //iOS10 使用以下方法注册，才能得到授权
        [uncenter requestAuthorizationWithOptions:(UNAuthorizationOptionAlert+UNAuthorizationOptionBadge+UNAuthorizationOptionSound)
                                completionHandler:^(BOOL granted, NSError * _Nullable error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [[UIApplication sharedApplication] registerForRemoteNotifications];
            });
                                
            //TODO:授权状态改变
            NSLog(@"%@" , granted ? @"授权成功" : @"授权失败");
        }];
        // 获取当前的通知授权状态, UNNotificationSettings
        [uncenter getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
            NSLog(@"%s\nline:%@\n-----\n%@\n\n", __func__, @(__LINE__), settings);
            /*
             UNAuthorizationStatusNotDetermined : 没有做出选择
             UNAuthorizationStatusDenied : 用户未授权
             UNAuthorizationStatusAuthorized ：用户已授权
             */
            if (settings.authorizationStatus == UNAuthorizationStatusNotDetermined) {
                NSLog(@"未选择");
            } else if (settings.authorizationStatus == UNAuthorizationStatusDenied) {
                NSLog(@"未授权");
            } else if (settings.authorizationStatus == UNAuthorizationStatusAuthorized) {
                NSLog(@"已授权");
            }
        }];
    }
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
        UIUserNotificationType types = UIUserNotificationTypeAlert |
                                       UIUserNotificationTypeBadge |
                                       UIUserNotificationTypeSound;
        UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
        
        [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    } else {
        UIRemoteNotificationType types = UIRemoteNotificationTypeBadge |
                                         UIRemoteNotificationTypeAlert |
                                         UIRemoteNotificationTypeSound;
        [[UIApplication sharedApplication] registerForRemoteNotificationTypes:types];
    }
#pragma clang diagnostic pop
}
```

在 iOS 设备中，Installation 的类是 AVInstallation，并且是 AVObject 的子类，使用同样的 API 存储和查询。如果要访问当前应用的 Installation 对象，可以通过 `[AVInstallation currentInstallation]` 方法。当你第一次保存 AVInstallation 的时候，它会插入 `_Installation` 表，你可以在 {% if node=='qcloud' %}**控制台 > 存储 > 数据 > `_Installation`**{% else %}[控制台 > 存储 > 数据 > `_Installation`](/dashboard/data.html?appid={{appid}}#/_Installation){% endif %} 查看和查询。当 deviceToken 一被保存，你就可以向这台设备推送消息了。


```objc
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    AVInstallation *currentInstallation = [AVInstallation currentInstallation];
    [currentInstallation setDeviceTokenFromData:deviceToken];
    [currentInstallation saveInBackground];
}
```

SDK 将以上逻辑封装成了简单的方法，以上代码等价于：

```objc
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [AVOSCloud handleRemoteNotificationsWithDeviceToken:deviceToken];
}
```

可以像修改 AVObject 那样去修改 AVInstallation，但是有一些特殊字段可以帮你管理目标设备：

字段|说明
---|---
badge|应用图标旁边的红色数字，修改 AVInstallation 的这个值将修改应用的 badge。修改应该保存到服务器，以便为以后做 badge 增量式的推送做准备。
channels|当前设备所订阅的频道数组
deviceProfile|设备对应的后台自定义证书名称，用于多证书推送

同样，SDK 提供了相应的方法，用于在保存 installation 前构造它。例如，如果希望自定义 deviceProfile 字段，可以这样实现：

```objc
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [AVOSCloud handleRemoteNotificationsWithDeviceToken:deviceToken constructingInstallationWithBlock:^(AVInstallation *currentInstallation) {
        currentInstallation.deviceProfile = @"driver-push-certificate";
    }];
}
```

## 发送推送消息

发送 iOS 推送消息，可以通过 REST API，或者我们的消息推送 web 平台，请进入你的应用管理界面查看。

## 使用频道

使用频道（channel）可以实现「发布—订阅」的模型。设备订阅某个频道，然后发送消息的时候指定要发送的频道即可。

<div class="callout callout-info">每个 channel 名称只能包含 26 个英文字母和数字。</div>

### 订阅和退订

订阅 Giants 频道：

```objc
// 当用户表示喜欢 Giants，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```

订阅后要记得保存，即可在 **[控制台 > 存储 > 数据 > `_Installation`](/dashboard/data.html?appid={{appid}}#/_Installation)** 中看到该 installation 的 channels 字段多了一个「Giants」。

退订：

```objc
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation removeObject:@"Giants" forKey:@"channels"];
[currentInstallation saveInBackground];
```

获取所有订阅的频道：

```objc
NSArray *subscribedChannels = [AVInstallation currentInstallation].channels;
```

### 发送消息到频道

发送消息到刚才订阅的「Giants」频道：

```objc
// Send a notification to all devices subscribed to the "Giants" channel.
AVPush *push = [[AVPush alloc] init];
[push setChannel:@"Giants"];
[push setMessage:@"Giants 太牛掰了"];
[push sendPushInBackground];
```

如果你想发送到多个频道，可以指定 channels 数组：

```objc
NSArray *channels = [NSArray arrayWithObjects:@"Giants", @"Mets", nil];
AVPush *push = [[AVPush alloc] init];

// Be sure to use the plural 'setChannels'.
[push setChannels:channels];
[push setMessage:@"The Giants won against the Mets 2-3."];
[push sendPushInBackground];
```

### 选择证书

默认情况下，从客户端发起的推送都是使用你在消息菜单上传的生产证书，如果想使用开发证书，可以通过 `setProductionMode` 方法：

```
[AVPush setProductionMode:false];
[AVPush.push sendPushInBackground];

```

<div class="callout callout-info">为防止由于大量证书错误所产生的性能问题，我们对使用 **开发证书** 的推送做了设备数量的限制，即一次至多可以向 20,000 个设备进行推送。如果满足推送条件的设备超过了 20,000 个，系统会拒绝此次推送，并在 **[控制台 > 消息 > 推送记录](/dashboard/messaging.html?appid={{appid}}#/message/push/list)** 页面中体现。因此，在使用开发证书推送时，请合理设置推送条件。</div>


## 高级定向发送

频道对于大多数应用来说可能就足够了。但是某些情况下，你可能需要更高精度的定向推送。LeanCloud 允许你通过 AVQuery API 查询 Installation 列表，并向指定条件的 query 推送消息。

因为 AVInstallation 同时是 AVObject 的子类，因此你可以保存任何数据类型到 AVInstallation，并将它和你的其他应用数据对象关联起来，这样以来，你可以非常灵活地向你用户群做定制化、动态的推送。

### 保存 Installation 数据

为 AVInstallation 添加三个新字段：

```objc
// Store app language and version
AVInstallation *installation = [AVInstallation currentInstallation];

//字段依次为：比赛分数、比赛结果、受伤报告
[installation setObject:@(YES) forKey:@"scores"];
[installation setObject:@(YES) forKey:@"gameResults"];
[installation setObject:@(YES) forKey:@"injuryReports"];
[installation saveInBackground];
```

你可以给 Installation 添加 owner 属性，比如当前的登录用户：

```objc
// Saving the device's owner
AVInstallation *installation = [AVInstallation currentInstallation];
[installation setObject:[AVUser currentUser] forKey:@"owner"];
[installation saveInBackground];
```

### 根据查询来推送消息

一旦 Installation 保存了你的应用数据，你可以使用 AVQuery 来查询出设备的一个子集做推送。Installation 的查询跟其他对象的查询没有什么不同，只是使用特殊的静态方法
 `[AVInstallation query]` 创建查询对象：

```objc
// Create our Installation query
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"injuryReports" equalTo:@(YES)];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery]; // Set our Installation query
[push setMessage:@"Willie Hayes injured by own pop fly."];
[push sendPushInBackground];
```

你也可以在查询中添加 channels 的条件：

```objc
// Create our Installation query
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"channels" equalTo:@"Giants"]; // Set channel
[pushQuery whereKey:@"scores" equalTo:@(YES)];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery];
[push setMessage:@"Giants scored against the A's! It's now 2-2."];
[push sendPushInBackground];
```

如果你在 Installation 还保存了其他对象的关系，我们同样可以在查询条件中使用这些数据，例如，向靠近北京大学的设备推送消息：

```objc
// Find users near a given location
AVQuery *userQuery = [AVUser query];
[userQuery whereKey:@"location"
        nearGeoPoint:beijingUniversityLocation,
         withinMiles:[NSNumber numberWithInt:1]]

// Find devices associated with these users
AVQuery *pushQuery = [AVInstallation query];
[pushQuery whereKey:@"user" matchesQuery:userQuery];

// Send push notification to query
AVPush *push = [[AVPush alloc] init];
[push setQuery:pushQuery]; // Set our Installation query
[push setMessage:@"Free hotdogs at the AVOSCloud concession stand!"];
[push sendPushInBackground];
```

## 发送选项

除了发送一个文本信息之外，你还可以播放一个声音，设置 badge 数字或者其他想自定义的数据。你还可以设置一个消息的过期时间，如果对消息的时效性特别敏感的话。

### 定制通知

如果你不仅想发送一条文本消息，你需要一个 NSDictionary 来打包想发送的数据。这里有一些保留字段具有特殊含义：

保留字段|说明
---|---
`alert`|推送消息的文本内容
`badge`|应用图标右上角的数字。可以设置一个值或者递增当前值。
`sound`|应用 bundle 里的声音文件名称。
`content-available`|如果使用了 Newsstand，设置为 1 来开始一次后台下载。

更多可用的保留字段，请参考 [推送总览 · 消息内容 Data](push_guide.html#消息内容_Data)。

递增 badge 数字并播放声音：

```objc
NSDictionary *data = [NSDictionary dictionaryWithObjectsAndKeys:
    @"The Mets scored! The game is now tied 1-1!", @"alert",
    @"Increment", @"badge",
    @"cheering.caf", @"sound",
    nil];
AVPush *push = [[AVPush alloc] init];
[push setChannels:[NSArray arrayWithObjects:@"Mets", nil]];
[push setData:data];
[push sendPushInBackground];
```

当然，你还可以添加其他自定义的数据。你会在接收推送一节看到，当应用通过推送打开你的应用的时候，你就可以访问这些数据。当你要在用户打开通知的时候显示一个不同的 view controller 的时候，这特别有用。

```objc
NSDictionary *data = [NSDictionary dictionaryWithObjectsAndKeys:
    @"Ricky Vaughn was injured in last night's game!", @"alert",
    @"Vaughn", @"name",
    @"Man bites dog", @"newsItem",
    nil];
AVPush *push = [[AVPush alloc] init];
[push setQuery:injuryReportsQuery];
[push setChannel:@"Indians"];
[push setData:data];
[push sendPushInBackground];
```


### 设置过期日期

当设备关闭或者无法连接到网络的时候，推送通知就无法被送达。如果你有一条时间敏感的推送通知，不希望在太长时间后被用户读到，那么可以设置一个过期时间来避免打扰用户。

AVPush 提供了两个方法来设置通知的过期日期，首先是 `expireAtDate:` 接收 NSDate 来告诉 LeanCloud 不要再去发送通知。

```objc
NSDateComponents *comps = [[NSDateComponents alloc] init];
[comps setYear:2013];
[comps setMonth:10];
[comps setDay:12];
NSCalendar *gregorian =
  [[NSCalendar alloc] initWithCalendarIdentifier:NSGregorianCalendar];
NSDate *date = [gregorian dateFromComponents:comps];

// Send push notification with expiration date
AVPush *push = [[AVPush alloc] init];
[push expireAtDate:date];
[push setQuery:everyoneQuery];
[push setMessage:@"Season tickets on sale until October 12th"];
[push sendPushInBackground];
```

这个方法有个隐患，因为设备的时钟是无法保证精确的，你可能得到错误的结果。因此，AVPush 还提供了 `expireAfterTimeInterval` 方法，接收 NSTimeInterval 对象。通知将在指定间隔时间后失效：

```objc
// Create time interval
NSTimeInterval interval = 60*60*24*7; // 1 week

// Send push notification with expiration interval
AVPush *push = [[AVPush alloc] init];
[push expireAfterTimeInterval:interval];
[push setQuery:everyoneQuery];
[push setMessage:@"Season tickets on sale until October 18th"];
[push sendPushInBackground];
```

<div class="callout callout-info">我们建议给 iOS 设备的推送都设置过期时间，才能保证推送的当时，如果用户设置了飞行模式，在关闭飞行模式之后可以收到推送消息，可以参考 [Stackoverflow - Push notification is not being delivered when iPhone comes back online](http://stackoverflow.com/questions/24026544/push-notification-is-not-being-delivered-when-iphone-comes-back-online)。</div>

### 指定设备平台

跨平台的应用，可能想指定发送的平台，比如 iOS 或者 Android:

```objc
AVQuery *query = [AVInstallation query];
[query whereKey:@"channels" equalTo:@"suitcaseOwners"];

// Notification for Android users
[query whereKey:@"deviceType" equalTo:@"android"];
AVPush *androidPush = [[AVPush alloc] init];
[androidPush setMessage:@"Your suitcase has been filled with tiny robots!"];
[androidPush setQuery:query];
[androidPush sendPushInBackground];

// Notification for iOS users
[query whereKey:@"deviceType" equalTo:@"ios"];
AVPush *iOSPush = [[AVPush alloc] init];
[iOSPush setMessage:@"Your suitcase has been filled with tiny apples!"];
[iOSPush setChannel:@"suitcaseOwners"];
[iOSPush setQuery:query];
[iOSPush sendPushInBackground];
```

## 定时推送

请进入消息推送的 Web 管理平台，可以做到定时推送（延迟或者指定时间）。


## 接收推送通知

正如 [定制通知](#定制通知) 一节提到，你可以随通知发送任意的数据。我们使用这些数据修改应用的行为，当应用是通过通知打开的时候。例如，当打开一条通知告诉你有一个新朋友的时候，这时候如果显示一张图片会非常好。

由于 Apple 的对消息大小的限制，请尽量缩小要发送的数据大小，否则会被截断。详情请参看 [APNs 文档](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/APNsProviderAPI.html#//apple_ref/doc/uid/TP40008194-CH101-SW1)。

```objc
NSDictionary *data = @{
  @"alert": @"James commented on your photo!",
  @"p": @"vmRZXZ1Dvo" // Photo's object id
};
AVPush *push = [[AVPush alloc] init];
[push setQuery:photoOwnerQuery];
[push setData:data];
[push sendPushInBackground];
```

## 响应通知数据

当应用是被通知打开的时候，你可以通过 `application:didFinishLaunchingWithOptions:`方法的 `launchOptions` 参数所使用的 dictionary 访问到数据：

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    . . .
    if ([[UIDevice currentDevice].systemVersion floatValue] < 10.0) {
        NSDictionary *notificationPayload;
        @try {
            notificationPayload = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];
        } @catch (NSException *exception) {}
        
        // Create a pointer to the Photo object
        NSString *photoId = [notificationPayload objectForKey:@"p"];
        AVObject *targetPhoto = [AVObject objectWithoutDataWithClassName:@"Photo"
                                                                objectId:photoId];
        
        // Fetch photo object
        [targetPhoto fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
            // Show photo view controller
            if (!error && [AVUser currentUser]) {
                PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
                [self.navController pushViewController:viewController animated:YES];
            }
        }];
    }
}
```

如果当通知到达的时候，你的应用已经在运行，对于 iOS10 以下，你可以通过 `application:didReceiveRemoteNotification:fetchCompletionHandler:` 方法的 `userInfo` 参数所使用 dictionary 访问到数据：

```objc
/*!
 * Required for iOS 7+
 */
- (void)application:(UIApplication *)application
      didReceiveRemoteNotification:(NSDictionary *)userInfo
            fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))handler {
  // Create empty photo object
  NSString *photoId = [userInfo objectForKey:@"p"];
  AVObject *targetPhoto = [AVObject objectWithoutDataWithClassName:@"Photo"
                                                          objectId:photoId];

  // Fetch photo object
  [targetPhoto fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
    // Show photo view controller
    if (error) {
      handler(UIBackgroundFetchResultFailed);
    } else if ([AVUser currentUser]) {
      PhotoVC *viewController = [[PhotoVC alloc] initWithPhoto:object];
      [self.navController pushViewController:viewController animated:YES];
    } else {
      handler(UIBackgroundFetchResultNoData);
    }
  }];
}
```

iOS10 以上需要使用下面代理方法来获得 `userInfo` ：

 ```objc
/**
 * Required for iOS10+
 * 在前台收到推送内容, 执行的方法
 */
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
    NSDictionary *userInfo = notification.request.content.userInfo;
    if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        //TODO:处理远程推送内容
        NSLog(@"%@", userInfo);
    }
    // 需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
    completionHandler(UNNotificationPresentationOptionAlert);
}

/**
 * Required for iOS10+
 * 在后台和启动之前收到推送内容, 点击推送内容后，执行的方法
 */
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)())completionHandler {
    NSDictionary * userInfo = response.notification.request.content.userInfo;
    if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
        //TODO:处理远程推送内容
        NSLog(@"%@", userInfo);
    }
    completionHandler();
}
 ```

你可以阅读 [Apple 本地化和推送的文档](https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/Introduction.html#//apple_ref/doc/uid/TP40008194-CH1-SW1) 来更多地了解推送通知。

## 离线消息重复推送

请参考 [为什么在 iOS 上离线消息重复推送了两次？](realtime_guide-objc.html#duplicate-offline-message-notification)
