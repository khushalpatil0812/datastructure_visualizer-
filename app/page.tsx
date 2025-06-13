import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Code, BookOpen, Users, Play, Brain, Network, GitFork } from "lucide-react"
import FeatureCard from "@/components/feature-card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Visualize, Learn, Master DSA
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Interactive visualizations to help you understand data structures and algorithms. Learn at your own pace
                with our comprehensive platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/sorting">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/community">
                  Join Community <Users className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Platform Features</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Everything you need to master data structures and algorithms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Code className="h-10 w-10" />}
              title="Interactive Visualizers"
              description="Visualize sorting, searching, and linked list operations with step-by-step animations"
              href="/sorting"
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10" />}
              title="Blog & Resources"
              description="Read and contribute to our community blog with in-depth DSA articles"
              href="/blog"
            />
            <FeatureCard
              icon={<Play className="h-10 w-10" />}
              title="Video Learning"
              description="Watch curated video tutorials from top DSA educators"
              href="/videos"
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="Practice Problems"
              description="Solve problems from Striver's DSA Sheet and track your progress"
              href="/practice"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Community"
              description="Join discussions, ask questions, and connect with fellow learners"
              href="/community"
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10" />}
              title="Progress Tracking"
              description="Track your learning journey with personalized dashboards"
              href="/dashboard"
            />
            <FeatureCard
              icon={<Network className="h-10 w-10" />}
              title="Graph Algorithms"
              description="Visualize BFS, DFS, and Dijkstra's algorithm on interactive graphs"
              href="/graph"
            />
            <FeatureCard
              icon={<GitFork className="h-10 w-10" />}
              title="Binary Search Tree"
              description="Visualize tree operations and traversals with step-by-step animations"
              href="/tree"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
