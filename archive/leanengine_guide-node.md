{% extends "./leanengine_guide.tmpl" %}
{% set environment        = "node.js" %}
{% set hook_before_save   = "beforeSave" %}
{% set hook_after_save    = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update  = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete  = "afterDelete" %}
{% set hook_on_verified   = "onVerified" %}
{% set hook_on_login      = "onLogin" %}

{% block quick_start_create_project %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone https://github.com/leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud add <appName> <appId>
```
{% endblock %}

{% block demo %}
* [node-js-getting-started](https://github.com/leancloud/node-js-getting-started)：这是一个非常简单的基于 Express 4 的项目，可以作为大家的项目模板。（在线演示：<http://node.leanapp.cn/>） 
* [leanengine-todo-demo](https://github.com/leancloud/leanengine-todo-demo)：这是一个稍微复杂点的项目，是上一个项目的扩展，演示了基本的用户注册、会话管理、业务数据的增删查改、简单的 ACL 使用。这个项目可以作为初学云引擎和 [JavaScript SDK](leanstorage_guide-js.html) 使用。（在线演示：<http://todo-demo.leanapp.cn/>）
* [LeanEngine-Full-Stack](https://github.com/leancloud/LeanEngine-Full-Stack) ：该项目是基于云引擎的 Web 全栈开发的技术解决方案，比较大型的 Web 项目可以使用这个结构实现从 0 到 1 的敏捷开发。
{% endblock %}

{% block runtime_env %}
**注意**：
- 目前云引擎的 Node.js 版本为 0.12，请你最好使用此版本进行开发，至少不要低于 0.10。
- 由于云引擎尚未支持 Node.js 4.x 版本，如果希望使用 ECMAScript 6 所提供的新语法，请在项目的 `package.json` 中为 node 加入 `--harmony` 参数，例如：
  
  ```json
  ...
  "scripts": {
    "start": "node --harmony server.js"
  },
  ...
  ```
{% endblock %}

{% block run_in_local_command %}
安装依赖：

```
$ npm install
```

启动应用：

```
$ avoscloud
```
{% endblock %}

{% set cloud_func_file = '`$PROJECT_DIR/cloud.js`' %}

{% block project_constraint %}
云引擎Node.js 项目必须有 `$PROJECT_DIR/server.js` 文件，该文件为整个项目的启动文件。

**注意：**项目中**不能**有 `$PROJECT_DIR/cloud/main.js` 文件，否则会被识别为 [2.0 版本](./leanengine_guide-cloudcode.html#项目约束) 的项目。{% endblock %}

{% block ping %}
云引擎中间件内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```
app.use(AV.Cloud);
```

或者类似于 [项目框架](https://github.com/leancloud/node-js-getting-started) 那样，有一个 [cloud.js](https://github.com/leancloud/node-js-getting-started/blob/master/cloud.js) 且最终是以 `module.exports = AV.Cloud;` 结尾，然后在 [app.js](https://github.com/leancloud/node-js-getting-started/blob/master/app.js) 中加载 `cloud.js` 也可以达到一样的效果：

```
var cloud = require('./cloud');

// 加载云引擎方法
app.use(cloud);
```

如果未使用云引擎中间件，则需要自己实现该 URL 的处理，比如这样：

```
// 健康监测 router
app.use('/__engine/1/ping', function(req, res) {
  res.end(JSON.stringify({
    "runtime": "nodejs-" + process.version,
    "version": "custom"
  }));
});
```
{% endblock %}

{% block others_web_framework %}
云引擎支持任意 Node.js 的 Web 框架，你可以使用你最熟悉的框架进行开发，或者不使用任何框架，直接使用 Node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动你的项目，启动之后程序监听的端口为 `process.env.LC_APP_PORT`。
{% endblock %}

{% block install_middleware %}
在 Node.js 环境，使用 [leanengine](https://github.com/leancloud/leanengine-node-sdk) 来代替 [javascript-sdk](https://github.com/leancloud/javascript-sdk) 组件。前者扩展了后者，增加了云引擎方法和 hook 的支持。

在项目根目录下执行以下命令来安装云引擎，然后你就可以在项目中使用了：

```
$ npm install leanengine --save
```
{% endblock %}

{% block init_middleware %}
```js
var AV = require('leanengine');

var APP_ID = process.env.LC_APP_ID || '{{appid}}'; // 你的 app id
var APP_KEY = process.env.LC_APP_KEY || '{{appkey}}'; // 你的 app key
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || '{{masterkey}}'; // 你的 master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
```
{% endblock %}

{% set sdk_guide_link = '[JavaScript SDK](./leanstorage_guide-js.html)' %}

{% block cloudFuncExample %}
```javascript
AV.Cloud.define('averageStars', function(request, response) {
  var query = new AV.Query('Review');
  query.equalTo('movie', request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get('stars');
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error('搜索失败');
    }
  });
});
```
{% endblock %}

{% block cloudFuncParams %}
有两个参数会被传入到云函数：

* **request**：包装了请求信息的请求对象，下列这些字段将被设置到 request 对象内：
  * **params**：客户端发送的参数对象
  * **user**：`AV.User` 对象，发起调用的用户，如果没有登录，则不会设置此对象。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。
* **response**：应答对象，包含两个函数：
  * **success**：这个函数可以接收一个额外的参数，表示返回给客户端的结果数据。这个参数对象可以是任意的 JSON 对象或数组，并且可以包含 `AV.Object` 对象。
  * **error**：如果这个方法被调用，则表示发生了一个错误。它也接收一个额外的参数来传递给客户端，提供有意义的错误信息。
{% endblock %}

{% block runFuncName %}`AV.Cloud.run`{% endblock %}

{% block defineFuncName %}`AV.Cloud.define`{% endblock %}

{% block runFuncExample %}
```javascript
AV.Cloud.run('hello', {name: 'dennis'}, {
  success: function(data){
      //调用成功，得到成功的应答data
  },
  error: function(err){
      //处理调用失败
  }
});
```
{% endblock %}

{% block runFuncApiLink %}[AV.Cloud.run](/api-docs/javascript/symbols/AV.Cloud.html#.run){% endblock %}

{% block beforeSaveExample %}
```javascript
AV.Cloud.beforeSave('Review', function(request, response) {
  var comment = request.object.get('comment');
  if (comment) {
    if (comment.length > 140) {
      // 截断并添加...
      request.object.set('comment', comment.substring(0, 137) + '...');
    }
    // 保存到数据库中
    response.success();
  } else {
    // 不保存数据，并返回错误
    response.error('No comment!');
  }
});
```
{% endblock %}

{% block afterSaveExample %}
```javascript
AV.Cloud.afterSave('Comment', function(request) {
  var query = new AV.Query('Post');
  query.get(request.object.get('post').id, {
    success: function(post) {
      post.increment('comments');
      post.save();
    },
    error: function(error) {
      throw 'Got an error ' + error.code + ' : ' + error.message;
    }
  });
});
```
{% endblock %}

{% block afterSaveExample2 %}
```javascript
AV.Cloud.afterSave('_User', function(request) {
  console.log(request.object);
  request.object.set('from','LeanCloud');
  request.object.save(null,{success:function(user)
    {
      console.log('ok!');
    },error:function(user,error)
    {
      console.log('error',error);
    }
    });
});
```
{% endblock %}

{% block beforeUpdateExample %}
```javascript
AV.Cloud.beforeUpdate('Review', function(request, response) {
  // 如果 comment 字段被修改了，检查该字段的长度
  if (request.object.updatedKeys.indexOf('comment') != -1) {
    if (request.object.get('comment').length <= 140) {
      response.success();
    } else {
      // 拒绝过长的修改
      response.error('commit 长度不得超过 140 字符');
    }
  } else {
    response.success();
  }
});
```

请注意：

* 需要将 `leanengine` 中间件升级至 0.2.0 版本以上才能使用这个功能。
* 不要修改 `request.object`，因为对它的改动并不会保存到数据库，但可以用 `response.error` 返回一个错误，拒绝这次修改。
{% endblock %}

{% block afterUpdateExample %}
```javascript
AV.Cloud.afterUpdate('Article', function(request) {
   console.log('Updated article,the id is :' + request.object.id);
});
```
{% endblock %}

{% block beforeDeleteExample %}
```javascript
AV.Cloud.beforeDelete('Album', function(request, response) {
  //查询Photo中还有没有属于这个相册的照片
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.count({
    success: function(count) {
      if (count > 0) {
        //还有照片，不能删除，调用error方法
        response.error('Can\'t delete album if it still has photos.');
      } else {
        //没有照片，可以删除，调用success方法
        response.success();
      }
    },
    error: function(error) {
      response.error('Error ' + error.code + ' : ' + error.message + ' when getting photo count.');
    }
  });
});
```
{% endblock %}

{% block afterDeleteExample %}
```javascript
AV.Cloud.afterDelete('Album', function(request) {
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.find({
    success: function(posts) {
    //查询本相册的照片，遍历删除
    AV.Object.destroyAll(posts);
    },
    error: function(error) {
      console.error('Error finding related comments ' + error.code + ': ' + error.message);
    }
  });
});
```
{% endblock %}

{% block onVerifiedExample %}
```javascript
AV.Cloud.onVerified('sms', function(request, response) {
    console.log('onVerified: sms, user: ' + request.object);
    response.success();
```
{% endblock %}

{% block onLoginExample %}
```javascript
AV.Cloud.onLogin(function(request, response) {
  // 因为此时用户还没有登录，所以用户信息是保存在 request.object 对象中
  console.log("on login:", request.object);
  if (request.object.get('username') == 'noLogin') {
    // 如果是 error 回调，则用户无法登录（收到 401 响应）
    response.error('Forbidden');
  } else {
    // 如果是 success 回调，则用户可以登录
    response.success();
  }
});
```
{% endblock %}

{% block errorCodeExample %}
错误响应码允许自定义。云引擎方法最终的错误对象如果有 `code` 和 `message` 属性，则响应的 body 以这两个属性为准，否则 `code` 为 1， `message` 为错误对象的字符串形式。比如：

```
AV.Cloud.define('errorCode', function(req, res) {
  AV.User.logIn('NoThisUser', 'lalala', {
    error: function(user, err) {
      res.error(err);
    }
  });
});
```
{% endblock %}

{% block errorCodeExample2 %}
```
AV.Cloud.define('customErrorCode', function(req, res) {
  res.error({code: 123, message: 'custom error message'});
});
```
{% endblock %}

{% block errorCodeExampleForHooks %}
```
AV.Cloud.beforeSave('Review', function(request, response) {
  // 使用 JSON.stringify() 将 object 变为字符串
  response.error(JSON.stringify({
    code: 123,
    message: '自定义错误信息'
  }));
});
```
{% endblock %}

{% block http_client %}
云引擎允许你使用 `AV.Cloud.httpRequest` 函数来发送 HTTP 请求到任意的 HTTP 服务器。不过推荐你使用 [request](https://www.npmjs.com/package/request) 等第三方模块来处理 HTTP 请求。

使用 `AV.Cloud.httpRequest` ，一个简单的 GET 请求看起来是这样：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/',
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

当返回的 HTTP 状态码是成功的状态码（例如 200、201 等），则 success 函数会被调用，反之 error 函数将被调用。

### 查询参数

如果你想添加查询参数到 URL 末尾，你可以设置选项对象的 params 属性。你既可以传入一个 JSON 格式的 key-value 对象，像这样：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/search',
  params: {
    q : 'Sean Plott'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

也可以是一个原始的字符串：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/search',
  params: 'q=Sean Plott',
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

### 设置 HTTP 头部

通过设置选项对象的 header 属性，你可以发送 HTTP 头信息。假设你想设定请求的 `Content-Type`，你可以这样做：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.example.com/',
  headers: {
    'Content-Type': 'application/json'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

### 设置超时

默认请求超时设置为 10 秒，超过这个时间没有返回的请求将被强制终止，你可以通过 timeout 选项（单位毫秒）调整这个超时，比如把请求超时设置为 15 秒：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.example.com/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```


### 发送 POST 请求

通过设置选项对象的 method 属性就可以发送 POST请求。同时可以设置选项对象的 body 属性来发送数据，例如：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  body: {
    title: 'Vote for Pedro',
    body: 'If you vote for Pedro, your wildest dreams will come true'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

这将会发送一个 POST 请求到 <http://www.example.com/create_post>，body 是被 URL 编码过的表单数据。 如果你想使用 JSON 编码 body，可以这样做：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    title: 'Vote for Pedro',
    body: 'If you vote for Pedro, your wildest dreams will come true'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

当然，body 可以被任何想发送出去的 String 对象替换。

### HTTP 应答对象

传给 success 和 error 函数的应答对象包括下列属性：

- **status**：HTTP 状态码
- **headers**：HTTP 应答头部信息
- **text**：原始的应答 body 内容
- **buffer**：原始的应答 Buffer 对象
- **data**：解析后的应答内容，如果云引擎可以解析返回的 `Content-Type` 的话（例如 JSON 格式，就可以被解析为一个 JSON 对象）

如果你不想要 text（会消耗资源做字符串拼接），只需要 buffer，那么可以设置请求的 text 选项为 false：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  text: false,
  ......
});
```
{% endblock %}

{% block timerExample %}
```javascript
AV.Cloud.define('log_timer', function(req, res){
    console.log('Log in timer.');
    return res.success();
});
```
{% endblock %}

{% block timerExample2 %}
```javascript
AV.Cloud.define('push_timer', function(req, res){
  AV.Push.send({
        channels: [ 'Public' ],
        data: {
            alert: 'Public message'
        }
    });
   return res.success();
});
```
{% endblock %}

{% block masterKeyInit %}
```javascript
//参数依次为 AppId, AppKey, MasterKey
AV.initialize('{{appid}}', '{{appkey}}', '{{masterkey}}');
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block loggerExample %}
```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}

{% block use_framework %}
云引擎中可以使用 [express](http://expressjs.com/)、[connect](http://senchalabs.github.com/connect) 等 Web 框架，你只要安装了云引擎提供的中间件即可正常运行。

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();

app.use(AV.Cloud);
app.listen(process.env.LC_APP_PORT);
```

{% endblock %}

{% block upload_file %}
### 上传文件

在云引擎里上传文件也很容易，使用表单上传文件，假设文件字段名叫 iconImage：

```html
<form enctype="multipart/form-data" method="post" action="/upload">
  <input type="file" name="iconImage">
  <input type="submit" name="submit" value="submit">
</form>
```

然后配置应用使用 [multiparty](https://www.npmjs.com/package/multiparty) 中间件：

```javascript
var multiparty = require('multiparty');
```

接下来定义文件上传的处理函数，构建一个 Form 对象，并将 req 作为参数进行解析，会将请求中的文件保存到临时文件目录，并构造 files 对象：

```javascript
var fs = require('fs');
app.post('/upload', function(req, res){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var iconFile = files.iconImage[0];
    if(iconFile.size !== 0){
      fs.readFile(iconFile.path, function(err, data){
        if(err) {
          return res.send('读取文件失败');
        }
        var base64Data = data.toString('base64');
        var theFile = new AV.File(iconFile.originalFilename, {base64: base64Data});
        theFile.save().then(function(theFile){
          res.send('上传成功！');
        });
      });
    } else {
      res.send('请选择一个文件。');
    }
  });
});
```

上传成功后，即可在数据管理平台里看到你所上传的文件。
{% endblock %}

{% block cookie_session %}
### 处理用户登录和登出

要让云引擎支持 LeanCloud 用户体系的 Session，在 app.js 里添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

使用 `AV.Cloud.CookieSession` 中间件启用 CookieSession，注意传入一个 secret 用于 cookie 加密（必须）。它会自动将 AV.User 的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* **fetchUser**：**是否自动 fetch 当前登录的 AV.User 对象。默认为 false。**  
  如果设置为 true，每个 HTTP 请求都将发起一次 LeanCloud API 调用来 fetch 用户对象。如果设置为 false，默认只可以访问 `req.AV.user` 当前用户的 id 属性（即 _User 表记录的 ObjectId），你可以在必要的时候 fetch 整个用户。通常保持默认的 false 就可以。
* **name**：session 在 cookie 中存储的 key 名称，默认为 `avos.sess`。
* **maxAge**：设置 cookie 的过期时间。

`httpOnly` 和 `signed` 参数我们强制设置为 true。

**注意**：我们通常不建议在云引擎环境中通过 `AV.User.current()` 获取登录用户的信息，虽然这样做不会有问题，也不会有串号的风险，但由于这个功能依赖 Node.js 的 Domain 模块，而 Node.js 4.x 已经不推荐使用 Domain 模块了，所以在云引擎中获取 currentUser 的机制后续会发生改变。因此，我们建议：

* 在云引擎方法中，通过 request.user 获取用户信息。
* 在 webHosting 中，通过 req.AV.user 获取用户信息。
* 在后续的方法调用显式传递 user 对象。

登录很简单：

```javascript
app.get('/login', function(req, res) {
  // 渲染登录页面
  res.render('login.ejs');
});
// 点击登录页面的提交将出发下列函数
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function(user) {
    //登录成功，AV.Cloud.CookieSession 会自动将登录用户信息存储到 cookie
    //跳转到profile页面。
    console.log('signin successfully: %j', user);
    res.redirect('/profile');
  },function(error) {
    //登录失败，跳转到登录页面
    res.redirect('/login');
  });
});
//查看用户profile信息
app.get('/profile', function(req, res) {
  // 判断用户是否已经登录
  if (req.AV.user) {
    // 如果已经登录，发送当前登录用户信息。
    res.send(req.AV.user);
  } else {
    // 没有登录，跳转到登录页面。
    res.redirect('/login');
  }
});

//调用此url来登出帐号
app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/profile');
});
```

登录页面大概是这样 login.ejs:

```html
<html>
    <head></head>
    <body>
      <form method="post" action="/login">
        <label>Username</label>
        <input name="username"></input>
        <label>Password</label>
        <input name="password" type="password"></input>
        <input class="button" type="submit" value="登录">
      </form>
    </body>
  </html>
```

注意：express 框架的 `express.session.MemoryStore` 在我们云引擎中是无法正常工作的，因为我们的云引擎是多主机，多进程运行，因此内存型 session 是无法共享的，建议用 [express.js &middot; cookie-session 中间件](https://github.com/expressjs/cookie-session)。
{% endblock %}

{% block custom_session %}

### 自定义 session

有时候你需要将一些自己需要的属性保存在 session 中，你可以增加通用的 `cookie-session` 组件，详情可以参考 [express.js &middot; cookie-session](https://github.com/expressjs/cookie-session)。该组件和 `AV.Cloud.CookieSession` 组件可以并存。
{% endblock %}

{% block https_redirect %}
```javascript
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());
```
{% endblock %}

{% block get_env %}
```javascript
var NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  // 当前环境为「开发环境」，是由命令行工具启动的
} else if(NODE_ENV == 'production') {
  // 当前环境为「生产环境」，是线上正式运行的环境
} else {
  // 当前环境为「预备环境」
}
```
{% endblock %}

{% block project_start %}
### 项目启动

如果 `$PROJECT_DIR/package.json` 文件有类似下面的声明：

```
{
  ...
  "scripts": {
    ...
    "start": "node server.js",
    ...
  },
  ...
}
```

则会使用 `npm start` 方式启动。这意味着可以使用 [npm scripts](https://docs.npmjs.com/misc/scripts) 来定制启动过程。

**提示：**有些遗留项目可能会将 `start` 脚本写成 `node ./app.js` 从而导致启动检测失败，所以将脚本改成 `node server.js` 或者你确认的启动方式即可。

如果没有 `start` 脚本，则默认使用 `node server.js` 来启动，所以需要保证存在 `$PROJECT_DIR/server.js` 文件。 {% endblock %}
