// src/services/functionService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';

// Initialize Firebase Functions
const functions = getFunctions(app);

/**
 * Response type for function calls
 */
interface FunctionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Test notification response
 */
interface TestNotificationResponse {
  success: boolean;
  message: string;
}

/**
 * Reminder trigger response
 */
interface TriggerRemindersResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Service to interact with Firebase Cloud Functions
 */
class FunctionService {
  /**
   * Sends a test notification to the current user
   * This calls the Cloud Function 'sendTestNotification'
   * 
   * @returns Promise with the function response
   */
  async sendTestNotification(): Promise<FunctionResponse<TestNotificationResponse>> {
    try {
      // Get the callable function
      const sendTestNotificationFn = httpsCallable<void, TestNotificationResponse>(
        functions,
        'sendTestNotification'
      );
      
      // Call the function
      const result = await sendTestNotificationFn();
      
      return {
        success: true,
        data: result.data,
        message: result.data.message
      };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Manually triggers meal reminders
   * This makes a direct HTTP request to the 'triggerMealReminders' endpoint
   * 
   * Note: This is primarily for testing and admin purposes
   * 
   * @returns Promise with the function response
   */
  async triggerMealReminders(): Promise<FunctionResponse<TriggerRemindersResponse>> {
    try {
      // Determine the correct URL for the function
      // In production, this would be your deployed function URL
      // For local development, you'd use the emulator URL
      const isProduction = process.env.NODE_ENV === 'production';
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      // Function URL format depends on environment
      const functionUrl = isProduction
        ? `https://us-central1-${projectId}.cloudfunctions.net/triggerMealReminders`
        : `http://localhost:5001/${projectId}/us-central1/triggerMealReminders`;
      
      // Make the HTTP request
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json() as TriggerRemindersResponse;
      
      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      console.error('Error triggering meal reminders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Checks if Firebase Functions are available
   * This can be used to determine if the app should show function-dependent features
   * 
   * @returns Boolean indicating if functions are available
   */
  isFunctionsAvailable(): boolean {
    try {
      // Check if functions are initialized
      return !!functions;
    } catch (error) {
      console.error('Error checking functions availability:', error);
      return false;
    }
  }
}

// Export a singleton instance
const functionService = new FunctionService();
export default functionService;
