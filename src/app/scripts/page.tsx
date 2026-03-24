'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Script } from '@/lib/types';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchScripts() {
    fetch('/api/scripts')
      .then(r => r.json())
      .then(data => { setScripts(data); setLoading(false); });
  }

  useEffect(() => {
    fetchScripts();
  }, []);

  // Poll while any scripts are in 'writing' status
  useEffect(() => {
    const hasWriting = scripts.some(s => s.status === 'writing');
    if (!hasWriting) return;

    const interval = setInterval(fetchScripts, 5000);
    return () => clearInterval(interval);
  }, [scripts]);

  // Sort: writing first, then ready, then filmed at bottom
  const sorted = [...scripts].sort((a, b) => {
    const order = { writing: 0, ready: 1, filmed: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });

  return (
    <div className="app-container">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-accent">Script</span> Library
        </h1>
        <p className="text-white/40 text-sm mt-1">{scripts.length} scripts</p>
      </div>

      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-5 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-4 bg-white/5 rounded w-1/3" />
            </div>
          ))
        ) : scripts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">&#128221;</div>
            <p className="text-white/30">No scripts yet</p>
          </div>
        ) : (
          sorted.map(script => {
            if (script.status === 'writing') {
              return (
                <div key={script.id} className="glass-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white/60 leading-tight">
                        {script.title}
                      </h3>
                      <span className="text-xs font-medium text-cyan-accent animate-pulse">
                        Writing...
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            const isFilmed = script.status === 'filmed';

            return (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                className={`glass-card p-5 block group ${isFilmed ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isFilmed && (
                        <span className="text-emerald-400 flex-shrink-0">&#10003;</span>
                      )}
                      <h3 className={`text-base font-semibold leading-tight ${
                        isFilmed ? 'text-white/50' : 'text-white group-hover:text-cyan-accent transition-colors'
                      }`}>
                        {script.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                      {script.wordCount > 0 && (
                        <span className="text-xs text-white/40">
                          {script.wordCount.toLocaleString()} words
                        </span>
                      )}
                      {script.estimatedRuntime && (
                        <span className="text-xs text-white/40">{script.estimatedRuntime}</span>
                      )}
                      {script.chapterCount > 0 && (
                        <span className="text-xs text-white/40">{script.chapterCount} ch.</span>
                      )}
                    </div>
                  </div>
                  <svg className={`h-5 w-5 flex-shrink-0 ml-3 transition-colors ${
                    isFilmed ? 'text-white/10' : 'text-white/20 group-hover:text-cyan-accent'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
