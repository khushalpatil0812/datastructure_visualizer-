import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import db from "@/lib/db";

interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  is_admin?: boolean;
}

interface CountResult {
  count: number;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as ExtendedUser;

  // Get user progress data
  let completedProblems = 0;
  let totalProblems = 0;
  let blogPosts = 0;
  let communityPosts = 0;

  try {
    // Get completed problems count
   const completedProblemsResult = await db.query<CountResult[]>(
  "SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND completed = 1",
  [user.id]
);
    completedProblems = completedProblemsResult[0]?.count || 0;
    

    // Get total problems count
    const totalProblemsResult = await db.query<CountResult[]>(
  "SELECT COUNT(*) as count FROM practice_problems"
);
    totalProblems = totalProblemsResult[0]?.count || 0;

    // Get blog posts count
    const blogPostsResult = await db.query<CountResult[]>(
      "SELECT COUNT(*) as count FROM blogs WHERE author_id = ?",
      [user.id]
    );
    blogPosts = blogPostsResult[0]?.count || 0;

    // Get community posts count
    const communityPostsResult = await db.query<CountResult[]>(
      "SELECT COUNT(*) as count FROM community_posts WHERE author_id = ?",
      [user.id]
    );
    communityPosts = communityPostsResult[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            {user.is_admin && (
              <span className="mt-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Completed Problems
                </h3>
                <p className="text-2xl font-bold">
                  {completedProblems}{" "}
                  <span className="text-sm text-muted-foreground">
                    / {totalProblems}
                  </span>
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Blog Posts
                </h3>
                <p className="text-2xl font-bold">{blogPosts}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Community Posts
                </h3>
                <p className="text-2xl font-bold">{communityPosts}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Account Created
                </h3>
                <p className="text-2xl font-bold">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent interactions on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Your recent activity will appear here as you interact with the
              platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}