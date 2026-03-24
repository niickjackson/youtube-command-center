'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StoryLead } from '@/lib/types';

interface Stats {
  leads: { pending: number; approved: number; denied: number; total: number };
  scripts: { writing: number; ready: number; filmed: number; total: number };
}

export default function MorePage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rejected, setRejected] = useState<StoryLead[]>([]);
  const [showRejected, setShowRejected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then(r => r.json()),
      fetch('/api/leads?status=denied').then(r => r.json()),
    ]).then(([statsData, rejectedData]) => {
      setStats(statsData);
      setRejected(rejectedData);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading || !stats) {
    return (
      <div className="app-container">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-cyan-accent">More</span>
          </h1>
        </div>
        <div className="px-4 pb-24 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
              <div className="h-8 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const approvalRate = stats.leads.total > 0
    ? Math.round((stats.leads.approved / stats.leads.total) * 100)
    : 0;

  return (
    <div className="app-container">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-accent">Analytics</span> & More
        </h1>
        <p className="text-white/40 text-sm mt-1">Pipeline overview</p>
      </div>

      <div className="px-4 pb-24 space-y-4">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Total Leads</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.leads.total}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Approval Rate</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{approvalRate}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">In Queue</p>
            <p className="text-2xl font-bold text-gold-accent mt-1">{stats.leads.pending}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Total Scripts</p>
            <p className="text-2xl font-bold text-cyan-accent mt-1">{stats.scripts.total}</p>
          </div>
        </div>

        {/* Script Status Breakdown */}
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Script Pipeline</h3>
          <div className="space-y-2.5">
            <StatusRow label="Writing" value={stats.scripts.writing} color="bg-cyan-accent" total={stats.scripts.total} />
            <StatusRow label="Ready" value={stats.scripts.ready} color="bg-blue-400" total={stats.scripts.total} />
            <StatusRow label="Filmed" value={stats.scripts.filmed} color="bg-emerald-400" total={stats.scripts.total} />
          </div>
        </div>

        {/* Rejected Stories */}
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowRejected(!showRejected)}
            className="w-full px-4 py-4 flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-white">Rejected Stories</h3>
              <p className="text-xs text-white/40 mt-0.5">{rejected.length} denied leads</p>
            </div>
            <svg
              className={`h-5 w-5 text-white/30 transition-transform ${showRejected ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRejected && (
            <div className="border-t border-white/[0.06]">
              {rejected.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-white/30 text-sm">No rejected stories</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                  {rejected.map(lead => (
                    <div key={lead.id} className="px-4 py-3">
                      <h4 className="text-sm font-medium text-white/60">{lead.title}</h4>
                      <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{lead.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full glass-card p-4 text-center text-sm font-medium text-red-400/70 hover:text-red-400 hover:border-red-400/20 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color, total }: { label: string; value: number; color: string; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-16">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-white/60 w-6 text-right">{value}</span>
    </div>
  );
}
