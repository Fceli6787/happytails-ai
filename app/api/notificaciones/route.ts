import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { pool } from "@/lib/db";

// Helper para crear respuestas con cabeceras CORS básicas para facilitar debugging
function withCors(body: any, init?: ResponseInit) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...(init && (init.headers as Record<string,string>)),
  } as Record<string,string>;

  return NextResponse.json(body, { ...(init || {}), headers });
}

// 🟢 OBTENER notificaciones de recordatorios próximos
export async function GET(request: NextRequest) {
  try {
    console.log('[api/notificaciones] GET', request.url);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    // Validar userId si viene en query string
    const userIdNum = userId ? Number(userId) : null;
    if (userId && Number.isNaN(userIdNum)) {
      return withCors({ ok: false, error: 'Parámetro userId inválido' }, { status: 400 });
    }
    // Si se proporciona userId, primero obtener notificaciones user (tabla `notificaciones`)
    let userNotifications: any[] = [];
    if (userIdNum) {
      const [nRows] = await pool.query(`SELECT id, id_usuario, mensaje, leido, fecha FROM notificaciones WHERE id_usuario = ? ORDER BY fecha DESC`, [userIdNum]);
      userNotifications = (nRows as any[]).map((r) => ({ id: r.id, mensaje: r.mensaje, fecha: r.fecha, tipo: 'notificacion', leido: r.leido }));
    }

    let query = `
      SELECT r.id, r.fecha_vencimiento, r.estado, r.notas,
             m.nombre AS nombre_mascota,
             t.nombre AS tipo_recordatorio
      FROM recordatorios r
      JOIN mascotas m ON r.mascota_id = m.id
      JOIN catalogo_tipos_recordatorio t ON r.tipo_recordatorio_id = t.id
      WHERE r.estado = 'pendiente' AND r.fecha_vencimiento <= DATE_ADD(NOW(), INTERVAL 3 DAY)
    `;
    
    if (userId) {
      query += ` AND m.propietario_id = ?`;
    }
    
    query += ` ORDER BY r.fecha_vencimiento ASC`;
    
    const queryParams = userIdNum ? [userIdNum] : [];
    const [rows] = await pool.query(query, queryParams);

    const reminders = (rows as any[]).map((r) => ({
      id: r.id,
      mensaje: `📌 ${r.tipo_recordatorio} para ${r.nombre_mascota} vence el ${new Date(r.fecha_vencimiento).toLocaleDateString()}`,
      fecha: r.fecha_vencimiento,
      estado: r.estado,
      notas: r.notas,
      tipo: 'recordatorio'
    }));

    // Combinar notificaciones del usuario (tabla notificaciones) y recordatorios
    const combined = [...userNotifications, ...reminders];

    return withCors({ ok: true, data: combined });
  } catch (err: any) {
    const errStr = err?.message ?? String(err);
    console.error("❌ Error en GET /api/notificaciones:", err);
    // Devolver un mensaje legible y no exponer objetos no serializables directamente
    return withCors(
      { ok: false, error: "Error al obtener notificaciones", details: errStr },
      { status: 500 }
    );
  }
}

// 🟢 Manejar método POST para evitar error 405
export async function POST(request: NextRequest) {
  console.log('[api/notificaciones] POST recibido');
  try {
    const body = await request.json().catch(() => ({}));
    const usuario_id = body.usuario_id ?? body.userId ?? body.user_id;
    const mensaje = body.mensaje ?? body.body ?? '';

    if (!usuario_id || !mensaje) {
      return withCors({ ok: false, error: 'Faltan campos: usuario_id y mensaje son requeridos' }, { status: 400 });
    }

    const [result] = await pool.execute(
      `INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)`,
      [usuario_id, mensaje]
    );

    const insertId = (result as any).insertId ?? null;

    return withCors({ ok: true, id: insertId });
  } catch (err: any) {
    console.error('[api/notificaciones] Error en POST:', err);
    return withCors({ ok: false, error: 'Error al crear notificación', details: err?.message ?? String(err) }, { status: 500 });
  }
}

// Responder a preflight / OPTIONS para evitar 405 en CORS preflights
export async function OPTIONS(request: NextRequest) {
  // Logear preflight para diagnosticar preflights CORS
  console.log('[api/notificaciones] OPTIONS (preflight) recibido', request.headers.get('origin'));
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return new NextResponse(null, { status: 204, headers });
}

// Definir handlers para métodos no soportados comúnmente (evita 405 genérico inesperado)
export async function PUT() {
  return withCors({ ok: false, error: 'Método PUT no permitido' }, { status: 405 });
}
export async function PATCH() {
  return withCors({ ok: false, error: 'Método PATCH no permitido' }, { status: 405 });
}
export async function DELETE() {
  return withCors({ ok: false, error: 'Método DELETE no permitido' }, { status: 405 });
}
export async function HEAD(request: NextRequest) {
  console.log('[api/notificaciones] HEAD recibido');
  // Responder similar a GET pero sin cuerpo
  const res = new NextResponse(null, { status: 200 });
  res.headers.set('Access-Control-Allow-Origin', '*');
  return res;
}
