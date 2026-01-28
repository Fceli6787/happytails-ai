// Archivo: components/InspectUserModal.tsx
// (MODIFICADO para un layout más ancho y legible)
'use client';

import { useEffect, useState } from 'react';
import styles from './InspectUserModal.module.css'; // Usaremos este CSS actualizado
// Importamos la interfaz de la API que ya creamos
import type { UserDetails } from '@/app/api/admin/users/[id]/route'; 

interface InspectUserModalProps {
  userId: number;
  onClose: () => void;
}

export default function InspectUserModal({ userId, onClose }: InspectUserModalProps) {
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        if (!res.ok) {
          throw new Error('No se pudieron cargar los detalles del usuario.');
        }
        const data: UserDetails = await res.json();
        setDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <div className={styles.modalContainer}>
      {isLoading && <p className={styles.loadingText}>Cargando detalles...</p>}
      {error && <p className={styles.error}>{error}</p>}
      
      {details && (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Inspeccionando a: {details.info.nombre_completo} {details.info.apellidos}
            </h2>
            <button onClick={onClose} className={styles.closeButton}>×</button>
          </div>

          {/* Sección de Información Básica */}
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Información del Usuario</h3>
            <div className={styles.infoGrid}>
              <div><strong>Email:</strong> {details.info.email}</div>
              <div><strong>Teléfono:</strong> {details.info.telefono || 'N/A'}</div>
              <div><strong>Cédula:</strong> {details.info.cedula || 'N/A'}</div>
              <div><strong>Rol:</strong> {details.info.rol}</div>
            </div>
          </div>

          {/* Sección de Listas (Mascotas y Adopciones) */}
          <div className={styles.listsContainer}>
            {/* Lista de Mascotas Personales */}
            <div className={styles.listWrapper}>
              <h3 className={styles.sectionTitle}>
                Mascotas Personales ({details.mascotas.length})
              </h3>
              <div className={styles.scrollableList}>
                {details.mascotas.length > 0 ? (
                  <ul>
                    {details.mascotas.map(pet => (
                      <li key={pet.id} className={styles.listItem}>
                        <span>{pet.nombre}</span>
                        <span className={styles.badge}>{pet.especie}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyText}>Este usuario no tiene mascotas personales.</p>
                )}
              </div>
            </div>

            {/* Lista de Publicaciones de Adopción */}
            <div className={styles.listWrapper}>
              <h3 className={styles.sectionTitle}>
                Publicaciones de Adopción ({details.adopciones.length})
              </h3>
              <div className={styles.scrollableList}>
                {details.adopciones.length > 0 ? (
                  <ul>
                    {details.adopciones.map(adp => (
                      <li key={adp.id} className={styles.listItem}>
                        <span>{adp.nombre}</span>
                        <span className={`${styles.badge} ${styles[adp.estado.toLowerCase()]}`}>
                          {adp.estado} ({adp.total_solicitudes} solic.)
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyText}>Este usuario no tiene publicaciones de adopción.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}