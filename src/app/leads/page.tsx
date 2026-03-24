'use client';

import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import StatusBadge from '@/components/StatusBadge';
import type { StoryLead } from '@/lib/types';

const tabs = ['pending', 'approved', 'denied'] as const;

const categoryColors: Record<string, string> = {
  Space: 'text-cyan-accent',
  Science: 'text-emerald-400',
  Tech: 'text-blue-400',
  Ocean: 'text-blue-300',
  Archaeology: 'text-amber-400',
  History: 'text-gold-accent',
};

const criteriaLabels: Record<string, string> = {
  wait_what: 'Wait, what?',
  learned_something: 'Learned something',
  need_to_know: 'Need to know',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<StoryLead[]>([]);
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leads?status=${activeTab}`)
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false); });
  }, [activeTab]);

  async function updateStatus(id: string, status: 'approved' | 'denied') {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-cyan-accent">Story</span> Leads
            </h1>
            <p className="text-white/40 mt-1">Review and manage incoming story leads</p>
          </div>
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

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-white/30">No {activeTab} leads</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {leads.map(lead => (
              <div key={lead.id} className="glass-card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{lead.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${categoryColors[lead.category] || 'text-white/60'}`}>
                        {lead.category}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs text-white/40">Tier {lead.tier}</span>
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-3">
                  {lead.summary}
                </p>

                {lead.hookAngle && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gold-accent">Hook: </span>
                    <span className="text-xs text-white/50">{lead.hookAngle}</span>
                  </div>
                )}

                {lead.criteriaMet.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {lead.criteriaMet.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent/70 border border-cyan-accent/20">
                        {criteriaLabels[c] || c}
                      </span>
                    ))}
                  </div>
                )}

                {lead.sources.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-white/30 mb-1">Sources:</p>
                    {lead.sources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-cyan-accent/60 hover:text-cyan-accent truncate"
                      >
                        {s.publisher}: {s.headline}
                      </a>
                    ))}
                  </div>
                )}

                {activeTab === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-space-border">
                    <button
                      onClick={() => updateStatus(lead.id, 'approved')}
                      className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(lead.id, 'denied')}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
