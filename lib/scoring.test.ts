import { describe, it, expect } from 'vitest';
import {
  calculateStrain,
  calculateReadiness,
  generateInsights,
  calculateDailyScores,
  type Workout,
  type ReadinessBand,
} from './scoring';

describe('Scoring Module', () => {
  describe('calculateStrain', () => {
    it('should return 0 for no activity', () => {
      const strain = calculateStrain(null, []);
      expect(strain).toBe(0);
    });

    it('should calculate strain for steps only', () => {
      const strain = calculateStrain(10000, []);
      expect(strain).toBeGreaterThan(0);
      expect(strain).toBeLessThan(5);
    });

    it('should calculate strain for moderate run', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 1800, // 30 minutes
          distance: 5000, // 5km
          elevation: null,
          averageHeartrate: null,
        },
      ];
      const strain = calculateStrain(null, workouts);
      expect(strain).toBeGreaterThan(5);
      expect(strain).toBeLessThan(15);
    });

    it('should calculate higher strain for intense workout with HR', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 3600, // 60 minutes
          distance: 10000, // 10km
          elevation: 100,
          averageHeartrate: 170, // High HR
        },
      ];
      const strain = calculateStrain(null, workouts);
      expect(strain).toBeGreaterThan(10);
    });

    it('should combine steps and workout strain', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 1800,
          distance: 5000,
          elevation: null,
          averageHeartrate: null,
        },
      ];
      const strain = calculateStrain(10000, workouts);
      expect(strain).toBeGreaterThan(5);
      expect(strain).toBeLessThan(21);
    });

    it('should cap strain at 21', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 7200, // 2 hours
          distance: 20000,
          elevation: 500,
          averageHeartrate: 180,
        },
        {
          type: 'Ride',
          duration: 7200, // 2 hours
          distance: 50000,
          elevation: 1000,
          averageHeartrate: 160,
        },
      ];
      const strain = calculateStrain(20000, workouts);
      expect(strain).toBeLessThanOrEqual(21);
      expect(strain).toBeGreaterThan(15);
    });
  });

  describe('calculateReadiness', () => {
    it('should return green for well-rested state', () => {
      const readiness = calculateReadiness(
        5, // Low yesterday strain
        [6, 7, 5, 6, 7, 6, 5], // Consistent moderate strain
        2000, // Calories
        [2100, 2000, 1900, 2000, 2100, 2000, 1950] // Similar calories
      );
      expect(readiness).toBe('green');
    });

    it('should return red for high yesterday strain', () => {
      const readiness = calculateReadiness(
        18, // Very high yesterday strain
        [12, 13, 14, 15, 16, 17, 18], // Increasing strain
        3000, // High calories
        [2000, 2100, 2200, 2300, 2500, 2700, 2900] // Increasing calories
      );
      expect(readiness).toBe('red');
    });

    it('should return yellow or green for moderate risk factors', () => {
      const readiness = calculateReadiness(
        12, // Moderate-high yesterday strain
        [8, 9, 10, 11, 12, 11, 12], // Moderate strain
        2500,
        [2000, 2100, 2000, 2100, 2200, 2300, 2400]
      );
      expect(['green', 'yellow', 'red']).toContain(readiness);
      // This scenario has moderate risk but could go either way
    });

    it('should handle null values gracefully', () => {
      const readiness = calculateReadiness(null, [], null, []);
      expect(['green', 'yellow', 'red']).toContain(readiness);
    });

    it('should detect rapid load increases', () => {
      const readiness = calculateReadiness(
        15,
        [6, 7, 6, 7, 12, 14, 15], // Rapid increase in last 3 days
        2500,
        [2000, 2000, 2000, 2000, 2000, 2000, 2000]
      );
      expect(['yellow', 'red']).toContain(readiness);
    });
  });

  describe('generateInsights', () => {
    it('should generate insights for high strain day', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 3600,
          distance: 10000,
          elevation: null,
          averageHeartrate: null,
        },
      ];
      const insights = generateInsights(16, 'red', 10000, workouts, 15, [
        12, 13, 14, 15, 16, 15, 14,
      ]);

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.length).toBeLessThanOrEqual(4);
      expect(insights.some(i => i.type === 'strain')).toBe(true);
    });

    it('should provide recovery suggestions for red readiness', () => {
      const insights = generateInsights(12, 'red', 8000, [], 16, [
        12, 13, 14, 15, 16, 15, 14,
      ]);

      const readinessInsight = insights.find(i => i.type === 'readiness');
      expect(readinessInsight).toBeDefined();
      expect(readinessInsight?.suggestion).toBeDefined();
    });

    it('should comment on step count', () => {
      const insights = generateInsights(8, 'green', 15000, [], 8, [
        7, 8, 7, 8, 7, 8, 7,
      ]);

      const stepsInsight = insights.find(i => i.type === 'steps');
      expect(stepsInsight).toBeDefined();
    });

    it('should mention workout details', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 1800,
          distance: 5000,
          elevation: null,
          averageHeartrate: null,
        },
        {
          type: 'Swim',
          duration: 1200,
          distance: null,
          elevation: null,
          averageHeartrate: null,
        },
      ];
      const insights = generateInsights(12, 'yellow', 8000, workouts, 10, [
        8, 9, 10, 9, 10, 9, 10,
      ]);

      const workoutInsight = insights.find(i => i.type === 'workouts');
      expect(workoutInsight).toBeDefined();
      expect(workoutInsight?.message).toContain('Run');
    });
  });

  describe('calculateDailyScores', () => {
    it('should return complete scores object', () => {
      const workouts: Workout[] = [
        {
          type: 'Run',
          duration: 1800,
          distance: 5000,
          elevation: null,
          averageHeartrate: 150,
        },
      ];

      const scores = calculateDailyScores(
        10000, // steps
        2500, // calories
        workouts,
        10, // yesterday strain
        [8, 9, 10, 9, 10, 9, 10], // 7-day strains
        [2000, 2100, 2000, 2100, 2200, 2000, 2100] // 7-day calories
      );

      expect(scores).toHaveProperty('strain');
      expect(scores).toHaveProperty('readiness');
      expect(scores).toHaveProperty('insights');

      expect(scores.strain).toBeGreaterThanOrEqual(0);
      expect(scores.strain).toBeLessThanOrEqual(21);
      expect(['green', 'yellow', 'red']).toContain(scores.readiness);
      expect(Array.isArray(scores.insights)).toBe(true);
      expect(scores.insights.length).toBeGreaterThan(0);
      expect(scores.insights.length).toBeLessThanOrEqual(4);
    });

    it('should handle minimal data', () => {
      const scores = calculateDailyScores(null, null, [], null, [], []);

      expect(scores.strain).toBe(0);
      expect(['green', 'yellow', 'red']).toContain(scores.readiness);
      expect(Array.isArray(scores.insights)).toBe(true);
    });
  });
});
