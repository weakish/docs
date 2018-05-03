{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_name ="Objective-C" %}
{% set segment_code ="objc" %}
{% set sdk_name ="Objective-C SDK" %}
{% set baseObjectName ="AVObject" %}
{% set objectIdName ="objectId" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="AVRelation" %}
{% set pointerObjectName ="AVPointer" %}
{% set baseQueryClassName ="AVQuery" %}
{% set geoPointObjectName ="AVGeoPoint" %}
{% set userObjectName ="AVUser" %}
{% set fileObjectName ="AVFile" %}
{% set dateType= "NSDate" %}
{% set byteType= "NSData" %}
{% set acl_guide_url = "[Objective-C 权限管理使用指南](acl_guide-objc.html)"%}
{% set sms_guide_url = "[Objective-C 短信服务使用指南](sms-guide.html#注册验证)" %}
{% set inapp_search_guide_url = "[Objective-C 应用内搜索指南](app_search_guide.html)" %}
{% set status_system_guide_url = "[Objective-C 应用内社交模块](status_system.html#iOS_SDK)" %}
{% set sns_guide_url = "[Objective-C SNS 开发指南](sns.html#iOS_SNS_组件)" %}
{% set feedback_guide_url = "[Objective-C 用户反馈指南](feedback.html#iOS_反馈组件)" %}
{% set funtionName_whereKeyHasPrefix = "whereKey:hasPrefix:" %}
{% set saveOptions_query= "query" %}
{% set saveOptions_fetchWhenSave= "fetchWhenSave" %}


{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_create_todo_object %}

```objc
    // objectWithClassName 参数对应控制台中的 Class Name
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];

    // 或调用实例方法创建一个对象
    AVObject *todo = [[AVObject alloc] initWithClassName:@"Todo"];

    // 以上两行代码完全等价
```
{% endblock %}

{% block code_save_object_by_cql %}

```objc
    // 执行 CQL 语句实现新增一个 TodoFolder 对象
    [AVQuery doCloudQueryInBackgroundWithCQL:@"insert into TodoFolder(name, priority) values('工作', 1) " callback:^(AVCloudQueryResult *result, NSError *error) {
        // 如果 error 为空，说明保存成功

    }];
```
{% endblock %}

{% block code_quick_save_a_todo %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];// 只要添加这一行代码，云端就会自动添加这个字段
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_save_todo_folder %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    [todoFolder saveInBackground];// 保存到云端
```
{% endblock %}

{% block code_saveoption_query_example %}

```objc
    NSInteger amount = -100;
    AVObject *account = [[AVQuery queryWithClassName:@"Account"] getFirstObject];

    [account incrementKey:@"balance" byAmount:@(amount)];

    AVQuery *query = [[AVQuery alloc] init];
    [query whereKey:@"balance" greaterThanOrEqualTo:@(-amount)];

    AVSaveOption *option = [[AVSaveOption alloc] init];

    option.query = query;
    option.fetchWhenSave = YES;

    [account saveInBackgroundWithOption:option block:^(BOOL succeeded, NSError * _Nullable error) {
        if (succeeded) {
            NSLog(@"当前余额为：%@", account[@"balance"]);
        } else if (error.code == 305) {
            NSLog(@"余额不足，操作失败！");
        }
    }];
```
{% endblock %}

{% macro code_get_todo_by_objectId() %}
```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c" block:^(AVObject *object, NSError *error) {
        // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
    }];
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```objc
    // 第一个参数是 className，第二个参数是 objectId
    AVObject *todo =[AVObject objectWithClassName:@"Todo" objectId:@"558e20cbe4b060308e3eb36c"];
    [todo fetchInBackgroundWithBlock:^(AVObject *avObject, NSError *error) {
        NSString *title = avObject[@"title"];// 读取 title
        NSString *content = avObject[@"content"]; // 读取 content
    }];
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];// 只要添加这一行代码，云端就会自动添加这个字段
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
            NSLog(@"%@",todo.objectId);// 保存成功之后，objectId 会自动从云端加载到本地
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query getObjectInBackgroundWithId:@"558e20cbe4b060308e3eb36c" block:^(AVObject *object, NSError *error) {
        // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
        int priority = [[object objectForKey:@"priority"] intValue];
        NSString *location = [object objectForKey:@"location"];
        NSString *title = object[@"title"];
        NSString *content = object[@"content"];

        // 获取三个特殊属性
        NSString *objectId = object.objectId;
        NSDate *updatedAt = object.updatedAt;
        NSDate *createdAt = object.createdAt;
    }];
```
{% endblock %}

{% block code_object_fetch %}
```objc
    // 使用已知 objectId 构建一个 AVObject
    AVObject *anotherTodo = [AVObject objectWithClassName:@"Todo" objectId:@"5656e37660b2febec4b35ed7"];
    // 然后调用刷新的方法，将数据从云端拉到本地
    [anotherTodo fetchInBackgroundWithBlock:^(AVObject *object, NSError *error) {
        // 此处调用 fetchInBackgroundWithBlock 和 refreshInBackgroundWithBlock 效果一样。
    }];
```
{% endblock %}

{% block code_object_fetchWhenSave %}
```
    anotherTodo.fetchWhenSave = true;
    [anotherTodo saveInBackground];
```
{% endblock %}


{% block code_object_fetch_with_keys %}

```objc
    AVObject *theTodo = [AVObject objectWithClassName:@"Todo" objectId:@"564d7031e4b057f4f3006ad1"];
    NSArray *keys = [NSArray arrayWithObjects:@"priority", @"location",nil];// 指定刷新的 key 数组
    [theTodo fetchInBackgroundWithKeys:keys block:^(AVObject *object, NSError *error) {
        // theTodo 的 priority 和 location 属性的值就是与云端一致的
        NSString *priority = [object objectForKey:@"priority"];
        NSString *location = object[@"location"];
    }];
```
{% endblock %}

{% block code_update_todo_location %}

```objc
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:@"工程师周会" forKey:@"title"];
    [todo setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo setObject:@"会议室" forKey:@"location"];
    [todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 存储成功
            [todo setObject:@"二楼大会议室" forKey:@"location"];
            [todo saveInBackground];
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }];
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```objc
    // 第一个参数是 className，第二个参数是 objectId
    AVObject *todo =[AVObject objectWithClassName:@"Todo" objectId:@"558e20cbe4b060308e3eb36c"];
    // 修改属性
    [todo setObject:@"每周工程师会议，本周改为周三下午3点半。" forKey:@"content"];
    // 保存到云端
    [todo saveInBackground];
```

{% endblock %}

{% block code_update_object_by_cql %}

```objc
    // 执行 CQL 语句实现更新一个 TodoFolder 对象
    [AVQuery doCloudQueryInBackgroundWithCQL:@"update TodoFolder set name='家庭' where objectId='558e20cbe4b060308e3eb36c'" callback:^(AVCloudQueryResult *result, NSError *error) {
        // 如果 error 为空，说明保存成功

    }];
```
{% endblock %}

{% block code_atomic_operation_increment %}
```objc
    AVObject *theTodo = [AVObject objectWithClassName:@"Todo" objectId:@"564d7031e4b057f4f3006ad1"];
    [theTodo setObject:[NSNumber numberWithInt:0] forKey:@"views"]; //初始值为 0
    [theTodo saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        // 原子增加查看的次数
        [theTodo incrementKey:@"views"];
        // 保存时自动取回云端最新数据
        theTodo.fetchWhenSave = true;

        [theTodo saveInBackground];

        // 也可以使用 incrementKey:byAmount: 来给 Number 类型字段累加一个特定数值。
        [theTodo incrementKey:@"views" byAmount:@(5)];
        [theTodo saveInBackground];
        // 因为使用了 fetchWhenSave 选项，saveInBackground 调用之后，如果成功的话，对象的计数器字段是当前系统最新值。
    }];
```
{% endblock %}

{% block code_atomic_operation_array %}

* `addObject:forKey:`<br>
  `addObjectsFromArray:forKey:`<br>
  将指定对象附加到数组末尾。
* `addUniqueObject:forKey:`<br>
  `addUniqueObjectsFromArray:forKey:`<br>
  如果数组中不包含指定对象，将该对象加入数组，对象的插入位置是随机的。  
* `removeObject:forKey:`<br>
  `removeObjectsInArray:forKey:`<br>
  从数组字段中删除指定对象的所有实例。

{% endblock %}

{% block code_set_array_value %}

```objc
-(NSDate*) getDateWithDateString:(NSString*) dateString{
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    NSDate *date = [dateFormat dateFromString:dateString];
    return date;
}

-(void)addReminders{
    NSDate *reminder1= [self getDateWithDateString:@"2015-11-11 07:10:00"];
    NSDate *reminder2= [self getDateWithDateString:@"2015-11-11 07:20:00"];
    NSDate *reminder3= [self getDateWithDateString:@"2015-11-11 07:30:00"];

    NSArray *reminders =[NSArray arrayWithObjects:reminder1, reminder1,reminder3, nil];// 添加提醒时间

    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo addUniqueObjectsFromArray:reminders forKey:@"reminders"];
    [todo saveInBackground];
}
```
{% endblock %}

{% block code_batch_operation %}

```objc
// 批量创建、更新
+ (BOOL)saveAll:(NSArray *)objects error:(NSError **)error;
+ (void)saveAllInBackground:(NSArray *)objects
              block:(AVBooleanResultBlock)block;

// 批量删除
+ (BOOL)deleteAll:(NSArray *)objects error:(NSError **)error;
+ (void)deleteAllInBackground:(NSArray *)objects
                        block:(AVBooleanResultBlock)block;

// 批量获取
+ (BOOL)fetchAll:(NSArray *)objects error:(NSError **)error;
+ (void)fetchAllInBackground:(NSArray *)objects
                       block:(AVArrayResultBlock)block;                        
```
{% endblock %}

{% block code_batch_set_todo_completed %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *todos = objects;
        for (AVObject *todo in todos) {
            todo[@"status"] = @1;
        }

        [AVObject saveAllInBackground:todos block:^(BOOL succeeded, NSError *error) {
            if (error) {
                // 网络错误
            } else {
                // 保存成功
            }
        }];
    }];
```

{% endblock %}

{% block code_delete_todo_by_objectId %}

```objc
    [todo deleteInBackground];
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```objc
    // 执行 CQL 语句实现删除一个 Todo 对象
    [AVQuery doCloudQueryInBackgroundWithCQL:@"delete from Todo where objectId='558e20cbe4b060308e3eb36c'" callback:^(AVCloudQueryResult *result, NSError *error) {
        // 如果 error 为空，说明保存成功

    }];
```
{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级

    AVObject *todo1 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo1 setObject:@"工程师周会" forKey:@"title"];
    [todo1 setObject:@"每周工程师会议，周一下午2点" forKey:@"content"];
    [todo1 setObject:@"会议室" forKey:@"location"];

    AVObject *todo2 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo2 setObject:@"维护文档" forKey:@"title"];
    [todo2 setObject:@"每天 16：00 到 18：00 定期维护文档" forKey:@"content"];
    [todo2 setObject:@"当前工位" forKey:@"location"];

    AVObject *todo3 = [[AVObject alloc] initWithClassName:@"Todo"];
    [todo3 setObject:@"发布 SDK" forKey:@"title"];
    [todo3 setObject:@"每周一下午 15：00" forKey:@"content"];
    [todo3 setObject:@"SA 工位" forKey:@"location"];

    [AVObject saveAllInBackground:@[todo1,todo2,todo3] block:^(BOOL succeeded, NSError *error) {
        if (error) {
            // 出现错误
        } else {
            // 保存成功
            AVRelation *relation = [todoFolder relationForKey:@"containedTodos"];// 新建一个 AVRelation
            [relation addObject:todo1];
            [relation addObject:todo2];
            [relation addObject:todo3];
            // 上述 3 行代码表示 relation 关联了 3 个 Todo 对象

            [todoFolder saveInBackground];// 保存到云端
        }
    }];
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```objc
    AVObject *comment = [[AVObject alloc] initWithClassName:@"Comment"];// 构建 Comment 对象
    [comment setObject:@1 forKey:@"likes"];// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
    [comment setObject:@"这个太赞了！楼主，我也要这些游戏，咱们团购么？" forKey:@"content"];// 留言的内容

    // 假设已知了被分享的该 TodoFolder 的 objectId 是 5590cdfde4b00f7adb5860c8
    [comment setObject:[AVObject objectWithClassName:@"TodoFolder" objectId:@"5590cdfde4b00f7adb5860c8"] forKey:@"targetTodoFolder"];
    // 以上代码的执行结果是在 comment 对象上有一个名为 targetTodoFolder 属性，它是一个 Pointer 类型，指向 objectId 为 5590cdfde4b00f7adb5860c8 的 TodoFolder
```
{% endblock %}

{% block code_data_type %}
```objc
NSNumber     *boolean    = @(YES);
NSNumber     *number     = [NSNumber numberWithInt:2015];
NSString     *string     = [NSString stringWithFormat:@"%@ 年度音乐排行", number];
NSDate       *date       = [NSDate date];

NSData       *data       = [@"短篇小说" dataUsingEncoding:NSUTF8StringEncoding];
NSArray      *array      = [NSArray arrayWithObjects:
                              string,
                              number,
                              nil];
NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:
                              number, @"数字",
                              string, @"字符串",
                              nil];

AVObject     *object     = [AVObject objectWithClassName:@"DataTypes"];
[object setObject:boolean    forKey:@"testBoolean"];
[object setObject:number     forKey:@"testInteger"];
[object setObject:string     forKey:@"testString"];
[object setObject:date       forKey:@"testDate"];
[object setObject:data       forKey:@"testData"];
[object setObject:array      forKey:@"testArray"];
[object setObject:dictionary forKey:@"testDictionary"];
[object saveInBackground];
```

此外，NSDictionary 和 NSArray 支持嵌套，这样在一个 `AVObject` 中就可以使用它们来储存更多的结构化数据。
{% endblock %}

{% block code_create_geoPoint %}

``` objc
AVGeoPoint *point = [AVGeoPoint geoPointWithLatitude:39.9 longitude:116.4];
```
{% endblock %}

{% block code_use_geoPoint %}
``` objc
[todo setObject:point forKey:@"whereCreated"];
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```objc
    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"工作" forKey:@"name"];// 设置名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级
    [todoFolder setObject:[AVUser currentUser] forKey:@"owner"];// 这里就是一个 Pointer 类型，指向当前登录的用户

    NSMutableDictionary *serializedJSONDictionary = [todoFolder dictionaryForObject];//获取序列化后的字典
    NSError *err;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:serializedJSONDictionary options:0 error:&err];//获取 JSON 数据
    NSString *serializedString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];// 获取 JSON 字符串
    // serializedString 的内容是：{"name":"工作","className":"TodoFolder","priority":1}
```
{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```objc
    NSMutableDictionary *objectDictionary = [NSMutableDictionary dictionaryWithCapacity:10];// 声明一个 NSMutableDictionary
    [objectDictionary setObject:@"工作" forKey:@"name"];
    [objectDictionary setObject:@1 forKey:@"priority"];
    [objectDictionary setObject:@"TodoFolder" forKey:@"className"];

    AVObject *todoFolder = [AVObject objectWithDictionary:objectDictionary];// 由 NSMutableDictionary 转化一个 AVObject

    [todoFolder saveInBackground];// 保存到云端
```
{% endblock %}

{% block code_data_protocol_save_date %}
{% endblock %}

{% block code_create_avfile_by_stream_data %}

```objc
    NSData *data = [@"我的工作经历" dataUsingEncoding:NSUTF8StringEncoding];
    AVFile *file = [AVFile fileWithData:data name:@"resume.txt"];
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```objc
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
    NSString *imagePath = [documentsDirectory stringByAppendingPathComponent:@"LeanCloud.png"];
    NSError *error;
    AVFile *file = [AVFile fileWithLocalPath:imagePath error:&error];
```
{% endblock %}

{% block code_create_avfile_from_url %}
```objc
   AVFile *file =[AVFile fileWithRemoteURL:[NSURL URLWithString:@"http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif"]];
```
{% endblock %}

{% block code_upload_file %}
```objc
    [file uploadWithCompletionHandler:^(BOOL succeeded, NSError *error) {
        NSLog(@"%@", file.url);//返回一个唯一的 Url 地址
    }];
```
{% endblock %}

{% block code_upload_file_with_progress %}

```objc
    [file uploadWithProgress:^(NSInteger percentDone) {
      // 上传进度数据，percentDone 介于 0 和 100。
    } completionHandler:^(BOOL succeeded, NSError *error) {
      // 成功或失败处理...
    }];
```
{% endblock %}

{% block code_file_image_thumbnail %}
```objc
AVFile *file = [AVFile fileWithRemoteURL:[NSURL URLWithString:@"文件-url"]];
[file getThumbnail:YES width:100 height:100 withBlock:^(UIImage *image, NSError *error) {
    // code
}];
```
{% endblock %}

{% block code_file_metadata %}
``` objc
NSError *error = nil;
AVFile *file = [AVFile fileWithLocalPath:@"文件-本地-路径" error:&error];
if (!error) {
	[file.metaData setObject:@(100) forKey:@"width"];
	[file.metaData setObject:@(100) forKey:@"height"];
	[file.metaData setObject:@"LeanCloud" forKey:@"author"];
}
```
{% endblock %}

{% block code_download_file %}
```objc
    [file downloadWithProgress:^(NSInteger percentDone) {
        //下载的进度数据，percentDone 介于 0 和 100。
    } completionHandler:^(NSData *data, NSError *error) {
        // data 就是文件的数据流
    }];
```
{% endblock %}

{% block code_file_delete %}
``` objc
[file deleteWithCompletionHandler:^(BOOL succeeded, NSError *error) {
    // code
}];
```
{% endblock %}

{% block code_cache_operations_file %}

### 清除缓存

`AVFile` 也提供了清除缓存的方法：

``` objc
//清除当前文件缓存
- (void)clearPersistentCache;

//类方法, 清除所有缓存
+ (BOOL)clearAllPersistentCache;
```
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

```objc
AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}

```objc

```
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"priority" equalTo:@0];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *priorityEqualsZeroTodos = objects;// 符合 priority = 0 的 Todo 数组
    }];
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}
```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"priority" equalTo:@0];
    [query whereKey:@"priority" equalTo:@1];
   // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
       ...
    }];
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

```objc
[query whereKey:@"priority" lessThan:@2];
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```objc
[query whereKey:@"priority" greaterThanOrEqualTo:@2];
```

**查询 boolean 值**时，很多开发者会**错误地**使用 0 和 1，正确方法为：

```
[query whereKey:@"booleanTest" equalTo:@(YES)];
```
{% endblock %}

{% block code_query_with_regular_expression %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"title" matchesRegex:@"[\u4e00-\u9fa5]"];
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"title" containsString:@"李总"];
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-objc">  AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
  [query whereKey:@"title" matchesRegex:@"{{ data.regex() | safe }}];    
</code></pre>
{% endblock %}
<!-- 2016-12-29 故意忽略最后一行中字符串的结尾引号，以避免渲染错误。不要使用 markdown 语法来替代 <pre><code> -->

{% block code_query_array_contains_using_equalsTo %}

```objc
-(NSDate*) getDateWithDateString:(NSString*) dateString{
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    NSDate *date = [dateFormat dateFromString:dateString];
    return date;
}
-(void)queryRemindersContains{
    NSDate *reminder= [self getDateWithDateString:@"2015-11-11 08:30:00"];

    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];

    // equalTo: 可以找出数组中包含单个值的对象
    [query whereKey:@"reminders" equalTo:reminder];
}
```
{% endblock %}

{% block code_query_array_contains_all %}

```objc
-(NSDate*) getDateWithDateString:(NSString*) dateString{
    NSDateFormatter *dateFormat = [[NSDateFormatter alloc] init];
    [dateFormat setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
    NSDate *date = [dateFormat dateFromString:dateString];
    return date;
}

-(void)queryRemindersContainsAll{
    NSDate *reminder1= [self getDateWithDateString:@"2015-11-11 08:30:00"];
    NSDate *reminder2= [self getDateWithDateString:@"2015-11-11 09:30:00"];

    // 构建查询时间点数组
    NSArray *reminders =[NSArray arrayWithObjects:reminder1, reminder1, nil];

    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"reminders" containsAllObjectsInArray:reminders];

    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {

    }];
}
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}
```objc
    [query whereKey:@"reminders" notContainedIn:reminders];
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```objc
    // 找出开头是「早餐」的 Todo
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"content" hasPrefix:@"早餐"];
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
    [query whereKey:@"targetTodoFolder" equalTo:[AVObject objectWithClassName:@"TodoFolder" objectId:@"5590cdfde4b00f7adb5860c8"]];
```
{% endblock %}

{% block code_create_tag_object %}

```objc
    AVObject *tag = [[AVObject alloc] initWithClassName:@"Tag"];// 构建对象
    [tag setObject:@"今日必做" forKey:@"name"];// 设置名称
    [tag saveInBackground];
```
{% endblock %}

{% block code_create_family_with_tag %}

```objc
    AVObject *tag1 = [[AVObject alloc] initWithClassName:@"Tag"];// 构建对象
    [tag1 setObject:@"今日必做" forKey:@"name"];// 设置 Tag 名称

    AVObject *tag2 = [[AVObject alloc] initWithClassName:@"Tag"];// 构建对象
    [tag2 setObject:@"老婆吩咐" forKey:@"name"];// 设置 Tag 名称

    AVObject *tag3 = [[AVObject alloc] initWithClassName:@"Tag"];// 构建对象
    [tag3 setObject:@"十分重要" forKey:@"name"];// 设置 Tag 名称


    AVObject *todoFolder = [[AVObject alloc] initWithClassName:@"TodoFolder"];// 构建对象
    [todoFolder setObject:@"家庭" forKey:@"name"];// 设置 Todo 名称
    [todoFolder setObject:@1 forKey:@"priority"];// 设置优先级

    AVRelation *relation = [todoFolder relationForKey:@"tags"];// 新建一个 AVRelation
    [relation addObject:tag1];
    [relation addObject:tag2];
    [relation addObject:tag3];

    [todoFolder saveInBackground];// 保存到云端
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```objc
    AVObject *todoFolder = [AVObject objectWithClassName:@"TodoFolder" objectId:@"5661047dddb299ad5f460166"];
    AVRelation *relation = [todoFolder relationForKey:@"tags"];
    AVQuery *query = [relation query];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
       // objects 是一个 AVObject 的 NSArray，它包含所有当前 todoFolder 的 tags
    }];
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```objc
    AVObject *tag = [AVObject objectWithClassName:@"Tag" objectId:@"5661031a60b204d55d3b7b89"];

    AVQuery *query = [AVQuery queryWithClassName:@"TodoFolder"];

    [query whereKey:@"tags" equalTo:tag];

    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 是一个 AVObject 的 NSArray
        // objects 指的就是所有包含当前 tag 的 TodoFolder
    }];
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```objc
    AVQuery *commentQuery = [AVQuery queryWithClassName:@"Comment"];
    [commentQuery orderByDescending:@"createdAt"];
    commentQuery.limit = 10;
    [commentQuery includeKey:@"targetTodoFolder"];// 关键代码，用 includeKey 告知云端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
    [commentQuery includeKey:@"targetTodoFolder.targetAVUser"];// 关键代码，同上，会返回 targetAVUser 对应的对象的详细信息，而不仅仅是 objectId
    [commentQuery findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
        // comments 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
        for (AVObject *comment in comments) {
            // 并不需要网络访问
            AVObject *todoFolder = [comment objectForKey:@"targetTodoFolder"];
            AVUser *avUser = [todoFolder objectForKey:@"targetAVUser"];
        }
    }];
```
{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```objc
    // 构建内嵌查询
    AVQuery *innerQuery = [AVQuery queryWithClassName:@"TodoFolder"];
    [innerQuery whereKey:@"likes" greaterThan:@20];
    // 将内嵌查询赋予目标查询
    AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
    // 执行内嵌操作
    [query whereKey:@"targetTodoFolder" matchesQuery:innerQuery];
    [query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
        // comments 就是符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
    }];

    // 注意如果要做相反的查询可以使用
    [query whereKey:@"targetTodoFolder" doesNotMatchQuery:innerQuery];
    // 如此做将查询出 likes 小于或者等于 20 的 TodoFolder 的 Comment 对象
```
{% endblock %}

{% block code_query_find_first_object %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"priority" equalTo:@0];
    [query getFirstObjectInBackgroundWithBlock:^(AVObject *object, NSError *error) {
        // object 就是符合条件的第一个 AVObject
    }];
```
{% endblock %}

{% block code_set_query_limit %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    NSDate *now = [NSDate date];
    [query whereKey:@"createdAt" lessThanOrEqualTo:now];//查询今天之前创建的 Todo
    query.limit = 10; // 最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    NSDate *now = [NSDate date];
    [query whereKey:@"createdAt" lessThanOrEqualTo:now];//查询今天之前创建的 Todo
    query.limit = 10; // 最多返回 10 条结果
    query.skip = 20;  // 跳过 20 条结果
```

{% endblock %}

{% block code_query_select_keys %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query selectKeys:@[@"title", @"content"]];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        for(AVObject *avObject in objects){

            NSString *title = avObject[@"title"];// 读取 title
            NSString *content = avObject[@"content"]; // 读取 content

            // 如果访问没有指定返回的属性（key），则会报错，在当前这段代码中访问 location 属性就会报错
            NSString *location = [avObject objectForKey:@"location"];
        }
    }];
```
{% endblock %}

{% block code_query_select_pointer_keys %}

```objc
    [query selectKeys:@[@"owner.username"]];
```

{% endblock %}

{% block code_query_count %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKey:@"status" equalTo:@"1"];
    [query countObjectsInBackgroundWithBlock:^(NSInteger number, NSError *error) {
        if (!error) {
            // 查询成功，输出计数
            NSLog(@"今天完成了 %ld 条待办事项。", number);
        } else {
            // 查询失败
        }
    }];
```
{% endblock %}

{% block code_query_orderby %}
``` objc
// 按时间，升序排列
[query orderByAscending:@"createdAt"];

// 按时间，降序排列
[query orderByDescending:@"createdAt"];
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```objc
[query addAscendingOrder:@"priority"];
[query addDescendingOrder:@"createdAt"];
```
{% endblock %}

{% block code_query_with_or %}
```objc
    AVQuery *priorityQuery = [AVQuery queryWithClassName:@"Todo"];
    [priorityQuery whereKey:@"priority" greaterThanOrEqualTo:[NSNumber numberWithInt:3]];

    AVQuery *statusQuery = [AVQuery queryWithClassName:@"Todo"];
    [statusQuery whereKey:@"status" equalTo:[NSNumber numberWithInt:1]];

    AVQuery *query = [AVQuery orQueryWithSubqueries:[NSArray arrayWithObjects:statusQuery,priorityQuery,nil]];
    [query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
        // 返回 priority 大于等于 3 或 status 等于 1 的 Todo
    }];
```
{% endblock %}

{% block code_query_with_and %}
```objc
NSDate *(^dateFromString)(NSString *string) = ^(NSString *string) {
    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyy-MM-dd"];
    return [dateFormatter dateFromString:string];
};

AVQuery *startDateQuery = [AVQuery queryWithClassName:@"Todo"];
[startDateQuery whereKey:@"createdAt" greaterThanOrEqualTo:dateFromString(@"2016-11-13")];

AVQuery *endDateQuery = [AVQuery queryWithClassName:@"Todo"];
[endDateQuery whereKey:@"createdAt" lessThan:dateFromString(@"2016-12-03")];

AVQuery *query = [AVQuery andQueryWithSubqueries:[NSArray arrayWithObjects:startDateQuery,endDateQuery,nil]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    
}];
```
{% endblock %}

{% block code_query_where_keys_exist %}

```objc
    // 存储一个带有图片的 Todo 到 LeanCloud 云端
    AVFile *aTodoAttachmentImage = [AVFile fileWithURL:@("http://www.zgjm.org/uploads/allimg/150812/1_150812103912_1.jpg")];
    AVObject *todo = [AVObject objectWithClassName:@"Todo"];
    [todo setObject:aTodoAttachmentImage forKey:@"images"];
    [todo setObject:@"记得买过年回家的火车票！！！" forKey:@"content"];
    [todo saveInBackground];

    // 使用非空值查询获取有图片的 Todo
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    [query whereKeyExists:@"images"];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
       // objects 返回的就是有图片的 Todo 集合
    }];

    // 使用空值查询获取没有图片的 Todo
    [query whereKeyDoesNotExist:@"images"];
```
{% endblock %}

{% block code_query_by_cql %}

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where status = 1", @"Todo"];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql callback:^(AVCloudQueryResult *result, NSError *error)
    {
        NSLog(@"results:%@", result.results);
    }];


    cql = [NSString stringWithFormat:@"select count(*) from %@ where priority = 0", @"Todo"];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql callback:^(AVCloudQueryResult *result, NSError *error)
    {
       NSLog(@"count:%lu", (unsigned long)result.count);
    }];
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where status = ? and priority = ?", @"Todo"];
    NSArray *pvalues =  @[@0, @1];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql pvalues:pvalues callback:^(AVCloudQueryResult *result, NSError *error) {
        if (!error) {
            // 操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```
{% endblock %}

{% block code_set_cache_policy %}

```objc
  AVQuery *query = [AVQuery queryWithClassName:@"Post"];
  query.cachePolicy = kAVCachePolicyNetworkElseCache;

  //设置缓存有效期
  query.maxCacheAge = 24*3600;

  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      // 成功找到结果，先找网络再访问磁盘
    } else {
      // 无法访问网络，本次查询结果未做缓存
    }
  }];
```
{% endblock %}

{% block table_cache_policy %}

策略枚举 | 含义及解释|
---|---
`kAVCachePolicyIgnoreCache`| **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
`kAVCachePolicyCacheOnly` |  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVError`。
`kAVCachePolicyCacheElseNetwork` |  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
`kAVCachePolicyNetworkElseCache` | 查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVError`。
<code class="text-nowrap">`kAVCachePolicyCacheThenNetwork`</code> | 查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `findObjects` 同时使用。
{% endblock %}

{% block code_cache_operation %}

* 检查是否存在缓存查询结果：

  ``` objc
  BOOL isInCache = [query hasCachedResult];
  ```

* 删除某一查询的任何缓存结果：

  ``` objc
  [query clearCachedResult];
  ```

* 删除查询的所有缓存结果：

  ``` objc
  [AVQuery clearAllCachedResults];
  ```

* 设定缓存结果的最长时限：

  ``` objc
  query.maxCacheAge = 60 * 60 * 24; // 一天的总秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirstObject` 和 `getObjectInBackground`。
{% endblock %}

{% block code_query_geoPoint_near %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
    AVGeoPoint *point = [AVGeoPoint geoPointWithLatitude:39.9 longitude:116.4];
    query.limit = 10;
    [query whereKey:@"whereCreated" nearGeoPoint:point];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        NSArray<AVObject *> *nearbyTodos = objects;// 离这个位置最近的 10 个 Todo 对象
    }];
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `orderByAscending:` 或 `orderByDescending:` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}
* iOS 8.0 之后，使用定位服务之前，需要调用 `[locationManager requestWhenInUseAuthorization]` 或 `[locationManager requestAlwaysAuthorization]` 来获取用户的「使用期授权」或「永久授权」，而这两个请求授权需要在 `info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationAlwaysUsageDescription` 的键值对，值为开启定位服务原因的描述。SDK 内部默认使用的是「使用期授权」。
{% endblock %}

{% block code_query_geoPoint_within %}

```objc
    [query whereKey:@"whereCreated"  nearGeoPoint:point withinKilometers:2.0];
```
{% endblock %} code_object_fetch_with_keys

{% block code_send_verify_email %}

```objc
    [AVUser requestEmailVerify:@"abc@xyz.com" withBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"请求重发验证邮件成功");
        }
    }];
```
{% endblock %}
{% block code_send_sms_code_for_loginOrSignup %}

```objc
     [AVSMS requestShortMessageForPhoneNumber:@"13577778888" options:nil callback:^(BOOL succeeded, NSError * _Nullable error) {
        // 发送失败可以查看 error 里面提供的信息
    }];
```
{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```objc
    [AVUser signUpOrLoginWithMobilePhoneNumberInBackground:@"13577778888" smsCode:@"123456" block:^(AVUser *user, NSError *error) {
       // 如果 error 为空就可以表示登录成功了，并且 user 是一个全新的用户
    }];
```
{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```objc
    AVUser *user = [AVUser user];// 新建 AVUser 对象实例
    user.username = @"Tom";// 设置用户名
    user.password =  @"cat!@#123";// 设置密码
    user.email = @"tom@leancloud.cn";// 设置邮箱

    [user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            // 注册成功
        } else {
            // 失败的原因可能有多种，常见的是用户名已经存在。
        }
    }];
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```objc
  [AVUser logInWithUsernameInBackground:@"Tom" password:@"cat!@#123" block:^(AVUser *user, NSError *error) {
      if (user != nil) {

      } else {

      }
  }];
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13577778888" password:@"cat!@#123" block:^(AVUser *user, NSError *error) {

    }];
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```objc
    [AVUser requestLoginSmsCode:@"13577778888" withBlock:^(BOOL succeeded, NSError *error) {

    }];
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13577778888" smsCode:@"238825" block:^(AVUser *user, NSError *error) {

    }];
```
{% endblock %}

{% block code_get_user_properties %}

```objc
    NSString *currentUsername = [AVUser currentUser].username;// 当前用户名
    NSString *currentEmail = [AVUser currentUser].email; // 当前用户的邮箱

    // 请注意，以下代码无法获取密码
    NSString *currentPassword = [AVUser currentUser].password;//  currentPassword 是 nil
```
{% endblock %}

{% block code_set_user_custom_properties %}

```objc
    [[AVUser currentUser] setObject:[NSNumber numberWithInt:25] forKey:@"age"];
    [[AVUser currentUser] saveInBackground];
```
{% endblock %}

{% block code_update_user_custom_properties %}

```objc
    [[AVUser currentUser] setObject:[NSNumber numberWithInt:25] forKey:@"age"];
    [[AVUser currentUser] saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        [[AVUser currentUser] setObject:[NSNumber numberWithInt:27] forKey:@"age"];
        [[AVUser currentUser] saveInBackground];
    }];
```
{% endblock %}

{% block code_reset_password_by_email %}

``` objc
[AVUser requestPasswordResetForEmailInBackground:@"myemail@example.com" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

``` objc
[AVUser requestPasswordResetWithPhoneNumber:@"18612340000" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

``` objc
[AVUser resetPasswordWithSmsCode:@"123456" newPassword:@"password" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```
{% endblock %}

{% block code_current_user %}

```objc
  AVUser *currentUser = [AVUser currentUser];
  if (currentUser != nil) {
      // 跳转到首页
  } else {
      //缓存用户对象为空时，可打开用户注册界面…
  }
```
{% endblock %}

{% block code_current_user_logout %}

```objc
  [AVUser logOut];  //清除缓存用户对象
  AVUser *currentUser = [AVUser currentUser]; // 现在的currentUser是nil了
```
{% endblock %}

{% block code_user_isAuthenticated %}

```objc
    [currentUser isAuthenticatedWithSessionToken:@"user-sessionToken-here" callback:^(BOOL succeeded, NSError * _Nullable error) {
        if (succeeded) {
            // 用户的 sessionToken 有效
        }
    }];
```
{% endblock %}

{% block code_query_user %}

```objc
  AVQuery *userQuery = [AVQuery queryWithClassName:@"_User"];
```
{% endblock %}

{% block anonymous_user_login %}
```objc
[AVAnonymousUtils logInWithBlock:^(AVUser *user, NSError *error) {
    if (user && !error) {
        // 登录成功
    } else {
        // 登录失败
    }
}];
```
{% endblock %}

{% block setup_username_and_password_for_anonymous_user %}
```objc
// 获取匿名用户
AVUser *user = [AVUser currentUser];

// 完善匿名用户信息
user.username = @"Tom";
user.password = @"cat!@#123";
user.email    = @"tom@leancloud.cn";

[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        // 用户信息完善成功
    } else {
        // 用户信息完善失败
    }
}];
```
{% endblock %}

{% block text_subclass %}
## 子类化
子类化推荐给进阶的开发者在进行代码重构的时候做参考。
你可以用 `AVObject` 访问到所有的数据，用 `objectForKey:` 获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

```
AVObject *student = [AVObject objectWithClassName:@"Student"];
[student setObject:@"小明" forKey:@"name"];
[student saveInBackground];
```

可改写成:

```
Student *student = [Student object];
student.name = @"小明";
[student saveInBackground];
```

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面几个步骤：

1. 导入 `AVObject+Subclass.h`；
2. 继承 `AVObject` 并实现 `AVSubclassing` 协议；
3. 实现类方法 `parseClassName`，返回的字符串是原先要传给 `initWithClassName:` 的参数，这样后续就不必再进行类名引用了。如果不实现，默认返回的是类的名字。**请注意： `AVUser` 子类化后必须返回 `_User`**；
4. 在实例化子类之前调用 [YourClass registerSubclass]（**在应用当前生命周期中，只需要调用一次**。可在子类的 +load 方法或者 UIApplication 的 -application:didFinishLaunchingWithOptions: 方法里面调用）。

下面是实现 `Student` 子类化的例子:

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property(nonatomic,copy) NSString *name;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic name;

  + (NSString *)parseClassName {
      return @"Student";
  }

  @end


  // AppDelegate.m
  #import <AVOSCloud/AVOSCloud.h>
  #import "Student.h"

  - (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Student registerSubclass];
    [AVOSCloud setApplicationId:appid clientKey:appkey];
  }
```

### 属性

为 `AVObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。用 `AVSubclassing` 可以把所有的相关逻辑放在一起，这样不必再使用不同的类来区分业务逻辑和存储转换逻辑了。

`AVObject` 支持动态 synthesizer，就像 `NSManagedObject` 一样。先正常声明一个属性，只是在 .m 文件中把 `@synthesize` 变成 `@dynamic`。

请看下面的例子是怎么添加一个「年龄」属性：

``` objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property int age;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic age;

  ......
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成：

``` objc
[student setAge:19]
```

**注意：属性名称保持首字母小写！**（错误：`student.Age` 正确：`student.age`）。

`NSNumber` 类型的属性可用 `NSNumber` 或者是它的原始数据类型（`int`、 `long` 等）来实现。例如， `[student objectForKey:@"age"]` 返回的是 `NSNumber` 类型，而实际被设为 `int` 类型。

你可以根据自己的需求来选择使用哪种类型。原始类型更为易用，而 `NSNumber` 支持 `nil` 值，这可以让结果更清晰易懂。

**注意** 子类中，对于 `BOOL` 类型的字段，SDK 在 3.1.3.2 之前会将其保存为 Number 类型，3.1.3.2 之后将其正确保存为 Bool 类型。详情请参考 [这里](ios-macos-faq.html#为什么升级到_3_1_3_2_以上的版本时_BOOL_类型数据保存错误_)。

注意：`AVRelation` 同样可以作为子类化的一个属性来使用，比如：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(retain) AVRelation *friends;
  ......
@end

@implementation Student
@dynamic friends;
  ......
```

另外，值为 Pointer 的实例可用 `AVObject*` 来表示。例如，如果 `Student` 中 `bestFriend` 代表一个指向另一个 `Student` 的键，由于 Student 是一个 AVObject，因此在表示这个键的值的时候，可以用一个 `AVObject*` 来代替：

``` objc
@interface Student : AVUser <AVSubclassing>
@property(nonatomic, strong) AVObject *bestFriend;
 ......
@end

@implementation Student
@dynamic bestFriend;
  ......
```

提示：当需要更新的时候，最后都要记得加上 `[student save]` 或者对应的后台存储函数进行更新，才会同步至服务器。

如果要使用更复杂的逻辑而不是简单的属性访问，可以这样实现:

``` objc
  @dynamic iconFile;

  - (UIImageView *)iconView {
    UIImageView *view = [[UIImageView alloc] initWithImage:kPlaceholderImage];
    view.image = [UIImage imageNamed:self.iconFile];
    return [view autorelease];
  }

```

### 针对 AVUser 子类化的特别说明

假如现在已经有一个基于 `AVUser` 的子类，如上面提到的 `Student`:

``` objc
@interface Student : AVUser<AVSubclassing>
@property (retain) NSString *displayName;
@end


@implementation Student
@dynamic displayName;
+ (NSString *)parseClassName {
    return @"_User";
}
@end
```

登录时需要调用 `Student` 的登录方法才能通过 `currentUser` 得到这个子类:

``` objc
[Student logInWithUsernameInBackground:@"USER_NAME" password:@"PASSWORD" block:^(AVUser *user, NSError *error) {
        Student *student = [Student currentUser];
        student.displayName = @"YOUR_DISPLAY_NAME";
    }];
```

同样需要调用 `[Student registerSubclass];`，确保在其它地方得到的对象是 Student，而非 AVUser 。

### 初始化子类

创建一个子类实例，要使用 `object` 类方法。要创建并关联到已有的对象，请使用 `objectWithObjectId:` 类方法。

### 子类查询

使用类方法 `query` 可以得到这个子类的查询对象。

例如，查询年龄小于 21 岁的学生：

``` objc
  AVQuery *query = [Student query];
  [query whereKey:@"age" lessThanOrEqualTo:@(21)];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      Student *stu1 = [objects objectAtIndex:0];
      // ...
    }
  }];
```
{% endblock %}

{% block code_authenticate_via_sessiontoken %}
```objc
AVUser *currentUser = [AVUser currentUser];
NSString *sessionToken = currentUser.sessionToken;

[AVUser becomeWithSessionTokenInBackground:sessionToken
                                     block:^(AVUser * _Nullable user, NSError * _Nullable error) {
                                         if (!error) {
                                            /* 通过 session token 登录成功 */
                                             NSLog(@"User did login with session token.");
                                         }
                                     }];
```
{% endblock %}

{% block file_as_avatar %}

```objc
AVFile *file = [AVFile fileWithRemoteURL:[NSURL URLWithString: @"http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif"]];
AVObject *todo = [AVObject objectWithClassName:@"Todo"];
[todo setObject:file forKey:@"girl"];
[todo setObject:@"明星" forKey:@"topic"];
[todo saveInBackgroundWithBlock:^(BOOL succeeded, NSError * _Nullable error) {
        
}];
```
{% endblock %}

{% block query_file_as_avatar %}

```objc
AVQuery *query = [AVQuery queryWithClassName:@"Todo"];
[query whereKey:@"topic" equalTo:@"明星"];
[query includeKey:@"girl"];
[query findObjectsInBackgroundWithBlock:^(NSArray * _Nullable objects, NSError * _Nullable error) {
    AVObject *todo = objects[0];
    AVFile *file = [todo objectForKey:@"girl"];
    NSString *url = file.url;
}];
```
{% endblock %}

{% block code_pointer_include_todoFolder %}

```objc
AVObject *todo = [AVObject objectWithClassName:@"Todo" objectId:@"5735aae7c4c9710060fbe8b0"];
[todo fetchInBackgroundWithKeys:@[@"todoFolder"] block:^(AVObject * _Nullable todoObject, NSError * _Nullable error) {
    
    AVObject *todoFolder = [todoObject objectForKey:@"todoFolder"];
    NSLog(@"%@", todoFolder);
    
}];
```
{% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}
