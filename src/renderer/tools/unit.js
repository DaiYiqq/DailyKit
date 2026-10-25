/* 单位换算：长度、重量、面积、体积、温度、数据存储、速度 */
(function () {
  'use strict';

  // 以基准单位表示的换算系数（线性单位）
  const CATEGORIES = {
    length: {
      label: '长度', base: 'm',
      units: {
        mm: { label: '毫米', factor: 0.001 },
        cm: { label: '厘米', factor: 0.01 },
        m: { label: '米', factor: 1 },
        km: { label: '千米', factor: 1000 },
        inch: { label: '英寸', factor: 0.0254 },
        foot: { label: '英尺', factor: 0.3048 },
        yard: { label: '码', factor: 0.9144 },
        mile: { label: '英里', factor: 1609.344 },
        li: { label: '市里', factor: 500 },
        zhang: { label: '市丈', factor: 10 / 3 }
      }
    },
    weight: {
      label: '重量 / 质量', base: 'kg',
      units: {
        mg: { label: '毫克', factor: 0.000001 },
        g: { label: '克', factor: 0.001 },
        kg: { label: '千克', factor: 1 },
        t: { label: '吨', factor: 1000 },
        jin: { label: '市斤', factor: 0.5 },
        liang: { label: '市两', factor: 0.05 },
        oz: { label: '盎司', factor: 0.028349523125 },
        lb: { label: '磅', factor: 0.45359237 }
      }
    },
    area: {
      label: '面积', base: 'm2',
      units: {
        mm2: { label: '平方毫米', factor: 0.000001 },
        cm2: { label: '平方厘米', factor: 0.0001 },
        m2: { label: '平方米', factor: 1 },
        km2: { label: '平方千米', factor: 1000000 },
        ha: { label: '公顷', factor: 10000 },
        mu: { label: '市亩', factor: 2000 / 3 },
        ft2: { label: '平方英尺', factor: 0.09290304 },
        acre: { label: '英亩', factor: 4046.8564224 }
      }
    },
    volume: {
      label: '体积 / 容积', base: 'l',
      units: {
        ml: { label: '毫升', factor: 0.001 },
        l: { label: '升', factor: 1 },
        m3: { label: '立方米', factor: 1000 },
        tsp: { label: '茶匙', factor: 0.005 },
        tbsp: { label: '汤匙', factor: 0.015 },
        cup: { label: '杯', factor: 0.24 },
        floz: { label: '液盎司(美)', factor: 0.0295735295625 },
        gal: { label: '加仑(美)', factor: 3.785411784 }
      }
    },
    storage: {
      label: '数据存储', base: 'B',
      units: {
        bit: { label: '比特 bit', factor: 0.125 },
        B: { label: '字节 B', factor: 1 },
        KB: { label: '千字节 KB', factor: 1024 },
        MB: { label: '兆字节 MB', factor: 1024 ** 2 },
        GB: { label: '吉字节 GB', factor: 1024 ** 3 },
        TB: { label: '太字节 TB', factor: 1024 ** 4 },
        PB: { label: '拍字节 PB', factor: 1024 ** 5 }
      }
    },
    speed: {
      label: '速度', base: 'mps',
      units: {
        mps: { label: '米/秒', factor: 1 },
        kmh: { label: '千米/时', factor: 1 / 3.6 },
        mph: { label: '英里/时', factor: 0.44704 },
        knot: { label: '节', factor: 0.514444 },
        fps: { label: '英尺/秒', factor: 0.3048 }
      }
    },
    temperature: {
      label: '温度', base: 'C',
      units: {
        C: { label: '摄氏度 ℃' },
        F: { label: '华氏度 ℉' },
        K: { label: '开尔文 K' }
      }
    }
  };

  function convertTemp(value, from, to) {
    // 先转为摄氏度
    let c;
    if (from === 'C') c = value;
    else if (from === 'F') c = (value - 32) * 5 / 9;
    else c = value - 273.15;
    if (to === 'C') return c;
    if (to === 'F') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  function convert(value, catKey, from, to) {
    const cat = CATEGORIES[catKey];
    if (catKey === 'temperature') return convertTemp(value, from, to);
    const base = value * cat.units[from].factor;
    return base / cat.units[to].factor;
  }

  DK.register({
    id: 'unit',
    title: '单位换算',
    icon: '📏',
    group: 'life',
    desc: '长度、重量、面积、温度、数据存储等单位互转',
    keywords: ['unit', '单位', 'danwei', '换算', 'huansuan', '长度', '重量', '温度', '英寸', '厘米'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>📏 单位换算</h2>
          <label class="field-label">类别</label>
          <select id="catSelect"></select>

          <div class="grid grid-2" style="margin-top:16px">
            <div>
              <label class="field-label">从</label>
              <input type="number" id="fromValue" value="1">
              <select id="fromUnit" style="margin-top:8px"></select>
            </div>
            <div>
              <label class="field-label">到</label>
              <div class="output" id="toValue" style="min-height:40px; display:flex; align-items:center; font-size:16px;">-</div>
              <select id="toUnit" style="margin-top:8px"></select>
            </div>
          </div>

          <div class="btn-row">
            <button class="btn btn-ghost" id="btnSwap">🔄 交换单位</button>
            <button class="btn btn-ghost" id="btnCopy">📋 复制结果</button>
          </div>

          <h3>全部单位对照</h3>
          <div id="allTable" class="output" style="max-height:260px; overflow:auto"></div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);
      const catSelect = $('#catSelect');

      Object.keys(CATEGORIES).forEach((key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = CATEGORIES[key].label;
        catSelect.appendChild(opt);
      });

      function fillUnits() {
        const cat = CATEGORIES[catSelect.value];
        [$('#fromUnit'), $('#toUnit')].forEach((sel) => {
          sel.innerHTML = '';
          Object.keys(cat.units).forEach((u) => {
            const opt = document.createElement('option');
            opt.value = u;
            opt.textContent = `${cat.units[u].label}（${u}）`;
            sel.appendChild(opt);
          });
        });
        const keys = Object.keys(cat.units);
        $('#fromUnit').value = keys[0];
        $('#toUnit').value = keys[Math.min(1, keys.length - 1)];
      }

      function update() {
        const catKey = catSelect.value;
        const v = Number($('#fromValue').value);
        if (isNaN(v)) { $('#toValue').textContent = '-'; return; }
        const result = convert(v, catKey, $('#fromUnit').value, $('#toUnit').value);
        const text = formatNum(result);
        $('#toValue').textContent = text;
        $('#toValue').className = 'output ok';

        // 全表
        const cat = CATEGORIES[catKey];
        const lines = Object.keys(cat.units).map((u) => {
          const r = convert(v, catKey, $('#fromUnit').value, u);
          return `${cat.units[u].label}：${formatNum(r)}`;
        });
        $('#allTable').textContent = lines.join('\n');
      }

      function formatNum(n) {
        if (!isFinite(n)) return '-';
        if (n === 0) return '0';
        const abs = Math.abs(n);
        if (abs < 0.000001 || abs >= 1e12) return n.toExponential(6);
        return String(Number(n.toFixed(8)));
      }

      catSelect.addEventListener('change', () => { fillUnits(); update(); });
      $('#fromValue').addEventListener('input', update);
      $('#fromUnit').addEventListener('change', update);
      $('#toUnit').addEventListener('change', update);
      $('#btnSwap').addEventListener('click', () => {
        const f = $('#fromUnit').value;
        $('#fromUnit').value = $('#toUnit').value;
        $('#toUnit').value = f;
        $('#fromValue').value = formatNum(Number($('#toValue').textContent) || 0);
        update();
      });
      $('#btnCopy').addEventListener('click', () => DK.copy($('#toValue').textContent));

      fillUnits();
      update();
    }
  });
})();
