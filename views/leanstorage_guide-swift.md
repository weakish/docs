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
_ = LCCQLClient.execute("insert into TodoFolder(name, priority) values('工作', 1)") { result in
    switch result {
    case .success(let value):
        if let object = value.objects.first {
            print(object)
        }
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block section_saveOptions %}
{% endblock %}

{% block code_quick_save_a_todo %}

```swift
do {
    let todo = LCObject(className: "Todo")
    
    try todo.set("title", value: "工程师周会")
    try todo.set("content", value: "每周工程师会议，周一下午 2 点")
    
    _ = todo.save { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```swift
do {
    let todo = LCObject(className: "Todo")
    
    try todo.set("title", value: "工程师周会")
    try todo.set("content", value: "每周工程师会议，周一下午 2 点")
    
    // 设置 location 的值为「会议室」
    try todo.set("location", value: "会议室")
    
    _ = todo.save { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_save_todo_folder %}

```swift
do {
    let todoFolder = LCObject(className: "TodoFolder")
    
    try todoFolder.set("name", value: "工作")
    try todoFolder.set("priority", value: 1)
    
    _ = todoFolder.save { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_saveoption_query_example %}
```swift
// 暂不支持
```
{% endblock %}

{% macro code_get_todo_by_objectId() %}
```swift
let query = LCQuery(className: "Todo")
let _ = query.get("558e20cbe4b060308e3eb36c") { (result) in
    switch result {
    case .success(object: let object):
        print(object)
    case .failure(error: let error):
        print(error)
    }
}
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```swift
let object = LCObject(className: "Todo", objectId: "558e20cbe4b060308e3eb36c")
_ = object.fetch { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```swift
do {
    let todo = LCObject(className: "Todo")
    
    try todo.set("title", value: "meeting")
    try todo.set("content", value: "monday,14:00")
    try todo.set("location", value: "room")
    
    _ = todo.save { (result) in
        switch result {
        case .success:
            if let objectId = todo.objectId?.stringValue {
                print(objectId)
            }
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```swift
let query = LCQuery(className: "Todo")
_ = query.get("558e20cbe4b060308e3eb36c") { (result) in
    switch result {
    case .success(object: let object):
        if let title = object.get("title")?.stringValue {
            print(title)
        }
        if let objectId = object.objectId?.value {
            print(objectId)
        }
        if let updatedAt = object.updatedAt?.value {
            print(updatedAt)
        }
        if let createdAt = object.createdAt?.value {
            print(createdAt)
        }
    case .failure(error: let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_object_fetch %}
```swift
let object = LCObject(className: "Todo", objectId: "558e20cbe4b060308e3eb36c")
_ = object.fetch { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_object_fetchWhenSave %}
```swift
// 暂不支持
```
{% endblock %}


{% block code_object_fetch_with_keys %}

```swift
// 暂不支持
```
{% endblock %}

{% block code_update_todo_location %}

```swift
do {
    let todo = LCObject(className: "Todo")
    try todo.set("title", value: "meeting")
    try todo.set("content", value: "monday,14:00")
    try todo.set("location", value: "room")
    let _ = todo.save { (result) in
        switch result {
        case .success:
            // handle object
            break
        case .failure(error: let error):
            // handle error
            break
        }
    }
} catch {
    // handle error
}
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```swift
do {
    let todo = LCObject(className: "Todo", objectId: "5c25b986808ca4565ceb5de8")
    try todo.set("content", value: "wednesday,15:30")
    _ = todo.save { (result) in
        switch result {
        case .success:
            break
        case .failure(error: let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```

{% endblock %}

{% block code_update_object_by_cql %}

```swift
_ = LCCQLClient.execute("update TodoFolder set name='家庭' where objectId='575d2c692e958a0059ca3558'") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_atomic_operation_increment %}

```swift
do {
    let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
    try todo.increase("views", by: 1)
    _ = todo.save { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
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
func dateWithString(_ string: String) -> LCDate {
    let dateFormatter = DateFormatter()
    
    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    
    let date = LCDate(dateFormatter.date(from: string)!)
    
    return date
}

func testSetArray() {
    do {
        let todo = LCObject(className: "Todo")
        
        let reminder1 = dateWithString("2015-11-11 07:10:00")
        let reminder2 = dateWithString("2015-11-11 07:20:00")
        let reminder3 = dateWithString("2015-11-11 07:30:00")
        
        try todo.set("reminders", value: [reminder1, reminder2, reminder3])
        
        let result = todo.save()
        assert(result.isSuccess)
        
        let reminder4 = dateWithString("2015-11-11 07:40:00")
        
        try todo.append("reminders", element: reminder4, unique: true)
        
        _ = todo.save { result in
            switch result {
            case .success:
                break
            case .failure(let error):
                print(error)
            }
        }
    } catch {
        print(error)
    }
}
```
{% endblock %}

{% block code_batch_operation %}
```swift
let objects: [LCObject] = []

_ = LCObject.save(objects, completion: { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
})

_ = LCObject.fetch(objects, completion: { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
})

_ = LCObject.delete(objects, completion: { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
})
```
{% endblock %}

{% block code_batch_set_todo_completed %}
```swift
let query = LCQuery(className: "Todo")
_ = query.find { (result) in
    switch result {
    case .success(objects: let objects):
        for object in objects {
            do {
                try object.set("title", value: "work")
            } catch {
                print(error)
            }
        }
        let _ = LCObject.save(objects, completion: { (result) in
            switch result {
            case .success:
                break
            case .failure(error: let error):
                print(error)
            }
        })
    case .failure(error: let error):
        print(error)
    }
}
```
{% endblock %}

{% block text_work_in_background %}
### 后台运行
细心的开发者已经发现，在所有的示例代码中几乎都是用了异步来访问 {{productName}} 云端，如下代码：

```swift
let todo = LCObject(className: "Todo")

_ = todo.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
上述用法都是提供给开发者在主线程调用用来实现后台运行的方法，因此开发者可以放心地在主线程调用这种命名方式的函数。另外，需要强调的是：**回调函数的代码是在主线程执行。**
{% endblock %}

{% block save_eventually %}{% endblock %}

{% block code_delete_todo_by_objectId %}

```swift
let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
_ = todo.delete { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```swift
_ = LCCQLClient.execute("delete from Todo where objectId='558e20cbe4b060308e3eb36c'") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```swift
do {
    let todoFolder = LCObject(className: "TodoFolder")
    
    try todoFolder.set("name", value: "工作")
    try todoFolder.set("priority", value: 1)
    
    assert(todoFolder.save().isSuccess)
    
    let todo1 = LCObject(className: "Todo")
    try todo1.set("title", value: "工程师周会")
    try todo1.set("content", value: "每周工程师会议，周一下午 2 点")
    try todo1.set("location", value: "会议室")
    assert(todo1.save().isSuccess)
    
    let todo2 = LCObject(className: "Todo")
    try todo2.set("title", value: "维护文档")
    try todo2.set("content", value: "每天 16：00 到 18：00 定期维护文档")
    try todo2.set("location", value: "当前工位")
    assert(todo2.save().isSuccess)
    
    let todo3 = LCObject(className: "Todo")
    try todo3.set("title", value: "发布 SDK")
    try todo3.set("content", value: "每周一下午 15：00")
    try todo3.set("location", value: "SA 工位")
    assert(todo3.save().isSuccess)
    
    try todoFolder.insertRelation("containedTodos", object: todo1)
    try todoFolder.insertRelation("containedTodos", object: todo2)
    try todoFolder.insertRelation("containedTodos", object: todo3)
    
    assert(todoFolder.save().isSuccess)
    
    let relation = todoFolder.get("containedTodos") as? LCRelation
    assert(relation != nil)
} catch {
    print(error)
}
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```swift
do {
    let comment = LCObject(className: "Comment")
    
    try comment.set("likes", value: 1)
    try comment.set("content", value: "这个太赞了！楼主，我也要这些游戏，咱们团购么？")
    
    let todoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
    
    try comment.set("targetTodoFolder", value: todoFolder)
    
    assert(comment.save().isSuccess)
} catch {
    print(error)
}
```
{% endblock %}

{% block code_data_type %}

```swift
let number       : LCNumber       = 42
let bool         : LCBool         = true
let string       : LCString       = "foo"
let dictionary   : LCDictionary   = LCDictionary(["name": string, "count": number])
let array        : LCArray        = LCArray([number, bool, string])
let data         : LCData         = LCData()
let date         : LCDate         = LCDate()
let null         : LCNull         = LCNull()
let geoPoint     : LCGeoPoint     = LCGeoPoint(latitude: 45, longitude: -45)
let acl          : LCACL          = LCACL()
let object       : LCObject       = LCObject()
let relation     : LCRelation     = object.relationForKey("elements")
let user         : LCUser         = LCUser()
let file         : LCFile         = LCFile()
let installation : LCInstallation = LCInstallation()
```
{% endblock %}

{% block code_create_geoPoint %}

```swift
let leancloudOffice = LCGeoPoint(latitude: 39.9, longitude: 116.4)
```
{% endblock %}

{% block code_use_geoPoint %}

```swift
do {
    let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
    let leancloudOffice = LCGeoPoint(latitude: 39.9, longitude: 116.4)
    try todo.set("whereCreated", value: leancloudOffice)
} catch {
    print(error)
}
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```swift
do {
    let todoFolder = LCObject(className: "TodoFolder")
    
    try todoFolder.set("name", value: "工作")
    try todoFolder.set("owner", value: LCApplication.default.currentUser)
    try todoFolder.set("priority", value: 1)
    
    let data: Data
    if #available(iOS 11.0, *) {
        data = try NSKeyedArchiver.archivedData(withRootObject: todoFolder, requiringSecureCoding: false)
    } else {
        data = NSKeyedArchiver.archivedData(withRootObject: todoFolder)
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```swift
do {
    let todoFolder = LCObject(className: "TodoFolder")
    
    try todoFolder.set("name", value: "工作")
    try todoFolder.set("owner", value: LCApplication.default.currentUser)
    try todoFolder.set("priority", value: 1)
    
    let data: Data
    if #available(iOS 11.0, *) {
        data = try NSKeyedArchiver.archivedData(withRootObject: todoFolder, requiringSecureCoding: false)
    } else {
        data = NSKeyedArchiver.archivedData(withRootObject: todoFolder)
    }
    
    let newTodoFolder: LCObject? = try NSKeyedUnarchiver.unarchiveTopLevelObjectWithData(data) as? LCObject
} catch {
    print(error)
}
```
{% endblock %}

{% block code_data_protocol_save_date %}
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
do {
    let lcArray = try LCArray(unsafeObject: [1, "abc", ["foo": true]])
} catch {
    print(error)
}
```

`LCArray` 实现了 `ExpressibleByArrayLiteral` 协议。在需要 `LCArray` 的地方，可以直接使用数组字面量：

```swift
let lcArray: LCArray = [LCNumber(1), LCString("abc")]
```

注意：当使用数组字面量构造 `LCArray` 对象时，数组字面量的类型必须是 `[LCType]`。

#### LCDictionary
`LCDictionary` 是 `Dictionary` 类型的封装，它与 `Dictionary` 相互转化的代码如下：

```swift
do {
    let lcDictionary = try LCDictionary(unsafeObject: ["number": 1, "string": "abd", "array": ["foo"]])
} catch {
    print(error)
}
```

`LCDictionary` 实现了 `ExpressibleByDictionaryLiteral` 协议。在需要 `LCDictionary` 的地方，可以直接使用字典字面量：

```swift
let lcDictionary: LCDictionary = ["number": LCNumber(1), "string": LCString("abd")]
```

注意：当使用字典字面量构造 `LCDictionary` 对象时，字典字面量的 value 类型必须是 `LCType`。

#### LCDate
`LCDate` 是 `NSDate` 类型的封装，它与 `NSDate` 相互转化的代码如下：

```swift
let date = Date()
let lcDate = LCDate(date)
let value = lcDate.value
```

{% endblock %}

{% block module_in_app_search %}{% endblock %}

{% block module_in_app_social %}{% endblock %}

{% block text_sns %}{% endblock %}

{% block text_feedback %}{% endblock %}

{% block js_push_guide %}{% endblock %}

{% block code_create_avfile_by_stream_data %}

```swift
if let data = "My work experience".data(using: .utf8) {
    let file = LCFile(payload: .data(data: data))
}
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```swift
if let url = Bundle.main.url(forResource: "LeanCloud", withExtension: "png") {
    let file = LCFile(payload: .fileURL(fileURL: url))
}
```
{% endblock %}

{% block code_create_avfile_from_url %}

```swift
if let url = URL(string: "https://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif") {
    let file = LCFile(url: url)
}

// or use a URL string directly to construct a LCFile instance.
let file = LCFile(url: "https://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif")
```
{% endblock %}

{% block code_upload_file %}

```swift
_ = file.save { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_upload_file_with_progress %}

```swift
_ = file.save(progress: { (progress) in
    print(progress)
}) { (result) in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_file_metadata %}

```swift
if let fileURL = Bundle.main.url(forResource: "LeanCloud", withExtension: "png") {
    let file = LCFile(payload: .fileURL(fileURL: fileURL))
    file.metaData = LCDictionary(["width": 100, "height": 100, "author": "LeanCloud"])
}
```
{% endblock %}

{% block text_download_file_with_progress %}{% endblock %}

{% block code_file_image_thumbnail %}

```swift
// 暂不支持
```

{% endblock %}

{% block code_file_delete %}

```swift
let file = LCFile(url: "https://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif")
if file.save().isSuccess {
    _ = file.delete { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
}
```
{% endblock %}

{% block code_cache_operations_file %}
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
let query = LCQuery(className: "Todo")

query.whereKey("priority", .equalTo(0))

_ = query.find { result in
    switch result {
    case .success(let objects):
        print(objects)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .equalTo(0))
// 如果这样写，下面的条件将覆盖上面的条件，查询只会返回 priority = 1 的结果
query.whereKey("priority", .equalTo(1))

_ = query.find { result in
    switch result {
    case .success(let objects):
        print(objects)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block table_logic_comparison_in_query %}

逻辑操作 | AVQuery 方法|
---|---
等于 | `whereKey("drink", .equalTo("Pepsi"))`
不等于 |  `whereKey("hasFood", .notEqualTo(true))`
大于 | `whereKey("expirationDate", .greaterThan(NSDate()))`
大于等于 | `whereKey("age", .greaterThanOrEqualTo(18))`
小于 | `whereKey("pm25", .lessThan(75))`
小于等于 | `whereKey("count", .lessThanOrEqualTo(10))`
{% endblock %}

{% block code_query_lessThan %}

```swift
query.whereKey("priority", .lessThan(2))
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```swift
query.whereKey("priority", .greaterThanOrEqualTo(2))
```
{% endblock %}

{% block code_query_with_regular_expression %}{% endblock %}

{% block code_query_with_contains_keyword %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("title", .matchedSubstring("李总"))
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-swift">let query = LCQuery(className: "Todo")

query.whereKey("title", .matchedRegularExpression("{{ data.regex() | safe }}, option: nil))
</code></pre>
{% endblock %}

{% block code_query_array_contains_using_equalsTo %}

```swift
let dateFormatter = DateFormatter()

dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
dateFormatter.locale = Locale(identifier: "en_US_POSIX")

let reminder = dateFormatter.date(from: "2015-11-11 08:30:00")!

let query = LCQuery(className: "Todo")

query.whereKey("reminders", .equalTo(reminder))

_ = query.find { (result) in
    switch result {
    case .success(objects: let objects):
        print(objects)
    case .failure(error: let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_array_contains_all %}

```swift
let dateFormatter = DateFormatter()

dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
dateFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX") as Locale

let reminder1 = dateFormatter.date(from: "2015-11-11 08:30:00")!
let reminder2 = dateFormatter.date(from: "2015-11-11 09:30:00")!

let query = LCQuery(className: "Todo")

query.whereKey("reminders", .containedAllIn([reminder1, reminder2]))

_ = query.find({ (result) in
    switch result {
    case .success(objects: let objects):
        print(objects)
    case .failure(error: let error):
        print(error)
    }
})
```
{% endblock %}

{% block code_query_with_containedIn_keyword %}
```swift
query.whereKey("location", .containedIn(["Office", "CoffeeShop"]))
```
{% endblock %}

{% block code_query_with_part_contains_keyword %}
```swift
query.whereKey("reminders", .containedIn([reminder1, reminder2]))
```
{% endblock %}


{% block code_query_with_not_contains_keyword %}
```swift
query.whereKey("reminders", .notContainedIn([reminder1, reminder2]))
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("content", .prefixedBy("早餐"))
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```swift
let query = LCQuery(className: "Comment")

let targetTodoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")

query.whereKey("targetTodoFolder", .equalTo(targetTodoFolder))
```
{% endblock %}

{% block code_create_tag_object %}

```swift
do {
    let tag = LCObject(className: "Tag")
    
    try tag.set("name", value: "今日必做")
    
    assert(tag.save().isSuccess)
} catch {
    print(error)
}
```
{% endblock %}

{% block code_create_family_with_tag %}

```swift
do {
    let tag1 = LCObject(className: "Tag")
    try tag1.set("name", value: "今日必做")
    
    let tag2 = LCObject(className: "Tag")
    try tag2.set("name", value: "老婆吩咐")
    
    let tag3 = LCObject(className: "Tag")
    try tag3.set("name", value: "十分重要")
    
    let todoFolder = LCObject(className: "TodoFolder")
    try todoFolder.set("name", value: "家庭")
    try todoFolder.set("priority", value: 1)
    
    try todoFolder.insertRelation("tags", object: tag1)
    try todoFolder.insertRelation("tags", object: tag2)
    try todoFolder.insertRelation("tags", object: tag3)
    
    assert(todoFolder.save().isSuccess)
} catch {
    print(error)
}
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```swift
let todoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
let realationQuery = todoFolder.relationForKey("tags").query

_ = realationQuery.find { result in
    switch result {
    case .success(let objects):
        print(objects)
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

query.whereKey("tags", .equalTo(tag))

_ = query.find { result in
    switch result {
    case .success(let objects):
        print(objects)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```swift
let query = LCQuery(className: "Comment")

query.whereKey("targetTodoFolder", .included)

query.whereKey("targetTodoFolder.targetAVUser", .included)

query.whereKey("createdAt", .descending)

query.limit = 10

_ = query.find { result in
    switch result {
    case .success(let comments):
        guard let comment = comments.first else { return }
        
        let todoFolder = comment.get("targetTodoFolder") as? LCObject
        
        let user = todoFolder?.get("targetAVUser")
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```swift
let tag = LCObject(className: "Tag", objectId: "5661031a60b204d55d3b7b89")
let innerQuery = LCQuery(className: "TodoFolder")
innerQuery.whereKey("tags", .equalTo(tag))

let query = LCQuery(className: "Comment")
query.whereKey("targetTodoFolder", .matchedQuery(innerQuery))

_ = query.find { result in
    switch result {
    case .success(let comments):
        print(comments)
    case .failure(let error):
        print(error)
    }
}

query.whereKey("targetTodoFolder", .notMatchedQuery(innerQuery))

_ = query.find { result in
    switch result {
    case .success(let comments):
        print(comments)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_find_first_object %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .equalTo(0))

_ = query.getFirst { result in
    switch result {
    case .success(let todo):
        print(todo)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_set_query_limit %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .equalTo(0))
query.limit = 10

_ = query.find { result in
    switch result {
    case .success(let todos):
        print(todos)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_set_skip_for_pager %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("priority", .equalTo(0))

query.limit = 10
query.skip = 20

_ = query.find { result in
    switch result {
    case .success(let todos):
        print(todos)
    case .failure(let error):
        print(error)
    }
}
```

{% endblock %}

{% block code_query_select_keys %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("title", .selected)
query.whereKey("content", .selected)

_ = query.find { result in
    switch result {
    case .success(let todos):
        guard let todo = todos.first else { return }
        
        let title = todo.get("title")
        let content = todo.get("content")
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_query_select_pointer_keys %}

```swift
query.whereKey("owner.username", .selected)
```

{% endblock %}

{% block code_query_count %}

```swift
let query = LCQuery(className: "Todo")

query.whereKey("status", .equalTo(1))

let count = query.count()
```
{% endblock %}

{% block code_query_orderby %}

```swift
query.whereKey("createdAt", .ascending)
query.whereKey("createdAt", .descending)
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```swift
query.whereKey("priority", .ascending)
query.whereKey("createdAt", .descending)
```
{% endblock %}

{% block code_query_with_or %}

```swift
do {
    let priorityQuery = LCQuery(className: "Todo")
    priorityQuery.whereKey("priority", .greaterThanOrEqualTo(3))
    
    let statusQuery = LCQuery(className: "Todo")
    statusQuery.whereKey("status", .equalTo(1))
    
    let titleQuery = LCQuery(className: "Todo")
    titleQuery.whereKey("title", .matchedSubstring("李总"))
    
    let query = try (try priorityQuery.or(statusQuery)).or(titleQuery)
    
    _ = query.find { result in
        switch result {
        case .success(let todos):
            print(todos)
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_query_with_and %}
```swift
do {
    let dateFromString: (String) -> Date? = { string in
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return dateFormatter.date(from: string)
    }
    
    let startDateQuery = LCQuery(className: "Todo")
    startDateQuery.whereKey("createdAt", .greaterThanOrEqualTo(dateFromString("2016-11-13")!))
    
    let endDateQuery = LCQuery(className: "Todo")
    endDateQuery.whereKey("status", .lessThan(dateFromString("2016-12-03")!))
    
    let query = try startDateQuery.and(endDateQuery)
    
    _ = query.find { result in
        switch result {
        case .success(let todos):
            print(todos)
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```
{% endblock %}

{% block code_query_where_keys_exist %}

```swift
query.whereKey("images", .existed)

query.whereKey("images", .notExisted)
```
{% endblock %}

{% block code_query_by_cql %}

```swift
_ = LCCQLClient.execute("select * from Todo where status = 1") { result in
    switch result {
    case .success(let result):
        let todos = result.objects
    case .failure(let error):
        print(error)
    }
}

_ = LCCQLClient.execute("select count(*) from Todo where priority = 0") { result in
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

_ = LCCQLClient.execute(cql, parameters: pvalues) { result in
    switch result {
    case .success(let result):
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

query.whereKey("whereCreated", .locatedNear(point, minimal: nil, maximal: nil))
query.limit = 10

_ = query.find { result in
    switch result {
    case .success(let todos):
        print(todos)
    case .failure(let error):
        print(error)
    }
}
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了排序方法，则按距离排序会被新排序覆盖。**

{% endblock %}

{% block text_platform_geoPoint_notice %}
{% endblock %}

{% block code_query_geoPoint_within %}

```swift
let query = LCQuery(className: "Todo")
let point = LCGeoPoint(latitude: 39.9, longitude: 116.4)
let maximal = LCGeoPoint.Distance(value: 2.0, unit: .kilometer)

query.whereKey("whereCreated", .locatedNear(point, minimal: nil, maximal: maximal))
```
{% endblock %}

{% set sms_guide_url = '[短信服务使用指南](sms-guide.html#注册验证)' %}

{% block code_send_sms_code_for_loginOrSignup %}

```swift
_ = LCSMSClient.requestVerificationCode(mobilePhoneNumber: "Mobile Phone Number") { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```

{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```swift
_ = LCSMSClient.verifyMobilePhoneNumber("Mobile Phone Number", verificationCode: "code", completion: { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
})
```

{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```swift
let randomUser = LCUser()

randomUser.username = LCString("Tom")
randomUser.password = LCString("cat!@#123")

assert(randomUser.signUp().isSuccess)
```
{% endblock %}

{% block code_send_verify_email %}

```swift
_ = LCUser.requestVerificationMail(email: "abc@xyz.com") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```swift
_ = LCUser.logIn(username: "Tom", password: "leancloud") { result in
    switch result {
    case .success(let user):
        print(user)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_with_email_and_password %}

```swift
_ = LCUser.logIn(email: "tom@example.com", password: "leancloud") { result in
    switch result {
    case .success(let user):
        print(user)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```swift
_ = LCUser.logIn(mobilePhoneNumber: "13577778888", password: "leancloud") { result in
    switch result {
    case .success(let user):
        print(user)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```swift
_ = LCUser.requestLoginVerificationCode(mobilePhoneNumber: "13577778888") { result in
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
_ = LCUser.logIn(mobilePhoneNumber: "13577778888", verificationCode: "238825") { result in
    switch result {
    case .success(let user):
        print(user)
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% block code_get_user_properties %}

<div class="callout callout-info">当前版本的 Swift SDK 尚未实现本地的持久化存储， 因此只能在登录成功之后访问 `LCApplication.default.currentUser`。</div>

```swift
if let currentUser = LCApplication.default.currentUser {
    let email = currentUser.email
    let username = currentUser.username
}
```
{% endblock %}

{% block code_set_user_custom_properties %}

```swift
if let currentUser = LCApplication.default.currentUser {
    do {
        try currentUser.set("age", value: "27")
        
        _ = currentUser.save { result in
            switch result {
            case .success:
                break
            case .failure(let error):
                print(error)
            }
        }
    } catch {
        print(error)
    }
}
```
{% endblock %}

{% block code_update_user_custom_properties %}

```swift
if let currentUser = LCApplication.default.currentUser {
    do {
        try currentUser.set("age", value: "25")
        
        _ = currentUser.save { result in
            switch result {
            case .success:
                break
            case .failure(let error):
                print(error)
            }
        }
    } catch {
        print(error)
    }
}
```
{% endblock %}

{% block text_current_user %}

#### 单设备登录

如果想实现在当前设备 A 上登录后，强制令之前在其他设备上的登录失效，可以按照以下方案来实现：

1. 建立一个设备表，记录用户登录信息和当前设备的信息。
2. 设备 A 登录成功后，更新设备表，将当前设备标记为当前用户登录的最新设备。
3. 设备 B 中的应用启动时，检查设备表，发现最新设备不是当前设备，调用 LCUser 的 `logOut` 方法退出登录。

#### 当前用户

当前登录的用户。

```swift
let currentUser = LCApplication.default.currentUser
```

#### SessionToken

所有登录接口调用成功之后，云端会返回一个 SessionToken 给客户端，客户端在发送 HTTP 请求的时候，{{sdk_name}} 会在 HTTP 请求的 Header 里面自动添加上当前用户的 SessionToken 作为这次请求发起者 `{{userObjectName}}` 的身份认证信息。

如果在 {{app_permission_link}} 中勾选了 **密码修改后，强制客户端重新登录**，那么当用户密码再次被修改后，已登录的用户对象就会失效，开发者需要使用更改后的密码重新调用登录接口，使 SessionToken 得到更新，否则后续操作会遇到 [403 (Forbidden)](error_code.html#_403) 的错误。

{% block text_authenticate_via_sessiontoken %}
##### 使用 SessionToken 登录

在没有用户名密码的情况下，客户端可以使用 SessionToken 来登录。常见的使用场景有：

- 应用内根据以前缓存的 SessionToken 登录
- 应用内的某个页面使用 WebView 方式来登录 LeanCloud 
- 在服务端登录后，返回 SessionToken 给客户端，客户端根据返回的 SessionToken 登录。

{% block code_authenticate_via_sessiontoken %}

```swift
_ = LCUser.logIn(sessionToken: "Session Token") { (result) in
    switch result {
    case .success(object: let user):
        print(user)
    case .failure(error: let error):
        print(error)
    }
}
```

{% endblock %}

{{ docs.alert("请避免在外部浏览器使用 URL 来传递 SessionToken，以防范信息泄露风险。") }}
{# 参见 [云引擎 · SDK 调用云函数](leanengine_cloudfunction_guide-node.html#) #}
{% endblock %}

#### 账户锁定

输入错误的密码或验证码会导致用户登录失败。如果在 15 分钟内，同一个用户登录失败的次数大于 6 次，该用户账户即被云端暂时锁定，此时云端会返回错误码 `{"code":1,"error":"登录失败次数超过限制，请稍候再试，或者通过忘记密码重设密码。"}`，开发者可在客户端进行必要提示。

锁定将在最后一次错误登录的 15 分钟之后由云端自动解除，开发者无法通过 SDK 或 REST API 进行干预。在锁定期间，即使用户输入了正确的验证信息也不允许登录。这个限制在 SDK 和云引擎中都有效。

### 重置密码

#### 邮箱重置密码

我们都知道，应用一旦加入账户密码系统，那么肯定会有用户忘记密码的情况发生。对于这种情况，我们为用户提供了一种安全重置密码的方法。

重置密码的过程很简单，用户只需要输入注册的电子邮件地址即可：

{% block code_reset_password_by_email %}

```swift
_ = LCUser.requestPasswordReset(email: "email") { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```

{% endblock %}

密码重置流程如下：

1. 用户输入注册的电子邮件，请求重置密码；
2. {{productName}} 向该邮箱发送一封包含重置密码的特殊链接的电子邮件；
3. 用户点击重置密码链接后，一个特殊的页面会打开，让他们输入新密码；
4. 用户的密码已被重置为新输入的密码。

{{link_to_blog_password_reset}}

{% if node != 'qcloud' and node != 'us' %}
#### 手机号码重置密码

与使用 [邮箱重置密码](#邮箱重置密码) 类似，「手机号码重置密码」使用下面的方法来获取短信验证码：

{% block code_reset_password_by_mobilephoneNumber %}

```swift
_ = LCUser.requestPasswordReset(mobilePhoneNumber: "Mobile Phone Number") { (result) in
    switch result {
    case .success:
        break
    case .failure(error: let error):
        print(error)
    }
}
```

{% endblock %}

注意！用户需要先绑定手机号码，然后使用短信验证码来重置密码：

{% block code_reset_password_by_mobilephoneNumber_verify %}

```swift
_ = LCUser.resetPassword(mobilePhoneNumber: "13577778888", verificationCode: "123456", newPassword: "newpassword") { result in
    switch result {
    case .success:
        break
    case .failure(let error):
        print(error)
    }
}
```
{% endblock %}

{% endif %}

### 登出

当前用户登出。

{% block code_current_user_logout %}

```swift
LCUser.logOut()
```

{% endblock %}

{% endblock %}

{% block code_query_user %}

```swift
let query = LCQuery(className: "_User")
```
{% endblock %}

{% block text_subclass %}
## 子类化

子类化推荐给进阶的开发者在进行代码重构的时候做参考。 你可以用 `LCObject` 访问到所有的数据，用 `get` 方法获取任意字段，用 `set` 方法给任意字段赋值；你也可以使用子类化来封装 `get` 以及 `set` 方法，增强编码体验。 子类化有很多优势，包括减少代码的编写量，具有更好的扩展性，和支持自动补全等等。

### 子类化的实现

要实现子类化，需要下面两个步骤：

1. 继承 `LCObject`；
2. 重载静态方法 `objectClassName`，返回的字符串是原先要传递给 `LCObject(className:)` 初始化方法的参数。如果不实现，默认返回的是类的名字。**请注意：`LCUser` 子类化后必须返回 `_User`**。

下面是实现 Student 子类化的例子：

```swift
class Student: LCObject {
    @objc dynamic var name: LCString?
    override static func objectClassName() -> String {
        return "Student"
    }
}
```

### 将 Setter 以及 Getter 方法封装成属性

可以将 `LCObject` 的 Setter 和 Getter 方法封装成属性，需使用 `@objc dynamic var` 来声明一个变量，**且该变量的类型为 [LCValue](#数据类型)**。

如下所示，两段代码对 name 字段的赋值方式等价。

```swift
// set name from LCObject
do {
    let student = LCObject(className: "Student")
    try student.set("name", value: "小明")
    assert(student.save().isSuccess)
} catch {
    print(error)
}
```
```swift
// set name from Student
let student = Student()
student.name = "小明"
assert(student.save().isSuccess)
```
{% endblock %}

{% block code_pointer_include_todoFolder %}
```swift
let query = LCQuery(className: "Todo")

query.whereKey("objectId", .equalTo("5735aae7c4c9710060fbe8b0"))
query.whereKey("todoFolder", .included)

let todo = query.getFirst().object
let todoFolder = todo?["todoFolder"] as? LCObject
assert(todoFolder != nil)
```
{% endblock %}

{% block anonymous_user_login %}
```
暂不支持
```
{% endblock %}

{% block anonymous_user_save %}{% endblock %}
