// Re-export all functions from the compiled TypeScript output
const functions = require('./lib/index.js');

// Export all the Cloud Functions
exports.checkAndSendMealReminders = functions.checkAndSendMealReminders;
exports.triggerMealReminders = functions.triggerMealReminders;
exports.sendTestNotification = functions.sendTestNotification;
