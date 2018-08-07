# iOS 即时通讯服务

## 简介

在阅读本开发指南之前，请先阅读下[《即时通讯开发指南》](./realtime.html)，了解即时通讯的基本概念和模型。


与 Android 不同，iOS 并没有提供类似于 `service` 这样的组件。当应用进入后台，聊天组件将会关闭连接，session 进入 `paused` 状态。而当应用转入前台，聊天组件将会重新建立连接，session 进入 `resume` 状态。你可以实现 `AVSessionDelegate`相关方法，以完成即时通讯应用的开发。

**注意** 请首先确保你添加了如下依赖库

* SystemConfiguration.framework
* MobileCoreServices.framework
* CoreTelephony.framework
* CoreLocation.framework
* libicucore.dylib

## 实现你的 AVSessionDelegate

同 Android 版 SDK 类似，`AVsessionDelegate` 包含了与 session 相关的各种事件。你可以实现 `AVSessionDelegate`，对这些事件做出响应。

通信 sdk 的操作几乎都是异步的，操作后的结果通知都需要通过实现 `AVSessionDelegate` 相应回调方法来接收，比如消息发送后的结果、接收到消息、消息是否投递到目标用户等。

### sessionOpened

session 成功打开

```objc
- (void)sessionOpened:(AVSession *)session;
```

### sessionPaused

已经打开的 session 由于网络原因、或者应用转入后台，因而进入暂停状态。此时无法成功地发送消息。

```objc
- (void)sessionPaused:(AVSession *)session;
```

### sessionResumed

之前暂停的 session 重新恢复连接

```objc
- (void)sessionResumed:(AVSession *)session;
```

### session:didReceiveMessage:

收到别人发送给你的消息

```objc
- (void)session:(AVSession *)session didReceiveMessage:(AVMessage *)message;
```

### session:messageSendFinished:

服务器确认之前发送的消息已发出

```objc
- (void)session:(AVSession *)session messageSendFinished:(AVMessage *)message;
```

### session:messageSendFailed:

这些消息发出后没有及时收到服务器确认，客户端会启动重连流程，这些消息被认为发送失败。**注意：此时连接处在断开状态，不能立即重发，您可以缓存消息等 sessionResumed 的时候重新发送**。

```objc
- (void)session:(AVSession *)session messageSendFailed:(AVMessage *)message error:(NSError *)error;
```

### session:didReceiveStatus:peerIds:

你关注(watch)的用户状态改变了

```objc
- (void)session:(AVSession *)session didReceiveStatus:(AVPeerStatus)status peerIds:(NSArray *)peerIds;
```

### sessionFailed:error:

所有 `AVSession` 中操作失败会触发此回调

```objc
- (void)sessionFailed:(AVSession *)session error:(NSError *)error;
```

## 打开 session

通过下列代码开始一次会话：

```objc
AVSession *session = [[AVSession alloc] init];
session.sessionDelegate = self;
NSString *selfId = [self getMyUserId];

// 打开 session，同时关注一些 peer id
[session openWithPeerId:selfId watchedPeerIds:watchedIds];
```

open 结果在 `sessionOpened` 回调里处理。

## 实现签名（可选）

如果使用了签名认证，你需要实现 `AVSignatureDelegate`，并在调用 `[session open]`之前为 session 设置 `signatureDelegate`：

```objc
session.signatureDlegate = self;
```

需要说明的是，你需要为 AVSignatureDelegate 实现的方法是：

```objc
- (AVSignature *)signatureForPeerWithPeerId:(NSString *)peerId watchedPeerIds:(NSArray *)watchedPeerIds action:(NSString *)action;
```

你需要做的就是按照前文所述的签名算法实现签名，其中 `AVSignature` 声明如下：

```objc
@interface AVSignature : NSObject

@property (nonatomic, strong) NSString *signature;
@property (nonatomic) int64_t timestamp;
@property (nonatomic, strong) NSString *nonce;
@property (nonatomic, strong) NSArray *signedPeerIds;

@end
```

其中四个属性分别是:

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* signedPeerIds 签名通过的可关注的 signedPeerIds

## 关注、取消关注

如果应用启用了[签名认证](realtime.html#权限和认证)，在发送消息前，你需要 watch 用户(Super peer 除外)

```objc
/*!
 *  增量关注一组 peerIds
 *  @param peerIds peer id 数组
 */
- (void)watchPeerIds:(NSArray *)peerIds;  //同步调用，会阻塞当前线程
- (void)watchPeerIds:(NSArray *)peerIds callback:(AVBooleanResultBlock)callback;

/*!
 *  取消关注一组 peerIds
 *  @param peerIds peer id 数组
 */
- (void)unwatchPeerIds:(NSArray *)peerIds;  //同步调用，会阻塞当前线程
- (void)unwatchPeerIds:(NSArray *)peerIds callback:(AVBooleanResultBlock)callback;

```

watch 和 unwatch 的结果在 callback 中处理。

## 发送消息

使用如下方法构造一个AVMessage对象，注意：如果应用启用了[签名认证](realtime.html#权限和认证)，toPeerId 必须是已经关注（watch）了的，否则发送消息时将无法送达。

```objc
/*!
 *  构造一个发送给 toPeerId 的message对象
 *  @param session 服务器会话
 *  @param toPeerId 要发往的 peerId
 *  @param payload 消息载体
 *  @return message 对象
 */
+ (AVMessage *)messageForPeerWithSession:(AVSession *)session
                                toPeerId:(NSString *)toPeerId
                                 payload:(NSString *)payload;
```

调用如下方法发送消息。

```objc
/*!
 *  发送消息
 *  @param message 消息对象
 */
- (void)sendMessage:(AVMessage *)message;

/*!
 *  发送消息
 *  @param message 消息对象
 *  @param transient 设置为 YES, 当且仅当某个 peer 在线才会收到该条消息，且该条消息既不会存为离线消息，也不会通过消息推送系统发出去.
 *         如果设置为 NO, 则该条消息会设法通过各种途径发到 peer 客户端，比如即时通讯、推送、离线消息等。
 */
- (void)sendMessage:(AVMessage *)message transient:(BOOL)transient;

/*!
 *  发送消息
 *  @param message 消息对象
 *  @param requestReceipt 是否需要回执。
 */
- (void)sendMessage:(AVMessage *)message requestReceipt:(BOOL)requestReceipt;
```

服务器端确认收到消息后，你会收到`session:messageSendFinished:`事件，如果需要回执，消息到达对方后会收到`session:messageArrived:`事件。

## 聊天室功能

iOS SDK从v2.6.1开始提供聊天室功能。客户端对一个聊天室对象发送消息，所有监听这个聊天室的其他客户端，都能够收到这个消息；聊天室成员状态发生变化，每一个客户端会收到状态变化的消息。

### 基本组成

与 `AVSession` 相类似的，聊天组的实现构成非常简单，主要涉及的类只有3个：

`AVGroup` 来作为所有的聊天操作的接口类

`AVSignature`中多加入一个`-signatureForGroupWithPeerId:groupId:groupPeerIds:action:`方法来实现聊天室签名相关

`AVGroupDelegate` 协议用来实现接收到服务器反馈的聊天组消息后的回调处理

### 创建或加入一个聊天室
由于整个即时通讯功能都是建立在Session的基础上，所以您要加入一个聊天室也需要建立在一个已经打开的Session上。
当您已经打开一个Session以后，可以通过一下操作来加入一个Group

```objc
    //新建并加入一个聊天室
    [AVGroup createGroupWithSession:session groupDelegate:self callback:^(AVGroup *group, NSError *error) {
        if (!error) {
             //聊天室创建并加入成功
        } else {
            NSLog(@"error:%@", error);
        }
    }];
    //加入一个已经存在的聊天室
    AVGroup *group = [AVGroup getGroupWithGroupId:groupId session:session];
    group.delegate = self;
    [group join];
```

加入一个已经存在的聊天室时，成功以后delegate的`-[group:didReceiveEvent:peerIds:]`方法会被调用。

### 查询聊天室组员
在应用管理的数据中心的 `AVOSRealtimeGroups` 表中，记录所有聊天室基本信息。当你知道一个聊天室的groupId的时候，您就可以通过AVObject接口来查看这个聊天室的组员情况。

```objc
    AVObject *groupObject = [AVObject objectWithoutDataWithClassName:@"AVOSRealtimeGroups" objectId:groupId];
    [groupObject fetch];
    NSArray *groupMembers = [groupObject objectForKey:@"m"];
```

当然您也可以使用AVQuery来查询。

### 管理聊天室组员
在查询到聊天室组员以后，您可以邀请一些您的朋友加入，或者踢出一些"可怕"的组员。

```objc
    [group invitePeerIds:@[@"peerId1",@"peerId2",@"peerId3"]];
    [group kickPeerIds:@[@"peerId1",@"peerId2",@"peerId3"]];
```

成功以后delegate的`-[group:didReceiveEvent:peerIds:]`方法会被调用。

而被邀请的人或者被踢的人的客户端中，相应的`-[group:didReceiveEvent:peerIds:]`会被调用。

其中，`event`的定义如下：

```objc
typedef enum : NSUInteger {
    AVGroupEventSelfJoined = 1,
    AVGroupEventSelfLeft,        // 2
    AVGroupEventSelfRejected,    // 3
    AVGroupEventMemberJoined,    // 4
    AVGroupEventMemberLeft,      // 5
    AVGroupEventMemberInvited,   // 6
    AVGroupEventMemberKicked     // 7
} AVGroupEvent;
```

### 发送消息

通过如下代码您就可以向对应的聊天室发送代码:

```objc
    AVMessage *message = [AVMessage messageForGroup:group payload:@"hello world"];
    [group sendMessage:message];
```
发送成功后聊天室内的其他组员的客户端，`-[group:didReceiveMessage:]`方法会被调用，也就是接收到来自聊天室的消息。

### 签名(可选)

在群组功能中，我们对**加群**，**邀请**和**踢出群**这三个动作也允许加入签名，他的签名格式是：

```objc
app_id:peer_id:group_id:group_peer_ids:timestamp:nonce:action
```

其中：

* `app_id`, `peer_id`, `timestamp` 和 `nonce` 同上
* `group_id` 是此次行为关联的群组 ID
* `group_peer_ids` 是`:`分隔的 peer id，即邀请和踢出的 peer_id，对加入群的情况，这里是空字符串
* `action` 是此次行为的动作，三种行为分别对应常量 `join`, `invite` 和 `kick`

你需要为 AVSignatureDelegate 实现的方法是：

```objc
- (AVSignature *)signatureForGroupWithPeerId:(NSString *)peerId groupId:(NSString *)groupId groupPeerIds:(NSArray *)groupPeerIds action:(NSString *)action
```

##聊天记录查询

聊天记录的查询使用`AVHistoryMessageQuery`实现。可以通过不同参数构造不同类型的查询：

### 通用查询

```objc
+ (instancetype)query;
+ (instancetype)queryWithTimestamp:(int64_t)timestamp limit:(int)limit;
```

查询 `timestamp` 之前的聊天消息，其中 `timestamp` 是 unix 时间戳，单位毫秒。

### 查询指定ConversationId的记录

```objc
+ (instancetype)queryWithConversationId:(NSString *)conversationId;
+ (instancetype)queryWithConversationId:(NSString *)conversationId timestamp:(int64_t)timestamp limit:(int)limit;
```

conversationId的含义参考 [构建对话 ID](./rest_api.html#构建对话-id)

### 查询来自指定peerId的记录

```objc
+ (instancetype)queryWithFromPeerId:(NSString *)fromPeerId;
+ (instancetype)queryWithFromPeerId:(NSString *)fromPeerId timestamp:(int64_t)timestamp limit:(int)limit;
```

### 查询两个peerId之间的记录

```objc
+ (instancetype)queryWithFirstPeerId:(NSString *)firstPeerId secondPeerId:(NSString *)secondPeerId;
+ (instancetype)queryWithFirstPeerId:(NSString *)firstPeerId secondPeerId:(NSString *)secondPeerId timestamp:(int64_t)timestamp limit:(int)limit;
```

### 查询指定群组的记录

```objc
+ (instancetype)queryWithGroupId:(NSString *)groupId;
+ (instancetype)queryWithGroupId:(NSString *)groupId timestamp:(int64_t)timestamp limit:(int)limit;
```

### 实例

查询早于timestamp的 MyPeerId 和 TheOtherPeerId 之间的10条聊天记录

```objc
    AVHistoryMessageQuery *query = [AVHistoryMessageQuery queryWithFirstPeerId:@"MyPeerId" secondPeerId:@"TheOtherPeerId" timestamp:timestamp limit:10];
    [query findInBackgroundWithCallback:^(NSArray *objects, NSError *error) {
        if(!error) {
            //do something
        } else {
            NSLog(@"%@", error);
        }
    }];
```

查询群组 MyGroupId 的所有聊天记录

```objc
    AVHistoryMessageQuery *query = [AVHistoryMessageQuery queryWithGroupId:@"MyGroupId"];;
    [query findInBackgroundWithCallback:^(NSArray *objects, NSError *error) {
        if(!error) {
            //do something
        } else {
            NSLog(@"%@", error);
        }
    }];
```

## 离线消息推送

请参考 FAQ 中的 [为什么我的 iPhone 收不到离线消息推送？](realtime.html#为什么我的-iphone-收不到离线消息推送？) 
 
