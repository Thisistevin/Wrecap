import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin } from '@/lib/db-admin';
import { adminStorage } from '@/lib/firebase-admin';

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

    console.log('📥 [retrospective-content] Fetching content for:', retrospectiveId);

    // Get retrospective from Firestore
    const retrospective = await getRetrospectiveAdmin(retrospectiveId);
    
    if (!retrospective) {
      return NextResponse.json(
        { error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    if (!retrospective.textContentJson) {
      return NextResponse.json(
        { error: 'Retrospective content not available' },
        { status: 404 }
      );
    }

    // Get JSON from Firebase Storage using Admin SDK
    if (!adminStorage) {
      throw new Error('Firebase Admin Storage not initialized');
    }

    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set');
    }

    const bucket = adminStorage.bucket(storageBucket);
    const file = bucket.file(retrospective.textContentJson);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json(
        { error: 'Content file not found' },
        { status: 404 }
      );
    }

    // Download file content
    const [fileContent] = await file.download();
    const jsonContent = JSON.parse(fileContent.toString('utf-8'));

    console.log('✅ [retrospective-content] Content fetched successfully');

    // Return JSON with proper CORS headers
    return NextResponse.json(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('❌ [retrospective-content] Error:', error);
    console.error('❌ [retrospective-content] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch retrospective content',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

