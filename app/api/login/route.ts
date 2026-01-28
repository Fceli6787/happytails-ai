// Archivo: app/api/login/route.ts
// (CORREGIDO: Añadido nombre y apellidos a la cookie)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pool, getUserMfaConfig } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

// --- Helper para codificar en Base64URL (seguro para cookies) ---
function encodeBase64URL(obj: object): string {
  const json = JSON.stringify(obj);
  let base64 = Buffer.from(json).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
// -----------------------------------------------------------

interface User {
  id: number;
  nombre_completo: string;
  apellidos: string; // <-- AÑADIDO
  email: string;
  contrasena_hash: string;
  rol: 'user' | 'admin' | 'superadmin';
}
interface MfaConfig {
  id_usuario: number;
  mfa_secret: string;
  mfa_enabled: number;
  mfa_verified_at?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }
    
    // --- CAMBIO: Obtenemos 'apellidos' ---
    const [rows] = await pool.query(
      'SELECT id, nombre_completo, apellidos, email, contrasena_hash, rol FROM usuarios WHERE email = ?',
      [email]
    );
    // ------------------------------------

    const users = rows as User[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.contrasena_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
    const mfaConfig: MfaConfig | null = await getUserMfaConfig(user.id);
    if (mfaConfig && mfaConfig.mfa_enabled === 1) {
      return NextResponse.json(
        {
          message: 'MFA requerido',
          mfaRequired: true,
          userId: user.id,
          rol: user.rol,
        },
        { status: 200 }
      );
    }

    // --- CAMBIO: Añadimos nombre y apellidos al Payload ---
    const tokenPayload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre_completo, // <-- AÑADIDO
      apellidos: user.apellidos,   // <-- AÑADIDO
    };
    const cookieValue = encodeBase64URL(tokenPayload);

    const cookie = serialize('ht_session', cookieValue, {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    const res = NextResponse.json({
      ok: true,
      userId: user.id,
      rol: user.rol,
    });
    res.headers.set('Set-Cookie', cookie);
    return res;

  } catch (err: any) {
    // ... (manejo de errores) ...
    console.error(err);
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: 'Error de conexión con la base de datos. Verifique que MySQL esté ejecutándose en XAMPP.' }, { status: 500 });
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ER_DBACCESS_DENIED_ERROR') {
      return NextResponse.json({ error: 'Error de autenticación con la base de datos. Verifique las credenciales de la BD.' }, { status: 500 });
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json({ error: 'Base de datos no encontrada. Verifique que la BD exista en MySQL.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}