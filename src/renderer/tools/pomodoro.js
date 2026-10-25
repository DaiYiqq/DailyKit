/* 番茄钟：专注 / 短休息 / 长休息循环 */
(function () {
  'use strict';

  const STATES = {
    focus: { label: '专注中', default: 25 },
    short: { label: '短休息', default: 5 },
    long: { label: '长休息', default: 15 }
  };

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch { /* 忽略 */ }
  }

  DK.register({
    id: 'pomodoro',
    title: '番茄钟',
    icon: '🍅',
    group: 'life',
    desc: '25 分钟专注 + 5 分钟休息，提升专注力',
    keywords: ['pomodoro', '番茄钟', 'fanqie', '专注', 'zhuanzhu', '计时', '效率', '番茄'],

    render(container) {
      const card = DK.el(`
        <div class="card">
          <h2>🍅 番茄工作法计时器</h2>
          <div class="pomodoro-wrap">
            <div class="pomodoro-state" id="stateLabel">准备开始</div>
            <div class="pomodoro-time" id="timeDisplay">25:00</div>

            <div class="btn-row" style="justify-content:center">
              <button class="btn btn-primary" id="btnStart" style="min-width:110px">▶ 开始</button>
              <button class="btn btn-ghost" id="btnReset">↺ 重置</button>
              <button class="btn btn-ghost" id="btnSkip">⏭ 跳过当前阶段</button>
            </div>

            <div class="hint" style="margin-top:18px">今日完成的番茄</div>
            <div class="pomodoro-dots" id="dots"></div>
          </div>

          <div class="grid grid-3" style="margin-top:20px">
            <div>
              <label class="field-label">专注时长（分钟）</label>
              <input type="number" id="focusMin" value="25" min="1" max="90">
            </div>
            <div>
              <label class="field-label">短休息（分钟）</label>
              <input type="number" id="shortMin" value="5" min="1" max="30">
            </div>
            <div>
              <label class="field-label">长休息（分钟）</label>
              <input type="number" id="longMin" value="15" min="1" max="60">
            </div>
          </div>
          <div class="hint">每完成 4 个专注番茄，自动进入一次长休息。阶段结束时有提示音，无需联网。</div>
        </div>
      `);
      container.appendChild(card);

      const $ = (s) => card.querySelector(s);

      let state = 'focus';
      let remaining = 25 * 60;
      let running = false;
      let timer = null;
      let completed = 0;

      function durationFor(s) {
        const map = { focus: 'focusMin', short: 'shortMin', long: 'longMin' };
        return Math.max(1, Number($('#' + map[s]).value) || STATES[s].default) * 60;
      }

      function render() {
        const m = Math.floor(remaining / 60);
        const sec = remaining % 60;
        $('#timeDisplay').textContent = String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
        $('#stateLabel').textContent = (running ? '' : '已暂停 · ') + STATES[state].label;
        $('#btnStart').textContent = running ? '⏸ 暂停' : '▶ 开始';
        $('#dots').innerHTML = Array.from({ length: Math.max(4, completed) }, (_, i) =>
          `<div class="pomodoro-dot ${i < completed ? 'done' : ''}"></div>`
        ).join('');
      }

      function tick() {
        remaining--;
        if (remaining <= 0) {
          advance();
        }
        render();
      }

      function advance() {
        beep();
        if (state === 'focus') {
          completed++;
          state = (completed % 4 === 0) ? 'long' : 'short';
        } else {
          state = 'focus';
        }
        remaining = durationFor(state);
      }

      $('#btnStart').addEventListener('click', () => {
        running = !running;
        if (running) {
          timer = setInterval(tick, 1000);
        } else {
          clearInterval(timer);
        }
        render();
      });

      $('#btnReset').addEventListener('click', () => {
        running = false;
        clearInterval(timer);
        remaining = durationFor(state);
        render();
      });

      $('#btnSkip').addEventListener('click', () => {
        advance();
        render();
      });

      ['focusMin', 'shortMin', 'longMin'].forEach((id) => {
        $('#' + id).addEventListener('change', () => {
          if (!running) {
            remaining = durationFor(state);
            render();
          }
        });
      });

      render();
      this._cleanup = () => { clearInterval(timer); };
    },

    unmount() {
      if (this._cleanup) this._cleanup();
    }
  });
})();
