export const DATASET = 'https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do';

export type SeoulApiRow = Record<string, unknown>;
export type EventRecord = {
  id: string;
  title: string;
  district: string;
  category: string;
  date: string;
  end: string;
  place: string;
  fee: string;
  free: boolean;
  audience: string;
  sourceUrl: string;
};
export type RankedEvent = EventRecord & { score: number };

export function normalize(row: SeoulApiRow, index: number): EventRecord {
  const clean = (value: unknown) => String(value ?? '').replace(/<[^>]*>/g, '').trim();
  let sourceUrl = DATASET;
  try {
    const parsed = new URL(clean(row.ORG_LINK));
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') sourceUrl = parsed.href;
  } catch { /* missing or invalid original URL falls back to the official dataset */ }
  return {
    id: String(index + 1), title: clean(row.TITLE), district: clean(row.GUNAME),
    category: clean(row.CODENAME), date: clean(row.DATE), end: clean(row.END_DATE).slice(0, 10),
    place: clean(row.PLACE), fee: clean(row.USE_FEE), free: clean(row.IS_FREE) === '무료',
    audience: clean(row.USE_TRGT), sourceUrl,
  };
}

export function retrieve(
  rows: EventRecord[],
  { query, district = '', freeOnly = false, includePast = false }: {
    query: string; district?: string; freeOnly?: boolean; includePast?: boolean;
  },
  today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }),
): RankedEvent[] {
  const terms = query.toLowerCase()
    .replace(/추천해?줘|알려줘|찾아줘|있어|어디|갈만한|행사|서울|이번\s*주말|이번\s*주|오늘|무료|유료/g, ' ')
    .split(/[^\p{L}\p{N}]+/u).filter(term => term.length > 1)
    .map(term => term.replace(/(에서|으로|에는|에|를|을|은|는)$/, ''));
  const wantsFree = freeOnly || query.includes('무료');
  return rows
    .filter(record => (!district || record.district === district) && (!wantsFree || record.free) && (includePast || !record.end || record.end >= today))
    .map(record => {
      const hay = `${record.title} ${record.district} ${record.category} ${record.place} ${record.audience}`.toLowerCase();
      return { ...record, score: terms.reduce((count, term) => count + Number(hay.includes(term)), 0) };
    })
    .filter(record => !terms.length || record.score > 0)
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, 6);
}

export function validateAnswer(value: unknown, records: RankedEvent[]): { answer: string; sourceIds: string[] } {
  if (!value || typeof value !== 'object') throw new Error('INVALID_ANSWER');
  const answer = (value as { answer?: unknown }).answer;
  const sourceIds = (value as { sourceIds?: unknown }).sourceIds;
  if (typeof answer !== 'string' || !answer.trim() || !Array.isArray(sourceIds) || !sourceIds.length) throw new Error('INVALID_ANSWER');
  const allowed = new Set(records.map(record => record.id));
  if (!sourceIds.every(id => allowed.has(String(id)))) throw new Error('INVALID_CITATIONS');
  return { answer: answer.slice(0, 6000), sourceIds: [...new Set(sourceIds.map(String))] };
}
