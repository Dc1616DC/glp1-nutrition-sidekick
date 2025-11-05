/**
 * Firestore Utility Functions
 * Handles data cleaning and validation for Firestore operations
 */

/**
 * Removes undefined and null values from an object before Firestore write
 * Firestore rejects undefined values but accepts null
 * @param data Object to clean
 * @returns Cleaned object without undefined/null fields
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): T {
  const cleaned = { ...data };
  
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  
  return cleaned as T;
}

/**
 * Validates that required fields are present in data object
 * @param data Object to validate
 * @param requiredFields Array of required field names
 * @returns True if all required fields present
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T, 
  requiredFields: string[]
): boolean {
  return requiredFields.every(field => 
    data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null
  );
}

/**
 * Sanitizes nested object data for Firestore
 * Handles deep cleaning of undefined values
 * @param data Object to sanitize (can be nested)
 * @returns Clean object safe for Firestore
 */
export function deepCleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as T;
  }
  
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined && item !== null)
      .map(item => deepCleanFirestoreData(item)) as T;
  }
  
  if (typeof data === 'object' && data !== null) {
    const cleaned: Record<string, any> = {};
    
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = deepCleanFirestoreData(value);
      }
    });
    
    return cleaned as T;
  }
  
  return data;
}

/**
 * Converts Date objects to Firestore Timestamps in nested data
 * @param data Object potentially containing Date objects
 * @returns Object with Dates converted to Timestamps
 */
export function convertDatesToTimestamps<T>(data: T): T {
  if (data instanceof Date) {
    return { seconds: Math.floor(data.getTime() / 1000), nanoseconds: 0 } as T;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertDatesToTimestamps(item)) as T;
  }
  
  if (typeof data === 'object' && data !== null) {
    const converted: Record<string, any> = {};
    
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      converted[key] = convertDatesToTimestamps(value);
    });
    
    return converted as T;
  }
  
  return data;
}