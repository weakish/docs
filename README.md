# LeanCloud Documentation
[![Build Status](https://travis-ci.org/leancloud/docs.svg)](https://travis-ci.org/leancloud/docs)
[![devDependency Status](https://david-dm.org/leancloud/docs/dev-status.svg)](https://david-dm.org/leancloud/docs#info=devDependencies)

LeanCloud 开发者文档

## 技术咨询

与开发相关的技术问题，请直接到 [LeanCloud 论坛](https://forum.leancloud.cn) 中提问。使用 LeanCloud 商用版的用户，请 [提交工单](https://leanticket.cn)。若文档内容有误，可以直接在文档页面上留言或提交 Github Issue。

## 说明

这个项目是 [LeanCloud 文档](http://leancloud.cn/docs/) 上的所有文档的 Markdown 格式的源码，通过转换最终被渲染成 HTML 文档。因此 Markdown 文件里部分链接写的是最终渲染后的链接，如果直接点击会出现 404 错误。

## 贡献

我们欢迎所有用户提交 PR 或 issue 为我们贡献或者修正错误，LeanCloud 衷心感谢您的贡献。

**贡献方法及注意事项**：

- `fork` 这个项目
- `npm ci` 安装相关依赖
- 执行 `npm run preview` 可以本地预览
- 修改 `/views` 目录中的文档
  - `/views` 中是模板文件，会被编译为 `/md` 目录中对应的文档文件。
  - 模板支持嵌套，如 `/views` 中 `a.md` 是可以被嵌套在 `a.tmpl` 中，方法参见下文 [一套模板多份渲染]（#一套模板多份渲染）。
  - 相关图片放在 `/images` 目录中，引用格式为 `![图片文字说明](images/livekit-gifts.png)`。
  - 由于文档会经过 Nunjucks 和 AngularJS 渲染，当文档中需要显示 `{{content}}` 这种格式时，需要：
    - 在文档开头增加 `{% set content = '{{content}}'  %}`，如果没有声明 Nunjucks 会将其渲染为空白。
    - 在正文中加上 `<span ng-non-bindable>{{content}}</span>`，避免被 AngularJS 渲染。
- 新增一个文档
  - 命名使用中划线和小写字母，如 `livekit-android.md`、`quick-start-ios.md`。
  - 如需要，更新文档首页 `templates/pages/index.html` 和顶部导航菜单 `templates/include/header.html`。
- 修改文中标题或文件名称
  - 确认要修改的标题 h1-h6 或文件名称有没有被 `/views` 和 `/templates` 目录下任何文件所引用，以免产生断链。
  - 系统自动生成的 h1-h6 标题的 id，将所有空格、中西文标点替换为由数字和减号组成的 hash 值。在编写 Markdown 需要引用这些标题时，要将原文中的连续空白替换成一个减号即可，例如引用标题 `## 使用 SSO 登录` 时，应写为 `请参考 [SSO 登录](#使用-SSO-登录)`，以数字开头的标题要先在前面加个下划线，比如标题 `### 601` 引用写为 `[错误码 601](#_601)`。
- 提交修改并发起 `Pull Request`，可以参考 [Git Commit 日志风格指南](https://open.leancloud.cn/git-commit-message/)。

## 目录结构

```
├── README.md                          // 说明文档
├── custom                             // 文档页面样式及 JavaScript 代码
├── images                             // 文档中引用的所有图片
├── md                                 // 临时目录（文档均为自动生成，因为不要修改）
├── dist                               // 编译之后生成的文件将会在此目录下
├── private                            // 未完成、未发布的文档临时保存在这里，以便让重建全站文档索引的系统任务忽略这些文件
├── react                              // 文档评论功能所需要用的 React 组件
├── server_public                      // 文档评论功能所需要用的 React 组件
├── templates                          // 文档网站的 HTML 页面模板
├── views                              // Markdown 格式文档的模板文件和源文件，使用时会被编译到 md 目录中
├── app.coffee
├── app.json
├── CHANGELOG.md                       // changelog 记录
├── circle.yml
├── CONTRIBUTING.md                    // 贡献指南
├── package.json
└── ...
```

## 预览

开发服务基于 Grunt，所以需要有 Nodejs 环境，通过 NPM 安装测试需要的依赖

安装 Grunt

```bash
$ sudo npm install -g grunt-cli
```

安装需要的依赖

```bash
$ npm ci
```

本地启动一个 HTTP Server，然后打开浏览器访问 <http://localhost:3000> 即可

```bash
$ npm run preview
```

注意保持网络畅通（如有必要请使用代理），因为部分 Native 依赖在网络不畅的情况下无法获取预编译文件，会触发本地编译，耗时较长，也有较大几率会编译失败。

## 特殊语法

- [时序图](https://github.com/leancloud/docs/issues/2710)

## Nunjucks 模板

Nunjucks 模板语法类似 Jinja，详见[官方文档](https://mozilla.github.io/nunjucks/templating.html)。

## 多语言多平台共享文案解决方案 1 - 使用预编译宏

单个产品线包含的单个子模块的文档只拥有一份文字描述文档，而多平台/多语言/多运行通过内置的拓展语法/前端展现来实现切换。

即时通讯开发指南就采用了这种方案。
比如即时通讯开发指南第一篇对应文档 `realtime-guide-beginner.md`，在它内部通过 Web 前端技术的来做不同语言的示例代码切换。

切换按钮如下图：

![image](https://user-images.githubusercontent.com/5119542/45036931-5903ca80-b090-11e8-8828-a44ddfee2777.png)

### 导入预编译宏

```
{% import "views/_helper.njk" as docs %}
```

### 不同语言中定义的功能一致但是名称不一致的类名

例如存储对象 `AVObject`:

iOS|Android|js|php|python|c#
--|--|--|--|--|--
AVObject|AVObject|AV.Object|LCObject|LeanCloud.Object|AVObject

在文档中使用如下方式，前端会自动根据当前用户选择实例代码来渲染类名:

1. 首先在 `views/_helper.njk` 里面添加如下字典：
   ```
    {% macro useStorageLangSpec() %}
      {{ useLangSpec('AVObject',[
        { lang: "js", value: "AV.Object" },
        { lang: "objc", value: "AVObject" },
        { lang: "java", value: "AVObject"},
        { lang: "cs", value: "AVObject"},
        { lang: "php", value: "LCObject"},
        { lang: "python", value: "LeanCloud.Object"}
      ])}}
    {% endmacro %}
   ```
2. 然后在文档开头指定默认的语言：`{{ docs.defaultLang('js') }}`，这样就是告知文档引擎当前文档需要开启自动切换类名的开关。

这意味着你在全文任何地方只要单独编写了如下 \`AVObject\`这样的独立字段都会根据语言切换，**实例代码的变量名和类名不会受到影响**。

### 不同语言存在小部分文字描述不一致

例如有一部分配置文件是某一个平台独有，而其他平台没有的，这部分可以用如下方式来编写:

```
{{ docs.langSpecStart('js') }} 

这里的内容只有在用户选择 js 示例代码的时候才会显示

{{ docs.langSpecEnd('js') }} 
```

### 为文档设置默认的语言

在 `{% import "views/_helper.njk" as docs %}` 之后可以引入如下内容：

```
{{ docs.defaultLang('js') }}
```

这样设置表示当前文档的默认首选语言是 js。

## 多语言多平台共享文案解决方案 2 - 内容集中到一份 tmpl 文件，每个语言 md 文件仅作骨架

这种方案下，所有的内容都在 `topic.tmpl` 下，不同语言主要依靠模板的 `if else` 结构支持：

```nunjucks
{% if platform_name === "JavaScript" %}
// Code here
{% endif %}
{% if platform_name === "Swift" %}
// Code here
{% endif %}
```

`topic-lang.md` 只有两行，一行是继承 `topic.tmpl`，一行是指定当前 `lang` （赋值 `platform_name` 变量），除此以外没有其他新增内容。

```nunjucks
{% extends "./leanstorage_guide.tmpl" %}
{% set platform_name = "JavaScript" %}
```

新文档可以根据需求酌情选用方案 1、方案 2。

### 多语言多平台共享文案解决方案 3 - 一套模板多份渲染

目前还有部分旧文档采用这种方式编写。

这个和上面一种方案类似，只不过不同语言特有内容并不通过 `if else` 结构包含在 `topic.tmpl` 内，而是采用如下方式「占位」：

```nunjucks
{% block <blockName> %}{% endblock %}
```

然后在 `topic-lang.md` 中写入具体内容：

```nunjucks
{% block <blockName> %}具体内容{% endblock%}
```

使用这种方案的情况下，可以通过 `node server` 命令运行一个简单的辅助工具，帮助编写文档。
使用步骤如下：

1. 使用浏览器打开 http://localhost:3001，将会看到一个「选择模板」的下拉列表框，该列表框里会显示 `views/<tmplName>.tmpl` 的所有模板文件，文件名的 `tmplName` 部分是下拉列表框选项的名称。选择你需要编写的模板（比如 `leanengine_guide`）。	
2. 你会看到模板文件被读取，其中所有 `{% block <blockName> %}<content>{% endblock %}` 部分的下面都会有一些按钮。这些按钮表示该「模板」拥有的不同「渲染」，也就是对应的 `views/<tmplName>-<impl>.md` 文件，文件名的 `impl` 部分是按钮的名称。	
3. 点击对应的按钮，即可看到「渲染」文件中对应 `block` 的内容已经读取到一个文本域中，如果为空，表明该「渲染」文件未渲染该 block，或者内容为空。	
4. 在文本域中写入需要的内容，然后点击保存，编写的内容就会保存到对应的「渲染」文件的 block 中。	
5. 最后建议打开「渲染」文件确认下内容，没问题即可通过 `grunt serve` 查看效果。当然整个过程打开 `grunt serve` 也是没问题的，它会发现「渲染」文件变动后重新加载。有问题请与 <wchen@leancloud.rocks> 联系。

## 文档上线

请保证 master 分支处于随时可发布状态。
如果相应功能或修复尚未上线，可以使用 draft pr，或者在 pr 标题注明「DO NOT MERGE」之类的字样。
PR 合并后，要让改动最终生效还需要通过 Jenkins 执行 `cn-avoscloud-docs-prod-ucloud` 任务进行发布。

## License

LGPL-3.0
