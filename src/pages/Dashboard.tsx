import { useState, useEffect, useMemo } from 'react';
import type { Raeume, Dozenten, Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  BookOpen, Users, AlertCircle, Euro, Plus, Pencil, Trash2,
  Building2, GraduationCap, Calendar, RefreshCw, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDate(d: string | undefined | null): string {
  if (!d) return '–';
  try { return format(parseISO(d.split('T')[0]), 'dd.MM.yyyy', { locale: de }); } catch { return d; }
}

function formatCurrency(v: number | undefined | null): string {
  if (v == null) return '–';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Types ────────────────────────────────────────────────────────────────────

type DeleteTarget = { id: string; label: string; type: 'raum' | 'dozent' | 'kurs' | 'teilnehmer' | 'anmeldung' };

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function OccupancyBar({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (filled / total) * 100) : 0;
  const color = pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary';
  return (
    <div className="w-full">
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground mt-0.5 block text-right">{filled}/{total} Plätze</span>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  target, onCancel, onConfirm
}: { target: DeleteTarget | null; onCancel: () => void; onConfirm: (t: DeleteTarget) => Promise<void> }) {
  const [deleting, setDeleting] = useState(false);
  if (!target) return null;
  return (
    <AlertDialog open={!!target} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du „{target.label}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async (e) => {
              e.preventDefault();
              setDeleting(true);
              await onConfirm(target);
              setDeleting(false);
            }}
          >
            {deleting ? 'Löscht…' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Raum Dialog ──────────────────────────────────────────────────────────────

function RaumDialog({
  open, onOpenChange, record, onSuccess
}: { open: boolean; onOpenChange: (o: boolean) => void; record: Raeume | null; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({ raumname: '', gebaeude: '', kapazitaet: '' });

  useEffect(() => {
    if (open) setFields({
      raumname: record?.fields.raumname ?? '',
      gebaeude: record?.fields.gebaeude ?? '',
      kapazitaet: record?.fields.kapazitaet != null ? String(record.fields.kapazitaet) : '',
    });
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        raumname: fields.raumname || undefined,
        gebaeude: fields.gebaeude || undefined,
        kapazitaet: fields.kapazitaet ? Number(fields.kapazitaet) : undefined,
      };
      if (record) {
        await LivingAppsService.updateRaeumeEntry(record.record_id, data);
        toast.success('Raum gespeichert');
      } else {
        await LivingAppsService.createRaeumeEntry(data);
        toast.success('Raum erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{record ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="raumname">Raumname *</Label>
            <Input id="raumname" required value={fields.raumname} onChange={e => setFields(p => ({ ...p, raumname: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gebaeude">Gebäude</Label>
            <Input id="gebaeude" value={fields.gebaeude} onChange={e => setFields(p => ({ ...p, gebaeude: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kapazitaet">Kapazität</Label>
            <Input id="kapazitaet" type="number" min="0" value={fields.kapazitaet} onChange={e => setFields(p => ({ ...p, kapazitaet: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert…' : record ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dozent Dialog ─────────────────────────────────────────────────────────────

function DozentDialog({
  open, onOpenChange, record, onSuccess
}: { open: boolean; onOpenChange: (o: boolean) => void; record: Dozenten | null; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({ dozent_firstname: '', dozent_lastname: '', email: '', telefon: '', fachgebiet: '' });

  useEffect(() => {
    if (open) setFields({
      dozent_firstname: record?.fields.dozent_firstname ?? '',
      dozent_lastname: record?.fields.dozent_lastname ?? '',
      email: record?.fields.email ?? '',
      telefon: record?.fields.telefon ?? '',
      fachgebiet: record?.fields.fachgebiet ?? '',
    });
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        dozent_firstname: fields.dozent_firstname || undefined,
        dozent_lastname: fields.dozent_lastname || undefined,
        email: fields.email || undefined,
        telefon: fields.telefon || undefined,
        fachgebiet: fields.fachgebiet || undefined,
      };
      if (record) {
        await LivingAppsService.updateDozentenEntry(record.record_id, data);
        toast.success('Dozent gespeichert');
      } else {
        await LivingAppsService.createDozentenEntry(data);
        toast.success('Dozent erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{record ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-firstname">Vorname *</Label>
              <Input id="d-firstname" required value={fields.dozent_firstname} onChange={e => setFields(p => ({ ...p, dozent_firstname: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-lastname">Nachname *</Label>
              <Input id="d-lastname" required value={fields.dozent_lastname} onChange={e => setFields(p => ({ ...p, dozent_lastname: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-fach">Fachgebiet</Label>
            <Input id="d-fach" value={fields.fachgebiet} onChange={e => setFields(p => ({ ...p, fachgebiet: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-email">E-Mail</Label>
            <Input id="d-email" type="email" value={fields.email} onChange={e => setFields(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-tel">Telefon</Label>
            <Input id="d-tel" type="tel" value={fields.telefon} onChange={e => setFields(p => ({ ...p, telefon: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert…' : record ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Teilnehmer Dialog ─────────────────────────────────────────────────────────

function TeilnehmerDialog({
  open, onOpenChange, record, onSuccess
}: { open: boolean; onOpenChange: (o: boolean) => void; record: Teilnehmer | null; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({ teilnehmer_firstname: '', teilnehmer_lastname: '', email: '', telefon: '', geburtsdatum: '' });

  useEffect(() => {
    if (open) setFields({
      teilnehmer_firstname: record?.fields.teilnehmer_firstname ?? '',
      teilnehmer_lastname: record?.fields.teilnehmer_lastname ?? '',
      email: record?.fields.email ?? '',
      telefon: record?.fields.telefon ?? '',
      geburtsdatum: record?.fields.geburtsdatum?.split('T')[0] ?? '',
    });
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        teilnehmer_firstname: fields.teilnehmer_firstname || undefined,
        teilnehmer_lastname: fields.teilnehmer_lastname || undefined,
        email: fields.email || undefined,
        telefon: fields.telefon || undefined,
        geburtsdatum: fields.geburtsdatum || undefined,
      };
      if (record) {
        await LivingAppsService.updateTeilnehmerEntry(record.record_id, data);
        toast.success('Teilnehmer gespeichert');
      } else {
        await LivingAppsService.createTeilnehmerEntry(data);
        toast.success('Teilnehmer erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{record ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-fn">Vorname *</Label>
              <Input id="t-fn" required value={fields.teilnehmer_firstname} onChange={e => setFields(p => ({ ...p, teilnehmer_firstname: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-ln">Nachname *</Label>
              <Input id="t-ln" required value={fields.teilnehmer_lastname} onChange={e => setFields(p => ({ ...p, teilnehmer_lastname: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-email">E-Mail</Label>
            <Input id="t-email" type="email" value={fields.email} onChange={e => setFields(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-tel">Telefon</Label>
            <Input id="t-tel" type="tel" value={fields.telefon} onChange={e => setFields(p => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-geb">Geburtsdatum</Label>
            <Input id="t-geb" type="date" value={fields.geburtsdatum} onChange={e => setFields(p => ({ ...p, geburtsdatum: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert…' : record ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kurs Dialog ───────────────────────────────────────────────────────────────

function KursDialog({
  open, onOpenChange, record, raeume, dozenten, onSuccess
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  record: Kurse | null; raeume: Raeume[]; dozenten: Dozenten[]; onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({
    titel: '', beschreibung: '', startdatum: '', enddatum: '',
    max_teilnehmer: '', preis: '', raum_id: 'none', dozent_id: 'none'
  });

  useEffect(() => {
    if (open) {
      const raumId = extractRecordId(record?.fields.raum) ?? 'none';
      const dozentId = extractRecordId(record?.fields.dozent) ?? 'none';
      setFields({
        titel: record?.fields.titel ?? '',
        beschreibung: record?.fields.beschreibung ?? '',
        startdatum: record?.fields.startdatum?.split('T')[0] ?? '',
        enddatum: record?.fields.enddatum?.split('T')[0] ?? '',
        max_teilnehmer: record?.fields.max_teilnehmer != null ? String(record.fields.max_teilnehmer) : '',
        preis: record?.fields.preis != null ? String(record.fields.preis) : '',
        raum_id: raumId,
        dozent_id: dozentId,
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data: Kurse['fields'] = {
        titel: fields.titel || undefined,
        beschreibung: fields.beschreibung || undefined,
        startdatum: fields.startdatum || undefined,
        enddatum: fields.enddatum || undefined,
        max_teilnehmer: fields.max_teilnehmer ? Number(fields.max_teilnehmer) : undefined,
        preis: fields.preis ? Number(fields.preis) : undefined,
        raum: fields.raum_id !== 'none' ? createRecordUrl(APP_IDS.RAEUME, fields.raum_id) : undefined,
        dozent: fields.dozent_id !== 'none' ? createRecordUrl(APP_IDS.DOZENTEN, fields.dozent_id) : undefined,
      };
      if (record) {
        await LivingAppsService.updateKurseEntry(record.record_id, data);
        toast.success('Kurs gespeichert');
      } else {
        await LivingAppsService.createKurseEntry(data);
        toast.success('Kurs erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="k-titel">Kurstitel *</Label>
            <Input id="k-titel" required value={fields.titel} onChange={e => setFields(p => ({ ...p, titel: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="k-desc">Beschreibung</Label>
            <Textarea id="k-desc" rows={3} value={fields.beschreibung} onChange={e => setFields(p => ({ ...p, beschreibung: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="k-start">Startdatum</Label>
              <Input id="k-start" type="date" value={fields.startdatum} onChange={e => setFields(p => ({ ...p, startdatum: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-end">Enddatum</Label>
              <Input id="k-end" type="date" value={fields.enddatum} onChange={e => setFields(p => ({ ...p, enddatum: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="k-max">Max. Teilnehmer</Label>
              <Input id="k-max" type="number" min="0" value={fields.max_teilnehmer} onChange={e => setFields(p => ({ ...p, max_teilnehmer: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="k-preis">Preis (EUR)</Label>
              <Input id="k-preis" type="number" min="0" step="0.01" value={fields.preis} onChange={e => setFields(p => ({ ...p, preis: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dozent</Label>
            <Select value={fields.dozent_id} onValueChange={v => setFields(p => ({ ...p, dozent_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Dozent wählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Dozent</SelectItem>
                {dozenten.map(d => (
                  <SelectItem key={d.record_id} value={d.record_id}>
                    {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Raum</Label>
            <Select value={fields.raum_id} onValueChange={v => setFields(p => ({ ...p, raum_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Raum wählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {raeume.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.raumname}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert…' : record ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Anmeldung Dialog ──────────────────────────────────────────────────────────

function AnmeldungDialog({
  open, onOpenChange, record, kurse, teilnehmer, onSuccess
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  record: Anmeldungen | null; kurse: Kurse[]; teilnehmer: Teilnehmer[]; onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({
    teilnehmer_id: 'none', kurs_id: 'none', anmeldedatum: today(), bezahlt: false
  });

  useEffect(() => {
    if (open) setFields({
      teilnehmer_id: extractRecordId(record?.fields.teilnehmer) ?? 'none',
      kurs_id: extractRecordId(record?.fields.kurs) ?? 'none',
      anmeldedatum: record?.fields.anmeldedatum?.split('T')[0] ?? today(),
      bezahlt: record?.fields.bezahlt ?? false,
    });
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fields.teilnehmer_id === 'none' || fields.kurs_id === 'none') {
      toast.error('Bitte Teilnehmer und Kurs auswählen');
      return;
    }
    setSubmitting(true);
    try {
      const data: Anmeldungen['fields'] = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, fields.teilnehmer_id),
        kurs: createRecordUrl(APP_IDS.KURSE, fields.kurs_id),
        anmeldedatum: fields.anmeldedatum || undefined,
        bezahlt: fields.bezahlt,
      };
      if (record) {
        await LivingAppsService.updateAnmeldungenEntry(record.record_id, data);
        toast.success('Anmeldung gespeichert');
      } else {
        await LivingAppsService.createAnmeldungenEntry(data);
        toast.success('Anmeldung erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{record ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Teilnehmer *</Label>
            <Select value={fields.teilnehmer_id} onValueChange={v => setFields(p => ({ ...p, teilnehmer_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Teilnehmer wählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Teilnehmer wählen…</SelectItem>
                {teilnehmer.map(t => (
                  <SelectItem key={t.record_id} value={t.record_id}>
                    {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Kurs *</Label>
            <Select value={fields.kurs_id} onValueChange={v => setFields(p => ({ ...p, kurs_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Kurs wählen…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kurs wählen…</SelectItem>
                {kurse.map(k => (
                  <SelectItem key={k.record_id} value={k.record_id}>
                    {k.fields.titel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-datum">Anmeldedatum</Label>
            <Input id="a-datum" type="date" value={fields.anmeldedatum} onChange={e => setFields(p => ({ ...p, anmeldedatum: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="a-bezahlt"
              checked={fields.bezahlt}
              onCheckedChange={v => setFields(p => ({ ...p, bezahlt: v }))}
            />
            <Label htmlFor="a-bezahlt">Bezahlt</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert…' : record ? 'Speichern' : 'Anmelden'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  // Data
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [raumDialog, setRaumDialog] = useState<{ open: boolean; record: Raeume | null }>({ open: false, record: null });
  const [dozentDialog, setDozentDialog] = useState<{ open: boolean; record: Dozenten | null }>({ open: false, record: null });
  const [kursDialog, setKursDialog] = useState<{ open: boolean; record: Kurse | null }>({ open: false, record: null });
  const [teilnehmerDialog, setTeilnehmerDialog] = useState<{ open: boolean; record: Teilnehmer | null }>({ open: false, record: null });
  const [anmeldungDialog, setAnmeldungDialog] = useState<{ open: boolean; record: Anmeldungen | null }>({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Lookups
  const dozentMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach(d => m.set(d.record_id, d));
    return m;
  }, [dozenten]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach(t => m.set(t.record_id, t));
    return m;
  }, [teilnehmer]);

  const kursMap = useMemo(() => {
    const m = new Map<string, Kurse>();
    kurse.forEach(k => m.set(k.record_id, k));
    return m;
  }, [kurse]);

  const anmeldungenByKurs = useMemo(() => {
    const m = new Map<string, number>();
    anmeldungen.forEach(a => {
      const kid = extractRecordId(a.fields.kurs);
      if (kid) m.set(kid, (m.get(kid) ?? 0) + 1);
    });
    return m;
  }, [anmeldungen]);

  // Stats
  const stats = useMemo(() => {
    const offeneZahlungen = anmeldungen.filter(a => a.fields.bezahlt === false).length;
    let einnahmen = 0;
    anmeldungen.forEach(a => {
      if (a.fields.bezahlt) {
        const kid = extractRecordId(a.fields.kurs);
        if (kid) {
          const k = kursMap.get(kid);
          if (k?.fields.preis) einnahmen += k.fields.preis;
        }
      }
    });
    return { kurseCount: kurse.length, anmeldungenCount: anmeldungen.length, offeneZahlungen, einnahmen };
  }, [kurse, anmeldungen, kursMap]);

  // Chart data
  const chartData = useMemo(() => {
    return kurse
      .map(k => ({
        name: (k.fields.titel ?? 'Unbekannt').substring(0, 14),
        anmeldungen: anmeldungenByKurs.get(k.record_id) ?? 0,
      }))
      .filter(d => d.anmeldungen > 0)
      .sort((a, b) => b.anmeldungen - a.anmeldungen)
      .slice(0, 8);
  }, [kurse, anmeldungenByKurs]);

  // Recent registrations
  const recentAnmeldungen = useMemo(() => {
    return [...anmeldungen]
      .sort((a, b) => (b.fields.anmeldedatum ?? '').localeCompare(a.fields.anmeldedatum ?? ''))
      .slice(0, 10);
  }, [anmeldungen]);

  // Sorted lists
  const sortedKurse = useMemo(() =>
    [...kurse].sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? '')),
    [kurse]
  );
  const sortedTeilnehmer = useMemo(() =>
    [...teilnehmer].sort((a, b) => (a.fields.teilnehmer_lastname ?? '').localeCompare(b.fields.teilnehmer_lastname ?? '')),
    [teilnehmer]
  );
  const sortedDozenten = useMemo(() =>
    [...dozenten].sort((a, b) => (a.fields.dozent_lastname ?? '').localeCompare(b.fields.dozent_lastname ?? '')),
    [dozenten]
  );
  const sortedRaeume = useMemo(() =>
    [...raeume].sort((a, b) => (a.fields.raumname ?? '').localeCompare(b.fields.raumname ?? '')),
    [raeume]
  );
  const sortedAnmeldungen = useMemo(() =>
    [...anmeldungen].sort((a, b) => (b.fields.anmeldedatum ?? '').localeCompare(a.fields.anmeldedatum ?? '')),
    [anmeldungen]
  );

  // Fetch
  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [r, d, k, t, a] = await Promise.all([
        LivingAppsService.getRaeume(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getKurse(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getAnmeldungen(),
      ]);
      setRaeume(r);
      setDozenten(d);
      setKurse(k);
      setTeilnehmer(t);
      setAnmeldungen(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // Delete handler
  async function handleDelete(t: DeleteTarget) {
    try {
      if (t.type === 'raum') await LivingAppsService.deleteRaeumeEntry(t.id);
      else if (t.type === 'dozent') await LivingAppsService.deleteDozentenEntry(t.id);
      else if (t.type === 'kurs') await LivingAppsService.deleteKurseEntry(t.id);
      else if (t.type === 'teilnehmer') await LivingAppsService.deleteTeilnehmerEntry(t.id);
      else if (t.type === 'anmeldung') await LivingAppsService.deleteAnmeldungenEntry(t.id);
      toast.success(`„${t.label}" gelöscht`);
      setDeleteTarget(null);
      loadAll();
    } catch (err) {
      toast.error(`Fehler beim Löschen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    }
  }

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler beim Laden</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={loadAll}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Erneut versuchen
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-700 tracking-tight text-foreground font-semibold">Kursverwaltung</h1>
            <p className="text-xs text-muted-foreground hidden md:block">Kursplanung &amp; Verwaltung</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={loadAll} className="hidden md:flex" title="Aktualisieren">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="hidden md:flex gap-1.5"
              onClick={() => setAnmeldungDialog({ open: true, record: null })}
            >
              <Plus className="h-4 w-4" /> Neue Anmeldung
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-6 space-y-6">

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        {/* Mobile: horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:hidden snap-x snap-mandatory">
          {[
            { label: 'Aktive Kurse', value: stats.kurseCount, icon: BookOpen, color: 'text-primary' },
            { label: 'Anmeldungen', value: stats.anmeldungenCount, icon: Users, color: 'text-primary' },
            { label: 'Offene Zahlungen', value: stats.offeneZahlungen, icon: AlertCircle, color: stats.offeneZahlungen > 0 ? 'text-amber-500' : 'text-primary' },
            { label: 'Einnahmen', value: formatCurrency(stats.einnahmen), icon: Euro, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="flex-shrink-0 w-36 snap-start shadow-sm">
              <CardContent className="p-4">
                <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                <div className="text-2xl font-bold text-foreground leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop: 4-column stat grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Aktive Kurse</span>
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.kurseCount}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Anmeldungen gesamt</span>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.anmeldungenCount}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Offene Zahlungen</span>
                <AlertCircle className={`h-5 w-5 ${stats.offeneZahlungen > 0 ? 'text-amber-500' : 'text-primary'}`} />
              </div>
              <div className={`text-3xl font-bold ${stats.offeneZahlungen > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                {stats.offeneZahlungen}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">Einnahmen (bezahlt)</span>
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.einnahmen)}</div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Content: Desktop 2-column, Mobile single ─────────────── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left Column (main content) */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Kurse Section ───────────────────────────────────────── */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Alle Kurse</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setKursDialog({ open: true, record: null })}>
                    <Plus className="h-3.5 w-3.5" /> Neuer Kurs
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sortedKurse.length === 0 ? (
                  <div className="px-6 pb-6 text-center text-muted-foreground text-sm py-8">
                    Noch keine Kurse vorhanden.
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => setKursDialog({ open: true, record: null })}>
                        <Plus className="h-4 w-4 mr-1" /> Ersten Kurs anlegen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Desktop Table */}
                    <table className="w-full text-sm hidden md:table">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Kurstitel</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Dozent</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Zeitraum</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-32">Auslastung</th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Preis</th>
                          <th className="px-4 py-2.5 w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedKurse.map(k => {
                          const dozId = extractRecordId(k.fields.dozent);
                          const doz = dozId ? dozentMap.get(dozId) : null;
                          const filled = anmeldungenByKurs.get(k.record_id) ?? 0;
                          const max = k.fields.max_teilnehmer ?? 0;
                          return (
                            <tr key={k.record_id} className="border-b hover:bg-muted/30 transition-colors group">
                              <td className="px-4 py-3 font-medium">{k.fields.titel ?? '–'}</td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {doz ? `${doz.fields.dozent_firstname ?? ''} ${doz.fields.dozent_lastname ?? ''}`.trim() : '–'}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground text-xs">
                                {k.fields.startdatum ? formatDate(k.fields.startdatum) : '–'}
                                {k.fields.enddatum ? ` – ${formatDate(k.fields.enddatum)}` : ''}
                              </td>
                              <td className="px-4 py-3">
                                {max > 0 ? <OccupancyBar filled={filled} total={max} /> : <span className="text-muted-foreground text-xs">{filled} Anm.</span>}
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{k.fields.preis != null ? formatCurrency(k.fields.preis) : '–'}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setKursDialog({ open: true, record: k })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget({ id: k.record_id, label: k.fields.titel ?? 'Kurs', type: 'kurs' })}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {/* Mobile cards */}
                    <div className="md:hidden divide-y">
                      {sortedKurse.map(k => {
                        const dozId = extractRecordId(k.fields.dozent);
                        const doz = dozId ? dozentMap.get(dozId) : null;
                        const filled = anmeldungenByKurs.get(k.record_id) ?? 0;
                        const max = k.fields.max_teilnehmer ?? 0;
                        return (
                          <div key={k.record_id} className="px-4 py-3">
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-medium text-sm">{k.fields.titel ?? '–'}</div>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setKursDialog({ open: true, record: k })}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget({ id: k.record_id, label: k.fields.titel ?? 'Kurs', type: 'kurs' })}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                            {doz && <div className="text-xs text-muted-foreground mb-1">{doz.fields.dozent_firstname} {doz.fields.dozent_lastname}</div>}
                            {k.fields.startdatum && (
                              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(k.fields.startdatum)}{k.fields.enddatum ? ` – ${formatDate(k.fields.enddatum)}` : ''}
                              </div>
                            )}
                            {max > 0 && <OccupancyBar filled={filled} total={max} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Chart (desktop only) ─────────────────────────────────── */}
            {chartData.length > 0 && (
              <Card className="shadow-sm hidden md:block">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Anmeldungen pro Kurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215 15% 50%)' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(215 15% 50%)' }} axisLine={false} tickLine={false} width={25} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(214 20% 88%)', borderRadius: '8px', fontSize: 12 }}
                          labelStyle={{ color: 'hsl(215 25% 15%)', fontWeight: 600 }}
                          formatter={(v: number) => [v, 'Anmeldungen']}
                        />
                        <Bar dataKey="anmeldungen" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill="hsl(186 52% 32%)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Data Tabs ────────────────────────────────────────────── */}
            <Tabs defaultValue="anmeldungen">
              <TabsList className="mb-4 w-full md:w-auto">
                <TabsTrigger value="anmeldungen">Anmeldungen</TabsTrigger>
                <TabsTrigger value="teilnehmer">Teilnehmer</TabsTrigger>
                <TabsTrigger value="dozenten">Dozenten</TabsTrigger>
                <TabsTrigger value="raeume">Räume</TabsTrigger>
              </TabsList>

              {/* ── Anmeldungen Tab ───────────────────────────────────── */}
              <TabsContent value="anmeldungen">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Anmeldungen</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setAnmeldungDialog({ open: true, record: null })}>
                        <Plus className="h-3.5 w-3.5" /> Neue Anmeldung
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {sortedAnmeldungen.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                        Noch keine Anmeldungen.
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => setAnmeldungDialog({ open: true, record: null })}>
                            <Plus className="h-4 w-4 mr-1" /> Erste Anmeldung
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm hidden md:table">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Teilnehmer</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Kurs</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Anmeldedatum</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                              <th className="px-4 py-2.5 w-20"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedAnmeldungen.map(a => {
                              const tid = extractRecordId(a.fields.teilnehmer);
                              const kid = extractRecordId(a.fields.kurs);
                              const tn = tid ? teilnehmerMap.get(tid) : null;
                              const k = kid ? kursMap.get(kid) : null;
                              return (
                                <tr key={a.record_id} className="border-b hover:bg-muted/30 transition-colors group">
                                  <td className="px-4 py-3 font-medium">
                                    {tn ? `${tn.fields.teilnehmer_firstname ?? ''} ${tn.fields.teilnehmer_lastname ?? ''}`.trim() : '–'}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{k?.fields.titel ?? '–'}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.fields.anmeldedatum)}</td>
                                  <td className="px-4 py-3">
                                    {a.fields.bezahlt
                                      ? <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Bezahlt</Badge>
                                      : <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Ausstehend</Badge>
                                    }
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAnmeldungDialog({ open: true, record: a })}>
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          const tnName = tn ? `${tn.fields.teilnehmer_firstname ?? ''} ${tn.fields.teilnehmer_lastname ?? ''}`.trim() : 'Unbekannt';
                                          setDeleteTarget({ id: a.record_id, label: tnName, type: 'anmeldung' });
                                        }}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {/* Mobile cards */}
                        <div className="md:hidden divide-y">
                          {sortedAnmeldungen.map(a => {
                            const tid = extractRecordId(a.fields.teilnehmer);
                            const kid = extractRecordId(a.fields.kurs);
                            const tn = tid ? teilnehmerMap.get(tid) : null;
                            const k = kid ? kursMap.get(kid) : null;
                            return (
                              <div key={a.record_id} className="px-4 py-3 flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="font-medium text-sm">
                                    {tn ? `${tn.fields.teilnehmer_firstname ?? ''} ${tn.fields.teilnehmer_lastname ?? ''}`.trim() : '–'}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">{k?.fields.titel ?? '–'}</div>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-muted-foreground">{formatDate(a.fields.anmeldedatum)}</span>
                                    {a.fields.bezahlt
                                      ? <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs h-4 px-1">Bezahlt</Badge>
                                      : <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs h-4 px-1">Ausstehend</Badge>
                                    }
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAnmeldungDialog({ open: true, record: a })}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      const tnName = tn ? `${tn.fields.teilnehmer_firstname ?? ''} ${tn.fields.teilnehmer_lastname ?? ''}`.trim() : 'Unbekannt';
                                      setDeleteTarget({ id: a.record_id, label: tnName, type: 'anmeldung' });
                                    }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Teilnehmer Tab ────────────────────────────────────── */}
              <TabsContent value="teilnehmer">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Teilnehmer</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                        <Plus className="h-3.5 w-3.5" /> Neuer Teilnehmer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {sortedTeilnehmer.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                        Noch keine Teilnehmer.
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                            <Plus className="h-4 w-4 mr-1" /> Ersten Teilnehmer anlegen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm hidden md:table">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">E-Mail</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefon</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Geburtsdatum</th>
                              <th className="px-4 py-2.5 w-20"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedTeilnehmer.map(t => (
                              <tr key={t.record_id} className="border-b hover:bg-muted/30 transition-colors group">
                                <td className="px-4 py-3 font-medium">
                                  {`${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() || '–'}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{t.fields.email ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{t.fields.telefon ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(t.fields.geburtsdatum)}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTeilnehmerDialog({ open: true, record: t })}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteTarget({ id: t.record_id, label: `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim(), type: 'teilnehmer' })}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="md:hidden divide-y">
                          {sortedTeilnehmer.map(t => (
                            <div key={t.record_id} className="px-4 py-3 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium text-sm">{`${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() || '–'}</div>
                                {t.fields.email && <div className="text-xs text-muted-foreground mt-0.5">{t.fields.email}</div>}
                                {t.fields.telefon && <div className="text-xs text-muted-foreground">{t.fields.telefon}</div>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTeilnehmerDialog({ open: true, record: t })}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget({ id: t.record_id, label: `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim(), type: 'teilnehmer' })}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Dozenten Tab ──────────────────────────────────────── */}
              <TabsContent value="dozenten">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Dozenten</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setDozentDialog({ open: true, record: null })}>
                        <Plus className="h-3.5 w-3.5" /> Neuer Dozent
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {sortedDozenten.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                        Noch keine Dozenten.
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => setDozentDialog({ open: true, record: null })}>
                            <Plus className="h-4 w-4 mr-1" /> Ersten Dozenten anlegen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm hidden md:table">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Fachgebiet</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">E-Mail</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefon</th>
                              <th className="px-4 py-2.5 w-20"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedDozenten.map(d => (
                              <tr key={d.record_id} className="border-b hover:bg-muted/30 transition-colors group">
                                <td className="px-4 py-3 font-medium">
                                  {`${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim() || '–'}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{d.fields.fachgebiet ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{d.fields.email ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{d.fields.telefon ?? '–'}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDozentDialog({ open: true, record: d })}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteTarget({ id: d.record_id, label: `${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim(), type: 'dozent' })}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="md:hidden divide-y">
                          {sortedDozenten.map(d => (
                            <div key={d.record_id} className="px-4 py-3 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium text-sm">{`${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim() || '–'}</div>
                                {d.fields.fachgebiet && <div className="text-xs text-muted-foreground mt-0.5">{d.fields.fachgebiet}</div>}
                                {d.fields.email && <div className="text-xs text-muted-foreground">{d.fields.email}</div>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDozentDialog({ open: true, record: d })}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget({ id: d.record_id, label: `${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim(), type: 'dozent' })}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Räume Tab ─────────────────────────────────────────── */}
              <TabsContent value="raeume">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Räume</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setRaumDialog({ open: true, record: null })}>
                        <Plus className="h-3.5 w-3.5" /> Neuer Raum
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {sortedRaeume.length === 0 ? (
                      <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                        Noch keine Räume.
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => setRaumDialog({ open: true, record: null })}>
                            <Plus className="h-4 w-4 mr-1" /> Ersten Raum anlegen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm hidden md:table">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Raumname</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Gebäude</th>
                              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Kapazität</th>
                              <th className="px-4 py-2.5 w-20"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedRaeume.map(r => (
                              <tr key={r.record_id} className="border-b hover:bg-muted/30 transition-colors group">
                                <td className="px-4 py-3 font-medium">{r.fields.raumname ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{r.fields.gebaeude ?? '–'}</td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {r.fields.kapazitaet != null ? (
                                    <Badge variant="secondary" className="text-xs font-medium">{r.fields.kapazitaet} Plätze</Badge>
                                  ) : '–'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRaumDialog({ open: true, record: r })}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteTarget({ id: r.record_id, label: r.fields.raumname ?? 'Raum', type: 'raum' })}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="md:hidden divide-y">
                          {sortedRaeume.map(r => (
                            <div key={r.record_id} className="px-4 py-3 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium text-sm flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  {r.fields.raumname ?? '–'}
                                </div>
                                {r.fields.gebaeude && <div className="text-xs text-muted-foreground mt-0.5">{r.fields.gebaeude}</div>}
                                {r.fields.kapazitaet != null && (
                                  <Badge variant="secondary" className="mt-1 text-xs">{r.fields.kapazitaet} Plätze</Badge>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRaumDialog({ open: true, record: r })}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteTarget({ id: r.record_id, label: r.fields.raumname ?? 'Raum', type: 'raum' })}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>

          {/* Right Column (desktop sidebar) */}
          <div className="hidden md:flex flex-col gap-6 w-80 flex-shrink-0">

            {/* Recent Anmeldungen */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Letzte Anmeldungen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentAnmeldungen.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">Noch keine Anmeldungen</div>
                ) : (
                  <div className="divide-y">
                    {recentAnmeldungen.map(a => {
                      const tid = extractRecordId(a.fields.teilnehmer);
                      const kid = extractRecordId(a.fields.kurs);
                      const tn = tid ? teilnehmerMap.get(tid) : null;
                      const k = kid ? kursMap.get(kid) : null;
                      const initials = tn
                        ? `${(tn.fields.teilnehmer_firstname ?? '?')[0]}${(tn.fields.teilnehmer_lastname ?? '?')[0]}`.toUpperCase()
                        : '?';
                      return (
                        <div key={a.record_id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {tn ? `${tn.fields.teilnehmer_firstname ?? ''} ${tn.fields.teilnehmer_lastname ?? ''}`.trim() : '–'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{k?.fields.titel ?? '–'}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">{formatDate(a.fields.anmeldedatum)}</span>
                            {a.fields.bezahlt
                              ? <span className="text-xs text-green-600 font-medium">Bezahlt</span>
                              : <span className="text-xs text-amber-600 font-medium">Offen</span>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Räume Übersicht */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Räume Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sortedRaeume.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">Noch keine Räume erfasst</div>
                ) : (
                  <div className="divide-y">
                    {sortedRaeume.map(r => (
                      <div key={r.record_id} className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="text-sm font-medium">{r.fields.raumname ?? '–'}</div>
                          {r.fields.gebaeude && <div className="text-xs text-muted-foreground">{r.fields.gebaeude}</div>}
                        </div>
                        {r.fields.kapazitaet != null && (
                          <Badge variant="secondary" className="text-xs">{r.fields.kapazitaet}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* ── Mobile FAB ──────────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button
          size="lg"
          className="rounded-full px-6 shadow-lg gap-2"
          onClick={() => setAnmeldungDialog({ open: true, record: null })}
        >
          <Plus className="h-5 w-5" /> Neue Anmeldung
        </Button>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <RaumDialog open={raumDialog.open} onOpenChange={o => setRaumDialog(p => ({ ...p, open: o }))} record={raumDialog.record} onSuccess={loadAll} />
      <DozentDialog open={dozentDialog.open} onOpenChange={o => setDozentDialog(p => ({ ...p, open: o }))} record={dozentDialog.record} onSuccess={loadAll} />
      <KursDialog open={kursDialog.open} onOpenChange={o => setKursDialog(p => ({ ...p, open: o }))} record={kursDialog.record} raeume={raeume} dozenten={dozenten} onSuccess={loadAll} />
      <TeilnehmerDialog open={teilnehmerDialog.open} onOpenChange={o => setTeilnehmerDialog(p => ({ ...p, open: o }))} record={teilnehmerDialog.record} onSuccess={loadAll} />
      <AnmeldungDialog open={anmeldungDialog.open} onOpenChange={o => setAnmeldungDialog(p => ({ ...p, open: o }))} record={anmeldungDialog.record} kurse={kurse} teilnehmer={teilnehmer} onSuccess={loadAll} />
      <DeleteConfirm target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />

    </div>
  );
}
