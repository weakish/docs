{% import "views/_data.njk" as data %}
{% import "views/_helper.njk" as docs %}
# 在微信小程序（游戏）与 QQ 小程序（游戏）中使用 LeanCloud

小程序是一个全新的跨平台移动应用平台，小游戏是小程序的一个类目，在小程序的基础上开放了游戏相关的 API。LeanCloud 为小程序提供一站式后端云服务，为你免去服务器维护、证书配置等繁琐的工作，大幅降低你的开发和运维成本。本文说明了如何在小程序与小游戏中使用 LeanCloud 提供的各项服务。

{{ docs.note('QQ 小程序兼容微信小程序的 API，概念与用法也相似。如果没有特殊说明，本文将不再区分微信小程序与 QQ 小程序。')}}

## Demo
我们在小程序上实现了 LeanTodo 应用。在这个 Demo 中你可以看到：

- 如何集成 LeanCloud 用户系统，包括自动登录、unionid 绑定以及如何在登录后设置账号与密码以供用户在其他平台的 LeanTodo 应用上登录
- 如何对云端数据进行查询、增加、修改与删除
- 如何将查询结果数组绑定到视图层进行展示，以及如何在点击事件中得到对应的数组项
- 如何使用 [LiveQuery](leanstorage_guide-js.html#livequery) 实现对查询结果的实时更新和多端同步
- 如何集成微信支付（仅支持微信小程序）

你可以通过微信或 QQ 扫描以下二维码进入 Demo。 Demo 的源码与运行说明请参考 [https://github.com/leancloud/leantodo-weapp](https://github.com/leancloud/leantodo-weapp)。

<img src="images/leantodo-weapp-qr.jpg" alt="LeanTodo Weapp QR" width="250"> <img src="images/leantodo-qqapp-qr.png" alt="LeanTodo Weapp QR" width="250">


## 准备工作
### 创建应用
- 如果你还没有创建过 LeanCloud 应用，请登录 LeanCloud 控制台创建一个新应用。
- 如果你还没有小程序帐号，请访问 [微信公众平台] 或 [QQ 小程序开放平台] 注册一个小程序帐号。如果你不需要进行真机调试可以跳过这一步。
- 下载对应平台的小程序开发工具，按照指引创建一个新项目。

[微信公众平台]: https://mp.weixin.qq.com
[QQ 小程序开放平台]: https://q.qq.com

### 配置域名白名单

- 前往 [LeanCloud 控制台 > 设置 > 应用 Keys > 域名白名单][weapp-domains]，获取域名白名单（不同应用对应不同的域名）。
- 登录 [微信公众平台] 或 [QQ 小程序开放平台]，前往 **设置 > 开发设置 > 服务器配置 > 「修改」** 链接，**增加**上述域名白名单中的域名。

[weapp-domains]: https://leancloud.cn/dashboard/app.html?appid={{appid}}#/key

如果你不需要进行真机调试可以暂时跳过这一步（可在开发者工具的 **详情** > **项目设置** 中勾选**不校验安全域名、TLS 版本以及 HTTPS 证书**）。

### 安装与初始化 SDK

要使用 LeanCloud 的结构化对象存储、文件存储、用户系统等功能，需要使用 LeanCloud 存储 SDK。存储 SDK 的安装与初始化请请参阅《[JavaScript SDK 安装指南](sdk_setup-js.html)》中对应平台的说明。

安装存储 SDK 后即可在 `app.js` 中初始化应用：

```javascript
// 获取 AV 命名空间的方式根据不同的安装方式而异，这里假设是通过手动导入文件的方式安装的 SDK
const AV = require('./libs/av-weapp-min.js');
AV.init({
  appId: '{{appid}}',
  appKey: '{{appkey}}',
  // 请将 xxx.example.com 替换为你的应用绑定的自定义 API 域名
  serverURLs: "https://xxx.example.com",
});
```

要使用 LeanCloud 的即时通讯服务实现聊天等功能，需要使用 LeanCloud 即时通讯 SDK。即时通讯 SDK 是与存储 SDK 独立的 SDK，我们在单独的 [即时通讯](#即时通讯) 章节介绍其安装与初始化的步骤。


## 结构化对象存储
所有的结构化对象存储 API 都能正常使用，详细的用法请参考 [JavaScript 数据存储开发指南](leanstorage_guide-js.html)。

### 数据绑定

`AV.Object` 实例是一些携带很多信息与方法的对象，而小程序的存放渲染用数据的 `data` 字段需要的是 JSON 类型的数据，因此我们需要将 `AV.Object` 实例处理为 JSON 数据后再设置给 `data`。

以 LeanTodo Demo 中的 Todo 列表为例，要实现「将 `AV.Query` 查询结果 `Todo` 列表中的 `content` 与 `done` 字段展示为列表」的功能，我们可以定义一个 `getDataForRender` 来做上面说的「处理」：

```js
const getDataForRender = todo => ({
  content: todo.get('content'),
  done: todo.get('done')
});

Page({
  data: {
    todos: []
  },
  onReady() {
    new AV.Query('Todo')
      .find()
      .then(todos => this.setData({
        todos: todos.map(getDataForRender)
      }))
      .catch(console.error);
  }
});
```

`AV.Object` 提供了一个 `#toJSON()` 方法以 JSON 的形式返回其携带的有效信息。因此如果不考虑渲染性能，`getDataForRender` 可以简化为：

```js
const getDataForRender = todo => todo.toJSON();
```

{{ docs.note("使用 `#toJSON()` 会比手动 pick 需要的数据带来更多的性能消耗。这是因为小程序的 `data` 在逻辑层与渲染层之间是通过序列化后的字符串格式通讯的，过大的 `data` 结构会造成渲染耗时过久。因此对于结构复杂的 `AV.Object`，特别是如果是一个列表，手动 pick 需要的数据设置为 `data` 是一种常见的优化方法。") }}

当然，每次 `setData` 时遇到不同结构中的 `AV.Object` 都要进行这样的处理会让代码充斥噪音，你可以使用各种技巧对此进行优化。这里分享一个 Demo 中使用的一个统一对 `setData` 的对象进行「处理」的 utility 方法 `jsonify`：

```js
const isPlainObject = target =>
  target &&
  target.toString() == '[object Object]' &&
  Object.getPrototypeOf(target) == Object.prototype;
const _jsonify = target => {
  if (target && typeof target.toJSON === 'function') return target.toJSON();
  if (Array.isArray(target)) return target.map(_jsonify);
  return target;
};

const jsonify = target =>
  isPlainObject(target)
    ? Object.keys(target).reduce(
      (result, key) => ({
        ...result,
        [key]: _jsonify(target[key])
      }),
      {}
    )
    : _jsonify(target);
```

`jsonify` 能正确的处理 `AV.Object`、`AV.Object` 数组以及其他类型的数据。使用时可以简单的在所有的 `setData` 之前对数据调用一次 `jsonify` 方法：

```js
this.setData(jsonify({
  todos, // AV.Object list
  user, // AV.Object
}));
```

值得注意的是从 `AV.Object` 到 JSON 数据的处理是不可逆的，如果在之后还需要用到查询结果的 `AV.Object`，我们可以将其保存到 Page 实例上：

```js
Page({
  // todos 存放的是 AV.Object 列表，后续可以这些对象进行操作（比如调用其 save 方法），不参与渲染
  todos: [],
  data: {
    // data.todo 存放的是 JSON 数据，供 WXML 页面渲染用
    todos: []
  },
  onReady() {
    new AV.Query('Todo')
      .find()
      .then(todos => {
        this.todos = todos;
        this.setData(jsonify({
          todos
        });
      })
      .catch(console.error);
  },
  saveAll() {
    // 可以在这里获取到 this.todos 进行操作
    return AV.Object.saveAll(this.todos)
  }
});
```

{{ docs.note("你可能会在某些过时的文档或者 Demo 中看到直接使用 `this.setData()` 将 `AV.Object` 对象设置为当前页面的 data 的用法。我们 **不再推荐这种用法**。这是 SDK 针对小程序做的特殊「优化」，利用了小程序渲染机制中的一个未定义行为，目前已知在使用了自定义组件（`usingComponents`）时这种用法会失效。") }}


## 文件存储

在小程序中，可以将用户相册或拍照得到的图片上传到 LeanCloud 服务器进行保存。首先通过 `wx.chooseImage` 方法选择或拍摄照片，得到本地临时文件的路径，然后按照下面的方法构造一个 `AV.File` 将其上传到 LeanCloud：

```javascript
wx.chooseImage({
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success: function(res) {
    var tempFilePath = res.tempFilePaths[0];
    // 使用本地临时文件的路径构造 AV.File
    new AV.File('file-name', {
      blob: {
        uri: tempFilePath,
      },
    })
      // 上传
      .save()
      // 上传成功
      .then(file => console.log(file.url()))
      // 上传发生异常
      .catch(console.error);
  }
});
```

上传成功后可以通过 `file.url()` 方法得到服务端的图片 url。

关于文件存储更详细的用法请参考 [JavaScript 数据存储开发指南 · 文件](leanstorage_guide-js.html#文件)。

## 用户系统

小程序中提供了登录 API 来获取微信的用户登录状态，应用可以访问到用户的昵称、性别等基本信息。但是如果想要保存额外的用户信息，如用户的手机号码、收货地址等，或者需要在其他平台使用该用户登录，则需要使用 LeanCloud 的用户系统。

SDK 提供了一系列小程序特有的用户相关的 API，适用于不同的使用场景：

|微信|QQ|作用|
|--|--|--|
|`AV.User.loginWithWeapp`<br/>`AV.User#loginWithWeapp`|`AV.User.loginWithQQApp`<br/>`AV.User#loginWithQQApp`|一键使用当前平台用户身份登录
|`AV.User.loginWithWeappWithUnionId`<br/>`AV.User#loginWithWeappWithUnionId`|`AV.User.loginWithQQAppWithUnionId`<br/>`AV.User#loginWithQQAppWithUnionId`|使用 unionid 并使用当前平台用户身份登录
|`AV.User#associateWithWeapp`|`AV.User#associateWithQQApp`|当前登录用户关联当前平台用户
|`AV.User#associateWithWeappWithUnionId`|`AV.User#associateWithQQAppWithUnionId`|当前登录用户关联当前平台用户与 unionid

下面我们以微信平台为例讨论不同场景下的使用方式。

### 一键登录
LeanCloud 的用户系统支持一键使用微信用户身份登录。要使用一键登录功能，需要先设置小程序的 AppID 与 AppSecret：

1. 登录 [微信公众平台](https://mp.weixin.qq.com)，在 **设置** > **开发设置** 中获得 AppID 与 AppSecret。
2. 前往 LeanCloud 控制台 > **组件** > **社交**，保存「微信小程序」的 AppID 与 AppSecret。

这样你就可以在应用中使用 `AV.User.loginWithWeapp()` 方法来使用当前用户身份登录了。

```javascript
AV.User.loginWithWeapp().then(user => {
  this.globalData.user = user;
}).catch(console.error);
```

使用一键登录方式登录时，LeanCloud 会将该用户的小程序 `openid` 与 `session_key` 等信息保存在对应的 `user.authData.lc_weapp` 属性中，你可以在控制台的 `_User` 表中看到：

```json
{
  "authData": {
    "lc_weapp": {
      "session_key": "2zIDoEEUhkb0B5pUTzsLVg==",
      "expires_in": 7200,
      "openid": "obznq0GuHPxdRYaaDkPOHk785DuA"
    }
  }
}
```

如果用户是第一次使用此应用，调用登录 API 会创建一个新的用户，你可以在 控制台 > **存储** 中的 `_User` 表中看到该用户的信息，如果用户曾经使用该方式登录过此应用（存在对应 `openid` 的用户），再次调用登录 API 会返回同一个用户。

用户的登录状态会保存在客户端中，可以使用 `AV.User.current()` 方法来获取当前登录的用户，下面的例子展示了如何为登录用户保存额外的信息：

```javascript
// 假设已经通过 AV.User.loginWithWeapp() 登录
// 获得当前登录用户
const user = AV.User.current();
// 调用小程序 API，得到用户信息
wx.getUserInfo({
  success: ({userInfo}) => {
    // 更新当前用户的信息
    user.set(userInfo).save().then(user => {
      // 成功，此时可在控制台中看到更新后的用户信息
      this.globalData.user = user;
    }).catch(console.error);
  }
});
```

`authData` 默认只有对应用户可见，开发者可以使用 masterKey 在云引擎中获取该用户的 `openid` 与 `session_key` 进行支付、推送等操作。详情的示例请参考 [支付](#支付)。

{{ docs.note("小程序的登录态（`session_key`）存在有效期，可以通过 [`wx.checkSession()`](https://developers.weixin.qq.com/miniprogram/dev/api/wx.checkSession.html) 方法检测当前用户登录态是否有效，失效后可以通过调用 `AV.User.loginWithWeapp()` 重新登录。") }}

### 使用 unionid

微信开放平台使用 [unionid](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html) 来区分用户的唯一性，也就是说同一个微信开放平台帐号下的移动应用、网站应用和公众帐号（包括小程序），用户的 unionid 都是同一个，而 openid 会是多个。如果你想要实现多个小程序之间，或者小程序与使用微信开放平台登录的应用之间共享用户系统的话，则需要使用 unionid 登录。

{{ docs.note("要在小程序中使用 unionid 登录，请先确认已经在 **微信开放平台** 绑定了该小程序") }}

在小程序中有很多途径可以 [获取到 unionid](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/union-id.html)。不同的 unionid 获取方式，接入 LeanCloud 用户系统的方式也有所不同。

#### 一键登录时静默获取 unionid

当满足以下条件时，一键登录 API `AV.User.loginWithWeapp()` 能静默地获取到用户的 unionid 并用 unionid + openid 进行匹配登录。

- 微信开放平台帐号下存在同主体的公众号，并且该用户已经关注了该公众号。
- 微信开放平台帐号下存在同主体的公众号或移动应用，并且该用户已经授权登录过该公众号或移动应用。

要启用这种方式，需要在一键登录时指定参数 `preferUnionId` 为 true：

```js
AV.User.loginWithWeapp({
  preferUnionId: true,
});
```

使用 unionid 登录后，用户的 authData 中会增加 `_weixin_unionid` 一项（与 `lc_weapp` 平级）：

```json
{
  "authData": {
    "lc_weapp": {
      "session_key": "2zIDoEEUhkb0B5pUTzsLVg==",
      "expires_in": 7200,
      "openid": "obznq0GuHPxdRYaaDkPOHk785DuA",
      "unionid": "ox7NLs5BlEqPS4glxqhn5kkO0UUo"
    },
    "_weixin_unionid": {
      "uid": "ox7NLs5BlEqPS4glxqhn5kkO0UUo"
    }
  }
}
```

用 unionid + openid 登录时，会按照下面的步骤进行用户匹配：

1. 如果已经存在对应 unionid（`authData._weixin_unionid.uid`）的用户，则会直接作为这个用户登录，并将所有信息（`openid`、`session_key`、`unionid` 等）更新到该用户的 `authData.lc_ewapp` 中。
2. 如果不存在匹配 unionid 的用户，但存在匹配 openid（`authData.lc_weapp.openid`）的用户，则会直接作为这个用户登录，并将所有信息（`session_key`、`unionid` 等）更新到该用户的 `authData.lc_ewapp` 中，同时将 `unionid` 保存到 `authData._weixin_unionid.uid` 中。
3. 如果不存在匹配 unionid 的用户，也不存在匹配 openid 的用户，则创建一个新用户，将所有信息（`session_key`、`unionid` 等）更新到该用户的 `authData.lc_ewapp` 中，同时将 `unionid` 保存到 `authData._weixin_unionid.uid` 中。

不管匹配的过程是如何的，最终登录用户的 `authData` 都会是上面这种结构。

[LeanTodo Demo](#Demo) 便是使用这种方式登录的，如果你已经关注了其关联的公众号（搜索 AVOSCloud，或通过小程序关于页面的相关公众号链接访问），那么你在登录后会在 LeanTodo Demo 的 **设置 - 用户** 页面看到当前用户的 `authData` 中已经绑定了 unionid。

需要注意的是：

- 如果用户不符合上述静默获取 unionid 的条件，那么就算指定了 `preferUnionId` 也不会使用 unionid 登录。
- 如果用户符合上述静默获取 unionid 的条件，但没有指定 `preferUnionId`，那么该次登录不会使用 unionid 登录，但仍然会将获取到的 unionid 作为一般字段写入该用户的 `authData.lc_weapp` 中。此时用户的 `authData` 会是这样的：

  ```json
  {
    "authData": {
      "lc_weapp": {
        "session_key": "2zIDoEEUhkb0B5pUTzsLVg==",
        "expires_in": 7200,
        "openid": "obznq0GuHPxdRYaaDkPOHk785DuA",
        "unionid": "ox7NLs5BlEqPS4glxqhn5kkO0UUo"
      }
    }
  }
  ```

#### 通过其他方式获取 unionid 后登录

如果开发者自行获得了用户的 unionid（例如通过解密 wx.getUserInfo 获取到的用户信息），可以在小程序中调用 `AV.User.loginWithWeappWithUnionId()` 投入 unionid 完成登录授权：

```javascript
AV.User.loginWithWeappWithUnionId(unionid, {
  asMainAccount: true
}).then(console.log, console.error);
```

#### 通过其他方式获取 unionid 与 openid 后登录

如果开发者希望更灵活的控制小程序的登录流程，也可以自行在服务端实现 unionid 与 openid 的获取，然后调用通用的第三方 unionid 登录接口指定平台为 `lc_weapp` 来登录：

```js
const unionid = '';
const authData = {
  openid: '',
  session_key: ''
};
const platform = 'lc_weapp';
AV.User.loginWithAuthDataAndUnionId(authData, platform, unionid, {
  asMainAccount: true
}).then(console.log, console.error);
```

相对上面提到的一些 Weapp 相关的登录 API，loginWithAuthDataAndUnionId 是更加底层的第三方登录接口，不依赖小程序运行环境，因此这种方式也提供了更高的灵活度：
- 可以在服务端获取到 unionid 与 openid 等信息后返回给小程序客户端，在客户端调用 `AV.User.loginWithAuthDataAndUnionId` 来登录。
- 也可以在服务端获取到 unionid 与 openid 等信息后直接调用 `AV.User.loginWithAuthDataAndUnionId` 登录，成功后得到登录用户的 `sessionToken` 后返回给客户端，客户端再使用该 `sessionToken` 直接登录。

##### 关联第二个小程序

这种用法的另一种常见场景是关联同一个开发者帐号下的第二个小程序。

因为一个 LeanCloud 应用默认关联一个微信小程序（对应的平台名称是 `lc_weapp`），使用小程序系列 API 的时候也都是默认关联到 `authData.lc_weapp` 字段上。如果想要接入第二个小程序，则需要自行获取到 unionid 与 openid，然后将其作为一个新的第三方平台登录。这里同样需要用到 `AV.User.loginWithAuthDataAndUnionId` 方法，但与关联内置的小程序平台（`lc_weapp`）有一些不同：

- 需要指定一个新的 `platform`
- 需要将 `openid` 保存为 `uid`（内置的微信平台做了特殊处理可以直接用 `openid` 而这里是作为通用第三方 OAuth 平台保存因此需要使用标准的 `uid` 字段）。

这里我们以新的平台 `weapp2` 为例：


```js
const unionid = '';
const openid = '';
const authData = {
  uid: openid,
  session_key: ''
};
const platform = 'weapp2';
AV.User.loginWithAuthDataAndUnionId(authData, platform, unionid, {
  asMainAccount: true
}).then(console.log, console.error);
```


#### 获取 unionid 后与现有用户关联

如果一个用户已经登录，现在通过某种方式获取到了其 unionid（一个常见的使用场景是用户完成了支付操作后在服务端通过 getPaidUnionId 得到了 unionid）希望与之关联，可以在小程序中使用 `AV.User#associateWithWeappWithUnionId()`：

```javascript
const user = AV.User.current(); // 获取当前登录用户
user.associateWithWeappWithUnionId(unionid, {
  asMainAccount: true
}).then(console.log, console.error);
```

### 启用其他登录方式
上述的登录 API 对接的是小程序的用户系统，所以使用这些 API 创建的用户无法直接在小程序之外的平台上登录。如果需要使用 LeanCloud 用户系统提供的其他登录方式，如用手机号验证码登录、邮箱密码登录等，在小程序登录后设置对应的用户属性即可：

```javascript
// 小程序登录
AV.User.loginWithWeapp().then(user => {
  // 设置并保存手机号
  user.setMobilePhoneNumber('13000000000');
  return user.save();
}).then(user => {
  // 发送验证短信
  return AV.User.requestMobilePhoneVerify(user.getMobilePhoneNumber());
}).then({
  // 用户填写收到短信验证码后再调用 AV.User.verifyMobilePhone(code) 完成手机号的绑定
  // 成功后用户的 mobilePhoneVerified 字段会被置为 true
  // 此后用户便可以使用手机号加动态验证码登录了
}).catch(console.error);
```

{{ docs.note("验证手机号码功能要求在 [控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf) 启用「用户注册时，向注册手机号码发送验证短信」。") }}

### 绑定现有用户
如果你的应用已经在使用 LeanCloud 的用户系统，或者用户已经通过其他方式注册了你的应用（比如在 Web 端通过用户名密码注册），可以通过在小程序中调用 `AV.User#associateWithWeapp()` 来关联已有的账户：

```javascript
// 首先，使用用户名与密码登录一个已经存在的用户
AV.User.logIn('username', 'password').then(user => {
  // 将当前的微信用户与当前登录用户关联
  return user.associateWithWeapp();
}).catch(console.error);
```

## 即时通讯

要使用 LeanCloud 的即时通讯服务实现聊天等功能，需要使用 LeanCloud 即时通讯 SDK。

### 安装与初始化
请参阅《[JavaScript SDK 安装指南](sdk_setup-js.html)》中对应平台的说明。

安装 SDK 后即可在 `app.js` 中初始化应用：

```javascript
// Realtime 类获取的方式根据不同的安装方式而异，这里假设是通过手动导入文件的方式安装的 SDK
const { Realtime } = require('./libs/realtime-weapp.min.js');
const realtime = new Realtime({
  appId: '{{appid}}',
  appKey: '{{appkey}}',
  // 请将 xxx.example.com 替换为你的应用绑定的自定义 API 域名
  serverURLs: "https://xxx.example.com",
});
```

需要特别注意的是，小程序对 WebSocket 连接的数量是有限制的，因此推荐的用法是初始化 `Realtime` 一次，挂载到全局的 App 实例上，然后在所有需要的时候都使用这个 `Realtime` 实例。

```js
// app.js
const { Realtime } = require('./libs/realtime-weapp.min.js');
const realtime = new Realtime({
  appId: '{{appid}}',
  appKey: '{{appkey}}',
  // 请将 xxx.example.com 替换为你的应用绑定的自定义 API 域名
  serverURLs: "https://xxx.example.com",
});
App({
  realtime: realtime,
  // ...
});

// some-page.js
const realtime = getApp().realtime;
```

即时通讯 SDK 的详细用法请参考 [即时通讯开发指南](realtime_v2.html)。

### 富媒体消息
要在小程序中使用即时通讯 SDK 的富媒体消息插件，有一些额外的约束：

1. 安装存储 SDK 至 `libs` 目录，并将文件重命名为 `leancloud-storage.js`。
2. 安装即时通讯 SDK 至 `libs` 目录，并将文件重命名为 `leancloud-realtime.js`。
3. 下载 [`leancloud-realtime-plugin-typed-messages.js`](https://unpkg.com/leancloud-realtime-plugin-typed-messages@^3.0.0)，移动到 `libs` 目录。必须保证<u>三个文件在同一目录中</u>。
4. 在 `app.js` 中<u>依次加载</u> `leancloud-storage.js`、`leancloud-realtime.js` 和 `leancloud-realtime-plugin-typed-messages.js`。
  ```javascript
  const AV = require('./libs/leancloud-storage.js');
  const Realtime = require('./libs/leancloud-realtime.js').Realtime;
  const TypedMessagesPlugin = require('./libs/leancloud-realtime-plugin-typed-messages.js').TypedMessagesPlugin;
  const ImageMessage = require('./libs/leancloud-realtime-plugin-typed-messages.js').ImageMessage;
  ```
5. 在 `app.js` 中初始化应用：
  ```javascript
  // 初始化存储 SDK
  AV.init({
    appId: '{{appid}}',
    appKey: '{{appkey}}',
    serverURLs: "https://xxx.example.com",
  });
  // 初始化即时通讯 SDK
  const realtime = new Realtime({
    appId: '{{appid}}',
    appKey: '{{appkey}}',
    plugins: [TypedMessagesPlugin], // 注册富媒体消息插件
    serverURLs: "https://xxx.example.com",
  });
  // 请将 xxx.example.com 替换为你的应用绑定的自定义 API 域名
  ```

富媒体消息的用法请参考 [即时通讯开发指南 - 富媒体消息](realtime-guide-beginner.html#文本之外的聊天消息)。

### 数据绑定

使用即时通讯 SDK，一个常见的需求是将 `Conversation` 与 `Message` 类型的数据绑定到视图层进行渲染。这里会遇到一些与结构化数据存储 SDK 一样的问题，其解决方案与最佳实践请参考结构化数据存储的 [数据绑定](#数据绑定) 章节（`Conversation` 与 `Message` 都实现了 `#toJSON` 方法，上文中介绍的 `jsonify` 方法同样适用于`Conversation` 与 `Message` 实例）。

## 支付

{{ docs.note('利用云引擎服务，我们能轻松的接入各类平台的支付功能。在这里我们以微信小程序中使用微信支付作为示例。')}}

### 配置

在开始之前，请确保已经在微信小程序后台开启了「微信支付」功能，然后按照下面的步骤配置云引擎环境变量：

1. 进入应用控制台 - 云引擎 - 设置
2. 绑定[云引擎自定义域名](custom-api-domain-guide.html#云引擎域名)
3. 添加并保存以下环境变量
  - `WEIXIN_APPID`：小程序 AppId
  - `WEIXIN_MCHID`：微信支付商户号
  - `WEIXIN_PAY_SECRET`：微信支付 API 密钥（[微信商户平台](https://pay.weixin.qq.com) - 账户设置 - API安全 - 密钥设置）
  - `WEIXIN_NOTIFY_URL`：`https://your-domain/weixin/pay-callback`，其中 `your-domain` 是第二步中绑定的云引擎域名

<details>
<summary>查看示例</summary>
<p>
<img src="images/dash-leanengine-setting.png" alt="控制台截屏" />
</p>
</details>

### 服务端开发

首先确认本机已经安装 [Node.js](http://nodejs.org/) 运行环境和 [LeanCloud 命令行工具](leanengine_cli.html)，然后执行下列指令下载示例项目：

```
$ git clone https://github.com/leancloud/weapp-pay-getting-started.git
$ cd weapp-pay-getting-started
```

安装依赖：

```
npm install
```

登录并关联应用：

```
lean login
lean switch
```

启动项目：

```
lean up
```

之后你就可以在 [localhost:3001](http://localhost:3001) 调试云函数了。

示例项目中与支付直接相关代码有三部分：

* `order.js`：对应 Order 表，定义了部分字段的 getter/setter，以及 `place` 方法用于向微信 API 提交订单。
* `cloud.js`：其中定义了名为 `order` 的云函数，这个云函数会获取当前用户的 `openid`，以其身份创建了一个 1 分钱的 order 并下单，最后返回签名过的订单信息。
* `routers/weixin.js`：其中定义了 `pay-callback` 的处理函数，当用户支付成功后微信调用这个 URL，这个函数将对应的订单状态更新为 `SUCCESS`。

请根据你的业务需要修改代码。参考文档：

* [微信支付统一下单 API 参数与错误码](https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1)
* [微信支付结果通知参数](https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_7)

完成开发后部署到预备环境（若无预备环境则直接部署到生产环境）：
```
lean deploy
```

### 客户端开发

客户端完成一次支付需要分两步：

1. 用户登录后，调用名为 `order` 的云函数下单，返回签名过的订单信息。
2. 调用支付 API（`wx.requestPayment`），传入上一步返回的订单信息，发起支付。

```javascript
AV.Cloud.run('order').then((data) => {
  data.success = () => {
    // 支付成功
  });
  data.fail = ({ errMsg }) => {
    // 错误处理
  });
  wx.requestPayment(data);
}).catch(error => {
  // 错误处理
})
```

客户端的示例代码参见 [Demo](https://github.com/leancloud/leantodo-weapp) 打赏功能。参考文档：

* [小程序客户端发起支付 API](https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-pay.html)

## FAQ

### 配置 download 合法域名时显示「该域名因违规被禁止设置。」
请前往 [控制台 > 存储 > 设置 > 文件](/dashboard/storage.html?appid={{appid}}#/storage/conf) 配置你自己的文件域名。

### Access denied by api domain white list
如果你的应用启用并配置了 [Web 安全域名](data_security.html#Web_应用安全设置)，你可能会 catch 到 `Access denied by api domain white list` 异常，请将提示的域名添加至应用的 Web 安全域名列表。

### 小程序真机上传数据时，控制台存储中显示的 Class 表名被压缩为单个字母。
例如新建一个名为「Todo」的表，上传数据成功后进入控制台查看，其表名称显示为像 i、u 这样的单个字母。这是因为真机上代码会被压缩，解决办法是在创建 Class 后向 SDK 注册该 Class 的名字：`AV.Object.register(Todo, 'Todo');`。

## 反馈
如果在微信 / QQ 小程序中使用 LeanCloud 时遇到问题，欢迎通过我们的 [论坛](https://forum.leancloud.cn/c/jing-xuan-faq/weapp) 进行反馈。
