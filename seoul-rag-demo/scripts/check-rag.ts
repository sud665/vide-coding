import { DEFAULT_MODEL, search } from '../lib/service';

try {
  if (!process.env.SEOUL_API_KEY?.trim()) throw new Error('SEOUL_API_KEY를 .env.local에 설정해 주세요.');
  if (!process.env.GEMINI_API_KEY?.trim()) throw new Error('GEMINI_API_KEY를 .env.local에 설정해 주세요.');

  const result = await search({ query: '무료 전시' });
  if (result.status !== 200 || !('records' in result.body)) {
    throw new Error('서울 공공데이터 검색을 완료하지 못했습니다.');
  }

  const { records, mode, answer, sourceIds, note } = result.body;
  if (mode !== 'ai' || !answer?.trim() || !sourceIds.length) {
    // search()가 실패 종류와 상세를 [AI 요약 실패] 로그로 이미 남겼다. 여기서는 화면에 보일 안내 문구를 함께 출력한다.
    throw new Error(`실제 AI 답변을 생성하거나 출처를 검증하지 못했습니다. 화면 안내: ${note}`);
  }
  const recordById = new Map(records.map(record => [record.id, record]));
  if (!sourceIds.every(id => recordById.get(id)?.sourceUrl)) {
    throw new Error('AI 답변의 출처가 실제 검색 결과와 연결되지 않았습니다.');
  }

  console.log('RAG_OK', JSON.stringify({ model: process.env.GEMINI_MODEL || DEFAULT_MODEL, records: records.length, cited: sourceIds.length }));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'RAG 검증에 실패했습니다.');
  process.exitCode = 1;
}
