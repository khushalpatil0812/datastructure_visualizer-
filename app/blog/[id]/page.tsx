import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowLeft } from "lucide-react";
import * as blogService from "@/lib/blog";
import BlogCommentForm from "@/components/blog-comment-form";
import LikeButton from "@/components/like-button";

interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  author_name: string;
  author_image: string;
}

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const blog = await blogService.getBlogById(params.id);

  if (!blog) {
    notFound();
  }

  // Safely get user ID with proper typing
  const userId = (session?.user as SessionUser)?.id || "";

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/blog" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all posts
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={blog.author_image || "/placeholder.svg"} alt={blog.author_name} />
              <AvatarFallback>{blog.author_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{blog.author_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(blog.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <CardTitle className="text-3xl">{blog.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {blog.content.split("\n").map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center gap-4">
           <LikeButton
  itemId={blog.id}
  initialLikeCount={blog.like_count}
  likeAction={async () => {
    try {
      const result = await blogService.likeBlog(blog.id, userId);
      // Remove the explicit 'liked: true' since it comes from the result
      return { ...result };
    } catch (error) {
      return { 
        liked: false, 
        error: error instanceof Error ? error.message : "Failed to like post" 
      };
    }
  }}
  requireAuth={!session}
/>

            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{blog.comments?.length || 0}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>

        {session ? (
          <BlogCommentForm blogId={blog.id} />
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
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment: BlogComment) => (
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
  );
}