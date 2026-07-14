// 認証（FR-23）: メール＋パスワード登録/ログイン、JWT 発行・検証ミドルウェア。
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.display_name },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

// Authorization: Bearer <token> を検証し req.user を設定する。
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証が必要です' } });
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'トークンが不正です' } });
  }
}

module.exports = { issueToken, requireAuth };
