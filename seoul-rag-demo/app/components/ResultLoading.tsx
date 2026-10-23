type Props = {
  /** `search`: 서울 공공데이터 조회·검색 중. `answer`: 검색 근거는 이미 보이고 AI 요약만 기다리는 중. */
  phase: 'search' | 'answer';
  /** AI에 전달한 자료 수. `answer` 단계에서만 사용한다. */
  count?: number;
};

const answerLines = ['92%', '78%', '55%'];
const cardLines: [string, string][] = [['34%', 'thin'], ['62%', 'title'], ['46%', 'thin'], ['52%', 'thin']];

/** 결과 패널의 로딩 표시. 진행 상태 문구는 #status가 읽어 주므로 여기서는 시각 요소만 담당한다. */
export default function ResultLoading({ phase, count = 0 }: Props) {
  if (phase === 'answer') {
    return <div className="answer-loading" data-testid="answer-loading">
      <div className="answer-loading-head">
        <span className="pulse" aria-hidden="true" />
        <strong>AI 요약 생성 중</strong>
        <span className="answer-loading-meta">자료 {count}건 전달 · 출처 번호 검증 후 표시</span>
      </div>
      <div className="skeleton-lines" aria-hidden="true">{answerLines.map(width => <span key={width} style={{ width }} />)}</div>
      <p className="answer-loading-note">검색된 행사 자료에 있는 사실만 사용합니다. 보통 몇 초, 길면 20초까지 걸립니다.</p>
    </div>;
  }
  return <div className="search-loading" aria-hidden="true" data-testid="search-loading">
    {[0, 1, 2].map(index => <div className="event skeleton-card" key={index}>
      <div className="skeleton-lines">{cardLines.map(([width, kind], line) => <span key={line} className={kind} style={{ width: line === 1 && index === 1 ? '74%' : width }} />)}</div>
    </div>)}
  </div>;
}
