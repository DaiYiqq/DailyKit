/* 文本处理：大小写转换、行去重、统计、空白清理 */
(function () {
  'use strict';

  DK.register({
    id: 'text-tools',
    title: '文本处理',
    icon: '📝',
    group: 'text',
    desc: '大小写转换、行去重、字数统计、空白清理',
    keywords: ['text', '文本', 'wenben', '去重', 'quchong', '大小写', '字数统计', 'trim', '处理'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>📝 文本处理工具</h2>
          <div class="grid grid-2">
            <div>
              <label class="field-label">输入文本</label>
              <textarea id="input" rows="16" placeholder="粘贴或输入文本…"></textarea>
            </div>
            <div>
              <label class="field-label">处理结果</label>
              <textarea id="output" rows="16" placeholder="结果"></textarea>
            </div>
          </div>

          <div class="btn-row">
            <button class="btn btn-sm btn-ghost" data-act="upper">全部大写</button>
            <button class="btn btn-sm btn-ghost" data-act="lower">全部小写</button>
            <button class="btn btn-sm btn-ghost" data-act="title">首字母大写</button>
            <button class="btn btn-sm btn-ghost" data-act="sentence">句首大写</button>
            <button class="btn btn-sm btn-ghost" data-act="dedup">行去重</button>
            <button class="btn btn-sm btn-ghost" data-act="trimLines">去除每行首尾空格</button>
            <button class="btn btn-sm btn-ghost" data-act="removeBlank">删除空行</button>
            <button class="btn btn-sm btn-ghost" data-act="collapseSpaces">合并连续空格</button>
            <button class="btn btn-sm btn-ghost" data-act="removeBreaks">删除所有换行</button>
            <button class="btn btn-sm btn-ghost" data-act="reverse">倒序文本</button>
            <button class="btn btn-sm btn-ghost" data-act="sort">行排序（A-Z）</button>
            <button class="btn btn-sm btn-ghost" data-act="sortReverse">行排序（Z-A）</button>
          </div>

          <div class="btn-row">
            <button class="btn btn-ghost" id="btnCopy">📋 复制结果</button>
            <button class="btn btn-ghost" id="btnMove">← 结果移回输入</button>
          </div>

          <div class="output" id="stats" style="margin-top:12px">统计信息</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      function updateStats() {
        const t = $('#input').value;
        const lines = t.split('\n');
        const words = t.trim() ? t.trim().split(/\s+/).length : 0;
        const noSpaces = t.replace(/\s/g, '').length;
        $('#stats').textContent =
          `字符数：${t.length}（不含空白 ${noSpaces}）\n单词数：${words}\n行数：${lines.length}\n非空行：${lines.filter((l) => l.trim()).length}`;
      }

      function process(act) {
        const t = $('#input').value;
        let out = t;
        switch (act) {
          case 'upper': out = t.toUpperCase(); break;
          case 'lower': out = t.toLowerCase(); break;
          case 'title':
            out = t.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
            break;
          case 'sentence':
            out = t.toLowerCase().replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (c) => c.toUpperCase());
            break;
          case 'dedup':
            out = Array.from(new Set(t.split('\n'))).join('\n');
            break;
          case 'trimLines':
            out = t.split('\n').map((l) => l.trim()).join('\n');
            break;
          case 'removeBlank':
            out = t.split('\n').filter((l) => l.trim() !== '').join('\n');
            break;
          case 'collapseSpaces':
            out = t.replace(/[^\S\n]+/g, ' ');
            break;
          case 'removeBreaks':
            out = t.replace(/\s*\n\s*/g, ' ');
            break;
          case 'reverse':
            out = Array.from(t).reverse().join('');
            break;
          case 'sort':
            out = t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
            break;
          case 'sortReverse':
            out = t.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
            break;
        }
        $('#output').value = out;
      }

      card.querySelectorAll('[data-act]').forEach((btn) => {
        btn.addEventListener('click', () => process(btn.dataset.act));
      });
      $('#input').addEventListener('input', updateStats);
      $('#btnCopy').addEventListener('click', () => DK.copy($('#output').value));
      $('#btnMove').addEventListener('click', () => {
        $('#input').value = $('#output').value;
        updateStats();
      });

      updateStats();
    }
  });
})();
