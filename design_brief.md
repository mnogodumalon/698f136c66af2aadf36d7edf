# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis

### What This App Does
This is a **course management system** (Kursverwaltung) for an educational institution or training provider. It manages the full lifecycle of courses: rooms where courses take place, instructors who teach them, courses with dates and pricing, participants who attend, and registrations that link participants to courses with payment tracking.

### Who Uses This
A course administrator or training coordinator. They need to see at a glance how their courses are performing, which courses are coming up, who has registered, and whether payments are complete. They think in terms of "upcoming courses", "open registrations", and "revenue".

### The ONE Thing Users Care About Most
**How are my current courses doing?** - Specifically: How many registrations do upcoming courses have, and how much revenue is expected? The hero metric is total registrations vs. capacity, because this tells them whether they need to market harder or if things are on track.

### Primary Actions (IMPORTANT!)
1. **Neue Anmeldung erstellen** (Create new registration) - This is the #1 action. When someone calls or emails to register, the admin needs to quickly add them to a course.
2. **Neuen Kurs anlegen** (Create new course) - Setting up the next course offering.
3. **Neuen Teilnehmer anlegen** (Add new participant) - Registering a new person in the system.

---

## 2. What Makes This Design Distinctive

### Visual Identity
The dashboard uses a **scholarly, institutional aesthetic** with a deep navy-indigo accent on a warm ivory background. The feel is "modern university administration" - serious and trustworthy but not cold. The warm background prevents it from feeling sterile, while the indigo accent conveys academic authority. Subtle amber highlights mark revenue and payment-related elements, creating a natural color coding: blue = courses/people, amber = money.

### Layout Strategy
The layout uses an **asymmetric two-tier approach on desktop**: a full-width hero banner at the top showing the key registration and revenue metrics in a horizontal strip with generous whitespace, followed by a main content area split into a wide left column (65%) for courses and a narrower right column (35%) for recent activity and quick stats. The hero banner is visually separated with a subtle bottom border and uses large typography for numbers, creating a "command center" feel. Below, the asymmetric split prevents the grid-of-identical-cards look.

### Unique Element
The **course capacity bars** next to each course title: thin horizontal progress bars showing filled seats vs. max capacity, color-coded from indigo (plenty of room) to amber (filling up) to a warm red (nearly full/overbooked). These inline micro-visualizations give instant readability without needing to click into anything - the admin can scan 10 courses in seconds and know exactly which need attention.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a professional, geometric clarity that suits institutional administration. Its slightly rounded terminals add warmth without sacrificing readability. It has excellent weight range for creating strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(42 33% 97%)` | `--background` |
| Main text | `hsl(230 25% 18%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(230 25% 18%)` | `--card-foreground` |
| Borders | `hsl(230 15% 90%)` | `--border` |
| Primary action (indigo) | `hsl(234 56% 46%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight (amber) | `hsl(38 92% 50%)` | `--accent` |
| Accent foreground | `hsl(230 25% 18%)` | `--accent-foreground` |
| Muted background | `hsl(230 15% 95%)` | `--muted` |
| Muted text | `hsl(230 10% 52%)` | `--muted-foreground` |
| Success/positive | `hsl(158 64% 40%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |
| Secondary background | `hsl(230 15% 95%)` | `--secondary` |
| Secondary foreground | `hsl(230 25% 18%)` | `--secondary-foreground` |

### Why These Colors
The warm ivory background (`hsl(42 33% 97%)`) creates a paper-like warmth that prevents the sterile feel of pure white. The deep indigo primary (`hsl(234 56% 46%)`) is authoritative and academic, distinct from generic "tech blue". The amber accent (`hsl(38 92% 50%)`) naturally maps to financial/revenue elements, creating an intuitive color language without needing labels.

### Background Treatment
The background is a warm off-white with a very slight yellow undertone, creating a "paper" feel. Cards are pure white, which makes them lift slightly off the warm background. No gradients or patterns - the contrast between warm background and crisp white cards provides enough visual texture.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile uses a single-column vertical flow with the hero numbers stacked prominently at the top. The capacity bars remain the key visual element even on mobile, ensuring scannability. Tab navigation at the top allows switching between "Kurse", "Teilnehmer", "Dozenten", "Raeume", and "Anmeldungen" views rather than scrolling endlessly.

### What Users See (Top to Bottom)

**Header:**
- App title "Kursverwaltung" (left-aligned, 20px, weight 700)
- Primary action button "Neue Anmeldung" with plus icon (right-aligned, compact pill shape)

**Hero Section (The FIRST thing users see):**
- A horizontal scrollable row of 3 compact stat cards:
  1. **Aktive Kurse** - count of courses where enddate >= today. Large number (32px, weight 800), label below (12px, muted).
  2. **Anmeldungen** - total registration count. Large number, with a small badge showing "X bezahlt" (paid count) in amber.
  3. **Erwarteter Umsatz** - sum of (price * registrations) for active courses. Formatted as EUR currency. Large number in amber color.
- Each stat card takes ~33% of viewport width, slight horizontal scroll if needed.
- The hero section has a subtle bottom border to separate from content below.

**Section 2: Tab Navigation**
- Horizontal tab bar with 5 tabs: Kurse, Teilnehmer, Dozenten, Raeume, Anmeldungen
- Scrollable horizontally, active tab has indigo underline
- Each tab shows the respective list view with full CRUD

**Section 3: Course List (Default Tab - "Kurse")**
- Each course is a card showing:
  - Course title (16px, weight 600)
  - Dozent name + Room name on one line (13px, muted)
  - Date range "DD.MM.YYYY - DD.MM.YYYY" (13px, muted)
  - Capacity bar: thin (4px) horizontal bar showing registrations/max_teilnehmer
  - "X/Y Plätze" text right-aligned next to bar (12px)
  - Price in EUR (14px, weight 600, amber color)
- Edit (pencil) and Delete (trash) icons in top-right of each card
- Sort: by startdatum ascending (upcoming first)

**Section 4: Other Tab Views**
- Teilnehmer: list of participant cards with name, email, phone, birthdate
- Dozenten: list of instructor cards with name, email, phone, subject area
- Raeume: list of room cards with name, building, capacity
- Anmeldungen: list of registration cards with participant name, course title, date, payment status badge

**Bottom Navigation / Action:**
- Floating action button (FAB) in bottom-right corner, indigo, "+" icon
- Tapping opens the create dialog for the currently active tab's entity

### Mobile-Specific Adaptations
- Hero stats become horizontally scrollable compact cards instead of a wide strip
- Tab navigation replaces side-by-side columns
- Cards stack vertically, full-width
- Capacity bars remain visible (key feature)
- FAB replaces header-based create actions for better thumb reach

### Touch Targets
- All buttons minimum 44px height
- Card tap area is the full card (opens detail/edit dialog)
- Edit/delete icons have 40px touch targets with adequate spacing
- FAB is 56px diameter

### Interactive Elements
- Tapping a course card opens a detail dialog showing all fields + list of registrations for that course
- Tapping a registration card shows participant + course details with payment toggle

---

## 5. Desktop Layout

### Overall Structure
- **Max width:** 1280px, centered
- **Padding:** 32px horizontal
- **Top:** Full-width header bar with title + primary action button
- **Below header:** Hero stats strip (full width, 3 stats in a row with generous spacing)
- **Main content:** Two columns - 65% left / 35% right
  - Left: Course list with capacity bars (the main work area)
  - Right: Side panel with recent registrations + quick stats (Dozenten count, Teilnehmer count, Raeume count)
- **Below main content:** Full-width tabbed section for managing Teilnehmer, Dozenten, Raeume, Anmeldungen

Eye flow: Header title → hero numbers → course list (left) → recent activity (right) → management tabs (bottom).

### Section Layout

**Header Bar:**
- Left: "Kursverwaltung" title (28px, weight 800, tracking tight)
- Right: "Neue Anmeldung" primary button (indigo, with CalendarPlus icon)

**Hero Stats Strip:**
- 3 stat cards in a row, equal width, separated by 24px gap
- Each: label (13px, muted, weight 500, uppercase tracking wide), value (36px, weight 800), optional sublabel
- Cards have white background, subtle border, 12px border-radius
- Stat 1: Aktive Kurse (count, indigo number)
- Stat 2: Anmeldungen gesamt (count, with "X bezahlt" badge in amber)
- Stat 3: Erwarteter Umsatz (EUR formatted, amber number)

**Left Column (65%) - Kurse:**
- Section header: "Kurse" (20px, weight 700) with "Neuer Kurs" button (secondary, outline)
- Course cards in a vertical list, each showing:
  - Title (16px, weight 600)
  - Instructor + Room (14px, muted, separated by bullet)
  - Date range (14px, muted)
  - Capacity progress bar (full width, 6px height, rounded)
  - "X/Y Plätze belegt" + Price (EUR) on the same line
  - Edit + Delete icon buttons on hover (shown in top-right corner)

**Right Column (35%) - Activity & Quick Stats:**
- "Letzte Anmeldungen" section: 5 most recent registrations, compact list items showing participant name, course title, and payment status badge (green "Bezahlt" / red "Offen")
- Divider
- Quick stats: Dozenten count, Teilnehmer count, Raeume count - simple inline key-value pairs, not cards

**Bottom Section - Full Width Tabbed Data Management:**
- Tabs: Teilnehmer | Dozenten | Raeume | Anmeldungen
- Each tab shows a table view with all records
- Each row has edit (pencil) and delete (trash) icon buttons
- Each tab header has a "Neu" create button
- Table columns match the fields for each entity

### What Appears on Hover
- Course cards: subtle shadow elevation + edit/delete icons appear in top-right
- Table rows: light background highlight + action icons become more visible
- Stat cards: very subtle scale (1.01) transform
- Buttons: standard color shift

### Clickable/Interactive Areas
- Course cards: click opens detail dialog with all course info + list of registrations for that course
- Registration items in sidebar: click opens registration detail with edit option
- Table rows in bottom section: click opens edit dialog for that record

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Aktive Kurse
- **Data source:** Kurse app, filtered by `enddatum >= today`
- **Calculation:** Count of courses where end date is today or in the future
- **Display:** Large number (36px desktop, 32px mobile, weight 800), indigo color, with label "Aktive Kurse" in muted text above
- **Context shown:** None - the number itself is the hero
- **Why this is the hero:** The admin's primary concern is how many courses are currently running or upcoming. This anchors their mental model.

### Secondary KPIs

**Anmeldungen gesamt**
- Source: Anmeldungen app (filtered to active courses)
- Calculation: Count of registrations linked to active courses
- Format: number
- Display: Large number (36px), with amber badge showing "X bezahlt" (count where bezahlt=true)

**Erwarteter Umsatz**
- Source: Cross-reference Anmeldungen + Kurse
- Calculation: For each registration linked to an active course, sum the course price
- Format: EUR currency (Intl.NumberFormat 'de-DE', currency EUR)
- Display: Large number (36px), amber color

### Chart
- **Type:** Bar chart - best for comparing discrete categories (courses)
- **Title:** Auslastung nach Kurs (Capacity utilization per course)
- **What question it answers:** Which courses are popular and which have low enrollment?
- **Data source:** Kurse + Anmeldungen (count registrations per course, compare to max_teilnehmer)
- **X-axis:** Course title (truncated to 15 chars if needed)
- **Y-axis:** Percentage filled (0-100%)
- **Colors:** Bars use indigo for normal, amber for >80%, destructive for >100%
- **Mobile simplification:** Show top 5 courses only, horizontal bar chart instead of vertical

### Lists/Tables

**Kurse List (Main content area)**
- Purpose: Central management view for all courses
- Source: Kurse app, joined with Dozenten and Raeume via applookup
- Fields shown: titel, dozent name, raum name, startdatum-enddatum, capacity bar, preis
- Mobile style: cards with capacity bar
- Desktop style: cards with capacity bar (NOT a table - cards feel more scannable)
- Sort: startdatum ascending (next upcoming first)
- Limit: All courses (no limit)

**Letzte Anmeldungen (Right sidebar)**
- Purpose: Quick view of recent activity
- Source: Anmeldungen app, joined with Teilnehmer + Kurse
- Fields shown: participant name, course title, bezahlt badge
- Mobile style: compact list items
- Desktop style: compact list items
- Sort: anmeldedatum descending (newest first)
- Limit: 5 most recent

**Teilnehmer Table (Tab section)**
- Purpose: Manage all participants
- Source: Teilnehmer app
- Fields shown: firstname, lastname, email, telefon, geburtsdatum
- Desktop style: table
- Mobile style: cards
- Sort: lastname ascending

**Dozenten Table (Tab section)**
- Purpose: Manage all instructors
- Source: Dozenten app
- Fields shown: firstname, lastname, email, telefon, fachgebiet
- Desktop style: table
- Mobile style: cards
- Sort: lastname ascending

**Raeume Table (Tab section)**
- Purpose: Manage all rooms
- Source: Raeume app
- Fields shown: raumname, gebaeude, kapazitaet
- Desktop style: table
- Mobile style: cards
- Sort: raumname ascending

**Anmeldungen Table (Tab section)**
- Purpose: Manage all registrations with payment tracking
- Source: Anmeldungen app, joined with Teilnehmer + Kurse
- Fields shown: participant name, course title, anmeldedatum, bezahlt (toggle/badge)
- Desktop style: table
- Mobile style: cards
- Sort: anmeldedatum descending

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Anmeldung" (with CalendarPlus icon)
- **Action:** add_record
- **Target app:** Anmeldungen
- **What data:** teilnehmer (select from Teilnehmer list), kurs (select from Kurse list), anmeldedatum (date, default today), bezahlt (checkbox, default false)
- **Mobile position:** fab (bottom-right floating action button, 56px, indigo)
- **Desktop position:** header (right-aligned in top bar)
- **Why this action:** Registration is the most frequent operation - when someone calls to sign up, the admin needs to add them quickly. Selecting from existing participants and courses makes it fast.

### CRUD Operations Per App (REQUIRED!)

**Raeume CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "Neuer Raum" button in the Raeume tab header, or FAB when Raeume tab is active on mobile
  - Form fields: raumname (text input, required), gebaeude (text input), kapazitaet (number input)
  - Form style: Dialog/Modal
  - Required fields: raumname
  - Default values: none

- **Read (Anzeigen):**
  - List view: Table on desktop, cards on mobile
  - Detail view: Click row/card opens edit dialog (no separate detail view needed - simple entity)
  - Fields shown in list: raumname, gebaeude, kapazitaet
  - Sort: raumname ascending

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon on row/card, or click on the row itself
  - Edit style: Same dialog as Create, pre-filled with current values
  - Editable fields: all (raumname, gebaeude, kapazitaet)

- **Delete (Loeschen):**
  - Trigger: Click trash icon on row/card
  - Confirmation: AlertDialog with "Raum loeschen?"
  - Confirmation text: "Moechtest du den Raum '{raumname}' wirklich loeschen? Kurse, die diesen Raum nutzen, verlieren die Raumzuordnung."

**Dozenten CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "Neuer Dozent" button in Dozenten tab header
  - Form fields: dozent_firstname (text, required), dozent_lastname (text, required), email (email input), telefon (tel input), fachgebiet (text input)
  - Form style: Dialog/Modal
  - Required fields: dozent_firstname, dozent_lastname
  - Default values: none

- **Read (Anzeigen):**
  - List view: Table on desktop, cards on mobile
  - Detail view: Click opens edit dialog
  - Fields shown in list: full name (firstname + lastname), email, telefon, fachgebiet
  - Sort: dozent_lastname ascending

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon or click row
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: all

- **Delete (Loeschen):**
  - Trigger: Click trash icon
  - Confirmation: "Moechtest du den Dozenten '{firstname} {lastname}' wirklich loeschen?"

**Kurse CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "Neuer Kurs" button in course section header
  - Form fields: titel (text, required), beschreibung (textarea), startdatum (date input, required), enddatum (date input, required), max_teilnehmer (number), preis (number), raum (select from Raeume), dozent (select from Dozenten)
  - Form style: Dialog/Modal (wider, sm:max-w-lg)
  - Required fields: titel, startdatum, enddatum
  - Default values: startdatum = today, enddatum = today + 7 days

- **Read (Anzeigen):**
  - List view: Cards with capacity bar (main content area)
  - Detail view: Click card opens detail dialog showing all fields + registrations list for this course
  - Fields shown in list: titel, dozent name, raum name, dates, capacity bar, preis
  - Fields shown in detail: all fields + list of registrations with participant names
  - Sort: startdatum ascending

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon on course card (visible on hover on desktop, always visible on mobile)
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: all

- **Delete (Loeschen):**
  - Trigger: Click trash icon on course card
  - Confirmation: "Moechtest du den Kurs '{titel}' wirklich loeschen? Alle Anmeldungen fuer diesen Kurs gehen verloren."

**Teilnehmer CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "Neuer Teilnehmer" button in Teilnehmer tab header
  - Form fields: teilnehmer_firstname (text, required), teilnehmer_lastname (text, required), email (email input), telefon (tel input), geburtsdatum (date input)
  - Form style: Dialog/Modal
  - Required fields: teilnehmer_firstname, teilnehmer_lastname
  - Default values: none

- **Read (Anzeigen):**
  - List view: Table on desktop, cards on mobile
  - Detail view: Click opens edit dialog
  - Fields shown: full name, email, telefon, geburtsdatum
  - Sort: teilnehmer_lastname ascending

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon or click row
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: all

- **Delete (Loeschen):**
  - Trigger: Click trash icon
  - Confirmation: "Moechtest du den Teilnehmer '{firstname} {lastname}' wirklich loeschen?"

**Anmeldungen CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Neue Anmeldung" (header + FAB)
  - Form fields: teilnehmer (select dropdown populated from Teilnehmer app, showing full name, required), kurs (select dropdown populated from Kurse app, showing titel, required), anmeldedatum (date input, default today), bezahlt (checkbox, default false)
  - Form style: Dialog/Modal
  - Required fields: teilnehmer, kurs, anmeldedatum
  - Default values: anmeldedatum = today, bezahlt = false

- **Read (Anzeigen):**
  - List view: Table on desktop with participant name, course title, date, payment badge. Cards on mobile.
  - Detail view: Click opens edit dialog
  - Fields shown: Teilnehmer name (resolved from lookup), Kurs title (resolved from lookup), anmeldedatum, bezahlt badge
  - Sort: anmeldedatum descending

- **Update (Bearbeiten):**
  - Trigger: Click pencil icon or click row
  - Edit style: Same dialog as Create, pre-filled. Teilnehmer and Kurs selects pre-selected.
  - Editable fields: all (teilnehmer, kurs, anmeldedatum, bezahlt)

- **Delete (Loeschen):**
  - Trigger: Click trash icon
  - Confirmation: "Moechtest du diese Anmeldung wirklich loeschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) for cards and dialogs. Pill (20px) for badges and the FAB. 6px for input fields and buttons.

### Shadows
Subtle - cards use `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`. On hover, elevated to `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`. No heavy drop shadows anywhere.

### Spacing
Spacious - 32px between major sections, 16px between cards, 24px padding inside cards, 12px between inline elements. The breathing room is essential for the professional feel.

### Animations
- **Page load:** Subtle stagger fade-in for cards (each card fades in 50ms after the previous)
- **Hover effects:** Cards lift with shadow transition (200ms ease). Buttons darken slightly.
- **Tap feedback:** Cards scale to 0.98 on press (mobile), buttons scale to 0.97.
- **Capacity bars:** Animate width from 0 to actual value on load (400ms ease-out).

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(42 33% 97%);
  --foreground: hsl(230 25% 18%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(230 25% 18%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(230 25% 18%);
  --primary: hsl(234 56% 46%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(230 15% 95%);
  --secondary-foreground: hsl(230 25% 18%);
  --muted: hsl(230 15% 95%);
  --muted-foreground: hsl(230 10% 52%);
  --accent: hsl(38 92% 50%);
  --accent-foreground: hsl(230 25% 18%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(230 15% 90%);
  --input: hsl(230 15% 90%);
  --ring: hsl(234 56% 46%);
  --chart-1: hsl(234 56% 46%);
  --chart-2: hsl(158 64% 40%);
  --chart-3: hsl(38 92% 50%);
  --chart-4: hsl(230 10% 52%);
  --chart-5: hsl(0 72% 51%);
  --radius: 0.5rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans with weights 300-800)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (hero stats row, tab navigation, FAB)
- [ ] Desktop layout matches Section 5 (hero strip, 65/35 split, tabbed bottom section)
- [ ] Hero element is prominent as described (large indigo number for Aktive Kurse)
- [ ] Colors create the warm ivory + indigo + amber mood described in Section 2
- [ ] Capacity bars are implemented with color coding (indigo/amber/red)
- [ ] CRUD patterns are consistent across all 5 apps
- [ ] Delete confirmations are in place for all apps
- [ ] Course cards show capacity progress bars
- [ ] Anmeldungen form uses select dropdowns for Teilnehmer and Kurse
- [ ] Payment status shown as colored badge (green = bezahlt, red = offen)
- [ ] FAB on mobile, header button on desktop for primary action
- [ ] All applookup fields use extractRecordId() with null checks
- [ ] Dates formatted with date-fns and de locale
- [ ] Currency formatted with Intl.NumberFormat de-DE EUR
