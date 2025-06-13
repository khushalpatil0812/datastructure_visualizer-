"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [dbResult, setDbResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAdminStatus = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/admin-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.user.email }),
      })

      const data = await response.json()
      setDbResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">Session Status: {status}</h2>
        <pre className="mt-2 bg-black text-white p-4 rounded overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </div>

      <div className="flex gap-4 mt-4">
        {status === "authenticated" ? (
          <Button onClick={() => signOut()}>Sign Out</Button>
        ) : (
          <Button onClick={() => signIn()}>Sign In</Button>
        )}

        <Button onClick={checkAdminStatus} disabled={loading || status !== "authenticated"}>
          {loading ? "Checking..." : "Check Admin Status in DB"}
        </Button>

        <Button asChild variant="outline">
          <a href="/admin">Try Admin Access</a>
        </Button>
      </div>

      {dbResult && (
        <div className="mt-4">
          <h2 className="font-semibold">Database Result:</h2>
          <pre className="mt-2 bg-black text-white p-4 rounded overflow-auto">{JSON.stringify(dbResult, null, 2)}</pre>
        </div>
      )}

      {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>}
    </div>
  )
}
