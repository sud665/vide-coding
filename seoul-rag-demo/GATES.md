# Gates: lecture-ready Seoul demo
OWNS: seoul-rag-demo/**

Scope: Prepare the existing demo as a Next.js app so the live lesson can focus on issuing the Seoul API key and setting `.env.local`.

- [x] G1: The Next.js app builds with typed page and route files.
  CHECK: npm run build
  EXPECT: Compiled successfully
  CWD: .
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/max/Desktop/max/vide-coding/seoul-rag-demo; path=0aacb69928d2/58 entries; output=○  (Static)   prerendered as static content | ƒ  (Dynamic)  server-rendered on demand

- [x] G2: Search, empty results, citation checks, and AI fallback pass behavior tests.
  CHECK: npm test
  EXPECT: pass
  CWD: .
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/max/Desktop/max/vide-coding/seoul-rag-demo; path=0aacb69928d2/58 entries; output=# todo 0 | # duration_ms 132.141041

- [x] G3: With a configured local key, the real Seoul API returns normalized records.
  CHECK: npm run check:live
  EXPECT: LIVE_OK
  CWD: .
  EVIDENCE: exit=0; shell=/bin/sh; cwd=/Users/max/Desktop/max/vide-coding/seoul-rag-demo; path=0aacb69928d2/58 entries; output=> node --env-file=.env.local --import tsx scripts/check-live.ts | LIVE_OK {"loaded":3000,"total":19658}

- [x] G4: A browser can show setup status, search, source links, and mobile layout without leaking secrets.
  EVIDENCE: Playwright UI_OK: 6 live result cards, zero page errors, no mobile horizontal overflow, /.env.local returns 404. No-key server: /api/status reports false without a value and search returns a distinct 503 setup message.

- [x] G5: The lecture README and relevant slides describe a prebuilt Next.js app and the live key setup.
  EVIDENCE: README gives the key-entry and local-search script. Deck slides 13–16 show key issuance, .env.local, prepared app, and four states in that order; browser layout check found zero slide overflow or SVG text outside bounds. Lecture build reports LECTURE_BUILD_OK.
