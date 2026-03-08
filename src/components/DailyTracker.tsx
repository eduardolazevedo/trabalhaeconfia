import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDateKey, getStreak, getTodayCompletionRate } from '@/lib/store';
import { Check, Flame, Target, ChevronDown, ChevronUp, Trophy } from 'lucide-react';

function getLevel(streak: number): 'seed' | 'sprout' | 'tree' | 'forest' {
  if (streak >= 30) return 'forest';
  if (streak >= 14) return 'tree';
  if (streak >= 3) return 'sprout';
  return 'seed';
}

function ConfettiEffect() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--streak-color))'][Math.floor(Math.random() * 4)],
      size: 6 + Math.random() * 6,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

export default function DailyTracker() {
  const { plan, updatePlan } = usePlan();
  const { t } = useLanguage();
  const today = getDateKey();
  const completions = plan.completions[today] || {};
  const streak = getStreak(plan);
  const completionRate = getTodayCompletionRate(plan);
  const [expandedObjective, setExpandedObjective] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(() => getLevel(streak));

  const filledActions = useMemo(
    () => plan.dailyActions.filter(a => a.text.trim() !== ''),
    [plan.dailyActions]
  );

  const actionsByObjective = useMemo(() => {
    const grouped: Record<number, typeof filledActions> = {};
    filledActions.forEach(a => {
      if (!grouped[a.yearlyObjectiveIndex]) grouped[a.yearlyObjectiveIndex] = [];
      grouped[a.yearlyObjectiveIndex].push(a);
    });
    return grouped;
  }, [filledActions]);

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

  const completedCount = filledActions.filter(a => completions[a.id]).length;
  const pct = Math.round(completionRate * 100);
  const level = getLevel(streak);
  const levelName = t.daily.levelNames[level];

  // Check for 100% completion → confetti
  useEffect(() => {
    if (pct === 100 && filledActions.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [pct, filledActions.length]);

  // Check for level up
  useEffect(() => {
    const currentLevel = getLevel(streak);
    if (currentLevel !== prevLevel && streak > 0) {
      setShowLevelUp(true);
      setPrevLevel(currentLevel);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streak, prevLevel]);

  const getMotivationalText = () => {
    if (pct === 0) return t.daily.motivational['0'];
    if (pct < 25) return t.daily.motivational['25'];
    if (pct < 50) return t.daily.motivational['50'];
    if (pct < 75) return t.daily.motivational['75'];
    if (pct < 100) return t.daily.motivational['100'];
    return t.daily.motivational['done'];
  };

  if (filledActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Target className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">{t.daily.noHabits}</h2>
        <p className="text-muted-foreground max-w-sm">
          {t.daily.noHabitsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {showConfetti && <ConfettiEffect />}

      {/* Level Up Toast */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-elevated flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold text-sm">{t.daily.levelUp} {levelName}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">{t.daily.title}</h1>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            className="bg-card rounded-lg p-4 shadow-card text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-streak" />
              <span className="text-2xl font-bold text-streak">{streak}</span>
            </div>
            <span className="text-xs text-muted-foreground">{t.daily.dayStreak}</span>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg p-4 shadow-card text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <span className="text-2xl font-bold">{completedCount}/{filledActions.length}</span>
            <div className="text-xs text-muted-foreground">{t.daily.completed}</div>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg p-4 shadow-card text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-2xl font-bold text-success">{pct}%</span>
            <div className="text-xs text-muted-foreground">{t.daily.progress}</div>
          </motion.div>
        </div>

        {/* Level Badge */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <span className="text-sm font-semibold bg-secondary px-3 py-1 rounded-full">
            {levelName}
          </span>
        </motion.div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
          <motion.div
            className="absolute inset-y-0 left-0 bg-success rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center italic">
          {getMotivationalText()}
        </p>

        {/* All Complete Celebration */}
        <AnimatePresence>
          {pct === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center"
            >
              <p className="text-sm font-semibold text-primary">{t.daily.allComplete}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions grouped by objective */}
      <div className="space-y-3">
        {Object.entries(actionsByObjective).map(([objIdxStr, actions]) => {
          const objIdx = parseInt(objIdxStr);
          const objName = plan.yearlyObjectives[objIdx] || `${t.daily.objective} ${objIdx + 1}`;
          const objCompleted = actions.filter(a => completions[a.id]).length;
          const isExpanded = expandedObjective === objIdx;

          return (
            <motion.div
              key={objIdx}
              className="bg-card rounded-lg shadow-card overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: objIdx * 0.03 }}
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedObjective(isExpanded ? null : objIdx)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    objCompleted === actions.length
                      ? 'bg-success/20 text-success'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {objCompleted}/{actions.length}
                  </div>
                  <span className="font-medium text-sm truncate">{objName}</span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-1">
                      {actions.map(action => {
                        const done = !!completions[action.id];
                        return (
                          <motion.button
                            key={action.id}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all ${
                              done
                                ? 'bg-success/10 text-success'
                                : 'hover:bg-secondary/50'
                            }`}
                            onClick={() => toggleAction(action.id)}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                done
                                  ? 'bg-success border-success'
                                  : 'border-border'
                              }`}
                            >
                              {done && <Check className="w-3 h-3 text-success-foreground" />}
                            </div>
                            <span className={`text-sm ${done ? 'line-through opacity-70' : ''}`}>
                              {action.text}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
