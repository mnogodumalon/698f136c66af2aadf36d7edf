# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis
A course management system for educational institutions to manage rooms, instructors, courses, participants, and enrollments. The primary user is an administrator at a language school, training center, or vocational institute who needs to see an overview of all running courses, manage registrations, and track payments. The ONE thing users care about most is knowing the current state of their courses — how many people are enrolled, who's teaching what, and whether fees have been paid. Primary actions: adding courses, enrolling participants, marking payments as paid.

## 2. What Makes This Design Distinctive
- **Visual identity:** Deep teal-indigo with warm cream background. Professional yet approachable — like a well-designed appointment book brought to life digitally. Structured but not sterile.
- **Layout strategy:** Navigation sidebar (desktop) / bottom tab bar (mobile). Main content area with a dashboard overview as home. Each section is a full page, not nested modals.
- **Unique element:** Enrollment cards show a mini progress bar indicating how full a course is (enrolled/max_teilnehmer), with the bar color shifting from teal (low) to amber (near full) to rose (full).

## 3. Theme & Colors
- **Font:** Plus Jakarta Sans (Google Fonts) — professional, warm, excellent weight range. Pairs well with educational/administrative contexts.
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap
- **Color palette (HSL):**
  - Background: hsl(220, 25%, 97%) — warm blue-tinted white
  - Surface (cards): hsl(0, 0%, 100%) with subtle shadow
  - Primary: hsl(220, 62%, 44%) — deep trust-blue
  - Primary light: hsl(220, 80%, 96%) — very light blue tint
  - Primary glow: hsl(220, 55%, 60%) — lighter blue for gradients
  - Accent: hsl(172, 58%, 39%) — teal for success/highlights
  - Accent light: hsl(172, 80%, 95%)
  - Amber: hsl(38, 95%, 52%) — for warnings / near-full
  - Rose: hsl(356, 80%, 56%) — for danger / paid status
  - Foreground: hsl(222, 25%, 12%)
  - Muted text: hsl(222, 15%, 52%)
  - Border: hsl(220, 20%, 91%)
- **Background treatment:** Solid warm off-white with subtle gradient on hero stats

## 4. Mobile Layout
- Bottom navigation bar with icons for: Overview, Kurse, Anmeldungen, Teilnehmer, Mehr (sheet with Dozenten + Räume)
- Stack layout: header with title → KPI hero row (horizontal scroll) → section content
- Touch targets: 44px minimum for all interactive elements
- Floating action button (FAB) for primary "Neu hinzufügen" action on each section

## 5. Desktop Layout
- Left sidebar (240px): Logo + navigation items with icons
- Main content: Full remaining width
- KPI cards: 4-column grid at top
- Below KPIs: 2-column layout — left for primary entity list, right for contextual info
- Hover states: Card lift (translateY -2px) + enhanced shadow

## 6. Components
- **Hero KPI:** "Aktive Kurse" displayed large with trend indicator
- **Secondary KPIs:** Teilnehmer gesamt, Anmeldungen heute, Offene Zahlungen (as colored badge count)
- **Charts:** Simple bar chart for enrollment by course (recharts), line for monthly revenue
- **Course list table:** Title, Dozent, Raum, dates, Belegung (progress bar), actions
- **Primary Action Button:** "+ Kurs hinzufügen" / "+ Anmeldung" etc. per section — prominent teal button

## 7. Visual Details
- Border radius: 12px for cards, 8px for inputs, 6px for badges
- Shadows: `0 1px 3px hsl(220 62% 44% / 0.08), 0 4px 12px hsl(220 62% 44% / 0.06)`
- Hover shadow: `0 4px 20px hsl(220 62% 44% / 0.15)`
- Animations: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` for all interactive elements
- Entry animation: `animate-in fade-in slide-in-from-bottom-4 duration-300` for page content
- Progress bars: rounded-full, height 6px, smooth fill animation
- Badges: Small, pill-shaped, colored background with matching text

## 8. CSS Variables (copy exactly into index.css)
```css
:root {
  --radius: 0.75rem;
  --background: hsl(220, 25%, 97%);
  --foreground: hsl(222, 25%, 12%);
  --card: hsl(0, 0%, 100%);
  --card-foreground: hsl(222, 25%, 12%);
  --popover: hsl(0, 0%, 100%);
  --popover-foreground: hsl(222, 25%, 12%);
  --primary: hsl(220, 62%, 44%);
  --primary-foreground: hsl(0, 0%, 100%);
  --primary-light: hsl(220, 80%, 96%);
  --primary-glow: hsl(220, 55%, 60%);
  --secondary: hsl(220, 20%, 95%);
  --secondary-foreground: hsl(222, 25%, 12%);
  --muted: hsl(220, 20%, 95%);
  --muted-foreground: hsl(222, 15%, 52%);
  --accent: hsl(172, 58%, 39%);
  --accent-foreground: hsl(0, 0%, 100%);
  --accent-light: hsl(172, 80%, 95%);
  --amber: hsl(38, 95%, 52%);
  --amber-light: hsl(38, 100%, 94%);
  --destructive: hsl(356, 80%, 56%);
  --destructive-light: hsl(356, 100%, 96%);
  --border: hsl(220, 20%, 91%);
  --input: hsl(220, 20%, 91%);
  --ring: hsl(220, 62%, 44%);

  --shadow-card: 0 1px 3px hsl(220 62% 44% / 0.08), 0 4px 12px hsl(220 62% 44% / 0.06);
  --shadow-hover: 0 4px 20px hsl(220 62% 44% / 0.15);
  --shadow-elevated: 0 8px 40px hsl(220 62% 44% / 0.2);

  --gradient-hero: linear-gradient(135deg, hsl(220, 62%, 44%), hsl(220, 55%, 60%));
  --gradient-accent: linear-gradient(135deg, hsl(172, 58%, 39%), hsl(172, 55%, 55%));
  --gradient-surface: linear-gradient(180deg, hsl(220, 25%, 97%), hsl(220, 20%, 99%));

  --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```
