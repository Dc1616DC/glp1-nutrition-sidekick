import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1',
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50),
      privateKeyContainsLiteralN: process.env.FIREBASE_PRIVATE_KEY?.includes('\\n'),
      privateKeyFirstLine: process.env.FIREBASE_PRIVATE_KEY?.split('\n')[0],
    }
  });
}