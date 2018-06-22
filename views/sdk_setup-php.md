{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "PHP" %}

{% block libs_tool_automatic %}

#### composer

composer 是推荐的 PHP 包管理工具。安装 leancloud-sdk 只需执行以下命令：
```
composer require leancloud/leancloud-sdk
```

{% endblock %}

{% block init_with_app_keys %}

然后导入 `Client`，并调用 `initialize` 方法进行初始化：

```php
use \LeanCloud\Client;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
Client::setServerUrl("https://{{host}}.api.lncld.net"); // 0.7.0 及以上版本支持
```
{% endblock %}

{% block sdk_switching_node %}
```php
use \LeanCloud\Client;
use \LeanCloud\Region;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
{% if node != 'qcloud' %}
// 启用美国节点
// Client::useRegion(Region::US);
// 启用中国节点（默认启用）
Client::useRegion(Region::CN);
{% else %}
// 启用中国节点（默认启用）目前仅支持 E1。
Client::useRegion(Region::CN_E1);
{% endif %}
```
{% endblock %}

{% block save_a_hello_world %}

```php
// test.php

require 'vendor/autoload.php';

use \LeanCloud\Client;
use \LeanCloud\LeanObject;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
Client::setServerUrl("https://{{host}}");

$testObject = new LeanObject("TestObject");
$testObject->set("words", "Hello World!");
try {
    $testObject->save();
    echo "Save object success!";
} catch (Exception $ex) {
    echo "Save object fail!";
}
```

保存后运行 `php test.php`。
{% endblock %}
