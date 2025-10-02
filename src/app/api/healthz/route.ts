export const dynamic = 'force-dynamic';

export function GET() {
  // Liveness: dış bağımlılıklara dokunma, her zaman 200 dön
  return Response.json({ ok: true, ts: Date.now() });
}

