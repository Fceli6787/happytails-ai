'use client';
import React, { useState } from 'react';

interface Adopcion {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  edad_anios?: number;
  tamano?: string;
  ciudad?: string;
  pais?: string;
  descripcion?: string;
  imagen?: string;
  estado?: string;
}

interface AdopcionCardProps {
  adopcion: Adopcion;
  onDelete: (id: number) => void;
  onEdit?: (id: number) => void;
}

const getStatusBadgeClass = (estado?: string) => {
  switch (estado) {
    case 'Disponible':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Adoptado':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'Pendiente':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

export default function AdopcionCard({ adopcion, onDelete, onEdit }: AdopcionCardProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full border border-slate-200">
      {/* Imagen y estado */}
      <div className="relative w-full" style={{ paddingTop: '66.67%' }}>
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={adopcion.imagen || 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop'}
          alt={`Foto de ${adopcion.nombre}`}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop';
          }}
        />
        
        {/* Badge de estado */}
        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1.5 rounded-full border ${getStatusBadgeClass(
            adopcion.estado
          )} backdrop-blur-sm shadow-sm`}
        >
          {adopcion.estado || 'Disponible'}
        </div>

        {/* Botones flotantes */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onEdit && (
            <button
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-slate-700 hover:bg-blue-500 hover:text-white shadow-md transition-all duration-200 hover:scale-110"
              onClick={() => onEdit(adopcion.id)}
              title="Editar"
              aria-label="Editar adopción"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-slate-700 hover:bg-red-500 hover:text-white shadow-md transition-all duration-200 hover:scale-110"
            onClick={() => onDelete(adopcion.id)}
            title="Eliminar"
            aria-label="Eliminar adopción"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Nombre y raza */}
        <div className="mb-3">
          <h4 className="text-xl font-bold text-slate-900 line-clamp-1">{adopcion.nombre}</h4>
          <p className="text-slate-500 text-sm mt-0.5">{adopcion.raza || 'Mestizo'}</p>
        </div>

        {/* Tags de información */}
        <div className="flex flex-wrap gap-2 mb-4">
          {adopcion.especie && (
            <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
              {adopcion.especie.charAt(0).toUpperCase() + adopcion.especie.slice(1)}
            </span>
          )}
          {adopcion.edad_anios !== undefined && adopcion.edad_anios !== null && (
            <span className="inline-flex items-center bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full border border-purple-200">
              {adopcion.edad_anios} {adopcion.edad_anios === 1 ? 'año' : 'años'}
            </span>
          )}
          {adopcion.tamano && (
            <span className="inline-flex items-center bg-orange-50 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full border border-orange-200">
              {adopcion.tamano}
            </span>
          )}
        </div>

        {/* Descripción con toggle */}
        {adopcion.descripcion && (
          <div className="mb-4 flex-grow">
            <p className="text-slate-600 text-sm leading-relaxed">
              {showMore
                ? adopcion.descripcion
                : adopcion.descripcion.length > 100
                ? `${adopcion.descripcion.slice(0, 100)}...`
                : adopcion.descripcion}
            </p>
            {adopcion.descripcion.length > 100 && (
              <button
                className="text-emerald-600 text-xs font-medium mt-2 hover:text-emerald-700 hover:underline transition-colors"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? '← Ver menos' : 'Ver más →'}
              </button>
            )}
          </div>
        )}

        {/* Footer - siempre al final */}
        <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center text-sm text-slate-600 min-w-0">
            <svg className="w-4 h-4 mr-1.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {adopcion.ciudad && adopcion.pais 
                ? `${adopcion.ciudad}, ${adopcion.pais}`
                : adopcion.ciudad || adopcion.pais || 'Sin ubicación'}
            </span>
          </div>
          <button className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all duration-200 active:scale-95">
            Adoptar
          </button>
        </div>
      </div>
    </div>
  );
}