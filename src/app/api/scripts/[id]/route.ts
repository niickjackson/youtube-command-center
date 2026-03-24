import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ScriptRow, rowToScript } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as ScriptRow | undefined;

  if (!row) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  return NextResponse.json(rowToScript(row));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const existing = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as ScriptRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.status) {
    if (!['writing', 'draft', 'final', 'exported'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.push('status = ?');
    values.push(body.status);
  }
  if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
  if (body.titleOptions !== undefined) { updates.push('title_options = ?'); values.push(JSON.stringify(body.titleOptions)); }
  if (body.thumbnailDirection !== undefined) { updates.push('thumbnail_direction = ?'); values.push(JSON.stringify(body.thumbnailDirection)); }
  if (body.wordCount !== undefined) { updates.push('word_count = ?'); values.push(body.wordCount); }
  if (body.estimatedRuntime !== undefined) { updates.push('estimated_runtime = ?'); values.push(body.estimatedRuntime); }
  if (body.chapterCount !== undefined) { updates.push('chapter_count = ?'); values.push(body.chapterCount); }
  if (body.chapters !== undefined) { updates.push('chapters = ?'); values.push(JSON.stringify(body.chapters)); }
  if (body.hook !== undefined) { updates.push('hook = ?'); values.push(body.hook); }
  if (body.outro !== undefined) { updates.push('outro = ?'); values.push(body.outro); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE scripts SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const row = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as ScriptRow;
  return NextResponse.json(rowToScript(row));
}
