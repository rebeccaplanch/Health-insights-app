# Health Tracker - Custom Instructions

## Project Overview
This is a single-user WHOOP-style health and performance tracker built with Next.js. The app tracks daily health metrics, syncs with Strava for workout data, and provides insights on strain, readiness, and recovery.

## Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **Database**: PostgreSQL with Prisma ORM
- **Fonts**: IBM Plex Sans & IBM Plex Mono
- **Deployment**: Vercel

## Design System

### Colors
- **Accent**: Neon green (`#C6FF00` for primary, `#D4FF33` for lighter variant)
- **Background**: Dark blue gradient
  - `#0d1a2d`, `#0a1525`, `#08121f` to `#040a12`
- **Text**:
  - Primary: `white`
  - Secondary: `slate-300`
  - Tertiary: `slate-400`

### Typography
- **Sans**: IBM Plex Sans (400, 500, 600, 700)
- **Mono**: IBM Plex Mono (400, 500, 600)

### UI Patterns
- Use glassmorphism effects with `backdrop-blur`
- Card-based layouts with rounded corners (`rounded-2xl`, `rounded-3xl`)
- Vector-based grid background with randomized opacity
- Minimal use of emojis (only when explicitly requested)

## Coding Standards

### General
- Always read files before editing
- Prefer editing existing files over creating new ones
- Use explicit typing in TypeScript
- Follow existing code patterns and conventions

### Next.js Specific
- Use Next.js 15 async params pattern for dynamic routes
- Server Components by default, mark with `'use client'` when needed
- Properly handle SSR - avoid `window` references in server components

### Component Structure
- Keep components focused and single-purpose
- Use descriptive prop names
- Implement proper error handling
- Add loading states for async operations

### Database & API
- Always use Prisma for database operations
- Trigger score recomputation when workout data changes
- Use proper HTTP status codes in API responses
- Include error handling in all API routes

## Health Tracker Specific Rules

### Scoring & Analytics
- **Strain**: 0-21 scale, exponential curve based on workouts
- **Readiness**: Green/Yellow/Red bands based on multiple factors
- **Insights**: Pre-computed, timeless language (avoid "today"/"yesterday")
- **Sleep Score**: 0-100 from Garmin, influences readiness

### Data Patterns
- Yesterday's data logging (input completed data from previous day)
- Strava workouts sync automatically
- `customType` overrides original workout type
- Workout types: Run, Ride, Swim, Walk, Hike, CrossFit, WeightTraining, Yoga, Workout

### Special Handling
- "Workout" type = CrossFit/Hybrid training (multiplier: 100)
- Insights should reference previous day's strain for recovery recommendations
- Display detailed workout metrics (duration, HR, distance, elevation) when referencing specific workouts

## Git Workflow
- Write clear, descriptive commit messages
- Push to branch: `claude/health-tracker-app-Mli8C`
- Don't push to main without permission
- Use conventional commit format (feat:, fix:, refactor:, etc.)

## Performance
- Optimize for mobile (PWA support)
- Minimize bundle size
- Use proper caching strategies
- Lazy load heavy components when possible

---

*These instructions will be used by Claude Code when working on this project.*
