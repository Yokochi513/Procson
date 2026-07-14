import { Router } from 'express';
import { findAllByUser } from '../messageRepository.js';

// history ルータ（設計書 2.3 / 5.2）: 匿名IDの会話履歴を時系列で返却（FR-6）
export const historyRouter = Router();

historyRouter.get('/api/history', (req, res) => {
  const userId = req.query.userId;

  // E-4: パラメータ不足
  if (typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({
      error: { code: 'INVALID_USER_ID', message: 'userId は必須です。' },
    });
  }

  try {
    const messages = findAllByUser(userId);
    return res.json({ messages });
  } catch (err) {
    // E-3: DB読み込み失敗
    console.error('[history] DB read error:', err);
    return res.status(500).json({
      error: { code: 'DB_ERROR', message: '履歴の読み込みに失敗しました。ページを再読み込みしてください。' },
    });
  }
});
