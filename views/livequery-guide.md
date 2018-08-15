{% import "views/_helper.njk" as docs %}
{% import "views/_parts.html" as parts %}
# 实时数据同步 LiveQuery 开发指南

LiveQuery 的使用场景有：

- 多端数据同步
- 数据的实时展现
- 客户端与服务端之间的数据传递实现推拉结合

下面是在使用了 LiveQuery 的网页应用和手机应用中分别操作，数据保持同步的效果：

{# 2017-06-09 因为 docs 没为 CDN 加速，视频尺寸大，所以特别对待，放在七牛上。 #}
<div style="border:2px solid #ccc; margin-bottom:1em;">
  <video src="https://lc-lhzo7z96.cn-n1.lcfile.com/1496988080458" controls autoplay muted preload="auto" width="100%" height="100%" >
HTML5 Video is required for this demo. 您的浏览器不支持播放 HTML5 视频。
  </video>
</div>

使用我们的「LeanTodo」微信小程序和网页应用，可以实际体验以上视频所演示的效果，步骤如下：

1. 微信扫码，添加小程序「LeanTodo」；<br/>
  <img src="images/leantodo-weapp-qr.png" width="150" height="150"> 
1. 进入小程序，点击首页左下角 **设置** > **账户设置**，输入便于记忆的用户名和密码；
1. 使用浏览器访问 <https://leancloud.github.io/leantodo-vue/>，输入刚刚在小程序中更新好的账户信息，点击 **Login**；
1. 随意添加更改数据，查看两端的同步状态。

{{ docs.note("注意按以上顺序操作。在网页应用中使用 Signup 注册的账户无法与小程序创建的账户相关联，所以如果颠倒以上操作顺序，则无法观测到数据同步效果。 ") }}

[LiveQuery 公开课](http://www.bilibili.com/video/av11291992/) 涵盖了许多开发者关心的问题和解答。

## 启用 LiveQuery

进入 [控制台 > 存储 > 设置 > 其他](/dashboard/storage.html?appid={{appid}}#/storage/conf)，勾选 「启用 LiveQuery」才可以在 SDK 中创建和使用，否则会报错。

```objc
// LiveQuery 需要依赖即时通讯模块，接入该模块的方法请参考安装指南：
// https://leancloud.cn/docs/sdk_setup-objc.html
// 请在 Podfile 中添加 pod 'AVOSCloudLiveQuery'，并执行 pod install 来集成。
[AVOSCloud setApplicationId:@"{{appid}}"
                  clientKey:@"{{appkey}}"];
```
```java
// LiveQuery 需要依赖即时通讯模块，所以需要在 AndroidManifest.xml 文件里面配置如下内容：
 <!-- 即时通讯模块、推送、LiveQuery（均需要加入以下声明） START -->
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

// 然后再调用初始化接口
AVOSCloud.initialize(this,"{{appid}}","{{appkey}}");
```
```js
// 如果在支持 CommonJS 环境中（如 Node.js，Webpack）使用：
// var AV = require('leancloud-storage/live-query');

// 如果在浏览器中使用 script 标签的方式，需要引入 av-live-query-min.js：
// 推荐使用 CDN：
<script src="//cdn.jsdelivr.net/npm/leancloud-storage@{{jssdkversion}}/dist/av-live-query-min.js"></script>

更多环境下的安装方式，请参考 [JavaScript SDK 安装文档](sdk_setup-js.html)。

{{ parts.debugLiveQuery(true) }}
```
```cs
// LiveQuery 需要依赖即时通讯模块，接入该模块的方法请参考安装指南： 
// C# SDK 安装指南：https://leancloud.cn/docs/sdk_setup-dotnet.html#_NET_Framework
// Unity SDK 安装指南：https://leancloud.cn/docs/sdk_setup-dotnet.html#Mono_for_Unity
 
string appId = "{{appid}}";
string appKey = "{{appkey}}";
Websockets.Net.WebsocketConnection.Link();
var realtime = new AVRealtime(appId, appKey);
AVRealtime.WebSocketLog(Console.WriteLine);
AVClient.HttpLog(Console.WriteLine);
```

{#
请确保安装 SDK 的时候已经引入了即时通讯服务的相关模块，详细请查询对应文档：

- [iOS SDK 安装指南 - 即时通讯模块](sdk_setup-objc.html)
- [Android SDK 安装指南 - 即时通讯模块](sdk_setup-android.html)
- [C# SDK 安装指南 - 即时通讯模块](sdk_setup-dotnet.html#_NET_Framework)
- [Unity SDK 安装指南 - 即时通讯模块](sdk_setup-dotnet.html#Mono_for_Unity)
#}

## 构建查询
LiveQuery 基于 AVQuery 的查询条件来精准同步数据。下面以一个 Todo 应用为例，当在网页上勾选了一条 Todo 将它标记为已完成状态，手机上将立刻同步这个操作。

首先创建 2 个针对 Todo 的查询，一个查询正在进行中的 Todo，而另一个是查询已完成的：

```objc
AVQuery *doingQuery = [AVQuery queryWithClassName:@"Todo"];
AVQuery *doneQuery  = [AVQuery queryWithClassName:@"Todo"];
[doingQuery whereKey:@"state" equalTo:@"doing"];
[doneQuery  whereKey:@"state" equalTo:@"done"];
```
```java
// 正在进行中的 Todo
AVQuery<AVObject> doingQuery = new AVQuery<>("Todo");
doingQuery.whereEqualTo("state", "doing");

// 已完成的 Todo
AVQuery<AVObject> doneQuery = new AVQuery<>("Todo");
doneQuery.whereEqualTo("state", "done");
```
```js
// 正在进行中的 Todo
var doingQuery = new AV.Query('Todo').equalTo('state', 'doing');
// 已完成的 Todo
var doneQuery = new AV.Query('Todo').equalTo('state', 'done');
```
```cs
// 正在进行中的 Todo
var doingQuery = new AVQuery<AVObject>("Todo").WhereEqualTo("state", "doing");
// 已完成的 Todo
var doneQuery = new AVQuery<AVObject>("Todo").WhereEqualTo("state", "done");
```

## 主动拉取

一般来说用户打开页面之后，客户端第一次需要主动执行一次查询，用来做列表展示：

```objc
[doingQuery findObjectsInBackgroundWithBlock:^(NSArray * _Nullable objects, NSError * _Nullable error) {
    /* Doing list did fetch. */
}];
```
```java
AVQuery<AVObject> doingQuery = new AVQuery<>("Todo");
doingQuery.whereEqualTo("state", "doing");
doingQuery.findInBackground(new FindCallback<AVObject>() {
  @Override
  public void done(List<AVObject> parseObjects, AVException parseException) {
    // 符合查询条件的 Todo
  }
});
```
```js
doingQuery.find().then(function(doingList) {
  // 展示 doingList
});
```
```cs
// 假设 doingList 对应的是某一个列表控件绑定的数据源
var doingList = new List<AVObject>();
var doing = await doingQuery.FindAsync();
doingList = doing.ToList();
```

## 订阅数据变更 - 核心用法

LiveQuery 的核心用法就是定义了一个查询，然后订阅符合这个查询条件的对象的变化。例如，将一个叫 「购买移动电源」的Todo 从正在进行变为已完成，需要这两步：

第一、从正在进行的列表里面移除「购买移动电源」
第二、将「购买移动电源」添加到已完成

没有 LiveQuery 之前，我们需要让客户端定时拉取或者提醒用户主动刷新来更新界面，而用了 LiveQuery 之后，通过其提供的订阅方式就可以依赖服务端发起的数据同步来刷新界面，这样既减少了界面上的提示，也降低了设置定时器的麻烦。

```objc
/* 导入 LiveQuery 模块 */
#import <AVOSCloudLiveQuery/AVOSCloudLiveQuery.h>

self.doingLiveQuery = [[AVLiveQuery alloc] initWithQuery:doingQuery];
self.doingLiveQuery.delegate = self;
[self.doingLiveQuery subscribeWithCallback:^(BOOL succeeded, NSError * _Nonnull error) {
    /* Subscribed. */
}];
#pragma mark - LiveQuery delegate methods
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidCreate:(id)object {
    if (liveQuery == self.doingLiveQuery) {
        /* A new doing task did create. */
    }
}
```
```java
AVLiveQuery doingLiveQuery = AVLiveQuery.initWithQuery(doingQuery);
doingLiveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void done(AVLiveQuery.EventType eventType, AVObject avObject, List<String> updateKeyList) {
    // 事件回调，有更新后会调用此回调函数
  }
});
doingLiveQuery.subscribeInBackground(new AVLiveQuerySubscribeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 订阅成功
    }
  }
});
```
```js
doingQuery.subscribe().then(function(liveQuery) {
  liveQuery.on('create', function(newDoingItem) {
    // add newDoingItem to doingList
  });
});
```
```cs
var livequery = await doingQuery.SubscribeAsync();
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "create")
    {
        doingList.Add(e.Payload);
    }
};
```

请注意上述的关键代码是订阅操作：

```objc
[self.doingLiveQuery subscribeWithCallback:^(BOOL succeeded, NSError * _Nonnull error) {
    /* Subscribed. */
}];
```
```java
doingLiveQuery.subscribeInBackground(new AVLiveQuerySubscribeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 订阅成功
    }
  }
});
```
```js
doingQuery.subscribe().then(function(liveQuery) {
    // liveQuery 是 doingQuery 的订阅
});
```
```cs
var livequery = await doingQuery.SubscribeAsync();
```

开启订阅之后，符合查询条件的数据产生的变化类型有以下几种：

- `create`： 符合查询条件的对象创建
- `update`： 符合查询条件的对象属性修改
- `enter` ： 对象被修改后，从不符合查询条件变成符合。
- `leave` ： 对象被修改后，从符合查询条件变成不符合。
- `delete`： 对象删除
- `login` ： 只对 `_User` 对象有效，表示用户登录

因此在得到 LiveQuery 的消息通知的时候一定要区分变化类型。

### 新增一条未完成 - create

首先启动 app 之后，页面上已经显示了当前已完成的一些 Todo，当另一客户端恰巧在这个时候添加一条全新的未完成的 Todo：

```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo"];
todo[@"state"] = @"doing";
[todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    /* Saved. */
}];
```
```java
AVObject todo = new AVObject("Todo");
todo.put("state", "doing");
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 保存成功
    }
  }
});
```
```js
var testObj = new AV.Object('Todo');
testObj.set('state','doing');
testObj.save();
```
```cs
var testObj = new AVObject("Todo");
testObj["state"] = "doing";
await testObj.SaveAsync();
```

那么当前客户端就会接收到 `create` 的数据同步：

```objc
#pragma mark - LiveQuery delegate methods
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidCreate:(id)object {
    if (liveQuery == self.doingLiveQuery) {
        /* A new doing task did create. */
    }
}
```
```java
liveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void onObjectCreated(AVObject avObject) {
    // avObject 即为新添加的数据
  }
});
```
```js
doingQuery.subscribe().then(function(liveQuery) {
  liveQuery.on('create', function(newDoingItem) {
    // add newDoingItem to doingList
  });
});
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "create")
    {
        doingList.Add(e.Payload);
    }
};
```

### 标题修改 - update
我们订阅了未完成的 Todo，但是在另一端某一条未完成的标题修改了，但是它仍然处于未完成状态，状态 state 字段并未修改，因此不影响它依然属于符合订阅的查询条件：


```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo" objectId:@"5915bb92a22b9d005804a4ee"];
todo[@"title"] = @"新的标题";
[todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    /* Saved. */
}];
```
```java
AVObject todo = AVObject.createWithoutData("Todo", "5915bb92a22b9d005804a4ee");
todo.put("title", "新的标题");
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 保存成功
    }
  }
});
```
```js
var oneDoing = AV.Object.createWithoutData('Todo','5915bb92a22b9d005804a4ee');
oneDoing.set('title','新的标题');
oneDoing.save();
```
```cs
// 假设有一条未完成的 Todo 的 objectId 5915bb92a22b9d005804a4ee
var oneDoing = AVObject.CreateWithoutData("Todo", "5915bb92a22b9d005804a4ee");
oneDoing["title"] = "修改标题";
await oneDoing.SaveAsync();
```

当前客户端只需要监听 `update` 类型事件就可以实现数据同步：

```objc
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidUpdate:(id)object updatedKeys:(NSArray<NSString *> *)updatedKeys {
    for (NSString *key in updatedKeys) {
        NSLog(@"%@: %@", key, object[key]);
    }
}
```
```java
liveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void onObjectUpdated(AVObject avObject, List<String> updateKeyList) {
      // avObject 即为被修改的 AVObject，updateKeyList 为被修改的 key 值
  }
});
```
```js
liveQuery.on('update', function(updatedDoingItem, updatedKeys) {
  // 将 doingList 中对应的 doingItem 替换成 updatedDoingItem
});
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "update")
    {
        foreach(var key in e.Keys)
        {
            // 变更的列名
            if(key == "title")
            {
                // 获取对应的标题
                var title = e.Payload.Get<string>(key);
            }
        }
    }
};
```

### 已完成转为未完成 - enter 
另一端将一条**已完成**修改为**未完成**：

```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo" objectId:@"591672df2f301e006b9b2829"];
todo[@"state"] = @"doing";
[todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    /* Saved. */
}];
```
```java
AVObject todo = AVObject.createWithoutData("Todo", "591672df2f301e006b9b2829");
todo.put("state", "doing");
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 保存成功
    }
  }
});
```
```js
var todo = new AV.Object.createWithoutData('Todo','591672df2f301e006b9b2829');
todo.set('state','doing');
todo.save();
```
```cs
// 假设有一条已完成的 objectId 591672df2f301e006b9b2829 
var anotherDone = AVObject.CreateWithoutData("Todo", "591672df2f301e006b9b2829");
anotherDone["state"] = "doing";
await anotherDone.SaveAsync();
```

当前客户端需要监听 `enter` 类型事件来实现数据同步：

```objc
#pragma mark - LiveQuery delegate methods
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidEnter:(id)object updatedKeys:(nonnull NSArray<NSString *> *)updatedKeys {
    if (liveQuery == self.doingLiveQuery) {
        /* A todo did change to doing from other state. */
    }
}
```
```java
liveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void onObjectEnter(AVObject avObject, List<String> updateKeyList) {
    // avObject 即为被修改的 AVObject，updateKeyList 为被修改的 key 值
  }
});
```
```js
liveQuery.on('enter', function(updatedDoingItem, updatedKeys) {
  // 将 doingList 中对应的 doingItem 替换成 updatedDoingItem
});
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if (e.Scope == "enter")
    {
      doingList.Add(e.Payload);
    }
};
```

请明确区分 `create` 和 `enter` 的不同行为：

 - `create`：对象从无到创建，并且符合查询条件。
 - `enter`：对象原来就存在，但是修改之前不符合查询条件，修改之后符合了查询条件。


### 未完成标记为已完成 - leave 

另一端将一条**未完成**修改为**已完成**：

```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo" objectId:@"591672df2f301e006b9b2829"];
todo[@"state"] = @"done";
[todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    /* Saved. */
}];
```
```java
AVObject todo = AVObject.createWithoutData("Todo", "591672df2f301e006b9b2829");
todo.put("state", "done");
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 保存成功
    }
  }
});
```
```js
var todo = new AV.Object.createWithoutData('Todo','591672df2f301e006b9b2829');
todo.set('state','done');
todo.save();
```
```cs
var willDone = AVObject.CreateWithoutData("Todo", "591672df2f301e006b9b2829");
willDone["state"] = "done";
await willDone.SaveAsync();
```

与 `enter` 相反，当对象从符合条件变为不符合条件的时候，LiveQuery 会得到一条数据同步：

```objc
#pragma mark - LiveQuery delegate methods
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidLeave:(id)object updatedKeys:(nonnull NSArray<NSString *> *)updatedKeys {
    if (liveQuery == self.doingLiveQuery) {
        /* A todo did change to other state from doing. */
    }
}
```
```java
liveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void onObjectLeave(AVObject avObject, List<String> updateKeyList) {
    // avObject 即为被修改的 AVObject，updateKeyList 为被修改的 key 值
  }
});
```
```js
liveQuery.on('leave', function(leftDoingItem, updatedKeys) {
  // remove leftDoingItem from doingList
});
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "leave")
    {
        var done = doingList.First(todo => todo.ObjectId == e.Payload.ObjectId);
        if(done != null)
        {
            doingList.Remove(done);
        }
    }
}
```

### 删除一个符合查询条件的对象 - delete

另一端将一条**未完成**直接删除，代码如下：

```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo" objectId:@"591d9b302f301e006be22c83"];
[todo deleteInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
    /* Deleted. */
}];
```
```java
AVObject todo = AVObject.createWithoutData("Todo", "591672df2f301e006b9b2829");
todo.deleteInBackground(new DeleteCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      // 保存成功
    }
  }
});
```
```js
var todo = new AV.Object.createWithoutData('Todo','591d9b302f301e006be22c83');
todo.delete();
```
```cs
var willDelete = AVObject.CreateWithoutData("Todo", "591d9b302f301e006be22c83");
await willDelete.DeleteAsync();
```


LiveQuery 会得到一条数据同步：

```objc
#pragma mark - LiveQuery delegate methods
- (void)liveQuery:(AVLiveQuery *)liveQuery objectDidDelete:(id)object {
    /* A todo has been deleted. */
}
```
```java
liveQuery.setEventHandler(new AVLiveQueryEventHandler() {
  @Override
  public void onObjectDeleted(String objectId) {
    // objectId 即为被删除的 AVObject 的 id
  }
});
```
```js
liveQuery.on('delete', function(deletedDoingItem, updatedKeys) {
  // remove deletedDoingItem from doingList
});
```
```cs
livequery.OnLiveQueryReceived += (sender, e) => 
{
    if(e.Scope == "delete")
    {
        var done = doingList.First(todo => todo.ObjectId == e.Payload.ObjectId);
        if(done != null)
        {
            doingList.Remove(done);
        }
    }
}
```

{# 2017-06-09 时序图涉及存储和 IM 的关系，会加大用户的理解难度，先取消。#}
{# ## LiveQuery 服务的时序图

![livequery-seq](images/livequery-seq.svg)
#}

## 常见问题

- 开发者对 LiveQuery 的用法容易产生哪些误解？

  因为 LiveQuery 的实时性，很多用户会陷入一个误区，试着用 LiveQuery 来实现一个简单的聊天功能。我们不建议这样做，因为使用 LiveQuery 构建聊天服务会承担额外的存储成本，产生的费用会增加，并且后期维护的难度非常大（聊天记录，对话维护之类的代码会很混乱），并且 LeanCloud 已经提供了即时通讯的服务。LiveQuery 的核心还是提供一个针对查询的推拉结合的用法，脱离设计初衷容易造成前端的模块混乱。




