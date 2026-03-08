import type { StorageAdapter } from './types';
import type { HaradaPlan } from '@/lib/store';

const PLAN_KEY = 'harada-plan';

/**
 * Default localStorage adapter.
 * Drop-in replacement: swap this class for any async backend.
 */
export class LocalStorageAdapter implements StorageAdapter {
  async loadPlan(): Promise<HaradaPlan | null> {
    try {
      const raw = localStorage.getItem(PLAN_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // corrupted data — return null so app creates fresh plan
    }
    return null;
  }

  async savePlan(plan: HaradaPlan): Promise<void> {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  }

  async getFlag(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setFlag(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }
}
