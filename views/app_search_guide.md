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

有关查询语法，可以参考 [q 查询语法举例](search-rest-api.html#q_查询语法举例)。

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