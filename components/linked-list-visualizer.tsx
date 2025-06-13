"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface Node {
  id: number
  value: string
  next: number | null
  prev: number | null
  isHead?: boolean
  isTail?: boolean
  isHighlighted?: boolean
  isFound?: boolean
}

interface LinkedListVisualizerProps {
  listType: "singly" | "doubly"
  operation: string
  value: string
  position: number
  isRunning: boolean
  speed: number
  onOperationComplete: () => void
}

export function LinkedListVisualizer({
  listType,
  operation,
  value,
  position,
  isRunning,
  speed,
  onOperationComplete,
}: LinkedListVisualizerProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, value: "10", next: 1, prev: null, isHead: true },
    { id: 1, value: "20", next: 2, prev: listType === "doubly" ? 0 : null },
    { id: 2, value: "30", next: 3, prev: listType === "doubly" ? 1 : null },
    { id: 3, value: "40", next: null, prev: listType === "doubly" ? 2 : null, isTail: true },
  ])
  const [message, setMessage] = useState<string>("")
  const [operationSteps, setOperationSteps] = useState<Array<{ nodes: Node[]; message: string }>>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const operationTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const nextNodeId = useRef<number>(4) // For generating unique node IDs

  // Reset when list type changes
  useEffect(() => {
    const initialNodes = [
      { id: 0, value: "10", next: 1, prev: null, isHead: true },
      { id: 1, value: "20", next: 2, prev: listType === "doubly" ? 0 : null },
      { id: 2, value: "30", next: 3, prev: listType === "doubly" ? 1 : null },
      { id: 3, value: "40", next: null, prev: listType === "doubly" ? 2 : null, isTail: true },
    ]
    setNodes(initialNodes)
    setMessage("")
    setOperationSteps([])
    setCurrentStepIndex(0)
    nextNodeId.current = 4
  }, [listType])

  // Handle operation execution
  useEffect(() => {
    if (isRunning) {
      // Generate operation steps
      const steps = generateOperationSteps()
      setOperationSteps(steps)
      setCurrentStepIndex(0)

      // Start animation
      animateOperation(steps)
    } else {
      // Clear any ongoing animation
      if (operationTimeoutId.current) {
        clearTimeout(operationTimeoutId.current)
        operationTimeoutId.current = null
      }
    }

    return () => {
      if (operationTimeoutId.current) {
        clearTimeout(operationTimeoutId.current)
      }
    }
  }, [isRunning])

  const generateOperationSteps = () => {
    const steps: Array<{ nodes: Node[]; message: string }> = []

    switch (operation) {
      case "insert":
        return generateInsertSteps()
      case "delete":
        return generateDeleteSteps()
      case "search":
        return generateSearchSteps()
      case "traverse":
        return generateTraverseSteps()
      default:
        return steps
    }
  }

  const generateInsertSteps = () => {
    const steps: Array<{ nodes: Node[]; message: string }> = []
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]

    // Step 1: Create a new node
    const newNode: Node = {
      id: nextNodeId.current++,
      value,
      next: null,
      prev: null,
      isHighlighted: true,
    }
    steps.push({
      nodes: [...nodesCopy, { ...newNode }],
      message: `Step 1: Create a new node with value ${value}`,
    })

    // Handle different insertion positions
    if (position === 0) {
      // Insert at head
      const oldHead = nodesCopy.find((node) => node.isHead)
      if (oldHead) {
        // Step 2: Update new node's next pointer
        newNode.next = oldHead.id
        if (listType === "doubly") {
          oldHead.prev = newNode.id
        }
        steps.push({
          nodes: [
            ...nodesCopy.map((n) =>
              n.id === oldHead.id ? { ...n, isHead: false, prev: listType === "doubly" ? newNode.id : null } : n,
            ),
            { ...newNode, next: oldHead.id },
          ],
          message: `Step 2: Point new node's next to the current head`,
        })

        // Step 3: Update head pointer
        steps.push({
          nodes: [
            ...nodesCopy.map((n) =>
              n.id === oldHead.id ? { ...n, isHead: false, prev: listType === "doubly" ? newNode.id : null } : n,
            ),
            { ...newNode, next: oldHead.id, isHead: true, isHighlighted: false },
          ],
          message: `Step 3: Update head to point to the new node`,
        })
      } else {
        // Empty list
        steps.push({
          nodes: [{ ...newNode, isHead: true, isTail: true, isHighlighted: false }],
          message: `Step 2: Set the new node as both head and tail (empty list)`,
        })
      }
    } else {
      // Insert at middle or end
      let current: Node | undefined = nodesCopy.find((node) => node.isHead)
      let currentPos = 0
      let prev: Node | undefined

      // Step 2: Traverse to the position
      while (current && currentPos < position) {
        steps.push({
          nodes: [
            ...nodesCopy.map((n) =>
              n.id === current?.id ? { ...n, isHighlighted: true } : { ...n, isHighlighted: false },
            ),
            { ...newNode, isHighlighted: true },
          ],
          message: `Step 2: Traverse to position ${currentPos + 1}/${position}`,
        })

        prev = current
        current = nodesCopy.find((node) => node.id === current?.next)
        currentPos++
      }

      if (prev) {
        // Step 3: Update pointers
        if (current) {
          // Insert in the middle
          newNode.next = current.id
          if (listType === "doubly") {
            newNode.prev = prev.id
            current.prev = newNode.id
          }

          steps.push({
            nodes: [
              ...nodesCopy.map((n) => {
                if (n.id === prev?.id) return { ...n, next: newNode.id, isHighlighted: true }
                if (n.id === current?.id)
                  return { ...n, prev: listType === "doubly" ? newNode.id : n.prev, isHighlighted: false }
                return { ...n, isHighlighted: false }
              }),
              { ...newNode, next: current.id, prev: listType === "doubly" ? prev.id : null, isHighlighted: true },
            ],
            message: `Step 3: Insert new node between nodes at positions ${currentPos - 1} and ${currentPos}`,
          })
        } else {
          // Insert at the end
          const oldTail = nodesCopy.find((node) => node.isTail)
          if (oldTail) {
            newNode.prev = listType === "doubly" ? oldTail.id : null

            steps.push({
              nodes: [
                ...nodesCopy.map((n) => {
                  if (n.id === oldTail.id) return { ...n, next: newNode.id, isTail: false, isHighlighted: true }
                  return { ...n, isHighlighted: false }
                }),
                { ...newNode, prev: listType === "doubly" ? oldTail.id : null, isTail: true, isHighlighted: true },
              ],
              message: `Step 3: Append new node at the end of the list`,
            })
          }
        }

        // Step 4: Final state
        steps.push({
          nodes: steps[steps.length - 1].nodes.map((n) => ({ ...n, isHighlighted: false })),
          message: `Insertion complete: Node with value ${value} inserted at position ${position}`,
        })
      }
    }

    return steps
  }

  const generateDeleteSteps = () => {
    const steps: Array<{ nodes: Node[]; message: string }> = []
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]

    if (nodesCopy.length === 0) {
      steps.push({
        nodes: [],
        message: "Cannot delete from an empty list",
      })
      return steps
    }

    if (position >= nodesCopy.length) {
      steps.push({
        nodes: nodesCopy,
        message: `Position ${position} is out of bounds (list length: ${nodesCopy.length})`,
      })
      return steps
    }

    if (position === 0) {
      // Delete head
      const head = nodesCopy.find((node) => node.isHead)
      const newHead = head && head.next !== null ? nodesCopy.find((node) => node.id === head.next) : undefined

      // Step 1: Highlight the node to delete
      steps.push({
        nodes: nodesCopy.map((n) => (n.id === head?.id ? { ...n, isHighlighted: true } : n)),
        message: "Step 1: Identify the head node to delete",
      })

      if (newHead) {
        // Step 2: Update head pointer
        steps.push({
          nodes: nodesCopy.map((n) => {
            if (n.id === head?.id) return { ...n, isHighlighted: true, isHead: false }
            if (n.id === newHead.id) return { ...n, isHead: true, prev: null }
            return n
          }),
          message: "Step 2: Update head pointer to the next node",
        })

        // Step 3: Remove the node
        steps.push({
          nodes: nodesCopy
            .filter((n) => n.id !== head?.id)
            .map((n) => {
              if (n.id === newHead.id) return { ...n, isHead: true, prev: null }
              return n
            }),
          message: `Step 3: Remove the node with value ${head?.value}`,
        })
      } else {
        // Deleting the only node
        steps.push({
          nodes: [],
          message: `Step 2: Remove the only node in the list (value: ${head?.value})`,
        })
      }
    } else {
      // Delete from middle or end
      let current: Node | undefined = nodesCopy.find((node) => node.isHead)
      let currentPos = 0
      let prev: Node | undefined

      // Step 1: Traverse to the position
      while (current && currentPos < position) {
        steps.push({
          nodes: nodesCopy.map((n) =>
            n.id === current?.id ? { ...n, isHighlighted: true } : { ...n, isHighlighted: false },
          ),
          message: `Step 1: Traverse to position ${currentPos + 1}/${position}`,
        })

        prev = current
        current = nodesCopy.find((node) => node.id === current?.next)
        currentPos++
      }

      if (current && prev) {
        // Step 2: Highlight the node to delete
        steps.push({
          nodes: nodesCopy.map((n) =>
            n.id === current?.id ? { ...n, isHighlighted: true } : { ...n, isHighlighted: false },
          ),
          message: `Step 2: Identify the node at position ${position} to delete`,
        })

        // Step 3: Update pointers
        const next = current.next !== null ? nodesCopy.find((n) => n.id === current?.next) : undefined

        if (next) {
          // Middle node deletion
          steps.push({
            nodes: nodesCopy.map((n) => {
              if (n.id === prev?.id) return { ...n, next: current?.next || null, isHighlighted: true }
              if (n.id === next.id) return { ...n, prev: listType === "doubly" ? prev.id : null, isHighlighted: false }
              if (n.id === current?.id) return { ...n, isHighlighted: true }
              return { ...n, isHighlighted: false }
            }),
            message: `Step 3: Update pointers to bypass the node at position ${position}`,
          })
        } else {
          // Tail node deletion
          steps.push({
            nodes: nodesCopy.map((n) => {
              if (n.id === prev?.id) return { ...n, next: null, isTail: true, isHighlighted: true }
              if (n.id === current?.id) return { ...n, isHighlighted: true }
              return { ...n, isHighlighted: false }
            }),
            message: `Step 3: Update the previous node to be the new tail`,
          })
        }

        // Step 4: Remove the node
        steps.push({
          nodes: nodesCopy
            .filter((n) => n.id !== current?.id)
            .map((n) => {
              if (n.id === prev?.id && !next) return { ...n, next: null, isTail: true, isHighlighted: false }
              if (n.id === prev?.id) return { ...n, next: current?.next || null, isHighlighted: false }
              if (n.id === next?.id) return { ...n, prev: listType === "doubly" ? prev.id : null, isHighlighted: false }
              return { ...n, isHighlighted: false }
            }),
          message: `Step 4: Remove the node with value ${current.value}`,
        })
      }
    }

    return steps
  }

  const generateSearchSteps = () => {
    const steps: Array<{ nodes: Node[]; message: string }> = []
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]

    if (nodesCopy.length === 0) {
      steps.push({
        nodes: [],
        message: "Cannot search in an empty list",
      })
      return steps
    }

    let current: Node | undefined = nodesCopy.find((node) => node.isHead)
    let position = 0
    let found = false

    // Step 1: Start at the head
    steps.push({
      nodes: nodesCopy.map((n) => (n.id === current?.id ? { ...n, isHighlighted: true } : n)),
      message: `Step 1: Start search at the head node (value: ${current?.value})`,
    })

    // Step 2: Traverse and search
    while (current) {
      if (current.value === value) {
        found = true
        steps.push({
          nodes: nodesCopy.map((n) =>
            n.id === current?.id ? { ...n, isHighlighted: true, isFound: true } : { ...n, isHighlighted: false },
          ),
          message: `Found value ${value} at position ${position}!`,
        })
        break
      }

      if (current.next === null) {
        steps.push({
          nodes: nodesCopy.map((n) =>
            n.id === current?.id ? { ...n, isHighlighted: true } : { ...n, isHighlighted: false },
          ),
          message: `Reached the end of the list. Value ${value} not found.`,
        })
        break
      }

      const next = nodesCopy.find((n) => n.id === current?.next)
      steps.push({
        nodes: nodesCopy.map((n) => {
          if (n.id === current?.id) return { ...n, isHighlighted: false }
          if (n.id === next?.id) return { ...n, isHighlighted: true }
          return { ...n, isHighlighted: false }
        }),
        message: `Moving to next node (position ${position + 1})`,
      })

      current = next
      position++
    }

    // Final step
    if (!found && current) {
      steps.push({
        nodes: nodesCopy.map((n) => ({ ...n, isHighlighted: false })),
        message: `Search complete: Value ${value} not found in the list`,
      })
    }

    return steps
  }

  const generateTraverseSteps = () => {
    const steps: Array<{ nodes: Node[]; message: string }> = []
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]

    if (nodesCopy.length === 0) {
      steps.push({
        nodes: [],
        message: "List is empty, nothing to traverse",
      })
      return steps
    }

    let current: Node | undefined = nodesCopy.find((node) => node.isHead)
    let position = 0

    // Step 1: Start at the head
    steps.push({
      nodes: nodesCopy.map((n) => (n.id === current?.id ? { ...n, isHighlighted: true } : n)),
      message: `Traversal: Visiting node at position ${position} (value: ${current?.value})`,
    })

    // Step 2: Traverse through the list
    while (current && current.next !== null) {
      const next = nodesCopy.find((n) => n.id === current?.next)
      position++

      steps.push({
        nodes: nodesCopy.map((n) => {
          if (n.id === current?.id) return { ...n, isHighlighted: false }
          if (n.id === next?.id) return { ...n, isHighlighted: true }
          return { ...n, isHighlighted: false }
        }),
        message: `Traversal: Visiting node at position ${position} (value: ${next?.value})`,
      })

      current = next
    }

    // Final step
    steps.push({
      nodes: nodesCopy.map((n) => ({ ...n, isHighlighted: false })),
      message: `Traversal complete: Visited ${position + 1} nodes`,
    })

    return steps
  }

  const animateOperation = (steps: Array<{ nodes: Node[]; message: string }>) => {
    if (currentStepIndex >= steps.length) {
      onOperationComplete()
      return
    }

    const { nodes: stepNodes, message: stepMessage } = steps[currentStepIndex]
    setNodes(stepNodes)
    setMessage(stepMessage)

    const nextIndex = currentStepIndex + 1
    setCurrentStepIndex(nextIndex)

    // Calculate delay based on speed
    const delay = Math.max(200, 1000 - speed * 10)

    if (nextIndex < steps.length) {
      operationTimeoutId.current = setTimeout(() => {
        animateOperation(steps)
      }, delay)
    } else {
      setTimeout(() => {
        onOperationComplete()
      }, delay)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`flex flex-col items-center ${
                node.isHighlighted ? "ring-2 ring-yellow-500" : node.isFound ? "ring-2 ring-green-500" : ""
              }`}
            >
              <div className="relative">
                {node.isHead && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold">HEAD</div>
                )}
                {node.isTail && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold">TAIL</div>
                )}
                <div
                  className={`w-16 h-16 border-2 rounded-full flex items-center justify-center text-lg font-bold ${
                    node.isHighlighted
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : node.isFound
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-background"
                  }`}
                >
                  {node.value}
                </div>
              </div>
              <div className="flex items-center mt-2">
                {listType === "doubly" && node.prev !== null && (
                  <div className="flex items-center mr-1">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                )}
                {node.next !== null && (
                  <div className="flex items-center ml-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-md bg-muted/30">
        <p className="font-medium">{message || "Select an operation and click 'Execute Operation'"}</p>
      </div>
    </div>
  )
}
