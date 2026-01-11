/**
 * Scoring Module for Health Tracker
 *
 * This module implements WHOOP-style scoring:
 * - Strain: 0-21 scale based on steps and workouts
 * - Readiness: Green/Yellow/Red based on activity patterns
 * - Insights: 2-4 bullet points explaining the scores
 */

export type ReadinessBand = 'green' | 'yellow' | 'red';

export interface Insight {
  type: 'strain' | 'readiness' | 'steps' | 'workouts' | 'calories' | 'recovery';
  message: string;
  suggestion?: string;
}

export interface Workout {
  type: string;
  customType?: string | null; // User-edited type (overrides type)
  description?: string | null; // User-added notes
  duration: number; // seconds
  distance?: number | null; // meters
  elevation?: number | null; // meters
  averageHeartrate?: number | null; // bpm
}

export interface DailyScores {
  strain: number; // 0-21
  readiness: ReadinessBand;
  insights: Insight[];
}

// Constants for strain calculation
const STEP_FACTOR = 1.0; // Load per 1000 steps
const STRAIN_K = 50; // Scaling constant for exponential mapping

// Sport multipliers for duration-based load (load per hour)
const SPORT_MULTIPLIERS: Record<string, number> = {
  Run: 120,
  Ride: 80,
  Swim: 100,
  Walk: 40,
  Hike: 70,
  WeightTraining: 90,
  Yoga: 30,
  Workout: 100, // CrossFit / Hybrid training / Strength training
  // Add more as needed
};

/**
 * Calculate load from steps
 */
function calculateStepLoad(steps: number): number {
  return (steps / 1000) * STEP_FACTOR;
}

/**
 * Calculate load from a single workout
 */
function calculateWorkoutLoad(workout: Workout): number {
  const durationHours = workout.duration / 3600;

  // Use customType if set, otherwise use original type
  const workoutType = workout.customType || workout.type;

  // Get base multiplier for sport type
  const sportMultiplier = SPORT_MULTIPLIERS[workoutType] || SPORT_MULTIPLIERS.Workout;

  // Base load from duration
  let load = durationHours * sportMultiplier;

  // Adjust for heart rate if available
  if (workout.averageHeartrate) {
    // Higher HR = more intense
    // Assume 150 bpm is baseline, increase load by up to 30% for high HR
    const hrFactor = Math.min(1.3, workout.averageHeartrate / 150);
    load *= hrFactor;
  }

  // Slight boost for distance/elevation
  if (workout.distance && workout.distance > 0) {
    const kmDistance = workout.distance / 1000;
    load += kmDistance * 0.05; // Small boost per km
  }

  if (workout.elevation && workout.elevation > 0) {
    load += (workout.elevation / 100) * 0.1; // Small boost per 100m elevation
  }

  return load;
}

/**
 * Calculate total daily strain (0-21 scale)
 */
export function calculateStrain(
  steps: number | null,
  workouts: Workout[]
): number {
  let totalLoad = 0;

  // Add step load
  if (steps) {
    totalLoad += calculateStepLoad(steps);
  }

  // Add workout loads
  for (const workout of workouts) {
    totalLoad += calculateWorkoutLoad(workout);
  }

  // Map load to 0-21 strain using exponential curve
  // strain = 21 * (1 - e^(-totalLoad / K))
  // This creates a curve where:
  // - Low load = low strain (0-5)
  // - Medium load = moderate strain (6-12)
  // - High load = high strain (13-21)
  const strain = 21 * (1 - Math.exp(-totalLoad / STRAIN_K));

  return Math.round(strain * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate readiness band
 * Based on yesterday's strain, rolling averages, trends, sleep quality, and current day's strain
 */
export function calculateReadiness(
  yesterdayStrain: number | null,
  sevenDayStrains: number[], // Last 7 days of strain scores
  todayCalories: number | null,
  sevenDayCalories: number[], // Last 7 days of calories
  sleepScore: number | null, // Garmin sleep score (0-100)
  todayStrain: number = 0 // Current day's accumulated strain (dynamic)
): ReadinessBand {
  let score = 100; // Start at 100, deduct points for risk factors

  // Factor 1: Yesterday's strain (high strain = need recovery)
  if (yesterdayStrain !== null) {
    if (yesterdayStrain > 15) {
      score -= 30; // Very high strain yesterday
    } else if (yesterdayStrain > 10) {
      score -= 15; // Moderate-high strain
    }
  }

  // Factor 2: 7-day average strain (check for sustained high load)
  if (sevenDayStrains.length > 0) {
    const avgStrain = sevenDayStrains.reduce((a, b) => a + b, 0) / sevenDayStrains.length;
    if (avgStrain > 12) {
      score -= 15; // Sustained high load
    }
  }

  // Factor 3: Weekly load trend (rapid increases are risky)
  if (sevenDayStrains.length >= 4) {
    const recentAvg = sevenDayStrains.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = sevenDayStrains.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
    const increase = recentAvg - olderAvg;

    if (increase > 4) {
      score -= 20; // Rapid load increase
    } else if (increase > 2) {
      score -= 10; // Moderate load increase
    }
  }

  // Factor 4: Calorie burn trend (energy stress proxy)
  if (todayCalories !== null && sevenDayCalories.length > 0) {
    const avgCalories = sevenDayCalories.reduce((a, b) => a + b, 0) / sevenDayCalories.length;
    const calorieIncrease = (todayCalories - avgCalories) / avgCalories;

    if (calorieIncrease > 0.2) {
      score -= 15; // 20%+ above average
    }
  }

  // Factor 5: Sleep quality (Garmin sleep score)
  // Sleep is a critical recovery metric
  if (sleepScore !== null) {
    if (sleepScore >= 70) {
      // Good sleep: boost readiness
      score += 15;
    } else if (sleepScore >= 50) {
      // Fair sleep: neutral (no change)
      score += 0;
    } else {
      // Poor sleep: significant penalty
      score -= 25;
    }
  }

  // Factor 6: Today's accumulated strain (dynamic context-aware adjustment)
  // As you train throughout the day, your readiness for MORE training decreases
  if (todayStrain > 15) {
    score -= 35; // Very high strain today - need recovery
  } else if (todayStrain > 12) {
    score -= 25; // High strain today - limited capacity
  } else if (todayStrain > 8) {
    score -= 15; // Moderate strain today - some capacity remains
  } else if (todayStrain > 5) {
    score -= 5; // Light strain today - minimal impact
  }

  // Map score to band
  if (score >= 67) {
    return 'green';
  } else if (score >= 34) {
    return 'yellow';
  } else {
    return 'red';
  }
}

/**
 * Generate insights based on scores and data
 */
export function generateInsights(
  strain: number,
  readiness: ReadinessBand,
  steps: number | null,
  workouts: Workout[],
  yesterdayStrain: number | null,
  sevenDayStrains: number[],
  sleepScore: number | null
): Insight[] {
  const insights: Insight[] = [];

  // Insight 1: Current day's strain and what contributed to it
  if (strain > 15) {
    insights.push({
      type: 'strain',
      message: `High strain (${strain.toFixed(1)}/21) - significant training load`,
      suggestion: 'Recovery will be important'
    });
  } else if (strain > 10) {
    insights.push({
      type: 'strain',
      message: `Moderate strain (${strain.toFixed(1)}/21) - solid training session`
    });
  } else if (strain > 0 && strain <= 6) {
    insights.push({
      type: 'strain',
      message: `Light strain (${strain.toFixed(1)}/21) - low training load`,
      suggestion: 'Room for more activity if desired'
    });
  }

  // Insight 2: Workout-specific (what you did yesterday)
  if (workouts.length > 0) {
    // Show details for each workout
    workouts.forEach(workout => {
      const durationMins = Math.round(workout.duration / 60);

      // Use customType if set, otherwise use original type
      let workoutType = workout.customType || workout.type;
      // Display "CrossFit/Hybrid training" for generic "Workout" type if no custom type
      if (!workout.customType && workout.type === 'Workout') {
        workoutType = 'CrossFit/Hybrid training';
      }

      let details = `${workoutType}: ${durationMins} min`;

      // Add heart rate if available
      if (workout.averageHeartrate) {
        details += `, ${workout.averageHeartrate} bpm avg HR`;
      }

      // Add distance if available (for runs/rides)
      if (workout.distance && workout.distance > 0) {
        const km = (workout.distance / 1000).toFixed(1);
        details += `, ${km} km`;
      }

      // Add elevation if significant
      if (workout.elevation && workout.elevation > 50) {
        details += `, ${workout.elevation}m elevation`;
      }

      insights.push({
        type: 'workouts',
        message: details
      });
    });
  }

  // Insight 3: Steps
  if (steps !== null) {
    if (steps > 12000) {
      insights.push({
        type: 'steps',
        message: `Excellent step count (${steps.toLocaleString()})`,
        suggestion: 'Great daily movement baseline'
      });
    } else if (steps < 5000) {
      insights.push({
        type: 'steps',
        message: `Low step count (${steps.toLocaleString()})`,
        suggestion: 'Consider adding more daily movement'
      });
    }
  }

  // Insight 4: Sleep quality
  if (sleepScore !== null) {
    if (sleepScore >= 70) {
      insights.push({
        type: 'recovery',
        message: `Excellent sleep quality (${sleepScore}/100)`,
        suggestion: 'Well-recovered and ready for high-intensity training'
      });
    } else if (sleepScore < 50) {
      insights.push({
        type: 'recovery',
        message: `Poor sleep quality (${sleepScore}/100) impacts recovery`,
        suggestion: 'Prioritize rest and better sleep habits'
      });
    }
  }

  // Insight 5: Readiness-based guidance (focus on current status and recent load)
  if (readiness === 'red') {
    insights.push({
      type: 'readiness',
      message: 'Low readiness - accumulated fatigue from recent training',
      suggestion: 'Prioritize rest and recovery'
    });
  } else if (readiness === 'yellow') {
    insights.push({
      type: 'readiness',
      message: 'Moderate readiness - managing training load',
      suggestion: 'Consider moderate intensity training'
    });
  } else if (readiness === 'green') {
    // Context-aware message based on whether the day had high activity or not
    if (strain > 15) {
      // High readiness + high strain = you were recovered and trained hard
      insights.push({
        type: 'readiness',
        message: 'Started well-recovered - high training load completed',
        suggestion: 'Focus on recovery for tomorrow'
      });
    } else if (strain > 10) {
      // High readiness + moderate strain = good training session
      insights.push({
        type: 'readiness',
        message: 'Good recovery status - solid training session completed',
        suggestion: 'Continue balanced training and recovery'
      });
    } else {
      // High readiness + low strain = ready for more
      const avgStrain = sevenDayStrains.length > 0
        ? sevenDayStrains.reduce((a, b) => a + b, 0) / sevenDayStrains.length
        : 0;
      if (avgStrain < 8) {
        insights.push({
          type: 'readiness',
          message: 'High readiness - well-recovered with low recent load',
          suggestion: 'Ready for intense training'
        });
      } else {
        insights.push({
          type: 'readiness',
          message: 'High readiness - recovered and ready to train',
          suggestion: 'Can handle high-intensity work'
        });
      }
    }
  }

  // Return 2-4 insights
  return insights.slice(0, 4);
}

/**
 * Calculate all daily scores
 */
export function calculateDailyScores(
  steps: number | null,
  caloriesBurned: number | null,
  workouts: Workout[],
  yesterdayStrain: number | null,
  sevenDayStrains: number[],
  sevenDayCalories: number[],
  sleepScore: number | null
): DailyScores {
  const strain = calculateStrain(steps, workouts);
  const readiness = calculateReadiness(
    yesterdayStrain,
    sevenDayStrains,
    caloriesBurned,
    sevenDayCalories,
    sleepScore,
    strain // Pass today's strain for dynamic readiness
  );
  const insights = generateInsights(
    strain,
    readiness,
    steps,
    workouts,
    yesterdayStrain,
    sevenDayStrains,
    sleepScore
  );

  return {
    strain,
    readiness,
    insights
  };
}
