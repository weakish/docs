{% import "views/_im.md" as imPartial %}

# 即时通讯 - 服务号开发指南

{{ imPartial.gettingStarted() }}

在一些常见应用场景下，开发者需要向用户提供一个类似于系统通知，订单通知，好友申请之类的频道，针对这类实时信息进行在线投递，因此我们基于即时通讯的 SDK 重新二次封装了一个新的对话模型：


## AVIMServiceAccount

使用流程大致如下：

![realtime-service-account-seq](images/realtime-service-account-seq.svg)


## 创建 AVIMServiceAccount

服务号的创建需要较高的权限，因此客户端并不提供创建的接口，请参考[即时通讯 REST API](realtime_rest_api.html#创建一个对话)


## 查询服务号
客户端可以通过在查询对话列时，传入 sys = ture 的参数来获取系统对话列表，为之后的订阅操作做准备：

```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];
[client openWithCallback:^(BOOL success, NSError *error) {
    if (success) {
        AVIMConversationQuery *query = client.conversationQuery;
        [query whereKey:@"sys" equalTo:@(true)];
        [query findConversationsWithCallback:^(NSArray<AVIMConversation *> * _Nullable conversations, NSError * _Nullable error) {
            if (conversations && conversations.count > 0) {
                // handle it
            }
        }];
    }
}];
```
```java
 AVIMClient avimClient = AVIMClient.getInstance("Tom");
        avimClient.open(new AVIMClientCallback() {
            @Override
            public void done(AVIMClient avimClient, AVIMException e) {
                AVIMConversationsQuery avimConversationsQuery = avimClient.getConversationsQuery();
                avimConversationsQuery.whereEqualTo("sys",true);
                avimConversationsQuery.findInBackground(new AVIMConversationQueryCallback() {
                    @Override
                    public void done(List<AVIMConversation> list, AVIMException e) {
                        if (e == null){

                        }else {
                            e.printStackTrace();
                        }
                    }
                });
            }
        });
```
```js
var AV = require('leancloud-storage');
var { Realtime } = require('leancloud-realtime');
// Tom 用自己的名字作为 clientId, 建立长连接，并且获取 IMClient 对象实例
realtime.createIMClient('Tom').then(function(tom) {
  return tom.getQuery().equalTo('sys', true).find();
}).then(function(conversations){
    // 查询到的服务号
}).catch(console.error);
```

## 订阅
根据上一个步骤，获取到的系统对话，选取一个符合条件的，比如就获取最新创建的系统对话，在客户端订阅它：

```objc
AVIMServiceConversation *serviceConversation = (AVIMServiceConversation *)conv;

[serviceConversation subscribeWithCallback:^(BOOL success, NSError *error) {
    
    if (success && !error) {
        
        // subscribe Service Conversation success.
    }
}];
```
```java
if (list.get(0) instanceof AVIMServiceConversation) {
    ((AVIMServiceConversation) list.get(0)).subscribe(new AVIMConversationCallback() {
        @Override
        public void done(AVIMException e) {
            if (e == null) {

            } else {
                e.printStackTrace();
            }
        }
    });
} else {
    e.printStackTrace();
}
```
```js
tom.getQuery().equalTo('sys', true).find().then(function(conversations){
    var serviceConversation = conversations[0];
    return serviceConversation.subscribe();
}).then(function(success){

}).catch(console.error);
```

## 接收消息

{{ imPartial.receivedMessage() }}

## 离线消息推送
用过微信或者陌陌的用户应该有过这种体验，手机锁屏之后，有人加你为好友，你依然可以收到一条推送说：[某某某申请添加您为好友]，这个其实就是利用了离线推送的机制，服务号也提供这种功能，但是前提是在发送消息的时候将消息的类型设置为非暂态，它的含义就是如果订阅者在线，就走长连接发送给用户，用户会在 serviceAccount.onMessage 上收到，否则就走离线消息推送，确保用户能在设备的推送频道里面收到。


## 取消订阅

```objc
AVIMServiceConversation *serviceConversation = (AVIMServiceConversation *)conv;

[serviceConversation unsubscribeWithCallback:^(BOOL success, NSError *error) {
    
    if (success && !error) {
        
        // unsubscribe Service Conversation success.
    }
}];
```
```java
AVIMServiceConversation sc = imClient.getServiceConversation("convId");
sc.unsubscribe(new AVIMConversationCallback() {
  @Override
  public void done(AVIMException e) {

  }
});
```
```js
tom.getConversation(CONVERSATION_ID).then(function(conversation) {
    var serviceConversation = conversation;
    return serviceConversation.unsubscribe();
}).catch(console.error);
```

## FAQ

Q: 服务号可以用来做微信类似的公众号么？

A: 完全可以，我们封装这个对象的原因就是要解决这种需求。

Q: 服务号有订阅人数上限么？

A: 无上限。

Q: 服务号可以创建多少个？

A: 单个应用允许 100 个。

Q: 服务号的消息有数量限制么？

A: 消息总数不限制，但是一个服务号同时下发的消息下行数量是有限制的。






