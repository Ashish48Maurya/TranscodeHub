"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const technologies = [
  {
    name: "React.js",
    category: "Frontend",
    description: "Modern UI library for building interactive user interfaces",
    icon: "https://icons.veryicon.com/png/o/business/vscode-program-item-icon/react-3.png",
    color: "from-cyan-400 to-blue-500",
  },
  {
    name: "Node.js",
    category: "Backend",
    description: "JavaScript runtime for scalable server-side applications",
    icon: "https://static-00.iconduck.com/assets.00/node-js-icon-1817x2048-g8tzf91e.png",
    color: "from-green-400 to-emerald-500",
  },
  {
    name: "AWS ECS",
    category: "Container",
    description: "Elastic Container Service for running containerized applications",
    icon: "https://static-00.iconduck.com/assets.00/amazon-ecs-color-icon-481x512-uy1j6sqj.png",
    color: "from-orange-400 to-red-500",
  },
  {
    name: "AWS ECR",
    category: "Registry",
    description: "Elastic Container Registry for storing Docker images",
    icon: "/placeholder.svg?height=60&width=60",
    color: "from-purple-400 to-pink-500",
  },
  {
    name: "AWS S3",
    category: "Storage",
    description: "Simple Storage Service for video file storage and management",
    icon: "/placeholder.svg?height=60&width=60",
    color: "from-yellow-400 to-orange-500",
  },
  {
    name: "CloudFront",
    category: "CDN",
    description: "Content Delivery Network for fast video streaming worldwide",
    icon: "/placeholder.svg?height=60&width=60",
    color: "from-indigo-400 to-purple-500",
  },
  {
    name: "AWS EC2",
    category: "Compute",
    description: "Elastic Compute Cloud for scalable video processing power",
    icon: "/placeholder.svg?height=60&width=60",
    color: "from-teal-400 to-cyan-500",
  },
  {
    name: "AWS SQS",
    category: "Queue",
    description: "Simple Queue Service for managing video processing workflows",
    icon: "/placeholder.svg?height=60&width=60",
    color: "from-rose-400 to-pink-500",
  },
]

export function TechStack() {
  const [visibleCards, setVisibleCards] = useState([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
            setVisibleCards((prev) => [...prev, index])
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = document.querySelectorAll("[data-index]")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Built with Modern Technologies</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          Our video transcoding platform leverages cutting-edge technologies and AWS cloud services to deliver scalable,
          reliable, and high-performance video processing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {technologies.map((tech, index) => (
          <Card
            key={tech.name}
            data-index={index}
            className={`group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
              visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <CardContent className="p-4 sm:p-6 text-center space-y-4">
              <div
                className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <img
                  src={tech.icon || "/placeholder.svg"}
                  alt={tech.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 filter brightness-0 invert"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold">{tech.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {tech.category}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
              </div>

              <div
                className={`h-1 bg-gradient-to-r ${tech.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">Scalable Architecture</h3>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Our platform uses AWS ECS for container orchestration, S3 for storage, CloudFront for global delivery, and SQS
          for reliable message queuing - ensuring your videos are processed efficiently at any scale.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-4">
          {["Scalable", "Reliable", "Fast", "Secure", "Global"].map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300 dark:border-purple-700 text-xs sm:text-sm"
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}
