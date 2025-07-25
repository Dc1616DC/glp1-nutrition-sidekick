// Import Firebase Functions SDK
import * as functions from 'firebase-functions/v1';

/**
 * Simple test function to verify deployment to us-central1
 * This is an HTTP function that returns a basic JSON response
 */
export const testFunction = functions
  .region('us-central1')
  .https
  .onRequest((request, response) => {
    // Log the request
    console.log('Test function executed', {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path
    });

    // Send a simple response
    response.status(200).json({
      success: true,
      message: 'Test function deployed successfully to us-central1!',
      timestamp: new Date().toISOString()
    });
  });
