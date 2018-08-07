# iOS / OS X 数据存储开发指南

如果还没有安装 LeanCloud iOS SDK，请阅读 [快速入门](/start.html) 来获得该 SDK，并在 Xcode 中运行和熟悉示例代码。我们的 SDK 支持 iOS 5.1.1 及更高版本。

如果想从项目中学习，请到我们的 GitHub 资源库中获取 [iOS SDK Demos](https://github.com/leancloud/leancloud-demos#ios) 。其中，我们推荐与这个指南配套的 [LeanStorageDemo](https://github.com/leancloud/LeanStorage-Demo)。

## 介绍

LeanCloud 是一个完整的平台解决方案，它为应用开发提供了全方位的后端服务。我们的目标是让开发者不需要进行后端开发及服务器运维等工作，就可以开发和发布成熟的应用。

如果熟悉像 Ruby on Rails 这样的 Web 框架，你会发现 LeanCloud 很容易上手。我们在设计 LeanCloud 时应用了许多与之相同的原则。如果你之前使用过 Parse 或类似的后端服务，那么还会发现我们的 API 尽可能与其保持兼容。我们这样设计，是为了让开发者可以轻而易举地将应用从其他服务迁移至 LeanCloud，并且能得心应手地使用我们的 SDK 进行开发。

## 快速入门

建议在阅读本文之前，先阅读 [快速入门](/start.html)，了解如何配置和使用 LeanCloud。

## SDK 安装

我们提供了一个针对 iOS / OS X SDK 详细的安装指南：[LeanCloud iOS / OS X SDK 安装指南](sdk_setup-ios.html)

## 对象

### AVObject

LeanCloud 的数据存储服务是建立在对象 --- `AVObject` 基础上的，每个 `AVObject` 包含若干属性值对（key-value，也称「键值对」），属性的值是与 JSON 格式兼容的数据。你不需要预先指定每个 `AVObject` 包含哪些属性，每个属性的数据类型是什么，只要直接设定属性值对即可，你还可以随时增加新的属性。

假如我们要实现一个类似于微博的社交 app，主要有三类数据：账户、帖子、评论。以微博帖子为例，我们可以建立一个类名为 `Post` 的 `AVObject` 对象，包含下面几个属性：

``` 
content: "每个 Objective-C 程序员必备的 8 个开发工具", pubUser: "LeanCloud官方客服", pubTimestamp: 1435541999
```

属性名（也称「键」，key），必须是由字母、数字或下划线组成的字符串；自定义的属性名，不能以 `__`（双下划线）开头。属性值，可以是字符串、数字、布尔值，或是数组和字典。

**注意：以下为系统保留字段，不能作为属性名来使用。**

``` 
acl             error            pendingKeys
ACL             fetchWhenSave    running
className       id               updatedAt
code            isDataReady      uuid
createdAt       keyValues
description     objectId
```

每个 `AVObject` 都必须有一个类（Class）名称，以便区分不同类型的数据。例如，微博帖子这个对象可取名为 `Post`。

我们建议将类和属性名分别按照 `NameYourClassesLikeThis` 和 `nameYourKeysLikeThis` 这样的惯例来命名，即区分第一个字母的大小写，这样可以提高代码的可读性和可维护性。

### 保存对象

接下来，需要将上文中的 `Post` 存储到 LeanCloud 上。LeanCloud 的相关接口和 `NSMutableDictionary` 类似，但只有在调用 `save` 方法时，数据才会被真正保存下来。

``` objc
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"每个 Objective-C 程序员必备的 8 个开发工具" forKey:@"content"];
[post setObject:@"LeanCloud官方客服" forKey:@"pubUser"];
[post setObject:[NSNumber numberWithInt:1435541999] forKey:@"pubTimestamp"];
[post save];
```

或者用下标用法：

``` objc
AVObject *post = [AVObject objectWithClassName:@"Post"];
post[@"content"] = @"每个 Objective-C 程序员必备的 8 个开发工具";
post[@"pubUser"] = @"LeanCloud官方客服";
post[@"pubTimestamp"] = @(1435541999);
[post save];
```

运行此代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 [数据管理](/data.html?appid={{appid}}) 页面来查看数据的存储情况。

如果保存成功，`Post` 的数据表中应该显示出以下记录：

``` objc
objectId: "558e20cbe4b060308e3eb36c", content: "每个 Objective-C 程序员必备的 8 个开发工具", pubUser: "LeanCloud官方客服", pubTimestamp: 1435541999,
createdAt:"2015-06-29 09:39:35", updatedAt:"2015-06-29 09:39:35"
```

在此要特别说明两点：

1. 运行此代码前，不用配置或设置 `Post` 类，LeanCloud 会自动创建这个类。
   
2. 对于每一个 AVObject，系统内置了一些属性，以下字段不需要提前指定：
   
   * `objectId` 是为每个对象自动生成的唯一的标识符
   * `createdAt` 和 `updatedAt` 分别代表每个对象在 LeanCloud 中创建和最后修改的时间，它们会被自动赋值。
   
   在执行保存操作之前，这些字段不会被自动保存到 `AVObject` 中。

### 保存选项

`AVObject` 对象在保存时可以使用以下选项：

选项 | 类型 | 说明
--- | --- | ---
<code class="text-nowrap">`fetchWhenSave`</code> | BOOL | 对象成功保存后，自动返回该对象在服务端的最新数据。用途请参考 [计数器](#计数器)。
`query` | AVQuery  | 当 query 中的条件满足后对象才能成功保存，否则放弃保存，并返回错误码 305。<br/><br/>开发者原本可以通过 `AVQuery` 和 `AVObject` 分两步来实现这样的逻辑，但如此一来无法保证操作的原子性从而导致并发问题。该选项可以用来判断多用户更新同一对象数据时可能引发的冲突，[示例如下](#saveoption_query_example)。

每个保存选项实质上是 `AVSaveOption` 对象的一个属性，使用时调用 `AVObject` 的带有 `option` 参数的保存接口即可。

【示例】<a id="saveoption_query_example" name="saveoption_query_example"></a>：一篇 wiki 文章允许任何人来修改，它的数据表字段有：**content**（wiki 的内容）、**version**（版本号）。每当 wiki 内容被更新后，其 version 也需要更新（+1）。用户 A 要修改这篇 wiki，从数据表中取出时它的 version 值为 3，那么当用户 A 完成编辑要保存新内容时，如果数据表中的 version 仍为 3，表明这段时间没有其他用户更新过这篇 wiki，可以放心保存；如果不是 3，开发者可以拒绝掉用户 A 的修改，或应用自定义的业务逻辑。

```objc
// 假设 version 值已提前获取

AVSaveOption *option = [[AVSaveOption alloc] init];

AVQuery *query = [[AVQuery alloc] init];
[query whereKey:@"version" equalTo:version];

option.query = query;

[object saveInBackgroundWithOption:option block:^(BOOL succeeded, NSError *error) {
    if ( error.code == 305 ){
      NSLog(@"无法保存修改，wiki 已被他人更新。");
    }
}];
```

### 检索对象

将数据保存到 LeanCloud 上实现起来简单而直观，获取数据也是如此。如果已知 `objectId`，用 `AVQuery` 就可以查询到对应的 `AVObject` 实例：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
AVObject *post = [query getObjectWithId:@"558e20cbe4b060308e3eb36c"];
```

接下来可以用 `objectForKey:`或下标语法来获取属性值：

``` objc
int timestamp = [[post objectForKey:@"pubTimestamp"] intValue];
NSString *userName = [post objectForKey:@"pubUser"];
NSString *content = post[@"content"];
```

获取三个特殊属性：

``` objc
NSString *objectId = post.objectId;
NSDate *updatedAt = post.updatedAt;
NSDate *createdAt = post.createdAt;
```

如果需要刷新特定对象的最新数据，可调用 `refresh` 方法 ：

``` objc
[myObject refresh];
```

### 后台运行

在 iOS 或 OS X 中，大部分代码是在主线程中运行的。不过，当应用在主线程中访问网络时，可能常会发生卡顿或崩溃现象。

由于 `save` 和 `getObjectWithId` 这两个方法会访问 LeanCloud 云端服务器，所以不应当在主线程上运行。这种情况一般处理起来比较麻烦，因此，LeanCloud 提供了辅助方法，能够覆盖绝大多数应用场景。

例如，方法 `saveInBackground` 可在后台线程中保存之前的 `AVObject` 实例：

``` objc
[post saveInBackground];
```

这样，`saveInBackground` 的调用会立即返回，而主线程不会被阻塞，应用会保持在响应状态。

通常情况下，要在某操作完成后立即运行后面的代码，可以使用 Block（`...WithBlock` ：仅支持 iOS 4.0+ 或 OS X 10.6+）或回调（`...CallBack`）方法。

例如，在保存完成后运行一些代码：

``` objc
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  if (!error) {
    // post 保存成功
  } else {
    // 保存 post 时出错
  }
}];
```

或者写成回调方式：

``` objc
// 先创建一个回调
- (void)saveCallback:(NSNumber *)result error:(NSError *)error {
  if (!error) {
    // post 保存成功
  } else {
    // 保存 post 时出错
  }
}

// 然后在后续代码中执行其他操作
[post saveInBackgroundWithTarget:self
                        selector:@selector(saveCallback:error:)];
```

LeanCloud 在进行网络通讯时不会阻塞调用线程，Block 或回调会在主线程执行。也就是说，网络访问不会对 UI 产生不良影响，在回调中可对 UI 进行操作。

`AVQuery` 也遵循相同的模式。如果需要从对象 `Post` 获取并修改某一条微博帖子，同时又确保主线程不会被阻塞，则可以：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c"
                             block:^(AVObject *post, NSError *error) {
  if (!error) {
    // get 请求成功完成，结果存在 post 实例中
    NSLog(@"The content was: %@", [post objectForKey:@"content"]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

或用回调方式：

``` objc
// 先创建一个回调
- (void)getCallback:(AVObject *)post error:(NSError *)error {
  if (!error) {
    // get 请求成功完成，结果存在 post 实例中
    NSLog(@"The content was: %@", [post objectForKey:@"content"]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}

// 然后在后续代码中执行其他操作
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c"
                            target:self
                          selector:@selector(getCallback:error:)];
```

### 离线存储对象

大多数保存功能可以立刻执行，并通知应用「保存完毕」。不过若不需要知道保存完成的时间，则可使用 `saveEventually` 来代替。

它的优点在于：如果用户目前尚未接入网络，`saveEventually` 会缓存设备中的数据，并在网络连接恢复后上传。如果应用在网络恢复之前就被关闭了，那么当它下一次打开时，LeanCloud 会再次尝试保存操作。

所有 `saveEventually`（或 `deleteEventually`）的相关调用，将按照调用的顺序依次执行。因此，多次对某一对象使用 `saveEventually` 是安全的。

``` objc
// 创建对象
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"居有良田，食有黍稷；躬耕山間，優游人世；生之所往，不過良風年年。" forKey:@"content"];
[post setObject:@"LeanCloud官方客服" forKey:@"pubUser"];
[post setObject:[NSNumber numberWithInt:1435541999] forKey:@"pubTimestamp"];
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    [post setObject:@"http://tp1.sinaimg.cn/3652761852/50/5730347813/0" forKey:@"pubUserAvatar"];
    [post saveEventually];
}];
```

### 更新对象

更新对象非常简单，仅需要更新其属性，再调用保存方法即可。例如：

``` objc
// 创建对象
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"居有良田，食有黍稷；躬耕山間，優游人世；生之所往，不過良風年年。" forKey:@"content"];
[post setObject:@"LeanCloud官方客服" forKey:@"pubUser"];
[post setObject:[NSNumber numberWithInt:1435541999] forKey:@"pubTimestamp"];
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    // 增加些新数据，这次只更新头像和认证等级信息
    [post setObject:@"http://tp1.sinaimg.cn/3652761852/50/5730347813/0" forKey:@"pubUserAvatar"];
    [post setObject:[NSNumber numberWithInt:4] forKey:@"pubUserCertificate"];
    [post saveInBackground];
}];
```

SDK 内部会自动计算出哪些数据已经改变，并将修改过的的字段发送给 LeanCloud 云端。未更新的数据不会产生变动，这一点请不用担心。

**请注意，LeanCloud 上的更新对象都是针对单个对象，获得对象的 objectId 主键才可以去更新对象。服务端判断一个对象是新增还是更新，是根据有没有 objectId 来决定的。**

上面的例子是先创建对象，然后在 saveInBackgroundWithBlock 的 block 里更新对象，不过更常见的场景是你通过[查询](#查询)得到一个 AVObject 对象，这个时候更新对象也是类似上面的代码那样，修改属性，调用 saveInBackground 即可。

如果你已经知道了 objectId（例如从查询后的列表页进入一个详情页面，传入了 objectId），想要修改一个对象，可以采用类似下面的代码来更新对象属性：

``` objc
// 知道 objectId，创建 AVObject
AVObject *post = [AVObject objectWithoutDataWithClassName:@"Post" objectId:@"5590cdfde4b00f7adb5860c8"];
//更新属性
[post setObject:@"http://tp1.sinaimg.cn/3652761852/50/5730347813/0" forKey:@"pubUserAvatar"];
[post setObject:[NSNumber numberWithInt:4] forKey:@"pubUserCertificate"];
//保存
[post saveInBackground];
```



### 计数器

许多应用都需要实现计数器功能。比如一条微博，我们需要记录有多少人喜欢或者转发了它。但可能很多次喜欢都是同时发生的，如果在每个客户端直接把它们读到的计数值增加之后再写回去，那么极容易引发冲突和覆盖，导致最终结果不准，这时可以用 `incrementKey:` 以原子操作方式来实现计数：

``` objc
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"居有良田，食有黍稷；躬耕山間，優游人世；生之所往，不過良風年年。" forKey:@"content"];
[post setObject:@"LeanCloud官方客服" forKey:@"pubUser"];
[post setObject:[NSNumber numberWithInt:1435541999] forKey:@"pubTimestamp"];
[post setObject:[NSNumber numberWithInt:0] forKey:@"upvotes"]; //初始值为 0
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    // 增加点赞的人数
    [post incrementKey:@"upvotes"];
    [post saveInBackground];
}];
```

也可以使用 `incrementKey:byAmount:` 来给 Number 类型字段累加一个特定数值。

能不能不用特意去做 `fetch`，就马上得到计数器当前在后端的最新数据呢？这就需要使用 `fetchWhenSave` 属性。当它被设置为 `true` 时，SDK 会在保存操作发生时，自动返回当前计数器的最新数值。

``` objc
post.fetchWhenSave = YES;
[post incrementKey:@"upvotes"];
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    // 这时候 post.upvotes 的值会是最新的
}];
```

### 数组

为了更好地存储数组类型的数据，LeanCloud 提供了三种不同的操作来自动更新数组字段：

* `addObject:forKey:`<br>
  `addObjectsFromArray:forKey:`<br>
  将指定对象附加到数组末尾。
* `addUniqueObject:forKey:`<br>
  `addUniqueObjectsFromArray:forKey:`<br>
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。对象的插入位置是随机的。  
* `removeObject:forKey:`<br>
  `removeObjectsInArray:forKey:`<br>
  从数组字段中删除指定对象的所有实例。

例如，给微博帖子添加 tags 字段：

``` objc
[post addUniqueObjectsFromArray:[NSArray arrayWithObjects:@"编程", @"开发工具", nil] forKey:@"tags"];
[post saveInBackground];
```

### 删除对象

从 LeanCloud 中删除一个对象：

``` objc
[myObject deleteInBackground];
```

如果想通过回调来确认删除操作的结果，可以使用方法 `deleteInBackgroundWithBlock:` 或 `deleteInBackgroundWithTarget:selector:`。如果想强制在当前线程执行，使用 `delete`。

`removeObjectForKey:` 方法会删除 AVObject 实例的单个属性。

``` objc
// 删除 post 实例中 pubTimestamp 字段的值，因为我们可以直接使用 createdAt 这个属性
[myObject removeObjectForKey:@"pubTimestamp"];

// 字段删除后结果保存到云端
[myObject saveInBackground];
```

### 关联数据

对象可以与其他对象相联系。如前面所述，我们可以把一个 AVObject 的实例 a，当成另一个 AVObject 实例 b 的属性值保存起来。这可以解决数据之间一对一或者一对多的关系映射，就像数据库中的主外键关系一样。

注：LeanCloud 云端是通过 Pointer 类型来解决这种数据引用的，并不会将数据 a 在数据 b 的表中再额外存储一份，这也可以保证数据的一致性。

例如：一条微博信息可能会对应多条评论。创建一条微博信息并对应一条评论信息，你可以这样写：

``` objc
// 创建微博、内容
AVObject *myPost = [AVObject objectWithClassName:@"Post"];
[myPost setObject:@"作为一个程序员，你认为回家以后要不要继续写代码？" forKey:@"content"];

// 创建评论和内容
AVObject *myComment = [AVObject objectWithClassName:@"Comment"];
[myComment setObject:@"我若是写代码，进入状态之后最好不要停。下不下班已经不重要了，那种感觉最重要。" forKey:@"content"];

// 为微博和评论建立一对一关系
[myComment setObject:myPost forKey:@"post"];

// 同时保存 myPost、myComment
[myComment saveInBackground];
```

你也可以通过 objectId 来关联已有的对象：

``` objc
// 把评论跟 objectId 为 "5590cdfde4b00f7adb5860c8" 的微博关联起来
[myComment setObject:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"5590cdfde4b00f7adb5860c8"]
              forKey:@"post"];
```

默认情况下，在获取一个对象时，与其相关联的 `AVObject` 数据不会被一同返回。这些对象除了 `objectId` 之外，其他属性值都是空的，要得到关联对象的全部属性数据，需要再次调用 `fetch` 系方法:

``` objc
// 取回关联的微博实例
AVObject *post = [myComment objectForKey:@"post"];
// 获取 post 的相关属性
[post fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  // 取回微博帖子内容
  NSString *content = [post objectForKey:@"content"];
}];
```

还有另外一种复杂的情况，你可以使用 `AVRelation` 来建模「多对多」关系，它的工作原理类似于 `AVObject` 中的 `NSArray`。二者的不同之处在于，`AVRelation` 不用同步返回关联的所有 `AVObject` 实例数据。这意味着，使用 `AVRelation` 可以支持比 `NSArray` 更多的对象，它们的读取方式也更加灵活。

例如，一个用户喜欢多篇微博，就可以用 `relationforKey:` 来保存这些微博。将一篇微博按顺序添加到列表，可这样做：

``` objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"likes"];
[relation addObject:post];
[user saveInBackground];
```

从 `AVRelation` 中移除一篇喜欢的微博：

``` objc
[relation removeObject:post];
```

默认情况下，这个关系中的对象列表不会被同步返回，需要从 `query` 查询返回的 `AVQuery` 中调用 `findObjectsInBackgroundWithBlock:` 方法来获得关联对象列表（这里是微博，Post），如：

``` objc
[[relation query] findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (error) {
     // 呃，报错了
  } else {
    // objects 包含了当前用户喜欢的所有微博
  }
}];
```

如果只想要文章对象的子集，则要对 `AVQuery` 添加额外的限制，如：

``` objc
AVQuery *query = [relation query];
// 增加其他查询限制条件
query.skip = 10;
query.limit = 10;
```

如果想反向查询，比如，一篇微博被哪些用户喜欢过，可使用 `reverseQuery:` 来进行反向查询（同样，这也是直接使用 NSArray 作为属性值无法完成的），例如：

``` objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"likes"];
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"作为一个程序员，你认为回家以后要不要继续写代码？" forKey:@"content"];
[post save];
[relation addObject:post];
[user save];


AVQuery *query = [AVRelation reverseQuery:user.className relationKey:@"likes" childObject:post];
[query findObjectsInBackgroundWithBlock:^(NSArray *users, NSError *error) {
   // users 就是查询出来的喜欢 myPost 的所有 User 列表
}];

```

要了解 `AVQuery` 更多的用法，请阅读本文 [查询](#查询) 部分。`AVRelation` 的行为接近于 `AVObject` 中的 `NSArray`，所以在对象数组上的任何操作也同样适用于 `AVRelation`。

**请阅读《[数据模型设计指南](./relation_guide.html)》来进一步了解关系类型。**

### 批量操作

为了减少网络交互的次数太多带来的时间浪费，你可以在一个请求中对多个对象进行创建、更新、删除、获取。接口都在 AVObject 这个类下面：

``` objc
// 批量创建、更新
+ (BOOL)saveAll:(NSArray *)objects error:(NSError **)error;
+ (void)saveAllInBackground:(NSArray *)objects
						  block:(AVBooleanResultBlock)block; 

// 批量删除
+ (BOOL)deleteAll:(NSArray *)objects error:(NSError **)error;
+ (void)deleteAllInBackground:(NSArray *)objects
                        block:(AVBooleanResultBlock)block;

// 批量获取
+ (BOOL)fetchAll:(NSArray *)objects error:(NSError **)error;
+ (void)fetchAllInBackground:(NSArray *)objects
                       block:(AVArrayResultBlock)block;                        
```

比如 `Post` 用 `isRead` 字段来表示是否已读。获取一组微博对象之后，把这组对象标记为已读的代码如下：

``` 
// 获取了一组 posts
NSArray *posts;

for (AVObject *post in posts) {
    post[@"isRead"] = @(YES);
}
[AVObject saveAllInBackground:posts block:^(BOOL succeeded, NSError *error) {
    if (error) {
        // 网络错误
    } else {
        // 保存成功
    }
}];
```

### 数据类型

到目前为止，我们使用过的数据类型有 `NSString`、 `NSNumber`、 `AVObject`，LeanCloud 还支持 `NSDate` 和 `NSData`。

此外，`NSDictionary` 和 `NSArray` 支持嵌套，这样在一个 `AVObject` 中就可以使用它们来储存更多的结构化数据。例如：

``` objc
NSNumber *boolean = @(YES);
NSNumber *number = [NSNumber numberWithInt:2014];
NSString *string = [NSString stringWithFormat:@"famous film name is %i", number];
NSDate *date = [NSDate date];
NSData *data = [@"fooBar" dataUsingEncoding:NSUTF8StringEncoding];
NSArray *array = [NSArray arrayWithObjects:string, number, nil];
NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:number, @"number",
                                                                      string, @"string",
                                                                      nil];

AVObject *testObject = [AVObject objectWithClassName:@"DataTypeTest"];
[testObject setObject:boolean    forKey:@"testBoolean"];
[testObject setObject:number     forKey:@"testInteger"];
[testObject setObject:string     forKey:@"testString"];
[testObject setObject:date       forKey:@"testDate"];
[testObject setObject:data       forKey:@"testData"];
[testObject setObject:array      forKey:@"testArray"];
[testObject setObject:dictionary forKey:@"testDictionary"];
[testObject saveInBackground];
```

我们**不推荐**在 `AVObject` 中使用 `NSData` 类型来储存大块的二进制数据，比如图片或整个文件。**每个 `AVObject` 的大小都不应超过 128 KB**。如果需要储存更多的数据，建议使用 `AVFile`。更多细节可以阅读本文 [文件](#文件) 部分。

若想了解更多有关 LeanCloud 如何解析处理数据的信息，请查看专题文档《[数据与安全](./data_security.html)》。

## 查询

我们已经看到，`AVQuery` 的 `getObjectWithId:` 方法可以从 LeanCloud 中检索出单个 `AVObject` 实例。此外，`AVQuery` 还提供更多的检索方法，来实现诸如一次检索许多对象、设定检索对象的条件、自动缓存查询结果等操作，免去了开发者需自行撰写代码的麻烦。

### 基本查询

在许多情况下，`getObjectInBackgroundWithId:block:` 只能查找单个实例，并不能满足需求。除了检索单一对象，`AVQuery` 还允许以不同的检索方式来获取包含多个实例的列表。

一般的方式是创建一个 `AVQuery` 并设定相应的条件，然后用 `findObjectsInBackgroundWithBlock:` 检索得到一个 `AVObject` 组成的 `NSArray`。

例如，要查找指定 `pubUser` 发布的所有微博，可以使用 `whereKey:equalTo:` 方法来限定一个键和对应的值。

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"pubUser" equalTo:@"LeanCloud官方客服"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // 检索成功
    NSLog(@"Successfully retrieved %d posts.", objects.count);
  } else {
    // 输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

`findObjectsInBackgroundWithBlock:` 可以保证在完成网络请求的同时，不阻塞主线程中的 Block 和回调。

如果已运行在后台线程中，用 `findObjects` 方法可阻塞调用进程：

``` objc
// 以下代码仅可用于测试目的，或在后台线程之中运行
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"pubUser" equalTo:@"LeanCloud官方客服"];
NSArray *postArray = [query findObjects];
```

### 查询约束

给 `AVQuery` 的检索添加约束条件有多种方法。

用 `whereKey:notEqualTo:` 搭配对应的键和值来过滤对象：

``` objc
[query whereKey:@"pubUser" notEqualTo:@"LeanCloud官方客服"];
```

一次查询可以设置多个约束条件，只有满足所有条件的对象才被返回，这相当于使用 AND 类型的查询条件。

``` objc
[query whereKey:@"pubUser" notEqualTo:@"LeanCloud官方客服"];
[query whereKey:@"pubUserCertificate" greaterThan:[NSNumber numberWithInt:3]];
```

用 `limit` 属性来控制返回结果的数量，默认值 100，允许取值范围从 1 到 1000。

``` objc
query.limit = 10; // 最多返回 10 条结果
```

如果只需获取一个结果，直接使用 `getFirstObject` 或 `getFirstObjectInBackground`。

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"pubUser" equalTo:@"LeanCloud官方客服"];
[query getFirstObjectInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  if (!object) {
    NSLog(@"getFirstObject 请求失败。");
  } else {
    // 查询成功
    NSLog(@"对象成功返回。");
  }
}];
```

`skip` 用来跳过初始结果，这对分页非常有用：

``` objc
query.skip = 10; // 跳过前 10 条结果
```

对于适用的数据类型，如数字、字符串，可对返回结果进行排序：

``` objc
// 按发帖时间升序排列
[query orderByAscending:@"createdAt"];

// 按发帖时间降序排列
[query orderByDescending:@"createdAt"];
```

一个查询可以使用多个排序键：

``` objc
// 若上一个排序键相等，按发帖者认证等级升序排列
[query addAscendingOrder:@"pubUserCertificate"];

// 如果上一个排序键相等，按发帖者认证等级降序排列
[query addDescendingOrder:@"pubUserCertificate"];
```

对于适用的数据类型，检索中可以使用「比较」方法：

``` objc
// 点赞数 < 50
[query whereKey:@"upvotes" lessThan:[NSNumber numberWithInt:50]];

// 点赞数 <= 50
[query whereKey:@"upvotes" lessThanOrEqualTo:[NSNumber numberWithInt:50]];

// 点赞数 > 50
[query whereKey:@"upvotes" greaterThan:[NSNumber numberWithInt:50]];

// 点赞数 >= 50
[query whereKey:@"upvotes" greaterThanOrEqualTo:[NSNumber numberWithInt:50]];
```

`whereKey:containedIn:` 可查询包含不同值的对象。它接受数组，可实现用单一查询来代替多个查询。

``` objc
// 找出 “LeanCloud官方客服”，“LeanCloud江宏”，“滚滚艾买提” 三个账号的微博帖子
NSArray *names = [NSArray arrayWithObjects:@"LeanCloud官方客服",
                                           @"LeanCloud江宏",
                                           @"滚滚艾买提",
                                           nil];
[query whereKey:@"pubUser" containedIn:names];
```

相反，要让查询不包含某些值的对象，则用 `whereKey:notContainedIn:` ：

``` objc
// 找出除 “LeanCloud官方客服”，“LeanCloud江宏”，“滚滚艾买提” 三个账号以外的其他人的微博帖子
NSArray *names = [NSArray arrayWithObjects:@"LeanCloud官方客服",
                                           @"LeanCloud江宏",
                                           @"滚滚艾买提",
                                           nil];
[query whereKey:@"pubUser" notContainedIn:names];
```

`whereKeyExists` 用来查询具备某一键集条件的对象，`whereKeyDoesNotExist` 正好相反。

``` objc
// 找到有图片的微博
[query whereKeyExists:@"images"];

// 没有图片的微博
[query whereKeyDoesNotExist:@"images"];
```

如果要用一个对象中某一键值，去匹配另一个查询结果对象中一个键值，来得到最终结果，可以使用 `whereKey:matchesKey:inQuery:` 。

例如，在微博这类应用中有三类数据：一个类是微博帖子信息（Post），另一个类是用户账户信息（AVUser），还有一个类是用户之间互相关注的信息（UserFollow），要找出当前用户关注的人发布的微博，则：

``` objc
// 先找到当前登录用户关注的用户列表
AVQuery *followeeQuery = [AVQuery queryWithClassName:@"UserFollow"];
[followeeQuery whereKey:@"follower" equalTo:[AVUser currentUser]];

// 找到这些被关注者发布的微博
AVQuery *postQuery = [AVQuery queryWithClassName:@"Post"];
[postQuery whereKey:@"author" matchesKey:@"followee" inQuery:followeeQuery];
[postQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // 得到当前用户关注的人发布的微博
}];
```

相反，要从一个查询中获取一组对象，该对象的一个键值，与另一个对象的键值并不匹配，可以使用 `whereKey:doesNotMatchKey:inQuery:` 。

例如，找出当前用户没有关注的人发布的微博：

``` objc
AVQuery *postQuery = [AVQuery queryWithClassName:@"Post"];
[postQuery whereKey:@"author" doesnotMatchesKey:@"followee" inQuery:followeeQuery];
[postQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // 得到当前用户未关注的人发布的微博
}];
```

将 `selectKeys:` 搭配 `NSArray` 类型的键值来使用可以限定查询返回的字段。

例如，让查询结果只包含 `pubUser` 和 `content` 字段（也可以是内置字段，如 `objectId`、 `createdAt` 或 `updatedAt`）：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query selectKeys:@[@"pubUser", @"content"]];
NSArray *results = [query findObjects];
```

其余字段可以稍后对返回的对象调用 `fetchIfNeeded` 的变体来获取：

``` objc
AVObject *object = (AVObject *)[results objectAtIndex:0];
[object fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  // 返回该对象的所有字段
}];
```

### 查询数组值

当键值为数组类型时，`equalTo:` 可以从数组中找出包含单个值的对象：

``` objc
// 找出 arrayKey 中包含 2 的对象
[query whereKey:@"arrayKey" equalTo:[NSNumber numberWithInt:2]];
```

`containsAllObjectsInArray:` 可以找到包含多个值的对象:

``` objc
// 找出 arrayKey 中包含 2、3、4 的对象
[query whereKey:@"arrayKey" containsAllObjectsInArray:@[@2, @3, @4]];
```

### 查询字符串值

使用 `whereKey:hasPrefix:` 可以过滤出以特定字符串开头的结果，这有点像 MySQL 的 `LIKE` 条件。因为支持索引，所以该操作对于大数据集也很高效。

``` objc
// 找出名字以 "LeanCloud" 开头的账户的微博帖子
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"pubUser" hasPrefix:@"LeanCloud"];
```

### 关系查询

检索关系数据有几种方法。如果用某个属性去匹配一个已知的 `AVObject` 对象，仍然可以使用 `whereKey:equalTo:`，就像使用其他数据类型一样。

例如，如果每条评论 `Comment` 的 `post` 字段都有一个 `Post` 微博对象，那么找出指定微博下的评论：

``` objc
// 假设前面已建好了 myPost 这个 AVObject 对象
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" equalTo:myPost];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了 myPost 下的所有评论
}];
```

或通过 `objectId` 做关系查询：

``` objc
[query whereKey:@"post"
        equalTo:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"5590cdfde4b00f7adb5860c8"];
```

如果要做嵌套查询，请使用 `whereKey:matchesQuery`。

例如，找出所有带图片的微博的评论：

``` objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" matchesQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // 所有带图片的微博的评论都在 comments
}];
```

相反，`whereKey:doesNotMatchQuery:` 可以找出一个对象的某个属性与另一个查询不匹配的结果。例如，找出所有 不带图片的文章的评论：

``` objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" doesNotMatchQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了所有没有图片的文章的评论
}];
```

注意：结果返回数量（默认 100 最多 1000）的限制也适用于内嵌查询，所以在处理大型数据集时，你可能需要仔细设置查询条件来获得想要的结果。

在一些场景中，如果需要在一个查询中返回多个类型的关联属性，可以使用方法 `includeKey:`。例如，搜索最近的十条评论，并同时找出与之对应的文章：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];

// 找出最近刚创建的记录
[query orderByDescending:@"createdAt"];

// 只取前十条
query.limit = [NSNumber numberWithInt:10];

// 找出每条评论所对应的文章
[query includeKey:@"post"];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 是最近的十条评论, 其 post 字段也有相应数据
    for (AVObject *comment in comments) {
         // 并不需要网络访问
         AVObject *post = [comment objectForKey:@"post"];
         NSLog(@"retrieved related post: %@", post);
    }
}];
```

**使用点（`.`）操作符可以检索多层级的数据（AVObject 对象）**。例如，在结果中加入评论所对应的微博，以及该微博的作者：

``` objc
[query includeKey:@"post.author"];
```

`includeKey:` 既可在一次查询中多次使用来返回多个属性，也可与 `AVQuery` 的 `getFirstObject` 和 `getObjectInBackground` 等辅助方法配合使用。

还有一种情况，当某些对象包括多个键，而某些键的值包含的数据量又比较大，你并不希望返回所有的数据，只想要特定键所对应的数据，这时可以用 `selectKeys:`：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query selectKeys:@[@"pubUser"]];
AVObject *result = [query getFirstObject];
```

只返回指定键对应的有限数据，而非所有数据，有助于节省网络带宽和计算资源。

### 缓存查询

通常，将请求结果缓存到磁盘上是一种行之有效的方法，这样就算设备离线，应用刚刚打开，网络请求尚未完成时，数据也能显示出来。当缓存占用太多空间时，LeanCloud 会自动对其清理。

默认的查询行为不使用缓存，需要通过 `query.cachePolicy` 来启用。例如，当网络不可用时，尝试网络连接并同时取回已缓存的数据:

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
query.cachePolicy = kAVCachePolicyNetworkElseCache;

//设置缓存有效期
query.maxCacheAge = 24*3600;

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // 成功找到结果，先找网络再访问磁盘
  } else {
    // 无法访问网络，本次查询结果未做缓存
  }
}];

```

LeanCloud 提供了几种不同的缓存策略：

* `kAVCachePolicyIgnoreCache`
  
  **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
  
* `kAVCachePolicyCacheOnly`
  
  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVError`。
  
* `kAVCachePolicyCacheElseNetwork`
  
  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
  
* `kAVCachePolicyNetworkElseCache`
  
  查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
  
* `kAVCachePolicyCacheThenNetwork`
  
  查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `findObjects` 同时使用。

要控制缓存行为，可以使用 `AVQuery` 提供的相应方法：

* 检查是否存在缓存查询结果：
  
  ``` objc
  BOOL isInCache = [query hasCachedResult];
  ```
  
* 删除某一查询的任何缓存结果：
  
  ``` objc
  [query clearCachedResult];
  ```
  
* 删除查询的所有缓存结果：
  
  ``` objc
  [AVQuery clearAllCachedResults];
  ```
  
* 设定缓存结果的最长时限：
  
  ``` objc
  query.maxCacheAge = 60 * 60 * 24; // 一天的总秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirstObject` 和 `getObjectInBackground`。

### 对象计数

如果只需要得到查询出来的对象数量，不需要检索匹配的对象，可以用 `countObjects` 来代替 `findObjects`。

例如，计算一下某位用户一共发布了多少条微博：

``` objc
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"pubUser" equalTo:@"张三"];
[query countObjectsInBackgroundWithBlock:^(int count, NSError *error) {
  if (!error) {
    // 查询成功，输出计数
    NSLog(@"张三 发布了 %d 条微博", count);
  } else {
    // 查询失败
  }
}];
```

`countObjects` 是一种同步式的方法，因此使用它可以阻塞调用线程。

对含有超过 1000 个对象的类，使用计数操作很可能会导致响应超时，或返回数值近似精确，所以在构建程序时，应该尽量避免这样的操作。

### 复合查询

如果想从多个查询中，找出与其中任意一个相匹配的对象，可以使用方法 `orQueryWithSubqueries:`。

例如，找出赢了很多场比赛或者只赢了几场比赛的球员：

``` objc
AVQuery *lotsOfWins = [AVQuery queryWithClassName:@"Player"];
[lotsOfWins whereKey:@"wins" greaterThan:[NSNumber numberWithInt:150]];

AVQuery *fewWins = [AVQuery queryWithClassName:@"Player"];
[fewWins whereKey:@"wins" lessThan:[NSNumber numberWithInt:5]];
AVQuery *query = [AVQuery orQueryWithSubqueries:[NSArray arrayWithObjects:fewWins,lotsOfWins,nil]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
  // 返回赢球次数大于 150 场或小于 5 场的球员
  }];
```

你可以对新创建的 `AVQuery` 添加额外的约束，多个约束将以 AND 运算符来联接。

注意：在复合查询的子查询中，不能使用非过滤性的约束（如 `limit`、 `skip`、`orderBy...:`、 `includeKey:`）。

### Cloud Query Language（CQL）查询

我们还提供类似于 SQL 语言的查询语言 CQL，使用方法如下：

``` objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@", @"ATestClass"];
    AVCloudQueryResult *result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"results:%@", result.results);

    cql = [NSString stringWithFormat:@"select count(*) from %@", @"ATestClass"];
    result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"count:%lu", (unsigned long)result.count);
```

通常，查询语句会使用变量参数。为此，我们提供了与 Java JDBC 所使用的 `PreparedStatement` 占位符查询相类似的语法结构。

``` objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where durability = ? and name = ?", @"ATestClass"];
    NSArray *pvalues =  @[@100, @"祈福"];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql pvalues:pvalues callback:^(AVCloudQueryResult *result, NSError *error) {
        if (!error) {
            // 操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```

可变参数 `100` 和 `"祈福"` 会被自动替换到查询语句中的问号位置（按问号出现的先后顺序）。我们更推荐使用占位符语法，理论上这样会降低 CQL 转换的性能开销。

关于 CQL 的详细介绍，请参考 [Cloud Query Language 详细指南](cql_guide.html)。

## 应用内搜索

我们虽然提供了基于正则的模糊查询，但是正则查询有两个缺点：

* 当数据量逐步增大后，查询效率将越来越低
* 没有文本相关性排序

因此，我们还提供了[应用内搜索功能](./app_search_guide.html)，基于搜索引擎构建，提供更强大的搜索功能。

## 子类化

LeanCloud 设计的目标是让你的应用尽快运行起来。你可以用 `AVObject` 访问到所有的数据，用 `objectForKey:` 获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

``` 
AVObject *student = [AVObject objectWithClassName:@"Student"];
[student setObject:@"小明" forKey:@"name"];
[student saveInBackground];
```

可改写成:

``` 
Student *student = [Student object];
student.name = @"小明";
[student saveInBackground];
```

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面几个步骤：

1. 导入 `AVObject+Subclass.h`；
2. 继承 `AVObject` 并实现 `AVSubclassing` 协议；
3. 实现类方法 `parseClassName`，返回的字符串是原先要传给 `initWithClassName:` 的参数，这样后续就不必再进行类名引用了。如果不实现，默认返回的是类的名字。**请注意： `AVUser` 子类化后必须返回 `_User`**；
4. 在实例化子类之前调用 `[YourClass registerSubclass]`（**在应用当前生命周期中，只需要调用一次**。可在子类的 `+load` 方法或者 UIApplication 的 `-application:didFinishLaunchingWithOptions:` 方法里面调用。）。

下面是实现 `Student` 子类化的例子:

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property(nonatomic,copy) NSString *name;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic name;

  + (NSString *)parseClassName {
      return @"Student";
  }

  @end


  // AppDelegate.m
  #import <AVOSCloud/AVOSCloud.h>
  #import "Student.h"

  - (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Student registerSubclass];
    [AVOSCloud setApplicationId:appid clientKey:appkey];
  }
```

### 属性

为 `AVObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。用 `AVSubclassing` 可以把所有的相关逻辑放在一起，这样不必再使用不同的类来区分业务逻辑和存储转换逻辑了。

`AVObject` 支持动态 synthesizer，就像 `NSManagedObject` 一样。先正常声明一个属性，只是在 .m 文件中把 `@synthesize` 变成 `@dynamic`。

请看下面的例子是怎么添加一个「年龄」属性：

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property int age;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic age;

  ......
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成：

``` objc
[student setAge:19]
```

**注意：属性名称保持首字母小写！**（错误：`student.Age` 正确：`student.age`）。

`NSNumber` 类型的属性可用 `NSNumber` 或者是它的原始数据类型（`int`、 `long` 等）来实现。例如， `[student objectForKey:@"age"]` 返回的是 `NSNumber` 类型，而实际被设为 `int` 类型。

你可以根据自己的需求来选择使用哪种类型。原始类型更为易用，而 `NSNumber` 支持 `nil` 值，这可以让结果更清晰易懂。

**注意** 子类中，对于 `BOOL` 类型的字段，SDK 在 3.1.3.2 之前会将其保存为 Number 类型，3.1.3.2 之后将其正确保存为 Bool 类型。详情请参考[这里](https://leancloud.cn/docs/ios_os_x_faq.html#为什么升级到_3_1_3_2_以上的版本时_BOOL_类型数据保存错误_)。

注意：`AVRelation` 同样可以作为子类化的一个属性来使用，比如：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(retain) AVRelation *friends;
  ......
@end

@implementation Student
@dynamic friends;
  ......
```

另外，值为 Pointer 的实例可用 `AVObject*` 来表示。例如，如果 `Student` 中 `bestFriend` 代表一个指向另一个 `Student` 的键，由于 Student 是一个 AVObject，因此在表示这个键的值的时候，可以用一个 `AVObject*` 来代替：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(nonatomic, strong) AVObject *bestFriend;
 ......
@end

@implementation Student
@dynamic bestFriend;
  ......
```

提示：当需要更新的时候，最后都要记得加上 `[student save]` 或者对应的后台存储函数进行更新，才会同步至服务器。

如果要使用更复杂的逻辑而不是简单的属性访问，可以这样实现:

``` objc
  @dynamic iconFile;

  - (UIImageView *)iconView {
    UIImageView *view = [[UIImageView alloc] initWithImage:kPlaceholderImage];
    view.image = [UIImage imageNamed:self.iconFile];
    return [view autorelease];
  }

```

### 针对 AVUser 子类化的特别说明

假如现在已经有一个基于 `AVUser` 的子类，如上面提到的 `Student`:

``` objc
@interface Student : AVUser<AVSubclassing>
@property (retain) NSString *displayName;
@end


@implementation Student
@dynamic displayName;
+ (NSString *)parseClassName {
    return @"_User";
}
@end
```

登录时需要调用 `Student` 的登录方法才能通过 `currentUser` 得到这个子类:

``` objc
[Student logInWithUsernameInBackground:@"USER_NAME" password:@"PASSWORD" block:^(AVUser *user, NSError *error) {
        Student *student = [Student currentUser];
        student.displayName = @"YOUR_DISPLAY_NAME";
    }];
```

同样需要调用 `[Student registerSubclass];`，确保在其它地方得到的对象是 Student，而非 AVUser 。

### 初始化子类

创建一个子类实例，要使用 `object` 类方法。要创建并关联到已有的对象，请使用 `objectWithoutDataWithObjectId:` 类方法。

### 子类查询

使用类方法 `query` 可以得到这个子类的查询对象。

例如，查询年龄小于 21 岁的学生：

``` objc
  AVQuery *query = [Student query];
  [query whereKey:@"age" lessThanOrEqualTo:@(21)];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      Student *stu1 = [objects objectAtIndex:0];
      // ...
    }
  }];
```

## ACL权限控制

ACL（Access Control List）是最灵活而且简单的应用数据安全管理方法。通俗的解释就是为每一个数据创建一个访问的白名单列表，只有在名单上的用户（ `AVUser`）或者具有某种角色（`AVRole`）的用户才能被允许访问。为了更好地保证用户数据安全性，LeanCloud 的每一张表中都有一个 ACL 列。

当然，LeanCloud 还提供了进一步的读写权限控制。一个 User 必须拥有读权限（或者属于一个拥有读权限的 Role）才可以获取一个对象的数据；同时，一个 User 需要写权限（或者属于一个拥有写权限的 Role）才可以更改或者删除一个对象。

以下列举了几种在 LeanCloud 常见的 ACL 使用范例。

### 默认访问权限

在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值表示，所有的用户对这个对象都是可读可写的。此时在 LeanCloud 账户的「数据管理」列表中的 ACL 属性列，会看到这样的值：

``` json
    {"*":{"read":true,"write":true}}
```

对应的 Objective-C 代码是：

``` objc
    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES];
    [acl setPublicWriteAccess:YES];
```

当然正如上文提到的，默认的 ACL 并不需要进行显式指定。

### 指定用户访问权限

当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。

``` objc

    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES]; //此处设置的是所有人的可读权限
    [acl setWriteAccess:YES forUser:[AVUser currentUser]]; //而这里设置了文件创建者的写权限

    AVObject * object = [AVObject objectWithClassName:@"iOSAclTest"];

    object.ACL=acl;
    [object save];

```

当然用户也会上传一些隐私文件，只有这些文件的创建者才对这些文件拥有读写权限：

``` objc
    [acl setWriteAccess:YES forUser:[AVUser currentUser]];
```

注：一旦显式设置了 ACL，默认的 ACL 就会被覆盖。

### 指定角色访问权限

#### AVUser 与 AVRole 的从属关系

指定用户访问权限虽然很方便，但是依然会有局限性。

以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只对工资有读的权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。

``` objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;    //假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me;      //我们就在文档里爽一爽吧
    AVUser *cashierZhou;  //出纳老周


    AVACL *acl = [AVACL ACL];

    //4 个人都有可读权限
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:hrWang];
    [acl setReadAccess:YES forUser:cashierZhou];
    [acl setReadAccess:YES forUser:me];

    //只有 2 个人可写
    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forUser:hrWang];

    [salary setACL:acl];
    [salary save];


```

但是涉及的人可能不止一个，也有离职、换岗、新员工的问题存在。这样的代码既不优雅，也太啰嗦，同样会很难维护。这个时候我们就引入了 `AVRole` 来解决这个问题。

公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间内保持相对稳定。

``` objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;    //假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me;      //我们就在文档里爽一爽吧
    AVUser *cashierZhou; //出纳老周
    AVUser *cashierGe;   //出纳小葛

    //这段代码可能放在员工管理界面更恰当，但是为了示意，我们就放在这里
    AVRole *hr =[AVRole roleWithName:@"hr"];
    AVRole *cashier = [AVRole roleWithName:@"cashier"];

    [[hr users] addObject:hrWang];
    [hr save];
    //此处对应的是 AVRole 里面有一个叫做 users 的 Relation 字段
    [[cashier users] addObject:cashierZhou];
    [[cashier users] addObject:cashierGe];
    [cashier save];

    AVACL *acl = [AVACL ACL];
    //老板假设只有一个
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:me];

    [acl setReadAccess:YES forRole:hr];
    [acl setReadAccess:YES forRole:cashier];

    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forRole:hr];

    [salary setACL:acl];
    [salary save];
```

当然如果考虑到一个角色（`AVRole`）里面有多少员工（`AVUser`），编辑这些员工所需要的权限控制，`AVRole` 同样也有 `setACL` 方法可以使用。

#### AVRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系，下面的例子或许可以帮助你理解这个概念。

一家创业公司设有移动部门，该部门下面有不同的小组（Android 和 iOS），每个小组只对自己组的代码拥有「读写」权限，但他们同时对核心库代码拥有「读取」权限。

``` objc
    AVRole *androidTeam = [AVRole roleWithName:@"AndroidTeam"];
    AVRole *iOSTeam = [AVRole roleWithName:@"IOSTeam"];
    AVRole *mobileDev = [AVRole roleWithName:@"MobileDev"];

    [androidTeam save];
    [iOSTeam save];

    [[mobileDev roles] addObject:androidTeam];
    [[mobileDev roles] addObject:iOSTeam];

    [mobileDev save];

    AVObject *androidCode = [AVObject objectWithClassName:@"Code"];
    AVObject *iOSCode = [AVObject objectWithClassName:@"Code"];
    AVObject *coreCode = [AVObject objectWithClassName:@"Code"];
    //.....此处省略一些具体的值设定

    AVACL *acl1=[AVACL ACL];
    [acl1 setReadAccess:YES forRole:androidTeam];
    [acl1 setWriteAccess:YES forRole:androidTeam];
    [androidCode setACL:acl1];

    AVACL *acl2=[AVACL ACL];
    [acl2 setReadAccess:YES forRole:iOSTeam];
    [acl2 setWriteAccess:YES forRole:iOSTeam];
    [iOSCode setACL:acl2];

    AVACL *acl3=[AVACL ACL];
    [acl3 setReadAccess:YES forRole:mobileDev];
    [coreCode setACL:acl3];

    [androidCode save];
    [iOSTeam save];
    [coreCode save];
```



## 文件

### AVFile

`AVFile` 允许应用将文件存储到服务端，它支持图片、视频、音乐等常见的文件类型，以及其他任何二进制数据。

`AVFile` 的用法非常简单。首先把文件数据存到 `NSData` 中，然后用该 `NSData` 格式的数据来创建 `AVFile` 对象。下面以存储一个字符串为例：

``` objc
NSData *data = [@"Working with LeanCloud is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
```

注意在上例中，我们将文件命名为 `resume.txt`。这里需要注意两点：

* 不必担心文件名冲突。每一个上传的文件都有惟一的 ID，所以即使上传多个文件名为 `resume.txt` 的文件也不会有问题。
* 给文件添加扩展名非常重要。LeanCloud 通过扩展名来判断文件类型，以便正确处理文件。所以，要将一张 PNG 图片存到 `AVFile` 中，要确保使用 `.png` 扩展名。

然后根据需要，调用相应的 `saveInBackground` 方法，将文件存到 LeanCloud 上：

``` objc
[file saveInBackground];
```

最终当文件存储完成后，你可以象操作其他数据那样，将 `AVFile` 关联到 `AVObject` 上。

``` objc
AVObject *obj = [AVObject objectWithClassName:@"Post"];
[obj setObject:@"Joe Smit#花儿与少年# 迪拜疯狂之旅" forKey:@"content"];
[obj setObject:file         forKey:@"attached"];
[obj saveInBackground];
```

重新获取该数据时，只需要调用 `AVFile` 的 `getData` 方法。

``` objc
AVFile *attachment = [anotherObj objectForKey:@"attached"];
NSData *binaryData = [attachment getData];
```

也可以像 `AVObject` 那样，使用 `getData` 的异步版本。

**如果对象的某一属性是一个文件数组，那么在获取该属性的查询中，必须加上 `includeKey:` 来指定该属性名，否则，查询结果中该属性对应的值将是 `AVObject` 数组，而不是 `AVFile` 数组。**

### 图像

将图像转成 `NSData` 再使用 `AVFile` ，就能很容易地将数据保存到 LeanCloud 上。

例如，把名为 `image` 的 `UIImage` 对象保存到 `AVFile` 中：

``` objc
NSData *imageData = UIImagePNGRepresentation(image);
AVFile *imageFile = [AVFile fileWithName:@"image.png" data:imageData];
[imageFile save];

AVObject *userPost = [AVObject objectWithClassName:@"Post"];
[userPost setObject:@"My trip to Dubai!" forKey:@"content"];
[userPost setObject:imageFile            forKey:@"attached"];
[userPost save];
```

### 进度提示

使用 `saveInBackgroundWithBlock:progressBlock:` 和 `getDataInBackgroundWithBlock:progressBlock:` 可以获取 `AVFile` 的上传或下载进度。比如：

``` objc
NSData *data = [@"Working at LeanCloud is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
[file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  // 成功或失败处理...
} progressBlock:^(int percentDone) {
  // 更新进度数据，percentDone 介于 0 和 100。
}];
```

### 得到图像的缩略图

保存图像时，如果想在下载原图之前先得到缩略图，那么用我们的 API 实现起来会易如反掌：

``` objc
AVFile *file = [AVFile fileWithURL:@"the-file-remote-url"];
[file getThumbnail:YES width:100 height:100 withBlock:^(UIImage *image, NSError *error) {
    }];
```

### 文件元数据

`AVFile` 的 `metaData` 属性，可以用来保存和获取该文件对象的元数据信息：

``` objc
AVFile *file = [AVFile fileWithName:@"test.jpg" contentsAtPath:@"file-local-path"];
[file.metaData setObject:@(100) forKey:@"width"];
[file.metaData setObject:@(100) forKey:@"height"];
[file.metaData setObject:@"LeanCloud" forKey:@"author"];
NSError *error = nil;
[file save:&error];
```

### 删除

当文件较多时，要把一些不需要的文件从 LeanCloud 上删除：

``` objc
[file deleteInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
}];
```

### 清除缓存

`AVFile` 也提供了清除缓存的方法：

``` objc
//清除当前文件缓存
- (void)clearCachedFile;

//类方法, 清除所有缓存
+ (BOOL)clearAllCachedFiles;

//类方法, 清除多久以前的缓存
+ (BOOL)clearCacheMoreThanDays:(NSInteger)numberOfDays;

```

### iOS 9 适配

iOS 9 默认屏蔽了 HTTP 访问，只支持 HTTPS 访问。LeanCloud 除了文件的 getData 之外的 API 都是支持 HTTPS 访问的。 现有两种方式解决这个问题。

#### 项目中配置访问策略

一是在项目中额外配置一下该接口的访问策略。选择项目的 Info.plist，右击以 Source Code 的方式打开。在 plist -> dict 节点中加入以下文本：

``` 
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSExceptionDomains</key>
    <dict>
      <key>clouddn.com</key>
      <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <true/>
      </dict>
    </dict>
  </dict>
```

或者在 Target 的 Info 标签中修改配置：

![Info.plist Setting](images/ios_qiniu_http.png)

如果是美国节点，请把上面的 `clouddn.com` 换成 `amazonaws.com`。

也可以根据项目需要，允许所有的 HTTP 访问，更多可参考 [iOS 9 适配系列教程](https://github.com/ChenYilong/iOS9AdaptationTips)。

#### 启用文件 SSL 域名

另外一种方法是在网站控制台中进入相关的应用，点击上方的设置选项卡，勾选「启用文件 SSL 域名（对应 _File 中存储的文件）」选项。这样便启用了文件 SSL 域名，支持 HTTPS 访问。如图所示：

![File SSL Config](images/ios_file_ssl_config.png)

如果启用文件 SSL 域名前已经保存了许多文件，启用之后，这些文件的 URL 也会跟着变化，来支持 HTTPS 访问。

这两种方式都能解决这个问题。但需要注意的是，即时通讯组件 LeanMessage 也用了 AVFile 来保存消息的图片、音频等文件，并且把文件的地址写入到了消息内容中。开启了文件 SSL 域名后，历史消息中的文件地址将不会像控制台里 _File 表那样跟着改变。所以如果使用了即时通讯组件并已上线，推荐使用方式一。



## 用户

用户是一个应用程序的核心。对于个人开发者来说，能够让自己的应用程序积累更多的用户，就能给自己带来更多的创作动力。因此 LeanCloud 提供了一个专门的用户类 `AVUser`，来自动处理用户账户管理所需的功能。有了这个类，你就可以在应用程序中添加用户账户功能。

`AVUser` 是一个 `AVObject` 的子类，它继承了 `AVObject` 所有的方法，具有 `AVObject` 相同的功能。不同的是，`AVUser` 增加了一些特定的与用户账户相关的功能。

### 属性

`AVUser` 除了继承 `AVObject` 的属性外，还有几个特有的属性：

* `username` : 用户的用户名（必需）
* `password` : 用户的密码（必需）
* `email` : 用户的电子邮件地址（可选）

### 注册

要求用户注册可能是应用程序要做的第一件事。下面的代码是一个典型的注册过程：

``` objc
AVUser *user = [AVUser user];
user.username = @"hjiang";
user.password =  @"f32@ds*@&dsa";
user.email = @"hang@leancloud.rocks";
[user setObject:@"186-1234-0000" forKey:@"phone"];

[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

在注册过程中，服务端会检查注册用户的信息，以确保注册的用户名和电子邮件地址是惟一的。

**服务端还会对用户密码进行不可逆的加密处理，不会明文保存任何密码。在客户端，应用切勿再次对密码加密，这会导致重置密码等功能失效。**

请注意，我们使用的是 `signUpInBackgroundWithBlock` 方法，而不是 `saveInBackground` 方法。另外还有各种不同的 `signUp` 方法可供使用。

像往常一样，我们建议，在可能的情况下，尽量使用异步版本的 `signUp` 方法，这样就不会影响到应用程序主 UI 线程的响应。具体方法请参考 [API 文档](/api-docs/iOS/index.html) 。

如果注册不成功，请检查一下返回的错误对象。最有可能的情况是，用户名或电子邮件已经被另一个用户注册，此时可以提示用户尝试用不同的用户名进行注册，也可以要求用户用 Email 做为用户名注册。

这样做的好处是，在用户提交信息时可以将输入的「用户名」默认设置为用户的 Email 地址，以后在用户忘记了密码的情况下，可以使用 LeanCloud 提供的「重置密码」功能。

关于自定义邮件模板和验证链接，请参考博客文章 [《自定义应用内用户重设密码和邮箱验证页面》](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

### 登录

让注册成功的用户登录到自己的账户，可以调用 `AVUser` 类的 `loginInBackground` 方法。

``` objc
[AVUser logInWithUsernameInBackground:@"username" password:@"password" block:^(AVUser *user, NSError *error) {
    if (user != nil) {

    } else {

    }
}];
```

### 当前用户

如果用户在每次打开应用程序时都要登录，这会直接影响用户体验。为了避免这种情况，可以使用缓存的 `currentUser` 对象。

每当用户成功注册或第一次成功登录后，就在本地磁盘中缓存下这 个用户对象，供下次调用：

``` objc
AVUser *currentUser = [AVUser currentUser];
if (currentUser != nil) {
    // 允许用户使用应用
} else {
    //缓存用户对象为空时，可打开用户注册界面…
}
```

要清除缓存用户对象：

``` objc
[AVUser logOut];  //清除缓存用户对象
AVUser *currentUser = [AVUser currentUser]; // 现在的currentUser是nil了
```

### 重置密码

我们都知道，应用一旦加入账户密码系统，那么肯定会有用户忘记密码的情况发生。对于这种情况，我们为用户提供了一种安全重置密码的方法。

重置密码的过程很简单，用户只需要输入注册的电子邮件地址即可：

``` objc
[AVUser requestPasswordResetForEmailInBackground:@"myemail@example.com" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

密码重置流程如下：

1. 用户输入注册的电子邮件，请求重置密码；
2. LeanCloud 向该邮箱发送一封包含重置密码的特殊链接的电子邮件；
3. 用户点击重置密码链接后，一个特殊的页面会打开，让他们输入新密码；
4. 用户的密码已被重置为新输入的密码。

关于自定义邮件模板和验证链接，请参考这篇 [博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/) 。

### 修改密码

当用户系统中存在密码时，自然会有更改密码的需求。我们所提供的方法能够同时验证老密码和修改新密码：

``` objc
[AVUser logInWithUsername:@"username" password:@"111111"]; //请确保用户当前的有效登录状态
[[AVUser currentUser] updatePassword:@"111111" newPassword:@"123456" block:^(id object, NSError *error) {
    //处理结果
}];
```

如果要求更改密码的用户尚未登录、原密码错误或用户不存在，这些情况都会通过回调返回操作错误信息。

### 手机号码验证

如果在[控制台 > 设置 > 应用选项 > 用户账号](/app.html?appid={{appid}}#/permission) 中打开了 **用户注册时，向注册手机号码发送验证短信** 选项，那么当用户在注册时填写完手机字段后，LeanCloud 会自动向该手机号码发送一条验证短信，用户输入验证码后，该用户即被标识为已经验证过手机了。

以下代码将注册验证码发送到用户手机上：

``` objc
	AVUser *user = [AVUser user];
	user.username = @"hjiang";
	user.password =  @"f32@ds*@&dsa";
	user.email = @"hang@leancloud.rocks";
	user.mobilePhoneNumber = @"18612340000";
	NSError *error = nil;
	[user signUp:&error];
```

调用以下代码即可验证验证码:

``` objc
	[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
        //验证结果
    }];
```

验证成功后，用户的 `mobilePhoneVerified` 属性变为 `true`，并会触发调用云引擎的 `AV.Cloud.onVerifed('sms', function)` 方法。

### 手机号码登录

当手机号码通过验证后，用户可以使用该手机号码进行登录。手机号码包括两种方式：

* 手机号码＋密码方式
* 手机号码＋短信验证码

用「手机号码＋密码」来登录的方法：

``` objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"18612340000" password:@"yourpassword" block:^(AVUser *user, NSError *error) {

    }];
```

发送登录短信验证码：

``` objc
    [AVUser requestLoginSmsCode:@"123456" withBlock:^(BOOL succeeded, NSError *error) {

    }];
```

最后使用「短信验证码＋手机号码」进行登录：

``` objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"18612340000" smsCode:smsCode block:^(AVUser *user, NSError *error) {

    }];
```

### 手机号码重置密码

与使用「电子邮件地址重置密码」类似，「手机号码重置密码」使用下面的方法来获取短信验证码：

``` objc
[AVUser requestPasswordResetWithPhoneNumber:@"18612340000" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

注意！用户需要先绑定手机号码，然后使用短信验证码来重置密码：

``` objc
[AVUser resetPasswordWithSmsCode:@"123456" newPassword:@"password" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

### 查询

**请注意，新创建应用的 `_User` 表的查询权限默认是关闭的，通常我们推荐你在云引擎里封装用户查询，只查询特定条件的用户，避免开放用户表的全部查询权限。此外，你可以通过 class 权限设置打开查询权限，请参考 [数据与安全 - Class 级别的权限](data_security.html#Class_级别的_ACL)。**

查询用户的信息，需要使用特殊的用户查询对象来完成：

``` objc
AVQuery *query = [AVUser query];
[query whereKey:@"gender" equalTo:@"female"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (error == nil) {

    } else {

    }
}];

```

### 浏览器中查看用户表

用户表是一个特殊的表，专门存储 `AVUser` 对象。在浏览器端，打开 LeanCloud 账户页面的 **存储** 菜单，找到名为 `_User` 的表来查看数据。

### 匿名用户

要创建匿名用户，可以使用 `AVAnonymousUtils` 来完成。通过如下代码，服务端会自动创建一个 `AVUser` 对象，其用户名为随机字符串。完成之后，此用户对象会被设置为 `currentUser`，之后的修改、保存、登出等操作都可以使用 `currentUser` 来完成。

``` objc
    [AVAnonymousUtils logInWithBlock:^(AVUser *user, NSError *error) {
        if (user) {

        } else {

        }
    }];
```

## 地理位置

LeanCloud 允许用户根据地球的经度和纬度坐标进行基于地理位置的信息查询。只要将 `AVGeoPoint` 添加到 `AVObject` 中，那么在查询时，即可轻松实现如找出离当前用户最近的信息或地点的功能。

### 地理位置对象

首先要创建一个 `AVGeoPoint` 对象。例如，创建一个北纬 39.9 度、东经 116.4 度的 `AVGeoPoint` 对象（LeanCloud 北京办公室所在地）：

``` objc
AVGeoPoint *point = [AVGeoPoint geoPointWithLatitude:39.9 longitude:116.4];
```

添加地理位置信息：

``` objc
[postObject setObject:point forKey:@"location"];
```

### 地理查询

假设现在数据表中已保存了一些地理坐标数据，接下来使用 `AVQuery` 对象的 `whereNear` 方法来试着找出最接近某个点的信息：

``` objc
AVObject *userObject = nil;
AVGeoPoint *userLocation =  (AVGeoPoint *) [userObject objectForKey:@"location"];
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"location" nearGeoPoint:userLocation];
//获取最接近用户地点的10条微博
query.limit = 10;
NSArray<AVObject *> nearPosts = [query findObjects];
```

在上面的代码中，`nearPosts` 返回的是与 `userLocation` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `orderByAscending:` 或 `orderByDescending:` 方法，则按距离排序会被新排序覆盖。**

要查找指定距离范围内的数据，可使用 `whereWithinKilometers` 、 `whereWithinMiles` 或 `whereWithinRadians` 方法。

要查找位于矩形范围内的信息，可使用 `whereWithinGeoBox` 来实现：

``` objc
AVGeoPoint *point1 = [AVGeoPoint geoPointWithLatitude:39.97 longitude:116.33];
AVGeoPoint *point2 = [AVGeoPoint geoPointWithLatitude:39.99 longitude:116.37];
AVQuery *query = [AVQuery queryWithClassName:@"Post"];
[query whereKey:@"location" withinGeoBoxFromSouthwest:point1 toNortheast:point2];
NSArray<AVObject *> *posts = [query findObjects];
```

### 注意事项

目前需要注意以下方面：

* 每个 `AVObject` 数据对象中只能有一个 `AVGeoPoint` 对象。
* 地理位置的点不能超过规定的范围。纬度的范围应该是在 `-90.0` 到 `90.0` 之间，经度的范围应该是在 `-180.0` 到 `180.0` 之间。如果添加的经纬度超出了以上范围，将导致程序错误。
* iOS 8.0 之后，使用定位服务之前，需要调用 `[locationManager requestWhenInUseAuthorization]` 或 `[locationManager requestAlwaysAuthorization]` 来获取用户的「使用期授权」或「永久授权」，而这两个请求授权需要在 `info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationAlwaysUsageDescription` 的键值对，值为开启定位服务原因的描述。SDK 内部默认使用的是「使用期授权」。

## 调用云引擎

### 调用云引擎函数

使用 `AVCloud` 类的静态方法来调用云引擎中定义的函数：

``` objc
    NSDictionary *parameters = @{...};

    [AVCloud callFunctionInBackground:@"aFunctionName" withParameters:parameters block:^(id object, NSError *error) {
        // 执行结果
    }];
```

`aFunctionName` 是函数的名称，`parameters` 是传入的函数参数，`block` 对象作为调用结果的回调传入。

### RPC 云引擎调用

上文提到的 `+[AVCloud callFunctionInBackground:withParameters:block:]` 方法返回的结果是 `NSDictionary` 对象，而不是 `AVObject` 对象。为了实现直接返回 `AVObject` 对象，iOS SDK 在 v3.1.6.6 中加入了 RPC 调用。

RPC 云引擎调用的方法签名以 `rpc` 方法打头，例如 `+[AVCloud rpcFunctionInBackground:withParameters:block:]`，除此之外，还有其他的变种。

以下是 RPC 云引擎调用的一个示例：

``` objc
    NSDictionary *parameters = @{...};

    [AVCloud rpcFunctionInBackground:@"aFunctionName" withParameters:parameters block:^(id object, NSError *error) {
        // 执行结果
    }];
```

### 区分生产环境调用

云引擎区分「测试环境」和「生产环境」，使用 `AVCloud` 的 `setProductionMode` 方法可以切换环境：

``` objc
[AVCloud setProductionMode:NO];
```

其中 `NO` 表示「测试环境」，默认调用生产环境云引擎。

