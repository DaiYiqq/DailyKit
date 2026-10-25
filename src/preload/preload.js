'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * 渲染进程唯一可访问的 API 白名单（contextBridge）。
 * 渲染进程不直接拥有 Node 能力，所有系统操作均经主进程 IPC 校验。
 */
contextBridge.exposeInMainWorld('dk', {
  /** 应用信息 */
  appInfo: () => ipcRenderer.invoke('app:info'),
  appIcon: () => ipcRenderer.invoke('app:iconDataUrl'),

  /** 首次启动引导 */
  finishOnboarding: () => ipcRenderer.invoke('onboarding:finish'),

  /** 用系统浏览器打开外部链接（仅允许 http/https） */
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  /** 二维码：返回 dataURL */
  qrGenerate: (text, size) => ipcRenderer.invoke('qr:generate', { text, size }),

  /** 哈希 */
  hashText: (algo, text) => ipcRenderer.invoke('hash:text', algo, text),
  hashFile: (algo) => ipcRenderer.invoke('hash:file', algo),

  /** 保存对话框 */
  saveImage: (dataUrl, name) => ipcRenderer.invoke('dialog:saveImage', dataUrl, name),
  saveText: (content, name, ext) => ipcRenderer.invoke('dialog:saveText', content, name, ext),

  /** 批量重命名 */
  renamerPickDir: () => ipcRenderer.invoke('renamer:pickDir'),
  renamerPreview: (options) => ipcRenderer.invoke('renamer:preview', options),
  renamerApply: (options) => ipcRenderer.invoke('renamer:apply', options),

  /** 图片选择（返回 base64） */
  pickImages: () => ipcRenderer.invoke('image:pick'),

  /** 事件订阅 */
  onBoot: (handler) => {
    const listener = (_evt, info) => handler(info);
    ipcRenderer.on('app:boot', listener);
    return () => ipcRenderer.removeListener('app:boot', listener);
  },
  onNavigate: (handler) => {
    const listener = (_evt, target) => handler(target);
    ipcRenderer.on('navigate', listener);
    return () => ipcRenderer.removeListener('navigate', listener);
  }
});
