import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ThumbsUp, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import * as communityService from "@/lib/community"

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const page = Number(searchParams.page) || 1
  const { posts, pagination } = await communityService.getPosts(page, 10)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Discussions</h1>
        {session && (
          <Button asChild>
            <Link href="/community/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Discussion
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post: any) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author_image || "/placeholder.svg"} alt={post.author_name} />
                    <AvatarFallback>{post.author_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{post.author_name}</span>
                </div>
                <CardTitle>
                  <Link href={`/community/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>{new Date(post.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{post.content.substring(0, 200)}...</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comment_count}</span>
                  </div>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/community/${post.id}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No discussions yet.</p>
            {session && (
              <Button asChild className="mt-4">
                <Link href="/community/new">Start the first discussion</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`/community?page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < pagination.pages && (
              <Button variant="outline" asChild>
                <Link href={`/community?page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
