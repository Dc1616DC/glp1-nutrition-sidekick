#!/bin/bash

echo "🔐 Setting up Environment Variables on Vercel"
echo "=============================================="
echo ""

# Check if logged in
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "📝 Reading environment variables from .env.local..."
echo ""

# Source the env file
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    exit 1
fi

# Read each variable and add to Vercel
# For each environment: production, preview, development

echo "Adding environment variables to Vercel..."
echo ""

# Function to add env var to all environments
add_env_var() {
    local key=$1
    local value=$2

    echo "Adding $key..."

    # Add to production
    echo "$value" | vercel env add "$key" production --yes 2>/dev/null || \
        vercel env rm "$key" production --yes 2>/dev/null && echo "$value" | vercel env add "$key" production --yes

    # Add to preview
    echo "$value" | vercel env add "$key" preview --yes 2>/dev/null || \
        vercel env rm "$key" preview --yes 2>/dev/null && echo "$value" | vercel env add "$key" preview --yes

    # Add to development
    echo "$value" | vercel env add "$key" development --yes 2>/dev/null || \
        vercel env rm "$key" development --yes 2>/dev/null && echo "$value" | vercel env add "$key" development --yes
}

# Extract and add variables from .env.local
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue

    # Remove quotes from value
    value="${value%\"}"
    value="${value#\"}"

    # Skip if value is empty
    [[ -z "$value" ]] && continue

    # Add to Vercel
    add_env_var "$key" "$value"

done < .env.local

echo ""
echo "✅ All environment variables added to Vercel!"
echo ""
echo "🚀 Next step: Run ./deploy-to-vercel.sh to deploy"
echo ""
