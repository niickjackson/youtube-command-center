import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/command-center.db';

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS story_leads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    sources TEXT NOT NULL DEFAULT '[]',
    hook_angle TEXT NOT NULL DEFAULT '',
    tier INTEGER NOT NULL DEFAULT 1,
    criteria_met TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'denied')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scripts (
    id TEXT PRIMARY KEY,
    story_lead_id TEXT REFERENCES story_leads(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'writing' CHECK(status IN ('writing', 'draft', 'final', 'exported')),
    title_options TEXT NOT NULL DEFAULT '[]',
    thumbnail_direction TEXT NOT NULL DEFAULT '{}',
    word_count INTEGER NOT NULL DEFAULT 0,
    estimated_runtime TEXT NOT NULL DEFAULT '',
    chapter_count INTEGER NOT NULL DEFAULT 0,
    chapters TEXT NOT NULL DEFAULT '[]',
    hook TEXT NOT NULL DEFAULT '',
    outro TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    exported_at TEXT
  );
`);

export default db;
