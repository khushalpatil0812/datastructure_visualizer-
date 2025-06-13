"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface Node {
  id: string
  x: number
  y: number
  label: string
  isVisited?: boolean
  isProcessing?: boolean
  isStart?: boolean
  isEnd?: boolean
  distance?: number
}

interface Edge {
  source: string
  target: string
  weight: number
  isVisited?: boolean
}

interface GraphVisualizerProps {
  algorithm: string
  isDirected: boolean
  isWeighted: boolean
  isRunning: boolean
  speed: number
  onAlgorithmComplete: () => void
}

export function GraphVisualizer({
  algorithm,
  isDirected,
  isWeighted,
  isRunning,
  speed,
  onAlgorithmComplete,
}: GraphVisualizerProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [startNode, setStartNode] = useState<string | null>(null)
  const [endNode, setEndNode] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")
  const [metrics, setMetrics] = useState({
    steps: 0,
    visited: 0,
    totalWeight: 0,
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const algorithmTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const animationSteps = useRef<
    Array<{
      nodes: Node[]
      edges: Edge[]
      message: string
      metrics: { steps: number; visited: number; totalWeight: number }
    }>
  >([])
  const currentStepIndex = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const draggedNode = useRef<string | null>(null)

  // Initialize with a default graph
  useEffect(() => {
    const defaultNodes: Node[] = [
      { id: "A", x: 100, y: 100, label: "A" },
      { id: "B", x: 250, y: 100, label: "B" },
      { id: "C", x: 400, y: 100, label: "C" },
      { id: "D", x: 100, y: 250, label: "D" },
      { id: "E", x: 250, y: 250, label: "E" },
      { id: "F", x: 400, y: 250, label: "F" },
    ]

    const defaultEdges: Edge[] = [
      { source: "A", target: "B", weight: 4 },
      { source: "A", target: "D", weight: 2 },
      { source: "B", target: "C", weight: 3 },
      { source: "B", target: "E", weight: 3 },
      { source: "C", target: "F", weight: 2 },
      { source: "D", target: "E", weight: 1 },
      { source: "E", target: "F", weight: 5 },
    ]

    setNodes(defaultNodes)
    setEdges(defaultEdges)
    setStartNode("A")
    setEndNode("F")
  }, [])

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.id === edge.source)
      const target = nodes.find((n) => n.id === edge.target)
      if (!source || !target) return

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)

      // Set edge style
      if (edge.isVisited) {
        ctx.strokeStyle = "#22c55e" // Green for visited edges
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = "#64748b" // Default edge color
        ctx.lineWidth = 2
      }

      ctx.stroke()

      // Draw arrow for directed graphs
      if (isDirected) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x)
        const arrowSize = 10
        const arrowX = target.x - 15 * Math.cos(angle)
        const arrowY = target.y - 15 * Math.sin(angle)

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle - Math.PI / 6),
        )
        ctx.lineTo(
          arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
          arrowY - arrowSize * Math.sin(angle + Math.PI / 6),
        )
        ctx.closePath()
        ctx.fillStyle = edge.isVisited ? "#22c55e" : "#64748b"
        ctx.fill()
      }

      // Draw weight for weighted graphs
      if (isWeighted) {
        const midX = (source.x + target.x) / 2
        const midY = (source.y + target.y) / 2
        const offset = 15
        const angle = Math.atan2(target.y - source.y, target.x - source.x)
        const perpX = midX + offset * Math.sin(angle)
        const perpY = midY - offset * Math.cos(angle)

        ctx.fillStyle = "#f8fafc" // Background color for weight
        ctx.beginPath()
        ctx.arc(perpX, perpY, 12, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#0f172a" // Text color for weight
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(edge.weight.toString(), perpX, perpY)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI)

      // Set node style based on state
      if (node.isProcessing) {
        ctx.fillStyle = "#eab308" // Yellow for processing nodes
      } else if (node.isVisited) {
        ctx.fillStyle = "#22c55e" // Green for visited nodes
      } else if (node.id === startNode) {
        ctx.fillStyle = "#3b82f6" // Blue for start node
      } else if (node.id === endNode) {
        ctx.fillStyle = "#ef4444" // Red for end node
      } else {
        ctx.fillStyle = "#94a3b8" // Default node color
      }

      ctx.fill()

      // Node border
      ctx.strokeStyle = node.id === selectedNode ? "#0f172a" : "#475569"
      ctx.lineWidth = node.id === selectedNode ? 3 : 2
      ctx.stroke()

      // Node label
      ctx.fillStyle = "#ffffff"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, node.x, node.y)

      // Display distance for Dijkstra's algorithm
      if (algorithm === "dijkstra" && node.distance !== undefined && node.distance !== Number.POSITIVE_INFINITY) {
        ctx.fillStyle = "#f8fafc"
        ctx.beginPath()
        ctx.arc(node.x + 20, node.y - 20, 15, 0, 2 * Math.PI)
        ctx.fill()
        ctx.strokeStyle = "#475569"
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.fillStyle = "#0f172a"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.distance.toString(), node.x + 20, node.y - 20)
      }
    })
  }, [nodes, edges, selectedNode, startNode, endNode, isDirected, isWeighted, algorithm])

  // Handle mouse events for node interaction
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      if (isRunning) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if a node was clicked
      const clickedNode = nodes.find((node) => Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) <= 20)

      if (clickedNode) {
        setSelectedNode(clickedNode.id)
        isDragging.current = true
        draggedNode.current = clickedNode.id
      } else {
        setSelectedNode(null)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !draggedNode.current || isRunning) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setNodes((prevNodes) => prevNodes.map((node) => (node.id === draggedNode.current ? { ...node, x, y } : node)))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      draggedNode.current = null
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [nodes, isRunning])

  // Start or stop algorithm based on isRunning
  useEffect(() => {
    if (isRunning) {
      startAlgorithm()
    } else {
      if (algorithmTimeoutId.current) {
        clearTimeout(algorithmTimeoutId.current)
        algorithmTimeoutId.current = null
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }

    return () => {
      if (algorithmTimeoutId.current) {
        clearTimeout(algorithmTimeoutId.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isRunning, algorithm, startNode, endNode])

  const startAlgorithm = () => {
    // Reset animation state
    animationSteps.current = []
    currentStepIndex.current = 0

    // Reset nodes and edges
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        isVisited: false,
        isProcessing: false,
        distance: undefined,
      })),
    )
    setEdges((prevEdges) =>
      prevEdges.map((edge) => ({
        ...edge,
        isVisited: false,
      })),
    )

    setMetrics({
      steps: 0,
      visited: 0,
      totalWeight: 0,
    })

    if (!startNode) {
      setMessage("Please select a start node")
      onAlgorithmComplete()
      return
    }

    if (algorithm === "dijkstra" && !endNode) {
      setMessage("Please select an end node for Dijkstra's algorithm")
      onAlgorithmComplete()
      return
    }

    // Generate algorithm steps
    switch (algorithm) {
      case "bfs":
        runBFS()
        break
      case "dfs":
        runDFS()
        break
      case "dijkstra":
        runDijkstra()
        break
      default:
        setMessage("Algorithm not implemented")
        onAlgorithmComplete()
    }
  }

  const runBFS = () => {
    if (!startNode) return

    const steps: Array<{
      nodes: Node[]
      edges: Edge[]
      message: string
      metrics: { steps: number; visited: number; totalWeight: number }
    }> = []

    // Create a copy of nodes and edges for animation
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]
    const edgesCopy = JSON.parse(JSON.stringify(edges)) as Edge[]

    // Create adjacency list
    const adjacencyList = new Map<string, string[]>()
    nodes.forEach((node) => {
      adjacencyList.set(node.id, [])
    })

    edges.forEach((edge) => {
      adjacencyList.get(edge.source)?.push(edge.target)
      if (!isDirected) {
        adjacencyList.get(edge.target)?.push(edge.source)
      }
    })

    // BFS algorithm
    const queue: string[] = [startNode]
    const visited = new Set<string>([startNode])
    let stepCount = 0
    let visitedCount = 1

    // Mark start node as processing
    const startNodeIndex = nodesCopy.findIndex((n) => n.id === startNode)
    if (startNodeIndex !== -1) {
      nodesCopy[startNodeIndex].isProcessing = true
    }

    steps.push({
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      edges: JSON.parse(JSON.stringify(edgesCopy)),
      message: `Starting BFS from node ${startNode}`,
      metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
    })

    while (queue.length > 0) {
      const current = queue.shift()!
      stepCount++

      // Mark current node as visited
      const currentNodeIndex = nodesCopy.findIndex((n) => n.id === current)
      if (currentNodeIndex !== -1) {
        nodesCopy[currentNodeIndex].isProcessing = false
        nodesCopy[currentNodeIndex].isVisited = true
      }

      steps.push({
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        edges: JSON.parse(JSON.stringify(edgesCopy)),
        message: `Visited node ${current}`,
        metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
      })

      // Process neighbors
      const neighbors = adjacencyList.get(current) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
          visited.add(neighbor)
          visitedCount++

          // Mark neighbor as processing
          const neighborNodeIndex = nodesCopy.findIndex((n) => n.id === neighbor)
          if (neighborNodeIndex !== -1) {
            nodesCopy[neighborNodeIndex].isProcessing = true
          }

          // Mark edge as visited
          const edgeIndex = edgesCopy.findIndex(
            (e) =>
              (e.source === current && e.target === neighbor) ||
              (!isDirected && e.source === neighbor && e.target === current),
          )
          if (edgeIndex !== -1) {
            edgesCopy[edgeIndex].isVisited = true
          }

          steps.push({
            nodes: JSON.parse(JSON.stringify(nodesCopy)),
            edges: JSON.parse(JSON.stringify(edgesCopy)),
            message: `Added node ${neighbor} to queue`,
            metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
          })
        }
      }
    }

    // Add final step
    steps.push({
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      edges: JSON.parse(JSON.stringify(edgesCopy)),
      message: `BFS complete. Visited ${visitedCount} nodes in ${stepCount} steps.`,
      metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runDFS = () => {
    if (!startNode) return

    const steps: Array<{
      nodes: Node[]
      edges: Edge[]
      message: string
      metrics: { steps: number; visited: number; totalWeight: number }
    }> = []

    // Create a copy of nodes and edges for animation
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]
    const edgesCopy = JSON.parse(JSON.stringify(edges)) as Edge[]

    // Create adjacency list
    const adjacencyList = new Map<string, string[]>()
    nodes.forEach((node) => {
      adjacencyList.set(node.id, [])
    })

    edges.forEach((edge) => {
      adjacencyList.get(edge.source)?.push(edge.target)
      if (!isDirected) {
        adjacencyList.get(edge.target)?.push(edge.source)
      }
    })

    // DFS algorithm
    const visited = new Set<string>()
    let stepCount = 0
    let visitedCount = 0

    // Mark start node as processing
    const startNodeIndex = nodesCopy.findIndex((n) => n.id === startNode)
    if (startNodeIndex !== -1) {
      nodesCopy[startNodeIndex].isProcessing = true
    }

    steps.push({
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      edges: JSON.parse(JSON.stringify(edgesCopy)),
      message: `Starting DFS from node ${startNode}`,
      metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
    })

    const dfs = (node: string) => {
      visited.add(node)
      visitedCount++
      stepCount++

      // Mark node as visited
      const nodeIndex = nodesCopy.findIndex((n) => n.id === node)
      if (nodeIndex !== -1) {
        nodesCopy[nodeIndex].isProcessing = false
        nodesCopy[nodeIndex].isVisited = true
      }

      steps.push({
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        edges: JSON.parse(JSON.stringify(edgesCopy)),
        message: `Visited node ${node}`,
        metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
      })

      const neighbors = adjacencyList.get(node) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // Mark neighbor as processing
          const neighborNodeIndex = nodesCopy.findIndex((n) => n.id === neighbor)
          if (neighborNodeIndex !== -1) {
            nodesCopy[neighborNodeIndex].isProcessing = true
          }

          // Mark edge as visited
          const edgeIndex = edgesCopy.findIndex(
            (e) =>
              (e.source === node && e.target === neighbor) ||
              (!isDirected && e.source === neighbor && e.target === node),
          )
          if (edgeIndex !== -1) {
            edgesCopy[edgeIndex].isVisited = true
          }

          steps.push({
            nodes: JSON.parse(JSON.stringify(nodesCopy)),
            edges: JSON.parse(JSON.stringify(edgesCopy)),
            message: `Exploring node ${neighbor}`,
            metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
          })

          dfs(neighbor)
        }
      }
    }

    dfs(startNode)

    // Add final step
    steps.push({
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      edges: JSON.parse(JSON.stringify(edgesCopy)),
      message: `DFS complete. Visited ${visitedCount} nodes in ${stepCount} steps.`,
      metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
    })

    animationSteps.current = steps
    playAnimationSteps()
  }

  const runDijkstra = () => {
    if (!startNode || !endNode) return

    const steps: Array<{
      nodes: Node[]
      edges: Edge[]
      message: string
      metrics: { steps: number; visited: number; totalWeight: number }
    }> = []

    // Create a copy of nodes and edges for animation
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as Node[]
    const edgesCopy = JSON.parse(JSON.stringify(edges)) as Edge[]

    // Create adjacency list with weights
    const adjacencyList = new Map<string, Array<{ node: string; weight: number }>>()
    nodes.forEach((node) => {
      adjacencyList.set(node.id, [])
    })

    edges.forEach((edge) => {
      adjacencyList.get(edge.source)?.push({ node: edge.target, weight: edge.weight })
      if (!isDirected) {
        adjacencyList.get(edge.target)?.push({ node: edge.source, weight: edge.weight })
      }
    })

    // Dijkstra's algorithm
    const distances = new Map<string, number>()
    const previous = new Map<string, string | null>()
    const unvisited = new Set<string>()

    // Initialize distances
    nodes.forEach((node) => {
      distances.set(node.id, node.id === startNode ? 0 : Number.POSITIVE_INFINITY)
      previous.set(node.id, null)
      unvisited.add(node.id)

      // Set initial distance in node copy
      const nodeIndex = nodesCopy.findIndex((n) => n.id === node.id)
      if (nodeIndex !== -1) {
        nodesCopy[nodeIndex].distance = node.id === startNode ? 0 : Number.POSITIVE_INFINITY
      }
    })

    // Mark start node as processing
    const startNodeIndex = nodesCopy.findIndex((n) => n.id === startNode)
    if (startNodeIndex !== -1) {
      nodesCopy[startNodeIndex].isProcessing = true
    }

    steps.push({
      nodes: JSON.parse(JSON.stringify(nodesCopy)),
      edges: JSON.parse(JSON.stringify(edgesCopy)),
      message: `Starting Dijkstra's algorithm from node ${startNode}`,
      metrics: { steps: 0, visited: 0, totalWeight: 0 },
    })

    let stepCount = 0
    let visitedCount = 0
    let totalWeight = 0

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minDistance = Number.POSITIVE_INFINITY
      let current: string | null = null

      for (const node of unvisited) {
        const distance = distances.get(node) || Number.POSITIVE_INFINITY
        if (distance < minDistance) {
          minDistance = distance
          current = node
        }
      }

      if (current === null || distances.get(current) === Number.POSITIVE_INFINITY) {
        // No path to remaining nodes
        break
      }

      stepCount++
      visitedCount++

      // Mark current node as visited
      unvisited.delete(current)
      const currentNodeIndex = nodesCopy.findIndex((n) => n.id === current)
      if (currentNodeIndex !== -1) {
        nodesCopy[currentNodeIndex].isProcessing = false
        nodesCopy[currentNodeIndex].isVisited = true
      }

      steps.push({
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        edges: JSON.parse(JSON.stringify(edgesCopy)),
        message: `Visiting node ${current} with distance ${distances.get(current)}`,
        metrics: { steps: stepCount, visited: visitedCount, totalWeight },
      })

      // If we reached the end node, we're done
      if (current === endNode) {
        break
      }

      // Update distances to neighbors
      const neighbors = adjacencyList.get(current) || []
      for (const { node: neighbor, weight } of neighbors) {
        if (unvisited.has(neighbor)) {
          const alt = (distances.get(current) || 0) + weight
          if (alt < (distances.get(neighbor) || Number.POSITIVE_INFINITY)) {
            distances.set(neighbor, alt)
            previous.set(neighbor, current)

            // Update distance in node copy
            const neighborNodeIndex = nodesCopy.findIndex((n) => n.id === neighbor)
            if (neighborNodeIndex !== -1) {
              nodesCopy[neighborNodeIndex].distance = alt
              nodesCopy[neighborNodeIndex].isProcessing = true
            }

            steps.push({
              nodes: JSON.parse(JSON.stringify(nodesCopy)),
              edges: JSON.parse(JSON.stringify(edgesCopy)),
              message: `Updated distance to node ${neighbor}: ${alt}`,
              metrics: { steps: stepCount, visited: visitedCount, totalWeight },
            })
          }
        }
      }
    }

    // Reconstruct path
    if (distances.get(endNode) !== Number.POSITIVE_INFINITY) {
      const path: string[] = []
      let current = endNode
      totalWeight = distances.get(endNode) || 0

      while (current) {
        path.unshift(current)
        const prev = previous.get(current)
        if (prev) {
          // Mark edge as part of path
          const edgeIndex = edgesCopy.findIndex(
            (e) =>
              (e.source === prev && e.target === current) || (!isDirected && e.source === current && e.target === prev),
          )
          if (edgeIndex !== -1) {
            edgesCopy[edgeIndex].isVisited = true
          }
        }
        current = prev || ""
      }

      steps.push({
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        edges: JSON.parse(JSON.stringify(edgesCopy)),
        message: `Shortest path found: ${path.join(" → ")} with total weight ${totalWeight}`,
        metrics: { steps: stepCount, visited: visitedCount, totalWeight },
      })
    } else {
      steps.push({
        nodes: JSON.parse(JSON.stringify(nodesCopy)),
        edges: JSON.parse(JSON.stringify(edgesCopy)),
        message: `No path found from ${startNode} to ${endNode}`,
        metrics: { steps: stepCount, visited: visitedCount, totalWeight: 0 },
      })
    }

    animationSteps.current = steps
    playAnimationSteps()
  }

  const playAnimationSteps = () => {
    if (currentStepIndex.current >= animationSteps.current.length) {
      onAlgorithmComplete()
      return
    }

    const step = animationSteps.current[currentStepIndex.current]
    setNodes(step.nodes)
    setEdges(step.edges)
    setMessage(step.message)
    setMetrics(step.metrics)

    currentStepIndex.current++

    // Calculate delay based on speed (invert the speed so higher = faster)
    const delay = Math.max(200, 2000 - speed * 20)

    algorithmTimeoutId.current = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(playAnimationSteps)
    }, delay)
  }

  const handleAddNode = () => {
    if (isRunning) return

    // Generate a new node ID (next letter in alphabet)
    const lastNodeId = nodes.length > 0 ? nodes[nodes.length - 1].id : "@"
    const nextNodeId = String.fromCharCode(lastNodeId.charCodeAt(0) + 1)

    // Add node in a random position
    const newNode: Node = {
      id: nextNodeId,
      x: Math.random() * 400 + 100,
      y: Math.random() * 200 + 100,
      label: nextNodeId,
    }

    setNodes([...nodes, newNode])
  }

  const handleRemoveNode = () => {
    if (isRunning || !selectedNode) return

    // Remove the selected node
    setNodes(nodes.filter((node) => node.id !== selectedNode))

    // Remove all edges connected to this node
    setEdges(edges.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode))

    // Update start/end nodes if necessary
    if (selectedNode === startNode) setStartNode(null)
    if (selectedNode === endNode) setEndNode(null)

    setSelectedNode(null)
  }

  const handleAddEdge = () => {
    if (isRunning || !selectedNode) return

    // Prompt for target node and weight
    const targetNodeId = prompt("Enter target node ID:")
    if (!targetNodeId) return

    const targetNode = nodes.find((node) => node.id === targetNodeId)
    if (!targetNode) {
      alert("Target node not found")
      return
    }

    // Check if edge already exists
    const edgeExists = edges.some(
      (edge) =>
        (edge.source === selectedNode && edge.target === targetNodeId) ||
        (!isDirected && edge.source === targetNodeId && edge.target === selectedNode),
    )

    if (edgeExists) {
      alert("Edge already exists")
      return
    }

    let weight = 1
    if (isWeighted) {
      const weightInput = prompt("Enter edge weight:", "1")
      if (weightInput === null) return
      weight = Number.parseInt(weightInput) || 1
    }

    // Add the new edge
    setEdges([
      ...edges,
      {
        source: selectedNode,
        target: targetNodeId,
        weight,
      },
    ])
  }

  const handleRemoveEdge = () => {
    if (isRunning || !selectedNode) return

    // Prompt for target node
    const targetNodeId = prompt("Enter target node ID to remove edge:")
    if (!targetNodeId) return

    // Remove the edge
    setEdges(
      edges.filter(
        (edge) =>
          !(
            (edge.source === selectedNode && edge.target === targetNodeId) ||
            (!isDirected && edge.source === targetNodeId && edge.target === selectedNode)
          ),
      ),
    )
  }

  const handleSetStartNode = () => {
    if (isRunning || !selectedNode) return
    setStartNode(selectedNode)
  }

  const handleSetEndNode = () => {
    if (isRunning || !selectedNode) return
    setEndNode(selectedNode)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative border rounded-md overflow-hidden">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full bg-slate-50 dark:bg-slate-900" />
        <div className="absolute top-2 left-2 bg-background/80 p-2 rounded-md backdrop-blur-sm">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>

      {/* Metrics display */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Steps</div>
          <div className="text-2xl font-bold">{metrics.steps}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Nodes Visited</div>
          <div className="text-2xl font-bold">{metrics.visited}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">
            {algorithm === "dijkstra" ? "Path Weight" : "Total Weight"}
          </div>
          <div className="text-2xl font-bold">{metrics.totalWeight}</div>
        </div>
      </div>

      {/* Graph editing controls */}
      {!isRunning && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={handleAddNode}>
            Add Node
          </Button>
          <Button size="sm" onClick={handleRemoveNode} disabled={!selectedNode}>
            Remove Node
          </Button>
          <Button size="sm" onClick={handleAddEdge} disabled={!selectedNode}>
            Add Edge
          </Button>
          <Button size="sm" onClick={handleRemoveEdge} disabled={!selectedNode}>
            Remove Edge
          </Button>
          <Button size="sm" onClick={handleSetStartNode} disabled={!selectedNode}>
            Set as Start
          </Button>
          <Button size="sm" onClick={handleSetEndNode} disabled={!selectedNode}>
            Set as End
          </Button>
        </div>
      )}

      {/* Selected node info */}
      {selectedNode && !isRunning && (
        <div className="mt-2 p-2 border rounded-md">
          <p className="text-sm">
            Selected: <span className="font-medium">{selectedNode}</span>
            {selectedNode === startNode && " (Start)"}
            {selectedNode === endNode && " (End)"}
          </p>
        </div>
      )}
    </div>
  )
}
