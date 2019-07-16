{# 指定继承模板 #}
{% extends "./leanstorage-started.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set platformName = 'Android' %}
{% set segment_code ="android" %}
{% set avUserName = 'AVUser' %}
{% set avQueryName = 'AVQuery' %}
{% set avObjectName = 'AVObject' %}
{% set avFileName = 'AVFile' %}
{% set storage_guide_url ="[Android 数据存储开发指南](leanstorage_guide-android.html)"%}
{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_user_sign_up %}
```java
    AVUser user = new AVUser();// 新建 AVUser 对象实例
    user.setUsername(username);// 设置用户名
    user.setPassword(password);// 设置密码
    user.setEmail(email);//设置邮箱
    user.signUpInBackground(new SignUpCallback() {
      @Override
      public void done(AVException e) {
        if (e == null) {
          // 注册成功，把用户对象赋值给当前用户 AVUser.getCurrentUser()
          startActivity(new Intent(RegisterActivity.this, MainActivity.class));
          RegisterActivity.this.finish();
        } else {
          // 失败的原因可能有多种，常见的是用户名已经存在。
          showProgress(false);
          Toast.makeText(RegisterActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
        }
      }
    });
```
{% endblock %}

{% block code_user_login %}
```java
    AVUser.logInInBackground(username, password, new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser avUser, AVException e) {
        if (e == null) {
          LoginActivity.this.finish();
          startActivity(new Intent(LoginActivity.this, MainActivity.class));
        } else {
          showProgress(false);
          Toast.makeText(LoginActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
        }
      }
    });
```
{% endblock %}

{% block code_create_product_object %}
```java
    AVObject product = new AVObject("Product");
    product.put("title", mTitleEdit.getText().toString());
    product.put("description", mDiscriptionEdit.getText().toString());
    product.put("price", Integer.parseInt(mPriceEdit.getText().toString()));
    product.put("owner", AVUser.getCurrentUser());
    product.put("image", new AVFile("productPic", mImageBytes));
    product.saveInBackground(new SaveCallback() {
      @Override
      public void done(AVException e) {
        if (e == null) {
          mProgerss.setVisibility(View.GONE);
          PublishActivity.this.finish();
        } else {
          mProgerss.setVisibility(View.GONE);
          Toast.makeText(PublishActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
        }
      }
    });
```
{% endblock %}

{% block code_query_product %}
```java
    AVQuery<AVObject> avQuery = new AVQuery<>("Product");
    avQuery.orderByDescending("createdAt");
    avQuery.include("owner");
    avQuery.findInBackground(new FindCallback<AVObject>() {
      @Override
      public void done(List<AVObject> list, AVException e) {
        if (e == null) {
          mList.addAll(list);
          mRecyclerAdapter.notifyDataSetChanged();
        } else {
          e.printStackTrace();
        }
      }
    });
```
{% endblock %}

{% block code_user_logout %}
```java
    AVUser.getCurrentUser().logOut();
```
{% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}
