/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DayStatus = 'locked' | 'unlocked' | 'completed' | 'missed';

export interface DayProgress {
  dayNumber: number;
  status: DayStatus;
  date: string;
  notes: string[];
  willpowerViolations: string[];
  studyHours: number;
}

export interface GoalNode {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  targets: string[];
  bullets: string[];
  status: 'active' | 'secondary' | 'completed';
  category: 'primary' | 'data-engineering' | 'secondary-option';
}

export interface RoutineItem {
  time: string;
  activity: string;
  details: string;
  zone: string; // "deep-work" | "reset" | "transition" | "sleep"
}

export interface WillpowerRule {
  id: number;
  title: string;
  condition: string;
  intervention: string;
  details: string;
}

export interface AppState {
  days: DayProgress[];
  momentum: number;
  wakeTime: string; // HH:MM format
  sleepTime: string; // HH:MM format
  goals: GoalNode[];
}
