import { getAnalytics, getUserAnalytics } from "@/lib/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart } from "@/components/admin/charts"
import { Users, Eye, FileText, MessageSquare } from "lucide-react"
import db from "@/lib/db"

export default async function AdminDashboard() {
  const analytics = await getAnalytics(30)
  const userAnalytics = await getUserAnalytics()

  // Get additional stats
  const [blogCount] = (await db.query("SELECT COUNT(*) as count FROM blogs")) as any[]
  const [communityCount] = (await db.query("SELECT COUNT(*) as count FROM community_posts")) as any[]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              <span>Active users: {userAnalytics.activeUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Page Views</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalVisits}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="mr-1 h-4 w-4" />
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blog Posts</CardDescription>
            <CardTitle className="text-3xl">{blogCount.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <FileText className="mr-1 h-4 w-4" />
              <span>Published articles</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Community Posts</CardDescription>
            <CardTitle className="text-3xl">{communityCount.count}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>Discussion threads</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic">
        <TabsList className="mb-4">
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="pages">Popular Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Daily Visits</CardTitle>
              <CardDescription>Page visits over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={analytics.dailyStats.map((stat: any) => ({
                  date: new Date(stat.date).toLocaleDateString(),
                  visits: stat.total_visits,
                }))}
                xKey="date"
                yKey="visits"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
              <CardDescription>New user sign-ups over time</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={userAnalytics.userRegistrations.map((reg: any) => ({
                  date: new Date(reg.date).toLocaleDateString(),
                  users: reg.count,
                }))}
                xKey="date"
                yKey="users"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Pages</CardTitle>
              <CardDescription>Top pages by visit count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.map((page: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-8 text-center font-medium">{i + 1}.</span>
                      <span className="truncate max-w-[300px]">{page.page_path}</span>
                    </div>
                    <span className="font-medium">{page.visit_count} visits</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
