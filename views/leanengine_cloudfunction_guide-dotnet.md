{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = ".NET" %}
{% set runtimeName = ".NET" %}
{% set gettingStartedName = "dotNET-getting-started" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine dotNET SDK](https://github.com/leancloud/leanengine-dotNET-sdk/)" %}
{% set storage_guide_url = "[.NET SDK](leanstorage_guide-java.html)" %}
{% set cloud_func_file = "https://github.com/leancloud/dotNET-getting-started/blob/master/web/HelloSample.cs" %}
{% set runFuncName = "AVCloud.CallFunctionAsync" %}
{% set defineFuncName = "EngineFunctionAttribute" %}
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

{% block initialize %}

## 安装和初始化

首先需要了解如下两个库：

- [LeanCloud.Engine](https://www.nuget.org/packages/LeanCloud.Engine/)
  包含了实现云函数，Class Hook 的基础组件，它不依赖任何通讯协议，它只提供了自定义云函数和 Class Hook 的注册，绑定，响应，执行的逻辑，它是个核心库。

- [LeanCloud.Engine.Middleware.AspNetCore](https://www.nuget.org/packages/LeanCloud.Engine.Middleware.AspNetCore/)
  它提供了通讯层来帮助 [LeanCloud.Engine](https://www.nuget.org/packages/LeanCloud.Engine/) 与 LeanCloud 其他服务模块（比如存储服务和实时通信服务）进行内网的通讯，它基于微软的 ASP.NET Core 来实现，它只是一种实现，如果有能力或者有兴趣的开发者实际上可以自己实现一个 Middleware。


因此在任何一个 .NET Core 的项目都可以在安装 [LeanCloud.Engine.Middleware.AspNetCore](https://www.nuget.org/packages/LeanCloud.Engine.Middleware.AspNetCore/) 之后，部署到云引擎中，这样就可以让开发者在服务端用.NET Core 来构建自己的服务端业务逻辑了。

### 示例项目

[https://github.com/leancloud/dotNET-getting-started](https://github.com/leancloud/dotNET-getting-started) 是一个简单的示例项目，开发者直接在云引擎控制台中通过 git 部署就可以直接部署，开始体验。

或者也可以从 IDE 的新建项目开始：

### 新建项目

如下步骤和截图都来自于 Visual Studio for Mac（Visual Studio for Windows 自然更好）

使用 Visual Studio 新建项目：

![leanengine-dotnet-vs-create-app-1.jpg](images/leanengine-dotnet-vs-create-app-1.png)

选择 -> .NET Core 2.0 ，然后下一步输入
 
- **Project Name ： web** 
- **Solution Name ： app**

![leanengine-dotnet-vs-create-app-2.jpg](images/leanengine-dotnet-vs-create-app-2.png)

**以上文件命名是硬性规定**这一步是必须的，目的为了部署脚本的便捷和可控性，在可期的未来我们可以提供自定义的方式。

然后为项目添加 [LeanCloud.Engine.Middleware.AspNetCore](https://www.nuget.org/packages/LeanCloud.Engine.Middleware.AspNetCore/) 的依赖可以通过 Visual Studio 提供的 GUI 界面进行操作：Add Packages... -> 输入 LeanCloud 关键字页面上会出现相关的列表 -> 选择 LeanCloud.Engine.Middleware.AspNetCore -> Add Package 即可。

或者直接在 `app/web` 目录下执行

```sh
dotnet add package LeanCloud.Engine.Middleware.AspNetCore
```

最后一步，将 `app/` 文件夹目录下面所有的内容: `web/` 和 `app.sln` 移到顶层目录下，比如您的代码仓库对应的本地文件夹叫做 `myProjects/`，然后删除 `app/` 文件夹，保证它的文件结构如 [dotNET-getting-started](https://github.com/leancloud/dotNET-getting-started) 一样。

完成。

只要您的项目满足如下目录结构都会被云引擎正确的识别为 .Net Core 项目：

```
├── app.sln  
├── web
    ├── MyHookFunctions.cs
    ├── Program.cs
    └── web.csproj
└── README.md
```

示例项目 [dotNET-getting-started](https://github.com/leancloud/dotNET-getting-started) 是推荐的模板。

{% endblock %}

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
```

而在程序启动的入口函数中添加如下代码来启用刚才编写的云函数：


```cs
public class Program
{
    public static void Main(string[] args)
    {
        // 定义一个 Cloud 实例
        var cloud = new Cloud();
        // 将云函数注册到 cloud 实例上
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

// 定义一个 Cloud 实例
var cloud = new Cloud();
// 将云函数注册到 cloud 实例上
cloud.UseFunction<MovieService>(new MovieService(new string[] { "夏洛特烦恼", "功夫", "大话西游之月光宝盒" }));
// 如果并不想传入任何校验参数也可以直接调用如下代码
// cloud.UseFunction<MovieService>(); 
// 启动实例
cloud.Start();
```
`MovieService` 是一个自定义的类，包含一个实例方法，并且这个实例方法可以通过类的构造函数来传入一些判断所需要的变量（依赖注入），这样可以应对一些变化的需求。

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
// 然后注册
cloud.Define<string, double>("AverageStars", SampleServices.AverageStars);
```

{% endblock %}


{% block cloudFuncParams %}

正如前面的实例代码一样，在定义云函数时使用 `EngineFunctionParameter` 来进行参数的绑定，如果使用的是[直接使用委托](#直接使用委托)，那么传入的参数只要按照顺序即可。

此处要注意，如果函数本身是异步的(返回值是 `Task` 或者 `Task<T>`)，在真正执行的时候也是会等待异步结果，然后再返回给客户端的，另外，如果在执行过程中产生了异常，请参考[云函数错误响应码](#云函数错误响应码)。

{% endblock %}

{% block runFuncExample %}
```cs
await AVCloud.CallFunctionAsync<double>("AverageStars", new Dictionary<string, object>()
{
    { "movieName", "夏洛特烦恼" }
});
```

另外需要注意的是，*不推荐*在云引擎中直接调用 `AVCloud.CallFunctionAsync`, 因为 `AVCloud.CallFunctionAsync` 是从客户端发起的远程调用，会重新走一遍外网再回到云引擎，如果需要在本地调用，推荐直接在云引擎中使用 `Cloud.CallFunctionAsync`，它会直接从本地进行调用，性能更好。

{% endblock %}


{% block errorCodeExample %}

错误响应码允许自定义。可以在云函数中间 throw EngineException 来指定 code 和 error 消息,如果是普通的 Exception, code 值则是默认的 1 。

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
cloud.BeforeSave("Review", review =>
{
    var comment = review.Get<string>("comment");
    if (comment.Length > 140) review["comment"] = comment.Substring(0, 137) + "...";
});
```

{% endblock %}

{% block afterSaveExample %}

```cs
cloud.AfterSave("Review", review =>
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
cloud.AfterSave("_User", async user =>
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
cloud.BeforeUpdate("Review", (AVObject review) =>
{
    var updatedKeys = review.GetUpdatedKeys();
    if (updatedKeys.Contains("comment"))
    {
        var comment = review.Get<string>("comment");
        if (comment.Length > 140) throw new EngineException(400, "comment 长度不得超过 140 字符");
    }
});
```
{% endblock %}

{% block afterUpdateExample %}

```cs
cloud.BeforeUpdate.AfterSave("Article", article =>
{
    Console.WriteLine(article.ObjectId);
});
```
{% endblock %}

{% block beforeDeleteExample %}

```cs
cloud.BeforeDelete("Album", async album =>
{
    AVQuery<AVObject> query = new AVQuery<AVObject>("Photo");
    query.WhereEqualTo("album", album);
    int count = await query.CountAsync();
    if (count > 0)
    {
        throw new Exception("无法删除非空相簿");
    }
    else
    {
        Console.WriteLine("deleted.");
    }
});
```
{% endblock %}

{% block afterDeleteExample %}

```cs
cloud.AfterDelete("Album", async album =>
{
    AVQuery<AVObject> query = new AVQuery<AVObject>("Photo");
    query.WhereEqualTo("album", album);
    var result = await query.FindAsync();
    if (result != null && result.Count() != 0)
    {
        await AVObject.DeleteAllAsync(result);
    }
});
```
{% endblock %}

{% block onVerifiedExample %}

```cs
cloud.OnVerifiedSMS((AVUser user) =>
{
    Console.WriteLine("user verified by sms.");
});
```
{% endblock %}

{% block onLoginExample %}

```cs
cloud.OnLogIn((AVUser user) =>
{
    Console.WriteLine("user logged in.");
});
```
{% endblock %}

{% block realtime_hook %}

### 实时通信 Hook 函数

> 云引擎 .NET SDK 暂时不支持实时通信相关的 Hook，正在开发中，敬请期待。 

{% endblock %}

{% block errorCodeExampleForHooks %}

```cs
cloud.BeforeSave("Review", (AVObject review) =>
{
    var updatedKeys = review.GetUpdatedKeys();
    if (updatedKeys.Contains("comment"))
    {
        var comment = review.Get<string>("comment");
        // code 可以自定义为任意数字
        // message 可以自定义为任何字符串
        if (comment.Length > 140) throw new EngineException(123, "comment 长度不得超过 140 字符");
    }
});
```
{% endblock %}

{% block advancedClassHookInstancedMethod %}

#### 自定义 Hook 函数的更多写法

前面演示的是基础的使用委托来定义了一系列的 Hook，比如 `BeforeSave/BeforeUpdate` ，但是在开发的和迭代的过程中，可能某一个对象的各种 Hook 更应该定义在一个统一的类里面进行修改和调整，如果都使用委托可能对代码的组织结构上有一定的挑战和迭代难度，因此 SDK 中也提供了另一种方式来实现 Hook 的自定义，比如针对 Todo 的一系列的 Hook 可能都编写在同一个类里面，如下：

```cs
    public class TodoHook
    {
        [EngineObjectHook("Todo", EngineHookType.BeforeSave)]
        public Task CheckTitle(AVObject todo)
        {
            var title = todo.Get<string>("title");
            // reset value for title
            if (title.Length > 20) todo["title"] = title.Substring(0, 20);
            // returning any value will be ok.
        }

        [EngineObjectHook("Todo", EngineHookType.AfterSave)]
        public Task SetDueDate(AVObject todo)
        {
            todo.Set("due", DateTime.Now);
            return todo.SaveAsync();
        }

        [EngineObjectHook("Todo", EngineHookType.BeforeUpdate)]
        public Task CheckUpdatedKeys(EngineObjectHookContext context)
        {
            if (context.UpdatedKeys.Contains("title"))
            {
                return CheckTitle(context.TheObject);
            }
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            // 创建一个 Cloud 实例
            Cloud cloud = new Cloud().UseHookClass<TodoHook>();
            // 启动实例
            cloud.Start();
        }
    }
```
{% endblock %}

{% block debugLog %}

## 开发和调试技巧

### 打开日志

```cs
// 启动日志
Cloud cloud = new Cloud().UseLog();
```

结合前面的实例代码可以如下写：

```cs
// 创建一个 Cloud 实例
Cloud cloud = new Cloud().UseHookClass<TodoHook>().UseLog();
// 启动实例
cloud.Start();
```

打开日志之后，所有的 Hook 调用都会以日志的方式打印在云引擎的应用日志当中，它大致的样子如下：

```sh
POST http://e1-api.leancloud.cn/1/functions/Todo/beforeUpdate  {"Connection":["close"],"Content-Type":["application/json; charset=utf-8"],"Host":["e1-api.leancloud.cn"],"User-Agent":["AVOS Cloud API Service"],"Content-Length":["286"],"X-Forwarded-Proto":["http"],"X-Real-IP":["10.0.4.141"],"X-Request-Id":["1531128497297-69803473"],"x-uluru-application-id":["315XFAYyIGPbd98vHPCBnLre-9Nh9j0Va"],"x-uluru-application-key":["Y04sM6TzhMSBmCMkwfI3FpHc"],"X-LC-Hook-Key":["3sVkRo1X"],"x-uluru-application-production":[""]} {"object":{"title":"XXX","ACL":{"*":{"read":true,"write":true}},"createdAt":"2018-07-09T03:08:42.696Z","updatedAt":"2018-07-09T09:28:17.220Z","objectId":"5b42d1baac3103001a136f36","_updatedKeys":["title"],"__before":"1531128497221,574a3a0994fc91181cb4acc180556ea9957af639"},"user":null}
```

以上是从控制台日志当中拷贝出来内容，只有开启了日志才会打印到控制台。

{% endblock %}

{% block useMasterKey %}
```cs
AVClient.UseMasterKey = true;
```
{% endblock %}

{% block hookDeadLoop %}

{{ 
    LE.deadLoopText({
      hookName:                hook_after_update,
      objectName:              'post',
      createWithoutDataMethod: 'AVObject.CreateWithoutData()',
      disableBeforeHook:       'post.DisableBeforeHook()', 
      disableAfterHook:        'post.DisableAfterHook()'
    })
}}

```cs
cloud.AfterSave("Post", (EngineObjectHookDeltegateSynchronous)(async post =>
    {
        // 直接修改并保存对象不会再次触发 after update hook 函数
        post["foo"] = "bar";
        await post.SaveAsync();
        // 如果有 FetchAsync 操作，则需要在新获得的对象上调用相关的 disable 方法
        // 来确保不会再次触发 Hook 函数
        await post.FetchAsync();
        post.DisableAfterHook();
        post["foo"] = "bar";

        // 如果是其他方式构建对象，则需要在新构建的对象上调用相关的 disable 方法
        // 来确保不会再次触发 Hook 函数
        post = AVObject.CreateWithoutData<AVObject>(post.ObjectId);
        post.DisableAfterHook();
        await post.SaveAsync();
    }));
```

{% endblock %}
