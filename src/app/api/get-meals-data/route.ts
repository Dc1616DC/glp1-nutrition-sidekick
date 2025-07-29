import { NextResponse } from 'next/server';
import { mealsData } from '../../../lib/meals-data';

export async function GET() {
  try {
    // Return the meals data
    return NextResponse.json(mealsData);
  } catch (error) {
    console.error('Error loading meals data:', error);
    return NextResponse.json(
      { error: 'Failed to load meals data', details: (error as Error).message }, 
      { status: 500 }
    );
  }
}