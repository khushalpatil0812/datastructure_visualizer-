"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import * as blogService from "@/lib/blog"


// Define consistent response types
type ActionResponse<T = {}> = 
  | { success: true; data: T }
  | { success: false; error: string }

export async function createBlog(formData: FormData): Promise<ActionResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to create a blog post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { success: false, error: "Title and content are required" }
  }

  try {
    const result = await blogService.createBlog({
      title,
      content,
      authorId: session.user.id,
    })

    revalidatePath("/blog")
    return { success: true, data: { id: result.id } }
  } catch (error) {
    console.error("Error creating blog:", error)
    return { success: false, error: "Failed to create blog post" }
  }
}

export async function updateBlog(blogId: string, formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to update a blog post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { success: false, error: "Title and content are required" }
  }

  try {
    await blogService.updateBlog(blogId, { title, content })

    revalidatePath(`/blog/${blogId}`)
    revalidatePath("/blog")
    return { success: true, data: {} }
  } catch (error) {
    console.error("Error updating blog:", error)
    return { success: false, error: "Failed to update blog post" }
  }
}

export async function deleteBlog(blogId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to delete a blog post" }
  }

  try {
    await blogService.deleteBlog(blogId)

    revalidatePath("/blog")
    return { success: true, data: {} }
  } catch (error) {
    console.error("Error deleting blog:", error)
    return { success: false, error: "Failed to delete blog post" }
  }
}

export async function likeBlog(blogId: string): Promise<ActionResponse<{ liked: boolean }>> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to like a blog post" }
  }

  try {
    const result = await blogService.likeBlog(blogId, session.user.id)

    revalidatePath(`/blog/${blogId}`)
    return { success: true, data: { liked: result.liked } }
  } catch (error) {
    console.error("Error liking blog:", error)
    return { success: false, error: "Failed to like blog post" }
  }
}

export async function commentOnBlog(blogId: string, formData: FormData): Promise<ActionResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to comment on a blog post" }
  }

  const content = formData.get("content") as string

  if (!content) {
    return { success: false, error: "Comment content is required" }
  }

  try {
    await blogService.commentOnBlog(blogId, session.user.id, content)

    revalidatePath(`/blog/${blogId}`)
    return { success: true, data: {} }
  } catch (error) {
    console.error("Error commenting on blog:", error)
    return { success: false, error: "Failed to add comment" }
  }
}