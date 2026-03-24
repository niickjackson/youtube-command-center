'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import type { Script } from '@/lib/types';

const tabs = ['writing', 'draft', 'final', 'exported'] as const;

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('writing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scripts?status=${activeTab}`)
      .then(r => r.json())
      .then(data => { setScripts(data); setLoading(false); });
  }, [activeTab]);

  return (
    <div className="app-container">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-accent">Script</span> Library
        </h1>
        <p className="text-white/40 text-sm mt-1">Manage and export your scripts</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 p-1 bg-space-dark rounded-xl border border-white/[0.06]">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-cyan-accent/10 text-cyan-accent'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
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
            <p className="text-white/30">No {activeTab} scripts</p>
          </div>
        ) : (
          scripts.map(script => (
            <Link
              key={script.id}
              href={`/scripts/${script.id}`}
              className="glass-card p-5 block group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white group-hover:text-cyan-accent transition-colors leading-tight">
                    {script.title}
                  </h3>
                  <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                    <StatusBadge status={script.status} />
                    <span className="text-xs text-white/40">
                      {script.wordCount.toLocaleString()} words
                    </span>
                    <span className="text-xs text-white/40">{script.estimatedRuntime}</span>
                    <span className="text-xs text-white/40">{script.chapterCount} ch.</span>
                  </div>
                </div>
                <svg className="h-5 w-5 text-white/20 group-hover:text-cyan-accent transition-colors flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
