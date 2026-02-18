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
import type { Dozenten, CreateDozenten } from '@/types/app';

export function DozentSection() {
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Dozenten | null>(null);
  const [form, setForm] = useState<CreateDozenten>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setDozenten(await LivingAppsService.getDozenten());
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

  const openEdit = (d: Dozenten) => {
    setEditing(d);
    setForm({ ...d.fields });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await LivingAppsService.updateDozentenEntry(editing.record_id, form);
      } else {
        await LivingAppsService.createDozentenEntry(form);
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
      await LivingAppsService.deleteDozentenEntry(deleteId);
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
          <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Dozenten</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{dozenten.length} Dozenten erfasst</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Dozent hinzufügen
        </Button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Lädt…</div>
        ) : dozenten.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Noch keine Dozenten erfasst.</p>
            <Button variant="outline" onClick={openCreate} className="mt-4">Ersten Dozenten anlegen</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Name</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden md:table-cell" style={{ fontWeight: 600 }}>E-Mail</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden lg:table-cell" style={{ fontWeight: 600 }}>Fachgebiet</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {dozenten.map((d) => (
                <tr
                  key={d.record_id}
                  className="border-b border-border last:border-0 transition-smooth"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.975 0.004 250)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                        style={{ background: 'oklch(0.65 0.12 185 / 0.15)', color: 'oklch(0.45 0.10 185)', fontWeight: 700 }}
                      >
                        {(d.fields.dozent_firstname?.[0] ?? '') + (d.fields.dozent_lastname?.[0] ?? '')}
                      </div>
                      <span className="font-500" style={{ fontWeight: 500 }}>
                        {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{d.fields.email || '—'}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {d.fields.fachgebiet ? (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                        style={{ background: 'oklch(0.65 0.12 185 / 0.1)', color: 'oklch(0.42 0.10 185)' }}
                      >
                        {d.fields.fachgebiet}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(d)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(d.record_id)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
            <DialogTitle>{editing ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vorname</Label>
                <Input value={form.dozent_firstname ?? ''} onChange={(e) => setForm((f) => ({ ...f, dozent_firstname: e.target.value }))} placeholder="Max" />
              </div>
              <div className="space-y-1.5">
                <Label>Nachname</Label>
                <Input value={form.dozent_lastname ?? ''} onChange={(e) => setForm((f) => ({ ...f, dozent_lastname: e.target.value }))} placeholder="Mustermann" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-Mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="max@beispiel.de" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.telefon ?? ''} onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="+49 123 456789" />
            </div>
            <div className="space-y-1.5">
              <Label>Fachgebiet</Label>
              <Input value={form.fachgebiet ?? ''} onChange={(e) => setForm((f) => ({ ...f, fachgebiet: e.target.value }))} placeholder="z.B. Informatik" />
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
        title="Dozent löschen"
        message="Möchtest du diesen Dozenten wirklich löschen?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
