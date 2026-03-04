# AI Study Companion

Modern, mobile-first study tracker for competitive exam aspirants (JEE, NEET, UPSC, CA).

Built with React + Vite + Tailwind + Chart.js + Supabase Auth/DB.

## Features

### Landing Page
- Conversion-focused sections: Hero, Features, How It Works, Exam Modes, Testimonials, CTA, Footer
- Animated hero illustration
- Smooth section scrolling
- Dark/Light mode toggle (before login)
- Responsive layout for mobile and desktop

### Authentication
- Register with:
  - Full name
  - Email
  - Username
  - Password
  - Exam mode
- Email verification via Supabase
- Login with:
  - Email + password
  - Username + password (via SQL username lookup function)
- Session persistence with Supabase auth

### Dashboard
- Greeting header with date and streak
- 4 quick stats cards:
  - Study hours
  - Break time
  - Sleep hours
  - Productivity score
- Study timer:
  - Start / pause / end
  - Subject-wise tracking by exam mode
  - Active timer state persisted
- Manual subject entry:
  - Add past study minutes by subject
  - Edit / delete session entries
- Daily log:
  - Wake-up / sleep time
  - Multiple study intervals
  - Multiple break intervals
  - Mood
- Today chart:
  - Subject-wise bar chart
- AI-style insights panel (rule based)
- Test performance:
  - Log subject tests
  - Marks scored / total
  - Test duration
  - Edit / delete test logs

### Analytics
- Weekly overview:
  - Total study
  - Avg sleep
  - Productive day
  - Streak
- Monthly progress (3 months)
- Deep analysis cards:
  - Consistency
  - Subject balance
  - Best focus window
  - Test efficiency
- Subject pie chart
- Weekly/monthly test subject score chart
- Weekly test score trend
- Test time by subject
- 35-day heatmap intensity grid
- Small "Download Data" backup button (JSON export)

### Notes
- Daily notes with:
  - What I learned
  - Mistakes today
  - Tomorrow goal
- Saved by date
- Recent entries list

### AI-like Personalization
- Large greeting combinations (time-aware and rotating)
- Motivational line generation from rich phrase pools
- Optional adaptive plan fallback logic (local/free planner)

## Tech Stack

- React 18 (Vite)
- Tailwind CSS
- Chart.js + react-chartjs-2
- Framer Motion
- Supabase (`@supabase/supabase-js`)
- LocalStorage (theme/session/cache support)

## Project Structure

```text
ai-study-companion/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── supabase-username-login.sql
├── vercel.json
├── .env.example
└── package.json
```

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env.local
```

Set values in `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

3. Start dev server

```bash
npm run dev
```

4. Production build

```bash
npm run build
```

## Supabase Setup

### 1) Core schema
Run your main schema SQL (tables/policies/triggers for `profiles`, `sessions`, `daily_logs`, `notes`, `test_logs`).

### 2) Username login function
Run:

```sql
-- file: supabase-username-login.sql
create or replace function public.lookup_login_email(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_key text;
  v_count integer;
  v_email text;
begin
  v_key := lower(trim(coalesce(p_username, '')));
  if v_key = '' then
    return null;
  end if;

  select u.email
  into v_email
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where lower(coalesce(p.username, '')) = v_key
     or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) = v_key
     or lower(split_part(coalesce(u.email, ''), '@', 1)) = v_key
  limit 1;

  if v_email is not null then
    return v_email;
  end if;

  select count(*)
  into v_count
  from (
    select u.id
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    where lower(coalesce(p.username, '')) like v_key || '%'
       or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) like v_key || '%'
       or lower(split_part(coalesce(u.email, ''), '@', 1)) like v_key || '%'
    limit 2
  ) candidates;

  if v_count = 1 then
    select u.email
    into v_email
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    where lower(coalesce(p.username, '')) like v_key || '%'
       or lower(coalesce(u.raw_user_meta_data ->> 'username', '')) like v_key || '%'
       or lower(split_part(coalesce(u.email, ''), '@', 1)) like v_key || '%'
    limit 1;
  end if;

  return v_email;
end;
$$;

revoke all on function public.lookup_login_email(text) from public;
grant execute on function public.lookup_login_email(text) to anon, authenticated;
```

### 3) Auth URL configuration
In Supabase Auth settings:
- Set Site URL to deployed app URL
- Add Redirect URLs:
  - `https://your-domain.vercel.app/login`
  - `http://localhost:5173/login`
  - `http://localhost:4173/login`

## Deployment (Vercel)

This repo already includes `vercel.json` with SPA rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deploy steps:
1. Import repo in Vercel
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Username login says invalid credentials
- Confirm SQL function is installed (`lookup_login_email`)
- Test in SQL:
  - `select public.lookup_login_email('your_username');`
- If null, sync username in `public.profiles` and `auth.users.raw_user_meta_data`

### Login button stuck on "Logging in..."
- Latest app has login timeout protection
- Check network / Supabase status
- Hard refresh browser cache once after new deploy

### Email verification opens wrong URL / 404
- Ensure Supabase Site URL + Redirect URLs are correct
- Use new verification email after changing settings
- Keep `vercel.json` rewrite enabled for SPA routing

## Security Notes

- Passwords are managed by Supabase Auth (hashed)
- Row Level Security should remain enabled on all user data tables
- Never commit `.env.local`

