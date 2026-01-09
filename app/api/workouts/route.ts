import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workouts
 * Returns all workouts, ordered by date descending
 * Query params:
 *   - limit: number of workouts to return (default: 100)
 *   - offset: pagination offset (default: 0)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const workouts = await prisma.workout.findMany({
      orderBy: {
        startDateLocal: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}
