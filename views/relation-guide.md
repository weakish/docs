{% import "views/_helper.njk" as docs %}
# 数据模型设计指南

多年以来，关系型数据库已经成为了企业数据管理的基础，很多工程师对于关系模型和 6 个范式都比较了解，但是如今来构建和运行一个应用，随着数据来源的越发多样和用户量的不断增长，关系数据库的限制逐渐成为业务的瓶颈，因此越来越多的公司开始向其它 NoSQL 数据库进行迁移。

LeanCloud 的存储后台大量采用了 MongoDB 这种文档数据库来存储结构化数据，正因如此我们才能提供面向对象的、海量的、无需创建数据表结构即存即用的存储能力。从传统的关系型数据库转换到 LeanCloud 或者 MongoDB 存储系统，最基础的改变就是「数据建模 Schema 设计」。

首先来梳理一下关系型数据库、MongoDB 和 LeanCloud 的对应术语：

RDBMS    | MongoDB    | LeanCloud         
-------- | ---------- | ----------------- 
Database | Database   | Application       
Table    | Collection | Class             
Row      | Document   | Object            
Index    | Index      | Index             
JOIN     | Embedded，Reference  | Embedded Object, Pointer{#, Relation #}

在 LeanCloud 上进行数据建模设计需要数据架构师、开发人员和 DBA 在观念上做一些转变：之前是传统的关系型数据模型，所有数据都会被映射到二维的表结构「行」和「列」；现在是丰富、动态的对象模型，即 MongoDB 的「文档模型」，包括内嵌子对象和数组。

## 文档模型

{{ docs.note("后文中我们有时候采用 LeanCloud 的核心概念 **Object（对象）**，有时候提到 MongoDB 中的名词 **Document（文档）**，它们是等同的。") }}

我们现在使用的大部分数据都有比较复杂的结构，用「JSON 对象」来建模比用「表」会更加高效。通过内嵌子对象和数组，JSON 对象可以和应用层的数据结构完全对齐。这对开发者来说，会更容易将应用层的数据映射到数据库里的对象。相反，将应用层的数据映射到关系数据库的表，则会降低开发效率。而比较普遍的增加额外的对象关系映射（ORM）层的做法，也同时降低了 schema 扩展和查询优化的灵活性，引入了新的复杂度。

例如，在 RDBMS 中有父子关系的两张表，通常就会变成 LeanCloud 里面含有内嵌子对象的单文档结构。以下图的数据为例：

**PERSON 表**

Pers_ID | Surname | First_Name | City 
------- | ------- | ---------- | ---- 
0       |   柳      | 红           |  伦敦    
1       |   杨      | 真           | 北京     
2       |   王      | 新         |  苏黎世    

**CAR 表**

Car_ID | Model | Year | Value | Pers_ID 
------ | ----- | ---- | ----- | ------- 
101    |  大众迈腾     | 2015     | 180000      | 0        
102    |  丰田汉兰达     | 2016     | 240000      |      0   
103    |  福特翼虎     | 2014     | 220000      |      1  
104    |  现代索纳塔     | 2013     | 150000      |      2   
  

RDBMS 中通过 Pers_ID 域来连接 PERSON 表和 CAR 表，以此支持应用中显示每辆车的拥有者信息。使用文档模型，通过内嵌子对象和数组可以将相关数据提前合并到一个单一的数据结构中，传统的跨表的行和列现在都被存储到了一个文档内，完全省略掉了 join 操作。

换成 LeanCloud 来对同样的数据建模，则允许我们创建这样的 schema：一个单一的 Person 对象，里面通过一个子对象数组来保存该用户所拥有的每一部 Car，例如：

```json
{
  "first_name":"红",
  "surname":"柳",
  "city":"伦敦",
  "location":[
    45.123,
    47.232
  ],
  "cars":[
    {
      "model":"大众迈腾",
      "year":2015,
      "value":180000
    },
    {
      "model":"丰田汉兰达",
      "year":2016,
      "value":240000
    }
  ]
}
```

文档数据库里的一篇文档，就相当于 LeanCloud 平台里的一个对象。这个例子里的关系模型虽然只由两张表组成（现实中大部分应用可能需要几十、几百甚至上千张表），但是它并不影响我们思考数据的方式。

为了更好地展示关系模型和文档模型的区别，我们用一个博客平台来举例。从下图中可以看出，依赖 RDBMS 的应用需要 join 五张不同的表来获得一篇博客的完整数据，而在 LeanCloud 中所有的博客数据都包含在一个文档中，博客作者和评论者的用户信息则通过一个到 User 的引用（指针）进行关联。

![](images/rdbm-vs-mongodb.png)

## 文档模型的优点

除了数据表现更加自然之外，文档模型还有性能和扩展性方面的优势：

- 通过单一调用即可获得完整的文档，避免了多表 join 的开销。LeanCloud 的 Object 物理上作为一个单一的块进行存储，只需要一次内存或者磁盘的读操作即可。RDBMS 与此相反，一个 join 操作需要从不同地方多次读取操作才可完成。
- 文档是自包含的，将数据库内容分布到多个节点（也叫 Sharding）会更简单，同时也更容易通过普通硬件的水平扩展获得更高性能。DBA 们不再需要担心跨节点进行 join 操作可能带来的性能恶化问题。

## 定义文档 Schema

应用的数据访问模式决定了 schema 设计，因此我们需要特别明确以下几点：

- 数据库读写操作的比例以及是否需要重点优化某一方的性能；
- 对数据库进行查询和更新的操作类型；
- 数据生命周期和文档的增长率；

以此来设计更合适的 schema 结构。

对于普通的「属性名:值」来说，设计比较简单，和 RDBMS 中平坦的表结构差别不大。对于一对一或 一对多的关系会很自然地考虑使用内嵌对象：

- 数据「所有」和「包含」的关系，都可以通过内嵌对象来进行建模。
- 同时，在架构上也可以把那些经常需要同时、原子改动的属性作为一个对象嵌入到一个单独的属性中。

例如，为了记录每个学生的家庭住址，我们可以把住址信息作为一个整体嵌入 Student 类里面。

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];
    NSDictionary *addr = [NSDictionary dictionaryWithObjectsAndKeys:
                          @"北京", @"city",
                          @"西城区西长安街 1 号", @"address",
                          @"100017", @"postcode",
                          nil];
    [studentTom setObject:addr forKey:@"address"];
    [studentTom saveInBackground];// 保存到云端
```
```swift
    let studentTom = AVObject(className: "Student")

    studentTom["name"] = "Tom"
    studentTom["address"] = [
        "city" : "北京",
        "address" : "西城区西长安街 1 号",
        "postcode" : "100017"
    ]

    studentTom.save()
```
```java
    final AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.put("name", "Tom");
    HashMap<Object, Object> addr = new HashMap<>();
    addr.put("city", "北京");
    addr.put("address", "西城区西长安街 1 号");
    addr.put("postcode", "100017");
    studentTom.put("address", addr);
    studentTom.saveInBackground();
```
```js
    // 学生 Tom
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');
    var addr = { "city": "北京", "address": "西城区西长安街 1 号", "postcode":"100017" };
    studentTom.set('address', addr);
    studentTom.save();
```
```python
    import leancloud

    student_tom = leancloud.Object.extend("Student")()
    student_tom.set('name', 'Tom')

    addr = { "city": "北京", "address": "西城区西长安街 1 号", "":"100017" };
    student_tom.set('address', addr)

    # 保存在云端
    student_tom.save()
```
```cs
    var studentTom = new AVObject("Student");
    studentTom["name"] = "Tom";
    var addr = new Dictionary<string, object>();
    addr["city"] = "北京";
    addr["address"] = "西城区西长安街 1 号";
    addr["postcode"] = "100017";
    studentTom["address"] = addr;
    studentTom.SaveAsync();
```

但并不是所有的一对一关系都适合内嵌的方式，对下面的情况后文介绍的「引用」（等同于 MongoDB 的 reference）方式会更加合适：

- 一个对象被频繁地读取，但是内嵌的子对象却很少会被访问。
- 对象的一部分属性频繁地被更新，数据大小持续增长，但是剩下的一部分属性基本稳定不变。
- 对象大小超过了 LeanCloud 当前最大 16 MB 限制。

接下来我们重点讨论一下在 LeanCloud 上如何通过「引用」机制来实现复杂的关系模型。

数据对象之间存在 3 种类型的关系：「一对一」将一个对象与另一个对象关联，「一对多」是一个对象关联多个对象，「多对多」则用来实现大量对象之间的复杂关系。

我们支持 4 种方式来构建对象之间的关系，这些都是通过 MongoDB 的文档引用来实现的：

1. Pointers（适合一对一、一对多关系）{# 2. Relation（多对多，一对多) #}
3. 中间表（多对多）
4. ~~Arrays（一对多、多对多)~~ 不建议使用，请参考 [何时使用数组](#何时使用数组)。

## 一对多关系

### Pointers 存储

中国的「省份」与「城市」具有典型的一对多的关系。深圳和广州（城市）都属于广东省（省份），而朝阳区和海淀区（行政区）只能属于北京市（直辖市）。广东省对应着多个一级行政城市，北京对应着多个行政区。下面我们使用 Pointers 来存储这种一对多的关系。

> 为了表述方便，后文中提及城市都泛指一级行政市以及直辖市行政区，而省份也包含了北京、上海等直辖市。

```objc
    AVObject *GuangZhou = [[AVObject alloc] initWithClassName:@"City"];// 广州
    [GuangZhou setObject:@"广州" forKey:@"name"];

    AVObject *GuangDong = [[AVObject alloc] initWithClassName:@"Province"];// 广东
    [GuangDong setObject:@"广东" forKey:@"name"];

    [GuangZhou setObject:GuangDong forKey:@"dependent"];// 为广州设置 dependent 属性为广东

    [GuangZhou saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
          // 广州被保存成功  
        }
    }];
    // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
```swift
    let guangZhou = AVObject(className: "City")
    guangZhou["name"] = "广州"

    let guangDong = AVObject(className: "Province")
    guangDong["name"] = "广东"

    guangZhou["dependent"] = guangDong

    guangZhou.save()
```
```java
    AVObject guangZhou = new AVObject("City");// 广州
    guangZhou.put("name", "广州");

    AVObject guangDong = new AVObject("Province");// 广东
    guangDong.put("name", "广东");

    guangZhou.put("dependent", guangDong);// 为广州设置 dependent 属性为广东

    guangZhou.saveInBackground(new SaveCallback() {
        @Override
        public void done(AVException e) {
            if (e == null) {
                // 广州被保存成功
            }
        }
    });
    // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
```js
    // 新建一个 AV.Object
    var GuangZhou = new AV.Object('City');// 广州
    GuangZhou.set('name', '广州');
    var GuangDong = new AV.Object('Province');// 广东
    GuangDong.set('name', '广东');
    GuangZhou.set('dependent', GuangDong);// 为广州设置 dependent 属性为广东
    GuangZhou.save().then(function (guangZhou) {
        console.log(guangZhou.id);
    });
    // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
```python
    import leancloud

    guangZhou = leancloud.Object.extend('City')()
    guangZhou.set('name', '广州')

    guangDong = leancloud.Object.extend('Province')()
    guangDong.set('name', '广东')

    # 为广州设置 dependent 属性为广东
    guangZhou.set('dependent', guangDong)

    # 广东无需被单独保存，因为在保存广州的时候已经上传到服务端。
    guangZhou.save()
```
```cs
    var guangZhou = new AVObject("City");// 广州
    guangZhou["name"] = "广州";

    var guangDong = new AVObject("Province");// 广东
    guangDong["name"] = "广东";

    guangZhou["dependent"] = guangDong;// 为广州设置 dependent 属性为广东

    guangZhou.SaveAsync();// 广东无需被单独保存，因为在保存广州的时候已经上传到服务端。
```

注意：保存关联对象的同时，被关联的对象也会随之被保存到云端。

要关联一个已经存在于云端的对象，例如将「东莞市」添加至「广东省」，方法如下：

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];    
    AVObject *DongGuan = [[AVObject alloc] initWithClassName:@"City"];// 东莞
    [DongGuan setObject:@"东莞" forKey:@"name"];

    [DongGuan setObject:GuangDong forKey:@"dependent"];// 为东莞设置 dependent 属性为广东
```
```swift
    let guangDong = AVObject(className: "Province", objectId: "56545c5b00b09f857a603632")
    let dongGuan = AVObject(className: "City")

    dongGuan["name"] = "东莞"
    dongGuan["dependent"] = guangDong
```
```java
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject guangDong = AVObject.createWithoutData("Province", "56545c5b00b09f857a603632");
    AVObject dongGuan = new AVObject("City");// 东莞
    dongGuan.put("name", "东莞");

    dongGuan.put("dependent", guangDong);// 为东莞设置 dependent 属性为广东
```
```js
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    var GuangDong = AV.Object.createWithoutData('Province', '56545c5b00b09f857a603632');
    var DongGuan = new AV.Object('City');
    DongGuan.set('name', '东莞');
    DongGuan.set('dependent', GuangDong);
    DongGuan.save();
```
```python
    import leancloud

    # 用 create_without_data 关联一个已经存在的对象
    Province = leancloud.Object.extend('Province')
    guangDong = Province.create_without_data('574416af79bc44005c61bfa3')

    dongGuan = leancloud.Object.extend('City')()
    dongGuan.set('name', '东莞')
    # 为东莞设置 dependent 属性为广东
    dongGuan.set('dependent', guangDong)

    dongGuan.save()
```
```cs
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject guangDong = AVObject.CreateWithoutData("Province", "56545c5b00b09f857a603632");
    AVObject dongGuan = new AVObject("City");// 东莞
    dongGuan["name"] = "东莞";

    dongGuan["dependent"] = guangDong;// 为东莞设置 dependent 属性为广东
```

执行上述代码后，在应用控制台可以看到 `dependent` 字段显示为 Pointer 数据类型，而它本质上存储的是一个指向 `Province` 这张表的某个 AVObject 的指针。

### Pointers 查询

假如已知一个城市，想知道它的上一级的省份：

```objc
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个  objectId 可以在控制台查看
    AVObject *DongGuan = [AVObject objectWithoutDataWithClassName:@"City" objectId:@"568e743c00b09aa22162b11f"];
    NSArray *keys = [NSArray arrayWithObjects:@"dependent", nil];
    [DongGuan fetchInBackgroundWithKeys:keys block:^(AVObject *object, NSError *error) {
         // 获取广东省
         AVObject *province = [object objectForKey:@"dependent"];
    }];
```
```swift
    let dongGuan = AVObject(className: "City", objectId: "5b73993efe88c2005b8584e7")

    dongGuan.fetchInBackground(withKeys: ["dependent"]) { object, error in
        let province = object?["dependent"] as? AVObject
    }
```
```java
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个 objectId 可以在控制台查看
    AVObject dongGuan = AVObject.createWithoutData("City", "568e743c00b09aa22162b11f");
    dongGuan.fetchInBackground("dependent", new GetCallback<AVObject>() {
        @Override
        public void done(AVObject avObject, AVException e) {
            // 获取广东省
            AVObject province = avObject.getAVObject("dependent");
        }
    });
```
```js
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个  objectId 可以在控制台查看
    var DongGuan = AV.Object.createWithoutData('City', '568e743c00b09aa22162b11f');
    DongGuan.fetch({ include: ['dependent'] }).then(function (city) {
        var province = city.get('dependent');
        console.log(province.get('name'));
    });
```
```python
    import leancloud

    City = leancloud.Object.extend('City')
    guangZhou = City.create_without_data('5744189fdf0eea0063ad948b')
    guangZhou.fetch()
    province_id = guangZhou.get('dependent').id  # 获取广东省的 objectId

    province = leancloud.Object.extend('Province')()
    province.id = province_id
    province.fetch()  # 根据 objectId 获取 province
```
```cs
    AVObject guangDong = AVObject.CreateWithoutData("Province", "56545c5b00b09f857a603632");
    guangDong.FetchAsync(new string[] { "dependent" }).ContinueWith(t =>
    {
        var province = guangDong.Get<AVObject>("dependent");
        var name = province["name"];
    });
```

假如查询结果中包含了城市，并想通过一次查询同时把对应的省份也一并加载到本地：

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"City"];

    // 查询名字是广州的城市
    [query whereKey:@"name" equalTo:@"广州"];

    // 找出对应城市的省份
    [query includeKey:@"dependent"];

    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        // cities 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
        for (AVObject *city in cities) {
            // 并不需要网络访问
            // 获取对应的省份
            AVObject *province = [city objectForKey:@"dependent"];
        }
    }];
```
```swift
    let query = AVQuery(className: "City")

    query.whereKey("name", equalTo: "广州")
    query.includeKey("dependent")

    query.findObjectsInBackground { cities, error in
        let cities = cities as? [AVObject] ?? []

        for city in cities {
            let province = city["dependent"] as? AVObject
        }
    }
```
```java
    AVQuery<AVObject> query = new AVQuery<>("City");

    // 查询名字是广州的城市
    query.whereEqualTo("name", "广州");

    // 找出对应城市的省份
    query.include("dependent");

    query.findInBackground(new FindCallback<AVObject>() {
        @Override
        public void done(List<AVObject> list, AVException e) {
            // list 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
            for (AVObject city : list) {
                // 并不需要网络访问
                // 获取对应的省份
                AVObject province = city.getAVObject("dependent");
            }
        }
    });
```
```js
    var query = new AV.Query('City');
    query.equalTo('name', '广州');
    query.include(['dependent']);
    query.find().then(function (result) {
        if (result.length > 0) {
            var GuangZhou = result[0];
            var province = GuangZhou.get('dependent');
        }
    });
```
```python
    import leancloud

    query = leancloud.Query("City")
    query.equal_to('name', '广州')
    query.include('dependent')  # 关键代码，找出对应城市的省份

    for city in query.find():
        province = city.get('dependent')
        province_name = province.get('name')
        # 可以获取 province 的信息
```
```cs
    var query = new AVQuery<AVObject>("City");
    // 查询名字是广州的城市
    query = query.WhereEqualTo("name", "广州");
    // 告知云端还要一并获取对应城市的省份
    query = query.Include("dependent");
    query.FindAsync().ContinueWith(t =>
    {
        // list 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
        var list = t.Result.ToList();
        list.ForEach((city) =>
        {
            // 并不需要网络访问
            // 获取对应的省份
            var province = city.Get<AVObject>("dependent");
            // 获取省份的名字
            var name = province["name"];
        });
    });
```

假如已知一个省份，要找出它的所有下辖城市：

{% block code_query_city_by_province %}{% endblock %}

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];

    AVQuery *query = [AVQuery queryWithClassName:@"City"];

    [query whereKey:@"dependent" equalTo:GuangDong];

    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        for (AVObject *city in cities) {
             // cities 的结果为广东省下辖的所有城市
        }
    }];
```
```swift
    let query = AVQuery(className: "City")
    let guangDong = AVObject(className: "Province", objectId: "56545c5b00b09f857a603632")

    query.whereKey("dependent", equalTo: guangDong)
    query.findObjectsInBackground { cities, error in
        let cities = cities as? [AVObject] ?? []
    }
```
```java
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject guangDong = AVObject.createWithoutData("Province", "56545c5b00b09f857a603632");

    AVQuery<AVObject> query = new AVQuery<>("City");

    query.whereEqualTo("dependent", guangDong);

    query.findInBackground(new FindCallback<AVObject>() {
        @Override
        public void done(List<AVObject> list, AVException e) {
            for (AVObject city : list) {
                // list 的结果为广东省下辖的所有城市
            }
        }
    });
```
```js
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    var GuangDong = AV.Object.createWithoutData('Province', '56545c5b00b09f857a603632');
    var query = new AV.Query('City');
    query.equalTo('dependent', GuangDong);
    query.find().then(function (cities) {
        cities.forEach(function (city, i, a) {
            console.log(city.id);
        });
    });
```
```python
    import leancloud

    Province = leancloud.Object.extend('Province')
    guangDong = Province.create_without_data('574416af79bc44005c61bfa3')

    query = leancloud.Query("City")
    query.equal_to('dependent', guangDong)

    for city in query.find():
        city_name = city.get('name')
        # 结果为广东省下辖的所有城市
```
```cs
    var guangdong = AVObject.CreateWithoutData("Province", "56545c5b00b09f857a603632");
    var query = new AVQuery<AVObject>("City");
    query = query.WhereEqualTo("dependent", guangdong);
    query.FindAsync().ContinueWith(t => 
    {
        // list 为广东省下辖的所有城市
        var list = t.Result.ToList();
        list.ForEach((city) => 
        {
            var name = city.Get<string>("name");
        });
    });
```

大多数场景下，Pointers 是实现一对多关系的最好选择。
{#
### 使用 Relation 实现一对多关系

假设可以在省份的一个字段上保留一个指向城市的关系，然后我们在这个关系里面存储着城市对象的列表，这样实现查询也比较容易，因此 LeanCloud 也提供了一个这样的对象 `Relation` 来存储这样的关系。

如下代码演示使用 Relation 来保存城市和省份之间的关系：

```objc
    AVObject *hangzhou = [[AVObject alloc] initWithClassName:@"City"];
    [hangzhou setObject:@"杭州" forKey:@"name"];

    AVObject *ningbo = [[AVObject alloc] initWithClassName:@"City"];
    [ningbo setObject:@"宁波" forKey:@"name"];

    [AVObject saveAllInBackground:@[hangzhou,ningbo] block:^(BOOL succeeded, NSError * _Nullable error) {
        AVObject *zhejiang = [[AVObject alloc] initWithClassName:@"Province"];
        [zhejiang setObject:@"name" forKey:@"浙江"];

        AVRelation *relation = [zhejiang relationForKey:@"includedCities"];
        [relation addObject:hangzhou];
        [relation addObject:ningbo];
        
        [zhejiang saveInBackground];
    }];
```
```swift
    let hangzhou = AVObject(className: "City")
    hangzhou["name"] = "杭州"

    let ningbo = AVObject(className: "City")
    ningbo["name"] = "宁波"

    AVObject.saveAll(inBackground: [hangzhou, ningbo]) { succeeded, error in
        let zheJiang = AVObject(className: "Province")
        zheJiang["浙江"] = "name"

        let relation = zheJiang.relation(forKey: "includedCities")

        relation.add(hangzhou)
        relation.add(ningbo)

        zheJiang.save()
    }
```
```java
    final AVObject hangzhou = new AVObject("City");
    hangzhou.put("name","杭州");

    final AVObject ningbo = new AVObject("City");
    ningbo.put("name","宁波");

    AVObject.saveAllInBackground(Arrays.asList(hangzhou, ningbo), new SaveCallback() {
        @Override
        public void done(AVException e) {
        AVObject zhejiang = new AVObject("Province");
        zhejiang.put("name","浙江");

        AVRelation<AVObject> relation = zhejiang.getRelation("includedCities");// 创建一个关系
        relation.add(hangzhou);
        relation.add(ningbo);

        zhejiang.saveInBackground();
        }
    });
```
```js
    let hangzhou = new AV.Object('City');
    hangzhou.set('name', '杭州');

    let ningbo = new AV.Object('City');
    ningbo.set('name', '宁波')

    AV.Object.saveAll([hangzhou, ningbo]).then(cities => {
        let zhejiang = new AV.Object('Province');
        zhejiang.set('name', '浙江');
        let relation = zhejiang.relation('includedCities');
        relation.add(hangzhou);
        relation.add(ningbo);
        return zhejiang.save();
    });
```
```python
  // 待补充
```
```cs
    var hangzhou = new AVObject("City");
    hangzhou["name"] = "杭州";

    var ningbo = new AVObject("City");
    ningbo["name"] = "宁波";

    AVObject.SaveAllAsync(new AVObject[] { hangzhou, ningbo }).ContinueWith(t =>
    {
        var zhejiang = new AVObject("Province");
        var relation = zhejiang.GetRelation<AVObject>("includedCities");
        relation.Add(hangzhou);
        relation.Add(ningbo);
        return zhejiang.SaveAsync();
    });
```
而关系创建完毕之后，需要实现两者之间的互相查询，假设要查询一个省份管辖的所有城市，可以使用如下代码：

```objc
    AVObject *zhejiang = [AVObject objectWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];
    AVRelation *relation = [zhejiang relationForKey:@"includedCities"];
    AVQuery *query = [relation query];
    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        for (AVObject *city in cities) {
            // cities 的结果为广东省下辖的所有城市
        }
    }];
```
```swift
    let zheJiang = AVObject(className: "Province", objectId: "56545c5b00b09f857a603632")

    let relation = zheJiang.relation(forKey: "includedCities")
    let query = relation.query()

    query.findObjectsInBackground { cities, error in
        let cities = cities as? [AVObject] ?? []
    }
```
```java
    AVObject zhejiang = AVObject.createWithoutData("Province","56545c5b00b09f857a603632");
    AVRelation relation = zhejiang.getRelation("includedCities");
    AVQuery<AVObject> query = relation.getQuery();

    query.findInBackground(new FindCallback<AVObject>() {
      @Override
      public void done(List<AVObject> list, AVException e) {
        for (AVObject city : list) {
          // list 的结果为浙江省下辖的所有城市
        }
      }
    });
```
```js
    var zhejiang = AV.Object.createWithoutData('Province', '58762f39a22b9d0058ac0468');
    var relation = zhejiang.relation('includedCities');
    var query = relation.query();

    query.find().then(cities => {
        // cities 的结果为浙江省下辖的所有城市
    });
```
```python
    Province = leancloud.Object.extend('Province')
    zhejiang = Province.create_without_data('58762f39a22b9d0058ac0468')
    relation = zhejiang.relation('includedCities')
    cities = relation.query.find()  # cities 的结果为浙江省下辖的所有城市
```
```cs
    var zhejiang = AVObject.CreateWithoutData("Province", "58762f39a22b9d0058ac0468");
    var relation = zhejiang.GetRelation<AVObject>("includedCities");
    var query = relation.Query;

    query.FindAsync().ContinueWith(t => 
    {
        // cities 的结果为浙江省下辖的所有城市
        var cities = t.Result.ToList();
        foreach (var city in cities) 
        {
            // 遍历所有城市
        }
    });
```

假设已知一个城市，想通过城市查询它的上级省份可以通过如下代码实现:

```objc
    AVObject *wenzhou = [AVObject objectWithClassName:@"City" objectId:@"587d8156b123db4d5e7dddd2"];
    AVQuery *query = [AVQuery queryWithClassName:@"Province"];
    [query whereKey:@"includedCities" equalTo:wenzhou];
    
    [query findObjectsInBackgroundWithBlock:^(NSArray *provinceList, NSError *error) {
        // 理论上 provinceList 应该只有浙江这一条数据
        AVObject *zhejiang = provinceList[0];
    }];
```
```swift
    let wenZhou = AVObject(className: "City", objectId: "587d8156b123db4d5e7dddd2")
    let query = AVQuery(className: "Province")

    query.whereKey("includedCities", equalTo: wenZhou)

    query.findObjectsInBackground { provinceList, error in
        let zhejiang = provinceList?[0] as? AVObject
    }
```
```java
    AVObject wenzhou = AVObject.createWithoutData("City", "587d8156b123db4d5e7dddd2");
    AVQuery<AVObject> query = new AVQuery<AVObject>("Province");
    query.whereEqualTo("includedCities", wenzhou);

    query.findInBackground(new FindCallback<AVObject>() {
      @Override
      public void done(List<AVObject> list, AVException e) {
        // 理论上 list 应该只有浙江这一条数据
        AVObject zhejiang = list.get(0);
      }
    });
```
```js
    let wenzhou = AV.Object.createWithoutData('City', '587d8156b123db4d5e7dddd2');
    let query = new AV.Query('Province');
    query.equalTo('includedCities', wenzhou);
    query.find().then(cities => {
        // 理论上 cities 应该只有浙江这一条数据
        var zhejiang = cities[0];
    });
```
```python
    City = leancloud.Object.extend('City')
    wenzhou = City.create_without_data('587d8156b123db4d5e7dddd2')
    query = leancloud.Query('Province')
    query.equal_to('includedCities', wenzhou)
    query.first()  # 理论上 cities 应该只有浙江这一条数据
```
```cs
    var wenzhou = AVObject.CreateWithoutData("City", "587d8156b123db4d5e7dddd2");
    var query = new AVQuery<AVObject>("Province");
    query = query.WhereEqualTo("includedCities", wenzhou);

    query.FindAsync().ContinueWith(t => 
    {
        var provinceList = t.Result.ToList();
        // 理论上 provinceList 应该只有浙江这一条数据
        AVObject zhejiang = provinceList[0];
    });
```

### 选择 Pointer 或 Relation 的依据

在创建一对多关系时，选择用 Pointers、Relation 还是中间表来实现，需要考虑关系中包含的对象数量。

如果关系「多」方包含的对象数量大于 100 左右，那么就必须使用 Pointers。反之，如果对象数量低于 100 或更少，那么 Relation 可能会更方便，特别是在获取父对象的同时得到所有相关的对象，即一对多关系中的「多」。
#}
## 多对多关系

假设有选课应用，我们需要为 `Student` 对象和 `Course` 对象建模。一个学生可以选多门课程，一个课程也有多个学生，这是一个典型的多对多关系。我们必须使用 Arrays 或创建自己的中间表来实现这种关系。决策的关键在于**是否需要为这个关系附加一些属性**。

如果不需要附加属性，使用 Arrays 最为简单。通常情况下，使用 Arrays 可以使用更少的查询并获得更好的性能。

{{ docs.note("如果多对多关系中任何一方对象数量可能达到或超过 100，使用中间表是更好的选择。") }}

反之，若需要为关系附加一些属性，就创建一个独立的表（中间表）来存储两端的关系。记住，附加的属性是描述这个关系的，不是描述关系中的任何一方。所附加的属性可以是：

* 关系创建的时间
* 关系创建者
* 某人查看此关系的次数

### 使用中间表实现多对多关系（推荐）

有时我们需要知道更多关系的附加信息，比如在一个学生选课系统中，我们要了解学生打算选修的这门课的课时有多长，或者学生选修是通过手机选修还是通过网站操作的，此时我们可以使用传统的数据模型设计方法「中间表」。

为此，我们创建一个独立的表 `StudentCourseMap` 来保存 `Student` 和 `Course` 的关系：

字段|类型|说明
---|---|---
`course`|Pointer|Course 指针实例
`student`|Pointer|Student 指针实例
`duration`|Array|所选课程的开始和结束时间点，如 `["2016-02-19","2016-04-21"]`。
`platform`|String|操作时使用的设备，如 `iOS`。

如此，实现选修功能的代码如下：

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];

    AVObject *courseLinearAlgebra = [[AVObject alloc] initWithClassName:@"Course"];
    [courseLinearAlgebra setObject:@"线性代数" forKey:@"name"];

    AVObject *studentCourseMapTom= [[AVObject alloc] initWithClassName:@"StudentCourseMap"];// 选课表对象

    // 设置关联
    [studentCourseMapTom setObject:studentTom forKey:@"student"];
    [studentCourseMapTom setObject:courseLinearAlgebra forKey:@"course"];

    // 设置学习周期
    [studentCourseMapTom setObject: [NSArray arrayWithObjects:@"2016-02-19",@"2016-04-21",nil] forKey:@"duration"];
    // 获取操作平台
    [studentCourseMapTom setObject: @"iOS" forKey:@"platform"];

    // 保存选课表对象
    [studentCourseMapTom saveInBackground];
```
```swift
    let studentTom = AVObject(className: "Student")
    studentTom["name"] = "Tom"

    let courseLinearAlgebra = AVObject(className: "Course")
    courseLinearAlgebra["name"] = "线性代数"

    let studentCourseMapTom = AVObject(className: "StudentCourseMap")

    studentCourseMapTom["student"] = studentTom
    studentCourseMapTom["course"] = courseLinearAlgebra
    studentCourseMapTom["duration"] = ["2016-02-19", "2016-04-21"]
    studentCourseMapTom["platform"] = "iOS"

    studentCourseMapTom.save()
```
```java
    AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.put("name", "Tom");

    AVObject courseLinearAlgebra = new AVObject("Course");
    courseLinearAlgebra.put("name", "线性代数");

    AVObject studentCourseMapTom = new AVObject("StudentCourseMap");// 选课表对象

    // 设置关联
    studentCourseMapTom.put("student", studentTom);
    studentCourseMapTom.put("course", courseLinearAlgebra);

    // 设置学习周期
    studentCourseMapTom.put("duration", Arrays.asList("2016-02-19", "2016-04-21"));
    // 获取操作平台
    studentCourseMapTom.put("platform", "iOS");

    // 保存选课表对象
    studentCourseMapTom.saveInBackground();
```
```js    
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');// 学生 Tom
    
    var courseLinearAlgebra = new AV.Object('Course');
    courseLinearAlgebra.set('name', '线性代数');
    
    // 选课表对象
    var studentCourseMapTom = new AV.Object('StudentCourseMap');
    
    // 设置关联
    studentCourseMapTom.set('student', studentTom);
    studentCourseMapTom.set('course', courseLinearAlgebra);
    
    // 设置学习周期
    studentCourseMapTom.set('duration', [new Date(2015, 2, 19), new Date(2015, 4, 21)]);
    
    // 设置操作平台
    studentCourseMapTom.set('platform', 'web');
    
    // 保存选课表对象
    studentCourseMapTom.save();
```
```python
    import leancloud

    student_tom = leancloud.Object.extend('Student')()
    student_tom.set('name', 'Tom')

    course_linear_algebra = leancloud.Object.extend('Course')()
    course_linear_algebra.set('name', '线性代数')
    # 选课表对象
    student_course_map_tom = leancloud.Object.extend('Student_course_map')()

    # 设置关联
    student_course_map_tom.set('student', student_tom)
    student_course_map_tom.set('course', course_linear_algebra)

    # 设置学习周期
    student_course_map_tom.set('duration', ["2016-02-19", "2016-04-12"])

    # 获取操作平台
    student_course_map_tom.set('platform', 'ios')

    # 保存选课表对象
    student_course_map_tom.save()
```
```cs
    AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.Add("name", "Tom");

    AVObject courseLinearAlgebra = new AVObject("Course");
    courseLinearAlgebra.Add("name", "线性代数");

    AVObject studentCourseMapTom = new AVObject("StudentCourseMap");// 选课表对象

    // 设置关联
    studentCourseMapTom.Add("student", studentTom);
    studentCourseMapTom.Add("course", courseLinearAlgebra);

    // 设置学习周期
    studentCourseMapTom.Add("duration", new string[] { "2016-02-19", "2016-04-21" });
    // 获取操作平台
    studentCourseMapTom.Add("platform", "iOS");

    // 保存选课表对象
    studentCourseMapTom.SaveAsync();
```

查询选修了某一课程的所有学生：

```objc
    // 微积分课程
    AVObject *courseCalculus = [AVObject objectWithoutDataWithClassName:@"Course" objectId:@"562da3fdddb2084a8a576d49"];

    // 构建 StudentCourseMap 的查询
    AVQuery *query = [AVQuery queryWithClassName:@"StudentCourseMap"];

    // 查询所有选择了线性代数的学生
    [query whereKey:@"course" equalTo:courseCalculus];

    // 执行查询
    [query findObjectsInBackgroundWithBlock:^(NSArray *studentCourseMaps, NSError *error) {
        // studentCourseMaps 是所有 course 等于线性代数的选课对象
        // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
        for (AVObject *studentCourseMap in studentCourseMaps) {
            AVObject *student =[studentCourseMap objectForKey:@"student"];
            AVObject *course =[studentCourseMap objectForKey:@"course"];
            NSArray *duration = [studentCourseMap objectForKey:@"duration"];
            NSLog(@"platform: %@", [studentCourseMap objectForKey:@"platform"]);
        }
    }];
```
```swift
    let query = AVQuery(className: "StudentCourseMap")
    let courseCalculus = AVObject(className: "Course", objectId: "562da3fdddb2084a8a576d49")

    query.whereKey("course", equalTo: courseCalculus)
    query.findObjectsInBackground { studentCourseMaps, error in
        let studentCourseMaps = studentCourseMaps as? [AVObject] ?? []

        for studentCourseMap in studentCourseMaps {
            let student = studentCourseMap["student"] as? AVObject
            let course = studentCourseMap["course"] as? AVObject
            let duration = studentCourseMap["duration"] as? [Any]

            if let platform = studentCourseMap["platform"] {
                print("platform: \(platform)")
            }
        }
    }
```
```java
    // 微积分课程
    AVObject courseCalculus = AVObject.createWithoutData("Course", "562da3fdddb2084a8a576d49");

    // 构建 StudentCourseMap 的查询
    AVQuery<AVObject> query = new AVQuery<>("StudentCourseMap");

    // 查询所有选择了线性代数的学生
    query.whereEqualTo("course", courseCalculus);

    // 执行查询
    query.findInBackground(new FindCallback<AVObject>() {
        @Override
        public void done(List<AVObject> list, AVException e) {
            // list 是所有 course 等于线性代数的选课对象
            // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
            for (AVObject studentCourseMap : list) {
                AVObject student = studentCourseMap.getAVObject("student");
                AVObject course = studentCourseMap.getAVObject("course");
                ArrayList duration = (ArrayList) studentCourseMap.getList("duration");
                String platform = studentCourseMap.getString("platform");
            }
        }
    });
```
```js
    // 微积分课程
    var courseLinearAlgebra = AV.Object.createWithoutData('Course', '562da3fdddb2084a8a576d49');
    
    // 构建 StudentCourseMap 的查询
    var query = new AV.Query('StudentCourseMap');
    
    // 查询所有选择了线性代数的学生
    query.equalTo('course', courseLinearAlgebra);
    
    // 执行查询
    query.find().then(function (studentCourseMaps) {
        // studentCourseMaps 是所有 course 等于线性代数的选课对象
        // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
        studentCourseMaps.forEach(function (scm, i, a) {
            var student = scm.get('student');
            var duration = scm.get('duration');
            var platform = scm.get('platform');
        });
    });
```
```python
    import leancloud

    Course = leancloud.Object.extend('Course')
    course_calculus = Course.create_without_data('57448184c26a38006b8d4761')
    query = leancloud.Query('Student_course_map')
    query.equal_to('course', course_calculus)

    # 查询所有选择了线性代数的学生
    student_course_map_list = query.find()

    # list 是所有 course 等于线性代数的选课对象,
    # 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
    for student_course_map in student_course_map_list:
        student = student_course_map.get('student')
        course  = student_course_map.get('course')
        duration = student_course_map.get('duration')
        platform = student_course_map.get('platform')
```
```cs
    // 微积分课程
    AVObject courseCalculus = AVObject.CreateWithoutData("Course", "562da3fdddb2084a8a576d49");

    // 构建 StudentCourseMap 的查询
    AVQuery<AVObject> query = new AVQuery<AVObject>("StudentCourseMap");

    // 查询所有选择了线性代数的学生
    query.WhereEqualTo("course", courseCalculus);

    // 执行查询
    query.FindAsync().ContinueWith(t =>
    {
        var list = t.Result.ToList();
        // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
        foreach (var studentCourseMap in list)
        {
            AVObject student = studentCourseMap.Get<AVObject>("student");
            AVObject course = studentCourseMap.Get<AVObject>("course");
            List<string> duration = studentCourseMap.Get<List<string>>("duration");
            string platform = studentCourseMap.Get<string>("platform");
        }
    });
```
同样我们也可以很简单地查询某一个学生选修的所有课程，只需将上述代码变换查询条件即可：

{% block code_query_relationTable_courses_by_student %}{% endblock %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"StudentCourseMap"];
    AVObject *studentTom = [AVObject objectWithoutDataWithClassName:@"Student" objectId:@"562da3fc00b0bf37b117c250"];
    [query whereKey:@"student" equalTo:studentTom];
```
```swift
    let query = AVQuery(className: "StudentCourseMap")
    let studentTom = AVObject(className: "Student", objectId: "562da3fc00b0bf37b117c250")

    query.whereKey("student", equalTo: studentTom)
```
```java
    AVQuery<AVObject> query = new AVQuery<>("StudentCourseMap");
    AVObject studentTom = AVObject.createWithoutData("Student", "562da3fc00b0bf37b117c250");
    query.whereEqualTo("student", studentTom);
```
```js
    var studentTom = AV.Object.createWithoutData('Student', '579f0441128fe10054420d49');
    var query = new AV.Query('StudentCourseMap');
    query.equalTo('student', studentTom);
```
```python
    Student = leancloud.Object.extend('Student')
    student_tom = Student.create_without_data("562da3fc00b0bf37b117c250")
    query.whereEqualTo("student", student_tom)
```
```cs
    AVQuery<AVObject> query = new AVQuery<AVObject>("StudentCourseMap");
    AVObject studentTom = AVObject.CreateWithoutData("Student", "562da3fc00b0bf37b117c250");
    query.WhereEqualTo("student", studentTom);
```

{#
### 使用 Relation 实现多对多关系
用 Relation 实现多对多可以省略建立中间表，但是也丧失了为关系建立附加属性的功能，但是对于有一部分的需求是可以满足的，例如学生选课系统，可能有些时候仅仅是需要记录一下哪些学生选了这门课以及这门课被哪些学生选了，因此用 Relation 也是满足需求的。

如下代码演示在学生对象中设置一个 Relation 类型的属性 `coursesChosen` 用来保存所选课程：

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];
    
    AVObject *courseLinearAlgebra = [[AVObject alloc] initWithClassName:@"Course"];
    [courseLinearAlgebra setObject:@"线性代数" forKey:@"name"];
    
    AVObject *courseObjectOrientedProgramming = [[AVObject alloc] initWithClassName:@"Course"];
    [courseObjectOrientedProgramming setObject:@"面向对象程序设计" forKey:@"name"];
    
    AVObject *courseOperatingSystem = [[AVObject alloc] initWithClassName:@"Course"];
    [courseOperatingSystem setObject:@"操作系统" forKey:@"name"];
    
    [AVObject saveAllInBackground:@[courseLinearAlgebra,courseObjectOrientedProgramming,courseOperatingSystem] block:^(BOOL succeeded, NSError *error) {
        if (error) {
            // 出现错误
        } else {
            // 保存成功
            AVRelation *relation = [studentTom relationforKey:@"coursesChosen"];// 新建一个 AVRelation，用来保存所选的课程
            [relation addObject:courseLinearAlgebra];
            [relation addObject:courseObjectOrientedProgramming];
            [relation addObject:courseOperatingSystem];
            
            [studentTom saveInBackground];
        }
    }];
```
```swift
    let studentTom = AVObject(className: "Student")
    studentTom["name"] = "Tom"

    let courseLinearAlgebra = AVObject(className: "Course")
    courseLinearAlgebra["name"] = "线性代数"

    let courseObjectOrientedProgramming = AVObject(className: "Course")
    courseObjectOrientedProgramming["name"] = "面向对象程序设计"

    let courseOperatingSystem = AVObject(className: "Course")
    courseOperatingSystem["name"] = "操作系统"

    let objects = [courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem]

    AVObject.saveAll(inBackground: objects) { succeeded, error in
        if succeeded {
            let relation = studentTom.relation(forKey: "coursesChosen")

            relation.add(courseLinearAlgebra)
            relation.add(courseObjectOrientedProgramming)
            relation.add(courseOperatingSystem)
        } else {
            /* Show error */
        }
    }
```
```java
    final AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.put("name", "Tom");

    final AVObject courseLinearAlgebra = new AVObject("Course");
    courseLinearAlgebra.put("name", "线性代数");

    final AVObject courseObjectOrientedProgramming = new AVObject("Course");
    courseObjectOrientedProgramming.put("name", "面向对象程序设计");

    final AVObject courseOperatingSystem = new AVObject("Course");
    courseOperatingSystem.put("name", "操作系统");

    AVObject.saveAllInBackground(Arrays.asList(courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem), new SaveCallback() {
        @Override
        public void done(AVException e) {
            AVRelation<AVObject> relation = studentTom.getRelation("coursesChosen");// 新建一个 AVRelation，用来保存所选的课程
            relation.add(courseLinearAlgebra);
            relation.add(courseObjectOrientedProgramming);
            relation.add(courseOperatingSystem);

            studentTom.saveInBackground();
        }
    });
```
```js
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');// 学生 Tom
    
    var courseLinearAlgebra = new AV.Object('Course');
    courseLinearAlgebra.set('name', '线性代数');
    
    var courseObjectOrientedProgramming = new AV.Object('Course');
    courseObjectOrientedProgramming.set('name', '面向对象程序设计');;
    
    var courseOperatingSystem = new AV.Object('Course');
    courseOperatingSystem.set('name', '操作系统');
    
    AV.Object.saveAll([courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem]).then(function (result) {
        if (result) {
            // 三门课程保存成功之后建立与 Tom 之间的 AVRelation
            var relation = studentTom.relation('coursesChosen');
            relation.add(courseLinearAlgebra);
            relation.add(courseObjectOrientedProgramming);
            relation.add(courseOperatingSystem);
            studentTom.save().then(function (saveResult) {
                if (saveResult) {
                   // 保存 Tom 到云端
                }
            });
        }
    });
```
```python
    import leancloud

    student_tom = leancloud.Object.extend("Student")()
    student_tom.set('name', 'Tom')

    course_linear_algebra = leancloud.Object.extend('Cource')()
    course_linear_algebra.set('name', '线性代数')

    course_object_oriented_programming = leancloud.Object.extend('Cource')()
    course_object_oriented_programming.set('name', '面向对象程序设计')

    course_operating_system = leancloud.Object.extend('Cource')()
    course_operating_system.set('name', '操作系统')
    # 批量存储所有课程
    leancloud.Object.save_all(
        [course_linear_algebra, course_object_oriented_programming, course_operating_system])

    relation = student_tom.relation('course_chosen')
    relation.add(course_linear_algebra)
    relation.add(course_object_oriented_programming)
    relation.add(course_operating_system)

    student_tom.save()
```
```cs
    AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.Add("name", "Tom");

    AVObject courseLinearAlgebra = new AVObject("Course");
    courseLinearAlgebra.Add("name", "线性代数");

    AVObject courseObjectOrientedProgramming = new AVObject("Course");
    courseObjectOrientedProgramming.Add("name", "面向对象程序设计");

    AVObject courseOperatingSystem = new AVObject("Course");
    courseOperatingSystem.Add("name", "操作系统");

    AVObject.SaveAllAsync(new AVObject[] { courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem }).ContinueWith(t => 
    {
        AVRelation<AVObject> relation = studentTom.GetRelation<AVObject>("coursesChosen");// 新建一个 AVRelation，用来保存所选的课程
        relation.Add(courseLinearAlgebra);
        relation.Add(courseObjectOrientedProgramming);
        relation.Add(courseOperatingSystem);

        studentTom.SaveAsync();	
    });
```

#### Relation 的单向特性
Relation 既可以实现一对多也可以实现多对多，但是区别在于：

- 当关系是多对多的时候，例如学生选课关系中，可以在学生这里存一个 Relation 保存学生选了哪些课，也可以在课程那里存一个 Relation 保存那些学生选了这门课。
- 当关系是一对多的时候，例如城市和省份的关系中，则不能在城市对象上存一个 Relation 来指向它所在的省份，因为这违反了 Relation 的设计初衷。
#}
## 一对一关系

当你需要将一个对象拆分成两个对象时，一对一关系是一种重要的需求。这种需求应该很少见，但是在下面的实例中体现了这样的需求：

* **限制部分用户数据的权限**<br/>
  在这个场景中，你可以将此对象拆分成两部分，一部分包含所有用户可见的数据，另一部分包含所有仅自己可见的数据（通过 [ACL 控制](data_security.html#Class_级别的_ACL) ）。同样你也可以实现一部分包含所有用户可修改的数据，另一部分包含所有仅自己可修改的数据。
* **避免大对象**<br/>
  原始对象大小超过了对象的 128 KB 的上限值，此时你可以创建另一个对象来存储额外的数据。当然通常的作法是更好地设计和优化数据模型来避免出现大对象，但如果确实无法避免，则可以考虑使用 AVFile 存储大数据。
* **更灵活的文件对象**<br/>
  AVFile 可以方便地存取文件，但对对象进行查询和修改等操作就不是很方便了。此时可以使用 AVObject 构造一个自己的文件对象并与 AVFile 建立一对一关联，将文件属性存于 AVObject 中，这样既可以方便查询修改文件属性，也可以方便存取文件。
  
## 关联数据的删除
当表中有一个 Pointer 指向的源数据被删除时，这个源数据对应的 Pointer **不会**被自动删除。所以建议用户在删除源数据时自行检查是否有 Pointer 指向这条数据，基于业务场景有必要做数据清理的话，可以调用对应的对象上的删除接口将 Pointer 关联的对象删除。

## 索引

在任何一个数据库系统中，索引都是优化性能的重要手段，同时它与 Schema 设计也是密不可分的。LeanCloud 也支持索引，其索引与关系数据库中基本相同。在索引的选择上，应用查询操作的模式和频率起决定性作用。

同时也要注意，索引不是没有代价的。在加速查询的同时，它也会降低写入速度、消耗更多存储（磁盘和内存）资源。是否建索引，如何建索引，建多少索引，我们需要综合权衡后来下决定。

### 索引类型

LeanCloud 的索引可以包含任意的属性（包括数组），下面是一些索引选项：

- **复合索引**<br/>在多个属性域上构建一个单独的索引结构。例如，以一个存储客户数据的应用为例，我们可能需要根据姓、名和居住地来查询客户信息。通过在「姓、名、居住地」上建立复合索引，LeanCloud 可以快速给出满足这三个条件的结果。此外，这一复合索引也能加速任何前置属性的查询。例如根据「姓」或者根据「姓＋名」的查询都会使用到这个复合索引。{{ docs.alert("注意，如果单按照「名」来查询，此复合索引会失效。") }}
- **唯一索引**<br/>通过给索引加上唯一性约束，LeanCloud 就会拒绝含有相同索引值的对象插入和更新。所有的索引默认都不是唯一索引，如果把复合索引指定为唯一索引，那么应用层必须保证索引列的组合值是唯一的。
- **数组索引**<br/>对数组属性也能创建索引。
- **地理空间索引**<br/>LeanCloud 会自动为 GeoPoint 类型的属性建立地理空间索引，但是要求一个 Object 内 GeoPoint 的属性不能超过一个。
- **稀疏索引**<br/>这种索引只包含那些含有指定属性的文档，如果文档不含有目标属性，那么就不会进入索引。稀疏索引体积更小，查询性能更高。LeanCloud 默认都会创建稀疏索引。

LeanCloud 的索引可以在任何域上建立，包括内嵌对象和数组类型，这使它带来了比 RDBMS 更强大的功能。

### 通过索引优化性能
LeanCloud 后台会根据每天的访问日志，自动归纳和学习频繁使用的访问模式，并自动创建合适的索引。不过如果你对索引优化比较有经验，也可以在控制台为每一个 Class 手动创建索引。

## 持续优化 Schema
在 LeanCloud 的存储系统里，Class 可以在没有完整的结构定义（包含哪些属性、数据类型如何等）时就提前创建好，一个 Class 下的对象（Object）也无需包含所有属性域，我们可以随时往对象中增减新的属性。

这种灵活、动态的 Schema 机制，使 Schema 的持续优化变得非常简单。相比之下，关系数据库的开发人员和 DBA 在开始一个新项目的时候，写下第一行代码之前，就需要制定好数据库 Schema，这至少需要几天，有的需要数周甚至更长。而 LeanCloud 则允许开发者通过不断迭代和敏捷过程，持续优化 Schema。开发者可以开始写代码并将他们创建的对象持久化存储起来，以后当需要增加新的功能，LeanCloud 可以继续存储新的对象而不需要对原来的 Class 做 ALTER TABLE 操作，这会给我们的开发带来很大的便利。


## 最佳的建模方式

选择最适合的建模方式，首先要确定关系是否：

> 存在附加属性？

例如学生选课，学生在选课的时候有的从电脑浏览器里选，有的从手机上选，手机系统还区分 iOS、Android 等等。那么假设要统计一下学生选课的来源，那么建立选课关系的时候就需要记录一下附加属性，这时只有中间表可以满足这个需求。

其次判断：

> 是一对多还是多对多？

* 一对多：Pointer {#| Relation #}
* 多对多：{#Relation |#} 中间表

{# 再判定关系建立之后：

> 基于关系的查询较多还是基于关系的修改较多？

假设一对多的关系并且是查询多于修改，那么用 Relation 就比较可行。{# 如果修改较多那就推荐使用 Pointer。

为什么？

假设用 Relation 存储了城市和省份之间的一对多的关系，假设有一天，廊坊被划分到北京管辖，那么需要做如下两个步骤：第一从河北的 Relation 里面删除廊坊，第二将廊坊加入到北京的 Relation 里面去。

而 Pointer 只需要一步，因为用 Pointer 存储的时候，是在廊坊的 province 字段上存储了一个指向上级的一个指针，这个时候只要将这个 Pointer 重新指向北京就可以了。假设系统中这种关系变化操作很频繁，那么最好就使用 Pointer。

多对多不需要这么复杂，要么 Relation 要么中间表。#}

决定了用哪种方式之后，就按照前文介绍的一对多或多对多的实例代码构建自己的业务逻辑代码。但是{# 所有 #} Pointer {#以及 Relation 的#}可以实现的，中间表也可以实现，并且开发者可控的余地更多。具体可以参照如下伪代码：

```
if(存在附加属性){
    return 中间表;
} else {
    switch(mode){
        case 一对多:{
            return Pointer;
        }
        case 多对多:{
            return 中间表;
        }
    }
}
```

### 案例分析

#### 婴儿与监护人之间的关系
做一个应用统计婴儿吃饭、睡觉、玩耍的时间分布，而婴儿的监护人可能会有多个，爷爷奶奶外公外婆还有可能是月嫂。首先按照我们之前设定的思路来逐步分析应该采用哪种方式建模：

> 是否存在附加属性？

一个婴儿和一个监护人之间的关系是否有附加属性？答案是有附加属性，父子关系跟母子关系是不一样的关系，因为对于婴儿监护人的身份称呼就是这个关系的附加属性。因此不用多想，果断使用中间表。不用再纠结是一对多还是多对多。

![relation-guide-1](images/relation-guide-1.png)

#### 用户与设备之间的关系
婴儿的状态改变，可以通过推送服务做到实时推送给监护人，比如孩子的爸爸设备较多，他会在 iPad、iPhone 以及 Windows 上安装这个应用，那么他一般情况下会有 3 台设备。监护人在每一台设备上登录后，每当孩子的状态发生改变，服务端都会向这 3 台设备推送，那么我们接着按照之前的思路来分析应该采用哪种方式建模。

> 是否存在附加属性？

一般来说这种情况是可以省略附加属性的，因为 LeanCloud 的 `_Installation` 表里有一个字段是专门用来存储客户端设备的 deviceType，因此设备的信息是不需要存储在中间表的。
而除非有其他特殊的属性条件，设备和用户之间的关系就是一个简单的一对多的关系，并且并不需要附加属性。

其次判断：

> 是一对多还是多对多？

一个用户在多个设备上登录一般就可以定义为一对多，而很少会出现类似 iPhone/iPad 版 QQ 那样内置了多账户管理系统，因此定义为一对多比较满足我们现在的需求。

{#紧接着是判断：

> 基于关系的查询较多还是基于关系的修改较多？

这个答案也是肯定的。一个人不太可能会一天之内变化几十次登录的设备，一旦他登录了一台设备几乎都是很稳定的，而且也不会经常出现一个设备被多个人登录，因此它的关系是相对稳定不易改变的。

这样我们可以使用 Relation 来存储 `_User` 和 `_Installation` 之间的关系。

![relation-guide-2](images/relation-guide-2.png)#}

### 何时使用数组

当要关联的数据是简单数据并且查询多于修改的时候，用数组比较合适。比如社交类应用里给朋友加标签，就可以使用 string 数组来存储这个属性{#，一般情况下 Relation 比数组好用#}。

```objc
    AVObject *beckham= [[AVObject alloc] initWithClassName:@"Boy"];
    [beckham setObject: [NSArray arrayWithObjects:@"颜值爆表",@"明星范儿",nil] forKey:@"tags"];
```
```swift
    let beckham = AVObject(className: "Boy")
    beckham["tags"] = ["颜值爆表", "明星范儿"]
```
```java
    AVObject beckham = new AVObject("Boy");
    beckham.put("tags",Arrays.asList("颜值爆表", "明星范儿"));
```
```js
    var beckham = new AV.Object('Boy');
    beckham.set('tags',['颜值爆表','明星范儿']);
```
```python
    beckham = leancloud.Object.create('Boy')
    beckham.set('tags', ['颜值爆表', '明星范儿']) 
```
```cs
    AVObject beckham = new AVObject("Boy");
    beckham.Add("tags", new string[] { "颜值爆表", "明星范儿" });
```
