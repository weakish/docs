# LeanDB MySQL 使用文档

LeanDB 是 LeanCloud 推出的数据库托管方案，开发者可以在「控制台 => 云引擎 => LeanDB」中创建托管在 LeanCloud 的数据库实例，目前仅在华北节点支持 MySQL 数据库。

开发者可以在云引擎中连接到自己的 LeanDB 实例，使用通用的 MySQL 客户端类库，访问完整的 MySQL 功能。

## 实例规格

- LeanDB MySQL 提供 MySQL 5.6 版本。
- LeanDB MySQL 的规格分为 `0.5G`、`1G`、`2G`、`4G` 几种，代表不同的运算能力。
- 每个实例默认有 20G 的存储空间，如果不够的话还可以选配 100G 或者 500G 的存储空间。
- 具体的价格可以在控制台上点击「创建 LeanDB 实例」来查看。

## 在线管理

为方便开发和调试，我们为开发者提供了一个 Web 界面来对 MySQL 进行管理，你可以在控制台上点击「管理员面板」链接来访问这个 Web 界面。

开发者可以在这个页面上进行 SQL 查询和更新，创建和管理数据库，创建和管理索引等操作。

## 在云引擎中使用

LeanDB 所在的应用的云引擎在部署时，会被注入几个包含 MySQL 连接信息的环境变量，包括：

- `MYSQL_HOST_<NAME>`
- `MYSQL_PORT_<NAME>`
- `MYSQL_ADMIN_USER_<NAME>`
- `MYSQL_ADMIN_PASSWORD_<NAME>`

其中 `<NAME>` 是你在创建 LeanDB 时为它指定的名字，如果你的 LeanDB 名为 `MYRDB` 的话，就会有名为 `MYSQL_HOST_MYRDB` 的环境变量（以及其他三个）。

### Node.js

在 Node.js 中你可以这样连接到 MySQL:

```javascript
const mysql = require('mysql')
const Promise = require('bluebird')

const mysqlPool = Promise.promisifyAll(mysql.createPool({
  host: process.env['MYSQL_HOST_MYRDB'],
  port: process.env['MYSQL_PORT_MYRDB'],
  user: process.env['MYSQL_ADMIN_USER_MYRDB'],
  password: process.env['MYSQL_ADMIN_PASSWORD_MYRDB'],
  database: 'test',
  connectionLimit: 10
}))

mysqlPool.queryAsync('SELECT 1 + 1 AS solution').then( rows => {
  console.log('The solution is', rows[0].solution)
}).catch( err => {
  console.error(err)
})
```

- 你需要运行 `npm install --save mysql bluebird` 来安装上面代码中用到的依赖
- 更多的用法请参考 [mysqljs/mysql 的文档](https://github.com/mysqljs/mysql)

### PHP

在 PHP 中你可以这样连接到 MySQL:

```php
try {
  $pdo = new PDO("mysql:host={${getenv('MYSQL_HOST_MYRDB')}}:{${getenv('MYSQL_HOST_MYRDB')}};dbname=test", getenv('MYSQL_ADMIN_USER_MYRDB'), getenv('MYSQL_ADMIN_PASSWORD_MYRDB'));

  foreach($pdo->query('SELECT 1 + 1 AS solution') as $row) {
    print "The solution is {$row['solution']}";
  }
} catch (PDOException $e) {
  print $e->getMessage();
}
```

- 更多的用法请参考 [PDO 的文档](https://www.php.net/manual/zh/class.pdo.php)

## 常见问题

- 目前 LeanDB 只支持从云引擎（和控制台的 Web 界面）中访问，在本地调试时无法访问。
- 目前 LeanDB 不提供自助扩容的能力，如需扩容请联系我们的技术支持。
- 如账户欠费超过 3 天，LeanDB 及其中的数据会被彻底删除。
- LeanDB 每天扣费，不足一天按照一天扣费。
