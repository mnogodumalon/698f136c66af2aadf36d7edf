import { useState } from 'react';
import { Pencil, Trash2, Users, Mail, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Teilnehmer } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

interface TeilnehmerSectionProps {
  teilnehmer: Teilnehmer[];
  onRefresh: () => void;
}

interface TeilnehmerForm {
  teilnehmer_firstname: string;
  teilnehmer_lastname: string;
  email: string;
  telefon: string;
  geburtsdatum: string;
}

function getInitials(f?: string, l?: string) {
  return `${(f ?? '')[0] ?? ''}${(l ?? '')[0] ?? ''}`.toUpperCase() || '?';
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '–';
  try { return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: de }); } catch { return dateStr; }
}

export function TeilnehmerSection({ teilnehmer, onRefresh }: TeilnehmerSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Teilnehmer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeilnehmerForm>();

  const openCreate = () => {
    setEditItem(null);
    reset({ teilnehmer_firstname: '', teilnehmer_lastname: '', email: '', telefon: '', geburtsdatum: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Teilnehmer) => {
    setEditItem(item);
    reset({
      teilnehmer_firstname: item.fields.teilnehmer_firstname ?? '',
      teilnehmer_lastname: item.fields.teilnehmer_lastname ?? '',
      email: item.fields.email ?? '',
      telefon: item.fields.telefon ?? '',
      geburtsdatum: item.fields.geburtsdatum ? item.fields.geburtsdatum.substring(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: TeilnehmerForm) => {
    setSaving(true);
    try {
      const fields: Teilnehmer['fields'] = {
        teilnehmer_firstname: data.teilnehmer_firstname,
        teilnehmer_lastname: data.teilnehmer_lastname,
        email: data.email || undefined,
        telefon: data.telefon || undefined,
        geburtsdatum: data.geburtsdatum || undefined,
      };
      if (editItem) {
        await LivingAppsService.updateTeilnehmerEntry(editItem.record_id, fields);
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields);
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
      await LivingAppsService.deleteTeilnehmerEntry(deleteId);
      setDeleteId(null);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  // Color palette for avatars
  const avatarColors = [
    'bg-primary-light text-primary',
    'bg-accent-light text-accent',
    'bg-amber-light text-amber',
    'bg-destructive-light text-destructive',
  ];

  return (
    <div>
      <SectionHeader
        title="Teilnehmer"
        description={`${teilnehmer.length} Teilnehmer registriert`}
        actionLabel="Teilnehmer hinzufügen"
        onAction={openCreate}
      />

      {teilnehmer.length === 0 ? (
        <div className="card-surface border border-border">
          <EmptyState
            icon={Users}
            title="Noch keine Teilnehmer"
            description="Fügen Sie Ihren ersten Teilnehmer hinzu."
            actionLabel="Teilnehmer hinzufügen"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teilnehmer.map((item, idx) => {
            const colorClass = avatarColors[idx % avatarColors.length];
            return (
              <div key={item.record_id} className="card-surface card-surface-hover border border-border p-4 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-700 shrink-0', colorClass)}>
                      {getInitials(item.fields.teilnehmer_firstname, item.fields.teilnehmer_lastname)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-700 text-sm text-foreground truncate">
                        {item.fields.teilnehmer_firstname} {item.fields.teilnehmer_lastname}
                      </p>
                      {item.fields.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          {item.fields.email}
                        </p>
                      )}
                      {item.fields.telefon && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 shrink-0" />
                          {item.fields.telefon}
                        </p>
                      )}
                      {item.fields.geburtsdatum && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Geb.: {formatDate(item.fields.geburtsdatum)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-smooth shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(item.record_id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-700">{editItem ? 'Teilnehmer bearbeiten' : 'Neuen Teilnehmer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Vorname *</Label>
                <Input {...register('teilnehmer_firstname', { required: true })} placeholder="Max" className={cn(errors.teilnehmer_firstname && 'border-destructive')} />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Nachname *</Label>
                <Input {...register('teilnehmer_lastname', { required: true })} placeholder="Mustermann" className={cn(errors.teilnehmer_lastname && 'border-destructive')} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">E-Mail</Label>
              <Input type="email" {...register('email')} placeholder="max@beispiel.de" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Telefon</Label>
                <Input {...register('telefon')} placeholder="+49 123 456789" />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Geburtsdatum</Label>
                <Input type="date" {...register('geburtsdatum')} />
              </div>
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
        title="Teilnehmer löschen?"
        description="Dieser Teilnehmer wird dauerhaft aus dem System entfernt."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
