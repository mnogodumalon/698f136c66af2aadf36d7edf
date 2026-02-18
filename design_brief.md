# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis

### What This App Does
This is a **course management system** (Kursverwaltung) for an education or training organization. It manages the complete lifecycle: rooms where courses are held, instructors who teach them, the courses themselves, participants who attend, and registrations that link participants to courses with payment tracking.

### Who Uses This
An **administrative coordinator** at a training organization — someone who manages room bookings, assigns instructors, tracks registrations, and monitors payment status. They are not technical; they need a clear overview of their operations at a glance and the ability to quickly add new registrations.

### The ONE Thing Users Care About Most
**How many registrations are there, and are they paid?** The registration pipeline — seeing at a glance how many spots are filled across courses and which payments are outstanding — is the heartbeat of this organization.

### Primary Actions (IMPORTANT!)
1. **Neue Anmeldung erstellen** → Primary Action Button (register a participant for a course)
2. Add a new course
3. Add a new participant
4. Add a new instructor or room

---

## 2. What Makes This Design Distinctive

### Visual Identity
The dashboard uses a **warm academic tone** — a soft ivory background paired with a deep slate-blue primary accent, evoking a feeling of organized professionalism found in well-run European educational institutions. The typography uses **Plus Jakarta Sans**, a modern geometric sans-serif with distinctive rounded terminals that give it warmth without sacrificing clarity. The overall feel is "a beautifully organized desk at a great university."

### Layout Strategy
The layout is **asymmetric on desktop** — a dominant left column (roughly 2/3 width) holds the hero KPI and the main course/registration overview, while a narrower right column (1/3) provides quick access to recent activity and management panels. This creates a natural reading flow: the eye scans the big picture first (left), then drills into details (right). On mobile, this collapses to a single column with the hero KPI dominating the first viewport fold.

**Visual interest is created through:**
- The hero KPI uses a larger card with a distinctive accent-colored left border stripe (4px wide, deep blue)
- Secondary KPIs are displayed in a compact row of 3 cards, noticeably smaller than the hero
- Typography hierarchy: hero number at 48px/700 weight vs. secondary at 28px/600 weight
- A bar chart spans the full left column width, providing a visual break between stats and lists

### Unique Element
The **payment status indicator** on each registration row uses a small, filled circle (8px) that is either green (bezahlt) or a warm amber (unbezahlt), creating an instantly scannable traffic-light pattern down the list. This makes the "who hasn't paid?" question answerable in under 2 seconds.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has geometric clarity with subtly rounded forms that feel warm and approachable — fitting for an educational context. Its wide weight range (300–800) enables strong typographic hierarchy. It is NOT on the forbidden list and is distinctly different from Inter/Roboto.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 33% 97%)` | `--background` |
| Main text | `hsl(220 25% 14%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 25% 14%)` | `--card-foreground` |
| Borders | `hsl(220 15% 90%)` | `--border` |
| Primary action | `hsl(220 65% 38%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(220 65% 95%)` | `--accent` |
| Accent text | `hsl(220 65% 38%)` | `--accent-foreground` |
| Muted background | `hsl(220 15% 95%)` | `--muted` |
| Muted text | `hsl(220 10% 46%)` | `--muted-foreground` |
| Secondary background | `hsl(220 15% 95%)` | `--secondary` |
| Secondary text | `hsl(220 25% 14%)` | `--secondary-foreground` |
| Success/positive | `hsl(152 55% 42%)` | (component use) |
| Warning/pending | `hsl(38 92% 50%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The warm ivory background (`hsl(40 33% 97%)`) creates a softer, more inviting base than pure white, reducing eye strain for daily administrative use. The deep slate-blue primary (`hsl(220 65% 38%)`) conveys trust, reliability, and academic tradition — similar to university branding. The color combination feels distinctly European and professional without being cold or corporate.

### Background Treatment
The page background uses the warm ivory tone (`hsl(40 33% 97%)`). Cards sit on pure white, creating a subtle lift effect through color contrast alone (even before shadows). This layered approach — warm base with white cards — is the primary way depth is communicated.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile uses a single column with the hero KPI dominating the first fold. Visual hierarchy is created through size variation — the hero card is significantly larger than the compact secondary stat row. Below the fold, content flows in a natural priority order: chart summary, then tabbed data management sections.

### What Users See (Top to Bottom)

**Header:**
- App title "Kursverwaltung" left-aligned, 20px/700 weight
- A small "+" icon button on the right for quick registration creation

**Hero Section (The FIRST thing users see):**
- A single card spanning full width with a 4px left border in primary blue
- Inside: label "Aktive Anmeldungen" in 13px/500 muted text
- The count displayed at 48px/700 weight in foreground color
- Below the number: a small inline badge showing how many are "unbezahlt" (e.g., "4 offen") in warm amber color
- This takes approximately 25% of viewport height
- WHY hero: Registrations are the revenue pipeline — the count tells the coordinator if things are on track

**Section 2: Secondary KPIs (Compact Row)**
- Three small stat blocks in a horizontal scrollable row (not cards, just text blocks separated by subtle vertical dividers)
- Block 1: "Kurse" — count of active courses (courses where enddatum >= today)
- Block 2: "Teilnehmer" — total participant count
- Block 3: "Dozenten" — total instructor count
- Each block: number at 24px/600, label at 12px/400 muted
- Compact: approximately 60px height total

**Section 3: Registrations by Course (Bar Chart)**
- A horizontal bar chart showing registration count per course
- Title: "Anmeldungen pro Kurs"
- Bars use primary blue color, with a lighter blue for max capacity reference line
- Chart height: approximately 200px
- Simplified for mobile: show top 5 courses only, sorted by registration count

**Section 4: Tabbed Data Management**
- Tab bar with 5 tabs: Anmeldungen | Kurse | Teilnehmer | Dozenten | Raeume
- Default active: "Anmeldungen"
- Each tab shows a scrollable list of records for that app
- Each list item is a compact row with key info + edit/delete icon buttons on the right
- A "+" button at the bottom of each tab to create a new record for that app

**Bottom Navigation / Action:**
- Fixed bottom bar with a prominent "Neue Anmeldung" button spanning full width
- Button uses primary blue background, white text, 48px height for easy thumb access
- This is the primary action — always accessible

### Mobile-Specific Adaptations
- Secondary KPIs become horizontally scrollable instead of grid
- Chart shows fewer data points (top 5 instead of all)
- Tab-based navigation for data management (instead of side-by-side panels)
- List items use compact card style with swipe-to-reveal actions (but also show small icon buttons for edit/delete)

### Touch Targets
- All buttons minimum 44px height
- Edit/delete icons have 40px touch targets
- Tab items have 44px height
- Fixed bottom action button at 48px height

### Interactive Elements
- Tapping a list item in any tab opens a detail/edit dialog
- Tapping the chart bars does nothing (chart is for overview only)
- The hero card taps to switch to the Anmeldungen tab

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout with max-width of 1400px, centered:
- **Left column (65%):** Hero KPI row + chart + main data table
- **Right column (35%):** Secondary KPIs stacked vertically + quick action panels

The eye goes: (1) hero KPI top-left, (2) chart below it, (3) secondary stats on the right, (4) main data table bottom-left.

### Section Layout

**Top Row (full width):**
- Left: Hero KPI card (Aktive Anmeldungen) with accent left border — takes approximately 40% of top row
- Right of hero: Three secondary KPI cards in a horizontal row (Kurse, Teilnehmer, Dozenten) — takes remaining 60%

**Left Column (below top row):**
- Bar chart "Anmeldungen pro Kurs" — full left-column width, 300px height
- Below chart: Tabbed data management area with all 5 tabs (Anmeldungen, Kurse, Teilnehmer, Dozenten, Raeume)
- Each tab shows a proper table (not cards) on desktop with columns for key fields
- Inline edit (pencil icon) and delete (trash icon) buttons per row
- "Neu erstellen" button top-right of each table

**Right Column (below top row):**
- "Letzte Aktivitaet" panel showing the 5 most recent records created/updated across all apps (sorted by createdat descending)
- Each entry: small text showing what was created/updated, relative time (e.g., "vor 2 Stunden")
- Below: Quick stats panel showing Raumauslastung (how many rooms are assigned to active courses vs total rooms)

### What Appears on Hover
- Table rows: light background highlight (`--muted` color)
- Edit/delete icons: subtle color intensification
- KPI cards: very subtle shadow increase (shadow-sm → shadow-md transition)
- Chart bars: tooltip with exact count

### Clickable/Interactive Areas
- Table rows: clicking the row opens an edit dialog (same as clicking the edit icon)
- KPI cards: clicking switches to the relevant tab in the data management area
- Recent activity items: clicking opens the corresponding record in an edit dialog

---

## 6. Components

### Hero KPI
- **Title:** Aktive Anmeldungen
- **Data source:** Anmeldungen app — count all records where the linked Kurs has enddatum >= today (or all if no date filter possible client-side)
- **Calculation:** Count of all Anmeldungen records
- **Display:** Large number (48px/700 on desktop, same on mobile) inside a card with a 4px left border in `--primary` color
- **Context shown:** Below the number, a small Badge showing count of unbezahlt registrations (e.g., "4 offen") in amber/warning color. If all paid, show "Alle bezahlt" in green.
- **Why this is the hero:** Registrations directly represent revenue and activity. Knowing the total count and payment status at a glance is the #1 need.

### Secondary KPIs

**Aktive Kurse**
- Source: Kurse app
- Calculation: Count of courses where enddatum >= today (or all courses if date comparison is complex)
- Format: number
- Display: Card, 28px/600 number, muted label

**Teilnehmer gesamt**
- Source: Teilnehmer app
- Calculation: Total count
- Format: number
- Display: Card, 28px/600 number, muted label

**Dozenten**
- Source: Dozenten app
- Calculation: Total count
- Format: number
- Display: Card, 28px/600 number, muted label

### Chart
- **Type:** Horizontal BarChart — WHY: comparing registration counts across courses is a categorical comparison, best shown with bars. Horizontal orientation allows course names to be readable.
- **Title:** "Anmeldungen pro Kurs"
- **What question it answers:** "Which courses are popular and which have low enrollment?"
- **Data source:** Cross-reference Anmeldungen (grouped by kurs field) with Kurse (for course titles)
- **X-axis (values):** Number of registrations
- **Y-axis (categories):** Course title (from Kurse app)
- **Additional:** Show max_teilnehmer as a lighter reference bar behind the actual count to show capacity utilization
- **Mobile simplification:** Show only top 5 courses by registration count, vertical bars instead of horizontal

### Lists/Tables

**Anmeldungen Table (Default Tab)**
- Purpose: Overview of all registrations with payment status
- Source: Anmeldungen + Kurse (for course name) + Teilnehmer (for participant name)
- Fields shown: Teilnehmer Name, Kurs Titel, Anmeldedatum, Bezahlt (status indicator)
- Mobile style: compact card list with status dot
- Desktop style: table with sortable columns
- Sort: By anmeldedatum descending (newest first)
- Limit: Show all, with scroll

**Kurse Table**
- Purpose: Manage courses
- Source: Kurse + Dozenten (for instructor name) + Raeume (for room name)
- Fields shown: Titel, Startdatum, Enddatum, Max Teilnehmer, Preis, Dozent Name, Raum Name
- Desktop style: table
- Sort: By startdatum descending

**Teilnehmer Table**
- Purpose: Manage participants
- Source: Teilnehmer
- Fields shown: Vorname, Nachname, E-Mail, Telefon, Geburtsdatum
- Desktop style: table
- Sort: By nachname ascending

**Dozenten Table**
- Purpose: Manage instructors
- Source: Dozenten
- Fields shown: Vorname, Nachname, E-Mail, Telefon, Fachgebiet
- Desktop style: table
- Sort: By nachname ascending

**Raeume Table**
- Purpose: Manage rooms
- Source: Raeume
- Fields shown: Raumname, Gebaeude, Kapazitaet
- Desktop style: table
- Sort: By raumname ascending

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Anmeldung"
- **Action:** add_record
- **Target app:** Anmeldungen
- **What data:** The form contains:
  - Teilnehmer (Select dropdown populated from Teilnehmer app — shows "Vorname Nachname")
  - Kurs (Select dropdown populated from Kurse app — shows course Titel)
  - Anmeldedatum (date input, defaults to today)
  - Bezahlt (checkbox, defaults to false)
- **Mobile position:** bottom_fixed — full-width button pinned to bottom of screen
- **Desktop position:** header — prominent button in the top-right area next to the page title
- **Why this action:** Creating registrations is the most frequent administrative task. Every new student enrollment goes through this action.

### CRUD Operations Per App (REQUIRED!)

**Raeume CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button in the Raeume tab header
  - Form fields: Raumname (text input), Gebaeude (text input), Kapazitaet (number input)
  - Form style: Dialog/Modal
  - Required fields: Raumname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table rows on desktop, card list on mobile
  - Detail view: Click row → opens Edit dialog (no separate detail view needed, fields are few)
  - Fields shown in list: Raumname, Gebaeude, Kapazitaet
  - Sort: By raumname ascending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button on each row, or click the row itself
  - Edit style: Same dialog as Create, pre-filled with current values
  - Editable fields: All fields (Raumname, Gebaeude, Kapazitaet)

- **Delete (Loeschen):**
  - Trigger: Trash icon button on each row
  - Confirmation: AlertDialog with text "Moechtest du den Raum '{raumname}' wirklich loeschen?"
  - Confirmation text: "Diese Aktion kann nicht rueckgaengig gemacht werden."

**Dozenten CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button in the Dozenten tab header
  - Form fields: Vorname (text), Nachname (text), E-Mail (email input), Telefon (tel input), Fachgebiet (text)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown in list: Vorname, Nachname, E-Mail, Fachgebiet
  - Sort: By nachname ascending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon or row click
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Loeschen):**
  - Trigger: Trash icon
  - Confirmation: "Moechtest du den Dozenten '{vorname} {nachname}' wirklich loeschen?"

**Kurse CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button in the Kurse tab header
  - Form fields: Kurstitel (text), Beschreibung (textarea), Startdatum (date), Enddatum (date), Max Teilnehmer (number), Preis (number), Raum (Select from Raeume app), Dozent (Select from Dozenten app)
  - Form style: Dialog/Modal
  - Required fields: Kurstitel, Startdatum
  - Default values: Startdatum = today

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Titel, Startdatum, Enddatum, Max Teilnehmer, Preis, Dozent Name, Raum Name
  - Sort: By startdatum descending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon or row click
  - Edit style: Same dialog as Create, pre-filled (applookup selects pre-selected)
  - Editable fields: All fields

- **Delete (Loeschen):**
  - Trigger: Trash icon
  - Confirmation: "Moechtest du den Kurs '{titel}' wirklich loeschen?"

**Teilnehmer CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button in the Teilnehmer tab header
  - Form fields: Vorname (text), Nachname (text), E-Mail (email), Telefon (tel), Geburtsdatum (date)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Vorname, Nachname, E-Mail, Telefon, Geburtsdatum
  - Sort: By nachname ascending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon or row click
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Loeschen):**
  - Trigger: Trash icon
  - Confirmation: "Moechtest du den Teilnehmer '{vorname} {nachname}' wirklich loeschen?"

**Anmeldungen CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Neue Anmeldung" (header on desktop, fixed bottom on mobile), OR "+" button in Anmeldungen tab header
  - Form fields: Teilnehmer (Select from Teilnehmer app, displays "Vorname Nachname"), Kurs (Select from Kurse app, displays Titel), Anmeldedatum (date, default today), Bezahlt (checkbox, default false)
  - Form style: Dialog/Modal
  - Required fields: Teilnehmer, Kurs
  - Default values: Anmeldedatum = today, Bezahlt = false

- **Read (Anzeigen):**
  - List view: Table on desktop with payment status dot, card list on mobile
  - Fields shown: Teilnehmer Name (resolved), Kurs Titel (resolved), Anmeldedatum, Bezahlt (green/amber dot)
  - Sort: By anmeldedatum descending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon or row click
  - Edit style: Same dialog as Create, pre-filled (selects pre-selected to current values)
  - Editable fields: All fields

- **Delete (Loeschen):**
  - Trigger: Trash icon
  - Confirmation: "Moechtest du diese Anmeldung wirklich loeschen?"

---

## 7. Visual Details

### Border Radius
- Rounded: 8px (`--radius: 0.5rem`) — friendly but professional, not too sharp, not too bubbly

### Shadows
- Subtle: Cards use `shadow-sm` by default
- On hover: Cards transition to `shadow-md` (200ms ease)
- Dialogs: `shadow-lg` for modal elevation

### Spacing
- Spacious: 24px gaps between major sections, 16px between cards in a row, 12px internal card padding
- The breathing room reinforces the "organized desk" feel

### Animations
- **Page load:** Stagger fade-in — KPIs fade in first (100ms delay between each), then chart (300ms), then table (500ms). Use CSS opacity + translateY(8px) transition.
- **Hover effects:** Cards get subtle shadow increase. Table rows get muted background. Buttons get slight scale(1.02).
- **Tap feedback:** Buttons scale down briefly (scale 0.98) on press.

---

## 8. CSS Variables (Copy Exactly!)

```css
:root {
  --radius: 0.5rem;
  --background: hsl(40 33% 97%);
  --foreground: hsl(220 25% 14%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 25% 14%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 25% 14%);
  --primary: hsl(220 65% 38%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 15% 95%);
  --secondary-foreground: hsl(220 25% 14%);
  --muted: hsl(220 15% 95%);
  --muted-foreground: hsl(220 10% 46%);
  --accent: hsl(220 65% 95%);
  --accent-foreground: hsl(220 65% 38%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(220 15% 90%);
  --input: hsl(220 15% 90%);
  --ring: hsl(220 65% 38%);
  --chart-1: hsl(220 65% 38%);
  --chart-2: hsl(220 45% 65%);
  --chart-3: hsl(152 55% 42%);
  --chart-4: hsl(38 92% 50%);
  --chart-5: hsl(0 72% 51%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans, weights 300-800)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (single column, hero dominant, fixed bottom button, tabs)
- [ ] Desktop layout matches Section 5 (asymmetric two-column, hero top-left, chart + tabbed tables left, activity right)
- [ ] Hero element has 4px left border in primary color, 48px number
- [ ] Colors create the warm academic mood described in Section 2
- [ ] CRUD patterns are consistent across all 5 apps (same dialog style, same icon buttons)
- [ ] Delete confirmations are in place for every app
- [ ] Payment status dots (green/amber) are visible on Anmeldungen list
- [ ] All applookup fields use extractRecordId() with null checks
- [ ] date/date fields formatted as YYYY-MM-DD for API calls
- [ ] Toast feedback on every create/update/delete operation
