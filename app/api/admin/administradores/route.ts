// Archivo: app/api/admin/administradores/route.ts
// (VERSIÓN COMPLETA CON CRUD: GET, POST, PUT, DELETE)

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parseSessionCookie } from '../../../../lib/utils/session'; // Usamos la ruta relativa
import bcrypt from 'bcrypt';

// Interfaz para los datos que recibimos/devolvemos
export interface AdminUser {
  id: number;
  nombre_completo: string;
  apellidos: string;
  email: string;
  telefono: string;
  cedula: string;
  rol: 'admin' | 'superadmin';
}

/**
 * GET: Obtiene la lista de todos los administradores y superadministradores.
 * Solo accesible por un 'superadmin'.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await parseSessionCookie(req);
    if (!session || session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido.' }, { status: 403 });
    }

    const [rows] = await pool.query(
      `SELECT id, nombre_completo, apellidos, email, telefono, cedula, rol 
       FROM usuarios 
       WHERE rol = 'admin' OR rol = 'superadmin'
       ORDER BY id ASC`
    );

    const admins = rows as AdminUser[];
    return NextResponse.json(admins);

  } catch (error) {
    console.error('Error en GET /api/admin/administradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * POST: Crea un nuevo Administrador.
 * Solo accesible por un 'superadmin'.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await parseSessionCookie(req);
    if (!session || session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido.' }, { status: 403 });
    }

    const body = await req.json();
    const { nombre_completo, apellidos, email, telefono, cedula, contrasena } = body;

    // --- Validación de datos ---
    if (!nombre_completo || !apellidos || !email || !telefono || !cedula || !contrasena) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }
    if (!email.endsWith('@administrador.com')) {
      return NextResponse.json({ error: 'El email debe terminar en @administrador.com' }, { status: 400 });
    }
    if (contrasena.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Verificar si el email ya existe
    const [existing]: [any[], any] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'El correo electrónico ya está registrado.' }, { status: 409 });
    }

    // Hashear contraseña
    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // Insertar en la BD
    await connection.execute(
      `INSERT INTO usuarios (nombre_completo, apellidos, email, telefono, cedula, contrasena_hash, rol) 
       VALUES (?, ?, ?, ?, ?, ?, 'admin')`,
      [nombre_completo, apellidos, email, telefono, cedula, contrasena_hash]
    );

    connection.release();
    return NextResponse.json({ message: 'Administrador creado exitosamente.' }, { status: 201 });

  } catch (error) {
    console.error('Error en POST /api/admin/administradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PUT: Actualiza un Administrador existente.
 * Solo accesible por un 'superadmin'.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await parseSessionCookie(req);
    if (!session || session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, nombre_completo, apellidos, email, telefono, cedula, contrasena } = body;

    if (!id) {
      return NextResponse.json({ error: 'El ID del administrador es requerido.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Verificar que el email (si se cambió) no esté tomado por OTRO usuario
    const [existing]: [any[], any] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );
    if (existing.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'El correo electrónico ya está en uso por otra cuenta.' }, { status: 409 });
    }

    // Lógica para actualizar contraseña (solo si se proporciona una nueva)
    if (contrasena && contrasena.length > 0) {
      if (contrasena.length < 6) {
        connection.release();
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
      }
      const contrasena_hash = await bcrypt.hash(contrasena, 10);
      
      // Actualizar todo CON contraseña
      await connection.execute(
        `UPDATE usuarios 
         SET nombre_completo = ?, apellidos = ?, email = ?, telefono = ?, cedula = ?, contrasena_hash = ?
         WHERE id = ?`,
        [nombre_completo, apellidos, email, telefono, cedula, contrasena_hash, id]
      );
    } else {
      // Actualizar todo SIN contraseña
      await connection.execute(
        `UPDATE usuarios 
         SET nombre_completo = ?, apellidos = ?, email = ?, telefono = ?, cedula = ?
         WHERE id = ?`,
        [nombre_completo, apellidos, email, telefono, cedula, id]
      );
    }

    connection.release();
    return NextResponse.json({ message: 'Administrador actualizado exitosamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error en PUT /api/admin/administradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * DELETE: Elimina un Administrador.
 * Solo accesible por un 'superadmin'.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await parseSessionCookie(req);
    if (!session || session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido.' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'El ID del administrador es requerido.' }, { status: 400 });
    }
    
    // Protección: No permitir que el superadmin se elimine a sí mismo
    if (id === session.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta de superadministrador.' }, { status: 400 });
    }

    await pool.execute(
      'DELETE FROM usuarios WHERE id = ? AND rol = \'admin\'', // Solo borra 'admin', no a otro 'superadmin'
      [id]
    );

    return NextResponse.json({ message: 'Administrador eliminado exitosamente.' }, { status: 200 });

  } catch (error) {
    console.error('Error en DELETE /api/admin/administradores:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}