// components/PetForm.tsx
'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styles from '@/styles/PetForm.module.css';
import dashboardStyles from '@/styles/Dashboard.module.css';

interface PetFormData {
  nombre: string;
  especie: string;         // select
  raza: string;            // texto libre opcional
  peso_kg?: number | '';
  edad_anios?: number | '';
  edad_meses?: number | '';
  fecha_nacimiento?: string;
  descripcion: string;
  imagen?: File | null;
}

interface PetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  initialData?: Partial<PetFormData & { id?: number; foto_url?: string }>;
}

export default function PetForm({ onSuccess, onCancel, editMode = false, initialData }: PetFormProps) {
  const [formData, setFormData] = useState<PetFormData>({
    nombre: initialData?.nombre || '',
    especie: initialData?.especie || '',
    raza: initialData?.raza || '',
    peso_kg: initialData?.peso_kg ?? '',
    edad_anios: initialData?.edad_anios ?? '',
    edad_meses: initialData?.edad_meses ?? '',
    fecha_nacimiento: initialData?.fecha_nacimiento || '',
    descripcion: initialData?.descripcion || '',
    imagen: null,
  });

  const [preview, setPreview] = useState<string | null>(initialData?.foto_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propietarioId, setPropietarioId] = useState<number | null>(null);

  // Si initialData cambia (abrir modal para editar), sincronizar
  useEffect(() => {
    setFormData({
      nombre: initialData?.nombre || '',
      especie: initialData?.especie || '',
      raza: initialData?.raza || '',
      peso_kg: initialData?.peso_kg ?? '',
      edad_anios: initialData?.edad_anios ?? '',
      edad_meses: initialData?.edad_meses ?? '',
      fecha_nacimiento: initialData?.fecha_nacimiento || '',
      descripcion: initialData?.descripcion || '',
      imagen: null,
    });
    setPreview(initialData?.foto_url || null);
  }, [initialData]);

  // Obtener propietario_id desde cookie ht_session
  useEffect(() => {
    const cookieString = document.cookie.split('; ').find(row => row.startsWith('ht_session='));
    if (cookieString) {
      const rawValue = cookieString.split('=')[1];
      try {
        const decodedString = atob(decodeURIComponent(rawValue));
        const decodedData = JSON.parse(decodedString);
        if (decodedData?.id) setPropietarioId(decodedData.id);
      } catch (err) {
        console.warn('No se pudo decodificar ht_session:', err);
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'peso_kg') {
      setFormData(prev => ({ ...prev, peso_kg: value === '' ? '' : parseFloat(value) }));
      return;
    }
    if (name === 'edad_anios' || name === 'edad_meses') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value) }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!propietarioId) {
      setError('No se pudo identificar el propietario (sesión inválida)');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append('propietario_id', propietarioId.toString());

      if (editMode && initialData?.id) payload.append('id', String(initialData.id));

      payload.append('nombre', formData.nombre);
      // especie (puede ser '')
      if (formData.especie) payload.append('especie', formData.especie);
      // raza (texto libre, opcional)
      if (formData.raza) payload.append('raza', formData.raza);
      if (formData.peso_kg !== '' && formData.peso_kg !== undefined) payload.append('peso_kg', String(formData.peso_kg));
      if (formData.edad_anios !== '' && formData.edad_anios !== undefined) payload.append('edad_anios', String(formData.edad_anios));
      if (formData.edad_meses !== '' && formData.edad_meses !== undefined) payload.append('edad_meses', String(formData.edad_meses));
      if (formData.fecha_nacimiento) payload.append('fecha_nacimiento', formData.fecha_nacimiento);
      if (formData.descripcion) payload.append('descripcion', formData.descripcion);
      if (formData.imagen) payload.append('imagen', formData.imagen);

      const response = await fetch('/api/mascotas', {
        method: editMode ? 'PUT' : 'POST',
        body: payload,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar la mascota');
      }

      // Opcional: puedes leer la mascota que devuelve el servidor:
      // const saved = await response.json();

      if (onSuccess) onSuccess();
      // Si no es edición, limpiar formulario
      if (!editMode) {
        setFormData({
          nombre: '',
          especie: '',
          raza: '',
          peso_kg: '',
          edad_anios: '',
          edad_meses: '',
          fecha_nacimiento: '',
          descripcion: '',
          imagen: null,
        });
        setPreview(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.modalOverlay} role="dialog" aria-modal="true">
      <form className={styles.petForm} onSubmit={handleSubmit}>
        <h3>{editMode ? 'Editar Mascota' : 'Agregar Nueva Mascota'}</h3>
        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.loading}>Guardando...</p>}

        <div className={styles.scrollContainer}>
          {/* Nombre */}
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          {/* Especie */}
          <div className={styles.formGroup}>
            <label htmlFor="especie">Especie</label>
            <select id="especie" name="especie" value={formData.especie} onChange={handleChange} required>
              <option value="">Seleccionar...</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="ave">Ave</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Raza (texto libre, opcional) */}
          <div className={styles.formGroup}>
            <label htmlFor="raza">Raza (opcional)</label>
            <input id="raza" name="raza" value={formData.raza} onChange={handleChange} />
          </div>

          {/* Peso */}
          <div className={styles.formGroup}>
            <label htmlFor="peso_kg">Peso (kg)</label>
            <input
              id="peso_kg"
              name="peso_kg"
              type="number"
              step="0.1"
              min="0"
              value={formData.peso_kg === '' ? '' : String(formData.peso_kg)}
              onChange={handleChange}
            />
          </div>

          {/* Edad años/meses */}
          <div className={styles.formGroupInline}>
            <div>
              <label htmlFor="edad_anios">Años</label>
              <input id="edad_anios" name="edad_anios" type="number" min="0" value={formData.edad_anios === '' ? '' : String(formData.edad_anios)} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="edad_meses">Meses</label>
              <input id="edad_meses" name="edad_meses" type="number" min="0" max="11" value={formData.edad_meses === '' ? '' : String(formData.edad_meses)} onChange={handleChange} />
            </div>
          </div>

          {/* Fecha de nacimiento */}
          <div className={styles.formGroup}>
            <label htmlFor="fecha_nacimiento">Fecha de nacimiento (opcional)</label>
            <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento || ''} onChange={handleChange} />
          </div>

          {/* Imagen (preview pequeño) */}
          <div className={styles.formGroup}>
            <label htmlFor="imagen">Imagen</label>
            <input id="imagen" name="imagen" type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="Vista previa" className={styles.previewImageSmall} style={{ maxWidth: 160 }} />}
          </div>

          {/* Descripción */}
          <div className={styles.formGroup}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Guardando...' : editMode ? 'Actualizar Mascota' : 'Guardar Mascota'}
          </button>
          {onCancel && (
            <button type="button" className={styles.cancelButton} onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
