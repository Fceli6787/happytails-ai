// Archivo: app/admin/page.tsx
// (Este archivo solo redirige)

import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  
  // Redirige automáticamente a la primera sección del panel
  redirect('/admin/usuarios');

  // Esta página en sí no necesita mostrar nada
  return null;
}