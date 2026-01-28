// Archivo: app/page.tsx
// (MODIFICADO para manejar MFA y redirección por ROL)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // <-- AÑADIDO: Para el enlace de registro
import styles from '../styles/Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- Estados nuevos ---
  const [token, setToken] = useState(''); // Para el código MFA de 6 dígitos
  const [isMfaStep, setIsMfaStep] = useState(false); // Para saber si mostrar el input de MFA
  const [userId, setUserId] = useState<number | null>(null); // Para guardar el ID entre pasos
  const [isLoading, setIsLoading] = useState(false);
  // --------------------

  const [error, setError] = useState('');
  const router = useRouter();

  /**
   * Maneja la redirección final basada en el rol.
   */
  const handleRoleRedirect = (rol: string) => {
    if (rol === 'admin' || rol === 'superadmin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  /**
   * Paso 1: Maneja el login inicial (email y contraseña)
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Captura errores de la API (ej. 'Credenciales inválidas')
        const errorMsg = data.error || 'Error en autenticación';
        if (errorMsg.includes('base de datos') || errorMsg.includes('MySQL') || errorMsg.includes('XAMPP')) {
          setError(`🔴 ${errorMsg}`);
        } else {
          setError(errorMsg);
        }
        throw new Error(errorMsg); // Detiene la ejecución
      }

      // --- Login OK ---

      if (data.mfaRequired) {
        // MFA REQUERIDO: Preparamos para el segundo paso
        setIsMfaStep(true);
        setUserId(data.userId); // Guardamos el ID para el siguiente request
      } else if (data.ok) {
        // LOGIN DIRECTO (Sin MFA): Redirigimos según el rol
        handleRoleRedirect(data.rol);
      } else {
        setError('Respuesta inesperada del servidor.');
      }

    } catch (err) {
      // Errores de red o los lanzados arriba
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Paso 2: Maneja la verificación del código MFA (token)
   */
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!userId) {
      setError('Error: No se encontró el ID de usuario. Refresca la página.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/mfa/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, token: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en la verificación MFA.');
      }

      // VERIFICACIÓN MFA EXITOSA: Redirigimos según el rol
      handleRoleRedirect(data.rol);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>🐾</div>
        <h1 className={styles.title}>HappyTails AI</h1>
        
        {/* El formulario ahora es dinámico */}
        <form onSubmit={isMfaStep ? handleMfaVerify : handleLogin}>
          
          {!isMfaStep ? (
            // --- PASO 1: Email y Contraseña ---
            <>
              <p className={styles.subtitle}>Bienvenido de nuevo. Gestiona a tus mascotas.</p>
              <input 
                type="email" 
                placeholder="Email (admin@happytails.ai)" 
                className={styles.input} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
              />
              <input 
                type="password" 
                placeholder="Contraseña (password123)" 
                className={styles.input} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </>
          ) : (
            // --- PASO 2: Código MFA ---
            <>
              <p className={styles.subtitle}>Ingresa tu código de 6 dígitos</p>
              <input 
                type="text" 
                placeholder="Código de autenticación" 
                className={styles.input} 
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                disabled={isLoading}
                maxLength={6}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.button} disabled={isLoading}>
                {isLoading ? 'Verificando...' : 'Verificar'}
              </button>
            </>
          )}
        </form>

        {/* Enlace a la página de Registro que creamos */}
        {!isMfaStep && (
          <div className={styles.footer}>
            <p>
              ¿No tienes una cuenta?{' '}
              <Link href="/register">Regístrate</Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}