import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ScriptRow, rowToScript } from '@/lib/types';
import { generatePDF } from '@/lib/pdf';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await params;
  const result = await db.execute({ sql: 'SELECT * FROM scripts WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as ScriptRow | undefined;

  if (!row) {
    return NextResponse.json({ error: 'Script not found' }, { status: 404 });
  }

  const script = rowToScript(row);
  const pdfBuffer = generatePDF(script);

  // Record export timestamp
  await db.execute({ sql: "UPDATE scripts SET exported_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", args: [id] });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${script.title.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf"`,
    },
  });
}
