# 云引擎服务总览

云引擎（LeanEngine）是 LeanCloud 推出的服务端托管平台。提供了多种运行环境（Node.js, Python 等）来运行服务端程序。你只需要提供服务端的业务逻辑（网站或云函数等），而服务端的多实例负载均衡，不中断服务的平滑升级等都由云引擎提供支持。

下面为你了解云引擎提供一个索引：
* [快速入门](leanengine_quickstart.html)：快速的了解如何创建一个云引擎项目，本地开发调试，以及如何部署到云端。
* [运行方案](leanengine_plan.html): 了解云引擎对较大的商业应用如何提供多实例以及运维支持，以及对学习和测试应用的支持。
* [网站托管](leanengine_webhosting_guide-node.html)：使用你熟悉的语言开发一个 web 程序，提供静态和动态路由，开发一个 web 站点；或者为移动应用提供一个介绍和下载页；或者开发一个管理员控制台。
* [云函数](leanengine_cloudfunction_guide-node.html)：可以将各平台客户端(Andorid、 iOS、浏览器等)的一些公共逻辑独立成一个公共的方法在云引擎中实现，各个 SDK 直接调用该方法，各平台客户端直接调用，并且云引擎更新相比客户端更新更加灵活容易；或者需要一些 Hook 函数，比如用户注册后执行一段业务逻辑；或设置一个定时任务在每天晚上清理数据等。
* [在云引擎中使用 ACL](acl_guide_leanengine.html)：为了应用的数据安全，我们建议阅读下 ACL 相关的文档，可以保证即使在 appKey 泄漏的情况下数据不会被恶意读取和篡改。
* [项目示例](leanengine_examples.html)：根据目前较为流行的云引擎使用场景，我们提供了一些示例程序，比如接入微信，接入支付宝等，供大家参考。
* [云引擎 Node.js SDK 升级到 1.x](leanengine-node-sdk-upgrade-1.html)：支持了 Koa 和 Node.js 4.x 及以上版本，修复可能会出现的获取 currentUser 为空的情况。
* [命令行工具 CLI](leanengine_cli.html)：用来管理和部署云引擎项目的工具。它不仅可以部署、发布和回滚云引擎代码，对同一个云引擎项目做多应用管理，还能查看云引擎日志，批量将文件上传到 LeanCloud 云端。
* [LeanCache 使用指南](leancache_guide.html)：云引擎应用可以访问 LeanCache。LeanCache 使用 Redis 来提供高性能、高可用的 Key-Value 内存存储，可以在一些特殊场景（如秒杀、抢红包等）为应用提供很好的性能表现；或者对读写比例很高的数据做缓存，减少对存储服务的压力，提高应用性能表现。
