import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const [userRows] = (await db.query("SELECT id FROM users WHERE email = ?", [email])) as any[]

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user to be admin
    await db.query("UPDATE users SET is_admin = 1 WHERE email = ?", [email])

    // Verify the update
    const [updatedUserRows] = (await db.query("SELECT id, email, name, is_admin FROM users WHERE email = ?", [
      email,
    ])) as any[]

    return NextResponse.json({
      success: true,
      message: "User updated to admin",
      user: updatedUserRows[0],
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
