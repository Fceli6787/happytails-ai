// Archivo: app/dashboard/DashboardContext.tsx
'use client';

import { createContext } from 'react';
// Importamos la interfaz de sesión que ya definimos
import type { Session } from '@/lib/utils/session';

export interface DashboardContextProps {
  session: Session | null;
  // En el futuro, podríamos añadir más cosas aquí
}

// Creamos el contexto
export const DashboardContext = createContext<DashboardContextProps>({
  session: null,
});