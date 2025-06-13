"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SortingVisualizer } from "@/components/sorting-visualizer"
import { PseudocodeDisplay } from "@/components/pseudocode-display"

export default function SortingPage() {
  const [array, setArray] = useState<number[]>([])
  const [arraySize, setArraySize] = useState<number>(50)
  const [speed, setSpeed] = useState<number>(50)
  const [algorithm, setAlgorithm] = useState<string>("bubble")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Generate random array
  const generateArray = () => {
    const newArray = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 5)
    }
    setArray(newArray)
  }

  // Initialize array on component mount and when array size changes
  useEffect(() => {
    generateArray()
  }, [arraySize])

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
    generateArray()
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
  }

  const handleSizeChange = (value: number[]) => {
    setArraySize(value[0])
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Sorting Algorithms Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Configure the visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm} disabled={isRunning && !isPaused}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bubble">Bubble Sort</SelectItem>
                  <SelectItem value="insertion">Insertion Sort</SelectItem>
                  <SelectItem value="selection">Selection Sort</SelectItem>
                  <SelectItem value="merge">Merge Sort</SelectItem>
                  <SelectItem value="quick">Quick Sort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="size">Array Size: {arraySize}</Label>
              </div>
              <Slider
                id="size"
                min={10}
                max={100}
                step={5}
                value={[arraySize]}
                onValueChange={handleSizeChange}
                disabled={isRunning && !isPaused}
              />
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
              <Button onClick={generateArray} variant="outline" className="w-full" disabled={isRunning && !isPaused}>
                <Settings className="mr-2 h-4 w-4" />
                New Array
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort</CardTitle>
            <CardDescription>Visualizing the sorting process in real-time</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <SortingVisualizer
              array={array}
              algorithm={algorithm}
              isRunning={isRunning && !isPaused}
              speed={speed}
              onSortingComplete={() => setIsRunning(false)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <PseudocodeDisplay algorithm={algorithm} />

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Explanation</CardTitle>
            <CardDescription>Learn how the selected algorithm works</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={algorithm} value={algorithm}>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
                <TabsTrigger value="bubble">Bubble</TabsTrigger>
                <TabsTrigger value="insertion">Insertion</TabsTrigger>
                <TabsTrigger value="selection">Selection</TabsTrigger>
                <TabsTrigger value="merge">Merge</TabsTrigger>
                <TabsTrigger value="quick">Quick</TabsTrigger>
              </TabsList>
              <TabsContent value="bubble" className="space-y-4">
                <h3 className="text-lg font-medium">Bubble Sort</h3>
                <p>
                  Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent
                  elements, and swaps them if they are in the wrong order. The pass through the list is repeated until
                  the list is sorted.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n²) in worst and average cases, O(n) in best case (already
                    sorted)
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(1)
                  </p>
                  <p>
                    <strong>Best for:</strong> Educational purposes and small data sets
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="insertion" className="space-y-4">
                <h3 className="text-lg font-medium">Insertion Sort</h3>
                <p>
                  Insertion Sort builds the final sorted array one item at a time. It is much less efficient on large
                  lists than more advanced algorithms such as quicksort, heapsort, or merge sort, but it provides
                  several advantages.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n²) in worst and average cases, O(n) in best case
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(1)
                  </p>
                  <p>
                    <strong>Best for:</strong> Small data sets or nearly sorted arrays
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="selection" className="space-y-4">
                <h3 className="text-lg font-medium">Selection Sort</h3>
                <p>
                  Selection Sort divides the input list into two parts: a sorted sublist and an unsorted sublist. It
                  repeatedly finds the minimum element from the unsorted sublist and moves it to the end of the sorted
                  sublist.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n²) in all cases
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(1)
                  </p>
                  <p>
                    <strong>Best for:</strong> Small data sets where simplicity is more important than efficiency
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="merge" className="space-y-4">
                <h3 className="text-lg font-medium">Merge Sort</h3>
                <p>
                  Merge Sort is an efficient, stable, comparison-based, divide and conquer algorithm. It divides the
                  input array into two halves, recursively sorts them, and then merges the sorted halves.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n log n) in all cases
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(n)
                  </p>
                  <p>
                    <strong>Best for:</strong> Large data sets where stable sorting is required
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="quick" className="space-y-4">
                <h3 className="text-lg font-medium">Quick Sort</h3>
                <p>
                  Quick Sort is an efficient, in-place sorting algorithm that uses a divide-and-conquer strategy. It
                  works by selecting a 'pivot' element and partitioning the array around the pivot.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n log n) average case, O(n²) worst case
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(log n)
                  </p>
                  <p>
                    <strong>Best for:</strong> Large data sets where average-case performance is important
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
