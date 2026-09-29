# TomHaven

A phone catalogue and admin dashboard for TomHaven, built with React, Vite and
Supabase. Products live in Supabase, so anything the admin adds or edits stays
there across devices and after the site is redeployed.

This README is written for someone still learning web development. Follow it
in order.

---

## 1. Install Node.js (skip if you already have it)

1. Go to https://nodejs.org
2. Download the **LTS** version and install it with the default options
3. Confirm it worked: open a terminal and run
   ```
   node -v
   npm -v
   ```
   Both should print a version number.

## 2. Install the project's dependencies

Open this folder in VS Code, open a terminal inside it (Terminal > New
Terminal), then run:

```
npm install
```

## 3. Create a Supabase project

1. Go to https://supabase.com and sign up or log in
2. Click **New project**
3. Give it a name (e.g. `tomhaven`), generate a database password and save it
   somewhere safe, pick a region, click **Create new project**
4. Wait about a minute for it to finish setting up

## 4. Create the database tables

1. In your Supabase project, open the **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `supabase/schema.sql` from this project, copy the entire file
4. Paste it into the SQL editor and click **Run**

This one file creates the `products` table, the `business_settings` table,
the `admins` table, all the security rules, the `product-images` storage
bucket, and the first product (iPhone 14 Pro, 128GB, ₦735,000). It is safe to
run more than once.

## 5. Create the first admin account

The website checks two things before letting someone into `/admin`: they
must be logged in, **and** their account must be listed in the `admins`
table. This means nobody can make themselves an admin from the website.

1. In Supabase, go to **Authentication > Users**
2. Click **Add user > Create new user**
3. Enter the email and password you (or Akintomide) will log in with, and
   make sure **Auto Confirm User** is switched on, then create the user
4. Copy the new user's **UID** shown in the users list
5. Go back to the **SQL Editor**, run this (replace the UID):
   ```sql
   insert into public.admins (user_id) values ('paste-the-uid-here');
   ```
6. That account can now log in at `/admin/login`

Add more admins later the same way.

## 6. Get your API keys

1. In Supabase, go to **Settings > API**
2. Copy the **Project URL**
3. Copy the **anon / public** key (never the `service_role` key, that one
   must stay private)

## 7. Create your local `.env` file

1. In this project, copy `.env.example` to a new file named `.env`
2. Fill in the two values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Save it. `.env` is already in `.gitignore`, so it will never be uploaded
   to GitHub.

## 8. Run it locally

```
npm run dev
```

Open the address it prints (usually `http://localhost:5173`).

- The phone catalogue is at `/`
- Admin login is at `/admin/login`

Test the full loop: log in, add a phone with a photo, check it appears on
the public site, edit it, mark it sold, then delete it.

## 9. Put the project on GitHub

1. Create a new repository on GitHub (public or private, either works)
2. In this project's terminal:
   ```
   git init
   git add .
   git commit -m "TomHaven website"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```
   Only the project files are pushed, `.env` and `node_modules` are excluded
   automatically by `.gitignore`.

## 10. Deploy to Render

1. Go to https://render.com and sign in with GitHub
2. Click **New > Static Site**
3. Pick this repository
4. Fill in:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Under **Environment Variables**, add the same two values from your
   `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Create Static Site**

Because this is a Static Site (not a server), it never sleeps the way
Render's free web services do, phone catalogues load instantly at any time.

### Routes like `/admin` or `/product/123` after a refresh

A `render.yaml` file is included that rewrites every route to `index.html`,
which is what React Router needs. If you created the site by hand in step 10
instead of using this file, add the same rule manually in Render under
**Redirects/Rewrites**: source `/*`, destination `/index.html`, action
`Rewrite`.

## 11. Keep Supabase active

A Supabase free project pauses itself after about a week with no requests.
This repo includes `.github/workflows/keep-alive.yml`, a small GitHub Action
that visits your database twice a week automatically so it never pauses.

To turn it on:
1. On GitHub, open your repo > **Settings > Secrets and variables >
   Actions**
2. Add two repository secrets:
   - `SUPABASE_URL` = same value as `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` = same value as `VITE_SUPABASE_ANON_KEY`

That's it, GitHub runs it on its own schedule from now on.

## 12. Connecting a custom domain later

1. Buy a domain (Namecheap or Porkbun are both cheap and reliable)
2. In Render, open your site > **Settings > Custom Domains > Add**
3. Render shows a CNAME record, add it at your domain registrar's DNS
   settings
4. Wait for it to verify (usually a few minutes to a few hours)

---

## Everyday use for Akintomide (non-technical)

- Log in at `yoursite.com/admin/login`
- **Add Phone**: fill in the name and price (required), add a photo, leave
  anything else blank if unsure
- **Edit**: change any detail or replace the photo
- **Mark sold / Mark available**: toggle without deleting the listing
- **Delete**: permanently removes a phone, asks for confirmation first

## Project structure

```
src/
  components/   Reusable UI: product card, buttons, image, dialogs, states
  context/      App-wide state: auth, business settings, toast messages
  hooks/        usePageMeta (SEO tags), useProducts (fetch + reload)
  layouts/      Public site frame and admin frame
  lib/          Formatting, search/filter logic, Supabase client
  pages/        One file per route, admin pages live in pages/admin/
  services/     All Supabase calls (products, images, settings, auth)
  styles/       global.css, the whole site's styling
supabase/
  schema.sql    Run once per Supabase project, see step 4
```

## Adding laptops or repairs later

The `products` table already has a `category` column, defaulted to
`"phone"`. To add laptops:

1. Start saving new products with `category: "laptop"`
2. Add a `/laptops` page similar to `src/pages/Phones.jsx`, but call
   `listProducts({ category: "laptop" })`
3. Add a link to it in `src/components/Header.jsx`

No database changes are needed to do this.

## Environment variables reference

| Variable | Where to find it | Used for |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase > Settings > API > Project URL | Connecting to your database |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon/public key | Public read/write access, restricted by the RLS rules in schema.sql |

## Important warnings

- Never put a `service_role` key in this project, front-end code is public
  and that key bypasses all security rules.
- Never commit a real `.env` file to GitHub.
- Only accounts listed in the `admins` table can add, edit or delete
  products, this is enforced by the database itself, not just by hiding the
  `/admin` page.
