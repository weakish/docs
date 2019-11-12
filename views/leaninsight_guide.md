{% import "views/_helper.njk" as docs %}
{% set backtick = "注意：别名或以下划线开头的表名都需要放在反引号内，如 <code>as &#96;total&#96;</code>、<code>&#96;_User&#96;.name</code>。" %}
# 离线数据分析指南

针对大规模数据的分析任务一般都比较耗时。LeanCloud 为开发者提供了部分兼容 SQL 语法的离线数据分析功能。所谓「离线分析」，是指运行分析程序的机器和服务 API 请求的机器是分开的，这样可以尽量减少线上集群的压力，也就是说，使用离线分析并不会影响或牺牲线上正式数据的访问性能。

{% if node == 'qcloud' and node == 'us' %}离线分析的数据来源就是线上实时数据。{% else %}离线分析的数据来源，对于普通表来说就是线上实时数据，而对于 [日志表](https://leancloudblog.com/shu-ju-cun-chu-zhi-chi-xin-lei-xing-zhuan-wei-ri-zhi-xing-cun-chu-xu-qiu-you-hua/) 则是**前一天的数据备份（并非最新的在线数据）**，这一点需要大家注意。
{% endif %}
另外，离线分析仅支持 `SELECT` 语句，不支持 `UPDATE`、`INSERT`、`DELETE` 等语句，所以它不会更新或修改数据源，开发者可以放心使用。

{% call docs.noteWrap() -%}
离线数据分析功能（ {% if node=='qcloud' %}**控制台** > **存储** > **离线数据分析**{% else %}[控制台 > 存储 > 离线数据分析](/dashboard/dataquery.html?appid={{appid}}#/){% endif %}）**仅向商用版和企业版应用开放**，开发版应用无法使用；如果商用版和企业版应用无法正常使用该功能，请通过 [工单系统](https://leanticket.cn/t/leancloud) 或 [用户论坛](https://forum.leancloud.cn) 联系我们。
{%- endcall %}

## 限制

- `_Conversation` 表的 **m** 和 **mu** 字段往往包含大量数组元素，容易引起计算节点故障，因此我们限制了对这些字段的查询。
- `_User` 表的 **sessionToken**、**password**、**salt** 字段，以及所有表的 **ACL** 字段，因为安全原因被限制查询。
- 不支持对 **Relation 类型**字段的查询。<br/>由于内部机制，离线分析无法访问 AVRelation 所使用的内部关联表，所以就无法从该字段所在的表中获取相关联的数据。开发者可考虑使用自定义的 [关联表](storage_overview.html#数据关联) 并配合 [join](#多表_Join) 语句来解决这个问题。
- 由于资源管理上的限制，每次导出的数据条数不能超过 **100,000**（十万条）。<br/>要导出更多的结果，可以分多次查询并多次导出。如果导出全表的数据，请在该应用的 [设置 > 数据导出](/dashboard/app.html?appid={{appid}}#/export) 中操作。
- 离线分析结果导入到另一张表的条目不能超过 200 条。
- 离线分析在同一时间最多支持 3 个不同的 job。

## 查询语法

LeanCloud 的离线数据分析服务基于 Spark SQL，目前支持 HiveQL 的功能子集，常用的 HiveQL 功能都能正常使用，例如：

* `SELECT`
* `GROUP BY`
* `ORDER BY`
* `CLUSTER BY`
* `SORT BY`

### `GROUP BY`

有不少用户都有过 MySQL 的使用经验，这里主要是列举几种在 MySQL 中可用而在我们的服务（基于 Spark SQL）中<u>却会报错的</u> `GROUP BY` 的用法。

```
SELECT * FROM table GROUP BY columnA;
```

* MySQL：如果 columnA 这个字段有 10 种不同的值，那么这条查询语句得到的结果应该包含 10 行记录。
* **离线分析**：如果 table 只有 columnA 这个字段，那么查询结果和 MySQL 相同。相反，如果 table 包含不止 columnA 这个字段，查询会报错。


```
SELECT columnB FROM table GROUP BY columnA;
```

* MySQL：同前一条查询差不多，返回正确结果。结果记录数由 columnA 值的种类决定。
* **离线分析**：一定会报错。

当且仅当 SELECT 后面的表达式（expressions）为聚合函数（aggregation function）或包含 `GROUP BY` 中的字段，离线分析的查询才会合法。列举几个常见的合法查询：

```
SELECT columnA, count(columnB) as `count` FROM table GROUP BY columnA
SELECT columnA, count(*) as `count` FROM table GROUP BY columnA
SELECT columnA, columnB FROM table GROUP BY columnA, columnB
```

{{ backtick | safe }}

### 运算符

* 关系运算符（`= != <>  > < >= <=`  ...）
* 算术运算符（`+ - * / %`  ...）
* 逻辑运算符（`AND && OR || NOT`  ...）

### 常用函数

#### 字符串类

| 函数       | 描述                     |
| :------- | :--------------------- |
| `instr`  | 返回一个字符串在另一个字符串中首次出现的位置 |
| `length` | 字符串长度                  |
| `printf` | 格式化输出                  |
| ...      | ...                    |

#### 计算类

| 函数         | 描述        |
| :--------- | :-------- |
| `abs`      | 绝对值       |
| `acos`     | 反余弦       |
| `asin`     | 反正弦       |
| `bin`      | 二进制       |
| `ceil`     | 向上取整      |
| `ceiling`  | 向上取整      |
| `conv`     | 进制转换      |
| `cos`      | 余弦        |
| `exp`      | 自然指数      |
| `floor`    | 向下取整      |
| `hex`      | 十六进制      |
| `ln`       | 自然对数      |
| `log`      | 对数        |
| `log10`    | 以 10 为底对数 |
| `log2`     | 以 2 为底对数  |
| `negative` | negative  |
| `pmod`     | 正取余       |
| `positive` | positive  |
| `pow`      | 幂运算       |
| `power`    | 幂运算       |
| `rand`     | 取随机数      |
| `round`    | 取整        |
| `sin`      | 正弦        |
| `sqrt`     | 开平方       |
| `unhex`    | 反转十六进制    |
| ...        | ...       |

#### 日期类

| 函数               | 描述               |
| :--------------- | :--------------- |
| `date_add`       | 日期增加             |
| `date_sub`       | 日期减少             |
| `datediff`       | 日期比较             |
| `day`            | 日期转天             |
| `from_unixtime`  | UNIX 时间戳转日期      |
| `hour`           | 日期转小时            |
| `minute`         | 日期转分钟            |
| `month`          | 日期转月             |
| `second`         | 日期转秒             |
| `to_date`        | 日期时间转日期          |
| `unix_timestamp` | 获取当前 UNIX 时间戳    |
| `unix_timestamp` | 日期转 UNIX 时间戳     |
| `unix_timestamp` | 指定格式日期转 UNIX 时间戳 |
| `weekofyear`     | 日期转周             |
| `year`           | 日期转年             |
| ...              | ...              |

更详尽的 Hive 运算符和内置函数，可以参考 [Hive Language Manual - Built-in Operators](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF#LanguageManualUDF-Built-inOperators)。

### 多表 Join

```
JOIN
{LEFT|RIGHT|FULL} OUTER JOIN
LEFT SEMI JOIN
CROSS JOIN
```

### 子查询

```
SELECT col FROM ( SELECT a + b AS col from t1) t2
```

### 数据类型

* `TINYINT`
* `SMALLINT`
* `INT`
* `BIGINT`
* `BOOLEAN`
* `FLOAT`
* `DOUBLE`
* `STRING`
* `BINARY`
* `TIMESTAMP`
* `ARRAY<>`
* `MAP<>`
* `STRUCT<>`

详细信息请参考 [Spark SQL Supported Hive Features](http://spark.apache.org/docs/latest/sql-programming-guide.html#supported-hive-features)。

不支持的 Hive 功能，请参考 [Spark SQL Unsupported Hive Functionality](http://spark.apache.org/docs/latest/sql-programming-guide.html#unsupported-hive-functionality)。

### 数据分析举例

{{ docs.note(backtick) }}

简单的 SELECT 查询：

```sql
select * from Post

select count(*) from `_User`
```

复杂的 SELECT 查询：

```sql
select * from Post where createdAt > '2014-12-10'

select avg(age) from `_User`

select Post.objectId from Post left join `_User` where `_User`.name=Post.pubUser limit 10

select * from `_User` where name in (select name form OtherUser)

select sum(upvotes) from Post

select count(*) as `count`, pubUser from Post group by pubUser
```

更多例子可以参考我们的博客文章[《LeanCloud 离线数据分析功能介绍》](https://leancloudblog.com/leancloud-chi-xian-shu-ju-fen-xi-gong-neng-jie-shao/)。

## 云引擎和 JavaScript SDK 调用

JavaScript SDK 0.5.5 版本开始支持离线数据分析。**请注意，离线数据分析要求使用 Master Key，否则下面所述内容都没有权限运行，请参考 [《权限说明》](leanengine_cloudfunction_guide-node.html#Master_Key_和超级权限)。**

### Job 启动

```js
  AV.Insight.startJob({
        sql: "select * from `_User`",
        saveAs: {
          className: 'InsightResult',
          limit:1
        }
   }).then(function(id) {
      //返回 job id
   }).catch(function(err){
      //发生错误
   });
```

`AV.Insight.startJob` 启动一个离线分析任务，它可以指定：

* **sql**：本次任务的查询的 SQL。
* **saveAs**：（可选）本次任务查询结果保存的参数，比如要保存的表名和数量，limit 最大为 1000。

任务如果能正常启动，将返回任务的 job id，后续可以拿这个 id 去查询任务状态和结果。

### Job 状态和结果查询

在知道任务 id 的情况下（startJob 返回），可以主动查询本次任务的结果：

```js
  var id = '已知任务 id';
  var q = new AV.Insight.JobQuery(id);
  q.find().then(function(result) {
    //返回查询结果 result 对象
  }, function(err) {
    //查询失败
  });
```

result 是一个 JSON 对象，形如：

```js
{  
  "id":         "976c94ef0847f4ff3a65e661bf7b809a", //任务 id
  "status":     "OK", //任务状态
  "totalCount": 50, //结果总数
  "results":[  
     ... 结果数组...
  ]
}
```

如果 `status` 是 `OK`，表示任务成功，其他状态包括 `RUNNING` 表示正在运行，以及 `ERROR` 表示本次任务失败，并将返回失败信息 message。

`AV.Insight.JobQuery` 也可以设置 `skip` 和 `limit` 做分页查询。
