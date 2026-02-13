import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Raeume, Dozenten, Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  AlertCircle,
  Users,
  RefreshCw,
} from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';

// ─── Helpers ───────────────────────────────────────────────

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '–';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '–';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ─── Delete Confirmation Dialog ────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  recordName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recordName: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      toast.success(`"${recordName}" wurde gelöscht.`);
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
            Möchtest du &quot;{recordName}&quot; wirklich löschen? Diese Aktion kann nicht
            rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Räume CRUD Dialog ─────────────────────────────────────

function RaeumeDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Raeume | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [raumname, setRaumname] = useState('');
  const [gebaeude, setGebaeude] = useState('');
  const [kapazitaet, setKapazitaet] = useState('');

  useEffect(() => {
    if (open) {
      setRaumname(record?.fields.raumname ?? '');
      setGebaeude(record?.fields.gebaeude ?? '');
      setKapazitaet(record?.fields.kapazitaet?.toString() ?? '');
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Raeume['fields'] = {
        raumname,
        gebaeude: gebaeude || undefined,
        kapazitaet: kapazitaet ? Number(kapazitaet) : undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateRaeumeEntry(record!.record_id, fields);
        toast.success('Raum wurde aktualisiert.');
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
        toast.success('Raum wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raumname">Raumname *</Label>
            <Input id="raumname" value={raumname} onChange={e => setRaumname(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gebaeude">Gebäude</Label>
            <Input id="gebaeude" value={gebaeude} onChange={e => setGebaeude(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Kapazität</Label>
            <Input id="kapazitaet" type="number" min={0} value={kapazitaet} onChange={e => setKapazitaet(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dozenten CRUD Dialog ──────────────────────────────────

function DozentenDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Dozenten | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [fachgebiet, setFachgebiet] = useState('');

  useEffect(() => {
    if (open) {
      setFirstname(record?.fields.dozent_firstname ?? '');
      setLastname(record?.fields.dozent_lastname ?? '');
      setEmail(record?.fields.email ?? '');
      setTelefon(record?.fields.telefon ?? '');
      setFachgebiet(record?.fields.fachgebiet ?? '');
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Dozenten['fields'] = {
        dozent_firstname: firstname,
        dozent_lastname: lastname,
        email: email || undefined,
        telefon: telefon || undefined,
        fachgebiet: fachgebiet || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateDozentenEntry(record!.record_id, fields);
        toast.success('Dozent wurde aktualisiert.');
      } else {
        await LivingAppsService.createDozentenEntry(fields);
        toast.success('Dozent wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="d-firstname">Vorname *</Label>
              <Input id="d-firstname" value={firstname} onChange={e => setFirstname(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-lastname">Nachname *</Label>
              <Input id="d-lastname" value={lastname} onChange={e => setLastname(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-email">E-Mail</Label>
            <Input id="d-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-telefon">Telefon</Label>
            <Input id="d-telefon" type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d-fachgebiet">Fachgebiet</Label>
            <Input id="d-fachgebiet" value={fachgebiet} onChange={e => setFachgebiet(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kurse CRUD Dialog ─────────────────────────────────────

function KurseDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  raeume,
  dozenten,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Kurse | null;
  onSuccess: () => void;
  raeume: Raeume[];
  dozenten: Dozenten[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [titel, setTitel] = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [startdatum, setStartdatum] = useState('');
  const [enddatum, setEnddatum] = useState('');
  const [maxTeilnehmer, setMaxTeilnehmer] = useState('');
  const [preis, setPreis] = useState('');
  const [raumId, setRaumId] = useState('');
  const [dozentId, setDozentId] = useState('');

  useEffect(() => {
    if (open) {
      setTitel(record?.fields.titel ?? '');
      setBeschreibung(record?.fields.beschreibung ?? '');
      setStartdatum(record?.fields.startdatum?.split('T')[0] ?? '');
      setEnddatum(record?.fields.enddatum?.split('T')[0] ?? '');
      setMaxTeilnehmer(record?.fields.max_teilnehmer?.toString() ?? '');
      setPreis(record?.fields.preis?.toString() ?? '');
      setRaumId(extractRecordId(record?.fields.raum) ?? '');
      setDozentId(extractRecordId(record?.fields.dozent) ?? '');
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Kurse['fields'] = {
        titel,
        beschreibung: beschreibung || undefined,
        startdatum: startdatum || undefined,
        enddatum: enddatum || undefined,
        max_teilnehmer: maxTeilnehmer ? Number(maxTeilnehmer) : undefined,
        preis: preis ? Number(preis) : undefined,
        raum: raumId && raumId !== 'none' ? createRecordUrl(APP_IDS.RAEUME, raumId) : undefined,
        dozent: dozentId && dozentId !== 'none' ? createRecordUrl(APP_IDS.DOZENTEN, dozentId) : undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateKurseEntry(record!.record_id, fields);
        toast.success('Kurs wurde aktualisiert.');
      } else {
        await LivingAppsService.createKurseEntry(fields);
        toast.success('Kurs wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="k-titel">Kurstitel *</Label>
            <Input id="k-titel" value={titel} onChange={e => setTitel(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="k-beschreibung">Beschreibung</Label>
            <Textarea id="k-beschreibung" value={beschreibung} onChange={e => setBeschreibung(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k-start">Startdatum</Label>
              <Input id="k-start" type="date" value={startdatum} onChange={e => setStartdatum(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k-end">Enddatum</Label>
              <Input id="k-end" type="date" value={enddatum} onChange={e => setEnddatum(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k-max">Max. Teilnehmer</Label>
              <Input id="k-max" type="number" min={0} value={maxTeilnehmer} onChange={e => setMaxTeilnehmer(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k-preis">Preis (EUR)</Label>
              <Input id="k-preis" type="number" min={0} step={0.01} value={preis} onChange={e => setPreis(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Raum</Label>
            <Select value={raumId || 'none'} onValueChange={v => setRaumId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Raum auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {raeume.map(r => (
                  <SelectItem key={r.record_id} value={r.record_id}>{r.fields.raumname ?? '–'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dozent</Label>
            <Select value={dozentId || 'none'} onValueChange={v => setDozentId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Dozent auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Dozent</SelectItem>
                {dozenten.map(d => (
                  <SelectItem key={d.record_id} value={d.record_id}>
                    {[d.fields.dozent_firstname, d.fields.dozent_lastname].filter(Boolean).join(' ') || '–'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Teilnehmer CRUD Dialog ────────────────────────────────

function TeilnehmerDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Teilnehmer | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState('');

  useEffect(() => {
    if (open) {
      setFirstname(record?.fields.teilnehmer_firstname ?? '');
      setLastname(record?.fields.teilnehmer_lastname ?? '');
      setEmail(record?.fields.email ?? '');
      setTelefon(record?.fields.telefon ?? '');
      setGeburtsdatum(record?.fields.geburtsdatum?.split('T')[0] ?? '');
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Teilnehmer['fields'] = {
        teilnehmer_firstname: firstname,
        teilnehmer_lastname: lastname,
        email: email || undefined,
        telefon: telefon || undefined,
        geburtsdatum: geburtsdatum || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateTeilnehmerEntry(record!.record_id, fields);
        toast.success('Teilnehmer wurde aktualisiert.');
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
        toast.success('Teilnehmer wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t-firstname">Vorname *</Label>
              <Input id="t-firstname" value={firstname} onChange={e => setFirstname(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-lastname">Nachname *</Label>
              <Input id="t-lastname" value={lastname} onChange={e => setLastname(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-email">E-Mail</Label>
            <Input id="t-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-telefon">Telefon</Label>
            <Input id="t-telefon" type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-geburtsdatum">Geburtsdatum</Label>
            <Input id="t-geburtsdatum" type="date" value={geburtsdatum} onChange={e => setGeburtsdatum(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Anmeldungen CRUD Dialog ───────────────────────────────

function AnmeldungenDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  teilnehmer,
  kurse,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: Anmeldungen | null;
  onSuccess: () => void;
  teilnehmer: Teilnehmer[];
  kurse: Kurse[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [teilnehmerId, setTeilnehmerId] = useState('');
  const [kursId, setKursId] = useState('');
  const [anmeldedatum, setAnmeldedatum] = useState('');
  const [bezahlt, setBezahlt] = useState(false);

  useEffect(() => {
    if (open) {
      setTeilnehmerId(extractRecordId(record?.fields.teilnehmer) ?? '');
      setKursId(extractRecordId(record?.fields.kurs) ?? '');
      setAnmeldedatum(record?.fields.anmeldedatum?.split('T')[0] ?? todayStr());
      setBezahlt(record?.fields.bezahlt ?? false);
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!teilnehmerId || teilnehmerId === 'none') {
      toast.error('Bitte Teilnehmer auswählen.');
      return;
    }
    if (!kursId || kursId === 'none') {
      toast.error('Bitte Kurs auswählen.');
      return;
    }
    setSubmitting(true);
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, teilnehmerId),
        kurs: createRecordUrl(APP_IDS.KURSE, kursId),
        anmeldedatum: anmeldedatum || undefined,
        bezahlt,
      };
      if (isEditing) {
        await LivingAppsService.updateAnmeldungenEntry(record!.record_id, fields);
        toast.success('Anmeldung wurde aktualisiert.');
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
        toast.success('Anmeldung wurde erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Teilnehmer *</Label>
            <Select value={teilnehmerId || 'none'} onValueChange={v => setTeilnehmerId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Teilnehmer auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Bitte auswählen</SelectItem>
                {teilnehmer.map(t => (
                  <SelectItem key={t.record_id} value={t.record_id}>
                    {[t.fields.teilnehmer_firstname, t.fields.teilnehmer_lastname].filter(Boolean).join(' ') || '–'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kurs *</Label>
            <Select value={kursId || 'none'} onValueChange={v => setKursId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Kurs auswählen..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Bitte auswählen</SelectItem>
                {kurse.map(k => (
                  <SelectItem key={k.record_id} value={k.record_id}>{k.fields.titel ?? '–'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-datum">Anmeldedatum</Label>
            <Input id="a-datum" type="date" value={anmeldedatum} onChange={e => setAnmeldedatum(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="a-bezahlt" checked={bezahlt} onCheckedChange={v => setBezahlt(v === true)} />
            <Label htmlFor="a-bezahlt">Bezahlt</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Dashboard ────────────────────────────────────────

export default function Dashboard() {
  const isMobile = useIsMobile();

  // Data states
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('kurse');

  // Dialog states
  const [raeumeDialog, setRaeumeDialog] = useState<{ open: boolean; record: Raeume | null }>({ open: false, record: null });
  const [dozentenDialog, setDozentenDialog] = useState<{ open: boolean; record: Dozenten | null }>({ open: false, record: null });
  const [kurseDialog, setKurseDialog] = useState<{ open: boolean; record: Kurse | null }>({ open: false, record: null });
  const [teilnehmerDialog, setTeilnehmerDialog] = useState<{ open: boolean; record: Teilnehmer | null }>({ open: false, record: null });
  const [anmeldungenDialog, setAnmeldungenDialog] = useState<{ open: boolean; record: Anmeldungen | null }>({ open: false, record: null });

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; onConfirm: () => Promise<void> } | null>(null);

  // Data loading
  const loadData = useCallback(async () => {
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
      setRaeume(r);
      setDozenten(d);
      setKurse(k);
      setTeilnehmer(t);
      setAnmeldungen(a);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lookup maps
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

  // Helper to resolve names
  function getDozentName(url: string | undefined): string {
    if (!url) return '–';
    const id = extractRecordId(url);
    if (!id) return '–';
    const d = dozentMap.get(id);
    if (!d) return '–';
    return [d.fields.dozent_firstname, d.fields.dozent_lastname].filter(Boolean).join(' ') || '–';
  }

  function getRaumName(url: string | undefined): string {
    if (!url) return '–';
    const id = extractRecordId(url);
    if (!id) return '–';
    const r = raumMap.get(id);
    return r?.fields.raumname ?? '–';
  }

  function getTeilnehmerName(url: string | undefined): string {
    if (!url) return '–';
    const id = extractRecordId(url);
    if (!id) return '–';
    const t = teilnehmerMap.get(id);
    if (!t) return '–';
    return [t.fields.teilnehmer_firstname, t.fields.teilnehmer_lastname].filter(Boolean).join(' ') || '–';
  }

  function getKursTitel(url: string | undefined): string {
    if (!url) return '–';
    const id = extractRecordId(url);
    if (!id) return '–';
    const k = kursMap.get(id);
    return k?.fields.titel ?? '–';
  }

  // KPI calculations
  const today = todayStr();

  const activeKurse = useMemo(() => {
    return kurse.filter(k => {
      const start = k.fields.startdatum?.split('T')[0];
      const end = k.fields.enddatum?.split('T')[0];
      if (!start && !end) return true;
      if (start && end) return start <= today && end >= today;
      if (start) return start <= today;
      if (end) return end >= today;
      return true;
    });
  }, [kurse, today]);

  const totalCapacity = useMemo(() => {
    return kurse.reduce((sum, k) => sum + (k.fields.max_teilnehmer ?? 0), 0);
  }, [kurse]);

  const totalRegistrations = anmeldungen.length;

  const fillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  const offeneZahlungen = useMemo(() => {
    return anmeldungen.filter(a => !a.fields.bezahlt).length;
  }, [anmeldungen]);

  // Chart data: registrations per course
  const chartData = useMemo(() => {
    const regCountPerKurs = new Map<string, number>();
    anmeldungen.forEach(a => {
      const kursId = extractRecordId(a.fields.kurs);
      if (!kursId) return;
      regCountPerKurs.set(kursId, (regCountPerKurs.get(kursId) ?? 0) + 1);
    });

    return kurse
      .map(k => ({
        name: k.fields.titel ?? 'Unbekannt',
        registrations: regCountPerKurs.get(k.record_id) ?? 0,
        capacity: k.fields.max_teilnehmer ?? 0,
        remaining: Math.max(0, (k.fields.max_teilnehmer ?? 0) - (regCountPerKurs.get(k.record_id) ?? 0)),
      }))
      .sort((a, b) => {
        const rateA = a.capacity > 0 ? a.registrations / a.capacity : 0;
        const rateB = b.capacity > 0 ? b.registrations / b.capacity : 0;
        return rateB - rateA;
      });
  }, [kurse, anmeldungen]);

  // Sorted lists
  const sortedKurse = useMemo(() => {
    return [...kurse].sort((a, b) => {
      const da = a.fields.startdatum ?? '';
      const db = b.fields.startdatum ?? '';
      return db.localeCompare(da);
    });
  }, [kurse]);

  const sortedAnmeldungen = useMemo(() => {
    return [...anmeldungen].sort((a, b) => {
      const da = a.fields.anmeldedatum ?? '';
      const db = b.fields.anmeldedatum ?? '';
      return db.localeCompare(da);
    });
  }, [anmeldungen]);

  const sortedTeilnehmer = useMemo(() => {
    return [...teilnehmer].sort((a, b) => {
      const na = a.fields.teilnehmer_lastname ?? '';
      const nb = b.fields.teilnehmer_lastname ?? '';
      return na.localeCompare(nb);
    });
  }, [teilnehmer]);

  const sortedDozenten = useMemo(() => {
    return [...dozenten].sort((a, b) => {
      const na = a.fields.dozent_lastname ?? '';
      const nb = b.fields.dozent_lastname ?? '';
      return na.localeCompare(nb);
    });
  }, [dozenten]);

  const sortedRaeume = useMemo(() => {
    return [...raeume].sort((a, b) => {
      const na = a.fields.raumname ?? '';
      const nb = b.fields.raumname ?? '';
      return na.localeCompare(nb);
    });
  }, [raeume]);

  // Delete handlers
  function handleDeleteRaeume(r: Raeume) {
    setDeleteTarget({
      name: r.fields.raumname ?? 'Raum',
      onConfirm: async () => {
        await LivingAppsService.deleteRaeumeEntry(r.record_id);
        await loadData();
      },
    });
  }
  function handleDeleteDozenten(d: Dozenten) {
    setDeleteTarget({
      name: [d.fields.dozent_firstname, d.fields.dozent_lastname].filter(Boolean).join(' ') || 'Dozent',
      onConfirm: async () => {
        await LivingAppsService.deleteDozentenEntry(d.record_id);
        await loadData();
      },
    });
  }
  function handleDeleteKurse(k: Kurse) {
    setDeleteTarget({
      name: k.fields.titel ?? 'Kurs',
      onConfirm: async () => {
        await LivingAppsService.deleteKurseEntry(k.record_id);
        await loadData();
      },
    });
  }
  function handleDeleteTeilnehmer(t: Teilnehmer) {
    setDeleteTarget({
      name: [t.fields.teilnehmer_firstname, t.fields.teilnehmer_lastname].filter(Boolean).join(' ') || 'Teilnehmer',
      onConfirm: async () => {
        await LivingAppsService.deleteTeilnehmerEntry(t.record_id);
        await loadData();
      },
    });
  }
  function handleDeleteAnmeldungen(a: Anmeldungen) {
    setDeleteTarget({
      name: 'diese Anmeldung',
      onConfirm: async () => {
        await LivingAppsService.deleteAnmeldungenEntry(a.record_id);
        await loadData();
      },
    });
  }

  // ─── Loading State ─────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" richColors />
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Skeleton className="h-48 md:col-span-3" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
          <Skeleton className="h-[300px] mb-8" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" richColors />
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fehler beim Laden</AlertTitle>
            <AlertDescription className="flex items-center gap-4">
              <span>{error.message}</span>
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-1" /> Erneut versuchen
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────── */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Kursverwaltung</h1>
          <Button onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
            <Plus className="h-4 w-4 mr-1" />
            {isMobile ? 'Anmeldung' : 'Neue Anmeldung'}
          </Button>
        </header>

        {/* ── Hero + Secondary KPIs ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Hero KPI */}
          <Card className="md:col-span-3 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtauslastung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-5xl sm:text-6xl font-extrabold" style={{ color: 'hsl(215 65% 45%)' }}>
                {fillRate}%
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(fillRate, 100)}%`, backgroundColor: 'hsl(215 65% 45%)' }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {totalRegistrations} von {totalCapacity} Plätzen belegt
              </p>
            </CardContent>
          </Card>

          {/* Secondary KPIs */}
          <div className={`md:col-span-2 ${isMobile ? 'flex gap-3 overflow-x-auto pb-1 -mx-4 px-4' : 'flex flex-col gap-4'}`}>
            <Card className={`shadow-sm hover:shadow-md transition-shadow ${isMobile ? 'min-w-[140px] flex-shrink-0' : ''}`}>
              <CardContent className="pt-5 pb-4 px-5">
                <BookOpen className="h-4 w-4 text-muted-foreground mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{activeKurse.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Aktive Kurse</p>
              </CardContent>
            </Card>

            <Card
              className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isMobile ? 'min-w-[160px] flex-shrink-0' : ''}`}
              onClick={() => setActiveTab('anmeldungen')}
            >
              <CardContent className="pt-5 pb-4 px-5">
                <AlertCircle className="h-4 w-4 mb-2" style={{ color: 'hsl(0 72% 51%)' }} />
                <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'hsl(0 72% 51%)' }}>
                  {offeneZahlungen}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Offene Zahlungen</p>
              </CardContent>
            </Card>

            <Card className={`shadow-sm hover:shadow-md transition-shadow ${isMobile ? 'min-w-[140px] flex-shrink-0' : ''}`}>
              <CardContent className="pt-5 pb-4 px-5">
                <Users className="h-4 w-4 text-muted-foreground mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{teilnehmer.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Teilnehmer</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Chart: Kursauslastung ──────────────── */}
        <Card className="shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Kursauslastung</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Noch keine Kurse vorhanden.</p>
            ) : isMobile ? (
              /* Mobile: vertical progress bars */
              <div className="space-y-4">
                {chartData.slice(0, 5).map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate mr-2">{item.name}</span>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {item.registrations}/{item.capacity}
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.capacity > 0 ? Math.min((item.registrations / item.capacity) * 100, 100) : 0}%`,
                          backgroundColor: 'hsl(215 65% 45%)',
                        }}
                      />
                    </div>
                  </div>
                ))}
                {chartData.length > 5 && (
                  <button
                    className="text-sm text-primary hover:underline"
                    onClick={() => setActiveTab('kurse')}
                  >
                    Alle anzeigen
                  </button>
                )}
              </div>
            ) : (
              /* Desktop: horizontal bar chart */
              <div style={{ height: Math.max(200, chartData.length * 40 + 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 12 }}
                      stroke="hsl(220 10% 46%)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0 0% 100%)',
                        border: '1px solid hsl(220 13% 90%)',
                        borderRadius: '8px',
                        fontSize: 13,
                      }}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'registrations' ? 'Anmeldungen' : 'Freie Plätze',
                      ]}
                    />
                    <Bar dataKey="registrations" stackId="a" radius={[0, 0, 0, 0]} name="registrations">
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill="hsl(215 65% 45%)" />
                      ))}
                    </Bar>
                    <Bar dataKey="remaining" stackId="a" radius={[0, 4, 4, 0]} name="remaining">
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill="hsl(220 14% 95%)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Data Management Tabs ───────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="kurse">Kurse</TabsTrigger>
            <TabsTrigger value="anmeldungen">Anmeldungen</TabsTrigger>
            <TabsTrigger value="teilnehmer">Teilnehmer</TabsTrigger>
            <TabsTrigger value="dozenten">Dozenten</TabsTrigger>
            <TabsTrigger value="raeume">Räume</TabsTrigger>
          </TabsList>

          {/* ── Kurse Tab ──────────────────────────── */}
          <TabsContent value="kurse">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Kurse</CardTitle>
                <Button size="sm" onClick={() => setKurseDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {sortedKurse.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Noch keine Kurse vorhanden.</p>
                    <Button variant="outline" onClick={() => setKurseDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Kurs anlegen
                    </Button>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {sortedKurse.map(k => (
                      <div key={k.record_id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{k.fields.titel ?? '–'}</div>
                            <div className="text-sm text-muted-foreground">{getDozentName(k.fields.dozent)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(k.fields.startdatum)} – {formatDate(k.fields.enddatum)}
                            </div>
                            <div className="text-sm font-medium mt-1">{formatCurrency(k.fields.preis)}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setKurseDialog({ open: true, record: k })} aria-label="Bearbeiten">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKurse(k)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kurstitel</TableHead>
                          <TableHead>Dozent</TableHead>
                          <TableHead>Raum</TableHead>
                          <TableHead>Start</TableHead>
                          <TableHead>Ende</TableHead>
                          <TableHead className="text-right">Preis</TableHead>
                          <TableHead className="text-right">Max. TN</TableHead>
                          <TableHead className="w-[100px]">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedKurse.map(k => (
                          <TableRow key={k.record_id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{k.fields.titel ?? '–'}</TableCell>
                            <TableCell>{getDozentName(k.fields.dozent)}</TableCell>
                            <TableCell>{getRaumName(k.fields.raum)}</TableCell>
                            <TableCell>{formatDate(k.fields.startdatum)}</TableCell>
                            <TableCell>{formatDate(k.fields.enddatum)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(k.fields.preis)}</TableCell>
                            <TableCell className="text-right">{k.fields.max_teilnehmer ?? '–'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setKurseDialog({ open: true, record: k })} aria-label="Bearbeiten">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteKurse(k)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
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

          {/* ── Anmeldungen Tab ────────────────────── */}
          <TabsContent value="anmeldungen">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Anmeldungen</CardTitle>
                <Button size="sm" onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {sortedAnmeldungen.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Noch keine Anmeldungen vorhanden.</p>
                    <Button variant="outline" onClick={() => setAnmeldungenDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Erste Anmeldung erstellen
                    </Button>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {sortedAnmeldungen.map(a => (
                      <div key={a.record_id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{getTeilnehmerName(a.fields.teilnehmer)}</div>
                            <div className="text-sm text-muted-foreground">{getKursTitel(a.fields.kurs)}</div>
                            <div className="mt-1">
                              {a.fields.bezahlt ? (
                                <Badge variant="default" className="text-xs" style={{ backgroundColor: 'hsl(152 55% 41%)' }}>Bezahlt</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Offen</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setAnmeldungenDialog({ open: true, record: a })} aria-label="Bearbeiten">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAnmeldungen(a)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teilnehmer</TableHead>
                          <TableHead>Kurs</TableHead>
                          <TableHead>Anmeldedatum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAnmeldungen.map(a => (
                          <TableRow key={a.record_id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{getTeilnehmerName(a.fields.teilnehmer)}</TableCell>
                            <TableCell>{getKursTitel(a.fields.kurs)}</TableCell>
                            <TableCell>{formatDate(a.fields.anmeldedatum)}</TableCell>
                            <TableCell>
                              {a.fields.bezahlt ? (
                                <Badge variant="default" className="text-xs" style={{ backgroundColor: 'hsl(152 55% 41%)' }}>Bezahlt</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Offen</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setAnmeldungenDialog({ open: true, record: a })} aria-label="Bearbeiten">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteAnmeldungen(a)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
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

          {/* ── Teilnehmer Tab ─────────────────────── */}
          <TabsContent value="teilnehmer">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Teilnehmer</CardTitle>
                <Button size="sm" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {sortedTeilnehmer.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Noch keine Teilnehmer vorhanden.</p>
                    <Button variant="outline" onClick={() => setTeilnehmerDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Teilnehmer anlegen
                    </Button>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {sortedTeilnehmer.map(t => (
                      <div key={t.record_id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {[t.fields.teilnehmer_firstname, t.fields.teilnehmer_lastname].filter(Boolean).join(' ') || '–'}
                            </div>
                            <div className="text-sm text-muted-foreground">{t.fields.email ?? '–'}</div>
                            <div className="text-sm text-muted-foreground">{t.fields.telefon ?? ''}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setTeilnehmerDialog({ open: true, record: t })} aria-label="Bearbeiten">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTeilnehmer(t)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Geburtsdatum</TableHead>
                          <TableHead className="w-[100px]">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedTeilnehmer.map(t => (
                          <TableRow key={t.record_id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{t.fields.teilnehmer_firstname ?? '–'}</TableCell>
                            <TableCell>{t.fields.teilnehmer_lastname ?? '–'}</TableCell>
                            <TableCell>{t.fields.email ?? '–'}</TableCell>
                            <TableCell>{t.fields.telefon ?? '–'}</TableCell>
                            <TableCell>{formatDate(t.fields.geburtsdatum)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setTeilnehmerDialog({ open: true, record: t })} aria-label="Bearbeiten">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTeilnehmer(t)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
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

          {/* ── Dozenten Tab ───────────────────────── */}
          <TabsContent value="dozenten">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Dozenten</CardTitle>
                <Button size="sm" onClick={() => setDozentenDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {sortedDozenten.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Noch keine Dozenten vorhanden.</p>
                    <Button variant="outline" onClick={() => setDozentenDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Dozenten anlegen
                    </Button>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {sortedDozenten.map(d => (
                      <div key={d.record_id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {[d.fields.dozent_firstname, d.fields.dozent_lastname].filter(Boolean).join(' ') || '–'}
                            </div>
                            <div className="text-sm text-muted-foreground">{d.fields.fachgebiet ?? ''}</div>
                            <div className="text-sm text-muted-foreground">{d.fields.email ?? '–'}</div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setDozentenDialog({ open: true, record: d })} aria-label="Bearbeiten">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDozenten(d)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Fachgebiet</TableHead>
                          <TableHead className="w-[100px]">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDozenten.map(d => (
                          <TableRow key={d.record_id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{d.fields.dozent_firstname ?? '–'}</TableCell>
                            <TableCell>{d.fields.dozent_lastname ?? '–'}</TableCell>
                            <TableCell>{d.fields.email ?? '–'}</TableCell>
                            <TableCell>{d.fields.telefon ?? '–'}</TableCell>
                            <TableCell>{d.fields.fachgebiet ?? '–'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setDozentenDialog({ open: true, record: d })} aria-label="Bearbeiten">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDozenten(d)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
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

          {/* ── Räume Tab ──────────────────────────── */}
          <TabsContent value="raeume">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Räume</CardTitle>
                <Button size="sm" onClick={() => setRaeumeDialog({ open: true, record: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Neu
                </Button>
              </CardHeader>
              <CardContent>
                {sortedRaeume.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Noch keine Räume vorhanden.</p>
                    <Button variant="outline" onClick={() => setRaeumeDialog({ open: true, record: null })}>
                      <Plus className="h-4 w-4 mr-1" /> Ersten Raum anlegen
                    </Button>
                  </div>
                ) : isMobile ? (
                  <div className="space-y-3">
                    {sortedRaeume.map(r => (
                      <div key={r.record_id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{r.fields.raumname ?? '–'}</div>
                            <div className="text-sm text-muted-foreground">{r.fields.gebaeude ?? ''}</div>
                            <div className="text-sm text-muted-foreground">
                              {r.fields.kapazitaet != null ? `Kapazität: ${r.fields.kapazitaet}` : ''}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => setRaeumeDialog({ open: true, record: r })} aria-label="Bearbeiten">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRaeume(r)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raumname</TableHead>
                          <TableHead>Gebäude</TableHead>
                          <TableHead className="text-right">Kapazität</TableHead>
                          <TableHead className="w-[100px]">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRaeume.map(r => (
                          <TableRow key={r.record_id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{r.fields.raumname ?? '–'}</TableCell>
                            <TableCell>{r.fields.gebaeude ?? '–'}</TableCell>
                            <TableCell className="text-right">{r.fields.kapazitaet ?? '–'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => setRaeumeDialog({ open: true, record: r })} aria-label="Bearbeiten">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRaeume(r)} aria-label="Löschen" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
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
        </Tabs>
      </div>

      {/* ── CRUD Dialogs ──────────────────────────── */}
      <RaeumeDialog
        open={raeumeDialog.open}
        onOpenChange={open => setRaeumeDialog(prev => ({ ...prev, open }))}
        record={raeumeDialog.record}
        onSuccess={loadData}
      />
      <DozentenDialog
        open={dozentenDialog.open}
        onOpenChange={open => setDozentenDialog(prev => ({ ...prev, open }))}
        record={dozentenDialog.record}
        onSuccess={loadData}
      />
      <KurseDialog
        open={kurseDialog.open}
        onOpenChange={open => setKurseDialog(prev => ({ ...prev, open }))}
        record={kurseDialog.record}
        onSuccess={loadData}
        raeume={raeume}
        dozenten={dozenten}
      />
      <TeilnehmerDialog
        open={teilnehmerDialog.open}
        onOpenChange={open => setTeilnehmerDialog(prev => ({ ...prev, open }))}
        record={teilnehmerDialog.record}
        onSuccess={loadData}
      />
      <AnmeldungenDialog
        open={anmeldungenDialog.open}
        onOpenChange={open => setAnmeldungenDialog(prev => ({ ...prev, open }))}
        record={anmeldungenDialog.record}
        onSuccess={loadData}
        teilnehmer={teilnehmer}
        kurse={kurse}
      />

      {/* ── Delete Confirmation ───────────────────── */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        recordName={deleteTarget?.name ?? ''}
        onConfirm={deleteTarget?.onConfirm ?? (async () => {})}
      />
    </div>
  );
}
