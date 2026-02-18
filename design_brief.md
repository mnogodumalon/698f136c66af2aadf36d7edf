# Design Brief: Kursverwaltung Dashboard

## 1. App Analysis
A comprehensive course management platform for managing rooms, instructors, courses, participants, and registrations. Targeted at education coordinators or training managers who need a professional overview of their course operations. The ONE thing users care about most is **seeing their courses at a glance** — what's running, who's enrolled, and revenue status. Primary actions: creating new courses, registering participants, checking enrollment status.

## 2. What Makes This Design Distinctive
- **Visual identity:** Deep slate navy with warm amber accent — reminds of premium European SaaS tools like Personio or Factorial. Not corporate-cold, but precise and authoritative.
- **Layout strategy:** Left sidebar navigation + content area. Hero stat bar at top showing 4 KPIs. Content area shows filterable table/cards depending on section.
- **Unique element:** The sidebar uses a subtle gradient from deep navy to slightly lighter navy with amber left-border indicators on active items. Course cards have a colored left-accent bar based on fill ratio.

## 3. Theme & Colors
- **Font:** IBM Plex Sans (Google Fonts) — precise, technical, perfectly suited for data/education domains
- **Color palette (HSL):**
  - Background: `220 20% 97%` (cool off-white)
  - Surface: `0 0% 100%`
  - Sidebar bg: `222 47% 11%` (deep navy)
  - Sidebar text: `210 40% 80%`
  - Sidebar active: `38 92% 50%` (amber)
  - Primary: `38 92% 50%` (amber)
  - Primary foreground: `222 47% 8%`
  - Secondary: `220 14% 93%`
  - Accent: `38 92% 50%`
  - Destructive: `0 72% 51%`
  - Text primary: `222 47% 11%`
  - Text muted: `220 14% 46%`
  - Border: `220 13% 90%`
  - Chart colors: amber, teal, indigo, rose, emerald

## 4. Mobile Layout
- Hamburger menu opens sidebar as drawer
- Hero KPIs stack 2x2
- Content section fills full width
- FAB (Floating Action Button) at bottom right for primary action

## 5. Desktop Layout
- 240px fixed sidebar + fluid content area
- Header bar inside content area with page title + action button
- KPI strip (4 cards in a row) beneath header
- Main content: tabbed or section-based table/list

## 6. Components
- **Hero KPI Strip:** 4 cards — Active Courses, Total Participants, Monthly Revenue, Room Utilization
- **Sidebar:** Logo, nav items with icons, active state with amber indicator
- **Data Tables:** Full CRUD tables per section with inline edit/delete
- **Modals:** Create/Edit dialogs for each entity
- **Badges:** Status badges (bezahlt/unbezahlt, enrollment fill)
- **Primary Action Button:** "Neu erstellen" (Create new) — amber, prominent

## 7. Visual Details
- Border radius: `0.5rem` cards, `0.375rem` buttons, `0.75rem` hero cards
- Shadows: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` for cards
- Sidebar item hover: `white/8` background
- Active sidebar: `amber/15` background + `3px amber left border`
- Table row hover: `amber/5` background
- Transitions: `all 0.2s ease`

## 8. CSS Variables
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'IBM Plex Sans', sans-serif;

  --background: 220 20% 97%;
  --surface: 0 0% 100%;
  --sidebar-bg: 222 47% 11%;
  --sidebar-text: 210 40% 80%;
  --sidebar-muted: 210 25% 55%;
  --sidebar-active-bg: 38 92% 50%;
  --sidebar-hover: 220 30% 18%;

  --primary: 38 92% 50%;
  --primary-foreground: 222 47% 8%;
  --secondary: 220 14% 93%;
  --secondary-foreground: 222 47% 11%;
  --accent: 38 92% 60%;

  --foreground: 222 47% 11%;
  --muted: 220 14% 46%;
  --muted-bg: 220 14% 93%;
  --border: 220 13% 90%;

  --destructive: 0 72% 51%;
  --success: 142 71% 45%;

  --radius: 0.5rem;
  --radius-sm: 0.375rem;
  --radius-lg: 0.75rem;

  --shadow-card: 0 1px 3px hsl(222 47% 11% / 0.08), 0 1px 2px hsl(222 47% 11% / 0.04);
  --shadow-elevated: 0 4px 12px hsl(222 47% 11% / 0.12), 0 2px 4px hsl(222 47% 11% / 0.06);
  --shadow-modal: 0 20px 60px hsl(222 47% 11% / 0.2);

  --transition: all 0.2s ease;
}
```
