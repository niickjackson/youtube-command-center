import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { StoryLeadRow, rowToLead } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['pending', 'approved', 'denied'].includes(status)) {
    return NextResponse.json({ error: 'Valid status required (pending, approved, denied)' }, { status: 400 });
  }

  const existing = db.prepare('SELECT * FROM story_leads WHERE id = ?').get(id) as StoryLeadRow | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  db.prepare('UPDATE story_leads SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, id);

  const row = db.prepare('SELECT * FROM story_leads WHERE id = ?').get(id) as StoryLeadRow;
  return NextResponse.json(rowToLead(row));
}
