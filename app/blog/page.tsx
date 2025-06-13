import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, ThumbsUp, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import * as blogService from "@/lib/blog"

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const page = Number(searchParams.page) || 1
  const { blogs, pagination } = await blogService.getBlogs(page, 10)

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        {session && (
          <Button asChild>
            <Link href="/blog/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Post
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {blogs.length > 0 ? (
          blogs.map((blog: any) => (
            <Card key={blog.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={blog.author_image || "/placeholder.svg"} alt={blog.author_name} />
                    <AvatarFallback>{blog.author_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{blog.author_name}</span>
                </div>
                <CardTitle>
                  <Link href={`/blog/${blog.id}`} className="hover:underline">
                    {blog.title}
                  </Link>
                </CardTitle>
                <CardDescription>{new Date(blog.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{blog.content.substring(0, 200)}...</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{blog.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{blog.comment_count}</span>
                  </div>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/blog/${blog.id}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts yet.</p>
            {session && (
              <Button asChild className="mt-4">
                <Link href="/blog/new">Create the first post</Link>
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
                <Link href={`/blog?page=${page - 1}`}>Previous</Link>
              </Button>
            )}
            {page < pagination.pages && (
              <Button variant="outline" asChild>
                <Link href={`/blog?page=${page + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
