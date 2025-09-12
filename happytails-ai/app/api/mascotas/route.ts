// (Controlador)
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// El nombre de la funcion en método HTTP
export async function GET() {
  try {
    const query = `
      SELECT 
        m.id, m.nombre, m.fecha_nacimiento, m.peso_kg, m.estado_vacunacion,
        r.nombre AS nombre_raza,
        e.nombre AS nombre_especie
      FROM mascotas AS m
      LEFT JOIN catalogo_razas AS r ON m.raza_id = r.id
      LEFT JOIN catalogo_especies AS e ON r.especie_id = e.id
    `;
    
    const [rows] = await pool.query(query);
    return NextResponse.json(rows);

  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: 'Error interno del servidor', error: errorMessage },
      { status: 500 }
    );
  }
}