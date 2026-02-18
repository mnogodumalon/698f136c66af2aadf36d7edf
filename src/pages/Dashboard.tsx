import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, type Section } from '@/components/dashboard/Sidebar';
import { KpiStrip } from '@/components/dashboard/KpiStrip';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { KurseSection } from '@/components/dashboard/KurseSection';
import { AnmeldungenSection } from '@/components/dashboard/AnmeldungenSection';
import { TeilnehmerSection } from '@/components/dashboard/TeilnehmerSection';
import { DozentSection } from '@/components/dashboard/DozentSection';
import { RaeumeSection } from '@/components/dashboard/RaeumeSection';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Kurse, Anmeldungen, Teilnehmer, Raeume } from '@/types/app';

const sectionTitles: Record<Section, string> = {
  overview: 'Übersicht',
  kurse: 'Kurse',
  anmeldungen: 'Anmeldungen',
  teilnehmer: 'Teilnehmer',
  dozenten: 'Dozenten',
  raeume: 'Räume',
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global data for KPI strip and overview
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  const loadGlobal = async () => {
    try {
      setGlobalLoading(true);
      const [k, a, t, r] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getRaeume(),
      ]);
      setKurse(k);
      setAnmeldungen(a);
      setTeilnehmer(t);
      setRaeume(r);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => { loadGlobal(); }, []);

  // Refresh global data when section changes back to overview
  useEffect(() => {
    if (activeSection === 'overview') loadGlobal();
  }, [activeSection]);

  const totalRevenue = kurse.reduce((sum, k) => {
    const paid = anmeldungen.filter(
      (a) => a.fields.kurs?.includes(k.record_id) && a.fields.bezahlt
    ).length;
    return sum + (k.fields.preis ?? 0) * paid;
  }, 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card flex-shrink-0"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <button
            className="lg:hidden p-2 rounded-lg transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-700 truncate" style={{ fontWeight: 700 }}>
              {sectionTitles[activeSection]}
            </h1>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI strip — always shown */}
          <KpiStrip
            kurseCount={kurse.length}
            teilnehmerCount={teilnehmer.length}
            totalRevenue={totalRevenue}
            raeumCount={raeume.length}
            anmeldungenCount={anmeldungen.length}
            loading={globalLoading}
          />

          {/* Section content */}
          {activeSection === 'overview' && (
            <OverviewSection
              kurse={kurse}
              anmeldungen={anmeldungen}
              teilnehmer={teilnehmer}
              loading={globalLoading}
            />
          )}
          {activeSection === 'kurse' && <KurseSection />}
          {activeSection === 'anmeldungen' && <AnmeldungenSection />}
          {activeSection === 'teilnehmer' && <TeilnehmerSection />}
          {activeSection === 'dozenten' && <DozentSection />}
          {activeSection === 'raeume' && <RaeumeSection />}
        </main>
      </div>
    </div>
  );
}
