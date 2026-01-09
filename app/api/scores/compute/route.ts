import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDailyScores, Workout } from '@/lib/scoring';

/**
 * Compute and update scores for a specific date
 * POST /api/scores/compute
 * Body: { date: "YYYY-MM-DD" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Get today's entry
    const todayEntry = await prisma.dailyEntry.findUnique({
      where: { date },
      include: { workouts: true },
    });

    // If no entry exists, create one with null values
    if (!todayEntry) {
      const newEntry = await prisma.dailyEntry.create({
        data: { date },
        include: { workouts: true },
      });

      return NextResponse.json(newEntry);
    }

    // Get yesterday's strain
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    const yesterdayEntry = await prisma.dailyEntry.findUnique({
      where: { date: yesterdayDate },
    });

    // Get last 7 days of strains and calories
    const sevenDaysAgo = new Date(date);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0];

    const recentEntries = await prisma.dailyEntry.findMany({
      where: {
        date: {
          gte: sevenDaysAgoDate,
          lt: date,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const sevenDayStrains = recentEntries
      .map(e => e.strain)
      .filter((s): s is number => s !== null);

    const sevenDayCalories = recentEntries
      .map(e => e.caloriesBurned)
      .filter((c): c is number => c !== null);

    // Map workouts to scoring module format
    const workouts: Workout[] = todayEntry.workouts.map(w => ({
      type: w.type,
      duration: w.duration,
      distance: w.distance,
      elevation: w.elevation,
      averageHeartrate: w.averageHeartrate,
    }));

    // Calculate scores
    const scores = calculateDailyScores(
      todayEntry.steps,
      todayEntry.caloriesBurned,
      workouts,
      yesterdayEntry?.strain || null,
      sevenDayStrains,
      sevenDayCalories,
      todayEntry.sleepScore
    );

    // Update the entry with computed scores
    const updatedEntry = await prisma.dailyEntry.update({
      where: { date },
      data: {
        strain: scores.strain,
        readiness: scores.readiness,
        insights: JSON.stringify(scores.insights),
        updatedAt: new Date(),
      },
      include: { workouts: true },
    });

    return NextResponse.json({
      ...updatedEntry,
      insights: scores.insights, // Return parsed insights
    });
  } catch (error) {
    console.error('Error computing scores:', error);
    return NextResponse.json(
      { error: 'Failed to compute scores' },
      { status: 500 }
    );
  }
}
