import { useState } from 'react';
import { Pencil, Trash2, UserCheck, Mail, Phone, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Dozenten } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

interface DozentenSectionProps {
  dozenten: Dozenten[];
  onRefresh: () => void;
}

interface DozentenForm {
  dozent_firstname: string;
  dozent_lastname: string;
  email: string;
  telefon: string;
  fachgebiet: string;
}

function getInitials(f?: string, l?: string) {
  return `${(f ?? '')[0] ?? ''}${(l ?? '')[0] ?? ''}`.toUpperCase() || '?';
}

export function DozentenSection({ dozenten, onRefresh }: DozentenSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dozenten | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DozentenForm>();

  const openCreate = () => {
    setEditItem(null);
    reset({ dozent_firstname: '', dozent_lastname: '', email: '', telefon: '', fachgebiet: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Dozenten) => {
    setEditItem(item);
    reset({
      dozent_firstname: item.fields.dozent_firstname ?? '',
      dozent_lastname: item.fields.dozent_lastname ?? '',
      email: item.fields.email ?? '',
      telefon: item.fields.telefon ?? '',
      fachgebiet: item.fields.fachgebiet ?? '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: DozentenForm) => {
    setSaving(true);
    try {
      const fields: Dozenten['fields'] = {
        dozent_firstname: data.dozent_firstname,
        dozent_lastname: data.dozent_lastname,
        email: data.email || undefined,
        telefon: data.telefon || undefined,
        fachgebiet: data.fachgebiet || undefined,
      };
      if (editItem) {
        await LivingAppsService.updateDozentenEntry(editItem.record_id, fields);
      } else {
        await LivingAppsService.createDozentenEntry(fields);
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
      await LivingAppsService.deleteDozentenEntry(deleteId);
      setDeleteId(null);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Dozenten"
        description={`${dozenten.length} Dozent${dozenten.length !== 1 ? 'en' : ''} registriert`}
        actionLabel="Dozent hinzufügen"
        onAction={openCreate}
      />

      {dozenten.length === 0 ? (
        <div className="card-surface border border-border">
          <EmptyState
            icon={UserCheck}
            title="Noch keine Dozenten"
            description="Fügen Sie Dozenten hinzu, die Kurse leiten."
            actionLabel="Dozent hinzufügen"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dozenten.map((item) => (
            <div key={item.record_id} className="card-surface card-surface-hover border border-border p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-sm font-700 text-primary shrink-0">
                    {getInitials(item.fields.dozent_firstname, item.fields.dozent_lastname)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-700 text-sm text-foreground truncate">
                      {item.fields.dozent_firstname} {item.fields.dozent_lastname}
                    </p>
                    {item.fields.fachgebiet && (
                      <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-600">
                        <BookOpen className="w-3 h-3" />
                        {item.fields.fachgebiet}
                      </span>
                    )}
                    {item.fields.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
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
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-700">{editItem ? 'Dozent bearbeiten' : 'Neuen Dozenten hinzufügen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Vorname *</Label>
                <Input {...register('dozent_firstname', { required: true })} placeholder="Anna" className={cn(errors.dozent_firstname && 'border-destructive')} />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Nachname *</Label>
                <Input {...register('dozent_lastname', { required: true })} placeholder="Müller" className={cn(errors.dozent_lastname && 'border-destructive')} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">E-Mail</Label>
              <Input type="email" {...register('email')} placeholder="a.mueller@schule.de" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Telefon</Label>
                <Input {...register('telefon')} placeholder="+49 123 456789" />
              </div>
              <div>
                <Label className="text-xs font-600 mb-1.5 block">Fachgebiet</Label>
                <Input {...register('fachgebiet')} placeholder="Mathematik" />
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
        title="Dozent löschen?"
        description="Dieser Dozent wird dauerhaft entfernt. Kurse behalten die Zuordnung weiterhin gespeichert."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
