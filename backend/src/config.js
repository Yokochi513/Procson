// 環境変数の読み込みと既定値。APIキー等は .env で管理し、リポジトリに含めない（NFR-2）。
const path = require('path');

// .env があれば読み込む（依存を増やさない簡易パーサ）
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  maxPhotosPerAlbum: parseInt(process.env.MAX_PHOTOS_PER_ALBUM || '500', 10),
  maxPhotoSize: parseInt(process.env.MAX_PHOTO_SIZE || String(15 * 1024 * 1024), 10),
  storageDir: path.join(__dirname, '..', 'storage'),
  dbFile: path.join(__dirname, '..', 'data.sqlite'),
};
