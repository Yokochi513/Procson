import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { chatRouter } from './routes/chat.js';
import { historyRouter } from './routes/history.js';

const app = express();

app.use(cors()); // ローカル開発用（FE: localhost:4200 → BE: localhost:3000）
app.use(express.json());

app.use(chatRouter);
app.use(historyRouter);

if (!config.geminiApiKey) {
  console.warn(
    '[server] GEMINI_API_KEY が設定されていません。backend/.env に設定してください（.env.example 参照）。'
  );
}

app.listen(config.port, () => {
  console.log(`[server] 就活提案エージェント BE: http://localhost:${config.port}`);
});
