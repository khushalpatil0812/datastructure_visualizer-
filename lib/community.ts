import db from "./db"
import { v4 as uuidv4 } from "uuid"

export async function getPosts(page = 1, limit = 10, userId?: string) {
  const offset = (page - 1) * limit

  try {
    let query = `
      SELECT p.*, u.name as author_name, u.image as author_image,
      (SELECT COUNT(*) FROM community_post_likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM community_post_comments WHERE post_id = p.id) as comment_count
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
    `

    const params = []

    if (userId) {
      query += ` WHERE p.author_id = ?`
      params.push(userId)
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const posts = await db.query(query, params)

    let countQuery = `SELECT COUNT(*) as count FROM community_posts`
    const countParams = []

    if (userId) {
      countQuery += ` WHERE author_id = ?`
      countParams.push(userId)
    }

    const total = await db.query(countQuery, countParams)

    return {
      posts,
      pagination: {
        total: total[0].count,
        page,
        limit,
        pages: Math.ceil(total[0].count / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching community posts:", error)
    throw error
  }
}

export async function getPostById(id: string) {
  try {
    const [post] = await db.query(
      `
      SELECT p.*, u.name as author_name, u.image as author_image,
      (SELECT COUNT(*) FROM community_post_likes WHERE post_id = p.id) as like_count
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `,
      [id],
    )

    if (!post) {
      return null
    }

    const comments = await db.query(
      `
      SELECT c.*, u.name as author_name, u.image as author_image
      FROM community_post_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `,
      [id],
    )

    return {
      ...post,
      comments,
    }
  } catch (error) {
    console.error("Error fetching community post:", error)
    throw error
  }
}

export async function createPost(data: { title: string; content: string; authorId: string }) {
  try {
    const id = uuidv4()
    await db.query(
      `
      INSERT INTO community_posts (id, title, content, author_id)
      VALUES (?, ?, ?, ?)
    `,
      [id, data.title, data.content, data.authorId],
    )

    return { id }
  } catch (error) {
    console.error("Error creating community post:", error)
    throw error
  }
}

export async function updatePost(id: string, data: { title: string; content: string }) {
  try {
    await db.query(
      `
      UPDATE community_posts
      SET title = ?, content = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [data.title, data.content, id],
    )

    return { id }
  } catch (error) {
    console.error("Error updating community post:", error)
    throw error
  }
}

export async function deletePost(id: string) {
  try {
    await db.query("DELETE FROM community_posts WHERE id = ?", [id])
    return { success: true }
  } catch (error) {
    console.error("Error deleting community post:", error)
    throw error
  }
}

export async function likePost(postId: string, userId: string) {
  try {
    const [existingLike] = await db.query("SELECT * FROM community_post_likes WHERE post_id = ? AND user_id = ?", [
      postId,
      userId,
    ])

    if (existingLike) {
      await db.query("DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?", [postId, userId])
      return { liked: false }
    } else {
      await db.query("INSERT INTO community_post_likes (id, post_id, user_id) VALUES (?, ?, ?)", [
        uuidv4(),
        postId,
        userId,
      ])
      return { liked: true }
    }
  } catch (error) {
    console.error("Error toggling community post like:", error)
    throw error
  }
}

export async function commentOnPost(postId: string, userId: string, content: string) {
  try {
    const id = uuidv4()
    await db.query("INSERT INTO community_post_comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)", [
      id,
      postId,
      userId,
      content,
    ])

    return { id }
  } catch (error) {
    console.error("Error commenting on community post:", error)
    throw error
  }
}
