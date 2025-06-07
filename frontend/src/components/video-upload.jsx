"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"

export function VideoUpload({ onUpload }) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        const { data } = await axios.post("http://localhost:8000/api/upload-url", {
          fileName: file.name,
          contentType: file.type,
        });
        const presignedUrl = data.url;
        console.log("Presigned URL received:", data.url);
        await axios.put(presignedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });

        onUpload?.([file]);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    multiple: false,
  })

  return (
    <Card className="border-2 border-dashed transition-colors duration-200 hover:border-purple-300 dark:hover:border-purple-700">
      <CardContent className="p-6 sm:p-8">
        <div
          {...getRootProps()}
          className={`text-center space-y-4 cursor-pointer transition-all duration-200 ${isDragActive ? "scale-105" : ""
            }`}
        >
          <input {...getInputProps()} />

          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-semibold">Upload Your MP4 Videos</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Drag and drop your MP4 video files here, or click to browse
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Supports MP4 format only</p>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base"
          >
            <Video className="w-4 h-4 mr-2" />
            Choose MP4 Files
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
