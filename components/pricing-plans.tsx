"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import stripePromise from "@/lib/stripe";

type PlanType = "monthly" | "lifetime";

interface PricingPlanProps {
  className?: string;
  subscriptionData?: {
    hasPaid: boolean;
    planType: string | null;
    status: string | null;
  };
}

export function PricingPlans({ className, subscriptionData }: PricingPlanProps) {
  const [loading, setLoading] = useState<PlanType | null>(null);
  const { user } = useAuth();

  const isCurrentPlan = (planType: PlanType) => {
    return subscriptionData?.hasPaid && subscriptionData?.planType === planType;
  };

  const handleSubscription = async (planType: PlanType) => {
    // If this is already the user's plan, do nothing
    if (isCurrentPlan(planType)) {
      toast("Current Plan", {
        description: `You are already subscribed to the ${planType} plan.`,
      });
      return;
    }
    
    if (!user) {
      toast("Authentication Required", {
        description: "Please sign in to subscribe to a plan",
      });
      return;
    }

    setLoading(planType);

    try {
      // Call your API route to create a Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
          userId: user.uid,
          email: user.email,
          isUpgrade: subscriptionData?.hasPaid && subscriptionData?.planType === "monthly" && planType === "lifetime",
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast("Checkout Failed", {
        description: "There was a problem starting the checkout process. Please try again.",
      });
    }
    
    setLoading(null);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto ${className}`}>
      {/* Monthly Plan */}
      <Card className={`flex flex-col border-2 transition-colors duration-200 ${isCurrentPlan("monthly") ? "border-green-400 bg-green-50" : "hover:border-purple-400"}`}>
        <CardHeader className="pb-2">
          {isCurrentPlan("monthly") && (
            <div className="flex items-center text-green-600 text-sm font-medium mb-1">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Current Plan
            </div>
          )}
          <CardTitle className="text-xl">Monthly Plan</CardTitle>
          <CardDescription>Perfect for regular updates</CardDescription>
          <div className="mt-3 flex items-baseline text-gray-900">
            <span className="text-3xl font-bold tracking-tight">$3</span>
            <span className="ml-1 text-xl text-gray-500">/month</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Access to all updates</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Beta features included</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Cancel anytime</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full ${isCurrentPlan("monthly") ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}`}
            onClick={() => handleSubscription("monthly")}
            disabled={loading !== null || isCurrentPlan("monthly")}
          >
            {loading === "monthly" 
              ? "Processing..." 
              : isCurrentPlan("monthly")
                ? "Current Plan"
                : "Subscribe Monthly"}
          </Button>
        </CardFooter>
      </Card>

      {/* Lifetime Plan */}
      <Card className={`flex flex-col border-2 transition-colors duration-200 ${isCurrentPlan("lifetime") ? "border-green-400 bg-green-50" : "hover:border-purple-400"}`}>
        <CardHeader className="pb-2">
          {isCurrentPlan("lifetime") && (
            <div className="flex items-center text-green-600 text-sm font-medium mb-1">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Current Plan
            </div>
          )}
          <CardTitle className="text-xl">Lifetime Plan</CardTitle>
          <CardDescription>One-time payment, long-term value</CardDescription>
          <div className="mt-3 flex items-baseline text-gray-900">
            <span className="text-3xl font-bold tracking-tight">$10</span>
            <span className="ml-1 text-xl text-gray-500">/lifetime</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>One-time payment</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>One year of updates</span>
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span>Bug fixes included</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full ${isCurrentPlan("lifetime") ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"}`}
            onClick={() => handleSubscription("lifetime")}
            disabled={loading !== null || isCurrentPlan("lifetime")}
          >
            {loading === "lifetime" 
              ? "Processing..." 
              : isCurrentPlan("lifetime")
                ? "Current Plan" 
                : subscriptionData?.planType === "monthly"
                  ? "Upgrade to Lifetime"
                  : "Get Lifetime Access"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 