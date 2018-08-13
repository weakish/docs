# 在云引擎中使用推送服务（测试页面）

在云引擎上，除了进行像鉴权、账单处理等这些需要在服务端完成的操作，还可以完成消息的推送。例如天气类应用在气温发生大幅变化时需要向用户推送提醒消息，便可以通过云引擎统一向 iOS、Android 和 Web 端进行推送。这样既能减少各移动端的编码量，又便于统一各端的业务逻辑。

## 多语言翻译测试

Tester，`Lang_Tester`，<var>lang_test_content</var>

## 准备工作

推送服务主要用于 iOS 和 Androd 等移动平台，开发者首次尝试开发时一定要满足以下条件：

- 应用已经部署到目标设备上
- iOS 设备需要 [正确配置 iOS 推送证书并上传到 LeanCloud 控制台](ios_push_cert.html)
- Android 设备需要 [正确配置 `AndroidManifest.xml`](android_push_guide.html#配置)

开始之前，建议先熟悉以下内容：

- [消息推送服务总览](push_guide.html)
- [iOS 消息推送开发指南](ios_push_guide.html)
- [Android 消息推送开发指南](android_push_guide.html)
- 所有 LeanCloud SDK 都基于 REST API 做了封装，具体请参考 [使用 REST API 推送消息](push_guide.html#推送消息)。

## 发送给所有设备

从云引擎向所有已经安装了应用的设备推送一条消息「今日大风降温，多添件衣服亲！」：

```js
"use strict";
var AV = require('leancloud-storage');

AV.Push.send({
  data: {
    alert: '今日大风降温，多添件衣服亲！'
  }
});
```

注意，请确保在 iOS 和 Android 正确调用了保存 `_Installation` 的 API。

## 发送给指定设备

假设当前在 `_Installation` 表中存在如下一条数据：

```json
{
  "valid":       true,
  "timeZone":    "Asia/Shanghai",
  "ACL": {
    "*": {
      "read":    true,
      "write":   true
    }
  },
  "deviceToken": "df2d434cd2097f250eecbab0f4fe45916ff17a13a9af99d015a72db1aa6c7302",
  "deviceType":  "ios",
  "badge":       0,
  "objectId":    "cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5",
  "createdAt":   "2016-10-17T16:51:15.604Z",
  "updatedAt":   "2016-10-30T03:07:39.090Z"
}
```

从云引擎向这台设备推送消息的代码如下：

```js
"use strict";
let AV = require('leancloud-storage');

let query = new AV.Query('_Installation');
query.equalTo('installationId', 'cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5');
AV.Push.send({
    where: query,
    data: {
        alert: '今日大风降温，多添件衣服亲！'
    }
});
```

## 批量推送

批量推送一般有两种场景：

- **静态设定**<br/>
  用户主动关注，类似于我们订阅报纸，报社需要每天向主动订阅了晚报的用户派送报纸，而推送就是向订阅了某一个频道的用户们进行批量推送。
- **动态查询**<br/>
  服务端根据业务逻辑需求向一些用户动态的发送推送，有可能每一次推送的用户群都是浮动的。经典的案例就是，当你在淘宝浏览过某些商品之后，你再回到微博的网页上，你会看见微博的网页会根据你在淘宝浏览的商品给你显示相关的商品推荐。推送也是如此，一些用户的动态行为可以为推送服务提供算法参考。因此这些用户是动态的。

```js
// This is a JS snippet
// This is a JS snippet
// This is a JS snippet
// This is a JS snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```
```php
// This is a PHP snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```
```java
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```

### 静态设定-Channel

我们不推荐开发者在 `_Installation` 表中加入过多的自定义属性，我们更推荐用户使用频道（Channel）的概念。例如在客户端 SDK 中，一个注册用户以自己的用户名或者 objectId 订阅了一个频道，这样就在云引擎上向这些用户推送内容就会简单很多。

例如在某个天气应用中，用户选择「苏州」作为关注的城市。为了向该用户推送苏州的天气变化，我们可以在代码中为该用户订阅「苏州」这个频道的推送渠道：

```objc
// 使用 iOS SDK API 进行订阅操作
// 当用户关注 SuZhou，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"SuZhou" forKey:@"channels"];// 为用户订阅 SuZhou 频道
[currentInstallation saveInBackground];
```
```java
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
// 使用 iOS SDK API 进行订阅操作
// 当用户关注 SuZhou，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"SuZhou" forKey:@"channels"];// 为用户订阅 SuZhou 频道
[currentInstallation saveInBackground];
```
```es7
// This is a ES7 snippet
// This is a ES7 snippet
// 使用 iOS SDK API 进行订阅操作
// 当用户关注 SuZhou，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"SuZhou" forKey:@"channels"];// 为用户订阅 SuZhou 频道
[currentInstallation saveInBackground];
```
```php
// This is a PHP snippet
// This is a PHP snippet
// 使用 iOS SDK API 进行订阅操作
// 当用户关注 SuZhou，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"SuZhou" forKey:@"channels"];// 为用户订阅 SuZhou 频道
[currentInstallation saveInBackground];
```

而在云引擎中向「苏州」这个频道推送天气情况：

```js
// This is a JS snippet
// This is a JS snippet
// This is a JS snippet
// This is a JS snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```
```php
// This is a PHP snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```
```java
// This is a Java snippet
// This is a Java snippet
// This is a Java snippet
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```

> **LeanCloud SDK 内部是如何使用 Channel 的？**
>
>[LeanCloud 即时通讯 SDK](re) 便是通过 Channel 来实现聊天消息的离线推送，具体逻辑为——每个用户都会去订阅以自己名字命名的频道。这样当服务端发现某一个用户下线了，由于该用户的 ID 已知，所以只要向这个频道推送这条离线消息即可。感兴趣的开发者可以研究一下开源的 [iOS SDK](https://github.com/leancloud/objc-sdk) 源代码，就能发现上述的机制。

### 动态查询-Query

推送的对象逻辑上针对的是设备，因此如果希望发送给指定的用户，开发者则需要自己维护设备与用户之间的对应关系。

用过微博和手机 QQ 的用户都会经历这一场景：当在 iPad 和手机上都登录了自己的 QQ 账号时，一旦有新消息，iPad 和手机在默认情况下会同时收到推送。使用 LeanCloud  实现这个需求也很简单。

首先需要建立一张新表 `UserInstallation`，假设有如下数据：

objectId|user|installation|createdAt|updatedAt
----|-----|-----|-----|----
58156499da2f60005dbf70ab|58156499c4c97100554acaaf| cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5|<span style="white-space: nowrap;">2016-10-30T03:10:17.874Z</span>|<span style="white-space: nowrap;">2016-10-30T03:10:17.874Z</span>

建立这个关系的代码如下：

```objc
// iOS SDK
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
AVUser *currentUser = [AVUser currentUser];
AVObject *user_installation = [AVObject objectWithClassName:@"UserInstallation"];
[user_installation setObject:currentUser forKey:@"user"];
[user_installation setObject:currentInstallation forKey:@"installation"];
[user_installation saveInBackground];
```

其中 **user** 字段指向了 `_User` 表的 Pointer，**installation** 指向了 `_Installation` 的 Pointer。

如果同一个用户存在两条记录，则可以理解为该用户在 iPad 和手机上都成功登录过：

objectId|user|installation|createdAt|updatedAt
----|-----|-----|-----|----
58156499da2f60005dbf70ab|`58156499c4c97100554acaaf`| cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5|<span style="white-space: nowrap;">2016-10-30T03:10:17.874Z</span>|<span style="white-space: nowrap;">2016-10-30T03:10:17.874Z</span>
581564992e958a0054999374 | `58156499c4c97100554acaaf` | yOVXDS63SRytpcarrYk0kUWfBAK6yNtx |<span style="white-space: nowrap;">2016-09-21T07:58:34.015Z</span>|<span style="white-space: nowrap;">2016-09-21T07:58:34.015Z</span>

向这个用户做推送时，就要针对他的这两个设备，在云引擎中可以使用如下代码：

```js
  var userQuery = new AV.Query('UserInstallation');
  var user = AV.Object.createWithoutData('_User', '58156499da2f60005dbf70ab');
  userQuery.equalTo('user', user);
  userQuery.find().then(function (user_installations) {
      var installationQuery = new AV.Query('_Installation');
      var insIdArray = user_installations.map(function (v, i, a) {
          var ins = v.get('installation');
          return ins.id;
      });
      console.log(insIdArray);
      installationQuery.containedIn('objectId', insIdArray);
      AV.Push.send({
          where: installationQuery,
          data: {
              alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
          }
      });
  });
```

<div class="callout callout-info">使用中间表方式来管理「设备-用户」这种多对多的关系具备很大的灵活性，例如在 `UserInstallation` 表中存储一些自定义的属性。</div>

我们不建议开发者在 `_Installation` 表里添加过多的自定义字段，它本身的查询权限是关闭的，我们不允许客户端直接查询 `_Installation` 表，因此利用中间表来提高实用性以及预防查询的过载。

## 接收推送消息

接收推送消息请参照以下文档进行代码编写：

- [iOS 接收推送通知](ios_push_guide.html#接收推送通知)
- [Android 自定义 Receiver](android_push_guide.html#自定义_Receiver)
