{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "Swift" %}
{% set code_import_sdk_core = "import LeanCloud" %}

{% block libs_tool_automatic %}
[CocoaPods](https://cocoapods.org) 是开发 macOS 和 iOS 应用程序的一个第三方库的依赖管理工具，通过它可以定义自己的依赖关系（称作 pods），并且随着时间的推移，它会让整个开发环境中对第三方库的版本管理变得非常方便。具体可以参考 [Using CocoaPods](https://guides.cocoapods.org/using/index.html)。

首先确保开发环境中已经安装了 Ruby（macOS 系统自带 Ruby，建议安装 Xcode，Xcode 附带的 Ruby 版本较新），然后执行以下命令安装 cocoapods：

```sh
$ sudo gem install cocoapods
```

如果遇到网络问题无法从国外主站上直接下载，我们推荐一个国内的镜像：[RubyGems 镜像](https://gems.ruby-china.com/)。

在项目根目录下创建一个名为 `Podfile` 的文件（无扩展名），并添加以下内容：

```ruby
target 'YOUR_APP_TARGET' do # 替换 YOUR_APP_TARGET 为你的应用名称。
    use_frameworks!
    inhibit_all_warnings!

    pod 'LeanCloud', '~> SDK_VERSION' # 一般替换 SDK_VERSION 为最新版本的号码，最新版可以在 https://github.com/leancloud/swift-sdk/releases 查看到。
end
```

执行以下命令中的任意一条来集成 SDK：
```sh
$ pod update
```
或者
```sh
$ pod install --repo-update
```
它们的区别详见[官方文档](https://guides.cocoapods.org/using/pod-install-vs-update.html)

集成 SDK 成功后，使用项目根目录下 **`<项目名称>.xcworkspace`** 来打开项目。
{% endblock %}

{% block text_manual_setup %}{% endblock %}

{% block init_with_app_keys %}
打开 `AppDelegate.swift` 文件，添加下列导入语句到头部：

```swift
import LeanCloud
```

然后粘贴下列代码到 `application(_:didFinishLaunchingWithOptions:)` 函数内：

```swift
do {
    try LCApplication.default.set(
        id: "{{appid}}",
        key: "{{appkey}}"
    )
} catch {
    fatalError("\(error)")
}
```
{% endblock %}

{% block save_a_hello_world %}
```swift
do {
    let post = LCObject(className: "Post")
    try post.set("words", value: "Hello World!")
    _ = post.save { result in
        switch result {
        case .success:
            break
        case .failure(let error):
            print(error)
        }
    }
} catch {
    print(error)
}
```

然后，点击 `Run` 运行调试，真机和虚拟机均可。
{% endblock %}

{% block permission_access_network_config %}
{% endblock %}

{% block platform_specific_faq %}
{% endblock %}
