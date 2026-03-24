'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    Promise.all([
      fetch('/api/leads?status=approved').then(r => r.json()),
      fetch('/api/scripts').then(r => r.json()),
    ]).then(([leadsData, scriptsData]) => {
      setLeads(leadsData);
      setScripts(scriptsData);
      setLoading(false);
    });
  }, []);

  function getScriptStatus(leadId: string): { label: string; color: string } {
    const script = scripts.find(s => s.storyLeadId === leadId);
    if (!script) return { label: 'Awaiting Script', color: 'text-white/30' };
    if (script.status === 'writing') return { label: 'Script In Progress', color: 'text-blue-400' };
    if (script.status === 'draft') return { label: 'Draft Ready', color: 'text-purple-400' };
    if (script.status === 'final') return { label: 'Script Final', color: 'text-cyan-accent' };
    if (script.status === 'exported') return { label: 'Exported', color: 'text-emerald-400' };
    return { label: 'Awaiting Script', color: 'text-white/30' };
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
            <p className="text-white/30">No approved leads yet</p>
          </div>
        ) : (
          leads.map(lead => {
            const scriptStatus = getScriptStatus(lead.id);
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

                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                  <div className={`w-2 h-2 rounded-full ${
                    scriptStatus.label === 'Awaiting Script' ? 'bg-white/20' :
                    scriptStatus.label === 'Script In Progress' ? 'bg-blue-400 animate-pulse' :
                    scriptStatus.label === 'Draft Ready' ? 'bg-purple-400' :
                    scriptStatus.label === 'Script Final' ? 'bg-cyan-accent' :
                    'bg-emerald-400'
                  }`} />
                  <span className={`text-xs font-medium ${scriptStatus.color}`}>
                    {scriptStatus.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
