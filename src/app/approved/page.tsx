'use client';

import { useEffect, useState, useCallback } from 'react';
import type { StoryLead, Script } from '@/lib/types';

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
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [writingLeadIds, setWritingLeadIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(() => {
    Promise.all([
      fetch('/api/leads?status=approved').then(r => r.json()),
      fetch('/api/scripts').then(r => r.json()),
    ]).then(([leadsData, scriptsData]) => {
      setLeads(leadsData);
      setScripts(scriptsData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for script completion when any scripts are writing
  useEffect(() => {
    const hasWriting = scripts.some(s => s.status === 'writing') || writingLeadIds.size > 0;
    if (!hasWriting) return;

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [scripts, writingLeadIds, fetchData]);

  function getScriptForLead(leadId: string): Script | undefined {
    return scripts.find(s => s.storyLeadId === leadId);
  }

  async function handleWriteScript(lead: StoryLead) {
    setWritingLeadIds(prev => new Set(prev).add(lead.id));

    try {
      const res = await fetch('/api/scripts/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyLeadId: lead.id }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch {
      setWritingLeadIds(prev => {
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
        ) : leads.filter(l => !getScriptForLead(l.id)).length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">&#9989;</div>
            <p className="text-white/30">{leads.length > 0 ? 'All approved leads have scripts — check the Scripts tab!' : 'No approved leads yet'}</p>
          </div>
        ) : (
          leads.filter(l => !getScriptForLead(l.id)).map(lead => {
            const isWriting = writingLeadIds.has(lead.id);

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

                <p className="text-sm text-white/60 leading-relaxed mb-3 line-clamp-2">
                  {lead.summary}
                </p>

                <div className="pt-3 border-t border-white/[0.06]">
                  {isWriting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse" />
                      <span className="text-xs font-medium text-cyan-accent animate-pulse">
                        Writing script...
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleWriteScript(lead)}
                      className="w-full px-4 py-2.5 rounded-xl bg-cyan-accent text-space-black text-sm font-bold hover:bg-cyan-accent/90 active:scale-[0.98] transition-all cyan-glow"
                    >
                      Write Script
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
