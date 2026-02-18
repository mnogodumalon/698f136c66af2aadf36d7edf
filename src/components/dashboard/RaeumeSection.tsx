import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from './ConfirmDialog';
import { LivingAppsService } from '@/services/livingAppsService';
import type { Raeume, CreateRaeume } from '@/types/app';

export function RaeumeSection() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Raeume | null>(null);
  const [form, setForm] = useState<CreateRaeume>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setRaeume(await LivingAppsService.getRaeume());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setDialogOpen(true);
  };

  const openEdit = (r: Raeume) => {
    setEditing(r);
    setForm({ ...r.fields });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await LivingAppsService.updateRaeumeEntry(editing.record_id, form);
      } else {
        await LivingAppsService.createRaeumeEntry(form);
      }
      setDialogOpen(false);
      await load();
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
      await load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Räume</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{raeume.length} Räume verwaltet</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Raum hinzufügen
        </Button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Lädt…</div>
        ) : raeume.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Noch keine Räume erfasst.</p>
            <Button variant="outline" onClick={openCreate} className="mt-4">Ersten Raum anlegen</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Raum</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Gebäude</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Kapazität</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {raeume.map((r) => (
                <tr
                  key={r.record_id}
                  className="border-b border-border last:border-0 transition-smooth"
                  style={{ cursor: 'default' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.975 0.004 250)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-5 py-3.5 font-500" style={{ fontWeight: 500 }}>{r.fields.raumname || '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.fields.gebaeude || '—'}</td>
                  <td className="px-5 py-3.5">
                    {r.fields.kapazitaet != null ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-500"
                        style={{ background: 'oklch(0.55 0.18 270 / 0.1)', color: 'oklch(0.40 0.16 270)', fontWeight: 500 }}
                      >
                        {r.fields.kapazitaet} Plätze
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r.record_id)}
                        className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Raumname</Label>
              <Input value={form.raumname ?? ''} onChange={(e) => setForm((f) => ({ ...f, raumname: e.target.value }))} placeholder="z.B. Seminarraum A1" />
            </div>
            <div className="space-y-1.5">
              <Label>Gebäude</Label>
              <Input value={form.gebaeude ?? ''} onChange={(e) => setForm((f) => ({ ...f, gebaeude: e.target.value }))} placeholder="z.B. Hauptgebäude" />
            </div>
            <div className="space-y-1.5">
              <Label>Kapazität</Label>
              <Input type="number" value={form.kapazitaet ?? ''} onChange={(e) => setForm((f) => ({ ...f, kapazitaet: Number(e.target.value) || undefined }))} placeholder="z.B. 20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Speichern…' : 'Speichern'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Raum löschen"
        message="Möchtest du diesen Raum wirklich löschen? Dies kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
