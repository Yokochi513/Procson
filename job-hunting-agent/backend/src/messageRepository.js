import { db } from './db.js';

// MessageRepository（設計書 2.3）: messages テーブルへの保存・取得を担う

const insertStmt = db.prepare(
  `INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)`
);

const selectAllStmt = db.prepare(
  `SELECT role, content, created_at AS createdAt
     FROM messages
    WHERE user_id = ?
    ORDER BY created_at ASC, id ASC`
);

const selectRecentStmt = db.prepare(
  `SELECT role, content
     FROM (SELECT id, role, content
             FROM messages
            WHERE user_id = ?
            ORDER BY created_at DESC, id DESC
            LIMIT ?)
    ORDER BY id ASC`
);

/** ユーザー発話とAI応答を1トランザクションで保存する（FR-5） */
export function saveExchange(userId, userContent, assistantContent) {
  db.exec('BEGIN');
  try {
    insertStmt.run(userId, 'user', userContent);
    insertStmt.run(userId, 'assistant', assistantContent);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/** 匿名IDの全履歴を時系列（昇順）で返す（FR-6） */
export function findAllByUser(userId) {
  return selectAllStmt.all(userId);
}

/** Gemini の文脈に含める直近N件を時系列（昇順）で返す（FR-3, NFR-2） */
export function findRecentByUser(userId, limit) {
  return selectRecentStmt.all(userId, limit);
}
