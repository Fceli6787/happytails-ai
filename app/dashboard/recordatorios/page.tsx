// Archivo: app/dashboard/recordatorios/page.tsx
// (MODIFICADO: Añadido bloqueo de rol)
'use client';
import { useEffect, useState, useContext } from 'react'; // <-- AÑADIDO useContext
import styles from '../../../styles/Recordatorios.module.css';
// --- AÑADIDO: Importamos el Contexto ---
import { DashboardContext } from '../DashboardContext';

// ... (Interfaces: Recordatorio, NuevoRecordatorio, Mascota, etc. se quedan igual) ...
interface Recordatorio {
  id: number;
  mascota_id: number;
  tipo_recordatorio_id: number;
  fecha_vencimiento: string;
  estado: string;
  notas: string;
  mascota_nombre?: string;
  tipo_nombre?: string;
}
interface NuevoRecordatorio {
  mascota_id: string;
  tipo_recordatorio_id: string;
  fecha_vencimiento: string;
  estado: string;
  notas: string;
}
interface Mascota {
  id: number;
  nombre: string;
}
interface TipoRecordatorio {
  id: number;
  nombre: string;
}

export default function RecordatoriosPage() {
  // --- AÑADIDO: Obtener la sesión del contexto ---
  const { session } = useContext(DashboardContext);

  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [tiposRecordatorio, setTiposRecordatorio] = useState<TipoRecordatorio[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState<NuevoRecordatorio>({
    mascota_id: '',
    tipo_recordatorio_id: '',
    fecha_vencimiento: '',
    estado: 'pendiente',
    notas: '',
  });

  // ... (Todas tus funciones: resetForm, fetchRecordatorios, fetchMascotas, etc. se quedan EXACTAMENTE IGUAL) ...
  const resetForm = () =>
    setNuevoRecordatorio({
      mascota_id: '',
      tipo_recordatorio_id: '',
      fecha_vencimiento: '',
      estado: 'pendiente',
      notas: '',
    });

  const fetchRecordatorios = async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/recordatorios');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecordatorios(data);
      } else if (data.ok && Array.isArray(data.data)) {
        setRecordatorios(data.data);
      } else {
        setRecordatorios([]);
      }
    } catch (err: any) {
      setError(err.message);
      setRecordatorios([]);
    } finally {
      setCargando(false);
    }
  };

  const fetchMascotas = async () => {
    try {
      const res = await fetch('/api/mascotas?simple=true');
      const data = await res.json();
      setMascotas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error cargando mascotas:', err);
    }
  };

  const fetchTiposRecordatorio = async () => {
    try {
      const res = await fetch('/api/tipos-recordatorio?simple=true');
      const data = await res.json();
      setTiposRecordatorio(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error cargando tipos de recordatorio:', err);
    }
  };

  useEffect(() => {
    // Solo cargar datos si es un usuario
    if (session && session.rol === 'user') {
      fetchRecordatorios();
      fetchMascotas();
      fetchTiposRecordatorio();
    } else if (session) {
      // Si es admin, solo detenemos la carga
      setCargando(false);
    }
  }, [session]); // Depende de la sesión

  const handleAdd = async (e: React.FormEvent) => {
    // ... (Tu función handleAdd se queda igual) ...
    e.preventDefault();
    setMensaje('');
    setError('');
    const payload = {
      mascota_id: Number(nuevoRecordatorio.mascota_id),
      tipo_recordatorio_id: Number(nuevoRecordatorio.tipo_recordatorio_id),
      fecha_vencimiento: nuevoRecordatorio.fecha_vencimiento,
      estado: nuevoRecordatorio.estado,
      notas: nuevoRecordatorio.notas,
    };
    try {
      const url = editando
        ? `/api/recordatorios/${editando}`
        : '/api/recordatorios';
      const method = editando ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && (result.ok || result.id)) {
        await fetchRecordatorios();
        setMensaje(editando ? '✅ Recordatorio actualizado correctamente' : '✅ Recordatorio agregado correctamente');
        resetForm();
        setEditando(null);
      } else {
        throw new Error(result.error || 'Error al guardar el recordatorio');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    // ... (Tu función handleDelete se queda igual) ...
    if (!confirm('¿Estás seguro de eliminar este recordatorio?')) return;
    try {
      const res = await fetch(`/api/recordatorios/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok && (result.ok || result.success)) {
        setRecordatorios((prev) => prev.filter((r) => r.id !== id));
        setMensaje('✅ Recordatorio eliminado correctamente');
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (recordatorio: Recordatorio) => {
    // ... (Tu función handleEdit se queda igual) ...
    setEditando(recordatorio.id);
    setNuevoRecordatorio({
      mascota_id: String(recordatorio.mascota_id),
      tipo_recordatorio_id: String(recordatorio.tipo_recordatorio_id),
      fecha_vencimiento: recordatorio.fecha_vencimiento.split('T')[0],
      estado: recordatorio.estado,
      notas: recordatorio.notas,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    // ... (Tu función handleCancelEdit se queda igual) ...
    setEditando(null);
    resetForm();
  };

  const getNombreMascota = (id: number) =>
    mascotas.find((m) => m.id === id)?.nombre || `#${id}`;
  const getNombreTipo = (id: number) =>
    tiposRecordatorio.find((t) => t.id === id)?.nombre || `#${id}`;

  const getEstadoBadge = (estado: string) => {
    // ... (Tu función getEstadoBadge se queda igual) ...
    const clases: Record<string, string> = {
      pendiente: styles.estadoPendiente,
      completado: styles.estadoCompletado,
      cancelado: styles.estadoCancelado,
    };
    return <span className={clases[estado] || ''}>{estado}</span>;
  };
  
  // --- AÑADIDO: Estado de carga de sesión ---
  if (!session) {
    return <p>Cargando...</p>; // O un spinner
  }

  // --- AÑADIDO: Bloqueo para Administradores ---
  if (session.rol === 'admin' || session.rol === 'superadmin') {
    return (
      <div className={styles.pageContent}>
        <div className={styles.adminWarning}> {/* Usamos una clase local */}
          <h2>🚫 Acceso Restringido</h2>
          <p>
            Los administradores no pueden acceder a "Recordatorios".
            <br />
            Tu rol es supervisar el sistema, no gestionar recordatorios personales.
          </p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO NORMAL PARA 'user' ---
  return (
    <>
      <header className={styles.header}>
        <h2>Gestión de Recordatorios</h2>
        <p>Administra los recordatorios de tus mascotas.</p>
      </header>
      
      {/* (El resto de tu JSX se queda exactamente igual) */}
      <div className={styles.pageContent}>
        <section className={styles.sectionCard}>
          {/* ... (Formulario) ... */}
          <div className={styles.sectionHeader}>
            <h3>{editando ? '✏️ Editar Recordatorio' : '➕ Nuevo Recordatorio'}</h3>
          </div>
          <form onSubmit={handleAdd} className={styles.form}>
            {/* ... (todos los inputs y botones del formulario) ... */}
            <div className={styles.formGroup}>
              <label>Mascota</label>
              <select
                value={nuevoRecordatorio.mascota_id}
                onChange={(e) =>
                  setNuevoRecordatorio({ ...nuevoRecordatorio, mascota_id: e.target.value })
                }
                required
              >
                <option value="">Seleccionar mascota</option>
                {mascotas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Tipo de recordatorio</label>
              <select
                value={nuevoRecordatorio.tipo_recordatorio_id}
                onChange={(e) =>
                  setNuevoRecordatorio({
                    ...nuevoRecordatorio,
                    tipo_recordatorio_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Seleccionar tipo</option>
                {tiposRecordatorio.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de vencimiento</label>
              <input
                type="date"
                value={nuevoRecordatorio.fecha_vencimiento}
                onChange={(e) =>
                  setNuevoRecordatorio({ ...nuevoRecordatorio, fecha_vencimiento: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Estado</label>
              <select
                value={nuevoRecordatorio.estado}
                onChange={(e) =>
                  setNuevoRecordatorio({ ...nuevoRecordatorio, estado: e.target.value })
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Notas</label>
              <input
                type="text"
                value={nuevoRecordatorio.notas}
                onChange={(e) => setNuevoRecordatorio({ ...nuevoRecordatorio, notas: e.target.value })}
              />
            </div>
            <div className={styles.formActions}>
              {editando && (
                <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>
                  Cancelar
                </button>
              )}
              <button type="submit" className={styles.addButton}>
                {editando ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
          {mensaje && <p className={styles.successMessage}>{mensaje}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
        </section>

        <section className={styles.sectionCard}>
          {/* ... (Lista de recordatorios) ... */}
          <div className={styles.sectionHeader}>
            <h3>📋 Lista de Recordatorios</h3>
          </div>
          {cargando ? (
            <div className={styles.loadingMessage}>Cargando...</div>
          ) : recordatorios.length === 0 ? (
            <div className={styles.emptyMessage}>No hay recordatorios registrados.</div>
          ) : (
            <>
              <div className={styles.cardList}>
                {recordatorios.map((r) => (
                  <div key={r.id} className={styles.recordCard}>
                    <div className={styles.recordCardHeader}>
                      <div className={styles.recordCardTitle}>
                        <span className={styles.petIcon}>🐾</span>
                        <h4>{getNombreMascota(r.mascota_id)}</h4>
                      </div>
                      {getEstadoBadge(r.estado)}
                    </div>
                    <div className={styles.recordCardBody}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                          <span className={styles.labelIcon}>📋</span>
                          Tipo
                        </span>
                        <span className={styles.infoValue}>
                          {getNombreTipo(r.tipo_recordatorio_id)}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                          <span className={styles.labelIcon}>📅</span>
                          Vencimiento
                        </span>
                        <span className={styles.infoValue}>
                          {r.fecha_vencimiento.split('T')[0]}
                        </span>
                      </div>
                      {r.notas && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            <span className={styles.labelIcon}>📝</span>
                            Notas
                          </span>
                          <span className={styles.infoValue}>{r.notas}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.recordCardFooter}>
                      <button
                        onClick={() => handleEdit(r)}
                        className={styles.editButton}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className={styles.deleteButton}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Mascota</th>
                      <th>Tipo</th>
                      <th>Fecha Vencimiento</th>
                      <th>Estado</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordatorios.map((r) => (
                      <tr key={r.id}>
                        <td>{getNombreMascota(r.mascota_id)}</td>
                        <td>{getNombreTipo(r.tipo_recordatorio_id)}</td>
                        <td>{r.fecha_vencimiento.split('T')[0]}</td>
                        <td>{getEstadoBadge(r.estado)}</td>
                        <td>{r.notas}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleEdit(r)}
                              className={styles.editButton}
                              aria-label="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              className={styles.deleteButton}
                              aria-label="Eliminar"
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
            </>
          )}
        </section>
      </div>
    </>
  );
}