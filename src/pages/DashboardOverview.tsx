import { useDashboardData } from '@/hooks/useDashboardData';
import { StatCard } from '@/components/StatCard';
import { PageShell } from '@/components/PageShell';
import { IconBook, IconUsers, IconSchool, IconDoor } from '@tabler/icons-react';

export default function DashboardOverview() {
  const { kurse, teilnehmer, dozenten, raeume, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PageShell title="Dashboard" subtitle="Übersicht aller Stammdaten">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Kurse"
          value={kurse.length}
          description="Kurse im System"
          icon={<IconBook className="h-5 w-5 text-muted-foreground" stroke={1.5} />}
        />
        <StatCard
          title="Teilnehmer"
          value={teilnehmer.length}
          description="Registrierte Teilnehmer"
          icon={<IconUsers className="h-5 w-5 text-muted-foreground" stroke={1.5} />}
        />
        <StatCard
          title="Dozenten"
          value={dozenten.length}
          description="Aktive Dozenten"
          icon={<IconSchool className="h-5 w-5 text-muted-foreground" stroke={1.5} />}
        />
        <StatCard
          title="Räume"
          value={raeume.length}
          description="Verfügbare Räume"
          icon={<IconDoor className="h-5 w-5 text-muted-foreground" stroke={1.5} />}
        />
      </div>
    </PageShell>
  );
}
