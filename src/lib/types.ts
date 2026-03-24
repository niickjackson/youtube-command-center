export interface Source {
  url: string;
  headline: string;
  publisher: string;
}

export interface StoryLead {
  id: string;
  title: string;
  category: string;
  summary: string;
  sources: Source[];
  hookAngle: string;
  tier: number;
  criteriaMet: string[];
  status: 'pending' | 'approved' | 'denied' | 'written';
  createdAt: string;
  updatedAt: string;
}

// DB row types (JSON fields are strings)
export interface StoryLeadRow {
  id: string;
  title: string;
  category: string;
  summary: string;
  sources: string;
  hook_angle: string;
  tier: number;
  criteria_met: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function rowToLead(row: StoryLeadRow): StoryLead {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    sources: JSON.parse(row.sources),
    hookAngle: row.hook_angle,
    tier: row.tier,
    criteriaMet: JSON.parse(row.criteria_met),
    status: row.status as StoryLead['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
