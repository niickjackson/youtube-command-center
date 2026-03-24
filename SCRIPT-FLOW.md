# Script Flow Redesign

## Simplified Flow
Approved Lead → "Write Script" button → Claude writes it (multi-stage) → Script appears in Scripts tab → Nick exports PDF → marks as filmed

## Approved Tab Changes
- Each approved lead card gets a **"Write Script" button** (cyan, prominent)
- When tapped: triggers the script writing pipeline
- The lead card shows a loading/writing state while Claude works
- Once the script is complete, the lead disappears from Approved and a script appears in Scripts tab

## Scripts Tab Simplification
- **NO sub-status tabs** (remove writing/draft/final/exported)
- Just a list of completed scripts as cards
- Each card shows: title, word count, chapter count, date written
- Tap into a script → full formatted view (the PDF-style display)
- Two buttons at bottom of script detail:
  - **"Export PDF"** — downloads the PDF
  - **"Mark as Filmed"** ✅ — marks it done, moves it to a "filmed" state (grayed out or moved to bottom/archive)

## Script Writing Pipeline (what happens when "Write Script" is clicked)
This triggers Orion (me) to write the script via the API. The pipeline:

1. **Research** — deep dive on the topic, find 5-10 sources
2. **Internalize formula** — read the full 13-page YouTube Script Formula
3. **Outline** — map chapters, plan retention beats, emotional pacing
4. **Write** — full script following the formula exactly
5. **Generate** — create the structured data (chapters, markers, editor notes)

The API endpoint: POST /api/scripts/[id]/write — triggers the writing process
When complete, the script content is populated and status becomes "ready"

## Updated Statuses
### Leads: pending → approved → denied (no change)
### Scripts: writing → ready → filmed
- writing = Claude is working on it
- ready = script is complete, viewable, exportable
- filmed = Nick has filmed it, archived
