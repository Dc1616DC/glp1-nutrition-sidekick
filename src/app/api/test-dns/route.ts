import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

export async function GET() {
  try {
    console.log('Testing DNS resolution for api.nal.usda.gov...');
    
    // Test DNS resolution
    try {
      const result = await lookup('api.nal.usda.gov');
      console.log('DNS Resolution successful:', result);
    } catch (dnsError) {
      console.log('DNS Resolution failed:', dnsError);
    }

    // Test with different DNS servers
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS
    
    try {
      const addresses = await promisify(resolver.resolve4.bind(resolver))('api.nal.usda.gov');
      console.log('Google DNS resolution:', addresses);
    } catch (googleDnsError) {
      console.log('Google DNS failed:', googleDnsError);
    }

    // Test if we can make the actual API call
    try {
      console.log('Attempting direct API call...');
      const response = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?query=apple&api_key=DEMO_KEY', {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'USDA API is accessible',
          results: data.foods?.length || 0
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `API returned ${response.status}: ${response.statusText}`
        });
      }
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        message: 'Fetch failed',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
