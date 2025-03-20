"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()
  const { user, signInWithGoogle, loading, isConfigured } = useAuth()
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; left: number; size: number; opacity: number; animationDuration: number }>
  >([])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    // Create snowflakes
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 10 + 5,
      opacity: Math.random() * 0.7 + 0.3,
      animationDuration: Math.random() * 10 + 5,
    }))

    setSnowflakes(flakes)
  }, [])

  const handleSignup = async () => {
    if (!isConfigured) {
      toast("Configuration Error", {
        description: "Firebase is not properly configured. Check your environment variables.",
      })
      return
    }

    try {
      await signInWithGoogle()
      toast("Sign In Successful", {
        description: "You are now signed in with Google",
      })
    } catch (error) {
      toast("Sign In Failed", {
        description: "There was an error signing in with Google",
      })
      console.error(error)
    }
  }

  // Show Firebase configuration error
  if (!isConfigured) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        <Toaster />
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500" />

        {/* Content */}
        <Card className="relative z-10 w-full max-w-md shadow-lg bg-white/10 backdrop-blur-md p-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Firebase Configuration Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-white text-center">
              Firebase is not properly configured. Please check your <code>.env.local</code> file 
              and ensure all required variables are set.
            </p>
            <Button size="lg" className="w-full bg-white text-purple-700 hover:bg-white/90" onClick={handleSignup}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Show loading state
  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <Toaster />
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500" />

      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 text-white pointer-events-none"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration}s linear infinite`,
          }}
        >
          ❄
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Welcome</h1>
        <Button size="lg" className="bg-white text-purple-700 hover:bg-white/90" onClick={handleSignup}>
          Sign in with Google
        </Button>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </main>
  )
}

