#!/usr/bin/env node
// Stop hook for the "auto-commit" skill.
// Fires when the main agent finishes responding to a prompt. If the working tree
// has uncommitted changes, it blocks the stop and tells Claude to run the
// `auto-commit` skill, which confirms with the user and commits the turn's result.
//
// Guards:
//  - stop_hook_active: avoid an infinite loop after the skill itself finishes.
//  - no changes: stay silent so read-only turns are not interrupted.

const fs = require("fs");
const { execSync } = require("child_process");

let input = {};
try {
  const raw = fs.readFileSync(0, "utf8");
  input = raw ? JSON.parse(raw) : {};
} catch (e) {
  process.exit(0); // can't read/parse stdin -> allow stop
}

// If this stop was itself produced by a Stop hook continuation, don't re-trigger.
if (input.stop_hook_active) {
  process.exit(0);
}

let changes = "";
try {
  changes = execSync("git status --porcelain", {
    encoding: "utf8",
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
  }).trim();
} catch (e) {
  process.exit(0); // not a git repo / git unavailable -> allow stop
}

if (!changes) {
  process.exit(0); // nothing to commit
}

const out = {
  decision: "block",
  reason:
    "この応答で作業ツリーに未コミットの変更があります。`auto-commit` スキル" +
    "(Skill ツールで skill 名 \"auto-commit\")を起動し、ユーザーに確認のうえ" +
    "今回の変更をコミットしてください。変更が無い場合は何もしないこと。",
};

process.stdout.write(JSON.stringify(out));
process.exit(0);
