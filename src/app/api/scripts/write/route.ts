import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { ScriptRow, rowToScript } from '@/lib/types';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { storyLeadId } = body;

  if (!storyLeadId) {
    return NextResponse.json({ error: 'storyLeadId is required' }, { status: 400 });
  }

  // Check the lead exists and is approved
  const leadResult = await db.execute({ sql: 'SELECT * FROM story_leads WHERE id = ? AND status = ?', args: [storyLeadId, 'approved'] });
  if (!leadResult.rows[0]) {
    return NextResponse.json({ error: 'Approved lead not found' }, { status: 404 });
  }

  // Check if a script already exists for this lead
  const existingResult = await db.execute({ sql: 'SELECT * FROM scripts WHERE story_lead_id = ?', args: [storyLeadId] });
  if (existingResult.rows[0]) {
    const existingRow = existingResult.rows[0] as unknown as ScriptRow;
    return NextResponse.json(rowToScript(existingRow), { status: 200 });
  }

  const lead = leadResult.rows[0] as unknown as { title: string };
  const id = uuid();
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO scripts (id, story_lead_id, title, status, title_options, thumbnail_direction,
      word_count, estimated_runtime, chapter_count, chapters, hook, outro, created_at, updated_at)
    VALUES (?, ?, ?, 'writing', '[]', '{}', 0, '', 0, '[]', '', '', ?, ?)`,
    args: [id, storyLeadId, lead.title, now, now],
  });

  const result = await db.execute({ sql: 'SELECT * FROM scripts WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as ScriptRow;
  return NextResponse.json(rowToScript(row), { status: 201 });
}
