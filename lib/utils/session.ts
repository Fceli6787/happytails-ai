// Archivo: lib/utils/session.ts
// (CORREGIDO: Añadida la lectura de 'nombre' y 'apellidos')
import { NextRequest } from 'next/server';

export interface Session {
  id: number;
  email: string;
  rol: 'user' | 'admin' | 'superadmin';
  nombre: string;     // <-- AÑADIDO
  apellidos: string; // <-- AÑADIDO
}

/**
 * [USO: SÓLO SERVIDOR]
 * Parsea la cookie 'ht_session' desde un request de API (NextRequest).
 */
export function parseSessionCookie(req: NextRequest): Session | null {
  const cookie = req.cookies.get('ht_session');
  if (!cookie) {
    return null;
  }
  
  try {
    let base64 = cookie.value.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload) as Session;
  } catch (error) {
    console.error('Error al parsear la cookie de sesión (servidor):', error);
    return null;
  }
}

/**
 * [USO: SÓLO CLIENTE]
 * Parsea la cookie 'ht_session' desde 'document.cookie' (navegador).
 */
export function getSessionClientSide(): Session | null {
  try {
    const cookieName = 'ht_session=';
    const allCookies = document.cookie;
    const cookieValue = allCookies
      .split('; ')
      .find((row) => row.startsWith(cookieName))
      ?.split('=')[1];

    if (!cookieValue) {
      return null;
    }

    let base64 = cookieValue.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload) as Session;

  } catch (error) {
    console.error('Error al parsear la cookie de sesión (cliente):', error);
    return null;
  }
}