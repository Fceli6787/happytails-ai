// No necesita 'use client' porque no tiene interactividad ni hooks
import styles from '../styles/PetCard.module.css';

// Definimos los tipos para las props del componente
interface Mascota {
    id: number;
    nombre: string;
    nombre_raza: string;
    nombre_especie: string;
    fecha_nacimiento: string;
    peso_kg: number;
    estado_vacunacion: 'Al día' | 'Pendiente' | 'No aplica';
}

interface PetCardProps {
    mascota: Mascota;
}

const PetCard = ({ mascota }: PetCardProps) => {
  const isVaccineOk = mascota.estado_vacunacion === 'Al día';
  
  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const cumple = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
        edad--;
    }
    return `${edad} años`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{mascota.nombre}</h3>
        <span className={`${styles.status} ${isVaccineOk ? styles.statusOk : styles.statusPending}`}>
          {mascota.estado_vacunacion}
        </span>
      </div>
      <p><strong>Especie:</strong> {mascota.nombre_especie || 'No especificada'}</p>
      <p><strong>Raza:</strong> {mascota.nombre_raza || 'No especificada'}</p>
      <p><strong>Edad:</strong> {calcularEdad(mascota.fecha_nacimiento)}</p>
      <p><strong>Peso:</strong> {mascota.peso_kg ? `${mascota.peso_kg} kg` : 'N/A'}</p>
    </div>
  );
};

export default PetCard;