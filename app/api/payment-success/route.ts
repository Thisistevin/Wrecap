import { NextRequest, NextResponse } from 'next/server';
import { getRetrospectiveAdmin } from '@/lib/db-admin';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const retrospectiveId = searchParams.get('retrospectiveId');

  if (!retrospectiveId) {
    return NextResponse.json({ error: 'Missing retrospectiveId' }, { status: 400 });
  }

  try {
    const retrospective = await getRetrospectiveAdmin(retrospectiveId);
    if (!retrospective) {
      return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
    }

    // Trigger retrospective processing in background
    if (retrospective.zipFileUrl) {
      const baseUrl = request.nextUrl.origin;
      logger.log('🚀 Triggering retrospective processing for:', retrospectiveId);
      logger.log('📦 Zip file URL:', retrospective.zipFileUrl);
      
      // Use absolute URL to ensure it works in all environments
      const processUrl = `${baseUrl}/api/process-retrospective`;
      logger.log('🔗 Processing URL:', processUrl);
      
      // Don't await - let it process in background
      fetch(processUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retrospectiveId,
          zipFileUrl: retrospective.zipFileUrl,
        }),
      })
      .then(async (response) => {
        logger.log('📥 Process retrospective response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          logger.error('❌ Process retrospective failed:', response.status, response.statusText);
          logger.error('❌ Error details:', errorText);
          // Update status to failed if processing fails to start
          const { updateRetrospectiveAdmin } = await import('@/lib/db-admin');
          await updateRetrospectiveAdmin(retrospectiveId, {
            status: 'failed',
          });
          return;
        }
        const data = await response.json();
        logger.log('✅ Retrospective processing started successfully:', data);
      })
      .catch(async (err) => {
        logger.error('❌ Background processing error:', err);
        logger.error('❌ Error stack:', err.stack);
        // Update status to failed if processing fails to start
        try {
          const { updateRetrospectiveAdmin } = await import('@/lib/db-admin');
          await updateRetrospectiveAdmin(retrospectiveId, {
            status: 'failed',
          });
        } catch (updateErr) {
          logger.error('❌ Failed to update status:', updateErr);
        }
      });
    } else {
      logger.warn('⚠️ No zipFileUrl found for retrospective:', retrospectiveId);
    }

    // Redirect to processing page
    return NextResponse.redirect(
      new URL(`/processing?retrospectiveId=${retrospectiveId}`, request.url)
    );
  } catch (error: any) {
    logger.error('Payment success error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

