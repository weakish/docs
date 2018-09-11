{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词，短语所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_name ="Android" %}
{% set segment_code ="android" %}
{% set sdk_name ="Android SDK" %}
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
{% set dateType= "Date" %}
{% set byteType= "byte[]" %}
{% set acl_guide_url= "[Android 权限管理使用指南](acl_guide-android.html)" %}
{% set sms_guide_url = '[短信服务使用指南 · 注册验证](sms-guide.html#注册验证)' %}
{% set inapp_search_guide_url = "[Android 应用内搜索指南](app_search_guide.html)" %}
{% set status_system_guide_url = "[Android 应用内社交模块](status_system.html#Android_SDK)" %}
{% set sns_guide_url = "[Android SNS 开发指南](sns.html#Android_SNS_组件)" %}
{% set feedback_guide_url = "[Android 用户反馈指南](feedback.html#Android_反馈组件)" %}
{% set funtionName_whereKeyHasPrefix = "whereStartsWith()" %}
{% set saveOptions_query= "query" %}
{% set saveOptions_fetchWhenSave= "fetchWhenSave" %}


{# --End--变量定义，主模板使用的单词，短语的定义所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_create_todo_object %}

```java
        // 构造方法传入的参数，对应的就是控制台中的 Class Name
        AVObject todo = new AVObject("Todo");
```
{% endblock %}

{% block code_quick_save_a_todo %}

```java
        AVObject todo = new AVObject("Todo");
        todo.put("title", "工程师周会");
        todo.put("content", "每周工程师会议，周一下午2点");
        todo.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 存储成功
                } else {
                    // 失败的话，请检查网络环境以及 SDK 配置是否正确
                }
            }
        });
```
{% endblock %}

{% block code_save_object_by_cql %}

```java
        // 执行 CQL 语句实现新增一个 TodoFolder 对象
        AVQuery.doCloudQueryInBackground("insert into TodoFolder(name, priority) values('工作', 1)", new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                // 如果 e 为空，说明保存成功
            }
        });
```
{% endblock %}

{% block code_saveoption_query_example %}

```java
    final int amount = -100;
    AVQuery<AVObject> query = new AVQuery<>("Account");
    query.getFirstInBackground(new GetCallback<AVObject>() {
        @Override
        public void done(final AVObject account, AVException e) {
            account.increment("balance", amount);
            AVSaveOption option = new AVSaveOption();
            option.query(new AVQuery<>("Account").whereGreaterThanOrEqualTo("balance", -amount));
            option.setFetchWhenSave(true);
            account.saveInBackground(option, new SaveCallback() {
                @Override
                public void done(AVException e) {
                    if (e == null) {
                        System.out.println("当前余额为：" + account.get("balance"));
                    } else {
                        System.out.println("余额不足，操作失败！");
                    }
                }
            });
        }
    });
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```java
        AVObject todo = new AVObject("Todo");
        todo.put("title", "工程师周会");
        todo.put("content", "每周工程师会议，周一下午2点");
        todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
        todo.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 存储成功
                } else {
                    // 失败的话，请检查网络环境以及 SDK 配置是否正确
                }
            }
        });
```
{% endblock %}

{% block code_save_todo_folder %}

```java
        AVObject todoFolder = new AVObject("TodoFolder");// 构建对象
        todoFolder.put("name", "工作");// 设置名称
        todoFolder.put("priority", 1);// 设置优先级
        todoFolder.saveInBackground();// 保存到服务端
```
{% endblock %}

{% macro code_get_todo_by_objectId() %}
```java
        AVQuery<AVObject> avQuery = new AVQuery<>("Todo");
        avQuery.getInBackground("558e20cbe4b060308e3eb36c", new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
            }
        });
```
{% endmacro %}

{% block code_fetch_todo_by_objectId %}
```java
        // 第一参数是 className,第二个参数是 objectId
        AVObject todo = AVObject.createWithoutData("Todo", "558e20cbe4b060308e3eb36c");
        todo.fetchInBackground(new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                String title = avObject.getString("title");// 读取 title
                String content = avObject.getString("content");// 读取 content
            }
        });
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```java
        final AVObject todo = new AVObject("Todo");
        todo.put("title", "工程师周会");
        todo.put("content", "每周工程师会议，周一下午2点");
        todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
        todo.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 存储成功
                    Log.d(TAG, todo.getObjectId());// 保存成功之后，objectId 会自动从服务端加载到本地
                } else {
                    // 失败的话，请检查网络环境以及 SDK 配置是否正确
                }
            }
        });
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```java
        AVQuery<AVObject> avQuery = new AVQuery<>("Todo");
        avQuery.getInBackground("558e20cbe4b060308e3eb36c", new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // object 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例

                int priority = avObject.getInt("priority");
                String location = avObject.getString("location");
                String title = avObject.getString("title");
                String content = avObject.getString("content");

                // 获取三个特殊属性
                String objectId = avObject.getObjectId();
                Date updatedAt = avObject.getUpdatedAt();
                Date createdAt = avObject.getCreatedAt();
            }
        });
```
{% endblock %}

{% block code_object_fetch %}

```java
        // 假如已知了 objectId 可以用如下的方式构建一个 AVObject
        AVObject anotherTodo = AVObject.createWithoutData("Todo", "5656e37660b2febec4b35ed7");
        // 然后调用刷新的方法，将数据从服务端拉到本地
        anotherTodo.fetchInBackground(new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // 调用 fetchInBackground 和 refreshInBackground 效果是一样的。
            }
        });
```
{% endblock %}

{% block code_update_object_by_cql %}

```java
        // 执行 CQL 语句实现更新一个 TodoFolder 对象
        AVQuery.doCloudQueryInBackground("update TodoFolder set name='家庭' where objectId='558e20cbe4b060308e3eb36c'", new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                // 如果 e 为空，说明保存成功
            }
        });
```
{% endblock %}

{% block code_object_fetchWhenSave %}

```
        todo.setFetchWhenSave(true);// 设置 fetchWhenSave 为 true
        todo.saveInBackground();// 如此
```
{% endblock %}


{% block code_object_fetch_with_keys %}

```java
        AVObject theTodo = AVObject.createWithoutData("Todo", "564d7031e4b057f4f3006ad1");
        String keys = "priority,location";// 指定刷新的 key 字符串
        theTodo.fetchInBackground(keys, new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // theTodo 的 location 和 content 属性的值就是与服务端一致的
                String priority = avObject.getString("priority");
                String location = avObject.getString("location");
            }
        });
```
{% endblock %}

{% block code_update_todo_location %}

```java
        final AVObject todo = new AVObject("Todo");
        todo.put("title", "工程师周会");
        todo.put("content", "每周工程师会议，周一下午2点");
        todo.put("location", "会议室");
        todo.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 存储成功
                    todo.put("location", "二楼大会议室");
                    todo.saveInBackground();
                } else {
                    // 失败的话，请检查网络环境以及 SDK 配置是否正确
                }
            }
        });
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```java
        // 第一参数是 className,第二个参数是 objectId
        AVObject todo = AVObject.createWithoutData("Todo", "558e20cbe4b060308e3eb36c");

        // 修改 content
        todo.put("content","每周工程师会议，本周改为周三下午3点半。");
        // 保存到云端
        todo.saveInBackground();
```

{% endblock %}

{% block code_atomic_operation_increment %}

```java
        final AVObject theTodo = AVObject.createWithoutData("Todo", "564d7031e4b057f4f3006ad1");
        theTodo.put("views", 0);//初始值为 0
        theTodo.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                // 原子增加查看的次数
                theTodo.increment("views");
                theTodo.setFetchWhenSave(true);
                theTodo.saveInBackground();
                // 也可以使用 incrementKey:byAmount: 来给 Number 类型字段累加一个特定数值。
                theTodo.increment("views", 5);
                theTodo.saveInBackground();
                //saveInBackground 调用之后，如果成功的话，对象的计数器字段是当前系统最新值。
            }
        });
```
{% endblock %}

{% block code_atomic_operation_array %}

* `add()`<br>
  将指定对象附加到数组末尾。
* `addUnique()`<br>
  如果数组中不包含指定对象，将该对象加入数组，对象的插入位置是随机的。
* `removeAll()`<br>
  从数组字段中删除指定对象的所有实例。

{% endblock %}

{% block code_set_array_value %}

```java
    Date getDateWithDateString(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = dateFormat.parse(dateString);
        return date;
    }

    void addReminders() {
        Date reminder1 = getDateWithDateString("2015-11-11 07:10:00");
        Date reminder2 = getDateWithDateString("2015-11-11 07:20:00");
        Date reminder3 = getDateWithDateString("2015-11-11 07:30:00");

        AVObject todo = new AVObject("Todo");
        todo.addAllUnique("reminders", Arrays.asList(reminder1, reminder2, reminder3));
        todo.saveInBackground();
    }
```
{% endblock %}

{% block code_batch_operation %}

```java
// 批量创建、更新
saveAll()
saveAllInBackground()

// 批量删除
deleteAll()
deleteAllInBackground()

// 批量获取
fetchall()
fetchAllInBackground()                     
```
{% endblock %}

{% block code_batch_set_todo_completed %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                ArrayList<AVObject> todos = (ArrayList<AVObject>) list;
                for (AVObject todo : list) {
                    todo.put("status", 1);
                }

                AVObject.saveAllInBackground(todos, new SaveCallback() {
                    @Override
                    public void done(AVException e) {
                        if (e != null) {
                            // 出现错误
                        } else {
                            // 保存成功
                        }
                    }
                });
            }
        });
```

{% endblock %}

{% block code_delete_todo_by_objectId %}

```java
        todo.deleteInBackground();
```
{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```java
        final AVObject todoFolder = new AVObject("TodoFolder");// 构建对象
        todoFolder.put("name", "工作");
        todoFolder.put("priority", 1);

        final AVObject todo1 = new AVObject("Todo");
        todo1.put("title", "工程师周会");
        todo1.put("content", "每周工程师会议，周一下午2点");
        todo1.put("location", "会议室");

        final AVObject todo2 = new AVObject("Todo");
        todo2.put("title", "维护文档");
        todo2.put("content", "每天 16：00 到 18：00 定期维护文档");
        todo2.put("location", "当前工位");

        final AVObject todo3 = new AVObject("Todo");
        todo3.put("title", "发布 SDK");
        todo3.put("content", "每周一下午 15：00");
        todo3.put("location", "SA 工位");

        AVObject.saveAllInBackground(Arrays.asList(todo1, todo2, todo3), new SaveCallback() {
            @Override
            public void done(AVException e) {
                AVRelation<AVObject> relation = todoFolder.getRelation("containedTodos");// 新建一个 AVRelation
                relation.add(todo1);
                relation.add(todo2);
                relation.add(todo3);
                // 上述 3 行代码表示 relation 关联了 3 个 Todo 对象

                todoFolder.saveInBackground();
            }
        });
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```java
        AVObject comment = new AVObject("Comment");// 构建 Comment 对象
        comment.put("likes", 1);// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
        comment.put("content", "这个太赞了！楼主，我也要这些游戏，咱们团购么？");// 留言的内容

        // 假设已知了被分享的该 TodoFolder 的 objectId 是 5590cdfde4b00f7adb5860c8
        comment.put("targetTodoFolder", AVObject.createWithoutData("TodoFolder", "5590cdfde4b00f7adb5860c8"));
        // 以上代码就是的执行结果就会在 comment 对象上有一个名为 targetTodoFolder 属性，它是一个 Pointer 类型，指向 objectId 为 5590cdfde4b00f7adb5860c8 的 TodoFolder
```

{% endblock %}

{% block code_data_type %}

```java
        boolean bool = true;
        int number = 2015;
        String string = number + " 年度音乐排行";
        Date date = new Date();

        byte[] data = "短篇小说".getBytes();
        ArrayList<Object> arrayList = new ArrayList<>();
        arrayList.add(number);
        arrayList.add(string);
        HashMap<Object, Object> hashMap = new HashMap<>();
        hashMap.put("数字", number);
        hashMap.put("字符串", string);

        AVObject object = new AVObject("DataTypes");
        object.put("testBoolean", bool);
        object.put("testInteger", number);
        object.put("testDate", date);
        object.put("testData", data);
        object.put("testArrayList", arrayList);
        object.put("testHashMap", hashMap);
        object.saveInBackground();
```

此外，HashMap 和 ArrayList 支持嵌套，这样在一个 `AVObject` 中就可以使用它们来储存更多的结构化数据。
{% endblock %}

{% block code_create_geoPoint %}

``` java
        AVGeoPoint point = new AVGeoPoint(39.9, 116.4);
```
{% endblock %}

{% block code_use_geoPoint %}

``` java
        todo.put("whereCreated", point);
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```java
        AVObject todoFolder = new AVObject("TodoFolder");// 构建对象
        todoFolder.put("name", "工作");// 设置名称
        todoFolder.put("priority", 1);// 设置优先级
        todoFolder.put("owner", AVUser.getCurrentUser());// 这里就是一个 Pointer 类型，指向当前登录的用户
        String serializedString = todoFolder.toString();

```

{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```java
        AVObject deserializedObject = AVObject.parseAVObject(serializedString);
        deserializedObject.saveInBackground();// 保存到服务端
```
{% endblock %}


{% block code_data_protocol_save_date %}{% endblock %}

{% block code_create_avfile_by_stream_data %}

```java
        AVFile file = new AVFile("resume.txt","Working with LeanCloud is great!".getBytes());
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```java
        AVFile file = AVFile.withAbsoluteLocalPath("LeanCloud.png", Environment.getExternalStorageDirectory() + "/LeanCloud.png");
```
{% endblock %}

{% block code_create_avfile_from_url %}

```java
        AVFile file = new AVFile("test.gif", "http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", new HashMap<String, Object>());
```
{% endblock %}

{% block code_upload_file %}

```java
        file.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                Log.d(TAG, file.getUrl());//返回一个唯一的 Url 地址
            }
        });
```
{% endblock %}

{% block code_upload_file_with_progress %}

```java
        file.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                // 成功或失败处理...
            }
        }, new ProgressCallback() {
            @Override
            public void done(Integer integer) {
                // 上传进度数据，integer 介于 0 和 100。
            }
        });
```
{% endblock %}

{% block code_download_file %}

```java
        file.getDataInBackground(new GetDataCallback() {
            @Override
            public void done(byte[] bytes, AVException e) {
                // bytes 就是文件的数据流
            }
        }, new ProgressCallback() {
            @Override
            public void done(Integer integer) {
                // 下载进度数据，integer 介于 0 和 100。
            }
        });
```
{% endblock %}

{% block code_file_image_thumbnail %}
```java
        AVFile file = new AVFile("test.jpg", "文件-url", new HashMap<String, Object>());
        file.getThumbnailUrl(true, 100, 100);
```
{% endblock %}

{% block code_file_metadata %}
``` java
        AVFile file = AVFile.withAbsoluteLocalPath("test.jpg", Environment.getExternalStorageDirectory() + "/xxx.jpg");
        file.addMetaData("width", 100);
        file.addMetaData("height", 100);
        file.addMetaData("author", "LeanCloud");
        file.saveInBackground();
```
{% endblock %}

{% block code_file_delete %}

``` java
        file.deleteInBackground(new DeleteCallback() {
            @Override
            public void done(AVException e) {

            }
        });
```
{% endblock %}

{% block code_cache_operations_file %}{% endblock %}

{% block code_create_query_by_className %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}

```java

```
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereEqualTo("priority", 0);
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                List<AVObject> priorityEqualsZeroTodos = list;// 符合 priority = 0 的 Todo 数组
            }
        });
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereEqualTo("priority", 0);
        query.whereEqualTo("priority", 1);
        // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                ...
            }
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

```java
        query.whereLessThan("priority", 2);
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```java
        query.whereGreaterThanOrEqualTo("priority", 2);
```
{% endblock %}

{% block code_query_with_regular_expression %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereMatches("title","[\\u4e00-\\u9fa5]");
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereContains("title", "李总");
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}
<pre><code class="lang-java">        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereMatches("title","{{ data.regex() | safe }});
</code></pre>
{% endblock %}
<!-- 2016-12-29 故意忽略最后一行中字符串的结尾引号，以避免渲染错误。不要使用 markdown 语法来替代 <pre><code> -->

{% block code_query_array_contains_using_equalsTo %}

```java
    Date getDateWithDateString(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = dateFormat.parse(dateString);
        return date;
    }

    void queryRemindersContains() {
        Date reminder = getDateWithDateString("2015-11-11 08:30:00");

        AVQuery<AVObject> query = new AVQuery<>("Todo");

        // equalTo: 可以找出数组中包含单个值的对象
        query.whereEqualTo("reminders", reminder);
    }
```
{% endblock %}

{% block code_query_array_contains_all %}

```java
    Date getDateWithDateString(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = dateFormat.parse(dateString);
        return date;
    }

    void queryRemindersWhereEqualTo() {
        Date reminder1 = getDateWithDateString("2015-11-11 08:30:00");
        Date reminder2 = getDateWithDateString("2015-11-11 09:30:00");

        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereContainsAll("reminders", Arrays.asList(reminder1, reminder2));

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {

            }
        });
    }
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}
```java
        query.whereNotContainedIn("reminders", Arrays.asList(reminder1, reminder2));
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```java
        // 找出开头是「早餐」的 Todo
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereStartsWith("content", "早餐");
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Comment");
        query.whereEqualTo("targetTodoFolder", AVObject.createWithoutData("TodoFolder", "5590cdfde4b00f7adb5860c8"));
```
{% endblock %}

{% block code_create_tag_object %}

```java
        AVObject tag = new AVObject("Tag");// 构建对象
        tag.put("name", "今日必做");// 设置名称
        tag.saveInBackground();
```
{% endblock %}

{% block code_create_family_with_tag %}

```java
        AVObject tag1 = new AVObject("Tag");// 构建对象
        tag1.put("name", "今日必做");// 设置 Tag 名称

        AVObject tag2 = new AVObject("Tag");// 构建对象
        tag2.put("name", "老婆吩咐");// 设置 Tag 名称

        AVObject tag3 = new AVObject("Tag");// 构建对象
        tag3.put("name", "十分重要");// 设置 Tag 名称

        AVObject todoFolder = new AVObject("TodoFolder");// 构建对象
        todoFolder.put("name", "家庭");// 设置 Todo 名称
        todoFolder.put("priority", 1);// 设置优先级

        AVRelation<AVObject> relation = todoFolder.getRelation("tags");
        relation.add(tag1);
        relation.add(tag2);
        relation.add(tag3);

        todoFolder.saveInBackground();// 保存到云端
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```java
        AVObject todoFolder = AVObject.createWithoutData("TodoFolder", "5661047dddb299ad5f460166");
        AVRelation<AVObject> relation = todoFolder.getRelation("tags");
        AVQuery<AVObject> query = relation.getQuery();
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是一个 AVObject 的 List，它包含所有当前 todoFolder 的 tags
            }
        });
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```java
        AVObject tag = AVObject.createWithoutData("Tag", "5661031a60b204d55d3b7b89");
        AVQuery<AVObject> query = new AVQuery<>("TodoFolder");
        query.whereEqualTo("tags", tag);
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是一个 AVObject 的 List
                // list 指的就是所有包含当前 tag 的 TodoFolder
            }
        });
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```java
        AVQuery<AVObject> commentQuery = new AVQuery<>("Comment");
        commentQuery.orderByDescending("createdAt");
        commentQuery.limit(10);
        commentQuery.include("targetTodoFolder");// 关键代码，用 include 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
        commentQuery.include("targetTodoFolder.targetAVUser");// 关键代码，同上，会返回 targetAVUser 对应的对象的详细信息，而不仅仅是 objectId
        commentQuery.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
                for (AVObject comment : list) {
                    // 并不需要网络访问
                    AVObject todoFolder = comment.getAVObject("targetTodoFolder");
                    AVUser avUser = todoFolder.getAVUser("targetAVUser");
                }
            }
        });
```
{% endblock %}

{% block code_query_find_first_object %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereEqualTo("priority",0);
        query.getFirstInBackground(new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // object 就是符合条件的第一个 AVObject
            }
        });
```
{% endblock %}

{% block code_set_query_limit %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        Date now = new Date();
        query.whereLessThanOrEqualTo("createdAt", now);//查询今天之前创建的 Todo
        query.limit(10);// 最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        Date now = new Date();
        query.whereLessThanOrEqualTo("createdAt", now);//查询今天之前创建的 Todo
        query.limit(10);// 最多返回 10 条结果
        query.skip(20);// 跳过 20 条结果
```

{% endblock %}

{% block code_query_count %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereEqualTo("status", 0);
        query.countInBackground(new CountCallback() {
            @Override
            public void done(int i, AVException e) {
                if (e == null) {
                    // 查询成功，输出计数
                    Log.d(TAG, "今天完成了" + i + "条待办事项。");
                } else {
                    // 查询失败
                }
            }
        });
```

{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```java
        // 构建内嵌查询
        AVQuery<AVObject> innerQuery = new AVQuery<>("TodoFolder");
        innerQuery.whereGreaterThan("likes", 20);
        // 将内嵌查询赋予目标查询
        AVQuery<AVObject> query = new AVQuery<>("Comment");
        // 执行内嵌操作
        query.whereMatchesQuery("targetTodoFolder", innerQuery);
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 就是符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
            }
        });

        // 注意如果要做相反的查询可以使用
        query.whereDoesNotMatchQuery("targetTodoFolder", innerQuery);
        // 如此做将查询出 likes 小于或者等于 20 的 TodoFolder 的 Comment 对象
```
{% endblock %}

{% block code_query_select_keys %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.selectKeys(Arrays.asList("title", "content"));
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                for (AVObject avObject : list) {
                    String title = avObject.getString("title");
                    String content = avObject.getString("content");

                    // 如果访问没有指定返回的属性（key），则会报错，在当前这段代码中访问 location 属性就会报错
                    String location = avObject.getString("location");
                }
            }
        });
```
{% endblock %}

{% block code_query_select_pointer_keys %}

```java
    query.selectKeys(Arrays.asList("owner.username"));
```

{% endblock %}


{% block code_query_orderby %}
``` java
        // 按时间，升序排列
        query.orderByAscending("createdAt");

        // 按时间，降序排列
        query.orderByDescending("createdAt");
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```java
        query.addAscendingOrder("priority");
        query.addDescendingOrder("createdAt");
```
{% endblock %}

{% block code_query_where_keys_exist %}

```java
        // 存储一个带有图片的 Todo 到 LeanCloud 云端
        AVFile aTodoAttachmentImage = new AVFile("test.jpg", "http://www.zgjm.org/uploads/allimg/150812/1_150812103912_1.jpg", new HashMap<String, Object>());
        AVObject todo = new AVObject("Todo");
        todo.put("images", aTodoAttachmentImage);
        todo.put("content", "记得买过年回家的火车票！！！");
        todo.saveInBackground();

        // 使用非空值查询获取有图片的 Todo
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        query.whereExists("images");
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 返回的就是有图片的 Todo 集合
            }
        });

        // 使用空值查询获取没有图片的 Todo
        query.whereDoesNotExist("images");

```
{% endblock %}

{% block code_query_with_or %}

```java
        final AVQuery<AVObject> priorityQuery = new AVQuery<>("Todo");
        priorityQuery.whereGreaterThanOrEqualTo("priority", 3);

        final AVQuery<AVObject> statusQuery = new AVQuery<>("Todo");
        statusQuery.whereEqualTo("status", 1);

        AVQuery<AVObject> query = AVQuery.or(Arrays.asList(priorityQuery, statusQuery));
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // 返回 priority 大于等于3 或 status 等于 1 的 Todo
            }
        });
```
{% endblock %}

{% block code_query_with_and %}
```java
    Date getDateWithDateString(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Date date = dateFormat.parse(dateString);
        return date;
    }

    final AVQuery<AVObject> startDateQuery = new AVQuery<>("Todo");
    startDateQuery.whereGreaterThanOrEqualTo("createdAt", getDateWithDateString("2016-11-13"));

    final AVQuery<AVObject> endDateQuery = new AVQuery<>("Todo");
    endDateQuery.whereLessThan("createdAt", getDateWithDateString("2016-12-03"));

    AVQuery<AVObject> query = AVQuery.and(Arrays.asList(startDateQuery, endDateQuery));
    query.findInBackground(new FindCallback<AVObject>() {
        @Override
        public void done(List<AVObject> list, AVException e) {

        }
    });
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```java
        // 执行 CQL 语句实现删除一个 Todo 对象
        AVQuery.doCloudQueryInBackground("delete from Todo where objectId='558e20cbe4b060308e3eb36c'", new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                // 如果 e 为空，说明保存成功
            }
        });
```
{% endblock %}

{% block code_query_by_cql %}

```java
        String cql = "select * from Todo where status = 1";
        AVQuery.doCloudQueryInBackground(cql, new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                avCloudQueryResult.getResults();
            }
        });

        cql = "select count(*) from Todo where priority = 0";
        AVQuery.doCloudQueryInBackground(cql, new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                avCloudQueryResult.getCount();
            }
        });

        // 请注意：如果 Todo 是 AVObject 的子类，则需要传入第三个参数 Todo.class，否则会遇到 ClassCastException 的错误
        AVQuery.doCloudQueryInBackground(cql, new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                Todo todo = (Todo) avCloudQueryResult.getResults().get(0);
            }
        }, Todo.class);
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```java
        String cql = " select * from Todo where status = ? and priority = ?";
        AVQuery.doCloudQueryInBackground(cql, new CloudQueryCallback<AVCloudQueryResult>() {
            @Override
            public void done(AVCloudQueryResult avCloudQueryResult, AVException e) {
                if (e == null) {
                    // 操作成功
                } else {
                    e.printStackTrace();
                }
            }
        }, Arrays.asList(0, 1));
```
{% endblock %}

{% block code_set_cache_policy %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Post");
        query.setCachePolicy(AVQuery.CachePolicy.NETWORK_ELSE_CACHE);
        query.setMaxCacheAge(24 * 3600 * 1000); //设置为一天，单位毫秒
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                if (e == null) {
                    // 成功找到结果，先找网络再访问磁盘
                } else {
                    // 无法访问网络，本次查询结果未做缓存
                }
            }
        });
```
{% endblock %}

{% block table_cache_policy %}

策略枚举 | 含义及解释|
---|---
`IGNORE_CACHE`| **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
`CACHE_ONLY` |  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVException`。
`CACHE_ELSE_NETWORK` |  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVException`。
`NETWORK_ELSE_CACHE` | 查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVException`。
`CACHE_THEN_NETWORK` | 查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `find()` 同时使用。
{% endblock %}

{% block code_cache_operation %}

* 检查是否存在缓存查询结果：

  ``` java
  boolean isInCache = query.hasCachedResult();
  ```

* 删除某一查询的任何缓存结果：

  ``` java
  query.clearCachedResult();
  ```

* 删除查询的所有缓存结果：

  ``` java
  AVQuery.clearAllCachedResults();
  ```

* 设定缓存结果的最长时限：

  ``` java
  query.setMaxCacheAge(24 * 3600 * 1000); //设置为一天，单位毫秒
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirst()` 和 `getInBackground()`。
{% endblock %}

{% block code_query_geoPoint_near %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Todo");
        AVGeoPoint point = new AVGeoPoint(39.9, 116.4);
        query.limit(10);
        query.whereNear("whereCreated", point);
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                List<AVObject> nearbyTodos = list;// 离这个位置最近的 10 个 Todo 对象
            }
        });
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `orderByAscending` 或 `orderByDescending` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}
{% endblock %}

{% block code_query_geoPoint_within %}

```java
        query.whereWithinKilometers("whereCreated", point, 2.0);
```
{% endblock %} code_object_fetch_with_keys

{% block code_send_sms_code_for_loginOrSignup %}

```java
        AVOSCloud.requestSMSCodeInBackground("13577778888", new RequestMobileCodeCallback() {
            @Override
            public void done(AVException e) {
                // 发送失败可以查看 e 里面提供的信息
            }
        });
```
{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```java
        AVUser.signUpOrLoginByMobilePhoneInBackground("13577778888", "123456", new LogInCallback<AVUser>() {
            @Override
            public void done(AVUser avUser, AVException e) {
                // 如果 e 为空就可以表示登录成功了，并且 user 是一个全新的用户
            }
        });
```
{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```java
        AVUser user = new AVUser();// 新建 AVUser 对象实例
        user.setUsername("Tom");// 设置用户名
        user.setPassword("cat!@#123");// 设置密码
        user.setEmail("tom@leancloud.cn");// 设置邮箱
        user.signUpInBackground(new SignUpCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 注册成功
                } else {
                    // 失败的原因可能有多种，常见的是用户名已经存在。
                }
            }
        });
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```java
        AVUser.logInInBackground("Tom", "cat!@#123", new LogInCallback<AVUser>() {
            @Override
            public void done(AVUser avUser, AVException e) {

            }
        });
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```java
        AVUser.loginByMobilePhoneNumberInBackground("13577778888", "cat!@#123", new LogInCallback<AVUser>() {
            @Override
            public void done(AVUser avUser, AVException e) {

            }
        });
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```java
        AVUser.requestLoginSmsCodeInBackground("13577778888", new RequestMobileCodeCallback() {
            @Override
            public void done(AVException e) {

            }
        });
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```java
        AVUser.signUpOrLoginByMobilePhoneInBackground("13577778888", "238825", new LogInCallback<AVUser>() {
            @Override
            public void done(AVUser avUser, AVException e) {

            }
        });
```
{% endblock %}

{% block code_get_user_properties %}

```java
        String currentUsername = AVUser.getCurrentUser().getUsername();
        String currentEmail = AVUser.getCurrentUser().getEmail();

        // 请注意，以下代码无法获取密码
        String currentPassword = AVUser.getCurrentUser().getPassword();// 无 getPassword() 此方法
```
{% endblock %}

{% block code_set_user_custom_properties %}

```java
        AVUser.getCurrentUser().put("age", 25);
        AVUser.getCurrentUser().saveInBackground();
```
{% endblock %}

{% block code_update_user_custom_properties %}

```java
        AVUser.getCurrentUser().put("age", 25);
        AVUser.getCurrentUser().saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                AVUser.getCurrentUser().put("age", 27);
                AVUser.getCurrentUser().saveInBackground();
            }
        });
```
{% endblock %}

{% block code_send_verify_email %}

```java
  AVUser.requestEmailVerifyInBackground("abc@xyz.com", new RequestEmailVerifyCallback() {
    @Override
    public void done(AVException e) {
      if (e == null) {
        // 求重发验证邮件成功
      }
    }
  });
```
{% endblock %}

{% block code_reset_password_by_email %}

``` java
        AVUser.requestPasswordResetInBackground("myemail@example.com", new RequestPasswordResetCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {

                } else {
                    e.printStackTrace();
                }
            }
        });
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

``` java
        AVUser.requestPasswordResetBySmsCodeInBackground("18612340000", new RequestMobileCodeCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {

                } else {
                    e.printStackTrace();
                }
            }
        });
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

``` java
        AVUser.resetPasswordBySmsCodeInBackground("123456", "password", new UpdatePasswordCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {

                } else {
                    e.printStackTrace();
                }
            }
        });
```
{% endblock %}

{% block code_current_user %}

```java
        AVUser currentUser = AVUser.getCurrentUser();
        if (currentUser != null) {
            // 跳转到首页
        } else {
            //缓存用户对象为空时，可打开用户注册界面…
        }
```
{% endblock %}

{% block code_current_user_logout %}

```java
        AVUser.logOut();// 清除缓存用户对象
        AVUser currentUser = AVUser.getCurrentUser();// 现在的 currentUser 是 null 了
```
{% endblock %}

{% block code_query_user %}

```java
        AVQuery<AVUser> userQuery = new AVQuery<>("_User");
```
{% endblock %}

{% block text_subclass %}
## 子类化
LeanCloud 希望设计成能让人尽快上手并使用。你可以通过 `AVObject.get` 方法访问所有的数据。但是在很多现有成熟的代码中，子类化能带来更多优点，诸如简洁、可扩展性以及 IDE 提供的代码自动完成的支持等等。子类化不是必须的，你可以将下列代码转化：

```
        AVObject student = new AVObject("Student");
        student.put("name", "小明");
        student.saveInBackground();
```

可改写成:

```
        Student student = new Student();
        student.put("name", "小明");
        student.saveInBackground();
```

这样代码看起来是不是更简洁呢？

### 子类化 AVObject

要实现子类化，需要下面几个步骤：

1. 首先声明一个子类继承自 `AVObject`；
2. 添加 `@AVClassName` 注解。它的值必须是一个字符串，也就是你过去传入 `AVObject` 构造函数的类名。这样以来，后续就不需要再在代码中出现这个字符串类名；
3. 确保你的子类有一个 public 的默认（参数个数为 0）的构造函数。切记不要在构造函数里修改任何 `AVObject` 的字段；
4. 在你的应用初始化的地方，在调用 `AVOSCloud.initialize()` 之前注册子类 `AVObject.registerSubclass(YourClass.class)`。

下面是实现 `Student` 子类化的例子:

``` java
// Student.java
import com.avos.avoscloud.AVClassName;
import com.avos.avoscloud.AVObject;

@AVClassName("Student")
public class Student extends AVObject {
}

// App.java
import com.avos.avoscloud.AVOSCloud;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();

    AVObject.registerSubclass(Student.class);
    AVOSCloud.initialize(this, "...", "...");
  }
}
```

### 访问器、修改器和方法

添加方法到 AVObject 的子类有助于封装类的逻辑。你可以将所有跟子类有关的逻辑放到一个地方，而不是分成多个类来分别处理商业逻辑和存储/转换逻辑。

你可以很容易地添加访问器和修改器到你的 AVObject 子类。像平常那样声明字段的`getter` 和 `setter` 方法，但是通过 AVObject 的 `get` 和 `put` 方法来实现它们。下面是这个例子为 `Student` 类创建了一个 `content` 的字段：

``` java
// Student.java
@AVClassName("Student")
public class Student extends AVObject {
  public String getContent() {
    return getString("content");
  }
  public void setContent(String value) {
    put("content", value);
  }
}
```

现在你就可以使用 `student.getContent()` 方法来访问 `content` 字段，并通过 `student.setContent("blah blah blah")` 来修改它。这样就允许你的 IDE 提供代码自动完成功能，并且可以在编译时发现到类型错误。
+

各种数据类型的访问器和修改器都可以这样被定义，使用各种 `get()` 方法的变种，例如 `getInt()`，`getAVFile()` 或者 `getMap()`。
+

如果你不仅需要一个简单的访问器，而是有更复杂的逻辑，你可以实现自己的方法，例如：

``` java
public void takeAccusation() {
  // 处理用户举报，当达到某个条数的时候，自动打上屏蔽标志
  increment("accusation", 1);
  if (getAccusation() > 50) {
    setSpam(true);
  }
}
```

### 初始化子类

你可以使用你自定义的构造函数来创建你的子类对象。你的子类必须定义一个公开的默认构造函数，并且不修改任何父类 AVObject 中的字段，这个默认构造函数将会被 SDK 使用来创建子类的强类型的对象。


要创建一个到现有对象的引用，可以使用 `AVObject.createWithoutData()`:

```java
Student postReference = AVObject.createWithoutData(Student.class, student.getObjectId());
```

### 子类的序列化与反序列化

在 v3.4 版本以后，如果希望 AVObject 子类也支持 Parcelable，则需要至少满足以下几个要求：
1. 确保子类有一个 public 并且参数为 Parcel 的构造函数，并且在内部调用父类的该构造函数。
2. 内部需要有一个静态变量 CREATOR 实现 `Parcelable.Creator`。

```java
// Stduent.java
@AVClassName("Student")
public class Student extends AVObject {
  public Student(){
    super();
  }

  public Student(Parcel in){
    super(in);
  }
  //此处为我们的默认实现，当然你也可以自行实现
  public static final Creator CREATOR = AVObjectCreator.instance;
}
```

### 查询子类

你可以通过 `AVObject.getQuery()` 或者 `AVQuery.getQuery` 的静态方法获取特定的子类的查询对象。下面的例子就查询了用户发表的所有微博列表：

```java
AVQuery<Student> query = AVObject.getQuery(Student.class);
query.whereEqualTo("pubUser", AVUser.getCurrentUser().getUsername());
query.findInBackground(new FindCallback<Student>() {
  @Override
  public void done(List<Student> results, AVException e) {
    for (Student a : results) {
      // ...
    }
  }
});
```
### AVUser 的子类化

AVUser 作为 AVObject 的子类，同样允许子类化，你可以定义自己的 User 对象，不过比起 AVObject 子类化会更简单一些，只要继承 AVUser 就可以了：

```java
import com.avos.avoscloud.AVObject;
import com.avos.avoscloud.AVUser;

@AVClassName("MyUser")
public class MyUser extends AVUser {
  public void setNickName(String name) {
    this.put("nickName", name);
  }

  public String getNickName() {
    return this.getString("nickName");
  }
}
```
为了防止 AVUser 子类在序列化与反序列化时丢失数据，需要在调用 AVOSCloud.initialize() 之前注册该子类：
```java
AVUser.registerSubclass(subUser.class);
```

当用户子类化 AVUser 后，如果希望以后查询 AVUser 所得到的对象会自动转化为用户子类化的对象，则需要在调用 AVOSCloud.initialize() 之前添加：

```java
AVUser.alwaysUseSubUserClass(subUser.class);
```


注册跟普通的 AVUser 对象没有什么不同，但是登录如果希望返回自定义的子类，必须这样：

```java
MyUser cloudUser = AVUser.logIn(username, password, MyUser.class);
```

<div class="callout callout-info">由于 fastjson 内部的 bug，请在定义 AVUser 时<u>不要定义</u>跟 AVRelation 相关的 `get` 方法。如果一定要定义的话，请通过在 Class 上添加 `@JSONType(ignores = {"属性名"})` 的方式，将其注释为非序列化字段。</div>
{% endblock %}

{% block code_authenticate_via_sessiontoken %}
```java
String  sessionToken = AVUser.getCurrentUser().getSessionToken();
AVUser.becomeWithSessionTokenInBackground(sessionToken, new LogInCallback<AVUser>() {
            @Override
            public void done(AVUser user, AVException e) {
                // user.getCurrentUser()
            }
});
```
{% endblock %}

{% block faq %}
## 常见问题

### 错误 already has one request sending

日志中出现了 `com.avos.avoscloud.AVException: already has one request sending` 的错误信息，这说明存在对同一个 AVObject 实例对象同时进行了 2 次异步的 save 操作。为防止数据错乱，LeanCloud SDK 对于这种同一数据的并发写入做了限制，所以抛出了这个异常。

需要检查代码，通过打印 log 和断点的方式来定位究竟是由哪一行 save 所引发的。  
{% endblock %}

{% block file_as_avatar %}

```java
AVFile file = new AVFile("Satomi_Ishihara.gif", "http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif", new HashMap<String, Object>());
AVObject todo = new AVObject("Todo");
todo.put("girl", file);
todo.put("topic", "明星");
todo.saveInBackground();
```
{% endblock %}

{% block query_file_as_avatar %}

```java
AVQuery<AVObject> query = new AVQuery<>("Todo");
query.whereEqualTo("topic", "明星");
query.include("girl");
query.findInBackground(new FindCallback<AVObject>() {
    @Override
    public void done(List<AVObject> list, AVException e) {
        list.get(0).getAVFile("girl").getUrl();
    }
});
```
{% endblock %}

{% block code_user_isAuthenticated %}
```java
AVUser.getCurrentUser().isAuthenticated(new AVCallback<Boolean>() {
    @Override
    protected void internalDone0(Boolean aBoolean, AVException e) {

    }
});
```
{% endblock %}

{% block anonymous_user_login %}
```java
AVAnonymousUtils.logIn(new LogInCallback() {
  public void done(T user, AVException e) {
  };
});
```
{% endblock %}

{% block setup_username_and_password_for_anonymous_user %}
```java
AVUser currentUser = AVUser.getCurrentUser();
currentUser.setEmail("email");
currentUser.setPassword("password");
currentUser.setUsername("username");
currentUser.signUpInBackground(new SignUpCallback() {
  public void done(AVException e) {
  }
});
```
{% endblock %}

{% block login_with_authdata %}
```java
    // 以下的 platform 是通过 ShareSDK 获取的 authData 结果集。
    // 使用其他第三方登录 SDK 的获取方法，请自行查询对应 SDK 提供商的文档 
    Map<String, Object> map = new HashMap<>();
    map.put("access_token", platform.getDb().getToken());
    map.put("expires_in", platform.getDb().getExpiresIn());
    map.put("openid", platform.getDb().getUserId());

    AVUser.loginWithAuthData(map, "weixin", new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser avUser, AVException e) {
    if (e == null) {

        } else {
          e.printStackTrace();
        }
      }
    });
```
{% endblock %}

{% block login_with_authdata_result %}
```java
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
```java
    // 以下是用登录获取 avuser 的示例，您也可以直接用当前用户 currentUser 对象来操作
    AVUser.logInInBackground("大卫", "79Lis13SSv", new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser avUser, AVException e) {
        avUser.associateWithAuthData(authData, "qq", new SaveCallback() {
          @Override
          public void done(AVException e) {
            if (e == null) {
              // 绑定成功，authData 成功加入到 username 为"大卫"的 AVUser authData 字段数据里
            } else {
              e.printStackTrace();
            }
          }
        });
      }
    });
```
{% endblock %}

{% block associate_with_authdata_result %}
```java
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
``` java
    AVUser.loginWithAuthData(authData, "weixin", true, new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser avUser, AVException e) {
        if (e == null) {

        } else if (e.getCode() == 211) {
          // 跳转到输入用户名、密码、手机号等业务页面
        } else {
          e.printStackTrace();
        }
      }
    });

    .....
    
    // 跳转到输入用户名、密码、手机号等业务页面之后
    AVUser avUser = new AVUser();
    avUser.setUsername("大卫");
    avUser.setMobilePhoneNumber("1xxxxxxxxxx");
    avUser.loginWithAuthData(authData, "weixinapp", new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser avUser, AVException e) {

      }
    });
```
{% endblock %}

{% block login_with_authdata_unionid %}
```java
    AVUser.loginWithauthData(authData, "weixinapp1", platform.getDb().get("unionid"), "weixin", true, new LogInCallback<AVUser>() {
      @Override
      public void done(final AVUser avUser, AVException e) {
        if (e == null) {
      // avUser 用户创建并登录成功
        } else {
          e.printStackTrace();
        }
      }
    });
```
{% endblock %}

{% block login_with_authdata_unionid_result %}
```java
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
```java
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

{% block determine_a_user_is_anonymous %}
```java
AVUser currentUser = AVUser.getCurrentUser();
if (AVAnonymousUtils.isLinked(currentUser)) {
  // enableSignUpButton();
} else {
  // enableLogOutButton();
}
```
{%  endblock %}
