export const DATASET = 'https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do';
export function normalize(row, index) {
  const clean = v => String(v ?? '').replace(/<[^>]*>/g, '').trim();
  let url = DATASET;
  try { const parsed = new URL(row.ORG_LINK); if (['https:', 'http:'].includes(parsed.protocol)) url = parsed.href; } catch {}
  return {id: String(index + 1), title: clean(row.TITLE), district: clean(row.GUNAME), category: clean(row.CODENAME), date: clean(row.DATE), end: clean(row.END_DATE).slice(0,10), place: clean(row.PLACE), fee: clean(row.USE_FEE), free: clean(row.IS_FREE) === '무료', audience: clean(row.USE_TRGT), url};
}
export function retrieve(rows, {query, district = '', freeOnly = false, includePast = false}, today = new Date().toLocaleDateString('sv-SE', {timeZone:'Asia/Seoul'})) {
  const terms = query.toLowerCase().replace(/추천해?줘|알려줘|찾아줘|있어|어디|갈만한|행사|서울|이번\s*주말|이번\s*주|오늘|무료|유료/g,' ').split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1).map(x=>x.replace(/(에서|으로|에는|에|를|을|은|는)$/,''));
  const wantsFree = freeOnly || query.includes('무료');
  return rows.filter(r => (!district || r.district === district) && (!wantsFree || r.free) && (includePast || !r.end || r.end >= today)).map(r => {
    const hay = `${r.title} ${r.district} ${r.category} ${r.place} ${r.audience}`.toLowerCase();
    return {...r, score: terms.reduce((n,t)=>n+(hay.includes(t)?1:0),0)};
  }).filter(r => !terms.length || r.score > 0).sort((a,b)=>b.score-a.score || a.date.localeCompare(b.date)).slice(0,6);
}
export function validateAnswer(value, records) {
  if (!value || typeof value.answer !== 'string' || !value.answer.trim() || !Array.isArray(value.sources) || !value.sources.length) throw new Error('INVALID_ANSWER');
  const allowed = new Set(records.map(r=>r.id));
  if (!value.sources.every(id=>allowed.has(String(id)))) throw new Error('INVALID_CITATIONS');
  return {answer:value.answer.slice(0,6000), sources:[...new Set(value.sources.map(String))]};
}
