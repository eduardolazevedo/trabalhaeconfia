import { motion } from 'framer-motion';
import { Target, Grid3X3, CheckSquare, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: Target,
    title: '1. Set Your Dream Goal',
    description: 'Click the center cell of the entire grid — this is your multi-year life objective. Think big: "Become the best version of myself" or "Build a thriving business."',
  },
  {
    icon: Grid3X3,
    title: '2. Define 8 Yearly Objectives',
    description: 'The 8 cells surrounding your dream goal each represent a yearly objective. These are the key areas that, if achieved this year, will move you closer to your dream. Examples: Health, Career, Relationships, Finance...',
  },
  {
    icon: ArrowRight,
    title: '3. Plan 64 Daily Actions',
    description: 'Each yearly objective has its own 3×3 block in the outer ring. The center of each block mirrors the yearly goal. Fill the 8 surrounding cells with specific daily habits that drive that objective.',
  },
  {
    icon: CheckSquare,
    title: '4. Track Daily',
    description: 'Switch to the Daily tab to check off your habits each day. Build streaks, track completion rates, and watch your consistency grow over time.',
  },
];

export default function HowToGuide() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h1>
        <p className="text-muted-foreground text-sm">
          The Harada Method — used by Shohei Ohtani to become the greatest baseball player in history.
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
              {i === -1 ? '🎯 Dream' : `Goal ${i + 1}`}
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Center = Your Dream → 8 Yearly Goals → 64 Daily Habits
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 bg-card rounded-lg shadow-card p-4"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ohtani reference */}
      <div className="mt-8 p-4 bg-gradient-subtle rounded-lg border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
          "As a teenager in Japan, Shohei Ohtani learned to break an audacious goal into small, measurable behaviors — from strength routines to mental habits to community contributions. That discipline shaped his development for years."
        </p>
        <p className="text-[10px] text-muted-foreground text-center mt-2">— Harvard Business School Case Study</p>
      </div>
    </div>
  );
}
