import { useState, useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AppSidebar, MobileNav } from '@/components/dashboard/AppSidebar';
import type { ActiveSection } from '@/components/dashboard/AppSidebar';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { KurseSection } from '@/components/dashboard/KurseSection';
import { TeilnehmerSection } from '@/components/dashboard/TeilnehmerSection';
import { DozentenSection } from '@/components/dashboard/DozentenSection';
import { RaeumeSection } from '@/components/dashboard/RaeumeSection';
import { AnmeldungenSection } from '@/components/dashboard/AnmeldungenSection';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Dozenten, Raeume, Teilnehmer, Anmeldungen } from '@/types/app';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, r, t, a] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getAnmeldungen(),
      ]);
      setKurse(k);
      setDozenten(d);
      setRaeume(r);
      setTeilnehmer(t);
      setAnmeldungen(a);
    } catch (err) {
      toast.error('Fehler beim Laden der Daten. Bitte Seite neu laden.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const renderSection = () => {
    if (loading && activeSection === 'overview') {
      return (
        <div className="space-y-6">
          <div className="h-36 rounded-2xl bg-muted animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            kurse={kurse}
            teilnehmer={teilnehmer}
            anmeldungen={anmeldungen}
            loading={loading}
            onNavigate={setActiveSection}
          />
        );
      case 'kurse':
        return (
          <KurseSection
            kurse={kurse}
            dozenten={dozenten}
            raeume={raeume}
            onRefresh={loadAll}
          />
        );
      case 'teilnehmer':
        return (
          <TeilnehmerSection
            teilnehmer={teilnehmer}
            onRefresh={loadAll}
          />
        );
      case 'dozenten':
        return (
          <DozentenSection
            dozenten={dozenten}
            onRefresh={loadAll}
          />
        );
      case 'raeume':
        return (
          <RaeumeSection
            raeume={raeume}
            onRefresh={loadAll}
          />
        );
      case 'anmeldungen':
        return (
          <AnmeldungenSection
            anmeldungen={anmeldungen}
            kurse={kurse}
            teilnehmer={teilnehmer}
            onRefresh={loadAll}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar active={activeSection} onNavigate={setActiveSection} />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center shrink-0">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-primary-foreground">
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          </div>
          <h1 className="font-800 text-foreground text-sm">Kursverwaltung</h1>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-5xl">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeSection}>
            {renderSection()}
          </div>
        </div>
      </main>

      <MobileNav active={activeSection} onNavigate={setActiveSection} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
