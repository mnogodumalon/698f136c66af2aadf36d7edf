# Design Brief: Kursverwaltung

## 1. App Analysis

### What This App Does
Kursverwaltung (Course Management) is a system for managing educational courses, instructors, rooms, participants, and course registrations. It tracks which courses are offered, who teaches them, where they take place, who signs up, and whether they've paid.

### Who Uses This
An education coordinator or course administrator — someone who manages a training center, continuing education program, or community education (Volkshochschule). They need to see at a glance how their course program is performing and quickly manage all the moving parts.

### The ONE Thing Users Care About Most
**How are my courses doing?** — specifically: How many registrations do I have, which courses are filling up, and where is revenue coming from? The registration pipeline is the heartbeat of this business.

### Primary Actions (IMPORTANT!)
1. **Neue Anmeldung** (New Registration) → Primary Action Button — this is what users do most: register a participant for a course
2. Neuen Kurs anlegen (Create new course)
3. Neuen Teilnehmer anlegen (Add new participant)

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design evokes an academic, knowledge-focused environment with a warm, sophisticated palette. A deep teal accent against a soft warm-white background creates a sense of institutional trust and calm professionalism — like stepping into a well-designed university building. The teal isn't the generic Bootstrap teal; it's a slightly desaturated, refined shade that feels mature and considered.

### Layout Strategy
The layout is **asymmetric on desktop** — a wide main content area (roughly 2/3) holds the hero KPI and course overview, while a narrower right column (1/3) shows recent activity and quick stats. This creates a natural reading flow: the eye goes to the big number first (total registrations), then scans the supporting KPIs, then drifts right to the activity feed. On mobile, everything stacks vertically with the hero KPI dominating the first viewport fold.

### Unique Element
The hero KPI uses a **large registration count with a circular progress ring** showing how full courses are on average (percentage of max_teilnehmer used across all courses). The ring uses a thick 6px stroke with the teal accent, creating a focal point that immediately communicates course utilization at a glance.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a geometric, slightly rounded character that feels modern and approachable — fitting for an educational context. It has excellent weight range for creating strong typographic hierarchy, and it's distinctive without being distracting.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 25% 97%)` | `--background` |
| Main text | `hsl(210 20% 16%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(210 20% 16%)` | `--card-foreground` |
| Borders | `hsl(40 15% 90%)` | `--border` |
| Primary action | `hsl(178 45% 30%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(178 45% 30%)` | `--accent` |
| Muted background | `hsl(40 15% 94%)` | `--muted` |
| Muted text | `hsl(210 10% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(152 50% 38%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The warm off-white background (slight cream undertone) feels inviting and reduces screen fatigue during long admin sessions. The deep teal primary (`hsl(178 45% 30%)`) is sophisticated and uncommon — it signals calm authority without being cold like blue or aggressive like red. The success green and destructive red provide clear semantic meaning for payment status and delete actions.

### Background Treatment
The page background uses a subtle warm off-white (`hsl(40 25% 97%)`) that creates gentle contrast against pure white cards. This is not a gradient — it's a solid warm tone that gives depth to the card-based layout without adding visual noise.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The hero KPI dominates the top fold, using about 40% of the initial viewport. Below it, secondary KPIs appear as a compact horizontal scroll strip (not cards — inline badges with numbers). The course list and registrations follow in a scrollable feed. Visual interest comes from the size difference between the hero and secondary KPIs, and from the alternating section styles.

### What Users See (Top to Bottom)

**Header:**
- App title "Kursverwaltung" in 20px/700 weight, left-aligned
- No subtitle on mobile to save space

**Hero Section (The FIRST thing users see):**
- Large circular progress ring (160px diameter, 6px stroke) showing average course utilization percentage
- Inside the ring: the total number of registrations in 40px/800 weight
- Below the ring: label "Anmeldungen" in 13px/500 muted text
- Below that: a row showing "X bezahlt" (paid count) as a small green badge and "X offen" (unpaid) as a small amber badge
- The hero takes approximately 40% of the viewport height on mobile
- Why hero: registrations are the core metric — they represent demand, revenue, and course viability

**Section 2: Quick Stats Strip**
- Horizontal scrollable row of compact stat pills (not cards):
  - "X Kurse" (total courses)
  - "X Dozenten" (total instructors)
  - "X Räume" (total rooms)
  - "X Teilnehmer" (total participants)
  - "X,XXX € Umsatz" (total revenue from paid registrations)
- Each pill: muted background, 13px text, icon + number + label
- This contrasts with the hero by being small and dense

**Section 3: Kurse (Courses)**
- Section header "Kurse" with a "+" button to create a new course
- Course cards in a vertical list, each showing:
  - Kurstitel (bold, 15px/600)
  - Dozent name (muted, 13px)
  - Date range: "DD.MM. – DD.MM.YYYY"
  - Registration fill bar: a thin progress bar showing registrations/max_teilnehmer
  - "X/Y Plätze" text next to the bar
- Tapping a course card opens a detail sheet

**Section 4: Letzte Anmeldungen (Recent Registrations)**
- Section header "Letzte Anmeldungen" with "Alle" link
- Simple list of the 5 most recent registrations:
  - Teilnehmer name (bold)
  - Kurs title (muted)
  - Bezahlt status as colored dot (green = paid, amber = unpaid)
  - Anmeldedatum formatted as relative time ("vor 2 Tagen")
- Tapping opens edit view

**Bottom Navigation / Action:**
- Fixed bottom button bar with the primary action: "Neue Anmeldung" button spanning full width, in primary color, with a Plus icon

### Mobile-Specific Adaptations
- Stats strip is horizontally scrollable instead of wrapping
- Course cards stack vertically, full width
- The data management tabs (Dozenten, Räume, Teilnehmer) are accessible via a tab bar below the main content, not shown immediately — keep the focus on courses and registrations
- Each management section (Dozenten, Räume, Teilnehmer, Anmeldungen, Kurse) is accessible via bottom tabs

### Touch Targets
- All buttons minimum 44px tall
- Course cards have generous 16px padding for easy tapping
- The primary action button is 52px tall on mobile

### Interactive Elements
- Course cards → tap to open detail dialog with full info + edit/delete
- Registration items → tap to open edit dialog
- Stats pills → no drill-down (self-explanatory numbers)

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout with a max-width container (1280px), centered:
- **Left column (65%):** Hero section + Course overview chart + Course list with CRUD
- **Right column (35%):** Quick stats cards (vertical stack) + Recent registrations feed + Quick links to manage Dozenten/Räume/Teilnehmer

Eye flow: Hero (top-left, largest element) → Stats (top-right) → Course chart (mid-left) → Recent registrations (mid-right) → Course table (bottom-left) → Management sections (bottom-right)

### Section Layout

**Top area:**
- Left: Hero KPI card — registration count with progress ring, payment breakdown badges. This card is taller than the stats cards on the right, creating asymmetry.
- Right: Vertical stack of 4 compact stat cards (Kurse, Dozenten, Räume, Teilnehmer count) — each is small (about 80px tall), creating a tight column next to the bigger hero.

**Middle area:**
- Left: Bar chart showing registrations per course (horizontal bars, sorted by count descending). Title: "Anmeldungen pro Kurs". This answers "Which courses are most popular?"
- Right: "Letzte Anmeldungen" feed — a scrollable list of recent registrations with participant name, course, payment status, and date.

**Bottom area:**
- Full-width tabs for managing each app: Kurse | Dozenten | Räume | Teilnehmer | Anmeldungen
- Each tab shows a table with all records, plus Create/Edit/Delete actions
- The "Kurse" tab is selected by default

### What Appears on Hover
- Course rows: subtle background highlight + edit/delete icons fade in on the right
- Registration items: background highlight, pointer cursor
- Stat cards: subtle shadow lift

### Clickable/Interactive Areas
- Course rows → click to open detail/edit dialog
- Registration items → click to open edit dialog
- "Neue Anmeldung" button in header area (desktop: top-right of the page header)
- Tab headers to switch between data management views

---

## 6. Components

### Hero KPI
- **Title:** Anmeldungen
- **Data source:** Anmeldungen app (count all records)
- **Calculation:** Count of all Anmeldungen records; secondary: count where bezahlt=true, count where bezahlt=false/null
- **Display:** Large number (40px/800 on mobile, 56px/800 on desktop) centered inside a circular SVG progress ring. The ring shows average course utilization (sum of registrations per course / sum of max_teilnehmer per course).
- **Context shown:** Below the number: two small badges — green "X bezahlt" and amber "X offen"
- **Why this is the hero:** Registrations = revenue = business health. This single number tells the user immediately whether things are going well.

### Secondary KPIs

**Aktive Kurse**
- Source: Kurse app
- Calculation: Count of all Kurse records (optionally filter where enddatum >= today)
- Format: number
- Display: Compact card (desktop) / pill (mobile), with BookOpen icon

**Dozenten**
- Source: Dozenten app
- Calculation: Count of all records
- Format: number
- Display: Compact card/pill, with GraduationCap icon

**Räume**
- Source: Raeume app
- Calculation: Count of all records
- Format: number
- Display: Compact card/pill, with DoorOpen icon

**Teilnehmer**
- Source: Teilnehmer app
- Calculation: Count of all records
- Format: number
- Display: Compact card/pill, with Users icon

**Gesamtumsatz (Total Revenue)**
- Source: Anmeldungen (where bezahlt=true) joined with Kurse (preis field)
- Calculation: Sum of preis for all paid registrations
- Format: currency EUR
- Display: Compact card/pill, with Euro icon

### Chart
- **Type:** Horizontal BarChart — because we're comparing course names (categorical), and horizontal bars make long course titles readable
- **Title:** Anmeldungen pro Kurs
- **What question it answers:** Which courses are most popular / filling up fastest?
- **Data source:** Anmeldungen joined with Kurse
- **X-axis:** Number of registrations (count)
- **Y-axis:** Course title (Kurse.titel)
- **Mobile simplification:** Show only top 5 courses, smaller font, hide Y-axis label

### Lists/Tables

**Letzte Anmeldungen (Recent Registrations)**
- Purpose: Quick view of recent activity — who signed up for what
- Source: Anmeldungen, joined with Teilnehmer (name) and Kurse (title)
- Fields shown: Teilnehmer name, Kurs title, bezahlt status (dot), anmeldedatum
- Mobile style: Simple list items with dot indicator
- Desktop style: Compact list items in the right column
- Sort: By anmeldedatum descending (newest first)
- Limit: 5 most recent

**Full Data Tables (in tabs)**
Each tab shows a full table for its respective app with all fields, plus CRUD actions.

### Primary Action Button (REQUIRED!)
- **Label:** "Neue Anmeldung"
- **Action:** add_record
- **Target app:** Anmeldungen
- **What data:** The form contains:
  - Teilnehmer (select from Teilnehmer app — shows "Vorname Nachname")
  - Kurs (select from Kurse app — shows "Kurstitel")
  - Anmeldedatum (date input, default: today)
  - Bezahlt (checkbox, default: false)
- **Mobile position:** bottom_fixed — full-width button at the bottom of the screen
- **Desktop position:** header — top-right of the page header, prominent teal button
- **Why this action:** Registering participants for courses is the most frequent daily action in course management. Every other data entry (courses, rooms, instructors) changes less frequently.

### CRUD Operations Per App (REQUIRED!)

**Räume CRUD Operations**

- **Create:** "+" button in the Räume tab header opens a Dialog with fields: Raumname (text input), Gebäude (text input), Kapazität (number input)
- **Read:** Table with columns: Raumname, Gebäude, Kapazität. Click row → Detail Dialog showing all fields.
- **Update:** Edit icon (pencil) appears on row hover → Same dialog as Create, pre-filled with current values
- **Delete:** Trash icon appears on row hover → Confirmation dialog "Möchtest du den Raum '{raumname}' wirklich löschen?"

**Dozenten CRUD Operations**

- **Create:** "+" button in the Dozenten tab header opens a Dialog with fields: Vorname (text), Nachname (text), E-Mail (email input), Telefon (tel input), Fachgebiet (text)
- **Read:** Table with columns: Vorname, Nachname, E-Mail, Fachgebiet. Click row → Detail Dialog showing all fields including Telefon.
- **Update:** Edit icon on row hover → Same dialog as Create, pre-filled
- **Delete:** Trash icon on row hover → Confirmation dialog "Möchtest du den Dozenten '{vorname} {nachname}' wirklich löschen?"

**Kurse CRUD Operations**

- **Create:** "+" button in the Kurse tab header opens a Dialog with fields: Kurstitel (text), Beschreibung (textarea), Startdatum (date), Enddatum (date), Max. Teilnehmer (number), Preis in EUR (number), Raum (select from Räume app — shows Raumname), Dozent (select from Dozenten app — shows "Vorname Nachname")
- **Read:** Table with columns: Kurstitel, Dozent, Startdatum, Enddatum, Plätze (registrations/max), Preis. Click row → Detail Dialog showing all fields + registration list for that course.
- **Update:** Edit icon on row hover → Same dialog as Create, pre-filled
- **Delete:** Trash icon on row hover → Confirmation dialog "Möchtest du den Kurs '{titel}' wirklich löschen?"

**Teilnehmer CRUD Operations**

- **Create:** "+" button in the Teilnehmer tab header opens a Dialog with fields: Vorname (text), Nachname (text), E-Mail (email), Telefon (tel), Geburtsdatum (date)
- **Read:** Table with columns: Vorname, Nachname, E-Mail, Geburtsdatum. Click row → Detail Dialog showing all fields including Telefon.
- **Update:** Edit icon on row hover → Same dialog as Create, pre-filled
- **Delete:** Trash icon on row hover → Confirmation dialog "Möchtest du den Teilnehmer '{vorname} {nachname}' wirklich löschen?"

**Anmeldungen CRUD Operations**

- **Create:** Primary action button "Neue Anmeldung" opens the Dialog (same as Primary Action Button above)
- **Read:** Table with columns: Teilnehmer (name), Kurs (title), Anmeldedatum, Bezahlt (badge). Click row → Detail Dialog.
- **Update:** Edit icon on row hover → Same dialog as Create, pre-filled with current values. Teilnehmer and Kurs shown as selects with current value selected.
- **Delete:** Trash icon on row hover → Confirmation dialog "Möchtest du die Anmeldung von '{teilnehmer_name}' für '{kurs_titel}' wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) — `--radius: 0.5rem`. Soft enough to feel friendly, sharp enough to feel professional.

### Shadows
Subtle — cards use `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)). On hover: `shadow-md` transition. No heavy drop shadows — keep it light and airy.

### Spacing
Normal to spacious — 24px gap between major sections, 16px padding inside cards, 12px gap between list items. Generous whitespace around the hero to give it breathing room.

### Animations
- **Page load:** Subtle fade-in (opacity 0→1, 300ms ease-out) on the main container
- **Hover effects:** Cards lift with shadow-md transition (200ms). Table rows get a muted background. Buttons darken slightly.
- **Tap feedback:** Buttons scale down slightly (transform: scale(0.98)) on active state

---

## 8. CSS Variables (Copy Exactly!)

```css
:root {
  --radius: 0.5rem;
  --background: hsl(40 25% 97%);
  --foreground: hsl(210 20% 16%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(210 20% 16%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(210 20% 16%);
  --primary: hsl(178 45% 30%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 94%);
  --secondary-foreground: hsl(210 20% 16%);
  --muted: hsl(40 15% 94%);
  --muted-foreground: hsl(210 10% 50%);
  --accent: hsl(178 45% 30%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(40 15% 90%);
  --input: hsl(40 15% 90%);
  --ring: hsl(178 45% 30%);
  --chart-1: hsl(178 45% 30%);
  --chart-2: hsl(152 50% 38%);
  --chart-3: hsl(40 70% 55%);
  --chart-4: hsl(210 40% 50%);
  --chart-5: hsl(280 40% 55%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font "Plus Jakarta Sans" loaded from URL above
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4
- [ ] Desktop layout matches Section 5
- [ ] Hero element (registration count + progress ring) is prominent as described
- [ ] Colors create the warm, professional mood described in Section 2
- [ ] CRUD patterns are consistent across all 5 apps
- [ ] Delete confirmations are in place for every app
- [ ] Primary action "Neue Anmeldung" works on both mobile and desktop
- [ ] Horizontal bar chart shows registrations per course
- [ ] Tab-based data management for all 5 apps on desktop
- [ ] Recent registrations feed shows joined data (participant name + course title)
- [ ] Payment status shown as colored indicators throughout
