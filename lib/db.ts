import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to execute SQL queries
export async function query(sql: string, params: any[] = []) {
  try {
    // Handle empty params array
    if (!params || params.length === 0) {
      const [rows] = await pool.query(sql)
      return rows
    }

    // Sanitize parameters
    const sanitizedParams = params.map((param) => {
      if (param === undefined) return null
      if (typeof param === "number") return param
      return param
    })

    // Log the query and parameters for debugging
    console.log("Executing SQL:", sql)
    console.log("With parameters:", sanitizedParams)

    const [rows] = await pool.execute(sql, sanitizedParams)
    return rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Singleton pattern to ensure we only create one pool
export default {
  query,
}
