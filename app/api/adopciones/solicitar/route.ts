// Archivo: app/api/adopciones/solicitar/route.ts
// Endpoint para que usuarios soliciten adoptar una mascota

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parseSessionCookie } from '@/lib/utils/session';

export async function POST(request: NextRequest) {
  try {
    // Obtener sesión usando tu sistema existente
    const session = parseSessionCookie(request);

    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const usuario_id = session.id;

    const body = await request.json();
    const { adopcion_id } = body;

    if (!adopcion_id) {
      return NextResponse.json({ message: 'ID de adopción requerido' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Verificar que la adopción existe y está disponible
      const [adopciones]: [any[], any] = await connection.execute(
        'SELECT id, estado, propietario_id FROM adopciones WHERE id = ?',
        [adopcion_id]
      );

      if (adopciones.length === 0) {
        connection.release();
        return NextResponse.json({ message: 'Adopción no encontrada' }, { status: 404 });
      }

      const adopcion = adopciones[0];

      // ✅ NUEVO: Verificar que el usuario no sea el propietario
      if (adopcion.propietario_id === usuario_id) {
        connection.release();
        return NextResponse.json({ 
          message: 'No puedes solicitar la adopción de tu propia mascota' 
        }, { status: 400 });
      }

      // Verificar que esté disponible
      if (adopcion.estado !== 'Disponible') {
        connection.release();
        return NextResponse.json({ 
          message: 'Esta mascota ya no está disponible para adopción' 
        }, { status: 400 });
      }

      // Verificar si el usuario ya solicitó esta adopción
      const [solicitudesExistentes]: [any[], any] = await connection.execute(
        'SELECT id, estado_solicitud FROM solicitudes_adopcion WHERE adopcion_id = ? AND usuario_id = ?',
        [adopcion_id, usuario_id]
      );

      if (solicitudesExistentes.length > 0) {
        const estadoActual = solicitudesExistentes[0].estado_solicitud;
        connection.release();
        
        let mensaje = 'Ya has solicitado la adopción de esta mascota';
        if (estadoActual === 'Rechazada') {
          mensaje = 'Tu solicitud para esta mascota fue rechazada anteriormente';
        } else if (estadoActual === 'Aprobada') {
          mensaje = 'Tu solicitud para esta mascota ya fue aprobada';
        }
        
        return NextResponse.json({ 
          message: mensaje,
          estado: estadoActual
        }, { status: 409 });
      }

      // ✅ MEJORADO: Crear la solicitud con estado explícito
      const [result] = await connection.execute(
        `INSERT INTO solicitudes_adopcion 
         (adopcion_id, usuario_id, estado_solicitud, fecha_solicitud) 
         VALUES (?, ?, 'Pendiente', NOW())`,
        [adopcion_id, usuario_id]
      );

      const solicitudId = (result as any).insertId;

      connection.release();

      return NextResponse.json({ 
        message: 'Solicitud de adopción enviada exitosamente',
        success: true,
        solicitud_id: solicitudId,
        estado: 'Pendiente'
      }, { status: 201 });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error en solicitud de adopción:', error);
    return NextResponse.json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    }, { status: 500 });
  }
}

// GET - Obtener solicitudes del usuario actual
export async function GET(request: NextRequest) {
  try {
    const session = parseSessionCookie(request);

    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const usuario_id = session.id;
    const connection = await pool.getConnection();

    try {
      // Obtener todas las solicitudes del usuario con información de la mascota
      const [solicitudes] = await connection.execute(
        `SELECT 
          s.id as solicitud_id,
          s.estado_solicitud,
          s.fecha_solicitud,
          a.id as adopcion_id,
          a.nombre as mascota_nombre,
          a.especie,
          a.raza,
          a.imagen,
          a.estado as estado_adopcion
        FROM solicitudes_adopcion s
        INNER JOIN adopciones a ON s.adopcion_id = a.id
        WHERE s.usuario_id = ?
        ORDER BY s.fecha_solicitud DESC`,
        [usuario_id]
      );

      connection.release();

      return NextResponse.json({ 
        solicitudes,
        total: (solicitudes as any[]).length
      });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json({ 
      message: 'Error al obtener solicitudes',
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Cancelar una solicitud propia
export async function DELETE(request: NextRequest) {
  try {
    const session = parseSessionCookie(request);

    if (!session) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    const usuario_id = session.id;
    const { searchParams } = new URL(request.url);
    const solicitudId = searchParams.get('id');

    if (!solicitudId) {
      return NextResponse.json({ message: 'ID de solicitud requerido' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Verificar que la solicitud pertenece al usuario
      const [solicitudes]: [any[], any] = await connection.execute(
        'SELECT id, usuario_id, estado_solicitud FROM solicitudes_adopcion WHERE id = ?',
        [solicitudId]
      );

      if (solicitudes.length === 0) {
        connection.release();
        return NextResponse.json({ message: 'Solicitud no encontrada' }, { status: 404 });
      }

      const solicitud = solicitudes[0];

      if (solicitud.usuario_id !== usuario_id) {
        connection.release();
        return NextResponse.json({ 
          message: 'No tienes permiso para cancelar esta solicitud' 
        }, { status: 403 });
      }

      // Solo se pueden cancelar solicitudes pendientes
      if (solicitud.estado_solicitud !== 'Pendiente') {
        connection.release();
        return NextResponse.json({ 
          message: `No se puede cancelar una solicitud ${solicitud.estado_solicitud.toLowerCase()}` 
        }, { status: 400 });
      }

      // Eliminar la solicitud
      await connection.execute(
        'DELETE FROM solicitudes_adopcion WHERE id = ?',
        [solicitudId]
      );

      connection.release();

      return NextResponse.json({ 
        message: 'Solicitud cancelada exitosamente',
        success: true
      });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error al cancelar solicitud:', error);
    return NextResponse.json({ 
      message: 'Error al cancelar solicitud',
      error: error.message 
    }, { status: 500 });
  }
}
