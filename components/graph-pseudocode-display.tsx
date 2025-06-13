import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GraphPseudocodeDisplayProps {
  algorithm: string
}

export function GraphPseudocodeDisplay({ algorithm }: GraphPseudocodeDisplayProps) {
  const getPseudocode = () => {
    switch (algorithm) {
      case "bfs":
        return [
          "procedure BFS(G, startNode)",
          "    let Q be a queue",
          "    label startNode as visited",
          "    Q.enqueue(startNode)",
          "    while Q is not empty do",
          "        v = Q.dequeue()",
          "        for all edges from v to w in G.adjacentEdges(v) do",
          "            if w is not labeled as visited then",
          "                label w as visited",
          "                Q.enqueue(w)",
          "            end if",
          "        end for",
          "    end while",
          "end procedure",
        ]
      case "dfs":
        return [
          "procedure DFS(G, startNode)",
          "    label startNode as visited",
          "    for all edges from startNode to v in G.adjacentEdges(startNode) do",
          "        if v is not labeled as visited then",
          "            DFS(G, v)",
          "        end if",
          "    end for",
          "end procedure",
        ]
      case "dijkstra":
        return [
          "procedure Dijkstra(G, startNode)",
          "    for each vertex v in G do",
          "        dist[v] = infinity",
          "        prev[v] = undefined",
          "    end for",
          "    dist[startNode] = 0",
          "    let Q be a priority queue of vertices, ordered by dist values",
          "    add all vertices to Q",
          "    while Q is not empty do",
          "        u = vertex in Q with minimum dist[u]",
          "        remove u from Q",
          "        for each neighbor v of u do",
          "            alt = dist[u] + length(u, v)",
          "            if alt < dist[v] then",
          "                dist[v] = alt",
          "                prev[v] = u",
          "                update v's position in Q",
          "            end if",
          "        end for",
          "    end while",
          "    return dist, prev",
          "end procedure",
        ]
      default:
        return ["Select an algorithm to view its pseudocode"]
    }
  }

  const pseudocode = getPseudocode()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pseudocode</CardTitle>
        <CardDescription>Step-by-step algorithm implementation</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code className="text-sm font-mono">
            {pseudocode.map((line, index) => (
              <div key={index} className="whitespace-pre">
                {line}
              </div>
            ))}
          </code>
        </pre>
      </CardContent>
    </Card>
  )
}
