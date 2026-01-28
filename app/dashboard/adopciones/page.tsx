'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/AdopcionCard.module.css';

interface Adopcion {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  edad_anios?: number;
  tamano?: string;
  ciudad?: string;
  pais?: string;
  refugio?: string;
  descripcion?: string;
  imagen?: string;
  estado: 'Disponible' | 'Adoptado';
  fecha_registro: string;
}

const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
  </div>
);

const AdopcionCardUsuario = ({ 
  adopcion, 
  onSolicitar 
}: { 
  adopcion: Adopcion; 
  onSolicitar: (id: number) => void 
}) => {
  const [solicitando, setSolicitando] = useState(false);

  const handleSolicitar = async () => {
    setSolicitando(true);
    await onSolicitar(adopcion.id);
    setSolicitando(false);
  };

  const edadTexto = adopcion.edad_anios 
    ? `${adopcion.edad_anios} año${adopcion.edad_anios > 1 ? 's' : ''}`
    : 'No especificada';

  return (
    <article className={styles.petCard}>
      {/* Imagen */}
      <div className={styles.petImageContainer}>
        {adopcion.imagen ? (
          <img src={adopcion.imagen} alt={adopcion.nombre} className={styles.petImage} />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageIcon}>🐾</span>
            <span className={styles.noImageText}>Sin foto</span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className={styles.petInfo}>
        <div className={styles.petHeader}>
          <div className={styles.petNameSection}>
            <h3 className={styles.petName}>{adopcion.nombre}</h3>
            <p className={styles.petSpecies}>{adopcion.especie}</p>
          </div>
        </div>

        <div className={styles.petDetailsGrid}>
          <div className={styles.petDetail}>
            <span className={styles.detailLabel}>🎂 Edad</span>
            <span className={styles.detailValue}>{edadTexto}</span>
          </div>

          {adopcion.raza && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>🐕 Raza</span>
              <span className={styles.detailValue}>{adopcion.raza}</span>
            </div>
          )}

          {adopcion.tamano && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>📏 Tamaño</span>
              <span className={styles.detailValue}>{adopcion.tamano}</span>
            </div>
          )}

          {(adopcion.ciudad || adopcion.pais) && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>📍 Ubicación</span>
              <span className={styles.detailValue}>
                {[adopcion.ciudad, adopcion.pais].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {adopcion.refugio && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>🏠 Refugio</span>
              <span className={styles.detailValue}>{adopcion.refugio}</span>
            </div>
          )}
        </div>

        {/* Estado de adopción */}
        <div className={`${styles.estadoCuadro} ${
          adopcion.estado === 'Disponible' ? styles.cuadroDisponible : styles.cuadroAdoptado
        }`}>
          <div className={styles.estadoIcono}>
            {adopcion.estado === 'Disponible' ? '✅' : '❤️'}
          </div>
          <div className={styles.estadoTexto}>
            <div className={styles.estadoTitulo}>ESTADO DE ADOPCIÓN</div>
            <div className={styles.estadoMensaje}>
              {adopcion.estado === 'Disponible' ? '¡SE PUEDE ADOPTAR!' : 'YA FUE ADOPTADO'}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {adopcion.descripcion && (
          <div className={styles.petDescription}>
            <h3 className={styles.descriptionTitle}>📝 Descripción</h3>
            <p className={styles.descriptionText}>{adopcion.descripcion}</p>
          </div>
        )}

        {/* Botón de solicitud */}
        {adopcion.estado === 'Disponible' && (
          <div className={styles.petActionsInline}>
            <button
              onClick={handleSolicitar}
              disabled={solicitando}
              className={`${styles.adoptButton} ${solicitando ? styles.loading : ''}`}
            >
              {solicitando ? '⏳ Enviando...' : '💜 Solicitar Adopción'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default function AdopcionesUsuarioPage() {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'disponibles' | 'adoptadas'>('disponibles');

  const loadAdopciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/adopciones');
      if (!res.ok) throw new Error('Error al cargar adopciones');
      const data = await res.json();
      setAdopciones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdopciones();
  }, [loadAdopciones]);

  const handleSolicitar = async (adopcionId: number) => {
    try {
      const res = await fetch('/api/adopciones/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adopcion_id: adopcionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al enviar solicitud');
      }

      alert('✅ ¡Solicitud de adopción enviada exitosamente! Un administrador revisará tu solicitud pronto.');
      loadAdopciones();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const adopcionesFiltradas = adopciones.filter(a => {
    if (filtro === 'disponibles') return a.estado === 'Disponible';
    if (filtro === 'adoptadas') return a.estado === 'Adoptado';
    return true;
  });

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 sm:p-8">
        <div className="max-w-7xl mx-auto text-center p-6 sm:p-10 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-lg sm:text-xl font-bold text-red-800">❌ {error}</p>
          <button 
            onClick={loadAdopciones} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mascotas en Adopción</h1>
          <p className={styles.pageSubtitle}>Encuentra tu compañero perfecto</p>
        </header>

        {/* Filtros */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFiltro('todas')}
            className={`${styles.filterButton} ${
              filtro === 'todas' ? styles.filterButtonActive : ''
            }`}
          >
            Todas ({adopciones.length})
          </button>
          <button
            onClick={() => setFiltro('disponibles')}
            className={`${styles.filterButton} ${
              filtro === 'disponibles' ? styles.filterButtonAvailable : ''
            }`}
          >
            Disponibles ({adopciones.filter(a => a.estado === 'Disponible').length})
          </button>
          <button
            onClick={() => setFiltro('adoptadas')}
            className={`${styles.filterButton} ${
              filtro === 'adoptadas' ? styles.filterButtonAdopted : ''
            }`}
          >
            Adoptadas ({adopciones.filter(a => a.estado === 'Adoptado').length})
          </button>
        </div>

        {/* Lista de adopciones */}
        {adopcionesFiltradas.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>🐾</span>
            <p className={styles.emptyStateTitle}>No hay mascotas en esta categoría</p>
            <p className={styles.emptyStateText}>Intenta con otro filtro o vuelve más tarde</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {adopcionesFiltradas.map((adopcion) => (
              <AdopcionCardUsuario
                key={adopcion.id}
                adopcion={adopcion}
                onSolicitar={handleSolicitar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
