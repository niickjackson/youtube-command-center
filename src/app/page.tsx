'use client';

import { useEffect, useState } from 'react';
import type { StoryLead } from '@/lib/types';

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

export default function PendingPage() {
  const [leads, setLeads] = useState<StoryLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  function fetchLeads() {
    setLoading(true);
    fetch('/api/leads?status=pending')
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false); });
  }

  async function updateStatus(id: string, status: 'approved' | 'denied') {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="app-container">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-accent">Pending</span> Review
        </h1>
        <p className="text-white/40 text-sm mt-1">{leads.length} leads awaiting review</p>
      </div>

      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-5 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-4 bg-white/5 rounded w-full mb-2" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
          ))
        ) : leads.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">&#128229;</div>
            <p className="text-white/30">No pending leads</p>
            <p className="text-white/20 text-sm mt-1">All caught up!</p>
          </div>
        ) : (
          leads.map(lead => (
            <div key={lead.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white leading-tight">{lead.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs font-medium ${categoryColors[lead.category] || 'text-white/60'}`}>
                      {lead.category}
                    </span>
                    <span className="text-white/20">&#8226;</span>
                    <span className="text-xs text-white/40">Tier {lead.tier}</span>
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
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {lead.criteriaMet.map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-cyan-accent/10 text-cyan-accent/70 border border-cyan-accent/20">
                      {criteriaLabels[c] || c}
                    </span>
                  ))}
                </div>
              )}

              {lead.sources.length > 0 && (
                <div className="mb-3">
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

              <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => updateStatus(lead.id, 'approved')}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 active:scale-[0.98] transition-all border border-emerald-500/20"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(lead.id, 'denied')}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 active:scale-[0.98] transition-all border border-red-500/20"
                >
                  Deny
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
