import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { getActionsForObjective, createEmptyPlan } from '@/lib/store';
import { getHabitPrompts, getObjectivePrompts, getRandomTip, getRandomQuote, EXAMPLE_PLANS, GOAL_CATEGORIES, type ExamplePlan } from '@/lib/inspiration';
import { Lightbulb, BookOpen, Sparkles, X, ChevronRight } from 'lucide-react';

const BLOCK_POSITIONS = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 1, col: 0 },
  { row: 1, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 1 },
  { row: 2, col: 2 },
];

interface EditingCell {
  type: 'main' | 'yearly' | 'daily';
  objectiveIndex?: number;
  actionIndex?: number;
  location?: 'center' | 'outer';
}

export default function MandalaGrid() {
  const { plan, updatePlan } = usePlan();
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [tip, setTip] = useState(getRandomTip);
  const [quote, setQuote] = useState(getRandomQuote);

  // Rotate tip every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setTip(getRandomTip());
      setQuote(getRandomQuote());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const startEdit = (cell: EditingCell, currentValue: string) => {
    setEditing(cell);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editing) return;
    updatePlan(prev => {
      const next = { ...prev };
      if (editing.type === 'main') {
        next.mainGoal = editValue;
      } else if (editing.type === 'yearly' && editing.objectiveIndex !== undefined) {
        next.yearlyObjectives = [...prev.yearlyObjectives];
        next.yearlyObjectives[editing.objectiveIndex] = editValue;
      } else if (editing.type === 'daily' && editing.objectiveIndex !== undefined && editing.actionIndex !== undefined) {
        next.dailyActions = prev.dailyActions.map(a => {
          if (a.yearlyObjectiveIndex === editing.objectiveIndex && a.positionIndex === editing.actionIndex) {
            return { ...a, text: editValue };
          }
          return a;
        });
      }
      return next;
    });
    setEditing(null);
  };

  const loadTemplate = (template: ExamplePlan) => {
    updatePlan(prev => {
      const base = createEmptyPlan();
      base.mainGoal = template.mainGoal;
      base.yearlyObjectives = [...template.yearlyObjectives];
      base.dailyActions = base.dailyActions.map(a => {
        const key = `${a.yearlyObjectiveIndex}-${a.positionIndex}`;
        if (template.sampleActions[key]) {
          return { ...a, text: template.sampleActions[key] };
        }
        return a;
      });
      base.theme = prev.theme;
      base.completions = {};
      return base;
    });
    setShowTemplates(false);
  };

  // Get contextual suggestions for the currently editing cell
  const getSuggestions = (): string[] => {
    if (!editing) return [];
    if (editing.type === 'main') {
      return [
        'Become the best version of myself',
        'Build a thriving career and balanced life',
        'Achieve peak physical and mental health',
        'Create lasting positive impact',
      ];
    }
    if (editing.type === 'yearly') {
      return getObjectivePrompts(plan.mainGoal);
    }
    if (editing.type === 'daily' && editing.objectiveIndex !== undefined) {
      const objText = plan.yearlyObjectives[editing.objectiveIndex];
      return getHabitPrompts(objText);
    }
    return [];
  };

  const renderCell = (
    content: string,
    cell: EditingCell,
    isCenter: boolean,
    colorIndex?: number
  ) => {
    const isEditing =
      editing?.type === cell.type &&
      editing?.objectiveIndex === cell.objectiveIndex &&
      editing?.actionIndex === cell.actionIndex &&
      editing?.location === cell.location;

    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`
          relative flex items-center justify-center p-1 cursor-pointer transition-colors duration-200 min-h-[60px] md:min-h-[72px]
          ${isCenter
            ? 'bg-primary text-primary-foreground font-semibold rounded-md shadow-card'
            : 'bg-card text-card-foreground hover:bg-secondary rounded-sm border border-border/50'
          }
          ${!content && !isEditing ? 'opacity-60' : ''}
        `}
        onClick={() => !isEditing && startEdit(cell, content)}
      >
        {isEditing ? (
          <textarea
            autoFocus
            className="w-full h-full bg-transparent text-center text-[10px] md:text-xs resize-none focus:outline-none p-1"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveEdit();
              }
            }}
          />
        ) : (
          <span className="text-[9px] md:text-[11px] leading-tight text-center line-clamp-3 px-0.5">
            {content || (
              isCenter
                ? (cell.type === 'main' ? '🎯 Your Dream' : '⭐ Yearly Goal')
                : (cell.type === 'yearly' ? '+ Goal' : '+ Habit')
            )}
          </span>
        )}
      </motion.div>
    );
  };

  const renderSubBlock = (objectiveIndex: number) => {
    const actions = getActionsForObjective(plan, objectiveIndex);
    const yearlyGoal = plan.yearlyObjectives[objectiveIndex];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 bg-border/30 rounded-md">
        {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((actionIdx) => {
          if (actionIdx === -1) {
            return (
              <div key={`yo-${objectiveIndex}`}>
                {renderCell(yearlyGoal, { type: 'yearly', objectiveIndex, location: 'outer' }, true, objectiveIndex)}
              </div>
            );
          }
          const action = actions[actionIdx];
          return (
            <div key={`da-${objectiveIndex}-${actionIdx}`}>
              {renderCell(action?.text || '', { type: 'daily', objectiveIndex, actionIndex: actionIdx, location: 'outer' }, false)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCenterBlock = () => {
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 bg-border/30 rounded-md">
        {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((objIdx) => {
          if (objIdx === -1) {
            return (
              <div key="main-goal">
                {renderCell(plan.mainGoal, { type: 'main', location: 'center' }, true)}
              </div>
            );
          }
          return (
            <div key={`center-yo-${objIdx}`}>
              {renderCell(plan.yearlyObjectives[objIdx], { type: 'yearly', objectiveIndex: objIdx, location: 'center' }, false)}
            </div>
          );
        })}
      </div>
    );
  };

  const suggestions = getSuggestions();

  return (
    <div className="w-full max-w-6xl mx-auto px-2 md:px-4">
      {/* Header with tip */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Mandala Chart</h1>
        <p className="text-sm text-muted-foreground mb-3">Click any cell to edit. Center = your dream goal.</p>

        {/* Rotating tip */}
        <motion.div
          key={tip}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 inline-block max-w-md"
        >
          {tip}
        </motion.div>
      </div>

      {/* Action bar: Templates & Categories */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        <button
          onClick={() => { setShowTemplates(!showTemplates); setShowCategories(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Example Plans
        </button>
        <button
          onClick={() => { setShowCategories(!showCategories); setShowTemplates(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Goal Ideas
        </button>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Load an Example Plan</h3>
                <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Choose a template to pre-fill your chart. You can customize everything after loading.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_PLANS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (plan.mainGoal || plan.yearlyObjectives.some(o => o)) {
                        if (confirm('This will replace your current plan. Continue?')) {
                          loadTemplate(t);
                        }
                      } else {
                        loadTemplate(t);
                      }
                    }}
                    className="text-left p-3 rounded-md border border-border hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                    <div className="text-xs text-primary mt-1 flex items-center gap-0.5">
                      Load template <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Panel */}
      <AnimatePresence>
        {showCategories && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Goal Category Ideas</h3>
                <button onClick={() => setShowCategories(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Browse categories for inspiration. Click any idea to copy it, then paste into a cell.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GOAL_CATEGORIES.map(cat => (
                  <div key={cat.id} className="border border-border rounded-md p-2">
                    <div className="font-medium text-xs mb-1">{cat.emoji} {cat.name}</div>
                    <div className="space-y-0.5">
                      {cat.objectiveIdeas.slice(0, 2).map((idea, i) => (
                        <button
                          key={i}
                          onClick={() => { navigator.clipboard.writeText(idea); }}
                          className="block w-full text-left text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded px-1 py-0.5 transition-colors"
                          title="Click to copy"
                        >
                          {idea}
                        </button>
                      ))}
                      <div className="text-[10px] text-muted-foreground/60 pl-1">
                        +{cat.habitIdeas.length} habit ideas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual suggestions when editing */}
      <AnimatePresence>
        {editing && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 flex items-start gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2"
          >
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Ideas:</span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={e => {
                    e.preventDefault(); // prevent blur on textarea
                    setEditValue(s);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 md:gap-2">
        {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((blockIdx, gridIdx) => (
          <motion.div
            key={blockIdx === -1 ? 'center' : `block-${blockIdx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: gridIdx * 0.05, duration: 0.3 }}
          >
            {blockIdx === -1 ? renderCenterBlock() : renderSubBlock(blockIdx)}
          </motion.div>
        ))}
      </div>

      {/* Bottom quote */}
      <motion.p
        key={quote}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-muted-foreground/70 mt-6 italic max-w-md mx-auto"
      >
        {quote}
      </motion.p>
    </div>
  );
}
