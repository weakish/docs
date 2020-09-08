# 教程

## 官方教程

### 开发微博 OAuth 授权验证回调服务器

<p class="text-muted">以云引擎作为微博 OAuth 授权验证回调服务器，实现微博账号登录。</p>

开发过微博应用或者是接入过 QQ 登录的应用都需要在后台设置一个回调服务器地址，用来接收回调信息（为何需要回调服务器请阅读 [OAuth 2 官方文档](http://oauth.net/2/)）。许多用户在云引擎上托管网站，因为他们在制作登录页面的时候，需要实现微博登录等第三方登录的功能。将云引擎做为回调服务器可以节省成本，快速实现需求。

<a href="webhosting_oauth.html" class="btn btn-default">阅读</a>

### 快速开发聊天机器人

聊天工具除了用来传递消息之外，还可以帮我们完成一些重复琐碎的工作，比如让它去追踪一些数据变化，象下图中的 Trump 会告诉我们发表在知乎上的帖子又增加了多少新的读者关注。

<img src="images/bearchat-robot.jpg" width="50%" height="50%" />

<a href="https://zhuanlan.zhihu.com/p/21399155" class="btn btn-default" target="_blank">阅读</a>

## 第三方教程

### 为聊天接入表情云

<p class="text-muted">快速为聊天应用加入丰富有趣的表情功能，让用户们爽聊到爆。</p>

![emoji](images/emoji-mm.png)

[表情云™](http://www.biaoqingmm.com/) 为 LeanCloud 即时通讯 SDK 开发了相兼容的「表情 mm SDK」，所有接入 LeanCloud 的用户均可轻松接入表情云服务，在一分钟内拥有一个免费、海量、正版的表情商店。

<div class="row">
  <div class="col-sm-6">
    <div class="doc-hero-links">
      <a href="https://github.com/siyanhui/bqmm-leanchat-demo-ios/tree/master/leanchat" class="doc-quick-start-btn">
            <!-- <i class="icon icon-apple"></i> -->
            iOS SDK
      </a>
    </div>
  </div>
  <div class="col-sm-6">
      <div class="doc-hero-links">
        <a href="https://github.com/siyanhui/bqmm-leanchat-demo-android" class="doc-quick-start-btn">
           Android SDK
        </a>
      </div>
  </div>
</div>

### 为网站加入收款功能

<p class="text-muted">快速接入各类支付平台，轻松收款。</p>

使用 BeeCloud 支付 SDK，在 LeanCloud 云引擎上轻松搞定收款功能。

![BeeCloud 支付平台](images/beecloud-payplatforms.png)

<a href="pay-beecloud.html" class="btn btn-default">阅读</a>

<!-- shared links, DO NOT REMOVE -->
<!-- [云引擎]: leanengine_overview.html -->
