import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import { logger } from './logger';

let app: App | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId) {
  logger.error('⚠️ NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
}

if (!storageBucket) {
  logger.error('⚠️ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set');
}

function initializeAdmin() {
  if (app && adminDb && adminStorage) {
    return { adminDb, adminStorage, app };
  }

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in environment variables');
  }

  if (!storageBucket) {
    throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set in environment variables');
  }

  if (getApps().length === 0) {
    // Priority 1: Try FIREBASE_SERVICE_ACCOUNT_KEY (environment variable - recommended)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        logger.log('🔑 Using FIREBASE_SERVICE_ACCOUNT_KEY from environment variable');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId,
          storageBucket: storageBucket,
        });
        logger.log('✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
      } catch (error: any) {
        logger.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Please check the JSON format. Error: ${error.message}`);
      }
    } 
    // Priority 2: Try GOOGLE_APPLICATION_CREDENTIALS (file path)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use file path for credentials
      try {
        const fs = require('fs');
        const path = require('path');
        // Handle both relative and absolute paths
        let credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        
        // If it's a relative path, resolve it relative to project root
        if (credentialsPath.startsWith('./') || !path.isAbsolute(credentialsPath)) {
          credentialsPath = path.resolve(process.cwd(), credentialsPath.replace(/^\.\//, ''));
        }
        
        logger.log('🔍 Looking for service account file at:', credentialsPath);
        
        if (!fs.existsSync(credentialsPath)) {
          const errorMsg = 
            `❌ Service account file not found: ${credentialsPath}\n\n` +
            `📋 QUICK FIX - Choose one option:\n\n` +
            `Option A: Use environment variable (RECOMMENDED - easier)\n` +
            `  1. Go to: https://console.firebase.google.com/project/wrecap-cb21d/settings/serviceaccounts/adminsdk\n` +
            `  2. Click "Generate new private key" and download the JSON\n` +
            `  3. Open the JSON file and copy ALL its content\n` +
            `  4. In your .env.local, REMOVE the GOOGLE_APPLICATION_CREDENTIALS line\n` +
            `  5. Add this line (paste the JSON content in one line):\n` +
            `     FIREBASE_SERVICE_ACCOUNT_KEY='{paste-json-here}'\n\n` +
            `Option B: Use file path\n` +
            `  1. Download the service account JSON (same link as above)\n` +
            `  2. Place it in: /Users/estevao/Programacao/wrecap/\n` +
            `  3. Update .env.local: GOOGLE_APPLICATION_CREDENTIALS=./actual-filename.json\n\n` +
            `📖 See QUICK_SETUP.md for detailed instructions.`;
          throw new Error(errorMsg);
        }
        
        const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        logger.log('✅ Service account file loaded successfully');
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId,
          storageBucket: storageBucket,
        });
      } catch (error: any) {
        logger.error('❌ Failed to initialize with GOOGLE_APPLICATION_CREDENTIALS:', error.message);
        throw new Error(`Firebase Admin initialization failed: ${error.message}`);
      }
    } else {
      // No credentials found - provide helpful error message
      const errorMsg = 
        `Firebase Admin SDK requires credentials to access Firestore and Storage.\n\n` +
        `Please configure one of the following:\n\n` +
        `Option 1: Use service account file\n` +
        `  1. Download service account JSON from Firebase Console\n` +
        `  2. Place it in your project root\n` +
        `  3. Add to .env.local: GOOGLE_APPLICATION_CREDENTIALS=./your-file.json\n\n` +
        `Option 2: Use environment variable\n` +
        `  1. Download service account JSON from Firebase Console\n` +
        `  2. Copy the entire JSON content\n` +
        `  3. Add to .env.local: FIREBASE_SERVICE_ACCOUNT_KEY='{...json content...}'\n\n` +
        `See QUICK_SETUP.md or FIREBASE_ADMIN_SETUP.md for detailed instructions.`;
      
      logger.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
  } else {
    app = getApps()[0];
  }

  adminDb = getFirestore(app);
  adminStorage = getStorage(app);
  
  return { adminDb, adminStorage, app };
}

// Initialize on module load (lazy initialization)
// During Vercel build, we skip initialization to avoid build failures
// Firebase Admin will be initialized when actually needed at runtime
try {
  // Skip initialization during build time
  // Vercel sets VERCEL=1 during build, but env vars might not be available
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  
  // Only initialize if we have all required env vars and not in build
  if (!isBuildTime && projectId && storageBucket && 
      (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    const services = initializeAdmin();
    adminDb = services.adminDb;
    adminStorage = services.adminStorage;
    app = services.app;
  } else if (isBuildTime) {
    // During build, just log that we're skipping initialization
    logger.log('⏭️ Skipping Firebase Admin initialization during build (will initialize at runtime)');
  }
} catch (error) {
  // Don't fail build if Firebase Admin can't initialize
  // It will be initialized when actually needed (at runtime via initializeAdmin())
  logger.error('⚠️ Failed to initialize Firebase Admin SDK (will retry at runtime):', error);
}

export { adminDb, adminStorage, app, initializeAdmin };
