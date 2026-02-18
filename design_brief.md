# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis
A comprehensive course management dashboard for educational institutions or training centers. Administrators can manage courses, instructors, rooms, participants, and registrations all in one place.

**Who uses this:** Course administrators, training coordinators, academic staff
**The ONE thing users care about most:** Quick overview of active courses and enrollments
**Primary actions:** Register participants to courses, create new courses, manage instructor assignments

## 2. What Makes This Design Distinctive
- **Visual identity:** Deep navy/slate base with warm amber accents — professional yet inviting, like a premium university portal
- **Layout strategy:** Hero card showing total active courses and enrollments, asymmetric grid with courses prominent, side panels for quick actions
- **Unique element:** Course cards with subtle gradient progress bars showing enrollment capacity

## 3. Theme & Colors
- **Font:** Plus Jakarta Sans — geometric, modern, highly readable, perfect for data-heavy interfaces
- **Google Fonts:** https://fonts.google.com/specimen/Plus+Jakarta+Sans

**Color palette:**
- Background: `hsl(222 47% 97%)` — cool off-white with blue undertone
- Foreground: `hsl(222 47% 11%)` — deep navy for text
- Primary: `hsl(35 95% 55%)` — warm amber for accents and CTAs
- Primary foreground: `hsl(222 47% 11%)` — dark text on amber
- Secondary: `hsl(222 30% 93%)` — muted blue-gray for cards
- Muted: `hsl(222 20% 85%)` — subtle borders/dividers
- Accent: `hsl(162 73% 46%)` — teal green for success states
- Destructive: `hsl(0 84% 60%)` — red for warnings

## 4. Mobile Layout
- Single column, vertical scroll
- Hero KPI (Active Courses count) at top with enrollment stat
- Tabbed navigation: Kurse | Dozenten | Räume | Teilnehmer
- Course cards stack vertically with full-width touch targets
- Floating action button bottom-right for "Neue Anmeldung"

## 5. Desktop Layout
- **Left side (65%):** Course grid with 2-column layout, hero stats bar at top
- **Right side (35%):** Quick actions panel, recent activity, upcoming courses
- Bottom section: Tabbed tables for Dozenten, Räume, Teilnehmer
- Hover states reveal quick edit/delete actions on cards

## 6. Components

### Hero KPI Section
- Large number showing active courses count
- Secondary stats: Total Teilnehmer, Anmeldungen this month, Available capacity
- Subtle gradient background with brand colors

### Course Cards
- Title prominently displayed (font-weight 600)
- Instructor badge with avatar placeholder
- Date range with calendar icon
- Enrollment progress bar (current/max)
- Price displayed with Euro symbol
- Room tag with building info

### Instructor List
- Avatar circle with initials
- Name, specialty as subtitle
- Email/phone on hover or expand

### Quick Actions Panel
- "Neue Anmeldung" primary button
- "Kurs erstellen" secondary
- "Teilnehmer hinzufügen" secondary

### Tables
- Sortable columns
- Inline edit capability
- Row selection for bulk actions

## 7. Visual Details
- Border radius: `0.75rem` for cards, `0.5rem` for buttons, `9999px` for badges
- Shadows: Soft elevation `0 4px 20px hsl(222 47% 11% / 0.08)`
- Spacing: 8px grid system, 24px card padding, 16px gaps
- Animations: 200ms ease-out for hovers, 300ms for modals

## 8. CSS Variables

```css
:root {
  --radius: 0.75rem;

  /* Base colors */
  --background: 222 47% 97%;
  --foreground: 222 47% 11%;

  /* Primary - Warm Amber */
  --primary: 35 95% 55%;
  --primary-foreground: 222 47% 11%;
  --primary-glow: 35 95% 70%;

  /* Secondary */
  --secondary: 222 30% 93%;
  --secondary-foreground: 222 47% 20%;

  /* Muted */
  --muted: 222 20% 92%;
  --muted-foreground: 222 15% 45%;

  /* Accent - Teal */
  --accent: 162 73% 46%;
  --accent-foreground: 162 80% 15%;

  /* Cards */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* Destructive */
  --destructive: 0 84% 60%;

  /* Borders & Input */
  --border: 222 20% 88%;
  --input: 222 20% 88%;
  --ring: 35 95% 55%;

  /* Charts */
  --chart-1: 35 95% 55%;
  --chart-2: 162 73% 46%;
  --chart-3: 222 47% 45%;
  --chart-4: 280 60% 55%;
  --chart-5: 195 75% 50%;

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, hsl(222 47% 15%) 0%, hsl(222 47% 25%) 100%);
  --gradient-card-hover: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(222 30% 98%) 100%);
  --gradient-primary: linear-gradient(135deg, hsl(35 95% 55%) 0%, hsl(35 95% 65%) 100%);

  /* Shadows */
  --shadow-sm: 0 2px 8px hsl(222 47% 11% / 0.04);
  --shadow-md: 0 4px 20px hsl(222 47% 11% / 0.08);
  --shadow-lg: 0 8px 40px hsl(222 47% 11% / 0.12);
  --shadow-glow: 0 0 30px hsl(35 95% 55% / 0.3);
}
```
