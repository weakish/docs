{% import "views/_helper.njk" as docs %}
# 网络连通性诊断流程

本文适用于使用了 LeanCloud SDK 而出现的小范围、无法确认的网络连通性的诊断。以下内容以 macOS 为例，其他操作系统和工具的安装方法见文末 [安装诊断工具](#安装诊断工具)。

建议先确定域名，然后进行「快速诊断」，根据结果再进行其他诊断。如果诊断的目标是 4G 网络，建议在手机上打开无线热点，然后使用 macOS 接入热点进行诊断。如果问题发生在用户的设备上，可能需要用户的配合来完成诊断。

### 确定域名

LeanCloud 不同版本的 SDK 可能使用不同的域名，因此需要先确定所使用的域名以便进行后续的诊断。

使用 JS SDK，可以打开浏览器的调试工具查看网络请求；在 Android 或 iOS 上，可以打开调试日志查看网络请求。如果是用户反馈上来的问题，你可以用同版本的应用进行上述步骤确定所使用的域名，最后得到的域名类似于 `aau1irn3.api.lncld.net` 或 `api.leancloud.cn`。以下以 `api.leancloud.cn` 为例，请替换为你所使用的域名，如果是云引擎的请求，请使用云引擎域名。

### 快速诊断

```
curl -I -w 'nslookup: %{time_namelookup}, connect: %{time_connect}, init_ssl: %{time_appconnect}, starttransfer: %{time_starttransfer}, total_time: %{time_total}, http_code: %{http_code}, remote_ip: %{remote_ip}, local_ip: %{local_ip}' https://api.leancloud.cn
```

上述命令会给出通过 HTTP 访问 LeanCloud 服务的耗时情况，一般总耗时 1 秒以下是可以接受的：

```
nslookup: 0.005, connect: 0.032, init_ssl: 0.065, starttransfer: 0.074, total_time: 0.074, http_code: 404, remote_ip: 106.75.66.151, local_ip: 192.168.81.50
```

注意输出中的时间都是「时刻」而不是「耗时」，例如 init_ssl 的耗时实际上是 0.065 - 0.032 = 0.033s.

- **nslookup** 表示 DNS 查询耗时，若耗时过长请跳到「[DNS 诊断](#DNS_诊断)」
- **connect**、**init_ssl** 表示 TCP 和 SSL 连接初始化的耗时，若耗时较长说明延迟或丢包较高，请跳转到「[延迟和丢包诊断](#延迟和丢包诊断)」
- **starttransfer** 表示等待服务器响应的第一个字节的耗时，相当于服务器处理请求的时间，但也会受到延迟和丢包的影响
- **total_time** 表示内容传输的耗时，一定程度上取决于被请求的内容，也会受到延迟和丢包的影响
- **http_code** 表示收到的 HTTP 响应代码，一般只要收到了响应就表示连通性没有问题，如果未收到响应说明无法连接到 LeanCloud。
- **remote_ip** 表示本次请求所连接到的服务器地址。

如果请求未成功完成（http_code 显示为 000）：

- 如果输出中有打印 `curl: (6) Could not resolve host`，请跳转到「[DNS 诊断](#DNS_诊断)」。
- 如果输出中有打印 `curl: (7) Failed to connect to host`，请先进行「[DNS 诊断](#DNS_诊断)」，再进行「[延迟和丢包诊断](#延迟和丢包诊断)」。
- 如果输出中有打印 `curl: (35) SSL connect error`，请先进行「[DNS 诊断](#DNS_诊断)」，再进行「[SSL 诊断](#SSL_诊断)」。
- 如果输出中有打印 `curl: (60) SSL certificate problem`，请先进行「[DNS 诊断](#DNS_诊断)」，再进行「[SSL 诊断](#SSL_诊断)」。

如果命令长时间没有结束，请改用 `curl -v https://api.leancloud.cn` 来获取不完整的信息，确认请求卡在哪个步骤，再进行「[延迟和丢包诊断](#延迟和丢包诊断)」。

请留意在进行诊断时是否开启了代理，否则得到的是经过了代理的访问情况，如不确认请在 curl 后添加 `--noproxy '*'`。

### DNS 诊断

```
dig api.leancloud.cn
```

上述命令会给出 DNS 查询的结果，以下是部分输出：

```
// ...

;; QUESTION SECTION:
;api.leancloud.cn.      IN  A

;; ANSWER SECTION:
api.leancloud.cn.   286 IN  CNAME   api-ucloud.leancloud.cn.
api-ucloud.leancloud.cn. 353    IN  A   106.75.87.92
api-ucloud.leancloud.cn. 353    IN  A   106.75.95.143
api-ucloud.leancloud.cn. 353    IN  A   106.75.66.151
api-ucloud.leancloud.cn. 353    IN  A   106.75.87.91
api-ucloud.leancloud.cn. 353    IN  A   106.75.95.141
api-ucloud.leancloud.cn. 353    IN  A   120.132.49.239
api-ucloud.leancloud.cn. 353    IN  A   123.59.41.31
api-ucloud.leancloud.cn. 353    IN  A   106.75.95.142

// ...

;; Query time: 27 msec
;; SERVER: 192.168.89.3#53(192.168.89.3)
;; WHEN: Wed Jun  7 15:56:35 2017
;; MSG SIZE  rcvd: 456
```

你需要在被诊断的设备和正常的设备下分别运行该命令，然后对比两者的结果（`ANSWER SECTION` 部分），如果结果不同说明发生了 DNS 劫持。如果域名无法解析可能是你没有连接到互联网，或者 DNS Server（上面 `SERVER: 192.168.89.3` 的部分）存在故障。

如果域名无法解析或确实存在 DNS 劫持，可以尝试将设备上的 DNS Server 配置成更可靠的服务商（例如 DNSPod 119.29.29.29、阿里 DNS 223.5.5.5）。若更换后仍无法解析出正确的结果，需要向你的运营商（电信、联通等）投诉。

如果你的设备全部存在连通性问题，可以尝试使用第三方服务的解析结果进行对比（例如 [digwebinterface.com](https://www.digwebinterface.com/?hostnames=api.leancloud.cn&type=&ns=resolver&useresolver=8.8.4.4)）。

Windows 系统下没有预装 `dig` 命令，可以使用 nslookup：

```
nslookup -debug api.leancloud.cn 
```

### 延迟和丢包诊断

{{ docs.note("需要注意 LeanCloud 的服务器并不是全部支持 ping 检测，因此建议优先使用 curl 检测。") }} 

可以先用 ping 进行简单的确认：

```
ping api.leancloud.cn
```

在积累一段时间数据后可以按 `Ctrl-C` 退出，会打印这样的结果：

```
PING api-ucloud.leancloud.cn (120.132.49.239): 56 data bytes
64 bytes from 120.132.49.239: icmp_seq=0 ttl=0 time=16.123 ms
64 bytes from 120.132.49.239: icmp_seq=1 ttl=0 time=19.765 ms
64 bytes from 120.132.49.239: icmp_seq=2 ttl=0 time=6.789 ms
64 bytes from 120.132.49.239: icmp_seq=3 ttl=0 time=5.286 ms
64 bytes from 120.132.49.239: icmp_seq=4 ttl=0 time=9.722 ms
^C
--- api-ucloud.leancloud.cn ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 5.286/11.537/19.765/5.543 ms
```

`0.0% packet loss` 是指丢包率，一般 3% 以下是可以接受的，否则会导致数据反复重传，连接质量下降；如果丢包率为 100% 说明完全无法连通，请检查本地网络或向运营商投诉。

`min/avg/max/stddev = 5.286/11.537/19.765/5.543 ms` 是指延迟的最小、平均、最大值和标准差，正常情况延迟会在 100ms 以下。

如果检测到了延迟或者丢包，需要用 mtr 进一步确认发生延迟或丢包的位置：

```
sudo mtr -n api.leancloud.cn
```

mtr 会给出单独 ping 网络上每一个路由节点的延迟（Avg）和丢包（Loss%）情况，从上到下依次是由近（用户端）到远（LeanCloud 服务器）：

```
My traceroute  [v0.85]
jysperm-macbook.local (0.0.0.0)                              Wed Jun  7 16:29:10 2017
Keys:  Help   Display mode   Restart statistics   Order of fields   quit
             Packets               Pings
Host                                      Loss%   Snt   Last   Avg  Best  Wrst StDev
1. ???
2. 10.252.119.45                           0.0%    36    0.8   1.1   0.7   2.3   0.4
3. 10.196.28.29                            0.0%    36    1.3   1.5   1.0   2.7   0.3
4. 10.200.5.162                            0.0%    36    2.9   3.2   2.9   4.5   0.3
5. 140.207.73.153                          0.0%    36    2.6   2.8   2.2   4.3   0.5
6. 139.226.206.1                           0.0%    36    4.2   4.3   4.0   5.6   0.3
7. 139.226.225.185                        88.6%    35    3.2   3.2   3.2   3.3   0.0
8. 219.158.8.241                          61.8%    35   34.4  35.2  33.4  42.7   2.2
9. 124.65.194.26                          97.1%    35   28.2  28.2  28.2  28.2   0.0
10. 61.148.157.122                          0.0%    35   34.6  34.9  33.7  37.8   0.6
11. ???
12. ???
13. ???
14. 180.150.176.54                          0.0%    35   37.4  38.5  35.2  41.8   1.4
15. ???
```

{{ docs.note("需要注意并不是所有运营商都允许使用 mtr，也并不是网络中的每个节点都会回应 ping 检测（所以有一部分节点是 `???`）。") }}

我们应该由远至近（由下至上）去检查发生延迟或丢包的节点，会出现中间某个节点延迟或丢包较高，但如果下一个节点没有受到影响，那么说明延迟或丢包不是这个节点造成的。

一旦找到导致延迟或丢包的节点，我们可以去第三方的 IP 库（例如 [ipip.net](http://www.ipip.net/)）查询这个 IP 的归属者：

- 如果查询结果类似「局域网」，说明延迟或丢包发生在你的浏览器或末端运营商处，可能是 Wifi 信号差、路由器负荷过高或者达到了限速，可以尝试重启路由器或向你的运营商投诉。
- 如果查询结果类似「中国 联通骨干网」，说明延迟或丢包发生在省市级别的线路上，需要等待电信运营商采取措施，这类故障通常会比较快地被修复。
- 如果查询结果类似「上海市 联通」，说明延迟或丢包发生在市县一级的线路上，如果靠近用户端需要向运营商投诉，如果靠近 LeanCloud 端可以 [联系我们](/help/)。
- 如果查询结果类似「北京市 北京天地祥云科技有限公司联通数据中心」，说明延迟或丢包发生在靠近 LeanCloud 机房的线路上，可尽快与 [我们联系](/help/)。

### SSL 诊断

SSL 本身有防御 DNS 劫持的能力，因此在进行 SSL 诊断之前请先检查 DNS 劫持的情况，如果 DNS 确实被劫持了，可通过下面的命令看到劫持者所使用的证书。

```
openssl s_client -connect api.leancloud.cn:443 -servername api.leancloud.cn
```

以下是部分结果，可以看到对方使用的证书：

```
Certificate chain
 0 s:/C=CN/ST=Beijing/L=Beijing/O=Mei Wei Shu Qian ( Beijing ) IT Co., Ltd./OU=OPS/CN=*.leancloud.cn
   i:/C=US/O=GeoTrust Inc./CN=GeoTrust SSL CA - G3
 1 s:/C=US/O=GeoTrust Inc./CN=GeoTrust SSL CA - G3
   i:/C=US/O=GeoTrust Inc./CN=GeoTrust Global CA
```

完整结果还包含了更多的信息，如果确实发生了劫持可将结果提供给我们。

### 安装诊断工具

- macOS 自带 ping 和 curl，mtr 和 openssl 需要 `brew install mtr openssl`，brew 需要在 <https://brew.sh/> 安装。
- Windows & Linux 使用 mtr：[使用 MTR 诊断网络问题](https://meiriyitie.com/2015/05/26/diagnosing-network-issues-with-mtr)。
- 在 Android 或 iOS 上可以使用 [HE.NET Network Tools](http://networktools.he.net/) 提供的 DNS、Ping 和 Traceroute（类似 mtr）。

----------
相关文档：[中国移动运营商网络问题的诊断和投诉](https://leancloudblog.com/zhong-guo-yi-dong-yun-ying-shang-wang-luo-wen-ti-de-zhen-duan-he-tou-su/)

