'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import StatusBadge from '@/components/StatusBadge';
import type { Script } from '@/lib/types';

export default function ScriptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sendingDesktop, setSendingDesktop] = useState(false);

  useEffect(() => {
    fetch(`/api/scripts/${id}`).then(r => {
      if (!r.ok) { router.push('/scripts'); return; }
      return r.json();
    }).then(data => { if (data) setScript(data); });
  }, [id, router]);

  async function exportPdf() {
    setExporting(true);
    const res = await fetch(`/api/scripts/${id}/export-pdf`, { method: 'POST' });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script?.title || 'script'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      // Refresh to see updated status
      const updated = await fetch(`/api/scripts/${id}`).then(r => r.json());
      setScript(updated);
    }
    setExporting(false);
  }

  async function sendToDesktop() {
    setSendingDesktop(true);
    const res = await fetch(`/api/scripts/${id}/export-pdf`, { method: 'POST' });
    if (res.ok) {
      const blob = await res.blob();
      // Save via a hidden form - for local dev, this triggers a download
      // In production, this would use a server-side save
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script?.title || 'script'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      const updated = await fetch(`/api/scripts/${id}`).then(r => r.json());
      setScript(updated);
    }
    setSendingDesktop(false);
  }

  if (!script) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="glass-card p-12 text-center animate-pulse">
            <div className="h-6 bg-white/5 rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-white/5 rounded w-1/3 mx-auto" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <button onClick={() => router.push('/scripts')} className="text-sm text-white/40 hover:text-cyan-accent mb-2 flex items-center gap-1 transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Scripts
            </button>
            <h1 className="text-2xl font-bold text-white">{script.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={script.status} />
              <span className="text-sm text-white/40">{script.wordCount.toLocaleString()} words</span>
              <span className="text-sm text-white/40">{script.estimatedRuntime}</span>
              <span className="text-sm text-white/40">{script.chapterCount} chapters</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-cyan-accent text-space-black text-sm font-semibold hover:bg-cyan-accent/90 disabled:opacity-50 transition-all cyan-glow"
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={sendToDesktop}
              disabled={sendingDesktop}
              className="px-4 py-2 rounded-lg bg-gold-accent/10 text-gold-accent text-sm font-semibold hover:bg-gold-accent/20 border border-gold-accent/30 disabled:opacity-50 transition-all"
            >
              {sendingDesktop ? 'Saving...' : 'Send to Desktop'}
            </button>
          </div>
        </div>

        {/* Script Preview — mirrors PDF style */}
        <div className="rounded-xl overflow-hidden border border-space-border">
          {/* Cover Section */}
          <div className="p-8" style={{ backgroundColor: '#111111' }}>
            {/* Title */}
            <h2 className="text-2xl font-bold uppercase" style={{ color: '#00D4FF' }}>
              {script.title}
            </h2>
            <div className="h-0.5 mt-3 mb-6" style={{ backgroundColor: '#00D4FF' }} />

            {/* Title Options */}
            {script.titleOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Title Options</h3>
                {script.titleOptions.map((opt, i) => (
                  <div key={i} className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-white">
                      {i + 1}. {opt.title}
                    </span>
                    <span className="text-xs ml-2 flex-shrink-0" style={{ color: '#888888' }}>
                      ({opt.charCount} chars)
                    </span>
                  </div>
                ))}
                {script.titleOptions[0]?.pattern && (
                  <p className="text-xs italic mt-2" style={{ color: '#888888' }}>
                    Pattern: {script.titleOptions[0].pattern}
                  </p>
                )}
              </div>
            )}

            {/* Thumbnail Direction */}
            {(script.thumbnailDirection.text || script.thumbnailDirection.visual) && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#FFD54F' }}>
                  Thumbnail Direction
                </h3>
                {script.thumbnailDirection.text && (
                  <p className="text-sm text-white/70 mb-1">
                    <span style={{ color: '#888888' }}>Text: </span>{script.thumbnailDirection.text}
                  </p>
                )}
                {script.thumbnailDirection.visual && (
                  <p className="text-sm text-white/70 mb-1">
                    <span style={{ color: '#888888' }}>Visual: </span>{script.thumbnailDirection.visual}
                  </p>
                )}
                {script.thumbnailDirection.optional && (
                  <p className="text-sm text-white/70 mb-1">
                    <span style={{ color: '#888888' }}>Optional: </span>{script.thumbnailDirection.optional}
                  </p>
                )}
                {script.thumbnailDirection.remember && (
                  <p className="text-sm text-white/70 mb-1">
                    <span style={{ color: '#888888' }}>Remember: </span>{script.thumbnailDirection.remember}
                  </p>
                )}
              </div>
            )}

            {/* Separator */}
            <div className="h-px my-6" style={{ backgroundColor: '#333333' }} />

            {/* Stats */}
            <p className="text-center text-sm" style={{ color: '#888888' }}>
              {script.wordCount.toLocaleString()} words &nbsp;&bull;&nbsp; {script.estimatedRuntime} &nbsp;&bull;&nbsp; {script.chapterCount} chapters
            </p>
          </div>

          {/* Chapters */}
          {script.chapters.map((chapter, ci) => (
            <div key={ci} className="p-8 border-t border-space-border" style={{ backgroundColor: '#111111' }}>
              {/* Chapter heading */}
              <h3 className="text-lg font-bold" style={{ color: '#00D4FF' }}>
                {chapter.name}
                {chapter.timestamp && (
                  <span className="ml-2 text-sm font-normal" style={{ color: '#00D4FF' }}>
                    [{chapter.timestamp}]
                  </span>
                )}
              </h3>
              <div className="h-px mt-2 mb-5" style={{ backgroundColor: '#00D4FF' }} />

              {chapter.sections.map((section, si) => (
                <div key={si} className="mb-6">
                  {/* Delivery marker */}
                  {section.type === 'voice_over' ? (
                    <p className="text-sm font-bold mb-3" style={{ color: '#80DEEA' }}>
                      &#9654; VOICE-OVER
                    </p>
                  ) : (
                    <p className="text-sm font-bold mb-3" style={{ color: '#FFD54F' }}>
                      &#9654; ON-CAMERA
                    </p>
                  )}

                  {/* Script text */}
                  {section.text.split('\n\n').filter(p => p.trim()).map((para, pi) => (
                    <p key={pi} className="text-white text-base leading-relaxed mb-3">
                      {para.trim()}
                    </p>
                  ))}

                  {/* Editor notes */}
                  {section.editorNotes?.map((note, ni) => (
                    <p key={ni} className="text-xs italic mt-2" style={{ color: '#666666' }}>
                      EDITOR: {note}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
