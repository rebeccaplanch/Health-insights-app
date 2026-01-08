import { NextResponse } from 'next/server';
import { getStravaAuthUrl } from '@/lib/strava';

/**
 * Start Strava OAuth flow
 * GET /api/strava/auth/start
 */
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/strava/auth/callback`;
    const authUrl = getStravaAuthUrl(redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error starting Strava auth:', error);
    return NextResponse.json(
      { error: 'Failed to start Strava authorization' },
      { status: 500 }
    );
  }
}
