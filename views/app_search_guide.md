{% import "views/_helper.njk" as docs %}
{% from "views/_data.njk" import libVersion as version %}

{{ docs.defaultLang('js') }}
{{ docs.useSearchLangSpec() }}

# 应用内搜索开发指南

在应用内使用全文搜索是一个很常见的需求。例如一个阅读类的应用，里面有很多有价值的文章，开发者会提供一个搜索框，让用户键入关键字后就能查找到应用内相关的文章，并按照相关度排序，就好像我们打开浏览器用 Google 搜索关键字一样。
虽然使用[正则查询](rest_api.html#正则查询)也可以实现全文搜索功能，但数据量较大的时候正则查询会有性能问题，因此 LeanCloud 提供了专门的应用内搜索功能。

LeanCloud 也提供了与应用内搜索搭配使用的 [DeepLink](deeplink.html) 功能，让应用可以响应外部调用链接。

## 为 Class 启用搜索

你需要选择至少一个 Class 为它开启应用内搜索。开启后，该 Class 的数据将被 LeanCloud 自动建立索引，并且可以调用我们的搜索组件或者 [API](#搜索_API) 搜索到内容。

**请注意，启用了搜索的 Class 数据，其搜索结果仍然遵循 ACL。如果你为 Class 里的 Object 设定了合理的 ACL，那么搜索结果也将遵循这些 ACL 值，保护你的数据安全。**

你可以在「控制台 > 存储 > 应用内搜索」为 Class 启用搜索，点击「添加 Class」：

- **Class**：选择需要启用搜索的 Class。开发版应用最多允许 5 个 Class 启用应用内搜索，商用版应用最多允许 10 个 Class 启用应用内搜索。
- **开放的列**：你可以选择将哪些字段加入搜索索引。默认情况下，`objectId`、`createdAt`、`updatedAt` 三个字段将无条件加入开放字段列表。除了这三个字段外，开发版应用每个 Class 最多允许索引 5 个字段，商用版应用每个 Class 最多允许索引 10 个字段。请仔细挑选要索引的字段。

**如果一个 Class 启用了应用内搜索，但是超过两周没有任何搜索调用，我们将自动禁用该 Class 的搜索功能。**

## 搜索 API

LeanCloud 提供了 [应用内搜索的 REST API 接口](search-rest-api.html)。
JavaScript SDK、Objective C SDK、Java SDK 封装了这一接口。

假设你对 GameScore 类[启用了应用内搜索](#为_Class_启用搜索)，你就可以尝试传入关键字来搜索：

```js
const query = new AV.SearchQuery('GameScore');
query.queryString('dennis');
query.find().then(function(results) {
  console.log("Find " + query.hits() + " docs.");
  //处理 results 结果
}).catch(function(err){
  //处理 err
});
```
```objc
AVSearchQuery *searchQuery = [AVSearchQuery searchWithQueryString:@"test-query"];
searchQuery.className = @"GameScore";
searchQuery.highlights = @"field1,field2";
searchQuery.limit = 10;
searchQuery.cachePolicy = kAVCachePolicyCacheElseNetwork;
searchQuery.maxCacheAge = 60;
searchQuery.fields = @[@"field1", @"field2"];
[searchQuery findInBackground:^(NSArray *objects, NSError *error) {
  for (AVObject *object in objects) {
        NSString *appUrl = [object objectForKey:@"_app_url"];
        NSString *deeplink = [object objectForKey:@"_deeplink"];
        NSString *hightlight = [object objectForKey:@"_highlight"];
        // other fields
        // code is here
    }
}];
```
```java
AVSearchQuery searchQuery = new AVSearchQuery("dennis");
searchQuery.setClassName("GameScore");
searchQuery.setLimit(10);
searchQuery.orderByAscending("score"); //根据score字段升序排序。
searchQuery.findInBackground().subscribe(new Observer<List<AVObject>>() {
  @Override
  public void onSubscribe(Disposable disposable) {}

  @Override
  public void onNext(List<AVObject> results) {
    for (AVObject o:results) {
      System.out.println(o);
    }
    testSucceed = true;
    latch.countDown();
  }

  @Override
  public void onError(Throwable throwable) {
    throwable.printStackTrace();
    testSucceed = true;
    latch.countDown();
  }

  @Override
  public void onComplete() {}
});
```

有关查询语法，可以参考下文 [q 查询语法举例](#q_查询语法举例)的介绍。

因为每次请求都有 limit 限制，所以一次请求可能并不能获取到所有满足条件的记录。
`AVSearchQuery` 的 `hits()` 标示所有满足查询条件的记录数。
你可以多次调用同一个 `AV.SearchQuery` 的 `find()` 获取余下的记录。

如果在不同请求之间无法保存查询的 query 对象，可以利用 sid 做到翻页，一次查询是通过 `AV.SearchQuery` 的 `_sid` 属性来标示的。
你可以通过 `AV.SearchQuery` 的 `sid()` 来重建查询 query 对象，继续翻页查询。
sid 在 5 分钟内有效。

复杂排序可以使用 `AV.SearchSortBuilder`，例如，假设 `scores` 是由分数组成的数组，现在需要根据分数的平均分倒序排序，并且没有分数的排在最后：

```js
searchQuery.sortBy(new AV.SearchSortBuilder().descending('scores', 'avg', 'last'));
```
```objc
AVSearchSortBuilder *builder = [AVSearchSortBuilder newBuilder];
[builder orderByDescending:@"scores" withMode:@"max" andMissing:@"last"];
searchQuery.AVSearchSortBuilder = builder;
```
```java
AVSearchSortBuilder builder = AVSearchSortBuilder.newBuilder();
builder.orderByDescending("scores","avg","last");
searchQuery.setSortBuilder(builder);
```

更多 API 请参考 SDK API 文档：

{{ docs.langSpecStart('js') }}
- [AV.SearchQuery](https://leancloud.github.io/javascript-sdk/docs/AV.SearchQuery.html)
- [AV.SearchSortBuilder](https://leancloud.github.io/javascript-sdk/docs/AV.SearchSortBuilder.html)
{{ docs.langSpecEnd('js') }}
{{ docs.langSpecStart('objc') }}
- [AVSearchQuery](https://leancloud.cn/api-docs/iOS/Classes/AVSearchQuery.html)
- [AVSearchSortBuilder](https://leancloud.cn/api-docs/iOS/Classes/AVSearchSortBuilder.html)
{{ docs.langSpecEnd('objc') }}
{{ docs.langSpecStart('java') }}
- [AVSearchQuery](https://leancloud.cn/api-docs/android/index.html)
- [AVSearchSortBuilder](https://leancloud.cn/api-docs/android/index.html)
{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('java') }}
## SearchActivity

上面介绍的是 storage-core library 中包含的应用内搜索与 UI 无关的接口。
除此以外，在 leancloud-search library 中还有一个 SearchActivity UI 类，主要是用来演示搜索结果的展示。

### 添加依赖

首先，修改项目的 build.gradle 文件，增加如下内容：

```gradle
implementation("cn.leancloud:leancloud-search:{{ version.unified }}@aar")
implementation("cn.leancloud:storage-android:{{ version.unified }}")
implementation("cn.leancloud:storage-core:{{ version.unified }}")
```

### 配置 AndroidManifest.xml

打开 `AndroidManifest.xml` 文件，在里面添加需要用到的 activity 和需要的权限:

``` xml
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <application...>
       <activity
        android:name="cn.leancloud.search.SearchActivity">
       </activity>
    </application>
```

注：由于一些 UI 的原因，**应用内搜索的最低 API level 要求是 12**，如你需要更低的版本支持，请参照文档中的[高级定制部分](#高级定制指南)进行开发。

### 添加代码实现基础的应用内搜索功能

``` java
AVSearchQuery searchQuery = new AVSearchQuery("keyword");
// 通过以下方法，你可以像指定html tag一样设定搜索匹配字符的高亮风格
SearchActivity.setHighLightStyle("<font color='#E68A00'>"); 
SearchActivity activity = new SearchActivity();
activity.setSearchQuery(searchQuery);
Intent intent = new Intent(MainActivity.this, SearchActivity.class);
intent.putExtra(AVSearchQuery.DATA_EXTRA_SEARCH_KEY, JSON.toJSONString(searchQuery));
// 打开一个显式搜索结果的Activity
startActivity(intent);
```

### 高级定制指南

由于每个应用的数据、UI展现要求都有很大的差别，所以单一的搜索组件界面仅仅能够满足较为简单的要求，所以我们将数据接口和 UI 展示进行了分离，开发者可以在 AVSearchQuery 中配置展示的 `title` 和 `highlights` 属性，来动态改变 SearchActivity 中展示的内容。配置 API 如下：

```java
/**
  * 指定 Title 所对应的 Field。
  *
  * @param titleAttribute
  */
public void setTitleAttribute(String titleAttribute);

/**
  * 设置返回的高亮语法，默认为"*"
  * 语法规则可以参考 https://www.elastic.co/guide/en/elasticsearch/reference/6.5
  * /search-request-highlighting.html#highlighting-settings
  *
  * @param hightlights
  */
public void setHightLights(String hightlights);
```

也可以参考 [我们的 `SearchActivity`](https://github.com/leancloud/java-unified-sdk/blob/master/android-sdk/leancloud-search/src/main/java/cn/leancloud/search/SearchActivity.java) 来更好的指定你自己的搜索结果页面。

{{ docs.langSpecEnd('java') }}

## 自定义分词

默认情况下， String 类型的字段都将被自动执行分词处理，我们使用的分词组件是 [mmseg](https://github.com/medcl/elasticsearch-analysis-mmseg)，词库来自搜狗。但是很多用户由于行业或者专业的特殊性，一般都有自定义词库的需求，因此我们提供了自定义词库的功能。应用创建者可以通过 **LeanCloud 控制台 > 存储 > 应用内搜索 > 自定义词库** 上传词库文件。

词库文件要求为 UTF-8 编码，每个词单独一行，文件大小不能超过 512 K，例如：

```
面向对象编程
函数式编程
高阶函数
响应式设计
```

将其保存为文本文件，如 `words.txt`，上传即可。上传后，分词将于 3 分钟后生效。开发者可以通过 `analyze` API（要求使用 master key）来测试：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  "https://{{host}}/1.1/search/analyze?clazz=GameScore&text=反应式设计"
```

参数包括 `clazz` 和 `text`。`text` 就是测试的文本段，返回结果：

```json
{
  "tokens" [
             { "token":"反应式设计",
               "start_offset":0,
               "end_offset":5,
               "type":"word",
               "position":0 }
           ]
}
```

自定义词库生效后，**仅对新添加或者更新的文档/记录才有效**，如果需要对原有的文档也生效的话，需要在 **存储** > **应用内搜索** 点击「强制重建索引」按钮，重建原有索引。
同样，如果更新了自定义词库（包括删除自定义词库），也需要重建索引。

## q 查询语法举例

q 的查询走的是 elasticsearch 的 [query string 语法](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl-query-string-query.html#query-string-syntax)。建议详细阅读这个文档。这里简单做个举例说明。

如果你非常熟悉 elasticsearch 的 query string 语法，那么可以跳至[地理位置信息查询](#地理位置信息查询)一节（地理位置查询是 LeanCloud 应用内搜索在 elasticsearch 上添加的扩展功能）。

查询的关键字保留字符包括： `+ - = && || > < ! ( ) { } [ ] ^ " ~ * ? : \ /`，当出现这些字符的时候，请对这些保留字符做 URL Escape 转义。

#### 基础查询语法

- 查询某个关键字，例如 `可乐`。
- 查询**多个关键字**，例如 `可口 可乐`，空格隔开，返回的结果默认按照文本相关性排序，其他排序方法请参考上文中的 [order](#搜索_API) 和下文中的 [sort](#复杂排序)。
- 查询某个**短语**，例如 `"lady gaga"`，注意用双引号括起来，这样才能保证查询出来的相关对象里的相关内容的关键字也是按照 `lady gaga` 的顺序出现。
- 根据**字段查询**，例如根据 nickname 字段查询：`nickename:逃跑计划`。
- 根据字段查询，也可以是短语，记得加双引号在短语两侧： `nickename:"lady gaga"`
- **复合查询**，AND 或者 OR，例如 `nickname:(逃跑计划 OR 夜空中最亮的星)`
- 假设 book 字段是 object 类型，那么可以根据**内嵌字段**来查询，例如 `book.name:clojure OR book.content:clojure`，也可以用通配符简写为 `book.\*:clojure`。
- 查询没有 title 的对象： `_missing_:title`。
- 查询有 title 字段并且不是 null 的对象：`_exists_:title`。

**上面举例根据字段查询，前提是这些字段在 class 的应用内搜索设置里启用了索引。**

#### 通配符和正则查询

`qu?ck bro*` 就是一个通配符查询，`?` 表示一个单个字符，而 `*` 表示 0 个或者多个字符。

通配符其实是正则的简化，可以使用正则查询：

```
name:/joh?n(ath[oa]n)/
```

正则的语法参考 [正则语法](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl-regexp-query.html#regexp-syntax)。

#### 模糊查询

根据文本距离相似度（Fuzziness）来查询。例如 `quikc~`，默认根据 [Damerau-Levenshtein 文本距离算法](http://en.wikipedia.org/wiki/Damerau-Levenshtein_distance)来查找最多两次变换的匹配项。

例如这个查询可以匹配 `quick`、`qukic`、`qukci` 等。

#### 范围查询

```
// 数字 1 到 5：
count:[1 TO 5]

// 2012年内
date:[2012-01-01 TO 2012-12-31]

//2012 年之前
{* TO 2012-01-01}
```

`[]` 表示闭区间，`{}` 表示开区间。

还可以采用比较运算符：

```
age:>10
age:>=10
age:<10
age:<=10
```

#### 查询分组

查询可以使用括号分组：

```
(quick OR brown) AND fox
```

#### 特殊类型字段说明

- objectId 在应用内搜索的类型为 string，因此可以按照字符串查询： `objectId: 558e20cbe4b060308e3eb36c`，不过这个没有特别必要了，你可以直接走 SDK 查询，效率更好。
- createdAt 和 updatedAt 映射为 date 类型，例如 `createdAt:["2015-07-30T00:00:00.000Z" TO "2015-08-15T00:00:00.000Z"]` 或者 `updatedAt: [2012-01-01 TO 2012-12-31]`
- 除了createdAt 和 updatedAt之外的 Date 字段类型，需要加上 `.iso` 后缀做查询： `birthday.iso: [2012-01-01 TO 2012-12-31]`
- Pointer 类型，可以采用 `字段名.objectId` 的方式来查询： `player.objectId: 558e20cbe4b060308e3eb36c and player.className: Player`，pointer 只有这两个属性，应用内搜索不会 include 其他属性。
- Relation 字段的查询不支持。
- File 字段，可以根据 url 或者 id 来查询：`avartar.url: "https://leancloud.cn/docs/app_search_guide.html#搜索_API"`，无法根据文件内容做全文搜索。

### 复杂排序

假设你要排序的字段是一个数组，比如分数数组`scores`，你想根据平均分来倒序排序，并且没有分数的排最后，那么可以传入：

``` sh
 --data-urlencode 'sort=[{"scores":{"order":"desc","mode":"avg","missing":"_last"}}]'
```

也就是 `sort` 可以是一个 JSON 数组，其中每个数组元素是一个 JSON 对象：

``` json
{"scores":{"order":"desc","mode":"avg","missing":"_last"}}
```

排序的字段作为 key，字段可以设定下列选项：

- `order`：`asc` 表示升序，`desc` 表示降序
- `mode`：如果该字段是多值属性或者数组，那么可以选择按照最小值 `min`、最大值 `max`、总和 `sum` 或者平均值 `avg` 来排序。
- `missing`：决定缺失该字段的文档排序在开始还是最后，可以选择 `_last` 或者 `_first`，或者指定一个默认值。

多个字段排序就类似：

``` json
[
  {
    "scores":{"order":"desc","mode":"avg","missing":"_last"}
  },
  {
    "updatedAt": {"order":"asc"}
  }
]
```

### 地理位置信息查询

如果 class 里某个列是 `GeoPoint` 类型，那么可以根据这个字段的地理位置远近来排序，例如假设字段 `location` 保存的是 `GeoPoint`类型，那么查询 `[39.9, 116.4]` 附近的玩家可以通过设定 sort 为：

``` json
{
  "_geo_distance" : {
                "location" : [39.9, 116.4],
                "order" : "asc",
                "unit" : "km",
                "mode" : "min",
   }
}
```

`order` 和  `mode` 含义跟上述复杂排序里的一致，`unit` 用来指定距离单位，例如 `km` 表示千米，`m` 表示米，`cm` 表示厘米等。