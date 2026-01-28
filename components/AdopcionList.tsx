'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/AdopcionCard.module.css';

// 💡 Tipo Adopcion
interface Adopcion {
  id: number;
  nombre: string;
  especie?: string | null;
  raza?: string | null;
  edad_anios?: number | null;
  edad_meses?: number | null;
  tamano?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  refugio?: string | null;
  descripcion?: string | null;
  imagen?: string | null;
  estado?: string | null;
  peso_kg?: number | null;
  fecha_nacimiento?: string | null;
}

// 💡 Servicios
const fetchAdopciones = async (): Promise<Adopcion[]> => {
  const res = await fetch('/api/adopciones');
  if (!res.ok) throw new Error('Error al cargar adopciones');
  return res.json();
};

const deleteAdopcion = async (id: number) => {
  try {
    const res = await fetch(`/api/adopciones?id=${id}`, { method: 'DELETE' });
    return { success: res.ok };
  } catch {
    return { success: false };
  }
};

// 💡 Spinner
const Spinner = () => (
  <div className="relative">
    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
  </div>
);

// 💡 Tarjeta estilo PetCard
const AdopcionCard = ({
  adopcion,
  onDelete,
  onEdit,
}: {
  adopcion: Adopcion;
  onDelete: () => void;
  onEdit?: () => void;
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Seguro que deseas eliminar a ${adopcion.nombre}?`)) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  const edadTexto = (() => {
    if (adopcion.edad_anios || adopcion.edad_meses) {
      const partes: string[] = [];
      if (adopcion.edad_anios) partes.push(`${adopcion.edad_anios} año${adopcion.edad_anios > 1 ? 's' : ''}`);
      if (adopcion.edad_meses) partes.push(`${adopcion.edad_meses} mes${adopcion.edad_meses > 1 ? 'es' : ''}`);
      return partes.join(' y ');
    }
    return 'No especificada';
  })();

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
        {/* Header con nombre */}
        <div className={styles.petHeader}>
          <div className={styles.petNameSection}>
            <h3 className={styles.petName}>{adopcion.nombre}</h3>
            <p className={styles.petSpecies}>
              {adopcion.especie || 'Sin especie'}
            </p>
          </div>
        </div>

        {/* Grid de detalles */}
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

          {adopcion.peso_kg && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>⚖️ Peso</span>
              <span className={styles.detailValue}>{adopcion.peso_kg} kg</span>
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
                {adopcion.ciudad && adopcion.pais 
                  ? `${adopcion.ciudad}, ${adopcion.pais}`
                  : adopcion.ciudad || adopcion.pais}
              </span>
            </div>
          )}

          {adopcion.refugio && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>🏠 Refugio</span>
              <span className={styles.detailValue}>{adopcion.refugio}</span>
            </div>
          )}

          {adopcion.fecha_nacimiento && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>📅 Nacimiento</span>
              <span className={styles.detailValue}>
                {new Date(adopcion.fecha_nacimiento).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* CUADRO DE ESTADO DE ADOPCIÓN */}
        {adopcion.estado && (
          <div className={`${styles.estadoCuadro} ${
            adopcion.estado === 'Disponible' 
              ? styles.cuadroDisponible 
              : adopcion.estado === 'Adoptado' 
              ? styles.cuadroAdoptado 
              : styles.cuadroPendiente
          }`}>
            <div className={styles.estadoIcono}>
              {adopcion.estado === 'Disponible' && '✅'}
              {adopcion.estado === 'Adoptado' && '❤️'}
              {adopcion.estado === 'Pendiente' && '⏳'}
            </div>
            <div className={styles.estadoTexto}>
              <div className={styles.estadoTitulo}>ESTADO DE ADOPCIÓN</div>
              <div className={styles.estadoMensaje}>
                {adopcion.estado === 'Disponible' && '¡SE PUEDE ADOPTAR!'}
                {adopcion.estado === 'Adoptado' && 'YA FUE ADOPTADO'}
                {adopcion.estado === 'Pendiente' && 'ADOPCIÓN PENDIENTE'}
              </div>
            </div>
          </div>
        )}

        {/* Descripción */}
        {adopcion.descripcion && (
          <div className={styles.petDescription}>
            <h3 className={styles.descriptionTitle}>📝 Descripción</h3>
            <p className={styles.descriptionText}>{adopcion.descripcion}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className={styles.petActions}>
        {onEdit && (
          <button
            onClick={onEdit}
            className={`${styles.iconButton} ${styles.editButton}`}
            aria-label="Editar mascota"
            title="Editar mascota"
          >
            ✏️
          </button>
        )}

        <button
          onClick={handleDelete}
          className={`${styles.iconButton} ${styles.deleteButton}`}
          aria-label="Eliminar mascota"
          title="Eliminar mascota"
          disabled={deleting}
        >
          {deleting ? '⏳' : '🗑️'}
        </button>
      </div>
    </article>
  );
};

export default function AdopcionList({
  refreshTrigger,
  onEdit,
}: {
  refreshTrigger?: boolean;
  onEdit?: (id: number) => void;
}) {
  const [adopciones, setAdopciones] = useState<Adopcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdopciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdopciones();
      setAdopciones(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar adopciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdopciones();
  }, [refreshTrigger, loadAdopciones]);

  const handleDelete = async (id: number) => {
    const original = [...adopciones];
    setAdopciones((prev) => prev.filter((a) => a.id !== id));

    const { success } = await deleteAdopcion(id);
    if (!success) {
      setAdopciones(original);
      alert('❌ No se pudo eliminar la adopción. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-100">
        <Spinner />
        <p className="mt-6 text-lg font-semibold text-purple-700 animate-pulse">
          Cargando mascotas adorables...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border border-red-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-red-800">¡Algo salió mal!</p>
        <p className="mt-2 text-red-700">{error}</p>
        <button 
          onClick={loadAdopciones}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (adopciones.length === 0) {
    return (
      <div className="text-center p-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
          <span className="text-4xl">🏠</span>
        </div>
        <p className="text-2xl font-bold text-amber-900 mb-2">
          Aún no hay mascotas disponibles
        </p>
        <p className="text-amber-700">
          Las adorables mascotas aparecerán aquí pronto.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Lista de tarjetas (una por fila) */}
      <div className="space-y-6">
        {adopciones.map((adopcion) => (
          <AdopcionCard
            key={adopcion.id}
            adopcion={adopcion}
            onDelete={() => handleDelete(adopcion.id)}
            onEdit={onEdit ? () => onEdit(adopcion.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}