"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import * as communityService from "@/lib/community"

// Helper type for user with id
type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user as AuthenticatedUser | undefined

  if (!user?.id) {
    return { error: "You must be logged in to create a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    const result = await communityService.createPost({
      title,
      content,
      authorId: user.id,
    })

    revalidatePath("/community")
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Error creating community post:", error)
    return { error: "Failed to create post" }
  }
}

export async function updatePost(postId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user as AuthenticatedUser | undefined

  if (!user?.id) {
    return { error: "You must be logged in to update a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    await communityService.updatePost(postId, { title, content })

    revalidatePath(`/community/${postId}`)
    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("Error updating community post:", error)
    return { error: "Failed to update post" }
  }
}

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions)
  const user = session?.user as AuthenticatedUser | undefined

  if (!user?.id) {
    return { error: "You must be logged in to delete a post" }
  }

  try {
    await communityService.deletePost(postId)

    revalidatePath("/community")
    return { success: true }
  } catch (error) {
    console.error("Error deleting community post:", error)
    return { error: "Failed to delete post" }
  }
}

export async function likePost(postId: string) {
  const session = await getServerSession(authOptions)
  const user = session?.user as AuthenticatedUser | undefined

  if (!user?.id) {
    return { error: "You must be logged in to like a post" }
  }

  try {
    const result = await communityService.likePost(postId, user.id)

    revalidatePath(`/community/${postId}`)
    return result
  } catch (error) {
    console.error("Error liking community post:", error)
    return { error: "Failed to like post" }
  }
}

export async function commentOnPost(postId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user as AuthenticatedUser | undefined

  if (!user?.id) {
    return { error: "You must be logged in to comment on a post" }
  }

  const content = formData.get("content") as string

  if (!content) {
    return { error: "Comment content is required" }
  }

  try {
    await communityService.commentOnPost(postId, user.id, content)

    revalidatePath(`/community/${postId}`)
    return { success: true }
  } catch (error) {
    console.error("Error commenting on community post:", error)
    return { error: "Failed to add comment" }
  }
}