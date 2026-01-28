'use client';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/Notificaciones.module.css';

type Notificacion = {
  id: number;
  id_usuario: number;
  mensaje: string;
  leido: number;
  fecha: string;
  tipo?: 'info' | 'success' | 'warning' | 'error';
};

interface NotificacionesProps {
  userId: number;
  onNotificationChange?: (count: number) => void;
}

export default function Notificaciones({ userId, onNotificationChange }: NotificacionesProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch(`/api/notificaciones?userId=${userId}`);
      const data = await res.json();

      if (data.ok) {
        const notifs = Array.isArray(data.data) ? data.data : [];
        setNotificaciones(notifs);
        
        // Notificar cambios al padre
        const unreadCount = notifs.filter((n: Notificacion) => !n.leido).length;
        onNotificationChange?.(unreadCount);
      } else {
        console.error('Error en la respuesta:', data.error);
        setNotificaciones([]);
      }
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    
    // Polling cada 30 segundos para actualizar notificaciones
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cerrar al hacer scroll (móvil)
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && isMobile) setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen, isMobile]);

  // Prevenir scroll del body cuando dropdown está abierto (solo móvil)
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const marcarComoLeida = async (id: number) => {
    try {
      const res = await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, leido: true }),
      });

      if (res.ok) {
        setNotificaciones(prev =>
          prev.map(n => (n.id === id ? { ...n, leido: 1 } : n))
        );
        
        // Actualizar contador
        const unreadCount = notificaciones.filter(n => !n.leido && n.id !== id).length;
        onNotificationChange?.(unreadCount);
      }
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const unreadIds = notificaciones.filter(n => !n.leido).map(n => n.id);
      
      await Promise.all(
        unreadIds.map(id =>
          fetch('/api/notificaciones', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, leido: true }),
          })
        )
      );

      setNotificaciones(prev => prev.map(n => ({ ...n, leido: 1 })));
      onNotificationChange?.(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const eliminarNotificacion = async (id: number) => {
    try {
      const res = await fetch(`/api/notificaciones?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
        
        const remaining = notificaciones.filter(n => n.id !== id && !n.leido);
        onNotificationChange?.(remaining.length);
      }
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  const getNotificationIcon = (tipo?: string) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info':
      default: return 'ℹ️';
    }
  };

  const getTimeAgo = (fecha: string) => {
    const now = new Date();
    const notifDate = new Date(fecha);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return notifDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notificaciones.filter(n => !n.leido).length;

  // Renderizar el dropdown
  const renderDropdown = () => {
    const dropdownContent = (
      <div className={styles.dropdown} ref={dropdownRef}>
        <div className={styles.header}>
          <h3 className={styles.title}>Notificaciones</h3>
          {unreadCount > 0 && (
            <button
              className={styles.markAllRead}
              onClick={marcarTodasComoLeidas}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className={styles.empty}>
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {notificaciones.map((notif) => (
                <li
                  key={notif.id}
                  className={`${styles.item} ${!notif.leido ? styles.unread : ''}`}
                  onClick={() => !notif.leido && marcarComoLeida(notif.id)}
                >
                  <div className={styles.iconContainer}>
                    <span className={styles.icon}>
                      {getNotificationIcon(notif.tipo)}
                    </span>
                  </div>
                  
                  <div className={styles.itemContent}>
                    <p className={styles.message}>{notif.mensaje}</p>
                    <span className={styles.time}>{getTimeAgo(notif.fecha)}</span>
                  </div>

                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarNotificacion(notif.id);
                    }}
                    aria-label="Eliminar notificación"
                  >
                    ×
                  </button>

                  {!notif.leido && <span className={styles.unreadDot}></span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {notificaciones.length > 0 && (
          <div className={styles.footer}>
            <button
              className={styles.viewAll}
              onClick={() => {
                console.log('Ver todas las notificaciones');
                setIsOpen(false);
              }}
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    );

    // En móvil: usar portal con backdrop
    if (isMobile) {
      return createPortal(
        <>
          <div 
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          {dropdownContent}
        </>,
        document.body
      );
    }

    // En desktop: renderizar directamente (posición absoluta)
    return dropdownContent;
  };

  return (
    <div className={styles.notificationsWrapper} ref={wrapperRef}>
      {/* Botón de notificaciones */}
      <button
        ref={buttonRef}
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22a2 2 0 01-2-2h4a2 2 0 01-2 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && mounted && renderDropdown()}
    </div>
  );
}