/* JSON 格式化 / 校验 / 压缩 */
(function () {
  'use strict';

  DK.register({
    id: 'json',
    title: 'JSON 格式化',
    icon: '🧩',
    group: 'text',
    desc: 'JSON 美化、压缩、校验与错误定位',
    keywords: ['json', '格式化', 'geshihua', 'json校验', 'json压缩', '美化'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🧩 JSON 格式化工具</h2>
          <div class="grid grid-2">
            <div>
              <label class="field-label">输入 JSON</label>
              <textarea id="jsonInput" rows="16" placeholder='{"name":"DailyKit","version":"1.0.0"}'></textarea>
            </div>
            <div>
              <label class="field-label">结果</label>
              <div class="output" id="jsonOut" style="min-height:340px; max-height:400px; overflow:auto;">结果在此显示</div>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="btnFormat2">✨ 格式化（2 空格）</button>
            <button class="btn btn-ghost" id="btnFormat4">格式化（4 空格）</button>
            <button class="btn btn-ghost" id="btnMinify">🗜️ 压缩</button>
            <button class="btn btn-ghost" id="btnValidate">✓ 校验</button>
            <button class="btn btn-ghost" id="btnCopy">📋 复制结果</button>
            <button class="btn btn-ghost" id="btnClear">清空</button>
          </div>
          <div class="hint">支持键排序吗？保持原始键顺序。错误信息会指出行列位置，方便定位多余逗号、缺少引号等问题。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);
      let lastResult = '';

      function parse() {
        const raw = $('#jsonInput').value;
        if (!raw.trim()) throw new Error('输入为空');
        return JSON.parse(raw);
      }

      function showError(e) {
        const out = $('#jsonOut');
        out.className = 'output err';
        let msg = String(e.message || e);
        // 提取行列
        const pos = /position\s+(\d+)/i.exec(msg);
        if (pos) {
          const n = Number(pos[1]);
          const raw = $('#jsonInput').value;
          const before = raw.slice(0, n);
          const line = before.split('\n').length;
          const col = n - before.lastIndexOf('\n');
          msg += `\n\n位置：第 ${line} 行，第 ${col} 列`;
        }
        out.textContent = '❌ ' + msg;
        lastResult = '';
      }

      function showOutput(text) {
        const out = $('#jsonOut');
        out.className = 'output ok';
        out.textContent = text;
        lastResult = text;
      }

      $('#btnFormat2').addEventListener('click', () => {
        try { showOutput(JSON.stringify(parse(), null, 2)); } catch (e) { showError(e); }
      });
      $('#btnFormat4').addEventListener('click', () => {
        try { showOutput(JSON.stringify(parse(), null, 4)); } catch (e) { showError(e); }
      });
      $('#btnMinify').addEventListener('click', () => {
        try { showOutput(JSON.stringify(parse())); } catch (e) { showError(e); }
      });
      $('#btnValidate').addEventListener('click', () => {
        try {
          const obj = parse();
          const out = $('#jsonOut');
          out.className = 'output ok';
          out.textContent = '✅ 合法的 JSON\n类型：' + (Array.isArray(obj) ? '数组' : typeof obj) +
            '\n顶层条目数：' + (obj && typeof obj === 'object' ? Object.keys(obj).length : 1);
          lastResult = '';
        } catch (e) { showError(e); }
      });
      $('#btnCopy').addEventListener('click', () => {
        if (lastResult) DK.copy(lastResult);
        else DK.toast('暂无可复制的结果', 'error');
      });
      $('#btnClear').addEventListener('click', () => {
        $('#jsonInput').value = '';
        $('#jsonOut').className = 'output';
        $('#jsonOut').textContent = '结果在此显示';
        lastResult = '';
      });
    }
  });
})();
