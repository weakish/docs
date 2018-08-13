{% import "views/_parts.html" as include %}
{% import "views/_helper.njk" as docs %}
{% import "views/_data.njk" as data %}

# 排行榜 REST API 使用指南 v1

阅读此文档前请确保已经阅读了[排行榜总览](leaderboard.html)，了解排行榜的核心概念及功能。

## 请求
### 请求格式
对于 POST 和 PUT 请求，请求的主体必须是 JSON 格式，而且 HTTP Header 的 Content-Type 需要设置为 `application/json`。

请求的鉴权是通过 HTTP Header 里面包含的键值对来进行的，参数如下表：

Key|Value|含义|来源
---|----|---|---
`X-LC-Id`|{{appid}}|当前应用的 App Id|可在控制台->设置页面查看
`X-LC-Key`| {{appkey}}|当前应用的 App Key |可在控制台->设置页面查看

部分管理性质的接口需要使用master key。

### 请求 url 中的变量

本文档中请求 url 中需要的填充的变量有：

* statisticName：排行榜名称。
* uid：user 的 objectId。

## 排行榜操作

### 管理排行榜

#### 创建排行榜
```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"statisticName": "world","order": "descending","updateStrategy": "better", "versionChangeInterval": "month"}' \
  https://{{host}}/1.1/leaderboard/leaderboards
```
| 参数        | 约束   | 说明                                   |
| --------- | ---- | ---------------------------------------- |
| statisticName      | 必须   | 排行榜的名称，创建后不可修改。 |
| order | 可选   | 可选项有 ascending 或 descending，默认为 descending。 |
| updateStrategy | 可选   |  可选项有 better、last、sum，默认为 better，具体行为请参考 [更新策略](leaderboard.html#更新策略)。|
| versionChangeInterval | 可选   |  可选项有 day、week、month、never，默认为 week。 |

返回的主体是一个 JSON 对象，包含创建排行榜时传入的所有参数，同时包括以下信息：

* `version` 为排行榜当前版本号。
* `expiredAt` 为下次过期时间。
* `activatedAt` 当前版本的开始时间。

```json
{
  "objectId": "5b62c15a9f54540062427acc",
  "statisticName": "world",
  "versionChangeInterval": "month",
  "order": "descending",
  "updateStrategy": "better",
  "version": 0,
  "createdAt": "2018-08-02T08:31:22.294Z",
  "updatedAt": "2018-08-02T08:31:22.294Z",
  "expiredAt": {
    "__type": "Date",
    "iso": "2018-08-31T16:00:00.000Z"
  },
  "activatedAt": {
    "__type": "Date",
    "iso": "2018-08-02T08:31:22.290Z"
  }
}
```


#### 获取排行榜属性
通过这个接口来查看当前排行榜的属性，例如更新策略、当前版本号等。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>
```

返回的 JSON 对象包含该排行榜的所有信息：

```json
{
  "objectId": "5b0b97cf06f4fd0abc0abe35",
  "statisticName": "world",
  "order": "descending",
  "updateStrategy": "better",
  "version": 5,
  "versionChangeInterval": "day",
  "expiredAt": {"__type": "Date", "iso": "2018-05-02T16:00:00.000Z"},
  "activatedAt": {"__type": "Date", "iso": "2018-05-01T16:00:00.000Z"},
  "createdAt": "2018-04-28T05:46:58.579Z",
  "updatedAt": "2018-05-01T01:00:00.000Z" 
}
```


#### 修改排行榜属性

这个接口可以用来修改排行榜的 `order`、`updateStrategy` 及 `versionChangeInterval` 属性。可以只更新某一个属性，例如只修改 versionChangeInterval：

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '{"versionChangeInterval": "day"}' \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>
```
返回的 JSON 对象包含更新的属性信息及 `updatedAt` 字段。

```json
{
  "objectId": "5b0b97cf06f4fd0abc0abe35",
  "versionChangeInterval": "day",
  "updatedAt": "2018-05-01T08:01:00.000Z"
}
```


#### 重置排行榜
无论排行榜的重置策略是什么，你都可以通过这个方法重置排行榜。重置时当前版本的数据清空，同时会归档到 csv 文件以供下载，排行榜的 version 会自动加 1。

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>/incrementVersion
```

返回的 JSON 会显示重置后的当前版本号，下一次过期时间 `expiredAt`，当前版本的开始时间 `activatedAt`：

```json
{
  "objectId": "5b0b97cf06f4fd0abc0abe35",
  "version": 7,
  "expiredAt": {"__type": "Date", "iso": "2018-06-03T16:00:00.000Z"},
  "activatedAt": {"__type": "Date", "iso": "2018-05-28T06:02:56.169Z"},
  "updatedAt": "2018-05-28T06:02:56.185Z"
}
```

#### 获取历史数据归档文件
每一个排行榜会保存 60 个归档文件，超过 60 个之后最早的文件会被清理。如果希望拿到全部数据，可以使用这个接口拿到归档文件后自行保存。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -G \
  --data-urlencode 'limit=10' \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>/archives
```
返回的对象会按照 `createdAt` 降序排列。其中 `file_key` 是文件的名称，`url` 是文件的下载地址，`status` 包含以下状态：

* `scheduled`：进入归档任务队列，还未归档，这个状态通常极短。
* `inProgress`：正在归档中。
* `failed`：归档失败，出现这种情况请在社区提问或提交工单。
* `completed`：归档已完成。

```json
{
  "results": [
    {
      "objectId": "5b0b9da506f4fd0abc0abe6e",
      "statisticName": "wins",
      "version": 9,
      "status": "completed",
      "url": "https://lc-paas-files.cn-n1.lcfile.com/yK5s6YJztAwEYiWs.csv",
      "file_key": "yK5s6YJztAwEYiWs.csv",
      "activatedAt": {"__type": "Date", "iso": "2018-05-28T06:11:49.572Z"},
      "deactivatedAt": {"__type": "Date", "iso": "2018-05-30T06:11:49.951Z"},
      "createdAt": "2018-05-01T16:00.00.000Z",
      "updatedAt": "2018-05-28T06:11:50.129Z",
    }
  ]
}
```

#### 删除排行榜

**这个接口将删除排行榜的所有数据**，包括当前版本的数据及所有归档文件，删除后无法恢复，请谨慎操作。

删除时只需要指定排行榜的名称 statisticName。

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>
```

返回空 JSON 对象：

```json
{}
```

### 用户成绩管理
#### 更新成绩
更新成绩遵循排行榜的 `updateStrategy` 属性，具体行为请参考 [更新策略](leaderboard.html#更新策略)。

在这个接口中可以一次更新多个排行榜的成绩。

客户端在更新用户成绩时，需要用户先登录，拿到用户的 `sessionToken`，将 `sessionToken` 作为 `X-LC-Session` 的值。例如：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: <sessionToken>" \
  -H "Content-Type: application/json" \
  -d '[{"statisticName": "wins", "statisticValue": 5}, {"statisticName": "world","statisticValue": 91}]' \
  https://{{host}}/1.1/leaderboard/users/self/statistics
```

如果使用服务端 masterKey 超级权限，可以不传入 `X-LC-Session` 更新用户分数，但是要在 url 中指定 `uid`。例如：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '[{"statisticName": "wins", "statisticValue": 5}, {"statisticName": "world","statisticValue": 91}]' \
  https://{{host}}/1.1/leaderboard/users/<uid>/statistics
```


返回的数据是服务端当前使用的分数：

```sh
{
  "results": [
    {
      "statisticName": "wins",
      "version": 0,
      "statisticValue": 5
    },
    {
      "statisticName": "world",
      "version": 2,
      "statisticValue": 91
    }
  ]
}
```

#### 强制更新成绩
使用这个接口会无视更新策略 better 及 sum，强制使用 last 策略更新用户的成绩。例如你发现某个用户存在作弊行为时，可能需要用到这个接口。

使用服务端 masterKey 超级权限，在 url 中设置 `overwrite = 1` 就可以达到目的。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '[{"statisticName": "wins", "statisticValue": 10}]' \
  https://{{host}}/1.1/leaderboard/users/<uid>/statistics?overwrite=1
```

返回的数据是当前服务端使用的分数：

```json
{"results":[{"statisticName":"wins","version":0,"statisticValue":10}]}
```


#### 查询当前用户的成绩

你可以在请求 url 中指定多个 `statistics` 来获得多个排行榜中的成绩，排行榜名称用英文逗号 `,` 隔开，如果不指定将会返回该用户参与的所有排行榜中的成绩。如果你需要获得用户的其他信息，例如 `username`，可以在请求 url 中指定 `includeUser` 来获取。

客户端在查询当前用户成绩时，需要用户先登录，拿到用户的 `sessionToken`，将 `sessionToken` 作为 `X-LC-Session` 的值，例如：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: <sessionToken>" \
  --data-urlencode 'statistics=wins,world' \
  --data-urlencode 'includeUser=username,avatar_url' \
  https://{{host}}/1.1/leaderboard/users/self/statistics
```

如果你使用服务端 masterKey 超级权限，可以不传入 `X-LC-Session` 查询用户分数，但是要在请求 url 中指定 `uid`。例如：

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  --data-urlencode 'statistics=wins,world' \
  --data-urlencode 'includeUser=username,avatar_url' \
  https://{{host}}/1.1/leaderboard/users/<uid>/statistics
```

返回值是查询到的所有成绩结果：

```json
{
  "results": [
    {
      "statisticName": "wins",
      "statisticValue": 10,
      "version": 0,
      "user": {
        "__type": "Pointer",
        "className": "_User",
        "updatedAt": "2018-08-01T07:54:19.217Z",
        "ACL": {
          "*": {
            "read": true,
            "write": true
          }
        },
        "username": "hjiang",
        "createdAt": "2018-08-01T07:54:19.217Z",
        "objectId": "5b61672b808ca4006ff41a8d"
      }
    },
    {
      "statisticName": "world",
      "statisticValue": 91,
      "version": 2,
      "user": {
      ......
      }
    }
  ]
}
```

#### 删除成绩

如果用户不再希望出现在榜单中，可以使用该接口删除用户的成绩以及在榜单中的排名（仅删除当前排行榜的成绩，不能删除历史版本的成绩）。

可以使用登录用户的 sessionToken 来删除该用户的成绩：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Session: <sessionToken>" \
  -H "Content-Type: application/json" \
  -d '[{"statisticName": "wins"}, {"statisticName": "world"}]' \
  https://{{host}}/1.1/leaderboard/users/self/statistics
```

也可以通过 master key 来删除任何用户的成绩：

```
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "X-LC-Key: {{masterkey}},master" \
  -H "Content-Type: application/json" \
  -d '[{"statisticName": "wins"}, {"statisticName": "world"}]' \
  https://{{host}}/1.1/leaderboard/users/<uid>/statistics
```


返回结果如下：

```json
{
  "results": [
    {},
    {}
  ]
}
```


### 获取排行榜结果
#### 获取指定区间的排名
你可以使用这个接口来获取 Top 排名。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'startPosition=0' \
  --data-urlencode 'maxResultsCount=20' \
  --data-urlencode 'includeUser=username,avatar_url' \
  --data-urlencode 'includeStatistics=wins' \
  --data-urlencode 'version=1' \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>/ranks
```

| 参数        | 约束   | 说明                                   |
| --------- | ---- | ---------------------------------------- |
| startPosition  | 可选  | 排行头部起始位置，默认为 0。 |
| maxResultsCount | 可选   | 最大返回数量，默认为 20。 |
| includeUser | 可选   |  返回用户在 `_User` 表的其他字段，支持多个字段，用英文逗号 `,` 隔开。 |
| includeStatistics | 可选   |  返回该用户在其他排行榜中的成绩，如果传入了不存在的排行榜名称，将会返回错误。 |
| version | 可选   | 返回指定 version 的排行结果，默认返回当前版本的数据。可查询的历史版本请参考 [历史数据](leaderboard.html#历史数据)。|


返回 JSON 对象：

```json
{
  "results": [
    {
      "user": {
        "objectId": "5ab9f63910b03545c0f529df",
        "__type": "Pointer",
        "username": "Superman",
        "avatar_url": "http://example.com/avatar.png",
        "className": "_User"
      },
      "rank": 0,
      "statisticName": "wins",
      "statisticValue": 42,
      "statistics": [{
        "statisticName": "world",
        "statisticValue": null,
        "version": null,
      }]
    }, {
      "user": {},
      "rank": 1,
    } ...
  ]
}
```

#### 获取用户及附近的排名

在请求 url 中指定排行榜名称 `statisticName` 及 uid 就可以获取该用户及其附近的排名。

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'startPosition=0' \
  --data-urlencode 'maxResultsCount=20' \
  --data-urlencode 'includeUser=username,avatar_url' \
  --data-urlencode 'includeStatistics=wins' \
  --data-urlencode 'version=1' \
  https://{{host}}/1.1/leaderboard/leaderboards/<statisticName>/ranks/<uid>
```
| 参数        | 约束   | 说明                                   |
| --------- | ---- | ---------------------------------------- |
| startPosition  | 可选  | 排行头部起始位置，默认为 0。 |
| maxResultsCount | 可选   | 最大返回数量，默认为 20。 |
| includeUser | 可选   |  返回用户在 `_User` 表的其他字段，支持多个字段，用英文逗号 `,` 隔开。 |
| includeStatistics | 可选   |  返回该用户在其他排行榜中的成绩，支持用英文逗号 `,` 隔开传入多个值，如果传入了不存在的排行榜名称，将会返回错误。 |
| version | 可选   | 返回指定 version 的排行结果。默认返回当前版本的数据。可查询的历史版本请参考 [历史数据](leaderboard.html#历史数据)。 |

返回：

```json
{
  "results": [
    {
      "user": {...},
      "postition": 9,
    }, {
      "user": {
        "objectId": "5ab9f63910b03545c0f529df",
        "__type": "Pointer",
        "username": "Superman",
        "avatar_url": "http://example.com/avatar.png",
        "className": "User"
      },
      "rank": 10,
      "statisticName": "world",
      "statisticValue": 42,
      "statistics": [{
        "statisticName": "wins",
        "statisticValue": 12.3,
        "version": 1,
      }]
    }, {
      "user": {...},
      "rank": 11,
    } ...
  ]
}
```
