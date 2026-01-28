'use client';

import styles from '@/styles/PetCard.module.css';
import { useState } from 'react';
import PetForm from './PetForm';

interface Mascota {
  id: number;
  nombre: string;
  especie?: string | null;
  raza?: string | null;
  fecha_nacimiento?: string | null;
  edad_anios?: number | null;
  edad_meses?: number | null;
  peso_kg?: number | null;
  descripcion?: string | null;
  estado_vacunacion?: string | null;
  foto_url?: string | null;
}

interface PetCardProps {
  mascota: Mascota;
  onRefresh?: () => void;
  onDelete?: (id: number) => void;
}

export default function PetCard({ mascota, onRefresh, onDelete }: PetCardProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Seguro que deseas eliminar a ${mascota.nombre}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/mascotas?id=${mascota.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar la mascota');

      onDelete?.(mascota.id);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la mascota.');
    } finally {
      setDeleting(false);
    }
  };

  const edadTexto = (() => {
    if (mascota.edad_anios || mascota.edad_meses) {
      const partes: string[] = [];
      if (mascota.edad_anios) partes.push(`${mascota.edad_anios} año${mascota.edad_anios > 1 ? 's' : ''}`);
      if (mascota.edad_meses) partes.push(`${mascota.edad_meses} mes${mascota.edad_meses > 1 ? 'es' : ''}`);
      return partes.join(' y ');
    }
    return 'No especificada';
  })();

  if (editing) {
    return (
      <div className={styles.cardEdit}>
        <PetForm
          editMode
          initialData={{
            id: mascota.id,
            nombre: mascota.nombre,
            especie: mascota.especie || '',
            raza: mascota.raza || '',
            peso_kg: mascota.peso_kg || '',
            edad_anios: mascota.edad_anios || '',
            edad_meses: mascota.edad_meses || '',
            fecha_nacimiento: mascota.fecha_nacimiento || '',
            descripcion: mascota.descripcion || '',
            foto_url: mascota.foto_url || '',
          }}
          onSuccess={() => {
            setEditing(false);
            onRefresh?.();
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <article className={styles.petCard}>
      {/* Imagen */}
      <div className={styles.petImageContainer}>
        {mascota.foto_url ? (
          <img src={mascota.foto_url} alt={mascota.nombre} className={styles.petImage} />
        ) : (
          <div className={styles.noImage}>
            <span className={styles.noImageIcon}>🐾</span>
            <span className={styles.noImageText}>Sin foto</span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className={styles.petInfo}>
        {/* Header con nombre y estado */}
        <div className={styles.petHeader}>
          <div className={styles.petNameSection}>
            <h3 className={styles.petName}>{mascota.nombre}</h3>
            <p className={styles.petSpecies}>
              {mascota.especie || 'Sin especie'}
            </p>
          </div>
          
          {mascota.estado_vacunacion && (
            <span
              className={`${styles.vaccineStatus} ${
                mascota.estado_vacunacion === 'Al día'
                  ? styles.vaccineOk
                  : mascota.estado_vacunacion === 'Pendiente'
                  ? styles.vaccinePending
                  : ''
              }`}
            >
              {mascota.estado_vacunacion}
            </span>
          )}
        </div>

        {/* Grid de detalles */}
        <div className={styles.petDetailsGrid}>
          <div className={styles.petDetail}>
            <span className={styles.detailLabel}>
              🎂 Edad
            </span>
            <span className={styles.detailValue}>{edadTexto}</span>
          </div>

          {mascota.raza && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>
                🐕 Raza
              </span>
              <span className={styles.detailValue}>{mascota.raza}</span>
            </div>
          )}

          {mascota.peso_kg && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>
                ⚖️ Peso
              </span>
              <span className={styles.detailValue}>{mascota.peso_kg} kg</span>
            </div>
          )}

          {mascota.fecha_nacimiento && (
            <div className={styles.petDetail}>
              <span className={styles.detailLabel}>
                📅 Nacimiento
              </span>
              <span className={styles.detailValue}>
                {new Date(mascota.fecha_nacimiento).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Descripción */}
        {mascota.descripcion && (
          <p className={styles.petDescription}>
            {mascota.descripcion}
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className={styles.petActions}>
        <button
          onClick={() => setEditing(true)}
          className={`${styles.iconButton} ${styles.editButton}`}
          aria-label="Editar mascota"
          title="Editar mascota"
        >
          ✏️
        </button>

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
}
