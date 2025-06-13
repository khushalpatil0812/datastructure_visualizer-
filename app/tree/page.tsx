"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TreeVisualizer } from "@/components/tree-visualizer"
import { TreePseudocodeDisplay } from "@/components/tree-pseudocode-display"

export default function TreePage() {
  const [operation, setOperation] = useState<string>("insert")
  const [value, setValue] = useState<number | null>(null)
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

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? null : Number(e.target.value)
    setValue(val)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Binary Search Tree Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Configure the visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={setOperation} disabled={isRunning && !isPaused}>
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="inorder">Inorder Traversal</SelectItem>
                  <SelectItem value="preorder">Preorder Traversal</SelectItem>
                  <SelectItem value="postorder">Postorder Traversal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["insert", "delete", "search"].includes(operation) && (
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={value === null ? "" : value}
                  onChange={handleValueChange}
                  placeholder="Enter a number"
                  disabled={isRunning && !isPaused}
                />
              </div>
            )}

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
            <CardTitle>Binary Search Tree</CardTitle>
            <CardDescription>
              {operation === "insert"
                ? "Inserting a new node"
                : operation === "delete"
                  ? "Deleting a node"
                  : operation === "search"
                    ? "Searching for a value"
                    : operation === "inorder"
                      ? "Inorder Traversal (Left → Root → Right)"
                      : operation === "preorder"
                        ? "Preorder Traversal (Root → Left → Right)"
                        : "Postorder Traversal (Left → Right → Root)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <TreeVisualizer
              operation={operation}
              value={value}
              isRunning={isRunning && !isPaused}
              speed={speed}
              onOperationComplete={() => setIsRunning(false)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <TreePseudocodeDisplay operation={operation} />

        <Card>
          <CardHeader>
            <CardTitle>Binary Search Tree</CardTitle>
            <CardDescription>Learn about Binary Search Trees and their operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="operations">Operations</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <h3 className="text-lg font-medium">What is a Binary Search Tree?</h3>
                <p>
                  A Binary Search Tree (BST) is a node-based binary tree data structure that has the following
                  properties:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The left subtree of a node contains only nodes with keys less than the node's key.</li>
                  <li>The right subtree of a node contains only nodes with keys greater than the node's key.</li>
                  <li>Both the left and right subtrees must also be binary search trees.</li>
                </ul>
                <p className="mt-2">
                  Due to these properties, BSTs allow for efficient searching, insertion, and deletion operations. The
                  average time complexity for these operations is O(log n), where n is the number of nodes in the tree.
                </p>
              </TabsContent>
              <TabsContent value="operations" className="space-y-4">
                <h3 className="text-lg font-medium">Common BST Operations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Insertion</h4>
                    <p>
                      To insert a new value, we start at the root and compare the value to be inserted with the current
                      node. If the value is less, we go left; if greater, we go right. We continue this process until we
                      find a null reference, where we insert the new node.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Time Complexity: O(log n) average, O(n) worst case
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Deletion</h4>
                    <p>
                      Deletion is more complex and involves three cases: deleting a leaf node, a node with one child, or
                      a node with two children. For the last case, we find the inorder successor (smallest node in right
                      subtree) to replace the deleted node.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Time Complexity: O(log n) average, O(n) worst case
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Search</h4>
                    <p>
                      To search for a value, we start at the root and compare the value with the current node. If equal,
                      we found it; if less, we go left; if greater, we go right. We continue until we find the value or
                      reach a null reference.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Time Complexity: O(log n) average, O(n) worst case
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Traversals</h4>
                    <p>
                      There are three main ways to traverse a BST: inorder (left, root, right), preorder (root, left,
                      right), and postorder (left, right, root). Inorder traversal of a BST gives nodes in ascending
                      order.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Time Complexity: O(n) for all traversals</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
