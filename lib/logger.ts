// lib/logger.ts
import mysql from 'mysql2/promise';

// Conexión a tu base de datos (ajusta los valores según tu .env.local)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export async function logAction(userId: number, action: string, meta?: any) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, meta) VALUES (?, ?, ?)',
      [userId, action, JSON.stringify(meta || null)]
    );
  } catch (error) {
    console.error('❌ Error registrando acción:', error);
  }
}
