import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CountRow { count: number }

export async function GET() {
  const db = await getDb();

  const leadsPending = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'pending'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsApproved = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'approved'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsDenied = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads WHERE status = 'denied'", args: [] })).rows[0] as unknown as CountRow).count;
  const leadsTotal = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM story_leads", args: [] })).rows[0] as unknown as CountRow).count;

  const scriptsWriting = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM scripts WHERE status = 'writing'", args: [] })).rows[0] as unknown as CountRow).count;
  const scriptsReady = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM scripts WHERE status = 'ready'", args: [] })).rows[0] as unknown as CountRow).count;
  const scriptsFilmed = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM scripts WHERE status = 'filmed'", args: [] })).rows[0] as unknown as CountRow).count;
  const scriptsTotal = ((await db.execute({ sql: "SELECT COUNT(*) as count FROM scripts", args: [] })).rows[0] as unknown as CountRow).count;

  return NextResponse.json({
    leads: { pending: leadsPending, approved: leadsApproved, denied: leadsDenied, total: leadsTotal },
    scripts: { writing: scriptsWriting, ready: scriptsReady, filmed: scriptsFilmed, total: scriptsTotal },
  });
}
