/* 文本对比：基于 LCS 的逐行差异 */
(function () {
  'use strict';

  function diffLines(a, b) {
    const x = a;
    const y = b;
    const m = x.length;
    const n = y.length;

    // dp 表（大文本时限制内存，超出则退化为简单对比）
    if (m * n > 4_000_000) {
      return simpleDiff(a, b);
    }

    const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = x[i] === y[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const result = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (x[i] === y[j]) {
        result.push({ type: 'ctx', text: x[i] });
        i++; j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: 'del', text: x[i] });
        i++;
      } else {
        result.push({ type: 'add', text: y[j] });
        j++;
      }
    }
    while (i < m) { result.push({ type: 'del', text: x[i++] }); }
    while (j < n) { result.push({ type: 'add', text: y[j++] }); }
    return result;
  }

  function simpleDiff(a, b) {
    const set = new Set(a);
    const result = [];
    for (const line of b) {
      if (set.has(line)) result.push({ type: 'ctx', text: line });
      else result.push({ type: 'add', text: line });
    }
    const setB = new Set(b);
    const removed = [];
    for (const line of a) {
      if (!setB.has(line)) removed.push({ type: 'del', text: line });
    }
    return removed.concat(result);
  }

  DK.register({
    id: 'textdiff',
    title: '文本对比',
    icon: '📑',
    group: 'text',
    desc: '逐行对比两段文本，高亮新增与删除内容',
    keywords: ['diff', '对比', 'duibi', '文本对比', '差异', '找不同', 'compare'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>📑 文本对比（Diff）</h2>
          <div class="grid grid-2">
            <div>
              <label class="field-label">原始文本</label>
              <textarea id="textA" rows="12" placeholder="粘贴原始文本…"></textarea>
            </div>
            <div>
              <label class="field-label">修改后文本</label>
              <textarea id="textB" rows="12" placeholder="粘贴修改后的文本…"></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="btnDiff">🔍 开始对比</button>
            <button class="btn btn-ghost" id="btnSwap">🔄 交换左右</button>
          </div>
          <div id="diffStats" style="margin-top:14px"></div>
          <div id="diffOut" class="output" style="margin-top:10px; min-height:120px; padding:6px; max-height:420px; overflow:auto;">对比结果在此显示</div>
          <div class="hint">忽略整行去空格差异（行内空格仍计入）。超大文本会自动切换轻量模式。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      $('#btnDiff').addEventListener('click', () => {
        const aLines = $('#textA').value.split('\n').map((s) => s.trim());
        const bLines = $('#textB').value.split('\n').map((s) => s.trim());
        const result = diffLines(aLines, bLines);

        const out = $('#diffOut');
        out.innerHTML = '';
        let adds = 0, dels = 0;
        // 合并连续差异，按行渲染
        result.forEach((line) => {
          if (line.type === 'add') adds++;
          if (line.type === 'del') dels++;
          const prefix = line.type === 'add' ? '+ ' : line.type === 'del' ? '- ' : '  ';
          const div = document.createElement('div');
          div.className = 'diff-line diff-' + (line.type === 'add' ? 'add' : line.type === 'del' ? 'del' : 'ctx');
          div.textContent = prefix + line.text;
          out.appendChild(div);
        });

        $('#diffStats').innerHTML =
          `<span style="color:var(--success)">新增 ${adds} 行</span> ·
           <span style="color:var(--danger)">删除 ${dels} 行</span> ·
           <span style="color:var(--text-dim)">相同 ${result.length - adds - dels} 行</span>`;
      });

      $('#btnSwap').addEventListener('click', () => {
        const a = $('#textA').value;
        $('#textA').value = $('#textB').value;
        $('#textB').value = a;
      });
    }
  });
})();
