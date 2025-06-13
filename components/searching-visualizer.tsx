"use client"

import { useEffect, useState, useRef } from "react"

interface SearchingVisualizerProps {
  array: number[]
  algorithm: string
  searchValue: number
  isRunning: boolean
  speed: number
  onSearchComplete: () => void
}

interface ArrayState {
  current: number[]
  found: number | null
  checking: number[]
  left?: number
  right?: number
  mid?: number
  passes: number
  comparisons: number
}

export function SearchingVisualizer({
  array,
  algorithm,
  searchValue,
  isRunning,
  speed,
  onSearchComplete,
}: SearchingVisualizerProps) {
  const [arrayState, setArrayState] = useState<ArrayState>({
    current: [...array],
    found: null,
    checking: [],
    passes: 0,
    comparisons: 0,
  })
  const [result, setResult] = useState<{
    found: boolean
    index: number | null
    comparisons: number
    passes: number
  }>({
    found: false,
    index: null,
    comparisons: 0,
    passes: 0,
  })
  const animationFrameId = useRef<number | null>(null)
  const searchTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const animationSteps = useRef<ArrayState[]>([])
  const currentStepIndex = useRef<number>(0)

  // Reset state when array changes
  useEffect(() => {
    setArrayState({
      current: [...array],
      found: null,
      checking: [],
      passes: 0,
      comparisons: 0,
    })
    setResult({
      found: false,
      index: null,
      comparisons: 0,
      passes: 0,
    })
    animationSteps.current = []
    currentStepIndex.current = 0

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    if (searchTimeoutId.current) {
      clearTimeout(searchTimeoutId.current)
      searchTimeoutId.current = null
    }
  }, [array])

  // Start or stop searching based on isRunning
  useEffect(() => {
    if (isRunning) {
      startSearching()
    } else {
      if (searchTimeoutId.current) {
        clearTimeout(searchTimeoutId.current)
        searchTimeoutId.current = null
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
        animationFrameId.current = null
      }
    }

    return () => {
      if (searchTimeoutId.current) {
        clearTimeout(searchTimeoutId.current)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isRunning, algorithm, searchValue])

  const startSearching = () => {
    // If we already have animation steps, just continue playing them
    if (animationSteps.current.length > 0 && currentStepIndex.current < animationSteps.current.length) {
      playAnimationSteps()
      return
    }

    // Otherwise, generate new animation steps
    const arrayCopy = [...array]
    animationSteps.current = []
    currentStepIndex.current = 0
    let comparisons = 0
    let passes = 0
    let foundIndex = null

    if (algorithm === "linear") {
      passes = 1
      for (let i = 0; i < arrayCopy.length; i++) {
        comparisons++

        // Add step for checking current element
        animationSteps.current.push({
          current: [...arrayCopy],
          found: null,
          checking: [i],
          passes,
          comparisons,
        })

        if (arrayCopy[i] === searchValue) {
          foundIndex = i
          // Add step for found element
          animationSteps.current.push({
            current: [...arrayCopy],
            found: i,
            checking: [],
            passes,
            comparisons,
          })
          break
        }
      }

      // If not found, add final step
      if (foundIndex === null) {
        animationSteps.current.push({
          current: [...arrayCopy],
          found: null,
          checking: [],
          passes,
          comparisons,
        })
      }
    } else if (algorithm === "binary") {
      let left = 0
      let right = arrayCopy.length - 1

      while (left <= right) {
        passes++
        comparisons++
        const mid = Math.floor((left + right) / 2)

        // Add step for current search range and midpoint
        animationSteps.current.push({
          current: [...arrayCopy],
          found: null,
          checking: [mid],
          left,
          right,
          mid,
          passes,
          comparisons,
        })

        if (arrayCopy[mid] === searchValue) {
          foundIndex = mid
          // Add step for found element
          animationSteps.current.push({
            current: [...arrayCopy],
            found: mid,
            checking: [],
            left,
            right,
            mid,
            passes,
            comparisons,
          })
          break
        } else if (arrayCopy[mid] < searchValue) {
          left = mid + 1
        } else {
          right = mid - 1
        }
      }

      // If not found, add final step
      if (foundIndex === null) {
        animationSteps.current.push({
          current: [...arrayCopy],
          found: null,
          checking: [],
          left,
          right,
          passes,
          comparisons,
        })
      }
    }

    setResult({
      found: foundIndex !== null,
      index: foundIndex,
      comparisons,
      passes,
    })

    playAnimationSteps()
  }

  const playAnimationSteps = () => {
    if (currentStepIndex.current >= animationSteps.current.length) {
      onSearchComplete()
      return
    }

    setArrayState(animationSteps.current[currentStepIndex.current])
    currentStepIndex.current++

    // Calculate delay based on speed (invert the speed so higher = faster)
    const delay = Math.max(5, 500 - speed * 5)

    searchTimeoutId.current = setTimeout(() => {
      animationFrameId.current = requestAnimationFrame(playAnimationSteps)
    }, delay)
  }

  // Calculate bar dimensions
  const maxValue = Math.max(...arrayState.current)
  const barWidth = `calc(100% / ${arrayState.current.length})`

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end justify-center gap-[1px]">
        {arrayState.current.map((value, index) => {
          const height = `${(value / maxValue) * 100}%`
          let backgroundColor = "bg-primary"

          if (arrayState.found === index) {
            backgroundColor = "bg-green-500"
          } else if (arrayState.checking.includes(index)) {
            backgroundColor = "bg-yellow-500"
          } else if (
            algorithm === "binary" &&
            arrayState.left !== undefined &&
            arrayState.right !== undefined &&
            index >= arrayState.left &&
            index <= arrayState.right
          ) {
            backgroundColor = "bg-blue-400"
          }

          return (
            <div
              key={index}
              className={`${backgroundColor} transition-all duration-100 relative flex items-center justify-center`}
              style={{
                height,
                width: barWidth,
                minWidth: "2px",
                maxWidth: "20px",
              }}
            >
              <span className="absolute bottom-0 text-[10px] transform -rotate-90 origin-bottom-left translate-y-full mt-1">
                {value}
              </span>
            </div>
          )
        })}
      </div>

      {/* Metrics display */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Passes</div>
          <div className="text-2xl font-bold">{arrayState.passes}</div>
        </div>
        <div className="p-2 border rounded-md">
          <div className="text-sm font-medium text-muted-foreground">Comparisons</div>
          <div className="text-2xl font-bold">{arrayState.comparisons}</div>
        </div>
      </div>

      {result.index !== null || currentStepIndex.current >= animationSteps.current.length ? (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-medium mb-2">Search Result:</h3>
          <p>
            {result.found
              ? `Found ${searchValue} at index ${result.index} after ${result.comparisons} comparisons and ${result.passes} passes.`
              : `${searchValue} not found in the array after ${result.comparisons} comparisons and ${result.passes} passes.`}
          </p>
        </div>
      ) : null}
    </div>
  )
}
