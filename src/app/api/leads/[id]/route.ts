import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { StoryLeadRow, rowToLead } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['pending', 'approved', 'denied', 'written'].includes(status)) {
    return NextResponse.json({ error: 'Valid status required (pending, approved, denied, written)' }, { status: 400 });
  }

  const existingResult = await db.execute({ sql: 'SELECT * FROM story_leads WHERE id = ?', args: [id] });
  if (!existingResult.rows[0]) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  await db.execute({ sql: "UPDATE story_leads SET status = ?, updated_at = datetime('now') WHERE id = ?", args: [status, id] });

  const result = await db.execute({ sql: 'SELECT * FROM story_leads WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as StoryLeadRow;
  return NextResponse.json(rowToLead(row));
}
