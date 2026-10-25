/* 哈希计算：文本 / 文件，支持校验值比对 */
(function () {
  'use strict';

  const ALGOS = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];

  DK.register({
    id: 'hash',
    title: '哈希校验',
    icon: '🔐',
    group: 'security',
    desc: '计算文本/文件的 MD5、SHA 系列哈希，校验完整性',
    keywords: ['hash', '哈希', 'haxi', 'md5', 'sha256', '校验', 'jiaoyan', '完整性', '文件校验'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🔐 哈希（散列）计算</h2>

          <label class="field-label">算法</label>
          <select id="algo">
            ${ALGOS.map((a) => `<option value="${a}" ${a === 'sha256' ? 'selected' : ''}>${a.toUpperCase()}</option>`).join('')}
          </select>

          <h3>文本哈希</h3>
          <textarea id="textInput" rows="4" placeholder="输入要计算哈希的文本…"></textarea>
          <div class="output copyable" id="textResult" style="margin-top:8px">结果</div>

          <h3>文件哈希</h3>
          <div class="btn-row" style="margin-top:4px">
            <button class="btn btn-primary" id="btnFile">📂 选择文件并计算</button>
          </div>
          <div class="output" id="fileResult" style="margin-top:8px">结果</div>

          <h3>校验值比对</h3>
          <input type="text" id="expect" placeholder="粘贴期望的哈希值（大小写不敏感）">
          <div class="output" id="compareResult" style="margin-top:8px">输入期望值后点击比对</div>
          <div class="btn-row">
            <button class="btn btn-ghost" id="btnCompareText">与文本结果比对</button>
            <button class="btn btn-ghost" id="btnCompareFile">与文件结果比对</button>
          </div>
          <div class="hint">哈希用于验证文件是否被篡改（如下载校验）。文件以流式读取，支持大文件，全程不上传。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);
      let lastTextHash = '';
      let lastFileHash = '';

      async function calcText() {
        const algo = $('#algo').value;
        if (!$('#textInput').value) {
          $('#textResult').textContent = '结果';
          $('#textResult').className = 'output';
          lastTextHash = '';
          return;
        }
        lastTextHash = await window.dk.hashText(algo, $('#textInput').value);
        $('#textResult').className = 'output ok';
        $('#textResult').textContent = lastTextHash;
      }

      $('#algo').addEventListener('change', () => { calcText(); lastFileHash = ''; $('#fileResult').textContent = '结果'; $('#fileResult').className = 'output'; });
      $('#textInput').addEventListener('input', calcText);

      $('#btnFile').addEventListener('click', async () => {
        const algo = $('#algo').value;
        const r = await window.dk.hashFile(algo);
        if (r.canceled) return;
        lastFileHash = r.hash;
        $('#fileResult').className = 'output ok';
        $('#fileResult').textContent = `文件：${r.file}\n大小：${DK.formatBytes(r.size)}\n${r.algo.toUpperCase()}：${r.hash}`;
      });

      DK.bindCopy($('#textResult'), () => lastTextHash);

      function compare(hash) {
        const expect = $('#expect').value.trim().toLowerCase();
        if (!expect) { DK.toast('请输入期望哈希值', 'error'); return; }
        if (!hash) { DK.toast('还没有可比对的结果', 'error'); return; }
        const ok = expect === hash.toLowerCase();
        $('#compareResult').className = 'output ' + (ok ? 'ok' : 'err');
        $('#compareResult').textContent = ok
          ? '✅ 一致：数据完整，未被篡改'
          : '❌ 不一致：数据可能已被修改或下载不完整';
      }

      $('#btnCompareText').addEventListener('click', () => compare(lastTextHash));
      $('#btnCompareFile').addEventListener('click', () => compare(lastFileHash));
    }
  });
})();
