# 应用内搜索 REST API 指南

应用内搜索提供以下 REST API 接口：

| URL | HTTP | 功能 |
| - | - | - |
| /1.1/search/select | GET | 全文搜索 |
| /1.1/search/mlt | GET | moreLikeThis 相关性查询 |

在调用应用内搜索的 REST API 接口前，需要首先[为相应的 Class 启用搜索](app_search_guide.html#为_Class_启用搜索)。
另外也请参考 REST API 指南中关于 [API Base URL](rest_api.html#api-base-url)、[请求格式](rest_api.html#请求格式)、[响应格式](rest_api.html#响应格式)的说明，以及应用内搜索开发指南的[自定义分词](app_search_guide.html#自定义分词)章节。

## 全文搜索

LeanCloud 提供了 `/1.1/search/select` REST API 接口来做全文搜索。


```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/select?q=dennis&limit=200&clazz=GameScore&order=-score"
```

返回类似：

``` json
{
"hits": 1,  
"results": [
  {
    "_app_url": "http://stg.pass.com//1/go/com.leancloud/classes/GameScore/51e3a334e4b0b3eb44adbe1a",
    "_deeplink": "com.leancloud.appSearchTest://leancloud/classes/GameScore/51e3a334e4b0b3eb44adbe1a",
    "_highlight": null,
    "updatedAt": "2011-08-20T02:06:57.931Z",
    "playerName": "Sean Plott",
    "objectId": "51e3a334e4b0b3eb44adbe1a",
    "createdAt": "2011-08-20T02:06:57.931Z",
    "cheatMode": false,
    "score": 1337
  }
],
"sid": "cXVlcnlUaGVuRmV0Y2g7Mzs0NDpWX0NFUmFjY1JtMnpaRDFrNUlBcTNnOzQzOlZfQ0VSYWNjUm0yelpEMWs1SUFxM2c7NDU6Vl9DRVJhY2NSbTJ6WkQxazVJQXEzZzswOw=="
}
```

查询的参数支持：

参数|约束|说明
---|---|---
`q`|必须|查询文本，支持 elasticsearch 的 query string 语法。参见 [q 查询语法举例](app_search_guide.html#q_查询语法举例)。
`skip`|可选|跳过的文档数目，默认为 0
`limit`|可选|返回集合大小，默认 100，最大 1000
`sid`|可选|之前查询结果中返回的 sid 值，用于分页，对应于 elasticsearch 中的 [scroll id]。
`fields`|可选|逗号隔开的字段列表，查询的字段列表
<code class="text-nowrap">highlights</code>|可选|高亮字段，可以是通配符 `*`，也可以是字段列表逗号隔开的字符串。
`clazz`|可选|类名，如果没有指定或者为空字符串，则搜索所有启用了应用内搜索的 class。
`include`|可选|关联查询内联的 Pointer 字段列表，逗号隔开，形如 `user,comment` 的字符串。**仅支持 include Pointer 类型**。
`order`|可选|排序字段，形如 `-score,createdAt` 逗号隔开的字段，负号表示倒序，可以多个字段组合排序。
`sort`|可选|复杂排序字段，例如地理位置信息排序，见下文描述。

[scroll id]: https://www.elastic.co/guide/en/elasticsearch/reference/7.4/search-request-body.html#request-body-search-scroll

返回结果属性介绍：

- `results`：符合查询条件的结果文档。
- `hits`：符合查询条件的文档总数
- `sid`：标记本次查询结果，下次查询继续传入这个 sid 用于查找后续的数据，用来支持翻页查询。

返回结果 results 列表里是一个一个的对象，字段是你在应用内搜索设置里启用的字段列表，并且有三个特殊字段：

- `_app_url`：应用内搜索结果在网站上的链接。
- `_deeplink`：应用内搜索的程序调用 URL，也就是 deeplink。
- `_highlight`: 高亮的搜索结果内容，关键字用 `em` 标签括起来。如果搜索时未传入 `highlights`　参数，则该字段为 null。 

最外层的 `sid` 用来标记本次查询结果，下次查询继续传入这个 sid 将翻页查找后 200 条数据：

``` sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/select?q=dennis&limit=200&clazz=GameScore&order=-score&sid=cXVlcnlUaGVuRmV0Y2g7Mzs0NDpWX0NFUmFjY1JtMnpaRDFrNUlBcTNnOzQzOlZfQ0VSYWNjUm0yelpEMWs1SUFxM2c7NDU6Vl9DRVJhY2NSbTJ6WkQxazVJQXEzZzswOw"
```

直到返回结果为空。

## moreLikeThis 相关性查询

除了 `/1.1/search/select` 之外，我们还提供了 `/1.1/search/mlt` 的 API 接口，用于相似文档的查询，可以用来实现相关性推荐。

假设我们有一个 Class 叫 `Post` 是用来保存博客文章的，我们想基于它的标签字段 `tags` 做相关性推荐：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/mlt?like=clojure&clazz=Post&fields=tags"
```

我们设定了 `like` 参数为 `clojure`，查询的相关性匹配字段 `fields` 是 `tags`，也就是从 `Post` 里查找 `tags` 字段跟 `clojure` 这个文本相似的对象，返回类似：

``` json
{
"results": [
  {  
    "tags":[  
          "clojure",
           "数据结构与算法"
     ],
     "updatedAt":"2016-07-07T08:54:50.268Z",
     "_deeplink":"cn.leancloud.qfo17qmvr8w2y6g5gtk5zitcqg7fyv4l612qiqxv8uqyo61n:\/\/leancloud\/classes\/Article\/577e18b50a2b580057469a5e",
     "_app_url":"https:\/\/leancloud.cn\/1\/go\/cn.leancloud.qfo17qmvr8w2y6g5gtk5zitcqg7fyv4l612qiqxv8uqyo61n\/classes\/Article\/577e18b50a2b580057469a5e",
     "objectId":"577e18b50a2b580057469a5e",
     "_highlight":null,
     "createdAt":"2016-07-07T08:54:13.250Z",
     "className":"Article",
     "title":"clojure persistent vector"
  },
  // ……
],
"sid": null
}
```

除了可以通过指定 `like` 这样的相关性文本来指定查询相似的文档之外，还可以通过 likeObjectIds 指定一个对象的 objectId 列表，来查询相似的对象：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/mlt?likeObjectIds=577e18b50a2b580057469a5e&clazz=Post&fields=tags"
```

这次我们换成了查找和 `577e18b50a2b580057469a5e` 这个 objectId 指代的对象相似的对象。

更详细的查询参数说明：

参数|约束|说明
---|---|---
`clazz`|必须|类名
`like`|可选|**和 `likeObjectIds` 参数二者必须提供其中之一**。代表相似的文本关键字。
`likeObjectIds`|可选|**和 `like` 参数二者必须提供其中之一**。代表相似的对象 objectId 列表，用逗号隔开。
`min_term_freq`|可选|**文档中一个词语至少出现次数，小于这个值的词将被忽略，默认是 2**，如果返回文档数目过少，可以尝试调低此值。
`min_doc_freq`|可选|**词语至少出现的文档个数，少于这个值的词将被忽略，默认值为 5**，同样，如果返回文档数目过少，可以尝试调低此值。
`max_doc_freq`|可选|词语最多出现的文档个数，超过这个值的词将被忽略，防止一些无意义的热频词干扰结果，默认无限制。
`skip`|可选|跳过的文档数目，默认为 0
`limit`|可选|返回集合大小，默认 100，最大 1000
`fields`|可选|相似搜索匹配的字段列表，用逗号隔开，默认为所有索引字段 `_all`
`include`|可选|关联查询内联的 Pointer 字段列表，逗号隔开，形如 `user,comment` 的字符串。**仅支持 include Pointer 类型**。

更多内容参考 [ElasticSearch 文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl-mlt-query.html)。
