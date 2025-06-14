// lib/blog.ts
import db from "./db";
import { v4 as uuidv4 } from "uuid";

interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
  author_name: string;
  author_image: string;
  like_count: number;
  comment_count: number;
  comments?: BlogComment[];
}

interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  author_name: string;
  author_image: string;
}

interface PaginatedBlogs {
  blogs: Blog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getBlogs(page = 1, limit = 10, userId?: string): Promise<PaginatedBlogs> {
  const offset = (page - 1) * limit;

  try {
    const pageNum = Number.parseInt(String(page), 10) || 1;
    const limitNum = Number.parseInt(String(limit), 10) || 10;
    const offsetNum = (pageNum - 1) * limitNum;

    let query = `
      SELECT b.*, u.name as author_name, u.image as author_image,
      (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count,
      (SELECT COUNT(*) FROM blog_comments WHERE blog_id = b.id) as comment_count
      FROM blogs b
      JOIN users u ON b.author_id = u.id
    `;

    const params: any[] = [];

    if (userId) {
      query += ` WHERE b.author_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY b.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const blogs = await db.query<Blog[]>(query, params);

    let countQuery = `SELECT COUNT(*) as count FROM blogs`;
    const countParams: any[] = [];

    if (userId) {
      countQuery += ` WHERE author_id = ?`;
      countParams.push(userId);
    }

    const total = await db.query<{ count: number }[]>(countQuery, countParams);

    return {
      blogs,
      pagination: {
        total: total[0]?.count || 0,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil((total[0]?.count || 0) / limitNum),
      },
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const [blog] = await db.query<Blog[]>(
      `SELECT b.*, u.name as author_name, u.image as author_image,
      (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as like_count
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = ?`,
      [id]
    );

    if (!blog) {
      return null;
    }

    const comments = await db.query<BlogComment[]>(
      `SELECT c.*, u.name as author_name, u.image as author_image
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = ?
      ORDER BY c.created_at DESC`,
      [id]
    );

    return {
      ...blog,
      comments,
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    throw error;
  }
}

export async function createBlog(data: { title: string; content: string; authorId: string }): Promise<{ id: string }> {
  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO blogs (id, title, content, author_id)
      VALUES (?, ?, ?, ?)`,
      [id, data.title, data.content, data.authorId]
    );
    return { id };
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
}

export async function updateBlog(id: string, data: { title: string; content: string }): Promise<{ id: string }> {
  try {
    await db.query(
      `UPDATE blogs
      SET title = ?, content = ?, updated_at = NOW()
      WHERE id = ?`,
      [data.title, data.content, id]
    );
    return { id };
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
}

export async function deleteBlog(id: string): Promise<{ success: boolean }> {
  try {
    await db.query("DELETE FROM blogs WHERE id = ?", [id]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
}

export async function likeBlog(blogId: string, userId: string): Promise<{ liked: boolean }> {
  try {
    const [existingLike] = await db.query(
      "SELECT * FROM blog_likes WHERE blog_id = ? AND user_id = ?",
      [blogId, userId]
    );

    if (existingLike) {
      await db.query(
        "DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?",
        [blogId, userId]
      );
      return { liked: false };
    } else {
      await db.query(
        "INSERT INTO blog_likes (id, blog_id, user_id) VALUES (?, ?, ?)",
        [uuidv4(), blogId, userId]
      );
      return { liked: true };
    }
  } catch (error) {
    console.error("Error toggling blog like:", error);
    throw error;
  }
}

export async function commentOnBlog(
  blogId: string,
  userId: string,
  content: string
): Promise<{ id: string }> {
  try {
    const id = uuidv4();
    await db.query(
      "INSERT INTO blog_comments (id, blog_id, user_id, content) VALUES (?, ?, ?, ?)",
      [id, blogId, userId, content]
    );
    return { id };
  } catch (error) {
    console.error("Error commenting on blog:", error);
    throw error;
  }
}

// Export all functions as a namespace
export const blogService = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  commentOnBlog,
};