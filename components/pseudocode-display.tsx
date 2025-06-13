import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PseudocodeDisplayProps {
  algorithm: string
}

export function PseudocodeDisplay({ algorithm }: PseudocodeDisplayProps) {
  const getPseudocode = () => {
    switch (algorithm) {
      case "bubble":
        return [
          "procedure bubbleSort(A: list of sortable items)",
          "    n = length(A)",
          "    repeat",
          "        swapped = false",
          "        for i = 1 to n-1 inclusive do",
          "            if A[i-1] > A[i] then",
          "                swap(A[i-1], A[i])",
          "                swapped = true",
          "            end if",
          "        end for",
          "        n = n - 1",
          "    until not swapped",
          "end procedure",
        ]
      case "insertion":
        return [
          "procedure insertionSort(A: list of sortable items)",
          "    n = length(A)",
          "    for i = 1 to n-1 inclusive do",
          "        j = i",
          "        while j > 0 and A[j-1] > A[j] do",
          "            swap(A[j], A[j-1])",
          "            j = j - 1",
          "        end while",
          "    end for",
          "end procedure",
        ]
      case "selection":
        return [
          "procedure selectionSort(A: list of sortable items)",
          "    n = length(A)",
          "    for i = 0 to n-2 inclusive do",
          "        minIndex = i",
          "        for j = i+1 to n-1 inclusive do",
          "            if A[j] < A[minIndex] then",
          "                minIndex = j",
          "            end if",
          "        end for",
          "        if minIndex ≠ i then",
          "            swap(A[i], A[minIndex])",
          "        end if",
          "    end for",
          "end procedure",
        ]
      case "merge":
        return [
          "procedure mergeSort(A: list of sortable items, lo: integer, hi: integer)",
          "    if lo < hi then",
          "        mid = floor((lo + hi) / 2)",
          "        mergeSort(A, lo, mid)",
          "        mergeSort(A, mid + 1, hi)",
          "        merge(A, lo, mid, hi)",
          "    end if",
          "end procedure",
          "",
          "procedure merge(A: list of sortable items, lo: integer, mid: integer, hi: integer)",
          "    create temporary arrays L and R",
          "    copy A[lo..mid] to L and A[mid+1..hi] to R",
          "    i = 0, j = 0, k = lo",
          "    while i < length(L) and j < length(R) do",
          "        if L[i] <= R[j] then",
          "            A[k] = L[i]",
          "            i = i + 1",
          "        else",
          "            A[k] = R[j]",
          "            j = j + 1",
          "        end if",
          "        k = k + 1",
          "    end while",
          "    copy remaining elements of L and R to A",
          "end procedure",
        ]
      case "quick":
        return [
          "procedure quickSort(A: list of sortable items, lo: integer, hi: integer)",
          "    if lo < hi then",
          "        p = partition(A, lo, hi)",
          "        quickSort(A, lo, p - 1)",
          "        quickSort(A, p + 1, hi)",
          "    end if",
          "end procedure",
          "",
          "procedure partition(A: list of sortable items, lo: integer, hi: integer)",
          "    pivot = A[hi]",
          "    i = lo - 1",
          "    for j = lo to hi - 1 do",
          "        if A[j] < pivot then",
          "            i = i + 1",
          "            swap(A[i], A[j])",
          "        end if",
          "    end for",
          "    swap(A[i + 1], A[hi])",
          "    return i + 1",
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
