import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const SHIPMENTS_API_URL = process.env.SHIPMENTS_API_URL || 'http://localhost:8000';
const SHIPMENTS_API_KEY = process.env.SHIPMENTS_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'get');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const url = new URL(`${SHIPMENTS_API_URL}/v1/shipments`);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SHIPMENTS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al obtener shipments' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult);
  } catch (error: any) {
    console.error('Error en GET /api/shipments/shipments:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener shipments' },
      { status: 500 }
    );
  }
}


