import { search } from '@/lib/service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 4096) {
      return Response.json({ error: '요청이 너무 큽니다.' }, { status: 413 });
    }
    let input: unknown;
    try { input = JSON.parse(text); }
    catch { return Response.json({ error: '올바른 JSON을 전송해 주세요.' }, { status: 400 }); }
    const result = await search(input);
    return Response.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: '서울 데이터 연결을 확인해 주세요.' }, { status: 502 });
  }
}
