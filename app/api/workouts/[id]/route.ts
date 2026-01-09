import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/workouts/[id]
 * Update a workout's custom fields (customType, description)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid workout ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customType, description } = body;

    // Update the workout
    const workout = await prisma.workout.update({
      where: { id },
      data: {
        customType: customType !== undefined ? customType : undefined,
        description: description !== undefined ? description : undefined,
        updatedAt: new Date(),
      },
    });

    // Trigger score recomputation for the workout's date
    if (workout.date) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/scores/compute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: workout.date }),
        });
      } catch (computeError) {
        console.error('Error computing scores:', computeError);
        // Don't fail the request if score computation fails
      }
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    );
  }
}
