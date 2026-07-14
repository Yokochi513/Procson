// SQLite 初期化とスキーマ定義（基本設計書 6章準拠）。
// MVPは SQLite + ローカルFS。将来 PostgreSQL へ差し替え可能なように、
// アクセスはこのモジュール経由に寄せる。
const Database = require('better-sqlite3');
const { dbFile } = require('./config');

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  -- users（FR-23）
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE,
    password_hash TEXT,
    display_name  TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- albums（FR-1,2,3）
  CREATE TABLE IF NOT EXISTS albums (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,
    event_date     DATE,
    description    TEXT,
    cover_photo_id INTEGER,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- photos（FR-4,5,8）
  CREATE TABLE IF NOT EXISTS photos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id     INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    uploader_id  INTEGER NOT NULL REFERENCES users(id),
    storage_path TEXT NOT NULL,
    original_name TEXT,
    mime_type    TEXT,
    size_bytes   INTEGER,
    sort_order   INTEGER DEFAULT 0,
    is_cover     INTEGER DEFAULT 0,
    uploaded_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_albums_owner ON albums(owner_id);
  CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
`);

module.exports = db;
