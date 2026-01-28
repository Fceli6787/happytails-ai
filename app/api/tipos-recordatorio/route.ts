// app/api/tipos-recordatorio/route.ts
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET - Listar tipos de recordatorio (modo completo o simplificado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const simple = searchParams.get("simple");

    const query = simple === "true"
      ? `SELECT id, nombre FROM catalogo_tipos_recordatorio ORDER BY nombre ASC`
      : `SELECT * FROM catalogo_tipos_recordatorio ORDER BY id DESC`;

    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("❌ Error en GET tipos-recordatorio:", error);
    return NextResponse.json(
      { message: "Error interno al obtener tipos de recordatorio", error: error.message },
      { status: 500 }
    );
  }
}
