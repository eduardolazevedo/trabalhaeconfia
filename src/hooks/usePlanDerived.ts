/**
 * Derived business-logic hooks extracted from the monolithic store.
 * These are pure computations over the plan — no side effects.
 */
import { useMemo } from 'react';
import { usePlan } from '@/contexts/PlanContext';
import {
  getDateKey,
  getStreak,
  getTodayCompletionRate,
  getFilledActionsCount,
  getActionsForObjective,
  type HaradaPlan,
  type DailyAction,
} from '@/lib/store';

/** Today's filled actions grouped by objective index */
export function useFilledActions() {
  const { plan } = usePlan();

  const filledActions = useMemo(
    () => plan.dailyActions.filter(a => a.text.trim() !== ''),
    [plan.dailyActions]
  );

  const actionsByObjective = useMemo(() => {
    const grouped: Record<number, DailyAction[]> = {};
    filledActions.forEach(a => {
      if (!grouped[a.yearlyObjectiveIndex]) grouped[a.yearlyObjectiveIndex] = [];
      grouped[a.yearlyObjectiveIndex].push(a);
    });
    return grouped;
  }, [filledActions]);

  return { filledActions, actionsByObjective };
}

/** Today's completions map and toggle function */
export function useCompletions() {
  const { plan, updatePlan } = usePlan();
  const today = getDateKey();
  const completions = plan.completions[today] || {};

  const toggleAction = (actionId: string) => {
    updatePlan(prev => {
      const dayCompletions = { ...(prev.completions[today] || {}) };
      dayCompletions[actionId] = !dayCompletions[actionId];
      return {
        ...prev,
        completions: { ...prev.completions, [today]: dayCompletions },
      };
    });
  };

  return { completions, toggleAction, today };
}

/** Streak count and level */
export type Level = 'seed' | 'sprout' | 'tree' | 'forest';

export function getLevel(streak: number): Level {
  if (streak >= 30) return 'forest';
  if (streak >= 14) return 'tree';
  if (streak >= 3) return 'sprout';
  return 'seed';
}

export function useStreak() {
  const { plan } = usePlan();
  const streak = getStreak(plan);
  const level = getLevel(streak);
  return { streak, level };
}

/** Completion rate for today (0–1) */
export function useCompletionRate() {
  const { plan } = usePlan();
  return getTodayCompletionRate(plan);
}

/** Plan progress stats */
export function usePlanProgress() {
  const { plan } = usePlan();
  const filled = getFilledActionsCount(plan);
  const totalObjectives = plan.yearlyObjectives.filter(o => o.trim()).length;
  const hasMainGoal = plan.mainGoal.trim() !== '';
  const total = 1 + 8 + 64;
  const filledTotal = (hasMainGoal ? 1 : 0) + totalObjectives + filled;
  const pct = Math.round((filledTotal / total) * 100);
  return { filled, totalObjectives, hasMainGoal, pct };
}

/** Actions for a specific objective */
export function useObjectiveActions(objectiveIndex: number) {
  const { plan } = usePlan();
  return useMemo(
    () => getActionsForObjective(plan, objectiveIndex),
    [plan, objectiveIndex]
  );
}
