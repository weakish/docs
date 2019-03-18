# 贡献指南

这里约定了问题反馈以及提交 PR 时需要注意的事项

## 问题反馈

- 如遇到文档错误，请提供相对应的文档 URL，以及具体的错误内容

## 文档贡献

- 文档中的图像尽量使用本地图像（置于 `images` 目录下），而不是热链外部网站图片，避免因为外部网站的变动导致图片不可用的情况。
- 文字可以描述清楚的，尽量不要使用截图
  - 如果使用了截图，尽量保持与线上界面同步更新
- 代码不要使用截图
- 界面截图完整，尽量不要出现文字、图标等元素截取一半的情形
- OS X 下，UI 截图不需要带上系统阴影，但 UI 界面必须保持完整，参考 [Chrome Developer](https://developer.chrome.com/devtools/docs/remote-debugging)
- iOS 或者 Android 截图，如果是 2x 或者 3x 的高像素，downscale 至 1x 尺寸
- 由于中文在屏幕上的显示的特性，尽量避免使用_斜体_
- `li` 中不要嵌套复杂的 markup，比如 `<pre>`、`<table>`

## 提交 Pull Request

- 请确保您的提交已通过 CI 测试
- 请确保文档符合我们的[文案风格指南](https://open.leancloud.cn/copywriting-style-guide.html)
