// 写真API（FR-4 アップロード, FR-5 整理/一覧/削除）
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { requireAuth } = require('../auth');
const { storageDir, maxPhotoSize, maxPhotosPerAlbum } = require('../config');

// このルータは /api 直下にマウントされるため、blanket な router.use(requireAuth)
// にすると /api/health など他ルートまで巻き込む。認証は各ルートに個別付与する。
const router = express.Router();

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']);

// アルバム別ディレクトリへ保存する multer 設定
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(storageDir, `album_${req.params.id}`);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: maxPhotoSize },
  fileFilter(req, file, cb) {
    cb(null, ALLOWED.has(file.mimetype));
  },
});

function getOwnedAlbum(albumId, userId) {
  return db.prepare('SELECT * FROM albums WHERE id = ? AND owner_id = ?').get(albumId, userId);
}

function photoDto(p) {
  return {
    id: p.id,
    albumId: p.album_id,
    url: `/storage/${p.storage_path}`,
    originalName: p.original_name,
    sortOrder: p.sort_order,
    isCover: !!p.is_cover,
    uploadedAt: p.uploaded_at,
  };
}

// POST /api/albums/:id/photos 複数アップロード（FR-4）
router.post('/albums/:id/photos', requireAuth, (req, res) => {
  const album = getOwnedAlbum(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'アルバムが見つかりません' } });

  const current = db.prepare('SELECT COUNT(*) AS c FROM photos WHERE album_id = ?').get(album.id).c;

  upload.array('files', 50)(req, res, (err) => {
    if (err) {
      const cleanup = () => (req.files || []).forEach((f) => fs.rm(f.path, { force: true }, () => {}));
      cleanup();
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: { code: 'FILE_TOO_LARGE', message: `1枚あたり ${Math.round(maxPhotoSize / 1024 / 1024)}MB までです` } });
      }
      return res.status(400).json({ error: { code: 'UPLOAD_FAILED', message: 'アップロードに失敗しました' } });
    }
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: '対応形式(JPEG/PNG/HEIC/WebP)の画像を選択してください' } });
    }
    if (current + files.length > maxPhotosPerAlbum) {
      files.forEach((f) => fs.rm(f.path, { force: true }, () => {}));
      return res.status(413).json({ error: { code: 'ALBUM_FULL', message: `1アルバムの上限(${maxPhotosPerAlbum}枚)を超えます` } });
    }

    const insert = db.prepare(
      `INSERT INTO photos (album_id, uploader_id, storage_path, original_name, mime_type, size_bytes, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const uploaded = [];
    let order = current;
    const tx = db.transaction(() => {
      for (const f of files) {
        const rel = path.relative(storageDir, f.path);
        const info = insert.run(album.id, req.user.id, rel, f.originalname, f.mimetype, f.size, order++);
        uploaded.push(photoDto(db.prepare('SELECT * FROM photos WHERE id = ?').get(info.lastInsertRowid)));
      }
      db.prepare('UPDATE albums SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(album.id);
    });
    tx();
    res.status(201).json({ uploaded });
  });
});

// GET /api/albums/:id/photos 一覧（FR-5,9）: sort=taken|added（MVPは追加順/手動順）
router.get('/albums/:id/photos', requireAuth, (req, res) => {
  const album = getOwnedAlbum(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'アルバムが見つかりません' } });
  const rows = db
    .prepare('SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC')
    .all(album.id);
  res.json({ photos: rows.map(photoDto) });
});

// 写真の所有アルバムを取得
function getPhotoOwned(photoId, userId) {
  return db
    .prepare(
      `SELECT p.* FROM photos p
       JOIN albums a ON a.id = p.album_id
       WHERE p.id = ? AND a.owner_id = ?`
    )
    .get(photoId, userId);
}

// PATCH /api/photos/:id 整理: カバー指定・並び順（FR-5）
router.patch('/photos/:id', requireAuth, (req, res) => {
  const photo = getPhotoOwned(req.params.id, req.user.id);
  if (!photo) return res.status(404).json({ error: { code: 'NOT_FOUND', message: '写真が見つかりません' } });
  const { isCover, sortOrder } = req.body || {};
  const tx = db.transaction(() => {
    if (isCover === true) {
      db.prepare('UPDATE photos SET is_cover = 0 WHERE album_id = ?').run(photo.album_id);
      db.prepare('UPDATE photos SET is_cover = 1 WHERE id = ?').run(photo.id);
      db.prepare('UPDATE albums SET cover_photo_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(photo.id, photo.album_id);
    }
    if (typeof sortOrder === 'number') {
      db.prepare('UPDATE photos SET sort_order = ? WHERE id = ?').run(sortOrder, photo.id);
    }
  });
  tx();
  res.json({ photo: photoDto(getPhotoOwned(photo.id, req.user.id)) });
});

// DELETE /api/photos/:id 削除（FR-5）
router.delete('/photos/:id', requireAuth, (req, res) => {
  const photo = getPhotoOwned(req.params.id, req.user.id);
  if (!photo) return res.status(404).json({ error: { code: 'NOT_FOUND', message: '写真が見つかりません' } });
  db.prepare('DELETE FROM photos WHERE id = ?').run(photo.id);
  if (photo.is_cover) {
    db.prepare('UPDATE albums SET cover_photo_id = NULL WHERE id = ?').run(photo.album_id);
  }
  fs.rm(path.join(storageDir, photo.storage_path), { force: true }, () => {});
  res.json({ deleted: true });
});

module.exports = router;
