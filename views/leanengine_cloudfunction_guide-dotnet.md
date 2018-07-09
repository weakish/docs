{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = ".NET" %}
{% set runtimeName = ".NET" %}
{% set gettingStartedName = "dotNET-getting-started" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine dotNET SDK](https://github.com/leancloud/leanengine-dotNET-sdk/)" %}
{% set storage_guide_url = "[.NET SDK](leanstorage_guide-java.html)" %}
{% set cloud_func_file = "https://github.com/leancloud/leanengine-dotNET-sdk/blob/master/test/LeanCloud.Engine.AspNetDemo/LambdaSample.cs" %}
{% set runFuncName = "AVCloud.CallFunctionAsync" %}
{% set defineFuncName = "EngineFunction Attribute" %}
{% set runFuncApiLink = "[AVCloud.CallFunctionAsync](/api-docs/java/com/avos/avoscloud/AVCloud.html#callFunction(java.lang.String,%20java.util.Map))" %}
{% set hook_before_save = "BeforeSave" %}
{% set hook_after_save = "AfterSave" %}
{% set hook_before_update = "BeforeUpdate" %}
{% set hook_after_update = "AfterUpdate" %}
{% set hook_before_delete = "BeforeDelete" %}
{% set hook_after_delete = "AfterDelete" %}
{% set hook_on_verified = "OnVerified" %}
{% set hook_on_login = "OnLogin" %}
{% set hook_message_received = "_messageReceived" %}
{% set hook_receiver_offline = "_receiversOffline" %}
{% set hook_message_sent = "_messageSent" %}
{% set hook_conversation_start = "_conversationStart" %}
{% set hook_conversation_started = "_conversationStarted" %}
{% set hook_conversation_add = "_conversationAdd" %}
{% set hook_conversation_remove = "_conversationRemove" %}
{% set hook_conversation_update = "_conversationUpdate" %}

{% block cloudFuncExample %}

```cs
    public class StaticSampleService
    {
        [EngineFunction("AverageStars")]
        public static double AverageStars([EngineFunctionParameter("movieName")]string movieName)
        {
            if (movieName == "夏洛特烦恼")
                return 3.8;
            return 0;
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            // 定义一个 Cloud 实例
            var cloud = new Cloud();
            // 将云函数注册到 cloud 实例上
            cloud.UseFunction<StaticSampleService>();
            // 启动实例
            cloud.Start();
        }
    }
```

### 更多云函数定义方式

#### 1. 实例方法搭配 EngineFunction 和 EngineFunctionParameter
另外，在 .NET 中间件中提供了其他更多的定义方式，适配各种变化的需求，如下代码：

```cs
    // case 2. use instance methods
    public class MovieService
    {
        // 可以注入一些判断变量
        public List<string> ValidMovieNames { get; set; }
        public MovieService(string[] someMovieNames)
        {
            ValidMovieNames = someMovieNames.ToList();
        }

        [EngineFunction("AverageStars")]
        public double AverageStars([EngineFunctionParameter("movieName")]string movieName)
        {
            // 如果要查询的电影并不在支持范围内，直接返回 0 分
            if (!ValidMovieNames.Contains(movieName)) return 0;
            if (movieName == "夏洛特烦恼")
                return 3.8;
            return 0;
        }
    }
    public class Program
    {
        public static void Main(string[] args)
        {
            // 定义一个 Cloud 实例
            var cloud = new Cloud();
            // 将云函数注册到 cloud 实例上
            cloud.UseFunction<MovieService>(new MovieService(new string[] { "夏洛特烦恼", "功夫", "大话西游之月光宝盒" }));
            // 如果并不想传入任何校验参数也可以直接调用如下代码
            // cloud.UseFunction<MovieService>(); 
            // 启动实例
            cloud.Start();
        }
    }
```
`MovieService` 是一个自定义的类，他包含一个实例方法，并且这个实例方法可以通过类的构造函数来传入一些判断所需要的变量，这样可以应对一些变化的需求。

#### 2. 直接使用委托

```cs
    // case 3. use Cloud.Define
    public class SampleServices
    {
        public static double AverageStars(string movieName)
        {
            if (movieName == "夏洛特烦恼")
                return 3.8;
            return 0;
        }
    }
    public class Program
    {
        public static void Main(string[] args)
        {
            // 定义一个 Cloud 实例
            var cloud = new Cloud();
            // 将云函数注册到 cloud 实例上
            cloud.Define<string, double>("AverageStars", SampleServices.AverageStars);
            // 启动实例
            cloud.Start();
        }
    }
```

{% endblock %}


{% block cloudFuncParams %}

正如前面的实例代码一样，在定义云函数时使用 `EngineFunctionParameter` 来进行参数的绑定，如果使用的是[直接使用委托](#直接使用委托)，那么传入的参数只要按照顺序即可。

{% endblock %}

{% block runFuncExample %}
```cs
    await AVCloud.CallFunctionAsync<double>("AverageStars", new Dictionary<string, object>()
    {
        { "movieName", "夏洛特烦恼" }
    });
```
{% endblock %}


{% block errorCodeExample %}

错误响应码允许自定义。可以在云函数中间 throw AVException 来指定 code 和 error 消息,如果是普通的 Exception，code 值则是默认的1 。

```cs
    public class UserService
    {
        [EngineFunction("Me")]
        public async AVUser GetCurrentUser()
        {
            AVUser u = await AVUser.GetCurrentAsync()
            if (u == null) 
            {
                throw new EngineException(211, "Could not find user");
            } 
            else 
            {
                return u;
            }
        }
    }
```
{% endblock %}

{% block errorCodeExample2 %}

```cs
  [EngineFunction("AverageStars")]
  public static Void CustomErrorCode(){
    throw new EngineException(123,"custom error message");
  }
```
{% endblock %}


{% block beforeSaveExample %}

```cs
var cloud = new Cloud().BeforeSave("Review", review =>
{
    var comment = review.Get<string>("comment");
    if (comment.Length > 140) review["comment"] = comment.Substring(0, 137) + "...";
    return Task.FromResult(comment);
});
```
{% endblock %}

{% block afterSaveExample %}

```cs
var cloud = new Cloud().AfterSave("Review", review =>
{
    var post = review.Get<AVObject>("post");
    await post.FetchAsync();
    post.Increment("comments");
    await post.SaveAsync();
});
```
{% endblock %}

{% block afterSaveExample2 %}

```cs
var cloud = new Cloud().AfterSave("_User", async user =>
{
    if (user is AVUser avUser)
    {
        avUser.Set("from", "LeanCloud");
        await avUser.SaveAsync();
    }
});
```
{% endblock %}

{% block beforeUpdateExample %}

```cs
var cloud = new Cloud().BeforeUpdate("Review", (EngineObjectHookContext context) =>
{
    if (context.UpdatedKeys.Contains("comment"))
    {
        var comment = context.TheObject.Get<string>("comment");
        if (comment.Length > 140) throw new EngineException(400, "comment 长度不得超过 140 字符");
    }
    return Task.FromResult(true);
});
```
{% endblock %}