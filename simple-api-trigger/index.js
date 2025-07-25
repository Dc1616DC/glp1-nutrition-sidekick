const functions = require('firebase-functions');

// No Firebase Admin SDK import or initialization

// Simple HTTP function with absolutely no Firebase Admin SDK usage
exports.triggerMealReminders = functions.https.onRequest(async (req, res) => {
  // API key authentication
  const apiKey = req.query.apiKey || req.query.key;
  const validApiKey = 'glp1nutrition2025';
  
  if (!apiKey || apiKey !== validApiKey) {
    console.log('Unauthorized access attempt to triggerMealReminders');
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid API key required'
    });
    return;
  }

  // Extremely simplified function that doesn't use any Firebase services
  res.status(200).json({
    success: true,
    message: 'Function executed successfully - version 2.',
    timestamp: new Date().toISOString()
  });
});
