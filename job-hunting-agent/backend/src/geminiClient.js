import { config } from './config.js';

// GeminiClient（設計書 2.3）: プロンプト組み立てと Gemini API 呼び出し、
// タイムアウト/失敗ハンドリング（FR-3, FR-8, NFR-3）

// 会話の振る舞い方針（設計書 3.2 FR-3 / 要件定義書 4.1）
const SYSTEM_PROMPT = `あなたは岡山県内の就活生を支える就活相談チャットの相談員です。

- 就活相談を主目的としますが、就活以外の話題（雑談を含む）にも自由に応じてください。
- 「正解を一方的に出す」のではなく、相手のプロフィールとこれまでの会話を踏まえて、寄り添って一緒に考える姿勢で応答してください。
- トーンは丁寧かつ親しみやすい日本語。学生を励まし、具体的な次の一歩を提案してください。
- 相手に深刻な精神的不調がうかがえる場合は、無理に踏み込まず、公的相談窓口（例: こころの健康相談統一ダイヤル 0570-064-556）の案内を一文添えてください。`;

export class GeminiError extends Error {
  constructor(code, status, message) {
    super(message);
    this.code = code; // 'GEMINI_TIMEOUT' | 'GEMINI_ERROR'
    this.status = status; // 504 | 502
  }
}

/** プロフィールを文脈用テキストに整形する（FR-1） */
function formatProfile(profile) {
  if (!profile) return '';
  const lines = [];
  if (profile.grade) lines.push(`- 学年: ${profile.grade}`);
  if (profile.industry) lines.push(`- 志望業界・職種: ${profile.industry}`);
  if (profile.situation) lines.push(`- 現在の状況・悩み: ${profile.situation}`);
  if (lines.length === 0) return '';
  return `\n\n【相談者のプロフィール】\n${lines.join('\n')}`;
}

/**
 * システムプロンプト＋プロフィール＋直近履歴＋今回メッセージで Gemini を呼び出し、
 * 応答テキストを返す（FR-3）。
 * @param {{ history: {role: string, content: string}[], message: string, profile?: object }} params
 */
export async function generateReply({ history, message, profile }) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.geminiTimeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.geminiApiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT + formatProfile(profile) }],
        },
        contents,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new GeminiError('GEMINI_TIMEOUT', 504, 'AIの応答取得がタイムアウトしました。再送信してください。');
    }
    throw new GeminiError('GEMINI_ERROR', 502, 'AIの応答取得に失敗しました。再送信してください。');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[GeminiClient] API error ${res.status}: ${body.slice(0, 500)}`);
    throw new GeminiError('GEMINI_ERROR', 502, 'AIの応答取得に失敗しました。再送信してください。');
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('');
  if (!reply) {
    console.error('[GeminiClient] empty reply:', JSON.stringify(data).slice(0, 500));
    throw new GeminiError('GEMINI_ERROR', 502, 'AIの応答を取得できませんでした。再送信してください。');
  }
  return reply;
}
