import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HaradaPlan, createEmptyPlan, applyTheme, Theme } from '@/lib/store';
import { useStorage } from '@/lib/storage';

interface PlanContextType {
  plan: HaradaPlan;
  updatePlan: (updater: (prev: HaradaPlan) => HaradaPlan) => void;
  setTheme: (theme: Theme) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const storage = useStorage();
  const [plan, setPlan] = useState<HaradaPlan>(() => createEmptyPlan());
  const [loaded, setLoaded] = useState(false);

  // Load plan from storage adapter (async)
  useEffect(() => {
    storage.loadPlan().then(saved => {
      if (saved) setPlan(saved);
      setLoaded(true);
    });
  }, [storage]);

  useEffect(() => {
    applyTheme(plan.theme);
  }, [plan.theme]);

  useEffect(() => {
    if (loaded) {
      storage.savePlan(plan);
    }
  }, [plan, loaded, storage]);

  const updatePlan = useCallback((updater: (prev: HaradaPlan) => HaradaPlan) => {
    setPlan(prev => updater(prev));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setPlan(prev => ({ ...prev, theme }));
  }, []);

  return (
    <PlanContext.Provider value={{ plan, updatePlan, setTheme }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
