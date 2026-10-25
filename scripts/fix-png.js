/* 将实际为 JPEG 的图标源重新编码为真正的 PNG（macOS/Linux 图标需要） */
const path = require('path');
const fs = require('fs');
const { app, nativeImage } = require('electron');

const projectRoot = path.join(__dirname, '..');

app.whenReady().then(() => {
  const src = path.join(projectRoot, 'build', 'icon-source.png');
  const img = nativeImage.createFromPath(src);
  if (img.isEmpty()) {
    console.error('failed to load source image');
    app.exit(1);
    return;
  }
  const size = img.getSize();
  console.log('source size:', size.width, 'x', size.height);

  // 保存为真正的 PNG（保持原始 2048x2048）
  fs.writeFileSync(path.join(projectRoot, 'build', 'icon.png'), img.toPNG());
  console.log('written build/icon.png as real PNG');

  // 额外生成 512 和 256 的 PNG（Linux 图标常用）
  fs.writeFileSync(
    path.join(projectRoot, 'build', 'icon-512.png'),
    img.resize({ width: 512, height: 512 }).toPNG()
  );
  fs.writeFileSync(
    path.join(projectRoot, 'build', 'icon-256.png'),
    img.resize({ width: 256, height: 256 }).toPNG()
  );
  console.log('written icon-512.png and icon-256.png');

  app.exit(0);
});
