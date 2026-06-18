# T.I.M.E. KIDS landing pages (Feb campaigns)

Static HTML landings for franchise lead ads. **Published copies** live under `public/` so Next.js serves them at:

| URL | Source folder |
|-----|----------------|
| `/Timekids-meta-feb/` | `public/Timekids-meta-feb/` |
| `/Timekids-lp-feb/` | `public/Timekids-lp-feb/` |

## Edit workflow

1. Change files in `tkids-lp/Timekids-meta-feb/` or `tkids-lp/Timekids-lp-feb/`.
2. Copy to `public/` (PowerShell):

```powershell
$base = "c:\Users\Admin1\Desktop\time4kids website\time4kids"
robocopy "$base\tkids-lp\Timekids-meta-feb" "$base\public\Timekids-meta-feb" /E
robocopy "$base\tkids-lp\Timekids-lp-feb" "$base\public\Timekids-lp-feb" /E
```

3. Test locally: `npm run dev` → open `http://localhost:3000/Timekids-meta-feb/`
4. Deploy: `git push` + `npm run build` on live.

Lead form uses **Meritto / NoPaperForms** (widget in `index.html`). Meta variant redirects to `thank-you.html` after submit.
