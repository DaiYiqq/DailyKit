# 安全策略 Security Policy

## 报告安全漏洞

DailyKit 非常重视安全。**如果你发现了安全漏洞，请勿在公开的 GitHub Issue 中提交**，请通过以下方式私下报告：

- 📧 **主邮箱：** `daiy91004@gmail.com`
- 📮 **备用邮箱：** `1703205607@qq.com`

请在报告中尽量包含：

- 问题描述与潜在影响
- 复现步骤或概念验证（PoC）
- 受影响的版本与平台
- 你建议的修复方式（如有）

我们会在收到后尽快确认并回复，并在修复后公开致谢（如你愿意）。

## 安全设计

DailyKit 在设计上遵循以下安全原则：

- **完全离线**：应用不向任何服务器发送数据，无统计、无遥测
- **最小权限**：渲染进程禁用 Node 集成（`nodeIntegration: false`），开启上下文隔离（`contextIsolation: true`）
- **白名单 IPC**：仅通过 `preload` 的 `contextBridge` 暴露经过校验的 API
- **CSP**：严格的内容安全策略，禁止加载远程脚本
- **文件校验**：所有文件操作均经主进程校验，外部链接仅允许 http/https 并由系统浏览器打开

## 安装包完整性

- 所有官方安装包均由 GitHub Actions 官方 Runner 构建，并通过 **GitHub Artifact Attestations（Sigstore）** 签名
- 请仅从 [官方 Releases](https://github.com/DaiYiqq/DailyKit/releases) 下载
- 可使用 `gh attestation verify <安装包> --repo DaiYiqq/DailyKit` 验证来源

## 版本支持

| 版本 | 是否接受安全修复 |
| --- | --- |
| 1.0.x | ✅ |
