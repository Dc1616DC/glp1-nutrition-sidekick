const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Simple test function with HTTP trigger
exports.helloWorld = functions
  .region('us-east4')
  .https.onRequest((request, response) => {
    const timestamp = new Date().toISOString();
    console.log(`Hello World function executed at ${timestamp}`);
    
    response.status(200).json({
      message: 'Hello from Firebase Functions in us-east4!',
      timestamp: timestamp
    });
  });
