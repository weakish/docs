{% extends "./leaderboard-quick-start.tmpl" %}
{% set platformName = "C\#` `" %}
{% set signUpCode = "`AVUser.SignUp`" %}

{% block installSDK %}

请参考 [C# SDK 安装指南](sdk_setup-dotnet.html)的数据存储模块。

{% endblock %}

{% block updateStatistics %}

```c#
var user = new AVUser();
user.Username = "playerA";
user.Password = "passwordA";
await user.SignUpAsync();
var statistic = new Dictionary<string, double>();
statistic.Add("world", 20);
await AVLeaderboard.UpdateStatistics(AVUser.CurrentUser, statistic);
```
{% endblock %}

{% block getStatisticsResults %}
```c#
var leaderboard = AVLeaderboard.CreateWithoutData("world");
var rankings = await leaderboard.GetResults(limit: 10, selectUserKeys: new List<string> {"username", "age"});
foreach(var ranking in rankings)
{
    Debug.Log(ranking.User.Username);
    Debug.Log(ranking.Rank.ToString());
    Debug.Log(ranking.Value);
}
```
{% endblock %}

{% block leaderboardGuideDocs %}
更详细的使用方式，请参考[ C# 排行榜开发指南](leaderboard-guide-dotnet.html)。
{% endblock %}
