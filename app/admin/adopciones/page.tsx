'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AdopcionForm from '@/components/AdopcionForm';
import styles from '@/styles/AdopcionesReport.module.css';

// --- Interfaces ---
interface ReportStats {
  totalPublicaciones: number;
  totalDisponibles: number;
  totalAdoptadas: number;
  totalSolicitudes: number;
}

interface SolicitudInfo {
  id_solicitud: number;
  id_solicitante: number;
  nombre_solicitante: string;
  email_solicitante: string;
  username_solicitante: string;
  fecha_solicitud: string;
  estado_solicitud: 'Pendiente' | 'Aprobada' | 'Rechazada';
}

interface AdopcionPublicacion {
  id_publicacion: number;
  nombre_mascota: string;
  especie: string;
  raza: string;
  estado_publicacion: 'Disponible' | 'Adoptado';
  id_propietario: number;
  nombre_propietario: string;
  email_propietario: string;
  imagen?: string;
  descripcion?: string;
  edad_anios?: number;
  tamano?: string;
  ciudad?: string;
  pais?: string;
  refugio?: string;
  solicitudes: SolicitudInfo[];
}

interface ApiResponse {
  stats: ReportStats;
  list: AdopcionPublicacion[];
}

interface GroupedSolicitud {
  solicitante: {
    id: number;
    nombre: string;
    email: string;
    username: string;
  };
  totalSolicitudes: number;
  mascotasSolicitadas: {
    id_solicitud: number;
    id_publicacion: number;
    nombre_mascota: string;
    especie: string;
    estado_publicacion: 'Disponible' | 'Adoptado';
    fecha_solicitud: string;
    estado_solicitud: 'Pendiente' | 'Aprobada' | 'Rechazada';
  }[];
}

export default function AdopcionesAdminPage() {
  const [report, setReport] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSolicitanteId, setOpenSolicitanteId] = useState<number | null>(null);
  
  // Estados para gestión de adopciones
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'publicaciones' | 'solicitudes'>('publicaciones');

  // Cargar datos
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/adopciones');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No se pudo cargar el reporte');
      }
      const data: ApiResponse = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Agrupar solicitudes
  const groupedSolicitudes = useMemo(() => {
    if (!report) return [];
    const groups = new Map<number, GroupedSolicitud>();

    for (const pub of report.list) {
      for (const sol of pub.solicitudes || []) {
        let group = groups.get(sol.id_solicitante);
        if (!group) {
          group = {
            solicitante: {
              id: sol.id_solicitante,
              nombre: sol.nombre_solicitante,
              email: sol.email_solicitante,
              username: sol.username_solicitante,
            },
            totalSolicitudes: 0,
            mascotasSolicitadas: [],
          };
          groups.set(sol.id_solicitante, group);
        }
        group.totalSolicitudes += 1;
        group.mascotasSolicitadas.push({
          id_solicitud: sol.id_solicitud,
          id_publicacion: pub.id_publicacion,
          nombre_mascota: pub.nombre_mascota,
          especie: pub.especie,
          estado_publicacion: pub.estado_publicacion,
          fecha_solicitud: sol.fecha_solicitud,
          estado_solicitud: sol.estado_solicitud,
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) =>
      a.solicitante.nombre.localeCompare(b.solicitante.nombre)
    );
  }, [report]);

  // Handlers
  const toggleAccordion = (solicitanteId: number) => {
    setOpenSolicitanteId(openSolicitanteId === solicitanteId ? null : solicitanteId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Seguro que deseas eliminar la adopción de "${nombre}"?`)) return;

    try {
      const res = await fetch(`/api/adopciones?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      alert('✅ Adopción eliminada correctamente');
      fetchData();
    } catch (err) {
      alert('❌ Error al eliminar la adopción');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    fetchData();
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: 'Disponible' | 'Adoptado') => {
    try {
      const res = await fetch(`/api/adopciones?id=${id}&estado=${nuevoEstado}`, {
        method: 'PATCH',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const data = await res.json();
      alert(`✅ ${data.message || `Estado cambiado a: ${nuevoEstado}`}`);
      fetchData();
    } catch (err: any) {
      console.error('Error al cambiar estado:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  // Handlers para gestionar solicitudes
  const handleCambiarEstadoSolicitud = async (
    solicitudId: number, 
    nuevoEstado: 'Aprobada' | 'Rechazada'
  ) => {
    try {
      const res = await fetch(
        `/api/admin/solicitudes-adopcion?id=${solicitudId}&estado=${nuevoEstado}`,
        { method: 'PATCH' }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      const data = await res.json();
      alert(`✅ ${data.message}`);
      fetchData();
    } catch (err: any) {
      console.error('Error al cambiar estado de solicitud:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleEliminarSolicitud = async (solicitudId: number, nombreSolicitante: string) => {
    if (!confirm(`¿Eliminar la solicitud de ${nombreSolicitante}?`)) return;

    try {
      const res = await fetch(`/api/admin/solicitudes-adopcion?id=${solicitudId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar');
      }

      alert('✅ Solicitud eliminada correctamente');
      fetchData();
    } catch (err: any) {
      console.error('Error al eliminar solicitud:', err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>❌ {error}</p>
          <button onClick={fetchData} className={styles.errorButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return <div className={styles.container}><p>No hay datos disponibles.</p></div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInfo}>
          <h1>Sistema de Adopciones</h1>
          <p>Gestiona las publicaciones y solicitudes de adopción</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className={styles.createButton}
        >
          ➕ Nueva Adopción
        </button>
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <AdopcionForm
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          editMode={editingId !== null}
          initialData={editingId ? (() => {
            const pub = report.list.find(a => a.id_publicacion === editingId);
            if (!pub) return undefined;
            return {
              id: pub.id_publicacion,
              nombre: pub.nombre_mascota,
              especie: pub.especie,
              raza: pub.raza || '',
              edad_anios: pub.edad_anios || '',
              tamano: pub.tamano || '',
              ciudad: pub.ciudad || '',
              pais: pub.pais || '',
              refugio: pub.refugio || '',
              descripcion: pub.descripcion || '',
              estado: pub.estado_publicacion,
              foto_url: pub.imagen || undefined,
            };
          })() : undefined}
        />
      )}

      {/* Estadísticas */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h2>{report.stats.totalPublicaciones}</h2>
          <p>Publicaciones Totales</p>
        </div>
        <div className={styles.statCard}>
          <h2>{report.stats.totalDisponibles}</h2>
          <p>Disponibles</p>
        </div>
        <div className={styles.statCard}>
          <h2>{report.stats.totalAdoptadas}</h2>
          <p>Adoptadas</p>
        </div>
        <div className={styles.statCard}>
          <h2>{report.stats.totalSolicitudes}</h2>
          <p>Solicitudes Totales</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          onClick={() => setVistaActual('publicaciones')}
          className={`${styles.tabButton} ${
            vistaActual === 'publicaciones' ? styles.tabButtonActive : ''
          }`}
        >
          📋 Publicaciones ({report.list.length})
        </button>
        <button
          onClick={() => setVistaActual('solicitudes')}
          className={`${styles.tabButton} ${
            vistaActual === 'solicitudes' ? styles.tabButtonActive : ''
          }`}
        >
          📨 Solicitudes ({report.stats.totalSolicitudes})
        </button>
      </div>

      {/* Vista de Publicaciones */}
      {vistaActual === 'publicaciones' && (
        <div className={styles.reportContainer}>
          <h2>Gestión de Publicaciones</h2>
          <p>Administra las mascotas disponibles para adopción</p>

          {report.list.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>🐾</span>
              <p className={styles.emptyStateTitle}>Aún no hay publicaciones</p>
              <button
                onClick={() => setShowForm(true)}
                className={styles.emptyStateButton}
              >
                Crear Primera Adopción
              </button>
            </div>
          ) : (
            <div className={styles.publicationsList}>
              {report.list.map((pub) => (
                <div key={pub.id_publicacion} className={styles.publicationCard}>
                  <div className={styles.publicationContent}>
                    {/* Imagen */}
                    {pub.imagen && (
                      <div className={styles.publicationImage}>
                        <img
                          src={pub.imagen}
                          alt={pub.nombre_mascota}
                        />
                      </div>
                    )}

                    {/* Información */}
                    <div className={styles.publicationInfo}>
                      <div className={styles.publicationHeader}>
                        <div className={styles.publicationTitle}>
                          <h3>{pub.nombre_mascota}</h3>
                          <p>{pub.especie} {pub.raza && `• ${pub.raza}`}</p>
                        </div>
                        <span
                          className={`${styles.estado} ${
                            pub.estado_publicacion === 'Disponible'
                              ? styles.disponible
                              : styles.adoptado
                          }`}
                        >
                          {pub.estado_publicacion}
                        </span>
                      </div>

                      {/* Detalles */}
                      <div className={styles.publicationDetails}>
                        {pub.edad_anios && (
                          <p className={styles.publicationDetail}>
                            <span>🎂 Edad:</span> {pub.edad_anios} años
                          </p>
                        )}
                        {pub.tamano && (
                          <p className={styles.publicationDetail}>
                            <span>📏 Tamaño:</span> {pub.tamano}
                          </p>
                        )}
                        {pub.ciudad && (
                          <p className={styles.publicationDetail}>
                            <span>📍 Ubicación:</span> {pub.ciudad}, {pub.pais}
                          </p>
                        )}
                        {pub.refugio && (
                          <p className={styles.publicationDetail}>
                            <span>🏠 Refugio:</span> {pub.refugio}
                          </p>
                        )}
                      </div>

                      {pub.descripcion && (
                        <p className={styles.publicationDescription}>{pub.descripcion}</p>
                      )}

                      {/* Solicitudes */}
                      <div className={styles.solicitudesInfo}>
                        <p>📨 {pub.solicitudes?.length || 0} solicitud(es) de adopción</p>
                      </div>

                      {/* Acciones */}
                      <div className={styles.publicationActions}>
                        <button
                          onClick={() => handleEdit(pub.id_publicacion)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          ✏️ Editar
                        </button>
                        
                        {pub.estado_publicacion === 'Disponible' ? (
                          <button
                            onClick={() => handleCambiarEstado(pub.id_publicacion, 'Adoptado')}
                            className={`${styles.actionButton} ${styles.adoptButton}`}
                          >
                            ✅ Marcar como Adoptado
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCambiarEstado(pub.id_publicacion, 'Disponible')}
                            className={`${styles.actionButton} ${styles.availableButton}`}
                          >
                            🔄 Marcar como Disponible
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(pub.id_publicacion, pub.nombre_mascota)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista de Solicitudes */}
      {vistaActual === 'solicitudes' && (
        <div className={styles.reportContainer}>
          <h2>Reporte por Solicitante</h2>
          <p>Mascotas que cada usuario ha solicitado adoptar</p>

          <div className={styles.accordion}>
            {groupedSolicitudes.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyStateIcon}>📭</span>
                <p className={styles.emptyStateTitle}>Aún no hay solicitudes de adopción</p>
                <p className={styles.emptyStateText}>Las solicitudes aparecerán aquí cuando los usuarios las envíen</p>
              </div>
            ) : (
              groupedSolicitudes.map((group) => (
                <div key={group.solicitante.id} className={styles.accordionItem}>
                  <button
                    className={styles.accordionHeader}
                    onClick={() => toggleAccordion(group.solicitante.id)}
                    aria-expanded={openSolicitanteId === group.solicitante.id}
                  >
                    <div className={styles.headerInfo}>
                      <span>
                        {group.solicitante.nombre} (<strong>{group.solicitante.username}</strong>)
                      </span>
                      <span className={styles.headerEmail}>{group.solicitante.email}</span>
                    </div>
                    <div className={styles.headerStats}>
                      <span>{group.totalSolicitudes} Solicitud(es)</span>
                      <span className={styles.accordionIcon}>
                        {openSolicitanteId === group.solicitante.id ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  <div
                    className={`${styles.accordionContent} ${
                      openSolicitanteId === group.solicitante.id ? styles.open : ''
                    }`}
                  >
                    <table className={styles.solicitudesTable}>
                      <thead>
                        <tr>
                          <th>Mascota</th>
                          <th>Especie</th>
                          <th>Estado (Publicación)</th>
                          <th>Fecha de Solicitud</th>
                          <th>Estado (Solicitud)</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.mascotasSolicitadas.map((mascota, index) => (
                          <tr key={`${group.solicitante.id}-${mascota.id_publicacion}-${index}`}>
                            <td data-label="Mascota">{mascota.nombre_mascota}</td>
                            <td data-label="Especie">{mascota.especie}</td>
                            <td data-label="Estado (Publicación)">
                              <span
                                className={`${styles.estado} ${
                                  styles[mascota.estado_publicacion.toLowerCase()]
                                }`}
                              >
                                {mascota.estado_publicacion}
                              </span>
                            </td>
                            <td data-label="Fecha de Solicitud">{formatDate(mascota.fecha_solicitud)}</td>
                            <td data-label="Estado (Solicitud)">
                              <span
                                className={`${styles.estado} ${
                                  styles[mascota.estado_solicitud.toLowerCase()]
                                }`}
                              >
                                {mascota.estado_solicitud}
                              </span>
                            </td>
                            <td data-label="Acciones">
                              <div className={styles.solicitudActions}>
                                {mascota.estado_solicitud === 'Pendiente' && (
                                  <>
                                    <button
                                      onClick={() => handleCambiarEstadoSolicitud(
                                        mascota.id_solicitud,
                                        'Aprobada'
                                      )}
                                      className={`${styles.actionButton} ${styles.approveButton}`}
                                      title="Aprobar solicitud"
                                    >
                                      ✅
                                    </button>
                                    <button
                                      onClick={() => handleCambiarEstadoSolicitud(
                                        mascota.id_solicitud,
                                        'Rechazada'
                                      )}
                                      className={`${styles.actionButton} ${styles.rejectButton}`}
                                      title="Rechazar solicitud"
                                    >
                                      ❌
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleEliminarSolicitud(
                                    mascota.id_solicitud,
                                    group.solicitante.nombre
                                  )}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                  title="Eliminar solicitud"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
