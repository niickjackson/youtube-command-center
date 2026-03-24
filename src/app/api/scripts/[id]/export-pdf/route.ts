import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ScriptRow, rowToScript } from '@/lib/types';
import { generatePDF } from '@/lib/pdf';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const row = db.prepare('SELECT * FROM scripts WHERE id = ?').get(id) as ScriptRow | undefined;

  if (!row) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  const script = rowToScript(row);
  const pdfBuffer = generatePDF(script);

  // Update status to exported
  db.prepare("UPDATE scripts SET status = 'exported', exported_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(id);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${script.title.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf"`,
    },
  });
}
