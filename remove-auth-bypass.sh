#!/bin/bash

# Script to remove temporary authentication bypass after Firebase Admin SDK is configured

echo "🔒 Removing temporary authentication bypass..."

# Files to update
FILES=(
  "src/app/api/generate-meal-options/route.ts"
  "src/app/api/generate-meal-options-new/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Remove the temporary bypass block (lines containing TEMPORARY bypass)
    sed -i.bak '/\/\/ Temporary production bypass/,/^  }/d' "$file" 2>/dev/null || \
    sed -i '' '/\/\/ Temporary production bypass/,/^  }/d' "$file" 2>/dev/null
    
    # Clean up backup files
    rm -f "$file.bak"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎯 Next steps:"
echo "1. Commit the changes: git add -A && git commit -m 'Remove temporary auth bypass - Firebase Admin SDK configured'"
echo "2. Push to deploy: git push"
echo "3. Test the meal generator in production"
echo ""
echo "⚠️  Make sure you've added the Firebase Admin SDK environment variables to Vercel before deploying!"