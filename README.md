# Health Tracker

A single-user, personal WHOOP-style health & performance tracker built as a mobile-first web app. Track your daily activity, sync workouts from Strava, and get personalized strain scores, readiness bands, and actionable insights.

## Features

- **Daily Check-in**: Manually input steps and calories burned
- **Strava Integration**: OAuth flow to sync workouts automatically
- **Strain Scoring**: 0-21 scale based on steps and workout intensity
- **Readiness Bands**: Green/Yellow/Red estimation from activity patterns
- **Insights**: 2-4 daily bullet points explaining your scores with suggestions
- **Mobile-First UI**: Responsive dashboard optimized for phones
- **Automated Sync**: Nightly cron job to sync recent Strava activities

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma ORM)
- **Deployment**: Vercel
- **Testing**: Vitest
- **Automation**: Vercel Cron

## Prerequisites

- Node.js 18+ and npm
- A Strava account (optional, for workout sync)
- Vercel account (for deployment)

## Local Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd health-insights-app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Database
DATABASE_URL="file:./dev.db"

# Strava OAuth (required for Strava integration)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cron Security
CRON_SECRET=your_random_secret_string
```

### 3. Set Up Strava OAuth Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set **Authorization Callback Domain** to:
   - Local: `localhost`
   - Production: `your-domain.vercel.app`
4. Copy **Client ID** and **Client Secret** to `.env`

### 4. Initialize Database

The database is already created, but if you need to recreate it:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (if modifying schema)
npm run prisma:migrate

# View database (optional)
npm run prisma:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Daily Check-in

1. Enter your steps for the day
2. Enter calories burned (from your fitness tracker)
3. Click Save

The app will automatically:
- Store your data
- Calculate strain score (0-21)
- Determine readiness band (green/yellow/red)
- Generate 2-4 personalized insights

### Connect Strava

1. Click "Connect with Strava"
2. Authorize the app
3. Click "Backfill Last 90 Days" to import historical workouts
4. Use "Sync Recent Activities" for incremental updates

### Understanding Your Scores

#### Strain (0-21)
- **0-5**: Light day
- **6-12**: Moderate activity
- **13-17**: Hard training
- **18-21**: Very high load

Calculated from:
- Steps (normalized by 1000)
- Workout duration, type, distance, elevation
- Heart rate data (if available from Strava)

#### Readiness (Green/Yellow/Red)
- **Green**: Ready for hard training
- **Yellow**: Moderate stress, train with caution
- **Red**: High fatigue, prioritize recovery

Based on:
- Yesterday's strain
- 7-day rolling average strain
- Weekly load trends (rapid increases = higher risk)
- Calorie burn patterns

> **Important**: Readiness is estimated from activity and energy patterns only. This is NOT based on HRV or sleep data.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL)
   - `CRON_SECRET` (generate a random string)

4. Update Strava OAuth callback domain to match your Vercel domain

### Configure Vercel Cron

1. In your Vercel project settings, go to **Cron Jobs**
2. Add a new cron job:
   - **Path**: `/api/cron/sync`
   - **Schedule**: `0 2 * * *` (2am daily)
   - **Custom Headers**:
     ```
     Authorization: Bearer <your-CRON_SECRET>
     ```

This will automatically:
- Refresh Strava access token
- Sync recent activities (with 2-day safety window)
- Recompute scores for affected days

## Project Structure

```
health-insights-app/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── sync/          # Automated sync endpoint
│   │   ├── daily/             # Daily entry CRUD
│   │   ├── scores/
│   │   │   └── compute/       # Score calculation endpoint
│   │   └── strava/
│   │       ├── auth/          # OAuth flow
│   │       └── sync/          # Activity sync
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── DailyCheckin.tsx       # Manual input form
│   ├── Dashboard.tsx          # Main dashboard UI
│   └── StravaConnect.tsx      # Strava integration UI
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── scoring.ts             # Strain/readiness algorithms
│   ├── scoring.test.ts        # Unit tests
│   ├── strava.ts              # Strava API client
│   └── utils.ts               # Date utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── .env.example
├── package.json
└── README.md
```

## Database Schema

### DailyEntry
- `date` (unique): YYYY-MM-DD
- `steps`, `caloriesBurned`: Manual inputs
- `strain`, `readiness`, `insights`: Computed scores
- Relations: `workouts[]`

### Workout
- `providerActivityId` (unique): Strava activity ID
- `date`: YYYY-MM-DD (for grouping)
- `startDateLocal`: Full datetime
- `type`, `name`, `duration`, `distance`, `elevation`
- `averageHeartrate`: Optional
- Relation: `dailyEntry`

### StravaAuth
- `accessToken`, `refreshToken`, `expiresAt`
- `lastSync`: Timestamp of last successful sync
- Single record (one user only)

## Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui
```

Tests cover:
- Strain calculation for various activity levels
- Readiness scoring under different scenarios
- Insight generation logic
- Edge cases (missing data, null values)

## Date Handling

- Always operates on "today" (user's local browser time)
- No date picker required
- Dates stored as `YYYY-MM-DD` strings (no timestamps)
- Strava activities use `start_date_local` to avoid timezone issues

## Scoring Methodology

### Strain Formula

```
totalLoad = stepLoad + workoutLoad

stepLoad = (steps / 1000) × 1.0

workoutLoad = Σ (duration_hours × sport_multiplier × HR_factor + distance_boost + elevation_boost)

strain = 21 × (1 - e^(-totalLoad / 50))
```

Sport multipliers (per hour):
- Run: 120
- Swim: 100
- Ride: 80
- Hike: 70
- WeightTraining: 90
- Walk: 40
- Yoga: 30

### Readiness Scoring

Start at 100 points, deduct for:
- High yesterday strain (>15: -30, >10: -15)
- High 7-day average strain (>12: -15)
- Rapid load increases (-20 for major spikes)
- High calorie burn vs. average (-15 for 20%+ increase)

Bands:
- **Green**: 67-100
- **Yellow**: 34-66
- **Red**: 0-33

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/daily` | GET | Fetch daily entry by date |
| `/api/daily` | POST | Upsert daily entry (steps, calories) |
| `/api/scores/compute` | POST | Calculate and store scores |
| `/api/strava/auth/start` | GET | Start OAuth flow |
| `/api/strava/auth/callback` | GET | Handle OAuth callback |
| `/api/strava/sync` | GET | Get sync status |
| `/api/strava/sync` | POST | Sync activities (with optional backfill) |
| `/api/cron/sync` | GET | Automated nightly sync (secured) |

## Troubleshooting

### Strava not connecting
- Verify `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` in `.env`
- Check callback domain matches in Strava app settings
- Ensure `NEXT_PUBLIC_BASE_URL` is correct

### Scores not updating
- Check browser console for API errors
- Verify database has valid entries: `npm run prisma:studio`
- Manually trigger score computation via `/api/scores/compute`

### Build fails
- Run `npm run prisma:generate` before building
- Check TypeScript errors: `npm run build`

## License

MIT

## Contributing

This is a personal project template. Feel free to fork and customize for your own use.
