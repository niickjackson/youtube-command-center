'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
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
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-cyan-accent">Script</span> Library
          </h1>
          <p className="text-white/40 mt-1">Manage and export your scripts</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-space-dark rounded-lg w-fit border border-space-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-accent/10 text-cyan-accent'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-1/2 mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/30">No {activeTab} scripts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map(script => (
              <Link
                key={script.id}
                href={`/scripts/${script.id}`}
                className="glass-card p-5 block group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-accent transition-colors truncate">
                      {script.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusBadge status={script.status} />
                      <span className="text-xs text-white/40">
                        {script.wordCount.toLocaleString()} words
                      </span>
                      <span className="text-xs text-white/40">{script.estimatedRuntime}</span>
                      <span className="text-xs text-white/40">{script.chapterCount} chapters</span>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-white/20 group-hover:text-cyan-accent transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
