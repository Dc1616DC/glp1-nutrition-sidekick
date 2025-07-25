const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Simple HTTP function (2nd Gen) with invoker set to 'public'
exports.helloWorld = functions.https.onRequest({
  region: 'us-central1',
  invoker: 'public'  // Allow public access
}, (req, res) => {
  const now = new Date();
  console.log(`Hello World function executed at ${now.toISOString()}`);
  
  res.status(200).json({
    message: 'Hello from Firebase Functions (2nd Gen)!',
    timestamp: now.toISOString()
  });
});
