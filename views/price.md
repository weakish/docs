{% import "views/_parts.html" as include %}
# TAB（Tencent App Builder）价格方案

## 方案比较 

对每一个应用，TAB 提供了三种方案可供选择：

<table>
<thead>
<tr>
<th rowspan="2" style="background-color: transparent;"></th>
<th>开发版（免费）</th>
<th>商用版</th>
<th>企业版</th>
</tr>
<tr>
  <td width="28%" style="word-break: break-word; vertical-align: text-top;">每月有充足免费额度，适用于个人或开发阶段的项目。</td>
  <td width="28%" style="word-break: break-word; vertical-align: text-top;">提供更高性能和可用性的资源池及增值服务，适用于商业项目。每日<strong>最低消费</strong> 30 元。</td>
  <td width="28%" style="word-break: break-word; vertical-align: text-top;">提供云服务独立集群或私有部署，便于系统集成，适用于已有 IT 基础设施的大中型企业。</td>
</tr>
</thead>
<tbody>
<td colspan="4"><strong>数据存储</strong></td>
</tr>
<tr>
<td>API 请求</td>
<td>30,000 次/天</td>
<td>无上限</td>
<td>无上限</td>
</tr>
<tr>
<td>用户关系管理</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>工作线程</td>
<td>3 个</td>
<td>按需定制</td>
<td>按需定制</td>
</tr>
<tr>
<td>文件存储</td>
<td>10 GB/免费空间</td>
<td>无上限</td>
<td>无上限</td>
</tr>
<tr>
<td>HTTP 流量</td>
<td>15 GB/月</td>
<td>无上限</td>
<td>无上限</td>
</tr>
<tr>
<td>自助数据恢复</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td colspan="4"><strong>消息推送</strong></td>
</tr>
<tr>
<td>Android 混合推送</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>APNs 专线</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>推送队列</td>
<td>标准队列</td>
<td>高优先级队列</td>
<td>独立队列</td>
</tr>
<tr>
<td colspan="4"><strong>即时通讯</strong></td>
</tr>
<tr>
<td>在线用户数</td>
<td>500/天</td>
<td>无上限</td>
<td>无上限</td>
</tr>
<tr>
<td>ChatKit</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<!-- <tr>
<td>LiveKit</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr> -->
<tr>
<td colspan="4"><strong>网站托管</strong></td>
</tr>
<tr>
<td>云引擎实例</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>云缓存实例</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>标准二级域名</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>标准 SSL 证书</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>自定义域名</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>自定义 SSL 证书</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>备案服务</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>性能管理</td>
<td>无</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td colspan="4"><strong>自动化</strong></td>
</tr>
<tr>
<td>云函数</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td>hook 函数</td>
<td>有</td>
<td>有</td>
<td>有</td>
</tr>
<tr>
<td colspan="4"><strong>部署方式</strong></td>
</tr>
<tr>
<td>集群方案</td>
<td>开发集群</td>
<td>高性能高可用集群</td>
<td>按需定制</td>
</tr>
</tbody>
</table>

## 商用版·价格

商用版应用收取**每日 30 元的最低消费**，这意味着我们为每个商业项目都提供更好的资源池和更高优先级的服务。除了性能和稳定性方面的保证外，商用版用户还将免费得到域名备案和绑定、自助数据恢复、自定义 SSL 证书、云引擎性能管理等增值服务，支持千万日活轻松无忧。

您只需要按照使用量付费，这样既便于平衡和控制成本，又可随着项目规模的不断扩张来灵活应对业务的挑战。

### 结构化数据存储
按照请求量计费，每万次请求 1.0 元。

### 文件存储
存储空间 0.001 元／GB／天，文件流量 0.30 元／GB

### 云引擎
体验实例免费使用，标准实例则根据实例大小、按天计费，每日扣费。

云引擎实例有多种组合。一个包含 **0.5 CPU、256 MB 内存** 的实例被定义为**「基本资源」**，应用可以将基本资源组合使用：

- 启动 4 个基本资源的实例，即 4 个 0.5 CPU、256 MB 内存的实例。
- 启动 2 个 2 倍基本资源的实例，即 2 个 1 CPU、512 MB 内存的实例。

>  注意：每个应用最多允许 4 个实例，每个实例最高规格为 4 CPU、2 GB 内存。

「基本资源」的价格是 **1 元／天**，其他规格实例根据大小乘以相应倍数即可。

### 云缓存
无免费额度，根据实例大小、按天计费，每日扣费。

| 内存大小   | 价格      |
| ------ | ------- |
| 128 MB | 1 元／天   |
| 256 MB | 1.5 元／天 |
| 512 MB | 3 元／天   |
| 1 GB   | 5 元／天   |
| 2 GB   | 10 元／天  |
| 4 GB   | 20 元／天  |
| 8 GB   | 50 元／天  |

### 即时通讯
根据在线用户数按天计费，每 10,000 用户需付费 15.00 元。

> 注意：多媒体消息附带并保存在 TAB 云端的图片、音视频等文件，按文件存储服务另行收费。

### 消息推送
免费，无任何功能限制。

### 移动统计
免费，无任何功能限制。

## 开发版

开发版允许开发者可以几乎无成本地使用大多数云服务项目，完成产品初期的开发，或者支撑自己的个人项目，实现快速迭代的同时又能达到财务轻松。开发版有一些资源上的限制，但足以满足产品开发阶段的需求以及非关键应用或一个小型应用的正常运行。开发版应用可以随时升级到商用版。

您可以获得以下**免费资源**：

| 服务项目    | 资源用量                                    |
| ------- | --------------------------------------- |
| 结构化数据存储 | 每天 30,000 次数据请求                         |
| 文件存储    | 每个应用享有 10 GB 存储空间，以及每天 0.5 GB 的 HTTP 下载流量 |
| 云引擎     | 每个应用可有一个免费版实例                           |
| 即时通讯    | 每天免费支持 500 在线用户                         |
| 消息推送    | 完全免费使用                                  |
| 移动统计    | 完全免费使用                                  |

特别说明：**除免费额度外，开发版应用也可付费购买额外的文件空间、流量，以及云引擎标准实例**。

## 企业版

这是灵活应对多样化需求的企业级解决方案。已有 IT 基础设施的大型企业，通常对云服务有一些特定的需求，包括**独立出口 IP、独立集群、私有部署，和现有系统的集成**等等，因此我们为企业版提供了包括独立部署、私有部署以及定制化开发等服务项目，可最大程度匹配业务需求。如果您对此感兴趣，请发邮件至 {{ include.supportEmail() }} 进行咨询。
