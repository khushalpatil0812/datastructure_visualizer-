"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Check if user is admin
async function checkAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const [user] = (await db.query("SELECT is_admin FROM users WHERE id = ?", [session.user.id])) as any[]

  if (!user || !user.is_admin) {
    return { error: "Not authorized" }
  }

  return { success: true }
}

// Get all users
export async function getUsers(page = 1, limit = 10, search = "") {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  const offset = (page - 1) * limit

  try {
    let query = `
      SELECT id, name, email, image, provider, created_at, last_sign_in, is_admin
      FROM users
    `

    const params = []

    if (search) {
      query += ` WHERE name LIKE ? OR email LIKE ?`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const users = await db.query(query, params)

    let countQuery = `SELECT COUNT(*) as count FROM users`
    const countParams = []

    if (search) {
      countQuery += ` WHERE name LIKE ? OR email LIKE ?`
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const [total] = (await db.query(countQuery, countParams)) as any[]

    return {
      users,
      pagination: {
        total: total.count,
        page,
        limit,
        pages: Math.ceil(total.count / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { error: "Failed to fetch users" }
  }
}

// Toggle admin status
export async function toggleAdminStatus(userId: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  try {
    const [user] = (await db.query("SELECT is_admin FROM users WHERE id = ?", [userId])) as any[]

    if (!user) {
      return { error: "User not found" }
    }

    await db.query("UPDATE users SET is_admin = ? WHERE id = ?", [!user.is_admin, userId])

    revalidatePath("/admin/users")
    return { success: true, isAdmin: !user.is_admin }
  } catch (error) {
    console.error("Error toggling admin status:", error)
    return { error: "Failed to update user" }
  }
}

// Delete user
export async function deleteUser(userId: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  try {
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Failed to delete user" }
  }
}

// Get all blogs for admin
export async function getAdminBlogs(page = 1, limit = 10, search = "") {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  const offset = (page - 1) * limit

  try {
    let query = `
      SELECT b.*, u.name as author_name, u.email as author_email,
      (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count,
      (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
      FROM blogs b
      JOIN users u ON b.author_id = u.id
    `

    const params = []

    if (search) {
      query += ` WHERE b.title LIKE ? OR b.content LIKE ?`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const blogs = await db.query(query, params)

    let countQuery = `SELECT COUNT(*) as count FROM blogs b`
    const countParams = []

    if (search) {
      countQuery += ` WHERE b.title LIKE ? OR b.content LIKE ?`
      countParams.push(`%${search}%`, `%${search}%`)
    }

    const [total] = (await db.query(countQuery, countParams)) as any[]

    return {
      blogs,
      pagination: {
        total: total.count,
        page,
        limit,
        pages: Math.ceil(total.count / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return { error: "Failed to fetch blogs" }
  }
}

// Create blog as admin
export async function createAdminBlog(formData: FormData) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  const session = await getServerSession(authOptions)
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    const id = uuidv4()
    await db.query(`INSERT INTO blogs (id, title, content, author_id) VALUES (?, ?, ?, ?)`, [
      id,
      title,
      content,
      session?.user?.id,
    ])

    revalidatePath("/admin/blogs")
    revalidatePath("/blog")
    return { success: true, id }
  } catch (error) {
    console.error("Error creating blog:", error)
    return { error: "Failed to create blog" }
  }
}

// Delete blog as admin
export async function deleteAdminBlog(blogId: string) {
  const adminCheck = await checkAdmin()
  if (adminCheck.error) return adminCheck

  try {
    await db.query("DELETE FROM blogs WHERE id = ?", [blogId])

    revalidatePath("/admin/blogs")
    revalidatePath("/blog")
    return { success: true }
  } catch (error) {
    console.error("Error deleting blog:", error)
    return { error: "Failed to delete blog" }
  }
}
