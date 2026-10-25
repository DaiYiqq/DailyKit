/* 从 build/icon.png 生成多尺寸 Windows icon.ico */
const path = require('path');
const fs = require('fs');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;
const { app, nativeImage } = require('electron');

async function run() {
  const buildDir = path.join(__dirname, '..', 'build');
  const src = nativeImage.createFromPath(path.join(buildDir, 'icon.png'));
  if (src.isEmpty()) throw new Error('无法读取 build/icon.png');

  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const bufs = sizes.map((s) => {
    const resized = src.resize({ width: s, height: s, quality: 'best' });
    return resized.toPNG();
  });

  const ico = await pngToIco(bufs);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);
  console.log('✓ build/icon.ico written, sizes:', sizes.join(', '));
}

app.whenReady().then(() => {
  run()
    .then(() => app.exit(0))
    .catch((e) => {
      console.error(e);
      app.exit(1);
    });
});
