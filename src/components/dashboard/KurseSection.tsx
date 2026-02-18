import { useState } from 'react';
import { Pencil, Trash2, BookOpen, Calendar, Euro, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Kurse, Dozenten, Raeume } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';

interface KurseSectionProps {
  kurse: Kurse[];
  dozenten: Dozenten[];
  raeume: Raeume[];
  onRefresh: () => void;
}

interface KursForm {
  titel: string;
  beschreibung: string;
  startdatum: string;
  enddatum: string;
  max_teilnehmer: number;
  preis: number;
  dozent_id: string;
  raum_id: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '–';
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

export function KurseSection({ kurse, dozenten, raeume, onRefresh }: KurseSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editKurs, setEditKurs] = useState<Kurse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<KursForm>();

  const openCreate = () => {
    setEditKurs(null);
    reset({ titel: '', beschreibung: '', startdatum: '', enddatum: '', max_teilnehmer: 20, preis: 0, dozent_id: '', raum_id: '' });
    setDialogOpen(true);
  };

  const openEdit = (kurs: Kurse) => {
    setEditKurs(kurs);
    const dozentId = kurs.fields.dozent
      ? kurs.fields.dozent.match(/([a-f0-9]{24})$/i)?.[1] ?? ''
      : '';
    const raumId = kurs.fields.raum
      ? kurs.fields.raum.match(/([a-f0-9]{24})$/i)?.[1] ?? ''
      : '';
    reset({
      titel: kurs.fields.titel ?? '',
      beschreibung: kurs.fields.beschreibung ?? '',
      startdatum: kurs.fields.startdatum ? kurs.fields.startdatum.substring(0, 10) : '',
      enddatum: kurs.fields.enddatum ? kurs.fields.enddatum.substring(0, 10) : '',
      max_teilnehmer: kurs.fields.max_teilnehmer ?? 20,
      preis: kurs.fields.preis ?? 0,
      dozent_id: dozentId,
      raum_id: raumId,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: KursForm) => {
    setSaving(true);
    try {
      const fields: Kurse['fields'] = {
        titel: data.titel,
        beschreibung: data.beschreibung,
        startdatum: data.startdatum || undefined,
        enddatum: data.enddatum || undefined,
        max_teilnehmer: Number(data.max_teilnehmer),
        preis: Number(data.preis),
        dozent: data.dozent_id ? createRecordUrl(APP_IDS.DOZENTEN, data.dozent_id) : undefined,
        raum: data.raum_id ? createRecordUrl(APP_IDS.RAEUME, data.raum_id) : undefined,
      };
      if (editKurs) {
        await LivingAppsService.updateKurseEntry(editKurs.record_id, fields);
      } else {
        await LivingAppsService.createKurseEntry(fields);
      }
      setDialogOpen(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await LivingAppsService.deleteKurseEntry(deleteId);
      setDeleteId(null);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  const getDozentName = (kurs: Kurse) => {
    if (!kurs.fields.dozent) return null;
    const id = kurs.fields.dozent.match(/([a-f0-9]{24})$/i)?.[1];
    const d = dozenten.find(d => d.record_id === id);
    return d ? `${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim() : null;
  };

  const getRaumName = (kurs: Kurse) => {
    if (!kurs.fields.raum) return null;
    const id = kurs.fields.raum.match(/([a-f0-9]{24})$/i)?.[1];
    const r = raeume.find(r => r.record_id === id);
    return r?.fields.raumname ?? null;
  };

  return (
    <div>
      <SectionHeader
        title="Kurse"
        description={`${kurse.length} Kurs${kurse.length !== 1 ? 'e' : ''} gesamt`}
        actionLabel="Kurs hinzufügen"
        onAction={openCreate}
      />

      {kurse.length === 0 ? (
        <div className="card-surface border border-border">
          <EmptyState
            icon={BookOpen}
            title="Noch keine Kurse"
            description="Erstellen Sie Ihren ersten Kurs und beginnen Sie mit der Verwaltung."
            actionLabel="Kurs hinzufügen"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {kurse.map((kurs) => {
            const dozentName = getDozentName(kurs);
            const raumName = getRaumName(kurs);
            return (
              <div key={kurs.record_id} className="card-surface card-surface-hover border border-border p-5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-700 text-foreground text-base leading-snug mb-1.5 truncate">
                      {kurs.fields.titel ?? 'Unbenannter Kurs'}
                    </h3>
                    {kurs.fields.beschreibung && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{kurs.fields.beschreibung}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {(kurs.fields.startdatum || kurs.fields.enddatum) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(kurs.fields.startdatum)} – {formatDate(kurs.fields.enddatum)}
                        </span>
                      )}
                      {kurs.fields.max_teilnehmer != null && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Max. {kurs.fields.max_teilnehmer}
                        </span>
                      )}
                      {kurs.fields.preis != null && (
                        <span className="flex items-center gap-1">
                          <Euro className="w-3.5 h-3.5" />
                          {kurs.fields.preis.toFixed(2)} €
                        </span>
                      )}
                      {dozentName && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-light text-primary text-[11px] font-600">
                          {dozentName}
                        </span>
                      )}
                      {raumName && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-600">
                          {raumName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(kurs)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(kurs.record_id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-700">{editKurs ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Titel *</Label>
              <Input {...register('titel', { required: true })} placeholder="z.B. Grundkurs Programmierung" className={cn(errors.titel && 'border-destructive')} />
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Beschreibung</Label>
              <Textarea {...register('beschreibung')} placeholder="Kursbeschreibung..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Startdatum</Label>
                <Input type="date" {...register('startdatum')} />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Enddatum</Label>
                <Input type="date" {...register('enddatum')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Max. Teilnehmer</Label>
                <Input type="number" min={1} {...register('max_teilnehmer')} />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Preis (€)</Label>
                <Input type="number" min={0} step="0.01" {...register('preis')} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Dozent</Label>
              <Select onValueChange={(v) => setValue('dozent_id', v)} defaultValue={editKurs?.fields.dozent?.match(/([a-f0-9]{24})$/i)?.[1] ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Dozent auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {dozenten.map(d => (
                    <SelectItem key={d.record_id} value={d.record_id}>
                      {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Raum</Label>
              <Select onValueChange={(v) => setValue('raum_id', v)} defaultValue={editKurs?.fields.raum?.match(/([a-f0-9]{24})$/i)?.[1] ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Raum auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {raeume.map(r => (
                    <SelectItem key={r.record_id} value={r.record_id}>
                      {r.fields.raumname}{r.fields.gebaeude ? ` – ${r.fields.gebaeude}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
              <Button type="submit" disabled={saving} className="gradient-hero text-primary-foreground font-600 shadow-none hover:opacity-90">
                {saving ? 'Speichern...' : editKurs ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Kurs löschen?"
        description="Dieser Kurs wird dauerhaft gelöscht. Alle zugehörigen Anmeldungen bleiben bestehen."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
