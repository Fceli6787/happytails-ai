'use client';

import { useState, useEffect } from 'react';
import PetCard from './PetCard';
import styles from '@/styles/Dashboard.module.css';

interface Mascota {
  id: number;
  nombre: string;
  especie?: string | null;
  raza?: string | null;
  nombre_raza?: string | null;
  nombre_especie?: string | null;
  fecha_nacimiento?: string | null;
  edad_anios?: number | null;
  edad_meses?: number | null;
  peso_kg?: number | null;
  descripcion?: string | null;
  estado_vacunacion?: 'Al día' | 'Pendiente' | 'No aplica' | null;
  foto_url?: string | null;
}

interface PetListProps {
  refreshTrigger?: boolean;
}

export default function PetList({ refreshTrigger }: PetListProps) {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔁 Cargar mascotas desde el backend
  const fetchMascotas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mascotas');
      if (!res.ok) throw new Error('Error al cargar las mascotas');

      const data = await res.json();

      // 🧹 Limpieza y normalización de datos
      const mascotasLimpias = data.map((m: any) => ({
        id: m.id,
        nombre: m.nombre || 'Sin nombre',
        especie: m.especie || m.nombre_especie || null,
        raza: m.raza || m.nombre_raza || null,
        fecha_nacimiento: m.fecha_nacimiento || null,
        edad_anios: m.edad_anios || null,
        edad_meses: m.edad_meses || null,
        peso_kg: m.peso_kg || null,
        descripcion: m.descripcion || null,
        estado_vacunacion: m.estado_vacunacion || 'No aplica',
        foto_url: m.foto_url || null,
      }));

      setMascotas(mascotasLimpias);
    } catch (err: any) {
      console.error('❌ Error al obtener mascotas:', err);
      setError(err.message || 'Error desconocido al cargar mascotas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, [refreshTrigger]);

  // 🕓 Estado de carga
  if (loading) {
    return <p className={styles.loadingMessage}>Cargando mascotas...</p>;
  }

  // ❌ Error
  if (error) {
    return <p className={styles.errorMessage}>Error: {error}</p>;
  }

  // ℹ️ Sin mascotas
  if (mascotas.length === 0) {
    return <p className={styles.infoMessage}>No hay mascotas registradas aún.</p>;
  }

  // ✅ Mostrar lista
  return (
    <div className={styles.grid}>
      {mascotas.map((mascota) => (
        <PetCard
          key={mascota.id}
          mascota={mascota}
          onRefresh={fetchMascotas}
          onDelete={() => fetchMascotas()}
        />
      ))}
    </div>
  );
}

