import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET() {
  try {
    // Create S3 client with your credentials
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    // Create the command
    const command = new GetObjectCommand({
      Bucket: 'publicbucketfriday',
      Key: 'DMG/Friday 1.0.dmg',
    });

    // Create pre-signed URL (valid for 5 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Redirect to the pre-signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
} 