'use server'

// Server-side data fetching operations for the dashboard
export async function fetchUserSubscription(userId: string) {
  if (!userId) return null;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/subscription?userId=${userId}`, {
      // Force server-side fetch instead of client
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription data');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

// Mark this module as dynamic
export const dynamic = 'force-dynamic'; 