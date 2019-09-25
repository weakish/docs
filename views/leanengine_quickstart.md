# 云引擎快速入门

该文档帮助你快速的了解如何创建一个云引擎项目，本地开发调试，以及如何部署到云端。

## 创建项目

请根据 [命令行工具使用指南 &middot; 安装](leanengine_cli.html#安装命令行工具) 安装最新版的 LeanCloud 官方命令行工具，并确保你已经在本地机器上可以成功运行命令行工具：

```
lean help
```
如果一切正常，你应该看到命令行工具的帮助信息。

使用命令行工具创建项目：

```
lean init
```
然后根据提示输入相关信息即可。

## 本地运行

首先在当前项目的目录下安装必要的依赖，执行如下命令行：

```javascript
npm install
```
```python
pip install -Ur requirements.txt
```
```php
composer install
```
```java
mvn package
```

然后启动应用：

```
lean up
```

## 访问站点

打开浏览器访问 <http://localhost:3000> 会显示如下内容：

```javascript
LeanEngine

这是 LeanEngine 的示例应用

当前时间：Mon Feb 01 2016 18:23:36 GMT+0800 (CST)

一个简单的「TODO 列表」示例
```
```python
LeanEngine

这是 LeanEngine 的示例应用

一个简单的动态路由示例

一个简单的「TODO 列表」示例
```
```php
LeanEngine

这是 LeanEngine 的示例应用

当前时间：2016-07-25T14:55:17+08:00

一个简单的「TODO 列表」示例
```
```java
LeanEngine

这是 LeanEngine 的示例应用

一个简单的动态路由示例

一个简单的「TODO 列表」示例
```

访问页面的路由定义如下：

```javascript
// ./app.js
// ...

app.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() });
});

// ...
```
```python
# ./app.py
# ...

@app.route('/')
def index():
    return render_template('index.html')

# ...
```
```php
// ./src/app.php
// ...

$app->get('/', function (Request $request, Response $response) {
    return $this->view->render($response, "index.phtml", array(
        "currentTime" => new \DateTime(),
    ));
});

// ...
```
```java
// ./src/main/webapp/WEB-INF/web.xml
// ...

  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
  </welcome-file-list>

// ...
```

### 新建一个 Todo

用浏览器打开 <http://localhost:3000/todos> ，然后在输入框输入 「点个外卖」并点击 「新增」，可以看到 Todo 列表新增加了一行。

打开控制台选择对应的应用，可以看到在 Todo 表中会有一个新的记录，它的 `content` 列的值就是刚才输入的「点个外卖」。

详细的实现细节请阅读源代码，里面有完整的代码以及注释帮助开发者理解如何在 LeanEngine 上编写符合自己项目需求的代码。

## 部署到云端

使用免费版的应用可以直接部署到生产环境：

```
lean deploy
```

如果生产环境是标准实例，需要加上 `--prod 1` 参数，指定部署到生产环境：

```
lean deploy --prod 1
```

你可以在控制台[绑定云引擎域名][engine-domain]，绑定域名后，即可通过绑定域名访问你的应用。
例如，假定你在控制台绑定了 `web.example.com` 这个域名，即可通过 `https://web.example.com` 访问你的应用（生产环境）。

[engine-domain]: custom-api-domain-guide.html#云引擎域名

你也可以在 [控制台 > 云引擎 > 设置](/dashboard/cloud.html?appid={{appid}}#/conf) 的「Web 主机域名」部分，申请一个云引擎开发域名。
然后通过控制台生成的域名访问你的应用。
注意，该域名仅供开发测试期间使用，不保证可用性，3 个月后可能被停用，网站正式上线前请绑定自定义域名。

{% call docs.noteWrap() %}
DNS 可能需要等待几个小时后才能生效。
{% endcall %}