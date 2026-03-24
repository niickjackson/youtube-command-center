import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./data/command-center.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

export async function getDb() {
  if (!initialized) {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS story_leads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        sources TEXT NOT NULL DEFAULT '[]',
        hook_angle TEXT NOT NULL DEFAULT '',
        tier INTEGER NOT NULL DEFAULT 1,
        criteria_met TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    initialized = true;
  }
  return db;
}
