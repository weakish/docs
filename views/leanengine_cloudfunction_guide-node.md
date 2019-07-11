{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = "Node.js" %}
{% set runtimeName = "node" %}
{% set gettingStartedName = "node-js-getting-started" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine Node.js SDK](https://github.com/leancloud/leanengine-node-sdk)" %}
{% set storage_guide_url = "[JavaScript SDK](./leanstorage_guide-js.html)" %}
{% set cloud_func_file = "`cloud.js`" %}
{% set runFuncName = "`AV.Cloud.run`" %}
{% set defineFuncName = "`AV.Cloud.define`" %}
{% set runFuncApiLink = "[AV.Cloud.run](https://leancloud.github.io/javascript-sdk/docs/AV.Cloud.html#.run)" %}
{% set hook_before_save = "beforeSave" %}
{% set hook_after_save = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete = "afterDelete" %}
{% set hook_on_verified = "onVerified" %}
{% set hook_on_login = "onLogin" %}
{% set hook_message_received = "onIMMessageReceived" %}
{% set hook_receiver_offline = "onIMReceiversOffline" %}
{% set hook_message_sent = "onIMMessageSent" %}
{% set hook_conversation_start = "onIMConversationStart" %}
{% set hook_conversation_started = "onIMConversationStarted" %}
{% set hook_conversation_add = "onIMConversationAdd" %}
{% set hook_conversation_remove = "onIMConversationRemove" %}
{% set hook_conversation_update = "onIMConversationUpdate" %}

{% block cloudFuncExample %}

```nodejs
AV.Cloud.define('averageStars', function(request) {
  var query = new AV.Query('Review');
  query.equalTo('movie', request.params.movie);
  return query.find().then(function(results) {
    var sum = 0;
    for (var i = 0; i < results.length; i++ ) {
      sum += results[i].get('stars');
    }
    return sum / results.length;
  });
});
```
{% endblock %}

{% block cloudFuncParams %}

`Request` 会作为参数传入到云函数中，Request 上的属性包括：

* `params: object`：客户端发送的参数对象，当使用 `rpc` 调用时，也可能是 `AV.Object`。
* `currentUser?: AV.User`：客户端所关联的用户（根据客户端发送的 `X-LC-Session` 头）。
* `sessionToken?: string`：客户端发来的 sessionToken（`X-LC-Session` 头）。
* `meta: object`：有关客户端的更多信息，目前只有一个 `remoteAddress` 属性表示客户端的 IP。

另外，`AV.Cloud.define` 还接受一个可选参数 `options` (位置在函数名称和调用函数之间)。
这个 `options` 对象上的属性包括：

- `fetchUser: boolean`：是否自动抓取客户端的用户信息，默认为真。设置为假时，`Request` 将不会有 `currentUser` 属性。
- `internal: boolean`：是否只允许在云引擎内（使用 `AV.Cloud.run` 且未开启 `remote` 选项）或使用 master key （使用 `AV.Cloud.run` 时传入 `useMasterKey`）调用，不允许客户端直接调用。默认为假。

例如，假设我们不希望客户端直接调用上述函数，也不关心客户端用户信息，那么上述函数的定义可以改写为：

```nodejs
AV.Cloud.define('averageStars', {fetchUser: false, internal: true}, function(request) {
  // 定义同上
});
```

如果云函数返回了一个 Promise，那么云函数会使用 Promise 成功结束后的结果作为成功响应；如果 Promise 中发生了错误，云函数会使用这个错误作为错误响应，对于使用 `AV.Cloud.Error` 构造的异常对象，我们认为是客户端错误，不会在标准输出打印消息，对于其他异常则会在标准输出打印调用栈，以便排查错误。

我们推荐大家使用链式的 Promise 写法来完成业务逻辑，这样会极大地方便异步任务的处理和异常处理，**请注意一定要将 Promise 串联起来并在云函数中 return** 以保证上述逻辑正确工作，推荐阅读 [JavaScript Promise 迷你书](http://liubin.org/promises-book/) 来深入地了解 Promise。

{{ docs.alert("在 2.0 之前的早期版本中，云函数接受 `request` 和 `response` 两个参数，我们会继续兼容这种用法到下一个大版本，希望开发者尽快迁移到 Promise 风格的云函数上。之前版本的文档见《[Node SDK v1 API 文档](https://github.com/leancloud/leanengine-node-sdk/blob/v1/API.md)》。") }}

{% endblock %}

{% block runFuncExample %}

```nodejs
AV.Cloud.run('averageStars', {
  movie: '夏洛特烦恼',
}).then(function(data) {
  // 调用成功，得到成功的应答 data
}, function(error) {
  // 处理调用失败
});
```

云引擎中默认会直接进行一次本地的函数调用，而不会像客户端一样发起一个 HTTP 请求。如果你希望发起 HTTP 请求来调用云函数，可以传入一个 `remote: true` 的选项。当你在云引擎之外运行 Node SDK 时（包括在拓展分组的云引擎上调用主分组上的云函数时）这个选项非常有用：

```nodejs
AV.Cloud.run('averageStars', {movie: '夏洛特烦恼'}, {remote: true}).then(function(data) {
  // 成功
}, function(error) {
  // 失败
});
```

上面的 `remote` 选项实际上是作为 `AV.Cloud.run` 的可选参数 options 对象的属性传入的。
这个 `options` 对象包括以下参数：

- `remote?: boolean`：上面的例子用到的 `remote` 选项，默认为假。 
- `user?: AV.User`：以特定的用户运行云函数（建议在 `remote` 为假时使用）。
- `sessionToken?: string`：以特定的 `sessionToken` 调用云函数（建议在 `remote` 为真时使用）。
- `req?: http.ClientRequest | express.Request`：为被调用的云函数提供 `remoteAddress` 等属性。

{% endblock %}

{% block cloudFuncTimeout %}

### 云函数超时

云函数超时时间为 15 秒，如果超过阈值，{{leanengine_middleware}} 将强制响应：

* 客户端收到 HTTP status code 为 503 响应，body 为 `The request timed out on the server.`。
* 服务端会出现类似这样的日志：`LeanEngine: /1.1/functions/<cloudFunc>: function timeout (15000ms)`。

另外还需要注意：虽然 {{leanengine_middleware}} 已经响应，但此时云函数可能仍在执行，但执行完毕后的响应是无意义的（不会发给客户端，会在日志中打印一个 `Can't set headers after they are sent` 的异常）。

#### 超时的处理方案

我们建议将代码中的任务转化为异步队列处理，以优化运行时间，避免云函数或 [定时任务](#定时任务) 发生超时。比如：

- 在存储服务中创建一个队列表，包含 `status` 列；
- 接到任务后，向队列表保存一条记录，status 值设置为「处理中」，然后将请求结束掉，将队列对象的 id 发给客户端（旧版本的 SDK 使用 `response.success(id)`）：

```nodejs
  return new Promise( (resolve, reject) => {
    resolve(id);
  });
```
- 当业务处理完毕，根据处理结果更新刚才的队列对象状态，将 `status` 字段设置为「完成」或者「失败」；
- 在任何时候，在控制台通过队列 id 可以获取某个任务的执行结果，判断任务状态。
{% endblock %}

{% block beforeSaveExample %}

```nodejs
AV.Cloud.beforeSave('Review', function(request) {
  var comment = request.object.get('comment');
  if (comment) {
    if (comment.length > 140) {
      // 截断并添加...
      request.object.set('comment', comment.substring(0, 137) + '...');
    }
  } else {
    // 不保存数据，并返回错误
    throw new AV.Cloud.Error('No comment!');
  }
});
```

上面的代码示例中，`request.object` 是被操作的 `AV.Object`。
除了 `object` 之外，`request` 上还有一个属性：

- `currentUser?: AV.User`，表示发起操作的用户。

类似地，其他 hook 的 `request` 参数上也包括 `object` 和 `currentUser` 这两个属性。

{{ docs.alert("在 2.0 之前的早期版本中，before 类 Hook 接受 `request` 和 `response` 两个参数，我们会继续兼容这种用法到下一个大版本，希望开发者尽快迁移到 Promise 风格的云函数上。之前版本的文档见《[Node SDK v1 API 文档](https://github.com/leancloud/leanengine-node-sdk/blob/v1/API.md)》。") }}

{% endblock %}

{% block afterSaveExample %}

```nodejs
AV.Cloud.afterSave('Comment', function(request) {
  var query = new AV.Query('Post');
  return query.get(request.object.get('post').id).then(function(post) {
    post.increment('comments');
    return post.save();
  });
});
```
{% endblock %}

{% block afterSaveExample2 %}

```nodejs
AV.Cloud.afterSave('_User', function(request) {
  console.log(request.object);
  request.object.set('from','LeanCloud');
  return request.object.save().then(function(user)  {
    console.log('ok!');
  });
});
```

虽然对于 after 类的 Hook 我们并不关心返回值，但我们仍建议你返回一个 Promise，这样如果发生了非预期的错误，会自动在标准输出中打印异常信息和调用栈。
{% endblock %}

{% block beforeUpdateExample %}

```nodejs
AV.Cloud.beforeUpdate('Review', function(request) {
  // 如果 comment 字段被修改了，检查该字段的长度
  if (request.object.updatedKeys.indexOf('comment') != -1) {
    if (request.object.get('comment').length > 140) {
      // 拒绝过长的修改
      throw new AV.Cloud.Error('comment 长度不得超过 140 字符');
    }
  }
});
```

**注意：** 不要修改 `request.object`，因为对它的改动并不会保存到数据库，但可以抛出一个异常，拒绝这次修改。

{% endblock %}

{% block afterUpdateExample %}

```nodejs
AV.Cloud.afterUpdate('Review', function(request) {
  if (request.object.updatedKeys.indexOf('comment') != -1) {
    if (request.object.get('comment').length < 5) {
      console.log("疑似灌水评论： " + comment + " 于点评 " + review.ObjectId)
    }
  }
});
```
{% endblock %}

{% block beforeDeleteExample %}

```nodejs
AV.Cloud.beforeDelete('Album', function(request) {
  //查询Photo中还有没有属于这个相册的照片
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  return query.count().then(function(count) {
    if (count > 0) {
      //还有照片，不能删除，调用error方法
      throw new AV.Cloud.Error('Can\'t delete album if it still has photos.');
    }
  }, function(error) {
    throw new AV.Cloud.Error('Error ' + error.code + ' : ' + error.message + ' when getting photo count.');
  });
});
```
{% endblock %}

{% block afterDeleteExample %}

```nodejs
AV.Cloud.afterDelete('Album', function(request) {
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  return query.find().then(function(posts) {
    //查询本相册的照片，遍历删除
    return AV.Object.destroyAll(posts);
  }).catch(function(error) {
    console.error('Error finding related comments ' + error.code + ': ' + error.message);
  });
});
```
{% endblock %}

{% block onVerifiedExample %}

```nodejs
AV.Cloud.onVerified('sms', function(request) {
  console.log('onVerified: sms, user: ' + request.object);
});
```

上面的代码示例中的 `object` 换成 `currentUser` 也可以。因为这里被操作的对象正好是发起操作的用户。
下面的 `onLogin` 函数同理。
{% endblock %}

{% block onLoginExample %}

```nodejs
AV.Cloud.onLogin(function(request) {
  // 因为此时用户还没有登录，所以用户信息是保存在 request.object 对象中
  console.log("on login:", request.object);
  if (request.object.get('username') == 'noLogin') {
    // 如果是 error 回调，则用户无法登录（收到 401 响应）
    throw new AV.Cloud.Error('Forbidden');
  }
});
```
{% endblock %}

{% block errorCodeExample %}

AV.Cloud.Error 的第二个参数中可以用 `status` 指定 HTTP 响应代码（默认为 400），还可以用 `code` 指定响应正文中的错误代码（默认为 1）：

```nodejs
AV.Cloud.define('errorCode', function(request) {
  return AV.User.logIn('NoThisUser', 'lalala');
});
```
{% endblock %}

{% block errorCodeExample2 %}

```nodejs
AV.Cloud.define('customErrorCode', function(request) {
  throw new AV.Cloud.Error('自定义错误信息', {code: 123});
});
```
{% endblock %}

{% block errorCodeExampleForHooks %}

```nodejs
AV.Cloud.beforeSave('Review', function(request) {
  // 使用 JSON.stringify() 将 object 变为字符串
  throw new AV.Cloud.Error(JSON.stringify({
    code: 123,
    message: '自定义错误信息'
  }));
});
```
{% endblock %}

{% block online_editor %}

## 在线编写云函数

很多人使用 {{productName}} 是为了在服务端提供一些个性化的方法供各终端调用，而不希望关心诸如代码托管、npm 依赖管理等问题。为此我们提供了在线维护云函数的功能。

使用此功能需要注意：

* 在定义的函数会覆盖你之前用 Git 或命令行部署的项目。
* 目前只能在线编写云函数和 Hook，不支持托管静态网页、编写动态路由。

在 **[控制台 > 云引擎 > 部署 > 在线编辑](/dashboard/cloud.html?appid={{appid}}#/deploy)** 标签页，可以：

* **创建函数**：指定函数类型，函数名称，函数体的具体代码，注释等信息，然后「保存」即可创建一个云函数。
* **部署**：选择要部署的环境，点击「部署」即可看到部署过程和结果。
* **预览**：会将所有函数汇总并生成一个完整的代码段，可以确认代码，或者将其保存为 `cloud.js` 覆盖项目模板的同名文件，即可快速的转换为使用项目部署。
* **维护云函数**：可以编辑已有云函数，查看保存历史，以及删除云函数。

{{ docs.alert("云函数编辑之后需要点击 **部署** 才能生效。") }}

### 在线编写的 SDK 版本

目前在线编辑仅支持 Node.js，提供了 4 种 SDK 版本：

在线编辑版本|Node SDK|JS SDK|Node.js|备注|可用依赖
---|---|---|---|---|---
v0|0.x|0.x|0.12|已不推荐使用|moment, request, underscore
v1|1.x|1.x|4||async, bluebird, co, ejs, handlebars, joi, lodash, marked, moment, q, request, superagent, underscore
v2|2.x|2.x|6|需要使用 Promise 写法|async, bluebird, crypto, debug, ejs, jade, lodash, moment, nodemailer, qiniu, redis, request, request-promise, superagent, underscore, uuid, wechat-api, xml2js
v3|3.x|3.x|8|需要使用 Promise 写法|async, bluebird, crypto, debug, ejs, jade, lodash, moment, nodemailer, qiniu, redis, request, request-promise, superagent, underscore, uuid, wechat-api, xml2js

**从 v0 升级到 v1：**

- JS SDK 升级到了 [1.0](https://github.com/leancloud/javascript-sdk/releases/tag/v1.0.0)
- 需要从 `request.currentUser` 获取用户，而不是 `AV.User.current`
- 在调用 `AV.Cloud.run` 时需要手动传递 user 对象

**从 v1 升级到 v2：**

- JS SDK 升级到 [2.0](https://github.com/leancloud/javascript-sdk/releases/tag/v2.0.0)（必须使用 Promise，不再支持 callback 风格）
- 删除了 `AV.Cloud.httpRequest`
- 在云函数中 **必须** 返回 Promise 作为云函数的值，抛出 AV.Cloud.Error 来表示错误。

**从 v2 升级到 v3：**

- JS SDK 升级到了 [3.0](https://github.com/leancloud/javascript-sdk/releases/tag/v3.0.0)（AV.Object#toJSON 的行为变化等）

{% endblock %}

{% block timerExample %}

```nodejs
AV.Cloud.define('log_timer', function(request){
  console.log('Log in timer.');
});
```
{% endblock %}

{% block timerExample2 %}

```nodejs
AV.Cloud.define('push_timer', function(request){
  return AV.Push.send({
    channels: ['Public'],
    data: {
      alert: 'Public message'
    }
  });
});
```
{% endblock %}

{% block code_hook_message_received %}

```nodejs
AV.Cloud.onIMMessageReceived((request) => {
	// request.params = {
	// 	fromPeer: 'Tom',
	// 	receipt: false,
	// 	groupId: null,
	// 	system: null,
	// 	content: '{"_lctext":"耗子，起床！","_lctype":-1}',
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	toPeers: ['Jerry'],
	// 	__sign: '1472200796787,a0e99be208c6bce92d516c10ff3f598de8f650b9',
	// 	bin: false,
	// 	transient: false,
	// 	sourceIP: '121.239.62.103',
	// 	timestamp: 1472200796764
	// };

	let content = request.params.content;
	console.log('content', content);
	let processedContent = content.replace('XX中介', '**');
	// 必须含有以下语句给服务端一个正确的返回，否则会引起异常
  return {
    content: processedContent
  };
});
```
{% endblock %}

{% block code_hook_receiver_offline %}

```nodejs
AV.Cloud.onIMReceiversOffline((request) => {
	let params = request.params;
	let content = params.content;

  // params.content 为消息的内容
	let shortContent = content;

	if (shortContent.length > 6) {
		shortContent = content.slice(0, 6);
	}

	console.log('shortContent', shortContent);

  return {
    pushMessage: JSON.stringify({
  		// 自增未读消息的数目，不想自增就设为数字
  		badge: "Increment",
  		sound: "default",
  		// 使用开发证书
  		_profile: "dev",
  		alert: shortContent
  	})
  }
});
```
{% endblock %}


{% block code_hook_message_sent %}

```nodejs
AV.Cloud.onIMMessageSent((request) => {
	console.log('params', request.params);

	// 在云引擎中打印的日志如下：
	// params { fromPeer: 'Tom',
	//   receipt: false,
	//   onlinePeers: [],
	//   content: '12345678',
	//   convId: '5789a33a1b8694ad267d8040',
	//   msgId: 'fptKnuYYQMGdiSt_Zs7zDA',
	//   __sign: '1472703266575,30e1c9b325410f96c804f737035a0f6a2d86d711',
	//   bin: false,
	//   transient: false,
	//   sourceIP: '114.219.127.186',
	//   offlinePeers: [ 'Jerry' ],
	//   timestamp: 1472703266522 }
});
```
{% endblock %}

{% block code_hook_conversation_start %}

```nodejs
AV.Cloud.onIMConversationStart((request) => {
	let params = request.params;
	console.log('params', params);

	// 在云引擎中打印的日志如下：
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Tom', 'Jerry'],
	// 	attr: {
	// 		name: 'Tom & Jerry'
	// 	},
	// 	__sign: '1472703266397,b57285517a95028f8b7c34c68f419847a049ef26'
	// }
});
```
{% endblock %}

{% block code_hook_conversation_started %}

```nodejs
AV.Cloud.onIMConversationStarted((request) => {
	let params = request.params;
	console.log('params', params);

	// 在云引擎中打印的日志如下：
	// params {
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	__sign: '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb'
	// }
});
```
{% endblock %}

{% block code_hook_conversation_add %}

```nodejs
AV.Cloud.onIMConversationAdd((request) => {
	let params = request.params;
	console.log('params', params);

	// 在云引擎中打印的日志如下：
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Mary'],
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	__sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
	// }
});
```
{% endblock %}

{% block code_hook_conversation_remove %}

```nodejs
AV.Cloud.onIMConversationRemove((request) => {
	let params = request.params;
	console.log('params', params);
	console.log('removed client Id:', params.members[0]);

	// 在云引擎中打印的日志如下：
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Jerry'],
	// 	convId: '57c8f3ac92509726c3dadaba',
	// 	__sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
	// }
	//removed client Id: Jerry
});
```
{% endblock %}
{% block code_hook_conversation_update %}

```nodejs
AV.Cloud.onIMConversationUpdate((request) => {
	let params = request.params;
	console.log('params', params);
	console.log('name', params.attr.name);

	// 在云引擎中打印的日志如下：
	// params {
	// 	convId: '57c9208292509726c3dadb4b',
	// 	initBy: 'Tom',
	// 	attr: {
	// 		name: '聪明的喵星人',
	// 		type: 'public'
	// 	},
	// name 聪明的喵星人
});
```
{% endblock %}
{% block hookDeadLoop %}

{{ 
    LE.deadLoopText()
}}

```nodejs
// 直接修改并保存对象不会再次触发 afterUpdate Hook 函数
request.object.set('foo', 'bar');
request.object.save().then(function(obj) {
  // 你的业务逻辑
});

// 如果有 fetch 操作，则需要在新获得的对象上调用相关的 disable 方法
// 来确保不会再次触发 Hook 函数
request.object.fetch().then(function(obj) {
  obj.disableAfterHook();
  obj.set('foo', 'bar');
  return obj.save();
}).then(function(obj) {
  // 你的业务逻辑
});

// 如果是其他方式构建对象，则需要在新构建的对象上调用相关的 disable 方法
// 来确保不会再次触发 Hook 函数
var obj = AV.Object.createWithoutData('Post', request.object.id);
obj.disableAfterHook();
obj.set('foo', 'bar');
obj.save().then(function(obj) {
  // 你的业务逻辑
});
```
{% endblock %}


{% block useMasterKey %}
```javascript
// 通常位于 server.js
AV.Cloud.useMasterKey();
```
{% endblock %}

{% set authOptionsGuide %}
```javascript
var post = new Post();
post.save({
  author: user
}, {
  // 或者使用 request.sessionToken（网站托管中需启用 `Cloud.CookieSession`）
  sessionToken: user.getSessionToken()
});
```

或者你也可单独对某一个操作使用 Master Key，跳过权限检查：

```javascript
post.destroy({useMasterKey: true});
```

当然你也可以在启用了超级权限的情况下使用 `useMasterKey: false` 来对单个操作关掉超级权限。
{% endset %}
