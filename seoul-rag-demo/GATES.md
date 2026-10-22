# Gates: Seoul live demo
OWNS: seoul-rag-demo/**

- [x] G1: Retrieval, empty results, citations and AI failure behavior are tested.
  CHECK: npm test
  EXPECT: pass 7
  EVIDENCE: zsh, cwd=/Users/max/Desktop/max/vide-coding; npm test --prefix seoul-rag-demo; exit 0; tests 7, pass 7, fail 0. AI responses are mocked; live AI not tested without a key.
- [x] G2: Real Seoul API returns normalized records without exposing credentials.
  CHECK: /Users/max/.nvm/versions/node/v20.19.2/bin/node --env-file=.env.local scripts/check-live.mjs
  EXPECT: LIVE_OK
  EVIDENCE: zsh, cwd=/Users/max/Desktop/max/vide-coding/seoul-rag-demo; exit 0; LIVE_OK loaded=3000, total=19652. Key omitted from output.
- [x] G3: Desktop/mobile UI supports search and source links without browser errors.
  CHECK: /Users/max/.nvm/versions/node/v20.19.2/bin/node /private/tmp/check_seoul_demo.cjs
  EXPECT: UI_OK
  EVIDENCE: zsh, cwd=/Users/max/Desktop/max/vide-coding; exit 0; results=6, mobileOverflow=false, pageErrors=0, secretFileStatus=404. Unknown query returned zero cards. Screenshots: /private/tmp/seoul-demo-desktop.png and /private/tmp/seoul-demo-mobile.png.
