#!/bin/bash

# Script to add Firebase Admin SDK environment variables to Vercel

echo "🔐 Adding Firebase Admin SDK environment variables to Vercel..."
echo ""

# Extract values from the .env.local file
PROJECT_ID="glp-1-nutrition-sidekick"
CLIENT_EMAIL="firebase-adminsdk-fbsvc@glp-1-nutrition-sidekick.iam.gserviceaccount.com"
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCrU1MfueB41gBz
7wCRDVlyEQARUg9XetI3nuXU191jrzlJro5hTI+7/FMtff2cCWhlgVR2NZQgCOuj
kHfyIvuBwJqw3zuAxy2mczUSmkzNWn4sB3NH6BLVA9tnU6cbog9tIHEuvoB+UDDz
NBCPLdb6IXAFhN3Y6fJAk5duXBNu3FtXtaDHmxKdyruPTJ3PvhKBzKHIuTz6eOpc
TS0O7lQy/zP4jozco3z2/8UBc5fIvU6IMDA5vi069KbonsdEgZfW6+nl5qj/WMpn
Glyf1HJDiKVYHksT7cGLXHAyLDKP93BCNxPdBAjoLX+ocv9NSY7XX+MTVEfSEXN+
q/BIu6wLAgMBAAECggEAEuqo3McVGhJ69fy3jHcztJdcRrf6T1eVhXmrI89P4l/9
tyfUZbmNN0hFgNo5RIokt5cflcvAVrHVdCJmnrAud/r7DuN0ZPmDuK4IzUyHMAy5
WLAxPN51fIVSq5Eo0YbD0EdK5/U10nyVOGKRH4Cut2s2Eg3ubDMXQfpp4nq9KeTG
vC7OsiHN9CVdZs815UkvcIVtlTL6V1jXNS15U3mUHRVVo9Fdy8Gi0qzesjTzCSQA
IbiVKTOskVON3I5VeuaeJ/Wc+bywoOQkdYFdY2+866jztFR+XFuiuu+MNHbvIfV+
bwZ13csLns2/0LGK153eBabbVR9NaaRwifTyrPouIQKBgQDhST8k+sbGlljI1lbk
YrjePynCMEk9JkPozYrbh5IUfTgRpPcmOKuH1+vVciS5KRD5rGfgJeWjdunahxB/
L/YZ4yyS9vzmfc+IB4H0J31Plgn26cqAUtIalcUTw+pFg7768r3sNtOLzcN3O/Tu
TeW4q4eAOOmydkpkIXg/Pp3v4QKBgQDCrsmvTncq7E4Pv+/nPwa5KuV/fjDduxse
jhedRMVUaYRQrAkqin44MtXhtmnEEch7jFP6F+iJfppa4pJm3Mq1z599coTNVCkP
dyI88FNleAOSPhaoggeJaREGwcSVr5jLwWrRovwk8mmQGZDf1Z/63QKQIDNE2Kwp
GWaW9nmJawKBgGUrlp7Nu6x84hw3HUhtCSZNaTxaoNlEMOUAQSZ7CGAJJ7/MvGy+
sFFN5wuwucspJQVqpi9j9W9mPHi1hPQJHtTbTy4kmsgLocIt1O9HOKAf+hOXRChC
iTYFIj7REYjsNDzP+/hzWqcC3Y/TLhhChTJcXXp4lIJfWuMCoNSOEzEhAoGBAI9A
C7mJ9BfKXzopkj5G2wyfKtWgJhbRmYfnKCsZslWFes3deLUryOpTRZvbHIIgT7PR
Mu2gcAPT+4IKm41Cw4n6ZzHodR2c4sW1dKUAdW0BXSdbtlJxs1gBznx5UcyOs9Ch
1pbA5eXN1a0pkreROjFeNIeWmgL7p9pqDVnhrNZXAoGBAJa+bTzVqITD/1tEJA0o
JPV9FoiXmgE13BnWB4TuqGSimPnrEKmNQt+VAvs/7YWAnpqWdry+EQbRiFIQea/r
p1J03xXrkuKBkfSsKoT1gE2egEOvuQqlLiUisbDy1HilKVzxqQggwFLZBctMsyR/
ZnnLUWflExkHv6/8HOj6xxMM
-----END PRIVATE KEY-----"

echo "📝 The following environment variables will be added to Vercel:"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_CLIENT_EMAIL"
echo "  - FIREBASE_PRIVATE_KEY"
echo ""
echo "⚠️  IMPORTANT: This script will add these to ALL environments (development, preview, production)"
echo ""
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "Adding environment variables to Vercel..."

# Add environment variables using Vercel CLI
# Add to production
echo "$PROJECT_ID" | vercel env add FIREBASE_PROJECT_ID production
echo "$CLIENT_EMAIL" | vercel env add FIREBASE_CLIENT_EMAIL production
echo "$PRIVATE_KEY" | vercel env add FIREBASE_PRIVATE_KEY production

# Add to preview
echo "$PROJECT_ID" | vercel env add FIREBASE_PROJECT_ID preview
echo "$CLIENT_EMAIL" | vercel env add FIREBASE_CLIENT_EMAIL preview
echo "$PRIVATE_KEY" | vercel env add FIREBASE_PRIVATE_KEY preview

# Add to development
echo "$PROJECT_ID" | vercel env add FIREBASE_PROJECT_ID development
echo "$CLIENT_EMAIL" | vercel env add FIREBASE_CLIENT_EMAIL development
echo "$PRIVATE_KEY" | vercel env add FIREBASE_PRIVATE_KEY development

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Test the meal generator in production"
echo "3. If working, run: ./remove-auth-bypass.sh"
echo ""
echo "⚠️  The authentication bypass is still active. Remove it once you verify Firebase Admin is working!"