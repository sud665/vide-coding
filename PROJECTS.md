# 강의 사이트와 실습 앱 분리

## 현재 강의 사이트 (이 폴더)

- `index.html`: 현재 OT 교재의 메인 사본.
- `sesac-ot-vibe-coding.html`: 현재 OT 교재 원본. 수정 후 index.html에도 반영하세요.
- `live-demo-guide.html`: 빈 폴더에서 앱을 만드는 복사 가능한 단계별 프롬프트. 상단 헤더 없음.
- `archive.html`: 이전 자료 목록.
- `archive/`: 이번 정리 직전 파일 보존본.
- `hackathon.html`, `claude-code-beginner.html`: 기존 교재 유지.

Vercel Root Directory는 이 저장소 루트입니다. `vercel.json`은 `node scripts/build-lecture.mjs`로 강의 파일만 `lecture-public/`에 복사해 배포합니다. 개인 문서·데모 앱·환경변수는 배포 출력에서 제외됩니다. 기존 Vercel 프로젝트에 저장된 Build/Output override가 있으면 이 설정과 맞추세요. 이 변경은 로컬에서만 적용했으며 공개 사이트 배포는 아직 실행하지 않았습니다.

## 기존 완성 데모 (`seoul-rag-demo/`)

참고·복구용 독립 앱입니다. 자체 package.json·vercel.json·환경변수를 사용하며 강의 사이트 출력에는 포함되지 않습니다. 배포할 경우 별도 Vercel 프로젝트의 Root Directory를 `seoul-rag-demo`로 지정합니다. 루트 강의 사이트와 같은 Vercel 프로젝트를 연결하지 마세요.

## 라이브에서 새로 만드는 앱

이 강의자료 폴더 밖에 빈 폴더를 만들고 AI 코딩 도구로 여세요. 프롬프트 00부터 순서대로 붙여 넣습니다. 매 단계 검증 후 다음 단계로 진행합니다. API 키는 실제 값을 프롬프트에 넣지 않고 로컬 환경변수에 직접 입력합니다. 이 앱도 새 Vercel 프로젝트로 배포합니다.

25분 기본 흐름: 인증키 설명 → 계획 → 화면 → 실제 데이터 → 검색 → 검증 → 배포. AI 답변 단계는 키와 시간이 준비되면 추가합니다. 설치·생성·배포 시간은 환경에 따라 달라집니다.
