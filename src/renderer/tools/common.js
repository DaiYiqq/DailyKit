/* 通用辅助：工具注册、DOM、toast、剪贴板 */
(function () {
  'use strict';

  const DK = {
    tools: [],
    bootInfo: null,

    register(tool) {
      this.tools.push(tool);
    },

    get(id) {
      return this.tools.find((t) => t.id === id) || null;
    },

    /** 创建 DOM 元素，html 为模板字符串 */
    el(html) {
      const wrap = document.createElement('template');
      wrap.innerHTML = String(html).trim();
      return wrap.content.firstElementChild;
    },

    /** 从事件委托元素中查询 */
    qs(scope, selector) {
      return scope.querySelector(selector);
    },

    toast(message, type) {
      const node = document.getElementById('toast');
      node.textContent = message;
      node.className = 'toast ' + (type || '');
      clearTimeout(node._timer);
      node._timer = setTimeout(() => node.classList.add('hidden'), 2200);
    },

    async copy(text) {
      try {
        await navigator.clipboard.writeText(String(text));
        this.toast('已复制到剪贴板', 'success');
        return true;
      } catch {
        // 兜底
        const ta = document.createElement('textarea');
        ta.value = String(text);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        this.toast('已复制到剪贴板', 'success');
        return true;
      }
    },

    formatBytes(bytes) {
      if (bytes == null || isNaN(bytes)) return '-';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let n = Number(bytes);
      let i = 0;
      while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
      return n.toFixed(i === 0 ? 0 : 2) + ' ' + units[i];
    },

    /** 为输出元素绑定点击复制 */
    bindCopy(node, getValue) {
      node.classList.add('copyable');
      node.title = '点击复制';
      node.addEventListener('click', () => {
        const v = getValue ? getValue() : node.textContent;
        if (v) DK.copy(v);
      });
    }
  };

  window.DK = DK;
})();
