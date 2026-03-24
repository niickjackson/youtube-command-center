import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CountRow { count: number }

export async function GET() {
  const leadsPending = (db.prepare("SELECT COUNT(*) as count FROM story_leads WHERE status = 'pending'").get() as CountRow).count;
  const leadsApproved = (db.prepare("SELECT COUNT(*) as count FROM story_leads WHERE status = 'approved'").get() as CountRow).count;
  const leadsDenied = (db.prepare("SELECT COUNT(*) as count FROM story_leads WHERE status = 'denied'").get() as CountRow).count;
  const leadsTotal = (db.prepare("SELECT COUNT(*) as count FROM story_leads").get() as CountRow).count;

  const scriptsWriting = (db.prepare("SELECT COUNT(*) as count FROM scripts WHERE status = 'writing'").get() as CountRow).count;
  const scriptsDraft = (db.prepare("SELECT COUNT(*) as count FROM scripts WHERE status = 'draft'").get() as CountRow).count;
  const scriptsFinal = (db.prepare("SELECT COUNT(*) as count FROM scripts WHERE status = 'final'").get() as CountRow).count;
  const scriptsExported = (db.prepare("SELECT COUNT(*) as count FROM scripts WHERE status = 'exported'").get() as CountRow).count;
  const scriptsTotal = (db.prepare("SELECT COUNT(*) as count FROM scripts").get() as CountRow).count;

  return NextResponse.json({
    leads: { pending: leadsPending, approved: leadsApproved, denied: leadsDenied, total: leadsTotal },
    scripts: { writing: scriptsWriting, draft: scriptsDraft, final: scriptsFinal, exported: scriptsExported, total: scriptsTotal },
  });
}
