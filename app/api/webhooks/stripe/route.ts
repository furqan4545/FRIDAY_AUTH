import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { firestore } from '@/lib/firebase-admin';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

// This is your Stripe webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Generate a secure secret key for the user
function generateSecretKey(): string {
  // Generate a 32-byte random string
  return crypto.randomBytes(24).toString('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  console.log('Received webhook request');
  console.log('Signature:', sig);
  console.log('Endpoint secret:', endpointSecret);

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.error('Missing signature or endpoint secret');
      return NextResponse.json(
        { error: 'Missing signature or endpoint secret' }, 
        { status: 400 }
      );
    }
    
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log('Webhook event constructed successfully:', event.type);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` }, 
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Processing checkout.session.completed:', session.id);
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.created:', subscription.id);
        await handleSubscriptionCreated(subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Processing invoice.payment_succeeded:', invoice.id);
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Processing customer.subscription.deleted:', subscription.id);
        await handleSubscriptionDeleted(subscription);
        break;
      }
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return NextResponse.json(
      { error: 'Error processing webhook event' }, 
      { status: 500 }
    );
  }
}

// Event handler functions

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Checkout session completed:', session.id);
    const userId = session.client_reference_id;
    let customerEmail = session.customer_email;
    const planType = session.metadata?.planType;
    
    console.log('Session details:', {
      userId,
      customerEmail,
      planType,
      customer: session.customer,
      subscription: session.subscription
    });

    if (!userId) {
      console.error('No userId found in session reference');
      return;
    }

    // If no email in session, try to get it from the customer
    if (!customerEmail && session.customer) {
      try {
        const customer = await stripe.customers.retrieve(session.customer as string);
        if (customer && !customer.deleted && customer.email) {
          customerEmail = customer.email;
          console.log('Retrieved customer email:', customerEmail);
        }
      } catch (error) {
        console.error('Error fetching customer details:', error);
      }
    }

    // If still no email, try to get it from Firebase Auth
    if (!customerEmail) {
      try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data()?.email) {
          customerEmail = userDoc.data()?.email;
          console.log('Retrieved email from Firebase:', customerEmail);
        }
      } catch (error) {
        console.error('Error fetching user from Firebase:', error);
      }
    }

    // Generate a unique secret key for this user
    const secretKey = generateSecretKey();
    console.log('Generated secret key for user:', userId);
    
    // Update user subscription data in Firestore
    const updateData = {
      email: customerEmail || null,
      planType: planType,
      paidAt: new Date(),
      subscriptionId: session.subscription, // if subscription
      customerId: session.customer, // stripe customer id
      status: 'active',
      secretKey: secretKey,
      lastPaymentDate: new Date(),
    };
    
    console.log('Updating Firestore with data:', updateData);
    await firestore.collection('users').doc(userId).set(updateData, { merge: true });
    
    console.log(`Successfully updated user ${userId} with payment information and secret key`);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id);
    
    // Get customer ID
    const customerId = subscription.customer as string;
    
    // Try to get customer email
    let customerEmail = null;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted && customer.email) {
        customerEmail = customer.email;
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
    
    // Find the user with this customer ID
    const usersSnapshot = await firestore
      .collection('users')
      .where('customerId', '==', customerId)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('No matching user found for customerId:', customerId);
      return;
    }
    
    // Update user subscription data
    const userDoc = usersSnapshot.docs[0];
    
    // Generate secret key if user doesn't have one
    let secretKey = userDoc.data().secretKey;
    if (!secretKey) {
      secretKey = generateSecretKey();
    }
    
    // Update user record
    const updateData: any = {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planType: 'monthly', // Subscriptions are always monthly
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: 'active',
      secretKey: secretKey,
    };
    
    // Only update email if we have one and the current one is null
    if (customerEmail && !userDoc.data().email) {
      updateData.email = customerEmail;
    }
    
    await userDoc.ref.update(updateData);
    
    console.log(`Updated user ${userDoc.id} with new subscription information`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id);
    
    // Only process subscription invoices
    if (!invoice.subscription) return;
    
    // Find the user with this subscription
    const usersSnapshot = await firestore
      .collection('users')
      .where('subscriptionId', '==', invoice.subscription)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('No matching user found for subscription:', invoice.subscription);
      return;
    }
    
    // Update subscription status
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      subscriptionStatus: 'active',
      lastPaymentDate: new Date(),
      status: 'active',
    });
    
    console.log(`Updated user ${userDoc.id} after successful payment`);
  } catch (error) {
    console.error('Error handling invoice payment:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id);
    
    // Find the user with this subscription
    const usersSnapshot = await firestore
      .collection('users')
      .where('subscriptionId', '==', subscription.id)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('No matching user found for subscription:', subscription.id);
      return;
    }
    
    // Update subscription status
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({
      subscriptionStatus: 'canceled',
      status: 'inactive',
      canceledAt: new Date(),
    });
    
    console.log(`Updated user ${userDoc.id} after subscription cancellation`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
} 