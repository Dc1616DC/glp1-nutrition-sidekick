/**
 * Error Message Sanitization
 * Prevents internal system information disclosure through error messages
 */

interface SanitizedError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Sanitizes error messages to prevent information disclosure
 * In production, returns generic messages. In development, returns detailed messages.
 */
export function sanitizeError(error: unknown, context?: string): SanitizedError {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default sanitized response
  const sanitized: SanitizedError = {
    message: 'An internal server error occurred',
    code: 'INTERNAL_ERROR'
  };

  if (error instanceof Error) {
    if (isDevelopment) {
      // In development, return full error details
      sanitized.message = error.message;
      sanitized.details = error.stack;
    } else {
      // In production, only return safe error types
      if (isUserError(error)) {
        sanitized.message = error.message;
      }
      
      // Add context if provided
      if (context) {
        sanitized.code = context;
      }
    }
  }

  // Log the full error for monitoring (but not to client)
  if (!isDevelopment) {
    console.error(`Error in ${context || 'unknown'}:`, error);
  }

  return sanitized;
}

/**
 * Determines if an error is safe to show to users
 * User errors are validation errors, authentication errors, etc.
 */
function isUserError(error: Error): boolean {
  const userErrorTypes = [
    'ValidationError',
    'AuthenticationError',
    'AuthorizationError',
    'NotFoundError',
    'RateLimitError',
    'BadRequestError'
  ];

  const userErrorMessages = [
    'Invalid input',
    'Authentication required',
    'Access denied',
    'Not found',
    'Rate limit exceeded',
    'Invalid request'
  ];

  // Check error name/type
  if (userErrorTypes.some(type => error.name.includes(type))) {
    return true;
  }

  // Check error message content
  if (userErrorMessages.some(msg => error.message.toLowerCase().includes(msg.toLowerCase()))) {
    return true;
  }

  return false;
}

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(
  error: unknown, 
  status: number = 500, 
  context?: string
): Response {
  const sanitized = sanitizeError(error, context);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: sanitized.message,
      code: sanitized.code,
      ...(sanitized.details && { details: sanitized.details })
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

/**
 * Rate limiting specific error
 */
export function createRateLimitError(): Response {
  return createErrorResponse(
    new Error('Rate limit exceeded. Please try again later.'),
    429,
    'RATE_LIMIT_EXCEEDED'
  );
}

/**
 * Authentication specific error
 */
export function createAuthError(): Response {
  return createErrorResponse(
    new Error('Authentication required. Please sign in.'),
    401,
    'AUTHENTICATION_REQUIRED'
  );
}

/**
 * Validation specific error
 */
export function createValidationError(message: string): Response {
  return createErrorResponse(
    new Error(message),
    400,
    'VALIDATION_ERROR'
  );
}