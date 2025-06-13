import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PracticeFilter } from "@/components/practice-filter"
import { ProblemList } from "@/components/problem-list"
import * as practiceService from "@/lib/practice"

export default async function PracticePage() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  // Get all problems with user progress if logged in
  const problems = await practiceService.getProblems({ userId })

  // Get unique topics for filtering
  const topics = Array.from(new Set(problems.map((p: any) => p.topic))).sort()

  // Group problems by topic
  const problemsByTopic: Record<string, any[]> = {}
  topics.forEach((topic) => {
    problemsByTopic[topic] = problems.filter((p: any) => p.topic === topic)
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Practice Problems</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Striver's DSA Sheet</CardTitle>
          <CardDescription>
            A curated list of coding problems to help you master data structures and algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PracticeFilter topics={topics} />
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Topics</TabsTrigger>
          {topics.map((topic) => (
            <TabsTrigger key={topic} value={topic}>
              {topic}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-8">
            {topics.map((topic) => (
              <div key={topic}>
                <h2 className="text-2xl font-bold mb-4">{topic}</h2>
                <ProblemList problems={problemsByTopic[topic]} isLoggedIn={!!userId} />
              </div>
            ))}
          </div>
        </TabsContent>

        {topics.map((topic) => (
          <TabsContent key={topic} value={topic}>
            <ProblemList problems={problemsByTopic[topic]} isLoggedIn={!!userId} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
