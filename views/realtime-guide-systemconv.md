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

### Hook 与即时通讯服务的关系

Hook 也可以称为「钩子」，是一种特殊的消息处理机制，与 Windows 平台下的中断机制类似，允许应用方拦截并处理即时通讯过程中的多种事件和消息，从而达到实现自定义业务逻辑的目的。

以 **_messageRecieved** Hook 为例，它在消息送达服务器后会被调用，在 Hook 内可以捕获消息内容、消息发送者、消息接收者等信息，这些信息均能在 Hook 内做修改并将修改后的值转交回服务器，服务器会使用修改后的消息继续完成消息投递工作。最终收消息用户收到的会是被 Hook 修改过后的消息，而不再是最初送达服务器的原始消息。Hook 也可以选择拒绝消息发送，服务器会在给客户端回复消息被 Hook 拒绝后丢弃消息不再完成后续消息处理及转发流程。

**需要注意的是，默认情况下如果 Hook 调用失败，例如超时、返回状态码非 200 的结果等，服务器会忽略 Hook 的错误继续处理原始请求**。如果您需要改变这个行为，可以在**控制台 > 消息 > 即时通讯 > 设置 > 即时通讯选项** 内开启 「Hook 调用失败时返回错误给客户端并放弃继续处理请求」。开启后如果 Hook 调用失败，服务器会返回错误信息给客户端告知 Hook 调用错误，并拒绝继续处理请求。

### 消息类 Hook

一条消息，在即时通讯的流程中，从终端用户 A 发送开始，到其他用户接收到为止，考虑到存在接收方在线/不在线的可能，会经历多个不同阶段，这里每一个阶段都会触发 Hook 函数：

* **_messageReceived**<br/>
  消息达到服务器，群组成员已解析完成之后，发送给收件人之前调用。开发者在这里还可以修改消息内容，实时改变消息接收者的列表，以及其他类似操作。
* **_messageSent**<br/>
  消息发送完成后调用。开发者在这里可以完成业务统计，或将消息中转备份到己方服务器，以及其他类似操作。
* **_receiversOffline**<br/>
  消息发送完成，存在离线的收件人，在发推送给收件人之前调用。开发者在这里可以动态修改离线推送的通知内容，或通知目的设备的列表，以及其他类似操作。
* **_messageUpdate**<br/>
  收到消息修改请求，发送修改后的消息给收件人之前调用。与新发消息一样，开发者在这里可以再次修改消息内容，实时改变消息接收者的列表，以及其他类似操作。

### 对话类 Hook

在对话创建和成员变动等更改性操作前后，都可以触发 Hook 函数，进行额外的处理：

* **_conversationStart**<br/>
  创建对话，在签名校验（如果开启）之后，实际创建之前调用。开发者在这里可以为新的「对话」添加其他内部属性，或完成操作鉴权，以及其他类似操作。
* **_conversationStarted**<br/>
  创建对话完成后调用。开发者在这里可以完成业务统计，或将对话数据中转备份到己方服务器，以及其他类似操作。
* **_conversationAdd**<br/>
  向对话添加成员，在签名校验（如果开启）之后，实际加入之前调用，包括主动加入和被其他用户加入两种情况。开发者可以在这里根据内部权限设置批准或驳回这一请求，以及其他类似操作。
* **_conversationRemove**<br/>
  从对话中踢出成员，在签名校验（如果开启）之后，实际踢出之前调用，用户自己退出对话不会调用。开发者可以在这里根据内部权限设置批准或驳回这一请求，以及其他类似操作。
* **_conversationAdded**<br/>
  用户加入对话，在加入成功后调用。
* **_conversationRemoved**<br/>
  用户离开对话，在离开成功后调用。
* **_conversationUpdate**<br/>
  修改对话名称、自定义属性，设置或取消对话消息提醒，在实际修改之前调用。开发者在这里可以为新的「对话」添加其他内部属性，或完成操作鉴权，以及其他类似操作。

### 客户端上下线 Hook

在客户端上线和下线的时候，可以触发 Hook 函数：

* **_clientOnline**<br/>
  客户端上线，客户端登录成功后调用。
* **_clientOffline**<br/>
  客户端下线，客户端登出成功或意外下线后调用。

开发者可以利用这两个 Hook 函数，结合云缓存来完成一组客户端实时状态查询的 endpoint，具体可以参考文档[即时通讯中的在线状态查询](realtime-guide-onoff-status.html)。

### Hook 与云引擎的关系

因为 Hook 发生在即时通讯的在线处理环节，而即时通讯服务端每秒钟需要处理的消息和对话事件数量远超大家的想象，出于性能考虑，我们要求开发者使用 [LeanCloud 云引擎](leanengine_overview.html) 来实现 Hook 函数，为此我们也提供了多种服务端 SDK 供大家选择：

- [Node.js 开发指南](leanengine_cloudfunction_guide-node.html)
- [Python SDK 开发指南](leanengine_cloudfunction_guide-python.html)
- [Java SDK 开发指南](leanengine_cloudfunction_guide-java.html)
- [PHP SDK 开发指南](leanengine_cloudfunction_guide-php.html)

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
    //     content: '{"_lctext":"来我们去 XX 传奇玩吧","_lctype":-1}',
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
    let processedContent = content.replace('XX 传奇', '**');
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
    #     'content': '{"_lctext":"来我们去 XX 传奇玩吧","_lctype":-1}',
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
    processed_content = text.replace('XX 传奇', '**')
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
    //     content: '{"_lctext":"来我们去 XX 传奇玩吧","_lctype":-1}',
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
    $processedContent = preg_replace("XX 传奇", "**", $text);
    // 必须含有以下语句给服务端一个正确的返回，否则会引起异常
    return array("content" => $processedContent);
});
```
```java
@IMHook(type = IMHookType.messageReceived)
  public static Map<String, Object> onMessageReceived(Map<String, Object> params) {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    String content = (String)params.get("content");
    Map<String,Object> contentMap = (Map<String,Object>)JSON.parse(content);
    String text = (String)(contentMap.get("_lctext").toString());
    String processedContent = text.replace("XX 中介", "**");
    result.put("content",processedContent);
    // 必须含有以下语句给服务端一个正确的返回，否则会引起异常
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

这个 hook 发生在有收件人离线的情况下，你可以通过它来自定义离线推送行为，包括推送内容、被推送用户或略过推送。你也可以直接在 hook 中触发自定义的推送。发往聊天室的消息不会触发此 hook。

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
    // content 为消息内容
    String alert = (String)params.get("content");
    if(alert.length() > 6){
      alert = alert.substring(0, 6);
    }
    System.out.println(alert);
    Map<String, Object> result = new HashMap<String, Object>();
    JSONObject object = new JSONObject();
    // 自增未读消息的数目
    // 不想自增就设为数字
    object.put("badge", "Increment");
    object.put("sound", "default");
    // 使用开发证书
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

在创建对话时调用，发生在签名验证（如果开启）之后、创建对话之前。

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

例如对话创建时，在云引擎中打印一下日志：

```js
AV.Cloud.onIMConversationStart((request) => {
  let params = request.params;
  console.log('params:', params);

  // params: {
  //     initBy: 'Tom',
  //     members: ['Tom', 'Jerry'],
  //     attr: {
  //         name: 'Tom & Jerry'
  //     },
  //     __sign: '1472703266397,b57285517a95028f8b7c34c68f419847a049ef26'
  // }
});
```
```python
@engine.define
def _conversationStart(**params):
    print('_conversationStart start')
    print('params:', params)
    print('_conversationStart end')
    return {}

# _conversationStart start
# params: {
#   '__sign': '1472703266397,b57285517a95028f8b7c34c68f419847a049ef26',
#   'attr': {'name': 'Tom & Jerry'},
#   'initBy': 'Tom',
#   'members': ['Tom', 'Jerry']
# }
# _conversationStart end
```
```php
Cloud::define('_conversationStart', function($params, $user) {
    error_log('_conversationStart start');
    error_log('params:' . json_encode($params));
    return array();

    // _conversationStart start
    // params: {
    //     initBy: 'Tom',
    //     members: ['Tom', 'Jerry'],
    //     attr: {
    //         name: 'Tom & Jerry'
    //     },
    //     __sign: '1472703266397,b57285517a95028f8b7c34c68f419847a049ef26'
    // }
});
```
```java
@IMHook(type = IMHookType.conversationStart)
public static Map<String, Object> onConversationStart(Map<String, Object> params) {
  System.out.println(params);
  Map<String, Object> result = new HashMap<String, Object>();
  // 如果创建者是 Tom 则拒绝创建对话
  if ("Tom".equals(params.get("initBy"))) {
    result.put("reject", true);
    // 这个数字是由开发者自定义的
    result.put("code", 9890);
  }
  return result;
}
```

#### `_conversationStarted`

对话创建后调用。

参数：

参数 | 说明
--- | ---
`convId` | 新生成的对话 ID。

返回值：

这个 hook 不对返回值进行处理，只需返回 `{}` 即可。

例如对话创建之后，在云引擎打印一下日志：

```js
AV.Cloud.onIMConversationStarted((request) => {
  let params = request.params;
  console.log('params:', params);

  // params: {
  //     convId: '5789a33a1b8694ad267d8040',
  //     __sign: '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb'
  // }
});
```
```python
@engine.define
def _conversationStarted(**params):
    print('_conversationStarted start')
    print('params:', params)
    print('_conversationStarted end')
    return {}

# _conversationStarted start
# params: {
#   '__sign': '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb',
#   'convId': '5789a33a1b8694ad267d8040'
# }
# _conversationStarted end
```
```php
Cloud::define('_conversationStarted', function($params, $user) {
    error_log('_conversationStarted start');
    error_log('params:' . json_encode($params));
    return array();

    // _conversationStarted start
    // params: {
    //     convId: '5789a33a1b8694ad267d8040',
    //     __sign: '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb'
    // }
});
```
```java
@IMHook(type = IMHookType.conversationStarted)
public static Map<String, Object> onConversationStarted(Map<String, Object> params) throws Exception {
  System.out.println(params);
  Map<String, Object> result = new HashMap<String, Object>();
  String convId = (String)params.get("convId");
  System.out.println(convId);
  return result;
}
```

#### `_conversationAdd`

在将用户加入到对话时调用，发生在签名验证（如果开启）之后、加入对话之前，包括主动加入和被其他用户加入两种情况都会触发。**注意如果在创建对话时传入了其他用户的 `clientId` 作为成员，则不会触发该 hook。**如果是自己加入，那么 `initBy` 和 `members` 的唯一元素是一样的。

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

例如在云引擎中打印成员加入时的日志：

```js
AV.Cloud.onIMConversationAdd((request) => {
  let params = request.params;
  console.log('params:', params);

  // params: {
  //     initBy: 'Tom',
  //     members: ['Mary'],
  //     convId: '5789a33a1b8694ad267d8040',
  //     __sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
  // }
});
```
```python
@engine.define
def _conversationAdd(**params):
    print('_conversationAdd start')
    print('params:', params)
    print('_conversationAdd end')
    return {}

# _conversationAdd start
# params: {
#   '__sign': '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0',
#   'convId': '5789a33a1b8694ad267d8040',
#   'initBy': 'Tom',
#   'members': ['Mary']
# }
# _conversationAdd end
```
```php
Cloud::define('_conversationAdd', function($params, $user) {
    error_log('_conversationAdd start');
    error_log('params:' . json_encode($params));
    return array();

    // _conversationAdd start
    // params: {
    //     initBy: 'Tom',
    //     members: ['Mary'],
    //     convId: '5789a33a1b8694ad267d8040',
    //     __sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
    // }
});
```
```java
@IMHook(type = IMHookType.conversationAdd)
public static Map<String, Object> onConversationAdd(Map<String, Object> params) {
  System.out.println(params);
  String[] members = (String[])params.get("members");
  Map<String, Object> result = new HashMap<String, Object>();
  System.out.println("members");
  System.out.println(members);
  // 如果创建者是 Tom 则拒绝新增成员
  if ("Tom".equals(params.get("initBy"))) {
    result.put("reject", true);
    // 这个数字是由开发者自定义
    result.put("code", 9890);
  }
  return result;
}
```

#### `_conversationRemove`

从对话中移除成员，在签名校验（如果开启）之后、实际踢出之前触发，用户自己退出对话不会触发。

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

示例代码：

```js
AV.Cloud.onIMConversationRemove((request) => {
  let params = request.params;
  console.log('params:', params);
  console.log('Removed clientId:', params.members[0]);

  // params: {
  //     initBy: 'Tom',
  //     members: ['Jerry'],
  //     convId: '57c8f3ac92509726c3dadaba',
  //     __sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
  // }
  // Removed clientId: Jerry
});
```
```python
@engine.define
def _conversationRemove(**params):
    print('_conversationRemove start')
    print('params:', params)
    print('Removed clientId:', params['members'][0])
    print('_conversationRemove end')
    return {}

# _conversationRemove start
# params: {
#   '__sign': '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38',
#   'convId': '57c8f3ac92509726c3dadaba',
#   'initBy': 'Tom',
#   'members': ['Jerry']
# }
# Removed clientId: Jerry
# _conversationRemove end
```
```php
Cloud::define('_conversationRemove', function($params, $user) {

    error_log('_conversationRemove start');
    error_log('params:' . json_encode($params));
    error_log('Removed clientId:' . $params['members'][0]);
    return array();

    // _conversationRemove start
    // params: {
    //     initBy: 'Tom',
    //     members: ['Jerry'],
    //     convId: '57c8f3ac92509726c3dadaba',
    //     __sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
    // }
    // Removed clientId: Jerry
});
```
```java
@IMHook(type = IMHookType.conversationRemove)
public static Map<String, Object> onConversationRemove(Map<String, Object> params) {
  System.out.println(params);
  String[] members = (String[])params.get("members");
  Map<String, Object> result = new HashMap<String, Object>();
  System.out.println("members");
  // 如果创建者是 Tom 则拒绝踢出成员
  if ("Tom".equals(params.get("initBy"))) {
    result.put("reject", true);
    // 这个数字是由开发者自定义
    result.put("code", 9892);
  }
  return result;
}
```

#### `_conversationAdded`

成员成功加入对话后调用。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起。
`convId` | 对话 ID。
`members` | 新加入的用户 ID 数组

返回值：

这个 hook 不会对返回值进行检查。

示例代码：

```js
AV.Cloud.onIMConversationAdded((request) => {
  let params = request.params;
  console.log('params:', params);

  // params: {
  //     initBy: 'Tom',
  //     members: ['Mary'],
  //     convId: '5789a33a1b8694ad267d8040',
  //     __sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
  // }
});
```
```python
@engine.define
def _conversationAdded(**params):
    print('_conversationAdded start')
    print('params:', params)
    print('_conversationAdded end')

# _conversationAdded start
# params: {
#   '__sign': '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0',
#   'convId': '5789a33a1b8694ad267d8040',
#   'initBy': 'Tom',
#   'members': ['Mary']
# }
# _conversationAdded end
```
```php
Cloud::define('_conversationAdded', function($params, $user) {
    error_log('_conversationAdded start');
    error_log('params:' . json_encode($params));

    // _conversationAdded start
    // params: {
    //     initBy: 'Tom',
    //     members: ['Mary'],
    //     convId: '5789a33a1b8694ad267d8040',
    //     __sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
    // }
});
```
```java
@IMHook(type = IMHookType.conversationAdded)
public static void onConversationAdded(Map<String, Object> params) {
  System.out.println(params);
  String[] members = (String[])params.get("members");
  System.out.println("members");
  System.out.println(members);
}
```

#### `_conversationRemoved`

成员成功离开对话后调用。

参数：

参数 | 说明
--- | ---
`initBy` | 由谁发起。
`convId` | 对话 ID。
`members` | 新加入的用户 ID 数组

返回值：

这个 hook 不会对返回值进行检查。

示例代码：

```js
AV.Cloud.onIMConversationRemoved((request) => {
  let params = request.params;
  console.log('params:', params);
  console.log('Removed clientId:', params.members[0]);

  // params: {
  //     initBy: 'Tom',
  //     members: ['Jerry'],
  //     convId: '57c8f3ac92509726c3dadaba',
  //     __sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
  // }
  // Removed clientId: Jerry
});
```
```python
@engine.define
def _conversationRemoved(**params):
    print('_conversationRemoved start')
    print('params:', params)
    print('Removed clientId:', params['members'][0])
    print('_conversationRemoved end')
    return {}

# _conversationRemoved start
# params: {
#   '__sign': '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38',
#   'convId': '57c8f3ac92509726c3dadaba',
#   'initBy': 'Tom',
#   'members': ['Jerry']
# }
# Removed clientId: Jerry
# _conversationRemoved end
```
```php
Cloud::define('_conversationRemoved', function($params, $user) {

    error_log('_conversationRemoved start');
    error_log('params:' . json_encode($params));
    error_log('Removed clientId:' . $params['members'][0]);

    // _conversationRemoved start
    // params: {
    //     initBy: 'Tom',
    //     members: ['Jerry'],
    //     convId: '57c8f3ac92509726c3dadaba',
    //     __sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
    // }
    // Removed clientId: Jerry
});
```
```java
@IMHook(type = IMHookType.conversationRemoved)
public static void onConversationRemoved(Map<String, Object> params) {
  System.out.println(params);
  String[] members = (String[])params.get("members");
  System.out.println("members");
}
```

#### `_conversationUpdate`

在修改对话名称、自定义属性，设置或取消对话消息提醒之前调用。

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

例如在更新发生时，在云引擎日志中打印出对话的名称：

```js
AV.Cloud.onIMConversationUpdate((request) => {
  let params = request.params;
  console.log('params:', params);
  console.log('name:', params.attr.name);

  // params: {
  //     convId: '57c9208292509726c3dadb4b',
  //     initBy: 'Tom',
  //     attr: {
  //         name: 'Tom and Jerry',
  //         type: 'public'
  //     }
  // }
  // name: Tom and Jerry
});
```
```python
@engine.define
def _conversationUpdate(**params):
    print('_conversationUpdate start')
    print('params:', params)
    print('name:', params['attr']['name'])
    print('_conversationUpdate end')
    return {}

# _conversationUpdate start
# params: {
#   '__sign': '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38',
#   'convId': '57c8f3ac92509726c3dadaba',
#   'initBy': 'Tom',
#   'members': ['Jerry']
# }
# name: Tom and Jerry
# _conversationUpdate end
```
```php
Cloud::define('_conversationUpdate', function($params, $user) {
    error_log('_conversationUpdate start');
    error_log('params:' . json_encode($params));
    error_log('name:' . $params['attr']['name']);
    return array();

    // _conversationUpdate start
    // params: {
    //     convId: '57c9208292509726c3dadb4b',
    //     initBy: 'Tom',
    //     attr: {
    //         name: 'Tom and Jerry',
    //         type: 'public'
    //     }
    // }
    // name: Tom and Jerry
});
```
```java
@IMHook(type = IMHookType.conversationUpdate)
public static Map<String, Object> onConversationUpdate(Map<String, Object> params) {
  System.out.println(params);
  Map<String, Object> result = new HashMap<String, Object>();
  Map<String,Object> attr = (Map<String,Object>)params.get("attr");
  System.out.println(attr);
  // Map<String,Object> attrMap = (Map<String,Object>)JSON.parse(attr);
  String name = (String)attr.get("name");
  // System.out.println(attrMap);
  System.out.println(name);
  // 如果创建者是 Tom 则拒绝修改属性
  if ("Tom".equals(params.get("initBy"))) {
    result.put("reject", true);
    // 这个数字是由开发者自定义
    result.put("code", 9893);
  }
  return result;
}
```

#### `_clientOnline`

客户端上线，客户端登录成功后调用。

请注意本 Hook 仅作为用户上线后的通知。如果用户快速的进行上下线切换或有多个设备同时进行上下线，则上线和下线 Hook 调用顺序并不做严格保证，即可能出现某用户 `_clientOffline` Hook 先于 `_clientOnline` Hook 而调用。

参数:

参数 | 说明
----- | ------
peerId | 登录者的 ID
sourceIP | 登录者的 IP
tag | 无值或值为 "default" 表示主动登录时不会根据 tag 踢其它设备下线，其它情况下会踢当前登录的相同 tag 的设备下线
reconnect | 标识客户端本次登录是否是自动重连，无值或值为 0 表示主动登录，值为 1 表示自动重连

返回:

这个 hook 不会对返回值进行检查。

例如，客户端上线后更新云缓存，供查询客户端的实时在线状态：

```js
AV.Cloud.onIMClientOnline((request) => {
  // 1 表示在线
  redisClient.set(request.params.peerId, 1)
})
```
```python
@engine.define
def _clientOnline(**params):
  # 1 表示在线
  redis_client.set(params["peerId"], 1)
```
```php
Cloud::define('_clientOnline', function($params, $user) {
  // 1 表示在线
  $redis->set($params["peerId"], 1);
}
```
```java
@IMHook(type = IMHookType.clientOnline)
public static void onClientOnline(Map<String, Object> params) {
  // 1 表示在线
  jedis.set(params.get("peerId"), 1);  
}
```

#### `_clientOffline`

在客户端登出成功或意外下线后调用。

请注意本 Hook 仅作为用户下线后的通知。如果用户快速的进行上下线切换或有多个设备同时进行上下线，则上线和下线 Hook 调用顺序并不做严格保证，即可能出现某用户 `_clientOffline` Hook 先于 `_clientOnline` Hook 而调用。

参数:

参数 | 说明
----- | ------
peerId | 登出者的 ID
closeCode | 登出的方式，1 代表用户主动登出，2 代表连接断开，3 代表用户由于 `tag` 冲突被踢下线，4 代表用户被 API 踢下线
closeMsg | 对登出方式的描述信息
sourceIP | 执行关闭会话操作的用户的 IP，连接断开时不传递此参数
tag | 由用户在会话创建时传递而来，无值或值为 `default` 表示主动登录时不会根据 tag 踢其它设备下线，其它情况下会踢当前登录的相同 tag 的设备下线

返回:

这个 hook 不会对返回值进行检查。

例如，客户端下线后更新云缓存，供查询客户端的实时在线状态：

```js
AV.Cloud.onIMClientOffline((request) => {
  // 0 表示下线
  redisClient.set(request.params.peerId, 0)
})
```
```python
@engine.define
def _clientOffline(**params):
  # 0 表示下线
  redis_client.set(params["peerId"], 0)
```
```php
Cloud::define('_clientOffline', function($params, $user) {
  // 0 表示下线 
  $redis->set($params["peerId"], 0);
}
```
```java
@IMHook(type = IMHookType.clientOffline)
public static void onClientOffline(Map<String, Object> params) {
  // 0 表示下线 
  jedis.set(params.get("peerId"), 0);  
}
```

[即时通讯中的在线状态查询](realtime-guide-onoff-status.html) 提供了完整的 Node.js 示例（包括云缓存连接，久未上线的客户端清理，配套的返回在线状态的云函数，以及如何在客户端调用），可以参考。

## 「系统对话」的使用

系统对话可以用于实现机器人自动回复、公众号、服务账号等功能。在我们的 [官方聊天 Demo](http://leancloud.github.io/leanmessage-demo/) 中就有一个使用系统对话 hook 实现的机器人 MathBot，它能计算用户发送来的数学表达式并返回结果，[其服务端源码](https://github.com/leancloud/leanmessage-demo/tree/master/server) 可以从 GitHub 上获取。

### 系统对话的创建

系统对话也是对话的一种，创建后也是在 `_Conversation` 表中增加一条记录，只是该记录 `sys` 列的值为 `true`，从而与普通会话进行区别。具体创建方法请参考 [REST API 创建服务号](realtime_rest_api_v2.html#创建服务号)。

### 系统对话消息的发送

系统对话给用户发消息请参考：[REST API · 给任意用户单独发消息](realtime_rest_api_v2.html#给任意用户单独发消息)。用户给系统对话发送消息跟用户给普通对话发消息方法一致。

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

需要开发者自行在 **控制台 > 消息 > 即时通讯 > 设置 > 系统对话消息回调设置** 定义，来实时接收用户发给系统对话的消息，消息的数据结构与上文所述的 `_SysMessage` 一致。

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
