import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getActionsForObjective, createEmptyPlan } from '@/lib/store';
import { getRandomFromArray } from '@/lib/i18n';
import type { ExamplePlanTranslation } from '@/lib/i18n/types';
import { Lightbulb, BookOpen, Sparkles, X, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import PlanProgress from './PlanProgress';
import MandalaCardView from './MandalaCardView';
import ConfirmDialog from './ConfirmDialog';

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
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'auto' | 'grid' | 'cards'>('auto');
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [tip, setTip] = useState(() => getRandomFromArray(t.tips));
  const [quote, setQuote] = useState(() => getRandomFromArray(t.quotes));
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; template: ExamplePlanTranslation | null }>({ open: false, template: null });

  const showCards = viewMode === 'cards' || (viewMode === 'auto' && isMobile);

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(getRandomFromArray(t.tips));
      setQuote(getRandomFromArray(t.quotes));
    }, 30000);
    return () => clearInterval(interval);
  }, [t]);

  useEffect(() => {
    setTip(getRandomFromArray(t.tips));
    setQuote(getRandomFromArray(t.quotes));
  }, [t]);

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
    toast({ title: t.mandala.saved, duration: 1500 });
    setEditing(null);
  };

  const loadTemplate = (template: ExamplePlanTranslation) => {
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
    toast({ title: t.mandala.templateLoaded, description: t.mandala.templateLoadedDesc });
  };

  const handleTemplateClick = (tp: ExamplePlanTranslation) => {
    if (plan.mainGoal || plan.yearlyObjectives.some(o => o)) {
      setConfirmDialog({ open: true, template: tp });
    } else {
      loadTemplate(tp);
    }
  };

  const getSuggestions = (): string[] => {
    if (!editing) return [];
    if (editing.type === 'main') return t.mainGoalSuggestions;
    if (editing.type === 'yearly') {
      const lower = plan.mainGoal.toLowerCase();
      for (const cat of t.categories) {
        const keywords = cat.name.toLowerCase().split(/[&\s]+/);
        if (keywords.some(k => k.length > 2 && lower.includes(k))) return cat.objectiveIdeas;
      }
      return t.categories.slice(0, 4).map(c => c.objectiveIdeas[0]);
    }
    if (editing.type === 'daily' && editing.objectiveIndex !== undefined) {
      const objText = plan.yearlyObjectives[editing.objectiveIndex].toLowerCase();
      for (const cat of t.categories) {
        const keywords = cat.name.toLowerCase().split(/[&\s]+/);
        if (keywords.some(k => k.length > 2 && objText.includes(k))) return cat.habitIdeas.slice(0, 4);
      }
      return t.categories.slice(0, 4).map(c => c.habitIdeas[0]);
    }
    return [];
  };

  const renderCell = (content: string, cell: EditingCell, isCenter: boolean) => {
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
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); }
            }}
          />
        ) : (
          <span className="text-[9px] md:text-[11px] leading-tight text-center line-clamp-3 px-0.5">
            {content || (
              isCenter
                ? (cell.type === 'main' ? t.mandala.yourDream : t.mandala.yearlyGoal)
                : (cell.type === 'yearly' ? t.mandala.addGoal : t.mandala.addHabit)
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
            return <div key={`yo-${objectiveIndex}`}>{renderCell(yearlyGoal, { type: 'yearly', objectiveIndex, location: 'outer' }, true, )}</div>;
          }
          const action = actions[actionIdx];
          return <div key={`da-${objectiveIndex}-${actionIdx}`}>{renderCell(action?.text || '', { type: 'daily', objectiveIndex, actionIndex: actionIdx, location: 'outer' }, false)}</div>;
        })}
      </div>
    );
  };

  const renderCenterBlock = () => (
    <div className="grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 bg-border/30 rounded-md">
      {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((objIdx) => {
        if (objIdx === -1) {
          return <div key="main-goal">{renderCell(plan.mainGoal, { type: 'main', location: 'center' }, true)}</div>;
        }
        return <div key={`center-yo-${objIdx}`}>{renderCell(plan.yearlyObjectives[objIdx], { type: 'yearly', objectiveIndex: objIdx, location: 'center' }, false)}</div>;
      })}
    </div>
  );

  const suggestions = getSuggestions();

  return (
    <div className="w-full max-w-6xl mx-auto px-2 md:px-4">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.mandala.title}</h1>
        <p className="text-sm text-muted-foreground mb-3">{t.mandala.subtitle}</p>
        <motion.div
          key={tip}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 inline-block max-w-md"
        >
          {tip}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <PlanProgress />

      {/* Action bar */}
      <div className="flex gap-2 justify-center mb-4 flex-wrap">
        <button
          onClick={() => { setShowTemplates(!showTemplates); setShowCategories(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {t.mandala.examplePlans}
        </button>
        <button
          onClick={() => { setShowCategories(!showCategories); setShowTemplates(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t.mandala.goalIdeas}
        </button>
        {/* View toggle */}
        <button
          onClick={() => setViewMode(showCards ? 'grid' : 'cards')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-full hover:bg-secondary transition-colors"
        >
          {showCards ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
          {showCards ? t.mandala.gridView : t.mandala.listView}
        </button>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{t.mandala.loadExample}</h3>
                <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.mandala.loadExampleDesc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {t.examplePlans.map(tp => (
                  <button
                    key={tp.id}
                    onClick={() => handleTemplateClick(tp)}
                    className="text-left p-3 rounded-md border border-border hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{tp.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tp.description}</div>
                    <div className="text-xs text-primary mt-1 flex items-center gap-0.5">
                      {t.mandala.loadTemplate} <ChevronRight className="w-3 h-3" />
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{t.mandala.goalIdeas}</h3>
                <button onClick={() => setShowCategories(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.mandala.browseCategoriesDesc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {t.categories.map(cat => (
                  <div key={cat.id} className="border border-border rounded-md p-2">
                    <div className="font-medium text-xs mb-1">{cat.emoji} {cat.name}</div>
                    <div className="space-y-0.5">
                      {cat.objectiveIdeas.slice(0, 2).map((idea, i) => (
                        <button key={i} onClick={() => { navigator.clipboard.writeText(idea); toast({ title: t.mandala.copied, duration: 1000 }); }} className="block w-full text-left text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded px-1 py-0.5 transition-colors" title={t.mandala.clickToCopy}>
                          {idea}
                        </button>
                      ))}
                      <div className="text-[10px] text-muted-foreground/60 pl-1">+{cat.habitIdeas.length} {t.mandala.habitIdeasCount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual suggestions */}
      <AnimatePresence>
        {editing && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-3 flex items-start gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">{t.mandala.ideas}</span>
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={e => { e.preventDefault(); setEditValue(s); }} className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border hover:border-primary/50 hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Grid or Cards */}
      {showCards ? (
        <MandalaCardView />
      ) : (
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
      )}

      {/* Bottom quote */}
      <motion.p key={quote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-muted-foreground/70 mt-6 italic max-w-md mx-auto">
        {quote}
      </motion.p>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, template: open ? confirmDialog.template : null })}
        title="Substituir plano atual?"
        description="Isso vai substituir seu plano atual pelo modelo selecionado. Suas metas e hábitos atuais serão perdidos. Tem certeza?"
        confirmLabel="Sim, carregar modelo"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (confirmDialog.template) loadTemplate(confirmDialog.template);
        }}
        variant="destructive"
      />
    </div>
  );
}
