import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'clipvault.db');
const db = new Database(dbPath);

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      content_plain TEXT NOT NULL,
      content_encrypted BLOB,
      type TEXT DEFAULT 'text',
      source_app TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS clip_tags (
      clip_id TEXT,
      tag_id TEXT,
      FOREIGN KEY(clip_id) REFERENCES clips(id),
      FOREIGN KEY(tag_id) REFERENCES tags(id),
      PRIMARY KEY (clip_id, tag_id)
    );
  `);

  // Initialize FTS5 table
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS clips_fts USING fts5(
        content_plain,
        content='clips',
        content_rowid='rowid'
      );
    `);
  } catch (e) {
    console.error('FTS5 not supported or error initializing:', e);
  }
};

export default db;
