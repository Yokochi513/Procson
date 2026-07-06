# 就活提案エージェント（MVP）

岡山県内の就活生が、悩みや疑問をいつでも気軽にテキストで相談できるチャットアプリ。
`基本設計_就活提案エージェント.md`（v1.0）に基づく実装。

## 構成

```
job-hunting-agent/
├── backend/    Node.js + Express（Gemini 最小プロキシ + SQLite 永続化）
│   └── src/
│       ├── server.js            エントリポイント
│       ├── config.js            設定（.env + 設計書10章の既定値）
│       ├── db.js                SQLite 初期化（node:sqlite、messages テーブル）
│       ├── messageRepository.js 履歴の保存・取得（FR-5, FR-6）
│       ├── geminiClient.js      プロンプト組み立て + Gemini 呼び出し（FR-3）
│       └── routes/
│           ├── chat.js          POST /api/chat
│           └── history.js       GET /api/history
└── frontend/   Angular 20（チャットUI）
    └── src/app/
        ├── chat.ts              ChatComponent（会話表示・入力・エラー/再送）
        ├── profile-input.ts     ProfileInput（簡易プロフィール、任意）
        └── chat.service.ts      匿名ID管理（FR-7）+ API 呼び出し
```

## セットアップ

前提: Node.js v22.5 以上（`node:sqlite` を使用。ネイティブモジュール不要）

### 1. Gemini API キーの設定（必須）

[Google AI Studio](https://aistudio.google.com/apikey) でキーを取得し、`backend/.env.example` を
`backend/.env` にコピーして設定する。

```
GEMINI_API_KEY=<取得したキー>
```

`.env` は `.gitignore` 済み。キーはバックエンドのみが保持し、フロントには渡らない（NFR-3）。

### 2. 依存のインストール

```
cd backend  && npm install
cd frontend && npm install
```

## 起動（ターミナル2つ）

```
# ターミナル1: バックエンド (http://localhost:3000)
cd backend && npm start

# ターミナル2: フロントエンド (http://localhost:4200)
cd frontend && npm start
```

ブラウザで http://localhost:4200 を開く。`/api` へのリクエストは開発プロキシ
（`frontend/proxy.conf.json`）経由でバックエンドに転送される。

## 設定値（backend/.env で変更可、既定は設計書10章の前提値）

| 変数 | 既定値 | 説明 |
|------|--------|------|
| `GEMINI_MODEL` | `gemini-2.0-flash` | 使用モデル |
| `GEMINI_TIMEOUT_MS` | `30000` | Gemini タイムアウト（P-5、自動リトライなし） |
| `MAX_MESSAGE_LEN` | `2000` | 1メッセージ最大文字数（P-1、FE/BE双方で検証） |
| `HISTORY_N` | `20` | 文脈に含める直近履歴件数（P-2） |
| `DB_FILE` | `data/app.db` | SQLite ファイルパス |
| `PORT` | `3000` | バックエンドのポート |

## 実装メモ（設計書との対応）

- 会話履歴は SQLite の `messages` テーブルに保存（FR-5）。ページ再読込時に
  `GET /api/history` で復元（FR-6）。
- 匿名IDは `anon-` + UUID を localStorage（キー: `jobAgentAnonId`）に保存（FR-7, P-6）。
  localStorage を消すと新規IDになり過去履歴は引き継がれない（CON-1）。
- プロフィールはサーバ保存せず毎リクエストで送る方式（P-3 の既定）。profiles テーブルは未作成。
- Gemini 失敗時はユーザー発話を保存しない（P-4 の既定）。FE は入力を保持し再送信ボタンを表示（FR-8）。
- エラー形式は共通で `{ "error": { "code", "message" } }`（設計書8章）。
