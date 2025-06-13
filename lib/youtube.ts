interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
}

export async function getYouTubeVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.warn("YouTube API key not found. Using mock data.")
    return getMockYouTubeVideos(query, maxResults)
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query,
      )}&maxResults=${maxResults}&type=video&key=${apiKey}`,
      { next: { revalidate: 86400 } }, // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }))
  } catch (error) {
    console.error("Error fetching YouTube videos:", error)
    return getMockYouTubeVideos(query, maxResults)
  }
}

// Fallback function to provide mock data when API key is missing or API call fails
function getMockYouTubeVideos(query: string, maxResults: number): YouTubeVideo[] {
  const mockVideos: Record<string, YouTubeVideo[]> = {
    "sorting algorithms": [
      {
        id: "kPRA0W1kECg",
        title: "15 Sorting Algorithms in 6 Minutes",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "Timo Bingmann",
        publishedAt: "2013-05-10T15:45:00Z",
      },
      {
        id: "Hoixgm4-P4M",
        title: "Sorting Algorithms Explained Visually",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "CS Dojo",
        publishedAt: "2019-03-15T12:30:00Z",
      },
    ],
    "searching algorithms": [
      {
        id: "P3YpQVg5CrU",
        title: "Binary Search Algorithm in 4 Minutes",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "Michael Sambol",
        publishedAt: "2020-01-20T18:15:00Z",
      },
      {
        id: "D5SrAga1pno",
        title: "Linear vs Binary Search Explained",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "CS Visualized",
        publishedAt: "2020-04-05T09:20:00Z",
      },
    ],
    "linked list data structure": [
      {
        id: "njTh_OwMljA",
        title: "Linked List Data Structure",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "mycodeschool",
        publishedAt: "2015-02-12T14:10:00Z",
      },
      {
        id: "R9PTBwOzceo",
        title: "Singly vs Doubly Linked Lists",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "Back To Back SWE",
        publishedAt: "2018-07-28T22:45:00Z",
      },
    ],
    "data structures and algorithms": [
      {
        id: "RBSGKlAvoiM",
        title: "Data Structures Easy to Advanced Course",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "freeCodeCamp.org",
        publishedAt: "2019-08-15T16:20:00Z",
      },
      {
        id: "8hly31xKli0",
        title: "Introduction to Algorithms and Data Structures",
        thumbnail: "/placeholder.svg?height=180&width=320",
        channelTitle: "MIT OpenCourseWare",
        publishedAt: "2016-05-10T11:30:00Z",
      },
    ],
  }

  // Generate more mock videos if needed
  const baseVideos = mockVideos[query] || mockVideos["data structures and algorithms"]
  const result = [...baseVideos]

  while (result.length < maxResults) {
    const index = result.length % baseVideos.length
    const video = { ...baseVideos[index] }
    video.id = `${video.id}-${result.length}`
    video.title = `${video.title} (${result.length + 1})`
    result.push(video)
  }

  return result.slice(0, maxResults)
}
