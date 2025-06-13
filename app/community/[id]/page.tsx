import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ArrowLeft } from "lucide-react"
import * as communityService from "@/lib/community"
import CommunityCommentForm from "@/components/community-comment-form"
import LikeButton from "@/components/like-button"

export default async function CommunityPostDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const post = await communityService.getPostById(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/community" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all discussions
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author_image || "/placeholder.svg"} alt={post.author_name} />
              <AvatarFallback>{post.author_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {post.content.split("\n").map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center gap-4">
            <LikeButton
              itemId={post.id}
              likeCount={post.like_count}
              likeAction={() => communityService.likePost(post.id, session?.user?.id || "")}
              requireAuth={!session}
            />
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>

        {session ? (
          <CommunityCommentForm postId={post.id} />
        ) : (
          <Card className="mb-6">
            <CardContent className="py-4 text-center">
              <p className="mb-2">Sign in to leave a comment</p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 mt-6">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: any) => (
              <Card key={comment.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author_image || "/placeholder.svg"} alt={comment.author_name} />
                      <AvatarFallback>{comment.author_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{comment.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p>{comment.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  )
}
