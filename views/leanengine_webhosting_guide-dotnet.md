{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = '云引擎' %}
{% set platformName = '.NET' %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = '.NET' %}
{% set leanengine_middleware = '[LeanEngine dotNET SDK](https://github.com/leancloud/leanengine-dotNET-sdk/)' %}


{% block generalFeature %}{% endblock %}

{% block getting_started %}

将示例代码 [aspnetcore-getting-started](https://github.com/leancloud/aspnetcore-getting-started) 克隆到本地：

```sh
git clone git@github.com:leancloud/aspnetcore-getting-started.git
```

{% endblock %}

{% block leancache %}
在追求高效访问和快速存取的服务端项目里面，云引擎也内置了 Redis 的服务，详细可以查看文档:[LeanCache](leancache_guide.html)。

如下示例将演示如何使用依赖注入框架来使用 [LeanCache](leancache_guide.html)：

在 `Startup.cs` 文件内部添加如下代码:

```cs
// This method gets called by the runtime. Use this method to add services to the container.
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();

    // 这里是在控制台创建实例时输入的名称：
    var instanceName = "dev";
    // 这里采用了依赖注入的方式
    services.UseLeanCache(instanceName);
}
```

紧接着在实际需要使用的时候如下读取依赖：

```cs
[Route("api/[controller]")]
public class TodoController : Controller
{
    private readonly Func<string, LeanCache> _serviceAccessor;

    public TodoController(Func<string, LeanCache> serviceAccessor)
    {
        // 读取在 services.UseLeanCache(instanceName); 时注入的 LeanCache 实例
        _serviceAccessor = serviceAccessor;
        var instanceName = "dev";
        todoDb = GetConnectionMultiplexer(instanceName);
    }

    // 这里是获取 redis 连接
    public IConnectionMultiplexer GetConnectionMultiplexer(string leancacheInstanceName)
    {
        return _serviceAccessor(leancacheInstanceName).GetConnection();
    }

    private IConnectionMultiplexer todoDb;
    public IConnectionMultiplexer TodoDb
    {
        get => todoDb;
    }

    // GET api/todo/5
    [HttpGet("{id}")]
    public JsonResult Get(int id)
    {
        IDatabase db = TodoDb.GetDatabase();
        var json = db.StringGet(id.ToString());
        if (string.IsNullOrEmpty(json)) return Json("{}");
        var todo = Todo.FromJson(json);
        return Json(todo);
    }

    // POST api/todo
    [HttpPost]
    public JsonResult Post([FromBody]Todo todo)
    {
        IDatabase db = TodoDb.GetDatabase();
        db.StringSet("1", todo.ToJson());

        return Json(new { ID = 1 });
    }
}
```

```
{% endblock %}
