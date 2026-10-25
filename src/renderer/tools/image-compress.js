/* 图片压缩：本地 Canvas 处理，支持 JPEG/WebP 批量压缩 */
(function () {
  'use strict';

  DK.register({
    id: 'image-compress',
    title: '图片压缩',
    icon: '🖼️',
    group: 'media',
    desc: '本地批量压缩图片，调整质量与尺寸，支持 JPEG/WebP',
    keywords: ['image', 'compress', '图片压缩', 'yasuo', '缩小图片', '图片体积', 'webp', 'jpeg'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🖼️ 图片批量压缩</h2>
          <div class="grid grid-3">
            <div>
              <label class="field-label">输出格式</label>
              <select id="outFormat">
                <option value="image/jpeg">JPEG（体积小）</option>
                <option value="image/webp">WebP（更优）</option>
                <option value="image/png">PNG（无损）</option>
              </select>
            </div>
            <div>
              <label class="field-label">质量：<span id="qualityVal">75</span>%</label>
              <input type="range" id="quality" min="10" max="100" value="75" style="width:100%; accent-color:var(--primary)">
            </div>
            <div>
              <label class="field-label">最大宽度（px，0=不缩放）</label>
              <input type="number" id="maxWidth" value="1920" min="0" step="100">
            </div>
          </div>

          <div class="btn-row">
            <button class="btn btn-primary" id="btnPick">📂 选择图片</button>
            <button class="btn btn-ghost" id="btnCompress">⚡ 开始压缩</button>
          </div>

          <div id="list" style="margin-top:16px"></div>
          <div class="hint">所有图片仅在本地内存中处理，不会上传。压缩后逐张点「保存」即可；JPEG 不支持透明背景。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);
      let images = [];

      $('#quality').addEventListener('input', () => $('#qualityVal').textContent = $('#quality').value);

      $('#btnPick').addEventListener('click', async () => {
        const r = await window.dk.pickImages();
        if (r.canceled) return;
        images = r.images;
        renderList();
      });

      function renderList() {
        const list = $('#list');
        list.innerHTML = '';
        images.forEach((img, i) => {
          const row = DK.el(`
            <div class="compress-row">
              <span class="cr-name">${img.name}</span>
              <span class="cr-size">${DK.formatBytes(img.size)} → <span class="cr-result" data-i="${i}">待压缩</span></span>
              <button class="btn btn-sm btn-ghost" data-save="${i}" disabled>保存</button>
            </div>`);
          list.appendChild(row);
        });
      }

      function loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = dataUrl;
        });
      }

      $('#btnCompress').addEventListener('click', async () => {
        if (!images.length) { DK.toast('请先选择图片', 'error'); return; }
        const mime = $('#outFormat').value;
        const quality = Number($('#quality').value) / 100;
        const maxW = Number($('#maxWidth').value) || 0;

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const im = await loadImage(img.dataUrl);
          let w = im.naturalWidth;
          let h = im.naturalHeight;
          if (maxW > 0 && w > maxW) {
            h = Math.round(h * (maxW / w));
            w = maxW;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (mime === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
          }
          ctx.drawImage(im, 0, 0, w, h);
          const out = canvas.toDataURL(mime, quality);
          img.outDataUrl = out;
          const outSize = Math.floor((out.length - out.indexOf(',') - 1) * 3 / 4);
          img.outSize = outSize;

          const resultEl = card.querySelector(`.cr-result[data-i="${i}"]`);
          const pct = ((1 - outSize / img.size) * 100);
          resultEl.textContent = `${DK.formatBytes(outSize)}（${pct >= 0 ? '减小' : '增大'} ${Math.abs(pct).toFixed(1)}%）`;
          resultEl.style.color = pct >= 0 ? 'var(--success)' : 'var(--warning)';
          const saveBtn = card.querySelector(`[data-save="${i}"]`);
          saveBtn.disabled = false;
          saveBtn.addEventListener('click', async () => {
            const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png';
            const base = img.name.replace(/\.[^.]+$/, '');
            const r = await window.dk.saveImage(out, `${base}-compressed.${ext}`);
            if (r && !r.canceled) DK.toast('已保存', 'success');
          });
        }
        DK.toast('压缩完成，逐张点保存即可', 'success');
      });
    }
  });
})();
