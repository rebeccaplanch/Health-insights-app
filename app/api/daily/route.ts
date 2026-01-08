import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const entry = await prisma.dailyEntry.findUnique({
      where: { date },
      include: {
        workouts: true,
      },
    });

    return NextResponse.json(entry || null);
  } catch (error) {
    console.error('Error fetching daily entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily entry' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, steps, caloriesBurned } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Upsert the daily entry
    const entry = await prisma.dailyEntry.upsert({
      where: { date },
      update: {
        steps: steps !== undefined ? steps : undefined,
        caloriesBurned: caloriesBurned !== undefined ? caloriesBurned : undefined,
        updatedAt: new Date(),
      },
      create: {
        date,
        steps,
        caloriesBurned,
      },
    });

    // Trigger score computation
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/scores/compute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
    } catch (computeError) {
      console.error('Error computing scores:', computeError);
      // Don't fail the request if score computation fails
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error upserting daily entry:', error);
    return NextResponse.json(
      { error: 'Failed to save daily entry' },
      { status: 500 }
    );
  }
}
