import { NextRequest, NextResponse } from 'next/server';
import { isStravaConnected, getValidAccessToken } from '@/lib/strava';

/**
 * Cron job endpoint for automated Strava sync
 * GET /api/cron/sync
 *
 * Secure this endpoint with CRON_SECRET in production
 * Add to Vercel Cron:
 * - Path: /api/cron/sync
 * - Schedule: 0 2 * * * (2am daily)
 * - Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connected = await isStravaConnected();

    if (!connected) {
      return NextResponse.json({
        success: true,
        message: 'Strava not connected, skipping sync',
      });
    }

    // Refresh access token (this happens automatically in getValidAccessToken)
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to refresh Strava token' },
        { status: 500 }
      );
    }

    // Trigger incremental sync
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const syncResponse = await fetch(`${baseUrl}/api/strava/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // No backfillDays = incremental sync
    });

    if (!syncResponse.ok) {
      throw new Error('Sync failed');
    }

    const syncData = await syncResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Cron sync completed',
      syncData,
    });
  } catch (error) {
    console.error('Error in cron sync:', error);
    return NextResponse.json(
      { error: 'Cron sync failed' },
      { status: 500 }
    );
  }
}
