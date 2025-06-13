import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, BookOpen, MessageSquare, BarChart3, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Default empty data in case of errors
  let progress = {
    summary: { total_problems: 0, completed_problems: 0 },
    byTopic: [],
  }
  let userBlogs = { blogs: [] }
  let userPosts = { posts: [] }
  let hasErrors = false

  try {
    // We'll import these dynamically to prevent the entire page from failing
    const practiceService = await import("@/lib/practice")
    progress = await practiceService.getUserProgress(session.user.id)
  } catch (error) {
    console.error("Error fetching practice data:", error)
    hasErrors = true
  }

  try {
    const blogService = await import("@/lib/blog")
    userBlogs = await blogService.getBlogs(1, 5, session.user.id)
  } catch (error) {
    console.error("Error fetching blog data:", error)
    hasErrors = true
  }

  try {
    const communityService = await import("@/lib/community")
    userPosts = await communityService.getPosts(1, 5, session.user.id)
  } catch (error) {
    console.error("Error fetching community data:", error)
    hasErrors = true
  }

  const completionPercentage =
    Math.round((progress.summary.completed_problems / progress.summary.total_problems) * 100) || 0

  return (
    <div className="container py-8">
      {hasErrors && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was an error loading some of your dashboard data. Some information may be incomplete.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{session.user.name}</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Problems</CardDescription>
            <CardTitle className="text-3xl">{progress.summary.total_problems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>From Striver's DSA Sheet</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{progress.summary.completed_problems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              <span>Problems solved</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blog Posts</CardDescription>
            <CardTitle className="text-3xl">{userBlogs.blogs?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="mr-1 h-4 w-4" />
              <span>Articles published</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Discussions</CardDescription>
            <CardTitle className="text-3xl">{userPosts.posts?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>Community contributions</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Your DSA learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="progress">
            <BarChart3 className="mr-2 h-4 w-4" />
            Topic Progress
          </TabsTrigger>
          <TabsTrigger value="blogs">
            <BookOpen className="mr-2 h-4 w-4" />
            My Blogs
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageSquare className="mr-2 h-4 w-4" />
            My Discussions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <div className="grid gap-4">
            {progress.byTopic && progress.byTopic.length > 0 ? (
              progress.byTopic.map((topic: any) => {
                const topicPercentage = Math.round((topic.completed_problems / topic.total_problems) * 100) || 0
                return (
                  <Card key={topic.topic}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{topic.topic}</CardTitle>
                        <span className="text-sm font-medium">
                          {topic.completed_problems}/{topic.total_problems}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={topicPercentage} className="h-2" />
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No topic progress data available.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="blogs">
          <div className="grid gap-4">
            {userBlogs.blogs && userBlogs.blogs.length > 0 ? (
              userBlogs.blogs.map((blog: any) => (
                <Card key={blog.id}>
                  <CardHeader>
                    <CardTitle>{blog.title}</CardTitle>
                    <CardDescription>{new Date(blog.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{blog.content.substring(0, 150)}...</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">You haven't published any blog posts yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="discussions">
          <div className="grid gap-4">
            {userPosts.posts && userPosts.posts.length > 0 ? (
              userPosts.posts.map((post: any) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{new Date(post.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{post.content.substring(0, 150)}...</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">You haven't started any discussions yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
