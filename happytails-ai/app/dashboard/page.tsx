'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent, ReactNode, CSSProperties } from 'react';
import PetList from '@/components/PetList';
import styles from '../../styles/Dashboard.module.css';

interface Pet {
  nombre: string;
  especie: string;
  raza: string;
  edad: number | string;
  descripcion: string;
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

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

const modalContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '720px'
};

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

export default function DashboardPage() {
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshPets, setRefreshPets] = useState(false);

  // Stats de ejemplo (puedes conectarlas a tu API si lo deseas)
  const [stats] = useState({ mascotas: 2, citasMes: 4, recordatorios: 3, saludScore: 92 });

  // Form state
  const [newPet, setNewPet] = useState<Pet>({
    nombre: '',
    especie: '',
    raza: '',
    edad: '',
    descripcion: ''
  });
  const nombreRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPet(prev => ({
      ...prev,
      [name]: name === 'edad' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mascotas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPet),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar la mascota');
      }
      setNewPet({ nombre: '', especie: '', raza: '', edad: '', descripcion: '' });
      setShowForm(false);
      setRefreshPets(prev => !prev);
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // UX modal
  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowForm(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm]);

  useEffect(() => {
    if (showForm) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      nombreRef.current?.focus();
      return () => { document.body.style.overflow = prev; };
    }
  }, [showForm]);

  return (
    <>
      <header className={styles.header}>
        <h2>Mi Dashboard</h2>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowForm(true)}
          >
            + Nueva Mascota
          </button>
        </div>
      </header>

      <div className={styles.pageContent}>
        {/* HERO */}
        <section className={styles.heroBanner}>
          <div>
            <h1 className={styles.heroTitle}>Mi Dashboard PetCare</h1>
            <p className={styles.heroSubtitle}>
              Gestiona el cuidado integral de tus mascotas con IA
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statHeart}`}>
            <div className={styles.statIcon} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1 21.35l-1.1-1.02C5.14 15.24 2 12.39 2 8.99 2 6.24 4.24 4 6.99 4c1.54 0 3.04.74 4.01 1.91a5.18 5.18 0 014.01-1.91C17.76 4 20 6.24 20 8.99c0 3.4-3.14 6.25-8.9 11.34l-1 .92z"/></svg>
            </div>
            <div>
              <div className={styles.statLabel}>Mascotas</div>
              <div className={styles.statValue}>{stats.mascotas}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCalendar}`}>
            <div className={styles.statIcon} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h2v2h6V2h2v2h3a1 1 0 011 1v15a2 2 0 01-2 2H5a2 2 0 01-2-2V5a1 1 0 011-1h3V2zm13 8H4v10h16V10z"/></svg>
            </div>
            <div>
              <div className={styles.statLabel}>Citas Mes</div>
              <div className={styles.statValue}>{stats.citasMes}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statBell}`}>
            <div className={styles.statIcon} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.5 2.5 0 01-2.45-2h4.9A2.5 2.5 0 0112 22zm8-6V11a8 8 0 10-16 0v5l-2 2v1h20v-1l-2-2z"/></svg>
            </div>
            <div>
              <div className={styles.statLabel}>Recordatorios</div>
              <div className={styles.statValue}>{stats.recordatorios}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statTrend}`}>
            <div className={styles.statIcon} aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17l6-6 4 4 7-7v5h2V5h-8v2h5l-6 6-4-4-7 7z"/></svg>
            </div>
            <div>
              <div className={styles.statLabel}>Salud Score</div>
              <div className={styles.statValue}>{stats.saludScore}%</div>
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL */}
        <section className={styles.twoCol}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3>Mis Mascotas</h3>
              <button className={styles.addButton} onClick={() => setShowForm(true)}>+ Agregar Mascota</button>
            </div>

            {/* Lista real */}
            <PetList refreshTrigger={refreshPets} />

            {/* Ejemplo de card (opcional visual) */}
            {/* <article className={styles.petCard}>
              <div className={styles.petAvatar}>L</div>
              <div className={styles.petMeta}>
                <h4>Luna</h4>
                <p>Golden Retriever • 3 años</p>
                <div className={styles.petBadges}>
                  <span className={`${styles.chip} ${styles.chipOk}`}>Saludable</span>
                  <span className={styles.nextDate}>Próxima cita: 15 Ene 2025</span>
                </div>
              </div>
              <div className={styles.petActions}>
                <button aria-label="Editar" className={styles.iconGhost}>✎</button>
                <button aria-label="Eliminar" className={styles.iconGhost}>🗑</button>
              </div>
            </article> */}
          </section>

          <aside className={styles.sideCol}>
            <section className={styles.sectionCard}>
              <h3>Recomendaciones IA</h3>
              <div className={styles.recoList}>
                <div className={styles.recoItem}>
                  <h4>Revisión Dental para Luna</h4>
                  <p>Basado en su edad y raza, es recomendable una limpieza dental preventiva.</p>
                </div>
                <div className={styles.recoItem}>
                  <h4>Ejercicio para Max</h4>
                  <p>Su nivel de actividad ha disminuido. Aumentar caminatas a 45 min diarios.</p>
                </div>
              </div>
            </section>

            <section className={styles.sectionCard}>
              <h3>Próximas Citas</h3>
              <ul className={styles.appList}>
                <li>
                  <div className={styles.appIcon} aria-hidden>📅</div>
                  <div>
                    <strong>Luna</strong>
                    <div className={styles.appSub}>15 Ene • Chequeo General</div>
                  </div>
                </li>
                <li>
                  <div className={styles.appIcon} aria-hidden>📅</div>
                  <div>
                    <strong>Max</strong>
                    <div className={styles.appSub}>22 Ene • Vacuna Anual</div>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </div>

      {/* MODAL NUEVA MASCOTA */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <form className={styles.petForm} onSubmit={handleSubmit}>
          <h3>Agregar Nueva Mascota</h3>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {loading && <p className={styles.loadingMessage}>Guardando mascota...</p>}

          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre</label>
            <input
              ref={nombreRef}
              type="text"
              id="nombre"
              name="nombre"
              value={newPet.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="especie">Especie</label>
            <select
              id="especie"
              name="especie"
              value={newPet.especie}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="ave">Ave</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="raza">Raza</label>
            <input
              type="text"
              id="raza"
              name="raza"
              value={newPet.raza}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={newPet.edad}
              onChange={handleInputChange}
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={newPet.descripcion}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Mascota'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
