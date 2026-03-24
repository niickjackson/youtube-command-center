import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ScriptRow, rowToScript } from '@/lib/types';
import type { InValue } from '@libsql/client';

/**
 * PUT /api/scripts/:id/content
 * Accepts full script chapter content and metadata.
 * Body: { chapters, titleOptions?, thumbnailDirection?, wordCount?, estimatedRuntime?, chapterCount?, hook?, outro?, status? }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await params;
  const body = await req.json();

  const existingResult = await db.execute({ sql: 'SELECT * FROM scripts WHERE id = ?', args: [id] });
  if (!existingResult.rows[0]) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  if (!body.chapters || !Array.isArray(body.chapters)) {
    return NextResponse.json({ error: 'chapters array is required' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: InValue[] = [];

  // Always update chapters
  updates.push('chapters = ?');
  values.push(JSON.stringify(body.chapters));

  // Auto-compute chapter count
  updates.push('chapter_count = ?');
  values.push(body.chapterCount ?? body.chapters.length);

  // Auto-compute word count if not provided
  if (body.wordCount !== undefined) {
    updates.push('word_count = ?');
    values.push(body.wordCount);
  } else {
    let wordCount = 0;
    for (const chapter of body.chapters) {
      for (const section of chapter.sections || []) {
        if (section.text) {
          wordCount += section.text.split(/\s+/).filter(Boolean).length;
        }
      }
    }
    updates.push('word_count = ?');
    values.push(wordCount);
  }

  if (body.titleOptions !== undefined) { updates.push('title_options = ?'); values.push(JSON.stringify(body.titleOptions)); }
  if (body.thumbnailDirection !== undefined) { updates.push('thumbnail_direction = ?'); values.push(JSON.stringify(body.thumbnailDirection)); }
  if (body.estimatedRuntime !== undefined) { updates.push('estimated_runtime = ?'); values.push(body.estimatedRuntime); }
  if (body.hook !== undefined) { updates.push('hook = ?'); values.push(body.hook); }
  if (body.outro !== undefined) { updates.push('outro = ?'); values.push(body.outro); }
  if (body.status) {
    if (!['writing', 'draft', 'final', 'exported'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    updates.push('status = ?');
    values.push(body.status);
  }

  updates.push("updated_at = datetime('now')");
  values.push(id);

  await db.execute({ sql: `UPDATE scripts SET ${updates.join(', ')} WHERE id = ?`, args: values });

  const result = await db.execute({ sql: 'SELECT * FROM scripts WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as ScriptRow;
  return NextResponse.json(rowToScript(row));
}
