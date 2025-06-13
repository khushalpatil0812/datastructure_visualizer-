"use client"

import { useEffect, useState, useRef } from "react"

interface SortingVisualizerProps {
  array: number[]
  algorithm: string
  isRunning: boolean
  speed: number
  onSortingComplete: () => void
}

interface ArrayState {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
  passes: number
  comparisons: number
  swaps: number
}

export function SortingVisualizer({ array, algorithm, isRunning, speed, onSortingComplete }: SortingVisualizerProps) {
  const [arrayState, setArrayState] = useState<ArrayState>({
    array: [...array],
    comparing: [],
    swapping: [],
    sorted: [],
    passes: 0,
    comparisons: 0,
    swaps: 0,
  })
  const animationFrameId = useRef<number | null>(null)
  const sortingTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const animationSteps = useRef<ArrayState[]>([])
  const currentStepIndex = useRef<number>(0)

  // Reset state when array changes
  useEffect(() => {
    setArrayState({
      array: [...array],
      comparing: [],
      swapping: [],
      sorted: [],
      passes: 0,
      comparisons: 0,
      swaps: 0,
    })
    animationSteps.current = []
    currentStepIndex.current = 0

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    if (sortingTimeoutId.current) {
      clearTimeout(sortingTimeoutId.current)
      sortingTimeoutId.current = null
    }
  }, [array])

  // Start or stop sorting based on isRunning
  useEffect(() => {
    if (isRunning) {
      startSorting()
    } else {
      if (sortingTimeoutId.current) {
        clearTimeout(sortingTimeoutId.current)
        sortingTimeoutId.current = null
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }

    return () => {
      if (sortingTimeoutId.current) {
        clearTimeout(sortingTimeoutId.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isRunning, algorithm])

  const startSorting = () => {
    // If we already have animation steps, just continue playing them
    if (animationSteps.current.length > 0 && currentStepIndex.current < animationSteps.current.length) {
      playAnimationSteps()
      return
    }

    // Otherwise, generate new animation steps
    const arrayCopy = [...array]
    animationSteps.current = []
    currentStepIndex.current = 0

    switch (algorithm) {
      case "bubble":
        bubbleSort(arrayCopy)
        break
      case "insertion":
        insertionSort(arrayCopy)
        break
      case "selection":
        selectionSort(arrayCopy)
        break
      case "merge":
        mergeSort(arrayCopy, 0, arrayCopy.length - 1)
        break
      case "quick":
        quickSort(arrayCopy, 0, arrayCopy.length - 1)
        break
      default:
        bubbleSort(arrayCopy)
    }

    // Add final state with all elements sorted
    const lastStep = animationSteps.current[animationSteps.current.length - 1]
    animationSteps.current.push({
      array: lastStep?.array || arrayCopy,
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: arrayCopy.length }, (_, i) => i),
      passes: lastStep?.passes || 0,
      comparisons: lastStep?.comparisons || 0,
      swaps: lastStep?.swaps || 0,
    })

    playAnimationSteps()
  }

  const playAnimationSteps = () => {
    if (currentStepIndex.current >= animationSteps.current.length) {
      onSortingComplete()
      return
    }

    setArrayState(animationSteps.current[currentStepIndex.current])
    currentStepIndex.current++

    // Calculate delay based on speed (invert the speed so higher = faster)
    const delay = Math.max(5, 500 - speed * 5)

    sortingTimeoutId.current = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(playAnimationSteps)
    }, delay)
  }

  // Sorting algorithms with animation steps
  const bubbleSort = (arr: number[]) => {
    const n = arr.length
    const animations: ArrayState[] = []
    const sorted: number[] = []
    let passes = 0
    let comparisons = 0
    let swaps = 0

    for (let i = 0; i < n; i++) {
      passes++
      let swapped = false

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++

        // Comparing elements
        animations.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapping: [],
          sorted: [...sorted],
          passes,
          comparisons,
          swaps,
        })

        if (arr[j] > arr[j + 1]) {
          swaps++
          swapped = true

          // Swapping elements
          animations.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            sorted: [...sorted],
            passes,
            comparisons,
            swaps,
          })

          // Perform the swap
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]

          // Update array after swap
          animations.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            sorted: [...sorted],
            passes,
            comparisons,
            swaps,
          })
        }
      }

      // Mark element as sorted
      sorted.unshift(n - i - 1)
      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        passes,
        comparisons,
        swaps,
      })

      // Early termination if no swaps were made
      if (!swapped) break
    }

    animationSteps.current = animations
  }

  const insertionSort = (arr: number[]) => {
    const n = arr.length
    const animations: ArrayState[] = []
    const sorted: number[] = [0]
    let passes = 0
    let comparisons = 0
    let swaps = 0

    for (let i = 1; i < n; i++) {
      passes++
      const key = arr[i]
      let j = i - 1

      // Comparing the current element with sorted elements
      animations.push({
        array: [...arr],
        comparing: [i, j],
        swapping: [],
        sorted: [...sorted],
        passes,
        comparisons,
        swaps,
      })

      while (j >= 0 && arr[j] > key) {
        comparisons++
        swaps++

        // Swapping elements
        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          passes,
          comparisons,
          swaps,
        })

        arr[j + 1] = arr[j]
        j--

        // Update array after shift
        animations.push({
          array: [...arr],
          comparing: j >= 0 ? [i, j] : [],
          swapping: [],
          sorted: [...sorted],
          passes,
          comparisons,
          swaps,
        })
      }

      arr[j + 1] = key

      // Update array after insertion
      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        passes,
        comparisons,
        swaps,
      })

      // Mark element as sorted
      sorted.push(i)
      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        passes,
        comparisons,
        swaps,
      })
    }

    animationSteps.current = animations
  }

  const selectionSort = (arr: number[]) => {
    const n = arr.length
    const animations: ArrayState[] = []
    const sorted: number[] = []
    let passes = 0
    let comparisons = 0
    let swaps = 0

    for (let i = 0; i < n - 1; i++) {
      passes++
      let minIdx = i

      for (let j = i + 1; j < n; j++) {
        comparisons++

        // Comparing to find minimum
        animations.push({
          array: [...arr],
          comparing: [minIdx, j],
          swapping: [],
          sorted: [...sorted],
          passes,
          comparisons,
          swaps,
        })

        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }

      // Swapping with minimum element
      if (minIdx !== i) {
        swaps++

        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [i, minIdx],
          sorted: [...sorted],
          passes,
          comparisons,
          swaps,
        })
        ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      }

      // Mark element as sorted
      sorted.push(i)
      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        passes,
        comparisons,
        swaps,
      })
    }

    // Mark last element as sorted
    sorted.push(n - 1)
    animations.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      passes,
      comparisons,
      swaps,
    })

    animationSteps.current = animations
  }

  const mergeSort = (arr: number[], start: number, end: number) => {
    if (start < end) {
      const mid = Math.floor((start + end) / 2)
      mergeSort(arr, start, mid)
      mergeSort(arr, mid + 1, end)
      merge(arr, start, mid, end)
    }
  }

  const merge = (arr: number[], start: number, mid: number, end: number) => {
    const animations: ArrayState[] = animationSteps.current
    const n1 = mid - start + 1
    const n2 = end - mid
    let comparisons = animations.length > 0 ? animations[animations.length - 1].comparisons : 0
    let swaps = animations.length > 0 ? animations[animations.length - 1].swaps : 0
    const passes = animations.length > 0 ? animations[animations.length - 1].passes + 1 : 1

    // Create temp arrays
    const L = new Array(n1)
    const R = new Array(n2)

    // Copy data to temp arrays
    for (let i = 0; i < n1; i++) {
      L[i] = arr[start + i]
    }
    for (let j = 0; j < n2; j++) {
      R[j] = arr[mid + 1 + j]
    }

    // Merge the temp arrays back
    let i = 0,
      j = 0,
      k = start

    while (i < n1 && j < n2) {
      comparisons++

      // Compare elements from both subarrays
      animations.push({
        array: [...arr],
        comparing: [start + i, mid + 1 + j],
        swapping: [],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })

      if (L[i] <= R[j]) {
        swaps++

        // Place element from left subarray
        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [k],
          sorted: [],
          passes,
          comparisons,
          swaps,
        })

        arr[k] = L[i]
        i++
      } else {
        swaps++

        // Place element from right subarray
        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [k],
          sorted: [],
          passes,
          comparisons,
          swaps,
        })

        arr[k] = R[j]
        j++
      }

      // Update array after placement
      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })

      k++
    }

    // Copy remaining elements from L
    while (i < n1) {
      swaps++

      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })

      arr[k] = L[i]
      i++
      k++

      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })
    }

    // Copy remaining elements from R
    while (j < n2) {
      swaps++

      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [k],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })

      arr[k] = R[j]
      j++
      k++

      animations.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })
    }
  }

  const quickSort = (arr: number[], low: number, high: number) => {
    if (low < high) {
      const pi = partition(arr, low, high)
      quickSort(arr, low, pi - 1)
      quickSort(arr, pi + 1, high)
    }
  }

  const partition = (arr: number[], low: number, high: number) => {
    const animations: ArrayState[] = animationSteps.current
    const pivot = arr[high]
    let i = low - 1
    let comparisons = animations.length > 0 ? animations[animations.length - 1].comparisons : 0
    let swaps = animations.length > 0 ? animations[animations.length - 1].swaps : 0
    const passes = animations.length > 0 ? animations[animations.length - 1].passes + 1 : 1

    // Show pivot selection
    animations.push({
      array: [...arr],
      comparing: [high],
      swapping: [],
      sorted: [],
      passes,
      comparisons,
      swaps,
    })

    for (let j = low; j < high; j++) {
      comparisons++

      // Compare with pivot
      animations.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sorted: [],
        passes,
        comparisons,
        swaps,
      })

      if (arr[j] < pivot) {
        i++
        swaps++

        // Swap elements
        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [i, j],
          sorted: [],
          passes,
          comparisons,
          swaps,
        })
        ;[arr[i], arr[j]] = [arr[j], arr[i]]

        // Update array after swap
        animations.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [],
          passes,
          comparisons,
          swaps,
        })
      }
    }

    // Swap pivot to its final position
    swaps++

    animations.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [],
      passes,
      comparisons,
      swaps,
    })
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]

    // Update array after pivot placement
    animations.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [i + 1],
      passes,
      comparisons,
      swaps,
    })

    return i + 1
  }

  // Calculate bar dimensions
  const maxValue = Math.max(...arrayState.array)
  const barWidth = `calc(100% / ${arrayState.array.length})`

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end justify-center gap-[1px]">
        {arrayState.array.map((value, index) => {
          const height = `${(value / maxValue) * 100}%`
          let backgroundColor = "bg-primary"

          if (arrayState.comparing.includes(index)) {
            backgroundColor = "bg-yellow-500"
          } else if (arrayState.swapping.includes(index)) {
            backgroundColor = "bg-red-500"
          } else if (arrayState.sorted.includes(index)) {
            backgroundColor = "bg-green-500"
          }

          return (
            <div
              key={index}
              className={`${backgroundColor} transition-all duration-100`}
              style={{
                height,
                width: barWidth,
                minWidth: "2px",
                maxWidth: "20px",
              }}
            />
          )
        })}
      </div>

      {/* Metrics display */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Passes</div>
          <div className="text-2xl font-bold">{arrayState.passes}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Comparisons</div>
          <div className="text-2xl font-bold">{arrayState.comparisons}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Swaps</div>
          <div className="text-2xl font-bold">{arrayState.swaps}</div>
        </div>
      </div>
    </div>
  )
}
