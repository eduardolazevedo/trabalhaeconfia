import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePlan } from '@/contexts/PlanContext';
import { createEmptyPlan } from '@/lib/store';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

const ONBOARDING_KEY = 'harada-onboarding-done';

export function useOnboarding() {
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
  });
  const markDone = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setDone(true);
  }, []);
  return { onboardingDone: done, markOnboardingDone: markDone };
}

// Area-to-objectives mapping for pre-filling
const AREA_OBJECTIVES: Record<string, { objectives: string[]; actions: Record<string, string> }> = {
  family: {
    objectives: ['Open communication', 'Quality family time'],
    actions: { '0': 'Dinner together without phones', '1': 'Ask "how was your day?" with attention', '2': 'Weekend family outing', '3': 'Read to kids before bed' },
  },
  health: {
    objectives: ['Physical fitness', 'Nutrition & rest'],
    actions: { '0': 'Walk 30 min daily', '1': 'Drink 2L water', '2': 'Sleep 7+ hours', '3': 'Cook a healthy meal' },
  },
  finance: {
    objectives: ['Budget & savings', 'Debt elimination'],
    actions: { '0': 'Track all expenses today', '1': 'Review budget weekly', '2': 'No impulse purchases', '3': 'Save a fixed amount daily' },
  },
  career: {
    objectives: ['Core skills mastery', 'Professional growth'],
    actions: { '0': 'Deep work for 2 hours', '1': 'Read industry news', '2': 'Network with 1 person', '3': 'Update portfolio/resume' },
  },
  learning: {
    objectives: ['Continuous learning', 'Skill development'],
    actions: { '0': 'Read for 30 minutes', '1': 'Watch an educational video', '2': 'Practice a new skill 15 min', '3': 'Teach someone what you learned' },
  },
  spiritual: {
    objectives: ['Inner peace & mindfulness', 'Gratitude practice'],
    actions: { '0': 'Meditate for 10 minutes', '1': 'Write 3 gratitude items', '2': 'Spend time in nature', '3': 'Perform an act of kindness' },
  },
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useLanguage();
  const { updatePlan } = usePlan();
  const [step, setStep] = useState(0);
  const [dream, setDream] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (id: string) => {
    setSelectedAreas(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const buildPlan = () => {
    updatePlan(() => {
      const plan = createEmptyPlan();
      plan.mainGoal = dream;
      // Fill objectives from selected areas
      const areas = selectedAreas.length > 0 ? selectedAreas : ['health', 'finance'];
      let objIdx = 0;
      areas.forEach(areaId => {
        const area = AREA_OBJECTIVES[areaId];
        if (!area) return;
        area.objectives.forEach(obj => {
          if (objIdx < 8) {
            plan.yearlyObjectives[objIdx] = obj;
            // Fill some actions
            const areaActions = area.actions;
            Object.entries(areaActions).forEach(([posStr, text]) => {
              const pos = parseInt(posStr);
              const action = plan.dailyActions.find(
                a => a.yearlyObjectiveIndex === objIdx && a.positionIndex === pos
              );
              if (action) action.text = text;
            });
            objIdx++;
          }
        });
      });
      return plan;
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Heart className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-3">{t.onboarding.welcome}</h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t.onboarding.welcomeSub}
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.onboarding.startButton}
              </button>
              <button
                onClick={onComplete}
                className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.onboarding.skipButton}
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="dream"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-xs text-muted-foreground mb-2">{t.onboarding.step} 1/2</p>
              <h2 className="text-2xl font-bold mb-2">{t.onboarding.dreamQuestion}</h2>
              <textarea
                className="w-full bg-card border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
                rows={3}
                placeholder={t.onboarding.dreamPlaceholder}
                value={dream}
                onChange={e => setDream(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mb-6">
                {t.onboarding.dreamSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setDream(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      dream === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!dream.trim()}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                {t.onboarding.step} 2
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="areas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-xs text-muted-foreground mb-2">{t.onboarding.step} 2/2</p>
              <h2 className="text-2xl font-bold mb-1">{t.onboarding.areasTitle}</h2>
              <p className="text-sm text-muted-foreground mb-5">{t.onboarding.areasSub}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {t.onboarding.areas.map(area => {
                  const selected = selectedAreas.includes(area.id);
                  return (
                    <motion.button
                      key={area.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleArea(area.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 shadow-card'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <span className="text-3xl block mb-1">{area.emoji}</span>
                      <span className="text-sm font-medium">{area.name}</span>
                    </motion.button>
                  );
                })}
              </div>
              <button
                onClick={buildPlan}
                disabled={selectedAreas.length === 0}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t.onboarding.startButton}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
