// Archivo: app/dashboard/page.tsx
// (MODIFICADO: Añadido bloqueo de rol y ID de usuario dinámico)
'use client';

import { useState, useEffect, useContext } from 'react'; // <-- AÑADIDO useContext
import { createPortal } from 'react-dom';
import PetList from '@/components/PetList';
import styles from '../../styles/Dashboard.module.css';
import PetForm from '@/components/PetForm';
import Notificaciones from '@/components/Notificaciones';
// --- AÑADIDO: Importamos el Contexto ---
import { DashboardContext } from './DashboardContext';

// 🐾 Interfaces (sin cambios)
interface Pet {
  nombre: string;
  especie: string;
  raza: string;
  edad: number | string;
  descripcion: string;
}
interface NewPet extends Pet {
  propietario_id: number | string;
}
type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

// Modal (sin cambios)
function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
}

export default function DashboardPage() {
  // --- AÑADIDO: Obtener la sesión del contexto ---
  const { session } = useContext(DashboardContext);

  const [showForm, setShowForm] = useState(false);
  const [refreshPets, setRefreshPets] = useState(false);
  // --- ELIMINADO: const usuarioId = 1; ---

  // 🔔 Registrar notificación (ahora depende de la sesión)
  useEffect(() => {
    // Solo se ejecuta si la sesión existe y es un 'user'
    if (!session || session.rol !== 'user') {
      return;
    }
    
    const usuarioId = session.id; // <-- ID de usuario dinámico
    const hora = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const registrarInicioSesion = async () => {
      try {
        await fetch('/api/notificaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuarioId,
            mensaje: `Inicio de sesión a las ${hora}`,
          }),
        });
      } catch (err) {
        console.error('Error registrando inicio de sesión:', err);
      }
    };
    registrarInicioSesion();
  }, [session]); // Se ejecuta cuando la sesión carga

  // --- AÑADIDO: Estado de carga de sesión ---
  if (!session) {
    return <p>Cargando...</p>;
  }

  // --- AÑADIDO: Bloqueo para Administradores ---
  if (session.rol === 'admin' || session.rol === 'superadmin') {
    return (
      <div className={styles.pageContent}>
        <div className={styles.adminWarning}> {/* Estilo que añadiremos */}
          <h2>🚫 Acceso Restringido</h2>
          <p>
            Los administradores no pueden acceder al "Panel de Mascotas".
            <br />
            Tu rol es supervisar el sistema, no gestionar mascotas personales.
          </p>
        </div>
      </div>
    );
  }
  
  // --- CONTENIDO SOLO PARA ROL 'user' ---
  // Si llegamos aquí, es un 'user'. Usamos su ID de sesión.
  const usuarioId = session.id;

  return (
    <>
      {/* CONTENIDO PRINCIPAL */}
      <div className={styles.pageContent}>
        {/* Header con acciones */}
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Mi Dashboard</h2>
          <div className={styles.pageHeaderActions}>
            <Notificaciones
              userId={usuarioId} // <-- CORREGIDO: ID de sesión
              onNotificationChange={(count) => {
                console.debug('Notificaciones sin leer:', count);
              }}
            />
            <button className={styles.addButton} onClick={() => setShowForm(true)}>
              + Nueva Mascota
            </button>
          </div>
        </div>

        {/* Hero Banner (sin cambios) */}
        <section className={styles.heroBanner}>
          <div>
            <h1 className={styles.heroTitle}>Mi Dashboard PetCare</h1>
            <p className={styles.heroSubtitle}>
              Gestiona el cuidado integral de tus mascotas con IA
            </p>
          </div>
        </section>

        {/* Sección de Mascotas (sin cambios) */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Mis Mascotass</h3>
            <button
              className={styles.addButton}
              onClick={() => setShowForm(true)}
            >
              + Agregar Mascota
            </button>
          </div>
          <PetList refreshTrigger={refreshPets} />
        </section>
      </div>

      {/* Modal de formulario (sin cambios) */}
      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <PetForm
          onSuccess={() => {
            setShowForm(false);
            setRefreshPets((prev) => !prev);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </>
  );
}