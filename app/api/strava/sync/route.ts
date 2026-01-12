import { NextRequest, NextResponse } from 'next/server';
import { fetchStravaActivities, isStravaConnected } from '@/lib/strava';
import { prisma } from '@/lib/prisma';
import { extractDateFromDateTime } from '@/lib/utils';

/**
 * Sync Strava activities
 * POST /api/strava/sync
 * Body: { backfillDays?: number }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Strava is connected
    const connected = await isStravaConnected();
    if (!connected) {
      return NextResponse.json(
        { error: 'Strava not connected' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { backfillDays } = body;

    let after: number | undefined;
    let activityCount = 0;
    let newActivityCount = 0;

    if (backfillDays) {
      // Backfill mode: fetch last N days
      const backfillDate = new Date();
      backfillDate.setDate(backfillDate.getDate() - backfillDays);
      after = Math.floor(backfillDate.getTime() / 1000);
    } else {
      // Incremental mode: fetch since last sync (with 2-day safety window)
      const auth = await prisma.stravaAuth.findFirst();

      if (auth?.lastSync) {
        const lastSyncDate = new Date(auth.lastSync);
        lastSyncDate.setDate(lastSyncDate.getDate() - 2); // 2-day safety window
        after = Math.floor(lastSyncDate.getTime() / 1000);
      } else {
        // No last sync, default to 30 days
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 30);
        after = Math.floor(defaultDate.getTime() / 1000);
      }
    }

    // Fetch activities from Strava (paginated)
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const activities = await fetchStravaActivities(after, undefined, page, 100);

      if (activities.length === 0) {
        hasMore = false;
        break;
      }

      // Process each activity
      for (const activity of activities) {
        activityCount++;

        // Extract date from start_date_local
        const date = extractDateFromDateTime(activity.start_date_local);

        // Check if activity already exists
        const existing = await prisma.workout.findUnique({
          where: { providerActivityId: activity.id.toString() },
        });

        if (!existing) {
          newActivityCount++;

          // Create or get daily entry for this date
          const dailyEntry = await prisma.dailyEntry.upsert({
            where: { date },
            create: { date },
            update: {},
          });

          // Convert kilojoules to calories (1 kJ = 0.239 kcal, or divide by 4.184)
          const calories = activity.kilojoules 
            ? Math.round(activity.kilojoules / 4.184) 
            : null;

          // Create workout
          await prisma.workout.create({
            data: {
              providerActivityId: activity.id.toString(),
              date,
              startDateLocal: new Date(activity.start_date_local),
              type: activity.type,
              name: activity.name,
              duration: activity.moving_time,
              distance: activity.distance,
              elevation: activity.total_elevation_gain,
              averageHeartrate: activity.average_heartrate || null,
              calories: calories,
              rawData: JSON.stringify(activity),
              dailyEntryId: dailyEntry.id,
            },
          });

          // Trigger score recomputation for this date
          try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            await fetch(`${baseUrl}/api/scores/compute`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date }),
            });
          } catch (error) {
            console.error(`Error computing scores for ${date}:`, error);
          }
        }
      }

      page++;

      // Safety limit: max 10 pages (1000 activities)
      if (page > 10) {
        hasMore = false;
      }
    }

    // Update lastSync timestamp
    await prisma.stravaAuth.updateMany({
      data: {
        lastSync: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      activityCount,
      newActivityCount,
      message: `Synced ${newActivityCount} new activities out of ${activityCount} total`,
    });
  } catch (error) {
    console.error('Error syncing Strava activities:', error);
    return NextResponse.json(
      { error: 'Failed to sync Strava activities' },
      { status: 500 }
    );
  }
}

/**
 * Get Strava sync status
 * GET /api/strava/sync
 */
export async function GET() {
  try {
    const connected = await isStravaConnected();

    if (!connected) {
      return NextResponse.json({ connected: false });
    }

    const auth = await prisma.stravaAuth.findFirst();
    const workoutCount = await prisma.workout.count();

    return NextResponse.json({
      connected: true,
      lastSync: auth?.lastSync || null,
      workoutCount,
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
