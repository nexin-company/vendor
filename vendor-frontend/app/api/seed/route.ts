export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    message: 'Seed endpoint - No seed data configured for Permit system.'
  });
}
