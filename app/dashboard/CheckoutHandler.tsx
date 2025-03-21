'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// Interface for subscription data
interface SubscriptionData {
  hasPaid: boolean;
  secretKey: string | null;
  planType: string | null;
  status: string | null;
}

// Client component that uses useSearchParams
export function CheckoutHandler({ 
  user, 
  onSubscriptionUpdate 
}: { 
  user: any; 
  onSubscriptionUpdate: (data: SubscriptionData) => void 
}) {
  // The useSearchParams hook is isolated in this client component
  const searchParams = useSearchParams();
  
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
          .then(data => onSubscriptionUpdate(data))
          .catch(err => console.error('Error refreshing subscription data:', err));
      }
    }

    if (canceled) {
      toast("Payment Canceled", {
        description: "Your payment was canceled.",
      })
    }
  }, [searchParams, user, onSubscriptionUpdate]);
  
  // This component doesn't render any UI
  return null;
} 