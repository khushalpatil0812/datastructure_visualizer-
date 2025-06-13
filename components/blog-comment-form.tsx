"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { commentOnBlog } from "@/app/actions/blog-actions"

export default function BlogCommentForm({ blogId }: { blogId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await commentOnBlog(blogId, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Comment added successfully!",
      })

      // Reset the form
      const form = document.getElementById("comment-form") as HTMLFormElement
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form id="comment-form" action={handleSubmit}>
        <CardContent className="pt-4">
          <Textarea name="content" placeholder="Write your comment..." className="min-h-[100px]" required />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
