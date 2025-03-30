import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Test Firestore connection
    const testDoc = await firestore.collection('test').doc('test').get();
    
    return NextResponse.json({
      status: 'ok',
      firestore: 'connected',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'missing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 