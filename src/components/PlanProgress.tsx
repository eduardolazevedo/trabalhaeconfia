import { usePlan } from '@/contexts/PlanContext';
import { getFilledActionsCount } from '@/lib/store';
import { motion } from 'framer-motion';

const MILESTONES = [
  { pct: 25, msg: '🌱 Ótimo começo! 1/4 do plano preenchido.' },
  { pct: 50, msg: '🔥 Metade do caminho! Você está construindo algo real.' },
  { pct: 75, msg: '⭐ Quase lá! Seu plano está ganhando forma.' },
  { pct: 100, msg: '🎉 Plano completo! Agora é só executar, um dia de cada vez.' },
];

export default function PlanProgress() {
  const { plan } = usePlan();
  const filled = getFilledActionsCount(plan);
  const totalObjectives = plan.yearlyObjectives.filter(o => o.trim()).length;
  const hasMainGoal = plan.mainGoal.trim() !== '';
  const total = 1 + 8 + 64; // main + objectives + actions
  const filledTotal = (hasMainGoal ? 1 : 0) + totalObjectives + filled;
  const pct = Math.round((filledTotal / total) * 100);

  const milestone = [...MILESTONES].reverse().find(m => pct >= m.pct);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          Progresso do plano
        </span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Milestone markers */}
        {MILESTONES.map(m => (
          <div
            key={m.pct}
            className="absolute top-0 bottom-0 w-px bg-background/60"
            style={{ left: `${m.pct}%` }}
          />
        ))}
      </div>
      {milestone && (
        <motion.p
          key={milestone.pct}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-muted-foreground mt-1.5 text-center"
        >
          {milestone.msg}
        </motion.p>
      )}
    </div>
  );
}
