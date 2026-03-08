import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { getActionsForObjective } from '@/lib/store';
import { ChevronDown, ChevronUp, Pencil, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function MandalaCardView() {
  const { plan, updatePlan } = usePlan();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ type: string; objIdx?: number; actIdx?: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (type: string, currentValue: string, objIdx?: number, actIdx?: number) => {
    setEditingCell({ type, objIdx, actIdx });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    updatePlan(prev => {
      const next = { ...prev };
      if (editingCell.type === 'main') {
        next.mainGoal = editValue;
      } else if (editingCell.type === 'yearly' && editingCell.objIdx !== undefined) {
        next.yearlyObjectives = [...prev.yearlyObjectives];
        next.yearlyObjectives[editingCell.objIdx] = editValue;
      } else if (editingCell.type === 'daily' && editingCell.objIdx !== undefined && editingCell.actIdx !== undefined) {
        next.dailyActions = prev.dailyActions.map(a => {
          if (a.yearlyObjectiveIndex === editingCell.objIdx && a.positionIndex === editingCell.actIdx) {
            return { ...a, text: editValue };
          }
          return a;
        });
      }
      return next;
    });
    toast({ title: '✅ Salvo!', duration: 1500 });
    setEditingCell(null);
  };

  const isEditing = (type: string, objIdx?: number, actIdx?: number) =>
    editingCell?.type === type && editingCell?.objIdx === objIdx && editingCell?.actIdx === actIdx;

  const renderEditableField = (
    type: string,
    value: string,
    placeholder: string,
    objIdx?: number,
    actIdx?: number
  ) => {
    if (isEditing(type, objIdx, actIdx)) {
      return (
        <div className="flex items-center gap-2 w-full">
          <input
            autoFocus
            className="flex-1 bg-transparent border-b-2 border-primary text-sm py-1 px-0 focus:outline-none"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setEditingCell(null);
            }}
            onBlur={saveEdit}
          />
          <button onMouseDown={e => { e.preventDefault(); saveEdit(); }} className="text-primary">
            <Check className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <button
        className="flex items-center gap-2 w-full text-left group"
        onClick={() => startEdit(type, value, objIdx, actIdx)}
      >
        <span className={`text-sm flex-1 ${!value ? 'text-muted-foreground italic' : ''}`}>
          {value || placeholder}
        </span>
        <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Main Goal Card */}
      <motion.div
        className="bg-primary text-primary-foreground rounded-xl p-4 shadow-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">🎯 Seu Sonho</div>
        {isEditing('main') ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className="flex-1 bg-transparent border-b-2 border-primary-foreground/50 text-base font-bold py-1 px-0 focus:outline-none placeholder:text-primary-foreground/40"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingCell(null); }}
              onBlur={saveEdit}
            />
            <button onMouseDown={e => { e.preventDefault(); saveEdit(); }}>
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            className="w-full text-left flex items-center gap-2 group"
            onClick={() => startEdit('main', plan.mainGoal)}
          >
            <span className={`text-base font-bold flex-1 ${!plan.mainGoal ? 'opacity-50 italic' : ''}`}>
              {plan.mainGoal || 'Toque para definir seu sonho...'}
            </span>
            <Pencil className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity shrink-0" />
          </button>
        )}
      </motion.div>

      {/* Yearly Objective Cards */}
      {plan.yearlyObjectives.map((objective, objIdx) => {
        const actions = getActionsForObjective(plan, objIdx);
        const filledCount = actions.filter(a => a.text.trim()).length;
        const isExpanded = expandedIdx === objIdx;

        return (
          <motion.div
            key={objIdx}
            className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: objIdx * 0.04 }}
          >
            {/* Objective Header */}
            <div className="flex items-center gap-3 p-3">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  Meta {objIdx + 1}
                </div>
                {renderEditableField('yearly', objective, '+ Adicionar meta anual', objIdx)}
              </div>
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : objIdx)}
                className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-secondary/50 px-2 py-1 rounded-full"
              >
                <span>{filledCount}/8</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Filled progress mini-bar */}
            <div className="h-0.5 bg-muted mx-3 rounded-full overflow-hidden mb-0">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(filledCount / 8) * 100}%` }}
              />
            </div>

            {/* Actions List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-2 space-y-1">
                    {actions.map((action, actIdx) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <span className="w-5 h-5 rounded bg-muted text-muted-foreground text-[10px] flex items-center justify-center shrink-0">
                          {actIdx + 1}
                        </span>
                        {renderEditableField('daily', action.text, '+ Adicionar hábito', objIdx, action.positionIndex)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
