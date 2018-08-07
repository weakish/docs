把下面这行代码加入你的测试页面中：


```
<script src="//cdn1.lncld.net/static/js/{{jssdkversion}}/av-min.js"></script>
```

进行代码初始化，加入这行代码后，就可以创建 class 或任何其他操作了。想要跟进最新功能，可以到官方的 [GitHub Repo](https://github.com/leancloud/javascript-sdk) 。

{% if node=='qcloud' %}
创建应用后，可以在 `控制台 - 应用设置` 里面找到应用对应的 appId 和 appKey。
{% else %}
创建应用后，可以在 [控制台 - 应用设置](/app.html?appid={{appid}}#/key) 里面找到应用对应的 appId 和 appKey。
{% endif %}

```
// 应用 ID，用来识别应用
var APP_ID = '{{appid}}';

// 应用 Key，用来校验权限（Web 端可以配置安全域名来保护数据安全）
var APP_KEY = '{{appkey}}';

// 初始化
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
```

SDK 的初始化方法默认使用中国大陆节点，切换到其他可用节点的方法是：

```
var APP_ID = '{{appid}}';
var APP_KEY = '{{appkey}}';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  {% if node != 'qcloud' %}
  // 启用美国节点
  region: 'us'
  {% else %}
  // 目前仅支持中国节点
  region: 'cn'
  {% endif %}
});
```

开始测试。初始化后加入下面代码：

```
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  testabc: 'abc123'
}).then(function() {
  alert('LeanCloud works!');
}).catch(function(err) {
  alert('error:' + err);
});
```

{% if node=='qcloud' %}
大功告成！就这么简单，你就可以存储一条任意的数据到数据库中了，不再需要繁琐的数据库配置，甚至是服务端代码。访问 `控制台 - 数据管理` 可以看到上面创建的 TestObject 的相关数据。
{% else %}
大功告成！就这么简单，你就可以存储一条任意的数据到数据库中了，不再需要繁琐的数据库配置，甚至是服务端代码。访问 [控制台 - 数据管理](/data.html?appid={{appid}}#/TestObject) 可以看到上面创建的 TestObject 的相关数据。
{% endif %}
当然，还可以同样非常简单地基于 LeanCloud 实现[账号系统](leanstorage_guide-js.html#用户)、{% if node != 'qcloud' and node != 'us' %}[短信发送](sms_guide-js.html)、{% endif %}[即时通讯](realtime_guide-js.html)等功能，快速入门之后还有丰富的文档和 Demo 你可以尝试。

你也可以通过 bower 安装 JavaScript SDK：

```
bower install leancloud-storage --save
```

如果你希望在 Node.js 环境使用 JavaScript SDK 也可以，使用 npm 安装 SDK：

```
npm install leancloud-storage --save
```

然后代码中使用 SDK：

```
var AV = require('leancloud-storage');
var APP_ID = '{{appid}}';
var APP_KEY = '{{appkey}}';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
```

LeanCloud 同时也提供了一个完整的 Nodejs 环境，我们称之为 LeanEngine（云引擎），更推荐基于 LeanEngine 来实现并部署 Nodejs 相关的代码。详细请参考[云引擎文档](leanengine_overview.html) 。
