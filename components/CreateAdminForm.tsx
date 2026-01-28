// Archivo: components/CreateAdminForm.tsx
// (MODIFICADO para usar nuevos estilos light-theme)
'use client';

import { useState, useEffect } from 'react';
import styles from './CreateAdminForm.module.css'; // Usaremos solo este archivo de estilos
import type { AdminUser } from '@/app/api/admin/administradores/route';

interface CreateAdminFormProps {
  onClose: () => void;
  onSuccess: () => void;
  existingAdmin: AdminUser | null;
}

export default function CreateAdminForm({ onClose, onSuccess, existingAdmin }: CreateAdminFormProps) {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    apellidos: '',
    email: '',
    telefono: '',
    cedula: '',
    contrasena: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!existingAdmin;

  useEffect(() => {
    if (isEditMode && existingAdmin) {
      setFormData({
        nombre_completo: existingAdmin.nombre_completo,
        apellidos: existingAdmin.apellidos || '',
        email: existingAdmin.email,
        telefono: existingAdmin.telefono || '',
        cedula: existingAdmin.cedula || '',
        contrasena: '', // Contraseña vacía en modo edición
      });
    }
  }, [isEditMode, existingAdmin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!isEditMode && !formData.contrasena) {
      setError('La contraseña es obligatoria al crear un admin.');
      setIsLoading(false);
      return;
    }
    if (formData.contrasena && formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
    if (!formData.email.endsWith('@administrador.com')) {
      setError('El email debe terminar en @administrador.com');
      setIsLoading(false);
      return;
    }

    const adminData = {
      ...formData,
      id: isEditMode ? existingAdmin.id : undefined,
      contrasena: formData.contrasena || undefined,
    };

    try {
      const res = await fetch('/api/admin/administradores', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar.');

      setSuccess(isEditMode ? '¡Admin actualizado!' : '¡Admin creado!');
      setTimeout(onSuccess, 1500);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {isEditMode ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
      </h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre_completo">Nombre(s)</label>
            <input type="text" name="nombre_completo" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} disabled={isLoading} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="apellidos">Apellidos</label>
            <input type="text" name="apellidos" id="apellidos" value={formData.apellidos} onChange={handleChange} disabled={isLoading} required />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="cedula">Cédula</label>
            <input type="text" name="cedula" id="cedula" value={formData.cedula} onChange={handleChange} disabled={isLoading} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="telefono">Teléfono</label>
            <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} disabled={isLoading} required />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email (ej: supervisor@administrador.com)</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} disabled={isLoading} required />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="contrasena">
            {isEditMode ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña (mín. 6 caracteres)'}
          </label>
          <input type="password" name="contrasena" id="contrasena" value={formData.contrasena} onChange={handleChange} disabled={isLoading} />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <div className={styles.buttonGroup}>
          <button type="button" onClick={onClose} className={styles.secondaryButton} disabled={isLoading}>
            Cancelar
          </button>
          <button type="submit" className={styles.primaryButton} disabled={isLoading}>
            {isLoading ? 'Guardando...' : (isEditMode ? 'Actualizar Admin' : 'Crear Admin')}
          </button>
        </div>
      </form>
    </div>
  );
}