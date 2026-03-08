import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { getActionsForObjective } from '@/lib/store';

// Mandala grid positions: center = main goal, surrounding 8 = yearly objectives
// Each yearly objective block has 8 daily actions around it

const OBJECTIVE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
];

// Grid layout: 3x3 of 3x3 blocks
// Position mapping for the 8 yearly objectives around center
const BLOCK_POSITIONS = [
  { row: 0, col: 0 }, // top-left
  { row: 0, col: 1 }, // top-center
  { row: 0, col: 2 }, // top-right
  { row: 1, col: 0 }, // mid-left
  // center is main goal
  { row: 1, col: 2 }, // mid-right
  { row: 2, col: 0 }, // bottom-left
  { row: 2, col: 1 }, // bottom-center
  { row: 2, col: 2 }, // bottom-right
];

// Within each 3x3 sub-block, the center is the yearly objective
// and the 8 surrounding cells are daily actions
const CELL_POSITIONS = [
  { r: 0, c: 0 },
  { r: 0, c: 1 },
  { r: 0, c: 2 },
  { r: 1, c: 0 },
  // center = yearly objective
  { r: 1, c: 2 },
  { r: 2, c: 0 },
  { r: 2, c: 1 },
  { r: 2, c: 2 },
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
        {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((actionIdx, gridIdx) => {
          if (actionIdx === -1) {
            // Center cell = yearly objective
            return (
              <div key={`yo-${objectiveIndex}`}>
                {renderCell(
                  yearlyGoal,
                  { type: 'yearly', objectiveIndex, location: 'outer' },
                  true,
                  objectiveIndex
                )}
              </div>
            );
          }
          const action = actions[actionIdx];
          return (
            <div key={`da-${objectiveIndex}-${actionIdx}`}>
              {renderCell(
                action?.text || '',
                { type: 'daily', objectiveIndex, actionIndex: actionIdx },
                false
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCenterBlock = () => {
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5 bg-border/30 rounded-md">
        {[0, 1, 2, 3, -1, 4, 5, 6, 7].map((objIdx, gridIdx) => {
          if (objIdx === -1) {
            return (
              <div key="main-goal">
                {renderCell(
                  plan.mainGoal,
                  { type: 'main' },
                  true
                )}
              </div>
            );
          }
          return (
            <div key={`center-yo-${objIdx}`}>
              {renderCell(
                plan.yearlyObjectives[objIdx],
                { type: 'yearly', objectiveIndex: objIdx },
                false
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 md:px-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Mandala Chart</h1>
        <p className="text-sm text-muted-foreground">Click any cell to edit. Center = your dream goal.</p>
      </div>

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
    </div>
  );
}
