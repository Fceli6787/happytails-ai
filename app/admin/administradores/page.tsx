// Archivo: app/admin/administradores/page.tsx
// (VERSIÓN COMPLETA CON CRUD: Conectado a la API)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminList.module.css'; 
import type { AdminUser } from '@/app/api/admin/administradores/route';
import Modal from '@/components/Modal';
import CreateAdminForm from '@/components/CreateAdminForm';

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  
  const router = useRouter();

  // LÓGICA DE DATOS
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/administradores');
      if (res.status === 403) {
        router.push('/admin/usuarios'); 
        return;
      }
      if (!res.ok) {
        throw new Error('No se pudo cargar la lista de administradores.');
      }
      const data: AdminUser[] = await res.json();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // MANEJADORES DE ACCIONES CRUD
  const handleCreate = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
    setApiError(null);
  };

  const handleEdit = (admin: AdminUser) => {
    // 🔒 Protección adicional: No permitir editar superadmin
    if (admin.rol === 'superadmin') {
      alert('❌ No se puede editar al superadmin');
      return;
    }
    
    setEditingAdmin(admin);
    setIsModalOpen(true);
    setApiError(null);
  };

  const handleDelete = async (adminId: number) => {
    setApiError(null);
    
    if (confirm('¿Estás seguro de que quieres eliminar a este administrador? Esta acción no se puede deshacer.')) {
      try {
        const res = await fetch('/api/admin/administradores', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: adminId }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al eliminar.');
        }
        
        alert('✅ Administrador eliminado exitosamente');
        fetchAdmins();
      } catch (err: any) {
        setApiError(err.message);
        alert(`❌ ${err.message}`);
      }
    }
  };

  // MANEJADORES DE MODAL
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
    fetchAdmins();
  };

  if (isLoading) return <p>Cargando administradores...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <h2>Gestión de Administradores</h2>
        <button className={styles.createButton} onClick={handleCreate}>
          ➕ Crear Nuevo Administrador
        </button>
      </div>

      {/* Mostramos errores de API */}
      {apiError && <p className={styles.error}>{apiError}</p>}

      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Cédula</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr 
              key={admin.id}
              className={admin.rol === 'superadmin' ? styles.superadminRow : ''}
            >
              <td>{admin.id}</td>
              <td>{admin.nombre_completo} {admin.apellidos}</td>
              <td>{admin.email}</td>
              <td>{admin.telefono || 'N/A'}</td>
              <td>{admin.cedula || 'N/A'}</td>
              <td>
                <span className={`${styles.rol} ${styles[admin.rol]}`}>
                  {admin.rol === 'superadmin' ? '👑 SUPERADMIN' : 
                   admin.rol === 'admin' ? '🛡️ ADMIN' : admin.rol}
                </span>
              </td>
              <td className={styles.actions}>
                {admin.rol === 'superadmin' ? (
                  <span className={styles.protected}>🔒 Protegido</span>
                ) : (
                  <>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleEdit(admin)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(admin.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para Crear/Editar */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <CreateAdminForm 
          onClose={handleModalClose} 
          onSuccess={handleModalSuccess}
          existingAdmin={editingAdmin}
        />
      </Modal>
    </div>
  );
}
