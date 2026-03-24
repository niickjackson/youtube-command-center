'use client';

import { useEffect, useState, useCallback } from 'react';
import type { StoryLead } from '@/lib/types';

const categoryColors: Record<string, string> = {
  Space: 'text-cyan-accent',
  Science: 'text-emerald-400',
  Tech: 'text-blue-400',
  Ocean: 'text-blue-300',
  Archaeology: 'text-amber-400',
  History: 'text-gold-accent',
};

export default function ApprovedPage() {
  const [leads, setLeads] = useState<StoryLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(() => {
    fetch('/api/leads?status=approved')
      .then(r => r.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleMarkWritten(lead: StoryLead) {
    setMarkingIds(prev => new Set(prev).add(lead.id));

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'written' }),
      });

      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== lead.id));
      }
    } finally {
      setMarkingIds(prev => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  }

  return (
    <div className="app-container">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-emerald-400">Approved</span> Leads
        </h1>
        <p className="text-white/40 text-sm mt-1">{leads.length} approved stories</p>
      </div>

      <div className="px-4 pb-24 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-5 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          ))
        ) : leads.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">&#9989;</div>
            <p className="text-white/30">No approved leads waiting for scripts</p>
          </div>
        ) : (
          leads.map(lead => {
            const isMarking = markingIds.has(lead.id);

            return (
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

                <p className="text-sm text-white/60 leading-relaxed mb-2 line-clamp-3">
                  {lead.summary}
                </p>

                {lead.sources.length > 0 && (
                  <p className="text-xs text-white/30 mb-2">
                    {lead.sources.map(s => s.publisher).filter(Boolean).join(', ') || `${lead.sources.length} source${lead.sources.length > 1 ? 's' : ''}`}
                  </p>
                )}

                {lead.hookAngle && (
                  <p className="text-xs text-gold-accent/70 mb-3 italic">
                    Hook: {lead.hookAngle}
                  </p>
                )}

                <div className="pt-3 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleMarkWritten(lead)}
                    disabled={isMarking}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isMarking ? 'Marking...' : 'Script Written \u2713'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
