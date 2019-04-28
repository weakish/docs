{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_data.njk" as data %}
# REST API 使用详解

REST API 可以让你用任何支持发送 HTTP 请求的设备来与 LeanCloud 进行交互，你可以使用 REST API 做很多事情，比如：

* 一个移动网站可以通过 JavaScript 来获取 LeanCloud 上的数据.
* 一个网站可以展示来自 LeanCloud 的数据。
* 你可以上传大量的数据，之后可以被一个移动 App 读取。
* 你可以下载最近的数据来进行你自定义的分析统计。
* 使用任何语言写的程序都可以操作 LeanCloud 上的数据。
* 如果你不再需要使用 LeanCloud，你可以导出你所有的数据。

## API 版本

| 版本   | 内容                                       |
| ---- | ---------------------------------------- |
| 1.1  | 2014 年 8 月 13 号发布，修复 Date 类型和 createdAt、updatedAt 的时区问题，返回标准 UTC 时间。 |
| 1.0  | 存在时间不准确的 Bug，实际返回的 Date 类型和 createdAt、updatedAt 都是北京时间。**不推荐再使用**。 |



### 在线测试

[API 在线测试工具](/dashboard/apionline/index.html)，目前仅支持调试**中国节点**下的应用。

为了方便测试 REST API，文档给出了 curl 命令示例，示例针对类 unix 平台（macOS、Linux 等）编写，直接粘贴至 Windows 平台 cmd.exe 很可能无法工作。
例如，curl 命令示例中的 shell 换行符（`\`）在 cmd.exe 中是目录分隔符。
Windows 平台建议使用 [Postman] 等客户端测试。
Postman 可直接导入 curl 命令。

[Postman]: https://forum.leancloud.cn/t/postman-rest-api/8638

![Postman 中点击 Import 按钮，在「Paste Raw Text」标签中粘贴 curl 命令](../images/postman-import-curl.png)

### 对象

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/classes/&lt;className&gt;</td>
      <td>POST</td>
      <td>创建对象</td>
    </tr>
    <tr>
      <td>/1.1/classes/&lt;className&gt;/&lt;objectId&gt;</td>
      <td>GET</td>
      <td>获取对象</td>
    </tr>
    <tr>
      <td>/1.1/classes/&lt;className&gt;/&lt;objectId&gt;</td>
      <td>PUT</td>
      <td>更新对象</td>
    </tr>
    <tr>
      <td>/1.1/classes/&lt;className&gt;</td>
      <td>GET</td>
      <td>查询对象</td>
    </tr>
    <tr>
      <td>/1.1/cloudQuery</td>
      <td>GET</td>
      <td>使用 CQL 查询对象</td>
    </tr>
    <tr>
      <td>/1.1/classes/&lt;className&gt;/&lt;objectId&gt;</td>
      <td>DELETE</td>
      <td>删除对象</td>
    </tr>
    <tr>
      <td>/1.1/scan/classes/&lt;className&gt;</td>
      <td>GET</td>
      <td>按照特定顺序遍历 Class</td>
    </tr>
  </tbody>
</table>

### 用户

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/users</td>
      <td>POST</td>
      <td>用户注册<br/>用户连接</td>
    </tr>
    <tr>
      <td>/1.1/usersByMobilePhone</td>
      <td>POST</td>
      <td>使用手机号码注册或登录</td>
    </tr>
    <tr>
      <td>/1.1/login</td>
      <td>POST</td>
      <td>用户登录</td>
    </tr>
    <tr>
      <td>/1.1/users/&lt;objectId&gt;</td>
      <td>GET</td>
      <td>获取用户</td>
    </tr>
    <tr>
      <td>/1.1/users/me</td>
      <td>GET</td>
      <td>根据 <a href="leanstorage_guide-js.html#SessionToken">sessionToken</a> 获取用户信息</td>
    </tr>
    <tr>
      <td>/1.1/users/&lt;objectId&gt;/refreshSessionToken</td>
      <td>PUT</td>
      <td>重置用户 sessionToken。</td>
    </tr>
    <tr>
      <td>/1.1/users/&lt;objectId&gt;/updatePassword</td>
      <td>PUT</td>
      <td>更新密码，要求输入旧密码。</td>
    </tr>
    <tr>
      <td>/1.1/users/&lt;objectId&gt;</td>
      <td>PUT</td>
      <td>更新用户<br/>用户连接<br/>验证Email</td>
    </tr>
    <tr>
      <td>/1.1/users</td>
      <td>GET</td>
      <td>查询用户</td>
    </tr>
    <tr>
      <td>/1.1/users/&lt;objectId&gt;</td>
      <td>DELETE</td>
      <td>删除用户</td>
    </tr>
    <tr>
      <td>/1.1/requestPasswordReset</td>
      <td>POST</td>
      <td>请求密码重设</td>
    </tr>
    <tr>
      <td>/1.1/requestEmailVerify</td>
      <td>POST</td>
      <td>请求验证用户邮箱</td>
    </tr>
    <tr>
      <td>/1.1/requestMobilePhoneVerify</td>
      <td>POST</td>
      <td>请求发送用户手机号码验证短信</td>
    </tr>
    <tr>
      <td>/1.1/verifyMobilePhone/&lt;code&gt;</td>
      <td>POST</td>
      <td>使用"验证码"验证用户手机号码</td>
    </tr>
    <tr>
      <td>/1.1/requestChangePhoneNumber</td>
      <td>POST</td>
      <td>请求发送手机短信验证码以绑定或更新手机号。</td>
    </tr>
    <tr>
      <td>/1.1/changePhoneNumber</td>
      <td>POST</td>
      <td>验证手机短信验证码并绑定或更新手机号。</td>
    </tr>
    <tr>
      <td>/1.1/requestLoginSmsCode</td>
      <td>POST</td>
      <td>请求发送手机号码登录短信。</td>
    </tr>
    <tr>
      <td>/1.1/requestPasswordResetBySmsCode</td>
      <td>POST</td>
      <td>请求发送手机短信验证码重置用户密码。</td>
    </tr>
    <tr>
      <td>/1.1/resetPasswordBySmsCode/&lt;code&gt;</td>
      <td>PUT</td>
      <td>验证手机短信验证码并重置密码。</td>
    </tr>
  </tbody>
</table>

### 角色

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/roles</td>
      <td>POST</td>
      <td>创建角色</td>
    </tr>
    <tr>
      <td>/1.1/roles/&lt;objectId&gt;</td>
      <td>GET</td>
      <td>获取角色</td>
    </tr>
    <tr>
      <td>/1.1/roles/&lt;objectId&gt;</td>
      <td>PUT</td>
      <td>更新角色</td>
    </tr>
    <tr>
      <td>/1.1/roles</td>
      <td>GET</td>
      <td>查询角色</td>
    </tr>
    <tr>
      <td>/1.1/roles/&lt;objectId&gt;</td>
      <td>DELETE</td>
      <td>删除角色</td>
    </tr>
  </tbody>
</table>


### 推送通知

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/push</td>
      <td>POST</td>
      <td>推送通知</td>
    </tr>
    <tr>
      <td>/1.1/notifications</td>
      <td>GET</td>
      <td>查询推送记录</td>
    </tr>
    <tr>
      <td>/1.1/notifications/:notification_id</td>
      <td>GET</td>
      <td>根据 ID 查推送记录</td>
    </tr>
    <tr>
      <td>/1.1/notifications/:notification_id</td>
      <td>DELETE</td>
      <td>根据 ID 删推送记录</td>
    </tr>
    <tr>
      <td>/1.1/scheduledPushMessages</td>
      <td>GET</td>
      <td>查询应用下所有的定时推送</td>
    </tr>
    <tr>
      <td>/1.1/scheduledPushMessages/:id</td>
      <td>DELETE</td>
      <td>根据 ID 删定时推送</td>
    </tr>
  </tbody>
</table>

### 安装数据

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/installations</td>
      <td>POST</td>
      <td>上传安装数据</td>
    </tr>
    <tr>
      <td>/1.1/installations/&lt;objectId&gt;</td>
      <td>GET</td>
      <td>获取安装数据</td>
    </tr>
    <tr>
      <td>/1.1/installations/&lt;objectId&gt;</td>
      <td>PUT</td>
      <td>更新安装数据</td>
    </tr>
    <tr>
      <td>/1.1/installations</td>
      <td>GET</td>
      <td>查询安装数据</td>
    </tr>
    <tr>
      <td>/1.1/installations/&lt;objectId&gt;</td>
      <td>DELETE</td>
      <td>删除安装数据</td>
    </tr>
  </tbody>
</table>

### 数据 Schema

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/schemas</td>
      <td>GET</td>
      <td>获取应用的所有 Class 的 Schema</td>
    </tr>
    <tr>
      <td>/1.1/schemas/&lt;className&gt;</td>
      <td>POST</td>
      <td>获取应用指定的 Class 的 Schema</td>
    </tr>
  </tbody>
</table>

### 云函数

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/functions/&lt;functionName&gt;</td>
      <td>POST</td>
      <td>调用云函数</td>
    </tr>
    <tr>
      <td>/1.1/call/&lt;functionName&gt;</td>
      <td>POST</td>
      <td>调用云函数，支持 AVObject 作为参数和结果</td>
    </tr>
  </tbody>
</table>

### 用户反馈组件

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/feedback</td>
      <td>POST</td>
      <td>提交新的用户反馈</td>
    </tr>
  </tbody>
</table>

<!--
### 短信验证 API

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/requestSmsCode</td>
      <td>POST</td>
      <td>请求发送短信验证码</td>
    </tr>
        <tr>
      <td>/1.1/verifySmsCode/&lt;code&gt;</td>
      <td>POST</td>
      <td>验证短信验证码</td>
    </tr>
  </tbody>
</table>
-->

### 即时通讯

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/rtm/messages/logs</td>
      <td>GET</td>
      <td>获得应用聊天记录</td>
    </tr>
    <tr>
      <td>/1.1/rtm/messages</td>
      <td>POST</td>
      <td>通过 API 向用户发消息</td>
    </tr>
    <tr>
      <td>/1.1/rtm/transient_group/onlines</td>
      <td>GET</td>
      <td>获取暂态对话（聊天室）的在线人数</td>
    </tr>
  </tbody>
</table>

### 其他 API

<table>
  <thead>
    <tr>
      <th>URL</th>
      <th>HTTP</th>
      <th>功能</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>/1.1/date</td>
      <td>GET</td>
      <td>获得服务端当前时间</td>
    </tr>
    <tr>
      <td>/1.1/exportData</td>
      <td>POST</td>
      <td>请求导出应用数据</td>
    </tr>
    <tr>
      <td>/1.1/exportData/&lt;id&gt;</td>
      <td>GET</td>
      <td>获取导出数据任务状态和结果</td>
    </tr>
  </tbody>
</table>

### 请求格式

对于 POST 和 PUT 请求，请求的主体必须是 JSON 格式，而且 HTTP header 的 Content-Type 需要设置为 `application/json`。

用户验证通过 HTTP header 来进行，**X-LC-Id** 标明正在运行的是哪个应用，**X-LC-Key** 用来授权鉴定 endpoint：

```
curl -X PUT \
  -H "X-LC-Id: FFnN2hso42Wego3pWq4X5qlu" \
  -H "X-LC-Key: UtOCzqb67d3sN12Kts4URwy8" \
  -H "Content-Type: application/json" \
  -d '{"content": "更新一篇博客的内容"}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

对于 JavaScript 使用，LeanCloud 支持跨域资源共享，所以你可以将这些 header 同 XMLHttpRequest 一同使用。

#### 更安全的鉴权方式

我们还支持一种新的 API 鉴权方式，即在 HTTP header 中使用 **X-LC-Sign** 来代替 **X-LC-Key**，以降低 App Key 的泄露风险。例如：

```
curl -X PUT \
  -H "X-LC-Id: FFnN2hso42Wego3pWq4X5qlu" \
  -H "X-LC-Sign: d5bcbb897e19b2f6633c716dfdfaf9be,1453014943466" \
  -H "Content-Type: application/json" \
  -d '{"content": "在 HTTP header 中使用 X-LC-Sign 来更新一篇博客的内容"}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

**X-LC-Sign** 的值是由 `sign,timestamp[,master]` 组成的字符串：

| 取值        | 约束   | 描述                                       |
| --------- | ---- | ---------------------------------------- |
| sign      | 必须   | 将 timestamp 加上 App Key 或 Master Key 组成的字符串，再对它做 MD5 签名后的结果。 |
| timestamp | 必须   | 客户端产生本次请求的 unix 时间戳（UTC），精确到**毫秒**。      |
| master    | 可选   | 字符串 `"master"`，当使用 master key 签名请求的时候，必须加上这个后缀明确说明是使用 master key。 |

举例来说，假设应用的信息如下：

<table class="noheading">
  <tbody>
    <tr>
      <td scope="row">App Id</td>
      <td><code>FFnN2hso42Wego3pWq4X5qlu</code></td>
    </tr>
    <tr>
      <td scope="row">App Key</td>
      <td><code>UtOCzqb67d3sN12Kts4URwy8</code></td>
    </tr>
    <tr>
      <td scope="row">Master Key</td>
      <td><code>DyJegPlemooo4X1tg94gQkw1</code></td>
    </tr>
    <tr>
      <td scope="row">请求时间</td>
      <td>2016-01-17 15:15:43.466</td>
    </tr>
    <tr>
      <td scope="row">timestamp</td>
      <td><code>1453014943466</code></td>
    </tr>
  </tbody>
</table>

**使用 App Key 来计算 sign**：

>md5( timestamp + App Key ) <br/>
>= md5( <code><u>1453014943466</u>UtOCzqb67d3sN12Kts4URwy8</code> )<br/>= d5bcbb897e19b2f6633c716dfdfaf9be

```sh
  -H "X-LC-Sign: d5bcbb897e19b2f6633c716dfdfaf9be,1453014943466" \
```

**使用 Master Key 来计算 sign**：

>md5( timestamp + Master Key )<br/>
>= md5( <code><u>1453014943466</u>DyJegPlemooo4X1tg94gQkw1</code> ) <br>
>= e074720658078c898aa0d4b1b82bdf4b

```sh
  -H "X-LC-Sign: e074720658078c898aa0d4b1b82bdf4b,1453014943466,master" \
```

（最后加上 **master** 来告诉服务器这个签名是使用 master key 生成的。）

<div class="callout callout-danger">使用 master key 将绕过所有权限校验，应该确保只在可控环境中使用，比如自行开发的管理平台，并且要完全避免泄露。因此，以上两种计算 sign 的方法可以根据实际情况来选择一种使用。</div>

### 响应格式

对于所有的请求，响应格式都是一个 JSON 对象。

一个请求是否成功是由 HTTP 状态码标明的。一个 2XX 的状态码表示成功，而一个 4XX 表示请求失败。当一个请求失败时响应的主体仍然是一个 JSON 对象，但是总是会包含 `code` 和 `error` 这两个字段，你可以用它们来进行调试。举个例子，如果尝试用非法的属性名来保存一个对象会得到如下信息：

```json
{
  "code": 105,
  "error": "invalid field name: bl!ng"
}
```

错误代码请看 [错误代码详解](./error_code.html)。

## 对象

### 对象格式

LeanCloud 的数据存储服务是建立在 AVObject（对象）基础上的，每个 AVObject 包含若干属性值对（key-value，也称「键值对」），属性的值是与 JSON 格式兼容的数据。
通过 REST API 保存对象需要将对象的数据通过 JSON 来编码。这个数据是无模式化的（schema free），这意味着你不需要提前标注每个对象上有哪些 key，你只需要随意设置键值对就可以，后端会保存它。

举个例子，假如我们要实现一个类似于微博的社交 App，主要有三类数据：账户、帖子、评论，一条微博帖子可能包含下面几个属性：

```json
{
  "content": "每个 Java 程序员必备的 8 个开发工具",
  "pubUser": "LeanCloud官方客服",
  "pubTimestamp": 1435541999
}
```

Key（属性名）必须是字母和数字组成的字符串，Value（属性值）可以是任何可以 JSON 编码的数据。

每个对象都有一个类名，你可以通过类名来区分不同的数据。例如，我们可以把微博的帖子对象称之为 Post。我们建议将类和属性名分别按照 `NameYourClassesLikeThis` 和 `nameYourKeysLikeThis` 这样的惯例来命名，即区分第一个字母的大小写，这样可以提高代码的可读性和可维护性。

当你从 LeanCloud 中获取对象时，一些字段会被自动加上，如 createdAt、updatedAt 和 objectId。这些字段的名字是保留的，值也不允许修改。我们上面设置的对象在获取时应该是下面的样子：

```json
{
  "content": "每个 Java 程序员必备的 8 个开发工具",
  "pubUser": "LeanCloud官方客服",
  "pubTimestamp": 1435541999,
  "createdAt": "2015-06-29T01:39:35.931Z",
  "updatedAt": "2015-06-29T01:39:35.931Z",
  "objectId": "558e20cbe4b060308e3eb36c"
}
```

createdAt 和 updatedAt 都是 UTC 时间戳，以 ISO 8601 标准和毫秒级精度储存：`YYYY-MM-DDTHH:MM:SS.MMMZ`。objectId 是一个字符串，在类中可以唯一标识一个实例。
在 REST API 中，class 级的操作都是通过一个带类名的资源路径（URL）来标识的。例如，如果类名是 Post，那么 class 的 URL 就是：

```
https://{{host}}/1.1/classes/Post
```

对于**用户账户**这种对象，有一个特殊的 URL：

```
https://{{host}}/1.1/users
```

针对于一个特定的对象的操作可以通过组织一个 URL 来做。例如，对 Post 中的一个 objectId 为 `558e20cbe4b060308e3eb36c` 的对象的操作应使用如下 URL：

```
https://{{host}}/1.1/classes/Post/<objectId>
```

### 创建对象

为了在 LeanCloud 上创建一个新的对象，应该向 class 的 URL 发送一个 **POST** 请求，其中应该包含对象本身。{{ docs.alertInline(data.classNameConvention("class 的名称")) }}例如，要创建如上所说的对象：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"content": "每个 Java 程序员必备的 8 个开发工具","pubUser": "LeanCloud官方客服","pubTimestamp": 1435541999}' \
  https://{{host}}/1.1/classes/Post
```

当创建成功时，HTTP 的返回是 **201 Created**，而 header 中的 Location 表示新的 object 的 URL：

```sh
Status: 201 Created
Location: https://{{host}}/1.1/classes/Post/<objectId>
```

响应的主体是一个 JSON 对象，包含新的对象的 objectId 和 createdAt 时间戳。

```json
{
  "createdAt": "2015-06-29T01:39:35.931Z",
  "objectId": "558e20cbe4b060308e3eb36c"
}
```

如果希望返回新创建的对象的完整信息，可以在 URL 里加上 `fetchWhenSave` 选项，并且设置为 true：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"content": "每个 Java 程序员必备的 8 个开发工具","pubUser": "LeanCloud官方客服","pubTimestamp": 1435541999}' \
  https://{{host}}/1.1/classes/Post?fetchWhenSave=true
```

fetchWhenSave 选项对更新对象也同样有效，但是它仅返回已被更新的字段，而非全部字段。

{{ docs.note("**每个应用最多可以创建 500 个 class**，但每个 class 中的记录数量没有限制。") }}

### 获取对象

当你创建了一个对象时，你可以通过发送一个 GET 请求到返回的 header 的 Location 以获取它的内容。例如，为了得到我们上面创建的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/classes/Post/<objectId>
```

返回的主体是一个 JSON 对象包含所有用户提供的 field 加上 createdAt、updatedAt 和 objectId 字段：

```json
{
  "content": "每个 Java 程序员必备的 8 个开发工具",
  "pubUser": "LeanCloud官方客服",
  "pubTimestamp": 1435541999,
  "createdAt": "2015-06-29T01:39:35.931Z",
  "updatedAt": "2015-06-29T01:39:35.931Z",
  "objectId": "558e20cbe4b060308e3eb36c"
}
```

当获取的对象有指向其子对象的指针时，你可以加入 `include` 选项来获取这些子对象。假设微博记录中有一个字段 `author` 来指向发布者的账户信息，按上面的例子，可以这样来连带获取发布者完整信息：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'include=author' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

### 更新对象

为了更改一个对象已经有的数据，你可以发送一个 PUT 请求到对象相应的 URL 上，任何你未指定的 key 都不会更改，所以你可以只更新对象数据的一个子集。例如，我们来更改我们对象的一个 content 字段：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"content": "每个 JavaScript 程序员必备的 8 个开发工具: http://buzzorange.com/techorange/2015/03/03/9-javascript-ide-editor/"}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

返回的 JSON 对象只会包含一个 updatedAt 字段，表明更新发生的时间：

```json
{
  "updatedAt": "2015-06-30T18:02:52.248Z"
}
```

#### 计数器

比如一条微博，我们需要记录有多少人喜欢或者转发了它，但可能很多次喜欢都是同时发生的，如果每个客户端都直接把读到的计数值更改之后再写回去，那么极容易引发冲突和覆盖，导致最终结果不准。LeanCloud 提供了对数字类型字段进行原子增加或者减少的功能，稳妥地实现对计数器类型数据的更新：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"upvotes":{"__op":"Increment","amount":1}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

这样就将对象的 **upvotes** 属性值（被用户点赞的次数）加上 1，其中 **amount** 为递增的数字大小，如果为负数，则为递减。

除了 Increment，我们也提供了 Decrement 用于递减，等价于 Increment 一个负数。

#### 位运算

如果数据表的某一列是整型，可以使用位运算操作符该列进行原子的位运算：

* BitAnd 与运算
* BitOr 或运算
* BitXor 异或运算

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"flags":{"__op":"BitOr","value": 0x0000000000000004}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```


#### 数组

LeanCloud 提供 3 种原子性操作来存储和更改数组类型的字段：

* **Add**：在一个数组字段的后面添加一些指定的对象（包装在一个数组内）
* **AddUnique**：只会在数组内原本没有这个对象的情形下才会添加入数组，插入的位置不定。
* **Remove**：从一个数组内移除所有的指定的对象

每种操作都有一个 key `objects`，其值为被添加或删除的对象列表。例如为每条微博增加一个「标签」属性 tags，然后往里面加入一些值：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"tags":{"__op":"AddUnique","objects":["Frontend","JavaScript"]}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

{# --- issue #2227 remove relation ---
#### 关系

LeanCloud 提供特殊的原子操作来添加和删除一个关系 Relation。比如用户喜欢了这条微博（添加关系）：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"likes":{"__op":"AddRelation","objects":[{"__type":"Pointer","className":"_User","objectId":"51c3ba67e4b0f0e851c16221"}]}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

用户取消了对这条微博的喜欢（删除关系）：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"likes":{"__op":"RemoveRelation","objects":[{"__type":"Pointer","className":"_User","objectId":"51fa3f64e4b05df1766cfb90"}]}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```
--- issue #2227 remove relation --- #}

#### 按条件更新对象

假设从某个账户对象 Account 的余额中扣除一定金额，但是要求余额要大于等于被扣除的金额才允许操作，那么就需要通过 `where` 参数为更新操作加上限定条件 `balance >= amount`：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"balance":{"__op":"Decrement","amount": 30}}' \
  "https://{{host}}/1.1/classes/Account/558e20cbe4b060308e3eb36c?where=%7B%22balance%22%3A%7B%22%24gte%22%3A%2030%7D%7D"
```

URL 中 where 参数的值是 `%7B%22balance%22%3A%7B%22%24gte%22%3A%2030%7D%7D`，其实这是 `{"balance":{"$gte": 30}}` 被 URL 编码后的结果。更多 where 查询的例子请参考 [查询](#查询)。

如果条件不满足，更新将失败，同时返回错误码 `305`：


```json
{
  "code" : 305,
  "error": "No effect on updating/deleting a document."
}
```

**特别强调：where 一定要作为 URL 的 Query Parameters 传入。**

{{ include.ops("__","#### __op 操作汇总") }}

### 删除对象

为了在 LeanCloud 上删除一个对象，可以发送一个 DELETE 请求到指定的对象的 URL，比如：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/classes/Post/<objectId>
```

还可以使用 Delete 操作删除一个对象的一个字段（注意此时** HTTP Method 还是 PUT**）：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"downvotes":{"__op":"Delete"}}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

#### 按条件删除对象

为请求增加 `where` 参数即可以按指定的条件来删除对象。例如删除点击量 clicks 为 0 的帖子：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  "https://{{host}}/1.1/classes/Post/<objectId>?where=%7B%22clicks%22%3A%200%7D"
```

URL 中 where 参数的值是 `%7B%22clicks%22%3A%200%7D`，其实这是 `{"clicks": 0}` 被 URL 编码后的结果。更多 where 查询的例子请参考 [查询](#查询)。

如果条件不满足，删除将失败，同时返回错误码 `305`：

```json
{
  "code" : 305,
  "error": "No effect on updating/deleting a document."
}
```

**特别强调：where 一定要作为 URL 的 Query Parameters 传入。**

### 遍历 Class

因为更新和删除都是基于单个对象的，都要求提供 objectId，但是有时候用户需要高效地遍历一个 Class，做一些批量的更新或者删除的操作。

通常情况下，如果 Class 的数量规模不大，使用查询加上 `skip` 和 `limit` 分页配合排序 `order` 就可以遍历所有数据。但是当 Class 数量规模比较大的时候， `skip` 的效率就非常低了（这跟 MySQL 等关系数据库的原因一样，深度翻页比较慢），因此我们提供了 `scan` 协议，可以按照特定字段排序来高效地遍历一张表，默认这个字段是 `objectId` 升序，同时支持设置 `limit`  限定每一批次的返回数量，默认 limit 为 100，最大可设置为 1000：

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   -G \
   --data-urlencode 'limit=10' \
   https://{{host}}/1.1/scan/classes/Article
```

`scan` 强制要求使用 master key。

返回：

```json
{
  "results":
   [
      {
        "tags"     :  ["clojure","\u7b97\u6cd5"],
        "createdAt":  "2016-07-07T08:54:13.250Z",
        "updatedAt":  "2016-07-07T08:54:50.268Z",
        "title"    :  "clojure persistent vector",
        "objectId" :  "577e18b50a2b580057469a5e"
       },
       ...
    ],
    "cursor": "pQRhIrac3AEpLzCA"}
```

其中 `results` 对应的就是返回的对象列表，而 `cursor` 表示本次遍历当前位置的「指针」，当 `cursor` 为 null 的时候，表示已经遍历完成，如果不为 null，请继续传入 `cursor` 到 `scan` 接口就可以从上次到达的位置继续往后查找：

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   -G \
   --data-urlencode 'limit=10' \
   --data-urlencode 'cursor=pQRhIrac3AEpLzCA' \
   https://{{host}}/1.1/scan/classes/Article
```

每次返回的 `cursor` 的有效期是 10 分钟。

遍历还支持过滤条件，加入 where 参数：

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   -G \
   --data-urlencode 'limit=10' \
   --data-urlencode 'where={"score": 100}' \
   https://{{host}}/1.1/scan/classes/Article
```

默认情况下系统按 `objectId` 升序排序，增加 `scan_key` 参数可以使用其他字段来排序：

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   -G \
   --data-urlencode 'limit=10' \
   --data-urlencode 'scan_key=score' \
   https://{{host}}/1.1/scan/classes/Article
```

scan_key 也支持倒序，前面加个减号即可，例如 `-score`。

**自定义的 scan_key 需要满足严格单调递增的条件，并且 scan_key 不可作为 where 查询条件存在。**

### 批量操作

为了减少网络交互的次数太多带来的时间浪费，你可以在一个请求中对多个对象进行 create、update、delete 操作。

在一个批次中每一个操作都有相应的方法、路径和主体，这些参数可以代替你通常会使用的 HTTP 方法。这些操作会以发送过去的顺序来执行，比如我们要一次发布一系列的微博：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "requests": [
          {
            "method": "POST",
            "path": "/1.1/classes/Post",
            "body": {
              "content": "近期 LeanCloud 的文档已经支持评论功能，如果您有疑问、意见或是其他想法，都可以直接在我们文档中提出。",
              "pubUser": "LeanCloud官方客服"
            }
          },
          {
            "method": "POST",
            "path": "/1.1/classes/Post",
            "body": {
              "content": "很多用户表示很喜欢我们的文档风格，我们已将 LeanCloud 所有文档的 Markdown 格式的源码开放出来。",
              "pubUser": "LeanCloud官方客服"
            }
          }
        ]
      }' \
  https://{{host}}/1.1/batch
```

我们对每一批次中所包含的操作数量（requests 数组中的元素个数）暂不设限，但考虑到云端对每次请求的 body 内容大小有 20 MB 的限制，因此建议将每一批次的操作数量控制在 100 以内。

批量操作的响应 body 会是一个列表，列表的元素数量和顺序与给定的操作请求是一致的。每一个在列表中的元素都有一个字段是 success 或者 error。

```
[
  {
    "error": {
      "code": 1,
      "error": "Could not find object by id '558e20cbe4b060308e3eb36c' for class 'Post'."
    }
  },
  {
    "success": {
      "updatedAt": "2017-02-22T06:35:29.419Z",
      "objectId": "58ad2e850ce463006b217888"
    }
  }
]
```

需要注意，即使一个 batch 请求返回的响应码为 200，这仅代表服务端已收到并处理了这个请求，但并不说明该 
batch 中的所有操作都成功完成，只有当返回 body 的列表中**不存在 error 元素**，开发者才可以认为所有操作都已成功完成。

在 batch 操作中 update 和 delete 同样是有效的：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "requests": [
          {
            "method": "PUT",
            "path": "/1.1/classes/Post/55a39634e4b0ed48f0c1845b",
            "body": {
              "upvotes": 2
            }
          },
          {
            "method": "DELETE",
            "path": "/1.1/classes/Post/55a39634e4b0ed48f0c1845c"
          }
        ]
      }' \
  https://{{host}}/1.1/batch
```

批量操作还有一个冷门用途，代替 URL 过长的 GET（比如使用 containedIn 等方法构造查询）和 DELETE （比如批量删除）请求，以绕过服务端和某些客户端对 URL 长度的限制。

### 数据类型

到现在为止我们只使用了可以被标准 JSON 编码的值，LeanCloud 移动客户端 SDK library 同样支持日期、二进制数据和关系型数据。在 REST API 中，这些值都被编码了，同时有一个 `__type` 字段（注意：**前缀是两个下划线**）来标示出它们的类型，所以如果你采用正确的编码的话就可以读或者写这些字段。

<a id="datatype_date" name="datatype_date"></a>**Date** 类型包含了一个 iso 字段，其值是一个 UTC 时间戳，以 ISO 8601 格式和毫秒级的精度来存储的时间值，格式为：`YYYY-MM-DDTHH:MM:SS.MMMZ`：

```json
{
  "__type": "Date",
  "iso": "2015-06-21T18:02:52.249Z"
}
```

Date 和内置的 createdAt 字段和 updatedAt  字段相结合的时候特别有用，举个例子：为了找到在一个特殊时间发布的微博，只需要将 Date 编码后放在使用了比较条件的查询里面：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"createdAt":{"$gte":{"__type":"Date","iso":"2015-06-21T18:02:52.249Z"}}}' \
  https://{{host}}/1.1/classes/Post
```

注意，由于 createdAt 和 updatedAt 属于保留字段，因此通过 REST API 请求这两个字段时，将直接返回 UTC 时间戳字符串。

**Byte** 类型包含了一个 base64 字段，这个字段是一些二进制数据编码过的 base64 字符串。base64 是 MIME 使用的标准，不包含空白符：

```json
{
  "__type": "Bytes",
  "base64": "5b6I5aSa55So5oi36KGo56S65b6I5Zac5qyi5oiR5Lus55qE5paH5qGj6aOO5qC877yM5oiR5Lus5bey5bCGIExlYW5DbG91ZCDmiYDmnInmlofmoaPnmoQgTWFya2Rvd24g5qC85byP55qE5rqQ56CB5byA5pS+5Ye65p2l44CC"
}
```

**Pointer** 类型是用来设定 AVObject 作为另一个对象的值时使用的，它包含了 className 和 objectId 两个属性值，用来提取目标对象：

```json
{
  "__type": "Pointer",
  "className": "Post",
  "objectId": "55a39634e4b0ed48f0c1845c"
}
```

指向用户对象的 Pointer 的 className 为 `_User`，前面加一个下划线表示开发者不能定义的类名，而且所指的类是 LeanCloud 平台内置的。

**Relation** 类型被用在多对多的类型上，移动端使用 AVRelation 作为值，它有一个 className 字段表示目标对象的类名。

{{ data.relationDeprecated() }}

```json
{
  "__type": "Relation",
  "className": "Post"
}
```

在进行查询时，Relation 对象的行为很像是 Pointer 的数组，任何针对于 pointer 数组的操作（`include` 除外）都可以对 Relation 起作用。

当更多的数据类型被加入的时候，它们都会采用 hashmap 加上一个 `__type` 字段的形式，所以你不应该使用 `__type` 作为你自己的 JSON 对象的 key。

## 查询

### 基础查询

通过发送一个 GET 请求到类的 URL 上，不需要任何 URL 参数，你就可以一次获取多个对象。下面就是简单地获取所有微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/classes/Post
```

返回的值就是一个 JSON 对象包含了 results 字段，它的值就是对象的列表：

```json
{
  "results": [
    {
      "content": "近期 LeanCloud 的文档已经支持评论功能，如果您有疑问、意见或是其他想法，都可以直接在我们文档中提出。",
      "pubUser": "LeanCloud官方客服",
      "upvotes": 2,
      "createdAt": "2015-06-29T03:43:35.931Z",
      "objectId": "55a39634e4b0ed48f0c1845b"
    },
    {
      "content": "每个 Java 程序员必备的 8 个开发工具",
      "pubUser": "LeanCloud官方客服",
      "pubTimestamp": 1435541999,
      "createdAt": "2015-06-29T01:39:35.931Z",
      "updatedAt": "2015-06-29T01:39:35.931Z",
      "objectId": "558e20cbe4b060308e3eb36c"
    }
  ]
}
```

{{ data.localizedDates() }} 

### 查询约束

通过 `where` 参数的形式可以对查询对象做出约束。

`where` 参数的值应该是 JSON 编码过的。就是说，如果你查看真正被发出的 URL 请求，它应该是先被 JSON 编码过，然后又被 URL 编码过。最简单的使用 `where` 参数的方式就是包含应有的 key 和 value。例如，如果我们想要看到「LeanCloud官方客服」发布的所有微博，我们应该这样构造查询:

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"pubUser":"LeanCloud官方客服"}' \
  https://{{host}}/1.1/classes/Post
```

除了完全匹配一个给定的值以外，`where` 也支持比较的方式，而且它还支持对 key 的一些 hash 操作，比如包含。`where` 参数支持如下选项：

| Key           | Operation                |
| ------------- | ------------------------ |
| `$ne`         | 不等于                      |
| `$lt`         | 小于                       |
| `$lte`        | 小于等于                     |
| `$gt`         | 大于                       |
| `$gte`        | 大于等于                     |
| `$regex`      | 正则表达式。`$options` 指定 [全局修饰符](#正则查询) |
| `$in`         | 包含任意一个数组值                |
| `$nin`        | 不包含任意一个数组值               |
| `$all`        | 包括所有的数组值                 |
| `$exists`     | 指定 Key 有值                |
| `$select`     | 匹配另一个查询的返回值              |
| `$dontSelect` | 排除另一个查询的返回值              |

例如获取在 **2015-06-29** 当天发布的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"createdAt":{"$gte":{"__type":"Date","iso":"2015-06-29T00:00:00.000Z"},"$lt":{"__type":"Date","iso":"2015-06-30T00:00:00.000Z"}}}' \
  https://{{host}}/1.1/classes/Post
```

求点赞次数少于 10 次，且该次数还是奇数的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"upvotes":{"$in":[1,3,5,7,9]}}' \
  https://{{host}}/1.1/classes/Post
```

获取不是「LeanCloud官方客服」发布的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"pubUser":{"$nin":["LeanCloud官方客服"]}}' \
  https://{{host}}/1.1/classes/Post
```

获取有人喜欢的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"upvotes":{"$exists":true}}' \
  https://{{host}}/1.1/classes/Post
```

获取没有被人喜欢过的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"upvotes":{"$exists":false}}' \
  https://{{host}}/1.1/classes/Post
```

微博有用户互相关注的功能，如果我们用 `_Followee`（用户关注的人） 和 `_Follower`（用户的粉丝） 这两个类来存储用户之间的关注关系{% if node != 'qcloud' %}（我们的 [应用内社交组件](./status_system.html) 已经实现了这样的模型）{% endif %}，我们可以创建一个查询来找到某个用户关注的人发布的微博（`Post` 表中有一个字段 `author` 指向发布者）：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={
    "author": {
      "$select": {
        "query": { 
          "className":"_Followee",
           "where": {
             "user":{
               "__type": "Pointer",
               "className": "_User",
               "objectId": "55a39634e4b0ed48f0c1845c" 
             }
           }
        }, 
        "key":"followee" 
      }
    }
  }' \
  https://{{host}}/1.1/classes/Post
```

`order` 参数指定一个字段的排序方式，前面加一个负号表示逆序。返回 Post 记录并按发布时间升序排列：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'order=createdAt' \
  https://{{host}}/1.1/classes/Post
```

降序排列：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'order=-createdAt' \
  https://{{host}}/1.1/classes/Post
```

对多个字段进行排序，要使用逗号分隔的列表。将 Post 以 createdAt 升序和 pubUser 降序进行排序：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'order=createdAt,-pubUser' \
  https://{{host}}/1.1/classes/Post
```

你可以用 `limit` 和 `skip` 来做分页。`limit` 的默认值是 100，任何 1 到 1000 之间的值都是可选的，在 1 到 1000 范围之外的都强制转成默认的 100。比如为了获取排序在 400 到 600 之间的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'limit=200' \
  --data-urlencode 'skip=400' \
  https://{{host}}/1.1/classes/Post
```

你可以限定返回的字段通过传入 `keys` 参数和一个逗号分隔列表。为了返回对象只包含 `pubUser` 和 `content` 字段（还有特殊的内置字段比如 objectId、createdAt 和 updatedAt）：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'keys=pubUser,content' \
  https://{{host}}/1.1/classes/Post
```

`keys` 还支持反向选择，也就是不返回某些字段，字段名前面加个减号即可，比如我不想查询返回 `author`：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'keys=-author' \
  https://{{host}}/1.1/classes/Post
```

所有以上这些参数都可以和其他的组合进行使用。

### 正则查询

获取标题以大写「WTO」开头的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'where={"title":{"$regex":"^WTO.*","$options":"i"}}' \
  https://{{host}}/1.1/classes/Post
```

我们使用以下数据来演示如何使用 `$options` 匹配 **title** 字段值：

```
{ "_id" : 100, "title" : "Single line description." },
{ "_id" : 101, "title" : "First line\nSecond line" },
{ "_id" : 102, "title" : "Many spaces before     line" },
{ "_id" : 103, "title" : "Multiple\nline description" },
{ "_id" : 103, "title" : "abc123" }
```

参数 | 说明 | 示例
---|---|---|
`i` | **忽略大小写** | `{"$regex":"single", "$options":"i"}` 将匹配<br/><br/><pre><code>{ "_id" : 100, "title" : "Single line description." }</code></pre>
`m` | **多行匹配**<br/>比如文本中包含了换行符 `\n` | `{"$regex":"^S", "$options":"m"}`（以大写字母 S 开头）将匹配 <br/><br/><pre><code>{ "_id" : 100, "title" : "Single line description." },<br/>{ "_id" : 101, "title" : "First line\nSecond line" }</code></pre>
`x` | **忽略空白字符**<br/>包括空格、tab、`\n`、`#` 注释等，<br/>但对 vertical tab（ASCII 码为 11）无效。 | `{"$regex":"abc #category code\n123 #item number", "$options":"x"}`（# 后面为注释）将匹配 <br/><br/><pre><code>{ "_id" : 103, "title" : "abc123" }</code></pre>
`s` | **允许 `.` 匹配任意字符和换行** | `{"$regex":"m.*line", "$options":"si"}` 将匹配 <br/><br/><pre><code>{ "_id" : 102, "title" : "Many spaces before     line" },<br/>{ "_id" : 103, "title" : "Multiple\nline description" }</code></pre>

以上参数可以组合使用，如 `"$options":"sixm"`。


### 数组查询

如果 key 的值是数组类型，查找 key 值中有 2 的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"arrayKey":2}' \
  https://{{host}}/1.1/classes/TestObject
```

查找 key 值中有 2 或 3 或 4 的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"arrayKey":{"$in":[2,3,4]}}' \
  https://{{host}}/1.1/classes/TestObject
```

使用 `$all` 操作符来找到 key 值中**同时**有 2 和 3 和 4 的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"arrayKey":{"$all":[2,3,4]}}' \
  https://{{host}}/1.1/classes/TestObject
```

### 关系查询

有几种方式来查询对象之间的关系数据。如果你想获取对象，而这个对象的一个字段对应了另一个对象，你可以用一个 `where` 查询，自己构造一个 Pointer，和其他数据类型一样。例如，每条微博都会有很多人评论，我们可以让每一个 Comment 将它对应的 Post 对象保存到 post 字段上，这样你可以取得一条微博下所有 Comment：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"post":{"__type":"Pointer","className":"Post","objectId":"558e20cbe4b060308e3eb36c"}}' \
  https://{{host}}/1.1/classes/Comment
```

如果你想获取对象，这个对象的一个字段指向的对象需要另一个查询来指定，你可以使用 `$inQuery` 操作符。注意 `limit` 的默认值是 100 且最大值是 1000，这个限制同样适用于内部的查询，所以对于较大的数据集你可能需要细心地构建查询来获得期望的结果。

如上面的例子，假设每条微博还有一个 `image` 的字段，用来存储配图，你可以这样列出带图片的微博的评论数据：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"post":{"$inQuery":{"where":{"image":{"$exists":true}},"className":"Post"}}}' \
  https://{{host}}/1.1/classes/Comment
```

如果你想获取作为其父对象的关系成员的对象，你可以使用 `$relatedTo` 操作符。例如对于微博这种社交类应用来讲，每一条微博都可以被不同的用户点赞，我们可以设计 Post 类下面有一个 key 是 Relation 类型，叫做 `likes`，存储了喜欢这个 Post 的所有 User。

{{ data.relationDeprecated() }}

你可以通过下面的方式找到喜欢某条 Post 的所有用户（**请注意，新创建应用的 `_User` 表的查询权限默认是关闭的，你可以通过 class 权限设置打开，请参考 [数据与安全 - Class 级别的权限](data_security.html#Class_级别的_ACL)。**）：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"$relatedTo":{"object":{"__type":"Pointer","className":"Post","objectId":"558e20cbe4b060308e3eb36c"},"key":"likes"}}' \
  https://{{host}}/1.1/users
```

有时候，你可能需要在一个查询之中返回多种类型，你可以通过传入字段到 `include` 参数中。比如，我们想获得最近的 10 篇评论，而你想同时得到它们关联的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'order=-createdAt' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'include=post' \
  https://{{host}}/1.1/classes/Comment
```

不是作为一个 Pointer 表示，`post` 字段现在已经被展开为一个完整的对象：`__type` 被设置为 Object 而 `className` 同样也被提供了。例如，一个指向 Post 的 Pointer 可能被展示为：

```json
{
  "__type": "Pointer",
  "className": "Post",
  "objectId": "51e3a359e4b015ead4d95ddc"
}
```

当一个查询使用 `include` 参数来包含进去来取代 pointer 之后，可以看到 pointer 被展开为：

```json
{
  "__type": "Object",
  "className": "Post",
  "objectId": "51e3a359e4b015ead4d95ddc",
  "createdAt": "2015-06-29T09:31:20.371Z",
  "updatedAt": "2015-06-29T09:31:20.371Z",
  "desc": "Post 的其他字段也会一同被包含进来。"
}
```

你可以同样做多层的 `include`，这时要使用点号（.）。如果你要 include 一个 Comment 对应的 Post 对应的 `author`：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'order=-createdAt' \
  --data-urlencode 'limit=10' \
  --data-urlencode 'include=post.author' \
  https://{{host}}/1.1/classes/Comment
```

如果你要构建一个查询，这个查询要 include 多个类，此时用逗号分隔列表即可。

### 对象计数

如果你在使用 `limit`，或者如果返回的结果很多，你可能想要知道到底有多少对象应该返回，而不用把它们全部获得以后再计数，此时你可以使用 `count` 参数。举个例子，如果你仅仅是关心一个某个用户发布了多少条微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"pubUser":"LeanCloud官方客服"}' \
  --data-urlencode 'count=1' \
  --data-urlencode 'limit=0' \
  https://{{host}}/1.1/classes/Post
```

因为这个 request 请求了 `count` 而且把 `limit` 设为了 0，返回的值里面只有计数，没有 `results`：

```json
{
  "results": [

  ],
  "count": 7
}
```

如果有一个非 0 的 `limit` 的话，则既会返回 `results` 也会返回 `count`。

### 复合查询

`$or` 操作符用于查询**符合任意一种条件**的对象，它的值为一个 JSON 数组。例如，查询企业账号和个人账号的微博：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={"$or":[{"pubUserCertificate":{"$gt":2}},{"pubUserCertificate":{"$lt":3}}]}' \
  https://{{host}}/1.1/classes/Post
```

任何在查询上的其他约束都会对返回的对象生效，所以你可以用 `$or` 对其他的查询添加约束。

`$and` 操作符用于查询**符合全部条件**的对象，它的值为一个 JSON 数组。例如查找存在 price 字段且 price != 199 的对象：

```
--data-urlencode 'where={"$and":[{"price": {"$ne":199}},{"price":{"$exists":true}}]}' \ 
```

{{ docs.alert("在组合查询的子查询中不支持使用 limit、skip、order、include 等非过滤型的约束。") }}

### 使用 CQL 查询

我们还提供类 SQL 语法的 CQL 查询语言，查询应用内数据，例如：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'cql=select * from Post limit 0,100 order by pubUser' \
  https://{{host}}/1.1/cloudQuery
```

更多请参考 [CQL 详细指南](./cql_guide.html)。

CQL 还支持占位符查询，`where` 和 `limit` 子句的条件参数可以使用问号替换，然后通过 `pvalues` 数组传入：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'cql=select * from Post where pubUser=? limit ?,? order by createdAt' \
   --data-urlencode 'pvalues=["dennis", 0, 100]'
  https://{{host}}/1.1/cloudQuery
```

{{ data.innerQueryLimitation("#### 子查询的局限") }}

## 用户

不仅在移动应用上，还在其他系统中，很多应用都有一个统一的登录流程。通过 REST API 访问用户的账户让你可以在 LeanCloud 上简单实现这一功能。

通常来说，**用户**（类名 `_User`）这个类的功能与其他的对象是相同的，比如都没有限制模式（Schema free）。User 对象和其他对象不同的是一个用户必须有用户名（username）和密码（password），密码会被自动地加密和存储。LeanCloud 强制要求 username 和 email 这两个字段必须是没有重复的。

### 注册

注册一个新用户与创建一个新的普通对象之间的不同点在于 username 和 password 字段都是必需的。password 字段会以和其他的字段不一样的方式处理，它在储存时会被加密而且永远不会被返回给任何来自客户端的请求。

你可以让 LeanCloud 自动验证邮件地址，做法是进入 [控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf)，勾选 **用户注册时，发送验证邮件**。

这项设置启用了的话，所有填写了 email 的用户在注册时都会产生一个 email 验证地址，并发回到用户邮箱，用户打开邮箱点击了验证链接之后，用户表里 `emailVerified` 属性值会被设为 true。你可以在 `emailVerified` 字段上查看用户的 email 是否已经通过验证。

为了注册一个新的用户，需要向 user 路径发送一个 POST 请求，你可以加入一个新的字段，例如，创建一个新的用户有一个电话号码:

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"username":"hjiang","password":"f32@ds*@&dsa","phone":"18612340000"}' \
  https://{{host}}/1.1/users
```

当创建成功时，HTTP返回为 201 Created，Location 头包含了新用户的 URL：

```sh
Status: 201 Created
Location: https://{{host}}/1.1/users/55a47496e4b05001a7732c5f
```

返回的主体是一个 JSON 对象，包含 objectId、createdAt 时间戳表示创建对象时间，sessionToken 可以被用来认证这名用户随后的请求：

```
{
  "sessionToken":"qmdj8pdidnmyzp0c7yqil91oc",
  "createdAt":"2015-07-14T02:31:50.100Z",
  "objectId":"55a47496e4b05001a7732c5f"
}
```

### 登录

在你允许用户注册之后，在以后你需要让他们用自己的用户名和密码登录。为了做到这一点，发送一个 POST 请求到 /1.1/login，加上 username 和 password 作为 body。

```sh
curl -X POST \
-H "Content-Type: application/json" \
-H "X-LC-Id: {{appid}}" \
-H "X-LC-Key: {{appkey}}" \
-d '{"username":"hjiang","password":"f32@ds*@&dsa"}' \
https://{{host}}/1.1/login
```

返回的主体是一个 JSON 对象包括所有除了 password 以外的自定义字段。它同样包含了 createdAt、updateAt、objectId 和 sessionToken 字段。

```json
{
  "sessionToken":"qmdj8pdidnmyzp0c7yqil91oc",
  "updatedAt":"2015-07-14T02:31:50.100Z",
  "phone":"18612340000",
  "objectId":"55a47496e4b05001a7732c5f",
  "username":"hjiang",
  "createdAt":"2015-07-14T02:31:50.100Z",
  "emailVerified":false,
  "mobilePhoneVerified":false
}
```

可以将 sessionToken 理解为用户的登录凭证，每个用户的 sessionToken 在同一个应用内都是唯一的， 类似于 Cookie 的概念。

正常情况下，用户的 sessionToken 是固定不变的，但在以下情况下会发生改变：

* 客户端调用了忘记密码功能，重设了密码。
* 开发者在 [控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf)
 中勾选了 **密码修改后，强制客户端重新登录**，那么在修改密码后 sessionToken 也将强制更换。
* 调用 [`refreshSessionToken`](#重置登录_sessionToken) 主动重置。

在 sessionToken 变化后，已有的登录如果调用到用户相关权限受限的 API，将返回 403 权限错误。

### 已登录的用户信息

用户成功注册或登录后，服务器会返回 sessionToken 并保存在本地，后续请求可以通过传递 sessionToken 来获取该用户信息（如访问权限等）。更多说明请参考 [存储 &middot; sessionToken](leanstorage_guide-js.html#SessionToken)。

```
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  https://{{host}}/1.1/users/me
```
返回的 JSON 数据与 [`/login`](#登录) 登录请求所返回的相同。

### 重置登录 sessionToken

可以主动重置用户的 sessionToken：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  https://{{host}}/1.1/users/57e3bcca67f35600577c3063/refreshSessionToken
```

调用这个 API 要求传入登录返回的 `X-LC-Session` 作为认证，或者使用 Master Key。

重置成功将返回新的 sessionToken 及用户信息：

```json
{
 "sessionToken":"5frlikqlwzx1nh3wzsdtfr4q7",
 "updatedAt":"2016-10-20T03:10:57.926Z",
 "objectId":"57e3bcca67f35600577c3063",
 "username":"leancloud",
 "createdAt":"2016-09-22T11:13:14.842Z",
 "emailVerified":false,
 "mobilePhoneVerified":false
}
```

#### 账户锁定

输入错误的密码或验证码会导致用户登录失败。如果在 15 分钟内，同一个用户登录失败的次数大于 6 次，该用户账户即被云端暂时锁定，此时云端会返回错误码 `{"code":219,"error":"登录失败次数超过限制，请稍候再试，或者通过忘记密码重设密码。"}`，开发者可在客户端进行必要提示。

锁定将在最后一次错误登录的 15 分钟之后由云端自动解除，开发者无法通过 SDK 或 REST API 进行干预。在锁定期间，即使用户输入了正确的验证信息也不允许登录。这个限制在 SDK 和云引擎中都有效。

{% if node != 'qcloud' and node != 'us' %}
### 使用手机号码注册或登录

请参考 [短信服务 REST API 详解 &middot; 使用手机号码注册或登录](rest_sms_api.html#使用手机号码注册或登录)。
{% endif %}

### 验证 Email

设置 email 验证是 app 设置中的一个选项，通过这个标识，应用层可以对提供真实 email 的用户更好的功能或者体验。Email 验证会在 User 对象中加入 `emailVerified` 字段，当一个用户的 email 被新设置或者修改过的话，`emailVerified` 会被重置为 false。LeanCloud 后台会往用户填写的邮箱发送一个验证链接，用户点击这个链接可以让 `emailVerified` 被设置为 true。

emailVerified 字段有 3 种状态可以参考：

1. **true**：用户已经点击了发送到邮箱的验证地址，邮箱被验证为真实有效。LeanCloud 保证在新创建用户的时候 emailVerified 一定为 false。
2. **false**：User 对象最后一次被更新的时候，用户并没有确认过他的 email 地址。如果你看到 emailVerified 为 false 的话，你可以考虑刷新 User 对象或者再次请求验证用户邮箱。
3. **null**：User对象在 email 验证没有打开的时候就已经创建了，或者 User 没有 email。

关于自定义邮件模板和验证链接请看博客文章[《自定义应用内用户重设密码和邮箱验证页面》](https://blog.leancloud.cn/607/)。

### 请求验证 Email

发送给用户的邮箱验证邮件在一周内失效，你可以通过调用 `/1.1/requestEmailVerify` 来强制重新发送：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"email":"hang@leancloud.rocks"}' \
  https://{{host}}/1.1/requestEmailVerify
```

### 请求密码重设

在用户将 email 与他们的账户关联起来之后，你可以通过邮件来重设密码。操作方法为，发送一个 POST 请求到 `/1.1/requestPasswordReset`，同时在 request 的 body 部分带上 email 字段。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"email":"hang@leancloud.rocks"}' \
  https://{{host}}/1.1/requestPasswordReset
```

如果成功的话，返回的值是一个 JSON 对象。

关于自定义邮件模板和验证链接请看这篇博客文章[《自定义应用内用户重设密码和邮箱验证页面》](https://blog.leancloud.cn/607/)。

{% if node!='qcloud' %}
### 手机号码验证

请参考 [短信服务 REST API 详解 - 用户账户与手机号码验证](rest_sms_api.html#用户账户与手机号码验证)。
{% endif %}

### 获取用户

你可以发送一个 GET 请求到 URL 以获取用户的账户信息，返回的内容就是当创建用户时返回的内容。比如，为了获取上面创建的用户:

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/users/55a47496e4b05001a7732c5f
```

返回的 body 是一个 JSON 对象，包含所有用户提供的字段，除了密码以外，也包括了 createdAt、 updatedAt 和 objectId 字段.

```json
{
  "updatedAt":"2015-07-14T02:31:50.100Z",
  "phone":"18612340000",
  "objectId":"55a47496e4b05001a7732c5f",
  "username":"hjiang",
  "createdAt":"2015-07-14T02:31:50.100Z",
  "emailVerified":false,
  "mobilePhoneVerified":false
}
```

### 更新用户

在通常的情况下，没有人会允许别人来改动他们自己的数据。为了做好权限认证，确保只有用户自己可以修改个人数据，在更新用户信息的时候，必须在 HTTP 头部加入一个 `X-LC-Session` 项来请求更新，这个 session token 在注册和登录时会返回。

为了改动一个用户已经有的数据，需要对这个用户的 URL 发送一个 PUT 请求。任何你没有指定的 key 都会保持不动，所以你可以只改动用户数据中的一部分。username 和 password 也是可以改动的，但是新的 username 不能和既有数据重复。

比如，如果我们想对 「hjiang」 的手机号码做出一些改动:

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  -H "Content-Type: application/json" \
  -d '{"phone":"18600001234"}' \
  https://{{host}}/1.1/users/55a47496e4b05001a7732c5f
```

返回的 body 是一个 JSON 对象，只有一个 `updatedAt` 字段表明更新发生的时间.

```json
{
  "updatedAt": "2015-07-14T02:35:50.100Z"
}
```

### 安全地修改用户密码

修改密码，可以直接使用上面的`PUT /1.1/users/:objectId`的 API，但是很多开发者会希望让用户输入一次旧密码做一次认证，旧密码正确才可以修改为新密码，因此我们提供了一个单独的 API `PUT /1.1/users/:objectId/updatePassword` 来安全地更新密码：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  -H "Content-Type: application/json" \
  -d '{"old_password":"the_old_password", "new_password":"the_new_password"}' \
  https://{{host}}/1.1/users/55a47496e4b05001a7732c5f/updatePassword
```

* **old_password**：用户的老密码
* **new_password**：用户的新密码

注意：仍然需要传入 X-LC-Session，也就是登录用户才可以修改自己的密码。


### 查询

**请注意，新创建应用的 `_User` 表的查询权限默认是关闭的，你可以通过 class 权限设置打开，请参考 [数据与安全 - Class 级别的权限](data_security.html#Class_级别的_ACL)。**

你可以一次获取多个用户，只要向用户的根 URL 发送一个 GET 请求。没有任何 URL 参数的话，可以简单地列出所有用户：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/users
```

返回的值是一个 JSON 对象包括一个 `results` 字段，值是包含了所有对象的一个 JSON 数组。

```json
{
  "results":[
    {
      "updatedAt":"2015-07-14T02:31:50.100Z",
      "phone":"18612340000",
      "objectId":"55a47496e4b05001a7732c5f",
      "username":"hjiang",
      "createdAt":"2015-07-14T02:31:50.100Z",
      "emailVerified":false,
      "mobilePhoneVerified":false
    }
  ]
}
```

所有的对普通对象的查询选项都适用于对用户对象的查询，所以可以查看 [查询](#查询) 部分来获取详细信息。

### 删除用户

为了在 LeanCloud 上删除一个用户，可以向它的 URL 上发送一个 DELETE 请求。同样的，你必须提供一个 X-LC-Session 在 HTTP 头上以便认证。例如：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  https://{{host}}/1.1/users/55a47496e4b05001a7732c5f
```

### 连接用户账户和第三方平台

LeanCloud 允许你连接你的用户到其他服务，比如新浪微博和腾讯微博，这样就允许你的用户直接用他们现有的账号 id 来注册或登录你的应用。在进行注册和登录时，需要附带上 `authData` 字段来提供你希望连接的服务的授权信息。一旦关联了某个服务，`authData` 将被存储到你的用户信息里。如需重新获取该内容，请参考 [获取 authData](#获取_authData)。

`authData` 是一个普通的 JSON 对象，它所要求的 key 根据 service 不同而不同，具体要求见下面。每种情况下，你都需要自己负责完成整个授权过程(一般是通过 OAuth 协议，1.0 或者 2.0) 来获取授权信息，提供给连接 API。

[新浪微博](http://weibo.com/) 的 authData 内容：

```json
{
  "authData": {
    "weibo": {
      "uid": "123456789",
      "access_token": "2.00vs3XtCI5FevCff4981adb5jj1lXE",
      "expiration_in": "36000"
    }
  }
}
```

[腾讯微博](http://t.qq.com/) 的 authData 内容：

```json
{
  "authData": {
    "qq": {
      "openid": "0395BA18A5CD6255E5BA185E7BEBA242",
      "access_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
      "expires_in": 1382686496
    }
  }
}
```

[微信](http://open.weixin.qq.com/) 的 authData 内容：

```json
{
  "authData": {
    "weixin": {
      "openid": "0395BA18A5CD6255E5BA185E7BEBA242",
      "access_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
      "expires_in": 1382686496
    }
  }
}
```

匿名用户(Anonymous user)的 authData 内容：

```json
{
  "anonymous": {
    "id": "random UUID with lowercase hexadecimal digits"
  }
}
```

其他任意第三方平台（其他第三方将不支持校验 access token 选项）：

```json
  {
     "第三方平台名称，例如facebook":
     {
       "uid": "在第三方平台上的唯一用户id字符串",
       "access_token": "在第三方平台的 access token",
        ……其他可选属性
     }
  }
```
同时，请在控制台的 `_User` 表里为 `authData.第三方平台名称.uid` 建立唯一索引，并且勾选上 **允许缺失值** 选项，这样才能保证一个第三方账号只绑定到一个 LeanCloud 应用内用户上。

{{ 
  docs.note(
    data.limitationsOnCreatingClassIndex()
  ) 
}}

{{ include.retrieveAuthData(node, "#### 获取 authData") }}

#### 注册和登录

使用一个连接服务来注册用户并登录，同样使用 POST 请求 users，只是需要提供 `authData` 字段。例如，使用新浪微博账户注册或者登录用户：


```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
     "authData": {
       "qq": {
         "openid": "0395BA18A5CD6255E5BA185E7BEBA242",
         "access_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
         "expires_in": 1382686496
         }
    }
    }' \
  https://{{host}}/1.1/users
```

LeanCloud 会校验提供的 `authData` 是否有效，并检查是否已经有一个用户连接了这个 `authData` 服务。如果已经有用户存在并连接了同一个 `authData`，那么返回 200 OK 和详细信息（包括用户的 `sessionToken`）：

```sh
Status: 200 OK
Location: https://{{host}}/1.1/users/75a4800fe4b05001a7745c41
```

应答的 body 类似：

```json
{
  "username": "LeanCloud",
  "createdAt": "2015-06-28T23:49:36.353Z",
  "updatedAt": "2015-06-28T23:49:36.353Z",
  "objectId": "75a4800fe4b05001a7745c41",
  "sessionToken": "anythingstringforsessiontoken",
  "authData": {
    "qq": {
      "openid": "0395BA18A5CD6255E5BA185E7BEBA242",
      "access_token": "12345678-SaMpLeTuo3m2avZxh5cjJmIrAfx4ZYyamdofM7IjU",
      "expires_in": 1382686496
    }
  }
}
```

如果用户还没有连接到这个账号，则你会收到 201 Created 的应答状态码，标识新的用户已经被创建：

```sh
Status: 201 Created
Location: https://{{host}}/1.1/users/55a4800fe4b05001a7745c41
```

应答内容包括 objectId、createdAt、sessionToken 以及一个自动生成的随机 username，例如：

```json
{
  "username":"ec9m07bo32cko6soqtvn6bko5",
  "sessionToken":"tfrvbzmdf609nu9204v5f0tuj",
  "createdAt":"2015-07-14T03:20:47.733Z",
  "objectId":"55a4800fe4b05001a7745c41"
}
```
#### UnionID 注册和登录

微信与新浪微博都有 UnionID 登录机制，使用 UnionID 注册登录，可以使得不同微信公众号或小程序之间共享用户。

微信的 authData 内容：

```json
  "authData": {
    "access_token" : "access_token",
    "expires_in" : 7200,
    "openid" : "openid",
    "refresh_token" : "refresh_token",
    "scope" : "snsapi_userinfo",
    "unionid" : "ox7NLs-e-32ZyHg2URi_F2iPEI2U"
}
```

使用 UnionID 注册登录，需要提供带有 `unionid` 参数的 `authData`。另外需要配合传递 `main_account` 和 `platform` 这两个字段。

* `main_account`： `main_account` 为 true 表示使用 `unionid` 来登录或者注册。
* `platform`：用来识别注册平台，如新浪微博或微信等。

在服务端进行存储的时候会根据 `platform` 来命名新增的平台，如传入 `"platform" = "weibo"` 时，返回数据中会增加 `_weibo_unionid` 字段存储 `{"uid":"xxxxx"}`。

```
"_weibo_unionid": {
            "uid": "ox7NLs-e-32ZyHg2URi_F2iPEI2U"
        }
```

完整的第三方注册登录请求如下，以使用微信 UnionId 为例：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \ 
  -H "Content-Type: application/json" \
  -d '{
     "authData": {
       "weixin1": {
         "openid": "oTY851cqL0gk3DqW3xINqG1Q4PTc",
         "access_token": "12_b6mz7ujXbTY4vpbqCRaKVa_y0Ij3N9grCeVtM8VJT8KFd4qnQ9lXtBsZVxG6x9c9Nay_oNgvbKK7KYKbn8R2P7uEgA0EhsXMHmxkx-xU-Tk",
         "expires_in": 7200,
         "refresh_token": "12_71UYUnqHDuIfekimsJsYjBDfY67ilo30fDqrYkqlwZtxNgcBhMmQgDVhT6mJWkRg0mngvX9kXeCGP8kmBWdvUtc5ngRiN5LDTWAau4du838",
          "scope": "snsapi_userinfo",
          "unionid": "ox7NLs-e-32ZyHg2URi_F2iPEI2U",
          "platform": "weixin",
          "main_account":"true"
         }
    }
    }' \
   https://{{host}}/1.1/users
  
```
应答内容包括 objectId、createdAt、sessionToken、authData 以及一个自动生成的随机 username，应答的 body 类似：

```json
{
    "sessionToken": "v53f0q4oecbrjojn530w89s5f", 
    "updatedAt": "2018-08-16T08:03:44.203Z", 
    "objectId": "5b752fe0a22b9d003137e16d", 
    "username": "vp7szn9ytuaylgtnw14qnjx2u", 
    "createdAt": "2018-08-16T08:03:44.203Z", 
    "emailVerified": false, 
    "authData": {
        "weixin1": {
            "openid": "oTY851cqL0gk3DqW3xINqG1Q4PTc", 
            "access_token": "12_b6mz7ujXbTY4vpbqCRaKVa_y0Ij3N9grCeVtM8VJT8KFd4qnQ9lXtBsZVxG6x9c9Nay_oNgvbKK7KYKbn8R2P7uEgA0EhsXMHmxkx-xU-Tk", 
            "expires_in": 7200, 
            "refresh_token": "12_71UYUnqHDuIfekimsJsYjBDfY67ilo30fDqrYkqlwZtxNgcBhMmQgDVhT6mJWkRg0mngvX9kXeCGP8kmBWdvUtc5ngRiN5LDTWAau4du838", 
            "scope": "snsapi_userinfo", 
            "unionid": "ox7NLs-e-32ZyHg2URi_F2iPEI2U", 
            "platform": "weixin", 
            "main_account": "true"
        }, 
        "_weixin_unionid": {
            "uid": "ox7NLs-e-32ZyHg2URi_F2iPEI2U"
        }
    }, 
    "mobilePhoneVerified": false
}
```

#### 连接

连接一个现有的用户到新浪微博或者微信，可以向 user endpoint 发送一个附带 `authData` 字段的 PUT 请求来实现。例如，连接一个用户到微信账号发起的请求类似这样：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  -H "Content-Type: application/json" \
  -d '{
        "authData": {
          "weixin": {
            "uid": "123456789",
            "access_token": "2.00vs3XtCI5FevCff4981adb5jj1lXE",
            "expiration_in": "36000"
            ...
          }
        }
      }' \
  https://{{host}}/1.1/users/55a47496e4b05001a7732c5f
```

完成连接后，你可以使用匹配的 `authData` 来认证他们。

#### 断开连接

断开一个现有用户到某个服务，可以通过删除 `authData` 中对应的平台来做到。
例如，已经绑定过微信的用户 `authData` 数据格式如下，平台名称为 `weixin`：

```json
{
  "username": "3td7p1nucap1i1p53m1zibwgx",
   "authData": {
    "weixin": {
      "openid": "oTY851cqL0gk3DqW3xINqG1Q4PTc",
      "scope": "snsapi_userinfo",
      "refresh_token": "refresh_token",
      "platform": "weixin",
      "unionid": "unionid,
      "access_token": "access_token",
      "expires_in": 7200
    }
  },
}
```

取消微信关联通过删除 `authData.weixin` 来实现:

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: 6fehqhr2t2na5mv1aq2om7jgz" \
  -H "Content-Type: application/json" \
  -d '{"authData.weixin":{"__op":"Delete"}}' \
  https://{{host}}/1.1/users/5b7e53a767f356005fb374f6
```

其返回值类似于：

```json
{
  "updatedAt":"2018-08-23T06:32:47.633Z",
  "objectId":"5b7e53a767f356005fb374f6"
}
```

### 安全

当你用 REST API key 来访问 LeanCloud 时，访问可能被 ACL 所限制，就像 iOS 和 Android SDK 上所做的一样。你仍然可以通过 REST API 来读和修改，只需要通过 `ACL` 的 key 来访问一个对象。

ACL 按 JSON 对象格式来表示，JSON 对象的 key 是 objectId 或者一个特别的 key（`*`，表示公共访问权限）。ACL 的值是权限对象，这个 JSON 对象的 key 即是权限名，而这些 key 的值总是 true。

举个例子，如果你想让一个 id 为 55a47496e4b05001a7732c5f 的用户有读和写一个对象的权限，而且这个对象应该可以被公共读取，符合的 ACL 应该是:

```json
{
  "55a47496e4b05001a7732c5f": {
    "read": true,
    "write": true
  },
  "*": {
    "read": true
  }
}
```

## 角色

当你的 app 的规模和用户基数成长时，你可能发现你需要比 ACL 模型(针对每个用户)更加粗粒度的访问控制你的数据的方法。为了适应这种需求，LeanCloud 支持一种基于角色的权限控制方式。角色系统提供一种逻辑方法让你通过权限的方式来访问你的数据，角色是一种有名称的对象，包含了用户和其他角色。任何授予一个角色的权限隐含着授予它包含着的其他的角色相应的权限。

例如，在你的 app 中管理着一些内容，你可能有一些类似于「主持人」的角色可以修改和删除其他用户创建的新的内容，你可能还有一些「管理员」有着与「主持人」相同的权限，但是还可以修改 app 的其他全局性设置。通过给予用户这些角色，你可以保证新的用户可以做主持人或者管理员，不需要手动地授予每个资源的权限给各个用户。

我们提供一个特殊的角色（Role）类来表示这些用户组，为了设置权限用。角色有一些和其他对象不太一样的特殊字段。

| 字段    | 说明                                       |
| ----- | ---------------------------------------- |
| name  | 角色的名字，这个值是必须的，而且只允许被设置一次，只要这个角色被创建了的话。角色的名字必须由字母、空格、减号或者下划线这些字符构成。这个名字可以用来标明角色而不需要它的 objectId。 |
| users | 一个指向一系列用户的关系，这些用户会继承角色的权限。               |
| roles | 一个指向一系列子角色的关系，这些子关系会继承父角色所有的权限。          |

通常来说，为了保持这些角色安全，你的移动 app 不应该为角色的创建和管理负责。作为替代，角色应该是通过一个不同的网页上的界面来管理，或者手工被管理员所管理。我们的 REST API 允许你不需要一个移动设备就能管理你的角色。

### 创建角色

创建一个新的角色与其他的对象不同的是 name 字段是必须的。角色必须指定一个 ACL，这个 ACL 必须尽量的约束严格一些，这样可以防止错误的用户修改角色。

创建一个新角色，发送一个 POST 请求到 roles 根路径：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Manager",
        "ACL": {
          "*": {
            "read": true
          }
        }
      }' \
  https://{{host}}/1.1/roles
```

其返回值类似于：

```json
{
  "createdAt":"2015-07-14T03:34:41.074Z",
  "objectId":"55a48351e4b05001a774a89f"
}
```

你可以通过加入已有的对象到 roles 和 users 关系中来创建一个有子角色和用户的角色:

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "CLevel",
        "ACL": {
          "*": {
            "read": true
          }
        },
        "roles": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "55a48351e4b05001a774a89f"
            }
          ]
        },
        "users": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "55a47496e4b05001a7732c5f"
            }
          ]
        }
      }' \
  https://{{host}}/1.1/roles
```

当创建成功时，HTTP 返回是 **201 Created** 而 Location header 包含了新的对象的 URL：

```sh
Status: 201 Created
Location: https://{{host}}/1.1/roles/55a483f0e4b05001a774b837
```

### 获取角色

你可以同样通过发送一个 GET 请求到 Location header 中返回的 URL 来获取这个对象，比如我们想要获取上面创建的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/roles/55a483f0e4b05001a774b837
```

响应的 body 是一个 JSON 对象包含角色的所有字段：

```json
{
  "name":"CLevel",
  "createdAt":"2015-07-14T03:37:20.992Z",
  "updatedAt":"2015-07-14T03:37:20.994Z",
  "objectId":"55a483f0e4b05001a774b837",
  "users":{
    "__type":"Relation",
    "className":"_User"
  },
  "roles":{
    "__type":"Relation",
    "className":"_Role"
  }
}
```

注意 users 和 roles 关系无法在 JSON 中见到，你需要相应地用 `$relatedTo` 操作符来查询角色中的子角色和用户。

### 更新角色

更新一个角色通常可以像更新其他对象一样使用，但是 name 字段是不可以更改的。加入和删除 users 和 roles 可以通过使用`AddRelation` 和 `RemoveRelation`操作来进行。

举例来说，我们对 Manager 角色加入 1 个用户：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "users": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_User",
              "objectId": "55a4800fe4b05001a7745c41"
            }
          ]
        }
      }' \
  https://{{host}}/1.1/roles/55a48351e4b05001a774a89f
```

相似的，我们可以删除一个 Manager 的子角色：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "roles": {
          "__op": "RemoveRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "55a483f0e4b05001a774b837"
            }
          ]
        }
      }' \
  https://{{host}}/1.1/roles/55a48351e4b05001a774a89f
```


### 删除对象

为了从 LeanCloud 上删除一个角色，只需要发送 DELETE 请求到它的 URL 就可以了。

我们需要传入 X-LC-Session 来通过一个有权限的用户账号来访问这个角色对象，例如：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: qmdj8pdidnmyzp0c7yqil91oc" \
  https://{{host}}/1.1/roles/55a483f0e4b05001a774b837
```

### 安全性

当你通过 REST API key 访问 LeanCloud 的时候，访问同样可能被 ACL 所限制，就像 iOS 和 Android SDK 上一样。你仍然可以通过 REST API 来读和修改 ACL，只用通过访问「ACL」键就可以了。

除了用户级的权限设置以外，你可以通过设置角色级的权限来限制对 LeanCloud 对象的访问。取代了指定一个 objectId 带一个权限的方式，你可以设定一个角色的权限为它的名字在前面加上 `role:` 前缀作为 key。你可以同时使用用户级的权限和角色级的权限来提供精细的用户访问控制。

比如，为了限制一个对象可以被在 Staff 里的任何人读到，而且可以被它的创建者和任何有 Manager 角色的人所修改，你应该向下面这样设置 ACL：

```json
{
  "55a4800fe4b05001a7745c41": {
    "write": true
  },
  "role:Staff": {
    "read": true
  },
  "role:Manager": {
    "write": true
  }
}
```

你不必为创建的用户和 Manager 指定读的权限，如果这个用户和 Manager 本身就是 Staff 的子角色和用户，因为它们都会继承授予 Staff 的权限。

### 角色继承

就像上面所说的一样，一个角色可以包含另一个，可以为 2 个角色建立一个「父子」关系。这个关系的结果就是任何被授予父角色的权限隐含地被授予子角色。

这样的关系类型通常在用户管理的内容类的 app 上比较常见，比如论坛。有一些少数的用户是「管理员」，有最高级的权限来调整程序的设置、创建新的论坛、设定全局的消息等等。

另一类用户是「版主」，他们有责任保证用户生成的内容是合适的。任何有管理员权限的人都应该有版主的权利。为了建立这个关系，你应该把「Administartors」的角色设置为「Moderators」 的子角色，具体来说就是把 Administrators 这个角色加入 Moderators 对象的 roles 关系之中：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "roles": {
          "__op": "AddRelation",
          "objects": [
            {
              "__type": "Pointer",
              "className": "_Role",
              "objectId": "<AdministratorsRoleObjectId>"
            }
          ]
        }
      }' \
  https://{{host}}/1.1/roles/<ModeratorsRoleObjectId>
```

## 文件

对于文件上传，我们推荐使用各个客户端的 SDK 进行操作，或者使用[命令行工具](./leanengine_cli.html)。

**通过 REST API 上传文件受到三个限制**：

* 上传最大文件大小有 10 M 的限制
* 每个应用每秒最多上传 1 个文件
* 每个应用每分钟最多上传 30 个文件

**而使用 SDK 或者命令行上传没有这些限制**。

### 上传文件

{{ docs.alert("北美和华东节点不支持通过 REST API 上传文件，请使用 SDK 提供的文件相关接口上传文件。") }}

上传文件到  LeanCloud  通过 POST 请求，注意必须指定文件的 content-type，例如上传一个文本文件 hello.txt 包含一行字符串：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: text/plain" \
  -d 'Hello, World!' \
  https://{{host}}/1.1/files/hello.txt
```

文件上传成功后，返回 **201 Created** 的应答和创建的文件对象（可以在 _File 表看到）：

```json
{  "size":13,
   "bucket":"1qdney6b",
   "url":"http://ac-1qdney6b.qiniudn.com/3zLG4o0d27MsCQ0qHGRg4JUKbaXU2fiE35HdhC8j.txt",
   "name":"hello.txt",
   "createdAt":"2014-10-14T05:55:57.455Z",
   "objectId":"543cbaede4b07db196f50f3c"
}
```

其中 `url` 就是文件下载链接，`objectId` 是文件的对象 id，`name` 就是上传的文件名称。

也可以尝试上传一张图片，假设当前目录有一个文件 test.png：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: image/png" \
  --data-binary '@test.png'  \
  https://{{host}}/1.1/files/test.png
```

### 关联文件到对象

一个文件上传后，你可以关联该文件到某个 AVObject 对象上：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
   -H "Content-Type: application/json" \
  -d '{
        "name": "hjiang",
        "picture": {
          "id": "543cbaede4b07db196f50f3c",
          "__type": "File"
        }
      }' \
  https://{{host}}/1.1/classes/Staff
```

其中 `id` 就是文件对象的 objectId。


### 删除文件

知道文件对象 ObjectId 的情况下，可以通过 DELETE 删除文件：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/files/543cbaede4b07db196f50f3c
```

## Push 通知

请查看我们的 [消息推送开发指南 &middot; 使用 REST API 推送消息](./push_guide.html#使用_REST_API_推送消息)。

## 安装数据

### 上传安装数据

一个安装对象表示了一个你的在手机上被安装的 app，这些对象被用来保存订阅数据的，这些数据是一个或多个通知通道订阅的。安装数据除了一些特殊字段以外都可以是模式可变的。这些字段都有特殊的类型和验证需求。

| 字段             | 描述                                       |
| -------------- | ---------------------------------------- |
| badge          | 数字，表示最新的 iOS 的安装已知的 application badge。   |
| channels       | 数组，可选，表示这个安装对象的订阅频道列表设备订阅的频道。**每个 channel 名称只能包含 26 个英文字母和数字。** |
| deviceToken    | 由 Apple 生成的字符串标志，在 deviceType 为 iOS 上的设备是必须的，而且自对象生成开始就不能改动，对于一个 app 来说也是不可重复的。 |
| deviceType     | 必须被设置为 "ios"、"android"、"wp"、"web"中的一种，而且自这个对象生成以后就不能变化。 |
| installationId | 由 LeanCloud 生成的字符串标志，而且如果 deviceType 是 android 的话是一个必选字段，如果是 iOS 的话则可选。它只要对象被生成了就不能发生改变，而且对一个 app 来说是不可重复的。 |
| timeZone       | 字符串，表示安装的这个设备的系统时区。                      |

大部分时间，安装数据是被客户端中有关 push 的方法所修改的。举个例子，从客户端 SDK 中调用  `subscribeToChannel` 或者 `unsubscribeFromChannel`，如果现在还没有安装对象的或者没有更新安装对象的话会创建一个对象，而从客户端 SDK 中调用 `getSubscribedChanneles` 会从安装对象中读取订阅数据。

REST 的方法可以被用来模仿这些操作。比如，如果你有一个 iOS 的 device token 你可以注册它来向设备推送通知，只需要创建一个有需要的 channels 的安装对象就可以了。你同样可以做一些不能通过客户端 SDK 进行的操作，就比如说查询所有的安装来找到一个 channel 的订阅者的集合。

创建一个安装对象和普通的对象差不多，但是特殊的几个安装字段必须通过认证。举个例子，如果你有一个由 Apple Push Notification 提供的 device token，而且想订阅一个广播频道，你可以如下发送请求：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "ios",
        "deviceToken": "abcdefghijklmnopqrstuvwzxyrandomuuidforyourdevice012345678988",
        "channels": [
          ""
        ]
      }' \
  https://{{host}}/1.1/installations
```

当创建成功后，HTTP的返回值为 **201 Created**，Location header 包括了新的安装的 URL：

```sh
Status: 201 Created
Location: https://{{host}}/1.1/installations/51ff1808e4b074ac5c34d7fd
```

返回的 body 是一个 JSON 对象，包括了 objectId 和 createdAt 这个创建对象的时间戳。

```json
{
  "createdAt": "2012-04-28T17:41:09.106Z",
  "objectId": "51ff1808e4b074ac5c34d7fd"
}
```

### 获取安装对象

你可以通过 GET 方法请求创建的时候 Location 表示的 URL 来获取 Installation 对象。比如，获取上面的被创建的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/installations/51ff1808e4b074ac5c34d7fd
```

返回的 JSON 对象所有用户提供的字段，加上 createdAt、updatedAt 和 objectId 字段：

```json
{
  "deviceType": "ios",
  "deviceToken": "abcdefghijklmnopqrstuvwzxyrandomuuidforyourdevice012345678988",
  "channels": [
    ""
  ],
  "createdAt": "2012-04-28T17:41:09.106Z",
  "updatedAt": "2012-04-28T17:41:09.106Z",
  "objectId": "51ff1808e4b074ac5c34d7fd"
}
```

### 更新安装对象

安装对象可以向相应的 URL 发送 PUT 请求来更新。例如，为了让设备订阅一个名字为「foo」的推送频道：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "deviceType": "ios",
        "deviceToken": "abcdefghijklmnopqrstuvwzxyrandomuuidforyourdevice012345678988",
        "channels": [
          "",
          "foo"
        ]
      }' \
  https://{{host}}/1.1/installations/51ff1808e4b074ac5c34d7fd
```

### 查询安装对象

你可以一次通过 GET 请求到 installations 的根 URL 来获取多个安装对象。这项功能在 SDK 中不可用。

没有任何 URL 参数的话，一个 GET 请求会列出所有安装：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/installations
```

返回的 JSON 对象的 results 字段包含了所有的结果：

```json
{
  "results": [
    {
      "deviceType": "ios",
      "deviceToken": "abcdefghijklmnopqrstuvwzxyrandomuuidforyourdevice012345678988",
      "channels": [
        ""
      ],
      "createdAt": "2012-04-28T17:41:09.106Z",
      "updatedAt": "2012-04-28T17:41:09.106Z",
      "objectId": "51ff1808e4b074ac5c34d7fd"
    },
    {
      "deviceType": "ios",
      "deviceToken": "876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9",
      "channels": [
        ""
      ],
      "createdAt": "2012-04-30T01:52:57.975Z",
      "updatedAt": "2012-04-30T01:52:57.975Z",
      "objectId": "51fcb74ee4b074ac5c34cf85"
    }
  ]
}
```

所有对普通的对象的查询都对 installatin 对象起作用，所以可以查看之前的查询部分以获取详细信息。通过做 channels 的数组查询，你可以查找一个订阅了给定的推送频道的所有设备.

### 删除安装对象

为了从 AVOSCloud 中删除一个安装对象，可以发送 DELETE 请求到相应的 URL。这个功能在客户端 SDK 也不可用。举例：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.1/installations/51fcb74ee4b074ac5c34cf85
```

## 数据 Schema

为了方便开发者使用、自行研发一些代码生成工具或者内部使用的管理平台。我们提供了获取数据 Class Schema 的开放 API，基于安全考虑，强制要求使用 Master Key 才可以访问。

查询一个应用下面所有 Class 的 Schema:

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   https://{{host}}/1.1/schemas
```

返回的 JSON 数据包含了每个 Class 对应的 Schema:

```json
{
  "_User":{
    "username"     : {"type":"String"},
    "password"     : {"type":"String"},
    "objectId"     : {"type":"String"},
    "emailVerified": {"type":"Boolean"},
    "email"        : {"type":"String"},
    "createdAt"    : {"type":"Date"},
    "updatedAt"    : {"type":"Date"},
    "authData"     : {"type":"Object"}
  }
  ……其他 class……
}
```

也可以单独获取某个 Class 的 Schema:

```sh
curl -X GET \
   -H "X-LC-Id: {{appid}}" \
   -H "X-LC-Key: {{masterkey}},master" \
   https://{{host}}/1.1/schemas/_User
```

## 云函数

请查看我们的 [云引擎 REST API 使用指南](leanengine-rest-api.html)。

## 地理查询

假如在发布微博的时候，我们也支持用户加上当时的位置信息（新增一个 `location` 字段），如果想看看指定的地点附近发生的事情，可以通过 GeoPoint 数据类型加上在查询中使用 `$nearSphere` 做到。获取离当前用户最近的 10 条微博应该看起来像下面这个样子:

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'limit=10' \
  --data-urlencode 'where={
        "location": {
          "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 39.9,
            "longitude": 116.4
          }
        }
      }' \
  https://{{host}}/1.1/classes/Post
```

这会按照距离纬度 39.9、经度 116.4（当前用户所在位置）的远近排序返回一系列结果，第一个就是最近的对象。(注意：**如果指定了 order 参数的话，它会覆盖按距离排序。**）

为了限定搜索的最大距离，需要加入 `$maxDistanceInMiles` 和 `$maxDistanceInKilometers`或者 `$maxDistanceInRadians` 参数来限定。比如要找的半径在 10 英里内的话：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={
        "location": {
          "$nearSphere": {
            "__type": "GeoPoint",
            "latitude": 39.9,
            "longitude": 116.4
          },
          "$maxDistanceInMiles": 10.0
        }
      }' \
  https://{{host}}/1.1/classes/Post
```

同样做查询寻找在一个特定的范围里面的对象也是可以的，为了找到在一个矩形的区域里的对象，按下面的格式加入一个约束 `{"$within": {"$box": [southwestGeoPoint, northeastGeoPoint]}}`。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'where={
        "location": {
          "$within": {
            "$box": [
              {
                "__type": "GeoPoint",
                "latitude": 39.97,
                "longitude": 116.33
              },
              {
                "__type": "GeoPoint",
                "latitude": 39.99,
                "longitude": 116.37
              }
            ]
          }
        }
      }' \
  https://{{host}}/1.1/classes/Post
```

### 警告

这是有一些问题是值得留心的:

1. 每一个 AVObject 类只能包含一个 AVGeoPoint 对象的键值。
2. Points 不应该等于或者超出它的界. 纬度不应该是 -90.0 或者 90.0，经度不应该是 -180.0 或者 180.0。试图在 GeoPoint 上使用超出范围内的经度和纬度会导致问题.

{% if node != 'qcloud' %}
## 用户反馈组件 API

提交一条新的用户反馈：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
         "status"  : "open",
         "content" : "反馈的文字内容",
         "contact" : "联系方式、QQ 或者邮箱手机等"
       }' \
  https://{{host}}/1.1/feedback
```

提交后的用户反馈在可以在 [控制台 >（选择应用）> 组件 > 用户反馈](/dashboard/devcomponent.html?appid={{appid}}#/component/feedback) 里看到。

获取所有的反馈：

```
curl -X GET \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}" \
-H "Content-Type: application/json" \
https://{{host}}/1.1/feedback
```

获取一条反馈里面的信息：

```
curl -X GET \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}" \
-H "Content-Type: application/json" \
https://{{host}}/1.1/feedback/<:feedback_objectId>/threads
```

将 `<:feedback_objectId>` 替换为 feedback 的 objectId（可以从上述的「获取所有的反馈」这个查询中得到 objectId）。 

客服为一条已经存在的反馈增加一条回复：

```
curl -X POST \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}"\
 -H "Content-Type: application/json" \
-d '{"type":"dev","content":"感谢您的反馈！我们正在修复您所述的问题，修复后再通知您。", "attachment":"{{url}}"}' \ 
https://{{host}}/1.1/feedback/<:feedback_objectId>/threads
```

用户为一条已经存在的反馈增加一条回复：

```
curl -X POST \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}"\
 -H "Content-Type: application/json" \
-d '{"type":"user","content":"我刚才又试了下，现在没问题了！耶~", "attachment":"{{url}}"}' \ 
https://{{host}}/1.1/feedback/<:feedback_objectId>/threads
```

{% endif %}

{% if node!='qcloud' %}
## 短信验证 API

请参考 [短信服务 REST API 详解](rest_sms_api.html)。
{% endif %}

## 即时通讯 API

请参考 [即时通讯 REST API](./realtime_rest_api_v2.html)。

{% if node != 'qcloud' %}
## 事件流 API

请参考 [事件流 REST API](./status_system.html#REST_API)。
{% endif %}
## 应用内搜索 API

请参考 [搜索 API](./app_search_guide.html#搜索_api)。

## 数据导出 API

你可以通过请求 `/exportData` 来导出应用数据：

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://{{host}}/1.1/exportData
```

`exportData` 要求使用 master key 来授权。

你还可以指定导出数据的起始时间：

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"from_date":"2015-09-20", "to_date":"2015-09-25"}' \
  https://{{host}}/1.1/exportData
```

还可以指定具体的 class 列表，使用逗号隔开：

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"classes":"_User,GameScore,Post"}' \
  https://{{host}}/1.1/exportData
```


增加 `only-schema` 选项就可以只导出 schema:

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"only-schema":"true"}' \
  https://{{host}}/1.1/exportData
```

导出的 Schema 文件同样可以使用数据导入功能来导入到其他应用。

默认导出的结果将发送到应用的创建者邮箱，你也可以指定接收邮箱：

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"email":"username@exmaple.com"}' \
  https://{{host}}/1.1/exportData
```

调用结果将返回本次任务的 id 和状态：

```json
{
  "status":"running",
  "id":"1wugzx81LvS5R4RHsuaeMPKlJqFMFyLwYDNcx6LvCc6MEzQ2",
  "app_id":"{{appid}}"
}
```

除了被动等待邮件之外，你还可以主动使用 id 去查询导出任务状态：

```
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/exportData/1wugzx81LvS5R4RHsuaeMPKlJqFMFyLwYDNcx6LvCc6MEzQ2
```

如果导出完成，将返回导出结果的下载链接：

```json
{
  "status":"done",
  "download_url": "https://download.leancloud.cn/export/example.tar.gz",
  "id":"1wugzx81LvS5R4RHsuaeMPKlJqFMFyLwYDNcx6LvCc6MEzQ2",
  "app_id":"{{appid}}"
}
```

如果任务还没有完成， `status` 仍然将为 `running` 状态，**请间隔一段时间后再尝试查询。**


## 其他 API

### 服务器时间

获取服务端当前日期时间可以通过 `/date` API:

```
curl -i -X GET \
    -H "X-LC-Id: {{appid}}" \
    -H "X-LC-Key: {{appkey}}" \
    https://{{host}}/1.1/date
```

返回 UTC 日期:

```json
{
  "iso": "2015-08-27T07:38:33.643Z",
  "__type": "Date"
}
```

{% if node!='qcloud' %}
## 离线数据分析 API

{{docs.alert("该项功能仅向**商业版**和**企业版**应用开放。因此，开发版应用如果调用该 API 会收到错误响应。") }}

### 创建分析 job API

离线数据分析 API 可以获取一个应用的备份数据。因为应用数据的隐私敏感性，离线数据分析 API 必须使用 master key 的签名方式鉴权，请参考 [更安全的鉴权方式](#更安全的鉴权方式) 一节。

创建分析 job。（注意：下面示例直接使用带 `master` 标识的 `X-LC-Key`，不过我们推荐你在实际使用中采用 [新鉴权方式](rest_api.html#更安全的鉴权方式) 加密，不要明文传递 Key。）

```
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"jobConfig":{"sql":"select count(*) from table"}}' \
  https://{{host}}/1.1/bigquery/jobs
```

需要特别说明的是，`jobConfig` 不仅可以提供查询分析 `sql`，还可以增加其他配置项：

* 查询结果自动另存为：

```json
{
  "jobConfig":{
    "sql":"select count(*) as count from table",
    "saveAs":{
      "className":"Table1",
      "limit":100
    }
  }
}
```

* 设置依赖 job，也就是当前的查询可以使用前趋查询结果：

```
{
  "jobConfig":{
    "sql":"select * from table inner join tempTable on table.id=tempTable.objectId",
    "dependencyJobs":[
      {
        "id":"xxx",
        "className":"tempTable"
      } // id 为依赖 job 的 jobId,  className 则为自定义的临时表名
    ]
  }
}
```

对应的输出：

```
HTTP/1.1 200 OK
Server Tengine is not blacklisted
Server: Tengine
Date: Fri, 05 Jun 2015 02:45:22 GMT
Content-Type: application/json; charset=UTF-8
Content-Length: 100
Connection: keep-alive
Strict-Transport-Security: max-age=31536000
{"id":"63f3b70b8ac3fd779de5bcb765cf121e","appId":"{{appid}}"}
```

### 获取分析 job 结果 API

```
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/bigquery/jobs/:jobId
```

对应的输出：

```
HTTP/1.1 200 OK
Server Tengine is not blacklisted
Server: Tengine
Date: Fri, 05 Jun 2015 03:03:51 GMT
Content-Type: application/json; charset=UTF-8
Content-Length: 127
Connection: keep-alive
Strict-Transport-Security: max-age=31536000
{"id":"63f3b70b8ac3fd779de5bcb765cf121e","status":"OK","results":[{"_c0":6895}],"totalCount":1,"previewCount":1,"nextAnchor":1}
```
{% endif %}

## 浏览器跨域和特殊方法解决方案

注：直接使用 RESTful API 遇到跨域问题，请遵守 HTML5 CORS 标准即可。以下方法非推荐方式，而是内部兼容方法。

对于跨域操作，我们定义了如下的 text/plain 数据格式来支持用 POST 的方法实现 GET、PUT、DELETE 的操作。

### GET

```
  curl -i -X POST \
  -H "Content-Type: text/plain" \
  -d \
  '{"_method":"GET",
    "_ApplicationId":"{{appid}}",
    "_ApplicationKey":"{{appkey}}"}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

对应的输出：

```
HTTP/1.1 200 OK
Server: nginx
Date: Thu, 04 Dec 2014 06:34:34 GMT
Content-Type: application/json;charset=utf-8
Content-Length: 174
Connection: keep-alive
Last-Modified: Thu, 04 Dec 2014 06:34:08.498 GMT
Cache-Control: no-cache,no-store
Pragma: no-cache
Strict-Transport-Security: max-age=31536000
{
  "content": "每个 Java 程序员必备的 8 个开发工具",
  "pubUser": "LeanCloud官方客服",
  "pubTimestamp": 1435541999,
  "createdAt": "2015-06-29T01:39:35.931Z",
  "updatedAt": "2015-06-29T01:39:35.931Z",
  "objectId": "558e20cbe4b060308e3eb36c"
}
```

### PUT

```
curl -i -X POST \
  -H "Content-Type: text/plain" \
  -d \
  '{"_method":"PUT",
    "_ApplicationId":"{{appid}}",
    "_ApplicationKey":"{{appkey}}",
    "upvotes":99}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

对应的输出：

```
HTTP/1.1 200 OK
Server: nginx
Date: Thu, 04 Dec 2014 06:40:38 GMT
Content-Type: application/json;charset=utf-8
Content-Length: 78
Connection: keep-alive
Cache-Control: no-cache,no-store
Pragma: no-cache
Strict-Transport-Security: max-age=31536000

{"updatedAt":"2015-07-13T06:40:38.310Z","objectId":"558e20cbe4b060308e3eb36c"}
```

### DELETE

```
curl -i -X POST \
  -H "Content-Type: text/plain" \
  -d \
  '{"_method":  "DELETE",
    "_ApplicationId":"{{appid}}",
    "_ApplicationKey":"{{appkey}}"}' \
  https://{{host}}/1.1/classes/Post/<objectId>
```

对应的输出是：

```
HTTP/1.1 200 OK
Server: nginx
Date: Thu, 04 Dec 2014 06:15:10 GMT
Content-Type: application/json;charset=utf-8
Content-Length: 2
Connection: keep-alive
Cache-Control: no-cache,no-store
Pragma: no-cache
Strict-Transport-Security: max-age=31536000

{}
```

总之，就是利用 POST 传递的参数，把 _method、_ApplicationId 以及 _ApplicationKey 传递给服务端，服务端会自动把这些请求翻译成指定的方法，这样可以使得 Unity3D 以及 JavaScript 等平台（或者语言）可以绕开浏览器跨域或者方法限制。
