{% import "views/_helper.njk" as docs %}
{% import "views/_sms.njk" as sms %}
# 短信服务 REST API 详解

[REST API](rest_api.html) 可以让任何支持发送 HTTP 请求的设备与 LeanCloud 进行交互。使用我们的短信服务 REST API 可以完成很多事情，比如：

* 给指定手机号码发送短信验证码
* 验证手机号和短信验证码是否匹配
* 使用手机号和验证码进行登录
* 通过合法的手机号和验证码来重置账户密码
* 进行重要操作（例如支付）的验证确认等

我们支持**国内短信**和**国际短信**，并为每个 LeanCloud 账户提供 100 条<u>国内</u>短信的免费额度进行测试，超过的部分将实时从账户余额中扣除，所以请务必保证账户余额充足。具体的价格请参看 [官网价格](/pricing)。

## 快速参考

所有 API 访问都需要使用 HTTPS 协议，在 `https://leancloud.cn` 域名下。相对路径前缀 `/1.1/` 代表使用版本号为 1.1 的 API。如需在线测试 API，请在浏览器中打开 <https://leancloud.cn/dashboard/apionline/index.html>。

我们的短信服务 REST API 包括：

### 短信验证 API

| URL                         | HTTP | 功能        |
| :-------------------------- | :--- | --------- |
| /1.1/requestSmsCode         | POST | 请求发送短信验证码 |
| /1.1/verifySmsCode/`<code>` | POST | 验证短信验证码   |

### 用户
| URL                                  | HTTP | 功能                |
| :----------------------------------- | :--- | ----------------- |
| /1.1/usersByMobilePhone              | POST | 使用手机号码注册或登录       |
| /1.1/requestMobilePhoneVerify        | POST | 请求发送用户手机号码验证短信    |
| /1.1/verifyMobilePhone/`<code>`      | POST | 使用「验证码」验证用户手机号码   |
| /1.1/requestChangePhoneNumber        | POST | 请求发送手机短信验证码以绑定或更新手机号 |
| /1.1/changePhoneNumber               | POST | 验证手机短信验证码并绑定或更新手机号 |
| /1.1/requestLoginSmsCode             | POST | 请求发送手机号码短信登录验证码   |
| /1.1/requestPasswordResetBySmsCode   | POST | 请求发送手机短信验证码重置用户密码 |
| /1.1/resetPasswordBySmsCode/`<code>` | PUT  | 验证手机短信验证码并重置密码    |

### 请求和响应格式

详情可参考 LeanCloud REST API 文档的 [请求格式](rest_api.html#请求格式) 和 [响应格式](rest_api.html#响应格式)。

通常情况下，如果返回的 HTTP 状态码为 200、结果为 `{}` 则代表请求成功完成。

### 验证码发送逻辑图

在短信验证码发送过程中，一共有三方参与：客户端、LeanCloud 和电信运营商（移动、联通、电信），发送、验证短信验证码的过程如下图所示：

```seq
客户端->LeanCloud: 1. 携手机号请求验证码
LeanCloud->运营商: 2. 向对应手机号发送验证码
运营商->客户端: 3. 通过短信或语音的方式将验证码传达给用户
客户端->LeanCloud: 4. 提交手机号和收到的验证码
```

1. 首先是应用客户端向 LeanCloud 请求向特定手机号码发送验证码；
2. LeanCloud 云端收到请求后，生成验证码，然后将完整短信内容发送到运营商通道；
3. 运营商下发短信（或语音）；
4. 应用客户端收到验证码短信后，再向 LeanCloud 验证手机号码和短信验证码的合法性。

## 自定义短信签名

在发送短信之前，需要有一个 [短信签名](rest_sms_api.html#短信签名是什么_必须的吗_)。在 [控制台 > 消息 > 短信 > 设置 > 短信签名](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 里创建，审核通过后就可以使用了。

没有使用自定义模板的短信，只能使用默认签名，即无法通过 [`requestSmsCode`](#短信验证_API-1) 接口来指定要使用的签名。

## 短信验证 API

在一些场景下，你可能希望用户在验证手机号码后才能进行一些操作，例如充值。这些操作跟账户系统没有关系，可以通过我们提供的的短信验证 API 来实现。

使用这些 API 需要在 [控制台 > 消息 > 短信 > 设置 > 短信选项](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 中开启 **启用通用的短信验证码服务（开放 `requestSmsCode` 和 `verifySmsCode` 接口）** 选项，并且有一个已审核通过的短信签名。

给某个手机号码发送验证短信：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx"}' \
  https://{{host}}/1.1/requestSmsCode
```

这里必须使用 POST 方式来发送请求，请求体里支持的参数有：

| 参数                |  约束  | 描述                             |
| :---------------- | :--: | :----------------------------- |
| mobilePhoneNumber |  必填  | 目标手机号码                         |
| ttl               |      | 验证码有效时间。单位分钟（默认为 **10 分钟**）    |
| name              |      | 应用名字（默认为 LeanCloud 控制台填写的应用名。） |
| op                |      | 操作类型                           |

如果成功，将返回：

```json
{}
```

假设有如下调用：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx","ttl":"5","name":"天东商城","op":"付款"}' \
  https://{{host}}/1.1/requestSmsCode
```

接收到的短信内容如下：

<samp class="bubble">您正在使用天东商城服务进行付款操作，您的验证码是：123456，请在5分钟内完成验证。</samp>

### 语音验证码

语音验证码，是通过电话直接呼叫用户的电话号码来播报验证码。它是一个 6 位的数字组合，语音只播报数字内容，不能添加其他任何内容。它可以作为一种备选方案，来解决因各种原因导致短信无法及时到达的问题。发送方式如下：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx", "smsType":"voice"}' \
  https://{{host}}/1.1/requestSmsCode
```

与上面的普通短信验证码相比，请求发送语音验证码的时候，要加上 `smsType` 这个请求参数，其值为 `voice`。

`smsType` 允许的取值有：

- **voice**：发送语音验证码
- **sms**：发送普通短信验证码

此接口与之前的 [验证短信 API](#短信验证_API) 完全兼容，如果你不需要此服务，完全不需要修改之前的发送短信代码。它的 [发送限制](#短信有什么限制吗_) 与短信验证码相同。

### 校验验证码

通过下面的 API 可以验证收到的 6 位数字验证码是否正确：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber":"+86186xxxxxxxx"}' \
  "https://{{host}}/1.1/verifySmsCode/6位数字验证码"
```

其中 `verifySmsCode` 后面是手机收到的 6 位数字验证码。`mobilePhoneNumber` 是收到短信的手机号码。

如果成功，将返回：

```json
{}
```

{% call docs.noteWrap() %}
由于运营商和渠道的限制，短信验证码（也包括语音验证码）向同一手机号码发送要求间隔至少一分钟，并且 24 小时内向同一手机号码发送次数不能超过 10 次，**因此建议采用 [图形验证码](#图形验证码)、倒数计时等措施来控制频率** 提示用户，防止短信轰炸等恶劣情况发生。

另外，请了解有关短信的 [其他限制](#短信有什么限制吗_)，以及如何设置 [测试手机号和固定验证码](leanstorage_guide-js.html#测试手机号和固定验证码)。
{% endcall %}

### 国际短信

要发送国际短信，只需要将手机号码调整为 [E.123](https://en.wikipedia.org/wiki/E.123) 所规定的格式即可（语音验证码在海外还不可用）。例如向美国的一个手机号码（+17646xxxxx）发送一条短信验证码：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "+17646xxxxx"}' \
  https://{{host}}/1.1/requestSmsCode
```

除了修改手机号码格式，发送国际短信和国内短信的请求参数完全一样。

要了解短信可送达的所有国家或地区以及费率，请参考 [官网价格方案](/pricing)。

## 自定义短信模板

我们还支持通过 `requestSmsCode` 发送自定义模板的短信。短信模板可以在 [控制台 > 消息 > 短信 > 设置 > 短信模板](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 里创建。

要使用已创建好的短信模板来发送短信验证，可以通过 `template` 参数指定模板名称，`sign` 参数来指定签名，并且可以传入变量渲染模板，比如下面例子中的 `date`：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx", "template":"activity","sign":"sign","date":"2014 年 10 月 31 号"}' \
  https://{{host}}/1.1/requestSmsCode
```

短信模板的语法遵循 [Handlebars](http://handlebarsjs.com/)，举例如下：

<samp class="bubble" ng-non-bindable>Hi {{ docs.mustache("{username}") }}，欢迎注册{{ docs.mustache("{name}") }}应用。您可以通过验证码：{{ docs.mustache("{code}") }} 进行注册。本条短信将在{{ docs.mustache("{ttl}") }}分钟后自行销毁，请尽快使用【签名】
</samp>

* **code** 是我们帮你生成的验证码，可以通过 `/1.1/verifySmsCode/<code>` 校验。
* **ttl** 是短信有效期，单位分钟，默认为 10 分钟。
* **name** 是应用名称

这三个内置字段会自动填充，你当然也可以添加自定义变量，形如 {{ docs.mustache("{var}") }}。

### 短信模板审核

模板的创建和修改都需要审核，并且在创建或修改模板之时，短信账户至少有 200 元的非赠送余额。创建后的模板会被自动提交进行审核，审核结果将通过邮件的形式发送到你的账号邮箱。

目前我们仅允许两类自定义短信：

- 验证类短信
- 通知类短信

**即内容中不允许包含任何下载链接，以及推广营销类信息**，否则，模板将无法通过审核。

每个应用限制创建 10 个模板，并且每个模板都需要经过审核才可以使用（审核在工作时间内通常在 1 个小时内）。模板一经审核，就可以马上使用。后续你可以创建同名模板来替换当前使用的模板，新模板也同样需要审核。审核通过，即可替换旧模板。

## 用户账户与手机号码验证

LeanCloud 提供了内建的账户系统，方便开发者快速接入。我们也支持账户系统与手机号码绑定的一系列功能，譬如：

### 使用手机号码注册或登录

用户直接输入手机号码来注册账户，如果手机号码已存在则自动登录。`POST /usersByMobilePhone` 既用于注册也用于登录：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber":"186xxxxxxxx","smsCode":"123456"}' \
  https://{{host}}/1.1/usersByMobilePhone
```

其中 `mobilePhoneNumber` 是手机号码，`smsCode` 是使用 [短信验证 API](#短信验证_API) 发送到手机上的 6 位验证码字符串。如果不传入 `username`，默认用户名将是手机号码。

注册或者登录成功后，返回的应答与登录接口相似：

```json
{
  "username":     "186xxxxxxxx",
  "mobilePhone":  "186xxxxxxxx",
  "createdAt":    "2014-11-07T20:58:34.448Z",
  "updatedAt":    "2014-11-07T20:58:34.448Z",
  "objectId":     "51c3ba66e4b0f0e851c1621b",
  "sessionToken": "pnktnjyb996sj4p156gjtp4im",
  ... 其他属性
}
```

如果是第一次注册，将默认设置 `mobilePhoneVerified` 属性为 `true`。

使用手机验证码注册时，并不需要传入密码 `password`，云端也会默认使用空密码，代表不可以用密码来登录。如果需要在**注册的同时设置一个密码**，则增加传入 `password` 参数即可：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber":"186xxxxxxxx","smsCode":"123456", "password": "密码"}' \
  https://{{host}}/1.1/usersByMobilePhone
```
`password` 这个参数只在注册时起作用，如果是登录则会被忽略。

### 手机号码验证

在应用控制台的设置里，你还可以选择开启注册手机码号验证。这样当用户在注册时填写了 `mobilePhoneNumber` 字段， LeanCloud  会向该手机号码发送一条附带验证码的验证短信，用户在输入验证码后被 LeanCloud API 验证通过后，用户的 `mobilePhoneNumberVerified` 属性即被设置为 `true`。

假设你在开启注册手机号码验证选项后，注册下列用户：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"username":"cooldude6","password":"p_n7!-e8","mobilePhoneNumber":"186xxxxxxxx"}' \
  https://{{host}}/1.1/users
```

那么在注册成功后，LeanCloud  将向 186xxxxxxxx 发送一条验证短信。开发者需要提供一个输入框让用户输入这个验证短信中附带的验证码，之后调用下列 API 来确认验证码的有效性：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://{{host}}/1.1/verifyMobilePhone/<code>
```

其中 URL 中最后的 `<code>` 要替换成 6 位验证数字。

验证成功后，用户的 `mobilePhoneNumberVerified` 将变为 `true`，并会触发调用云引擎的 `AV.Cloud.onVerified(type, function)` 方法，`type` 被设置为 `sms`。

成功则返回：

```
{
  "updatedAt":"2017-03-30T08:20:25.452Z",
  "objectId":"587a0f0661ff4b0065f1dff8"
}
```

如果希望用户绑定或修改手机号时先通过短信验证，可以使用 `requestChangePhoneNumber` 和 `changePhoneNumber` 这两个接口。

`requestChangePhoneNumber` 接受以下请求参数：

参数 | 说明
- | -
`mobilePhoneNumber` | **必填** 接受手机验证码短信的手机号，同时也是绑定或更新的新手机号
`ttl` | **可选** 验证码有效时间

`changePhoneNumber` 接受以下请求参数：

参数 | 说明
- | -
`mobilePhoneNumber` | **必填** 绑定或更新的新手机号
`code` | **必填** 用户手机接收到的短信验证码 

绑定手机号或修改手机号时请求发送验证码：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: <sessionToken>" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber":"186xxxxxxxx","ttl":10}' \
  https://{{host}}/1.1/requestChangePhoneNumber
```

如果成功，将返回：

```json
{}
```

验证后绑定或更新手机号：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber":"186xxxxxxxx","code":"123456"}' \
  https://{{host}}/1.1/changePhoneNumber
```

未绑定手机号的用户（比如通过邮箱、密码注册的用户），通过以上流程绑定手机号后，其`mobilePhoneNumberVerified` 将变为 `true`，并会触发调用云引擎的 `AV.Cloud.onVerified(type, function)` 方法，`type` 被设置为 `sms`。

`requestChangePhoneNumber` 和 `changePhoneNumber` 的请求参数 `mobilePhoneNumber` 需保持一致，否则 `changePhoneNumber` 会报错。

### 请求手机号码验证

用户除了被动等待接收验证码短信之外，或者因为其他情况用户没有收到短信，此时开发者可以主动要求发送验证码短信：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx"}' \
  https://{{host}}/1.1/requestMobilePhoneVerify
```

如果成功，将返回：

```json
{}
```

### 手机号码＋验证码登录

在验证过手机号码后，用户可以采用短信验证码登录，来避免繁琐的输入密码的过程，请求发送登录验证码：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx"}' \
  https://{{host}}/1.1/requestLoginSmsCode
```

如果成功，将返回：

```json
{}
```

用户收到验证码短信后，输入手机号码和该验证码来登录应用：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'mobilePhoneNumber=186xxxxxxxx' \
  --data-urlencode 'smsCode=123456' \
  https://{{host}}/1.1/login
```

也可以采用手机号码和密码的方式登录：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'mobilePhoneNumber=186xxxxxxxx' \
  --data-urlencode 'password=p_n7!-e8' \
  https://{{host}}/1.1/login
```

### 手机号码＋验证码重置用户密码

如果用户使用了手机号码来注册，你就可以通过手机短信来实现「忘记密码」的功能：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx"}' \
  https://{{host}}/1.1/requestPasswordResetBySmsCode
```

发送一条重置密码的短信验证码到注册用户的手机上，需要传入注册时候的 `mobilePhoneNumber`。

如果成功，将返回：

```json
{}
```

用户收到验证码后，调用 `PUT /1.1/resetPasswordBySmsCode/<code>` 来设置新的密码（其中 URL 中的 `<code>` 就是 6 位验证数字）：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"password": "<新密码>"}' \
  https://{{host}}/1.1/resetPasswordBySmsCode/收到的6位验证码
```

修改成功后，用户就可以用新密码登录了。

## 图形验证码 captcha

图形验证码是防范 [短信轰炸](sms-guide.html#短信轰炸与图形验证码) 最有效的手段。LeanCloud 提供的图形验证码含有两个接口：

|URL|HTTP|功能|
| :----------------------------------- | :--- | ----------------- |
|/1.1/requestCaptcha|GET|获取图形验证码|
|/1.1/verifyCaptcha|POST|校验图形验证码并返回二次凭证|

要使用图形验证码来防止用户短信接口遭到轰炸，首先在 [控制台 > 消息 > 短信 > 设置](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 中打开 **启用短信图形验证码**，然后通过上述接口获取图形验证码：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
   -G \
  --data-urlencode 'size=4' \
  https://{{host}}/1.1/requestCaptcha
```

{{ sms.paramsRequestCaptcha(true) }}

返回结果：

```json
{
   "captcha_token":"R2cxkqSz",
   "captcha_url":"https:\/\/leancloud.cn\/1.1\/captchaImage?appId=PXnN5AqVpgEI4esrTLhoxUkd-gzGzoHsz&token=R2cxkqSz"
}
```

|参数名称|说明|
|:----|:--|
|captcha_token|供 `verifyCaptcha` 校验使用|
|captcha_url|图形验证码的图片地址|

获取了图形验证码后，需要使用对应的验证接口来校验：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
        "captcha_code": "0000",
        "captcha_token": "R2cxkqSz"
      }' \
  https://{{host}}/1.1/verifyCaptcha

```

|参数名称|说明|
| :----| :--|
|captcha_code|用户输入的图形验证码|
|captcha_token|`requestCaptcha` 返回的 captcha_token|

验证成功会返回：

```json
{ "validate_token": "发送短信的二次凭证"}
```

失败返回：

```json
{
  "code":  "错误码",
  "error": "错误信息"
}
```

获取到的 `validate_token` 需要添加在 `requestSmsCode` 的请求内容当中：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"mobilePhoneNumber": "186xxxxxxxx","validate_token":"token"}' \
  https://{{host}}/1.1/requestSmsCode
```

