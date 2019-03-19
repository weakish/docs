{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

# 四，详解消息 hook 与系统对话，打造自己的聊天机器人

## 本章导读

在前一章 [安全与签名、黑名单和权限管理、玩转聊天室和临时对话](realtime-guide-senior.html) 中，我们解释了一些第三方鉴权以及成员权限设置方面的问题，在这里我们会更进一步，给大家说明：

- 即时通讯的消息 Hook 机制
- 系统对话的使用方法
- 如何结合消息 Hook 与系统对话来实现一个聊天机器人

## 万能的 Hook 机制

完全开放的架构，支持强大的业务扩展能力，是 LeanCloud 即时通讯服务的特色之一，这种优势的体现就是这里将要给大家介绍的「Hook 机制」。 

什么是「Hook」？Hook 也可以称为「钩子」，是一种特殊的消息处理机制，与 Windows 平台下的中断机制类似，允许应用方拦截并处理即时通讯过程中的多种事件和消息，从而达到实现自定义业务逻辑的目的。我们支持两类 Hook API：

### 消息 Hook

一条消息，在即时通讯的流程中，从终端用户 A 发送开始，到其他用户接收到为止，考虑到存在接收方在线/不在线的可能，会经历多个不同阶段，这里每一个阶段都会触发 Hook 函数：

* **_messageReceived**<br/>
  消息达到服务器，群组成员已解析完成之后，发送给收件人之前调用。开发者在这里还可以修改消息内容，实时改变消息接收者的列表，以及其他类似操作。
* **_messageSent**<br/>
  消息发送完成后调用。开发者在这里可以完成业务统计，或将消息中转备份到己方服务器，以及其他类似操作。
* **_receiversOffline**<br/>
  消息发送完成，存在离线的收件人，在发推送给收件人之前调用。开发者在这里可以动态修改离线推送的通知内容，或通知目的设备的列表，以及其他类似操作。
* **_messageUpdate**<br/>
  收到消息修改请求，发送修改后的消息给收件人之前调用。与新发消息一样，开发者在这里可以再次修改消息内容，实时改变消息接收者的列表，以及其他类似操作。

### 对话 Hook

在对话创建和成员变动等更改性操作前后，都可以触发 Hook 函数，进行额外的处理：

* **_conversationStart**<br/>
  创建对话，在签名校验（如果开启）之后，实际创建之前调用。开发者在这里可以为新的「对话」添加其他内部属性，或完成操作鉴权，以及其他类似操作。
* **_conversationStarted**<br/>
  创建对话完成后调用。开发者在这里可以完成业务统计，或将对话数据中转备份到己方服务器，以及其他类似操作。
* **_conversationAdd**<br/>
  向对话添加成员，在签名校验（如果开启）之后，实际加入之前调用，包括主动加入和被其他用户加入两种情况。开发者可以在这里根据内部权限设置批准或驳回这一请求，以及其他类似操作。
* **_conversationRemove**<br/>
  从对话中踢出成员，在签名校验（如果开启）之后，实际踢出之前调用，用户自己退出对话不会调用。开发者可以在这里根据内部权限设置批准或驳回这一请求，以及其他类似操作。
* **_conversationUpdate**<br/>
  修改对话属性、设置或取消对话消息提醒，在实际修改之前调用。开发者在这里可以为新的「对话」添加其他内部属性，或完成操作鉴权，以及其他类似操作。

### Hook 与云引擎的关系

因为 Hook 发生在即时通讯的在线处理环节，而即时通讯服务端每秒钟需要处理的消息和对话事件数量远超大家的想象，出于性能考虑，我们要求开发者使用 [LeanCloud 云引擎](leanengine_overview.html) 来实现 Hook 函数，为此我们也提供了多种服务端 SDK 供大家选择：

- [Node.js 开发指南](leanengine_cloudfunction_guide-node.html#即时通讯 Hook 函数)
- [Python SDK 开发指南](leanengine_cloudfunction_guide-python.html#即时通讯 Hook 函数)
- [Java SDK 开发指南](leanengine_cloudfunction_guide-java.html#即时通讯 Hook 函数)
- [PHP SDK 开发指南](leanengine_cloudfunction_guide-php.html#即时通讯 Hook 函数)

即时通讯的云引擎 Hook 要求云引擎部署在云引擎的 **生产环境**，测试环境仅用于开发者手动调用测试。由于缓存的原因，首次部署的云引擎 Hook 需要至多三分钟来正式生效，后续修改会实时生效。

### Hook API 细节与使用场景详解

示例应用 [LeanChat](https://github.com/leancloud/leanchat-android) 也用了云引擎 Hook 功能来自定义消息推送，通过解析上层消息协议获取消息类型和内容，以 `fromPeer` 得到发送者的名称，组装成 `pushMessage`，这样能使推送通知的用户体验更好。可参考 [leanchat-cloudcode 代码](https://github.com/leancloud/leanchat-cloudcode/blob/master/cloud.js)。

与 `conversation` 相关的 hook 可以在应用签名之外增加额外的权限判断，控制对话是否允许被建立、某些用户是否允许被加入对话等。你可以用这一 hook 实现黑名单功能。

#### `_messageReceived`

这个 hook 发生在消息到达 LeanCloud 云端之后。如果是群组消息，我们会解析出所有消息收件人。

你可以通过返回参数控制消息是否需要被丢弃，删除个别收件人，还可以修改消息内容，例如过滤应用中的敏感词（[示例](leanengine_cloudfunction_guide-node.html#onIMMessageReceived)）。返回空对象（`response.success({})`）则会执行系统默认的流程。

<div class="callout callout-info">请注意，在这个 hook 的代码实现的任何分支上 **请确保最终会调用 `response.success` 返回结果**，使得消息可以尽快投递给收件人。这个 hook 将 **阻塞发送流程**，因此请尽量减少无谓的代码调用，提升效率。</div>

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [即时通讯 REST API 指南 · 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

参数：

参数 | 说明
--- | ---
`fromPeer` | 消息发送者的 ID。
`convId` | 消息所属对话的 ID。
`toPeers` | 解析出的对话相关的 `clientId`。
`transient` | 是否是 transient 消息。
`bin` | 原始消息内容是否为二进制消息。
`content` | 消息体字符串。如果 `bin` 为 `true`，则该字段为原始消息内容做 Base64 转码后的结果。
`receipt` | 是否要求回执。
`timestamp` | 服务器收到消息的时间戳（毫秒）。
`system` | 是否属于系统对话消息。
`sourceIP` | 消息发送者的 IP。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`drop` | 可选 | 如果返回真值，消息将被丢弃。
`code` | 可选 | 当 `drop` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `drop` 为 `true` 时可以下发一个应用自定义的错误说明字符串。
`bin` | 可选 | 返回的 `content` 内是否为二进制消息，如果不提供则为请求中的 `bin` 值。
`content` | 可选 | 修改后的 `content`，如果不提供则保留原消息。如果 `bin` 为 `true`，则 `content` 需要是二进制消息内容做 Base64 转码后的结果。
`toPeers` | 可选 | 数组，修改后的收件人，如果不提供则保留原收件人。

示例代码：

```js
AV.Cloud.onIMMessageReceived((request) => {
    // request.params = {
    //     fromPeer: 'Tom',
    //     receipt: false,
    //     groupId: null,
    //     system: null,
    //     content: '{"_lctext":"来我们去XX传奇玩吧","_lctype":-1}',
    //     convId: '5789a33a1b8694ad267d8040',
    //     toPeers: ['Jerry'],
    //     __sign: '1472200796787,a0e99be208c6bce92d516c10ff3f598de8f650b9',
    //     bin: false,
    //     transient: false,
    //     sourceIP: '121.239.62.103',
    //     timestamp: 1472200796764
    // };

    let content = request.params.content;
    console.log('content', content);
    let processedContent = content.replace('XX传奇', '**');
    // 必须含有以下语句给服务端一个正确的返回，否则会引起异常
  return {
    content: processedContent
  };
});
```
```python
@engine.define
def _messageReceived(**params):
    # params = {
    #     'fromPeer': 'Tom',
    #     'receipt': false,
    #     'groupId': null,
    #     'system': null,
    #     'content': '{"_lctext":"来我们去XX传奇玩吧","_lctype":-1}',
    #     'convId': '5789a33a1b8694ad267d8040',
    #     'toPeers': ['Jerry'],
    #     '__sign': '1472200796787,a0e99be208c6bce92d516c10ff3f598de8f650b9',
    #     'bin': false,
    #     'transient': false,
    #     'sourceIP': '121.239.62.103',
    #     'timestamp': 1472200796764,
    # }
    print('_messageReceived start')
    content = json.loads(params['content'])
    text = content._lctext
    print('text:', text)
    processed_content = text.replace('XX传奇', '**')
    print('_messageReceived end')
    # 必须含有以下语句给服务端一个正确的返回，否则会引起异常
    return {
        'content': processed_content,
    }
```
```php
Cloud::define("_messageReceived", function($params, $user) {
    // params = {
    //     fromPeer: 'Tom',
    //     receipt: false,
    //     groupId: null,
    //     system: null,
    //     content: '{"_lctext":"来我们去XX传奇玩吧","_lctype":-1}',
    //     convId: '5789a33a1b8694ad267d8040',
    //     toPeers: ['Jerry'],
    //     __sign: '1472200796787,a0e99be208c6bce92d516c10ff3f598de8f650b9',
    //     bin: false,
    //     transient: false,
    //     sourceIP: '121.239.62.103',
    //     timestamp: 1472200796764
    // };

    error_log('_messageReceived start');
    $content = json_decode($params["content"], true);
    $text = $content["_lctext"];
    error_log($text);
    $processedContent = preg_replace("XX传奇", "**", $text);
    return array("content" => $processedContent);
});
```
```java
@IMHook(type = IMHookType.messageReceived)
  public static Map<String, Object> onMessageReceived(Map<String, Object> params) {
    // 打印整个 Hook 函数的参数
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    // 获取消息内容
    String content = (String)params.get("content");
    // 转化成 Map 格式
    Map<String,Object> contentMap = (Map<String,Object>)JSON.parse(content);
    // 读取文本内容
    String text = (String)(contentMap.get("_lctext").toString());
    // 过滤广告内容
    String processedContent = text.replace("XX中介", "**");
    // 将过滤之后的内容发还给服务端
    result.put("content",processedContent);
    return result;
  }
```

而实际上启用上述代码之后，一条消息的时序图如下：

```seq
SDK->RTM: 1. 发送消息
RTM-->Engine: 2. 触发 _messageReceived hook 调用
Engine-->RTM: 3. 返回 hook 函数处理结果
RTM-->SDK: 4. 将 hook 函数处理结果发送给接收方
```

- 上图假设的是对话所有成员都在线，而如果有成员不在线，流程有些不一样，下一节会做介绍。
- RTM 表示即时通讯服务集群，Engine 表示云引擎服务集群，它们基于内网通讯。

#### `_receiversOffline`

这个 hook 发生在有收件人离线的情况下，你可以通过它来自定义离线推送行为，包括推送内容、被推送用户或略过推送。你也可以直接在 hook 中触发自定义的推送。发往暂态对话的消息不会触发此 hook。

参数：

参数 | 说明
--- | ---
`fromPeer` | 消息发送者 ID。
`convId` | 消息所属对话的 ID。
`offlinePeers` | 数组，离线的收件人列表。
`content` | 消息内容。
`timestamp` | 服务器收到消息的时间戳（毫秒）。
`mentionAll` | 布尔类型，表示本消息是否 @ 了所有成员。
`mentionOfflinePeers` | 被本消息 @ 且离线的成员 ID。如果 `mentionAll` 为 `true`，则该参数为空，表示所有 `offlinePeers` 参数内的成员全部被 @。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`skip` | 可选 | 如果为真将跳过推送（比如已经在云引擎里触发了推送或者其他通知）。
`offlinePeers`| 可选 | 数组，筛选过的推送收件人。
`pushMessage` | 可选 | 推送内容，支持自定义 JSON 结构。
`force` | 可选 | 如果为真将强制推送给 `offlinePeers` 里 `mute` 的用户，默认 `false`。

示例代码：

```js
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
```python
@engine.define
def _receiversOffline(**params):
    print('_receiversOffline start')
    # params['content'] 为消息内容
    content = params['content']
    short_content = content[:6]
    print('short_content:', short_content)
    payloads = {
        # 自增未读消息的数目，不想自增就设为数字
        'badge': 'Increment',
        'sound': 'default',
        # 使用开发证书
        '_profile': 'dev',
        'alert': short_content,
    }
    print('_receiversOffline end')
    return {
        'pushMessage': json.dumps(payloads),
    }
```
```php
Cloud::define('_receiversOffline', function($params, $user) {
    error_log('_receiversOffline start');
    // content 为消息的内容
    $shortContent = $params["content"];
    if (strlen($shortContent) > 6) {
        $shortContent = substr($shortContent, 0, 6);
    }

    $json = array(
        // 自增未读消息的数目，不想自增就设为数字
        "badge" => "Increment",
        "sound" => "default",
        // 使用开发证书
        "_profile" => "dev",
        "alert" => shortContent
    );

    $pushMessage = json_encode($json);
    return array(
        "pushMessage" => $pushMessage,
    );
});
```
```java
@IMHook(type = IMHookType.receiversOffline)
  public static Map<String, Object> onReceiversOffline(Map<String, Object> params) {
    String alert = (String)params.get("content");
    if(alert.length() > 6){
      alert = alert.substring(0, 6);
    }
    System.out.println(alert);
    Map<String, Object> result = new HashMap<String, Object>();
    JSONObject object = new JSONObject();
    object.put("badge", "Increment");
    object.put("sound", "default");
    object.put("_profile", "dev");
    object.put("alert", alert);
    result.put("pushMessage", object.toString());
    return result;
}
```

#### `_messageSent`

在消息发送完成后执行，对消息发送性能没有影响，可以用来执行相对耗时的逻辑。

参数：

参数 | 说明
--- | ---
`fromPeer` | 消息发送者的 ID。
`convId` | 消息所属对话的 ID。
`msgId` | 消息 ID。
`onlinePeers`	| 当前在线发送的用户 ID。
`offlinePeers` | 当前离线的用户 ID。
`transient`	| 是否是 transient 消息。
`system` | 是否是 system conversation。
`bin` | 是否是二进制消息。
`content`	| 消息体字符串。
`receipt`	| 是否要求回执。
`timestamp`	| 服务器收到消息的时间戳（毫秒）。
`sourceIP` | 消息发送者的 IP。

返回值：

这个 hook 不会对返回值进行检查。只需返回 `{}` 即可。

示例代码：

下面代码演示了日志记录相关的操作（在消息发送完后，在云引擎中打印一下日志）：

```js
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
```python
@engine.define
def _messageSent(**params):
    print('_messageSent start')
    print('params:', params)
    print('_messageSent end')
    return {}

# 在云引擎中打印的日志如下：
# _messageSent start
# params: {'__sign': '1472703266575,30e1c9b325410f96c804f737035a0f6a2d86d711',
#  'bin': False,
#  'content': '12345678',
#  'convId': '5789a33a1b8694ad267d8040',
#  'fromPeer': 'Tom',
#  'msgId': 'fptKnuYYQMGdiSt_Zs7zDA',
#  'offlinePeers': ['Jerry'],
#  'onlinePeers': [],
#  'receipt': False,
#  'sourceIP': '114.219.127.186',
#  'timestamp': 1472703266522,
#  'transient': False}
# _messageSent end
```
```php
Cloud::define('_messageSent', function($params, $user) {
    error_log('_messageSent start');
    error_log('params' . json_encode($params));
    return array();

    // 在云引擎中打印的日志如下：
    // _messageSent start
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
```java
@IMHook(type = IMHookType.messageSent)
  public static Map<String, Object> onMessageSent(Map<String, Object> params) {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    // ...
    return result;
}
```

#### `_messageUpdate`

这个 hook 发生在修改消息请求到达 LeanCloud 云端，LeanCloud 云端正式修改消息之前。

你可以通过返回参数控制修改消息请求是否需要被丢弃，删除个别收件人，或再次修改这个修改消息请求中的消息内容。

<div class="callout callout-info">请注意，在这个 hook 的代码实现的任何分支上 **请确保最终会调用 `response.success` 返回结果**，使得修改消息可以尽快投递给收件人。这个 hook 将 **阻塞发送流程**，因此请尽量减少无谓的代码调用，提升效率。</div>

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [即时通讯 REST API 指南 · 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

参数：

参数 | 说明
--- | ---
`fromPeer` | 消息发送者的 ID。
`convId` | 消息所属对话的 ID。
`toPeers` | 解析出的对话相关的 `clientId`。
`bin` | 原始消息内容是否为二进制消息。
`content` | 消息体字符串。如果 `bin` 为 `true`，则该字段为原始消息内容做 Base64 转码后的结果。
`timestamp` | 服务器收到消息的时间戳（毫秒）。
`msgId` | 被修改的消息 ID。
`sourceIP` | 消息发送者的 IP。
`recall` | 是否撤回消息。
`system` | 是否属于系统对话消息。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`drop` | 可选 | 如果返回真值，修改消息请求将被丢弃。
`code` | 可选 | 当 `drop` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `drop` 为 `true` 时可以下发一个应用自定义的错误说明字符串。
`bin` | 可选 | 返回的 `content` 内是否为二进制消息，如果不提供则为请求中的 `bin` 值。
`content` | 可选 | 修改后的 `content`，如果不提供则保留原消息。如果 `bin` 为 `true`，则 `content` 需要是二进制消息内容做 Base64 转码后的结果。
`toPeers` | 可选 | 数组，修改后的收件人，如果不提供则保留原收件人。

#### `_conversationStart`

在创建对话时调用，发生在签名验证之后、创建对话之前。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起的 `clientId`。
`members` | 初始成员数组，包含初始成员。
`attr` | 创建对话时的额外属性。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`reject` | 可选 | 是否拒绝，默认为 `false`。
`code` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的错误说明字符串。

#### `_conversationStarted`

对话创建后调用

参数：

参数 | 说明
--- | ---
`convId` | 新生成的对话 ID。

返回值：

这个 hook 不对返回值进行处理，只需返回 `{}` 即可。

#### `_conversationAdd`

在将用户加入到对话时调用，发生在签名验证之后、加入对话之前。如果是自己加入，那么 **initBy** 和 **members** 的唯一元素是一样的。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起的 `clientId`。
`members` | 要加入的成员，数组。
`convId` | 对话 ID。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`reject` | 可选 | 是否拒绝，默认为 `false`。
`code` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的错误说明字符串。

#### `_conversationRemove`

在创建对话时调用，发生在签名验证之后、从对话移除成员之前。移除自己时不会触发这个 hook。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起。
`members` | 要踢出的成员，数组。
`convId` | 对话 iD。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`reject` | 可选 | 是否拒绝，默认为 `false`。
`code` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的错误说明字符串。

#### `_conversationUpdate`

在修改对话属性、设置或取消对话消息提醒之前调用。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起。
`convId` | 对话 ID。
`mute` | 是否关闭当前对话提醒。
`attr` | 待设置的对话属性。

`mute` 和 `attr` 参数互斥，不会同时传递。

返回值：

参数 | 约束 | 说明
--- | --- | ---
`reject` | 可选 | 是否拒绝，默认为 `false`。
`code` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的整型错误码。
`detail` | 可选 | 当 `reject` 为 `true` 时可以下发一个应用自定义的错误说明字符串。
`attr` | 可选 | 修改后的待设置对话属性，如果不提供则保持原参数中的对话属性。
`mute` | 可选 | 修改后的关闭对话提醒设置，如果不提供则保持原参数中的关闭提醒设置。

`mute` 和 `attr` 参数互斥，不能同时返回。并且返回值必须与请求对应，请求中如果带着 `attr`，则返回值中只有 `attr` 参数有效，返回 `mute` 会被丢弃。同理，请求中如果带着 `mute`，返回值中如果有 `attr` 则 `attr` 会被丢弃。


## 「系统对话」的使用

系统对话可以用于实现机器人自动回复、公众号、服务账号等功能。在我们的 [官方聊天 Demo](http://leancloud.github.io/leanmessage-demo/) 中就有一个使用系统对话 hook 实现的机器人 MathBot，它能计算用户发送来的数学表达式并返回结果，[其服务端源码](https://github.com/leancloud/leanmessage-demo/tree/master/server) 可以从 GitHub 上获取。

### 系统对话的创建

系统对话也是对话的一种，创建后也是在 `_Conversation` 表中增加一条记录，只是该记录 `sys` 列的值为 `true`，从而与普通会话进行区别。具体创建方法请参考 [REST API 创建服务号](realtime_rest_api_v2.html#创建服务号)。

### 系统对话消息的发送

系统对话给用户发消息请参考： [REST API · 给任意用户单独发消息](realtime_rest_api_v2.html#给任意用户单独发消息)。用户给系统对话发送消息跟用户给普通对话发消息方法一致。

您还可以利用系统对话发送广播消息给全部用户。相比遍历所有用户 ID 逐个发送，广播消息只需要调用一次 REST API。广播消息具有以下特征：

* 广播消息必须与系统对话关联，广播消息和一般的系统对话消息会混合在系统对话的记录中
* 用户离线时发送的广播消息，上线后会作为离线消息收到
* 广播消息具有实效性，可以设置过期时间；过期的消息不会作为离线消息发送给用户，不过仍然可以在历史消息中获取到
* 新用户第一次登录后，会收到最近一条未过期的系统广播消息

除此以外广播消息与普通消息的处理完全一致。广播消息的发送可以参考 [广播消息 REST API](./realtime_rest_api_v2.html#全局广播)。

### 获取系统对话消息记录

获取系统对话给用户发送的消息记录请参考：[查询服务号给某用户发的消息](realtime_rest_api_v2.html#查询服务号给某用户发的消息)。

获取用户给系统对话发送的消息记录有以下两种方式实现：

- `_SysMessage` 表方式，在应用首次有用户发送消息给某系统对话时自动创建，创建后我们将所有由用户发送到系统对话的消息都存储在该表中。
- [Web Hook](#Web_Hook) 方式，这种方式需要开发者自行定义 [Web Hook](#Web_Hook)，用于实时接收用户发给系统对话的消息。

### 系统对话消息结构

#### `_SysMessage`

存储用户发给系统对话的消息，各字段含义如下：

字段 | 说明
--- | ---
`ackAt` | 消息送达的时间。
`bin` | 是否为二进制类型消息。
`conv` | 消息关联的系统对话 `Pointer`。
`data` | 消息内容。
`from` | 发消息用户的 `clientId`。
`fromIp` | 发消息用户的 IP。
`msgId` | 消息的内部 ID。
`timestamp` | 消息创建的时间。

#### Web Hook

需要开发者自行在 [控制台> 消息 > 即时通讯 > 设置 > 系统对话消息回调设置](/messaging.html?appid={{appid}}#/message/realtime/conf) 定义，来实时接收用户发给系统对话的消息，消息的数据结构与上文所述的 `_SysMessage` 一致。

当有用户向系统对话发送消息时，我们会通过 HTTP POST 请求将 JSON 格式的数据发送到用户设置的 Web Hook 上。请注意，我们调用 Web Hook 时并不是一次调用只发送一条消息，而是会以批量的形式将消息发送过去。从下面的发送消息格式中能看到，JSON 的最外层是个 `Array`。

超时时间为 5 秒，当用户 hook 地址超时没有响应，我们会重试至多 3 次。

发送的消息格式为：

```json
[
  {
    "fromIp":      "121.238.214.92",
    "conv": {
      "__type":    "Pointer",
      "className": "_Conversation",
      "objectId":  "55b99ad700b0387b8a3d7bf0"
    },
    "msgId":       "nYH9iBSBS_uogCEgvZwE7Q",
    "from":        "A",
    "bin":         false,
    "data":        "你好，sys",
    "createdAt": {
      "__type":    "Date",
      "iso":       "2015-07-30T14:37:42.584Z"
    },
    "updatedAt":  {
      "__type":   "Date",
      "iso":      "2015-07-30T14:37:42.584Z"
    }
  }
]
```

## 打造自己的聊天机器人

![comingsoon](images/comingsoon.jpg)

> 这部分内容我们还在准备中，敬请期待。

## 即时通讯开发指南一览

[服务总览](realtime_v2.html)

[一，从简单的单聊、群聊、收发图文消息开始](realtime-guide-beginner.html)

[二，消息收发的更多方式，离线推送与消息同步，多设备登录](realtime-guide-intermediate.html)

[三，安全与签名、黑名单和权限管理、玩转直播聊天室和临时对话](realtime-guide-senior.html)
