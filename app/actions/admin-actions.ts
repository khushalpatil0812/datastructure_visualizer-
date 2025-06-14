"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import db from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Type definitions
type AdminActionSuccess<T = {}> = { success: true } & T;
type AdminActionError = { success: false; error: string };
type AdminActionResult<T = {}> = AdminActionSuccess<T> | AdminActionError;

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string;
  created_at: Date;
  last_sign_in: Date | null;
  is_admin: boolean;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
  author_name: string;
  author_email: string;
  like_count: number;
  comment_count: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Check if user is admin
async function checkAdmin(): Promise<AdminActionResult> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  const [user] = await db.query<{ is_admin: boolean }[]>(
    "SELECT is_admin FROM users WHERE id = ?", 
    [userId]
  );

  if (!user || !user.is_admin) {
    return { success: false, error: "Not authorized" };
  }

  return { success: true };
}

// Get all users
export async function getUsers(
  page = 1, 
  limit = 10, 
  search = ""
): Promise<AdminActionResult<{ users: User[]; pagination: Pagination }>> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT id, name, email, image, provider, created_at, last_sign_in, is_admin
      FROM users
    `;

    const params: (string | number)[] = [];

    if (search) {
      query += ` WHERE name LIKE ? OR email LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users = await db.query<User[]>(query, params);

    let countQuery = `SELECT COUNT(*) as count FROM users`;
    const countParams: string[] = [];

    if (search) {
      countQuery += ` WHERE name LIKE ? OR email LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [total] = await db.query<{ count: number }[]>(countQuery, countParams);

    return {
      success: true,
      users,
      pagination: {
        total: total.count,
        page,
        limit,
        pages: Math.ceil(total.count / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { 
      success: false, 
      error: "Failed to fetch users" 
    };
  }
}

// Toggle admin status
export async function toggleAdminStatus(
  userId: string
): Promise<AdminActionResult<{ isAdmin: boolean }>> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  try {
    const [user] = await db.query<{ is_admin: boolean }[]>(
      "SELECT is_admin FROM users WHERE id = ?", 
      [userId]
    );

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db.query(
      "UPDATE users SET is_admin = ? WHERE id = ?", 
      [!user.is_admin, userId]
    );

    revalidatePath("/admin/users");
    return { success: true, isAdmin: !user.is_admin };
  } catch (error) {
    console.error("Error toggling admin status:", error);
    return { success: false, error: "Failed to update user" };
  }
}

// Delete user
export async function deleteUser(
  userId: string
): Promise<AdminActionResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  try {
    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// Get all blogs for admin
export async function getAdminBlogs(
  page = 1, 
  limit = 10, 
  search = ""
): Promise<AdminActionResult<{ blogs: Blog[]; pagination: Pagination }>> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT b.*, u.name as author_name, u.email as author_email,
      (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count,
      (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
      FROM blogs b
      JOIN users u ON b.author_id = u.id
    `;

    const params: (string | number)[] = [];

    if (search) {
      query += ` WHERE b.title LIKE ? OR b.content LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const blogs = await db.query<Blog[]>(query, params);

    let countQuery = `SELECT COUNT(*) as count FROM blogs b`;
    const countParams: string[] = [];

    if (search) {
      countQuery += ` WHERE b.title LIKE ? OR b.content LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [total] = await db.query<{ count: number }[]>(countQuery, countParams);

    return {
      success: true,
      blogs,
      pagination: {
        total: total.count,
        page,
        limit,
        pages: Math.ceil(total.count / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { success: false, error: "Failed to fetch blogs" };
  }
}

// Create blog as admin
export async function createAdminBlog(
  formData: FormData
): Promise<AdminActionResult<{ id: string }>> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;
  
  if (!userId) {
    return { success: false, error: "User not authenticated" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return { success: false, error: "Title and content are required" };
  }

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO blogs (id, title, content, author_id) VALUES (?, ?, ?, ?)`,
      [id, title, content, userId]
    );

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: true, id };
  } catch (error) {
    console.error("Error creating blog:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create blog" 
    };
  }
}

// Delete blog as admin
export async function deleteAdminBlog(
  blogId: string
): Promise<AdminActionResult> {
  const adminCheck = await checkAdmin();
  if (!adminCheck.success) return adminCheck;

  try {
    await db.query("DELETE FROM blogs WHERE id = ?", [blogId]);

    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { success: false, error: "Failed to delete blog" };
  }
}