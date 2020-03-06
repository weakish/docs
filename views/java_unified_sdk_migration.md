# Java Unified SDK 迁移指南

如果你还在在使用我们老版本 Android SDK（所有版本号低于 `5.0.0`，`groupId` 为 `cn.leancloud.android` 的 libraries），要迁移到最新的 Java Unified SDK，请阅读以下指南。如果你使用的已经是新版本 SDK（版本号高于 `5.0.0`），那么可以忽略本文档。

## 新老版本的差异说明

与老版本 SDK 相比，新版 SDK 的主要改进有两点：

- 一份代码，支持多个平台

老版本 SDK 因为历史原因，Android 平台和纯 Java 平台（在云引擎中使用）是两套完全分开的代码，接口不统一，维护也比较困难。新的 SDK 则对此进行了修改，使用一套代码来适配多个平台。 

- Reactive API

老版本 SDK 所有的网络请求都是通过 Callback 方式实现的，在有多次前后依赖的请求时会导致代码嵌套层级过多，影响阅读，同时在 Java 开发环境下这种异步的方式也不友好。故而新版本 SDK 完全基于 RxJava 来构建，满足函数式编程要求，可以非常方便地支持这种扩展。

### 新版本 SDK 的结构说明
新版本 Java SDK 主要包含以下几个 library，其层次结构以及平台对应关系如下：

#### 基础包（可以在纯 Java 环境下调用）
- storage-core：包含所有数据存储的功能，如
  - 结构化数据（AVObject）
  - 内建账户系统（AVUser）
  - 查询（AVQuery）
  - 文件存储（AVFile）
  - 社交关系（AVFriendship，当前版本暂不提供）
  - 朋友圈（AVStatus，当前版本暂不提供）
  - 短信（AVSMS）
  - 等等
- realtime-core：部分依赖 storage-core library，实现了 LiveQuery 以及即时通讯功能，如：
  - LiveQuery
  - AVIMClient
  - AVIMConversation 以及多种场景对话
  - AVIMMessage 以及多种子类化的多媒体消息
  - 等等

#### Android 特有的包
- storage-android：是 storage-core 在 Android 平台的定制化实现，接口与 storage-core 完全相同。
- realtime-android：是 realtime-core 在 Android 平台的定制化实现，并且增加 Android 推送相关接口。
- mixpush-android：是 LeanCloud 混合推送的 library，支持华为、小米、魅族、vivo 以及 oppo 的官方推送。
- leancloud-fcm：是 Firebase Cloud Messaging 的封装 library，供美国节点的 app 使用推送服务。


#### 模块依赖关系
Java SDK 一共包含如下几个模块：

目录 | 模块名 | 适用平台 | 依赖关系
---|---|---|---
./core | storage-core，存储核心 library | java | 无，它是 LeanCloud 最核心的 library
./realtime | realtime-core，LiveQuery 与实时通讯核心 library | java | storage-core
./android-sdk/storage-android | storage-android，Android 存储 library | Android | storage-core
./android-sdk/realtime-android | realtime-android，Android 推送、LiveQuery、即时通讯 library | Android | storage-android, realtime-core
./android-sdk/mixpush-android | Android 混合推送 library | Android | realtime-android
./android-sdk/leancloud-fcm | Firebase Cloud Messaging library | Android | realtime-android


## 迁移要点

新版 SDK 的函数接口尽可能沿用了老版 SDK 的命名方式，所以要做的改动主要是 `Callback` 回调机制的修改。

### 切换到 Observable 接口

例如老的方式保存一个 AVObject 的代码如下(Callback 方式)：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (e == null) {
      // 存储成功
      Log.d(TAG, todo.getObjectId());// 保存成功之后，objectId 会自动从服务端加载到本地
    } else {
      // 失败的话，请检查网络环境以及 SDK 配置是否正确
    }
  }
});
```

而新版本 SDK 里 `AVObject#saveInBackground` 方法，返回的是一个 `Observable<? extends AVObject>` 实例，我们需要 subscribe 才能得到结果通知，新版本的实现方式如下：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground().subscribe(new Observer<AVObject>() {
  public void onSubscribe(Disposable disposable) {
  }
  public void onNext(AVObject avObject) {
    System.out.println("remove field finished.");
  }
  public void onError(Throwable throwable) {
  }
  public void onComplete() {
  }
});
```

### 使用 ObserverBuilder 工具类

将所有的 Callback 改为 Observer 形式的改动会比较大，考虑到尽量降低迁移成本，我们准备了一个工具类 `cn.leancloud.convertor.ObserverBuilder`，该类有一系列的 `buildSingleObserver` 方法，来帮我们由原来的 Callback 回调函数生成 `Observable` 实例，上面的例子按照这种方法可以变为：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground().subscribe(ObserverBuilder.buildSingleObserver(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (e == null) {
      // 存储成功
      Log.d(TAG, todo.getObjectId());// 保存成功之后，objectId 会自动从服务端加载到本地
    } else {
      // 失败的话，请检查网络环境以及 SDK 配置是否正确
    }
  }
}));
```

处理异步调用结果的两种方式，可供大家自由选择。

### 包名的变化

在新版 SDK 中我们统一将包名的 root 目录由 `com.avos.avoscloud` 改成了 `cn.leancloud`，也需要大家做一个全局替换。


