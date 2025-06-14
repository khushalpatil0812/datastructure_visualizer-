"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import * as practiceService from "@/lib/practice"

export async function toggleProblemCompletion(problemId: string) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : null

  if (!userId) {
    return { error: "You must be logged in to track progress" }
  }

  try {
    const result = await practiceService.toggleProblemCompletion(problemId, userId)

    revalidatePath("/practice")
    revalidatePath("/dashboard")
    return result
  } catch (error) {
    console.error("Error toggling problem completion:", error)
    return { error: "Failed to update progress" }
  }
}

export async function getFilteredProblems(formData: FormData) {
  const session = await getServerSession(authOptions)
  const userId = session?.user ? (session.user as { id: string }).id : undefined

  const topic = formData.get("topic") as string | undefined
  const difficulty = formData.get("difficulty") as string | undefined
  const completedStr = formData.get("completed") as string | undefined

  let completed: boolean | undefined = undefined
  if (completedStr === "true") completed = true
  if (completedStr === "false") completed = false

  try {
    const problems = await practiceService.getProblems({
      topic,
      difficulty,
      completed,
      userId,
    })

    return { problems }
  } catch (error) {
    console.error("Error fetching filtered problems:", error)
    return { error: "Failed to fetch problems" }
  }
}