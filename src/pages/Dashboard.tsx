import { useState, useEffect, useMemo } from 'react';
import type { Raeume, Dozenten, Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  BookOpen, GraduationCap, DoorOpen, Users, Euro,
  Plus, Pencil, Trash2, AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ─── Utility functions ───────────────────────────────────────────────

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '–';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '–';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

function relativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '–';
  try {
    return formatDistance(parseISO(dateStr.split('T')[0]), new Date(), { addSuffix: true, locale: de });
  } catch {
    return dateStr;
  }
}

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ─── Progress Ring SVG ───────────────────────────────────────────────

function ProgressRing({ percent, size = 160, stroke = 6 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="hsl(40 15% 90%)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="hsl(178 45% 30%)" strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700 ease-out" />
    </svg>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────

function DeleteConfirmDialog({ open, onOpenChange, name, onConfirm }: {
  open: boolean; onOpenChange: (o: boolean) => void; name: string; onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      toast.success(`"${name}" wurde gelöscht.`);
      onOpenChange(false);
    } catch {
      toast.error('Eintrag konnte nicht gelöscht werden.');
    } finally {
      setDeleting(false);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du &quot;{name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90">
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Räume CRUD Dialog ───────────────────────────────────────────────

function RaeumeDialog({ open, onOpenChange, record, onSuccess }: {
  open: boolean; onOpenChange: (o: boolean) => void; record?: Raeume | null; onSuccess: () => void;
}) {
  const isEdit = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ raumname: '', gebaeude: '', kapazitaet: '' });

  useEffect(() => {
    if (open) {
      setForm({
        raumname: record?.fields.raumname ?? '',
        gebaeude: record?.fields.gebaeude ?? '',
        kapazitaet: record?.fields.kapazitaet?.toString() ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fields = {
      raumname: form.raumname,
      gebaeude: form.gebaeude,
      kapazitaet: form.kapazitaet ? Number(form.kapazitaet) : undefined,
    };
    try {
      if (isEdit) {
        await LivingAppsService.updateRaeumeEntry(record!.record_id, fields);
        toast.success('Raum aktualisiert.');
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
        toast.success('Raum erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEdit ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raumname">Raumname</Label>
            <Input id="raumname" value={form.raumname} onChange={e => setForm(p => ({ ...p, raumname: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gebaeude">Gebäude</Label>
            <Input id="gebaeude" value={form.gebaeude} onChange={e => setForm(p => ({ ...p, gebaeude: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Kapazität</Label>
            <Input id="kapazitaet" type="number" value={form.kapazitaet} onChange={e => setForm(p => ({ ...p, kapazitaet: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : (isEdit ? 'Speichern' : 'Erstellen')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dozenten CRUD Dialog ────────────────────────────────────────────

function DozentenDialog({ open, onOpenChange, record, onSuccess }: {
  open: boolean; onOpenChange: (o: boolean) => void; record?: Dozenten | null; onSuccess: () => void;
}) {
  const isEdit = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ dozent_firstname: '', dozent_lastname: '', email: '', telefon: '', fachgebiet: '' });

  useEffect(() => {
    if (open) {
      setForm({
        dozent_firstname: record?.fields.dozent_firstname ?? '',
        dozent_lastname: record?.fields.dozent_lastname ?? '',
        email: record?.fields.email ?? '',
        telefon: record?.fields.telefon ?? '',
        fachgebiet: record?.fields.fachgebiet ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await LivingAppsService.updateDozentenEntry(record!.record_id, form);
        toast.success('Dozent aktualisiert.');
      } else {
        await LivingAppsService.createDozentenEntry(form);
        toast.success('Dozent erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEdit ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="d_fn">Vorname</Label>
              <Input id="d_fn" value={form.dozent_firstname} onChange={e => setForm(p => ({ ...p, dozent_firstname: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d_ln">Nachname</Label>
              <Input id="d_ln" value={form.dozent_lastname} onChange={e => setForm(p => ({ ...p, dozent_lastname: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_email">E-Mail</Label>
            <Input id="d_email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_tel">Telefon</Label>
            <Input id="d_tel" type="tel" value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_fg">Fachgebiet</Label>
            <Input id="d_fg" value={form.fachgebiet} onChange={e => setForm(p => ({ ...p, fachgebiet: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : (isEdit ? 'Speichern' : 'Erstellen')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kurse CRUD Dialog ───────────────────────────────────────────────

function KurseDialog({ open, onOpenChange, record, onSuccess, raeume, dozenten }: {
  open: boolean; onOpenChange: (o: boolean) => void; record?: Kurse | null; onSuccess: () => void;
  raeume: Raeume[]; dozenten: Dozenten[];
}) {
  const isEdit = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titel: '', beschreibung: '', startdatum: '', enddatum: '',
    max_teilnehmer: '', preis: '', raum: 'none', dozent: 'none',
  });

  useEffect(() => {
    if (open) {
      setForm({
        titel: record?.fields.titel ?? '',
        beschreibung: record?.fields.beschreibung ?? '',
        startdatum: record?.fields.startdatum?.split('T')[0] ?? '',
        enddatum: record?.fields.enddatum?.split('T')[0] ?? '',
        max_teilnehmer: record?.fields.max_teilnehmer?.toString() ?? '',
        preis: record?.fields.preis?.toString() ?? '',
        raum: extractRecordId(record?.fields.raum) ?? 'none',
        dozent: extractRecordId(record?.fields.dozent) ?? 'none',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fields: Kurse['fields'] = {
      titel: form.titel,
      beschreibung: form.beschreibung || undefined,
      startdatum: form.startdatum || undefined,
      enddatum: form.enddatum || undefined,
      max_teilnehmer: form.max_teilnehmer ? Number(form.max_teilnehmer) : undefined,
      preis: form.preis ? Number(form.preis) : undefined,
      raum: form.raum !== 'none' ? createRecordUrl(APP_IDS.RAEUME, form.raum) : undefined,
      dozent: form.dozent !== 'none' ? createRecordUrl(APP_IDS.DOZENTEN, form.dozent) : undefined,
    };
    try {
      if (isEdit) {
        await LivingAppsService.updateKurseEntry(record!.record_id, fields);
        toast.success('Kurs aktualisiert.');
      } else {
        await LivingAppsService.createKurseEntry(fields);
        toast.success('Kurs erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEdit ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="k_titel">Kurstitel</Label>
            <Input id="k_titel" value={form.titel} onChange={e => setForm(p => ({ ...p, titel: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="k_beschr">Beschreibung</Label>
            <Textarea id="k_beschr" value={form.beschreibung} onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k_start">Startdatum</Label>
              <Input id="k_start" type="date" value={form.startdatum} onChange={e => setForm(p => ({ ...p, startdatum: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k_end">Enddatum</Label>
              <Input id="k_end" type="date" value={form.enddatum} onChange={e => setForm(p => ({ ...p, enddatum: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k_max">Max. Teilnehmer</Label>
              <Input id="k_max" type="number" value={form.max_teilnehmer} onChange={e => setForm(p => ({ ...p, max_teilnehmer: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k_preis">Preis (EUR)</Label>
              <Input id="k_preis" type="number" step="0.01" value={form.preis} onChange={e => setForm(p => ({ ...p, preis: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Raum</Label>
            <Select value={form.raum} onValueChange={v => setForm(p => ({ ...p, raum: v }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Raum wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {raeume.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.raumname ?? 'Unbenannt'}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dozent</Label>
            <Select value={form.dozent} onValueChange={v => setForm(p => ({ ...p, dozent: v }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Dozent wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Dozent</SelectItem>
                {dozenten.map(d => (
                  <SelectItem key={d.record_id} value={d.record_id}>
                    {d.fields.dozent_firstname ?? ''} {d.fields.dozent_lastname ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : (isEdit ? 'Speichern' : 'Erstellen')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Teilnehmer CRUD Dialog ─────────────────────────────────────────

function TeilnehmerDialog({ open, onOpenChange, record, onSuccess }: {
  open: boolean; onOpenChange: (o: boolean) => void; record?: Teilnehmer | null; onSuccess: () => void;
}) {
  const isEdit = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ teilnehmer_firstname: '', teilnehmer_lastname: '', email: '', telefon: '', geburtsdatum: '' });

  useEffect(() => {
    if (open) {
      setForm({
        teilnehmer_firstname: record?.fields.teilnehmer_firstname ?? '',
        teilnehmer_lastname: record?.fields.teilnehmer_lastname ?? '',
        email: record?.fields.email ?? '',
        telefon: record?.fields.telefon ?? '',
        geburtsdatum: record?.fields.geburtsdatum?.split('T')[0] ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const fields: Teilnehmer['fields'] = {
      teilnehmer_firstname: form.teilnehmer_firstname,
      teilnehmer_lastname: form.teilnehmer_lastname,
      email: form.email || undefined,
      telefon: form.telefon || undefined,
      geburtsdatum: form.geburtsdatum || undefined,
    };
    try {
      if (isEdit) {
        await LivingAppsService.updateTeilnehmerEntry(record!.record_id, fields);
        toast.success('Teilnehmer aktualisiert.');
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
        toast.success('Teilnehmer erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEdit ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t_fn">Vorname</Label>
              <Input id="t_fn" value={form.teilnehmer_firstname} onChange={e => setForm(p => ({ ...p, teilnehmer_firstname: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_ln">Nachname</Label>
              <Input id="t_ln" value={form.teilnehmer_lastname} onChange={e => setForm(p => ({ ...p, teilnehmer_lastname: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_email">E-Mail</Label>
            <Input id="t_email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_tel">Telefon</Label>
            <Input id="t_tel" type="tel" value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_geb">Geburtsdatum</Label>
            <Input id="t_geb" type="date" value={form.geburtsdatum} onChange={e => setForm(p => ({ ...p, geburtsdatum: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : (isEdit ? 'Speichern' : 'Erstellen')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Anmeldungen CRUD Dialog ─────────────────────────────────────────

function AnmeldungenDialog({ open, onOpenChange, record, onSuccess, teilnehmer, kurse }: {
  open: boolean; onOpenChange: (o: boolean) => void; record?: Anmeldungen | null; onSuccess: () => void;
  teilnehmer: Teilnehmer[]; kurse: Kurse[];
}) {
  const isEdit = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ teilnehmer: 'none', kurs: 'none', anmeldedatum: '', bezahlt: false });

  useEffect(() => {
    if (open) {
      setForm({
        teilnehmer: extractRecordId(record?.fields.teilnehmer) ?? 'none',
        kurs: extractRecordId(record?.fields.kurs) ?? 'none',
        anmeldedatum: record?.fields.anmeldedatum?.split('T')[0] ?? todayStr(),
        bezahlt: record?.fields.bezahlt ?? false,
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.teilnehmer === 'none' || form.kurs === 'none') {
      toast.error('Bitte Teilnehmer und Kurs auswählen.');
      return;
    }
    setSubmitting(true);
    const fields: Anmeldungen['fields'] = {
      teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, form.teilnehmer),
      kurs: createRecordUrl(APP_IDS.KURSE, form.kurs),
      anmeldedatum: form.anmeldedatum || undefined,
      bezahlt: form.bezahlt,
    };
    try {
      if (isEdit) {
        await LivingAppsService.updateAnmeldungenEntry(record!.record_id, fields);
        toast.success('Anmeldung aktualisiert.');
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
        toast.success('Anmeldung erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEdit ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Teilnehmer</Label>
            <Select value={form.teilnehmer} onValueChange={v => setForm(p => ({ ...p, teilnehmer: v }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Teilnehmer wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">– Bitte wählen –</SelectItem>
                {teilnehmer.map(t => (
                  <SelectItem key={t.record_id} value={t.record_id}>
                    {t.fields.teilnehmer_firstname ?? ''} {t.fields.teilnehmer_lastname ?? ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kurs</Label>
            <Select value={form.kurs} onValueChange={v => setForm(p => ({ ...p, kurs: v }))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Kurs wählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">– Bitte wählen –</SelectItem>
                {kurse.map(k => (
                  <SelectItem key={k.record_id} value={k.record_id}>
                    {k.fields.titel ?? 'Unbenannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a_datum">Anmeldedatum</Label>
            <Input id="a_datum" type="date" value={form.anmeldedatum} onChange={e => setForm(p => ({ ...p, anmeldedatum: e.target.value }))} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="a_bezahlt" checked={form.bezahlt}
              onCheckedChange={c => setForm(p => ({ ...p, bezahlt: c === true }))} />
            <Label htmlFor="a_bezahlt">Bezahlt</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : (isEdit ? 'Speichern' : 'Erstellen')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading State ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold">Fehler beim Laden</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  // ─── State ─────────────────────────────────────────────────────────
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // CRUD dialog state
  const [raeumeDialog, setRaeumeDialog] = useState<{ open: boolean; record: Raeume | null }>({ open: false, record: null });
  const [dozentenDialog, setDozentenDialog] = useState<{ open: boolean; record: Dozenten | null }>({ open: false, record: null });
  const [kurseDialog, setKurseDialog] = useState<{ open: boolean; record: Kurse | null }>({ open: false, record: null });
  const [teilnehmerDialog, setTeilnehmerDialog] = useState<{ open: boolean; record: Teilnehmer | null }>({ open: false, record: null });
  const [anmeldungenDialog, setAnmeldungenDialog] = useState<{ open: boolean; record: Anmeldungen | null }>({ open: false, record: null });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; name: string; onConfirm: () => Promise<void> }>({
    open: false, name: '', onConfirm: async () => {},
  });

  // ─── Data Fetching ─────────────────────────────────────────────────

  async function fetchAll() {
    try {
      setLoading(true);
      setError(null);
      const [r, d, k, t, a] = await Promise.all([
        LivingAppsService.getRaeume(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getKurse(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getAnmeldungen(),
      ]);
      setRaeume(r); setDozenten(d); setKurse(k); setTeilnehmer(t); setAnmeldungen(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  // Refresh helpers
  const refreshRaeume = async () => { setRaeume(await LivingAppsService.getRaeume()); };
  const refreshDozenten = async () => { setDozenten(await LivingAppsService.getDozenten()); };
  const refreshKurse = async () => { setKurse(await LivingAppsService.getKurse()); };
  const refreshTeilnehmer = async () => { setTeilnehmer(await LivingAppsService.getTeilnehmer()); };
  const refreshAnmeldungen = async () => { setAnmeldungen(await LivingAppsService.getAnmeldungen()); };

  // ─── Derived Data ──────────────────────────────────────────────────

  const dozentMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach(d => m.set(d.record_id, d));
    return m;
  }, [dozenten]);

  const raumMap = useMemo(() => {
    const m = new Map<string, Raeume>();
    raeume.forEach(r => m.set(r.record_id, r));
    return m;
  }, [raeume]);

  const kursMap = useMemo(() => {
    const m = new Map<string, Kurse>();
    kurse.forEach(k => m.set(k.record_id, k));
    return m;
  }, [kurse]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach(t => m.set(t.record_id, t));
    return m;
  }, [teilnehmer]);

  // Registrations per course
  const regPerKurs = useMemo(() => {
    const counts = new Map<string, number>();
    anmeldungen.forEach(a => {
      const kId = extractRecordId(a.fields.kurs);
      if (!kId) return;
      counts.set(kId, (counts.get(kId) ?? 0) + 1);
    });
    return counts;
  }, [anmeldungen]);

  // Stats
  const totalAnmeldungen = anmeldungen.length;
  const bezahlt = anmeldungen.filter(a => a.fields.bezahlt === true).length;
  const offen = totalAnmeldungen - bezahlt;

  // Average utilization
  const utilization = useMemo(() => {
    let totalReg = 0;
    let totalMax = 0;
    kurse.forEach(k => {
      const max = k.fields.max_teilnehmer;
      if (max && max > 0) {
        const count = regPerKurs.get(k.record_id) ?? 0;
        totalReg += count;
        totalMax += max;
      }
    });
    return totalMax > 0 ? Math.round((totalReg / totalMax) * 100) : 0;
  }, [kurse, regPerKurs]);

  // Revenue
  const gesamtUmsatz = useMemo(() => {
    let total = 0;
    anmeldungen.forEach(a => {
      if (a.fields.bezahlt !== true) return;
      const kId = extractRecordId(a.fields.kurs);
      if (!kId) return;
      const kurs = kursMap.get(kId);
      total += kurs?.fields.preis ?? 0;
    });
    return total;
  }, [anmeldungen, kursMap]);

  // Chart data: registrations per course (top 10)
  const chartData = useMemo(() => {
    return kurse
      .map(k => ({
        name: k.fields.titel ?? 'Unbenannt',
        count: regPerKurs.get(k.record_id) ?? 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [kurse, regPerKurs]);

  // Recent registrations (top 5)
  const recentAnmeldungen = useMemo(() => {
    return [...anmeldungen]
      .sort((a, b) => (b.fields.anmeldedatum ?? b.createdat).localeCompare(a.fields.anmeldedatum ?? a.createdat))
      .slice(0, 5);
  }, [anmeldungen]);

  // ─── Delete handlers ───────────────────────────────────────────────

  function confirmDeleteRaum(r: Raeume) {
    setDeleteDialog({
      open: true,
      name: `Raum "${r.fields.raumname ?? 'Unbenannt'}"`,
      onConfirm: async () => { await LivingAppsService.deleteRaeumeEntry(r.record_id); await refreshRaeume(); },
    });
  }
  function confirmDeleteDozent(d: Dozenten) {
    setDeleteDialog({
      open: true,
      name: `Dozent "${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}"`,
      onConfirm: async () => { await LivingAppsService.deleteDozentenEntry(d.record_id); await refreshDozenten(); },
    });
  }
  function confirmDeleteKurs(k: Kurse) {
    setDeleteDialog({
      open: true,
      name: `Kurs "${k.fields.titel ?? 'Unbenannt'}"`,
      onConfirm: async () => { await LivingAppsService.deleteKurseEntry(k.record_id); await refreshKurse(); },
    });
  }
  function confirmDeleteTeilnehmer(t: Teilnehmer) {
    setDeleteDialog({
      open: true,
      name: `Teilnehmer "${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}"`,
      onConfirm: async () => { await LivingAppsService.deleteTeilnehmerEntry(t.record_id); await refreshTeilnehmer(); },
    });
  }
  function confirmDeleteAnmeldung(a: Anmeldungen) {
    const tId = extractRecordId(a.fields.teilnehmer);
    const kId = extractRecordId(a.fields.kurs);
    const tName = tId ? `${teilnehmerMap.get(tId)?.fields.teilnehmer_firstname ?? ''} ${teilnehmerMap.get(tId)?.fields.teilnehmer_lastname ?? ''}`.trim() : 'Unbekannt';
    const kName = kId ? kursMap.get(kId)?.fields.titel ?? 'Unbekannt' : 'Unbekannt';
    setDeleteDialog({
      open: true,
      name: `Anmeldung von "${tName}" für "${kName}"`,
      onConfirm: async () => { await LivingAppsService.deleteAnmeldungenEntry(a.record_id); await refreshAnmeldungen(); },
    });
  }

  // ─── Render ────────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchAll} />;

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kursverwaltung</h1>
          <Button onClick={() => setAnmeldungenDialog({ open: true, record: null })} className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" /> Neue Anmeldung
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── Hero + Stats Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Hero KPI */}
          <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <ProgressRing percent={utilization} size={160} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{totalAnmeldungen}</span>
                  <span className="text-sm font-medium text-muted-foreground">Anmeldungen</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{utilization}% Kursauslastung</p>
              <div className="flex gap-3">
                <Badge className="bg-[hsl(152_50%_38%)] text-white border-0">{bezahlt} bezahlt</Badge>
                <Badge className="bg-[hsl(40_70%_55%)] text-white border-0">{offen} offen</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { label: 'Aktive Kurse', value: kurse.length, icon: BookOpen },
              { label: 'Dozenten', value: dozenten.length, icon: GraduationCap },
              { label: 'Räume', value: raeume.length, icon: DoorOpen },
              { label: 'Teilnehmer', value: teilnehmer.length, icon: Users },
              { label: 'Gesamtumsatz', value: formatCurrency(gesamtUmsatz), icon: Euro },
            ].map(s => (
              <Card key={s.label} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                    <p className="text-lg font-bold tracking-tight">{s.value}</p>
                  </div>
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── Chart + Recent Registrations ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-3 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Anmeldungen pro Kurs</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Noch keine Kurse vorhanden.</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(210 10% 50%)" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(210 10% 50%)" width={120} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(0 0% 100%)', border: '1px solid hsl(40 15% 90%)', borderRadius: '8px' }}
                        formatter={(value: number) => [`${value} Anmeldungen`, '']}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={`hsl(178 45% ${30 + i * 4}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Letzte Anmeldungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAnmeldungen.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Anmeldungen.</p>
              ) : (
                recentAnmeldungen.map(a => {
                  const tId = extractRecordId(a.fields.teilnehmer);
                  const kId = extractRecordId(a.fields.kurs);
                  const t = tId ? teilnehmerMap.get(tId) : null;
                  const k = kId ? kursMap.get(kId) : null;
                  return (
                    <div key={a.record_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => setAnmeldungenDialog({ open: true, record: a })}>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${a.fields.bezahlt ? 'bg-[hsl(152_50%_38%)]' : 'bg-[hsl(40_70%_55%)]'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {t ? `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() : 'Unbekannt'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{k?.fields.titel ?? 'Unbekannt'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {relativeDate(a.fields.anmeldedatum ?? a.createdat)}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Data Management Tabs ──────────────────────────────── */}
        <Tabs defaultValue="kurse" className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="kurse">Kurse</TabsTrigger>
            <TabsTrigger value="dozenten">Dozenten</TabsTrigger>
            <TabsTrigger value="raeume">Räume</TabsTrigger>
            <TabsTrigger value="teilnehmer">Teilnehmer</TabsTrigger>
            <TabsTrigger value="anmeldungen">Anmeldungen</TabsTrigger>
          </TabsList>

          {/* ── Kurse Tab ────────────────────────────────────────── */}
          <TabsContent value="kurse">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Kurse</CardTitle>
                <Button size="sm" onClick={() => setKurseDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {kurse.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">Noch keine Kurse vorhanden.</p>
                    <Button variant="outline" onClick={() => setKurseDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Kurs erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kurstitel</TableHead>
                          <TableHead className="hidden sm:table-cell">Dozent</TableHead>
                          <TableHead className="hidden md:table-cell">Zeitraum</TableHead>
                          <TableHead>Plätze</TableHead>
                          <TableHead className="hidden sm:table-cell">Preis</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kurse.map(k => {
                          const dId = extractRecordId(k.fields.dozent);
                          const doz = dId ? dozentMap.get(dId) : null;
                          const regs = regPerKurs.get(k.record_id) ?? 0;
                          const max = k.fields.max_teilnehmer ?? 0;
                          const fillPct = max > 0 ? Math.min((regs / max) * 100, 100) : 0;
                          return (
                            <TableRow key={k.record_id} className="group hover:bg-muted/50 cursor-pointer"
                              onClick={() => setKurseDialog({ open: true, record: k })}>
                              <TableCell className="font-medium">{k.fields.titel ?? '–'}</TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground">
                                {doz ? `${doz.fields.dozent_firstname ?? ''} ${doz.fields.dozent_lastname ?? ''}`.trim() : '–'}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {k.fields.startdatum ? formatDate(k.fields.startdatum) : '–'} – {k.fields.enddatum ? formatDate(k.fields.enddatum) : '–'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fillPct}%` }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{regs}/{max || '∞'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground">{formatCurrency(k.fields.preis)}</TableCell>
                              <TableCell>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={e => { e.stopPropagation(); setKurseDialog({ open: true, record: k }); }}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={e => { e.stopPropagation(); confirmDeleteKurs(k); }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Dozenten Tab ─────────────────────────────────────── */}
          <TabsContent value="dozenten">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Dozenten</CardTitle>
                <Button size="sm" onClick={() => setDozentenDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {dozenten.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">Noch keine Dozenten vorhanden.</p>
                    <Button variant="outline" onClick={() => setDozentenDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Dozenten hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead className="hidden sm:table-cell">E-Mail</TableHead>
                          <TableHead className="hidden md:table-cell">Fachgebiet</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dozenten.map(d => (
                          <TableRow key={d.record_id} className="group hover:bg-muted/50 cursor-pointer"
                            onClick={() => setDozentenDialog({ open: true, record: d })}>
                            <TableCell className="font-medium">{d.fields.dozent_firstname ?? '–'}</TableCell>
                            <TableCell>{d.fields.dozent_lastname ?? '–'}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{d.fields.email ?? '–'}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{d.fields.fachgebiet ?? '–'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={e => { e.stopPropagation(); setDozentenDialog({ open: true, record: d }); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={e => { e.stopPropagation(); confirmDeleteDozent(d); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Räume Tab ────────────────────────────────────────── */}
          <TabsContent value="raeume">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Räume</CardTitle>
                <Button size="sm" onClick={() => setRaeumeDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {raeume.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">Noch keine Räume vorhanden.</p>
                    <Button variant="outline" onClick={() => setRaeumeDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Raum hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raumname</TableHead>
                          <TableHead>Gebäude</TableHead>
                          <TableHead>Kapazität</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {raeume.map(r => (
                          <TableRow key={r.record_id} className="group hover:bg-muted/50 cursor-pointer"
                            onClick={() => setRaeumeDialog({ open: true, record: r })}>
                            <TableCell className="font-medium">{r.fields.raumname ?? '–'}</TableCell>
                            <TableCell className="text-muted-foreground">{r.fields.gebaeude ?? '–'}</TableCell>
                            <TableCell className="text-muted-foreground">{r.fields.kapazitaet ?? '–'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={e => { e.stopPropagation(); setRaeumeDialog({ open: true, record: r }); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={e => { e.stopPropagation(); confirmDeleteRaum(r); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Teilnehmer Tab ───────────────────────────────────── */}
          <TabsContent value="teilnehmer">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Teilnehmer</CardTitle>
                <Button size="sm" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {teilnehmer.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">Noch keine Teilnehmer vorhanden.</p>
                    <Button variant="outline" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Teilnehmer hinzufügen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead className="hidden sm:table-cell">E-Mail</TableHead>
                          <TableHead className="hidden md:table-cell">Geburtsdatum</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teilnehmer.map(t => (
                          <TableRow key={t.record_id} className="group hover:bg-muted/50 cursor-pointer"
                            onClick={() => setTeilnehmerDialog({ open: true, record: t })}>
                            <TableCell className="font-medium">{t.fields.teilnehmer_firstname ?? '–'}</TableCell>
                            <TableCell>{t.fields.teilnehmer_lastname ?? '–'}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{t.fields.email ?? '–'}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(t.fields.geburtsdatum)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                  onClick={e => { e.stopPropagation(); setTeilnehmerDialog({ open: true, record: t }); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={e => { e.stopPropagation(); confirmDeleteTeilnehmer(t); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Anmeldungen Tab ──────────────────────────────────── */}
          <TabsContent value="anmeldungen">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Anmeldungen</CardTitle>
                <Button size="sm" onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {anmeldungen.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-sm text-muted-foreground">Noch keine Anmeldungen vorhanden.</p>
                    <Button variant="outline" onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Erste Anmeldung erstellen
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teilnehmer</TableHead>
                          <TableHead>Kurs</TableHead>
                          <TableHead className="hidden sm:table-cell">Datum</TableHead>
                          <TableHead>Bezahlt</TableHead>
                          <TableHead className="w-[80px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...anmeldungen]
                          .sort((a, b) => (b.fields.anmeldedatum ?? b.createdat).localeCompare(a.fields.anmeldedatum ?? a.createdat))
                          .map(a => {
                            const tId = extractRecordId(a.fields.teilnehmer);
                            const kId = extractRecordId(a.fields.kurs);
                            const t = tId ? teilnehmerMap.get(tId) : null;
                            const k = kId ? kursMap.get(kId) : null;
                            return (
                              <TableRow key={a.record_id} className="group hover:bg-muted/50 cursor-pointer"
                                onClick={() => setAnmeldungenDialog({ open: true, record: a })}>
                                <TableCell className="font-medium">
                                  {t ? `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() : '–'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{k?.fields.titel ?? '–'}</TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(a.fields.anmeldedatum)}</TableCell>
                                <TableCell>
                                  {a.fields.bezahlt ? (
                                    <Badge className="bg-[hsl(152_50%_38%)] text-white border-0 text-xs">Bezahlt</Badge>
                                  ) : (
                                    <Badge className="bg-[hsl(40_70%_55%)] text-white border-0 text-xs">Offen</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                      onClick={e => { e.stopPropagation(); setAnmeldungenDialog({ open: true, record: a }); }}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={e => { e.stopPropagation(); confirmDeleteAnmeldung(a); }}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ─── Mobile Fixed Bottom Action ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border sm:hidden z-30">
        <Button className="w-full h-[52px] text-base font-semibold"
          onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
          <Plus className="h-5 w-5 mr-2" /> Neue Anmeldung
        </Button>
      </div>

      {/* ─── Spacer for mobile bottom bar ────────────────────────── */}
      <div className="h-20 sm:hidden" />

      {/* ─── CRUD Dialogs ────────────────────────────────────────── */}
      <RaeumeDialog
        open={raeumeDialog.open}
        onOpenChange={o => setRaeumeDialog(p => ({ ...p, open: o }))}
        record={raeumeDialog.record}
        onSuccess={refreshRaeume}
      />
      <DozentenDialog
        open={dozentenDialog.open}
        onOpenChange={o => setDozentenDialog(p => ({ ...p, open: o }))}
        record={dozentenDialog.record}
        onSuccess={refreshDozenten}
      />
      <KurseDialog
        open={kurseDialog.open}
        onOpenChange={o => setKurseDialog(p => ({ ...p, open: o }))}
        record={kurseDialog.record}
        onSuccess={refreshKurse}
        raeume={raeume}
        dozenten={dozenten}
      />
      <TeilnehmerDialog
        open={teilnehmerDialog.open}
        onOpenChange={o => setTeilnehmerDialog(p => ({ ...p, open: o }))}
        record={teilnehmerDialog.record}
        onSuccess={refreshTeilnehmer}
      />
      <AnmeldungenDialog
        open={anmeldungenDialog.open}
        onOpenChange={o => setAnmeldungenDialog(p => ({ ...p, open: o }))}
        record={anmeldungenDialog.record}
        onSuccess={refreshAnmeldungen}
        teilnehmer={teilnehmer}
        kurse={kurse}
      />
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={o => setDeleteDialog(p => ({ ...p, open: o }))}
        name={deleteDialog.name}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}
