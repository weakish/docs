{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词，短语所有子模板都必须赋值 #}

{% set productName ="LeanStorage" %}
{% set platform_name = "Python" %}
{% set segment_code ="python" %}
{% set sdk_name ="Python SDK" %}
{% set baseObjectName ="leancloud.Object" %}
{% set objectIdName ="id" %}
{% set updatedAtName ="updated_at" %}
{% set createdAtName ="created_at" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="leancloud.Relation" %}
{% set pointerObjectName ="leancloud.Pointer" %}
{% set baseQueryClassName ="leancloud.Query" %}
{% set geoPointObjectName ="leancloud.GeoPoint" %}
{% set userObjectName ="leancloud.User" %}
{% set fileObjectName ="leancloud.File" %}
{% set dateType= "datetime.datetime" %}
{% set byteType= "byte[]" %}
{% set acl_guide_url = "[Python SDK 权限管理使用指南](acl_guide-python.html)" %}
{% set sms_guide_url = "（Python SDK 文档待补充）" %}
{% set inapp_search_guide_url = "（Python SDK 暂不支持）" %}
{% set status_system_guide_url = "（Python SDK 暂不支持）" %}
{% set sns_guide_url = "（Python 文档待补充）" %}
{% set feedback_guide_url = "（Python SDK 暂不支持）" %}

{% set funtionName_whereKeyHasPrefix = "startswith()" %}
{% set saveOptions_query= "where" %}
{% set saveOptions_fetchWhenSave= "fetch_when_save" %}

{# --End--变量定义，主模板使用的单词，短语的定义所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_quick_save_a_todo %}

```python
import leancloud


# 可以用继承的方式定义 leancloud.Object 的子类
class Todo(leancloud.Object):
    pass
# 或者用以下的方式定义子类
# Todo = leancloud.Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')
todo.set('content', '每周工程师会议，周一下午2点')
todo.save()
```
{% endblock %}


{% block code_quick_save_a_todo_with_location %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')
todo.set('content', '每周工程师会议，周一下午2点')
todo.set('location', '会议室')  # 增加一个字段
todo.save()
```
{% endblock %}



{% block code_create_todo_object %}

```python
import leancloud

# 构造方法传入的参数，对应的就是控制台中的 Class Name
Todo = leancloud.Object.extend('Todo')
todo = Todo()
```
{% endblock %}



{% block code_save_todo_folder %}

```python
import leancloud

TodoFolder = leancloud.Object.extend('TodoFolder')
todo_folder = TodoFolder()
todo_folder.set('name', '工作')
todo_folder.set('priority', 1)
todo_folder.save()
```
{% endblock %}




{% block code_save_object_by_cql %}

```python
import leancloud

query_string = r"insert into TodoFolder(name, priority) values('工作', 78)"
result = leancloud.Query.do_cloud_query(query_string)
```
{% endblock %}



{% block code_data_type %}

```python
from datetime import datetime
import leancloud

SupportedType = leancloud.Object.extend('SupportedType')
supported_type = SupportedType()
supported_type.set('string', '工作')
supported_type.set('int', 108)
supported_type.set('float', 1.890)
supported_type.set('boolean', True)
supported_type.set('list', [1, 2, [3, 4, 'string']])
supported_type.set(
    'dict', {'item1': 12, 'item2': 'string item', 'item3': [1, 2, '3']})
supported_type.set('date', datetime.now())
supported_type.save()
```

此外，dict 和 list 支持嵌套，这样在一个 `{{baseObjectName}}` 中就可以使用它们来储存更多的结构化数据。
{% endblock %}


{% macro code_get_todo_by_objectId() %}
```python
import leancloud

query = leancloud.Query('Todo')
# 也可以获取 Todo 的 query 属性
# Todo = leancloud.Object.extend('Todo')
# query = Todo.query

# 这里填入需要查询的 objectId
query_result = query.get('57301af42e958a006982efad')
title = query_result.get('title')
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```python
import leancloud

Todo = leancloud.Object.extend('Todo')
# 用 objectId 初始化 Todo
todo = Todo.create_without_data('574d4a4e2b51e90056f76c89')
# 用 fetch 函数将该对象拉到本地
todo.fetch()
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}
```python
import leancloud

Todo = leancloud.Object.extend('Todo')
todo = Todo.create_without_data('574d4a4e2b51e90056f76c89')
# 这里修改 location 的值
todo.set('location', '二楼大会议室')
todo.save()
```
{% endblock %}


{% block code_save_callback_get_objectId %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')
todo.set('content', '每周工程师会议，周一下午2点')
todo.save()
# 一旦保存成功，todo 对象就会获得一个 objectId，通过 todo.id 获得
object_id = todo.id
```
{% endblock %}


{% block code_access_todo_folder_properties %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
# 这里填入需要查询的 objectId
query_result = query.get('57301af42e958a006982efad')
title = query_result.get('title')
content = query_result.get('content')

# 获取三个特殊属性
object_id = query_result.id
update_at = query_result.updated_at
created_at = query_result.created_at
```
{% endblock %}



{% block code_object_fetch %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
# 这里填入你所要获取的objectId
todo = Todo.create_without_data('57301af42e958a006982efad')
todo.fetch()
title = todo.get('title')
content = todo.get('content')
```
{% endblock %}


{% block code_object_fetchWhenSave %}

```python
todo.fetch_when_save = True
todo.save()
```
{% endblock %}


{% block code_update_todo_location %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
# 这里填入你所要获取的 objectId
todo = Todo.create_without_data('57301af42e958a006982efad')
title = todo.set('title', 'Another title')
todo.save()
```
{% endblock %}

{% block code_update_object_by_cql %}

```python
import leancloud

cql = 'update TodoFolder set name = ? where objectId = ?'
result = leancloud.Query.do_cloud_query(cql, '家庭', '57318f14df0eea006331a19a')
```
{% endblock %}



{% block code_atomic_operation_increment %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
# 这里填入你所要获取的 objectId
todo = Todo.create_without_data('57301af42e958a006982efad')
title = todo.set('views', 0)  # 原子增加查看次数
todo.save()

todo.increment('views')
todo.fetch_when_save = True
todo.save()

todo.increment('views', 5)
todo.save()
```
{% endblock %}


{% block code_atomic_operation_array %}

* `add()`<br>
  将指定对象附加到数组末尾。
* `add_unique()`<br>
  如果数组中不包含指定对象，将该对象加入数组，对象的插入位置是随机的。

{% endblock %}

{% block code_set_array_value %}

```python
from datetime import datetime
import leancloud

Todo = leancloud.Object.extend('Todo')
todo = Todo()

reminder1 = datetime(2015, 11, 11, 07, 10, 00)
reminder2 = datetime(2015, 11, 11, 07, 20, 00)
reminder3 = datetime(2015, 11, 11, 07, 30, 00)

todo.add('reminders', reminder1)
todo.add('reminders', reminder2)
todo.add('reminders', reminder3)
todo.save()
```
{% endblock %}


{% block code_delete_todo_by_objectId %}

```python
todo.destroy()
```
{% endblock %}


{% block code_delete_todo_by_cql %}

```python
# 执行 CQL 语句实现删除一个 Todo 对象
import leancloud

sql_string = 'delete from Todo where objectId = ?'
leancloud.Query.do_cloud_query(cql_string, '5731a29d71cfe4006cbdbc22')
```
{% endblock %}



{% block code_batch_operation %}

```python
# 批量创建、更新
leancloud.Object.save_all(list_of_objects)

# 批量删除
leancloud.Object.destroy_all(list_of_objects)```
{% endblock %}


{% block code_relation_todoFolder_one_to_many_todo %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
TodoFolder = leancloud.Object.extend('TodoFolder')

todo_folder = TodoFolder()
todo_folder.set('name', '工作')
todo_folder.set('priority', 1)

todo1 = Todo()
todo1.set('title', '工程师周会')
todo1.set('content', '工程师周会，周一下午2点')
todo1.set('location', '会议室')

todo2 = Todo()
todo2.set('title', '维护文档')
todo2.set('content', '每天 16：00 到 18：00 定期维护文档')
todo2.set('location', '当前工位')

todo3 = Todo()
todo3.set('title', '发布 SDK')
todo3.set('content', '每周一下午 15：00')
todo3.set('location', 'SA 工位')

todo1.save()
todo2.save()
todo3.save()

relation = todo_folder.relation('containedTodos')
relation.add(todo1)
relation.add(todo2)
relation.add(todo3)

todo_folder.save()
```
{% endblock %}



{% block code_batch_set_todo_completed %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
todo1 = Todo()
todo2 = Todo()
todo3 = Todo()
todo1.set('status', 1)
todo2.set('status', 2)
todo3.set('status', 3)

Todo.save_all([todo1, todo2, todo3])  # save_all 是一个类方法
```
{% endblock %}




{% block code_saveoption_query_example %}

```python
import leancloud

class Account(leancloud.Object):
    pass

account = Account.query.first()
amount = -100
account.increment('balance', amount)
account.fetch_when_save = True
where = Account.query.greater_than_or_equal_to('balance', -amount)
try:
    account.save(where=where)
    print('当前余额为：', account.get('balance'))
except leancloud.LeanCloudError as e:
    if e.code == 305:
        print('余额不足，操作失败！')
    else:
        raise
```
{% endblock %}


{% block code_object_fetch_with_keys %}

```python
# Python SDK 暂不支持
```
{% endblock %}


{% block code_pointer_comment_one_to_many_todoFolder %}

```python
import leancloud

Comment = leancloud.Object.extend('Comment')
TodoFolder = leancloud.Object.extend('TodoFolder')

comment = Comment()
# 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
comment.set('likes', 1)
# 留言的内容
comment.set('content', '这个太赞了！楼主，我也要这些游戏，咱们团购么？')

# 假设已知了被分享的该 TodoFolder 的 objectId 是 5732a4821ea4930064013bdb
todo_folder = TodoFolder.create_without_data('5732a4821ea4930064013bdb')
comment.set('targetTodoFolder', todo_folder)
comment.save()
```

{% endblock %}



{% block code_create_geoPoint %}

```python
import leancloud

point = leancloud.GeoPoint(39.9, 116.4)
```
{% endblock %}


{% block code_use_geoPoint %}

```python
todo.set('whereCreated', point)
todo.save()
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```python
# Python SDK 暂不支持
```

{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```python
# Python SDK 暂不支持
```
{% endblock %}

{% block object_extra %}

### 线程安全

`leancloud.Object` 目前不是线程安全的，因此请避免多个线程修改同一个 `leancloud.Object` 实例的操作。如果遇到必须多线程操作的情况，需要根据情况加锁。

{% endblock %}

{% block code_data_protocol_save_date %}{% endblock %}

{% block code_create_avfile_by_stream_data %}

```python
import leancloud
from StringIO import StringIO

file1 = leancloud.File('resume.txt', StringIO('data'))

file2 = leancloud.File('fileFromBuffer.txt', buffer('\x42\x43\x44'))

# 还可以指定文件的 mime type，如果不指定的话会根据文件名后缀来猜测。
file3 = leancloud.File(
    'truth.txt', StringIO('{"truth": 42}'), 'application/json')
file1.save()
file2.save()
file3.save()
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```python
import leancloud

with open('~/avatar.png') as f:
    avatar = leancloud.File('fileFromLocalFile', f)
    avatar.save()
```
{% endblock %}

{% block code_create_avfile_from_url %}

```python
import leancloud

img_url = 'http://www.example.com/avatar.jpg'
avatar = leancloud.File.create_with_url('avatar.jpg', img_url)
avatar.save()
```
{% endblock %}

{% block code_upload_file %}

```python
avatar.save()  # 执行上传
object_id = avatar.id  # 一旦保存成功即可获取到文件的 objectId
```

如果希望在云引擎环境里上传文件，请参考我们的[网站托管开发指南](leanengine_webhosting_guide-python.html#文件上传)。
{% endblock %}

{# 2016-06-06：不要删除下面的 text_upload_file_with_progress #}
{% block text_upload_file_with_progress %}{% endblock %}

{% block code_download_file %}

```python
url = avatar.url
```
{% endblock %}

{% block text_download_progress %}{% endblock %}

{% block code_file_image_thumbnail %}
```python
import leancloud

avatar = leancloud.File.create_without_data('5732df1c1ea4930060ba4642')
avatar.fetch()

thumbnail_url = avatar.get_thumbnail_url(width=100, height=100)
```
{% endblock %}


{% block code_file_metadata %}
```python
import leancloud

with open('~/avatar.png') as f:
    avatar = leancloud.File('fileFromLocallFile', f)
    avatar.metadata['width'] = 100  # avatar.metadata 是一个字典，可以添加内容并保存。
    avatar.metadata['heigth'] = 100
    avatar.metadata['author'] = 'LeanCloud'
    avatar.save()
```
{% endblock %}

{% block code_file_delete %}

``` python
import leancloud

# 默认情况下文件的删除权限是关闭的，如果想要删除需要更改 class 权限或者使用 master_key
leancloud.init("{{appid}}", master_key="{{masterkey}}")
leancloud.use_master_key()
avatar = leancloud.File.create_without_data('5732f4cf71cfe4006cc89d75')
avatar.destroy()
```
{% endblock %}

{% block code_cache_operations_file %}{% endblock %}

{% block code_create_query_by_className %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = leancloud.Query(Todo)

# 或者采用 Todo 的 query属性，也可以获得 Todo 的 query对象  
# query = Todo.query
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

# 获取符合 priority = 0 的 Todo数组
query_list = query.equal_to('priority', 0).find()
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

query.equal_to('priority', 0)
query.equal_to('priority', 1)  

# 如果这样写，只会返回 priority = 1 的结果
query_list = query.find()
```
{% endblock %}

{% block table_logic_comparison_in_query %}
逻辑操作 | leancloud.Query 方法|
---|---
等于 | `equal_to`
不等于 |  `not_equal_to`
大于 | `greater_than`
大于等于 | `greater_than_or_equal_to`
小于 | `less_than`
小于等于 | `less_than_or_equal_to`
{% endblock %}

{% block code_query_lessThan %}

```python
query.less_than_or_equal_to("priority", 2)
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```python
query.greater_than_or_equal_to("priority", 2)
```
{% endblock %}

{% block code_query_with_regular_expression %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
query.matched('title', '^李总')
todo_list = query.find()
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

query.contains('title', '李总')
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-python">import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

query.matched('title', '{{ data.regex(true) | safe }})
</code></pre>
{% endblock %}
<!-- 2016-12-29 故意忽略最后一行中字符串的结尾引号，以避免渲染错误。不要使用 markdown 语法来替代 <pre><code> -->

{% block code_query_array_contains_using_equalsTo %}

```python
from datetime import datetime
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

reminder1 = datetime(2015, 11, 11, 07, 10, 00)
reminder2 = datetime(2015, 11, 11, 07, 30, 00)

# 如果只查询数组中含有某一个特定的元素可以用 equal_to 函数
query.equal_to('reminders', reminder1)

# 如果查询数组中含有多个元素，则用 contains_all 函数
query.contains_all('reminders', [reminder1, reminder2])
```
{% endblock %}

{% block code_query_array_contains_all %}

```python
from datetime import datetime
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query

reminder1 = datetime(2015, 11, 11, 8, 30, 00)
reminder2 = datetime(2015, 11, 11, 9, 30, 00)

query.contains_all('reminders', [reminder1, reminder2])

# 如果精确查询数组元素（数组元素的数量和顺序必须匹配），则用 equal_to 函数
# 不会匹配列值为 [reminder2, reminder1] 或 [reminder1, reminder2, reminder3] 的记录
query.equal_to('reminders', [reminder1, reminder2])
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}
```python
query.not_contained_in('reminders', [reminder1, reminder2])
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```python
# 找出开头是「早餐」的 Todo
query.startswith("content", "早餐")
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```python
import leancloud

query = leancloud.Query("Comment")
TodoFolder = leancloud.Object.extend('TodoFolder')
todo_folder = TodoFolder.create_without_data('5732a4821ea4930064013bdb')
query.equal_to('targetTodoFolder', todo_folder)
```
{% endblock %}

{% block code_create_tag_object %}

```python
import leancloud

Tag = leancloud.Object.extend('Tag')
tag = Tag()
tag.set('name', '今日必做')
tag.save()
```
{% endblock %}

{% block code_create_family_with_tag %}

```python
import leancloud

Tag = leancloud.Object.extend('Tag')
tag1 = Tag()
tag1.set('name', '今日必做')
tag1.save()

tag2 = Tag()
tag2.set('name', '老婆吩咐')
tag2.save()

tag3 = Tag()
tag3.set('name', '十分重要')
tag3.save()

TodoFolder = leancloud.Object.extend('TodoFolder')
todo_folder = TodoFolder()
todo_folder.set('name', '家庭')
todo_folder.set('priority', 1)

relation = todo_folder.relation('tags')
relation.add(tag1)
relation.add(tag2)
relation.add(tag3)

todo_folder.save()  # 保存到云端
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```python
import leancloud

TodoFolder = leancloud.Object.extend('TodoFolder')
todo_folder = TodoFolder.create_without_data('5735744479bc44005c402c51')

relation = todo_folder.relation('tags')
query = relation.query  # 返回一个 query 对象
query.count()   # 返回第一个 tag 的数量
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```python
import leancloud

Tag = leancloud.Object.extend('Tag')
tag = Tag.create_without_data('573573aec4c9710060f9a575')
query = leancloud.Query('TodoFolder')
query.equal_to('tags', tag)
query.find()
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```python
import leancloud

comment_query = leancloud.Query('Comment')
comment_query.add_descending('createdAt')
comment_query.limit(10)
# 关键代码，用 include 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
comment_query.include('targetTodoFolder')
# 关键代码，同上，会返回 targetAVUser 对应的对象的详细信息，而不仅仅是 objectId
comment_query.include('targetTodoFolder.targetAVUser')
comment_list = comment_query.find()

for comment in comment_list:
    todo_folder = comment.get('targetTodoFolder')  # 返回一个 TodoFolder 的对象
    todo_user = todo_folder.get('targetAVUser') # 返回一个 AVUser 的对象
    todo_name = todo_folder.get('name')
```
{% endblock %}

{% block code_query_find_first_object %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
query.equal_to('priority', 3)
todo_first = query.first()
```
{% endblock %}

{% block code_set_query_limit %}

```python
from datetime import datetime
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
date = datetime.now()

query.less_than('createdAt', date)  # 查询今天之前创建的 Todo
query.limit(10)   # 最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```python
from datetime import datetime
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
date = datetime.now()

query.less_than('createdAt', date)  # 查询今天之前创建的 Todo
query.limit(10)   # 最多返回 10 条结果
query.skip(20)    # 跳过 20 条结果 跳过 20 条结果
```

{% endblock %}

{% block code_query_count %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
query.equal_to('status', 1)
todo_count = query.count()  # 获取输出计数
```

{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```python
import leancloud

inner_query = leancloud.Query('TodoFolder')
inner_query.greater_than('likes', 20)  # 设置内置查询条件

query = leancloud.Query('Comment')
query.matches_query('targetTodoFolder', inner_query)  # 将内嵌查询赋予目标查询
# query.does_not_match_query('targetTodoFolder', inner_query)
# 也可以查询不包含内嵌查询的目标查询
query.find()  # 返回符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
```
{% endblock %}

{% block code_query_select_keys %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query = Todo.query
query.select('title', 'content')
query_list = query.find()

for todo in query_list:
    title = todo.get('title')
    content = todo.get('content')
    # 如果访问没有指定返回的属性（key），则会返回 null
    location = todo.get('location')
```
{% endblock %}

{% block code_query_select_pointer_keys %}

```python
query.select('owner.username')
```

{% endblock %}

{% block code_query_orderby %}
```python
# 按时间，升序排列
query.add_ascending('createdAt')

# 按时间，降序排列
query.add_descending('createdAt')
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```python
query.add_ascending('createdAt')
query.add_descending('priority')
```
{% endblock %}

{% block code_query_where_keys_exist %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
img_url = 'http://www.example.com/avatar.jpg'
img = leancloud.File.create_with_url('avatar.jpg', img_url)
todo = Todo()
todo.set('images', img)
todo.save()  # 存储图片

query = Todo.query
query.exists('images')  # 查询 images 属性不为空的对象
query.does_not_exist('images')  # 查询 images 属性为空的对象
```
{% endblock %}

{% block code_query_with_or %}

```python
import leancloud

Todo = leancloud.Object.extend('Todo')
query1 = Todo.query
query2 = Todo.query

query1.greater_than('priority', 3)
query2.equal_to('status', 1)

# 返回 priority 大于等于 3 或 status 等于 1 的 Todo
query = leancloud.Query.or_(query1,query2)
```
{% endblock %}

{% block code_query_with_and %}

```python
import leancloud
from datetime import datetime

Todo = leancloud.Object.extend('Todo')
query1 = Todo.query
query2 = Todo.query

query1.greater_than_or_equal_to('createdAt', datetime(2016, 11, 13))
query2.less_than('createdAt', datetime(2016, 12, 3))

query = leancloud.Query.and_(query1, query2)
```
{% endblock %}


{% block code_query_by_cql %}

```python
import leancloud

cql_string1 = 'select * from Todo where status = 1'
todo_list = leancloud.Query.do_cloud_query(cql_string1).results

cql_string2 = 'select count(*) from Todo where priority = 0'
todo_count = leancloud.Query.do_cloud_query(cql_string2).count
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```python
import leancloud

cql = " select * from Todo where status = ? and priority = ?"
todo_query = leancloud.Query.do_cloud_query(cql, 1, 4)
todo_list = todo_query.results # 返回符合条件的 todo list
```
{% endblock %}

{% block code_set_cache_policy %}

```python
# Python SDK 暂不支持
```
{% endblock %}


{% block code_query_geoPoint_near %}

```python
import leancloud

leancloud.init("{{appid}}", "{{appkey}}")
query = leancloud.Query('Todo')
point = leancloud.GeoPoint(39.9, 116.4)
query.limit(10)
query.near('whereCreated', point)  # 离这个位置最近的 10 个 Todo 对象
query.find()
```

以上代码的结果将返回与 `point` 这一点按距离排序（由近到远）的对象数组。

<div class="callout callout-info">注意：如果在此之后又使用了 `ascending` 或 `descending` 方法，则按距离排序会被新排序覆盖。但是如果使用 `add_ascending`或`add_descending` 方法，则之前指定的按距离排序的优先级更高。</div>
{% endblock %}

{% block text_platform_geoPoint_notice %}
{% endblock %}

{% block code_query_geoPoint_within %}

```python
query.within_kilometers('whereCreated', point, 10)
```
{% endblock %} code_object_fetch_with_keys

{% block code_send_sms_code_for_loginOrSignup %}

```python
import leancloud

leancloud.cloudfunc.request_sms_code('135********')
```
{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```python
import leancloud

# 填入手机获取的验证码
leancloud.User.signup_or_login_with_mobile_phone('135********', '258794')
```
{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```python
import leancloud

user = leancloud.User()
user.set_username('Tom')
user.set_password('cat!@#123')
user.set_email('tom-test@gmail.com')
user.sign_up()
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```python
import leancloud

user = leancloud.User()
user.login('Tom', 'cat!@#123')
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```python
import leancloud

user = leancloud.User()
user.login_with_mobile_phone('135********', 'cat!@#123')
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```python
import leancloud

user = leancloud.User()
user.request_login_sms_code('135********')
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```python
import leancloud

user = leancloud.User()
user.signup_or_login_with_mobile_phone('135********', '897897')
```
{% endblock %}

{% block code_get_user_properties %}

```python
currentUsername = leancloud.User.get_current().get_username()  
currentEmail =  leancloud.User.get_current().get_email()    
# 请注意，以下代码无法获取密码，无此 get_password() 方法
currentPassword = leancloud.User.get_current().get_password()
```
{% endblock %}

{% block code_set_user_custom_properties %}

```python
leancloud.User.get_current().set('age', 25)
leancloud.User.get_current().save()
```
{% endblock %}

{% block code_update_user_custom_properties %}

```python
leancloud.User.get_current().set('age', 27)
leancloud.User.get_current().save()
```
{% endblock %}

{% block code_reset_password_by_email %}

``` python
leancloud.User.request_password_reset('tom-test@gmail.com')
```
{% endblock %}

{% block code_send_verify_email %}

```python
   //待补充
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

``` python
leancloud.User.request_password_reset_by_sms_code('135********')
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

``` python
# 这部分需要添加 Python SDK 部分的接口，目前还没有
leancloud.User.reset_password_by_sms_code('123456', 'newpassword')
```
{% endblock %}

{% block code_current_user %}

```python
current_user = leancloud.User.get_current()
```
{% endblock %}

{% block code_current_user_logout %}

```python
user.logout()  # 清除缓存用户对象
current_user = leancloud.User.get_current()  # 现在的 current_user 是 null 了
```
{% endblock %}
{% block code_user_isAuthenticated %}

```python
user.is_authenticated() # 验证用户的授权信息是否在有效期内
```
{% endblock %}
{% block code_query_user %}

```python
user_query = leancloud.Query('_leancloud.User')
```
{% endblock %}

{% block text_subclass %}
## 子类化
LeanCloud 希望设计成能让人尽快上手并使用。你可以通过 `{{baseObjectName}}.get()` 方法访问所有的数据。但是在很多现有成熟的代码中，子类化能带来更多优点，诸如简洁、可扩展性以及 IDE 提供的代码自动完成的支持等等。子类化不是必须的，你可以将下列代码转化：

```python
import leancloud

student = leancloud.Object.extend("Student")()
student.set('name', '小明')
student.save()
```

可改写成:

```python
import leancloud

class Student(leancloud.Object):
    pass

student = Student()
student.set('name', '小明')
student.save()
```


### 子类化 `{{baseObjectName}}`

要实现子类化，需要下面几个步骤：

1. 首先声明一个子类继承自 `{{baseObjectName}}`；
2. 子类化时如果有自定义的构造函数，需要在构造函数中调用父类的构造函数。

下面是实现 `Student` 子类化的例子:

```python
import leancloud

class Student(leancloud.Object):
    pass

student = Student()
student.set('name', 'Tom')
student.save()
```

### 访问器、修改器和方法

添加方法到 `{{baseObjectName}}` 的子类有助于封装类的逻辑。你可以将所有跟子类有关的逻辑放到一个地方，而不是分成多个类来分别处理业务逻辑和存储或转换逻辑。

你可以很容易地为 `{{baseObjectName}}` 子类添加访问器和修改器。像平常那样声明字段的`getter` 和 `setter` 方法，但是通过 `{{baseObjectName}}` 的 `get` 和 `set` 方法来实现它们。下面是这个例子为 `Student` 类创建了一个 `content` 的字段：

```python
import leancloud


class Student(leancloud.Object):
    @property
    def content(self):
        # 可以使用 property 装饰器，方便获取属性
        return self.get('content')

    @content.setter
    def content(self, value):
        # 同样可以给对象的 content 增加 setter
        return self.set('content', value)
```

现在你就可以使用 `student.content` 方法来访问 `content` 字段，并通过 `student.content = "blah blah blah"` 来修改它，并且可以通过 IDE 或者 linter 在运行前就可以发现类型错误。

如果你不仅需要一个简单的访问器，而是有更复杂的逻辑，你可以在子类化时定义和实现自己的方法。

### 初始化子类

你可以使用自定义的构造函数来创建子类对象。子类必须定义一个公开的默认构造函数，并且不修改任何父类 `{{baseObjectName}}` 中的字段，这个默认构造函数将会被 SDK 使用来创建子类的强类型的对象。


要创建一个到现有对象的引用，可以使用 `leancloud.Object.create_without_data()`：

```python
import leancloud

Student = leancloud.Object.extend('Student')
student = Student.create_without_data('573a8459df0eea005e6b711c')
student.fetch()
```


### 查询子类

你可以通过对象的 `query` 属性获取特定的子类的查询对象。下面的例子就查询了用户发表的所有微博列表：

```python
import leancloud

query = leancloud.Query('Student')
user_name = leancloud.User.get_current().get_username()
query.equal_to('publeancloud.User', user_name)
student_list = query.find()

for student in student_list:
    # do whatever you want
    pass
```
### User 的子类化

leancloud.User 作为 `{{baseObjectName}}` 的子类，同样允许子类化，你可以定义自己的 User 对象。需要继承 User，并且将子类的 `_class_name` 设为 `'_User'`：

```python
import leancloud

class MyUser(leancloud.User):
    def __init__(self):
        leancloud.User.__init__(self)
        self._class_name = '_User'  # 这里要指定 _class_name 为 _User

    def set_nickname(self, name):
        self.set('nick_name', name)

    def get_nickname(self):
        return self.get('nick_name')
```

{% endblock %}

{% block js_push_guide %}
## Push 通知

通过 Python SDK 也可以向移动设备推送消息。

一个简单例子推送给所有订阅了 `public` 频道的设备：

```python
import leancloud

data = {
    'alert': 'public message',
}
leancloud.push.send(data, channels=['public])
```

这就向订阅了 `public` 频道的设备发送了一条内容为 `public message` 的消息。

如果希望按照某个 `_Installation` 表的查询条件来推送，例如推送给某个 `installationId` 的 Android 设备，可以传入一个 `leancloud.Query` 对象作为 `where` 条件：

```python
import leancloud

query = leancloud.Instalation.query.equal_to('installationId', installationId)
data = {
    'alert': 'public message',
}
leancloud.push.send(data, where=query)
```

此外，如果你觉得 leancloud.Query 太繁琐，也可以写一句 [CQL](./cql_guide.html) 来搞定：

```python
import leancloud

data = {
    'alert': 'public message',
}
leancloud.push.send(data, cql='select * from _Installation where installationId="设备id"')
```

`leancloud.push` 的更多使用信息参考 API 文档 [leancloud.push](http://leancloud.readthedocs.io/zh_CN/latest/#module-leancloud.push)。更多推送的查询条件和格式，请查阅 [消息推送指南](./push_guide.html)。
{% endblock %}

{# 2016-06-07 以下三部分都不适用于 Python，所以清空内容。 #}
{% block text_work_in_background %}{% endblock %}
{% block text_data_protocol %}{% endblock %}
{% block save_eventually %}{% endblock %}


{% block anonymous_user_login %}
```
暂不支持
```
{% endblock %}

{% block anonymous_user_save %}{% endblock %}
