import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HaradaPlan, loadPlan, savePlan, applyTheme, Theme } from '@/lib/store';

interface PlanContextType {
  plan: HaradaPlan;
  updatePlan: (updater: (prev: HaradaPlan) => HaradaPlan) => void;
  setTheme: (theme: Theme) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<HaradaPlan>(() => loadPlan());

  useEffect(() => {
    applyTheme(plan.theme);
  }, [plan.theme]);

  useEffect(() => {
    savePlan(plan);
  }, [plan]);

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
