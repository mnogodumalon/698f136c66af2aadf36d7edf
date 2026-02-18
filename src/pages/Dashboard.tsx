import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Users,
  GraduationCap,
  DoorOpen,
  Plus,
  ClipboardList,
  TrendingUp,
  Euro,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { CourseCard } from "@/components/dashboard/CourseCard";
import { CourseForm } from "@/components/dashboard/CourseForm";
import { RegistrationForm } from "@/components/dashboard/RegistrationForm";
import { InstructorForm, RoomForm, ParticipantForm } from "@/components/dashboard/EntityForm";
import { DataTable } from "@/components/dashboard/DataTable";

import { LivingAppsService, extractRecordId, createRecordUrl } from "@/services/livingAppsService";
import { APP_IDS } from "@/types/app";
import type {
  Kurse, Dozenten, Raeume, Teilnehmer, Anmeldungen,
  CreateKurse, CreateDozenten, CreateRaeume, CreateTeilnehmer, CreateAnmeldungen
} from "@/types/app";

export default function Dashboard() {
  // Data state
  const [courses, setCourses] = useState<Kurse[]>([]);
  const [instructors, setInstructors] = useState<Dozenten[]>([]);
  const [rooms, setRooms] = useState<Raeume[]>([]);
  const [participants, setParticipants] = useState<Teilnehmer[]>([]);
  const [registrations, setRegistrations] = useState<Anmeldungen[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Kurse | null>(null);
  const [registrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Anmeldungen | null>(null);
  const [instructorFormOpen, setInstructorFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Dozenten | null>(null);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Raeume | null>(null);
  const [participantFormOpen, setParticipantFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Teilnehmer | null>(null);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "course" | "instructor" | "room" | "participant" | "registration";
    id: string;
    name: string;
  } | null>(null);

  // Load all data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [coursesData, instructorsData, roomsData, participantsData, registrationsData] =
          await Promise.all([
            LivingAppsService.getKurse(),
            LivingAppsService.getDozenten(),
            LivingAppsService.getRaeume(),
            LivingAppsService.getTeilnehmer(),
            LivingAppsService.getAnmeldungen(),
          ]);
        setCourses(coursesData);
        setInstructors(instructorsData);
        setRooms(roomsData);
        setParticipants(participantsData);
        setRegistrations(registrationsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Fehler beim Laden der Daten");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Helper maps for lookups
  const instructorMap = useMemo(() =>
    new Map(instructors.map(i => [i.record_id, i])), [instructors]);
  const roomMap = useMemo(() =>
    new Map(rooms.map(r => [r.record_id, r])), [rooms]);
  const participantMap = useMemo(() =>
    new Map(participants.map(p => [p.record_id, p])), [participants]);
  const courseMap = useMemo(() =>
    new Map(courses.map(c => [c.record_id, c])), [courses]);

  // Get enrollment count per course
  const enrollmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    registrations.forEach(reg => {
      const courseId = extractRecordId(reg.fields.kurs);
      if (courseId) {
        counts.set(courseId, (counts.get(courseId) || 0) + 1);
      }
    });
    return counts;
  }, [registrations]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalRevenue = registrations.reduce((sum, reg) => {
      const courseId = extractRecordId(reg.fields.kurs);
      const course = courseId ? courseMap.get(courseId) : null;
      return sum + (course?.fields.preis || 0);
    }, 0);

    const paidRegistrations = registrations.filter(r => r.fields.bezahlt).length;

    return {
      totalCourses: courses.length,
      totalParticipants: participants.length,
      totalRegistrations: registrations.length,
      totalInstructors: instructors.length,
      totalRooms: rooms.length,
      totalRevenue,
      paidRegistrations,
    };
  }, [courses, participants, registrations, instructors, rooms, courseMap]);

  // CRUD handlers
  const handleCourseSubmit = async (data: CreateKurse) => {
    const payload = {
      ...data,
      dozent: data.dozent ? createRecordUrl(APP_IDS.DOZENTEN, data.dozent) : undefined,
      raum: data.raum ? createRecordUrl(APP_IDS.RAEUME, data.raum) : undefined,
    };

    if (editingCourse) {
      await LivingAppsService.updateKurseEntry(editingCourse.record_id, payload);
      setCourses(await LivingAppsService.getKurse());
      toast.success("Kurs aktualisiert");
    } else {
      await LivingAppsService.createKurseEntry(payload);
      setCourses(await LivingAppsService.getKurse());
      toast.success("Kurs erstellt");
    }
    setEditingCourse(null);
  };

  const handleRegistrationSubmit = async (data: CreateAnmeldungen) => {
    const payload = {
      ...data,
      teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, data.teilnehmer || ""),
      kurs: createRecordUrl(APP_IDS.KURSE, data.kurs || ""),
    };

    if (editingRegistration) {
      await LivingAppsService.updateAnmeldungenEntry(editingRegistration.record_id, payload);
      setRegistrations(await LivingAppsService.getAnmeldungen());
      toast.success("Anmeldung aktualisiert");
    } else {
      await LivingAppsService.createAnmeldungenEntry(payload);
      setRegistrations(await LivingAppsService.getAnmeldungen());
      toast.success("Anmeldung erstellt");
    }
    setEditingRegistration(null);
  };

  const handleInstructorSubmit = async (data: CreateDozenten) => {
    if (editingInstructor) {
      await LivingAppsService.updateDozentenEntry(editingInstructor.record_id, data);
      setInstructors(await LivingAppsService.getDozenten());
      toast.success("Dozent aktualisiert");
    } else {
      await LivingAppsService.createDozentenEntry(data);
      setInstructors(await LivingAppsService.getDozenten());
      toast.success("Dozent erstellt");
    }
    setEditingInstructor(null);
  };

  const handleRoomSubmit = async (data: CreateRaeume) => {
    if (editingRoom) {
      await LivingAppsService.updateRaeumeEntry(editingRoom.record_id, data);
      setRooms(await LivingAppsService.getRaeume());
      toast.success("Raum aktualisiert");
    } else {
      await LivingAppsService.createRaeumeEntry(data);
      setRooms(await LivingAppsService.getRaeume());
      toast.success("Raum erstellt");
    }
    setEditingRoom(null);
  };

  const handleParticipantSubmit = async (data: CreateTeilnehmer) => {
    if (editingParticipant) {
      await LivingAppsService.updateTeilnehmerEntry(editingParticipant.record_id, data);
      setParticipants(await LivingAppsService.getTeilnehmer());
      toast.success("Teilnehmer aktualisiert");
    } else {
      await LivingAppsService.createTeilnehmerEntry(data);
      setParticipants(await LivingAppsService.getTeilnehmer());
      toast.success("Teilnehmer erstellt");
    }
    setEditingParticipant(null);
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      switch (deleteDialog.type) {
        case "course":
          await LivingAppsService.deleteKurseEntry(deleteDialog.id);
          setCourses(await LivingAppsService.getKurse());
          break;
        case "instructor":
          await LivingAppsService.deleteDozentenEntry(deleteDialog.id);
          setInstructors(await LivingAppsService.getDozenten());
          break;
        case "room":
          await LivingAppsService.deleteRaeumeEntry(deleteDialog.id);
          setRooms(await LivingAppsService.getRaeume());
          break;
        case "participant":
          await LivingAppsService.deleteTeilnehmerEntry(deleteDialog.id);
          setParticipants(await LivingAppsService.getTeilnehmer());
          break;
        case "registration":
          await LivingAppsService.deleteAnmeldungenEntry(deleteDialog.id);
          setRegistrations(await LivingAppsService.getAnmeldungen());
          break;
      }
      toast.success("Erfolgreich gelöscht");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Fehler beim Löschen");
    }
    setDeleteDialog(null);
  };

  // Table columns
  const instructorColumns = [
    { key: "name", header: "Name", render: (i: Dozenten) => `${i.fields.dozent_firstname} ${i.fields.dozent_lastname}` },
    { key: "fachgebiet", header: "Fachgebiet", render: (i: Dozenten) => i.fields.fachgebiet || "-" },
    { key: "email", header: "E-Mail", render: (i: Dozenten) => i.fields.email || "-" },
    { key: "telefon", header: "Telefon", render: (i: Dozenten) => i.fields.telefon || "-" },
  ];

  const roomColumns = [
    { key: "raumname", header: "Raum", render: (r: Raeume) => r.fields.raumname },
    { key: "gebaeude", header: "Gebäude", render: (r: Raeume) => r.fields.gebaeude || "-" },
    { key: "kapazitaet", header: "Kapazität", render: (r: Raeume) => r.fields.kapazitaet || "-" },
  ];

  const participantColumns = [
    { key: "name", header: "Name", render: (p: Teilnehmer) => `${p.fields.teilnehmer_firstname} ${p.fields.teilnehmer_lastname}` },
    { key: "email", header: "E-Mail", render: (p: Teilnehmer) => p.fields.email || "-" },
    { key: "telefon", header: "Telefon", render: (p: Teilnehmer) => p.fields.telefon || "-" },
  ];

  const registrationColumns = [
    {
      key: "teilnehmer", header: "Teilnehmer", render: (r: Anmeldungen) => {
        const id = extractRecordId(r.fields.teilnehmer);
        const p = id ? participantMap.get(id) : null;
        return p ? `${p.fields.teilnehmer_firstname} ${p.fields.teilnehmer_lastname}` : "-";
      }
    },
    {
      key: "kurs", header: "Kurs", render: (r: Anmeldungen) => {
        const id = extractRecordId(r.fields.kurs);
        const c = id ? courseMap.get(id) : null;
        return c?.fields.titel || "-";
      }
    },
    {
      key: "bezahlt", header: "Status", render: (r: Anmeldungen) => (
        <Badge variant={r.fields.bezahlt ? "accent" : "secondary"}>
          {r.fields.bezahlt ? "Bezahlt" : "Offen"}
        </Badge>
      )
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Kursverwaltung</h1>
              <p className="text-muted-foreground">
                Verwalten Sie Kurse, Dozenten und Teilnehmer
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRegistrationFormOpen(true)}>
                <ClipboardList className="size-4" />
                Anmeldung
              </Button>
              <Button onClick={() => {
                setEditingCourse(null);
                setCourseFormOpen(true);
              }}>
                <Plus className="size-4" />
                Neuer Kurs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Aktive Kurse"
            value={stats.totalCourses}
            subtitle={`${stats.totalInstructors} Dozenten`}
            icon={BookOpen}
            variant="hero"
          />
          <StatsCard
            title="Teilnehmer"
            value={stats.totalParticipants}
            icon={Users}
          />
          <StatsCard
            title="Anmeldungen"
            value={stats.totalRegistrations}
            subtitle={`${stats.paidRegistrations} bezahlt`}
            icon={TrendingUp}
          />
          <StatsCard
            title="Umsatz"
            value={`${stats.totalRevenue.toLocaleString("de-DE")} €`}
            icon={Euro}
          />
        </div>

        {/* Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kurse</h2>
            <Badge variant="secondary">{courses.length} Kurse</Badge>
          </div>
          {courses.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Kurse vorhanden</p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setEditingCourse(null);
                    setCourseFormOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Ersten Kurs erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const instructorId = extractRecordId(course.fields.dozent);
                const roomId = extractRecordId(course.fields.raum);
                return (
                  <CourseCard
                    key={course.record_id}
                    course={course}
                    instructor={instructorId ? instructorMap.get(instructorId) : undefined}
                    room={roomId ? roomMap.get(roomId) : undefined}
                    enrollmentCount={enrollmentCounts.get(course.record_id) || 0}
                    onEdit={(c) => {
                      setEditingCourse(c);
                      setCourseFormOpen(true);
                    }}
                    onDelete={(id) => {
                      const c = courses.find(x => x.record_id === id);
                      setDeleteDialog({
                        open: true,
                        type: "course",
                        id,
                        name: c?.fields.titel || "Kurs",
                      });
                    }}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Tabs for other entities */}
        <Tabs defaultValue="dozenten" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="dozenten" className="gap-2">
              <GraduationCap className="size-4" />
              Dozenten
            </TabsTrigger>
            <TabsTrigger value="raeume" className="gap-2">
              <DoorOpen className="size-4" />
              Räume
            </TabsTrigger>
            <TabsTrigger value="teilnehmer" className="gap-2">
              <Users className="size-4" />
              Teilnehmer
            </TabsTrigger>
            <TabsTrigger value="anmeldungen" className="gap-2">
              <ClipboardList className="size-4" />
              Anmeldungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dozenten">
            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Dozenten</CardTitle>
                <Button size="sm" onClick={() => {
                  setEditingInstructor(null);
                  setInstructorFormOpen(true);
                }}>
                  <Plus className="size-4" />
                  Hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={instructors}
                  columns={instructorColumns}
                  getItemId={(i) => i.record_id}
                  onEdit={(i) => {
                    setEditingInstructor(i);
                    setInstructorFormOpen(true);
                  }}
                  onDelete={(id) => {
                    const inst = instructors.find(x => x.record_id === id);
                    setDeleteDialog({
                      open: true,
                      type: "instructor",
                      id,
                      name: inst ? `${inst.fields.dozent_firstname} ${inst.fields.dozent_lastname}` : "Dozent",
                    });
                  }}
                  emptyMessage="Keine Dozenten vorhanden"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raeume">
            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Räume</CardTitle>
                <Button size="sm" onClick={() => {
                  setEditingRoom(null);
                  setRoomFormOpen(true);
                }}>
                  <Plus className="size-4" />
                  Hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={rooms}
                  columns={roomColumns}
                  getItemId={(r) => r.record_id}
                  onEdit={(r) => {
                    setEditingRoom(r);
                    setRoomFormOpen(true);
                  }}
                  onDelete={(id) => {
                    const room = rooms.find(x => x.record_id === id);
                    setDeleteDialog({
                      open: true,
                      type: "room",
                      id,
                      name: room?.fields.raumname || "Raum",
                    });
                  }}
                  emptyMessage="Keine Räume vorhanden"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teilnehmer">
            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Teilnehmer</CardTitle>
                <Button size="sm" onClick={() => {
                  setEditingParticipant(null);
                  setParticipantFormOpen(true);
                }}>
                  <Plus className="size-4" />
                  Hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={participants}
                  columns={participantColumns}
                  getItemId={(p) => p.record_id}
                  onEdit={(p) => {
                    setEditingParticipant(p);
                    setParticipantFormOpen(true);
                  }}
                  onDelete={(id) => {
                    const p = participants.find(x => x.record_id === id);
                    setDeleteDialog({
                      open: true,
                      type: "participant",
                      id,
                      name: p ? `${p.fields.teilnehmer_firstname} ${p.fields.teilnehmer_lastname}` : "Teilnehmer",
                    });
                  }}
                  emptyMessage="Keine Teilnehmer vorhanden"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anmeldungen">
            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Anmeldungen</CardTitle>
                <Button size="sm" onClick={() => {
                  setEditingRegistration(null);
                  setRegistrationFormOpen(true);
                }}>
                  <Plus className="size-4" />
                  Hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={registrations}
                  columns={registrationColumns}
                  getItemId={(r) => r.record_id}
                  onEdit={(r) => {
                    setEditingRegistration(r);
                    setRegistrationFormOpen(true);
                  }}
                  onDelete={(id) => {
                    setDeleteDialog({
                      open: true,
                      type: "registration",
                      id,
                      name: "Anmeldung",
                    });
                  }}
                  emptyMessage="Keine Anmeldungen vorhanden"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Forms */}
      <CourseForm
        open={courseFormOpen}
        onOpenChange={setCourseFormOpen}
        course={editingCourse}
        instructors={instructors}
        rooms={rooms}
        onSubmit={handleCourseSubmit}
      />

      <RegistrationForm
        open={registrationFormOpen}
        onOpenChange={setRegistrationFormOpen}
        registration={editingRegistration}
        courses={courses}
        participants={participants}
        onSubmit={handleRegistrationSubmit}
      />

      <InstructorForm
        open={instructorFormOpen}
        onOpenChange={setInstructorFormOpen}
        instructor={editingInstructor}
        onSubmit={handleInstructorSubmit}
      />

      <RoomForm
        open={roomFormOpen}
        onOpenChange={setRoomFormOpen}
        room={editingRoom}
        onSubmit={handleRoomSubmit}
      />

      <ParticipantForm
        open={participantFormOpen}
        onOpenChange={setParticipantFormOpen}
        participant={editingParticipant}
        onSubmit={handleParticipantSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Löschen bestätigen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie "{deleteDialog?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
