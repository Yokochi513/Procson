// 認証API（FR-23）: POST /api/auth/register, POST /api/auth/login
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { issueToken } = require('../auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ユーザー登録
router.post('/register', (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'メールアドレスが不正です' } });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'パスワードは6文字以上で入力してください' } });
  }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'このメールアドレスは登録済みです' } });
  }
  const hash = bcrypt.hashSync(password, 10);
  const name = (displayName && displayName.trim()) || email.split('@')[0];
  const info = db
    .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
    .run(email, hash, name);
  const user = { id: info.lastInsertRowid, email, display_name: name };
  return res.status(201).json({ token: issueToken(user), user: { id: user.id, email, displayName: name } });
});

// ログイン
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = email ? db.prepare('SELECT * FROM users WHERE email = ?').get(email) : null;
  if (!user || !user.password_hash || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: { code: 'BAD_CREDENTIALS', message: 'メールまたはパスワードが違います' } });
  }
  return res.json({
    token: issueToken(user),
    user: { id: user.id, email: user.email, displayName: user.display_name },
  });
});

module.exports = router;
