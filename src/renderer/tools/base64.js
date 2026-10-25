/* Base64 编码 / 解码，支持 URL 安全变体 */
(function () {
  'use strict';

  function encode(str, urlSafe) {
    // 处理 Unicode
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    let out = btoa(bin);
    if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return out;
  }

  function decode(str, urlSafe) {
    let s = str.trim();
    if (urlSafe) {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
    }
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  DK.register({
    id: 'base64',
    title: 'Base64 编解码',
    icon: '🔤',
    group: 'security',
    desc: 'Base64 文本编码与解码，支持 URL 安全格式',
    keywords: ['base64', '编码', '解码', 'bianma', 'jiema', 'encode', 'decode', 'atob'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🔤 Base64 编码 / 解码</h2>
          <label class="checkbox-row"><input type="checkbox" id="urlSafe"> URL 安全变体（- 和 _，常用于网址/Token）</label>

          <div class="grid grid-2">
            <div>
              <label class="field-label">原始文本</label>
              <textarea id="input" rows="10" placeholder="输入要编码的文本，或在右侧输入 Base64 后点解码…"></textarea>
            </div>
            <div>
              <label class="field-label">Base64 结果</label>
              <textarea id="output" rows="10" placeholder="结果"></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="btnEncode">⬇️ 编码 →</button>
            <button class="btn btn-ghost" id="btnDecode">⬆️ ← 解码</button>
            <button class="btn btn-ghost" id="btnCopy">📋 复制结果</button>
            <button class="btn btn-ghost" id="btnClear">清空</button>
          </div>
          <div class="hint">Base64 不是加密，只是一种数据表示方式，请勿用它“保护”密码。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      $('#btnEncode').addEventListener('click', () => {
        try {
          $('#output').value = encode($('#input').value, $('#urlSafe').checked);
        } catch (e) {
          DK.toast('编码失败：' + e.message, 'error');
        }
      });
      $('#btnDecode').addEventListener('click', () => {
        try {
          $('#input').value = decode($('#output').value, $('#urlSafe').checked);
        } catch (e) {
          DK.toast('解码失败：不是有效的 Base64', 'error');
        }
      });
      $('#btnCopy').addEventListener('click', () => DK.copy($('#output').value));
      $('#btnClear').addEventListener('click', () => { $('#input').value = ''; $('#output').value = ''; });
    }
  });
})();
