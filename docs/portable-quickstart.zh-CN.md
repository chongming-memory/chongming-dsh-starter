# Chongming DSH Starter：Windows 便携版

适用 Windows 10/11、64 位 Intel/AMD 电脑。无需另外安装 Node.js；解压后运行，不需要管理员权限。使用模型需要联网并拥有自己的 DeepSeek API Key 和可用额度。

1. 下载名称含 win-x64.zip 的完整包。GitHub 自动生成的 Source code 和旧 v0.1.0 ZIP 都不是可运行包。
2. 右键“全部解压”到自己可写的目录。不要在 ZIP 内直接双击运行。
3. 双击 start.cmd，保留启动窗口。浏览器会打开 http://127.0.0.1:43121 。
4. 首次配置页或设置中填写自己的 DeepSeek API Key，选择账号可用的模型。
5. 选择一个测试工作目录，先让助手“在此目录创建 hello.txt，内容为你好”。
6. 用完双击 stop.cmd。下次启动保留设置。

模型费用由你的 API 账号承担。默认模型为 deepseek-v4-pro；如果账号不支持，在设置中修改。Codex 子代理经本地协议转换使用同一份 DeepSeek Key；若修改模型，同时调整首次启动生成的 .dshcfg/codex-relay.json 中 model，不是必须购买另一份 OpenAI Key。

本包包含 DSH、Node、Codex 运行组件与本地接入服务。不含重明托管服务、销售教练知识库、公司 Hub 登录、内置 Key 或真实客户数据。

设置和会话保存在本目录 .dshcfg。该目录含你的个人数据和凭据，不要再打包发给别人。默认仅本机访问。

## 换成自己的品牌

停止运行，编辑 branding/brand.json 的 name、wordmark、headline，替换 branding/logo.svg，双击 apply-brand.cmd；重新启动后浏览器 Ctrl+F5。本版支持 SVG 图标、文字标、标语和页面标题，不提供 Windows 安装器或桌面快捷方式图标定制。

## 排查

- 页面未打开：查看启动窗口错误，手动访问本地地址；端口冲突时先关闭同类实例。
- 模型报错：检查 Key、余额、账号支持的模型与网络。页面打开不等同于真实模型已验证。
- 先使用无重要文件的测试目录体验文件和命令工具。

这是独立社区打包版，并非 DeepSeek 或 OpenAI 官方发行版。第三方许可证保留在包内；本项目代码采用 Apache-2.0。
