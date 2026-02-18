# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis

### What This App Does
Kursverwaltung is a course management system with five interconnected apps: Räume (rooms), Dozenten (instructors), Kurse (courses), Teilnehmer (participants), and Anmeldungen (registrations). Together, they manage the full lifecycle of educational courses — from scheduling rooms and assigning instructors to enrolling participants and tracking payments.

### Who Uses This
Course administrators at an educational institution or training center. They are non-technical users who need a quick daily overview of upcoming courses, registration status, payment tracking, and occupancy rates. They register new participants, track who has paid, and manage all five data sets from a single interface.

### The ONE Thing Users Care About Most
**Current registration status across all active courses** — how many people have signed up, how full each course is, and who still owes payment. This is what they check every morning.

### Primary Actions (IMPORTANT!)
1. **Neue Anmeldung** → Primary Action Button (register a participant for a course)
2. Kurs erstellen → from the Kurse tab
3. Teilnehmer hinzufügen → from the Teilnehmer tab
4. Dozent erfassen → from the Dozenten tab
5. Raum anlegen → from the Räume tab

---

## 2. What Makes This Design Distinctive

### Visual Identity
A warm off-white background with deep slate-teal as the primary accent creates a calm, institutional feel — like a premium university portal, not a generic SaaS template. The accent color (`hsl(186 52% 32%)`) is a refined teal-slate that suggests professionalism and trust without being corporate-boring. Typography uses **Plus Jakarta Sans** — a geometric humanist typeface that balances authority with approachability, perfect for educational administration.

### Layout Strategy
The layout is **asymmetric**: a wide hero summary strip at top (full width, 3-column stat row) anchors the eye, followed by a two-column main content area (2/3 left for the course list + registration chart, 1/3 right for the activity sidebar). This creates a natural left-to-right reading flow: overview → detail → context. On mobile, it collapses to a single vertical column with the hero stats in a horizontally-scrollable strip.

### Unique Element
The **course occupancy bars** inside each course list row: instead of plain text "3/10 Teilnehmer", each row shows a slim inline progress bar (4px high, colored teal-to-amber based on fill percentage) directly beneath the course name. This makes capacity at-a-glance scannable without needing a separate chart. Courses above 80% fill turn amber, full courses turn destructive-red.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Geometric humanist sans-serif with distinctive letterforms — feels modern and credible, used by premium education/SaaS products. NOT Inter or Roboto.

### Color Palette

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 20% 97%)` | `--background` |
| Main text | `hsl(215 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 15%)` | `--card-foreground` |
| Borders | `hsl(214 20% 88%)` | `--border` |
| Primary action | `hsl(186 52% 32%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(186 45% 92%)` | `--accent` |
| Accent text | `hsl(186 52% 20%)` | `--accent-foreground` |
| Muted background | `hsl(214 20% 94%)` | `--muted` |
| Muted text | `hsl(215 15% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(142 60% 38%)` | (component use) |
| Error/negative | `hsl(3 85% 54%)` | `--destructive` |

### Why These Colors
The cool-tinted off-white background (`hsl(210 20% 97%)`) feels paper-like and clean — not stark white, but not cream either. The teal-slate primary creates clear visual anchors for interactive elements and KPI numbers without screaming. Amber is used for "almost full" courses as a natural warning signal. The palette references the coolness of institutional design — think premium university portals.

### Background Treatment
Page background is `hsl(210 20% 97%)` — a very subtle cool gray, not pure white. Cards are pure white (`hsl(0 0% 100%)`) so they lift off the background with just a soft 1px border + subtle `box-shadow: 0 1px 3px hsl(215 25% 15% / 0.06)`. No texture, just depth through tonal contrast.

---

## 4. Mobile Layout (Phone)

Design mobile as a COMPLETELY SEPARATE experience, not squeezed desktop.

### Layout Approach
Single vertical column. Hero stats appear as a horizontal scroll strip (3 cards side by side, each ~140px wide — scroll to see all). This preserves the visual hierarchy of stats without stacking them all vertically. Below that, content appears in tabs.

### What Users See (Top to Bottom)

**Header:**
App title "Kursverwaltung" in 20px 600 weight, left-aligned. Right side: a teal "+" FAB-style button that opens the Neue Anmeldung dialog.

**Hero Section (Stats Strip — scrollable horizontally):**
Three stat cards in a `flex overflow-x-auto gap-3 px-4` container, each 140px wide and non-shrinking. Stats shown:
- Aktive Kurse (count of all Kurse records)
- Anmeldungen gesamt (total count of Anmeldungen)
- Offene Zahlungen (count of Anmeldungen where bezahlt=false)

Each stat card: white, rounded-xl, p-4, with icon at top-left (small, 18px, teal), big bold number (28px, 700), small label below (12px, muted).

**Tabs Section:**
Navigation tabs: Kurse | Anmeldungen | Teilnehmer | Dozenten | Räume
Default tab: Kurse

**Kurse Tab (default):**
Vertical list of course cards. Each card shows:
- Title (16px, 600)
- Dozent name (if loaded) — 13px, muted
- Date range formatted as "12.03. – 28.03.2026"
- Occupancy bar: thin 4px bar, teal fill that goes amber at 80%, red at 100%
- "X / Y Plätze" label right-aligned in 12px muted
- Price right-aligned badge

Each card has Edit (pencil) and Delete (trash) icon buttons in the top-right corner.

**Anmeldungen Tab:**
List of registrations. Each shows: Teilnehmer name (loaded from lookup), Kurs title, Anmeldedatum, Bezahlt badge (green "Bezahlt" or amber "Ausstehend"). Edit/Delete icons.

**Teilnehmer Tab:**
List of participants. Name, email, telefon. Edit/Delete icons.

**Dozenten Tab:**
List of instructors. Name, fachgebiet, email. Edit/Delete icons.

**Räume Tab:**
List of rooms. Raumname, Gebäude, Kapazität. Edit/Delete icons.

**Bottom Fixed Action:**
Floating "Neue Anmeldung" button fixed at bottom center of screen (bottom: 24px), with teal background, white text, rounded-full, shadow-lg. Width: auto with horizontal padding.

### Mobile-Specific Adaptations
- All lists are simple card stacks, no tables (tables don't work on mobile)
- Horizontal stat scroll strip is unique to mobile
- Tab navigation replaces the desktop sidebar column

### Touch Targets
All interactive buttons minimum 44px touch target. Edit/Delete icons are 40px square ghost buttons with icon inside.

### Interactive Elements
Tap on any list card row → opens detail/edit dialog for that record.

---

## 5. Desktop Layout

### Overall Structure
**Full page, no sidebar navigation.** Layout: fixed header at top, then a main content area below. The main content area has two columns: **left column (flex-1, ~65%)** containing the stats row + course chart + main tab content, and **right column (~35%, ~360px fixed)** containing a live activity feed showing recent Anmeldungen. The layout feels like a modern admin panel.

### Section Layout

**Header (sticky, full-width):**
- Left: "Kursverwaltung" wordmark (22px, 700) + sub-label "Kursplanung & Verwaltung" (13px, muted)
- Right: "Neue Anmeldung" primary button (teal, medium size, with PlusCircle icon)
- Height: 64px, white background, border-bottom

**Stats Row (full-width, below header, 4 stats in equal columns):**
Four stat cards in a 4-column grid:
1. **Aktive Kurse** — count of all Kurse
2. **Anmeldungen gesamt** — total Anmeldungen count
3. **Offene Zahlungen** — count where bezahlt=false, shown in amber/destructive if > 0
4. **Einnahmen gesamt** — sum of (kurs.preis × confirmed anmeldungen), formatted as EUR

Each card: white, p-5, rounded-xl, subtle shadow, icon (24px teal) top-right, big number (32px 700), label (13px muted), subtle trend indicator.

**Main Content (two-column flex, gap-6):**

*Left column (flex-1):*
- **Kurse Section** with "Alle Kurse" heading + "Neuer Kurs" button (outline, small)
- A **BarChart** (recharts): X-axis = course titles (shortened), Y-axis = Anmeldungen count per course, bar fill = teal. Height 240px. Title: "Anmeldungen pro Kurs".
- **Course list table** with columns: Kurstitel | Dozent | Zeitraum | Auslastung | Preis | Aktionen
  - Auslastung column shows inline progress bar + "X/Y" text
  - Aktionen: edit + delete icon buttons
- **Tabs below**: Anmeldungen | Teilnehmer | Dozenten | Räume
  - Each tab shows a full-featured table (described in CRUD section)

*Right column (360px, flex-shrink-0):*
- **"Letzte Anmeldungen"** card: scrollable list of 10 most recent Anmeldungen, sorted by anmeldedatum desc. Each item shows: circle avatar with initials, Teilnehmer name, Kurs title, date formatted as "dd.MM.yyyy", Bezahlt badge.
- **"Räume Übersicht"** card below: compact list of all rooms with name, building, capacity pill.

### What Appears on Hover
- Table rows: light `bg-muted/40` background
- Course list cards: subtle shadow increase `hover:shadow-md transition-shadow`
- Edit/Delete icon buttons: appear at full opacity (default 60% opacity, hover 100%)
- Stats cards: very subtle scale `hover:scale-[1.01]` with transition

### Clickable/Interactive Areas
- Clicking a course row in the table opens the edit dialog pre-filled
- Clicking a Teilnehmer name in Anmeldungen list opens the Teilnehmer detail
- All list items have inline edit/delete icons visible on hover (desktop) or always visible (mobile)

---

## 6. Components

### Hero KPI: Aktive Kurse
- **Title:** Aktive Kurse
- **Data source:** Kurse app (count all records)
- **Calculation:** `kurse.length`
- **Display:** Large number 32px bold, teal icon (BookOpen) top-right, white card, subtle border
- **Context shown:** No comparison needed — just the total count
- **Why this is the hero:** On desktop appears first in stats row; on mobile it's the first stat card in the scroll strip

### Secondary KPIs

**Anmeldungen gesamt**
- Source: Anmeldungen
- Calculation: count of all records
- Format: number
- Display: stat card

**Offene Zahlungen**
- Source: Anmeldungen
- Calculation: count where bezahlt === false
- Format: number, amber color if > 0
- Display: stat card with warning color treatment when non-zero

**Einnahmen gesamt**
- Source: Kurse + Anmeldungen
- Calculation: for each Anmeldung, find the linked Kurs's preis and sum. Only count paid anmeldungen (bezahlt=true) for "confirmed revenue".
- Format: EUR currency
- Display: stat card with Euro icon

### Chart
- **Type:** BarChart — because users want to compare enrollment counts across courses (comparison = bars, not trends)
- **Title:** Anmeldungen pro Kurs
- **What question it answers:** Which courses are popular? Which need more promotion?
- **Data source:** Anmeldungen (group by kurs) joined with Kurse (for titles)
- **X-axis:** Kurstitel (truncated to 12 chars if needed)
- **Y-axis:** Anzahl Anmeldungen
- **Mobile simplification:** Hidden on mobile (replaced by stat cards) — show chart only on desktop (hidden md:block)

### Lists/Tables

**Kurse List**
- Purpose: Core admin view for managing courses
- Source: Kurse + enriched with Dozenten name and Anmeldungen count
- Fields shown in table: Titel, Dozent Name, Startdatum–Enddatum, Auslastung bar, Preis, Edit/Delete
- Mobile style: vertical cards with occupancy bar
- Desktop style: full table
- Sort: by startdatum ascending (upcoming first)
- Limit: all records

**Anmeldungen List**
- Purpose: Track who is enrolled and who has paid
- Source: Anmeldungen + enriched with Teilnehmer name and Kurs title
- Fields shown: Teilnehmer Name, Kurs Titel, Anmeldedatum, Bezahlt (badge)
- Mobile style: cards
- Desktop style: table
- Sort: by anmeldedatum descending (newest first)
- Limit: all records

**Teilnehmer List**
- Purpose: Participant database
- Source: Teilnehmer
- Fields shown: Vorname Nachname, E-Mail, Telefon, Geburtsdatum
- Desktop: table; Mobile: cards
- Sort: by lastname alphabetically

**Dozenten List**
- Purpose: Instructor database
- Source: Dozenten
- Fields shown: Vorname Nachname, Fachgebiet, E-Mail, Telefon
- Desktop: table; Mobile: cards
- Sort: by lastname alphabetically

**Räume List**
- Purpose: Room management
- Source: Raeume
- Fields shown: Raumname, Gebäude, Kapazität
- Desktop: table; Mobile: cards
- Sort: by raumname alphabetically

### Primary Action Button (REQUIRED!)
- **Label:** Neue Anmeldung
- **Action:** add_record
- **Target app:** Anmeldungen
- **What data:** Select Teilnehmer (applookup), Select Kurs (applookup), Anmeldedatum (date, default today), Bezahlt (checkbox/switch, default false)
- **Mobile position:** bottom_fixed (pill button, centered)
- **Desktop position:** header (top right)
- **Why this action:** Registering participants is the most frequent daily action for a course admin

### CRUD Operations Per App (REQUIRED!)

**Räume CRUD Operations**

- **Create:**
  - Trigger: "Neuer Raum" button (outline, small) in Räume tab header
  - Form fields: Raumname (text, required), Gebäude (text), Kapazität (number)
  - Form style: Dialog/Modal
  - Required fields: Raumname
  - Default values: none

- **Read:**
  - List view: Table on desktop / cards on mobile
  - Detail view: Click edit icon → same dialog pre-filled
  - Fields shown in list: Raumname, Gebäude, Kapazität
  - Fields shown in detail: all fields
  - Sort: by raumname alphabetically
  - Filter/Search: none

- **Update:**
  - Trigger: pencil icon button on each row
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: all

- **Delete:**
  - Trigger: trash icon button on each row
  - Confirmation: AlertDialog
  - Confirmation text: `Möchtest du den Raum "${raumname}" wirklich löschen?`

---

**Dozenten CRUD Operations**

- **Create:**
  - Trigger: "Neuer Dozent" button in Dozenten tab header
  - Form fields: Vorname (text, required), Nachname (text, required), E-Mail (email), Telefon (tel), Fachgebiet (text)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: none

- **Read:**
  - List view: Table on desktop / cards on mobile
  - Fields shown: Vorname Nachname, Fachgebiet, E-Mail, Telefon
  - Sort: by Nachname alphabetically

- **Update:**
  - Trigger: pencil icon button on each row
  - Edit style: Same dialog as Create, pre-filled

- **Delete:**
  - Trigger: trash icon button on each row
  - Confirmation: AlertDialog
  - Confirmation text: `Möchtest du den Dozenten "${vorname} ${nachname}" wirklich löschen?`

---

**Kurse CRUD Operations**

- **Create:**
  - Trigger: "Neuer Kurs" button in Kurse section header (outline, small)
  - Form fields: Titel (text, required), Beschreibung (textarea), Startdatum (date), Enddatum (date), Max. Teilnehmer (number), Preis (number, EUR), Raum (select from Räume — applookup), Dozent (select from Dozenten — applookup)
  - Form style: Dialog/Modal (max-w-lg)
  - Required fields: Titel
  - Default values: none

- **Read:**
  - List view: Table on desktop with columns; cards on mobile
  - Detail: click row or edit icon → detail/edit dialog
  - Fields shown: Titel, Dozent name (resolved), Zeitraum, Auslastung bar, Preis
  - Sort: by startdatum ascending

- **Update:**
  - Trigger: pencil icon on table row
  - Edit style: Same dialog as Create, pre-filled with current values (applookup selects pre-selected)

- **Delete:**
  - Trigger: trash icon on table row
  - Confirmation: AlertDialog
  - Confirmation text: `Möchtest du den Kurs "${titel}" wirklich löschen?`

---

**Teilnehmer CRUD Operations**

- **Create:**
  - Trigger: "Neuer Teilnehmer" button in Teilnehmer tab header
  - Form fields: Vorname (text, required), Nachname (text, required), E-Mail (email), Telefon (tel), Geburtsdatum (date)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: none

- **Read:**
  - List view: Table (desktop) / cards (mobile)
  - Fields shown: Vorname Nachname, E-Mail, Telefon, Geburtsdatum formatted dd.MM.yyyy
  - Sort: by Nachname alphabetically

- **Update:**
  - Trigger: pencil icon
  - Edit style: Same dialog, pre-filled

- **Delete:**
  - Trigger: trash icon
  - Confirmation: AlertDialog
  - Confirmation text: `Möchtest du den Teilnehmer "${vorname} ${nachname}" wirklich löschen?`

---

**Anmeldungen CRUD Operations**

- **Create:**
  - Trigger: Primary "Neue Anmeldung" button (header + mobile FAB)
  - Form fields: Teilnehmer (select from Teilnehmer list — applookup, required), Kurs (select from Kurse list — applookup, required), Anmeldedatum (date, default today), Bezahlt (Switch, default off)
  - Form style: Dialog/Modal
  - Required fields: Teilnehmer, Kurs
  - Default values: Anmeldedatum = today, Bezahlt = false

- **Read:**
  - List view: Table on desktop / cards on mobile
  - Fields shown: Teilnehmer name (resolved), Kurs title (resolved), Anmeldedatum, Bezahlt badge
  - Sort: by anmeldedatum descending

- **Update:**
  - Trigger: pencil icon
  - Edit style: Same dialog, pre-filled. Particularly useful for marking as bezahlt=true.

- **Delete:**
  - Trigger: trash icon
  - Confirmation: AlertDialog
  - Confirmation text: `Möchtest du diese Anmeldung von "${teilnehmerName}" für "${kursTitle}" wirklich löschen?`

---

## 7. Visual Details

### Border Radius
rounded (8–12px) — `--radius: 0.75rem`. Cards use `rounded-xl` (12px). Buttons use `rounded-lg` (8px). The FAB button uses `rounded-full`.

### Shadows
Subtle — cards get `shadow-sm` (0 1px 3px rgba with low opacity). On hover: `shadow-md`. Header gets `shadow-sm` as well to separate from content.

### Spacing
Normal-to-spacious — `p-5` for stat cards, `gap-6` between sections. Tables have `py-3` row padding. Lists have `gap-3` between items.

### Animations
- **Page load:** Stagger fade-in (each section fades in with 100ms delay offset) using `animate-in fade-in-0 slide-in-from-bottom-2 duration-300`
- **Hover effects:** `transition-all duration-200` on cards (shadow), buttons (scale), table rows (background)
- **Tap feedback:** `active:scale-95` on buttons

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css` in the `:root` section:

```css
:root {
  --radius: 0.75rem;
  --background: hsl(210 20% 97%);
  --foreground: hsl(215 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 15%);
  --primary: hsl(186 52% 32%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 20% 94%);
  --secondary-foreground: hsl(215 25% 15%);
  --muted: hsl(214 20% 94%);
  --muted-foreground: hsl(215 15% 50%);
  --accent: hsl(186 45% 92%);
  --accent-foreground: hsl(186 52% 20%);
  --destructive: hsl(3 85% 54%);
  --border: hsl(214 20% 88%);
  --input: hsl(214 20% 88%);
  --ring: hsl(186 52% 32%);
  --chart-1: hsl(186 52% 32%);
  --chart-2: hsl(142 60% 38%);
  --chart-3: hsl(38 92% 50%);
  --chart-4: hsl(215 25% 45%);
  --chart-5: hsl(3 85% 54%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font (Plus Jakarta Sans) loaded from URL above in index.html
- [ ] `lang="de"` on html element, NO dark class
- [ ] All CSS variables copied exactly from Section 8 above
- [ ] Mobile layout matches Section 4 (horizontal scroll stats strip, tabs, FAB)
- [ ] Desktop layout matches Section 5 (header, 4-stat row, 2-column main, sidebar)
- [ ] Hero stats are prominent (large numbers, clear icons)
- [ ] Occupancy progress bar in course rows (colored teal/amber/red by fill %)
- [ ] BarChart of Anmeldungen per Kurs (recharts, desktop only)
- [ ] Neue Anmeldung dialog with Teilnehmer + Kurs selects (applookup)
- [ ] Full CRUD for ALL 5 apps (Create + Edit dialog + Delete confirmation)
- [ ] Toast notifications for all CRUD operations (using sonner toast)
- [ ] Loading skeletons during data fetch
- [ ] Empty states with action buttons
- [ ] Error states with retry
- [ ] applookup fields use extractRecordId() and createRecordUrl()
- [ ] Date fields use YYYY-MM-DD format (no seconds)
- [ ] Select components never use value=""
