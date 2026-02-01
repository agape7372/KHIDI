# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KHIDI AI 채용 비서 - A dual-stack application for Korean Health Industry Development Institute (한국보건산업진흥원) job seekers, focusing on In-Basket (인바스켓) exercise preparation.

**Stack:**
- Frontend: Next.js 16 (React 19) + TypeScript + Tailwind CSS 4
- Backend: Next.js API routes + Python Streamlit
- AI: Google Gemini API (gemini-2.5-flash)
- Database: SQLite
- Web Scraping: cheerio (JS) / BeautifulSoup4 + pdfplumber (Python)

## Commands

### Next.js Application (khidi-dashboard/)
```bash
cd khidi-dashboard
npm install          # Install dependencies
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm start            # Production server
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript type check
```

### Python Streamlit Application (root)
```bash
pip install -r requirements.txt
streamlit run app.py    # http://localhost:8501
```

## Architecture

### Data Flow
```
User Interface (Next.js React)
         ↓
    API Routes (/api/analyze, /api/crawl)
         ↓
   ┌─────┴─────┐
   ↓           ↓
Gemini AI   Web Scraper → SQLite
(Analysis)  (KHIDI sites)
```

### Key Directories
- `khidi-dashboard/app/` - Next.js pages and API routes
- `khidi-dashboard/components/` - React UI components
- `khidi-dashboard/components/briefing/` - Learning mode components
- `khidi-dashboard/hooks/useFilters.ts` - Filter state management
- `khidi-dashboard/lib/` - Types, constants, mock data
- `app.py` - Standalone Streamlit app (parallel implementation)

### Pages
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/ai-newsfeed` | Briefing list with AI analysis |
| `/briefing/[id]` | Learning mode - 3-panel study interface |
| `/organization` | Organization info |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Generate In-Basket analysis via Gemini AI |
| `/api/analyze?apiKey=KEY` | GET | Predict 2026 promising job positions |
| `/api/crawl?detail=true` | GET | Scrape KHIDI official boards |

### Learning Mode Components (`components/briefing/`)

| Component | Purpose |
|-----------|---------|
| `StudySidebar` | Progress checklist with localStorage persistence |
| `BriefingContent` | AI analysis display with markdown parsing |
| `AnswerGuide` | In-basket answer templates (기획안, 문제점/해결방안) |
| `MockTestModal` | Mock test with timer (stopwatch/countdown), auto-save, Word export |
| `TextToolbar` | Floating toolbar for text formatting (highlight, bold, italic) |

### Filter System
5-dimensional filtering: type, category, layer, region, source + free-text search

## Environment Variables

```bash
# khidi-dashboard/.env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key  # Client-side
GEMINI_API_KEY=your_key              # Server-side
```

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `gemini_api_key` | User's Gemini API key |
| `khidi-analysis-{id}` | Saved AI analysis per article |
| `study_progress_{id}` | Learning checklist progress |
| `briefing_bookmarks` | Bookmarked article IDs |
| `mocktest_plan_{id}` | Mock test 기획안 answers |
| `mocktest_problem_{id}` | Mock test 문제점/해결방안 answers |

## Key Integration Points

1. **Gemini AI prompts** are in:
   - `khidi-dashboard/app/api/analyze/route.ts` (In-Basket format)
   - `app.py` lines 335-370, 387-415

2. **AI Analysis Markdown Format** (returned by `/api/analyze`):
   - `## 📋 현황 및 배경`
   - `## ⚠️ 핵심 문제점`
   - `## 💡 대응 방안` → `### 단기`, `### 중기`
   - `## 📈 기대 효과` → `### 정량적 성과`, `### 정성적 성과`

3. **KHIDI crawl targets**:
   - 보건산업브리프: menuId=MENU00085
   - 글로벌보건산업동향: menuId=MENU00949
   - 뉴스레터: menuId=MENU00094

4. **Auto-categorization** keywords in `app.py:423-436`

## Language Note

This application serves Korean users preparing for KHIDI recruitment. All UI text, prompts, and generated content should be in Korean.
