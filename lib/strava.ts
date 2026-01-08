/**
 * Strava API Client
 * Handles OAuth and API requests to Strava
 */

import { prisma } from './prisma';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_URL = 'https://www.strava.com/api/v3';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date_local: string;
  timezone: string;
  moving_time: number; // seconds
  distance: number; // meters
  total_elevation_gain: number; // meters
  average_heartrate?: number; // bpm
}

/**
 * Get Strava OAuth authorization URL
 */
export function getStravaAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read,activity:read_all',
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Strava token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(): Promise<string | null> {
  const auth = await prisma.stravaAuth.findFirst();

  if (!auth) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  // Token expired, refresh it
  if (now >= auth.expiresAt) {
    try {
      const { accessToken, refreshToken, expiresAt } = await refreshAccessToken(
        auth.refreshToken
      );

      await prisma.stravaAuth.update({
        where: { id: auth.id },
        data: {
          accessToken,
          refreshToken,
          expiresAt,
        },
      });

      return accessToken;
    } catch (error) {
      console.error('Error refreshing Strava token:', error);
      return null;
    }
  }

  return auth.accessToken;
}

/**
 * Fetch activities from Strava
 */
export async function fetchStravaActivities(
  after?: number, // Unix timestamp
  before?: number, // Unix timestamp
  page = 1,
  perPage = 30
): Promise<StravaActivity[]> {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('No valid Strava access token');
  }

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  if (after) {
    params.append('after', after.toString());
  }

  if (before) {
    params.append('before', before.toString());
  }

  const response = await fetch(
    `${STRAVA_API_URL}/athlete/activities?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Save Strava auth tokens to database
 */
export async function saveStravaAuth(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): Promise<void> {
  // Delete existing auth (single-user app)
  await prisma.stravaAuth.deleteMany({});

  // Create new auth
  await prisma.stravaAuth.create({
    data: {
      accessToken,
      refreshToken,
      expiresAt,
    },
  });
}

/**
 * Check if Strava is connected
 */
export async function isStravaConnected(): Promise<boolean> {
  const auth = await prisma.stravaAuth.findFirst();
  return auth !== null;
}
