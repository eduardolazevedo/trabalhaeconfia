// Zero-cost, fully local inspiration data for the Harada Method planning phase

export interface ExamplePlan {
  id: string;
  name: string;
  description: string;
  mainGoal: string;
  yearlyObjectives: string[];
  // Sparse: only filled actions. Key = "objIndex-posIndex"
  sampleActions: Record<string, string>;
}

export interface GoalCategory {
  id: string;
  emoji: string;
  name: string;
  objectiveIdeas: string[];
  habitIdeas: string[];
}

// ─── Example Plans ───────────────────────────────────────────────

export const EXAMPLE_PLANS: ExamplePlan[] = [
  {
    id: 'ohtani',
    name: "Ohtani's High School Plan",
    description: 'Shohei Ohtani created this at age 16 to become a top MLB draft pick.',
    mainGoal: '8 NPB team first-round draft pick',
    yearlyObjectives: [
      'Pitching: 160 km/h fastball',
      'Control & command',
      'Build a powerful body',
      'Fielding excellence',
      'Batting power & consistency',
      'Mental toughness',
      'Character & human quality',
      'Luck & positive energy',
    ],
    sampleActions: {
      '0-0': 'Shoulder flexibility routine',
      '0-1': 'Core stability exercises',
      '0-2': 'Analyze pro pitcher mechanics',
      '0-3': 'Long toss daily',
      '1-0': 'Throw to targets daily',
      '1-1': 'Practice changeup grip',
      '1-2': 'Visualize strike zone',
      '2-0': 'Eat 3 balanced meals',
      '2-1': 'Sleep 8+ hours nightly',
      '2-2': 'Squat & deadlift routine',
      '2-3': 'Run sprints 3x/week',
      '3-0': 'Field 100 grounders daily',
      '3-1': 'Quick-release practice',
      '4-0': 'Batting cage 200 swings',
      '4-1': 'Study pitch sequences',
      '5-0': 'Positive self-talk practice',
      '5-1': 'Handle pressure situations',
      '5-2': 'Journal after each game',
      '6-0': 'Greet everyone warmly',
      '6-1': 'Clean up the dugout',
      '6-2': 'Read books monthly',
      '6-3': 'Support teammates daily',
      '7-0': 'Pick up trash / be tidy',
      '7-1': 'Be punctual always',
      '7-2': 'Show gratitude daily',
      '7-3': 'Respect equipment & tools',
    },
  },
  {
    id: 'career',
    name: 'Career Growth Plan',
    description: 'Advance your career with structured goals across skills, network, and mindset.',
    mainGoal: 'Get promoted to Senior role within 12 months',
    yearlyObjectives: [
      'Master core technical skills',
      'Build leadership abilities',
      'Grow professional network',
      'Improve communication',
      'Financial literacy',
      'Work-life balance',
      'Personal brand',
      'Health & energy',
    ],
    sampleActions: {
      '0-0': 'Complete 1 online course per month',
      '0-1': 'Read industry articles daily',
      '0-2': 'Practice coding challenges 3x/week',
      '1-0': 'Mentor a junior colleague',
      '1-1': 'Lead one team meeting weekly',
      '2-0': 'Attend 1 networking event monthly',
      '2-1': 'Connect with 2 new people weekly',
      '3-0': 'Practice public speaking weekly',
      '3-1': 'Write clear documentation daily',
      '4-0': 'Track expenses weekly',
      '5-0': 'Leave work on time 4 days/week',
      '5-1': 'Take all vacation days',
      '6-0': 'Post on LinkedIn weekly',
      '7-0': 'Exercise 30 min daily',
      '7-1': 'Sleep 7+ hours nightly',
    },
  },
  {
    id: 'wellness',
    name: 'Holistic Wellness Plan',
    description: 'A balanced approach to physical, mental, and spiritual well-being.',
    mainGoal: 'Achieve vibrant health and inner peace',
    yearlyObjectives: [
      'Physical fitness',
      'Nutrition & diet',
      'Mental health',
      'Quality sleep',
      'Relationships',
      'Spiritual practice',
      'Creative expression',
      'Financial wellness',
    ],
    sampleActions: {
      '0-0': 'Morning yoga 20 min',
      '0-1': 'Walk 10,000 steps daily',
      '0-2': 'Strength train 3x/week',
      '1-0': 'Meal prep on Sundays',
      '1-1': 'Eat 5 servings of vegetables',
      '1-2': 'Drink 2L water daily',
      '2-0': 'Meditate 10 min morning',
      '2-1': 'Journal before bed',
      '2-2': 'Therapy session bi-weekly',
      '3-0': 'No screens 1hr before bed',
      '3-1': 'Consistent sleep schedule',
      '4-0': 'Call a friend weekly',
      '4-1': 'Date night weekly',
      '5-0': 'Gratitude list daily',
      '5-1': 'Read spiritual text 15 min',
      '6-0': 'Draw or paint weekly',
      '6-1': 'Play music 20 min daily',
      '7-0': 'Review budget weekly',
      '7-1': 'Save 20% of income',
    },
  },
  {
    id: 'student',
    name: 'Academic Excellence Plan',
    description: 'Excel in studies while building life skills and staying healthy.',
    mainGoal: 'Graduate top 10% with strong life foundations',
    yearlyObjectives: [
      'Academic performance',
      'Study habits',
      'Extracurriculars',
      'Social skills',
      'Physical health',
      'Mental wellness',
      'Career preparation',
      'Financial independence',
    ],
    sampleActions: {
      '0-0': 'Attend every class',
      '0-1': 'Review notes same day',
      '0-2': 'Visit office hours weekly',
      '1-0': 'Study in 50-min blocks',
      '1-1': 'Use active recall technique',
      '1-2': 'Study group once a week',
      '2-0': 'Join 2 clubs actively',
      '2-1': 'Volunteer monthly',
      '3-0': 'Meet 1 new person weekly',
      '4-0': 'Exercise 30 min daily',
      '4-1': 'Eat balanced meals',
      '5-0': 'Sleep 8 hours nightly',
      '5-1': 'Practice mindfulness daily',
      '6-0': 'Update resume quarterly',
      '6-1': 'Apply to 1 internship monthly',
      '7-0': 'Track spending weekly',
      '7-1': 'Work part-time or freelance',
    },
  },
  {
    id: 'family',
    name: 'Bem-Estar Familiar',
    description: 'Fortaleça laços familiares, construa relações saudáveis e crie um lar harmonioso.',
    mainGoal: 'Construir uma família unida, saudável e feliz',
    yearlyObjectives: [
      'Comunicação e diálogo aberto',
      'Tempo de qualidade em família',
      'Saúde física da família',
      'Educação e crescimento dos filhos',
      'Relacionamento do casal',
      'Saúde mental e emocional',
      'Rede de apoio e comunidade',
      'Organização do lar',
    ],
    sampleActions: {
      '0-0': 'Jantar juntos sem celular',
      '0-1': 'Perguntar "como foi seu dia?" com atenção',
      '0-2': 'Reunião familiar semanal (15 min)',
      '0-3': 'Resolver conflitos no mesmo dia',
      '1-0': 'Passeio em família no fim de semana',
      '1-1': 'Jogo de tabuleiro ou atividade juntos',
      '1-2': 'Cozinhar uma refeição juntos',
      '1-3': 'Ler para os filhos antes de dormir',
      '2-0': 'Atividade física em família (caminhada, bike)',
      '2-1': 'Preparar lanches saudáveis para a semana',
      '2-2': 'Check-up médico anual de todos',
      '3-0': 'Acompanhar tarefas escolares',
      '3-1': 'Ensinar uma habilidade nova por mês',
      '3-2': 'Incentivar leitura diária',
      '4-0': 'Date night semanal (mesmo em casa)',
      '4-1': 'Expressar gratidão ao parceiro(a) diariamente',
      '4-2': 'Planejar um objetivo a dois',
      '5-0': 'Meditar ou orar juntos',
      '5-1': 'Celebrar pequenas vitórias em família',
      '5-2': 'Praticar escuta ativa e empatia',
      '6-0': 'Visitar avós/parentes mensalmente',
      '6-1': 'Participar de evento comunitário',
      '6-2': 'Cultivar amizades de família',
      '7-0': 'Manter a casa organizada (15 min/dia)',
      '7-1': 'Definir responsabilidades para cada membro',
      '7-2': 'Fazer manutenção preventiva do lar',
    },
  },
  {
    id: 'finances',
    name: 'Finanças Pessoais & Poupança',
    description: 'Organize suas finanças, elimine dívidas, construa patrimônio e garanta segurança para a família.',
    mainGoal: 'Conquistar liberdade financeira e segurança para a família',
    yearlyObjectives: [
      'Controle de gastos e orçamento',
      'Eliminação de dívidas',
      'Reserva de emergência',
      'Investimentos e patrimônio',
      'Renda extra / lado empreendedor',
      'Educação financeira contínua',
      'Planejamento familiar financeiro',
      'Generosidade e contribuição social',
    ],
    sampleActions: {
      '0-0': 'Anotar todos os gastos do dia',
      '0-1': 'Revisar orçamento semanal (domingo)',
      '0-2': 'Categorizar despesas: essencial vs desejo',
      '0-3': 'Cancelar assinatura que não uso',
      '1-0': 'Listar todas as dívidas (valor e juros)',
      '1-1': 'Pagar primeiro a dívida com maior juros',
      '1-2': 'Negociar taxas com banco/cartão',
      '1-3': 'Não contrair dívida nova hoje',
      '2-0': 'Transferir valor fixo para poupança/reserva',
      '2-1': 'Meta: 6 meses de despesas na reserva',
      '2-2': 'Automatizar transferência mensal',
      '3-0': 'Estudar 1 tipo de investimento por semana',
      '3-1': 'Aplicar valor mensal em renda fixa ou variável',
      '3-2': 'Revisar carteira de investimentos trimestralmente',
      '4-0': 'Dedicar 1h/dia ao projeto de renda extra',
      '4-1': 'Listar habilidades monetizáveis',
      '4-2': 'Buscar 1 cliente ou oportunidade por semana',
      '5-0': 'Ler 15 min sobre finanças pessoais',
      '5-1': 'Ouvir podcast de educação financeira',
      '5-2': 'Ensinar 1 conceito financeiro para a família',
      '6-0': 'Conversar com cônjuge sobre metas financeiras',
      '6-1': 'Planejar grandes compras com antecedência',
      '6-2': 'Revisar seguros e previdência anualmente',
      '7-0': 'Doar ou contribuir com causa social mensalmente',
      '7-1': 'Apoiar um pequeno negócio local',
      '7-2': 'Ensinar educação financeira para os filhos',
    },
  },
];

// ─── Goal Categories with Ideas ─────────────────────────────────

export const GOAL_CATEGORIES: GoalCategory[] = [
  {
    id: 'health',
    emoji: '💪',
    name: 'Health & Fitness',
    objectiveIdeas: [
      'Build cardiovascular endurance',
      'Achieve ideal body composition',
      'Master a sport or physical skill',
      'Develop consistent exercise routine',
    ],
    habitIdeas: [
      'Walk 10,000 steps',
      'Stretch for 10 minutes',
      'Drink 8 glasses of water',
      'Do 20 push-ups',
      'Take the stairs',
      'No sugary drinks today',
      'Cook a healthy meal',
      'Track calories/macros',
    ],
  },
  {
    id: 'career',
    emoji: '💼',
    name: 'Career & Work',
    objectiveIdeas: [
      'Get promoted to next level',
      'Switch to dream career',
      'Build a side business',
      'Master a new professional skill',
    ],
    habitIdeas: [
      'Deep work for 2 hours',
      'Read industry news',
      'Network with 1 person',
      'Update portfolio/resume',
      'Learn a new tool or skill',
      'Write a blog post',
      'Mentor someone',
      'Review weekly goals',
    ],
  },
  {
    id: 'relationships',
    emoji: '❤️',
    name: 'Relationships',
    objectiveIdeas: [
      'Deepen family connections',
      'Build a supportive friend group',
      'Improve romantic relationship',
      'Become a better communicator',
    ],
    habitIdeas: [
      'Call a family member',
      'Send an encouraging message',
      'Practice active listening',
      'Plan a date or outing',
      'Express gratitude to someone',
      'Resolve conflicts same day',
      'Quality time without phones',
      'Write a letter or note',
    ],
  },
  {
    id: 'finance',
    emoji: '💰',
    name: 'Finance & Wealth',
    objectiveIdeas: [
      'Build emergency fund',
      'Eliminate all debt',
      'Start investing regularly',
      'Create passive income stream',
    ],
    habitIdeas: [
      'Track daily expenses',
      'Review budget weekly',
      'No impulse purchases today',
      'Read about investing',
      'Save a fixed amount daily',
      'Review subscriptions monthly',
      'Negotiate one bill',
      'Learn about tax optimization',
    ],
  },
  {
    id: 'learning',
    emoji: '📚',
    name: 'Learning & Growth',
    objectiveIdeas: [
      'Read 30 books this year',
      'Learn a new language',
      'Complete a certification',
      'Master a creative skill',
    ],
    habitIdeas: [
      'Read for 30 minutes',
      'Watch an educational video',
      'Practice new language 15 min',
      'Take notes on what you learn',
      'Teach someone what you learned',
      'Listen to a podcast',
      'Write a reflection',
      'Solve a challenging problem',
    ],
  },
  {
    id: 'creative',
    emoji: '🎨',
    name: 'Creativity & Art',
    objectiveIdeas: [
      'Complete a creative project',
      'Develop a daily art practice',
      'Learn a musical instrument',
      'Write a book or screenplay',
    ],
    habitIdeas: [
      'Draw or sketch for 20 min',
      'Write 500 words',
      'Practice instrument 30 min',
      'Take a creative photo',
      'Visit a museum or gallery',
      'Try a new creative technique',
      'Share creative work online',
      'Brainstorm 10 ideas',
    ],
  },
  {
    id: 'spiritual',
    emoji: '🧘',
    name: 'Spiritual & Mindfulness',
    objectiveIdeas: [
      'Establish daily meditation',
      'Develop gratitude practice',
      'Connect with a faith community',
      'Find purpose and meaning',
    ],
    habitIdeas: [
      'Meditate for 10 minutes',
      'Write 3 gratitude items',
      'Pray or reflect quietly',
      'Practice deep breathing',
      'Spend time in nature',
      'Perform an act of kindness',
      'Read spiritual texts',
      'Practice forgiveness',
    ],
  },
  {
    id: 'community',
    emoji: '🌍',
    name: 'Community & Impact',
    objectiveIdeas: [
      'Volunteer regularly',
      'Reduce environmental footprint',
      'Mentor young people',
      'Contribute to a cause',
    ],
    habitIdeas: [
      'Volunteer 1 hour',
      'Recycle and reduce waste',
      'Support a local business',
      'Donate to a cause',
      'Organize a community event',
      'Teach a skill to others',
      'Pick up litter',
      'Advocate for a cause online',
    ],
  },
];

// ─── Contextual Cell Prompts ────────────────────────────────────

export function getObjectivePrompts(goalText: string): string[] {
  const lower = goalText.toLowerCase();
  for (const cat of GOAL_CATEGORIES) {
    const keywords = cat.name.toLowerCase().split(/[&\s]+/);
    if (keywords.some(k => k.length > 2 && lower.includes(k))) {
      return cat.objectiveIdeas;
    }
  }
  return [
    'What skill do you need to develop?',
    'What habit would support this goal?',
    'What relationship helps here?',
    'What resource do you need?',
  ];
}

export function getHabitPrompts(objectiveText: string): string[] {
  const lower = objectiveText.toLowerCase();
  for (const cat of GOAL_CATEGORIES) {
    const keywords = cat.name.toLowerCase().split(/[&\s]+/);
    if (keywords.some(k => k.length > 2 && lower.includes(k))) {
      return cat.habitIdeas;
    }
  }
  // Generic habit prompts
  return [
    'What can you do every morning?',
    'What 15-minute task moves this forward?',
    'What should you track daily?',
    'What can you practice consistently?',
  ];
}

// ─── Motivational Quotes & Tips ─────────────────────────────────

export const PLANNING_TIPS: string[] = [
  "💡 Start with your dream in the center. Don't hold back — think big!",
  '💡 Each yearly objective should directly support your main dream.',
  '💡 Daily habits should be small, specific, and repeatable.',
  "💡 Ohtani included 'pick up trash' and 'greet everyone' as habits — character counts!",
  '💡 If a habit takes more than 30 minutes, break it into smaller parts.',
  '💡 Mix physical, mental, and social habits for balanced growth.',
  "💡 Write habits as actions: 'Run 2km' not 'Be more fit'.",
  '💡 Review and adjust your plan monthly — it should evolve with you.',
  '💡 The Harada Method works because daily consistency beats occasional intensity.',
  '💡 Fill every cell, even if some feel like a stretch. You can refine later.',
];

export const MOTIVATIONAL_QUOTES: string[] = [
  '"The only way to do great work is to love what you do." — Steve Jobs',
  '"Small daily improvements are the key to staggering long-term results." — Robin Sharma',
  '"You do not rise to the level of your goals. You fall to the level of your systems." — James Clear',
  '"The secret of getting ahead is getting started." — Mark Twain',
  '"What you do every day matters more than what you do once in a while." — Gretchen Rubin',
  '"Success is the sum of small efforts, repeated day in and day out." — Robert Collier',
  '"A goal without a plan is just a wish." — Antoine de Saint-Exupéry',
  '"Discipline is choosing between what you want now and what you want most." — Abraham Lincoln',
  '"The journey of a thousand miles begins with one step." — Lao Tzu',
  '"It does not matter how slowly you go as long as you do not stop." — Confucius',
];

export function getRandomTip(): string {
  return PLANNING_TIPS[Math.floor(Math.random() * PLANNING_TIPS.length)];
}

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}
