{% import "views/_helper.njk" as docs %}
{% extends "./leaderboard-guide.tmpl" %}
{% set platformName = "JavaScript" %}
{% set avUser = "AV.User" %}

{% block Demo %}

## Demo
您可以通过查看 [Demo](https://leancloud.github.io/javascript-sdk/demo/leaderboard/) 感受排行榜功能。

{% endblock %}


{% block installSDK %}
排行榜是存储 SDK 中的一个模块，要在 JavaScript 运行环境中使用排行榜功能，需要安装存储 SDK，请参考《[ JavaScript SDK 安装指南](sdk_setup-js.html)》。
{% endblock %}

{% block leaderboardClass %}

### AV.Leaderboard

`AV.Leaderboard` 类是对排行榜的抽象。`Leaderboard` 实例有以下属性：

|属性|类型|说明|
|:--:|:--:|--|
|`statisticName`|`string`|所排名的成绩名字|
|`order`|[`AV.LeaderboardOrder`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardOrder)|排序|
|`updateStrategy`|[`AV.LeaderboardUpdateStrategy`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardUpdateStrategy)|成绩更新策略|
|`versionChangeInterval`|[`AV.LeaderboardVersionChangeInterval`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardVersionChangeInterval)|自动重置周期|
|`version`|`number`|版本|
|`nextResetAt`|`Date`|计划下次重置时间|
|`createdAt`|`Date`|创建时间|

{% endblock %}

{% block statisticClass %}

|属性|类型|说明|
|:--:|:--:|--|
|`name`|`string`|成绩名字，对应排行榜的 `statisticName`|
|`value`|`number`|成绩值|

{% endblock %}

{% block rankingClass %}

|属性|类型|说明|
|:--:|:--:|--|
|`rank`|`number`|排名，从 0 开始|
|`user`|`AV.User`|拥有该成绩的用户|
|`value`|`number`|该用户的成绩|
|`includedStatistics`|`Statistic[]`|该用户的其他成绩|

{% endblock %}


{% block updateStatistic %}

```js
AV.Leaderboard.updateStatistics(AV.User.current(), {
  score: 3458,
  kills: 28,
}).then(function(statistics) {
  // statistics 是更新后你的最好/最新成绩
}).catch(console.error);
```

{% endblock %}

{% block overWriteStatistic %}

```js
AV.Leaderboard.updateStatistics(AV.User.current(), { score: 0 }, {
  overwrite: true,
}).then(function(statistics) {
  // score 会被强制更新为 0
}).catch(console.error);
```
{% endblock %}

### 查询成绩

你可以通过 `getStatistics` 方法查询某用户的某些成绩：

{% block getStatistics %}

```js
// 当前玩家需要先登录
AV.User.logIn('playerA', 'passwordA').then((loggedInUser) => {
  // 查询另一个玩家在排行榜中的成绩
  var otherUser = AV.Object.createWithoutData(AV.User, '5cee072ac8959c0069f62ca8');
  return AV.Leaderboard.getStatistics(otherUser)
}).then(function(statistics) {
  // statistics 是查询的成绩结果
}).catch(function (error) {
    // 异常处理
});
```
{% endblock %}


{% block getStatisticsWithoutStatisticNames %}
```js
// 当前玩家需要先登录
AV.User.logIn('playerA', 'passwordA').then((loggedInUser) => {
  // 查询另一个玩家在排行榜中的成绩
  var otherUser = AV.Object.createWithoutData(AV.User, '5cee072ac8959c0069f62ca8');
  return AV.Leaderboard.getStatistics(otherUser,  {statisticNames: ['score', 'kills']});
}).then(function(statistics) {
  // statistics 是查询的成绩结果
}).catch(function (error) {
    // 异常处理
});
```
{% endblock %}

{% block getResults %}

```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.getResults({
  limit: 10,
  skip: 0,
}).then(function(rankings) {
  // rankings 为前 10 的排名结果
}).catch(console.error);
```
{% endblock %}

{% block getResultsWithSelectUserKeys %}

```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.getResults({
  limit: 10,
  selectUserKeys: ['username', 'age'],
}).then(function(rankings) {
  // ranking 的 user 将包含 username 与 age 属性
}).catch(console.error);
```

{% endblock %}

{% block getResultsWithIncludeStatistics %}

```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.getResults({
  limit: 10,
  includeStatistics: ['kills'],
}).then(function(rankings) {
  // 可以在 ranking 的 includedStatistics 属性中得到该用户的 kills 成绩
}).catch(console.error);
```

{% endblock %}

{% block getResultsAroundUser %}
```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.getResultsAroundUser({
  limit: 3,
}).then(function(rankings) {
  // rankings 为当前用户附近的 3 条排名结果
}).catch(console.error);
```
{% endblock %}


{% block createLeaderboard %}

```js
AV.Leaderboard.createLeaderboard({
  statisticName: 'score',
  order: AV.LeaderboardOrder.DESCENDING,
}, { useMasterKey: true }).then(function(leaderboard) {
  // 创建成功得到 leaderboard 实例
}).catch(console.error);
```

你可以指定以下参数：

|参数|类型|是否可选|默认值|说明|
|:--:|:--:|:--:|:--:|--|
|`statisticName`|`string`|||所排名的成绩名字|
|`order`|[`AV.LeaderboardOrder`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardOrder)|||排序|
|`updateStrategy`|[`AV.LeaderboardUpdateStrategy`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardUpdateStrategy)|可选|`AV.LeaderboardUpdateStrategy.BETTER`|成绩更新策略|
|`versionChangeInterval`|[`AV.LeaderboardVersionChangeInterval`](https://leancloud.github.io/javascript-sdk/docs/AV.html#.LeaderboardVersionChangeInterval)|可选|`AV.LeaderboardVersionChangeInterval.WEEK`|自动重置周期|

详见《[创建排行榜 API 文档](https://leancloud.github.io/javascript-sdk/docs/AV.Leaderboard.html#.createLeaderboard)》。

{% endblock %}

{% block resetLeaderboard %}

```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.reset({ useMasterKey: true })
  .then(function(leaderboard) {
    // 重置成功
  }).catch(console.error);
```
{% endblock %}

{% block getLeaderboard %}
```js
AV.Leaderboard.getLeaderboard('world').then((data) => {
  console.log(data);
}).catch(console.error)
```
{% endblock %}

{% block updateVersionChangeInterval %}
```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.updateVersionChangeInterval(
  AV.LeaderboardVersionChangeInterval.MONTH,
  { useMasterKey: true }
).then(function(leaderboard) {
  // 修改成功
}).catch(console.error);
```
{% endblock %}

{% block updateUpdateStrategy %}
```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.updateUpdateStrategy(
  AV.LeaderboardUpdateStrategy.LAST,
  { useMasterKey: true }
).then(function(leaderboard) {
  // 修改成功
}).catch(console.error);
```
{% endblock %}

{% block destroy %}
```js
var leaderboard = AV.Leaderboard.createWithoutData('score');
leaderboard.destroy({ useMasterKey: true })
  .then(function() {
    // 删除成功
  }).catch(console.error);
```
{% endblock %}