import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlan } from '@/contexts/PlanContext';
import { getActionsForObjective } from '@/lib/store';
import { ArrowRight, ArrowLeft, Check, Sparkles, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WIZARD_KEY = 'harada-wizard-done';

export function useWizard() {
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(WIZARD_KEY) === '1'; } catch { return false; }
  });
  const markDone = () => {
    localStorage.setItem(WIZARD_KEY, '1');
    setDone(true);
  };
  return { wizardDone: done, markWizardDone: markDone };
}

interface WizardProps {
  onComplete: () => void;
}

export default function PlanWizard({ onComplete }: WizardProps) {
  const { plan, updatePlan } = usePlan();
  // Steps: 0 = intro, 1-8 = each objective area, 9 = done
  const [step, setStep] = useState(0);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Find which objectives are already filled from onboarding
  const filledObjectives = plan.yearlyObjectives.filter(o => o.trim()).length;
  const totalSteps = Math.max(filledObjectives, 1);

  const getVal = (key: string, fallback: string) => editValues[key] ?? fallback;
  const setVal = (key: string, value: string) => setEditValues(prev => ({ ...prev, [key]: value }));

  const saveCurrentStep = () => {
    if (step === 0) return;
    const objIdx = step - 1;
    updatePlan(prev => {
      const next = { ...prev };
      const objKey = `obj-${objIdx}`;
      if (editValues[objKey] !== undefined) {
        next.yearlyObjectives = [...prev.yearlyObjectives];
        next.yearlyObjectives[objIdx] = editValues[objKey];
      }
      next.dailyActions = prev.dailyActions.map(a => {
        if (a.yearlyObjectiveIndex === objIdx) {
          const actKey = `act-${objIdx}-${a.positionIndex}`;
          if (editValues[actKey] !== undefined) {
            return { ...a, text: editValues[actKey] };
          }
        }
        return a;
      });
      return next;
    });
  };

  const goNext = () => {
    saveCurrentStep();
    if (step >= totalSteps) {
      toast({ title: '🎉 Plano configurado!', description: 'Agora é só executar, um dia de cada vez.' });
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    saveCurrentStep();
    setStep(s => Math.max(0, s - 1));
  };

  const skip = () => {
    saveCurrentStep();
    onComplete();
  };

  const renderIntro = () => (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Vamos completar seu plano! 🚀</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Seu plano já tem {filledObjectives} meta{filledObjectives !== 1 ? 's' : ''} preenchida{filledObjectives !== 1 ? 's' : ''} do onboarding.
        Vamos revisar cada uma e adicionar os hábitos diários que vão te levar até lá.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        💡 Não se preocupe em preencher tudo agora. Você pode editar a qualquer momento.
      </p>
      <button
        onClick={goNext}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        Começar <ArrowRight className="w-4 h-4" />
      </button>
      <button onClick={skip} className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
        Pular e preencher depois
      </button>
    </motion.div>
  );

  const renderObjectiveStep = (objIdx: number) => {
    const objective = getVal(`obj-${objIdx}`, plan.yearlyObjectives[objIdx]);
    const actions = getActionsForObjective(plan, objIdx);

    return (
      <motion.div
        key={`step-${objIdx}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            Meta {objIdx + 1} de {totalSteps}
          </p>
          <button onClick={skip} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < objIdx ? 'bg-primary' : i === objIdx ? 'bg-primary/60' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Objective */}
        <label className="text-xs font-medium text-muted-foreground mb-1 block">⭐ Meta Anual</label>
        <input
          className="w-full bg-card border border-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={objective}
          onChange={e => setVal(`obj-${objIdx}`, e.target.value)}
          placeholder="Ex: Melhorar minha saúde física"
        />

        {/* Actions */}
        <label className="text-xs font-medium text-muted-foreground mb-2 block">📋 Hábitos diários para essa meta</label>
        <div className="space-y-2 mb-6">
          {actions.slice(0, 4).map((action, i) => (
            <div key={action.id} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-muted text-muted-foreground text-[10px] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <input
                className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={getVal(`act-${objIdx}-${action.positionIndex}`, action.text)}
                onChange={e => setVal(`act-${objIdx}-${action.positionIndex}`, e.target.value)}
                placeholder="Ex: Caminhar 30 min por dia"
              />
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground pl-7">
            +4 hábitos extras podem ser adicionados depois na grade completa
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <button
            onClick={goNext}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
          >
            {step >= totalSteps ? (
              <><Check className="w-4 h-4" /> Concluir</>
            ) : (
              <>Próxima <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 ? renderIntro() : renderObjectiveStep(step - 1)}
        </AnimatePresence>
      </div>
    </div>
  );
}
