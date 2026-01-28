// Archivo: app/api/admin/usuarios/[id]/route.ts
// Obtiene detalles completos de un usuario específico

import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { parseSessionCookie } from '@/lib/utils/session';

// Interfaz para los detalles que devolveremos
export interface UserDetails {
  info: {
    id: number;
    username: string;
    nombre_completo: string;
    apellidos: string;
    email: string;
    telefono: string;
    cedula: string;
    rol: string;
    fecha_creacion: string;
  };
  mascotas: {
    id: number;
    nombre: string;
    especie: string;
    raza_id: number | null;
    estado_vacunacion: string;
  }[];
  adopciones: {
    id: number;
    nombre: string;
    estado: 'Disponible' | 'Adoptado';
    especie: string;
    total_solicitudes: number;
  }[];
  estadisticas: {
    total_mascotas: number;
    total_adopciones: number;
    total_adopciones_disponibles: number;
    total_adopciones_adoptadas: number;
    total_solicitudes_recibidas: number;
  };
}

/**
 * GET: Obtiene los detalles de un usuario específico,
 * incluyendo sus mascotas y publicaciones de adopción.
 * Solo accesible por 'admin' o 'superadmin'.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Seguridad: Verificar rol
    const session = parseSessionCookie(req);
    
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.rol !== 'admin' && session.rol !== 'superadmin') {
      return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
    }

    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no proporcionado' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // 2. Query para la Info del Usuario
    const [userRows]: [any[], any] = await connection.execute(
      `SELECT 
        id, 
        username,
        nombre_completo, 
        apellidos, 
        email, 
        telefono, 
        cedula, 
        rol,
        fecha_creacion
      FROM usuarios 
      WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userInfo = userRows[0];

    // 🔒 OPCIONAL: Permitir ver detalles del superadmin pero sin permitir edición
    // (la protección de edición/eliminación está en el otro endpoint)

    // 3. Query para las Mascotas Personales
    const [petRows]: [any[], any] = await connection.execute(
      `SELECT 
        id, 
        nombre, 
        especie,
        raza_id,
        estado_vacunacion
      FROM mascotas 
      WHERE propietario_id = ? 
      ORDER BY nombre ASC`,
      [userId]
    );

    // 4. Query para las Publicaciones de Adopción (con conteo de solicitudes)
    const [adoptionRows]: [any[], any] = await connection.execute(
      `SELECT 
         a.id, 
         a.nombre, 
         a.estado,
         a.especie,
         COUNT(s.id) AS total_solicitudes
       FROM 
         adopciones a
       LEFT JOIN 
         solicitudes_adopcion s ON a.id = s.adopcion_id
       WHERE 
         a.propietario_id = ?
       GROUP BY 
         a.id
       ORDER BY 
         a.nombre ASC`,
      [userId]
    );

    // 5. Estadísticas generales
    const totalMascotas = petRows.length;
    const totalAdopciones = adoptionRows.length;
    const totalDisponibles = adoptionRows.filter((a: any) => a.estado === 'Disponible').length;
    const totalAdoptadas = adoptionRows.filter((a: any) => a.estado === 'Adoptado').length;
    const totalSolicitudes = adoptionRows.reduce((sum: number, a: any) => 
      sum + parseInt(a.total_solicitudes, 10), 0
    );

    connection.release();

    // 6. Devolver la respuesta completa
    const report: UserDetails = {
      info: userInfo,
      mascotas: petRows,
      adopciones: adoptionRows.map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        estado: row.estado,
        especie: row.especie,
        total_solicitudes: parseInt(row.total_solicitudes, 10),
      })),
      estadisticas: {
        total_mascotas: totalMascotas,
        total_adopciones: totalAdopciones,
        total_adopciones_disponibles: totalDisponibles,
        total_adopciones_adoptadas: totalAdoptadas,
        total_solicitudes_recibidas: totalSolicitudes,
      },
    };

    return NextResponse.json(report);

  } catch (error: any) {
    console.error(`Error en GET /api/admin/usuarios/[id]:`, error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
