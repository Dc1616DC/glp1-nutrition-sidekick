#!/usr/bin/env node

/**
 * Comprehensive App Test Script
 * Tests Firebase, APIs, and Environment Variables
 */

const https = require('https');
const http = require('http');

console.log('🧪 Starting GLP-1 Nutrition App Tests...\n');
console.log('='.repeat(60));

// Test Results Tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(test) {
  results.passed.push(test);
  console.log(`✅ PASS: ${test}`);
}

function fail(test, error) {
  results.failed.push({ test, error });
  console.log(`❌ FAIL: ${test}`);
  if (error) console.log(`   Error: ${error}`);
}

function warn(test, message) {
  results.warnings.push({ test, message });
  console.log(`⚠️  WARN: ${test}`);
  if (message) console.log(`   ${message}`);
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n📋 TEST 1: Environment Variables');
console.log('-'.repeat(60));

const requiredEnvVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
};

const optionalEnvVars = {
  'SPOONACULAR_API_KEY': process.env.SPOONACULAR_API_KEY,
  'GROK_API_KEY': process.env.GROK_API_KEY,
};

let envVarsPassed = true;
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.includes('your-') || value.includes('YOUR_')) {
    fail(`${key} is missing or has placeholder value`);
    envVarsPassed = false;
  } else {
    pass(`${key} is set`);
  }
}

for (const [key, value] of Object.entries(optionalEnvVars)) {
  if (!value || value.includes('your-') || value.includes('YOUR_')) {
    warn(`${key} is not set (optional)`);
  } else {
    pass(`${key} is set`);
  }
}

console.log('\n📋 TEST 2: Firebase Configuration');
console.log('-'.repeat(60));

// Test Firebase config format
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.startsWith('AIza')) {
  pass('Firebase API key format looks correct');
} else {
  fail('Firebase API key format looks invalid');
}

if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === process.env.FIREBASE_PROJECT_ID) {
  pass('Firebase project IDs match');
} else {
  fail('Firebase project IDs do not match between client and admin configs');
}

if (process.env.FIREBASE_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY')) {
  pass('Firebase private key format is correct');
} else {
  fail('Firebase private key format is invalid');
}

console.log('\n📋 TEST 3: API Key Validation');
console.log('-'.repeat(60));

// OpenAI API Key validation
if (process.env.OPENAI_API_KEY?.startsWith('sk-')) {
  pass('OpenAI API key format is correct');
} else {
  fail('OpenAI API key format is invalid (should start with sk-)');
}

// Spoonacular API Key validation
if (process.env.SPOONACULAR_API_KEY && process.env.SPOONACULAR_API_KEY.length === 32) {
  pass('Spoonacular API key format looks correct');
} else if (!process.env.SPOONACULAR_API_KEY) {
  warn('Spoonacular API key not set (optional, but recommended)');
} else {
  warn('Spoonacular API key format may be incorrect');
}

console.log('\n📋 TEST 4: Server Health Check');
console.log('-'.repeat(60));

// Check if Next.js server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        pass('Next.js server is running on port 3000');
        resolve(true);
      } else {
        fail('Next.js server returned unexpected status: ' + res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      fail('Next.js server is not running', err.message);
      resolve(false);
    });

    req.setTimeout(3000, () => {
      fail('Next.js server connection timeout');
      req.destroy();
      resolve(false);
    });
  });
};

console.log('\n📋 TEST 5: File Structure Check');
console.log('-'.repeat(60));

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/firebase/config.ts',
  'src/context/AuthContext.tsx',
  'src/services/subscriptionService.ts',
  'firestore.rules',
  'package.json',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    pass(`File exists: ${file}`);
  } else {
    fail(`File missing: ${file}`);
  }
});

// Check for .env.local
if (fs.existsSync(path.join(__dirname, '.env.local'))) {
  pass('.env.local file exists');
} else {
  fail('.env.local file is missing');
}

// Check if .env.local is in .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignore.includes('.env.local')) {
    pass('.env.local is properly ignored in git');
  } else {
    warn('.env.local should be added to .gitignore to prevent committing secrets');
  }
}

console.log('\n📋 TEST 6: Dependencies Check');
console.log('-'.repeat(60));

const packageJson = require('./package.json');
const criticalDeps = [
  'firebase',
  'next',
  'react',
  'openai',
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    pass(`Dependency installed: ${dep}@${packageJson.dependencies[dep]}`);
  } else {
    fail(`Missing critical dependency: ${dep}`);
  }
});

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  pass('node_modules directory exists');
} else {
  fail('node_modules directory missing - run: npm install');
}

// Run async tests
(async () => {
  await checkServer();

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n🔴 FAILED TESTS:');
    results.failed.forEach(({ test, error }) => {
      console.log(`   • ${test}`);
      if (error) console.log(`     ${error}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n🟡 WARNINGS:');
    results.warnings.forEach(({ test, message }) => {
      console.log(`   • ${test}`);
      if (message) console.log(`     ${message}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  if (results.failed.length === 0) {
    console.log('🎉 ALL CRITICAL TESTS PASSED!');
    console.log('\nYour app configuration looks good.');
    console.log('Next steps:');
    console.log('  1. Open http://localhost:3000 in your browser');
    console.log('  2. Try signing up / signing in');
    console.log('  3. Test the calculator feature');
    console.log('  4. Try generating a meal');
    process.exit(0);
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('\nPlease fix the failed tests above before proceeding.');
    process.exit(1);
  }
})();
