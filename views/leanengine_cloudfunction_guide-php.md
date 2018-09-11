{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = 'PHP' %}
{% set runtimeName = "php" %}
{% set gettingStartedName = "slim-getting-started" %}
{% set productName = 'LeanEngine' %}
{% set storageName = 'LeanStorage' %}
{% set leanengine_middleware = '[LeanCloud PHP SDK](https://github.com/leancloud/php-sdk)' %}

{% set storage_guide_url = '[PHP SDK](./leanstorage_guide-php.html)' %}
{% set cloud_func_file = '`$PROJECT_DIR/cloud.php`' %}
{% set runFuncName = '`LeanCloud\Engine\Cloud::run`' %}
{% set defineFuncName = '`LeanCloud\Engine\Cloud::define`' %}
{% set runFuncApiLink = '[LeanCloud\Engine\Cloud::run](/api-docs/php/class-LeanCloud.Engine.Cloud.html#run)' %}

{% set hook_before_save   = "beforeSave" %}
{% set hook_after_save    = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update  = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete  = "afterDelete" %}
{% set hook_on_verified   = "onVerified" %}
{% set hook_on_login      = "onLogin" %}
{% set hook_message_received = "_messageReceived" %}
{% set hook_receiver_offline = "_receiversOffline" %}
{% set hook_message_sent = "_messageSent" %}
{% set hook_conversation_start = "_conversationStart" %}
{% set hook_conversation_started = "_conversationStarted" %}
{% set hook_conversation_add = "_conversationAdd" %}
{% set hook_conversation_remove = "_conversationRemove" %}
{% set hook_conversation_update = "_conversationUpdate" %}

{% block cloudFuncExample %}

```php
use \LeanCloud\Engine\Cloud;
use \LeanCloud\Query;
use \LeanCloud\CloudException;

Cloud::define("averageStars", function($params, $user) {
    $query = new Query("Review");
    $query->equalTo("movie", $params["movie"]);
    try {
        $reviews = $query->find();
    } catch (CloudException $ex) {
        // 查询失败, 将错误输出到日志
        error_log($ex->getMessage());
        return 0;
    }
    $sum = 0;
    forEach($reviews as $review) {
        $sum += $review->get("stars");
    }
    if (count($reviews) > 0) {
         return $sum / count($reviews);
    } else {
         return 0;
    }
});
```
{% endblock %}

{% block cloudFuncTimeout %}
### 云函数超时

云引擎超时时间默认为 15 秒，如果超过阈值，进程将被强制 kill：

* 客户端将收到 HTTP status code 为 50X 响应。
* 服务端会出现类似这样的日志：`WARNING: [pool www] child ... exited on signal 9 (SIGKILL) after ... seconds from start`。

{% endblock %}

{% block cloudFuncParams %}
传递给云函数的参数依次为：

* `$params: array`：客户端发送的参数。
* `$user: User`：客户端所关联的用户（根据客户端发送的 `LC-Session` 头）。
* `$meta: array`：有关客户端的更多信息，目前只有一个 `$meta['remoteAddress']` 属性表示客户端的 IP。

{% endblock %}

{% block runFuncExample %}
```php
try {
    $result = Cloud::run("averageStars", array("movie" => "夏洛特烦恼"));
} catch (\Exception $ex) {
    // 云函数错误
}
```

云引擎中默认会直接进行一次本地的函数调用，而不是像客户端一样发起一个 HTTP 请求。PHP 云引擎暂不支持发起 HTTP 请求来调用云函数。

{% endblock %}

{% block beforeSaveExample %}

```php
Cloud::beforeSave("Review", function($review, $user) {
    $comment = $review->get("comment");
    if ($comment) {
        if (strlen($comment) > 140) {
            // 截断并添加...
            $review->set("comment", substr($comment, 0, 140) . "...");
        }
    } else {
        // 返回错误，并取消数据保存
        throw new FunctionError("No Comment!", 101);
    }
    // 如果正常返回，则数据会保存
});
```
{% endblock %}

{% block afterSaveExample %}

```php
Cloud::afterSave("Comment", function($comment, $user) {
    $query = new Query("Post");
    $post = $query->get($comment->get("post")->getObjectId());
    $post->increment("commentCount");
    try {
        $post->save();
    } catch (CloudException $ex) {
        throw new FunctionError("保存 Post 对象失败: " . $ex->getMessage());
    }
});
```
{% endblock %}

{% block afterSaveExample2 %}

```php
Cloud::afterSave("_User", function($userObj, $currentUser) {
    $userObj->set("from", "LeanCloud");
    try {
        $userObj->save();
    } catch (CloudException $ex) {
        throw new FunctionError("保存 User 对象失败: " . $ex->getMessage());
    }
});
```
{% endblock %}

{% block beforeUpdateExample %}

```php
Cloud::beforeUpdate("Review", function($review, $user) {
    // 对象的 updateKeys 字段记录了本次将要修改的字段名列表，
    // 可用于检测并拒绝对某些字段的修改
    if (in_array("comment", $review->updatedKeys) &&
        strlen($review->get("comment")) > 140) {
        throw new FunctionError("comment 长度不得超过 140 个字符");
    }
});
```

**注意：** 不要修改传入的对象 `$review`，因为对它的改动并不会保存到数据库，但可以抛出异常返回一个错误，拒绝这次修改。
{% endblock %}

{% block afterUpdateExample %}

```php
Cloud::afterUpdate("Article", function($article, $user) {
    // 输出日志到控制台
    error_log("Article {$article->getObjectId()} has been updated.");
});
```
{% endblock %}

{% block beforeDeleteExample %}

```php
Cloud::beforeDelete("Album", function($album, $user) {
    $query = new Query("Photo");
    $query->equalTo("album", $album);
    try {
        $count = $query->count();
    } catch (CloudException $ex) {
        // Delete 操作会被取消
        throw new FunctionError("Error getting photo count: {$ex->getMessage()}");
    }
    if ($count > 0) {
        // 取消 Delete 操作
        throw new FunctionError("Cannot delete album that has photos.");
    }
});
```
{% endblock %}

{% block afterDeleteExample %}

```php
Cloud::afterDelete("Album", function($album, $user) {
    $query = new Query("Photo");
    $query->equalTo("album", $album);
    try {
        // 删除相关的 photos
        $photos = $query->find();
        LeanObject::destroyAll($photos);
    } catch (CloudException $ex) {
        throw new FunctionError("删除关联 photos 失败: {$ex->getMessage()}");
    }
});
```
{% endblock %}

{% block onVerifiedExample %}

```php
Cloud::onVerifed("sms", function($user, $meta) {
    error_log("User {$user->getUsername()} verified by SMS");
});
```
{% endblock %}

{% block onLoginExample %}

```php
Cloud::onLogin(function($user) {
    error_log("User {$user->getUsername()} is logging in.");
    if ($user->get("blocked")) {
        // 用户无法登录
        throw new FunctionError("Forbidden");
    }
    // 如果正常执行，则用户将正常登录
});
```
{% endblock %}

{% block code_hook_message_received %}

```php
Cloud::define("_messageReceived", function($params, $user) {
	// params = {
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

	error_log('_messageReceived start');
	$content = json_decode($params["content"], true);
	$text = $content["_lctext"];
	error_log($text);
    $processedContent = preg_replace("XX中介", "**", $text);
    return array("content" => $processedContent);
});
```
{% endblock %}

{% block code_hook_receiver_offline %}

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
{% endblock %}


{% block code_hook_message_sent %}

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
{% endblock %}

{% block code_hook_conversation_start %}

```php
Cloud::define('_conversationStart', function($params, $user) {
	error_log('_conversationStart start');
	error_log('params' . json_encode($params));
    return array();

	// 在云引擎中打印的日志如下：
	//_conversationStart start
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

```php
Cloud::define('_conversationStarted', function($params, $user) {
	error_log('_conversationStarted start');
	error_log('params' . json_encode($params));
    return array();

	// 在云引擎中打印的日志如下：
	// _conversationStarted start
	// params {
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	__sign: '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb'
	// }
});
```
{% endblock %}

{% block code_hook_conversation_add %}

```php
Cloud::define('_conversationAdd', function($params, $user) {
	error_log('_conversationAdd start');
	error_log('params' . json_encode($params));
    return array();

	// 在云引擎中打印的日志如下：
	// _conversationAdd start
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

```php
Cloud::define('_conversationRemove', function($params, $user) {

	error_log('_conversationRemove start');
	error_log('params' . json_encode($params));
	error_log('removed client Id:' . $params['members'][0]);
    return array();

	// 在云引擎中打印的日志如下：
	// _conversationRemove start
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

```php
Cloud::define('_conversationUpdate', function($params, $user) {
	error_log('_conversationUpdate start');
	error_log('params' . json_encode($params));
    error_log('name' . $params['attr']['name']);
    return array();

	// 在云引擎中打印的日志如下：
	// _conversationUpdate start
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
    LE.deadLoopText({
      hookName:                hook_after_update,
      objectName:              'LeanObject',
      createWithoutDataMethod: 'LeanObject::create()', 
      disableBeforeHook:       'LeanObject->disableBeforeHook()', 
      disableAfterHook:        'LeanObject->disableAfterHook()'
    })
}}

```php
Cloud::afterUpdate("Post", function($post, $user) {
    // 直接修改并保存对象不会再次触发 after update hook 函数
    $post->set('foo', 'bar');
    $post->save();

    // 如果有 fetch 操作，则需要在新获得的对象上调用相关的 disable 方法
    // 来确保不会再次触发 Hook 函数
    $post->fetch();
    $post->disableAfterHook();
    $post->set('foo', 'bar');
    $post->save();

    // 如果是其他方式构建对象，则需要在新构建的对象上调用相关的 disable 方法
    // 来确保不会再次触发 Hook 函数
    $post = LeanObject::create("Post", $post->getObjectId());
    $post->disableAfterHook();
    $post->save();
});
```
{% endblock %}
{% block errorCodeExample %}
错误响应码允许自定义。云引擎抛出的 FunctionError（数据存储 API 会抛出此异常）会直接将错误码和原因返回给客户端。若想自定义错误码，可以自行构造 FunctionError，将 code 与 error 传入。否则 code 为 1， message 为错误对象的字符串形式。

```php
Cloud::define("errorCode", function($params, $user) {
    // 尝试登录一个不存在的用户，会返回 211 错误
    User::logIn("not_this_user", "xxxxxx");
});
```
{% endblock %}

{% block errorCodeExample2 %}
```php
Cloud::define("customErrorCode", function($params, $user) {
    // 返回 123 自定义错误信息
    throw new FunctionError("自定义错误信息", 123);
});
```
{% endblock %}

{% block errorCodeExampleForHooks %}
```php
Cloud::beforeSave("Review", function($review, $user) {
   $comment = $review->get("comment");
   if (!$comment) {
       throw new FunctionError(json_encode(array(
           "code" => 123,
           "message" => "自定义错误信息",
       )));
   }
});
```
{% endblock %}

{% block online_editor %}

{% endblock %}

{% block timerExample %}

```php
Cloud::define("logTimer", function($params, $user) {
    error_log("Log in timer");
});
```
{% endblock %}

{% block timerExample2 %}

```php
use \LeanCloud\Push;

Cloud::define("pushTimer", function($params, $user) {
    $push = new Push(array("alert" => "Public message"));
    $push->setChannels(array("Public"));
    $push->send();
});
```
{% endblock %}

{% block useMasterKey %}
```php
// 通常位于 src/app.php
Client::useMasterKey(true);
```
{% endblock %}
