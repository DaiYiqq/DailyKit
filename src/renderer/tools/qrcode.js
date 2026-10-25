/* 二维码生成器 */
(function () {
  'use strict';

  DK.register({
    id: 'qrcode',
    title: '二维码生成',
    icon: '🔳',
    group: 'security',
    desc: '把文本、网址、WiFi 信息生成二维码图片',
    keywords: ['qrcode', '二维码', 'ewm', 'qr', 'wifi二维码', '生成二维码'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🔳 二维码生成器</h2>
          <div class="grid grid-2">
            <div>
              <div class="btn-row" style="margin-top:0">
                <button class="btn btn-sm btn-ghost" data-tpl="text">📝 文本</button>
                <button class="btn btn-sm btn-ghost" data-tpl="url">🔗 网址</button>
                <button class="btn btn-sm btn-ghost" data-tpl="wifi">📶 WiFi</button>
              </div>

              <div id="tplFields"></div>

              <label class="field-label">二维码内容（也可直接输入）</label>
              <textarea id="qrText" rows="6" placeholder="输入要编码为二维码的内容…"></textarea>

              <label class="field-label">尺寸：<span id="sizeVal">320</span> px</label>
              <input type="range" id="qrSize" min="160" max="800" step="40" value="320" style="width:100%; accent-color:var(--primary)">

              <div class="btn-row">
                <button class="btn btn-primary" id="btnGen">生成二维码</button>
                <button class="btn btn-ghost" id="btnDownload" disabled>💾 下载 PNG</button>
              </div>
            </div>
            <div style="text-align:center">
              <div class="qr-preview" id="qrBox" style="color:#94a3b8; min-height:272px; display:flex; align-items:center; justify-content:center">
                生成后在此预览
              </div>
            </div>
          </div>
          <div class="hint">二维码在本地生成，内容不会上传。手机扫描「WiFi 二维码」可一键加入无线网络。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);
      let currentDataUrl = null;

      function showTpl(type) {
        const box = $('#tplFields');
        if (type === 'wifi') {
          box.innerHTML = `
            <label class="field-label">网络名称 (SSID)</label>
            <input type="text" id="wifiSsid" placeholder="例如 HomeWiFi">
            <label class="field-label">密码</label>
            <input type="text" id="wifiPwd" placeholder="WiFi 密码">
            <label class="checkbox-row"><input type="checkbox" id="wifiHidden"> 隐藏网络</label>
            <div class="btn-row" style="margin-top:8px"><button class="btn btn-sm btn-primary" id="wifiApply">填入内容</button></div>`;
          $('#wifiApply').addEventListener('click', () => {
            const ssid = $('#wifiSsid').value.replace(/([\\;,:"])/g, '\\$1');
            const pwd = $('#wifiPwd').value.replace(/([\\;,:"])/g, '\\$1');
            const hidden = $('#wifiHidden').checked ? 'true' : 'false';
            $('#qrText').value = `WIFI:T:WPA;S:${ssid};P:${pwd};H:${hidden};;`;
          });
        } else if (type === 'url') {
          box.innerHTML = `
            <label class="field-label">网址</label>
            <input type="text" id="urlInput" placeholder="https://example.com">
            <div class="btn-row" style="margin-top:8px"><button class="btn btn-sm btn-primary" id="urlApply">填入内容</button></div>`;
          $('#urlApply').addEventListener('click', () => {
            let u = $('#urlInput').value.trim();
            if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
            $('#qrText').value = u;
          });
        } else {
          box.innerHTML = '';
        }
      }

      card.querySelectorAll('[data-tpl]').forEach((btn) => {
        btn.addEventListener('click', () => showTpl(btn.dataset.tpl));
      });

      $('#qrSize').addEventListener('input', () => {
        $('#sizeVal').textContent = $('#qrSize').value;
        if (currentDataUrl) generate();
      });

      async function generate() {
        const text = $('#qrText').value;
        if (!text.trim()) { DK.toast('请输入二维码内容', 'error'); return; }
        try {
          currentDataUrl = await window.dk.qrGenerate(text, Number($('#qrSize').value));
          $('#qrBox').innerHTML = `<img src="${currentDataUrl}" alt="二维码">`;
          $('#btnDownload').disabled = false;
        } catch (e) {
          DK.toast('生成失败：' + e.message, 'error');
        }
      }

      $('#btnGen').addEventListener('click', generate);
      $('#btnDownload').addEventListener('click', async () => {
        if (!currentDataUrl) return;
        const r = await window.dk.saveImage(currentDataUrl, 'dailykit-qrcode.png');
        if (r && !r.canceled) DK.toast('已保存', 'success');
      });
    }
  });
})();
