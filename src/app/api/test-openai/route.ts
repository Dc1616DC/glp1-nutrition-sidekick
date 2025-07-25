import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Simple test request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using cheaper model for test
      messages: [
        {
          role: "user",
          content: "Say 'OpenAI connection successful!' if you can read this."
        }
      ],
      max_tokens: 20,
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({ 
      success: true, 
      message: response,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyPreview: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : 
        'Not found'
    });

  } catch (error: any) {
    console.error('OpenAI test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      apiKeyExists: !!process.env.OPENAI_API_KEY,
      apiKeyPreview: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 8)}...` : 
        'Not found'
    });
  }
}
