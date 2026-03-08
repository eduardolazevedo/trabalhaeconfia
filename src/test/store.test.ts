import { describe, it, expect } from 'vitest';
import {
  createEmptyPlan,
  importPlan,
  exportPlan,
  getDateKey,
  getFilledActionsCount,
  getTodayCompletionRate,
  getStreak,
  getActionsForObjective,
} from '@/lib/store';

describe('createEmptyPlan', () => {
  it('creates plan with 8 objectives and 64 actions', () => {
    const plan = createEmptyPlan();
    expect(plan.yearlyObjectives).toHaveLength(8);
    expect(plan.dailyActions).toHaveLength(64);
    expect(plan.mainGoal).toBe('');
    expect(plan.theme).toBe('confia');
    expect(plan.completions).toEqual({});
  });

  it('assigns correct objective/position indices', () => {
    const plan = createEmptyPlan();
    for (let i = 0; i < 8; i++) {
      const actions = plan.dailyActions.filter(a => a.yearlyObjectiveIndex === i);
      expect(actions).toHaveLength(8);
      const positions = actions.map(a => a.positionIndex).sort();
      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    }
  });

  it('generates unique IDs', () => {
    const plan = createEmptyPlan();
    const ids = new Set(plan.dailyActions.map(a => a.id));
    expect(ids.size).toBe(64);
  });
});

describe('importPlan / exportPlan', () => {
  it('round-trips a valid plan', () => {
    const original = createEmptyPlan();
    original.mainGoal = 'Test goal';
    original.yearlyObjectives[0] = 'Objective 1';
    const json = exportPlan(original);
    const imported = importPlan(json);
    expect(imported).not.toBeNull();
    expect(imported!.mainGoal).toBe('Test goal');
    expect(imported!.yearlyObjectives[0]).toBe('Objective 1');
    expect(imported!.dailyActions).toHaveLength(64);
  });

  it('rejects invalid JSON', () => {
    expect(importPlan('not-json')).toBeNull();
  });

  it('rejects plan with wrong number of objectives', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.yearlyObjectives = ['only one'];
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });

  it('rejects plan with wrong number of actions', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.dailyActions = data.dailyActions.slice(0, 10);
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });

  it('rejects action with out-of-range index', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.dailyActions[0].yearlyObjectiveIndex = 9;
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });

  it('rejects action with text exceeding 500 chars', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.dailyActions[0].text = 'x'.repeat(501);
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });

  it('defaults theme to confia for unknown theme', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.theme = 'unknown-theme';
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });

  it('accepts valid completions', () => {
    const plan = createEmptyPlan();
    plan.dailyActions[0].text = 'Do something';
    plan.completions = { '2025-01-01': { [plan.dailyActions[0].id]: true } };
    const json = exportPlan(plan);
    const imported = importPlan(json);
    expect(imported).not.toBeNull();
    expect(imported!.completions['2025-01-01']).toBeDefined();
  });

  it('rejects completions with bad date key', () => {
    const plan = createEmptyPlan();
    const data = JSON.parse(exportPlan(plan));
    data.completions = { 'not-a-date': { 'abc': true } };
    expect(importPlan(JSON.stringify(data))).toBeNull();
  });
});

describe('getDateKey', () => {
  it('returns YYYY-MM-DD format', () => {
    const key = getDateKey(new Date('2025-06-15T12:00:00Z'));
    expect(key).toBe('2025-06-15');
  });
});

describe('getFilledActionsCount', () => {
  it('counts only non-empty actions', () => {
    const plan = createEmptyPlan();
    plan.dailyActions[0].text = 'Exercise';
    plan.dailyActions[1].text = '  ';
    plan.dailyActions[2].text = 'Read';
    expect(getFilledActionsCount(plan)).toBe(2);
  });
});

describe('getActionsForObjective', () => {
  it('returns 8 actions for each objective', () => {
    const plan = createEmptyPlan();
    for (let i = 0; i < 8; i++) {
      expect(getActionsForObjective(plan, i)).toHaveLength(8);
    }
  });
});

describe('getTodayCompletionRate', () => {
  it('returns 0 when no actions filled', () => {
    const plan = createEmptyPlan();
    expect(getTodayCompletionRate(plan)).toBe(0);
  });

  it('calculates correct rate', () => {
    const plan = createEmptyPlan();
    plan.dailyActions[0].text = 'A';
    plan.dailyActions[1].text = 'B';
    const today = getDateKey();
    plan.completions[today] = { [plan.dailyActions[0].id]: true };
    expect(getTodayCompletionRate(plan)).toBe(0.5);
  });
});

describe('getStreak', () => {
  it('returns 0 with no filled actions', () => {
    const plan = createEmptyPlan();
    expect(getStreak(plan)).toBe(0);
  });

  it('counts consecutive days with ≥50% completion', () => {
    const plan = createEmptyPlan();
    // Fill 2 actions
    plan.dailyActions[0].text = 'A';
    plan.dailyActions[1].text = 'B';

    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      // Complete 1 of 2 = 50% → counts
      plan.completions[key] = { [plan.dailyActions[0].id]: true };
    }
    expect(getStreak(plan)).toBe(5);
  });

  it('breaks streak on gap day', () => {
    const plan = createEmptyPlan();
    plan.dailyActions[0].text = 'A';
    plan.dailyActions[1].text = 'B';
    plan.dailyActions[2].text = 'C';

    const today = new Date();
    // Today: complete 2/3
    const todayKey = getDateKey(today);
    plan.completions[todayKey] = {
      [plan.dailyActions[0].id]: true,
      [plan.dailyActions[1].id]: true,
    };
    // Yesterday: 0/3 → breaks
    // Day before: 2/3 → doesn't matter
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    plan.completions[getDateKey(dayBefore)] = {
      [plan.dailyActions[0].id]: true,
      [plan.dailyActions[1].id]: true,
    };

    expect(getStreak(plan)).toBe(1);
  });
});
