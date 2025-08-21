import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  try {
    // 1. Check request headers
    const authHeader = request.headers.get('authorization');
    diagnostics.checks.hasAuthHeader = !!authHeader;
    diagnostics.checks.authHeaderFormat = authHeader?.startsWith('Bearer ') || false;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No valid auth header',
        diagnostics
      }, { status: 400 });
    }

    const token = authHeader.split('Bearer ')[1];
    diagnostics.checks.tokenLength = token?.length;
    diagnostics.checks.tokenStart = token?.substring(0, 20);

    // 2. Check environment variables
    diagnostics.env = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50),
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV
    };

    // 3. Try to initialize Firebase Admin fresh
    let adminApp;
    try {
      // Clear any existing apps
      const existingApps = getApps();
      diagnostics.checks.existingApps = existingApps.length;
      
      if (existingApps.length === 0) {
        if (process.env.FIREBASE_PROJECT_ID && 
            process.env.FIREBASE_CLIENT_EMAIL && 
            process.env.FIREBASE_PRIVATE_KEY) {
          
          const serviceAccount: ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID.trim(),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim()
          };
          
          diagnostics.serviceAccount = {
            projectId: serviceAccount.projectId,
            clientEmail: serviceAccount.clientEmail,
            privateKeyProcessed: !!serviceAccount.privateKey,
            privateKeyLines: serviceAccount.privateKey?.split('\n').length
          };
          
          adminApp = initializeApp({
            credential: cert(serviceAccount)
          }, 'debug-' + Date.now());
          
          diagnostics.checks.adminInitialized = true;
        } else {
          diagnostics.checks.adminInitialized = false;
          diagnostics.checks.missingEnvVars = true;
        }
      } else {
        adminApp = existingApps[0];
        diagnostics.checks.adminInitialized = true;
        diagnostics.checks.usedExistingApp = true;
      }
    } catch (initError: any) {
      diagnostics.initError = {
        message: initError.message,
        code: initError.code,
        stack: initError.stack?.split('\n').slice(0, 3)
      };
      diagnostics.checks.adminInitialized = false;
    }

    // 4. Try to verify the token
    if (adminApp) {
      try {
        const auth = getAuth(adminApp);
        const decodedToken = await auth.verifyIdToken(token);
        
        diagnostics.tokenVerification = {
          success: true,
          uid: decodedToken.uid,
          email: decodedToken.email,
          iss: decodedToken.iss,
          aud: decodedToken.aud,
          auth_time: new Date(decodedToken.auth_time * 1000).toISOString(),
          exp: new Date(decodedToken.exp * 1000).toISOString(),
          iat: new Date(decodedToken.iat * 1000).toISOString()
        };
        
        // Check if token is expired
        const now = Date.now() / 1000;
        diagnostics.tokenVerification.isExpired = decodedToken.exp < now;
        diagnostics.tokenVerification.expiresIn = Math.floor((decodedToken.exp - now) / 60) + ' minutes';
        
        return NextResponse.json({
          success: true,
          message: 'Token verified successfully!',
          userId: decodedToken.uid,
          diagnostics,
          duration: Date.now() - startTime
        });
        
      } catch (verifyError: any) {
        diagnostics.verifyError = {
          message: verifyError.message,
          code: verifyError.code,
          codePrefix: verifyError.codePrefix,
          errorInfo: verifyError.errorInfo
        };
        
        // Common error explanations
        if (verifyError.code === 'auth/argument-error') {
          diagnostics.likelyIssue = 'Token format is invalid';
        } else if (verifyError.code === 'auth/id-token-expired') {
          diagnostics.likelyIssue = 'Token has expired - user needs to sign in again';
        } else if (verifyError.code === 'auth/invalid-credential') {
          diagnostics.likelyIssue = 'Service account credentials are invalid';
        } else if (verifyError.code === 'auth/project-id-mismatch') {
          diagnostics.likelyIssue = 'Token is from different Firebase project';
        }
      }
    }

    // 5. Try manual JWT decode (without verification)
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        diagnostics.manualDecode = {
          success: true,
          iss: payload.iss,
          aud: payload.aud,
          email: payload.email,
          uid: payload.user_id || payload.sub,
          exp: new Date(payload.exp * 1000).toISOString(),
          projectFromToken: payload.iss?.split('/').pop()
        };
        
        // Check project match
        if (payload.aud !== process.env.FIREBASE_PROJECT_ID?.trim()) {
          diagnostics.projectMismatch = {
            tokenProject: payload.aud,
            envProject: process.env.FIREBASE_PROJECT_ID?.trim(),
            matches: false
          };
        }
      }
    } catch (decodeError: any) {
      diagnostics.manualDecodeError = decodeError.message;
    }

    return NextResponse.json({
      success: false,
      message: 'Token verification failed but diagnostics collected',
      diagnostics,
      duration: Date.now() - startTime
    }, { status: 401 });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      diagnostics,
      duration: Date.now() - startTime
    }, { status: 500 });
  }
}