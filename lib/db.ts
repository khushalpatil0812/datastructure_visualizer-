// lib/db.ts
import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to execute SQL queries
async function query<T = mysql.RowDataPacket[]>(sql: string, params: any[] = []): Promise<T> {
  try {
    const sanitizedParams = params.map((param) => {
      if (param === undefined) return null;
      return param;
    });

    console.log("Executing SQL:", sql);
    console.log("With parameters:", sanitizedParams);

    const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, sanitizedParams);
    return rows as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Export as default
const db = { query };
export default db;