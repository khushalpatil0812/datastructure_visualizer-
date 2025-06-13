import db from "./db"
import { v4 as uuidv4 } from "uuid"

export async function getProblems(filters: {
  topic?: string
  difficulty?: string
  completed?: boolean
  userId?: string
}) {
  try {
    let query = `
      SELECT p.*, 
      ${filters.userId ? "up.completed, up.completed_at" : "FALSE as completed, NULL as completed_at"}
      FROM practice_problems p
    `

    const params = []

    if (filters.userId) {
      query += `
        LEFT JOIN user_progress up ON p.id = up.problem_id AND up.user_id = ?
      `
      params.push(filters.userId)
    }

    const whereConditions = []

    if (filters.topic) {
      whereConditions.push("p.topic = ?")
      params.push(filters.topic)
    }

    if (filters.difficulty) {
      whereConditions.push("p.difficulty = ?")
      params.push(filters.difficulty)
    }

    if (filters.completed !== undefined && filters.userId) {
      whereConditions.push("up.completed = ?")
      params.push(filters.completed)
    }

    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ")
    }

    query += " ORDER BY p.topic, p.difficulty"

    const problems = await db.query(query, params)

    return problems
  } catch (error) {
    console.error("Error fetching practice problems:", error)
    throw error
  }
}

export async function toggleProblemCompletion(problemId: string, userId: string) {
  try {
    const [existingProgress] = await db.query("SELECT * FROM user_progress WHERE problem_id = ? AND user_id = ?", [
      problemId,
      userId,
    ])

    if (existingProgress) {
      // Toggle completion status
      const newCompletedStatus = !existingProgress.completed
      const completedAt = newCompletedStatus ? new Date() : null

      await db.query("UPDATE user_progress SET completed = ?, completed_at = ? WHERE problem_id = ? AND user_id = ?", [
        newCompletedStatus,
        completedAt,
        problemId,
        userId,
      ])

      return { completed: newCompletedStatus }
    } else {
      // Create new progress entry (completed by default)
      await db.query(
        "INSERT INTO user_progress (id, problem_id, user_id, completed, completed_at) VALUES (?, ?, ?, TRUE, ?)",
        [uuidv4(), problemId, userId, new Date()],
      )

      return { completed: true }
    }
  } catch (error) {
    console.error("Error toggling problem completion:", error)
    throw error
  }
}

export async function getUserProgress(userId: string) {
  try {
    const progress = await db.query(
      `
      SELECT 
        COUNT(DISTINCT p.id) as total_problems,
        SUM(CASE WHEN up.completed = TRUE THEN 1 ELSE 0 END) as completed_problems,
        COUNT(DISTINCT p.topic) as total_topics,
        COUNT(DISTINCT CASE WHEN up.completed = TRUE THEN p.topic ELSE NULL END) as topics_with_progress
      FROM practice_problems p
      LEFT JOIN user_progress up ON p.id = up.problem_id AND up.user_id = ?
    `,
      [userId],
    )

    const topicProgress = await db.query(
      `
      SELECT 
        p.topic,
        COUNT(DISTINCT p.id) as total_problems,
        SUM(CASE WHEN up.completed = TRUE THEN 1 ELSE 0 END) as completed_problems
      FROM practice_problems p
      LEFT JOIN user_progress up ON p.id = up.problem_id AND up.user_id = ?
      GROUP BY p.topic
      ORDER BY p.topic
    `,
      [userId],
    )

    return {
      summary: progress[0],
      byTopic: topicProgress,
    }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    throw error
  }
}
