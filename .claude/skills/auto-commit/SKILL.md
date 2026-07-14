---
name: auto-commit
description: Confirm with the user, then commit the current working-tree changes with an auto-generated message. Invoked at the end of a turn (via the Stop hook) to capture each prompt's result as a commit.
---

このスキルは「1プロンプトの作業結果を1コミットとして残す」ためのものです。以下の手順を順番に実行してください。

## 1. 変更を検知する

```
git status --porcelain
git diff --stat HEAD
```

- 変更が**無い**場合: 「コミットする変更はありません」とだけ伝えて終了する(確認ダイアログは出さない)。
- 現在のブランチがデフォルトブランチ(`main` / `master`)の場合は、ユーザーに新しいブランチを切るか確認してから進める(直接 main にはコミットしない)。

## 2. 本当にコミットしてよいか確認する

`AskUserQuestion` で、変更内容のサマリ(変更ファイル一覧と概要)を提示したうえで、コミットしてよいか確認する。選択肢の例:

- 「コミットする(推奨)」
- 「コミットしない / 今はスキップ」

ユーザーが「コミットしない」を選んだ場合は、何もせずに終了する。

## 3. コミットメッセージを考える

- `git diff HEAD`(必要なら `git diff --staged`)で実際の差分を読み、変更の意図を要約する。
- `git log --oneline -10` を見て、**このリポジトリ既存のコミットメッセージのスタイル・言語に合わせる**(例: 日本語の簡潔な要約)。
- 1行の簡潔な要約を基本とし、必要なら本文を添える。

## 4. コミットする

```
git add -A
git commit -m "<生成した要約>" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- コミット後に `git log --oneline -1` で結果を確認し、ユーザーに簡潔に報告する。
- `git push` は**しない**(ユーザーが明示的に求めた場合のみ)。
