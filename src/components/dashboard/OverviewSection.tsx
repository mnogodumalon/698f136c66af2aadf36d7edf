import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { extractRecordId } from '@/services/livingAppsService';
import type { Kurse, Anmeldungen, Teilnehmer } from '@/types/app';

interface OverviewSectionProps {
  kurse: Kurse[];
  anmeldungen: Anmeldungen[];
  teilnehmer: Teilnehmer[];
  loading: boolean;
}

export function OverviewSection({ kurse, anmeldungen, teilnehmer, loading }: OverviewSectionProps) {
  // Enrollment per course
  const enrollmentData = kurse.map((k) => {
    const count = anmeldungen.filter((a) => extractRecordId(a.fields.kurs) === k.record_id).length;
    const paid = anmeldungen.filter((a) => extractRecordId(a.fields.kurs) === k.record_id && a.fields.bezahlt).length;
    return {
      name: k.fields.titel ? k.fields.titel.slice(0, 18) + (k.fields.titel.length > 18 ? '…' : '') : '—',
      anmeldungen: count,
      bezahlt: paid,
      max: k.fields.max_teilnehmer ?? 0,
    };
  });

  // Revenue per course
  const revenueData = kurse
    .filter((k) => k.fields.preis != null)
    .map((k) => {
      const paidCount = anmeldungen.filter(
        (a) => extractRecordId(a.fields.kurs) === k.record_id && a.fields.bezahlt
      ).length;
      return {
        name: k.fields.titel ? k.fields.titel.slice(0, 18) + (k.fields.titel.length > 18 ? '…' : '') : '—',
        umsatz: (k.fields.preis ?? 0) * paidCount,
      };
    })
    .sort((a, b) => b.umsatz - a.umsatz)
    .slice(0, 6);

  // Recent registrations
  const recent = [...anmeldungen]
    .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
    .slice(0, 5);

  const getKursTitel = (url?: string) => {
    const id = extractRecordId(url);
    return kurse.find((k) => k.record_id === id)?.fields.titel ?? '—';
  };

  const getTeilnehmerName = (url?: string) => {
    const id = extractRecordId(url);
    const t = teilnehmer.find((t) => t.record_id === id);
    if (!t) return '—';
    return `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() || '—';
  };

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'dd. MMM', { locale: de }); }
    catch { return d; }
  };

  const amber = 'oklch(0.75 0.175 70)';
  const teal = 'oklch(0.65 0.12 185)';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 h-64 animate-pulse" style={{ boxShadow: 'var(--shadow-card)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Übersicht</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Aktuelle Kursstatistiken auf einen Blick</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment chart */}
        {enrollmentData.length > 0 && (
          <div className="bg-card rounded-xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-sm font-600 mb-4" style={{ fontWeight: 600 }}>Anmeldungen pro Kurs</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={enrollmentData} barSize={20} margin={{ left: -20, right: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 250)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 250)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.90 0.008 250)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                  formatter={(value: number, name: string) => [value, name === 'anmeldungen' ? 'Anmeldungen' : 'Bezahlt']}
                />
                <Bar dataKey="anmeldungen" fill={amber} radius={[4, 4, 0, 0]} />
                <Bar dataKey="bezahlt" fill={teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: amber }} />
                <span className="text-xs text-muted-foreground">Anmeldungen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: teal }} />
                <span className="text-xs text-muted-foreground">Bezahlt</span>
              </div>
            </div>
          </div>
        )}

        {/* Revenue chart */}
        {revenueData.length > 0 && (
          <div className="bg-card rounded-xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h3 className="text-sm font-600 mb-4" style={{ fontWeight: 600 }}>Umsatz (bezahlte Anmeldungen)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={20} layout="vertical" margin={{ left: 0, right: 8 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 250)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 250)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.90 0.008 250)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                  formatter={(value: number) => [new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value), 'Umsatz']}
                />
                <Bar dataKey="umsatz" radius={[0, 4, 4, 0]}>
                  {revenueData.map((_, i) => (
                    <Cell key={i} fill={`oklch(0.65 0.16 ${155 - i * 15})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {enrollmentData.length === 0 && revenueData.length === 0 && (
          <div className="lg:col-span-2 bg-card rounded-xl p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
            <p className="text-muted-foreground">Noch keine Daten vorhanden. Lege Kurse und Anmeldungen an, um die Statistiken zu sehen.</p>
          </div>
        )}
      </div>

      {/* Recent registrations */}
      {recent.length > 0 && (
        <div className="bg-card rounded-xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-sm font-600 mb-4" style={{ fontWeight: 600 }}>Neueste Anmeldungen</h3>
          <div className="space-y-0">
            {recent.map((a, i) => (
              <div
                key={a.record_id}
                className={`flex items-center justify-between py-3 transition-smooth ${i < recent.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                    style={{ background: 'oklch(0.75 0.175 70 / 0.12)', color: 'oklch(0.50 0.14 70)', fontWeight: 700 }}
                  >
                    {getTeilnehmerName(a.fields.teilnehmer).split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-500" style={{ fontWeight: 500 }}>{getTeilnehmerName(a.fields.teilnehmer)}</p>
                    <p className="text-xs text-muted-foreground">{getKursTitel(a.fields.kurs)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs text-muted-foreground">{formatDate(a.createdat)}</p>
                  <span
                    className="text-xs font-600 mt-0.5 inline-block"
                    style={
                      a.fields.bezahlt
                        ? { color: 'oklch(0.42 0.13 155)', fontWeight: 600 }
                        : { color: 'oklch(0.50 0.18 15)', fontWeight: 600 }
                    }
                  >
                    {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
