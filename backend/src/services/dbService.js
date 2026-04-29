const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/moodboard.db';
let db;

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY, board_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      url TEXT,
      file_path TEXT,
      tags TEXT DEFAULT '[]',
      note TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ MoodBoard DB ready');
}

function getDB() { return db; }
module.exports = { initDB, getDB };
