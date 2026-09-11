# Chongming DSH Starter

Windows 本地 AI 工作助手便携版：解压，双击 start.cmd，配置自己的 DeepSeek API Key 后使用。内含 DSH、Node 和 Codex 运行组件，无需单独安装 Node。

## 普通用户下载

**下载 [最新 Release](https://github.com/chongming-memory/chongming-dsh-starter/releases/latest) 中名称含 win-x64.zip 的完整运行包。**

旧 v0.1.0 的 16.9 KB ZIP 是开发者模板，不能直接运行。GitHub 自动生成的 Source code ZIP 也不包含运行环境。

适用 Windows 10/11 x64（Intel/AMD）。解压到可写目录后：

1. 双击 start.cmd，浏览器打开本地页面。
2. 在首次配置页填写自己的 DeepSeek API Key。
3. 选择测试工作目录，开始一个小任务。
4. 双击 stop.cmd 停止；下次启动保留设置。

详见 [使用说明](docs/portable-quickstart.zh-CN.md)。默认模型需你的账号支持；如调整模型，Codex 本地转换服务的模型配置也需相应调整。模型费用由你自己的 API 账号承担。

## 交付范围

- 内置本地运行环境，无内置模型 Key。
- Codex 子代理通过本地协议转换使用用户自己的模型凭据。
- 可替换 SVG 图标、名称、标语和页面标题。
- 无公司 Hub、重明托管服务、私有知识库或客户数据。

这是独立社区打包版，不是 DeepSeek 或 OpenAI 官方发行版。当前验收包括隔离数据目录下的启动、停止、重启、浏览器配置页，以及本地模拟模型的 Codex 协议测试；不宣称已在全新 Windows 虚拟机或全部真实模型上完成验证。

## 换成团队自己的品牌

完整运行包中编辑 branding/brand.json 和 branding/logo.svg，关闭服务后双击 apply-brand.cmd，再重启并 Ctrl+F5。支持 name、wordmark、headline、logo；不提供 Windows 安装器或快捷方式图标定制。

## 开发者构建

仓库保存打包代码、启动器、说明和许可证，不提交运行依赖。

```powershell
node scripts/build-portable.cjs C:\path\to\tested-portable-baseline
```

该构建器要求已有包含 DSH、Node、Codex 和 codex-proxy 的完整便携基线，不能把任意 DSH 安装目录当成输入。它是基于现有发行包的净化构建，尚不是从上游源码完全复现的构建。

发布前必须检查 [发布验收](docs/release-0.2.0.md)。用户运行后的 .dshcfg 不得再打包。

## 许可证

本项目代码采用 Apache-2.0，完整文本见 LICENSE。DSH、Codex、Node 及其他依赖保留各自许可证；第三方声明见 third-party 和运行包内的 THIRD-PARTY-PACKAGES.json。默认通用 SVG 随本项目许可提供，不代表授予蓝威或其他企业商标使用权。
