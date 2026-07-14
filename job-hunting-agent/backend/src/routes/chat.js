import { Router } from 'express';
import { config } from '../config.js';
import { generateReply, GeminiError } from '../geminiClient.js';
import { saveExchange, findRecentByUser } from '../messageRepository.js';

// chat ルータ（設計書 2.3 / 5.2）: 履歴取得 → Gemini 呼び出し → 保存 → 応答返却
export const chatRouter = Router();

chatRouter.post('/api/chat', async (req, res) => {
  const { userId, message, profile } = req.body ?? {};

  // E-1 / E-4: 入力バリデーション
  if (typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({
      error: { code: 'INVALID_USER_ID', message: 'userId は必須です。' },
    });
  }
  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: { code: 'EMPTY_MESSAGE', message: 'メッセージを入力してください。' },
    });
  }
  if (message.length > config.maxMessageLen) {
    return res.status(400).json({
      error: {
        code: 'MESSAGE_TOO_LONG',
        message: `メッセージは${config.maxMessageLen}文字以内で入力してください。`,
      },
    });
  }

  let history;
  try {
    history = findRecentByUser(userId, config.historyN);
  } catch (err) {
    console.error('[chat] DB read error:', err);
    return res.status(500).json({
      error: { code: 'DB_ERROR', message: '履歴の読み込みに失敗しました。再送信してください。' },
    });
  }

  let reply;
  try {
    reply = await generateReply({ history, message, profile });
  } catch (err) {
    // E-2: Gemini 失敗/タイムアウト。P-4 によりこの場合メッセージは保存しない。
    if (err instanceof GeminiError) {
      console.error(`[chat] Gemini failure: ${err.code}`);
      return res.status(err.status).json({
        error: { code: err.code, message: err.message },
      });
    }
    console.error('[chat] unexpected error:', err);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'サーバでエラーが発生しました。再送信してください。' },
    });
  }

  // FR-5: ユーザー発話とAI応答を保存
  try {
    saveExchange(userId, message, reply);
  } catch (err) {
    // E-3: DB書き込み失敗
    console.error('[chat] DB write error:', err);
    return res.status(500).json({
      error: { code: 'DB_ERROR', message: '履歴の保存に失敗しました。再送信してください。' },
    });
  }

  return res.json({ reply });
});
