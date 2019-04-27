{% import "views/_helper.njk" as docs %}
{% import "views/_sms.njk" as sms %}
{% import "views/_parts.html" as include %}

# 短信 SMS 服务使用指南

短信服务适用的场景很多：

- 用户验证：在处理用户登录、修改密码等操作时，需要向用户的手机发送一条包含验证码的短信，以确保账户安全。
- 操作验证：在银行金融类应用中，当用户对账户资金进行转账、消费等敏感操作时，需要通过验证码来确认是否为用户本人操作。
- 通知与营销推广：电商在发货后将快递单号、订单号、发货时间等信息会通过短信发给买家，以达到良好的购物体验；或是定期将新产品及促销信息发送给消费者。

根据电信运营商的规范，短信按照用途被分为三类：

**1. 验证类**

{% call docs.bubbleWrap() -%}
【短信签名】您请求重设应用“应用名称”的密码，请输入验证码 123456 验证，验证码仅在 10 分钟内有效。
{%- endcall %}

**2. 通知类**

{% call docs.bubbleWrap() -%}
【购物网】您尾号为34323的订单号已经通过宅急送（快递单号12343432）安排递送，请您开箱验货确认无误后签收，物流查询拨打400-0000-xxx。
{%- endcall %}

**3. 营销类**

{% call docs.bubbleWrap() -%}
【当当】春风十里，好书陪你！30万种畅销书5折封顶！<a href="#">http://t.cn/Iekds</a> 回TD退订
{%- endcall %}

{{ docs.alert("不同类型的短信遵循不同的 [内容规范](#内容规范)，不符合规定的短信将无法发送。") }}

开发者在 LeanCloud 应用控制台开启与短信相关的服务后（参见 [开通短信服务](#开通短信服务)），即可通过 SDK 向用户发送短信：

```objc
AVShortMessageRequestOptions *options = [[AVShortMessageRequestOptions alloc] init];
options.templateName = @"Register_Notice";// 控制台预设的模板名称
options.signatureName = @"LeanCloud";     // 控制台预设的短信签名
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板和签名
[AVSMS requestShortMessageForPhoneNumber:@"186xxxxxxxx"
                                options:options
                                callback:^(BOOL succeeded, NSError * _Nullable error) {
                                    if (succeeded) {
                                        /* 请求成功 */
                                    } else {
                                        /* 请求失败 */
                                    }
                                }];
```
```swift
let dic: LCDictionary = [
    "sign": LCString("LeanCloud") // 控制台预设的短信签名
]
// Register_Notice 控制台预设的模板名称
LCSMSClient.requestShortMessage(mobilePhoneNumber: "186xxxxxxxx", templateName: "Register_Notice", variables: dic) { (result) in
    switch result {
    case .success:
        print("success")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMSOption option = new AVSMSOption();
option.setTemplateName("Register_Notice");  // 控制台预设的模板名称
option.setSignatureName("LeanCloud");       // 控制台预设的短信签名
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板和签名
AVSMS.requestSMSCodeInBackground("186xxxxxxxx", option, new RequestMobileCodeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 请求成功 */
    } else {
      /* 请求失败 */
    }
  }
});
```
```javascript
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板和签名
AV.Cloud.requestSmsCode({
  mobilePhoneNumber: '186xxxxxxxx',  // 目标手机号
  template: 'Register_Notice',       // 控制台预设的模板名称
  sign:'LeanCloud'.                  // 控制台预设的短信签名
}).then(function(){
  //调用成功
}, function(err){
  //调用失败
});
```
```cs
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板（「Register_Notice」参数）和签名（「LeanCloud」参数）
AVCloud.RequestSMSCodeAsync("186xxxxxxxx","Register_Notice",null,"LeanCloud").ContinueWith(t =>
{
    var result = t.Result;
    // result 为 True 则表示调用成功
});
```
```java
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板（「Register_Notice」参数）
AVOSCloud.requestSMSCode("186xxxxxxxx", "Register_Notice", null);
```
```php
// 往 186xxxxxxxx 这个手机号码发送短信，使用预设的模板（「Register_Notice」参数）
$options = [
  "template" => "Register_Notice",
  "name" => "LeanCloud",
];
SMS::requestSMSCode("186xxxxxxxx", $options);
```
```python
from leancloud import cloud
cloud.request_sms_code("186xxxxxxxx", template="Register_Notice", sign="LeanCloud")
```


用户收到的短信内容如下：

{% call docs.bubbleWrap() -%}
【LeanCloud】感谢您注册 LeanCloud，领先的 BaaS 提供商，为移动开发提供强有力的后端支持。
{% endcall %}

- 短信的内容来自名为 `Register_Notice` 的 [模板](#短信模板)，需要在控制台提前创建并通过审核。
- `LeanCloud` 为 [短信签名](#短信签名)，是必需添加的，也需要在控制台提前创建并通过审核才可使用。

## 开通短信服务

### 在安全中心开启短信服务
要使用短信服务，首先需要在控制台创建一个应用，然后进入 [控制台 > 设置 > 安全中心](/dashboard/app.html?appid={{appid}}#/security)，确保 **短信服务** 开关是打开的：

![sms_switch](images/sms_switch_setting.png)

### 完成短信配置
然后进入 [控制台 > 消息 > 短信 > 设置 > 短信选项](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf)，请确保以下选项处于勾选状态。

{{ include.checkbox(true) }}**启用通用的短信验证码服务（开放 `requestSmsCode` 和 `verifySmsCode` 接口）**
- 开启：开发者可以使用短信进行验证功能的开发，比如，敏感的操作认证、异地登录、付款验证等业务相关的需求。
- 关闭：请求验证发送短信以及验证短信验证码都会被服务端拒绝，但是请注意，跟用户相关的验证与该选项无关。

### 设置默认签名
短信发送的时候需要有签名运营商才会放行，如前面示例中的「购物网」、「当当」即为短信签名。在开始发送短信之前，你需要进入[控制台 > 消息 > 短信 > 设置](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf)，设置默认的短信签名（第一个签名即为「默认签名」）：

![sms_switch](images/sms_create_signature.png)

创建签名只需要输入内部名称和签名字符串即可，如下图所示：

![sms_switch](images/sms_signature_edit.png)

等签名审核完成之后，你就可以调用 LeanCloud API 发送自己的短信了。我们看到最开始的示例代码里面还有「短信模板」，但是因为模板并不是必须的，所以留待 [后面详述](#短信模板)。


## 验证类短信

通过短信进行注册、登录或重要操作的验证，是一种非常常见的需求。这里我们以一个购物应用为例，说明如何使用 LeanCloud 短信服务完成操作认证：

1. **用户点击支付订单**  
  发起敏感操作
  
2. **调用接口发送验证短信**  
  注意，在这一步之前，我们假设开发者已经完成了前面章节提及的所有短信服务设置。

```objc
AVShortMessageRequestOptions *options = [[AVShortMessageRequestOptions alloc] init];
options.TTL = 10;                      // 验证码有效时间为 10 分钟
options.applicationName = @"应用名称";  // 应用名称
options.operation = @"某种操作";        // 操作名称
[AVSMS requestShortMessageForPhoneNumber:@"186xxxxxxxx"
                                 options:options
                                callback:^(BOOL succeeded, NSError * _Nullable error) {
                                    if (succeeded) {
                                        /* 请求成功 */
                                    } else {
                                        /* 请求失败 */
                                    }
                                }];
```
```swift
let dic: LCDictionary = [
    "ttl": LCNumber(10), // 验证码有效时间为 10 分钟
    "name": LCString("应用名称"), // 应用名称
    "op": LCString("某种操作")  // 操作名称
]

// templateName: 短信模板，不传此参数会使用默认短信模板
LCSMSClient.requestShortMessage(mobilePhoneNumber: "186xxxxxxxx", templateName: "", variables: dic) { (result) in
    switch result {
    case .success:
        print("success")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMSOption option = new AVSMSOption();
option.setTtl(10);                     // 验证码有效时间为 10 分钟
option.setApplicationName("应用名称");
option.setOperation("某种操作");
AVSMS.requestSMSCodeInBackground("186xxxxxxxx", option, new RequestMobileCodeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 请求成功 */
    } else {
      /* 请求失败 */
    }
  }
});
```
```javascript
AV.Cloud.requestSmsCode({
    mobilePhoneNumber: '186xxxxxxxx',
    name: '应用名称',
    op: '某种操作',
    ttl: 10                     // 验证码有效时间为 10 分钟
}).then(function(){
    //调用成功
}, function(err){
    //调用失败
});
```
```cs
// 下面参数中的 10 表示验证码有效时间为 10 分钟
AVCloud.RequestSMSCodeAsync("186xxxxxxxx","应用名称","某种操作",10).ContinueWith(t =>
{
    if(!t.Result)
    {
        //调用成功
    }
});
```
```java
// 下面参数中的 10 表示验证码有效时间为 10 分钟
AVOSCloud.requestSMSCode("186xxxxxxxx", "应用名称", "某种操作", 10);
```
```php
$options = [
  "name" => "应用名称",
  "op" => "某种操作",
  "ttl" => 10, // 验证码有效时间为 10 分钟
];
SMS::requestSMSCode("186xxxxxxxx", $options);
```
```python
from leancloud import cloud
options = {
  "op": "某种操作",
  "ttl": 10  # 验证码有效时间为 10 分钟
}
cloud.request_sms_code("186xxxxxxxx", sign="应用名称", params=options) 
```

3. **用户收到短信，并且输入了验证码。**  
  在进行下一步之前，我们建议先进行客户端验证（对有效性进行基本验证，例如长度、特殊字符等），这样就避免了错误的验证码被服务端驳回而产生的流量，以及与服务端沟通的时间，有助于提升用户体验。
  
4. **调用接口验证用户输入的验证码是否有效。**  
  注意，调用时需要确保验证码和手机号的参数顺序，我们假设验证码数字是「123456」。
  
```objc
[AVOSCloud verifySmsCode:@"123456" mobilePhoneNumber:@"186xxxxxxxx" callback:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //验证成功
    }
}];
```
```swift
LCSMSClient.verifyMobilePhoneNumber("186xxxxxxxx", verificationCode: "123456") { (result) in
    switch result {
    case .success:
        print("success")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMS.verifySMSCodeInBackground("123456", "186xxxxxxxx", new AVMobilePhoneVerifyCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 验证成功 */
    } else {
      /* 验证失败 */
    }
  }
});
```
```javascript
AV.Cloud.verifySmsCode('123456', '186xxxxxxxx').then(function(){
    //验证成功
}, function(err){
    //验证失败
});
```
```cs
AVCloud.VerifySmsCodeAsync("123456","186xxxxxxxx").ContinueWith(t =>{
    if(t.Result) 
    {
        // 验证成功
    }
});
```
```java
try {
  AVOSCloud.verifySMSCode('123456', '186xxxxxxxx');
  /* 验证成功 */
} catch (AVException ex) {
  /* 验证失败 */
}
```
```php
// 注意，PHP SDK 的参数顺序与大多数 SDK 不同，手机号码在前，验证码在后。
SMS::verifySmsCode('186xxxxxxxx', '123456');
```
```python
from leancloud import cloud
# 注意，Python SDK 的参数顺序与大多数 SDK 不同，手机号码在前，验证码在后。
cloud.verify_sms_code('186xxxxxxxx', '123456')
```

针对上述的需求，可以把场景换成异地登录验证、修改个人敏感信息验证等一些常见的场景，步骤是类似的，调用的接口也是一样的，仅仅是在做 UI 展现的时候需要开发者自己去优化验证过程。

### 语音短信验证码

文本短信验证码在到达率上有一定的风险，尽管经过我们长期得到的用户反馈，到达率已接近 100%，但是有些应用的时效性和安全性要求极高，所以我们也推出了语音短信验证码的服务，调用的方式如下：

```objc
AVShortMessageRequestOptions *options = [[AVShortMessageRequestOptions alloc] init];
options.type = AVShortMessageTypeVoice;
[AVSMS requestShortMessageForPhoneNumber:@"188xxxxxxxx"
        options:options
        callback:^(BOOL succeeded, NSError * _Nullable error) {
            if (succeeded) {
                NSLog(@"A voice short message has been sent.");
        }
}];
```
```swift
LCSMSClient.requestVoiceVerificationCode(mobilePhoneNumber: "188xxxxxxxx") { (result) in
    switch result {
    case .success:
        print("A voice short message has been sent.")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMSOption option = new AVSMSOption();
option.setSmsType(AVSMSOption.AVSMS_TYPE.VOICE_SMS);
AVSMS.requestSMSCodeInBackground("188xxxxxxxx", option, new RequestMobileCodeCallback() {
    @Override
    public void done(AVException e) {
        if (null == e) {
          // 发送成功
        } else {
          // 发送失败
        }
    }
});
```
```js
AV.Cloud.requestSmsCode({
  mobilePhoneNumber: 'xxxxxxxxx',
  smsType: 'voice'
}).then(function() {
  // 发送成功
}).catch(function(error) {
  // 处理异常
});
```
```cs
AVCloud.RequestVoiceCodeAsync ("18688888888").ContinueWith(t =>{
    // 发送成功
});
```
```java
AVOSCloud.requestVoiceCode("18688888888");
```
```php
$options = [
  "smsType": "voice",
];
SMS::requestSMSCode("186xxxxxxxx", $options);
```
```python
from leancloud import cloud
cloud.request_sms_code("186xxxxxxxx", sms_type="voice")
```

发送成功之后，用户的手机就会收到一段语音通话，它会播报 6 位数的验证码，然后开发者需要再次调用：


```objc
[AVOSCloud verifySmsCode:@"123456" mobilePhoneNumber:@"186xxxxxxxx" callback:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //验证成功
    }
}];
```
```swift
LCSMSClient.verifyMobilePhoneNumber("186xxxxxxxx", verificationCode: "123456") { (result) in
    switch result {
    case .success:
        print("success")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMS.verifySMSCodeInBackground("123456", "186xxxxxxxx", new AVMobilePhoneVerifyCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 验证成功 */
    } else {
      /* 验证失败 */
    }
  }
});
```
```js
AV.Cloud.verifySmsCode('123456', '186xxxxxxxx').then(function(){
    //验证成功
}, function(err){
    //验证失败
});
```
```cs
AVCloud.VerifySmsCodeAsync("123456","186xxxxxxxx").ContinueWith(t =>{
    if(t.Result) 
    {
        // 验证成功
    }
});
```
```java
try {
  AVOSCloud.verifyCode('123456', '186xxxxxxxx');
  /* 验证成功 */
} catch (AVException ex) {
  /* 验证失败 */
}
```
```php
SMS::verifySmsCode('186xxxxxxxx', '123456');
```
```python
from leancloud import cloud
cloud.verify_sms_code('186xxxxxxxx', '123456')
```

再次验证用户输入的验证码是否正确。


## 营销、通知类短信

### 通知短信

通知类短信非常普遍，例如联通用户从外地进入上海可能会收到如下短信：

{{ docs.bubble("尊敬的用户：欢迎您来到上海，如需帮助请拨打客服热线10010或登录www.10010.com，优惠订购机票酒店请拨打116114。中国联通") }}

这是一个来自通信运营商的通知类短信的规范案例。

在实际使用的过程中，通知类短信往往会因为**措辞不当**而被短信服务商拒绝发送；甚至还会出现 开发者发送过去的请求被服务商直接屏蔽的情况。因此，LeanCloud 在发送推广类的短信时**需要进行内容审核（也就是开发者需要事先创建[模板](#短信模板)，我们审核通过之后再按照模板进行内容发送）**。

### 营销短信

营销类短信是应用开发者与潜在客户沟通、进行产品推广和销售的有效手段。营销类短信使用时跟 [通知短信](#通知短信) 使用没有任何本质区别，步骤依次是 [创建模板](#创建模板) > [使用模板](#使用模板)。

营销类短信默认会在短信最后加上「**回复TD退订**」，这是运营商的强制要求。

{{ docs.alert("自 2016 年 6 月起，营销类短信不允许由个人用户发送。所有营销类短信必须提供有效的公司或者企业名称，缺失名称将导致营销类短信无法发送。伪造或使用虚假名称将会被追究法律责任。") }}

第一次提交营销模板，其使用的营销签名需要上报至运营商进行备案，审核过程将需要 2~5 个工作日。当营销签名完成了备案，此后再提交营销模板，审核将在工作日 4 小时内完成。

{{ docs.namedAnchor("## 短信模板", "sms-template") }}

开发者可以使用短信模板来自定义短信的内容。为了确保短信内容的合法性及投递成功率，短信模板需要经过 **人工审核** 通过后，开发者才能在接口中调用该模板。

<!-- ### 短信签名 -->
{{ sms.signature("### 短信签名") }}

### 创建模板

要创建短信模板，先进入控制台，选择一个应用，再选择 [消息 > 短信 > 设置](http://leancloud.cn/messaging.html?appid={{appid}}#/message/sms/conf)。选择需要的模板类型：

- 通知类型
- 验证码类型
- 营销类型

如果模板类型选择了**通知类**或者**验证类**，但短信内容涉及到营销内容，则无法通过审核。要发送营销类短信请阅读 [营销短信](#营销短信)。

### 使用模板

假设提交的短信模板的类型为「通知类」，内容如下：

{% call docs.bubbleWrap() -%}
尊敬的的用户，您的订单号：{{ docs.mustache("order_id") }} 正在派送，请保持手机畅通，我们的快递员随时可能与您联系，感谢您的订阅。 
{% endcall %}

并且模板名称为 `Order_Notice`，并且为已经拥有了一个审核通过的签名叫做「天天商城」，签名的名称叫做 `sign_BuyBuyBuy` ，当模板通过审批后就可以调用如下代码发送这条通知类的短信：

```objc
AVShortMessageRequestOptions *options = [[AVShortMessageRequestOptions alloc] init];

options.templateName = @"Order_Notice";
options.signatureName = @"sign_BuyBuyBuy";
options.templateVariables = @{ @"order_id": @"7623432424540" }; // 使用实际的值来替换模板中的变量

[AVSMS requestShortMessageForPhoneNumber:@"186xxxxxxxx"
                                 options:options
                                callback:^(BOOL succeeded, NSError * _Nullable error) {
                                    if (succeeded) {
                                        /* 请求成功 */
                                    } else {
                                        /* 请求失败 */
                                    }
                                }];
```
```swift
let dic: LCDictionary = [
    "sign": LCString("sign_BuyBuyBuy"),
    "order_id": LCString("7623432424540")
]
LCSMSClient.requestShortMessage(mobilePhoneNumber: "186xxxxxxxx", templateName: "Order_Notice", variables: dic) { (result) in
    switch result {
    case .success:
        print("success")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVSMSOption option = new AVSMSOption();
option.setTemplateName("Order_Notice");
option.setSignatureName("sign_BuyBuyBuy");
Map<String, Object> parameters = new HashMap<String, Object>();
parameters.put("order_id", "7623432424540");      // 使用实际的值来替换模板中的变量
option.setEnvMap(parameters);
AVSMS.requestSMSCodeInBackground("186xxxxxxxx", option, new RequestMobileCodeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 请求成功 */
    } else {
      /* 请求失败 */
    }
  }
});
```
```javascript
AV.Cloud.requestSmsCode({
mobilePhoneNumber: '186xxxxxxxx',
template: 'Order_Notice',
sign:'sign_BuyBuyBuy'
order_id: '7623432424540'}).then(function(){
      //调用成功
    }, function(err){
      //调用失败
});
```
```cs
var env = new Dictionary<string,object>()
{
    {"order_id","7623432424540"}    // 使用实际的值来替换模板中的变量
};
AVCloud.RequestSMSCodeAsync("186xxxxxxxx","Order_Notice",env,"sign_BuyBuyBuy").ContinueWith(t =>
{
    var result = t.Result;
    // result 为 True 则表示调用成功
});
```
```java
Map<String, Object> parameters = new HashMap<String, Object>();
parameters.put("order_id", "7623432424540");      // 使用实际的值来替换模板中的变量
AVOSCloud.requestSMSCode("186xxxxxxxx", "Order_Notice", parameters);
```
```php
$options = [
  "template" => "Order_Notice",
  "name" => "sign_BuyBuyBuy",
  "order_id" => "7623432424540", // 使用实际的值来替换模板中的变量
];
SMS::requestSmsCode("186xxxxxxxx", $options);
```
```python
from leancloud import cloud
options = {
  "order_id": "7623432424540" # 使用实际的值来替换模板中的变量
}
cloud.request_sms_code("186xxxxxxxx",
  template="Order_Notice", sign="sign_BuyBuyBuy", params=options)
```

用户收到的内容如下：

{% call docs.bubbleWrap() -%}
【天天商城】尊敬的用户，您的订单号：7623432424540 正在派送，请保持手机畅通，我们的快递员随时可能与您联系，感谢您的订阅。
{% endcall %}

### 模板变量

模板可以使用<u>自定义变量</u>，在调用模板时以参数形式传入。模板语法遵循 [Handlebars](http://handlebarsjs.com) 规范。

{{ docs.alert("自定义变量的值不允许包含实心括号 `【】` 。") }}

在模板中还可以使用<u>系统预留变量</u>，在短信发送时，它们会被自动填充，开发者**无法**对其重新赋值：

{% call docs.bubbleWrap() -%}
欢迎注册{{ docs.mustache("name") }}应用！请使用验证码{{ docs.mustache("code") }}来完成注册。该验证码将在{{ docs.mustache("ttl") }}分钟后失效，请尽快使用。
{% endcall %}

- `name`：应用名称
- `code`：验证码（通知类和营销类不会包含）
- `ttl`：过期时间（默认为 10 分钟，最长可设置 30 分钟）
- `sign`：短信签名
- `template`：模板名称

### 内容规范

开发者在设置短信内容的时候，文字表述上应该做到规范、正确、简洁。鉴于开发者的应用场景各异，我们整理了以下范例来说明如何撰写规范的短信内容。需要再次强调，一切跟营销推广相关的短信模板，请在创建模板时务必选择**营销类**，否则将无法通过审核。

【正确范例】

{% call docs.bubbleWrap() -%}
XX房东您好，租客{{ docs.mustache("guest_name") }}（手机号码：{{ docs.mustache("guest_phone") }}）于{{ docs.mustache("payment_create_time") }}向您支付了房租。租金为{{ docs.mustache("rent_price") }}元，房屋地址在{{ docs.mustache("rent_addr") }}。请关注微信公众号：XX租房。XX租房APP下载地址：http://example.com/download.html
{% endcall %}

#### 链接

短信中的 URL 不允许**全部**设置为变量，这样是为了确保安全，防止病毒以及不良信息的传播。错误范例如下：

{% call docs.bubbleWrap() -%}
尊敬的会员您好，您的订单（订单号{{ docs.mustache("orderId") }}）已确认支付。5周年庆新品降价！大牌奢品上演底价争霸，低至2折！BV低至888元！阿玛尼低至199元！都彭长款钱包仅售499元！杜嘉班纳休闲鞋仅售1399元！周年庆家居专场千元封顶现已开启！{{ docs.mustache("download_link") }} 客服电话400-881-6609 回复TD退订
{% endcall %}

{{ docs.alert("以上通知内容包含了象 <u>打折</u>、<u>降价</u>、<u>仅售</u> 这类营销推广的敏感词语，容易导致审批无法通过，因此请谨慎使用或改用 [营销类短信](#营销短信)。") }}

但是 URL 中可以包含变量，比如：

{% call docs.bubbleWrap() -%}
亲，您的宝贝已上路，快递信息可以通过以下链接查询：http://www.sf-express.com/cn/#search/{{ docs.mustache("bill_number") }} 
{% endcall %}

#### 通知类模板

【正确范例】

{% call docs.bubbleWrap() -%}
恭喜您获得关注广州体彩微信送“排列三”的活动彩票，您的号码是第{{ docs.mustache("phase") }}期的：{{ docs.mustache("num") }}。开奖时间为{{ docs.mustache("date") }}，请关注公众号—开奖信息查询中奖状态。
{% endcall %}

〖错误范例〗

{% call docs.bubbleWrap() -%}
您好，本条短信来自“XX旅游”~恭喜幸运的您，在本次“北海道机票”抽奖活动中，获得二等奖——定制星巴克杯! 请您关注我们的微信公众号（XX旅游：xx_app)，回复“中奖名单”即可查看详细中奖名单及领取须知！后续还会有更多活动惊喜，期待您的参与~官方网站：xxsite.cn
{% endcall %}

错误点在于不可以在 [通知类短信](#通知短信) 模板中发送带有抽奖中奖信息等营销信息的内容。解决方案是**在创建模板的时候选择 [营销类短信](#营销短信)**。

另外，有一些行业相关的敏感词语是不允许发送的，错误范例如下：

{{ docs.bubble("业主还在苦苦等待你的反馈，你认领的房源已超过1小时没有填写核实结果，请尽快登录XX客户端，在“业主--待处理”列表中进行填写。【XX网】") }}

{{ docs.alert("无论是通知类还是营销类短信，凡包含<u>房源</u>、<u>借贷</u>这类敏感词都被禁止发送。") }}

#### 营销类模板

【正确范例 · 销售类】

{{ docs.bubble("X牌新款春装已经上市，明星夫妻同款你值得拥有！详情请咨询当地X牌门市店，或者直接登录 www.xxxx.com 查询门市店，或者拨打 010-00000000，凭短信可享 9 折优惠。") }}

【正确范例 · 推广类】

{{ docs.bubble("还在找寻同桌的 TA 吗？还在烦恼过年回家联系不上老同学吗？iOS 用户在 App Store 搜索：找同学，下载最新版的找同学，让同学聚会重温往日时光！") }}

注意：应用的下载链接必须是明文，不可设置为参数。

{% block sms_demo %}{% endblock %}

## 短信轰炸与图形验证码

短信在提供便利性和实用性的同时，也会受到攻击而被滥用，产生经济损失，甚至影响到品牌形象。「短信轰炸」就是最常见的一种攻击手段——恶意攻击者使用软件来自动收集一些不需要认证就能发送短信验证码的网站，利用这些网站的漏洞，攻击者能以程序化方式批量地向手机号重复发送短信，这样造成的后果就是：

- 对于网站来说，它会不断收到发送短信验证码的请求，运营者会承担更多的短信费用；
- 对手机号码的使用者来说，他会在短时间内频繁收到包含验证码的无关短信。

因此开发者需要重视对此类攻击的防范。目前，图形验证码（又称 captcha）是防范短信轰炸最有力的手段。比如，我们在一些网站注册的时候，经常需要填写以下图片的信息：

<img src="images/captcha.png" width="400" height="50">

网站必须在用户进行「免费获取验证码」 操作前，要求用户先输入图形验证码来确认操作真实有效，服务器端再请求 LeanCloud 云端发送动态短信到用户手机上，这样才可以有效防范恶意攻击者。

图形验证码的基本工作流程如下：

![sms_captcha_workflow](images/captcha-workflow.png)

- 用户在浏览器中打开产品的注册／登录页面，同时也会请求显示 LeanCloud 图形验证码。
- 用户按照要求填写各项信息，并点击发送短信验证码的按钮，进行图形验证码的验证。
- LeanCloud 图形验证码成功之后，发送短信验证码到目标手机号。
- 用户提交表单，产品后台将用户表单的短信验证码相关数据发送到 LeanCloud 后台进行二次校验。
- LeanCloud 后台返回校验通过／失败的结果，用户完成注册／登录流程。

### 开通图形验证码服务

要使用图形验证码，开发者需要进入 [控制台 > 设置 > 安全中心](/dashboard/app.html?appid={{appid}}#/security)，打开 **图形验证码服务**。 

如果希望强制所有的短信接口都必须通过图形验证码验证才能发送，则进入 [控制台 > 消息 > 短信 > 设置 > 短信选项](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf)， 选中 **强制短信验证服务使用图形验证码**。注意：这样一来，所有主动调用发送短信的接口都会强制进行图形验证码验证，否则会直接返回调用错误。


### 前端接入示例

我们以 JavaScript + HTML 实现如下一个很小的功能页面，演示图形验证码接入的流程。

<img src="https://blog.leancloud.cn/wp-content/uploads/2017/05/6ddb8c7a4767af7f1f911ca0fe801d2c-625x165.png" alt="" width="438" height="116" class="alignnone size-medium wp-image-5844" />

#### 组件初始化
引入 LeanCloud 图形验证码相关的 JavaScript：
```
  <script src="//cdn1.lncld.net/static/js/2.3.2/av-min.js"></script>
```

初始化图形验证码组件：
```
  AV.Captcha.request().then(function(captcha) {
    captcha.bind({
      textInput: 'captcha-code', // the id for textInput
      image: 'captcha-image',    // the id for image element
      verifyButton: 'verify',    // the id for verify button
    }, {
      success: function(validateCode) { 
        console.log('验证成功，下一步')
      },
      error: function(error) {
        console.error(error.message)
      },
    });
  });
```


#### 配置参数说明

`AV.Captcha.request()` 在生成 AV.Captcha 实例的时候，可以指定如下参数：

{{ sms.paramsRequestCaptcha() }}

例如可以这样初始化一个展示高度为 30px、宽度为 80px 的 captcha 实例：
<code>AV.Captcha.request({width: 80, height: 30})</code>

`captcha.bind()` 方法可以将 captcha 实例与界面元素绑定起来，它支持如下参数：

| 参数名          | 参数类型                     | 说明                       |
| ------------ | ------------------------ | ------------------------ |
| textInput    | <span style="white-space:nowrap;">string or HTMLInputElement</span> | 图形验证码的输入框控件，或者是该控件的 id   |
| image        | <span style="white-space:nowrap;">string or HTMLImageElement</span> | 图形验证码对应的图像控件，或者是图像控件的 id |
| <span style="white-space:nowrap;">verifyButton</span> | string or HTMLElement      | 验证图形验证码的按钮控件，或者是该按钮的 id  |


#### 完整示例
以下为上述 demo 的完整代码：

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>JS Bin</title>
  <!-- 引入 LeanCloud 图形验证码相关的 JavaScript -->
  <script src="//cdn1.lncld.net/static/js/2.3.2/av-min.js"></script>
</head>
<body>
  <span>手机号：</span>
  <input type="text" id="phone"/>
  <br/>
  <span>校验码：</span>
  <input type="text" id="captcha-code"/>
  <img id="captcha-image"/>
  <br/>
  <button id="verify">发送验证码</button>
</body>
<script>
  var appId = '{{appid}}';  // 你的应用 appid
  var appKey = '{{appkey}}'; // 你的应用 appkey
  AV.init({ appId: appId, appKey: appKey });

  // AV.Captcha.request() 默认生成一个 85x30px 的 AV.Captcha 实例
  AV.Captcha.request().then(function(captcha) {
    //在浏览器中，可以直接使用 captcha.bind 方法将验证码与 DOM 元素绑定：
    captcha.bind({
      textInput:    'captcha-code',  // the id for textInput
      image:        'captcha-image', // the id for image element
      verifyButton: 'verify',        // the id for verify button
    }, {
      success: function(validateCode) { 
        var phoneNumber = document.getElementById('phone').value;
        console.log('验证成功，下一步 send sms to phone:' + phoneNumber)
        AV.Cloud.requestSmsCode({
          mobilePhoneNumber: phoneNumber,
          name: '应用名称',
          validate_token: validateCode,
          op: '某种操作',
          ttl: 10
          }).then(function(){
            //发送成功
            console.log('发送成功')
          }, function(err){
            //发送失败
            console.log('发送失败。' + err.message)
        });
      },
      error: function(error) {
        console.error(error.message)
      },
    });
  });
</script>
</html>
```

### 图形验证码 API
#### 获取图形验证码

```objc
AVCaptchaRequestOptions *options = [[AVCaptchaRequestOptions alloc] init];

options.width = 100;
options.height = 50;

[AVCaptcha requestCaptchaWithOptions:options
                            callback:^(AVCaptchaDigest * _Nullable captchaDigest, NSError * _Nullable error) {
                                /* URL string of captcha image. */
                                NSString *url = captchaDigest.URLString;
                            }];
```
```android
AVCaptchaOption option = new AVCaptchaOption();
option.setWidth(85);
option.setHeight(30);
AVCaptcha.requestCaptchaInBackground(option, new AVCallback<AVCaptchaDigest>() {
  @Override
  protected void internalDone0(AVCaptchaDigest captchaDigest, AVException exception) {
    if (null == exception) {
      // 请求成功，可以通过 captchaDigest.getUrl() 获取图片
      }
    }
});
```
```javascript
AV.Captcha.request({
  width:100, // 图片的宽度
  height:50, // 图片的高度
}).then(function(captcha) {
  console.log(captcha.url); // 图片的 url，客户端用来展现
});
```
```cs
AVCloud.RequestCaptchaAsync(width:85, height:30).ContinueWith(t =>{
  var captchaData = t.Result;
  var url = captchaData.Url;// 图片的 url，客户端用来展现
  var captchaToken = captchaData.captchaToken;// 用来对应后面的验证接口，服务端用这个参数来匹配具体是哪一个图形验证码
});
```
```java
// Java SDK 暂不支持图形验证码
```
```php
// PHP SDK 暂不支持图形验证码
```
```python
from leancloud import cloud
captcha = cloud.request_captcha(width=100, height=50)
```

#### 校验图形验证码

获取图形验证码之后，将图形验证码的图像显示在客户端（iOS 和 Android 或者其他平台可以调用基础的图像控件展示该图片），等到用户输入完成之后，继续调用下一步的接口校验用户输入的是否合法。

```objc
[AVCaptcha verifyCaptchaCode:<#用户识别的符号#>
            forCaptchaDigest:<#之前请求的 AVCaptchaDigest 对象#>
                    callback:^(NSString * _Nullable validationToken, NSError * _Nullable error) {
                        /* validationToken 可用短信认证 */
                    }];
```
```android
AVCaptcha.verifyCaptchaCodeInBackground(code, captchaDigest, new AVCallback<String>() {
  @Override
  protected void internalDone0(String validateToken, AVException exception) {
    if (null == exception) {
      // 请求成功，validateToken 所请求的到的返回值
    }
  }
});
```
```javascript
// captcha 是上一步得到的验证码实例对象
captcha.verify('这里填写用户输入的图形验证码，例如 AM8N').then(function(validateToken) {});
```
```cs
AVCloud.VerifyCaptchaAsync("这里填写用户输入的图形验证码，例如 AM8N",'这里填写上一步返回的 captchaToken').CotinuteWith(t =>{
    var validate_token = result;
});
```
```java
// Java SDK 暂不支持图形验证码
```
```php
// PHP SDK 暂不支持图形验证码
```
```python
# captcha 是上一步得到的验证码实例对象
validate_token = captcha.verify("这里填写用户输入的图形验证码，例如 AM8N")
```

#### 使用 validate_token 发送短信

如果校验成功，拿到返回的 `validate_token`，继续调用发送短信的接口：

```objc
AVShortMessageRequestOptions *options = [[AVShortMessageRequestOptions alloc] init];
options.templateName = @"New_Series";
options.signatureName = @"sign_BuyBuyBuy";
options.validationToken = <#validationToken#>;

[AVSMS requestShortMessageForPhoneNumber:@"186xxxxxxxx"
                                 options:options
                                callback:^(BOOL succeeded, NSError * _Nullable error) {
                                    if (succeeded) {
                                        /* 请求成功 */
                                    } else {
                                        /* 请求失败 */
                                    }
                                }];
```
```android
AVSMSOption option = new AVSMSOption();
option.setTemplateName("New_Series");
option.setSignatureName("sign_BuyBuyBuy");
option.setValidationToken("validateToken");
AVSMS.requestSMSCodeInBackground("186xxxxxxxx", option, new RequestMobileCodeCallback() {
  @Override
  public void done(AVException e) {
    if (null == e) {
      /* 请求成功 */
    } else {
      /* 请求失败 */
    }
  }
});
```
```javascript
// mobilePhoneNumber ：手机号
// template ：模板名称
// sign ：签名 
AV.Cloud.requestSmsCode({
    mobilePhoneNumber: '186xxxxxxxx',
    template: 'New_Series',
    sign:'sign_BuyBuyBuy'
}，{
    validateToken:'上一步返回的 validate_token'
}).then(function(){
    //调用成功
}, function(err){
    //调用失败
});
```
```cs
// 186xxxxxxxx ：手机号
// New_Series ：模板名称
// sign_BuyBuyBuy ：签名 
AVCloud.RequestSMSCodeAsync("186xxxxxxxx","New_Series",null,"sign_BuyBuyBuy","上一步返回的 validate_token").ContinueWith(t =>
{
    var result = t.Result;
    // result 为 True 则表示调用成功
});
```
```java
// Java SDK 暂不支持图形验证码
```
```php
// PHP SDK 暂不支持图形验证码
```
```python
from leancloud import cloud
options = { "validate_token": validate_token }
cloud.request_sms_code("186xxxxxxxx",
  template="New_Series", sign="sign_BuyBuyBuy", params=options)
```

## 国际短信

向国外用户发送短信，只需要在手机号码前加上正确的国际区号即可，如美国和加拿大为 `+1`，当然前提是已在 [短信设置](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 中选中了 **开启国际短信服务**。中国区号为 `+86`，但可以省略，无区号的手机号码会默认使用中国区号。

{# 被 https://blog.leancloud.cn/4818/ 引用，修改标题时注意更新博客链接 #}
### 服务覆盖区域和价格

<a id="pricing"></a>以下金额为每条短信的价格，以人民币计费。列表中未包含的国家或区域，请在论坛或工单中提问确认。

<script src="custom/js/lib/jquery.dataTables.min.js"></script>

<script type="text/javascript">
var smsPrices = [{"CountryNumber":1,"CountryOrRegion":"美国","CountryCode":"US","UnitPrice":0.07},
{"CountryNumber":1,"CountryOrRegion":"加拿大","CountryCode":"CA","UnitPrice":0.07},
{"CountryNumber":7,"CountryOrRegion":"哈萨克斯坦","CountryCode":"KZ","UnitPrice":0.85},
{"CountryNumber":7,"CountryOrRegion":"俄罗斯","CountryCode":"RU","UnitPrice":0.85},
{"CountryNumber":27,"CountryOrRegion":"南非","CountryCode":"ZA","UnitPrice":0.23},
{"CountryNumber":30,"CountryOrRegion":"希腊","CountryCode":"GR","UnitPrice":0.5},
{"CountryNumber":33,"CountryOrRegion":"法国","CountryCode":"FR","UnitPrice":0.64},
{"CountryNumber":34,"CountryOrRegion":"西班牙","CountryCode":"ES","UnitPrice":0.75},
{"CountryNumber":39,"CountryOrRegion":"意大利","CountryCode":"IT","UnitPrice":0.75},
{"CountryNumber":40,"CountryOrRegion":"罗马尼亚","CountryCode":"RO","UnitPrice":0.62},
{"CountryNumber":44,"CountryOrRegion":"英国","CountryCode":"GB","UnitPrice":0.35},
{"CountryNumber":49,"CountryOrRegion":"德国","CountryCode":"DE","UnitPrice":0.72},
{"CountryNumber":52,"CountryOrRegion":"墨西哥","CountryCode":"MX","UnitPrice":0.42},
{"CountryNumber":54,"CountryOrRegion":"阿根廷","CountryCode":"AR","UnitPrice":0.59},
{"CountryNumber":55,"CountryOrRegion":"巴西","CountryCode":"BR","UnitPrice":0.48},
{"CountryNumber":57,"CountryOrRegion":"哥伦比亚","CountryCode":"CO","UnitPrice":0.55},
{"CountryNumber":58,"CountryOrRegion":"委内瑞拉","CountryCode":"VE","UnitPrice":0.41},
{"CountryNumber":60,"CountryOrRegion":"马来西亚","CountryCode":"MY","UnitPrice":0.34},
{"CountryNumber":61,"CountryOrRegion":"澳大利亚","CountryCode":"AU","UnitPrice":0.48},
{"CountryNumber":62,"CountryOrRegion":"印度尼西亚","CountryCode":"ID","UnitPrice":0.25},
{"CountryNumber":63,"CountryOrRegion":"菲律宾","CountryCode":"PH","UnitPrice":0.37},
{"CountryNumber":65,"CountryOrRegion":"新加坡","CountryCode":"SG","UnitPrice":0.43},
{"CountryNumber":66,"CountryOrRegion":"泰国","CountryCode":"TH","UnitPrice":0.34},
{"CountryNumber":81,"CountryOrRegion":"日本","CountryCode":"JP","UnitPrice":0.68},
{"CountryNumber":82,"CountryOrRegion":"韩国","CountryCode":"KR","UnitPrice":0.4},
{"CountryNumber":86,"CountryOrRegion":"中国","CountryCode":"CN","UnitPrice":0.05},
{"CountryNumber":90,"CountryOrRegion":"土耳其","CountryCode":"TR","UnitPrice":0.25},
{"CountryNumber":92,"CountryOrRegion":"巴基斯坦","CountryCode":"PK","UnitPrice":0.22},
{"CountryNumber":91,"CountryOrRegion":"印度","CountryCode":"IN","UnitPrice":0.09},
{"CountryNumber":95,"CountryOrRegion":"缅甸","CountryCode":"MM","UnitPrice":1.1},
{"CountryNumber":351,"CountryOrRegion":"葡萄牙","CountryCode":"PT","UnitPrice":0.43},
{"CountryNumber":852,"CountryOrRegion":"香港","CountryCode":"HK","UnitPrice":0.53},
{"CountryNumber":853,"CountryOrRegion":"澳门","CountryCode":"MO","UnitPrice":0.27},
{"CountryNumber":855,"CountryOrRegion":"柬埔寨","CountryCode":"KH","UnitPrice":0.93},
{"CountryNumber":856,"CountryOrRegion":"老挝","CountryCode":"LA","UnitPrice":0.68},
{"CountryNumber":886,"CountryOrRegion":"台湾","CountryCode":"TW","UnitPrice":0.46},
{"CountryNumber":960,"CountryOrRegion":"马尔代夫","CountryCode":"MV","UnitPrice":0.11},
{"CountryNumber":966,"CountryOrRegion":"沙特阿拉伯","CountryCode":"SA","UnitPrice":0.31},
{"CountryNumber":971,"CountryOrRegion":"阿拉伯联合酋长国","CountryCode":"AE","UnitPrice":0.27},
{"CountryNumber":977,"CountryOrRegion":"尼泊尔","CountryCode":"NP","UnitPrice":0.73},
{"CountryNumber":998,"CountryOrRegion":"乌兹别克斯坦","CountryCode":"UZ","UnitPrice":0.73}];
var nodes = [{ code: "cn", name: "华北节点"},{ code: "tab", name: "华东节点"  },{ code: "us", name: "美国节点"  }];

for (var j = 0; j < smsPrices.length; j++){
    smsPrices[j].nodes = {};
    for (var i = 0; i < nodes.length; i++){
        // console.log(nodes[i].code, smsPrices[j]['nodes']);
        smsPrices[j]['nodes'][nodes[i]['code']] = smsPrices[j]['UnitPrice'];
        if (nodes[i].code === 'us' && smsPrices[j].CountryCode === 'CN') {
            smsPrices[j].nodes.us = 0.2
        }
    }
}
</script>

<table class="datatable" cellspacing="0" cellpadding="0" width="100%" style="margin-top: 12px;">
    <thead>
        <tr>
            <th>国号</th>
            <th>国家或地区</th>
            <th>国家代号</th>
            <th>华北节点</th>
            <th>华东节点</th>
            <th>美国节点</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>

<script type="text/javascript">
$(document).ready(function() {
    var smsPriceTable = $('.datatable').DataTable({
        data: smsPrices,
        // disable pagination
        paging: false,
        info: false,
        ordering: false,
        language: {
            zeroRecords: '没有找到匹配数据。',
            search: '过滤：'
        },
        columns: [
            { "data": "CountryNumber" },
            { "data": "CountryOrRegion" },
            { "data": "CountryCode" },
            { "data": "nodes.cn" },
            { "data": "nodes.tab" },
            { "data": "nodes.us" }
        ],
        columnDefs: [
            { 
                targets: [3, 4, 5], 
                className: 'text-right', 
                render: function(data, type, row, meta){
                    // &yen; &#165;
                    return '<span class="text-muted" style="opacity: 0.5; padding-right: 4px;">&#65509;</span> ' + data.toFixed(2)
                }
            }
        ]
    });
    // style global filter
    $('.dataTables_filter')
        .find('label')
            .css({
                "display": "flex",
                "white-space":  "nowrap",
                "align-items":  "center"
            })
        .find('input')
            .addClass('form-control input-sm')
            .css({
                "flex-basis": '200px'
            });
} );
</script>

### 开通国际短信服务
国际短信服务是需要额外开启的，你需要在 [控制台 > 消息 > 短信 > 设置 > 短信选项](/dashboard/messaging.html?appid={{appid}}#/message/sms/conf) 进行选择。

{{ include.checkbox() }}**开启国际短信服务**
- 开启：可以向中国大陆以外的手机号发送短信，详见 [覆盖国家和地区](#短信服务覆盖区域)。
- 关闭：无法向中国大陆 +86 之外的手机号发送短信。

## 与 LeanCloud 账户系统集成
LeanCloud 提供了内建的 [账户系统](leanstorage_guide-js.html#用户) 来帮助开发者快速完成用户系统的注册、登录、重置密码等功能，同时为了方便使用，我们也集成了账户系统手机号码相关的短信功能，譬如账户注册时自动验证手机号、手机号码登录和重置密码等等。

我们可以在 [控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf) 查看相关选项：

{{ include.checkbox(true) }}**用户注册时，向注册手机号码发送验证短信**
- 开启：调用 AVUser 注册相关的接口时，如果传入了手机号，系统则会自动发送验证短信，然后开发者需要手动调用一下验证接口，这样 `_User` 表中的 `mobilePhoneVerified` 值才会被置为 `true`。
- 关闭：调用 AVUser 注册相关的接口不会发送短信。

{{ include.checkbox() }}**未验证手机号码的用户，禁止登录**
- 开启：未验证手机号的 `AVUser` 不能使用「手机号 + 密码」以及「手机号 + 短信验证码」的方式登录，但是<u>用户名搭配密码的登录方式不会失败</u>。
- 关闭：不会对登录接口造成任何影响。

{{ include.checkbox() }}**未验证手机号码的用户，允许以短信重置密码** 
- 开启：允许尚未验证过手机号的 `AVUser` 通过短信验证码实现重置密码的功能。
- 关闭：`AVUser` 必须在使用短信重置密码之前，先行验证手机号，也就是 `mobilePhoneVerified` 字段必须是 `true` 的前提下，才能使用短信重置密码。

{{ include.checkbox() }}**已验证手机号码的用户，允许以短信验证码登录**
- 开启：`AVUser` 可以使用手机号搭配短信验证码的方式登录。
- 关闭：`AVUser` 不能直接使用。

下面以「注册验证」为例，详细说明一下如何在注册过程中自动使用短信服务。

### 注册验证

现在越来越多的应用支持使用手机号码来快速注册账户，并且同时会通过短信验证码来核实用户手机号码的有效性。下面我们来看看如何便捷地使用 LeanCloud 的「注册验证」功能。其使用步骤如下：

1. **用户输入手机号以及密码**  
  引导用户正确的输入，建议在调用 SDK 接口之前，验证一下手机号的格式。

2. **调用 AVUser 的注册接口，传入手机号以及密码。**  

```objc
AVUser *user = [AVUser user];
user.username = @"hjiang";
user.password =  @"f32@ds*@&dsa";
user.email = @"hang@leancloud.rocks";
user.mobilePhoneNumber = @"186xxxxxxxx";
[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        // 注册成功
    } else {
        // 注册失败
    }
}];
```
```swift
let user = LCUser()
user.username = LCString("hjiang")
user.password = LCString("f32@ds*@&dsa")
user.email = LCString("hang@leancloud.rocks")
user.mobilePhoneNumber = LCString("186xxxxxxxx")
user.signUp()
```
```android
AVUser user = new AVUser();
user.setUsername("hjiang");
user.setPassword("f32@ds*@&dsa");
user.setEmail("hang@leancloud.rocks");
// 其他属性可以像其他AVObject对象一样使用put方法添加
user.put("mobilePhoneNumber", "186-1234-0000");
user.signUpInBackground(new SignUpCallback() {
    public void done(AVException e) {
        if (e == null) {
            // successfully
        } else {
            // failed
        }
    }
});
```
```javascript
var user = new AV.User();
user.set("username", "hjiang");
user.set("password", "123456");
user.setMobilePhoneNumber('186xxxxxxxx');
user.signUp(null, ……)
```
```cs
var user = new AVUser();
user.Username = "hjiang";
user.Password = "123456ZXCV";
user.MobilePhoneNumber = "186xxxxxxxx";
user.SignUpAsync().ContinueWith(t =>
{
    // 注册成功之后云端会自动发送验证短信
});
```
```java
// Java SDK 与 Android 代码相同
```
```php
$user = new User();
$user->setUsername("hjiang");
$user->setPassword("f32@ds*@&dsa");
$user->setMobilePhoneNumber("186xxxxxxxx");
$user->signUp();
```
```python
import leancloud

user = leancloud.User()
user.set_username("hjiang")
user.set_password("f32@ds*@&dsa")
user.set_mobile_phone_number("186xxxxxxxx")
user.sign_up()
```

3. **云端发送手机验证码，并且返回注册成功**。但是此时用户的 `mobilePhoneVerified` 依然是 `false`，客户端需要引导用户去输入验证码。   
  
4. **用户再一次输入验证码**  
  最好本地先验证一下有效性（例如长度、特殊字符等）。
  
5. **调用验证接口，检查用户输入的纯数字验证码是否合法。**

```objc
[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
    //验证结果
}];
```
```swift
LCUser.verifyMobilePhoneNumber("186xxxxxxxx", verificationCode: "123456") { (result) in
   //验证结果
}
```
```android
AVUser.verifyMobilePhoneInBackground("123456", new AVMobilePhoneVerifyCallback() {
    @Override
    public void done(AVException e) {
        if(e == null){
            // 验证成功
        } else {
            Log.d("SMS", "Verified failed!");
        }
    }
});
```
```javascript
AV.User.verifyMobilePhone('6位数字验证码').then(function(){
//验证成功
}, function(err){
//验证失败
});
```
```cs
AVUser.VerifyMobilePhoneAsync("6位数字验证码", "186xxxxxxxx").ContinueWith(t =>
    {
        if (t.Result)
        {
            // 验证成功
        }
    });
```
```java
// Java SDK 与 Android 代码相同
```
```php
User::verifyMobilePhone("6位数字验证码");
```
```python
from leancloud import user
user.verify_mobile_phone_number("6位数字验证码")
```

以上是一个通用的带有手机号验证的注册过程。开发者可以根据需求增加或减少步骤，但是推荐开发者在使用该功能时，首先明确是否需要勾选「验证注册用户手机号码」。因为一旦勾选，只要调用了 AVUser 相关的注册账号，并传入手机号，云端就会自动发送短信验证码。

{{ docs.note("注意：只有使用了 LeanCloud 内建账户系统的应用才能使用这一功能。") }}

另外，假如注册的时候并没有强制用户验证手机号，而是在用户使用某一个功能的时候，要求用户验证手机号，也可以调用接口进行「延迟验证」，验证之后 `mobilePhoneVerified` 就会被置为 `true`。

1. **请求发送验证码**    

```objc
[AVUser requestMobilePhoneVerify:@"186xxxxxxxx" withBlock:^(BOOL succeeded, NSError *error) {
if(succeeded){
    //调用成功
}
}];
```
```swift
LCUser.requestVerificationCode(mobilePhoneNumber: "186xxxxxxxx") { (result) in
	switch result {
    case .success:
        print("调用成功")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVUser.requestMobilePhoneVerifyInBackground("186xxxxxxxx", new RequestMobileCodeCallback() {
    @Override
    public void done(AVException e) {
        if(e == null){
            // 调用成功
        } else {
            Log.d("SMS", "Send failed!");
        }
    }
});
```
```javascript
AV.User.requestMobilePhoneVerify('186xxxxxxxx').then(function(){
    //调用成功
}, function(err){
    //调用失败
});
```
```cs
AVUser.RequestMobilePhoneVerifyAsync("186xxxxxxxx").ContinueWith(t =>
{
    if(t.Result)
    {
        // 调用成功
    }
});
```
```java
// Java SDK 与 Android 代码相同
```
```php
User::requestMobilePhoneVerify("186xxxxxxxx");
```
```python
from leancloud import cloud
cloud.request_mobile_phone_verify("186xxxxxxxx")
```

2. **调用验证接口，验证用户输入的纯数字的验证码。** 

```objc
[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //验证成功
    }
}];
```
```swift
LCUser.verifyMobilePhoneNumber("186xxxxxxxx", verificationCode: "123456") { (result) in
    switch result {
    case .success:
        print("验证成功")
    case .failure(error: let error):
        print(error)
    }
}
```
```android
AVUser.verifyMobilePhoneInBackground("654321", new AVMobilePhoneVerifyCallback() {
    @Override
    public void done(AVException e) {
        if (e == null) {
            // 验证成功
        } else {
            Log.d("SMS", "Verified failed!");
        }
    }
});
```
```javascript
AV.User.verifyMobilePhone('6位数字验证码').then(function(){
    //验证成功
}, function(err){
    //验证失败
});
```
```cs
AVUser.VerifyMobilePhoneAsync("6位数字验证码").ContinueWith(t =>
    {
        if (t.Result)
        {
            // 验证成功
        }
    });
```
```java
// Java SDK 与 Android 代码相同
```
```php
User::verifyMobilePhone("6位数字验证码");
```
```python
from leancloud import cloud
cloud.verify_mobile_phone_number("6位数字验证码")
```

#### 未收到注册验证短信

一般来说，用户收到的注册验证短信内容为：

{{ docs.bubble("【Signature】欢迎使用“应用名称”服务，您的验证码是 123456，请输入完成验证。") }}

其中【Signature】为短信签名，必须遵循 [短信签名规范](#短信签名) 中的长度及其他要求，否则会被短信供应商拒绝发送。


## 常见问题

详情请参照 [短信收发常见问题一览](rest_sms_api.html#常见问题_FAQ)。


### 短信计费

如果一个短信模板字数超过 70 个字（包括签名的字数），那么该短信在发送时会被运营商<u>按多条来收取费用</u>，但接收者收到的仍是<u>一条完整的短信</u>。

- 小于或等于 70 个字，按一条计费。
- 中英文标点算作一个字符。
- 超过 70 个字符则按照 67 个字符来计算条数，最长可发 400 字。
- 最长的 400 字符的短信收费计算公式为：400/67 = 5.9， 也就是要扣 6 条短信费用。

只有「调用失败」不收费，「投递失败」也要收费。每条短信的收费标准请参考 [官网价格方案](/pricing)。

### 短信购买

短信发送采取实时扣费。如果当前账户没有足够的余额，短信将无法发送。充值请进入 [开发者账户 > 财务 > 财务概况](/dashboard/bill.html#/bill/general)，点击 **余额充值**。

同时我们建议设定好 [余额告警](/dashboard/settings.html#/setting/alert)，以便在第一时间收到短信或邮件获知余额不足。
