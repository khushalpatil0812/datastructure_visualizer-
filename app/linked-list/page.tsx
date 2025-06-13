"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LinkedListVisualizer } from "@/components/linked-list-visualizer"

export default function LinkedListPage() {
  const [listType, setListType] = useState<"singly" | "doubly">("singly")
  const [operation, setOperation] = useState<string>("insert")
  const [value, setValue] = useState<string>("")
  const [position, setPosition] = useState<string>("0")
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(50)

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value)
  }

  const handleExecute = () => {
    if (!value && operation !== "traverse") return
    setIsRunning(true)
  }

  const handleSpeedChange = (val: string) => {
    setSpeed(Number(val))
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Linked List Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Configure the visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="list-type">List Type</Label>
              <Select value={listType} onValueChange={(val: "singly" | "doubly") => setListType(val)}>
                <SelectTrigger id="list-type">
                  <SelectValue placeholder="Select list type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singly">Singly Linked List</SelectItem>
                  <SelectItem value="doubly">Doubly Linked List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insert">Insert</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="traverse">Traverse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operation !== "traverse" && (
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="text"
                  value={value}
                  onChange={handleValueChange}
                  placeholder="Enter a value"
                  disabled={isRunning}
                />
              </div>
            )}

            {(operation === "insert" || operation === "delete") && (
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={handlePositionChange}
                  placeholder="Enter position"
                  min="0"
                  disabled={isRunning}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="speed">Animation Speed</Label>
              <Select value={speed.toString()} onValueChange={handleSpeedChange}>
                <SelectTrigger id="speed">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">Slow</SelectItem>
                  <SelectItem value="50">Medium</SelectItem>
                  <SelectItem value="75">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <Button onClick={handleExecute} className="w-full" disabled={isRunning}>
              Execute Operation
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{listType === "singly" ? "Singly" : "Doubly"} Linked List</CardTitle>
            <CardDescription>Visualizing linked list operations in real-time</CardDescription>
          </CardHeader>
          <CardContent className="h-[500px]">
            <LinkedListVisualizer
              listType={listType}
              operation={operation}
              value={value}
              position={Number.parseInt(position) || 0}
              isRunning={isRunning}
              speed={speed}
              onOperationComplete={() => setIsRunning(false)}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Linked List Explanation</CardTitle>
          <CardDescription>Learn how linked lists work</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="singly" value={listType}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="singly">Singly Linked List</TabsTrigger>
              <TabsTrigger value="doubly">Doubly Linked List</TabsTrigger>
            </TabsList>
            <TabsContent value="singly" className="space-y-4">
              <h3 className="text-lg font-medium">Singly Linked List</h3>
              <p>
                A singly linked list is a data structure that consists of a sequence of nodes, where each node contains
                data and a reference (or pointer) to the next node in the sequence.
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Operations:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Insert:</strong> Add a new node at a specified position. Time complexity: O(n) in worst
                    case, O(1) for head insertion.
                  </li>
                  <li>
                    <strong>Delete:</strong> Remove a node at a specified position. Time complexity: O(n) in worst case,
                    O(1) for head deletion.
                  </li>
                  <li>
                    <strong>Search:</strong> Find a node with a specific value. Time complexity: O(n).
                  </li>
                  <li>
                    <strong>Traverse:</strong> Visit each node in the list. Time complexity: O(n).
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="doubly" className="space-y-4">
              <h3 className="text-lg font-medium">Doubly Linked List</h3>
              <p>
                A doubly linked list is similar to a singly linked list, but each node has two references: one to the
                next node and another to the previous node in the sequence.
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Operations:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Insert:</strong> Add a new node at a specified position. Time complexity: O(n) in worst
                    case, O(1) for head/tail insertion.
                  </li>
                  <li>
                    <strong>Delete:</strong> Remove a node at a specified position. Time complexity: O(n) in worst case,
                    O(1) for head/tail deletion.
                  </li>
                  <li>
                    <strong>Search:</strong> Find a node with a specific value. Time complexity: O(n).
                  </li>
                  <li>
                    <strong>Traverse:</strong> Visit each node in the list. Time complexity: O(n).
                  </li>
                </ul>
                <p>
                  <strong>Advantages over Singly Linked List:</strong> Can be traversed in both directions and deletion
                  is more efficient when the node to be deleted is given.
                </p>
                <p>
                  <strong>Disadvantages:</strong> Requires more memory due to the extra pointer and operations are
                  slightly more complex.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
