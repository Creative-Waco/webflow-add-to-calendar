# Creative Waco — Add to calendar (Webflow embed)

Small static assets for the Event CMS template: **Google Calendar**, **Outlook** (Microsoft 365 + Outlook.com), **Yahoo**, and a universal **.ics** download.

## Files

| File | Role |
|------|------|
| `add-to-calendar.js` | Widget (reads `data-cw-*` attributes, builds links + `.ics`) |
| `add-to-calendar.css` | Optional default styles (scope: `.cw-cal-*`) |
| `add-to-calendar-snippet.html` | HTML to paste into a Webflow Embed; bind attributes to CMS fields |

## Use in Webflow

1. Host these files on **HTTPS** (this repo on GitHub, Webflow assets, or your CDN).
2. **Site settings → Custom Code → Footer** (load once):

   ```html
   <link rel="stylesheet" href="https://YOUR_HOST/add-to-calendar.css">
   <script src="https://YOUR_HOST/add-to-calendar.js" defer></script>
   ```

3. On the **Event** template, add an **Embed** and paste the snippet; bind `data-cw-title`, `data-cw-start`, `data-cw-end`, `data-cw-location`, `data-cw-description`, `data-cw-url`, `data-cw-uid-slug` to your CMS fields (see comments in the snippet).

## Git remote (GitHub)

This directory is a **standalone git repository** so you can push only these files to a public or private GitHub repo and use **raw** URLs in Webflow.

```bash
cd "path/to/Workspace/website/embed"
git status   # should be clean after commit

# Create an empty repo on GitHub, then:
git remote add origin https://github.com/ORG/REPO.git
git branch -M main
git push -u origin main
```

**Raw file URLs** (replace `ORG`, `REPO`, and commit ref as needed; `main` may work for `refs/heads/main` on GitHub):

- `https://raw.githubusercontent.com/ORG/REPO/main/add-to-calendar.js`
- `https://raw.githubusercontent.com/ORG/REPO/main/add-to-calendar.css`

Use those in the Webflow Custom Code block. Pin to a **commit SHA** or **tag** for stable production URLs.

**jsDelivr** (optional, CDN in front of GitHub):

- `https://cdn.jsdelivr.net/gh/ORG/REPO@main/add-to-calendar.js`

## License

Use and modify for Creative Waco; no separate license file in this package unless your organization adds one.
