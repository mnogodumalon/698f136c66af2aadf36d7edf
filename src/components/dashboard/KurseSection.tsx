import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from './ConfirmDialog';
import { LivingAppsService, createRecordUrl, extractRecordId } from '@/services/livingAppsService';
import type { Kurse, CreateKurse, Raeume, Dozenten } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function KurseSection() {
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Kurse | null>(null);
  const [form, setForm] = useState<CreateKurse>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [k, r, d] = await Promise.all([
        LivingAppsService.getKurse(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getDozenten(),
      ]);
      setKurse(k);
      setRaeume(r);
      setDozenten(d);
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

  const openEdit = (k: Kurse) => {
    setEditing(k);
    setForm({
      ...k.fields,
      raum: k.fields.raum ? extractRecordId(k.fields.raum) ?? undefined : undefined,
      dozent: k.fields.dozent ? extractRecordId(k.fields.dozent) ?? undefined : undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: CreateKurse = {
        ...form,
        raum: form.raum ? createRecordUrl(APP_IDS.RAEUME, form.raum) : undefined,
        dozent: form.dozent ? createRecordUrl(APP_IDS.DOZENTEN, form.dozent) : undefined,
      };
      if (editing) {
        await LivingAppsService.updateKurseEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createKurseEntry(fields);
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
      await LivingAppsService.deleteKurseEntry(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d), 'dd.MM.yyyy', { locale: de }); }
    catch { return d; }
  };

  const getRaumName = (url?: string) => {
    const id = extractRecordId(url);
    const r = raeume.find((r) => r.record_id === id);
    return r?.fields.raumname ?? '—';
  };

  const getDozentName = (url?: string) => {
    const id = extractRecordId(url);
    const d = dozenten.find((d) => d.record_id === id);
    if (!d) return '—';
    return `${d.fields.dozent_firstname ?? ''} ${d.fields.dozent_lastname ?? ''}`.trim() || '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Kurse</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{kurse.length} Kurse verwaltet</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Kurs hinzufügen
        </Button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Lädt…</div>
        ) : kurse.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Noch keine Kurse erfasst.</p>
            <Button variant="outline" onClick={openCreate} className="mt-4">Ersten Kurs anlegen</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Titel</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden md:table-cell" style={{ fontWeight: 600 }}>Zeitraum</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden lg:table-cell" style={{ fontWeight: 600 }}>Dozent</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden lg:table-cell" style={{ fontWeight: 600 }}>Preis</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {kurse.map((k) => (
                <tr
                  key={k.record_id}
                  className="border-b border-border last:border-0 transition-smooth"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.975 0.004 250)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-600" style={{ fontWeight: 600 }}>{k.fields.titel || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{getRaumName(k.fields.raum)}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    {k.fields.startdatum ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatDate(k.fields.startdatum)}</span>
                        {k.fields.enddatum && <span>– {formatDate(k.fields.enddatum)}</span>}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">{getDozentName(k.fields.dozent)}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {k.fields.preis != null ? (
                      <span className="font-600" style={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(k.fields.preis)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(k)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(k.record_id)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>Titel</Label>
              <Input value={form.titel ?? ''} onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))} placeholder="z.B. Python Grundlagen" />
            </div>
            <div className="space-y-1.5">
              <Label>Beschreibung</Label>
              <Textarea value={form.beschreibung ?? ''} onChange={(e) => setForm((f) => ({ ...f, beschreibung: e.target.value }))} placeholder="Kurzbeschreibung…" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Startdatum</Label>
                <Input type="date" value={form.startdatum ?? ''} onChange={(e) => setForm((f) => ({ ...f, startdatum: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Enddatum</Label>
                <Input type="date" value={form.enddatum ?? ''} onChange={(e) => setForm((f) => ({ ...f, enddatum: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Max. Teilnehmer</Label>
                <Input type="number" value={form.max_teilnehmer ?? ''} onChange={(e) => setForm((f) => ({ ...f, max_teilnehmer: Number(e.target.value) || undefined }))} placeholder="20" />
              </div>
              <div className="space-y-1.5">
                <Label>Preis (EUR)</Label>
                <Input type="number" step="0.01" value={form.preis ?? ''} onChange={(e) => setForm((f) => ({ ...f, preis: Number(e.target.value) || undefined }))} placeholder="299.00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Raum</Label>
              <Select value={form.raum ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, raum: v || undefined }))}>
                <SelectTrigger><SelectValue placeholder="Raum auswählen" /></SelectTrigger>
                <SelectContent>
                  {raeume.map((r) => (
                    <SelectItem key={r.record_id} value={r.record_id}>{r.fields.raumname}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dozent</Label>
              <Select value={form.dozent ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, dozent: v || undefined }))}>
                <SelectTrigger><SelectValue placeholder="Dozent auswählen" /></SelectTrigger>
                <SelectContent>
                  {dozenten.map((d) => (
                    <SelectItem key={d.record_id} value={d.record_id}>
                      {d.fields.dozent_firstname} {d.fields.dozent_lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        title="Kurs löschen"
        message="Möchtest du diesen Kurs wirklich löschen? Alle zugehörigen Anmeldungen bleiben erhalten."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
