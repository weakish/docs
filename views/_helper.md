{% import "views/_helper.njk" as docs %}
# _helper 宏方法的用法

`_helper.njk` 包含了格式化文档的常用方法。要使用这些方法，需要在文件的最开始加入：

<pre><code class="lang-nunjucks">&lbrace;% import "views/_helper.njk" as docs %&rbrace;{% raw %}{% set a = 3 %}{% endraw %}
</code></pre>

注意将其 namespace 设置为 **`docs`**，与其他宏文件如 `_storage.njk`、`_sms.njk` 区别开来。

## mustache

```
{% raw %}{{ docs.mustache('todos','','',true) }}
{{ docs.mustache('todos','div',{},true) }}
{{ docs.mustache('todos') }}
{{ docs.htmlTag("samp", {"ng-non-bindable": null,class: "bubble"}) }}{% endraw %}
```

结果：

```
{{ docs.mustache('todos','','',true) }}
{{ docs.mustache('todos','div','',true) }}
{{ docs.mustache('todos') }}
{{ docs.mustache('todos') }}
{{ docs.htmlTag("samp", {"ng-non-bindable": null,class: "bubble"}) }}
```


## `note()`

```nunjucks
{% raw %}{{ docs.note("callout-info 类型的提示。") }}{% endraw %}

{% raw %}{{ docs.note("第一段文字。
第二段文字，或使用 `noteWrap()`") }}{% endraw %}
```
效果：

{{ docs.note("callout-info 类型的提示。") }}

{{ docs.note("第一段文字。
第二段文字，或使用 `noteWrap()`") }}

### `noteWrap()`

<pre><code class="lang-nunjucks">&lbrace;% call docs.noteWrap() -%&rbrace;
`noteWrap()` 适合有分段、比较长的内容。 变量测试 {{ docs.mustache("time") }}

这是第二段。HTML Entity 测试（&amp;middot; &amp;quot;）
&lbrace;%- endcall %&rbrace;
</code></pre>

{% call docs.noteWrap() -%}
`noteWrap()` 适合有分段、比较长的内容。 变量测试 {{ docs.mustache("time") }}

这是第二段。HTML Entity 测试（&middot; &quot;）
{%- endcall %}

## `alert()`

```nunjucks
{% raw %}{{ docs.alert("callout-danger 类型的提示。用于突出强调或警告。") }}{% endraw %}

{% raw %}{{ docs.warning("callout-warning 类型的提示。用于引起注意。") }}{% endraw %}
```
效果：

{{ docs.alert("callout-danger 类型的提示。用于突出强调或警告。") }}

{{ docs.warning("callout-warning 类型的提示。用于引起注意。") }}

### `alerts()`


## `paragraph()`

将输入内容中的换行替换为 html 的 `<p></p>`，内部方法，被 `alert()` 和 `info()` 调用。

```nunjucks
{% raw %}{{ docs.paragraph("第一行。
第二行。") }}{% endraw %}
{% raw %}{{ docs.paragraph("只有一行的文本。") }}{% endraw %}

<!-- 结果 -->
<p>第一行。</p><p>第二行。</p>
<p>只有一行的文本。</p>
```
## 正则 RegEx

```js
// 找出 appid、appkey、masterkey 和 host 之外使用了 mustache 语法的变量
// 不包含名称中有 . 或 _ 的变量，如 docs., app_url
\{\{\s*(?!([a-z]+\.|[a-z]+_|appid|appkey|masterkey|host))[^\}\s]+\s*?\}\}

```
