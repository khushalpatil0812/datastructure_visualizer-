import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchPseudocodeDisplayProps {
  algorithm: string
}

export function SearchPseudocodeDisplay({ algorithm }: SearchPseudocodeDisplayProps) {
  const getPseudocode = () => {
    switch (algorithm) {
      case "linear":
        return [
          "procedure linearSearch(A: list of items, target: item)",
          "    n = length(A)",
          "    for i = 0 to n-1 do",
          "        if A[i] = target then",
          "            return i",
          "        end if",
          "    end for",
          "    return -1  // Target not found",
          "end procedure",
        ]
      case "binary":
        return [
          "procedure binarySearch(A: sorted list of items, target: item)",
          "    left = 0",
          "    right = length(A) - 1",
          "    while left <= right do",
          "        mid = floor((left + right) / 2)",
          "        if A[mid] = target then",
          "            return mid",
          "        else if A[mid] < target then",
          "            left = mid + 1",
          "        else",
          "            right = mid - 1",
          "        end if",
          "    end while",
          "    return -1  // Target not found",
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
