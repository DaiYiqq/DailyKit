/* DailyKit 应用入口：导航、路由、搜索、首次引导 */
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const view = document.getElementById('view');
  const pageTitle = document.getElementById('pageTitle');
  const searchInput = document.getElementById('toolSearch');
  const versionTag = document.getElementById('versionTag');

  let currentTool = null;

  /** 分组定义 */
  const GROUPS = {
    home: { label: '开始', order: 0 },
    security: { label: '安全与编码', order: 1 },
    media: { label: '图片与媒体', order: 2 },
    text: { label: '文本与数据', order: 3 },
    life: { label: '生活与时间', order: 4 },
    system: { label: '其他', order: 9 }
  };

  function buildNav() {
    nav.innerHTML = '';
    const grouped = {};
    for (const tool of DK.tools) {
      if (tool.id === 'about') continue;
      const g = tool.group || 'system';
      (grouped[g] = grouped[g] || []).push(tool);
    }

    Object.keys(GROUPS)
      .sort((a, b) => GROUPS[a].order - GROUPS[b].order)
      .forEach((gKey) => {
        const list = grouped[gKey];
        if (!list || !list.length) return;
        const label = document.createElement('div');
        label.className = 'nav-group-label';
        label.textContent = GROUPS[gKey].label;
        nav.appendChild(label);
        list.forEach((tool) => {
          const btn = document.createElement('button');
          btn.className = 'nav-item';
          btn.dataset.tool = tool.id;
          btn.innerHTML = `<span class="nav-icon">${tool.icon}</span><span class="nav-label">${tool.title}</span>`;
          btn.addEventListener('click', () => location.hash = '#/' + tool.id);
          nav.appendChild(btn);
        });
      });
  }

  function renderTool(id) {
    const tool = DK.get(id);
    if (!tool) {
      renderTool('dashboard');
      return;
    }
    if (currentTool && typeof currentTool.unmount === 'function') {
      try { currentTool.unmount(); } catch (e) { console.error(e); }
    }
    view.innerHTML = '';
    pageTitle.textContent = tool.title;
    document.querySelectorAll('.nav-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.tool === tool.id);
    });
    try {
      tool.render(view);
      currentTool = tool;
      if (typeof tool.mount === 'function') tool.mount();
    } catch (e) {
      console.error(e);
      view.appendChild(DK.el(`<div class="card"><div class="output err">工具加载失败：${String(e.message || e)}</div></div>`));
    }
  }

  function route() {
    const id = (location.hash || '#/dashboard').replace(/^#\//, '');
    renderTool(id || 'dashboard');
  }

  /* 搜索 */
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('#nav .nav-item, #nav .nav-group-label').forEach((n) => n.classList.remove('hidden'));
    if (!q) return;
    document.querySelectorAll('#nav .nav-item').forEach((btn) => {
      const tool = DK.get(btn.dataset.tool);
      const hit = tool && (tool.title.toLowerCase().includes(q) ||
        (tool.keywords || []).some((k) => k.toLowerCase().includes(q)));
      btn.classList.toggle('hidden', !hit);
    });
    // 空分组隐藏标签
    document.querySelectorAll('#nav .nav-group-label').forEach((label) => {
      let next = label.nextElementSibling;
      let visible = false;
      while (next && !next.classList.contains('nav-group-label')) {
        if (!next.classList.contains('hidden')) { visible = true; break; }
        next = next.nextElementSibling;
      }
      label.classList.toggle('hidden', !visible);
    });
  });

  document.getElementById('aboutNavBtn').addEventListener('click', () => location.hash = '#/about');

  /* 菜单 -> 导航事件 */
  window.dk.onNavigate((target) => {
    if (target) location.hash = '#/' + target;
  });

  /* ---------------- 首次启动引导 ---------------- */

  const ONBOARD_STEPS = [
    {
      icon: '👋',
      title: '欢迎使用 DailyKit 百宝工具箱',
      body: `
        <p>DailyKit 把日常最常用的小工具集合在一个干净、快速的桌面应用里：密码生成、二维码、图片压缩、JSON 格式化、文本对比、时间戳转换、单位换算、哈希校验、番茄钟……开箱即用。</p>`
    },
    {
      icon: '🔒',
      title: '完全离线，隐私优先',
      body: `
        <div class="ob-feature"><span>🚫</span><span>不收集任何数据，无账号、无广告、无统计上报</span></div>
        <div class="ob-feature"><span>🖥️</span><span>所有计算都在你的电脑本地完成，文件不会上传</span></div>
        <div class="ob-feature"><span>🌐</span><span>无需联网，断网也能正常使用全部功能</span></div>`
    },
    {
      icon: '💻',
      title: '一个软件，三大平台',
      body: `
        <p>同一份体验，完整支持 Windows、macOS（含 Apple 芯片）和 Linux。安装包由 GitHub Actions 云端自动构建，并通过 GitHub Artifact Attestations 进行来源签名证明，可在 GitHub 上验证安装包确实由本仓库构建、未被篡改。</p>`
    },
    {
      icon: '🤝',
      title: '开源 · 社区共同维护',
      body: `
        <p>DailyKit 基于 MIT 协议开源，欢迎每一位使用者参与：</p>
        <div class="ob-feature"><span>🐛</span><span>在 Issues 提交 Bug 与功能建议</span></div>
        <div class="ob-feature"><span>🔀</span><span>提交 Pull Request 改进代码与文档</span></div>
        <div class="ob-feature"><span>💬</span><span>在 Discussions 交流想法</span></div>`
    },
    {
      icon: '🧰',
      title: '准备好了',
      body: `<p>点击「开始使用」即可进入主界面。左侧导航栏选择工具，也可以直接在顶部搜索框搜索。</p>
             <p>想了解开发者或联系作者，请查看「关于」页面。</p>`
    }
  ];

  let obIndex = 0;
  const onboarding = document.getElementById('onboarding');
  const obSteps = document.getElementById('obSteps');
  const obBody = document.getElementById('obBody');
  const obNext = document.getElementById('obNext');

  function renderObDots() {
    obSteps.innerHTML = ONBOARD_STEPS.map((_, i) =>
      `<div class="ob-dot ${i === obIndex ? 'active' : i < obIndex ? 'done' : ''}"></div>`
    ).join('');
  }

  function renderOb() {
    const step = ONBOARD_STEPS[obIndex];
    renderObDots();
    obBody.innerHTML = `<span class="ob-icon">${step.icon}</span><h2>${step.title}</h2>${step.body}`;
    obNext.textContent = obIndex === ONBOARD_STEPS.length - 1 ? '开始使用' : '下一步';
  }

  async function closeOnboarding() {
    onboarding.classList.add('hidden');
    onboarding.setAttribute('aria-hidden', 'true');
    await window.dk.finishOnboarding();
  }

  obNext.addEventListener('click', () => {
    if (obIndex < ONBOARD_STEPS.length - 1) {
      obIndex++;
      renderOb();
    } else {
      closeOnboarding();
    }
  });
  document.getElementById('obSkip').addEventListener('click', closeOnboarding);

  function startOnboarding() {
    obIndex = 0;
    renderOb();
    onboarding.classList.remove('hidden');
    onboarding.setAttribute('aria-hidden', 'false');
  }

  /* ---------------- 启动 ---------------- */

  window.dk.onBoot((info) => {
    DK.bootInfo = info;
    versionTag.textContent = 'v' + info.version;
    buildNav();
    route();
    if (info.firstRun) {
      setTimeout(startOnboarding, 350);
    }
  });

  window.addEventListener('hashchange', route);
})();
