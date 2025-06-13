import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Check if the path starts with /admin
  const isAdminPath = path.startsWith("/admin")

  if (isAdminPath) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Check if user is authenticated and is an admin
    if (!session || !session.is_admin) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Track page visit for analytics
  if (path !== "/_next" && !path.includes(".") && !path.startsWith("/api")) {
    try {
      // We'll use a server action to log the visit
      // This is just a placeholder - the actual tracking happens in the layout
    } catch (error) {
      console.error("Error tracking page visit:", error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
