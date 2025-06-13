import { NextResponse } from "next/server"
import db from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get email from request body
    const { email } = await request.json()

    // Verify the email matches the session email (security check)
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 })
    }

    // Query the database
    const [userRows] = (await db.query("SELECT id, email, name, is_admin FROM users WHERE email = ?", [email])) as any[]

    // Check if user exists and has admin privileges
    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ exists: false, isAdmin: false, message: "User not found in database" })
    }

    const user = userRows[0]

    // Return the result
    return NextResponse.json({
      exists: true,
      isAdmin: Boolean(user.is_admin),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: Boolean(user.is_admin),
      },
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
