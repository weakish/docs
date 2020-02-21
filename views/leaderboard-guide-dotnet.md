{% import "views/_helper.njk" as docs %}
{% extends "./leaderboard-guide.tmpl" %}
{% set platformName = "C\#` `" %}
{% set avUser = "AVUser" %}

{% block Demo %}

<!-- 待补充 Demo -->

{% endblock %}


{% block installSDK %}
排行榜是存储 SDK 中的一个模块，需要安装存储 SDK，请参考《[ C# SDK 安装指南](sdk_setup-dotnet.html)》。
{% endblock %}

{% block leaderboardClass %}
### AVLeaderboard

`AVLeaderboard` 类是对排行榜的抽象。`Leaderboard` 实例有以下属性：

|属性|类型|说明|
|:--:|:--:|--|
|`StatisticName`|`string`|所排名的成绩名字|
|`Order`|`AVLeaderboardOrder`|排序|
|`UpdateStrategy`|`AVLeaderboardUpdateStrategy`|成绩更新策略|
|`VersionChangeInterval`|`AVLeaderboardVersionChangeInterval`|自动重置周期|
|`Version`|`int`|版本|
|`NextResetAt`|`DateTime`|计划下次重置时间|
|`CreatedAt`|`DateTime`|创建时间|

{% endblock %}

{% block statisticClass %}

|属性|类型|说明|
|:--:|:--:|--|
|`Name`|`string`|成绩名字，对应排行榜的 `StatisticName`|
|`Value`|`double`|成绩值|

{% endblock %}

{% block rankingClass %}

|属性|类型|说明|
|:--:|:--:|--|
|`Rank`|`int`|排名，从 0 开始|
|`User`|`AVUser`|拥有该成绩的用户|
|`Value`|`double`|该用户的成绩|
|`IncludedStatistics`|`List<Statistic>`|该用户的其他成绩|

{% endblock %}


{% block updateStatistic %}

```c#
var statistic = new Dictionary<string, double>();
statistic.Add("score", 3458);
statistic.Add("kills", 28);
await AVLeaderboard.UpdateStatistics(AVUser.CurrentUser, statistic);
```

{% endblock %}

{% block overWriteStatistic %}

```c#
var statistic = new Dictionary<string, double>();
statistic.Add("score", 0);
await AVLeaderboard.UpdateStatistics(AVUser.CurrentUser, statistic, overwrite: true);
```
{% endblock %}

### 查询成绩

你可以通过 `getStatistics` 方法查询某用户的某些成绩：

{% block getStatistics %}

```c#
// 当前用户需要先登录
await AVUser.LogInAsync("123", "123");
// 构造要查询的用户
var otherUser = AVObject.CreateWithoutData<AVUser>("5c76107144d90400536fc88b");
// 获取其他用户在排行榜中的成绩
await AVLeaderboard.GetStatistics(otherUser, new List<string> { "world" });
foreach(var statistic in statistics)
{
  Debug.Log(statistic.Name);
  Debug.Log(statistic.Value.ToString());
}
```
{% endblock %}


{% block getStatisticsWithoutStatisticNames %}

```c#
// 当前用户需要先登录
await AVUser.LogInAsync("123", "123");
// 构造要查询的用户
var otherUser = AVObject.CreateWithoutData<AVUser>("5c76107144d90400536fc88b");
// 获取其他用户在排行榜中的成绩
await AVLeaderboard.GetStatistics(otherUser);
foreach(var statistic in statistics)
{
  Debug.Log(statistic.Name);
  Debug.Log(statistic.Value.ToString());
}
```

{% endblock %}

{% block getResults %}

```c#
var leaderboard = AVLeaderboard.CreateWithoutData("world");
var rankings = await leaderboard.GetResults(limit: 10, skip: 0);
foreach(var ranking in rankings)
{
    Debug.Log(ranking.User.Username);
    Debug.Log(ranking.Rank.ToString());
    Debug.Log(ranking.Value);
}
```
{% endblock %}

{% block getResultsWithSelectUserKeys %}
```cs
var leaderboard = AVLeaderboard.CreateWithoutData("world");
var rankings = await leaderboard.GetResults(limit: 10, selectUserKeys: new List<string> { "username", "age" });
foreach(var ranking in rankings)
{
    Debug.Log(ranking.User.Username);
    Debug.Log(ranking.Rank.ToString());
    Debug.Log(ranking.Value);
}
```
{% endblock %}

{% block getResultsWithIncludeStatistics %}

```c#
var leaderboard = AVLeaderboard.CreateWithoutData("world");
await leaderboard.GetResults(limit: 10, includeStatistics: new List<string> { "kills" });
foreach(var ranking in rankings)
{
    Debug.Log(ranking.User.Username);
    Debug.Log(ranking.Rank.ToString());
    Debug.Log(ranking.Value);
}
```

{% endblock %}

{% block getResultsAroundUser %}
```c#
var leaderboard = AVLeaderboard.CreateWithoutData("world");
var rankings = await leaderboard.GetResultsAroundUser(limit: 3);
foreach(var ranking in rankings)
{
    Debug.Log(ranking.User.Username);
    Debug.Log(ranking.Rank.ToString());
    Debug.Log(ranking.Value);
}
```
{% endblock %}

{% block dotnetMasterKey %}
{{ docs.alert("masterKey 意味着超级权限，禁止在客户端使用。")}}
使用 masterKey 应用的初始方法如下：

```c#
AVClient.Initialize(new AVClient.Configuration
{
    ApplicationId = {{appid}},
    ApplicationKey = {{appkey}},
    MasterKey = {{masterkey}},
    // 请将 xxx.example.com 替换为你的应用绑定的自定义 API 域名
    ApiServer = new Uri("https://xxx.example.com"),
    EngineServer = new Uri("https://xxx.example.com"),
    PushServer = new Uri("https://xxx.example.com")
});
AVClient.UseMasterKey = true;
```

{% endblock %}

{% block createLeaderboard %}
```c#
var leaderboard = await AVLeaderboard.CreateLeaderboard("score", order: AVLeaderboardOrder.ASCENDING, updateStrategy: AVLeaderboardUpdateStrategy.BETTER);
```

你可以指定以下参数：

|参数|类型|是否可选|默认值|说明|
|:--:|:--:|:--:|:--:|--|
|`statisticName`|`string`|||所排名的成绩名字|
|`order`|`AVLeaderboardOrder`|||排序|
|`updateStrategy`|`AVLeaderboardUpdateStrategy`|可选|`AVLeaderboardUpdateStrategy.BETTER`|成绩更新策略|
|`versionChangeInterval`|`AVLeaderboardVersionChangeInterval`|可选|`AVLeaderboardVersionChangeInterval.WEEK`|自动重置周期|


{% endblock %}

{% block resetLeaderboard %}

```c#
var leaderboard = AVLeaderboard.CreateWithoutData("score");
await leaderboard.Reset();
```
{% endblock %}

{% block getLeaderboard %}
```c#
var leaderboardData = await AVLeaderboard.GetLeaderboard("world");
```
{% endblock %}

{% block updateVersionChangeInterval %}
```c#
var leaderboard = AVLeaderboard.CreateWithoutData("equip");
await leaderboard.UpdateVersionChangeInterval(AVLeaderboardVersionChangeInterval.WEEK);
```
{% endblock %}

{% block updateUpdateStrategy %}
```c#
var leaderboard = AVLeaderboard.CreateWithoutData("equip");
await leaderboard.UpdateUpdateStrategy(AVLeaderboardUpdateStrategy.LAST);
```
{% endblock %}

{% block destroy %}
```c#
var leaderboard = AVLeaderboard.CreateWithoutData("equip");
await leaderboard.Destroy();
```
{% endblock %}
