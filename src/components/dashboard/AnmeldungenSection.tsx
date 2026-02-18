import { useState } from 'react';
import { Pencil, Trash2, ClipboardList, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Anmeldungen, Kurse, Teilnehmer } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';

interface AnmeldungenSectionProps {
  anmeldungen: Anmeldungen[];
  kurse: Kurse[];
  teilnehmer: Teilnehmer[];
  onRefresh: () => void;
}

interface AnmeldungForm {
  teilnehmer_id: string;
  kurs_id: string;
  anmeldedatum: string;
  bezahlt: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '–';
  try { return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: de }); } catch { return dateStr; }
}

export function AnmeldungenSection({ anmeldungen, kurse, teilnehmer, onRefresh }: AnmeldungenSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Anmeldungen | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<AnmeldungForm>();
  const bezahltVal = watch('bezahlt');

  const openCreate = () => {
    setEditItem(null);
    reset({
      teilnehmer_id: '',
      kurs_id: '',
      anmeldedatum: new Date().toISOString().substring(0, 10),
      bezahlt: 'false',
    });
    setDialogOpen(true);
  };

  const openEdit = (item: Anmeldungen) => {
    setEditItem(item);
    const teilnehmerId = item.fields.teilnehmer?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    const kursId = item.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1] ?? '';
    reset({
      teilnehmer_id: teilnehmerId,
      kurs_id: kursId,
      anmeldedatum: item.fields.anmeldedatum ? item.fields.anmeldedatum.substring(0, 10) : '',
      bezahlt: item.fields.bezahlt ? 'true' : 'false',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: AnmeldungForm) => {
    setSaving(true);
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: data.teilnehmer_id ? createRecordUrl(APP_IDS.TEILNEHMER, data.teilnehmer_id) : undefined,
        kurs: data.kurs_id ? createRecordUrl(APP_IDS.KURSE, data.kurs_id) : undefined,
        anmeldedatum: data.anmeldedatum || undefined,
        bezahlt: data.bezahlt === 'true',
      };
      if (editItem) {
        await LivingAppsService.updateAnmeldungenEntry(editItem.record_id, fields);
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
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
      await LivingAppsService.deleteAnmeldungenEntry(deleteId);
      setDeleteId(null);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

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

  const toggleBezahlt = async (item: Anmeldungen) => {
    await LivingAppsService.updateAnmeldungenEntry(item.record_id, { bezahlt: !item.fields.bezahlt });
    onRefresh();
  };

  const unpaid = anmeldungen.filter(a => !a.fields.bezahlt).length;

  return (
    <div>
      <SectionHeader
        title="Anmeldungen"
        description={`${anmeldungen.length} Anmeldungen${unpaid > 0 ? ` · ${unpaid} offen` : ''}`}
        actionLabel="Anmeldung hinzufügen"
        onAction={openCreate}
      />

      {anmeldungen.length === 0 ? (
        <div className="card-surface border border-border">
          <EmptyState
            icon={ClipboardList}
            title="Noch keine Anmeldungen"
            description="Melden Sie Teilnehmer für Kurse an."
            actionLabel="Anmeldung hinzufügen"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="card-surface border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Teilnehmer</th>
                  <th className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Kurs</th>
                  <th className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Datum</th>
                  <th className="text-left px-4 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Zahlung</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {anmeldungen.map((item, idx) => (
                  <tr
                    key={item.record_id}
                    className={cn('border-b border-border/50 hover:bg-muted/30 transition-smooth group', idx === anmeldungen.length - 1 && 'border-b-0')}
                  >
                    <td className="px-4 py-3 font-600 text-foreground">{getTeilnehmerName(item)}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-48 truncate">{getKursName(item)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.fields.anmeldedatum)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBezahlt(item)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-700 transition-smooth',
                          item.fields.bezahlt
                            ? 'bg-accent-light text-accent hover:bg-accent hover:text-accent-foreground'
                            : 'bg-destructive-light text-destructive hover:bg-destructive hover:text-primary-foreground'
                        )}
                        title="Klicken zum Umschalten"
                      >
                        {item.fields.bezahlt ? (
                          <><CheckCircle className="w-3 h-3" /> Bezahlt</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> Offen</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(item.record_id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-700">{editItem ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Teilnehmer *</Label>
              <Select
                onValueChange={(v) => setValue('teilnehmer_id', v)}
                defaultValue={editItem?.fields.teilnehmer?.match(/([a-f0-9]{24})$/i)?.[1] ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Teilnehmer auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {teilnehmer.map(t => (
                    <SelectItem key={t.record_id} value={t.record_id}>
                      {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Kurs *</Label>
              <Select
                onValueChange={(v) => setValue('kurs_id', v)}
                defaultValue={editItem?.fields.kurs?.match(/([a-f0-9]{24})$/i)?.[1] ?? ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kurs auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {kurse.map(k => (
                    <SelectItem key={k.record_id} value={k.record_id}>
                      {k.fields.titel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Anmeldedatum</Label>
              <Input type="date" {...register('anmeldedatum')} />
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Zahlung</Label>
              <Select onValueChange={(v) => setValue('bezahlt', v)} defaultValue={editItem?.fields.bezahlt ? 'true' : 'false'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Ausstehend</SelectItem>
                  <SelectItem value="true">Bezahlt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
              <Button type="submit" disabled={saving} className="gradient-hero text-primary-foreground font-600 shadow-none hover:opacity-90">
                {saving ? 'Speichern...' : editItem ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Anmeldung löschen?"
        description="Diese Anmeldung wird dauerhaft entfernt."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
