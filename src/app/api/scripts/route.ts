import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { ScriptRow, rowToScript } from '@/lib/types';

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  let rows: ScriptRow[];

  if (status) {
    rows = db.prepare('SELECT * FROM scripts WHERE status = ? ORDER BY created_at DESC').all(status) as ScriptRow[];
  } else {
    rows = db.prepare('SELECT * FROM scripts ORDER BY created_at DESC').all() as ScriptRow[];
  }

  return NextResponse.json(rows.map(rowToScript));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    storyLeadId, title, titleOptions, thumbnailDirection,
    wordCount, estimatedRuntime, chapterCount, chapters,
    hook, outro, status
  } = body;

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO scripts (id, story_lead_id, title, status, title_options, thumbnail_direction,
      word_count, estimated_runtime, chapter_count, chapters, hook, outro, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    storyLeadId || null,
    title,
    status || 'writing',
    JSON.stringify(titleOptions || []),
    JSON.stringify(thumbnailDirection || {}),
    wordCount || 0,
    estimatedRuntime || '',
    chapterCount || 0,
    JSON.stringify(chapters || []),
    hook || '',
    outro || '',
    now,
    now
  );

  const row = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as ScriptRow;
  return NextResponse.json(rowToScript(row), { status: 201 });
}
