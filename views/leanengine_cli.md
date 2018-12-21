{% import "views/_leanengine.njk" as leanengine %}
{% set release = "[Github releases 页面](https://releases.leanapp.cn/#/leancloud/lean-cli/releases)" %}
{% set login = "lean login" %}

# 命令行工具 CLI 使用指南

命令行工具是用来管理和部署云引擎项目的工具。它不仅可以部署、发布和回滚云引擎代码，对同一个云引擎项目做多应用管理，还能查看云引擎日志，批量将文件上传到 LeanCloud 云端。

## 安装命令行工具

### macOS

使用 [Homebrew](http://brew.sh/) 进行安装：

```sh
brew update
brew install lean-cli
```

如果之前使用 `npm` 安装过旧版本的命令行工具，为了避免与新版本产生冲突，建议使用 `npm uninstall -g leancloud-cli` 卸载旧版本命令行工具。或者直接按照 `homebrew` 的提示，执行 `brew link --overwrite lean-cli` 覆盖掉之前的 `lean` 命令来解决。

### Windows

Windows 用户可以在 {{release}} 根据操作系统版本下载最新的 32 位 或 64 位 **msi** 安装包进行安装，安装成功之后在 Windows 命令提示符（或 PowerShell）下直接输入 `lean` 命令即可使用。

也可以选择编译好的绿色版 **exe** 文件，下载后将此文件更名为 `lean.exe`，并将其路径加入到系统 **PATH** 环境变量（[设置方法](https://www.java.com/zh_CN/download/help/path.xml)）中去。这样使用时在 Windows 命令提示符（或 PowerShell）下，在任意目录下输入 `lean` 就可以使用命令行工具了。当然也可以将此文件直接放到已经在 PATH 环境变量中声明的任意目录中去，比如 `C:\Windows\System32` 中。

### Linux

从 {{release}} 下载预编译好的二进制文件 `lean_linux_x64`，重命名为 `lean` 并放到已经在 PATH 环境变量中声明的任意目录中即可。

#### Arch Linux

Arch Linux 用户，可以考虑使用此 AUR 进行安装： https://aur.archlinux.org/packages/lean-cli-git/ 。

### 通过源码安装

请参考项目源码 [README](https://github.com/leancloud/lean-cli)。

### 升级

如果命令行工具是通过 Homebrew 安装的，那么升级它需要运行：

```sh
brew upgrade
```

使用其他方式进行安装的，则可以直接按照安装文档描述，下载最新的文件，重新执行一遍安装流程，即可把旧版本的命令行工具覆盖，升级到最新版。

## 使用

安装成功之后，直接在 terminal 终端运行 `lean -h`，输出帮助信息：

```sh
$ lean help

 _                        ______ _                 _
| |                      / _____) |               | |
| |      ____ ____ ____ | /     | | ___  _   _  _ | |
| |     / _  ) _  |  _ \| |     | |/ _ \| | | |/ || |
| |____( (/ ( ( | | | | | \_____| | |_| | |_| ( (_| |
|_______)____)_||_|_| |_|\______)_|\___/ \____|\____|
NAME:
   lean - Command line to manage and deploy LeanCloud apps

USAGE:
   lean [global options] command [command options] [arguments...]

VERSION:
   0.20.0

COMMANDS:
     login    Log in to LeanCloud
     metric   Obtain LeanStorage performance metrics of current project
     info     Show information about the current user and app
     up       Start a development instance locally
     init     Initialize a LeanEngine project
     switch   Change the associated LeanCloud app
     deploy   Deploy the project to LeanEngine
     publish  Publish code from staging to production
     upload   Upload files to the current application (available in the '_File' class)
     logs     Show LeanEngine logs
     debug    Start the debug console without running the project
     env      Output environment variables used by the current project
     cache    LeanCache shell
     cql      Start CQL interactive mode
     search   Search development docs
     help, h  Show all commands or help info for one command

GLOBAL OPTIONS:
   --version, -v  print the version
```

可以通过 `--version` 选项查看版本：


```sh
$ lean --version
lean version 0.20.0
```

下文中凡是以 `$ lean` 开头的文字即表示在终端里执行命令。

## 登录

安装完命令行工具之后，首先第一步需要登录 LeanCloud 账户。

```sh
$ {{ login }}
```

然后按照提示选择区域并输入 LeanCloud 用户名和密码完成登录。

以 GitHub、微博或 QQ 这种第三方登录方式来注册 LeanCloud 账户的用户，如果未曾设置过账户密码，需要先使用 [忘记密码](/dashboard/login.html#/forgotpass) 功能重新设置一个密码，再进行登录。

### 切换账户

要切换到另一账户，重新执行 `{{ login }}` 即可。

## 初始化项目

登录完成之后，可以使用 `init` 命令来初始化一个项目，并且关联到已有的 LeanCloud 应用上。

```sh
[?] Please select an app:
 1) AwesomeApp
 2) Foobar
```

选择项目语言／框架：

```sh
[?] Please select a language
 1) Node.js
 2) Python
 3) Java
 4) PHP
 5) Others
```

之后命令行工具会将此项目模版下载到本地，这样初始化就完成了：

```sh
[INFO] Downloading templates 6.33 KiB / 6.33 KiB [==================] 100.00% 0s
[INFO] Creating project...
```

进入以应用名命名的目录就可以看到新建立的项目。

## 关联已有项目

如果已经使用其他方法创建好了项目，可以直接在项目目录执行：

```sh
$ lean switch
```

将已有项目关联到 LeanCloud 应用上。

## 切换分组

如果应用启用了云引擎多分组功能，同样可以使用 `$ lean switch` 命令切换当前目录关联的分组。

## 本地运行

如果想将一份代码简单地部署到服务器而不在本地运行和调试，可以暂时跳过此章节。

进入项目目录：

```sh
$ cd AwesomeApp
```

之后需要安装此项目相关的依赖，需要根据项目语言来查看不同文档：

- [Python](leanengine_webhosting_guide-python.html#本地运行和调试)
- [Node.js](leanengine_webhosting_guide-node.html#本地运行和调试)
- [PHP](leanengine_webhosting_guide-php.html#本地运行和调试)
- [Java](leanengine_webhosting_guide-java.html#本地运行和调试)

启动应用：

```sh
$ lean up
```

- 在浏览器中打开 <http://localhost:3000>，进入 web 应用的首页。
- 在浏览器中打开 <http://localhost:3001>，进入云引擎云函数和 Hook 函数调试界面。

<div class="callout callout-info">
  <ul>
    <li>如果想变更启动端口号，可以使用 `lean up --port 新端口号` 命令来指定。</li>
    <li>命令行工具的所有命令都可以通过 `-h` 参数来查看详细的参数说明信息，比如 `lean up -h`。</li>
  </ul>
</div>

旧版命令行工具可以在 `$ lean up` 的过程中，监测项目文件的变更，实现自动重启开发服务进程。新版命令行工具移除了这一功能，转由项目代码本身来实现，以便更好地与项目使用的编程语言或框架集成。

- 使用旧版命令行工具创建的 Node.js 项目，请参考 [Pull Request #26](https://github.com/leancloud/node-js-getting-started/pull/26/files) 来配置。
- 使用旧版命令行工具创建的 Python 项目，请参考 [Pull Request #12](https://github.com/leancloud/python-getting-started/pull/12/files) 来配置。

除了使用命令行工具来启动项目之外，还可以**原生地**启动项目，比如直接使用 `node server.js` 或者 `python wsgi.py`。这样能够将云引擎开发流程更好地集成到开发者管用的工作流程中，也可以直接和 IDE 集成。但是直接使用命令行工具创建的云引擎项目，默认会依赖一些环境变量，因此需要提前设置好这些环境变量。

使用命令 `lean env` 可以显示出这些环境变量，手动在当前终端中设置好之后，就可以不依赖命令行工具来启动项目了。另外使用兼容 `sh` shell 的用户，还可以直接使用 `eval $(lean env)`，自动设置好所有的环境变量。

启动时还可以给启动命令增加自定义参数，在 `lean up` 命令后增加两个横线 `--`，所有在横线后的参数会被传递到实际执行的命令中。比如启动 node 项目时，想增加 `--inspect` 参数给 node 进程，来启动 node 自带的远程调试功能，只要用 `lean up -- --inspect` 来启动项目即可。

另外还可以使用 `--cmd` 来指定启动命令，这样即可使用任意自定义命令来执行项目：`lean up --cmd=my-custom-command`。

有些情况下，我们需要让 IDE 来运行项目，或者需要调试在虚拟机／远程机器上的项目的云函数，这时可以单独运行云函数调试功能，而不在本地运行项目本身：

```sh
$ lean debug --remote=http://remote-url-or-ip-address:remote-port --app-id=xxxxxx
```

更多关于云引擎开发的内容，请参考 [云引擎服务总览](leanengine_overview.html)。

## 部署

### 从本地代码部署

当开发和本地测试云引擎项目通过后，你可以直接将本地源码推送到 LeanCloud 云引擎平台运行：

```sh
$ lean deploy
```

对于生产环境是<u>体验实例</u>的云引擎的应用，这个命令会将本地源码部署到线上的生产环境，无条件覆盖之前的代码（无论是从本地仓库部署、Git 部署还是在线定义）；而对于生产环境是<u>标准实例</u>的云引擎的应用，这个命令会先部署到**预备环境**，后续需要使用 `lean publish` 来完成向生产环境的部署。

部署过程会实时打印进度：

```sh
$ lean deploy
[INFO] Current CLI tool version:  0.20.0
[INFO] Retrieving app info ...
[INFO] Preparing to deploy AwesomeApp(xxxxxx) to region: cn group: web staging
[INFO] Python runtime detected
[INFO] pyenv detected. Please make sure pyenv is configured properly.
[INFO] Uploading file 6.40 KiB / 6.40 KiB [=========================] 100.00% 0s
[REMOTE] 开始构建 20181207-115634
[REMOTE] 正在下载应用代码 ...
[REMOTE] 正在解压缩应用代码 ...
[REMOTE] 运行环境: python
[REMOTE] 正在下载和安装依赖项 ...
[REMOTE] 存储镜像到仓库（0B）...
[REMOTE] 镜像构建完成：20181207-115634
[REMOTE] 开始部署 20181207-115634 到 web-staging
[REMOTE] 正在创建新实例 ...
[REMOTE] 正在启动新实例 ...
[REMOTE] [Python] 使用 Python 3.7.1, Python SDK 2.1.8
[REMOTE] 实例启动成功：{"version": "2.1.8", "runtime": "cpython-3.7.1"}
[REMOTE] 正在更新云函数信息 ...
[REMOTE] 部署完成：1 个实例部署成功
[INFO] Deleting temporary files
```

默认部署备注为「从命令行工具构建」，显示在 [应用控制台 > 云引擎 > 日志](/cloud.html?appid={{appid}}#/log) 中。你可以通过 `-m` 选项来自定义部署的备注信息：

```sh
$ lean deploy -m 'Be more awesome! 这是定制的部署备注'
```

部署之后可以通过 curl 命令来测试你的云引擎代码，或者访问你已设置的二级域名的测试地址 `stg-${应用的域名}.{{engineDomain}}`。

#### 部署时忽略部分文件

部署项目时，如果有一些临时文件或是项目源码管理软件用到的文件，不需要上传到服务器，可以将它们加入到 `.leanignore` 文件。

`.leanignore` 文件格式与 Git 使用的 `.gitignore` 格式基本相同，每行写一个忽略项，可以是文件或者文件夹。如果项目没有 `.leanignore` 文件，部署时会根据当前项目所使用的语言创建一个默认的 `.leanignore` 文件。请确认此文件中的默认配置是否与项目需求相符。

### 从 Git 仓库部署

如果代码保存在某个 Git 仓库上，例如 [Github](https://github.com)，并且在 LeanCloud 控制台已经正确设置了 git repo 地址以及 deploy key，你也可以请求 LeanCloud 平台从 Git 仓库获取源码并自动部署。这个操作可以在云引擎的部署菜单里完成，也可以在本地执行：

```sh
$ lean deploy -g
```

- `-g` 选项要求从 Git 仓库部署，Git 仓库地址必须已经在云引擎菜单中保存。
- 默认部署使用 **master** 分支的最新代码，你可以通过 `-r <revision>` 来指定部署特定的 commit 或者 branch。
- 设置 git repo 地址以及 deploy key 的方法可以参考[云引擎网站托管指南 · Git 部署](leanengine_webhosting_guide-node.html#Git_部署)。

## 发布到生产环境

以下步骤仅适用于生产环境是 [标准实例](leanengine_plan.html#标准实例) 的用户。

如果预备环境如果测试没有问题，此时需要将预备环境的云引擎代码切换到生产环境，可以在 [应用控制台 > 云引擎 > 部署](/dashboard/cloud.html?appid={{appid}}#/deploy) 中发布，也可以直接运行 `publish` 命令：

```sh
$ lean publish
```

这样预备环境的云引擎代码就发布到了生产环境：

```sh
$ lean publish
[INFO] Current CLI tool version:  0.20.0
[INFO] Retrieving app info ...
[INFO] Deploying AwesomeApp(xxxxxx) to region: cn group: web production
[REMOTE] 开始部署 20181207-115634 到 web1,web2
[REMOTE] 正在创建新实例 ...
[REMOTE] 正在创建新实例 ...
[REMOTE] 正在启动新实例 ...
[REMOTE] 正在启动新实例 ...
[REMOTE] 实例启动成功：{"version": "2.1.8", "runtime": "cpython-3.7.1"}
[REMOTE] 实例启动成功：{"version": "2.1.8", "runtime": "cpython-3.7.1"}
[REMOTE] 正在更新云函数信息 ...
[REMOTE] 部署完成：2 个实例部署成功
```

## 查看日志

使用 `logs` 命令可以查询云引擎的最新日志：

```sh
$ lean logs
2016-05-16 16:03:53 [PROD] [INFO]
2016-05-16 16:03:53 [PROD] [INFO] > playground@1.0.0 start /home/leanengine/app
2016-05-16 16:03:53 [PROD] [INFO] > node server.js
2016-05-16 16:03:53 [PROD] [INFO]
2016-05-16 16:03:54 [PROD] [INFO] Node app is running, port: 3000
2016-05-16 16:03:54 [PROD] [INFO] connected to redis server
2016-05-16 16:03:54 [PROD] [INFO] 实例启动成功：{"runtime":"nodejs-v4.4.3","version":"0.4.0"}
2016-05-16 16:03:54 [PROD] [INFO] 正在统一切换新旧实例 ...
2016-05-16 16:03:55 [PROD] [INFO] 正在更新云函数信息 ...
2016-05-16 16:03:55 [PROD] [INFO] 部署完成：2 个实例部署成功
```

默认返回最新的 30 条，最新的在最下面。

可以通过 `-l` 选项设定返回的日志数目，例如返回最近的 100 条：

```sh
$ lean logs -l 100
```

也可以加上 `-f` 选项来自动滚动更新日志，类似 `tail -f` 命令的效果：

```sh
$ lean logs -f
```

新的云引擎日志产生后，都会被自动填充到屏幕下方。

如果想查询某一段时间的日志，可以指定 `--from` 和 `--to` 参数：

```
$ lean logs --from=2017-07-01 --to=2017-07-07
```

另外可以配合重定向功能，将一段时间内的 JSON 格式日志导出到文件，再配合本地工具进行查看：

```
$ lean logs --from=2017-07-01 --to=2017-07-07 --format=json > leanengine.logs
```

## 查看 LeanStorage 状态报告

使用 `metrics` 命令可以查看 LeanStorage 的状态报告：

```sh
$ lean metrics --from 2017-09-07
[INFO] 正在获取 xxxx 储存报告
Date                 2017-09-07   2017-09-08   2017-09-09
API Requests         49           35           14
Max Concurrent       2            2            2
Mean Concurrent      1            1            1
Exceed Time          0            0            0
Max QPS              5            5            5
Mean Duration Time   9ms          21ms         7ms
80% Duration Time    15ms         22ms         9ms
95% Duration Time    26ms         110ms        25ms
```

相关状态的描述如下：

<table>
	<tr><th width="35%">状态</th><th>描述</th></tr>
	<tr><td>`Date`</td><td>日期</td></tr>
	<tr><td>`API Requests`</td><td>API 请求次数</td></tr>
	<tr><td>`Max Concurrent`</td><td>最大工作线程数</td></tr>
	<tr><td>`Mean Concurrent`</td><td>平均工作线程数</td></tr>
	<tr><td>`Exceed Time`</td><td>超限请求数</td></tr>
	<tr><td>`Max QPS`</td><td>最大 QPS</td></tr>
	<tr><td>`Mean Duration Time`</td><td>平均响应时间</td></tr>
	<tr><td>`80% Duration Time`</td><td>80% 响应时间</td></tr>
	<tr><td>`95% Duration Time`</td><td>95% 响应时间</td></tr>
</table>

`metrics` 接收参数与 `logs` 类似，具体介绍如下：

```sh
$ lean metric -h
NAME:
   lean metric - Obtain LeanStorage performance metrics of current project

USAGE:
   lean metric [command options] [--from fromTime --to toTime --format default|json]

OPTIONS:
   --from value    Start date, formatted as YYYY-MM-DD，e.g., 1926-08-17
   --to value      End date formated as YYYY-MM-DD，e.g., 1926-08-17
   --format value  Output format，'default' or 'json'
```

## 多应用管理

一个项目的代码可以同时部署到多个 LeanCloud 应用上。

### 查看当前应用状态

使用 `lean info` 可以查看当前项目关联的应用：

```sh
$ lean info
[INFO] Retrieving user info from region: cn
[INFO] Retrieving app info ...
[INFO] Current region:  cn User: lan (lan@leancloud.rocks)
[INFO] Current region: cn App: AwesomeApp (xxxxxx)
[INFO] Current group: web
```

此时，执行 `deploy`、`publish`、`logs` 等命令都是针对当前被激活的应用。

### 切换应用

如果需要将当前项目切换到其他 LeanCloud 应用，可以通过 `checkout` 命令来添加一个应用：

```sh
$ lean switch
```

之后运行向导会给出可供切换的应用列表。

另外还可以直接执行 `$ lean checkout 其他应用的id` 来快速切换关联应用。


## 上传文件

使用 `upload` 命令既可以上传单个文件，也可以批量上传一个目录下（包括子目录）下的所有文件到 LeanCloud 云端。

```sh
$ lean upload public/index.html
Uploads /Users/dennis/programming/avos/new_app/public/index.html successfully at: http://ac-7104en0u.qiniudn.com/f9e13e69-10a2-1742-5e5a-8e71de75b9fc.html
```

文件上传成功后会自动生成在 LeanCloud 云端的 URL，即上例中 `successfully at:` 之后的信息。

上传 images 目录下的所有文件：

```sh
$ lean upload images/
```

## CQL 交互查询

可以通过 `$ lean cql` 命令来使用 [CQL](cql_guide.html) 语言查询存储服务数据：

```
$ lean cql
CQL > select objectId, mime_type, createdAt, updatedAt from _File where mime_type != null limit 10;
objectId                   mime_type                                   createdAt                  updatedAt
5583bc44e4b0ef6154cb1b9e   application/zip, application/octet-stream   2015-06-19T06:52:52.106Z   2015-06-19T06:52:52.106Z
559a63bee4b0c4d3e72432f6   application/zip, application/octet-stream   2015-07-06T11:17:18.885Z   2015-07-06T11:17:18.885Z
55cc4d3b60b28da5fc3af7c5   image/jpeg                                  2015-08-13T07:54:35.119Z   2015-08-13T07:54:35.119Z
55cc4d7660b2d1408c770cde   image/jpeg                                  2015-08-13T07:55:34.496Z   2015-08-13T07:55:34.496Z
55cc4df460b2c0a2834d63e2   image/jpeg                                  2015-08-13T07:57:40.013Z   2015-08-13T07:57:40.013Z
55cc4eb660b2597462bc093e   image/jpeg                                  2015-08-13T08:00:54.983Z   2015-08-13T08:00:54.983Z
55cc4ece60b2597462bc0e06   image/jpeg                                  2015-08-13T08:01:18.323Z   2015-08-13T08:01:18.323Z
563b2fc360b216575c579204   application/zip, application/octet-stream   2015-11-05T10:30:27.721Z   2015-11-05T10:30:27.721Z
564ae21400b0ee7f5ca4e11a   application/zip, application/octet-stream   2015-11-17T08:15:16.951Z   2015-11-17T08:15:16.951Z
564da57360b2ed36207ad273   text/plain                                  2015-11-19T10:33:23.854Z   2015-11-19T10:33:23.854Z
```

如果需要查询的 Class 有大量 Object / Array 等嵌套的数据结构，但以上的表格形式不便于查看结果，可以尝试用 `$ lean cql --format=json` 将结果以 JSON 格式来展示：

```
$ lean cql --format=json
CQL > select objectId, mime_type from _File where mime_type != null limit 3;
[
  {
    "createdAt": "2015-06-19T06:52:52.106Z",
    "mime_type": "application/zip, application/octet-stream",
    "objectId": "5583bc44e4b0ef6154cb1b9e",
    "updatedAt": "2015-06-19T06:52:52.106Z"
  },
  {
    "createdAt": "2015-07-06T11:17:18.885Z",
    "mime_type": "application/zip, application/octet-stream",
    "objectId": "559a63bee4b0c4d3e72432f6",
    "updatedAt": "2015-07-06T11:17:18.885Z"
  },
  {
    "createdAt": "2015-08-13T07:54:35.119Z",
    "mime_type": "image/jpeg",
    "objectId": "55cc4d3b60b28da5fc3af7c5",
    "updatedAt": "2015-08-13T07:54:35.119Z"
  }
]
```

## LeanCache 管理

LeanCache 用户可以使用命令行工具来连接线上的 LeanCache 实例，对数据进行增删改查。

{{ leanengine.leancacheWithCli() }}

## 其他命令

使用 `search` 命令可以方便地查询文档和资料：

```sh
$ lean search AVObject
```

这将打开浏览器，显示 [搜索结果](/search.html?q=AVObject)。

也可以查询多个关键字，空格隔开即可：

```sh
$ lean search 云引擎 命令行
```

### 自定义命令

有时我们需要对某个应用进行特定并且频繁的操作，比如查看应用 `_User` 表的记录总数，这样可以使用命令行工具的自定义命令来实现。

只要在当前系统的 `PATH` 环境变量下，或者在项目目录 `.leancloud/bin` 下存在一个以 `lean-` 开头的可执行文件，比如 `lean-usercount`，那么执行 `$ lean usercount`，命令行工具就会自动调用这个可执行文件。与直接执行 `$ lean-usercount` 不同的是，这个命令可以获取与应用相关的环境变量，方便访问对应的数据。

相关的环境变量有：

环境变量名 | 描述
---|---
`LEANCLOUD_APP_ID`| 当前应用的 app id
`LEANCLOUD_APP_KEY` | 当前应用的 app key
`LEANCLOUD_APP_MASTER_KEY` | 当前应用的 master key
`LEANCLOUD_APP_HOOK_KEY` | 当前应用的 hook key
`LEANCLOUD_APP_PORT` | 使用 `$ lean up` 启动应用时，默认的端口
`LEANCLOUD_API_SERVER` | 当前应用对应 API 服务的 host
`LEANCLOUD_REGION` | 当前应用对应区域信息，可能的值有 `cn`、`us`、`tab`

例如将如下脚本放到当前系统的 `PATH` 环境变量中（比如 `/usr/local/bin`）：

```python
#! /bin/env python

import sys

import leancloud

app_id = os.environ['LEANCLOUD_APP_ID']
master_key = os.environ['LEANCLOUD_APP_MASTER_KEY']

leancloud.init(app_id, master_key=master_key)
print(leancloud.User.query.count())
```

同时赋予这个脚本可执行权限 `$ chmod +x /usr/local/bin/lean-usercount`，然后执行 `$ lean usercount`，就可以看到当前应用对应的 `_User` 表中记录总数了。

## 贡献

`lean-cli` 是开源项目，基于 [Apache](https://github.com/leancloud/lean-cli/blob/master/LICENSE.txt) 协议，源码托管在  <https://github.com/leancloud/lean-cli>，欢迎大家贡献。
