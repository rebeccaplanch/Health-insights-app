import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get historical data for trends
 * GET /api/trends?days=30
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch all daily entries in range
    const dailyEntries = await prisma.dailyEntry.findMany({
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
        date: 'asc',
      },
    });

    // Parse insights from JSON
    const entriesWithParsedInsights = dailyEntries.map(entry => ({
      ...entry,
      insights: entry.insights ? JSON.parse(entry.insights) : [],
    }));

    // Calculate summary stats
    const validStrains = dailyEntries
      .map(e => e.strain)
      .filter((s): s is number => s !== null);

    const totalSteps = dailyEntries
      .map(e => e.steps || 0)
      .reduce((sum, s) => sum + s, 0);

    const totalCalories = dailyEntries
      .map(e => e.caloriesBurned || 0)
      .reduce((sum, c) => sum + c, 0);

    const allWorkouts = dailyEntries.flatMap(e => e.workouts);

    // Workout type breakdown
    const workoutTypes: Record<string, number> = {};
    allWorkouts.forEach(w => {
      workoutTypes[w.type] = (workoutTypes[w.type] || 0) + 1;
    });

    // Calculate averages
    const avgStrain = validStrains.length > 0
      ? validStrains.reduce((sum, s) => sum + s, 0) / validStrains.length
      : 0;

    const avgSteps = dailyEntries.length > 0
      ? totalSteps / dailyEntries.length
      : 0;

    // Find personal bests
    const maxStrain = Math.max(...validStrains, 0);
    const maxSteps = Math.max(...dailyEntries.map(e => e.steps || 0), 0);
    const maxCalories = Math.max(...dailyEntries.map(e => e.caloriesBurned || 0), 0);

    // Count readiness distribution
    const readinessCount = {
      green: dailyEntries.filter(e => e.readiness === 'green').length,
      yellow: dailyEntries.filter(e => e.readiness === 'yellow').length,
      red: dailyEntries.filter(e => e.readiness === 'red').length,
    };

    return NextResponse.json({
      dailyEntries: entriesWithParsedInsights,
      summary: {
        avgStrain: Math.round(avgStrain * 10) / 10,
        avgSteps: Math.round(avgSteps),
        totalSteps,
        totalCalories,
        totalWorkouts: allWorkouts.length,
        workoutTypes,
        maxStrain,
        maxSteps,
        maxCalories,
        readinessCount,
        activeDays: dailyEntries.filter(e => e.strain && e.strain > 0).length,
      },
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
