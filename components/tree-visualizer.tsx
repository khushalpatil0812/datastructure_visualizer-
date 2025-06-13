"use client"

import { useEffect, useState, useRef } from "react"

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  x?: number
  y?: number
  isHighlighted?: boolean
  isVisited?: boolean
  isProcessing?: boolean
}

interface TreeVisualizerProps {
  operation: string
  value: number | null
  isRunning: boolean
  speed: number
  onOperationComplete: () => void
}

export function TreeVisualizer({ operation, value, isRunning, speed, onOperationComplete }: TreeVisualizerProps) {
  const [root, setRoot] = useState<TreeNode | null>(null)
  const [message, setMessage] = useState<string>("")
  const [metrics, setMetrics] = useState({
    nodes: 0,
    height: 0,
    steps: 0,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const operationTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const animationSteps = useRef<
    Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }>
  >([])
  const currentStepIndex = useRef<number>(0)

  // Initialize with a sample tree
  useEffect(() => {
    const sampleTree = createSampleTree()
    setRoot(sampleTree)
    calculateNodePositions(sampleTree)
    updateMetrics(sampleTree)
  }, [])

  // Draw the tree
  useEffect(() => {
    if (!root) return
    drawTree()
  }, [root])

  // Start or stop operation based on isRunning
  useEffect(() => {
    if (isRunning && value !== null) {
      startOperation()
    } else {
      if (operationTimeoutId.current) {
        clearTimeout(operationTimeoutId.current)
        operationTimeoutId.current = null
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }

    return () => {
      if (operationTimeoutId.current) {
        clearTimeout(operationTimeoutId.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isRunning, operation, value])

  const createSampleTree = (): TreeNode => {
    return {
      value: 50,
      left: {
        value: 30,
        left: {
          value: 20,
          left: null,
          right: null,
        },
        right: {
          value: 40,
          left: null,
          right: null,
        },
      },
      right: {
        value: 70,
        left: {
          value: 60,
          left: null,
          right: null,
        },
        right: {
          value: 80,
          left: null,
          right: null,
        },
      },
    }
  }

  const calculateNodePositions = (node: TreeNode | null, x = 400, y = 50, level = 0, offset = 200): void => {
    if (!node) return

    node.x = x
    node.y = y

    const nextOffset = offset / 2

    if (node.left) {
      calculateNodePositions(node.left, x - offset, y + 80, level + 1, nextOffset)
    }

    if (node.right) {
      calculateNodePositions(node.right, x + offset, y + 80, level + 1, nextOffset)
    }
  }

  const updateMetrics = (root: TreeNode | null): void => {
    const nodeCount = countNodes(root)
    const treeHeight = calculateHeight(root)

    setMetrics((prev) => ({
      ...prev,
      nodes: nodeCount,
      height: treeHeight,
    }))
  }

  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0
    return 1 + countNodes(node.left) + countNodes(node.right)
  }

  const calculateHeight = (node: TreeNode | null): number => {
    if (!node) return 0
    return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right))
  }

  const drawTree = () => {
    const canvas = canvasRef.current
    if (!canvas || !root) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges first
    drawEdges(ctx, root)

    // Then draw nodes
    drawNodes(ctx, root)
  }

  const drawEdges = (ctx: CanvasRenderingContext2D, node: TreeNode | null) => {
    if (!node) return

    if (
      node.left &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.left.x !== undefined &&
      node.left.y !== undefined
    ) {
      ctx.beginPath()
      ctx.moveTo(node.x, node.y)
      ctx.lineTo(node.left.x, node.left.y)
      ctx.strokeStyle = node.left.isHighlighted ? "#eab308" : "#64748b"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    if (
      node.right &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.right.x !== undefined &&
      node.right.y !== undefined
    ) {
      ctx.beginPath()
      ctx.moveTo(node.x, node.y)
      ctx.lineTo(node.right.x, node.right.y)
      ctx.strokeStyle = node.right.isHighlighted ? "#eab308" : "#64748b"
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Recursively draw edges for children
    if (node.left) drawEdges(ctx, node.left)
    if (node.right) drawEdges(ctx, node.right)
  }

  const drawNodes = (ctx: CanvasRenderingContext2D, node: TreeNode | null) => {
    if (!node || node.x === undefined || node.y === undefined) return

    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI)

    // Set node style based on state
    if (node.isProcessing) {
      ctx.fillStyle = "#eab308" // Yellow for processing nodes
    } else if (node.isVisited) {
      ctx.fillStyle = "#22c55e" // Green for visited nodes
    } else if (node.isHighlighted) {
      ctx.fillStyle = "#3b82f6" // Blue for highlighted nodes
    } else {
      ctx.fillStyle = "#94a3b8" // Default node color
    }

    ctx.fill()
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw node value
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(node.value.toString(), node.x, node.y)

    // Recursively draw nodes for children
    if (node.left) drawNodes(ctx, node.left)
    if (node.right) drawNodes(ctx, node.right)
  }

  const startOperation = () => {
    // Reset animation state
    animationSteps.current = []
    currentStepIndex.current = 0

    // Reset tree state
    const resetTree = deepCopyTree(root)
    resetTreeState(resetTree)
    setRoot(resetTree)

    setMetrics((prev) => ({
      ...prev,
      steps: 0,
    }))

    if (value === null) {
      setMessage("Please enter a value")
      onOperationComplete()
      return
    }

    // Generate operation steps
    switch (operation) {
      case "insert":
        runInsert(value)
        break
      case "delete":
        runDelete(value)
        break
      case "search":
        runSearch(value)
        break
      case "inorder":
        runInorderTraversal()
        break
      case "preorder":
        runPreorderTraversal()
        break
      case "postorder":
        runPostorderTraversal()
        break
      default:
        setMessage("Operation not implemented")
        onOperationComplete()
    }
  }

  const deepCopyTree = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null
    return {
      value: node.value,
      left: deepCopyTree(node.left),
      right: deepCopyTree(node.right),
      x: node.x,
      y: node.y,
      isHighlighted: false,
      isVisited: false,
      isProcessing: false,
    }
  }

  const resetTreeState = (node: TreeNode | null): void => {
    if (!node) return
    node.isHighlighted = false
    node.isVisited = false
    node.isProcessing = false
    if (node.left) resetTreeState(node.left)
    if (node.right) resetTreeState(node.right)
  }

  const runInsert = (value: number) => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    let treeCopy = deepCopyTree(root)
    let stepCount = 0

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Starting insertion of value ${value}`,
      metrics: { ...metrics, steps: stepCount },
    })

    // Insert function with animation steps
    const insert = (node: TreeNode | null, val: number): TreeNode => {
      stepCount++

      if (!node) {
        const newNode: TreeNode = {
          value: val,
          left: null,
          right: null,
          isHighlighted: true,
        }

        steps.push({
          tree: deepCopyTree(newNode),
          message: `Created new node with value ${val}`,
          metrics: { nodes: metrics.nodes + 1, height: 1, steps: stepCount },
        })

        return newNode
      }

      // Highlight current node
      node.isProcessing = true
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Comparing ${val} with ${node.value}`,
        metrics: { ...metrics, steps: stepCount },
      })

      if (val < node.value) {
        // Go left
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} < ${node.value}, going left`,
          metrics: { ...metrics, steps: stepCount },
        })

        node.left = insert(node.left, val)
      } else if (val > node.value) {
        // Go right
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} > ${node.value}, going right`,
          metrics: { ...metrics, steps: stepCount },
        })

        node.right = insert(node.right, val)
      } else {
        // Value already exists
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Value ${val} already exists in the tree`,
          metrics: { ...metrics, steps: stepCount },
        })
      }

      return node
    }

    // Perform insertion
    treeCopy = insert(treeCopy, value)

    // Calculate new positions for the updated tree
    calculateNodePositions(treeCopy)

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Insertion complete: Value ${value} inserted into the tree`,
      metrics: {
        nodes: countNodes(treeCopy),
        height: calculateHeight(treeCopy),
        steps: stepCount,
      },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runDelete = (value: number) => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    let treeCopy = deepCopyTree(root)
    let stepCount = 0
    let nodeDeleted = false

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Starting deletion of value ${value}`,
      metrics: { ...metrics, steps: stepCount },
    })

    // Helper function to find the minimum value node
    const findMinNode = (node: TreeNode): TreeNode => {
      let current = node

      // Highlight nodes as we traverse to find minimum
      while (current.left) {
        current.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Looking for minimum value in right subtree, checking ${current.value}`,
          metrics: { ...metrics, steps: stepCount },
        })

        current.isProcessing = false
        current.isHighlighted = true
        current = current.left
        stepCount++
      }

      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Found minimum value: ${current.value}`,
        metrics: { ...metrics, steps: stepCount },
      })

      return current
    }

    // Delete function with animation steps
    const deleteNode = (node: TreeNode | null, val: number): TreeNode | null => {
      if (!node) {
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Value ${val} not found in the tree`,
          metrics: { ...metrics, steps: stepCount },
        })
        return null
      }

      stepCount++

      // Highlight current node
      node.isProcessing = true
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Comparing ${val} with ${node.value}`,
        metrics: { ...metrics, steps: stepCount },
      })

      if (val < node.value) {
        // Go left
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} < ${node.value}, going left`,
          metrics: { ...metrics, steps: stepCount },
        })

        node.left = deleteNode(node.left, val)
      } else if (val > node.value) {
        // Go right
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} > ${node.value}, going right`,
          metrics: { ...metrics, steps: stepCount },
        })

        node.right = deleteNode(node.right, val)
      } else {
        // Found the node to delete
        nodeDeleted = true
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Found node with value ${val} to delete`,
          metrics: { ...metrics, steps: stepCount },
        })

        // Case 1: No children
        if (!node.left && !node.right) {
          steps.push({
            tree: deepCopyTree(treeCopy),
            message: `Node ${val} has no children, removing it`,
            metrics: { ...metrics, steps: stepCount },
          })
          return null
        }

        // Case 2: One child
        if (!node.left) {
          steps.push({
            tree: deepCopyTree(treeCopy),
            message: `Node ${val} has only right child, replacing with right child`,
            metrics: { ...metrics, steps: stepCount },
          })
          return node.right
        }

        if (!node.right) {
          steps.push({
            tree: deepCopyTree(treeCopy),
            message: `Node ${val} has only left child, replacing with left child`,
            metrics: { ...metrics, steps: stepCount },
          })
          return node.left
        }

        // Case 3: Two children
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Node ${val} has two children, finding successor`,
          metrics: { ...metrics, steps: stepCount },
        })

        // Find the inorder successor (smallest node in right subtree)
        const successor = findMinNode(node.right)

        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Replacing ${node.value} with successor ${successor.value}`,
          metrics: { ...metrics, steps: stepCount },
        })

        // Copy successor value
        node.value = successor.value

        // Delete the successor
        node.right = deleteNode(node.right, successor.value)
      }

      return node
    }

    // Perform deletion
    treeCopy = deleteNode(treeCopy, value)

    // Calculate new positions for the updated tree
    if (treeCopy) {
      calculateNodePositions(treeCopy)
    }

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: nodeDeleted
        ? `Deletion complete: Value ${value} removed from the tree`
        : `Deletion failed: Value ${value} not found in the tree`,
      metrics: {
        nodes: countNodes(treeCopy),
        height: calculateHeight(treeCopy),
        steps: stepCount,
      },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runSearch = (value: number) => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    const treeCopy = deepCopyTree(root)
    let stepCount = 0
    let found = false

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Starting search for value ${value}`,
      metrics: { ...metrics, steps: stepCount },
    })

    // Search function with animation steps
    const search = (node: TreeNode | null, val: number): void => {
      if (!node) {
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Value ${val} not found in the tree`,
          metrics: { ...metrics, steps: stepCount },
        })
        return
      }

      stepCount++

      // Highlight current node
      node.isProcessing = true
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Comparing ${val} with ${node.value}`,
        metrics: { ...metrics, steps: stepCount },
      })

      if (val === node.value) {
        // Found the value
        found = true
        node.isProcessing = false
        node.isVisited = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `Found value ${val} in the tree!`,
          metrics: { ...metrics, steps: stepCount },
        })
        return
      }

      if (val < node.value) {
        // Go left
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} < ${node.value}, going left`,
          metrics: { ...metrics, steps: stepCount },
        })

        search(node.left, val)
      } else {
        // Go right
        node.isProcessing = false
        node.isHighlighted = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `${val} > ${node.value}, going right`,
          metrics: { ...metrics, steps: stepCount },
        })

        search(node.right, val)
      }
    }

    // Perform search
    search(treeCopy, value)

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: found
        ? `Search complete: Value ${value} found in the tree`
        : `Search complete: Value ${value} not found in the tree`,
      metrics: { ...metrics, steps: stepCount },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runInorderTraversal = () => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    const treeCopy = deepCopyTree(root)
    let stepCount = 0
    const visitedValues: number[] = []

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: "Starting inorder traversal (Left -> Root -> Right)",
      metrics: { ...metrics, steps: stepCount },
    })

    // Inorder traversal function with animation steps
    const inorder = (node: TreeNode | null): void => {
      if (!node) return

      stepCount++

      // Visit left subtree
      if (node.left) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to left subtree first`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        inorder(node.left)
      }

      // Visit current node
      node.isVisited = true
      visitedValues.push(node.value)
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Visiting node ${node.value}, traversal so far: [${visitedValues.join(", ")}]`,
        metrics: { ...metrics, steps: stepCount },
      })

      // Visit right subtree
      if (node.right) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to right subtree`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        inorder(node.right)
      }
    }

    // Perform inorder traversal
    inorder(treeCopy)

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Inorder traversal complete: [${visitedValues.join(", ")}]`,
      metrics: { ...metrics, steps: stepCount },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runPreorderTraversal = () => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    const treeCopy = deepCopyTree(root)
    let stepCount = 0
    const visitedValues: number[] = []

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: "Starting preorder traversal (Root -> Left -> Right)",
      metrics: { ...metrics, steps: stepCount },
    })

    // Preorder traversal function with animation steps
    const preorder = (node: TreeNode | null): void => {
      if (!node) return

      stepCount++

      // Visit current node
      node.isVisited = true
      visitedValues.push(node.value)
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Visiting node ${node.value}, traversal so far: [${visitedValues.join(", ")}]`,
        metrics: { ...metrics, steps: stepCount },
      })

      // Visit left subtree
      if (node.left) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to left subtree`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        preorder(node.left)
      }

      // Visit right subtree
      if (node.right) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to right subtree`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        preorder(node.right)
      }
    }

    // Perform preorder traversal
    preorder(treeCopy)

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Preorder traversal complete: [${visitedValues.join(", ")}]`,
      metrics: { ...metrics, steps: stepCount },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runPostorderTraversal = () => {
    const steps: Array<{
      tree: TreeNode | null
      message: string
      metrics: { nodes: number; height: number; steps: number }
    }> = []

    // Create a copy of the tree for animation
    const treeCopy = deepCopyTree(root)
    let stepCount = 0
    const visitedValues: number[] = []

    // Add initial step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: "Starting postorder traversal (Left -> Right -> Root)",
      metrics: { ...metrics, steps: stepCount },
    })

    // Postorder traversal function with animation steps
    const postorder = (node: TreeNode | null): void => {
      if (!node) return

      stepCount++

      // Visit left subtree
      if (node.left) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to left subtree first`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        postorder(node.left)
      }

      // Visit right subtree
      if (node.right) {
        node.isProcessing = true
        steps.push({
          tree: deepCopyTree(treeCopy),
          message: `At node ${node.value}, going to right subtree`,
          metrics: { ...metrics, steps: stepCount },
        })
        node.isProcessing = false

        postorder(node.right)
      }

      // Visit current node
      node.isVisited = true
      visitedValues.push(node.value)
      steps.push({
        tree: deepCopyTree(treeCopy),
        message: `Visiting node ${node.value}, traversal so far: [${visitedValues.join(", ")}]`,
        metrics: { ...metrics, steps: stepCount },
      })
    }

    // Perform postorder traversal
    postorder(treeCopy)

    // Add final step
    steps.push({
      tree: deepCopyTree(treeCopy),
      message: `Postorder traversal complete: [${visitedValues.join(", ")}]`,
      metrics: { ...metrics, steps: stepCount },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const playAnimationSteps = () => {
    if (currentStepIndex.current >= animationSteps.current.length) {
      onOperationComplete()
      return
    }

    const step = animationSteps.current[currentStepIndex.current]
    setRoot(step.tree)
    setMessage(step.message)
    setMetrics(step.metrics)

    currentStepIndex.current++

    // Calculate delay based on speed (invert the speed so higher = faster)
    const delay = Math.max(200, 2000 - speed * 20)

    operationTimeoutId.current = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(playAnimationSteps)
    }, delay)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative border rounded-md overflow-hidden">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full bg-slate-50 dark:bg-slate-900" />
        <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md backdrop-blur-sm">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>

      {/* Metrics display */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Nodes</div>
          <div className="text-2xl font-bold">{metrics.nodes}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Height</div>
          <div className="text-2xl font-bold">{metrics.height}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Steps</div>
          <div className="text-2xl font-bold">{metrics.steps}</div>
        </div>
      </div>
    </div>
  )
}
