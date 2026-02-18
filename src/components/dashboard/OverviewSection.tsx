import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { BookOpen, Users, ClipboardList, TrendingUp, Calendar, Euro, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KpiCards } from './KpiCards';
import type { Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import type { ActiveSection } from './AppSidebar';

interface OverviewSectionProps {
  kurse: Kurse[];
  teilnehmer: Teilnehmer[];
  anmeldungen: Anmeldungen[];
  loading: boolean;
  onNavigate: (section: ActiveSection) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '–';
  try { return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: de }); } catch { return dateStr; }
}

export function OverviewSection({ kurse, teilnehmer, anmeldungen, loading, onNavigate }: OverviewSectionProps) {
  const offeneZahlungen = anmeldungen.filter(a => !a.fields.bezahlt).length;
  const today = new Date();
  const in30days = addDays(today, 30);

  // Upcoming courses (starting in next 30 days or currently running)
  const upcomingKurse = kurse
    .filter(k => {
      if (!k.fields.startdatum) return false;
      try {
        const start = parseISO(k.fields.startdatum);
        const end = k.fields.enddatum ? parseISO(k.fields.enddatum) : null;
        // Either starting soon or currently running
        return (isAfter(start, today) && isBefore(start, in30days)) ||
               (isBefore(start, today) && (!end || isAfter(end, today)));
      } catch { return false; }
    })
    .slice(0, 5);

  // Chart data: enrollments per course (top 6)
  const chartData = kurse
    .map(k => {
      const count = anmeldungen.filter(a => {
        const id = a.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1];
        return id === k.record_id;
      }).length;
      return {
        name: (k.fields.titel ?? 'Kurs').substring(0, 18),
        anmeldungen: count,
      };
    })
    .filter(d => d.anmeldungen > 0)
    .sort((a, b) => b.anmeldungen - a.anmeldungen)
    .slice(0, 6);

  // Recent enrollments
  const recentAnmeldungen = [...anmeldungen]
    .sort((a, b) => {
      const da = a.fields.anmeldedatum ?? a.createdat;
      const db = b.fields.anmeldedatum ?? b.createdat;
      return db.localeCompare(da);
    })
    .slice(0, 5);

  const getTeilnehmerName = (a: Anmeldungen) => {
    const id = a.fields.teilnehmer?.match(/([a-f0-9]{24})$/i)?.[1];
    const t = teilnehmer.find(t => t.record_id === id);
    return t ? `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() : '–';
  };

  const getKursName = (a: Anmeldungen) => {
    const id = a.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1];
    const k = kurse.find(k => k.record_id === id);
    return k?.fields.titel ?? '–';
  };

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-sm font-600 opacity-80 mb-1">Kursverwaltung</p>
          <h1 className="text-2xl font-800 mb-1">Übersicht</h1>
          <p className="text-sm opacity-75">
            {format(today, "EEEE, dd. MMMM yyyy", { locale: de })}
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-700">{loading ? '–' : kurse.length} Kurse</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-700">{loading ? '–' : teilnehmer.length} Teilnehmer</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <ClipboardList className="w-4 h-4" />
              <span className="text-sm font-700">{loading ? '–' : anmeldungen.length} Anmeldungen</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards
        totalKurse={kurse.length}
        totalTeilnehmer={teilnehmer.length}
        totalAnmeldungen={anmeldungen.length}
        offeneZahlungen={offeneZahlungen}
        loading={loading}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card-surface border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-700 text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Anmeldungen pro Kurs
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'hsl(222 15% 52%)' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'hsl(222 15% 52%)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(0 0% 100%)',
                    border: '1px solid hsl(220 20% 91%)',
                    borderRadius: '8px',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="anmeldungen" fill="hsl(220 62% 44%)" radius={[4, 4, 0, 0]} name="Anmeldungen" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Upcoming courses */}
        <div className="card-surface border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-700 text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Aktuelle Kurse
            </h2>
            <button
              onClick={() => onNavigate('kurse')}
              className="text-xs text-primary font-600 flex items-center gap-1 hover:opacity-80 transition-smooth"
            >
              Alle <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {upcomingKurse.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Keine Kurse in den nächsten 30 Tagen</p>
              <button onClick={() => onNavigate('kurse')} className="text-xs text-primary font-600 mt-2 hover:opacity-80 transition-smooth">
                Kurse anzeigen →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingKurse.map((k) => {
                const enrolled = anmeldungen.filter(a => a.fields.kurs?.includes(k.record_id)).length;
                const max = k.fields.max_teilnehmer ?? 0;
                const pct = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 0;
                const barColor = pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-amber' : 'bg-accent';

                return (
                  <div key={k.record_id} className="p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-smooth">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-600 text-foreground leading-tight truncate">{k.fields.titel}</p>
                      {k.fields.preis != null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                          <Euro className="w-3 h-3" />{k.fields.preis.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{formatDate(k.fields.startdatum)} – {formatDate(k.fields.enddatum)}</span>
                      {max > 0 && <span className="font-600">{enrolled}/{max}</span>}
                    </div>
                    {max > 0 && (
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent enrollments */}
        {recentAnmeldungen.length > 0 && (
          <div className="card-surface border border-border p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-700 text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                Letzte Anmeldungen
              </h2>
              <button
                onClick={() => onNavigate('anmeldungen')}
                className="text-xs text-primary font-600 flex items-center gap-1 hover:opacity-80 transition-smooth"
              >
                Alle <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentAnmeldungen.map((a) => (
                <div key={a.record_id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <div className="min-w-0">
                    <p className="text-sm font-600 text-foreground truncate">{getTeilnehmerName(a)}</p>
                    <p className="text-xs text-muted-foreground truncate">{getKursName(a)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(a.fields.anmeldedatum)}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-700 ${
                      a.fields.bezahlt ? 'bg-accent-light text-accent' : 'bg-destructive-light text-destructive'
                    }`}>
                      {a.fields.bezahlt ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
