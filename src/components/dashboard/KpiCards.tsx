import { BookOpen, Users, ClipboardList, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  variant?: 'primary' | 'accent' | 'amber' | 'rose';
  loading?: boolean;
}

function KpiCard({ label, value, sub, icon: Icon, variant = 'primary', loading }: KpiCardProps) {
  const variants = {
    primary: {
      icon: 'bg-primary-light text-primary',
      value: 'text-foreground',
    },
    accent: {
      icon: 'bg-accent-light text-accent',
      value: 'text-foreground',
    },
    amber: {
      icon: 'bg-amber-light text-amber',
      value: 'text-foreground',
    },
    rose: {
      icon: 'bg-destructive-light text-destructive',
      value: 'text-foreground',
    },
  };

  const v = variants[variant];

  return (
    <div className="card-surface card-surface-hover p-5 flex items-start gap-4 border border-border">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', v.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-muted rounded-md animate-pulse" />
        ) : (
          <p className={cn('text-2xl font-800 leading-none', v.value)}>{value}</p>
        )}
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

interface KpiCardsProps {
  totalKurse: number;
  totalTeilnehmer: number;
  totalAnmeldungen: number;
  offeneZahlungen: number;
  loading?: boolean;
}

export function KpiCards({ totalKurse, totalTeilnehmer, totalAnmeldungen, offeneZahlungen, loading }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Aktive Kurse"
        value={totalKurse}
        sub="Kurse gesamt"
        icon={BookOpen}
        variant="primary"
        loading={loading}
      />
      <KpiCard
        label="Teilnehmer"
        value={totalTeilnehmer}
        sub="Registriert"
        icon={Users}
        variant="accent"
        loading={loading}
      />
      <KpiCard
        label="Anmeldungen"
        value={totalAnmeldungen}
        sub="Gesamt"
        icon={ClipboardList}
        variant="amber"
        loading={loading}
      />
      <KpiCard
        label="Offene Zahlungen"
        value={offeneZahlungen}
        sub="Ausstehend"
        icon={AlertCircle}
        variant="rose"
        loading={loading}
      />
    </div>
  );
}
