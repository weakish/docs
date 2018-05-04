{% import "views/_helper.njk" as docs %}

{% macro avobjectSubclass() %}

### AVObject 的子类化

子类化的目的是为了使用给自己自定义的强类型来使用云存储而不需要在自己的代码里面拘泥于 AVObject 提供的默认的操作接口，

例如我们现在有一个公司内部的员工管理系统，之前是使用传统的 SQL Server 数据库做存储的，因此在系统里面存在了如下 `Employee` 类:

```cs
public class Employee
{
    public string DisplayName
    {
        get;
        set;
    }

    public List<string> Positions
    {
        get;
        set;
    }
}
```

而现在改用 LeanCloud 云存储服务之后的代码改成如下即可：

```cs
[AVClassName("Employee")]
public class Employee : AVObject
{
    [AVFieldName("displayName")]
    public string DisplayName
    {
        get { return GetProperty<string>("DisplayName"); }
        set { SetProperty<string>(value, "DisplayName"); }
    }

    [AVFieldName("positions")]
    public List<string> Positions
    {
        get { return GetProperty<List<string>>("Positions"); }
        set { SetProperty<List<string>>(value, "Positions"); }
    }
}
```
[AVFieldName("displayName")]中的**displayName**为存储后台中对应的“列名”，DisplayName为自定义属性名。

然后在系统启动之后，注册子类:

```cs
AVObject.RegisterSubclass<Employee>();
```

#### 使用子类

##### 新增和修改

```cs
var tom = new Employee();
var className = tom.ClassName;
tom.Positions = new List<string>() { "manager", "vp" };
tom.DisplayName = "Tom";
return tom.SaveAsync();
```

##### 查询

```cs
var query = new AVQuery<Employee>();
return query.FindAsync().ContinueWith(t => 
{
    var first = t.Result.FirstOrDefault();
});
```

##### 删除

```cs
tom.DeleteAsync();
```

因为 `Employee` 的继承自 `AVObject`，因此它具备了所有 `AVObject` 的灵活性又具备了当前业务系统的特殊性。

{% endmacro %}

