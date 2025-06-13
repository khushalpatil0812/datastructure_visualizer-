import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import AuthProvider from "@/components/auth-provider"
import { headers } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { trackPageVisit } from "@/lib/analytics"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DSA Visualizer Platform",
  description: "Interactive platform for learning data structures and algorithms",
    generator: 'v0.dev'
}

async function TrackPageVisit({ path }: { path: string }) {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  const userAgent = headersList.get("user-agent") || ""
  const referer = headersList.get("referer") || ""
  const ip = headersList.get("x-forwarded-for") || "unknown"

  // Track the page visit
  await trackPageVisit({
    page_path: path,
    user_id: session?.user?.id,
    referrer: referer,
    user_agent: userAgent,
    ip_address: ip,
  })

  return null
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const path = headers().get("x-pathname") || "/"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Suspense fallback={null}>
              <TrackPageVisit path={path} />
            </Suspense>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
