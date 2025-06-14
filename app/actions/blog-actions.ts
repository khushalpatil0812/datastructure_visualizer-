"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import * as blogService from "@/lib/blog"

export async function createBlog(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to create a blog post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    const result = await blogService.createBlog({
      title,
      content,
      authorId: userId,
    })

    revalidatePath("/blog")
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Error creating blog:", error)
    return { error: "Failed to create blog post" }
  }
}

export async function updateBlog(blogId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to update a blog post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    await blogService.updateBlog(blogId, { title, content })

    revalidatePath(`/blog/${blogId}`)
    revalidatePath("/blog")
    return { success: true }
  } catch (error) {
    console.error("Error updating blog:", error)
    return { error: "Failed to update blog post" }
  }
}

export async function deleteBlog(blogId: string) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to delete a blog post" }
  }

  try {
    await blogService.deleteBlog(blogId)

    revalidatePath("/blog")
    return { success: true }
  } catch (error) {
    console.error("Error deleting blog:", error)
    return { error: "Failed to delete blog post" }
  }
}

export async function likeBlog(blogId: string) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to like a blog post" }
  }

  try {
    const result = await blogService.likeBlog(blogId, userId)

    revalidatePath(`/blog/${blogId}`)
    return result
  } catch (error) {
    console.error("Error liking blog:", error)
    return { error: "Failed to like blog post" }
  }
}

export async function commentOnBlog(blogId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to comment on a blog post" }
  }

  const content = formData.get("content") as string

  if (!content) {
    return { error: "Comment content is required" }
  }

  try {
    await blogService.commentOnBlog(blogId, userId, content)

    revalidatePath(`/blog/${blogId}`)
    return { success: true }
  } catch (error) {
    console.error("Error commenting on blog:", error)
    return { error: "Failed to add comment" }
  }
}