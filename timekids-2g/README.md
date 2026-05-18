# TIME Kids — landing pages (frontend only)

Copy this entire `landingpage_enquiry` folder into your other project. It has **no database, no API, and no SendGrid** — only HTML, CSS, images, JS, and email templates for your backend to use.

## Folder layout

```
landingpage_enquiry/
├── pages/           # Landing + thank-you HTML
├── email/           # Subject, body template, form field notes
├── css/
├── images/
└── js/
```

## Pages

| File | Use |
|------|-----|
| `pages/landing-page.html` | Google campaign (`source=Google`) |
| `pages/landing-page-fb.html` | Facebook (`source=facebook`) |
| `pages/landing-page-yt.html` | YouTube (`source=Youtube`) |
| `pages/thank-you.html` | After Google submit — FB Pixel + Google Ads conversion |
| `pages/thank-you-fb.html` | After Facebook submit — same tracking block |

## Served from main site (port 3000)

Landing HTML is published under `public/timekids-2g/` so URLs match the legacy pattern:

- `http://localhost:3000/timekids-2g/landing-page.html?City=Hyderabad`
- `http://localhost:3000/timekids-2g/landing-page-fb.html?City=Hyderabad`
- `http://localhost:3000/timekids-2g/landing-page-yt.html?City=Hyderabad`

After editing files in `pages/`, copy assets and re-publish HTML (paths use `css/`, `images/`, `js/` relative to `/timekids-2g/`):

```powershell
$pub = "public/timekids-2g"
robocopy css "$pub/css" /E
robocopy js "$pub/js" /E
robocopy images "$pub/images" /E
# Then copy each pages/*.html to $pub/*.html with ../css → css/, ../images → images/, ../js → js/
```

## Wire your backend (required)

1. **Form submit** — In each landing file, replace:
   - `../YOUR_BACKEND/Datasave-landing-page_g.php`  
   with your save script URL (PHP, Node, etc.).

2. **City / location dropdowns** — Replace:
   - `../YOUR_BACKEND/getCitiesonSource.php`  
   in the jQuery `$.ajax` calls with your cities API (same POST shape as legacy: `{ state }` or `{ city }`).

3. **Thank-you redirect** — After a successful save, redirect the browser to:
   - `pages/thank-you.html` (Google / YouTube landings), or  
   - `pages/thank-you-fb.html` (Facebook landing).

4. **Email** — Use `email/subject.txt` and `email/body.template.html`. Replace `{{name}}`, `{{centreName}}`, `{{centrePhone}}`, `{{centreEmail}}` with values from your `franchise` / centre lookup (see `Datasave-landing-page_g.php` in the main TIME Kids repo).

5. **SendGrid** — See `email/sendgrid.example.json` for a minimal API body shape (`from`, `cc`, HTML content).

## Tracking

Thank-you pages include the same tags as `Datasave-landing-page_g.php` (Facebook Pixel `530571304555113`, Google Ads `AW-826528153`, Kids conversion `hpQdCLiAmoccEJmjj4oD`). Edit in the HTML if your other project uses different IDs.

## Reference backend (not included)

The full PHP save flow lives in the main repo as `Datasave-landing-page_g.php` + `getCitiesonSource.php` + `send_emailsgrid.php`. Copy or reimplement only what you need in the other project.
