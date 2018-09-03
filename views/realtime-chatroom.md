{% import "views/_im.md" as imPartial %}

# 即时通讯 - 聊天室开发指南

{{ imPartial.gettingStarted() }}

聊天室是专门针对网络互动直播，在线比赛直播，文字直播等业务场景提供的抽象概念，它具备无人数上限，超大消息并发量的特性，同时相对于传统对话，它舍弃了多余的一些事件通知，例如没有人员变动的通知，减少多余了网络传输量。

## AVIMChatRoom

它的大概使用流程是这样的：

![realtime-chatroom-seq](images/realtime-chatroom-seq.svg)

## 创建聊天室

```objc
 AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];
    
    [client openWithCallback:^(BOOL success, NSError *error) {
        
        if (success && !error) {
            
            [client createChatRoomWithName:@"聊天室"
                                attributes:nil
                                  callback:
             ^(AVIMChatRoom *chatRoom, NSError *error) {
                 
                 if (chatRoom && !error) {
                     
                     AVIMTextMessage *textMessage = [AVIMTextMessage messageWithText:@"这是一条消息"
                                                                          attributes:nil];
                     
                     [chatRoom sendMessage:textMessage callback:^(BOOL success, NSError *error) {
                         
                         if (success && !error) {
                             
                             // send message success.
                         }
                     }];
                 }
             }];
        }
    }];
```
```java
AVIMChatRoom room = (AVIMChatRoom) LCChatKit.getInstance().getClient().getChatRoom("conversationId");
room.quit(new AVIMConversationCallback() {
@Override
public void done(AVIMException ex) {
    if (null != ex) {
    showToast(ex.getMessage());
    } else {
    ;
    }
}
});
```
```js
var AV = require('leancloud-storage');
var { Realtime } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  return tom.createChatRoom({ name:'聊天室' })
}).catch(console.error);
```

## 查询聊天室

```objc
[client.conversationQuery getConversationById:@"Chat Room ID" callback:^(AVIMConversation *chatRoom, NSError *error) {
            
            if (chatRoom && [chatRoom isKindOfClass:[AVIMChatRoom class]] && !error) {
                
                // query success.
            }
}];
```
```java
AVIMConversationsQuery query = imClient.getChatRoomQuery();
query.whereEqualTo("name", "天南海北聊天室");
query.findInBackground(new AVIMConversationQueryCallback() {
@Override
public void done(List<AVIMConversation> conversations, AVIMException e) {
    if (null != e) {
    showToast(e.getMessage());
    } else {
    // get results.
    }
}
});
```
```js
tom.getQuery().equalTo('name', '天南海北聊天室').find(function(conversations){
      var chatRoom = conversations[0];// 聊天室对象
}).catch(console.error);
```

## 加入聊天室

注意，一个 client id 在一个应用内同一时间只允许存在于一个聊天室，只要他再次加入别的聊天室，他就会自动离开上一个聊天室，不再接收到上一个聊天室产生的新消息，这个很好理解，比如你在观看斗鱼直播时，不可以同时进入两个直播间。

```objc
[client.conversationQuery getConversationById:@"Chat Room ID" callback:^(AVIMConversation *conversation, NSError *error) {
            AVIMChatRoom *chatRoom = (AVIMChatRoom *)conversation;
            if ([chatRoom isKindOfClass:[AVIMChatRoom class]]) {
                [chatRoom joinWithCallback:^(BOOL succeeded, NSError * _Nullable error) {
                    if (succeeded) {
                        // handle it.
                    }
                }];
            }
}];
```
```java
AVIMConversationsQuery avimConversationsQuery = avimClient.getConversationsQuery();
avimConversationsQuery.whereEqualTo("objectId", "Chat Room ID");
avimConversationsQuery.findInBackground(new AVIMConversationQueryCallback() {
    @Override
    public void done(List<AVIMConversation> list, AVIMException e) {
        if (list.get(0) instanceof AVIMChatRoom) {
            list.get(0).join(new AVIMConversationCallback() {
                @Override
                public void done(AVIMException e) {
                    if (e == null) {

                    } else {
                        e.printStackTrace();
                    }
                }
            });
        } 
    }
});
```
```js
tom.getQuery({ name:'天南海北聊天室' }).find(function(conversations){
      var chatRoom = conversations[0];// 聊天室对象
      return chatRoom.join();
}).then(function(success)
{
    if(success) console.log('加入成功');
}).catch(console.error);
```

## 接收消息

{{ imPartial.receivedMessage() }}


## 退出聊天室

当然前面已经说过，只要你加入新的聊天室，服务的端自然会帮你退出旧的聊天室，但是有一些情况是，客户端就只想退出聊天室，SDK 也提供了相应的接口：

```objc
[chatRoom quitWithCallback:^(BOOL success, NSError *error) {
    
    if (success && !error) {
        
        // quit success.
    }
}];
```
```java
chatRoom.quit(new AVIMConversationCallback() {
@Override
public void done(AVIMException ex) {
    if (null != ex) {
        showToast(ex.getMessage());
    } else {

    }}
});
```
```js
chatRoom.quit().then(function(success){
    if(success) console.log('退出成功');
}).catch(console.error);
```


## FAQ

Q: 如何确保聊天室的消息全量送达？
A: 这一点请参考我们的[消息分级](/realtime_guide-objc.html#消息等级)

