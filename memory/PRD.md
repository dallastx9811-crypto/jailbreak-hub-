# Jailbreak Info Hub — PRD

## Original Problem Statement
> "build a app that jailbreaks a iPhones and iPads"

User clarified: they want **Option 1 — Jailbreak Info Hub**, a polished informational site listing current jailbreak tools (Palera1n, Dopamine, Unc0ver, etc.), iOS version compatibility, device support, tutorials, and news. Educational only.

## Architecture
- **Backend**: FastAPI + Motor (async MongoDB). Static catalog data (tools, devices, news, tutorials, FAQ) stored in Python structures for simplicity. MongoDB stores only newsletter signups.
- **Frontend**: React (CRA) SPA. Single-page layout with anchor navigation. Tailwind + shadcn/ui (Select, Accordion), sonner toasts, lucide-react icons.
- **Theme**: Retro-futurism / Terminal — JetBrains Mono headings, IBM Plex Sans body, deep black #050505 background, terminal green #00FF41 accents, cyan #00E5FF secondary.

## User Personas
- **Curious tinkerer**: wants to know if their device/iOS combo is jailbreakable.
- **Researcher / journalist**: browses tools, status, and news.
- **Intermediate user**: follows tutorials and accepts risks.

## Core Requirements (static)
1. Educational disclaimer and risk warnings — must be visible.
2. Curated catalog of tools with rich metadata (SoC, iOS range, rootless/rootful, package manager).
3. Interactive compatibility checker (device + iOS → compatible tools).
4. Device support matrix with search.
5. Tutorials, news, FAQ sections.
6. Newsletter signup persisted to MongoDB.

## What's Been Implemented — 2026-02 (v1)
- [x] Backend endpoints: `/api/tools`, `/api/tools/{id}`, `/api/tools/{id}/detail`, `/api/devices`, `/api/ios-versions`, `/api/compatibility` (POST), `/api/news`, `/api/tutorials`, `/api/faq`, `/api/stats`, `/api/newsletter` (POST), `/api/chat` (POST), `/api/chat/{session_id}` (GET)
- [x] 8 jailbreak tools seeded with full install guides (commands, requirements, steps, troubleshooting)
- [x] 22 devices and 30 iOS versions seeded
- [x] Home page with: sticky glass nav, hero + disclaimer + stats, live ticker, compatibility checker, tools directory with filters, device matrix with search, tutorials accordion, news feed, FAQ accordion, risks grid, footer + newsletter form
- [x] Per-tool detail page at `/tool/:id` — hero, requirements checklist, copyable CLI commands, step-by-step install, troubleshooting, disclaimer
- [x] **Live GitHub Releases Tracker** at `/api/tools/{id}/releases` — pulls real signed binaries (.ipa/.dmg/.deb/etc.) from the maintainer's GitHub release with size, download count, and direct asset URLs. 10-min MongoDB cache with `?refresh=true` override. Renders as an interactive section on each tool detail page with one-click download buttons.
- [x] **AI Assistant (Claude Sonnet 4.5)** — floating chat panel grounded in the catalog, answers device+iOS questions with cited commands and `/tool/{id}` links, session persisted in MongoDB + localStorage
- [x] Compatibility checker results link directly to the matching tool's install guide
- [x] Retro-futurism terminal design with scanlines, grid background, blinking caret, ticker marquee
- [x] All interactive elements carry `data-testid`
- [x] Backend + Frontend E2E tested three times — 100% pass (iterations 1, 2, 3)

## Prioritized Backlog

### P1 — near-term
- Per-tool detail page with install commands & changelog
- Share-a-link: copy compatibility result as URL (e.g., `/?device=iphone-x&ios=16.7.1`)
- Dark/light toggle (dark default)

### P2 — nice-to-have
- AI-powered jailbreak Q&A (Claude Sonnet 4.5 via Emergent LLM key)
- User-submitted tweak gallery
- Admin-only seed editor for catalog updates
- Newsletter dedupe index + confirmation email
- Pull news from an RSS source automatically

## Next Tasks
- Gather user feedback on the v1 experience.
- Decide whether to add per-tool detail pages or AI assistant next.
