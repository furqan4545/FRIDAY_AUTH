import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebase-admin';

// Initialize Stripe with your secret key
console.log('Stripe Mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'Live' : 'Test');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15' as any, // Match webhook API version
});

export async function POST(req: NextRequest) {
  try {
    const { planType, userId, email, isUpgrade } = await req.json();
    console.log('Request details:', { planType, userId, email, isUpgrade });

    // First, check if user already has an active subscription
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const hasActiveSubscription = userData?.status === 'active' && userData?.subscriptionId;
    
    console.log('User subscription status:', {
      hasActiveSubscription,
      currentPlanType: userData?.planType,
      targetPlanType: planType
    });

    // If user has active subscription and trying to get the same plan type, prevent it
    if (hasActiveSubscription && userData?.planType === planType) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this plan' },
        { status: 400 }
      );
    }

    // Set up pricing based on plan type
    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_LIFETIME_PRICE_ID;

    console.log('Selected price ID:', priceId);

    // Verify the price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId as string);
      console.log('Price details:', {
        id: price.id,
        active: price.active,
        type: price.type,
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'Live' : 'Test'
      });
    } catch (priceError) {
      console.error('Error retrieving price:', priceError);
      return NextResponse.json(
        { error: 'Invalid price ID or price not found in Stripe' },
        { status: 400 }
      );
    }

    let customerId = userData?.customerId;
    
    // Handle upgrade from monthly to lifetime
    if (hasActiveSubscription && planType === 'lifetime') {
      console.log('Processing upgrade to lifetime plan...');
      try {
        // Cancel the current subscription immediately
        if (userData?.subscriptionId) {
          await stripe.subscriptions.cancel(userData.subscriptionId);
          console.log('Cancelled existing subscription:', userData.subscriptionId);
          
          // Update user status in Firestore
          await firestore.collection('users').doc(userId).update({
            subscriptionId: null,
            subscriptionStatus: 'canceled',
            // Don't update status to inactive since they're upgrading
          });
        }
      } catch (error) {
        console.error('Error canceling existing subscription:', error);
        // Continue with the upgrade even if cancellation fails
      }
    }

    // Store user's email in Firestore
    if (email) {
      try {
        await firestore.collection('users').doc(userId).set({
          email: email,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving user email to Firestore:', error);
      }
    }

    // Create checkout session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: planType === 'monthly' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        planType,
        isUpgrade: hasActiveSubscription ? 'true' : 'false',
        previousPlan: hasActiveSubscription ? userData?.planType : null,
        userEmail: email || '',
      },
      allow_promotion_codes: true,
    };
    
    // Use existing customer ID if available
    if (customerId) {
      sessionOptions.customer = customerId;
      console.log('Using existing customer ID:', customerId);
    } else if (email) {
      sessionOptions.customer_email = email;
      console.log('Using customer email:', email);
    }

    // Create the session
    console.log('Creating checkout session with options:', {
      mode: sessionOptions.mode,
      planType,
      isUpgrade: hasActiveSubscription
    });
    const session = await stripe.checkout.sessions.create(sessionOptions);
    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 