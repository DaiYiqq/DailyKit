'use strict';

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  Menu,
  nativeImage
} = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');
const QRCode = require('qrcode');

const isDev = !app.isPackaged && process.env.DAILYKIT_DEV === '1';

/** 单实例锁，避免重复打开多个窗口 */
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

/** 用户配置文件（首次启动标记等） */
function configPath() {
  return path.join(app.getPath('userData'), 'config.json');
}

async function readConfig() {
  try {
    const raw = await fsp.readFile(configPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeConfig(cfg) {
  await fsp.writeFile(configPath(), JSON.stringify(cfg, null, 2), 'utf8');
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    title: 'DailyKit 百宝工具箱',
    backgroundColor: '#0f172a',
    icon: getIconPath(),
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'))
    .then(() => console.log('[DailyKit] page loaded'))
    .catch((e) => console.error('[DailyKit] load failed:', e));

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow.isVisible()) mainWindow.show();
  });
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, failedUrl) => {
    console.error('[DailyKit] did-fail-load:', code, desc, failedUrl);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 所有 window.open / target=_blank 交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getIconPath() {
  const base = path.join(__dirname, '..', '..', 'build');
  if (process.platform === 'win32') return path.join(base, 'icon.ico');
  return path.join(base, 'icon.png');
}

function buildMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '项目主页 / GitHub',
          click: () => shell.openExternal('https://github.com/DaiYiqq/DailyKit')
        },
        {
          label: '问题反馈',
          click: () => shell.openExternal('https://github.com/DaiYiqq/DailyKit/issues')
        },
        { type: 'separator' },
        {
          label: '关于 DailyKit',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('navigate', 'about');
          }
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------------- 应用生命周期 ---------------- */

app.whenReady().then(async () => {
  const cfg = await readConfig();
  const firstRun = !cfg.onboarded;
  app.dkFirstRun = firstRun;

  buildMenu();
  createWindow();

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('app:boot', {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      electron: process.versions.electron,
      firstRun,
      node: process.versions.node
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/* ---------------- IPC：应用信息 ---------------- */

ipcMain.handle('app:info', async () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  electron: process.versions.electron,
  node: process.versions.node
}));

ipcMain.handle('onboarding:finish', async () => {
  const cfg = await readConfig();
  cfg.onboarded = true;
  cfg.onboardedAt = new Date().toISOString();
  await writeConfig(cfg);
  return true;
});

ipcMain.handle('shell:openExternal', async (_evt, url) => {
  if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

/* ---------------- IPC：二维码 ---------------- */

ipcMain.handle('qr:generate', async (_evt, payload) => {
  const text = String(payload && payload.text != null ? payload.text : '');
  const size = Math.min(1024, Math.max(128, Number(payload && payload.size) || 320));
  if (!text) throw new Error('二维码内容不能为空');
  const dataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' }
  });
  return dataUrl;
});

/* ---------------- IPC：哈希 ---------------- */

ipcMain.handle('hash:text', async (_evt, algo, text) => {
  const algorithm = normalizeAlgo(algo);
  return crypto.createHash(algorithm).update(String(text), 'utf8').digest('hex');
});

ipcMain.handle('hash:file', async (_evt, algo) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要计算哈希的文件',
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };
  const file = result.filePaths[0];
  const algorithm = normalizeAlgo(algo);
  const hash = await hashFile(file, algorithm);
  const stat = await fsp.stat(file);
  return { canceled: false, file, hash, algo: algorithm, size: stat.size };
});

function normalizeAlgo(algo) {
  const allowed = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha512_256', 'sha3_256', 'sha3_512'];
  const a = String(algo || 'sha256').toLowerCase().replace('-', '');
  if (!allowed.includes(a)) throw new Error('不支持的哈希算法: ' + algo);
  return a;
}

function hashFile(file, algorithm) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(file);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/* ---------------- IPC：文件保存 ---------------- */

ipcMain.handle('dialog:saveImage', async (_evt, dataUrl, defaultName) => {
  const matches = /^data:image\/(png|jpeg|jpg|webp);base64,(.*)$/s.exec(dataUrl);
  if (!matches) throw new Error('图片数据格式不正确');
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const name = defaultName || `dailykit-${Date.now()}.${ext}`;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存图片',
    defaultPath: name,
    filters: [
      { name: '图片', extensions: [ext] }
    ]
  });
  if (result.canceled) return { canceled: true };
  await fsp.writeFile(result.filePath, buffer);
  return { canceled: false, path: result.filePath };
});

ipcMain.handle('dialog:saveText', async (_evt, content, defaultName, ext) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存文件',
    defaultPath: defaultName || `dailykit-${Date.now()}.${ext || 'txt'}`,
    filters: [
      { name: '文件', extensions: [ext || 'txt'] }
    ]
  });
  if (result.canceled) return { canceled: true };
  await fsp.writeFile(result.filePath, String(content), 'utf8');
  return { canceled: false, path: result.filePath };
});

/* ---------------- IPC：批量重命名 ---------------- */

ipcMain.handle('renamer:preview', async (_evt, options) => {
  const dir = String(options && options.dir ? options.dir : '');
  const files = await fsp.readdir(dir, { withFileTypes: true });
  const names = files.filter((f) => f.isFile()).map((f) => f.name);
  return names.map((name, index) => ({
    index,
    from: name,
    to: computeNewName(name, index, options)
  }));
});

ipcMain.handle('renamer:pickDir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要批量重命名的文件夹',
    properties: ['openDirectory']
  });
  if (result.canceled) return { canceled: true };
  return { canceled: false, dir: result.filePaths[0] };
});

ipcMain.handle('renamer:apply', async (_evt, options) => {
  const dir = String(options && options.dir ? options.dir : '');
  if (!dir) throw new Error('未选择文件夹');
  const files = await fsp.readdir(dir, { withFileTypes: true });
  const plan = files
    .filter((f) => f.isFile())
    .map((f, index) => ({ from: f.name, to: computeNewName(f.name, index, options) }))
    .filter((p) => p.to && p.to !== p.from);

  // 冲突检测
  const targets = new Set();
  for (const p of plan) {
    if (targets.has(p.to.toLowerCase())) {
      throw new Error(`目标文件名冲突：${p.to}`);
    }
    targets.add(p.to.toLowerCase());
  }

  // 两阶段重命名，避免互相覆盖
  const tempPlan = [];
  for (const p of plan) {
    const tmp = `.dk_tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${p.to}`;
    await fsp.rename(path.join(dir, p.from), path.join(dir, tmp));
    tempPlan.push({ tmp, to: p.to });
  }
  for (const p of tempPlan) {
    await fsp.rename(path.join(dir, p.tmp), path.join(dir, p.to));
  }
  return { renamed: plan.length };
});

function computeNewName(name, index, options) {
  const extDot = name.lastIndexOf('.');
  const base = extDot > 0 ? name.slice(0, extDot) : name;
  const ext = extDot > 0 ? name.slice(extDot) : '';
  let out = base;

  const find = String(options.find || '');
  const replace = String(options.replace || '');
  if (find) {
    try {
      if (options.useRegex) {
        const flags = options.ignoreCase ? 'gi' : 'g';
        out = out.replace(new RegExp(find, flags), replace);
      } else {
        out = options.ignoreCase
          ? out.split(find.toLowerCase()).join(replace)
          : out.split(find).join(replace);
      }
    } catch {
      return name;
    }
  }

  if (options.prefix) out = String(options.prefix) + out;
  if (options.suffix) out = out + String(options.suffix);

  if (options.numbered) {
    const start = Number(options.startNumber) || 0;
    const digits = Math.max(1, Number(options.digits) || 3);
    const num = String(start + index).padStart(digits, '0');
    const mode = options.numberMode || 'suffix';
    out = mode === 'prefix' ? `${num}_${out}` : `${out}_${num}`;
  }

  if (options.toLower) out = out.toLowerCase();
  if (options.toUpper) out = out.toUpperCase();
  if (options.trim) out = out.replace(/\s+/g, ' ').trim();

  return out + (options.keepExt === false ? '' : ext);
}

/* ---------------- IPC：图片压缩（选文件，返回 base64） ---------------- */

ipcMain.handle('image:pick', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要压缩的图片',
    filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp'] }],
    properties: ['openFile', 'multiSelections']
  });
  if (result.canceled) return { canceled: true, images: [] };
  const images = [];
  for (const file of result.filePaths) {
    const data = await fsp.readFile(file);
    images.push({
      name: path.basename(file),
      dataUrl: 'data:image/' + guessMime(file) + ';base64,' + data.toString('base64'),
      size: data.length
    });
  }
  return { canceled: false, images };
});

function guessMime(file) {
  const lower = file.toLowerCase();
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.webp')) return 'webp';
  if (lower.endsWith('.bmp')) return 'bmp';
  return 'jpeg';
}

/* ---------------- IPC：应用图标（关于页用） ---------------- */

ipcMain.handle('app:iconDataUrl', async () => {
  const img = nativeImage.createFromPath(getIconPath());
  if (img.isEmpty()) return null;
  return img.resize({ width: 128, height: 128 }).toDataURL();
});
