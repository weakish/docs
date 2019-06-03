{% extends "./leaderboard-quick-start.tmpl" %}
{% set platformName = "JavaScript" %}
{% set signUpCode = "`AV.User.signUp`" %}


## SDK 安装
{% block installSDK %}

接下来我们在客户端调用相关接口来更新用户的分数。在客户端接入排行榜需要安装存储 SDK 模块，在这篇文档中，为了简单，我们使用 CDN 的方式引入存储 SDK。在同一目录下，创建两个文件 `index.html` 和 `leaderboard-quick-start.js`。

`index.html` 中的代码如下：
```html
<html>
  <head>
    <title>LeanCloud Leaderboard Quick Start Demo</title>
  </head>
  <body>
    <!-- 引入存储 SDK -->
    <script src="//cdn.jsdelivr.net/npm/leancloud-storage@{{jssdkversion}}/dist/av-min.js"></script>
  </body>
</html>
```

接下来在 `leaderboard-quick-start.js` 中初始化应用：
```javascript
AV.init({
  appId: '{{appid}}',
  appKey: '{{appkey}}'
});
```

注：其他 SDK 安装方式，请参考 [JavaScript SDK 安装指南](sdk_setup-js.html)

{% endblock %}


{% block updateStatistics %}

```javascript
// 注册时输入玩家 A 的用户名及密码
AV.User.signUp('playerA', 'passwordA')
.then(function(user) {
  // 更新当前用户在 world 排行榜中的成绩
  var statisticValue = Math.random() * 100;
  return AV.Leaderboard.updateStatistics(AV.User.current(), {
    'world' : statisticValue
  })
})
.then(function() {
  // 成绩更新成功
})
.catch(console.error);
```
{% endblock %}


{% block getStatisticsResults %}
```js
const leaderboard = AV.Leaderboard.createWithoutData('world');
leaderboard.getResults({
  limit: 10,
  includeUserKeys: ['username'], //展示结果时同时展示玩家的用户名
})
.then(function(results) {
  console.log(results);
})
.catch(console.error)
```
{% endblock %}

{% block leaderboardGuideDocs %}
更详细的使用方式，请参考[ JavaScript 排行榜开发指南](leaderboard-guide-js.html)。
{% endblock %}
