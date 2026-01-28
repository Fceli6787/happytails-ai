// Archivo: app/api/admin/solicitudes-adopcion/route.ts
import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// PATCH - Cambiar estado de una solicitud
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const estado = searchParams.get('estado');

    if (!id) {
      return NextResponse.json({ message: 'ID es obligatorio' }, { status: 400 });
    }

    if (!estado || !['Pendiente', 'Aprobada', 'Rechazada'].includes(estado)) {
      return NextResponse.json(
        { message: 'Estado debe ser "Pendiente", "Aprobada" o "Rechazada"' },
        { status: 400 }
      );
    }

    // Actualizar estado de la solicitud
    const [result] = await pool.query(
      'UPDATE solicitudes_adopcion SET estado_solicitud = ? WHERE id = ?',
      [estado, id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Solicitud no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Solicitud ${estado.toLowerCase()} exitosamente`,
    });
  } catch (error: any) {
    console.error('Error al actualizar solicitud:', error);
    return NextResponse.json(
      { message: 'Error al actualizar solicitud', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una solicitud
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID obligatorio' }, { status: 400 });
    }

    const [result] = await pool.query(
      'DELETE FROM solicitudes_adopcion WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Solicitud no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar solicitud:', error);
    return NextResponse.json(
      { message: 'Error al eliminar solicitud', error: error.message },
      { status: 500 }
    );
  }
}
