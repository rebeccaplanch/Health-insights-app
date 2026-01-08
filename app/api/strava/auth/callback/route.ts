import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, saveStravaAuth } from '@/lib/strava';

/**
 * Handle Strava OAuth callback
 * GET /api/strava/auth/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=strava_auth_denied`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=missing_code`
      );
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiresAt } = await exchangeCodeForToken(code);

    // Save tokens to database
    await saveStravaAuth(accessToken, refreshToken, expiresAt);

    // Redirect back to home with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?strava=connected`
    );
  } catch (error) {
    console.error('Error in Strava callback:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=strava_auth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
  }
}
