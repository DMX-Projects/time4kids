# Form POST fields (landing pages → your backend)

| Field | Type | Notes |
|-------|------|--------|
| `name` | text | Parent name |
| `telephone` | text | Mobile (max 11 in HTML) |
| `email` | text | Parent email |
| `city` | hidden | Filled by state/city UI |
| `state` | select | State dropdown |
| `Location` | select | Centre / area (`id="Location"`) |
| `source` | hidden | `Google`, `facebook`, or `Youtube` per page |
| `submition` | submit | Button name (legacy spelling) |

Your save script should:

1. Insert the enquiry (dedupe by name + mobile + campaign if needed).
2. Load centre from `franchise` by `Location` (see `Datasave-landing-page_g.php` in the main repo).
3. Build email from `body.template.html` + `subject.txt`.
4. Redirect or link user to `pages/thank-you.html` (Google) or `pages/thank-you-fb.html` (Facebook).
