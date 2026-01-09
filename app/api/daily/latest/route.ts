import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get the most recent daily entry with complete data
 * GET /api/daily/latest
 */
export async function GET() {
  try {
    // Find the most recent entry that has strain calculated
    // This ensures we show complete, calculated data
    const latestEntry = await prisma.dailyEntry.findFirst({
      where: {
        strain: {
          not: null,
        },
      },
      include: {
        workouts: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!latestEntry) {
      // No entries with calculated strain yet, return null
      return NextResponse.json(null);
    }

    return NextResponse.json(latestEntry);
  } catch (error) {
    console.error('Error fetching latest entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest entry' },
      { status: 500 }
    );
  }
}
