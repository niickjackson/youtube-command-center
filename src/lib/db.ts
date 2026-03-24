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

      CREATE TABLE IF NOT EXISTS scripts (
        id TEXT PRIMARY KEY,
        story_lead_id TEXT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'writing',
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
    // Migrate old statuses to new ones
    await db.executeMultiple(`
      UPDATE scripts SET status = 'ready' WHERE status IN ('draft', 'final');
      UPDATE scripts SET status = 'ready' WHERE status = 'exported' AND chapters != '[]';
    `);

    initialized = true;
  }
  return db;
}

