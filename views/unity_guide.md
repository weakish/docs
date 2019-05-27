{% import "views/_storage.md" as storagePartial %}
{% import "views/_data.njk" as data %}
{% import "views/_helper.njk" as docs %}
{% import "views/_data.njk" as data %}
{% import "views/_sms.njk" as sms %}
{% import "views/_parts.html" as include %}
{% set segment_code ="dotnet" %}
{% set middot = '·' %}
{% set link_to_blog_password_reset = '关于自定义邮件模板和验证链接，请参考《[自定义应用内用户重设密码和邮箱验证页面](https://blog.leancloud.cn/607/)》。' %}
{% set app_permission_link = "[控制台 > 存储 > 设置 > 用户账号](/dashboard/storage.html?appid={{appid}}#/storage/conf)" %}
{% set query_result_limit = "每次查询默认最多返回 100 条符合条件的结果，要更改这一数值，请参考 [限定结果返回数量](#限定返回数量)。" %}
{% set tutorial_restaurant = '[《教程 · 开发餐厅座位预订系统》](app-sample-restaurant.html)'%}

{% set query_result_limit = "每次查询默认最多返回 100 条符合条件的结果，要更改这一数值，请参考 [限定结果返回数量](#限定返回数量)。" %}

#  数据存储开发指南 &middot; Unity

数据存储（LeanStorage）是 LeanCloud 提供的核心功能之一。下面我们用一个简单的示例来说明它的基本用法。

下面这段代码在创建了一个 `GameEquip` 类型的对象，并将它保存到云端：

```cs
var equip = new AVObject("GameEquip");
equip["name"] = "短剑";
equip["attackValue"] = 5;
await equip.SaveAsync();
Debug.Log(equip.ObjectId);
```

如果你熟悉关系型数据库的话，需要注意 LeanStorage 的不同点。在 LeanStorage 里不需要事先建立表结构（schema），并且可以随时增加新的属性。通常这被称为无模式（schema-free）。例如，为上面的 `GameEquip` 类型新增一个表示等级的 `level` 属性，只需做如下变动：

```cs
var equip = new AVObject("GameEquip");
equip["name"] = "短剑";
equip["attackValue"] = 5;
// 只要添加这一行代码，服务端就会自动添加这个字段
equip["level"] = 1;
await equip.SaveAsync();
Debug.Log(equip.ObjectId);
```

- 我们为各个平台或者语言开发的 SDK 在底层都是通过 HTTPS 协议调用统一的 [REST API](rest_api.html)，提供完整的接口对数据进行各类操作。

LeanStorage 在结构化数据存储方面，与 MySQL、Postgres、MongoDB 等数据库的区别在于：

1. 数据库是面向服务器端的，用户自己开发的服务器端程序以用户名和密码登录到数据库。用户需要在服务器端程序里自己实现应用层的权限管理并向客户端提供接口。LeanStorage 是面向客户端的存储服务，通过 ACL 机制在 API 层面提供了完整的权限管理功能。很多开发者都选择通过在客户端集成 {{productName}} SDK 来直接访问数据，而不再开发服务端的程序。
2. 与关系型数据库（MySQL、Postgres等）相比，LeanStorage 对多表查询（join）和事务等功能的支持较弱，所以在有些应用场景中会需要以有一定冗余的方式存储数据，以此换来的是良好的可扩展性，更有利于支撑起大流量的互联网应用。

## SDK 安装

请阅读 [ Unity 安装指南](sdk_setup-{{segment_code}}.html)。

## 对象

`AVObject` 是 LeanStorage 对复杂对象的封装，每个 AVObject 包含若干属性值对，也称键值对（key-value）。属性的值是与 JSON 格式兼容的数据。通过 REST API 保存对象需要将对象的数据通过 JSON 来编码。这个数据是无模式化的（Schema Free），这意味着你不需要提前标注每个对象上有哪些 key，你只需要随意设置 key-value 对就可以，云端会保存它。

### 数据类型
`AVObject` 支持以下数据类型：

```cs
int testNumber = 2018;
float testFloat = 1.23f;
double testDouble = 3.2D;

bool testBool = true;
string testString = testNumber + " 年度音乐排行";
DateTime testDate = DateTime.Today;
byte[] testData = System.Text.Encoding.UTF8.GetBytes("短篇小说");

List<int> testNumbers = new List<int>();
testNumbers.Add(testNumber);

var testDictionary = new Dictionary<string, object>();
testDictionary.Add("number", testNumber);
testDictionary.Add("string", testString);

var testObject = new AVObject("DataTypes");
testObject["testInteger"] = testNumber;
testObject["testFloat"] = testFloat;
testObject["testDouble"] = testDouble;
testObject["testBoolean"] = testBool;
testObject["testDate"] = testDate;
testObject["testData"] = testData;
testObject["testArrayList"] = testNumbers;
testObject["testDictionary"] = testDictionary;
await testObject.SaveAsync();
Debug.Log(testObject.ObjectId);
```

其中 `int`、`float`、`double` 类型的数据，服务端统一为 `Number` 类型来做处理，SDK 会在开发者获取相关值时自动做类型转换。

### 保存对象

现在我们保存一个道具背包 `GameEquipBag`，背包中可以有多个道具 `GameEquip`。我们并不需要提前去后台创建这个名为 `GameEquipBag` 的 Class 类，而仅需要执行如下代码，云端就会自动创建这个类：

```c#
var equipBag = new AVObject("GameEquipBag");
equipBag["scale"] = 20;
equipBag["name"] = "装备背包";
await equipBag.SaveAsync();
Debug.Log(equipBag.ObjectId);
```

运行以上代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 [数据管理](/dashboard/data.html?appid={{appid}})  页面来查看数据的存储情况。

除了 scale、name 之外，其他字段都是数据表的内置属性。

内置属性|类型|描述
---|---|---
`objectId`| String |该对象唯一的 Id 标识
`ACL`| ACL |该对象的权限控制，实际上是一个 JSON 对象，控制台做了展现优化。
`createdAt`| Date |该对象被创建的 UTC 时间
`updatedAt` | Date |该对象最后一次被修改的时间

<dl>
  <dt>属性名</dt>
  <dd>也叫键或 key，必须是由字母、数字或下划线组成的字符串。<br/>自定义的属性名，{{ docs.alertInline("不能以双下划线 `__` 开头，也不能与以下系统保留字段和内置属性重名（不区分大小写）") }}。
  <div class="callout callout-danger monospace" style="margin-top:1em;color:#999;">{{ data.preservedWords() }}</div></dd>
  <dt>属性值</dt>
  <dd>可以是字符串、数字、布尔值、数组或字典。</dd>
</dl>

为提高代码的可读性和可维护性，建议使用驼峰式命名法（CamelCase）为类和属性来取名。类，采用大驼峰法，如 `CustomData`。属性，采用小驼峰法，如 `imageUrl`。


### 获取对象

每个被成功保存在云端的对象会有一个唯一的 Id 标识 `objectId`，因此获取对象的最基本的方法就是根据 `objectId` 来查询：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip");
AVObject equipment = await query.GetAsync("5c4147887565716f2485fc89");
Debug.Log(equipment.ObjectId);
```

#### 获取 objectId
每一次对象存储成功之后，云端都会返回 objectId，它是一个全局唯一的属性。

```cs
var equipBag = new AVObject("GameEquipBag");
equipBag["scale"] = 20;
equipBag["name"] = "装备背包";
await equipBag.SaveAsync();
Debug.Log(equipBag.ObjectId);
```

#### 访问对象的属性
objectId、createdAt、updatedAt 三个特殊属性可以直接获取，其他的自定义属性可以使用相应数据类型的 `Get<T>` 泛型方法：

```cs
var equipBag = new AVObject("GameEquipBag");
equipBag["scale"] = 20;
equipBag["name"] = "装备背包";
await equipBag.SaveAsync();

// 获取自定义属性
int bagScale = equipBag.Get<int>("scale");
string bagName = equipBag.Get<string>("name");
// 三个特殊属性
string objectId = equipBag.ObjectId;
DateTime? createdAt = equipBag.CreatedAt;
DateTime? updatedAt = equipBag.UpdatedAt;

Debug.Log(bagScale);
Debug.Log(bagName);
Debug.Log(objectId);
Debug.Log(createdAt);
Debug.Log(updatedAt);
```

如果访问的属性不存在，SDK 会抛出异常，如果您不确认某个属性是否有值，可以这样获取属性：
```cs
if (equipBag.TryGetValue("name", out string bagName)) {
    Debug.Log(bagName);
}
```

#### 默认属性
默认属性是所有对象都会拥有的属性，它包括 `objectId`、`createdAt`、`updatedAt`。

**createdAt**：对象第一次保存到云端的时间戳。该时间一旦被云端创建，在之后的操作中就不会被修改。
**updatedAt**：对象最后一次被修改（或最近一次被更新）的时间。

注：应用控制台对 `createdAt` 和 `updatedAt` 做了在展示优化，它们会依据用户操作系统时区而显示为本地时间；客户端 SDK 获取到这些时间后也会将其转换为本地时间；而通过 REST API 获取到的则是原始的 UTC 时间，开发者可能需要根据情况做相应的时区转换。


### 更新对象
LeanStorage 上的更新对象都是针对单个对象，云端会根据有没有 objectId 来决定是新增还是更新一个对象。

假如 objectId 已知，则可以通过如下接口从本地构建一个 AVObject 来更新这个对象：

```cs
// 第一个参数是 className，第二个参数是 objectId
var equipBag = AVObject.CreateWithoutData("GameEquipBag", "5372d119e4b0d4bef5f036ae");
// 修改其中一个属性
equipBag["scale"] = 30;
// 保存到云端
await equipBag.SaveAsync();
```

更新操作是覆盖式的，云端会根据最后一次提交到服务器的有效请求来更新数据。更新是字段级别的操作，未更新的字段不会产生变动，这一点请不用担心。

<!--TODO:
#### 计数器
-->

#### 更新数组
使用以下方法可以方便地维护数组类型的数据：

将指定对象附加到数组末尾：
- `AddToList`
- `AddRangeToList`

如果数组中不包含指定对象，将该对象加入数组，对象的插入位置是随机的:
- `AddUniqueToList`
- `AddRangeUniqueToList`

从数组字段中删除指定的对象：
- `RemoveAllFromList`

例如 `GameEquip` 有一个字段 `repairTime` 是数组类型，记录着装备的维修时间，可以这样存储数据。

```cs
var equip = AVObject.CreateWithoutData("GameEquip", "5c4147887565716f2485fc89");
equip.AddToList("repairTime", DateTime.Today);
await equip.SaveAsync();
var repairTimes = equip.Get<List<object>>("repairTime");
foreach (object repairTime in repairTimes)
{
    Debug.Log(((DateTime)repairTime).ToString());
}
```

### 删除对象

要删除某个对象，使用 `AVObject` 的 `DeleteAsync` 方法。

```cs
await myObject.DeleteAsync();
```

<div class="callout callout-danger">删除对象是一个较为敏感的操作。在控制台创建对象的时候，默认开启了权限保护，关于这部分的内容请阅读《[ACL 权限管理指南](acl-guide.html)》。</div>

#### 删除某一个属性
如果仅仅想删除对象的某一个属性，使用 `Remove` 方法。

```cs
//执行下面的语句会将 repairTime 字段置为空
equip.Remove("repairTime");

// 将删除操作发往服务器生效。
await equip.SaveAsync();
```

### 批量操作
为了减少网络交互的次数太多带来的时间浪费，你可以在一个请求中对多个对象进行创建、更新、删除、获取。接口都在 `AVObject` 这个类下面：

```cs
List<AVObject> objects = new List<AVObject>(); // 构建一个本地的 AV.Object 对象数组

// 批量创建（更新）
await AVObject.SaveAllAsync(objects);

// 批量删除
await AVObject.DeleteAllAsync(objects);

// 批量获取
await AVObject.FetchAllAsync(objects);
```

不同类型的批量操作所引发不同数量的 API 调用，具体请参考 [API 调用次数的计算](faq.html#API_调用次数的计算)。

### 关联数据
#### Pointer
一个道具背包中会有许多种道具，这是一种典型的一对多关系。下面我们使用 Pointers 来存储这种一对多的关系。

```cs
// 装备背包
var equipBag = new AVObject("GameEquipBag");
equipBag["scale"] = 20;
equipBag["name"] = "装备背包";

// 道具
var equip = new AVObject("GameEquip");
equip["name"] = "短剑";
equip["attackValue"] = 5;

// 设置该道具在装备背包中
equip["gameEquipBag"] = equipBag;
await equip.SaveAsync();
```

##### 获取 Pointer 对象
假如已知一个道具背包，要找出背包中所有的道具，可以这样做：

```cs
var gameEquipBag = AVObject.CreateWithoutData("GameEquipBag", "5c41937c44d904006a538a2b");
var query = new AVQuery<AVObject>("GameEquip");
query = query.WhereEqualTo("gameEquipBag", gameEquipBag);
var equipments = (await query.FindAsync()).ToList();
equipments.ForEach((equip) =>
{
    var name = equip.Get<string>("name");
    Debug.Log(name);
});
```

更多内容可参考 [关联数据查询](relation-guide.html#Pointers_查询)。


## 子类化
LeanCloud 希望设计成能让人尽快上手并使用。你可以通过 `avobject.get<T>` 方法访问所有的数据。但是在很多现有成熟的代码中，子类化能带来更多优点，诸如简洁、可扩展性以及 IDE 提供的代码自动完成的支持等等。子类化不是必须的，你可以将下列代码转化：

```cs
var equip = new AVObject("GameEquip");
equip["name"] = "短剑";
equip["attackValue"] = 5;
await equip.SaveAsync();
```

可以写成：

```cs
var equip = new GameEquip();
equip.Name = "短剑";
equip.AttackValue = 5;
await equip.SaveAsync();
```

### 子类化 AVObject

要实现子类化，需要下面几个步骤：

1. 首先声明一个子类继承自 AVObject；
2. 为 `class` 添加 `[AVClassName("xxx")]`。它的值必须是一个字符串，也就是你过去传入 AVObject 构造函数的类名。这样以来，后续就不需要再在代码中出现这个字符串类名；
3. 实现自定义属性的 `get` 及 `set` 方法;
4. 在应用初始化的地方，在系统启动时注册子类 `AVObject.RegisterSubclass<yourClassName>();`。

下面是实现 `GameEquip` 子类化的例子:

```cs
[AVClassName("GameEquip")]
public class GameEquip : AVObject
{
    [AVFieldName("name")]
    public string Name
    {
        get { return GetProperty<string>("Name"); }
        set { SetProperty<string>(value, "Name"); }
    }

    [AVFieldName("attackValue")]
    public int AttackValue
    {
        get { return GetProperty<int>("AttackValue"); }
        set { SetProperty<int>(value, "AttackValue"); }
    }
}
```
`[AVFieldName("name")]` 中的 `name` 为存储后台中对应的「列名」；`public string Name` 中的 `Name` 为自定义属性名。

然后在系统启动时，注册子类:

```cs
AVObject.RegisterSubclass<GameEquip>();
```

### 使用子类

#### 新增和修改

```cs
var knife = new GameEquip();
var className = knife.ClassName;
Debug.Log(className);
knife.Name = "小刀";
knife.AttackValue = 1;
await knife.SaveAsync();
```

#### 查询

```cs
var query = new AVQuery<GameEquip>();
await query.FindAsync();
```

#### 删除

```cs
await knife.DeleteAsync();
```

## 文件

文件存储也是数据存储的一种方式，图像、音频、视频、通用文件等等都是数据的载体。很多开发者也习惯把复杂对象序列化之后保存成文件，比如 JSON 或 XML 文件。文件存储在 LeanStorage 中被单独封装成一个 `AVFile` 来实现文件的上传、下载等操作。

### 上传文件

文件上传是指开发者调用接口将文件存储在云端，并且返回文件最终的 URL 的操作。

文件上传成功后会在系统表 _File 中生成一条记录，此后该记录无法被再次修改，包括 metaData 字段 中的数据。所以如需更新该文件的记录内容，只能重新上传文件，得到新的 id 和 URL。

如果 `_File` 表打开了 删除权限，该记录才可以被删除。

#### 从数据流构建文件

`AVFile` 支持图片、视频、音乐等常见的文件类型，以及其他任何二进制数据，在构建的时候，传入对应的数据流即可：

```cs    
byte[] data = System.Text.Encoding.UTF8.GetBytes("Hi LeanCloud!");
AVFile file = new AVFile("resume.txt", data, new Dictionary<string, object>()
{
    {"author","LeanCloud"}
});
await file.SaveAsync();
Debug.Log(file.ObjectId);
```

AVFile构造函数的第一个参数指定文件名称，第二个构造函数接收一个byte数组，也就是将要上传文件的二进制，第三个参数是自定义元数据的字典，比如你可以把文件的作者的名字当做元数据存入这个字典，LeanCloud 的服务端会把它保留起来，这样在以后获取的时候，这种类似的自定义元数据都会被获取。

上例将文件命名为 `resume.txt`，这里需要注意两点：

- 不必担心文件名冲突。每一个上传的文件都有惟一的 ID，所以即使上传多个文件名为 resume.txt 的文件也不会有问题。
- 给文件添加扩展名非常重要。云端通过扩展名来判断文件类型，以便正确处理文件。所以要将一张 PNG 图片存到 AV.File 中，要确保使用 .png 扩展名。

#### 从本地路径构建文件

在 Unity 中，如果很清楚地知道某一个文件所存在的路径，比如在游戏中上传一张游戏截图，可以通过SDK直接获取指定的文件，上传到LeanCloud 中。

```cs
AVFile file = new AVFile("screenshot.png", Path.Combine(Application.persistentDataPath, "screenshot.PNG"));
await file.SaveAsync();
Debug.Log(file.ObjectId);
```

#### 从网络路径构建文件
从一个已知的 URL 构建文件也是很多应用的需求。例如，从网页上拷贝了一个图像的链接，代码如下：

```cs
AVFile file = new AVFile("Satomi_Ishihara.gif", "http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif");
await file.SaveAsync();
Debug.Log(file.ObjectId);
```

从 [本地路径构建文件](#从本地路径构建文件) 会产生实际上传的流量，并且文件最后是存在云端，而本处从网络路径构建的文件实体并不存储在云端，只是会把文件的物理地址作为一个字符串保存在云端。

#### 上传进度监听

一般来说，上传文件都会有一个上传进度条显示用以提高用户体验：

```cs
async Task SaveFile() {
    byte[] data = System.Text.Encoding.UTF8.GetBytes("Hi LeanCloud!");
    AVFile file = new AVFile("resume.txt", data, new Dictionary<string, object>()
    {
        {"author","LeanCloud"}
    });
    await file.SaveAsync(new ProgressListener());
}

class ProgressListener : System.IProgress<AVUploadProgressEventArgs> {
    public void Report(AVUploadProgressEventArgs value) {
        Debug.Log(value.Progress);
    }
}

```

### 文件元数据

AV.File 的 metaData 属性，可以用来保存和获取该文件对象的元数据信息。metaData 一旦保存到云端就无法再次修改。

```cs
// 保存 metaData
AVFile file = new AVFile("mytxtFile.txt", data, new Dictionary<string, object>()
{
    {"author","LeanCloud"}
});

// 获取 metaData
var metadata = file.MetaData;
```

### 关联文件

使用 `Pointer` 字段类型将 `AVFile` 关联到 `AVObject` 对象的一个字段上：
```cs
AVFile file = new AVFile("picture.png", data);

var equip = new AVObject("GameEquip");
equip["image"] = file;
await equip.SaveAsync();
```

查询的时候需要额外的 `include` 一下：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").Include("image");
var equipments = (await query.FindAsync()).ToList();
equipments.ForEach((equip) =>
{
    if (equip.TryGetValue("image", out AVFile image))
    {
        var url = image.Url;
        Debug.Log(url);
    }
});
```

#### 文件下载
因为多平台适配会造成困扰，因此 Unity SDK 不提供直接下载文件的方式。我们推荐拿到 `avFile.Url` 这个属性后，用 Unity 自带的 WWW 类或者 UnityWebRequest 类实现文件下载。

### 文件删除

**删除文件就意味着，执行之后在数据库中立刻删除记录，并且原始文件也会从存储仓库中删除（所有涉及到物理级别删除的操作请谨慎使用）**

<div class="callout callout-danger">默认情况下，文件的删除权限是关闭的，需要进入 {% if node == 'qcloud' %}**控制台** > **存储** > `_File`{% else %}[控制台 > 存储 > **`_File`**](/dashboard/data.html?appid={{appid}}#/_File){% endif %}，选择菜单 **其他** > **权限设置** > **delete** 来开启。</div>

```cs
AVFile file = await AVFile.GetFileWithObjectIdAsync("538ed669e4b0e335f6102809");
await file.DeleteAsync();
```

### 启用 HTTPS 域名

如果希望使用 HTTPS 域名来访问文件，需要进入 [控制台 > 存储 > 设置 > 文件](/dashboard/storage.html?appid={{appid}}#/storage/conf)，勾选 **启用 https 域名**。HTTPS 文件流量无免费的使用额度，收费标准将在该选项开启时显示。

{{ docs.alert("「启用 https 域名」会影响到 API 返回的文件地址是 HTTPS 还是 HTTP 类型的 URL。需要注意的是，即使没有启用这一选项，终端仍然可以选择使用 HTTPS URL 来访问文件，但由此会产生 HTTPS 流量扣费。") }}

在启用文件 HTTPS 域名之后，之前已保存在 `_File` 表中的文件的 URL 会自动被转换为以 HTTPS 开头。如果取消 HTTPS 域名，已经改为 HTTPS 域名的文件不会变回到 HTTP。

<a id="rtm-http-urls" name="rtm-http-urls"></a>LeanCloud 即时通讯组件也使用 `AVFile` 来保存消息的图片、音频等文件，并且把文件的地址写入到了消息内容中。当文件 HTTPS 域名被开启后，之前历史消息中的文件地址不会像 `_File` 表那样被自动转换，而依然保持 HTTP。

{% block text_http_access_for_ios9andup %}{% endblock %}

### 设置自定义文件域名

LeanCloud 提供公用的二级域名来让开发者及其用户能够便捷地访问到存储在云端的文件。但由于受网络法规的管控与限制，我们无法 100% 保证该公用域名随时可用。因此，强烈建议开发者**使用自定义域名来访问自己的文件**，以避免公用域名不可用之时应用的体验会受到影响。请前往 [存储 > 设置 > 文件](/dashboard/storage.html?appid={{appid}}#/storage/conf) 设置自定义域名。

### CDN 加速
{{ data.cdn(true) }}


## 查询

LeanCloud Unity SDK 提供了许多查询方法来简化操作。

首先需要明确最核心的一点，在我们的 SDK 中，`AVQuery` 对象的所有以 `Where` 开头的方法，以及限定查询范围类的方法（`Skip`、 `Limit`、 `ThenBy`、 `Include` 等）都会返回一个全新的对象，它并不是在原始的 `AVQuery` 对象上修改内部属性。比如:

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip");
query.WhereEqualTo("name", "短剑"); //注意：这是错误的！！！
query.FindAsync();
```
**以上代码是用户经常会犯的错误案例，请勿拷贝到项目中使用！**

上面那段代码会返回 `GameEquip` 中所有的数据，而不是所设想的只有 `name` 等于 `短剑` 的数据。正确的写法是：

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("name", "短剑");
```
以此类推，`AVQuery<T>` 的所有复合查询条件都应该使用 `.` 这个符号来创建链式表达式。例如，查找所有 `name` 等于 `短剑`，且 `attackValue` 大于 `5` 的 `GameEquip`：

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("name", "短剑").WhereGreaterThan("attackValue",5);
```

### 基本查询

最基础的用法是根据 objectId 来查询对象：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip");
AVObject gameEquip = await query.GetAsync("53706cd1e4b0d4bef5eb32ab");
Debug.Log(gameEquip.ObjectId);
```

### 比较查询
逻辑操作 | AVQuery 方法|
---|---
等于 | `WhereEqualTo`
不等于 |  `WhereNotEqualTo`
大于 | `WhereGreaterThan`
大于等于 | `WhereGreaterThanOrEqualTo`
小于 | `WhereLessThan`
小于等于 | `WhereLessThanOrEqualTo`

利用上述表格介绍的逻辑操作的接口，我们可以很快地构建条件查询。

例如，查询攻击力大于 4 的所有装备 ：

```c#
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereGreaterThan("attackValue", 4);
var equipments = (await query.FindAsync()).ToList();
equipments.ForEach((equip) =>
{
    var equipName = equip.Get<string>("name");
    Debug.Log(equipName);
});
```
<div class="callout callout-info">{{query_result_limit}}</div>

查询攻击力大于等于 4 的 GameEquip：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereGreaterThanOrEqualTo("attackValue", 4);
var equipments = (await query.FindAsync()).ToList();
equipments.ForEach((equip) =>
{
    var equipName = equip.Get<string>("name");
    Debug.Log(equipName);
});
```

### 查询备选范围内满足条件的值

当我们要查询的属性值，存在一个可选集合的时候，可以使用 `containedIn` 来进行查询。

例如我们要查出来名字为 `短剑` 或 `长刀` 的所有装备：

```cs
var names = new[] { "短剑", "长刀"};
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereContainedIn("name", names);
var equipments = (await query.FindAsync()).ToList();
```

如果想查询排除 `短剑` 或 `长刀` 的所有装备，可以使用 `WhereNotContainedIn` 方法来实现。

```cs
var names = new[] { "短剑", "长刀"};
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereNotContainedIn("name", names);
var equipments = (await query.FindAsync()).ToList();
```

### 多个查询条件
当多个查询条件并存时，它们之间默认为 AND 关系，即查询只返回满足了全部条件的结果。建立 OR 关系则需要使用[组合查询](#组合查询)。

在简单查询中，如果对一个对象的同一属性设置多个条件，那么先前的条件会被覆盖，查询只返回满足最后一个条件的结果。例如要找出攻击力为 5 和 6 的所有装备，**错误**写法是：

```cs
// 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 attackValue = 6 的结果
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("attackValue", 5).WhereEqualTo("attackValue", 6);
```

正确作法是使用 [组合查询 · OR 关系](#组合查询) 来构建这种条件。

### 字符串查询

**前缀查询**类似于 SQL 的 LIKE 'keyword%' 条件。因为支持索引，所以该操作对于大数据集也很高效。

```cs
// 查询 name 字段的值是以"短"字开头的数据
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereStartsWith("name", "短");
```

**包含查询**类似于 SQL 的 LIKE '%keyword%' 条件，比如查询标题包含「剑」的 `GameEquip`：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereContains("name", "剑");
```

### 数组查询

如果一个 Key 对应的值是一个数组，你可以查询 key 的数组包含了数字 2 的所有对象:

```cs
// 查找出所有arrayKey对应的数组同时包含了数字2的所有对象
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("arrayKey", 2);
```

同样，你可以查询出 Key 的数组同时包含了 2,3 和 4 的所有对象：

```cs
//查找出所有arrayKey对应的数组同时包含了数字2,3,4的所有对象。
List<int> numbers = new List<int>();
numbers.Add(2);
numbers.Add(3);
numbers.Add(4);
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereContainsAll("arrayKey", numbers);
```

查询「全不包含」的情况：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereNotContainedIn("arrayKey", numbers);
```

查询「部分包含（指查询的数组属性中，包含有目标集合的部分元素）」的情况：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquip").WhereContainedIn("arrayKey", numbers);
```

### 空值查询

假设用户可以有选择地为背包自己命名，要想找出那些已经有自定义命名的背包：

```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquipBag").WhereExists("name");
```

找出所有没有命名的背包：
```cs
AVQuery<AVObject> query = new AVQuery<AVObject>("GameEquipBag").WhereDoesNotExist("name");
```

### 关系查询
#### Pointer 查询

基于在 [Pointer](#Pointer) 小节介绍的存储方式：一个道具背包 `GameEquipBag` 中会有许多种道具 `GameEquip`，这是一种典型的一对多关系。现在已知一个 `GameEquipBag`，想查询所有的 `GameEquip` 对象，可以使用如下代码：

```cs
var gameEquipBag = AVObject.CreateWithoutData("GameEquipBag", "5c41937c44d904006a538a2b");
var query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("gameEquipBag", gameEquipBag).Include("gameEquipBag");
var equipments = (await query.FindAsync()).ToList();
equipments.ForEach((equip) =>
{
    var equipName = equip.Get<string>("name");
    Debug.Log(equipName);
});
```

#### 关联属性查询

正如在 Pointer 中保存 `GameEquip` 的 `GameEquipBag` 属性一样，假如查询到了一些 `GameEquip` 对象，想要一并查询出每一个 `GameEquip` 对应的 `GameEquipBag` 对象的时候，可以加上 include 关键字查询条件。同理，假如 `GameEquipBag` 表里还有 pointer 型字段 `user` 时，再加上一个递进的查询条件，形如 include(b.c)，即可一并查询出每一条 `GameEquipBag` 对应的 AVUser 对象。代码如下：

```cs
var gameEquipBag = AVObject.CreateWithoutData("GameEquipBag", "56545c5b00b09f857a603632");
// 关键代码，用 include 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId。这里会返回 gameEquipBag 和 user 的详细信息。
var query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("gameEquipBag", gameEquipBag).Include("gameEquipBag").Include("gameEquipBag.user");
```


此外需要格外注意的是，假设对象有一个 Array 类型的字段 `arrayKey` 内部是 Pointer 类型：

```cs
[pointer1, pointer2, pointer3]
```

可以用 include 方法获取数组中的 pointer 数据，例如：

```cs
var query = new AVQuery<AVObject>("GameEquip").Include('pointerArrayKey');
```

但是 Array 类型的 include 操作只支持到第一层，不支持 include(b.c) 这种递进关联查询。


#### 内嵌查询
道具表 `GameEquip` 中有一个所属背包字段 `gameEquipBag` 指向 `GameEquipBag` 表。查询容量为 20 的背包 `GameEquipBag` 中的所有道具 `GameEquip`（注意查询针对的是 `GameEquip`），使用内嵌查询接口就可以通过一次查询来达到目的

```cs
var innerQuery = new AVQuery<AVObject>("GameEquipBag").WhereEqualTo("scale", 20);
var query = new AVQuery<AVObject>("GameEquip").WhereMatchesQuery("gameEquipBag", innerQuery);
```
与普通查询一样，内嵌查询默认也最多返回 100 条记录，想修改这一默认请参考 [限定结果返回数量](#限定返回数量)。

**如果所有返回的记录没有匹配到外层的查询条件，那么整个查询也查不到结果**。

LeanCloud 云端使用的并非关系型数据库，无法做到真正的联表查询，所以实际的处理方式是：先执行内嵌/子查询（和普通查询一样，limit 默认为 100，最大 1000），然后将子查询的结果填入主查询的对应位置，再执行主查询。

如果子查询匹配到了 100 条以上的记录（性别等区分度低的字段重复值往往较多），且主查询有其他查询条件（region = 'cn'），那么可能会出现没有结果或结果不全的情况，其本质上是子查询查出的 100 条记录没有满足主查询的其他条件。

我们建议采用以下方案进行改进：

- 确保子查询的结果在 100 条以下，如果在 100 - 1000 条的话请在子查询末尾添加 limit 1000。
- 将需要查询的字段冗余到主查询所在的表上；例如将 score 冗余到 Player 表上，或者将 region 添加到 GameScore 上然后只查 GameScore 表。
- 进行多次查询，每次在子查询上添加 skip 来遍历所有记录（注意 skip 的值较大时可能会引发性能问题，因此不是很推荐）。


### 组合查询
组合查询就是把诸多查询条件合并成一个查询，再交给 SDK 去云端查询。方式有两种：OR 和 AND。

#### OR 查询

OR 操作表示多个查询条件符合其中任意一个即可。 例如，查询攻击力是 5 ，或等级为 1 的道具：

```cs
var attackQuery = new AVQuery<AVObject>("GameEquip").WhereEqualTo("attackValue", 5);
var levelQuery = new AVQuery<AVObject>("GameEquip").WhereEqualTo("level", 1);
var query = attackQuery.Or(levelQuery);
```


<!-- 
// SDK 还不支持，等支持了再说

#### AND 查询

如果需要对同一个字段进行两种约束，需要用到 AND 查询，例如，寻找攻击力大于 4 小于 10 的道具：

```cs
var lowAttackQuery = new AVQuery<AVObject>("GameEquip").WhereLessThan('attackValue', 10);
var highAttackQuery = new AVQuery<AVObject>("GameEquip").WhereGreaterThan('attackValue', 4);
var query = lowAttackQuery.And(highAttackQuery); 
```
-->

### 查询结果数量和排序

#### 获取第一条结果
在很多应用场景下，只要获取满足条件的一个结果即可，例如获取满足条件的第一条 `GameEquip`：

```cs
var query = new AVQuery<AVObject>("GameEquip");
var equipment = await query.FirstAsync();
```

#### 限定返回数量
为了防止查询出来的结果过大，云端默认针对查询结果有一个数量限制，即 limit，它的默认值是 100。比如一个查询会得到 10000 个对象，那么一次查询只会返回符合条件的 100 个结果。limit 允许取值范围是 1 ~ 1000。例如设置返回 10 条结果：

```cs
var query = new AVQuery<AVObject>("GameEquip").Limit(10);
```

#### 跳过数量
设置 skip 这个参数可以告知云端本次查询要跳过多少个结果。将 skip 与 limit 搭配使用可以实现翻页效果。例如，在翻页中每页显示数量为 10，要获取第 3 页的对象：

```cs
// 在此处代码中，跳过了符合条件的前 20 个对象，并限定只返回 10 个对象
var query = new AVQuery<AVObject>("GameEquip").Skip(20).Limit(10);
```

上述方法的执行效率比较低，因此不建议广泛使用。建议选用 createdAt 或者 updatedAt 这类的时间戳进行 [分段查询](faq.html#查询结果默认最多只能返回 1000 条数据，当我需要的数据量超过了-1000-该怎么办？)。

#### 返回指定属性/字段

通常列表展现的时候并不是需要展现某一个对象的所有属性，这样既满足需求又节省流量，还可以提高一部分的性能。例如只返回道具 `GameEquip` 的名字：

```cs
var query = new AVQuery<AVObject>("GameEquip").Select("name");
// 如果有多个 select 字段时，可以这样写：
var query = new AVQuery<AVObject>("GameEquip").Select("name").Select("attackValue")
```

所指定的属性或字段也支持 Pointer 类型。例如，获取 `GameEquip` 这个对象的所属背包（`gameEquipBag` 属性，Pointer 类型），仅展示这个背包的容量：

```cs
var query = new AVQuery<AVObject>("GameEquip").Include("gameEquipBag").Select("gameEquipBag.scale");
```

#### 统计总数量
通常用户在执行完搜索后，结果页面总会显示出诸如「搜索到符合条件的结果有 1020 条」这样的信息。例如，查询一下攻击力为 5 的道具有多少个：

```cs
var query = new AVQuery<AVObject>("GameEquip").WhereEqualTo("attackValue", 5);
var count = await query.CountAsync();
```

#### 排序
对于数字、字符串、日期类型的数据，可对其进行升序或降序排列。

```cs
// 根据 attackValue 升序排列
var query = new AVQuery<AVObject>("GameEquip").OrderBy("attackValue");
// 根据 attackValue 降序排列
var query = new AVQuery<AVObject>("GameEquip").OrderByDescending("attackValue");
```

一个查询可以附加多个排序条件，如按 attackValue 升序、createdAt 降序排列：

```cs
var query = new AVQuery<AVObject>("GameEquip").OrderBy("attackValue").OrderByDescending("createdAt");
```

### 查询性能优化
影响查询性能的因素很多。特别是当查询结果的数量超过 10 万，查询性能可能会显著下降或出现瓶颈。以下列举一些容易降低性能的查询方式，开发者可以据此进行有针对性的调整和优化，或尽量避免使用。

- 不等于和不包含查询（无法使用索引）
- 通配符在前面的字符串查询（无法使用索引）
- 有条件的 count（需要扫描所有数据）
- skip 跳过较多的行数（相当于需要先查出被跳过的那些行）
- 无索引的排序（另外除非复合索引同时覆盖了查询和排序，否则只有其中一个能使用索引）
- 无索引的查询（另外除非复合索引同时覆盖了所有条件，否则未覆盖到的条件无法使用索引，如果未覆盖的条件区分度较低将会扫描较多的数据）

## 用户
用户系统几乎是每款应用都要加入的功能。除了基本的注册、登录和密码重置，移动端开发还会使用手机号一键登录、短信验证码登录等功能。LeanStorage 提供了一系列接口来帮助开发者快速实现各种场景下的需求。

`AVUser` 是用来描述一个用户的特殊对象，与之相关的数据都保存在 `_User` 数据表中。

### 用户的属性

#### 默认属性

用户名、密码、邮箱是默认提供的三个属性，访问方式如下：

```cs
var user = await AVUser.LogInAsync("demoUser", "xxxx");
var uid = user.ObjectId;
var username = user.Username;
var email = user.Email;
```

请注意代码中，密码是仅仅是在注册的时候可以设置的属性（这部分代码可参照[用户名和密码注册](#用户名和密码注册)），它在注册完成之后并不会保存在本地（SDK 不会以明文保存密码这种敏感数据），所以在登录之后，再访问密码这个字段是为空的。

#### 自定义属性

用户对象和普通对象一样也支持添加自定义属性。例如，为当前用户添加年龄属性 age：

```cs
var user = AVUser.CurrentUser;
user["age"] = 25;
await user.SaveAsync();
var age = user.Get<int>("age");
Debug.Log(age);
```

#### 修改属性
很多开发者会有这样的疑问：「为什么我不能修改任意一个用户的属性？」

> 因为很多时候，就算是开发者也不要轻易修改用户的基本信息，例如用户的手机号、社交账号等个人信息都比较敏感，应该由用户在 App 中自行修改。所以为了保证用户的数据仅在用户自己已登录的状态下才能修改，云端对所有针对 AV.User 对象的数据操作都要做验证。

例如，先为当前用户增加一个 age 属性，登录后再更改它的值：

```cs
var user = await AVUser.LogInAsync("demoUser", "xxxxx");
user["age"] = 25;
await user.SaveAsync();
var age = user.Get<int>("age");
Debug.Log(age);
```

`AVUser` 的自定义属性在使用上与 `AVObject` 没有本质区别。


### 注册
#### 手机号注册或登录

很多网站为了简化注册及登录流程，都使用了「手机号 + 验证码」的方式来登录，这种方式这种方式会为没有注册过的用户自动创建账号。

首先调用发送验证码的接口：

```cs
await AVCloud.RequestSMSCodeAsync("18611111111");
```

然后在 UI 上给与用户输入验证码的输入框，用户点击登录的时候调用如下接口：

```cs
var user = await AVUser.SignUpOrLoginByMobilePhoneAsync("18611111111", "6位短信验证码");
Debug.Log(user.Username);
```

#### 用户名和密码注册

采用「用户名 + 密码」注册时需要注意：密码是以明文方式通过 HTTPS 加密传输给云端，云端会以密文存储密码，并且我们的加密算法是无法通过所谓「彩虹表撞库」获取的，这一点请开发者放心。换言之，用户的密码只可能用户本人知道，开发者不论是通过控制台还是 API 都是无法获取。另外我们需要强调<u>在客户端，应用切勿再次对密码加密，这会导致重置密码等功能失效</u>。

例如，注册一个用户的示例代码如下（用户名 `Tom` 密码 `cat!@#123`）：

```cs
var user = new AVUser();
user.Username = "Tom";
user.Password = "cat!@#123";
user.Email = "tom@leancloud.cn";
await user.SignUpAsync();
Debug.Log(user.Username);
```

如果注册不成功，请检查一下返回的错误对象。最有可能的情况是用户名已经被另一个用户注册，错误代码 [202](error_code.html#_202)，即 `_User` 表中的 `username` 字段已存在相同的值，此时需要提示用户尝试不同的用户名来注册。同样，邮件 `email` 和手机号码 `mobilePhoneNumber` 字段也要求在各自的列中不能有重复值出现，否则会出现 [203](error_code.html#_203)、[214](error_code.html#_214) 错误。

开发者也可以要求用户使用 Email 做为用户名注册，即在用户提交信息后将 `_User` 表中的 `username` 和 `email` 字段都设为相同的值，这样做的好处是用户在忘记密码的情况下可以直接使用「[邮箱重置密码](#重置密码)」功能，无需再额外绑定电子邮件。

#### 设置手机号码

如果一开始没有选择用手机号码注册，之后要求用户绑定并验证手机号，可以调用「延迟验证」的接口。首先更新用户的手机号：

```cs
var currentUser = AVUser.CurrentUser;
// 更新 mobilePhoneNumber 字段
currentUser["mobilePhoneNumber"] = "186xxxxxxxx";
await currentUser.SaveAsync();
```
如果在 {{app_permission_link}} 中勾选了 **用户注册或更新手机号时，向注册手机号码发送验证短信**，更新用户手机号成功后会自动发送一条验证短信到用户的手机中，此时可以调用以下接口验证手机号。

```cs
await AVUser.VerifyMobilePhoneAsync("6位数字验证码");
```

如果用户没有收到验证短信，可以调用以下接口重发短信：

```cs
await AVUser.RequestMobilePhoneVerifyAsync("186xxxxxxxx");
```

#### 验证邮箱

如果在 {{app_permission_link}} 中勾选了 **用户注册时，发送验证邮件**，那么当一个 `AVUser` 在注册时设置了邮箱，云端就会向该邮箱**自动发送**一封包含了激活链接的验证邮件，用户打开该邮件并点击激活链接后便视为通过了验证。

有些用户可能在注册之后并没有点击激活链接，而在未来某一个时间又有验证邮箱的需求，这时需要调用如下接口让云端重新发送验证邮件：

```cs
await AVUser.RequestEmailVerifyAsync("tom@leancloud.cn");
```

当用户通过更新用户属性的方式更新新邮箱并成功 save 后，云端会自动向新邮箱发一封验证邮件，此时开发者不需要再单独调用 `requestEmailVerify` 接口来发送验证邮件。

### 登录
我们提供了多种登录方式，以满足不同场景的应用。

#### 用户名和密码登录
```cs
var user = await AVUser.LogInAsync("tom", "password");
```

#### 邮箱和密码登录
```cs
var user = await AVUser.LogInByEmailAsync("tom@example.com", "password");
```

#### 手机号和密码登录

如果该用户的 `mobilePhoneNumber` 字段设置了手机号，可以使用「手机号 + 密码」的方式登录：

```cs
var user = await AVUser.LogInByMobilePhoneNumberAsync("186xxxxxxxx", "password");
```
以上的手机号码即使没有经过验证，只要密码正确也可以成功登录。如果希望阻止未验证的手机号码用于登录，则需要在 {{app_permission_link}} 中勾选 **未验证手机号码的用户，禁止登录**。这种方式也提高了用户账号的合法性与安全性。

#### 手机号和验证码登录

详见[手机号注册或登录](#手机号注册或登录)

#### 测试用的手机号和固定验证码

对于使用「手机号 + 验证码」登录的应用来说，在上架前提交至 Apple Store 进行审核的过程中，可能会面临 Apple 人员因没有有效的手机号码而无法登录来进行评估审核，或者开发者也无法提供固定手机号和验证码的尴尬情况。

另外，开发者在开发测试过程中也会面临在短时间内需要多次登录或注销的操作，由于验证码有时间间隔与总次数限制，这样就会带来种种不便。

为解决这些问题，我们允许为每个应用设置一个用于测试目的的手机号码，LeanCloud 平台会为它生成一个固定的验证码，每次使用这一对号码组合进行验证都会得到成功的结果。请进入 **应用控制台 > 消息 > 短信 > 设置 > 其他** 来设置测试手机号。

注意：测试手机号同样无法突破运营商的[短信限制](rest_sms_api.html#短信有什么限制吗？)，所以测试手机号的使用方式是：不发送短信，直接使用固定的手机号和验证码测试注册或登录。

#### 游客登录
有时你不希望强制用户在一开始就进行注册，例如先使用游客身份玩游戏，可以用以下接口匿名创建一个用户并登录：

```cs
var user = await AVUser.LogInAnonymouslyAsync();
```

但以这种方式登录的用户，一旦[登出](#登出)就无法再次以该用户身份登录，与该用户关联的数据也将无法访问，此时可以通过以下方式转化为普通用户。

- 设置用户名及密码
- [关联第三方平台](#第三方账户登录)

以设置用户名、密码后注册为例：

```cs
var currentUser = AVUser.CurrentUser;
currentUser.Username = "username";
currentUser.Password = "password";
await currentUser.SaveAsync();
```

判断一个用户是否是匿名用户：

```cs
var currentUser = AVUser.CurrentUser;
if (currentUser.IsAnonymous) {
    // disableLogOutButton();
}
```

#### 当前用户

常见的应用不会每次都要求用户都登录，这是因为它将用户数据缓存在了客户端。 同样，只要是调用了登录相关的接口，LeanCloud SDK 都会自动缓存登录用户的数据。 例如，判断当前用户是否为空，为空就跳转到登录页面让用户登录，如果不为空就跳转到首页：

```cs
var currentUser = AVUser.CurrentUser;
 if (currentUser) {
     // 跳转到首页
  } else {
     //currentUser 为空时，可打开用户登录界面
  }
```
#### SessionToken
所有登录接口调用成功之后，云端会返回一个 SessionToken 给客户端，客户端在发送 HTTP 请求的时候，Unity SDK 会在 HTTP 请求的 Header 里面自动添加上当前用户的 SessionToken 作为这次请求发起者 `AVUser` 的身份认证信息。

如果在 {{app_permission_link}} 中勾选了 **密码修改后，强制客户端重新登录**，那么当用户密码再次被修改后，已登录的用户对象就会失效，开发者需要使用更改后的密码重新调用登录接口，使 SessionToken 得到更新，否则后续操作会遇到 [403 (Forbidden)](error_code.html#_403) 的错误。

##### 验证 SessionToken 是否在有效期内
```cs
var currentUser = AVUser.CurrentUser;
var IsAuthenticatedAsync = await currentUser.IsAuthenticatedAsync();
```

##### 使用 SessionToken 登录

在没有用户名密码的情况下，客户端可以使用 SessionToken 来登录。常见的使用场景有：

* 应用内根据以前缓存的 SessionToken 登录
* 应用内的某个页面使用 WebView 方式来登录 LeanCloud
* 在服务端登录后，返回 SessionToken 给客户端，客户端根据返回的 SessionToken 登录。

登录后可以调用 `user.SessionToken` 方法得到当前登录用户的 sessionToken。

使用 sessionToken 登录：

```cs
var user = await AVUser.BecomeAsync("cwqrvy34wkvicp87ui4783dcq");
```

{{ docs.alert("请避免在外部浏览器使用 URL 来传递 SessionToken，以防范信息泄露风险。") }}

#### 账户锁定

输入错误的密码或验证码会导致用户登录失败。如果在 15 分钟内，同一个用户登录失败的次数大于 6 次，该用户账户即被云端暂时锁定，此时云端会返回错误码 `{"code":1,"error":"登录失败次数超过限制，请稍候再试，或者通过忘记密码重设密码。"}`，开发者可在客户端进行必要提示。

锁定将在最后一次错误登录的 15 分钟之后由云端自动解除，开发者无法通过 SDK 或 REST API 进行干预。在锁定期间，即使用户输入了正确的验证信息也不允许登录。这个限制在 SDK 和云引擎中都有效。


### 重置密码

#### 邮箱重置密码

如果用户忘记了密码，可以调用以下接口发送重置密码的邮件：
```cs
await AVUser.RequestPasswordResetAsync("myemail@example.com");
```

密码重置流程如下：

1. 用户输入注册的电子邮件，请求重置密码；
2. {{productName}} 向该邮箱发送一封包含重置密码的特殊链接的电子邮件；
3. 用户点击重置密码链接后，一个特殊的页面会打开，让他们输入新密码；
4. 用户的密码已被重置为新输入的密码。

{{link_to_blog_password_reset}}

#### 手机号码重置密码
用户需要先绑定手机号码才能使用这个功能。首先获取短信验证码：

```cs
await AVUser.RequestPasswordResetBySmsCode("186xxxxxxxx");
```
然后使用短信验证码来重置密码：

```cs
await AVUser.ResetPasswordBySmsCodeAsync("newPassword", "smsCode");
```

#### 登出

用户登出系统时，SDK 会自动清理当前用户的缓存。

```cs
AVUser.LogOut();
var user = AVUser.CurrentUser;
Debug.Log(user); //此时打印出来为 Null
```

### 用户的查询

为了安全起见，**新创建的应用的 `_User` 表默认关闭了 find 权限**，这样每位用户登录后只能查询到自己在 `_User` 表中的数据，无法查询其他用户的数据。如果需要让其查询其他用户的数据，建议单独创建一张表来保存这类数据，并开放这张表的 find 查询权限。

设置数据表权限的方法，请参考 [数据与安全 {{middot}} Class 级别的权限](data_security.html#Class_级别的_ACL)。我们推荐开发者在 [云引擎](leanengine_overview.html) 中封装用户查询，只查询特定条件的用户，避免开放 `_User` 表的全部查询权限。

查询用户代码如下：

```cs
var query = AVUser.Query.WhereEqualTo("gender", "female");
await query.FindAsync();
```

## 第三方账户登录

第三方登录是应用常见的功能。它直接使用第三方平台（如微信、QQ）已有的账户信息来完成新用户注册，这样不但简化了用户注册流程的操作，还提升了用户体验。

开发此功能的主要步骤有：

1. 配置平台账号
2. 开发者从第三方获取账户的授权信息 authData；
3. 把 authData 和 LeanCloud 的用户体系 AVUser 进行绑定。

### 常规开发流程介绍

#### 配置平台账号

在 [LeanCloud 应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns) 配置相应平台的 **应用 ID** 和 **应用 Secret Key** 。点击保存，自动生成 **回调 URL** 和 **登录 URL**。

以微博开放平台举例，它需要单独配置 **回调 URL**。 在微博开放平台的 **应用信息** > **高级信息** > **OAuth2.0 授权设置** 里的「授权回调页」中绑定生成的 **回调 URL**。测试阶段，在微博开放平台的 **应用信息** > **测试信息** 添加微博账号，在腾讯开放平台的 **QQ 登录** > **应用调试者** 里添加 QQ 账号即可。在应用通过审核后，可以获取公开的第三方登录能力。

配置平台账号的目的在于创建 AVUser 时，LeanCloud 云端会使用相关信息去校验 authData 的合法性，确保 AVUser 实际对应着一个合法真实的用户，确保平台安全性。如果想关闭自动校验 authData 的功能，需要在 [应用控制台 > 组件 > 社交](/dashboard/devcomponent.html?appid={{appid}}#/component/sns)中**取消勾选**「第三方登录时，验证用户 AccessToken 合法性」。

#### 获取 authData 并创建 AVUser

LeanCloud **暂不提供** 获取第三方 authData 的 SDK。开发者需要调用微信、QQ 等官方的 SDK，并根据其文档进行获取，也可以使用其他服务商提供的社交登录组件。

开发者在获取了第三方的完整 authData 后，就可以使用我们提供的 AVUser 类的 `LoginWithAuthDataAsync()` 或 `AssociateAuthDataAsync()` 两个接口，传入 authData，进行用户数据的绑定了。在操作成功之后，这部分第三方账户数据会存入 `_User` 表的 `authData` 字段里。

LeanCloud 后端要求 authData 至少含有 `openid 或 uid`、`access_token` 和 `expires_in` 三个字段。微信和 QQ 使用 `openid`，其他平台使用 `uid`。

如果是新用户，则生成一个新的 AVUser 并登录。示例代码如下：

```cs
var authData = new Dictionary<string, object> {
        { "access_token", "ACCESS_TOKEN" },
        { "expires_in", 7200 },
        { "openid", "OPENID" },
    };
var user = await AVUser.LogInWithAuthDataAsync(authData, "weixin");
```

成功后，在你的控制台的 _User 表里会生成一条新的 AVUser，它的数据格式如下：

```cs
{
  "ACL": {
    "*": {
      "read": true,
      "write": true
    }
  },
  "username": "y43mxrnj3kvrfkt8w5gezlep1",
  "emailVerified": false,
  "authData": {
    "weixin": {
      "openid": "oTY851aFzn4TdDgujsEl0f36Huxk",
      "expires_in": 7200,
      "access_token": "11_gaS_CfX47PH3n6g33zwONEyUsFRmiWJPIEcmWVzqS48JeZjpII6uRkTD6g36GY7_5pxKciSM-v8OGnYR26DC-VBffwMHaVx5_ik8FVQdE5Y"
    }
  },
  "mobilePhoneVerified": false,
  "objectId": "5b3def469f545400310c939d",
  "createdAt": "2018-07-05T10:13:26.310Z",
  "updatedAt": "2018-07-05T10:13:26.310Z"
}
```
如果是已有用户，则返回对应 authData 的 AVUser 实例并登录。

用户已经有了 AVUser 并登录成功后，可以用这个接口绑定新的第三方账号信息。绑定成功后，新的第三方账户信息会被添加到 AVUser 的 authData 字段里。示例代码如下：

```cs
var facebookAuthData = new Dictionary<string, object> {
    { "access_token", "FACEBOOK_ACCESS_TOKEN" },
    { "expires_in", 7200 },
    { "uid", "FACEBOOK_UID" },
};

await user.AssociateAuthDataAsync(facebookAuthData, "facebook");
```

`_User` 表的对应 AVUser 数据的 authData 字段会新增一个 facebook 的数据，如下：

```cs
{
  "ACL": {
    "*": {
      "read": true,
      "write": true
    }
  },
  "username": "y43mxrnj3kvrfkt8w5gezlep1",
  "emailVerified": false,
  "authData": {
    "weixin": {
      "access_token": "11_U4Nuh9PGpfuBJqtm7KniWn48rkJ7vBTCVN2beHcVvceswua2sLU_5Afq26ZJrRF0vpSX0xcDwI-zxeo3qcf-cMftjqEvWh7Vpp05bgxeWtc",
      "expires_in": 7200,
      "openid": "oTY851aFzn4TdDgujsEl0f36Huxk"
    },
    "facebook": {
      "uid": "facebookUid",
      "expires_in": 7200,
      "access_token": "facebookToken"
    }
  },
  "mobilePhoneVerified": false,
  "objectId": "5b3def469f545400310c939d",
  "createdAt": "2018-07-05T10:13:26.310Z",
  "updatedAt": "2018-07-06T07:46:58.097Z"
}
```

以上就是一个第三方登录开发的基本流程。

### 扩展需求

#### 接入 UnionId 体系
方平台的账户体系变得日渐复杂，它们的 authData 出现了一些较大的变化。下面我们以最典型的微信开放平台为例来进行说明。

当一个用户在移动应用内登录微信账号时，会被分配一个 OpenID；在微信小程序内登录账号时，又会被分配另一个不同的 OpenID。这样的架构会导致的问题是，使用同一个微信号的用户，也无法在微信开发平台下的移动应用和小程序之间互通。

微信官方为了解决这个问题，引入 UnionID 的体系，即：**同一微信号，对同一个微信开放平台账号下的不同应用，不管是移动 App、网站应用还是小程序，UnionID 都是相同的**。也就是说，UnionID 可以作为用户的唯一标识。

其他平台，如 QQ 的 UnionID 体系，和微信的设计保持一致。

LeanCloud 支持 UnionID 体系。你只需要给 `LogInWithAuthDataAndUnionIdAsync` 和 `AssociateAuthDataAndUnionIdAsync` 接口传入更多的参数，即可完成新 UnionID 体系的集成。

要使用到的关键参数列表：

参数名 | 类型 | 意义
---- | ----- | ----
`platform` | String | 平台，命名随意，如 `weixinapp`、`wxminiprogram`、`qqapp1` 等。
`unionIdPlatform` | String | UnionID 平台，目前仅支持 `weixin`、`weibo` 和 `qq` 。
`unionId` | String | 由 UnionID 平台提供。**需配合 `asMainAccount`、`unionIdPlatform` 一起使用**。
`asMainAccount` | boolean | true 代表将 UnionID 绑定入当前 authData 并作为主账号，之后以该 UnionID 来识别。**需配合 `unionId`、`unionIdPlatform` 一起使用**。

接入新 UnionID 系统时，每次传入的 authData 必须包含成对的平台 `uid 或 openid` 和平台 `unionid`。示例代码如下：

```cs
var authData = new Dictionary<string, object> {
    { "access_token", "ACCESS_TOKEN" },
    { "expires_in", 7200 },
    { "openid", "OPENID" },
};

AVUserAuthDataLogInOption options = new AVUserAuthDataLogInOption
{
    UnionIdPlatform = "weixin",
    AsMainAccount = true
};

var user = await AVUser.LogInWithAuthDataAndUnionIdAsync(authData, "weixinapp1", "ox7NLs06ZGfdxbLiI0e0F1po78qE", options);
```

然后让我们来看看生成的 authData 的数据格式：

```cs
"authData": {
    "weixinapp1": {
      "platform": "weixin",
      "openid": "oTY851axxxgujsEl0f36Huxk",
      "expires_in": 7200,
      "main_account": true,
      "access_token": "10_chx_dLz402ozf3TX1sTFcQQyfABgilOa-xxx-1HZAaC60LEo010_ab4pswQ",
      "unionid": "ox7NLs06ZGfdxxxxxe0F1po78qE"
    },
    "_weixin_unionid": {
      "uid": "ox7NLs06ZGfdxxxxxe0F1po78qE"
    }
  }
```

当你想加入该 UnionID 下的一个新平台，比如 miniprogram1 时，再次登录后生成的数据为：

```cs
"authData": {
    "weixinapp1": {
      "platform": "weixin",
      "openid": "oTY851axxxgujsEl0f36Huxk",
      "expires_in": 7200,
      "main_account": true,
      "access_token": "10_chx_dLz402ozf3TX1sTFcQQyfABgilOa-xxx-1HZAaC60LEo010_ab4pswQ",
      "unionid": "ox7NLs06ZGfdxxxxxe0F1po78qE"
    },
    "_weixin_unionid": {
      "uid": "ox7NLs06ZGfdxxxxxe0F1po78qE"
    },
    "miniprogram1": {
      "platform": "weixin",
      "openid": "ohxoK3ldpsGDGGSaniEEexxx",
      "expires_in": 7200,
      "main_account": true,
      "access_token": "10_QfDeXVp8fUKMBYC_d4PKujpuLo3sBV_pxxxxIZivS77JojQPLrZ7OgP9PC9ZvFCXxIa9G6BcBn45wSBebsv9Pih7Xdr4-hzr5hYpUoSA",
      "unionid": "ox7NLs06ZGfdxxxxxe0F1po78qE"
    }
  }

```

可以看到，最终该 authData 实际包含了来自 `weixin` 这个 `unionId` 体系内的两个不同平台，`weixinapp1` 代表来自移动应用，`miniprogram1` 来自小程序。`_weixin_unionid ` 这个字段的值就是用户在 `weixin` 这个 `unionId` 平台的唯一标识 UnionID 值。

当一个用户以来自 `weixinapp1` 的 OpenID `oTY851axxxgujsEl0f36Huxk` 和 UnionID `ox7NLs06ZGfdxxxxxe0F1po78qE` 一起传入生成新的 AVUser 后，接下来这个用户以来自 miniprogram 不同的 OpenID `ohxoK3ldpsGDGGSaniEEexxx` 和同样的 UnionID `ox7NLs06ZGfdxxxxxe0F1po78qE` 一起传入时，LeanCloud 判定是同样的 UnionID，就直接把来自 `miniprogram` 的新用户数据加入到已有 authData 里了，不会再创建新的用户。

这样一来，LeanCloud 后台通过识别平台性的用户唯一标识 UnionID，让来自同一个 UnionID 体系内的应用程序、小程序等不同平台的用户都绑定到了一个 AVUser 上，实现互通。

### 已有 authData 应用接入 UnionID

先梳理一遍业务，看看是否在过去开发过程集成了移动应用程序、小程序等多个平台的 authData，导致同一个用户的数据已经被分别保存为不同的 AVUser：

如果没有的话，直接按前面 [接入 UnionID 体系](#接入-UnionID-体系) 小节的代码集成即可。

如果有的话，需要确认自身的业务需要，确定要以哪个已有平台的账号为主。比如决定使用某个移动应用上生成的账号，则在该移动应用程序更新版本时，使用 `asMainAccount` 参数。这个移动应用带着 UnionID 登录匹配或创建的账号将作为主账号，之后所有这个 UnionID 的登录都会匹配到这个账号。

**请注意**，在第二种情况下 `_User` 表里会剩下一些用户数据，也就是没有被选为主账号的、其他平台的同一个用户的旧账号数据。这部分数据会继续服务于已经发布的但仍然使用 OpenID 登录的旧版应用。


## Unity SDK 注意事项

1. 基于 Unity 自身的 WWW 类发送 Http 请求的限制，单个请求的大小不能超过 2MB，所以在使用 Unity SDK 时，开发者需要注意存储数据，构建查询等操作时，需要做到简洁高效。
2. Unity 中请将 `Optimization` 中的 `Stripping Level` 设置为 `Disabled`。
3. Unity 自从升级到 5.0 之后就会出现一个 iOS 上访问 HTTPS 请求时的 SSL 证书访问错误：**NSURLErrorDomain error -1012**。解决方案是：在 Unity 构建完成 iOS 项目之后，使用 XCode 打开项目，找到 `Classes/Unity/WWWConnection.mm` 文件，找到这个方法：

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
