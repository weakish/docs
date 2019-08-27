{% import "views/_helper.njk" as docs %}

# ACL 与数据安全

**一个应用的权限管理是否健全，是判断其能否正式发布的核心标准**，任何一家应用开发厂商都不会希望自己的应用在发布之后依然存在安全漏洞。

让我们先来讨论下面这个问题：

Q：AppId 和 AppKey 泄露了怎么办？

众所周知，在使用 LeanCloud SDK 的时候，是需要在客户端显式调用初始化的方法设置 AppId 以及 AppKey，这就存在一种可能：竞争对手把你的 apk 或者打包好的安装程序进行反编译，他并不需要完全读懂你的业务逻辑代码，他只要提取出 AppId 以及 AppKey 就可以模拟客户端进行恶意的提交请求，后果不堪设想。这是一种泄露的可能性，危害极大。

还有一种可能性，开发团队的成员离职了，AppId 和 AppKey 都被 TA 曾经使用或者查看过，那么这也是一种隐患，因此，我们始终认为 AppId 和 AppKey 在面对因为人为造成的不可控的局面的时候，它的防御体系还不能满足应用安全需求，因此我们设计了 ACL 权限管理模块来帮助实现权限的管理。

关于上面的问题，简短的回答如下：

A：首先，我们推荐所有基于 LeanCloud 开发的团队的成员都采取协作者的方式参与实际的开发，再者是做好应用安装包的加密和分发管理，当然最有效的方法就是严格按照文档所建议的采用 ACL 的权限控制来做好服务端数据的权限管理，LeanCloud 不管是 SDK 还是 REST API 请求都会对 ACL 做严格的验证，鉴权失败的请求不会生效。

接下来我们对比一下使用 ACL 和不使用的一些差异。

## 不使用 ACL

实现代码

```objc
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"大家好，我是新人" forKey:@"title"];
[post setObject:@"我喜欢看新闻和阅读报纸。" forKey:@"content"];
[post saveInBackground];
```
```java
AVObject post = new AVObject("Post");
post.put("title", "大家好，我是新人");
post.put("content", "我喜欢看新闻和阅读报纸。");

post.saveInBackground().blockingSubscribe();
```
```javascript
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");
  post.save();
```
```python
import leancloud
from leancloud import Object

# 新建一个帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')
post.set('content', '我喜欢看新闻和阅读报纸。')
post.save()
```

执行结果

<img src="images/console-class-post-without-acl.png">

模拟请求

```
curl -X PUT \
  -H "X-LC-Id:m7baukzusy3l5coew0b3em5uf4df5i2krky0ypbmee358yon" \
  -H "X-LC-Key:wzlzc2ncc7srg1uox5w2eolqpt8vidn8wsk40ce1676ieqxz" \
  -H "Content-Type: application/json" \
  -d '{"content": "修改内容！"}' \
  https://{{host}}/1.1/classes/Post/58705a24128fe1006b275274
```

请求结果
```json
{
  "updatedAt":"2015-09-10T06:52:14.137Z",
  "objectId":"58705a24128fe1006b275274"
}
```

请求成功，查看控制台，数据已被修改。

【原因】未设置 ACL 属性，修改成功。只要拥有 AppId 和 AppKey 就可以提交请求，而云端会接收请求，因为它的 ACL 值是允许所有人可写可读，所以请求被云端接收。

## 使用 ACL

实现代码

```objc
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"大家好，我是新人" forKey:@"title"];
[post setObject:@"我喜欢看新闻和阅读报纸。" forKey:@"content"];
    
//新建一个 ACL 实例
AVACL *acl = [AVACL ACL];
[acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
[acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限
post.ACL = acl;// 将 ACL 实例赋予 Post对象
    
[post saveInBackground];
```
```java
AVObject post = new AVObject("Post");
post.put("title", "大家好，我是新人");
post.put("content", "我喜欢看新闻和阅读报纸。");

AVACL acl = new AVACL();
acl.setPublicReadAccess(true);   //此处设置的是所有人的可读权限
acl.setWriteAccess(AVUser.getCurrentUser(), true);   //而这里设置了 Post 创建者的写权限

post.setACL(acl);//设置 ACL

post.saveInBackground().blockingSubscribe();
```
```javascript
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");

  // 新建一个 ACL 实例
  var acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(),true);

  // 将 ACL 实例赋予 Post 对象
  post.setACL(acl);
  post.save();
```
```python
import leancloud
from leancloud import Object
from leancloud import ACL

# 新建一个帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')
post.set('content', '我喜欢看新闻和阅读报纸。')


# 新建一个ACL实例
acl = ACL()
acl.set_public_read_access(True)
acl.set_write_access('{{ docs.mustache("userObjectId") }}', True) # 这里设置某个 user 的写权限

# 将 ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
```

执行结果

![](images/console-class-post-with-acl.png)

模拟请求

```curl
curl -X PUT \
  -H "X-LC-Id:m7baukzusy3l5coew0b3em5uf4df5i2krky0ypbmee358yon" \
  -H "X-LC-Key:wzlzc2ncc7srg1uox5w2eolqpt8vidn8wsk40ce1676ieqxz" \
  -H "Content-Type: application/json" \
  -d '{"content": "修改内容！"}' \
  https://{{host}}/1.1/classes/Post/58705a24128fe1006b275274
```

请求结果

```
{
  "code":1,
  "error":"Forbidden writing by object's ACL."
}
```

**请求失败**，查看控制台，数据未被修改。

【原因】设置了 ACL 属性，请求失败，云端发现修改请求并没有携带用户的 SessionToken，而 ACL 的值显示该条 Post 只允许一个特定的用户修改，所以请求被云端拒绝。

以上的对比仅仅演示了 ACL 的一个基本用法，关于 ACL 权限控制的详细用法请阅读《[ACL 权限管理开发指南](acl-guide.html)》。


## 常见问题

Q：**APK 被反编译，其他竞争对手或者攻击者恶意模拟提交请求，怎么办？**

A：首先，发现这种情况，请及时联系 LeanCloud ，会有专职工程师帮助先紧急屏蔽掉一些恶意 IP 或者恶意请求；其次，针对应用比较敏感的表，比如自定义的付费信息表，下载连接地址等容易被黑客获取进行二次攻击的敏感数据，一定要按照 ACL 的规范进行设置，比如，有些表只允许某一个特定的用户或者是某一个特定的角色读取，并且黑客无法通过源代码来获取到用户信息，因此黑客模拟的请求在 LeanCloud 服务端会因为鉴权失败而被拒绝执行，确保数据的安全。



