'use client';

import { useMemo, useState, ChangeEvent } from 'react';
import styles from '../../../styles/Dashboard.module.css';

type Tamano = 'Pequeño' | 'Mediano' | 'Grande';
type Especie = 'Perro' | 'Gato' | 'Ave' | 'Otro';

interface MascotaAdopcion {
  id: number;
  nombre: string;
  especie: Especie;
  raza: string;
  edadAnios: number;
  tamano: Tamano;
  ciudad: string;
  pais: string;
  disponibleMes: string;
  descripcion: string;
  cualidades: string[];
  refugio: string;
  matchScore: number;
}

const MASCOTAS: MascotaAdopcion[] = [
  {
    id: 1,
    nombre: 'Buddy',
    especie: 'Perro',
    raza: 'Labrador Mix',
    edadAnios: 2,
    tamano: 'Mediano',
    ciudad: 'Madrid',
    pais: 'España',
    disponibleMes: 'Dic 2024',
    descripcion:
      'Buddy es un perro muy cariñoso y energético que ama jugar y pasear. Perfecto para familias activas.',
    cualidades: ['Cariñoso', 'Activo', 'Sociable'],
    refugio: 'Refugio Esperanza',
    matchScore: 95,
  },
  {
    id: 2,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    edadAnios: 1,
    tamano: 'Pequeño',
    ciudad: 'Barcelona',
    pais: 'España',
    disponibleMes: 'Nov 2024',
    descripcion:
      'Luna es una gata muy inteligente y cariñosa. Le encanta la compañía y es muy juguetona.',
    cualidades: ['Inteligente', 'Cariñosa', 'Juguetona'],
    refugio: 'Refugio Felino',
    matchScore: 88,
  },
  {
    id: 3,
    nombre: 'Rocky',
    especie: 'Perro',
    raza: 'Pastor Alemán',
    edadAnios: 4,
    tamano: 'Grande',
    ciudad: 'Valencia',
    pais: 'España',
    disponibleMes: 'Oct 2024',
    descripcion:
      'Rocky es un perro muy leal y protector. Ideal para familias que buscan un compañero fiel.',
    cualidades: ['Leal', 'Protector', 'Fiel'],
    refugio: 'Centro Canino Valencia',
    matchScore: 92,
  },
];

function avatarDe(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || '?';
}

function edadEtiqueta(a: number) {
  return a === 1 ? '1 año' : `${a} años`;
}

export default function AdopcionesPage() {
  const [q, setQ] = useState('');
  const [especie, setEspecie] = useState<'Todas' | Especie>('Todas');
  const [edad, setEdad] = useState<'Todas' | '0-1' | '2-3' | '4+' >('Todas');
  const [tamano, setTamano] = useState<'Todos' | Tamano>('Todos');

  const filtrar = useMemo(() => {
    return MASCOTAS.filter((m) => {
      const qok =
        !q ||
        [m.nombre, m.raza, m.descripcion, m.refugio, m.ciudad, m.pais]
          .join(' ')
          .toLowerCase()
          .includes(q.toLowerCase());
      const eok = especie === 'Todas' || m.especie === especie;
      const tok = tamano === 'Todos' || m.tamano === tamano;
      const aok =
        edad === 'Todas'
          ? true
          : edad === '0-1'
          ? m.edadAnios <= 1
          : edad === '2-3'
          ? m.edadAnios >= 2 && m.edadAnios <= 3
          : m.edadAnios >= 4;
      return qok && eok && tok && aok;
    });
  }, [q, especie, edad, tamano]);

  const onChange =
    (set: (v: any) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set(e.target.value);

  return (
    <>
      <header className={styles.header}>
        <h2>Adopciones</h2>
      </header>

      <div className={styles.pageContent}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            Encuentra tu Compañero Perfecto
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
            Miles de mascotas esperan un hogar. Nuestro algoritmo de matching IA te ayuda a
            encontrar la mascota ideal para tu estilo de vida.
          </p>
        </div>

        <section
          className={styles.sectionCard}
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: '1.8fr 1fr 1fr 1fr auto',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative' }}>
            <input
              value={q}
              onChange={onChange(setQ)}
              placeholder="Nombre, raza, características…"
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                background: '#ffffff',
                fontSize: '.95rem',
              }}
            />
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: 18,
              }}
            >
              🔎
            </span>
          </div>

          <select
            value={especie}
            onChange={onChange(setEspecie)}
            style={{
              padding: '0.7rem 0.9rem',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#ffffff',
            }}
          >
            <option value="Todas">Especie: Todas</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave</option>
            <option value="Otro">Otro</option>
          </select>

          <select
            value={edad}
            onChange={onChange(setEdad)}
            style={{
              padding: '0.7rem 0.9rem',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#ffffff',
            }}
          >
            <option value="Todas">Edad: Todas</option>
            <option value="0-1">0–1</option>
            <option value="2-3">2–3</option>
            <option value="4+">4+</option>
          </select>

          <select
            value={tamano}
            onChange={onChange(setTamano)}
            style={{
              padding: '0.7rem 0.9rem',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#ffffff',
            }}
          >
            <option value="Todos">Tamaño: Todos</option>
            <option value="Pequeño">Pequeño</option>
            <option value="Mediano">Mediano</option>
            <option value="Grande">Grande</option>
          </select>

          <button
            type="button"
            className={styles.submitButton}
            style={{ padding: '0.7rem 1rem', borderRadius: 10, whiteSpace: 'nowrap' }}
            onClick={() => {}}
          >
            Filtrar
          </button>
        </section>

        <p style={{ color: '#64748b', margin: '0.9rem 0 0.75rem' }}>
          Mostrando {filtrar.length} mascotas disponibles
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtrar.map((m) => (
            <article key={m.id} className={styles.sectionCard} style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)',
                  padding: '1rem',
                  position: 'relative',
                  minHeight: 140,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: 26,
                    boxShadow: '0 6px 16px rgba(15,23,42,.12)',
                  }}
                >
                  {avatarDe(m.nombre)}
                </div>

                <div
                  title="Match"
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    background: 'rgba(255,255,255,0.95)',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: 999,
                    padding: '0.25rem 0.5rem',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ⭐ {m.matchScore}%
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>{m.nombre}</h3>
                <p style={{ margin: '0.25rem 0 0.5rem', color: '#64748b' }}>
                  {m.raza} • {edadEtiqueta(m.edadAnios)}
                </p>

                <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '.92rem' }}>
                  <span>📍 {m.ciudad}, {m.pais}</span>
                  <span>🗓 {m.disponibleMes}</span>
                </div>

                <p style={{ margin: '0.6rem 0', color: '#475569' }}>{m.descripcion}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  {m.cualidades.map((c) => (
                    <span key={c} className={styles.chip}>{c}</span>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏥 {m.refugio}
                  </span>
                  <button
                    className={styles.submitButton}
                    style={{ padding: '0.55rem 0.9rem', borderRadius: 10 }}
                    onClick={() => alert(`Contactar por ${m.nombre}`)}
                  >
                    Contactar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
