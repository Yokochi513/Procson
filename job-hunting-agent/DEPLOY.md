# デプロイ手順（GitHub Pages + 自宅ラズパイ）

## 全体構成

```
[ブラウザ]
   │  HTTPS
   ▼
[GitHub Pages]  https://yokochi513.github.io/Procson/
   フロントエンド（Angular 静的ビルド）
   push → GitHub Actions が自動ビルド＆デプロイ
   │
   │  HTTPS（/api/chat, /api/history）
   ▼
[Cloudflare Tunnel]  https://<サブドメイン>.<あなたのドメイン>/
   │
   ▼
[自宅 Raspberry Pi]
   backend（Express + SQLite + Gemini プロキシ）を systemd で常時起動
```

GitHub Pagesは静的ファイルのみで、Node.jsサーバーは動かせない。そのため
バックエンドはラズパイ上で常時稼働させ、`cloudflared` でインターネットに
HTTPS公開する（ルーターのポート開放は不要）。

前提: Cloudflareに登録済みの独自ドメインを1つ持っていること
（お持ちでない場合は末尾の「付録: ドメインなしで公開する場合」を参照）。

---

## Part A. ラズパイ側セットアップ

### A-1. Node.js のインストール（Node v22.5+ が必須。`node:sqlite` 使用のため）

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v22.5.0 以上であることを確認
```

### A-2. リポジトリ配置と依存関係インストール

`/opt` 配下に配置する場合、`/opt` はrootの所有なので事前に権限を調整するか、
sudoでcloneして所有者を変更する。

```bash
sudo git clone https://github.com/Yokochi513/Procson.git /opt/Procson
sudo chown -R yokochi:yokochi /opt/Procson
cd /opt/Procson/job-hunting-agent/backend
npm install --omit=dev
```

### A-3. `.env` 設定

```bash
cp .env.example .env
nano .env
```

```
GEMINI_API_KEY=<Google AI StudioでBEも本番用に発行したキー>
PORT=3000
```

### A-4. 動作確認

```bash
npm start
# 別ターミナルから
curl http://localhost:3000/api/history?userId=test
```

### A-5. systemd で常時起動化

systemdはユニットファイルを `/etc/systemd/system/` などの決まった場所からしか
読み込めないが、シンボリックリンクは辿れる。そこでユニットファイルの実体は
リポジトリ側（`job-hunting-agent/deploy/systemd/job-hunting-backend.service`）に
バージョン管理下として置き、`/etc/systemd/system/` にはそこへのシンボリック
リンクを張って有効化する。

```bash
sudo ln -s /opt/Procson/job-hunting-agent/deploy/systemd/job-hunting-backend.service \
  /etc/systemd/system/job-hunting-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now job-hunting-backend
sudo systemctl status job-hunting-backend   # active (running) を確認
journalctl -u job-hunting-backend -f        # ログ確認
```

ユニットファイルの内容を変更した場合は `git pull` 後に
`sudo systemctl daemon-reload && sudo systemctl restart job-hunting-backend` で反映する。

### A-6. CORSをGitHub Pagesのオリジンに限定（推奨）

`backend/src/config.js`（`allowedOrigin`）と `backend/src/server.js`
（`cors({ origin: config.allowedOrigin })`）は対応済み。既定値は
`https://yokochi513.github.io` だが、別オリジンで公開する場合は
`.env` に以下を追記して上書きする（`.env`/`.env.example` は環境変数
ファイルのため、この手順書からは自動編集していない。手動で追記すること）:

```
ALLOWED_ORIGIN=https://yokochi513.github.io
```

### A-7. Cloudflare Tunnel でHTTPS公開（ポート開放不要）

```bash
# cloudflared (arm64) をインストール
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
sudo mv cloudflared /usr/local/bin/
sudo chmod +x /usr/local/bin/cloudflared

# Cloudflareアカウントにログイン（ブラウザでの認可が必要）
cloudflared tunnel login

# トンネル作成
cloudflared tunnel create job-hunting-agent

# DNSにルーティング（<あなたのドメイン>はCloudflareに登録済みのもの）
cloudflared tunnel route dns job-hunting-agent api.<あなたのドメイン>
```

`config.yml` は `.env` と同じ扱いにする。テンプレート
（`.cloudflared/config.yml.sample`、`<tunnel-id>`はプレースホルダ）はリポジトリで
追跡するが、実体の `.cloudflared/config.yml` はリポジトリ内に置きつつ
`.gitignore` で追跡除外している（トンネルIDなど環境固有情報を含むため）。

```bash
cd /opt/Procson
cp .cloudflared/config.yml.sample .cloudflared/config.yml
nano .cloudflared/config.yml   # <tunnel-id> をA-7で作成したトンネルのIDに書き換える
```

`cloudflared service install` は `~/.cloudflared/config.yml` を前提に
`/etc/cloudflared/` へ自動コピーする挙動のため、リポジトリ内のconfigパスを
そのまま使えない。そこでA-5のバックエンドと同様に、リポジトリ管理下の
ユニットファイル（`job-hunting-agent/deploy/systemd/cloudflared-job-hunting.service`、
`--config /opt/Procson/.cloudflared/config.yml` を明示指定）をシンボリック
リンクで有効化する:

```bash
sudo ln -s /opt/Procson/job-hunting-agent/deploy/systemd/cloudflared-job-hunting.service \
  /etc/systemd/system/cloudflared-job-hunting.service
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-job-hunting
sudo systemctl status cloudflared-job-hunting   # active (running) を確認
```

確認:

```bash
curl https://api.<あなたのドメイン>/api/history?userId=test
```

---

## Part B. フロントエンド側の変更（コード修正）

現状 `chat.service.ts` は相対パス `/api/chat` を呼んでおり、開発時は
`proxy.conf.json` でローカルBEに転送されている。GitHub Pages上ではこの
プロキシが存在しないため、本番ビルド時にAPIの向き先をラズパイのURLに
差し替える必要がある。

### B-1. 環境ファイルを追加

`frontend/src/environments/environment.ts`（開発用・既定）:

```ts
export const environment = {
  production: false,
  apiBaseUrl: '', // 空 = 相対パス。ng serve のプロキシ経由でBEに転送される
};
```

`frontend/src/environments/environment.production.ts`（本番用）:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.<あなたのドメイン>',
};
```

### B-2. `angular.json` に本番用ファイル差し替えを追加

`architect.build.configurations.production` に追記:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.production.ts"
  }
]
```

### B-3. `chat.service.ts` を修正

```ts
import { environment } from '../environments/environment';
// ...
sendMessage(message: string, profile: Profile): Observable<{ reply: string }> {
  return this.http.post<{ reply: string }>(`${environment.apiBaseUrl}/api/chat`, {
    userId: this.getUserId(),
    message,
    profile,
  });
}

getHistory(): Observable<{ messages: ChatMessage[] }> {
  return this.http.get<{ messages: ChatMessage[] }>(`${environment.apiBaseUrl}/api/history`, {
    params: { userId: this.getUserId() },
  });
}
```

---

## Part C. GitHub Actions + GitHub Pages 設定

### C-1. リポジトリ設定

GitHub上で Settings → Pages → Build and deployment → Source を
「GitHub Actions」に設定する。

### C-2. ワークフローファイル

`.github/workflows/deploy-pages.yml`（リポジトリルート）:

```yaml
name: Deploy job-hunting-agent to GitHub Pages

on:
  push:
    branches: [create_AI_job_hunting]
    paths:
      - 'job-hunting-agent/frontend/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: job-hunting-agent/frontend/package-lock.json
      - run: npm ci
        working-directory: job-hunting-agent/frontend
      - run: npx ng build --configuration production --base-href /Procson/
        working-directory: job-hunting-agent/frontend
      - run: touch job-hunting-agent/frontend/dist/frontend/browser/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with:
          path: job-hunting-agent/frontend/dist/frontend/browser

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`create_AI_job_hunting` ブランチの `job-hunting-agent/frontend/` 配下に push
すると自動でビルド・デプロイされる（当面 `main` にはマージしない運用のため）。
手動実行したい場合は Actions タブから「Run workflow」でも起動できる
（`workflow_dispatch`）。

### C-3. 公開URL

`https://yokochi513.github.io/Procson/`

---

## 動作確認・トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| コンソールに CORS エラー | `ALLOWED_ORIGIN` がPagesのURLと不一致 | A-6 の値を実際のPages URLに合わせる |
| Mixed Content エラー | BEがhttpのまま | A-7 のCloudflare Tunnel経由（https）を使う |
| 画面は出るがAPIが404/接続不可 | `apiBaseUrl` の設定漏れ、`base-href` 不一致 | B-1〜B-2、C-2 の `--base-href` を確認 |
| ラズパイ再起動後にBEが止まっている | systemd未有効化 | `sudo systemctl enable job-hunting-backend` |
| Actions は成功するが真っ白画面 | `base-href` 未設定で相対パスが崩れる | `--base-href /Procson/` を確認 |

---

## 付録: ドメインなしで公開する場合

Cloudflareに登録できる独自ドメインがない場合、以下の代替手段がある。

- **DuckDNS + ルーターのポート開放 + Nginx + Let's Encrypt**
  無料の `*.duckdns.org` サブドメインを取得し、ルーターの3000番（または443番）を
  ラズパイに転送、Nginxでリバースプロキシしつつ certbot でHTTPS証明書を取得する方法。
  ポート開放が必要になる分、Cloudflare Tunnelよりセキュリティ面の考慮が増える。
- ドメインを新規に取得する（年間1,000円程度〜）。取得後はPart A-7の手順がそのまま使える。
