/* 密码生成器与强度检测 */
(function () {
  'use strict';

  const SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~'
  };
  const LOOKALIKES = /[0Oo1lI|`'"]/g;

  function secureRandomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    let x;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  function generate(opts) {
    let pool = '';
    if (opts.lower) pool += SETS.lower;
    if (opts.upper) pool += SETS.upper;
    if (opts.digits) pool += SETS.digits;
    if (opts.symbols) pool += SETS.symbols;
    if (opts.excludeLookalikes) pool = pool.replace(LOOKALIKES, '');
    if (!pool) return '';

    const chars = [];
    for (let i = 0; i < opts.length; i++) {
      chars.push(pool[secureRandomInt(pool.length)]);
    }

    // 保证每类至少一个字符
    const required = [];
    ['lower', 'upper', 'digits', 'symbols'].forEach((k) => {
      if (opts[k]) {
        const set = opts.excludeLookalikes ? SETS[k].replace(LOOKALIKES, '') : SETS[k];
        if (set) required.push(set[secureRandomInt(set.length)]);
      }
    });
    for (let i = 0; i < required.length && i < chars.length; i++) {
      chars[secureRandomInt(chars.length)] = required[i];
    }
    return chars.join('');
  }

  function entropyScore(pwd, opts) {
    let poolSize = 0;
    if (opts.lower) poolSize += 26;
    if (opts.upper) poolSize += 26;
    if (opts.digits) poolSize += 10;
    if (opts.symbols) poolSize += 27;
    const entropy = pwd.length * Math.log2(poolSize || 1);
    return entropy;
  }

  DK.register({
    id: 'password',
    title: '密码生成器',
    icon: '🔑',
    group: 'security',
    desc: '生成高强度随机密码，使用加密安全随机源',
    keywords: ['password', '密码', 'mima', '随机密码', '安全', '生成密码'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🔑 随机密码生成器</h2>
          <div class="output mono" id="pwdOut" style="font-size:16px; min-height:48px; display:flex; align-items:center; letter-spacing:1px;">点击下方按钮生成</div>
          <div class="strength-bar"><div class="strength-fill" id="strengthFill" style="width:0%"></div></div>
          <div class="strength-label" id="strengthLabel"></div>

          <label class="field-label">密码长度：<span id="lenVal">16</span></label>
          <input type="range" id="lenRange" min="6" max="64" value="16" style="width:100%; accent-color:var(--primary);">

          <div class="grid grid-2" style="margin-top:14px">
            <label class="checkbox-row"><input type="checkbox" id="optUpper" checked> 大写字母 A-Z</label>
            <label class="checkbox-row"><input type="checkbox" id="optLower" checked> 小写字母 a-z</label>
            <label class="checkbox-row"><input type="checkbox" id="optDigits" checked> 数字 0-9</label>
            <label class="checkbox-row"><input type="checkbox" id="optSymbols"> 特殊符号 !@#$…</label>
            <label class="checkbox-row"><input type="checkbox" id="optLookalikes"> 排除易混淆字符 (0/O, 1/l)</label>
            <label class="checkbox-row"><input type="checkbox" id="optBatch"> 批量生成 5 个</label>
          </div>

          <div class="btn-row">
            <button class="btn btn-primary" id="btnGen">🎲 生成密码</button>
            <button class="btn btn-ghost" id="btnCopy">📋 复制</button>
          </div>

          <div id="batchBox" style="margin-top:14px"></div>
          <div class="hint">密码使用窗口内置的加密安全随机数生成器（crypto.getRandomValues），全程离线，不会被发送或存储。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (id) => card.querySelector('#' + id);
      const opts = {
        get length() { return Number($('lenRange').value); },
        get upper() { return $('optUpper').checked; },
        get lower() { return $('optLower').checked; },
        get digits() { return $('optDigits').checked; },
        get symbols() { return $('optSymbols').checked; },
        get excludeLookalikes() { return $('optLookalikes').checked; }
      };

      function refreshStrength(pwd) {
        const e = entropyScore(pwd, opts);
        const fill = $('strengthFill');
        const label = $('strengthLabel');
        const pct = Math.min(100, (e / 100) * 100);
        fill.style.width = pct + '%';
        let text, color;
        if (e < 40) { text = '弱 · 容易被暴力破解'; color = 'var(--danger)'; }
        else if (e < 65) { text = '中等 · 一般账户可用'; color = 'var(--warning)'; }
        else if (e < 90) { text = '强 · 推荐'; color = 'var(--success)'; }
        else { text = '极强'; color = 'var(--success)'; }
        fill.style.background = color;
        label.textContent = text + '（熵值约 ' + Math.round(e) + ' bit）';
        label.style.color = color;
      }

      function doGenerate() {
        if (!opts.upper && !opts.lower && !opts.digits && !opts.symbols) {
          DK.toast('请至少选择一种字符类型', 'error');
          return;
        }
        const pwd = generate(opts);
        $('pwdOut').textContent = pwd;
        refreshStrength(pwd);

        const batchBox = $('batchBox');
        batchBox.innerHTML = '';
        if ($('optBatch').checked) {
          for (let i = 0; i < 5; i++) {
            const row = DK.el(`<div class="output mono copyable" style="margin-bottom:6px; letter-spacing:1px">${generate(opts)}</div>`);
            DK.bindCopy(row);
            batchBox.appendChild(row);
          }
        }
      }

      $('lenRange').addEventListener('input', () => {
        $('lenVal').textContent = $('lenRange').value;
        if ($('pwdOut').textContent !== '点击下方按钮生成') doGenerate();
      });
      $('btnGen').addEventListener('click', doGenerate);
      $('btnCopy').addEventListener('click', () => {
        const v = $('pwdOut').textContent;
        if (v && v !== '点击下方按钮生成') DK.copy(v);
      });
      ['optUpper', 'optLower', 'optDigits', 'optSymbols', 'optLookalikes'].forEach((id) => {
        $(id).addEventListener('change', () => {
          if ($('pwdOut').textContent !== '点击下方按钮生成') doGenerate();
        });
      });

      doGenerate();
    }
  });
})();
