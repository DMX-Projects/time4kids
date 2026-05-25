# Fix 400 errors on `/_next/static/*` (production)

## EMERGENCY — fix live site in ~5 minutes

SSH to **103.65.21.176** (or whoever hosts www.timekidspreschools.in). Someone with `sudo` must do this.

### Step A — ModSecurity off for Next static (try this first)

Edit the nginx site config (often `/etc/nginx/sites-enabled/timekidspreschools` or similar). **Inside** the `server { ... }` block for `www.timekidspreschools.in`, add **above** `location /`:

```nginx
location ^~ /_next/static/ {
    modsecurity off;
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

If you already use `alias` to `.next/static`, keep `alias` and only add `modsecurity off;`.

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Test (use the hash from View Source on the live homepage):

```bash
curl -I "https://www.timekidspreschools.in/_next/static/chunks/webpack-e25193f9985f71f4.js"
```

Must show **`HTTP/2 200`** and `content-type: application/javascript`. If still **400**, ModSecurity may be global — ask host to whitelist `/_next/static/` in WAF.

### Step B — Full redeploy (if Step A gives 404 on webpack)

On your PC (project folder `time4kids`):

```bash
npm ci
npm run build
```

Upload **entire** `.next` folder to the server app directory (same path as running Next). Restart Next:

```bash
pm2 restart all
# or: systemctl restart time4kids-next
```

Hard-refresh the site: **Ctrl+F5**.

---

Symptoms on https://www.timekidspreschools.in:

- `/_next/static/chunks/webpack-*.js` → **400 Bad Request**
- `/_next/static/chunks/app/page-*.js`, `app/layout-*.js` → **400**
- Some other `/_next/static/chunks/*.js` and CSS → **400**
- Site looks unstyled (Tailwind/globals never load); inline `style={{ backgroundColor }}` still works

Homepage HTML references these URLs, but nginx (often **ModSecurity / OWASP CRS**) blocks them **before** Next.js serves the file. Missing random assets return **404**; blocked ones return **400** with `Content-Type: text/html`.

Common triggers:

1. **URI contains `webpack`** (e.g. `webpack-e25193f9985f71f4.js`)
2. **URI contains `/app/`** (App Router chunks under `chunks/app/`)
3. **Response body scan** on large JS bundles (false positive SQL/XSS rules)

## 1) Nginx: serve `/_next/static` directly (recommended)

After `npm run build`, sync the **entire** `.next` folder from the same build. Then:

```nginx
# In your server { } block for www.timekidspreschools.in

# Longest-prefix: static build assets (must match the build you deployed)
location ^~ /_next/static/ {
    alias /var/www/time4kids/.next/static/;   # ← adjust path
    access_log off;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}

# Next.js app (pages, API proxy handled separately)
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Django API / uploads (if not already defined)
location ^~ /api/ {
    proxy_pass http://127.0.0.1:8000;
    include proxy_params;
}

location ^~ /cms-media/ {
    proxy_pass http://127.0.0.1:3000;
    include proxy_params;
}
```

Reload: `sudo nginx -t && sudo systemctl reload nginx`

## 2) ModSecurity: disable for `/_next/static`

If ModSecurity is enabled, add inside the same `server` block (paths vary by install):

```nginx
location ^~ /_next/static/ {
    modsecurity off;
    alias /var/www/time4kids/.next/static/;
    try_files $uri =404;
}
```

Or in Apache: `SecRuleEngine Off` for that directory.

Do **not** disable ModSecurity for `/` or `/api/`—only for hashed static assets.

## 3) Redeploy frontend (same build for HTML + static)

On the build machine:

```bash
cd time4kids
npm ci
npm run build
```

On the server (example):

```bash
rsync -a --delete .next/ user@server:/var/www/time4kids/.next/
pm2 restart time4kids   # or systemctl restart your-next-service
```

Verify (replace hash with one from your homepage View Source):

```bash
curl -I "https://www.timekidspreschools.in/_next/static/chunks/webpack-XXXXXXXX.js"
# Expect: HTTP/2 200 and Content-Type: application/javascript
```

## 4) Do not route `/_next/static` to Django

`next.config.js` rewrites `/static/` to Django **admin** static only. Nginx must not send `/_next/static/` to Gunicorn/Django.

## Quick checklist

| Check | Command / expectation |
|-------|------------------------|
| webpack chunk | `curl -I` → **200**, not 400 |
| `app/layout-*.js` | **200** |
| Main CSS from homepage | **200** (hashed name, not `app/layout.css` in production) |
| Same build | HTML chunk hashes match files under `.next/static/chunks/` |
