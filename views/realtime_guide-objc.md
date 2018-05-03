{% extends "./realtime_guide.tmpl" %}
{% set platform_name = 'Objective-C' %}
{% set segment_code = 'objc' %}
{% set sdk_name = platform_name + " SDK" %}

{% block demo %}
* [ChatKit-OC](https://github.com/leancloud/ChatKit-OC)（推荐）
{% endblock %}

{% block setup_init %}
请参考详细的 [{{sdk_name}} 安装指南](sdk_setup-objc.html)。
{% endblock %}

{% block compatibility %}
### 示例代码约定

在以下示例代码中，若无特殊说明，所有代码均位于下面这个类的实现文件中：

```objc
@interface TomAndJerryEpisode : NSObject

@end

@implementation TomAndJerryEpisode

// 所有示例代码均位于此处

@end
```

对于像 `self.prop` 这样的引用，我们约定 `prop` 属性在 `TomAndJerryEpisode` 类中已经有了正确的实现。例如：

```
self.client = [[AVIMClient alloc] init];
```

若想让它正确执行，需要在当前的 `ViewController.m` 中添加一个 `AVIMClient` 属性：

```
@property (nonatomic, strong) AVIMClient *client;
```

以此类推。

我们也故意省略了错误处理，有时还会省略一些上下文逻辑，目的是让示例代码简明扼要。

示例代码并不是最佳实践，仅为演示 SDK 接口的基础用法。
{% endblock %}

{% block oneOnOneChat_sent %}
```objc
- (void)tomSendMessageToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一条消息给 Jerry
            [conversation sendMessage:[AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```

{{ im.clientOpenClose({open: "[AVIMClient openWithCallback:]", close: "[AVIMClient closeWithCallback:]"}) }}

{% endblock %}

{% block avoidCreatingDuplicateConversation %}{% endblock %}

{% block oneOnOneChat_received %}
```objc
- (void)jerryReceiveMessageFromTom {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Jerry"];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Jerry 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

// 接收消息的回调函数
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // 耗子，起床！
}
```
{% endblock %}

{% block groupChat_sent %}
```objc
- (void)tomCreateConversationWithFriends {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与朋友们的会话
        NSArray *friends = @[@"Jerry", @"Bob", @"Harry", @"William"];
        [self.client createConversationWithName:@"Tom and friends" clientIds:friends callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一条消息给朋友们
            [conversation sendMessage:[AVIMTextMessage messageWithText:@"你们在哪儿？" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block groupChat_received %}
```objc
- (void)bobReceiveMessageFromFriends {
    // Bob 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Bob"];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Bob 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // 你们在哪儿？

    AVIMTextMessage *reply = [AVIMTextMessage messageWithText:@"Tom，我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？" attributes:nil];

    [conversation sendMessage:reply callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"回复成功！");
        }
    }];
}
```
{% endblock %}

{% block imageMessage_local_sent %}
```objc
- (void)tomSendLocalImageToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 创建了一个图像消息
            NSString *filePath = [self imagePath];
            NSDictionary *attributes = @{ @"location": @"旧金山" };
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"发自我的 iPhone" attachedFilePath:filePath attributes:attributes];

            // Tom 将图像消息发给 Jerry
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block imageMessage_url_sent %}
```objc
- (void)tomSendExternalImageToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一张图片给 Jerry
            AVFile *file = [AVFile fileWithURL:[self imageURL]];
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"萌妹子一枚" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block imageMessage_received_intro %}
在接收图像消息这种富媒体消息时，需要使用 `conversation:didReceiveTypedMessage:` 方法。实际上接收所有富媒体消息都是如此，因为它们都是从 `AVIMTypedMessage` 派生出来的。相关内容可以在下面的 [消息类详解](#消息类详解) 中找到。
{% endblock %}

{% block imageMessage_received %}
```objc
- (void)jerryReceiveImageMessageFromTom {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.clientJerry = [[AVIMClient alloc] initWithClientId:@"Jerry"];
    self.clientJerry.delegate = self;

    // Jerry 打开 client
    [self.clientJerry openWithCallback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

    // 消息的 id
    NSString *messageId = imageMessage.messageId;
    // 图像文件的 URL
    NSString *imageUrl = imageMessage.file.url;
    // 发该消息的 ClientId
    NSString *fromClientId = message.clientId;
}
```
{% endblock %}

{% block audioMessage_local_sent %}
```objc
- (void)tomSendAudioToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一首歌曲给 Jerry
            NSString *path = [[NSBundle mainBundle] pathForResource:@"忐忑" ofType:@"mp3"];
            AVFile *file = [AVFile fileWithName:@"忐忑.mp3" contentsAtPath:path];
            AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲~" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block audioMessage_url_sent %}
```objc
- (void)tomSendExternalAudioToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一首歌曲给 Jerry
            AVFile *file = [AVFile fileWithURL:@"http://ac-lhzo7z96.clouddn.com/1427444393952"];
            AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲~" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block audioMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block videoMessage_local_sent %}
```objc
- (void)tomSendVideoToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一个视频给 Jerry
            NSString *path = [[NSBundle mainBundle] pathForResource:@"BBC_奶酪" ofType:@"mp4"];
            AVFile *file = [AVFile fileWithName:@"BBC_奶酪.mp4" contentsAtPath:path];
            AVIMVideoMessage *message = [AVIMVideoMessage messageWithText:nil file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block videoMessage_url_sent %}
```objc
- (void)tomSendExternalVideoToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一段视频给 Jerry
            AVFile *file = [AVFile fileWithURL:@"http://ac-lhzo7z96.clouddn.com/1427267336319"];
            AVIMVideoMessage *message = [AVIMVideoMessage messageWithText:nil file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block videoMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block fileMessage_sent %}
iOS 暂不支持发送通用文件消息，已在计划中，近期发布。
{% endblock %}

{% block fileMessage_receive_intro %}
iOS 暂不支持发送通用文件消息，已在计划中，近期发布。
{% endblock %}

{% block locationMessage_new %}
```objc
[AVIMLocationMessage messageWithText:nil latitude:45.0 longitude:34.0 attributes:nil];
```
{% endblock %}

{% block locationMessage_sent %}
```objc
- (void)tomSendLocationToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一个地理位置给 Jerry
            // NOTE: 开发者更可以通过具体的设备的 API 去获取设备的地理位置
            AVIMLocationMessage *message = [AVIMLocationMessage messageWithText:@"新开的蛋糕店！耗子咱们有福了…" latitude:45.0 longitude:34.0 attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block locationMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block typedMessage_received %}
所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `[AVIMConversation sendMessage:callback:]` 函数。在接收端，我们也在 `AVIMClientDelegate` 中专门增加了一个回调函数：

```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```
这样，如果发送端发送的是 AVIMMessage 消息，那么接受端就是 `conversation:didReceiveCommonMessage:` 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `conversaion:didReceiveTypedMessage` 被调用。
{% endblock %}

{% block transientMessage_sent %}
```objc
typedef NS_ENUM(NSInteger, YourCustomMessageType) {
    YourCustomMessageTypeOperation = 1
};

@interface YourOperationMessage : AVIMTextMessage <AVIMTypedMessageSubclassing>

@end

@implementation YourOperationMessage

+ (AVIMMessageMediaType)classMediaType {
    return YourCustomMessageTypeOperation;
}

@end

@implementation ViewController

+ (void)load {
    // 自定义消息需要注册
    [YourOperationMessage registerSubclass];
}

- (void)tomOpenConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.tomClient = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.tomClient openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.tomClient conversationQuery];
        // Tom 获取 id 为 551260efe4b01608686c3e0f 的会话
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            self.tomConversation = conversation;
        }];
    }];
}

- (void)textFieldDidChange:(UITextField *)textField {
    // 发送一条暂态消息给 Jerry，让 Jerry 知道 Tom 正在输入
    YourOperationMessage *message = [YourOperationMessage messageWithText:@"正在输入……" attributes:nil];
    [self.tomConversation sendMessage:message options:AVIMMessageSendOptionTransient callback:nil];
}

@end
```
{% endblock %}

{% block transientMessage_received %}
```objc
- (void)jerryOnline {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.jerryClient = [[AVIMClient alloc] initWithClientId:@"Jerry"];

    // Jerry 打开 client
    [self.jerryClient openWithCallback:^(BOOL succeeded, NSError *error) {
        NSLog("Jerry opened client")
    }];
}

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if (message.mediaType == YourCustomMessageTypeOperation) {
        NSLog(@"正在输入……");
    }
}
```
{% endblock %}

{% block messagePolicy_sent %}{% endblock %}

{% block offlineMessage %}
当然，前提是应用本身申请到了 RemoteNotification 权限，并且开发者也已经把正确的推送证书上传到了 LeanCloud 控制台。
{% endblock %}

{% block message_sent_ack_switch %}
调用 `sendMessage` 方法时，在 options 中传入 `AVIMMessageSendOptionRequestReceipt`：

```objc
[conversation sendMessage:message options:AVIMMessageSendOptionRequestReceipt callback:^(BOOL succeeded, NSError *error) {
  if (succeeded) {
    NSLog(@"发送成功！需要回执");
  }
}];
```
{% endblock %}

{% block message_sent_ack %}
监听消息是否已送达实现 `conversation:messageDelivered` 即可。
```objc
- (void)conversation:(AVIMConversation *)conversation messageDelivered:(AVIMMessage *)message{
    NSLog(@"%@", @"消息已送达。"); // 打印消息
}
```
{% endblock %}

{% block message_read_ack %}
1. 首先，Tom 和 Jerry 都要开启「未读消息」，即在 SDK 初始化语句后面加上：
  
    ```objc
    [AVIMClient setUnreadNotificationEnabled:YES];
    ```
2. Tom 向 Jerry 发送一条消息，要标记好「需要回执」：
  
    ```objc
    AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
    option.receipt = YES; /* 将消息设置为需要回执。 */

    AVIMTextMessage *message = [AVIMTextMessage messageWithText:@"Hello, Jerry!" attributes:nil];

    [conversaiton sendMessage:message option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
        if (!error) {
            /* 发送成功 */
        }
    }];
    ```

3. Jerry 收到 Tom 发的消息后，SDK 调用对话上的方法把「对话中最近的消息」标记为已读：
  
    ```objc
    [conversation readInBackground];
    ```
4. Jerry 读完消息后，Tom 将收到一个已读回执，此时对话的 `lastReadAt` 属性会更新。此时可以更新 UI，把时间戳小于 lastReadAt 的消息都标记为已读。
  
    ```objc
    // Tom 可以在 client 的 delegate 方法中捕捉到 lastReadAt 的更新
    - (void)conversation:(AVIMConversation *)conversation didUpdateForKey:(NSString *)key {
        if ([key isEqualToString:@"lastReadAt"]) {
            NSDate *lastReadAt = conversation.lastReadAt;
            /* Jerry 阅读了你的消息。可以使用 lastReadAt 更新 UI，例如把时间戳小于 lastReadAt 的消息都标记为已读。 */
        }
    }
    ```
{% endblock %}

{% block message_unread_message_count %}
要开启未读消息，需要在 AVOSCloud 初始化语句后面加上：

```objc
[AVIMClient setUnreadNotificationEnabled:YES];
```

然后使用代理方法 `conversation:didUpdateForKey:` 来观察对话的 `unreadMessagesCount` 属性：

```objc
- (void)conversation:(AVIMConversation *)conversation didUpdateForKey:(NSString *)key {
    if ([key isEqualToString:@"unreadMessagesCount"]) {
        NSUInteger unreadMessagesCount = conversation.unreadMessagesCount;
        /* 有未读消息产生，请更新 UI，或者拉取对话。 */
    }
}
```
{% endblock %}

{% block message_Relation_intro %}
![message type diagram](images/message_type_diagram.png)
{% endblock %}

{% block message_Properties_intro %}
所有消息都是 `AVIMMessage` 的实例，每种消息实例都具备如下属性：

| 属性                 | 类型                   | 描述                                       |
| ------------------ | -------------------- | ---------------------------------------- |
| content            | NSString             | 消息内容                                     |
| clientId           | NSString             | 指消息发送者的 clientId                         |
| conversationId     | NSString             | 消息所属对话 id                                |
| messageId          | NSString             | 消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 id     |
| sendTimestamp      | int64_t              | 消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| deliveredTimestamp | int64_t              | 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。 |
| {{ messageStatusAnchor }}             | AVIMMessageStatus 枚举 | 消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusDelivered`（被接收）<br/>`AVIMMessageStatusFailed`（失败） |
| ioType             | AVIMMessageIOType 枚举 | 消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出） |

我们为每一种富媒体消息定义了一个消息类型，实时通信 SDK 自身使用的类型是负数（如下面列表所示），所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。

| 消息   | 类型   |
| ---- | ---- |
| 文本消息 | -1   |
| 图像消息 | -2   |
| 音频消息 | -3   |
| 视频消息 | -4   |
| 位置消息 | -5   |
| 文件消息 | -6   |

<!-- >TODO: 举例说明如何使用这样的数字类型 -->
{% endblock %}

{% set attributes = '`AVIMTypedMessage.attributes`' %}

{% block attributes_property %}attributes{% endblock %}

{% block customAttributesMessage_sent %}
```objc
- (void)tomSendLocalImageToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 创建了一个图像消息
            NSString *filePath = [self imagePath];
            NSDictionary *attributes = @{ @"location": @"拉萨布达拉宫" };
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"这蓝天……我彻底是醉了" attachedFilePath:filePath attributes:attributes];

            // Tom 将图像消息发给 Jerry
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block customAttributesMessage_received %}
```objc
- (void)jerryReceiveMessageFromTom {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"friend"];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Jerry 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if ([message isKindOfClass:[AVIMImageMessage class]]) {
        AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

        // 拉萨布达拉宫
        NSString *location = imageMessage.attributes[@"location"];
    }
}
```
{% endblock %}

{% block customMessage_create %}
继承于 `AVIMTypedMessage`，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现 `AVIMTypedMessageSubclassing` 协议；
* 子类将自身类型进行注册，一般可在子类的 `+load` 方法或者 UIApplication 的 `-application:didFinishLaunchingWithOptions:` 方法里面调用 `[YourClass registerSubclass]`。
{% endblock %}

{% block messagePolicy_received_intro %}{% endblock %}

{% block messagePolicy_received_method %}`conversation:didReceiveCommonMessage:`{% endblock %}

{% block messagePolicy_received %}{% endblock %}

{% block conversation_specialnote %}{% endblock %}

{% block conversation_init %}
```objc
- (void)jerryCreateConversationWithFriends {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Jerry"];

    // Jerry 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Jerry 建立了与朋友们的会话
        NSArray *friends = @[@"Jerry", @"Bob", @"Harry", @"William"];
        [self.client createConversationWithName:@"Tom and friends" clientIds:friends callback:^(AVIMConversation *conversation, NSError *error) {
            if (!error) {
                NSLog(@"创建成功");
            }
        }];
    }];
}
```
{% endblock %}

{% set message_priority_high_varname    = 'AVIMMessagePriorityHigh' %}
{% set message_priority_normal_varname  = 'AVIMMessagePriorityNormal' %}
{% set message_priority_low_varname     = 'AVIMMessagePriorityLow' %}

{% block message_option_priority %}

```objc
// Tom 创建了一个 client，用自己的名字作为 clientId
self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

// Tom 打开 client
[self.client openWithCallback:^(BOOL succeeded, NSError *error) {
    // Tom 建立了与 Jerry 的会话
    [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
        // Tom 发了一条消息给 Jerry
        
        AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
        option.priority = AVIMMessagePriorityHigh;
        [conversation sendMessage:[AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil] option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
            // 在这里处理发送失败或者成功之后的逻辑
        }];
        
    }];
}];
```
{% endblock %}

{% block message_push_data %}

```objc
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.pushData = @{@"alert" : @"您有一条未读消息", @"sound" : @"message.mp3", @"badge" : @1, @"custom-key" : @"由用户添加的自定义属性，custom-key 仅是举例，可随意替换"};
[conversation sendMessage:[AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil] option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    // 在这里处理发送失败或者成功之后的逻辑
}];
```
{% endblock %}


{% block conversation_creation_api %}
### 创建对话

有两个方法可以创建对话：

```objc
/*!
 创建一个新的用户对话。
 在单聊的场合，传入对方一个 clientId 即可；群聊的时候，支持同时传入多个 clientId 列表
 @param name - 对话名称。
 @param clientIds - 聊天参与者（发起人除外）的 clientId 列表。
 @param callback － 对话建立之后的回调
 @return None.
 */
- (void)createConversationWithName:(NSString *)name
                         clientIds:(NSArray *)clientIds
                          callback:(AVIMConversationResultBlock)callback;

/*!
 创建一个新的用户对话。
 在单聊的场合，传入对方一个 clientId 即可；群聊的时候，支持同时传入多个 clientId 列表
 @param name - 对话名称。
 @param clientIds - 聊天参与者（发起人除外）的 clientId 列表。
 @param attributes - 对话的自定义属性。
 @param options － 可选参数，可以使用或 “|” 操作表示多个选项
 @param callback － 对话建立之后的回调
 @return None.
 */
- (void)createConversationWithName:(NSString *)name
                         clientIds:(NSArray *)clientIds
                        attributes:(NSDictionary *)attributes
                           options:(AVIMConversationOption)options
                          callback:(AVIMConversationResultBlock)callback;
```

各参数含义如下：

* **name** － 表示对话名字，可以指定任意有意义的名字，也可不填。
* **clientIds** － 表示对话初始成员，可不填。如果填写了初始成员，则 LeanCloud 云端会直接给这些成员发出邀请，省掉再专门发一次邀请请求。
* **attributes** － 表示额外属性，Dictionary，支持任意的 key/value，可不填。
* **options** － 对话选项：
    1. `AVIMConversationOptionTransient`：聊天室，具体可以参见[创建聊天室](#创建聊天室)；
    2. `AVIMConversationOptionNone`：普通对话；
    3. `AVIMConversationOptionUnique`：根据成员（clientIds）创建原子对话。如果没有这个选项，服务端会为相同的 clientIds 创建新的对话。clientIds 即 \_Conversation 表的 **m** 字段。

  其中，`AVIMConversationOptionNone` 和 `AVIMConversationOptionUnique` 可以使用 `|` 来组合使用，其他选项则不允许。
* **callback** － 结果回调，在操作结束之后调用，通知开发者成功与否。
  {% endblock %}

{% block event_memberJoin %} `membersAdded` {% endblock %}

{% block event_memberLeft %} `membersRemoved` {% endblock %}

{% block event_kicked %} `kickedByClientId` {% endblock %}

{% block event_invited %} `invitedByClientId` {% endblock %}

{% block api_method_conversation_join %} `AVIMConversation.joinWithCallback`{% endblock %}

{% block api_method_conversation_invite %} `AVIMConversation.addMembersWithClientIds`{% endblock %}

{% block api_method_conversation_quit %} `AVIMConversation.quitWithCallback`{% endblock %}

{% block api_method_conversation_kick %} `AVIMConversation.removeMembersWithClientIds`{% endblock %}

{% block conversation_members_change_notice_intro %}
在 iOS 中，开发者需要实现 `AVIMClientDelegate` 代理，并且为 AVIMClient 指定该代理的一个实例。

`AVIMClientDelegate` 关于的成员变更通知的代理解释如下：

```
@protocol AVIMClientDelegate <NSObject>

/*!
 对话中有新成员加入的通知。
 @param conversation － 所属对话
 @param clientIds - 加入的新成员列表
 @param clientId - 邀请者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId;
/*!
 对话中有成员离开的通知。
 @param conversation － 所属对话
 @param clientIds - 离开的成员列表
 @param clientId - 操作者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray *)clientIds byClientId:(NSString *)clientId;

/*!
 被邀请加入对话的通知。
 @param conversation － 所属对话
 @param clientId - 邀请者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId;

/*!
 从对话中被移除的通知。
 @param conversation － 所属对话
 @param clientId - 操作者的 id
 @return None.
 */
- (void)conversation:(AVIMConversation *)conversation kickedByClientId:(NSString *)clientId;
```

接下来，我们将结合代码，针对各种成员变更的操作以及对应的事件回调进行详细讲解。
{% endblock %}

{% block conversation_join %}
```objc
- (void)tomJoinConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation joinWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"加入成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_membersChanged_callBack %}
该群的其他成员（比如 Bob）如果在线的话，会收到该操作的事件回调：

```objc
- (void)bobNoticedTomDidJoin {
    // Bob 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Bob"];
    self.client.delegate = self;

    // Bob 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 加入到对话，操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}

```

Tom 自身主动加入对话之后，相关方收到通知的时序是这样的：

| No.  | 加入者       | 其他人                |
| ---- | --------- | ------------------ |
| 1    | 发出请求 join |                    |
| 2    |           | 收到 membersAdded 通知 |

{% endblock %}

{% block conversation_membersChanged %}{% endblock %}

{% block conversation_memebersJoined %}{% endblock %}

{% block conversation_invite %}
```objc
- (void)jerryInviteMary {
    // Jerry 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Jerry"];

    // Jerry 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Jerry 邀请 Mary 到会话中
            [conversation addMembersWithClientIds:@[@"Mary"] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"邀请成功！");
                }
            }];
        }];
    }];
}
```

如果 Mary 在线的话，就会收到 `invitedByClientId` 通知：

```
-(void)maryNoticedWhenJerryInviteMary{
    // Mary 创建一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Mary"];
    self.client.delegate = self;
    
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // 登录成功
    }];
}
#pragma mark - AVIMClientDelegate
// Mary 被邀请进入对话之后，会得到如下回调
-(void)conversation:(AVIMConversation *)conversation invitedByClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"当前 ClientId(Mary) 被 %@ 邀请，加入了对话",clientId]);
}
```
{% endblock %}

{% block conversation_invite_events %}
邀请成功以后，相关方收到通知的时序是这样的：

| No.  | 邀请者                | 被邀请者                    | 其他人                |
| ---- | ------------------ | ----------------------- | ------------------ |
| 1    | 发出请求 addMembers    |                         |                    |
| 2    |                    | 收到 invitedByClientId 通知 |                    |
| 3    | 收到 membersAdded 通知 | 收到 membersAdded 通知      | 收到 membersAdded 通知 |
{% endblock %}

{% block conversation_left %}
```objc
- (void)tomQuitConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation quitWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"退出成功！");
                }
            }];
        }];
    }];
}
```

如果 Harry 在线的话，他将收到 `membersRemoved` 通知：

```
-(void)harryNoticedWhenTomQuitConversation{
    // Harry 创建一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Harry"];
    self.client.delegate = self;
    
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // 登录成功
    }];
}

#pragma mark - AVIMClientDelegate
// Harry 登录之后，Tom 退出了对话，在 Harry 所在的客户端就会激发以下回调
-(void)conversation:(AVIMConversation *)conversation membersRemoved:(NSArray *)clientIds byClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"%@ 离开了对话， 操作者为：%@",[clientIds objectAtIndex:0],clientId]);
}
```

Tom 自身主动退出对话之后，相关方收到通知的时序是这样的：

| No.  | 退出者       | 其他人                  |
| ---- | --------- | -------------------- |
| 1    | 发出请求 quit |                      |
| 2    |           | 收到 membersRemoved 通知 |

{% endblock %}

{% block conversation_kick %}
```objc
- (void)williamKickHarry {
    // William 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"William"];

    // William 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation removeMembersWithClientIds:@[@"Harry"] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"踢人成功！");
                }
            }];
        }];
    }];
}
```

如果 Harry 在线的话，会收到 `kickedByClientId` 通知：

```
-(void)harryNoticedWhenKickedByWilliam{
    // Harry 创建一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Harry"];
    self.client.delegate = self;
    
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // 登录成功
    }];
}
#pragma mark - AVIMClientDelegate
// Harry 登录之后，William 把 Harry 从对话中 剔除，在 Harry 所在的客户端就会触发以下回调
-(void)conversation:(AVIMConversation *)conversation kickedByClientId:(NSString *)clientId{
    NSLog(@"%@", [NSString stringWithFormat:@"当前 ClientId(Harry) 被提出对话， 操作者为：%@",clientId]);
}
```
{% endblock %}

{% block conversation_kick_events %}
踢人时，相关方收到通知的时序如下：

| No.  | 踢人者                  | 被踢者                    | 其他人                  |
| ---- | -------------------- | ---------------------- | -------------------- |
| 1    | 发出请求 removeMembers   |                        |                      |
| 2    |                      | 收到 kickedByClientId 通知 |                      |
| 3    | 收到 membersRemoved 通知 |                        | 收到 membersRemoved 通知 |
{% endblock %}

{% block conversation_countMember_method %}`conversation:countMembersWithCallback:`{% endblock %}

{% block conversation_countMember %}
```objc
- (void)tomCountConversationMembers {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 查看会话中成员的数量
            [conversation countMembersWithCallback:^(NSInteger number, NSError *error) {
            // 打印成员数量
            NSLog(@"%ld", number);
        }];
        }];
    }];
}
```
{% endblock %}

{% block table_conversation_attributes_intro %}
| AVIMConversation 属性名 | _Conversation 字段 | 含义           |
| -------------------- | ---------------- | ------------ |
| `conversationId`     | `objectId`       | 全局唯一的 Id     |
| `name`               | `name`           | 成员共享的统一的名字   |
| `members`            | `m`              | 成员列表         |
| `creator`            | `c`              | 对话创建者        |
| `attributes`         | `attr`           | 自定义属性        |
| `transient`          | `tr`             | 是否为聊天室（暂态对话） |
| `createdAt`           | `createdAt`      | 创建时间                      |
| `updatedAt`           | `updatedAt`      | 最后更新时间                    |
| `system`              | `sys`            | 是否为系统对话                   |
| `lastMessageAt`       | `lm`             | 最后一条消息发送时间，也可以理解为最后一次活跃时间 |
| `lastMessage`         | N/A              | 最后一条消息，可能会空               |
| `muted`               | N/A              | 当前用户是否静音该对话               |
| `unreadMessagesCount` | N/A              | 未读消息数                     |
| `lastDeliveredAt`     | N/A              | （仅限单聊）最后一条已送达对方的消息时间 |
| `lastReadAt`          | N/A              | （仅限单聊）最后一条对方已读的消息时间 |
{% endblock %}

{% block conversation_name %}
```objc
- (void)tomCreateNamedConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Black 的会话，会话名称是 "喵星人"
        [self.client createConversationWithName:@"喵星人" clientIds:@[@"Black"] callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_changeName %}
```objc
- (void)blackChangeConversationName {
    // Black 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Black"];

    // Black 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Black 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Black 修改 conversation 的名称
            AVIMConversationUpdateBuilder *updateBuilder = [conversation newUpdateBuilder];
            updateBuilder.name = @"聪明的喵星人";
            [conversation update:[updateBuilder dictionary] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"修改成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_mute %}
```objc
- (void)tomMuteConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 将会话设置为静音
            [conversation muteWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"修改成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_property_name %}`AVIMConversation.creator`{% endblock %}

{% block conversation_attributes_new %}
```objc
- (void)tomCreateConversationWithAttributes {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建名称为「猫和老鼠」的会话，并附加会话属性
        NSDictionary *attributes = @{ 
            @"type": @"private",
            @"isSticky": @(YES) 
        };
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] attributes:attributes options:AVIMConversationOptionNone callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_attributes_modify %}
接下来，Tom 将 type 修改为 public：

```objc
[conversation setObject:@"public" forKey:@"type"];
[conversation updateWithCallback:];
// 设置 boolean 属性值
[conversation setObject:@(YES) forKey:@"isStarred"];
[conversation updateWithCallback:];
// 获取自定义属性
NSString *type = [conversation objectForKey:@"type"];
BOOL isStarred = [[conversation objectForKey:@"isStarred"] boolValue];
```
{% endblock %}

{% block conversation_remove %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 删除多个对话：id = [551260efe4b01608686c3e0f, 523431glfld803290dfsaf05]
```
{% endblock %}

{% block conversation_getSingle %}
```objc
- (void)tomQueryConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"查询成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_getList %}
```objc
- (void)tomQueryConversationList {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 构建一个查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_limit %}
```objc
- (void)tomQueryConversationWithLimit {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 构建一个查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 设置查询最近 20 个活跃对话
        query.limit = 20;

        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block pattern_conservation_query_default_property %}
```
// 查询对话名称为「LeanCloud 粉丝群」的对话
[query whereKey:@"name" equalTo:@"LeanCloud 粉丝群"];

// 查询对话名称包含 「LeanCloud」 的对话
[query whereKey:@"name" containsString:@"LeanCloud"];

// 查询过去24小时活跃的对话
NSDate *today = [NSDate date];
NSDate *yesterday = [today dateByAddingTimeInterval: -86400.0];
[query whereKey:@"lm" greaterThan:yesterday];
```
{% endblock %}

{% block pattern_conservation_query_custom_property %}
```
// 查询话题为 DOTA2 对话
[query whereKey:@"attr.topic" equalTo:@"DOTA2"];
// 查询等级大于 5 的对话
[query whereKey:@"attr.level" greaterThan:@(5)];
```

在 iOS SDK 中，针对自定义属性的查询，可以使用预定义的宏 `AVIMAttr` 为自定义属性查询添加 `attr` 前缀：

```
// 查询话题为 DOTA2 对话
[query whereKey:AVIMAttr(@"topic") equalTo:@"DOTA2"];
// 它与下面这行代码是一样的
[query whereKey:@"attr.topic" equalTo:@"DOTA2"];
```
{% endblock %}

{% block table_conservation_query_than %}
| 逻辑操作 | AVIMConversationQuery 方法 |      |
| ---- | ------------------------ | ---- |
| 等于   | `equalTo`                |      |
| 不等于  | `notEqualTo`             |      |
| 大于   | `greaterThan`            |      |
| 大于等于 | `greaterThanOrEqualTo`   |      |
| 小于   | `lessThanOrEqualTo`      |      |
| 小于等于 | `lessThanOrEqualTo`      |      |
{% endblock %}

{% block conversation_query_equalTo %}
```objc
- (void)tomQueryConversationByEqualTo {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建属性中 topic 是 movie 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"attr.topic" equalTo:@"movie"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_notEqualTo %}
```objc
- (void)tomQueryConversationByNotEqualTo {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 type 不等于 private 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"type") notEqualTo:@"private"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_greaterThan %}
```objc
- (void)tomQueryConversationByGreaterThan {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.age 大于 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询是指在 `AVIMConversationQuery` 的查询条件中使用正则表达式来匹配数据。
{% endblock %}

{% block conversation_query_regex %}
```objc
- (void)tomQueryConversationByRegExp {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.language 为中文字符的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"language") matchesRegex:@"[\u4e00-\u9fa5]"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_contains %}
```objc
- (void)tomQueryConversationByContains {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含 「教育」的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```objc
- (void)tomQueryConversationByMembers {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建会话中有 Bob 和 Jerry 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"m" containAllObjectsInArray:@[@"Bob", @"Jerry"]];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_combination %}
```objc
- (void)tomQueryConversationByCombination {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含「教育」、attr.age < 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_all_include_system %}
```objc
- (void)tomQueryAllConversationsIncludeSystem {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // 查询 Tom 参与过的对话，即 m = Tom
        AVIMConversationQuery *query1 = [[AVIMClient defaultClient] conversationQuery];
        [query1 whereKey:@"m" equalTo:@"Tom"];

        // 查询系统对话，即 sys = true
        AVIMConversationQuery *query2 = [[AVIMClient defaultClient] conversationQuery];
        [query2 whereKey:@"sys" equalTo:@(YES)];

        // 将以上两个查询组合成一个查询
        AVIMConversationQuery *query = [AVIMConversationQuery orQueryWithSubqueries:@[ query1, query2 ]];

        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_active_between %}
```objc
- (void)tomQueryActiveConversationsBetween {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd"];

        // 查询最后一条消息的时间大于 2017-01-01 的对话
        AVIMConversationQuery *query1 = [[AVIMClient defaultClient] conversationQuery];
        [query1 whereKey:@"lm" greaterThan:[dateFormatter dateFromString:@"2017-01-01"]];

        // 查询最后一条消息的时间小于 2017-02-01 的对话
        AVIMConversationQuery *query2 = [[AVIMClient defaultClient] conversationQuery];
        [query1 whereKey:@"lm" lessThan:[dateFormatter dateFromString:@"2017-02-01"]];

        // 将以上两个查询组合成一个查询
        AVIMConversationQuery *query = [AVIMConversationQuery andQueryWithSubqueries:@[ query1, query2 ]];

        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```

对于**同一属性**的区间值查询要采用 `andQueryWithSubqueries:@[ query1, query2 ]` 的方式来提交。
{% endblock %}

{% block conversation_query_count %}
```objc
- (void)tomQueryConversationByCombination {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含「教育」、attr.age < 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_doesnot_exist %}

```objc
self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[self.client openWithCallback:^(BOOL succeeded, NSError *error) {
    AVIMConversationQuery *query = [client conversationQuery];
    /* 查询还没有产生过消息的对话 */
    [query whereKeyDoesNotExist:@"lm"];
    [query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
        NSLog(@"找到 %ld 个对话！", [conversations count]);
    }];
}];
```
{% endblock %}

{% block conversation_query_exists %}
```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL succeeded, NSError *error) {
    AVIMConversationQuery *query = [client conversationQuery];
    /* 查询产生过消息的对话 */
    [query whereKeyExists:@"lm"];
    [query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
        NSLog(@"找到 %ld 个对话！", [conversations count]);
    }];
}];
```
{% endblock %}

{% block conversation_query_sorting %}
```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL succeeded, NSError *error) {
    AVIMConversationQuery *query = [client conversationQuery];
    /* 按创建时间降序排列 */
    [query orderByDescending:@"createdAt"];
    [query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
        NSLog(@"找到 %ld 个对话！", [conversations count]);
    }];
}];
```
{% endblock %}


{% block conversation_query_compact_mode %}
```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL succeeded, NSError *error) {
    AVIMConversationQuery *query = [client conversationQuery];
    /* 指定不返回对话的成员列表 */
    query.option = AVIMConversationQueryOptionCompact;
    [query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
        NSLog(@"找到 %ld 个对话！", [conversations count]);
    }];
}];
```
{% endblock %}

{% block conversation_query_with_last_message %}

```objc
AVIMClient *client = [[AVIMClient alloc] initWithClientId:@"Tom"];

[client openWithCallback:^(BOOL succeeded, NSError *error) {
    AVIMConversationQuery *query = [client conversationQuery];
    /* 指定返回对话的最后一条消息 */
    query.option = AVIMConversationQueryOptionWithMessage;
    [query findConversationsWithCallback:^(NSArray *conversations, NSError *error) {
        NSLog(@"找到 %ld 个对话！", [conversations count]);
    }];
}];
```
{% endblock %}

{% block chatroom_intro %}
创建一个聊天室跟创建一个普通对话差不多，只是在 `[imClient createConversationWithName:clientIds:attributes:options:callback:]` 中给 `options:` 传入特定的选项值 `AVIMConversationOptionTransient`。
{% endblock %}

{% block chatroom_new %}
```objc
- (void)tomCreateTransientConversation {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建名称为 「HelloKitty PK 加菲猫」的会话
        [self.client createConversationWithName:@"HelloKitty PK 加菲猫" clientIds:@[] attributes:nil options:AVIMConversationOptionTransient callback:^(AVIMConversation *conversation, NSError *error) {
            if (!error) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block chatroom_count_method %} `[AVIMConversation countMembersWithCallback:]` {% endblock %}

{% block chatroom_count %}
```objc
- (void)tomCountsChatroomMembers{
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];
    NSString *conversationId=@"55dd9d7200b0c86eb4fdcbaa";
    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建一个对话的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        // 根据已知 Id 获取对话实例，当前实例为聊天室。
        [query getConversationById:conversationId callback:^(AVIMConversation *conversation, NSError *error) {
            // 查询在线人数
            [conversation countMembersWithCallback:^(NSInteger number, NSError *error) {
                NSLog(@"%ld",number);
            }];
        }];
    }];
}
```
{% endblock %}

{% block chatroom_query_method %} `[AVIMConversationQuery whereKey:]` {% endblock %}

{% block create_query_instance_method %}`[AVIMClient conversationQuery]`{% endblock %}

{% block chatroom_query_method2 %} `whereKey:` {% endblock %}

{% block chatroom_query_single %}
```objc
- (void)tomQueryConversationByConditions {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建属性中 topic 是 movie 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"topic") equalTo:@"movie"];
        // 额外调用一次确保查询的是聊天室而不是普通对话
        [query whereKey:@"tr" equalTo:@(YES)];
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_history %}
```objc
- (void)tomQueryMessages {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 设置查询时间从过去 24 小时开始
            NSTimeInterval timestamp = ([[NSDate date] timeIntervalSince1970] - 24 * 60 * 60) * 1000;
            [conversation queryMessagesBeforeId:nil timestamp:timestamp limit:20 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询到 %ld 条消息！", [objects count]);
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}
```objc
- (void)tomQueryMessagesWithLimit {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 查询对话中最后 10 条消息
            [conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询成功！");
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}
```objc
- (void)tomQueryMessagesBeforeMessage {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 从指定的某条消息（id 为 grqEG2OqSL+i8FSX9j3l2g，时间戳为 1436137606358）开始查询
            [conversation queryMessagesBeforeId:@"grqEG2OqSL+i8FSX9j3l2g" timestamp:1436137606358 limit:10 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询成功！");
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistory_pager %}
```objc
- (void)tomQueryMessagesWithLimit {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 查询对话中最后 10 条消息
            [conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
                [self TomLoadMoreMessage:objects forConversation:conversation];
            }];
        }];
    }];
}

- (void)tomLoadMoreMessage:(NSArray *)messages forConversation:(AVIMConversation *)conversation {
    AVIMMessage *oldestMessage = [messages firstObject];
    [conversation queryMessagesBeforeId:oldestMessage.messageId timestamp:oldestMessage.sendTimestamp limit:10 callback:^(NSArray *objects, NSError *error) {
        NSLog(@"查询成功！");
    }];
}
```
{% endblock %}

{% block disable_im_cache %}
```objc
- (void)tomQueryMessagesWithLimitAndIgnoreCache {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 关闭了 SDK 内建的消息缓存功能，忽略本地缓存。
    self.client.messageQueryCacheEnabled = NO;

    // Tom 打开 client
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 查询对话中最后 10 条消息，由于之前关闭了消息缓存功能，查询会走网络请求。
            [conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询成功！");
            }];
        }];
    }];
}
```
{% endblock %}

{% block networkStatus %}
与网络相关的通知（网络断开、恢复等）要采用 `AVIMClientDelegate` 代理方式来实现，主要接口如下：

* `imClientPaused:(AVIMClient *)imClient` 指网络连接断开事件发生，此时聊天服务不可用。
* `imClientResuming:(AVIMClient *)imClient` 指网络断开后开始重连，此时聊天服务依然不可用。
* `imClientResumed:(AVIMClient *)imClient` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。
{% endblock %}

{% block logout %}
在 app 退出的时候，或者切换用户的时候，我们需要断开与 LeanCloud 实时通信服务的长连接，这时候需要调用 `[AVIMClient closeWithCallback:]` 函数。一般情况下，这个函数都会关闭连接并立刻返回，这时实时通信服务端就会认为当前用户已经下线。
{% endblock %}

{% block communicate_with_otherSDK %}{% endblock %}

{% block conversation_security %}
客户端这边究竟该如何使用呢？我们只需要实现 AVIMSignatureDataSource 协议接口，然后在用户登录之前，把这个接口赋值给 `AVIMClient.signatureDataSource` 即可。示例代码如下：

```objc
// Tom 创建了一个 client，用自己的名字作为 clientId
AVIMClient *imClient = [[AVIMClient alloc] initWithClientId:@"Tom"];
imClient.delegate = self;
imClient.signatureDataSource = signatureDelegate;

// Tom 打开 client
[imClient openWithCallback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
        UIAlertView *view = [[UIAlertView alloc] initWithTitle:@"聊天不可用！" message:[error description] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [view show];
    } else {
        // 成功登录，可以开始进行聊天了。
    }
}];
```

设定了 signatureDataSource 之后，对于需要鉴权的操作，实时通信 SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 AVIMSignatureDataSource 接口，我们只需要实现这一个函数即可：

```objc
/*!
 对一个操作进行签名. 注意:本调用会在后台线程被执行
 @param clientId - 操作发起人的 id
 @param conversationId － 操作所属对话的 id
 @param action － @see AVIMSignatureAction
 @param clientIds － 操作目标的 id 列表
 @return 一个 AVIMSignature 签名对象.
 */
- (AVIMSignature *)signatureWithClientId:(NSString *)clientId
                          conversationId:(NSString *)conversationId
                                  action:(AVIMSignatureAction)action
                       actionOnClientIds:(NSArray *)clientIds;
```

你需要做的就是按照前文所述的签名算法实现签名，其中 `AVIMSignature` 声明如下：

```objc
@interface AVIMSignature : NSObject

@property (nonatomic, strong) NSString *signature;
@property (nonatomic) int64_t timestamp;
@property (nonatomic, strong) NSString *nonce;
@property (nonatomic, strong) NSError *error;

@end
```

其中四个属性分别是：

* signature：签名
* timestamp：时间戳，单位秒
* nonce：随机字符串 nonce
* error：签名错误信息

在启用签名功能的情况下，实时通信 SDK 在进行一些重要操作前，都会首先请求 `AVIMSignatureDataSource` 接口，获取签名信息 `AVIMSignature`，然后把操作信息和第三方签名一起发给 LeanCloud 云端，由云端根据签名的结果来对操作进行处理。 

用户登录是通过调用 `AVIMClient` 对象中以「open」开头的方法来实现的，以下是其中一个方法：

```objc
// 开启某个账户的聊天
- (void)openWithCallback:(AVIMBooleanResultBlock)callback;
```

各参数含义如下：

* clientId：操作发起人的 id，以后使用该账户的所有聊天行为，都由此人发起。
* callback：聊天开启之后的回调，在操作结束之后调用，通知开发者成功与否

我们现在来实际看一下这个过程如何实现。假定聊天发起方名叫 Tom，为直观起见，我们使用用户名来作为 `clientId` 登录聊天系统（LeanCloud 云端只要求 `clientId` 在应用内唯一即可，具体用什么数据由应用层决定）。示例代码如下：

```objc
// Tom 创建了一个 client，用自己的名字作为 clientId
self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];
self.client.delegate = self;

// Tom 打开 client
[self.client openWithCallback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
        UIAlertView *view = [[UIAlertView alloc] initWithTitle:@"聊天不可用！" message:[error description] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [view show];
    } else {
        // 成功登录，可以进入聊天主界面了。
        MainViewController *mainView = [[MainViewController alloc] init];
        [self.navigationController pushViewController:mainView animated:YES];
    }
}];
```
{% endblock %}

{% block connect_with_tag %}
```objc
AVIMClient *currentClient = [[AVIMClient alloc] initWithClientId:@"Tom" tag:@"Mobile"];
[currentClient openWithCallback:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
        // 与云端建立连接成功
    }
}];
```
{% endblock %}

{% block disconnected_by_server_with_same_tag %}
```objc
-(void)client:(AVIMClient *)client didOfflineWithError:(NSError *)error{
    if ([error code]  == 4111) {
        //适当的弹出友好提示，告知当前用户的 Client Id 在其他设备上登陆了
    }
};
```

为了更灵活地控制登录过程，我们在登录接口上增加了一个选项，以下是方法签名：

```objc
- (void)openWithOption:(AVIMClientOpenOption *)option callback:(AVIMBooleanResultBlock)callback; // v9.0.0 以前的使用这个 API

- (void)openWithOption:(AVIMClientOpenOption)openOption callback:(AVIMBooleanResultBlock)callback; // v9.0.0 及以后的使用这个 API
```

登录选项由 `AVIMClientOpenOption` 对象表示，其中的每一个属性表示具体的选项，目前支持以下选项：

```objc

// v9.0.0 以前的使用这个

@interface AVIMClientOpenOption : NSObject

@property (nonatomic, assign) BOOL force;

@end

// v9.0.0 及以后的使用这个

typedef NS_ENUM(NSUInteger, AVIMClientOpenOption) {

    AVIMClientOpenOptionForceOpen = 0,
    
    AVIMClientOpenOptionReopen
};

```

登录动作分为两种：

<dl>
  <dt>强制登录</dt>
  <dd>如果 client 设置了 tag，并使用强制登录选项来登录，则该登录动作总是可以登录成功；登录成功之后，会将其它有相同 ID 以及 tag 的 client 踢下线。</dd>
  <dt>重连</dt>
  <dd>如果 client 设置了 tag，并使用重连选项来登录，client 如果已经被有相同 ID 和 tag 的其它 client 踢下线了，则不能登录成功，反之，则能登录成功。</dd>
</dl>

用 `AVIMClientOpenOption *` 的 `force` 属性（v9.0.0 之前）或者 `AVIMClientOpenOption`（v9.0.0 之后）来设置登录动作。

- v9.0.0 之前，将 `force` 设置为 `YES` 表示「强制登录」；设置为 `NO` 表示「重连」。
- v9.0.0 之后，`AVIMClientOpenOptionForceOpen` 表示「强制登录」；`AVIMClientOpenOptionReopen` 表示「重连」。

示例如下：

```objc
 self.client = [[AVIMClient alloc] initWithClientId:@"Tom" tag:@"Mobile"];

// v9.0.0 之前
AVIMClientOpenOption *option = [[AVIMClientOpenOption alloc] init];
option.force = YES;
[self.client openWithOption:option callback:^(BOOL succeeded, NSError *error) {
    // Your code
}];

// v9.0.0 之后
[self.client openWithOption:AVIMClientOpenOptionForceOpen callback:^(BOOL succeeded, NSError *error) {
    // Your code
}];
```

{{ docs.alert("使用 `-[AVIMClient openWithCallback:]` 方法进行登录，v9.0.0 以前的默认为「重连」模式，v9.0.0 及以后的默认为「强制登录」模式。") }}

{% endblock %}

{% block code_set_query_policy %}

```objc
// 设置缓存策略，默认是 kAVCachePolicyCacheElseNetwork
@property (nonatomic) AVCachePolicy cachePolicy;

// 设置缓存的过期时间，默认是 1 小时（1 * 60 * 60）
@property (nonatomic) NSTimeInterval cacheMaxAge;
```
{% endblock %}

{% block code_query_from_local_cache %}
有时你希望先走网络查询，发生网络错误的时候，再从本地查询，可以这样：

```objc
    AVIMConversationQuery *query = [[AVIMClient defaultClient] conversationQuery];
    query.cachePolicy = kAVCachePolicyNetworkElseCache;
    [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
        
    }];
```
{% endblock %}

{% block link_avquery_chache %} [存储指南 &middot; AVQuery 缓存查询](leanstorage_guide-objc.html#缓存查询) 一节。{% endblock %}

{% block platform_specific_faq %}
<a id="duplicate_message_notification" name="duplicate_message_notification"></a>**为何离线消息重复推送了两次？**

大部分原因是这种情况造成的：成员 A 和成员 B 同在一个对话中。A 调用了 `openWithCallback` 登录实时通信，在没有调用 `closeWithCallback` 退出登录的情况下，B 使用同一个设备也调用了 `openWithCallback` 登录了实时通信。此时应用退出到后台，其他同在这个对话中的成员向这个对话发送了消息，服务器会给不在线的 A 和 B 发送消息推送，这个设备就会收到两条消息推送。解决方案是确保 B 登录时 A 已经调用 `closeWithCallback` 成功地退出了登录。
{% endblock %}


{% block code_recall_message %}

```objc
AVIMMessage *oldMessage = <#MessageYouWantToUpdate#>;

[self.conversaiton recallMessage:oldMessage
                   callback:^(BOOL succeeded, NSError * _Nullable error, AVIMRecalledMessage * _Nullable recalledMessage) {
                        if (succeeded) {
                            NSLog(@"Message has been recalled.");
                        }
}];
```
{% endblock %}

{% block code_on_message_recall %}
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
{% endblock %}

{% block code_modify_message %}
```objc
AVIMMessage *oldMessage = <#MessageYouWantToUpdate#>;
AVIMMessage *newMessage = [AVIMTextMessage messageWithText:@"Just a new message" attributes:nil];

[self.conversaiton updateMessage:oldMessage
                    toNewMessage:newMessage
                        callback:^(BOOL succeeded, NSError * _Nullable error) {
                            if (succeeded) {
                                NSLog(@"Message has been updated.");
                            }
}];
```
{% endblock %}

{% block code_on_message_modified %}
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
{% endblock %}


{% block code_send_will_message %}

```objc
AVIMMessageOption *option = [[AVIMMessageOption alloc] init];
option.will = YES;

AVIMMessage *willMessage = [AVIMTextMessage messageWithText:@"I'm offline." attributes:nil];

[conversaiton sendMessage:willMessage option:option callback:^(BOOL succeeded, NSError * _Nullable error) {
    if (succeeded) {
        NSLog(@"Will message has been sent.");
    }
}];
```

{% endblock %}

{% block open_long_connection_with_clientId %}

```objc
- (void)tomSendMessageToJerry {
    // Tom 创建了一个 client，用自己的名字作为 clientId
    self.client = [[AVIMClient alloc] initWithClientId:@"Tom"];

    // Tom 打开 client，与云端进行连接
    [self.client openWithCallback:^(BOOL succeeded, NSError *error) {
    }];
}
```
{% endblock %}

{% block open_long_connection_with_AVUser %}

```objc
// 以 AVUser 的用户名和密码登录到 LeanCloud 云端
[AVUser logInWithUsernameInBackground:username password:password block:^(AVUser * _Nullable user, NSError * _Nullable error) {
    // 以 AVUser 实例创建了一个 client
    AVIMClient *client = [[AVIMClient alloc] initWithUser:user];
    // 打开 client，与云端进行连接
    [client openWithCallback:^(BOOL succeeded, NSError * _Nullable error) {
        // Do something you like.
    }];
}];
```
{% endblock %}


{% block code_mention_someone %}
```objc
/* Sent a message which will mention others. */
AVIMMessage *message = [AVIMTextMessage messageWithText:@"Hello!" attributes:nil];
message.mentionList = @[@"Tom"];
[conversaiton sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention Tom has been sent. */
}];
```
{% endblock %}

{% block code_mention_all %}
```objc
/* Sent a message which will mention all members. */
AVIMMessage *message = [AVIMTextMessage messageWithText:@"Hello!" attributes:nil];
message.mentionAll = YES;
[conversaiton sendMessage:message callback:^(BOOL succeeded, NSError * _Nullable error) {
    /* A message which will mention all members has been sent. */
}];
```
{% endblock %}


{% block code_get_mention_list %}
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息提醒的 client id 列表，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get mention list of client id.
     NSArray *mentionList = message.mentionList;
}
```
{% endblock %}

{% block code_get_mention_all %}
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前对话里的所有成员，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get this message mentioned all members of this conversion.
    BOOL mentionAll = message.mentionAll;
}
```
{% endblock %}


{% block code_get_mentiond %}
```objc
  // 示例代码演示 AVIMTypedMessage 接收时，获取该条消息是否 @ 了当前 client id，同理可以用类似的代码操作 AVIMMessage 的其他子类
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    // get if current client id mentiond by this message
    BOOL mentioned = message.mentioned;
}
```
{% endblock %}

{% block message_send_failed_save_to_cache %}

```objc
[conversation addMessageToCache:message];
```
{% endblock %}

{% block message_send_failed_remove_from_cache %}

```objc
[conversation removeMessageFromCache:message];
```
{% endblock %}
