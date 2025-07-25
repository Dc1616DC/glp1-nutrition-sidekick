import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  console.log('🔍 Testing Grok API configuration...');
  
  const results = {
    environmentCheck: {
      hasGrokKey: !!process.env.GROK_API_KEY,
      grokKeyLength: process.env.GROK_API_KEY?.length || 0,
      keyPrefix: process.env.GROK_API_KEY?.substring(0, 10) + '...' || 'NOT SET',
    },
    apiTest: {
      success: false,
      error: null as any,
      response: null as any,
    }
  };

  try {
    // Test the Grok API
    const grok = new OpenAI({
      apiKey: process.env.GROK_API_KEY!,
      baseURL: 'https://api.x.ai/v1',
    });

    console.log('📡 Attempting Grok API call...');
    
    const response = await grok.chat.completions.create({
      model: 'grok-2-1212',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant. This is a test message.'
        },
        { 
          role: 'user', 
          content: 'Reply with a simple JSON object containing a "status" field set to "ok" and a "message" field saying "Grok API is working".'
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 100,
    });

    results.apiTest.success = true;
    results.apiTest.response = {
      model: response.model,
      content: response.choices[0].message.content,
      usage: response.usage,
    };
    
    console.log('✅ Grok API test successful');

  } catch (error: any) {
    console.error('❌ Grok API test failed:', error);
    results.apiTest.error = {
      message: error.message,
      type: error.constructor.name,
      status: error.status || error.response?.status,
      code: error.code,
      details: error.response?.data || error.error || 'No additional details',
    };
  }

  return NextResponse.json(results, { 
    status: results.apiTest.success ? 200 : 500 
  });
}