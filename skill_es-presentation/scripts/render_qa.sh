#!/usr/bin/env bash
# .pptx を PDF 経由で slide-*.jpg に変換して目視QAできるようにする。
# この環境で不足しがちなパッケージ（libreoffice-impress / poppler-utils）を検出して自動導入し、
# svp ヘッドレスプラグインが無い問題は xvfb-run で回避する。
#
# 使い方: bash render_qa.sh path/to/deck.pptx [dpi]
set -u

PPTX="${1:?使い方: bash render_qa.sh deck.pptx [dpi]}"
DPI="${2:-130}"
PPTX_ABS="$(cd "$(dirname "$PPTX")" && pwd)/$(basename "$PPTX")"
OUTDIR="$(dirname "$PPTX_ABS")"
BASENAME="$(basename "$PPTX_ABS" .pptx)"
PROFILE="$(mktemp -d)"

need_apt=0
have_impress=0
# Impress モジュール（.pptx を読む本体）があるか
ls /usr/lib/libreoffice/program/*impress* >/dev/null 2>&1 && have_impress=1
if [ "$have_impress" -eq 0 ]; then
  echo "[render_qa] libreoffice-impress が無いので導入します..."
  (apt-get update -q && apt-get install -y -q libreoffice-impress) || { echo "[render_qa] impress の導入に失敗"; need_apt=1; }
fi

if ! command -v pdftoppm >/dev/null 2>&1; then
  echo "[render_qa] poppler-utils が無いので導入します..."
  apt-get install -y -q poppler-utils || { echo "[render_qa] poppler-utils の導入に失敗"; need_apt=1; }
fi

# 変換ランナー: svp が無い環境向けに xvfb-run 経由で soffice を呼ぶ
run_soffice() {
  if command -v xvfb-run >/dev/null 2>&1; then
    HOME="$PROFILE" xvfb-run -a soffice --headless --convert-to pdf --outdir "$OUTDIR" "$PPTX_ABS"
  else
    HOME="$PROFILE" soffice --headless --convert-to pdf --outdir "$OUTDIR" "$PPTX_ABS"
  fi
}

echo "[render_qa] PDF に変換中..."
rm -f "$OUTDIR/$BASENAME.pdf" "$OUTDIR"/slide-*.jpg
run_soffice >/dev/null 2>&1

if [ ! -f "$OUTDIR/$BASENAME.pdf" ]; then
  echo "[render_qa] PDF 変換に失敗しました。上のパッケージ導入が通ったか確認してください。"
  exit 1
fi

echo "[render_qa] 画像化中 (dpi=$DPI)..."
( cd "$OUTDIR" && pdftoppm -jpeg -r "$DPI" "$BASENAME.pdf" slide )

echo "[render_qa] 完成:"
ls -1 "$OUTDIR"/slide-*.jpg
echo "[render_qa] 上の各 jpg を Read して目視QAしてください。"
rm -rf "$PROFILE"
