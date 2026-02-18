import { LayoutDashboard, BookOpen, Users, UserCheck, DoorOpen, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActiveSection = 'overview' | 'kurse' | 'dozenten' | 'raeume' | 'teilnehmer' | 'anmeldungen';

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'kurse', label: 'Kurse', icon: BookOpen },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { id: 'dozenten', label: 'Dozenten', icon: UserCheck },
  { id: 'raeume', label: 'Räume', icon: DoorOpen },
];

interface AppSidebarProps {
  active: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

export function AppSidebar({ active, onNavigate }: AppSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-800 text-foreground leading-tight">Kursverwaltung</p>
            <p className="text-xs text-muted-foreground leading-tight">Verwaltungssystem</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-smooth text-left',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : '')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">© 2025 Kursverwaltung</p>
      </div>
    </aside>
  );
}

interface MobileNavProps {
  active: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
}

const mobileNavItems: NavItem[] = [
  { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'kurse', label: 'Kurse', icon: BookOpen },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { id: 'dozenten', label: 'Dozenten', icon: UserCheck },
];

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-smooth min-w-0',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-600 leading-none truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
