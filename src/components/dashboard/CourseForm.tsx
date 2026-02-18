import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type { Kurse, Dozenten, Raeume, CreateKurse } from "@/types/app";

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Kurse | null;
  instructors: Dozenten[];
  rooms: Raeume[];
  onSubmit: (data: CreateKurse) => Promise<void>;
}

export function CourseForm({ open, onOpenChange, course, instructors, rooms, onSubmit }: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateKurse>({
    titel: "",
    beschreibung: "",
    startdatum: "",
    enddatum: "",
    max_teilnehmer: 20,
    preis: 0,
    dozent: "",
    raum: "",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        titel: course.fields.titel || "",
        beschreibung: course.fields.beschreibung || "",
        startdatum: course.fields.startdatum || "",
        enddatum: course.fields.enddatum || "",
        max_teilnehmer: course.fields.max_teilnehmer || 20,
        preis: course.fields.preis || 0,
        dozent: course.fields.dozent || "",
        raum: course.fields.raum || "",
      });
    } else {
      setFormData({
        titel: "",
        beschreibung: "",
        startdatum: "",
        enddatum: "",
        max_teilnehmer: 20,
        preis: 0,
        dozent: "",
        raum: "",
      });
    }
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {course ? "Kurs bearbeiten" : "Neuer Kurs"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titel">Titel *</Label>
            <Input
              id="titel"
              value={formData.titel}
              onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
              placeholder="z.B. Excel Grundkurs"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
              placeholder="Kursbeschreibung..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startdatum">Startdatum</Label>
              <Input
                id="startdatum"
                type="date"
                value={formData.startdatum}
                onChange={(e) => setFormData({ ...formData, startdatum: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enddatum">Enddatum</Label>
              <Input
                id="enddatum"
                type="date"
                value={formData.enddatum}
                onChange={(e) => setFormData({ ...formData, enddatum: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_teilnehmer">Max. Teilnehmer</Label>
              <Input
                id="max_teilnehmer"
                type="number"
                min={1}
                value={formData.max_teilnehmer}
                onChange={(e) => setFormData({ ...formData, max_teilnehmer: parseInt(e.target.value) || 20 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preis">Preis (€)</Label>
              <Input
                id="preis"
                type="number"
                min={0}
                step={0.01}
                value={formData.preis}
                onChange={(e) => setFormData({ ...formData, preis: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dozent">Dozent</Label>
            <Select
              value={formData.dozent || "none"}
              onValueChange={(value) => setFormData({ ...formData, dozent: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dozent auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Dozent</SelectItem>
                {instructors.map((inst) => (
                  <SelectItem key={inst.record_id} value={inst.record_id}>
                    {inst.fields.dozent_firstname} {inst.fields.dozent_lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raum">Raum</Label>
            <Select
              value={formData.raum || "none"}
              onValueChange={(value) => setFormData({ ...formData, raum: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Raum auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Raum</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.record_id} value={room.record_id}>
                    {room.fields.raumname}
                    {room.fields.gebaeude && ` (${room.fields.gebaeude})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : course ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
