# shuukatu-app-back

`shuukatsu-app`（Next.js フロントエンド）から呼び出す Claude API バックエンド。
Next.js の API Route（`/api/interview`・`/api/es-feedback`・`/api/diary-analysis`・`/api/es-slides`）を
Python (FastAPI) に移植したもので、リクエスト/レスポンスの JSON 形式はフロントと互換。

想定環境: Raspberry Pi (Linux) + systemd 常駐 + Cloudflare Tunnel で外部公開。

## エンドポイント

| メソッド | パス | 内容 |
|---|---|---|
| POST | `/api/interview` | 面接AI（`mode: "chat"` / `"evaluate"`） |
| POST | `/api/es-feedback` | エントリーシートAIフィードバック（キー未設定時はモック） |
| POST | `/api/diary-analysis` | 日記分析（`mode: "gakuchika-seed"` / `"interview-deepdive"`） |
| POST | `/api/es-slides` | ES→就活スライドHTML生成（`theme` に配色HEX） |
| GET | `/health` | 死活確認（APIキー設定有無も返す） |

`/api/diary-analysis` と `/api/es-slides` は、リポジトリの `.claude/skills/`
（`gakuchika-seed-from-diary` / `interview-deepdive-from-diary` / `es-slides`）を
システムプロンプトとして読み込む。スキルはフロントと共有しており、
バックエンドはリポジトリルート（このディレクトリの1つ上）の `.claude/skills/` を参照する。
キー未設定・生成失敗時はエラーを返し、フロント側がバンドル済みのモックを表示する。

## セットアップ（Raspberry Pi）

```sh
cd ~/Procson/shuukatu-app-back

# 仮想環境と依存
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# APIキー設定
cp .env.example .env
nano .env   # api_key=sk-ant-... を設定

# 動作確認（Ctrl+C で終了）
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
curl http://localhost:8000/health
```

## systemd で常駐化

```sh
# パス・ユーザー名が異なる場合は shuukatu-app-back.service を編集してから
sudo cp shuukatu-app-back.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now shuukatu-app-back

# 状態確認・ログ
systemctl status shuukatu-app-back
journalctl -u shuukatu-app-back -f
```

## Cloudflare Tunnel で外部公開（任意）

GitHub Pages（HTTPS）上のフロントから叩くには、バックエンドも HTTPS で公開する必要がある。
ポート開放不要の Cloudflare Tunnel を推奨。

```sh
# 1. cloudflared をインストール（Raspberry Pi OS 64bit の場合）
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# 2. Cloudflare にログインしてトンネル作成
cloudflared tunnel login
cloudflared tunnel create shuukatsu-back

# 3. 設定ファイル ~/.cloudflared/config.yml を作成
#    <TUNNEL_ID> は create 時に表示された ID、ドメインは Cloudflare 管理下のもの
cat > ~/.cloudflared/config.yml <<'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /home/pi/.cloudflared/<TUNNEL_ID>.json
ingress:
  - hostname: api.example.com
    service: http://localhost:8000
  - service: http_status:404
EOF

# 4. DNS レコードを紐付けてサービス化
cloudflared tunnel route dns shuukatsu-back api.example.com
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

公開後は `.env` の `ALLOWED_ORIGINS` をフロントのオリジンに絞ることを推奨:

```
ALLOWED_ORIGINS=https://<user>.github.io,http://localhost:3000
```

## フロントエンド側の設定

`shuukatsu-app` はビルド時に `NEXT_PUBLIC_API_BASE` を設定すると、
API 呼び出し先がこのバックエンドに切り替わる（未設定なら従来どおり同一オリジンの Next.js API Route）。

```sh
# 例: GitHub Pages 向け静的書き出し
NEXT_PUBLIC_API_BASE=https://api.example.com STATIC_EXPORT=true npm run build
```

## 注意

- `main.py` 内の面接カテゴリ・ES項目定義は、フロントの
  `lib/interview/interviewFlow.ts` / `lib/entrySheet/fields.ts` と手動で同期している。
  片方を変更したらもう片方も更新すること。
- 使用モデルは `claude-sonnet-5`（フロントの旧実装と同じ）。変更は `main.py` の `MODEL` 定数。
