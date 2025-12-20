import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { usersApi } from '@/lib/api-server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Buscar usuario por email en el backend
    const allUsers = await usersApi.getAll();
    const user = allUsers.find(u => u.email === session.user?.email);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en el sistema' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Error en GET /api/permit/user/me:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuario' },
      { status: error.status || 500 }
    );
  }
}

