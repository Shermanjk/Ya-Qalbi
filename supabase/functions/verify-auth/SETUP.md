# verify-auth Edge Function Setup

## 1. Seed the partner_auth table

Paste this into Supabase SQL Editor and run it:

```sql
-- Step 1: Goodnight word
INSERT INTO partner_auth (step, answer) VALUES
  (1, 'love'),
  (1, 'my love');

-- Step 2: Monthsary date (all accepted formats for June 26)
INSERT INTO partner_auth (step, answer) VALUES
  (2, 'june 26'),
  (2, 'jun 26'),
  (2, '06/26'),
  (2, '06-26'),
  (2, '6/26'),
  (2, '6-26'),
  (2, '26 june'),
  (2, '26 jun'),
  (2, '26/06'),
  (2, '26-06'),
  (2, 'june26'),
  (2, 'jun26');
```

Answers are stored in lowercase. The Edge Function normalises
whatever the user types (trim + lowercase) before comparing,
so "Love", "LOVE", "MY LOVE" all work.

## 2. Deploy the Edge Function

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy verify-auth
```

## 3. Update login.js

Replace the placeholders in auth/login.js:

```js
const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Both are the public keys — safe to put in frontend code.
The service role key stays only in Supabase secrets, never in source code.
