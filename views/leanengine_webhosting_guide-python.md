{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = '云引擎' %}
{% set platformName = 'Python' %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = 'Python' %}
{% set leanengine_middleware = '[LeanCloud Python SDK](https://github.com/leancloud/python-sdk)' %}


{% block getting_started %}

将示例代码 [leancloud/python-getting-started](https://github.com/leancloud/python-getting-started) 克隆到本地：

```sh
git clone https://github.com/leancloud/python-getting-started.git
```

在本地运行 LeanEngine Python 应用，首先需要这几个依赖：

- **python**：请确保本地安装的 Python 版本与线上使用的相同，以免不同版本之间的兼容性导致问题。推荐使用 [pyenv](https://github.com/pyenv/pyenv) 来管理本地 Python 版本。
- **pip**：用来安装第三方依赖。
- **virtualenv**：可选，建议使用 virtualenv 或者类似的工具来创建一个独立的 Python 环境，以免项目使用到的依赖与系统／其他项目的版本产生冲突。

请确保以上依赖都已经在本机上安装就绪，然后在项目目录下执行如下命令，来安装项目用到的第三方依赖：

```sh
pip install -r requirements.txt
```

更多有关命令行工具和本地调试的内容请参考 [命令行工具使用指南](leanengine_cli.html)。

{% endblock %}

{% block project_constraint %}

## 项目骨架

参照示例项目，你的项目需要遵循一定格式才会被云引擎识别并运行。

{{fullName}} 使用 WSGI 规范来运行项目，项目根目录下必须有 `wsgi.py` 与 `requirements.txt` 文件，可选文件 `.python-version`、`runtime.txt`。云引擎运行时会首先加载 `wsgi.py` 这个模块，并将此模块的全局变量 `application` 做为 WSGI 函数进行调用。因此请保证 `wsgi.py` 文件中包含一个 `application` 的全局变量／函数／类，并且符合 WSGI 规范。

更多关于 **WSGI 函数** 的内容，请参考 [WSGI 接口](http://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000/001432012393132788f71e0edad4676a3f76ac7776f3a16000) 或者 [PEP333](https://www.python.org/dev/peps/pep-0333/)。

{% endblock %}
{% block custom_runtime %}
### 添加第三方依赖模块

`requirements.txt` 中填写项目依赖的第三方模块，每行一个，如：

```
# 井号至行尾为注释
leancloud>=2.0.0,<3.0.0
Flask>=0.10.1,<1.0.0                               # 可以指定版本号／范围
git+https://github.com/foo/bar.git@master#egg=bar  # 可以使用 Git/SVN 等版本管理工具的远程地址
```

详细格式请参考 [pip 文档 &middot; Requirements Files](https://pip.pypa.io/en/stable/user_guide/#requirements-files)。

应用部署到云引擎之后，会自动按照 `requirements.txt` 中的内容进行依赖安装。在本地运行和调试项目的时候，可以在项目目录下使用如下命令安装依赖：

```sh
pip install -r requirements.txt
```

另外当你部署应用的时候，建议将依赖的包的版本都按照 `foo==1.0.0` 这种格式来明确指定版本号（或版本的范围），防止因为依赖的模块升级且不再兼容老的 API 时，当再次部署时会导致应用运行失败。

### 指定 Python 版本

你可以选择运行代码的 Python 版本，选择方法与 [pyenv](https://github.com/pyenv/pyenv) 相同，即在项目根目录的 `.python-version` 中写入需要的 Python 版本即可，比如 `3.6.1`。这样将代码部署到云引擎之后，系统会自动选择对应的 Python 版本。

如果在本地开发时已使用了 pyenv，pyenv 也会根据此文件来自动使用对应的 Python 运行项目。我们建议本地开发使用 pyenv，以保证本地环境与线上相同。pyenv 的安装方法请参考 [pyenv 官方网站](https://github.com/pyenv/pyenv)。

目前仅支持 CPython 版本，暂时不支持 pypy、jython、iron python 等其他 Python 实现。另外建议尽量使用 3.5 或以上版本的 Python 进行开发，如果仍然在使用 Python2 ，请使用 Python2.7 进行开发。

{{ docs.note("在之前版本的云引擎中，你可以在项目根目录的 `runtime.txt` 中填写 `python-3.5` 或者 `python-2.7` 来指定 Python 版本。如果当前项目仍然在使用此方法，建议使用上面介绍的方式来指定。") }}

{% endblock %}


{% block supported_frameworks %}
如前所述，只要兼容 Python WSGI 规范的框架都可以在云引擎运行。目前比较流行的 Python Web 框架对此都有支持，比如 [Flask](http://flask.pocoo.org)、[Django](https://www.djangoproject.com)、[Tornado](http://www.tornadoweb.org)。

我们提供了 Flask 和 Django 两个框架的示例项目作为参考，你也可以直接把它们当作一个应用项目的初始化模版：

- [Flask](https://github.com/leancloud/python-getting-started)
- [Django](https://github.com/leancloud/django-getting-started)
{% endblock %}

### 锁定第三方依赖版本

Python 云引擎每次在重新构建时，都会去执行 `pip install -r requirements.txt`，因此如果没有明确指定第三方依赖的版本的话，可能会导致完全相同的代码因第三方依赖的改动而产生不一致的行为。

为了避免这种情况的发生，建议在 `requirements.txt` 中明确指定全部第三方依赖的版本。使用 `pip freeze` 命令，可以查看当前 `pip` 安装的第三方模块的版本。如果使用 `virtualenv` 来进行开发，并且当前 `virtualenv` 只包含当前项目的依赖的话，可以考虑将 `pip freeze` 的所有内容都写到 `requirements.txt` 中。

{% block use_leanstorage %}

## 使用数据存储服务

在云引擎中你可以使用 LeanCloud 提供的 [数据存储](storage_overview.html) 作为应用的后端数据库，以及使用其他 LeanCloud 提供的功能。 LeanCloud Python SDK 可以让你更加方便地使用这些功能。

### 安装

将 `leancloud` 添加到 `requirements.txt` 中，部署到线上即可自动安装此依赖。在本地运行和调试项目的时候，可以在项目目录下使用如下命令进行依赖安装：

```sh
pip install -r requirements.txt
```

### 升级到 leancloud SDK 2.x

LeanCloud Python SDK 目前最新版本已经升级到了 2.0.0，与之前的 1.x 版本相比有了一些不兼容的改动，主要是移除了一些已经废弃的方法，详情参考 [SDK 发布页面](https://github.com/leancloud/python-sdk/releases/tag/v2.0.0)。

不过目前云引擎上有一部分使用者，没有在 requirements.txt 中指定依赖的 Python SDK 版本，因此我们暂时没有将 2.x 分支的代码发布到 pypi 的 [leancloud-sdk](https://pypi.python.org/pypi/leancloud-sdk/) 这个包下，防止对这部分使用者正在运行的代码造成影响。因此目前如果需要使用 2.x 版本的 SDK 的话，请使用 [leancloud](https://pypi.python.org/pypi/leancloud/) 这个包名。

### 初始化

因为 `wsgi.py` 是项目最先被执行的文件，推荐在此文件进行 LeanCloud Python SDK 的初始化工作：

```python
import os

import leancloud

APP_ID = os.environ['LEANCLOUD_APP_ID']                # 从 LEANCLOUD_APP_ID 这个环境变量中获取应用 app id 的值
APP_KEY = os.environ['LEANCLOUD_APP_KEY']              # 从 LEANCLOUD_APP_KEY 这个环境变量中获取应用 app key 的值
MASTER_KEY = os.environ['LEANCLOUD_APP_MASTER_KEY']    # 从 LEANCLOUD_APP_MASTER_KEY 这个环境变量中获取应用 master key 的值

leancloud.init(APP_ID, app_key=APP_KEY, master_key=MASTER_KEY)
# 如果需要使用 master key 权限访问 LeanCLoud 服务，请将这里设置为 True
leancloud.use_master_key(False)
```

接下来就可以在项目的其他部分中使用 LeanCloud Python SDK 提供的功能了。更多用法请参考 [LeanCloud Python SDK 数据存储开发指南](leanstorage_guide-python.html)。
{% endblock %}

{% block get_env %}
```python
import os

env = os.environ.get('LEANCLOUD_APP_ENV')
if env == 'development':
  # 当前环境为「开发环境」，是由命令行工具启动的
  do_some_thing()
elif env == 'production':
  # 当前环境为「生产环境」，是线上正式运行的环境
  do_some_thing()
elif env == 'staging':
  # 当前环境为「预备环境」
  do_some_thing()
```
{% endblock %}

{% block cookie_session %}
Python SDK 提供了一个 `leancloud.engine.CookieSessionMiddleware` 的 WSGI 中间件，使用 Cookie 来维护用户（`leancloud.User`）的登录状态。要使用这个中间件，可以在 `wsgi.py` 中将：

```python
application = engine
```

替换为:

```python
application = leancloud.engine.CookieSessionMiddleware(engine, secret=YOUR_APP_SECRET)
```

你需要传入一个 secret 的参数，用户签名 Cookie（必须提供），这个中间件会将 `AV.User` 的登录状态信息记录到 Cookie 中，用户下次访问时自动检查用户是否已经登录，如果已经登录，可以通过 `leancloud.User.get_current()` 获取当前登录用户。

`leancloud.engine.CookieSessionMiddleware` 初始化时支持的非必须选项包括：

* **name**: 在 cookie 中保存的 session token 的 key 的名称，默认为 "leancloud:session"。
* **excluded_paths**: 指定哪些 URL path 不处理 session token，比如在处理静态文件的 URL path 上不进行处理，防止无谓的性能浪费。接受参数类型 `list`。
* **fetch_user**: 处理请求时是否要从存储服务获取用户数据，如果为 False 的话，`leancloud.User.get_current()` 获取到的用户数据上除了 `session_token` 之外没有任何其他数据，需要自己调用 `fetch()` 来获取。为 `True` 的话，会自动在用户对象上调用 `fetch()`，这样将会产生一次数据存储的 API 调用。默认为 False。
* **expires**: 设置 cookie 的失效日期（参考 [Werkzeug Document](http://werkzeug.pocoo.org/docs/0.12/http/#werkzeug.http.dump_cookie)）。
* **max_age**: 设置 cookie 在多少秒后失效（参考 [Werkzeug Document](http://werkzeug.pocoo.org/docs/0.12/http/#werkzeug.http.dump_cookie)）。

{% endblock %}


{% block http_client %}
你可以使用任意 Python 的模块来发送 HTTP 请求，比如内置的 urllib。不过我们推荐 [requests](http://www.python-requests.org/) 这个第三方模块。

在 `requirements.txt` 中新增一行 `requests>=2.11.0`，然后在此目录重新执行 `pip install -r requirements.txt` 就可以安装这个模块。

```python
import requests

response = requests.post('http://www.example.com/create_post', json={
    'title': 'Vote for Pedro',
    'body': 'If you vote for Pedro, your wildest dreams will come true',
})

print(response.json())
```

{% endblock %}

{% block code_get_client_ip_address %}
Flask:

```python
from flask import Flask
from flask import request

app = Flask(__name__)

@app.route('/')
def index():
    print(request.headers['x-real-ip'])
    return 'ok'
```

Django:

根据 [Django 的官方文档](https://docs.djangoproject.com/el/1.10/ref/request-response/#django.http.HttpRequest.META)，第三方定义的 HTTP Header 会加上 `HTTP_` 的前缀，并且 `-` 会被替换成 `_`，所以要通过 `HTTP_X_REAL_IP` 来访问。

```python
def index(request):
    print(request.META['HTTP_X_REAL_IP'])
    return render(request, 'index.html', {})
```

其他框架请参考对应文档。
{% endblock %}

{% block https_redirect %}
```python
import leancloud

application = get_your_wsgi_func()

# 使用 `leancloud.HttpsRedirectMiddleware` 这个 WSGI 中间件包装一下原始的提供给 LeanEngine 的 WSGI 函数
application = leancloud.HttpsRedirectMiddleware(application)
```
{% endblock %}

{% block loggerExample %}

**Python 2**

```python
import sys

print 'hello!'  # info
print >> sys.stderr, 'some error'  # error
```

**Python 3**

```python
import sys

print('hello!')  # info
print('some err', file=sys.stderr)  # error
```
{% endblock %}

{% block code_calling_custom_variables %}
```python
# 在云引擎 Python 环境中使用自定义的环境变量
import os

MY_CUSTOM_VARIABLE = os.environ.get('MY_CUSTOM_VARIABLE')
print(MY_CUSTOM_VARIABLE)
```
{% endblock %}

{% block code_upload_file_sdk_function %}
Flask:

```python
# app is your Flask instance

@app.route('/upload', methods=['POST'])
def upload():
    upload_file = request.files['iconImage']
    f = leancloud.File(upload_file.filename, data=upload_file.stream)
    print(f.url)
    return 'upload file ok!'
```

其他 Web 框架，请参考对应文档。

{% endblock %}

{% block leancache %}
首先添加相关依赖到云引擎应用的 `requirements.txt` 中：

``` python
Flask>=0.10.1,<1.0.0
leancloud>=2.0.0,<3.0.0
...
redis>=2.10.5,<3.0.0
```

然后可以使用下列代码获取 Redis 连接：

``` python
import os
import redis

r = redis.from_url(os.environ.get("REDIS_URL_<实例名称>"))
```
{% endblock %}

{% block custom_session %}
推荐使用 Web 框架自带的 session 组件。
{% endblock %}
