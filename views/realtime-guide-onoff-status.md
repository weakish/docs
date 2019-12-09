# 即时通讯上下线状态查询

上下线状态的查询是即时通讯类软件的常规功能。它的应用场景十分广泛，聊天好友在线状态展示，聊天群成员在线状态展示等等，都会使用到这个功能。

本文会介绍如何使用 [LeanEngine](leanengine_overview.html) 快速开发和上线即时通讯上下线状态查询这项功能。

## 准备工作

在开始之前，有一些前提工作需要你去了解或实施。

* [LeanCache](leancache_guide.html)：高性能、高可用的 Key-Value 内存存储服务。你需要为你的应用[创建一个 LeanCache 实例](leancache_guide.html#创建实例)，推荐使用 `volatile-lru` 删除策略。我们会使用它来存储即时通讯客户端的上下线状态。

* [云函数（Node.js）](leanengine_cloudfunction_guide-node.html)：部署在服务端的代码。我们会使用云函数来实现 LeanCache 的查询以及即时通讯上下线 Hook 的逻辑。

* [RTM Hook](realtime-guide-systemconv.html)：Hook 函数本质上是云函数。我们提供了监听即时通讯客户端上下线事件的 API，可以轻松的实现上下线状态的存储逻辑。

## 部署云函数

你可以在[控制台在线编写云函数](leanengine_cloudfunction_guide-node.html#在线编写云函数)，然后部署；也可以将编写完成的源代码直接部署到云端。

### 在线编写云函数

第一步，连接已经创建的 LeanCache 实例。在全局环境（Global）里添加如下所示的代码。

```js
// 创建 redis client，连接 LeanCache 实例
// ⚠️注意，需替换 `<LeanCache-实例名称>` 为实际创建的实例的名称
var redis = require("redis"),
    redisClient = redis.createClient(process.env['REDIS_URL_<LeanCache-实例名称>']);

// 监听 redis 的 error 事件，打印错误信息
redisClient.on("error", function (err) {
    console.log("Redis Error: " + err);
});

// promisify `redisClient` 的 `mget` 函数
const {promisify} = require('util');
const mgetAsync = promisify(redisClient.mget).bind(redisClient);
```

第二步，配置即时通讯的 `_clientOnline` 和 `_clientOffline` Hook。在各 Hook 里添加如下所示的代码。

* `_clientOnline`
  ```js
  // 设置某一客户端 ID 对应的值为 1，表示上线状态，同时清空过期计时
  redisClient.set(request.params.peerId, 1);
  ```

* `_clientOffline`
  ```js
  // 设置某一客户端 ID 对应的值为 0，表示下线状态，同时设置过期计时
  redisClient.set(request.params.peerId, 0, 'EX', 604800);
  ```

  > 对于下线后长久未上线的客户端 ID，可以通过对其设置过期计时来优化存储空间。

第三步，创建查询上下线状态的函数，供 SDK 调用。以 `getOnOffStatus` 作为函数名，示例代码如下所示。

```js
// 约定 key: ”peerIds” 对应的值是一组客户端的 ID
return await mgetAsync(request.params.peerIds);
```

最后一步，点击控制台的部署按钮，部署成功后，就可以使用 SDK 或者 REST API 调用云函数来查询上下线状态了。

### 源代码部署云函数

我们在 [leanengine-nodejs-demos](https://github.com/leancloud/leanengine-nodejs-demos) 这个项目里提供了[一份代码示例](https://github.com/leancloud/leanengine-nodejs-demos/blob/master/functions/rtm-onoff-status.js)（和在线编写版稍有不同），你可以直接或者修改之后，使用[云引擎命令行工具](https://leancloud.cn/docs/leanengine_cli.html)将其部署到云端。

## 客户端查询

客户端可以通过 LeanCloud SDK 调用部署成功的云函数，示例代码如下所示。

```swift
func getOnOffStatus(peerIds: [String]) {
    guard !peerIds.isEmpty else {
        return
    }
    // 约定 key: ”peerIds” 对应的 value 是一组客户端的 ID
    let parameters: [String: Any] = ["peerIds": peerIds]
    // 调用云函数 `getOnOffStatus`
    LCEngine.run("getOnOffStatus", parameters: parameters) { (result) in
        switch result {
        case .success(value: let value):
            if let results = value as? [Any] {
                // 查询结果是数组，各 ID 的结果按顺序与 `peerIds` 对应
                // 不存在的 ID 对应的查询结果为 `null`，可以将其归为下线状态
                for (index, peerId) in peerIds.enumerated() {
                    let isOn: Bool = ((results[index] as? String) ?? "0") == "1"
                    print("\(peerId): \(isOn)")
                    // ...
                }
            }
        case .failure(error: let error):
            print(error)
        }
    }
}
```
```objc
+ (void)getOnOffStatusWithPeerIds:(NSArray<NSString *> *)peerIds {
    if (!peerIds.count) {
        return;
    }
    // 约定 key: ”peerIds” 对应的 value 是一组客户端的 ID
    NSDictionary *parameters = @{ @"peerIds": peerIds };
    // 调用云函数 `getOnOffStatus`
    [AVCloud callFunctionInBackground:@"getOnOffStatus" withParameters:parameters block:^(id  _Nullable object, NSError * _Nullable error) {
        if (error) {
            NSLog(@"%@", error);
        } else if ([object isKindOfClass:[NSArray class]]) {
            NSArray *results = (NSArray *)object;
            // 查询结果是数组，各 ID 的结果按顺序与 `peerIds` 对应
            // 不存在的 ID 对应的查询结果为 `null`，可以将其归为下线状态
            for (int i = 0; i < results.count; i++) {
                id item = results[i];
                if ([item isKindOfClass:[NSNull class]]) {
                    item = @"0";
                }
                if ([item isKindOfClass:[NSString class]]) {
                    NSString *peerId = peerIds[i];
                    BOOL isOn = [(NSString *)item isEqualToString:@"1"];
                    NSLog(@"%@: %@", peerId, @(isOn));
                    // ...
                }
            }
        }
    }];
}
```

对于一些需要较为实时的更新上下线状态的场景，比如好友列表页面，群成员信息列表页面等等，可以通过轮询的方式来更新状态信息。