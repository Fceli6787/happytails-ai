// Archivo: app/api/admin/adopciones/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parseSessionCookie } from '@/lib/utils/session';

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación usando tu sistema
    const session = parseSessionCookie(req);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const connection = await pool.getConnection();

    try {
      // Estadísticas
      const [statsRows]: [any[], any] = await connection.execute(`
        SELECT 
          COUNT(*) AS totalPublicaciones,
          SUM(CASE WHEN estado = 'Disponible' THEN 1 ELSE 0 END) AS totalDisponibles,
          SUM(CASE WHEN estado = 'Adoptado' THEN 1 ELSE 0 END) AS totalAdoptadas,
          (SELECT COUNT(*) FROM solicitudes_adopcion) AS totalSolicitudes
        FROM adopciones
      `);

      const stats = {
        totalPublicaciones: parseInt(statsRows[0].totalPublicaciones, 10),
        totalDisponibles: parseInt(statsRows[0].totalDisponibles || 0, 10),
        totalAdoptadas: parseInt(statsRows[0].totalAdoptadas || 0, 10),
        totalSolicitudes: parseInt(statsRows[0].totalSolicitudes, 10),
      };

      // Lista de publicaciones con TODOS los campos necesarios
      const [publicaciones]: [any[], any] = await connection.execute(`
        SELECT 
          a.id AS id_publicacion,
          a.nombre AS nombre_mascota,
          a.especie,
          a.raza,
          a.edad_anios,
          a.tamano,
          a.ciudad,
          a.pais,
          a.refugio,
          a.descripcion,
          a.imagen,
          a.estado AS estado_publicacion,
          a.propietario_id AS id_propietario,
          u.nombre_completo AS nombre_propietario,
          u.email AS email_propietario
        FROM adopciones a
        LEFT JOIN usuarios u ON a.propietario_id = u.id
        ORDER BY a.estado ASC, a.id DESC
      `);

      // Para cada publicación, obtener sus solicitudes con estado_solicitud
      for (const pub of publicaciones) {
        const [solicitudes]: [any[], any] = await connection.execute(`
          SELECT 
            s.id AS id_solicitud,
            s.usuario_id AS id_solicitante,
            s.estado_solicitud,
            s.fecha_solicitud,
            u.nombre_completo AS nombre_solicitante,
            u.email AS email_solicitante,
            u.username AS username_solicitante
          FROM solicitudes_adopcion s
          JOIN usuarios u ON s.usuario_id = u.id
          WHERE s.adopcion_id = ?
          ORDER BY s.fecha_solicitud DESC
        `, [pub.id_publicacion]);

        pub.solicitudes = solicitudes.map((sol: any) => ({
          id_solicitud: sol.id_solicitud,
          id_solicitante: sol.id_solicitante,
          nombre_solicitante: sol.nombre_solicitante,
          email_solicitante: sol.email_solicitante,
          username_solicitante: sol.username_solicitante,
          fecha_solicitud: sol.fecha_solicitud,
          estado_solicitud: sol.estado_solicitud, // ✅ Ahora viene de la BD
        }));
      }

      connection.release();

      return NextResponse.json({
        stats,
        list: publicaciones,
      });

    } catch (error) {
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error en GET /api/admin/adopciones:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
