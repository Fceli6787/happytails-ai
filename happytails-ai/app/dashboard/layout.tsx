import Link from 'next/link'; // Import Link component
import styles from '../../styles/Dashboard.module.css'; // <-- Crea los archivos de estilos
import Chatbot from '../../components/Chatbot';

// Este es un Server Component, no necesita 'use client'
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>🐾</span><h1>HappyTails</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLinkActive}>Panel de Mascotas</Link>
          <Link href="/dashboard/adopciones" className={styles.navLink}>Adopciones</Link>
          <Link href="/dashboard/recordatorios" className={styles.navLink}>Recordatorios</Link>
          <Link href="/dashboard/mi-perfil" className={styles.navLink}>Mi Perfil</Link>
        </nav>
        <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.logoutButton}>Cerrar Sesión</Link>
        </div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Chatbot mounted in the dashboard layout so it's visible on all dashboard pages */}
      <Chatbot />
    </div>
  )
}
