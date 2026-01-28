// Archivo: app/api/admin/usuarios/route.ts
// Sistema completo de gestión de usuarios con estadísticas

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parseSessionCookie } from '@/lib/utils/session';
import bcrypt from 'bcrypt';

// Interfaz para el reporte de usuarios
interface AdminUserReport {
  id: number;
  username: string;
  nombre_completo: string;
  apellidos: string;
  email: string;
  rol: string;
  fecha_registro: string;
  total_mascotas: number;
  total_adopciones: number;
}

// GET - Listar usuarios con estadísticas
export async function GET(req: NextRequest) {
  try {
    const session = parseSessionCookie(req);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const query = `
      SELECT 
        u.id, 
        u.username,
        u.nombre_completo, 
        u.apellidos,
        u.email, 
        u.rol,
        u.fecha_creacion as fecha_registro,
        COALESCE(pet_counts.total_mascotas, 0) AS total_mascotas,
        COALESCE(adoption_counts.total_adopciones, 0) AS total_adopciones
      FROM 
        usuarios u
      LEFT JOIN (
        SELECT propietario_id, COUNT(*) AS total_mascotas
        FROM mascotas
        GROUP BY propietario_id
      ) pet_counts ON u.id = pet_counts.propietario_id
      LEFT JOIN (
        SELECT propietario_id, COUNT(*) AS total_adopciones
        FROM adopciones
        GROUP BY propietario_id
      ) adoption_counts ON u.id = adoption_counts.propietario_id
      ORDER BY 
        CASE 
          WHEN u.rol = 'superadmin' THEN 1
          WHEN u.rol = 'admin' THEN 2
          ELSE 3
        END,
        u.fecha_creacion DESC;
    `;

    const [rows] = await pool.query(query);
    const usuarios = rows as AdminUserReport[];

    return NextResponse.json({ usuarios }, { status: 200 });

  } catch (error: any) {
    console.error('Error en GET /api/admin/usuarios:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Crear nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const session = parseSessionCookie(req);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const body = await req.json();
    const { username, nombre_completo, apellidos, email, contrasena, rol } = body;

    if (!username || !nombre_completo || !email || !contrasena || !rol) {
      return NextResponse.json({ 
        error: 'Campos requeridos: username, nombre_completo, email, contraseña y rol' 
      }, { status: 400 });
    }

    if (rol === 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ 
        error: 'Solo el superadmin puede crear administradores' 
      }, { status: 403 });
    }

    if (rol === 'superadmin') {
      return NextResponse.json({ 
        error: 'No se puede crear otro superadmin' 
      }, { status: 403 });
    }

    const connection = await pool.getConnection();

    const [existingUsers]: [any[], any] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return NextResponse.json({ 
        error: 'El email ya está registrado' 
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await connection.execute(`
      INSERT INTO usuarios (username, nombre_completo, apellidos, email, contrasena_hash, rol)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [username, nombre_completo, apellidos || null, email, hashedPassword, rol]);

    connection.release();

    return NextResponse.json({ 
      message: 'Usuario creado exitosamente' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/admin/usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al crear usuario',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Editar usuario
export async function PUT(req: NextRequest) {
  try {
    const session = parseSessionCookie(req);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const body = await req.json();
    const { id, username, nombre_completo, apellidos, email, rol, contrasena } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [targetUser]: [any[], any] = await connection.execute(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [id]
    );

    if (targetUser.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (targetUser[0].rol === 'superadmin') {
      connection.release();
      return NextResponse.json({ 
        error: 'No se puede editar al superadmin' 
      }, { status: 403 });
    }

    if (rol === 'admin' && session.rol !== 'superadmin') {
      connection.release();
      return NextResponse.json({ 
        error: 'Solo el superadmin puede crear administradores' 
      }, { status: 403 });
    }

    let updateQuery = 'UPDATE usuarios SET username = ?, nombre_completo = ?, apellidos = ?, email = ?, rol = ?';
    let params: any[] = [username, nombre_completo, apellidos || null, email, rol];

    if (contrasena && contrasena.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      updateQuery += ', contrasena_hash = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await connection.execute(updateQuery, params);
    connection.release();

    return NextResponse.json({ 
      message: 'Usuario actualizado exitosamente' 
    });

  } catch (error: any) {
    console.error('Error en PUT /api/admin/usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al actualizar usuario',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(req: NextRequest) {
  try {
    const session = parseSessionCookie(req);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    const [targetUser]: [any[], any] = await connection.execute(
      'SELECT id, rol FROM usuarios WHERE id = ?',
      [id]
    );

    if (targetUser.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (targetUser[0].rol === 'superadmin') {
      connection.release();
      return NextResponse.json({ 
        error: 'No se puede eliminar al superadmin' 
      }, { status: 403 });
    }

    if (parseInt(id) === session.id) {
      connection.release();
      return NextResponse.json({ 
        error: 'No puedes eliminarte a ti mismo' 
      }, { status: 403 });
    }

    await connection.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    connection.release();

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente' 
    });

  } catch (error: any) {
    console.error('Error en DELETE /api/admin/usuarios:', error);
    return NextResponse.json({ 
      error: 'Error al eliminar usuario',
      details: error.message 
    }, { status: 500 });
  }
}
