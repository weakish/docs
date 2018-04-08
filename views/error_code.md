{% import "views/_im.njk" as im %}
# 错误码详解

本文档列举出服务端和 SDK 返回的错误码及相应说明。其他由各 SDK 产生的错误码，请参考以下链接：

* iOS 的 [AVConstants](/api-docs/iOS/docs/AVConstants.html)。
* iOS SDK 在进行 WebSocket 通信过程中，相关的状态码请参考 [RFC 6455 · Status Codes]( http://tools.ietf.org/html/rfc6455#section-7.4)。
* PHP SDK 中与网络请求操作相关的错误码，比如 `28` 表示请求超时、`7` 表示连接服务器失败，请参考 [libcurl error codes](http://curl.haxx.se/libcurl/c/libcurl-errors.html)。
* Android 的 [AVException](/api-docs/android/index.html)。

## 0

* 信息 - `(无)`
* 含义 - WebSocket 正常关闭，可能发生在服务器重启，或本地网络异常的情况。SDK 会自动重连，无需人工干预。
* 模块 - 实时通信 IM

## 1
* 信息 - `Internal server error. No information available.`
* 含义 - 服务器内部错误或者参数错误，一般是因为传入了错误的参数，或者没有在本文档里明确定义的运行时错误，都会以代码 1 指代。

## 100

* 信息 - `The connection to the AVOS servers failed.`
* 含义 - 无法建立 TCP 连接到 LeanCloud 服务器，通常是因为网络故障，或者我们服务器故障引起的，我们的服务器状态可以查看 [健康状态检查](https://status.leancloud.cn/)。

## 101

* 信息 - `Object doesn't exist, or has an incorrect password.`
* 含义 - 查询的 Class 不存在，或者要关联的 Pointer 对象不存在。

## 103

* 信息 - `Missing or invalid classname. Classnames are case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the only valid characters.`
* 含义 - 非法的 Class 名称，Class 名称大小写敏感，并且必须以英文字母开头，有效的字符仅限在英文字母、数字以及下划线。

## 104

* 信息 - `Missing object id.`
* 含义 - 缺少 objectId，通常是在查询的时候没有传入 objectId，或者 objectId 非法。objectId 只能为字母、数字组成的字符串。

## 105

* 信息 - `Invalid key name. Keys are case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the only valid characters.`
* 含义 - 无效的 key 名称，也就是 Class 的列名无效，列名必须以英文字母开头，有效的字符仅限在英文字母、数字以及下划线。

## 106

* 信息 - `Malformed pointer. Pointers must be arrays of a classname and an object id.`
* 含义 - 无效的 Pointer 格式，Pointer必须为形如 `{className: 'Post', objectId:'xxxxxx'}` 的 JSON 对象。

## 107

* 信息 - `Malformed json object. A json dictionary is expected.`
* 含义 - 无效的 JSON 对象，解析 JSON 数据失败。

## 108

* 信息 - `Tried to access a feature only available internally.`
* 含义 - 此 API 仅供内部使用。

## 109

* 信息 - `That operation isn't allowed by binding class.`
* 含义 - 共享的 Class 无权限执行此操作，请检查 Class 共享的权限设置。


## 111

* 信息 - `Field set to incorrect type.`
* 含义 - 想要存储的值不匹配列的类型，请检查你的数据管理平台中列定义的类型，查看存储的数据是否匹配这些类型。

## 112

* 信息 - `Invalid channel name. A channel name is either an empty string (the broadcast channel) or contains only a-zA-Z0-9_ characters and starts with a letter.`
* 含义 - 推送订阅的频道无效，频道名称必须不是空字符串，只能包含英文字母、数字以及下划线，并且只能以英文字母开头。

## 113

* 信息 - `Key is required.`
* 含义 - Class 中的某个字段设定成必须，保存的对象缺少该字段。

## 114

* 信息 - `Invalid device token.`
* 含义 - iOS 推送存储的 deviceToken 无效，如何存储 installation 请阅读 [消息推送开发指南](./push_guide.html#iOS_消息推送)。

## 116

* 信息 - `The object is too large.`
* 含义 - 要存储的对象超过了大小限制，我们限制单个对象的最大大小在 16 M。

## 117

* 信息 - `The key is read only.`
* 含义 - 更新的 Key 是只读属性，无法更新。


## 119

* 信息 - `That operation isn't allowed for clients.`
* 含义 - 该操作无法从客户端发起。请检查该错误由哪个操作引起，然后在应用控制台中找到对应的服务设置来启用相应的选项，例如 [控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf)、[控制台 > 消息 > 短信 > 设置 > 短信选项](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 等等。

## 120

* 信息 - `The results were not found in the cache.`
* 含义 - 查询结果无法从缓存中找到，SDK 在使用从查询缓存的时候，如果发生缓存没有命中，返回此错误。

## 121

* 信息 - `Keys in NSDictionary values may not include '$' or '.'.`
* 含义 - JSON 对象中 key 的名称不能包含 `$` 和 `.` 符号。

## 122

* 信息 - `Invalid file name. A file name contains only a-zA-Z0-9_. characters and is between 1 and 36 characters.`
* 含义 - 无效的文件名称，文件名称只能是英文字母、数字和下划线组成，并且名字长度限制在 1 到 36 之间。

## 123

* 信息 - `Invalid ACL. An ACL with an invalid format was saved. This should not happen if you use AVACL.`
* 含义 - ACL 格式错误，如果您是使用 SDK 提供的 AVACL 类，理论上这不应该发生，正确的 ACL 格式请参考 [REST API](./rest_api.html#安全性)。

## 124

* 信息 - `The request timed out on the server. Typically this indicates the request is too expensive.`
* 含义 - 请求超时，超过一定时间（默认 10 秒）没有返回，通常是因为网络故障或者该操作太耗时引起的。

## 125

* 信息 - `The email address was invalid.`
* 含义 - 电子邮箱地址无效。

## 126

* 信息 - `Invalid user id.`
* 含义 - 无效的用户 Id，可能用户不存在。

## 127

* 信息 - `The mobile phone number was invalid.`
* 含义 - 手机号码无效。

## 128

* 信息 - `Invalid relation data.`
* 含义 - 无效的 Relation 数据，通常是因为添加或者删除的 Relation 数据为空或者过多（单次超过 1000 个）。


## 137

* 信息 - `A unique field was given a value that is already taken.`
* 含义 - 违反 class 中的唯一性索引约束（unique），尝试存储重复的值。

## 139

* 信息 - `Role's name is invalid.`
* 含义 - 角色名称非法，角色名称只能以英文字母、数字或下划线组成。

## 140

* 信息 - `超过应用额度，请升级到商用版或联系我们处理。`
* 含义 - 通常是因为超过开发版的使用额度，比如每天 3 万次 API 调用限制、云引擎域名绑定限制等，可以通过升级商用版解决。

## 141

* 信息 - `LeanEngine request timeout.`
* 含义 - 云引擎调用超时。错误信息里会有具体的 Class 和 Hook 名称。

## 142

* 信息 - `Cloud Code validation failed.`
* 含义 - 云引擎校验错误，通常是因为 `beforeSave`、`beforeDelete` 等 hook 函数返回 error。

## 145

* 信息 - `Payment is disabled on this device.`
* 含义 - 本设备没有启用支付功能。

## 150

* 信息 - `Fail to convert data to image.`
* 含义 - 转换数据到图片失败。

## 154

* 信息 - `Exceeded an application threshold setting.`
* 含义 - 超过应用阈值限制，例如短信消费超过每日最大上限等。通常可以在应用设置的服务阈值菜单修改上限值。

## 160

* 信息 - `Insufficient balance.`
* 含义 - 账户余额不足。

## 200

* 信息 - ` Username is missing or empty`
* 含义 - 没有提供用户名，或者用户名为空。

## 201

* 信息 - `Password is missing or empty.`
* 含义 - 没有提供密码，或者密码为空。

## 202

* 信息 - `Username has already been taken.`
* 含义 - 用户名已经被占用。

## 203

* 信息 - `Email has already been taken.`
* 含义 - 电子邮箱地址已经被占用。

## 204

* 信息 - `The email is missing, and must be specified.`
* 含义 - 没有提供电子邮箱地址。

## 205

* 信息 - `A user with the specified email was not found.`
* 含义 - 找不到电子邮箱地址对应的用户。

## 206

* 信息 - `The user cannot be altered by a client without the session.`
* 含义 - 没有提供 session，无法修改用户信息，这通常是因为没有登录的用户想修改信息。修改用户信息必须登录，除非在云引擎里使用 master key 来更改。

## 207

* 信息 - `Users can only be created through sign up.`
* 含义 - 只能通过注册创建用户，不允许第三方登录。

## 208

* 信息 - `An existing account already linked to another user.`
* 含义 - 第三方帐号已经绑定到一个用户，不可绑定到其他用户。

## 210

* 信息 - `The username and password mismatch.`
* 含义 - 用户名和密码不匹配。

## 211

* 信息 - `Could not find user.`
* 含义 - 找不到用户。

## 212

* 信息 - `The mobile phone number is missing, and must be specified.`
* 含义 - 请提供手机号码。

## 213

* 信息 - `A user with the specified mobile phone number was not found.`
* 含义 - 手机号码对应的用户不存在。

## 214

* 信息 - `Mobile phone number has already been taken.`
* 含义 - 手机号码已经被注册。

## 215

* 信息 - `Mobile phone number isn't verified.`
* 含义 - 未验证的手机号码。

## 216

* 信息 - `Email address isn't verified.`
* 含义 - 未验证的邮箱地址。

## 217

* 信息 - `Invalid username, it must be a non-blank string.`
* 含义 - 无效的用户名，不允许空白用户名。

## 218

* 信息 - `Invalid password, it must be a non-blank string.`
* 含义 - 无效的密码，不允许空白密码。

## 219

* 信息 - `登录失败次数超过限制，请稍候再试，或者通过忘记密码重设密码。`
* 含义 -如果在 15 分钟内，同一个用户登录失败的次数大于 6 次，该用户账户即被云端暂时锁定。锁定将在最后一次错误登录的 15 分钟之后由云端自动解除。如果需要立刻解锁，可以先重置密码再登录。

## 250

* 信息 - `Linked id missing from request`
* 含义 - 连接的第三方账户没有返回用户唯一标示 id

## 251

* 信息 - `Invalid linked session` 或者 `Invalid Weibo session`
* 含义 - 无效的账户连接，一般是因为 access token 非法引起的。

## 252

* 信息 - `Invalid Weixin session`
* 含义 - 无效的微信授权信息。

## 300

* 信息 - `CQL syntax error.`
* 含义 - CQL 语法错误。详情参考 [CQL 语法详细指南](./cql_guide.html)

## 301

* 信息 - `Fails to insert new document.`
* 含义 - 新增对象失败，通常是数据格式问题。

## 302

* 信息 - `Invalid GeoPoint values.`
* 含义 - 无效的 GeoPoint 类型，请确保经度在 -180 到 180 之间，纬度在 -90 到 90 之间。

## 303

* 信息 - `Fail to execute operation on storage.`
* 含义 - 插入数据库失败，一般是数据格式或者内部错误，通常错误里包含更具体的错误信息。

## 304

* 信息 - `Database error.`
* 含义 - 数据操作错误，一般是语法错误或者内部异常，请及时联系我们。

## 305

* 信息 - `No effect on updating/deleting a document.`
* 含义 - 根据 where 条件更新或者删除对象不起作用，通常是因为条件不满足。

## 401

* 信息 - `Unauthorized.`
* 含义 - 未经授权的访问，没有提供 App id，或者 App id 和 App key 校验失败，请检查配置。

## 403

当应用在控制台中的相关服务选项未打开，如 Class 关闭了权限，或是 User 缺失了 session 信息等情况下，云端会统一地返回 403 错误码及不同的错误信息，代表当前请求因权限不够而被拒。例如：

- 信息 - `Forbidden to read/write by class permissions`
- 含义 - 操作被禁止，因为 Class 表没有打开「读」或者「写」的权限。进入 **控制台** > **存储**，点击相应的 Class，从右侧选择 **其他** 下拉菜单，进入 **权限管理** 来调整。
----
- 信息 - `The user cannot be altered by a client without the session.`
- 含义 - 用户没有登录，无法修改用户信息。


## 429

* 信息 - `Too many requests.`
* 含义 - 超过应用的流控限制，即超过每个应用同一时刻最多可使用的工作线程数，或者说同一时刻最多可以同时处理的数据请求。通过 **控制台** > **存储** > **API 统计** > **API 性能** > **总览** 可以查看应用产生的请求统计数据，如平均工作线程、平均响应时间等。使用 LeanCloud [商用版或企业版](https://blog.leancloud.cn/5414/) 的用户，如有需要，可以联系我们来调整工作线程数。

## 430

* 信息 - `Upload files rate limit exceeded.`
* 含义 - 超过 REST API 上传文件流控限制。通过 REST API 每秒限制上传一个文件，并且每分钟最多上传 30 个文件。使用 SDK 上传没有限制，并且可以获得更高的性能。大规模批量上传请使用云引擎命令行工具提供的 `upload` 命令。

## 431

* 信息 - `LeanEngine hooks rate limit exceeded.`
* 含义 - 超过云引擎 hook 调用流控限制，通常绝大多数应用不会触发此限制。如有遇到，请联系我们处理。可以通过 **控制台** > **存储** > **API 统计** > **API 性能** > **慢查询** 查看应用的云引擎 Hook 请求状况。

## 502

* 信息 - `Server is in maintenance.`
* 含义 - 服务器维护中。

## 503

* 信息 - `The app is temporarily disabled/readonly.`
* 含义 - 应用被临时禁用或者进入只读状态，通常是进行运维或者故障处理操作，我们会提前告知开发者。如果是调用云引擎报错，可能是预备环境或者体验实例已进入强制休眠阶段，可以稍等几秒后重试。

## 511

* 信息 - `Temporarily Unavailable.`
* 含义 -  该请求 API 暂时不可用，请稍后重试。一般是运维操作临时禁止了某个 API 访问，一段时间后会自然恢复，或者联系我们处理。


## 524

* 信息 - `complete a TCP connection to the upstream server, but did not receive a timely HTTP response.`
* 含义 -  Web 服务器与后端应用服务器通讯失败，一般是某个应用服务器异常，Web 服务器会在几秒后移除此实例。如果频繁遇到 524，请联系我们处理。


## 529

* 信息 - `Exceeded Limit`
* 含义 -  当前 IP 超过并发限制。使用云引擎时遇到 http 响应码为 529 的错误页面，解决方案请参考 [Exceeded Limit](leanengine_faq.html#Exceeded_Limit_是什么意思_)。

## 600

* 信息 - `Invalid SMS signature.`
* 含义 - 无效的短信签名。具体要求请参考 [短信签名规范](sms-guide.html#短信签名)。


## 601

* 信息 - `Can't send SMS too frequently.`
* 含义 -  发送短信过于频繁。不同类型的短信有不同的 [发送数量限制及内容管控](rest_sms_api.html#短信有什么限制吗？)。我们强烈建议用户使用图形验证码或者倒数计时等方式来避免用户重复发送验证码，以及可能存在的短信验证码攻击。


## 602

* 信息 - `Fails to send message.`
* 含义 -  发送短信或者语音验证码失败，这是短信提供商返回错误，如果确认手机号码没有问题，请联系我们处理。

## 603

* 信息 - `Invalid SMS code.`
* 含义 - 无效的短信验证码，通常是不匹配或者过期。

## 604

* 信息 - `SMS template not found.`
* 含义 - 找不到自定义的短信模板，请检查模板名称是否正确或者模板是否已经创建并审核通过。

## 605

* 信息 - `SMS template not verified.`
* 含义 - 短信模板未审核。
----
* 信息 - `SMS sign not verified`
* 含义 - 没有设置默认签名。请进入 [控制台 > 消息 > 短信 > 设置](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 中设置一个默认短信签名。

## 606

* 信息 - `Fails to render SMS template.`
* 含义 - 渲染短信模板失败，通常是模板语法问题，我们的短信模板仅支持 [handlerbars](http://handlebarsjs.com/) 模板语法。

## 608

* 信息 - `Missing validate token.`
* 含义 - 缺少图形验证码功能要求的 token。请按照 [开通图形验证码服务](sms-guide.html#开通图形验证码服务) 来正确集成，或者在应用控制台中关闭「短信设置」里「强制短信验证服务使用图形验证码」选项。

## 700

* 信息 - `Nonexistent query keys`
* 含义 - 无效的查询或者排序字段，请确认查询或者排序的字段在表中存在。

{{ im.errorCodes() }}

