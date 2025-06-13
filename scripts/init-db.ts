import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting database initialization...")

    // Read SQL schema file
    const schemaPath = path.join(process.cwd(), "scripts", "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    // Split SQL statements
    const statements = schema.split(";").filter((statement) => statement.trim() !== "")

    // Execute each statement
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(`${statement};`)
    }

    console.log("Database initialized successfully!")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
