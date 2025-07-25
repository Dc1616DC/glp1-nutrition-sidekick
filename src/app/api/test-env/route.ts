import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.USDA_API_KEY;
    
    return NextResponse.json({
      success: true,
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyFirst10: apiKey?.substring(0, 10) || 'none',
      envKeys: Object.keys(process.env).filter(key => key.includes('USDA')),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
