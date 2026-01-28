// Archivo: app/api/admin/create-admin/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

// Interfaz para la sesión (lo que está en la cookie)
interface Session {
  id: number;
  email: string;
  rol: 'user' | 'admin' | 'superadmin';
}

/**
 * Parsea la cookie de sesión para obtener los datos del usuario.
 */
function parseSessionCookie(cookieValue: string): Session | null {
  try {
    const jsonPayload = Buffer.from(cookieValue, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload) as Session;
  } catch (error) {
    console.error('Error al parsear la cookie de sesión:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Protección de la Ruta (Verificar Sesión y Rol de SUPERADMIN)
    const cookie = req.cookies.get('ht_session');

    if (!cookie) {
      return NextResponse.json({ error: 'No autorizado: No hay sesión.' }, { status: 401 });
    }

    const session = parseSessionCookie(cookie.value);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado: Sesión inválida.' }, { status: 401 });
    }

    // ¡CRÍTICO! Solo el 'superadmin' puede ejecutar esta acción.
    if (session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido: Esta acción requiere privilegios de Super Administrador.' }, { status: 403 });
    }

    // 2. Obtener y validar los datos del nuevo admin
    const { nombre_completo, email, contrasena } = await req.json();

    if (!nombre_completo || !email || !contrasena) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    // 3. Validar el formato del correo de administrador
    if (!email.endsWith('@administrador.com')) {
      return NextResponse.json({ error: 'Formato de email inválido. Debe terminar en @administrador.com' }, { status: 400 });
    }

    // 4. Verificar que el email no exista ya
    const connection = await pool.getConnection();
    const [users]: [any[], any] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 409 });
    }

    // 5. Hashear la contraseña
    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // 6. Insertar el nuevo usuario con el ROL 'admin'
    await connection.execute(
      'INSERT INTO usuarios (nombre_completo, email, contrasena_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre_completo, email, contrasena_hash, 'admin'] // ¡Se asigna el rol 'admin' explícitamente!
    );

    connection.release();

    return NextResponse.json(
      { message: 'Cuenta de administrador creada exitosamente.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en /api/admin/create-admin:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}