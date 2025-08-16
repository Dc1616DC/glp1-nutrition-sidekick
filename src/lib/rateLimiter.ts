/**
 * Rate limiting middleware for API routes
 * Uses token bucket algorithm for smooth rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
  message?: string;     // Custom error message
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean;     // Only count successful requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  requests: number[];  // Track request timestamps for sliding window
}

// In-memory store for rate limit data
const rateLimitStore = new Map<string, TokenBucket>();

// Cleanup old entries on each request (serverless-friendly)
function cleanupOldEntries() {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  for (const [key, bucket] of rateLimitStore.entries()) {
    // Remove entries that haven't been used in the last hour
    if (bucket.lastRefill < oneHourAgo) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Default key generator - uses user ID for authenticated requests, IP for anonymous
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get user ID from various possible locations
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from Bearer token if possible
    const token = authHeader.replace('Bearer ', '');
    // Hash the token to avoid exposing partial token data in logs
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
    return `user:${hashedToken}`;
  }
  
  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Create rate limiter middleware with specified configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    message = 'Too many requests, please try again later.',
    keyGenerator = defaultKeyGenerator
  } = config;

  return async function rateLimitMiddleware(req: NextRequest): Promise<NextResponse | null> {
    // Cleanup old entries occasionally (1% chance per request)
    if (Math.random() < 0.01) {
      cleanupOldEntries();
    }
    
    const key = keyGenerator(req);
    const now = Date.now();
    
    // Get or create bucket for this key
    let bucket = rateLimitStore.get(key);
    
    if (!bucket) {
      bucket = {
        tokens: maxRequests,
        lastRefill: now,
        requests: []
      };
      rateLimitStore.set(key, bucket);
    }
    
    // Remove old requests outside the window
    bucket.requests = bucket.requests.filter(timestamp => 
      now - timestamp < windowMs
    );
    
    // Check if we've exceeded the limit
    if (bucket.requests.length >= maxRequests) {
      // Calculate when the oldest request will expire
      const oldestRequest = bucket.requests[0];
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000); // in seconds
      
      // Return rate limit error with headers
      return NextResponse.json(
        {
          error: message,
          retryAfter,
          limit: maxRequests,
          remaining: 0,
          reset: new Date(oldestRequest + windowMs).toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(oldestRequest + windowMs).toISOString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }
    
    // Add current request to the bucket
    bucket.requests.push(now);
    
    // Calculate remaining requests
    const remaining = maxRequests - bucket.requests.length;
    const reset = bucket.requests[0] ? new Date(bucket.requests[0] + windowMs) : new Date(now + windowMs);
    
    // Add rate limit headers to successful responses
    // Note: These will be added by the wrapper function
    return null; // Continue to the route handler
  };
}

/**
 * Predefined rate limiters for different API endpoint types
 */
export const rateLimiters = {
  // Strict limit for AI generation (expensive operations)
  aiGeneration: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'AI generation limit reached. You can generate 10 meals per hour. Please try again later.'
  }),
  
  // Moderate limit for recipe enhancement
  enhancement: createRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Recipe enhancement limit reached. You can enhance 5 recipes per hour.'
  }),
  
  // Lenient limit for data operations
  dataOperations: createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Request limit reached. Please wait before making more requests.'
  }),
  
  // Very lenient for read operations
  readOperations: createRateLimiter({
    maxRequests: 200,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Request limit reached. Please wait before making more requests.'
  }),

  // Strict limit for symptom-based generation
  symptomGeneration: createRateLimiter({
    maxRequests: 15,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Symptom-optimized meal generation limit reached (15 per hour). Please try again later.'
  })
};

/**
 * Wrapper to apply rate limiting to an API route handler
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  rateLimiter: ReturnType<typeof createRateLimiter>
) {
  return async function rateLimitedHandler(req: NextRequest): Promise<NextResponse> {
    // Check rate limit
    const rateLimitResponse = await rateLimiter(req);
    
    if (rateLimitResponse) {
      // Rate limit exceeded
      return rateLimitResponse;
    }
    
    // Continue to the actual handler
    const response = await handler(req);
    
    // Add rate limit info headers to successful responses
    const key = defaultKeyGenerator(req);
    const bucket = rateLimitStore.get(key);
    
    if (bucket) {
      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1 hour default
      const validRequests = bucket.requests.filter(timestamp => 
        now - timestamp < windowMs
      );
      const remaining = Math.max(0, 10 - validRequests.length); // Adjust max based on limiter
      
      response.headers.set('X-RateLimit-Limit', '10'); // Adjust based on limiter
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      
      if (validRequests.length > 0) {
        const reset = new Date(validRequests[0] + windowMs);
        response.headers.set('X-RateLimit-Reset', reset.toISOString());
      }
    }
    
    return response;
  };
}

/**
 * Helper to check if a user is approaching their rate limit
 */
export function checkRateLimitStatus(req: NextRequest, config: RateLimitConfig): {
  isNearLimit: boolean;
  remaining: number;
  limit: number;
  resetTime: Date | null;
} {
  const key = (config.keyGenerator || defaultKeyGenerator)(req);
  const bucket = rateLimitStore.get(key);
  
  if (!bucket) {
    return {
      isNearLimit: false,
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetTime: null
    };
  }
  
  const now = Date.now();
  const validRequests = bucket.requests.filter(timestamp => 
    now - timestamp < config.windowMs
  );
  
  const remaining = Math.max(0, config.maxRequests - validRequests.length);
  const isNearLimit = remaining <= Math.ceil(config.maxRequests * 0.2); // Within 20% of limit
  
  const resetTime = validRequests.length > 0 
    ? new Date(validRequests[0] + config.windowMs)
    : null;
  
  return {
    isNearLimit,
    remaining,
    limit: config.maxRequests,
    resetTime
  };
}