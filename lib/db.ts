import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // Usar 3307 por defecto (tu configuración actual). Si prefieres cambiarlo, define DB_PORT en .env.local
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface UserFromDb {
  id_usuario: number;
  correo: string;
  user_uuid: string;
}

interface MfaConfigFromDb {
  id_usuario: number;
  mfa_secret: string;
  mfa_enabled: number;
  mfa_verified_at?: string;
}

interface RecordatorioFromDb {
  id: number;
  mascota_id: number;
  tipo_recordatorio_id: number;
  fecha_vencimiento: string;
  estado: string;
  notas?: string;
}

// 🔐 Funciones de usuarios y MFA (ya existentes)
export async function getUserByFirebaseUID(user_uuid: string): Promise<UserFromDb | null> {
  try {
    const [rows] = await pool.query('SELECT id AS id_usuario, email AS correo, user_uuid FROM usuarios WHERE user_uuid = ?', [user_uuid]);
    const users = rows as UserFromDb[];
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error in getUserByFirebaseUID:', error);
    throw error;
  }
}

export async function getUserMfaConfig(id_usuario: number): Promise<MfaConfigFromDb | null> {
  try {
    const [rows] = await pool.query('SELECT id_usuario, mfa_secret, mfa_enabled, mfa_verified_at FROM usuarios_mfa_config WHERE id_usuario = ?', [id_usuario]);
    const mfaConfigs = rows as MfaConfigFromDb[];
    return mfaConfigs.length > 0 ? mfaConfigs[0] : null;
  } catch (error) {
    console.error('Error in getUserMfaConfig:', error);
    throw error;
  }
}

export async function saveOrUpdateUserMfaConfig(id_usuario: number, mfa_secret: string): Promise<boolean> {
  try {
    const [result] = await pool.execute(
      `INSERT INTO usuarios_mfa_config (id_usuario, mfa_secret, mfa_enabled)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE mfa_secret = ?, mfa_enabled = 0`,
      [id_usuario, mfa_secret, mfa_secret]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  } catch (error) {
    console.error('Error in saveOrUpdateUserMfaConfig:', error);
    throw error;
  }
}

export async function enableUserMfa(id_usuario: number): Promise<boolean> {
  try {
    const [result] = await pool.execute(
      'UPDATE usuarios_mfa_config SET mfa_enabled = 1, mfa_verified_at = NOW() WHERE id_usuario = ?',
      [id_usuario]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  } catch (error) {
    console.error('Error in enableUserMfa:', error);
    throw error;
  }
}

// 🐾 Funciones para recordatorios
export async function getAllRecordatorios(): Promise<RecordatorioFromDb[]> {
  try {
    const [rows] = await pool.query(`
      SELECT id, mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado, notas
      FROM recordatorios
      ORDER BY fecha_vencimiento ASC
    `);
    return rows as RecordatorioFromDb[];
  } catch (error) {
    console.error('Error in getAllRecordatorios:', error);
    throw error;
  }
}

export async function createRecordatorio(data: {
  mascota_id: number;
  tipo_recordatorio_id: number;
  fecha_vencimiento: string;
  estado?: string;
  notas?: string;
}): Promise<number> {
  try {
    // Verificar que la mascota exista para evitar violaciones de FK
    const [mascRows] = await pool.query('SELECT id FROM mascotas WHERE id = ?', [data.mascota_id]);
    const mascotas = mascRows as Array<{ id: number }>;
    if (mascotas.length === 0) {
      throw new Error(`La mascota con id=${data.mascota_id} no existe`);
    }
    const [result] = await pool.execute(
      `INSERT INTO recordatorios (mascota_id, tipo_recordatorio_id, fecha_vencimiento, estado, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.mascota_id,
        data.tipo_recordatorio_id,
        data.fecha_vencimiento,
        // Ajustar a formato coherente con el enum en la DB
        data.estado || 'Pendiente',
        data.notas || '',
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  } catch (error) {
    console.error('Error in createRecordatorio:', error);
    throw error;
  }
}
