import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/summary-data
 * Returns aggregated training data for AI analysis
 * Query params:
 *   - days: number of days to fetch (default: 14)
 */
export async function GET(request: Request) {
  // Add CORS headers to allow Claude Code to fetch this data
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '14');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch all entries in range
    const entries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: startDateStr,
          lte: endDateStr,
        },
      },
      include: {
        workouts: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (entries.length === 0) {
      return NextResponse.json({
        message: 'No data available yet',
        entries: [],
      }, { headers });
    }

    // Calculate aggregates
    const strains = entries.map(e => e.strain).filter((s): s is number => s !== null);
    const sleepScores = entries.map(e => e.sleepScore).filter((s): s is number => s !== null);

    const avgStrain = strains.length > 0
      ? (strains.reduce((a, b) => a + b, 0) / strains.length).toFixed(1)
      : null;

    const avgSleep = sleepScores.length > 0
      ? Math.round(sleepScores.reduce((a, b) => a + b, 0) / sleepScores.length)
      : null;

    // Count readiness bands
    const readinessCounts = {
      green: entries.filter(e => e.readiness === 'green').length,
      yellow: entries.filter(e => e.readiness === 'yellow').length,
      red: entries.filter(e => e.readiness === 'red').length,
    };

    // Count workout types
    const workoutTypes: Record<string, number> = {};
    let totalWorkouts = 0;
    entries.forEach(entry => {
      entry.workouts.forEach(workout => {
        workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
        totalWorkouts++;
      });
    });

    // Format daily data
    const dailyData = entries.map(entry => ({
      date: entry.date,
      strain: entry.strain,
      readiness: entry.readiness,
      sleepScore: entry.sleepScore,
      steps: entry.steps,
      caloriesBurned: entry.caloriesBurned,
      workouts: entry.workouts.map(w => ({
        type: w.type,
        duration: Math.round(w.duration / 60), // minutes
      })),
    }));

    return NextResponse.json({
      period: `${startDateStr} to ${endDateStr}`,
      daysAnalyzed: entries.length,
      summary: {
        avgStrain,
        avgSleep,
        totalWorkouts,
        readiness: readinessCounts,
        workoutTypes,
      },
      dailyData,
    }, { headers });
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary data' },
      { status: 500, headers }
    );
  }
}
