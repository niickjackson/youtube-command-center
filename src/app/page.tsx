'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import Link from 'next/link';

interface Stats {
  leads: { pending: number; approved: number; denied: number; total: number };
  scripts: { writing: number; draft: number; final: number; exported: number; total: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setStats);
  }, []);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-cyan-accent">Mission</span> Control
          </h1>
          <p className="text-white/40 mt-1">YouTube Long-Form Content Pipeline</p>
        </div>

        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
                <div className="h-8 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Lead Stats */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Story Leads</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="In Queue" value={stats.leads.pending} color="text-gold-accent" />
                <StatCard label="Approved" value={stats.leads.approved} color="text-emerald-400" />
                <StatCard label="Denied" value={stats.leads.denied} color="text-red-400" />
                <StatCard label="Total Leads" value={stats.leads.total} color="text-white" />
              </div>
            </div>

            {/* Script Stats */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Scripts</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Writing" value={stats.scripts.writing} color="text-blue-400" />
                <StatCard label="Draft" value={stats.scripts.draft} color="text-purple-400" />
                <StatCard label="Final" value={stats.scripts.final} color="text-cyan-accent" />
                <StatCard label="Exported" value={stats.scripts.exported} color="text-emerald-400" />
                <StatCard label="Total Scripts" value={stats.scripts.total} color="text-white" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/leads" className="glass-card p-6 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-accent transition-colors">
                      Review Story Leads
                    </h3>
                    <p className="text-white/40 text-sm mt-1">
                      {stats.leads.pending} leads waiting for review
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-white/20 group-hover:text-cyan-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link href="/scripts" className="glass-card p-6 group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-accent transition-colors">
                      View Scripts
                    </h3>
                    <p className="text-white/40 text-sm mt-1">
                      {stats.scripts.writing + stats.scripts.draft} scripts in progress
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-white/20 group-hover:text-cyan-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
