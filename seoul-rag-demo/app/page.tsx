'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { RankedEvent } from '@/lib/search';

const districts = '강남구 강동구 강북구 강서구 관악구 광진구 구로구 금천구 노원구 도봉구 동대문구 동작구 마포구 서대문구 서초구 성동구 성북구 송파구 양천구 영등포구 용산구 은평구 종로구 중구 중랑구'.split(' ');
type Connection = { seoulApiConfigured: boolean; aiConfigured: boolean };
type SearchResult = {
  records: RankedEvent[]; total: number; loaded: number; retrievedAt: string;
  mode: 'search' | 'ai'; answer: string | null; sourceIds: string[]; note: string;
};

export default function Home() {
  const [query, setQuery] = useState('무료 전시');
  const [district, setDistrict] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [includePast, setIncludePast] = useState(false);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/status', { cache: 'no-store', signal: controller.signal })
      .then(response => response.json() as Promise<Connection>)
      .then(setConnection)
      .catch(() => { /* search still provides a useful connection error */ });
    return () => controller.abort();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, district, freeOnly, includePast }),
        signal: AbortSignal.timeout(65_000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || '검색에 실패했습니다.');
      setResult(body as SearchResult);
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'TimeoutError'
        ? '응답이 지연되고 있습니다. 다시 검색해 주세요.'
        : cause instanceof Error ? cause.message : '검색에 실패했습니다.');
    } finally { setLoading(false); }
  }

  return <>
    <header><a className="brand" href="/">오늘 뭐 보지?<span>SEOUL SCENE</span></a><span className="edition">공공데이터로 발견하는 도시의 문화</span><span className="badge">LIVE DEMO · 01</span></header>
    <main>
      <section className="intro"><div><p className="eyebrow">도시의 다음 장면을 찾아서</p><h1>서울에서,<br />무엇을 만나볼까요<span>?</span></h1><p className="lead">전시부터 공연까지, 궁금한 장면을 검색하세요.<br />서울시 문화행사 정보와 확인 가능한 출처를 함께 보여드립니다.</p></div><div className="art" aria-hidden="true"><div className="sun" /><div className="arch" /><div className="line" /><span>ART &amp; CULTURE<br />IN SEOUL</span></div></section>
      <div className={`setup-status ${connection?.seoulApiConfigured ? 'ready' : 'pending'}`} role="status" data-testid="setup-status">
        <strong>{connection?.seoulApiConfigured ? '서울 API 연결 준비 완료' : '서울 API 키 설정 전'}</strong>
        <span>{connection?.seoulApiConfigured ? '실제 문화행사를 검색할 수 있습니다.' : '.env.local에 SEOUL_API_KEY를 입력하고 개발 서버를 다시 시작하세요.'}</span>
        {connection?.seoulApiConfigured && <span>· AI 요약: {connection.aiConfigured ? '연결 준비' : '키 없음, 검색만 제공'}</span>}
      </div>
      <section className="workspace"><div className="search-panel"><p className="eyebrow">01 / 질문하기</p><form id="search-form" onSubmit={onSubmit}><label htmlFor="query">어떤 행사를 찾고 있나요?</label><textarea id="query" maxLength={300} required rows={3} placeholder="예: 종로구 무료 전시" value={query} onChange={event => setQuery(event.target.value)} /><div className="examples">{['무료 전시', '클래식', '어린이'].map(example => <button key={example} type="button" onClick={() => setQuery(example)}>{example} ↗</button>)}</div><label htmlFor="district">지역</label><select id="district" value={district} onChange={event => setDistrict(event.target.value)}><option value="">서울 전체</option>{districts.map(name => <option key={name} value={name}>{name}</option>)}</select><div className="checks"><label><input id="free" type="checkbox" checked={freeOnly} onChange={event => setFreeOnly(event.target.checked)} /> 무료 행사만</label><label><input id="past" type="checkbox" checked={includePast} onChange={event => setIncludePast(event.target.checked)} /> 지난 행사 포함</label></div><button className="submit" type="submit" disabled={loading}>{loading ? '서울의 장면을 찾는 중…' : '문화행사 찾기'} <span>→</span></button></form><p className="hint">종료된 행사는 기본적으로 제외합니다. ‘이번 주말’ 같은 날짜 조건은 결과의 행사 기간을 확인해 주세요.</p><details><summary>이 데모는 어떻게 동작하나요?</summary><ol><li>Next.js 서버가 서울 공공데이터를 가져옵니다.</li><li>검색어·지역·무료 조건에 맞는 자료를 찾습니다.</li><li>AI 키가 있으면 찾은 자료만 전달해 근거 요약을 만듭니다.</li><li>인용한 자료 번호를 검증하고 공식 원문 링크를 제공합니다.</li></ol><p>최대 3,000건을 조회하며 결과는 6건까지 표시합니다. 벡터 DB 없이 검색 기반 RAG 흐름을 시연합니다.</p></details></div>
      <div className="results-panel" aria-live="polite" aria-busy={loading}><div className="result-heading"><p className="eyebrow">02 / 발견하기</p><span id="mode">{loading ? '조회 중' : error ? '연결 확인 필요' : result?.mode === 'ai' ? 'AI 답변 + 검색 근거' : result ? '검색 근거' : '검색 준비'}</span></div><div id="status" role="status">{loading ? '서울 공공데이터를 조회하고 관련 자료를 찾고 있습니다.' : error ? '검색을 완료하지 못했습니다.' : result?.note || '검색하면 서울의 문화행사를 가져옵니다.'}</div>
      {error && <div className="result-alert"><p>{error}</p></div>}
      {result?.answer && <div id="answer"><strong>검색 자료를 바탕으로 한 AI 요약</strong><p>{result.answer}</p><span>참조 자료: {result.sourceIds.map(id => <a key={id} href={`#event-${id}`}>#{id} </a>)}</span></div>}
      <div id="results">{!result && !loading && !error && <div className="empty"><span className="empty-number">서울<br />25개 자치구</span><h2>하나의 질문에서<br />시작되는 새로운 발견.</h2><p>왼쪽에서 관심 있는 분야를 입력해 보세요.<br />행사 일정, 장소, 요금과 출처가 이곳에 나타납니다.</p></div>}{result && result.records.length === 0 && <h2>조건에 맞는 결과가 없습니다.</h2>}{result?.records.map(record => <article className="event" id={`event-${record.id}`} key={record.id}><div className="event-top"><span>#{record.id} · {record.district} · {record.category}</span>{record.free && <span className="free-tag">무료</span>}</div><h3>{record.title}</h3><dl>{[['기간', record.date], ['장소', record.place], ['요금', record.fee || (record.free ? '무료' : '원문 확인')], ['대상', record.audience]].map(([label, value]) => <div className="event-detail" key={label}><dt>{label}</dt><dd>{value || '원문 확인'}</dd></div>)}</dl><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">행사 원문 확인 ↗</a></article>)}</div>
      {result && <p id="metadata">전체 {result.total.toLocaleString()}건 중 {result.loaded.toLocaleString()}건 검색 · 결과 {result.records.length}건 · 조회 {new Date(result.retrievedAt).toLocaleString('ko-KR')} · 서버 캐시 5분</p>}</div></section>
      <footer><span>자료 제공 · 서울특별시 / 서울문화포털</span><a href="https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do" target="_blank" rel="noopener noreferrer">서울 열린데이터광장 ↗</a><span>예약·운영 여부는 원문에서 확인하세요.</span></footer>
    </main>
  </>;
}
