"use client"

import { VideoUpload } from "@/components/video-upload"
import { VideoGallery } from "@/components/video-gallery"
import { Header } from "@/components/header"
import { TechStack } from "@/components/tech-stack"
import { useSocket } from "@/hooks/useSocket"
import { useEffect, useState } from "react"
import axios from "axios"

export default function VideoTranscodingPlatform() {
  const [videos, setVideos] = useState([])

  const socket = useSocket()

  useEffect(() => {
    if (!socket.current) return

    const handleTranscodingComplete = async (data) => {
      try {
        const res = await axios.get(`http://localhost:8000/api/list-objects`, {
          params: {
            bucketName: "video-48-transcoding-prd",
          },
        })

        const urls = res.data.urls;
        console.log("Fetched video URLs:", urls)
        const processedVideos = urls.map((item) => ({
          name: item.key,
          url: item.url,
        }))

        setVideos(processedVideos)
      } catch (err) {
        console.error("Error fetching video URLs:", err)
      }
    }

    socket.current.on("transcoding-completed", handleTranscodingComplete)

    return () => {
      socket.current.off("transcoding-completed", handleTranscodingComplete)
    }
  }, [socket])
  

  const handleVideoUpload = (files) => {
    Array.from(files).forEach((file) => {
      const newVideo = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalUrl: URL.createObjectURL(file),
        status: "uploading",
        progress: 0,
        uploadedAt: new Date(),
        size: file.size,
      }

      // Optional: add to state to show upload in progress
      // setVideos(prev => [...prev, newVideo]);
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Video Transcoding Platform
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Upload your MP4 videos and transcode them with professional quality processing.
          </p>
        </div>

        <VideoUpload onUpload={handleVideoUpload} />

        <VideoGallery videos={videos} />

        <TechStack />
      </main>
    </div>
  )
}
