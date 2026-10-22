import { loadEvents } from '../lib/service';

try {
  const data = await loadEvents();
  if (!data.rows.length || !data.rows[0].title || !data.rows[0].sourceUrl) throw new Error('조회된 행사 필드가 비어 있습니다.');
  console.log('LIVE_OK', JSON.stringify({ loaded: data.rows.length, total: data.total }));
} catch (error) {
  console.error(error instanceof Error ? error.message : '조회에 실패했습니다.');
  process.exitCode = 1;
}
