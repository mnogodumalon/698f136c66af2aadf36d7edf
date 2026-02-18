import type { LucideProps } from 'lucide-react';
import { BookOpen, Users, Euro, Building2 } from 'lucide-react';

interface KpiStripProps {
  kurseCount: number;
  teilnehmerCount: number;
  totalRevenue: number;
  raeumCount: number;
  anmeldungenCount: number;
  loading?: boolean;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  loading,
}: {
  icon: React.ComponentType<LucideProps>;
  label: string;
  value: string;
  sub?: string;
  accent: string;
  loading?: boolean;
}) {
  return (
    <div
      className="bg-card rounded-xl p-5 flex flex-col gap-3 transition-smooth"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '18' }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse w-16" />
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
        </div>
      ) : (
        <div>
          <p className="text-3xl font-700 tracking-tight" style={{ fontWeight: 700 }}>{value}</p>
          <p className="text-sm mt-0.5 text-muted-foreground">{label}</p>
          {sub && <p className="text-xs mt-1" style={{ color: accent }}>{sub}</p>}
        </div>
      )}
    </div>
  );
}

export function KpiStrip({
  kurseCount,
  teilnehmerCount,
  totalRevenue,
  raeumCount,
  anmeldungenCount,
  loading,
}: KpiStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={BookOpen}
        label="Aktive Kurse"
        value={loading ? '–' : String(kurseCount)}
        sub={`${anmeldungenCount} Anmeldungen`}
        accent="oklch(0.75 0.175 70)"
        loading={loading}
      />
      <KpiCard
        icon={Users}
        label="Teilnehmer"
        value={loading ? '–' : String(teilnehmerCount)}
        accent="oklch(0.65 0.12 185)"
        loading={loading}
      />
      <KpiCard
        icon={Euro}
        label="Gesamtumsatz"
        value={
          loading
            ? '–'
            : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
                totalRevenue
              )
        }
        accent="oklch(0.65 0.16 155)"
        loading={loading}
      />
      <KpiCard
        icon={Building2}
        label="Räume"
        value={loading ? '–' : String(raeumCount)}
        accent="oklch(0.55 0.18 270)"
        loading={loading}
      />
    </div>
  );
}
