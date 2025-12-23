import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin } from '@/lib/db-admin';

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

    // Get retrospective from Firestore
    const retrospective = await getRetrospectiveAdmin(retrospectiveId);
    
    if (!retrospective) {
      return NextResponse.json(
        { error: 'Retrospective not found' },
        { status: 404 }
      );
    }

    // Return metadata (userPic and friendPic)
    return NextResponse.json({
      userPic: retrospective.userPic,
      friendPic: retrospective.friendPic,
    });
  } catch (error: any) {
    console.error('❌ [retrospective-metadata] Error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch retrospective metadata',
      },
      { status: 500 }
    );
  }
}

