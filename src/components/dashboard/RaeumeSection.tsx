import { useState } from 'react';
import { Pencil, Trash2, DoorOpen, Building, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Raeume } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

interface RaeumeSectionProps {
  raeume: Raeume[];
  onRefresh: () => void;
}

interface RaeumeForm {
  raumname: string;
  gebaeude: string;
  kapazitaet: number;
}

export function RaeumeSection({ raeume, onRefresh }: RaeumeSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Raeume | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RaeumeForm>();

  const openCreate = () => {
    setEditItem(null);
    reset({ raumname: '', gebaeude: '', kapazitaet: 20 });
    setDialogOpen(true);
  };

  const openEdit = (item: Raeume) => {
    setEditItem(item);
    reset({
      raumname: item.fields.raumname ?? '',
      gebaeude: item.fields.gebaeude ?? '',
      kapazitaet: item.fields.kapazitaet ?? 20,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: RaeumeForm) => {
    setSaving(true);
    try {
      const fields: Raeume['fields'] = {
        raumname: data.raumname,
        gebaeude: data.gebaeude || undefined,
        kapazitaet: Number(data.kapazitaet),
      };
      if (editItem) {
        await LivingAppsService.updateRaeumeEntry(editItem.record_id, fields);
      } else {
        await LivingAppsService.createRaeumeEntry(fields);
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
      await LivingAppsService.deleteRaeumeEntry(deleteId);
      setDeleteId(null);
      onRefresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Räume"
        description={`${raeume.length} Raum${raeume.length !== 1 ? '̈e' : ''} verfügbar`}
        actionLabel="Raum hinzufügen"
        onAction={openCreate}
      />

      {raeume.length === 0 ? (
        <div className="card-surface border border-border">
          <EmptyState
            icon={DoorOpen}
            title="Noch keine Räume"
            description="Legen Sie Räume an, die für Kurse genutzt werden können."
            actionLabel="Raum hinzufügen"
            onAction={openCreate}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {raeume.map((item) => (
            <div key={item.record_id} className="card-surface card-surface-hover border border-border p-4 group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                    <DoorOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-700 text-sm text-foreground truncate">{item.fields.raumname ?? '–'}</p>
                    {item.fields.gebaeude && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" />
                        {item.fields.gebaeude}
                      </p>
                    )}
                    {item.fields.kapazitaet != null && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        Kapazität: {item.fields.kapazitaet}
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-700">{editItem ? 'Raum bearbeiten' : 'Neuen Raum hinzufügen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Raumname *</Label>
              <Input {...register('raumname', { required: true })} placeholder="z.B. Raum 101" className={cn(errors.raumname && 'border-destructive')} />
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Gebäude</Label>
              <Input {...register('gebaeude')} placeholder="z.B. Hauptgebäude" />
            </div>
            <div>
              <Label className="text-xs font-600 mb-1.5 block">Kapazität</Label>
              <Input type="number" min={1} {...register('kapazitaet')} />
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
        title="Raum löschen?"
        description="Dieser Raum wird dauerhaft entfernt."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
