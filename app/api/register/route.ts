import { NextResponse } from 'next/server';
import { pool } from '@/lib/db'; 
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      nombre_completo, 
      apellidos, 
      username, 
      telefono, 
      tipo_documento, 
      cedula,
      email, 
      contrasena 
    } = body;

    // Validación de campos obligatorios
    if (!nombre_completo || !apellidos || !username || !telefono || !tipo_documento || !cedula || !email || !contrasena) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios.' }, { status: 400 });
    }

    // Validaciones de formato
    if (email.endsWith('@administrador.com') || email.endsWith('@Sadministrador.com')) {
      return NextResponse.json({ message: 'Este correo no está permitido.' }, { status: 400 });
    }

    if (contrasena.length < 8) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(contrasena)) {
      return NextResponse.json({ 
        message: 'La contraseña debe contener mayúsculas, minúsculas y números.' 
      }, { status: 400 });
    }

    if (!/^\d{7,10}$/.test(telefono)) {
      return NextResponse.json({ message: 'Teléfono inválido. Debe contener entre 7 y 10 dígitos.' }, { status: 400 });
    }

    if (!/^\d{5,15}$/.test(cedula)) {
      return NextResponse.json({ message: 'Número de documento inválido.' }, { status: 400 });
    }

    if (username.length < 3 || /\s/.test(username)) {
      return NextResponse.json({ message: 'Nombre de usuario inválido.' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Verificar si el email, username o cédula ya existen
    const [existingUsers]: [any[], any] = await connection.execute(
      'SELECT id, email, username, cedula FROM usuarios WHERE email = ? OR username = ? OR cedula = ?',
      [email, username, cedula]
    );

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      let message = 'Ya existe un usuario con ';
      if (existing.email === email) message += 'este correo electrónico.';
      else if (existing.username === username) message += 'este nombre de usuario.';
      else if (existing.cedula === cedula) message += 'este número de documento.';
      
      connection.release();
      return NextResponse.json({ message }, { status: 409 });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // Insertar el nuevo usuario
    await connection.execute(
      `INSERT INTO usuarios (
         nombre_completo, apellidos, username, telefono, tipo_documento, cedula, email, contrasena_hash, rol
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user')`,
      [nombre_completo, apellidos, username, telefono, tipo_documento, cedula, email, contrasena_hash]
    );

    connection.release();
    return NextResponse.json({ 
      message: 'Usuario registrado exitosamente.',
      success: true 
    }, { status: 201 });

  } catch (error) {
    console.error('Error en /api/register:', error);
    return NextResponse.json({ 
      message: 'Error interno del servidor. Por favor intenta nuevamente.' 
    }, { status: 500 });
  }
}
