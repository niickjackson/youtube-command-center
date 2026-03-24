'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Script } from '@/lib/types';

export default function ScriptDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [exporting, setExporting] = useState(false);
  const [markingFilmed, setMarkingFilmed] = useState(false);

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
    }
    setExporting(false);
  }

  async function markAsFilmed() {
    setMarkingFilmed(true);
    const res = await fetch(`/api/scripts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'filmed' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setScript(updated);
    }
    setMarkingFilmed(false);
  }

  if (!script) {
    return (
      <div className="app-container">
        <div className="px-4 py-8">
          <div className="glass-card p-12 text-center animate-pulse">
            <div className="h-6 bg-white/5 rounded w-1/2 mx-auto mb-4" />
            <div className="h-4 bg-white/5 rounded w-1/3 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  const hasContent = script.chapters.length > 0 && script.chapters.some(ch => ch.sections.length > 0);

  return (
    <div className="app-container pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <button
          onClick={() => router.push('/scripts')}
          className="text-sm text-white/40 hover:text-cyan-accent mb-3 flex items-center gap-1 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Scripts
        </button>
        <h1 className="text-xl font-bold text-white leading-tight">{script.title}</h1>
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          {script.status === 'filmed' ? (
            <span className="text-xs font-medium text-emerald-400">&#10003; Filmed</span>
          ) : script.status === 'writing' ? (
            <span className="text-xs font-medium text-cyan-accent animate-pulse">Writing...</span>
          ) : (
            <span className="text-xs font-medium text-cyan-accent">Ready</span>
          )}
          {script.wordCount > 0 && (
            <span className="text-xs text-white/40">{script.wordCount.toLocaleString()} words</span>
          )}
          {script.estimatedRuntime && (
            <span className="text-xs text-white/40">{script.estimatedRuntime}</span>
          )}
          {script.chapterCount > 0 && (
            <span className="text-xs text-white/40">{script.chapterCount} chapters</span>
          )}
        </div>
      </div>

      {/* Script Preview — PDF-style dark view */}
      <div className="mx-4 rounded-xl overflow-hidden border border-white/[0.06]">
        {/* Cover Section */}
        <div className="p-6" style={{ backgroundColor: '#111111' }}>
          <h2 className="text-xl font-bold uppercase tracking-wide" style={{ color: '#00D4FF' }}>
            {script.title}
          </h2>
          <div className="h-0.5 mt-2 mb-5" style={{ backgroundColor: '#00D4FF' }} />

          {/* Title Options */}
          {script.titleOptions.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-white/80 mb-2.5 uppercase tracking-wider">Title Options</h3>
              {script.titleOptions.map((opt, i) => (
                <div key={i} className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm text-white/90">
                    {i + 1}. {opt.title}
                  </span>
                  <span className="text-[10px] ml-2 flex-shrink-0" style={{ color: '#888888' }}>
                    ({opt.charCount} chars)
                  </span>
                </div>
              ))}
              {script.titleOptions[0]?.pattern && (
                <p className="text-[11px] italic mt-2" style={{ color: '#888888' }}>
                  Pattern: {script.titleOptions[0].pattern}
                </p>
              )}
            </div>
          )}

          {/* Thumbnail Direction */}
          {(script.thumbnailDirection.text || script.thumbnailDirection.visual) && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: '#FFD54F' }}>
                Thumbnail Direction
              </h3>
              {script.thumbnailDirection.text && (
                <p className="text-sm text-white/70 mb-1">
                  <span style={{ color: '#666' }}>Text: </span>{script.thumbnailDirection.text}
                </p>
              )}
              {script.thumbnailDirection.visual && (
                <p className="text-sm text-white/70 mb-1">
                  <span style={{ color: '#666' }}>Visual: </span>{script.thumbnailDirection.visual}
                </p>
              )}
              {script.thumbnailDirection.optional && (
                <p className="text-sm text-white/70 mb-1">
                  <span style={{ color: '#666' }}>Optional: </span>{script.thumbnailDirection.optional}
                </p>
              )}
              {script.thumbnailDirection.remember && (
                <p className="text-sm text-white/70 mb-1">
                  <span style={{ color: '#666' }}>Remember: </span>{script.thumbnailDirection.remember}
                </p>
              )}
            </div>
          )}

          {/* Separator */}
          <div className="h-px my-5" style={{ backgroundColor: '#333333' }} />

          {/* Stats */}
          {script.wordCount > 0 && (
            <p className="text-center text-xs" style={{ color: '#888888' }}>
              {script.wordCount.toLocaleString()} words &nbsp;&bull;&nbsp; {script.estimatedRuntime} &nbsp;&bull;&nbsp; {script.chapterCount} chapters
            </p>
          )}
        </div>

        {/* Chapters */}
        {hasContent ? (
          script.chapters.map((chapter, ci) => (
            <div key={ci} className="p-6 border-t border-white/[0.06]" style={{ backgroundColor: '#111111' }}>
              {/* Chapter heading */}
              <h3 className="text-base font-bold" style={{ color: '#00D4FF' }}>
                {chapter.name}
                {chapter.timestamp && (
                  <span className="ml-2 text-xs font-normal opacity-70" style={{ color: '#00D4FF' }}>
                    [{chapter.timestamp}]
                  </span>
                )}
              </h3>
              <div className="h-px mt-2 mb-4" style={{ backgroundColor: '#00D4FF' }} />

              {chapter.sections.map((section, si) => (
                <div key={si} className="mb-5">
                  {/* Delivery marker */}
                  {section.type === 'voice_over' ? (
                    <p className="text-xs font-bold mb-2.5" style={{ color: '#80DEEA' }}>
                      &#9654; VOICE-OVER
                    </p>
                  ) : (
                    <p className="text-xs font-bold mb-2.5" style={{ color: '#FFD54F' }}>
                      &#9654; ON-CAMERA
                    </p>
                  )}

                  {/* Script text */}
                  {section.text.split('\n\n').filter(p => p.trim()).map((para, pi) => (
                    <p key={pi} className="text-white text-sm leading-relaxed mb-2.5">
                      {para.trim()}
                    </p>
                  ))}

                  {/* Editor notes */}
                  {section.editorNotes?.map((note, ni) => (
                    <p key={ni} className="text-[11px] italic mt-2" style={{ color: '#666666' }}>
                      EDITOR: {note}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="p-8 text-center" style={{ backgroundColor: '#111111' }}>
            <p className="text-white/20 text-sm">
              {script.status === 'writing' ? 'Script is being written...' : 'No script content yet'}
            </p>
          </div>
        )}
      </div>

      {/* Fixed bottom action buttons */}
      {script.status !== 'writing' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="mx-auto max-w-[640px] px-4 py-3 flex gap-3">
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-accent text-space-black text-sm font-bold hover:bg-cyan-accent/90 active:scale-[0.98] disabled:opacity-50 transition-all cyan-glow"
            >
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            {script.status !== 'filmed' && (
              <button
                onClick={markAsFilmed}
                disabled={markingFilmed}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                {markingFilmed ? 'Marking...' : '✓ Mark as Filmed'}
              </button>
            )}
          </div>
          <div className="h-safe-bottom bg-[#0a0a0f]/95" />
        </div>
      )}
    </div>
  );
}
