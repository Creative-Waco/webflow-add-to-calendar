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

This directory is a **standalone git repository**. The canonical remote is the **Creative Waco** organization (not Tortoise & Hare):

**Repository:** [github.com/Creative-Waco/webflow-add-to-calendar](https://github.com/Creative-Waco/webflow-add-to-calendar)

Clone or update:

```bash
git clone https://github.com/Creative-Waco/webflow-add-to-calendar.git
cd webflow-add-to-calendar
```

**Raw file URLs** for Webflow Custom Code (pin a **commit SHA** or **release tag** for production stability):

- `https://raw.githubusercontent.com/Creative-Waco/webflow-add-to-calendar/main/add-to-calendar.js`
- `https://raw.githubusercontent.com/Creative-Waco/webflow-add-to-calendar/main/add-to-calendar.css`

**jsDelivr** (optional CDN in front of GitHub):

- `https://cdn.jsdelivr.net/gh/Creative-Waco/webflow-add-to-calendar@main/add-to-calendar.js`

## License

Use and modify for Creative Waco; no separate license file in this package unless your organization adds one.
