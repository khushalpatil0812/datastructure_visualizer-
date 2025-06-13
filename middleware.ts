import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if the path starts with /admin
  const isAdminPath = path.startsWith("/admin")

  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log("Middleware - Token:", token) // Debug log

    // Check if user is authenticated and is an admin
    if (!token) {
      console.log("Middleware - No token, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // For now, allow access if authenticated (we'll check admin status in the layout)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
