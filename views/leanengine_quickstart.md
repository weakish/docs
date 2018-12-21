# 云引擎快速入门

该文档帮助你快速的了解如何创建一个云引擎项目，本地开发调试，以及如何部署到云端。

## 创建项目

### 使用命令行创建项目（推荐）

在本地创建项目需要使用 LeanCloud 官方命令行工具，请根据 [命令行工具使用指南 &middot; 安装](leanengine_cli.html#安装命令行工具) 部分安装该工具，并确保你已经在本地机器上可以成功运行命令行工具：

```
lean help
```
如果一切正常，你应该看到命令行工具的帮助信息。

使用命令行工具创建项目：

```
lean init
```
然后根据提示输入相关信息即可。

### 从项目模板创建

从 Github 迁出示例项目，该项目可以作为一个你应用的基础：

```javascript
git clone https://github.com/leancloud/node-js-getting-started.git
cd node-js-getting-started
```
```python
git clone https://github.com/leancloud/python-getting-started.git
cd python-getting-started
```
```php
git clone https://github.com/leancloud/slim-getting-started.git
cd slim-getting-started
```
```java
git clone https://github.com/leancloud/java-war-getting-started.git
cd java-war-getting-started
```

然后添加应用 appId 等信息到该项目：

```
lean switch
```

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

如果你设置了 [二级域名](leanengine_webhosting_guide-node.html#设置域名)，即可通过 `http://${your_app_domain}.{{engineDomain}}` 访问你应用的生产环境。

如果生产环境是标准实例，`lean deploy` 会先部署到预备环境（`http://stg-${your_app_domain}.{{engineDomain}}`），你可以再运行一下 `lean publish` 来部署到生产环境：

```
lean publish
```
