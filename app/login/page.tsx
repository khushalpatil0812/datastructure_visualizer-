"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("linkedin")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Linkedin className="h-5 w-5" />
            Sign in with LinkedIn
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="ghost" onClick={() => router.push("/")} className="w-full mt-2">
            Continue as Guest
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
