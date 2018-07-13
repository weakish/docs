{% set productName = '云引擎' %}
{% set platformName = '.NET' %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = '.NET' %}
{% set leanengine_middleware = '[LeanEngine dotNET SDK](https://github.com/leancloud/leanengine-dotNET-sdk/)' %}

# 网站托管开发指南 &middot; {{platformName}}

## 示例网站

- [aspnetcore-getting-started](https://github.com/leancloud/aspnetcore-getting-started) 是一个比较精简的 ASP.NET MVC Core 网站项目。 

## 网站项目的基本要素

## 组件选择

### 结构化数据存储

因为 LeanCloud 已经提供了存储服务，因此我们在云引擎当中不支持直接在内部启动 MySQL 或者是 SQLServer 的实例，但是并不排斥开发者依赖外部的 MySQL 或者 SQLServer 等服务（例如阿里云/腾讯云/UCloud 都具备提供该类云服务的能力），不过 LeanCloud 提供的存储服务也有很大的使用便利性和易用性，详细请查看[数据存储开发指南](dotnet_guide.html)

### 文件存储
我们不推荐直接在网站的服务端物理目录下写入文件，因为云引擎是一个无状态化的动态容器服务，容器内的物理文件（除去代码），剩下的都不应该是永久被保存的，随着容器的迁移和实例的动态扩容，很有可能物理文件会被丢失，因此我们十分推荐使用 LeanCloud 自带的数据存储服务里面的文件服务[数据存储开发指南 - 文件](dotnet_guide.html)，假设有一个需求是要求用户上传自己的头像，你可以直接将文件保存到 LeanCloud 提供的文件 CDN 服务中，而在数据库中只保留一个 Url 即可。

### Redis 
在追求高效访问和快速存取的服务端项目里面，云引擎也内置了 Redis 的服务，详细可以查看文档:[LeanCache](leancache_guide.html)。

### 负载均衡
云引擎已经实现了针对各个实例的负载均衡，开发者无需额外的实现，唯一需要做的就是针对当前访问量做出自己多实例的预警配额，比如实例的配置尽量开高一点，然后建立多个实例来应对访问量的增加。

### 代码上传和部署

写完了一个网站项目的代码，接下来要做的就是讲代码部署到云引擎，发布到公网上，让用户可以访问。

#### 命令行部署

在你的项目根目录运行：

```sh
lean deploy
```

使用命令行工具可以非常方便地部署、发布应用，查看应用状态，查看日志，甚至支持多应用部署。具体使用请参考 [命令行工具指南](leanengine_cli.html)。

### Git 部署

除此之外，还可以使用 git 仓库部署。你需要将项目提交到一个 git 仓库，我们并不提供源码的版本管理功能，而是借助于 git 这个优秀的分布式版本管理工具。我们推荐你使用 [GitHub](https://github.com/)、[Coding](https://coding.net/) 或者 [OSChina](http://git.oschina.net/) 这样第三方的源码托管网站，也可以使用你自己搭建的 git 仓库（比如 [Gitlab](http://gitlab.org/)）。

你需要先在这些平台上创建一个项目（如果已有代码，请不需要选择「Initialize this repository with a README」），在网站的个人设置中填写本地机器的 SSH 公钥（以 GitHub 为例，在 Settings => SSH and GPG keys 中点击 New SSH key），然后在项目目录执行：

```sh
git remote add origin git@github.com:<username>/<repoName>.git
git push -u origin master
```

然后到云引擎的设置界面填写你的 Git 仓库地址，如果是公开仓库建议填写 https 地址，例如 `https://github.com/<username>/<repoName>.git`。

如果是私有仓库需要填写 ssh 地址 `git@github.com:<username>/<repoName>.git`，还需要你将云引擎分配给你的公钥填写到第三方托管平台的 Deploy keys 中，以 GitHub 为例，在项目的 Settings => Deploy keys 中点击 Add deploy key。

设置好之后，今后需要部署代码时就可以在云引擎的部署界面直接点击「部署」了，默认会部署 master 分支的代码，你也可以在部署时填写分支、标签或具体的 Commit。

### 预备环境和生产环境
默认情况，云引擎只有一个「生产环境」，对应的域名是 `{{var_app_domain}}.leanapp.cn`。在生产环境中有一个「体验实例」来运行应用。

当生产环境的体验实例升级到「标准实例」后会有一个额外的「预备环境」，对应域名 `stg-{{var_app_domain}}.leanapp.cn`，两个环境所访问的都是同样的数据，你可以用预备环境测试你的云引擎代码，每次修改先部署到预备环境，测试通过后再发布到生产环境；如果你希望有一个独立数据源的测试环境，建议单独创建一个应用。

<div class="callout callout-info">如果访问云引擎遇到「Application not Found」的错误，通常是因为对应的环境还没有部署代码。例如应用可能没有预备环境，或应用尚未发布代码到生产环境。</div>

### 设置域名

你可以在 [云引擎 > 设置](/cloud.html?appid={{appid}}#/conf) 的「Web 主机域名」部分，填写一个自定义的二级域名，例如你设置了 `myapp`，那么你就可以通过我们的二级域名来访问你的网站了：

- `http://myapp.leanapp.cn`（中国区）
- `http://myapp.avosapps.us`（美国区）

<div class="callout callout-info">DNS 可能需要等待几个小时后才能生效。</div>

如果你的应用在 30 天内无访问且没有购买标准实例，二级域名有可能会被回收。


## 网站的备案和自定义域名绑定

如果需要绑定自己的域名，进入 [应用控制台 > 账号设置 > 域名绑定](/settings.html#/setting/domainbind)，按照步骤填写资料即可。

国内节点绑定独立域名需要有 ICP 备案，美国节点不需要。

只有主域名需要备案，二级子域名不需要备案；如果没有 ICP 备案，请进入 [应用控制台 > 账号设置 > 域名备案](/settings.html#/setting/domainrecord)，按照步骤填写资料进行备案。

<div class="callout callout-info">备案之前要求云引擎已经部署，并且网站内容和备案申请的内容一致。仅使用云引擎托管静态文件、未使用其他 LeanCloud 服务的企业用户，需要自行完成域名备案工作。</div>

## 出入口 IP 地址

如果开发者希望在第三方服务平台（如微信开放平台）上配置 IP 白名单而需要获取云引擎的入口或出口 IP 地址，请进入 [控制台 > 云引擎 > 设置 > 出入口 IP](/dashboard/cloud.html?appid={{appid}}#/conf) 来自助查询。

我们会尽可能减少出入口 IP 的变化频率，但 IP 突然变换的可能性仍然存在。因此在遇到与出入口 IP 相关的问题，我们建议先进入控制台来核实一下 IP 列表是否有变化。

## F&Q

