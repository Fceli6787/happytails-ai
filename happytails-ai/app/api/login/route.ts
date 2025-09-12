import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

interface User {
  id: number;
  nombre_completo: string;
  email: string;
  contrasena_hash: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT id, nombre_completo, email, contrasena_hash FROM usuarios WHERE email = ?', [email]);
    const users = rows as User[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.contrasena_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Crear cookie de sesión simple (no firmada) - para producción usar JWT firmado o sesiones server-side
    const tokenPayload = JSON.stringify({ id: user.id, email: user.email });
    const cookie = serialize('ht_session', Buffer.from(tokenPayload).toString('base64'), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      sameSite: 'lax',
    });

    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
