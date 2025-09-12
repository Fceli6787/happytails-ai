'use client';

import { useMemo, useState, ChangeEvent, FormEvent, CSSProperties, ReactNode, useEffect } from 'react';
import styles from '../../../styles/Dashboard.module.css';

type Tipo =
  | 'Vacunación'
  | 'Alimentación'
  | 'Cita'
  | 'Medicación'
  | 'Desparasitación'
  | 'Ejercicio';

type Repeticion = 'Ninguna' | 'Diaria' | 'Semanal' | 'Mensual';

interface Recordatorio {
  id: string;
  mascota: string;
  tipo: Tipo;
  fecha: string;
  hora: string;
  repeticion: Repeticion;
  notas: string;
}

type ModalProps = { open: boolean; onClose: () => void; children: ReactNode };

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '10vh 1rem',
  zIndex: 1000
};

const modalContainerStyle: CSSProperties = { width: '100%', maxWidth: '720px' };

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" onClick={onClose}>
      <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function badgePalette(tipo: Tipo) {
  switch (tipo) {
    case 'Vacunación':
      return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: '💉' };
    case 'Alimentación':
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '🍖' };
    case 'Cita':
      return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', icon: '📅' };
    case 'Medicación':
      return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: '💊' };
    case 'Desparasitación':
      return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', icon: '🦠' };
    case 'Ejercicio':
      return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', icon: '🏃' };
  }
}

function formatFecha(fecha: string) {
  try {
    const d = new Date(fecha + 'T00:00:00');
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return fecha;
  }
}

export default function RecordatoriosPage() {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<Recordatorio[]>([
    {
      id: 'r1',
      mascota: 'Luna',
      tipo: 'Vacunación',
      fecha: '2025-01-15',
      hora: '09:00',
      repeticion: 'Ninguna',
      notas: 'Refuerzo antirrábica'
    },
    {
      id: 'r2',
      mascota: 'Max',
      tipo: 'Alimentación',
      fecha: '2025-01-02',
      hora: '08:00',
      repeticion: 'Diaria',
      notas: 'Dieta BARF 300g'
    },
    {
      id: 'r3',
      mascota: 'Luna',
      tipo: 'Cita',
      fecha: '2025-01-22',
      hora: '16:30',
      repeticion: 'Ninguna',
      notas: 'Chequeo general'
    }
  ]);

  const [form, setForm] = useState<Recordatorio>({
    id: '',
    mascota: '',
    tipo: 'Vacunación',
    fecha: '',
    hora: '',
    repeticion: 'Ninguna',
    notas: ''
  });

  const sorted = useMemo(
    () =>
      [...records].sort((a, b) => {
        const da = new Date(`${a.fecha}T${a.hora || '00:00'}`).getTime();
        const db = new Date(`${b.fecha}T${b.hora || '00:00'}`).getTime();
        return da - db;
      }),
    [records]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleChange =
    (key: keyof Recordatorio) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nuevo: Recordatorio = { ...form, id: String(Date.now()) };
    setRecords((prev) => [nuevo, ...prev]);
    setForm({ id: '', mascota: '', tipo: 'Vacunación', fecha: '', hora: '', repeticion: 'Ninguna', notas: '' });
    setOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <h2>Recordatorios</h2>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={() => setOpen(true)}>+ Nuevo recordatorio</button>
        </div>
      </header>

      <div className={styles.pageContent}>
        <section className={styles.heroBanner}>
          <div>
            <h1 className={styles.heroTitle}>Organiza los cuidados de tus mascotas</h1>
            <p className={styles.heroSubtitle}>Vacunas, alimentación, citas y más en un solo lugar.</p>
          </div>
        </section>

        <section className={styles.twoCol} style={{ marginTop: '1rem' }}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3>Tus recordatorios</h3>
              <button className={styles.addButton} onClick={() => setOpen(true)}>+ Crear</button>
            </div>

            {sorted.length === 0 ? (
              <p className={styles.infoMessage}>No hay recordatorios. Crea el primero con “+ Crear”.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {sorted.map((r) => {
                  const pal = badgePalette(r.tipo);
                  return (
                    <article key={r.id} className={styles.petCard}>
                      <div
                        aria-hidden
                        className={styles.petAvatar}
                        style={{ background: pal.bg, color: pal.color }}
                        title={r.tipo}
                      >
                        {pal.icon}
                      </div>

                      <div className="meta">
                        <h4 style={{ margin: 0, color: '#0f172a' }}>
                          {r.mascota || '—'} • {r.tipo}
                        </h4>
                        <p style={{ margin: '0.2rem 0 0.55rem', color: '#64748b' }}>
                          {formatFecha(r.fecha)} • {r.hora || '—'} • {r.repeticion}
                        </p>
                        <div className={styles.petBadges}>
                          <span
                            className={styles.chip}
                            style={{ background: pal.bg, color: pal.color, borderColor: pal.border }}
                          >
                            {r.tipo}
                          </span>
                          {r.notas && <span className={styles.nextDate}>{r.notas}</span>}
                        </div>
                      </div>

                      <div className={styles.petActions}>
                        <button className={styles.iconGhost} aria-label="Editar">✎</button>
                        <button
                          className={styles.iconGhost}
                          aria-label="Eliminar"
                          onClick={() => setRecords((prev) => prev.filter((x) => x.id !== r.id))}
                        >
                          🗑
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={styles.sideCol}>
            <section className={styles.sectionCard}>
              <h3>Acciones rápidas</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <button className={styles.submitButton} type="button" onClick={() => setOpen(true)}>
                  Nuevo recordatorio
                </button>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={() => setRecords((prev) => [...prev])}
                >
                  Refrescar
                </button>
              </div>
            </section>

            <section className={styles.sectionCard}>
              <h3>Próximos 7 días</h3>
              <ul className={styles.appList}>
                {sorted
                  .filter((r) => {
                    const now = new Date();
                    const d = new Date(`${r.fecha}T${r.hora || '00:00'}`);
                    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 0 && diff <= 7;
                  })
                  .slice(0, 5)
                  .map((r) => (
                    <li key={`n-${r.id}`}>
                      <div className={styles.appIcon} aria-hidden>
                        {badgePalette(r.tipo).icon}
                      </div>
                      <div>
                        <strong>{r.mascota} • {r.tipo}</strong>
                        <div className={styles.appSub}>
                          {formatFecha(r.fecha)} • {r.hora || '—'}
                        </div>
                      </div>
                    </li>
                  ))}
                {sorted.filter((r) => {
                  const now = new Date();
                  const d = new Date(`${r.fecha}T${r.hora || '00:00'}`);
                  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                  return diff >= 0 && diff <= 7;
                }).length === 0 && <p className={styles.infoMessage}>No hay recordatorios en los próximos días.</p>}
              </ul>
            </section>
          </aside>
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <form className={styles.petForm} onSubmit={handleSubmit}>
          <h3>Nuevo recordatorio</h3>

          <div className={styles.formGroup}>
            <label htmlFor="mascota">Mascota</label>
            <input
              id="mascota"
              name="mascota"
              value={form.mascota}
              onChange={handleChange('mascota')}
              placeholder="Nombre de la mascota"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange('tipo')}>
              <option>Vacunación</option>
              <option>Alimentación</option>
              <option>Cita</option>
              <option>Medicación</option>
              <option>Desparasitación</option>
              <option>Ejercicio</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange('fecha')} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="hora">Hora</label>
            <input id="hora" name="hora" type="time" value={form.hora} onChange={handleChange('hora')} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="repeticion">Repetición</label>
            <select id="repeticion" name="repeticion" value={form.repeticion} onChange={handleChange('repeticion')}>
              <option>Ninguna</option>
              <option>Diaria</option>
              <option>Semanal</option>
              <option>Mensual</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notas">Notas</label>
            <textarea id="notas" name="notas" rows={3} value={form.notas} onChange={handleChange('notas')} />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>Guardar</button>
            <button type="button" className={styles.cancelButton} onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
