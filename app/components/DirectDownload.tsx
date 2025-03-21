"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  className?: string
  variant?: "primary" | "secondary"
  label?: string
}

export function DirectDownload({ 
  className = "", 
  variant = "primary",
  label = "Download for Mac"
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  
  // Using a public S3 URL that doesn't require authentication
  const dmgUrl = "https://friday-app-downloads.s3.amazonaws.com/Friday-1.0.0.dmg"
  
  const handleDownload = () => {
    setDownloading(true)
    
    // Create an anchor element and trigger download
    const link = document.createElement('a')
    link.href = dmgUrl
    link.setAttribute('download', 'Friday-1.0.0.dmg')
    link.setAttribute('target', '_blank')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Reset downloading state after a short delay
    setTimeout(() => {
      setDownloading(false)
    }, 2000)
  }
  
  return (
    <Button
      onClick={handleDownload}
      className={`${className} ${
        variant === "primary"
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          : "bg-white text-indigo-600 hover:bg-indigo-50"
      } font-medium rounded-lg px-6 py-3 flex items-center gap-2 transform transition-all hover:scale-105 hover:shadow-lg`}
      disabled={downloading}
    >
      <Download size={18} />
      {downloading ? "Downloading..." : label}
    </Button>
  )
} 