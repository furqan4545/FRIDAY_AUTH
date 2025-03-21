"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PricingPlans } from "@/components/pricing-plans"
import { useAuth } from "@/lib/auth-context"
import { Home, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { FooterYear } from "@/app/components/FooterWithClientComponents"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

// Custom CSS for the shine effect
const cardStyles = {
  shine: `after:absolute after:content-[''] after:w-[200%] after:h-[200%] 
          after:top-[-100%] after:left-[-100%] after:bg-gradient-to-r 
          after:from-transparent after:via-white/5 after:to-transparent 
          after:transition-all after:duration-700 after:rotate-[30deg] 
          group-hover:after:translate-x-[80%] after:opacity-0 group-hover:after:opacity-100
          overflow-hidden`,
  hoverLift: `transition-transform duration-300 group-hover:translate-y-[-8px]`,
}

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  )
}

function WavePattern() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-0 transform z-20">
      <svg
        className="relative block w-full h-[70px] sm:h-[100px] md:h-[120px]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0z"
          className="fill-[#030303] opacity-50"
        ></path>
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          className="fill-[#030303] opacity-25"
        ></path>
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          className="fill-[#030303]"
        ></path>
      </svg>
    </div>
  )
}

export default function PricingPage() {
  const { user } = useAuth()
  const [clientLoaded, setClientLoaded] = useState(false)
  
  // This ensures we only render subscription-dependent parts after client-side hydration
  useEffect(() => {
    setClientLoaded(true)
  }, [])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  return (
    <>
      {/* Glassmorphic Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="relative">
          {/* Light effect */}
          <div className="absolute -top-20 left-1/4 w-1/2 h-32 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-pink-600/20 blur-3xl rounded-full transform"></div>
          
          {/* Glassmorphic bar */}
          <div className="relative backdrop-blur-md border-b border-white/10 bg-black/10">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
              <Link href="/website">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              
              <nav className="flex items-center gap-2 md:gap-4">
                {!clientLoaded || !user ? (
                  <>
                    <Link href="/signup">
                      <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3 py-1.5 text-sm">
                        Login
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full px-4 py-1.5 text-sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

        <div className="absolute inset-0 overflow-hidden">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-indigo-500/[0.15]"
            className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
          />

          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-rose-500/[0.15]"
            className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
          />

          <ElegantShape
            delay={0.4}
            width={300}
            height={80}
            rotate={-8}
            gradient="from-violet-500/[0.15]"
            className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
          />

          <ElegantShape
            delay={0.6}
            width={200}
            height={60}
            rotate={20}
            gradient="from-amber-500/[0.15]"
            className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
          />

          <ElegantShape
            delay={0.7}
            width={150}
            height={40}
            rotate={-25}
            gradient="from-cyan-500/[0.15]"
            className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-32">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Choose Your</span>
                <br />
                <span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ",
                    pacifico.className,
                  )}
                >
                  Friday Plan
                </span>
              </h1>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className="text-base sm:text-lg md:text-xl text-white/40 mt-6 mb-12 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                Unlock the full potential of Friday with our flexible pricing options.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-6xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row gap-8 mt-12 w-full max-w-5xl mx-auto mb-16">
              {/* Monthly Plan Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="group flex-1 relative rounded-xl overflow-hidden border border-indigo-400/20"
              >
                <div className={cn("relative flex flex-col bg-gradient-to-br from-indigo-600 to-purple-600 p-8 h-full shadow-lg z-10", cardStyles.shine)}>
                  <div className={cn("relative z-10", cardStyles.hoverLift)}>
                    <h3 className="text-white text-2xl font-bold mb-4">Monthly Plan</h3>
                    <div className="mb-6">
                      <span className="text-white text-4xl font-bold">$3</span>
                      <span className="text-indigo-200">/month</span>
                    </div>
                    <p className="text-indigo-100 mb-8">Perfect for developers who want continuous access to our features.</p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center text-indigo-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>Access to all updates</span>
                      </li>
                      <li className="flex items-center text-indigo-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>Beta features included</span>
                      </li>
                      <li className="flex items-center text-indigo-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>Cancel anytime</span>
                      </li>
                    </ul>
                    <Button
                      asChild
                      className="w-full bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
                    >
                      <Link href={clientLoaded && user ? "/dashboard" : "/dashboard"}>
                        {clientLoaded && user ? "Manage Dashboard" : "Get Started"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Lifetime Plan Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="group flex-1 relative rounded-xl overflow-hidden border border-violet-400/20"
              >
                {/* Special offer badge */}
                <div className="absolute top-2 right-2 z-20">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg">
                    Best Value
                  </div>
                </div>
                
                <div className={cn("relative flex flex-col bg-gradient-to-br from-violet-600 to-pink-600 p-8 h-full shadow-lg z-10", cardStyles.shine)}>
                  <div className={cn("relative z-10", cardStyles.hoverLift)}>
                    <h3 className="text-white text-2xl font-bold mb-4">Lifetime Plan</h3>
                    <div className="mb-6">
                      <span className="text-white text-4xl font-bold">$10</span>
                      <span className="text-violet-200">/lifetime</span>
                    </div>
                    <p className="text-violet-100 mb-8">One-time payment for developers who prefer a single purchase.</p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center text-violet-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>One-time payment</span>
                      </li>
                      <li className="flex items-center text-violet-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>One year of updates</span>
                      </li>
                      <li className="flex items-center text-violet-100">
                        <Check size={20} className="mr-2 text-white" />
                        <span>Bug fixes included</span>
                      </li>
                    </ul>
                    <Button
                      asChild
                      className="w-full bg-white text-violet-700 hover:bg-violet-50 hover:scale-105 transition-all duration-300"
                    >
                      <Link href={clientLoaded && user ? "/dashboard" : "/dashboard"}>
                        {clientLoaded && user ? "Manage Dashboard" : "Get Lifetime Access"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />

        <WavePattern />
      </div>

      {/* Feature comparison section - moved outside the hero section */}
      <div className="bg-[#030303] py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white/90 text-center mb-10">Detailed Feature Comparison</h2>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div className="col-span-1 text-white/60 font-medium">Feature</div>
              <div className="col-span-1 text-indigo-300 font-medium">Monthly</div>
              <div className="col-span-1 text-pink-300 font-medium">Lifetime</div>
            </div>
            
            <div className="space-y-4 bg-[#030303] p-6 rounded-lg border border-white/5 shadow-xl">
              {[
                { feature: "All core features", monthly: true, lifetime: true },
                { feature: "Bug Fixes", monthly: true, lifetime: true },
                { feature: "Priority support", monthly: false, lifetime: true },
                { feature: "Early access to new features", monthly: true, lifetime: true },
                { feature: "Future major version updates", monthly: true, lifetime: "1 year" },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 py-3 border-b border-white/5 items-center">
                  <div className="col-span-1 text-white/80">{item.feature}</div>
                  <div className="col-span-1 flex justify-center">
                    {typeof item.monthly === "boolean" ? (
                      item.monthly ? (
                        <Check size={20} className="text-indigo-400" />
                      ) : (
                        <div className="text-white/30">—</div>
                      )
                    ) : (
                      <span className="text-indigo-400">{item.monthly}</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {typeof item.lifetime === "boolean" ? (
                      item.lifetime ? (
                        <Check size={20} className="text-pink-400" />
                      ) : (
                        <div className="text-white/30">—</div>
                      )
                    ) : (
                      <span className="text-pink-400">{item.lifetime}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#030303] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {[
              {
                question: "How does the monthly subscription work?",
                answer: "Our monthly subscription gives you full access to all Friday features for as long as you maintain your subscription. You'll be charged $3 at the start of each billing cycle."
              },
              {
                question: "What happens if I cancel my subscription?",
                answer: "If you cancel your subscription, you'll maintain access until the end of your current billing cycle. After that, you'll lose access to premium features but can still use the basic version."
              },
              {
                question: "Is the lifetime plan really one-time payment?",
                answer: "Yes! The lifetime plan is a one-time payment of $10 that gives you unlimited access to the current version of Friday plus all updates for a full year after purchase."
              },
              {
                question: "Do you offer refunds?",
                answer: "We offer a 14-day money-back guarantee for both monthly and lifetime plans. If you're not satisfied, contact our support team within 14 days of purchase for a full refund."
              },
              {
                question: "Can I switch between plans?",
                answer: "Yes, you can upgrade from monthly to lifetime at any time. When upgrading, we'll apply any unused portion of your current subscription as credit toward your lifetime purchase."
              }
            ].map((item, index) => (
              <div key={index} className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-medium text-white/90 mb-3">{item.question}</h3>
                <p className="text-white/60">{item.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-white/50 mb-4">Still have questions?</p>
            <Button 
              onClick={() => window.location.href = "mailto:ali@showces.com"}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#030303] border-t border-white/5 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
            <div className="mb-2 md:mb-0">
              Built with <span className="text-pink-500 mx-1">♥</span> & few shots of caffeine
            </div>
            <FooterYear />
          </div>
        </div>
      </footer>
    </>
  )
} 