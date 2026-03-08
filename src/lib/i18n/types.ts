export type Language = 'en' | 'es' | 'pt-br' | 'fr' | 'de';

export interface ExamplePlanTranslation {
  id: string;
  name: string;
  description: string;
  mainGoal: string;
  yearlyObjectives: string[];
  sampleActions: Record<string, string>;
}

export interface GoalCategoryTranslation {
  id: string;
  emoji: string;
  name: string;
  objectiveIdeas: string[];
  habitIdeas: string[];
}

export interface Translations {
  nav: {
    mandala: string;
    daily: string;
    howTo: string;
    settings: string;
  };
  mandala: {
    title: string;
    subtitle: string;
    yourDream: string;
    yearlyGoal: string;
    addGoal: string;
    addHabit: string;
    examplePlans: string;
    goalIdeas: string;
    loadExample: string;
    loadExampleDesc: string;
    loadTemplate: string;
    replaceConfirm: string;
    ideas: string;
    habitIdeasCount: string;
    browseCategoriesDesc: string;
    clickToCopy: string;
  };
  daily: {
    title: string;
    dayStreak: string;
    completed: string;
    progress: string;
    noHabits: string;
    noHabitsDesc: string;
    objective: string;
    motivational: Record<string, string>;
  };
  howTo: {
    title: string;
    subtitle: string;
    steps: { title: string; description: string }[];
    diagramDream: string;
    diagramGoal: string;
    diagramCaption: string;
    ohtaniQuote: string;
    ohtaniSource: string;
    successStories: { title: string; description: string }[];
    methodNote: string;
    methodNoteTitle: string;
  };
  settings: {
    title: string;
    chooseVibe: string;
    privacyNote: string;
    privacyText: string;
    data: string;
    exportPlan: string;
    exportDesc: string;
    importPlan: string;
    importDesc: string;
    language: string;
    exported: string;
    imported: string;
    invalidFile: string;
  };
  themes: {
    confia: string;
    confiaDesc: string;
    zen: string;
    zenDesc: string;
    bold: string;
    boldDesc: string;
    warm: string;
    warmDesc: string;
    editorial: string;
    editorialDesc: string;
  };
  notFound: {
    title: string;
    message: string;
    returnHome: string;
  };
  tips: string[];
  quotes: string[];
  examplePlans: ExamplePlanTranslation[];
  categories: GoalCategoryTranslation[];
  mainGoalSuggestions: string[];
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  'pt-br': 'Português (BR)',
  fr: 'Français',
  de: 'Deutsch',
};
