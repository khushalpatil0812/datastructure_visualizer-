import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import db from "@/lib/db"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BarChart3, Users, FileText, Home } from "lucide-react"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  console.log("Admin Layout - Session:", session) // Debug log

  if (!session?.user?.email) {
    console.log("Admin Layout - No session, redirecting to login")
    redirect("/login")
  }

  // Direct database check for admin status
  try {
    const result = (await db.query("SELECT is_admin FROM users WHERE email = ?", [session.user.email])) as any

    console.log("Admin Layout - DB Query Result:", result) // Debug log
    console.log("Admin Layout - DB Query Result Type:", typeof result) // Debug log
    console.log("Admin Layout - DB Query Result Structure:", JSON.stringify(result)) // Debug log

    // Based on the logs, it seems the result might be directly the user object
    // Let's handle both possible formats
    let isAdmin = false

    if (Array.isArray(result) && result.length > 0) {
      // If result is an array (like [rows, fields])
      const rows = result[0]
      console.log("Admin Layout - Rows:", rows) // Debug log

      if (Array.isArray(rows) && rows.length > 0) {
        // If rows is an array of user objects
        isAdmin = rows[0]?.is_admin === 1
      } else if (rows && typeof rows === "object") {
        // If rows is directly the user object
        isAdmin = rows.is_admin === 1
      }
    } else if (result && typeof result === "object") {
      // If result is directly the user object
      isAdmin = result.is_admin === 1
    }

    console.log("Admin Layout - Is Admin:", isAdmin) // Debug log

    if (!isAdmin) {
      console.log("Admin Layout - Not admin, redirecting to home")
      redirect("/")
    }

    console.log("Admin Layout - Admin check passed, rendering admin layout")
  } catch (error) {
    console.error("Error checking admin status:", error)
    redirect("/")
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex flex-col">
              <span className="font-bold text-lg">Admin Dashboard</span>
              <span className="text-xs text-muted-foreground">DSA Visualizer</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin">
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/users">
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/blogs">
                      <FileText className="h-4 w-4" />
                      <span>Blogs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      <span>Back to Site</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Logged in as</span>
                <span className="font-medium">{session.user.name}</span>
              </div>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex-1 p-8 ml-64">{children}</div>
    </SidebarProvider>
  )
}
