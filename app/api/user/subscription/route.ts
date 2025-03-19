import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // User hasn't paid yet, return empty data
      return NextResponse.json({ 
        hasPaid: false,
        secretKey: null,
        planType: null,
        status: null
      });
    }
    
    const userData = userDoc.data();
    
    // Check if user has an active subscription
    const hasPaid = userData?.status === 'active';
    
    return NextResponse.json({
      hasPaid,
      secretKey: userData?.secretKey || null,
      planType: userData?.planType || null,
      status: userData?.status || null,
      subscriptionId: userData?.subscriptionId || null,
      customerId: userData?.customerId || null,
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscription data' },
      { status: 500 }
    );
  }
} 