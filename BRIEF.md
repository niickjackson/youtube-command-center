# YouTube Long-Form Command Center — Build Brief

## What to Build
A space-themed, login-protected web app for managing a YouTube long-form content pipeline.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** SQLite via better-sqlite3 (simple, no external services needed)
- **Auth:** Simple password-based login (just one user — Nick). Use a hashed password stored in env var.
- **PDF Generation:** Use @react-pdf/renderer or jsPDF for client-side, OR a Next.js API route with a Python script using ReportLab
- **Styling:** Tailwind CSS
- **Hosting:** Should work with `npm run dev` locally, deployable to Vercel later

## Design Theme
- **Dark mode ONLY** — space inspired
- **Primary background:** Very dark (#0a0a0f or similar deep space black)
- **Accent color:** Cyan (#00D4FF) — matches Nick's script PDF style  
- **Secondary accent:** Gold/amber (#FFD54F) for highlights
- **Subtle star field or nebula background effects** (CSS, not heavy images)
- **Clean, minimal UI** — cards, generous spacing, no clutter
- **Fonts:** Inter or similar clean sans-serif

## Pages / Features

### 1. Login Page
- Simple password input, space themed
- Just one user, no registration needed
- Session-based auth (cookie)

### 2. Dashboard (Home)
- Overview stats: leads in queue, scripts in progress, scripts completed
- Quick actions: "View Leads", "View Scripts"
- Recent activity feed

### 3. Story Leads Page
- Card-based layout showing story leads
- Each card shows: title, category, summary, source, hook angle, tier (1 or 2), criteria met
- Status tabs: Pending | Approved | Denied
- Approve/Deny buttons on each card
- When approved, status changes and it becomes available for script writing

### 4. Scripts Page  
- List of scripts organized by status: Writing | Draft | Final | Exported
- Click into a script to see full content
- Script detail view shows the formatted script (dark background, colored markers matching the PDF style)

### 5. Script Detail Page
- Full script displayed in a web-preview that mirrors the PDF style:
  - Dark background
  - Cyan chapter headings
  - Blue (🔵 #80DEEA) voice-over markers
  - Yellow (🟡 #FFD54F) on-camera markers  
  - Gray editor notes
  - White script text
- Cover section showing: title options, thumbnail direction, stats
- "Export PDF" button → generates and downloads the PDF
- "Send to Desktop" button → saves PDF to ~/Desktop/YouTube Scripts/

### 6. API Routes
- POST /api/leads — create story leads (for Orion to upload sourced leads)
- GET /api/leads — list leads with status filter
- PATCH /api/leads/[id] — approve/deny a lead
- POST /api/scripts — create a script (for Orion to upload written scripts)
- GET /api/scripts — list scripts
- GET /api/scripts/[id] — get full script
- PATCH /api/scripts/[id] — update script status
- POST /api/scripts/[id]/export-pdf — generate PDF
- GET /api/analytics — dashboard stats
- POST /api/auth/login — login
- POST /api/auth/logout — logout

## Data Models

### StoryLead
```
id: string (uuid)
title: string
category: string (Space, Science, Tech, Ocean, Archaeology, etc.)
summary: string (2-3 paragraph summary of the story)
sources: JSON array [{url, headline, publisher}]
hookAngle: string (suggested hook angle)
tier: number (1 or 2)
criteriaMet: JSON array (["wait_what", "learned_something", "need_to_know"])
status: enum (pending, approved, denied)
createdAt: datetime
updatedAt: datetime
```

### Script
```
id: string (uuid)
storyLeadId: string (FK to StoryLead)
title: string
status: enum (writing, draft, final, exported)
titleOptions: JSON array [{title, charCount, pattern}]
thumbnailDirection: JSON {text, visual, optional, remember}
wordCount: number
estimatedRuntime: string
chapterCount: number
chapters: JSON array [{
  name: string,
  timestamp: string,
  sections: [{
    type: "voice_over" | "on_camera",
    text: string,
    editorNotes: string[]
  }]
}]
hook: string
outro: string
createdAt: datetime
updatedAt: datetime
exportedAt: datetime
```

## PDF Generation Spec
The PDF must EXACTLY match Nick's template:
- Page size: US Letter (8.5 x 11)
- Margins: 0.6" left/right, 0.6" top, 0.5" bottom
- Background: Dark gray #111111 (every page)
- Footer: Left = script title in gray (#888888, 7pt), Right = "Page X" in gray

### Cover Page (Page 1)
- Title in cyan (#00D4FF), 22pt bold
- Cyan horizontal rule, 2pt thick
- "TITLE OPTIONS" — white bold header, 2-3 numbered options with char counts in gray
- Pattern note in gray italic
- "THUMBNAIL DIRECTION" — yellow (#FFD54F) header, bullet points
- Gray separator rule
- Stats line centered: word count, runtime, chapter count

### Script Pages (Page 2+)
- Each chapter starts on new page
- Chapter heading: Cyan 16pt bold with cyan rule beneath
- Voice-over marker: ▶ VOICE-OVER in #80DEEA, 11pt bold
- On-camera marker: ▶ ON-CAMERA in #FFD54F, 11pt bold
- Script text: White #FFFFFF, 14pt, leading 22pt
- Editor notes: Gray #666666, 9pt italic, prefixed "EDITOR:"
- Simple paragraphs only — no bullets or lists in script text

## Important Notes
- This is a SEPARATE app from the short-form Script Panel
- The API needs to be clean so Orion can programmatically add leads and scripts
- PDF generation is critical — it needs to match Nick's exact spec perfectly
- The app should feel premium and polished, matching the space theme
- Mobile-friendly for checking on phone
