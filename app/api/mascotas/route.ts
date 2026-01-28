// app/api/mascotas/route.ts
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'mascotas');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ GET - Listar mascotas (modo completo o simplificado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const simple = searchParams.get("simple");

    const query = simple === "true"
      ? `SELECT id, nombre FROM mascotas ORDER BY nombre ASC`
      : `
        SELECT 
          id,
          propietario_id,
          nombre,
          especie,
          raza_id,
          peso_kg,
          edad_anios,
          edad_meses,
          fecha_nacimiento,
          descripcion,
          estado_vacunacion,
          foto_url,
          fecha_creacion
        FROM mascotas
        ORDER BY id DESC
      `;

    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('❌ Error en GET mascotas:', error);
    return NextResponse.json(
      { message: 'Error interno al obtener mascotas', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Crear mascota (multipart/form-data)
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const propietario_id = formData.get('propietario_id') as string;
    const nombre = formData.get('nombre') as string;
    const especie = formData.get('especie') as string | null;
    const raza = formData.get('raza') as string | null;
    const peso_kg = formData.get('peso_kg') as string | null;
    const edad_anios = formData.get('edad_anios') as string | null;
    const edad_meses = formData.get('edad_meses') as string | null;
    const fecha_nacimiento = formData.get('fecha_nacimiento') as string | null;
    const descripcion = formData.get('descripcion') as string | null;

    if (!propietario_id || !nombre) {
      return NextResponse.json({ message: 'Propietario y nombre son obligatorios' }, { status: 400 });
    }

    // 🖼 Procesar imagen
    const file = formData.get('imagen') as File | null;
    let foto_url: string | null = null;

    if (file && file.size > 0) {
      const ext = path.extname(file.name) || '.jpg';
      const filename = `mascota-${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      foto_url = `/uploads/mascotas/${filename}`;
    }

    // ✅ Insertar mascota con todos los campos
    const insertQuery = `
      INSERT INTO mascotas 
      (propietario_id, nombre, especie, raza_id, peso_kg, edad_anios, edad_meses, fecha_nacimiento, descripcion, estado_vacunacion, foto_url)
      VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, 'Pendiente', ?)
    `;

    const [result] = await pool.query(insertQuery, [
      propietario_id,
      nombre,
      especie || null,
      peso_kg || null,
      edad_anios || null,
      edad_meses || null,
      fecha_nacimiento || null,
      descripcion || null,
      foto_url,
    ]);

    const newPetId = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM mascotas WHERE id = ?', [newPetId]);
    return NextResponse.json((rows as any)[0], { status: 201 });

  } catch (error: any) {
    console.error('❌ Error al crear mascota:', error);
    return NextResponse.json({ message: 'Error al crear mascota', error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar mascota (multipart/form-data)
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = formData.get('id') as string;
    const propietario_id = formData.get('propietario_id') as string;
    const nombre = formData.get('nombre') as string;
    const especie = formData.get('especie') as string | null;
    const raza = formData.get('raza') as string | null;
    const peso_kg = formData.get('peso_kg') as string | null;
    const edad_anios = formData.get('edad_anios') as string | null;
    const edad_meses = formData.get('edad_meses') as string | null;
    const fecha_nacimiento = formData.get('fecha_nacimiento') as string | null;
    const descripcion = formData.get('descripcion') as string | null;

    if (!id) return NextResponse.json({ message: 'ID de mascota es obligatorio' }, { status: 400 });

    // 🖼 Si hay nueva imagen
    const file = formData.get('imagen') as File | null;
    let foto_url: string | null = null;

    if (file && file.size > 0) {
      const ext = path.extname(file.name) || '.jpg';
      const filename = `mascota-${uuidv4()}${ext}`;
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      foto_url = `/uploads/mascotas/${filename}`;
    }

    // ✅ Actualizar con todos los campos
    const updateQuery = `
      UPDATE mascotas
      SET propietario_id = ?, nombre = ?, especie = ?, raza_id = NULL, peso_kg = ?, 
          edad_anios = ?, edad_meses = ?, fecha_nacimiento = ?, descripcion = ?, 
          foto_url = COALESCE(?, foto_url)
      WHERE id = ?
    `;

    const [result] = await pool.query(updateQuery, [
      propietario_id,
      nombre,
      especie || null,
      peso_kg || null,
      edad_anios || null,
      edad_meses || null,
      fecha_nacimiento || null,
      descripcion || null,
      foto_url,
      id,
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Mascota no encontrada' }, { status: 404 });
    }

    const [rows] = await pool.query('SELECT * FROM mascotas WHERE id = ?', [id]);
    return NextResponse.json((rows as any)[0]);
  } catch (error: any) {
    console.error('❌ Error al actualizar mascota:', error);
    return NextResponse.json({ message: 'Error al actualizar mascota', error: error.message }, { status: 500 });
  }
}

// DELETE - eliminar mascota + borrar imagen local si existe
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'ID obligatorio' }, { status: 400 });

    const [rows] = await pool.query('SELECT foto_url FROM mascotas WHERE id = ?', [id]);
    const mascota = (rows as any)[0];
    if (mascota?.foto_url) {
      const filePath = path.join(process.cwd(), 'public', mascota.foto_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const [result] = await pool.query('DELETE FROM mascotas WHERE id = ?', [id]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Mascota no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Mascota eliminada correctamente' });
  } catch (error: any) {
    console.error('❌ Error al eliminar mascota:', error);
    return NextResponse.json({ message: 'Error al eliminar mascota', error: error.message }, { status: 500 });
  }
}
