# 贡献指南 Contributing to DailyKit

首先，感谢你愿意为 **DailyKit 百宝工具箱** 做出贡献！🎉 正是因为有像你这样的人，开源社区才会变得更好。本文档说明参与贡献的方式与规范。

## 行为准则

参与本项目即表示你同意遵守 [**行为准则（Code of Conduct）**](CODE_OF_CONDUCT.md)。请保持友善、尊重，共同营造一个安全、包容的环境。

## 我能做些什么？

贡献不仅是写代码，以下方式都非常欢迎：

- 📝 改进文档（README、注释、教程）
- 🐛 报告 Bug（请提供复现步骤）
- 💡 提出新功能 / 新工具建议
- 🎨 优化界面、图标、交互体验
- 🌐 翻译（多语言）
- 🔀 提交代码修复或新功能
- ⭐ 向朋友推荐、点亮 Star

## 提交 Issue

- **Bug 报告**：请使用 [Bug 报告模板](.github/ISSUE_TEMPLATE/bug_report.md)，并尽量包含：
  - 操作系统与 DailyKit 版本
  - 问题的复现步骤
  - 期望行为与实际行为
  - 截图（如适用）
- **功能建议**：请使用 [功能建议模板](.github/ISSUE_TEMPLATE/feature_request.md)，描述使用场景与期望效果。

## 提交 Pull Request（PR）

### 开发流程

1. **Fork** 本仓库并克隆到本地
2. 基于 `main` 分支创建新分支：
   ```bash
   git checkout -b feature/short-description
   # 修复类可用 fix/xxx，文档类可用 docs/xxx
   ```
3. 安装依赖并启动开发：
   ```bash
   npm install
   npm start
   ```
4. 完成修改后，确保：
   - 功能在本地验证通过
   - 代码风格与现有代码保持一致（2 空格缩进、末尾分号）
   - 不引入不必要的网络请求与第三方依赖
5. 提交，建议使用约定式提交信息：
   ```bash
   git commit -m "feat: 新增 XX 工具"
   git commit -m "fix: 修复 XX 问题"
   ```
   常用前缀：`feat`（新功能）、`fix`（修复）、`docs`（文档）、`style`（样式）、`refactor`（重构）、`chore`（杂项）
6. 推送到你的 Fork：
   ```bash
   git push origin feature/short-description
   ```
7. 在 GitHub 上发起 Pull Request，并清晰描述修改内容与原因。

### 新增一个工具

工具位于 `src/renderer/tools/` 目录，每个工具一个文件：

1. 参考现有工具（如 `password.js`），调用 `DK.register({...})` 注册：
   ```js
   DK.register({
     id: 'my-tool',            // 唯一标识
     title: '我的工具',
     icon: '🧩',
     group: 'text',            // home / security / media / text / life / system
     desc: '一句话说明',
     keywords: ['关键词'],
     render(container) {
       // 在此构建界面并绑定事件
     }
   });
   ```
2. 在 `src/renderer/index.html` 中按顺序引入你的脚本（在 `app.js` 之前）。
3. 若需要系统能力（文件、对话框等），请在 `main.js` 中新增 IPC，并在 `preload.js` 中显式暴露，**不要**直接在渲染进程使用 Node API。
4. 工具必须**离线可用**，不收集任何数据。

### 代码审查

维护者会尽快审查你的 PR，可能会提出修改建议。请耐心讨论，一起打磨。合并后你的名字将出现在 Contributors 列表中。

## 安全问题

**请勿在公开 Issue 中提交安全漏洞。** 请通过邮件 `daiy91004@gmail.com` 私下报告，详见 [SECURITY.md](SECURITY.md)。

## 再次感谢

感谢你的贡献！❤️ 有任何疑问，欢迎在 [Discussions](https://github.com/DaiYiqq/DailyKit/discussions) 提问。

— 戴亿（Dai Yi）
