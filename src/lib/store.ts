// Data model and localStorage persistence for Harada Method

export type Theme = 'confia' | 'zen' | 'bold' | 'warm' | 'editorial';

export interface DailyAction {
  id: string;
  text: string;
  yearlyObjectiveIndex: number; // 0-7
  positionIndex: number; // 0-7 within the yearly objective
}

export interface Completion {
  [actionId: string]: boolean;
}

export interface HaradaPlan {
  mainGoal: string;
  yearlyObjectives: string[]; // 8 items
  dailyActions: DailyAction[]; // 64 items
  completions: Record<string, Completion>; // keyed by YYYY-MM-DD
  theme: Theme;
  createdAt: string;
}

const STORAGE_KEY = 'harada-plan';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function createEmptyPlan(): HaradaPlan {
  const dailyActions: DailyAction[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      dailyActions.push({
        id: generateId(),
        text: '',
        yearlyObjectiveIndex: i,
        positionIndex: j,
      });
    }
  }
  return {
    mainGoal: '',
    yearlyObjectives: Array(8).fill(''),
    dailyActions,
    completions: {},
    theme: 'confia',
    createdAt: new Date().toISOString(),
  };
}

export function loadPlan(): HaradaPlan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createEmptyPlan();
}

export function savePlan(plan: HaradaPlan): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function exportPlan(plan: HaradaPlan): string {
  return JSON.stringify(plan, null, 2);
}

function isValidAction(a: unknown): a is DailyAction {
  if (typeof a !== 'object' || a === null) return false;
  const obj = a as Record<string, unknown>;
  return (
    typeof obj.id === 'string' && obj.id.length <= 50 &&
    typeof obj.text === 'string' && obj.text.length <= 500 &&
    typeof obj.yearlyObjectiveIndex === 'number' &&
    Number.isInteger(obj.yearlyObjectiveIndex) &&
    obj.yearlyObjectiveIndex >= 0 && obj.yearlyObjectiveIndex <= 7 &&
    typeof obj.positionIndex === 'number' &&
    Number.isInteger(obj.positionIndex) &&
    obj.positionIndex >= 0 && obj.positionIndex <= 7
  );
}

function isValidCompletions(completions: unknown): completions is Record<string, Completion> {
  if (typeof completions !== 'object' || completions === null) return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  for (const [key, value] of Object.entries(completions as Record<string, unknown>)) {
    if (!datePattern.test(key)) return false;
    if (typeof value !== 'object' || value === null) return false;
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (typeof v !== 'boolean') return false;
    }
  }
  return true;
}

const VALID_THEMES: Theme[] = ['confia', 'zen', 'bold', 'warm', 'editorial'];

export function importPlan(json: string): HaradaPlan | null {
  try {
    const data = JSON.parse(json);
    if (
      typeof data.mainGoal === 'string' && data.mainGoal.length <= 500 &&
      Array.isArray(data.yearlyObjectives) &&
      data.yearlyObjectives.length === 8 &&
      data.yearlyObjectives.every((s: unknown) => typeof s === 'string' && (s as string).length <= 500) &&
      Array.isArray(data.dailyActions) &&
      data.dailyActions.length === 64 &&
      data.dailyActions.every((a: unknown) => isValidAction(a)) &&
      (data.completions === undefined || isValidCompletions(data.completions)) &&
      (data.theme === undefined || VALID_THEMES.includes(data.theme))
    ) {
      return {
        mainGoal: data.mainGoal,
        yearlyObjectives: data.yearlyObjectives,
        dailyActions: data.dailyActions,
        completions: data.completions || {},
        theme: VALID_THEMES.includes(data.theme) ? data.theme : 'zen',
        createdAt: typeof data.createdAt === 'string' ? data.createdAt.slice(0, 30) : new Date().toISOString(),
      };
    }
  } catch {}
  return null;
}

export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getActionsForObjective(plan: HaradaPlan, objectiveIndex: number): DailyAction[] {
  return plan.dailyActions.filter(a => a.yearlyObjectiveIndex === objectiveIndex);
}

export function getFilledActionsCount(plan: HaradaPlan): number {
  return plan.dailyActions.filter(a => a.text.trim() !== '').length;
}

export function getTodayCompletionRate(plan: HaradaPlan): number {
  const key = getDateKey();
  const completions = plan.completions[key] || {};
  const filledActions = plan.dailyActions.filter(a => a.text.trim() !== '');
  if (filledActions.length === 0) return 0;
  const completed = filledActions.filter(a => completions[a.id]).length;
  return completed / filledActions.length;
}

export function getStreak(plan: HaradaPlan): number {
  let streak = 0;
  const today = new Date();
  const filledActions = plan.dailyActions.filter(a => a.text.trim() !== '');
  if (filledActions.length === 0) return 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    const completions = plan.completions[key] || {};
    const completed = filledActions.filter(a => completions[a.id]).length;
    const rate = completed / filledActions.length;
    if (rate >= 0.5) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}
