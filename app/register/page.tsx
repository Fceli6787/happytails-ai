'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import loginStyles from '@/styles/Login.module.css';
import registerStyles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    apellidos: '',
    username: '',
    telefono: '',
    tipo_documento: '',
    cedula: '',
    email: '',
    contrasena: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: '',
      });
    }
  };

  // Validaciones en tiempo real
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nombre_completo':
      case 'apellidos':
        if (value.length < 2) return 'Debe tener al menos 2 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'Solo se permiten letras';
        return '';
      
      case 'username':
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (/\s/.test(value)) return 'No se permiten espacios';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y guion bajo';
        return '';
      
      case 'telefono':
        if (!/^\d{7,10}$/.test(value)) return 'Debe contener entre 7 y 10 números';
        return '';
      
      case 'cedula':
        if (!/^\d{5,15}$/.test(value)) return 'Solo números (5-15 dígitos)';
        return '';
      
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return '';
      
      case 'contrasena':
        if (value.length < 8) return 'Mínimo 8 caracteres';
        if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una minúscula';
        if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una mayúscula';
        if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número';
        return '';
      
      default:
        return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setFieldErrors({
        ...fieldErrors,
        [name]: error,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    // Validar todos los campos
    const errors: {[key: string]: string} = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'tipo_documento') {
        const value = formData[key as keyof typeof formData];
        const fieldError = validateField(key, value);
        if (fieldError) errors[key] = fieldError;
      }
    });

    // Si hay errores, no enviar
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      setIsLoading(false);
      return;
    }

    // Validaciones adicionales
    if (formData.email.endsWith('@administrador.com') || formData.email.endsWith('@Sadministrador.com')) {
      setError('Este correo no está permitido para el registro de usuarios.');
      setIsLoading(false);
      return;
    }

    if (!formData.tipo_documento) {
      setError('Por favor selecciona un tipo de documento.');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar el usuario.');
      }

      setSuccess('¡Registro exitoso! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={loginStyles.container}>
      <div className={registerStyles.registerBox}>
        <div className={registerStyles.header}>
          <div className={loginStyles.logo}>🐾</div>
          <h1 className={loginStyles.title}>Crear una Cuenta</h1>
          <p className={loginStyles.subtitle}>Únete a HappyTails AI</p>
        </div>
        
        <form onSubmit={handleSubmit} className={registerStyles.form}>
          {/* Fila 1: Nombres y Apellidos */}
          <div className={registerStyles.formRow}>
            <div className={registerStyles.inputGroup}>
              <label htmlFor="nombre_completo">
                Nombres <span className={registerStyles.required}>*</span>
              </label>
              <input
                type="text"
                name="nombre_completo"
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={fieldErrors.nombre_completo ? registerStyles.inputError : ''}
                required
              />
              {fieldErrors.nombre_completo && (
                <span className={registerStyles.fieldError}>{fieldErrors.nombre_completo}</span>
              )}
            </div>
            
            <div className={registerStyles.inputGroup}>
              <label htmlFor="apellidos">
                Apellidos <span className={registerStyles.required}>*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                id="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={fieldErrors.apellidos ? registerStyles.inputError : ''}
                required
              />
              {fieldErrors.apellidos && (
                <span className={registerStyles.fieldError}>{fieldErrors.apellidos}</span>
              )}
            </div>
          </div>
          
          {/* Fila 2: Username y Teléfono */}
          <div className={registerStyles.formRow}>
            <div className={registerStyles.inputGroup}>
              <label htmlFor="username">
                Nombre de Usuario <span className={registerStyles.required}>*</span>
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={fieldErrors.username ? registerStyles.inputError : ''}
                placeholder="sin espacios"
                required
              />
              {fieldErrors.username && (
                <span className={registerStyles.fieldError}>{fieldErrors.username}</span>
              )}
            </div>
            
            <div className={registerStyles.inputGroup}>
              <label htmlFor="telefono">
                Teléfono <span className={registerStyles.required}>*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={fieldErrors.telefono ? registerStyles.inputError : ''}
                placeholder="3001234567"
                required
              />
              {fieldErrors.telefono && (
                <span className={registerStyles.fieldError}>{fieldErrors.telefono}</span>
              )}
            </div>
          </div>
          
          {/* Fila 3: Tipo de Documento y Número */}
          <div className={registerStyles.formRow}>
            <div className={registerStyles.inputGroup}>
              <label htmlFor="tipo_documento">
                Tipo de Documento <span className={registerStyles.required}>*</span>
              </label>
              <select
                name="tipo_documento"
                id="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                disabled={isLoading}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="C.C">C.C (Cédula de Ciudadanía)</option>
                <option value="T.I">T.I (Tarjeta de Identidad)</option>
                <option value="C.E">C.E (Cédula de Extranjería)</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            
            <div className={registerStyles.inputGroup}>
              <label htmlFor="cedula">
                Número de Documento <span className={registerStyles.required}>*</span>
              </label>
              <input
                type="text"
                name="cedula"
                id="cedula"
                value={formData.cedula}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={fieldErrors.cedula ? registerStyles.inputError : ''}
                placeholder="Solo números"
                required
              />
              {fieldErrors.cedula && (
                <span className={registerStyles.fieldError}>{fieldErrors.cedula}</span>
              )}
            </div>
          </div>
          
          {/* Fila 4: Email */}
          <div className={registerStyles.inputGroup}>
            <label htmlFor="email">
              Correo Electrónico <span className={registerStyles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={fieldErrors.email ? registerStyles.inputError : ''}
              placeholder="tucorreo@ejemplo.com"
              required
            />
            {fieldErrors.email && (
              <span className={registerStyles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          {/* Fila 5: Contraseña */}
          <div className={registerStyles.inputGroup}>
            <label htmlFor="contrasena">
              Contraseña <span className={registerStyles.required}>*</span>
            </label>
            <input
              type="password"
              name="contrasena"
              id="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={fieldErrors.contrasena ? registerStyles.inputError : ''}
              placeholder="Mín. 8 caracteres"
              required
            />
            {fieldErrors.contrasena && (
              <span className={registerStyles.fieldError}>{fieldErrors.contrasena}</span>
            )}
            <small className={registerStyles.passwordHint}>
              Debe contener mayúsculas, minúsculas y números
            </small>
          </div>

          {error && <div className={loginStyles.error}>{error}</div>}
          {success && <div className={loginStyles.successMessage}>{success}</div>}

          {/* Botones */}
          <div className={registerStyles.buttonGroup}>
            <Link href="/" className={registerStyles.cancelButton}>
              Volver a Inicio
            </Link>
            <button
              type="submit"
              className={registerStyles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
