/* 离屏捕获渲染页面，验证 UI 真实渲染结果（不依赖屏幕） */
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');

const projectRoot = path.join(__dirname, '..');

// Mock 主进程 IPC，使关于页等动态数据可完整渲染
ipcMain.handle('app:info', async () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  electron: process.versions.electron,
  node: process.versions.node
}));
ipcMain.handle('app:iconDataUrl', async () => {
  const iconPath = path.join(projectRoot, 'build', 'icon.png');
  const img = nativeImage.createFromPath(iconPath);
  if (img.isEmpty()) return null;
  return img.resize({ width: 128, height: 128 }).toDataURL();
});
const outDir = path.join(__dirname, 'captures');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const PAGES = [
  { id: 'dashboard', wait: 1000 },
  { id: 'password', wait: 1000 },
  { id: 'qrcode', wait: 1000 },
  { id: 'image-compress', wait: 700 },
  { id: 'json', wait: 700 },
  { id: 'textdiff', wait: 700 },
  { id: 'timestamp', wait: 700 },
  { id: 'unit', wait: 700 },
  { id: 'color', wait: 700 },
  { id: 'hash', wait: 700 },
  { id: 'base64', wait: 700 },
  { id: 'text-tools', wait: 700 },
  { id: 'pomodoro', wait: 700 },
  { id: 'about', wait: 1000 }
];

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let win = null;

app.whenReady().then(async () => {
  win = new BrowserWindow({
    width: 1180,
    height: 800,
    show: false,
    webPreferences: {
      preload: path.join(projectRoot, 'src', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.webContents.on('console-message', (evt) => {
    if (evt.level === 'error') console.log('[renderer error]', evt.message);
  });

  // 加载一次页面
  await win.loadFile(path.join(projectRoot, 'src', 'renderer', 'index.html'));
  await wait(1500);

  for (const page of PAGES) {
    await win.webContents.executeJavaScript(`location.hash = '#/${page.id}';`);
    await wait(page.wait);
    const bitmap = await win.webContents.capturePage();
    const file = path.join(outDir, page.id + '.png');
    fs.writeFileSync(file, bitmap.toPNG());
    console.log('captured:', page.id);
  }

  console.log('all captures done');
  app.exit(0);
});
