// アルバムAPI（FR-1〜3）: 作成・一覧・編集・削除
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { requireAuth } = require('../auth');
const { storageDir } = require('../config');

const router = express.Router();
router.use(requireAuth);

// アルバム1件を所有者チェック付きで取得するヘルパ
function getOwnedAlbum(albumId, userId) {
  return db.prepare('SELECT * FROM albums WHERE id = ? AND owner_id = ?').get(albumId, userId);
}

// カバー写真URL等を付与した表示用オブジェクトへ整形
function toDto(album) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM photos WHERE album_id = ?').get(album.id).c;
  let coverPath = null;
  if (album.cover_photo_id) {
    const cover = db.prepare('SELECT storage_path FROM photos WHERE id = ?').get(album.cover_photo_id);
    coverPath = cover ? cover.storage_path : null;
  }
  return {
    id: album.id,
    name: album.name,
    eventDate: album.event_date,
    description: album.description,
    coverPhotoId: album.cover_photo_id,
    coverUrl: coverPath ? `/storage/${coverPath}` : null,
    photoCount: count,
    createdAt: album.created_at,
    updatedAt: album.updated_at,
  };
}

// GET /api/albums 一覧（自分がオーナーのアルバム）
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM albums WHERE owner_id = ? ORDER BY datetime(updated_at) DESC')
    .all(req.user.id);
  res.json({ albums: rows.map(toDto) });
});

// POST /api/albums 作成（FR-1）
router.post('/', (req, res) => {
  const { name, eventDate, description } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'イベント名は必須です' } });
  }
  const info = db
    .prepare('INSERT INTO albums (owner_id, name, event_date, description) VALUES (?, ?, ?, ?)')
    .run(req.user.id, name.trim(), eventDate || null, description || null);
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ album: toDto(album) });
});

// GET /api/albums/:id 単体取得
router.get('/:id', (req, res) => {
  const album = getOwnedAlbum(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'アルバムが見つかりません' } });
  res.json({ album: toDto(album) });
});

// PATCH /api/albums/:id 編集（FR-2）
router.patch('/:id', (req, res) => {
  const album = getOwnedAlbum(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'アルバムが見つかりません' } });
  const { name, eventDate, description, coverPhotoId } = req.body || {};
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'イベント名は空にできません' } });
  }
  db.prepare(
    `UPDATE albums SET
       name = COALESCE(?, name),
       event_date = COALESCE(?, event_date),
       description = COALESCE(?, description),
       cover_photo_id = COALESCE(?, cover_photo_id),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    name !== undefined ? String(name).trim() : null,
    eventDate ?? null,
    description ?? null,
    coverPhotoId ?? null,
    album.id
  );
  const updated = db.prepare('SELECT * FROM albums WHERE id = ?').get(album.id);
  res.json({ album: toDto(updated) });
});

// DELETE /api/albums/:id 削除（FR-3）: 配下写真の実体も削除
router.delete('/:id', (req, res) => {
  const album = getOwnedAlbum(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'アルバムが見つかりません' } });
  const photos = db.prepare('SELECT storage_path FROM photos WHERE album_id = ?').all(album.id);
  db.prepare('DELETE FROM albums WHERE id = ?').run(album.id); // photos は ON DELETE CASCADE
  // ストレージ実体を削除
  for (const p of photos) {
    const abs = path.join(storageDir, p.storage_path);
    fs.rm(abs, { force: true }, () => {});
  }
  res.json({ deleted: true });
});

module.exports = router;
