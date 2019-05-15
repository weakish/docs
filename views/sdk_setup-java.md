{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "Java" %}
{% set java_sdk_latest_version = '0.2.1' %}

{% block language %}Java{% endblock %}

{% block init_with_app_keys %}
{% block sdk_lifecycle_statement %}

#### SDK 维护期说明
我们于 2018 年 9 月推出了新的 [Java Unified SDK](https://blog.leancloud.cn/6376/)，兼容纯 Java、云引擎和 Android 等多个平台.（老的 [Java SDK](https://github.com/leancloud/java-sdk)，即下文介绍的 SDK）进入维护状态，直到 2019 年 9 月底停止维护。
欢迎大家切换到新的 Unified SDK，具体使用方法详见 [Unified SDK Wiki](https://github.com/leancloud/java-unified-sdk/wiki)。

{% endblock %}

然后导入 leancloud，并在 main 函数中调用 AVOSCloud.initialize 方法进行初始化：

```java
public static void main(String[] args){
    // 参数依次为 AppId、AppKey、MasterKey
    AVOSCloud.initialize("{{appid}}","{{appkey}}","{{masterkey}}");
}
```
{% endblock %}

{% block save_a_hello_world %}


``` java
     AVObject testObject = new AVObject("TestObject");
     testObject.put("words","Hello World!");
     testObject.save();
```
{% endblock %}

{% block libs_tool_automatic %}

通过 maven 配置相关依赖

``` xml
	<dependencies>
		<dependency>
			<groupId>cn.leancloud</groupId>
			<artifactId>java-sdk</artifactId>
			<version>{{java_sdk_latest_version}}</version>
		</dependency>
	</dependencies>
```

或者通过 gradle 配置相关依赖
```groovy
dependencies {
  compile("cn.leancloud:java-sdk:{{java_sdk_latest_version}}")
}
```
{% endblock %}
