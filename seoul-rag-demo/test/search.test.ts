import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, retrieve, validateAnswer, DATASET } from '../lib/search';
import { AiError, describeAiFailure, search, synthesize } from '../lib/service';

const rows = [
  normalize({ TITLE: '어린이 미술 전시', GUNAME: '종로구', IS_FREE: '무료', END_DATE: '2099-12-31', ORG_LINK: 'https://culture.seoul.go.kr' }, 0),
  normalize({ TITLE: '클래식 공연', GUNAME: '강남구', IS_FREE: '유료', END_DATE: '2099-12-31' }, 1),
  normalize({ TITLE: '종료된 전시', END_DATE: '2020-01-01' }, 2),
];
const fakeData = async () => ({ rows, total: rows.length, time: Date.now() });

test('region, free, and expired filters choose the expected source rows', () => {
  assert.deepEqual(retrieve(rows, { query: '무료 전시', district: '종로구' }).map(record => record.id), ['1']);
  assert.equal(retrieve(rows, { query: '전시', includePast: true }).length, 2);
  assert.equal(retrieve(rows, { query: '클래식', freeOnly: true }).length, 0);
});

test('an unrelated question has no evidence', () => {
  assert.equal(retrieve(rows, { query: '양자역학 논문' }).length, 0);
});

test('normalization removes markup and rejects non-http source links', () => {
  const record = normalize({ TITLE: '<script>hello</script>', ORG_LINK: 'javascript:alert(1)' }, 0);
  assert.equal(record.sourceUrl, DATASET);
  assert.equal(record.title, 'hello');
});

test('answer citations must refer to retrieved records', () => {
  const found = retrieve(rows, { query: '전시' });
  assert.throws(() => validateAnswer({ answer: '근거 없는 인용', sourceIds: ['999'] }, found));
  assert.throws(() => validateAnswer({ answer: '인용 없음', sourceIds: [] }, found));
  assert.deepEqual(validateAnswer({ answer: '어린이 전시입니다.', sourceIds: ['1'] }, found).sourceIds, ['1']);
});

test('invalid input is rejected before a data call', async () => {
  let called = false;
  const loadEvents = async () => { called = true; return fakeData(); };
  assert.equal((await search({ query: '' }, { loadEvents })).status, 400);
  assert.equal((await search({ query: 'x'.repeat(301) }, { loadEvents })).status, 400);
  assert.equal(called, false);
});

test('missing Seoul key returns a setup instruction', async () => {
  const previous = process.env.SEOUL_API_KEY;
  delete process.env.SEOUL_API_KEY;
  try {
    const response = await search({ query: '전시' });
    assert.equal(response.status, 503);
    assert.ok('error' in response.body);
    if ('error' in response.body) assert.match(response.body.error, /SEOUL_API_KEY/);
  } finally { if (previous === undefined) delete process.env.SEOUL_API_KEY; else process.env.SEOUL_API_KEY = previous; }
});

test('empty result is not sent to AI', async () => {
  let called = false;
  const response = await search({ query: '양자역학 논문' }, { loadEvents: fakeData, synthesize: async () => { called = true; throw new Error('should not call'); } });
  assert.equal(response.status, 200);
  assert.ok('records' in response.body);
  if (!('records' in response.body)) throw new Error('Expected search records');
  assert.deepEqual(response.body.records, []);
  assert.equal(called, false);
});

test('AI failure keeps verified search cards', async (t) => {
  t.mock.method(console, 'error', () => {});
  const response = await search({ query: '전시' }, { loadEvents: fakeData, synthesize: async () => { throw new Error('upstream failure'); } });
  assert.equal(response.status, 200);
  assert.ok('records' in response.body);
  if (!('records' in response.body)) throw new Error('Expected search records');
  assert.equal(response.body.mode, 'search');
  assert.ok(response.body.records.length > 0);
  assert.match(response.body.note, /AI 답변/);
});

test('AI transport errors never include upstream responses or keys', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only';
  try {
    await assert.rejects(
      synthesize('전시', retrieve(rows, { query: '전시' }), async () => ({ ok: false, status: 403, json: async () => ({ error: { status: 'PERMISSION_DENIED', message: 'secret upstream details' } }) }) as Response),
      /AI 연결/,
    );
  } finally { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; }
});

test('temporary Gemini server errors are retried', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only';
  let calls = 0;
  try {
    const found = retrieve(rows, { query: '전시' });
    const answer = await synthesize('전시', found, async () => {
      calls++;
      return calls === 1
        ? { ok: false, status: 503, json: async () => ({ error: { status: 'UNAVAILABLE' } }) } as Response
        : { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer: '전시가 있습니다.', sourceIds: ['1'] }) }] } }] }) } as Response;
    });
    assert.equal(calls, 2);
    assert.deepEqual(answer.sourceIds, ['1']);
  } finally { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; }
});

test('a structured answer with valid source IDs is accepted', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only';
  try {
    const found = retrieve(rows, { query: '전시' });
    const answer = await synthesize('전시', found, async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer: '전시가 있습니다.', sourceIds: ['1'] }) }] } }] }) }) as Response);
    assert.equal(answer.answer, '전시가 있습니다.');
    assert.deepEqual(answer.sourceIds, ['1']);
  } finally { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; }
});

test('quota, timeout, server, and citation failures are told apart', async () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'unit-test-only';
  try {
    const found = retrieve(rows, { query: '전시' });
    await assert.rejects(
      synthesize('전시', found, async () => ({ ok: false, status: 429, json: async () => ({ error: { status: 'RESOURCE_EXHAUSTED', message: 'secret upstream details', details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '7122s' }] } }) }) as Response),
      (error: unknown) => error instanceof AiError && error.kind === 'quota' && error.retryAfterSeconds === 7122 && !error.message.includes('secret'),
    );
    await assert.rejects(
      synthesize('전시', found, async () => { throw Object.assign(new Error('aborted'), { name: 'TimeoutError' }); }),
      (error: unknown) => error instanceof AiError && error.kind === 'timeout',
    );
    await assert.rejects(
      synthesize('전시', found, async () => ({ ok: false, status: 503, json: async () => ({ error: { status: 'UNAVAILABLE' } }) }) as Response),
      (error: unknown) => error instanceof AiError && error.kind === 'unavailable',
    );
    await assert.rejects(
      synthesize('전시', found, async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify({ answer: '근거 없는 인용', sourceIds: ['999'] }) }] } }] }) }) as Response),
      (error: unknown) => error instanceof AiError && error.kind === 'invalid' && /INVALID_CITATIONS/.test(error.message),
    );
  } finally { if (previous === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previous; }
});

test('the status note names the AI failure reason and keeps the cards', async (t) => {
  t.mock.method(console, 'error', () => {});
  const failing = (error: Error) => search({ query: '전시' }, { loadEvents: fakeData, synthesize: async () => { throw error; } });
  const quota = await failing(new AiError('quota', 'AI 연결 실패: HTTP 429 (RESOURCE_EXHAUSTED)', 7122));
  assert.ok('records' in quota.body);
  if (!('records' in quota.body)) throw new Error('Expected search records');
  assert.equal(quota.body.mode, 'search');
  assert.ok(quota.body.records.length > 0);
  assert.match(quota.body.note, /한도.*약 2시간 후/);
  const timeout = await failing(new AiError('timeout', 'AI 응답이 20초 안에 오지 않았습니다.'));
  if (!('records' in timeout.body)) throw new Error('Expected search records');
  assert.match(timeout.body.note, /지연/);
  assert.equal(describeAiFailure(new Error('upstream failure')).kind, 'unknown');
  assert.match(describeAiFailure(new AiError('http', 'AI 연결 실패: HTTP 404 (NOT_FOUND)')).note, /HTTP 404/);
});

test('answer:false returns the evidence without calling the AI', async () => {
  let called = false;
  const synthesizeSpy = async () => { called = true; return { answer: '호출되면 안 됨', sourceIds: ['1'] }; };
  const response = await search({ query: '전시', answer: false }, { loadEvents: fakeData, synthesize: synthesizeSpy });
  assert.equal(response.status, 200);
  if (!('records' in response.body)) throw new Error('Expected search records');
  assert.equal(response.body.mode, 'search');
  assert.equal(response.body.answer, null);
  assert.ok(response.body.records.length > 0);
  assert.match(response.body.note, /이어서 요청/);
  assert.equal(called, false);
  const followUp = await search({ query: '전시' }, { loadEvents: fakeData, synthesize: synthesizeSpy });
  if (!('records' in followUp.body)) throw new Error('Expected search records');
  assert.equal(followUp.body.mode, 'ai');
  assert.equal(called, true);
  assert.equal((await search({ query: '전시', answer: 'no' }, { loadEvents: fakeData })).status, 400);
});
