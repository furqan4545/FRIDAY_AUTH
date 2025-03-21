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
  
  const handleDownload = () => {
    setDownloading(true)
    
    // Redirect to the direct download endpoint
    window.location.href = "/api/download";
    
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