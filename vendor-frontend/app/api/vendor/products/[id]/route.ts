import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

const VENDOR_API_URL = process.env.VENDOR_API_URL || 'http://localhost:8000';
const VENDOR_API_KEY = process.env.VENDOR_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'get');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;
    // Cambiar a external-products (solo lectura desde Inventory)
    const response = await fetch(`${VENDOR_API_URL}/v1/external-products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': VENDOR_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Error al obtener producto externo' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return addRateLimitHeaders(NextResponse.json(data), rateLimitResult);
  } catch (error: any) {
    console.error('Error en GET /api/vendor/products/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener producto externo' },
      { status: 500 }
    );
  }
}

// Nota: PUT y DELETE eliminados - los productos externos se gestionan en inventory-backend
// Vendor solo puede consultarlos (solo lectura)

