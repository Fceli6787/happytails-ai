import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'adopciones');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// GET - Listar adopciones
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, nombre, especie, raza, edad_anios, tamano, ciudad, pais,
        descripcion, refugio, imagen, estado, fecha_registro
      FROM adopciones
      ORDER BY estado ASC, id DESC
    `);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error en GET adopciones:', error);
    return NextResponse.json(
      { message: 'Error al obtener adopciones', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear adopción
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nombre = formData.get('nombre') as string;
    const especie = formData.get('especie') as string;
    const raza = formData.get('raza') as string | null;
    const edad_anios = formData.get('edad_anios') as string | null;
    const tamano = formData.get('tamano') as string | null;
    const ciudad = formData.get('ciudad') as string | null;
    const pais = formData.get('pais') as string | null;
    const descripcion = formData.get('descripcion') as string | null;
    const refugio = formData.get('refugio') as string | null;
    const estado = formData.get('estado') as string || 'Disponible';

    if (!nombre || !especie) {
      return NextResponse.json({ message: 'Nombre y especie son obligatorios' }, { status: 400 });
    }

    // Procesar imagen
    const file = formData.get('imagen') as File | null;
    let imagen: string | null = null;
    if (file && file.size > 0) {
      const ext = path.extname(file.name) || '.jpg';
      const filename = `adopcion-${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      imagen = `/uploads/adopciones/${filename}`;
    }

    const insertQuery = `
      INSERT INTO adopciones 
      (nombre, especie, raza, edad_anios, tamano, ciudad, pais, descripcion, refugio, imagen, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      nombre,
      especie,
      raza,
      edad_anios ? parseInt(edad_anios) : null,
      tamano,
      ciudad,
      pais,
      descripcion,
      refugio,
      imagen,
      estado,
    ]);

    const newId = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM adopciones WHERE id = ?', [newId]);
    return NextResponse.json((rows as any)[0], { status: 201 });

  } catch (error: any) {
    console.error('Error al crear adopción:', error);
    return NextResponse.json({ message: 'Error al crear adopción', error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar adopción
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get('id') as string;
    if (!id) return NextResponse.json({ message: 'ID es obligatorio' }, { status: 400 });

    const nombre = formData.get('nombre') as string;
    const especie = formData.get('especie') as string;
    const raza = formData.get('raza') as string | null;
    const edad_anios = formData.get('edad_anios') as string | null;
    const tamano = formData.get('tamano') as string | null;
    const ciudad = formData.get('ciudad') as string | null;
    const pais = formData.get('pais') as string | null;
    const descripcion = formData.get('descripcion') as string | null;
    const refugio = formData.get('refugio') as string | null;
    const estado = formData.get('estado') as string;

    const file = formData.get('imagen') as File | null;
    let imagen: string | null = null;

    if (file && file.size > 0) {
      const ext = path.extname(file.name) || '.jpg';
      const filename = `adopcion-${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      imagen = `/uploads/adopciones/${filename}`;
    }

    const updateQuery = `
      UPDATE adopciones
      SET nombre=?, especie=?, raza=?, edad_anios=?, tamano=?, ciudad=?, pais=?,
          descripcion=?, refugio=?, estado=?, imagen = COALESCE(?, imagen)
      WHERE id=?
    `;

    const [result] = await pool.query(updateQuery, [
      nombre,
      especie,
      raza,
      edad_anios ? parseInt(edad_anios) : null,
      tamano,
      ciudad,
      pais,
      descripcion,
      refugio,
      estado,
      imagen,
      id,
    ]);

    if ((result as any).affectedRows === 0)
      return NextResponse.json({ message: 'Adopción no encontrada' }, { status: 404 });

    const [rows] = await pool.query('SELECT * FROM adopciones WHERE id=?', [id]);
    return NextResponse.json((rows as any)[0]);
  } catch (error: any) {
    console.error('Error al actualizar adopción:', error);
    return NextResponse.json({ message: 'Error al actualizar adopción', error: error.message }, { status: 500 });
  }
}

// PATCH - Actualizar solo el estado
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const estado = searchParams.get('estado');

    if (!id) {
      return NextResponse.json({ message: 'ID es obligatorio' }, { status: 400 });
    }

    if (!estado || (estado !== 'Disponible' && estado !== 'Adoptado')) {
      return NextResponse.json(
        { message: 'Estado debe ser "Disponible" o "Adoptado"' },
        { status: 400 }
      );
    }

    // Solo actualizar el campo estado
    const [result] = await pool.query(
      'UPDATE adopciones SET estado = ? WHERE id = ?',
      [estado, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Adopción no encontrada' }, { status: 404 });
    }

    // ✅ Si se marca como "Adoptado", rechazar todas las solicitudes pendientes
    if (estado === 'Adoptado') {
      await pool.query(
        `UPDATE solicitudes_adopcion 
         SET estado_solicitud = 'Rechazada' 
         WHERE adopcion_id = ? AND estado_solicitud = 'Pendiente'`,
        [id]
      );
    }

    const [rows] = await pool.query('SELECT * FROM adopciones WHERE id = ?', [id]);
    return NextResponse.json({
      message: 'Estado actualizado exitosamente',
      adopcion: (rows as any)[0],
    });
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json(
      { message: 'Error al actualizar estado', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar adopción
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID obligatorio' }, { status: 400 });

    // Eliminar imagen
    const [rows] = await pool.query('SELECT imagen FROM adopciones WHERE id = ?', [id]);
    const adopcion = (rows as any)[0];
    if (adopcion?.imagen) {
      const filePath = path.join(process.cwd(), 'public', adopcion.imagen);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const [result] = await pool.query('DELETE FROM adopciones WHERE id = ?', [id]);
    if ((result as any).affectedRows === 0)
      return NextResponse.json({ message: 'Adopción no encontrada' }, { status: 404 });

    return NextResponse.json({ message: 'Adopción eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar adopción:', error);
    return NextResponse.json({ message: 'Error al eliminar adopción', error: error.message }, { status: 500 });
  }
}
