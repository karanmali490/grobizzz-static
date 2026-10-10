# GROBizzz Static (HTML / CSS / JS only – no Node)

Embed this into your existing admin / live site. No `npm start` required.

## Files

```
form.html              → Create business form (put in admin)
profile.html           → Public profile page
css/form.css
css/profile-*.css      → 3 templates
js/config.js           → Supabase URL + anon key (EDIT THIS)
js/form.js
js/profile.js
supabase-rls-static.sql → Run once in Supabase
```

## Setup (5 minutes)

### 1. Edit `js/config.js`

```js
SUPABASE_URL: 'https://xxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbG...',   // anon / publishable key only
PROFILE_BASE: 'profile.html?slug=',
```

### 2. Run SQL

Supabase → SQL Editor → run `supabase-rls-static.sql`

### 3. Storage buckets (public)

- `business-logos`
- `business-covers`
- `business-gallery`

Allow public read + upload for anon (Storage policies).

### 4. Open form

Upload folder to your server, open:

```
https://yoursite.com/path/to/form.html
```

After publish, profile opens:

```
https://yoursite.com/path/to/profile.html?slug=hydeout-cafe
```

## Embed in existing admin

1. Copy the whole `grobizzz-static` folder into your project, e.g. `/admin/grobizzz/`
2. From admin menu link to: `/admin/grobizzz/form.html`
3. Public link for customers: `/admin/grobizzz/profile.html?slug=SLUG`

Or copy files into your structure and adjust paths in HTML if needed.

## No Node / no Vercel API

- Form writes directly to Supabase
- Profile reads directly from Supabase
- Images upload to Supabase Storage

## Security note

Use **anon key only**. Never put service_role key in these JS files.
