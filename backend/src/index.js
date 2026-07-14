// シェアルバム MVP バックエンド エントリポイント
// 認証(FR-23) / アルバムCRUD(FR-1〜3) / 写真アップロード・整理(FR-4,5)
const express = require('express');
const cors = require('cors');
const path = require('path');
const { port, storageDir } = require('./config');

require('./db'); // スキーマ初期化

const app = express();
app.use(cors());
app.use(express.json());

// 写真実体の配信（ローカルFS）
app.use('/storage', express.static(storageDir));

// API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/albums', require('./routes/albumRoutes'));
app.use('/api', require('./routes/photoRoutes')); // /albums/:id/photos, /photos/:id

app.get('/api/health', (req, res) => res.json({ ok: true }));

// 共通エラー形式 { error: { code, message } }
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'サーバーエラーが発生しました' } });
});

app.listen(port, () => {
  console.log(`[sharealbum] backend listening on http://localhost:${port}`);
});
