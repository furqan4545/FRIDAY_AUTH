"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy, AlertTriangle, Home, LogOut, Loader2, Menu, X } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { PricingPlans } from "@/components/pricing-plans"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { CheckoutHandler } from "./CheckoutHandler"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    hasPaid: false,
    secretKey: null,
    planType: null,
    status: null
  })
  const { user, signOut, isConfigured } = useAuth()
  const router = useRouter()

  // Simple auth loading effect - wait for 200ms to let Firebase initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthLoading(false)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [])

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
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
      
      {/* Wrap the checkout handler in Suspense boundary */}
      <Suspense fallback={null}>
        <CheckoutHandler 
          user={user}
          onSubscriptionUpdate={setSubscriptionData}
        />
      </Suspense>
      
      {/* Rest of the UI */}
      <DashboardUI 
        user={user}
        subscriptionData={subscriptionData}
        copied={copied}
        emailCopied={emailCopied}
        mobileMenuOpen={mobileMenuOpen}
        copyToClipboard={copyToClipboard}
        copyEmailToClipboard={copyEmailToClipboard}
        handleSignOut={handleSignOut}
        toggleMobileMenu={toggleMobileMenu}
      />
    </main>
  )
}

// Separate the UI part to reduce complexity in the main component
function DashboardUI({
  user,
  subscriptionData,
  copied,
  emailCopied,
  mobileMenuOpen,
  copyToClipboard,
  copyEmailToClipboard,
  handleSignOut,
  toggleMobileMenu
}: {
  user: any;
  subscriptionData: SubscriptionData;
  copied: boolean;
  emailCopied: boolean;
  mobileMenuOpen: boolean;
  copyToClipboard: () => void;
  copyEmailToClipboard: () => void;
  handleSignOut: () => void;
  toggleMobileMenu: () => void;
}) {
  return (
    <>
      {/* Navigation bar */}
      <div className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center relative">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Friday Dashboard</h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/website">
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                <span>Website</span>
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                <span>Pricing</span>
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
          
          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="absolute top-full right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg z-50 md:hidden">
              <Link href="/website" onClick={() => toggleMobileMenu()}>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Website</span>
                </div>
              </Link>
              <Link href="/pricing" onClick={() => toggleMobileMenu()}>
                <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <span>Pricing</span>
                </div>
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
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

        {/* Pricing Section */}
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
    </>
  );
}

// Tell Next.js this is a dynamic page that shouldn't be statically optimized
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

