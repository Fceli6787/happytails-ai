import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parse } from 'cookie';

interface User {
  id: number;
  nombre_completo: string;
  email: string;
}

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = parse(cookieHeader || '');
    const session = cookies.ht_session;
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    let payload: { id: number; email: string } | null = null;
    try {
      const json = Buffer.from(session, 'base64').toString('utf8');
      payload = JSON.parse(json);
    } catch { // Removed '_e: unknown' to fully suppress unused variable warning
      return NextResponse.json({ error: 'Cookie inválida' }, { status: 400 });
    }

    const userId = payload?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const [rows] = await pool.query('SELECT id, nombre_completo, email FROM usuarios WHERE id = ?', [userId]);
    const users = rows as User[];
    if (users.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const user = users[0];
    return NextResponse.json({ id: user.id, nombre_completo: user.nombre_completo, email: user.email });
  } catch (err: unknown) { // Changed 'any' to 'unknown'
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
