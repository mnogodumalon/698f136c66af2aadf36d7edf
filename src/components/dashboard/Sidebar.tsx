import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Building2,
  ClipboardList,
  X,
} from 'lucide-react';

export type Section =
  | 'overview'
  | 'kurse'
  | 'teilnehmer'
  | 'dozenten'
  | 'raeume'
  | 'anmeldungen';

const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'kurse', label: 'Kurse', icon: BookOpen },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { id: 'dozenten', label: 'Dozenten', icon: GraduationCap },
  { id: 'raeume', label: 'Räume', icon: Building2 },
];

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activeSection, onSectionChange, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-60 flex flex-col',
          'bg-sidebar',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ boxShadow: '4px 0 24px oklch(0.08 0.02 255 / 0.4)' }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'oklch(0.75 0.175 70)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: 'oklch(0.15 0.04 255)' }} />
            </div>
            <div>
              <p className="text-sm font-600 leading-tight" style={{ color: 'oklch(0.95 0.01 250)', fontWeight: 600 }}>
                Kurs
              </p>
              <p className="text-xs leading-tight" style={{ color: 'oklch(0.60 0.02 250)', fontWeight: 400 }}>
                Verwaltung
              </p>
            </div>
          </div>
          {mobileOpen && (
            <button onClick={onMobileClose} className="lg:hidden p-1 rounded" style={{ color: 'oklch(0.60 0.02 250)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-xs font-500 uppercase tracking-widest" style={{ color: 'oklch(0.45 0.02 250)', fontSize: '0.65rem', fontWeight: 500 }}>
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onMobileClose?.();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth text-left',
                  'relative'
                )}
                style={
                  isActive
                    ? {
                        background: 'oklch(0.75 0.175 70 / 0.15)',
                        color: 'oklch(0.85 0.14 70)',
                        fontWeight: 600,
                      }
                    : {
                        color: 'oklch(0.70 0.02 250)',
                        fontWeight: 400,
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'oklch(0.22 0.04 255)';
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.85 0.01 250)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.color = 'oklch(0.70 0.02 250)';
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: 'oklch(0.75 0.175 70)' }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs" style={{ color: 'oklch(0.40 0.02 250)' }}>
            Kursverwaltung v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
