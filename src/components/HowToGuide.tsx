import { motion } from 'framer-motion';
import { Target, Grid3X3, CheckSquare, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STEP_ICONS = [Target, Grid3X3, ArrowRight, CheckSquare];

export default function HowToGuide() {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t.howTo.title}</h1>
        <p className="text-muted-foreground text-sm">
          {t.howTo.subtitle}
        </p>
      </div>

      {/* Visual diagram */}
      <div className="bg-card rounded-lg shadow-card p-6 mb-8">
        <div className="grid grid-cols-3 gap-1 max-w-[240px] mx-auto mb-4">
          {[0,1,2,3,-1,4,5,6,7].map((i, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              className={`aspect-square rounded flex items-center justify-center text-[9px] font-medium ${
                i === -1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {i === -1 ? t.howTo.diagramDream : `${t.howTo.diagramGoal} ${i + 1}`}
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {t.howTo.diagramCaption}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {t.howTo.steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 bg-card rounded-lg shadow-card p-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ohtani reference */}
      <div className="mt-8 p-4 bg-gradient-subtle rounded-lg border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
          {t.howTo.ohtaniQuote}
        </p>
        <p className="text-[10px] text-muted-foreground text-center mt-2">{t.howTo.ohtaniSource}</p>
      </div>
    </div>
  );
}
