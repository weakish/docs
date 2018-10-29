{% import "views/_helper.njk" as docs %}
{% import "views/_im.njk" as im %}

{{ docs.defaultLang('js') }}

{{ docs.useIMLangSpec()}}

# 即时通讯开发指南 &middot; 进阶功能

## 使用场景和解决的需求

在[即时通讯开发指南 &middot; 基础入门](realtime-guide-beginner.html)中介绍了即时通讯的基础功能，在更多时候，我们需要解决的不只是基础的聊天，发文字，发图片，更多的时候我们要解决更为复杂的通信场景和丰富的功能：

- 对话的自定义属性添加和使用
- 更多的富媒体消息类型，例如短视频消息、文件消息等
- 离线消息推送到移动端
- 消息记录的查询和缓存

## 阅前准备

建议先按照顺序阅读如下文档之后，再阅读本文效果最佳：

- [即时通讯服务总览](realtime_v2.html)
- [即时通讯开发指南 &middot; 基础入门](realtime-guide-beginner.html)

## 给对话添加自定义属性

对话(`Conversation`)是即时通讯的核心逻辑对象，它有一些内置的常用的属性，与控制台中 `_Conversation` 表是一一对应的。

默认提供的**内置**属性的对应关系如下：

{{ docs.langSpecStart('js') }}

| Conversation 属性名   | _Conversation 字段 | 含义                                               |
| --------------------- | ------------------ | -------------------------------------------------- |
| `id`                  | `objectId`         | 全局唯一的 Id                                      |
| `name`                | `name`             | 成员共享的统一的名字                               |
| `members`             | `m`                | 成员列表                                           |
| `creator`             | `c`                | 对话创建者                                         |
| `transient`           | `tr`               | 是否为聊天室（暂态对话）                           |
| `system`              | `sys`              | 是否为服务号（系统对话）                           |
| `mutedMembers`        | `mu`               | 静音该对话的成员                                   |
| `muted`               | N/A                | 当前用户是否静音该对话                             |
| `createdAt`           | `createdAt`        | 创建时间                                           |
| `updatedAt`           | `updatedAt`        | 最后更新时间                                       |
| `lastMessageAt`       | `lm`               | 最后一条消息发送时间，也可以理解为最后一次活跃时间 |
| `lastMessage`         | N/A                | 最后一条消息，可能会空                             |
| `unreadMessagesCount` | N/A                | 未读消息数                                         |
| `lastDeliveredAt`     | N/A                | （仅限单聊）最后一条已送达对方的消息时间           |
| `lastReadAt`          | N/A                | （仅限单聊）最后一条对方已读的消息时间             |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('objc') }}

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                               |
| ----------------------- | ------------------ | -------------------------------------------------- |
| `conversationId`        | `objectId`         | 全局唯一的 Id                                      |
| `name`                  | `name`             | 成员共享的统一的名字                               |
| `members`               | `m`                | 成员列表                                           |
| `creator`               | `c`                | 对话创建者                                         |
| `attributes`            | `attr`             | 自定义属性                                         |
| `transient`             | `tr`               | 是否为聊天室（暂态对话）                           |
| `createdAt`             | `createdAt`        | 创建时间                                           |
| `updatedAt`             | `updatedAt`        | 最后更新时间                                       |
| `system`                | `sys`              | 是否为系统对话                                     |
| `lastMessageAt`         | `lm`               | 最后一条消息发送时间，也可以理解为最后一次活跃时间 |
| `lastMessage`           | N/A                | 最后一条消息，可能会空                             |
| `muted`                 | N/A                | 当前用户是否静音该对话                             |
| `unreadMessagesCount`   | N/A                | 未读消息数                                         |
| `lastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间           |
| `lastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间             |

{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| `conversationId`        | `objectId`         | 全局唯一的 Id                                    |
| `name`                  | `name`             | 成员共享的统一的名字                             |
| `members`               | `m`                | 成员列表                                         |
| `creator`               | `c`                | 对话创建者                                       |
| `attributes`            | `attr`             | 自定义属性                                       |
| `isTransient`           | `tr`               | 是否为聊天室（暂态对话）                         |
| `lastMessageAt`         | `lm`               | 该对话最后一条消息，也可以理解为最后一次活跃时间 |
| `lastMessage`           | N/A                | 最后一条消息，可能会空                           |
| `muted`                 | N/A                | 当前用户是否静音该对话                           |
| `unreadMessagesCount`   | N/A                | 未读消息数                                       |
| `lastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间         |
| `lastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间           |
| `createdAt`             | `createdAt`        | 创建时间                                         |
| `updatedAt`             | `updatedAt`        | 最后更新时间                                     |
| `system`                | `sys`              | 是否为系统对话                                   |

{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}

| AVIMConversation 属性名 | _Conversation 字段 | 含义                                             |
| ----------------------- | ------------------ | ------------------------------------------------ |
| `Id`                    | `objectId`         | 全局唯一的 Id                                    |
| `Name`                  | `name`             | 成员共享的统一的名字                             |
| `MemberIds`             | `m`                | 成员列表                                         |
| `MuteMemberIds`         | `mu`               | 静音该对话的成员                                 |
| `Creator`               | `c`                | 对话创建者                                       |
| `IsTransient`           | `tr`               | 是否为聊天室（暂态对话）                         |
| `IsUnique`              | `unique`           | 是否为相同成员的唯一对话（暂态对话）             |
| `IsSystem`              | `sys`              | 是否为系统对话                                   |
| `LastMessageAt`         | `lm`               | 该对话最后一条消息，也可以理解为最后一次活跃时间 |
| `LastMessage`           | N/A                | 最后一条消息，可能会空                           |
| `LastDeliveredAt`       | N/A                | （仅限单聊）最后一条已送达对方的消息时间         |
| `LastReadAt`            | N/A                | （仅限单聊）最后一条对方已读的消息时间           |
| `CreatedAt`             | `createdAt`        | 创建时间                                         |
| `UpdatedAt`             | `updatedAt`        | 最后更新时间                                     |

{{ docs.langSpecEnd('cs') }}


### 创建自定义属性

创建时可以指定一些自定义属性：

```js
tom.createConversation({
  members: ['Jerry'],
  name: '猫和老鼠',
  type: 'private',
  pinned: true,
}).then(function(conversation) {
  console.log('创建成功。id: ' + conversation.id);
}).catch(console.error.bind(console));
```
```objc
// Tom 创建名称为「猫和老鼠」的会话，并附加会话属性
NSDictionary *attributes = @{ 
    @"type": @"private",
    @"pinned": @(YES) 
};
[tom createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] attributes:attributes options:AVIMConversationOptionNone callback:^(AVIMConversation *conversation, NSError *error) {
    if (succeeded) {
        NSLog(@"创建成功！");
    }
}];
```
```java
HashMap<String,Object> attr = new HashMap<String,Object>();
attr.put("type","private");
attr.put("pinned",true);
client.createConversation(Arrays.asList("Jerry"),"猫和老鼠",attr,
    new AVIMConversationCreatedCallback(){
        @Override
        public void done(AVIMConversation conv,AVIMException e){
          if(e==null){
            //创建成功
          }
        }
    });
}
```
```cs
// 推荐使用 Builder 模式来构建对话
var conversationBuilder = tom.GetConversationBuilder().SetProperty("type", "private").SetProperty("pinned", true);
var conversation = await tom.CreateConversationAsync(conversationBuilder);
```

**自定义属性在 SDK 级别是对所有成员可见的**。我们也支持通过自定义属性来查询对话，请参见[对话的查询](#对话的查询)

### 修改和使用属性

以 `conversation.name` 为例，对话的 `conversation.name` 的属性是所有成员共享的，可以通过如下代码修改：

```js
conversation.name = '聪明的喵星人';
conversation.save();
```
```objc
AVIMConversationUpdateBuilder *updateBuilder = [conversation newUpdateBuilder];
updateBuilder.name = @"聪明的喵星人";
[conversation update:[updateBuilder dictionary] callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"修改成功！");
    }
}];
```
```java
AVIMConversation conversation = client.getConversation("55117292e4b065f7ee9edd29");
conversation.setName("聪明的喵星人");
conversation.updateInfoInBackground(new AVIMConversationCallback(){
  @Override
  public void done(AVIMException e){        
    if(e==null){
    //更新成功
    }
  }
});
```
```cs
conversation.Name = "聪明的喵星人";
await conversation.SaveAsync();
```

以 `conversation.type` 为例来演示自定义属性，读取、使用、修改的操作如下：

```js
// 获取自定义属性
var type = conversation.get('type');
conversation.set('pinned',false);
conversation.save();
```
```objc
// 获取自定义属性
NSString *type = [conversation objectForKey:@"type"];
// 设置 boolean 属性值
[conversation setObject:@(NO) forKey:@"pinned"];
[conversation updateWithCallback:];
```
```java
// 获取自定义属性
String type = conversation.get("type");
conversation.set("pinned",false);
conversation.updateInfoInBackground(new AVIMConversationCallback(){
  @Override
  public void done(AVIMException e){        
    if(e==null){
    //更新成功
    }
  }
});
```
```cs
// 获取自定义属性
var type = conversation["type"];
conversation["pinned"] = false;
await conversation.SaveAsync();
```

## 同学/同事群、聊天室、公众号及其他

在[即时通讯开发指南 &middot; 基础入门](realtime-guide-beginner.html)中介绍了两种通用的对话类型：

- 一对一单聊
- 群聊

而在实际的应用场景中还有更多要进一步细化的对话类型：

- 社交软件中的私聊
- 办公聊天频道
- 同学/同事的群聊
- 游戏公会/帮派群聊
- 文字直播/聊天室
- 副本/战斗聊天
- 系统广播/游戏 GM 的全服广播
- 在线客服聊天

以及更多可能的场景都会使用到不同的对话类型，因此我们从场景出发，以实际需求对应的对话类型来讲解如何拓展出符合自己需求的对话类型。

### 根据场景选择对话类型

在 SDK 中已经默认提供了以下四种对话类型：

- 普通对话 `Conversation`
- 聊天室 `ChatRoom`
- 服务号 & 系统账号 `ServiceConversation`
- 临时对话 `TemporaryConversation`


首先我们通过下面的表格来归类，更加直观地展现不同需求对应的基础类型：

对应场景|推荐使用类型|特征备注
--|--|--
社交私聊|`Conversation`|成员数量恒定为 2
同学/同事群聊|`Conversation`|成员数量不定，并且对话本身持久化存储
游戏公会/帮派群聊|`Conversation`|与同学/同事群聊类似
文字直播/聊天室|`ChatRoom`|成员数量变化频率较高，消息数量较大，消息频率/峰值变化明显
副本/战斗聊天|`ChatRoom`|与文字直播/聊天室类似
系统广播/GM 全服广播|`ServiceConversation`|用户订阅了对话之后才会收到消息
在线客服聊天|`TemporaryConversation`|不占用持久化存储资源，对话生命周期仅存在于使用期间

**注意：对话模型不仅仅是应对上述的场景，开发者可以根据自己实际场景的需要从上述的类型中选择一种进行拓展。**

### 普通对话

普通对话 `Conversation` 有一个典型用例：

[即时通讯开发指南 &middot; 基础入门#一对一单聊](realtime-guide-beginner.html#一对一单聊)中介绍了如何建立一个一对一单聊，实际上这种单聊已经对应到了社交软件中的私聊，因为对话里面只有两个成员，如果在之后的操作中能确保**不会向当前对话继续添加新成员**，这个对话就可以用以应对社交聊天中的私聊场景。

此处需要注意如下事项：

- 假设 A 和 B 想要同时与 C 在一个对话进行聊天，此时最佳的使用方式是创建一个全新的对话，包含 A、B、C。
- 假设 A 重新登录之后，想要获取与 B 的私聊，可以通过创建对话的接口，传入一个 `isUnique` 为 true 即可，这个参数的含义是：如果 A 和 B 已经存在一个私聊，就会直接返回这个对话的 Id，而如果不存在，则会创建一个全新的对话返回，无需先查询再创建。

#### 普通对话实例 - 同学/同事群组

创建一个对话，邀请超过 3 个成员，同时设置名称为 `三年二班`：

```js
tom.createConversation({
  members: ['Bob', 'Harry', 'William'],
  name: '三年二班'
});
```
```objc
[tom createConversationWithName:@"三年二班" clientIds:@[@"Bob",@"Harry",@"William"] callback:^(AVIMConversation *conversation, NSError *error) {
}];
```
```java
tom.createConversation(Arrays.asList("Bob", "Harry", "William"), "三年二班", null,
    new AVIMConversationCreatedCallback() {
        @Override
        public void done(AVIMConversation conv, AVIMException e) {
            if (e == null) {
                // 创建成功
            }
        }
});
```
```cs
var conversationBuilder = tom.GetConversationBuilder().SetName("三年二班")
                              .AddMember("Bob")
                              .AddMember("Harry")
                              .AddMember("William");
var conversation = await tom.CreateConversationAsync(conversationBuilder);
```

#### 通过查询加入同学群

此时，有两种方式可以实现精准查找：

1. 在控制台为 `_Conversation` 设置 `name` 字段的唯一索引，这样其他人再创建 `三年二班` 的同名对话就会报错
2. 开发者自己可以自定义一个 `uniqueId` 的唯一字段（可由客户端算法生成或者请求一个云函数来生成，类似 QQ 群号），然后就通过这个号码来查找

下面演示的是第一种，**假设 `name` 字段上有唯一索引**：

```js
tom.getQuery().equalTo('name', '三年二班').find().then(function(conversations) {
  var schoolmateGroup = conversations[0];
  return schoolmateGroup.join();
}).catch(console.error.bind(console));
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query whereKey:@"name" equalTo:@"三年二班"];
[query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
    AVIMConversation *schoolmateGroup = (AVIMConversation *)[conversations objectAtIndex:0];
    [conversation joinWithCallback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"加入成功！");
        }
    }];
}];
```
```java
AVIMConversationsQuery query = client.getConversationsQuery();
conversationQuery.whereEqualTo("name", "三年二班");
query.findInBackground(new AVIMConversationQueryCallback(){
    @Override
    public void done(List<AVIMConversation> conversations,AVIMException e){
      if(e==null){
        AVIMConversation schoolmateGroup = conversations.get(0);
        schoolmateGroup.join(new AVIMConversationCallback(){
            @Override
            public void done(AVIMException e){
                if(e==null){
                //加入成功
                }
            }
        });        
      }
    }
});
```
```cs
var query = tom.GetQuery().WhereEqualTo("name", "三年二班");
var schoolmateGroup = await query.FirstAsync();
await schoolmateGroup.JoinAsync();
```

#### 添加其他同学

通过如下代码就可以直接将对应的 `clientId` 加入到同学群中：

```js
return conversation.add(['Harry']).then(function(conversation) {
  console.log('添加成功');
}).catch(console.error.bind(console));
```
```objc
[conversation addMembersWithClientIds:@[@"Harry"] callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"邀请成功！");
    }
}];
```
```java
conv.addMembers(Arrays.asList("Harry"), new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      // 添加成功
    }
});
```
```cs
await schoolmateGroup.InviteAsync(new string[]{ "Harry" });
```

### 聊天室

聊天室和普通对话有如下区别：

1. 无人数限制（而普通对话最多允许 500 人加入）
2. 从实际经验来看，为避免过量消息刷屏而影响用户体验，我们建议每个聊天室的上限人数控制在 5000 人左右。开发者可以考虑从应用层面将大聊天室拆分成多个较小的聊天室。
3. 不支持查询成员列表，但可以通过相关 API 查询在线人数。
4. 不支持离线消息、离线推送通知、消息回执等功能。
5. 没有成员加入、成员离开的通知。
6. 一个用户一次登录只能加入一个聊天室，加入新的聊天室后会自动离开原来的聊天室。
7. 加入后半小时内断网重连会自动加入原聊天室，超过这个时间则需要重新加入

所以开发者可以根据上述特性比对实际需求来选择对话类型来构建自己的业务场景。

####  聊天室实例 - 文字直播/聊天室

```js
tom.createChatRoom({ name:'聊天室' }).catch(console.error);
```
```objc
[client createChatRoomWithName:@"聊天室" attributes:nil callback:^(AVIMChatRoom *chatRoom, NSError *error) {
    if (chatRoom && !error) {        
        AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这是一条消息" attributes:nil];
        [chatRoom sendMessage:textMessage callback:^(BOOL success, NSError *error) {
            if (success && !error) {

            }
        }];
    }
}];
```
```java
tom.createChatRoom(null, "聊天室", null,
    new AVIMConversationCreatedCallback() {
        @Override
        public void done(AVIMConversation conv, AVIMException e) {
            if (e == null) {
                // 创建成功
            }
        }
});
```
```cs
// 第一种是最直接间接的方式，传入 name 即可
tom.CreateChatRoomAsync("聊天室");
// 第二种是更为推荐的形式采用 Builder 模式
var chatRoomBuilder = tom.GetConversationBuilder().SetName("聊天室")
                              .SetTransient();
var chatRoom = await tom.CreateConversationAsync(chatRoomBuilder);
```

#### 查找聊天室列表

构建聊天室的查询：

```js
var query = tom.getQuery().equalTo('tr',true);// 聊天室对象
}).catch(console.error);
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query whereKey:@"tr" equalTo:@(YES)]; 
```
```java
AVIMConversationsQuery query = tom.getChatRoomQuery();
query.findInBackground(new AVIMConversationQueryCallback() {
    @Override
    public void done(List<AVIMConversation> conversations, AVIMException e) {
        if (null != e) {
            // 获取成功
        } else {
          // 获取失败
        }
    }
});
```
```cs
var query = tom.GetChatRoomQuery();
```

#### 加入/离开/邀请他人加入聊天室

查询到聊天室之后，加入/离开/邀请他人加入聊天室与普通对话的对应接口没有区别，详细请参考[基础入门#多人群聊](realtime-guide-beginner.html#多人群聊)。最大的区别就是：

> 聊天室没有成员加入、成员离开的通知

### 服务号（系统账号）

服务号和系统账号在即时通讯服务里面是同一个概念。

服务号和普通对话有如下区别：

1. 服务号的订阅必须确保是由服务端发起，而客户端可以通过访问服务端的 API 去订阅一个服务号
2. 在服务号里，既可以给所有订阅者发送消息，也可以单独某一个或者某几个用户发消息

其他操作与普通对话无异，更多功能请查看[即时通讯 - 服务号开发指南](realtime-service-account.html)。


### 临时对话

临时对话最大的特点是**较短的有效期**，这个特点可以解决对话的持久化存储在服务端占用的存储资源越来越大的问题，也可以应对一些临时聊天的场景。

#### 临时对话实例

买家询问商品的详情，可以发起一个临时对话：

```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createTemporaryConversation({
    members: ['Jerry', 'William'],
  });
}).then(function(conversation) {
  return conversation.send(new AV.TextMessage('这里是临时对话'));
}).catch(console.error);
```
```objc
[tom createTemporaryConversationWithClientIds:@[@"Jerry", @"William"]
                                                timeToLive:3600
                                                callback:
            ^(AVIMTemporaryConversation *tempConv, NSError *error) {

                AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这里是临时对话，一小时之后，这个对话就会消失"
                                                                    attributes:nil];
                [tempConv sendMessage:textMessage callback:^(BOOL success, NSError *error) {

                    if (success) {
                        // send message success.
                    }
                }];
            }];
```
```java
tom.createTemporaryConversation(Arrays.asList(members), 3600, new AVIMConversationCreatedCallback(){
    @Override
    public void done(AVIMConversation conversation, AVIMException e) {
        if (null == e) {
        AVIMTextMessage msg = new AVIMTextMessage();
        msg.setText("这里是临时对话，一小时之后，这个对话就会消失");
        conversation.sendMessage(msg, new AVIMConversationCallback(){
            @Override
            public void done(AVIMException e) {
            }
        });
        }
    }
});
```
```cs
var temporaryConversation = await tom.CreateTemporaryConversationAsync();
```

其他操作与普通对话无异，更多功能请查看[即时通讯 - 临时对话开发指南](realtime-temporary-conversation.html)。

## 对话查询

### 根据 id 查询

`id` 对应就是 `_Conversation` 表中的 `objectId` 的字段值:

```js
tom.getConversation('551260efe4b01608686c3e0f').then(function(conversation) {
  console.log(conversation.id);
}).catch(console.error.bind(console));
```
```objc
AVIMConversationQuery *query = [tom conversationQuery];
[query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
    if (succeeded) {
        NSLog(@"查询成功！");
    }
}];
```
```java
AVIMConversationsQuery query = tom.getConversationsQuery();
query.whereEqualTo("objectId","551260efe4b01608686c3e0f");
query.findInBackground(new AVIMConversationQueryCallback(){
    @Override
    public void done(List<AVIMConversation> convs,AVIMException e){
      if(e==null){
      if(convs!=null && !convs.isEmpty()){
        //convs.get(0) 就是想要的conversation
      }
      }
    }
});
```
```cs
var query = tom.GetQuery();
var conversation = await query.GetAsync("551260efe4b01608686c3e0f");
```

{{ docs.langSpecStart('java') }}
由于历史原因，AVIMConversationQuery 只能检索 _Conversation 表中 attr 列中的属性，而不能完整检索 _Conversation 表的其他自定义属性，所以在 v4.1.1 版本之后被废弃。v4.1.1 后请使用 AVIMConversation**s**Query 来完成相关查询。AVIMConversationsQuery 在查询属性时不会再自动添加 attr 前缀，如果开发者需要查询 _Conversation 表中 attr 列中具体属性，请自行添加 attr 前缀。
{{ docs.langSpecEnd('java') }}

### 基础的条件查询

> 对云存储熟悉的开发者可以更容易理解对话的查询构建，因为对话查询和云存储的对象查询在接口上是十分接近的。

SDK 提供了各种条件查询方式，可以满足各种对话查询的需求，首先从最简单的 `equalTo` 开始。

有如下需求：需要查询所有对话的一个自定义属性 `type`(字符串类型) 为 `private` 的对话需要如下代码：

```js
query.equalTo('type','private')
```
```objc
[query whereKey:@"type" equalTo:@"private"];
```
```java
query.whereEqualTo("type","private");
```
```cs
query.WhereEqualTo("type","private");
```

与 `equalTo` 类似，针对 number 和 date 类型的属性还可以使用大于、大于等于、小于、小于等于等，详见下表：

{{ docs.langSpecStart('js') }}

| 逻辑比较 | ConversationQuery 方法 |      |
| ---- | ------------------------ | ---- |
| 等于   | `equalTo`                |      |
| 不等于  | `notEqualTo`             |      |
| 大于   | `greaterThan`            |      |
| 大于等于 | `greaterThanOrEqualTo`   |      |
| 小于   | `lessThan`      |      |
| 小于等于 | `lessThanOrEqualTo`      |      |

{{ docs.langSpecEnd('js') }}

{{ docs.langSpecStart('objc') }}
| 逻辑比较 | AVIMConversationQuery 方法 |      |
| ---- | ------------------------ | ---- |
| 等于   | `equalTo`                |      |
| 不等于  | `notEqualTo`             |      |
| 大于   | `greaterThan`            |      |
| 大于等于 | `greaterThanOrEqualTo`   |      |
| 小于   | `lessThan`      |      |
| 小于等于 | `lessThanOrEqualTo`      |      |
{{ docs.langSpecEnd('objc') }}

{{ docs.langSpecStart('java') }}
| 逻辑比较 | AVIMConversationQuery 方法 |      |
| ---- | ------------------------ | ---- |
| 等于   | `whereEqualTo`                |      |
| 不等于  | `whereNotEqualsTo`             |      |
| 大于   | `whereGreaterThan`            |      |
| 大于等于 | `whereGreaterThanOrEqualsTo`   |      |
| 小于   | `whereLessThan`      |      |
| 小于等于 | `whereLessThanOrEqualsTo`      |      |
{{ docs.langSpecEnd('java') }}

{{ docs.langSpecStart('cs') }}
| 逻辑比较 | AVIMConversationQuery 方法 |      |
| ---- | ------------------------ | ---- |
| 等于   | `WhereEqualTo`                |      |
| 不等于  | `WhereNotEqualsTo`             |      |
| 大于   | `WhereGreaterThan`            |      |
| 大于等于 | `WhereGreaterThanOrEqualsTo`   |      |
| 小于   | `WhereLessThan`      |      |
| 小于等于 | `WhereLessThanOrEqualsTo`      |      |
{{ docs.langSpecEnd('cs') }}

### 正则匹配查询

匹配查询是指在 `ConversationsQuery` 的查询条件中使用正则表达式来匹配数据。

比如要查询所有 language 是中文的对话：

```js
query.matches('language',/[\\u4e00-\\u9fa5]/);
```
```objc
[query whereKey:@"language" matchesRegex:@"[\u4e00-\u9fa5]"];
```
```java
query.whereMatches("language","[\\u4e00-\\u9fa5]"); //language 是中文字符 
```
```cs
query.WhereMatches("language","[\\u4e00-\\u9fa5]"); //language 是中文字符 
```

### 包含查询

例如查询关键字包含「教育」的对话：

```js
query.contains('keywords','教育');
```
```objc
[query whereKey:@"keywords" containsString:@"教育"];
```
```java
query.whereContains("keywords","教育"); 
```
```cs
query.WhereContains("keywords","教育"); 
```

### 空值查询

空值查询是指查询相关列是否为空值的方法，例如要查询 lm 列为空值的对话：

```js
query.doesNotExist('lm')
```
```objc
[query whereKeyDoesNotExist:@"lm"];
```
```java
query.whereDoesNotExist("lm");
```
```cs
query.WhereDoesNotExist("lm");
```

如果要查询 lm 列不为空的对话，则替换为如下：

```js
query.exists('lm')
```
```objc
[query whereKeyExists:@"lm"];
```
```java
query.whereExists("lm");
```
```cs
query.WhereExists("lm");
```

### 组合查询

查询年龄小于 18 岁，并且关键字包含「教育」的对话：

```js
// 查询 keywords 包含「教育」且 age 小于 18 的对话
query.contains('keywords', '教育').lessThan('age', 18);
```
```objc
[query whereKey:@"keywords" containsString:@"教育"];
[query whereKey:@"age" lessThan:@(18)];
```
```java
query.whereContains("keywords", "教育");
query.whereLessThan("age", 18);
```
```cs
query.WhereContains("keywords", "教育");
query.WhereLessThan("age", 18);
```

另外一种组合的方式是，两个查询采用 Or 或者 And 的方式构建一个新的查询。

查询年龄小于 18 或者关键字包含「教育」的对话：

```js
JavaScript SDK 暂不支持
```
```objc
AVIMConversationQuery *ageQuery = [tom conversationQuery];
[ageQuery whereKey:@"age" greaterThan:@(18)];
AVIMConversationQuery *keywordsQuery = [tom conversationQuery];
[keywordsQuery whereKey:@"keywords" containsString:@"教育"];
AVIMConversationQuery *query = [AVIMConversationQuery orQueryWithSubqueries:[NSArray arrayWithObjects:ageQuery,keywordsQuery,nil]];
```
```java
AVIMConversationsQuery ageQuery = tom.getConversationsQuery();
ageQuery.whereLessThan('age', 18);

AVIMConversationsQuery keywordsQuery = tom.getConversationsQuery();
keywordsQuery.whereContains('keywords', '教育').
AVIMConversationsQuery query = AVIMConversationsQuery.or(Arrays.asList(priorityQuery, statusQuery));
```
```cs
var ageQuery = tom.GetQuery();
ageQuery.WhereLessThan('age', 18);

var keywordsQuery = tom.GetQuery();
keywordsQuery.WhereContains('keywords', '教育').

var query = AVIMConversationQuery.or(new AVIMConversationQuery[] { ageQuery, keywordsQuery});
```


### 对话的有效期

一个对话（包括普通、暂态、系统对话）如果 1 年内没有通过 SDK 或者 REST API 发送过新的消息，或者它在 _Conversation 表中的任意字段没有被更新过，即被视为不活跃对话，云端会自动将其删除。（查询对话的消息记录并不会更新 _Conversation 表，所以只查询不发送消息的对话仍会被视为不活跃对话。）


不活跃的对话被删除后，当客户端再次通过 SDK 或 REST API 对其发送消息时，会遇到 4401 INVALID_MESSAGING_TARGET 错误，表示该对话已经不存在了。同时，与该对话相关的消息历史也无法获取。

### 性能优化建议

#### 对话的查询和存储

在一些常见的需求中，进入对话列表界面的时候，客户端需要展现一个当前用户所参与的所有对话，一般情况下是按照活跃时间逆序排列在首页，因此给出一个查询优化的建议：

- 查询的时候可以尽量提供了一个 `updatedAt` 或者 `lastMessageAt` 的参数来限定返回结果，原因是 skip 搭配 limit 的查询性能相对较低。
- 使用 `m` 列的 `contains` 查询来查找包含某人的对话时，也尽量使用默认的 limit 大小 10，再配合 `updatedAt` 或者 `lastMessageAt` 来做条件约束，性能会提升较大
- 整个应用对话如果数量太多，可以考虑在云引擎封装一个云函数，用定时任务启动之后，周期性地做一些清理，例如可以归档一些不活跃的对话，直接删除即可。


## 消息类型

### 发送音频消息/视频/文件

#### 发送流程

对于图像、音频、视频和文件这四种类型的消息，SDK 均采取如下的发送流程：

如果文件是从**客户端 API 读取的数据流 (Stream)**，步骤为：

1. 从本地构造 `File`
2. 调用 `File` 的上传方法将文件上传到云端，并获取文件元信息（MetaData）
3. 把 `File` 的 objectId、URL、文件元信息都封装在消息体内
4. 调用接口发送消息

如果文件是**外部链接的 URL**，则：

1. 直接将 URL 封装在消息体内，不获取元信息，不包含 objectId
1. 调用接口发送消息

以发送音频消息为例，基本流程是：读取音频文件（或者录制音频）> 构建音频消息 > 消息发送。

```js
var AV = require('leancloud-storage');
var { AudioMessage } = require('leancloud-realtime-plugin-typed-messages');

var fileUploadControl = $('#photoFileUpload')[0];
var file = new AV.File('忐忑.mp3', fileUploadControl.files[0]);
file.save().then(function() {
  var message = new AudioMessage(file);
  message.setText('听听人类的神曲');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```objc
NSString *path = [[NSBundle mainBundle] pathForResource:@"忐忑" ofType:@"mp3"];
AVFile *file = [AVFile fileWithName:@"忐忑.mp3" contentsAtPath:path];
AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file = AVFile.withAbsoluteLocalPath("忐忑.mp3",localFilePath);
AVIMAudioMessage m = new AVIMAudioMessage(file);
m.setText("听听人类的神曲");
// 创建一条音频消息
conv.sendMessage(m, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      if (e == null) {
        // 发送成功
      }
    }
});
```
```cs
// 假设在程序运行目录下有一张图片，Unity/Xamarin 可以参照这种做法通过路径获取音频文件
// 以下是发送音频消息的快捷用法
using (FileStream fileStream = new FileStream(Path.Combine(Path.GetDirectoryName(Assembly.GetEntryAssembly().Location), "忐忑.mp3"), FileMode.Open, FileAccess.Read))
{
    await conversation.SendAudioAsync("忐忑.mp3", fileStream);
}

// 或者如下比较常规的用法
var audioMessage = new AVIMAudioMessage();
audioMessage.File = new AVFile("忐忑.mp3", fileStream);
audioMessage.TextContent = "听听人类的神曲";
await conversation.SendAsync(audioMessage);
```

与图像消息类似，音频消息也支持从 URL 构建：

```js
var AV = require('leancloud-storage');
var { AudioMessage } = require('leancloud-realtime-plugin-typed-messages');

var file = new AV.File.withURL('apple.acc', 'https://some.website.com/apple.acc');
file.save().then(function() {
  var message = new AudioMessage(file);
  message.setText('来自苹果发布会现场的录音');
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```objc
AVFile *file = [AVFile fileWithURL:[self @"https://some.website.com/apple.acc"]];
AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"来自苹果发布会现场的录音" file:file attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
AVFile file =new AVFile("apple.acc","来自苹果发布会现场的录音", null);
AVIMAudioMessage m = new AVIMAudioMessage(file);
m.setText("来自苹果发布会现场的录音");
conv.sendMessage(m, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
      if (e == null) {
        // 发送成功
      }
    }
});
```
```cs
await conversation.SendAudioAsync("https://some.website.com/apple.acc", "apple.acc", "来自苹果发布会现场的录音");
```

### 内置消息类型

参考图像消息和音频消息的发送，其他富媒体消息（文件消息， 例如附带 .doc 文件消息），SDK 内置了如下消息类型用来满足常见的需求：


- `TextMessage` 文本消息
- `ImageMessage` 图像消息
- `AudioMessage` 音频消息
- `VideoMessage` 视频消息
- `FileMessage` 普通文件消息(.txt/.doc/.md 等各种)
- `LocationMessage` 地理位置消息

还有如下注意事项：

- 通过 URL 发送富媒体消息的时候， URL 指的是文件自身的 URL，而不是视频/音乐/文库网站上播放页/预览页的 URL。

### 发送地理位置消息

地理位置消息构建方式如下：

```js
var AV = require('leancloud-storage');
var { LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

var location = new AV.GeoPoint(31.3753285,120.9664658);
var message = new LocationMessage(location);
message.setText('蛋糕店的位置');
conversation.send(message).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```
```objc
AVIMLocationMessage *message = [AVIMLocationMessage messageWithText:@"蛋糕店的位置" latitude:31.3753285 longitude:120.9664658 attributes:nil];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        NSLog(@"发送成功！");
    }
}];
```
```java
final AVIMLocationMessage locationMessage=new AVIMLocationMessage();
// 开发者更可以通过具体的设备的 API 去获取设备的地理位置，此处仅设置了 2 个经纬度常量仅做演示
locationMessage.setLocation(new AVGeoPoint(31.3753285,120.9664658));
locationMessage.setText("蛋糕店的位置");
conversation.sendMessage(locationMessage, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
        if (null != e) {
          e.printStackTrace();
        } else {
          // 发送成功
        }
    }
});
```
```cs
await conv.SendLocationAsync(new AVGeoPoint(31.3753285, 120.9664658));
```

### 自定义消息类型

如果遇到了有强需求的自定义消息，我们推荐按照如下需求分级，来选择自定义的方式：

- 通过设置简单 key-value 的自定义属性实现一个消息类型
- 通过继承内置的消息类型添加一些属性
- 完全自由实现一个全新的消息类型


### 接收消息

在接收消息的事件通知上可以使用如下代码来判断接收到的消息类型：

```js
// 在初始化 Realtime 时，需加载 TypedMessagesPlugin
// var realtime = new Realtime({
//   appId: appId,
//   plugins: [TypedMessagesPlugin]
// });
var { Event, TextMessage } = require('leancloud-realtime');
var { FileMessage, ImageMessage, AudioMessage, VideoMessage, LocationMessage } = require('leancloud-realtime-plugin-typed-messages');
// 注册 message 事件的 handler
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  // 请按自己需求改写
  var file;
  switch (message.type) {
    case TextMessage.TYPE:
      console.log('收到文本消息， text: ' + message.getText() + ', msgId: ' + message.id);
      break;
    case FileMessage.TYPE:
      file = message.getFile(); // file 是 AV.File 实例
      console.log('收到文件消息，url: ' + file.url() + ', size: ' + file.metaData('size'));
      break;
    case ImageMessage.TYPE:
      file = message.getFile();
      console.log('收到图片消息，url: ' + file.url() + ', width: ' + file.metaData('width'));
      break;
    case AudioMessage.TYPE:
      file = message.getFile();
      console.log('收到音频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case VideoMessage.TYPE:
      file = message.getFile();
      console.log('收到视频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case LocationMessage.TYPE:
      var location = message.getLocation();
      console.log('收到位置消息，latitude: ' + location.latitude + ', longitude: ' + location.longitude);
      break;
    default:
      console.warn('收到未知类型消息');
  }
});

// 同时，对应的 conversation 上也会派发 `MESSAGE` 事件：
conversation.on(Event.MESSAGE, function messageEventHandler(message) {
  // 这里补充业务逻辑
});
```
```objc
```
```java
```
```cs
// 这里使用的是简单的演示，推荐使用 switch/case 搭配模式匹配来判断类型
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {

    }
    else if (e.Message is AVIMAudioMessage audioMessage)
    {

    }
    else if (e.Message is AVIMVideoMessage videoMessage)
    {

    }
    else if (e.Message is AVIMFileMessage fileMessage)
    {

    }
    else if (e.Message is AVIMLocationMessage locationMessage)
    {

    }
    else if (e.Message is AVIMTypedMessage baseTypedMessage)
    {

    }// 这里可以继续添加自定义类型的判断条件
}
```

## 消息发送选项

发送消息的时候可以额外指定参数支持一些特性：

### 消息等级
为了保证消息的时效性，当聊天室消息过多导致客户端连接堵塞时，服务器端会选择性地丢弃部分低等级的消息。目前支持的消息等级有：

| 消息等级                 | 描述                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `MessagePriority.HIGH`   | 高等级，针对时效性要求较高的消息，比如直播聊天室中的礼物，打赏等。 |
| `MessagePriority.NORMAL` | 正常等级，比如普通非重复性的文本消息。                             |
| `MessagePriority.LOW`    | 低等级，针对时效性要求较低的消息，比如直播聊天室中的弹幕。         |

消息等级在发送接口的参数中设置。以下代码演示了如何发送一个高等级的消息：

<div class="callout callout-info">此功能仅针对<u>聊天室消息</u>有效。普通对话的消息不需要设置等级，即使设置了也会被系统忽略，因为普通对话的消息不会被丢弃。</div>


### @ 成员提醒

发送消息的时候可以显式地指定这条消息提醒某一个或者一些人:

```js
const message = new TextMessage(`@Tom`).setMentionList('Tom').mentionAll();
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"@Tom" attributes:nil];
message.mentionList = @[@"Tom"];
[conversation sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention Tom has been sent. */
}];
```
```java
String content = "@Tom";
AVIMTextMessage  message = new AVIMTextMessage();
message.setText(content);
List<String> list = new ArrayList<>(); // 部分用户的 mention list，你可以向下面代码这样来填充
list.add("Tom");
message.setMentionList(list);
AVIMMessageOption option = new AVIMMessageOption();
option.setReceipt(true);
imConversation.sendMessage(message, option, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("@Tom")
{
    MentionList = new List<string>() { "Tom" }
};
await conversation.SendAsync(textMessage);
```

或者也可以提醒所有人：

```js
const message = new TextMessage(`@all`).mentionAll();
```
```objc
AVIMMessage *message = [AVIMTextMessage messageWithText:@"@all!" attributes:nil];
message.mentionAll = YES;
[conversation sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention all members has been sent. */
}];
```
```java
String content = "something as you will";
AVIMTextMessage  message = new AVIMTextMessage();
message.setText(content);

boolean mentionAll = true;// 指示是否 mention 了所有人
message.mentionAll(mentionAll);

AVIMMessageOption option = new AVIMMessageOption();
option.setReceipt(true);

imConversation.sendMessage(message, option, new AVIMConversationCallback() {
   @Override
   public void done(AVIMException e) {
   }
});
```
```cs
var textMessage = new AVIMTextMessage("@all")
{
    MentionAll = true
};
await conv.SendAsync(textMessage);
```

消息的接收方，可以通过读取消息的提醒列表来获取哪些 client Id 被提醒了：

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentionList = receivedMessage.getMentionList();
});
```
```objc
// 示例代码演示 AVIMTypedMessage 接收时，获取该条消息提醒的 client id 列表，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get mention list of client id.
     NSArray *mentionList = message.mentionList;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息 @ 的 client id 列表
  List<String> currentMsgMentionUserList = message.getMentionList();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
        var mentionedList = e.Message.MentionList;
    }
}
```

消息有一个标识位，用来标识是否提醒了当前对话的全体成员:

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentionedAll = receivedMessage.mentionedAll;
});
```
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前对话里的所有成员，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get this message mentioned all members of this conversion.
    BOOL mentionAll = message.mentionAll;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息是否 @ 了对话的所有成员
  boolean currentMsgMentionAllUsers = message.isMentionAll();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
         var mentionedAll = e.Message.MentionAll;
    }
}
```

消息另一个标识位用来标识当前用户是否被提醒，SDK 通过读取消息是否提醒了全体成员和当前 client id 是否在被提醒的列表里这两个条件计算出来当前用户是否被提醒：

```js
client.on(Event.MESSAGE, function messageEventHandler(message, conversation) {
  var mentioned = receivedMessage.mentioned;
});
```
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前 client id，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get if current client id mentioned by this message
    BOOL mentioned = message.mentioned;
}
```
```java
@Override
public void onMessage(AVIMAudioMessage msg, AVIMConversation conv, AVIMClient client) {
  // 读取消息是否 @ 了当前 client id
  boolean currentMsgMentionedMe = message.mentioned();
}
```
```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is AVIMImageMessage imageMessage)
    {
         // 判断当前用户是否被 @
         var mentioned = e.Message.MentionAll || e.Message.MentionList.Contains("Tom");
    }
}
```

### 消息的撤回和修改

> 需要在 控制台 > 消息 > 设置 中启用「聊天服务，对消息启用撤回功能」。

Tom 要撤回一条已发送的消息：

```js
conversation.recall(oldMessage).then(function(recalledMessage) {
  // 修改成功
  // recalledMessage is an RecalledMessage
}).catch(function(error) {
  // 异常处理
});
```
```objc
AVIMMessage *oldMessage = <#MessageYouWantToRecall#>;

[conversation recallMessage:oldMessage callback:^(BOOL succeeded, NSError * _Nullable error, AVIMRecalledMessage * _Nullable recalledMessage) {
    if (succeeded) {
        NSLog(@"Message has been recalled.");
    }
}];
```
```java
conversation.recallMessage(message, new AVIMMessageRecalledCallback() {
    @Override
    public void done(AVIMRecalledMessage recalledMessage, AVException e) {
        if (null == e) {
            // 消息撤回成功，可以更新 UI
        }
    }
});
```
```cs
await conversation.RecallAsync(message);
```

对应的是接收方会触发 `MESSAGE_RECALL` 的事件：

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.MESSAGE_RECALL, function(recalledMessage) {
  // recalledMessage 为已撤回的消息
  // 在视图层可以通过消息的 id 找到原来的消息并用 recalledMessage 替换
});
```
```objc
/* 实现 delegate 方法，以处理消息修改和撤回的事件 */
- (void)conversation:(AVIMConversation *)conversation messageHasBeenUpdated:(AVIMMessage *)message {
    /* A message has been updated or recalled. */

    switch (message.mediaType) {
    case kAVIMMessageMediaTypeRecalled:
        NSLog(@"message 是一条撤回消息");
        break;
    default:
        NSLog(@"message 是一条更新消息");
        break;
    }
}
```
```java
void onMessageRecalled(AVIMClient client, AVIMConversation conversation, AVIMMessage message) {
  // message 即为被撤回的消息
}
```
```cs
tom.OnMessageRecalled += Tom_OnMessageRecalled;
private void Tom_OnMessageRecalled(object sender, AVIMMessagePatchEventArgs e)
{
    // e.Messages 为被修改的消息，它是一个集合，SDK 可能会合并多次的消息撤回统一分发
}
```

Tom 要修改一条已发送的消息：

```js
var newMessage = new TextMessage('new message');
conversation.update(oldMessage, newMessage).then(function() {
  // 修改成功
}).catch(function(error) {
  // 异常处理
});
```
```objc
AVIMMessage *oldMessage = <#MessageYouWantToUpdate#>;
AVIMMessage *newMessage = [AVIMTextMessage messageWithText:@"Just a new message" attributes:nil];

[conversation updateMessage:oldMessage
                    toNewMessage:newMessage
                        callback:^(BOOL succeeded, NSError * _Nullable error) {
                            if (succeeded) {
                                NSLog(@"Message has been updated.");
                            }
}];
```
```java
AVIMTextMessage textMessage = new AVIMTextMessage();
textMessage.setContent("修改后的消息");
imConversation.updateMessage(oldMessage, textMessage, new AVIMMessageUpdatedCallback() {
  @Override
  public void done(AVIMMessage avimMessage, AVException e) {
    if (null == e) {
      // 消息修改成功，avimMessage 即为被修改后的最新的消息
    }
  }
});
```
```cs
// 直接修改对应的内容
textMessage.TextContent = "修改之后的文本消息内容";
// 将修改后的消息传入 ModifyAsync
conversation.ModifyAsync(textMessage);
```

对应的是接收方会触发 `MESSAGE_UPDATE`：

```js
var { Event } = require('leancloud-realtime');
conversation.on(Event.MESSAGE_UPDATE, function(newMessage) {
  // newMessage 为修改后的的消息
  // 在视图层可以通过消息的 id 找到原来的消息并用 newMessage 替换
});
```
```objc
/* 实现 delegate 方法，以处理消息修改和撤回的事件 */
- (void)conversation:(AVIMConversation *)conversation messageHasBeenUpdated:(AVIMMessage *)message {
    /* A message has been updated or recalled. */

    switch (message.mediaType) {
    case kAVIMMessageMediaTypeRecalled:
        NSLog(@"message 是一条撤回消息");
        break;
    default:
        NSLog(@"message 是一条更新消息");
        break;
    }
}
```
```java
void onMessageUpdated(AVIMClient client, AVIMConversation conversation, AVIMMessage message) {
  // message 即为被修改的消息
}
```
```cs
tom.OnMessageModified += Tom_OnMessageModified;
private void Tom_OnMessageModified(object sender, AVIMMessagePatchEventArgs e)
{
    // e.Messages  是一个集合，SDK 可能会合并多次消息修改统一分发
}
```


### 消息的离线推送通知

iOS 和 Android 分别提供了内置的离线消息推送通知服务，但是使用的前提是按照推送文档配置 iOS 的推送证书和 Android 开启推送的开关，详细请阅读如下文档：


在移动设备普及的现在，一个客户端离线是经常会出现的场景（进入地铁/电梯等无信号环境中），此时设备的离线会让消息无法通过实时地长连接送达到对方客户端，因此即时通讯服务通过移动设备的消息推送功能实现了离线消息的推送通知。

需要通过如下几个文档结合 LeanCloud 消息推送和即时通讯来实现如上需求：

1. [消息推送服务总览](push_guide.html)
2. [Android 消息推送开发指南](android_push_guide.html)/[iOS 消息推送开发指南](ios_push_guide.html)
3. [即时通讯概览 &middot; 离线推送通知](realtime_v2.html#离线推送通知)

#### 自定义离线推送的内容

如下代码实现的是在**发送消息时**指定离线推送的内容：

```js
var { Realtime, TextMessage } = require('leancloud-realtime');
var realtime = new Realtime({ appId: '', region: 'cn' });
realtime.createIMClient('Tom').then(function (host) {
    return host.createConversation({
        members: ['Jerry'],
        name: 'Tom & Jerry',
        unique: true
    });
}).then(function (conversation) {
    console.log(conversation.id);
    return conversation.send(new TextMessage('Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！'), {
        pushData: {
            "alert": "您有一条未读的消息",
            "category": "消息",
            "badge": 1,
            "sound": "声音文件名，前提在应用里存在",
            "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"
        }
    });
}).then(function (message) {
    console.log(message);
}).catch(console.error);
```
```objc
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.pushData = @{@"alert" : @"您有一条未读消息", @"sound" : @"message.mp3", @"badge" : @1, @"custom-key" : @"由用户添加的自定义属性，custom-key 仅是举例，可随意替换"};
[conversation sendMessage:[AVIMTextMessage messageWithText:@"Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！" attributes:nil] option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    // 在这里处理发送失败或者成功之后的逻辑
}];
```
```java
AVIMTextMessage msg = new AVIMTextMessage();
msg.setText("Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！");

AVIMMessageOption messageOption = new AVIMMessageOption();
messageOption.setPushData("自定义离线消息推送内容");
conv.sendMessage(msg, messageOption, new AVIMConversationCallback() {
    @Override
    public void done(AVIMException e) {
        if (e == null) {
        // 发送成功
        }
    }
});
```
```cs
var message = new AVIMTextMessage()
{
    TextContent = "Jerry，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！"
};

AVIMSendOptions sendOptions = new AVIMSendOptions()
{
    PushData = new Dictionary<string, object>()
    {
        { "alert", "您有一条未读的消息"},
        { "category", "消息"},
        { "badge", 1},
        { "sound", "message.mp3//声音文件名，前提在应用里存在"},
        { "custom-key", "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"}
    }
};
```

另外一种方式是，在云引擎使用 Hook 的方式统一设置离线推送消息内容，这种方式更为推荐，当客户端平台较多的时候（例如同时有 iOS 和 Android），在服务端统一设置可以减少客户端的重复代码逻辑，可以根据所需语言选择对应的云引擎即时通讯 Hook 文档：

- [云引擎 PHP 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-php.html#_receiversOffline)
- [云引擎 NodeJS 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-node.html#_receiversOffline)
- [云引擎 Python 即时通讯 Hook#_receiversOffline](leanengine_cloudfunction_guide-python.html#_receiversOffline)

## 消息记录的查询与获取

### 获取较新的消息

[基础入门#消息记录](realtime-guide-beginner.html#消息记录)演示的是从后往前（从最近的向更早）查询的方式，还有从前往后（以某一条消息为基准，查询它之后产生的消息）的查询方式。

如下代码演示从对话创建的时间点开始，从前往后查询消息记录：

```js
```
```objc
[conversation queryMessagesInInterval:nil direction:AVIMMessageQueryDirectionFromOldToNew limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageInterval internal = new AVIMMessageInterval(null, null);
conversation.queryMessages(internal, AVIMMessageQueryDirectionFromOldToNew, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageFromOldToNewAsync();
```

为了实现翻页，请配合下一节[从某一时间戳往某一方向查询](#从某一时间戳往某一方向查询)

### 从某一时间戳往某一方向查询

已某一条消息的 Id 和 时间戳为准，往一个方向查：

- 从后向前：以某一条消息为基准，查询它之**前**产生的消息
- 从前向后：以某一条消息为基准，查询它之**后**产生的消息


```js
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:timestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:nil];
[conversation queryMessagesInInterval:interval direction:direction limit:20 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageInterval internal = new AVIMMessageInterval(start, null);
AVIMMessageQueryDirection direction;
conversation.queryMessages(internal, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessages = await conversation.QueryMessageFromOldToNewAsync();
// get some messages after earliestMessages.Last()
var nextPageMessages = await conversation.QueryMessageAfterAsync(earliestMessages.Last());
```

### 获取区间内的消息

```js
```
```objc
AVIMMessageIntervalBound *start = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:startTimestamp closed:false];
    AVIMMessageIntervalBound *end = [[AVIMMessageIntervalBound alloc] initWithMessageId:nil timestamp:endTimestamp closed:false];
AVIMMessageInterval *interval = [[AVIMMessageInterval alloc] initWithStartIntervalBound:start endIntervalBound:end];
[conversation queryMessagesInInterval:interval direction:direction limit:100 callback:^(NSArray<AVIMMessage *> * _Nullable messages, NSError * _Nullable error) {
    if (messages.count) {
        // handle result.
    }
}];
```
```java
AVIMMessageIntervalBound start = AVIMMessageInterval.createBound(messageId, timestamp, false);
AVIMMessageIntervalBound end = AVIMMessageInterval.createBound(endMessageId, endTimestamp, false);
AVIMMessageInterval internal = new AVIMMessageInterval(start, end);
AVIMMessageQueryDirection direction;
conversation.queryMessages(internal, direction, limit,
  new AVIMMessagesQueryCallback(){
    public void done(List<AVIMMessage> messages, AVIMException exception) {
      // handle result
    }
});
```
```cs
var earliestMessage = await conversation.QueryMessageFromOldToNewAsync(limit: 1);
var latestMessage = await conversation.QueryMessageAsync(limit: 1);
// mex count for messagesInInterval is 100
var messagesInInterval = await conversation.QueryMessageInIntervalAsync(earliestMessage.FirstOrDefault(), latestMessage.FirstOrDefault());
```

### 客户端消息缓存

iOS 和 Android SDK 针对移动应用的特殊场景，实现了客户端消息的缓存（JavaScript 和 C# 暂不支持）。

客户端消息的缓存提供了如下便利：

1. 客户端可以在未联网的情况下进入对话列表之后，可以获取聊天记录，提升用户体验
2. 减少查询的次数和流量的消耗
3. 极大地提升了消息记录的查询速度和性能

而这一功能对于开发者来说是无感地：

1. 无需特殊设置，只要接收到消息就会自动被缓存在客户端
2. 修改/撤回等操作都有对本地消息缓存生效

{{ docs.relatedLinks("更多文档",[
  { title: "服务总览", href: "realtime_v2.html" },
  { title: "基础入门", href: "realtime-guide-beginner.html" }, 
  { title: "高阶技巧", href: "/realtime-guide-senior.html"}])
}}