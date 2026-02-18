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
import type { Teilnehmer, CreateTeilnehmer } from '@/types/app';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function TeilnehmerSection() {
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Teilnehmer | null>(null);
  const [form, setForm] = useState<CreateTeilnehmer>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setTeilnehmer(await LivingAppsService.getTeilnehmer());
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

  const openEdit = (t: Teilnehmer) => {
    setEditing(t);
    setForm({ ...t.fields });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await LivingAppsService.updateTeilnehmerEntry(editing.record_id, form);
      } else {
        await LivingAppsService.createTeilnehmerEntry(form);
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
      await LivingAppsService.deleteTeilnehmerEntry(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      return format(new Date(d), 'dd.MM.yyyy', { locale: de });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Teilnehmer</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{teilnehmer.length} Teilnehmer registriert</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Teilnehmer hinzufügen
        </Button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Lädt…</div>
        ) : teilnehmer.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Noch keine Teilnehmer registriert.</p>
            <Button variant="outline" onClick={openCreate} className="mt-4">Ersten Teilnehmer anlegen</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Name</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden md:table-cell" style={{ fontWeight: 600 }}>E-Mail</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden lg:table-cell" style={{ fontWeight: 600 }}>Geburtsdatum</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {teilnehmer.map((t) => (
                <tr
                  key={t.record_id}
                  className="border-b border-border last:border-0 transition-smooth"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.975 0.004 250)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                        style={{ background: 'oklch(0.75 0.175 70 / 0.15)', color: 'oklch(0.50 0.14 70)', fontWeight: 700 }}
                      >
                        {(t.fields.teilnehmer_firstname?.[0] ?? '') + (t.fields.teilnehmer_lastname?.[0] ?? '')}
                      </div>
                      <span className="font-500" style={{ fontWeight: 500 }}>
                        {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{t.fields.email || '—'}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">{formatDate(t.fields.geburtsdatum)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(t.record_id)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
            <DialogTitle>{editing ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Vorname</Label>
                <Input value={form.teilnehmer_firstname ?? ''} onChange={(e) => setForm((f) => ({ ...f, teilnehmer_firstname: e.target.value }))} placeholder="Anna" />
              </div>
              <div className="space-y-1.5">
                <Label>Nachname</Label>
                <Input value={form.teilnehmer_lastname ?? ''} onChange={(e) => setForm((f) => ({ ...f, teilnehmer_lastname: e.target.value }))} placeholder="Schmidt" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-Mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="anna@beispiel.de" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.telefon ?? ''} onChange={(e) => setForm((f) => ({ ...f, telefon: e.target.value }))} placeholder="+49 123 456789" />
            </div>
            <div className="space-y-1.5">
              <Label>Geburtsdatum</Label>
              <Input type="date" value={form.geburtsdatum ?? ''} onChange={(e) => setForm((f) => ({ ...f, geburtsdatum: e.target.value }))} />
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
        title="Teilnehmer löschen"
        message="Möchtest du diesen Teilnehmer wirklich löschen?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
