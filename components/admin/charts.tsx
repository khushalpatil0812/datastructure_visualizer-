"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

// Register Chart.js components
Chart.register(...registerables)

interface ChartProps {
  data: any[]
  xKey: string
  yKey: string
  height?: number
}

export function LineChart({ data, xKey, yKey, height = 300 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => item[xKey]),
        datasets: [
          {
            label: yKey.charAt(0).toUpperCase() + yKey.slice(1),
            data: data.map((item) => item[yKey]),
            borderColor: "hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "hsl(var(--border) / 0.2)",
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, xKey, yKey])

  return <canvas ref={canvasRef} height={height} />
}

export function BarChart({ data, xKey, yKey, height = 300 }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    // Destroy previous chart instance
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item[xKey]),
        datasets: [
          {
            label: yKey.charAt(0).toUpperCase() + yKey.slice(1),
            data: data.map((item) => item[yKey]),
            backgroundColor: "hsl(var(--primary) / 0.8)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "hsl(var(--border) / 0.2)",
            },
          },
        },
      },
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data, xKey, yKey])

  return <canvas ref={canvasRef} height={height} />
}
