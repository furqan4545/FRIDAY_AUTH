"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy, AlertTriangle, Home, LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { PricingPlans } from "@/components/pricing-plans"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface SubscriptionData {
  hasPaid: boolean;
  secretKey: string | null;
  planType: string | null;
  status: string | null;
}

export default function Dashboard() {
  const [copied, setCopied] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    hasPaid: false,
    secretKey: null,
    planType: null,
    status: null
  })
  const { user, signOut, isConfigured } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Simple auth loading effect - wait for 1 second to let Firebase initialize
  useEffect(() => {
    // Ensure we only redirect after this delay
    const timer = setTimeout(() => {
      setAuthLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscriptionData() {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/user/subscription?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }
        
        const data = await response.json();
        setSubscriptionData(data);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast("Error", {
          description: "Failed to load your subscription data. Please try again.",
        });
      }
    }
    
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  // Check for Stripe redirect status
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success) {
      toast("Payment Successful", {
        description: "Thank you for your purchase! Your secret key is now available.",
      })
      // Reload subscription data after successful payment
      if (user) {
        fetch(`/api/user/subscription?userId=${user.uid}`)
          .then(res => res.json())
          .then(data => setSubscriptionData(data))
          .catch(err => console.error('Error refreshing subscription data:', err));
      }
    }

    if (canceled) {
      toast("Payment Canceled", {
        description: "Your payment was canceled.",
      })
    }
  }, [searchParams, user])

  // Redirect if not logged in - BUT ONLY AFTER AUTH HAS INITIALIZED
  useEffect(() => {
    if (!authLoading && !user && isConfigured) {
      router.push("/signup");
    }
  }, [user, isConfigured, router, authLoading]);

  const copyToClipboard = () => {
    if (!user || !subscriptionData.secretKey) return
    
    navigator.clipboard.writeText(subscriptionData.secretKey)
    setCopied(true)

    toast("SECRET KEY COPIED", {
      description: "SECRET KEY has been copied to your clipboard",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const copyEmailToClipboard = () => {
    if (!user || !user.email) return
    
    navigator.clipboard.writeText(user.email)
    setEmailCopied(true)

    toast("Email Copied", {
      description: "Email has been copied to your clipboard",
    })

    setTimeout(() => setEmailCopied(false), 2000)
  }

  const handleSignOut = async () => {
    await signOut()
    toast("Signed Out", {
      description: "You have been signed out successfully",
    })
    router.push("/")
  }

  // Show loader while auth is initializing
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-xl">Loading your dashboard...</p>
      </div>
    );
  }

  // Show Firebase configuration error
  if (!isConfigured) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-500">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Firebase is not properly configured. Please check your environment variables in <code>.env.local</code>.</p>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no user, show simple redirect message (this is just during page transition)
  if (!user) {
    return null;
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster />
      
      {/* Navigation bar */}
      <div className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Friday Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/website">
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                <span>Website</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-6xl space-y-8 py-8">
        {/* Free plan banner - only show if user hasn't paid */}
        {!subscriptionData.hasPaid && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Free Plan</AlertTitle>
            <AlertDescription className="text-amber-700">
              You are currently on the free plan. Subscribe to get your unique secret key.
            </AlertDescription>
          </Alert>
        )}
        
        {/* User Info Card */}
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Your Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Welcome</p>
              <p className="text-lg font-bold">{user.displayName || user.email}</p>
              {user.email && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-500 mb-1">YOUR FRIDAY EMAIL</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                      <code>{user.email}</code>
                    </div>
                    <Button size="sm" variant="outline" onClick={copyEmailToClipboard} className="flex-shrink-0">
                      {emailCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {subscriptionData.hasPaid && subscriptionData.secretKey && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-1">YOUR FRIDAY SECRET KEY</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                    {subscriptionData.secretKey}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyToClipboard} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {subscriptionData.hasPaid && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Your Plan</p>
                <p className="text-md font-medium text-green-600 bg-green-50 py-1 px-2 rounded inline-block">
                  {subscriptionData.planType === 'monthly' ? 'Monthly Subscription' : 'Lifetime Plan'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Section - Now always shown for all users */}
        <div className="pt-10 pb-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            {subscriptionData.hasPaid ? "Manage Your Subscription" : "Choose Your Plan"}
          </h2>
          <p className="text-center text-gray-600 mb-8">
            {subscriptionData.hasPaid 
              ? subscriptionData.planType === "monthly" 
                ? "You're on the monthly plan. Consider upgrading to lifetime access." 
                : "You have lifetime access to Friday."
              : "Unlock the full potential of Friday with our premium plans"}
          </p>
          <PricingPlans subscriptionData={subscriptionData} />
        </div>
      </div>
    </main>
  )
}

