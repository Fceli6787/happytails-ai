'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          router.push('/dashboard');
        } else {
          setError(data.error || 'Error en autenticación');
        }
      })
      .catch(() => setError('Error de red'));
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>🐾</div>
        <h1 className={styles.title}>HappyTails AI</h1>
        <p className={styles.subtitle}>Bienvenido de nuevo. Gestiona a tus mascotas.</p>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email (admin@happytails.ai)" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña (password123)" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}