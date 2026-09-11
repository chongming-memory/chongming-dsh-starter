# 自定义品牌

完整运行包：编辑 branding/brand.json，替换 branding/logo.svg，停止服务后双击 apply-brand.cmd，重启并 Ctrl+F5。

支持 name、wordmark、headline、logo。SVG 必须自包含，无脚本或外链。脚本固定支持随本版提供的 DSH bundle；上游版本变化需要重新适配。

开发者命令：node scripts/apply-brand.cjs --release <完整包目录> --brand <品牌目录>

支持页面图标、文字标、标题和标语；不提供 Windows 快捷方式图标定制。使用第三方品牌需自行取得许可。
