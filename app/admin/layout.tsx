// Archivo: app/admin/layout.tsx
// (CORREGIDO: Muestra el nombre formateado en lugar del email)
'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './AdminLayout.module.css';
import { getSessionClientSide } from '@/lib/utils/session'; 
// --- CAMBIO: Importamos la interfaz actualizada ---
import type { Session } from '@/lib/utils/session';

// (La interfaz local de Session se ha eliminado)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = getSessionClientSide(); 
    if (!s || (s.rol !== 'admin' && s.rol !== 'superadmin')) {
      router.push('/');
    } else {
      setSession(s);
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = 'ht_session=; path=/; max-age=-1';
    router.push('/');
  };

  // --- LÓGICA PARA FORMATEAR EL NOMBRE ---
  const getDisplayName = () => {
    if (!session) return '';
    if (session.rol === 'superadmin') {
      return 'Super Admin';
    }
    // Formatear nombre: "Carlos Murcia (admin)"
    const firstName = (session.nombre || '').split(' ')[0];
    const lastName = (session.apellidos || '').split(' ')[0];
    return `${firstName} ${lastName} (admin)`;
  };
  // ----------------------------------------

  if (isLoading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>
          Administrador <span>HappyTails</span>
        </div>
        
        <nav className={styles.nav}>
          <Link 
            href="/admin/usuarios"
            className={pathname === '/admin/usuarios' ? styles.active : ''}
          >
            Usuarios registrados
          </Link>
          <Link 
            href="/admin/adopciones"
            className={pathname === '/admin/adopciones' ? styles.active : ''}
          >
            Sistema de Adopciones
          </Link>
          
          {session?.rol === 'superadmin' && (
            <Link 
              href="/admin/administradores"
              className={pathname === '/admin/administradores' ? styles.active : ''}
            >
              Administradores
            </Link>
          )}

          <Link 
            href="/dashboard/adopciones"
            target="_blank"
            className={styles.viewSiteButton}
          >
            Visualizar Página
          </Link>
        </nav>

        <div className={styles.userActions}>
          {/* --- CAMBIO: Usamos el nombre formateado --- */}
          <span className={styles.welcome}>
            {getDisplayName()}
          </span>
          {/* ------------------------------------------- */}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Cerrar sesión
          </button>
        </div>
      </header>
      
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}