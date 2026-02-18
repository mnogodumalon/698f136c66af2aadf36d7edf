import { useState, useEffect, useMemo } from 'react';
import type { Raeume, Dozenten, Kurse, Teilnehmer, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalendarPlus,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Users,
  DoorOpen,
  BookOpen,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Euro,
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

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function weekLaterString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return format(d, 'yyyy-MM-dd');
}

function isActiveKurs(kurs: Kurse): boolean {
  if (!kurs.fields.enddatum) return true;
  const end = kurs.fields.enddatum.split('T')[0];
  return end >= todayString();
}

// ============================================================
// DATA HOOK
// ============================================================

function useDashboardData() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
  }

  useEffect(() => { fetchAll(); }, []);

  return { raeume, dozenten, kurse, teilnehmer, anmeldungen, loading, error, refresh: fetchAll };
}

// ============================================================
// DELETE CONFIRMATION DIALOG
// ============================================================

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      toast.error('Fehler beim Loeschen');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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

// ============================================================
// CAPACITY BAR
// ============================================================

function CapacityBar({ current, max }: { current: number; max: number | undefined }) {
  const maxVal = max || 0;
  const pct = maxVal > 0 ? Math.min((current / maxVal) * 100, 120) : 0;
  const displayPct = Math.min(pct, 100);
  const barColor =
    pct > 100
      ? 'hsl(0 72% 51%)'
      : pct > 80
      ? 'hsl(38 92% 50%)'
      : 'hsl(234 56% 46%)';

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayPct}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {current}/{maxVal || '?'} Plaetze
      </span>
    </div>
  );
}

// ============================================================
// RAEUME CRUD DIALOG
// ============================================================

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
      const fields = {
        raumname: formData.raumname,
        gebaeude: formData.gebaeude || undefined,
        kapazitaet: formData.kapazitaet ? Number(formData.kapazitaet) : undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateRaeumeEntry(record!.record_id, fields);
        toast.success('Raum aktualisiert');
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
        toast.success('Raum erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Bearbeite die Raumdaten.' : 'Erstelle einen neuen Raum.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raumname">Raumname *</Label>
            <Input id="raumname" value={formData.raumname} onChange={(e) => setFormData((p) => ({ ...p, raumname: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gebaeude">Gebaeude</Label>
            <Input id="gebaeude" value={formData.gebaeude} onChange={(e) => setFormData((p) => ({ ...p, gebaeude: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Kapazitaet</Label>
            <Input id="kapazitaet" type="number" min="0" value={formData.kapazitaet} onChange={(e) => setFormData((p) => ({ ...p, kapazitaet: e.target.value }))} />
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

// ============================================================
// DOZENTEN CRUD DIALOG
// ============================================================

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
      const fields = {
        dozent_firstname: formData.dozent_firstname,
        dozent_lastname: formData.dozent_lastname,
        email: formData.email || undefined,
        telefon: formData.telefon || undefined,
        fachgebiet: formData.fachgebiet || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateDozentenEntry(record!.record_id, fields);
        toast.success('Dozent aktualisiert');
      } else {
        await LivingAppsService.createDozentenEntry(fields);
        toast.success('Dozent erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Bearbeite die Dozentendaten.' : 'Erstelle einen neuen Dozenten.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="d_fn">Vorname *</Label>
              <Input id="d_fn" value={formData.dozent_firstname} onChange={(e) => setFormData((p) => ({ ...p, dozent_firstname: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d_ln">Nachname *</Label>
              <Input id="d_ln" value={formData.dozent_lastname} onChange={(e) => setFormData((p) => ({ ...p, dozent_lastname: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_email">E-Mail</Label>
            <Input id="d_email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_tel">Telefon</Label>
            <Input id="d_tel" type="tel" value={formData.telefon} onChange={(e) => setFormData((p) => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="d_fach">Fachgebiet</Label>
            <Input id="d_fach" value={formData.fachgebiet} onChange={(e) => setFormData((p) => ({ ...p, fachgebiet: e.target.value }))} />
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

// ============================================================
// KURSE CRUD DIALOG
// ============================================================

function KurseDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  dozenten,
  raeumeList,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Kurse | null;
  onSuccess: () => void;
  dozenten: Dozenten[];
  raeumeList: Raeume[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    startdatum: todayString(),
    enddatum: weekLaterString(),
    max_teilnehmer: '',
    preis: '',
    raum: 'none',
    dozent: 'none',
  });

  useEffect(() => {
    if (open) {
      const raumId = record?.fields.raum ? extractRecordId(record.fields.raum) : null;
      const dozentId = record?.fields.dozent ? extractRecordId(record.fields.dozent) : null;
      setFormData({
        titel: record?.fields.titel ?? '',
        beschreibung: record?.fields.beschreibung ?? '',
        startdatum: record?.fields.startdatum?.split('T')[0] ?? todayString(),
        enddatum: record?.fields.enddatum?.split('T')[0] ?? weekLaterString(),
        max_teilnehmer: record?.fields.max_teilnehmer?.toString() ?? '',
        preis: record?.fields.preis?.toString() ?? '',
        raum: raumId ?? 'none',
        dozent: dozentId ?? 'none',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fields: Record<string, unknown> = {
        titel: formData.titel,
        beschreibung: formData.beschreibung || undefined,
        startdatum: formData.startdatum,
        enddatum: formData.enddatum,
        max_teilnehmer: formData.max_teilnehmer ? Number(formData.max_teilnehmer) : undefined,
        preis: formData.preis ? Number(formData.preis) : undefined,
        raum: formData.raum !== 'none' ? createRecordUrl(APP_IDS.RAEUME, formData.raum) : null,
        dozent: formData.dozent !== 'none' ? createRecordUrl(APP_IDS.DOZENTEN, formData.dozent) : null,
      };
      if (isEditing) {
        await LivingAppsService.updateKurseEntry(record!.record_id, fields as Kurse['fields']);
        toast.success('Kurs aktualisiert');
      } else {
        await LivingAppsService.createKurseEntry(fields as Kurse['fields']);
        toast.success('Kurs erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Bearbeite die Kursdaten.' : 'Erstelle einen neuen Kurs.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="k_titel">Kurstitel *</Label>
            <Input id="k_titel" value={formData.titel} onChange={(e) => setFormData((p) => ({ ...p, titel: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="k_desc">Beschreibung</Label>
            <Textarea id="k_desc" value={formData.beschreibung} onChange={(e) => setFormData((p) => ({ ...p, beschreibung: e.target.value }))} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k_start">Startdatum *</Label>
              <Input id="k_start" type="date" value={formData.startdatum} onChange={(e) => setFormData((p) => ({ ...p, startdatum: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k_end">Enddatum *</Label>
              <Input id="k_end" type="date" value={formData.enddatum} onChange={(e) => setFormData((p) => ({ ...p, enddatum: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="k_max">Max. Teilnehmer</Label>
              <Input id="k_max" type="number" min="0" value={formData.max_teilnehmer} onChange={(e) => setFormData((p) => ({ ...p, max_teilnehmer: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="k_preis">Preis (EUR)</Label>
              <Input id="k_preis" type="number" min="0" step="0.01" value={formData.preis} onChange={(e) => setFormData((p) => ({ ...p, preis: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dozent</Label>
              <Select value={formData.dozent} onValueChange={(v) => setFormData((p) => ({ ...p, dozent: v }))}>
                <SelectTrigger className="w-full">
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
              <Select value={formData.raum} onValueChange={(v) => setFormData((p) => ({ ...p, raum: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Raum waehlen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Raum</SelectItem>
                  {raeumeList.map((r) => (
                    <SelectItem key={r.record_id} value={r.record_id}>
                      {r.fields.raumname}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

// ============================================================
// TEILNEHMER CRUD DIALOG
// ============================================================

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
      const fields = {
        teilnehmer_firstname: formData.teilnehmer_firstname,
        teilnehmer_lastname: formData.teilnehmer_lastname,
        email: formData.email || undefined,
        telefon: formData.telefon || undefined,
        geburtsdatum: formData.geburtsdatum || undefined,
      };
      if (isEditing) {
        await LivingAppsService.updateTeilnehmerEntry(record!.record_id, fields);
        toast.success('Teilnehmer aktualisiert');
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
        toast.success('Teilnehmer erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Bearbeite die Teilnehmerdaten.' : 'Erstelle einen neuen Teilnehmer.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="t_fn">Vorname *</Label>
              <Input id="t_fn" value={formData.teilnehmer_firstname} onChange={(e) => setFormData((p) => ({ ...p, teilnehmer_firstname: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t_ln">Nachname *</Label>
              <Input id="t_ln" value={formData.teilnehmer_lastname} onChange={(e) => setFormData((p) => ({ ...p, teilnehmer_lastname: e.target.value }))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_email">E-Mail</Label>
            <Input id="t_email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_tel">Telefon</Label>
            <Input id="t_tel" type="tel" value={formData.telefon} onChange={(e) => setFormData((p) => ({ ...p, telefon: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t_geb">Geburtsdatum</Label>
            <Input id="t_geb" type="date" value={formData.geburtsdatum} onChange={(e) => setFormData((p) => ({ ...p, geburtsdatum: e.target.value }))} />
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

// ============================================================
// ANMELDUNGEN CRUD DIALOG
// ============================================================

function AnmeldungenDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
  teilnehmerList,
  kurseList,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Anmeldungen | null;
  onSuccess: () => void;
  teilnehmerList: Teilnehmer[];
  kurseList: Kurse[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    teilnehmer: 'none',
    kurs: 'none',
    anmeldedatum: todayString(),
    bezahlt: false,
  });

  useEffect(() => {
    if (open) {
      const tnId = record?.fields.teilnehmer ? extractRecordId(record.fields.teilnehmer) : null;
      const kursId = record?.fields.kurs ? extractRecordId(record.fields.kurs) : null;
      setFormData({
        teilnehmer: tnId ?? 'none',
        kurs: kursId ?? 'none',
        anmeldedatum: record?.fields.anmeldedatum?.split('T')[0] ?? todayString(),
        bezahlt: record?.fields.bezahlt ?? false,
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.teilnehmer === 'none' || formData.kurs === 'none') {
      toast.error('Bitte Teilnehmer und Kurs auswaehlen');
      return;
    }
    setSubmitting(true);
    try {
      const fields = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, formData.teilnehmer),
        kurs: createRecordUrl(APP_IDS.KURSE, formData.kurs),
        anmeldedatum: formData.anmeldedatum,
        bezahlt: formData.bezahlt,
      };
      if (isEditing) {
        await LivingAppsService.updateAnmeldungenEntry(record!.record_id, fields);
        toast.success('Anmeldung aktualisiert');
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
        toast.success('Anmeldung erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(`Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Bearbeite die Anmeldedaten.' : 'Erstelle eine neue Anmeldung.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Teilnehmer *</Label>
            <Select value={formData.teilnehmer} onValueChange={(v) => setFormData((p) => ({ ...p, teilnehmer: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Teilnehmer waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Bitte waehlen --</SelectItem>
                {teilnehmerList.map((t) => (
                  <SelectItem key={t.record_id} value={t.record_id}>
                    {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kurs *</Label>
            <Select value={formData.kurs} onValueChange={(v) => setFormData((p) => ({ ...p, kurs: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kurs waehlen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Bitte waehlen --</SelectItem>
                {kurseList.map((k) => (
                  <SelectItem key={k.record_id} value={k.record_id}>
                    {k.fields.titel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="a_datum">Anmeldedatum *</Label>
            <Input id="a_datum" type="date" value={formData.anmeldedatum} onChange={(e) => setFormData((p) => ({ ...p, anmeldedatum: e.target.value }))} required />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="a_bezahlt"
              checked={formData.bezahlt}
              onCheckedChange={(checked) => setFormData((p) => ({ ...p, bezahlt: checked === true }))}
            />
            <Label htmlFor="a_bezahlt">Bezahlt</Label>
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

// ============================================================
// LOADING STATE
// ============================================================

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-[1280px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
          <CardTitle>Fehler beim Laden</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export default function Dashboard() {
  const { raeume, dozenten, kurse, teilnehmer, anmeldungen, loading, error, refresh } = useDashboardData();

  // CRUD state
  const [showAnmeldungDialog, setShowAnmeldungDialog] = useState(false);
  const [editAnmeldung, setEditAnmeldung] = useState<Anmeldungen | null>(null);
  const [deleteAnmeldung, setDeleteAnmeldung] = useState<Anmeldungen | null>(null);

  const [showKursDialog, setShowKursDialog] = useState(false);
  const [editKurs, setEditKurs] = useState<Kurse | null>(null);
  const [deleteKurs, setDeleteKurs] = useState<Kurse | null>(null);

  const [showRaumDialog, setShowRaumDialog] = useState(false);
  const [editRaum, setEditRaum] = useState<Raeume | null>(null);
  const [deleteRaum, setDeleteRaum] = useState<Raeume | null>(null);

  const [showDozentDialog, setShowDozentDialog] = useState(false);
  const [editDozent, setEditDozent] = useState<Dozenten | null>(null);
  const [deleteDozent, setDeleteDozent] = useState<Dozenten | null>(null);

  const [showTeilnehmerDialog, setShowTeilnehmerDialog] = useState(false);
  const [editTeilnehmer, setEditTeilnehmer] = useState<Teilnehmer | null>(null);
  const [deleteTeilnehmer, setDeleteTeilnehmer] = useState<Teilnehmer | null>(null);

  // Active tab for mobile
  const [mobileTab, setMobileTab] = useState('kurse');

  // Lookup maps
  const dozentMap = useMemo(() => {
    const map = new Map<string, Dozenten>();
    dozenten.forEach((d) => map.set(d.record_id, d));
    return map;
  }, [dozenten]);

  const raumMap = useMemo(() => {
    const map = new Map<string, Raeume>();
    raeume.forEach((r) => map.set(r.record_id, r));
    return map;
  }, [raeume]);

  const teilnehmerMap = useMemo(() => {
    const map = new Map<string, Teilnehmer>();
    teilnehmer.forEach((t) => map.set(t.record_id, t));
    return map;
  }, [teilnehmer]);

  const kursMap = useMemo(() => {
    const map = new Map<string, Kurse>();
    kurse.forEach((k) => map.set(k.record_id, k));
    return map;
  }, [kurse]);

  // Computed values
  const activeKurse = useMemo(() => kurse.filter(isActiveKurs), [kurse]);

  const registrationsPerKurs = useMemo(() => {
    const counts = new Map<string, number>();
    anmeldungen.forEach((a) => {
      const kursId = extractRecordId(a.fields.kurs);
      if (!kursId) return;
      counts.set(kursId, (counts.get(kursId) || 0) + 1);
    });
    return counts;
  }, [anmeldungen]);

  const activeAnmeldungen = useMemo(() => {
    const activeKursIds = new Set(activeKurse.map((k) => k.record_id));
    return anmeldungen.filter((a) => {
      const kursId = extractRecordId(a.fields.kurs);
      return kursId && activeKursIds.has(kursId);
    });
  }, [anmeldungen, activeKurse]);

  const bezahltCount = useMemo(
    () => activeAnmeldungen.filter((a) => a.fields.bezahlt).length,
    [activeAnmeldungen]
  );

  const expectedRevenue = useMemo(() => {
    let total = 0;
    activeAnmeldungen.forEach((a) => {
      const kursId = extractRecordId(a.fields.kurs);
      if (!kursId) return;
      const kurs = kursMap.get(kursId);
      if (kurs?.fields.preis) total += kurs.fields.preis;
    });
    return total;
  }, [activeAnmeldungen, kursMap]);

  const sortedKurse = useMemo(
    () =>
      [...kurse].sort((a, b) => {
        const aDate = a.fields.startdatum || '';
        const bDate = b.fields.startdatum || '';
        return aDate.localeCompare(bDate);
      }),
    [kurse]
  );

  const recentAnmeldungen = useMemo(
    () =>
      [...anmeldungen]
        .sort((a, b) => {
          const aDate = a.fields.anmeldedatum || a.createdat || '';
          const bDate = b.fields.anmeldedatum || b.createdat || '';
          return bDate.localeCompare(aDate);
        })
        .slice(0, 5),
    [anmeldungen]
  );

  // Chart data
  const chartData = useMemo(() => {
    return activeKurse
      .map((k) => {
        const regs = registrationsPerKurs.get(k.record_id) || 0;
        const max = k.fields.max_teilnehmer || 0;
        const pct = max > 0 ? Math.round((regs / max) * 100) : 0;
        return {
          name: (k.fields.titel || '').length > 15 ? (k.fields.titel || '').slice(0, 15) + '...' : k.fields.titel || '',
          pct,
          fill: pct > 100 ? 'hsl(0 72% 51%)' : pct > 80 ? 'hsl(38 92% 50%)' : 'hsl(234 56% 46%)',
        };
      })
      .slice(0, 8);
  }, [activeKurse, registrationsPerKurs]);

  // Sorted lists for tabs
  const sortedTeilnehmer = useMemo(
    () => [...teilnehmer].sort((a, b) => (a.fields.teilnehmer_lastname || '').localeCompare(b.fields.teilnehmer_lastname || '')),
    [teilnehmer]
  );
  const sortedDozenten = useMemo(
    () => [...dozenten].sort((a, b) => (a.fields.dozent_lastname || '').localeCompare(b.fields.dozent_lastname || '')),
    [dozenten]
  );
  const sortedRaeume = useMemo(
    () => [...raeume].sort((a, b) => (a.fields.raumname || '').localeCompare(b.fields.raumname || '')),
    [raeume]
  );
  const sortedAnmeldungen = useMemo(
    () =>
      [...anmeldungen].sort((a, b) => {
        const aDate = a.fields.anmeldedatum || a.createdat || '';
        const bDate = b.fields.anmeldedatum || b.createdat || '';
        return bDate.localeCompare(aDate);
      }),
    [anmeldungen]
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;

  function getDozentName(kurs: Kurse): string {
    const id = extractRecordId(kurs.fields.dozent);
    if (!id) return '-';
    const d = dozentMap.get(id);
    return d ? `${d.fields.dozent_firstname || ''} ${d.fields.dozent_lastname || ''}`.trim() : '-';
  }

  function getRaumName(kurs: Kurse): string {
    const id = extractRecordId(kurs.fields.raum);
    if (!id) return '-';
    const r = raumMap.get(id);
    return r?.fields.raumname || '-';
  }

  function getTeilnehmerName(anmeldung: Anmeldungen): string {
    const id = extractRecordId(anmeldung.fields.teilnehmer);
    if (!id) return '-';
    const t = teilnehmerMap.get(id);
    return t ? `${t.fields.teilnehmer_firstname || ''} ${t.fields.teilnehmer_lastname || ''}`.trim() : '-';
  }

  function getKursTitle(anmeldung: Anmeldungen): string {
    const id = extractRecordId(anmeldung.fields.kurs);
    if (!id) return '-';
    const k = kursMap.get(id);
    return k?.fields.titel || '-';
  }

  // ============================================================
  // RENDER - COURSE CARD
  // ============================================================

  function CourseCard({ kurs }: { kurs: Kurse }) {
    const regs = registrationsPerKurs.get(kurs.record_id) || 0;
    return (
      <Card className="group hover:shadow-md transition-shadow duration-200 relative">
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 md:transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditKurs(kurs); setShowKursDialog(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteKurs(kurs); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {/* Mobile: always show action buttons */}
        <div className="absolute top-3 right-3 flex gap-1 md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditKurs(kurs); setShowKursDialog(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteKurs(kurs); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="pr-20">
              <h3 className="font-semibold text-base">{kurs.fields.titel || 'Unbenannter Kurs'}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {getDozentName(kurs)} &bull; {getRaumName(kurs)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(kurs.fields.startdatum)} - {formatDate(kurs.fields.enddatum)}
              </p>
            </div>
            <CapacityBar current={regs} max={kurs.fields.max_teilnehmer} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{regs} Anmeldungen</span>
              <span className="text-sm font-semibold" style={{ color: 'hsl(38 92% 50%)' }}>
                {kurs.fields.preis ? formatCurrency(kurs.fields.preis) : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Toaster position="top-right" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8">
        {/* ==================== HEADER ==================== */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl md:text-[28px] font-extrabold tracking-tight text-foreground">
            Kursverwaltung
          </h1>
          <Button
            onClick={() => { setEditAnmeldung(null); setShowAnmeldungDialog(true); }}
            className="hidden md:inline-flex"
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Neue Anmeldung
          </Button>
        </header>

        {/* ==================== HERO STATS ==================== */}
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <Card className="border shadow-sm">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Aktive Kurse
              </p>
              <p className="text-2xl md:text-4xl font-extrabold" style={{ color: 'hsl(234 56% 46%)' }}>
                {activeKurse.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Anmeldungen
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-4xl font-extrabold">
                  {activeAnmeldungen.length}
                </p>
                <Badge
                  className="text-[10px] md:text-xs px-2 py-0.5"
                  style={{ backgroundColor: 'hsl(38 92% 50%)', color: 'white', border: 'none' }}
                >
                  {bezahltCount} bezahlt
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4 md:p-6">
              <p className="text-xs md:text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Erw. Umsatz
              </p>
              <p className="text-2xl md:text-4xl font-extrabold" style={{ color: 'hsl(38 92% 50%)' }}>
                {formatCurrency(expectedRevenue)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ==================== MAIN CONTENT (Desktop: 65/35 split) ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* LEFT: Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Kurse</h2>
              <Button variant="outline" size="sm" onClick={() => { setEditKurs(null); setShowKursDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Neuer Kurs
              </Button>
            </div>

            {sortedKurse.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Noch keine Kurse vorhanden.</p>
                  <Button variant="outline" className="mt-3" onClick={() => { setEditKurs(null); setShowKursDialog(true); }}>
                    Ersten Kurs erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedKurse.map((kurs) => (
                  <CourseCard key={kurs.record_id} kurs={kurs} />
                ))}
              </div>
            )}

            {/* CHART - Capacity Utilization */}
            {chartData.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Auslastung nach Kurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, 'Auslastung']}
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(230 15% 90%)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                        />
                        <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Recent Activity + Quick Stats */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-3">Letzte Anmeldungen</h2>
              {recentAnmeldungen.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Anmeldungen.</p>
              ) : (
                <div className="space-y-2">
                  {recentAnmeldungen.map((a) => (
                    <div
                      key={a.record_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => { setEditAnmeldung(a); setShowAnmeldungDialog(true); }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{getTeilnehmerName(a)}</p>
                        <p className="text-xs text-muted-foreground truncate">{getKursTitle(a)}</p>
                      </div>
                      <Badge
                        variant={a.fields.bezahlt ? 'default' : 'destructive'}
                        className="ml-2 shrink-0"
                        style={
                          a.fields.bezahlt
                            ? { backgroundColor: 'hsl(158 64% 40%)', color: 'white', border: 'none' }
                            : undefined
                        }
                      >
                        {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Schnelluebersicht</h3>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Dozenten</span>
                </div>
                <span className="font-semibold">{dozenten.length}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>Teilnehmer</span>
                </div>
                <span className="font-semibold">{teilnehmer.length}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-sm">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Raeume</span>
                </div>
                <span className="font-semibold">{raeume.length}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span>Gesamtumsatz (alle)</span>
                </div>
                <span className="font-semibold">{formatCurrency(expectedRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== TABBED DATA MANAGEMENT ==================== */}
        <Tabs defaultValue="teilnehmer" className="w-full">
          <TabsList className="w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="teilnehmer" className="gap-1.5">
              <GraduationCap className="h-4 w-4 hidden md:inline" />
              Teilnehmer
            </TabsTrigger>
            <TabsTrigger value="dozenten" className="gap-1.5">
              <Users className="h-4 w-4 hidden md:inline" />
              Dozenten
            </TabsTrigger>
            <TabsTrigger value="raeume" className="gap-1.5">
              <DoorOpen className="h-4 w-4 hidden md:inline" />
              Raeume
            </TabsTrigger>
            <TabsTrigger value="anmeldungen" className="gap-1.5">
              <ClipboardList className="h-4 w-4 hidden md:inline" />
              Anmeldungen
            </TabsTrigger>
          </TabsList>

          {/* ===== TEILNEHMER TAB ===== */}
          <TabsContent value="teilnehmer">
            <div className="flex items-center justify-between mb-4 mt-4">
              <h3 className="font-semibold">Teilnehmer ({teilnehmer.length})</h3>
              <Button size="sm" onClick={() => { setEditTeilnehmer(null); setShowTeilnehmerDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Neu
              </Button>
            </div>
            {sortedTeilnehmer.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Noch keine Teilnehmer vorhanden.</p>
                  <Button variant="outline" className="mt-3" onClick={() => { setEditTeilnehmer(null); setShowTeilnehmerDialog(true); }}>
                    Ersten Teilnehmer erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Geburtsdatum</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTeilnehmer.map((t) => (
                        <TableRow key={t.record_id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setEditTeilnehmer(t); setShowTeilnehmerDialog(true); }}>
                          <TableCell className="font-medium">
                            {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                          </TableCell>
                          <TableCell>{t.fields.email || '-'}</TableCell>
                          <TableCell>{t.fields.telefon || '-'}</TableCell>
                          <TableCell>{formatDate(t.fields.geburtsdatum)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditTeilnehmer(t); setShowTeilnehmerDialog(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTeilnehmer(t); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden space-y-2">
                  {sortedTeilnehmer.map((t) => (
                    <div key={t.record_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0" onClick={() => { setEditTeilnehmer(t); setShowTeilnehmerDialog(true); }}>
                        <p className="font-medium text-sm">{t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}</p>
                        <p className="text-xs text-muted-foreground">{t.fields.email || '-'} &bull; {t.fields.telefon || '-'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditTeilnehmer(t); setShowTeilnehmerDialog(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTeilnehmer(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ===== DOZENTEN TAB ===== */}
          <TabsContent value="dozenten">
            <div className="flex items-center justify-between mb-4 mt-4">
              <h3 className="font-semibold">Dozenten ({dozenten.length})</h3>
              <Button size="sm" onClick={() => { setEditDozent(null); setShowDozentDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Neu
              </Button>
            </div>
            {sortedDozenten.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Noch keine Dozenten vorhanden.</p>
                  <Button variant="outline" className="mt-3" onClick={() => { setEditDozent(null); setShowDozentDialog(true); }}>
                    Ersten Dozenten erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="hidden md:block rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Fachgebiet</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedDozenten.map((d) => (
                        <TableRow key={d.record_id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setEditDozent(d); setShowDozentDialog(true); }}>
                          <TableCell className="font-medium">{d.fields.dozent_firstname} {d.fields.dozent_lastname}</TableCell>
                          <TableCell>{d.fields.email || '-'}</TableCell>
                          <TableCell>{d.fields.telefon || '-'}</TableCell>
                          <TableCell>{d.fields.fachgebiet || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditDozent(d); setShowDozentDialog(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteDozent(d); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-2">
                  {sortedDozenten.map((d) => (
                    <div key={d.record_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0" onClick={() => { setEditDozent(d); setShowDozentDialog(true); }}>
                        <p className="font-medium text-sm">{d.fields.dozent_firstname} {d.fields.dozent_lastname}</p>
                        <p className="text-xs text-muted-foreground">{d.fields.fachgebiet || '-'} &bull; {d.fields.email || '-'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditDozent(d); setShowDozentDialog(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDozent(d)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ===== RAEUME TAB ===== */}
          <TabsContent value="raeume">
            <div className="flex items-center justify-between mb-4 mt-4">
              <h3 className="font-semibold">Raeume ({raeume.length})</h3>
              <Button size="sm" onClick={() => { setEditRaum(null); setShowRaumDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Neu
              </Button>
            </div>
            {sortedRaeume.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <DoorOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Noch keine Raeume vorhanden.</p>
                  <Button variant="outline" className="mt-3" onClick={() => { setEditRaum(null); setShowRaumDialog(true); }}>
                    Ersten Raum erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="hidden md:block rounded-lg border overflow-hidden">
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
                        <TableRow key={r.record_id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setEditRaum(r); setShowRaumDialog(true); }}>
                          <TableCell className="font-medium">{r.fields.raumname || '-'}</TableCell>
                          <TableCell>{r.fields.gebaeude || '-'}</TableCell>
                          <TableCell>{r.fields.kapazitaet ?? '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditRaum(r); setShowRaumDialog(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteRaum(r); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-2">
                  {sortedRaeume.map((r) => (
                    <div key={r.record_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0" onClick={() => { setEditRaum(r); setShowRaumDialog(true); }}>
                        <p className="font-medium text-sm">{r.fields.raumname || '-'}</p>
                        <p className="text-xs text-muted-foreground">{r.fields.gebaeude || '-'} &bull; Kap: {r.fields.kapazitaet ?? '-'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditRaum(r); setShowRaumDialog(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteRaum(r)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ===== ANMELDUNGEN TAB ===== */}
          <TabsContent value="anmeldungen">
            <div className="flex items-center justify-between mb-4 mt-4">
              <h3 className="font-semibold">Anmeldungen ({anmeldungen.length})</h3>
              <Button size="sm" onClick={() => { setEditAnmeldung(null); setShowAnmeldungDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Neu
              </Button>
            </div>
            {sortedAnmeldungen.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Noch keine Anmeldungen vorhanden.</p>
                  <Button variant="outline" className="mt-3" onClick={() => { setEditAnmeldung(null); setShowAnmeldungDialog(true); }}>
                    Erste Anmeldung erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="hidden md:block rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teilnehmer</TableHead>
                        <TableHead>Kurs</TableHead>
                        <TableHead>Anmeldedatum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAnmeldungen.map((a) => (
                        <TableRow key={a.record_id} className="hover:bg-muted/50 cursor-pointer" onClick={() => { setEditAnmeldung(a); setShowAnmeldungDialog(true); }}>
                          <TableCell className="font-medium">{getTeilnehmerName(a)}</TableCell>
                          <TableCell>{getKursTitle(a)}</TableCell>
                          <TableCell>{formatDate(a.fields.anmeldedatum)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={a.fields.bezahlt ? 'default' : 'destructive'}
                              style={
                                a.fields.bezahlt
                                  ? { backgroundColor: 'hsl(158 64% 40%)', color: 'white', border: 'none' }
                                  : undefined
                              }
                            >
                              {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditAnmeldung(a); setShowAnmeldungDialog(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteAnmeldung(a); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden space-y-2">
                  {sortedAnmeldungen.map((a) => (
                    <div key={a.record_id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0" onClick={() => { setEditAnmeldung(a); setShowAnmeldungDialog(true); }}>
                        <p className="font-medium text-sm">{getTeilnehmerName(a)}</p>
                        <p className="text-xs text-muted-foreground">{getKursTitle(a)} &bull; {formatDate(a.fields.anmeldedatum)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={a.fields.bezahlt ? 'default' : 'destructive'}
                          className="text-[10px]"
                          style={
                            a.fields.bezahlt
                              ? { backgroundColor: 'hsl(158 64% 40%)', color: 'white', border: 'none' }
                              : undefined
                          }
                        >
                          {a.fields.bezahlt ? 'Bezahlt' : 'Offen'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditAnmeldung(a); setShowAnmeldungDialog(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteAnmeldung(a)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ==================== FAB (Mobile Only) ==================== */}
      <button
        onClick={() => { setEditAnmeldung(null); setShowAnmeldungDialog(true); }}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
        style={{ backgroundColor: 'hsl(234 56% 46%)' }}
        aria-label="Neue Anmeldung"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* ==================== ALL CRUD DIALOGS ==================== */}

      {/* Anmeldungen */}
      <AnmeldungenDialog
        open={showAnmeldungDialog}
        onOpenChange={(open) => {
          setShowAnmeldungDialog(open);
          if (!open) setEditAnmeldung(null);
        }}
        record={editAnmeldung}
        onSuccess={refresh}
        teilnehmerList={teilnehmer}
        kurseList={kurse}
      />
      <DeleteConfirmDialog
        open={!!deleteAnmeldung}
        onOpenChange={(open) => { if (!open) setDeleteAnmeldung(null); }}
        title="Anmeldung loeschen?"
        description="Moechtest du diese Anmeldung wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden."
        onConfirm={async () => {
          if (!deleteAnmeldung) return;
          await LivingAppsService.deleteAnmeldungenEntry(deleteAnmeldung.record_id);
          toast.success('Anmeldung geloescht');
          setDeleteAnmeldung(null);
          refresh();
        }}
      />

      {/* Kurse */}
      <KurseDialog
        open={showKursDialog}
        onOpenChange={(open) => {
          setShowKursDialog(open);
          if (!open) setEditKurs(null);
        }}
        record={editKurs}
        onSuccess={refresh}
        dozenten={dozenten}
        raeumeList={raeume}
      />
      <DeleteConfirmDialog
        open={!!deleteKurs}
        onOpenChange={(open) => { if (!open) setDeleteKurs(null); }}
        title="Kurs loeschen?"
        description={`Moechtest du den Kurs "${deleteKurs?.fields.titel || ''}" wirklich loeschen? Alle Anmeldungen fuer diesen Kurs gehen verloren.`}
        onConfirm={async () => {
          if (!deleteKurs) return;
          await LivingAppsService.deleteKurseEntry(deleteKurs.record_id);
          toast.success('Kurs geloescht');
          setDeleteKurs(null);
          refresh();
        }}
      />

      {/* Raeume */}
      <RaeumeDialog
        open={showRaumDialog}
        onOpenChange={(open) => {
          setShowRaumDialog(open);
          if (!open) setEditRaum(null);
        }}
        record={editRaum}
        onSuccess={refresh}
      />
      <DeleteConfirmDialog
        open={!!deleteRaum}
        onOpenChange={(open) => { if (!open) setDeleteRaum(null); }}
        title="Raum loeschen?"
        description={`Moechtest du den Raum "${deleteRaum?.fields.raumname || ''}" wirklich loeschen? Kurse, die diesen Raum nutzen, verlieren die Raumzuordnung.`}
        onConfirm={async () => {
          if (!deleteRaum) return;
          await LivingAppsService.deleteRaeumeEntry(deleteRaum.record_id);
          toast.success('Raum geloescht');
          setDeleteRaum(null);
          refresh();
        }}
      />

      {/* Dozenten */}
      <DozentenDialog
        open={showDozentDialog}
        onOpenChange={(open) => {
          setShowDozentDialog(open);
          if (!open) setEditDozent(null);
        }}
        record={editDozent}
        onSuccess={refresh}
      />
      <DeleteConfirmDialog
        open={!!deleteDozent}
        onOpenChange={(open) => { if (!open) setDeleteDozent(null); }}
        title="Dozent loeschen?"
        description={`Moechtest du den Dozenten "${deleteDozent?.fields.dozent_firstname || ''} ${deleteDozent?.fields.dozent_lastname || ''}" wirklich loeschen?`}
        onConfirm={async () => {
          if (!deleteDozent) return;
          await LivingAppsService.deleteDozentenEntry(deleteDozent.record_id);
          toast.success('Dozent geloescht');
          setDeleteDozent(null);
          refresh();
        }}
      />

      {/* Teilnehmer */}
      <TeilnehmerDialog
        open={showTeilnehmerDialog}
        onOpenChange={(open) => {
          setShowTeilnehmerDialog(open);
          if (!open) setEditTeilnehmer(null);
        }}
        record={editTeilnehmer}
        onSuccess={refresh}
      />
      <DeleteConfirmDialog
        open={!!deleteTeilnehmer}
        onOpenChange={(open) => { if (!open) setDeleteTeilnehmer(null); }}
        title="Teilnehmer loeschen?"
        description={`Moechtest du den Teilnehmer "${deleteTeilnehmer?.fields.teilnehmer_firstname || ''} ${deleteTeilnehmer?.fields.teilnehmer_lastname || ''}" wirklich loeschen?`}
        onConfirm={async () => {
          if (!deleteTeilnehmer) return;
          await LivingAppsService.deleteTeilnehmerEntry(deleteTeilnehmer.record_id);
          toast.success('Teilnehmer geloescht');
          setDeleteTeilnehmer(null);
          refresh();
        }}
      />
    </div>
  );
}
