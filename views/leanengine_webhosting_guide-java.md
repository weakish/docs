{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = "云引擎" %}
{% set platformName = "Java" %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = "Java" %}
{% set leanengine_middleware = "[LeanEngine Java SDK](https://github.com/leancloud/leanengine-java-sdk)" %}
{% set leanengine_java_sdk_latest_version = '0.1.11' %}


{% block runtime_description %}
Java 运行环境对内存的使用较多，所以建议：

* 以 [示例项目](https://github.com/leancloud/java-war-getting-started) 起步的应用，建议使用 512 MB 或以上规格的实例。
* 使用 [Spring Boot](https://projects.spring.io/spring-boot/) 的应用，建议使用 1 GB 或以上规格的实例。
* 本地启动并模拟完成主要业务流程操作，待应用充分初始化后，根据 Java 进程内存占用量选择相应的实例规格，需要注意保留一定的余量用以应对请求高峰。

<div class="callout callout-danger">如果云引擎 [实例规格](leanengine_plan.html#选择实例规格) **选择不当**，可能造成应用启动时因为内存溢出（OOM）导致部署失败，或运行期内存溢出导致应用频繁重启。</div>
{% endblock %}

{% block project_constraint %}
你的项目需要遵循一定格式才会被云引擎识别并运行。

云引擎 Java 运行环境使用 Maven 进行构建，所以 {{fullName}} 项目必须有 `$PROJECT_DIR/pom.xml` 文件，该文件为整个项目的配置文件。构建完成后云引擎会尝试到 `$PROJECT_DIR/target` 目录下寻找可以使用的包：

* WAR：如果项目打包成 WAR 文件，则云引擎会将其放入 Servlet 容器（当前是 Jetty 9.x）来运行。
* JAR：如果项目打包成 JAR 文件，则云引擎会通过 `java -jar <packageName>.jar` 来运行。

我们建议使用示例项目做为起步，因为一些细节的开发环境的配置会让开发调试方便很多：

* [java-war-getting-started](https://github.com/leancloud/java-war-getting-started): 使用 Servlet，集成 LeanEngine Java SDK 的一个简单项目，打包成 WAR 文件。
* [spring-boot-getting-started](https://github.com/leancloud/spring-boot-getting-started): 使用 [Spring boot](https://projects.spring.io/spring-boot/) 做为项目框架，集成 LeanEngine Java SDK 的一个简单的项目，打包成 JAR 文件。

{% endblock %}

{% block project_start %}
### 打包成 WAR 文件的项目

首先确认项目 `pom.xml` 中配置了 [jetty plugin](https://www.eclipse.org/jetty/documentation/9.4.x/jetty-maven-plugin.html)，并且 web server 的端口通过环境变量 `LEANCLOUD_APP_PORT` 获取，具体配置可以参考我们的 [示例代码](https://github.com/leancloud/java-war-getting-started/blob/master/pom.xml)。

然后使用 Maven 安装依赖并打包：

```sh
mvn package
```

以下有几种方式可以本地启动：

#### 命令行工具启动应用

```sh
lean up
```

更多有关命令行工具和本地调试的内容请参考 [命令行工具使用指南](leanengine_cli.html)。

**提示**：相对于其他启动方式，命令行工具有 [多应用管理](leanengine_cli.html#多应用管理) 功能，可以方便的切换不同应用环境。

#### 命令行设置环境变量启动

通过以下命令将云引擎运行需要的环境变量设置到当前命令行环境中，并使用 jetty 插件启动应用：

```
eval "$(lean env)"
mvn jetty:run
```

**提示**：命令 `lean env` 可以输出当前应用所需环境变量的设置语句，外层的 `eval` 是直接执行这些语句。

#### 使用 Eclipse 启动应用

首先确保 Eclipse 已经安装 Maven 插件，并将项目以 **Maven Project** 方式导入 Eclipse 中，在 **Package Explorer** 视图右键点击项目，选择 **Run As** > **Maven build...**，将 **Main** 标签页的 **Goals** 设置为 `jetty:run`，将 **Environment** 标签页增加以下环境变量和相应的值：

- LEANCLOUD_APP_ENV = `development`
- LEANCLOUD_APP_ID = `{{appid}}`
- LEANCLOUD_APP_KEY = `{{appkey}}`
- LEANCLOUD_APP_MASTER_KEY = `{{masterkey}}`
- LEANCLOUD_APP_PORT = `3000`

然后点击 run 按钮启动应用。

### 打包成 JAR 文件的项目

使用 Maven 正常的安装依赖并打包：

```sh
mvn package
```

以下有几种方式可以本地启动：

#### 命令行设置环境变量启动

通过以下命令将云引擎运行需要的环境变量设置到当前命令行环境中，并启动应用：

```
eval "$(lean env)"
java -jar target/{打包好的 jar 文件}
```

**提示**：命令 `lean env` 可以输出当前应用所需环境变量的设置语句，外层的 `eval` 是直接执行这些语句。

#### 使用 Eclipse 启动应用

首先确保 Eclipse 已经安装 Maven 插件，并将项目以 **Maven Project** 方式导入 Eclipse 中，在 **Package Explorer** 视图右键点击项目，选择 **Run As** > **Run Configurations...**，选择 `Application`，设置 `Main class:` （示例项目为 `cn.leancloud.demo.todo.Application`），将 **Environment** 标签页增加以下环境变量和相应的值：

- LEANCLOUD_APP_ENV = `development`
- LEANCLOUD_APP_ID = `{{appid}}`
- LEANCLOUD_APP_KEY = `{{appkey}}`
- LEANCLOUD_APP_MASTER_KEY = `{{masterkey}}`
- LEANCLOUD_APP_PORT = `3000`

然后点击 run 按钮启动应用。

#### 命令行工具启动应用

很抱歉，命令行工具暂不支持 JAR 项目的启动。

{% endblock %}

{% block ping %}

如果未使用 {{leanengine_middleware}}，则需要自己实现该 URL 的处理，比如这样：

```
//健康监测 router
@WebServlet(name = "LeanEngineHealthServlet", urlPatterns = {"/__engine/1/ping"})
public class LeanEngineHealthCheckServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    resp.setHeader("content-type", "application/json; charset=UTF-8");
    JSONObject result = new JSONObject();
    result.put("runtime", System.getProperty("java.version"));
    result.put("version", "custom");
    resp.getWriter().write(result.toJSONString());
  }
}
```
和

```
// 云函数列表
@WebServlet(name = "LeanEngineMetadataServlet", urlPatterns = {"/1.1/functions/_ops/metadatas"})
public class LeanEngineMetadataServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    resp.setContentType("application/json; charset=UTF-8");
    resp.getWriter().write("{\"result\":[]}");
  }
}

```
{% endblock %}

{% block supported_frameworks %}

{{fullName}} 依赖 Servlet 3.1.0 ，你可以使用任何基于 Servlet 3.1.0 的 Web 框架。
{% endblock %}

{% block custom_runtime %}

Java 云引擎只支持 1.8 运行环境和 war 包运行
{% endblock %}

{% block use_leanstorage %}

云引擎使用 {{leanengine_middleware}} 来代替 [Java 存储 SDK](https://github.com/leancloud/java-sdk) 。前者依赖了后者，并增加了云函数和 Hook 函数的支持，因此开发者可以直接使用 [LeanCloud 的存储服务](leanstorage_guide-java.html) 来存储自己的数据。

如果使用项目框架作为基础开发，{{leanengine_middleware}} 默认是配置好的，可以根据示例程序的方式直接使用。

如果是自定义项目，则需要自己配置：

* 配置依赖：在 pom.xml 中增加依赖配置来增加 {{leanengine_middleware}} 的依赖：

```xml
	<dependencies>
		<dependency>
			<groupId>cn.leancloud</groupId>
			<artifactId>leanengine</artifactId>
			<version>{{leanengine_java_sdk_latest_version}}</version>
		</dependency>
	</dependencies>
```

* 初始化：在正式使用数据存储之前，你需要使用自己的应用 key 进行初始化中间件：

```java
import com.avos.avoscloud.internal.impl.JavaRequestSignImplementation;
import cn.leancloud.LeanEngine;

// 从 LEANCLOUD_APP_ID 这个环境变量中获取应用 app id 的值
String appId = System.getenv("LEANCLOUD_APP_ID");

// 从 LEANCLOUD_APP_KEY 这个环境变量中获取应用 app key 的值                
String appKey = System.getenv("LEANCLOUD_APP_KEY");

// 从 LEANCLOUD_APP_MASTER_KEY 这个环境变量中获取应用 master key 的值        
String appMasterKey = System.getenv("LEANCLOUD_APP_MASTER_KEY");   

LeanEngine.initialize(appId, appKey, appMasterKey);

// 如果不希望使用 masterKey 权限，可以将下面一行删除
JavaRequestSignImplementation.instance().setUseMasterKey(true);
```
{% endblock %}

{% block custom_api_random_string %}
{{productName}} 允许开发者自定义基于 HTTP（HTTPS） 的 API。
例如，开发者如果想实现一个获取服务端时间的 API，可以在代码中如下做：

新建一个类 TimeServlet 继承 HttpServlet :

```java
@WebServlet(name = "TimeServlet", urlPatterns = {"/time"})
public class TimeServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
     resp.setHeader("content-type", "application/json; charset=UTF-8");
    JSONObject result = new JSONObject();
     result.put("currentTime",new Date());
    resp.getWriter().write(result.toJSONString());
  }
}

```

然后打开浏览器，访问 <http://localhost:3000/time>，浏览器应该会返回如下类似的内容：

```json
{"currentTime":"2016-02-01T09:43:26.223Z"}
```

部署到云端后，你可以通过 `http://{{var_app_domain}}.leanapp.cn/time` 来访问该 API。你的 iOS 或者 Android 的程序就可以构建一个 HTTP 请求获取服务端时间了。当然还是建议使用各 SDK 内置的获取服务器时间的 API，这里的例子只是演示。
{% endblock %}

{% block code_get_client_ip_address %}

``` java
EngineRequestContext.getRemoteAddress();
```
{% endblock %}

{% block get_env %}

```java
String env = System.getenv("LEANCLOUD_APP_ENV");
if (env.equals("development")) {
    // 当前环境为「开发环境」，是由命令行工具启动的
} else if (env.equals("production")) {
    // 当前环境为「生产环境」，是线上正式运行的环境
} else {
    // 当前环境为「预备环境」
}
```
{% endblock %}

{% block http_client %}

云引擎 Java 环境可以使用 URL 或者是 HttpClient 等基础类 ，不过我们推荐使用 okhttp 等第三方库来处理 HTTP 请求。

``` java
    Request.Builder builder = new Request.Builder();
    builder.url(url).get();
    OkHttpClient client  = new OkHttpClient();
    Call call = client.newCall(buidler.build());
    try{
      Response response = call.execute();
    }catch(Exception e){
    }
```
{% endblock %}

{% block code_upload_file_sdk_function %}

```
@WebServlet("/upload")
@MultipartConfig
public class UploadServlet extends HttpServlet {

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String description = request.getParameter("description"); // Retrieves <input type="text" name="description">
    Part filePart = request.getPart("iconImage"); // Retrieves <input type="file" name="file">
    String fileName = filePart.getSubmittedFileName();
    InputStream fileContent = filePart.getInputStream();
    // ... (do your job here)
  }
}
```
{% endblock %}

{% block cookie_session %}
云引擎提供了一个 `EngineSessionCookie` 组件，用 Cookie 来维护用户（`AVUser`）的登录状态，要使用这个组件可以在初始化时添加下列代码：

```java
// 加载 cookieSession 以支持 AV.User 的会话状态
LeanEngine.addSessionCookie(new EngineSessionCookie("my secret", 3600, true));
```

`EngineSessionCookie` 的构造函数参数包括：

* **secret**：一个只保存在服务端的字符串，可以设置为任意值。但每次修改之后，所有已有的 cookie 都会失效，也就是所有用户的登录 session 都将过期。
* **maxAge**：设置 Cookie 的过期时间。单位秒。
* **fetchUser**：**是否自动 fetch 当前登录的 AV.User 对象。默认为 false。**
  如果设置为 true，每个 HTTP 请求都将发起一次 LeanCloud API 调用来 fetch 用户对象。如果设置为 false，默认只可以访问 `AVUser.getCurrentUser()` 的 `id`（`_User` 表记录的 ObjectId）和 `sessionToken` 属性，你可以在需要时再手动 fetch 整个用户。

* 在云引擎方法中，通过 `AVUser.getCurrentUser()` 获取用户信息。
* 在网站托管中，通过 `AVUser.getCurrentUser()` 获取用户信息。
* 在后续的方法调用显示传递 user 对象。

你可以这样简单地实现一个具有登录功能的站点：

#### 登录
```java
@WebServlet(name = "LoginServlet", urlPatterns = {"/login"})
public class LoginServlet extends HttpServlet {

  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    req.getRequestDispatcher("/login.jsp").forward(req, resp);
  }

  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    String username = req.getParameter("username");
    String passwd = req.getParameter("password");
    try {
      AVUser.logIn(username, passwd);
      resp.sendRedirect("/profile");
    } catch (AVException e) {
      resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      resp.setContentType("application/json; charset=UTF-8");
      JSONObject result = new JSONObject();
      result.put("code", e.getCode());
      result.put("error", e.getMessage());
      resp.getWriter().write(result.toJSONString());
      e.printStackTrace();
    }
  }

}
```
#### 登出
``` java
@WebServlet(name = "LogoutServlet", urlPatterns = {"/logout"})
public class LogoutServlet extends HttpServlet {

  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    doPost(req, resp);
  }

  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    AVUser user = AVUser.getCurrentUser();
    if (user != null) {
      user.logOut();
    }
    resp.sendRedirect("/profile");
  }

}
```

#### Profile页面

```java
@WebServlet(name = "ProfileServlet", urlPatterns = {"/profile"})
public class ProfileServlet extends HttpServlet {

  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,
      IOException {
    resp.setContentType("application/json; charset=UTF-8");
    JSONObject result = new JSONObject();
    if (AVUser.getCurrentUser() != null) {
      result.put("currentUser", AVUser.getCurrentUser());
    }
    resp.getWriter().write(result.toJSONString());
  }

}
```

一个简单的登录页面（`login.jsp`）可以是这样：

```html
<html>
    <head></head>
    <body>
      <form method="post" action="/login">
        <label>Username</label>
        <input name="username"></input>
        <label>Password</label>
        <input name="password" type="password"></input>
        <input class="button" type="submit" value="Login">
      </form>
    </body>
  </html>
```

{% endblock %}

{% block https_redirect %}


```java
LeanEngine.setHttpsRedirectEnabled(true);
```
{% endblock %}
