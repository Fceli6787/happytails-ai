"use client";

import { useEffect, useState } from "react";
import styles from "../../../styles/Dashboard.module.css";

interface User {
  id?: number;
  nombre_completo?: string;
  email?: string;
}

export default function MiPerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/me");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al obtener usuario");
        }
        const data: User = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err?.message || "Error al obtener usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <header className={styles.header}>
        <h2>Mi Perfil</h2>
      </header>

      <div className={styles.pageContent}>
        <section className={styles.heroBanner}>
          <h1 className={styles.heroTitle}>Gestiona tu cuenta</h1>
          <p className={styles.heroSubtitle}>
            Administra tu información personal y configura tu perfil.
          </p>
        </section>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {loading && <p className={styles.loadingMessage}>Cargando perfil...</p>}

        <section className={styles.twoCol} style={{ marginTop: "1rem" }}>
          {/* Información principal */}
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3>Información de la cuenta</h3>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <p style={{ color: "#475569", margin: 0 }}>
                <strong>Nombre completo:</strong>{" "}
                {user?.nombre_completo ?? "—"}
              </p>
              <p style={{ color: "#475569", margin: 0 }}>
                <strong>Email:</strong> {user?.email ?? "—"}
              </p>
              <p style={{ color: "#475569", margin: 0 }}>
                <strong>ID:</strong> {user?.id ?? "—"}
              </p>
            </div>
          </section>

          {/* Acciones rápidas */}
          <aside className={styles.sideCol}>
            <section className={styles.sectionCard}>
              <h3>Acciones</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <button
                  className={styles.submitButton}
                  type="button"
                  onClick={() => alert("Abrir modal de edición de perfil")}
                >
                  Editar perfil
                </button>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={() => alert("Cerrar sesión")}
                >
                  Cerrar sesión
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </>
  );
}
