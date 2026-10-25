/* 颜色工具：HEX / RGB / HSL 互转与配色 */
(function () {
  'use strict';

  function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  DK.register({
    id: 'color',
    title: '颜色工具',
    icon: '🎨',
    group: 'media',
    desc: '取色器，HEX/RGB/HSL 互转，自动生成配色',
    keywords: ['color', '颜色', 'yanse', '取色', 'hex', 'rgb', 'hsl', '配色', '设计'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🎨 颜色转换与配色</h2>
          <div class="grid grid-2">
            <div>
              <input type="color" id="picker" value="#38bdf8">
              <div class="color-swatch" id="swatch" style="margin-top:12px"></div>
              <label class="field-label">HEX 输入</label>
              <input type="text" id="hexInput" value="#38bdf8">
            </div>
            <div>
              <div class="output copyable" id="hexOut" style="margin-bottom:8px"></div>
              <div class="output copyable" id="rgbOut" style="margin-bottom:8px"></div>
              <div class="output copyable" id="hslOut" style="margin-bottom:8px"></div>
              <div class="hint">点击任意输出框即可复制</div>
            </div>
          </div>

          <h3>配色方案</h3>
          <div class="grid grid-2">
            <div>
              <div class="hint">互补色（Contrast）</div>
              <div id="complement" style="display:flex; gap:6px; margin-top:6px"></div>
            </div>
            <div>
              <div class="hint">类似色（Analogous）</div>
              <div id="analogous" style="display:flex; gap:6px; margin-top:6px"></div>
            </div>
          </div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      function update(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) {
          $('#hexInput').style.borderColor = 'var(--danger)';
          return;
        }
        $('#hexInput').style.borderColor = '';
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        $('#swatch').style.background = hex;
        $('#hexOut').textContent = 'HEX：' + hex.toLowerCase();
        $('#rgbOut').textContent = `RGB：rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        $('#hslOut').textContent = `HSL：hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        // 互补色
        const comp = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
        const compHex = rgbToHex(comp.r, comp.g, comp.b);
        $('#complement').innerHTML = [hex, compHex].map((c) =>
          `<div title="${c}" style="flex:1;height:44px;border-radius:6px;background:${c};cursor:pointer" data-hex="${c}"></div>`
        ).join('');

        // 类似色
        const analog = [-30, 0, 30].map((d) => {
          const c = hslToRgb((hsl.h + d + 360) % 360, hsl.s, hsl.l);
          return rgbToHex(c.r, c.g, c.b);
        });
        $('#analogous').innerHTML = analog.map((c) =>
          `<div title="${c}" style="flex:1;height:44px;border-radius:6px;background:${c};cursor:pointer" data-hex="${c}"></div>`
        ).join('');

        card.querySelectorAll('[data-hex]').forEach((d) => {
          d.addEventListener('click', () => {
            const h = d.dataset.hex;
            $('#picker').value = h;
            $('#hexInput').value = h;
            update(h);
          });
        });
      }

      $('#picker').addEventListener('input', () => {
        $('#hexInput').value = $('#picker').value;
        update($('#picker').value);
      });
      $('#hexInput').addEventListener('change', () => {
        let v = $('#hexInput').value.trim();
        if (/^[0-9a-f]{6}$/i.test(v)) v = '#' + v;
        if (/^#[0-9a-f]{6}$/i.test(v)) {
          $('#picker').value = v;
          update(v);
        } else {
          $('#hexInput').style.borderColor = 'var(--danger)';
        }
      });

      DK.bindCopy($('#hexOut'), () => $('#hexOut').textContent.replace('HEX：', ''));
      DK.bindCopy($('#rgbOut'), () => $('#rgbOut').textContent.replace('RGB：', ''));
      DK.bindCopy($('#hslOut'), () => $('#hslOut').textContent.replace('HSL：', ''));

      update('#38bdf8');
    }
  });
})();
