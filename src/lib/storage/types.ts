/**
 * StorageAdapter — abstract persistence interface.
 *
 * The default implementation uses localStorage.
 * To migrate to a backend (Supabase, Firebase, REST API, etc.),
 * implement this interface and pass it to StorageProvider.
 *
 * All methods are async to support remote backends.
 */
export interface StorageAdapter {
  /** Load the full plan, or null if none exists */
  loadPlan(): Promise<import('@/lib/store').HaradaPlan | null>;
  /** Persist the full plan */
  savePlan(plan: import('@/lib/store').HaradaPlan): Promise<void>;
  /** Load a simple key-value flag (e.g. onboarding-done) */
  getFlag(key: string): Promise<string | null>;
  /** Set a simple key-value flag */
  setFlag(key: string, value: string): Promise<void>;
}
