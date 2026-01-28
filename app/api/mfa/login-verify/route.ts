// Archivo: app/api/mfa/login-verify/route.ts
// (CORREGIDO: Añadido nombre y apellidos a la cookie)

import { NextResponse, NextRequest } from 'next/server';
import { authenticator } from 'otplib';
import { serialize } from 'cookie';
import { pool, getUserMfaConfig } from '@/lib/db';
import { decryptMfaSecret, mfaErrorResponse } from '@/lib/utils/mfa';

function encodeBase64URL(obj: object): string {
  const json = JSON.stringify(obj);
  let base64 = Buffer.from(json).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

interface UserFromDb {
  id: number;
  nombre_completo: string; // <-- AÑADIDO
  apellidos: string;     // <-- AÑADIDO
  email: string;
  rol: 'user' | 'admin' | 'superadmin';
}
interface MfaConfigFromDb {
  id_usuario: number;
  mfa_secret: string;
  mfa_enabled: number;
}
function validateMfaLoginInput(userId: any, totpToken: any) {
  // ... (función de validación se queda igual) ...
  if (!userId) { return { error: 'userId es requerido.', status: 400 }; }
  if (typeof userId !== 'number') { return { error: 'userId debe ser un número.', status: 400 }; }
  if (!totpToken) { return { error: 'Token TOTP es requerido.', status: 400 }; }
  if (typeof totpToken !== 'string' || !/^\d{6}$/.test(totpToken)) { return { error: 'Token TOTP inválido.', status: 400 }; }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('[MFA Login Verify] Iniciando verificación MFA');
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Error al parsear el cuerpo.' }, { status: 400 });
    }
    const { userId, token: totpToken } = body;
    const validation = validateMfaLoginInput(userId, totpToken);
    if (validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    
    // --- CAMBIO: Obtenemos 'nombre_completo' y 'apellidos' ---
    const [userRows] = await pool.query(
      'SELECT id, nombre_completo, apellidos, email, rol FROM usuarios WHERE id = ?',
      [userId]
    );
    // ----------------------------------------------------

    const users = userRows as UserFromDb[];
    if (users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }
    const user = users[0];
    const mfaConfig = await getUserMfaConfig(user.id) as MfaConfigFromDb | null;
    if (!mfaConfig || !mfaConfig.mfa_secret) {
      return NextResponse.json({ error: 'MFA no configurado.' }, { status: 403 });
    }
    if (mfaConfig.mfa_enabled !== 1) {
      return NextResponse.json({ error: 'MFA no está habilitado.' }, { status: 403 });
    }
    let decryptedSecret: string;
    try {
      decryptedSecret = decryptMfaSecret(mfaConfig.mfa_secret);
    } catch (decryptionError: any) {
      return NextResponse.json({ error: 'Error al procesar MFA.' }, { status: 500 });
    }
    authenticator.options = { step: 30, window: 1 };
    const isTokenValid = authenticator.verify({
      token: totpToken,
      secret: decryptedSecret,
    });
    if (isTokenValid) {
      
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
        message: 'Verificación MFA exitosa.',
      });
      res.headers.set('Set-Cookie', cookie);
      return res;
    } else {
      return NextResponse.json({ error: 'Token TOTP inválido.' }, { status: 401 });
    }
  } catch (error: any) {
    const { errorMessage, errorDetail, statusCode } = mfaErrorResponse(error);
    return NextResponse.json({ error: errorMessage, detail: errorDetail }, { status: statusCode });
  }
}