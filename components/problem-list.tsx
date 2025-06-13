"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { toggleProblemCompletion } from "@/app/actions/practice-actions"

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  topic: string
  url?: string
  completed?: boolean
}

interface ProblemListProps {
  problems: Problem[]
  isLoggedIn: boolean
}

export function ProblemList({ problems, isLoggedIn }: ProblemListProps) {
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null)
  const [updatingProblem, setUpdatingProblem] = useState<string | null>(null)
  const { toast } = useToast()

  const handleToggleExpand = (id: string) => {
    setExpandedProblem(expandedProblem === id ? null : id)
  }

  const handleToggleCompletion = async (id: string, completed: boolean) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to track your progress",
      })
      return
    }

    setUpdatingProblem(id)

    try {
      await toggleProblemCompletion(id)
      toast({
        title: completed ? "Problem marked as incomplete" : "Problem marked as complete",
        description: "Your progress has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update problem status",
        variant: "destructive",
      })
    } finally {
      setUpdatingProblem(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500 hover:bg-green-600"
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Hard":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  if (problems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No problems found matching your criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {problems.map((problem) => (
        <Card key={problem.id} className={problem.completed ? "border-green-500/30" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {isLoggedIn && (
                  <div className="flex items-center h-5">
                    <Checkbox
                      checked={problem.completed}
                      onCheckedChange={() => handleToggleCompletion(problem.id, !!problem.completed)}
                      disabled={updatingProblem === problem.id}
                      id={`problem-${problem.id}`}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    {updatingProblem === problem.id && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </div>
                )}
                <CardTitle className={`text-lg ${problem.completed ? "line-through text-muted-foreground" : ""}`}>
                  {problem.title}
                </CardTitle>
              </div>
              <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
            </div>
            <CardDescription>{problem.topic}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => handleToggleExpand(problem.id)}>
                {expandedProblem === problem.id ? (
                  <>
                    Hide Details <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show Details <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
              {problem.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={problem.url} target="_blank" rel="noopener noreferrer">
                    Solve <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            {expandedProblem === problem.id && (
              <div className="mt-4 p-4 bg-muted/50 rounded-md">
                <p>{problem.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
