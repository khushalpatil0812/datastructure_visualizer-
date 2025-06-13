import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoGrid } from "@/components/video-grid"
import { getYouTubeVideos } from "@/lib/youtube"

export default async function VideosPage() {
  const sortingVideos = await getYouTubeVideos("sorting algorithms", 8)
  const searchingVideos = await getYouTubeVideos("searching algorithms", 8)
  const linkedListVideos = await getYouTubeVideos("linked list data structure", 8)
  const dsaVideos = await getYouTubeVideos("data structures and algorithms", 8)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Video Learning</h1>

      <Card>
        <CardHeader>
          <CardTitle>DSA Video Tutorials</CardTitle>
          <CardDescription>
            Learn data structures and algorithms through curated video content from top educators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="all">All DSA</TabsTrigger>
              <TabsTrigger value="sorting">Sorting</TabsTrigger>
              <TabsTrigger value="searching">Searching</TabsTrigger>
              <TabsTrigger value="linked-list">Linked List</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <VideoGrid videos={dsaVideos} />
            </TabsContent>

            <TabsContent value="sorting">
              <VideoGrid videos={sortingVideos} />
            </TabsContent>

            <TabsContent value="searching">
              <VideoGrid videos={searchingVideos} />
            </TabsContent>

            <TabsContent value="linked-list">
              <VideoGrid videos={linkedListVideos} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
