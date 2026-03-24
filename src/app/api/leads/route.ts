import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { StoryLeadRow, rowToLead } from '@/lib/types';

export async function GET(req: NextRequest) {
  const db = await getDb();
  const status = req.nextUrl.searchParams.get('status');
  let rows: StoryLeadRow[];

  if (status) {
    const result = await db.execute({ sql: 'SELECT * FROM story_leads WHERE status = ? ORDER BY created_at DESC', args: [status] });
    rows = result.rows as unknown as StoryLeadRow[];
  } else {
    const result = await db.execute({ sql: 'SELECT * FROM story_leads ORDER BY created_at DESC', args: [] });
    rows = result.rows as unknown as StoryLeadRow[];
  }

  return NextResponse.json(rows.map(rowToLead));
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { title, category, summary, sources, hookAngle, tier, criteriaMet } = body;

  if (!title || !category || !summary) {
    return NextResponse.json({ error: 'title, category, and summary are required' }, { status: 400 });
  }

  const id = uuid();
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO story_leads (id, title, category, summary, sources, hook_angle, tier, criteria_met, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    args: [id, title, category, summary, JSON.stringify(sources || []), hookAngle || '', tier || 1, JSON.stringify(criteriaMet || []), now, now],
  });

  const result = await db.execute({ sql: 'SELECT * FROM story_leads WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as StoryLeadRow;
  return NextResponse.json(rowToLead(row), { status: 201 });
}
