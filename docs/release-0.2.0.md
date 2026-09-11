# v0.2.0 便携版验收

v0.1.0 只有源码模板，未满足普通用户下载即启动的目标。v0.2.0 提供独立的 Windows x64 完整运行资产。

## 已完成

- 从既有无 Key 员工便携版提取运行基线，未加入 V2 公司 Hub。
- 采用通用 Starter 品牌，去除员工欢迎文案；真实替换侧栏、欢迎页 SVG/文字及标题。
- 品牌 bundle 转 .mjs 后 node --check 通过；重复应用品牌脚本通过。
- 无凭据启动、停止、再次启动保留配置通过。
- 浏览器确认首次说明、Key 配置页、跳过后主界面可打开。
- Codex app-server 初始化、临时线程、Responses→Chat 本地模拟请求、取消请求通过。
- 源凭据对照和全部文件扫描：无源凭据匹配、运行数据库、日志、备份或符号链接。
- 两处模式命中为第三方代码：emacs-lisp 语法词表中的 files--ask-user-about-large-file；jose 的 PKCS#8 格式标记判断。均非真实凭据。
- 保留依赖许可证，补 Node、Codex、libvips 声明及来源。

## 发布前最后检查

最终 ZIP 需重新解压、逐文件 SHA256 对照，并再次测试 start.cmd / stop.cmd。检查结果附 Release 的 verification.json。

## 验证限制

测试使用本机 Windows、隔离的新数据目录和打包 Node；没有全新 Windows 虚拟机。未使用真实模型 Key，未验证真实付费模型响应质量。默认模型可用性取决于用户账号。本包不含重明商业能力。
