# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KHIDI AI 채용 비서 - A Next.js application for Korean Health Industry Development Institute (한국보건산업진흥원) job seekers, focusing on In-Basket (인바스켓) exercise preparation.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Google Gemini API

## Commands

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # TypeScript type check
```

## Architecture

### Data Flow
```
User Interface (React)
         ↓
    API Routes (/api/analyze, /api/crawl)
         ↓
   ┌─────┴─────┐
   ↓           ↓
Gemini AI   Web Scraper (cheerio)
(Analysis)  (KHIDI sites)
```

### Key Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/ai-newsfeed` | Briefing list with filtering and AI analysis |
| `/briefing/[id]` | Learning mode - 3-panel study interface |
| `/organization` | Organization info |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | Generate In-Basket analysis via Gemini AI |
| `/api/analyze?apiKey=KEY` | GET | Predict 2026 promising job positions |
| `/api/crawl?detail=true` | GET | Scrape KHIDI official boards |

### Theme System (`lib/themes.ts`)

Global theming via `Theme` interface with colors, decorations, and patterns. Components accept optional `theme` prop - when omitted, defaults to `getTheme('default')`.

- **ThemeType**: `'default'` | `'strawberry'` | `'milktea'` | `'mintchoco'` | `'cloud'`
- **Available themes** (5 total, 개성있는 컨셉):
  - 🎨 기본 (default) - 클린 모던 스타일
  - 🍓 딸기초코 (strawberry) - 딸기+초콜릿 카페, ♥ 불릿, 핑크+브라운
  - 🧸 밀크티베어 (milktea) - 곰돌이 카페, 🍪 불릿, 밀크티+꿀색
  - 🍫 민트초코 (mintchoco) - 민트아이스크림+초코칩, ◆ 불릿, 민트+초콜릿
  - ☁️ 구름 (cloud) - 몽글 구름 공부방, ○ 불릿, 하늘+구름
- **Theme colors**: pageBg, cardBg, textPrimary, primary, blue/green/amber/violet variants
- **Decorations**: scalloped borders, stitch effects, custom bullets, dot patterns (strawberry, milktea only)

Theme is stored in `localStorage` under key `briefing_theme`.

### Filter System (`hooks/useFilters.ts`)

5-dimensional filtering: type, category, layer, region, source + free-text search. All filter components accept `theme` prop for consistent styling.

### Learning Mode Components (`components/briefing/`)

| Component | Purpose |
|-----------|---------|
| `StudySidebar` | Progress checklist with localStorage persistence |
| `BriefingContent` | AI analysis display with markdown parsing |
| `AnswerGuide` | In-basket answer templates |
| `MockTestModal` | Mock test with timer, auto-save, Word export |

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `gemini_api_key` | User's Gemini API key |
| `briefing_theme` | Selected theme (ThemeType: default, strawberry, milktea, mintchoco, cloud) |
| `khidi-analysis-{id}` | Saved AI analysis per article |
| `study_progress_{id}` | Learning checklist progress |
| `articleStack` | Crawled articles cache |
| `mockTest_autosave_{id}` | Mock test auto-save data |

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_key  # Client-side
GEMINI_API_KEY=your_key              # Server-side
```

## Language Note

This application serves Korean users. All UI text, prompts, and AI-generated content are in Korean.
