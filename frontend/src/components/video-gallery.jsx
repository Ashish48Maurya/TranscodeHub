"use client"

import { ExternalLink, Play, PlayIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


export function VideoGallery({videos}) {
  const openInNewTab = (video) => {
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${video.name}</title>
            <style>
              body { margin: 0; padding: 20px; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              video { max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            <video controls autoplay>
              <source src="${video.url}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </body>
        </html>
      `)
    }
  }

  if (videos?.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No videos yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload your first MP4 video to get started with transcoding
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Processed Videos ({videos?.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {videos?.map((video,index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[16/9] bg-muted relative group">
              <video src={video?.url} className="w-full h-full object-cover" preload="metadata" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-sm sm:text-base">
                      <Play className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle className="text-sm sm:text-base">{video?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video">
                      <video src={video?.url} controls className="w-full h-full rounded-lg" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-semibold truncate text-center mx-auto" title={video?.name}>
                  {video?.name}
                </h3>
              </div>

              <Button onClick={() => openInNewTab(video)} className="w-full text-xs sm:text-sm" variant="outline">
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Open in New Tab
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
