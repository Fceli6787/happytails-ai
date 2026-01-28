'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './AdminUsuarios.module.css'; 
import Modal from '@/components/Modal';
import InspectUserModal from '@/components/InspectUserModal';

interface AdminUserReport {
  id: number;
  username: string;
  nombre_completo: string;
  apellidos: string;
  email: string;
  rol: 'user' | 'admin' | 'superadmin';
  total_mascotas: number;
  total_adopciones: number;
  fecha_registro: string;
}

interface FormData {
  username: string;
  nombre_completo: string;
  apellidos: string;
  email: string;
  rol: 'user' | 'admin';
  contrasena: string;
}

export default function AdminUsuariosPage() {
  const [report, setReport] = useState<AdminUserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modal de inspección
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Estados para modal de crear/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserReport | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    nombre_completo: '',
    apellidos: '',
    email: '',
    rol: 'user',
    contrasena: '',
  });

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cargar los datos');
      }
      const data = await res.json();
      setReport(data.usuarios || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Manejadores del modal de inspección
  const handleInspect = (userId: number) => {
    setSelectedUserId(userId);
    setIsInspectModalOpen(true);
  };

  const handleCloseInspect = () => {
    setIsInspectModalOpen(false);
    setSelectedUserId(null);
  };

  // Manejadores de crear/editar
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      nombre_completo: '',
      apellidos: '',
      email: '',
      rol: 'user',
      contrasena: '',
    });
    setShowFormModal(true);
  };

  const handleEdit = (user: AdminUserReport) => {
    if (user.rol === 'superadmin') {
      alert('❌ No se puede editar al superadmin');
      return;
    }

    setEditingUser(user);
    setFormData({
      username: user.username,
      nombre_completo: user.nombre_completo,
      apellidos: user.apellidos || '',
      email: user.email,
      rol: user.rol as 'user' | 'admin',
      contrasena: '',
    });
    setShowFormModal(true);
  };

  const handleDelete = async (user: AdminUserReport) => {
    if (user.rol === 'superadmin') {
      alert('❌ No se puede eliminar al superadmin');
      return;
    }

    if (!confirm(`¿Seguro que deseas eliminar a ${user.nombre_completo}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }

      alert('✅ Usuario eliminado exitosamente');
      fetchAdminData();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const body = editingUser
        ? { ...formData, id: editingUser.id }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      alert(editingUser ? '✅ Usuario actualizado' : '✅ Usuario creado');
      setShowFormModal(false);
      setEditingUser(null);
      fetchAdminData();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'superadmin':
        return <span className={`${styles.rol} ${styles.superadmin}`}>👑 SUPERADMIN</span>;
      case 'admin':
        return <span className={`${styles.rol} ${styles.admin}`}>🛡️ ADMIN</span>;
      default:
        return <span className={`${styles.rol} ${styles.user}`}>👤 Usuario</span>;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>❌ {error}</p>
        <button onClick={fetchAdminData}>Reintentar</button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <div className={styles.header}>
          <div>
            <h2>Gestión de Usuarios</h2>
            <span>Total: {report.length} usuarios</span>
          </div>
          <button className={styles.createButton} onClick={handleCreate}>
            ➕ Nuevo Usuario
          </button>
        </div>

        {/* Estadísticas */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>{report.length}</h3>
            <p>Total Usuarios</p>
          </div>
          <div className={styles.statCard}>
            <h3>{report.filter(u => u.rol === 'admin' || u.rol === 'superadmin').length}</h3>
            <p>Administradores</p>
          </div>
          <div className={styles.statCard}>
            <h3>{report.filter(u => u.rol === 'user').length}</h3>
            <p>Usuarios</p>
          </div>
        </div>

        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Mascotas</th>
              <th>Adopciones</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {report.map((user) => (
              <tr key={user.id} className={user.rol === 'superadmin' ? styles.superadminRow : ''}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {user.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{user.nombre_completo}</strong>
                      <small>@{user.username}</small>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{getRolBadge(user.rol)}</td>
                <td className={styles.centered}>{user.total_mascotas}</td>
                <td className={styles.centered}>{user.total_adopciones}</td>
                <td>{new Date(user.fecha_registro).toLocaleDateString('es-ES')}</td>
                <td className={styles.actions}>
                  {user.rol === 'superadmin' ? (
                    <span className={styles.protected}>🔒 Protegido</span>
                  ) : (
                    <>
                      <button 
                        className={styles.inspectButton}
                        onClick={() => handleInspect(user.id)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className={styles.editButton}
                        onClick={() => handleEdit(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDelete(user)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Inspección */}
      <Modal open={isInspectModalOpen} onClose={handleCloseInspect}>
        <InspectUserModal 
          key={selectedUserId} 
          userId={selectedUserId as number} 
          onClose={handleCloseInspect} 
        />
      </Modal>

      {/* Modal de Crear/Editar */}
      {showFormModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  placeholder="ej: juanperez"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  required
                  placeholder="ej: Juan Pérez"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Apellidos</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="ej: García López"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="ej: juan@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Contraseña {editingUser && '(dejar vacío para no cambiar)'}</label>
                <input
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'user' | 'admin' })}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowFormModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
