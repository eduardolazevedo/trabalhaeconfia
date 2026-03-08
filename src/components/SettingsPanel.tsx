import { usePlan } from '@/contexts/PlanContext';
import { Theme, exportPlan, importPlan } from '@/lib/store';
import { motion } from 'framer-motion';
import { Download, Upload, Palette } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

const THEMES: { id: Theme; name: string; description: string; preview: string[] }[] = [
  {
    id: 'zen',
    name: 'Zen',
    description: 'Japanese minimal, wabi-sabi inspired',
    preview: ['hsl(40, 20%, 97%)', 'hsl(25, 30%, 35%)', 'hsl(15, 40%, 55%)'],
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Dark, high-energy, performance mode',
    preview: ['hsl(230, 25%, 8%)', 'hsl(150, 80%, 50%)', 'hsl(40, 95%, 55%)'],
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Earthy tones, organic wellness feel',
    preview: ['hsl(30, 30%, 96%)', 'hsl(155, 35%, 38%)', 'hsl(18, 65%, 55%)'],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style, sophisticated neutrals',
    preview: ['hsl(0, 0%, 98%)', 'hsl(0, 0%, 8%)', 'hsl(0, 72%, 51%)'],
  },
];

export default function SettingsPanel() {
  const { plan, updatePlan, setTheme } = usePlan();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportPlan(plan);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'harada-plan.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Plan exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importPlan(reader.result as string);
      if (result) {
        updatePlan(() => result);
        toast.success('Plan imported successfully');
      } else {
        toast.error('Invalid plan file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Settings</h1>

      {/* Theme Picker */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">Choose Your Vibe</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(theme => (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                plan.theme === theme.id
                  ? 'border-primary shadow-elevated'
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setTheme(theme.id)}
            >
              <div className="flex gap-1.5 mb-2">
                {theme.preview.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-border/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="font-semibold text-sm">{theme.name}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
              {plan.theme === theme.id && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Export / Import */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg mb-3">Data</h2>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-lg shadow-card hover:bg-secondary/50 transition-colors"
        >
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="font-medium text-sm">Export Plan</div>
            <div className="text-xs text-muted-foreground">Download as JSON file</div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-lg shadow-card hover:bg-secondary/50 transition-colors"
        >
          <Upload className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="font-medium text-sm">Import Plan</div>
            <div className="text-xs text-muted-foreground">Load from JSON file</div>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
