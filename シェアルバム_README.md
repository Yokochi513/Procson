# シェアルバム MVP（土台 + アルバム/写真）

要件定義書・基本設計書に基づく「シェアルバム」の実装。本セッションでは **MVP の土台と縦切り1機能**（認証・アルバムCRUD・写真アップロード/整理）を実装しました。

## 実装済みスコープ

| 要求 | FR | 内容 | 状態 |
|------|----|------|------|
| 横断 | FR-23 | ユーザー登録・ログイン（メール＋パスワード＋JWT） | ✅ |
| ① | FR-1 | アルバム作成（イベント名・日付・説明） | ✅ |
| ① | FR-2 | アルバム編集（名前・日付） | ✅ |
| ① | FR-3 | アルバム削除（配下写真もカスケード削除） | ✅ |
| ① | FR-4 | 写真の複数一括アップロード | ✅ |
| ① | FR-5 | 写真整理（削除・カバー指定・並び順） | ✅ |
| 横断 | FR-24 | 各操作の失敗時エラー表示 | ✅（基本） |

> 未実装（次段階）: 共有・招待・権限（FR-6〜9）／写真解析・ハイライト（FR-10〜13）／動画生成（FR-14,15）／テンプレート・プロンプト・BGM（FR-16〜18）／適合採用（FR-19,20）／保存・共有（FR-21,22）。

## 構成

```
backend/   Node.js + Express + better-sqlite3（REST API・認証・CRUD・写真保存）
frontend/  Angular 18（SC-1 ログイン / SC-2 アルバム一覧 / SC-3 アルバム詳細）
```

- DB: SQLite（`backend/data.sqlite`、初回起動時に自動生成）
- 写真実体: ローカルFS（`backend/storage/album_<id>/`）
- 認証: JWT（`Authorization: Bearer <token>`）
- API パス・DBスキーマは基本設計書 5章・6章に準拠

## 起動手順

### 1. バックエンド（:3000）

```bash
cd backend
cp .env.example .env        # JWT_SECRET など必要に応じて変更
npm install
npm start                   # http://localhost:3000
```

### 2. フロントエンド（:4200）

```bash
cd frontend
npm install
npm start                   # ng serve → http://localhost:4200
```

ブラウザで http://localhost:4200 を開き、「新規登録」からアカウントを作成してください。

## 主要API（実装済み）

| メソッド | パス | 概要 |
|----------|------|------|
| POST | `/api/auth/register` | ユーザー登録 |
| POST | `/api/auth/login` | ログイン |
| GET | `/api/albums` | アルバム一覧（自分の所有分） |
| POST | `/api/albums` | アルバム作成 |
| GET/PATCH/DELETE | `/api/albums/:id` | 取得・編集・削除 |
| POST | `/api/albums/:id/photos` | 写真アップロード（multipart, `files[]`） |
| GET | `/api/albums/:id/photos` | 写真一覧 |
| PATCH | `/api/photos/:id` | カバー指定・並び順 |
| DELETE | `/api/photos/:id` | 写真削除 |

エラー形式は共通で `{ "error": { "code": "...", "message": "..." } }`。

## 非機能・セキュリティ（この段階での対応）

- APIキー/シークレットは `backend/.env` で管理（リポジトリに含めない、NFR-2）
- 全 `/api/albums`・`/api/photos` 系は JWT 認証必須。他人のアルバム/写真は所有者チェックで遮断（NFR-2）
- 1アルバム上限枚数・1枚最大サイズを検証（`MAX_PHOTOS_PER_ALBUM` / `MAX_PHOTO_SIZE`、NFR-3）

## 動作確認

ヘッドレスブラウザによる E2E で、登録→ログイン→アルバム作成→写真アップロード→バックエンドからの画像配信→カバー設定→リロード後のデータ永続、までを確認済み。
