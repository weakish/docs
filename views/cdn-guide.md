# CDN 配置指南

CDN 能有效防止 DDoS 攻击，同时也有一定的加速效果（尤其对于静态资源）。
对服务可控性及可用性有较高要求的商用版用户如果希望接入第三方 CDN 服务，我们可以提供协助。
这篇指南简要介绍了配置 CDN 的具体步骤。

## 准备工作

1. 确认在 LeanCloud 控制台已绑定目标应用的 API / 云引擎 域名（API 与云引擎是分开的其 CDN 不能混用，下面提到的所有概念如果没有特殊说明，都不再区分 API 与云引擎服务），如果还没有绑定，需要至少准备一个已备案的域名。
2. 准备一个该域名的二级域名作为最终提供服务的域名，比如 `example.yourdomain.com`（其中多个应用的 API 可以共用一个二级域名，多个云引擎分组需要分别准备多个二级域名）。准备对应的 SSL 证书（对于云引擎服务，如果确认不需要 https 支持可以不需要准备证书）。
3. 注册一个提供动态 CDN 服务的供应商。

## 向 LeanCloud 申请回源 IP

请通过工单系统提出申请（在工单中需要提供应用 appId，已绑定的域名），我们在收到申请后会为你的服务配置独立的回源 IP。
在配置完成后，我们会在工单中提供以下信息：

- 回源 IP（**该 IP 为私密信息，不要在包括 DNS 配置在内的任何公开场合使用该 IP**）
- 回源 Host

请注意每个独立的回源 IP 收费为每月 100 元。多个应用的 API 或者多个云引擎分组可以共用一个 IP（但 API 与云引擎之间不能共用），请在工单一并提供所有的信息我们会在回复中分别提供对应的配置。

## 配置 CDN

接下来请在 CDN 服务商处增加一个 CDN。每个服务商提供的配置界面与文案会略有不同，如果对具体的配置项有疑问，可以联系服务商的技术支持。需要对该 CDN 进行如下配置：

- 域名与证书：准备的最终提供服务的二级域名与证书，并按照提示配置对应的 DNS
- 回源 IP（填写 LeanCloud 提供的回源 IP）
- 回源 Host（填写 LeanCloud 提供的回源 Host）
- 回源协议（如有，选择 https）

在配置完成之后，可以通过下面的请求验证配置的正确性：

如果是 API 服务： `https://example.yourdomain.com/1.1/date`（应该每次都返回当前的时间）
如果是云引擎服务： `https://example.yourdomain.com/__engine/1/ping`

## 常见问题

### 我已经在使用 LeanCloud 绑定的自有域名，可以不换域名切换到基于 CDN 的方案吗

可以。你可以用现在已经绑定的二级域名作为 CDN 的域名，所有配置的方法都与上述一致。完成配置后将该域名 DNS CNAME 记录从指向 LeanCloud 切换到指向 CDN，即可完成切换。需要特别注意 CDN 提供商有可能会需要验证 DNS CNAME 记录后才能完成配置，那样可能无法避免切换时的服务中断，请向 CDN 服务商咨询解决方案。另外要注意的是，在切换了 DNS 记录后，LeanCloud 上绑定的域名的证书将无法自动续期。

### CDN 缓存了动态的资源

请检查 CDN 的缓存控制相关的配置，建议设置为「遵循相关 header」，对于 API 服务可以直接设置为「均不缓存」。有部分服务商还会提供「忽略 URL 中的参数」的功能，请确保该功能是关闭的。

### 跨域访问出现异常

如果你的应用是 WebApp，在访问 CDN 域名的 API 服务的时候出现了 CORS 相关的异常，请先通过下面的命令检查返回的 Header 中是否有正确的 CORS 相关的 header（`access-control-allow-origin`，`access-control-allow-methods` 与 `access-control-allow-headers`）：

```sh
curl 'https://example.yourdomain.com/1.1/ping' \
    -X OPTIONS -H 'Access-Control-Request-Method: GET' \
    -H 'Access-Control-Request-Headers: content-type,x-lc-id,x-lc-prod,x-lc-session,x-lc-sign,x-lc-ua' \
    -H 'Origin: http://localhost' -i
```

如果没有正确的响应或者 header 不正确，请检查 CDN 的跨域访问配置，以下是参考配置：

```
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH
access-control-max-age: 86400
access-control-allow-headers: Content-Type, Origin, X-LC-Id, X-LC-Key, X-LC-Sign, X-LC-Session, X-LC-Prod, X-LC-UA, X-LC-IM-Session-Token
```

### 获取客户端 IP

配置了 CDN 后，因为所有请求会经过 CDN 中转，API 的请求日志、云函数中的 `req.meta.remoteAddress` 和云引擎中的 `req.headers['x-real-ip']` 获取到的将是 CDN 节点的 IP 而不是客户端的实际 IP。

如果你的业务需要客户端 IP 的话，可以参照 CDN 供应商的文档来从 Header 中（一般是 `X-Forwarded-For`）获取实际 IP。注意因为 LeanCloud 的负载均衡总是会覆盖 `X-Real-IP` 这个头，所以如果 CDN 供应商只在 `X-Real-IP` 上发送实际 IP 的话，目前确实没有办法获得到这个 IP。
