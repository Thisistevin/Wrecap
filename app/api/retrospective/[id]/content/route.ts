import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin } from '@/lib/db-admin';
import { adminStorage, initializeAdmin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const retrospectiveId = params.id;

    if (!retrospectiveId) {
      return NextResponse.json(
        { error: 'Missing retrospective ID' },
        { status: 400 }
      );
    }

    logger.log('📥 [retrospective-content] Fetching content for:', retrospectiveId);

    // Ensure Firebase Admin is initialized
    try {
      const { adminStorage: storage } = initializeAdmin();
      if (!storage) {
        throw new Error('Firebase Admin Storage not initialized');
      }
    } catch (initError: any) {
      logger.error('❌ [retrospective-content] Firebase Admin initialization error:', initError);
      throw new Error(`Firebase Admin initialization failed: ${initError.message}`);
    }

    // Get retrospective from Firestore
    const retrospective = await getRetrospectiveAdmin(retrospectiveId);
    
    if (!retrospective) {
      logger.warn('⚠️ [retrospective-content] Retrospective not found:', retrospectiveId);
      return NextResponse.json(
        { error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    logger.log('📋 [retrospective-content] Retrospective found:', {
      id: retrospectiveId,
      status: retrospective.status,
      hasTextContentJson: !!retrospective.textContentJson,
      textContentJson: retrospective.textContentJson,
    });

    if (!retrospective.textContentJson) {
      logger.warn('⚠️ [retrospective-content] No textContentJson in retrospective');
      return NextResponse.json(
        { error: 'Retrospective content not available' },
        { status: 404 }
      );
    }

    // Get JSON from Firebase Storage using Admin SDK
    // Ensure Firebase Admin is initialized (already done above, but double-check)
    const { adminStorage: storage } = initializeAdmin();
    if (!storage) {
      throw new Error('Firebase Admin Storage not available');
    }

    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set');
    }

    logger.log('📦 [retrospective-content] Storage bucket:', storageBucket);
    logger.log('📁 [retrospective-content] File path:', retrospective.textContentJson);

    const bucket = storage.bucket(storageBucket);
    const file = bucket.file(retrospective.textContentJson);

    // Check if file exists
    logger.log('🔍 [retrospective-content] Checking if file exists...');
    const [exists] = await file.exists();
    if (!exists) {
      logger.error('❌ [retrospective-content] File does not exist:', retrospective.textContentJson);
      return NextResponse.json(
        { error: 'Content file not found in storage' },
        { status: 404 }
      );
    }

    logger.log('✅ [retrospective-content] File exists, downloading...');

    // Download file content
    const [fileContent] = await file.download();
    const jsonContent = JSON.parse(fileContent.toString('utf-8'));

    logger.log('✅ [retrospective-content] Content fetched successfully, size:', fileContent.length, 'bytes');

    // Return JSON with proper CORS headers
    return NextResponse.json(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    logger.error('❌ [retrospective-content] Error:', error);
    logger.error('❌ [retrospective-content] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch retrospective content',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

