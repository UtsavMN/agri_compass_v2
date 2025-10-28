Agri Compass v2

Quick start

1) Install

```
npm ci
```

2) Configure env

Create `.env.local` (see `.env.example`):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3) Run

```
npm run dev
```

Supabase schema

Use the SQL in your Supabase project's SQL editor to create required tables (profiles, community_posts, post_likes, expert_questions, expert_answers, farms, crops, market_prices, government_schemes) with RLS. Refer to the issue tracker or ask the maintainer for the latest schema snippet.
