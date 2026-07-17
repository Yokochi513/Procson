"""
shuukatsu-app バックエンド（Claude API プロキシ）

Next.js 側の API Route（app/api/interview, app/api/es-feedback）を
Python (FastAPI) に移植したもの。リクエスト/レスポンスの JSON 形式は
フロントエンドと互換なので、フロントは接続先 URL を切り替えるだけでよい。

起動:  uvicorn main:app --host 0.0.0.0 --port 8000
運用:  systemd で常駐（shuukatu-app-back.service を参照）
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any, Literal, Optional

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("shuukatsu-back")

# 面接AIに使用するモデル（chat/evaluate/ES共通。フロント実装と同じ）
MODEL = "claude-opus-4.8"

# ---------------------------------------------------------------------------
# フロントエンド（lib/interview/interviewFlow.ts, lib/entrySheet/fields.ts）
# と同期させる静的データ。変更時は両方を更新すること。
# ---------------------------------------------------------------------------

INTERVIEW_CATEGORIES = [
    "自己紹介",
    "自己PR",
    "ガクチカ",
    "志望動機",
    "強み",
    "弱み",
    "失敗経験",
    "チームで協力した経験",
    "入社後に挑戦したいこと",
    "逆質問",
]

ENTRY_SHEET_FIELDS = [
    {"id": "selfPr", "label": "自己PR"},
    {"id": "motivation", "label": "志望動機"},
    {"id": "gakuchika", "label": "学生時代に力を入れたこと"},
    {"id": "strengthWeakness", "label": "長所・短所"},
]

CATEGORY_LIST = " → ".join(INTERVIEW_CATEGORIES)


def get_api_key() -> Optional[str]:
    """ANTHROPIC_API_KEY か api_key（フロントの .env と同じ名前）を参照する。"""
    return os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("api_key")


def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=get_api_key())


# ---------------------------------------------------------------------------
# リクエストモデル
# ---------------------------------------------------------------------------


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class CompanyContext(BaseModel):
    company: str
    industry: Optional[str] = None
    strength: Optional[str] = None


class InterviewRequest(BaseModel):
    mode: Literal["chat", "evaluate"] = "chat"
    history: list[ChatTurn] = []
    company: Optional[CompanyContext] = None
    esAnswers: Optional[dict[str, str]] = None


class EsFeedbackRequest(BaseModel):
    answers: dict[str, str] = {}


class DiaryAnalysisRequest(BaseModel):
    diary: str = ""
    mode: str = ""


class SlideTheme(BaseModel):
    """ES→スライドの配色。lib/esSlides/theme.ts の SlideTheme と1対1。"""

    navy: str
    navy2: str
    blue: str
    line: str
    ink: str
    muted: str
    card: str
    cardBd: str
    page: str
    polyA: str
    polyB: str


class EsSlidesRequest(BaseModel):
    es: str = ""
    theme: Optional[SlideTheme] = None


# ---------------------------------------------------------------------------
# プロンプト構築（route.ts と同一内容）
# ---------------------------------------------------------------------------


def build_context(
    company: Optional[CompanyContext], es_answers: Optional[dict[str, str]]
) -> str:
    parts: list[str] = []

    if company and company.company:
        parts.append(
            f"""【面接を行う企業】
あなたは「{company.company}」（業界：{company.industry or "不明"}）の面接官です。
この企業の特徴・強み：{company.strength or "（情報なし）"}

志望動機・入社後に挑戦したいことなどの質問では、必ずこの企業を前提にしてください（例：「なぜ当社を志望されたのですか」）。
学生の回答がこの企業や業界の特徴と結びついているかに注目して、深掘りしてください。
ただし、あなたが知らない社内制度などを断定的に語らないでください。"""
        )
    else:
        parts.append(
            """【面接を行う企業】
特定の企業を指定しない、一般的な新卒採用面接として進めてください。
志望動機の質問では「志望されている企業について」という形で尋ねてください。"""
        )

    if es_answers:
        es_parts = []
        for f in ENTRY_SHEET_FIELDS:
            v = (es_answers.get(f["id"]) or "").strip()
            if v:
                es_parts.append(f"【{f['label']}】\n{v}")
        es = "\n\n".join(es_parts)

        if es:
            parts.append(
                f"""【学生が提出したエントリーシート】
以下はこの学生が事前に提出したESです。内容を踏まえ、書かれている内容の深掘り（具体的なエピソード・数字・その時の判断など）を中心に質問してください。
ESに書いてあることをそのまま聞き直すのではなく、「ESに〇〇とありますが、その時…」のように一歩踏み込んで尋ねてください。

{es}"""
            )

    return "\n\n".join(parts)


def build_interviewer_system(
    company: Optional[CompanyContext], es_answers: Optional[dict[str, str]]
) -> str:
    return f"""あなたは新卒採用の面接官です。就職活動中の学生に、実際の採用面接に近い練習の場を提供します。

{build_context(company, es_answers)}

【役割】
・あなたは面接官であり、学生を評価する立場です。
・優しく丁寧な口調で、しかし本番さながらの緊張感を保って話してください。
・最後まで面接官の役割を崩さないでください。

【面接の流れ】この順番で進めます。
挨拶 → {CATEGORY_LIST} → 面接終了

【質問方法】
・一度に質問は必ず1つだけにしてください。
・学生の回答を見て、自然に次の質問へ進んでください。
・必要であれば、同じテーマで1〜2回だけ深掘り質問をしてください。深掘りしすぎないでください。

【回答への対応】学生の回答を受けたら、次の順番で短く返します。
①簡単な相づち（例：「なるほど」「ありがとうございます」）
②良い点を一言
③必要であれば深掘り質問を1つ（任意）
④次の質問（深掘りしない場合）

【禁止事項】
・一度に複数の質問をしない。
・説教をしない。
・長文になりすぎない（1回の発言は3〜4文程度）。
・回答例・模範解答を書かない。
・面接官の役割を崩さない。

【最初の発言】
まだ会話が始まっていない場合は、入室の挨拶をしてから最初の質問（自己紹介）をしてください。

【出力する各項目について】
・reply … 面接官としての発言（上記ルールに従う。3〜4文程度）
・category … 今その発言で尋ねている質問のカテゴリ。挨拶のみ・雑談の場合は空文字。
・finished … 逆質問まで終えて面接を締めくくったら true、それ以外は false"""


CHAT_SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string", "description": "面接官としての発言"},
        "category": {
            "type": "string",
            "description": "今尋ねている質問のカテゴリ。挨拶のみ・雑談なら空文字。",
            "enum": [*INTERVIEW_CATEGORIES, ""],
        },
        "finished": {"type": "boolean", "description": "面接を締めくくったら true"},
    },
    "required": ["reply", "category", "finished"],
    "additionalProperties": False,
}


def build_evaluation_system(company: Optional[CompanyContext]) -> str:
    if company and company.company:
        target = (
            f"この面接は「{company.company}」（{company.industry or ''}）の選考です。"
            "志望動機や入社後の展望が、この企業の特徴と結びついているかも評価に含めてください。"
        )
    else:
        target = "この面接は特定企業を指定しない一般的な新卒面接です。"

    return f"""あなたは面接の評価者です。これまでの面接のやり取り全体を読み、学生を100点満点で評価します。
優しく、しかし公平に評価し、具体的で前向きな改善アドバイスを添えてください。
{target}

【出力する各項目について】
・logical / specific / passion / communication / total … それぞれ0〜100の整数
・summary … 全体の総評（2〜3文）
・improvements … 具体的な改善点を3つ"""


EVALUATION_SCHEMA = {
    "type": "object",
    "properties": {
        "logical": {"type": "integer", "description": "論理性 0〜100"},
        "specific": {"type": "integer", "description": "具体性 0〜100"},
        "passion": {"type": "integer", "description": "熱意 0〜100"},
        "communication": {
            "type": "integer",
            "description": "コミュニケーション力 0〜100",
        },
        "total": {"type": "integer", "description": "総合評価 0〜100"},
        "summary": {"type": "string", "description": "全体の総評（2〜3文）"},
        "improvements": {
            "type": "array",
            "description": "具体的な改善点",
            "items": {"type": "string"},
        },
    },
    "required": [
        "logical",
        "specific",
        "passion",
        "communication",
        "total",
        "summary",
        "improvements",
    ],
    "additionalProperties": False,
}


def extract_json(text: str) -> dict[str, Any]:
    """モデル出力から JSON を取り出す（コードブロック混入にも対応）。"""
    trimmed = text.strip()
    fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", trimmed)
    candidate = fenced.group(1) if fenced else trimmed
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("JSON not found")
    return json.loads(candidate[start : end + 1])


def response_text(response: anthropic.types.Message) -> str:
    return "".join(b.text for b in response.content if b.type == "text")


def mock_es_feedback(answers: dict[str, str]) -> str:
    """APIキー未設定時のダミーコメント（esFeedbackMock.ts と同じ）。"""
    filled = [f for f in ENTRY_SHEET_FIELDS if (answers.get(f["id"]) or "").strip()]

    if not filled:
        return "まだ内容が入力されていません。各項目を埋めてから、もう一度フィードバックを受けてみましょう。"

    longest = max(filled, key=lambda f: len(answers.get(f["id"]) or ""))

    return "\n".join(
        [
            f"全体を拝見しました。特に「{longest['label']}」はよく書き込まれており、あなたの人柄が伝わります。",
            "さらに良くするために、エピソードには「具体的な数字」や「あなたが取った行動」を一文加えてみましょう。",
            "結論から書き始めると、面接官が要点を掴みやすくなります。応援しています！",
            "",
            "※ これはサンプルのAIコメントです（Claude APIキー未設定）。",
        ]
    )


# ---------------------------------------------------------------------------
# 日記分析 / ESスライド生成 用ヘルパ
# （フロントの lib/diary/*, lib/esSlides/* を移植。スキル定義は
#   リポジトリの .claude/skills/ を Next.js 側と共有して読み込む）
# ---------------------------------------------------------------------------

# このファイル（shuukatu-app-back/main.py）から見たリポジトリルート。
# 通常は 1つ上（例: /opt/Procson）に .claude/skills/ がある。
# 念のため cwd 直下も候補にしておく（TS 版と同じ方針）。
_SKILL_DIR_CANDIDATES = [
    Path(__file__).resolve().parent.parent / ".claude" / "skills",
    Path.cwd() / ".claude" / "skills",
]

# 日記分析モード → スキル名。フロントの lib/diary/types.ts と同期。
DIARY_SKILLS = {
    "gakuchika-seed": "gakuchika-seed-from-diary",
    "interview-deepdive": "interview-deepdive-from-diary",
}


def _strip_frontmatter(markdown: str) -> str:
    """先頭の YAML フロントマター（--- ... ---）を除いた本文を返す。"""
    match = re.match(r"^---\r?\n[\s\S]*?\r?\n---\r?\n", markdown)
    return markdown[match.end() :] if match else markdown


def read_skill_file(skill_name: str, *relative_parts: str) -> str:
    """.claude/skills/<skill_name>/<relative_parts...> を読み込む。"""
    for base in _SKILL_DIR_CANDIDATES:
        candidate = base.joinpath(skill_name, *relative_parts)
        try:
            return candidate.read_text(encoding="utf-8")
        except OSError:
            continue  # 次の候補を試す
    raise FileNotFoundError(
        f"skill file not found: {skill_name}/{'/'.join(relative_parts)}"
    )


def load_diary_skill_prompt(mode: str) -> str:
    """日記分析スキルの SKILL.md 本文（システムプロンプト）を返す。"""
    skill_name = DIARY_SKILLS[mode]
    return _strip_frontmatter(read_skill_file(skill_name, "SKILL.md")).strip()


def build_es_slides_prompt(theme: SlideTheme) -> str:
    """
    .claude/skills/es-slides/ 一式からシステムプロンプトを組み立てる。
    lib/esSlides/skill.ts の buildEsSlidesPrompt と同一内容。
    """
    skill = read_skill_file("es-slides", "SKILL.md")
    design_system = read_skill_file("es-slides", "references", "design-system.md")
    content_guide = read_skill_file("es-slides", "references", "content-guide.md")
    template = read_skill_file("es-slides", "assets", "slide-template.html")

    return f"""{_strip_frontmatter(skill).strip()}

---

# references/design-system.md

{design_system.strip()}

---

# references/content-guide.md

{content_guide.strip()}

---

# assets/slide-template.html

```html
{template.strip()}
```

---

# このAPI実行環境での追加ルール（最優先）

あなたはWebアプリのAPIとして1回の応答でスライドHTMLを完成させる。対話はできない。

- **フェーズ1（デザインヒアリング）は実施しない。** 配色は利用者が選択済みで、下記のHEXを使う。
  slide-template.html の `:root` のCSS変数を、この値でそのまま置き換えること。
  - --navy: {theme.navy}
  - --navy-2: {theme.navy2}
  - --blue: {theme.blue}
  - --line: {theme.line}
  - --ink: {theme.ink}
  - --muted: {theme.muted}
  - --card: {theme.card}
  - --card-bd: {theme.cardBd}
  - --page: {theme.page}
  - --poly-a: {theme.polyA}
  - --poly-b: {theme.polyB}
- **フェーズ4・5（pptx書き出し・整合確認）は実施しない。** 成果物はHTMLのみ。
- 本文はフェーズ2（content-guide.md）に従い、ユーザーが送るESから作る。事実を創作せず、
  ESに無い固有情報（大学名・氏名等）は「○○大学」「氏名」等のプレースホルダのまま残す。
- 出力は **slide-template.html と同じ構造の完全なHTMLドキュメントのみ**。
  `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>就活スライド</title><style>…</style></head><body>…</body></html>` の形にする。
  説明文・前置き・Markdownのコードフェンスは一切付けない。1文字目から `<!doctype html>` で始めること。"""


_HEX_PATTERN = re.compile(r"^#[0-9a-fA-F]{6}$")


def is_valid_theme(theme: Optional[SlideTheme]) -> bool:
    """テーマ全体が正しい HEX 値で構成されているか検証する。"""
    if theme is None:
        return False
    return all(bool(_HEX_PATTERN.match(v)) for v in theme.model_dump().values())


def extract_html(raw: str) -> Optional[str]:
    """モデル応答から HTML ドキュメント本体を取り出す（フェンス混入にも対応）。"""
    fenced = re.search(r"```(?:html)?\s*([\s\S]*?)```", raw)
    candidate = (fenced.group(1) if fenced else raw).strip()
    match = re.search(r"<!doctype html", candidate, re.IGNORECASE)
    if not match:
        return None
    return candidate[match.start() :]


# ---------------------------------------------------------------------------
# FastAPI アプリ
# ---------------------------------------------------------------------------

app = FastAPI(title="shuukatsu-app backend")

# GitHub Pages 等の別オリジンから叩くため CORS を許可する。
# ALLOWED_ORIGINS にカンマ区切りで指定（未設定なら全許可）。
allowed_origins = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "hasApiKey": bool(get_api_key())}


@app.post("/api/interview")
def interview(body: InterviewRequest) -> JSONResponse:
    if not get_api_key():
        return JSONResponse(
            {
                "error": "APIキーが設定されていません（.env の api_key を確認してください）。"
            },
            status_code=500,
        )

    try:
        client = get_client()

        if body.mode == "evaluate":
            transcript = "\n".join(
                f"{'面接官' if t.role == 'assistant' else '学生'}: {t.content}"
                for t in body.history
            )

            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=build_evaluation_system(body.company),
                output_config={
                    "format": {"type": "json_schema", "schema": EVALUATION_SCHEMA},
                },
                messages=[
                    {
                        "role": "user",
                        "content": f"以下は面接のやり取りです。この学生を評価してください。\n\n{transcript}",
                    }
                ],
            )

            if response.stop_reason == "max_tokens":
                logger.error("Evaluation truncated by max_tokens")
                return JSONResponse(
                    {
                        "error": "評価の生成が途中で終了しました。もう一度お試しください。"
                    },
                    status_code=500,
                )

            return JSONResponse({"evaluation": extract_json(response_text(response))})

        # --- chat モード ---
        # 履歴の先頭は面接官(assistant)の発言になり得るが、Messages API は
        # 最初を user にする必要があるため、常に kickoff の user メッセージを先頭に付ける。
        messages: list[dict[str, str]] = [
            {
                "role": "user",
                "content": "（面接を始めてください。これまでの会話に続けて進行してください。）",
            },
            *({"role": t.role, "content": t.content} for t in body.history),
        ]

        started = time.monotonic()
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=build_interviewer_system(body.company, body.esAnswers),
            output_config={
                "format": {"type": "json_schema", "schema": CHAT_SCHEMA},
            },
            messages=messages,
        )
        elapsed_ms = int((time.monotonic() - started) * 1000)
        logger.info(
            "interview chat: %dms stop_reason=%s usage=%s",
            elapsed_ms,
            response.stop_reason,
            response.usage,
        )

        if response.stop_reason == "max_tokens":
            logger.error("Interviewer reply truncated by max_tokens")
            return JSONResponse(
                {"error": "面接官の応答が途中で終了しました。もう一度お試しください。"},
                status_code=500,
            )

        parsed = extract_json(response_text(response))
        return JSONResponse(
            {
                "reply": str(parsed.get("reply") or "").strip(),
                "category": str(parsed.get("category") or "").strip(),
                "finished": bool(parsed.get("finished")),
            }
        )

    except Exception:
        logger.exception("Interview API error")
        return JSONResponse(
            {
                "error": "面接AIの呼び出しに失敗しました。時間をおいて再度お試しください。"
            },
            status_code=500,
        )


@app.post("/api/es-feedback")
def es_feedback(body: EsFeedbackRequest) -> JSONResponse:
    answers = body.answers

    # --- キーが無い場合はモックを返す（課金なしで動作確認できる） ---
    if not get_api_key():
        return JSONResponse({"comment": mock_es_feedback(answers), "source": "mock"})

    try:
        client = get_client()

        es = "\n\n".join(
            f"【{f['label']}】\n{(answers.get(f['id']) or '').strip() or '（未記入）'}"
            for f in ENTRY_SHEET_FIELDS
        )

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=(
                "あなたは就活生を支援する、経験豊富で親身な面接官です。"
                "提出されたエントリーシートに対して、良い点を1つ、改善点を2つ、"
                "日本語で簡潔に（300字以内）フィードバックしてください。"
                "就活生を励ます前向きなトーンで書いてください。"
            ),
            messages=[
                {
                    "role": "user",
                    "content": f"以下のエントリーシートにフィードバックをお願いします。\n\n{es}",
                }
            ],
        )

        comment = "\n".join(
            b.text for b in response.content if b.type == "text"
        ).strip()
        return JSONResponse({"comment": comment, "source": "claude"})

    except Exception:
        logger.exception("Claude API error")
        # 失敗時はモックにフォールバック
        return JSONResponse(
            {"comment": mock_es_feedback(answers), "source": "mock-fallback"}
        )


@app.post("/api/diary-analysis")
def diary_analysis(body: DiaryAnalysisRequest) -> JSONResponse:
    """日記を分析して、ガクチカの種 / 面接深掘り質問 を Markdown で返す。"""
    if body.mode not in DIARY_SKILLS:
        return JSONResponse({"error": "invalid mode"}, status_code=400)
    if not body.diary.strip():
        return JSONResponse({"error": "diary is empty"}, status_code=400)

    # キー未設定時はフロント側がバンドル済みのモックを表示するため、ここでは明示エラーを返す。
    if not get_api_key():
        return JSONResponse(
            {
                "error": "APIキーが設定されていません（.env の api_key を確認してください）。"
            },
            status_code=503,
        )

    try:
        client = get_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=load_diary_skill_prompt(body.mode),
            messages=[
                {
                    "role": "user",
                    "content": (
                        "以下は就活生が書いた日記です。スキルの手順に従って分析し、"
                        "指定の出力フォーマットのMarkdownだけを出力してください。\n\n"
                        f"{body.diary}"
                    ),
                }
            ],
        )
        return JSONResponse(
            {"result": response_text(response).strip(), "source": "claude"}
        )

    except Exception:
        logger.exception("diary-analysis error")
        return JSONResponse(
            {
                "error": "日記分析の呼び出しに失敗しました。時間をおいて再度お試しください。"
            },
            status_code=500,
        )


@app.post("/api/es-slides")
def es_slides(body: EsSlidesRequest) -> JSONResponse:
    """ESの文章と配色テーマから、就活スライド3枚分の完全なHTMLを生成して返す。"""
    if not is_valid_theme(body.theme):
        return JSONResponse({"error": "invalid theme"}, status_code=400)
    if not body.es.strip():
        return JSONResponse({"error": "es is empty"}, status_code=400)

    if not get_api_key():
        return JSONResponse(
            {
                "error": "APIキーが設定されていません（.env の api_key を確認してください）。"
            },
            status_code=503,
        )

    try:
        client = get_client()
        response = client.messages.create(
            model=MODEL,
            max_tokens=16384,
            system=build_es_slides_prompt(body.theme),
            messages=[
                {
                    "role": "user",
                    "content": (
                        "以下は就活生のエントリーシートです。スキルの手順（フェーズ2〜3）に"
                        "従って3枚のスライドを作り、完全なHTMLドキュメントだけを出力してください。\n\n"
                        f"{body.es}"
                    ),
                }
            ],
        )

        html = extract_html(response_text(response))
        if not html:
            raise ValueError("response did not contain an HTML document")

        return JSONResponse({"html": html, "source": "claude"})

    except Exception:
        logger.exception("es-slides error")
        return JSONResponse(
            {
                "error": "スライド生成の呼び出しに失敗しました。時間をおいて再度お試しください。"
            },
            status_code=500,
        )
