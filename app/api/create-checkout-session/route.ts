import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebase-admin';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15' as any, // Match webhook API version
});

export async function POST(req: NextRequest) {
  try {
    const { planType, userId, email, isUpgrade } = await req.json();

    // Set up pricing based on plan type
    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_LIFETIME_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan type' },
        { status: 400 }
      );
    }

    // If this is an upgrade from monthly to lifetime, we need to cancel the current subscription
    let customerId: string | undefined;
    
    if (isUpgrade) {
      // Get the user's current subscription data
      const userDoc = await firestore.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        customerId = userData?.customerId;
        const subscriptionId = userData?.subscriptionId;
        
        // Cancel the current subscription if it exists
        if (subscriptionId) {
          try {
            await stripe.subscriptions.update(subscriptionId, {
              cancel_at_period_end: true,
            });
            console.log(`Updated subscription ${subscriptionId} to cancel at period end`);
          } catch (error) {
            console.error(`Error canceling subscription ${subscriptionId}:`, error);
          }
        }
      }
    }

    // Store user's email in Firestore regardless of payment
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
      client_reference_id: userId, // Store the Firebase user ID as reference
      metadata: {
        userId,
        planType,
        isUpgrade: isUpgrade ? 'true' : 'false',
        userEmail: email || '',
      },
    };
    
    // If we have a customer ID from an upgrade, use it
    if (customerId) {
      sessionOptions.customer = customerId;
    } else if (email) {
      // Otherwise use email if available
      sessionOptions.customer_email = email;
    }

    // Create the session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 