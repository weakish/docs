{% import "views/_storage.md" as storagePartial %}

#  数据存储开发指南 &middot; Unity

如果还没有安装 LeanCloud Unity SDK，请阅读 [SDK 下载](./sdk_down.html) 来获得该 SDK。我们的 SDK 兼容 Unity 5 及更高版本，支持使用 Unity 开发的 iOS、Android、Windows Phone 8、Windows Store、Windows Desktop，以及网页游戏。

如果希望从演示项目中学习，请访问我们的 GitHub 资源库，下载 [Unity SDK Demos](https://github.com/leancloud/unity-sdk-demos) 。

## 介绍

Unity 支持 Mono 使用 .NET 语言来实现跨平台开发的解决方案，所以 LeanCloud 采用了 C# 来实现客户端的 SDK。如果你有 .NET 方面的编程经验，就很容易掌握 LeanCloud Unity SDK 接口的风格和用法。

LeanCloud Unity SDK 在很多重要的功能点上都采用了微软提供的 [基于任务的异步模式 (TAP)](http://msdn.microsoft.com/zh-cn/library/hh873175.aspx)，所以如果你具备 .NET Framework 4.5 的开发经验，或对 .NET Framework 4.5 的 新 API  有所了解，将有助于快速上手。

## 快速入门

建议在阅读本文之前，先阅读 [SDK 安装指南](start.html)，了解如何配置和使用 LeanCloud。

## 应用

部署在 LeanCloud 云端的每个应用都有自己的 ID 和客户端密钥，客户端代码应该使用它们来初始化 SDK。

LeanCloud 的每一个账户都可以创建多个应用。同一个应用可分别在测试环境和生产环境，部署不同的版本。

### 初始化

在 `LeanCloud.Core.dll` 中有一个 `AVInitializeBehaviour` 把它拖拽到任意一个 `GameObject` 上然后根据下图填写 Application ID 以及 Application Key：
  
  ![unity-init](images/unity-init.png)


默认中国大陆节点对应的 `Region` 是 `Public_CN`,如果是北美节点请选择 `Public_US`。

目前 Unity 的初始化**只允许**用 `GameObject` 绑定 `AVInitializeBehaviour` 脚本的方法，**不可以**使用其他方式显式调用 `AVClient.Initialize` 的方法。

## 对象

### AVObject

在 LeanCloud 上，数据存储是围绕 `AVObject` 进行的。每个 `AVObject` 都包含与 JSON 兼容的键值对（key-value）数据。该数据不需要定义结构（schema），因此不用提前指定 `AVObject` 都有哪些键，只要直接设定键值对即可。

例如，记录游戏玩家的分数，直接创建一个独立的 `AVObject` 即可：

```json
score: 1337, playerName: "Steve", cheatMode: false
```

键，必须是由字母、数字或下划线组成的字符串；自定义的键，不能以 `_`（下划线）开头。值，可以是字符串、数字、布尔值，或是数组和字典。

每个 `AVObject` 都必须有一个类（Class）名称，以便区分不同类型的数据。例如，游戏分数这个对象可取名为 `GameScore`。

我们建议将类和键分别按照 `NameYourClassesLikeThis` 和 `nameYourKeysLikeThis` 这样的惯例来命名，即区分第一个字母的大小写，这样可以提高代码的可读性和可维护性。

### 保存对象

接下来，需要将上文中的 `GameScore` 存储到 LeanCloud 的服务。LeanCloud 的相关接口和 `IDictionary<string, object>` 类似，但只有在调用 `SaveAsync` 方法时，数据才会被真正保存下来。

```c#
AVObject gameScore = new AVObject("GameScore");
gameScore["score"] = 1337;
gameScore["playerName"] = "Neal Caffrey";
Task saveTask = gameScore.SaveAsync();
```

{% if node=='qcloud' %}
运行以上代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 `数据管理`  页面来查看数据的存储情况。
{% else %}
运行以上代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 [数据管理](/data.html?appid={{appid}})  页面来查看数据的存储情况。
{% endif %}

如果保存成功，`GameScore` 的数据列表应该显示出以下记录：

```json
objectId: "53706cd1e4b0d4bef5eb32ab", score: 1337, playerName: "Neal Caffrey",
createdAt:"2014-05-12T14:40:17.706Z", updatedAt:"2014-05-12T14:40:17.706Z"
```

在此要特别说明两点：

1. 运行此代码前，不用配置或设置 `GameScore` 类，LeanCloud 会自动创建这个类。
2. 为更方便地使用 LeanCloud，以下字段不需要提前指定：
  * `objectId` 是为每个对象自动生成的唯一的标识符。
  * `createdAt` 和 `updatedAt` 分别代表每个对象在 LeanCloud 中创建和最后修改的时间，它们会被自动赋值。

  在执行保存操作之前，这些字段不会被自动保存到 `AVObject` 中。

### 检索对象

将数据保存到 LeanCloud 上实现起来简单而直观，获取数据也是如此。如果已知 `objectId`，用 `AVQuery` 就可以得到对应的 `AVObject` ：

```c#
AVQuery<AVObject> query=new AVQuery<AVObject>("GameScore");
query.GetAsync("53706cd1e4b0d4bef5eb32ab").ContinueWith(t =>
{
	AVObject gameScore = t.Result;//如果成功获取，t.Result将是一个合法有效的AVObject
});
```
要从检索到的 `AVObject` 对象中获取值，可以使用相应数据类型的 `Get<T>范型` 方法：

```c#
int score = gameScore.Get<int>("score");
string playerName = gameScore.Get<string>("playerName");
```
### 在后台运行

要想用 Unity 打造一款有良好用户体验，并能实时响应的游戏，应该遵循一个最基本的原则：不应该在主线程上进行耗时较长的操作，尤其是网络访问类的操作。这些操作应该使用后台进程来处理。

为了让代码简洁而优雅，我们在  Unity 上实现了与 .NET Framework 4.5 所采用的 [基于任务的异步模式 (TAP)](http://msdn.microsoft.com/zh-cn/library/hh873175.aspx) 相同的异步操作。我们添加了一个 `Task` 类，一个 `Task` 代表一个异步的操作。

`Task` 的典型用法，是从一个方法返回一个 `Task`，并且它提供了一个接口，可以在执行 `Task` 之前，传入要处理 `Task` 执行结果的方法代理。

当一个 `Task` 被返回，说明这个 `Task` 已经开始执行。这种基于 `Task` 的编程模型并不等同于多线程编程模型，它仅仅代表这项操作正在执行，但并未指明它运行在哪个线程之中。

[基于任务的异步模式 (TAP)](http://msdn.microsoft.com/zh-cn/library/hh873175.aspx) 的编程模式，相对于回调模型和事件模型，有很多可取之处，具体还需要开发者对 TAP 编程模型有更深入的了解。

基于上述观点，在 LeanCloud Unity SDK 中，所有异步操作都会返回一个 `Task`。关于 `Task` 的具体介绍，可以参考 [任务](#任务) 一节。

<!--TODO: ###离线存储对象 ?-->

### 更新对象

更新对象和保存对象有点相似，只是更新对象会覆盖同名属性的值，在调用 `SaveAsync` 之后，数据会发送到服务端来让修改生效。

```c#
var gameScore = new AVObject("GameScore")
{
	{ "score", 1338 },
	{ "playerName", "Peter Burke" },
	{ "cheatMode", false },
	{ "skills", new List<string> { "FBI", "Agent Leader" } },
};//创建一个全新的 GameScore 对象
gameScore.SaveAsync().ContinueWith(t =>//第一次调用 SaveAsync 是为了增加这个全新的对象
{
	// 保存成功之后，修改一个已经在服务端生效的数据，这里我们修改 cheatMode 和 score
	// LeanCloud 只会针对指定的属性进行覆盖操作，本例中的 playerName 不会被修改
	gameScore["cheatMode"] = true;
	gameScore["score"] = 9999;
	gameScore.SaveAsync();//第二次调用是为了把刚才修改的2个属性发送到服务端生效。
});
```

<!--TODO: 
### 计数器
### 数组
-->

{{ storagePartial.avobjectSubclass() }}

### 删除对象

要删除某个对象，使用 `AVObject` 的 `DeleteAsync` 方法。

```c#
Task deleteTask = myObject.DeleteAsync();
```
如果仅仅想删除对象的某一个属性，使用 `Remove` 方法。

```c#
//执行下面的语句会将 playerName 字段置为空
myObject.Remove("playerName");

// 将删除操作发往服务器生效。
Task saveTask = myObject.SaveAsync();
```
### 关系

软件程序，就是在抽象现实中，对象之间的关系在计算机世界里的解释和展现。有对象必然就会有对象之间的关系，LeanCloud 为这种传统的关系型数据提供了解决方案，减少了代码量，让代码变得简洁且易于维护。

假设这样一种场景：做一款时髦的相亲社交软件，男孩会在自己的资料里面标明自己喜欢的女生类型，于是有如下代码：

```c#
AVObject girlType = new AVObject("GirType");
girlType["typeName"] = "Hot";
AVObject beckham = new AVObject("Boy");
beckham["name"]= "David Beckham";
beckham["age"] = 38;
beckham["focusType"] = girlType;
Task saveTask =	beckham.SaveAsync();//保存 beckham 的时候会自动将 girlType 也保存到服务器。
```
当然，已存在的对象可以通过 `ObjectId` 来与目标对象进行关联：

```c#
beckham["focusType"] = AVObject.CreateWithoutData("GirType", "5372d119e4b0d4bef5f036ae");
```
需要注意，当从 LeanCloud 上读取某一对象的数据时，默认的 `Fetch` 方法不会加载与之相关联的对象的字段，只有执行以下代码后，这些关联数据字段（如上例中 Boy 的 focusType 字段）才会被实例化。

```c#
AVObject focusType = beckham.Get<AVObject>("focusType");
Task<AVObject> fetchTask = focusType.FetchIfNeededAsync();
```
## 查询

通过 `objectId` 来检索数据，显然无法满足需求，所以 LeanCloud Unity SDK 还提供了更多的查询方法来简化操作。

首先需要明确最核心的一点，在我们的 SDK 中，`AVQuery` 对象的所有以 `Where` 开头的方法，以及限定查询范围类的方法（`Skip`、 `Limit`、 `ThenBy`、 `Include` 等）都会返回一个全新的对象，它并不是在原始的 `AVQuery` 对象上修改内部属性。比如:

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
query.WhereEqualTo("score", 999);//注意：这是错误的！！！
query.FindAsync();
```
**以上代码是用户经常会犯的错误案例，请勿拷贝到项目中使用！**

上面那段代码会返回 `GameScore` 中所有的数据，而不是所设想的只有 score 等于 999 的数据。正确的写法是：

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore").WhereEqualTo("score", 999);
```
以此类推，`AVQuery<T>` 的所有复合查询条件都应该使用 `.` 这个符号来创建链式表达式。例如，查找所有 score 等于 999，且 name 包含 neal 的 `GameScore`：

```c#
AVQuery<AVObject> query = new AVQuery<AVObject> ("GameScore").WhereEqualTo("score", 999).WhereContains("playerName","neal");
```

### 基本查询

`AVQuery<T>.WhereEqualTo`， 逻辑上可以理解为类似于 SQL 语句中的 `=` 操作。

```sql
SELECT * FROM Persons WHERE FirstName = 'Bush'
```

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore").WhereEqualTo("score", 999);
query.FindAsync().ContinueWith(t => {
	IEnumerable<AVObject> avObjects = t.Result;
	//获取返回记录数
	int sum = avObjects.Count();
});
```

### 查询条件

要过滤掉特定键的值时，可以使用 `whereNotEqualTo` 方法。比如检索 playerName 不等于 steve 的数据，可以这样写：

```c#
query = query.WhereNotEqualTo("playerName", "steve");
```
同时包含多个约束条件的查询：

```c#
query = query.WhereNotEqualTo("playerName", "steve");
query = query.WhereGreaterThan("age", 18);//这样书写是为了文档阅读方便，但是我们还是比较推荐上一节介绍的链式表达式去创建 AVQuery
```

约束条件可以设置多个，它们彼此是 `AND` 的关系。

当仅需要查询返回较少的结果时，可以使用 `Limit` 方法来限定数量：

```c#
query = query.Limit(10);
```

在数据较多的情况下，分页显示数据是比较合理的解决办法，limit 默认 100，最大1000，在 0 到 1000 范围之外的都强制转成默认的 100。
Skip 方法可以做到跳过首次查询的多少条数据来实现分页的功能。比如，一页显示10条数据，那么跳过前10个查询结果的方法就是：

```javascript
query = query.Skip (10);
```
对应数据的排序，如数字或字符串，你可以使用升序或降序的方式来控制查询数据的结果顺序：

```javascript
// 根据score字段升序显示数据
query = query.OrderBy("score");

// 根据score字段降序显示数据
query = query.OrderByDescending("score");

//各种不同的比较查询：
// 分数 < 50
query = query.WhereLessThan("score", 50);

//分数 <= 50
query = query.WhereLessThanOrEqualTo("score", 50);

//分数 > 50
query.WhereGreaterThan("score", 50);

//分数 >= 50
query = query.WhereGreaterThanOrEqualTo("score", 50);
```
如果你想查询匹配几个不同值的数据，如：要查询“steve”，“chard”，“vj”三个人的成绩时，你可以使用 WhereContainedIn（类似 SQL 中的 in 查询）方法来实现。

```javascript
var names = new[] { "steve", "chard", "vj" };
query = query.WhereContainedIn("playerName", names);
```

相反，你想查询排除“steve”，“chard”，“vj”这三个人的其他同学的信息（类似 SQL 中的 not in 查询），你可以使用 WhereNotContainedIn 方法来实现。

```javascript
query = query.WhereNotContainedIn ("playerName", names);
```
对字符串值的查询 查询包含字符串的值，有几种方法。你可以使用任何正确的正则表达式来检索相匹配的值，使用 WhereMatches 方法：

```javascript
query = query.WhereMatches("playerName", "^[A-Z]\\d");
```
查询字符串中包含“XX“内容，可用如下方法：

```javascript
// 查询playerName字段的值中包含“ste“字的数据
query = query.WhereContains("playerName", "ste");

// 查询playerName字段的值是以“cha“字开头的数据
query = query.WhereStartsWith("playerName", "cha");

// 查询playerName字段的值是以“vj“字结尾的数据
query = query.WhereEndsWith("playerName", "vj");
```

### 数组值的查询
如果一个 Key 对应的值是一个数组，你可以查询 key 的数组包含了数字 2 的所有对象:

```javascript
// 查找出所有arrayKey对应的数组同时包含了数字2的所有对象
query = query.WhereEqualTo("arrayKey", 2);
```

同样，你可以查询出 Key 的数组同时包含了 2,3 和 4 的所有对象：

```javascript
//查找出所有arrayKey对应的数组同时包含了数字2,3,4的所有对象。
List<int> numbers = new List<int>();
numbers.Add(2);
numbers.Add(3);
numbers.Add(4);
query = query.WhereContainsAll("arrayKey", numbers);
```

### 查询对象个数
如果你只是想统计有多少个对象满足查询，你并不需要获取所有匹配的对象，可以直接使用 `CountAsync` 替代 `FindAsync`。例如，查询一个特定玩家玩了多少场游戏：

```javascript
query = query.WhereNotEqualTo ("playerName", "steve");
query.CountAsync().ContinueWith(t =>
{
    int count = t.Result;
});
```
`对于超过 1000 个对象的查询，这种计数请求可能被超时限制。他们可能遇到超时错误或者返回一个近似的值。因此，请仔细设计你的应用架构来避免依赖这种计数查询。`

*查询数量限定的方法'Limit(int)'在CountAsync中不会生效。*
### 关系查询
LeanCloud支持用关系`AVRelation`关联2个对象，当然也支持用关系查询来获取相关联的对象。

```javascript
AVObject girlType = new AVObject ("GirType");
girlType ["typeName"] = "Hot";
girlType ["ageMax"] = 27;
girlType ["ageMin"] = 18;
AVObject beckham = new AVObject ("Boy");
beckham["name"]="David Beckham";
beckham ["age"] = 38;
beckham ["focusType"] = girlType;
//保存beckham的时候会自动将girlType也保存到服务器。
Task saveTask = beckham.SaveAsync ().ContinueWith (t =>
	{
		AVQuery<AVObject> boyQuery=new AVQuery<AVObject>("Boy");
		boyQuery = boyQuery.WhereEqualTo("focusType", girlType);
		boyQuery.FindAsync().ContinueWith(s=>
		{
			IEnumerable<AVObject> boys = s.Result;
		});
	});
```
关系的内嵌查询可以帮助开发者用简洁的代码处理复杂的关系内嵌查询，比如要查询`查询所有关注了年龄小于27岁女生类型的那些男生们`：

```javascript
AVQuery<AVObject> girlTypeQuery=new AVQuery<AVObject>("GirType");//
girlTypeQuery = girlTypeQuery.WhereLessThan ("ageMax", 27);//年龄小于27的萌妹纸
AVQuery<AVObject> query = new AVQuery<AVObject>("Boy");
query = query.WhereMatchesQuery ("focusType", girlTypeQuery);//找出喜欢这些类型的男生们
```

请注意，默认的 limit 限制 100 也同样作用在内嵌查询上。因此如果是大规模的数据查询，你可能需要仔细构造你的查询对象来获取想要的行为。反之，不想匹配某个子查询，你可以使用 `WhereDoesNotMatchQuery` 方法，代码不再敖述。

查询已经选择了喜欢的类型的男生，并且是限定在最近10个加入系统的男生，可以如此做：

```javascript
AVQuery<AVObject> query = new AVQuery<AVObject>("Boy");
query = query.OrderByDescending("createdAt");
query = query.Limit(10);
query = query.Include("focusType");
```
你可以使用 dot（英语句号:"."）操作符来多层 Include 内嵌的对象。比如，你还想进一步获取`GirType`所关联的女生（就是那些标明了自己隶属于这个类型的女生）：

```javascript
query = query.Include("focusType.girls");
```

## 任务

### 延续任务

每一个`Task`都会包含一个叫做`ContinueWith`的方法，它表示`Task`执行完毕之后的`延续任务`的代理。你可以获得`Task`的执行结果，或者通过访问`Task`自带的属性，判断任务是否执行完毕，或者任务是否有异常：

```javascript
gameScore.SaveAsync().ContinueWith(t=>
{
	if(t.IsCanceled)
	{
		//保存因为某些原因取消了
	}
	else if(t.IsFaulted)
	{
		//有异常,获取出来以便处理
		AggregateException exception = t.Exception;
	}
	else
	{
		//保存成功了
	}
});
```

### 任务的链式串联

如果您有JavaScript上jQuery的编程经验，链式写法不会陌生。`延续任务`也会返回一个`Task<T>`，这个泛型`T`就是`xxxxAsync()`这类命名方法的实际方法的返回值，所以`ContinueWith`的参数就是`xxxxAsync()`方法的返回值，这跟传统回调模型又很相似了（注：只是形似，本质不一样），这样在`xxxxAsync()`方法执行完毕之后，你可以在`ContinueWith`中拿到执行结果。我们提供了一个`Unwrap`方法，它返回的是一个`Task`，它能保证前一个`Task`完成之后，再执行`ContinueWith`里面的`Task`，这样就能保证可以在一个链式的任务里面起到逐步执行并且能很好的区分模块。例如下面这段实例代码：
它要实现的功能是：
* 给排名第一的玩家添加“一周之星”的次数；
* 给排名第一的玩家奖励100个金币，给第二名的玩家奖励80个金币；
（算法不值得参考，只是提供`链式任务`的写法参考）

```javascript
AVQuery<AVObject> query =AVObject.GetQuery("GameScore").OrderByDescending("score");
query.FindAsync().ContinueWith(t =>
{
	var players = t.Result;
	IEnumerator<AVObject> enumerator = players.GetEnumerator();
	enumerator.MoveNext();
	var golden_player = enumerator.Current;//获取目前得分排名第一的玩家
	int currentweeklyStar = golden_player.Get<int>("weeklyStar");
	int currentAward=golden_player.Get<int>("gold");
	golden_player["weeklyStar"] =currentweeklyStar + 1;//本周之星 次数加1
	golden_player["gold"] = currentAward + 100;//奖励他（她）100个金币
	return golden_player.SaveAsync();
	}).Unwrap().ContinueWith(t =>
	{
		return query.FindAsync();//为了保证数据正确可以再查一遍
	}).Unwrap().ContinueWith(t =>
	{
		var players = t.Result;
		IEnumerator<AVObject> enumerator = players.GetEnumerator();
		enumerator.MoveNext();
		enumerator.MoveNext();
		var second_player=enumerator.Current;//获取排名第二的玩家
		int currentAward=second_player.Get<int>("gold");
		second_player["gold"]=currentAward + 80;//奖励第二名80个金币
		return second_player.SaveAsync();
	}).Unwrap().ContinueWith(t=>
	{
       //这里还能继续添加持续的业务逻辑
       //......
	});//这种风格可以使业务逻辑变得层次鲜明
```

### 自定义任务
以上实例提供了基于`Task`用法，实际需求很有可能需要自定义`Task`，在`Task`中包含了`3`个最基本的方法：
* SetResult
* SetException
* SetCancelled

在自定义任务时，根据实际需要需要显示调用这`3`方法中任意一个，否则会出现意外的情况。

实例如下：

```javascript
public Task<string> SucceedAsync()
{
	var successful = new TaskCompletionSource<string> ();
	successful.SetResult ("An expected result");
	return successful.Task;
}
public Task<string> failAsync()
{
	var failed = new TaskCompletionSource<string>();
	failed.SetException(new Exception("An error message."));
	return failed.Task;
}
```
如果在创建任务时就已经知道该任务的结果，你也可以简化的用下面这种方法：

```javascript
Task<string> successful = Task.FromResult("An expected result.");
```
### 自定义异步方法

有了以上的机制，就会很方便的打造自定义的异步方法(`asynchronous functions`)。每一个异步方法都应该返回一个`Task`，例如你可以定义一个如下`Sleep`的方法：

```javascript
public Task SleepAsync(TimeSpan duration)
{
    var tcs = new TaskCompletionSource<int>();
	var timer = new Timer(_ =>
	{
		tcs.SetResult(0);
	});
	timer.Change ((long)duration.TotalMilliseconds, Timeout.Infinite);
	return tcs.Task;
}
//使用的时候传入一个延迟执行的时间间隔
SleepAsync(TimeSpan.FromSeconds(1)).ContinueWith(task =>
{
    // 这里的内容就会在1s之后执行。
});
```
### 顺序任务

使用`Task`可以很方便地用简洁地代码调用一些按照一定顺序执行的方法或者函数。这里说的`按照一定顺序`指的是 `直到上一个任务执行完毕下一个任务才会开始`，实例如下：

```javascript
var query = new AVQuery<AVObject>("GameScore").WhereGreaterThanOrEqualTo("score", 100000);
query.FindAsync().ContinueWith(t =>
	{
      // 创建一个基础的Task。
      Task task = Task.FromResult(0);
      foreach (AVObject result in t.Result)
	  {
	  AVObject toStared = result;
	  toStared["Stared"]=true;／／为每一个总分超过100000添加“星玩家”的称号。
	  // 针对每一个AVObject,task都去调用SaveAsync这个方法。
	  task = task.ContinueWith(_ =>
	  {
	    // 返回一个Task。当保存完毕之后这个Task就会标记为完成。
		 return result.SaveAsync();
	  }).Unwrap();
	  };
	  return task;
	}).Unwrap().ContinueWith(_ =>
	  {
		// 每个加星玩家的信息都更新完毕。
	  });
```


### 平行任务

当然在编程世界里有顺序的就必然存在平行的。`平行任务`指的是定义一系列`同时开始执行的任务`。`Task`内部定义了一个静态方法`WhenAll`，调用它需要传入一个`Task`的集合，然后它就帮助同时启动集合里面的`Task`，它返回的`Task`的`IsCompleted`属性会在集合中所有`Task`都完成之后才会被置为`true`，实例如下：

```javascript
var query = new AVQuery<AVObject>("GameScore").WhereEqualTo("score", 1000000000);
query.FindAsync().ContinueWith(t =>
	{
		// 把系统里面所有得分超过1000000000的这种开发数据从库中删除。
		var tasks = new List<Task>();
		Task task = Task.FromResult(0);
		foreach (AVObject result in t.Result)
		{
			// 往任务集合里面添加DeleteAsync任务。
			tasks.Add(result.DeleteAsync());
		}
		// 返回的Task.WhenAll(tasks)的IsCompleted属性会在所有的任务都执行完毕之后置为true。
		return Task.WhenAll(tasks);
	 }
	).Unwrap().ContinueWith(_ =>
	 {
		// 最后就是所有的开发数据都被删除了。
	 });
```

## 用户
游戏中的用户既是游戏本身的玩家也是带有统计意义和社交意义的载体。例如，在游戏中最基本关于用户的应用场景就是用户所获得分数以及排名，LeanCloud已经在SDK中内嵌了关于用户这个较为特殊的对象的一些最基本的操作和数据服务。

### 注册
注册用户在LeanCloud SDK中极为简单，看如下实例代码：

```javascript
var userName = "demoUser";
var pwd = "leancloud";
var email = "xxx@xxx.com";
var user = new AVUser();
user.Username = userName;
user.Password = pwd;
user.Email = email;
user.SignUpAsync().ContinueWith(t =>
{
   var uid = user.ObjectId;
});
```

以上代码就可以很快的注册为当前的应用注册一个用户，并且这个用户也会有一个唯一的`ObjectId`。
**用户的密码在数据管理界面是无法显示的，这是因为服务端存储的并不是明文，是通过不可逆的特殊算法加密后的字符串**
{% if node != 'qcloud' and node != 'us' %}
### 手机号注册
{% if node=='qcloud' %}
> 注意： TAB 上短信功能暂未开放，所以下面所有与短信相关的 API 都还不可用。
{% endif %}

为了适应移动互联时代的需求，我们特地增加了手机号注册的功能，当然前提是会进行短信认证，就如同微信一样，注册的时候会发送6位数字的验证码到用户输入的手机上，然后再回调我们的验证接口就可以完成一次手机号的注册。

{% if node=='qcloud' %}
在 `应用设置` 可以开启这一个功能。
{% else %}
在[应用设置](/app.html?appid={{appid}}#/permission)可以开启这一个功能。
{% endif %}

```javascript
验证注册用户手机号码
允许用户使用手机短信登录
```
如下一个简单的案例：

```javascript
//第一步先注册
var user = new AVUser();
user.Username = "UnityUser";
user.Password = "leancloud";
user.MobilePhoneNumber = "18688888888";
var task= user.SignUpAsync ();
//如此做，短信就会发送到指定的手机号
```
以上完成之后，需要给用户一个输入界面，让用户输入收到的6位数字的验证码，然后再运行如下代码：

```javascript
//第二步回调认证
var task = AVUser.VerifyMobilePhoneAsync(code);//code代表6位数字的验证码
task.ContinueWith(t =>
{
	var success= t.Result;
});
```
以上两步，就是一个完整的手机号注册流程。
{% endif %}

### 登录
登录是一个`AVUser`的静态方法，通过如下`三种`方式可以实现登录，登录之后，SDK会默认将此次登录的用户设置为`AVUser.CurrentUser`：

#### 用户名和密码登录

```javascript
var userName = "demoUser";
var pwd = "leancloud";
AVUser.LogInAsync(userName, pwd).ContinueWith(t =>
{
    if (t.IsFaulted || t.IsCanceled)
    {
       var error = t.Exception.Message; // 登录失败，可以查看错误信息。
    }
    else
    {
       //登录成功
    }
});
```
{% if node != 'qcloud' and node != 'us' %}
#### 手机号和密码登录
在短信服务上线之后，只要是`通过认证`的手机号可以当做用户名在 LeanCloud 服务端进行登录，自然SDK里面也加入了相应的支持(Unity SDK 自V1.1.0以及以后的版本都有支持)。它的调用与用户名登录一样，只是方法名字不一样，代码如下:

```javascript
AVUser.LogInByMobilePhoneNumberAsync (mobilePhone, password).ContinueWith (t =>
        {
			AVUser user=t.Result;
			//这里可以拿到登录之后的AVUser，但是实际上AVUser.CurrentUser已经是当前登录的用户了。
			//这里提供返回值是为了使链式表达式脱离对全局变量的依赖，当然大部分情况下AVUser.CurrentUser应该已经可以满足一般的需求。
		});
```
#### 手机号和短信验证码登录
在对客户端验证要求比较高的应用里面，也许有些应用要求支持短信随机的验证码作为临时的密码登录，这个应用场景在现在已经被普遍的采用了，这种验证机制被认为是安全性高的一种机制，自然 LeanCloud 也给予了支持。它比前2种静态登录的方法多了`发送短信验证码`这一步，具体代码如下：

第一步，请求服务端发送6为数字的验证码到指定mobilePhoneNumber上。
```javascript
try
{
	AVUser.RequestLoginSmsCodeAsync(mobilePhoneNumber).ContinueWith(t =>
       {
			var success=t.Result;
			//判断返回值可以判断是否发送成功，不成功会抛出带有error的AVException，并且t.Result会被置为false.
			//在处理这种容易因为用户输入不合法而产生的异常的时候，为了保证程序的正常运行，建议使用try/catch机制进行提前的异常处理。
		});
}
catch(AVException avException)
{
}
```

第二步，直接使用验证码登录，如果验证码输入错误也会抛出异常。

```javascript

try
{
	AVUser.LoginBySmsCodeAsync (mobilePhoneNumber, code).ContinueWith(t=>
		{
			var success=t.Result;
		});
}
catch(AVException avException)
{
}
```
{% endif %}
### 邮箱认证

在移动互联时代，任何一个用户信息都是必须在双方统一认证之后才会被视为一种安全机制，比如邮箱的认证，同样，在`AVUser`这个特殊的 `AVObject` 拥有一个特殊字段 `email`，可以在 {% if node=='qcloud' %}**数据管理**{% else %}[数据管理](/data.html?appid={{appid}}){% endif %} 的 `_User` 表看到这个默认的字段，这就是在注册是提供的邮箱，当在 {% if node=='qcloud' %}**应用设置**{% else %}[应用设置](/app.html?appid={{appid}}#/permission){% endif %} 中勾选了 **启用注册用户邮箱验证**。
{% if node=='qcloud' %}
这样在注册用户的时候，LeanCloud默认就会发送一封邮件，进行验证，邮件的模板也可以在 `邮件模板` 中进行设置。
{% else %}
这样在注册用户的时候，LeanCloud默认就会发送一封邮件，进行验证，邮件的模板也可以在[邮件模板](/app.html?appid={{appid}}#/email)中进行设置。
{% endif %}

注意，验证过的用户，TA的`emailVerified`将会置成`true`，反之`false`，但是如果**未启用注册用户邮箱验证**，这个字段会为空。

用户邮箱验证后，会调用`AV.Cloud.onVerified('email',function)`的云引擎回调函数，方便您做一些后处理。
{% if node != 'qcloud' and node != 'us' %}
### 手机号认证
相对于邮箱认证，手机号认证的过程稍微需要多一点代码，如果当您的应用在注册的时候没有开启短信验证，伴随业务发展，发现需要验证用户的手机，LeanCloud正好提供了这一接口。

```javascript
//调用的前提是，改手机号已经与已存在的用户有关联(_User表中的mobilePhoneNumber即可关联手机，至于如何关联取决于客户端的业务逻辑)
AVUser.RequestMobilePhoneVerifyAsync ("18688888888").ContinueWith(t=>
		{
		   //这样就成功的发送了验证码
		});
```
回调认证的接口与`手机号注册`小节的第二步一样。

验证成功后，用户的`mobilePhoneVerified`属性变为true，并且调用云引擎的`AV.Cloud.onVerifed('sms', function)`方法。

**以上只是针对_User表的一个属性mobilePhoneNumber进行验证，但是存在另一种需求，类似于支付宝在进行交易的时候会要求进行实时的短信认证，这一机制现在已经普遍存在于各种应用中进行敏感操作的首选，LeanCloud 也提供了这一机制。**


#### 手机短信针对应用自定义操作的验证
`AVCloud`类包含了相关的静态方法，实例如下：

```javascript
//第一步，先请求发送，如果手机号无效则会发送失败。
public void RequestSMSCode()
{
	var task=AVCloud.RequestSMSCode ("18688888888").ContinueWith(t=>
	{
		if(t.Result)
		{
			msg="sent!";
		}
	});
}
```
如果开发者想简单地自定义短信的内容，可以调用另外一个版本，如下：

```javascript
public void RequestSMSCodeWithCustomParameters()
{
   var task=AVCloud.RequestSMSCode ("18688888888","PP打车","叫车服务",8).ContinueWith(t=>
   {
       if(t.Result)
	    {
	      msg="sent!";
       }
	});
}
```
用户就会收到如下短信：

<samp class="bubble">您正在使用 PP打车 服务进行 叫车服务，您的验证码是012345，请在8分钟之内完成验证。</samp>

以上是调用发送，下一步就是验证。

```javascript
public void VerifySMSCode(string code)
{
	var task=AVCloud.VerifySmsCode (code).ContinueWith(t=>
	{
		if(t.Result)
		{
			msg="verified";
		}
		else
		{
			msg="valid code";
		}
	});
}
```
{% endif %}

### 当前用户
诚如所有移动应用一样当前用户一直是被在客户端视作持久化存储处理，比如手机QQ等流行的App，LeanCloud必然也会如此为开发者解决持久化存储当前用户，只要调用了`登录`相关的接口，当前用户就会被持久化存储在客户端。

```javascript
var user = AVUser.CurrentUser;
```
如果调用了登出接口，那么当前用户就会被清除，并置为`null`：

```javascript
AVUser.LogOut();
var user = AVUser.CurrentUser;	//如此做就会抛出异常，因为登出之后，CurrentUser已经为空。
```

### 重置密码
#### 邮箱重置
密码管理一直是移动应用的比较通用又比较繁琐的事情，LeanCloud也为开发者提供了一套通用的解决方案，将开发者从繁琐中解脱出来。
当用户忘记密码的时候，开发者完全可以在客户端做一个简单的按钮，然后做一些友好的页面，但是真正实现重置密码的功能只需要如下一段代码：

```javascript
AVUser.RequestPasswordResetAsync(user.Email);
```
这样服务端就会再次发送重置密码的邮件，开发者只要引导用户登录邮箱，进行操作就完成了。

{% if node != 'qcloud' and node != 'us' %}
#### 短信验证码重置
如果用户的手机是有效地，并且已经通过了验证码验证手机的有效性，那么开发者可以提供另一种在手机上体验较好的方式：通过短信验证码重置密码。具体实例如下：
首先，需要发送一个请求到服务端去发送6位数的验证码：

```javascript
var smsCodeResetPasswordTask =	AVUser.RequestPasswordResetBySmsCodeAsync ("138012345678");//只需要手机号即可，服务端会自动寻找与之匹配的用户，如果没有用户与此手机号绑定，将会提示错误信息。
```
发送之后，再给一个界面给用户，让用户输入6位数的短信验证码，并且同时输入新的密码，然后如下调用：

```javascript
var resetTask = AVUser.ResetPasswordBySmsCodeAsync(NewPassword,SMSCode);//第一个参数是新密码（明文传递，请放心我们传输的时候做了加密，并且在服务端也绝不可能明文存储），第二个参数是上一步发送到用户手机的6位数验证码。
```
这样2步就可以重置密码，这项功能我们建议在一些应用内操作比较频繁的应用使用，邮箱重置的话可能需要用户去单独打开一个邮箱应用或者用浏览器跳转。
{% endif %}

### 查询用户
用户既然是个特殊的`AVObject`，它当然也具备了`AVObject`的一些共同特性，很多场景下，关于用户的操作，首先就是通过条件查询，把符合特定条件的用户查询到客户端进行展现或者一些修改之类的操作。

```javascript
AVUser.Query.WhereEqualTo("gender", "female").FindAsync().ContinueWith(t =>
{
     IEnumerable<AVUser> women = t.Result;
});
```
当然，也可以通过 `GetAsync` 方法通过 `objectId` 获取特定的一个`AVUser`。


### 用户安全数据的认证规则
很多时候，就算是开发者也不要轻易修改用户的基本信息，比如用户的一些比较敏感的个人信息，例如手机号，社交账号等，这些都应该让用户在App中自行修改，所以为了用户数据的数据有且仅有自己在登录的情况下得以修改，LeanCloud服务端对所有针对`AVUser`对象的数据做了验证。

```javascript
AVUser user = null;
AVUser.LogInAsync("demoUser", "asvscloud").ContinueWith(t =>
{
    user = t.Result;
    user.Username = "testUser"; // 修改用户名
    return user.SaveAsync();
}).Unwrap().ContinueWith(t =>
{
    if (!t.IsFaulted)
    {
        // 在登录之后，提交修改用户相关字段（密码除外），都会成功。
        AVUser.LogOut();
    }
}).ContinueWith(t =>
{
    // 通过Id获取这个用户，注：如此做并未使当前用户登录。
    return AVUser.Query.GetAsync(user.ObjectId);
}).Unwrap().ContinueWith(t =>
{
    user = t.Result;
    user.Username = "devUser";
    return user.SaveAsync();
}).Unwrap().ContinueWith(t =>
{
    if (t.IsFaulted)
    {
        // 显然，如此做就会失败，因为单单从Id获取用户，当前的请求不具备权限去修改这个用户的相关属性。
    }
});
```

## ACL 权限控制

任何一个成熟的并且可控的系统中，必然会存在权限控制的问题，经典的案例就是论坛的斑竹可以删帖而普通游客只能看帖，如此一来，发展出来的[基于角色的访问控制](http://zh.wikipedia.org/wiki/%E4%BB%A5%E8%A7%92%E8%89%B2%E7%82%BA%E5%9F%BA%E7%A4%8E%E7%9A%84%E5%AD%98%E5%8F%96%E6%8E%A7%E5%88%B6)被普遍应用于各类传统的软件中，即便是互联网时代的今天，它依然是可以很简便地帮助开发者以及使用者理解和应用。

{% if node=='qcloud' %}
基于以上这一点，LeanCloud在开发者创建一个应用的时候，默认地在服务端为该应用添加了一张`_Role`的表，开发者可以在 `数据管理` 中看到这张表。
{% else %}
基于以上这一点，LeanCloud在开发者创建一个应用的时候，默认地在服务端为该应用添加了一张`_Role`的表，开发者可以在[数据管理](/data.html?appid={{appid}})中看到这张表。
{% endif %}

### 默认访问权限
在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值代表了，所有的用户，对这个对象都是可读可写的。此时你可以在数据管理的表中 ACL 属性中看到这样的值:

```javascript
  {"*":{"read":true,"write":true}}
```
在Unity中创建符合默认的开放读写权限的`AVACL`的代码如下：

```javascript
var defaultACL = new AVACL();
defaultACL.PublicWriteAccess = true;
defaultACL.PublicReadAccess = true;
```

### 指定用户访问权限

当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。 譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。


```javascript
byte[] data = System.Text.Encoding.UTF8.GetBytes("LeanCloud is a great cloud service!");
AVFile file = new AVFile("mytxtFile.txt", data, new Dictionary<string, object>()
    {
        {"author","LeanCloud"}
    });
AVObject book = new AVObject("book");
book["content"] = file;

AVACL acl = new AVACL();
acl.PublicReadAccess = true;
acl.SetWriteAccess(AVUser.CurrentUser, true);
book.ACL = acl;
var saveTask = book.SaveAsync();
```


### 指定角色访问权限

#### 角色

`AVRole`拥有一些默认的属性，当然它也是一个`AVObject`，自然开发者也可以为角色添加业务逻辑所需的字段。

*  `name`: `string`类型，角色的名称，并且这是创建角色的`必须字段`，并且`唯一`，并且只在创建时赋值，不能被`修改`，命名必须由字母，连接符，下划线组成，这个字段可视为主键。
*  `users`:`AVACL`类型，它指向所有拥有（即`单用户可以拥有多角色`的系统）这个`角色`的用户。
*  `roles`:`AVACL`类型，它指向所有该角色的子角色，`子角色自动继承父角色的所有权限`。关于这一点下一节会做详细阐述。

#### AVUser 与 AVRole 的从属关系

指定用户访问权限虽然很方便，但是依然会有局限性。 以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只拥有工资的读权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。

```javascript
AVObject salary = new AVObject("salary");
salary["value"] = 2000000;

AVUser boss=new AVUser();//假设此处为老板
AVUser hrWang=new AVUser();  //人事小王
AVUser me = new AVUser(); //我们就在文档里爽一爽吧
AVUser cashierZhou = new AVUser(); //出纳老周

AVACL acl = new AVACL();
acl.SetReadAccess(boss, true);
acl.SetReadAccess(hrWang, true);
acl.SetReadAccess(me, true);
acl.SetReadAccess(cashierZhou, true);

acl.SetWriteAccess(boss, true);
acl.SetWriteAccess(hrWang, true);
salary.ACL = acl;
var saveTask = salary.SaveAsync();
```

但是这些涉及其中的人可能不止一个，也有离职换岗新员工的问题存在。这样的代码既不优雅，也太啰嗦, 同样会很难维护。 这个时候我们就引入了 `AVRole` 来解决这个问题。 公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间时间内相对稳定。


```javascript
AVObject salary = new AVObject("salary");
salary["value"] = 2000000;

var roleACL = new AVACL();
roleACL.PublicReadAccess = true;//AVRole本身在创建之后，就尽量避免它被修改，这里是为了设定AVRole自身的ACL访问限制。

//以下这些角色只为示意，如要正确执行本段代码，以下这些AVUser必须是已经存在于服务端的数据。
AVUser boss = new AVUser();//假设此处为老板
AVUser hrWang = new AVUser();  //人事小王
AVUser me = new AVUser(); //我们就在文档里爽一爽吧
AVUser cashierZhou = new AVUser(); //出纳老周
AVUser cashierGe = new AVUser();//出纳小葛

AVRole hr = new AVRole("hr", roleACL);
AVRole cashier = new AVRole("cashier", roleACL);

hr.Users.Add(hrWang);

cashier.Users.Add(cashier);
cashier.Users.Add(cashierGe);

var saveUsersTask = new List<Task>()
{
    {hr.SaveAsync()},
    {cashier.SaveAsync()}
};
var saveTask = Task.WhenAll(saveUsersTask).ContinueWith(t =>
{
    AVACL acl = new AVACL();
    acl.SetReadAccess(boss, true);
    acl.SetReadAccess(me, true);

    acl.SetRoleReadAccess(hr, true);
    acl.SetRoleReadAccess(cashier,true);

    acl.SetWriteAccess(boss, true);
    acl.SetRoleWriteAccess(hr, true);

    salary.ACL = acl;

    return salary.SaveAsync();
});

```

#### AVRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系。用下面的例子来理解可能会对我们有所帮助：

一家创业公司有移动部门，部门下面有不同的小组，Android 和 iOS。而每个小组只拥有自己组的代码的读写权限。但是他们同时拥有核心库代码的读取权限。

```javascript
        var roleACL = new AVACL();
        roleACL.PublicReadAccess = true;//AVRole本身在创建之后，就尽量避免它被修改，这里是为了设定AVRole自身的ACL访问限制。

        AVRole androidTeam = new AVRole("androidTeam", roleACL);
        AVRole iOSTeam = new AVRole("iOSTeam", roleACL);
        AVRole mobileDep = new AVRole("mobileDep", roleACL);

        AVObject androidCode = new AVObject("code");
        androidCode["name"] = "android";

        AVObject iOSCode = new AVObject("code");
        iOSCode["name"] = "ios";

        AVObject coreCode = new AVObject("code");
        coreCode["name"] = "core";

        var saveTeamTasks = new List<Task>()
            {
                {androidTeam.SaveAsync()},
                {iOSTeam.SaveAsync()},
            };

        var saveTask = Task.WhenAll(saveTeamTasks).ContinueWith(t =>
         {
             mobileDep.Roles.Add(androidTeam);
             mobileDep.Roles.Add(iOSTeam);
             return mobileDep.SaveAsync();
         }).Unwrap().ContinueWith(s =>
         {
             var saveCodeTasks = new List<Task>()
             {
                 {androidCode.SaveAsync()},
                 {iOSCode.SaveAsync()},
                 {coreCode.SaveAsync()},
             };
             return Task.WhenAll(saveCodeTasks);

         }).Unwrap().ContinueWith(x =>
         {

             //androidCode的读写权限对androidTeam开放
             androidCode.ACL.SetRoleReadAccess(androidTeam, true);
             androidCode.ACL.SetRoleWriteAccess(androidTeam, true);

             //iOSCode的读写权限对iOSTeam开放
             iOSCode.ACL.SetRoleReadAccess(iOSTeam, true);
             iOSCode.ACL.SetRoleWriteAccess(iOSTeam, true);

             //coreCode对mobileDep开放读取权限，注意，mobileDep本身就已经包含了iOSTeam和androidTeam作为它的子角色
             coreCode.ACL.SetRoleReadAccess(mobileDep, true);

             var saveCodeTasks = new List<Task>()
             {
                 {androidCode.SaveAsync()},
                 {iOSCode.SaveAsync()},
                 {coreCode.SaveAsync()},
             };
             return Task.WhenAll(saveCodeTasks);
         }).Unwrap().ContinueWith(y =>
         {
             //所有操作全部完成。
         });

```

## 文件

### 上传文件

AVFile可以让你的应用程序将文件存储到服务器中，比如常见的文件类型图像文件、影像文件、音乐文件和任何其他二进制数据都可以使用。
在这个例子中，我们将一段文本保存到服务器端：

```javascript
private string fildId;
void OnGUI()
{
    GUI.Label(new Rect(260, 50, 160, 50), fildId);
    if (GUI.Button(new Rect(50, 50, 200, 50), "Create a txt file"))
    {
       byte[] data = System.Text.Encoding.UTF8.GetBytes("LeanCloud is a great cloud service!");
       AVFile file = new AVFile("mytxtFile.txt", data, new Dictionary<string, object>()
       {
          {"author","LeanCloud"}
       });
       file.SaveAsync().ContinueWith(t =>
       {
          Debug.Log(t.IsFaulted);
          if (!t.IsFaulted)
          {
             fildId = file.ObjectId;
          }
          else
          {
             Debug.Log(t.Exception.Message);
             Debug.LogException(t.Exception);
          }
       });
     }
}
```

AVFile构造函数的第一个参数指定文件名称，第二个构造函数接收一个byte数组，也就是将要上传文件的二进制，第三个参数是自定义元数据的字典，比如你可以把文件的作者的名字当做元数据存入这个字典，LeanCloud 的服务端会把它保留起来，这样在以后获取的时候，这种类似的自定义元数据都会被获取。

### 本地文件

在Unity中，如果很清楚地知道某一个文件所存在的路径，比如在游戏中上传一张游戏截图到LeanCloud中，可以通过SDK直接获取指定的文件，上传到LeanCloud中。

```javascript
GUI.Label(new Rect(260, 50, 160, 50), fildId);
if (GUI.Button(new Rect(50, 50, 200, 50), "Upload a screenshot"))
{
   AVFile file = AVFile.CreateFileWithLocalPath("screenshot.PNG", Path.Combine(Application.persistentDataPath, "screenshot.PNG"));
   file.SaveAsync().ContinueWith(t =>
   {
       Debug.Log(t.IsFaulted);
       if (!t.IsFaulted)
       {
           fildId = file.ObjectId;
       }
       else
       {
           Debug.Log(t.Exception.Message);
           Debug.LogException(t.Exception);
       }
    });
}
```

### 文件元信息

AVFile默认会存储文件大小和文件上传者objectId作为元信息。同样的，我们提供了一个字典接口帮助开发者可以未任意文件添加任意符合字典命名规则的自定义元数据。在本小节的第一个例子了已经为文件添加了一个自定义的元数据：

```javascript
 AVFile file = new AVFile("mytxtFile.txt", data, new Dictionary<string, object>()
 {
     {"author","LeanCloud"}
 });
```
这个就是简单的用法，在创建文件的时候，可以指定一组字典去保留文件的自定义元数据。

你还可以在上传前自动一些元信息保存起来，以便后续获取，例如我们还保存图片的高度和宽度：

```javascript
 file.MetaData.Add("width", 100);
 file.MetaData.Add("height", 100);
```

#### 文件下载
因为多平台适配会造成困扰，因此 Unity SDK 不提供直接下载文件的方式。

对 Unity 有经验的开发者，我们推荐用  Unity 自带的 WWW 类或者 UnityWebRequest 类解决文件下载的问题，如下：

```javascript
var req = new WWW(file.Url.AbsoluteUri);
yield return req;
string text = req.text;
```
以上是针对纯文件文件的操作。
其他文件的下载，还是建议开发者自行利用 `AVFile.Url` 这个属性进行如上操作。

### 删除文件

**删除文件就意味着，执行之后在数据库中立刻删除记录，并且原始文件也会从存储仓库中删除（所有涉及到物理级别删除的操作请谨慎使用）**

```javascript
if (GUI.Button(new Rect(50, 50, 200, 50), "Delete file"))
{
   AVFile.GetFileWithObjectIdAsync("538ed669e4b0e335f6102809").ContinueWith(t =>
   {
      var file = t.Result;
      file.DeleteAsync();
   });
}
```

## 调用云引擎
云引擎是 LeanCloud 提供给开发者自定义服务端逻辑的解决方案，例如想在用户注册的时候，服务端统一给用户分配随机的昵称，这一操作就可以用云引擎实现。具体关于云引擎的一些相关概念和操作可以先查看 [云引擎指南](leanengine_guide-cloudcode.html)。

调用云引擎在 SDK 中比较方便，它是 `AVCloud` 的静态方法，全局均可调用。

```javascript
var dic = new Dictionary<string, object>();
dic.Add("name", "Justin");
//...
//增加参数
//...
//...
var callTask = AVCloud.CallFunctionAsync<string>("TestFunctionName", dic);
```
只需要传入云引擎中函数的名字和这个函数需要参数即可，如果是无参的函数，直接传入`null`即可。

## 消息推送
在Unity中消息的推送只需要掌握`AVPush`的用法就可以在客户端推送消息发给服务端，再由 LeanCloud 的服务端将消息都推送各个客户端，但要注意**Unity想实现接受消息，最好依赖于当前操作系统的本地的API**，换言之，因为接受消息这一操作在各个移动操作系统最好使用当前系统的API去实现，当然，开发者也可以自己去实现。考虑到这一点，LeanCloud 暂时不考虑在Unity 做过多的强制性，如何展现消息接受，应该是客户端开发者自己去掌控。另外，我们也推荐在Unity开发中，针对不同平台搭配使用我们针对这个平台的SDK（iOS,Android,Windows Phone等）去调用带有平台特征性的一些功能和API。

### 推送给所有的设备

```javascript
AVPush push = new AVPush();
push.Alert = "message to all devices.";
var task = push.SendAsync();
```
以上这段代码就可以实现向所有安装了当前App的设备推送消息。

### 发送给特定的用户
发送给public频道的用户：

```javascript
 AVPush push = new AVPush();
 push.Alert = "message to public channel.";

 push.Query = new AVQuery<AVInstallation>().WhereEqualTo("channels", "public");
 var task = push.SendAsync();
```

## Unity SDK 注意事项

1. 基于 Unity 自身的 WWW 类发送 Http 请求的限制，单个请求的大小不能超过 2MB，所以在使用 Unity SDK 时，开发者需要注意存储数据，构建查询等操作时，需要做到简洁高效。
2. Unity 中请将 `Optimization` 中的 `Stripping Level` 设置为 `Disabled`。
3. 从官网上下载的 SDK，在 Unity 4.3 以后的版本都需要重命名，把版本号去掉，例如下载的文件叫做 `AVOSCloud.Unity-v1.1.5.dll`，请重命名为 `AVOSCloud.Unity.dll`，否则会出现引入脚本失败的错误。
4. Unity 自从升级到 5.0 之后就会出现一个 iOS 上访问 HTTPS 请求时的 SSL 证书访问错误：**NSURLErrorDomain error -1012**。解决方案是：在 Unity 构建完成 iOS 项目之后，使用 XCode 打开项目，找到 `Classes/Unity/WWWConnection.mm` 文件，找到这个方法：

  ```objc
  -(void)connection:(NSURLConnection*)connection willSendRequestForAuthenticationChallenge:(NSURLAuthenticationChallenge*)challenge
```
  把该方法按照如下代码修改即可：

  ```objc
-(void)connection:(NSURLConnection*)connection willSendRequestForAuthenticationChallenge:(NSURLAuthenticationChallenge*)challenge
{
    if ([[challenge protectionSpace] authenticationMethod] == NSURLAuthenticationMethodServerTrust) {
        [challenge.sender performDefaultHandlingForAuthenticationChallenge:challenge];
    }
    else
    {
        
        BOOL authHandled = [self connection:connection handleAuthenticationChallenge:challenge];
        
        if(authHandled == NO)
        {
            self->_retryCount++;
            
            // Empty user or password
            if(self->_retryCount > 1 || self.user == nil || [self.user length] == 0 || self.password == nil || [self.password length]  == 0)
            {
                [[challenge sender] cancelAuthenticationChallenge:challenge];
                return;
            }
            
            NSURLCredential* newCredential =
            [NSURLCredential credentialWithUser:self.user password:self.password persistence:NSURLCredentialPersistenceNone];
            
            [challenge.sender useCredential:newCredential forAuthenticationChallenge:challenge];
        }
    }
}
```

  目前 Unity 官方还在修复此问题，截止到 V5.0.1f1 该问题一直存在，因此所有升级到 Unity 5.0 的开发者都需要如此修改，才能确保 iOS 正确运行。

