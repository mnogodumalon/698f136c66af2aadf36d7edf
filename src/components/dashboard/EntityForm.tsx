import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Dozenten, Raeume, Teilnehmer, CreateDozenten, CreateRaeume, CreateTeilnehmer } from "@/types/app";

// Instructor Form
interface InstructorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor?: Dozenten | null;
  onSubmit: (data: CreateDozenten) => Promise<void>;
}

export function InstructorForm({ open, onOpenChange, instructor, onSubmit }: InstructorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateDozenten>({
    dozent_firstname: "",
    dozent_lastname: "",
    email: "",
    telefon: "",
    fachgebiet: "",
  });

  useEffect(() => {
    if (instructor) {
      setFormData({
        dozent_firstname: instructor.fields.dozent_firstname || "",
        dozent_lastname: instructor.fields.dozent_lastname || "",
        email: instructor.fields.email || "",
        telefon: instructor.fields.telefon || "",
        fachgebiet: instructor.fields.fachgebiet || "",
      });
    } else {
      setFormData({
        dozent_firstname: "",
        dozent_lastname: "",
        email: "",
        telefon: "",
        fachgebiet: "",
      });
    }
  }, [instructor, open]);

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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {instructor ? "Dozent bearbeiten" : "Neuer Dozent"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dozent_firstname">Vorname *</Label>
              <Input
                id="dozent_firstname"
                value={formData.dozent_firstname}
                onChange={(e) => setFormData({ ...formData, dozent_firstname: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dozent_lastname">Nachname *</Label>
              <Input
                id="dozent_lastname"
                value={formData.dozent_lastname}
                onChange={(e) => setFormData({ ...formData, dozent_lastname: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fachgebiet">Fachgebiet</Label>
            <Input
              id="fachgebiet"
              value={formData.fachgebiet}
              onChange={(e) => setFormData({ ...formData, fachgebiet: e.target.value })}
              placeholder="z.B. Informatik, BWL..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : instructor ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Room Form
interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Raeume | null;
  onSubmit: (data: CreateRaeume) => Promise<void>;
}

export function RoomForm({ open, onOpenChange, room, onSubmit }: RoomFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRaeume>({
    raumname: "",
    gebaeude: "",
    kapazitaet: 20,
  });

  useEffect(() => {
    if (room) {
      setFormData({
        raumname: room.fields.raumname || "",
        gebaeude: room.fields.gebaeude || "",
        kapazitaet: room.fields.kapazitaet || 20,
      });
    } else {
      setFormData({
        raumname: "",
        gebaeude: "",
        kapazitaet: 20,
      });
    }
  }, [room, open]);

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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {room ? "Raum bearbeiten" : "Neuer Raum"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raumname">Raumname *</Label>
            <Input
              id="raumname"
              value={formData.raumname}
              onChange={(e) => setFormData({ ...formData, raumname: e.target.value })}
              placeholder="z.B. Raum A101"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gebaeude">Gebäude</Label>
            <Input
              id="gebaeude"
              value={formData.gebaeude}
              onChange={(e) => setFormData({ ...formData, gebaeude: e.target.value })}
              placeholder="z.B. Hauptgebäude"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kapazitaet">Kapazität</Label>
            <Input
              id="kapazitaet"
              type="number"
              min={1}
              value={formData.kapazitaet}
              onChange={(e) => setFormData({ ...formData, kapazitaet: parseInt(e.target.value) || 20 })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : room ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Participant Form
interface ParticipantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant?: Teilnehmer | null;
  onSubmit: (data: CreateTeilnehmer) => Promise<void>;
}

export function ParticipantForm({ open, onOpenChange, participant, onSubmit }: ParticipantFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTeilnehmer>({
    teilnehmer_firstname: "",
    teilnehmer_lastname: "",
    email: "",
    telefon: "",
    geburtsdatum: "",
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        teilnehmer_firstname: participant.fields.teilnehmer_firstname || "",
        teilnehmer_lastname: participant.fields.teilnehmer_lastname || "",
        email: participant.fields.email || "",
        telefon: participant.fields.telefon || "",
        geburtsdatum: participant.fields.geburtsdatum || "",
      });
    } else {
      setFormData({
        teilnehmer_firstname: "",
        teilnehmer_lastname: "",
        email: "",
        telefon: "",
        geburtsdatum: "",
      });
    }
  }, [participant, open]);

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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {participant ? "Teilnehmer bearbeiten" : "Neuer Teilnehmer"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teilnehmer_firstname">Vorname *</Label>
              <Input
                id="teilnehmer_firstname"
                value={formData.teilnehmer_firstname}
                onChange={(e) => setFormData({ ...formData, teilnehmer_firstname: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teilnehmer_lastname">Nachname *</Label>
              <Input
                id="teilnehmer_lastname"
                value={formData.teilnehmer_lastname}
                onChange={(e) => setFormData({ ...formData, teilnehmer_lastname: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              value={formData.telefon}
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geburtsdatum">Geburtsdatum</Label>
            <Input
              id="geburtsdatum"
              type="date"
              value={formData.geburtsdatum}
              onChange={(e) => setFormData({ ...formData, geburtsdatum: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Speichern..." : participant ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
