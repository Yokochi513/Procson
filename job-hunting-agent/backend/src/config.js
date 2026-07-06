import 'dotenv/config';

// 設計書 10章の前提値（P-1, P-2, P-5）を既定値として持つ設定
export const config = {
  port: Number(process.env.PORT ?? 3000),
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 30000), // P-5
  maxMessageLen: Number(process.env.MAX_MESSAGE_LEN ?? 2000), // P-1
  historyN: Number(process.env.HISTORY_N ?? 20), // P-2
  dbFile: process.env.DB_FILE ?? 'data/app.db',
};
