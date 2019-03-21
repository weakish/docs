{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "Python" %}

{% block libs_tool_automatic %}

#### pip

pip 是最推荐的 Python 包管理工具，它是 easy_install 的替代。安装 leancloud-sdk 只需执行以下命令：
```
pip install leancloud
```
根据你的环境，命令之前还可能需要加上`sudo`

#### easy_install

也可以使用 easy_install 进行安装：
```
easy_install leancloud
```
根据你的环境，命令之前还可能需要加上`sudo`
{% endblock %}

{% block init_with_app_keys %}

然后导入 leancloud，并调用 init 方法进行初始化：

```python
import leancloud

leancloud.init("{{appid}}", "{{appkey}}")
# 或者使用 masterKey
# leancloud.init("{{appid}}", master_key="{{masterKey}}")
```

{% endblock %}

{% block save_a_hello_world %}
```python
import leancloud

leancloud.init("{{appid}}", "{{appkey}}")

TestObject = leancloud.Object.extend('TestObject')
test_object = TestObject()
test_object.set('words', "Hello World!")
test_object.save()
```

然后编译执行。
{% endblock %}
