export async function GET() {
  return Response.json({
    success: true,
    message: 'Web app is healthy',
    data: { service: 'web', status: 'ok' },
    meta: {},
  });
}
