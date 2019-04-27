{% import "views/_helper.njk" as docs %}
{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_name ="JavaScript" %}
{% set segment_code ="js" %}
{% set sdk_name ="JavaScript SDK" %}
{% set baseObjectName ="AV.Object" %}
{% set objectIdName ="id" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="AV.Relation" %}
{% set pointerObjectName ="AV.Pointer" %}
{% set baseQueryClassName ="AV.Query" %}
{% set geoPointObjectName ="AV.GeoPoint" %}
{% set userObjectName ="AV.User" %}
{% set fileObjectName ="AV.File" %}
{% set dateType= "Date" %}
{% set byteType= "Buffer" %}
{% set acl_guide_url = "[JavaScript 权限管理使用指南](acl_guide-js.html)" %}
{% set sms_guide_url = "[JavaScript 短信服务使用指南](sms-guide.html#注册验证)" %}
{% set inapp_search_guide_url = "[JavaScript 应用内搜索指南](app_search_guide.html)" %}
{% set status_system_guide_url = "[JavaScript 应用内社交模块](status_system.html#JavaScript_SDK)" %}
{% set feedback_guide_url = "（JavaScript SDK 文档待补充）" %}
{% set funtionName_whereKeyHasPrefix = "startsWith" %}
{% set saveOptions_query= "query" %}
{% set saveOptions_fetchWhenSave= "fetchWhenSave" %}

{% block text_web_security %}
## Web 安全

如果在前端使用 JavaScript SDK，当你打算正式发布的时候，请务必配置 **Web 安全域名**。配置方式为：进入 [控制台 / 设置 / 安全中心 / **Web 安全域名**](/dashboard/app.html?appid={{appid}}#/security)。这样就可以防止其他人，通过外网其他地址盗用你的服务器资源。

具体安全相关内容可以仔细阅读文档 [数据和安全](data_security.html) 。
{% endblock %}

{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_quick_save_a_todo %}

```js
  // 声明一个 Todo 类型
  var Todo = AV.Object.extend('Todo');
  // 新建一个 Todo 对象
  var todo = new Todo();
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑.
    console.log('New object created with objectId: ' + todo.id);
  }, function (error) {
    // 异常处理
    console.error('Failed to create new object, with error message: ' + error.message);
  });
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```js
  var Todo = AV.Object.extend('Todo');
  var todo = new Todo();
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  // 只要添加这一行代码，服务端就会自动添加这个字段
  todo.set('location','会议室');
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑.
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}

{% block code_create_todo_object %}

```js
  // AV.Object.extend('className') 所需的参数 className 则表示对应的表名
  // 声明一个类型
  var Todo = AV.Object.extend('Todo');
```

**注意**：如果你的应用时不时出现 `Maximum call stack size exceeded` 异常，可能是因为在循环或回调中调用了 `AV.Object.extend`。有两种方法可以避免这种异常：

- 升级 SDK 到 v1.4.0 或以上版本
- 在循环或回调外声明 Class，确保不会对一个 Class 执行多次 `AV.Object.extend`

从 v1.4.0 开始，SDK 支持使用 ES6 中的 extends 语法来声明一个继承自 `AV.Object` 的类，上述的 Todo 声明也可以写作：

```js
class Todo extends AV.Object {}
// 需要向 SDK 注册这个 Class
AV.Object.register(Todo);
```
{% endblock %}

{% block code_save_object_by_cql %}

```js
  // 执行 CQL 语句实现新增一个 TodoFolder 对象
  AV.Query.doCloudQuery('insert into TodoFolder(name, priority) values("工作", 1)').then(function (data) {
    // data 中的 results 是本次查询返回的结果，AV.Object 实例列表
    var results = data.results;
  }, function (error) {
    //查询失败，查看 error
    console.error(error);
  });
```
{% endblock %}

{% block code_data_type %}

```js
  // 该语句应该只声明一次
  var TestObject = AV.Object.extend('DataTypeTest');

  var number = 2014;
  var string = 'famous film name is ' + number;
  var date = new Date();
  var array = [string, number];
  var object = { number: number, string: string };

  var testObject = new TestObject();
  testObject.set('testNumber', number);
  testObject.set('testString', string);
  testObject.set('testDate', date);
  testObject.set('testArray', array);
  testObject.set('testObject', object);
  testObject.set('testNull', null);
  testObject.save().then(function(testObject) {
    // 成功
  }, function(error) {
    // 失败
  });
```

我们**不推荐**在 `AV.Object` 中储存大块的二进制数据，比如图片或整个文件。**每个 `AV.Object` 的大小都不应超过 128 KB**。如果需要储存更多的数据，建议使用 [`AV.File`](#文件)。
{% endblock %}

{% block section_dataType_largeData %}{% endblock %}

{% block code_save_todo_folder %}

```js
  // 声明类型
  var TodoFolder = AV.Object.extend('TodoFolder');
  // 新建对象
  var todoFolder = new TodoFolder();
  // 设置名称
  todoFolder.set('name','工作');
  // 设置优先级
  todoFolder.set('priority',1);
  todoFolder.save().then(function (todo) {
    console.log('objectId is ' + todo.id);
  }, function (error) {
    console.error(error);
  });
```
{% endblock %}

{% block code_saveoption_query_example %}

```js
  var Account = AV.Object.extend('Account');
  new AV.Query(Account).first().then(function(account) {
    var amount = -100;
    account.increment('balance', amount);
    return account.save(null, {
      query: new AV.Query(Account).greaterThanOrEqualTo('balance', -amount),
      fetchWhenSave: true,
    });
  }).then(function(account) {
    // 保存成功
    console.log('当前余额为：', account.get('balance'));
  }).catch(function(error) {
    if (error.code === 305) {
    console.log('余额不足，操作失败！');
    }
  });
```
{% endblock %}

{% macro code_get_todo_by_objectId() %}
```js
  var query = new AV.Query('Todo');
  query.get('57328ca079bc44005c2472d0').then(function (todo) {
    // 成功获得实例
    // todo 就是 id 为 57328ca079bc44005c2472d0 的 Todo 对象实例
  }, function (error) {
    // 异常处理
  });
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```js
  // 第一个参数是 className，第二个参数是 objectId
  var todo = AV.Object.createWithoutData('Todo', '5745557f71cfe40068c6abe0');
  todo.fetch().then(function () {
    var title = todo.get('title');// 读取 title
    var content = todo.get('content');// 读取 content
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```js
  var todo = new Todo();
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑
    // 获取 objectId
    var objectId = todo.id;
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```js
  var query = new AV.Query('Todo');
  query.get('558e20cbe4b060308e3eb36c').then(function (todo) {
    // 成功获得实例
    // todo 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
    var priority = todo.get('priority');
    var location = todo.get('location');
    var title = todo.get('title');
    var content = todo.get('content');

    // 获取三个特殊属性
    var objectId = todo.id;
    var updatedAt = todo.updatedAt;
    var createdAt = todo.createdAt;

    //Wed May 11 2016 09:36:32 GMT+0800 (CST)
    console.log(createdAt);
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```

如果需要一次性获取返回对象的所有属性（比如进行数据绑定）而非显式地调用 `get(属性名)`，可以利用 AV.Object 实例的 `toJSON()` 方法（需要 leancloud-storage@^3.0.0 以上版本）来得到一个 plain object。

```js
  var query = new AV.Query('Todo');
  query.get('558e20cbe4b060308e3eb36c').then(function (todo) {
    console.log(todo.toJSON())
    // ==== console 中的结果 ====

    // content: "每周工程师会议，周一下午2点"
    // createdAt: "2017-03-08T11:25:07.804Z"
    // location: "会议室"
    // objectId: "558e20cbe4b060308e3eb36c"
    // priority: 1
    // title: "工程师周会"
    // updatedAt: "2017-03-08T11:25:07.804Z"

  }).catch(function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_object_fetch %}

```js
  // 使用已知 objectId 构建一个 AV.Object
  var todo = new Todo();
  todo.id = '5590cdfde4b00f7adb5860c8';
  todo.fetch().then(function (todo) {
    // // todo 是从服务器加载到本地的 Todo 对象
    var priority = todo.get('priority');
  }, function (error) {

  });
```
{% endblock %}

{% block code_object_fetchWhenSave %}

```js
  //设置 fetchWhenSave 为 true
  todo.fetchWhenSave(true);
  todo.save().then(function () {
    // 保存成功
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_object_fetch_with_keys %}

```js
  // 使用已知 objectId 构建一个 AV.Object
  var todo = new Todo();
  todo.id = '5590cdfde4b00f7adb5860c8';
  todo.fetch({
    keys: 'priority,location'
  }).then(function (todo) {
    // 获取到本地
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_update_todo_location %}

```js
  // 已知 objectId，创建 AVObject
  // 第一个参数是 className，第二个参数是该对象的 objectId
  var todo = AV.Object.createWithoutData('Todo', '558e20cbe4b060308e3eb36c');
  // 更改属性
  todo.set('location', '二楼大会议室');
  // 保存
  todo.save().then(function () {
    // 保存成功
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```js
  // 第一个参数是 className，第二个参数是 objectId
  var todo = AV.Object.createWithoutData('Todo', '5745557f71cfe40068c6abe0');
  // 修改属性
  todo.set('content', '每周工程师会议，本周改为周三下午3点半。');
  // 保存到云端
  todo.save();
```

{% endblock %}

{% block code_update_object_by_cql %}

```js
  // 执行 CQL 语句实现更新一个 TodoFolder 对象
  AV.Query.doCloudQuery('update TodoFolder set name="家庭" where objectId="558e20cbe4b060308e3eb36c"')
  .then(function (data) {
    // data 中的 results 是本次查询返回的结果，AV.Object 实例列表
    var results = data.results;
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_atomic_operation_increment %}

```js
  var todo = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.set('views', 0);
  todo.save().then(function (todo) {
    todo.increment('views', 1);
    todo.fetchWhenSave(true);
    return todo.save();
  }).then(function (todo) {
    // 使用了 fetchWhenSave 选项，save 成功之后即可得到最新的 views 值
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}

{% block code_atomic_operation_array %}

* `AV.Object.add('arrayKey', value)`<br>
  将指定对象附加到数组末尾。
* `AV.Object.addUnique('arrayKey', value);`<br>
  如果数组中不包含指定对象，将该对象加入数组，对象的插入位置是随机的。
* `AV.Object.remove('arrayKey', value);`<br>
  从数组字段中删除指定对象的所有实例。

{% endblock %}

{% block code_set_array_value %}

```js
  var reminder1 = new Date('2015-11-11 07:10:00');
  var reminder2 = new Date('2015-11-11 07:20:00');
  var reminder3 = new Date('2015-11-11 07:30:00');

  var reminders = [reminder1, reminder2, reminder3];

  var todo = new AV.Object('Todo');
  // 指定 reminders 是做一个 Date 对象数组
  todo.addUnique('reminders', reminders);
  todo.save().then(function (todo) {
    console.log(todo.id);
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_delete_todo_by_objectId %}

```js
  var todo = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.destroy().then(function (success) {
    // 删除成功
  }, function (error) {
    // 删除失败
  });
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```js
  // 执行 CQL 语句实现删除一个 Todo 对象
  AV.Query.doCloudQuery('delete from Todo where objectId="558e20cbe4b060308e3eb36c"').then(function () {
    // 删除成功
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}


{% block code_batch_operation %}

```js
  var objects = []; // 构建一个本地的 AV.Object 对象数组

   // 批量创建（更新）
  AV.Object.saveAll(objects).then(function (objects) {
    // 成功
  }, function (error) {
    // 异常处理
  });
  // 批量删除
  AV.Object.destroyAll(objects).then(function () {
    // 成功
  }, function (error) {
    // 异常处理
  });
  // 批量获取
  AV.Object.fetchAll(objects).then(function (objects) {
    // 成功
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}


{% block code_batch_set_todo_completed %}

```js
  var query = new AV.Query('Todo');
  query.find().then(function (todos) {
    todos.forEach(function(todo) {
      todo.set('status', 1);
    });
    return AV.Object.saveAll(todos);
  }).then(function(todos) {
    // 更新成功
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}


{% block text_work_in_background %}{% endblock %}
{% block save_eventually %}{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```js
  var todoFolder = new AV.Object('TodoFolder');
  todoFolder.set('name', '工作');
  todoFolder.set('priority', 1);

  var todo1 = new AV.Object('Todo');
  todo1.set('title', '工程师周会');
  todo1.set('content', '每周工程师会议，周一下午2点');
  todo1.set('location', '会议室');

  var todo2 = new AV.Object('Todo');
  todo2.set('title', '维护文档');
  todo2.set('content', '每天 16：00 到 18：00 定期维护文档');
  todo2.set('location', '当前工位');

  var todo3 = new AV.Object('Todo');
  todo3.set('title', '发布 SDK');
  todo3.set('content', '每周一下午 15：00');
  todo3.set('location', 'SA 工位');

  var todos = [todo1, todo2, todo3];
  AV.Object.saveAll(todos).then(function () {
    var relation = todoFolder.relation('containedTodos'); // 创建 AV.Relation
    todos.map(relation.add.bind(relation));
    return todoFolder.save();// 保存到云端
  }).then(function(todoFolder) {
    // 保存成功
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}


{% block code_pointer_comment_one_to_many_todoFolder %}

```js
  var comment = new AV.Object('Comment');// 构建 Comment 对象
  comment.set('likes', 1);// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
  comment.set('content', '这个太赞了！楼主，我也要这些游戏，咱们团购么？');
  // 假设已知被分享的该 TodoFolder 的 objectId 是 5735aae7c4c9710060fbe8b0
  var targetTodoFolder = AV.Object.createWithoutData('TodoFolder', '5735aae7c4c9710060fbe8b0');
  comment.set('targetTodoFolder', targetTodoFolder);
  comment.save();//保存到云端
```
{% endblock %}


{% block code_create_geoPoint %}
``` js
  // 第一个参数是： latitude ，纬度
  // 第二个参数是： longitude，经度
  var point = new AV.GeoPoint(39.9, 116.4);

  // 以下是创建 AV.GeoPoint 对象不同的方法
  var point2 = new AV.GeoPoint([12.7, 72.2]);
  var point3 = new AV.GeoPoint({ latitude: 30, longitude: 30 });
```
{% endblock %}


{% block code_use_geoPoint %}
```js
todo.set('whereCreated', point);
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}
`AV.Object` 提供了 `#toFullJSON()` 方法将该对象序列化成 JSON 格式

```js
var todoFolder = new AV.Object('TodoFolder');// 构建对象
todoFolder.put('name', '工作'); // 设置名称
todoFolder.put('priority', 1); // 设置优先级
todoFolder.put('owner', AV.User.current()); // Pointer 类型属性

// 将 AV.Object 对象反序列化成 JSON 对象
var json = todoFolder.toFullJSON();
// 将 JSON 对象序列化为字符串
var serializedString = JSON.stringify(json);
```

{{ docs.note("`AV.Object` 还提供了另一个方法 `#toJSON()`。它们的区别是 `#toJSON()` 得到的对象仅包含对象的 payload，一般用于展示，而 `#toFullJSON()` 得到的对象包含了元数据，一般用于传输。在使用时请注意区分。") }}

{% endblock %}

{% block code_deserialize_string_to_baseObject %}
```js
// 将字符串反序列化为 JSON 对象
var json = JSON.parse(serializedString);
// 将 JSON 对象反序列化成 AV.Object 对象
var todoFolder = AV.parse(json);
```
{% endblock %}

{% block code_data_protocol_save_date %}
```js
  var testDate = new Date('2016-06-04');
  var testAVObject = new AV.Object('TestClass');
  testAVObject.set('testDate', testDate);
  testAVObject.save();
```
{% endblock %}


{% block code_create_avfile_by_stream_data %}

```js
  var data = { base64: '6K+077yM5L2g5Li65LuA5LmI6KaB56C06Kej5oiR77yf' };
  var file = new AV.File('resume.txt', data);
  file.save();

  var bytes = [0xBE, 0xEF, 0xCA, 0xFE];
  var byteArrayFile = new AV.File('myfile.txt', bytes);
  byteArrayFile.save();
```
{% endblock %}


{% block code_create_avfile_from_local_path %}
假设在页面上有如下文件选择框：

```html
<input type="file" id="photoFileUpload"/>
```
上传文件对应的代码如下：
```js
    var fileUploadControl = $('#photoFileUpload')[0];
    if (fileUploadControl.files.length > 0) {
      var localFile = fileUploadControl.files[0];
      var name = 'avatar.jpg';

      var file = new AV.File(name, localFile);
      file.save().then(function(file) {
        // 文件保存成功
        console.log(file.url());
      }, function(error) {
        // 异常处理
        console.error(error);
      });
    }
```
{% endblock %}

{% block code_create_avfile_from_url %}

```js
  var file = AV.File.withURL('Satomi_Ishihara.gif', 'http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif');
  file.save().then(function(file) {
    // 文件保存成功
    console.log(file.url());
  }, function(error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block text_upload_file %}

如果希望在云引擎环境里上传文件，请参考我们的[网站托管开发指南](leanengine_webhosting_guide-node.html#文件上传)。
{% endblock %}

{% block code_upload_file_with_progress %}
```javascript
file.save({
  onprogress:function (e)  {
    console.log(e)
    // { loaded: 1234, total: 2468, percent: 50 }
  },
}).then(/* ... */);

// 2.0 之前版本的 SDK 中，save 的第二个参数 callbacks 不能省略：
file.save({
  onprogress: function(e) { console.log(e); }
}, {}).then(/* ... */);
```
{% endblock %}
{% block text_download_file_with_progress %}{% endblock %}

{% block text_file_query %}

### 文件查询
文件的查询依赖于文件在系统中的关系模型，例如，用户的头像，有一些用户习惯直接在 `_User` 表中直接使用一个 `avatar` 列，然后里面存放着一个 url 指向一个文件的地址，但是，我们更推荐用户使用 Pointer 来关联一个 {{userObjectName}} 和 {{fileObjectName}}，代码如下：

{% block code_user_pointer_file %}

```js
    var data = { base64: '文件的 base64 编码' };
    var avatar = new AV.File('avatar.png', data);

    var user = new AV.User();
    var randomUsername = 'Tom';
    user.setUsername(randomUsername)
    user.setPassword('leancloud');
    user.set('avatar',avatar);
    user.signUp().then(function (u){
    });
```
{% endblock %}

{% endblock %}

{% block code_file_image_thumbnail %}

```js
  //获得宽度为100像素，高度200像素的缩略图
  var url = file.thumbnailURL(100, 200);
```
{% endblock %}


{% block code_file_metadata %}

```js
    // 获取文件大小
    var size = file.size();
    // 上传者(AV.User) 的 objectId，如果未登录，默认为空
    var ownerId = file.ownerId();

    // 获取文件的全部元信息
    var metadata = file.metaData();
    // 设置文件的作者
    file.metaData('author', 'LeanCloud');
    // 获取文件的格式
    var format = file.metaData('format');
```
{% endblock %}


{% block code_file_delete %}

```js
  var file = AV.File.createWithoutData('552e0a27e4b0643b709e891e');
  file.destroy().then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_cache_operations_file %}{% endblock %}

{% block text_https_access_for_ios9 %}{% endblock %}

{% block code_create_query_by_className %}

```js
  var query = new AV.Query('Todo');
```
{% endblock %}


{% block code_priority_equalTo_zero_query %}

```js
  var query = new AV.Query('Todo');
  // 查询 priority 是 0 的 Todo
  query.equalTo('priority', 0);
  query.find().then(function (results) {
      var priorityEqualsZeroTodos = results;
  }, function (error) {
  });
```
{% endblock %}


{% block code_priority_equalTo_zero_and_one_wrong_example %}

```js
  var query = new AV.Query('Todo');
  query.equalTo('priority', 0);
  query.equalTo('priority', 1);
  query.find().then(function (results) {
  // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
  }, function (error) {
  });
```
{% endblock %}


{% block table_logic_comparison_in_query %}
逻辑操作 | AVQuery 方法|
---|---
等于 | `equalTo`
不等于 |  `notEqualTo`
大于 | `greaterThan`
大于等于 | `greaterThanOrEqualTo`
小于 | `lessThan`
小于等于 | `lessThanOrEqualTo`
{% endblock %}

{% block code_query_lessThan %}

```js
  var query = new AV.Query('Todo');
  query.lessThan('priority', 2);
```
{% endblock %}


{% block code_query_greaterThanOrEqualTo %}

```js
  query.greaterThanOrEqualTo('priority',2);
```
{% endblock %}


{% block code_query_with_regular_expression %}

```js
  var query = new AV.Query('Todo');
  var regExp = new RegExp('[\u4e00-\u9fa5]', 'i');
  query.matches('title', regExp);
  query.find().then(function (results) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_with_contains_keyword %}

```js
  query.contains('title','李总');
```
{% endblock %}


{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-js">  var query = new AV.Query('Todo');
  var regExp = new RegExp('{{ data.regex(true) | safe }}, 'i');
  query.matches('title', regExp);
</code></pre>
{% endblock %}
<!-- 2016-12-29 故意忽略最后一行中字符串的结尾引号，以避免渲染错误。不要使用 markdown 语法来替代 <pre><code> -->

{% block code_query_array_contains_using_equalsTo %}

```js
  var query = new AV.Query('Todo');
  var reminderFilter = [new Date('2015-11-11 08:30:00')];
  query.containsAll('reminders', reminderFilter);

  // 也可以使用 equals 接口实现这一需求
  var targetDateTime = new Date('2015-11-11 08:30:00');
  query.equalTo('reminders', targetDateTime);
```
{% endblock %}


{% block code_query_array_contains_all %}

```js
  var query = new AV.Query('Todo');
  var reminderFilter = [new Date('2015-11-11 08:30:00'), new Date('2015-11-11 09:30:00')];
  query.containsAll('reminders', reminderFilter);
```
{% endblock %}

{% block code_query_with_containedIn_keyword %}
```js
    var locations = ["Office", "CoffeeShop"];
    query.containedIn("location", locations);
```
{% endblock %}

{% block code_query_with_part_contains_keyword %}
```js
  query.containedIn('reminders', reminderFilter);
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}
```js
  query.notContainedIn('reminders', reminderFilter);
```
{% endblock %}

{% block code_query_whereHasPrefix %}
```js
  // 找出开头是「早餐」的 Todo
  var query = new AV.Query('Todo');
  query.startsWith('content', '早餐');

  // 找出包含 「bug」 的 Todo
  var query = new AV.Query('Todo');
  query.contains('content', 'bug');
```
{% endblock %}


{% block code_query_comment_by_todoFolder %}

```js
  var query = new AV.Query('Comment');
  var todoFolder = AV.Object.createWithoutData('TodoFolder', '5735aae7c4c9710060fbe8b0');
  query.equalTo('targetTodoFolder', todoFolder);

  // 想在查询的同时获取关联对象的属性则一定要使用 `include` 接口用来指定返回的 `key`
  query.include('targetTodoFolder');
```
{% endblock %}


{% block code_create_tag_object %}

```js
  var tag = new AV.Object('Tag');
  tag.set('name', '今日必做');
  tag.save();
```
{% endblock %}


{% block code_create_family_with_tag %}

```js
  var tag1 = new AV.Object('Tag');
  tag1.set('name', '今日必做');

  var tag2 = new AV.Object('Tag');
  tag2.set('name', '老婆吩咐');

  var tag3 = new AV.Object('Tag');
  tag3.set('name', '十分重要');

  var tags = [tag1, tag2, tag3];
  AV.Object.saveAll(tags).then(function (savedTags) {

      var todoFolder = new AV.Object('TodoFolder');
      todoFolder.set('name', '家庭');
      todoFolder.set('priority', 1);

      var relation = todoFolder.relation('tags');
      relation.add(tag1);
      relation.add(tag2);
      relation.add(tag3);

      todoFolder.save();
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_tag_for_todoFolder %}

```js
  var todoFolder = AV.Object.createWithoutData('TodoFolder', '5735aae7c4c9710060fbe8b0');
  var relation = todoFolder.relation('tags');
  var query = relation.query();
  query.find().then(function (results) {
    // results 是一个 AV.Object 的数组，它包含所有当前 todoFolder 的 tags
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_todoFolder_with_tag %}

```js
  var targetTag = AV.Object.createWithoutData('Tag', '5655729900b0bf3785ca8192');
  var query = new AV.Query('TodoFolder');
  query.equalTo('tags', targetTag);
  query.find().then(function (results) {
  // results 是一个 AV.Object 的数组
  // results 指的就是所有包含当前 tag 的 TodoFolder
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_comment_include_todoFolder %}

```js
  var commentQuery = new AV.Query('Comment');
  commentQuery.descending('createdAt');
  commentQuery.limit(10);
  commentQuery.include('targetTodoFolder');// 关键代码，用 include 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
  commentQuery.include('targetTodoFolder.targetAVUser');// 关键代码，同上，会返回 targetAVUser 对应的对象的详细信息，而不仅仅是 objectId
  commentQuery.find().then(function (comments) {
      // comments 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
      for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          // 并不需要网络访问
          var todoFolder = comment.get('targetTodoFolder');
          var avUser = todoFolder.get('targetAVUser');
      }
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_comment_match_query_todoFolder %}

```js
  // 构建内嵌查询
  var targetTag = AV.Object.createWithoutData('Tag', '5655729900b0bf3785ca8192');
  var innerQuery = new AV.Query('TodoFolder');
  innerQuery.equalTo('tags', targetTag);

  // 将内嵌查询赋予目标查询
  var query = new AV.Query('Comment');

  // 执行内嵌操作
  query.matchesQuery('targetTodoFolder', innerQuery);
  query.find().then(function (results) {
     
  }, function (error) {
  });

  // 注意如果要做相反的查询可以使用
  query.doesNotMatchQuery('targetTodoFolder', innerQuery);
```
{% endblock %}


{% block code_query_find_first_object %}

```js
  var query = new AV.Query('Comment');
  query.equalTo('priority', 0);
  query.first().then(function (data) {
    // data 就是符合条件的第一个 AV.Object
  }, function (error) {
  });
```
{% endblock %}


{% block code_set_query_limit %}

```js
  var query = new AV.Query('Todo');
  var now = new Date();
  query.lessThanOrEqualTo('createdAt', now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
```
{% endblock %}


{% block code_set_skip_for_pager %}

```js
  var query = new AV.Query('Todo');
  var now = new Date();
  query.lessThanOrEqualTo('createdAt', now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
  query.skip(20);// 跳过 20 条结果
```
{% endblock %}

{% block code_query_select_keys %}

```js
  var query = new AV.Query('Todo');
  query.select(['title', 'content']);
  query.first().then(function (todo) {
    console.log(todo.get('title')); // √
    console.log(todo.get('content')); // √
    console.log(todo.get('location')); // undefined
  }, function (error) {
    // 异常处理
  });
```
{% endblock %}

{% block code_query_select_pointer_keys %}

```js
    query.select('owner.username');
```

{% endblock %}

{% block code_query_count %}

```js
  var query = new AV.Query('Todo');
  query.equalTo('status', 1);
  query.count().then(function (count) {
      console.log(count);
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_orderby %}

```js
  // 按时间，升序排列
  query.ascending('createdAt');

  // 按时间，降序排列
  query.descending('createdAt');
```
{% endblock %}


{% block code_query_orderby_on_multiple_keys %}

```js
  var query = new AV.Query('Todo');
  query.addAscending('priority');
  query.addDescending('createdAt');
```
{% endblock %}


{% block code_query_with_or %}

```js
  var priorityQuery = new AV.Query('Todo');
  priorityQuery.greaterThanOrEqualTo('priority', 3);

  var statusQuery = new AV.Query('Todo');
  statusQuery.equalTo('status', 1);

  var query = AV.Query.or(priorityQuery, statusQuery);
  // 返回 priority 大于等于 3 或 status 等于 1 的 Todo
```
{% endblock %}


{% block code_query_with_and %}
```js
  var startDateQuery = new AV.Query('Todo');
  startDateQuery.greaterThanOrEqualTo('createdAt', new Date('2016-11-13 00:00:00'));

  var endDateQuery = new AV.Query('Todo');
  endDateQuery.lessThan('createdAt', new Date('2016-12-03 00:00:00'));

  var query = AV.Query.and(startDateQuery, endDateQuery);
```
{% endblock %}


{% block code_query_where_keys_exist %}

```js
  var aTodoAttachmentImage = AV.File.withURL('attachment.jpg', 'http://www.zgjm.org/uploads/allimg/150812/1_150812103912_1.jpg');
  var todo = new AV.Object('Todo');
  todo.set('images', aTodoAttachmentImage);
  todo.set('content', '记得买过年回家的火车票！！！');
  todo.save();

  var query = new AV.Query('Todo');
  query.exists('images');
  query.find().then(function (results) {
    // results 返回的就是有图片的 Todo 集合
  }, function (error) {
  });

  // 使用空值查询获取没有图片的 Todo
  query.doesNotExist('images');
```
{% endblock %}


{% block code_query_by_cql %}

```js
  var cql = 'select * from Todo where status = 1';
  AV.Query.doCloudQuery(cql).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组
      var results = data.results;
  }, function (error) {
  });
  cql = 'select count(*) from %@ where status = 0';
  AV.Query.doCloudQuery(cql).then(function (data) {
      // 获取符合查询的数量
      var count = data.count;
  }, function (error) {
  });
```
{% endblock %}


{% block code_query_by_cql_with_placeholder %}

```js
  // 带有占位符的 cql 语句
  var cql = 'select * from Todo where status = ? and priority = ?';
  var pvalues = [0, 1];
  AV.Query.doCloudQuery(cql, pvalues).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组
      var results = data.results;
  }, function (error) {
  });
```
{% endblock %}


{% block text_query_cache_intro %}{% endblock %}

{% block code_set_cache_policy %}{% endblock %}

{% block table_cache_policy %}{% endblock %}

{% block code_query_geoPoint_near %}

```js
  var query = new AV.Query('Todo');
  var point = new AV.GeoPoint(39.9, 116.4);
  query.withinKilometers('whereCreated', point, 2.0);
  query.find().then(function (results) {
      var nearbyTodos = results;
  }, function (error) {
  });
```


在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `ascending` 或 `descending` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}{% endblock %}

{% block code_query_geoPoint_within %}

```js
  var query = new AV.Query('Todo');
  var point = new AV.GeoPoint(39.9, 116.4);
  query.withinKilometers('whereCreated', point, 2.0);
```

{% endblock %}

{% block code_send_sms_code_for_loginOrSignup %}

```js
  AV.Cloud.requestSmsCode('13577778888').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_verify_sms_code_for_loginOrSignup %}

```js
  AV.User.signUpOrlogInWithMobilePhone('13577778888', '123456').then(function (success) {
    // 成功
  }, function (error) {
    // 失败
  });
```
{% endblock %}


{% block code_user_signUp_with_username_and_password %}

```js
  // 新建 AVUser 对象实例
  var user = new AV.User();
  // 设置用户名
  user.setUsername('Tom');
  // 设置密码
  user.setPassword('cat!@#123');
  // 设置邮箱
  user.setEmail('tom@leancloud.cn');
  user.signUp().then(function (loggedInUser) {
      console.log(loggedInUser);
  }, function (error) {
  });
```
{% endblock %}

{% block code_send_verify_email %}

```js
  AV.User.requestEmailVerify('abc@xyz.com').then(function (result) {
      console.log(JSON.stringify(result));
  }, function (error) {
      console.log(JSON.stringify(error));
  });
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loggedInUser) {
    console.log(loggedInUser);
  }, function (error) {
  });
```
{% endblock %}


{% block code_user_logIn_with_mobilephonenumber_and_password %}

```js
  AV.User.logInWithMobilePhone('13577778888', 'cat!@#123').then(function (loggedInUser) {
      console.log(loggedInUser);
  }, function (error) {
  });
```
{% endblock %}


{% block code_user_logIn_requestLoginSmsCode %}

```js
AV.User.requestLoginSmsCode('13577778888').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_user_logIn_with_smsCode %}

```js
  AV.User.logInWithMobilePhoneSmsCode('13577778888', '238825').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}

{% block code_get_user_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loggedInUser) {
    console.log(loggedInUser);
    var username = loggedInUser.getUsername();
    var email = loggedInUser.getEmail();
    // 请注意，密码不会明文存储在云端，因此密码只能重置，不能查看
  }, function (error) {
  });
```
{% endblock %}

{% block code_set_user_custom_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loggedInUser) {
    loggedInUser.set('age', 25);
    loggedInUser.save();
  }, function (error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_update_user_custom_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loggedInUser) {
    // 25
    console.log(loggedInUser.get('age'));
    loggedInUser.set('age', 18);
    return loggedInUser.save();
  }).then(function(loggedInUser) {
    // 18
    console.log(loggedInUser.get('age'));
  }).catch(function(error) {
    // 异常处理
    console.error(error);
  });
```
{% endblock %}

{% block code_reset_password_by_email %}

```js
  AV.User.requestPasswordReset('myemail@example.com').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_reset_password_by_mobilephoneNumber %}

```js
  AV.User.requestPasswordResetBySmsCode('18612340000').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_reset_password_by_mobilephoneNumber_verify %}

```js
  AV.User.resetPasswordBySmsCode('123456', 'thenewpassword').then(function (success) {
  }, function (error) {
  });
```
{% endblock %}


{% block code_current_user %}

```js
  var currentUser = AV.User.current();
  if (currentUser) {
     // 跳转到首页
  }
  else {
     //currentUser 为空时，可打开用户注册界面…
  }
```
{% endblock %}


{% block code_current_user_logout %}

```js
  AV.User.logOut();
  // 现在的 currentUser 是 null 了
  var currentUser = AV.User.current();
```
{% endblock %}


{% block code_query_user %}

```js
  var query = new AV.Query('_User');
```
{% endblock %}



{% block code_user_isAuthenticated %}

```js
    var currentUser = AV.User.current();
    currentUser.isAuthenticated().then(function(authenticated){
       // console.log(authenticated); 根据需求进行后续的操作
    });
```
{% endblock %}


{% block text_subclass %}{% endblock %}
{% block text_feedback %}{% endblock %}

{% block text_js_promise %}
## Promise

每一个在 LeanCloud JavaScript SDK 中的异步方法都会返回一个
 `Promise`，可以通过这个 promise 来处理该异步方法的完成与异常。

```javascript
// 这是一个比较完整的例子，具体方法可以看下面的文档
// 查询某个 AV.Object 实例，之后进行修改
var query = new AV.Query('TestObject');
query.equalTo('name', 'hjiang');
// find 方法是一个异步方法，会返回一个 Promise，之后可以使用 then 方法
query.find().then(function(results) {
  // 返回一个符合条件的 list
  var obj = results[0];
  obj.set('phone', '182xxxx5548');
  // save 方法也是一个异步方法，会返回一个 Promise，所以在此处，你可以直接 return 出去，后续操作就可以支持链式 Promise 调用
  return obj.save();
}).then(function() {
  // 这里是 save 方法返回的 Promise
  console.log('设置手机号码成功');
}).catch(function(error) {
  // catch 方法写在 Promise 链式的最后，可以捕捉到全部 error
  console.error(error);
});
```

### then 方法

每一个 Promise 都有一个叫 `then` 的方法，这个方法接受一对 callback。第一个 callback 在 promise 被解决（`resolved`，也就是正常运行）的时候调用，第二个会在 promise 被拒绝（`rejected`，也就是遇到错误）的时候调用。

```javascript
obj.save().then(function(obj) {
  //对象保存成功
}, function(error) {
  //对象保存失败，处理 error
});
```

其中第二个参数是可选的。

你还可以使用 `catch` 三个方法，将逻辑写成：

```javascript
obj.save().then(function(obj) {
  //对象保存成功
}).catch(function(error) {
  //对象保存失败，处理 error
});
```

### 将 Promise 组织在一起

Promise 比较神奇，可以代替多层嵌套方式来解决发送异步请求代码的调用顺序问题。如果一个 Promise 的回调会返回一个 Promise，那么第二个 then 里的 callback 在第一个 then
的 callback 没有解决前是不会解决的，也就是所谓 **Promise Chain**。

```javascript
// 将内容按章节顺序添加到页面上
var chapterIds = [
  '584e1c408e450a006c676162', // 第一章
  '584e1c43128fe10058b01cf5', // 第二章
  '581aff915bbb500059ca8d0b'  // 第三章
];

new AV.Query('Chapter').get(chapterIds[0]).then(function(chapter0) {
  // 向页面添加内容
  addHtmlToPage(chapter0.get('content'));
  // 返回新的 Promise
  return new AV.Query('Chapter').get(chapterIds[1]);
}).then(function(chapter1) {
  addHtmlToPage(chapter1.get('content'));
  return new AV.Query('Chapter').get(chapterIds[2]);
}).then(function(chapter2) {
  addHtmlToPage(chapter2.get('content'));
  // 完成
});
```

### 错误处理

如果任意一个在链中的 Promise 抛出一个异常的话，所有的成功的 callback 在接下
来都会被跳过直到遇到一个处理错误的 callback。

通常来说，在正常情况的回调函数链的末尾，加一个错误处理的回调函数，是一种很
常见的做法。

利用 `try,catch` 方法可以将上述代码改写为：

```javascript
new AV.Query('Chapter').get(chapterIds[0]).then(function(chapter0) {
  addHtmlToPage(chapter0.get('content'));
  
  // 强制失败
  throw new Error('出错啦');

  return new AV.Query('Chapter').get(chapterIds[1]);
}).then(function(chapter1) {
  // 这里的代码将被忽略
  addHtmlToPage(chapter1.get('content'));
  return new AV.Query('Chapter').get(chapterIds[2]);
}).then(function(chapter2) {
  // 这里的代码将被忽略
  addHtmlToPage(chapter2.get('content'));
}).catch(function(error) {
  // 这个错误处理函数将被调用，错误信息是 '出错啦'.
  console.error(error.message);
});
```

### JavaScript Promise 迷你书

如果你想更深入地了解和学习 Promise，包括如何对并行的异步操作进行控制，我们推荐阅读 [《JavaScript Promise迷你书（中文版）》](http://liubin.github.io/promises-book/) 这本书。
{% endblock %}

{% block js_push_guide %}
## Push 通知

通过 JavaScript SDK 也可以向移动设备推送消息。

一个简单例子推送给所有订阅了 `public` 频道的设备：

```javascript
AV.Push.send({
  channels: [ 'public' ],
  data: {
    alert: 'public message'
  }
});
```

这就向订阅了 `public` 频道的设备发送了一条内容为 `public message` 的消息。

如果希望按照某个 `_Installation` 表的查询条件来推送，例如推送给某个 `installationId` 的 Android 设备，可以传入一个 `AV.Query` 对象作为 `where` 条件：

```javascript
var query = new AV.Query('_Installation');
query.equalTo('installationId', installationId);
AV.Push.send({
  where: query,
  data: {
    alert: 'Public message'
  }
});
```

此外，如果你觉得 AV.Query 太繁琐，也可以写一句 [CQL](./cql_guide.html) 来搞定：

```javascript
AV.Push.send({
  cql: 'select * from _Installation where installationId="设备id"',
  data: {
    alert: 'Public message'
  }
});
```

`AV.Push` 的更多使用信息参考 API 文档 [AV.Push](https://leancloud.github.io/javascript-sdk/docs/AV.Push.html)。更多推送的查询条件和格式，请查阅 [消息推送指南](./push_guide.html)。

iOS 设备可以通过 `prod` 属性指定使用测试环境还是生产环境证书：

```javascript
AV.Push.send({
  prod: 'dev',
  data: {
    alert: 'public message'
  }
});
```

`dev` 表示开发证书，`prod` 表示生产证书，默认生产证书。
{% endblock %}

{% block use_js_in_webview %}
## WebView 中使用

JS SDK 支持在各种 WebView 中使用（包括 PhoneGap/Cordova、微信 WebView 等）。

### Android WebView 中使用

如果是 Android WebView，在 Native 代码创建 WebView 的时候你需要打开几个选项，
这些选项生成 WebView 的时候默认并不会被打开，需要配置：

1. 因为我们 JS SDK 目前使用了 window.localStorage，所以你需要开启 WebView 的 localStorage：

  ```java
  yourWebView.getSettings().setDomStorageEnabled(true);
  ```
2. 如果你希望直接调试手机中的 WebView，也同样需要在生成 WebView 的时候设置远程调试，具体使用方式请参考 [Google 官方文档](https://developer.chrome.com/devtools/docs/remote-debugging)。

  ```java
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      yourWebView.setWebContentsDebuggingEnabled(true);
  }
  ```

  注意：这种调试方式仅支持 Android 4.4 已上版本（含 4.4）
3. 如果你是通过 WebView 来开发界面，Native 调用本地特性的 Hybrid 方式开发你的 App。比较推荐的开发方式是：通过 Chrome 的开发者工具开发界面部分，当界面部分完成，与 Native 再来做数据连调，这种时候才需要用 Remote debugger 方式在手机上直接调试 WebView。这样做会大大节省你开发调试的时间，不然如果界面都通过 Remote debugger 方式开发，可能效率较低。
4. 为了防止通过 JavaScript 反射调用 Java 代码访问 Android 文件系统的安全漏洞，在 Android 4.2 以后的系统中间，WebView 中间只能访问通过 [@JavascriptInterface](http://developer.android.com/reference/android/webkit/JavascriptInterface.html) 标记过的方法。如果你的目标用户覆盖 4.2 以上的机型，请注意加上这个标记，以避免出现 **Uncaught TypeError**。
{% endblock %}

{% block code_authenticate_via_sessiontoken %}
登录后可以调用 `user.getSessionToken()` 方法得到当前登录用户的 sessionToken。

使用 sessionToken 登录：

```javascript
AV.User.become(sessionToken).then(function(user) {
  // currentUser 已更新
})
```
{% endblock %}

{% block file_as_avatar %}

```js
var file = AV.File.withURL('Satomi_Ishihara.gif', 'http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif');
var todo = new AV.Object('Todo');
todo.set('girl',file);
todo.set('topic','明星');
todo.save();
```
{% endblock %}

{% block query_file_as_avatar %}

```js
var query = new AV.Query('Todo');
query.equalTo('topic','明星');
query.include('girl');
query.find().then(list => {
  list.map(todo => {
    var file = todo.get('girl');
    console.log('file.url', file.url());
  });
});
```
{% endblock %}

{% block code_pointer_include_todoFolder %}

```js
var todo = AV.Object.createWithoutData('Todo', '5735aae7c4c9710060fbe8b0');
todo.fetch({
  include:['todoFolder']
  }).then(todoObj =>{
    let todoFolder = todoObj.get('todoFolder');
    console.log(todoFolder.get('name'));
});
```

{% endblock %}

{% block anonymous_user_login %}
```js
AV.User.loginAnonymously().then(user => {
  // 匿名登录成功，user 即为当前登录的匿名用户
}).catch(function(error) {
  // 异常处理
  console.error(error);
});
```
{% endblock %}
{% block setup_username_and_password_for_anonymous_user %}
```js
const currentUser = AV.User.current();
user.setUsername('username')；
user.setPassword('password');
user.signUp().then(user => {
  // user 已转化为普通用户
}).catch(function(error) {
  // 异常处理
  console.error(error);
});
```
{%  endblock %}
{% block determine_a_user_is_anonymous %}
```js
const currentUser = AV.User.current();
if (currentUser.isAnonymous()) {
  // enableSignUpButton();
} else {
  // enableLogOutButton();
}
```
{%  endblock %}

{% block text_using_async_methods %}{% endblock %}

{% block login_with_authdata %}
```js
var authData = {
    access_token: 'ACCESS_TOKEN',
    expires_in: 7200,
    refresh_token: 'REFRESH_TOKEN',
    openid: 'OPENID',
    scope: 'SCOPE',
};

AV.User.loginWithAuthData(authData, 'weixin').then(function (s) {
    //登录成功
}, function (error) {
    // 登录失败
});
```
{% endblock %}

{% block login_with_authdata_result %}
```js
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
{% endblock %}

{% block associate_with_authdata %}
```js
var authData = {
    access_token: 'ACCESS_TOKEN',
    expires_in: 7200,
    refresh_token: 'REFRESH_TOKEN',
    openid: 'OPENID',
    scope: 'SCOPE',
};
var user = AV.User.current();
user.associateWithAuthData(authData, 'weixin').then(function (user) {
    // 绑定成功
}, function (error) {
    // 绑定失败
});
```
{% endblock %}

{% block associate_with_authdata_result %}
```js
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
    "qq": {
      "openid": "0395BA18A5CD6255E5BA185E7BEBA242",
      "expires_in": 7200,
      "access_token": "11_CCveaBR_Lu0lmhff6NC33Lhx662zCnbzcSYhbYZQZ01YPdFav3sjhzjoM1hxs3AMMMydhguh2M0PumUaglpzuAlpzRzQn4vEXTRaZuovEnQ"
    }
  },
  "mobilePhoneVerified": false,
  "objectId": "5b3def469f545400310c939d",
  "createdAt": "2018-07-05T10:13:26.310Z",
  "updatedAt": "2018-07-06T07:46:58.097Z"
}
```
{% endblock %}

{% block login_with_authdata_without_fail %}
``` js
var authData = {
    access_token: 'ACCESS_TOKEN',
    expires_in: 7200,
    refresh_token: 'REFRESH_TOKEN',
    openid: 'OPENID',
    scope: 'SCOPE',
};

AV.User.loginWithAuthData(authData, 'weixin',{ failOnNotExist: true }).then(function (s) {
    // 登录成功
}, function (error) {
    // 登录失败
    // 检查 error.code == 211，跳转到用户名、手机号等资料的输入页面
});


var user = new AV.User();
// 设置用户名
user.setUsername('Tom');
// 设置密码
user.setMobilePhoneNumber('18666666666');
user.setPassword('cat@#123');
// 设置邮箱
user.setEmail('tom@leancloud.cn');
user.loginWithAuthData(authData, 'wexin').then(function (loggedInUser) {
    console.log(loggedInUser);
}, function (error) {
});
```
{% endblock %}

{% block login_with_authdata_unionid %}
```js
var authData = {
    access_token: 'ACCESS_TOKEN',
    expires_in: 7200,
    refresh_token: 'REFRESH_TOKEN',
    openid: 'OPENID',
    scope: 'SCOPE',
};

AV.User.loginWithAuthDataAndUnionId(authData,
    'wxminiprogram1', 'o6_bmasdasdsad6_2sgVt7hMZOPfL', {
    unionIdPlatform: 'weixin',
    asMainAccount: true,
  }).then(function(user) {
    // 绑定成功
  },function (error) {
    // 绑定失败 
});
```
{% endblock %}

{% block login_with_authdata_unionid_result %}
```js
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
{% endblock %}

{% block login_with_authdata_unionid_result_more %}
```js
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
{% endblock %}
