# 在云引擎中使用 ACL

云引擎（LeanEngine）提供给开发者自定义云端逻辑的接口，例如开发者想记录每一个用户登录系统的时间，打印一下日志，以备之后的查询和分析，那么云引擎提供的接口就可以实现这一需求，详细的操作请查看：

* [云引擎 Node.js 环境](leanengine_cloudfunction_guide-node.html)
* [云引擎 Python 环境](leanengine_cloudfunction_guide-python.html)
* [云引擎 PHP 环境](leanengine_cloudfunction_guide-php.html)
* [云引擎 Java 环境](leanengine_cloudfunction_guide-java.html)

提到以上这个需求是为了让开发者更好地理解以下的需求描述：

假如开发者的应用有 iOS、Android、Web（JavaScript）各种版本，针对权限管理的逻辑代码会遍布各个客户端，开发者会重复书写逻辑极其类似的代码，只不过是不同语言的版本而已。因此，假如有一个云端的接口，让开发者可以在创建对象或者更新对象的时候，为其添加 ACL 相关的代码，那么各个客户端就无需再重复编码。

我们从一个简单的实例入手：

我们希望每发一篇帖子，不管是从 iOS 还是 Android，还是任意客户端发出的，都希望 Administrator 具备对它读写的权限。

第一步，我们需要编写我们的云引擎 Hook 函数（关于云引擎 Hook 函数介绍请查看 [Save AVObject 前执行操作](leanengine_cloudfunction_guide-node.html#beforeSave)）：

**Node.js**

```javascript
AV.Cloud.beforeSave('Post', function(request, response) {
  // 如果之前已经存在 Administrator 角色，就参照下面代码查询出 Administrator 的 AV.Role 的实例
  /*
    var roleQuery = new AV.Query(AV.Role);
    roleQuery.equalTo('name', 'Administrator');
    roleQuery.find().then(function(results) {
      var administratorRole = results[0];
    });
  */
  var post = request.object;
  if (post) {
    // 新建一个 ACL 实例
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    // 为了更为便捷我们直接提供了根据名字设置权限的方法
    acl.setRoleWriteAccess('Administrator',true);
    // 如果是查询出来的 AV.Role 实例可以如下书写，效果是等价的
    //  acl.setRoleWriteAccess(administratorRole,true);

    post.setACL(acl);

    // 保存到数据库中
    response.success();
  } else {
    // 不保存数据，并返回错误
    response.error('未发现有效的 Post 对象；');
  }
});
```

第二步，部署代码到云端（[如何部署](leanengine_webhosting_guide-node.html#部署与发布)）。

第三步，在客户端保存一个 `Post` 对象：

**iOS**

```objc
 AVObject *post = [AVObject objectWithClassName:@"Post"];
 [post setObject:@"大家好，我是新人" forKey:@"title"];
 [post setObject:@"我喜欢看新闻和阅读报纸，请多多关照" forKey:@"content"]

 [post saveInBackground];
```

**Android**

```java
 // 新建一个帖子对象
 AVObject post = new AVObject('Post');
 post.put('title', '大家好，我是新人');

 post.saveInBackground();// 保存
```

第四步，打开控制台，查看新增的 `Post` 的对象中的 ACL 的值：

```json
{"*":{"read":true},"role:Administrator":{"write":true}}
```

如此做，客户端的代码就只要针对 `Post` 进行新增，无需在 iOS，Android 以及其他客户端中添加 `Administrator` 针对 `Post` 的 ACL 赋值的代码。

总结：云引擎 Hook 函数提供了一种云端自定义逻辑的入口。开发者要结合当前应用的业务场景，考虑 ACL 相关的控制逻辑代码放在客户端还是云端。
