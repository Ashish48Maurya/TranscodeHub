"use client"

import { Moon, Sun, Video, Wifi, WifiOff } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import axios from "axios"

export function Header() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [serverStatus, setServerStatus] = useState("checking")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check server health status
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await axios.get("http://localhost:8000/health")
        if (response.statusText === "OK" || response.status === 200) {
          setServerStatus("online")
        } else {
          setServerStatus("offline")
        }
      } catch (error) {
        setServerStatus("offline")
      }
    }

    // Initial check
    checkServerHealth()

    // Check every 30 seconds
    const interval = setInterval(checkServerHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl">TranscodeHub</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground hidden sm:inline">Checking...</span>
            </div>
            <Button variant="outline" size="icon" disabled>
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl">TranscodeHub</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Server Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full ${
                  serverStatus === "online"
                    ? "bg-green-500 animate-pulse"
                    : serverStatus === "offline"
                      ? "bg-red-500 animate-pulse"
                      : "bg-yellow-500 animate-pulse"
                }`}
              />
              {serverStatus === "online" && (
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
              )}
            </div>
            <Badge
              variant="outline"
              className={`text-xs hidden sm:inline-flex ${
                serverStatus === "online"
                  ? "border-green-500 text-green-700 dark:text-green-400"
                  : serverStatus === "offline"
                    ? "border-red-500 text-red-700 dark:text-red-400"
                    : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {serverStatus === "online" && <Wifi className="w-3 h-3 mr-1" />}
              {serverStatus === "offline" && <WifiOff className="w-3 h-3 mr-1" />}
              API {serverStatus === "online" ? "Live" : serverStatus === "offline" ? "Down" : "Checking"}
            </Badge>
          </div>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={resolvedTheme === "light" ? "bg-accent" : ""}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={resolvedTheme === "dark" ? "bg-accent" : ""}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className={theme === "system" ? "bg-accent" : ""}>
                <div className="mr-2 h-4 w-4 rounded-sm border border-foreground/25 bg-gradient-to-b from-background to-muted" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
