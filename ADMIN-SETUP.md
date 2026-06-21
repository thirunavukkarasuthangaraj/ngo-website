# Admin Events — one-time setup (free, no server)

This connects your **Admin page** (`admin.html`) and **Events page** (`events.html`) to a
**Google Sheet** (your "Excel") using a **Google Apps Script** web app. Once set up:

- You add an event on `admin.html` → it's saved to the Google Sheet **and** emailed to you.
- The Events page reads the Sheet and shows events **automatically**.

You only do this once (~10 minutes).

---

## Step 1 — Create the Google Sheet
1. Go to <https://sheets.google.com> and create a **blank** spreadsheet.
2. Name it e.g. **"KKP Events"**. (The script makes the tabs/columns for you.)

## Step 2 — Add the script
1. In that sheet: **Extensions → Apps Script**.
2. Delete any sample code, then **paste the entire contents** of
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. At the top, change these 2 lines:
   ```js
   var ADMIN_TOKEN  = 'CHANGE-THIS-SECRET';            // pick a private password
   var NOTIFY_EMAIL = 'karisakattupoovetn@gmail.com';  // where to email new events
   ```
4. Click **Save** (💾).

## Step 3 — Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Gear icon → **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** **Anyone**
4. Click **Deploy**, then **Authorize access** (allow your Google account).
5. Copy the **Web app URL** — it ends in `/exec`.

## Step 4 — Connect the website
1. Open [`js/config.js`](js/config.js) in the project.
2. Paste your URL:
   ```js
   window.KPT_CONFIG = {
     EVENTS_API: "https://script.google.com/macros/s/AKfy....../exec"
   };
   ```
3. Commit & push (or, with Claude, just say **"push"**).

---

## Using it
- Go to **`/admin.html`** on your site (it's hidden — not in the menu).
- Fill the form, enter your **Admin Token** (the secret from Step 2), and **Create Event**.
- The event is written to your Google Sheet, emailed to you, and appears on the **Events** page.
- Edit or delete events anytime **directly in the Google Sheet** — the website always reflects the Sheet.

### What gets saved — 3 tabs (auto-created in the same Sheet)
Once connected, the **same Google Sheet** captures everything, each in its own tab:

| Tab | Filled when… | Columns |
|-----|--------------|---------|
| **Events** | admin creates an event (`/admin.html`) | Timestamp · Title · Date · Time · Location · Description · Status |
| **Volunteers** | someone submits the **Volunteer** form | Timestamp · Name · Phone · Email · Location · Availability · Interests · Skills |
| **Enquiries** | someone submits the **Contact** form | Timestamp · Name · Email · Phone · Subject · Message |

You get an **email** for every submission, and can view/sort/export all of it in the Sheet.
- **Event Date** — saved as `YYYY-MM-DD`; **Status** `upcoming`/`past` (past dates auto-detected).
- Volunteer & Contact forms still also open WhatsApp (instant ping) — the Sheet is your permanent record.

---

## Notes & security
- The Admin page is public, but creating events requires your **secret token** (checked on the server),
  so visitors can't add events.
- Keep your token private. To change it later, edit `ADMIN_TOKEN` in the Apps Script and **re-deploy**
  (Deploy → Manage deployments → edit → new version).
- Want volunteer-form or contact-form submissions in the same Sheet too? Ask and we can extend the script.
