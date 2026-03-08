import { usePlan } from '@/contexts/PlanContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Theme, exportPlan, importPlan } from '@/lib/store';
import { type Language, LANGUAGE_NAMES } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Download, Upload, Palette, Shield, Globe } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

const THEMES_CONFIG: { id: Theme; preview: string[] }[] = [
  { id: 'confia', preview: ['hsl(210, 30%, 98%)', 'hsl(205, 65%, 52%)', 'hsl(345, 55%, 68%)'] },
  { id: 'zen', preview: ['hsl(40, 20%, 97%)', 'hsl(25, 30%, 35%)', 'hsl(15, 40%, 55%)'] },
  { id: 'bold', preview: ['hsl(230, 25%, 8%)', 'hsl(150, 80%, 50%)', 'hsl(40, 95%, 55%)'] },
  { id: 'warm', preview: ['hsl(30, 30%, 96%)', 'hsl(155, 35%, 38%)', 'hsl(18, 65%, 55%)'] },
  { id: 'editorial', preview: ['hsl(0, 0%, 98%)', 'hsl(0, 0%, 8%)', 'hsl(0, 72%, 51%)'] },
];

const LANGUAGES: Language[] = ['en', 'es', 'pt-br', 'fr', 'de'];

export default function SettingsPanel() {
  const { plan, updatePlan, setTheme } = usePlan();
  const { language, setLanguage, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themesMeta: Record<Theme, { name: string; description: string }> = {
    confia: { name: t.themes.confia, description: t.themes.confiaDesc },
    zen: { name: t.themes.zen, description: t.themes.zenDesc },
    bold: { name: t.themes.bold, description: t.themes.boldDesc },
    warm: { name: t.themes.warm, description: t.themes.warmDesc },
    editorial: { name: t.themes.editorial, description: t.themes.editorialDesc },
  };

  const handleExport = () => {
    const data = exportPlan(plan);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'harada-plan.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.settings.exported);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importPlan(reader.result as string);
      if (result) {
        updatePlan(() => result);
        toast.success(t.settings.imported);
      } else {
        toast.error(t.settings.invalidFile);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t.settings.title}</h1>

      {/* Language Picker */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">{t.settings.language}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <motion.button
              key={lang}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-4 py-3 rounded-lg border-2 text-left transition-all ${
                language === lang
                  ? 'border-primary shadow-elevated'
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setLanguage(lang)}
            >
              <div className="font-semibold text-sm">{LANGUAGE_NAMES[lang]}</div>
              {language === lang && (
                <motion.div
                  layoutId="lang-indicator"
                  className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Theme Picker */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-lg">{t.settings.chooseVibe}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES_CONFIG.map(theme => (
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
              <div className="font-semibold text-sm">{themesMeta[theme.id].name}</div>
              <div className="text-xs text-muted-foreground">{themesMeta[theme.id].description}</div>
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

      {/* Data Privacy Notice */}
      <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{t.settings.privacyNote}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t.settings.privacyText}
        </p>
      </div>

      {/* Export / Import */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg mb-3">{t.settings.data}</h2>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-lg shadow-card hover:bg-secondary/50 transition-colors"
        >
          <Download className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="font-medium text-sm">{t.settings.exportPlan}</div>
            <div className="text-xs text-muted-foreground">{t.settings.exportDesc}</div>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-lg shadow-card hover:bg-secondary/50 transition-colors"
        >
          <Upload className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="font-medium text-sm">{t.settings.importPlan}</div>
            <div className="text-xs text-muted-foreground">{t.settings.importDesc}</div>
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
