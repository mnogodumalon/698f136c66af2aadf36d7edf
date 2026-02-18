import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import type { Anmeldungen, CreateAnmeldungen, Kurse, Teilnehmer } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function AnmeldungenSection() {
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Anmeldungen | null>(null);
  const [form, setForm] = useState<CreateAnmeldungen & { teilnehmerRaw?: string; kursRaw?: string }>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [a, k, t] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getKurse(),
        LivingAppsService.getTeilnehmer(),
      ]);
      setAnmeldungen(a);
      setKurse(k);
      setTeilnehmer(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ bezahlt: false, anmeldedatum: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };

  const openEdit = (a: Anmeldungen) => {
    setEditing(a);
    setForm({
      ...a.fields,
      teilnehmerRaw: extractRecordId(a.fields.teilnehmer) ?? undefined,
      kursRaw: extractRecordId(a.fields.kurs) ?? undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields: CreateAnmeldungen = {
        bezahlt: form.bezahlt,
        anmeldedatum: form.anmeldedatum,
        teilnehmer: form.teilnehmerRaw ? createRecordUrl(APP_IDS.TEILNEHMER, form.teilnehmerRaw) : undefined,
        kurs: form.kursRaw ? createRecordUrl(APP_IDS.KURSE, form.kursRaw) : undefined,
      };
      if (editing) {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields);
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields);
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
      await LivingAppsService.deleteAnmeldungenEntry(deleteId);
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

  const getKursTitel = (url?: string) => {
    const id = extractRecordId(url);
    return kurse.find((k) => k.record_id === id)?.fields.titel ?? '—';
  };

  const getTeilnehmerName = (url?: string) => {
    const id = extractRecordId(url);
    const t = teilnehmer.find((t) => t.record_id === id);
    if (!t) return '—';
    return `${t.fields.teilnehmer_firstname ?? ''} ${t.fields.teilnehmer_lastname ?? ''}`.trim() || '—';
  };

  const toggleBezahlt = async (a: Anmeldungen) => {
    await LivingAppsService.updateAnmeldungenEntry(a.record_id, { bezahlt: !a.fields.bezahlt });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700" style={{ fontWeight: 700 }}>Anmeldungen</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {anmeldungen.length} Anmeldungen ·{' '}
            <span style={{ color: 'oklch(0.65 0.16 155)' }}>
              {anmeldungen.filter((a) => a.fields.bezahlt).length} bezahlt
            </span>
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Anmeldung erfassen
        </Button>
      </div>

      <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Lädt…</div>
        ) : anmeldungen.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Noch keine Anmeldungen erfasst.</p>
            <Button variant="outline" onClick={openCreate} className="mt-4">Erste Anmeldung erfassen</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Teilnehmer</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Kurs</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide hidden md:table-cell" style={{ fontWeight: 600 }}>Datum</th>
                <th className="px-5 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide" style={{ fontWeight: 600 }}>Zahlung</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {anmeldungen.map((a) => (
                <tr
                  key={a.record_id}
                  className="border-b border-border last:border-0 transition-smooth"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(0.975 0.004 250)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="px-5 py-3.5 font-500" style={{ fontWeight: 500 }}>{getTeilnehmerName(a.fields.teilnehmer)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{getKursTitel(a.fields.kurs)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{formatDate(a.fields.anmeldedatum)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleBezahlt(a)}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-600 transition-smooth"
                      style={
                        a.fields.bezahlt
                          ? { background: 'oklch(0.65 0.16 155 / 0.15)', color: 'oklch(0.42 0.13 155)', fontWeight: 600 }
                          : { background: 'oklch(0.65 0.20 15 / 0.12)', color: 'oklch(0.50 0.18 15)', fontWeight: 600 }
                      }
                      title="Klicken zum Umschalten"
                    >
                      {a.fields.bezahlt ? '✓ Bezahlt' : '○ Offen'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(a.record_id)} className="p-1.5 rounded transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
            <DialogTitle>{editing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Teilnehmer</Label>
              <Select value={form.teilnehmerRaw ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, teilnehmerRaw: v || undefined }))}>
                <SelectTrigger><SelectValue placeholder="Teilnehmer auswählen" /></SelectTrigger>
                <SelectContent>
                  {teilnehmer.map((t) => (
                    <SelectItem key={t.record_id} value={t.record_id}>
                      {t.fields.teilnehmer_firstname} {t.fields.teilnehmer_lastname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Kurs</Label>
              <Select value={form.kursRaw ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, kursRaw: v || undefined }))}>
                <SelectTrigger><SelectValue placeholder="Kurs auswählen" /></SelectTrigger>
                <SelectContent>
                  {kurse.map((k) => (
                    <SelectItem key={k.record_id} value={k.record_id}>{k.fields.titel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Anmeldedatum</Label>
              <Input type="date" value={form.anmeldedatum ?? ''} onChange={(e) => setForm((f) => ({ ...f, anmeldedatum: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Zahlungsstatus</Label>
              <Select value={form.bezahlt ? 'true' : 'false'} onValueChange={(v) => setForm((f) => ({ ...f, bezahlt: v === 'true' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Offen</SelectItem>
                  <SelectItem value="true">Bezahlt</SelectItem>
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
        title="Anmeldung löschen"
        message="Möchtest du diese Anmeldung wirklich löschen?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
