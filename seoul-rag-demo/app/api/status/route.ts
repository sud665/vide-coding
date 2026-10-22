export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    seoulApiConfigured: Boolean(process.env.SEOUL_API_KEY?.trim()),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
