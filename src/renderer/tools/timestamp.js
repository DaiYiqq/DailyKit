/* 时间戳转换 */
(function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDate(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function toLocalInput(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  DK.register({
    id: 'timestamp',
    title: '时间戳转换',
    icon: '🕐',
    group: 'life',
    desc: 'Unix 时间戳与日期互转，支持秒/毫秒',
    keywords: ['timestamp', '时间戳', 'shijianchuo', 'unix', '时间转换', 'utc'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🕐 时间戳转换工具</h2>

          <div class="grid grid-2">
            <div class="output" style="text-align:center">
              <div class="hint">当前 Unix 时间戳（秒）</div>
              <div style="font-size:26px; margin:6px 0" class="copyable" id="nowSec">-</div>
              <div class="hint" id="nowMs">毫秒：-</div>
            </div>
            <div class="output" style="text-align:center">
              <div class="hint">当前本地时间</div>
              <div style="font-size:20px; margin:10px 0" id="nowLocal">-</div>
              <div class="hint" id="nowUtc">UTC：-</div>
            </div>
          </div>

          <h3>时间戳 → 日期</h3>
          <div class="grid grid-2">
            <input type="text" id="tsInput" placeholder="输入 10 位秒或 13 位毫秒时间戳">
            <div class="output" id="tsResult">转换结果</div>
          </div>

          <h3>日期 → 时间戳</h3>
          <div class="grid grid-2">
            <input type="datetime-local" id="dateInput" step="1">
            <div class="output" id="dateResult">转换结果</div>
          </div>

          <div class="btn-row">
            <button class="btn btn-primary" id="btnTsConvert">时间戳转日期</button>
            <button class="btn btn-ghost" id="btnDateConvert">日期转时间戳</button>
            <button class="btn btn-ghost" id="btnNow">填入当前时间</button>
          </div>
          <div class="hint">10 位数字按「秒」解析，13 位按「毫秒」解析。点击当前时间戳可直接复制。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      function tick() {
        const now = new Date();
        const ms = now.getTime();
        $('#nowSec').textContent = Math.floor(ms / 1000);
        $('#nowMs').textContent = '毫秒：' + ms;
        $('#nowLocal').textContent = formatDate(now);
        $('#nowUtc').textContent = 'UTC：' + now.toUTCString();
      }
      const timer = setInterval(tick, 1000);
      this._timer = timer;
      tick();

      DK.bindCopy($('#nowSec'));

      $('#btnTsConvert').addEventListener('click', () => {
        const raw = $('#tsInput').value.trim();
        if (!/^\d{10,13}$/.test(raw)) {
          $('#tsResult').className = 'output err';
          $('#tsResult').textContent = '请输入 10 位（秒）或 13 位（毫秒）数字';
          return;
        }
        let ms = Number(raw);
        if (raw.length === 10) ms *= 1000;
        const d = new Date(ms);
        if (isNaN(d.getTime())) {
          $('#tsResult').className = 'output err';
          $('#tsResult').textContent = '无效时间戳';
          return;
        }
        $('#tsResult').className = 'output ok';
        $('#tsResult').textContent = `本地：${formatDate(d)}\nUTC ：${d.toUTCString()}\nISO ：${d.toISOString()}\n星期：${['日','一','二','三','四','五','六'][d.getDay()]}`;
      });

      $('#btnDateConvert').addEventListener('click', () => {
        const v = $('#dateInput').value;
        if (!v) {
          $('#dateResult').className = 'output err';
          $('#dateResult').textContent = '请选择日期时间';
          return;
        }
        const d = new Date(v);
        const ms = d.getTime();
        $('#dateResult').className = 'output ok';
        $('#dateResult').textContent = `秒：${Math.floor(ms / 1000)}\n毫秒：${ms}\nUTC：${d.toUTCString()}`;
      });

      $('#btnNow').addEventListener('click', () => {
        $('#dateInput').value = toLocalInput(new Date());
      });

      $('#dateInput').value = toLocalInput(new Date());
    },

    unmount() {
      // 定时器在闭包中，通过实例清理
      if (this._timer) clearInterval(this._timer);
    }
  });
})();
