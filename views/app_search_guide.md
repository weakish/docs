{% import "views/_helper.njk" as docs %}
# 应用内搜索和 DeepLink 开发指南

在应用内使用全文搜索是一个很常见的需求。例如一个阅读类的应用，里面有很多有价值的文章，开发者会提供一个搜索框，让用户键入关键字后就能查找到应用内相关的文章，并按照相关度排序，就好像我们打开浏览器用 Google 搜索关键字一样。

但应用内的搜索跟浏览器端的搜索还不大一样。应用内的搜索结果，需要打开的不一定是 Web 页面，更可能是应用内的一个页面。常见的场景是，当用户在移动设备上在网页或应用里搜索关键字之后：

- 如果用户安装了应用，直接打开应用并跳转到正确的页面。
- 如果用户没有安装应用，则显示出应用下载页面，让用户来安装应用。
- 如果用户不愿意安装，那么用户仍然可以直接在网页查看搜索结果的内容。

这是效果图，点击 **打开应用** 即可跳转到具体界面：

![image](images/deeplink_tododemo.png)

为了达到上述目标，我们为开发者提供了现成的应用内搜索组件和让应用响应外部调用链接的 DeepLink 功能。

## 开发步骤

### 第一步：设置（可选，建议设置）

首先为你的应用选择一个合适的 URL Scheme，然后设置一下你的应用的下载地址等信息。

#### 设置应用内搜索选项

为了能够让用户直接在搜索结果中打开相关的应用，开发者需要让自己的应用支持外部调用。我们使用 AppURL 来指向一个可以在应用里展现的 Class 数据，格式如下：

```
{URL Scheme}://{ URL Host }/{ Resource Path }
```
进入 [控制台 > 组件 > 应用内搜索 > 基础设置](/dashboard/devcomponent.html?appid={{appid}}#/component/appsearch)，注意一下几个关键的属性：

- **应用名称**：你的应用名称（必须）
- **应用 URL Scheme**：支持外部调用的 URL scheme，我们强制要求采用**域名反转**的方式，类似 Java 语言的 package 命名机制。假设你的应用的域名为 `myapp.company.com`，那么我们要求的 scheme 就是形如 `com.company.myapp` 的字符串。例如我们的 Todo Demo 设置的 scheme 为 `com.leancloud.todo`。如果你没有域名，那么我们推荐你使用 `com.leancloud.{appId的前8位}` 来作为 Scheme。我们会在保存的时候检测 scheme 是否冲突。
- **应用 URL Host**：支持外部调用的 URL Host，可不设置，但是我们推荐使用默认值 `leancloud`，防止跟其他 AppURL 提供商冲突。

其他一些属性，都是用于设置你的应用的下载地址，例如：

- iPhone 应用下载地址：你的应用的 iPhone 版本的 App Store 下载链接，或者你的网站链接。
- iPad 应用下载地址：你的应用的 iPad 版本的 App Store 下载链接，或者你的网站链接。
- ……

这些链接都是可选的，当用户没有安装你的应用的时候，无法直接从搜索结果打开应用，将展示这些下载链接给用户下载你的应用。

设置保存之后，你应该可以通过下列链接访问到你的应用信息：

```
https://{{host}}/1.1/go/{your uri scheme}/
```

查看到你的 App URL 应用设置信息。

例如，我们的 todo 应用就是：

```
https://{{host}}/1.1/go/com.leancloud.todo
```

#### 为 Class 启用搜索

在设置了应用内搜索，选择了适当的 URL Scheme 之后，你需要选择至少一个 Class 为它开启应用内搜索。开启后，该 Class 的数据将被 LeanCloud 自动建立索引，并且可以调用我们的搜索组件或者 API 搜索到内容。

**请注意，启用了搜索的 Class 数据，仍然只能被该应用的认证过的 API 搜索到。其次，搜索结果仍然遵循我们提供的 ACL 机制，如果你为 Class 里的 Object 设定了合理的 ACL，那么搜索结果也将遵循这些 ACL 值，保护你的数据安全。**

在 Class 的 **其他** 菜单里新增了应用内搜索菜单，打开的截图如下：

![image](images/app_search_setting.png)

其中包括三个设定项目：

- **启用**：你可以启用或者关闭这个 Class 的应用内搜索功能，默认是关闭的。每个应用最多允许 5 个 Class 启用应用内搜索。
- **选择开放的列**：你可以选择哪些字段将加入索引引擎用于搜索，每个 Class 最多允许索引 5 个字段（除内置字段外）。请仔细挑选要索引的字段。默认情况下，`objectId`、`createdAt`、`updatedAt` 三个字段将无条件加入开放字段列表。
- **数据模板**：设置这个 Class 的数据展现模板，当外部调用无法打开应用（通常是用户没有安装应用）的时候，将渲染这个模板并展现给用户，默认的模板的只是渲染一些下载链接，你可以自定义这个模板的样式，比如加入你的应用 Logo， 添加 CSS 等。

**如果一个 Class 启用了应用内搜索，但是超过两周没有任何搜索调用，我们将自动禁用该 Class 的搜索功能。**

数据模板支持 [handlebars 模板语法](http://handlebarsjs.com/) ，支持的变量（使用两个大括号包起来 {{ docs.mustache("var") }}）包括：

- **app_uri**<br/>
  (String) 打开应用的 URL，就是前面提到的 `{URL Scheme} : // {URL Host} / {Resource Path}`。
- **applinks**<br/>
  (Object) 应用内搜索配置对象，包括这些属性：
  - app_name
  - android_phone_link
  - android_pad_link
  - iphone_link
  - ipad_link

  等等，也就是应用名称，和各种平台应用的下载链接。
- **qrcode_uri** <br/>
  (String) 本页面的二维码图片链接，用户可以用扫描器扫描打开该页面。
- **object** <br/>
  (Object) 查询出来的 object 对象，默认至少包括：`objectId`、`createdAt`、`updatedAt` 三个属性。其他是你在选择开放的列。

以我们的 Todo Demo 为例，我们启用了 Todo 的应用内搜索功能，选择了开放字段`content`，设定数据模板（消除了css）为：

<pre><code class="lang-html">&lt;div class=&quot;wrap&quot;&gt;
  &lt;div class=&quot;section section-open&quot;&gt;
    &lt;div class=&quot;section-inner&quot;&gt;
      &lt;p&gt;Todo Content: {{ docs.mustache("object.content") }}&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;div class=&quot;section section-open&quot;&gt;
    &lt;div class=&quot;section-inner&quot;&gt;
      &lt;p&gt;已安装 {{ docs.mustache("applinks.app_name") }}？你可以:&lt;/p&gt;
      &lt;p&gt;&lt;a href='{{ docs.mustache("app_uri") }}' class=&quot;btn&quot;&gt;直接打开应用&lt;/a&gt;&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;div class=&quot;section section-download&quot; &gt;
    &lt;div class=&quot;section-inner&quot;&gt;
      &lt;p&gt;或者下载应用:&lt;/p&gt;
      &lt;div &gt;
        &lt;p&gt;&lt;a href='{{ docs.mustache("applinks.iphone_link") }}'&gt;iPhone 应用&lt;/a&gt;&lt;/p&gt;
        &lt;p&gt;&lt;a href='{{ docs.mustache("applinks.ipad_link") }}'&gt;iPad 应用&lt;/a&gt;&lt;/p&gt;
        &lt;p&gt;&lt;a href='{{ docs.mustache("applinks.android_phone_link") }}'&gt;Android 手机应用&lt;/a&gt;&lt;/p&gt;
        &lt;p&gt;&lt;a href='{{ docs.mustache("applinks.android_pad_link") }}'&gt;Android 平板应用&lt;/a&gt;&lt;/p&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
</code></pre>

在 LeanCloud 索引完成数据后，你应当可以通过下列 URL 访问到一条数据，如果在安装了 Todo Demo 应用的移动设备上访问下面这个URL，应该会打开应用展现这条 Todo 的内容:

```
https://{{host}}/1.1/go/com.leancloud.todo/classes/Todo/5371f3a9e4b02f7aee2c9a18

```

如果直接在 PC 浏览器打开上述链接会看到类似如下的数据渲染页面：

![image](images/todo_render.png)

### 第二步：使 App 支持外部调用（可选，仅 DeepLink 需要）

在设置了和启用了 Class 应用内搜索之后，你需要让你的应用响应搜索结果的 URL 调用。

#### Android 应用支持外部调用

在 Android 里，我们可以通过为 Activity 注册 `intent-filter` 来实现。以我们的 Todo Demo 为例，我们想在 `CreateTodo` 这个 Activity 里面展现搜索出来的某一条 Todo 内容，在 `AndroidManifest.xml` 注册 `intent-filter` 配置如下

``` xml
<activity android:name="com.avos.demo.CreateTodo" >
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <!-- 处理以"com.leancloud.todo://leancloud/classes/Todo/"开头的 URI -->
    <data android:scheme="com.leancloud.todo" />
    <data android:host="leancloud" />
    <data android:pathPrefix="/classes/Todo/" />
  </intent-filter>
</activity>
```

- `android:scheme`：设置为你为应用选择的 URL Scheme，这里是 `com.leancloud.todo`
- `android:host`：设置为你为应用选择的 URL Host，默认为 `leancloud`。
- `android:pathPrefix`：具体的资源路径前缀，搜索结果的URL具体路径都将展现为`/classes/{className}/{objectId}`，这里的 className 就是 `Todo`，因此路径前缀为 `classes/Todo/`。
- `action`：必须设置为`android.intent.action.VIEW`，并且加入 `DEFAULT` 和 `BROWSABLE` 的 Category。

接下来在 `CreateTodo` Activity的 `onCreate` 方法里我们接收这个 action 并获取 URL 展现数据：

``` java
   Intent intent = getIntent();
  // 通过搜索结果打开
  if (intent.getAction() == Intent.ACTION_VIEW) {
    // 如果是VIEW action，我们通过getData获取URI
    Uri uri = intent.getData();
    String path = uri.getPath();
    int index = path.lastIndexOf("/");
    if (index > 0) {
    // 获取objectId
    objectId = path.substring(index + 1);
    Todo todo = new Todo();
    todo.setObjectId(objectId);
    // 通过Fetch获取content内容
    todo.fetchInBackground(new GetCallback<AVObject>() {
      @Override
      public void done(AVObject todo, AVException arg1) {
      if (todo != null) {
        String content = todo.getString("content");
        if (content != null) {
        contentText.setText(content);
        }
      }
      }
    });
    }
  }
```

我们通过 adb 的 am 命令来测试配置是否有效，如果能够正常地调用 `CreateTodo`页面，则证明配置正确：

``` sh
adb shell am start -W -a "android.intent.action.VIEW" -d "yourUri" yourPackageName
```

在 Todo 例子里就是：

``` sh
adb shell am start -W -a "android.intent.action.VIEW"  \
  -d "com.leancloud.todo://leancloud/classes/Todo/5371f3a9e4b02f7aee2c9a18" \
  com.avos.demo
```

如果一切正常的话，这将直接打开应用并在 `CreateTodo` 里展现 objectId 为 `536cf746e4b0d914a19ec9b3` 的 Todo 对象数据数据。


#### iOS 应用支持外部调用

你可以通过编辑应用 [information property list](http://developer.apple.com/library/ios/#documentation/general/Reference/InfoPlistKeyReference/Introduction/Introduction.html)，使得你的应用可以处理 URL Scheme。下图展示了如何为你的应用注册 URL Scheme。

![image](images/ios_register_url_scheme.png)

需要注意的是，你这里的 URL Scheme 应该和你在我们网站上面设置的 URL Scheme 保持一致。

注册完了 URL Scheme，你还需要实现 [application method openURL](http://developer.apple.com/library/ios/#DOCUMENTATION/UIKit/Reference/UIApplication_Class/Reference/Reference.html#jumpTo_37) 。对于 TodoDemo，应该按照如下方法实现。

``` objc
/*
 * 与 Android 类似，这里的 url.path 应该是 "com.leancloud.todo://leancloud/classes/Todo/5371f3a9e4b02f7aee2c9a18"
 */
(BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    NSString *objectId = [url.path lastPathComponent];

    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    todo.objectId = objectId;
    [todo fetchInBackgroundWithBlock:^(AVObject *object, NSError *error) {
        // 调用展示数据的方法
        // code is here
    }];
    return YES;
}
```


### 第三步：在应用内集成搜索组件

#### Android 集成

##### 导入SDK

下载 [应用内搜索模块](sdk_down.html)，解压缩 `avossearch.zip`，将 `libs` 下的 `avossearch-v{version}.jar` 包加入你的 `libs` 下面。

之后，你需要将 `res` 下的资源文件夹拷贝并且合并到你工程的 `res` 目录下，更改资源文件的内容并不影响 SDK 工作，但是请不要改动资源的文件名和文件内资源 ID。

应用内搜索组件的资源文件都以 `leancloud_search` 开头。

##### 添加代码，实现基础功能

###### 配置 AndroidManifest.xml

打开 `AndroidManifest.xml` 文件，在里面添加需要用到的 activity 和需要的权限:

``` xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <application...>
     <activity
      android:name="com.avos.leancloud.search.SearchActivity">
     </activity>
  </application>
```

注：由于一些 UI 的原因，**应用内搜索的最低 API level 要求是 12**，如你需要更低的版本支持，请参照文档中的高级定制部分进行开发。

###### 添加代码实现基础的应用内搜索功能

``` java
AVSearchQuery searchQuery = new AVSearchQuery("keyword");
SearchActivity.setHighLightStyle("<font color='#E68A00'>");//通过这个方法，你可以像指定html tag一样设定搜索匹配字符的高亮风格
searchQuery.search();//即可打开一个显式搜索结果的Activity
```

###### 结果排序

`AVSearchQuery` 支持排序，通过 `orderByAscending` 和 `orderByDescending` 传入要排序的字段，就可以实现按照升序或者降序排序搜索结果。多字段排序，通过 `addAscendingOrder` 和 `addDescendingOrder` 来添加多个排序字段。大体上，这块 API 调用跟 `AVQuery` 是类似的：

``` java
AVSearchQuery searchQuery = new AVSearchQuery("keyword");
searchQuery.orderByAscending("score"); //根据score字段升序排序。
```

更复杂的排序功能，例如根据地理位置信息远近来排序，或者排序的字段是一个数组，你想使用数组内的最高值来排序等，都需要通过 `AVSearchSortBuilder` 来定制。

根据地理信息位置排序：

``` java
AVSearchSortBuilder builder = AVSearchSortBuilder.newBuilder();
builder.whereNear("location",new AVGeoPoint(30,30));
searchQuery.setSortBuilder(builder);
```

根据数组内的最高值来排序，并且如果文档里没有这个值就放到最后：

``` java
builder.orderByDescending("scores","max","last");
searchQuery.setSortBuilder(builder);
```

更多方法请参考 API 文档。

##### 高级定制指南

由于每个应用的数据、UI展现要求都有很大的差别，所以单一的搜索组件界面仅仅能够满足较为简单的要求，所以我们将数据接口开放出来以便你能够方便的定制属于你自己的应用内搜索结果页面。

``` java
    AVSearchQuery search = new AVSearchQuery("test-query");
    search.setLimit(100);
    search.findInBackgroud(new FindCallback<AVObject>() {

    @Override
    public void done(List<AVObject> objects, AVException exception) {
      if (exception == null) {
       //你可以使用 objects来展现自己的UI
       for(AVObject o : objects){
        //这里可以得到搜索结果和你的应用所对应的AppUrl
        String appUrl = o.getString(AVConstants.AVSEARCH_APP_URL);
        //这里可以得到搜索结果对应的语法高亮
        Map<String,List<String>> resultHighLights = ((Map<String, List<String>>)) o.get(AVConstants.AVSEARCH_HIGHTLIGHT);
       }
      } else {
       //Exception happened
      }
      }
    }
    });
```

你也可以参考 [我们的 `SearchActivity`](https://github.com/leancloud/leancloud-sdk/blob/master/android/avossearch/src/com/avos/avoscloud/search/SearchActivity.java) 来更好的指定你自己的搜索结果页面。

##### 分页查询

通过 `findInBackgroud` 方法做定制查询的话，如果需要分页，你仅仅需要通过多次调用同一个 `AVSearchQuery` 的 `findInBackgroud` 即可实现翻页效果，它将返回下一页搜索结果，直到末尾。

搜索结果的文档总数可以通过 `AVSearchQuery` 的 `getHits` 方法得到。

##### 查询语法简介

在AVSearchQuery中间可以设置query语句来指定查询条件：`AVSearchQuery.setQuery(String query)`。

###### 基础搜索

传入最简单的字符串查询

``` java
AVSearchQuery query = new AVSearchQuery("basic-query");//搜索包含basic-query的值
```

###### 字段搜索

你也可以通过指定某个特定字段的值或者值域区间

``` java
query.setQuery("status:active");//搜索status字段包含active
query.setQuery("title:(quick brown)");//搜索title包含quick或者brown
query.setQuery("age:>=10");//搜索年龄大于等于10的数据
query.setQuery("age:(>=10 AND < 20)");//搜索年龄在[10,20)区间内的数据
```

###### 模糊搜索

``` java
  query.setQuery("qu?c*k");//此处?代表一个字符，*代表0个或者多个字符。类似正则表达式通配符
```

更多更详细的语法资料，你可以参考 Elasticsearch 文档中 [Query-String-Syntax](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax) 一节。

#### iOS 集成

##### 添加代码获取搜索结果

你可以参照如下代码构造 AVSearchQuery 并获取搜索结果。

``` objc
AVSearchQuery *searchQuery = [AVSearchQuery searchWithQueryString:@"test-query"];
searchQuery.className = @"className";
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

有关查询语法，可以参考上文 Android 部分的介绍。

对于分页，这里需要特别做出说明。因为每次请求都有 limit 限制，所以一次请求可能并不能获取到所有满足条件的记录。你可以多次调用同一个 `AVSearchQuery` 的 `findObjects` 或者 `findInBackground` 获取余下的记录。另外，`hits` 属性用于标示所有满足查询条件的记录数。

``` objc
/*!
 *  符合查询条件的记录条数，由 SDK 自动修改。
 */
@property (nonatomic, assign) NSInteger hits;

/*!
 *  当前页面的scroll id，用于分页，可选。
 #  @warning 如非特殊需求，请不要手动设置 sid。每次 findObjects 之后，SDK 会自动更新 sid。如果手动设置了错误的sid，将无法获取到搜索结果。
 *  有关scroll id，可以参考 http://www.elasticsearch.org/guide/en/elasticsearch/guide/current/scan-scroll.html
 */
@property (nonatomic, retain) NSString *sid;

```

#### JavaScript 指南

JavaScript SDK v0.5.1 版本开始支持应用内搜索 API:

``` javascript
     var query = new AV.SearchQuery('GameScore');
     query.queryString('*');
     query.find().then(function(results) {
       console.log("Find " + query.hits() + " docs.");
       //处理 results 结果
     }).catch(function(err){
       //处理 err
     });


```

当 `query.hasMore()` 返回 `true` 的时候，你可以不停地调用 `query.find()` 来向下翻页。

如果在不同请求之间无法保存查询的 query 对象，可以利用 sid 做到翻页，一次查询是通过 `query._sid` 来标示的，你可以通过 `query.sid("上次查询的query._sid")` 来重建查询 query 对象，继续翻页查询。sid 在 5 分钟内有效。

复杂排序可以使用 `AV.SearchSortBuilder`：

``` javascript
  var query = new AV.SearchQuery('GameScore');
  //假设 scores 是分数组成的数组，根据分数里的平均分倒序排序，并且没有分数的排在最后。
  query.sortBy(new AV.SearchSortBuilder().descending('scores','avg', 'last'));
  query.queryString('*');
  query.find().then(function(results) {
       //处理结果
  });
```

更多 API 请参考 [AV.SearchQuery](https://leancloud.github.io/javascript-sdk/docs/AV.SearchQuery.html) 和 [AV.SearchSortBuilder](https://leancloud.github.io/javascript-sdk/docs/AV.SearchSortBuilder.html) 的文档。

## 搜索 API

我们提供一个 `/1.1/search/select` 来做应用内搜索，前提是你参考前面的文档，启用了应用内搜索。

假设你对 GameScore 类启用了应用内搜索，你就可以尝试传入关键字来搜索，比如查询关键字 `dennis`，限定返回结果 200 个，并且按照 `score` 降序排序：

``` sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/select?q=dennis&limit=200&clazz=GameScore&order=-score"
```

返回类似：

``` json
{
results: [
  {
    _app_url: "http://stg.pass.com//1/go/com.leancloud/classes/GameScore/51e3a334e4b0b3eb44adbe1a",
    _deeplink: "com.leancloud.appSearchTest://leancloud/classes/GameScore/51e3a334e4b0b3eb44adbe1a"
    updatedAt: "2011-08-20T02:06:57.931Z",
    playerName: "Sean Plott",
    objectId: "51e3a334e4b0b3eb44adbe1a",
    createdAt: "2011-08-20T02:06:57.931Z",
    cheatMode: false,
    score: 1337
  },
  ……
],
sid: "cXVlcnlUaGVuRmV0Y2g7Mzs0NDpWX0NFUmFjY1JtMnpaRDFrNUlBcTNnOzQzOlZfQ0VSYWNjUm0yelpEMWs1SUFxM2c7NDU6Vl9DRVJhY2NSbTJ6WkQxazVJQXEzZzswOw=="
}
```

查询的参数支持：

参数|约束|说明
---|---|---
`skip`||跳过的文档数目，默认为 0
`limit`||返回集合大小，默认 100，最大 1000
`sid`|可选|第一次查询结果中返回的 sid 值，用于分页，对应于 elasticsearch 中的 scoll id。
`q`|必须|查询文本，支持类似 google 的搜索语法。
`fields`|可选|逗号隔开的字段列表，查询的字段列表
<code class="text-nowrap">highlights</code>|可选|高亮字段，可以是通配符 `*`，也可以是字段列表逗号隔开的字符串。如果加入，返回结果会多出 `_highlight` 属性，表示高亮的搜索结果内容，关键字用 `em` 标签括起来。
`clazz`|可选|类名，如果没有指定或者为空字符串，则搜索所有启用了应用内搜索的 class。
`order`|可选|排序字段，形如 `-score,createdAt` 逗号隔开的字段，负号表示倒序，可以多个字段组合排序。
`include`||关联查询内联的 Pointer 字段列表，逗号隔开，形如 `user,comment` 的字符串。**仅支持 include Pointer 类型**。
`sort`||复杂排序字段，例如地理位置信息排序，见下文描述。

返回结果属性介绍：

- `results`：符合查询条件的结果文档。
- `hits`：符合查询条件的文档总数
- `sid`：标记本次查询结果，下次查询继续传入这个 sid 用于查找后续的数据，用来支持翻页查询。

返回结果 results 列表里是一个一个的对象，字段是你在应用内搜索设置里启用的字段列表，并且有两个特殊字段：

- `_app_url`：应用内搜索结果在网站上的链接。
- `_deeplink`：应用内搜索的程序调用 URL，也就是 deeplink。

最外层的 `sid` 用来标记本次查询结果，下次查询继续传入这个 sid 将翻页查找后 200 条数据：

``` sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/select?q=dennis&limit=200&clazz=GameScore&order=-score&sid=cXVlcnlUaGVuRmV0Y2g7Mzs0NDpWX0NFUmFjY1JtMnpaRDFrNUlBcTNnOzQzOlZfQ0VSYWNjUm0yelpEMWs1SUFxM2c7NDU6Vl9DRVJhY2NSbTJ6WkQxazVJQXEzZzswOw"
```

直到返回结果为空。

### 自定义分词

默认情况下， String 类型的字段都将被自动执行分词处理，我们使用的分词组件是 [mmseg](https://github.com/medcl/elasticsearch-analysis-mmseg)，词库来自搜狗。但是很多用户由于行业或者专业的特殊性，一般都有自定义词库的需求，因此我们提供了自定义词库的功能。应用创建者可以通过 [LeanCloud 控制台 > 组件 > 应用内搜索 > 自定义词库](/dashboard/devcomponent.html?appid={{appid}}#/component/custom_param) 上传词库文件。

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

自定义词库生效后，**仅对新添加或者更新的文档/记录才有效**，如果需要对原有的文档也生效的话，需要在 **存储** > 选择对应的 Class > **其他** > **应用内搜索** 菜单中点击「强制重建索引」按钮，重建原有索引。


### q 查询语法举例

q 的查询走的是 elasticsearch 的 [query string 语法](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax)。建议详细阅读这个文档。这里简单做个举例说明。

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

正则的语法参考 [正则语法](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-regexp-query.html#regexp-syntax)。

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

也就是 `sort` 可以是一个 JSON 数组，其中每个数组元素是一个  JSON 对象：

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

## moreLikeThis 相关性查询

除了 `/1.1/search/select` 之外，我们还提供了 `/1.1/search/mlt` 的 API 接口，用于相似文档的查询，可以用来实现相关性推荐。

假设我们有一个 Class 叫 `Post` 是用来保存博客文章的，我们想基于它的标签字段 `tags` 做相关性推荐，可以通过：

``` sh
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
  ……
],
"sid": null}
```

除了可以通过指定 `like` 这样的相关性文本来指定查询相似的文档之外，还可以通过 likeObjectIds 指定一个对象的 objectId 列表，来查询相似的对象：

```
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  "https://{{host}}/1.1/search/mlt?likeObjectIds=577e18b50a2b580057469a5e&clazz=Post&fields=tags"
```

这次我们换成了查找和 `577e18b50a2b580057469a5e` 这个 objectId 指代的对象相似的对象。

更详细的查询参数说明：

参数|约束|说明
---|---|---
`skip`|可选|跳过的文档数目，默认为 0
`limit`|可选|返回集合大小，默认 100，最大 1000
`fields`|可选|相似搜索匹配的字段列表，用逗号隔开，默认为所有索引字段 `_all`
`like`|可选|**和 `likeObjectIds` 参数二者必须提供其中之一**。代表相似的文本关键字。
`likeObjectIds`|可选|**和 `like` 参数二者必须提供其中之一**。代表相似的对象 objectId 列表，用逗号隔开。
`clazz`|必须|类名
`include`|可选|关联查询内联的 Pointer 字段列表，逗号隔开，形如 `user,comment` 的字符串。**仅支持 include Pointer 类型**。
`min_term_freq`|可选|**文档中一个词语至少出现次数，小于这个值的词将被忽略，默认是 2**，如果返回文档数目过少，可以尝试调低此值。
`min_doc_freq`|可选|**词语至少出现的文档个数，少于这个值的词将被忽略，默认值为 5**，同样，如果返回文档数目过少，可以尝试调低此值。
`max_doc_freq`|可选|词语最多出现的文档个数，超过这个值的词将被忽略，防止一些无意义的热频词干扰结果，默认无限制。

更多内容参考 [ElasticSearch 文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-mlt-query.html)。
