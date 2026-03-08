# Trabalha e Confia — Architecture Guide

> **Audience:** Development team taking over deployment and backend migration.

---

## 1. Overview

**Trabalha e Confia** is a goal-planning app based on the **Harada Method (Open Window 64)**. Users define 1 main goal → 8 yearly objectives → 64 daily actions, then track completion daily.

| Layer        | Tech                                      |
| ------------ | ----------------------------------------- |
| UI           | React 18 + TypeScript + Tailwind CSS      |
| Routing      | React Router v6 (SPA, hash-free)          |
| State        | React Context (`PlanContext`)              |
| Persistence  | `StorageAdapter` interface (localStorage) |
| Animation    | Framer Motion                             |
| Components   | shadcn/ui (Radix primitives)              |
| Build        | Vite + SWC                                |
| Tests        | Vitest + Testing Library                  |
| i18n         | Custom (5 languages: en, es, pt-br, fr, de) |

---

## 2. Data Model

```typescript
interface HaradaPlan {
  mainGoal: string;                          // Single life goal
  yearlyObjectives: string[];                // Always 8 items
  dailyActions: DailyAction[];               // Always 64 items (8 per objective)
  completions: Record<string, Completion>;   // Keyed by "YYYY-MM-DD"
  theme: Theme;                              // 'confia' | 'zen' | 'bold' | 'warm' | 'editorial'
  createdAt: string;                         // ISO 8601
}

interface DailyAction {
  id: string;                    // Random alphanumeric (9 chars)
  text: string;                  // Max 500 chars
  yearlyObjectiveIndex: number;  // 0–7
  positionIndex: number;         // 0–7 within objective
}

type Completion = { [actionId: string]: boolean };
```

### Invariants
- `yearlyObjectives.length === 8` (always)
- `dailyActions.length === 64` (always)
- Action IDs are unique within a plan
- Completions are keyed by ISO date string (`YYYY-MM-DD`)

---

## 3. Storage Architecture

The app uses the **Strategy Pattern** for persistence:

```
StorageAdapter (interface)
  ├── LocalStorageAdapter  ← current default
  └── YourBackendAdapter   ← implement this
```

### Interface (`src/lib/storage/types.ts`)

```typescript
interface StorageAdapter {
  loadPlan(): Promise<HaradaPlan | null>;
  savePlan(plan: HaradaPlan): Promise<void>;
  getFlag(key: string): Promise<string | null>;
  setFlag(key: string, value: string): Promise<void>;
}
```

### Migration to Backend

1. Create a class implementing `StorageAdapter` (e.g., `SupabaseStorageAdapter`)
2. Inject it via `<StorageProvider adapter={new YourAdapter()}>` in `App.tsx`
3. **No other code changes needed** — the entire app reads/writes through this interface

#### Example Supabase Adapter

```typescript
class SupabaseStorageAdapter implements StorageAdapter {
  constructor(private client: SupabaseClient, private userId: string) {}

  async loadPlan() {
    const { data } = await this.client
      .from('plans')
      .select('data')
      .eq('user_id', this.userId)
      .single();
    return data?.data ?? null;
  }

  async savePlan(plan: HaradaPlan) {
    await this.client
      .from('plans')
      .upsert({ user_id: this.userId, data: plan, updated_at: new Date().toISOString() });
  }

  async getFlag(key: string) {
    const { data } = await this.client
      .from('user_flags')
      .select('value')
      .eq('user_id', this.userId)
      .eq('key', key)
      .single();
    return data?.value ?? null;
  }

  async setFlag(key: string, value: string) {
    await this.client
      .from('user_flags')
      .upsert({ user_id: this.userId, key, value });
  }
}
```

---

## 4. Recommended Database Schema

### Tables

```sql
-- Plans table (one plan per user)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Simple key-value flags (onboarding state, preferences)
CREATE TABLE user_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE (user_id, key)
);

-- User roles (NEVER store on profiles table)
CREATE TYPE app_role AS ENUM ('admin', 'user');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### Row-Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Plans: users can only access their own
CREATE POLICY "Users manage own plan"
  ON plans FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Flags: users can only access their own
CREATE POLICY "Users manage own flags"
  ON user_flags FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Role check function (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

## 5. Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (don't edit directly)
│   ├── AppNav.tsx        # Bottom navigation bar
│   ├── ConfirmDialog.tsx # Reusable confirmation modal
│   ├── DailyTracker.tsx  # Daily action checklist
│   ├── MandalaGrid.tsx   # 9×9 Harada grid editor
│   ├── MandalaCardView.tsx # Card-based grid view
│   ├── Onboarding.tsx    # First-run wizard
│   ├── PlanProgress.tsx  # Progress indicator
│   ├── PlanWizard.tsx    # Guided plan creation
│   ├── HowToGuide.tsx    # Tutorial content
│   └── SettingsPanel.tsx # Theme, language, import/export
├── contexts/
│   ├── PlanContext.tsx    # Global plan state + persistence
│   └── LanguageContext.tsx # i18n context
├── hooks/
│   ├── usePlanDerived.ts # Business logic hooks (completions, streak, progress)
│   └── use-mobile.tsx    # Responsive breakpoint hook
├── lib/
│   ├── store.ts          # Data model, validation, pure functions
│   ├── storage/          # StorageAdapter pattern
│   │   ├── types.ts
│   │   ├── local-storage-adapter.ts
│   │   ├── StorageContext.tsx
│   │   └── index.ts
│   ├── i18n/             # Translation files (en, es, pt-br, fr, de)
│   ├── inspiration.ts    # Motivational quotes
│   └── utils.ts          # Tailwind merge utility
├── pages/
│   ├── Index.tsx          # Main grid view
│   ├── DailyPage.tsx      # Daily tracker view
│   ├── SettingsPage.tsx   # Settings view
│   ├── HowToPage.tsx      # Tutorial view
│   └── NotFound.tsx       # 404
└── test/
    ├── setup.ts
    ├── store.test.ts      # 20 unit tests for data model
    └── example.test.ts
```

---

## 6. Theming System

5 themes defined via CSS custom properties in `src/index.css`, activated by `data-theme` attribute on `<html>`.

| Theme      | Vibe                     |
| ---------- | ------------------------ |
| `confia`   | Calming blue/pink (default) |
| `zen`      | Earthy warm tones        |
| `bold`     | Dark with neon accents   |
| `warm`     | Organic greens/oranges   |
| `editorial`| High-contrast B&W + red  |

All components use semantic tokens (`--primary`, `--background`, etc.) — never hardcoded colors.

---

## 7. Security Considerations

⚠️ **This app handles sensitive personal life goals.**

- **Data at rest:** Currently localStorage only (client-side). When migrating to a backend, encrypt the `data` JSONB column or use column-level encryption.
- **Input validation:** All imports are validated with strict schema checks (see `importPlan()` in `store.ts`). Max 500 chars per text field.
- **XSS:** React's JSX escaping handles rendering. No `dangerouslySetInnerHTML` is used.
- **Auth:** No authentication yet. When adding auth:
  - Use Supabase Auth or equivalent
  - **Never store roles on the user/profile table** — use a separate `user_roles` table with `SECURITY DEFINER` functions
  - Enable RLS on every table
- **Export:** JSON export contains all user data. Warn users about sharing exported files.

---

## 8. Build & Deploy

```bash
# Install
npm install

# Dev
npm run dev

# Build for production
npm run build        # outputs to dist/

# Run tests
npm test

# Preview production build
npm run preview
```

### Environment Variables

None required for the current localStorage-only version. When adding a backend:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### PWA

The app includes a PWA manifest and service worker for offline support. The service worker caches static assets using a cache-first strategy.

---

## 9. i18n

Translations are plain TypeScript objects in `src/lib/i18n/`. To add a language:

1. Copy `src/lib/i18n/en.ts` → `src/lib/i18n/xx.ts`
2. Translate all strings
3. Add to `src/lib/i18n/index.ts` exports
4. Add to `LANGUAGES` array in `SettingsPanel.tsx`

---

## 10. Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Current coverage: `src/lib/store.ts` — plan creation, validation, import/export, streak calculation.

### Recommended additional tests:
- `StorageAdapter` integration tests with mock adapter
- `PlanContext` render tests (React Testing Library)
- `usePlanDerived` hooks with known plan fixtures
- E2E with Playwright (grid editing, daily tracking, import/export flow)
