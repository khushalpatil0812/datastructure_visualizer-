import db from "./db"
import { v4 as uuidv4 } from "uuid"

export async function trackPageVisit(data: {
  page_path: string
  user_id?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
}) {
  try {
    // Insert into page_visits table
    await db.query(
      `INSERT INTO page_visits (id, page_path, user_id, referrer, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        data.page_path,
        data.user_id || null,
        data.referrer || null,
        data.user_agent || null,
        data.ip_address || null,
      ],
    )

    // Update daily stats using REPLACE INTO to handle duplicates
    const today = new Date().toISOString().split("T")[0]

    try {
      // First try to update if exists
      const updateResult = (await db.query(
        `UPDATE daily_stats 
         SET total_visits = total_visits + 1,
             unique_visitors = unique_visitors + IF(? IS NULL, 0, 1),
             new_users = new_users + IF(? IS NULL, 0, 1)
         WHERE date = ?`,
        [data.user_id, data.user_id, today],
      )) as any

      // If no rows were updated, insert new record
      if (updateResult.affectedRows === 0) {
        await db.query(
          `INSERT IGNORE INTO daily_stats (id, date, total_visits, unique_visitors, new_users)
           VALUES (?, ?, 1, ?, ?)`,
          [uuidv4(), today, data.user_id ? 1 : 0, data.user_id ? 1 : 0],
        )
      }
    } catch (error) {
      console.error("Error updating daily stats:", error)
      // Continue execution even if daily stats update fails
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking page visit:", error)
    return { success: false, error }
  }
}

export async function getAnalytics(days = 30) {
  try {
    // Get daily stats for the last X days
    const dailyStats = await db.query(
      `SELECT * FROM daily_stats 
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [days],
    )

    // Get total users
    const [userCountResult] = (await db.query("SELECT COUNT(*) as count FROM users")) as any[]
    const totalUsers = userCountResult.count

    // Get total page visits
    const [visitCountResult] = (await db.query("SELECT COUNT(*) as count FROM page_visits")) as any[]
    const totalVisits = visitCountResult.count

    // Get most visited pages
    const topPages = await db.query(
      `SELECT page_path, COUNT(*) as visit_count 
       FROM page_visits 
       GROUP BY page_path 
       ORDER BY visit_count DESC 
       LIMIT 10`,
    )

    return {
      dailyStats,
      totalUsers,
      totalVisits,
      topPages,
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    throw error
  }
}

export async function getUserAnalytics() {
  try {
    // Get user registration over time
    const userRegistrations = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM users 
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
    )

    // Get active users (users who have visited in the last 7 days)
    const [activeUsersResult] = (await db.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM page_visits 
       WHERE user_id IS NOT NULL 
       AND visit_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    )) as any[]

    const activeUsers = activeUsersResult.count

    return {
      userRegistrations,
      activeUsers,
    }
  } catch (error) {
    console.error("Error getting user analytics:", error)
    throw error
  }
}
