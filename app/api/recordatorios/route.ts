import { NextResponse } from "next/server";
import {
  getAllRecordatorios,
  createRecordatorio,
} from "@/lib/db";

// Obtener todos los recordatorios
export async function GET() {
  try {
    const recordatorios = await getAllRecordatorios();
    return NextResponse.json({ ok: true, data: recordatorios });
  } catch (err: any) {
    console.error("❌ Error al obtener recordatorios:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Crear un nuevo recordatorio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado, notas } = body;

    if (!mascota_id || !tipo_recordatorio_id || !fecha_vencimiento) {
      return NextResponse.json(
        { ok: false, error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const id = await createRecordatorio({
      mascota_id,
      tipo_recordatorio_id,
      fecha_vencimiento,
      estado,
      notas,
    });

    return NextResponse.json({
      ok: true,
      id,
      message: "Recordatorio creado correctamente",
    });
  } catch (err: any) {
    console.error("❌ Error al crear recordatorio:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}