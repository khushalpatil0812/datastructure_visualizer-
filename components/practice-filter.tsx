"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getFilteredProblems } from "@/app/actions/practice-actions"

interface PracticeFilterProps {
  topics: string[]
}

export function PracticeFilter({ topics }: PracticeFilterProps) {
  const [topic, setTopic] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [completed, setCompleted] = useState<string>("")
  const [isFiltering, setIsFiltering] = useState(false)
  const router = useRouter()

  const handleFilter = async () => {
    setIsFiltering(true)

    const formData = new FormData()
    if (topic) formData.append("topic", topic)
    if (difficulty) formData.append("difficulty", difficulty)
    if (completed) formData.append("completed", completed)

    try {
      await getFilteredProblems(formData)
      router.refresh()
    } catch (error) {
      console.error("Error filtering problems:", error)
    } finally {
      setIsFiltering(false)
    }
  }

  const handleReset = () => {
    setTopic("")
    setDifficulty("")
    setCompleted("")
    router.refresh()
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="topic">
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger id="difficulty">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="completed">Status</Label>
          <Select value={completed} onValueChange={setCompleted}>
            <SelectTrigger id="completed">
              <SelectValue placeholder="All Problems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Problems</SelectItem>
              <SelectItem value="true">Completed</SelectItem>
              <SelectItem value="false">Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={handleFilter} disabled={isFiltering} className="flex-1">
            {isFiltering ? "Filtering..." : "Apply Filters"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isFiltering}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}
