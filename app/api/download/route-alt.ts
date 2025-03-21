import { NextResponse } from 'next/server';

// Alternative approach if you make your S3 object public or host the file elsewhere
export async function GET() {
  try {
    // You would need to change your S3 bucket policy to make this object public
    // Or host the file somewhere else with public access
    const publicDownloadUrl = "https://publicbucketfriday.s3.us-east-1.amazonaws.com/DMG/Friday+1.0.dmg";
    
    // Redirect to the public URL
    return NextResponse.redirect(publicDownloadUrl);
  } catch (error) {
    console.error('Error redirecting to download:', error);
    return NextResponse.json(
      { error: 'Failed to redirect to download' },
      { status: 500 }
    );
  }
} 