"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { GraphVisualizer } from "@/components/graph-visualizer"
import { GraphPseudocodeDisplay } from "@/components/graph-pseudocode-display"

export default function GraphPage() {
  const [algorithm, setAlgorithm] = useState<string>("bfs")
  const [isDirected, setIsDirected] = useState<boolean>(false)
  const [isWeighted, setIsWeighted] = useState<boolean>(true)
  const [speed, setSpeed] = useState<number>(50)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const handleStart = () => {
    if (isPaused) {
      setIsPaused(false)
      return
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Graph Algorithms Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Configure the visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isRunning}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bfs">Breadth-First Search</SelectItem>
                  <SelectItem value="dfs">Depth-First Search</SelectItem>
                  <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="directed">Directed Graph</Label>
                <Switch id="directed" checked={isDirected} onCheckedChange={setIsDirected} disabled={isRunning} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weighted">Weighted Graph</Label>
                <Switch id="weighted" checked={isWeighted} onCheckedChange={setIsWeighted} disabled={isRunning} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">Speed: {speed}%</Label>
              </div>
              <Slider id="speed" min={1} max={100} value={[speed]} onValueChange={handleSpeedChange} />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              {!isRunning || isPaused ? (
                <Button onClick={handleStart} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  {isPaused ? "Resume" : "Start"}
                </Button>
              ) : (
                <Button onClick={handlePause} className="w-full">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {algorithm === "bfs"
                ? "Breadth-First Search"
                : algorithm === "dfs"
                  ? "Depth-First Search"
                  : "Dijkstra's Algorithm"}
            </CardTitle>
            <CardDescription>
              {isDirected ? "Directed" : "Undirected"} {isWeighted ? "Weighted" : "Unweighted"} Graph
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <GraphVisualizer
              algorithm={algorithm}
              isDirected={isDirected}
              isWeighted={isWeighted}
              isRunning={isRunning && !isPaused}
              speed={speed}
              onAlgorithmComplete={() => setIsRunning(false)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <GraphPseudocodeDisplay algorithm={algorithm} />

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Explanation</CardTitle>
            <CardDescription>Learn how the selected algorithm works</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={algorithm} value={algorithm}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="bfs">BFS</TabsTrigger>
                <TabsTrigger value="dfs">DFS</TabsTrigger>
                <TabsTrigger value="dijkstra">Dijkstra</TabsTrigger>
              </TabsList>
              <TabsContent value="bfs" className="space-y-4">
                <h3 className="text-lg font-medium">Breadth-First Search</h3>
                <p>
                  Breadth-First Search (BFS) is a graph traversal algorithm that explores all vertices at the present
                  depth before moving on to vertices at the next depth level. It uses a queue data structure to keep
                  track of nodes to visit next.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(V + E) where V is the number of vertices and E is the number of
                    edges
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V) for the queue
                  </p>
                  <p>
                    <strong>Applications:</strong> Finding shortest paths in unweighted graphs, connected components,
                    and level-order traversal
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="dfs" className="space-y-4">
                <h3 className="text-lg font-medium">Depth-First Search</h3>
                <p>
                  Depth-First Search (DFS) is a graph traversal algorithm that explores as far as possible along each
                  branch before backtracking. It uses a stack (or recursion) to keep track of nodes to visit next.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(V + E) where V is the number of vertices and E is the number of
                    edges
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V) for the recursion stack
                  </p>
                  <p>
                    <strong>Applications:</strong> Topological sorting, cycle detection, path finding, and maze
                    generation
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="dijkstra" className="space-y-4">
                <h3 className="text-lg font-medium">Dijkstra's Algorithm</h3>
                <p>
                  Dijkstra's algorithm is a shortest path algorithm for finding the shortest paths between nodes in a
                  weighted graph. It uses a priority queue to greedily select the next node with the smallest distance.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O((V + E) log V) with a binary heap implementation
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(V) for the distance and previous arrays
                  </p>
                  <p>
                    <strong>Limitations:</strong> Does not work with negative edge weights
                  </p>
                  <p>
                    <strong>Applications:</strong> GPS navigation, network routing protocols, and flight scheduling
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
