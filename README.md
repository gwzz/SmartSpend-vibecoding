# SmartSpend

SmartSpend is a Supabase-backed household expense tracker built with React, TypeScript, Tailwind, and Vite. It supports multi-member budgeting, amortized costs, customizable reflection tags, and bilingual UI (English/Chinese) with currency switching.

## Features
- Email/password authentication with Supabase
- Transactions with categories, household members, amortization windows, and customizable reflection tags
- Charts for spending by day, member, and category (Recharts)
- CSV and JSON export, plus basic PWA install prompts
- Localization (en/zh) and currency selection (USD, CNY, EUR, JPY, GBP)

## Tech Stack
- React 18, TypeScript, Vite 5
- Tailwind CSS 3
- Supabase (auth, Postgres, storage)
- Recharts, lucide-react, uuid

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (you will need the project URL and anon key)

### Installation
1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root and add your Supabase credentials
   ```bash
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-public-anon-key
   ```
   The app currently falls back to hardcoded credentials if these are missing; override them with your own keys in all environments.
3. Start the dev server
   ```bash
   npm run dev
   ```

### Build & Preview
```bash
npm run build   # production build
npm run preview # serve the built app locally
```

## Supabase Schema (minimal)
Create these tables in your Supabase project (types inferred from the app). Use UUID/text primary keys to match client-generated IDs.

```sql
-- members
create table if not exists public.members (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  avatar text not null
);

-- categories
create table if not exists public.categories (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null,
  color text not null
);

-- reflection tags
create table if not exists public.reflection_tags (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  icon text
);

-- transactions
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric not null,
  category_id text references public.categories,
  member_ids jsonb not null,
  date date not null,
  end_date date,
  is_waste boolean default false,
  reflection_flags jsonb default '{"regret":false,"waste":false,"save":false}',
  reflection_tag_ids jsonb default '[]',
  note text,
  timestamp bigint not null
);

-- user settings
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users,
  language text not null default 'en',
  currency text not null default 'USD',
  updated_at timestamptz default now()
);
```

### Updating an Existing Database
If you already have the previous schema (without reflection fields) run the following SQL in Supabase SQL Editor to migrate safely:

```sql
-- 1) Add reflection tags table
create table if not exists public.reflection_tags (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  icon text
);

-- 2) Add reflection flags and tag IDs to transactions
alter table public.transactions
  add column if not exists reflection_flags jsonb default '{"regret":false,"waste":false,"save":false}';

alter table public.transactions
  add column if not exists reflection_tag_ids jsonb default '[]';

update public.transactions
set reflection_flags = jsonb_build_object(
  'regret', coalesce(reflection_flags->>'regret', 'false')::boolean or coalesce(is_waste, false),
  'waste', coalesce(reflection_flags->>'waste', 'false')::boolean,
  'save',  coalesce(reflection_flags->>'save',  'false')::boolean
)
where reflection_flags is null
   or reflection_flags ? 'regret' is false
   or reflection_flags ? 'waste' is false
   or reflection_flags ? 'save' is false;

-- 3) Seed default reflection tags (one-time) for existing users (adjust user_id list as needed)
-- r1/r2/r3 align with app defaults Regret/Waste/Save
insert into public.reflection_tags (id, user_id, name, color, icon)
select * from (
  values
    ('r1', '{{USER_ID}}'::uuid, 'Regret', 'bg-red-100 text-red-700', '⚠️'),
    ('r2', '{{USER_ID}}'::uuid, 'Waste', 'bg-orange-100 text-orange-700', '🗑️'),
    ('r3', '{{USER_ID}}'::uuid, 'Save',   'bg-emerald-100 text-emerald-700', '🐖')
) v(id, user_id, name, color, icon)
on conflict (id) do nothing;

-- 4) Optionally backfill reflection_tag_ids from legacy flags
update public.transactions
set reflection_tag_ids = array_to_json(
  array_remove(
    array_remove(
      array_remove(ARRAY['r1','r2','r3'], case when (reflection_flags->>'regret')::boolean then null else 'r1' end),
      case when (reflection_flags->>'waste')::boolean then null else 'r2' end
    ),
    case when (reflection_flags->>'save')::boolean then null else 'r3' end
  )
)
where coalesce(json_array_length(reflection_tag_ids), 0) = 0;
```

The app seeds default reflection tags for a user if none exist; adjust the seed step for multiple users or custom defaults. The backfill keeps historical `is_waste` data in sync while enabling the new customizable tags.

**Row-Level Security**: enable RLS on all tables and add policies to ensure rows are readable and writable only by `auth.uid()`. Without RLS, any authenticated user can read/write other users' data.

## Project Structure
- App shell and routing: `App.tsx`, `index.tsx`
- Contexts: `contexts/AuthContext.tsx`, `contexts/SettingsContext.tsx`
- Data access: `services/supabase.ts`, `services/storageService.ts`
- Pages: `pages/` (Home, Stats, Settings, Login, etc.)
- UI components and modal: `components/`
- Localization strings: `locales.ts`

## Internationalization
The `Settings` page lets users switch language and currency; translations live in `locales.ts`, and formatting is handled by `SettingsContext`.

## Troubleshooting
- Make sure `.env.local` is loaded before running `npm run dev` so the app does not fall back to the hardcoded Supabase keys.
- If auth succeeds but data is empty, verify that your tables exist and RLS policies allow the signed-in user to read/write their rows.

## Deployment Notes
- The app uses `HashRouter` for routing, so static hosting (e.g., Vercel static export) works without additional rewrite rules.
- Provide the same Supabase env vars in your hosting provider settings.
