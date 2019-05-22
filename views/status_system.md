{% set autoFollowFolloweeOptionLink = "如果在 [控制台 > 存储 > 设置 > 其他](/dashboard/storage.html?appid={{appid}}#/storage/conf) 勾选了 **应用内社交模块，关注用户时自动反向关注**" %}
# 应用内社交模块
应用内社交，又称「事件流」，在应用开发中出现的场景非常多，包括用户间关注（好友）、朋友圈（时间线）、状态、互动（点赞）、私信等常用功能。


## 基本概念

### Status

Status 是指一条广义上的「状态」，它不仅可以表示某个用户更新了状态，还可以表示任意的一个事件，比如某人发布了一篇文章，某个图片被赞等等。在控制台中对应的表名称为 `_Status`。该表只有在开发者使用了相应的 API 成功发送了一条状态之后才会出现在 Class 列表中。

需要注意，**存入 `_Status` 表中的数据无法修改，任何对已存在记录的更新操作都会报错。**就像微博、微信朋友圈之类的系统不允许对已发布的内容进行修改一样，我们对 `_Status` 表中的记录也应用了同样的逻辑，即如需修改，只能删除老记录，添加新记录。

如果业务的确要求状态的内容可以更改，请将可变的内容/字段放入自建的表中维护，并通过 `_Status` 表记录的 objectId 来建立关联。

### Follower/Followee
分别表示用户的粉丝和用户的关注，在控制台中对应着两张表 `_Follower` 和 `_Followee`。

### 特别提示
发了一条状态，并不代表会自动发送了一条推送消息，开发者可以自由控制是否使用推送。更多信息请参考 [消息推送开发指南](./push_guide.html)。

## JavaScript SDK

### 用户关系

AV.User 新增两个方法 `follow` 和 `unfollow` 来建立用户关系，你可以关注某个用户：

```javascript
AV.User.current().follow('52f9be45e4b035debf88b6e2').then(function(){
  //关注成功
}, function(err){
  //关注失败
  console.dir(err);
});
```

`follow` 方法接收一个 AV.User 对象或者 User 对象的 objectId（通过 user.id 拿到）。

取消关注使用 `unfollow` 方法：

```javascript
AV.User.current().unfollow('52f9be45e4b035debf88b6e2').then(function(){
  //取消关注成功
}, function(err){
  //取消关注失败
  console.dir(err);
});
```

关注后，可以查询自己关注的用户列表，使用 `AV.User#followeeQuery` 得到一个 `AV.Query`对象来查询关注的用户列表：

```javascript
var query = AV.User.current().followeeQuery();
query.include('followee');
query.find().then(function(followees){
  //关注的用户列表 followees
});
```

followee 是一个 Pointer 类型，通过 `include` 将它的所有信息查询包括进来，否则只会返回用户的 id。当查询计数的时候（使用 `AV.Query#count` 方法）不建议 `include`。

查询自己的粉丝（他人关注了我，他人就是我的粉丝），可以通过 `followerQuery` 方法：

```javascript
var query = AV.User.current().followerQuery();
query.include('follower');
query.find().then(function(followers){
  //粉丝列表 followers
});
```

`followerQuery` 和 `followeeQuery` 返回的 AV.Query 对象可以象普通的 [AV.Query](https://leancloud.github.io/javascript-sdk/docs/AV.Query.html) 对象那样使用，它们本质上都是查询数据管理平台中的 `_Follower` 和 `_Followee`表，你可以添加 order、skip、limit 以及其他 where 条件等信息。


### 状态

关注了用户之后（也就是成为他的粉丝），你就会接收到该用户发送给他的粉丝的状态信息。例如，我喜欢了某个视频，我可以发送这条信息「我喜欢了视频 xxxx」给我的粉丝。我的粉丝就可以在他们的收件箱（inbox）里收到这条状态信息。

#### 发布状态

当前登录用户发送一条状态给关注他的粉丝：

```javascript
var status = new AV.Status('视频url', '我喜欢了视频xxxx.');
status.set('sound', 'sound.wmv');
AV.Status.sendStatusToFollowers(status).then(function(status){
  //发布状态成功，返回状态信息
  console.dir(status);
}, function(err){
  //发布失败
  console.dir(err);
});
```

发布状态成功，粉丝的收件箱不一定马上能看到，因为发布过程是一个异步的过程，会有一定的延迟，通常这个延迟都在几秒之内。发送状态必须处于用户登录状态，使用 `AV.Status.sendStatusToFollowers` 将发送给登录用户的粉丝。

AV.Status 对象包含下列属性：

属性|说明
---|---
id|对象的objectId
messageId|状态在某个用户收件箱的消息编号，发件箱返回的 status 则没有此属性，messageId 可用于 [收件箱的分页查询](#查询收件箱)。
inboxType|收件箱类型，默认是 timeline 收件箱，也就是 default。SDK 默认提供 private(私信)，default 表示 timeline，你也可以自定义。
data|状态属性，一个 JSON 对象，可通过 get 和 set 方法获取和设置。
createdAt|消息的创建时间

其中 data.source 属性是保留属性，默认指向状态的发布者。

#### 发送私信给某个用户

我还可以发送一条私信给单独某个用户：

```javascript
var status = new AV.Status(null, '机密消息');
AV.Status.sendPrivateStatus(status,'52f9be45e4b035debf88b6e2').
  then(function(status){
    //发送成功
    console.dir(status);
  }, function(err){
    //发布失败
    console.dir(err);
});
```

`AV.Status.sendPrivateStatus` 的第二个参数指定私信接收的用户或者用户的 objectId。

#### 发送给自定义收件箱

通过 `send` 方法还可以自定义 inboxType：

```javascript
var status = new AV.Status(null, '我读了《clojure 编程乐趣》');
//定义一个 book 收件箱
status.inboxType = 'book';
status.send().then(function(status){
  //发送成功
});
```

#### 查询收件箱

查询我的 timeline 收件箱，可以通过 `AV.Status.inboxQuery` 方法：

```javascript
var query = AV.Status.inboxQuery(AV.User.current());
query.find().then(function(statuses){
  //查询成功，返回状态列表，每个对象都是 AV.Status
}, function(err){
  //查询失败
  console.dir(err);
});
```

收件箱返回的 status 列表，每个 status 都有 messageId 属性，表示这条 status 在这个收件箱里的唯一编号，`AV.InboxQuery` 有两个方法用于限制 messageId 的范围：

- **sinceId**：设定查询返回的 status 的 messageId 必须**大于**传入的 messageId。
- **maxId**：限定查询返回的 status 的 messageId 必须小于等于传入的 messageId。

通过 sinceId 和 maxId 可以实现分页查询：

查询本次查询之后新增的 status（向后翻页刷新）:

```javascript
//假设 messageId 是上次查询返回的 status 的最大 messageId 编号
var messageId = ...
var query = AV.Status.inboxQuery(AV.User.current());
query.sinceId(messageId);
//查询从上次查询返回结果之后的更新 status
query.find().then(function(statuses){
  //查询成功，返回状态列表，每个对象都是 AV.Status
}, function(err){
  //查询失败
  console.dir(err);
});
```

查询本次查询的前一页（也就是更老的 status，向前翻页）：

```javascript
//假设 messageId 是上次查询返回的 status 的最大 messageId 编号
var messageId = ...
var query = AV.Status.inboxQuery(AV.User.current());
query.maxId(messageId);
```

`AV.Status.inboxQuery` 还可以指定收件箱的类型，默认是查询 timeline 收件箱，也可以查询私信收件箱：

```javascript
var query = AV.Status.inboxQuery(AV.User.current(), 'private');
```

#### 查询收件箱未读状态数目

使用 `AV.Status.countUnreadStatuses` 可以查询某个收件箱的未读状态数目和总数目：

```javascript
AV.Status.countUnreadStatuses(AV.User.current()).then(function(result){
  console.dir(result);
  var total = result.total;
  var unread  = result.unread;
}, function(err){
    //查询失败
});
```

同样的，你可以这样查询当前登录用户未读私信的未读数目和总数目：

```javascript
AV.Status.countUnreadStatuses(AV.User.current(),'private').then(function(result){
  console.dir(result);
  var total = result.total;
  var unread  = result.unread;
}, function(err){
    //查询失败
});
```

#### 查询发件箱

查询我发出去的状态信息，可以通过 `statusQuery` 方法：

```javascript
var query = AV.Status.statusQuery(AV.User.current());
query.find().then(function(statuses){
  //查询成功，返回状态列表，每个对象都是 AV.Object
}, function(err){
  //查询失败
  console.dir(err);
});
```

`AV.Status.statusQuery` 返回的是一个普通的 AV.Query 对象，本质上是查询数据管理平台的 `_Status` 表。你可以自主添加更多查询条件。

## iOS SDK

SDK 的安装参考 [Objective-C 安装指南](sdk_setup-objc.html)。

### 好友关系

#### 关注/取消关注

当前登录用户可以关注某人：

```
NSString *userObjectId = @"XXXXXX";
//关注
[[AVUser currentUser] follow:userObjectId andCallback:^(BOOL succeeded, NSError *error) {
}];
//取消关注
[[AVUser currentUser] unfollow:userObjectId andCallback:^(BOOL succeeded, NSError *error) {
}];
```

如果在 {{ autoFollowFolloweeOptionLink }}，那么在当前用户关注某个人，那个人也会自动关注当前用户。

从 2.6.7 版本开始，我们允许在 follow 的时候同时传入一个 attribute 列表，用于设置关系的属性，这些属性都将在 `_Follower` 和 `_Followee` 表同时存在：

```objc
   NSDictionary * attrs = ……
   [[AVUser currentUser] follow:userObjectId userDictionary:attrs andCallback:^(BOOL succeeded, NSError *error) {
	    //处理结果
    }];
```

#### 获取粉丝/关注列表

有两个特殊的 `AVQuery`：

```objc
//粉丝列表查询
AVQuery *query= [AVUser followerQuery:@"USER_OBJECT_ID"];

//关注列表查询
AVQuery *query= [AVUser followeeQuery:@"USER_OBJECT_ID"];
```

`followerQuery` 和 `followeeQuery` 返回的 AVQuery 可以增加其他查询条件，只要在 `_Followee` 和 `_Follower` 表里存在的属性都可以作为查询或者排序条件。

默认的查询得到的 AVUser 对象仅仅有 ObjectId 数据，如果需要**整个 AVUser 对象所有属性，则需要调用 include 方法**。例如：

```objc
AVQuery *query= [AVUser followeeQuery:@"USER_OBJECT_ID"];
[query includeKey:@"followee"];
```

分别获得某个用户的粉丝和关注，我们也可以同时取得这两种：

```objc
[[AVUser currentUser] getFollowersAndFollowees:^(NSDictionary *dict, NSError *error) {
    NSArray *followers=dict[@"followers"];
    NSArray *followees=dict[@"followees"];
}];
```

### 状态

#### 发布状态

发布一条时间线状态，即发一条我的粉丝可以看到的状态：

```objc
AVStatus *status=[[AVStatus alloc] init];

status.data=@{@"text":@"data type change"};

[AVUser logInWithUsername:@"travis" password:@"123456"];
[AVStatus sendStatusToFollowers:status andCallback:^(BOOL succeeded, NSError *error) {
    NSLog(@"============ Send %@", [status debugDescription]);
}];
```

其中 `status.data` 可以任意指定 NSDictionary 数据。注意，这个字典中的 **source  为系统保留字段**，不可使用。

#### 发私信

给某个用户发私信也非常简单：

```objc
AVStatus *status=[[AVStatus alloc] init];
status.data=@{@"text":@"this is a private message"};

NSString *userObjectId=@"XXXXXXXXXXXXX";

[AVStatus sendPrivateStatus:status toUserWithID:userObjectId andCallback:^(BOOL succeeded, NSError *error) {
    NSLog(@"============ Send %@", [status debugDescription]);
}];
```

#### 自定义状态

除了上面常见两种场景，自定义状态可以通过设置**受众群体和发送者**来实现更加灵活的功能。

```objc
AVStatus *status=[[AVStatus alloc] init];
[status setData:@{@"text":@"we have new website, take a look!",@"link":@"http://leancloud.cn"}];

status.type=@"system";

AVQuery *query=[AVUser query];
[query whereKey:@"age" equalTo:@(20)];
[status setQuery:query];

[status sendInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

}];
```

上面是系统广播的基本实现。因为指定了一个 AVUser 查询，所以会发送给所有 `age=20` 的用户，指定了 `type` 是 system 或者任意字符串，则所有用户会在查询这个类型的状态中看到这一条。

#### 获取状态

下面代码会获取用户时间线上的 50 条状态：

```objc
AVStatusQuery *query=[AVStatus inboxQuery:kAVStatusTypeTimeline];

//限制50条
query.limit=50;

//限制 1397 这个 messageId 上次查询的最大 messageId，如果不设置，默认为最新的
query.maxId=1397;

//需要同时附带发送者的数据
[query includeKey:@"source"];

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    //获得 AVStatus 数组
}];
```

同理，可以获得用户的私信，只要把参数改为 `kAVStatusTypePrivateMessage`。返回的 AVStatus 对象有一个 messageId 属性，用于唯一表示这条 Status 在这个 inbox 里的标示符。可以用这个 id 结合 query 做分页查询。

AVStatusQuery 可以设置 sinceId 和 maxId：

- **sinceId**：设定查询返回的 status 的 messageId 必须**大于**传入的 messageId。
- **maxId**：限定查询返回的 status 的 messageId 必须小于等于传入的 messageId。

使用这两个 Id 就可以做分页查询。AVStatusQuery 查询**不支持 skip**。

获取收件箱的未读 status 数目（从上次访问收件箱最新 status 到现在的未读 status 数目）可以使用 `[AVStatus getUnreadStatusesCountWithType:andCallback]` 方法。

下面的代码是某个用户发送出去的状态。**查询发送出去的状态，是无法用 `messageId(sinceId,maxId)` 来做分片查询的**。因为 messageId 只是相对于某个用户的 Inbox 才有意义， 同时返回的状态中也没有 messageId 的数据。

```objc
AVStatusQuery *query=[AVStatus statusQuery];

//设置查询某个用户，默认是查询当前用户
[query whereKey:@"source" equalTo:<AVUser>];

//限制条数
query.limit=20;

//设置消息类型
query.inboxType=kAVStatusTypeTimeline;

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    //获得 AVStatus 数组
}];
```

## Android SDK

SDK 的安装参考 [Android 安装指南](sdk_setup-android.html)。

### 好友关系

#### 关注和取消关注

登录的用户可以关注其他用户，成为他们的粉丝，例如：

```java
//关注
AVUser.getCurrentUser().followInBackground(userObjectId, new FollowCallback() {
        @Override
        public void done(AVObject object, AVException e) {
            if (e == null) {
                Log.i(TAG, "follow succeeded.");
            } else if (e.getCode() == AVException.DUPLICATE_VALUE) {
                Log.w(TAG, "Already followed.");
            }
        }
    });

//取消关注
AVUser.getCurrentUser().unfollowInBackground("the user object id", new FollowCallback() {
        @Override
        public void done(AVObject object, AVException e) {
            if (e == null) {
                Log.i(TAG, "unfollow succeeded.");
            } else {
                Log.w(TAG, "unfollow failed.");
            }
        }
    });
```

如果在 {{ autoFollowFolloweeOptionLink }}，那么在当前用户关注某个人，那个人也会自动关注当前用户。

从 2.6.7 版本开始，我们允许在 follow 的时候同时传入一个 attribute 列表，用于设置关系的属性，这些属性都将在 `_Follower` 和 `_Followee` 表同时存在：

```java
Map<String, Object> attributes = ......
AVUser.getCurrentUser().followInBackground("target user objectId", attributes, new FollowCallback{
            @Override
            public void done(AVObject object, AVException e) {
                  //处理结果
            }
});
```

#### 获取粉丝和关注列表

你可以使用 `followerQuery` 或 `followeeQuery` 来查询你的粉丝或关注列表，这样可以设置更多的查询条件，比如：

```java
// 其中 userA 是 AVUser 对象，你也可以使用 AVUser 的子类化对象进行查询
// vhaxun 粉丝
AVQuery<AVUser> followerQuery = userA.followerQuery(AVUser.class);
// AVQuery<AVUser> followerQuery = AVUser.followerQuery(userA.getObjectId(),AVUser.class); 也可以使用这个静态方法来获取非登录用户的好友关系
followerQuery.findInBackground(new FindCallback<AVUser>() {
    @Override
    public void done(List<AVUser> avObjects, AVException avException) {
        // avObjects 包含了 userA 的粉丝列表
    }
});

//查询关注者
AVQuery<AVUser> followeeQuery = AVUser.followeeQuery(userB.getObjectId(), AVUser.class);
//AVQuery<AVUser> followeeQuery = userB.followeeQuery(AVUser.class);
followeeQuery.findInBackground(new FindCallback<AVUser>() {
    @Override
    public void done(List<AVUser> avObjects, AVException avException) {
        //avObjects 就是用户的关注用户列表

    }
});
```

通过 AVQuery，你也可以增加 `skip` 或者 `limit` 操作来分页查询，比如：

```java
    AVQuery<AVUser> followerSkipQuery = AVUser.followerQuery(userA.getObjectId(), AVUser.class);
    followerSkipQuery.setLimit(50);
    followerSkipQuery.skip(100);
    followerSkipQuery.findInBackground(new FindCallback<AVUser>() {
        @Override
        public void done(List<AVUser> avObjects, AVException avException) {
            // avObjects.size() == 1
        }
    });
}
```

你也可以查找某个特定的粉丝，比如：

```java
AVQuery<AVUser> followerNameQuery = userA.followerQuery(userA.getObjectId(), AVUser.class);
followerNameQuery.whereEqualTo("follower", userC);
followerNameQuery.findInBackground(new FindCallback<AVUser>() {
    @Override
    public void done(List<AVUser> avObjects, AVException avException) {
        // avObjects 中应当只包含 userC
    }
});
```

总之 `followerQuery` 和 `followeeQuery` 返回的 AVQuery 可以增加其他查询条件，只要在 `_Followee` 和 `_Follower` 表里存在的属性都可以作为查询或者排序条件。


默认的得到的 AVUser 对象仅仅有 ObjectId 数据，如果需要整个 AVUser 对象所有属性，则需要调用 include方法。例如：

```java
AVQuery<AVUser> followerNameQuery = AVUser.followerQuery(userA.getObjectId(), AVUser.class);
followerNameQuery.include("follower");

AVQuery<AVUser> followeeNameQuery = AVUser.followeeQuery(userA.getObjectId(), AVUser.class);
followerNameQuery.include("followee");
```

##### 一次性获取粉丝和关注列表

```java
    AVFriendshipQuery query = AVUser.friendshipQuery(userId, SubUser.class);
    query.include("followee");
    query.include("follower");
    query.getInBackground(new AVFriendshipCallback() {
      @Override
      public void done(AVFriendship friendship, AVException e) {
        List<SubUser> followers = friendship.getFollowers(); //获取粉丝
        List<SubUser> followees = friendship.getFollowees(); //获取关注列表
        AVUser user = friendship.getUser(); //获取用户对象本身
      }
    });
```

### 状态

#### 发布状态

发布一条时间线状态，即发一条我的粉丝可以看到的状态。

```java
AVStatus status= new AVStatus();
// 或者你也可以使用静态方法
// AVStatus status = AVStatus.createStatus("my image", "my message");
status.setImageUrl("myImageUrl");
status.setMessage("myMessage");
// 或者你也可以使用方法
// setData(Map<String, Object> data)

AVUser.logIn("myUserName", "myPassword");
AVStatus.sendStatusToFollowersInBackgroud(status, new SaveCallback() {
    @Override
    public void done(AVException avException) {
        Log.i(TAG, "Send status finished.");
    }
});
```

其中 `status.setData` 可以任意指定 `Map<String, Object>` 数据（map 中的 source 字段为系统保留字段，不可使用）。


#### 发私信

给某个用户发私信也非常简单：

```java
AVStatus status = AVStatus.createStatus("test image", "test message");
AVStatus.sendPrivateStatusInBackgroud(status, "user object id", new SaveCallback() {
    @Override
    public void done(AVException avException) {
        Log.i(TAG, "Send private status finished.");
    }
});
```

#### 自定义 Status

除了上面常见两种场景，自定义 Status 可以通过设置**受众群体和发送者**来实现更加灵活的功能。

```java
Map<String, Object> data = new HashMap<String, Object>();
data.put("text", "we have new website, take a look!");
data.put("link", "http://leancloud.cn");
AVStatus status = AVStatus.createStatusWithData(data);
status.setInboxType("system");

    status.sendInBackgroundWithBlock(new SaveCallback() {
        @Override
        public void done(AVException e) {
            Log.i(TAG, "Send finished");

        }
    });
```

上面是系统广播的基本实现。因为指定了一个无条件的 AVUser 查询，所以会发送给所有的用户，指定了 `inboxType` 是 system 或者任意字符串，则所有用户会在查询这个类型的状态中看到这一条。SDK 包含了两种预定类型：

- `AVStatus.INBOX_TYPE.TIMELINE`
- `AVStatus.INBOX_TYPE.PRIVATE`

#### 获取收件箱状态

获取用户收件箱内时间线上的 50 条状态：

```java
AVStatusQuery<AVStatus> inboxQuery = AVStatus.inboxQuery(AVStatus.class, userB,AVStatus.INBOX_TYPE.TIMELINE.toString());
inboxQuery.setLimit(50);  //设置最多返回 50 条状态
inboxQuery.setSinceId(0);  //查询返回的 status 的 messageId 必须大于 sinceId，默认为 0
inboxQuery.findInBackground(new InboxStatusFindCallback(){
  @Override
  public void done(final List<AVStatus> avObjects, final AVException avException) {

  }
});
```

同理，可以获得用户收件箱的私信，只要把   `type` 参数改为 `AVStatus.INBOX_TYPE.PRIVATE.toString()` 即可。

AVStatus 有一个 messageId 属性，用于标示这条 status 在 inbox 里的唯一位置。使用这个 `messageId` 结合 `AVStatusQuery` 可以做分页查询，AVStatusQuery 可以设置 `sinceId` 和 `maxId`：

- **sinceId**：设定查询返回的 status 的 messageId 必须**大于**传入的 messageId。
- **maxId**：限定查询返回的 status 的 messageId 必须小于等于传入的 messageId。

使用这两个 Id 就可以做分页查询。AVStatusQuery 查询**不支持 skip**。

从 v2.6.7 版本开始，`InboxStatusFindCallback` 提供 `isEnd()` 方法，用来**在查询后**检查收件箱查询是否已经到了最早的一页数据。

#### 获取收件箱的计数

使用 `AVStatus.getUnreadStatusesCountInBackground`方法可以查询收件箱的未读 status 数目和总 status 数目：

```java
AVStatus.getUnreadStatusesCountInBackground(AVStatus.INBOX_TYPE.TIMELINE.toString(), new CountCallback() {
        public void done(int count, AVException e) {
            if (e == null) {
                //count就是未读status数目
            } else {
                //有错误发生。
            }
        }
    });
```

#### 重置收件箱未读消息数

如果想将某个收件箱（比如 private）的未读消息数设置为 0，也就是通常看到的将全部消息设为「已读」的功能，可以调用如下函数：

```java
AVStatus.resetUnreadStatusesCount("private", new AVCallback() {
  @Override
  protected void internalDone0(Object o, AVException exception) {
    if (exception == null) {
      // 重置成功
    } else {
      // 重置失败，具体失败原因在 exception 中
    }
  }
});
```

#### 查询发件箱状态

查询当前用户发件箱内已经发送的 50 条状态：

```java
AVStatusQuery<AVStatus> query = AVStatus.statusQuery(AVStatus.class,AVUser.getCurrentUser());
query.setLimit(50);    //设置最多返回 50 条状态
query.setSinceId(0);   //查询返回的 status 的 messageId 必须大于 sinceId，默认为 0
//query.setInboxType(AVStatus.INBOX_TYPE.TIMELINE.toString()); 此处可以通过这个方法来添加查询的状态条件，当然这里你也可以用你自己定义的状态类型，因为这里接受的其实是一个字符串类型。
query.findInBackground(new FindCallback<AVStatus>(){
  @Override
  public void done(final List<AVStatus> avObjects,final AVException avException) {

  }
});
```

## REST API

本节介绍应用内社交的 REST API。

### 用户关系 API

使用这里的 API 来建立用户关系，你可以关注、取消关注某个用户。

* 这里的三个查询 API 都遵循我们的 REST API 规范，支持 `where`、`order`、`skip`、`limit`、`count`、`include` 等。如果没有特殊说明，返回的结果都是 `{results: [数组结果]}`，跟其他查询 API 保持一致。
* 用户在 `_Follower` 和 `_Followee` 表中都存储为 Pointer 类型，因此如果要查询出用户信息，应该加上 include 指定字段。

#### 关注和取消关注用户 API

通过操作 `/users/:user_id/friendship/:target_id` 资源可以关注或者取消关注某个用户，其中：

* `:user_id` 表示发起关注动作的用户的 objectId。如果设置了 `X-LC-Session` 头，则 `self` 表示当前登录用户。
* `:target_id` 表示想要关注的目标用户的 objectId。

例如，让当前用户 `51fa6886e4b0cc0b5a3792e9` 关注目标用户 `51e3a334e4b0b3eb44adbe1a`：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/friendship/51e3a334e4b0b3eb44adbe1a
```

关注后，`_Follower` 和 `_Followee` 都会多出一条记录，{{ autoFollowFolloweeOptionLink }}，会各多出两条记录。

取消关注通过：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/friendship/51e3a334e4b0b3eb44adbe1a
```

关注还可以增加一些属性：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"score": 100}' \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/friendship/51e3a334e4b0b3eb44adbe1a
```

那么 `score` 字段将同时出现在 `_Follower` 和 `_Followee` 表，可以作为查询或者排序条件。

#### 查询粉丝或者关注者列表 API

查询粉丝列表（也就是关注我的人），可以通过：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/followers
```

返回的用户列表是 Pointer 类型，如果想要将用户信息也返回，需要 include:

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=follower' \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/followers
```

查询关注的用户列表：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=followee' \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/followees
```

同时查询粉丝和关注的人：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=followee' \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/followersAndFollowees
```

结果返回：

```json
{followers: [粉丝列表], followees: [关注用户列表]}
```

如果指定 count=1，则返回结果里加上 followers_count 和 followees_count 表示粉丝数目和关注者数目：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=followee' \
  --data-urlencode 'count=1' \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/followersAndFollowees
```

### 状态 API

再次解释下术语定义：

* **status**：一条状态，包含两个预定义属性 `messageId` 和 `inboxType`，其他属性都可自定义。
* **target**：状态的目标接收者，也就是 inbox 的 owner。
* **inbox**：target 的收件箱，有 owner（所有者）和 inboxType（收件箱类型）两个属性。

#### 发布 Status API

调用 API 如下：

```
POST /statuses
```

接受的 JSON 对象参数：

属性|说明
---|---
query|查询 target 的条件，包括下列属性：<ul><li><strong>where</strong>：查询条件，可为空 `{}`，表示查询全表。</li><li><strong>className</strong>：target 的 className</li><li><strong>keys</strong>：查询指定的列作为 inbox 的 owner 属性存储，如果不指定，默认将为整个对象作为 pointer 存储到 owner。</li></ul>
data|status 的 数据 JSON 对象，用户自定义。如果包含 source（指向发送者的 Pointer），并且 inboxType 设为 default，该 status 会同时往发送者的 inbox 投递。
inboxType|字符串，指定接收这条 status 的 inbox 类型，可为空，默认为 `default`。

【示例一】往 dennis 的粉丝群体发送一条状态：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
         "data": {
            "image": "paas-files.qiniudn.comwQUf3WohbJpyuXutPjKHPmkSj4gbiYMeNJmTulNo.jpg",
            "message": "AVOS Cloud is great!"
         },
         "inboxType": "default",
         "query": {
             "className": "_Follower",
             "keys": "follower",
             "where": {
                 "user": {
                     "__type": "Pointer",
                     "className": "_User",
                     "objectId": "dennis'id"
                 }
              }
         }
      }' \
   https://{{host}}/1.1/statuses
```

这条状态的内容是 data 指定的，并且设定 inboxType 是 `default`：

```json
{
     "image": "paas-files.qiniudn.comwQUf3WohbJpyuXutPjKHPmkSj4gbiYMeNJmTulNo.jpg",
      "message": "LeanCloud is great!"
}
```

这条状态的目标用户群体是 query 指定的查询条件，查询的是 `_Follower` 表中 dennis 的粉丝用户。

【示例二】dennis 向 catty 发送私信的请求类似：

```json
{
    "data": {
        "message": "hello catty!"
    },
    "inboxType": "private",
    "query": {
        "className": "_User",
        "where": {
            "objectId": "catty's id"
        }
    }
}
```

#### 查询发出的状态 API

```
GET /statuses
```

跟查询其他对象一样。知道 objectId，查询单条状态：

```
GET /statuses/:status_id
```

#### 删除状态 API

```
DELETE /statuses/:status_id
```

#### 查询已经关注的用户的状态聚合列表 API

查询我关注的用户发出来的状态聚合而成的列表，也就是查询自己的收件箱，通过：

```
GET /subscribe/statuses
```

接收参数（参数都必须要 URL encoded）：

参数|说明
---|---
owner | JSON 序列化后的 owner 字符串，表示 inbox 所有者。
inboxType | inbox 的类型，默认为 `default`，可为空。
where  | 用于过滤 status 的 where 条件，也是 JSON 序列化后的字符串。
sinceId  | 查询返回的 status 的 messageId 必须大于 sinceId，默认为 0。
maxId  | 查询返回的 status 的 messageId 必须小于等于 maxId，默认为 0。
limit | 最多返回多少条 status，默认 100，最大 100。
count | 默认为空，设置为 "1" 表示在结果中带上 status 的 count 计数。

【示例一】查询我的主页 timeline：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis id"}' \
  https://{{host}}/1.1/subscribe/statuses
```

【示例二】查询我的最新私信列表：

```sh
    --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
    --data-urlencode 'inboxType=private'
```

【示例三】假设上次返回的最大 messageId 是 99，查询从 mesageId = 99 开始最新的 status：

```sh
    --data-urlencode 'owner={"__type":"Pointer", "className":"_User","objectId":"dennis"}' \
    --data-urlencode 'sinceId=99'
```

【示例四】查询 messageId 在 99 到 199 之间的 status：

```sh
    --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
    --data-urlencode 'sinceId=99' \
    --data-urlencode 'maxId=199'
```

【示例五】查询最新的 status，并且 status 的 image 属性存在，也就是查询包含图片的最新 status：

```sh
    --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
    --data-urlencode 'where={"image":{"$exists":true }}'
```

#### 删除收件箱里的消息

可以根据 messageId 来删除收件箱的消息：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis id"}' \
  --data-urlencode 'inboxType=default' \
  --data-urlencode 'messageId=99' \
  https://{{host}}/1.1/subscribe/statuses/inbox
```


参数|说明
---|---
owner | JSON 序列化后的 owner 字符串，表示 inbox 所有者。
inboxType | inbox 的类型，默认为 `default`，可为空。
messageId  | 想要删除的 status 的 messageId

#### 查询状态计数 API

查询 inbox 总消息数目和未读消息数目：

```
GET "/subscribe/statuses/count
```

可指定的条件：

- **owner**：JSON 序列化后的 owner 字符串，表示 inbox 所有者。
- **inboxType**：inbox 类型，默认为 `default`，可为空。

【示例一】查询我的未读消息数目：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
  https://{{host}}/1.1/subscribe/statuses/count
```

返回：

```json
{ "total": 100, "unread":20}
```

【示例二】查询私信消息数目：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
   --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
   --data-urlencode 'inboxType=private' \
   https://{{host}}/1.1/subscribe/statuses/count
```

#### 重置未读消息数

如果想将某个收件箱的未读消息数设置为 0，也就是通常看到的将全部消息设为「已读」的功能，可以通过 `resetUnreadCount` API 来实现：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
   --data-urlencode 'owner={"__type":"Pointer","className":"_User","objectId":"dennis"}' \
   --data-urlencode 'inboxType=private' \
   https://{{host}}/1.1/subscribe/statuses/resetUnreadCount
```

接收的参数与 [查询状态计数 API](#查询状态计数_API) 是一致的。


