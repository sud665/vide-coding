# 오늘 뭐 보지? — 강의용 서울 문화행사 RAG 데모

디자인 담당자를 위한 화면 구조·상태·시각 기준은 [`design.md`](./design.md)에 정리했습니다.

강의에서 단계별로 만드는 흐름을 확인할 수 있는 **Next.js App Router + TypeScript** 참고 앱입니다. [서울시 문화행사 정보](https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do)의 자료를 검색한 뒤, **실제 Gemini 답변과 공식 원문**을 확인하는 RAG 시연을 목표로 합니다.

## 로컬에서 실행

Node.js 20.9 이상을 사용합니다. 현재 앱은 Next.js 16.4.2 기준입니다.
이 컴퓨터의 기본 셸은 Node.js 16으로 시작할 수 있으므로, 아래처럼 설치된 Node.js 22로 전환합니다.

```sh
cd seoul-rag-demo
nvm use
npm install
test -f .env.local || cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 서울 키가 없으면 상단에 **서울 API 키 설정 전**이 표시됩니다. Gemini 키가 없으면 검색 카드만 표시되므로, 그 상태를 RAG 완료로 소개하지 않습니다.

이 컴퓨터의 `.env.local`에는 서울 API 키가 이미 설정되어 있을 수 있습니다. 기존 파일을 덮어쓰거나 화면에 띄우지 마세요. Gemini 키는 [Google AI Studio API Keys](https://aistudio.google.com/api-keys)에서 발급받아 **본인이 직접** 추가합니다. `.env.local`은 Git에서 제외됩니다. `GET /api/status`는 두 키의 **설정 여부만** 알려주며 값을 반환하지 않습니다.

## 강의 실습 순서

1. 새 Next.js 프로젝트에서 검색 화면과 가상 카드 3건을 만들고 로컬 브라우저에서 확인합니다.
2. 서울 열린데이터광장의 [서울시 문화행사 정보](https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do)에서 **Open API**와 인증키 신청 안내를 짚습니다. 신청서에 이용 URL을 묻는다면 이 데이터셋 주소를 적습니다. 배포 URL은 필요하지 않습니다.
3. [Google AI Studio API Keys](https://aistudio.google.com/api-keys)에서 Gemini API 키 발급 화면을 보여줍니다. 로그인·프로젝트 권한 설정이 필요할 수 있으므로 **강의 전에 본인 계정으로 발급을 마칩니다.**
4. **화면 공유를 멈춘 뒤** 프로젝트 루트 `.env.local`에 `SEOUL_API_KEY=...`와 `GEMINI_API_KEY=...`를 직접 입력합니다. 이미 있는 서울 키는 그대로 둡니다. 키 문자열과 파일 내용은 대화·슬라이드·영상에 노출하지 않습니다.
5. Route Handler로 실제 서울 API를 연결하고 검색 조건·원문 링크를 검증합니다. 개발 서버를 다시 시작합니다. 화면 상단에서 **서울 API 연결 준비 완료 · AI 요약: 연결 준비**를 확인하고 `무료 전시`를 검색합니다.
6. 검색된 기록만 Gemini에 전달한 뒤 실제 행사 카드, **AI 요약**, 참조 자료 번호와 공식 원문을 대조합니다. `양자역학 논문`처럼 관계없는 검색어로 0건일 때 AI가 답을 만들지 않는 것도 확인합니다.

실제 RAG 동작은 `npm run check:rag`로 확인합니다. 발급 절차는 공식 화면으로 설명하고, 환경변수 설정은 예시 형식을 보여준 뒤 공유를 멈추고 실제 값을 입력해도 됩니다.

## 참고 앱의 구성

- `app/page.tsx`: 검색어·자치구·무료/지난 행사 조건, 로딩·0건·오류, 결과 카드와 공식 원문 링크.
- `app/api/search/route.ts`: 입력 검증 후 서버에서만 서울 API를 호출. 키 누락, 외부 실패, 빈 결과를 구분.
- `app/api/status/route.ts`: 키 설정 여부만 제공.
- `lib/search.ts`: API 원본 필드를 앱 필드로 바꾸고 조건·키워드로 최대 6건 검색.
- `lib/service.ts`: 최대 3,000건 조회와 5분 서버 캐시. 선택적으로 찾은 자료만 Gemini에 전달하고 `sourceIds`가 실제 결과에 있는지 검사. AI 오류 때는 검색 카드 유지.
- `scripts/check-rag.ts`: 실제 서울 자료 검색 → Gemini 답변 → 검색 결과에 있는 출처 ID 연결을 한 번에 검증.
- `CLAUDE.md`: 이후 팀 실습을 위한 작업 규칙.

이 앱의 검색 단계는 지역·무료 필터와 키워드 일치입니다. **임베딩이나 벡터 DB는 사용하지 않습니다.** `GEMINI_API_KEY`가 있으면 검색된 기록을 AI에 전달해 답변을 만드는 RAG 경로로 이어지고, 키가 없으면 공공데이터 검색만 동작합니다. 벡터 검색은 문서가 많거나 표현이 달라도 비슷한 의미를 찾아야 할 때 검색 단계를 확장하는 방법입니다. 자연어 날짜 해석과 전체 데이터 검색은 하지 않습니다. AI 출처 ID 검사는 존재하는 자료를 인용했는지 확인하며, 답변의 모든 문장이 사실인지 보장하지 않습니다. 각 문장은 공식 원문과 대조해야 합니다.

## 설정과 확인

`.env.example`은 빈 키 템플릿입니다. Next.js는 루트의 `.env.local`을 서버 환경변수로 읽습니다. `SEOUL_API_KEY`에 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 변경 후 개발 서버를 다시 시작합니다.

```sh
npm test
npm run build
npm run check:live
npm run check:rag
```

`check:live`는 실제 서울 API 조회 건수만 출력합니다. `check:rag`는 Gemini 키가 없으면 실패하고, 키가 있으면 **실제 AI 답변·출처 연결 성공 시에만 `RAG_OK`**를 출력합니다. 이 검사는 출처 ID가 검색 결과에 있는지 확인하지만 답변의 모든 문장을 사실 검증하지는 않으므로, 강의 전 공식 원문을 직접 읽어야 합니다. `GEMINI_MODEL` 기본값은 `gemini-3.6-flash`이며 계정에서 사용할 수 있는 모델인지 확인하세요.

참고: [Next.js 환경변수](https://nextjs.org/docs/app/guides/environment-variables), [서울시 문화행사 정보](https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do), [Gemini API 키 안내](https://ai.google.dev/gemini-api/docs/api-key), [Gemini 모델](https://ai.google.dev/gemini-api/docs/models).
