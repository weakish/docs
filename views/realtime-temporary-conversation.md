{% import "views/_im.md" as imPartial %}

# 即时通讯 - 临时对话开发指南

{{ imPartial.gettingStarted() }}

临时对话是一个全新的概念，它解决的是一种特殊的聊天场景：

- 对话存续时间短
- 聊天参与的人数较少（最多为 10 个 Client Id）
- 聊天记录的存储不是强需求

这种对话场景，我们推荐使用临时对话，比较能够说明这种对话场景的现实需求就是：电商售前和售后的在线聊天的客服系统，可以对比京东或者淘宝的客服。


临时对话的使用可以减少对普通对话的查询压力（因为它并不会直接占用服务端 _Conversation 表的持久化存储的记录），天生的与传统的群聊，单聊做了隔离，这一点对于对话量大的应用来说是很有好处的。


临时对话与普通对话（群聊/单聊）的功能点区别如下表：

功能点|临时对话|普通对话
--|--|--
消息发送/消息接收|√|√
查询历史消息|√|√
接收离线消息|√|√
修改与撤回消息|√|√
查询在线成员|√|√
已读回执|√|√
订阅成员在线状态|√|√
对话成员数量查询|√|√
遗愿消息|√|√
加人/删人|✘|√
静音或者取消静音|✘|√
更新对话属性|✘|√


## 创建

![create-team-conv-seq](images/create-team-conv-seq.svg)


上图是创建临时对话的基本流程，A 发起临时对话，同时把 B 和 C 拉进了对话，B 和 C 会收到事件通知，具体的代码如下：

```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL success, NSError *error) {
    
    if (success) {
        
        [client createTemporaryConversationWithClientIds:@[@"Jerry", @"William"]
                                                timeToLive:0
                                                callback:
            ^(AVIMTemporaryConversation *tempConv, NSError *error) {
                
                AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这里是临时对话"
                                                                    attributes:nil];
                
                [tempConv sendMessage:textMessage callback:^(BOOL success, NSError *error) {
                    
                    if (success) {
                        // send message success.
                    }
                }];
            }];
    }
}];
```
```java
AVIMClient client = AVIMClient.getInstance("Tom");
client.open(new AVIMClientCallback() {
    @Override
    public void done(AVIMClient avimClient, AVIMException e) {
    if (null == e) {
        String[] members = {"Jerry", "William"};
        avimClient.createTemporaryConversation(Arrays.asList(members), new AVIMConversationCreatedCallback(){
        @Override
        public void done(AVIMConversation conversation, AVIMException e) {
            if (null == e) {
            AVIMTextMessage msg = new AVIMTextMessage();
            msg.setText("这里是临时对话");
            conversation.sendMessage(msg, new AVIMConversationCallback(){
                @Override
                public void done(AVIMException e) {
                }
            });
            }
        }
        });
    }
    }
});
```
```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createTemporaryConversation({
    members: ['Jerry', 'William'],
  });
}).then(function(conversation) {
  return conversation.send(new AV.TextMessage('这里是临时对话'));
}).catch(console.error);
```

## 有效时间

与其他对话类型不同的是，临时对话有一个**重要**的属性：TTL，它标记着这个对话的有效期，系统默认是 1 天，但是在创建对话的时候是可以指定这个时间的，最高不超过 30 天，如果您的需求是一定要超过 30 天，请使用普通对话，传入 TTL 创建临时对话的代码如下：

```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL success, NSError *error) {
    
    if (success) {
        
        [client createTemporaryConversationWithClientIds:@[@"Jerry", @"William"]
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
    }
}];
```
```java
AVIMClient client = AVIMClient.getInstance("Tom");
client.open(new AVIMClientCallback() {
    @Override
    public void done(AVIMClient avimClient, AVIMException e) {
    if (null == e) {
        String[] members = {"Jerry", "William"};
        avimClient.createTemporaryConversation(Arrays.asList(members), 3600, new AVIMConversationCreatedCallback(){
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
    }
    }
});
```
```js
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createTemporaryConversation({
    members: ['Jerry', 'William'],
    ttl: 3600,
  });
}).then(function(conversation) {
  return conversation.send(new AV.TextMessage('这里是临时对话，一小时之后，这个对话就会消失'));
}).catch(console.error);
```

## 接收消息

{{ imPartial.receivedMessage() }}

## 其他接口

查询历史消息记录和自定义消息类型以及其他所有对话级别的操作都可以参照普通对话的文档，并无特殊，文档地址在本文的[开始之前](#开始之前)


## FAQ

Q： 临时对话的好处是什么？
A： 临时对话不会在云端的 _Conversation 里面产生记录，在客服聊天这种需求场景下，客户较多而产生许多废弃的对话，临时对话可以减少查询压力。

Q： 临时对话在哪些场景下，不推荐使用？
A： 持久化有成员进出以及权限概念的群组聊天（例如公司业务部门的工作频道），私聊，讨论组，这些场景请**不要**使用临时对话，使用普通对话才可以满足需求。


