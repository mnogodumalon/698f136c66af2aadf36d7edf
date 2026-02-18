import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Kurse, Teilnehmer, Anmeldungen, CreateAnmeldungen } from "@/types/app";

interface RegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration?: Anmeldungen | null;
  courses: Kurse[];
  participants: Teilnehmer[];
  onSubmit: (data: CreateAnmeldungen) => Promise<void>;
}

export function RegistrationForm({
  open,
  onOpenChange,
  registration,
  courses,
  participants,
  onSubmit
}: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAnmeldungen>({
    teilnehmer: "",
    kurs: "",
    anmeldedatum: new Date().toISOString().split("T")[0],
    bezahlt: false,
  });

  useEffect(() => {
    if (registration) {
      setFormData({
        teilnehmer: registration.fields.teilnehmer || "",
        kurs: registration.fields.kurs || "",
        anmeldedatum: registration.fields.anmeldedatum || new Date().toISOString().split("T")[0],
        bezahlt: registration.fields.bezahlt || false,
      });
    } else {
      setFormData({
        teilnehmer: "",
        kurs: "",
        anmeldedatum: new Date().toISOString().split("T")[0],
        bezahlt: false,
      });
    }
  }, [registration, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teilnehmer || !formData.kurs) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {registration ? "Anmeldung bearbeiten" : "Neue Anmeldung"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teilnehmer">Teilnehmer *</Label>
            <Select
              value={formData.teilnehmer || ""}
              onValueChange={(value) => setFormData({ ...formData, teilnehmer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Teilnehmer auswählen" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.record_id} value={p.record_id}>
                    {p.fields.teilnehmer_firstname} {p.fields.teilnehmer_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kurs">Kurs *</Label>
            <Select
              value={formData.kurs || ""}
              onValueChange={(value) => setFormData({ ...formData, kurs: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kurs auswählen" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.record_id} value={c.record_id}>
                    {c.fields.titel || "Unbenannt"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="bezahlt"
              checked={formData.bezahlt}
              onCheckedChange={(checked) => setFormData({ ...formData, bezahlt: checked === true })}
            />
            <Label htmlFor="bezahlt" className="cursor-pointer">
              Bezahlt
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !formData.teilnehmer || !formData.kurs}>
              {loading ? "Speichern..." : registration ? "Aktualisieren" : "Anmelden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
