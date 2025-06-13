"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ThumbsUp } from "lucide-react"

interface LikeButtonProps {
  itemId: string
  likeCount: number
  likeAction: () => Promise<any>
  requireAuth?: boolean
}

export default function LikeButton({ itemId, likeCount, likeAction, requireAuth = false }: LikeButtonProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [likes, setLikes] = useState(likeCount)
  const { toast } = useToast()
  const router = useRouter()

  async function handleLike() {
    if (requireAuth) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like this post",
      })
      router.push("/login")
      return
    }

    setIsLiking(true)

    try {
      const result = await likeAction()

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Update like count based on the action result
      setLikes((prev) => (result.liked ? prev + 1 : prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} disabled={isLiking} className="flex items-center gap-1">
      <ThumbsUp className={`h-4 w-4 ${isLiking ? "animate-pulse" : ""}`} />
      <span>{likes}</span>
    </Button>
  )
}
