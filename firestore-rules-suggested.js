rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || 
                           request.auth.token.firebase.sign_in_provider == 'custom');
    }
    
    // User's meal data - nested under users
    match /users/{userId}/meals/{mealId} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || 
                           request.auth.token.firebase.sign_in_provider == 'custom');
    }
    
    // User's reminders - nested under users  
    match /users/{userId}/reminders/{reminderId} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || 
                           request.auth.token.firebase.sign_in_provider == 'custom');
    }
    
    // Public meal templates (read-only for all authenticated users)
    match /mealTemplates/{templateId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.firebase.sign_in_provider == 'custom'; // Only functions can write
    }
    
    // Public nutritional guidelines (read-only)
    match /nutritionGuidelines/{guidelineId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.firebase.sign_in_provider == 'custom'; // Only functions can write
    }
  }
}
