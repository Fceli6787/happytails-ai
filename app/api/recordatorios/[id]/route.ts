import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import type { ResultSetHeader } from "mysql2";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado, notas } = body;
    const id = parseInt(params.id);

    if (!mascota_id || !tipo_recordatorio_id || !fecha_vencimiento) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `UPDATE recordatorios 
       SET mascota_id = ?, 
           tipo_recordatorio_id = ?, 
           fecha_vencimiento = ?, 
           estado = ?, 
           notas = ?
       WHERE id = ?`,
      [mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado || 'pendiente', notas || '', id]
    );

    const affectedRows = (result as ResultSetHeader).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { ok: false, error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Recordatorio actualizado correctamente",
    });
  } catch (err: any) {
    console.error("❌ Error al actualizar recordatorio:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const [result] = await pool.execute(
      `DELETE FROM recordatorios WHERE id = ?`,
      [id]
    );

    const affectedRows = (result as ResultSetHeader).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        { ok: false, error: "Recordatorio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Recordatorio eliminado correctamente",
    });
  } catch (err: any) {
    console.error("❌ Error al eliminar recordatorio:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}