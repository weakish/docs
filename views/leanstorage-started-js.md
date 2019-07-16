{# 指定继承模板 #}
{% extends "./leanstorage-started.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set platformName = 'JavaScript' %}
{% set segment_code ="js" %}
{% set avUserName = 'AV.User' %}
{% set avQueryName = 'AV.Query' %}
{% set avObjectName = 'AV.Object' %}
{% set avFileName = 'AV.File' %}
{% set storage_guide_url ="[JavaScript 数据存储开发指南](leanstorage_guide-js.html)"%}
{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_user_sign_up %}
```js
  var username = $('#inputUsername').val();
  var password = $('#inputPassword').val();
  var email = $('inputEmail').val();
  
  // LeanCloud - 注册
  // https://leancloud.cn/docs/leanstorage_guide-js.html#注册
  var user = new AV.User();
  user.setUsername(username);
  user.setPassword(password);
  user.setEmail(email);
  user.signUp().then(function (loginedUser) {
    // 注册成功，跳转到商品 list 页面
  }, (function (error) {
  	alert(JSON.stringify(error));
  }));
```
{% endblock %}

{% block code_user_login %}
```js
  var username = $('#inputUsername').val();
  var password = $('#inputPassword').val();

  // LeanCloud - 登录
  // https://leancloud.cn/docs/leanstorage_guide-js.html#用户名和密码登录
  AV.User.logIn(username, password).then(function (loginedUser) {
    // 登录成功，跳转到商品 list 页面
  }, function (error) {
    alert(JSON.stringify(error));
  });
```
{% endblock %}

{% block code_create_product_object %}
```js
  var title = $('#inputTitle').val();
  var price = parseFloat($('#inputPrice').val());
  var description = $('#inputDescription').val();
  
  // LeanCloud - 当前用户
  // https://leancloud.cn/docs/leanstorage_guide-js.html#当前用户
  var currentUser = AV.User.current();

  // LeanCloud - 文件
  // https://leancloud.cn/docs/leanstorage_guide-js.html#文件
  var file = $('#inputFile')[0].files[0];
  var name = file.name;
  var avFile = new AV.File(name, file);
  
  // LeanCloud - 对象
  // https://leancloud.cn/docs/leanstorage_guide-js.html#数据类型
  var product = new Product();
  product.set('title', title);
  product.set('price', price);
  product.set('description', description);
  product.set('owner', AV.User.current());
  product.set('image', avFile);
  product.save().then(function() {
    //  发布成功，跳转到商品 list 页面
  }, function(error) {
    alert(JSON.stringify(error));
  });
```
{% endblock %}

{% block code_query_product %}
```js
  // LeanCloud - 查询
  // https://leancloud.cn/docs/leanstorage_guide-js.html#查询
  var query = new AV.Query('Product');
  query.include('owner');
  query.include('image');
  query.descending('createdAt');
  query.find().then(function (products) {
   	// 查询到商品后，在前端展示到相应的位置中。
  }).catch(function(error) {
    alert(JSON.stringify(error));
  });
```
{% endblock %}

{% block code_user_logout %}
```js
  AV.User.logOut();
```
{% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}
