'use client'; // <-- Necesario por useState y useEffect

import { useState, useEffect } from 'react';
import PetCard from './PetCard';
import styles from '../styles/Dashboard.module.css';

// Definimos el tipo de dato para una mascota
interface Mascota {
  id: number;
  nombre: string;
  nombre_raza: string;
  nombre_especie: string;
  fecha_nacimiento: string;
  peso_kg: number;
  estado_vacunacion: 'Al día' | 'Pendiente' | 'No aplica';
}

interface PetListProps {
  refreshTrigger: boolean;
}

const PetList = ({ refreshTrigger }: PetListProps) => {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMascotas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/mascotas');
        if (!response.ok) {
          throw new Error('Error al cargar las mascotas');
        }
        const data = await response.json();
        setMascotas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  if (loading) {
    return <p className={styles.loadingMessage}>Cargando mascotas...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>Error: {error}</p>;
  }

  if (mascotas.length === 0) {
    return <p className={styles.infoMessage}>No hay mascotas registradas aún.</p>;
  }

  return (
    <div className={styles.grid}>
      {mascotas.map((mascota) => (
        <PetCard key={mascota.id} mascota={mascota} />
      ))}
    </div>
  );
};

export default PetList;
