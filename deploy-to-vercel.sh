#!/bin/bash

echo "🚀 Vercel Deployment Script"
echo "================================"
echo ""
echo "This script will help you deploy your app to Vercel"
echo ""

# Step 1: Check if logged in
echo "Step 1: Checking Vercel login status..."
if vercel whoami > /dev/null 2>&1; then
    echo "✅ Already logged in to Vercel"
else
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "Please run: vercel login"
    echo "Then run this script again"
    exit 1
fi

echo ""
echo "Step 2: Deploying to Vercel..."
echo ""

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your app is now live!"
echo "Copy the URL above and open it on your phone to test"
echo ""
