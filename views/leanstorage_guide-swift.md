{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_name ="Swift" %}
{% set segment_code ="swift" %}
{% set sdk_name ="Swift SDK" %}
{% set baseObjectName ="LCObject" %}
{% set objectIdName ="objectId" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="LCRelation" %}
{% set pointerObjectName ="LCPointer" %}
{% set baseQueryClassName ="LCQuery" %}
{% set geoPointObjectName ="LCGeoPoint" %}
{% set userObjectName ="LCUser" %}
{% set fileObjectName ="LCFile" %}
{% set dateType= "NSDate" %}
{% set byteType= "NSData" %}
{% set acl_guide_url = "[Objective-C 权限管理使用指南（Swift 文档待补充）](acl_guide-objc.html)"%}
{% set sms_guide_url = "[Objective-C 短信服务使用指南（Swift 文档待补充）](sms-guide.html#注册验证)" %}
{% set inapp_search_guide_url = "[Objective-C 应用内搜索指南](app_search_guide.html)" %}
{% set status_system_guide_url = "[Objective-C 应用内社交模块](status_system.html#iOS_SDK)" %}
{% set sns_guide_url = "[Objective-C SNS 开发指南](sns.html#iOS_SNS_组件)" %}
{% set feedback_guide_url = "[Objective-C 用户反馈指南](feedback.html#iOS_反馈组件)" %}
{% set funtionName_whereKeyHasPrefix = "whereKey:hasPrefix:" %}
{% set saveOptions_query= "where" %}
{% set saveOptions_fetchWhenSave= "fetch_when_save" %}

{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_create_todo_object %}

```swift
let todo = LCObject(className: "Todo")
```
{% endblock %}

{% block code_save_object_by_cql %}

```swift
// 执行 CQL 语句实现新增一个 TodoFolder 对象
LCCQLClient.execute("insert into TodoFolder(name, priority) values('工作', 1)") { result in
    switch result {
    case .success(let value):
        let todoFolder = value.objects.first
        print(todoFolder)
    case .failure(let error):
        print(error)
    }
}

//https://github.com/leancloud/Swift-Sample-Code/blob/master/Swift-Sample-CodeTests/LCObject%23saveByCQL.swift
```
{% endblock %}

{% block code_quick_save_a_todo %}

```swift
let todo = LCObject(className: "Todo")

todo.set("title", value: "工程师周会")
todo.set("content", value: "每周工程师会议，周一下午 2 点")

todo.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```swift
let todo = LCObject(className: "Todo")

todo.set("title", value: "工程师周会")
todo.set("content", value: "每周工程师会议，周一下午 2 点")

// 设置 location 的值为「会议室」
todo.set("location", value: "会议室")

todo.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_save_todo_folder %}

```swift
let todoFolder = LCObject(className: "TodoFolder")

todoFolder.set("name", value: "工作")
todoFolder.set("priority", value: 1)

todoFolder.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}
{% block section_saveOptions %}{% endblock %}
{% block code_saveoption_query_example %}
// 暂不支持
{% endblock %}

{% macro code_get_todo_by_objectId() %}
```swift
let query = LCQuery(className: "Todo")

query.get("575cf743a3413100614d7d75") { result in
    switch result {
    case .success(let todo):
        print(todo.get("title"))
    case .failure(let error):
        print(error)
    }
}
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")

todo.fetch { result in
    switch result {
    case .success:
        print(todo.get("title"))
        print(todo.get("content"))
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```swift
let todo = LCObject(className: "Todo")

todo.set("title", value: "工程师周会")
todo.set("content", value: "每周工程师会议，周一下午 2 点")
todo.set("location", value: "会议室")

todo.save { result in
    switch result {
    case .success:
        print(todo.objectId)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```swift
let query = LCQuery(className: "Todo")

query.get("558e20cbe4b060308e3eb36c") { result in
    switch result {
    case .success(let todo):
        // 使用 get 方法访问非预定义属性
        let title    = todo.get("title") as! LCString
        let content  = todo.get("content") as! LCString
        let location = todo.get("location") as! LCString

        // 预定义属性可以使用 dot 语法访问
        let objectId  = todo.objectId
        let updatedAt = todo.updatedAt
        let createdAt = todo.createdAt
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block text_refresh_object %}{% endblock %}

{% block code_object_fetch %}

> TODO

{% endblock %}

{% block code_object_fetchWhenSave %}

> TODO

{% endblock %}


{% block code_object_fetch_with_keys %}

let query = LCQuery(className: "Todo")

query.whereKey("objectId", .equalTo("5735aae7c4c9710060fbe8b0"))
query.whereKey("todoFolder", .included)

if
    let todo = query.getFirst().object,
    let todoFolder = todo["todoFolder"] as? LCObject
{
    // Todo folder did fetch.
}

{% endblock %}

{% block code_update_todo_location %}

```swift
let todo = LCObject(className: "Todo")

todo.set("title", value: "工程师周会")
todo.set("content", value: "每周工程师会议，周一下午 2 点")
todo.set("location", value: "会议室")

todo.save { result in
    switch result {
    case .success:
        // 修改 location 属性
        todo.set("location", value: "二楼大会议室")
        // 异步保存修改
        todo.save { _ in }
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")

todo.set("content", value: "每周工程师会议，本周改为周三下午 3 点半")

todo.save { result in
    switch result {
    case .success:
        break // 保存成功
    case .failure(let error):
        print(error)
    }
}
```

{% endblock %}

{% block code_update_object_by_cql %}

```swift
LCCQLClient.execute("update TodoFolder set name='家庭' where objectId='575d2c692e958a0059ca3558'") { result in
    switch result {
    case .success:
        break // 更新成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_atomic_operation_increment %}

```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")

// 递增 views 属性，保存时，服务端会保证原子性
todo.increase("views", by: 1)

todo.save { result in
    switch result {
    case .success:
        break // 更新成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_atomic_operation_array %}

* `append(String, element: LCType)`<br>
  将指定对象附加到数组末尾。
* `append(String, element: LCType, unique: Bool)`<br>
   将指定对象附加到数组末尾，并且可以设置一个 `unique` 的 `bool` 值表示只是确保唯一，不会重复添加
* `append(String, elements: [LCType])`<br>
   将指定对象数组附加到数组末尾。
* `append(String, elements: [LCType], unique: Bool)`<br>
   将指定对象附加到数组末尾，并且可以设置一个 `unique` 的 `bool` 值表示只是确保唯一，不会重复添加
* `remove(String, element: LCType)`<br>
   从数组字段中删除指定的对象。
* `remove(String, elements: [LCType])`<br>
   从数组字段中删除指定的对象数组。

{% endblock %}

{% block code_set_array_value %}

```swift
func dateWithString(string: String) -> LCDate {
    let dateFormatter = NSDateFormatter()

    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")

    let date = LCDate(dateFormatter.dateFromString(string)!)

    return date
}

func testSetArray() {
    let todo = LCObject(className: "Todo")

    let reminder1 = dateWithString("2015-11-11 07:10:00")
    let reminder2 = dateWithString("2015-11-11 07:20:00")
    let reminder3 = dateWithString("2015-11-11 07:30:00")

    todo.set("reminders", value: [reminder1, reminder2, reminder3])

    // 同步地保存，为了示例的简洁，故意忽略了错误检查
    todo.save()

    // 新增一个闹钟时间
    let reminder4 = dateWithString("2015-11-11 07:40:00")

    // 使用 append 方法添加
    todo.append("reminders", element: reminder4, unique: true)

    todo.save { result in
        switch result {
        case .success:
            break // 更新成功
        case .failure(let error):
            print(error)
        }
    }
}
```
{% endblock %}
{% block text_batch_operation %}{% endblock %}
{% block code_batch_operation %}

```swift
暂不支持                    
```
{% endblock %}

{% block code_batch_set_todo_completed %}

```swift
暂不支持
```

{% endblock %}

{% block text_work_in_background %}
### 后台运行
细心的开发者已经发现，在所有的示例代码中几乎都是用了异步来访问 {{productName}} 云端，如下代码：

```swift
let todo = LCObject(className: "Todo")

todo.save { result in
    switch result {
    case .success:
        break // 保存成功
    case .failure(let error):
        print(error)
    }
}
```
上述用法都是提供给开发者在主线程调用用来实现后台运行的方法，因此开发者可以放心地在主线程调用这种命名方式的函数。另外，需要强调的是：**回调函数的代码是在主线程执行。**
{% endblock %}

{% block code_delete_todo_by_objectId %}

```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")

// 调用实例方法删除对象
todo.delete { result in
    switch result {
    case .success:
        break // 删除成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```swift
// 执行 CQL 语句实现删除一个 Todo 对象
LCCQLClient.execute("delete from Todo where objectId='558e20cbe4b060308e3eb36c'") { result in
    switch result {
    case .success:
        break // 删除成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block save_eventually %}{% endblock %}


{% block code_relation_todoFolder_one_to_many_todo %}

```swift
// 以下代码需要同步执行
// 新建一个 TodoFolder 对象
let todoFolder = LCObject(className: "TodoFolder")

todoFolder.set("name", value: "工作")
todoFolder.set("priority", value: 1)

todoFolder.save()

// 新建 3 个 Todo 对象
let todo1 = LCObject(className: "Todo")
todo1.set("title", value: "工程师周会")
todo1.set("content", value: "每周工程师会议，周一下午 2 点")
todo1.set("location", value: "会议室")
todo1.save()

let todo2 = LCObject(className: "Todo")
todo2.set("title", value: "维护文档")
todo2.set("content", value: "每天 16：00 到 18：00 定期维护文档")
todo2.set("location", value: "当前工位")
todo2.save()

let todo3 = LCObject(className: "Todo")
todo3.set("title", value: "发布 SDK")
todo3.set("content", value: "每周一下午 15：00")
todo3.set("location", value: "SA 工位")
todo3.save()

// 使用接口 insertRelation 建立 todoFolder 与 todo1,todo2,todo3 的一对多的关系
todoFolder.insertRelation("containedTodos", object: todo1)
todoFolder.insertRelation("containedTodos", object: todo2)
todoFolder.insertRelation("containedTodos", object: todo3)

todoFolder.save()

// 保存完毕之后，读取 LCRelation 对象
let relation = todoFolder.get("containedTodos") as? LCRelation
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```swift
// 新建一条留言
let comment = LCObject(className: "Comment")

// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
comment.set("likes", value: 1)

// 留言的内容
comment.set("content", value: "这个太赞了！楼主，我也要这些游戏，咱们团购么？")

// 假设已知了被分享的该 TodoFolder 的 objectId 是 5590cdfde4b00f7adb5860c8
let todoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")

// 在 comment 对象上创建一个名为 targetTodoFolder 属性，它是一个 Pointer 类型，指向 objectId 为 5590cdfde4b00f7adb5860c8 的 TodoFolder 对象
comment.set("targetTodoFolder", value: todoFolder)

comment.save()
```
{% endblock %}

{% block code_create_geoPoint %}

```swift
let leancloudOffice = LCGeoPoint(latitude: 39.9, longitude: 116.4)
```
{% endblock %}

{% block code_use_geoPoint %}

```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")

todo.set("whereCreated", value: leancloudOffice)
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```swift
let todoFolder = LCObject(className: "TodoFolder")

todoFolder.set("name", value: "工作")
todoFolder.set("owner", value: LCUser.current)
todoFolder.set("priority", value: 1)

// 将 todoFolder 序列化成 NSData 对象
let data = NSKeyedArchiver.archivedDataWithRootObject(todoFolder)
```
{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```swift
// 将 todoFolder 序列化成 NSData 对象
let data = NSKeyedArchiver.archivedDataWithRootObject(todoFolder)

// 将 data 反序列化成 LCObject 对象
let newTodoFolder = NSKeyedUnarchiver.unarchiveObjectWithData(data) as! LCObject
```
{% endblock %}

{% block code_data_protocol_save_date %}{% endblock %}

{% block code_data_type %}

```swift
let number     : LCNumber     = 42
let bool       : LCBool       = true
let string     : LCString     = "foo"
let object     : LCObject     = LCObject()
let dictionary : LCDictionary = LCDictionary(["name": string, "count": number])
let array      : LCArray      = LCArray([number, bool, string])
let relation   : LCRelation   = object.relationForKey("elements")
let acl        : LCACL        = LCACL()
let point      : LCGeoPoint   = LCGeoPoint(latitude: 45, longitude: -45)
let date       : LCDate       = LCDate()
let data       : LCData       = LCData()
let null       : LCNull       = LCNull()
```
{% endblock %}

{% block section_dataType_largeData %}
{% endblock %}

{% block text_LCType_convert %}
#### LCString
`LCString` 是 `String` 类型的封装，它与 `String` 相互转化的代码如下：

```swift
// 将 String 转化成 LCString
let lcString = LCString("abc")

// 从 LCString 获取 String
let value = lcString.value
```

`LCString` 实现了 `StringLiteralConvertible` 协议。在需要 `LCString` 的地方，可以直接使用字符串字面量：

```swift
let lcString: LCString = "abc"
```

#### LCNumber
`LCNumber` 是 `Double` 类型的封装，它与 `Double` 相互转化的代码如下：

```swift
// 将 Double 转化成 LCNumber
let lcNumber = LCNumber(123)

// 从 LCNumber 获取 Double
let value = lcNumber.value
```

`LCNumber` 实现了 `IntegerLiteralConvertible` 和 `FloatLiteralConvertible` 协议。在需要 `LCNumber` 的地方，可以直接使用数字字面量：

```swift
let lcNumber: LCNumber = 123
```

#### LCArray
`LCArray` 是 `Array` 类型的封装，它与 `Array` 相互转化的代码如下：

```swift
let lcArray = LCArray(unsafeObject: [1, "abc", ["foo": true]])
```

`LCArray` 实现了 `ArrayLiteralConvertible` 协议。在需要 `LCArray` 的地方，可以直接使用数组字面量：

```swift
let lcArray: LCArray = [LCNumber(1), LCString("abc")]
```

注意：当使用数组字面量构造 `LCArray` 对象时，数组字面量的类型必须是 `[LCType]`。

#### LCDate
`LCDate` 是 `NSDate` 类型的封装，它与 `NSDate` 相互转化的代码如下：

```swift
let date = NSDate()

// 将 NSDate 转化成 LCDate
let lcDate = LCDate(date)

// 从 LCDate 获取 NSDate
let value = lcDate.value
```

{% endblock %}

{% block module_file %}{% endblock %}

{% block module_in_app_search %}{% endblock %}

{% block module_in_app_social %}{% endblock %}

{% block code_create_avfile_by_stream_data %}{% endblock %}

{% block text_sns %}{% endblock %}

{% block text_feedback %}{% endblock %}

{% block js_push_guide %}{% endblock %}

{% block code_create_avfile_from_local_path %}{% endblock %}

{% block code_create_avfile_from_url %}{% endblock %}

{% block code_upload_file %}{% endblock %}

{% block code_upload_file_with_progress %}{% endblock %}

{% block code_file_image_thumbnail %}{% endblock %}

{% block code_file_metadata %}{% endblock %}

{% block code_download_file %}{% endblock %}

{% block code_file_delete %}{% endblock %}

{% block code_cache_operations_file %}
{% endblock %}

{% block text_https_access_for_ios9 %}
### iOS 9 适配

iOS 9 默认屏蔽了 HTTP 访问，只支持 HTTPS 访问。LeanCloud 除了文件的 getData 之外的 API 都是支持 HTTPS 访问的。 现有两种方式解决这个问题。

#### 项目中配置访问策略

一是在项目中额外配置一下该接口的访问策略。选择项目的 Info.plist，右击以 Source Code 的方式打开。在 plist -> dict 节点中加入以下文本：

```
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSExceptionDomains</key>
    <dict>
      <key>clouddn.com</key>
      <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <true/>
      </dict>
    </dict>
  </dict>
```

或者在 Target 的 Info 标签中修改配置：

![Info.plist Setting](images/ios_qiniu_http.png)
{% if node != 'qcloud' %}
如果是美国节点，请把上面的 `clouddn.com` 换成 `amazonaws.com`。
{% endif %}
也可以根据项目需要，允许所有的 HTTP 访问，更多可参考 [iOS 9 适配系列教程](https://github.com/ChenYilong/iOS9AdaptationTips)。

#### 启用文件 SSL 域名

另外一种方法是在网站控制台中进入相关的应用，点击上方的设置选项卡，勾选「启用文件 SSL 域名（对应 _File 中存储的文件）」选项。这样便启用了文件 SSL 域名，支持 HTTPS 访问。如图所示：

![File SSL Config](images/ios_file_ssl_config.png)

如果启用文件 SSL 域名前已经保存了许多文件，启用之后，这些文件的 URL 也会跟着变化，来支持 HTTPS 访问。

这两种方式都能解决这个问题。但需要注意的是，实时通信组件 LeanMessage 也用了 AVFile 来保存消息的图片、音频等文件，并且把文件的地址写入到了消息内容中。开启了文件 SSL 域名后，历史消息中的文件地址将不会像控制台里 _File 表那样跟着改变。所以如果使用了实时通信组件并已上线，推荐使用方式一。
{% endblock %}

{% block code_create_query_by_className %}

```swift
let query = LCQuery(className: "Todo")
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}{% endblock %}

{% block code_priority_equalTo_zero_query %}

```swift
// 构建 LCQuery 对象
let query = LCQuery(className: "Todo")

// 查询所有 priority 等于 0 的 Todo
query.whereKey("priority", .EqualTo(0))

// 执行查找
query.find { result in
    switch result {
    case .success(let objects):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .EqualTo(0))
query.whereKey("priority", .EqualTo(1))

// 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
query.find { result in
    switch result {
    case .success(let objects):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block table_logic_comparison_in_query %}

逻辑操作 | AVQuery 方法|
---|---
等于 | `whereKey("drink", .EqualTo("Pepsi"))`
不等于 |  `whereKey("hasFood", .NotEqualTo(true))`
大于 | `whereKey("expirationDate", .GreaterThan(NSDate()))`
大于等于 | `whereKey("age", .GreaterThanOrEqualTo(18))`
小于 | `whereKey("pm25", .LessThan(75))`
小于等于 | `whereKey("count", .LessThanOrEqualTo(10))`
{% endblock %}

{% block code_query_lessThan %}

```swift
query.whereKey("priority", .LessThan(2))
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```swift
query.whereKey("priority", .GreaterThanOrEqualTo(2))
```
{% endblock %}

{% block code_query_with_regular_expression %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("title", .MatchedPattern("[\\u4e00-\\u9fa5]", option:nil))
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("title", .MatchedSubstring("李总"))
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-swift">let query = LCQuery(className: "Todo")

query.whereKey("title", .MatchedPattern("{{ data.regex() | safe }}, option: nil))
</code></pre>
{% endblock %}
<!-- 2016-12-29 故意忽略最后一行中字符串的结尾引号，以避免渲染错误。不要使用 markdown 语法来替代 <pre><code> -->

{% block code_query_array_contains_using_equalsTo %}

```swift
func queryRemindersContains() {
    let dateFormatter = NSDateFormatter()

    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")

    let reminder = dateFormatter.dateFromString("2015-11-11 08:30:00")!

    let query = LCQuery(className: "Todo")

    // 查询 reminders 数组中有与 reminder 相等的 Todo 对象
    query.whereKey("reminders", .EqualTo(reminder))
}
```
{% endblock %}

{% block code_query_array_contains_all %}

```swift
func testArrayContainsAll() {
    let dateFormatter = NSDateFormatter()

    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")

    let reminder1 = dateFormatter.dateFromString("2015-11-11 08:30:00")!
    let reminder2 = dateFormatter.dateFromString("2015-11-11 09:30:00")!
    
    let query = LCQuery(className: "Todo")

    // 查询 reminders 数组中同时包含 reminder1 和 reminder2 的 Todo 对象
    query.whereKey("reminders", .ContainedAllIn([reminder1, reminder2]))
}
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}
```swift
    query.whereKey("reminders", .NotContainedIn([reminder1, reminder2]))
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```swift
// 找出开头是「早餐」的 Todo
let query = LCQuery(className: "Todo")

query.whereKey("content", .PrefixedBy("早餐"))
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```swift
let query = LCQuery(className: "Comment")

let targetTodoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")

query.whereKey("targetTodoFolder", .EqualTo(targetTodoFolder))
```
{% endblock %}

{% block code_create_tag_object %}

```swift
let tag = LCObject(className: "Tag")

tag.set("name", value: "今日必做")

tag.save()
```
{% endblock %}

{% block code_create_family_with_tag %}

```swift
let tag1 = LCObject(className: "Tag")
tag1.set("name", value: "今日必做")

let tag2 = LCObject(className: "Tag")
tag2.set("name", value: "老婆吩咐")

let tag3 = LCObject(className: "Tag")
tag3.set("name", value: "十分重要")

// 新建 TodoFolder 对象
let todoFolder = LCObject(className: "TodoFolder")
todoFolder.set("name", value: "家庭")
todoFolder.set("priority", value: 1)

// 分别将 tag1, tag2, tag3 分别插入到关系中
todoFolder.insertRelation("tags", object: tag1)
todoFolder.insertRelation("tags", object: tag2)
todoFolder.insertRelation("tags", object: tag3)

todoFolder.save()
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```swift
let todoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
let realationQuery = todoFolder.relationForKey("tags").query

realationQuery.find { result in
    switch result {
    case .success(let objects):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```swift
let query = LCQuery(className: "TodoFolder")

let tag = LCObject(className: "Tag", objectId: "5661031a60b204d55d3b7b89")

query.whereKey("tags", .EqualTo(tag))

query.find { result in
    switch result {
    case .success(let objects):
        break // objects 是 tags 数组中包含当前 tag 的 TodoFolder
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```swift
let query = LCQuery(className: "Comment")

// 关键代码，指定云端返回 `targetTodoFolder` 字段所指向的对象的全部数据，而不仅仅是 pointer
query.whereKey("targetTodoFolder", .Included)

// 关键代码，同上，指定云端返回 `targetTodoFolder.targetAVUser` 所指向的对象的全部数据，而不仅仅是 pointer
query.whereKey("targetTodoFolder.targetAVUser", .Included)

query.whereKey("createdAt", .Descending)

query.limit = 10

query.find { result in
    switch result {
    case .success(let comments):
        // comments 是最近的十条评论
        guard let comment = comments.first else { return }

        // targetTodoFolder 字段也有相应数据
        let todoFolder = comment.get("targetTodoFolder") as? LCObject

        // todoFolder 的 targetAVUser 字段也有相应的数据
        let user = todoFolder?.get("targetAVUser")
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```swift
// 将内嵌查询赋予目标查询
let query = LCQuery(className: "Comment")

// 构建内嵌查询
let innerQuery = LCQuery(className: "TodoFolder")
innerQuery.whereKey("likes", .GreaterThan(20))

// 执行内嵌操作
query.whereKey("targetTodoFolder", .MatchedQuery(innerQuery))

query.find { result in
    switch result {
    case .success(let comments):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}

// 注意如果要做相反的查询可以使用（查询 likes 小于等于 20 的 Comment 对象）：
query.whereKey("targetTodoFolder", .NotMatchedQuery(innerQuery))

query.find { result in
    switch result {
    case .success(let comments):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_find_first_object %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .EqualTo(0))

query.getFirst { result in
    switch result {
    case .success(let todo):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_set_query_limit %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .EqualTo(0))
query.limit = 10

query.find { result in
    switch result {
    case .success(let todos):
        break // 查询成功
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_set_skip_for_pager %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .EqualTo(0))

query.limit = 10 // 返回 10 条数据
query.skip = 20 // 跳过 20 条数据

query.find { result in
    switch result {
    case .success(let todos):
        break // 每一页 10 条数据，跳过了 20 条数据，因此获取的是第 3 页的数据
    case .failure(let error):
        print(error)
    }
}
```

{% endblock %}

{% block code_query_select_keys %}

```swift
let query = LCQuery(className: "Todo")

// 指定返回 title 属性
query.whereKey("title", .Selected)

// 指定返回 content 属性
query.whereKey("content", .Selected)

query.find { result in
    switch result {
    case .success(let todos):
        // 每一页 10 条数据，跳过了 20 条数据，因此获取的是第 3 页的数据

        guard let todo = todos.first else { return }

        let title   = todo.get("title") // 读取 title
        let content = todo.get("content") // 读取 content
        
        // 如果访问没有指定返回的属性，会返回 nil
        let location = todo.get("location")
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_count %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("status", .EqualTo(1))

query.count()
```
{% endblock %}

{% block code_query_orderby %}

```swift
// 按时间，升序排列
query.whereKey("createdAt", .Ascending)

// 按时间，降序排列
query.whereKey("createdAt", .Descending)
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```swift
query.whereKey("priority", .Ascending)
query.whereKey("createdAt", .Descending)
```
{% endblock %}

{% block code_query_with_or %}

```swift
let priorityQuery = LCQuery(className: "Todo")
priorityQuery.whereKey("priority", .GreaterThanOrEqualTo(3))

let statusQuery = LCQuery(className: "Todo")
statusQuery.whereKey("status", .EqualTo(1))

let titleQuery = LCQuery(className: "Todo")
titleQuery.whereKey("title", .MatchedSubstring("李总"))

let query = priorityQuery.or(statusQuery).or(titleQuery)

query.find { result in
    switch result {
    case .success(let todos):
        break // 返回 priority 大于等于 3 或 status 等于 1 或 title 包含李总的 Todo
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_with_and %}
```swift

let dateFromString: (String) -> Date? = { string in
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM-dd"
    return dateFormatter.date(from: string)
}

let startDateQuery = LCQuery(className: "Todo")
startDateQuery.whereKey("createdAt", .GreaterThanOrEqualTo(dateFromString("2016-11-13")!)

let endDateQuery = LCQuery(className: "Todo")
endDateQuery.whereKey("status", .LessThan(dateFromString("2016-12-03")!)

let query = startDateQuery.and(endDateQuery)

query.find { result in
    switch result {
    case .success(let todos):
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_where_keys_exist %}

```swift
// 使用非空值查询获取有图片的 Todo
query.whereKey("images", .Existed)

// 使用空值查询获取没有图片的 Todo
query.whereKey("images", .NotExisted)
```
{% endblock %}

{% block code_query_by_cql %}

```swift
LCCQLClient.execute("select * from Todo where status = 1") { result in
    switch result {
    case .success(let result):
        let todos = result.objects
    case .failure(let error):
        print(error)
    }
}

LCCQLClient.execute("select count(*) from Todo where priority = 0") { result in
    switch result {
    case .success(let result):
        let todos = result.objects
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```swift
let cql = "select * from Todo where status = ? and priority = ?"
let pvalues = [0, 1]

LCCQLClient.execute(cql, parameters: pvalues) { result in
    switch result {
    case .success(let result):
        // todos 就是满足条件（status == 0 并且 priority == 1）的 Todo 对象集合
        let todos = result.objects
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_set_cache_policy %}{% endblock %}
{% block text_query_cache_intro %}{% endblock %}
{% block table_cache_policy %}{% endblock %}

{% block code_cache_operation %}{% endblock %}

{% block code_query_geoPoint_near %}

```swift
let query = LCQuery(className: "Todo")
let point = LCGeoPoint(latitude: 39.9, longitude: 116.4)

query.whereKey("whereCreated", .LocatedWithin(point))
query.limit = 10

query.find { result in
    switch result {
    case .success(let todos):
        // 离这个位置最近的 10 个 Todo 对象
        let todos = result.objects
    case .failure(let error):
        print(error)
    }
}
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了排序方法，则按距离排序会被新排序覆盖。**

{% endblock %}

{% block text_platform_geoPoint_notice %}
* iOS 8.0 之后，使用定位服务之前，需要调用 `locationManager.requestWhenInUseAuthorization()` 或 `locationManager.requestAlwaysAuthorization()` 来获取用户的「使用期授权」或「永久授权」，而这两个请求授权需要在 `Info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationAlwaysUsageDescription` 的键值对，值为开启定位服务原因的描述。SDK 内部默认使用的是「使用期授权」。
{% endblock %}

{% block code_query_geoPoint_within %}

```swift
let query = LCQuery(className: "Todo")
let point = LCGeoPoint(latitude: 39.9, longitude: 116.4)
let from  = LCGeoPoint.Distance(value: 1.0, unit: .Kilometer)
let to    = LCGeoPoint.Distance(value: 2.0, unit: .Kilometer)

// 查询离指定 point 距离在 1.0 和 2.0 公里的 Todo
query.whereKey("whereCreated", .LocatedNear(origin: point, from: from, to: to))
```
{% endblock %}

{% set sms_guide_url = '[Objective-C 短信服务使用指南](sms-guide.html#注册验证)' %}

{% block text_send_sms_code_for_loginOrSignup %}{% endblock %}
{% block code_send_sms_code_for_loginOrSignup %}{% endblock %}
{% block code_verify_sms_code_for_loginOrSignup %}{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```swift
let randomUser = LCUser()

randomUser.username = LCString("Tom")
randomUser.password = LCString("cat!@#123")

randomUser.signUp()
```
{% endblock %}

{% block code_send_verify_email %}

```swift
LCUser.requestVerificationMail(email: "abc@xyz.com") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        break
    }
}
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```swift
LCUser.logIn(username: "Tom", password: "leancloud") { result in
    switch result {
    case .success(let user):
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```swift
LCUser.logIn(mobilePhoneNumber: "13577778888", password: "leancloud") { result in
    switch result {
    case .success(let user):
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```swift
LCUser.requestLoginVerificationCode(mobilePhoneNumber: "13577778888") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```swift
LCUser.logIn(mobilePhoneNumber: "13577778888", verificationCode: "238825") { result in
    switch result {
    case .success(let user):
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_get_user_properties %}

<div class="callout callout-info">当前版本的 Swift SDK 尚未实现本地的持久化存储， 因此只能在登录成功之后访问 `LCUser.current`。</div>

```swift
if let currentUser = LCUser.current {
    let email = currentUser.email // 当前用户的邮箱
    let username = currentUser.username // 当前用户名

    // 请注意，以下代码无法获取密码
    let password = currentUser.password
}
```
{% endblock %}

{% block code_set_user_custom_properties %}

```swift
let currentUser = LCUser.current!

// 修改当前用户的年龄
currentUser.set("age", value: "27")

currentUser.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_update_user_custom_properties %}

```swift
let currentUser = LCUser.current!

currentUser.set("age", value: "25")

currentUser.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_reset_password_by_email %}

``` swift
LCUser.requestPasswordReset(email: "myemail@example.com") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

```swift
LCUser.requestPasswordReset(mobilePhoneNumber: "13577778888") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

```swift
LCUser.resetPassword(mobilePhoneNumber: "13577778888", verificationCode: "123456", newPassword: "newpassword") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}
{% block text_current_user %}{% endblock %}
{% block code_current_user %}

```swift
if let currentUser = LCUser.current {
    // 跳转到首页
} else {
    // 缓存用户对象为空时，可打开用户注册界面…
}
```
{% endblock %}

{% block code_current_user_logout %}
{% endblock %}

{% block code_query_user %}

```objc
let query = LCQuery(className: "_User")
```
{% endblock %}

{% block text_subclass %}
## 子类化

子类化推荐给进阶的开发者在进行代码重构的时候做参考。 你可以用 `LCObject` 访问到所有的数据，用 `get` 方法获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

```swift
let student = LCObject(className: "Student")

student.set("name", value: "小明")

student.save()
```

可改写成:

```swift
let student = Student()

student.name = "小明"

student.save()
```

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面两个步骤：

1. 继承 `LCObject`；
2. 重载静态方法 `objectClassName`，返回的字符串是原先要传递给 `LCObject(className:)` 初始化方法的参数。如果不实现，默认返回的是类的名字。**请注意：`LCUser` 子类化后必须返回 `_User`**。

下面是实现 Student 子类化的例子：

```swift
import LeanCloud

class Student: LCObject {
    dynamic var name: LCString?

    override static func objectClassName() -> String {
        return "Student"
    }
}
```

### 属性

为 `LCObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。

自定义属性必须使用 `dynamic var` 来声明，请看下面的例子是怎么添加一个「年龄」属性：


```swift
import LeanCloud

class Student: LCObject {
    dynamic var age: LCNumber?
}
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成：

```swift
student.set("age", value: 19)
```
{% endblock %}

{% block code_pointer_include_todoFolder %}
```swift
let query = LCQuery(className: "Todo")

query.whereKey("objectId", .equalTo("5735aae7c4c9710060fbe8b0"))
query.whereKey("todoFolder", .included)

if
    let todo = query.getFirst().object,
    let todoFolder = todo["todoFolder"] as? LCObject
{
    // Todo folder did fetch.
}
```
{% endblock %}

{% block anonymous_user_login %}
```
暂不支持
```
{% endblock %}

{% block anonymous_user_save %}{% endblock %}
