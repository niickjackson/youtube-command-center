import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CountRow { count: number }

export async function GET() {
  const db = await getDb();

  const leadsPending = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'pending'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsApproved = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'approved'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsDenied = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'denied'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsWritten = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'written'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsTotal = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads", args: [] })).rows[0] as unknown as CountRow).count;

  return NextResponse.json({
    leads: { pending: leadsPending, approved: leadsApproved, denied: leadsDenied, written: leadsWritten, total: leadsTotal },
  });
}
