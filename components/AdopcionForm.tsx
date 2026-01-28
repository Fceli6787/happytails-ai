'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import styles from '@/styles/Adopciones.module.css';
import dashboardStyles from '@/styles/Dashboard.module.css';

interface AdopcionFormData {
  nombre: string;
  especie: string;
  raza?: string;
  edad_anios?: number | '';
  tamano?: string;
  ciudad?: string;
  pais?: string;
  refugio?: string;
  descripcion?: string;
  imagen?: File | null;
  estado?: string;
}

interface AdopcionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editMode?: boolean;
  initialData?: Partial<AdopcionFormData & { id?: number; foto_url?: string }>;
}

export default function AdopcionForm({
  onSuccess,
  onCancel,
  editMode = false,
  initialData,
}: AdopcionFormProps) {
  const [formData, setFormData] = useState<AdopcionFormData>({
    nombre: initialData?.nombre || '',
    especie: initialData?.especie || '',
    raza: initialData?.raza || '',
    edad_anios: initialData?.edad_anios ?? '',
    tamano: initialData?.tamano || '',
    ciudad: initialData?.ciudad || '',
    pais: initialData?.pais || '',
    refugio: initialData?.refugio || '',
    descripcion: initialData?.descripcion || '',
    imagen: null,
    estado: initialData?.estado || 'Disponible',
  });

  const [preview, setPreview] = useState<string | null>(initialData?.foto_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        especie: initialData.especie || '',
        raza: initialData.raza || '',
        edad_anios: initialData.edad_anios ?? '',
        tamano: initialData.tamano || '',
        ciudad: initialData.ciudad || '',
        pais: initialData.pais || '',
        refugio: initialData.refugio || '',
        descripcion: initialData.descripcion || '',
        imagen: null,
        estado: initialData.estado || 'Disponible',
      });
      setPreview(initialData.foto_url || null);
    }
  }, [initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'edad_anios') {
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
    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();

      if (editMode && initialData?.id) payload.append('id', String(initialData.id));

      payload.append('nombre', formData.nombre);
      if (formData.especie) payload.append('especie', formData.especie);
      if (formData.raza) payload.append('raza', formData.raza);
      if (formData.edad_anios !== '' && formData.edad_anios !== undefined)
        payload.append('edad_anios', String(formData.edad_anios));
      if (formData.tamano) payload.append('tamano', formData.tamano);
      if (formData.ciudad) payload.append('ciudad', formData.ciudad);
      if (formData.pais) payload.append('pais', formData.pais);
      if (formData.refugio) payload.append('refugio', formData.refugio);
      if (formData.descripcion) payload.append('descripcion', formData.descripcion);
      if (formData.estado) payload.append('estado', formData.estado);
      if (formData.imagen) payload.append('imagen', formData.imagen);

      const res = await fetch('/api/adopciones', {
        method: editMode ? 'PUT' : 'POST',
        body: payload,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar la adopción');
      }

      if (onSuccess) onSuccess();

      if (!editMode) {
        setFormData({
          nombre: '',
          especie: '',
          raza: '',
          edad_anios: '',
          tamano: '',
          ciudad: '',
          pais: '',
          refugio: '',
          descripcion: '',
          imagen: null,
          estado: 'Disponible',
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
      <form className={styles.adopcionForm} onSubmit={handleSubmit}>
        <h3>{editMode ? '✏️ Editar Adopción' : '➕ Registrar Nueva Adopción'}</h3>
        {error && <p className={styles.error}>{error}</p>}
        {loading && <p className={styles.loading}>Guardando...</p>}

        <div className={styles.scrollContainer}>
          {/* Nombre */}
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          {/* Especie */}
          <div className={styles.formGroup}>
            <label htmlFor="especie">Especie *</label>
            <select
              id="especie"
              name="especie"
              value={formData.especie}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="ave">Ave</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Raza */}
          <div className={styles.formGroup}>
            <label htmlFor="raza">Raza (opcional)</label>
            <input
              id="raza"
              name="raza"
              value={formData.raza}
              onChange={handleChange}
            />
          </div>

          {/* Edad */}
          <div className={styles.formGroup}>
            <label htmlFor="edad_anios">Edad (años)</label>
            <input
              id="edad_anios"
              name="edad_anios"
              type="number"
              min="0"
              value={formData.edad_anios === '' ? '' : String(formData.edad_anios)}
              onChange={handleChange}
            />
          </div>

          {/* Tamaño */}
          <div className={styles.formGroup}>
            <label htmlFor="tamano">Tamaño</label>
            <select
              id="tamano"
              name="tamano"
              value={formData.tamano}
              onChange={handleChange}
            >
              <option value="">Seleccionar...</option>
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>

          {/* Ubicación */}
          <div className={styles.formGroupInline}>
            <div>
              <label htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="pais">País</label>
              <input
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Refugio */}
          <div className={styles.formGroup}>
            <label htmlFor="refugio">Refugio</label>
            <input
              id="refugio"
              name="refugio"
              value={formData.refugio}
              onChange={handleChange}
              placeholder="Nombre del refugio o fundación"
            />
          </div>

          {/* Imagen */}
          <div className={styles.formGroup}>
            <label htmlFor="imagen">Imagen</label>
            <input
              id="imagen"
              name="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt="Vista previa"
                className={styles.previewImageSmall}
                style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }}
              />
            )}
          </div>

          {/* Descripción */}
          <div className={styles.formGroup}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Agrega detalles sobre la mascota..."
            />
          </div>

          {/* Estado */}
          <div className={styles.formGroup}>
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="Disponible">Disponible</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Adoptado">Adoptado</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-label={editMode ? 'Actualizar adopción' : 'Guardar adopción'}
          >
            {loading
              ? 'Guardando...'
              : editMode
              ? '✅ Actualizar Adopción'
              : '💾 Guardar Adopción'}
          </button>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={loading}
              aria-label="Cancelar"
            >
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}