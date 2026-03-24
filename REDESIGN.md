# YouTube Command Center — Redesign Brief

## Navigation: Instagram-style Bottom Tab Bar
Replace the current top nav with a fixed bottom tab bar (mobile-first, like Instagram/TikTok).

### Tabs (left to right):
1. **📥 Pending** — Story leads awaiting review (pending status)
   - Icon: inbox/tray icon
   - Badge count showing number of pending leads
   
2. **✅ Approved** — Approved story leads ready for script writing
   - Icon: checkmark circle
   - Badge count showing approved leads

3. **📝 Scripts** — All scripts (writing, draft, final, exported)
   - Icon: document/script icon
   - This is where full script content lives with PDF export

4. **📊 More** — Analytics + Rejected stories
   - Icon: chart/grid icon
   - Analytics dashboard (leads sourced, scripts written, etc.)
   - Rejected/denied stories archive

### Tab Bar Design:
- Fixed to bottom of screen
- Dark background matching app theme (#0a0a0f or similar)
- Active tab: cyan (#00D4FF) icon + label
- Inactive tabs: gray/muted icons
- Subtle top border or glow on active tab
- Labels under icons (small text)
- Works great on mobile AND desktop

## Script Content Fix
The scripts currently only have titles — no actual content. Need to:
1. Parse the full PDF content from each script (chapters, voice-over/on-camera markers, editor notes)
2. Store the full chapter content in the database
3. Display it in the script detail page with proper formatting (dark bg, cyan headings, blue VO markers, yellow OC markers, gray editor notes)
4. The script detail page should look like a web version of the PDF — same visual language

## Pages

### Pending Tab
- Card list of pending story leads
- Each card: title, category badge, summary preview, tier indicator
- Swipe or tap to approve/deny
- Pull to refresh feel

### Approved Tab  
- Card list of approved leads
- Shows which ones have scripts written vs waiting
- Status indicator: "Awaiting Script" / "Script In Progress" / "Script Ready"

### Scripts Tab
- List of all scripts with status badges
- Tap into a script to see full formatted content
- Script detail page:
  - Cover section (title options, thumbnail direction, stats)
  - Full script with chapter headings, delivery markers, editor notes
  - "Export PDF" button
  - Status can be updated (draft → final → exported)

### More Tab
- Analytics cards at top (total leads, approval rate, scripts this week, etc.)
- Rejected stories list below (collapsible/scrollable)

## General Design Notes
- Everything should feel like a premium mobile app even on desktop
- Cards with rounded corners, subtle shadows/borders
- Smooth transitions between tabs
- Space theme consistent throughout
- Max-width container on desktop so it doesn't stretch too wide (like 480px max, centered)
- Touch-friendly tap targets
