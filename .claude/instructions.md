# Health Tracker - Custom Instructions

## Project Overview
Single-user WHOOP-style health and performance tracker built with Next.js. Tracks daily health metrics, syncs with Strava for workout data, and provides insights on strain, readiness, and recovery.

---

## EXECUTION RULES

### 1. CONTEXT FIRST — NO GUESSWORK
- **DO NOT WRITE CODE UNTIL YOU UNDERSTAND THE SYSTEM**
- Immediately list files in the target directory
- Ask only necessary clarifying questions - no fluff
- Detect and follow existing patterns (style, structure, logic)
- Identify environment variables, config files, system dependencies

### 2. CHALLENGE THE REQUEST — DON'T BLINDLY FOLLOW
- Identify edge cases immediately
- Ask specifically: What are the inputs? Outputs? Constraints?
- Question everything vague or assumed
- Refine the task until the goal is bullet-proof

### 3. HOLD THE STANDARD — EVERY LINE MUST COUNT
- Code must be modular, testable, clean
- Comment methods, use docstrings, explain logic
- Suggest best practices if current approach is outdated
- If you know a better way — speak up

### 4. ZOOM OUT — THINK BIGGER THAN JUST THE FILE
- Don't patch. Design.
- Think about maintainability, usability, scalability
- Consider all components (frontend, backend, DB, user interface)
- Plan for the user experience, not just functionality

### 5. WEB TERMINOLOGY — SPEAK THE RIGHT LANGUAGE
- Frame solutions in terms of APIs, routes, component structure, data flow
- Understand frontend-backend interactions before changing either

### 6. ONE FILE, ONE RESPONSE
- Do not split file responses
- Do not rename methods unless absolutely necessary
- Seek approval only when task needs clarity — otherwise, execute

### 7. ENFORCE STRICT STANDARDS
- Clean code, clean structure
- **1600 lines per file maximum**
- Highlight any file growing beyond control
- Use linters, formatters - if missing, flag it

### 8. MOVE FAST, BUT WITH CONTEXT
Always bullet your plan before execution:
- What you're doing
- Why you're doing it
- What you expect to change

### ABSOLUTE DO-NOTS
- ❌ Do not change translation keys unless specified
- ❌ Do not add logic that doesn't need to be there
- ❌ Do not wrap everything in try-catch - think first
- ❌ Do not spam files with non-essential components
- ❌ Do not create side effects without mentioning them

### REMEMBER
- Your work isn't done until the system is stable
- Think through all consequences of your changes
- If you break something in one place, fix it across the project
- Cleanup. Document. Review.

### THINK LIKE A HUMAN
- Consider natural behavior
- How would a user interact with this?
- What happens when something fails?
- How can you make this feel seamless?

**Execute like a professional coder. Think like an architect. Deliver like a leader.**

---

## Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **Database**: PostgreSQL with Prisma ORM
- **Fonts**: DM Sans & DM Mono
- **Deployment**: Vercel

## Design System

### Colors
- **Accent/Primary**: `#7fd8be` (teal/mint) - use CSS variable `text-accent`
- **Background**: `#131c38` (dark navy base)
- **Secondary backgrounds**:
  - Cards: `#1a2542`
  - Status pills: `#12192f`
- **Grid elements**: `#6E81B7` (blue-grey)
- **Text**:
  - Primary: `#f1f1f1`
  - Secondary: `#f1f1f1` at 60% opacity
  - Tertiary: `#f1f1f1` at 40% opacity

### Typography
- **Sans**: DM Sans (400, 500, 600, 700) via `--font-dm-sans`
- **Mono**: DM Mono (400, 500, italic) via `--font-dm-mono`
- **Letter spacing**: Use utility classes
  - `tracking-wide-upper`: 1px uppercase
  - `tracking-wider-upper`: 1.2px uppercase
  - `tracking-display`: 2.4px uppercase for large headings

### UI Patterns
- **Cards**: Use `.glass-card` class (`bg-[#1a2542] rounded-lg`)
- **Background**: Vector-based grid with cube clusters, sparkles, diamonds
- **Layout**:
  - Mobile-first with bottom navigation
  - Desktop: top navigation
  - Max widths: `max-w-lg` (mobile), `md:max-w-2xl`, `lg:max-w-4xl`
- **Spacing**: `px-6` horizontal padding, `pt-8 pb-20` vertical (accounts for fixed nav)
- **Icons**: Material Symbols SVG icons (20px)

### Component Patterns
- Large display headings: 48px mobile, 60px tablet, 72px desktop
- Monospace labels with uppercase tracking
- Accent color for interactive elements and key metrics
- Status pills with dark background + accent text

## Coding Standards

### General
- Always read files before editing
- Prefer editing existing files over creating new ones
- Use explicit typing in TypeScript
- Follow existing code patterns and conventions
- Keep files under 1600 lines - refactor if approaching limit

### Next.js Specific
- Use Next.js 15 async params pattern for dynamic routes
- Server Components by default, `'use client'` when needed
- Properly handle SSR - avoid `window` references in server components
- Use `useEffect` for client-side only operations (window, dimensions)

### Component Structure
- Keep components focused and single-purpose
- Use descriptive prop names
- Implement proper error handling
- Add loading states for async operations
- Document complex components with JSDoc comments

### Database & API
- Always use Prisma for database operations
- Trigger score recomputation when workout data changes
- Use proper HTTP status codes in API responses
- Include error handling in all API routes
- Validate inputs before database operations

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
- Insights reference previous day's strain for recovery recommendations
- Display detailed workout metrics (duration, HR, distance, elevation) when referencing specific workouts

## Git Workflow
- Write clear, descriptive commit messages
- Push to branch: `claude/health-tracker-app-Mli8C`
- Don't push to main without permission
- Use conventional commit format (feat:, fix:, refactor:, etc.)
- One logical change per commit

## Performance & Best Practices
- Optimize for mobile (PWA support)
- Minimize bundle size
- Use proper caching strategies
- Lazy load heavy components when possible
- Avoid unnecessary re-renders
- Use `useMemo` and `useCallback` appropriately

---

*These instructions guide Claude Code's development approach for this project.*
