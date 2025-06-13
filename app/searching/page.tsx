"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, RotateCcw, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SearchingVisualizer } from "@/components/searching-visualizer"
import { SearchPseudocodeDisplay } from "@/components/search-pseudocode-display"

export default function SearchingPage() {
  const [array, setArray] = useState<number[]>([])
  const [arraySize, setArraySize] = useState<number>(20)
  const [speed, setSpeed] = useState<number>(50)
  const [algorithm, setAlgorithm] = useState<string>("linear")
  const [searchValue, setSearchValue] = useState<number>(50)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [isSorted, setIsSorted] = useState<boolean>(false)

  // Generate random array
  const generateArray = (sorted = false) => {
    const newArray = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1)
    }

    if (sorted) {
      newArray.sort((a, b) => a - b)
      setIsSorted(true)
    } else {
      setIsSorted(false)
    }

    setArray(newArray)
  }

  // Initialize array on component mount and when array size changes
  useEffect(() => {
    generateArray(algorithm === "binary")
  }, [arraySize, algorithm])

  // Ensure array is sorted for binary search
  useEffect(() => {
    if (algorithm === "binary" && !isSorted) {
      generateArray(true)
    }
  }, [algorithm, isSorted])

  const handleStart = () => {
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    generateArray(algorithm === "binary")
  }

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0])
  }

  const handleSizeChange = (value: number[]) => {
    setArraySize(value[0])
  }

  const handleSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value)) {
      setSearchValue(value)
    } else {
      setSearchValue(0)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Searching Algorithms Visualizer</h1>

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
                  <SelectItem value="linear">Linear Search</SelectItem>
                  <SelectItem value="binary">Binary Search</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search-value">Search Value</Label>
              <Input
                id="search-value"
                type="number"
                value={searchValue}
                onChange={handleSearchValueChange}
                disabled={isRunning}
                min={1}
                max={100}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="size">Array Size: {arraySize}</Label>
              </div>
              <Slider
                id="size"
                min={10}
                max={50}
                step={5}
                value={[arraySize]}
                onValueChange={handleSizeChange}
                disabled={isRunning}
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
              <Button onClick={handleStart} className="w-full" disabled={isRunning}>
                <Play className="mr-2 h-4 w-4" />
                Start Search
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={() => generateArray(algorithm === "binary")}
                variant="outline"
                className="w-full"
                disabled={isRunning}
              >
                <Settings className="mr-2 h-4 w-4" />
                New Array
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{algorithm === "linear" ? "Linear" : "Binary"} Search</CardTitle>
            <CardDescription>Searching for value {searchValue} in the array</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <SearchingVisualizer
              array={array}
              algorithm={algorithm}
              searchValue={searchValue}
              isRunning={isRunning}
              speed={speed}
              onSearchComplete={() => setIsRunning(false)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <SearchPseudocodeDisplay algorithm={algorithm} />

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Explanation</CardTitle>
            <CardDescription>Learn how the selected algorithm works</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={algorithm} value={algorithm}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="linear">Linear Search</TabsTrigger>
                <TabsTrigger value="binary">Binary Search</TabsTrigger>
              </TabsList>
              <TabsContent value="linear" className="space-y-4">
                <h3 className="text-lg font-medium">Linear Search</h3>
                <p>
                  Linear Search is the simplest searching algorithm that checks each element of the array one by one
                  until it finds the target value or reaches the end of the array.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(n) in worst case
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(1)
                  </p>
                  <p>
                    <strong>Best for:</strong> Small arrays or unsorted data
                  </p>
                  <p>
                    <strong>Advantages:</strong> Simple to implement, works on unsorted arrays
                  </p>
                  <p>
                    <strong>Disadvantages:</strong> Inefficient for large arrays
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="binary" className="space-y-4">
                <h3 className="text-lg font-medium">Binary Search</h3>
                <p>
                  Binary Search is an efficient algorithm that finds the position of a target value within a sorted
                  array. It works by repeatedly dividing the search interval in half.
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Time Complexity:</strong> O(log n) in worst case
                  </p>
                  <p>
                    <strong>Space Complexity:</strong> O(1) for iterative implementation
                  </p>
                  <p>
                    <strong>Best for:</strong> Large sorted arrays
                  </p>
                  <p>
                    <strong>Advantages:</strong> Very efficient for large datasets
                  </p>
                  <p>
                    <strong>Disadvantages:</strong> Requires sorted array
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
