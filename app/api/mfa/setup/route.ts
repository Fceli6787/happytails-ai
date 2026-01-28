import { NextResponse, NextRequest } from 'next/server';
import { authenticator } from 'otplib';
// --- IMPORTA TUS FUNCIONES REALES DESDE lib/db.ts ---
import { 
  getUserByFirebaseUID, // Asegúrate que este nombre coincida con tu exportación en lib/db.ts
  saveOrUpdateUserMfaConfig as saveOrUpdateUserMfaConfigInDb // Renombrado para claridad si es necesario
} from '@/lib/db'; // Ajusta la ruta si es necesario
import { encryptMfaSecret, mfaErrorResponse } from '@/lib/utils/mfa';

// --- INTERFACES ---
interface AuthenticatedUser {
  id_usuario: number;
  correo: string;
  user_uuid: string;
}

/**
 * Parsea el request para obtener el user_uuid y luego busca al usuario en la DB
 * utilizando la función importada de lib/db.ts.
 * @param request - El objeto NextRequest.
 * @returns Una promesa que resuelve al objeto del usuario autenticado o null.
 */
async function getAuthenticatedUserForSetup(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Se accede al cuerpo parseado que se guardó en el request
    // Esto asume que el handler POST ya parseó el cuerpo y lo adjuntó.
    // Para mayor robustez, esta función también podría parsear si es la primera en hacerlo.
    const body = (request as any).__parsedBody || await request.json();
    if (!(request as any).__parsedBody) (request as any).__parsedBody = body; // Guardar si se parseó aquí

    console.log("[MFA Setup API / getAuthenticatedUserForSetup] Cuerpo procesado para obtener user_uuid:", body);
    const { user_uuid } = body;

    if (!user_uuid || typeof user_uuid !== 'string') {
      console.warn("[MFA Setup API / getAuthenticatedUserForSetup] user_uuid no proporcionado o inválido en el cuerpo.");
      return null;
    }
    
    const user = await getUserByFirebaseUID(user_uuid); 
    
    if (user) {
      console.log(`[MFA Setup API / getAuthenticatedUserForSetup] Usuario encontrado via lib/db.ts para user_uuid: ${user_uuid}`);
      return user as AuthenticatedUser;
    } else {
      console.warn(`[MFA Setup API / getAuthenticatedUserForSetup] Usuario NO encontrado via lib/db.ts para user_uuid: ${user_uuid}`);
      return null;
    }
  } catch (error) {
    console.error("[MFA Setup API / getAuthenticatedUserForSetup] Error:", error);
    return null;
  }
}

function validateMfaSetupInput(user_uuid: any) {
  if (!user_uuid) {
    return { error: 'user_uuid es requerido en el cuerpo de la solicitud.', status: 400 };
  }
  if (typeof user_uuid !== 'string') {
    return { error: 'user_uuid debe ser un string.', status: 400 };
  }
  if (user_uuid.trim() === '') {
    return { error: 'user_uuid no puede estar vacío.', status: 400 };
  }
  return null;
}

// --- Handler del Endpoint POST ---
export async function POST(request: NextRequest) {
  console.log("[MFA Setup API / POST] Request recibido en /api/mfa/setup");
  try {
    const clonedRequest = request.clone();
    const bodyForLogging = await clonedRequest.json();
    console.log("[MFA Setup API / POST] Payload recibido del frontend:", bodyForLogging);
    (request as any).__parsedBody = bodyForLogging;
    // Validación de entrada
    const validation = validateMfaSetupInput(bodyForLogging.user_uuid);
    if (validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }
    const user = await getAuthenticatedUserForSetup(request);
    if (!user || !user.id_usuario || !user.correo) {
      return NextResponse.json({ error: 'No autenticado, ID de usuario o correo no encontrado. Asegúrate de enviar user_uuid en el cuerpo.' }, { status: 401 });
    }
    const secretInPlainText = authenticator.generateSecret();
    const encryptedSecretToStore = encryptMfaSecret(secretInPlainText);
    const savedSuccessfully = await saveOrUpdateUserMfaConfigInDb(user.id_usuario, encryptedSecretToStore);
    if (!savedSuccessfully) {
      return NextResponse.json({ error: 'No se pudo guardar la configuración MFA en la base de datos.' }, { status: 500 });
    }
    const appName = 'SOFIA AI Medical';
    const otpauthUrl = authenticator.keyuri(user.correo, appName, secretInPlainText);
    if (process.env.NODE_ENV === 'development') {
      (process.env as any).LAST_ENCRYPTED_SECRET_DEBUG = encryptedSecretToStore;
    }
    return NextResponse.json({ otpauthUrl });
  } catch (error: any) {
    const { errorMessage, statusCode } = mfaErrorResponse(error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
