import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Raeume, Dozenten, Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  ClipboardList,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

// ─── Utility Functions ───────────────────────────────────────────────

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ─── Delete Confirmation Dialog ──────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  recordName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      toast.success('Geloescht', { description: `"${recordName}" wurde geloescht.` });
      onOpenChange(false);
    } catch (err) {
      toast.error('Fehler', {
        description: `Eintrag konnte nicht geloescht werden: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag loeschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Moechtest du &quot;{recordName}&quot; wirklich loeschen? Diese Aktion kann nicht
            rueckgaengig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Loescht...' : 'Loeschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Raeume Dialog ───────────────────────────────────────────────────

function RaeumeDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Raeume | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    raumname: '',
    gebaeude: '',
    kapazitaet: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        raumname: record?.fields.raumname ?? '',
        gebaeude: record?.fields.gebaeude ?? '',
        kapazitaet: record?.fields.kapazitaet?.toString() ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Raeume['fields'] = {
        raumname: formData.raumname,
        gebaeude: formData.gebaeude || undefined,
        kapazitaet: formData.kapazitaet ? Number(formData.kapazitaet) : undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateRaeumeEntry(record!.record_id, fields);
        toast.success('Gespeichert', { description: 'Raum wurde aktualisiert.' });
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
        toast.success('Erstellt', { description: 'Neuer Raum wurde erstellt.' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error('Fehler', {
        description: `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
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
            <Input
              id="raumname"
              value={formData.raumname}
              onChange={(e) => setFormData((p) => ({ ...p, raumname: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gebaeude">Gebaeude</Label>
            <Input
              id="gebaeude"
              value={formData.gebaeude}
              onChange={(e) => setFormData((p) => ({ ...p, gebaeude: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Kapazitaet</Label>
            <Input
              id="kapazitaet"
              type="number"
              min={0}
              value={formData.kapazitaet}
              onChange={(e) => setFormData((p) => ({ ...p, kapazitaet: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dozenten Dialog ─────────────────────────────────────────────────

function DozentenDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Dozenten | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dozent_firstname: '',
    dozent_lastname: '',
    email: '',
    telefon: '',
    fachgebiet: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
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
      const fields: Dozenten['fields'] = {
        dozent_firstname: formData.dozent_firstname,
        dozent_lastname: formData.dozent_lastname,
        email: formData.email || undefined,
        telefon: formData.telefon || undefined,
        fachgebiet: formData.fachgebiet || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateDozentenEntry(record!.record_id, fields);
        toast.success('Gespeichert', { description: 'Dozent wurde aktualisiert.' });
      } else {
        await LivingAppsService.createDozentenEntry(fields);
        toast.success('Erstellt', { description: 'Neuer Dozent wurde erstellt.' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error('Fehler', {
        description: `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
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
              <Label htmlFor="dozent_firstname">Vorname *</Label>
              <Input
                id="dozent_firstname"
                value={formData.dozent_firstname}
                onChange={(e) => setFormData((p) => ({ ...p, dozent_firstname: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dozent_lastname">Nachname *</Label>
              <Input
                id="dozent_lastname"
                value={formData.dozent_lastname}
                onChange={(e) => setFormData((p) => ({ ...p, dozent_lastname: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dozent_email">E-Mail</Label>
            <Input
              id="dozent_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dozent_telefon">Telefon</Label>
            <Input
              id="dozent_telefon"
              type="tel"
              value={formData.telefon}
              onChange={(e) => setFormData((p) => ({ ...p, telefon: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fachgebiet">Fachgebiet</Label>
            <Input
              id="fachgebiet"
              value={formData.fachgebiet}
              onChange={(e) => setFormData((p) => ({ ...p, fachgebiet: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Teilnehmer Dialog ───────────────────────────────────────────────

function TeilnehmerDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Teilnehmer | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teilnehmer_firstname: '',
    teilnehmer_lastname: '',
    email: '',
    telefon: '',
    geburtsdatum: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
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
    try {
      const fields: Teilnehmer['fields'] = {
        teilnehmer_firstname: formData.teilnehmer_firstname,
        teilnehmer_lastname: formData.teilnehmer_lastname,
        email: formData.email || undefined,
        telefon: formData.telefon || undefined,
        geburtsdatum: formData.geburtsdatum || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateTeilnehmerEntry(record!.record_id, fields);
        toast.success('Gespeichert', { description: 'Teilnehmer wurde aktualisiert.' });
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
        toast.success('Erstellt', { description: 'Neuer Teilnehmer wurde erstellt.' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error('Fehler', {
        description: `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
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
              <Label htmlFor="tn_firstname">Vorname *</Label>
              <Input
                id="tn_firstname"
                value={formData.teilnehmer_firstname}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, teilnehmer_firstname: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tn_lastname">Nachname *</Label>
              <Input
                id="tn_lastname"
                value={formData.teilnehmer_lastname}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, teilnehmer_lastname: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tn_email">E-Mail</Label>
            <Input
              id="tn_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tn_telefon">Telefon</Label>
            <Input
              id="tn_telefon"
              type="tel"
              value={formData.telefon}
              onChange={(e) => setFormData((p) => ({ ...p, telefon: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tn_geburtsdatum">Geburtsdatum</Label>
            <Input
              id="tn_geburtsdatum"
              type="date"
              value={formData.geburtsdatum}
              onChange={(e) => setFormData((p) => ({ ...p, geburtsdatum: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Kurse Dialog ────────────────────────────────────────────────────

function KurseDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  dozenten,
  raeume,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Kurse | null;
  onSuccess: () => void;
  dozenten: Dozenten[];
  raeume: Raeume[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    startdatum: '',
    enddatum: '',
    max_teilnehmer: '',
    preis: '',
    dozent: 'none',
    raum: 'none',
  });

  useEffect(() => {
    if (open) {
      const dozentId = extractRecordId(record?.fields.dozent ?? null);
      const raumId = extractRecordId(record?.fields.raum ?? null);
      setFormData({
        titel: record?.fields.titel ?? '',
        beschreibung: record?.fields.beschreibung ?? '',
        startdatum: record?.fields.startdatum?.split('T')[0] ?? todayStr(),
        enddatum: record?.fields.enddatum?.split('T')[0] ?? '',
        max_teilnehmer: record?.fields.max_teilnehmer?.toString() ?? '',
        preis: record?.fields.preis?.toString() ?? '',
        dozent: dozentId ?? 'none',
        raum: raumId ?? 'none',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Kurse['fields'] = {
        titel: formData.titel,
        beschreibung: formData.beschreibung || undefined,
        startdatum: formData.startdatum || undefined,
        enddatum: formData.enddatum || undefined,
        max_teilnehmer: formData.max_teilnehmer ? Number(formData.max_teilnehmer) : undefined,
        preis: formData.preis ? Number(formData.preis) : undefined,
        dozent:
          formData.dozent !== 'none'
            ? createRecordUrl(APP_IDS.DOZENTEN, formData.dozent)
            : undefined,
        raum:
          formData.raum !== 'none'
            ? createRecordUrl(APP_IDS.RAEUME, formData.raum)
            : undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateKurseEntry(record!.record_id, fields);
        toast.success('Gespeichert', { description: 'Kurs wurde aktualisiert.' });
      } else {
        await LivingAppsService.createKurseEntry(fields);
        toast.success('Erstellt', { description: 'Neuer Kurs wurde erstellt.' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error('Fehler', {
        description: `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
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
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="kurs_titel">Kurstitel *</Label>
            <Input
              id="kurs_titel"
              value={formData.titel}
              onChange={(e) => setFormData((p) => ({ ...p, titel: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kurs_beschreibung">Beschreibung</Label>
            <Textarea
              id="kurs_beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData((p) => ({ ...p, beschreibung: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kurs_start">Startdatum *</Label>
              <Input
                id="kurs_start"
                type="date"
                value={formData.startdatum}
                onChange={(e) => setFormData((p) => ({ ...p, startdatum: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kurs_end">Enddatum</Label>
              <Input
                id="kurs_end"
                type="date"
                value={formData.enddatum}
                onChange={(e) => setFormData((p) => ({ ...p, enddatum: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kurs_max">Max. Teilnehmer</Label>
              <Input
                id="kurs_max"
                type="number"
                min={0}
                value={formData.max_teilnehmer}
                onChange={(e) => setFormData((p) => ({ ...p, max_teilnehmer: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kurs_preis">Preis (EUR)</Label>
              <Input
                id="kurs_preis"
                type="number"
                min={0}
                step="0.01"
                value={formData.preis}
                onChange={(e) => setFormData((p) => ({ ...p, preis: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dozent</Label>
            <Select
              value={formData.dozent}
              onValueChange={(v) => setFormData((p) => ({ ...p, dozent: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dozent waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Dozent</SelectItem>
                {dozenten.map((d) => (
                  <SelectItem key={d.record_id} value={d.record_id}>
                    {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Raum</Label>
            <Select
              value={formData.raum}
              onValueChange={(v) => setFormData((p) => ({ ...p, raum: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Raum waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {raeume.map((r) => (
                  <SelectItem key={r.record_id} value={r.record_id}>
                    {r.fields.raumname} {r.fields.gebaeude ? `(${r.fields.gebaeude})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Anmeldungen Dialog ──────────────────────────────────────────────

function AnmeldungenDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  teilnehmer,
  kurse,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Anmeldungen | null;
  onSuccess: () => void;
  teilnehmer: Teilnehmer[];
  kurse: Kurse[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teilnehmer: 'none',
    kurs: 'none',
    anmeldedatum: '',
    bezahlt: false,
  });

  useEffect(() => {
    if (open) {
      const tnId = extractRecordId(record?.fields.teilnehmer ?? null);
      const kursId = extractRecordId(record?.fields.kurs ?? null);
      setFormData({
        teilnehmer: tnId ?? 'none',
        kurs: kursId ?? 'none',
        anmeldedatum: record?.fields.anmeldedatum?.split('T')[0] ?? todayStr(),
        bezahlt: record?.fields.bezahlt ?? false,
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.teilnehmer === 'none' || formData.kurs === 'none') {
      toast.error('Fehler', { description: 'Bitte Teilnehmer und Kurs auswaehlen.' });
      return;
    }
    setSubmitting(true);
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, formData.teilnehmer),
        kurs: createRecordUrl(APP_IDS.KURSE, formData.kurs),
        anmeldedatum: formData.anmeldedatum || undefined,
        bezahlt: formData.bezahlt,
      };
      if (isEditing) {
        await LivingAppsService.updateAnmeldungenEntry(record!.record_id, fields);
        toast.success('Gespeichert', { description: 'Anmeldung wurde aktualisiert.' });
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
        toast.success('Erstellt', { description: 'Neue Anmeldung wurde erstellt.' });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error('Fehler', {
        description: `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
      });
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
            <Select
              value={formData.teilnehmer}
              onValueChange={(v) => setFormData((p) => ({ ...p, teilnehmer: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Bitte waehlen --</SelectItem>
                {teilnehmer.map((t) => (
                  <SelectItem key={t.record_id} value={t.record_id}>
                    {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kurs *</Label>
            <Select
              value={formData.kurs}
              onValueChange={(v) => setFormData((p) => ({ ...p, kurs: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kurs waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Bitte waehlen --</SelectItem>
                {kurse.map((k) => (
                  <SelectItem key={k.record_id} value={k.record_id}>
                    {k.fields.titel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="anm_datum">Anmeldedatum</Label>
            <Input
              id="anm_datum"
              type="date"
              value={formData.anmeldedatum}
              onChange={(e) => setFormData((p) => ({ ...p, anmeldedatum: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="anm_bezahlt"
              checked={formData.bezahlt}
              onCheckedChange={(checked) =>
                setFormData((p) => ({ ...p, bezahlt: checked === true }))
              }
            />
            <Label htmlFor="anm_bezahlt" className="cursor-pointer">
              Bezahlt
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading State ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold">Fehler beim Laden</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────

function EmptyTabState({
  label,
  onAdd,
}: {
  label: string;
  onAdd: () => void;
}) {
  return (
    <div className="text-center py-12 space-y-3">
      <p className="text-muted-foreground">Noch keine {label} vorhanden.</p>
      <Button variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        {label} erstellen
      </Button>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function Dashboard() {
  const isMobile = useIsMobile();

  // Data state
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // CRUD dialog states
  const [raeumeDialog, setRaeumeDialog] = useState<{ open: boolean; record: Raeume | null }>({
    open: false,
    record: null,
  });
  const [dozentenDialog, setDozentenDialog] = useState<{
    open: boolean;
    record: Dozenten | null;
  }>({ open: false, record: null });
  const [kurseDialog, setKurseDialog] = useState<{ open: boolean; record: Kurse | null }>({
    open: false,
    record: null,
  });
  const [teilnehmerDialog, setTeilnehmerDialog] = useState<{
    open: boolean;
    record: Teilnehmer | null;
  }>({ open: false, record: null });
  const [anmeldungenDialog, setAnmeldungenDialog] = useState<{
    open: boolean;
    record: Anmeldungen | null;
  }>({ open: false, record: null });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    name: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, name: '', onConfirm: async () => {} });

  // Active tab
  const [activeTab, setActiveTab] = useState('anmeldungen');

  // ─── Data Fetching ──────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
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
    fetchAll();
  }, [fetchAll]);

  // Individual refresh functions
  const refreshRaeume = useCallback(async () => {
    try {
      setRaeume(await LivingAppsService.getRaeume());
    } catch {
      await fetchAll();
    }
  }, [fetchAll]);

  const refreshDozenten = useCallback(async () => {
    try {
      setDozenten(await LivingAppsService.getDozenten());
    } catch {
      await fetchAll();
    }
  }, [fetchAll]);

  const refreshKurse = useCallback(async () => {
    try {
      setKurse(await LivingAppsService.getKurse());
    } catch {
      await fetchAll();
    }
  }, [fetchAll]);

  const refreshTeilnehmer = useCallback(async () => {
    try {
      setTeilnehmer(await LivingAppsService.getTeilnehmer());
    } catch {
      await fetchAll();
    }
  }, [fetchAll]);

  const refreshAnmeldungen = useCallback(async () => {
    try {
      setAnmeldungen(await LivingAppsService.getAnmeldungen());
    } catch {
      await fetchAll();
    }
  }, [fetchAll]);

  // ─── Lookup Maps ────────────────────────────────────────────────

  const kurseMap = useMemo(() => {
    const m = new Map<string, Kurse>();
    kurse.forEach((k) => m.set(k.record_id, k));
    return m;
  }, [kurse]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach((t) => m.set(t.record_id, t));
    return m;
  }, [teilnehmer]);

  const dozentenMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach((d) => m.set(d.record_id, d));
    return m;
  }, [dozenten]);

  const raeumeMap = useMemo(() => {
    const m = new Map<string, Raeume>();
    raeume.forEach((r) => m.set(r.record_id, r));
    return m;
  }, [raeume]);

  // ─── KPIs ───────────────────────────────────────────────────────

  const totalAnmeldungen = anmeldungen.length;
  const unbezahlt = anmeldungen.filter((a) => !a.fields.bezahlt).length;

  const today = todayStr();
  const activeKurse = kurse.filter((k) => {
    if (!k.fields.enddatum) return true;
    return k.fields.enddatum.split('T')[0] >= today;
  }).length;

  // ─── Chart Data ─────────────────────────────────────────────────

  const chartData = useMemo(() => {
    const countByKurs = new Map<string, number>();
    anmeldungen.forEach((a) => {
      const kursId = extractRecordId(a.fields.kurs ?? null);
      if (!kursId) return;
      countByKurs.set(kursId, (countByKurs.get(kursId) || 0) + 1);
    });

    const data = Array.from(countByKurs.entries())
      .map(([kursId, count]) => {
        const kurs = kurseMap.get(kursId);
        return {
          name: kurs?.fields.titel ?? 'Unbekannt',
          anmeldungen: count,
          maxTeilnehmer: kurs?.fields.max_teilnehmer ?? 0,
        };
      })
      .sort((a, b) => b.anmeldungen - a.anmeldungen);

    return isMobile ? data.slice(0, 5) : data;
  }, [anmeldungen, kurseMap, isMobile]);

  // ─── Recent Activity ────────────────────────────────────────────

  const recentActivity = useMemo(() => {
    type ActivityItem = { label: string; date: string; type: string };
    const items: ActivityItem[] = [];

    anmeldungen.forEach((a) => {
      const tnId = extractRecordId(a.fields.teilnehmer ?? null);
      const kursId = extractRecordId(a.fields.kurs ?? null);
      const tn = tnId ? teilnehmerMap.get(tnId) : null;
      const k = kursId ? kurseMap.get(kursId) : null;
      items.push({
        label: `${tn?.fields.teilnehmer_firstname ?? '?'} ${tn?.fields.teilnehmer_lastname ?? ''} → ${k?.fields.titel ?? 'Kurs'}`,
        date: a.createdat,
        type: 'Anmeldung',
      });
    });

    kurse.forEach((k) => {
      items.push({
        label: k.fields.titel ?? 'Kurs',
        date: k.createdat,
        type: 'Kurs',
      });
    });

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [anmeldungen, kurse, teilnehmerMap, kurseMap]);

  // ─── Delete Handlers ────────────────────────────────────────────

  function handleDeleteRaum(r: Raeume) {
    setDeleteDialog({
      open: true,
      name: r.fields.raumname ?? 'Raum',
      onConfirm: async () => {
        await LivingAppsService.deleteRaeumeEntry(r.record_id);
        await refreshRaeume();
      },
    });
  }

  function handleDeleteDozent(d: Dozenten) {
    setDeleteDialog({
      open: true,
      name: `${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim() || 'Dozent',
      onConfirm: async () => {
        await LivingAppsService.deleteDozentenEntry(d.record_id);
        await refreshDozenten();
      },
    });
  }

  function handleDeleteKurs(k: Kurse) {
    setDeleteDialog({
      open: true,
      name: k.fields.titel ?? 'Kurs',
      onConfirm: async () => {
        await LivingAppsService.deleteKurseEntry(k.record_id);
        await refreshKurse();
      },
    });
  }

  function handleDeleteTeilnehmer(t: Teilnehmer) {
    setDeleteDialog({
      open: true,
      name:
        `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() ||
        'Teilnehmer',
      onConfirm: async () => {
        await LivingAppsService.deleteTeilnehmerEntry(t.record_id);
        await refreshTeilnehmer();
      },
    });
  }

  function handleDeleteAnmeldung(a: Anmeldungen) {
    const tnId = extractRecordId(a.fields.teilnehmer ?? null);
    const tn = tnId ? teilnehmerMap.get(tnId) : null;
    setDeleteDialog({
      open: true,
      name: tn
        ? `Anmeldung von ${tn.fields.teilnehmer_firstname} ${tn.fields.teilnehmer_lastname}`
        : 'Anmeldung',
      onConfirm: async () => {
        await LivingAppsService.deleteAnmeldungenEntry(a.record_id);
        await refreshAnmeldungen();
      },
    });
  }

  // ─── Render ─────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchAll} />;

  // Sort data for tables
  const sortedAnmeldungen = [...anmeldungen].sort((a, b) =>
    (b.fields.anmeldedatum ?? b.createdat).localeCompare(a.fields.anmeldedatum ?? a.createdat),
  );
  const sortedKurse = [...kurse].sort((a, b) =>
    (b.fields.startdatum ?? b.createdat).localeCompare(a.fields.startdatum ?? a.createdat),
  );
  const sortedTeilnehmer = [...teilnehmer].sort((a, b) =>
    (a.fields.teilnehmer_lastname ?? '').localeCompare(b.fields.teilnehmer_lastname ?? ''),
  );
  const sortedDozenten = [...dozenten].sort((a, b) =>
    (a.fields.dozent_lastname ?? '').localeCompare(b.fields.dozent_lastname ?? ''),
  );
  const sortedRaeume = [...raeume].sort((a, b) =>
    (a.fields.raumname ?? '').localeCompare(b.fields.raumname ?? ''),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kursverwaltung</h1>
          <Button
            onClick={() => setAnmeldungenDialog({ open: true, record: null })}
            className="shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? '' : 'Neue Anmeldung'}
          </Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-6 pb-24 md:pb-6">
        {/* ─── KPIs Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Hero KPI */}
          <Card
            className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('anmeldungen')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Aktive Anmeldungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold tracking-tight">{totalAnmeldungen}</div>
              <div className="mt-2">
                {unbezahlt > 0 ? (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: 'hsl(38 92% 50% / 0.15)', color: 'hsl(38 70% 35%)' }}
                  >
                    {unbezahlt} offen
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: 'hsl(152 55% 42% / 0.15)',
                      color: 'hsl(152 55% 32%)',
                    }}
                  >
                    Alle bezahlt
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Secondary KPIs */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('kurse')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Aktive Kurse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{activeKurse}</div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('teilnehmer')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teilnehmer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{teilnehmer.length}</div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('dozenten')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Dozenten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{dozenten.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Content Area ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Chart + Tabbed Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Anmeldungen pro Kurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                      >
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={isMobile ? 100 : 160}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(220 15% 90%)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === 'maxTeilnehmer') return [value, 'Max. Plaetze'];
                            return [value, 'Anmeldungen'];
                          }}
                        />
                        <Bar dataKey="maxTeilnehmer" fill="hsl(220 45% 65% / 0.25)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="anmeldungen" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                entry.maxTeilnehmer > 0 &&
                                entry.anmeldungen >= entry.maxTeilnehmer
                                  ? 'hsl(38 92% 50%)'
                                  : 'hsl(220 65% 38%)'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabbed Data Management */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex">
                <TabsTrigger value="anmeldungen" className="flex-1 text-xs md:text-sm">
                  <ClipboardList className="h-4 w-4 mr-1 hidden md:inline" />
                  Anmeldungen
                </TabsTrigger>
                <TabsTrigger value="kurse" className="flex-1 text-xs md:text-sm">
                  <BookOpen className="h-4 w-4 mr-1 hidden md:inline" />
                  Kurse
                </TabsTrigger>
                <TabsTrigger value="teilnehmer" className="flex-1 text-xs md:text-sm">
                  <Users className="h-4 w-4 mr-1 hidden md:inline" />
                  Teilnehmer
                </TabsTrigger>
                <TabsTrigger value="dozenten" className="flex-1 text-xs md:text-sm">
                  <GraduationCap className="h-4 w-4 mr-1 hidden md:inline" />
                  Dozenten
                </TabsTrigger>
                <TabsTrigger value="raeume" className="flex-1 text-xs md:text-sm">
                  <DoorOpen className="h-4 w-4 mr-1 hidden md:inline" />
                  Raeume
                </TabsTrigger>
              </TabsList>

              {/* ── Anmeldungen Tab ─────────────────────────────────── */}
              <TabsContent value="anmeldungen" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {anmeldungen.length} Anmeldungen
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAnmeldungenDialog({ open: true, record: null })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
                {anmeldungen.length === 0 ? (
                  <EmptyTabState
                    label="Anmeldungen"
                    onAdd={() => setAnmeldungenDialog({ open: true, record: null })}
                  />
                ) : isMobile ? (
                  <div className="space-y-2">
                    {sortedAnmeldungen.map((a) => {
                      const tnId = extractRecordId(a.fields.teilnehmer ?? null);
                      const kursId = extractRecordId(a.fields.kurs ?? null);
                      const tn = tnId ? teilnehmerMap.get(tnId) : null;
                      const k = kursId ? kurseMap.get(kursId) : null;
                      return (
                        <div
                          key={a.record_id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                            onClick={() => setAnmeldungenDialog({ open: true, record: a })}
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor: a.fields.bezahlt
                                  ? 'hsl(152 55% 42%)'
                                  : 'hsl(38 92% 50%)',
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                {tn
                                  ? `${tn.fields.teilnehmer_firstname} ${tn.fields.teilnehmer_lastname}`
                                  : '-'}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {k?.fields.titel ?? '-'} · {formatDate(a.fields.anmeldedatum)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setAnmeldungenDialog({ open: true, record: a })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAnmeldung(a)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8"></TableHead>
                          <TableHead>Teilnehmer</TableHead>
                          <TableHead>Kurs</TableHead>
                          <TableHead>Anmeldedatum</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAnmeldungen.map((a) => {
                          const tnId = extractRecordId(a.fields.teilnehmer ?? null);
                          const kursId = extractRecordId(a.fields.kurs ?? null);
                          const tn = tnId ? teilnehmerMap.get(tnId) : null;
                          const k = kursId ? kurseMap.get(kursId) : null;
                          return (
                            <TableRow
                              key={a.record_id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setAnmeldungenDialog({ open: true, record: a })}
                            >
                              <TableCell>
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{
                                    backgroundColor: a.fields.bezahlt
                                      ? 'hsl(152 55% 42%)'
                                      : 'hsl(38 92% 50%)',
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {tn
                                  ? `${tn.fields.teilnehmer_firstname} ${tn.fields.teilnehmer_lastname}`
                                  : '-'}
                              </TableCell>
                              <TableCell>{k?.fields.titel ?? '-'}</TableCell>
                              <TableCell>{formatDate(a.fields.anmeldedatum)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                  style={
                                    a.fields.bezahlt
                                      ? {
                                          backgroundColor: 'hsl(152 55% 42% / 0.15)',
                                          color: 'hsl(152 55% 32%)',
                                        }
                                      : {
                                          backgroundColor: 'hsl(38 92% 50% / 0.15)',
                                          color: 'hsl(38 70% 35%)',
                                        }
                                  }
                                >
                                  {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      setAnmeldungenDialog({ open: true, record: a })
                                    }
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteAnmeldung(a)}
                                  >
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
              </TabsContent>

              {/* ── Kurse Tab ───────────────────────────────────────── */}
              <TabsContent value="kurse" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {kurse.length} Kurse
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setKurseDialog({ open: true, record: null })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
                {kurse.length === 0 ? (
                  <EmptyTabState
                    label="Kurse"
                    onAdd={() => setKurseDialog({ open: true, record: null })}
                  />
                ) : isMobile ? (
                  <div className="space-y-2">
                    {sortedKurse.map((k) => {
                      const dozentId = extractRecordId(k.fields.dozent ?? null);
                      const doz = dozentId ? dozentenMap.get(dozentId) : null;
                      return (
                        <div
                          key={k.record_id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setKurseDialog({ open: true, record: k })}
                          >
                            <div className="font-medium text-sm truncate">
                              {k.fields.titel ?? '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(k.fields.startdatum)} - {formatDate(k.fields.enddatum)}
                              {doz
                                ? ` · ${doz.fields.dozent_firstname} ${doz.fields.dozent_lastname}`
                                : ''}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setKurseDialog({ open: true, record: k })}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteKurs(k)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kurstitel</TableHead>
                          <TableHead>Start</TableHead>
                          <TableHead>Ende</TableHead>
                          <TableHead>Max. TN</TableHead>
                          <TableHead>Preis</TableHead>
                          <TableHead>Dozent</TableHead>
                          <TableHead>Raum</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedKurse.map((k) => {
                          const dozentId = extractRecordId(k.fields.dozent ?? null);
                          const raumId = extractRecordId(k.fields.raum ?? null);
                          const doz = dozentId ? dozentenMap.get(dozentId) : null;
                          const raum = raumId ? raeumeMap.get(raumId) : null;
                          return (
                            <TableRow
                              key={k.record_id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setKurseDialog({ open: true, record: k })}
                            >
                              <TableCell className="font-medium">
                                {k.fields.titel ?? '-'}
                              </TableCell>
                              <TableCell>{formatDate(k.fields.startdatum)}</TableCell>
                              <TableCell>{formatDate(k.fields.enddatum)}</TableCell>
                              <TableCell>{k.fields.max_teilnehmer ?? '-'}</TableCell>
                              <TableCell>{formatCurrency(k.fields.preis)}</TableCell>
                              <TableCell>
                                {doz
                                  ? `${doz.fields.dozent_firstname} ${doz.fields.dozent_lastname}`
                                  : '-'}
                              </TableCell>
                              <TableCell>{raum?.fields.raumname ?? '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setKurseDialog({ open: true, record: k })}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteKurs(k)}
                                  >
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
              </TabsContent>

              {/* ── Teilnehmer Tab ──────────────────────────────────── */}
              <TabsContent value="teilnehmer" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {teilnehmer.length} Teilnehmer
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTeilnehmerDialog({ open: true, record: null })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
                {teilnehmer.length === 0 ? (
                  <EmptyTabState
                    label="Teilnehmer"
                    onAdd={() => setTeilnehmerDialog({ open: true, record: null })}
                  />
                ) : isMobile ? (
                  <div className="space-y-2">
                    {sortedTeilnehmer.map((t) => (
                      <div
                        key={t.record_id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setTeilnehmerDialog({ open: true, record: t })}
                        >
                          <div className="font-medium text-sm truncate">
                            {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {t.fields.email ?? ''}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setTeilnehmerDialog({ open: true, record: t })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTeilnehmer(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Geburtsdatum</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedTeilnehmer.map((t) => (
                          <TableRow
                            key={t.record_id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setTeilnehmerDialog({ open: true, record: t })}
                          >
                            <TableCell className="font-medium">
                              {t.fields.teilnehmer_firstname ?? '-'}
                            </TableCell>
                            <TableCell>{t.fields.teilnehmer_lastname ?? '-'}</TableCell>
                            <TableCell>{t.fields.email ?? '-'}</TableCell>
                            <TableCell>{t.fields.telefon ?? '-'}</TableCell>
                            <TableCell>{formatDate(t.fields.geburtsdatum)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    setTeilnehmerDialog({ open: true, record: t })
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteTeilnehmer(t)}
                                >
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
              </TabsContent>

              {/* ── Dozenten Tab ────────────────────────────────────── */}
              <TabsContent value="dozenten" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {dozenten.length} Dozenten
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDozentenDialog({ open: true, record: null })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
                {dozenten.length === 0 ? (
                  <EmptyTabState
                    label="Dozenten"
                    onAdd={() => setDozentenDialog({ open: true, record: null })}
                  />
                ) : isMobile ? (
                  <div className="space-y-2">
                    {sortedDozenten.map((d) => (
                      <div
                        key={d.record_id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setDozentenDialog({ open: true, record: d })}
                        >
                          <div className="font-medium text-sm truncate">
                            {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {d.fields.fachgebiet ?? ''}{' '}
                            {d.fields.email ? `· ${d.fields.email}` : ''}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDozentenDialog({ open: true, record: d })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteDozent(d)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vorname</TableHead>
                          <TableHead>Nachname</TableHead>
                          <TableHead>E-Mail</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Fachgebiet</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedDozenten.map((d) => (
                          <TableRow
                            key={d.record_id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setDozentenDialog({ open: true, record: d })}
                          >
                            <TableCell className="font-medium">
                              {d.fields.dozent_firstname ?? '-'}
                            </TableCell>
                            <TableCell>{d.fields.dozent_lastname ?? '-'}</TableCell>
                            <TableCell>{d.fields.email ?? '-'}</TableCell>
                            <TableCell>{d.fields.telefon ?? '-'}</TableCell>
                            <TableCell>{d.fields.fachgebiet ?? '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    setDozentenDialog({ open: true, record: d })
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteDozent(d)}
                                >
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
              </TabsContent>

              {/* ── Raeume Tab ──────────────────────────────────────── */}
              <TabsContent value="raeume" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {raeume.length} Raeume
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRaeumeDialog({ open: true, record: null })}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Neu
                  </Button>
                </div>
                {raeume.length === 0 ? (
                  <EmptyTabState
                    label="Raeume"
                    onAdd={() => setRaeumeDialog({ open: true, record: null })}
                  />
                ) : isMobile ? (
                  <div className="space-y-2">
                    {sortedRaeume.map((r) => (
                      <div
                        key={r.record_id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setRaeumeDialog({ open: true, record: r })}
                        >
                          <div className="font-medium text-sm truncate">
                            {r.fields.raumname ?? '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.fields.gebaeude ?? ''}{' '}
                            {r.fields.kapazitaet ? `· ${r.fields.kapazitaet} Plaetze` : ''}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRaeumeDialog({ open: true, record: r })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRaum(r)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Raumname</TableHead>
                          <TableHead>Gebaeude</TableHead>
                          <TableHead>Kapazitaet</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRaeume.map((r) => (
                          <TableRow
                            key={r.record_id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setRaeumeDialog({ open: true, record: r })}
                          >
                            <TableCell className="font-medium">
                              {r.fields.raumname ?? '-'}
                            </TableCell>
                            <TableCell>{r.fields.gebaeude ?? '-'}</TableCell>
                            <TableCell>{r.fields.kapazitaet ?? '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setRaeumeDialog({ open: true, record: r })}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteRaum(r)}
                                >
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
              </TabsContent>
            </Tabs>
          </div>

          {/* ─── Right Column: Recent Activity ────────────────────── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Letzte Aktivitaet</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Noch keine Aktivitaet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{item.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.type} · {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Raumauslastung</CardTitle>
              </CardHeader>
              <CardContent>
                {raeume.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Raeume vorhanden.</p>
                ) : (
                  <>
                    {(() => {
                      const assignedRoomIds = new Set<string>();
                      kurse.forEach((k) => {
                        if (!k.fields.enddatum || k.fields.enddatum.split('T')[0] >= today) {
                          const rId = extractRecordId(k.fields.raum ?? null);
                          if (rId) assignedRoomIds.add(rId);
                        }
                      });
                      const usedCount = assignedRoomIds.size;
                      const totalCount = raeume.length;
                      const pct = totalCount > 0 ? Math.round((usedCount / totalCount) * 100) : 0;
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Belegte Raeume</span>
                            <span className="font-medium">
                              {usedCount} / {totalCount}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{pct}% Auslastung</p>
                        </div>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ─── Mobile Fixed Bottom Action ──────────────────────────── */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-30">
          <Button
            className="w-full h-12 text-base shadow-md"
            onClick={() => setAnmeldungenDialog({ open: true, record: null })}
          >
            <Plus className="h-5 w-5 mr-2" />
            Neue Anmeldung
          </Button>
        </div>
      )}

      {/* ─── All CRUD Dialogs ────────────────────────────────────── */}
      <RaeumeDialog
        open={raeumeDialog.open}
        onOpenChange={(open) => setRaeumeDialog((p) => ({ ...p, open }))}
        record={raeumeDialog.record}
        onSuccess={refreshRaeume}
      />
      <DozentenDialog
        open={dozentenDialog.open}
        onOpenChange={(open) => setDozentenDialog((p) => ({ ...p, open }))}
        record={dozentenDialog.record}
        onSuccess={refreshDozenten}
      />
      <KurseDialog
        open={kurseDialog.open}
        onOpenChange={(open) => setKurseDialog((p) => ({ ...p, open }))}
        record={kurseDialog.record}
        onSuccess={refreshKurse}
        dozenten={dozenten}
        raeume={raeume}
      />
      <TeilnehmerDialog
        open={teilnehmerDialog.open}
        onOpenChange={(open) => setTeilnehmerDialog((p) => ({ ...p, open }))}
        record={teilnehmerDialog.record}
        onSuccess={refreshTeilnehmer}
      />
      <AnmeldungenDialog
        open={anmeldungenDialog.open}
        onOpenChange={(open) => setAnmeldungenDialog((p) => ({ ...p, open }))}
        record={anmeldungenDialog.record}
        onSuccess={refreshAnmeldungen}
        teilnehmer={teilnehmer}
        kurse={kurse}
      />

      {/* ─── Delete Confirmation ─────────────────────────────────── */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((p) => ({ ...p, open }))}
        recordName={deleteDialog.name}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}
