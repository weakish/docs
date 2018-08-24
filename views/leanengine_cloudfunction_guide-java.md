{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = "Java" %}
{% set runtimeName = "java" %}
{% set gettingStartedName = "java-war-getting-started" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine Java SDK](https://github.com/leancloud/leanengine-java-sdk)" %}
{% set storage_guide_url = "[Java SDK](leanstorage_guide-java.html)" %}
{% set cloud_func_file = "$PROJECT_DIR/src/main/java/cn/leancloud/demo/todo/Cloud.java" %}
{% set runFuncName = "AVCloud.callFunction" %}
{% set defineFuncName = "@EngineFunction 注解" %}
{% set runFuncApiLink = "[AVCloud.callFunction](/api-docs/java/com/avos/avoscloud/AVCloud.html#callFunction(java.lang.String,%20java.util.Map))" %}
{% set hook_before_save = "beforeSave" %}
{% set hook_after_save = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete = "afterDelete" %}
{% set hook_on_verified = "onVerified" %}
{% set hook_on_login = "onLogin" %}
{% set hook_message_received = "_messageReceived" %}
{% set hook_receiver_offline = "_receiversOffline" %}
{% set hook_message_sent = "_messageSent" %}
{% set hook_conversation_start = "_conversationStart" %}
{% set hook_conversation_started = "_conversationStarted" %}
{% set hook_conversation_add = "_conversationAdd" %}
{% set hook_conversation_remove = "_conversationRemove" %}
{% set hook_conversation_update = "_conversationUpdate" %}

{% block cloudFuncExample %}

```java
  @EngineFunction("averageStars")
  public static float getAverageStars(@EngineFunctionParam("movie") String movie)
      throws AVException {
    AVQuery<AVObject> query = new AVQuery("Review");
    query.whereEqualTo("movie", movie);
    List<AVObject> reviews = query.find();
    int sum = 0;
    if (reviews == null && reviews.isEmpty()) {
      return 0;
    }
    for (AVObject review : reviews) {
      sum += review.getInt("star");
    }
    return sum / reviews.size();
  }
```
{% endblock %}

{% block cloudFuncParams %}

云函数的信息是通过 @EngineFunctionParam 来指定传入参数的名字和对应的类型的.

AVUser.getCurrentUser() 则可以获取与每个请求关联(根据客户端发送的 LC-Session 头)的用户信息


EngineRequestContext 则可以获取额外的一些 metaData 信息
{% endblock %}

{% block runFuncExample %}

```java
    Map<String, Object> params = new HashMap<String, Object>();
    params.put("movie", "夏洛特烦恼");
    try {
      float result = AVCloud.callFunction("averageStars", params);
    } catch (AVException e) {
      e.printStackTrace();
    }
```
{% endblock %}

{% block errorCodeExample %}

错误响应码允许自定义。可以在云函数中间 throw AVException 来指定 code 和 error 消息,如果是普通的 Exception，code 值则是默认的1 。

```java
  @EngineFunction("me")
  public static AVUser getCurrentUser() throws Exception {
    AVUser u = AVUser.getCurrentUser();
    if (u == null) {
      throw new AVException(211, "Could not find user");
    } else {
      return u;
    }
  }
```
{% endblock %}

{% block errorCodeExample2 %}

```java
  @EngineFunction()
  public static void customErrorCode() throws Exception {
    throw new AVException(123,"custom error message");
  }
```
{% endblock %}

{% block beforeSaveExample %}

```java
  @EngineHook(className = "Review", type = EngineHookType.beforeSave)
  public static AVObject reviewBeforeSaveHook(AVObject review) throws Exception {
    if (AVUtils.isBlankString(review.getString("comment"))) {
      throw new Exception("No Comment");
    } else if (review.getString("comment").length() > 140) {
      review.put("comment", review.getString("comment").substring(0, 137) + "...");
    }
    return review;
  }
```
{% endblock %}

{% block afterSaveExample %}

```java
  @EngineHook(className = "Review", type = EngineHookType.afterSave)
  public static void reviewAfterSaveHook(AVObject review) throws Exception {
    AVObject post = review.getAVObject("post");
    post.fetch();
    post.increment("comments");
    post.save();
  }
```
{% endblock %}

{% block afterSaveExample2 %}

```java
  @EngineHook(className = "_User", type = EngineHookType.afterSave)
  public static void userAfterSaveHook(AVUser user) throws Exception {
    user.put("from", "LeanCloud");
    user.save();
  }
```
{% endblock %}

{% block beforeUpdateExample %}

```java
 @EngineHook(className = "Review", type = EngineHookType.beforeUpdate)
  public static AVObject reviewBeforeUpdateHook(AVObject review) throws Exception {
    List<String> updateKeys = EngineRequestContext.getUpdateKeys();
    for (String key : updateKeys) {
      if ("comment".equals(key) && review.getString("comment").length()>140) {
        throw new Exception("comment 长度不得超过 140 字符");
      }
    }
    return review;
  }
```
{% endblock %}

{% block afterUpdateExample %}

```java
  @EngineHook(className = "Article", type = EngineHookType.afterUpdate)
  public static void articleAfterUpdateHook(AVObject article) throws Exception {
    LogUtil.avlog.d("updated article,the id is:" + article.getObjectId());
  }
```
{% endblock %}

{% block beforeDeleteExample %}

``` java
  @EngineHook(className = "Album", type = EngineHookType.beforeDelete)
  public static AVObject albumBeforeDeleteHook(AVObject album) throws Exception {
    AVQuery query = new AVQuery("Photo");
    query.whereEqualTo("album", album);
    int count = query.count();
    if (count > 0) {
      throw new Exception("无法删除非空相簿");
    } else {
      return album;
    }
  }
```
{% endblock %}

{% block afterDeleteExample %}

``` java
  @EngineHook(className = "Album", type = EngineHookType.afterDelete)
  public static void albumAfterDeleteHook(AVObject album) throws Exception {
    AVQuery query = new AVQuery("Photo");
    query.whereEqualTo("album", album);
    List<AVObject> result = query.find();
    if (result != null && !result.isEmpty()) {
      AVObject.deleteAll(result);
    }
  }
```
{% endblock %}

{% block onVerifiedExample %}

``` java
  @EngineHook(className = "_User", type = EngineHookType.onVerified)
  public static void userOnVerifiedHook(AVUser user) throws Exception {
    LogUtil.avlog.d("onVerified: sms,user:" + user.getObjectId());
  }
```
{% endblock %}

{% block onLoginExample %}

```java
  @EngineHook(className = "_User", type = EngineHookType.onVerified)
  public static AVUser userOnLoginHook(AVUser user) throws Exception {
    if ("noLogin".equals(user.getUsername())) {
      throw new Exception("Forbidden");
    } else {
      return user;
    }
  }
```
{% endblock %}

{% block code_hook_message_received %}

```java
  @IMHook(type = IMHookType.messageReceived)
  public static Map<String, Object> onMessageReceived(Map<String, Object> params) {
    // 打印整个 Hook 函数的参数
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    // 获取消息内容
    String content = (String)params.get("content");
    // 转化成 Map 格式
    Map<String,Object> contentMap = (Map<String,Object>)JSON.parse(content);
    // 读取文本内容
    String text = (String)(contentMap.get("_lctext").toString());
    // 过滤广告内容
    String processedContent = text.replace("XX中介", "**");
    // 将过滤之后的内容发还给服务端
    result.put("content",processedContent);
    return result;
  }
```
{% endblock %}

{% block code_hook_receiver_offline %}

```java
   @IMHook(type = IMHookType.receiversOffline)
   public static Map<String, Object> onReceiversOffline(Map<String, Object> params) {
     String alert = (String)params.get("content");
     if(alert.length() > 6){
       alert = alert.substring(0, 6);
     }
     System.out.println(alert);
     Map<String, Object> result = new HashMap<String, Object>();
     JSONObject object = new JSONObject();
     object.put("badge", "Increment");
     object.put("sound", "default");
     object.put("_profile", "dev");
     object.put("alert", alert);
     result.put("pushMessage", object.toString());
     return result;
  }
```
{% endblock %}

{% block code_hook_conversation_start %}

```java
  @IMHook(type = IMHookType.conversationStart)
  public static Map<String, Object> onConversationStart(Map<String, Object> params) {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    // 如果创建者是 black 可以拒绝创建对话
    if ("black".equals(params.get("initBy"))) {
      result.put("reject", true);
      // 这个数字是由开发者自定义的
      result.put("code", 9890);
    }
    return result;
  }
```
{% endblock %}

{% block code_hook_conversation_started %}

```java
  @IMHook(type = IMHookType.conversationStarted)
  public static Map<String, Object> onConversationStarted(Map<String, Object> params) throws Exception {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    String convId = (String)params.get("convId");
    System.out.println(convId);
    return result;
  }
```
{% endblock %}

{% block code_hook_conversation_add %}

```java
  @IMHook(type = IMHookType.conversationAdd)
  public static Map<String, Object> onConversationAdd(Map<String, Object> params) {
    System.out.println(params);
    String[] members = (String[])params.get("members");
    Map<String, Object> result = new HashMap<String, Object>();
    System.out.println("members");
    System.out.println(members);
    // 以下代码表示此次操作的发起人如果是 black 就拒绝此次操作，members 不会被加入到当前对话中
    if ("black".equals(params.get("initBy"))) {
      result.put("reject", true);
      // 这个数字是由开发者自定义
      result.put("code", 9890);
    }
    return result;
  }
```
{% endblock %}

{% block code_hook_conversation_remove %}

```java
  @IMHook(type = IMHookType.conversationRemove)
  public static Map<String, Object> onConversationRemove(Map<String, Object> params) {
    System.out.println(params);
    String[] members = (String[])params.get("members");
    Map<String, Object> result = new HashMap<String, Object>();
    System.out.println("members");
    // 以下代码表示此次操作的发起人如果是 black 就拒绝此次操作，members 不会被删除
    if ("black".equals(params.get("initBy"))) {
      result.put("reject", true);
      // 这个数字是由开发者自定义
      result.put("code", 9892);
    }
    return result;
  }
```
{% endblock %}

{% block code_hook_conversation_update %}

```java
  @IMHook(type = IMHookType.conversationUpdate)
  public static Map<String, Object> onConversationUpdate(Map<String, Object> params) {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    Map<String,Object> attr = (Map<String,Object>)params.get("attr");
    System.out.println(attr);
    //Map<String,Object> attrMap = (Map<String,Object>)JSON.parse(attr);
    String name = (String)attr.get("name");
    //System.out.println(attrMap);
    System.out.println(name);
    // 以下代码表示此次操作的发起人如果是 black 就拒绝此次操作，对话的属性不会被修改
    if ("black".equals(params.get("initBy"))) {
      result.put("reject", true);
      result.put("code", 9893);
    }
    return result;
  }
```
{% endblock %}

{% block errorCodeExampleForHooks %}

```java
  @EngineHook(className = "Review", type = EngineHookType.beforeSave)
  public static AVObject reviewBeforeSaveHook(AVObject review) throws Exception {
    throw new AVException(123,"自定义错误信息");
  }
```
{% endblock %}

{% block useMasterKey %}
```java
// 通常位于 src/**/AppInitListener.java
JavaRequestSignImplementation.instance().setUseMasterKey(true);
```
{% endblock %}

{% block code_hook_message_sent %}

```java
  @IMHook(type = IMHookType.messageSent)
  public static Map<String, Object> onMessageSent(Map<String, Object> params) {
    System.out.println(params);
    Map<String, Object> result = new HashMap<String, Object>();
    // ...
    return result;
  }
```
{% endblock %}
