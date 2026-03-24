import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { StoryLeadRow, rowToLead } from '@/lib/types';

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status');
  let rows: StoryLeadRow[];

  if (status) {
    rows = db.prepare('SELECT * FROM story_leads WHERE status = ? ORDER BY created_at DESC').all(status) as StoryLeadRow[];
  } else {
    rows = db.prepare('SELECT * FROM story_leads ORDER BY created_at DESC').all() as StoryLeadRow[];
  }

  return NextResponse.json(rows.map(rowToLead));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, summary, sources, hookAngle, tier, criteriaMet } = body;

  if (!title || !category || !summary) {
    return NextResponse.json({ error: 'title, category, and summary are required' }, { status: 400 });
  }

  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO story_leads (id, title, category, summary, sources, hook_angle, tier, criteria_met, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(
    id,
    title,
    category,
    summary,
    JSON.stringify(sources || []),
    hookAngle || '',
    tier || 1,
    JSON.stringify(criteriaMet || []),
    now,
    now
  );

  const row = db.prepare('SELECT * FROM story_leads WHERE id = ?').get(id) as StoryLeadRow;
  return NextResponse.json(rowToLead(row), { status: 201 });
}
