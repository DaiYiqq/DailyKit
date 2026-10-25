/* 首页：工具总览 */
(function () {
  'use strict';

  DK.register({
    id: 'dashboard',
    title: '首页',
    icon: '🏠',
    group: 'home',
    keywords: ['home', '首页', 'shouye', '所有工具'],

    render(container) {
      const featured = DK.tools.filter((t) => t.id !== 'dashboard' && t.id !== 'about');

      const hero = DK.el(`
        <div class="hero">
          <h2>🧰 你的日常，一个工具箱就够了</h2>
          <p>DailyKit 把 13+ 个高频小工具集中在一个快速、离线、保护隐私的桌面应用中。无需在一堆网页之间切换，也不用担心数据被上传。选择下方任意工具开始使用，或在左侧搜索框快速查找。</p>
        </div>
      `);
      container.appendChild(hero);

      const grid = DK.el('<div class="grid grid-3 grid-4"></div>');
      featured.forEach((tool) => {
        const card = DK.el(`
          <div class="tool-card">
            <div class="tool-card-icon">${tool.icon}</div>
            <div class="tool-card-name">${tool.title}</div>
            <div class="tool-card-desc">${tool.desc || ''}</div>
          </div>
        `);
        card.addEventListener('click', () => { location.hash = '#/' + tool.id; });
        grid.appendChild(card);
      });
      container.appendChild(grid);

      const tip = DK.el(`
        <div class="card" style="margin-top:18px">
          <h2>💡 为什么选择 DailyKit？</h2>
          <div class="grid grid-3">
            <div><h3>🔒 隐私安全</h3><div class="hint">所有数据仅在本地处理，零网络请求，开源可审计。</div></div>
            <div><h3>⚡ 快速轻量</h3><div class="hint">原生窗口、秒级启动、占用资源少，离线可用。</div></div>
            <div><h3>🌐 全平台一致</h3><div class="hint">Windows / macOS / Linux 同一体验，安装包经 GitHub 签名。</div></div>
          </div>
        </div>
      `);
      container.appendChild(tip);
    }
  });
})();
