export type GoalType = 'active' | 'passive';
export type Frequency = 'daily' | 'weekly';

export interface HistoryEntry {
  periodKey: string; // "2026-03-10" or "2026-W10"
  count: number;
  succeeded: boolean;
}

export interface BaseGoal {
  id: string;
  name: string;
  details?: string;
  type: GoalType;
  createdAt: string;
  streak: number;
  history: HistoryEntry[];
}

export interface ActiveGoal extends BaseGoal {
  type: 'active';
  frequency: Frequency;
  target: number;
  unit: string;
  currentCount: number;
  currentPeriodKey: string;
  activeDaysInPeriod?: string[];
}

export interface PassiveGoal extends BaseGoal {
  type: 'passive';
  frequency: 'daily';
  isFailed: boolean;
  currentDayKey: string;
}

export type Goal = ActiveGoal | PassiveGoal;
