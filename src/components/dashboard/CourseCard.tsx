import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Users, Euro, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format, parseISO, isPast, isFuture } from "date-fns";
import { de } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Kurse, Dozenten, Raeume } from "@/types/app";

interface CourseCardProps {
  course: Kurse;
  instructor?: Dozenten;
  room?: Raeume;
  enrollmentCount: number;
  onEdit: (course: Kurse) => void;
  onDelete: (courseId: string) => void;
}

export function CourseCard({ course, instructor, room, enrollmentCount, onEdit, onDelete }: CourseCardProps) {
  const { fields } = course;
  const maxParticipants = fields.max_teilnehmer || 20;
  const fillPercentage = Math.min((enrollmentCount / maxParticipants) * 100, 100);

  const startDate = fields.startdatum ? parseISO(fields.startdatum) : null;
  const endDate = fields.enddatum ? parseISO(fields.enddatum) : null;

  const getStatus = () => {
    if (!startDate) return "draft";
    if (isPast(endDate || startDate)) return "completed";
    if (isFuture(startDate)) return "upcoming";
    return "active";
  };

  const status = getStatus();

  const statusConfig = {
    draft: { label: "Entwurf", variant: "muted" as const },
    upcoming: { label: "Geplant", variant: "secondary" as const },
    active: { label: "Aktiv", variant: "accent" as const },
    completed: { label: "Beendet", variant: "outline" as const },
  };

  const statusInfo = statusConfig[status];

  return (
    <Card className="shadow-card card-hover overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight truncate">
                {fields.titel || "Unbenannter Kurs"}
              </h3>
              {fields.beschreibung && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {fields.beschreibung}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(course)}>
                    <Pencil className="size-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(course.record_id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {instructor && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-4 shrink-0" />
                <span className="truncate">
                  {instructor.fields.dozent_firstname} {instructor.fields.dozent_lastname}
                </span>
              </div>
            )}
            {room && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate">
                  {room.fields.raumname}
                  {room.fields.gebaeude && ` (${room.fields.gebaeude})`}
                </span>
              </div>
            )}
            {startDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>
                  {format(startDate, "d. MMM", { locale: de })}
                  {endDate && ` - ${format(endDate, "d. MMM yyyy", { locale: de })}`}
                </span>
              </div>
            )}
            {fields.preis !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Euro className="size-4 shrink-0" />
                <span>{fields.preis.toLocaleString("de-DE")} €</span>
              </div>
            )}
          </div>

          {/* Enrollment progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span>Anmeldungen</span>
              </div>
              <span className="font-medium">
                {enrollmentCount} / {maxParticipants}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full progress-fill rounded-full"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
