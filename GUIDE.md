# BowlerStats — Complete Owner's Guide
### How to update scores, add matches, and deploy to the internet

---

## PART 1 — UNDERSTANDING YOUR WEBSITE STRUCTURE

Before touching any files, understand what you have:

```
bowlerstats/
│
├── index.html              ← MAIN PAGE (shows today's match)
├── robots.txt              ← Tells Google to index your site
├── sitemap.xml             ← List of all pages for Google
├── vercel.json             ← Vercel deployment settings
│
├── css/
│   └── style.css           ← All visual styling (don't touch unless needed)
│
├── js/
│   └── main.js             ← JavaScript logic (don't touch unless needed)
│
├── pages/
│   ├── match.html          ← Individual match page (works for any match)
│   ├── matches.html        ← List of all previous matches
│   ├── about.html          ← About page
│   ├── contact.html        ← Contact page
│   └── privacy.html        ← Privacy policy page
│
└── data/
    ├── today.json          ← ⭐ TODAY'S MATCH DATA (update this file)
    ├── matches-index.json  ← ⭐ LIST OF PAST MATCHES (update when archiving)
    └── matches/
        └── ipl-2025-rcb-vs-srh-apr14.json   ← Past match files
```

**THE ONLY FILES YOU WILL EVER EDIT:**
1. `data/today.json` — for today's match
2. `data/matches-index.json` — when moving match to past
3. `data/matches/` — folder where you save past match files

---

## PART 2 — UNDERSTANDING THE JSON FORMAT

Your entire website is powered by JSON files. JSON is a simple text format that looks like this:

```json
{
  "key": "value",
  "number": 42,
  "list": [1, 2, 3]
}
```

**THE MOST IMPORTANT RULE:** Every comma, bracket, and quote must be correct. If you make a mistake, the chart won't show. Use https://jsonlint.com to check your JSON after editing.

---

## PART 3 — THE TODAY.JSON FILE EXPLAINED

Open `data/today.json`. Here is what every field means:

```json
{
  "matchId": "ipl-2025-rcb-vs-mi-apr15",
```
**matchId** — A unique ID for this match. Use this format:
`tournament-year-team1-vs-team2-monthday`
Example: `ipl-2025-csk-vs-kkr-apr20`
⚠️ No spaces, only lowercase letters, hyphens between words.

```json
  "team1": "RCB",
  "team2": "MI",
```
**team1** and **team2** — The short team names that appear in the big headline.

```json
  "venue": "M. Chinnaswamy Stadium, Bangalore",
  "date": "2025-04-15",
```
**date** — Must be in YYYY-MM-DD format. Example: `2025-04-20`

```json
  "tournament": "IPL 2025",
```
**tournament** — Shown in the gold badge at top.

```json
  "status": "live",
```
**status** — Use `"live"` for ongoing matches, `"completed"` for finished ones.

```json
  "result": "",
```
**result** — Leave empty (`""`) for live matches. For finished matches, write the winner. Example: `"RCB Won by 24 runs"` or `"MI Won by 5 wickets"`

```json
  "description": "RCB bowled with great discipline...",
```
**description** — 1-3 sentences describing the bowling performance. This shows in the "Match Overview" section.

---

## PART 4 — THE OVERS DATA EXPLAINED

Inside `team1Bowling` and `team2Bowling`, there is an `overs` array. Each item represents one over:

```json
{ "over": 1, "runs": 8, "wickets": 0, "bowler": "Siraj" }
```

- **over** — The over number (1 to 20)
- **runs** — How many TOTAL runs were scored in that over (including extras like wides, no-balls)
- **wickets** — How many wickets fell in that over (0, 1, 2, or rarely 3)
- **bowler** — The bowler's name (be consistent — always spell the same way)

**Example of a wicket over:**
```json
{ "over": 5, "runs": 3, "wickets": 2, "bowler": "Bumrah" }
```
This means: Over 5, Bumrah bowled, 3 runs given, 2 wickets taken.

**IMPORTANT:** The `W` badges you see on the histogram come automatically from the `wickets` field. You just put the number, the website handles the badge.

---

## PART 5 — HOW TO UPDATE SCORES DURING A LIVE MATCH

### Step-by-Step for a Live Match

**Before the match starts:**

1. Open `data/today.json` in a text editor (Notepad on Windows, or any editor)
2. Update the header fields:
   - `matchId` — new match ID
   - `team1`, `team2` — team names
   - `venue` — stadium name
   - `date` — today's date in YYYY-MM-DD format
   - `tournament` — e.g., "IPL 2025"
   - `status` — set to `"live"`
   - `result` — set to `""`
   - `description` — write a short preview, e.g., "RCB face MI in a crucial home fixture."
3. Clear ALL the overs arrays — set `team1Bowling.overs` to `[]` and `team2Bowling.overs` to `[]`
4. Also update `team1Bowling.label` and `team2Bowling.label`. Example: `"RCB Bowling vs MI"` and `"MI Bowling vs RCB"`

**After Over 1 is bowled:**

Add the first over to the correct team's overs array. Say RCB is bowling first:

```json
"team1Bowling": {
  "teamName": "RCB",
  "label": "RCB Bowling vs MI",
  "overs": [
    { "over": 1, "runs": 7, "wickets": 0, "bowler": "Siraj" }
  ]
}
```

**After Over 2:**

Add a comma after the first entry, then add the second:

```json
"overs": [
  { "over": 1, "runs": 7, "wickets": 0, "bowler": "Siraj" },
  { "over": 2, "runs": 9, "wickets": 1, "bowler": "Hazlewood" }
]
```

**Keep adding after each over until all 20 overs are done.**

**After the first innings (overs 1-20 done):**
Now fill in `team2Bowling.overs` the same way, but this time for the team batting second.

**After the match ends:**
- Change `"status": "live"` to `"status": "completed"`
- Add the result: `"result": "RCB Won by 18 runs"`
- Update the `description` to describe how the bowling went

5. Save the file
6. Push to GitHub (explained in Part 7)
7. Vercel will auto-deploy in about 30 seconds

---

## PART 6 — HOW TO MOVE TODAY'S MATCH TO "PREVIOUS MATCHES"

When today's match is over and a NEW match is coming tomorrow, you need to:

**Step 1: Save a copy of today.json as a past match file**

1. Open `data/today.json`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Create a new file inside `data/matches/` folder
4. Name it using the matchId from today.json. Example: `ipl-2025-rcb-vs-mi-apr15.json`
5. Paste the content into this new file
6. Save it

**Step 2: Add the match to matches-index.json**

Open `data/matches-index.json`. It looks like this:

```json
[
  {
    "matchId": "ipl-2025-rcb-vs-srh-apr14",
    "team1": "RCB",
    "team2": "SRH",
    "date": "2025-04-14",
    "venue": "M. Chinnaswamy Stadium, Bangalore",
    "result": "SRH Won",
    "tournament": "IPL 2025"
  }
]
```

Add the new completed match at the TOP of the list (before the existing entry), like this:

```json
[
  {
    "matchId": "ipl-2025-rcb-vs-mi-apr15",
    "team1": "RCB",
    "team2": "MI",
    "date": "2025-04-15",
    "venue": "M. Chinnaswamy Stadium, Bangalore",
    "result": "RCB Won by 24 runs",
    "tournament": "IPL 2025"
  },
  {
    "matchId": "ipl-2025-rcb-vs-srh-apr14",
    "team1": "RCB",
    "team2": "SRH",
    "date": "2025-04-14",
    "venue": "M. Chinnaswamy Stadium, Bangalore",
    "result": "SRH Won",
    "tournament": "IPL 2025"
  }
]
```

⚠️ Notice there is a COMMA after the `}` of the first entry (because there are more entries after it). The LAST entry has NO comma after its `}`.

**Step 3: Update today.json with the new match**

Now edit `data/today.json` to have tomorrow's match details. Set `status` to `"live"` and clear the overs arrays.

**Step 4: Push all three changed files to GitHub.**

---

## PART 7 — SETTING UP GITHUB AND VERCEL (ONE TIME ONLY)

### Step A: Create a GitHub Account
1. Go to https://github.com
2. Click "Sign Up" and create a free account
3. Verify your email

### Step B: Create a New Repository
1. Click the "+" icon in the top right → "New repository"
2. Repository name: `bowlerstats` (or any name you like)
3. Make it **Public** (required for free Vercel)
4. Click "Create repository"

### Step C: Upload Your Files
1. On the new empty repository page, click "uploading an existing file"
2. Drag ALL your bowlerstats files and folders into the upload area
   - `index.html`
   - `css/` (folder)
   - `js/` (folder)
   - `pages/` (folder)
   - `data/` (folder with all JSON files)
   - `sitemap.xml`
   - `robots.txt`
   - `vercel.json`
3. Scroll down, type a commit message like "First upload - BowlerStats"
4. Click "Commit changes"

### Step D: Connect to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access your GitHub
4. Click "Add New Project"
5. Find your `bowlerstats` repository and click "Import"
6. Leave all settings as default — Vercel will auto-detect it's a static site
7. Click "Deploy"
8. Wait about 1 minute — your site is now LIVE!

Vercel will give you a URL like: `https://bowlerstats.vercel.app`

**Every time you push changes to GitHub, Vercel automatically redeploys your site within 30 seconds.**

---

## PART 8 — HOW TO UPDATE SCORES FROM YOUR PHONE

Since you can't run code on your phone, use GitHub's web editor:

1. Go to github.com on your phone browser
2. Navigate to your `bowlerstats` repository
3. Click on `data/` folder
4. Click on `today.json`
5. Click the pencil ✏️ icon (Edit this file)
6. Make your changes to the JSON
7. Scroll down and click "Commit changes"
8. Your site updates automatically in ~30 seconds!

**Tip:** Bookmark `github.com/YOUR-USERNAME/bowlerstats/edit/main/data/today.json` on your phone. This takes you directly to the editor for today's match.

---

## PART 9 — ADDING A COMPLETELY NEW MATCH (TEMPLATE)

Every time a new match comes, replace `data/today.json` with this template:

```json
{
  "matchId": "ipl-2025-TEAM1-vs-TEAM2-monDD",
  "team1": "TEAM1",
  "team2": "TEAM2",
  "venue": "Stadium Name, City",
  "date": "2025-MM-DD",
  "tournament": "IPL 2025",
  "status": "live",
  "result": "",
  "description": "Match preview or live description here.",
  "team1Bowling": {
    "teamName": "TEAM1",
    "label": "TEAM1 Bowling vs TEAM2",
    "overs": []
  },
  "team2Bowling": {
    "teamName": "TEAM2",
    "label": "TEAM2 Bowling vs TEAM1",
    "overs": []
  }
}
```

Then add overs one by one as the match progresses.

---

## PART 10 — ADDING OVERS: QUICK REFERENCE

Each over entry format:
```json
{ "over": NUMBER, "runs": NUMBER, "wickets": NUMBER, "bowler": "NAME" }
```

**Common scenarios:**

Normal over, no wicket:
```json
{ "over": 3, "runs": 8, "wickets": 0, "bowler": "Siraj" }
```

Over with one wicket:
```json
{ "over": 7, "runs": 5, "wickets": 1, "bowler": "Bumrah" }
```

Expensive over with two wickets:
```json
{ "over": 15, "runs": 18, "wickets": 2, "bowler": "Hardik" }
```

Maiden over (0 runs, 1 wicket):
```json
{ "over": 2, "runs": 0, "wickets": 1, "bowler": "Hazlewood" }
```

Wide-heavy over (count total runs including wides):
```json
{ "over": 11, "runs": 14, "wickets": 0, "bowler": "Yash Dayal" }
```

---

## PART 11 — ADDING GOOGLE ADSENSE

### Step 1: Apply for AdSense
1. Go to https://adsense.google.com
2. Sign in with your Google account
3. Click "Get started"
4. Enter your website URL: `https://bowlerstats.vercel.app`
5. Fill in your country, payment details
6. Click "Submit"

Google will review your site. This takes 2-14 days. Requirements:
- ✅ Your site must have real content (yours does)
- ✅ About page (yours has one)
- ✅ Privacy policy (yours has one)
- ✅ Contact page (yours has one)
- ✅ At least a few weeks of content posted

### Step 2: Add AdSense Code After Approval

Once approved, Google gives you a Publisher ID like: `ca-pub-1234567890123456`

Open ALL your HTML files and find this line:

```html
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script> -->
```

Remove the `<!--` and `-->` comment tags, and replace `ca-pub-XXXXXXXXXX` with your real Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456" crossorigin="anonymous"></script>
```

### Step 3: Replace Ad Placeholders

Each ad zone in your HTML looks like:
```html
<div class="ad-placeholder">
  Advertisement
  <!-- 
  <ins class="adsbygoogle" ...></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  -->
</div>
```

Replace the entire div with your AdSense ad unit code from the AdSense dashboard.

---

## PART 12 — GOOGLE SEARCH CONSOLE (GET ON GOOGLE)

After deploying your site:

1. Go to https://search.google.com/search-console
2. Click "Add property"
3. Enter your Vercel URL: `https://bowlerstats.vercel.app`
4. Choose "URL prefix" method
5. Google will give you a verification file to download
6. Upload that file to your GitHub repository root folder
7. Click "Verify" in Search Console
8. Go to "Sitemaps" in the left menu
9. Enter `sitemap.xml` and click "Submit"
10. Google will now start indexing your site!

Your site should appear in Google search results within 1-4 weeks.

---

## PART 13 — COMMON MISTAKES AND HOW TO FIX THEM

**Problem: The histogram doesn't show / page shows "Loading..."**
Fix: Your JSON has an error. Go to https://jsonlint.com, paste your today.json content, click "Validate JSON". Fix any errors it shows.

**Problem: The bars show but no bowler names in legend**
Fix: Check that every `bowler` field has a value. Don't leave it as `""`.

**Problem: I updated today.json but the site didn't change**
Fix: Make sure you committed the file on GitHub. Also try clearing your browser cache (Ctrl+Shift+R on desktop).

**Problem: The previous match doesn't show on the home page**
Fix: Check `data/matches-index.json`. The matchId in the index must exactly match the filename in `data/matches/`. Example: matchId `ipl-2025-rcb-vs-mi-apr15` needs file `data/matches/ipl-2025-rcb-vs-mi-apr15.json`.

**Problem: JSON error — "Unexpected token"**
This is almost always a missing or extra comma. Rules:
- Last item in a list: NO comma after it
- Every other item: comma after it

Wrong:
```json
{ "over": 5, "runs": 7, "wickets": 0, "bowler": "Siraj" },
{ "over": 6, "runs": 9, "wickets": 1, "bowler": "Bumrah" },   ← WRONG, last item has comma
```

Correct:
```json
{ "over": 5, "runs": 7, "wickets": 0, "bowler": "Siraj" },
{ "over": 6, "runs": 9, "wickets": 1, "bowler": "Bumrah" }    ← CORRECT, no comma at end
```

---

## PART 14 — DAILY WORKFLOW SUMMARY

**On match day:**
1. Before match: Update `today.json` with teams, venue, date. Clear overs to `[]`
2. After each over: Add the over data to `today.json` and commit to GitHub
3. After match: Change status to `"completed"`, add result, update description

**Day after match:**
1. Copy `today.json` → save as `data/matches/MATCHID.json`
2. Add entry to top of `data/matches-index.json`
3. Update `today.json` with tomorrow's match OR leave as completed

**Weekly:**
- Check that all past match files are in `data/matches/` folder
- Check that `matches-index.json` has all matches listed

---

## PART 15 — TEAM NAME QUICK REFERENCE (IPL 2025)

| Short Name | Full Name |
|-----------|-----------|
| RCB | Royal Challengers Bengaluru |
| MI | Mumbai Indians |
| CSK | Chennai Super Kings |
| KKR | Kolkata Knight Riders |
| SRH | Sunrisers Hyderabad |
| DC | Delhi Capitals |
| PBKS | Punjab Kings |
| RR | Rajasthan Royals |
| GT | Gujarat Titans |
| LSG | Lucknow Super Giants |

---

## PART 16 — BOWLER NAME CONSISTENCY

Always spell bowler names the same way. If you write "Siraj" in over 1 and "M Siraj" in over 4, the legend will show two separate colors for the same bowler.

**Pick one spelling and stick to it throughout the match.**

Recommended short names:
- Bumrah, Siraj, Hazlewood, Boult, Chahal, Jadeja, Ashwin
- Use last names only — cleaner on mobile screens

---

## PART 17 — WHAT HAPPENS AUTOMATICALLY

You don't need to worry about these — they happen on their own:

✅ Bar colors are automatically assigned per bowler
✅ The W (wicket) badge appears automatically on any over with `"wickets": 1` or more
✅ The Y-axis scales automatically to the highest run over
✅ The legend shows all bowlers automatically
✅ The stats at the top (total runs, wickets, avg economy, worst over) calculate automatically
✅ The "Previous Matches" section on the home page loads automatically from matches-index.json
✅ Mobile layout adjusts automatically
✅ Hover tooltips work on desktop, tap tooltips work on mobile

---

## QUICK CHEAT SHEET

```
TODAY'S MATCH    → Edit:  data/today.json
PAST MATCHES     → Files: data/matches/MATCHID.json
MATCHES LIST     → Edit:  data/matches-index.json

LIVE STATUS      → "status": "live"
DONE STATUS      → "status": "completed"

WICKET IN OVER   → "wickets": 1   (or 2, 3)
NO WICKET        → "wickets": 0

DATE FORMAT      → "2025-04-20"  (year-month-day)
MATCH ID FORMAT  → "ipl-2025-rcb-vs-mi-apr20"
```

---

*Guide written for BowlerStats v1.0 — April 2025*
*Website built for IPL bowler over-by-over analysis*
*Deploy: GitHub → Vercel | Data: JSON files*
