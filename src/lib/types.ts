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
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  updatedAt: string;
}

export interface TitleOption {
  title: string;
  charCount: number;
  pattern: string;
}

export interface ThumbnailDirection {
  text: string;
  visual: string;
  optional?: string;
  remember?: string;
}

export interface EditorNote {
  text: string;
}

export interface ScriptSection {
  type: 'voice_over' | 'on_camera';
  text: string;
  editorNotes: string[];
}

export interface Chapter {
  name: string;
  timestamp: string;
  sections: ScriptSection[];
}

export interface Script {
  id: string;
  storyLeadId: string | null;
  title: string;
  status: 'writing' | 'draft' | 'final' | 'exported';
  titleOptions: TitleOption[];
  thumbnailDirection: ThumbnailDirection;
  wordCount: number;
  estimatedRuntime: string;
  chapterCount: number;
  chapters: Chapter[];
  hook: string;
  outro: string;
  createdAt: string;
  updatedAt: string;
  exportedAt: string | null;
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

export interface ScriptRow {
  id: string;
  story_lead_id: string | null;
  title: string;
  status: string;
  title_options: string;
  thumbnail_direction: string;
  word_count: number;
  estimated_runtime: string;
  chapter_count: number;
  chapters: string;
  hook: string;
  outro: string;
  created_at: string;
  updated_at: string;
  exported_at: string | null;
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

export function rowToScript(row: ScriptRow): Script {
  return {
    id: row.id,
    storyLeadId: row.story_lead_id,
    title: row.title,
    status: row.status as Script['status'],
    titleOptions: JSON.parse(row.title_options),
    thumbnailDirection: JSON.parse(row.thumbnail_direction),
    wordCount: row.word_count,
    estimatedRuntime: row.estimated_runtime,
    chapterCount: row.chapter_count,
    chapters: JSON.parse(row.chapters),
    hook: row.hook,
    outro: row.outro,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exportedAt: row.exported_at,
  };
}
