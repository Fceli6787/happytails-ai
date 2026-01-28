// Archivo: app/dashboard/layout.tsx
// (MODIFICADO: Lee la sesión, filtra la barra lateral y provee el contexto)
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from '../../styles/Dashboard.module.css';
import Chatbot from '../../components/Chatbot';

// --- AÑADIDO: Importaciones para la sesión y el contexto ---
import { getSessionClientSide } from '@/lib/utils/session';
import type { Session } from '@/lib/utils/session';
import { DashboardContext } from './DashboardContext';
// -----------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // <-- AÑADIDO: Para el logout

  // --- AÑADIDO: Lógica de Sesión y Rol ---
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Leemos la cookie al cargar el layout en el cliente
    const s = getSessionClientSide();
    setSession(s);

    // Si no hay sesión (ej. cookie expiró), redirigir al login
    if (!s) {
      router.push('/');
    }
  }, [router]); // Se ejecuta una vez al montar

  // ----------------------------------------

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    if (sidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // --- AÑADIDO: Botón de Cerrar Sesión (función corregida) ---
  const handleLogout = () => {
    document.cookie = 'ht_session=; path=/; max-age=-1'; // Borra la cookie
    router.push('/'); // Redirige al login
  };
  // -------------------------------------

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // --- MODIFICADO: Links dinámicos basados en el rol ---
  const allNavLinks = [
    { href: '/dashboard', label: 'Panel de Mascotas', icon: '🏠', roles: ['user'] },
    { href: '/dashboard/adopciones', label: 'Adopciones', icon: '🏡', roles: ['user', 'admin', 'superadmin'] },
    { href: '/dashboard/recordatorios', label: 'Recordatorios', icon: '🔔', roles: ['user'] },
    { href: '/dashboard/mi-perfil', label: 'Mi Perfil', icon: '👤', roles: ['user', 'admin', 'superadmin'] },
  ];

  // Filtramos los links que el rol actual puede ver
  // (Los admins ya no verán 'Panel de Mascotas' ni 'Recordatorios')
  const navLinks = useMemo(() => {
    if (!session?.rol) return []; // No mostrar nada si la sesión está cargando
    return allNavLinks.filter(link => link.roles.includes(session.rol));
  }, [session?.rol]); // Se recalcula solo si el rol cambia
  // ---------------------------------------------------

  return (
    // --- AÑADIDO: Proveedor de Contexto ---
    // Ahora, todos los 'children' (páginas) pueden acceder a la 'session'
    <DashboardContext.Provider value={{ session }}>
      <div className={styles.container}>
        <div
          className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.visible : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            <span className={styles.logo}>🐾</span>
            <h1>HappyTails</h1>
          </div>

          <nav className={styles.nav}>
            {/* El menú ahora se renderiza desde la lista filtrada */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(link.href) ? styles.navLinkActive : styles.navLink}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ marginRight: '0.5rem', fontSize: '1.1rem' }}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            {/* --- MODIFICADO: Botón de Logout --- */}
            <button onClick={handleLogout} className={styles.logoutButton}>
              🚪 Cerrar Sesión
            </button>
            {/* ----------------------------------- */}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={styles.mainContent}>
          <div className={styles.mobileHeader}>
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              <span style={{ fontSize: '24px' }}>☰</span>
            </button>
            <div className={styles.mobileHeaderTitle}>
              <span className={styles.logo}>🐾</span>
              <span>HappyTails</span>
            </div>
          </div>
          
          {/* Si la sesión está cargando, no mostramos nada */}
          {session ? children : <p>Cargando...</p>}
        </main>

        {/* El Chatbot solo debe aparecer para los usuarios normales */}
        {session?.rol === 'user' && <Chatbot />}
      </div>
    </DashboardContext.Provider>
  );
}