# 即时通讯服务端管理开发指南

Python 的数据存储 SDK，基于 REST API 封装了一组对话及消息管理的接口。这部分接口主要用来在服务器或者云引擎中对[实时消息](realtime_v2.html)的对话或者消息进行管理。

SDK 的安装请参考[安装指南](sdk_setup-python.html)。

## 对话管理

`leancloud.Conversation` 对应实时消息中的[对话概念](realtime_v2.html#对话（Conversation）)，同时也是 Python SDK 中 `leancloud.Object` 的子类，因此可以像正常的 `leancloud.Object` 来创建、查询对话。

`leancloud.Conversation` 的查询与修改等操作，也受限于 LeanCloud 存储服务的 Class 权限设置与 ACL 权限设置。因此创建对话时，请确保当前权限设置正确，以免造成数据泄漏。

### 对话属性

`leancloud.Conversation` 上有一些额外的属性，代表对话上的属性：

```python
import leancloud

conversation = leancloud.Conversation.query.first()
conversation.name    # 此对话的名称
conversation.creator    # 此对话的创建者，对应表中 'c' 字段
conversation.last_message_read_at    # 此对话最后一条已读消息，对应表中 'lm' 字段
conversation.members    # 包含此对话中，所有用户的 client id 的 list，对应表中 'm' 字段
conversation.muted_members    # 包含此对话中，所有将对话设置为静音的用户的 client id 的 list，对应表中 'mu' 字段
conversation.is_system    # 是否为系统对话
conversation.is_transient    # 是否为暂态对话
```

### 创建会话

有些时候需要在服务端来进行对话创建，可以把 `leancloud.Conversation` 当作一个 `leancloud.Object` 来直接创建并保存就可以。

```python
import leancloud

conversation = leancloud.Conversation()
conversation.set('chatRoomNumber', 233)    # 可以像一个正常的 `leancloud.Object` 一样，给对话添加属性
conversation.save()

# 创建系统对话
sys_conv = leancloud.Conversation(is_system=True)
sys_conv.save()

# 创建暂态对话
tr_conv = leancloud.Conversation(is_transient=True)
tr_conv.save()
```

### 添加用户到对话

调用 `leancloud.Conversation` 上的 `add_member` 方法，可以将一个用户添加到此对话上来。需要注意的是，后面的参数应该是实时消息的 [clientId](realtime_v2.html#ClientID、用户和登录)，而不是 `leancloud.User` 实例。如果项目使用 `leancloud.User` 作为用户系统，而没有使用自己的用户系统，需要直接将 `leancloud.User` 的 `id` 当作参数进行调用。

```python
import leancloud

conversation = get_a_conversation()
conversation.add_member(client_id)
```

## 消息管理

### 发送消息

#### 普通消息
可以使用任意一个 client id，在某个对话中发送消息。发送消息时，必须使用 master key 权限进行操作。

```python
import leancloud
conversation = get_a_conversation()
client_id = 'user1'
message = 'Hello, World!'  # message 需要是一个字符串或者 dict
conversation.send(client_id, message)
```

#### 系统消息

可以在一个系统对话中，给指定的一组用户发送消息，这时只有这部分用户会收到消息。

```python
import leancloud

conversation = get_a_system_conversation()
from_client_id = 'admin1'
to_client_ids = ['user1', 'user2', 'user3']    # 最多同时给 20 个用户发送消息
message = 'Ready Check'
conversation.send(client_id, message, to_clients=to_client_ids)
```

#### 发送广播消息

可以给系统中所有的用户发送广播消息，即使用户没有在此对话中。只能在系统对话上调用。

```python
conversation = get_a_system_conversation()
from_client_id = 'admin1'
message = 'System broadcast!'
conversation.broadcast(from_client_id, message)
```

另外以上三个发送消息的方法，都有一个可选的 `push_data` 参数，用来指定消息的[离线推送通知](realtime-guide-intermediate.html#离线推送通知)。

### 历史消息查询

#### 查询对话历史消息

可以查询某个对话中的历史消息。

```python
import leancloud

conversation = get_a_conversation()

messages = find_by_conversation(conversation.id)
```

可选参数：

- `limit`：指定消息返回数量，服务端默认为 100 条，最大 1000 条。
- `reversed`：以默认排序相反的方向返回结果，服务端默认为 False。
- `after_time`：查询起始的时间戳，返回小于这个时间(不包含)的记录。
- `after_message_id`：查询起始的消息 id，使用时必须加上对应消息的时间 `after_time` 参数，一起作为查询的起点。

#### 查询用户历史消息

可以根据 Client ID 查询历史消息。

```python
import leancloud

messages = find_by_client(client_id)
```

可选参数：

- `limit`：指定消息返回数量，服务端默认为 100 条，最大 1000 条。
- `after_time`：查询起始的时间戳，返回小于这个时间(不包含)的记录。
- `after_message_id`：查询起始的消息 id，使用时必须加上对应消息的时间 `after_time` 参数，一起作为查询的起点。

#### 查询全部历史消息

可以直接查询应用中所有的历史消息。

```python
import leancloud

messages = find_by_client()
```

可选参数：

- `limit`：指定消息返回数量，服务端默认为 100 条，最大 1000 条。
- `after_time`：查询起始的时间戳，返回小于这个时间(不包含)的记录。
- `after_message_id`：查询起始的消息 id，使用时必须加上对应消息的时间 `after_time` 参数，一起作为查询的起点。
