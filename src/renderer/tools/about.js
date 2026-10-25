/* 关于页面：开发者信息、联系方式、社区维护 */
(function () {
  'use strict';

  DK.register({
    id: 'about',
    title: '关于',
    icon: 'ℹ️',
    group: 'system',
    desc: '开发者信息、联系方式与社区参与方式',
    keywords: ['about', '关于', 'guanyu', '开发者', '联系', 'contact', '戴亿', '版本'],

    render(container) {
      const wrap = DK.el('<div></div>');

      wrap.appendChild(DK.el(`
        <div class="card about-hero">
          <div class="about-logo" id="aboutLogo">🧰</div>
          <div class="about-name">DailyKit 百宝工具箱</div>
          <div class="about-version" id="aboutVersion">版本加载中…</div>
          <div class="hint" style="max-width:560px; margin:14px auto 0; line-height:1.8">
            一个跨平台、完全离线、保护隐私的日常效率工具集合。<br>
            基于 MIT 协议开源，由社区共同维护。
          </div>
        </div>
      `));

      /* 开发者信息 */
      const devCard = DK.el(`
        <div class="card">
          <h2>👨‍💻 开发者信息</h2>
          <div class="about-contact">
            <div class="contact-row">
              <span class="contact-icon">🧑</span>
              <div class="contact-body">
                <span class="contact-label">开发者</span>
                <span class="contact-value">戴亿（Dai Yi）</span>
              </div>
            </div>

            <div class="contact-row" data-copy="daiy91004@gmail.com">
              <span class="contact-icon">📧</span>
              <div class="contact-body">
                <span class="contact-label">邮箱（Gmail）</span>
                <span class="contact-value mono">daiy91004@gmail.com</span>
              </div>
            </div>

            <div class="contact-row" data-copy="1703205607@qq.com">
              <span class="contact-icon">📮</span>
              <div class="contact-body">
                <span class="contact-label">邮箱（QQ 邮箱）</span>
                <span class="contact-value mono">1703205607@qq.com</span>
              </div>
            </div>

            <div class="contact-row" data-copy="daiyi091004">
              <span class="contact-icon">🎵</span>
              <div class="contact-body">
                <span class="contact-label">抖音</span>
                <span class="contact-value mono">daiyi091004</span>
              </div>
            </div>

            <div class="contact-row" data-copy="1703205607">
              <span class="contact-icon">🐧</span>
              <div class="contact-body">
                <span class="contact-label">QQ</span>
                <span class="contact-value mono">1703205607</span>
              </div>
            </div>

            <div class="contact-row" data-link="https://github.com/DaiYiqq/DailyKit">
              <span class="contact-icon">🐙</span>
              <div class="contact-body">
                <span class="contact-label">项目仓库（GitHub）</span>
                <span class="contact-value mono">github.com/DaiYiqq/DailyKit</span>
              </div>
            </div>
          </div>
          <div class="hint" style="margin-top:14px">点击任意一行可复制对应内容；GitHub 链接会用系统浏览器打开。</div>
        </div>
      `);
      wrap.appendChild(devCard);

      /* 社区维护 */
      wrap.appendChild(DK.el(`
        <div class="card">
          <h2>🤝 社区共同维护</h2>
          <p style="color:var(--text-dim); line-height:1.8">
            DailyKit 的成长离不开每一位用户。无论你是开发者、设计师，还是普通使用者，都欢迎参与：
          </p>
          <div class="grid grid-3" style="margin-top:10px">
            <div class="contact-row" data-link="https://github.com/DaiYiqq/DailyKit/issues">
              <span class="contact-icon">🐛</span>
              <div class="contact-body">
                <span class="contact-label">报告问题</span>
                <span class="contact-value">提交 Issue</span>
              </div>
            </div>
            <div class="contact-row" data-link="https://github.com/DaiYiqq/DailyKit/pulls">
              <span class="contact-icon">🔀</span>
              <div class="contact-body">
                <span class="contact-label">贡献代码</span>
                <span class="contact-value">Pull Request</span>
              </div>
            </div>
            <div class="contact-row" data-link="https://github.com/DaiYiqq/DailyKit/discussions">
              <span class="contact-icon">💬</span>
              <div class="contact-body">
                <span class="contact-label">交流讨论</span>
                <span class="contact-value">Discussions</span>
              </div>
            </div>
          </div>
          <div class="hint" style="margin-top:12px">
            贡献前请阅读仓库中的 <span class="mono">CONTRIBUTING.md</span> 与 <span class="mono">CODE_OF_CONDUCT.md</span>。
            所有贡献者的名字都会出现在项目贡献者列表中。
          </div>
        </div>
      `));

      /* 技术信息 */
      const techCard = DK.el(`
        <div class="card">
          <h2>🛠️ 技术信息</h2>
          <div class="output mono" id="techInfo">加载中…</div>
          <div class="hint" style="margin-top:10px">
            构建于 Electron，使用原生 HTML/CSS/JavaScript 编写，无重型框架；<br>
            安装包由 GitHub Actions 在 Windows / macOS / Linux 三平台自动构建，
            并通过 GitHub Artifact Attestations（Sigstore）生成构建来源签名证明。
          </div>
        </div>
      `);
      wrap.appendChild(techCard);

      container.appendChild(wrap);

      /* 填充动态信息 */
      window.dk.appInfo().then((info) => {
        wrap.querySelector('#aboutVersion').textContent =
          `版本 v${info.version} · ${info.platform} ${info.arch}`;
        wrap.querySelector('#techInfo').textContent =
          `应用版本：${info.version}\n` +
          `运行平台：${info.platform} (${info.arch})\n` +
          `Electron：${info.electron}\n` +
          `Node：${info.node}\n` +
          `许可证：MIT`;
      });

      window.dk.appIcon().then((url) => {
        if (url) {
          const logo = wrap.querySelector('#aboutLogo');
          logo.innerHTML = '';
          const img = document.createElement('img');
          img.src = url;
          logo.appendChild(img);
        }
      });

      /* 事件绑定 */
      wrap.querySelectorAll('[data-copy]').forEach((row) => {
        row.addEventListener('click', () => DK.copy(row.dataset.copy));
      });
      wrap.querySelectorAll('[data-link]').forEach((row) => {
        row.addEventListener('click', () => window.dk.openExternal(row.dataset.link));
      });
    }
  });
})();
