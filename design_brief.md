# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis

### What This App Does
This is a **course management system** (Kursverwaltung) for an educational institution. It manages the full lifecycle of course administration: rooms where courses take place, instructors who teach them, the courses themselves with schedules and pricing, participants who enroll, and registrations that link participants to courses with payment tracking.

### Who Uses This
An administrative staff member at a training center or educational institution. They manage daily operations - scheduling courses, assigning rooms and instructors, tracking registrations, and monitoring payment status. They think in terms of "Which courses are coming up? How many spots are filled? Who hasn't paid yet?"

### The ONE Thing Users Care About Most
**Registration fill rate and payment status.** The user opens this dashboard to instantly see: How full are my courses? Which registrations are unpaid? This is the operational pulse of the business - revenue depends on filled, paid courses.

### Primary Actions (IMPORTANT!)
1. **Neue Anmeldung erstellen** (Create Registration) → Primary Action Button - the #1 daily task is enrolling participants in courses
2. Neuen Kurs anlegen (Create Course) - periodic task for setting up upcoming courses
3. Neuen Teilnehmer anlegen (Create Participant) - when new participants arrive
4. Manage rooms and instructors - less frequent, administrative tasks

---

## 2. What Makes This Design Distinctive

### Visual Identity
The dashboard uses a **warm, professional aesthetic with slate-blue accents** that communicates institutional trustworthiness while feeling modern and approachable. The slightly warm off-white background (`hsl(220 14% 97%)`) paired with a refined slate-blue primary (`hsl(215 65% 45%)`) creates a calm, authoritative feel - like a well-organized university admin office. This isn't a flashy startup dashboard; it's a reliable tool that inspires confidence in its accuracy.

### Layout Strategy
The layout uses an **asymmetric hero-driven approach**. The hero section displays a large registration fill rate metric with a prominent progress bar, dominating the first viewport. Below, three compact secondary KPIs sit in a row with intentional size variation - the payment rate KPI is slightly wider to draw attention to revenue concerns. A horizontal bar chart shows course fill rates at a glance, and below that, a tabbed section provides full CRUD management for all five apps.

Visual interest comes from:
- The oversized hero number (56px) contrasting with compact 14px secondary metrics
- A colored progress bar in the hero that provides immediate visual feedback
- Generous whitespace above the hero separating it from the header
- The tab-based CRUD section using a different visual treatment (full-width, bordered) from the card-based KPIs above

### Unique Element
The **course fill rate bar chart** uses horizontally stacked bars where the filled portion uses the primary blue and the remaining capacity uses a very light muted tone, creating an intuitive "tank gauge" effect. Each bar is labeled with the course name and shows "12/20" style counts at the end. This makes it instantly scannable which courses need attention.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`
- **Why this font:** Plus Jakarta Sans has a professional, slightly geometric quality that suits institutional administration. Its distinctive letterforms (especially the 'g' and 'a') give it character without being distracting. The wide weight range (300-800) enables strong typographic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(220 14% 97%)` | `--background` |
| Main text | `hsl(220 20% 14%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(220 20% 14%)` | `--card-foreground` |
| Borders | `hsl(220 13% 90%)` | `--border` |
| Primary action | `hsl(215 65% 45%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(215 40% 94%)` | `--accent` |
| Muted background | `hsl(220 14% 95%)` | `--muted` |
| Muted text | `hsl(220 10% 46%)` | `--muted-foreground` |
| Success/positive | `hsl(152 55% 41%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The slate-blue primary creates a sense of institutional reliability - it's the color of trusted systems, not flashy consumer apps. The warm off-white background prevents the sterile feeling of pure white while maintaining excellent readability. The green success color is used sparingly for payment confirmations, while destructive red is reserved for deletions and overdue payments.

### Background Treatment
The background uses a subtle warm off-white (`hsl(220 14% 97%)`) that creates gentle contrast with pure white cards. No gradients or patterns - the design relies on card elevation (subtle shadows) and whitespace for visual structure. This keeps the focus on data, not decoration.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is a focused, vertical flow. The hero KPI dominates the first viewport with a large number and progress bar. Secondary KPIs stack as a compact horizontal scroll. The chart becomes a simplified vertical list. The CRUD tabs section uses full-width cards instead of tables.

### What Users See (Top to Bottom)

**Header:**
A clean header with "Kursverwaltung" as the title (font-weight 700, 20px) on the left, and the primary action button "Neue Anmeldung" on the right as a compact button with a Plus icon.

**Hero Section (The FIRST thing users see):**
The hero shows the **Gesamtauslastung** (Overall Fill Rate) - a percentage calculated as (total registrations / total max_teilnehmer across all active courses). It occupies roughly 40% of the first viewport.
- The percentage number is displayed at 48px, font-weight 800, in the primary color
- Below the number, a full-width progress bar (8px height, rounded, primary color fill on muted background) visualizes the fill rate
- Below the progress bar, a small muted text line: "X von Y Plätzen belegt" (X of Y spots filled)
- The hero sits in a Card with generous padding (24px) and a subtle shadow

**Section 2: Secondary KPIs (Horizontal scroll)**
Three compact KPI badges in a horizontal scrollable row (no wrapping on mobile):
1. **Aktive Kurse** - Count of courses where startdatum <= today AND enddatum >= today (or enddatum is null). Icon: BookOpen. Display: number with label below.
2. **Offene Zahlungen** - Count of Anmeldungen where bezahlt = false. Icon: AlertCircle. Display: number in destructive color, label below.
3. **Teilnehmer** - Total count of Teilnehmer records. Icon: Users. Display: number with label below.

Each KPI is a small Card (min-width 140px) with the number at 28px font-weight 700, the label at 12px muted text, and the icon at 16px in muted-foreground. The "Offene Zahlungen" number uses the destructive color to draw attention.

**Section 3: Kursauslastung Chart**
On mobile, this becomes a vertical list of course fill rates instead of a horizontal bar chart:
- Each course is a row with: course name (left, 14px medium), "X/Y" count (right, 14px), and a thin progress bar below (4px height, full width)
- Sorted by fill rate descending (fullest courses first)
- Limited to top 5 courses, with "Alle anzeigen" link if more exist
- Wrapped in a Card with title "Kursauslastung" (16px, font-weight 600)

**Section 4: Data Management Tabs**
A full-width Tabs component with 5 tabs: Kurse, Anmeldungen, Teilnehmer, Dozenten, Räume.
- Each tab shows a card-based list (not table) on mobile
- Each card shows the most important 2-3 fields
- Each card has edit (Pencil icon) and delete (Trash2 icon) action buttons
- A "+" button at the top of each tab list to create new entries
- Cards are stacked vertically with 8px gaps

**Bottom Navigation / Action:**
No fixed bottom navigation. The primary action "Neue Anmeldung" is in the header and also available as a "+" button within the Anmeldungen tab.

### Mobile-Specific Adaptations
- KPIs use horizontal scroll instead of grid
- Chart becomes a vertical list with progress bars
- Tables become card lists
- All touch targets are minimum 44px
- Tab labels may truncate on very small screens; icons accompany labels for clarity

### Touch Targets
All buttons and interactive elements are minimum 44px touch targets. Card action buttons (edit/delete) have 40px hit areas with adequate spacing between them to prevent accidental taps.

### Interactive Elements
- Tapping a course card in the Kurse tab opens the edit dialog pre-filled
- Tapping an Anmeldung card shows full details including linked Teilnehmer and Kurs names
- Progress bars in the chart section are not interactive

---

## 5. Desktop Layout

### Overall Structure
A max-width container (1200px) centered on the page with comfortable side margins.

**Row 1: Header** - Full width, flex between title and primary action button

**Row 2: Hero + Secondary KPIs** - The hero card takes 60% width on the left. The three secondary KPI cards stack vertically on the right (40% width), creating an asymmetric layout where the hero visually dominates.

**Row 3: Chart** - Full width card with the horizontal bar chart showing all course fill rates. The chart uses horizontal bars with course names on the Y-axis and fill count on the X-axis. Stacked bars: filled (primary) vs remaining (muted).

**Row 4: Data Management** - Full width Tabs component. Each tab displays a proper Table (not cards) with columns for each field, plus an Actions column with edit/delete icon buttons. A "Neu erstellen" button sits in the top-right of each tab panel.

### Section Layout
- Top area: Header with title + primary action (height ~64px)
- Hero row: 60/40 split - hero card left, three stacked KPI cards right (gap 16px)
- Chart area: Full width card, chart height 300px
- Data tables: Full width tabs, tables with hover row highlighting

### What Appears on Hover
- Table rows highlight with a subtle muted background on hover
- Edit/delete action buttons in tables appear slightly more prominent on row hover (opacity 0.6 → 1.0)
- Cards have a subtle shadow increase on hover (shadow-sm → shadow-md transition)

### Clickable/Interactive Areas
- Table rows are not clickable (actions via explicit buttons)
- The "Offene Zahlungen" KPI card is clickable - it switches to the Anmeldungen tab filtered to show unpaid registrations
- Chart bars show a tooltip on hover with exact numbers

---

## 6. Components

### Hero KPI
- **Title:** Gesamtauslastung
- **Data source:** Kurse (for max_teilnehmer) + Anmeldungen (for actual count)
- **Calculation:** Sum all max_teilnehmer from active Kurse, count all Anmeldungen linked to those Kurse. Percentage = (anmeldungen count / total max_teilnehmer) * 100. An "active" course is one where we have startdatum and enddatum and today falls within that range, OR if dates are missing, include all courses.
- **Display:** Large percentage (48px/56px mobile/desktop, weight 800, primary color) with a horizontal progress bar below (8px height, rounded-full, primary fill on muted background). Below the bar: "X von Y Plätzen belegt" in muted text (14px).
- **Context shown:** The absolute numbers provide context to the percentage
- **Why this is the hero:** This single metric answers the most important question: "How full are my courses overall?" It drives revenue decisions - if fill rate is low, they need to market more; if high, they might add more courses.

### Secondary KPIs

**Aktive Kurse**
- Source: Kurse
- Calculation: Count courses where today is between startdatum and enddatum (inclusive). If dates are null, include the course.
- Format: number
- Display: Card with icon (BookOpen, 16px), number (28px/32px mobile/desktop, weight 700), label "Aktive Kurse" (12px/13px, muted). On desktop, these cards stack vertically in the right column.

**Offene Zahlungen**
- Source: Anmeldungen
- Calculation: Count where bezahlt === false or bezahlt is null/undefined
- Format: number
- Display: Same card style but number uses destructive color to signal urgency. Icon: AlertCircle in destructive color. Label: "Offene Zahlungen"

**Teilnehmer Gesamt**
- Source: Teilnehmer
- Calculation: Total count of all Teilnehmer records
- Format: number
- Display: Card with icon (Users, 16px), number in foreground color, label "Teilnehmer"

### Chart
- **Type:** Horizontal BarChart (recharts) - horizontal bars make course names easy to read and naturally accommodate varying name lengths
- **Title:** "Kursauslastung" (16px, weight 600)
- **What question it answers:** "Which courses are filling up and which have room?" - helps the admin decide where to focus enrollment efforts
- **Data source:** Kurse + Anmeldungen (count Anmeldungen per Kurs)
- **X-axis:** Number of registrations (0 to max of max_teilnehmer)
- **Y-axis:** Course titles (Kurse.titel)
- **Bars:** Each bar shows registrations count in primary color. A reference line or background bar at max_teilnehmer in muted color shows capacity.
- **Mobile simplification:** Replaced with vertical list of progress bars (described in Section 4)

### Lists/Tables

**Kurse Tab**
- Purpose: Full management of all courses
- Source: Kurse + resolved Dozenten names + resolved Räume names
- Fields shown in table: Kurstitel, Dozent (resolved name), Raum (resolved name), Startdatum, Enddatum, Preis, Max. Teilnehmer, Aktionen
- Fields shown in mobile card: Kurstitel (bold), Dozent name, Startdatum - Enddatum, Preis
- Desktop style: Table with all columns
- Sort: By startdatum descending (newest first)
- Limit: Show all

**Anmeldungen Tab**
- Purpose: Manage course registrations and track payments
- Source: Anmeldungen + resolved Teilnehmer names + resolved Kurs titles
- Fields shown in table: Teilnehmer (resolved name), Kurs (resolved title), Anmeldedatum, Bezahlt (badge: green "Bezahlt" or red "Offen"), Aktionen
- Fields shown in mobile card: Teilnehmer name (bold), Kurs title, Bezahlt badge
- Desktop style: Table
- Sort: By anmeldedatum descending
- Limit: Show all

**Teilnehmer Tab**
- Purpose: Manage participant database
- Source: Teilnehmer
- Fields shown in table: Vorname, Nachname, E-Mail, Telefon, Geburtsdatum, Aktionen
- Fields shown in mobile card: Full name (bold), E-Mail, Telefon
- Desktop style: Table
- Sort: By nachname ascending
- Limit: Show all

**Dozenten Tab**
- Purpose: Manage instructor database
- Source: Dozenten
- Fields shown in table: Vorname, Nachname, E-Mail, Telefon, Fachgebiet, Aktionen
- Fields shown in mobile card: Full name (bold), Fachgebiet, E-Mail
- Desktop style: Table
- Sort: By nachname ascending
- Limit: Show all

**Räume Tab**
- Purpose: Manage room database
- Source: Raeume
- Fields shown in table: Raumname, Gebäude, Kapazität, Aktionen
- Fields shown in mobile card: Raumname (bold), Gebäude, Kapazität
- Desktop style: Table
- Sort: By raumname ascending
- Limit: Show all

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Anmeldung" (with Plus icon)
- **Action:** add_record
- **Target app:** Anmeldungen
- **What data:** Form with:
  - Teilnehmer: Select dropdown populated from Teilnehmer records (show "Vorname Nachname"), required
  - Kurs: Select dropdown populated from Kurse records (show Titel), required
  - Anmeldedatum: Date input, default to today's date (YYYY-MM-DD format)
  - Bezahlt: Checkbox, default false
- **Mobile position:** header (compact button with Plus icon and text "Neue Anmeldung")
- **Desktop position:** header (right-aligned button)
- **Why this action:** Enrolling participants in courses is the most frequent daily operation. Every time someone calls, emails, or walks in to register for a course, this is the action. Making it one click away from anywhere in the dashboard is critical.

### CRUD Operations Per App (REQUIRED!)

**Räume CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button at top of Räume tab
  - Form fields: Raumname (text input, required), Gebäude (text input), Kapazität (number input)
  - Form style: Dialog/Modal
  - Required fields: Raumname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Detail view: Not needed - all fields visible in list/card
  - Fields shown in list: Raumname, Gebäude, Kapazität
  - Sort: By raumname ascending
  - Filter/Search: No filter needed (typically few rooms)

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button in actions column/card
  - Edit style: Same dialog as Create, pre-filled with current values
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash2 icon button in actions column/card
  - Confirmation: Always required
  - Confirmation text: "Möchtest du den Raum '{raumname}' wirklich löschen?"

**Dozenten CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button at top of Dozenten tab
  - Form fields: Vorname (text, required), Nachname (text, required), E-Mail (email input), Telefon (tel input), Fachgebiet (text)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Vorname, Nachname, E-Mail, Telefon, Fachgebiet
  - Sort: By nachname ascending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash2 icon button
  - Confirmation text: "Möchtest du den Dozenten '{vorname} {nachname}' wirklich löschen?"

**Kurse CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button at top of Kurse tab
  - Form fields: Kurstitel (text, required), Beschreibung (textarea), Startdatum (date input), Enddatum (date input), Max. Teilnehmer (number), Preis (number, step 0.01), Raum (Select from Räume, show raumname), Dozent (Select from Dozenten, show "Vorname Nachname")
  - Form style: Dialog/Modal (wider, sm:max-w-lg)
  - Required fields: Kurstitel
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Kurstitel, Dozent (resolved), Raum (resolved), Start, Ende, Preis, Max. TN
  - Sort: By startdatum descending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button
  - Edit style: Same dialog as Create, pre-filled. Raum and Dozent selects show current resolved value.
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash2 icon button
  - Confirmation text: "Möchtest du den Kurs '{titel}' wirklich löschen?"

**Teilnehmer CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button at top of Teilnehmer tab
  - Form fields: Vorname (text, required), Nachname (text, required), E-Mail (email), Telefon (tel), Geburtsdatum (date input)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Vorname, Nachname, E-Mail, Telefon, Geburtsdatum
  - Sort: By nachname ascending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash2 icon button
  - Confirmation text: "Möchtest du den Teilnehmer '{vorname} {nachname}' wirklich löschen?"

**Anmeldungen CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Neue Anmeldung" in header OR "+" button in Anmeldungen tab
  - Form fields: Teilnehmer (Select from Teilnehmer, show "Vorname Nachname", required), Kurs (Select from Kurse, show Titel, required), Anmeldedatum (date, default today), Bezahlt (checkbox, default false)
  - Form style: Dialog/Modal
  - Required fields: Teilnehmer, Kurs
  - Default values: Anmeldedatum = today, Bezahlt = false

- **Read (Anzeigen):**
  - List view: Table on desktop, card list on mobile
  - Fields shown: Teilnehmer (resolved name), Kurs (resolved title), Anmeldedatum, Bezahlt (badge)
  - Sort: By anmeldedatum descending

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button
  - Edit style: Same dialog as Create, pre-filled. Selects show current resolved values.
  - Editable fields: All fields (Teilnehmer, Kurs, Anmeldedatum, Bezahlt)

- **Delete (Löschen):**
  - Trigger: Trash2 icon button
  - Confirmation text: "Möchtest du diese Anmeldung wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (8px) - professional without being too soft. Use `rounded-lg` for cards and `rounded-md` for buttons and inputs.

### Shadows
Subtle - cards use `shadow-sm` by default, `shadow-md` on hover. No heavy drop shadows. The elevation is just enough to separate cards from the background.

### Spacing
Normal to spacious - 24px padding inside cards, 16px gap between cards, 32px between major sections. Generous whitespace around the hero section to let it breathe.

### Animations
- **Page load:** Subtle fade-in (200ms ease-out) for cards
- **Hover effects:** Shadow transition (shadow-sm → shadow-md, 150ms), table row background change (transparent → muted, 100ms)
- **Tap feedback:** Button active state uses scale(0.98) transform briefly
- **Dialog:** Default shadcn dialog animation (fade + scale)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css` `:root` block:

```css
:root {
  --background: hsl(220 14% 97%);
  --foreground: hsl(220 20% 14%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(220 20% 14%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(220 20% 14%);
  --primary: hsl(215 65% 45%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(220 14% 95%);
  --secondary-foreground: hsl(220 20% 14%);
  --muted: hsl(220 14% 95%);
  --muted-foreground: hsl(220 10% 46%);
  --accent: hsl(215 40% 94%);
  --accent-foreground: hsl(220 20% 14%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(220 13% 90%);
  --input: hsl(220 13% 90%);
  --ring: hsl(215 65% 45%);
  --chart-1: hsl(215 65% 45%);
  --chart-2: hsl(152 55% 41%);
  --chart-3: hsl(35 92% 53%);
  --chart-4: hsl(280 55% 55%);
  --chart-5: hsl(340 65% 55%);
  --radius: 0.5rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans, NOT Inter or Roboto)
- [ ] All CSS variables copied exactly (complete hsl() functions)
- [ ] Mobile layout matches Section 4 (vertical flow, horizontal scroll KPIs, card lists)
- [ ] Desktop layout matches Section 5 (60/40 hero split, tables, 1200px max-width)
- [ ] Hero element is prominent as described (large percentage, progress bar)
- [ ] Colors create the professional, institutional mood described in Section 2
- [ ] CRUD patterns are consistent across all 5 apps (same dialog style, button placement)
- [ ] Delete confirmations are in place for all 5 apps
- [ ] Applookup fields resolved correctly (Dozent name, Raum name, etc.)
- [ ] Anmeldungen form uses Select dropdowns for Teilnehmer and Kurs
- [ ] Bezahlt status shown as colored badges
- [ ] Chart shows course fill rates with capacity reference
- [ ] Toast feedback on all CRUD operations (sonner)
- [ ] Data refreshes after every create/update/delete
