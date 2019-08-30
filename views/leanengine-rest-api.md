
{% import "views/_helper.njk" as docs %}
{% import "views/_leanengine.njk" as leanengine %}
{% import "views/_parts.html" as include %}

{{ include.setService('engine') }}

# 云引擎 REST API 使用指南

LeanCloud 云端提供的统一的访问云函数的接口，所有的客户端 SDK 也都是封装了这个接口从而实现对云函数的调用。

我们推荐使用 [Postman](http://www.getpostman.com/) 来调试 REST API，我们的社区中有一篇 [使用 Postman 调试 REST API 教程](https://forum.leancloud.cn/t/postman-rest-api/8638)。

## Base URL

LeanCloud 云函数的 base URL 为绑定的 API 自定义域名。

LeanCloud 国际版暂不支持绑定 API 自定义域名，国际版云函数需使用如下域名：

```
appid前八位.engine.lncldglobal.com
```

如果暂时没有绑定域名，访问云函数接口可以临时使用如下域名（仅供测试和原型开发阶段使用，不保证可用性）：

| 节点 | 临时域名 |
| - | - |
| 华北 | appid前八位.engine.lncld.net |
| 华东 | appid前八位.engine.lncldapi.com |

## 预备环境和生产环境

在客户端通过 REST API 调用云函数时，可以设置 HTTP 头 `X-LC-Prod` 来区分调用的环境。

* `X-LC-Prod: 0` 表示调用预备环境
* `X-LC-Prod: 1` 表示调用生产环境

通过 SDK 调用云函数时，SDK 会根据当前环境设置 `X-LC-Prod` HTTP 头，详见 [云函数开发指南中关于预备环境和生产环境的说明](leanengine_cloudfunction_guide-node.html#切换云引擎环境)。

## 云函数

云函数可以通过 REST API 来使用，比如调用一个叫 hello 的云函数：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://{{host}}/1.1/functions/hello
```

通过 `POST /functions/:name` 这个 API 调用时，参数和结果都是 JSON 格式。例如，我们传入电影的名字来获取电影的目前的评分：

```sh
curl -X POST -H "Content-Type: application/json; charset=utf-8" \
       -H "X-LC-Id: {{appid}}" \
       -H "X-LC-Key: {{appkey}}" \
       -d '{"movie":"夏洛特烦恼"}' \
https://{{host}}/1.1/functions/averageStars
```

上述命令行实际上就是向云端发送一个 JSON 对象作为参数，请求 `averageStars` 云函数，参数的内容是要查询的电影的名字。

响应：

```json
{
  "result": {
    "movie": "夏洛特烦恼",
    "stars": "2.5"
  }
}
```

有些时候我们希望使用 AVObject 作为云函数的参数，或者希望以 AVObject 为云函数的返回值，这时我们可以使用 `POST /1.1/call/:name` 这个 RPC 调用的 API，云函数 SDK 会将参数解释为一个 AVObject，同时在返回 AVObject 时提供必要的元信息：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"__type": "Object", "className": "Post", "pubUser": "LeanCloud官方客服"}' \
  https://{{host}}/1.1/call/addPost
```

响应：

```json
{
  "result": {
    "__type": "Object",
    "className": "Post",
    "pubUser": "LeanCloud官方客服"
  }
}
```

RPC 调用时，不仅可以返回单个 AVObject，还可以返回包含 AVObject 的数据结构。
例如，假设有一个云函数返回一个数组，其中包含一个数字和一个 Todo 对象，那么 RPC 调用的结果为：

```json
{
  "result": [
    1,
    {
      "title": "工程师周会",
      "createdAt": {
        "__type": "Date",
        "iso": "2019-04-28T08:34:12.932Z"
      },
      "updatedAt": {
        "__type": "Date",
        "iso": "2019-04-28T08:34:12.932Z"
      },
      "objectId": "5cc5658443e78cb53fe7b731",
      "__type": "Object",
      "className": "Todo"
    }
  ]
}
```

在通过 SDK 进行 RPC 调用时，SDK 会据此自动反序列化。

如果云函数超时，云端会报错 524：

```json
{
  "code": 1,
  "error": "LeanCloud was able to complete a TCP connection to the upstream server, but did not receive a timely HTTP response."
}
```

如果云函数超时，客户端会收到 HTTP status code 为 503 或 524 的响应。

你还可以阅读以下云引擎开发指南来获取更多的信息。

* [云引擎 Node.js 环境](leanengine_cloudfunction_guide-node.html)
* [云引擎 Python 环境](leanengine_cloudfunction_guide-python.html)
* [云引擎 PHP 环境](leanengine_cloudfunction_guide-php.html)
* [云引擎 Java 环境](leanengine_cloudfunction_guide-java.html)
* [云引擎 .Net 环境](leanengine_cloudfunction_guide-dotnet.html)
